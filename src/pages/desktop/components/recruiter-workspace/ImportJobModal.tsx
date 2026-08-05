import React, { useState, memo } from 'react';
import { Upload, X, Briefcase, Loader2, Sparkles, FileText, Mail, Mic, MessageSquare } from 'lucide-react';
import { toast } from 'sonner';
import { Requisition } from './types';
import { generateAIJobDescription } from './intelligence/jobIntelligence';

interface ImportJobModalProps {
  open: boolean;
  onClose: () => void;
  onImport: (jobs: Partial<Requisition>[]) => void;
}

export const ImportJobModal = memo(({ open, onClose, onImport }: ImportJobModalProps) => {
  const [activeSourceTab, setActiveSourceTab] = useState<'prompt' | 'previous_jd' | 'client_email' | 'voice_transcript' | 'whatsapp' | 'upload'>('prompt');
  const [inputText, setInputText] = useState('');
  const [roleTitle, setRoleTitle] = useState('');
  const [city, setCity] = useState('Bangalore');
  const [expYears, setExpYears] = useState<number>(6);
  const [salaryLpa, setSalaryLpa] = useState<number>(24);
  const [parsing, setParsing] = useState(false);

  if (!open) return null;

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const text = evt.target?.result as string;
        let imported: Partial<Requisition>[] = [];
        if (file.name.endsWith('.json')) {
          const parsed = JSON.parse(text);
          imported = Array.isArray(parsed) ? parsed : [parsed];
        } else {
          const lines = text.split('\n').filter(Boolean);
          imported = lines.slice(1).map(l => {
            const parts = l.split(',').map(s => s.replace(/^"|"$/g, '').trim());
            return { title: parts[0] || 'Imported Role', department: parts[1] || 'Engineering', location: parts[2] || 'Remote', type: parts[3] || 'Full-time', status: 'Open' };
          });
        }
        onImport(imported);
        toast.success(`Successfully imported ${imported.length} requisition(s)`);
        onClose();
      } catch (err) {
        toast.error('Could not parse file. Check format.');
      }
    };
    reader.readAsText(file);
  };

  const handleGenerateAIJob = () => {
    if (!inputText.trim() && !roleTitle.trim()) {
      toast.error('Please enter a role prompt or requirements text.');
      return;
    }
    setParsing(true);
    setTimeout(() => {
      const { rawJd, graph } = generateAIJobDescription({
        sourceType: activeSourceTab === 'upload' ? 'prompt' : activeSourceTab,
        rawInput: inputText || roleTitle,
        roleTitle: roleTitle || graph.title,
        city,
        expYears,
        salaryLpa
      });

      const newJob: Partial<Requisition> = {
        title: graph.title,
        department: graph.domainClassification[0] || 'Engineering',
        location: graph.location,
        type: graph.employmentType,
        status: 'Open',
        jd: rawJd,
        budget: `₹${graph.minSalaryLpa}–₹${graph.maxSalaryLpa} LPA`,
        skills: graph.mandatorySkills
      };

      onImport([newJob]);
      setParsing(false);
      toast.success(`AI Generated Job Requisition for "${graph.title}"`);
      onClose();
    }, 600);
  };

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-xl shadow-2xl overflow-hidden text-white" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800">
          <h3 className="font-black text-sm flex items-center gap-2 text-white">
            <Sparkles className="w-4 h-4 text-violet-400" /> AI JD Creator &amp; Job Requisition Generator
          </h3>
          <button onClick={onClose} className="p-1 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-white">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-6 space-y-5 text-xs">
          
          {/* SOURCE INPUT TABS */}
          <div className="space-y-2">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Select Input Source Method</span>
            <div className="grid grid-cols-3 md:grid-cols-6 gap-1.5 font-bold text-[11px]">
              {[
                { id: 'prompt', label: 'Prompt', icon: Sparkles },
                { id: 'previous_jd', label: 'Prev JD', icon: FileText },
                { id: 'client_email', label: 'Email', icon: Mail },
                { id: 'voice_transcript', label: 'Voice', icon: Mic },
                { id: 'whatsapp', label: 'WhatsApp', icon: MessageSquare },
                { id: 'upload', label: 'File Upload', icon: Upload }
              ].map(src => {
                const IconComp = src.icon;
                return (
                  <button
                    key={src.id}
                    onClick={() => setActiveSourceTab(src.id as any)}
                    className={`p-2 rounded-xl border flex flex-col items-center gap-1 transition-all ${
                      activeSourceTab === src.id
                        ? 'bg-violet-600 border-violet-500 text-white shadow-md'
                        : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
                    }`}
                  >
                    <IconComp className="w-3.5 h-3.5" />
                    <span className="text-[10px]">{src.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* PARAMETERS FORM */}
          <div className="grid grid-cols-2 gap-3 font-mono">
            <div>
              <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Target Role Title</label>
              <input
                type="text"
                placeholder="e.g. Senior Azure Data Engineer"
                value={roleTitle}
                onChange={e => setRoleTitle(e.target.value)}
                className="w-full px-3 py-1.5 bg-slate-950 border border-slate-800 rounded-xl text-white placeholder-slate-500 text-xs focus:outline-none focus:border-violet-500"
              />
            </div>
            <div>
              <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">City / Location</label>
              <input
                type="text"
                placeholder="e.g. Bangalore / Remote"
                value={city}
                onChange={e => setCity(e.target.value)}
                className="w-full px-3 py-1.5 bg-slate-950 border border-slate-800 rounded-xl text-white placeholder-slate-500 text-xs focus:outline-none focus:border-violet-500"
              />
            </div>
            <div>
              <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Min Exp (Years)</label>
              <input
                type="number"
                value={expYears}
                onChange={e => setExpYears(parseInt(e.target.value, 10) || 5)}
                className="w-full px-3 py-1.5 bg-slate-950 border border-slate-800 rounded-xl text-white text-xs focus:outline-none focus:border-violet-500"
              />
            </div>
            <div>
              <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Target CTC (₹ LPA)</label>
              <input
                type="number"
                value={salaryLpa}
                onChange={e => setSalaryLpa(parseInt(e.target.value, 10) || 24)}
                className="w-full px-3 py-1.5 bg-slate-950 border border-slate-800 rounded-xl text-white text-xs focus:outline-none focus:border-violet-500"
              />
            </div>
          </div>

          {/* INPUT TEXTAREA OR FILE DROP */}
          {activeSourceTab === 'upload' ? (
            <div className="border-2 border-dashed border-slate-800 rounded-xl p-6 text-center hover:border-violet-500/50 transition-colors bg-slate-950">
              <Briefcase className="w-7 h-7 text-violet-400 mx-auto mb-2" />
              <p className="text-xs font-semibold text-white">Upload JSON or CSV File</p>
              <p className="text-[10px] text-slate-400 mt-1 mb-3">Drag requisition file or click to browse</p>
              <label className="px-3 py-1.5 bg-violet-600 text-white text-xs font-bold rounded-xl cursor-pointer hover:bg-violet-500 inline-block">
                Choose File <input type="file" accept=".json,.csv,.txt" className="hidden" onChange={handleFileUpload} />
              </label>
            </div>
          ) : (
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-400 uppercase block">
                {activeSourceTab === 'prompt' && 'Enter Role Prompt / Client Requirements'}
                {activeSourceTab === 'previous_jd' && 'Paste Previous JD Template'}
                {activeSourceTab === 'client_email' && 'Paste Raw Client Email Text'}
                {activeSourceTab === 'voice_transcript' && 'Paste Recruiter Voice Note Transcript'}
                {activeSourceTab === 'whatsapp' && 'Paste WhatsApp Requirement Message'}
              </label>
              <textarea
                className="w-full p-3 text-xs bg-slate-950 border border-slate-800 rounded-xl text-slate-200 placeholder-slate-500 focus:outline-none focus:border-violet-500 font-mono resize-none"
                rows={4}
                placeholder={`Paste ${activeSourceTab} text here. AI will extract Job Knowledge Graph, mandatory skills, responsibilities & screening questions...`}
                value={inputText}
                onChange={e => setInputText(e.target.value)}
              />
            </div>
          )}

          {/* ACTION BUTTON */}
          <button
            onClick={handleGenerateAIJob}
            disabled={parsing}
            className="w-full py-3 bg-violet-600 hover:bg-violet-500 text-white font-black text-xs rounded-xl shadow-lg disabled:opacity-40 flex items-center justify-center gap-2 transition-all"
          >
            {parsing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4 text-emerald-300" />}
            Generate Job Knowledge Graph &amp; Create Requisition
          </button>
        </div>
      </div>
    </div>
  );
});

ImportJobModal.displayName = 'ImportJobModal';
