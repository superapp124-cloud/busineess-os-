import React, { useState, useEffect } from 'react';
import { WorkspaceAdapter, WorkspaceItem, WorkspaceCapabilities, WorkspaceMetadata, SearchResult, Citation } from './types';
import { FileText, Download, Printer } from 'lucide-react';

// mammoth is a peer dep — lazy import so it doesn't break if missing
async function parseDOCX(file: File): Promise<string> {
  try {
    const mammoth = await import('mammoth');
    const arrayBuffer = await file.arrayBuffer();
    const result = await mammoth.convertToHtml({ arrayBuffer });
    return result.value || '<p class="text-slate-400 text-sm text-center py-20">Document appears to be empty.</p>';
  } catch (err) {
    console.error('[WordAdapter] mammoth parse error', err);
    return '<p class="text-rose-500 text-sm text-center py-20">Could not parse this Word document. Try converting to PDF first.</p>';
  }
}

export class WordAdapter implements WorkspaceAdapter {
  id = 'word-adapter';

  canOpen(item: WorkspaceItem): boolean {
    if (item.typeHint === 'word') return true;
    const name = item.rawFile?.name.toLowerCase() || '';
    if (name.endsWith('.docx') || name.endsWith('.doc')) return true;
    return false;
  }

  getCapabilities(): WorkspaceCapabilities {
    return { searchable: true, annotatable: true, comparable: true, printable: true, editable: false, aiSupported: true };
  }

  async getMetadata(item: WorkspaceItem): Promise<WorkspaceMetadata> {
    return {
      title: item.rawFile?.name || 'Word Document',
      type: 'Document',
      format: 'DOCX',
      updatedAt: 'Just now',
      status: 'Ready',
      fields: {
        'File Size': item.rawFile && item.rawFile.size > 0
          ? `${(item.rawFile.size / 1024).toFixed(1)} KB`
          : 'No file uploaded',
      }
    };
  }

  async search(_query: string): Promise<SearchResult[]> { return []; }
  async highlight(_reference: Citation): Promise<void> {}
  async export(): Promise<void> {}
  async print(): Promise<void> { window.print(); }

  render(item: WorkspaceItem): React.ReactNode {
    return <WordRenderer item={item} />;
  }
}

const WordRenderer: React.FC<{ item: WorkspaceItem }> = ({ item }) => {
  const [htmlContent, setHtmlContent] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const hasRealFile = item.rawFile && item.rawFile.size > 0;

  useEffect(() => {
    if (!hasRealFile) {
      setLoading(false);
      setHtmlContent('');
      return;
    }
    setLoading(true);
    parseDOCX(item.rawFile!).then(html => {
      setHtmlContent(html);
      setLoading(false);
    });
  }, [item.rawFile]);

  // Empty state for mock/no-file items
  if (!hasRealFile) {
    return (
      <div className="flex flex-col h-full bg-[#f3f4f6]">
        {/* Word-style toolbar */}
        <div className="h-11 bg-[#2b579a] flex items-center justify-between px-4 shrink-0">
          <div className="flex items-center gap-2 text-white">
            <FileText className="w-4 h-4" />
            <span className="text-xs font-semibold truncate max-w-[240px]">{item.sourceUri}</span>
            <span className="text-[10px] bg-white/20 text-white px-1.5 py-0.5 rounded font-bold">DOCX</span>
          </div>
        </div>
        <div className="flex-1 flex flex-col items-center justify-center gap-5 p-12 bg-[#e8e8e8]">
          {/* Page preview */}
          <div className="relative">
            <div className="w-28 h-36 bg-white border border-slate-300 shadow-xl rounded flex flex-col px-4 py-5 gap-2">
              <div className="h-2 bg-[#2b579a]/20 rounded w-3/4" />
              <div className="h-1 bg-slate-200 rounded w-full" />
              <div className="h-1 bg-slate-200 rounded w-5/6" />
              <div className="h-1 bg-slate-200 rounded w-full" />
              <div className="h-1 bg-slate-200 rounded w-2/3" />
              <div className="mt-2 h-1 bg-slate-200 rounded w-full" />
              <div className="h-1 bg-slate-200 rounded w-3/4" />
              <div className="h-1 bg-slate-200 rounded w-full" />
              <div className="h-1 bg-slate-200 rounded w-1/2" />
            </div>
          </div>
          <div className="text-center max-w-xs">
            <p className="text-slate-700 font-bold text-sm mb-1 truncate">{item.sourceUri}</p>
            <p className="text-slate-500 text-xs leading-relaxed">
              CHATR has analysed this document and built your workspace.<br />
              Upload the real file to render it here.
            </p>
          </div>
          <div className="text-[11px] text-slate-500 bg-white border border-slate-200 rounded-lg px-4 py-2 shadow-sm">
            Click <span className="font-bold text-[#2b579a]">New Workspace Item</span> → select this .docx file
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full overflow-hidden bg-[#e8e8e8]">
      {/* Word-style blue toolbar */}
      <div className="h-11 bg-[#2b579a] flex items-center justify-between px-4 shrink-0 shadow-md">
        <div className="flex items-center gap-2 text-white">
          <FileText className="w-4 h-4" />
          <span className="text-xs font-semibold text-white truncate max-w-[240px]">{item.rawFile?.name}</span>
          <span className="text-[10px] bg-white/20 text-white px-1.5 py-0.5 rounded font-bold">DOCX</span>
        </div>
        <div className="flex items-center gap-2 text-white/70">
          <button onClick={() => window.print()} className="p-1.5 hover:bg-white/10 rounded transition-colors" title="Print">
            <Printer className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Document paper view */}
      <div className="flex-1 overflow-auto py-8 px-4">
        <div className="w-full max-w-[850px] mx-auto min-h-[1100px] bg-white shadow-xl text-slate-900 font-serif px-16 py-20 rounded-sm">
          {loading ? (
            <div className="flex items-center justify-center h-48 text-slate-400 gap-3">
              <div className="w-4 h-4 border-2 border-[#2b579a] border-t-transparent rounded-full animate-spin" />
              <span className="text-sm font-medium">Rendering document...</span>
            </div>
          ) : (
            <div
              className="prose prose-slate max-w-none prose-p:leading-relaxed prose-headings:font-bold prose-h1:text-2xl prose-h2:text-xl prose-h3:text-base prose-li:my-0.5"
              dangerouslySetInnerHTML={{ __html: htmlContent }}
            />
          )}
        </div>
      </div>
    </div>
  );
};
