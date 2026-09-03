import React, { useState, useEffect } from 'react';
import {
  Bot, Search, Sparkles, CheckCircle2, Clock, AlertTriangle, Layers,
  Zap, Play, ArrowRight, ShieldCheck, Database, FileText, Users, Briefcase,
  Sliders, Activity, Eye, Filter, Cpu, Check, AlertCircle, RefreshCw
} from 'lucide-react';
import { identityRuntime } from '../../core/identity/IdentityRuntime';
import { intentStore } from '../../core/intent/IntentStore';
import { supabase } from '@/integrations/supabase/client';

export type ConfigPackType = 'Healthcare' | 'Recruitment' | 'SaaS' | 'Manufacturing' | 'Finance' | 'Legal';

export type UniversalTab = 'Today' | 'Conversations' | 'Work' | 'Customers' | 'Knowledge' | 'Automation' | 'Insights' | 'Organization';

export type WorkforceState = 'Working Now' | 'Researching' | 'Waiting' | 'Completed' | 'Escalated';

interface WorkforceTask {
  id: string;
  workerName: string;
  packDomain: ConfigPackType;
  taskTitle: string;
  state: WorkforceState;
  confidence: number;
  time: string;
  details: string;
}

export const AIAgentsHub: React.FC = () => {
  const [activePack, setActivePack] = useState<ConfigPackType>('Healthcare');
  const [activeTab, setActiveTab] = useState<UniversalTab>('Today');
  const [activeWorkforceState, setActiveWorkforceState] = useState<WorkforceState>('Working Now');
  const [commandInput, setCommandInput] = useState('');
  const [executingCommand, setExecutingCommand] = useState(false);
  const [executionLog, setExecutionLog] = useState<string | null>(null);
  const [searchSkillQuery, setSearchSkillQuery] = useState('');
  const [userName, setUserName] = useState<string>('User');

  // Calculate dynamic greeting based on local time
  const hour = new Date().getHours();
  const timeGreeting = hour >= 5 && hour < 12 ? 'Good Morning' : hour >= 12 && hour < 17 ? 'Good Afternoon' : 'Good Evening';

  // Fetch real logged-in user name or business name (filtering out pure numbers/phone numbers)
  useEffect(() => {
    async function fetchUser() {
      const cleanName = (val: string | undefined | null) => {
        if (!val) return null;
        const s = val.trim();
        // Skip pure numeric phone numbers like 919717161809
        if (/^\d+$/.test(s)) return null;
        return s.split(' ')[0];
      };

      try {
        const { data } = await supabase.auth.getSession();
        const user = data?.session?.user;
        if (user) {
          const meta = user.user_metadata;
          const metaName = cleanName(meta?.full_name || meta?.name || meta?.company_name || meta?.business_name || meta?.display_name);
          if (metaName) {
            setUserName(metaName);
            return;
          }

          // Try fetching from profiles table
          const { data: profile } = await supabase
            .from('profiles')
            .select('username, primary_handle, full_name')
            .eq('id', user.id)
            .maybeSingle();

          const profileName = cleanName(profile?.full_name || profile?.username || profile?.primary_handle);
          if (profileName) {
            setUserName(profileName);
            return;
          }
        }
      } catch (e) {
        // Fallback below
      }

      const storedName = cleanName(localStorage.getItem('chatr_user_name') || localStorage.getItem('user_name'));
      if (storedName && storedName.toLowerCase() !== 'talentxcel' && storedName.toLowerCase() !== 'user' && storedName.toLowerCase() !== 'arshid') {
        setUserName(storedName);
      } else {
        setUserName('');
      }
    }
    fetchUser();
  }, []);

  // Live Registered Digital Workers & Intent Packs
  const digitalWorkers = identityRuntime.getIdentitiesByType('DIGITAL_WORKER');
  const installedPacks = intentStore.listInstalledPacks();

  // Sample Operational Workforce Tasks across States
  const workforceTasks: WorkforceTask[] = [
    {
      id: 'task_1',
      workerName: 'Priya Sharma (Clinical AI)',
      packDomain: 'Healthcare',
      taskTitle: 'Evaluating Metformin + Contrast Dye Drug Risk for Patient #9912',
      state: 'Working Now',
      confidence: 98,
      time: '12s ago',
      details: 'FHIR R4 Medication Order check. HL7 Segment parsed.'
    },
    {
      id: 'task_2',
      workerName: 'Sarah Mitchell (Recruitment AI)',
      packDomain: 'Recruitment',
      taskTitle: 'Parsing & Shortlisting 14 Resumes for Senior L5 Engineer',
      state: 'Working Now',
      confidence: 94,
      time: '45s ago',
      details: 'ATS Matching Engine active. 4 candidates qualified.'
    },
    {
      id: 'task_3',
      workerName: 'David Chen (Finance AI)',
      packDomain: 'Finance',
      taskTitle: 'Reconciling SAP PO 3-Way Match for Supplier Invoice INV-28491',
      state: 'Researching',
      confidence: 100,
      time: '2m ago',
      details: 'SAP S/4HANA Connector active. TDS calculation verified.'
    },
    {
      id: 'task_4',
      workerName: 'Michael Rodriguez (Legal AI)',
      packDomain: 'Legal',
      taskTitle: 'Audit Liability Cap Clause §7.3 in Service Agreement',
      state: 'Waiting',
      confidence: 96,
      time: '5m ago',
      details: 'Pending human executive approval for $2.5M cap override.'
    },
    {
      id: 'task_5',
      workerName: 'Operations Specialist AI',
      packDomain: 'Manufacturing',
      taskTitle: 'SCADA IoT Telemetry Anomaly Detection — Turbine #4',
      state: 'Completed',
      confidence: 99,
      time: '10m ago',
      details: 'Vibration threshold normalized. Scheduled maintenance auto-created.'
    },
    {
      id: 'task_6',
      workerName: 'SaaS Expansion AI',
      packDomain: 'SaaS',
      taskTitle: 'Escalated Enterprise Deal Renewal — ABC Ltd ($1.2M Contract)',
      state: 'Escalated',
      confidence: 88,
      time: '15m ago',
      details: 'Custom SLA requirement requires VP Sales manual sign-off.'
    }
  ];

  const filteredTasks = workforceTasks.filter(t => t.state === activeWorkforceState);

  const handleExecuteCommand = (e: React.FormEvent) => {
    e.preventDefault();
    if (!commandInput.trim()) return;
    setExecutingCommand(true);
    setExecutionLog(null);

    setTimeout(() => {
      setExecutingCommand(false);
      setExecutionLog(`Universal Execution Flow Completed: Intent parsed ("${commandInput}") ➔ AI Plan Generated ➔ Capability Registry Invoked ➔ Executed under ${activePack} Configuration Pack.`);
      setCommandInput('');
    }, 800);
  };

  const tabs: UniversalTab[] = ['Today', 'Conversations', 'Work', 'Customers', 'Knowledge', 'Automation', 'Insights', 'Organization'];
  const workforceStates: WorkforceState[] = ['Working Now', 'Researching', 'Waiting', 'Completed', 'Escalated'];
  const configPacks: ConfigPackType[] = ['Healthcare', 'Recruitment', 'SaaS', 'Manufacturing', 'Finance', 'Legal'];

  return (
    <div className="flex flex-col h-full w-full bg-slate-950 text-slate-100 font-sans select-none overflow-y-auto p-6 space-y-6">
      
      {/* 1. UNIVERSAL HEADER */}
      <div className="flex justify-between items-center bg-slate-900 p-6 rounded-3xl border border-slate-800 shadow-xl">
        <div className="space-y-1">
          <div className="flex items-center gap-3">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse"></span>
            <h1 className="text-2xl font-extrabold text-white">{timeGreeting}, {userName}.</h1>
            <span className="text-xs font-mono font-bold bg-indigo-950 text-indigo-300 border border-indigo-800/50 px-2.5 py-0.5 rounded-full">
              CHATR Universal Runtime v2.5
            </span>
          </div>
          <p className="text-xs text-slate-400">
            One intent-driven execution engine. Configuration Packs supply schemas, permissions & terminology.
          </p>
        </div>

        {/* Active Configuration Pack Selector */}
        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-400 font-mono">Active Pack:</span>
          <select
            value={activePack}
            onChange={(e) => setActivePack(e.target.value as ConfigPackType)}
            className="bg-slate-800 border border-slate-700 text-indigo-300 text-xs font-bold px-3 py-1.5 rounded-xl focus:outline-none focus:ring-1 focus:ring-indigo-500 cursor-pointer"
          >
            {configPacks.map(pack => (
              <option key={pack} value={pack}>{pack} Pack</option>
            ))}
          </select>
        </div>
      </div>

      {/* 2. UNIVERSAL 8-TAB NAVIGATION BAR */}
      <div className="flex items-center gap-1 bg-slate-900/80 p-1.5 rounded-2xl border border-slate-800 overflow-x-auto">
        {tabs.map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 text-xs font-bold rounded-xl transition-all whitespace-nowrap cursor-pointer ${
              activeTab === tab
                ? 'bg-indigo-600 text-white shadow-md'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* 3. UNIVERSAL COMMAND BAR (Intent Executor) */}
      <div className="bg-slate-900 p-4 rounded-2xl border border-slate-800 shadow-lg space-y-3">
        <div className="flex items-center gap-2 text-xs font-bold text-slate-400 uppercase tracking-wider">
          <Sparkles className="w-4 h-4 text-indigo-400" />
          <span>Universal Intent Command Bar</span>
        </div>
        <form onSubmit={handleExecuteCommand} className="flex gap-2">
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3.5 top-3 text-slate-500" />
            <input
              type="text"
              value={commandInput}
              onChange={(e) => setCommandInput(e.target.value)}
              placeholder={`Execute intent in ${activePack} Pack context (e.g. "Find Rahul", "Invoice Amazon", "Review contracts")...`}
              className="w-full pl-10 pr-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder:text-slate-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 font-medium"
            />
          </div>
          <button
            type="submit"
            disabled={executingCommand}
            className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-xl transition-colors shadow-md flex items-center gap-2 shrink-0 cursor-pointer disabled:opacity-50"
          >
            {executingCommand ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4 fill-current" />}
            <span>Execute Intent</span>
          </button>
        </form>

        {executionLog && (
          <div className="p-3 bg-indigo-950/40 border border-indigo-800/40 rounded-xl text-xs text-indigo-200 font-mono animate-in fade-in duration-200">
            {executionLog}
          </div>
        )}
      </div>

      {/* 4. INVISIBLE AI WORKFORCE PANEL (Operational State) */}
      <div className="bg-slate-900 p-6 rounded-3xl border border-slate-800 shadow-xl space-y-4">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Bot className="w-5 h-5 text-violet-400" />
            <h2 className="text-base font-bold text-white">Invisible AI Workforce Status</h2>
          </div>
          <span className="text-xs text-slate-400 font-mono">
            {digitalWorkers.length} Registered Workers · Active Context: {activePack} Pack
          </span>
        </div>

        {/* Operational State Filter Tabs */}
        <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
          {workforceStates.map(state => {
            const count = workforceTasks.filter(t => t.state === state).length;
            const isActive = activeWorkforceState === state;
            return (
              <button
                key={state}
                onClick={() => setActiveWorkforceState(state)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1.5 cursor-pointer ${
                  isActive
                    ? 'bg-violet-950 text-violet-200 border border-violet-800/60 font-bold'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                }`}
              >
                <span>{state}</span>
                <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-slate-800 text-slate-300">
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Task Cards List */}
        <div className="space-y-3">
          {filteredTasks.length === 0 ? (
            <div className="p-6 text-center text-xs text-slate-500 border border-dashed border-slate-800 rounded-2xl">
              No tasks currently in "{activeWorkforceState}" state.
            </div>
          ) : (
            filteredTasks.map(task => (
              <div key={task.id} className="p-4 bg-slate-950 border border-slate-800 rounded-2xl flex justify-between items-center hover:border-slate-700 transition-colors">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-violet-950 text-violet-300 border border-violet-800/40">
                      {task.workerName}
                    </span>
                    <span className="text-[10px] text-slate-400 font-mono">[{task.packDomain} Pack]</span>
                  </div>
                  <div className="text-xs font-bold text-slate-200">{task.taskTitle}</div>
                  <div className="text-[11px] text-slate-400 font-mono">{task.details}</div>
                </div>

                <div className="text-right space-y-1">
                  <div className="text-xs font-mono font-bold text-emerald-400">{task.confidence}% Conf</div>
                  <div className="text-[10px] text-slate-500 font-mono">{task.time}</div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* 5. DYNAMIC CAPABILITY WORK QUEUES & SKILLS LIBRARY */}
      <div className="grid grid-cols-2 gap-6">
        
        {/* Dynamic Capability Work Queues */}
        <div className="bg-slate-900 p-6 rounded-3xl border border-slate-800 shadow-xl space-y-4">
          <div className="flex items-center gap-2">
            <Layers className="w-5 h-5 text-indigo-400" />
            <h2 className="text-base font-bold text-white">Dynamic Capability Work Queues</h2>
          </div>
          <div className="space-y-2 text-xs">
            <div className="p-3 bg-slate-950 border border-slate-800 rounded-xl flex justify-between items-center">
              <div>
                <div className="font-bold text-slate-200">Prescription Analysis Capability</div>
                <div className="text-[10px] text-slate-400">HL7 / FHIR R4 Clinical Queue</div>
              </div>
              <span className="text-xs font-mono font-bold text-indigo-400 bg-indigo-950 px-2 py-1 rounded border border-indigo-800">
                1 Queue Active
              </span>
            </div>

            <div className="p-3 bg-slate-950 border border-slate-800 rounded-xl flex justify-between items-center">
              <div>
                <div className="font-bold text-slate-200">Contract OCR & Clause Extraction</div>
                <div className="text-[10px] text-slate-400">Legal Reviewer Queue</div>
              </div>
              <span className="text-xs font-mono font-bold text-indigo-400 bg-indigo-950 px-2 py-1 rounded border border-indigo-800">
                Ready
              </span>
            </div>

            <div className="p-3 bg-slate-950 border border-slate-800 rounded-xl flex justify-between items-center">
              <div>
                <div className="font-bold text-slate-200">SAP PO 3-Way Match Verification</div>
                <div className="text-[10px] text-slate-400">Finance & Accounting Queue</div>
              </div>
              <span className="text-xs font-mono font-bold text-emerald-400 bg-emerald-950 px-2 py-1 rounded border border-emerald-800">
                Verified
              </span>
            </div>
          </div>
        </div>

        {/* 17 AI Capabilities & 880 Skills Library */}
        <div className="bg-slate-900 p-6 rounded-3xl border border-slate-800 shadow-xl space-y-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              <Cpu className="w-5 h-5 text-indigo-400" />
              <h2 className="text-base font-bold text-white">17 AI Capabilities & 880 Templates</h2>
            </div>
            <span className="text-xs text-indigo-300 font-mono font-bold">17 Core Capabilities</span>
          </div>

          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-500" />
            <input
              type="text"
              value={searchSkillQuery}
              onChange={(e) => setSearchSkillQuery(e.target.value)}
              placeholder="Search 880 template blueprints..."
              className="w-full pl-9 pr-3 py-1.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder:text-slate-500 focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="p-2.5 bg-slate-950 border border-slate-800 rounded-xl">
              <div className="font-bold text-slate-200">OCR & Document Intelligence</div>
              <div className="text-[10px] text-slate-500">42 Template Blueprints</div>
            </div>
            <div className="p-2.5 bg-slate-950 border border-slate-800 rounded-xl">
              <div className="font-bold text-slate-200">Clinical Triage & FHIR R4</div>
              <div className="text-[10px] text-slate-500">86 Template Blueprints</div>
            </div>
            <div className="p-2.5 bg-slate-950 border border-slate-800 rounded-xl">
              <div className="font-bold text-slate-200">ATS Resume Matcher</div>
              <div className="text-[10px] text-slate-500">64 Template Blueprints</div>
            </div>
            <div className="p-2.5 bg-slate-950 border border-slate-800 rounded-xl">
              <div className="font-bold text-slate-200">SAP S/4HANA PO Matcher</div>
              <div className="text-[10px] text-slate-500">112 Template Blueprints</div>
            </div>
          </div>
        </div>

      </div>

    </div>
  );
};
