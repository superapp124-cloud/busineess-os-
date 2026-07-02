import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Bot, 
  ArrowLeft, 
  Settings, 
  BrainCircuit,
  MessageSquare,
  Workflow,
  Send,
  Loader2,
  FileText,
  Activity,
  CheckCircle2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

import { useService } from '@/platform/Infrastructure/PlatformContext';

export const AgentWorkspace: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const aiPlatform = useService<any>('AIPlatform'); // Will cast to correct type when exported
  
  const [agentName, setAgentName] = useState('Loading Agent...');
  const [messages, setMessages] = useState<{role: 'user' | 'agent', text: string}[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);

  useEffect(() => {
    // Simulate fetch of agent details
    setTimeout(() => {
      setAgentName(id === '1' ? 'RecruitmentOS Sourcing Agent' : 
                   id === '6' ? 'Sales & CRM Agent' : 
                   `Specialized Agent Workspace`);
      
      setMessages([
        { 
          role: 'agent', 
          text: `Hello! I am initialized and ready to execute workflows via the CHATR Runtime. What would you like me to do?` 
        }
      ]);
    }, 200);
  }, [id]);

  const handleSendMessage = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!inputValue.trim()) return;

    const query = inputValue.trim();
    const newMsg = { role: 'user' as const, text: query };
    setMessages(prev => [...prev, newMsg, { role: 'agent', text: '' }]);
    setInputValue('');
    setIsTyping(true);

    try {
      // Consume the AI Platform streaming API
      await aiPlatform.chatStream(
        query,
        (chunk: string) => {
          setMessages(prev => {
            const copy = [...prev];
            copy[copy.length - 1].text += chunk;
            return copy;
          });
        },
        (full: string) => {
          setIsTyping(false);
        },
        `agent-workspace-${id}`,
        'anonymous'
      );
    } catch (err: any) {
      setMessages(prev => {
        const copy = [...prev];
        copy[copy.length - 1].text = `Error: ${err.message}`;
        return copy;
      });
      setIsTyping(false);
    }
  };

  return (
    <div className="flex h-full w-full bg-slate-50 dark:bg-[#121422] overflow-hidden">
      
      {/* Left Pane - Workflow & Context */}
      <div className="w-[400px] border-r border-slate-200 dark:border-white/10 bg-white dark:bg-[#181A2A] flex flex-col z-10 shrink-0">
        
        {/* Header */}
        <div className="p-4 border-b border-slate-200 dark:border-white/10 flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => navigate('/desktop/marketplace')} className="text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-white">
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div className="w-10 h-10 rounded-lg bg-[#5c22ff]/10 flex items-center justify-center shrink-0">
            <Bot className="w-5 h-5 text-[#5c22ff]" />
          </div>
          <div className="flex-1 overflow-hidden">
            <h2 className="font-bold text-slate-800 dark:text-white text-sm truncate">{agentName}</h2>
            <div className="flex items-center gap-1.5 text-xs text-emerald-600 dark:text-emerald-400 font-medium">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              Execution Engine Active
            </div>
          </div>
          <Button variant="ghost" size="icon" className="text-slate-400 dark:text-slate-500">
            <Settings className="w-5 h-5" />
          </Button>
        </div>

        {/* Status Dashboard */}
        <ScrollArea className="flex-1 p-4">
          <div className="space-y-6">
            
            {/* Live Context */}
            <section>
              <h3 className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-3 flex items-center gap-2">
                <BrainCircuit className="w-4 h-4" /> Live Context Graph
              </h3>
              <div className="space-y-2">
                <Card className="p-3 border-slate-100 dark:border-white/5 bg-slate-50/50 dark:bg-white/5 shadow-none">
                  <div className="flex items-start gap-3">
                    <FileText className="w-4 h-4 text-blue-500 mt-0.5 shrink-0" />
                    <div>
                      <p className="text-xs font-semibold text-slate-700 dark:text-slate-200">Clipboard Detected</p>
                      <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5 line-clamp-2">"Q3 Marketing budget allocation and sales targeting for enterprise clients..."</p>
                    </div>
                  </div>
                </Card>
                <Card className="p-3 border-slate-100 dark:border-white/5 bg-slate-50/50 dark:bg-white/5 shadow-none">
                  <div className="flex items-start gap-3">
                    <Activity className="w-4 h-4 text-amber-500 mt-0.5 shrink-0" />
                    <div>
                      <p className="text-xs font-semibold text-slate-700 dark:text-slate-200">Pending Approvals</p>
                      <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">2 workflows require your sign-off to proceed.</p>
                    </div>
                  </div>
                </Card>
              </div>
            </section>

            {/* Background Workflows */}
            <section>
              <h3 className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-3 flex items-center gap-2">
                <Workflow className="w-4 h-4" /> Running Workflows
              </h3>
              <Card className="p-4 border-slate-200 dark:border-white/10 dark:bg-[#181A2A]">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-semibold text-slate-700 dark:text-slate-200">Data Synchronization</span>
                  <span className="text-[10px] font-bold text-[#5c22ff] dark:text-[#8a5fff]">In Progress</span>
                </div>
                <div className="w-full bg-slate-100 dark:bg-white/10 rounded-full h-1.5 mb-2">
                  <div className="bg-[#5c22ff] h-1.5 rounded-full w-[45%]"></div>
                </div>
                <p className="text-[10px] text-slate-500 dark:text-slate-400">Syncing CRM records with local vector store...</p>
              </Card>
            </section>
          </div>
        </ScrollArea>
      </div>

      {/* Right Pane - Agent Chat UI */}
      <div className="flex-1 flex flex-col bg-white dark:bg-[#121422]">
        
        {/* Chat Header */}
        <div className="h-16 border-b border-slate-200 dark:border-white/10 px-6 flex items-center shadow-sm z-10 bg-white dark:bg-[#181A2A]">
          <MessageSquare className="w-5 h-5 text-slate-400 dark:text-slate-500 mr-3" />
          <h2 className="font-semibold text-slate-700 dark:text-white">Workspace Execution Chat</h2>
        </div>

        {/* Chat Messages */}
        <ScrollArea className="flex-1 p-6 bg-slate-50/50 dark:bg-[#121422]">
          <div className="max-w-3xl mx-auto space-y-6">
            {messages.map((msg, i) => (
              <div key={i} className={`flex gap-4 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                {msg.role === 'agent' && (
                  <div className="w-8 h-8 rounded-full bg-[#5c22ff]/10 flex items-center justify-center shrink-0 mt-1">
                    <Bot className="w-4 h-4 text-[#5c22ff]" />
                  </div>
                )}
                
                <div className={`max-w-[80%] rounded-2xl px-5 py-3.5 text-sm whitespace-pre-wrap ${
                  msg.role === 'user' 
                    ? 'bg-[#5c22ff] text-white shadow-sm' 
                    : 'bg-white dark:bg-[#181A2A] border border-slate-200 dark:border-white/10 text-slate-700 dark:text-slate-200 shadow-sm'
                }`}>
                  {msg.text}
                </div>
              </div>
            ))}
            
            {isTyping && (
              <div className="flex gap-4 justify-start">
                <div className="w-8 h-8 rounded-full bg-[#5c22ff]/10 flex items-center justify-center shrink-0 mt-1">
                  <Bot className="w-4 h-4 text-[#5c22ff]" />
                </div>
                <div className="bg-white dark:bg-[#181A2A] border border-slate-200 dark:border-white/10 rounded-2xl px-5 py-3.5 flex items-center gap-2">
                  <Loader2 className="w-4 h-4 text-[#5c22ff] animate-spin" />
                  <span className="text-xs text-slate-500 font-medium">Executing...</span>
                </div>
              </div>
            )}
          </div>
        </ScrollArea>

        {/* Input Area */}
        <div className="p-4 bg-white dark:bg-[#181A2A] border-t border-slate-200 dark:border-white/10">
          <div className="max-w-3xl mx-auto">
            <form onSubmit={handleSendMessage} className="relative flex items-center">
              <Input 
                value={inputValue}
                onChange={e => setInputValue(e.target.value)}
                placeholder={`Ask ${agentName} to perform a task...`}
                className="pl-4 pr-12 h-12 bg-slate-50 dark:bg-[#121422] border-slate-200 dark:border-white/10 text-slate-900 dark:text-white focus:border-[#5c22ff]/50 rounded-xl"
              />
              <Button 
                type="submit" 
                size="icon" 
                className="absolute right-1.5 h-9 w-9 bg-[#5c22ff] hover:bg-[#4b1ac4] text-white rounded-lg"
                disabled={!inputValue.trim() || isTyping}
              >
                <Send className="w-4 h-4" />
              </Button>
            </form>
            <div className="mt-2 text-center">
              <span className="text-[10px] text-slate-400 dark:text-slate-500 font-medium flex items-center justify-center gap-1">
                <CheckCircle2 className="w-3 h-3" /> Powered by CHATR AI Execution Engine
              </span>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};
