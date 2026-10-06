import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Calculator, TrendingDown, DollarSign, Clock, ArrowRight, 
  Sparkles, Zap, ShieldAlert, CheckCircle2, RefreshCw 
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { SEOHead } from '@/components/SEOHead';
import { LandingHeader } from '@/components/landing/LandingHeader';
import { AuthModal } from '@/components/landing/AuthModal';
import { Footer } from '@/components/Footer';
import { trackAcquisitionEvent, initializeAttribution } from '../../../services/acquisitionTelemetry';

export const SlaCalculatorTool: React.FC = () => {
  const navigate = useNavigate();
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const [monthlyLeads, setMonthlyLeads] = useState<number>(500);
  const [currentResponseTimeHours, setCurrentResponseTimeHours] = useState<number>(4);
  const [conversionRate, setConversionRate] = useState<number>(10);
  const [dealValue, setDealValue] = useState<number>(15000);
  const [currencySymbol, setCurrencySymbol] = useState<'₹' | '$' | 'AED'>('₹');

  useEffect(() => {
    initializeAttribution();
    trackAcquisitionEvent({ event: 'tool_view', tool: 'sla-calculator' });

    let isMounted = true;
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (isMounted && session?.user) setIsAuthenticated(true);
    }).catch(() => {});

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if ((event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') && session?.user) {
        setIsAuthenticated(true);
        setAuthModalOpen(false);
      } else if (event === 'SIGNED_OUT') {
        setIsAuthenticated(false);
      }
    });

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const handleNavigateWorkspace = useCallback(() => {
    navigate('/desktop/home');
  }, [navigate]);

  const handleAuthSuccess = useCallback(() => {
    setAuthModalOpen(false);
    navigate('/desktop/home', { replace: true });
  }, [navigate]);

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

  const schemaData = {
    '@context': 'https://schema.org',
    '@type': 'WebApplication',
    name: 'Free Lead Response Time SLA & Revenue Loss Calculator',
    applicationCategory: 'BusinessApplication',
    url: 'https://www.chatrchat.in/tools/sla-calculator',
    description: 'Calculate revenue lost due to slow lead response times on WhatsApp, email, and web forms. See how sub-60-second response SLAs increase conversion rates.',
    operatingSystem: 'All Modern Web Browsers',
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'INR'
    }
  };

  return (
    <div className="min-h-screen bg-[#F8F8F5] text-[#111817] font-sans antialiased selection:bg-[#E8F0EB] selection:text-[#164E3F] flex flex-col justify-between">
      <SEOHead
        title="Lead Response Time SLA & Revenue Loss Calculator | CHATR"
        description="Calculate revenue lost due to slow lead response times on WhatsApp, email, and web forms. See how sub-60-second response SLAs increase conversion rates."
        canonicalUrl="https://www.chatrchat.in/tools/sla-calculator"
        keywords="lead response time calculator, speed to lead calculator, response sla revenue loss, whatsapp lead conversion calculator, sales response time benchmark"
        schemaData={schemaData}
      />

      {/* ── Canonical Navigation Header ── */}
      <LandingHeader
        onOpenAuth={() => setAuthModalOpen(true)}
        isAuthenticated={isAuthenticated}
        onNavigateWorkspace={handleNavigateWorkspace}
      />

      {/* Main Container */}
      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14 space-y-10 flex-1">
        {/* Title Hero */}
        <div className="text-center space-y-4 max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 text-xs font-semibold tracking-[0.2em] uppercase text-[#53605C]">
            <span className="w-6 h-[1.5px] bg-[#164E3F]" />
            <span>EMPIRICAL RESPONSE LATENCY BENCHMARK • 100% FREE TOOL</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-bold tracking-tight text-[#111817] leading-tight">
            WhatsApp Lead Response Time &amp; <span className="text-[#164E3F]">Revenue Loss Calculator</span>
          </h1>
          <p className="text-sm sm:text-base text-[#53605C] leading-relaxed max-w-2xl mx-auto">
            See how much revenue your sales team loses every month due to delayed response on inbound WhatsApp, form, and portal leads.
          </p>
        </div>

        {/* Calculator Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Inputs Side */}
          <div className="lg:col-span-6 bg-white border border-[#DDE3DF] rounded-2xl p-6 sm:p-8 space-y-6 shadow-sm">
            <h2 className="text-base font-bold text-[#111817] flex items-center gap-2">
              <Calculator className="w-4 h-4 text-[#164E3F]" />
              Enter Your Team's Metrics
            </h2>

            <div className="space-y-5">
              {/* Monthly Leads Slider */}
              <div className="space-y-2">
                <div className="flex justify-between text-xs">
                  <label className="font-semibold text-[#53605C]">Monthly Inbound Leads</label>
                  <span className="font-bold text-[#164E3F] font-mono">{monthlyLeads.toLocaleString()} leads</span>
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
                  className="w-full accent-[#164E3F] cursor-pointer"
                />
              </div>

              {/* Current Response Time */}
              <div className="space-y-2">
                <div className="flex justify-between text-xs">
                  <label className="font-semibold text-[#53605C]">Current Average Response Time</label>
                  <span className="font-bold text-amber-700 font-mono">
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
                  className="w-full accent-amber-600 cursor-pointer"
                />
              </div>

              {/* Conversion Rate */}
              <div className="space-y-2">
                <div className="flex justify-between text-xs">
                  <label className="font-semibold text-[#53605C]">Lead-to-Customer Conversion Rate</label>
                  <span className="font-bold text-[#164E3F] font-mono">{conversionRate}%</span>
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
                  className="w-full accent-[#164E3F] cursor-pointer"
                />
              </div>

              {/* Deal Value */}
              <div className="space-y-2">
                <div className="flex justify-between text-xs items-center">
                  <label className="font-semibold text-[#53605C]">Average Deal / Customer Value</label>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => setCurrencySymbol('₹')}
                      className={`px-2 py-0.5 rounded text-[11px] font-bold transition-colors ${currencySymbol === '₹' ? 'bg-[#164E3F] text-white' : 'text-[#53605C] bg-[#F0F3F1] hover:bg-[#E5EAE7]'}`}
                    >
                      INR (₹)
                    </button>
                    <button
                      onClick={() => setCurrencySymbol('$')}
                      className={`px-2 py-0.5 rounded text-[11px] font-bold transition-colors ${currencySymbol === '$' ? 'bg-[#164E3F] text-white' : 'text-[#53605C] bg-[#F0F3F1] hover:bg-[#E5EAE7]'}`}
                    >
                      USD ($)
                    </button>
                    <button
                      onClick={() => setCurrencySymbol('AED')}
                      className={`px-2 py-0.5 rounded text-[11px] font-bold transition-colors ${currencySymbol === 'AED' ? 'bg-[#164E3F] text-white' : 'text-[#53605C] bg-[#F0F3F1] hover:bg-[#E5EAE7]'}`}
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
                    className="w-full bg-[#FAFBF9] border border-[#DDE3DF] rounded-xl p-3 text-sm text-[#111817] focus:outline-none focus:border-[#164E3F] font-mono shadow-inner"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Results Side */}
          <div className="lg:col-span-6 bg-[#FAFBF9] border border-[#DDE3DF] rounded-2xl p-6 sm:p-8 flex flex-col justify-between space-y-6 shadow-sm">
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <span className="text-[11px] uppercase font-bold text-rose-700 tracking-wider">Estimated Revenue Leakage</span>
                <span className="px-2.5 py-1 rounded-full bg-rose-50 border border-rose-200 text-rose-700 text-[10px] font-bold uppercase">
                  {calculation.dropOffFactor}% Lead Attrition
                </span>
              </div>

              {/* Big Loss Stat */}
              <div className="space-y-1">
                <p className="text-3xl sm:text-4xl font-extrabold text-rose-600 tracking-tight">
                  {currencySymbol}{calculation.monthlyRevenueLoss.toLocaleString()}
                  <span className="text-xs text-[#53605C] font-normal ml-1">/ month</span>
                </p>
                <p className="text-xs text-[#53605C] font-mono">
                  {currencySymbol}{calculation.annualRevenueLoss.toLocaleString()} annual estimated revenue lost
                </p>
              </div>

              {/* Breakdown metrics */}
              <div className="grid grid-cols-2 gap-3 pt-2">
                <div className="bg-white border border-[#DDE3DF] rounded-xl p-4 space-y-1">
                  <p className="text-[11px] text-[#53605C]">Leads Going to Competitors</p>
                  <p className="text-lg font-bold text-[#111817] font-mono">{calculation.lostLeadsMonthly} leads/mo</p>
                </div>
                <div className="bg-white border border-[#DDE3DF] rounded-xl p-4 space-y-1">
                  <p className="text-[11px] text-[#53605C]">Target Response SLA</p>
                  <p className="text-lg font-bold text-[#164E3F] font-mono">&lt; 60 Seconds</p>
                </div>
              </div>
            </div>

            {/* Bottom Recommendation CTA */}
            <div className="space-y-3 pt-4 border-t border-[#DDE3DF]">
              <p className="text-xs text-[#53605C] leading-relaxed">
                Businesses using CHATR cut response times to <strong className="text-[#164E3F] font-bold">&lt;60s</strong> with automated round-robin lead triage, recovering up to 85% of missed revenue.
              </p>
              <button
                onClick={() => {
                  trackAcquisitionEvent({ event: 'cta_clicked', tool: 'sla-calculator', metadata: { cta: 'recover_revenue' } });
                  if (isAuthenticated) {
                    navigate('/desktop/home');
                  } else {
                    setAuthModalOpen(true);
                  }
                }}
                className="w-full py-3.5 rounded-xl bg-[#164E3F] hover:bg-[#123F33] text-white font-bold text-xs flex items-center justify-center gap-2 transition-all shadow-md cursor-pointer"
              >
                <span>Automate Lead Response with CHATR</span> <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <Footer />

      {/* Auth Modal */}
      <AuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        onAuthSuccess={handleAuthSuccess}
      />
    </div>
  );
};

export default SlaCalculatorTool;
