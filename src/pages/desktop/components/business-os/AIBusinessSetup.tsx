import React, { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { TEMPLATES, resolveTemplate, type OSTemplate } from '../../../../data/os-templates';
import { 
  Store, Stethoscope, GraduationCap, Briefcase, Factory, Coffee, Landmark,
  ArrowRight, FolderOpen, Sparkles, Users, ListTree, Zap, Shield, CheckCircle2,
  LayoutGrid, Package, Cpu, Activity, Building2, Star, Loader2, X, FileText, Command
} from 'lucide-react';

export const INDUSTRIES = [
  { id: 'retail', name: 'Retail & Local', icon: Store, color: 'text-amber-400', bg: 'bg-amber-400/10' },
  { id: 'healthcare', name: 'Healthcare', icon: Stethoscope, color: 'text-rose-400', bg: 'bg-rose-400/10' },
  { id: 'education', name: 'Education', icon: GraduationCap, color: 'text-blue-400', bg: 'bg-blue-400/10' },
  { id: 'professional', name: 'Professional Services', icon: Briefcase, color: 'text-indigo-400', bg: 'bg-indigo-400/10' },
  { id: 'manufacturing', name: 'Manufacturing', icon: Factory, color: 'text-orange-400', bg: 'bg-orange-400/10' },
  { id: 'hospitality', name: 'Hospitality', icon: Coffee, color: 'text-emerald-400', bg: 'bg-emerald-400/10' },
  { id: 'finance', name: 'Finance & Banking', icon: Landmark, color: 'text-cyan-400', bg: 'bg-cyan-400/10' },
];

export const AIBusinessSetup = ({ onComplete }: { onComplete: (template: OSTemplate, profile: any) => void }) => {
  const [phase, setPhase] = useState<'welcome' | 'identity' | 'structure' | 'tech' | 'review' | 'provisioning' | 'complete'>('welcome');
  const [messages, setMessages] = useState<{role: 'ai'|'user', content: React.ReactNode}[]>([
    { role: 'ai', content: <><div className="font-bold text-indigo-400 mb-1">Phase 1: Company Identity</div><p>Welcome to CHATR Business OS.</p><p className="mt-2">Before we build your company's operating system, I'd like to understand how your business works so I can recommend the right organization, workflows, and automations.</p><p className="mt-2">To start, <strong>what is your company name and what do you do?</strong></p></> }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [profile, setProfile] = useState({ name: '', industry: '', dept: [] as string[], tech: [] as string[], teamSize: '', location: '' });
  const [activeField, setActiveField] = useState<string | null>(null);
  
  // Company Import Wizard & Interactive Welcome State
  const [showImportModal, setShowImportModal] = useState(false);
  const [importCompanyName, setImportCompanyName] = useState('');
  const [importDomain, setImportDomain] = useState('Recruitment');
  const [importSource, setImportSource] = useState<'pack' | 'file' | 'provider'>('pack');
  const [importFile, setImportFile] = useState<File | null>(null);

  // Interactive Modals State
  const [selectedHealthItem, setSelectedHealthItem] = useState<any | null>(null);
  const [showFullAnalysisModal, setShowFullAnalysisModal] = useState(false);
  const [selectedSetupStep, setSelectedSetupStep] = useState<any | null>(null);
  const [activeGlanceModal, setActiveGlanceModal] = useState<'departments' | 'workflows' | 'automations' | 'integrations' | 'health' | null>(null);

  const handleImportSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const companyName = importCompanyName.trim() || 'Imported Organization';
    localStorage.setItem('chatr_company_name', companyName);
    localStorage.setItem('chatr_active_domain', importDomain);
    
    const template = resolveTemplate(importDomain) || TEMPLATES[0];
    const importedProfile = {
      name: companyName,
      industry: importDomain,
      dept: ['Executive Office', 'Sales', 'Recruitment', 'Delivery', 'Finance'],
      tech: ['Microsoft 365', 'Supabase', 'Gemini AI', 'Stripe'],
      teamSize: '11-50',
      location: 'Global'
    };
    
    toast.success(`🎉 ${companyName} imported & activated successfully!`);
    setShowImportModal(false);
    onComplete(template, importedProfile);
  };

  const completionPercent = Math.round(
    ((profile.name ? 1 : 0) + 
    (profile.industry ? 1 : 0) + 
    (profile.dept.length > 0 ? 1 : 0) + 
    (profile.teamSize ? 1 : 0) + 
    (profile.location ? 1 : 0)) / 5 * 100
  );
  
  // Track metrics
  const [metrics, setMetrics] = useState({
    understanding: 10,
    confidence: 15,
    recommendations: 0,
    accepted: 0
  });

  const [resolvedTemplate, setResolvedTemplate] = useState<OSTemplate | null>(null);
  const [provisioningStep, setProvisioningStep] = useState(0);

  useEffect(() => {
    if (phase === 'provisioning') {
      let step = 0;
      const interval = setInterval(() => {
        step++;
        setProvisioningStep(step);
        if (step >= 8) {
          clearInterval(interval);
          setTimeout(() => {
            setPhase('complete');
            setTimeout(() => onComplete(resolvedTemplate || TEMPLATES[3], profile), 2000);
          }, 1000);
        }
      }, 500);
      return () => clearInterval(interval);
    }
  }, [phase, resolvedTemplate, onComplete]);

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim() || phase === 'review' || phase === 'provisioning') return;
    
    const userText = inputValue;
    setMessages(prev => [...prev, { role: 'user', content: userText }]);
    setInputValue('');

    setTimeout(() => {
      if (phase === 'identity') {
        const tpl = resolveTemplate(userText);
        setResolvedTemplate(tpl);
        
        let companyName = userText.trim();
        const match = userText.match(/(?:company|name) is ([\w\s]+?)(?: and|,|\.|$)/i) || userText.match(/called ([\w\s]+?)(?: and|,|\.|$)/i);
        if (match) companyName = match[1].trim();
        else if (companyName.split(' ').length > 3) companyName = companyName.split(' ').slice(0, 2).join(' ') + ' Inc';

        const suggestedDepts = tpl.departments.map(d => d.name).slice(0, 4);
        setProfile(p => ({ ...p, name: companyName, industry: tpl.name, dept: suggestedDepts }));
        setMetrics(m => ({ ...m, understanding: 40, confidence: 55, recommendations: 4 }));
        
        setMessages(prev => [...prev, { role: 'ai', content: <><div className="font-bold text-indigo-400 mb-1">Recommendation #1: Organization Design</div><p>Based on your <strong>{tpl.name}</strong> business, I recommend starting with these core departments:</p><div className="flex flex-wrap gap-2 mt-3 mb-3">{suggestedDepts.map(d => <span key={d} className="px-2 py-1 bg-zinc-800 border border-zinc-700/50 rounded text-label">{d}</span>)}</div><p>Would you like to keep these, remove any, or add more?</p></> }]);
        setPhase('structure');
      } else if (phase === 'structure') {
        let currentDept = [...profile.dept];
        const lower = userText.toLowerCase();
        if (lower.includes('marketing')) currentDept.push('Marketing');
        if (lower.includes('finance')) currentDept.push('Finance');
        if (lower.includes('legal')) currentDept.push('Legal');
        if (lower.includes('remove hr') || lower.includes('no hr')) currentDept = currentDept.filter(d => d !== 'HR');
        
        setProfile(p => ({ ...p, dept: currentDept }));
        setMetrics(m => ({ ...m, understanding: 70, confidence: 85, accepted: m.accepted + 3 }));

        setMessages(prev => [...prev, { role: 'ai', content: <><div className="font-bold text-indigo-400 mb-1">Phase 3: Existing Software Stack</div><p>Perfect, I've finalized the org chart. To ensure CHATR connects seamlessly with your existing workflows, <strong>which software tools do you currently use?</strong> (e.g., Microsoft 365, Slack, Salesforce, GitHub)</p></> }]);
        setPhase('tech');
      } else if (phase === 'tech') {
        let techList = userText.split(',').map(s => s.trim()).filter(Boolean);
        if (techList.length === 0 || (techList.length === 1 && techList[0].split(' ').length > 2)) techList = [userText.trim()];
        
        setProfile(p => ({ ...p, tech: techList }));
        setMetrics(m => ({ ...m, understanding: 100, confidence: 98 }));

        setMessages(prev => [...prev, { role: 'ai', content: <><div className="font-bold text-emerald-400 mb-1">Consultation Complete</div><p>Excellent. I have completed my business analysis. Please review the Executive Summary below.</p></> }]);
        setPhase('review');
      }
    }, 1000);
  };

  return (
    <div className="flex-1 flex flex-col items-center justify-center bg-[#09090b] relative overflow-hidden h-full">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-indigo-900/10 via-[#09090b] to-[#09090b]" />
      
      {phase === 'welcome' ? (
        <div className="w-full h-full flex flex-col p-8 relative z-10 animate-in fade-in duration-700 max-w-[1400px] mx-auto overflow-y-auto">
          {/* Top Section: Hero */}
          <div className="flex items-center justify-between mb-8">
            <div className="max-w-2xl">
              <h2 className="text-indigo-400 font-semibold mb-1 text-secondary lg:text-body">Good Afternoon, Arshid! 👋</h2>
              <h1 className="text-display lg:text-display font-extrabold text-white tracking-tight mb-2">
                Welcome to CHATR<br/>Business OS
              </h1>
              <p className="text-zinc-400 text-secondary lg:text-body mb-6 max-w-lg">
                Your all-in-one operating system for managing, automating, and growing your business.
              </p>
              <div className="flex gap-3">
                <button onClick={() => setPhase('identity')} className="px-5 py-2.5 text-secondary bg-indigo-600 hover:bg-indigo-500 text-white font-medium rounded-xl transition-all shadow-[0_0_20px_rgba(79,70,229,0.3)] flex items-center gap-2">
                  Start Setup <ArrowRight size={16} />
                </button>
                <button onClick={() => setShowImportModal(true)} className="px-5 py-2.5 text-button bg-[#111113] border border-zinc-800 text-white rounded-xl hover:bg-zinc-800 transition-all flex items-center gap-2">
                  <FolderOpen size={16} className="text-zinc-400" /> Import Company
                </button>
              </div>
            </div>

            {/* Illustration */}
            <div className="relative w-72 h-72 lg:w-80 lg:h-80 flex items-center justify-center shrink-0 hidden lg:flex mr-8">
              <div className="absolute inset-0 bg-indigo-500/20 blur-[60px] rounded-full" />
              <div className="relative w-32 h-32 lg:w-40 lg:h-40 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-3xl rotate-12 shadow-[0_0_50px_rgba(99,102,241,0.5)] flex items-center justify-center border border-white/20">
                <Sparkles size={36} className="text-white" />
              </div>
              <div className="absolute top-12 left-12 w-12 h-12 bg-[#111113] border border-zinc-800 rounded-xl flex items-center justify-center shadow-xl">
                <Users size={20} className="text-indigo-400" />
              </div>
              <div className="absolute top-8 right-16 w-12 h-12 bg-emerald-900/30 border border-emerald-500/30 rounded-xl flex items-center justify-center shadow-xl">
                <ListTree size={20} className="text-emerald-400" />
              </div>
              <div className="absolute bottom-28 right-4 w-14 h-14 bg-amber-900/30 border border-amber-500/30 rounded-xl flex items-center justify-center shadow-xl">
                <Zap size={24} className="text-amber-400" />
              </div>
              <div className="absolute bottom-12 left-32 w-12 h-12 bg-blue-900/30 border border-blue-500/30 rounded-xl flex items-center justify-center shadow-xl">
                <Shield size={20} className="text-blue-400" />
              </div>
              <div className="absolute inset-0 border border-white/5 rounded-full rotate-45 scale-110" />
              <div className="absolute inset-8 border border-white/5 rounded-full -rotate-12 scale-105" />
            </div>
          </div>

          {/* Cards & Health Section */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4">
            <div className="bg-[#111113] border border-zinc-800/80 rounded-2xl p-5 relative overflow-hidden">
              <div className="flex items-start gap-3 mb-5">
                <div className="w-10 h-10 bg-indigo-500/10 border border-indigo-500/20 rounded-xl flex items-center justify-center shrink-0">
                  <Stethoscope size={20} className="text-indigo-400" />
                </div>
                <div>
                  <h3 className="text-body font-bold text-white mb-1">Business Health Assessment</h3>
                  <p className="text-zinc-400 text-[11px] leading-snug">Our intelligence engine analyzes your inputs to identify key insights and opportunities.</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-y-4 gap-x-6 mb-5">
                {[
                  { id: 'missing_dept', title: 'Missing Departments', desc: '3 critical departments missing', detail: 'Identified missing Legal, Delivery, and Compliance departments.' },
                  { id: 'bottlenecks', title: 'Operational Bottlenecks', desc: '4 bottlenecks detected', detail: 'Detected manual approval delays in invoice matching, candidate scheduling, client onboarding, and SLA reporting.' },
                  { id: 'reporting', title: 'Reporting Gaps', desc: '2 reporting gaps identified', detail: 'Missing real-time margin tracking and executive attendance velocity metrics.' },
                  { id: 'digital_opp', title: 'Digital Opportunities', desc: '6 growth opportunities', detail: 'High potential for automated lead qualification, smart triage, AI Document parsing, and 24/7 autonomous responses.' },
                  { id: 'automation_proc', title: 'Automation Processes', desc: '5 automation opportunities', detail: '5 repetitive human tasks qualified for 100% autonomous agent execution.' },
                  { id: 'org_risks', title: 'Organizational Risks', desc: '3 potential risks found', detail: 'Single point of failure in key delivery leads, unencrypted document sharing, and delayed client follow-ups.' }
                ].map(item => (
                  <div key={item.title} onClick={() => setSelectedHealthItem(item)} className="flex items-start gap-3 p-2 rounded-xl hover:bg-zinc-800/50 hover:border-zinc-700/50 border border-transparent transition-all cursor-pointer group">
                    <CheckCircle2 size={18} className="text-emerald-500 mt-0.5 shrink-0 group-hover:scale-110 transition-transform" />
                    <div>
                      <div className="text-white text-secondary font-medium group-hover:text-indigo-300 transition-colors">{item.title}</div>
                      <div className="text-zinc-500 text-label mt-0.5">{item.desc}</div>
                    </div>
                  </div>
                ))}
              </div>
              <button onClick={() => setShowFullAnalysisModal(true)} className="px-5 py-2.5 bg-[#111113] hover:bg-zinc-800 text-white text-button rounded-lg border border-zinc-700 transition-all flex items-center gap-2 cursor-pointer shadow-md">
                View Full Analysis <ArrowRight size={16} />
              </button>
            </div>

            <div className="bg-[#111113] border border-zinc-800/80 rounded-2xl p-5">
              <div className="flex items-start gap-3 mb-5">
                <div className="w-10 h-10 bg-purple-500/10 border border-purple-500/20 rounded-xl flex items-center justify-center shrink-0">
                  <Zap size={20} className="text-purple-400" />
                </div>
                <div>
                  <h3 className="text-body font-bold text-white mb-1">What Happens After Setup</h3>
                  <p className="text-zinc-400 text-[11px] leading-snug">Your business OS will be ready in a few simple steps.</p>
                </div>
              </div>
              
              <div className="space-y-4 relative before:absolute before:inset-0 before:ml-[11px] before:h-full before:w-[1px] before:bg-zinc-800">
                {[
                  { step: 'Step 1', title: "Today's Consultation", desc: "We'll understand your business in detail", icon: <LayoutGrid size={14} className="text-emerald-400"/>, ring: 'border-emerald-500/30 bg-emerald-500/10' },
                  { step: 'Step 2', title: 'Business Analysis', desc: 'Our AI analyzes data and generates insights', icon: <ListTree size={14} className="text-purple-400"/>, ring: 'border-purple-500/30 bg-purple-500/10' },
                  { step: 'Step 3', title: 'Business OS Generated', desc: 'Your tailored Business OS is ready', icon: <Package size={14} className="text-amber-400"/>, ring: 'border-amber-500/30 bg-amber-500/10' },
                  { step: 'Step 4', title: 'CEO Dashboard Ready', desc: 'Real-time overview of your business', icon: <LayoutGrid size={14} className="text-blue-400"/>, ring: 'border-blue-500/30 bg-blue-500/10' },
                  { step: 'Step 5', title: 'Ready for Operations', desc: "You're all set to operate and grow", icon: <CheckCircle2 size={14} className="text-emerald-400"/>, ring: 'border-emerald-500/30 bg-emerald-500/10' }
                ].map((s) => (
                  <div key={s.title} onClick={() => setSelectedSetupStep(s)} className="relative flex items-center justify-between group pl-10 p-2 rounded-xl hover:bg-zinc-800/40 cursor-pointer transition-all border border-transparent hover:border-zinc-800">
                    <div className="absolute left-0 w-6 h-6 bg-[#111113] flex items-center justify-center z-10 -ml-1.5">
                      <div className="w-2 h-2 rounded-full border border-zinc-500 bg-transparent group-hover:bg-indigo-400 group-hover:border-indigo-400 transition-colors" />
                    </div>
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-lg border flex items-center justify-center shrink-0 ${s.ring}`}>
                        {s.icon}
                      </div>
                      <div>
                        <div className="text-white text-secondary font-medium group-hover:text-indigo-300 transition-colors">{s.title}</div>
                        <div className="text-zinc-500 text-label mt-0.5">{s.desc}</div>
                      </div>
                    </div>
                    <div className={`px-2.5 py-1 rounded text-[10px] font-bold tracking-wide uppercase ${s.step === 'Step 1' || s.step === 'Step 5' ? 'bg-emerald-500/10 text-emerald-400' : s.step === 'Step 2' ? 'bg-purple-500/10 text-purple-400' : s.step === 'Step 3' ? 'bg-amber-500/10 text-amber-400' : 'bg-blue-500/10 text-blue-400'}`}>
                      {s.step}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      ) : phase !== 'provisioning' && phase !== 'complete' ? (
        <div className="w-full max-w-[1400px] mx-auto px-6 flex gap-6 h-[85vh] relative z-10 animate-in fade-in duration-700 pb-8">
          {/* Profile & Chat Column */}
          <div className="flex-1 flex flex-col bg-[#111113] border border-zinc-800/80 rounded-3xl overflow-hidden shadow-xl">
            <div className="p-6 border-b border-zinc-800/50 bg-zinc-950/30">
              <div className="flex items-center gap-4 mb-4 text-center justify-center">
                <div className="w-10 h-10 bg-indigo-500/10 rounded-xl flex items-center justify-center">
                  <Sparkles size={20} className="text-indigo-400" />
                </div>
                <div className="text-left">
                  <h2 className="text-white font-bold text-section">Business Setup Consultation</h2>
                  <div className="text-label text-zinc-400">Guided setup in progress</div>
                </div>
              </div>
            </div>
            
            <div className="flex-1 overflow-y-auto p-8 space-y-6">
              {messages.map((msg, i) => (
                <div key={i} className={`flex gap-4 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 border ${msg.role === 'user' ? 'bg-indigo-500/20 border-indigo-500/30' : 'bg-[#111113] border-zinc-800'}`}>
                    {msg.role === 'user' ? <span className="text-indigo-400 font-bold text-label">YOU</span> : <Sparkles size={16} className="text-zinc-400" />}
                  </div>
                  <div className={`p-4 text-secondary max-w-[85%] ${msg.role === 'user' ? 'bg-indigo-600 text-white rounded-2xl rounded-tr-sm' : 'bg-[#111113] border border-zinc-800/80 text-zinc-300 rounded-2xl rounded-tl-sm'}`}>
                    {msg.content}
                  </div>
                </div>
              ))}

              {phase === 'review' && (
                <div className="bg-[#111113] border border-indigo-500/30 rounded-2xl p-6 mt-8">
                  <h3 className="text-white font-bold mb-4 flex items-center gap-2"><CheckCircle2 size={18} className="text-emerald-400" /> Executive Summary</h3>
                  <div className="grid grid-cols-2 gap-y-6 gap-x-8 text-secondary">
                    <div>
                      <span className="text-zinc-500 block text-label mb-1">Company Profile</span>
                      <span className="text-zinc-200 font-medium">{profile.name || 'Acme Corp'} ({profile.industry || 'IT Services'})</span>
                    </div>
                    <div>
                      <span className="text-zinc-500 block text-label mb-1">Departments</span>
                      <span className="text-zinc-200 font-medium">{profile.dept.length} Identified</span>
                    </div>
                  </div>
                  <div className="mt-6 pt-6 border-t border-zinc-800/80 flex items-center justify-between">
                    <button onClick={() => setPhase('provisioning')} className="px-8 py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl transition-all shadow-lg shadow-indigo-500/20">
                      Build Business OS
                    </button>
                  </div>
                </div>
              )}
            </div>

            {phase !== 'review' && (
              <div className="p-6">
                <form onSubmit={handleSend} className="max-w-xl mx-auto flex gap-3 mb-4">
                  <input 
                    autoFocus
                    value={inputValue}
                    onChange={e => setInputValue(e.target.value)}
                    placeholder="Type your response..."
                    className="flex-1 bg-[#111113] border border-zinc-800/80 rounded-xl px-5 py-4 text-secondary text-white focus:outline-none focus:border-indigo-500/50"
                  />
                  <button type="submit" disabled={!inputValue.trim()} className="px-6 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-500 disabled:opacity-50 transition-all flex items-center justify-center">
                    <ArrowRight size={18} />
                  </button>
                </form>
              </div>
            )}
          </div>
        </div>
      ) : phase === 'provisioning' ? (
        <div className="w-full max-w-md bg-zinc-900/80 backdrop-blur-2xl border border-zinc-800 rounded-2xl p-8 relative z-10 text-center">
          <Loader2 size={32} className="text-indigo-400 animate-spin mx-auto mb-4" />
          <h2 className="text-workspace font-bold text-white mb-2">Provisioning Business OS</h2>
          <p className="text-zinc-400 text-xs">Configuring departments, workflows, and agents...</p>
        </div>
      ) : (
        <div className="w-full max-w-md bg-zinc-900/80 backdrop-blur-2xl border border-zinc-800 rounded-2xl p-8 relative z-10 text-center">
          <CheckCircle2 size={32} className="text-emerald-400 mx-auto mb-4" />
          <h2 className="text-workspace font-bold text-white mb-2">Business OS Ready!</h2>
        </div>
      )}
    </div>
  );
};
