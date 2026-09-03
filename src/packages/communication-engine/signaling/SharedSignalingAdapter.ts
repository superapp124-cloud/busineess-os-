import { SignalingProvider, SignalingMessage, CallLifecycleMessage } from '../interfaces/SignalingProvider';
import { RealtimeChannel } from '@supabase/supabase-js';

export interface SharedAdapterConfig {
  subscribeByCallId?: string; // If set, listens to `call_id=eq.{callId}` instead of `to_user=eq.{userId}`
}

/**
 * A shared compatibility layer for both Desktop (GroupCallManager) and Mobile (SimpleWebRTC) stacks.
 * It normalizes protocol differences (message shapes, database schema mapping) so that both 
 * engines can interoperate without needing to modify their internal logic.
 */
export class SupabaseSignalingAdapter implements SignalingProvider {
  private supabase: any;
  private userId: string = '';
  private config: SharedAdapterConfig;
  
  private onSignalCallback: ((callId: string, message: SignalingMessage) => void) | null = null;
  private onCallStateCallback: ((state: CallLifecycleMessage) => void) | null = null;
  
  private signalsChannel: RealtimeChannel | null = null;
  private callsChannel: RealtimeChannel | null = null;
  private processedSignalIds: Set<string> = new Set();
  private signalPollingInterval: NodeJS.Timeout | null = null;

  constructor(supabaseClient: any, config: SharedAdapterConfig = {}) {
    this.supabase = supabaseClient;
    this.config = config;
  }

