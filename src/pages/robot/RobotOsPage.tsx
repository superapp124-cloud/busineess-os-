/**
 * CHATR RobotOS Master Cockpit (Meera AI Humanoid Platform)
 * Unified High-Fidelity Robotics Interface matching the user design reference.
 * Integrated with MuJoCo 3.12.0 physics, Web Speech API Voice synthesis, and multi-modal perception.
 */

import React, { useState, useEffect } from 'react';
import { MeeraHeroView } from '../../components/robot/MeeraHeroView';
import { VoiceConversationConsole } from '../../components/robot/VoiceConversationConsole';
import { SimulationAuthorityPanel } from '../../components/robot/SimulationAuthorityPanel';
import { RobotStateCard } from '../../components/robot/RobotStateCard';
import { ManipulationCard } from '../../components/robot/ManipulationCard';
import { TaskExecutionPipeline } from '../../components/robot/TaskExecutionPipeline';
import { SensorFeedsGrid } from '../../components/robot/SensorFeedsGrid';
import { SpatialSafetyPanel, MasterSafetyState } from '../../components/robot/SpatialSafetyPanel';
import { FailureInjectionPanel } from '../../components/robot/FailureInjectionPanel';

import { Vector3 } from '../../../packages/robot-physics/src/math/vector3';
import { ArmJointAngles } from '../../../packages/robot-manipulation/src/types';
import { SimBridgeClient } from '../../../packages/sim-bridge/src';

