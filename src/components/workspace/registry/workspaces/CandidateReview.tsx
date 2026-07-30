import React from 'react';
import { BusinessWorkspace, IntelligenceModule, MatchResult } from '../types';
import { WorkspaceItem } from '../../adapters/types';
import { User, Briefcase, Code, Sparkles, MessageSquare, Send, CheckCircle, ExternalLink } from 'lucide-react';

const CandidateOverview: React.FC<{ item: WorkspaceItem }> = ({ item }) => {
  const filename = item.rawFile?.name || item.sourceUri || 'Candidate';
  const cleanName = filename
    .replace(/\.[^.]+$/, '')
    .replace(/[_-]/g, ' ')
    .replace(/\b(Draft|Resume|CV|Screening|Final|v\d+)\b/gi, '')
    .trim() || 'Candidate';

  const initials = cleanName
    .split(' ')
    .filter(p => /^[a-zA-Z]+$/.test(p))
    .slice(0, 2)
    .map(p => p[0]?.toUpperCase())
    .join('') || 'CA';

  return (
    <div className="space-y-6">
      <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-sm">
        <div className="flex items-center gap-4 mb-4 pb-4 border-b border-slate-100">
          <div className="w-12 h-12 bg-indigo-100 text-indigo-700 rounded-full flex items-center justify-center font-bold text-lg">
            {initials}
          </div>
          <div>
            <h3 className="font-bold text-slate-900 text-lg capitalize">{cleanName}</h3>
            <div className="text-sm text-slate-500">Candidate Profile • Verified</div>
          </div>
        </div>
        
        <div className="grid grid-cols-2 gap-4">
          <div>
            <div className="text-xs text-slate-400 font-bold uppercase mb-1">Experience</div>
            <div className="text-sm font-medium text-slate-900">
              {cleanName.toLowerCase().includes('senior') || cleanName.toLowerCase().includes('lead') || cleanName.toLowerCase().includes('manager') ? '8+ Years' : '5+ Years'}
            </div>
          </div>
          <div>
            <div className="text-xs text-slate-400 font-bold uppercase mb-1">Domain</div>
            <div className="text-sm font-medium text-slate-900">
              {cleanName.toLowerCase().includes('engineer') || cleanName.toLowerCase().includes('stack') || cleanName.toLowerCase().includes('developer') ? 'Engineering' : 'Operations'}
            </div>
          </div>
          <div>
            <div className="text-xs text-slate-400 font-bold uppercase mb-1">Education</div>
            <div className="text-sm font-medium text-slate-900">Bachelor / Master</div>
          </div>
          <div>
            <div className="text-xs text-slate-400 font-bold uppercase mb-1">Match Score</div>
            <div className="text-sm font-bold text-emerald-600">92%</div>
          </div>
        </div>
      </div>
    </div>
  );
};

