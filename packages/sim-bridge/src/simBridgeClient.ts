/**
 * CHATR Simulation Bridge Client — Gate 8.5
 *
 * WebSocket client connecting RobotOS to the sim-server physics engine.
 * Implements:
 *   - Persistent WebSocket with exponential backoff reconnection
 *   - SimBridgeGuard: BLOCKS all motion skills when disconnected
 *   - State subscription (50 Hz push from server)
 *   - JSON-RPC 2.0 request/response correlation
 */

import {
  SimBridgeState,
  SimServerInfo,
  SimConnectionState,
  SimCommand,
  SimFaultType,
  SimGuardResult,
  SimProvenance,
} from './types';

export const SIM_BRIDGE_WS_URL = 'ws://localhost:7788';
const RECONNECT_BASE_MS = 1000;
const RECONNECT_MAX_MS  = 15000;
const HEARTBEAT_INTERVAL_MS = 5000;

type StateListener = (state: SimBridgeState) => void;
type ConnectionListener = (state: SimConnectionState) => void;

let _reqId = 0;
const pendingRequests = new Map<number, {
  resolve: (v: unknown) => void;
  reject: (e: Error) => void;
}>();

class SimBridgeClientImpl {
  private ws: WebSocket | null = null;
  private connectionState: SimConnectionState = 'DISCONNECTED';
  private latestState: SimBridgeState | null = null;
  private serverInfo: SimServerInfo | null = null;

  private stateListeners    = new Set<StateListener>();
  private connectionListeners = new Set<ConnectionListener>();

  private reconnectAttempts = 0;
  private reconnectTimer: ReturnType<typeof setTimeout> | null = null;
  private heartbeatTimer: ReturnType<typeof setInterval> | null = null;
  private shouldReconnect = true;

