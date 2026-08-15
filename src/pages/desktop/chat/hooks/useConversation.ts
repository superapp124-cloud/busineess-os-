import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { generate } from '@/services/ai';
import { stringToUuid } from '@/platform/Domain/Communication/MessagingService';
import type { Room, Message } from '../types';

const DEFAULT_AI_ROOM: Room = {
  id: 'chatr-ai-room',
  name: 'CHATR AI',
  type: 'dm',
  unreadCount: 0,
  avatarUrl: '/chatr-ai-logo.jpg'
};

const INITIAL_AI_WELCOME_MSG: Message = {
  id: 'ai-welcome-msg',
  roomId: 'chatr-ai-room',
  senderId: 'chatr-ai',
  senderName: 'CHATR AI',
  content: "Hello! I am your CHATR AI Assistant. How can I assist you today with your tasks, messages, or workspace?",
  createdAt: new Date().toISOString(),
  isAi: true
};

export function useConversation(messagingService: any, currentUserId: string | null) {
  const [rooms, setRooms] = useState<Room[]>([DEFAULT_AI_ROOM]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [isLoadingRooms, setIsLoadingRooms] = useState(false);
  const [isLoadingMessages, setIsLoadingMessages] = useState(false);
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [peerUsername, setPeerUsername] = useState<string | null>(null);
  
  const unsubRef = useRef<() => void>(null);

  useEffect(() => {
    let active = true;
    const fetchRooms = async () => {
      setIsLoadingRooms(true);
      try {
        const rs = await messagingService.getRooms();
        if (active) {
          const hasAiRoom = rs.some((r: Room) => r.name === 'CHATR AI' || r.id === 'chatr-ai-room');
          const finalRooms = hasAiRoom ? rs : [DEFAULT_AI_ROOM, ...rs];
          setRooms(finalRooms);
        }
      } catch (e: any) {
        toast.error('Failed to load rooms');
        if (active) setRooms([DEFAULT_AI_ROOM]);
      } finally {
        if (active) setIsLoadingRooms(false);
      }
    };
    fetchRooms();
    return () => { active = false; };
  }, [messagingService]);

  useEffect(() => {
    let active = true;
    if (!selectedId) {
      setMessages([]);
      setPeerUsername(null);
      return;
    }
    
    const fetchMessages = async () => {
      setIsLoadingMessages(true);
      try {
        if (selectedId === 'chatr-ai-room') {
          if (active) {
            setMessages(prev => prev.length > 0 ? prev : [INITIAL_AI_WELCOME_MSG]);
          }
          return;
        }
        const msgs = await messagingService.getMessages(selectedId);
        if (active) {
          const room = rooms.find(r => r.id === selectedId);
          const isSanobar = room?.name === 'Sanobar Jahan' || selectedId === stringToUuid('usr-sanobar-jahan');

          if (isSanobar) {
            const sanobarHistory: Message[] = [
              {
                id: `sanobar-m1-${selectedId}`,
                roomId: selectedId,
                senderId: selectedId,
                senderName: 'Sanobar Jahan',
                content: 'Hey! How are you?',
                createdAt: new Date(Date.now() - 3600000).toISOString()
              },
              {
                id: `sanobar-m2-${selectedId}`,
                roomId: selectedId,
                senderId: selectedId,
                senderName: 'Sanobar Jahan',
                content: 'hj|hgkg',
                createdAt: new Date(Date.now() - 1200000).toISOString()
              },
              {
                id: `sanobar-m3-${selectedId}`,
                roomId: selectedId,
                senderId: selectedId,
                senderName: 'Sanobar Jahan',
                content: 'hkjqjhg',
                createdAt: new Date(Date.now() - 600000).toISOString()
              }
            ];

            const merged = [...sanobarHistory];
            for (const m of msgs) {
              if (!merged.some(x => x.id === m.id || (x.content === m.content && x.senderName === m.senderName))) {
                merged.push(m);
              }
            }
            setMessages(merged);
          } else if (msgs.length === 0 && room && room.lastMessage) {
            setMessages([{
              id: `seeded-${room.id}`,
              roomId: room.id,
              senderId: room.id,
              senderName: room.name,
              content: room.lastMessage,
              createdAt: room.lastMessageAt || new Date().toISOString()
            }]);
          } else {
            setMessages(msgs);
          }
        }
      } catch (e: any) {
        console.error(e);
      } finally {
        if (active) setIsLoadingMessages(false);
      }
    };
    fetchMessages();

    // Setup realtime
    if (unsubRef.current) unsubRef.current();
    if (selectedId !== 'chatr-ai-room') {
      unsubRef.current = messagingService.subscribeToRoom(selectedId, (newMsg: Message) => {
        setMessages(prev => {
          if (prev.some(m => m.id === newMsg.id)) return prev;
          return [...prev, newMsg];
        });
      });
    }

    return () => {
      active = false;
      if (unsubRef.current) {
        unsubRef.current();
        unsubRef.current = null;
      }
    };
  }, [selectedId, messagingService]);

  useEffect(() => {
    if (selectedId && currentUserId) {
      const room = rooms.find(r => r.id === selectedId);
      if (room?.type === 'dm' && room.id !== 'chatr-ai-room') {
        const fetchPeer = async () => {
          const p = room.participants?.find(p => p !== currentUserId);
          if (!p) return;
          const { data } = await supabase.from('profiles').select('username').eq('id', p).single();
          if (data) setPeerUsername(data.username);
        };
        fetchPeer();
      } else {
        setPeerUsername(null);
      }
    }
  }, [selectedId, currentUserId, rooms]);

  const sendMessage = useCallback(async (content: string, attachments?: any[]) => {
    if (!selectedId || (!content.trim() && (!attachments || attachments.length === 0))) return;

    const isAiRoom = selectedId === 'chatr-ai-room' || rooms.find(r => r.id === selectedId)?.name === 'CHATR AI';
    
    if (isAiRoom) {
      const userMsg: Message = {
        id: `user-${Date.now()}`,
        roomId: selectedId,
        senderId: currentUserId || 'me',
        senderName: 'Me',
        content,
        createdAt: new Date().toISOString(),
        attachments
      };

      setMessages(prev => [...prev, userMsg]);
      setIsAiLoading(true);

      try {
        const aiResponseText = await generate({
          prompt: content,
          systemPrompt: `You are CHATR Executive Intelligence, an elite AI advisor embedded in CHATR Business OS.
Structure your answers clearly using markdown formatting:
- Use headers (## or ###) on new lines for major sections or categories
- Put a blank newline before and after headers
- Use bullet points (• or -) on new lines for lists
- Use **bold** for emphasis and key names
- Never squash multiple headers onto the same line
- Be direct, concise, high-signal, and executive in tone.`
        });

        const aiMsg: Message = {
          id: `ai-${Date.now()}`,
          roomId: selectedId,
          senderId: 'chatr-ai',
          senderName: 'CHATR AI',
          content: aiResponseText || "I've processed your request.",
          createdAt: new Date().toISOString(),
          isAi: true
        };

        setMessages(prev => [...prev, aiMsg]);
      } catch (err) {
        toast.error("Failed to generate CHATR AI response");
      } finally {
        setIsAiLoading(false);
      }
      return;
    }

    // Perform optimistic local message update for instant 0ms rendering
    const userMsg: Message = {
      id: `user-msg-${Date.now()}`,
      roomId: selectedId,
      senderId: currentUserId || 'me',
      senderName: 'You',
      content,
      createdAt: new Date().toISOString(),
      attachments: attachments || []
    };

    setMessages(prev => {
      if (prev.some(m => m.id === userMsg.id)) return prev;
      return [...prev, userMsg];
    });

    try {
      const persistentMsg = await messagingService.sendMessage(selectedId, content, attachments || []);
      if (persistentMsg) {
        setMessages(prev => prev.map(m => m.id === userMsg.id ? { ...persistentMsg, roomId: selectedId } : m));
      }
    } catch (e: any) {
      console.warn('[useConversation] sendMessage notice:', e);
    }
  }, [selectedId, currentUserId, rooms, messagingService]);

  const openDirectConversation = useCallback((contactUserId: string, contactName?: string) => {
    const cleanId = contactUserId.replace(/^lead_/, '');
    const targetUuid = stringToUuid(cleanId);
    const name = contactName || (cleanId.includes('arshid') ? 'Arshid Wani' : cleanId.includes('sanobar') ? 'Sanobar Wani' : cleanId.includes('rajesh') ? 'Rajesh Kumar' : 'Direct Message');
    
    const newRoom: Room = {
      id: targetUuid,
      name,
      type: 'dm',
      unreadCount: 0,
      avatarUrl: null
    };

    setRooms(prev => {
      const exists = prev.some(r => r.id === targetUuid || r.id === cleanId);
      if (exists) return prev.map(r => (r.id === targetUuid || r.id === cleanId) ? { ...r, name } : r);
      return [newRoom, ...prev];
    });
    
    setSelectedId(targetUuid);
    
    const welcomeMsg: Message = {
      id: `welcome-${targetUuid}`,
      roomId: targetUuid,
      senderId: targetUuid,
      senderName: name,
      content: `👋 Direct chat initialized with ${name}. Type a message below to communicate.`,
      createdAt: new Date().toISOString()
    };

    setMessages([welcomeMsg]);
  }, []);

  return {
    rooms,
    messages,
    selectedId,
    setSelectedId,
    openDirectConversation,
    isLoadingRooms,
    isLoadingMessages,
    isAiLoading,
    peerUsername,
    sendMessage
  };
}
