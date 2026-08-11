import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ShieldCheck, FileCheck, CheckCircle2, AlertCircle, RefreshCw, Cpu } from 'lucide-react';

export const EditorialPolicyPage: React.FC = () => {
  useEffect(() => {
    const pageTitle = 'Editorial Policy & Standards — CHATR Communication OS';
    document.title = pageTitle;
    
    let metaDesc = document.querySelector('meta[name="description"]');
    if (!metaDesc) { metaDesc = document.createElement('meta'); metaDesc.setAttribute('name', 'description'); document.head.appendChild(metaDesc); }
    metaDesc.setAttribute('content', 'Read CHATR Communication OS editorial standards: data verification methodologies, author expertise rules, AI assistance disclosures, and correction policies.');
    
    let canonical = document.querySelector('link[rel="canonical"]');
    if (!canonical) { canonical = document.createElement('link'); canonical.setAttribute('rel', 'canonical'); document.head.appendChild(canonical); }
    canonical.setAttribute('href', 'https://chatrchat.in/editorial-policy');

    const schema = document.createElement('script');
    schema.id = 'editorial-policy-schema';
    schema.type = 'application/ld+json';
    schema.textContent = JSON.stringify({
      '@context': 'https://schema.org',
      '@type': 'WebPage',
      name: pageTitle,
      url: 'https://chatrchat.in/editorial-policy',
      description: 'Editorial standards and data verification policies of CHATR Communication OS.',
      publisher: {
        '@type': 'Organization',
        name: 'CHATR Communication OS',
        url: 'https://chatrchat.in',
      },
    });
    if (!document.getElementById('editorial-policy-schema')) document.head.appendChild(schema);
    return () => { const s = document.getElementById('editorial-policy-schema'); if (s) s.remove(); };
  }, []);

  return (
    <div className="min-h-screen bg-slate-950 text-white font-sans">
      <header className="border-b border-slate-800 bg-slate-950/80 sticky top-0 z-40 backdrop-blur">
        <div className="max-w-5xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2 font-bold text-lg">
            <span className="text-indigo-400">CHATR</span>
            <span className="text-slate-400 font-normal text-sm">/ Editorial Policy</span>
          </Link>
          <Link to="/about" id="editorial-header-about" className="text-xs text-slate-400 hover:text-white transition-colors">
            About Us
          </Link>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 py-16 space-y-12">
        {/* Executive Summary AI Answer Block */}
        <section className="space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>EDITORIAL INTEGRITY & EVIDENCE STANDARDS</span>
          </div>
          <h1 className="text-3xl md:text-4xl font-extrabold text-white">Editorial Policy & Research Standards</h1>
          <p className="text-slate-400 text-base leading-relaxed">
            CHATR Communication OS and TalentXcel maintain strict editorial standards across all published articles, technical guides, product announcements, and benchmark reports. We prioritize factual accuracy, verifiable first-party data, transparent source attribution, and zero-fabrication metrics.
          </p>
        </section>

        {/* Policy Pillars */}
        <section className="space-y-8 border-t border-slate-800 pt-8">
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-indigo-400 font-bold text-lg">
              <FileCheck className="w-5 h-5" />
              <h2>1. Verifiable Data & Source Attribution</h2>
            </div>
            <p className="text-slate-300 text-sm leading-relaxed">
              All statistical claims, response-time benchmarks, candidate drop-off figures, and conversion metrics must include explicit source attribution and methodology context. When first-party CHATR or TalentXcel platform data is cited, the observation window and aggregation methodology are specified directly within the text.
            </p>
          </div>

          <div className="space-y-3">
            <div className="flex items-center gap-2 text-indigo-400 font-bold text-lg">
              <CheckCircle2 className="w-5 h-5" />
              <h2>2. Author Expertise & Review Requirements</h2>
            </div>
            <p className="text-slate-300 text-sm leading-relaxed">
              Every article is authored or reviewed by an identified practitioner with domain expertise in business messaging, WhatsApp API integration, candidate screening workflows, or recruitment operations. Anonymous or unvetted content is prohibited.
            </p>
          </div>

          <div className="space-y-3">
            <div className="flex items-center gap-2 text-indigo-400 font-bold text-lg">
              <Cpu className="w-5 h-5" />
              <h2>3. AI Assistance Disclosure</h2>
            </div>
            <p className="text-slate-300 text-sm leading-relaxed">
              Where AI tools are used to assist in research outline generation or preliminary drafting, all technical details, code samples, workflow mechanics, and factual claims undergo mandatory human verification by our engineering or recruitment research leads before publication.
            </p>
          </div>

          <div className="space-y-3">
            <div className="flex items-center gap-2 text-indigo-400 font-bold text-lg">
              <RefreshCw className="w-5 h-5" />
              <h2>4. Freshness & Material Change Policy</h2>
            </div>
            <p className="text-slate-300 text-sm leading-relaxed">
              We update publication timestamps only when substantial new data, API workflow changes, or editorial revisions have been incorporated. Superficial date updates without material content enhancements are strictly avoided.
            </p>
          </div>

          <div className="space-y-3">
            <div className="flex items-center gap-2 text-indigo-400 font-bold text-lg">
              <AlertCircle className="w-5 h-5" />
              <h2>5. Correction Policy</h2>
            </div>
            <p className="text-slate-300 text-sm leading-relaxed">
              If an error or outdated API workflow is identified in any published article, our team corrects the information promptly and includes a clear correction note detailing what was updated and why.
            </p>
          </div>
        </section>

        {/* Contact Footer */}
        <section className="bg-slate-900 border border-slate-800 rounded-xl p-6 text-center space-y-3">
          <h3 className="font-bold text-white text-base">Editorial Inquiries & Data Verification</h3>
          <p className="text-xs text-slate-400">
            For questions regarding our research methodologies or to suggest corrections, contact the editorial team at <a href="mailto:support@chatrchat.in" className="text-indigo-400 underline">support@chatrchat.in</a>.
          </p>
        </section>
      </main>
    </div>
  );
};

export default EditorialPolicyPage;
