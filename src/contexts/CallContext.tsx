import React, { createContext, useContext, useState, useEffect, useRef, ReactNode } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { SupabaseSignalingAdapter } from '@/packages/communication-engine/signaling/SharedSignalingAdapter';
import { DesktopAdapter } from '@/packages/communication-engine/device/DesktopAdapter';
import { EventBus, CommunicationEvent } from '@/packages/communication-engine/core/EventBus';
import { GroupCallManager } from '@/packages/communication-engine/core/GroupCallManager';
import { toast } from 'sonner';
import { getFlagFromPhone } from '@/utils/countryCodeUtil';
import { useNavigate } from 'react-router-dom';

interface IncomingRoom {
 roomId: string;
 callerName: string;
 callerAvatar: string;
 callerFlag: string;
 goal: string;
 callId: string | null;
 callerId: string;
}

interface RemoteStream {
 stream: MediaStream;
 name: string;
 flag?: string;
}

interface CallContextType {
 gcm: GroupCallManager | null;
 callState: 'idle' | 'ringing' | 'connected';
 activeRoomId: string | null;
 activeCallId: string | null;
 activeCallTargetId: string | null;
 localStream: MediaStream | null;
 remoteStreams: Record<string, RemoteStream>;
 incomingRoom: IncomingRoom | null;
 currentUserId: string | null;
 currentUserName: string;
 isMuted: boolean;
 isVideoOff: boolean;
 callDuration: number;
 isVideoCall: boolean;
 remoteUserName: string;
 remoteUserAvatar: string;
 remoteUserFlag: string;
 sessionGoal: string | null;
 transcriptRef: React.MutableRefObject<string>;
 
 setSessionGoal: (goal: string | null) => void;
 setRemoteUserName: (name: string) => void;
 setRemoteUserAvatar: (avatar: string) => void;
 startCall: (dialInput: string, video?: boolean) => Promise<void>;
 answerCall: () => Promise<void>;
 declineCall: () => void;
 endCall: () => void;
 addParticipant: (dialInput: string) => Promise<void>;
 toggleMute: () => void;
 toggleVideo: () => void;
}

const CallContext = createContext<CallContextType | null>(null);

export const useCallContext = () => {
 const ctx = useContext(CallContext);
 if (!ctx) throw new Error('useCallContext must be used within CallProvider');
 return ctx;
};

export const useCall = useCallContext;

