import { EventBus, CommunicationEvent } from '../core/EventBus';

const CLOUDFLARE_TURN: RTCIceServer = {
  urls: [
    'stun:stun.cloudflare.com:3478',
    'turn:turn.cloudflare.com:3478?transport=udp',
    'turn:turn.cloudflare.com:3478?transport=tcp',
    'turns:turn.cloudflare.com:5349?transport=tcp'
  ],
  username: 'g0c53265fd3d77b1917f9d26a934e34f4cc2e358d65733e4285a7be2e4344489',
  credential: '5969d5f8b822bcd5a43c3c5257fd9cbca7a787db37e20aa1602746f6b77a393a'
};

const METERED_FREE: RTCIceServer = {
  urls: [
    'turns:a.relay.metered.ca:443?transport=tcp',
    'turn:a.relay.metered.ca:443?transport=tcp',
    'turn:a.relay.metered.ca:80',
    'turn:a.relay.metered.ca:80?transport=tcp',
  ],
  username: 'e8dd65c92ae9a3b9bfcbeb6e',
  credential: 'uWdWNmkhvyqTW1QP',
};

const OPENRELAY_FREE: RTCIceServer = {
  urls: [
    'turn:openrelay.metered.ca:80',
    'turn:openrelay.metered.ca:443',
    'turn:openrelay.metered.ca:443?transport=tcp',
    'turns:openrelay.metered.ca:443?transport=tcp',
  ],
  username: 'openrelayproject',
  credential: 'openrelayproject',
};

const DEFAULT_ICE_SERVERS: RTCIceServer[] = [
  { urls: 'stun:stun.l.google.com:19302' },
  { urls: 'stun:stun1.l.google.com:19302' },
  { urls: 'stun:stun2.l.google.com:19302' },
  { urls: 'stun:stun.cloudflare.com:3478' },
  METERED_FREE,
  OPENRELAY_FREE,
];

export class WebRTCEngine {
  private peerConnection: RTCPeerConnection | null = null;
  private onIceCandidate: ((candidate: RTCIceCandidate) => void) | null = null;
  private onTrackCallback: ((stream: MediaStream, track: MediaStreamTrack) => void) | null = null;
  private onConnectionStateChangeCallback: ((state: string) => void) | null = null;
  private iceCandidateBuffer: RTCIceCandidateInit[] = [];
  private syntheticStream: MediaStream | null = null;

  constructor(private config?: RTCConfiguration) {}

  public setOnConnectionStateChange(callback: (state: string) => void) {
    this.onConnectionStateChangeCallback = callback;
  }

  public init() {
    if (this.peerConnection) {
      this.peerConnection.close();
    }

    const rtcConfig: RTCConfiguration = this.config?.iceServers?.length
      ? this.config
      : { iceServers: DEFAULT_ICE_SERVERS, iceCandidatePoolSize: 10 };

    this.peerConnection = new RTCPeerConnection(rtcConfig);

    this.peerConnection.onicecandidate = (event) => {
      if (event.candidate && this.onIceCandidate) {
        this.onIceCandidate(event.candidate);
      }
    };

    this.peerConnection.ontrack = (event) => {
      let stream = event.streams && event.streams[0];
      if (!stream) {
        if (!this.syntheticStream) {
          this.syntheticStream = new MediaStream();
        }
        this.syntheticStream.addTrack(event.track);
        stream = new MediaStream(this.syntheticStream.getTracks());
        this.syntheticStream = stream;
      }
      if (this.onTrackCallback) {
        this.onTrackCallback(stream, event.track);
      }
    };

    this.peerConnection.onconnectionstatechange = () => {
      const state = this.peerConnection?.connectionState;
      console.log('[WebRTC] Connection state:', state);
      if (state) {
        this.onConnectionStateChangeCallback?.(state);
      }
      if (state === 'connected') {
        EventBus.getInstance().emit(CommunicationEvent.CALL_CONNECTED);
      } else if (state === 'failed' || state === 'disconnected') {
        EventBus.getInstance().emit(CommunicationEvent.CALL_FAILED);
      }
    };

    this.peerConnection.oniceconnectionstatechange = () => {
      const state = this.peerConnection?.iceConnectionState;
      console.log('[WebRTC] ICE Connection state:', state);
      if (state === 'connected' || state === 'completed') {
        EventBus.getInstance().emit(CommunicationEvent.CALL_CONNECTED);
      } else if (state === 'failed') {
        EventBus.getInstance().emit(CommunicationEvent.CALL_FAILED);
      }
    };

    this.peerConnection.onicegatheringstatechange = () => {
      console.log('[WebRTC] ICE gathering state:', this.peerConnection?.iceGatheringState);
    };
  }

