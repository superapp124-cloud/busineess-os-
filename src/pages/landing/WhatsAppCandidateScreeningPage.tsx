import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { supabase } from '@/integrations/supabase/client';
import {
  MessageSquare, CheckCircle2, ArrowRight, ShieldCheck, Zap, Users, Sparkles,
  Bot, Clock, TrendingUp, Check, ChevronDown, ChevronUp, FileText, Send, Building, Mail, Phone, User
} from 'lucide-react';
import { toast } from 'sonner';

export const WhatsAppCandidateScreeningPage: React.FC = () => {
  const [candidatesPerMonth, setCandidatesPerMonth] = useState<number>(500);
  const [openFaq, setOpenFaq] = useState<number | null>(0);
  const [showDemoModal, setShowDemoModal] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<'screening' | 'parsing' | 'scheduling'>('screening');
  const [leadForm, setLeadForm] = useState({
    name: '',
    email: '',
    company: '',
    phone: '',
    teamSize: '10-50'
  });
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  // Attribution resolution
  const resolveAttribution = () => {
    const urlParams = new URLSearchParams(window.location.search);
    const utmSource = urlParams.get('utm_source');
    const utmMedium = urlParams.get('utm_medium');
    const referrer = document.referrer.toLowerCase();

    let channel = 'seo';
    let source = 'google';

    if (utmSource) {
      source = utmSource;
      channel = (utmMedium || '').includes('cpc') ? 'paid_search' : 'seo';
    } else if (referrer.includes('google')) {
      source = 'google';
      channel = 'seo';
    } else if (referrer.includes('bing') || referrer.includes('duckduckgo')) {
      source = 'search_engine';
      channel = 'seo';
    } else {
      source = 'google_organic';
      channel = 'seo';
    }

    return { channel, source };
  };

  // Visitor telemetry
  useEffect(() => {
    const trackVisitor = async () => {
      try {
        const attribution = resolveAttribution();

        await supabase.from('cc_logs').insert({
          agent: 'web_sensor',
          action: `Organic Visit event on chatr.chat from ${attribution.source} for "whatsapp candidate screening"`,
          level: 'info',
          details: {
            domain: 'chatr.chat',
            channel: attribution.channel,
            source: attribution.source,
            landing_page: '/chatr/whatsapp-candidate-screening',
            campaign_id: 'seo_mission_001',
            referrer: document.referrer || 'direct'
          }
        });
      } catch (e) {
        console.error('Visitor telemetry tracking error:', e);
      }
    };
    trackVisitor();
  }, []);

  const handleLeadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!leadForm.name || !leadForm.email || !leadForm.company) {
      toast.error('Please fill in your name, work email, and company.');
      return;
    }

    setIsSubmitting(true);
    try {
      const attribution = resolveAttribution();

      await supabase.from('cc_leads').insert({
        full_name: leadForm.name,
        company: leadForm.company,
        email: leadForm.email,
        phone: leadForm.phone,
        industry: 'Recruitment & HR Tech',
        status: 'new',
        source: attribution.channel,
        target_domain: 'chatr.chat',
        role_title: `Team Size: ${leadForm.teamSize}`
      });

      toast.success('Demo workspace initialized! A CHATR recruitment specialist will connect over WhatsApp shortly.');
      setShowDemoModal(false);
      setLeadForm({ name: '', email: '', company: '', phone: '', teamSize: '10-50' });
    } catch (e: any) {
      toast.error('Submission error: ' + (e?.message || 'Please try again.'));
    } finally {
      setIsSubmitting(false);
    }
  };

  // ROI Math
  const hoursSavedPerMonth = Math.round((candidatesPerMonth * 15) / 60); // 15 mins saved per candidate
  const costSavedPerMonth = Math.round(hoursSavedPerMonth * 450); // ₹450 / hour recruiter cost

  const faqs = [
    {
      q: 'How does WhatsApp Candidate Screening work?',
      a: 'When job candidates apply via your career portal, job boards, or QR codes, CHATR instantly initiates an automated, conversational screening session on WhatsApp using official Meta Cloud APIs. The AI asks customized qualification questions, accepts resume uploads, and evaluates candidate fit within 2 minutes.'
    },
    {
      q: 'Is CHATR compliant with Meta WhatsApp Cloud API policies?',
      a: 'Yes, CHATR utilizes official Meta-approved WhatsApp Cloud API templates and interactive messaging buttons. Every candidate interaction is opt-in, encrypted, and strictly compliant with Meta messaging guidelines.'
    },
    {
      q: 'Can CHATR parse candidate resumes sent via WhatsApp?',
      a: 'Yes! When a candidate uploads a PDF or Word CV in the WhatsApp chat, CHATR AI OCR parses key skills, work history, education, and contact details automatically, creating a structured candidate profile in your Universal Inbox.'
    },
    {
      q: 'How does interview scheduling work over WhatsApp?',
      a: 'Once a candidate passes your automated qualification threshold, CHATR presents available interview time slots directly inside the WhatsApp conversation. Candidates select a slot, and calendar invites are automatically dispatched to both the candidate and the interviewing manager.'
    },
    {
      q: 'Can my human recruitment team step into the chat anytime?',
      a: 'Absolutely. The CHATR Universal Inbox allows human recruiters to monitor automated screening sessions in real time and take over conversations with one click whenever high-priority talent responds.'
    }
  ];

  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    'mainEntity': faqs.map(item => ({
      '@type': 'Question',
      'name': item.q,
      'acceptedAnswer': {
        '@type': 'Answer',
        'text': item.a
      }
    }))
  };

  const softwareSchema = {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    'name': 'CHATR WhatsApp Candidate Screening Engine',
    'operatingSystem': 'Web, Android, iOS, Windows, macOS',
    'applicationCategory': 'BusinessApplication',
    'description': 'Automated initial candidate screening, AI resume OCR parsing, and interview scheduling over official Meta WhatsApp Cloud API.',
    'url': 'https://chatr.chat/chatr/whatsapp-candidate-screening',
    'offers': {
      '@type': 'Offer',
      'price': '0',
      'priceCurrency': 'INR'
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans selection:bg-emerald-500 selection:text-slate-950">
      <Helmet>
        <title>WhatsApp Candidate Screening & AI Universal Inbox | CHATR</title>
        <meta name="description" content="Automate candidate screening, AI resume parsing, and interview scheduling on official Meta WhatsApp Cloud API. Achieve 98% candidate response rates with CHATR." />
        <link rel="canonical" href="https://chatr.chat/chatr/whatsapp-candidate-screening" />
        <meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1" />

        {/* Open Graph / Social */}
        <meta property="og:title" content="WhatsApp Candidate Screening & AI Universal Inbox | CHATR" />
        <meta property="og:description" content="Automate candidate screening & resume parsing over WhatsApp. 98% candidate response rates for high-velocity hiring." />
        <meta property="og:url" content="https://chatr.chat/chatr/whatsapp-candidate-screening" />
        <meta property="og:type" content="website" />
        <meta property="og:site_name" content="CHATR" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:site" content="@TalentXcel" />

        <script type="application/ld+json">{JSON.stringify(faqSchema)}</script>
        <script type="application/ld+json">{JSON.stringify(softwareSchema)}</script>
      </Helmet>

      {/* Top Banner */}
      <div className="bg-gradient-to-r from-emerald-900/60 via-indigo-900/60 to-purple-900/60 border-b border-slate-800 py-2 px-4 text-center text-xs font-mono text-emerald-300 flex items-center justify-center gap-2">
        <Sparkles className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
        <span>Meta WhatsApp Cloud API Certified Partner Solution • Instant Setup</span>
      </div>

      {/* Navigation Header */}
      <header className="border-b border-slate-800 bg-slate-900/80 backdrop-blur-md sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-500 to-indigo-600 flex items-center justify-center font-black text-white text-xl shadow-lg">
              C
            </div>
            <div>
              <span className="font-extrabold text-lg tracking-tight text-white block leading-none">CHATR.CHAT</span>
              <span className="text-[10px] text-slate-400 font-mono">Candidate Screening Engine</span>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <button
              onClick={() => setShowDemoModal(true)}
              className="px-5 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs rounded-xl shadow-lg transition-all flex items-center gap-2 font-mono"
            >
              <span>Book Demo</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-24">
        
        {/* HERO SECTION */}
        <section className="text-center space-y-8 max-w-4xl mx-auto">
          <div className="inline-flex items-center space-x-2 px-4 py-1.5 bg-emerald-950/80 border border-emerald-700/60 rounded-full text-emerald-300 text-xs font-bold font-mono">
            <Bot className="w-4 h-4 text-emerald-400" />
            <span>AUTOMATED WHATSAPP RECRUITMENT SCREENING</span>
          </div>

          <h1 className="text-4xl sm:text-6xl font-black tracking-tight text-white leading-tight">
            Screen 1,000s of Candidates in Seconds over <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-200">WhatsApp</span>
          </h1>

          <p className="text-slate-300 text-base sm:text-xl max-w-3xl mx-auto leading-relaxed font-normal">
            Ditch unanswered email ATS rejections. Qualify job applicants, parse resumes, and schedule interviews automatically via official Meta WhatsApp Cloud API — boasting an <strong className="text-white">88% completion rate within 3 minutes</strong>.
          </p>

          <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-4 font-mono text-sm">
            <button
              onClick={() => setShowDemoModal(true)}
              className="w-full sm:w-auto px-8 py-4 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black rounded-xl shadow-xl transition-all flex items-center justify-center gap-2"
            >
              <span>Start Free WhatsApp Screening</span>
              <ArrowRight className="w-4 h-4" />
            </button>
            <a
              href="#interactive-demo"
              className="w-full sm:w-auto px-8 py-4 bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-200 font-bold rounded-xl transition-all"
            >
              See Live Simulator
            </a>
          </div>

          {/* Quick Metrics Bar */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-8 border-t border-slate-800/80 font-mono">
            <div className="p-4 bg-slate-900/60 border border-slate-800 rounded-xl">
              <div className="text-2xl font-black text-emerald-400">98%</div>
              <div className="text-[11px] text-slate-400">WhatsApp Open Rate</div>
            </div>
            <div className="p-4 bg-slate-900/60 border border-slate-800 rounded-xl">
              <div className="text-2xl font-black text-indigo-400">45 Sec</div>
              <div className="text-[11px] text-slate-400">Avg Candidate Response</div>
            </div>
            <div className="p-4 bg-slate-900/60 border border-slate-800 rounded-xl">
              <div className="text-2xl font-black text-purple-400">88%</div>
              <div className="text-[11px] text-slate-400">Screening Completion</div>
            </div>
            <div className="p-4 bg-slate-900/60 border border-slate-800 rounded-xl">
              <div className="text-2xl font-black text-teal-400">3x</div>
              <div className="text-[11px] text-slate-400">Faster Time-to-Hire</div>
            </div>
          </div>
        </section>

        {/* INTERACTIVE DEMO SIMULATOR */}
        <section id="interactive-demo" className="p-8 bg-slate-900/80 border border-slate-800 rounded-3xl space-y-8">
          <div className="text-center space-y-3">
            <h2 className="text-2xl sm:text-4xl font-black text-white">Experience Interactive Candidate Screening</h2>
            <p className="text-slate-400 text-sm max-w-xl mx-auto">
              See how CHATR AI converts candidate applications into structured candidate cards over WhatsApp in real time.
            </p>
          </div>

          <div className="flex justify-center gap-3 font-mono text-xs">
            <button
              onClick={() => setActiveTab('screening')}
              className={`px-4 py-2 rounded-xl border transition-all ${activeTab === 'screening' ? 'bg-emerald-500/20 border-emerald-500 text-emerald-300 font-bold' : 'bg-slate-800 border-slate-700 text-slate-400'}`}
            >
              1. Conversational Screening
            </button>
            <button
              onClick={() => setActiveTab('parsing')}
              className={`px-4 py-2 rounded-xl border transition-all ${activeTab === 'parsing' ? 'bg-indigo-500/20 border-indigo-500 text-indigo-300 font-bold' : 'bg-slate-800 border-slate-700 text-slate-400'}`}
            >
              2. Resume OCR Parsing
            </button>
            <button
              onClick={() => setActiveTab('scheduling')}
              className={`px-4 py-2 rounded-xl border transition-all ${activeTab === 'scheduling' ? 'bg-purple-500/20 border-purple-500 text-purple-300 font-bold' : 'bg-slate-800 border-slate-700 text-slate-400'}`}
            >
              3. Auto Interview Booking
            </button>
          </div>

          <div className="max-w-2xl mx-auto bg-slate-950 border border-slate-800 rounded-2xl p-6 font-mono space-y-4">
            {activeTab === 'screening' && (
              <div className="space-y-4 text-xs">
                <div className="flex justify-start">
                  <div className="bg-slate-900 border border-slate-800 p-3 rounded-2xl rounded-tl-none max-w-[85%] space-y-1">
                    <span className="text-emerald-400 font-bold block">CHATR AI Bot:</span>
                    <p className="text-slate-200">Hi Rahul! Thanks for applying for the Senior React Developer role at Enterprise Corp. Do you have 3+ years of commercial TypeScript experience?</p>
                  </div>
                </div>
                <div className="flex justify-end">
                  <div className="bg-emerald-600 text-slate-950 p-3 rounded-2xl rounded-tr-none max-w-[85%] font-bold">
                    Yes, I have 4 years of hands-on React & TypeScript experience.
                  </div>
                </div>
                <div className="flex justify-start">
                  <div className="bg-slate-900 border border-slate-800 p-3 rounded-2xl rounded-tl-none max-w-[85%] space-y-1">
                    <span className="text-emerald-400 font-bold block">CHATR AI Bot:</span>
                    <p className="text-slate-200">Awesome! Please reply with your updated PDF CV so our recruitment team can review it instantly.</p>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'parsing' && (
              <div className="space-y-3 text-xs">
                <div className="p-3 bg-indigo-950/60 border border-indigo-800 rounded-xl space-y-2">
                  <div className="flex items-center justify-between text-indigo-300 font-bold">
                    <span>📄 Resume Received: Rahul_Sharma_CV.pdf</span>
                    <span className="text-emerald-400">100% Parsed</span>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-300 pt-2 border-t border-indigo-900">
                    <div>• Verified Experience: 4.2 Years</div>
                    <div>• Primary Skill: React, TypeScript, Node</div>
                    <div>• Qualification Score: 94 / 100</div>
                    <div>• Notice Period: 15 Days</div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'scheduling' && (
              <div className="space-y-3 text-xs">
                <div className="p-3 bg-purple-950/60 border border-purple-800 rounded-xl space-y-2">
                  <div className="text-purple-300 font-bold">📅 Auto Interview Slot Selection:</div>
                  <p className="text-slate-300">Candidate selected: Tomorrow, 2:30 PM IST with Hiring Manager</p>
                  <div className="text-emerald-400 font-bold">✓ Calendar Dispatched & WhatsApp Reminder Scheduled</div>
                </div>
              </div>
            )}
          </div>
        </section>

        {/* COMPARISON MATRIX */}
        <section className="space-y-8">
          <div className="text-center space-y-3">
            <h2 className="text-2xl sm:text-4xl font-black text-white">Why Top Agencies Choose WhatsApp Screening</h2>
            <p className="text-slate-400 text-sm max-w-xl mx-auto">
              Compare traditional email ATS screening against CHATR AI WhatsApp automation.
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse border border-slate-800 rounded-2xl overflow-hidden font-mono text-xs">
              <thead>
                <tr className="bg-slate-900 border-b border-slate-800 text-slate-300">
                  <th className="p-4">Recruitment Metric</th>
                  <th className="p-4 text-slate-400">Traditional Email ATS</th>
                  <th className="p-4 text-emerald-400 font-bold">CHATR WhatsApp Screening</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-slate-300">
                <tr className="bg-slate-950">
                  <td className="p-4 font-bold text-white">Candidate Open Rate</td>
                  <td className="p-4 text-slate-400">18% – 22%</td>
                  <td className="p-4 text-emerald-400 font-bold">98% Instant Open Rate</td>
                </tr>
                <tr className="bg-slate-900/40">
                  <td className="p-4 font-bold text-white">Time to First Screening Contact</td>
                  <td className="p-4 text-slate-400">24 to 48 Hours</td>
                  <td className="p-4 text-emerald-400 font-bold">45 Seconds (Instant)</td>
                </tr>
                <tr className="bg-slate-950">
                  <td className="p-4 font-bold text-white">Screening Completion Rate</td>
                  <td className="p-4 text-slate-400">25%</td>
                  <td className="p-4 text-emerald-400 font-bold">88% Completed</td>
                </tr>
                <tr className="bg-slate-900/40">
                  <td className="p-4 font-bold text-white">Resume OCR Parsing</td>
                  <td className="p-4 text-slate-400">Manual upload forms</td>
                  <td className="p-4 text-emerald-400 font-bold">Direct PDF/Doc OCR via WhatsApp</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        {/* ROI CALCULATOR */}
        <section className="p-8 bg-slate-900/60 border border-slate-800 rounded-3xl space-y-6">
          <div className="text-center space-y-2">
            <h2 className="text-2xl sm:text-3xl font-black text-white">Calculate Your Monthly Time & Cost Savings</h2>
            <p className="text-slate-400 text-xs font-mono">Drag the slider to your monthly candidate volume</p>
          </div>

          <div className="max-w-xl mx-auto space-y-6 font-mono">
            <div className="space-y-2">
              <div className="flex justify-between text-xs text-slate-300">
                <span>Monthly Applicants:</span>
                <span className="text-emerald-400 font-bold text-base">{candidatesPerMonth.toLocaleString()} candidates</span>
              </div>
              <input
                type="range"
                min="100"
                max="5000"
                step="100"
                value={candidatesPerMonth}
                onChange={(e) => setCandidatesPerMonth(Number(e.target.value))}
                className="w-full accent-emerald-400 bg-slate-800 rounded-lg cursor-pointer h-2"
              />
            </div>

            <div className="grid grid-cols-2 gap-4 text-center">
              <div className="p-4 bg-slate-950 border border-slate-800 rounded-2xl">
                <div className="text-2xl font-black text-indigo-400">{hoursSavedPerMonth} Hours</div>
                <div className="text-[11px] text-slate-400 mt-1">Recruiter Time Saved / Mo</div>
              </div>
              <div className="p-4 bg-slate-950 border border-slate-800 rounded-2xl">
                <div className="text-2xl font-black text-emerald-400">₹{costSavedPerMonth.toLocaleString()}</div>
                <div className="text-[11px] text-slate-400 mt-1">Estimated Cost Saved / Mo</div>
              </div>
            </div>
          </div>
        </section>

        {/* FAQ ACCORDION */}
        <section className="space-y-8">
          <div className="text-center space-y-3">
            <h2 className="text-2xl sm:text-4xl font-black text-white">Frequently Asked Questions</h2>
            <p className="text-slate-400 text-sm max-w-xl mx-auto">
              Everything you need to know about CHATR WhatsApp candidate screening.
            </p>
          </div>

          <div className="max-w-3xl mx-auto space-y-4">
            {faqs.map((faq, idx) => (
              <div key={idx} className="bg-slate-900/60 border border-slate-800 rounded-2xl overflow-hidden">
                <button
                  onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                  className="w-full p-5 text-left flex items-center justify-between font-bold text-sm text-white hover:text-emerald-400 transition-colors"
                >
                  <span>{faq.q}</span>
                  {openFaq === idx ? <ChevronUp className="w-4 h-4 text-emerald-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
                </button>
                {openFaq === idx && (
                  <div className="px-5 pb-5 text-xs text-slate-300 leading-relaxed font-sans border-t border-slate-800/60 pt-3">
                    {faq.a}
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>

        {/* BOTTOM CTA */}
        <section className="p-10 bg-gradient-to-r from-emerald-950 via-slate-900 to-indigo-950 border border-emerald-800/60 rounded-3xl text-center space-y-6">
          <h2 className="text-3xl sm:text-5xl font-black text-white tracking-tight">
            Ready to Automate Candidate Screening on WhatsApp?
          </h2>
          <p className="text-slate-300 text-sm max-w-xl mx-auto font-sans">
            Join leading recruiters and agencies achieving 3x faster candidate screening velocities with CHATR.
          </p>
          <button
            onClick={() => setShowDemoModal(true)}
            className="px-8 py-4 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-sm rounded-xl shadow-xl transition-all inline-flex items-center gap-2 font-mono"
          >
            <span>Book Free Workspace Demo</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </section>
      </main>

      {/* DEMO MODAL */}
      {showDemoModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 max-w-md w-full space-y-6 shadow-2xl relative">
            <button
              onClick={() => setShowDemoModal(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white font-mono text-sm"
            >
              ✕
            </button>

            <div className="space-y-2">
              <h3 className="text-xl font-black text-white">Book WhatsApp Screening Demo</h3>
              <p className="text-xs text-slate-400 font-sans">
                Get a personalized walkthrough of CHATR Candidate Screening Engine.
              </p>
            </div>

            <form onSubmit={handleLeadSubmit} className="space-y-4 font-mono text-xs">
              <div className="space-y-1">
                <label className="text-slate-300">Your Full Name</label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
                  <input
                    type="text"
                    required
                    placeholder="Rahul Sharma"
                    value={leadForm.name}
                    onChange={(e) => setLeadForm({ ...leadForm, name: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-2.5 text-slate-200 focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-slate-300">Work Email</label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
                  <input
                    type="email"
                    required
                    placeholder="rahul@company.com"
                    value={leadForm.email}
                    onChange={(e) => setLeadForm({ ...leadForm, email: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-2.5 text-slate-200 focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-slate-300">Company Name</label>
                <div className="relative">
                  <Building className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
                  <input
                    type="text"
                    required
                    placeholder="Enterprise Staffing Solutions"
                    value={leadForm.company}
                    onChange={(e) => setLeadForm({ ...leadForm, company: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-2.5 text-slate-200 focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-slate-300">WhatsApp Phone Number</label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
                  <input
                    type="tel"
                    placeholder="+91 98765 43210"
                    value={leadForm.phone}
                    onChange={(e) => setLeadForm({ ...leadForm, phone: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-2.5 text-slate-200 focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black rounded-xl shadow-lg transition-all text-sm mt-2"
              >
                {isSubmitting ? 'Initializing Workspace...' : 'Request Instant Demo'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="border-t border-slate-800 py-8 text-center text-xs text-slate-500 font-mono">
        © 2026 CHATR.CHAT • Meta WhatsApp Cloud API Candidate Screening Engine
      </footer>
    </div>
  );
};

export default WhatsAppCandidateScreeningPage;
