import React, { useState, useEffect } from 'react';
import { WorkspaceAdapter, WorkspaceItem, WorkspaceCapabilities, WorkspaceMetadata, SearchResult, Citation } from './types';
import { ZoomIn, ZoomOut, ChevronLeft, ChevronRight, Search, Download } from 'lucide-react';

export class PDFAdapter implements WorkspaceAdapter {
  id = 'pdf-adapter';

  canOpen(item: WorkspaceItem): boolean {
    if (item.typeHint === 'pdf') return true;
    if (item.rawFile?.name.toLowerCase().endsWith('.pdf')) return true;
    return false;
  }

  getCapabilities(): WorkspaceCapabilities {
    return {
      searchable: true,
      annotatable: true,
      comparable: true,
      printable: true,
      editable: false,
      aiSupported: true,
    };
  }

  async getMetadata(item: WorkspaceItem): Promise<WorkspaceMetadata> {
    return {
      title: item.rawFile?.name || 'Document.pdf',
      type: 'PDF Document',
      format: 'PDF',
      updatedAt: 'Updated today',
      status: 'Ready',
      fields: {
        'File Size': item.rawFile ? `${(item.rawFile.size / 1024 / 1024).toFixed(2)} MB` : 'Unknown',
      }
    };
  }

  async search(query: string): Promise<SearchResult[]> { return []; }
  async highlight(reference: Citation): Promise<void> {}
  async export(): Promise<void> {}
  async print(): Promise<void> {}

  render(item: WorkspaceItem): React.ReactNode {
    return <PDFRenderer item={item} />;
  }
}

const PDFRenderer: React.FC<{ item: WorkspaceItem }> = ({ item }) => {
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);

  useEffect(() => {
    if (item.rawFile) {
      const url = URL.createObjectURL(item.rawFile);
      setPdfUrl(url);
      return () => URL.revokeObjectURL(url);
    }
  }, [item.rawFile]);

  return (
    <div className="flex flex-col h-full bg-[#323639] overflow-hidden">
      {/* Acrobat-style Toolbar */}
      <div className="h-12 bg-[#323639] border-b border-black/20 flex items-center justify-between px-4 shrink-0 shadow-sm z-20">
        <div className="flex items-center gap-4 text-slate-300">
           <div className="w-8 h-8 rounded hover:bg-white/10 flex items-center justify-center cursor-pointer transition-colors">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M4 6H20M4 12H20M4 18H20" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
           </div>
        </div>
        <div className="flex items-center gap-3 text-slate-300">
          <button className="p-1.5 hover:bg-white/10 rounded"><Search className="w-4 h-4" /></button>
          <a href={pdfUrl || '#'} download={item.rawFile?.name} className="p-1.5 hover:bg-white/10 rounded"><Download className="w-4 h-4" /></a>
        </div>
      </div>

      <div className="flex-1 overflow-hidden flex justify-center">
        {pdfUrl ? (
          <iframe 
            src={`${pdfUrl}#toolbar=0`} 
            className="w-full h-full border-none" 
            title={item.rawFile?.name} 
          />
        ) : (
          <div className="text-white flex items-center justify-center h-full">No PDF File Attached</div>
        )}
      </div>
    </div>
  );
};
