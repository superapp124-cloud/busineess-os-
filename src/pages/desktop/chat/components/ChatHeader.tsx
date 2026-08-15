import React from 'react';
import { Phone, Video, Search, Pin, BellOff, MoreVertical, BrainCircuit } from 'lucide-react';
import { cn } from '@/lib/utils';
import { PresenceIndicator } from './PresenceIndicator';
import { getAvatarUrl } from '@/utils/avatarResolver';
import type { Room } from '../types';

interface ChatHeaderProps {
 selectedRoom: Room;
 peerUsername?: string | null;
 onStartCall: (username: string, video: boolean) => void;
 onSearch: () => void;
}

export const ChatHeader: React.FC<ChatHeaderProps> = React.memo(({
 selectedRoom,
 peerUsername,
 onStartCall,
 onSearch
}) => {
 const isAI = selectedRoom.name === 'CHATR AI' || selectedRoom.name === 'AI Assistant' || selectedRoom.id === 'chatr-ai-room';
 const avatarUrl = isAI ? '/chatr-ai-logo.jpg' : getAvatarUrl(selectedRoom.name, selectedRoom.avatarUrl);

 return (
 <div className="h-14 shrink-0 border-b border-white/[0.06] bg-zinc-950/80 backdrop-blur-md flex items-center justify-between px-5 relative z-10">
 <div className="flex items-center gap-3">
 <div className="w-8 h-8 rounded-lg shrink-0 overflow-hidden shadow-lg border border-white/10 relative">
 <img 
   src={avatarUrl} 
   alt={selectedRoom.name} 
   className="w-full h-full object-cover"
   onError={(e) => {
     (e.currentTarget as HTMLImageElement).src = `https://ui-avatars.com/api/?name=${encodeURIComponent(selectedRoom.name || 'User')}&background=6366f1&color=fff&bold=true`;
   }}
 />
 </div>
 <div>
 <h2 className="text-secondary font-bold text-white/90 flex items-center gap-2">
 {selectedRoom.name}
 </h2>
 <div className="flex items-center gap-1.5 mt-0.5">
 {selectedRoom.type === 'dm' && selectedRoom.name !== 'AI Assistant' ? (
 <>
 <div className="relative w-2 h-2 rounded-full mt-0.5">
 <PresenceIndicator status={(selectedRoom.otherUserPresence || 'offline') as any} />
 </div>
 <p className="text-[10px] text-white/60 capitalize font-medium">
 {selectedRoom.otherUserPresence || 'offline'}
 </p>
 </>
 ) : (
 <p className="text-[10px] text-white/40">{selectedRoom.type === 'channel' ? 'Workspace Channel' : 'Direct Message'}</p>
 )}
 </div>
 </div>
 </div>
 
 <div className="flex items-center gap-1">
 {selectedRoom.type === 'dm' && peerUsername && (
 <>
 <button
 title="Voice Call"
 onClick={() => onStartCall(peerUsername, false)}
 className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-emerald-500/20 text-white/50 hover:text-emerald-400 transition-colors"
 >
 <Phone className="w-4 h-4" />
 </button>
 <button
 title="Video Call"
 onClick={() => onStartCall(peerUsername, true)}
 className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-emerald-500/20 text-white/50 hover:text-emerald-400 transition-colors"
 >
 <Video className="w-4 h-4" />
 </button>
 <div className="w-px h-4 bg-white/10 mx-1" />
 </>
 )}
 <button 
 onClick={onSearch}
 className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-white/10 text-white/50 hover:text-white transition-colors"
 >
 <Search className="w-4 h-4" />
 </button>
 <button className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-white/10 text-white/50 hover:text-white transition-colors">
 <Pin className="w-4 h-4" />
 </button>
 <button className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-white/10 text-white/50 hover:text-white transition-colors">
 <BellOff className="w-4 h-4" />
 </button>
 <button className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-white/10 text-white/50 hover:text-white transition-colors ml-1">
 <MoreVertical className="w-4 h-4" />
 </button>
 </div>
 </div>
 );
});
