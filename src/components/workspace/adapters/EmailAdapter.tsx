import React from 'react';
import { WorkspaceAdapter, WorkspaceItem, WorkspaceCapabilities, WorkspaceMetadata, SearchResult, Citation } from './types';
import { Mail, Reply, Forward, Download, Search, Paperclip, MoreHorizontal } from 'lucide-react';

export class EmailAdapter implements WorkspaceAdapter {
  id = 'email-adapter';

  canOpen(item: WorkspaceItem): boolean {
    if (item.typeHint === 'email') return true;
    if (item.rawFile?.name.toLowerCase().endsWith('.eml')) return true;
    if (item.rawFile?.name.toLowerCase().endsWith('.msg')) return true;
    return false;
  }

  getCapabilities(): WorkspaceCapabilities {
    return {
      searchable: true,
      annotatable: false,
      comparable: false,
      printable: true,
      editable: false,
      aiSupported: true,
    };
  }

  async getMetadata(item: WorkspaceItem): Promise<WorkspaceMetadata> {
    return {
      title: item.rawFile?.name || 'Q3_Renewal_Discussion.eml',
      type: 'Email Thread',
      format: 'Outlook MSG',
      updatedAt: 'Received Today',
      status: 'Ready',
      fields: {
        'From': 'Sarah Jenkins (Legal)',
        'To': 'John Smith',
        'Date': 'Today, 10:42 AM',
        'Attachments': '2 Files',
        'Thread Size': '4 Messages',
        'Action Required': 'Yes',
      }
    };
  }

  async search(query: string): Promise<SearchResult[]> { return []; }
  async highlight(reference: Citation): Promise<void> {}
  async export(): Promise<void> {}
  async print(): Promise<void> {}

  render(item: WorkspaceItem): React.ReactNode {
    return <EmailMockRenderer item={item} />;
  }
}

const EmailMockRenderer: React.FC<{ item: WorkspaceItem }> = ({ item }) => {
  return (
    <div className="flex flex-col h-full bg-white overflow-hidden text-slate-800 font-sans">
      {/* Email Viewer Toolbar */}
      <div className="h-14 bg-slate-50 border-b border-slate-200 flex items-center justify-between px-6 shrink-0 z-20">
        <div className="flex items-center gap-2">
          <button className="flex items-center gap-2 px-3 py-1.5 hover:bg-slate-200 rounded-lg text-sm font-medium text-slate-700 transition-colors"><Reply className="w-4 h-4" /> Reply</button>
          <button className="flex items-center gap-2 px-3 py-1.5 hover:bg-slate-200 rounded-lg text-sm font-medium text-slate-700 transition-colors"><Forward className="w-4 h-4" /> Forward</button>
        </div>
        <div className="flex items-center gap-2 text-slate-500">
          <button className="p-2 hover:bg-slate-200 rounded-lg"><Search className="w-4 h-4" /></button>
          <button className="p-2 hover:bg-slate-200 rounded-lg"><Download className="w-4 h-4" /></button>
          <button className="p-2 hover:bg-slate-200 rounded-lg"><MoreHorizontal className="w-4 h-4" /></button>
        </div>
      </div>

      <div className="flex-1 overflow-auto">
        <div className="w-full max-w-[850px] mx-auto py-8 px-8">
          
          <h1 className="text-2xl font-bold text-slate-900 mb-6">Fwd: Action Required - Q3 Contract Renewal for Acme Corp</h1>
          
          <div className="flex justify-between items-start mb-8">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold text-lg">SJ</div>
              <div>
                <div className="font-bold text-slate-900">Sarah Jenkins <span className="text-sm font-normal text-slate-500">&lt;sarah.jenkins@legal.acme.com&gt;</span></div>
                <div className="text-sm text-slate-500">To: John Smith, cc: Legal Team</div>
              </div>
            </div>
            <div className="text-sm text-slate-500">Today, 10:42 AM (2 hours ago)</div>
          </div>

          <div className="mb-8 flex gap-3 border-b border-slate-100 pb-6">
             <div className="flex items-center gap-2 px-3 py-2 border border-slate-200 rounded-lg bg-slate-50 text-sm font-medium hover:bg-slate-100 cursor-pointer transition-colors shadow-sm">
               <Paperclip className="w-4 h-4 text-slate-500" />
               Acme_Renewal_Q3.pdf
               <span className="text-slate-400 text-xs">1.2 MB</span>
             </div>
             <div className="flex items-center gap-2 px-3 py-2 border border-slate-200 rounded-lg bg-slate-50 text-sm font-medium hover:bg-slate-100 cursor-pointer transition-colors shadow-sm">
               <Paperclip className="w-4 h-4 text-slate-500" />
               Vendor_Checklist.docx
               <span className="text-slate-400 text-xs">45 KB</span>
             </div>
          </div>

          <div className="prose prose-slate max-w-none prose-p:leading-relaxed">
            <p>Hi John,</p>
            <p>I've reviewed the latest drafts for the Acme Corp Q3 renewal. Overall, the terms look standard, but there is one major sticking point that needs your approval before we proceed.</p>
            
            <div className="relative my-6 p-1">
              <div className="absolute -inset-2 rounded-lg bg-cyan-50/50 ring-2 ring-cyan-400/50 transition-all duration-700"></div>
              <div className="relative z-10 bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded-r text-slate-800">
                <strong>Important:</strong> They have requested to increase the liability cap from $500,000 to $1,000,000 in Section 14.2. They also reduced the termination notice period down to 30 days.
              </div>
            </div>
            
            <p>Are you comfortable accepting these changes? If so, please let me know and I will prepare the final signature packet via DocuSign.</p>
            <p>We need this executed by Friday to avoid service interruption.</p>
            
            <p>Best regards,<br/>Sarah</p>
          </div>
          
        </div>
      </div>
    </div>
  );
};
