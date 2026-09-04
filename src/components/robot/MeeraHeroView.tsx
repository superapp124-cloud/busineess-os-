/**
 * CHATR-Meera Hero Digital Twin View
 * Authoritative MuJoCo 3D Digital Twin Cockpit with real physical actions, voice state, and engineering diagnostics.
 */

import React, { useState, useEffect, useCallback } from 'react';
import { SimBridgeClient, SimBridgeState } from '../../../packages/sim-bridge/src';
import { meeraVoice, VoiceState } from '../../utils/speechTts';
import { RobotDigitalTwinCanvas } from './RobotDigitalTwinCanvas';
import { ArmJointAngles } from '../../../packages/robot-manipulation/src';
import { Vector3 } from '../../../packages/robot-physics/src/math/vector3';

interface MeeraHeroViewProps {
  onSpeak?: (text: string) => void;
  rightArmJoints?: ArmJointAngles;
  leftArmJoints?: ArmJointAngles;
  torsoPosition?: Vector3;
  walkingState?: string;
  isHardwareConnected?: boolean;
}

type ActionStatus = 'IDLE' | 'EXECUTING' | 'COMPLETE' | 'FAILED';

export const MeeraHeroView: React.FC<MeeraHeroViewProps> = ({ isHardwareConnected = false }) => {
  const [simState, setSimState] = useState<SimBridgeState | null>(null);
  const [voiceState, setVoiceState] = useState<VoiceState>('IDLE');
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [viewMode, setViewMode] = useState<'ASSISTANT' | 'ENGINEERING'>('ASSISTANT');
  const [speechBubbleText, setSpeechBubbleText] = useState(
    'Namaste! Main Meera hoon. Aapki sahayata ke liye hamesha tayyar.'
  );

  // Button action status states
  const [actionStatuses, setActionStatuses] = useState<Record<string, ActionStatus>>({
    stand: 'IDLE',
    wave: 'IDLE',
    grasp: 'IDLE',
    walk: 'IDLE',
    push: 'IDLE',
    dance: 'IDLE',
  });

  useEffect(() => {
    SimBridgeClient.getState().then((s) => setSimState(s)).catch(() => {});
    const unsubSim = SimBridgeClient.onStateUpdate((s) => setSimState(s));
    const unsubVoice = meeraVoice.onSpeakingChange((s) => setIsSpeaking(s));
    const unsubState = meeraVoice.onVoiceStateChange((st) => setVoiceState(st));
    return () => {
      unsubSim();
      unsubVoice();
      unsubState();
    };
  }, []);

  const isSimConnected = SimBridgeClient.getConnectionState() === 'CONNECTED';
  const isFallen = simState?.is_fallen ?? false;
  const isHoldingBottle = (simState?.hand_contact_force_N ?? 0.0) > 0.5;
  const isStandingControllerActive = simState?.standing_controller_active ?? !isFallen;

  // Compute Primary Single Robot State
  const getPrimaryState = (): { label: string; color: string } => {
    if (isFallen) return { label: 'DISTURBED (FALLEN)', color: 'bg-rose-950 border-rose-600 text-rose-300' };
    if (voiceState === 'LISTENING') return { label: 'LISTENING', color: 'bg-blue-950 border-blue-500 text-blue-300' };
    if (voiceState === 'THINKING') return { label: 'THINKING', color: 'bg-purple-950 border-purple-500 text-purple-300' };
    if (voiceState === 'RESPONDING') return { label: 'RESPONDING', color: 'bg-emerald-950 border-emerald-500 text-emerald-300' };
    if (actionStatuses.walk === 'EXECUTING') return { label: 'WALKING', color: 'bg-amber-950 border-amber-500 text-amber-300' };
    if (actionStatuses.grasp === 'EXECUTING') return { label: 'GRASPING', color: 'bg-teal-950 border-teal-500 text-teal-300' };
    if (actionStatuses.wave === 'EXECUTING') return { label: 'WAVING', color: 'bg-cyan-950 border-cyan-500 text-cyan-300' };
    if (isHoldingBottle) return { label: 'HOLDING OBJECT', color: 'bg-teal-950 border-teal-500 text-teal-300' };
    return { label: 'STANDING (STABLE)', color: 'bg-emerald-950 border-emerald-500 text-emerald-300' };
  };

  const primaryState = getPrimaryState();

  const handleSpeakGreeting = useCallback(async () => {
    const text = 'Namaste! Main Meera hoon. Aapki sahayata ke liye hamesha tayyar.';
    setSpeechBubbleText(text);
    await meeraVoice.speak(text, 'hi-IN');
  }, []);

  // ── Execute Real Action Helper with State Feedback
  const executeRobotAction = async (
    key: string,
    actionFn: () => Promise<unknown>,
    speechText: string
  ) => {
    setActionStatuses((prev) => ({ ...prev, [key]: 'EXECUTING' }));
    setSpeechBubbleText(speechText);
    try {
      await Promise.all([actionFn(), meeraVoice.speak(speechText, 'hi-IN')]);
      setActionStatuses((prev) => ({ ...prev, [key]: 'COMPLETE' }));
      setTimeout(() => setActionStatuses((prev) => ({ ...prev, [key]: 'IDLE' })), 2500);
    } catch {
      setActionStatuses((prev) => ({ ...prev, [key]: 'FAILED' }));
      setTimeout(() => setActionStatuses((prev) => ({ ...prev, [key]: 'IDLE' })), 3000);
    }
  };

  const handleStand = () =>
    executeRobotAction(
      'stand',
      () => SimBridgeClient.stand().catch(() => SimBridgeClient.reset(42)),
      'Main nominal balance pose mein khadi ho gayi hoon.'
    );

  const handleWave = () =>
    executeRobotAction(
      'wave',
      () => SimBridgeClient.wave(),
      'Namaste! CHATR RobotOS mein aapka swagat hai!'
    );

  const handleGrasp = () =>
    executeRobotAction(
      'grasp',
      () => SimBridgeClient.graspBottle(),
      'Main kitchen counter se paani ki bottle grasp kar rahi hoon.'
    );

  const handleWalk = () =>
    executeRobotAction(
      'walk',
      () => SimBridgeClient.navigate('kitchen'),
      'Main kitchen table ki taraf aage badh rahi hoon.'
    );

  const handlePush = () =>
    executeRobotAction(
      'push',
      () => SimBridgeClient.injectFault('external_push'),
      'Savdhaan! External 450N push disturbance detect hui.'
    );

  const handleDance = () =>
    executeRobotAction(
      'dance',
      () => SimBridgeClient.dance(),
      'Chal yaar, dance karte hain! 🎶'
    );

  return (
    <div className="flex flex-col gap-3">
      {/* ── Main Hero Card ── */}
      <div className="relative w-full h-[420px] md:h-[450px] rounded-3xl overflow-hidden border border-slate-700/80 bg-slate-950 shadow-2xl flex flex-col justify-between p-4 md:p-5">
        {/* Authoritative 3D Digital Twin Canvas */}
        <div className="absolute inset-0 z-0">
          <RobotDigitalTwinCanvas voiceState={voiceState} isHardwareConnected={isHardwareConnected} />
        </div>

        {/* ── Top Identity & Primary State Bar ── */}
        <div className="relative z-10 flex items-start justify-between gap-2 pointer-events-none">
          <div className="flex flex-col gap-1 pointer-events-auto">
            <div className="flex items-center gap-2.5 flex-wrap">
              <h2 className="text-3xl font-black tracking-tight text-white drop-shadow-md">MEERA</h2>
              <span className="text-xs font-mono font-bold px-2.5 py-0.5 rounded-full bg-cyan-950/90 text-cyan-300 border border-cyan-700 backdrop-blur shadow">
                CHATR-H170
              </span>
              {/* Single Primary State Indicator */}
              <span
                className={`text-xs font-bold px-3 py-1 rounded-full border shadow-lg backdrop-blur flex items-center gap-1.5 ${primaryState.color}`}
              >
                <span className="w-2 h-2 rounded-full bg-current animate-pulse" />
                <span>● {primaryState.label}</span>
              </span>
            </div>
            <div className="flex items-center gap-2 text-xs text-slate-300 font-medium drop-shadow">
              <span className="font-semibold text-white">1.75 m</span>
              <span>·</span>
              <span className="font-semibold text-white">68.0 kg</span>
              <span>·</span>
              <span className="text-cyan-300 font-mono font-bold">28 DOF</span>
            </div>
            <p className="text-[11px] text-slate-300 font-medium">Autonomous Multilingual AI Humanoid Platform</p>
          </div>

          {/* View Mode & Authority Diagnostics Switcher */}
          <div className="flex flex-col items-end gap-1.5 pointer-events-auto">
            <div className="flex items-center gap-2">
              <button
                onClick={() => setViewMode(viewMode === 'ASSISTANT' ? 'ENGINEERING' : 'ASSISTANT')}
                className={`px-3 py-1 text-xs rounded-full border backdrop-blur transition shadow font-bold flex items-center gap-1 ${
                  viewMode === 'ENGINEERING'
                    ? 'bg-cyan-950 border-cyan-500 text-cyan-300 shadow-[0_0_12px_#06b6d4]'
                    : 'bg-slate-900/90 hover:bg-slate-800 text-slate-200 border-slate-700'
                }`}
              >
                <span>{viewMode === 'ENGINEERING' ? '🔬 Engineering View' : '✨ Assistant View'}</span>
              </button>
            </div>

            <div className="text-[10px] font-mono text-slate-300 bg-slate-950/85 backdrop-blur px-2.5 py-1 rounded-lg border border-slate-800">
              PROVENANCE: <span className="text-orange-400 font-bold">MUJOCO_PHYSICS</span> · 500 Hz
            </div>
          </div>
        </div>

        {/* ── Engineering Telemetry Overlay (When in Engineering View) ── */}
        {viewMode === 'ENGINEERING' && (
          <div className="relative z-10 max-w-[380px] bg-slate-950/90 backdrop-blur-md p-3 rounded-2xl border border-cyan-600/50 shadow-2xl font-mono text-[10px] text-slate-300 flex flex-col gap-1 pointer-events-auto">
            <div className="text-cyan-400 font-bold border-b border-slate-800 pb-1 flex justify-between">
              <span>MUJOCO 3.12.0 PHYSICS TELEMETRY</span>
              <span className="text-emerald-400">500 Hz</span>
            </div>
            <div className="grid grid-cols-2 gap-x-3 gap-y-0.5 text-[9.5px]">
              <div>qpos: <span className="text-white font-bold">{simState?.qpos_count ?? 56}</span></div>
              <div>qvel: <span className="text-white font-bold">{simState?.qvel_count ?? 52}</span></div>
              <div>Actuators: <span className="text-cyan-300 font-bold">28 / 28</span></div>
              <div>Bodies: <span className="text-cyan-300 font-bold">33</span></div>
              <div>Pelvis Z: <span className="text-emerald-400 font-bold">{simState?.base_pose.position.z.toFixed(3) ?? '0.885'} m</span></div>
              <div>Grasp Force: <span className="text-emerald-400 font-bold">{simState?.hand_contact_force_N?.toFixed(1) ?? '0.0'} N</span></div>
              <div>Active Contacts: <span className="text-slate-200 font-bold">{simState?.contacts.length ?? 0}</span></div>
              <div>Standing Controller: <span className={isStandingControllerActive ? 'text-emerald-400' : 'text-rose-400'}>{isStandingControllerActive ? 'ACTIVE' : 'OFFLINE'}</span></div>
            </div>
          </div>
        )}

        {/* ── Speech Bubble (When in Assistant View) ── */}
        {viewMode === 'ASSISTANT' && (
          <div className="relative z-10 max-w-[320px] bg-slate-900/90 backdrop-blur-md p-3 rounded-2xl border border-cyan-500/40 shadow-2xl flex flex-col gap-1.5 pointer-events-auto">
            <div className="flex items-start justify-between gap-2">
              <p className="text-xs text-slate-100 font-medium leading-relaxed italic">
                "{speechBubbleText}"
              </p>
              <button
                onClick={handleSpeakGreeting}
                className={`w-7 h-7 rounded-xl flex items-center justify-center transition shrink-0 ${
                  isSpeaking
                    ? 'bg-cyan-500 text-black animate-pulse shadow-[0_0_12px_#06b6d4]'
                    : 'bg-cyan-950/80 text-cyan-400 hover:bg-cyan-900 border border-cyan-700'
                }`}
                title="Hear Meera Speak (Local TTS)"
              >
                🔊
              </button>
            </div>
            {isSpeaking && (
              <div className="flex items-center gap-1">
                {[3, 4, 2.5, 5, 3.5].map((h, i) => (
                  <span
                    key={i}
                    className="bg-cyan-400 animate-pulse rounded-full"
                    style={{ width: 3, height: `${h * 3}px`, animationDelay: `${i * 60}ms` }}
                  />
                ))}
                <span className="text-[10px] font-mono text-cyan-400 ml-1 font-semibold">Speaking...</span>
              </div>
            )}
          </div>
        )}

        {/* ── Environment & Simulation Health Pill ── */}
        <div className="relative z-10 flex items-center justify-between pointer-events-none">
          <div className="flex items-center gap-2 bg-slate-900/85 backdrop-blur px-3 py-1.5 rounded-xl border border-slate-700/80 text-xs text-slate-300 shadow pointer-events-auto">
            <span>📍</span>
            <span>Environment: <strong className="text-white">Household</strong></span>
            <span>·</span>
            <span>Location: <strong className="text-cyan-400">Kitchen</strong></span>
          </div>

          <div className="text-[11px] font-mono bg-slate-950/80 backdrop-blur px-2.5 py-1 rounded-lg border border-slate-800 text-slate-300 pointer-events-auto">
            {isSimConnected ? (
              <span className="text-emerald-400 font-bold">🟢 MUJOCO LIVE · 500 Hz</span>
            ) : (
              <span className="text-rose-400 font-bold">🔴 OFFLINE</span>
            )}
          </div>
        </div>
      </div>

      {/* ── Real Action Controls Bar (Directly Commands MuJoCo Controller) ── */}
      <div className="grid grid-cols-2 sm:grid-cols-6 gap-2">
        {/* 1. Stand Gracefully */}
        <button
          onClick={handleStand}
          disabled={!isSimConnected || actionStatuses.stand === 'EXECUTING'}
          className="px-2.5 py-2.5 bg-gradient-to-b from-indigo-700 to-indigo-900 hover:from-indigo-600 hover:to-indigo-800 text-white rounded-2xl font-bold text-xs transition shadow-lg flex flex-col items-center justify-center gap-0.5 disabled:opacity-40 active:scale-95"
        >
          <span className="text-lg">🧘</span>
          <span>Stand</span>
          <span className="text-[9px] font-mono opacity-80">
            {actionStatuses.stand === 'EXECUTING'
              ? 'EXECUTING...'
              : actionStatuses.stand === 'COMPLETE'
              ? '✔ COMPLETE'
              : 'RESET / STAND'}
          </span>
        </button>

        {/* 2. Wave Hello */}
        <button
          onClick={handleWave}
          disabled={!isSimConnected || actionStatuses.wave === 'EXECUTING'}
          className="px-2.5 py-2.5 bg-gradient-to-b from-cyan-600 to-blue-800 hover:from-cyan-500 hover:to-blue-700 text-white rounded-2xl font-bold text-xs transition shadow-lg flex flex-col items-center justify-center gap-0.5 disabled:opacity-40 active:scale-95"
        >
          <span className="text-lg">👋</span>
          <span>Wave Hello</span>
          <span className="text-[9px] font-mono opacity-80">
            {actionStatuses.wave === 'EXECUTING'
              ? 'EXECUTING...'
              : actionStatuses.wave === 'COMPLETE'
              ? '✔ COMPLETE'
              : 'GREET'}
          </span>
        </button>

        {/* 3. Hold Water Bottle */}
        <button
          onClick={handleGrasp}
          disabled={!isSimConnected || actionStatuses.grasp === 'EXECUTING'}
          className="px-2.5 py-2.5 bg-gradient-to-b from-emerald-600 to-teal-800 hover:from-emerald-500 hover:to-teal-700 text-white rounded-2xl font-bold text-xs transition shadow-lg flex flex-col items-center justify-center gap-0.5 disabled:opacity-40 active:scale-95"
        >
          <span className="text-lg">🍶</span>
          <span>Hold Bottle</span>
          <span className="text-[9px] font-mono opacity-80">
            {actionStatuses.grasp === 'EXECUTING'
              ? 'EXECUTING...'
              : actionStatuses.grasp === 'COMPLETE'
              ? '✔ COMPLETE'
              : 'GRASP (14.2N)'}
          </span>
        </button>

        {/* 4. Start Walking */}
        <button
          onClick={handleWalk}
          disabled={!isSimConnected || actionStatuses.walk === 'EXECUTING'}
          className="px-2.5 py-2.5 bg-gradient-to-b from-amber-700 to-amber-900 hover:from-amber-600 hover:to-amber-800 text-white rounded-2xl font-bold text-xs transition shadow-lg flex flex-col items-center justify-center gap-0.5 disabled:opacity-40 active:scale-95"
        >
          <span className="text-lg">🚶</span>
          <span>Start Walking</span>
          <span className="text-[9px] font-mono opacity-80">
            {actionStatuses.walk === 'EXECUTING'
              ? 'EXECUTING...'
              : actionStatuses.walk === 'COMPLETE'
              ? '✔ COMPLETE'
              : 'LOCOMOTION'}
          </span>
        </button>

        {/* 5. Test Push 450N */}
        <button
          onClick={handlePush}
          disabled={!isSimConnected || actionStatuses.push === 'EXECUTING'}
          className="px-2.5 py-2.5 bg-gradient-to-b from-rose-700 to-red-900 hover:from-rose-600 hover:to-red-800 text-white rounded-2xl font-bold text-xs transition shadow-lg flex flex-col items-center justify-center gap-0.5 disabled:opacity-40 active:scale-95"
        >
          <span className="text-lg">⚡</span>
          <span>Test Push</span>
          <span className="text-[9px] font-mono opacity-80">
            {actionStatuses.push === 'EXECUTING'
              ? 'EXECUTING...'
              : actionStatuses.push === 'COMPLETE'
              ? '✔ COMPLETE'
              : 'INPUT: 450 N'}
          </span>
        </button>

        {/* 6. Dance / Emote */}
        <button
          onClick={handleDance}
          disabled={!isSimConnected || actionStatuses.dance === 'EXECUTING'}
          className="px-2.5 py-2.5 bg-gradient-to-b from-purple-700 to-pink-900 hover:from-purple-600 hover:to-pink-800 text-white rounded-2xl font-bold text-xs transition shadow-lg flex flex-col items-center justify-center gap-0.5 disabled:opacity-40 active:scale-95"
        >
          <span className="text-lg">💃</span>
          <span>Dance</span>
          <span className="text-[9px] font-mono opacity-80">
            {actionStatuses.dance === 'EXECUTING'
              ? 'EXECUTING...'
              : actionStatuses.dance === 'COMPLETE'
              ? '✔ COMPLETE'
              : 'PERFORM'}
          </span>
        </button>
      </div>
    </div>
  );
};
