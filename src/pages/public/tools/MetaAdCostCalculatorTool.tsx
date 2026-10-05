import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { 
  Calculator, TrendingUp, TrendingDown, DollarSign, Target, 
  ArrowRight, Sparkles, Zap, CheckCircle2, Copy, Check, 
  HelpCircle, ChevronDown, ChevronUp, Layers, RefreshCw, 
  MessageSquare, ShoppingCart, Percent, Eye, MousePointer,
  BarChart3, ShieldCheck
} from 'lucide-react';
import { SEOHead } from '@/components/SEOHead';
import { trackAcquisitionEvent, initializeAttribution } from '@/services/acquisitionTelemetry';

type Currency = 'INR' | 'USD' | 'AED' | 'GBP' | 'EUR';
type Objective = 'leads' | 'ecommerce';
type IndustryKey = 
  | 'ecommerce' 
  | 'b2b_saas' 
  | 'real_estate' 
  | 'healthcare' 
  | 'education' 
  | 'finance' 
  | 'hospitality' 
  | 'local' 
  | 'custom';

interface IndustryBenchmark {
  name: string;
  defaultCpm: number; // in local default or normalized
  defaultCpcInr: number;
  defaultCpcUsd: number;
  defaultCtr: number;
  defaultConvRate: number;
  defaultDealValueInr: number;
  defaultDealValueUsd: number;
  defaultCloseRate: number;
}

const INDUSTRY_BENCHMARKS: Record<IndustryKey, IndustryBenchmark> = {
  ecommerce: {
    name: 'E-Commerce & D2C Brands',
    defaultCpm: 180,
    defaultCpcInr: 18,
    defaultCpcUsd: 0.85,
    defaultCtr: 1.6,
    defaultConvRate: 2.8,
    defaultDealValueInr: 1600,
    defaultDealValueUsd: 65,
    defaultCloseRate: 100, // Direct purchase
  },
  b2b_saas: {
    name: 'B2B Software & SaaS',
    defaultCpm: 340,
    defaultCpcInr: 75,
    defaultCpcUsd: 3.40,
    defaultCtr: 1.1,
    defaultConvRate: 3.2,
    defaultDealValueInr: 45000,
    defaultDealValueUsd: 2200,
    defaultCloseRate: 15,
  },
  real_estate: {
    name: 'Real Estate & Properties',
    defaultCpm: 280,
    defaultCpcInr: 52,
    defaultCpcUsd: 2.20,
    defaultCtr: 1.2,
    defaultConvRate: 4.0,
    defaultDealValueInr: 180000,
    defaultDealValueUsd: 8500,
    defaultCloseRate: 8,
  },
  healthcare: {
    name: 'Clinics, Doctors & Wellness',
    defaultCpm: 210,
    defaultCpcInr: 28,
    defaultCpcUsd: 1.35,
    defaultCtr: 1.8,
    defaultConvRate: 5.5,
    defaultDealValueInr: 4500,
    defaultDealValueUsd: 180,
    defaultCloseRate: 30,
  },
  education: {
    name: 'Education, EdTech & Coaching',
    defaultCpm: 190,
    defaultCpcInr: 24,
    defaultCpcUsd: 1.05,
    defaultCtr: 1.7,
    defaultConvRate: 4.5,
    defaultDealValueInr: 15000,
    defaultDealValueUsd: 450,
    defaultCloseRate: 18,
  },
  finance: {
    name: 'Financial Services & FinTech',
    defaultCpm: 380,
    defaultCpcInr: 65,
    defaultCpcUsd: 3.10,
    defaultCtr: 1.0,
    defaultConvRate: 3.0,
    defaultDealValueInr: 32000,
    defaultDealValueUsd: 1400,
    defaultCloseRate: 14,
  },
  hospitality: {
    name: 'Hotels, Travel & Resorts',
    defaultCpm: 170,
    defaultCpcInr: 20,
    defaultCpcUsd: 0.90,
    defaultCtr: 2.1,
    defaultConvRate: 3.5,
    defaultDealValueInr: 12000,
    defaultDealValueUsd: 380,
    defaultCloseRate: 25,
  },
  local: {
    name: 'Local Services (Salons, Auto, Fitness)',
    defaultCpm: 150,
    defaultCpcInr: 15,
    defaultCpcUsd: 0.75,
    defaultCtr: 2.3,
    defaultConvRate: 6.0,
    defaultDealValueInr: 3000,
    defaultDealValueUsd: 95,
    defaultCloseRate: 35,
  },
  custom: {
    name: 'Custom / Other Industry',
    defaultCpm: 200,
    defaultCpcInr: 25,
    defaultCpcUsd: 1.20,
    defaultCtr: 1.5,
    defaultConvRate: 3.5,
    defaultDealValueInr: 10000,
    defaultDealValueUsd: 300,
    defaultCloseRate: 20,
  },
};

const CURRENCY_CONFIG: Record<Currency, { symbol: string; label: string; rateMultiplier: number }> = {
  INR: { symbol: '₹', label: 'INR (₹)', rateMultiplier: 1 },
  USD: { symbol: '$', label: 'USD ($)', rateMultiplier: 0.012 },
  AED: { symbol: 'AED ', label: 'AED (د.إ)', rateMultiplier: 0.044 },
  GBP: { symbol: '£', label: 'GBP (£)', rateMultiplier: 0.0095 },
  EUR: { symbol: '€', label: 'EUR (€)', rateMultiplier: 0.011 },
};

