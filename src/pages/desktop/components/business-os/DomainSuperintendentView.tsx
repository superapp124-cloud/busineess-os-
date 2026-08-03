import React, { useState, useEffect } from 'react';
import type { OSTemplate } from '../../../../data/os-templates';
import { ListTree, Play, Loader2, CheckCircle2, Sparkles, Settings, ArrowRight } from 'lucide-react';

const DomainSuperintendentView = ({ template }: { template: OSTemplate }) => {
  const [messages, setMessages] = useState<any[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [actions, setActions] = useState(template.superintendent.actions);

  useEffect(() => {
    setMessages([
      { role: 'ai', content: template.superintendent.messages.ai1 },
      { role: 'user', content: template.superintendent.messages.user1 },
      { role: 'ai', content: template.superintendent.messages.ai2 }
    ]);
    setActions(template.superintendent.actions);
  }, [template]);

  const [isTyping, setIsTyping] = useState(false);

  const handleSend = async () => {
    if (!inputValue.trim()) return;
    const userText = inputValue;
    setMessages(prev => [...prev, { role: 'user', content: userText }]);
    setInputValue('');
    setIsTyping(true);
    
    try {
      // Phase 7C/7D: Real Execution Pipeline
      
      // 1. Intent Runtime (Mocked parsing for demo)
      const intent = { intent: 'prepare_offer', entity: 'Candidate', target: userText };
      
      // 2. Context Runtime (The Moat)
      const context = ContextRuntime.buildContext(intent);
      
      // 3. Goal Planner
      const plan = GoalPlanner.createPlan(context);
      
      // Visualizer
      setMessages(prev => [...prev, { 
        role: 'ai', 
        content: (
          <div>
            <div className="flex items-center gap-2 text-indigo-400 font-medium mb-3">
              <ListTree size={16} /> Generated Execution Graph (DAG)
            </div>
            <div className="text-secondary text-zinc-400 mb-4">
              I have analyzed your intent and built the following execution graph across your installed business capabilities.
            </div>
            <div className="space-y-3">
              {plan.nodes.map(node => (
                <div key={node.id} className="p-3 bg-zinc-950/80 border border-zinc-800 rounded-xl relative">
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="text-[10px] uppercase font-bold tracking-widest text-emerald-400 mr-2 bg-emerald-500/10 px-1.5 py-0.5 rounded border border-emerald-500/20">{node.type}</span>
                      <span className="font-bold text-white text-secondary">{node.name}</span>
                      <p className="text-label text-zinc-500 mt-1.5">{node.description}</p>
                    </div>
                  </div>
                  {node.dependencies.length > 0 && (
                    <div className="mt-2 text-[10px] text-zinc-600 font-mono bg-zinc-900 inline-block px-2 py-0.5 rounded">
                      Depends on: {node.dependencies.join(', ')}
                    </div>
                  )}
                </div>
              ))}
            </div>
            <button 
              onClick={() => handleExecuteGraph(plan)}
              className="mt-5 px-5 py-2.5 bg-indigo-500 hover:bg-indigo-400 text-white font-bold rounded-xl text-secondary flex items-center gap-2 transition-colors shadow-[0_0_20px_rgba(99,102,241,0.3)]"
            >
              <Play size={16} fill="currentColor" /> Authorize Execution
            </button>
          </div>
        )
      }]);
    } catch (err) {
      console.error(err);
      setMessages(prev => [...prev, { role: 'ai', content: 'Sorry, I encountered an error planning that request.' }]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleExecuteGraph = async (plan: IExecutionGraph) => {
    setMessages(prev => [...prev, {
      role: 'ai',
      content: <div className="flex items-center gap-2 text-emerald-400"><Loader2 size={16} className="animate-spin" /> Executing Business Graph...</div>
    }]);

    // 4. Execution Runtime
    const result = await ExecutionRuntime.execute(plan);

    setMessages(prev => [...prev, {
      role: 'ai',
      content: (
        <div>
          <div className="flex items-center gap-2 text-emerald-400 font-medium mb-3">
            <CheckCircle2 size={16} /> Execution Completed
          </div>
          <div className="p-3 bg-zinc-950 rounded-lg text-label font-mono text-zinc-400 border border-zinc-800 h-32 overflow-y-auto">
            {result.logs.map((log, i) => <div key={i}>{log}</div>)}
          </div>
          <p className="text-secondary text-zinc-300 mt-3">The graph has finished executing. 1 item requires your human approval (Policy Enforcement).</p>
        </div>
      )
    }]);
  };

  const handleApproveAction = (idx: number) => {
    if (actions[idx].status !== 'Pending Approval') return;
    const updated = [...actions];
    updated[idx] = { ...updated[idx], status: 'Active' };
    setActions(updated);

    setMessages(prev => [...prev, { 
      role: 'ai', 
      content: <><div className="flex items-center gap-2 text-emerald-400 font-medium"><CheckCircle2 size={16} /> Action Approved: {updated[idx].title}</div><p className="mt-2">Executing automation workflow immediately.</p></>
    }]);
  };

  return (
    <div className="flex-1 overflow-y-auto p-10 bg-[#09090b] h-full relative" style={{ scrollbarWidth: 'none' }}>
      {/* Ambient Glow */}
      <div className={`absolute top-0 right-0 w-[500px] h-[500px] bg-gradient-to-br ${template.superintendent.iconColor} opacity-10 rounded-full blur-[120px] pointer-events-none`} />
      
      <div className="max-w-6xl mx-auto space-y-8 relative z-10">
        <div className="flex items-center justify-between border-b border-zinc-800/80 pb-6">
          <div className="flex items-center gap-5">
            <div className={`w-16 h-16 bg-gradient-to-br ${template.superintendent.iconColor} rounded-2xl flex items-center justify-center shadow-[0_0_30px_rgba(99,102,241,0.3)] border border-white/10`}>
              <Sparkles size={28} className="text-white" />
            </div>
            <div>
              <h1 className="text-display font-extrabold text-white tracking-tight">{template.superintendent.name}</h1>
              <div className="flex items-center gap-3 mt-2">
                <span className="flex items-center gap-1.5 text-label font-bold px-2.5 py-1 bg-emerald-500/10 text-emerald-400 rounded-lg">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" /> Active
                </span>
                <span className="text-secondary text-zinc-400 font-medium">{template.superintendent.description}</span>
              </div>
            </div>
          </div>
          <button className="px-5 py-2.5 bg-white text-black font-bold rounded-xl hover:bg-zinc-200 transition-colors flex items-center gap-2">
            <Settings size={16} /> Configure AI
          </button>
        </div>

        <div className="grid grid-cols-3 gap-6">
          {/* Main Chat Interface */}
          <div className="col-span-2 bg-zinc-900/60 border border-zinc-800/80 rounded-2xl p-1 flex flex-col h-[600px] backdrop-blur-xl shadow-2xl">
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {messages.map((msg, i) => (
                <div key={i} className={`flex gap-4 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border ${msg.role === 'user' ? 'bg-emerald-500/20 border-emerald-500/30' : 'bg-indigo-500/20 border-indigo-500/30'}`}>
                    {msg.role === 'user' ? <span className="text-emerald-400 font-bold text-secondary">You</span> : <Sparkles size={20} className="text-indigo-400" />}
                  </div>
                  <div className={`p-4 rounded-2xl text-secondary shadow-sm ${msg.role === 'user' ? 'bg-emerald-600 text-white rounded-tr-sm' : 'bg-zinc-800/50 border border-zinc-700/50 text-zinc-200 rounded-tl-sm space-y-3'}`}>
                    {msg.content}
                  </div>
                </div>
              ))}
            </div>
            
            <div className="p-4 border-t border-zinc-800/80 bg-zinc-950/50 rounded-b-2xl">
              <div className="relative">
                <input 
                  type="text" 
                  value={inputValue}
                  onChange={e => setInputValue(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleSend()}
                  placeholder="Ask Superintendent to execute workflows, query data, or change policies..." 
                  className="w-full bg-zinc-900 border border-zinc-700/80 rounded-xl py-3 pl-4 pr-12 text-secondary text-white focus:outline-none focus:border-indigo-500/50 shadow-inner" 
                />
                <button onClick={handleSend} className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center hover:bg-indigo-500 transition-colors">
                  <ArrowRight size={16} className="text-white" />
                </button>
              </div>
            </div>
          </div>

          {/* Right Sidebar */}
          <div className="space-y-6">
            <div className="bg-zinc-900/60 border border-zinc-800/80 rounded-2xl p-5 backdrop-blur-xl">
              <h3 className="text-label font-bold text-zinc-500 uppercase tracking-widest mb-4">Autonomous Actions</h3>
              <div className="space-y-3">
                {actions.map((action, idx) => (
                  <div 
                    key={action.title} 
                    onClick={() => handleApproveAction(idx)}
                    className={`flex items-start gap-3 p-3 bg-zinc-950/50 border border-zinc-800/50 rounded-xl ${action.status === 'Pending Approval' ? 'cursor-pointer hover:border-amber-500/50 hover:bg-zinc-900/80 transition-colors group' : ''}`}
                  >
                    <action.icon size={16} className="text-indigo-400 shrink-0 mt-0.5" />
                    <div className="flex-1">
                      <div className="text-secondary font-bold text-zinc-200">{action.title}</div>
                      <div className="text-[10px] text-zinc-500 mt-0.5">{action.desc}</div>
                      <div className="flex justify-between items-center mt-2">
                        <div className={`text-[9px] font-bold inline-block px-1.5 py-0.5 rounded ${action.status === 'Active' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-amber-500/10 text-amber-400 group-hover:bg-amber-500/20'}`}>
                          {action.status}
                        </div>
                        {action.status === 'Pending Approval' && (
                          <div className="text-[9px] font-bold text-indigo-400 opacity-0 group-hover:opacity-100 transition-opacity">
                            Click to Approve
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-zinc-900/60 border border-zinc-800/80 rounded-2xl p-5 backdrop-blur-xl">
              <h3 className="text-label font-bold text-zinc-500 uppercase tracking-widest mb-4">Semantic Graph Access</h3>
              <div className="flex flex-wrap gap-2">
                {template.superintendent.knowledgeGraph.map(node => (
                  <span key={node} className="px-2 py-1 bg-zinc-800 text-zinc-300 text-label rounded border border-zinc-700">{node}</span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export { DomainSuperintendentView };
