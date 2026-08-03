import React, { useState } from 'react';
import { Sparkles, Command, Loader2, Package } from 'lucide-react';
import { OSTemplate } from '../../../../data/os-templates';
import { UniversalExecutiveRuntime } from '../../../../sdk/engines/UniversalExecutiveRuntime';
import { useOSRealtime } from '../../../../hooks/useOSRealtime';

const DepartmentWorkspace = ({ template, deptId, onNavigateToPackage }: { template: OSTemplate, deptId: string, onNavigateToPackage: (pkgId: string) => void }) => {
 const dept = template.departments.find(d => d.id === deptId);
 const [chatHistory, setChatHistory] = React.useState<any[]>([]);
 const [intentInput, setIntentInput] = React.useState('');
 const [isExecuting, setIsExecuting] = React.useState(false);

 // 1. Initial Load
 React.useEffect(() => {
 // Load existing history if any
 setChatHistory([...UniversalExecutiveRuntime.getConversationHistory(deptId)]);
 }, [deptId]);

 // 2. Realtime Event Bus Subscription (No more manual polling)
 useOSRealtime('WorkObjectCreated', (payload) => {
 // We could push a silent notification or update widgets here
 });

 if (!dept) return null;

 const handleExecuteIntent = async (overrideIntent?: string) => {
 const input = overrideIntent || intentInput;
 if (!input.trim()) return;
 
 setIsExecuting(true);
 setIntentInput('');
 
 // Optimistic UI for user message
 const newHistory = [...UniversalExecutiveRuntime.getConversationHistory(deptId), { role: 'user', text: input }];
 setChatHistory(newHistory);
 
 try {
 const response = await UniversalExecutiveRuntime.processCommand(input, dept.id, deptId);
 setChatHistory([...UniversalExecutiveRuntime.getConversationHistory(deptId)]);
 } catch (err: any) {
 console.error('[Command Center] Execution Failed', err);
 } finally {
 setIsExecuting(false);
 }
 };

 return (
 <div className="flex-1 h-full w-full overflow-hidden p-8 relative flex gap-8">
 <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-indigo-500/5 rounded-full blur-[120px] pointer-events-none" />
 
 {/* Main Conversation Column */}
 <div className="flex-1 flex flex-col relative z-10 max-w-4xl mx-auto h-full overflow-hidden">
 
 {/* Header */}
 <div className="flex items-center justify-between mb-6 shrink-0">
 <div>
 <h1 className="text-display font-extrabold text-white tracking-tight flex items-center gap-3">
 <Sparkles className="text-indigo-400" size={28} /> Priyanka
 </h1>
 <p className="text-zinc-400 mt-2 text-secondary">Your intelligent operating brain for all {dept.name} operations.</p>
 </div>
 </div>

 {/* Chat History */}
 <div className="flex-1 overflow-y-auto space-y-6 mb-6 pr-4" style={{ scrollbarWidth: 'none' }}>
 {chatHistory.length === 0 ? (
 <div className="flex flex-col items-center justify-center h-full text-zinc-500">
 <Command size={48} className="mb-4 opacity-20" />
 <p>Hi, I am Priyanka. How can I help you today?</p>
 </div>
 ) : (
 chatHistory.map((msg, i) => (
 <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
 <div className={`max-w-[85%] ${msg.role === 'user' ? 'bg-indigo-600 text-white rounded-2xl rounded-tr-sm' : 'bg-zinc-900/80 border border-zinc-800/80 text-zinc-200 rounded-2xl rounded-tl-sm backdrop-blur-xl'} p-5 shadow-lg`}>
 {msg.role === 'user' ? (
 <p className="text-secondary">{msg.text}</p>
 ) : (
 <div className="space-y-4">
 {/* Text */}
 <p className="text-secondary whitespace-pre-wrap">{msg.response.text}</p>
 
 {/* Widgets */}
 {msg.response.widgets?.map((widget: any, wIndex: number) => (
 <div key={wIndex} className="bg-zinc-950/50 rounded-xl p-4 border border-zinc-800/50">
 {widget.type === 'record' && (
 <div>
 <div className="text-[10px] uppercase font-bold text-zinc-500 mb-2">Record Generated</div>
 <div className="text-emerald-400 font-medium text-secondary">{widget.data.Title || widget.data.id}</div>
 <div className="text-label text-zinc-500 mt-1">Status: {widget.data.Status || 'Draft'}</div>
 </div>
 )}
 {widget.type === 'table' && (
 <div>
 <div className="text-[10px] uppercase font-bold text-zinc-500 mb-2">Data Aggregate</div>
 {widget.data.map((row: any, rIdx: number) => (
 <div key={rIdx} className="text-label text-zinc-300 border-b border-zinc-800/50 py-2 last:border-0 flex justify-between">
 <span>{row.object}</span>
 <span className="font-bold">{row.count}</span>
 </div>
 ))}
 </div>
 )}
 </div>
 ))}

 {/* Explanation */}
 {msg.response.explanation && (
 <div className="text-[11px] text-zinc-500 italic mt-2 border-l-2 border-zinc-800 pl-2">
 Why? {msg.response.explanation}
 </div>
 )}

 {/* Actions */}
 {msg.response.actions && msg.response.actions.length > 0 && (
 <div className="flex flex-wrap gap-2 mt-4 pt-4 border-t border-zinc-800/50">
 {msg.response.actions.map((action: any, aIndex: number) => (
 <button
 key={aIndex}
 onClick={() => handleExecuteIntent(action.intent)}
 className={`px-3 py-1.5 text-label font-bold rounded-lg transition-all ${
 action.variant === 'primary' 
 ? 'bg-indigo-500 hover:bg-indigo-400 text-white shadow-lg shadow-indigo-500/20' 
 : 'bg-zinc-800 hover:bg-zinc-700 text-zinc-300 border border-zinc-700'
 }`}
 >
 {action.label}
 </button>
 ))}
 </div>
 )}
 </div>
 )}
 </div>
 </div>
 ))
 )}
 {isExecuting && (
 <div className="flex justify-start">
 <div className="bg-zinc-900/80 border border-zinc-800/80 rounded-2xl rounded-tl-sm p-5 shadow-lg flex items-center gap-3 text-zinc-400 text-secondary">
 <Loader2 size={16} className="animate-spin text-indigo-400" /> Thinking...
 </div>
 </div>
 )}
 </div>

 {/* Chat Input */}
 <div className="shrink-0">
 <div className="relative">
 <input 
 type="text" 
 value={intentInput}
 onChange={(e) => setIntentInput(e.target.value)}
 onKeyDown={(e) => e.key === 'Enter' && handleExecuteIntent()}
 placeholder={`Ask anything about ${dept.name} or tell me what you'd like to do...`}
 className="w-full bg-zinc-900/80 border border-zinc-700/80 rounded-2xl px-6 py-5 text-secondary text-white focus:outline-none focus:border-indigo-500/50 transition-colors shadow-2xl backdrop-blur-xl"
 />
 <button 
 onClick={() => handleExecuteIntent()}
 disabled={isExecuting || !intentInput.trim()}
 className="absolute right-3 top-3 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white text-label font-bold rounded-xl transition-colors flex items-center gap-2"
 >
 Send
 </button>
 </div>
 
 {/* Quick Suggestions */}
 <div className="flex gap-2 mt-4 px-2 overflow-x-auto" style={{ scrollbarWidth: 'none' }}>
 <span className="text-label font-bold text-zinc-600 uppercase tracking-widest py-1.5 shrink-0">Suggestions:</span>
 {['How are we doing?', 'Create a new position', 'Generate a report', 'Schedule interviews'].map(suggestion => (
 <button 
 key={suggestion}
 onClick={() => handleExecuteIntent(suggestion)}
 className="shrink-0 px-3 py-1.5 bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-white text-label rounded-lg transition-colors border border-zinc-800/50"
 >
 {suggestion}
 </button>
 ))}
 </div>
 </div>
 </div>

 {/* Right Sidebar: Active Capabilities */}
 <div className="w-80 shrink-0 border-l border-zinc-800/60 pl-8 h-full overflow-y-auto" style={{ scrollbarWidth: 'none' }}>
 <h2 className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-6">Installed Modules</h2>
 <div className="space-y-4">
 {dept.modules.map(mod => (
 <div 
 key={mod.id} 
 onClick={() => {
 const targetPkg = MODULE_TO_PACKAGE_MAP[mod.id];
 if (targetPkg) onNavigateToPackage(targetPkg);
 }}
 className="bg-zinc-900/40 border border-zinc-800/60 hover:bg-zinc-900/80 transition-all cursor-pointer rounded-xl p-4 flex items-center gap-4 group"
 >
 <div className="w-10 h-10 rounded-xl bg-zinc-800/80 flex items-center justify-center border border-zinc-700/50 group-hover:border-indigo-500/50 transition-colors">
 <Package size={16} className="text-zinc-400 group-hover:text-indigo-400 transition-colors" />
 </div>
 <div>
 <h3 className="text-white font-bold text-secondary mb-0.5">{mod.name}</h3>
 <span className="text-[9px] uppercase font-bold text-zinc-500">{mod.type} Module</span>
 </div>
 </div>
 ))}
 </div>
 </div>
 </div>
 );
};

export { DepartmentWorkspace };
