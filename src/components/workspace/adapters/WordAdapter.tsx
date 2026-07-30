import React, { useState, useEffect } from 'react';
import { WorkspaceAdapter, WorkspaceItem, WorkspaceCapabilities, WorkspaceMetadata, SearchResult, Citation } from './types';
import * as mammoth from 'mammoth';

export class WordAdapter implements WorkspaceAdapter {
  id = 'word-adapter';

  canOpen(item: WorkspaceItem): boolean {
    if (item.typeHint === 'word') return true;
    const name = item.rawFile?.name.toLowerCase() || '';
    if (name.endsWith('.docx') || name.endsWith('.doc')) return true;
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
      title: item.rawFile?.name || 'Word Document',
      type: 'Document',
      format: 'DOCX',
      updatedAt: 'Just now',
      status: 'Ready',
      fields: {
        'File Size': item.rawFile ? `${(item.rawFile.size / 1024).toFixed(2)} KB` : 'Unknown',
      }
    };
  }

  async search(query: string): Promise<SearchResult[]> { return []; }
  async highlight(reference: Citation): Promise<void> {}
  async export(): Promise<void> {}
  async print(): Promise<void> {}

  render(item: WorkspaceItem): React.ReactNode {
    return <WordRenderer item={item} />;
  }
}

const WordRenderer: React.FC<{ item: WorkspaceItem }> = ({ item }) => {
  const [htmlContent, setHtmlContent] = useState<string>('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (item.rawFile && item.rawFile.name.endsWith('.docx')) {
      const reader = new FileReader();
      reader.onload = async (e) => {
        try {
          const arrayBuffer = e.target?.result as ArrayBuffer;
          const result = await mammoth.convertToHtml({ arrayBuffer });
          setHtmlContent(result.value);
        } catch (error) {
          console.error('Error parsing docx', error);
          setHtmlContent('<div class="text-red-500">Could not preview this Word document natively.</div>');
        } finally {
          setLoading(false);
        }
      };
      reader.readAsArrayBuffer(item.rawFile);
    } else {
      setLoading(false);
      setHtmlContent(`<div class="text-slate-500 text-center py-20">Preview not available for ${item.rawFile?.name || 'this file'}.</div>`);
    }
  }, [item.rawFile]);

  return (
    <div className="flex flex-col h-full bg-[#f3f4f6] overflow-hidden">
      <div className="flex-1 overflow-auto flex justify-center py-8">
        <div className="w-full max-w-[850px] min-h-[1100px] bg-white shadow-xl text-slate-900 font-serif px-16 py-20">
          {loading ? (
            <div className="flex items-center justify-center h-full text-slate-400">Loading document...</div>
          ) : (
            <div 
              className="prose prose-slate max-w-none prose-p:leading-relaxed"
              dangerouslySetInnerHTML={{ __html: htmlContent }} 
            />
          )}
        </div>
      </div>
    </div>
  );
};
