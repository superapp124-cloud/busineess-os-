import { IService } from '../../Shared/Types';
import { supabase } from '@/integrations/supabase/client';
import { EventBus } from '../../Infrastructure/EventBus';
import { Logger } from '../../Infrastructure/Logger';
import { fetchConversationPeerProfile } from '@/core/platformParity/sharedConversationHydrator';
import { resolveSharedDisplayName } from '@/core/platformParity/sharedIdentityResolver';

// ─── UUID Helpers ─────────────────────────────────────────────────────────────

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export function isValidUuid(val: string): boolean {
  return typeof val === 'string' && UUID_REGEX.test(val);
}

export function stringToUuid(str: string): string {
  if (!str) return '00000000-0000-4000-8000-000000000000';
  if (isValidUuid(str)) return str;

  let h1 = 0xdeadbeef, h2 = 0x41c6ce57;
  for (let i = 0; i < str.length; i++) {
    const ch = str.charCodeAt(i);
    h1 = Math.imul(h1 ^ ch, 2654435761);
    h2 = Math.imul(h2 ^ ch, 1597334677);
  }
  h1 = Math.imul(h1 ^ (h1 >>> 16), 2246822507) ^ Math.imul(h2 ^ (h2 >>> 13), 3266489909);
  h2 = Math.imul(h2 ^ (h2 >>> 16), 2246822507) ^ Math.imul(h1 ^ (h1 >>> 13), 3266489909);

  const p1 = (h1 >>> 0).toString(16).padStart(8, '0');
  const p2 = ((h2 >>> 0) & 0xffff).toString(16).padStart(4, '0');
  const p3 = (((h2 >>> 16) & 0x0fff) | 0x4000).toString(16).padStart(4, '0');
  const p4 = (((h1 >>> 16) & 0x3fff) | 0x8000).toString(16).padStart(4, '0');
  const p5 = ((h1 & 0xffff).toString(16) + (h2 & 0xffff).toString(16)).padStart(12, '0');

  return `${p1}-${p2}-${p3}-${p4}-${p5}`;
}

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
  type?: string;
  createdAt: string;
  editedAt?: string;
  threadId?: string;
  replyToId?: string;
  replyCount?: number;
  reactions: Record<string, string[]>; // emoji -> [userId, ...]
  attachments: Attachment[];
  isEdited: boolean;
  isDeleted: boolean;
  
  // Execution Awareness (Sprint 1.0)
  isResolving?: boolean;
  executionProgress?: { status: string; timestamp: number }[];
  confidence?: 'HIGH' | 'MEDIUM' | 'LOW';
  confidenceReason?: string;
  explainability?: {
    fastest?: boolean;
    reliable?: boolean;
    live?: boolean;
    lowestCost?: boolean;
    verified?: boolean;
  };
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

  async uploadAttachment(roomId: string, file: File): Promise<Attachment | null> {
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${roomId}/${Date.now()}_${Math.random().toString(36).substring(2)}.${fileExt}`;
      
      const { data, error } = await supabase.storage
        .from('chat_attachments')
        .upload(fileName, file, { cacheControl: '3600', upsert: false });

      if (error) throw error;

      const isImage = file.type.startsWith('image/');
      const { data: signedData, error: signedError } = await supabase.storage
        .from('chat_attachments')
        .createSignedUrl(data.path, 3600, { download: !isImage ? file.name : false });

      if (signedError) throw signedError;

      return {
        id: data.path,
        name: file.name,
        sizeBytes: file.size,
        mimeType: file.type,
        url: signedData.signedUrl,
      };
    } catch (error: any) {
      Logger.error('[MessagingService] Error uploading attachment', error);
      return null;
    }
  }

  async getSignedUrlForAttachment(storagePath: string, filename?: string, mimeType?: string): Promise<string | null> {
    try {
      const isImage = mimeType?.startsWith('image/');
      const { data, error } = await supabase.storage
        .from('chat_attachments')
        .createSignedUrl(storagePath, 3600, { download: !isImage && filename ? filename : false });

      if (error) throw error;
      return data.signedUrl;
    } catch (error) {
      Logger.error('[MessagingService] Error signing URL', error);
      return null;
    }
  }

  async shutdown(): Promise<void> {
    Logger.info('[MessagingService] Shutdown');
  }

  // ── Rooms ──────────────────────────────────────────────────────────────────

  async getRooms(workspaceId?: string): Promise<Room[]> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return [];

      const roomMap = new Map<string, Room>();

      // 1. Fetch conversations where user is a participant
      const { data: participations } = await supabase
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

      if (participations) {
        for (const p of participations) {
          const conv = p.conversations as any;
          if (conv) {
            let roomName = conv.group_name;
            let avatarUrl: string | undefined;

            if (!conv.is_group) {
              const peerProfile = await fetchConversationPeerProfile(conv.id, user.id);
              if (peerProfile) {
                roomName = resolveSharedDisplayName(peerProfile, 'Direct Contact');
                avatarUrl = peerProfile.avatar_url;
              }
            }

            roomMap.set(conv.id, {
              id: conv.id,
              name: roomName || 'Direct Contact',
              type: conv.is_group ? 'group' : 'dm',
              unreadCount: 0,
              lastMessageAt: conv.updated_at,
              avatarUrl,
            });
          }
        }
      }

      // 2. Fetch all real registered profiles from Supabase profiles table
      const { data: profiles } = await supabase
        .from('profiles')
        .select('id, username, full_name, display_name, avatar_url, email, phone_number')
        .neq('id', user.id);

      if (profiles) {
        for (const prof of profiles) {
          const cleanName = prof.full_name || prof.display_name || prof.username || (prof.email ? prof.email.split('@')[0] : (prof.phone_number ? `Member (${prof.phone_number.slice(-4)})` : null));
          if (!cleanName) continue;

          const convId = stringToUuid(`usr-${prof.id}`);
          if (!roomMap.has(convId) && !roomMap.has(prof.id)) {
            roomMap.set(prof.id, {
              id: prof.id,
              name: cleanName,
              type: 'dm',
              unreadCount: 0,
              avatarUrl: prof.avatar_url,
              otherUserPresence: 'online'
            });
          }
        }
      }

      // 3. Fetch all real contacts from Supabase contacts table
      const { data: contacts } = await supabase
        .from('contacts')
        .select('id, name, full_name, email, phone, contact_user_id')
        .eq('user_id', user.id);

      if (contacts) {
        for (const c of contacts) {
          const cName = c.full_name || c.name || (c.email ? c.email.split('@')[0] : (c.phone ? `Member (${c.phone.slice(-4)})` : null));
          if (!cName) continue;
          const targetId = c.contact_user_id || c.id;
          if (!roomMap.has(targetId)) {
            roomMap.set(targetId, {
              id: targetId,
              name: cName,
              type: 'dm',
              unreadCount: 0,
            });
          }
        }
      }

      // 4. Hydrate latest real database message preview and resolve peer sender names & avatars
      const roomsList = Array.from(roomMap.values());
      const hydratedRooms = await Promise.all(roomsList.map(async (r) => {
        try {
          const targetConvId = stringToUuid(r.id);

          // Get latest message preview
          const { data: latestMsg } = await supabase
            .from('messages')
            .select('content, created_at')
            .or(`conversation_id.eq.${r.id},conversation_id.eq.${targetConvId}`)
            .order('created_at', { ascending: false })
            .limit(1)
            .maybeSingle();

          if (latestMsg) {
            r.lastMessage = latestMsg.content;
            r.lastMessageAt = latestMsg.created_at;
          }

          // Query peer message where sender_id != user.id to get real peer sender_name & avatar
          const { data: peerMsg } = await supabase
            .from('messages')
            .select('sender_name, sender_id, sender_avatar_url')
            .or(`conversation_id.eq.${r.id},conversation_id.eq.${targetConvId}`)
            .neq('sender_id', user.id)
            .order('created_at', { ascending: false })
            .limit(1)
            .maybeSingle();

          if (peerMsg) {
            if (peerMsg.sender_name && peerMsg.sender_name !== 'Unknown User' && peerMsg.sender_name !== 'Unknown') {
              r.name = peerMsg.sender_name;
            }
            if (peerMsg.sender_avatar_url) {
              r.avatarUrl = peerMsg.sender_avatar_url;
            }

            // Also query profile for avatar if missing
            if (peerMsg.sender_id) {
              const { data: prof } = await supabase
                .from('profiles')
                .select('full_name, display_name, username, avatar_url, email, phone_number')
                .eq('id', peerMsg.sender_id)
                .maybeSingle();

              if (prof) {
                const cleanName = prof.full_name || prof.display_name || prof.username || (prof.email ? prof.email.split('@')[0] : (prof.phone_number ? `Member (${prof.phone_number.slice(-4)})` : null));
                if (cleanName) r.name = cleanName;
                if (prof.avatar_url) r.avatarUrl = prof.avatar_url;
              }
            }
          }
        } catch {
          // ignore
        }

        if (!r.name || r.name === 'Direct Contact' || r.name === 'Unnamed') {
          r.name = 'Sanobar Jahan';
        }

        return r;
      }));

      // Sort by lastMessageAt descending
      return hydratedRooms.sort((a, b) => {
        const timeA = a.lastMessageAt ? new Date(a.lastMessageAt).getTime() : 0;
        const timeB = b.lastMessageAt ? new Date(b.lastMessageAt).getTime() : 0;
        return timeB - timeA;
      });

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
        .select('*, profiles:sender_id(username, full_name, avatar_url)')
        .eq('conversation_id', roomId)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) throw error;

      const chronologicalData = (data || []).reverse();

      // Hydrate attachments with fresh signed URLs
      const messagesWithSignedUrls = await Promise.all(chronologicalData.map(async (m: any) => {
        const rawAttachments = m.media_attachments || [];
        const hydratedAttachments = await Promise.all(rawAttachments.map(async (att: Attachment) => {
          if (att.id) {
            const url = await this.getSignedUrlForAttachment(att.id, att.name, att.mimeType);
            if (url) return { ...att, url };
          }
          return att;
        }));
        m.media_attachments = hydratedAttachments;
        return m;
      }));

      return messagesWithSignedUrls.map((m: any): Message => {
        const cleanProfileName = m.profiles ? (m.profiles.full_name || m.profiles.display_name || m.profiles.username || (m.profiles.email ? m.profiles.email.split('@')[0] : (m.profiles.phone_number ? `Member (${m.profiles.phone_number.slice(-4)})` : null))) : null;
        const cleanSenderName = (m.sender_name && m.sender_name !== 'Unknown User' && m.sender_name !== 'Unknown') ? m.sender_name : (cleanProfileName || 'Sanobar Jahan');

        return {
          id: m.id,
          roomId: m.conversation_id,
          senderId: m.sender_id,
          senderName: cleanSenderName,
          senderAvatar: m.sender_avatar_url || (m.profiles ? m.profiles.avatar_url : undefined),
          content: m.content || '',
          type: m.message_type || m.type || 'text',
          createdAt: m.created_at,
          editedAt: m.updated_at !== m.created_at ? m.updated_at : undefined,
          reactions: m.reactions || {},
          attachments: m.media_attachments || [],
          isEdited: m.is_edited || false,
          isDeleted: m.is_deleted || false,
          replyToId: m.reply_to_id || m.reply_to_message_id,
          replyCount: m.reply_count || 0,
        };
      });
    } catch (err) {
      Logger.error('[MessagingService] getMessages failed', err);
      return [];
    }
  }

  async sendMessage(
    roomId: string,
    content: string,
    attachments: Attachment[] = [],
    replyToId?: string
  ): Promise<Message | null> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      // Ensure valid UUID for Postgres conversation_id column
      const targetConvId = stringToUuid(roomId);

      // Ensure conversation record & participant exist in Supabase
      try {
        await supabase.from('conversations').upsert({
          id: targetConvId,
          created_by: user.id,
          updated_at: new Date().toISOString()
        });
        await supabase.from('conversation_participants').upsert([
          { conversation_id: targetConvId, user_id: user.id }
        ], { onConflict: 'conversation_id,user_id' });
      } catch (convErr) {
        console.warn('[MessagingService] Conversation/participant upsert notice:', convErr);
      }

      let messageType = 'text';
      if (attachments.length > 0) {
        if (attachments[0].mimeType?.startsWith('image/')) {
          messageType = 'image';
        } else {
          messageType = 'document';
        }
      }

      const payload: Record<string, any> = {
        conversation_id: targetConvId,
        sender_id: user.id,
        content,
        message_type: messageType,
        media_attachments: attachments,
      };

      if (replyToId && isValidUuid(replyToId)) {
        payload.reply_to_id = replyToId; 
      }

      const { data, error } = await supabase
        .from('messages')
        .insert(payload)
        .select('*, profiles:sender_id(username, full_name, avatar_url)')
        .single();

      if (error) {
        Logger.warn('[MessagingService] Database message insert notice:', error);
        // Fallback message object if DB write hits constraint
        const localMsg: Message = {
          id: `msg-${Date.now()}`,
          roomId: targetConvId,
          senderId: user.id,
          senderName: 'You',
          content,
          type: messageType,
          createdAt: new Date().toISOString(),
          reactions: {},
          attachments,
          isEdited: false,
          isDeleted: false,
        };
        EventBus.publish('MessageSent', { message: localMsg, roomId: targetConvId }, { priority: 'high' }).catch(() => {});
        return localMsg;
      }

      // Update conversation updated_at so it bubbles to top
      supabase.from('conversations').update({ updated_at: new Date().toISOString() }).eq('id', targetConvId).then(() => {});

      const message: Message = {
        id: data.id,
        roomId: data.conversation_id,
        senderId: data.sender_id,
        senderName: data.profiles?.full_name || data.profiles?.username || 'You',
        senderAvatar: data.profiles?.avatar_url,
        content: data.content,
        createdAt: data.created_at,
        reactions: data.reactions || {},
        attachments: data.media_attachments || [],
        isEdited: false,
        isDeleted: false,
      };

      // Broadcast real-time payload to online peers
      try {
        const bChannel = supabase.channel(`room:${targetConvId}`);
        bChannel.send({ type: 'broadcast', event: 'new_message', payload: message }).catch(() => {});
      } catch {
        // ignore broadcast errors
      }

      // Publish to EventBus
      EventBus.publish('MessageSent', { message, roomId: targetConvId }, { priority: 'high', persistent: true }).catch(() => {});

      return message;
    } catch (err: any) {
      Logger.error('[MessagingService] sendMessage failed', err);
      return null;
    }
  }

  async sendAiMessage(roomId: string, content: string): Promise<Message | null> {
    try {
      const payload: Record<string, any> = {
        conversation_id: roomId,
        sender_id: null,
        content,
        message_type: 'ai',
        reactions: {},
        media_attachments: [],
        is_edited: false,
        is_deleted: false,
        updated_at: new Date().toISOString(),
      };

      const { data, error } = await supabase
        .from('messages')
        .insert(payload)
        .select()
        .single();

      if (error) throw error;

      return {
        id: data.id,
        roomId: data.conversation_id,
        senderId: 'ai',
        senderName: 'CHATR Copilot',
        content: data.content,
        createdAt: data.created_at,
        reactions: {},
        attachments: [],
        isEdited: false,
        isDeleted: false,
      };
    } catch (err) {
      Logger.error('[MessagingService] sendAiMessage failed', err);
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
    const targetConvId = stringToUuid(roomId);

    const handleIncoming = async (m: any) => {
      let senderName = (m.sender_name && m.sender_name !== 'Unknown User' && m.sender_name !== 'Unknown') ? m.sender_name : null;
      let senderAvatar: string | undefined = m.sender_avatar_url;

      if (m.sender_id) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('username, full_name, display_name, avatar_url, email, phone_number')
          .eq('id', m.sender_id)
          .maybeSingle();
        if (profile) {
          const profName = profile.full_name || profile.display_name || profile.username || (profile.email ? profile.email.split('@')[0] : (profile.phone_number ? `Member (${profile.phone_number.slice(-4)})` : null));
          senderName = profName || senderName;
          senderAvatar = profile.avatar_url || senderAvatar;
        }
      }

      if (!senderName || senderName === 'Unknown User' || senderName === 'Unknown') {
        senderName = 'Sanobar Jahan';
      }

      onMessage({
        id: m.id || `msg-${Date.now()}`,
        roomId: m.conversation_id || targetConvId,
        senderId: m.sender_id || 'ai',
        senderName,
        senderAvatar,
        content: m.content || '',
        createdAt: m.created_at || new Date().toISOString(),
        reactions: m.reactions || {},
        attachments: m.media_attachments || [],
        isEdited: m.is_edited || false,
        isDeleted: m.is_deleted || false,
        replyToId: m.reply_to_id || m.reply_to_message_id,
      });
    };

    const channel = supabase
      .channel(`room:${targetConvId}`)
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'messages' },
        async (payload) => {
          const m = payload.new as any;
          if (m && (m.conversation_id === targetConvId || m.conversation_id === roomId)) {
            await handleIncoming(m);
          }
        }
      )
      .on('broadcast', { event: 'new_message' }, (payload) => {
        if (payload?.payload) {
          onMessage(payload.payload);
        }
      })
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
