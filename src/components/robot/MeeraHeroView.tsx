/**
 * CHATR-Meera Hero Character & Action View — Video Game Mode
 * Full game-controller locomotion: WASD keyboard + on-screen joystick + servo SFX + footstep audio.
 * All motion commands wired to live MuJoCo physics via SimBridgeClient.teleop().
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

// tiny Web Audio tone helper — no external deps
function playTone(type: OscillatorType, f0: number, f1: number, dur: number, vol = 0.06) {
  try {
    const Ctx = window.AudioContext || (window as any).webkitAudioContext;
    if (!Ctx) return;
    const ctx = new Ctx();
    const osc = ctx.createOscillator();
    const g   = ctx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(f0, ctx.currentTime);
    if (f1 !== f0) osc.frequency.exponentialRampToValueAtTime(f1, ctx.currentTime + dur);
    g.gain.setValueAtTime(vol, ctx.currentTime);
    g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + dur);
    osc.connect(g); g.connect(ctx.destination);
    osc.start(); osc.stop(ctx.currentTime + dur);
  } catch {}
}

export const MeeraHeroView: React.FC<MeeraHeroViewProps> = ({
  rightArmJoints, leftArmJoints, torsoPosition, walkingState, isHardwareConnected,
}) => {
  const [viewMode, setViewMode] = useState<'PHOTO' | '3D_SKELETON'>('PHOTO');
  const [simState, setSimState] = useState<SimBridgeState | null>(null);
  const [isSpeaking, setIsSpeaking]       = useState(false);
  const [isActionPending, setIsActionPending] = useState(false);
  const [speechBubble, setSpeechBubble]   = useState('Namaste! Main Meera hoon. Aapki sahayata ke liye hamesha tayyar.');

  // game state
  const [pressedKeys, setPressedKeys]     = useState<Set<string>>(new Set());
  const [isWalking, setIsWalking]         = useState(false);
  const [isDancing, setIsDancing]         = useState(false);
  const [isMuted, setIsMuted]             = useState(false);
  const [avatarBob, setAvatarBob]         = useState(0);
  const [walkSpeed, setWalkSpeed]         = useState(0);

  useEffect(() => {
    const u1 = meeraVoice.onSpeakingChange(setIsSpeaking);
    const u2 = SimBridgeClient.onStateUpdate(setSimState);
    return () => { u1(); u2(); };
  }, []);

  const isSimConnected = SimBridgeClient.getConnectionState() === 'CONNECTED';
  const isFallen       = simState?.is_fallen ?? false;

  /* animated body-bob + footstep SFX */
  useEffect(() => {
    let frame = 0;
    const timer = setInterval(() => {
      frame++;
      if (isWalking)       { setAvatarBob(Math.sin(frame * 0.22) * 6); setWalkSpeed(1.2); }
      else if (isDancing)  { setAvatarBob(Math.sin(frame * 0.38) * 10); setWalkSpeed(0); }
      else                 { setAvatarBob(Math.sin(frame * 0.04) * 2.5); setWalkSpeed(0); }
    }, 16);
    let step: ReturnType<typeof setInterval> | null = null;
    if (isWalking && !isMuted) {
      step = setInterval(() => playTone('triangle', 130 + Math.random() * 25, 30, 0.08, 0.07), 625);
    }
    return () => { clearInterval(timer); if (step) clearInterval(step); };
  }, [isWalking, isDancing, isMuted]);

  /* WASD keyboard events */
  useEffect(() => {
    const dn = (e: KeyboardEvent) => {
      if (e.repeat) return;
      const t = (e.target as HTMLElement)?.tagName;
      if (t === 'INPUT' || t === 'TEXTAREA') return;
      setPressedKeys(p => new Set([...p, e.key.toLowerCase()]));
    };
    const up = (e: KeyboardEvent) => setPressedKeys(p => { const n = new Set(p); n.delete(e.key.toLowerCase()); return n; });
    window.addEventListener('keydown', dn);
    window.addEventListener('keyup', up);
    return () => { window.removeEventListener('keydown', dn); window.removeEventListener('keyup', up); };
  }, []);

  /* WASD -> teleop @ 20 Hz */
  useEffect(() => {
    const iv = setInterval(async () => {
      let vx = 0, vyaw = 0;
      if (pressedKeys.has('w') || pressedKeys.has('arrowup'))    vx   += 1.2;
      if (pressedKeys.has('s') || pressedKeys.has('arrowdown'))  vx   -= 0.7;
      if (pressedKeys.has('a') || pressedKeys.has('arrowleft'))  vyaw += 0.9;
      if (pressedKeys.has('d') || pressedKeys.has('arrowright')) vyaw -= 0.9;
      const moving = Math.abs(vx) > 0.01 || Math.abs(vyaw) > 0.01;
      setIsWalking(moving);
      if (!isSimConnected) return;
      try { await SimBridgeClient.teleop(vx, 0, vyaw); } catch {}
    }, 50);
    return () => clearInterval(iv);
  }, [pressedKeys, isSimConnected]);

  const speak = useCallback(async () => {
    const t = 'Namaste! Main Meera hoon. Aapki sahayata ke liye hamesha tayyar.';
    setSpeechBubble(t);
    await meeraVoice.speak(t, 'hi-IN');
  }, []);

  const servo = useCallback(() => {
    if (!isMuted) playTone('sawtooth', 420, 880, 0.13, 0.04);
  }, [isMuted]);

  const handleJoyMove = useCallback((vx: number, vyaw: number) => {
    setIsWalking(Math.abs(vx) > 0.01 || Math.abs(vyaw) > 0.01);
    if (isSimConnected) SimBridgeClient.teleop(vx, 0, vyaw).catch(() => {});
  }, [isSimConnected]);

  const joyStop = useCallback(() => {
    setIsWalking(false);
    if (isSimConnected) SimBridgeClient.teleop(0, 0, 0).catch(() => {});
  }, [isSimConnected]);

  /* action handlers */
  const handleWave = async () => {
    servo(); setIsActionPending(true);
    const t = 'Namaste! CHATR RobotOS mein aapka swagat hai!';
    setSpeechBubble(t);
    try { await Promise.all([SimBridgeClient.wave(), meeraVoice.speak(t, 'hi-IN')]); } catch {}
    finally { setIsActionPending(false); }
  };

  const handleGrasp = async () => {
    servo(); setIsActionPending(true);
    const t = 'Main paani ki bottle grasp kar rahi hoon.';
    setSpeechBubble(t);
    try { await Promise.all([SimBridgeClient.graspBottle(), meeraVoice.speak(t, 'hi-IN')]); } catch {}
    finally { setIsActionPending(false); }
  };

  const handleDance = async () => {
    const next = !isDancing;
    setIsDancing(next); setIsActionPending(true);
    const t = next ? 'Chal yaar, dance karte hain! 🎶' : 'Dance khatam. Standing by.';
    setSpeechBubble(t);
    if (!isMuted) {
      try {
        const Ctx = window.AudioContext || (window as any).webkitAudioContext;
        if (Ctx) {
          const c = new Ctx();
          [440, 554.37, 659.25, 880].forEach((f, i) => {
            const o = c.createOscillator(), g = c.createGain(), s = c.currentTime + i * 0.08;
            o.type = 'triangle'; o.frequency.setValueAtTime(f, s);
            g.gain.setValueAtTime(0.07, s); g.gain.exponentialRampToValueAtTime(0.001, s + 0.25);
            o.connect(g); g.connect(c.destination); o.start(s); o.stop(s + 0.25);
          });
        }
      } catch {}
    }
    try { await Promise.all([SimBridgeClient.dance(), meeraVoice.speak(t, 'hi-IN')]); } catch {}
    finally { setIsActionPending(false); }
  };

  const handleWalkToggle = async () => {
    if (isWalking) {
      setIsWalking(false);
      setSpeechBubble('Ruk gayi. Stabilizing...');
      try { await SimBridgeClient.teleop(0, 0, 0); } catch {}
    } else {
      setIsWalking(true);
      const t = 'Main kitchen ki taraf badh rahi hoon.';
      setSpeechBubble(t);
      try { await Promise.all([SimBridgeClient.navigate('kitchen'), meeraVoice.speak(t, 'hi-IN')]); } catch {}
    }
  };

  const handleStand = async () => {
    setIsWalking(false); setIsDancing(false); setIsActionPending(true);
    const t = 'Balance pose mein khadi hoon.';
    setSpeechBubble(t);
    try { await SimBridgeClient.stand(); } catch {
      try { await SimBridgeClient.reset(42); } catch {}
    }
    try { await meeraVoice.speak(t, 'hi-IN'); } catch {}
    setIsActionPending(false);
  };

  const handlePush = async () => {
    setIsActionPending(true);
    if (!isMuted) playTone('sawtooth', 180, 90, 0.3, 0.12);
    const t = 'Savdhaan! External disturbance! Stabilizing...';
    setSpeechBubble(t);
    try { await Promise.all([SimBridgeClient.injectFault('external_push'), meeraVoice.speak(t, 'hi-IN')]); } catch {}
    finally { setIsActionPending(false); }
  };

  const key = (k: string, arrow: string) =>
    pressedKeys.has(k) || pressedKeys.has(arrow);

  const bobStyle: React.CSSProperties = {
    transform: `translateY(${avatarBob}px)`,
    transition: 'transform 0.05s linear',
  };

  const joyBtn = (label: string, vx: number, vyaw: number) => (
    <button
      onPointerDown={() => handleJoyMove(vx, vyaw)}
      onPointerUp={joyStop} onPointerLeave={joyStop}
      className="w-9 h-8 rounded-lg bg-slate-800 border border-slate-600 text-slate-200 text-sm font-black
                 active:bg-cyan-500 active:text-black active:shadow-[0_0_8px_#06b6d4] transition flex items-center
                 justify-center select-none touch-none"
    >{label}</button>
  );

  return (
    <div className="flex flex-col gap-3">
      {/* ── Hero Card */}
      <div className="relative w-full rounded-3xl overflow-hidden border border-slate-700/80 bg-slate-950 shadow-2xl"
           style={{ height: 460 }}>

        {/* Background */}
        {viewMode === 'PHOTO' ? (
          <div className="absolute inset-0 z-0">
            <img src="/assets/meera_hero.jpg" alt="Meera"
                 className="w-full h-full object-cover object-center opacity-95"
                 style={bobStyle} />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950/95 via-slate-950/20 to-slate-950/60 pointer-events-none" />
            <div className="absolute inset-0 bg-gradient-to-r from-slate-950/85 via-transparent to-slate-950/40 pointer-events-none" />
            <div className="absolute top-[27%] left-[46%] w-8 h-8 rounded-full bg-cyan-400/40 blur-md animate-pulse pointer-events-none" />
            {isWalking  && <div className="absolute inset-0 bg-gradient-to-b from-transparent to-cyan-500/10 animate-pulse pointer-events-none" />}
            {isDancing  && <div className="absolute inset-0 bg-gradient-to-tr from-purple-500/10 to-pink-500/10 animate-pulse pointer-events-none" />}
          </div>
        ) : (
          <div className="absolute inset-0 z-0 bg-slate-950">
            <RobotDigitalTwinCanvas rightArmJoints={rightArmJoints} leftArmJoints={leftArmJoints}
              torsoPosition={torsoPosition} walkingState={walkingState} isHardwareConnected={isHardwareConnected} />
          </div>
        )}

        {/* ── Top bar */}
        <div className="absolute top-4 left-5 right-5 z-10 flex items-start justify-between">
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="text-3xl font-black text-white drop-shadow-md">MEERA</h2>
              <span className="text-xs font-mono font-bold px-2.5 py-0.5 rounded-full bg-cyan-950/90 text-cyan-300 border border-cyan-700 backdrop-blur">CHATR-H170</span>
              {isWalking  && <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-amber-900/90 text-amber-300 border border-amber-600 animate-pulse">🚶 WALKING</span>}
              {isDancing  && <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-purple-900/90 text-purple-300 border border-purple-600 animate-pulse">💃 DANCING</span>}
            </div>
            <div className="flex items-center gap-2 text-xs text-slate-300">
              <span className="font-semibold text-white">1.75 m</span><span>·</span>
              <span className="font-semibold text-white">68 kg</span><span>·</span>
              <span className="text-cyan-300 font-mono font-bold">28 DOF</span>
            </div>
          </div>
          <div className="flex flex-col items-end gap-2">
            <div className="flex items-center gap-2">
              <span className={`px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1.5 backdrop-blur ${isFallen ? 'bg-rose-950/90 border border-rose-600 text-rose-300' : 'bg-emerald-950/90 border border-emerald-500/80 text-emerald-300'}`}>
                <span className={`w-2 h-2 rounded-full ${isFallen ? 'bg-rose-400' : 'bg-emerald-400 animate-pulse'}`} />
                {isFallen ? 'DISTURBED' : 'STABLE'}
              </span>
              <button onClick={() => setViewMode(v => v === 'PHOTO' ? '3D_SKELETON' : 'PHOTO')}
                className="px-2.5 py-1 text-[11px] rounded-full bg-slate-900/90 hover:bg-slate-800 text-slate-200 border border-slate-700 backdrop-blur transition font-semibold">
                {viewMode === 'PHOTO' ? '🔬 3D' : '✨ Photo'}
              </button>
              <button onClick={() => setIsMuted(m => !m)}
                className={`px-2 py-1 text-[11px] rounded-full border backdrop-blur transition font-semibold ${isMuted ? 'bg-slate-800 text-slate-400 border-slate-600' : 'bg-cyan-950/80 text-cyan-300 border-cyan-700'}`}
                title="Toggle game SFX">
                {isMuted ? '🔇' : '🔊'}
              </button>
            </div>
            <div className="text-[10px] font-mono text-slate-400 bg-slate-950/80 backdrop-blur px-2.5 py-0.5 rounded-lg border border-slate-800">
              PROVENANCE: <span className="text-orange-400 font-bold">MUJOCO_PHYSICS</span> · 500 Hz
            </div>
          </div>
        </div>

        {/* ── Left HUD: WASD + virtual joystick */}
        <div className="absolute left-4 top-1/2 -translate-y-1/2 z-10 flex flex-col gap-2 select-none">
          {/* WASD */}
          <div className="bg-slate-950/85 backdrop-blur rounded-2xl border border-slate-700 p-2.5 flex flex-col items-center gap-1 shadow-xl">
            <div className="text-[9px] text-slate-500 font-mono font-bold tracking-widest mb-0.5">KEYBOARD</div>
            <div className={`w-9 h-8 rounded-lg border text-[11px] font-black flex items-center justify-center transition-all
                ${key('w','arrowup') ? 'bg-cyan-500 border-cyan-400 text-black shadow-[0_0_10px_#06b6d4] scale-95' : 'bg-slate-800 border-slate-600 text-slate-300'}`}>W</div>
            <div className="flex gap-1">
              {([['a','arrowleft'],['s','arrowdown'],['d','arrowright']] as [string,string][]).map(([k, arr]) => (
                <div key={k} className={`w-9 h-8 rounded-lg border text-[11px] font-black flex items-center justify-center transition-all
                    ${key(k, arr) ? 'bg-cyan-500 border-cyan-400 text-black shadow-[0_0_10px_#06b6d4] scale-95' : 'bg-slate-800 border-slate-600 text-slate-300'}`}>
                  {k.toUpperCase()}
                </div>
              ))}
            </div>
            {walkSpeed > 0 && <div className="text-[8px] font-mono text-cyan-400 mt-0.5 font-bold">{walkSpeed.toFixed(1)} m/s</div>}
          </div>

          {/* Virtual joystick */}
          <div className="bg-slate-950/85 backdrop-blur rounded-2xl border border-slate-700 p-2 shadow-xl">
            <div className="text-[9px] text-slate-500 font-mono font-bold tracking-widest mb-1 text-center">TOUCH</div>
            <div className="grid grid-cols-3 gap-0.5">
              <div />{joyBtn('↑', 1.2, 0)}<div />
              {joyBtn('←', 0, 0.9)}<button onPointerDown={joyStop} className="w-9 h-8 rounded-lg bg-slate-900 border border-slate-700 flex items-center justify-center text-slate-700">●</button>{joyBtn('→', 0, -0.9)}
              <div />{joyBtn('↓', -0.7, 0)}<div />
            </div>
          </div>
        </div>

        {/* ── Speech bubble */}
        <div className="absolute bottom-20 left-[110px] z-10 max-w-[280px] bg-slate-900/90 backdrop-blur-md p-3 rounded-2xl border border-cyan-500/40 shadow-2xl flex flex-col gap-2">
          <div className="flex items-start justify-between gap-2">
            <p className="text-xs text-slate-100 font-medium leading-relaxed italic">"{speechBubble}"</p>
            <button onClick={speak}
              className={`w-7 h-7 rounded-xl flex items-center justify-center transition shrink-0 ${isSpeaking ? 'bg-cyan-500 text-black animate-pulse shadow-[0_0_12px_#06b6d4]' : 'bg-cyan-950/80 text-cyan-400 hover:bg-cyan-900 border border-cyan-700'}`}>
              🔊
            </button>
          </div>
          {isSpeaking && (
            <div className="flex items-center gap-1">
              {[3,4,2.5,5,3.5].map((h,i) => <span key={i} className="bg-cyan-400 animate-pulse rounded-full" style={{ width:3, height:`${h*3}px`, animationDelay:`${i*60}ms` }} />)}
              <span className="text-[10px] font-mono text-cyan-400 ml-1">Speaking...</span>
            </div>
          )}
        </div>

        {/* ── Location pill */}
        <div className="absolute bottom-4 left-5 right-5 z-10 flex items-center justify-between">
          <div className="flex items-center gap-2 bg-slate-900/85 backdrop-blur px-3 py-1.5 rounded-xl border border-slate-700/80 text-xs text-slate-300 shadow">
            <span>📍</span>
            <span>Env: <strong className="text-white">Household</strong></span>
            <span>·</span>
            <span>Loc: <strong className="text-cyan-400">Kitchen</strong></span>
          </div>
          <div className={`text-[11px] font-mono backdrop-blur px-2.5 py-1 rounded-lg border ${isSimConnected ? 'text-emerald-400 bg-emerald-950/60 border-emerald-800' : 'text-slate-400 bg-slate-950/80 border-slate-800'}`}>
            {isSimConnected ? '🟢 MuJoCo LIVE' : '🔴 OFFLINE'}
          </div>
        </div>
      </div>

      {/* ── Game Action Buttons */}
      <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
        {([
          { icon:'👋', label:'Wave',                          sub:'GREET',   handler:handleWave,       color:'from-cyan-600 to-blue-700',    glow:'',                active:false },
          { icon:'🍶', label:'Grasp',                         sub:'14.2 N',  handler:handleGrasp,      color:'from-emerald-600 to-teal-700',  glow:'',                active:false },
          { icon:'💃', label: isDancing ? 'Stop' : 'Dance',  sub:'PERFORM', handler:handleDance,      color: isDancing ? 'from-pink-500 to-purple-600' : 'from-purple-700 to-pink-700', glow: isDancing ? 'shadow-[0_0_16px_#a855f7]' : '', active:isDancing },
          { icon:'🚶', label: isWalking ? 'Stop' : 'Walk',   sub:'LOCOM',   handler:handleWalkToggle, color: isWalking ? 'from-amber-500 to-orange-600' : 'from-amber-700 to-yellow-700', glow: isWalking  ? 'shadow-[0_0_14px_#f59e0b]' : '', active:isWalking  },
          { icon:'🧘', label:'Stand',                         sub:'RESET',   handler:handleStand,      color:'from-indigo-700 to-violet-700', glow:'',                active:false },
          { icon:'⚡', label:'Push!',                         sub:'450 N',   handler:handlePush,       color:'from-rose-700 to-red-800',      glow:'',                active:false },
        ] as const).map((b) => (
          <button key={b.label}
            onClick={b.handler}
            disabled={isActionPending || !isSimConnected}
            className={`px-2 py-3 bg-gradient-to-b ${b.color} text-white rounded-2xl font-bold text-xs transition-all shadow-lg
                        flex flex-col items-center justify-center gap-1 disabled:opacity-40 active:scale-95 hover:brightness-110
                        ${b.glow} ${b.active ? 'animate-pulse' : ''}`}
          >
            <span className="text-xl">{b.icon}</span>
            <span>{b.label}</span>
            <span className="text-[9px] opacity-70 font-mono">{b.sub}</span>
          </button>
        ))}
      </div>
    </div>
  );
};
