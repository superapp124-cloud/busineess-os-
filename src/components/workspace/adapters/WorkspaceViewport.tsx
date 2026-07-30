import React, { useMemo } from 'react';
import { WorkspaceAdapter, WorkspaceItem } from './types';
import { PDFAdapter } from './PDFAdapter';
import { ResumeAdapter } from './ResumeAdapter';
import { EmailAdapter } from './EmailAdapter';
import { FileQuestion } from 'lucide-react';

const builtInAdapters: WorkspaceAdapter[] = [
  new ResumeAdapter(), // Check specific types first
  new EmailAdapter(),
  new PDFAdapter(),    // Fallback for general PDFs
];

interface WorkspaceViewportProps {
  item: WorkspaceItem;
}

export const WorkspaceViewport: React.FC<WorkspaceViewportProps> = ({ item }) => {
  const adapter = useMemo(() => {
    return builtInAdapters.find(a => a.canOpen(item));
  }, [item]);

  if (!adapter) {
    return (
      <div className="flex-1 bg-slate-100 flex flex-col items-center justify-center p-8 text-center text-slate-500 font-sans">
        <FileQuestion className="w-16 h-16 text-slate-300 mb-4" />
        <h2 className="text-xl font-bold text-slate-700 mb-2">No Adapter Found</h2>
        <p className="max-w-sm text-sm">
          CHATR Workspace currently does not have a rendering adapter capable of displaying <strong>{item.rawFile?.name || item.sourceUri}</strong>.
        </p>
      </div>
    );
  }

  return (
    <div className="flex-1 w-full h-full relative overflow-hidden bg-slate-100">
      {adapter.render(item)}
    </div>
  );
};

export const getAdapterFor = (item: WorkspaceItem): WorkspaceAdapter | undefined => {
  return builtInAdapters.find(a => a.canOpen(item));
};
