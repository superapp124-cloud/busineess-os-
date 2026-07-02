import { IService } from '../../Shared/Types';
import { supabase } from '@/integrations/supabase/client';
import { EventBus } from '../../Infrastructure/EventBus';
import { Logger } from '../../Infrastructure/Logger';
import { fetchConversationPeerProfile } from '@/core/platformParity/sharedConversationHydrator';
import { resolveSharedDisplayName } from '@/core/platformParity/sharedIdentityResolver';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface Room {
  id: string;
  name: string;
  type: 'channel' | 'dm' | 'group';
  lastMessage?: string;
  lastMessageAt?: string;
  unreadCount: number;
  memberCount?: number;
  topic?: string;
  isPrivate?: boolean;
  isMuted?: boolean;
  avatarUrl?: string;
  otherUserPresence?: 'online' | 'away' | 'busy' | 'offline';
}

export interface Message {
  id: string;
  roomId: string;
  senderId: string;
  senderName?: string;
  senderAvatar?: string;
  content: string;
  createdAt: string;
  editedAt?: string;
  threadId?: string;
  replyCount?: number;
  reactions: Record<string, string[]>; // emoji -> [userId, ...]
  attachments: Attachment[];
  isEdited: boolean;
  isDeleted: boolean;
}

export interface Attachment {
  id: string;
  name: string;
  url: string;
  mimeType: string;
  sizeBytes: number;
}

// ─── Service ──────────────────────────────────────────────────────────────────

class MessagingServiceClass implements IService {
  name = 'MessagingService';
  dependencies = [];

  async initialize(): Promise<void> {
    Logger.info('[MessagingService] Initialized');
  }

  async shutdown(): Promise<void> {
    Logger.info('[MessagingService] Shutdown');
  }

  // ── Rooms ──────────────────────────────────────────────────────────────────

  async getRooms(workspaceId?: string): Promise<Room[]> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return [];

      // Fetch conversations where the user is a participant
      const { data: participations, error } = await supabase
        .from('conversation_participants')
        .select(`
          conversation_id,
          conversations!inner (
            id,
            is_group,
            group_name,
            updated_at
          )
        `)
        .eq('user_id', user.id);

      if (error) {
        Logger.warn('[MessagingService] getRooms error, returning empty', error);
        return [];
      }

      const baseRooms: Room[] = (participations || [])
        .map((p: any): Room => {
          const conv = p.conversations;
          return {
            id: conv.id,
            name: conv.group_name || 'Unnamed',
            type: conv.is_group ? 'group' : 'dm',
            unreadCount: 0,
            lastMessageAt: conv.updated_at,
          };
        })
        .sort((a, b) => {
          // Sort by lastMessageAt descending
          const timeA = a.lastMessageAt ? new Date(a.lastMessageAt).getTime() : 0;
          const timeB = b.lastMessageAt ? new Date(b.lastMessageAt).getTime() : 0;
          return timeB - timeA;
        });

      const hydratedRooms = await Promise.all(
        baseRooms.map(async (room) => {
          if (room.type === 'dm' && room.name === 'Unnamed') {
            const profile = await fetchConversationPeerProfile(room.id, user.id);
            if (profile) {
              room.name = resolveSharedDisplayName(profile, 'Unnamed');
              room.avatarUrl = profile.avatar_url;
            }
          }
          return room;
        })
      );

