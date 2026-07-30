import React from 'react';
import { WorkspaceAdapter, WorkspaceItem, WorkspaceCapabilities, WorkspaceMetadata, SearchResult, Citation } from './types';
import { Briefcase, GraduationCap, Code, Trophy, Download, Search } from 'lucide-react';

export class ResumeAdapter implements WorkspaceAdapter {
  id = 'resume-adapter';

  canOpen(item: WorkspaceItem): boolean {
    if (item.typeHint === 'resume') return true;
    if (item.rawFile?.name.toLowerCase().includes('resume')) return true;
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
      title: item.rawFile?.name || 'Resume.pdf',
      type: 'Resume',
      format: 'PDF',
      updatedAt: 'Updated today',
      status: 'Ready',
      fields: {
        'Experience Level': 'Senior (8+ years)',
        'Education': 'M.S. Computer Science',
        'Current Role': 'Lead Engineer',
        'Clearance': 'None',
        'Location': 'San Francisco, CA',
        'Match Score': '92%',
      }
    };
  }

  async search(query: string): Promise<SearchResult[]> { return []; }
  async highlight(reference: Citation): Promise<void> {}
  async export(): Promise<void> {}
  async print(): Promise<void> {}

  render(item: WorkspaceItem): React.ReactNode {
    return <ResumeMockRenderer item={item} />;
  }
}

const ResumeMockRenderer: React.FC<{ item: WorkspaceItem }> = ({ item }) => {
  return (
    <div className="flex flex-col h-full bg-slate-50 overflow-hidden text-slate-800 font-sans">
      {/* ATS Style Toolbar */}
      <div className="h-14 bg-white border-b border-slate-200 flex items-center justify-between px-6 shrink-0 z-20">
        <div className="flex items-center gap-4">
          <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center font-bold text-slate-600">JS</div>
          <div>
            <h2 className="font-bold text-sm">John Smith</h2>
            <div className="text-[11px] text-slate-500">john.smith@example.com • (555) 123-4567</div>
          </div>
        </div>
        <div className="flex items-center gap-3 text-slate-500">
          <button className="p-2 hover:bg-slate-100 rounded-lg"><Search className="w-4 h-4" /></button>
          <button className="p-2 hover:bg-slate-100 rounded-lg"><Download className="w-4 h-4" /></button>
        </div>
      </div>

      <div className="flex-1 overflow-auto p-8 flex justify-center">
        <div className="w-full max-w-[800px] space-y-6">
          {/* Structured Sections */}
          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
            <h3 className="flex items-center gap-2 font-bold text-sm mb-4 text-slate-900 uppercase tracking-wider"><Briefcase className="w-4 h-4 text-indigo-500" /> Work Experience</h3>
            <div className="space-y-6">
              <div className="relative">
                <div className="absolute -inset-2 rounded-lg bg-cyan-50/50 ring-2 ring-cyan-400/50 transition-all duration-700"></div>
                <div className="relative z-10">
                  <div className="flex justify-between items-start mb-1">
                    <h4 className="font-bold text-slate-900">Senior Software Engineer</h4>
                    <span className="text-sm text-slate-500">2020 - Present</span>
                  </div>
                  <div className="text-sm text-indigo-600 font-medium mb-3">Tech Corp Inc.</div>
                  <ul className="list-disc pl-5 text-sm space-y-2 text-slate-600">
                    <li>Architected distributed microservices handling 10M+ daily requests using Node.js and Go.</li>
                    <li>Reduced latency by 40% through Redis caching and query optimization.</li>
                    <li>Mentored 5 junior developers and led the transition to CI/CD pipelines.</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
            <h3 className="flex items-center gap-2 font-bold text-sm mb-4 text-slate-900 uppercase tracking-wider"><Code className="w-4 h-4 text-emerald-500" /> Technical Skills</h3>
            <div className="flex flex-wrap gap-2">
              {['TypeScript', 'React', 'Node.js', 'Go', 'Kubernetes', 'AWS', 'PostgreSQL', 'Redis'].map(skill => (
                <span key={skill} className="px-3 py-1 bg-slate-100 text-slate-700 rounded-full text-sm font-medium">{skill}</span>
              ))}
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
            <h3 className="flex items-center gap-2 font-bold text-sm mb-4 text-slate-900 uppercase tracking-wider"><GraduationCap className="w-4 h-4 text-amber-500" /> Education</h3>
            <div className="flex justify-between items-start mb-1">
              <h4 className="font-bold text-slate-900">M.S. Computer Science</h4>
              <span className="text-sm text-slate-500">2018 - 2020</span>
            </div>
            <div className="text-sm text-slate-600">Stanford University</div>
          </div>
        </div>
      </div>
    </div>
  );
};
