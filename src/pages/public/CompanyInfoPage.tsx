import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Building2, MapPin, Mail, Globe, ShieldCheck, FileText, Phone } from 'lucide-react';

export const CompanyInfoPage: React.FC = () => {
  useEffect(() => {
    const pageTitle = 'Company Information & Entity Verification — CHATR Communication OS';
    document.title = pageTitle;
    
    let metaDesc = document.querySelector('meta[name="description"]');
    if (!metaDesc) { metaDesc = document.createElement('meta'); metaDesc.setAttribute('name', 'description'); document.head.appendChild(metaDesc); }
    metaDesc.setAttribute('content', 'Official company information, entity verification, platform architecture details, and contact information for CHATR Communication OS and TalentXcel.');
    
    let canonical = document.querySelector('link[rel="canonical"]');
    if (!canonical) { canonical = document.createElement('link'); canonical.setAttribute('rel', 'canonical'); document.head.appendChild(canonical); }
    canonical.setAttribute('href', 'https://chatrchat.in/company-info');

    const schema = document.createElement('script');
    schema.id = 'company-info-schema';
    schema.type = 'application/ld+json';
    schema.textContent = JSON.stringify({
      '@context': 'https://schema.org',
      '@type': 'Organization',
      name: 'CHATR Communication OS',
      alternateName: 'ChatrChat',
      url: 'https://chatrchat.in',
      logo: 'https://chatrchat.in/assets/chatrplus-logo512.png',
      sameAs: ['https://chatr.chat', 'https://talentxcel.in'],
      address: {
        '@type': 'PostalAddress',
        addressLocality: 'Noida',
        addressRegion: 'Uttar Pradesh',
        addressCountry: 'IN',
      },
    });
    if (!document.getElementById('company-info-schema')) document.head.appendChild(schema);
    return () => { const s = document.getElementById('company-info-schema'); if (s) s.remove(); };
  }, []);

  return (
    <div className="min-h-screen bg-slate-950 text-white font-sans">
      <header className="border-b border-slate-800 bg-slate-950/80 sticky top-0 z-40 backdrop-blur">
        <div className="max-w-5xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2 font-bold text-lg">
            <span className="text-indigo-400">CHATR</span>
            <span className="text-slate-400 font-normal text-sm">/ Company Info</span>
          </Link>
          <Link to="/about" className="text-xs text-slate-400 hover:text-white transition-colors">
            About Us
          </Link>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 py-16 space-y-12">
        <section className="space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-semibold">
            <Building2 className="w-3.5 h-3.5" />
            <span>ENTITY & PLATFORM TRANSPARENCY</span>
          </div>
          <h1 className="text-3xl md:text-4xl font-extrabold text-white">Company Information & Verification</h1>
          <p className="text-slate-400 text-base leading-relaxed">
            Official operational context and entity details for CHATR Communication OS and TalentXcel recruitment platform.
          </p>
        </section>

        {/* Entity Details Card */}
        <section className="bg-slate-900 border border-slate-800 rounded-2xl p-8 space-y-6">
          <h2 className="text-xl font-bold text-white border-b border-slate-800 pb-4">Corporate & Platform Context</h2>

          <div className="grid md:grid-cols-2 gap-6 text-sm">
            <div className="space-y-2">
              <span className="text-xs text-slate-500 uppercase font-bold tracking-wider">Primary Operating Platform</span>
              <p className="font-semibold text-white">CHATR Communication OS</p>
              <p className="text-slate-400 text-xs">Universal AI Business Messaging & Shared Inbox Kernel</p>
            </div>

            <div className="space-y-2">
              <span className="text-xs text-slate-500 uppercase font-bold tracking-wider">Recruitment Module Integration</span>
              <p className="font-semibold text-white">TalentXcel</p>
              <p className="text-slate-400 text-xs">WhatsApp Candidate Screening & ATS Integration</p>
            </div>

            <div className="space-y-2">
              <span className="text-xs text-slate-500 uppercase font-bold tracking-wider">Primary Location</span>
              <p className="font-semibold text-white flex items-center gap-1">
                <MapPin className="w-4 h-4 text-indigo-400" /> Noida, Uttar Pradesh, India
              </p>
            </div>

            <div className="space-y-2">
              <span className="text-xs text-slate-500 uppercase font-bold tracking-wider">Support Contact</span>
              <p className="font-semibold text-white flex items-center gap-1">
                <Mail className="w-4 h-4 text-indigo-400" /> support@chatrchat.in
              </p>
            </div>
          </div>

          <div className="border-t border-slate-800 pt-6 space-y-3">
            <h3 className="font-bold text-white text-sm">Associated Web Properties</h3>
            <ul className="space-y-2 text-xs text-slate-300">
              <li><strong className="text-white">chatrchat.in:</strong> SME Growth OS, Knowledge Hub, Public SEO & Observability Dashboard</li>
              <li><strong className="text-white">chatr.chat:</strong> Communication OS Superapp (Chat, Calling, AI Copilot)</li>
              <li><strong className="text-white">talentxcel.in:</strong> Talent & Recruitment Platform (Job Matching, Resume Parser, Career Tools)</li>
            </ul>
          </div>
        </section>

        {/* Trust & Policy Links */}
        <section className="grid md:grid-cols-2 gap-4">
          <Link to="/editorial-policy" className="bg-slate-900 hover:bg-slate-800/80 border border-slate-800 rounded-xl p-6 transition-colors space-y-2">
            <ShieldCheck className="w-5 h-5 text-indigo-400" />
            <h3 className="font-bold text-white text-base">Editorial Policy</h3>
            <p className="text-xs text-slate-400">Review our standards for source attribution, first-party telemetry, and zero-fabrication metrics.</p>
          </Link>

          <Link to="/about" className="bg-slate-900 hover:bg-slate-800/80 border border-slate-800 rounded-xl p-6 transition-colors space-y-2">
            <Globe className="w-5 h-5 text-indigo-400" />
            <h3 className="font-bold text-white text-base">About Platform</h3>
            <p className="text-xs text-slate-400">Learn about our mission to unify business messaging and candidate screening for Indian SMEs.</p>
          </Link>
        </section>
      </main>
    </div>
  );
};

export default CompanyInfoPage;
