import React, { useEffect, useState, useRef } from 'react';
import {
  Search,
  FileText,
  User,
  Zap,
  Terminal,
  Shield,
  FileSearch,
  Command,
  RefreshCw,
  Download,
  GitBranch,
} from 'lucide-react';

import { MissionExecutionContext } from '../../core/types';

export interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
  missionContext: MissionExecutionContext | null;
  onOpenRuntimeInspector?: () => void;
}

export const CommandPalette: React.FC<CommandPaletteProps> = ({
  isOpen,
  onClose,
  missionContext,
  onOpenRuntimeInspector,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        // Typically parent manages the toggle based on keyboard events,
        // but if opened we can capture the event.
      }
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
      setSearchQuery('');
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 px-4 bg-black/40 backdrop-blur-sm">
      <div 
        className="fixed inset-0"
        onClick={onClose}
      />
      <div className="relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[80vh]">
        {/* Search Input */}
        <div className="flex items-center px-4 py-3 border-b border-slate-100">
          <Search className="w-5 h-5 text-slate-400 mr-3" />
          <input
            ref={inputRef}
            type="text"
            className="flex-1 bg-transparent text-slate-800 placeholder-slate-400 focus:outline-none text-lg font-medium"
            placeholder="Search commands, documents, or people..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        {/* Results Area */}
        <div className="flex-1 overflow-y-auto py-2">
          
          <Section title="DOCUMENTS">
            <Item icon={<FileText />} label="Addendum to Professional Service Agreement" />
            <Item icon={<FileText />} label="LinkedIn Profile" />
            <Item icon={<FileText />} label="Motor Policy" />
          </Section>

          <Section title="PEOPLE">
            <Item icon={<User />} label="Arshid Hussain Wani" hint="Operations Lead" />
            <Item icon={<User />} label="Finance Head" />
            <Item icon={<User />} label="Director of Engineering" />
          </Section>

          <Section title="MISSIONS">
            <Item 
              icon={<GitBranch />} 
              label={missionContext?.name || 'No Active Mission'} 
              hint="Active"
            />
          </Section>

          <Section title="CAPABILITIES">
            <Item icon={<Zap />} label="Contract Review" />
            <Item icon={<Zap />} label="Risk Analyzer" />
            <Item icon={<Zap />} label="Policy Validator" />
            <Item icon={<Zap />} label="Entity Extractor" />
          </Section>

          <Section title="COMMANDS">
            <Item icon={<Terminal />} label="Open Runtime Inspector" shortcut="Ctrl+Shift+I" />
            <Item icon={<Command />} label="New Mission" />
            <Item icon={<RefreshCw />} label="Replay Events" />
            <Item icon={<Download />} label="Export Audit Trail" />
          </Section>

          <Section title="POLICIES">
            <Item icon={<Shield />} label="Finance Expense Policy" />
            <Item icon={<Shield />} label="Legal Review SOP" />
            <Item icon={<Shield />} label="HR Onboarding Policy" />
          </Section>

        </div>

        {/* Footer */}
        <div className="px-4 py-3 border-t border-slate-100 bg-slate-50 flex items-center justify-center space-x-6 text-xs text-slate-500 font-medium">
          <div>
            <span className="font-semibold text-slate-700 bg-slate-200 px-1.5 py-0.5 rounded shadow-sm mr-1">Enter</span> to select
          </div>
          <div>
            <span className="font-semibold text-slate-700 bg-slate-200 px-1.5 py-0.5 rounded shadow-sm mr-1">Esc</span> to close
          </div>
          <div>
            <span className="font-semibold text-slate-700 bg-slate-200 px-1.5 py-0.5 rounded shadow-sm mr-1">↑↓</span> to navigate
          </div>
        </div>
      </div>
    </div>
  );
};

const Section = ({ title, children }: { title: string; children: React.ReactNode }) => (
  <div className="mb-4 last:mb-0">
    <div className="px-4 py-1.5 text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
      {title}
    </div>
    <div className="px-2">
      {children}
    </div>
  </div>
);

const Item = ({ 
  icon, 
  label, 
  hint,
  shortcut 
}: { 
  icon: React.ReactNode; 
  label: string; 
  hint?: string;
  shortcut?: string;
}) => (
  <div className="flex items-center px-3 py-2 rounded-lg cursor-pointer hover:bg-indigo-50 group text-slate-700">
    <div className="w-5 h-5 mr-3 text-slate-400 group-hover:text-indigo-500 flex items-center justify-center">
      {icon}
    </div>
    <div className="flex-1 font-medium">{label}</div>
    {hint && (
      <div className="text-xs text-slate-400 ml-3">{hint}</div>
    )}
    {shortcut && (
      <div className="flex items-center space-x-1 ml-3">
        {shortcut.split('+').map((key, i) => (
          <span key={i} className="px-1.5 py-0.5 rounded-md bg-slate-100 border border-slate-200 text-slate-500 text-[10px] font-semibold tracking-wide shadow-sm">
            {key}
          </span>
        ))}
      </div>
    )}
  </div>
);