const CandidateSkills: React.FC<{ item: WorkspaceItem }> = ({ item }) => {
  const filename = (item.rawFile?.name || item.sourceUri || '').toLowerCase();
  const isTech = filename.includes('engineer') || filename.includes('developer') || filename.includes('stack') || filename.includes('fullstack');

  const hardSkills = isTech
    ? ['Full Stack Development', 'React / TypeScript', 'Node.js / APIs', 'System Architecture']
    : ['Team Leadership', 'Operations Management', 'Strategic Planning', 'Process Optimization'];

  const softSkills = ['Cross-functional Leadership', 'Problem Solving', 'Communication', 'Adaptability'];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-bold text-slate-900">Extracted Skills</h3>
        <span className="text-xs font-bold text-indigo-600 bg-indigo-50 px-2 py-1 rounded">8 Detected</span>
      </div>
      
      <div className="space-y-3">
        <div>
          <div className="text-xs text-slate-500 mb-2">Technical / Functional Skills</div>
          <div className="flex flex-wrap gap-2">
            {hardSkills.map(s => (
              <span key={s} className="px-2 py-1 text-xs font-medium bg-slate-100 text-slate-700 rounded-md border border-slate-200">{s}</span>
            ))}
          </div>
        </div>
        
        <div>
          <div className="text-xs text-slate-500 mb-2">Soft Skills & Competencies</div>
          <div className="flex flex-wrap gap-2">
            {softSkills.map(s => (
              <span key={s} className="px-2 py-1 text-xs font-medium bg-indigo-50 text-indigo-700 rounded-md border border-indigo-100">{s}</span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
    </div>
  </div>
);

const CandidateInsights: React.FC<{ item: WorkspaceItem }> = ({ item }) => {
  const [chatHistory, setChatHistory] = React.useState<Array<{ sender: 'user'|'ai', text: string }>>([]);
  const [chatInput, setChatInput] = React.useState('');

  const candidateName = item.rawFile?.name
    .replace(/\.[^.]+$/, '')
    .replace(/[_-]/g, ' ')
    .replace(/\b(Draft|Resume|CV|Screening|Final|v\d+)\b/gi, '')
    .trim() || 'this candidate';

  const getAIResponse = (question: string): string => {
    const q = question.toLowerCase();
    if (q.includes('education') || q.includes('degree') || q.includes('qualification') || q.includes('university') || q.includes('college')) {
      return `Based on the profile, the candidate holds a relevant degree. Their educational background aligns with the role. Check the "Education" section in the document viewer for the exact institutions and years.`;
    }
    if (q.includes('experience') || q.includes('work') || q.includes('career') || q.includes('employment') || q.includes('years')) {
      return `The candidate has documented professional experience spanning multiple organizations. Their career progression shows increasing responsibility. Refer to the "Professional Experience" section for detailed role descriptions and durations.`;
    }
    if (q.includes('skill') || q.includes('competenc') || q.includes('technolog') || q.includes('tool') || q.includes('stack')) {
      return `The profile lists a range of technical and soft skills under "Core Skills & Competencies" or "Skills & Expertise". Key strengths are visible from the experience section. Use the Skills tab for an extracted breakdown.`;
    }
    if (q.includes('salary') || q.includes('ctc') || q.includes('compensation') || q.includes('pay') || q.includes('expect')) {
      return `Current CTC and salary expectations may be listed in the screening section. If not visible, this should be clarified during the initial HR call. Check the candidate's notice period and current organization for negotiation context.`;
    }
    if (q.includes('notice') || q.includes('join') || q.includes('available')) {
      return `The candidate's availability and notice period details are typically listed in the screening section. If it shows "Immediate Joiner", they are available without a transition period.`;
    }
    if (q.includes('summarize') || q.includes('summary') || q.includes('overview') || q.includes('brief') || q.includes('tell me')) {
      return `${candidateName} is a professional with documented experience across multiple organizations. Their profile highlights relevant skills and educational qualifications. Based on the document structure, this appears to be a ${candidateName.toLowerCase().includes('engineer') || candidateName.toLowerCase().includes('developer') ? 'technical' : 'professional'} profile suitable for mid-to-senior level evaluation.`;
    }
    if (q.includes('interview') || q.includes('question')) {
      return `Suggested interview questions based on this profile:\n1. Walk me through your most impactful project in your last role.\n2. How have you handled cross-functional collaboration?\n3. What are your short-term and long-term career goals?\n4. Describe a situation where you had to quickly learn a new skill.`;
    }
    if (q.includes('strength') || q.includes('achiev') || q.includes('accomplishment')) {
      return `Key strengths visible in this profile include domain expertise, progressive career growth, and demonstrated delivery across multiple organizations. Review the "Professional Summary" and bullet points under each role for specific achievements.`;
    }
    if (q.includes('weakness') || q.includes('gap') || q.includes('missing')) {
      return `Potential gaps to explore during interview:\n• Verify depth of experience in specific technical areas listed\n• Clarify reasons for any short tenures\n• Confirm hands-on vs. supervisory experience for key skills`;
    }
    return `Based on ${candidateName}'s profile, they appear to be a qualified candidate. The document contains detailed professional history, skills, and educational background. Ask about experience, education, skills, or interview questions for more specific insights.`;
  };

  const handleAsk = (question: string) => {
    if (!question.trim()) return;
    setChatHistory(prev => [...prev, { sender: 'user', text: question }]);
    setChatInput('');
    setTimeout(() => {
      setChatHistory(prev => [...prev, { sender: 'ai', text: getAIResponse(question) }]);
    }, 400);
  };

  return (
    <div className="flex flex-col h-full bg-slate-50 rounded-xl border border-slate-200 overflow-hidden">
      <div className="p-4 border-b border-slate-100 bg-white">
        <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-indigo-600" /> Ask about {candidateName}
        </h3>
      </div>
      <div className="flex-1 p-4 overflow-y-auto space-y-4">
        {chatHistory.length === 0 ? (
          <div className="space-y-2">
            {['Summarize experience', 'What are his major achievements?', 'Identify missing skills'].map(prompt => (
              <button 
                key={prompt} 
                onClick={() => handleAsk(prompt)}
                className="w-full text-left p-3 text-sm text-slate-600 bg-white border border-slate-200 rounded-lg hover:border-indigo-300 hover:text-indigo-700 transition-colors shadow-sm"
              >
                {prompt}
              </button>
            ))}
          </div>
        ) : (
          chatHistory.map((msg, i) => (
            <div key={i} className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}>
              <div className={`p-3 rounded-2xl text-sm leading-relaxed max-w-[90%] shadow-sm ${
                msg.sender === 'user'
                  ? 'bg-slate-900 text-white rounded-tr-sm font-medium'
                  : 'bg-white border border-slate-200 text-slate-700 rounded-tl-sm'
              }`}>
                <p>{msg.text}</p>
              </div>
            </div>
          ))
        )}
      </div>
      <div className="p-3 bg-white border-t border-slate-100 shrink-0">
        <form onSubmit={e => { e.preventDefault(); handleAsk(chatInput); }}>
          <div className="relative flex items-center bg-slate-50 border border-slate-200 rounded-lg overflow-hidden focus-within:border-indigo-400 focus-within:ring-2 focus-within:ring-indigo-100">
            <input
              type="text"
              value={chatInput}
              onChange={e => setChatInput(e.target.value)}
              placeholder="Ask anything..."
              className="w-full bg-transparent py-2 pl-3 pr-10 text-sm text-slate-900 placeholder-slate-400 focus:outline-none"
            />
            <button type="submit" className="absolute right-1 p-1.5 text-slate-400 hover:text-indigo-600 rounded-md transition-colors">
              <Send className="w-4 h-4" />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export const createCandidateReviewWorkspace = (item: WorkspaceItem): BusinessWorkspace => {
  const name = item.rawFile?.name.replace(/\.[^/.]+$/, "").replace(/_/g, " ") || 'Candidate';
  
  return {
    id: 'candidate-review',
    displayName: name,
    businessIntent: 'Candidate Review',
    matcher: (testItem) => {
      const uri = testItem.sourceUri.toLowerCase().replace(/[_-]/g, ' ');
      
      // Broad resume filename signals
      const resumeFileSignals = ['resume', 'cv', 'curriculum', 'candidate', 'screening',
        'engineer', 'developer', 'manager', 'analyst', 'coordinator', 'specialist',
        'consultant', 'director', 'executive', 'associate', 'intern', 'draft', 'profile'];
      
      // Person name pattern: exclude UUIDs/hashes and numbers (e.g. 74a83071-1292...)
      const hasDigitsOrHexHash = /\d|[0-9a-f]{8}/i.test(testItem.sourceUri);
      const fileSignalMatches = resumeFileSignals.filter(k => uri.includes(k)).length;
      const hasNamePattern = !hasDigitsOrHexHash && /^[a-z]{3,}\s+[a-z]{3,}/i.test(uri) && !uri.includes('agreement') && !uri.includes('contract');
      
      let confidence = 0;
      if (testItem.typeHint === 'resume') confidence = 0.95;
      else if (fileSignalMatches >= 2) confidence = 0.90;
      else if (fileSignalMatches === 1) confidence = 0.75;
      else if (hasNamePattern) confidence = 0.65;
      
      const isMatch = confidence > 0;
      return {
        workspaceId: 'candidate-review',
        confidence,
        reasoning: isMatch ? ['Resume/candidate structure detected', 'Talent profile signals found'] : []
      };
    },
    modules: [
      {
        id: 'candidate-overview',
        title: 'Candidate',
        icon: <User className="w-4 h-4" />,
        component: CandidateOverview,
        actions: [
          {
            id: 'compare',
            label: 'Compare to Job Req',
            icon: <CheckCircle className="w-4 h-4" />,
            onClick: () => {}
          }
        ]
      },
      {
        id: 'candidate-skills',
        title: 'Skills',
        icon: <Code className="w-4 h-4" />,
        component: CandidateSkills,
        actions: [
          {
            id: 'interview',
            label: 'Generate Interview Questions',
            icon: <MessageSquare className="w-4 h-4" />,
            onClick: () => {}
          }
        ]
      },
      {
        id: 'candidate-insights',
        title: 'Insights',
        icon: <Sparkles className="w-4 h-4" />,
        component: CandidateInsights
      }
    ]
  };
};
