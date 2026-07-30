import React, { useState, useEffect } from 'react';
import { WorkspaceAdapter, WorkspaceItem, WorkspaceCapabilities, WorkspaceMetadata, SearchResult, Citation } from './types';
import { ZoomIn, ZoomOut, Search, Download } from 'lucide-react';

export class ImageAdapter implements WorkspaceAdapter {
  id = 'image-adapter';

  canOpen(item: WorkspaceItem): boolean {
    if (item.typeHint === 'image') return true;
    const name = item.rawFile?.name.toLowerCase() || '';
    if (name.endsWith('.png') || name.endsWith('.jpg') || name.endsWith('.jpeg') || name.endsWith('.gif') || name.endsWith('.webp')) return true;
    return false;
  }

  getCapabilities(): WorkspaceCapabilities {
    return {
      searchable: false,
      annotatable: true,
      comparable: false,
      printable: true,
      editable: false,
      aiSupported: true, // Vision model extraction
    };
  }

  async getMetadata(item: WorkspaceItem): Promise<WorkspaceMetadata> {
    return {
      title: item.rawFile?.name || 'Image',
      type: 'Image',
      format: item.rawFile?.type || 'Image',
      updatedAt: 'Just now',
      status: 'Ready',
      fields: {
        'File Size': item.rawFile ? `${(item.rawFile.size / 1024 / 1024).toFixed(2)} MB` : 'Unknown',
        'Resolution': 'Analyzed via Vision',
      }
    };
  }

  async search(query: string): Promise<SearchResult[]> { return []; }
  async highlight(reference: Citation): Promise<void> {}
  async export(): Promise<void> {}
  async print(): Promise<void> {}

  render(item: WorkspaceItem): React.ReactNode {
    return <ImageRenderer item={item} />;
  }
}

const ImageRenderer: React.FC<{ item: WorkspaceItem }> = ({ item }) => {
  const [zoomLevel, setZoomLevel] = useState(100);
  const [imageUrl, setImageUrl] = useState<string | null>(null);

  useEffect(() => {
    if (item.rawFile) {
      const url = URL.createObjectURL(item.rawFile);
      setImageUrl(url);
      return () => URL.revokeObjectURL(url);
    }
  }, [item.rawFile]);

  return (
    <div className="flex flex-col h-full bg-[#1e1e1e] overflow-hidden">
      <div className="h-12 bg-[#2d2d2d] border-b border-black/40 flex items-center justify-between px-4 shrink-0 shadow-sm z-20">
        <div className="flex items-center gap-4 text-slate-300">
           {/* Zoom Controls */}
           <div className="flex items-center gap-2 bg-black/30 rounded px-2 py-1">
             <button onClick={() => setZoomLevel(z => Math.max(10, z - 10))} className="p-1 hover:bg-white/10 rounded"><ZoomOut className="w-4 h-4" /></button>
             <span className="text-sm w-12 text-center">{zoomLevel}%</span>
             <button onClick={() => setZoomLevel(z => Math.min(300, z + 10))} className="p-1 hover:bg-white/10 rounded"><ZoomIn className="w-4 h-4" /></button>
           </div>
        </div>
        
        <div className="flex items-center gap-3 text-slate-300">
          <a href={imageUrl || '#'} download={item.rawFile?.name} className="p-1.5 hover:bg-white/10 rounded"><Download className="w-4 h-4" /></a>
        </div>
      </div>

      <div className="flex-1 overflow-auto flex justify-center items-center p-8">
        {imageUrl ? (
          <img 
            src={imageUrl} 
            alt={item.rawFile?.name}
            className="shadow-2xl transition-transform duration-200"
            style={{ transform: `scale(${zoomLevel / 100})`, maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }}
          />
        ) : (
          <div className="text-slate-500">No Image File</div>
        )}
      </div>
    </div>
  );
};
