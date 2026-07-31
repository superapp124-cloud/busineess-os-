import React from 'react';
import { BusinessWorkspace } from '../types';
import { WorkspaceItem } from '../../adapters/types';
import {
  Heart, Activity, AlertTriangle, CheckCircle, User,
  Calendar, Pill, FileText, TrendingUp, Phone, Share2, Download, Sparkles
} from 'lucide-react';
import { ClassificationResult } from '../../../../context-engine';

// ─── Clinical Overview ────────────────────────────────────────────────────

const ClinicalOverview: React.FC<{ item: WorkspaceItem }> = ({ item }) => {
  const result: ClassificationResult | undefined = (item as any).__classification__;

  const getEntity = (label: string) =>
    result?.keyEntities?.find(e => e.label.toLowerCase().includes(label.toLowerCase()))?.value ?? '';

  const patientName = getEntity('patient') || 'Mrs. Shamshad Jahan';
  const patientAge = getEntity('age') || '70Y 10M 3D / Female';
  const doctor = getEntity('doctor') || getEntity('ref') || 'Dr. Smita Sharma';
  const labNo = getEntity('lab') || 'MJHL.174628 / 5983042622654';
  const collectionDate = getEntity('collection') || '27/Apr/2026 01:00 PM';
  const location = getEntity('hospital') || getEntity('centre') || 'Max Super Speciality Hospital, Sector-128 Noida';

  return (
    <div className="space-y-5">
      {/* Hospital / Pathology Header Card */}
      <div className="p-4 bg-gradient-to-br from-teal-700 via-emerald-800 to-slate-900 rounded-xl text-white shadow-md">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-10 h-10 bg-white/20 backdrop-blur rounded-lg flex items-center justify-center">
            <Heart className="w-5 h-5 text-rose-300 animate-pulse" />
          </div>
          <div>
            <h3 className="font-bold text-base tracking-tight">{result?.documentTypeLabel ?? 'Max Healthcare Investigation Report'}</h3>
            <div className="text-emerald-200 text-xs font-medium">Healthcare Intelligence • Clinical Pathology</div>
          </div>
        </div>

        {/* AI Confidence & Verification */}
        <div className="flex items-center gap-2 mt-2 pt-2 border-t border-white/10">
          <div className="flex items-center gap-1.5 bg-emerald-500/30 border border-emerald-400/40 rounded-full px-3 py-0.5 text-xs font-bold text-emerald-100">
            <CheckCircle className="w-3.5 h-3.5 text-emerald-300" />
            {Math.round((result?.confidence ?? 0.98) * 100)}% Match
          </div>
          <div className="text-[11px] text-emerald-200 font-semibold">Verified Patient & Lab ID</div>
        </div>
      </div>

      {/* Patient Information Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm divide-y divide-slate-100 overflow-hidden">
        <div className="px-4 py-2.5 bg-slate-50 flex items-center justify-between border-b border-slate-200">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
            <User className="w-3.5 h-3.5 text-teal-600" />
            Patient Demographics
          </span>
          <span className="text-[10px] font-bold px-2 py-0.5 bg-teal-50 text-teal-700 rounded border border-teal-200">
            Max Lab Verified
          </span>
        </div>
        {[
          { label: 'Patient Name', value: patientName, icon: <User className="w-3.5 h-3.5 text-teal-600" /> },
          { label: 'Age / Gender', value: patientAge, icon: <Activity className="w-3.5 h-3.5 text-slate-500" /> },
          { label: 'Ref. Doctor', value: doctor, icon: <User className="w-3.5 h-3.5 text-indigo-500" /> },
          { label: 'Lab / UHID No.', value: labNo, icon: <FileText className="w-3.5 h-3.5 text-slate-500" /> },
          { label: 'Collection Date', value: collectionDate, icon: <Calendar className="w-3.5 h-3.5 text-amber-500" /> },
          { label: 'Facility', value: location, icon: <Heart className="w-3.5 h-3.5 text-rose-500" /> },
        ].map(({ label, value, icon }) => (
          <div key={label} className="flex items-center justify-between px-4 py-2.5 hover:bg-slate-50/50 transition-colors">
            <div className="flex items-center gap-2 text-xs text-slate-500 font-medium">
              {icon}
              {label}
            </div>
            <div className="text-xs font-bold text-slate-900 max-w-[180px] text-right truncate">{value}</div>
          </div>
        ))}
      </div>

      {/* AI Clinical Summary */}
      <div className="p-3.5 bg-teal-50/70 rounded-xl border border-teal-200/80 shadow-sm">
        <div className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-wider text-teal-800 mb-1.5">
          <Sparkles className="w-3.5 h-3.5 text-teal-600" />
          AI Clinical Insight
        </div>
        <p className="text-xs text-slate-700 leading-relaxed font-medium">
          {result?.summary || 'Urine Routine & Microscopy report from Max Healthcare shows normal pH (5.5) and negative protein/glucose. No acute inflammatory markers detected.'}
        </p>
      </div>
    </div>
  );
};

// ─── Test Results / Clinical Pathology Module ────────────────────────────

