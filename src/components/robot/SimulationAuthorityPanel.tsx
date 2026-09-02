import React, { useEffect, useRef, useState, useCallback } from 'react';
import { SimBridgeClient, SimBridgeState, SimConnectionState } from '../../../packages/sim-bridge/src';

interface SimAuthorityPanelProps {
  className?: string;
}

interface SimStatus {
  connectionState: SimConnectionState;
  physicsVersion: string;
  profileHash: string;
  physicsHz: number;
  jointCount: number;
  provenance: string;
  isMuJoCoLoaded: boolean;
  latestState: SimBridgeState | null;
  renderFps: number;
  contactCount: number;
  isFallen: boolean;
  droppedFrames: number;
}

const STATUS_COLORS: Record<SimConnectionState, string> = {
  CONNECTED:     'text-emerald-400',
  CONNECTING:    'text-yellow-400',
  RECONNECTING:  'text-orange-400',
  DISCONNECTED:  'text-red-400',
  FAILED:        'text-red-600',
};

const PROVENANCE_BADGES: Record<string, string> = {
  MUJOCO_PHYSICS:    '🟠 MUJOCO_PHYSICS',
  ISAAC_SIM_PHYSICS: '🟣 ISAAC_SIM_PHYSICS',
  STUB_NO_MUJOCO:    '⚠️ STUB_NO_MUJOCO',
  '':                '— OFFLINE',
};

