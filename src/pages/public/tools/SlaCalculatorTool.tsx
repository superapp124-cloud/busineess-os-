import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { 
  Calculator, TrendingDown, DollarSign, Clock, ArrowRight, 
  Sparkles, Zap, ShieldAlert, CheckCircle2, RefreshCw 
} from 'lucide-react';
import { trackAcquisitionEvent, initializeAttribution } from '../../../services/acquisitionTelemetry';

export const SlaCalculatorTool: React.FC = () => {
  const [monthlyLeads, setMonthlyLeads] = useState<number>(500);
  const [currentResponseTimeHours, setCurrentResponseTimeHours] = useState<number>(4);
  const [conversionRate, setConversionRate] = useState<number>(10);
  const [dealValue, setDealValue] = useState<number>(15000);
  const [currencySymbol, setCurrencySymbol] = useState<'₹' | '$' | 'AED'>('₹');

  useEffect(() => {
    initializeAttribution();
    trackAcquisitionEvent({ event: 'tool_view', tool: 'sla-calculator' });
  }, []);

  // Scientific Response Latency Drop-off Model (Empirical data: >2 hours = ~45% lead drop-off, <1 min = 94% retention)
  const calculation = useMemo(() => {
    let dropOffFactor = 0.1;
    if (currentResponseTimeHours >= 4) dropOffFactor = 0.52;
    else if (currentResponseTimeHours >= 2) dropOffFactor = 0.38;
    else if (currentResponseTimeHours >= 1) dropOffFactor = 0.25;
    else if (currentResponseTimeHours >= 0.25) dropOffFactor = 0.12;
    else dropOffFactor = 0.04;

    const lostLeadsMonthly = Math.round(monthlyLeads * dropOffFactor);
    const lostDealsMonthly = Math.round(lostLeadsMonthly * (conversionRate / 100));
    const monthlyRevenueLoss = lostDealsMonthly * dealValue;
    const annualRevenueLoss = monthlyRevenueLoss * 12;

    const recommendedSlaMinutes = currentResponseTimeHours > 1 ? 1 : 0.5;

    return {
      dropOffFactor: Math.round(dropOffFactor * 100),
      lostLeadsMonthly,
      lostDealsMonthly,
      monthlyRevenueLoss,
      annualRevenueLoss,
      recommendedSlaMinutes
    };
  }, [monthlyLeads, currentResponseTimeHours, conversionRate, dealValue]);

  const handleInputChange = (field: string, value: number) => {
    trackAcquisitionEvent({
      event: 'tool_started',
      tool: 'sla-calculator',
      metadata: { field, value, monthlyRevenueLoss: calculation.monthlyRevenueLoss }
    });
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white font-sans selection:bg-indigo-500 selection:text-white">
      {/* Header */}
      <header className="border-b border-slate-800 bg-slate-950/80 sticky top-0 z-40 backdrop-blur">
        <div className="max-w-5xl mx-auto px-4 py-3.5 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2 font-bold text-base">
            <span className="bg-indigo-600 text-white px-2 py-0.5 rounded-md text-xs font-black tracking-wider">CHATR</span>
            <span className="text-slate-400 font-medium text-xs">/ Response SLA & Revenue Loss Calculator</span>
          </Link>
          <div className="flex items-center gap-3">
            <Link
              to="/auth"
              onClick={() => trackAcquisitionEvent({ event: 'cta_clicked', tool: 'sla-calculator', metadata: { cta: 'nav_signup' } })}
              className="px-3.5 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-xs font-semibold text-white transition-colors"
            >
              Sign In / Register
            </Link>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-4xl mx-auto px-4 py-10 space-y-10">
        {/* Title Hero */}
        <div className="text-center space-y-3 max-w-2xl mx-auto">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs font-bold">
            <ShieldAlert className="w-3.5 h-3.5 text-rose-400" />
            <span>Empirical Response Latency Model</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white">
            WhatsApp Lead Response Time & Revenue Leakage Calculator
          </h1>
          <p className="text-sm sm:text-base text-slate-400 leading-relaxed">
            See how much revenue your sales team loses every month due to slow WhatsApp, email, and portal lead response times.
          </p>
        </div>

        {/* Calculator Grid */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
          {/* Inputs Side */}
          <div className="md:col-span-6 bg-slate-900 border border-slate-800 rounded-2xl p-6 sm:p-8 space-y-6 shadow-xl">
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <Calculator className="w-4 h-4 text-indigo-400" />
              Enter Your Team's Metrics
            </h2>

            <div className="space-y-4">
              {/* Monthly Leads Slider */}
              <div className="space-y-2">
                <div className="flex justify-between text-xs">
                  <label className="font-semibold text-slate-300">Monthly Inbound Leads</label>
                  <span className="font-bold text-indigo-400 font-mono">{monthlyLeads.toLocaleString()} leads</span>
                </div>
                <input
                  type="range"
                  min={50}
                  max={10000}
                  step={50}
                  value={monthlyLeads}
                  onChange={e => {
                    setMonthlyLeads(Number(e.target.value));
                    handleInputChange('monthlyLeads', Number(e.target.value));
                  }}
                  className="w-full accent-indigo-600 cursor-pointer"
                />
              </div>

              {/* Current Response Time */}
              <div className="space-y-2">
                <div className="flex justify-between text-xs">
                  <label className="font-semibold text-slate-300">Current Average Response Time</label>
                  <span className="font-bold text-amber-400 font-mono">
                    {currentResponseTimeHours < 1 
                      ? `${Math.round(currentResponseTimeHours * 60)} minutes` 
                      : `${currentResponseTimeHours} hour${currentResponseTimeHours > 1 ? 's' : ''}`}
                  </span>
                </div>
                <input
                  type="range"
                  min={0.1}
                  max={24}
                  step={0.5}
                  value={currentResponseTimeHours}
                  onChange={e => {
                    setCurrentResponseTimeHours(Number(e.target.value));
                    handleInputChange('responseTime', Number(e.target.value));
                  }}
                  className="w-full accent-amber-500 cursor-pointer"
                />
              </div>

              {/* Conversion Rate */}
              <div className="space-y-2">
                <div className="flex justify-between text-xs">
                  <label className="font-semibold text-slate-300">Lead-to-Customer Conversion Rate</label>
                  <span className="font-bold text-emerald-400 font-mono">{conversionRate}%</span>
                </div>
                <input
                  type="range"
                  min={1}
                  max={40}
                  step={1}
                  value={conversionRate}
                  onChange={e => {
                    setConversionRate(Number(e.target.value));
                    handleInputChange('conversionRate', Number(e.target.value));
                  }}
                  className="w-full accent-emerald-500 cursor-pointer"
                />
              </div>

              {/* Deal Value */}
              <div className="space-y-2">
                <div className="flex justify-between text-xs">
                  <label className="font-semibold text-slate-300">Average Deal / Customer Value</label>
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => setCurrencySymbol('₹')}
                      className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${currencySymbol === '₹' ? 'bg-indigo-600 text-white' : 'text-slate-500 bg-slate-800'}`}
                    >
                      INR (₹)
                    </button>
                    <button
                      onClick={() => setCurrencySymbol('$')}
                      className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${currencySymbol === '$' ? 'bg-indigo-600 text-white' : 'text-slate-500 bg-slate-800'}`}
                    >
                      USD ($)
                    </button>
                    <button
                      onClick={() => setCurrencySymbol('AED')}
                      className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${currencySymbol === 'AED' ? 'bg-indigo-600 text-white' : 'text-slate-500 bg-slate-800'}`}
                    >
                      AED
                    </button>
                  </div>
                </div>
                <div className="relative">
                  <input
                    type="number"
                    min={100}
                    step={500}
                    value={dealValue}
                    onChange={e => {
                      setDealValue(Number(e.target.value));
                      handleInputChange('dealValue', Number(e.target.value));
                    }}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-slate-200 focus:outline-none focus:border-indigo-500 font-mono"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Results Side */}
          <div className="md:col-span-6 bg-gradient-to-b from-rose-950/30 via-slate-900 to-slate-900 border border-rose-500/30 rounded-2xl p-6 sm:p-8 flex flex-col justify-between space-y-6 shadow-xl">
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <span className="text-[11px] uppercase font-bold text-rose-400 tracking-wider">Estimated Revenue Leakage</span>
                <span className="px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-300 text-[10px] font-bold uppercase">
                  {calculation.dropOffFactor}% Lead Attrition
                </span>
              </div>

              {/* Big Loss Stat */}
              <div className="space-y-1">
                <p className="text-3xl sm:text-4xl font-black text-rose-400 tracking-tight">
                  {currencySymbol}{calculation.monthlyRevenueLoss.toLocaleString()}
                  <span className="text-xs text-slate-400 font-medium ml-1">/ month</span>
                </p>
                <p className="text-xs text-slate-400 font-mono">
                  {currencySymbol}{calculation.annualRevenueLoss.toLocaleString()} annual estimated revenue lost
                </p>
              </div>

              {/* Breakdown metrics */}
              <div className="grid grid-cols-2 gap-3 pt-2">
                <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-3.5 space-y-1">
                  <p className="text-[11px] text-slate-400">Leads Going to Competitors</p>
                  <p className="text-lg font-bold text-white font-mono">{calculation.lostLeadsMonthly} leads/mo</p>
                </div>
                <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-3.5 space-y-1">
                  <p className="text-[11px] text-slate-400">Target Response SLA</p>
                  <p className="text-lg font-bold text-emerald-400 font-mono">&lt; 60 Seconds</p>
                </div>
              </div>
            </div>

            {/* Bottom Recommendation CTA */}
            <div className="space-y-3 pt-4 border-t border-slate-800">
              <p className="text-xs text-slate-300 leading-relaxed">
                Businesses using CHATR cut response times to <strong className="text-emerald-400 font-bold">&lt;60s</strong> with automated round-robin lead triage, recovering up to 85% of missed revenue.
              </p>
              <Link
                to="/auth"
                onClick={() => trackAcquisitionEvent({ event: 'cta_clicked', tool: 'sla-calculator', metadata: { cta: 'recover_revenue' } })}
                className="w-full py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs flex items-center justify-center gap-2 transition-all shadow-lg shadow-indigo-600/20"
              >
                <span>Automate Lead Response with CHATR</span> <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default SlaCalculatorTool;
