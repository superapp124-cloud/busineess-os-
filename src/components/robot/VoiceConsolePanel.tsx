/**
 * CHATR Multi-Lingual Voice & Task Console (Gate 7 UI)
 * Supports English, Hindi, Urdu, Punjabi, Bengali, Tamil, and Telugu natural speech,
 * displays Ollama JSON proposals, and renders native operational explanations.
 */

import React, { useState } from 'react';
import { IndianLanguage, ValidatedRobotTaskPlan } from '../../../packages/robot-ai-bridge/src/types';

interface VoiceConsolePanelProps {
  onExecutePrompt: (promptText: string) => void;
  activePlan: ValidatedRobotTaskPlan | null;
  isProcessing: boolean;
}

export const VoiceConsolePanel: React.FC<VoiceConsolePanelProps> = ({
  onExecutePrompt,
  activePlan,
  isProcessing,
}) => {
  const [inputText, setInputText] = useState('Kitchen se paani ki bottle mere paas le aao');

  const languagePresets: Array<{ label: string; lang: IndianLanguage; text: string }> = [
    { label: 'Hindi (Hinglish)', lang: 'hi', text: 'Kitchen se paani ki bottle mere paas le aao' },
    { label: 'Hindi (Devanagari)', lang: 'hi', text: 'रसोई से पानी की बोतल ले आओ' },
    { label: 'Urdu (Nastaliq)', lang: 'ur', text: 'باورچی خانہ سے پانی کی بوتل لے آؤ' },
    { label: 'Punjabi (Gurmukhi)', lang: 'pa', text: 'ਪਾਣੀ ਦੀ ਬੋਤਲ ਲੈ ਕੇ ਆਓ' },
    { label: 'Bengali', lang: 'bn', text: 'রান্নাঘর থেকে জলের বোতল নিয়ে এসো' },
    { label: 'Tamil', lang: 'ta', text: 'Samaiyalariyilirundhu thanneer bottle eduthu vaarungal' },
    { label: 'Telugu', lang: 'te', text: 'Vantagadi nundi neella bottle theesukurandi' },
    { label: 'English', lang: 'en', text: 'Bring me the water bottle from the kitchen' },
    { label: 'Ambiguous Reference', lang: 'hi', text: 'Woh wali bottle le aao' },
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputText.trim()) {
      onExecutePrompt(inputText.trim());
    }
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex flex-col gap-3 shadow-lg">
      <div className="flex items-center justify-between border-b border-slate-800 pb-2">
        <div className="flex items-center gap-2">
          <span className="text-sm font-bold text-slate-200">MULTI-LINGUAL VOICE & TASK CONSOLE</span>
          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-purple-500/20 text-purple-300 border border-purple-500/30 font-bold">
            7 FIRST-CLASS INDIAN LANGUAGES
          </span>
        </div>
        <span className="text-[11px] font-mono text-emerald-400">Ollama Engine: Localhost:11434 (Ready)</span>
      </div>

      {/* Preset Quick Selectors */}
      <div className="flex flex-wrap gap-1.5">
        {languagePresets.map((preset, idx) => (
          <button
            key={idx}
            type="button"
            onClick={() => {
              setInputText(preset.text);
              onExecutePrompt(preset.text);
            }}
            className="text-[10px] px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 transition"
          >
            {preset.label}
          </button>
        ))}
      </div>

      {/* Input Form */}
      <form onSubmit={handleSubmit} className="flex gap-2">
        <input
          type="text"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          placeholder="Speak or type a command in Hindi, Urdu, Punjabi, Bengali, Tamil, Telugu, English..."
          className="flex-1 bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-500"
        />
        <button
          type="submit"
          disabled={isProcessing}
          className="bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-semibold px-4 py-2 rounded-lg transition disabled:opacity-50"
        >
          {isProcessing ? 'Processing...' : 'Send Command'}
        </button>
      </form>

      {/* Plan & Operational Explainer Output */}
      {activePlan && (
        <div className="flex flex-col gap-2 bg-slate-950 p-3 rounded-lg border border-slate-800 mt-1">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono bg-cyan-950 text-cyan-400 px-2 py-0.5 rounded border border-cyan-800">
                LANG: {activePlan.task.detectedLanguage.toUpperCase()}
              </span>
              <span className="text-[10px] font-mono bg-indigo-950 text-indigo-400 px-2 py-0.5 rounded border border-indigo-800">
                INTENT: {activePlan.task.intent}
              </span>
              {activePlan.task.isAmbiguousReference && (
                <span className="text-[10px] font-mono bg-amber-950 text-amber-400 px-2 py-0.5 rounded border border-amber-800">
                  DEICTIC AMBIGUITY RESOLVED
                </span>
              )}
            </div>
            <span
              className={`text-[10px] font-mono font-bold ${
                activePlan.isApprovedForExecution ? 'text-emerald-400' : 'text-rose-400'
              }`}
            >
              STATUS: {activePlan.validationStatus}
            </span>
          </div>

          <div className="text-sm font-semibold text-slate-200 bg-slate-900/90 p-2.5 rounded border border-slate-800">
            💬 <span className="text-cyan-300 font-bold">Operational AI Explainer:</span> {activePlan.explanation}
          </div>

          {activePlan.rejectionReason && (
            <div className="text-xs font-mono text-rose-400 bg-rose-950/40 p-2 rounded border border-rose-800">
              ⚠️ Gating Reason: {activePlan.rejectionReason}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
