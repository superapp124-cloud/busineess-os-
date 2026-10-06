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
    capability: 'Native Web & Mobile Calling',
    chatr: {
      supported: true,
      detail: 'Zero per-minute dialer surcharge for internal and customer browser calls'
    },
    wati: {
      supported: false,
      detail: 'Third-party telephony integration required at additional subscription fee'
    }
  },
  {
    category: 'AI & Automation',
    capability: 'Sub-Minute Speed to Lead SLA',
    chatr: {
      supported: true,
      detail: 'Automated intent triage & escalation if assigned rep does not answer in < 5 mins'
    },
    wati: {
      supported: true,
      detail: 'Custom chatbot builder rules and auto-replies'
    }
  },
  {
    category: 'Platform Architecture',
    capability: 'Unified Communication OS',
    chatr: {
      supported: true,
      detail: 'Chat, browser calling, candidate screening, CRM & notes in one platform'
    },
    wati: {
      supported: false,
      detail: 'Specialized exclusively on WhatsApp messaging'
    }
  }
];

export const WatiComparisonMatrix: React.FC = () => {
  return (
    <div className="bg-white border border-[#DDE3DF] rounded-2xl overflow-hidden shadow-sm">
      <div className="p-6 sm:p-8 bg-[#FAFBF9] border-b border-[#DDE3DF]">
        <h2 className="text-xl sm:text-2xl font-bold text-[#111817]">Factual Capability &amp; Pricing Comparison</h2>
        <p className="text-xs sm:text-sm text-[#53605C] mt-1">
          Verified against publicly available documentation and pricing schedules (Updated 2026).
        </p>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs sm:text-sm">
          <thead>
            <tr className="border-b border-[#DDE3DF] bg-[#FAFBF9] text-[#53605C]">
              <th className="py-4 px-6 font-semibold w-1/3">Capability / Dimension</th>
              <th className="py-4 px-6 font-semibold w-1/3 bg-[#EAEFEA] text-[#164E3F] border-x border-[#DDE3DF]">
                <span className="flex items-center gap-1.5 font-bold">
                  CHATR Communication OS
                </span>
              </th>
              <th className="py-4 px-6 font-semibold w-1/3 text-[#53605C]">
                WATI
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#DDE3DF]">
            {COMPARISON_DATA.map((row, idx) => (
              <tr key={idx} className="hover:bg-[#FAFBF9] transition-colors">
                <td className="py-4 px-6 font-medium text-[#111817]">
                  <div className="font-semibold text-[#111817]">{row.capability}</div>
                  <div className="text-[11px] text-[#53605C] font-mono mt-0.5">{row.category}</div>
                </td>
                <td className="py-4 px-6 bg-[#FAFBF9]/80 border-x border-[#DDE3DF]">
                  <div className="flex items-start gap-2">
                    <Check className="w-4 h-4 text-[#164E3F] shrink-0 mt-0.5" />
                    <span className="text-[#111817] text-xs sm:text-sm">{row.chatr.detail}</span>
                  </div>
                </td>
                <td className="py-4 px-6">
                  <div className="flex items-start gap-2">
                    {row.wati.supported ? (
                      <Check className="w-4 h-4 text-[#83918C] shrink-0 mt-0.5" />
                    ) : (
                      <X className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
                    )}
                    <span className="text-[#53605C] text-xs sm:text-sm">{row.wati.detail}</span>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="p-6 bg-[#FAFBF9] border-t border-[#DDE3DF] flex items-center justify-between flex-wrap gap-4">
        <div className="text-xs text-[#53605C] flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-[#164E3F]" />
          <span>Both platforms operate official Meta Business Cloud API endpoints.</span>
        </div>
        <a
          href="/pricing"
          className="px-5 py-2.5 bg-[#164E3F] hover:bg-[#123F33] text-white rounded-full text-xs sm:text-sm font-semibold flex items-center gap-2 transition-all shadow-sm"
        >
          <span>Explore CHATR Pricing Plans</span>
          <ArrowRight className="w-4 h-4" />
        </a>
      </div>
    </div>
  );
};