export const MetaAdCostCalculatorTool: React.FC = () => {
  const [currency, setCurrency] = useState<Currency>('INR');
  const [objective, setObjective] = useState<Objective>('leads');
  const [industry, setIndustry] = useState<IndustryKey>('ecommerce');

  // Input states
  const [monthlyBudget, setMonthlyBudget] = useState<number>(50000);
  const [cpc, setCpc] = useState<number>(18);
  const [ctr, setCtr] = useState<number>(1.6);
  const [conversionRate, setConversionRate] = useState<number>(3.5);
  const [dealValue, setDealValue] = useState<number>(5000);
  const [closeRate, setCloseRate] = useState<number>(20);

  const [copied, setCopied] = useState(false);
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null);

  useEffect(() => {
    initializeAttribution();
    trackAcquisitionEvent({ event: 'tool_view', tool: 'meta-ad-cost-calculator' });
  }, []);

  // Sync inputs when industry or currency changes
  const applyIndustryDefaults = (indKey: IndustryKey, curr: Currency) => {
    const data = INDUSTRY_BENCHMARKS[indKey];
    const isUsdLike = curr !== 'INR';
    
    const suggestedCpc = isUsdLike 
      ? Math.max(0.1, Number((data.defaultCpcUsd * (curr === 'AED' ? 3.67 : curr === 'GBP' ? 0.8 : curr === 'EUR' ? 0.92 : 1)).toFixed(2)))
      : data.defaultCpcInr;

    const suggestedDeal = isUsdLike
      ? Math.max(10, Math.round(data.defaultDealValueUsd * (curr === 'AED' ? 3.67 : curr === 'GBP' ? 0.8 : curr === 'EUR' ? 0.92 : 1)))
      : data.defaultDealValueInr;

    const suggestedBudget = isUsdLike ? 1500 : 50000;

    setCpc(suggestedCpc);
    setCtr(data.defaultCtr);
    setConversionRate(data.defaultConvRate);
    setDealValue(suggestedDeal);
    setCloseRate(data.defaultCloseRate);
    setMonthlyBudget(suggestedBudget);

    if (indKey === 'ecommerce') {
      setObjective('ecommerce');
    } else {
      setObjective('leads');
    }
  };

  const handleIndustryChange = (newIndustry: IndustryKey) => {
    setIndustry(newIndustry);
    applyIndustryDefaults(newIndustry, currency);
    trackAcquisitionEvent({ 
      event: 'tool_started', 
      tool: 'meta-ad-cost-calculator', 
      metadata: { change: 'industry', industry: newIndustry } 
    });
  };

  const handleCurrencyChange = (newCurrency: Currency) => {
    setCurrency(newCurrency);
    applyIndustryDefaults(industry, newCurrency);
    trackAcquisitionEvent({ 
      event: 'tool_started', 
      tool: 'meta-ad-cost-calculator', 
      metadata: { change: 'currency', currency: newCurrency } 
    });
  };

  // Live Calculations
  const calculations = useMemo(() => {
    const safeBudget = Math.max(1, monthlyBudget);
    const safeCpc = Math.max(0.01, cpc);
    const safeCtr = Math.max(0.01, ctr);
    const safeConvRate = Math.max(0.01, conversionRate);
    const safeCloseRate = Math.max(0.01, closeRate);
    const safeDealValue = Math.max(1, dealValue);

    const estimatedClicks = Math.round(safeBudget / safeCpc);
    const estimatedImpressions = Math.round(estimatedClicks / (safeCtr / 100));
    const effectiveCpm = estimatedImpressions > 0 ? (safeBudget / estimatedImpressions) * 1000 : 0;

    if (objective === 'leads') {
      const estimatedLeads = Math.round(estimatedClicks * (safeConvRate / 100));
      const costPerLead = estimatedLeads > 0 ? safeBudget / estimatedLeads : safeBudget;
      const closedDeals = Math.round(estimatedLeads * (safeCloseRate / 100));
      const grossRevenue = closedDeals * safeDealValue;
      const roas = safeBudget > 0 ? grossRevenue / safeBudget : 0;
      const netProfit = grossRevenue - safeBudget;
      const costPerAcquisition = closedDeals > 0 ? safeBudget / closedDeals : safeBudget;

      // CHATR WhatsApp Funnel Advantage Model
      // Direct click-to-WhatsApp yields ~2.2x higher conversion vs slow web forms, cutting CPL by ~54%
      const chatrLeads = Math.round(estimatedClicks * ((safeConvRate * 2.2) / 100));
      const chatrCpl = chatrLeads > 0 ? safeBudget / chatrLeads : costPerLead * 0.46;
      const chatrDeals = Math.round(chatrLeads * (safeCloseRate / 100));
      const chatrRevenue = chatrDeals * safeDealValue;
      const chatrExtraRevenue = Math.max(0, chatrRevenue - grossRevenue);

      return {
        estimatedClicks,
        estimatedImpressions,
        effectiveCpm,
        primaryCount: estimatedLeads,
        primaryCost: costPerLead,
        primaryLabel: 'Leads Generated',
        unitCostLabel: 'Cost Per Lead (CPL)',
        customers: closedDeals,
        cpa: costPerAcquisition,
        grossRevenue,
        roas,
        netProfit,
        chatrLeads,
        chatrCpl,
        chatrDeals,
        chatrRevenue,
        chatrExtraRevenue,
      };
    } else {
      // E-commerce purchase model
      const estimatedOrders = Math.round(estimatedClicks * (safeConvRate / 100));
      const costPerAcquisition = estimatedOrders > 0 ? safeBudget / estimatedOrders : safeBudget;
      const grossRevenue = estimatedOrders * safeDealValue;
      const roas = safeBudget > 0 ? grossRevenue / safeBudget : 0;
      const netProfit = grossRevenue - safeBudget;

      // CHATR WhatsApp Cart Recovery & Instant Support Advantage
      // Instant automated WhatsApp recovery recovers ~18% of abandoned carts, lifting total orders
      const chatrOrders = Math.round(estimatedOrders * 1.35);
      const chatrRevenue = chatrOrders * safeDealValue;
      const chatrCpa = chatrOrders > 0 ? safeBudget / chatrOrders : costPerAcquisition * 0.74;
      const chatrExtraRevenue = Math.max(0, chatrRevenue - grossRevenue);

      return {
        estimatedClicks,
        estimatedImpressions,
        effectiveCpm,
        primaryCount: estimatedOrders,
        primaryCost: costPerAcquisition,
        primaryLabel: 'Orders Generated',
        unitCostLabel: 'Cost Per Acquisition (CPA)',
        customers: estimatedOrders,
        cpa: costPerAcquisition,
        grossRevenue,
        roas,
        netProfit,
        chatrLeads: chatrOrders,
        chatrCpl: chatrCpa,
        chatrDeals: chatrOrders,
        chatrRevenue,
        chatrExtraRevenue,
      };
    }
  }, [monthlyBudget, cpc, ctr, conversionRate, dealValue, closeRate, objective]);

  const currSymbol = CURRENCY_CONFIG[currency].symbol;

  const handleCopySummary = () => {
    const text = `📊 Meta Ad Cost Projection Summary (CHATR Ad Calculator)
-----------------------------------------------
• Industry: ${INDUSTRY_BENCHMARKS[industry].name}
• Objective: ${objective === 'leads' ? 'Lead Generation / WhatsApp' : 'E-Commerce Purchases'}
• Monthly Budget: ${currSymbol}${monthlyBudget.toLocaleString()}
• Estimated CPC: ${currSymbol}${cpc} (CTR: ${ctr}%)
• Estimated Impressions: ${calculations.estimatedImpressions.toLocaleString()}
• Estimated Traffic / Clicks: ${calculations.estimatedClicks.toLocaleString()}
• Projected ${calculations.primaryLabel}: ${calculations.primaryCount.toLocaleString()}
• ${calculations.unitCostLabel}: ${currSymbol}${Math.round(calculations.primaryCost).toLocaleString()}
• Projected Customers / Deals: ${calculations.customers.toLocaleString()}
• Estimated Revenue: ${currSymbol}${Math.round(calculations.grossRevenue).toLocaleString()}
• Projected ROAS: ${calculations.roas.toFixed(2)}x
• Estimated Net Profit: ${currSymbol}${Math.round(calculations.netProfit).toLocaleString()}

🚀 Projected with CHATR WhatsApp Instant AI Lead Funnel:
• Estimated ${calculations.primaryLabel}: ${calculations.chatrLeads.toLocaleString()}
• Projected Revenue: ${currSymbol}${Math.round(calculations.chatrRevenue).toLocaleString()} (+${currSymbol}${Math.round(calculations.chatrExtraRevenue).toLocaleString()})
Calculated on: https://www.chatrchat.in/tools/meta-ad-cost-calculator`;

    navigator.clipboard.writeText(text);
    setCopied(true);
    trackAcquisitionEvent({ 
      event: 'share_clicked', 
      tool: 'meta-ad-cost-calculator', 
      metadata: { action: 'copy_summary', roas: calculations.roas } 
    });
    setTimeout(() => setCopied(false), 2500);
  };

  const schemaData = {
    '@context': 'https://schema.org',
    '@type': 'WebApplication',
    name: 'Free Meta Ad Cost Calculator (Facebook & Instagram)',
    applicationCategory: 'BusinessApplication',
    url: 'https://www.chatrchat.in/tools/meta-ad-cost-calculator',
    description: 'Free Meta ad cost calculator for Facebook & Instagram. Calculate CPC, CPM, CPL, ROAS, and WhatsApp conversion rates across multiple industries and currencies.',
    operatingSystem: 'All Modern Web Browsers',
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'INR'
    }
  };

  const faqs = [
    {
      q: 'How does Meta calculate advertising costs on Facebook and Instagram?',
      a: 'Meta uses an automated ad auction system that scores each ad based on three core factors: the advertiser\'s maximum bid, estimated action rates (the likelihood a user will click or convert), and ad quality/relevance. The final cost you pay per click (CPC) or per 1,000 impressions (CPM) depends heavily on your industry competition, target audience size, seasonal demand, and historical click-through rate (CTR).'
    },
    {
      q: 'What is a good CPC and CPM for Meta Ads in 2026?',
      a: 'In 2026, benchmark costs vary widely by geography and vertical. In India, average CPM ranges between ₹140 to ₹380, with average CPC between ₹12 and ₹75. In Tier-1 international markets (US, UK, UAE), typical CPMs range from $12 to $35 with CPCs between $0.80 and $3.50. High-trust B2B SaaS and Real Estate command the highest costs, while E-Commerce and Local Services enjoy lower acquisition costs.'
    },
    {
      q: 'Why do Click-to-WhatsApp ads convert better than traditional landing page forms?',
      a: 'Traditional landing pages suffer from high mobile drop-off rates (65-75%) due to page load latency, lengthy forms, and verification friction. Click-to-WhatsApp ads open directly in the user’s preferred messaging app with zero loading wait. When paired with CHATR’s automated sub-60-second lead triage, businesses capture verified phone numbers instantly, resulting in 2x to 3x higher lead conversion rates.'
    },
    {
      q: 'What is a good ROAS (Return On Ad Spend) for Facebook & Instagram campaigns?',
      a: 'For E-Commerce brands, a healthy baseline ROAS is typically between 2.5x and 4.0x depending on your gross profit margin. For high-ticket B2B, consulting, or real estate services, ROAS can frequently exceed 5x to 10x because each qualified deal represents significant lifetime customer value.'
    },
    {
      q: 'How can I reduce my Meta ad cost per lead (CPL)?',
      a: 'To lower your CPL: (1) Improve your hook rate and creative relevance to raise CTR above 1.5%; (2) Utilize Click-to-WhatsApp or native instant lead forms to minimize drop-off; (3) Respond to inbound leads in under 5 minutes using automated triage; and (4) Build retargeting lookalike audiences from verified customer conversations.'
    }
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-white font-sans selection:bg-indigo-500 selection:text-white">
      <SEOHead
        title="Free Meta Ad Cost Calculator (Facebook & Instagram) — Estimate CPC, CPM & ROAS | CHATR"
        description="Free Meta ad cost calculator. Calculate Facebook & Instagram ad budget, CPC, CPM, expected CPL, and ROAS. Model WhatsApp lead conversion advantages instantly."
        canonicalUrl="https://www.chatrchat.in/tools/meta-ad-cost-calculator"
        keywords="meta ad cost calculator, facebook ad cost calculator, instagram ads roas calculator, cpc calculator meta, facebook ads cost estimator, cost per lead calculator facebook, chatr tools"
        schemaData={schemaData}
      />

      {/* Header */}
      <header className="border-b border-slate-800 bg-slate-950/80 sticky top-0 z-40 backdrop-blur">
        <div className="max-w-6xl mx-auto px-4 py-3.5 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2 font-bold text-base">
            <span className="bg-indigo-600 text-white px-2 py-0.5 rounded-md text-xs font-black tracking-wider">CHATR</span>
            <span className="text-slate-400 font-medium text-xs">/ Free Meta Ad Cost & ROAS Calculator</span>
          </Link>
          <div className="flex items-center gap-3">
            <Link
              to="/auth"
              onClick={() => trackAcquisitionEvent({ event: 'cta_clicked', tool: 'meta-ad-cost-calculator', metadata: { cta: 'nav_signup' } })}
              className="px-3.5 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-xs font-semibold text-white transition-colors flex items-center gap-1.5 shadow-sm"
            >
              <span>Get Started Free</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-4 py-10 space-y-10">
        {/* Hero Title */}
        <div className="text-center space-y-3 max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/30 text-indigo-300 text-xs font-bold">
            <Zap className="w-3.5 h-3.5 text-amber-400" />
            <span>Updated 2026 Meta Algorithm Benchmarks • 100% Free Tool</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-white">
            Meta Ad Cost & ROAS Calculator
          </h1>
          <p className="text-sm sm:text-base text-slate-400 leading-relaxed max-w-2xl mx-auto">
            Accurately model your Facebook & Instagram advertising budget. Estimate CPC, CPM, CPL, projected revenue, and compare traditional web forms vs Click-to-WhatsApp ROI.
          </p>

          {/* Quick Config Bar: Currency & Campaign Objective */}
          <div className="pt-3 flex flex-wrap items-center justify-center gap-3">
            {/* Currency Selector */}
            <div className="inline-flex bg-slate-900 border border-slate-800 rounded-xl p-1 gap-1">
              {(['INR', 'USD', 'AED', 'GBP', 'EUR'] as Currency[]).map((curr) => (
                <button
                  key={curr}
                  onClick={() => handleCurrencyChange(curr)}
                  className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                    currency === curr
                      ? 'bg-indigo-600 text-white shadow-md'
                      : 'text-slate-400 hover:text-white hover:bg-slate-800'
                  }`}
                >
                  {CURRENCY_CONFIG[curr].label}
                </button>
              ))}
            </div>

            {/* Campaign Objective Selector */}
            <div className="inline-flex bg-slate-900 border border-slate-800 rounded-xl p-1 gap-1">
              <button
                onClick={() => {
                  setObjective('leads');
                  trackAcquisitionEvent({ event: 'tool_started', tool: 'meta-ad-cost-calculator', metadata: { objective: 'leads' } });
                }}
                className={`px-3.5 py-1 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all ${
                  objective === 'leads'
                    ? 'bg-emerald-600 text-white shadow-md'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800'
                }`}
              >
                <MessageSquare className="w-3.5 h-3.5" />
                <span>WhatsApp / Lead Gen</span>
              </button>
              <button
                onClick={() => {
                  setObjective('ecommerce');
                  trackAcquisitionEvent({ event: 'tool_started', tool: 'meta-ad-cost-calculator', metadata: { objective: 'ecommerce' } });
                }}
                className={`px-3.5 py-1 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all ${
                  objective === 'ecommerce'
                    ? 'bg-emerald-600 text-white shadow-md'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800'
                }`}
              >
                <ShoppingCart className="w-3.5 h-3.5" />
                <span>E-Commerce Sales</span>
              </button>
            </div>
          </div>
        </div>

        {/* Industry Benchmarks Preset Selector */}
        <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-4 sm:p-5">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5 text-indigo-400" />
              <span>Select Your Industry for 2026 Calibrated Benchmarks</span>
            </span>
            <span className="text-[11px] text-slate-500 hidden sm:inline">Auto-populates CPC, CTR, and Conversion Rates</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2">
            {(Object.keys(INDUSTRY_BENCHMARKS) as IndustryKey[]).map((key) => {
              const item = INDUSTRY_BENCHMARKS[key];
              const isSelected = industry === key;
              return (
                <button
                  key={key}
                  onClick={() => handleIndustryChange(key)}
                  className={`text-left p-2.5 rounded-xl border text-xs font-medium transition-all ${
                    isSelected
                      ? 'bg-indigo-600/15 border-indigo-500 text-white ring-1 ring-indigo-500'
                      : 'bg-slate-950/60 border-slate-800 text-slate-300 hover:bg-slate-800 hover:text-white'
                  }`}
                >
                  <div className="font-semibold truncate">{item.name}</div>
                  <div className="text-[10px] text-slate-400 mt-0.5">
                    CTR: ~{item.defaultCtr}% • Conv: ~{item.defaultConvRate}%
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Calculator Main Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left Column: Interactive Input Controls */}
          <div className="lg:col-span-5 bg-slate-900 border border-slate-800 rounded-2xl p-6 sm:p-7 space-y-6 shadow-xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <Calculator className="w-4 h-4 text-indigo-400" />
                Campaign Parameters
              </h2>
              <button
                onClick={() => applyIndustryDefaults(industry, currency)}
                className="text-[11px] text-indigo-400 hover:text-indigo-300 flex items-center gap-1 font-semibold"
                title="Reset to industry standard benchmarks"
              >
                <RefreshCw className="w-3 h-3" />
                Reset Defaults
              </button>
            </div>

            <div className="space-y-5">
              {/* Monthly Ad Budget */}
              <div className="space-y-2">
                <div className="flex justify-between items-center text-xs">
                  <label className="font-semibold text-slate-300 flex items-center gap-1">
                    <DollarSign className="w-3.5 h-3.5 text-emerald-400" />
                    Monthly Ad Budget
                  </label>
                  <span className="font-bold text-emerald-400 font-mono text-sm">
                    {currSymbol}{monthlyBudget.toLocaleString()}
                  </span>
                </div>
                <input
                  type="range"
                  min={currency === 'INR' ? 5000 : 100}
                  max={currency === 'INR' ? 1000000 : 25000}
                  step={currency === 'INR' ? 2500 : 50}
                  value={monthlyBudget}
                  onChange={(e) => {
                    const val = Number(e.target.value);
                    setMonthlyBudget(val);
                    trackAcquisitionEvent({ event: 'tool_started', tool: 'meta-ad-cost-calculator', metadata: { field: 'budget', value: val } });
                  }}
                  className="w-full accent-emerald-500 cursor-pointer"
                />
                <div className="flex justify-between text-[10px] text-slate-500">
                  <span>{currSymbol}{currency === 'INR' ? '5,000' : '100'}</span>
                  <span>{currSymbol}{currency === 'INR' ? '500,000' : '10,000'}</span>
                  <span>{currSymbol}{currency === 'INR' ? '1,000,000' : '25,000'}</span>
                </div>
              </div>

              {/* Target / Expected CPC */}
              <div className="space-y-2">
                <div className="flex justify-between items-center text-xs">
                  <label className="font-semibold text-slate-300 flex items-center gap-1">
                    <MousePointer className="w-3.5 h-3.5 text-indigo-400" />
                    Estimated Cost Per Click (CPC)
                  </label>
                  <span className="font-bold text-indigo-400 font-mono text-sm">
                    {currSymbol}{cpc}
                  </span>
                </div>
                <div className="grid grid-cols-4 gap-2">
                  <input
                    type="range"
                    min={currency === 'INR' ? 2 : 0.1}
                    max={currency === 'INR' ? 200 : 8}
                    step={currency === 'INR' ? 1 : 0.05}
                    value={cpc}
                    onChange={(e) => setCpc(Number(e.target.value))}
                    className="col-span-3 accent-indigo-500 cursor-pointer"
                  />
                  <input
                    type="number"
                    min={0.01}
                    step={currency === 'INR' ? 1 : 0.05}
                    value={cpc}
                    onChange={(e) => setCpc(Math.max(0.01, Number(e.target.value)))}
                    className="col-span-1 bg-slate-950 border border-slate-800 rounded-lg p-1.5 text-xs text-center font-mono text-white"
                  />
                </div>
              </div>

              {/* Click-Through Rate (CTR) */}
              <div className="space-y-2">
                <div className="flex justify-between items-center text-xs">
                  <label className="font-semibold text-slate-300 flex items-center gap-1">
                    <Eye className="w-3.5 h-3.5 text-cyan-400" />
                    Ad Click-Through Rate (CTR)
                  </label>
                  <span className="font-bold text-cyan-400 font-mono text-sm">
                    {ctr}%
                  </span>
                </div>
                <div className="grid grid-cols-4 gap-2">
                  <input
                    type="range"
                    min={0.2}
                    max={6.0}
                    step={0.1}
                    value={ctr}
                    onChange={(e) => setCtr(Number(e.target.value))}
                    className="col-span-3 accent-cyan-500 cursor-pointer"
                  />
                  <input
                    type="number"
                    min={0.1}
                    max={20}
                    step={0.1}
                    value={ctr}
                    onChange={(e) => setCtr(Math.max(0.1, Number(e.target.value)))}
                    className="col-span-1 bg-slate-950 border border-slate-800 rounded-lg p-1.5 text-xs text-center font-mono text-white"
                  />
                </div>
                <p className="text-[10px] text-slate-500">Benchmark: 1.0% (Average) — 2.2%+ (High Relevance)</p>
              </div>

              {/* Destination Conversion Rate */}
              <div className="space-y-2">
                <div className="flex justify-between items-center text-xs">
                  <label className="font-semibold text-slate-300 flex items-center gap-1">
                    <Target className="w-3.5 h-3.5 text-amber-400" />
                    {objective === 'leads' ? 'Visitor → Lead Conversion Rate' : 'Storefront Purchase Rate'}
                  </label>
                  <span className="font-bold text-amber-400 font-mono text-sm">
                    {conversionRate}%
                  </span>
                </div>
                <div className="grid grid-cols-4 gap-2">
                  <input
                    type="range"
                    min={0.5}
                    max={15.0}
                    step={0.2}
                    value={conversionRate}
                    onChange={(e) => setConversionRate(Number(e.target.value))}
                    className="col-span-3 accent-amber-500 cursor-pointer"
                  />
                  <input
                    type="number"
                    min={0.1}
                    max={50}
                    step={0.1}
                    value={conversionRate}
                    onChange={(e) => setConversionRate(Math.max(0.1, Number(e.target.value)))}
                    className="col-span-1 bg-slate-950 border border-slate-800 rounded-lg p-1.5 text-xs text-center font-mono text-white"
                  />
                </div>
                <p className="text-[10px] text-slate-500">
                  {objective === 'leads'
                    ? 'Traditional web forms: 2-4% • Click-to-WhatsApp: 6-12%'
                    : 'Standard E-Commerce conversion rate: 1.8% - 3.5%'}
                </p>
              </div>

              {/* Average Deal Value / Customer LTV */}
              <div className="space-y-2">
                <div className="flex justify-between items-center text-xs">
                  <label className="font-semibold text-slate-300">
                    {objective === 'leads' ? 'Average Deal Value / Client Value' : 'Average Order Value (AOV)'}
                  </label>
                  <span className="font-bold text-emerald-400 font-mono text-sm">
                    {currSymbol}{dealValue.toLocaleString()}
                  </span>
                </div>
                <input
                  type="number"
                  min={1}
                  step={currency === 'INR' ? 500 : 10}
                  value={dealValue}
                  onChange={(e) => setDealValue(Math.max(1, Number(e.target.value)))}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-slate-200 focus:outline-none focus:border-indigo-500 font-mono"
                  placeholder="e.g. 15000"
                />
              </div>

              {/* Lead Gen Close Rate (Only visible for Leads Objective) */}
              {objective === 'leads' && (
                <div className="space-y-2">
                  <div className="flex justify-between items-center text-xs">
                    <label className="font-semibold text-slate-300">
                      Sales Team Lead-to-Customer Close Rate
                    </label>
                    <span className="font-bold text-violet-400 font-mono text-sm">
                      {closeRate}%
                    </span>
                  </div>
                  <input
                    type="range"
                    min={1}
                    max={60}
                    step={1}
                    value={closeRate}
                    onChange={(e) => setCloseRate(Number(e.target.value))}
                    className="w-full accent-violet-500 cursor-pointer"
                  />
                  <p className="text-[10px] text-slate-500">
                    Percentage of captured leads your sales reps successfully convert into paying clients.
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Right Column: Calculated Real-Time Metrics & CHATR Advantage */}
          <div className="lg:col-span-7 space-y-6">
            {/* Top Primary Outcome Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {/* ROAS Card */}
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 space-y-1">
                <div className="text-[11px] font-bold uppercase text-slate-400 flex items-center gap-1">
                  <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Projected ROAS</span>
                </div>
                <div className={`text-2xl sm:text-3xl font-black font-mono ${calculations.roas >= 2.5 ? 'text-emerald-400' : calculations.roas >= 1.0 ? 'text-amber-400' : 'text-rose-400'}`}>
                  {calculations.roas.toFixed(2)}x
                </div>
                <div className="text-[10px] text-slate-500">Return on Ad Spend</div>
              </div>

              {/* Primary Volume (Leads or Orders) */}
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 space-y-1">
                <div className="text-[11px] font-bold uppercase text-slate-400 flex items-center gap-1">
                  <Target className="w-3.5 h-3.5 text-indigo-400" />
                  <span>{objective === 'leads' ? 'Total Leads' : 'Total Orders'}</span>
                </div>
                <div className="text-2xl sm:text-3xl font-black text-indigo-300 font-mono">
                  {calculations.primaryCount.toLocaleString()}
                </div>
                <div className="text-[10px] text-slate-500">Estimated volume</div>
              </div>

              {/* Unit Cost (CPL or CPA) */}
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 space-y-1">
                <div className="text-[11px] font-bold uppercase text-slate-400 flex items-center gap-1">
                  <DollarSign className="w-3.5 h-3.5 text-cyan-400" />
                  <span>{calculations.unitCostLabel.split(' ')[0]} {calculations.unitCostLabel.split(' ')[1]}</span>
                </div>
                <div className="text-xl sm:text-2xl font-black text-cyan-300 font-mono">
                  {currSymbol}{Math.round(calculations.primaryCost).toLocaleString()}
                </div>
                <div className="text-[10px] text-slate-500">{calculations.unitCostLabel}</div>
              </div>

              {/* Net Profit */}
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 space-y-1">
                <div className="text-[11px] font-bold uppercase text-slate-400 flex items-center gap-1">
                  <BarChart3 className="w-3.5 h-3.5 text-amber-400" />
                  <span>Net Return</span>
                </div>
                <div className={`text-xl sm:text-2xl font-black font-mono truncate ${calculations.netProfit >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                  {currSymbol}{Math.round(calculations.netProfit).toLocaleString()}
                </div>
                <div className="text-[10px] text-slate-500">After ad spend</div>
              </div>
            </div>

            {/* Granular Funnel Breakdown Box */}
            <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 sm:p-6 space-y-4 shadow-xl">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center justify-between">
                <span>Estimated Full Funnel Breakdown</span>
                <span className="text-xs text-slate-400 font-normal">Based on {currSymbol}{monthlyBudget.toLocaleString()} spend</span>
              </h3>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-1">
                <div className="bg-slate-950 border border-slate-800/80 rounded-xl p-3">
                  <span className="text-[11px] text-slate-400 block">Total Impressions</span>
                  <span className="text-base font-bold text-slate-200 font-mono">
                    {calculations.estimatedImpressions.toLocaleString()}
                  </span>
                </div>

                <div className="bg-slate-950 border border-slate-800/80 rounded-xl p-3">
                  <span className="text-[11px] text-slate-400 block">Total Clicks (Traffic)</span>
                  <span className="text-base font-bold text-slate-200 font-mono">
                    {calculations.estimatedClicks.toLocaleString()}
                  </span>
                </div>

                <div className="bg-slate-950 border border-slate-800/80 rounded-xl p-3">
                  <span className="text-[11px] text-slate-400 block">Effective CPM</span>
                  <span className="text-base font-bold text-slate-200 font-mono">
                    {currSymbol}{calculations.effectiveCpm.toFixed(2)}
                  </span>
                </div>

                <div className="bg-slate-950 border border-slate-800/80 rounded-xl p-3">
                  <span className="text-[11px] text-slate-400 block">Total Revenue</span>
                  <span className="text-base font-bold text-emerald-400 font-mono">
                    {currSymbol}{Math.round(calculations.grossRevenue).toLocaleString()}
                  </span>
                </div>

                <div className="bg-slate-950 border border-slate-800/80 rounded-xl p-3">
                  <span className="text-[11px] text-slate-400 block">Paying Customers / Sales</span>
                  <span className="text-base font-bold text-slate-200 font-mono">
                    {calculations.customers.toLocaleString()}
                  </span>
                </div>

                <div className="bg-slate-950 border border-slate-800/80 rounded-xl p-3">
                  <span className="text-[11px] text-slate-400 block">Cost Per Customer (CPA)</span>
                  <span className="text-base font-bold text-slate-200 font-mono">
                    {currSymbol}{Math.round(calculations.cpa).toLocaleString()}
                  </span>
                </div>
              </div>
            </div>

            {/* THE CHATR GAMECHANGER: WhatsApp Instant AI Funnel Advantage */}
            <div className="bg-gradient-to-br from-emerald-950/40 via-slate-900 to-indigo-950/40 border border-emerald-500/30 rounded-2xl p-5 sm:p-6 space-y-4 shadow-xl">
              <div className="flex items-start justify-between gap-3">
                <div className="space-y-1">
                  <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px] font-bold uppercase tracking-wider">
                    <Sparkles className="w-3 h-3 text-emerald-400" />
                    <span>The CHATR Multiplier Effect</span>
                  </div>
                  <h4 className="text-base sm:text-lg font-bold text-white">
                    Traditional Web Form vs Click-to-WhatsApp Flow
                  </h4>
                </div>
                <div className="text-right">
                  <span className="text-emerald-400 font-extrabold text-sm sm:text-base font-mono">
                    +{currSymbol}{Math.round(calculations.chatrExtraRevenue).toLocaleString()}
                  </span>
                  <span className="text-[10px] text-slate-400 block">Est. Revenue Lift</span>
                </div>
              </div>

              <p className="text-xs text-slate-300 leading-relaxed">
                Traditional mobile web forms lose up to <strong>70% of inbound Meta traffic</strong> to landing page latency and form hesitation. Running Meta <strong>Click-to-WhatsApp Ads</strong> connected to CHATR’s automated sub-60-second qualification engine recaptures those high-intent prospects.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                {/* Traditional Form Card */}
                <div className="bg-slate-950/90 border border-slate-800 rounded-xl p-3.5 space-y-2">
                  <div className="text-xs font-semibold text-slate-400 flex items-center justify-between">
                    <span>Traditional Web Page</span>
                    <span className="text-[10px] text-rose-400 font-bold">Standard</span>
                  </div>
                  <div className="text-lg font-bold text-white font-mono">
                    {calculations.primaryCount.toLocaleString()} {objective === 'leads' ? 'leads' : 'orders'}
                  </div>
                  <div className="text-[11px] text-slate-400">
                    CPL: {currSymbol}{Math.round(calculations.primaryCost).toLocaleString()} • Response SLA: ~4 Hours
                  </div>
                </div>

                {/* CHATR WhatsApp Card */}
                <div className="bg-emerald-950/40 border border-emerald-500/40 rounded-xl p-3.5 space-y-2">
                  <div className="text-xs font-semibold text-emerald-300 flex items-center justify-between">
                    <span>CHATR WhatsApp Funnel</span>
                    <span className="text-[10px] bg-emerald-500/20 text-emerald-300 px-1.5 py-0.5 rounded font-bold">2.2x Yield</span>
                  </div>
                  <div className="text-lg font-bold text-emerald-300 font-mono">
                    {calculations.chatrLeads.toLocaleString()} {objective === 'leads' ? 'leads' : 'orders'}
                  </div>
                  <div className="text-[11px] text-emerald-400/90">
                    CPL: {currSymbol}{Math.round(calculations.chatrCpl).toLocaleString()} • Response SLA: &lt;60 Seconds
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-2 flex flex-col sm:flex-row items-center gap-3">
                <button
                  onClick={handleCopySummary}
                  className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center justify-center gap-2 transition-colors border border-slate-700"
                >
                  {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                  <span>{copied ? 'Summary Copied to Clipboard!' : 'Copy Calculation Summary'}</span>
                </button>

                <Link
                  to="/auth"
                  onClick={() => trackAcquisitionEvent({ 
                    event: 'cta_clicked', 
                    tool: 'meta-ad-cost-calculator', 
                    metadata: { cta: 'connect_meta_whatsapp', roas: calculations.roas } 
                  })}
                  className="w-full sm:flex-1 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center justify-center gap-2 transition-all shadow-lg shadow-emerald-600/20"
                >
                  <span>Connect WhatsApp Ads to CHATR (Free)</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Industry Benchmarks Reference Table */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 sm:p-8 space-y-5 shadow-xl">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-indigo-400" />
                2026 Meta Ads Industry Benchmarks (Facebook & Instagram)
              </h3>
              <p className="text-xs text-slate-400">
                Empirical advertising benchmarks compiled across active B2B, E-Commerce, and Service campaigns.
              </p>
            </div>
            <div className="text-xs font-mono text-slate-500">
              Currency: <strong className="text-slate-300">{currency}</strong>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-950/80 text-[11px] uppercase tracking-wider text-slate-400 border-b border-slate-800">
                <tr>
                  <th className="py-3 px-3">Industry Vertical</th>
                  <th className="py-3 px-3">Avg CPC</th>
                  <th className="py-3 px-3">Avg CTR</th>
                  <th className="py-3 px-3">Conv. Rate</th>
                  <th className="py-3 px-3">Est. CPL / CPA</th>
                  <th className="py-3 px-3">Typical Target ROAS</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-mono text-[11px]">
                {(Object.keys(INDUSTRY_BENCHMARKS) as IndustryKey[]).filter(k => k !== 'custom').map((k) => {
                  const b = INDUSTRY_BENCHMARKS[k];
                  const isCurrent = industry === k;
                  const cpcVal = currency === 'INR' ? b.defaultCpcInr : (b.defaultCpcUsd * (currency === 'AED' ? 3.67 : currency === 'GBP' ? 0.8 : currency === 'EUR' ? 0.92 : 1)).toFixed(2);
                  const cplVal = currency === 'INR' 
                    ? Math.round(b.defaultCpcInr / (b.defaultConvRate / 100))
                    : (Number(cpcVal) / (b.defaultConvRate / 100)).toFixed(1);

                  return (
                    <tr key={k} className={`hover:bg-slate-800/40 transition-colors ${isCurrent ? 'bg-indigo-950/20 font-bold text-white' : ''}`}>
                      <td className="py-3 px-3 font-sans flex items-center gap-2">
                        {isCurrent && <span className="w-1.5 h-1.5 rounded-full bg-indigo-400"></span>}
                        {b.name}
                      </td>
                      <td className="py-3 px-3">{currSymbol}{cpcVal}</td>
                      <td className="py-3 px-3 text-cyan-400">{b.defaultCtr}%</td>
                      <td className="py-3 px-3 text-amber-400">{b.defaultConvRate}%</td>
                      <td className="py-3 px-3 text-emerald-400">{currSymbol}{cplVal}</td>
                      <td className="py-3 px-3 text-indigo-300">{k === 'ecommerce' ? '3.0x - 4.5x' : '4.0x - 8.0x'}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* 5 Growth Strategies to Lower Meta Ad Cost */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-2.5">
            <div className="w-8 h-8 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center font-bold text-xs">
              01
            </div>
            <h4 className="text-sm font-bold text-white">Cut Mobile Landing Page Latency</h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              Every 1-second delay in mobile website loading reduces conversion rates by 7%. Direct WhatsApp ads eliminate mobile browser drop-off completely.
            </p>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-2.5">
            <div className="w-8 h-8 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold text-xs">
              02
            </div>
            <h4 className="text-sm font-bold text-white">Automate Sub-60-Second Lead Triage</h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              Leads contacted within 5 minutes are 21x more likely to enter the sales pipeline than those contacted after 30 minutes. Use CHATR to route and qualify instantly.
            </p>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-2.5">
            <div className="w-8 h-8 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 flex items-center justify-center font-bold text-xs">
              03
            </div>
            <h4 className="text-sm font-bold text-white">Optimize Ad Hook Rate (&gt;30%)</h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              Higher 3-second video hook rates increase Meta relevance scores, which directly drops your CPM by up to 35% in competitive auctions.
            </p>
          </div>
        </div>

        {/* FAQ Section */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 sm:p-8 space-y-6 shadow-xl">
          <div className="space-y-1">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <HelpCircle className="w-5 h-5 text-indigo-400" />
              Frequently Asked Questions About Meta Ad Costs
            </h3>
            <p className="text-xs text-slate-400">
              Clear answers to help you budget and maximize return on Facebook & Instagram advertising.
            </p>
          </div>

          <div className="space-y-3">
            {faqs.map((faq, idx) => {
              const isExpanded = expandedFaq === idx;
              return (
                <div
                  key={idx}
                  className="border border-slate-800 rounded-xl overflow-hidden bg-slate-950/60 transition-colors"
                >
                  <button
                    onClick={() => setExpandedFaq(isExpanded ? null : idx)}
                    className="w-full text-left p-4 flex items-center justify-between gap-4 text-xs sm:text-sm font-semibold text-slate-200 hover:text-white"
                  >
                    <span>{faq.q}</span>
                    {isExpanded ? (
                      <ChevronUp className="w-4 h-4 text-indigo-400 shrink-0" />
                    ) : (
                      <ChevronDown className="w-4 h-4 text-slate-500 shrink-0" />
                    )}
                  </button>
                  {isExpanded && (
                    <div className="p-4 pt-0 text-xs text-slate-400 leading-relaxed border-t border-slate-800/60 bg-slate-900/30">
                      {faq.a}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Bottom Call to Action Banner */}
        <div className="bg-gradient-to-r from-indigo-900/60 via-slate-900 to-emerald-900/60 border border-indigo-500/30 rounded-2xl p-6 sm:p-10 text-center space-y-4">
          <h3 className="text-2xl sm:text-3xl font-extrabold text-white">
            Stop Burning Meta Ad Spend on Lost Leads
          </h3>
          <p className="text-xs sm:text-sm text-slate-300 max-w-xl mx-auto leading-relaxed">
            Connect your Facebook & Instagram Click-to-WhatsApp ads to CHATR. Auto-triage leads, assign conversations round-robin to your sales team, and close deals in under 60 seconds.
          </p>
          <div className="pt-2 flex flex-wrap items-center justify-center gap-3">
            <Link
              to="/auth"
              onClick={() => trackAcquisitionEvent({ event: 'cta_clicked', tool: 'meta-ad-cost-calculator', metadata: { cta: 'footer_signup' } })}
              className="px-6 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs flex items-center gap-2 transition-all shadow-lg shadow-indigo-600/30"
            >
              <span>Start Free Trial — No Credit Card</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              to="/tools/whatsapp-link-generator"
              className="px-5 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs transition-colors border border-slate-700"
            >
              Try Free WhatsApp Link Generator →
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
};

export default MetaAdCostCalculatorTool;
