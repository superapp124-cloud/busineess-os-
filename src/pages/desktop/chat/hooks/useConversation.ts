import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import type { Room, Message } from '../types';

export function useConversation(messagingService: any, currentUserId: string | null) {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [isLoadingRooms, setIsLoadingRooms] = useState(false);
  const [isLoadingMessages, setIsLoadingMessages] = useState(false);
  const [peerUsername, setPeerUsername] = useState<string | null>(null);
  
  const unsubRef = useRef<() => void>(null);

  useEffect(() => {
    let active = true;
    const fetchRooms = async () => {
      setIsLoadingRooms(true);
      try {
        const rs = await messagingService.getRooms();
        if (active) setRooms(rs);
      } catch (e: any) {
        toast.error('Failed to load rooms');
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
        const msgs = await messagingService.getMessages(selectedId);
        if (active) setMessages(msgs);
      } catch (e: any) {
        console.error(e);
      } finally {
        if (active) setIsLoadingMessages(false);
      }
    };
    fetchMessages();

    // Setup realtime
    if (unsubRef.current) unsubRef.current();
    unsubRef.current = messagingService.subscribeToRoom(selectedId, (newMsg: Message) => {
      setMessages(prev => {
        if (prev.some(m => m.id === newMsg.id)) return prev;
        return [...prev, newMsg];
      });
    });

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
      if (room?.type === 'dm') {
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
    if (!selectedId || !content.trim() && (!attachments || attachments.length === 0)) return;
    try {
      await messagingService.sendMessage(selectedId, content, null, attachments);
    } catch (e: any) {
      toast.error('Failed to send message');
    }
  }, [selectedId, messagingService]);

  return {
    rooms,
    messages,
    selectedId,
    setSelectedId,
    isLoadingRooms,
    isLoadingMessages,
    peerUsername,
    sendMessage
  };
}
