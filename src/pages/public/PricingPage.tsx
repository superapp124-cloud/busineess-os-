import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, CheckCircle2, ShieldCheck, Zap, Sparkles, HelpCircle, ChevronDown, Layers } from 'lucide-react';
import { SEOHead } from '@/components/SEOHead';

export const PricingPage: React.FC = () => {
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const businessOsPlans = [
    {
      name: 'Free Trial',
      price: '₹0',
      period: '14-day full access',
      description: 'Ideal for small teams evaluating CHATR Communication OS.',
      badge: 'Getting Started',
      features: [
        'Single WhatsApp Business API number',
        'Universal Team Inbox (WhatsApp + Email)',
        'Basic AI Lead Triage & Greetings',
        'Up to 3 team seats',
        'Standard community support'
      ],
      ctaText: 'Start 14-Day Free Trial',
      ctaLink: '/auth',
      highlighted: false
    },
    {
      name: 'Starter SME OS',
      price: '₹999',
      period: 'per month',
      description: 'Essential multi-channel messaging for growing SMEs in India.',
      badge: 'Popular for SMEs',
      features: [
        'Everything in Free Trial',
        'WhatsApp Business API shared inbox',
        'Automated 5-minute lead response auto-responder',
        'Basic candidate screening workflows',
        'Up to 5 team seats included',
        'Email & chat support'
      ],
      ctaText: 'Get Started Free',
      ctaLink: '/auth',
      highlighted: true
    },
    {
      name: 'Growth & Team OS',
      price: '₹2,999',
      period: 'per month',
      description: 'Advanced team collaboration, AI triage, and multi-location management.',
      badge: 'High Concurrency',
      features: [
        'Everything in Starter SME OS',
        'Multi-account & multi-branch WhatsApp management',
        'AI Conversation Summarization & intent tagging',
        'Recruiter candidate screening pipeline',
        'Agent collision locks & typing indicators',
        'Manager SLA performance analytics',
        'Priority 24/7 support'
      ],
      ctaText: 'Upgrade to Growth OS',
      ctaLink: '/auth',
      highlighted: false
    }
  ];

  const desktopProPlan = {
    name: 'CHATR AI Executive Desktop (Pro App)',
    monthlyPrice: '$19',
    annualPrice: '$15',
    description: 'Personal AI executive assistant app for desktop & mobile power users.',
    features: [
      'Unlimited local private AI model (Ollama) usage',
      'Voice Clone setup & hosting',
      '5 Burner Numbers per month',
      'Cross-platform sync (Windows, macOS, Mobile)',
      'Priority execution queue & security vault'
    ]
  };

  const faqs = [
    {
      q: 'Does CHATR offer a free trial?',
      a: 'Yes. All CHATR Business OS plans include a 14-day free trial with no upfront credit card commitment. You can set up your team workspace, connect channels, and evaluate features immediately.'
    },
    {
      q: 'What is the difference between Business OS plans (in INR) and Desktop Pro (in USD)?',
      a: 'Business OS plans (₹999/mo - ₹2,999/mo) are designed for business teams managing shared WhatsApp Business numbers, customer support, and recruitment pipelines. The Desktop Pro plan ($15/mo - $19/mo) is a personal executive assistant app subscription for individual power users.'
    },
    {
      q: 'Can I add extra team members to my workspace?',
      a: 'Yes. Additional seat licenses can be added to your Business OS workspace at any time directly inside Team Settings.'
    },
    {
      q: 'Are there any hidden API fees for WhatsApp Business?',
      a: 'CHATR provides transparent WhatsApp Business API connection. Meta conversation charges (if applicable) are billed at standard Meta rate cards with zero markup.'
    }
  ];

  return (
    <>
      <SEOHead
        title="CHATR Pricing — Commercial Plans & Free Trial"
        description="Simple, transparent pricing for CHATR Business OS and AI Workspace. Explore free trial, SME Starter plans from ₹999/mo, Growth OS, and Desktop Pro options."
      />
      <div className="min-h-screen bg-slate-950 text-white font-sans">
        {/* Header */}
        <header className="border-b border-slate-800 bg-slate-950/80 sticky top-0 z-40 backdrop-blur">
          <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
            <Link to="/" className="flex items-center gap-2 text-indigo-400 font-extrabold text-lg tracking-tight">
              <Sparkles className="w-5 h-5 text-indigo-400" /> CHATR Pricing
            </Link>
            <div className="flex items-center gap-4">
              <Link to="/chatr/ai" className="text-xs text-slate-300 hover:text-white transition-colors font-medium">CHATR AI</Link>
              <Link to="/auth" id="pricing-header-cta" className="text-xs bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2 rounded-lg font-semibold transition-colors">
                Get Started Free
              </Link>
            </div>
          </div>
        </header>

        <main className="max-w-6xl mx-auto px-4 py-12 space-y-16">
          {/* Hero Section */}
          <section className="text-center space-y-4 max-w-3xl mx-auto">
            <div className="inline-flex items-center gap-2 bg-indigo-950/60 border border-indigo-500/30 px-4 py-1.5 rounded-full text-indigo-400 text-xs font-semibold">
              <Zap className="w-3.5 h-3.5" /> Transparent Business Pricing
            </div>
            <h1 className="text-4xl md:text-5xl font-black leading-tight bg-gradient-to-r from-white via-slate-100 to-indigo-200 bg-clip-text text-transparent">
              Simple Plans for Teams & Power Users
            </h1>
            <p className="text-slate-300 text-base md:text-lg leading-relaxed">
              Start with a 14-day free trial. Scale seamlessly as your customer message volume and recruitment pipelines grow.
            </p>
          </section>

          {/* Section 1: Business OS Plans (SME & Team Edition) */}
          <section className="space-y-8">
            <div className="text-center space-y-2">
              <h2 className="text-2xl md:text-3xl font-extrabold text-white">CHATR Business OS Plans</h2>
              <p className="text-slate-400 text-sm max-w-xl mx-auto">
                Shared WhatsApp Business inbox, universal messaging, and candidate screening for teams.
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-6">
              {businessOsPlans.map((plan, i) => (
                <div
                  key={i}
                  className={`rounded-2xl p-6 space-y-6 flex flex-col justify-between transition-all ${
                    plan.highlighted
                      ? 'bg-slate-900 border-2 border-indigo-500 shadow-xl shadow-indigo-500/10'
                      : 'bg-slate-900/60 border border-slate-800'
                  }`}
                >
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] uppercase font-bold tracking-wider text-indigo-400 bg-indigo-950/80 border border-indigo-500/30 px-2.5 py-0.5 rounded-full">
                        {plan.badge}
                      </span>
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-white">{plan.name}</h3>
                      <p className="text-slate-400 text-xs mt-1">{plan.description}</p>
                    </div>

                    <div className="pt-2 border-t border-slate-800 flex items-baseline gap-2">
                      <span className="text-3xl font-black text-white">{plan.price}</span>
                      <span className="text-slate-400 text-xs font-medium">{plan.period}</span>
                    </div>

                    <div className="space-y-2.5 pt-2 text-xs">
                      {plan.features.map((feat, idx) => (
                        <div key={idx} className="flex items-start gap-2.5 text-slate-300">
                          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                          <span>{feat}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="pt-4 border-t border-slate-800">
                    <Link
                      to={plan.ctaLink}
                      id={`pricing-plan-cta-${i}`}
                      className={`w-full py-3 rounded-xl font-semibold text-xs transition-colors inline-flex items-center justify-center gap-2 ${
                        plan.highlighted
                          ? 'bg-indigo-600 hover:bg-indigo-500 text-white'
                          : 'bg-slate-800 hover:bg-slate-700 text-slate-200'
                      }`}
                    >
                      {plan.ctaText} <ArrowRight className="w-4 h-4" />
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Section 2: Personal AI Executive Desktop Edition */}
          <section className="bg-slate-900/80 border border-slate-800 rounded-2xl p-8 space-y-6">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 pb-6 border-b border-slate-800">
              <div className="space-y-2 max-w-xl">
                <span className="text-[10px] uppercase font-bold tracking-wider text-purple-400 bg-purple-950/60 border border-purple-500/30 px-3 py-1 rounded-full">
                  Personal AI App Edition
                </span>
                <h3 className="text-2xl font-bold text-white">{desktopProPlan.name}</h3>
                <p className="text-slate-300 text-xs leading-relaxed">{desktopProPlan.description}</p>
              </div>

              <div className="text-left md:text-right shrink-0">
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl font-black text-white">{desktopProPlan.annualPrice}</span>
                  <span className="text-slate-400 text-xs font-medium">/mo (Billed $180/yr)</span>
                </div>
                <p className="text-slate-400 text-[11px] mt-0.5">Or {desktopProPlan.monthlyPrice}/mo billed monthly</p>
              </div>
            </div>

            <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4 text-xs text-slate-300">
              {desktopProPlan.features.map((feat, idx) => (
                <div key={idx} className="flex items-center gap-2.5 bg-slate-950 p-3 rounded-xl border border-slate-800">
                  <CheckCircle2 className="w-4 h-4 text-purple-400 shrink-0" />
                  <span>{feat}</span>
                </div>
              ))}
            </div>

            <div className="pt-2 flex items-center justify-between">
              <Link to="/auth" id="pricing-desktop-pro-cta" className="bg-purple-600 hover:bg-purple-500 text-white font-semibold px-6 py-2.5 rounded-xl text-xs inline-flex items-center gap-2">
                Get Desktop Pro <ArrowRight className="w-4 h-4" />
              </Link>
              <div className="flex items-center gap-2 text-xs text-slate-400">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span>256-Bit Encrypted Subscription</span>
              </div>
            </div>
          </section>

          {/* FAQ Section */}
          <section className="bg-slate-900 border border-slate-800 rounded-2xl p-6 sm:p-8 space-y-6">
            <h2 className="text-xl font-bold text-white">Frequently Asked Pricing Questions</h2>
            <div className="space-y-3">
              {faqs.map((faq, i) => (
                <div key={i} className="border border-slate-800 rounded-xl overflow-hidden bg-slate-950">
                  <button
                    onClick={() => setOpenFaq(openFaq === i ? null : i)}
                    className="w-full p-4 text-left flex items-center justify-between gap-4 hover:bg-slate-900/50 transition-colors"
                  >
                    <span className="font-semibold text-sm text-slate-200">{faq.q}</span>
                    <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform ${openFaq === i ? 'rotate-180' : ''}`} />
                  </button>
                  {openFaq === i && (
                    <div className="p-4 pt-0 text-xs text-slate-400 leading-relaxed border-t border-slate-800/60 bg-slate-900/20">
                      {faq.a}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </section>

          {/* Bottom CTA Card */}
          <section className="bg-gradient-to-r from-indigo-900/40 via-indigo-800/20 to-indigo-900/40 border border-indigo-500/30 rounded-2xl p-8 text-center space-y-4">
            <h2 className="text-2xl font-bold text-white">Ready to Transform Your Business Messaging?</h2>
            <p className="text-slate-300 text-sm max-w-md mx-auto">
              Join over 325 active business teams in India using CHATR Communication OS.
            </p>
            <Link to="/auth" id="pricing-footer-cta" className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold px-8 py-3 rounded-xl transition-colors text-sm">
              Start 14-Day Free Trial <ArrowRight className="w-4 h-4" />
            </Link>
          </section>
        </main>
      </div>
    </>
  );
};

export default PricingPage;
