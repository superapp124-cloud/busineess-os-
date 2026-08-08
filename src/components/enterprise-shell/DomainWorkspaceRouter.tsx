import React, { useState } from 'react';
import {
  MessageSquare, Inbox, Phone, FileText, Layout, Folder, Calendar, CheckSquare, Users, Ticket,
  Target, Bot, BarChart2, ShieldCheck, Store, Package, Hammer, Terminal, Activity,
  Key, HeartPulse, Settings, CheckCircle2, AlertTriangle, ArrowRight, UserCheck, Stethoscope, Briefcase, Award, Zap,
  Search, Filter, Plus, ExternalLink, Download, Clock, DollarSign, ArrowUpRight, TrendingUp, ShieldAlert, FileSearch, Sparkles,
  ArrowLeft
} from 'lucide-react';
import { MissionExecutionContext } from '../../core/types';
import { EnterpriseCanvas } from '../enterprise-canvas/EnterpriseCanvas';
import { EnterpriseEvaluationDashboard } from '../enterprise-evaluation/EnterpriseEvaluationDashboard';
import { UniversalInspectorModal, InspectorPayload } from './UniversalInspectorModal';
import { AIAgentsHub } from '../ai-agents/AIAgentsHub';
import { identityRuntime } from '../../core/identity/IdentityRuntime';
import { intentStore } from '../../core/intent/IntentStore';
import { customerEvidenceFramework } from '../../core/evaluation/CustomerEvidenceFramework';

interface Props {
  activeDomain: string;
  missionContext: MissionExecutionContext | null;
  canvasMode: 'Review' | 'Decision' | 'Execution' | 'Audit';
  isProcessing?: boolean;
  onNavigate: (domain: string) => void;
  onUploadClick?: () => void;
}

// ─── Sub-Workspace Components for Interactive Quick Actions ─────────────────

