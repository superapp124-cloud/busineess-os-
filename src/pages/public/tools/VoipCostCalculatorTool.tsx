import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Calculator, PhoneCall, TrendingDown, DollarSign, Check, 
  Sparkles, ArrowRight, ShieldCheck, Activity, Users 
} from 'lucide-react';
import { SEOHead } from '@/components/SEOHead';

export const VoipCostCalculatorTool: React.FC = () => {
  const [agents, setAgents] = useState(15);
  const [currency, setCurrency] = useState<'INR' | 'USD' | 'AED' | 'SAR'>('INR');
  const [hasLegacyPbx, setHasLegacyPbx] = useState(true);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const rates = {
    INR: { symbol: '₹', legacyPerSeat: 2200, chatrPerSeat: 799, pbxMaintenance: 15000 },
    USD: { symbol: '$', legacyPerSeat: 35, chatrPerSeat: 15, pbxMaintenance: 250 },
    AED: { symbol: 'AED ', legacyPerSeat: 120, chatrPerSeat: 55, pbxMaintenance: 800 },
    SAR: { symbol: 'SAR ', legacyPerSeat: 125, chatrPerSeat: 55, pbxMaintenance: 850 }
  };

  const curr = rates[currency];
  const legacyMonthly = (agents * curr.legacyPerSeat) + (hasLegacyPbx ? curr.pbxMaintenance : 0);
  const chatrMonthly = agents * curr.chatrPerSeat;
  const monthlySavings = Math.max(0, legacyMonthly - chatrMonthly);
  const annualSavings = monthlySavings * 12;
  const percentageSavings = legacyMonthly > 0 ? Math.round((monthlySavings / legacyMonthly) * 100) : 0;

  const schemaData = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    "name": "CHATR Business VoIP Cost Calculator",
    "applicationCategory": "BusinessApplication",
    "operatingSystem": "Web, macOS, Windows, iOS, Android",
    "url": "https://www.chatrchat.in/tools/business-voip-cost-calculator",
    "description": "Calculate enterprise telephony and call center infrastructure savings switching to CHATR Calling."
  };

  return (
    <>
      <SEOHead
        title="Business VoIP & Telecom Cost Calculator — Estimate Savings | CHATR"
        description="Calculate total telephony and call center infrastructure savings. Compare legacy SIP trunk and desk phone costs against modern browser and mobile WebRTC calling."
        keywords="business voip cost calculator, enterprise telecom savings, pbx cost comparison, webrtc voip calculator"
        schemaData={schemaData}
      />
      <div className="min-h-screen bg-slate-950 text-white font-sans selection:bg-indigo-500 selection:text-white">
        <header className="border-b border-slate-800/80 bg-slate-950/80 sticky top-0 z-40 backdrop-blur-xl">
          <div className="max-w-5xl mx-auto px-4 py-4 flex items-center justify-between">
            <Link to="/" className="flex items-center gap-2 font-extrabold text-lg tracking-tight">
              <span className="bg-gradient-to-r from-indigo-400 to-cyan-400 bg-clip-text text-transparent">CHATR</span>
              <span className="text-xs px-2 py-0.5 rounded-full bg-slate-800 text-slate-400 font-mono">CALLING</span>
            </Link>
            <Link to="/auth" className="text-xs bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2 rounded-lg font-semibold transition-all">
              Launch Workspace
            </Link>
          </div>
        </header>

        <main className="max-w-4xl mx-auto px-4 py-12 space-y-12">
          <div className="space-y-3 text-center max-w-2xl mx-auto">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold">
              <TrendingDown className="w-3.5 h-3.5" />
              <span>TELEPHONY ROI CALCULATOR</span>
            </div>
            <h1 className="text-3xl md:text-5xl font-black text-white tracking-tight">
              Business VoIP Cost Calculator
            </h1>
            <p className="text-slate-400 text-sm md:text-base leading-relaxed">
              Discover how much your enterprise saves by replacing legacy PBX hardware, desk phone leases, and proprietary SIP lines with CHATR Calling.
            </p>
          </div>

          {/* Calculator Card */}
          <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 md:p-8 space-y-8 shadow-2xl">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Inputs */}
              <div className="space-y-6">
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-slate-300">Currency</label>
                  <div className="flex gap-2">
                    {(['INR', 'USD', 'AED', 'SAR'] as const).map((c) => (
                      <button
                        key={c}
                        type="button"
                        onClick={() => setCurrency(c)}
                        className={`flex-1 py-2 rounded-xl text-xs font-bold border transition-all ${currency === c ? 'bg-indigo-600 border-indigo-500 text-white shadow-lg shadow-indigo-600/20' : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'}`}
                      >
                        {c}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-semibold text-slate-300">Number of Team / Agent Seats</span>
                    <span className="font-mono text-indigo-400 font-bold text-sm">{agents} Seats</span>
                  </div>
                  <input
                    type="range"
                    min={1}
                    max={150}
                    value={agents}
                    onChange={(e) => setAgents(parseInt(e.target.value, 10))}
                    className="w-full accent-indigo-500 bg-slate-800 rounded-lg cursor-pointer"
                  />
                  <div className="flex justify-between text-[10px] text-slate-500 font-mono">
                    <span>1</span>
                    <span>50</span>
                    <span>100</span>
                    <span>150+</span>
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-800/80">
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={hasLegacyPbx}
                      onChange={(e) => setHasLegacyPbx(e.target.checked)}
                      className="w-4 h-4 rounded border-slate-700 text-indigo-600 focus:ring-0 bg-slate-950 cursor-pointer"
                    />
                    <span className="text-xs text-slate-300">Include physical PBX box & maintenance fees</span>
                  </label>
                </div>
              </div>

              {/* Savings Results */}
              <div className="bg-slate-950 border border-slate-800/80 rounded-xl p-6 flex flex-col justify-between space-y-6">
                <div className="space-y-4">
                  <span className="text-xs font-mono font-bold uppercase tracking-wider text-slate-400">Estimated Annual Savings</span>
                  <div className="space-y-1">
                    <div className="text-4xl md:text-5xl font-black text-emerald-400">
                      {curr.symbol}{annualSavings.toLocaleString()}
                    </div>
                    <p className="text-xs text-slate-400 font-mono">
                      Save {percentageSavings}% per year ({curr.symbol}{monthlySavings.toLocaleString()} / month)
                    </p>
                  </div>

                  <div className="space-y-2 pt-4 border-t border-slate-900 text-xs">
                    <div className="flex justify-between py-1 text-slate-400">
                      <span>Traditional PBX Cost:</span>
                      <span className="font-mono line-through text-slate-500">{curr.symbol}{legacyMonthly.toLocaleString()}/mo</span>
                    </div>
                    <div className="flex justify-between py-1 text-slate-300 font-semibold">
                      <span>CHATR Calling Cost:</span>
                      <span className="font-mono text-emerald-400">{curr.symbol}{chatrMonthly.toLocaleString()}/mo</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-2 pt-2">
                  <Link
                    to="/auth"
                    className="w-full flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-3 rounded-xl text-xs transition-all shadow-lg shadow-emerald-600/20"
                  >
                    <span>Deploy CHATR Calling Free</span>
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                  <Link
                    to="/chatr-calling"
                    className="w-full flex items-center justify-center text-xs text-slate-400 hover:text-white py-1 font-medium transition-colors"
                  >
                    <span>Explore Calling Architecture & SmartSession →</span>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </>
  );
};

export default VoipCostCalculatorTool;
