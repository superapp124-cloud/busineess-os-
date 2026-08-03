import React, { useState, memo } from 'react';
import { Upload, X, Briefcase, Loader2, Sparkles } from 'lucide-react';
import { toast } from 'sonner';
import { Requisition } from './types';

interface ImportJobModalProps {
  open: boolean;
  onClose: () => void;
  onImport: (jobs: Partial<Requisition>[]) => void;
}

const ImportJobModal = memo(({ open, onClose, onImport }: ImportJobModalProps) => {
  const [pasteText, setPasteText] = useState('');
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
          // CSV Parser fallback
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

  const handleParseText = () => {
    if (!pasteText.trim()) return;
    setParsing(true);
    setTimeout(() => {
      // AI parser simulation
      const lines = pasteText.split('\n').map(l => l.trim()).filter(Boolean);
      const title = lines[0] ?? 'Senior Engineer';
      const loc = lines.find(l => l.toLowerCase().includes('location') || l.toLowerCase().includes('remote') || l.toLowerCase().includes('bangalore')) ?? 'Bangalore / Remote';
      const dept = lines.find(l => l.toLowerCase().includes('dept') || l.toLowerCase().includes('team')) ?? 'Engineering';
      
      const newJob: Partial<Requisition> = {
        title,
        department: dept.replace(/dept:|department:/i, '').trim(),
        location: loc.replace(/location:/i, '').trim(),
        type: 'Full-time',
        status: 'Open',
        jd: pasteText,
      };
      onImport([newJob]);
      setParsing(false);
      toast.success('AI parsed & created job requisition');
      onClose();
    }, 600);
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-white dark:bg-[#181B23] border border-slate-200 dark:border-slate-700 rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-700">
          <h3 className="font-bold text-slate-800 dark:text-white flex items-center gap-2">
            <Upload className="w-4 h-4 text-[#5c22ff]" /> Import Job Requisitions
          </h3>
          <button onClick={onClose}><X className="w-4 h-4 text-slate-400" /></button>
        </div>
        <div className="p-6 space-y-4">
          <div className="border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-xl p-6 text-center hover:border-[#5c22ff]/50 transition-colors">
            <Briefcase className="w-8 h-8 text-[#5c22ff] mx-auto mb-2" />
            <p className="text-xs font-semibold text-slate-700 dark:text-slate-200">Upload JSON or CSV File</p>
            <p className="text-[10px] text-slate-400 mt-1 mb-3">Drag file here or click to browse</p>
            <label className="px-3 py-1.5 bg-[#5c22ff] text-white text-xs font-semibold rounded-lg cursor-pointer hover:bg-[#4b1ac4] inline-block">
              Choose File <input type="file" accept=".json,.csv,.txt" className="hidden" onChange={handleFileUpload} />
            </label>
          </div>
          <div className="relative flex py-1 items-center">
            <div className="flex-grow border-t border-slate-200 dark:border-slate-700"></div>
            <span className="flex-shrink mx-3 text-[10px] font-bold text-slate-400 uppercase">OR Paste JD Text</span>
            <div className="flex-grow border-t border-slate-200 dark:border-slate-700"></div>
          </div>
          <textarea
            className="w-full p-3 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-700 dark:text-slate-200 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#5c22ff]/40 resize-none font-mono"
            rows={4}
            placeholder="Paste Job Description text here. AI will extract Title, Dept, Location & Requirements..."
            value={pasteText}
            onChange={e => setPasteText(e.target.value)}
          />
          <button
            onClick={handleParseText}
            disabled={parsing || !pasteText.trim()}
            className="w-full py-2.5 bg-[#5c22ff] text-white text-xs font-bold rounded-xl hover:bg-[#4b1ac4] disabled:opacity-40 flex items-center justify-center gap-2"
          >
            {parsing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />} AI Parse & Import Job
          </button>
        </div>
      </div>
    </div>
  );
});
ImportJobModal.displayName = 'ImportJobModal';

export { ImportJobModal };