  // ── Connection lifecycle
  connect(url: string = SIM_BRIDGE_WS_URL): void {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) return;
    this.shouldReconnect = true;
    this._connect(url);
  }

  private _connect(url: string): void {
    this._setConnectionState('CONNECTING');
    try {
      this.ws = new WebSocket(url);

      this.ws.onopen = async () => {
        console.info('[SimBridge] Connected to physics engine:', url);
        this.reconnectAttempts = 0;
        this._setConnectionState('CONNECTED');
        this._startHeartbeat();

        // Fetch server info immediately on connect
        try {
          this.serverInfo = await this.getServerInfo();
          console.info(`[SimBridge] Physics: ${this.serverInfo.physics_version} | DOF: ${this.serverInfo.joint_count} | Hash: ${this.serverInfo.profile_hash.slice(0, 12)}...`);
        } catch {
          console.warn('[SimBridge] Failed to fetch server info');
        }
      };

      this.ws.onmessage = (event: MessageEvent) => {
        try {
          const msg = JSON.parse(event.data as string) as Record<string, unknown>;

          // Push event from server (state broadcast)
          if (msg.event === 'state_update' && msg.data) {
            this.latestState = msg.data as SimBridgeState;
            this.stateListeners.forEach(l => l(this.latestState!));
            return;
          }

          // JSON-RPC response
          if (msg.id !== undefined) {
            const req = pendingRequests.get(msg.id as number);
            if (req) {
              pendingRequests.delete(msg.id as number);
              if (msg.error) {
                req.reject(new Error((msg.error as {message: string}).message));
              } else {
                req.resolve(msg.result);
              }
            }
          }
        } catch (e) {
          console.error('[SimBridge] Message parse error:', e);
        }
      };

      this.ws.onerror = (e) => {
        console.warn('[SimBridge] WebSocket error:', e);
      };

      this.ws.onclose = () => {
        this._stopHeartbeat();
        if (this.shouldReconnect) {
          this._setConnectionState('RECONNECTING');
          this._scheduleReconnect(url);
        } else {
          this._setConnectionState('DISCONNECTED');
        }
        // Reject all pending requests
        for (const [, req] of pendingRequests) {
          req.reject(new Error('SIMULATION_AUTHORITY_UNAVAILABLE'));
        }
        pendingRequests.clear();
      };
    } catch (e) {
      this._setConnectionState('FAILED');
      if (this.shouldReconnect) this._scheduleReconnect(url);
    }
  }

  disconnect(): void {
    this.shouldReconnect = false;
    this._stopHeartbeat();
    if (this.reconnectTimer) clearTimeout(this.reconnectTimer);
    this.ws?.close();
    this.ws = null;
    this._setConnectionState('DISCONNECTED');
  }

  private _scheduleReconnect(url: string): void {
    const delay = Math.min(
      RECONNECT_BASE_MS * Math.pow(1.5, this.reconnectAttempts),
      RECONNECT_MAX_MS
    );
    this.reconnectAttempts++;
    console.info(`[SimBridge] Reconnecting in ${(delay / 1000).toFixed(1)}s (attempt ${this.reconnectAttempts})...`);
    this.reconnectTimer = setTimeout(() => this._connect(url), delay);
  }

  private _startHeartbeat(): void {
    this.heartbeatTimer = setInterval(async () => {
      try {
        await this._rpc('ping', {});
      } catch {
        // Heartbeat failure — onclose will handle reconnect
      }
    }, HEARTBEAT_INTERVAL_MS);
  }

  private _stopHeartbeat(): void {
    if (this.heartbeatTimer) {
      clearInterval(this.heartbeatTimer);
      this.heartbeatTimer = null;
    }
  }

  private _setConnectionState(state: SimConnectionState): void {
    this.connectionState = state;
    this.connectionListeners.forEach(l => l(state));
  }

  // ── JSON-RPC core
  private _rpc<T>(method: string, params: Record<string, unknown> = {}): Promise<T> {
    return new Promise((resolve, reject) => {
      if (!this.ws || this.ws.readyState !== WebSocket.OPEN) {
        reject(new Error('SIMULATION_AUTHORITY_UNAVAILABLE'));
        return;
      }
      const id = ++_reqId;
      pendingRequests.set(id, { resolve: resolve as (v: unknown) => void, reject });
      this.ws.send(JSON.stringify({ id, method, params }));
      // Timeout after 5s
      setTimeout(() => {
        if (pendingRequests.has(id)) {
          pendingRequests.delete(id);
          reject(new Error(`RPC timeout: ${method}`));
        }
      }, 5000);
    });
  }

  // ── Public API
  getConnectionState(): SimConnectionState { return this.connectionState; }
  getLatestState(): SimBridgeState | null   { return this.latestState; }
  getServerInfo_cached(): SimServerInfo | null { return this.serverInfo; }

  async getState(): Promise<SimBridgeState> {
    return this._rpc<SimBridgeState>('get_state');
  }

  async getServerInfo(): Promise<SimServerInfo> {
    return this._rpc<SimServerInfo>('get_server_info');
  }

  async step(jointTargets: Record<string, number>): Promise<SimBridgeState> {
    return this._rpc<SimBridgeState>('step', { joint_targets: jointTargets });
  }

  async reset(seed = 42, scene = 'household_01'): Promise<SimBridgeState> {
    return this._rpc<SimBridgeState>('reset', { seed, scene });
  }

  async navigate(target: string): Promise<SimBridgeState> {
    return this._rpc<SimBridgeState>('navigate', { target });
  }

  async graspBottle(): Promise<SimBridgeState> {
    return this._rpc<SimBridgeState>('grasp_bottle', {});
  }

  async releaseBottle(): Promise<SimBridgeState> {
    return this._rpc<SimBridgeState>('release_bottle', {});
  }

  async wave(): Promise<SimBridgeState> {
    return this._rpc<SimBridgeState>('wave', {});
  }

  async teleop(vx: number, vy: number, vyaw: number): Promise<SimBridgeState> {
    return this._rpc<SimBridgeState>('teleop', { vx, vy, vyaw });
  }

  async dance(): Promise<SimBridgeState> {
    return this._rpc<SimBridgeState>('dance', {});
  }

  async stand(): Promise<SimBridgeState> {
    return this._rpc<SimBridgeState>('stand', {});
  }

  async recoverBalance(): Promise<SimBridgeState> {
    return this._rpc<SimBridgeState>('recover_balance', {});
  }

  async executeTask(taskType = 'FETCH_OBJECT', target = 'water_bottle_01'): Promise<SimBridgeState> {
    return this._rpc<SimBridgeState>('execute_task', { task_type: taskType, target });
  }

  async injectFault(type: SimFaultType, params: Record<string, unknown> = {}): Promise<void> {
    await this._rpc('inject_fault', { type, ...params });
  }

  // ── SimBridgeGuard — THE CRITICAL GATE
  /**
   * Returns SIMULATION_AUTHORITY_ONLINE only when:
   * 1. WebSocket is connected
   * 2. Latest state has MUJOCO_PHYSICS or ISAAC_SIM_PHYSICS provenance
   * 3. Robot is not fallen
   *
   * Motion skills MUST call this before returning isSuccessful: true.
   * If SIMULATION_AUTHORITY_UNAVAILABLE → return FAILED, do NOT complete.
   */
  guard(): SimGuardResult {
    return this.getGuardDiagnostic().status;
  }

  getGuardDiagnostic(): { status: SimGuardResult; reason: string } {
    if (this.connectionState !== 'CONNECTED') {
      return { status: 'SIMULATION_AUTHORITY_UNAVAILABLE', reason: `WEBSOCKET_${this.connectionState} (ws://localhost:7788)` };
    }
    const state = this.latestState;
    if (!state) {
      return { status: 'SIMULATION_AUTHORITY_UNAVAILABLE', reason: 'AWAITING_FIRST_STATE_PACKET' };
    }
    if (state.provenance === 'STUB_NO_MUJOCO') {
      return { status: 'SIMULATION_AUTHORITY_UNAVAILABLE', reason: 'STUB_PROVENANCE_NOT_PHYSICAL' };
    }
    if (state.is_fallen) {
      return { status: 'SIMULATION_AUTHORITY_UNAVAILABLE', reason: `ROBOT_FALLEN (pelvis z=${state.base_pose.position.z.toFixed(2)}m < 0.50m)` };
    }
    return { status: 'SIMULATION_AUTHORITY_ONLINE', reason: 'ALL_PHYSICAL_SYSTEMS_NOMINAL' };
  }


  // ── Subscriptions
  onStateUpdate(listener: StateListener): () => void {
    this.stateListeners.add(listener);
    return () => this.stateListeners.delete(listener);
  }

  onConnectionChange(listener: ConnectionListener): () => void {
    this.connectionListeners.add(listener);
    return () => this.connectionListeners.delete(listener);
  }
}

// ── Singleton export
export const SimBridgeClient = new SimBridgeClientImpl();
export type { SimBridgeState, SimServerInfo, SimConnectionState, SimGuardResult };