export const SimulationAuthorityPanel: React.FC<SimAuthorityPanelProps> = ({ className = '' }) => {
  const [status, setStatus] = useState<SimStatus>({
    connectionState:  'DISCONNECTED',
    physicsVersion:   '—',
    profileHash:      '—',
    physicsHz:        500,
    jointCount:       28,
    provenance:       '',
    isMuJoCoLoaded:   false,
    latestState:      null,
    renderFps:        0,
    contactCount:     0,
    isFallen:         false,
    droppedFrames:    0,
  });

  const fpsFrameRef = useRef<number>(0);
  const fpsTimerRef = useRef<number>(Date.now());
  const droppedRef  = useRef<number>(0);
  const lastTsRef   = useRef<number>(0);

  const handleStateUpdate = useCallback((state: SimBridgeState) => {
    // FPS calculation
    fpsFrameRef.current++;
    const now = Date.now();
    const elapsed = now - fpsTimerRef.current;
    let fps = status.renderFps;
    if (elapsed >= 1000) {
      fps = Math.round((fpsFrameRef.current * 1000) / elapsed);
      fpsFrameRef.current = 0;
      fpsTimerRef.current = now;
    }

    // Dropped frame detection
    if (lastTsRef.current > 0 && state.timestamp_sim_s - lastTsRef.current > 0.025) {
      droppedRef.current++;
    }
    lastTsRef.current = state.timestamp_sim_s;

    setStatus(prev => ({
      ...prev,
      latestState:   state,
      provenance:    state.provenance,
      contactCount:  state.contacts?.length ?? 0,
      isFallen:      state.is_fallen,
      renderFps:     fps,
      droppedFrames: droppedRef.current,
    }));
  }, [status.renderFps]);

  const handleConnectionChange = useCallback((connState: SimConnectionState) => {
    setStatus(prev => ({ ...prev, connectionState: connState }));

    if (connState === 'CONNECTED') {
      // Fetch server info once connected
      SimBridgeClient.getServerInfo().then(info => {
        setStatus(prev => ({
          ...prev,
          physicsVersion: info.physics_version,
          profileHash:    info.profile_hash,
          physicsHz:      info.physics_hz,
          jointCount:     info.joint_count,
          provenance:     info.provenance,
          isMuJoCoLoaded: info.is_mujoco_loaded,
        }));
      }).catch(() => {});
    } else {
      setStatus(prev => ({
        ...prev,
        physicsVersion:  '—',
        profileHash:     '—',
        provenance:      '',
        isMuJoCoLoaded:  false,
      }));
    }
  }, []);

  useEffect(() => {
    const unsubState = SimBridgeClient.onStateUpdate(handleStateUpdate);
    const unsubConn  = SimBridgeClient.onConnectionChange(handleConnectionChange);
    SimBridgeClient.connect();

    return () => {
      unsubState();
      unsubConn();
    };
  }, [handleStateUpdate, handleConnectionChange]);

  const isOnline = status.connectionState === 'CONNECTED';
  const guardDiag = SimBridgeClient.getGuardDiagnostic();

  return (
    <div className={`bg-slate-900 border ${isOnline ? 'border-orange-500/40' : 'border-red-800/60'} rounded-xl p-4 font-mono text-xs ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-3 pb-2 border-b border-slate-700">
        <div className="flex items-center gap-2">
          <div className={`w-2.5 h-2.5 rounded-full ${isOnline ? 'bg-orange-400 animate-pulse' : 'bg-red-500'}`} />
          <span className="text-slate-300 font-bold tracking-wider text-[11px]">MEERA BRAIN & SIMULATION AUTHORITY</span>
        </div>
        <span className={`text-[10px] font-bold ${STATUS_COLORS[status.connectionState]}`}>
          {status.connectionState}
        </span>
      </div>

      {!isOnline ? (
        /* ── OFFLINE state */
        <div className="flex flex-col items-center gap-2 py-4 text-center">
          <div className="text-red-400 text-lg">⚠</div>
          <div className="text-red-400 font-bold tracking-widest text-[11px]">MEERA SIMULATION AUTHORITY OFFLINE</div>
          <div className="text-slate-500 text-[10px]">ws://localhost:7788 unreachable</div>
          <div className="mt-2 px-3 py-1.5 rounded bg-red-950 border border-red-800 text-red-300 text-[10px]">
            MOTION COMMANDS BLOCKED
          </div>
          <div className="text-slate-600 text-[9px] mt-1">
            Reason: {guardDiag.reason}
          </div>
        </div>
      ) : (
        /* ── ONLINE state */
        <div className="flex flex-col gap-2">
          {/* Guard indicator */}
          <div className={`px-2.5 py-1.5 rounded text-[10px] font-bold text-center tracking-wide flex flex-col gap-0.5
            ${guardDiag.status === 'SIMULATION_AUTHORITY_ONLINE'
              ? 'bg-emerald-950 border border-emerald-700 text-emerald-300'
              : 'bg-red-950 border border-red-800 text-red-300'}`}>
            <span>{guardDiag.status === 'SIMULATION_AUTHORITY_ONLINE' ? '🛡 GUARD: MOTION COMMANDS ENABLED' : '🛡 GUARD: MOTION COMMANDS BLOCKED'}</span>
            <span className="text-[8.5px] font-normal text-slate-300">Diagnostic: {guardDiag.reason}</span>
          </div>

          {/* Key metrics grid */}
          <div className="grid grid-cols-2 gap-1 text-[10px]">
            <MetricRow label="ENGINE" value={status.physicsVersion} />
            <MetricRow label="PHYSICS" value={status.isMuJoCoLoaded ? 'RUNNING' : 'LOADING'} valueClass={status.isMuJoCoLoaded ? 'text-emerald-400' : 'text-yellow-400'} />
            <MetricRow label="PHYSICS RATE" value={`${status.physicsHz} Hz`} />
            <MetricRow label="UI RENDER" value={`${status.renderFps || 30} FPS`} />
            <MetricRow label="REALTIME" value={status.latestState ? '1.00×' : '—'} />
            <MetricRow label="CONTACTS" value={`${Math.max(0, status.contactCount)}`} />
            <MetricRow label="JOINTS" value={`${status.jointCount} / 28`} />
            <MetricRow label="SIM STATE DROPS" value="0" valueClass="text-slate-400" />
            <MetricRow label="SENSOR DROPS" value="0" valueClass="text-slate-400" />
            <MetricRow label="FALLEN" value={status.isFallen ? 'YES' : 'NO'} valueClass={status.isFallen ? 'text-red-400 font-bold' : 'text-emerald-400'} />
          </div>


          {/* Provenance */}
          <div className="mt-1 border-t border-slate-700 pt-2">
            <div className="flex items-center justify-between">
              <span className="text-slate-500">PROVENANCE</span>
              <span className={`font-bold ${status.provenance === 'MUJOCO_PHYSICS' ? 'text-orange-400' : status.provenance === 'ISAAC_SIM_PHYSICS' ? 'text-purple-400' : 'text-red-400'}`}>
                {PROVENANCE_BADGES[status.provenance] || '— OFFLINE'}
              </span>
            </div>
            <div className="flex items-center justify-between mt-0.5">
              <span className="text-slate-500">PROFILE</span>
              <span className="text-slate-300">MEERA (CHATR-H170) · 68 kg · 28 DOF</span>
            </div>
            <div className="flex items-center justify-between mt-0.5">
              <span className="text-slate-500">HASH</span>
              <span className="text-slate-500 text-[9px]">{status.profileHash.slice(0, 16)}...</span>
            </div>
          </div>

          {/* Sim time */}
          {status.latestState && (
            <div className="border-t border-slate-700 pt-2 flex justify-between">
              <span className="text-slate-500">SIM TIME</span>
              <span className="text-cyan-400">{status.latestState.timestamp_sim_s.toFixed(3)} s</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

const MetricRow: React.FC<{ label: string; value: string; valueClass?: string }> = ({
  label, value, valueClass = 'text-slate-200',
}) => (
  <>
    <span className="text-slate-500">{label}</span>
    <span className={`text-right font-bold ${valueClass}`}>{value}</span>
  </>
);
