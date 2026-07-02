import React, { useState, useEffect, useRef, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAppearanceStore } from '@/hooks/useAppearanceStore';
import { useService, usePlatformReady } from '@/platform/Infrastructure/PlatformContext';
import type { Room, Message } from '@/platform/Domain/Communication/MessagingService';
import { useNativeRingtone } from '@/hooks/useNativeRingtone';
import { 
  MessageSquare, Search, Plus, MoreVertical, Sparkles, FileText, Calendar, 
  Zap, CheckCheck, Hash, Users, Pin, Bell, BellOff, Phone, Video, 
  ChevronRight, Reply, Smile, CornerUpRight, Image as ImageIcon, 
  Download, FileIcon, Globe, Lock, Shield, Settings2, X, ChevronDown, CheckCircle2,
  BrainCircuit
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import { AdaptiveHome } from '@/components/desktop/AdaptiveHome';
import { useNavigate } from 'react-router-dom';
import { useCall } from '@/contexts/CallContext';
import { toast } from 'sonner';
import { generate } from '@/services/ai';

// ─── UTILS ──────────────────────────────────────────────────────────────────

const relativeTime = (dateStr: string): string => {
  if (!dateStr) return '';
  try {
    const date = new Date(dateStr);
    if (isToday(date)) return format(date, 'HH:mm');
    if (isYesterday(date)) return 'Yesterday';
    return format(date, 'dd MMM');
  } catch { return ''; }
};

const PresenceDot: React.FC<{ status?: 'online' | 'away' | 'busy' | 'offline' }> = ({ status = 'offline' }) => {
  const colors = {
    online: 'bg-emerald-500',
    away: 'bg-amber-400',
    busy: 'bg-red-500',
    offline: 'bg-zinc-500'
  };
  return <span className={cn('absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full ring-2 ring-zinc-950', colors[status])} />;
};

const TypingIndicator = () => (
  <div className="flex items-center gap-0.5">
    {[0, 1, 2].map(i => (
      <span key={i} className="w-1 h-1 rounded-full bg-emerald-400" style={{ animation: `bounce 1s infinite ${i * 0.15}s` }} />
    ))}
  </div>
);

// ─── DEMO DATA (fallback UI while no workspace rooms exist) ─────────────────
// These are only shown when the user has no rooms yet — they do NOT represent real data.

const EMPTY_CHANNELS: Room[] = [];
const EMPTY_MESSAGES: Message[] = [];

// ─── CREATE NEW MODAL ───────────────────────────────────────────────────────

const CreateNewModal: React.FC<{ isOpen: boolean; onClose: () => void; onSelect: (id: string) => void }> = ({ isOpen, onClose, onSelect }) => {
  const navigate = useNavigate();
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="w-full max-w-lg bg-zinc-900 border border-white/10 shadow-2xl rounded-2xl overflow-hidden flex flex-col">
        <div className="flex items-center justify-between p-4 border-b border-white/10">
          <h2 className="text-sm font-bold text-white">Create New</h2>
          <button onClick={onClose} className="p-1 rounded-md hover:bg-white/10 text-white/50 hover:text-white transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>
        <div className="p-2">
          {[
            { id: 'channel', icon: Hash, title: 'Channel', desc: 'For team discussions and specific topics', color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
            { id: 'group', icon: Users, title: 'Group Chat', desc: 'Private conversation with multiple people', color: 'text-blue-400', bg: 'bg-blue-500/10' },
            { id: 'community', icon: Globe, title: 'Community', desc: 'Large scale organization workspace', color: 'text-violet-400', bg: 'bg-violet-500/10' },
          ].map(item => (
            <button key={item.id} onClick={() => onSelect(item.id)} className="w-full flex items-start gap-3 p-3 rounded-xl hover:bg-white/5 transition-all text-left group">
              <div className={cn('w-10 h-10 rounded-xl flex items-center justify-center shrink-0', item.bg)}>
                <item.icon className={cn('w-5 h-5', item.color)} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-bold text-white/90 group-hover:text-white">{item.title}</div>
                <div className="text-xs text-white/50 mt-0.5">{item.desc}</div>
              </div>
              <ChevronRight className="w-4 h-4 text-white/20 group-hover:text-white/60 mt-3" />
            </button>
          ))}
        </div>
        <div className="p-4 border-t border-white/10 bg-black/20">
          <div className="flex items-center gap-2">
            <Lock className="w-3.5 h-3.5 text-emerald-400" />
            <span className="text-[10px] text-emerald-400 font-medium uppercase tracking-wider">End-to-End Encrypted</span>
          </div>
        </div>
      </div>
    </div>
  );
};

// ─── MAIN COMPONENT ─────────────────────────────────────────────────────────

export default function DesktopChat() {
  const { themeMode } = useAppearanceStore();
  const isDark = themeMode === 'dark';
  const isReady = usePlatformReady();
  const messagingService = useService<any>('MessagingService');
  
  const navigate = useNavigate();
  const { startCall } = useCall();

  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [activeThreadId, setActiveThreadId] = useState<string | null>(null);
  // Peer username for calling (resolved when DM room is selected)
  const [peerUsername, setPeerUsername] = useState<string | null>(null);
  // Copilot chat
  const [copilotInput, setCopilotInput] = useState('');
  const [copilotMessages, setCopilotMessages] = useState<{ role: 'user' | 'assistant'; content: string }[]>([]);
  const [copilotLoading, setCopilotLoading] = useState(false);
  const copilotEndRef = useRef<HTMLDivElement | null>(null);

  // ── Live data state ─────────────────────────────────────────────────────────
  const [rooms, setRooms] = useState<Room[]>(EMPTY_CHANNELS);
  const [messages, setMessages] = useState<Message[]>(EMPTY_MESSAGES);
  const [messageInput, setMessageInput] = useState('');
  const [isLoadingRooms, setIsLoadingRooms] = useState(false);
  const [isLoadingMessages, setIsLoadingMessages] = useState(false);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [onlineRoster, setOnlineRoster] = useState<Record<string, { status: string; lastSeen: number }>>({});
  const unsubRef = useRef<(() => void) | null>(null);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  // Get current user
  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user) setCurrentUserId(user.id);
    });
  }, []);

  // Presence Subscription
  useEffect(() => {
    if (!isReady) return;
    try {
      const presenceService = useService<any>('PresenceService');
      const unsub = presenceService.onRosterChange((roster: Record<string, any>) => {
        setOnlineRoster(roster);
      });
      return () => unsub?.();
    } catch { /* ignore if not available */ }
  }, [isReady]);

  // Load rooms when platform is ready
  useEffect(() => {
    if (!messagingService) return;
    setIsLoadingRooms(true);
    messagingService.getRooms().then((r: Room[]) => {
      setRooms(r);
      if (r.length > 0 && !selectedId) setSelectedId(r[0].id);
    }).finally(() => setIsLoadingRooms(false));
  }, [isReady, messagingService]);

  // Load messages when room is selected
  useEffect(() => {
    if (!selectedId || !messagingService) return;
    setIsLoadingMessages(true);
    setMessages([]);

    // Unsubscribe from previous room
    if (unsubRef.current) { unsubRef.current(); unsubRef.current = null; }

    messagingService.getMessages(selectedId).then((msgs: Message[]) => {
      setMessages(msgs);
      setIsLoadingMessages(false);
      setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);
    });

    // Subscribe to realtime
    const unsub = messagingService.subscribeToRoom(selectedId, (msg: Message) => {
      setMessages(prev => [...prev, msg]);
      setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);
      // Play notification sound for messages from others
      if (msg.senderId !== currentUserId) {
        try {
          const notif = new Audio('/notification.mp3');
          notif.volume = 0.5;
          notif.play().catch(() => {});
        } catch {}
      }
    });
    unsubRef.current = unsub;
    return () => { if (unsubRef.current) { unsubRef.current(); unsubRef.current = null; } };
  }, [selectedId, messagingService]);

  // Resolve the peer's username for calling when DM room selected
  useEffect(() => {
    const room = rooms.find(r => r.id === selectedId);
    if (!room || room.type !== 'dm' || !currentUserId) { setPeerUsername(null); return; }
    // Fetch the other participant's username from the conversation_participants table
    supabase
      .from('conversation_participants')
      .select('user_id, profiles:user_id(username, full_name)')
      .eq('conversation_id', selectedId)
      .neq('user_id', currentUserId)
      .limit(1)
      .single()
      .then(({ data }) => {
        const profile = (data as any)?.profiles;
        setPeerUsername(profile?.username || profile?.full_name || null);
      });
  }, [selectedId, rooms, currentUserId]);

  // Split rooms into channels vs DMs for display
  const channels = rooms.filter(r => r.type === 'channel');
  const dms = rooms.filter(r => r.type !== 'channel');
  const selectedRoom = rooms.find(r => r.id === selectedId);

  // Copilot AI send message
  const handleCopilotSend = useCallback(async () => {
    if (!copilotInput.trim() || copilotLoading) return;
    const userMsg = copilotInput.trim();
    setCopilotInput('');
    setCopilotMessages(prev => [...prev, { role: 'user', content: userMsg }]);
    setCopilotLoading(true);
    try {
      const context = selectedRoom ? `The user is currently in a chat named "${selectedRoom.name}". ` : '';
      const conversationHistory = copilotMessages.map(m => `${m.role === 'user' ? 'User' : 'CHATR Copilot'}: ${m.content}`).join('\n');
      const prompt = `${context}You are CHATR Copilot, an AI assistant embedded in the CHATR enterprise messaging platform. Help the user with their question concisely and professionally.\n\n${conversationHistory}\nUser: ${userMsg}\nCHATR Copilot:`;
      const reply = await generate({ prompt, preferLocal: true });
      setCopilotMessages(prev => [...prev, { role: 'assistant', content: reply }]);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Local AI is unavailable.';
      setCopilotMessages(prev => [...prev, { role: 'assistant', content: message }]);
    } finally {
      setCopilotLoading(false);
      setTimeout(() => copilotEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);
    }
  }, [copilotInput, copilotLoading, copilotMessages, selectedRoom]);

  const handleSendMessage = useCallback(async () => {
    if (!messageInput.trim() || !selectedId || !messagingService) return;
    const content = messageInput.trim();
    setMessageInput('');
    await messagingService.sendMessage(selectedId, content);
  }, [messageInput, selectedId, messagingService]);


  return (
    <div className={cn("flex h-full font-sans", isDark ? "bg-[#0a0a12] text-white" : "bg-white text-zinc-950")}>
      
      {/* ── LEFT PANE: Channels & DMs ────────────────────────────────────── */}
      <div className="w-72 shrink-0 border-r border-white/[0.06] bg-[#0b0b14] flex flex-col relative z-20">
        
        {/* Header */}
        <div className="p-4 flex items-center justify-between border-b border-white/[0.04]">
          <h2 className="text-sm font-bold text-white/90">Messages</h2>
          <div className="flex gap-1">
            <button className="w-7 h-7 rounded-lg hover:bg-white/[0.08] flex items-center justify-center text-white/50 transition-colors">
              <Search className="w-4 h-4" />
            </button>
            <button onClick={() => setShowCreateModal(true)} className="w-7 h-7 rounded-lg bg-violet-600/20 hover:bg-violet-600/40 text-violet-300 flex items-center justify-center transition-colors">
              <Plus className="w-4 h-4" />
            </button>
          </div>
        </div>

        <ScrollArea className="flex-1">
          <div className="p-2 space-y-4 pb-4">
            {/* Pinned & AI */}
            <div className="mb-4">
              <div className="space-y-0.5">
                <button onClick={() => {
                  const aiRoom = rooms.find(r => r.name === 'AI Assistant');
                  if (aiRoom) setSelectedId(aiRoom.id);
                }} className={cn(
                  'w-full flex items-center justify-between px-2 py-1.5 rounded-lg transition-colors group',
                  selectedRoom?.name === 'AI Assistant' ? 'bg-violet-600/20 text-violet-300' : 'hover:bg-white/[0.04] text-white/70 hover:text-white/90'
                )}>
                  <div className="flex items-center gap-2 overflow-hidden">
                    <BrainCircuit className="w-3.5 h-3.5 shrink-0 text-violet-400" />
                    <span className="text-[13px] truncate font-medium">CHATR AI</span>
                  </div>
                </button>
              </div>
            </div>

            {/* Channels */}
            <div>
              <div className="flex items-center justify-between px-2 mb-1 group cursor-pointer">
                <span className="text-[10px] font-bold text-white/30 uppercase tracking-widest group-hover:text-white/50 transition-colors">Workspace Channels</span>
                <ChevronDown className="w-3.5 h-3.5 text-white/20 group-hover:text-white/40" />
              </div>
              <div className="space-y-0.5">
                {isLoadingRooms ? (
                  <div className="px-2 py-2 text-xs text-white/30 animate-pulse">Loading…</div>
                ) : channels.length === 0 ? (
                  <div className="px-2 py-2 text-xs text-white/30">No channels yet</div>
                ) : channels.map(c => (
                  <button key={c.id} onClick={() => setSelectedId(c.id)} className={cn(
                    'w-full flex items-center justify-between px-2 py-1.5 rounded-lg transition-colors group',
                    selectedId === c.id ? 'bg-violet-600/20 text-violet-300' : 'hover:bg-white/[0.04] text-white/70 hover:text-white/90',
                    c.isMuted && 'opacity-50'
                  )}>
                    <div className="flex items-center gap-2 overflow-hidden">
                      {c.isPrivate ? <Lock className="w-3.5 h-3.5 shrink-0 opacity-50" /> : <Hash className="w-3.5 h-3.5 shrink-0 opacity-50" />}
                      <span className={cn("text-[13px] truncate", c.unreadCount > 0 && selectedId !== c.id && "font-bold text-white")}>{c.name}</span>
                    </div>
                    {c.unreadCount > 0 && (
                      <span className={cn("text-[10px] font-bold px-1.5 py-0.5 rounded-md", selectedId === c.id ? "bg-violet-500/30 text-violet-200" : "bg-white/10 text-white")}>
                        {c.unreadCount}
                      </span>
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* People */}
            <div className="mt-4">
              <div className="flex items-center justify-between px-2 mb-1 group cursor-pointer">
                <span className="text-[10px] font-bold text-white/30 uppercase tracking-widest group-hover:text-white/50 transition-colors">People</span>
                <Plus className="w-3.5 h-3.5 text-white/20 group-hover:text-white/40" />
              </div>
              <div className="space-y-0.5">
                {dms.filter(dm => dm.name !== 'AI Assistant').length === 0 ? (
                  <div className="px-2 py-2 text-xs text-white/30">No direct messages yet</div>
                ) : dms.filter(dm => dm.name !== 'AI Assistant').map(dm => (
                  <button key={dm.id} onClick={() => setSelectedId(dm.id)} className={cn(
                    'w-full flex items-center gap-2.5 px-2 py-1.5 rounded-lg transition-colors text-left group relative',
                    selectedId === dm.id ? 'bg-violet-600/20' : 'hover:bg-white/[0.04]'
                  )}>
                    <div className="relative shrink-0">
                      {dm.avatarUrl ? (
                        <img src={dm.avatarUrl} alt={dm.name} className="w-6 h-6 rounded-[6px] object-cover" />
                      ) : (
                        <div className={cn("w-6 h-6 rounded-[6px] bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-[10px] font-bold text-white")}>
                          {dm.name.slice(0, 2).toUpperCase()}
                        </div>
                      )}
                      <div className="absolute -bottom-0.5 -right-0.5 border-2 border-[#0b0b14] rounded-full">
                        <PresenceDot status={(dm.otherUserPresence || 'offline') as any} />
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <span className={cn("text-[13px] truncate", selectedId === dm.id ? "font-semibold text-violet-300" : dm.unreadCount > 0 ? "font-semibold text-white" : "text-white/80")}>
                          {dm.name}
                        </span>
                        {dm.unreadCount > 0 && (
                          <span className="w-4 h-4 rounded-full bg-violet-500 text-white text-[9px] font-black flex items-center justify-center shrink-0">
                            {dm.unreadCount}
                          </span>
                        )}
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>

          </div>
        </ScrollArea>
      </div>

      {/* ── CENTER PANE: Chat View ───────────────────────────────────────── */}
      <div className="flex-1 flex flex-col min-w-0 relative bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] bg-fixed">
        <div className="absolute inset-0 bg-zinc-950/95" /> {/* Overlay for dark mode text readability */}
        
        {!selectedRoom ? (
          <div className="flex-1 flex items-center justify-center relative z-10 p-8">
            <div className="max-w-md w-full text-center">
              <div className="w-20 h-20 rounded-[24px] bg-gradient-to-tr from-violet-600 to-indigo-500 p-0.5 mx-auto mb-6 shadow-2xl shadow-violet-500/20">
                <div className="w-full h-full bg-[#0b0b14] rounded-[22px] flex items-center justify-center">
                  <Sparkles className="w-8 h-8 text-violet-400" />
                </div>
              </div>
              <h2 className="text-2xl font-bold text-white mb-2">Welcome to your Workspace</h2>
              <p className="text-white/50 text-sm mb-8">What would you like to do next?</p>
              
              <div className="grid grid-cols-2 gap-3">
                <button onClick={() => setShowCreateModal(true)} className="flex flex-col items-center gap-3 p-4 rounded-xl bg-white/5 hover:bg-white/10 border border-white/5 hover:border-white/20 transition-all group">
                  <div className="w-10 h-10 rounded-full bg-emerald-500/10 text-emerald-400 flex items-center justify-center group-hover:scale-110 transition-transform">
                    <Plus className="w-5 h-5" />
                  </div>
                  <span className="text-sm font-medium text-white/90">Create Channel</span>
                </button>
                <button onClick={() => navigate('/desktop/intelligence')} className="flex flex-col items-center gap-3 p-4 rounded-xl bg-white/5 hover:bg-white/10 border border-white/5 hover:border-white/20 transition-all group">
                  <div className="w-10 h-10 rounded-full bg-violet-500/10 text-violet-400 flex items-center justify-center group-hover:scale-110 transition-transform">
                    <BrainCircuit className="w-5 h-5" />
                  </div>
                  <span className="text-sm font-medium text-white/90">Ask AI</span>
                </button>
                <button onClick={() => navigate('/desktop/contacts')} className="flex flex-col items-center gap-3 p-4 rounded-xl bg-white/5 hover:bg-white/10 border border-white/5 hover:border-white/20 transition-all group">
                  <div className="w-10 h-10 rounded-full bg-blue-500/10 text-blue-400 flex items-center justify-center group-hover:scale-110 transition-transform">
                    <Users className="w-5 h-5" />
                  </div>
                  <span className="text-sm font-medium text-white/90">Invite People</span>
                </button>
                <button onClick={() => setShowCreateModal(true)} className="flex flex-col items-center gap-3 p-4 rounded-xl bg-white/5 hover:bg-white/10 border border-white/5 hover:border-white/20 transition-all group">
                  <div className="w-10 h-10 rounded-full bg-orange-500/10 text-orange-400 flex items-center justify-center group-hover:scale-110 transition-transform">
                    <FileText className="w-5 h-5" />
                  </div>
                  <span className="text-sm font-medium text-white/90">New Chat</span>
                </button>
              </div>
            </div>
          </div>
        ) : (
          <>
            {/* Header */}
            <div className="h-14 shrink-0 border-b border-white/[0.06] bg-zinc-950/80 backdrop-blur-md flex items-center justify-between px-5 relative z-10">
              <div className="flex items-center gap-3">
                <div className={cn("w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold text-white shadow-lg", 
                  selectedRoom.name === 'AI Assistant' ? 'bg-violet-600' : 'bg-gradient-to-br from-indigo-500 to-purple-500'
                )}>
                  {selectedRoom.name === 'AI Assistant' ? <BrainCircuit className="w-4 h-4 text-white" /> : (selectedRoom.name?.slice(0, 2).toUpperCase() || '??')}
                </div>
                <div>
                  <h2 className="text-sm font-bold text-white/90 flex items-center gap-2">
                    {selectedRoom.name}
                  </h2>
                  <p className="text-[10px] text-white/40">{selectedRoom.type === 'channel' ? 'Workspace Channel' : 'Direct Message'}</p>
                </div>
              </div>
              <div className="flex items-center gap-1">
                {selectedRoom?.type === 'dm' && peerUsername && (
                  <>
                    <button
                      title="Voice Call"
                      onClick={() => startCall(peerUsername, false)}
                      className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-emerald-500/20 text-white/50 hover:text-emerald-400 transition-colors"
                    >
                      <Phone className="w-4 h-4" />
                    </button>
                    <button
                      title="Video Call"
                      onClick={() => startCall(peerUsername, true)}
                      className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-violet-500/20 text-white/50 hover:text-violet-400 transition-colors"
                    >
                      <Video className="w-4 h-4" />
                    </button>
                  </>
                )}
                <button className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-white/[0.08] text-white/50 hover:text-white transition-colors">
                  <Search className="w-4 h-4" />
                </button>
                <button className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-white/[0.08] text-white/50 hover:text-white transition-colors">
                  <Pin className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Messages */}
            <ScrollArea className="flex-1 relative z-10">
              <div className="p-5 space-y-6">
                <div ref={messagesEndRef} />
                {messages.map((msg) => {
                  const isOwn = msg.senderId === currentUserId;
                  const time = new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                  
                  // Map AI system messages to proper UI
                  const isAI = msg.senderId === '11111111-1111-1111-1111-111111111111' || msg.actorId === '11111111-1111-1111-1111-111111111111';
                  const avatar = isAI ? 'AI' : (msg.senderName ? msg.senderName.substring(0, 2).toUpperCase() : 'U');
                  const senderName = isAI ? 'CHATR AI' : (msg.senderName || 'Unknown User');

                  return (
                  <div key={msg.id} className={cn("flex gap-3 group relative animate-in fade-in slide-in-from-bottom-2", isOwn ? "flex-row-reverse" : "flex-row")}>
                    
                    {/* Avatar (only for others) */}
                    {!isOwn && (
                      <div className={cn("w-8 h-8 rounded-[8px] flex items-center justify-center text-[10px] font-bold text-white shrink-0 mt-1",
                        isAI ? 'bg-violet-600' : 'bg-gradient-to-br from-indigo-500 to-purple-500'
                      )}>
                        {isAI ? <BrainCircuit className="w-4 h-4" /> : (msg.senderAvatar ? <img src={msg.senderAvatar} className="w-full h-full rounded-[8px] object-cover" /> : avatar)}
                      </div>
                    )}

                    <div className={cn("flex flex-col max-w-[70%]", isOwn ? "items-end" : "items-start")}>
                      
                      {/* Sender Name & Time */}
                      {!isOwn && (
                        <div className="flex items-baseline gap-2 mb-1 pl-1">
                          <span className={cn("text-xs font-bold", isAI ? 'text-violet-400' : 'text-white/90')}>{senderName}</span>
                          <span className="text-[10px] text-white/30">{time}</span>
                        </div>
                      )}

                      {/* Message Bubble */}
                      <div className="relative group/bubble">
                        <div className={cn(
                          "px-4 py-2.5 rounded-2xl text-[13px] leading-relaxed shadow-sm relative whitespace-pre-wrap",
                          msg.isOwn 
                            ? "bg-violet-600 text-white rounded-tr-sm" 
                            : isAI 
                              ? "bg-violet-500/10 border border-violet-500/20 text-white/90 rounded-tl-sm shadow-black/20"
                              : "bg-zinc-900 border border-white/[0.05] text-white/90 rounded-tl-sm shadow-black/20"
                        )}>
                          {msg.content}
                        </div>
                      </div>
                    </div>
                  </div>
                  );
                })}
              </div>
            </ScrollArea>

            {/* Input Area */}
            <div className="p-4 bg-zinc-950/80 backdrop-blur-xl border-t border-white/[0.06] relative z-20 shrink-0">
              <div className="max-w-4xl mx-auto relative group">
                <div className="absolute left-3 top-1/2 -translate-y-1/2 flex items-center gap-1">
                  <button className="w-7 h-7 rounded-full hover:bg-white/10 flex items-center justify-center text-white/40 transition-colors">
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
                <Input 
                  value={messageInput}
                    onChange={e => setMessageInput(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleSendMessage()}
                  placeholder={`Message ${selectedRoom.name}...`}
                  className="w-full h-12 bg-zinc-900 border-white/[0.08] text-sm pl-12 pr-24 rounded-2xl focus:border-violet-500/50 shadow-inner placeholder:text-white/30"
                />
                <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
                  <button className="w-8 h-8 rounded-full hover:bg-white/10 flex items-center justify-center text-white/40 transition-colors">
                    <Smile className="w-4 h-4" />
                  </button>
                  <button onClick={handleSendMessage} className="w-8 h-8 rounded-full bg-violet-600 hover:bg-violet-500 flex items-center justify-center text-white shadow-lg transition-colors">
                    <CornerUpRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          </>
        )}
      </div>

      {/* ── RIGHT PANE: Copilot / Thread ─────────────────────────────────── */}
      {selectedRoom && (
      <div className="w-80 shrink-0 border-l border-white/[0.06] bg-[#0b0b14] flex flex-col relative z-20">
        
        {/* State 1: Active Thread */}
        {activeThreadId ? (
          <>
            <div className="h-14 shrink-0 flex items-center justify-between px-4 border-b border-white/[0.04]">
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold text-white/90">Thread</h3>
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-white/10 text-white/50">#{selectedRoom.name}</span>
              </div>
              <button onClick={() => setActiveThreadId(null)} className="p-1.5 rounded-md hover:bg-white/10 text-white/50 transition-colors">
                <X className="w-4 h-4" />
              </button>
            </div>
            
            <ScrollArea className="flex-1">
              <div className="p-4 flex items-center justify-center h-full text-white/30 text-xs">
                Thread implementation pending real data integration
              </div>
            </ScrollArea>
          </>
        ) : (
          /* State 2: CHATR Copilot Sidebar */
          <>
            <div className="h-14 shrink-0 flex items-center gap-2 px-4 border-b border-white/[0.04]">
              <div className="w-7 h-7 rounded-lg bg-violet-600/20 border border-violet-500/30 flex items-center justify-center text-violet-300">
                <BrainCircuit className="w-3.5 h-3.5" />
              </div>
              <div>
                <h3 className="text-xs font-bold text-white/90">CHATR Copilot</h3>
                <p className="text-[9px] text-violet-400">Powered by local Ollama</p>
              </div>
            </div>

            <ScrollArea className="flex-1">
              <div className="p-3 space-y-3">
                {copilotMessages.length === 0 && (
                  <div className="p-3 rounded-xl bg-violet-600/10 border border-violet-500/20 text-[11px] text-white/60 leading-relaxed">
                    <span className="text-violet-300 font-semibold">CHATR Copilot</span><br/>
                    Ask me anything about this conversation, get summaries, draft replies, or get help with any task.
                  </div>
                )}
                {copilotMessages.map((m, i) => (
                  <div key={i} className={cn('flex', m.role === 'user' ? 'justify-end' : 'justify-start')}>
                    <div className={cn(
                      'max-w-[90%] px-3 py-2 rounded-xl text-[11px] leading-relaxed',
                      m.role === 'user'
                        ? 'bg-violet-600 text-white rounded-br-sm'
                        : 'bg-zinc-800/80 border border-white/[0.06] text-white/80 rounded-bl-sm'
                    )}>
                      {m.content}
                    </div>
                  </div>
                ))}
                {copilotLoading && (
                  <div className="flex justify-start">
                    <div className="px-3 py-2 rounded-xl bg-zinc-800/80 border border-white/[0.06] text-violet-400 text-[11px]">
                      <span className="animate-pulse">CHATR Copilot is thinking…</span>
                    </div>
                  </div>
                )}
                <div ref={copilotEndRef} />
              </div>
            </ScrollArea>

            {/* Copilot input */}
            <div className="p-3 border-t border-white/[0.04]">
              <div className="flex gap-2">
                <input
                  value={copilotInput}
                  onChange={e => setCopilotInput(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleCopilotSend()}
                  placeholder="Ask CHATR Copilot…"
                  className="flex-1 bg-zinc-900 border border-white/[0.08] rounded-xl px-3 py-2 text-[11px] text-white placeholder:text-white/30 focus:outline-none focus:border-violet-500/50"
                />
                <button
                  onClick={handleCopilotSend}
                  disabled={copilotLoading || !copilotInput.trim()}
                  className="w-8 h-8 rounded-xl bg-violet-600 hover:bg-violet-500 disabled:opacity-40 flex items-center justify-center transition-colors"
                >
                  <CornerUpRight className="w-3.5 h-3.5 text-white" />
                </button>
              </div>
            </div>
          </>
        )}
      </div>
      )}

      <CreateNewModal 
        isOpen={showCreateModal} 
        onClose={() => setShowCreateModal(false)} 
        onSelect={(id) => {
          setShowCreateModal(false);
          if (id === 'community') navigate('/create-community');
          else navigate('/contacts');
        }}
      />

      {/* Global CSS for animations */}
      <style>{`
        @keyframes bounce {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-3px); }
        }
      `}</style>
    </div>
  );
}
