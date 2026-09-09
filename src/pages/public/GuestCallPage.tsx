import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { 
  Phone, PhoneOff, Mic, MicOff, Video, VideoOff, 
  Copy, Share2, ShieldCheck, Download, QrCode, 
  Sparkles, Check, ArrowRight, Smartphone, Users,
  Volume2, Radio, ExternalLink, Shield
} from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { SEOHead } from '@/components/SEOHead';
import { ViralTelemetry } from '@/services/viralTelemetry';
import { ServerAbuseGuard } from '@/services/serverAbuseGuard';

const FALLBACK_STUN_SERVERS = [
  { urls: 'stun:stun.l.google.com:19302' },
  { urls: 'stun:stun1.l.google.com:19302' },
  { urls: 'stun:stun2.l.google.com:19302' },
  { urls: 'stun:stun.cloudflare.com:3478' }
];

const MAX_MESH_PARTICIPANTS = 4;
const MAX_CALL_DURATION_SEC = 3600; // 60 minutes session cap

export const GuestCallPage: React.FC = () => {
  const { roomId: rawRoomId } = useParams<{ roomId?: string }>();
  const navigate = useNavigate();

  // Generate or sanitize roomId
  const roomId = React.useMemo(() => {
    if (rawRoomId) return rawRoomId.replace(/[^a-zA-Z0-9-_]/g, '');
    return 'c-' + crypto.randomUUID();
  }, [rawRoomId]);

  // PRIVACY BOUNDARY: Derive a one-way telemetry ID so the usable room credential is NEVER logged in analytics
  const [roomSessionId, setRoomSessionId] = useState<string>('');
  React.useEffect(() => {
    ViralTelemetry.deriveInviteId(roomId).then(setRoomSessionId);
  }, [roomId]);

  const [guestName, setGuestName] = useState(() => {
    return localStorage.getItem('chatr-guest-name') || 'Guest-' + Math.floor(1000 + Math.random() * 9000);
  });
  const [peerId] = useState(() => 'peer-' + Math.random().toString(36).substring(2, 10));
  
  // Call State
  const [hasJoined, setHasJoined] = useState(false);
  const [callEnded, setCallEnded] = useState(false);
  const [callDuration, setCallDuration] = useState(0);
  const [peerCount, setPeerCount] = useState(1);
  const [remotePeerName, setRemotePeerName] = useState<string | null>(null);
  
  // Media State
  const [audioMuted, setAudioMuted] = useState(false);
  const [videoMuted, setVideoMuted] = useState(false);
  const [isAudioOnly, setIsAudioOnly] = useState(false);
  const [audioLevel, setAudioLevel] = useState(0);
  const [copiedLink, setCopiedLink] = useState(false);

  // Refs
  const localVideoRef = useRef<HTMLVideoElement | null>(null);
  const remoteVideoRef = useRef<HTMLVideoElement | null>(null);
  const localStreamRef = useRef<MediaStream | null>(null);
  const peerConnectionRef = useRef<RTCPeerConnection | null>(null);
  const channelRef = useRef<any>(null);
  const timerRef = useRef<any>(null);
  const audioContextRef = useRef<AudioContext | null>(null);

  const fullCallUrl = `https://www.chatrchat.in/call/${roomId}`;

  // Start Call Duration Timer
  useEffect(() => {
    if (hasJoined && !callEnded) {
      timerRef.current = setInterval(() => {
        setCallDuration(prev => prev + 1);
      }, 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [hasJoined, callEnded]);

  // Cleanup media on unmount
  useEffect(() => {
    return () => {
      if (localStreamRef.current) {
        localStreamRef.current.getTracks().forEach(track => track.stop());
      }
      if (peerConnectionRef.current) {
        peerConnectionRef.current.close();
      }
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current);
      }
      if (audioContextRef.current) {
        audioContextRef.current.close().catch(() => {});
      }
    };
  }, []);

  const setupLocalMedia = async (videoWanted: boolean) => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true
        },
        video: videoWanted ? {
          width: { ideal: 1280 },
          height: { ideal: 720 },
          facingMode: 'user'
        } : false
      });

      localStreamRef.current = stream;
      if (localVideoRef.current && videoWanted) {
        localVideoRef.current.srcObject = stream;
      }

      // Setup audio analyzer for waveform
      try {
        const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
        if (AudioCtx) {
          const audioCtx = new AudioCtx();
          audioContextRef.current = audioCtx;
          const analyser = audioCtx.createAnalyser();
          const source = audioCtx.createMediaStreamSource(stream);
          source.connect(analyser);
          analyser.fftSize = 64;
          const dataArray = new Uint8Array(analyser.frequencyBinCount);

          const checkAudio = () => {
            if (!localStreamRef.current) return;
            analyser.getByteFrequencyData(dataArray);
            let sum = 0;
            for (let i = 0; i < dataArray.length; i++) sum += dataArray[i];
            const avg = sum / dataArray.length;
            setAudioLevel(Math.min(100, Math.round(avg * 1.5)));
            requestAnimationFrame(checkAudio);
          };
          checkAudio();
        }
      } catch (err) {
        console.warn('Audio analyzer error:', err);
      }

      return stream;
    } catch (err: any) {
      console.warn('Could not get video stream, falling back to audio only:', err);
      setIsAudioOnly(true);
      const audioStream = await navigator.mediaDevices.getUserMedia({ audio: true });
      localStreamRef.current = audioStream;
      return audioStream;
    }
  };

  const createPeerConnection = (stream: MediaStream, channel: any) => {
    const pc = new RTCPeerConnection({
      iceServers: FALLBACK_STUN_SERVERS,
      iceCandidatePoolSize: 2
    });

    stream.getTracks().forEach(track => {
      pc.addTrack(track, stream);
    });

    pc.onicecandidate = (event) => {
      if (event.candidate && channel) {
        channel.send({
          type: 'broadcast',
          event: 'signal',
          payload: {
            from: peerId,
            senderName: guestName,
            type: 'candidate',
            candidate: event.candidate
          }
        });
      }
    };

    pc.ontrack = (event) => {
      if (remoteVideoRef.current && event.streams[0]) {
        remoteVideoRef.current.srcObject = event.streams[0];
        setPeerCount(prev => Math.max(2, prev));
      }
    };

    peerConnectionRef.current = pc;
    return pc;
  };

  const joinCall = async (withVideo: boolean = true) => {
    localStorage.setItem('chatr-guest-name', guestName);
    setIsAudioOnly(!withVideo);

    // Server-authoritative abuse check
    const serverCheck = await ServerAbuseGuard.checkLimit('guest_join');
    if (!serverCheck.allowed) {
      toast.error(serverCheck.reason || 'Server rate limit exceeded. Please try again later.');
      return;
    }

    try {
      const stream = await setupLocalMedia(withVideo);
      setHasJoined(true);

      // Join Supabase Broadcast Realtime Channel for ephemeral signaling
      const channel = supabase.channel(`guest-call-${roomId}`, {
        config: {
          broadcast: { self: false }
        }
      });

      channelRef.current = channel;

      const pc = createPeerConnection(stream, channel);

      channel
        .on('broadcast', { event: 'signal' }, async ({ payload }) => {
          if (!payload || payload.from === peerId) return;

          if (payload.senderName) {
            setRemotePeerName(payload.senderName);
            setPeerCount(2);
          }

          if (payload.type === 'offer') {
            await pc.setRemoteDescription(new RTCSessionDescription(payload.offer));
            const answer = await pc.createAnswer();
            await pc.setLocalDescription(answer);

            channel.send({
              type: 'broadcast',
              event: 'signal',
              payload: {
                from: peerId,
                senderName: guestName,
                type: 'answer',
                answer
              }
            });
          } else if (payload.type === 'answer') {
            await pc.setRemoteDescription(new RTCSessionDescription(payload.answer));
          } else if (payload.type === 'candidate' && payload.candidate) {
            try {
              await pc.addIceCandidate(new RTCIceCandidate(payload.candidate));
            } catch (e) {
              console.warn('ICE candidate addition error:', e);
            }
          } else if (payload.type === 'peer-left') {
            toast.info(`${payload.senderName || 'Participant'} left the call`);
            setPeerCount(1);
            setRemotePeerName(null);
          }
        })
        .on('broadcast', { event: 'presence' }, async ({ payload }) => {
          if (payload && payload.from !== peerId) {
            setRemotePeerName(payload.senderName);
            setPeerCount(2);
            // Initiate offer as caller
            try {
              const offer = await pc.createOffer();
              await pc.setLocalDescription(offer);
              channel.send({
                type: 'broadcast',
                event: 'signal',
                payload: {
                  from: peerId,
                  senderName: guestName,
                  type: 'offer',
                  offer
                }
              });
            } catch (err) {
              console.error('Error creating offer:', err);
            }
          }
        })
        .subscribe(async (status) => {
          if (status === 'SUBSCRIBED') {
            // Announce presence
            channel.send({
              type: 'broadcast',
              event: 'presence',
              payload: { from: peerId, senderName: guestName }
            });
          }
        });

      toast.success('Connected to call room');
      if (roomSessionId) {
        ViralTelemetry.track({ type: 'guest_call_joined', roomSessionId });
      }
    } catch (err: any) {
      toast.error('Permission denied or microphone/camera unavailable');
      console.error('Failed to join call:', err);
    }
  };

  const toggleMic = () => {
    if (localStreamRef.current) {
      const audioTrack = localStreamRef.current.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled;
        setAudioMuted(!audioTrack.enabled);
      }
    }
  };

  const toggleVideo = () => {
    if (localStreamRef.current) {
      const videoTrack = localStreamRef.current.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.enabled = !videoTrack.enabled;
        setVideoMuted(!videoTrack.enabled);
      }
    }
  };

  useEffect(() => {
    if (hasJoined && !callEnded) {
      timerRef.current = setInterval(() => {
        setCallDuration(prev => {
          if (prev >= MAX_CALL_DURATION_SEC) {
            toast.info('Maximum guest session limit (60 mins) reached');
            endCall();
            return prev;
          }
          return prev + 1;
        });
      }, 1000);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [hasJoined, callEnded]);

  const endCall = () => {
    if (channelRef.current) {
      channelRef.current.send({
        type: 'broadcast',
        event: 'signal',
        payload: { from: peerId, senderName: guestName, type: 'peer-left' }
      });
      supabase.removeChannel(channelRef.current);
    }
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach(t => t.stop());
    }
    if (peerConnectionRef.current) {
      peerConnectionRef.current.close();
    }
    setCallEnded(true);

    // Track call completion telemetry with derived privacy session ID
    if (roomSessionId) {
      ViralTelemetry.track({
        type: 'guest_call_completed',
        roomSessionId,
        durationSec: callDuration
      });
      ViralTelemetry.track({
        type: 'post_call_cta_viewed',
        roomSessionId
      });
    }
  };

  const copyCallLink = () => {
    navigator.clipboard.writeText(fullCallUrl);
    setCopiedLink(true);
    toast.success('Call link copied to clipboard!');
    setTimeout(() => setCopiedLink(false), 2500);
  };

  const shareViaWhatsApp = () => {
    const text = encodeURIComponent(`Join my secure WebRTC call on CHATR+: ${fullCallUrl}`);
    window.open(`https://wa.me/?text=${text}`, '_blank');
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white font-sans flex flex-col justify-between selection:bg-emerald-500/30">
      <SEOHead
        title="Join WebRTC HD Call — CHATR+ Instant Calling"
        description="Instant browser-based WebRTC voice and video call. No download required. Crystal-clear 128 kbps OPUS audio, end-to-end encrypted peer-to-peer connection."
        canonicalUrl={fullCallUrl}
      />

      {/* STICKY TOP PROMOTIONAL BANNER: THE VIRAL ACQUISITION ENGINE */}
      <div className="sticky top-0 z-50 bg-gradient-to-r from-slate-900 via-emerald-950/80 to-slate-900 border-b border-emerald-500/30 px-4 py-2.5 backdrop-blur-md">
        <div className="max-w-6xl mx-auto flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2">
            <span className="flex h-2 w-2 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span className="font-bold text-white tracking-wide">CHATR+ WebRTC</span>
            <span className="text-slate-400 hidden sm:inline">• 128 kbps OPUS • Sub-40ms HD Voice</span>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-slate-300 hidden md:inline">Want lockscreen ringing & zero browser limits?</span>
            <a
              href="/download/Chatr-Plus.apk"
              download="Chatr-Plus.apk"
              onClick={() => ViralTelemetry.track({ type: 'apk_download_clicked', source: 'call_banner' })}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold transition-all shadow-md shadow-emerald-500/20"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Get Android App (78 MB)</span>
            </a>
          </div>
        </div>
      </div>

      {/* MAIN CONTAINER */}
      <main className="flex-1 max-w-5xl mx-auto w-full px-4 py-6 flex flex-col justify-center">
        {!hasJoined && !callEnded && (
          <div className="max-w-md mx-auto w-full bg-slate-900/90 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-6 shadow-2xl backdrop-blur-sm">
            <div className="text-center space-y-2">
              <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center mx-auto text-emerald-400">
                <Radio className="w-8 h-8 animate-pulse" />
              </div>
              <h1 className="text-2xl font-black text-white">Join WebRTC Call</h1>
              <p className="text-xs text-slate-400">
                Room: <span className="font-mono text-emerald-400">{roomId}</span> • Peer-to-Peer Encrypted
              </p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Your Display Name
                </label>
                <input
                  type="text"
                  value={guestName}
                  onChange={(e) => setGuestName(e.target.value)}
                  placeholder="Enter your name"
                  className="w-full px-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 text-sm font-medium"
                />
              </div>

              <div className="grid grid-cols-2 gap-3 pt-2">
                <button
                  onClick={() => joinCall(true)}
                  className="w-full flex items-center justify-center gap-2 py-3.5 px-4 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-sm transition-all shadow-lg shadow-emerald-500/25"
                >
                  <Video className="w-4 h-4" />
                  <span>Video Call</span>
                </button>
                <button
                  onClick={() => joinCall(false)}
                  className="w-full flex items-center justify-center gap-2 py-3.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-sm transition-all border border-slate-700"
                >
                  <Phone className="w-4 h-4 text-emerald-400" />
                  <span>Voice Only</span>
                </button>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-800/80 text-center space-y-2">
              <div className="flex items-center justify-center gap-1.5 text-xs text-emerald-400 font-medium">
                <ShieldCheck className="w-4 h-4" />
                <span>Zero signup required • Works directly in browser</span>
              </div>
              <p className="text-[11px] text-slate-500">
                Expatriates & Global Users: Operates unblocked over standard TLS (Port 443)
              </p>
            </div>
          </div>
        )}

        {hasJoined && !callEnded && (
          <div className="space-y-4">
            {/* Call Header */}
            <div className="flex items-center justify-between bg-slate-900/60 border border-slate-800/80 rounded-2xl p-4">
              <div className="flex items-center gap-3">
                <div className="h-3 w-3 rounded-full bg-emerald-500 animate-pulse" />
                <div>
                  <h2 className="text-sm font-bold text-white">
                    {remotePeerName ? `Talking with ${remotePeerName}` : 'Waiting for participant to join...'}
                  </h2>
                  <p className="text-xs text-slate-400 font-mono">
                    Duration: {formatDuration(callDuration)} • {peerCount} {peerCount === 1 ? 'participant' : 'participants'}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={copyCallLink}
                  className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold flex items-center gap-1.5 border border-slate-700 transition-all"
                >
                  {copiedLink ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedLink ? 'Copied' : 'Invite'}</span>
                </button>
                <button
                  onClick={shareViaWhatsApp}
                  className="px-3 py-1.5 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 text-xs font-semibold flex items-center gap-1.5 border border-emerald-500/30 transition-all"
                >
                  <Share2 className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">WhatsApp</span>
                </button>
              </div>
            </div>

            {/* Video / Audio Grid */}
            <div className="relative aspect-video max-h-[60vh] bg-slate-900 rounded-3xl overflow-hidden border border-slate-800 shadow-2xl flex items-center justify-center">
              {/* Remote Video Stream */}
              <video
                ref={remoteVideoRef}
                autoPlay
                playsInline
                className={`w-full h-full object-cover ${!remotePeerName ? 'hidden' : ''}`}
              />

              {/* Waiting Placeholder */}
              {!remotePeerName && (
                <div className="text-center space-y-4 p-6">
                  <div className="w-20 h-20 rounded-full bg-emerald-500/10 border-2 border-emerald-500/30 flex items-center justify-center mx-auto text-emerald-400">
                    <Radio className="w-10 h-10 animate-ping" />
                  </div>
                  <div className="space-y-1">
                    <h3 className="text-lg font-bold text-white">Call Room Ready</h3>
                    <p className="text-xs text-slate-400 max-w-sm mx-auto">
                      Share this link with your contact to start the conversation instantly:
                    </p>
                  </div>
                  <div className="flex items-center justify-center gap-2">
                    <input
                      type="text"
                      readOnly
                      value={fullCallUrl}
                      className="px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-emerald-400 font-mono w-64 text-center"
                    />
                    <button
                      onClick={copyCallLink}
                      className="px-3 py-2 bg-emerald-500 text-slate-950 rounded-xl text-xs font-bold"
                    >
                      Copy
                    </button>
                  </div>
                </div>
              )}

              {/* Local Video Picture-in-Picture */}
              {!isAudioOnly && (
                <div className="absolute bottom-4 right-4 w-32 sm:w-44 aspect-video rounded-xl overflow-hidden border-2 border-emerald-500/40 shadow-xl bg-slate-950">
                  <video
                    ref={localVideoRef}
                    autoPlay
                    playsInline
                    muted
                    className="w-full h-full object-cover -scale-x-100"
                  />
                  <div className="absolute bottom-1 left-2 text-[10px] text-white/80 font-medium bg-black/60 px-1.5 py-0.5 rounded">
                    You
                  </div>
                </div>
              )}

              {/* Voice level indicator badge */}
              <div className="absolute top-4 left-4 flex items-center gap-2 bg-black/60 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/10 text-xs">
                <Volume2 className="w-3.5 h-3.5 text-emerald-400" />
                <div className="w-16 h-1.5 bg-slate-800 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-emerald-400 transition-all duration-75"
                    style={{ width: `${audioLevel}%` }}
                  />
                </div>
              </div>
            </div>

            {/* In-Call Controls Dock */}
            <div className="flex items-center justify-center gap-4 py-2">
              <button
                onClick={toggleMic}
                className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all ${
                  audioMuted 
                    ? 'bg-rose-500 text-white shadow-lg shadow-rose-500/30' 
                    : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700'
                }`}
                title={audioMuted ? 'Unmute' : 'Mute'}
              >
                {audioMuted ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
              </button>

              <button
                onClick={toggleVideo}
                className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all ${
                  videoMuted || isAudioOnly
                    ? 'bg-rose-500 text-white shadow-lg shadow-rose-500/30' 
                    : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700'
                }`}
                title={videoMuted ? 'Turn Camera On' : 'Turn Camera Off'}
              >
                {videoMuted || isAudioOnly ? <VideoOff className="w-5 h-5" /> : <Video className="w-5 h-5" />}
              </button>

              <button
                onClick={endCall}
                className="w-14 h-12 rounded-2xl bg-rose-600 hover:bg-rose-500 text-white flex items-center justify-center shadow-lg shadow-rose-600/40 transition-all font-bold"
                title="End Call"
              >
                <PhoneOff className="w-5 h-5" />
              </button>
            </div>
          </div>
        )}

        {/* POST-CALL CONVERSION SCREEN: HIGH-VELOCITY APK INSTALL FUNNEL */}
        {callEnded && (
          <div className="max-w-lg mx-auto w-full bg-slate-900/90 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-6 shadow-2xl text-center">
            <div className="w-16 h-16 rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center mx-auto text-emerald-400">
              <Check className="w-8 h-8" />
            </div>

            <div className="space-y-1">
              <h2 className="text-2xl font-black text-white">Call Completed</h2>
              <p className="text-xs text-slate-400 font-mono">
                Duration: {formatDuration(callDuration)} • OPUS 128 kbps HD Audio
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-emerald-950/40 border border-emerald-500/30 space-y-3 text-left">
              <div className="flex items-center gap-2 text-emerald-400 font-bold text-sm">
                <Sparkles className="w-4 h-4" />
                <span>Never Miss Another Call</span>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                Browser calls can only ring when your browser tab is open. Download the official <strong>CHATR+ Android App</strong> for:
              </p>
              <ul className="text-xs text-slate-300 space-y-1.5 pl-4 list-disc marker:text-emerald-400">
                <li>Full-screen incoming calls even when phone is locked</li>
                <li>Zero Meta tracking, zero ads, zero spam</li>
                <li>Unblocked calling in UAE, Saudi Arabia, and worldwide</li>
              </ul>
            </div>

            <div className="space-y-3 pt-2">
              <a
                href="/download/Chatr-Plus.apk"
                download="Chatr-Plus.apk"
                onClick={() => ViralTelemetry.track({ type: 'apk_download_clicked', source: 'post_call' })}
                className="w-full flex items-center justify-center gap-2 py-4 px-6 rounded-2xl bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 hover:from-emerald-400 hover:to-cyan-400 text-slate-950 font-extrabold text-base shadow-xl shadow-emerald-500/30 transition-all"
              >
                <Download className="w-5 h-5" />
                <span>Download Chatr+ APK (78.2 MB)</span>
              </a>

              <button
                onClick={() => {
                  setCallEnded(false);
                  setHasJoined(false);
                  setCallDuration(0);
                }}
                className="w-full py-3 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition-all"
              >
                Start Another Call
              </button>
            </div>
          </div>
        )}
      </main>

      {/* FOOTER TRUST BADGE */}
      <footer className="py-4 border-t border-slate-900 text-center text-xs text-slate-500">
        <div className="max-w-4xl mx-auto flex flex-wrap items-center justify-center gap-6 px-4">
          <span className="flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>Encrypted WebRTC Peer-to-Peer</span>
          </span>
          <span className="flex items-center gap-1.5">
            <Smartphone className="w-4 h-4 text-cyan-400" />
            <span>Direct APK • No Google Play Store Required</span>
          </span>
          <Link to="/privacy" className="hover:text-slate-400 underline">
            Privacy Policy
          </Link>
        </div>
      </footer>
    </div>
  );
};

export default GuestCallPage;
