import React, { useState } from 'react';
import { Brain, Sparkles, Search, Shield, ArrowRight, BookOpen, CheckCircle } from 'lucide-react';

export const ExecutiveAICopilotDashboard: React.FC = () => {
  const [query, setQuery] = useState('Which clients are slowing down hiring in Bangalore?');
  const [isCopilotThinking, setIsCopilotThinking] = useState(false);
  const [copilotResponse, setCopilotResponse] = useState<string | null>(null);

  const handleAskCopilot = () => {
    setIsCopilotThinking(true);
    setTimeout(() => {
      setCopilotResponse(
        `Based on cross-product analytics across Recruitment OS, Revenue OS, and Knowledge OS:\n\n1. TechCorp Global has reduced open positions from 12 to 3 this month due to internal budget reallocations.\n2. Acme Financial Systems remains strong with 98% SLA compliance and 6 active Java searches.\n\nRecommended Executive Action: Reallocate 2 senior recruiters from TechCorp account to Acme Financial to accelerate high-margin placements.`
      );
      setIsCopilotThinking(false);
    }, 600);
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-6">
        <div>
          <div className="flex items-center space-x-2 text-indigo-600 dark:text-indigo-400 text-xs font-semibold uppercase tracking-wider">
            <Brain className="w-4 h-4" />
            <span>Executive AI & Knowledge OS Suite</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white mt-1">
            Executive AI Copilot & Company Intelligence Graph
          </h1>
        </div>
        <div className="flex items-center space-x-3">
          <span className="px-3 py-1 bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 text-xs font-semibold rounded-full">
            100k Documents Indexed
          </span>
        </div>
      </div>

      {/* Copilot Interface */}
      <div className="bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 rounded-2xl p-8 text-white shadow-xl border border-slate-800 space-y-6">
        <div className="flex items-center space-x-3">
          <div className="p-2.5 bg-indigo-500/20 border border-indigo-400/30 rounded-xl text-indigo-300">
            <Sparkles className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold">Ask Executive AI Copilot</h2>
            <p className="text-xs text-slate-300">
              Grounded in real-time enterprise data across Resumes, CRM Deals, Invoices, SOPs, and Communications.
            </p>
          </div>
        </div>

        <div className="space-y-4">
          <div className="relative">
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Ask any strategic question..."
              className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-400 text-sm"
            />
            <button
              onClick={handleAskCopilot}
              disabled={isCopilotThinking}
              className="absolute right-2 top-2 px-4 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-xs rounded-lg transition-colors flex items-center space-x-1.5"
            >
              <span>{isCopilotThinking ? 'Analyzing...' : 'Ask Copilot'}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="flex flex-wrap gap-2 text-xs text-slate-300">
            <span className="font-semibold text-slate-400">Suggested Questions:</span>
            <button onClick={() => setQuery("Which recruiters have the highest placement ratio?")} className="hover:underline text-indigo-300">
              Recruiter Ratios
            </button>
            <span>•</span>
            <button onClick={() => setQuery("What invoices are overdue?")} className="hover:underline text-indigo-300">
              Overdue Invoices
            </button>
            <span>•</span>
            <button onClick={() => setQuery("Which opportunities close this month?")} className="hover:underline text-indigo-300">
              Closing Opportunities
            </button>
          </div>
        </div>

        {copilotResponse && (
          <div className="p-5 bg-white/10 backdrop-blur-md rounded-xl border border-white/10 space-y-3">
            <div className="flex items-center justify-between text-xs font-semibold text-emerald-400">
              <span className="flex items-center">
                <CheckCircle className="w-4 h-4 mr-1" /> Grounded Executive Answer
              </span>
              <span>Verified Executive Response</span>
            </div>
            <pre className="text-xs text-slate-200 whitespace-pre-wrap font-sans leading-relaxed">
              {copilotResponse}
            </pre>
          </div>
        )}
      </div>
    </div>
  );
};
