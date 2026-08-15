import React from 'react';
import { Search, UserPlus, Plus, ChevronDown, BrainCircuit, Hash, Lock, Users } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import { PresenceIndicator } from './PresenceIndicator';
import type { Room } from '../types';

interface ConversationSidebarProps {
  rooms: Room[];
  selectedId: string | null;
  isLoadingRooms: boolean;
  setSelectedId: (id: string) => void;
  setShowNewDmModal: (show: boolean) => void;
  setShowCreateModal: (show: boolean) => void;
}

export const ConversationSidebar: React.FC<ConversationSidebarProps> = React.memo(({
  rooms,
  selectedId,
  isLoadingRooms,
  setSelectedId,
  setShowNewDmModal,
  setShowCreateModal
}) => {
  const channels = rooms.filter(r => r.type === 'channel');
  const selectedRoom = rooms.find(r => r.id === selectedId);

  const uniqueDms = React.useMemo(() => {
    const rawDms = rooms.filter(r => r.type === 'dm' && r.name !== 'AI Assistant' && r.name !== 'CHATR AI' && r.id !== 'chatr-ai-room');
    const seenNames = new Set<string>();
    const seenIds = new Set<string>();
    const result: Room[] = [];

    for (const dm of rawDms) {
      const normalizedName = dm.name ? dm.name.trim().toLowerCase() : dm.id;
      if (seenIds.has(dm.id) || seenNames.has(normalizedName)) {
        continue;
      }
      seenIds.add(dm.id);
      if (dm.name) seenNames.add(normalizedName);
      result.push(dm);
    }
    return result;
  }, [rooms]);

  const formatDisplayName = (name?: string) => {
    if (!name) return 'Unknown Contact';
    if (name.startsWith('+')) {
      return name.replace(/^(\+\d{2})(\d{5})(\d{5})$/, '$1 $2 $3');
    }
    return name.split(' ').map(w => w.length > 0 ? w.charAt(0).toUpperCase() + w.slice(1) : w).join(' ');
  };

  return (
    <div className="w-72 shrink-0 border-r flex flex-col relative z-20" style={{ background: 'hsl(var(--sidebar-background))', borderColor: 'hsl(var(--sidebar-border))' }}>

      {/* Header */}
      <div className="p-4 flex items-center justify-between border-b" style={{ borderColor: 'hsl(var(--sidebar-border))' }}>
        <h2 className="text-secondary font-bold" style={{ color: 'hsl(var(--sidebar-foreground))' }}>Messages</h2>
        <div className="flex gap-1">
          <button className="w-7 h-7 rounded-lg hover:bg-white/[0.08] flex items-center justify-center text-white/50 transition-colors">
            <Search className="w-4 h-4" />
          </button>
          <button onClick={() => setShowNewDmModal(true)} title="New Direct Message" className="w-7 h-7 rounded-lg hover:bg-white/[0.08] flex items-center justify-center text-white/50 hover:text-violet-300 transition-colors">
            <UserPlus className="w-4 h-4" />
          </button>
          <button onClick={() => setShowCreateModal(true)} className="w-7 h-7 rounded-lg bg-violet-600/20 hover:bg-violet-600/40 text-violet-300 flex items-center justify-center transition-colors">
            <Plus className="w-4 h-4" />
          </button>
        </div>
      </div>

      <ScrollArea className="flex-1">
        <div className="p-2 space-y-4 pb-4">
          
          {/* Favorites */}
          <div className="mb-4">
            <div className="flex items-center justify-between px-2 mb-1 group cursor-pointer">
              <span className="text-[10px] font-bold text-white/30 uppercase tracking-widest group-hover:text-white/50 transition-colors">Favorites</span>
              <ChevronDown className="w-3.5 h-3.5 text-white/20 group-hover:text-white/40" />
            </div>
            <div className="space-y-0.5">
              <button onClick={() => {
                const aiRoom = rooms.find(r => r.name === 'CHATR AI' || r.id === 'chatr-ai-room');
                setSelectedId(aiRoom ? aiRoom.id : 'chatr-ai-room');
              }} className={cn(
                'w-full flex items-center justify-between px-2 py-1.5 rounded-lg transition-colors group',
                (selectedRoom?.name === 'CHATR AI' || selectedId === 'chatr-ai-room') ? 'bg-violet-600/20 text-violet-300 font-semibold' : 'hover:bg-white/[0.04] text-white/70 hover:text-white/90'
              )}>
                <div className="flex items-center gap-2 overflow-hidden">
                  <img src="/chatr-ai-logo.jpg" alt="chatrAI" className="w-5 h-5 rounded-md object-cover shrink-0 shadow-sm" />
                  <span className="text-[13px] truncate font-bold text-white">chatrAI</span>
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
                <div className="px-2 py-2 text-label text-white/30 animate-pulse">Loading…</div>
              ) : channels.length === 0 ? (
                <div className="px-2 py-2 text-label text-white/30">No channels yet</div>
              ) : channels.map(c => (
                <button key={c.id} onClick={() => setSelectedId(c.id)} className={cn(
                  'w-full flex items-center justify-between px-2 py-1.5 rounded-lg transition-colors group',
                  selectedId === c.id ? 'bg-violet-600/20 text-violet-300' : 'hover:bg-white/[0.04] text-white/70 hover:text-white/90',
                  c.isMuted && 'opacity-50'
                )}>
                  <div className="flex items-center gap-2 overflow-hidden">
                    {c.isPrivate ? <Lock className="w-3.5 h-3.5 shrink-0 opacity-50" /> : <Hash className="w-3.5 h-3.5 shrink-0 opacity-50" />}
                    <span className={cn("text-[13px] truncate", (c.unreadCount || 0) > 0 && selectedId !== c.id && "font-bold text-white")}>{c.name}</span>
                  </div>
                  {(c.unreadCount || 0) > 0 && (
                    <span className={cn("text-[10px] font-bold px-1.5 py-0.5 rounded-md", selectedId === c.id ? "bg-violet-500/30 text-violet-200" : "bg-white/10 text-white")}>
                      {c.unreadCount}
                    </span>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Contacts & Directory */}
          <div className="mt-4">
            <div className="flex items-center justify-between px-2 mb-1 group cursor-pointer" onClick={() => setShowNewDmModal(true)}>
              <div className="flex items-center gap-1.5">
                <Users className="w-3.5 h-3.5 text-indigo-400 opacity-80" />
                <span className="text-[10px] font-bold text-white/40 uppercase tracking-widest group-hover:text-white/60 transition-colors">Contacts & Directory</span>
              </div>
              <Plus className="w-3.5 h-3.5 text-white/20 group-hover:text-white/40" />
            </div>
            <div className="space-y-0.5">
              {uniqueDms.length === 0 ? (
                <div className="px-2 py-2 text-label text-white/30 flex items-center justify-between">
                  <span>No contacts yet</span>
                  <button onClick={() => setShowNewDmModal(true)} className="text-[10px] font-bold text-indigo-400 hover:text-indigo-300">Add</button>
                </div>
              ) : uniqueDms.map(dm => (
                <button key={dm.id} onClick={() => setSelectedId(dm.id)} className={cn(
                  'w-full flex items-center gap-2.5 px-2.5 py-2 rounded-xl transition-all text-left group relative',
                  selectedId === dm.id ? 'bg-violet-600/25 border border-violet-500/30' : 'hover:bg-white/[0.05]'
                )}>
                  <div className="relative shrink-0">
                    {dm.avatarUrl ? (
                      <img 
                        src={dm.avatarUrl} 
                        alt={dm.name} 
                        className="w-8 h-8 rounded-lg object-cover shadow-sm" 
                        onError={(e) => {
                          (e.currentTarget as HTMLImageElement).onerror = null;
                          (e.currentTarget as HTMLImageElement).style.display = 'none';
                        }}
                      />
                    ) : (
                      <div className={cn("w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-xs font-bold text-white shadow-sm")}>
                        {formatDisplayName(dm.name)?.slice(0, 2).toUpperCase() || '?'}
                      </div>
                    )}
                    <div className="absolute -bottom-0.5 -right-0.5 border-2 border-[#0b0b14] rounded-full">
                      <PresenceIndicator status={(dm.otherUserPresence || 'offline') as any} />
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <span className={cn("text-[13px] truncate", selectedId === dm.id ? "font-bold text-violet-200" : (dm.unreadCount || 0) > 0 ? "font-bold text-white" : "text-white/90")}>
                        {formatDisplayName(dm.name)}
                      </span>
                      {(dm.unreadCount || 0) > 0 && (
                        <span className="w-4 h-4 rounded-full bg-violet-500 text-white text-[9px] font-black flex items-center justify-center shrink-0">
                          {dm.unreadCount}
                        </span>
                      )}
                    </div>
                    {dm.lastMessage && (
                      <p className="text-[11px] text-white/40 truncate font-normal mt-0.5 group-hover:text-white/60 transition-colors">
                        {dm.lastMessage}
                      </p>
                    )}
                  </div>
                </button>
              ))}
            </div>
          </div>

        </div>
      </ScrollArea>
    </div>
  );
});