  public ensureInitialized() {
    if (!this.peerConnection || this.peerConnection.signalingState === 'closed') {
      this.init();
    }
  }

  public setOnIceCandidate(callback: (candidate: RTCIceCandidate) => void) {
    this.onIceCandidate = callback;
  }

  public setOnTrack(callback: (stream: MediaStream, track: MediaStreamTrack) => void) {
    this.onTrackCallback = callback;
  }

  public addStream(stream: MediaStream) {
    this.ensureInitialized();
    stream.getTracks().forEach((track) => {
      this.peerConnection!.addTrack(track, stream);
    });

    // Ensure audio & video transceivers exist
    const hasAudio = this.peerConnection!.getSenders().some(s => s.track?.kind === 'audio');
    if (!hasAudio) {
      try { this.peerConnection!.addTransceiver('audio', { direction: 'sendrecv' }); } catch {}
    }
    const hasVideo = this.peerConnection!.getSenders().some(s => s.track?.kind === 'video');
    if (!hasVideo) {
      try { this.peerConnection!.addTransceiver('video', { direction: 'sendrecv' }); } catch {}
    }
  }

  public async createOffer(): Promise<RTCSessionDescriptionInit> {
    this.ensureInitialized();
    const offer = await this.peerConnection!.createOffer({
      offerToReceiveAudio: true,
      offerToReceiveVideo: true,
    });
    await this.peerConnection!.setLocalDescription(offer);
    return offer;
  }

  public getSignalingState(): string {
    return this.peerConnection?.signalingState || 'closed';
  }

  public async rollback() {
    if (this.peerConnection && this.peerConnection.signalingState !== 'stable') {
      await this.peerConnection.setLocalDescription({ type: 'rollback' });
    }
  }

  public async handleRemoteOffer(offer: RTCSessionDescriptionInit) {
    this.ensureInitialized();
    await this.peerConnection!.setRemoteDescription(new RTCSessionDescription(offer));
    // Drain buffered ICE candidates
    for (const c of this.iceCandidateBuffer) {
      try {
        await this.peerConnection!.addIceCandidate(new RTCIceCandidate(c));
      } catch (err) {
        console.warn('[WebRTC] Buffered ICE candidate failed:', err);
      }
    }
    this.iceCandidateBuffer = [];
  }

  public async createAnswer(): Promise<RTCSessionDescriptionInit> {
    this.ensureInitialized();
    const answer = await this.peerConnection!.createAnswer();
    await this.peerConnection!.setLocalDescription(answer);
    return answer;
  }

  public async handleRemoteAnswer(answer: RTCSessionDescriptionInit) {
    if (!this.peerConnection) throw new Error('[WebRTC] No peer connection to handle answer');
    // Guard: if already stable, the answer was already applied (e.g. via WebSocket + polling duplicate)
    if (this.peerConnection.signalingState === 'stable') {
      console.warn('[WebRTC] Ignoring duplicate answer — already in stable state');
      return;
    }
    await this.peerConnection.setRemoteDescription(new RTCSessionDescription(answer));
    // Drain buffered ICE candidates
    for (const c of this.iceCandidateBuffer) {
      try {
        await this.peerConnection!.addIceCandidate(new RTCIceCandidate(c));
      } catch (err) {
        console.warn('[WebRTC] Buffered ICE candidate failed on answer:', err);
      }
    }
    this.iceCandidateBuffer = [];
  }

  public async handleIceCandidate(candidate: RTCIceCandidateInit) {
    if (this.peerConnection?.remoteDescription) {
      try {
        await this.peerConnection.addIceCandidate(new RTCIceCandidate(candidate));
      } catch (err) {
        console.warn('[WebRTC] Add ICE candidate failed:', err);
      }
    } else {
      this.iceCandidateBuffer.push(candidate);
    }
  }

  public close() {
    this.peerConnection?.close();
    this.peerConnection = null;
    this.iceCandidateBuffer = [];
  }
}