const AIChatWorkspace: React.FC<{ onBackToHome: () => void }> = ({ onBackToHome }) => {
  const [messages, setMessages] = useState([
    { id: '1', sender: 'ai', text: 'Hello! I am your CHATR AI Assistant. How can I help you summarize a document, draft an email, or automate a task today?' }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);

  const handleSend = () => {
    if (!input.trim()) return;
    const userMsg = { id: Date.now().toString(), sender: 'user', text: input };
    setMessages(prev => [...prev, userMsg]);
    const query = input;
    setInput('');
    setIsTyping(true);

    setTimeout(() => {
      let aiText = "I'm analyzing your request. CHATR AI Document Intelligence can extract key clauses, verify invoice data against ERP, or generate automated summary reports for your files.";
      const q = query.toLowerCase();
      if (q.includes('summary') || q.includes('document') || q.includes('charles')) {
        aiText = "Based on CHARLES HOPKINS.docx: This candidate is a Senior Platform Engineer with 8.3 years of experience. ATS Score is 92/100 (Exceeds L5 Hiring Threshold). Compensation expectation is within approved band.";
      } else if (q.includes('invoice') || q.includes('supplier')) {
        aiText = "Invoice INV-28491 from Supplier ACME Corp has been 3-way matched against SAP PO #88912. Total amount: ₹45,200. Tax reconciliation verified.";
      } else if (q.includes('task') || q.includes('todo')) {
        aiText = "Task created! I have added 'Review Executive Roadmap' to your task list due today at 5:00 PM.";
      }
      setMessages(prev => [...prev, { id: (Date.now() + 1).toString(), sender: 'ai', text: aiText }]);
      setIsTyping(false);
    }, 600);
  };

  return (
    <div className="flex-1 flex flex-col bg-slate-50 h-full overflow-hidden">
      <div className="bg-white border-b border-slate-200 p-4 flex justify-between items-center shadow-2xs shrink-0">
        <div className="flex items-center gap-3">
          <button
            onClick={onBackToHome}
            className="px-3 py-1.5 bg-slate-100 hover:bg-indigo-50 text-slate-700 hover:text-indigo-600 rounded-lg text-xs font-bold transition-colors flex items-center gap-1.5 cursor-pointer border border-slate-200 shadow-2xs"
          >
            <ArrowLeft className="w-3.5 h-3.5 text-indigo-600" />
            <span>Back to Home</span>
          </button>
          <div className="h-4 w-px bg-slate-200" />
          <div className="flex items-center gap-2">
            <MessageSquare className="w-5 h-5 text-indigo-600" />
            <div>
              <h2 className="text-sm font-bold text-slate-900">CHATR AI Assistant</h2>
              <p className="text-[11px] text-slate-500">Ask questions about your documents, tasks, or workflows</p>
            </div>
          </div>
        </div>
        <span className="text-[10px] font-bold bg-emerald-100 text-emerald-800 px-2.5 py-0.5 rounded-full border border-emerald-200 flex items-center gap-1">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span> AI Active
        </span>
      </div>

      <div className="flex-1 overflow-y-auto p-6 space-y-4">
        {messages.map(m => (
          <div key={m.id} className={`flex ${m.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-xl p-4 rounded-2xl text-xs leading-relaxed shadow-2xs ${
              m.sender === 'user'
                ? 'bg-indigo-600 text-white rounded-br-none'
                : 'bg-white text-slate-800 border border-slate-200 rounded-bl-none'
            }`}>
              {m.text}
            </div>
          </div>
        ))}
        {isTyping && (
          <div className="flex justify-start">
            <div className="bg-white border border-slate-200 p-3 rounded-2xl text-xs text-slate-400 flex items-center gap-2">
              <Sparkles className="w-3.5 h-3.5 text-indigo-500 animate-spin" />
              <span>CHATR AI is thinking...</span>
            </div>
          </div>
        )}
      </div>

      <div className="p-4 bg-white border-t border-slate-200 flex items-center gap-3 shrink-0">
        <input
          type="text"
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && handleSend()}
          placeholder="Ask AI anything about your files, tasks, or contracts..."
          className="flex-1 px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-indigo-500"
        />
        <button
          onClick={handleSend}
          className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-xl shadow-xs transition-colors cursor-pointer"
        >
          Send
        </button>
      </div>
    </div>
  );
};

