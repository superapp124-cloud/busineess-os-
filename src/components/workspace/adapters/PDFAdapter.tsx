import React, { useState, useEffect, useRef, useCallback } from 'react';
import { WorkspaceAdapter, WorkspaceItem, WorkspaceCapabilities, WorkspaceMetadata, SearchResult, Citation } from './types';
import { Download, Search, ZoomIn, ZoomOut, FileText, ChevronLeft, ChevronRight, Loader2 } from 'lucide-react';

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
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [pdfDoc, setPdfDoc] = useState<any>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [scale, setScale] = useState(1.4);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const renderTaskRef = useRef<any>(null);

  const hasRealFile = item.rawFile && item.rawFile.size > 0;

  // Load PDF from rawFile using pdfjs-dist
  useEffect(() => {
    if (!hasRealFile || !item.rawFile) {
      setPdfDoc(null);
      return;
    }

    setLoading(true);
    setError(null);
    setCurrentPage(1);

    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        const arrayBuffer = e.target?.result as ArrayBuffer;
        // Dynamically import pdfjs to avoid bundling issues
        const pdfjsLib = await import('pdfjs-dist');
        // Point to the bundled worker
        pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
          'pdfjs-dist/build/pdf.worker.min.mjs',
          import.meta.url
        ).toString();

        const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer });
        const pdf = await loadingTask.promise;
        setPdfDoc(pdf);
        setTotalPages(pdf.numPages);
        setLoading(false);
      } catch (err: any) {
        console.error('[PDFAdapter] Failed to load PDF:', err);
        setError(`Failed to render PDF: ${err.message}`);
        setLoading(false);
      }
    };
    reader.readAsArrayBuffer(item.rawFile);
  }, [item.rawFile]);

  // Render the current page to canvas
  const renderPage = useCallback(async (pageNum: number) => {
    if (!pdfDoc || !canvasRef.current) return;

    // Cancel any in-progress render
    if (renderTaskRef.current) {
      renderTaskRef.current.cancel();
      renderTaskRef.current = null;
    }

    try {
      const page = await pdfDoc.getPage(pageNum);
      const viewport = page.getViewport({ scale });
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      canvas.width = viewport.width;
      canvas.height = viewport.height;

      const renderTask = page.render({ canvasContext: ctx, viewport });
      renderTaskRef.current = renderTask;
      await renderTask.promise;
      renderTaskRef.current = null;
    } catch (err: any) {
      if (err?.name !== 'RenderingCancelledException') {
        console.error('[PDFAdapter] Page render error:', err);
      }
    }
  }, [pdfDoc, scale]);

  useEffect(() => {
    if (pdfDoc) renderPage(currentPage);
  }, [pdfDoc, currentPage, scale, renderPage]);

  const handleDownload = () => {
    if (!item.rawFile) return;
    const url = URL.createObjectURL(item.rawFile);
    const a = document.createElement('a');
    a.href = url;
    a.download = item.rawFile.name;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (!hasRealFile) {
    return (
      <div className="flex flex-col h-full bg-[#2c2c2c]">
        <div className="h-12 bg-[#3a3a3a] border-b border-black/30 flex items-center px-4 shrink-0 gap-2">
          <FileText className="w-4 h-4 text-red-400" />
          <span className="text-xs font-semibold text-slate-300 truncate max-w-[260px]">{item.sourceUri}</span>
          <span className="text-[10px] bg-red-700/80 text-white px-1.5 py-0.5 rounded font-bold">PDF</span>
        </div>
        <div className="flex-1 flex flex-col items-center justify-center gap-5 p-12 select-none">
          <div className="relative">
            <div className="w-24 h-32 bg-white/8 rounded-lg border border-white/10 absolute top-1.5 left-1.5 rotate-1" />
            <div className="w-24 h-32 bg-white/5 rounded-lg border border-white/10 flex flex-col items-center justify-center gap-2 relative z-10 shadow-xl">
              <FileText className="w-8 h-8 text-slate-500" />
              <div className="space-y-1.5 w-14">
                <div className="h-1 bg-slate-600 rounded-full w-full" />
                <div className="h-1 bg-slate-700 rounded-full w-3/4" />
                <div className="h-1 bg-slate-700 rounded-full w-full" />
                <div className="h-1 bg-slate-700 rounded-full w-1/2" />
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
      {/* Toolbar */}
      <div className="h-12 bg-[#3a3d40] border-b border-black/30 flex items-center justify-between px-4 shrink-0 z-20">
        <div className="flex items-center gap-2 text-slate-300">
          <FileText className="w-4 h-4 text-red-400" />
          <span className="text-xs font-semibold text-slate-200 truncate max-w-[200px]">{item.rawFile?.name}</span>
          <span className="text-[10px] bg-red-600 text-white px-1.5 py-0.5 rounded font-bold">PDF</span>
        </div>

        {/* Page Nav */}
        {totalPages > 0 && (
          <div className="flex items-center gap-1 text-slate-300">
            <button
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage <= 1}
              className="p-1 hover:bg-white/10 rounded disabled:opacity-30 transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="text-[11px] font-semibold text-slate-300 w-16 text-center">
              {currentPage} / {totalPages}
            </span>
            <button
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage >= totalPages}
              className="p-1 hover:bg-white/10 rounded disabled:opacity-30 transition-colors"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Zoom + Download */}
        <div className="flex items-center gap-1 text-slate-400">
          <button onClick={() => setScale(s => Math.max(0.5, s - 0.2))} className="p-1.5 hover:bg-white/10 rounded" title="Zoom Out">
            <ZoomOut className="w-4 h-4" />
          </button>
          <span className="text-[10px] text-slate-500 w-10 text-center">{Math.round(scale * 100)}%</span>
          <button onClick={() => setScale(s => Math.min(3, s + 0.2))} className="p-1.5 hover:bg-white/10 rounded" title="Zoom In">
            <ZoomIn className="w-4 h-4" />
          </button>
          <div className="w-px h-4 bg-white/10 mx-1" />
          <button onClick={handleDownload} className="p-1.5 hover:bg-white/10 rounded" title="Download">
            <Download className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Canvas Viewport */}
      <div ref={containerRef} className="flex-1 overflow-auto bg-[#525659] flex justify-center items-start p-4">
        {loading ? (
          <div className="flex flex-col items-center justify-center gap-3 mt-24">
            <Loader2 className="w-8 h-8 text-slate-400 animate-spin" />
            <p className="text-slate-400 text-sm font-medium">Rendering PDF...</p>
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center gap-3 mt-24 text-rose-400">
            <FileText className="w-8 h-8" />
            <p className="text-sm font-medium">{error}</p>
          </div>
        ) : (
          <canvas
            ref={canvasRef}
            className="shadow-2xl rounded-sm"
            style={{ maxWidth: '100%' }}
          />
        )}
      </div>
    </div>
  );
};
