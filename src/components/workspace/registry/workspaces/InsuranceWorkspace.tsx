import React from 'react';
import { BusinessWorkspace } from '../types';
import { WorkspaceItem } from '../../adapters/types';
import {
  Shield, Car, AlertTriangle, Calendar, Phone, FileText,
  RefreshCw, TrendingUp, CheckCircle, Clock
} from 'lucide-react';
import { ClassificationResult } from '../../../../context-engine';

// ─── Insurance Overview Module ────────────────────────────────────────────

const InsuranceOverview: React.FC<{ item: WorkspaceItem }> = ({ item }) => {
  const result: ClassificationResult | undefined = (item as any).__classification__;

  // Extract key entities from AI classification
  const getEntity = (label: string) =>
    result?.keyEntities?.find(e => e.label.toLowerCase().includes(label.toLowerCase()))?.value ?? '—';

  const vehicle = getEntity('vehicle') || getEntity('make') || getEntity('car') || '—';
  const policyHolder = getEntity('policy holder') || getEntity('insured') || getEntity('name') || '—';
  const policyNo = getEntity('policy') || getEntity('policy no') || getEntity('policy number') || '—';
  const premium = getEntity('premium') || getEntity('total premium') || '—';
  const expiry = getEntity('expiry') || getEntity('policy period') || getEntity('to date') || '—';
  const coverage = getEntity('coverage') || getEntity('idv') || getEntity('sum insured') || '—';
  const regNo = getEntity('registration') || getEntity('reg no') || getEntity('rto') || '—';

  return (
    <div className="space-y-5">
      {/* Header card */}
      <div className="p-4 bg-gradient-to-br from-blue-600 to-blue-800 rounded-xl text-white">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
            <Shield className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-base">{result?.documentTypeLabel ?? 'Insurance Policy'}</h3>
            <div className="text-blue-200 text-xs">{result?.domainLabel ?? 'Insurance Intelligence'}</div>
          </div>
        </div>

        {/* Confidence badge */}
        <div className="flex items-center gap-2 mt-2">
          <div className="flex items-center gap-1.5 bg-white/20 rounded-full px-2.5 py-1 text-xs font-bold">
            <CheckCircle className="w-3 h-3" />
            {Math.round((result?.confidence ?? 0.9) * 100)}% Confidence
          </div>
          <div className="text-[10px] text-blue-200 font-medium">AI Classified</div>
        </div>
      </div>

      {/* Policy Details */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm divide-y divide-slate-100">
        {[
          { label: 'Policy Holder', value: policyHolder, icon: <Shield className="w-3.5 h-3.5 text-blue-500" /> },
          { label: 'Vehicle', value: vehicle, icon: <Car className="w-3.5 h-3.5 text-slate-500" /> },
          { label: 'Reg. Number', value: regNo, icon: <FileText className="w-3.5 h-3.5 text-slate-500" /> },
          { label: 'Policy No', value: policyNo, icon: <FileText className="w-3.5 h-3.5 text-slate-500" /> },
          { label: 'IDV / Coverage', value: coverage, icon: <TrendingUp className="w-3.5 h-3.5 text-emerald-500" /> },
          { label: 'Premium', value: premium, icon: <TrendingUp className="w-3.5 h-3.5 text-indigo-500" /> },
          { label: 'Policy Expiry', value: expiry, icon: <Clock className="w-3.5 h-3.5 text-amber-500" /> },
        ].map(({ label, value, icon }) => (
          <div key={label} className="flex items-center justify-between px-4 py-2.5">
            <div className="flex items-center gap-2 text-xs text-slate-500 font-medium">
              {icon}
              {label}
            </div>
            <div className="text-sm font-bold text-slate-900 max-w-[160px] text-right truncate">{value}</div>
          </div>
        ))}
      </div>

      {/* AI Summary */}
      {result?.summary && (
        <div className="p-3 bg-blue-50 rounded-lg border border-blue-100">
          <div className="text-[10px] font-bold uppercase tracking-wider text-blue-600 mb-1.5">AI Summary</div>
          <p className="text-xs text-slate-700 leading-relaxed">{result.summary}</p>
        </div>
      )}
    </div>
  );
};

// ─── Claims / Risk Module ─────────────────────────────────────────────────

const InsuranceClaims: React.FC<{ item: WorkspaceItem }> = ({ item }) => {
  const result: ClassificationResult | undefined = (item as any).__classification__;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-bold text-slate-900">Claims & Renewals</h3>
        <span className="text-xs font-bold text-blue-600 bg-blue-50 px-2 py-1 rounded border border-blue-100">
          Active Policy
        </span>
      </div>

      <div className="p-3 bg-amber-50 rounded-lg border border-amber-200">
        <div className="flex items-start gap-2">
          <AlertTriangle className="w-4 h-4 text-amber-600 mt-0.5 shrink-0" />
          <div>
            <div className="text-sm font-bold text-slate-900">Renewal Action Required</div>
            <div className="text-xs text-slate-600 mt-1">
              Review policy expiry and set renewal reminder 30 days before due date.
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-2">
        {['File a Claim Online', 'Contact Roadside Assistance', 'Check NCB Status', 'Download Policy Document'].map(action => (
          <button key={action} className="w-full flex items-center justify-between p-3 rounded-lg border border-slate-200 bg-white hover:border-blue-300 hover:shadow-sm transition-all text-sm text-slate-700 font-medium">
            {action}
            <Car className="w-4 h-4 text-slate-400" />
          </button>
        ))}
      </div>

      {/* All AI-extracted entities */}
      {result?.keyEntities && result.keyEntities.length > 0 && (
        <div className="mt-4">
          <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-2">All Extracted Fields</div>
          <div className="space-y-1">
            {result.keyEntities.map((e, i) => (
              <div key={i} className="flex justify-between items-center py-1.5 px-2 rounded-lg odd:bg-slate-50 text-xs">
                <span className="text-slate-500 font-medium">{e.label}</span>
                <span className="text-slate-900 font-bold max-w-[150px] text-right truncate">{e.value}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

// ─── Factory ──────────────────────────────────────────────────────────────

export const createInsuranceWorkspace = (item: WorkspaceItem): BusinessWorkspace => {
  const result: ClassificationResult | undefined = (item as any).__classification__;
  const name = result?.documentTypeLabel ?? item.rawFile?.name ?? 'Insurance Policy';

  return {
    id: 'insurance-intelligence',
    displayName: name,
    businessIntent: 'Insurance Intelligence',
    matcher: (testItem) => {
      const classification: ClassificationResult | undefined = (testItem as any).__classification__;
      if (!classification) return { workspaceId: 'insurance-intelligence', confidence: 0, reasoning: [] };
      const isInsurance = classification.domainIntelligence === 'insurance';
      return {
        workspaceId: 'insurance-intelligence',
        confidence: isInsurance ? classification.confidence : 0,
        reasoning: isInsurance ? [`AI classified as ${classification.documentTypeLabel} (${Math.round(classification.confidence * 100)}%)`] : [],
      };
    },
    modules: [
      {
        id: 'insurance-overview',
        title: 'Policy',
        icon: <Shield className="w-4 h-4" />,
        component: InsuranceOverview,
        actions: [
          { id: 'ins-renew', label: 'Set Renewal Reminder', icon: <Calendar className="w-4 h-4" />, onClick: () => {} },
          { id: 'ins-claim', label: 'File a Claim', icon: <RefreshCw className="w-4 h-4" />, onClick: () => {} },
        ],
      },
      {
        id: 'insurance-claims',
        title: 'Claims',
        icon: <AlertTriangle className="w-4 h-4" />,
        component: InsuranceClaims,
        actions: [
          { id: 'ins-contact', label: 'Contact Insurer', icon: <Phone className="w-4 h-4" />, onClick: () => {} },
        ],
      },
    ],
  };
};
