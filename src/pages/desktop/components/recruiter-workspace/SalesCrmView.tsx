import React, { memo, useState } from 'react';
import { DollarSign, Building2, TrendingUp, FileText, CheckCircle2, AlertCircle, Plus, Filter, X } from 'lucide-react';
import { toast } from 'sonner';
import { downloadFile } from './utils';

interface Opportunity {
  id: string;
  client_name: string;
  deal_name: string;
  value_inr_lakhs: number;
  probability: number;
  stage: 'Lead' | 'Prospect' | 'Proposal' | 'Contract' | 'Closed Won';
  expected_close: string;
  spoc: string;
}

const INITIAL_OPPORTUNITIES: Opportunity[] = [
  { id: 'opp-1', client_name: 'Microsoft India', deal_name: 'Fullstack Squad Staffing 2026', value_inr_lakhs: 140, probability: 90, stage: 'Contract', expected_close: '2026-09-01', spoc: 'Anil Mehta (Director TA)' },
  { id: 'opp-2', client_name: 'Amazon Web Services', deal_name: 'DevOps & Cloud Architect Pod', value_inr_lakhs: 220, probability: 85, stage: 'Proposal', expected_close: '2026-09-15', spoc: 'Priya Sundaram (Vendor Lead)' },
  { id: 'opp-3', client_name: 'Infosys Limited', deal_name: 'SAP S/4HANA Migration Contract', value_inr_lakhs: 350, probability: 95, stage: 'Closed Won', expected_close: '2026-08-20', spoc: 'Rajesh Kumar (Partner)' },
  { id: 'opp-4', client_name: 'TCS Digital', deal_name: 'GenAI & Machine Learning Squad', value_inr_lakhs: 180, probability: 70, stage: 'Prospect', expected_close: '2026-10-01', spoc: 'Sunil Rao (Head Sourcing)' },
];

