import React from 'react';
import { OSTemplate } from '../../../../data/os-templates';

const PlatformSettingsView = ({ template }: { template: OSTemplate }) => (
 <div className="flex-1 overflow-y-auto p-10 bg-[#09090b] h-full relative" style={{ scrollbarWidth: 'none' }}>
 <div className="max-w-4xl mx-auto">
 <div className="mb-10">
 <h1 className="text-display font-extrabold text-white tracking-tight">Platform Settings</h1>
 <p className="text-secondary text-zinc-400 mt-2">Configure AI parameters, automation guardrails, and system preferences.</p>
 </div>

 <div className="space-y-10">
 <div>
 <h2 className="text-label font-bold text-zinc-500 uppercase tracking-widest mb-4">AI Engine Configuration</h2>
 <div className="bg-zinc-900/60 border border-zinc-800/80 rounded-2xl p-6 backdrop-blur-xl">
 <div className="flex items-center justify-between mb-6 border-b border-zinc-800/60 pb-6">
 <div>
 <div className="font-bold text-white mb-1">Local Edge Intelligence</div>
 <div className="text-secondary text-zinc-500">Run Llama 3 locally for maximum privacy and zero latency.</div>
 </div>
 <div className="w-12 h-6 bg-indigo-500 rounded-full relative cursor-pointer">
 <div className="absolute right-1 top-1 w-4 h-4 bg-white rounded-full shadow-sm" />
 </div>
 </div>
 <div className="flex items-center justify-between">
 <div>
 <div className="font-bold text-white mb-1">Cloud Intelligence (GPT-4)</div>
 <div className="text-secondary text-zinc-500">Fallback to OpenAI for complex reasoning tasks.</div>
 </div>
 <div className="w-12 h-6 bg-emerald-500 rounded-full relative cursor-pointer">
 <div className="absolute right-1 top-1 w-4 h-4 bg-white rounded-full shadow-sm" />
 </div>
 </div>
 </div>
 </div>

 <div>
 <h2 className="text-label font-bold text-zinc-500 uppercase tracking-widest mb-4">Automation Guardrails</h2>
 <div className="bg-zinc-900/60 border border-zinc-800/80 rounded-2xl p-6 backdrop-blur-xl space-y-4">
 {[
 { label: 'Require human approval for payments over $500', enabled: true },
 { label: 'Allow AI to automatically email external clients', enabled: false },
 { label: 'Auto-provision employee accounts on onboarding', enabled: true },
 { label: 'Self-healing workflows on task failure', enabled: true },
 ].map((rule, i) => (
 <div key={i} className="flex items-center justify-between p-3.5 bg-zinc-950/50 rounded-xl border border-zinc-800/50">
 <span className="text-secondary text-zinc-300 font-medium">{rule.label}</span>
 <div className={`w-10 h-5 rounded-full relative cursor-pointer ${rule.enabled ? 'bg-indigo-500' : 'bg-zinc-700'}`}>
 <div className={`absolute top-1 w-3 h-3 bg-white rounded-full transition-all ${rule.enabled ? 'right-1' : 'left-1'}`} />
 </div>
 </div>
 ))}
 </div>
 </div>
 </div>
 </div>
 </div>
);

export { PlatformSettingsView };
