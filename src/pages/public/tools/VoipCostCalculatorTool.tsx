import React, { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Calculator, PhoneCall, TrendingDown, DollarSign, Check, 
  Sparkles, ArrowRight, ShieldCheck, Activity, Users 
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { SEOHead } from '@/components/SEOHead';
import { LandingHeader } from '@/components/landing/LandingHeader';
import { AuthModal } from '@/components/landing/AuthModal';
import { Footer } from '@/components/Footer';
import { trackAcquisitionEvent, initializeAttribution } from '../../../services/acquisitionTelemetry';

export const VoipCostCalculatorTool: React.FC = () => {
  const navigate = useNavigate();
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const [agents, setAgents] = useState(15);
  const [currency, setCurrency] = useState<'INR' | 'USD' | 'AED' | 'SAR'>('INR');
  const [hasLegacyPbx, setHasLegacyPbx] = useState(true);

  useEffect(() => {
    window.scrollTo(0, 0);
    initializeAttribution();
    trackAcquisitionEvent({ event: 'tool_view', tool: 'voip-cost-calculator' });

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

  const handleActionClick = () => {
    trackAcquisitionEvent({
      event: 'cta_clicked',
      tool: 'voip-cost-calculator',
      metadata: { cta: 'deploy_calling', agents, currency, annualSavings }
    });
    if (isAuthenticated) {
      navigate('/desktop/home');
    } else {
      setAuthModalOpen(true);
    }
  };

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
    <div className="min-h-screen bg-[#F8F8F5] text-[#111817] font-sans antialiased selection:bg-[#E8F0EB] selection:text-[#164E3F] flex flex-col justify-between">
      <SEOHead
        title="Business VoIP & Telecom Cost Calculator — Estimate Savings | CHATR"
        description="Calculate total telephony and call center infrastructure savings. Compare legacy SIP trunk and desk phone costs against modern browser and mobile WebRTC calling."
        canonicalUrl="https://www.chatrchat.in/tools/business-voip-cost-calculator"
        keywords="business voip cost calculator, enterprise telecom savings, pbx cost comparison, webrtc voip calculator"
        schemaData={schemaData}
      />

      {/* ── Canonical Navigation Header ── */}
      <LandingHeader
        onOpenAuth={() => setAuthModalOpen(true)}
        isAuthenticated={isAuthenticated}
        onNavigateWorkspace={handleNavigateWorkspace}
      />

      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14 space-y-10 flex-1">
        <div className="space-y-4 text-center max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 text-xs font-semibold tracking-[0.2em] uppercase text-[#53605C]">
            <span className="w-6 h-[1.5px] bg-[#164E3F]" />
            <span>TELEPHONY ROI CALCULATOR • 100% FREE TOOL</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-bold text-[#111817] tracking-tight leading-tight">
            Business VoIP &amp; <span className="text-[#164E3F]">Telecom Cost Calculator</span>
          </h1>
          <p className="text-[#53605C] text-sm sm:text-base leading-relaxed max-w-2xl mx-auto">
            Discover how much your business saves by replacing physical PBX hardware, desk phone leases, and proprietary SIP lines with browser &amp; mobile WebRTC calling.
          </p>
        </div>

        {/* Calculator Card */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Inputs */}
          <div className="lg:col-span-6 bg-white border border-[#DDE3DF] rounded-2xl p-6 sm:p-8 space-y-6 shadow-sm">
            <h2 className="text-base font-bold text-[#111817] flex items-center gap-2">
              <Calculator className="w-4 h-4 text-[#164E3F]" />
              Select Telephony Parameters
            </h2>

            <div className="space-y-6">
              <div className="space-y-2">
                <label className="text-xs font-semibold text-[#53605C]">Currency</label>
                <div className="flex gap-2">
                  {(['INR', 'USD', 'AED', 'SAR'] as const).map((c) => (
                    <button
                      key={c}
                      type="button"
                      onClick={() => setCurrency(c)}
                      className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition-all ${
                        currency === c 
                          ? 'bg-[#164E3F] text-white shadow-sm' 
                          : 'bg-[#F0F3F1] text-[#53605C] hover:bg-[#E5EAE7]'
                      }`}
                    >
                      {c}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-semibold text-[#53605C]">Number of Team / Agent Seats</span>
                  <span className="font-mono text-[#164E3F] font-bold text-sm">{agents} Seats</span>
                </div>
                <input
                  type="range"
                  min={1}
                  max={150}
                  value={agents}
                  onChange={(e) => setAgents(parseInt(e.target.value, 10))}
                  className="w-full accent-[#164E3F] cursor-pointer"
                />
                <div className="flex justify-between text-[10px] text-[#83918C] font-mono">
                  <span>1</span>
                  <span>50</span>
                  <span>100</span>
                  <span>150+</span>
                </div>
              </div>

              <div className="pt-3 border-t border-[#DDE3DF]">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={hasLegacyPbx}
                    onChange={(e) => setHasLegacyPbx(e.target.checked)}
                    className="w-4 h-4 rounded border-[#DDE3DF] text-[#164E3F] focus:ring-0 cursor-pointer accent-[#164E3F]"
                  />
                  <span className="text-xs text-[#53605C]">Include physical PBX box, AMC &amp; maintenance fees</span>
                </label>
              </div>
            </div>
          </div>

          {/* Savings Results */}
          <div className="lg:col-span-6 bg-[#FAFBF9] border border-[#DDE3DF] rounded-2xl p-6 sm:p-8 flex flex-col justify-between space-y-6 shadow-sm">
            <div className="space-y-5">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-[#53605C]">Estimated Annual Savings</span>
                <span className="px-2.5 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-[#164E3F] text-[10px] font-bold uppercase">
                  {percentageSavings}% Cost Reduction
                </span>
              </div>

              <div className="space-y-1">
                <div className="text-3xl sm:text-4xl font-extrabold text-[#164E3F] tracking-tight">
                  {curr.symbol}{annualSavings.toLocaleString()}
                </div>
                <p className="text-xs text-[#53605C] font-mono">
                  Save {curr.symbol}{monthlySavings.toLocaleString()} every month on communication infrastructure
                </p>
              </div>

              <div className="space-y-2 pt-4 border-t border-[#DDE3DF] text-xs">
                <div className="flex justify-between py-2 text-[#53605C] border-b border-[#EAEFEA]">
                  <span>Traditional PBX + SIP Trunk:</span>
                  <span className="font-mono line-through text-[#83918C]">{curr.symbol}{legacyMonthly.toLocaleString()}/mo</span>
                </div>
                <div className="flex justify-between py-2 text-[#111817] font-semibold">
                  <span>CHATR Calling Cost:</span>
                  <span className="font-mono text-[#164E3F] font-bold">{curr.symbol}{chatrMonthly.toLocaleString()}/mo</span>
                </div>
              </div>
            </div>

            <div className="space-y-3 pt-2">
              <button
                onClick={handleActionClick}
                className="w-full flex items-center justify-center gap-2 bg-[#164E3F] hover:bg-[#123F33] text-white font-bold py-3.5 rounded-xl text-xs transition-all shadow-md cursor-pointer"
              >
                <span>Deploy CHATR Calling Free</span>
                <ArrowRight className="w-4 h-4" />
              </button>
              <Link
                to="/call"
                className="w-full flex items-center justify-center text-xs text-[#53605C] hover:text-[#164E3F] py-1 font-medium transition-colors"
              >
                <span>Try instant 1-click browser call without signup →</span>
              </Link>
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

export default VoipCostCalculatorTool;
