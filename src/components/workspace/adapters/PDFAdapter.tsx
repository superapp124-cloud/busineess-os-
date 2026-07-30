import React, { useState } from 'react';
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
      type: 'Contract',
      format: 'PDF',
      updatedAt: 'Updated today',
      status: 'Ready',
      fields: {
        'Contract Value': '$1,000,000',
        'Renewal Date': 'Oct 1, 2027',
        'Notice Period': '30 Days',
        'Parties': '2',
        'Jurisdiction': 'Delaware',
        'Risk': 'Low',
      }
    };
  }

  async search(query: string): Promise<SearchResult[]> {
    return [];
  }

  async highlight(reference: Citation): Promise<void> {
    // Implemented via React state in a real integration
  }

  async export(): Promise<void> {}
  async print(): Promise<void> {}

  render(item: WorkspaceItem): React.ReactNode {
    return <PDFMockRenderer item={item} />;
  }
}

const PDFMockRenderer: React.FC<{ item: WorkspaceItem }> = ({ item }) => {
  const [zoomLevel, setZoomLevel] = useState(100);

  return (
    <div className="flex flex-col h-full bg-[#323639] overflow-hidden">
      {/* Acrobat-style Toolbar */}
      <div className="h-12 bg-[#323639] border-b border-black/20 flex items-center justify-between px-4 shrink-0 shadow-sm z-20">
        <div className="flex items-center gap-4 text-slate-300">
           {/* Sidebar Toggle Mock */}
           <div className="w-8 h-8 rounded hover:bg-white/10 flex items-center justify-center cursor-pointer transition-colors">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M4 6H20M4 12H20M4 18H20" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
           </div>
           {/* Page Nav */}
           <div className="flex items-center gap-3">
             <button className="p-1 hover:bg-white/10 rounded"><ChevronLeft className="w-5 h-5" /></button>
             <span className="text-sm">1 / 120</span>
             <button className="p-1 hover:bg-white/10 rounded"><ChevronRight className="w-5 h-5" /></button>
           </div>
        </div>
        
        <div className="flex items-center gap-4 text-slate-300">
           {/* Zoom Controls */}
           <div className="flex items-center gap-2 bg-black/20 rounded px-2 py-1">
             <button onClick={() => setZoomLevel(z => Math.max(50, z - 10))} className="p-1 hover:bg-white/10 rounded"><ZoomOut className="w-4 h-4" /></button>
             <span className="text-sm w-12 text-center">{zoomLevel}%</span>
             <button onClick={() => setZoomLevel(z => Math.min(200, z + 10))} className="p-1 hover:bg-white/10 rounded"><ZoomIn className="w-4 h-4" /></button>
           </div>
        </div>

        <div className="flex items-center gap-3 text-slate-300">
          <button className="p-1.5 hover:bg-white/10 rounded"><Search className="w-4 h-4" /></button>
          <button className="p-1.5 hover:bg-white/10 rounded"><Download className="w-4 h-4" /></button>
        </div>
      </div>

      {/* Document Viewport */}
      <div className="flex-1 overflow-auto flex justify-center py-8">
        <div 
          className="w-full max-w-[850px] min-h-[1100px] bg-white shadow-2xl text-slate-900 font-serif relative"
          style={{ transform: `scale(${zoomLevel / 100})`, transformOrigin: 'top center' }}
        >
          {/* Realistic A4 padding */}
          <div className="px-16 py-20">
            <h1 className="text-2xl font-bold text-center mb-8 uppercase tracking-widest border-b-2 border-black pb-4">Master Service Agreement</h1>
            <p className="mb-6 leading-relaxed">This Master Service Agreement ("Agreement") is entered into as of the Effective Date by and between the parties.</p>
            
            <div className="space-y-6">
              <div>
                <h3 className="font-bold text-lg mb-2">1. Scope of Services</h3>
                <p className="text-justify leading-relaxed">Provider agrees to perform the services described in each Statement of Work ("SOW") executed by the parties. All services shall be performed in a professional and workmanlike manner.</p>
              </div>
              
              <div>
                <h3 className="font-bold text-lg mb-2">2. Term and Termination</h3>
                <p className="text-justify leading-relaxed">This Agreement shall commence on the Effective Date and continue until terminated. <span className="bg-yellow-200/50 rounded px-1">Either party may terminate this Agreement for convenience upon thirty (30) days prior written notice.</span></p>
              </div>

              <div className="mt-8 p-1 relative">
                <div className="absolute -inset-2 rounded-lg bg-cyan-400/20 ring-2 ring-cyan-400 transition-all duration-700"></div>
                <h3 className="font-bold text-lg mb-2 relative z-10">14. Limitation of Liability</h3>
                <p className="text-justify leading-relaxed relative z-10 font-bold bg-yellow-200/40 p-2 rounded">
                  14.2 Maximum aggregate liability under this Agreement shall not exceed $1,000,000 USD. Governed by Delaware law.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