      return hydratedRooms;
    } catch (err) {
      Logger.error('[MessagingService] getRooms failed', err);
      return [];
    }
  }

  // ── Messages ───────────────────────────────────────────────────────────────

  async getMessages(roomId: string, limit = 50): Promise<Message[]> {
    try {
      const { data, error } = await supabase
        .from('messages')
        .select(`
          *,
          profiles:sender_id (
            username,
            full_name,
            avatar_url
          )
        `)
        .eq('conversation_id', roomId)
        .order('created_at', { ascending: true })
        .limit(limit);

      if (error) {
        Logger.warn('[MessagingService] getMessages error', error);
        return [];
      }

      return (data || []).map((m: any): Message => ({
        id: m.id,
        roomId: m.conversation_id,
        senderId: m.sender_id,
        senderName: m.sender_name || (m.profiles ? (m.profiles.full_name || m.profiles.username) : 'Unknown User'),
        senderAvatar: m.sender_avatar_url || (m.profiles ? m.profiles.avatar_url : undefined),
        content: m.content || '',
        createdAt: m.created_at,
        editedAt: m.updated_at !== m.created_at ? m.updated_at : undefined,
        reactions: m.reactions || {},
        attachments: m.attachments || [],
        isEdited: m.is_edited || false,
        isDeleted: m.is_deleted || false,
        replyCount: m.reply_count || 0,
      }));
    } catch (err) {
      Logger.error('[MessagingService] getMessages failed', err);
      return [];
    }
  }

  async sendMessage(
    roomId: string,
    content: string,
    attachmentUrls: string[] = []
  ): Promise<Message | null> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from('messages')
        .insert({
          conversation_id: roomId,
          sender_id: user.id,
          content,
          attachments: attachmentUrls.map(url => ({ url })),
        })
        .select()
        .single();

      if (error) throw error;

      const message: Message = {
        id: data.id,
        roomId: data.conversation_id,
        senderId: data.sender_id,
        content: data.content,
        createdAt: data.created_at,
        reactions: {},
        attachments: [],
        isEdited: false,
        isDeleted: false,
      };

      // Publish to EventBus — KnowledgeManager and NotificationService will react
      await EventBus.publish(
        'MessageSent',
        { message, roomId },
        { priority: 'high', persistent: true }
      );

      return message;
    } catch (err) {
      Logger.error('[MessagingService] sendMessage failed', err);
      return null;
    }
  }

  async editMessage(messageId: string, content: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('messages')
        .update({ content, is_edited: true, updated_at: new Date().toISOString() })
        .eq('id', messageId);
      if (error) throw error;
      await EventBus.publish('MessageEdited', { messageId, content }, { priority: 'normal' });
    } catch (err) {
      Logger.error('[MessagingService] editMessage failed', err);
    }
  }

  async deleteMessage(messageId: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('messages')
        .update({ is_deleted: true, content: '' })
        .eq('id', messageId);
      if (error) throw error;
      await EventBus.publish('MessageDeleted', { messageId }, { priority: 'normal' });
    } catch (err) {
      Logger.error('[MessagingService] deleteMessage failed', err);
    }
  }

  async addReaction(messageId: string, emoji: string, userId: string): Promise<void> {
    try {
      // Read current reactions, toggle emoji for userId, write back
      const { data, error: readErr } = await supabase
        .from('messages')
        .select('reactions')
        .eq('id', messageId)
        .single();
      if (readErr) throw readErr;

      const reactions: Record<string, string[]> = data?.reactions || {};
      const users = reactions[emoji] || [];
      if (users.includes(userId)) {
        reactions[emoji] = users.filter((u: string) => u !== userId);
        if (reactions[emoji].length === 0) delete reactions[emoji];
      } else {
        reactions[emoji] = [...users, userId];
      }

      const { error: writeErr } = await supabase
        .from('messages')
        .update({ reactions })
        .eq('id', messageId);
      if (writeErr) throw writeErr;
    } catch (err) {
      Logger.error('[MessagingService] addReaction failed', err);
    }
  }

  // ── Real-time ──────────────────────────────────────────────────────────────

  subscribeToRoom(
    roomId: string,
    onMessage: (msg: Message) => void
  ): () => void {
    const channel = supabase
      .channel(`room:${roomId}`)
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'messages', filter: `conversation_id=eq.${roomId}` },
        (payload) => {
          const m = payload.new as any;
          onMessage({
            id: m.id,
            roomId: m.conversation_id,
            senderId: m.sender_id,
            senderName: m.sender_name,
            senderAvatar: m.sender_avatar_url,
            content: m.content,
            createdAt: m.created_at,
            reactions: m.reactions || {},
            attachments: m.attachments || [],
            isEdited: m.is_edited || false,
            isDeleted: m.is_deleted || false,
          });
        }
      )
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }

  broadcastTyping(roomId: string, userId: string): void {
    supabase
      .channel(`typing:${roomId}`)
      .send({ type: 'broadcast', event: 'typing', payload: { userId, roomId } })
      .catch((err) => Logger.warn('[MessagingService] broadcastTyping failed', err));
  }
}

export const MessagingService = new MessagingServiceClass();