export const RobotOsPage: React.FC = () => {
  const [activeSidebar, setActiveSidebar] = useState('RobotOS');
  const [activeTab, setActiveTab] = useState('RobotOS');
  const [isEstop, setIsEstop] = useState(false);
  const [timeStr, setTimeStr] = useState('');

  // Robot Arm & Base state
  const [rightArmJoints, setRightArmJoints] = useState<ArmJointAngles>({
    shoulderPitch: -0.2,
    shoulderRoll: -0.1,
    shoulderYaw: 0.0,
    elbowPitch: -0.6,
    wristYaw: 0.0,
    wristRoll: 0.0,
    wristPitch: -0.1,
  });

  const [leftArmJoints, setLeftArmJoints] = useState<ArmJointAngles>({
    shoulderPitch: -0.2,
    shoulderRoll: 0.1,
    shoulderYaw: 0.0,
    elbowPitch: -0.6,
    wristYaw: 0.0,
    wristRoll: 0.0,
    wristPitch: -0.1,
  });

  const [torsoPosition] = useState<Vector3>(new Vector3(0.0, 0.0, 0.88));

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setTimeStr(
        now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) +
          ' ' +
          now.toLocaleDateString([], { weekday: 'short', day: '2-digit', month: 'short', year: 'numeric' })
      );
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  const sidebarItems = [
    { id: 'RobotOS', icon: '🤖', label: 'RobotOS' },
    { id: 'Dashboard', icon: '📊', label: 'Dashboard' },
    { id: 'Conversation', icon: '💬', label: 'Conversation' },
    { id: 'Skills', icon: '⚡', label: 'Skills' },
    { id: 'Perception', icon: '👁️', label: 'Perception' },
    { id: 'Navigation', icon: '🧭', label: 'Navigation' },
    { id: 'Manipulation', icon: '🦾', label: 'Manipulation' },
    { id: 'Simulation Studio', icon: '🔬', label: 'Simulation Studio' },
    { id: 'World Model', icon: '🌐', label: 'World Model' },
    { id: 'Safety & Faults', icon: '🛡️', label: 'Safety & Faults' },
    { id: 'Evidence', icon: '📑', label: 'Evidence' },
    { id: 'System', icon: '⚙️', label: 'System' },
  ];

  const topTabs = ['Home', 'RobotOS', 'Perception', 'Tasks', 'World Model', 'Logs', 'Settings'];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-cyan-500 selection:text-slate-950">
      {/* ── Top Header Navigation Bar ── */}
      <header className="h-16 bg-slate-900/90 border-b border-slate-800 px-4 md:px-6 flex items-center justify-between backdrop-blur-md sticky top-0 z-50">
        {/* Logo & Identity */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-cyan-600 to-blue-600 flex items-center justify-center text-white font-black text-xl shadow-lg shadow-cyan-900/40">
            ⚡
          </div>
          <div>
            <h1 className="text-base font-black tracking-tight text-white flex items-center gap-1.5">
              <span>CHATR RobotOS</span>
            </h1>
            <p className="text-[10px] text-slate-400 font-medium">
              Humanoid Intelligence for a Better Tomorrow
            </p>
          </div>
        </div>

        {/* Top Navigation Tabs */}
        <nav className="hidden lg:flex items-center gap-1 bg-slate-950/80 p-1 rounded-2xl border border-slate-800 text-xs font-semibold">
          {topTabs.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-3.5 py-1.5 rounded-xl transition ${
                activeTab === tab
                  ? 'bg-cyan-600 text-white shadow'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {tab}
            </button>
          ))}
        </nav>

        {/* Right Status Indicators */}
        <div className="flex items-center gap-3">
          <div className="hidden sm:flex items-center gap-2 bg-slate-950 px-3 py-1.5 rounded-xl border border-slate-800 text-xs font-mono">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-slate-200 font-bold">MuJoCo Connected</span>
            <span className="text-slate-600">|</span>
            <span className="text-cyan-400 font-bold">500 Hz</span>
          </div>

          <div className="hidden md:block text-xs font-mono text-slate-400">
            {timeStr || '13:52 Thu, 04 Sep 2026'}
          </div>

          {/* User Avatar */}
          <div className="w-9 h-9 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-300 font-bold text-xs shadow">
            👤
          </div>
        </div>
      </header>

      {/* ── Main Workspace Body ── */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Sidebar */}
        <aside className="w-16 md:w-56 bg-slate-900/60 border-r border-slate-800 p-2.5 flex flex-col gap-1 shrink-0 overflow-y-auto">
          {sidebarItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveSidebar(item.id)}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-2xl text-xs font-semibold transition ${
                activeSidebar === item.id
                  ? 'bg-cyan-600 text-white shadow-lg shadow-cyan-950/60'
                  : 'text-slate-400 hover:bg-slate-800/60 hover:text-slate-200'
              }`}
              title={item.label}
            >
              <span className="text-base">{item.icon}</span>
              <span className="hidden md:inline">{item.label}</span>
            </button>
          ))}
        </aside>

        {/* Center Main Dashboard Content */}
        <main className="flex-1 p-4 md:p-5 overflow-y-auto flex flex-col gap-4">
          {/* ── ROW 1: Hero Character & Voice/Authority ── */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
            {/* Left 7 Cols: Meera Lifelike Character & Demonstration Actions */}
            <div className="lg:col-span-7 flex flex-col">
              <MeeraHeroView
                rightArmJoints={rightArmJoints}
                leftArmJoints={leftArmJoints}
                torsoPosition={torsoPosition}
                walkingState="IDLE_STANDING"
                isHardwareConnected={false}
              />
            </div>

            {/* Right 5 Cols: Voice Conversation & Simulation Authority */}
            <div className="lg:col-span-5 flex flex-col gap-4">
              <div className="flex-1">
                <VoiceConversationConsole />
              </div>
              <div>
                <SimulationAuthorityPanel />
              </div>
            </div>
          </div>

          {/* ── ROW 2: Robot State, Manipulation & Task Pipeline ── */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <RobotStateCard />
            <ManipulationCard />
            <TaskExecutionPipeline />
          </div>

          {/* ── ROW 3: Multi-Modal Sensor Feeds (RGB, Depth, World Map, Point Cloud) ── */}
          <div className="flex flex-col gap-2">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider font-mono">
              PERCEPTION & SENSORS (LIVE MUJOCO FEED)
            </h3>
            <SensorFeedsGrid />
          </div>
        </main>
      </div>

      {/* ── Bottom Master Status Footer Bar ── */}
      <footer className="h-14 bg-slate-900 border-t border-slate-800 px-4 md:px-6 flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 rounded-lg bg-cyan-600 flex items-center justify-center text-white text-[10px] font-black">
            M
          </div>
          <span className="font-bold text-white">MEERA — CHATR-H170</span>
          <span className="hidden sm:inline text-slate-500 text-[11px]">
            Autonomous Multilingual AI Humanoid Platform
          </span>
        </div>

        {/* Voice Active Pill */}
        <div className="flex items-center gap-2 bg-slate-950 px-3 py-1.5 rounded-xl border border-slate-800 text-slate-300 font-mono text-[11px]">
          <span className="text-cyan-400 animate-pulse">🔊</span>
          <span>Voice active. Speak to Meera...</span>
        </div>

        {/* Safety & Mode Status */}
        <div className="flex items-center gap-2">
          <span className="px-2.5 py-1 rounded-xl bg-emerald-950 border border-emerald-700 text-emerald-300 font-bold text-[10px] flex items-center gap-1">
            <span>🛡️</span>
            <span>Human Safe Zone: ACTIVE</span>
          </span>

          <button
            onClick={() => setIsEstop(!isEstop)}
            className={`px-3 py-1 rounded-xl font-bold text-[10px] transition shadow flex items-center gap-1 ${
              isEstop
                ? 'bg-red-600 text-white animate-pulse'
                : 'bg-rose-950 hover:bg-rose-900 border border-rose-700 text-rose-300'
            }`}
          >
            <span>🔴</span>
            <span>{isEstop ? 'E-STOP ACTIVATED' : 'E-Stop: READY'}</span>
          </button>

          <span className="hidden lg:inline-block px-2.5 py-1 rounded-xl bg-slate-800 border border-slate-700 text-slate-300 font-bold text-[10px]">
            ⚙️ Simulation Mode [No Real Hardware]
          </span>
        </div>
      </footer>
    </div>
  );
};

export default RobotOsPage;
