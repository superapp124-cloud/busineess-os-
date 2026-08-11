import React, { useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ArrowLeft, ArrowRight, ShieldCheck, Tag, HelpCircle, FileText, CheckCircle2 } from 'lucide-react';
import { EXPANSION_PAGES, ExpansionPageConfig } from '@/data/expansionPagesData';
import { AUTHORS } from '@/data/authorsData';

export const ExpansionPillarPage: React.FC = () => {
  const location = useLocation();
  const pageConfig = EXPANSION_PAGES.find(p => p.path === location.pathname);

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
        name: AUTHORS['sanobar-jahan'].name,
        jobTitle: AUTHORS['sanobar-jahan'].role,
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
        { '@type': 'ListItem', position: 2, name: pageConfig.category, item: `https://chatrchat.in/${pageConfig.category.toLowerCase()}` },
        { '@type': 'ListItem', position: 3, name: pageConfig.h1, item: `https://chatrchat.in${pageConfig.path}` }
      ]
    };

    const s1 = document.createElement('script'); s1.id = 'expansion-article-schema'; s1.type = 'application/ld+json'; s1.textContent = JSON.stringify(articleSchema);
    const s2 = document.createElement('script'); s2.id = 'expansion-faq-schema'; s2.type = 'application/ld+json'; s2.textContent = JSON.stringify(faqSchema);
    const s3 = document.createElement('script'); s3.id = 'expansion-breadcrumb-schema'; s3.type = 'application/ld+json'; s3.textContent = JSON.stringify(breadcrumbSchema);

    if (!document.getElementById('expansion-article-schema')) document.head.appendChild(s1);
    if (!document.getElementById('expansion-faq-schema')) document.head.appendChild(s2);
    if (!document.getElementById('expansion-breadcrumb-schema')) document.head.appendChild(s3);

    return () => {
      ['expansion-article-schema', 'expansion-faq-schema', 'expansion-breadcrumb-schema'].forEach(id => {
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

          {/* AI / GEO Direct Answer Executive Summary Block */}
          <div className="bg-indigo-950/40 border border-indigo-500/30 rounded-xl p-6 space-y-2">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-indigo-400">
              <ShieldCheck className="w-4 h-4" />
              <span>Executive Summary & Core Takeaway</span>
            </div>
            <p className="text-slate-200 text-sm leading-relaxed">{pageConfig.executiveSummary}</p>
          </div>
        </div>

        {/* Detailed Section */}
        <section className="space-y-6 text-slate-300 text-sm leading-relaxed border-t border-slate-800 pt-8">
          <h2 className="text-2xl font-bold text-white">Understanding {pageConfig.h1}</h2>
          <p>
            In modern business operations, communication delays directly impact lead conversion, candidate retention, and customer satisfaction. {pageConfig.description}
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
          <div className="space-y-4 border-t border-slate-800 pt-4">
            {pageConfig.faqs.map((faq, idx) => (
              <div key={idx} className="space-y-1.5">
                <p className="font-semibold text-white text-sm">{faq.q}</p>
                <p className="text-slate-400 text-xs leading-relaxed">{faq.a}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Bottom CTA */}
        <section className="bg-gradient-to-r from-indigo-900/40 via-indigo-800/20 to-indigo-900/40 border border-indigo-500/30 rounded-2xl p-8 text-center space-y-4">
          <h2 className="text-2xl font-bold text-white">Deploy CHATR Communication OS</h2>
          <p className="text-slate-400 text-sm max-w-xl mx-auto">
            Experience multi-agent WhatsApp shared inboxes, AI candidate screening, and business messaging workflows.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
            <Link to="/auth" id="expansion-cta-button" className="bg-indigo-600 hover:bg-indigo-500 text-white font-semibold px-6 py-2.5 rounded-xl text-sm transition-colors flex items-center gap-2">
              Start Free Trial <ArrowRight className="w-4 h-4" />
            </Link>
            <Link to="/about" className="bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold px-6 py-2.5 rounded-xl text-sm transition-colors">
              Platform Architecture
            </Link>
          </div>
        </section>
      </main>
    </div>
  );
};

export default ExpansionPillarPage;
