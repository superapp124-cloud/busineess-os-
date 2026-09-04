/**
 * CHATR-Meera Hero Character & Action View
 * Lifelike Humanoid Assistant representation with interactive voice playback and live MuJoCo action controls.
 */

import React, { useState, useEffect, useCallback } from 'react';
import { SimBridgeClient, SimBridgeState } from '../../../packages/sim-bridge/src';
import { meeraVoice } from '../../utils/speechTts';
import { RobotDigitalTwinCanvas } from './RobotDigitalTwinCanvas';
import { Vector3 } from '../../../packages/robot-physics/src/math/vector3';
import { ArmJointAngles } from '../../../packages/robot-manipulation/src';

interface MeeraHeroViewProps {
  onSpeak?: (text: string) => void;
  rightArmJoints: ArmJointAngles;
  leftArmJoints: ArmJointAngles;
  torsoPosition: Vector3;
  walkingState: 'IDLE_STANDING' | 'DOUBLE_SUPPORT' | 'SINGLE_SUPPORT_RIGHT' | 'SINGLE_SUPPORT_LEFT' | 'EMERGENCY_STOPPED';
  isHardwareConnected: boolean;
}

export const MeeraHeroView: React.FC<MeeraHeroViewProps> = ({
  rightArmJoints,
  leftArmJoints,
  torsoPosition,
  walkingState,
  isHardwareConnected,
}) => {
  const [viewMode, setViewMode] = useState<'PHOTO' | '3D_SKELETON'>('PHOTO');
  const [simState, setSimState] = useState<SimBridgeState | null>(null);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isActionPending, setIsActionPending] = useState(false);
  const [speechBubbleText, setSpeechBubbleText] = useState(
    'Namaste! Main Meera hoon. Aapki sahayata ke liye hamesha tayyar.'
  );

  useEffect(() => {
    const unsubVoice = meeraVoice.onSpeakingChange((speaking) => {
      setIsSpeaking(speaking);
    });
    const unsubSim = SimBridgeClient.onStateUpdate((s) => {
      setSimState(s);
    });
    return () => {
      unsubVoice();
      unsubSim();
    };
  }, []);

  const isSimConnected = SimBridgeClient.getConnectionState() === 'CONNECTED';
  const isFallen = simState?.is_fallen ?? false;

  const handleSpeakGreeting = useCallback(async () => {
    const text = 'Namaste! Main Meera hoon. Aapki sahayata ke liye hamesha tayyar.';
    setSpeechBubbleText(text);
    await meeraVoice.speak(text, 'hi-IN');
  }, []);

  // Actions connecting to MuJoCo
  const handleWave = async () => {
    setIsActionPending(true);
    const text = 'Namaste! Main Meera hoon. CHATR RobotOS mein aapka swagat hai.';
    setSpeechBubbleText(text);
    try {
      await Promise.all([SimBridgeClient.wave(), meeraVoice.speak(text, 'hi-IN')]);
    } catch (e) {
      console.warn('Wave error:', e);
    } finally {
      setIsActionPending(false);
    }
  };

  const handleHoldBottle = async () => {
    setIsActionPending(true);
    const text = 'Main kitchen counter se paani ki bottle grasp kar rahi hoon.';
    setSpeechBubbleText(text);
    try {
      await Promise.all([SimBridgeClient.graspBottle(), meeraVoice.speak(text, 'hi-IN')]);
    } catch (e) {
      console.warn('Hold bottle error:', e);
    } finally {
      setIsActionPending(false);
    }
  };

  const handleStand = async () => {
    setIsActionPending(true);
    const text = 'Main nominal balance pose mein khadi hoon.';
    setSpeechBubbleText(text);
    try {
      await Promise.all([SimBridgeClient.reset(42), meeraVoice.speak(text, 'hi-IN')]);
    } catch (e) {
      console.warn('Stand error:', e);
    } finally {
      setIsActionPending(false);
    }
  };

  const handleWalk = async () => {
    setIsActionPending(true);
    const text = 'Main kitchen table ki taraf aage badh rahi hoon.';
    setSpeechBubbleText(text);
    try {
      await Promise.all([SimBridgeClient.navigate('kitchen'), meeraVoice.speak(text, 'hi-IN')]);
    } catch (e) {
      console.warn('Walk error:', e);
    } finally {
      setIsActionPending(false);
    }
  };

  const handlePush = async () => {
    setIsActionPending(true);
    const text = 'Savdhaan! External disturbance detect hui hai.';
    setSpeechBubbleText(text);
    try {
      await Promise.all([SimBridgeClient.injectFault('external_push'), meeraVoice.speak(text, 'hi-IN')]);
    } catch (e) {
      console.warn('Push error:', e);
    } finally {
      setIsActionPending(false);
    }
  };

  return (
    <div className="flex flex-col gap-3">
      {/* Hero Visual Card */}
      <div className="relative w-full h-[400px] md:h-[440px] rounded-3xl overflow-hidden border border-slate-700/80 bg-slate-950 shadow-2xl flex flex-col justify-between p-5">
        {/* View Mode Content */}
        {viewMode === 'PHOTO' ? (
          <div className="absolute inset-0 z-0">
            <img
              src="/assets/meera_hero.jpg"
              alt="Meera Humanoid Character"
              className="w-full h-full object-cover object-center opacity-95 transition-all duration-700"
            />
            {/* Cinematic Gradient Overlays */}
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950/95 via-slate-950/25 to-slate-950/70 pointer-events-none" />
            <div className="absolute inset-0 bg-gradient-to-r from-slate-950/80 via-transparent to-slate-950/40 pointer-events-none" />

            {/* Glowing Arc-Core Pulse in Photo Mode */}
            <div className="absolute top-[28%] left-[45.5%] w-8 h-8 rounded-full bg-cyan-400/40 blur-md animate-pulse pointer-events-none" />
          </div>
        ) : (
          <div className="absolute inset-0 z-0 bg-slate-950">
            <RobotDigitalTwinCanvas
              rightArmJoints={rightArmJoints}
              leftArmJoints={leftArmJoints}
              torsoPosition={torsoPosition}
              walkingState={walkingState}
              isHardwareConnected={isHardwareConnected}
            />
          </div>
        )}

        {/* Top Header Information */}
        <div className="relative z-10 flex items-start justify-between">
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-2.5">
              <h2 className="text-3xl font-black tracking-tight text-white drop-shadow-md">MEERA</h2>
              <span className="text-xs font-mono font-bold px-2.5 py-0.5 rounded-full bg-cyan-950/90 text-cyan-300 border border-cyan-700 backdrop-blur shadow">
                CHATR-H170
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

          {/* Status & View Switcher */}
          <div className="flex flex-col items-end gap-2">
            <div className="flex items-center gap-2">
              <span
                className={`px-3 py-1 rounded-full text-xs font-bold tracking-wide flex items-center gap-1.5 shadow-lg backdrop-blur ${
                  isFallen
                    ? 'bg-rose-950/90 border border-rose-600 text-rose-300'
                    : 'bg-emerald-950/90 border border-emerald-500/80 text-emerald-300'
                }`}
              >
                <span className={`w-2 h-2 rounded-full ${isFallen ? 'bg-rose-400' : 'bg-emerald-400 animate-pulse'}`} />
                {isFallen ? 'MEERA DISTURBED (FALLEN)' : 'MEERA ACTIVE & STABLE'}
              </span>

              {/* Toggle 3D Physics Skeleton / Realistic Twin */}
              <button
                onClick={() => setViewMode(viewMode === 'PHOTO' ? '3D_SKELETON' : 'PHOTO')}
                className="px-2.5 py-1 text-[11px] rounded-full bg-slate-900/90 hover:bg-slate-800 text-slate-200 border border-slate-700 backdrop-blur transition shadow font-semibold"
                title="Toggle between realistic human avatar and 3D MuJoCo skeleton mesh"
              >
                {viewMode === 'PHOTO' ? '🔬 3D Skeleton' : '✨ Photo Avatar'}
              </button>
            </div>

            <div className="text-[10px] font-mono text-slate-400 bg-slate-950/80 backdrop-blur px-2.5 py-0.5 rounded-lg border border-slate-800">
              PROVENANCE: <span className="text-orange-400 font-bold">MUJOCO_PHYSICS</span> · 500 Hz
            </div>
          </div>
        </div>

        {/* Speech Bubble with Real Voice Synthesis */}
        <div className="relative z-10 max-w-[340px] bg-slate-900/90 backdrop-blur-md p-3.5 rounded-2xl border border-cyan-500/40 shadow-2xl flex flex-col gap-2">
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
              title="Click to hear Meera speak with real Voice Synthesis"
            >
              🔊
            </button>
          </div>
          {isSpeaking && (
            <div className="flex items-center gap-1">
              <span className="w-1.5 h-3 bg-cyan-400 animate-pulse rounded-full" />
              <span className="w-1.5 h-4 bg-cyan-300 animate-pulse delay-75 rounded-full" />
              <span className="w-1.5 h-2.5 bg-cyan-400 animate-pulse delay-150 rounded-full" />
              <span className="w-1.5 h-5 bg-cyan-300 animate-pulse delay-100 rounded-full" />
              <span className="text-[10px] font-mono text-cyan-400 ml-1 font-semibold">Voice active...</span>
            </div>
          )}
        </div>

        {/* Location & Environment Pill */}
        <div className="relative z-10 flex items-center justify-between">
          <div className="flex items-center gap-2 bg-slate-900/85 backdrop-blur px-3 py-1.5 rounded-xl border border-slate-700/80 text-xs text-slate-300 shadow">
            <span>📍</span>
            <span>Environment: <strong className="text-white">Household</strong></span>
            <span>·</span>
            <span>Location: <strong className="text-cyan-400">Kitchen</strong></span>
          </div>

          <div className="text-[11px] font-mono text-slate-400 bg-slate-950/80 backdrop-blur px-2.5 py-1 rounded-lg border border-slate-800">
            Real Physics · Real World · Real Skills
          </div>
        </div>
      </div>

      {/* Action Buttons Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
        <button
          onClick={handleWave}
          disabled={isActionPending || !isSimConnected}
          className="px-3 py-2.5 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white rounded-xl font-bold text-xs transition shadow-lg flex items-center justify-center gap-1.5 disabled:opacity-40"
        >
          <span>👋</span>
          <span>Wave Hello</span>
        </button>

        <button
          onClick={handleHoldBottle}
          disabled={isActionPending || !isSimConnected}
          className="px-3 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white rounded-xl font-bold text-xs transition shadow-lg flex items-center justify-center gap-1.5 disabled:opacity-40"
        >
          <span>🍶</span>
          <span>Hold Water Bottle</span>
        </button>

        <button
          onClick={handleStand}
          disabled={isActionPending || !isSimConnected}
          className="px-3 py-2.5 bg-gradient-to-r from-purple-700 to-indigo-700 hover:from-purple-600 hover:to-indigo-600 text-white rounded-xl font-bold text-xs transition shadow-lg flex items-center justify-center gap-1.5 disabled:opacity-40"
        >
          <span>🧘</span>
          <span>Stand Gracefully</span>
        </button>

        <button
          onClick={handleWalk}
          disabled={isActionPending || !isSimConnected}
          className="px-3 py-2.5 bg-gradient-to-r from-amber-700 to-yellow-700 hover:from-amber-600 hover:to-yellow-600 text-white rounded-xl font-bold text-xs transition shadow-lg flex items-center justify-center gap-1.5 disabled:opacity-40"
        >
          <span>🚶</span>
          <span>Start Walking</span>
        </button>

        <button
          onClick={handlePush}
          disabled={isActionPending || !isSimConnected}
          className="px-3 py-2.5 bg-gradient-to-r from-rose-700 to-red-700 hover:from-rose-600 hover:to-red-600 text-white rounded-xl font-bold text-xs transition shadow-lg flex items-center justify-center gap-1.5 disabled:opacity-40 col-span-2 sm:col-span-1"
        >
          <span>⚡</span>
          <span>Test Push (450N)</span>
        </button>
      </div>
    </div>
  );
};