export const CallProvider = ({ children }: { children: ReactNode }) => {
 const navigate = useNavigate();
 const [gcm, setGcm] = useState<GroupCallManager | null>(null);
 const [callState, setCallState] = useState<'idle' | 'ringing' | 'connected'>('idle');
 const [sessionGoal, setSessionGoal] = useState<string | null>(null);

 const [activeRoomId, setActiveRoomId] = useState<string | null>(null);
 const [activeCallId, setActiveCallId] = useState<string | null>(null);
 const [activeCallTargetId, setActiveCallTargetId] = useState<string | null>(null);
 const [localStream, setLocalStream] = useState<MediaStream | null>(null);
 const [remoteStreams, setRemoteStreams] = useState<Record<string, RemoteStream>>({});

 const [incomingRoom, setIncomingRoom] = useState<IncomingRoom | null>(null);
 const [currentUserId, setCurrentUserId] = useState<string | null>(null);
 const [currentUserName, setCurrentUserName] = useState('');
 
 const [isMuted, setIsMuted] = useState(false);
 const [isVideoOff, setIsVideoOff] = useState(false);
 const [callDuration, setCallDuration] = useState(0);
 const [isVideoCall, setIsVideoCall] = useState(true);
 
 const [remoteUserName, setRemoteUserName] = useState('');
 const [remoteUserAvatar, setRemoteUserAvatar] = useState('');
 const [remoteUserFlag, setRemoteUserFlag] = useState('');

 const localStreamRef = useRef<MediaStream | null>(null);
 const timerRef = useRef<NodeJS.Timeout | null>(null);
 const transcriptRef = useRef<string>('');
 const cleanup = useRef<Array<() => void>>([]);

 useEffect(() => {
 init();
 return () => {
 cleanup.current.forEach(fn => fn());
 if (timerRef.current) clearInterval(timerRef.current);
 localStreamRef.current?.getTracks().forEach(t => t.stop());
 };
 }, []);

 useEffect(() => {
 if (!activeRoomId || !currentUserId) return;

 // Listen for host commands like Mute All and Host Transfer
 const settingsChannel = supabase.channel(`room-settings-${activeRoomId}`)
 .on('broadcast', { event: 'host_control' }, (payload) => {
 const { key, value } = payload.payload || {};
 if (key === 'mute_all') {
 supabase.from('session_rooms').select('host_id').eq('id', activeRoomId).single().then(({ data }) => {
 if (data && data.host_id !== currentUserId) {
 localStreamRef.current?.getAudioTracks().forEach(t => { t.enabled = false; });
 setIsMuted(true);
 toast.info('The host has muted your microphone.');
 }
 });
 } else if (key === 'host_transferred') {
 if (value === currentUserId) {
 toast.success('You are now the host of this meeting.');
 } else {
 toast.info('The host role has been transferred.');
 }
 }
 })
 .subscribe();

 return () => {
 supabase.removeChannel(settingsChannel);
 };
 }, [activeRoomId, currentUserId]);

 const init = async () => {
 const { data: { user } } = await supabase.auth.getUser();
 if (!user) return;
 setCurrentUserId(user.id);

 const { data: profile } = await supabase.from('profiles').select('full_name,username').eq('id', user.id).single();
 setCurrentUserName(profile?.full_name || profile?.username || 'You');

 const provider = new SupabaseSignalingAdapter(supabase);
 await provider.connect(user.id);
 const manager = new GroupCallManager(user.id, provider);
 setGcm(manager);

 const bus = EventBus.getInstance();
 const unsubs = [
 bus.subscribe(CommunicationEvent.LOCAL_STREAM_READY, (p: any) => {
 localStreamRef.current = p.stream;
 setLocalStream(p.stream);
 }),
 bus.subscribe(CommunicationEvent.ROOM_PARTICIPANT_JOINED, async (p: any) => {
 const { data: prof } = await supabase.from('profiles').select('full_name,username,phone_number').eq('id', p.userId).single();
 const name = prof?.full_name || prof?.username || 'Participant';
 const flag = getFlagFromPhone(prof?.phone_number || '');
 setRemoteStreams(prev => ({ ...prev, [p.userId]: { stream: p.stream, name, flag } }));
 }),
 bus.subscribe(CommunicationEvent.ROOM_PARTICIPANT_LEFT, (p: any) => {
 setRemoteStreams(prev => {
 const next = { ...prev };
 delete next[p.userId];
 return next;
 });
 }),
 ];

 const inviteChannel = supabase.channel(`room-invites-${user.id}`)
 .on('postgres_changes', {
 event: 'INSERT', schema: 'public', table: 'session_room_participants',
 filter: `user_id=eq.${user.id}`
 }, async (payload: any) => {
 const roomId = payload.new.room_id;
 const { data: room } = await supabase
 .from('session_rooms')
 .select('host_id, session_goal')
 .eq('id', roomId)
 .single();

 if (room && room.host_id !== user.id) {
 const { data: hostProf } = await supabase.from('profiles').select('full_name,username,avatar_url,phone_number').eq('id', room.host_id).single();

 const { data: callRow } = await supabase
 .from('calls')
 .select('id, call_type')
 .eq('caller_id', room.host_id)
 .eq('receiver_id', user.id)
 .eq('status', 'ringing')
 .order('created_at', { ascending: false })
 .limit(1)
 .maybeSingle();

 if (callRow?.call_type) {
 setIsVideoCall(callRow.call_type === 'video');
 }

 setIncomingRoom({
 roomId,
 callId: callRow?.id || null,
 callerName: hostProf?.full_name || hostProf?.username || 'Unknown',
 callerAvatar: hostProf?.avatar_url || '',
 callerFlag: getFlagFromPhone(hostProf?.phone_number) || '',
 goal: room.session_goal || 'quick',
 callerId: room.host_id,
 });
 }
 })
 .subscribe();

 const legacyCallChannel = supabase.channel(`legacy-calls-${user.id}`)
 .on('postgres_changes', {
 event: '*', schema: 'public', table: 'calls',
 filter: `receiver_id=eq.${user.id}`
 }, async (payload: any) => {
 const callRow = payload.new;
 if (!callRow || !callRow.id) return;

 if (payload.eventType === 'INSERT' && callRow.status === 'ringing') {
 const { data: callerProf } = await supabase.from('profiles').select('full_name,username,avatar_url,phone_number').eq('id', callRow.caller_id).single();
 setIsVideoCall(callRow.call_type === 'video');
 setIncomingRoom({
 roomId: callRow.id,
 callId: callRow.id,
 callerName: callRow.caller_name || callerProf?.full_name || callerProf?.username || callRow.caller_phone || callerProf?.phone_number || 'Caller',
 callerAvatar: callRow.caller_avatar || callerProf?.avatar_url || '',
 callerFlag: getFlagFromPhone(callRow.caller_phone || callerProf?.phone_number || '') || '',
 goal: 'quick',
 callerId: callRow.caller_id,
 });
 } else if (payload.eventType === 'UPDATE' && (callRow.status === 'ended' || callRow.status === 'rejected' || callRow.status === 'missed')) {
 setIncomingRoom(prev => prev?.callId === callRow.id ? null : prev);
 }
 })
 .subscribe();

 cleanup.current = [() => manager.destroy(), ...unsubs, () => supabase.removeChannel(inviteChannel), () => supabase.removeChannel(legacyCallChannel)];
 };

  const resolveUser = async (input: string): Promise<{ id: string; name: string; avatar: string; phone?: string } | null> => {
    const rawTrimmed = input.trim();
    if (!rawTrimmed) return null;

    const cleanSearch = rawTrimmed.replace(/^@/, '').replace(/^usr-/, '').trim();
    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(cleanSearch);

    // 1. Direct UUID match
    if (isUuid) {
      const { data: uuidProf } = await supabase
        .from('profiles')
        .select('id, full_name, username, avatar_url, phone_number, email')
        .eq('id', cleanSearch)
        .maybeSingle();

      if (uuidProf) {
        const resolvedName = uuidProf.full_name || uuidProf.username || (uuidProf.email ? uuidProf.email.split('@')[0] : cleanSearch);
        return { id: uuidProf.id, name: resolvedName, avatar: uuidProf.avatar_url || '', phone: uuidProf.phone_number || '' };
      }
      return { id: cleanSearch, name: rawTrimmed, avatar: '' };
    }

    // 2. Exact match on username, email, phone_number, or synthetic chatr email (e.g. 919717161809@chatr.local)
    const digits = cleanSearch.replace(/\D/g, '');
    const { data: exactProf } = await supabase
      .from('profiles')
      .select('id, full_name, username, avatar_url, phone_number, email')
      .or(`username.eq.${cleanSearch},email.eq.${cleanSearch},phone_number.eq.${cleanSearch}${digits ? `,email.ilike.%${digits}%,phone_number.ilike.%${digits}%` : ''}`)
      .limit(1)
      .maybeSingle();

    if (exactProf) {
      const resolvedName = exactProf.full_name || exactProf.username || (exactProf.email ? exactProf.email.split('@')[0] : cleanSearch);
      return { id: exactProf.id, name: resolvedName, avatar: exactProf.avatar_url || '', phone: exactProf.phone_number || '' };
    }

    // 3. Check recent calls table (matches caller/receiver name to get authentic peer Auth UUID)
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: recentCalls } = await supabase
          .from('calls')
          .select('caller_id, receiver_id, caller_name, receiver_name')
          .or(`caller_id.eq.${user.id},receiver_id.eq.${user.id}`)
          .order('created_at', { ascending: false })
          .limit(20);

        if (recentCalls && recentCalls.length > 0) {
          for (const callRow of recentCalls) {
            const peerId = callRow.caller_id === user.id ? callRow.receiver_id : callRow.caller_id;
            const peerName = callRow.caller_id === user.id ? callRow.receiver_name : callRow.caller_name;
            if (peerId && peerName && peerName.toLowerCase().includes(cleanSearch.toLowerCase())) {
              const { data: peerProf } = await supabase
                .from('profiles')
                .select('id, full_name, username, avatar_url, phone_number')
                .eq('id', peerId)
                .maybeSingle();

              if (peerProf) {
                const resolvedName = peerProf.full_name || peerProf.username || peerName;
                return { id: peerProf.id, name: resolvedName, avatar: peerProf.avatar_url || '', phone: peerProf.phone_number || '' };
              }
              return { id: peerId, name: peerName, avatar: '' };
            }
          }
        }
      }
    } catch {
      // ignore
    }

    // 4. Case-insensitive fuzzy search on username, full_name, email
    const safeTerm = cleanSearch.replace(/[^a-zA-Z0-9_\-\.\@\s]/g, '');
    if (safeTerm.length >= 2) {
      const { data: fuzzyProf } = await supabase
        .from('profiles')
        .select('id, full_name, username, avatar_url, phone_number, email')
        .or(`username.ilike.%${safeTerm}%,full_name.ilike.%${safeTerm}%,email.ilike.%${safeTerm}%`)
        .limit(1)
        .maybeSingle();

      if (fuzzyProf) {
        const resolvedName = fuzzyProf.full_name || fuzzyProf.username || (fuzzyProf.email ? fuzzyProf.email.split('@')[0] : safeTerm);
        return { id: fuzzyProf.id, name: resolvedName, avatar: fuzzyProf.avatar_url || '', phone: fuzzyProf.phone_number || '' };
      }
    }

    // 5. Tokenized search for multi-word inputs ("talentxcel services", "sanobar jahan", etc.)
    const tokens = cleanSearch.split(/\s+/).map(t => t.replace(/[^a-zA-Z0-9_\-\.@]/g, '')).filter(t => t.length >= 2);
    for (const token of tokens) {
      const { data: tokenProf } = await supabase
        .from('profiles')
        .select('id, full_name, username, avatar_url, phone_number, email')
        .or(`username.ilike.%${token}%,full_name.ilike.%${token}%,email.ilike.%${token}%`)
        .limit(1)
        .maybeSingle();

      if (tokenProf) {
        const resolvedName = tokenProf.full_name || tokenProf.username || (tokenProf.email ? tokenProf.email.split('@')[0] : token);
        return { id: tokenProf.id, name: resolvedName, avatar: tokenProf.avatar_url || '', phone: tokenProf.phone_number || '' };
      }
    }

    // 6. Query contacts table by name / phone
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user && safeTerm) {
        const { data: contact } = await supabase
          .from('contacts')
          .select('contact_user_id, name, full_name, email, phone')
          .eq('user_id', user.id)
          .or(`name.ilike.%${safeTerm}%,full_name.ilike.%${safeTerm}%,phone.ilike.%${safeTerm}%`)
          .limit(1)
          .maybeSingle();

        if (contact && contact.contact_user_id) {
          const { data: contactProf } = await supabase
            .from('profiles')
            .select('id, full_name, username, avatar_url, phone_number')
            .eq('id', contact.contact_user_id)
            .maybeSingle();

          if (contactProf) {
            const resolvedName = contactProf.full_name || contactProf.username || contact.name || rawTrimmed;
            return { id: contactProf.id, name: resolvedName, avatar: contactProf.avatar_url || '', phone: contactProf.phone_number || '' };
          }
        }
      }
    } catch {
      // ignore
    }

    return null;
  };

  const getStream = async (video: boolean): Promise<MediaStream | null> => {
    try {
      const adapter = new DesktopAdapter();
      const realStream = video ? await adapter.getVideoStream() : await adapter.getAudioStream();
      if (realStream && realStream.getTracks().length > 0) return realStream;
    } catch (e) {
      console.warn('[CallContext] Hardware media stream notice, initializing fallback stream:', e);
    }

    try {
      const canvas = document.createElement('canvas');
      canvas.width = 640;
      canvas.height = 480;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.fillStyle = '#0f172a';
        ctx.fillRect(0, 0, 640, 480);
        ctx.fillStyle = '#818cf8';
        ctx.font = 'bold 22px sans-serif';
        ctx.fillText('CHATR Live Call Session', 180, 240);
      }
      const canvasStream = canvas.captureStream(30);

      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioCtx) {
        const audioCtx = new AudioCtx();
        const osc = audioCtx.createOscillator();
        const dst = audioCtx.createMediaStreamDestination();
        osc.connect(dst);
        osc.start();
        const audioTrack = dst.stream.getAudioTracks()[0];
        if (audioTrack) canvasStream.addTrack(audioTrack);
      }

      return canvasStream;
    } catch (err) {
      console.error('[CallContext] Fallback stream error:', err);
      return new MediaStream();
    }
  };

  const startTimer = () => {
    setCallDuration(0);
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(() => setCallDuration(d => d + 1), 1000);
  };

  const startCall = async (dialInput: string, video: boolean = true) => {
    const rawTarget = dialInput.trim();
    if (!rawTarget || !currentUserId) return;

    const resolved = await resolveUser(rawTarget);
    const target = resolved || {
      id: rawTarget,
      name: rawTarget.replace(/^@/, '').replace(/[._-]/g, ' '),
      avatar: '',
      phone: rawTarget
    };

    setIsVideoCall(video);
    setRemoteUserName(target.name);
    setRemoteUserAvatar(target.avatar || '');
    setRemoteUserFlag(getFlagFromPhone(target.phone || '') || '');

    const roomId = `room-${Date.now()}`;
    setActiveRoomId(roomId);
    setActiveCallTargetId(target.id);
    setCallState('connected');
    startTimer();

    const stream = await getStream(video);
    if (stream) setLocalStream(stream);

    const isTargetUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(target.id);

    // 1. Create DB session room and participants
    try {
      await supabase.from('session_rooms').insert({
        id: roomId,
        host_id: currentUserId,
        session_goal: sessionGoal || 'quick',
        title: `${video ? 'Video' : 'Voice'} Call with ${target.name}`,
      });

      const participantRows = [{ room_id: roomId, user_id: currentUserId }];
      if (isTargetUuid) {
        participantRows.push({ room_id: roomId, user_id: target.id });
      }
      await supabase.from('session_room_participants').insert(participantRows);
    } catch (e) {
      console.warn('[CallContext] session_rooms insert notice:', e);
    }

    // 2. Create ringing call row in calls table to trigger recipient incoming popup
    if (isTargetUuid) {
      try {
        const { data: callerProfile } = await supabase
          .from('profiles')
          .select('full_name, username, avatar_url, phone_number')
          .eq('id', currentUserId)
          .maybeSingle();

        const callerName = callerProfile?.full_name || callerProfile?.username || currentUserName || 'Caller';

        const { data: callRow } = await supabase
          .from('calls')
          .insert({
            caller_id: currentUserId,
            receiver_id: target.id,
            caller_name: callerName,
            caller_avatar: callerProfile?.avatar_url || '',
            caller_phone: callerProfile?.phone_number || '',
            receiver_name: target.name,
            receiver_avatar: target.avatar || '',
            status: 'ringing',
            call_type: video ? 'video' : 'voice',
            started_at: new Date().toISOString(),
          })
          .select()
          .maybeSingle();

        if (callRow?.id) {
          setActiveCallId(callRow.id);

          // 🔔 Send FCM push notification to wake receiver's device (chatr.chat / Android / iOS)
          // This fires even if Supabase Realtime INSERT event is delayed or missed on recipient device.
          try {
            await supabase.functions.invoke('fcm-notify', {
              body: {
                type: 'call',
                receiverId: target.id,
                callerId: currentUserId,
                callerName,
                callerAvatar: callerProfile?.avatar_url || '',
                callerPhone: callerProfile?.phone_number || '',
                callId: callRow.id,
                callType: video ? 'video' : 'audio',
              }
            });
            console.log('[CallContext] FCM call notification dispatched to', target.id);
          } catch (fcmErr) {
            console.warn('[CallContext] FCM notification error (non-critical):', fcmErr);
          }
        }
      } catch (e) {
        console.warn('[CallContext] calls table insert notice:', e);
      }
    }

    // 3. Join WebRTC call room
    if (gcm) {
      try {
        await gcm.joinRoom(roomId, [target.id], stream || new MediaStream(), { video, audio: true }, true);
      } catch (gcmErr) {
        console.warn('[CallContext] GCM joinRoom notice:', gcmErr);
      }
    }

    toast.success(`Calling ${target.name}...`);
    navigate('/desktop/calls');
  };

 const answerCall = async () => {
 if (!gcm || !incomingRoom || !currentUserId) return;
 const { roomId, callerName, callerAvatar, callerFlag, goal, callId: incomingCallId, callerId } = incomingRoom;

 // Security Check: Is the room locked?
 const { data: roomData } = await supabase.from('session_rooms').select('is_locked, waiting_room_enabled').eq('id', roomId).single();
 if (roomData?.is_locked) {
 toast.error('The host has locked this meeting. You cannot join.');
 setIncomingRoom(null);
 return;
 }
 if (roomData?.waiting_room_enabled) {
 toast.info('The host has enabled the waiting room. (Approval flow coming soon, joining blocked for now)');
 setIncomingRoom(null);
 return;
 }

 setIncomingRoom(null);
 setSessionGoal(goal);
 setRemoteUserName(callerName);
 setRemoteUserAvatar(callerAvatar);
 setRemoteUserFlag(callerFlag);
 setActiveRoomId(roomId);
 setCallState('connected');
 startTimer();

 if (incomingCallId) {
 setActiveCallId(incomingCallId);
 supabase.from('calls').update({ status: 'active', started_at: new Date().toISOString() })
 .eq('id', incomingCallId)
 .then(({ error }) => { if (error) console.error(error) });
 }

 const { data: parts } = await supabase.from('session_room_participants').select('user_id').eq('room_id', roomId);
 let peers = (parts || []).map((p: any) => p.user_id).filter((id: string) => id !== currentUserId);

 if (peers.length === 0 && callerId) {
 peers = [callerId];
 }

 const stream = await getStream(isVideoCall);
 if (!stream) { endCall(); return; }
 await gcm.joinRoom(roomId, peers, stream, { video: isVideoCall, audio: true }, false);
 navigate('/desktop/calls');
 };

 const declineCall = () => setIncomingRoom(null);

 const addParticipant = async (dialInput: string) => {
 if (!dialInput.trim() || !activeRoomId || !currentUserId || !gcm) return;
 const target = await resolveUser(dialInput.trim());
 if (!target) { toast.error('User not found.'); return; }
 
 await supabase.from('session_room_participants').insert({ room_id: activeRoomId, user_id: target.id });

 try {
 const { data: callerProfile } = await supabase
 .from('profiles')
 .select('full_name,username,avatar_url,phone_number')
 .eq('id', currentUserId)
 .single();

 const { data: convId } = await supabase
 .rpc('create_direct_conversation', { other_user_id: target.id });

 const { data: callRow } = await supabase.from('calls').insert([{
 conversation_id: convId,
 caller_id: currentUserId,
 caller_name: callerProfile?.full_name || callerProfile?.username || 'Caller',
 caller_avatar: callerProfile?.avatar_url || '',
 caller_phone: callerProfile?.phone_number || '',
 receiver_id: target.id,
 receiver_name: target.name,
 receiver_avatar: target.avatar || '',
 receiver_phone: target.phone || '',
 call_type: isVideoCall ? 'video' : 'audio',
 status: 'ringing',
 started_at: new Date().toISOString(),
 }]).select('id').single();

 if (callRow?.id) {
 await gcm.addPeer(activeRoomId, target.id, callRow.id);
 }
 } catch (err) {
 console.warn('[DesktopCalls] Failed to ring added participant:', err);
 }
 };

 const endCall = () => {
 const finalTranscript = transcriptRef.current;
 const finalDuration = callDuration;
 const finalCallId = activeCallId;
 const finalRoomId = activeRoomId;
 const finalRemoteName = remoteUserName;
 const finalUserId = currentUserId;

 if (gcm && activeRoomId) gcm.leaveRoom(activeRoomId).catch(console.error);
 if (timerRef.current) clearInterval(timerRef.current);
 
 // Completely stop tracks!
 localStreamRef.current?.getTracks().forEach(t => t.stop());
 localStreamRef.current = null;
 
 setLocalStream(null);
 setRemoteStreams({});
 setRemoteUserName('');
 setRemoteUserAvatar('');
 setRemoteUserFlag('');
 setCallState('idle');
 setActiveRoomId(null);
 setSessionGoal(null);
 setCallDuration(0);
 transcriptRef.current = '';
 setIsMuted(false);
 setIsVideoOff(false);

 if (finalCallId) {
 supabase.from('calls').update({ status: 'ended', ended_at: new Date().toISOString() })
 .eq('id', finalCallId)
 .then(({ error }) => { if (error) console.error(error) });
 setActiveCallId(null);
 }
 setActiveCallTargetId(null);
 };

 const toggleMute = () => {
 localStreamRef.current?.getAudioTracks().forEach(t => { t.enabled = !t.enabled; });
 setIsMuted(m => !m);
 };

 const toggleVideo = () => {
 localStreamRef.current?.getVideoTracks().forEach(t => { t.enabled = !t.enabled; });
 setIsVideoOff(v => !v);
 };

 return (
 <CallContext.Provider value={{
 gcm, callState, activeRoomId, activeCallId, activeCallTargetId,
 localStream, remoteStreams, incomingRoom, currentUserId, currentUserName,
 isMuted, isVideoOff, callDuration, isVideoCall, remoteUserName, remoteUserAvatar,
 remoteUserFlag, sessionGoal, transcriptRef,
 setSessionGoal, setRemoteUserName, setRemoteUserAvatar,
 startCall, answerCall, declineCall, endCall, addParticipant, toggleMute, toggleVideo
 }}>
 {children}
 </CallContext.Provider>
 );
};