const TaskTrackerWorkspace: React.FC<{ onBackToHome: () => void }> = ({ onBackToHome }) => {
  const [tasks, setTasks] = useState([
    { id: '1', title: 'Review CHARLES HOPKINS.docx Candidate Resume', done: false, category: 'Document Analysis' },
    { id: '2', title: 'Verify ACME Corp Supplier Invoice INV-28491', done: true, category: 'Finance' },
    { id: '3', title: 'Finalize Q3 Roadmap & Executive Strategy Align', done: false, category: 'Executive' },
    { id: '4', title: 'Schedule Candidate Technical Interview', done: false, category: 'Talent' },
  ]);
  const [newTaskTitle, setNewTaskTitle] = useState('');

  const addTask = () => {
    if (!newTaskTitle.trim()) return;
    setTasks(prev => [{ id: Date.now().toString(), title: newTaskTitle, done: false, category: 'General' }, ...prev]);
    setNewTaskTitle('');
  };

  const toggleTask = (id: string) => {
    setTasks(prev => prev.map(t => t.id === id ? { ...t, done: !t.done } : t));
  };

  return (
    <div className="flex-1 bg-slate-50 p-6 overflow-y-auto space-y-6 max-w-5xl mx-auto w-full">
      <div className="flex justify-between items-center bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs">
        <div className="flex items-center gap-3">
          <button
            onClick={onBackToHome}
            className="px-3 py-1.5 bg-slate-100 hover:bg-indigo-50 text-slate-700 hover:text-indigo-600 rounded-lg text-xs font-bold transition-colors flex items-center gap-1.5 cursor-pointer border border-slate-200 shadow-2xs"
          >
            <ArrowLeft className="w-3.5 h-3.5 text-indigo-600" />
            <span>Back to Home</span>
          </button>
          <div className="h-4 w-px bg-slate-200" />
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <CheckSquare className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-slate-900">Task Tracker & To-Do List</h1>
            <p className="text-xs text-slate-500">Organize follow-up actions and team tasks</p>
          </div>
        </div>
        <span className="text-xs font-bold bg-emerald-100 text-emerald-800 px-3 py-1 rounded-full border border-emerald-200">
          {tasks.filter(t => !t.done).length} Pending Tasks
        </span>
      </div>

      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs flex items-center gap-3">
        <input
          type="text"
          value={newTaskTitle}
          onChange={e => setNewTaskTitle(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && addTask()}
          placeholder="Add a new task or follow-up item..."
          className="flex-1 px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-indigo-500"
        />
        <button
          onClick={addTask}
          className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl shadow-xs transition-colors cursor-pointer flex items-center gap-1.5"
        >
          <Plus className="w-4 h-4" /> Add Task
        </button>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-2xs space-y-3">
        <h2 className="text-xs font-bold uppercase tracking-wider text-slate-500">Your Tasks</h2>
        <div className="space-y-2">
          {tasks.map(t => (
            <div
              key={t.id}
              onClick={() => toggleTask(t.id)}
              className={`p-3.5 rounded-xl border transition-all flex items-center justify-between cursor-pointer ${
                t.done ? 'bg-slate-50 border-slate-200 opacity-60' : 'bg-white border-slate-200 hover:border-emerald-300'
              }`}
            >
              <div className="flex items-center gap-3">
                <div className={`w-5 h-5 rounded-md border flex items-center justify-center transition-colors ${
                  t.done ? 'bg-emerald-500 border-emerald-500 text-white' : 'border-slate-300 bg-white'
                }`}>
                  {t.done && <CheckCircle2 className="w-3.5 h-3.5" />}
                </div>
                <span className={`text-xs font-semibold ${t.done ? 'line-through text-slate-400' : 'text-slate-800'}`}>
                  {t.title}
                </span>
              </div>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-600 border border-slate-200">
                {t.category}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

const CalendarWorkspace: React.FC<{ onBackToHome: () => void }> = ({ onBackToHome }) => {
  const [events, setEvents] = useState([
    { id: '1', title: 'Q3 Executive Strategy Align', time: '10:00 AM – 11:00 AM', location: 'Room 4B / Video Call', category: 'Executive' },
    { id: '2', title: 'Candidate Evaluation Interview (Deepu Kumar)', time: '02:00 PM – 03:00 PM', location: 'Meet Link', category: 'Talent' },
    { id: '3', title: 'Finance & Invoice Audit Review', time: '04:30 PM – 05:15 PM', location: 'Conference Room A', category: 'Finance' },
  ]);
  const [newEventTitle, setNewEventTitle] = useState('');

  const addEvent = () => {
    if (!newEventTitle.trim()) return;
    setEvents(prev => [{ id: Date.now().toString(), title: newEventTitle, time: '05:30 PM – 06:00 PM', location: 'Office Room', category: 'General' }, ...prev]);
    setNewEventTitle('');
  };

  return (
    <div className="flex-1 bg-slate-50 p-6 overflow-y-auto space-y-6 max-w-5xl mx-auto w-full">
      <div className="flex justify-between items-center bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs">
        <div className="flex items-center gap-3">
          <button
            onClick={onBackToHome}
            className="px-3 py-1.5 bg-slate-100 hover:bg-indigo-50 text-slate-700 hover:text-indigo-600 rounded-lg text-xs font-bold transition-colors flex items-center gap-1.5 cursor-pointer border border-slate-200 shadow-2xs"
          >
            <ArrowLeft className="w-3.5 h-3.5 text-indigo-600" />
            <span>Back to Home</span>
          </button>
          <div className="h-4 w-px bg-slate-200" />
          <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
            <Calendar className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-slate-900">Calendar & Schedule Manager</h1>
            <p className="text-xs text-slate-500">Organize meetings, interviews, and reviews</p>
          </div>
        </div>
        <span className="text-xs font-bold bg-amber-100 text-amber-800 px-3 py-1 rounded-full border border-amber-200">
          {events.length} Events Today
        </span>
      </div>

      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs flex items-center gap-3">
        <input
          type="text"
          value={newEventTitle}
          onChange={e => setNewEventTitle(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && addEvent()}
          placeholder="Schedule a new meeting or event..."
          className="flex-1 px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-amber-500"
        />
        <button
          onClick={addEvent}
          className="px-4 py-2 bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs rounded-xl shadow-xs transition-colors cursor-pointer flex items-center gap-1.5"
        >
          <Plus className="w-4 h-4" /> Schedule Meeting
        </button>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-2xs space-y-3">
        <h2 className="text-xs font-bold uppercase tracking-wider text-slate-500">Today's Schedule</h2>
        <div className="space-y-3">
          {events.map(e => (
            <div key={e.id} className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 hover:bg-amber-50/30 transition-all flex items-center justify-between">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-amber-900 bg-amber-100 px-2 py-0.5 rounded border border-amber-200">
                    {e.time}
                  </span>
                  <span className="text-[10px] font-bold text-slate-500">{e.category}</span>
                </div>
                <h3 className="text-sm font-bold text-slate-900">{e.title}</h3>
                <div className="text-xs text-slate-500 flex items-center gap-1">
                  <span>Location:</span> <span className="font-semibold text-slate-700">{e.location}</span>
                </div>
              </div>
              <button className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-lg transition-colors cursor-pointer">
                Join Meeting
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export const DomainWorkspaceRouter: React.FC<Props> = ({
  activeDomain,
  missionContext,
  canvasMode,
  isProcessing,
  onNavigate,
  onUploadClick,
}) => {
  const [inspectorPayload, setInspectorPayload] = useState<InspectorPayload | null>(null);

  const installedPacks = intentStore.listInstalledPacks();

  // 1. Mission Center & Canvas / Docs
  if (activeDomain === 'missions' || activeDomain === 'canvas' || activeDomain === 'docs') {
    return (
      <EnterpriseCanvas
        missionContext={missionContext}
        mode={canvasMode}
        isProcessing={isProcessing}
        onUploadClick={onUploadClick}
        onBackToHome={() => onNavigate('home')}
      />
    );
  }

  // 2. Interactive AI Chat & Conversations (`chat`)
  if (activeDomain === 'chat') {
    return <AIChatWorkspace onBackToHome={() => onNavigate('home')} />;
  }

  // 3. Interactive Task Tracker (`tasks`)
  if (activeDomain === 'tasks') {
    return <TaskTrackerWorkspace onBackToHome={() => onNavigate('home')} />;
  }

  // 4. Interactive Calendar & Schedule (`calendar`)
  if (activeDomain === 'calendar') {
    return <CalendarWorkspace onBackToHome={() => onNavigate('home')} />;
  }

  // 5. Health & Evaluation
  if (activeDomain === 'health' || activeDomain === 'evaluation') {
    return <EnterpriseEvaluationDashboard />;
  }

  // 6. CHATR Universal Business Runtime & AI Agents Hub (`agents` or `ai`)
  if (activeDomain === 'agents' || activeDomain === 'ai') {
    return <AIAgentsHub />;
  }

  // Fallback default view: Canvas
  return (
    <EnterpriseCanvas
      missionContext={missionContext}
      mode={canvasMode}
      isProcessing={isProcessing}
      onUploadClick={onUploadClick}
      onBackToHome={() => onNavigate('home')}
    />
  );
};