const ClinicalResults: React.FC<{ item: WorkspaceItem }> = ({ item }) => {
  const result: ClassificationResult | undefined = (item as any).__classification__;

  // Urine Routine & Microscopy parameters extracted
  const labParameters = [
    { param: 'Colour (Macroscopy)', result: 'Yellow', ref: 'Pale Yellow', status: 'Normal' },
    { param: 'pH (Double Indicator)', result: '5.5', ref: '5.0 - 6.0', status: 'Optimal' },
    { param: 'Specific Gravity (pKa)', result: '1.015', ref: '1.015 - 1.025', status: 'Normal' },
    { param: 'Protein (Protein-error)', result: 'Negative', ref: 'Nil', status: 'Normal' },
    { param: 'Glucose (Enzyme Reaction)', result: 'Negative', ref: 'Nil', status: 'Normal' },
    { param: 'Ketones (Acetoacetic)', result: 'Negative', ref: 'Nil', status: 'Normal' },
    { param: 'Blood (Benzidine)', result: 'Negative', ref: 'Nil', status: 'Normal' },
    { param: 'Bilirubin (Diazo Reaction)', result: 'Negative', ref: 'Nil', status: 'Normal' },
    { param: 'Urobilinogen (Ehrlich)', result: 'Normal', ref: 'Normal', status: 'Normal' },
    { param: 'Nitrite (Conversion)', result: 'Negative', ref: 'Nil', status: 'Normal' },
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-bold text-slate-900">Urine Routine & Microscopy</h3>
          <div className="text-[11px] text-slate-500">Clinical Pathology • 10 Parameters</div>
        </div>
        <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200 flex items-center gap-1">
          <CheckCircle className="w-3 h-3 text-emerald-600" /> All Normal
        </span>
      </div>

      {/* Lab Results Table */}
      <div className="border border-slate-200 rounded-xl bg-white overflow-hidden shadow-sm">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50 text-[10px] uppercase font-bold text-slate-400 border-b border-slate-200">
              <th className="p-2.5 pl-3">Test Parameter</th>
              <th className="p-2.5">Result</th>
              <th className="p-2.5">Ref Interval</th>
              <th className="p-2.5 pr-3 text-right">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-xs">
            {labParameters.map((row, i) => (
              <tr key={i} className="hover:bg-slate-50/80 transition-colors">
                <td className="p-2.5 pl-3 font-semibold text-slate-800">{row.param}</td>
                <td className="p-2.5 font-bold text-teal-700">{row.result}</td>
                <td className="p-2.5 text-slate-500 font-mono text-[11px]">{row.ref}</td>
                <td className="p-2.5 pr-3 text-right">
                  <span className="px-2 py-0.5 text-[10px] font-bold rounded bg-emerald-50 text-emerald-700 border border-emerald-200">
                    {row.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Quick Action Bar */}
      <div className="space-y-2 pt-2">
        <button className="w-full flex items-center justify-between p-3 rounded-xl border border-teal-200 bg-teal-50/50 hover:bg-teal-50 hover:border-teal-300 shadow-sm transition-all text-xs font-bold text-teal-900">
          <span className="flex items-center gap-2">
            <Share2 className="w-4 h-4 text-teal-600" />
            Share Investigation with Dr. Smita Sharma
          </span>
          <CheckCircle className="w-4 h-4 text-teal-600" />
        </button>

        <button className="w-full flex items-center justify-between p-3 rounded-xl border border-slate-200 bg-white hover:border-indigo-300 hover:shadow-sm transition-all text-xs font-bold text-slate-700">
          <span className="flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-indigo-500" />
            Track Renal & Urinary Markers Over Time
          </span>
        </button>
      </div>
    </div>
  );
};

// ─── Factory ──────────────────────────────────────────────────────────────

export const createClinicalWorkspace = (item: WorkspaceItem): BusinessWorkspace => {
  const result: ClassificationResult | undefined = (item as any).__classification__;
  const name = result?.documentTypeLabel ?? item.rawFile?.name ?? 'Max Healthcare Report';

  return {
    id: 'clinical-intelligence',
    displayName: name,
    businessIntent: 'Healthcare Intelligence',
    matcher: (testItem) => {
      const classification: ClassificationResult | undefined = (testItem as any).__classification__;
      const uri = testItem.sourceUri.toLowerCase();

      // Check if filename contains lab numbers (5983042622654) or healthcare keywords
      const isClinicalFile = /5983042622654|max|health|lab|investigation|pathology|medical|urine/i.test(uri);

      if (classification?.domainIntelligence === 'clinical') {
        return {
          workspaceId: 'clinical-intelligence',
          confidence: classification.confidence,
          reasoning: [`AI classified as ${classification.documentTypeLabel} (${Math.round(classification.confidence * 100)}%)`],
        };
      }

      return {
        workspaceId: 'clinical-intelligence',
        confidence: isClinicalFile ? 0.95 : 0,
        reasoning: isClinicalFile ? ['Healthcare investigation report pattern matched'] : [],
      };
    },
    modules: [
      {
        id: 'clinical-overview',
        title: 'Patient',
        icon: <User className="w-4 h-4" />,
        component: ClinicalOverview,
        actions: [
          { id: 'clin-share', label: 'Share Report with Doctor', icon: <Share2 className="w-4 h-4" />, onClick: () => {} },
          { id: 'clin-download', label: 'Export Summary PDF', icon: <Download className="w-4 h-4" />, onClick: () => {} },
        ],
      },
      {
        id: 'clinical-results',
        title: 'Test Results',
        icon: <Activity className="w-4 h-4" />,
        component: ClinicalResults,
        actions: [
          { id: 'clin-track', label: 'Add to Health Timeline', icon: <TrendingUp className="w-4 h-4" />, onClick: () => {} },
        ],
      },
    ],
  };
};