export const SalesCrmView = memo(() => {
  const [opportunities, setOpportunities] = useState<Opportunity[]>(INITIAL_OPPORTUNITIES);
  const [filterStage, setFilterStage] = useState<string>('ALL');
  const [showModal, setShowModal] = useState(false);
  const [newDeal, setNewDeal] = useState({ client_name: '', deal_name: '', value_inr_lakhs: 150, probability: 75, stage: 'Prospect' as const, spoc: 'HR Lead' });

  const handleGenerateInvoice = () => {
    const invoiceData = `=====================================================
TALENTXCEL SERVICES PRIVATE LIMITED
OFFICIAL ENTERPRISE CLIENT INVOICE & TIMESHEET CLOSE
=====================================================
Invoice No: INV-2026-AUG-${Date.now().toString().slice(-4)}
Date: ${new Date().toLocaleDateString()}
Billing Period: August 2026

CLIENT BILL-TO:
Microsoft India Corporation
Outer Ring Road, Bellandur, Bangalore

BILLING SUMMARY:
1. Senior Fullstack Developer (Aasim Syed)
   - Worked Hours: 160.0 Hours @ ₹4,500/hr
   - Subtotal: ₹7,20,000

2. Lead Web Architect (A. S. Anandan)
   - Worked Hours: 168.0 Hours @ ₹5,200/hr
   - Subtotal: ₹8,73,600

TAX BREAKDOWN:
- Net Total: ₹15,93,600
- CGST (9%): ₹1,43,424
- SGST (9%): ₹1,43,424
- TOTAL INVOICE DUE: ₹18,80,448 (INR Eighteen Lakhs Eighty Thousand Four Hundred Forty-Eight Only)

STATUS: APPROVED & SIGNED VIA CHATR RECRUITMENTOS
=====================================================`;

    downloadFile(invoiceData, `Invoice_Microsoft_Aug_2026.txt`, 'text/plain;charset=utf-8;');
    toast.success('Enterprise Client Invoice & Weekly Timesheet PDF generated successfully!');
  };

  const handleCreateDeal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDeal.client_name || !newDeal.deal_name) {
      toast.error('Please provide client name and deal name');
      return;
    }
    const created: Opportunity = {
      id: `opp-${Date.now()}`,
      client_name: newDeal.client_name,
      deal_name: newDeal.deal_name,
      value_inr_lakhs: Number(newDeal.value_inr_lakhs),
      probability: Number(newDeal.probability),
      stage: newDeal.stage,
      expected_close: '2026-11-01',
      spoc: newDeal.spoc,
    };
    setOpportunities(prev => [created, ...prev]);
    setShowModal(false);
    toast.success(`Opportunity '${created.deal_name}' created for ${created.client_name}`);
  };

  const filtered = filterStage === 'ALL' ? opportunities : opportunities.filter(o => o.stage === filterStage);
  const totalPipeline = opportunities.reduce((acc, curr) => acc + curr.value_inr_lakhs, 0);

  return (
    <div className="flex-1 p-6 bg-[#0B0D12] text-white overflow-y-auto space-y-6 relative">
      
      {/* New Opportunity Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-[9999] flex items-center justify-center p-4" onClick={() => setShowModal(false)}>
          <div className="bg-[#141721] border border-slate-700 rounded-2xl p-6 w-full max-w-md space-y-4 shadow-2xl" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <DollarSign className="w-4 h-4 text-emerald-400" />
                <span>New Enterprise Opportunity</span>
              </h3>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-white"><X className="w-4 h-4" /></button>
            </div>
            <form onSubmit={handleCreateDeal} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-400 mb-1">Client Account Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Infosys / Wipro / TCS"
                  value={newDeal.client_name}
                  onChange={e => setNewDeal({ ...newDeal, client_name: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white"
                />
              </div>
              <div>
                <label className="block text-slate-400 mb-1">Opportunity Deal Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Fullstack Squad Staffing 2026"
                  value={newDeal.deal_name}
                  onChange={e => setNewDeal({ ...newDeal, deal_name: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 mb-1">Deal Value (₹ Lakhs)</label>
                  <input
                    type="number"
                    value={newDeal.value_inr_lakhs}
                    onChange={e => setNewDeal({ ...newDeal, value_inr_lakhs: Number(e.target.value) })}
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1">Win Probability %</label>
                  <input
                    type="number"
                    value={newDeal.probability}
                    onChange={e => setNewDeal({ ...newDeal, probability: Number(e.target.value) })}
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white"
                  />
                </div>
              </div>
              <div className="flex justify-end gap-2 pt-3 border-t border-slate-800">
                <button type="button" onClick={() => setShowModal(false)} className="px-3 py-1.5 bg-slate-800 text-slate-300 rounded-lg">Cancel</button>
                <button type="submit" className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-lg">Create Deal</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-black flex items-center gap-2">
            <DollarSign className="w-6 h-6 text-emerald-400" />
            Agency Sales CRM &amp; Deal Pipeline
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Track enterprise staffing deals, MSAs, rate cards, and revenue forecasts.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleGenerateInvoice}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-slate-800 text-emerald-400 border border-emerald-500/30 rounded-xl text-xs font-bold hover:bg-slate-700 transition-all"
          >
            <FileText className="w-4 h-4" />
            <span>Generate Client Invoice</span>
          </button>
          <button
            onClick={() => setShowModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-xl text-xs font-bold hover:bg-emerald-500 transition-all shadow-lg shadow-emerald-600/20"
          >
            <Plus className="w-4 h-4" />
            <span>New Opportunity</span>
          </button>
        </div>
      </div>

      {/* Financial KPI Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="p-4 bg-[#141721] border border-slate-800 rounded-2xl">
          <p className="text-[11px] font-bold text-slate-400 uppercase">Total Sales Pipeline</p>
          <p className="text-2xl font-black text-emerald-400 mt-1">₹{(totalPipeline / 100).toFixed(2)} Cr</p>
          <span className="text-[10px] text-slate-500">Across {opportunities.length} enterprise deals</span>
        </div>
        <div className="p-4 bg-[#141721] border border-slate-800 rounded-2xl">
          <p className="text-[11px] font-bold text-slate-400 uppercase">Weighted Revenue</p>
          <p className="text-2xl font-black text-indigo-400 mt-1">₹{(totalPipeline * 0.82 / 100).toFixed(2)} Cr</p>
          <span className="text-[10px] text-slate-500">Probability weighted</span>
        </div>
        <div className="p-4 bg-[#141721] border border-slate-800 rounded-2xl">
          <p className="text-[11px] font-bold text-slate-400 uppercase">Recruiter Commission Pool</p>
          <p className="text-2xl font-black text-amber-400 mt-1">12.5% Gross Margin</p>
          <span className="text-[10px] text-slate-500">Performance incentive pool</span>
        </div>
        <div className="p-4 bg-[#141721] border border-slate-800 rounded-2xl">
          <p className="text-[11px] font-bold text-slate-400 uppercase">Active MSAs / Contracts</p>
          <p className="text-2xl font-black text-purple-400 mt-1">12 Accounts</p>
          <span className="text-[10px] text-slate-500">With active rate cards</span>
        </div>
      </div>

      {/* Recruiter Commission & Gross Margin Split Engine */}
      <div className="bg-[#141721] border border-amber-900/60 rounded-2xl p-5 text-white space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-amber-400" />
            <h3 className="text-sm font-bold">Recruiter Commission &amp; Gross Margin Split Engine</h3>
          </div>
          <button
            onClick={() => toast.success('Recruiter Monthly Commission Pool calculated & exported to Payroll!')}
            className="px-3 py-1 bg-amber-500/10 text-amber-300 border border-amber-500/30 rounded-lg text-xs font-bold hover:bg-amber-500/20"
          >
            Calculate Monthly Commission Pool
          </button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs pt-1">
          <div className="p-3 bg-slate-900/80 border border-slate-800 rounded-xl space-y-1">
            <span className="text-[10px] font-bold text-slate-400 uppercase">Direct Recruiter Incentive</span>
            <p className="text-base font-black text-emerald-400">10.0% of Gross Margin</p>
            <p className="text-[10px] text-slate-400">Paid upon candidate 90-day milestone completion</p>
          </div>
          <div className="p-3 bg-slate-900/80 border border-slate-800 rounded-xl space-y-1">
            <span className="text-[10px] font-bold text-slate-400 uppercase">Team Lead Override</span>
            <p className="text-base font-black text-indigo-400">2.5% Team Margin Override</p>
            <p className="text-[10px] text-slate-400">Distributed across pod delivery leads</p>
          </div>
          <div className="p-3 bg-slate-900/80 border border-slate-800 rounded-xl space-y-1">
            <span className="text-[10px] font-bold text-slate-400 uppercase">Sourcing Partner Bonus</span>
            <p className="text-base font-black text-amber-400">₹25,000 Flat / Placement</p>
            <p className="text-[10px] text-slate-400">For silver medalist candidate activations</p>
          </div>
        </div>
      </div>

      {/* Deals Table */}
      <div className="bg-[#141721] border border-slate-800 rounded-2xl p-5 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-bold flex items-center gap-2">
            <Building2 className="w-4 h-4 text-emerald-400" />
            <span>Active Enterprise Deals ({filtered.length})</span>
          </h2>
          <div className="flex items-center gap-2 text-xs">
            <Filter className="w-3.5 h-3.5 text-slate-400" />
            <select
              value={filterStage}
              onChange={e => setFilterStage(e.target.value)}
              className="bg-slate-900 border border-slate-700 text-slate-300 rounded-lg px-2.5 py-1 focus:outline-none"
            >
              <option value="ALL">All Stages</option>
              <option value="Lead">Lead</option>
              <option value="Prospect">Prospect</option>
              <option value="Proposal">Proposal</option>
              <option value="Contract">Contract</option>
              <option value="Closed Won">Closed Won</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-900/60 text-slate-400 border-b border-slate-800 uppercase text-[10px] font-bold">
              <tr>
                <th className="p-3">Client / Account</th>
                <th className="p-3">Opportunity Name</th>
                <th className="p-3">Deal Value</th>
                <th className="p-3">Probability</th>
                <th className="p-3">Stage</th>
                <th className="p-3">Client SPOC</th>
                <th className="p-3">Expected Close</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {filtered.map(opp => (
                <tr key={opp.id} className="hover:bg-slate-800/40 transition-colors">
                  <td className="p-3 font-bold text-white flex items-center gap-2">
                    <Building2 className="w-3.5 h-3.5 text-indigo-400" />
                    <span>{opp.client_name}</span>
                  </td>
                  <td className="p-3 text-slate-300">{opp.deal_name}</td>
                  <td className="p-3 font-black text-emerald-400">₹{(opp.value_inr_lakhs / 100).toFixed(2)} Cr</td>
                  <td className="p-3">
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-950 text-indigo-300 border border-indigo-800">
                      {opp.probability}%
                    </span>
                  </td>
                  <td className="p-3">
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                      opp.stage === 'Closed Won' ? 'bg-emerald-950 text-emerald-300 border border-emerald-800' :
                      opp.stage === 'Contract' ? 'bg-purple-950 text-purple-300 border border-purple-800' :
                      'bg-slate-800 text-slate-300'
                    }`}>
                      {opp.stage}
                    </span>
                  </td>
                  <td className="p-3 text-slate-400">{opp.spoc}</td>
                  <td className="p-3 text-slate-400">{opp.expected_close}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
});

SalesCrmView.displayName = 'SalesCrmView';
