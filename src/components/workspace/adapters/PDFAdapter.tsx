import React, { useState, useEffect } from 'react';
import { WorkspaceAdapter, WorkspaceItem, WorkspaceCapabilities, WorkspaceMetadata, SearchResult, Citation } from './types';
import { Download, Search, ZoomIn, ZoomOut, FileText } from 'lucide-react';

export class PDFAdapter implements WorkspaceAdapter {
  id = 'pdf-adapter';

  canOpen(item: WorkspaceItem): boolean {
    if (item.typeHint === 'pdf') return true;
    if (item.rawFile?.name.toLowerCase().endsWith('.pdf')) return true;
    return false;
  }

  getCapabilities(): WorkspaceCapabilities {
    return { searchable: true, annotatable: true, comparable: true, printable: true, editable: false, aiSupported: true };
  }

  async getMetadata(item: WorkspaceItem): Promise<WorkspaceMetadata> {
    return {
      title: item.rawFile?.name || 'Document.pdf',
      type: 'PDF Document',
      format: 'PDF',
      updatedAt: 'Updated today',
      status: 'Ready',
      fields: {
        'File Size': item.rawFile && item.rawFile.size > 0
          ? `${(item.rawFile.size / 1024 / 1024).toFixed(2)} MB`
          : 'No file uploaded',
      }
    };
  }

  async search(_query: string): Promise<SearchResult[]> { return []; }
  async highlight(_reference: Citation): Promise<void> {}
  async export(): Promise<void> {}
  async print(): Promise<void> {}

  render(item: WorkspaceItem): React.ReactNode {
    return <PDFRenderer item={item} />;
  }
}

const PDFRenderer: React.FC<{ item: WorkspaceItem }> = ({ item }) => {
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const hasRealFile = item.rawFile && item.rawFile.size > 0;

  useEffect(() => {
    if (hasRealFile && item.rawFile) {
      const url = URL.createObjectURL(item.rawFile);
      setPdfUrl(url);
      return () => URL.revokeObjectURL(url);
    } else {
      setPdfUrl(null);
    }
  }, [item.rawFile]);

  if (!hasRealFile) {
    // Rich empty state — file not yet uploaded
    return (
      <div className="flex flex-col h-full bg-[#2c2c2c]">
        <div className="h-12 bg-[#3a3a3a] border-b border-black/30 flex items-center justify-between px-4 shrink-0">
          <div className="flex items-center gap-2 text-slate-400">
            <FileText className="w-4 h-4 text-red-400" />
            <span className="text-xs font-semibold text-slate-300 truncate max-w-[260px]">{item.sourceUri}</span>
            <span className="text-[10px] bg-red-700/80 text-white px-1.5 py-0.5 rounded font-bold">PDF</span>
          </div>
        </div>
        <div className="flex-1 flex flex-col items-center justify-center gap-5 p-12 select-none">
          {/* Document shadow preview */}
          <div className="relative">
            <div className="w-24 h-32 bg-white/8 rounded-lg border border-white/10 absolute top-1.5 left-1.5 rotate-1" />
            <div className="w-24 h-32 bg-white/5 rounded-lg border border-white/10 flex flex-col items-center justify-center gap-2 relative z-10 shadow-xl">
              <FileText className="w-8 h-8 text-slate-500" />
              <div className="space-y-1.5 w-14">
                <div className="h-1 bg-slate-600 rounded-full w-full" />
                <div className="h-1 bg-slate-700 rounded-full w-3/4" />
                <div className="h-1 bg-slate-700 rounded-full w-full" />
                <div className="h-1 bg-slate-700 rounded-full w-1/2" />
                <div className="h-1 bg-slate-700 rounded-full w-5/6" />
              </div>
            </div>
          </div>
          <div className="text-center max-w-xs">
            <p className="text-slate-200 font-bold text-sm mb-1 truncate">{item.sourceUri}</p>
            <p className="text-slate-500 text-xs leading-relaxed">
              CHATR has analysed this filename and prepared your workspace.<br />
              Upload the real PDF to render it here.
            </p>
          </div>
          <div className="text-[11px] text-slate-600 bg-white/5 border border-white/8 rounded-lg px-4 py-2">
            Click <span className="font-bold text-slate-400">New Workspace Item</span> → select this file
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-[#323639] overflow-hidden">
      {/* Adobe-style dark toolbar */}
      <div className="h-12 bg-[#3a3d40] border-b border-black/30 flex items-center justify-between px-4 shrink-0 z-20">
        <div className="flex items-center gap-2 text-slate-300">
          <FileText className="w-4 h-4 text-red-400" />
          <span className="text-xs font-semibold text-slate-200 truncate max-w-[240px]">{item.rawFile?.name}</span>
          <span className="text-[10px] bg-red-600 text-white px-1.5 py-0.5 rounded font-bold">PDF</span>
        </div>
        <div className="flex items-center gap-1 text-slate-400">
          <button className="p-1.5 hover:bg-white/10 rounded transition-colors" title="Search in PDF">
            <Search className="w-4 h-4" />
          </button>
          <div className="w-px h-4 bg-white/10 mx-1" />
          <a href={pdfUrl || '#'} download={item.rawFile?.name}
            className="p-1.5 hover:bg-white/10 rounded transition-colors flex items-center" title="Download">
            <Download className="w-4 h-4" />
          </a>
        </div>
      </div>
      {/* Full-height PDF iframe */}
      <div className="flex-1 overflow-hidden">
        <iframe
          src={`${pdfUrl}#toolbar=0&navpanes=0&scrollbar=1&view=FitH`}
          className="w-full h-full border-none"
          title={item.rawFile?.name}
        />
      </div>
    </div>
  );
};
