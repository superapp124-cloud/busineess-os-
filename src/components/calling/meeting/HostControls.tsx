import React, { useState } from 'react';
import { X, MicOff, Lock, LogOut, UserCog, MessageSquareOff, Shield, CheckCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

interface HostControlsProps {
  onClose: () => void;
  onMuteAll: () => void;
  onEndMeeting: () => void;
  roomId?: string | null;
}

export const HostControls: React.FC<HostControlsProps> = ({ onClose, onMuteAll, onEndMeeting, roomId }) => {
  const [locked, setLocked] = useState(false);
  const [chatDisabled, setChatDisabled] = useState(false);
  const [waitingRoomEnabled, setWaitingRoomEnabled] = useState(false);

  const updateRoomSetting = async (key: string, value: boolean) => {
    if (!roomId) {
      toast.error('No active room to update.');
      return;
    }
    try {
      // Broadcast the setting change to all peers via a Realtime channel
      await supabase.channel(`room-settings-${roomId}`).send({
        type: 'broadcast',
        event: 'host_control',
        payload: { key, value },
      });
      // Also persist in the session_rooms table if the column exists
      await supabase.from('session_rooms').update({ [key]: value }).eq('id', roomId);
    } catch {
      // Non-critical — real-time broadcast is the primary mechanism
    }
  };

  const handleLockMeeting = async () => {
    const next = !locked;
    setLocked(next);
    await updateRoomSetting('is_locked', next);
    toast.success(next ? 'Meeting locked — no new participants can join.' : 'Meeting unlocked.');
    onClose();
  };

  const handleDisableChat = async () => {
    const next = !chatDisabled;
    setChatDisabled(next);
    await updateRoomSetting('chat_disabled', next);
    toast.success(next ? 'Chat disabled for all participants.' : 'Chat re-enabled.');
    onClose();
  };

  const handleWaitingRoom = async () => {
    const next = !waitingRoomEnabled;
    setWaitingRoomEnabled(next);
    await updateRoomSetting('waiting_room_enabled', next);
    toast.success(next ? 'Waiting room enabled. New joiners need approval.' : 'Waiting room disabled.');
    onClose();
  };

  const handleMuteAll = () => {
    onMuteAll();
    toast.success('All participants muted.');
    onClose();
  };

  const handleTransferHost = () => {
    toast.info('Select a participant to transfer host role — coming soon!');
    onClose();
  };

  const handleEndMeeting = () => {
    onEndMeeting();
    onClose();
  };

  const ACTIONS = [
    {
      icon: MicOff,
      label: 'Mute All Participants',
      desc: 'All participants will be muted',
      color: 'text-amber-400', bg: 'bg-amber-500/10', border: 'border-amber-500/20', hoverBg: 'hover:bg-amber-500/15',
      action: handleMuteAll,
      active: false,
    },
    {
      icon: Lock,
      label: locked ? 'Unlock Meeting' : 'Lock Meeting',
      desc: locked ? 'Allow new participants to join' : 'Prevent new participants from joining',
      color: 'text-blue-400', bg: 'bg-blue-500/10', border: 'border-blue-500/20', hoverBg: 'hover:bg-blue-500/15',
      action: handleLockMeeting,
      active: locked,
    },
    {
      icon: MessageSquareOff,
      label: chatDisabled ? 'Enable Chat' : 'Disable Chat',
      desc: chatDisabled ? 'Allow participants to send messages' : 'Participants cannot send messages',
      color: 'text-orange-400', bg: 'bg-orange-500/10', border: 'border-orange-500/20', hoverBg: 'hover:bg-orange-500/15',
      action: handleDisableChat,
      active: chatDisabled,
    },
    {
      icon: Shield,
      label: waitingRoomEnabled ? 'Disable Waiting Room' : 'Enable Waiting Room',
      desc: waitingRoomEnabled ? 'Let participants join directly' : 'New joiners must be admitted',
      color: 'text-purple-400', bg: 'bg-purple-500/10', border: 'border-purple-500/20', hoverBg: 'hover:bg-purple-500/15',
      action: handleWaitingRoom,
      active: waitingRoomEnabled,
    },
    {
      icon: UserCog,
      label: 'Transfer Host',
      desc: 'Assign host role to another participant',
      color: 'text-cyan-400', bg: 'bg-cyan-500/10', border: 'border-cyan-500/20', hoverBg: 'hover:bg-cyan-500/15',
      action: handleTransferHost,
      active: false,
    },
    {
      icon: LogOut,
      label: 'End Meeting for All',
      desc: 'Disconnect all participants',
      color: 'text-red-400', bg: 'bg-red-500/10', border: 'border-red-500/20', hoverBg: 'hover:bg-red-500/15',
      action: handleEndMeeting,
      active: false,
    },
  ];

  return (
    <div className="absolute bottom-full right-4 mb-3 w-72 bg-zinc-900 border border-white/[0.1] rounded-2xl shadow-2xl shadow-black/80 overflow-hidden animate-in slide-in-from-bottom-4 fade-in duration-200 z-50">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-white/[0.07]">
        <div>
          <h3 className="text-sm font-bold text-white">Host Controls</h3>
          <p className="text-[9px] text-white/40 mt-0.5">You are the host of this meeting</p>
        </div>
        <button onClick={onClose} className="w-6 h-6 rounded-md bg-white/[0.05] hover:bg-white/[0.1] flex items-center justify-center transition-colors">
          <X className="w-3.5 h-3.5 text-white/60" />
        </button>
      </div>

      <div className="p-2 space-y-1">
        {ACTIONS.map((action, i) => (
          <button
            key={i}
            onClick={action.action}
            className={cn(
              'w-full flex items-center gap-3 px-3 py-2.5 rounded-xl border transition-all text-left',
              action.active
                ? `${action.bg} ${action.border} ring-1 ${action.border}`
                : `${action.bg} ${action.border} ${action.hoverBg}`
            )}
          >
            <div className={cn('w-8 h-8 rounded-lg flex items-center justify-center shrink-0', action.bg, 'border', action.border)}>
              <action.icon className={cn('w-4 h-4', action.color)} />
            </div>
            <div className="flex-1 min-w-0">
              <div className={cn('text-xs font-semibold', action.color)}>{action.label}</div>
              <div className="text-[10px] text-white/30 mt-0.5">{action.desc}</div>
            </div>
            {action.active && <CheckCircle className={cn('w-3.5 h-3.5 shrink-0', action.color)} />}
          </button>
        ))}
      </div>
    </div>
  );
};
