import React, { useState } from 'react';
import { TrendingUp, Sparkles, Share2, Users, FileText, Globe, Send, CheckCircle } from 'lucide-react';

export const GrowthOSDashboard: React.FC = () => {
  const [topic, setTopic] = useState('Senior Backend Java Architect Hiring');
  const [contentType, setContentType] = useState<'linkedin' | 'job_post' | 'seo_keywords'>('linkedin');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedOutput, setGeneratedOutput] = useState<string | null>(null);

  const handleGenerate = () => {
    setIsGenerating(true);
    setTimeout(() => {
      setGeneratedOutput(
        `🚀 We are hiring a ${topic}!\n\nJoin our high-performance team in Bangalore. Excellent compensation, cutting-edge AI stack, and hybrid flexibility.\n\n👉 Apply directly via CHATR OS or DM for referral.\n#Hiring #Tech #CareerGrowth #CHATR`
      );
      setIsGenerating(false);
    }, 600);
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-6">
        <div>
          <div className="flex items-center space-x-2 text-emerald-600 dark:text-emerald-400 text-xs font-semibold uppercase tracking-wider">
            <TrendingUp className="w-4 h-4" />
            <span>Growth OS Suite</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white mt-1">
            Growth & Marketing Automation Platform
          </h1>
        </div>
        <div className="flex items-center space-x-3">
          <span className="px-3 py-1 bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 text-xs font-semibold rounded-full">
            342 New Leads Captured
          </span>
        </div>
      </div>

      {/* Grid Layout: Lead Capture Stats & AI Content Engine */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Analytics Cards */}
        <div className="bg-white dark:bg-slate-900 p-5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm flex items-center space-x-4">
          <div className="p-3 bg-emerald-50 dark:bg-emerald-950 text-emerald-600 rounded-lg">
            <Globe className="w-6 h-6" />
          </div>
          <div>
            <div className="text-2xl font-bold text-slate-900 dark:text-white">12,450</div>
            <div className="text-xs text-slate-500">Monthly Landing Page Traffic</div>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 p-5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm flex items-center space-x-4">
          <div className="p-3 bg-blue-50 dark:bg-blue-950 text-blue-600 rounded-lg">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <div className="text-2xl font-bold text-slate-900 dark:text-white">342</div>
            <div className="text-xs text-slate-500">Form & Resume Lead Captures</div>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 p-5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm flex items-center space-x-4">
          <div className="p-3 bg-purple-50 dark:bg-purple-950 text-purple-600 rounded-lg">
            <Share2 className="w-6 h-6" />
          </div>
          <div>
            <div className="text-2xl font-bold text-slate-900 dark:text-white">88</div>
            <div className="text-xs text-slate-500">Active Referral Conversions</div>
          </div>
        </div>
      </div>

      {/* AI Campaign & Content Engine Card */}
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Sparkles className="w-5 h-5 text-indigo-500" />
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">
              AI Growth Content Engine
            </h2>
          </div>
          <span className="text-xs text-slate-400">Growth Optimization</span>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              Campaign Topic / Role Focus
            </label>
            <input
              type="text"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div className="flex items-center space-x-3">
            <button
              onClick={() => setContentType('linkedin')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
                contentType === 'linkedin'
                  ? 'bg-indigo-600 text-white'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
              }`}
            >
              LinkedIn Campaign
            </button>
            <button
              onClick={() => setContentType('job_post')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
                contentType === 'job_post'
                  ? 'bg-indigo-600 text-white'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
              }`}
            >
              Job Posting Draft
            </button>
          </div>

          <button
            onClick={handleGenerate}
            disabled={isGenerating}
            className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-lg text-sm transition-colors flex items-center justify-center space-x-2"
          >
            <Sparkles className="w-4 h-4" />
            <span>{isGenerating ? 'Generating Campaign Content...' : 'Generate Marketing Post'}</span>
          </button>
        </div>

        {generatedOutput && (
          <div className="p-4 bg-slate-50 dark:bg-slate-950 rounded-xl border border-slate-200 dark:border-slate-800 space-y-3">
            <div className="flex items-center justify-between text-xs font-semibold text-emerald-600 dark:text-emerald-400">
              <span className="flex items-center">
                <CheckCircle className="w-4 h-4 mr-1" /> Campaign Content Ready
              </span>
              <span>Growth Telemetry Active</span>
            </div>
            <pre className="text-xs text-slate-800 dark:text-slate-200 whitespace-pre-wrap font-sans">
              {generatedOutput}
            </pre>
          </div>
        )}
      </div>
    </div>
  );
};
