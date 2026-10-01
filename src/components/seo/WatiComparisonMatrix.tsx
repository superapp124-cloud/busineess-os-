import React from 'react';
import { Check, X, HelpCircle, ArrowRight, ShieldCheck } from 'lucide-react';

interface ComparisonRow {
  capability: string;
  category: string;
  chatr: {
    supported: boolean;
    detail: string;
  };
  wati: {
    supported: boolean;
    detail: string;
  };
}

const COMPARISON_DATA: ComparisonRow[] = [
  {
    category: 'Commercial & Pricing',
    capability: 'Base Monthly Pricing',
    chatr: {
      supported: true,
      detail: 'From ₹999/month (SME Starter plan) with transparent billing'
    },
    wati: {
      supported: true,
      detail: 'Starts at ~$49/month (Growth Plan) billed annually or ~$59/month monthly'
    }
  },
  {
    category: 'Commercial & Pricing',
    capability: 'Per-User / Seat Penalties',
    chatr: {
      supported: true,
      detail: 'Team access included without steep per-seat penalty fees'
    },
    wati: {
      supported: false,
      detail: 'Charges ~$15-$25/month for each additional user beyond included limit'
    }
  },
  {
    category: 'Messaging & Team Inbox',
    capability: 'Official Meta Cloud API',
    chatr: {
      supported: true,
      detail: 'Native direct Meta Cloud API integration with green checkmark support'
    },
    wati: {
      supported: true,
      detail: 'Official WhatsApp Business Solution Provider (BSP) integration'
    }
  },
  {
    category: 'Messaging & Team Inbox',
    capability: 'Multi-Agent Shared Inbox',
    chatr: {
      supported: true,
      detail: 'Central team dashboard with conversation assignment and collision protection'
    },
    wati: {
      supported: true,
      detail: 'Shared team inbox with agent assignment and team tags'
    }
  },
  {
    category: 'Calling & Telephony',
    capability: 'Browser WebRTC Voice/Video Calling',
    chatr: {
      supported: true,
      detail: 'Built-in 1-tap browser HD audio/video calling (/call) without app installs'
    },
    wati: {
      supported: false,
      detail: 'Not natively supported; messaging-only platform'
    }
  },
  {
    category: 'Calling & Telephony',
    capability: 'Native Android Carrier-Grade Calling',
    chatr: {
      supported: true,
      detail: 'Full Android InCallService integration with lock-screen caller identification'
    },
    wati: {
      supported: false,
      detail: 'Not available (strictly web/mobile messaging app)'
    }
  },
  {
    category: 'Intelligence & Automation',
    capability: 'Autonomous SI / AI Triage',
    chatr: {
      supported: true,
      detail: 'CHATR SI layer automatically classifies incoming intent, routes to team, and assists drafts'
    },
    wati: {
      supported: true,
      detail: 'Rule-based chatbot flow builder and basic AI response triggers'
    }
  },
  {
    category: 'Migration',
    capability: 'Number Porting & Migration',
    chatr: {
      supported: true,
      detail: 'Retain your existing verified WhatsApp Business API number without downtime'
    },
    wati: {
      supported: true,
      detail: 'Supports standard Meta Business Manager number migration'
    }
  }
];

export const WatiComparisonMatrix: React.FC = () => {
  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
      <div className="p-6 bg-slate-950 border-b border-slate-800">
        <h2 className="text-xl font-bold text-white">Factual Capability & Pricing Comparison</h2>
        <p className="text-xs md:text-sm text-slate-400 mt-1">
          Verified against publicly available documentation and pricing schedules (Last reviewed: October 2026).
        </p>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs md:text-sm">
          <thead>
            <tr className="border-b border-slate-800 bg-slate-950/60 text-slate-300">
              <th className="py-4 px-6 font-semibold w-1/3">Capability / Dimension</th>
              <th className="py-4 px-6 font-semibold w-1/3 bg-indigo-950/40 text-indigo-300 border-x border-slate-800">
                <span className="flex items-center gap-1.5 font-bold">
                  CHATR Communication OS
                </span>
              </th>
              <th className="py-4 px-6 font-semibold w-1/3 text-slate-300">
                WATI
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60">
            {COMPARISON_DATA.map((row, idx) => (
              <tr key={idx} className="hover:bg-slate-800/30 transition-colors">
                <td className="py-4 px-6 font-medium text-slate-200">
                  <div className="font-semibold text-white">{row.capability}</div>
                  <div className="text-[11px] text-slate-400 font-mono mt-0.5">{row.category}</div>
                </td>
                <td className="py-4 px-6 bg-indigo-950/20 border-x border-slate-800">
                  <div className="flex items-start gap-2">
                    <Check className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                    <span className="text-slate-200 text-xs md:text-sm">{row.chatr.detail}</span>
                  </div>
                </td>
                <td className="py-4 px-6">
                  <div className="flex items-start gap-2">
                    {row.wati.supported ? (
                      <Check className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                    ) : (
                      <X className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                    )}
                    <span className="text-slate-300 text-xs md:text-sm">{row.wati.detail}</span>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="p-6 bg-slate-950 border-t border-slate-800 flex items-center justify-between flex-wrap gap-4">
        <div className="text-xs text-slate-400 flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
          <span>Both platforms operate official Meta Business Cloud API endpoints.</span>
        </div>
        <a
          href="/pricing"
          className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs md:text-sm font-semibold flex items-center gap-2 transition-colors"
        >
          <span>Explore CHATR Pricing Plans</span>
          <ArrowRight className="w-4 h-4" />
        </a>
      </div>
    </div>
  );
};