  public async connect(userId: string): Promise<void> {
    this.userId = userId;

    const filter = this.config.subscribeByCallId 
      ? `call_id=eq.${this.config.subscribeByCallId}`
      : `to_user=eq.${userId}`;

    const channelName = this.config.subscribeByCallId 
      ? `webrtc-shared-${this.config.subscribeByCallId}-${userId}`
      : `webrtc-shared-signals-${userId}`;

    this.signalsChannel = this.supabase.channel(channelName)
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'webrtc_signals', filter },
        (payload: any) => {
          const row = payload.new;
          
          if (this.config.subscribeByCallId && row.to_user !== this.userId) {
            return;
          }

          if (row.id && this.processedSignalIds.has(row.id)) {
            return;
          }
          if (row.id) this.processedSignalIds.add(row.id);

          this.dispatchSignal(row);
        }
      )
      .subscribe();

    // Listen for call lifecycle state changes (e.g. ringing, ended) directed to me
    this.callsChannel = this.supabase.channel(`call-lifecycle-shared-${userId}`)
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'calls', filter: `receiver_id=eq.${userId}` },
        (payload: any) => this.handleCallChange(payload.new)
      )
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'calls', filter: `receiver_id=eq.${userId}` },
        (payload: any) => this.handleCallChange(payload.new)
      )
      .subscribe();

    // Fetch existing/pending signals and start fallback polling
    this.pollSignals();
    this.startSignalPolling();
  }

  private dispatchSignal(row: any) {
    if (this.onSignalCallback) {
      const type = row.signal_type === 'ice-candidate' ? 'ice' : row.signal_type;
      const sdp = row.signal_type === 'offer' || row.signal_type === 'answer' ? row.signal_data : undefined;
      const candidate = row.signal_type === 'ice-candidate' || row.signal_type === 'ice' ? row.signal_data : undefined;
      const roomId = row.room_id || row.signal_data?.__chatr?.roomId;

      this.onSignalCallback(row.call_id, {
        type: type as any,
        sdp: sdp,
        candidate: candidate,
        from: row.from_user,
        roomId,
        rawPayload: row, 
      } as any);
    }
  }

  private async pollSignals() {
    if (!this.userId) return;
    try {
      const cutoff = new Date(Date.now() - 60000).toISOString();
      let query = this.supabase
        .from('webrtc_signals')
        .select('*')
        .eq('to_user', this.userId)
        .gte('created_at', cutoff)
        .order('created_at', { ascending: false })
        .limit(50);

      if (this.config.subscribeByCallId) {
        query = query.eq('call_id', this.config.subscribeByCallId);
      }

      const { data: signals, error } = await query;
      if (error) {
        console.warn('[SharedSignalingAdapter] Signal poll error:', error.message);
        return;
      }
      if (signals && signals.length > 0) {
        // Dispatch in chronological order (oldest first)
        const reversed = [...signals].reverse();
        for (const signal of reversed) {
          if (!this.processedSignalIds.has(signal.id)) {
            this.processedSignalIds.add(signal.id);
            this.dispatchSignal(signal);
          }
        }
      }
    } catch (err) {
      console.warn('[SharedSignalingAdapter] Signal poll exception:', err);
    }
  }

  private startSignalPolling() {
    if (this.signalPollingInterval) clearInterval(this.signalPollingInterval);
    this.signalPollingInterval = setInterval(() => {
      this.pollSignals();
    }, 1000); // 1-second fallback poll interval for fast negotiation
  }

  private handleCallChange(row: any) {
    if (this.onCallStateCallback) {
      this.onCallStateCallback({
        callId: row.id,
        status: row.status,
      });
    }
  }

  public onSignal(callback: (callId: string, message: SignalingMessage) => void): void {
    this.onSignalCallback = callback;
  }

  public onCallState(callback: (state: CallLifecycleMessage) => void): void {
    this.onCallStateCallback = callback;
  }

  public async sendSignal(targetUserId: string, callId: string, message: any): Promise<void> {
    const isUuid = (val: string) => /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(val);
    if (!isUuid(this.userId) || !isUuid(targetUserId)) {
      console.warn('[SharedSignalingAdapter] Skipping insert: from_user or to_user is not a valid UUID:', this.userId, targetUserId);
      return;
    }

    let signalType = message.type as string;
    let signalData: any;

    if (message.type === 'ice') {
      signalType = 'ice-candidate';
      signalData = message.candidate;
    } else if (message.type === 'offer' || message.type === 'answer') {
      signalData = message.sdp;
    } else {
      signalData = message.rawPayload?.signal_data || { timestamp: Date.now() }; 
    }

    console.log(`[SharedSignalingAdapter] 📤 Sending ${signalType} to ${targetUserId} (call: ${callId})`);

    try {
      const { error } = await this.supabase.from('webrtc_signals').insert([{
        call_id: callId,
        from_user: this.userId,
        to_user: targetUserId,
        signal_type: signalType,
        signal_data: signalData
      }]);

      if (error) {
        console.error(`[SharedSignalingAdapter] ❌ Failed to send ${signalType}:`, error.message);
      } else {
        console.log(`[SharedSignalingAdapter] ✅ Sent ${signalType} to ${targetUserId}`);
      }
    } catch (err) {
      console.error(`[SharedSignalingAdapter] ❌ Exception sending ${signalType}:`, err);
    }
  }

  public async updateCallState(callId: string, callerId: string, receiverId: string, status: CallLifecycleMessage['status'], callType?: string): Promise<void> {
    const isUuid = (val: string) => /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(val);
    if (!isUuid(callerId) || !isUuid(receiverId)) {
      console.warn('[SharedSignalingAdapter] Skipping updateCallState: callerId or receiverId is not a valid UUID:', callerId, receiverId);
      return;
    }
    try {
      const updateData: any = { status };
      if (callType) {
        updateData.call_type = callType;
      }
      const { error } = await this.supabase
        .from('calls')
        .update(updateData)
        .eq('id', callId);
        
      if (error) {
        console.error('[SharedSignalingAdapter] Failed to update call state:', error);
      }
    } catch (err) {
      console.error('[SharedSignalingAdapter] Exception while updating call state:', err);
    }
  }

  public disconnect(): void {
    if (this.signalPollingInterval) {
      clearInterval(this.signalPollingInterval);
      this.signalPollingInterval = null;
    }
    if (this.signalsChannel) this.supabase.removeChannel(this.signalsChannel);
    if (this.callsChannel) this.supabase.removeChannel(this.callsChannel);
    this.signalsChannel = null;
    this.callsChannel = null;
    this.processedSignalIds.clear();
  }
}
