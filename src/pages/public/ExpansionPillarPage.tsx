import React, { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ArrowLeft, CheckCircle2, ChevronDown, HelpCircle, Tag, FileText, ArrowRight, Database, ShieldCheck, ExternalLink, AlertCircle, Wrench, Network } from 'lucide-react';
import { EXPANSION_PAGES } from '../../data/expansionPagesData';
import { AUTHORS } from '../../data/authorsData';
import { getEvidenceNodesForRoute } from '../../services/evidenceGraphEngine';

export const ExpansionPillarPage: React.FC = () => {
  const location = useLocation();
  const pageConfig = EXPANSION_PAGES.find(p => p.path === location.pathname);
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const evidenceNodes = pageConfig ? getEvidenceNodesForRoute(pageConfig.path, pageConfig.category) : [];

  useEffect(() => {
    if (!pageConfig) return;
    document.title = pageConfig.title;

    let metaDesc = document.querySelector('meta[name="description"]');
    if (!metaDesc) { metaDesc = document.createElement('meta'); metaDesc.setAttribute('name', 'description'); document.head.appendChild(metaDesc); }
    metaDesc.setAttribute('content', pageConfig.description);

    let canonical = document.querySelector('link[rel="canonical"]');
    if (!canonical) { canonical = document.createElement('link'); canonical.setAttribute('rel', 'canonical'); document.head.appendChild(canonical); }
    canonical.setAttribute('href', `https://chatrchat.in${pageConfig.path}`);

    const articleSchema = {
      '@context': 'https://schema.org',
      '@type': 'Article',
      headline: pageConfig.h1,
      description: pageConfig.description,
      author: {
        '@type': 'Person',
        name: 'Sanobar Jahan',
        jobTitle: 'Founder, TalentXcel & CHATR',
        url: 'https://chatrchat.in/authors/sanobar-jahan'
      },
      publisher: {
        '@type': 'Organization',
        name: 'CHATR Communication OS',
        url: 'https://chatrchat.in'
      },
      datePublished: '2026-08-11',
      dateModified: '2026-08-11'
    };

    const faqSchema = {
      '@context': 'https://schema.org',
      '@type': 'FAQPage',
      mainEntity: pageConfig.faqs.map(f => ({
        '@type': 'Question',
        name: f.q,
        acceptedAnswer: { '@type': 'Answer', text: f.a }
      }))
    };

    const breadcrumbSchema = {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://chatrchat.in' },
        { '@type': 'ListItem', position: 2, name: pageConfig.category, item: `https://chatrchat.in#${pageConfig.category.toLowerCase()}` },
        { '@type': 'ListItem', position: 3, name: pageConfig.h1, item: `https://chatrchat.in${pageConfig.path}` }
      ]
    };

    // HowTo Schema for Problem & Troubleshooting Pages
    const howToSchema = pageConfig.category === 'Problem' ? {
      '@context': 'https://schema.org',
      '@type': 'HowTo',
      name: pageConfig.h1,
      description: pageConfig.description,
      step: [
        {
          '@type': 'HowToStep',
          name: 'Diagnose Inbound Channel Friction',
          text: 'Identify unassigned message queues, response SLA timeouts, and context-switching bottlenecks across your team inboxes.'
        },
        {
          '@type': 'HowToStep',
          name: 'Implement Immediate Operational Workflows',
          text: 'Establish round-robin routing rules, multi-agent collision locks, and automated after-hours intake auto-responders.'
        },
        {
          '@type': 'HowToStep',
          name: 'Deploy CHATR Business OS Automation',
          text: 'Unify WhatsApp, email, and candidate screening data into a single centralized system with real-time manager SLA alerts.'
        }
      ]
    } : null;

    const scriptArt = document.createElement('script');
    scriptArt.id = 'expansion-article-schema';
    scriptArt.type = 'application/ld+json';
    scriptArt.textContent = JSON.stringify(articleSchema);
    if (!document.getElementById('expansion-article-schema')) document.head.appendChild(scriptArt);

    const scriptFaq = document.createElement('script');
    scriptFaq.id = 'expansion-faq-schema';
    scriptFaq.type = 'application/ld+json';
    scriptFaq.textContent = JSON.stringify(faqSchema);
    if (!document.getElementById('expansion-faq-schema')) document.head.appendChild(scriptFaq);

    const scriptBc = document.createElement('script');
    scriptBc.id = 'expansion-breadcrumb-schema';
    scriptBc.type = 'application/ld+json';
    scriptBc.textContent = JSON.stringify(breadcrumbSchema);
    if (!document.getElementById('expansion-breadcrumb-schema')) document.head.appendChild(scriptBc);

    if (howToSchema) {
      const scriptHowTo = document.createElement('script');
      scriptHowTo.id = 'expansion-howto-schema';
      scriptHowTo.type = 'application/ld+json';
      scriptHowTo.textContent = JSON.stringify(howToSchema);
      if (!document.getElementById('expansion-howto-schema')) document.head.appendChild(scriptHowTo);
    }

    return () => {
      ['expansion-article-schema', 'expansion-faq-schema', 'expansion-breadcrumb-schema', 'expansion-howto-schema'].forEach(id => {
        const el = document.getElementById(id);
        if (el) el.remove();
      });
    };
  }, [pageConfig]);

  if (!pageConfig) {
    return (
      <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center">
        <div className="text-center space-y-4">
          <p className="text-slate-400">Pillar page not found.</p>
          <Link to="/" className="text-indigo-400 hover:underline">Back to Home</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-white font-sans">
      <header className="border-b border-slate-800 bg-slate-950/80 sticky top-0 z-40 backdrop-blur">
        <div className="max-w-5xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2 font-bold text-lg">
            <span className="text-indigo-400">CHATR</span>
            <span className="text-slate-400 font-normal text-sm">/ {pageConfig.category}</span>
          </Link>
          <Link to="/auth" id="expansion-header-cta" className="text-xs bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2 rounded-lg transition-colors font-semibold">
            Try CHATR Free
          </Link>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 py-12 space-y-12">
        {/* Header & Meta */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 text-xs text-indigo-400 font-semibold">
            <Tag className="w-3.5 h-3.5" />
            <span>{pageConfig.category} Engine • Published August 2026</span>
          </div>
          <h1 className="text-3xl md:text-4xl font-extrabold text-white leading-tight">{pageConfig.h1}</h1>

          {/* Direct Answer Executive Summary Block */}
          <div className="bg-indigo-950/40 border border-indigo-500/30 rounded-xl p-6 space-y-2">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-indigo-400">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>Executive Summary & Key Takeaway</span>
            </div>
            <p className="text-slate-200 text-sm md:text-base leading-relaxed font-medium">
              {pageConfig.executiveSummary}
            </p>
          </div>
        </div>

        {/* Diagnostic Root Cause Section (If Problem Category) */}
        {pageConfig.category === 'Problem' && (
          <section className="bg-slate-900 border border-amber-500/30 rounded-2xl p-6 space-y-4">
            <div className="flex items-center gap-2 text-amber-400 font-bold text-base uppercase tracking-wider">
              <AlertCircle className="w-5 h-5 text-amber-400" /> Diagnostic Root Cause Analysis
            </div>
            <p className="text-slate-300 text-xs md:text-sm leading-relaxed">
              This operational friction typically stems from single-device bottlenecks, lack of automated lead distribution, unmonitored response SLAs, and fragmented communication channels. Without a centralized triage system, teams experience high lead drop-off and delayed customer response times.
            </p>
            <div className="space-y-2 pt-2 border-t border-slate-800 text-xs text-slate-300">
              <span className="font-bold text-white flex items-center gap-1.5"><Wrench className="w-3.5 h-3.5 text-indigo-400" /> 3 Actionable Non-Software Process Fixes:</span>
              <ul className="list-disc list-inside space-y-1 text-slate-400 pl-1">
                <li>Assign dedicated lead triage shifts to prevent off-hours inbox queue backlog.</li>
                <li>Establish rigid 5-minute response SLA targets for first-touch customer inquiries.</li>
                <li>Implement standardized pre-screening question templates across all agent devices.</li>
              </ul>
            </div>
          </section>
        )}

        {/* 3-Way Interlinking Triad Box (Engine 5 -> Engine 6 / Engine 3 / Engine 7) */}
        <section className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
          <div className="flex items-center gap-2 font-bold text-white text-base">
            <Network className="w-4 h-4 text-indigo-400" /> Recommended Strategic Interlinking Triad
          </div>
          <div className="grid md:grid-cols-3 gap-3 text-xs">
            <Link to="/workflow/whatsapp-lead-response-workflow" className="bg-slate-950 hover:bg-slate-800 border border-slate-800 p-4 rounded-xl space-y-1 block transition-colors">
              <span className="text-indigo-400 font-bold text-xxs block uppercase">Engine 6: Workflow</span>
              <span className="text-white font-semibold block leading-tight">Lead Response Workflow →</span>
            </Link>
            <Link to="/chatr/whatsapp-candidate-screening" className="bg-slate-950 hover:bg-slate-800 border border-slate-800 p-4 rounded-xl space-y-1 block transition-colors">
              <span className="text-indigo-400 font-bold text-xxs block uppercase">Engine 3: Feature</span>
              <span className="text-white font-semibold block leading-tight">WhatsApp Screening →</span>
            </Link>
            <Link to="/industries/recruitment-agencies" className="bg-slate-950 hover:bg-slate-800 border border-slate-800 p-4 rounded-xl space-y-1 block transition-colors">
              <span className="text-indigo-400 font-bold text-xxs block uppercase">Engine 7: Industry</span>
              <span className="text-white font-semibold block leading-tight">Recruitment Agencies →</span>
            </Link>
          </div>
        </section>

        {/* Core Analysis Section */}
        <section className="space-y-6">
          <h2 className="text-2xl font-bold text-white">Operational Problem & Structural Solution</h2>
          <p className="text-slate-300 text-sm leading-relaxed">
            Modern business communication suffers from fragmented channels, slow response times, and unorganized lead queues. {pageConfig.h1} addresses this friction directly by unifying customer touchpoints into an intelligent workflow.
          </p>

          <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 space-y-3">
            <h3 className="font-bold text-white text-base">Key Operational Advantages</h3>
            <ul className="space-y-2 text-xs text-slate-300">
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <span><strong>Instant Response SLAs:</strong> Cut initial acknowledgment time from hours to under 60 seconds on WhatsApp.</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <span><strong>Unified Context:</strong> Keep email, WhatsApp, and candidate screening data linked to a single conversation history.</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <span><strong>Role-Based Security:</strong> Protect candidate resumes and customer inquiries with enterprise access controls.</span>
              </li>
            </ul>
          </div>
        </section>

        {/* Evidence Graph Node Card */}
        {evidenceNodes.length > 0 && (
          <section className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2 font-bold text-white text-base">
                <Database className="w-4 h-4 text-indigo-400" /> Grounded Evidence Graph Trail
              </div>
              <span className="text-xs font-mono text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded">
                Verified Observational Finding
              </span>
            </div>

            <div className="space-y-3">
              {evidenceNodes.slice(0, 2).map((ev, idx) => (
                <div key={idx} className="bg-slate-950 border border-slate-800 rounded-xl p-4 space-y-2">
                  <div className="flex items-center justify-between text-xs font-mono">
                    <span className="text-indigo-400 font-bold">Finding ID: {ev.findingId}</span>
                    <span>{ev.sampleSize}</span>
                  </div>
                  <p className="text-xs text-slate-200 leading-relaxed font-medium">"{ev.claimText}"</p>
                  <div className="flex items-center justify-between pt-1 border-t border-slate-900 text-xs">
                    <span className="text-slate-400 flex items-center gap-1">
                      <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" /> Type: <strong className="text-white">{ev.claimType}</strong>
                    </span>
                    <Link to={ev.reportPath} className="text-indigo-400 hover:underline flex items-center gap-1 font-semibold">
                      View Report Methodology <ExternalLink className="w-3 h-3" />
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Methodology & Data Evidence Trail Box */}
        <section className="bg-slate-900/60 border border-slate-800 rounded-xl p-5 space-y-2 text-xs text-slate-400">
          <div className="flex items-center gap-2 font-bold text-white text-sm">
            <FileText className="w-4 h-4 text-indigo-400" />
            <span>Data Evidence & Verification Trail</span>
          </div>
          <p><strong className="text-slate-300">Telemetry Basis:</strong> {pageConfig.evidenceText}</p>
          <p>
            <strong className="text-slate-300">Editorial Oversight:</strong> Edited by <Link to="/authors/sanobar-jahan" className="text-indigo-400 underline font-semibold">Sanobar Jahan</Link> under our <Link to="/editorial-policy" className="text-indigo-400 underline">Editorial Policy</Link>.
          </p>
        </section>

        {/* Author Attribution Card */}
        <section className="bg-slate-900 border border-slate-800 rounded-2xl p-6 flex items-start gap-4">
          <div className="w-12 h-12 rounded-full bg-indigo-600/30 border border-indigo-500/40 flex items-center justify-center text-indigo-300 font-bold text-lg shrink-0">
            S
          </div>
          <div className="space-y-1.5 flex-1">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-white text-base">{AUTHORS['sanobar-jahan'].name}</h3>
              <Link to="/authors/sanobar-jahan" className="text-xs text-indigo-400 hover:underline font-semibold">View Profile →</Link>
            </div>
            <p className="text-xs text-indigo-400 font-semibold">{AUTHORS['sanobar-jahan'].role}</p>
            <p className="text-xs text-slate-400 leading-relaxed">{AUTHORS['sanobar-jahan'].bio}</p>
          </div>
        </section>

        {/* FAQ Accordion Section */}
        <section className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
          <div className="flex items-center gap-2 font-bold text-lg text-white">
            <HelpCircle className="w-5 h-5 text-indigo-400" />
            <h2>Frequently Asked Questions</h2>
          </div>
          <div className="space-y-3">
            {pageConfig.faqs.map((faq, idx) => (
              <div key={idx} className="border border-slate-800 rounded-xl overflow-hidden bg-slate-950">
                <button
                  onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                  className="w-full p-4 text-left flex items-center justify-between gap-4 hover:bg-slate-900/50 transition-colors"
                >
                  <span className="font-semibold text-sm text-slate-200">{faq.q}</span>
                  <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform ${openFaq === idx ? 'rotate-180' : ''}`} />
                </button>
                {openFaq === idx && (
                  <div className="p-4 pt-0 text-xs text-slate-400 leading-relaxed border-t border-slate-800/60 bg-slate-900/20">
                    {faq.a}
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>

        {/* Bottom CTA */}
        <div className="bg-gradient-to-r from-indigo-900/50 to-violet-900/50 border border-indigo-500/30 rounded-2xl p-8 text-center space-y-4">
          <h2 className="text-2xl font-bold text-white">Transform Your Team Messaging & Candidate Workflows</h2>
          <p className="text-xs md:text-sm text-slate-300 max-w-xl mx-auto">
            Join forward-thinking SMBs using CHATR Communication OS and TalentXcel to streamline WhatsApp lead triage, candidate screening, and team SLA tracking.
          </p>
          <div className="pt-2">
            <Link to="/auth" className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white px-6 py-3 rounded-xl font-bold text-sm transition-all shadow-lg shadow-indigo-500/20">
              Start Your Free Account <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
};

export default ExpansionPillarPage;
