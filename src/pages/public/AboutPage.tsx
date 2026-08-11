import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ShieldCheck, MessageSquare, Users, Cpu, ArrowRight, Building2, Globe, Award } from 'lucide-react';
import { AUTHORS } from '@/data/authorsData';

export const AboutPage: React.FC = () => {
  useEffect(() => {
    const pageTitle = 'About — CHATR Communication OS & TalentXcel';
    document.title = pageTitle;
    
    let metaDesc = document.querySelector('meta[name="description"]');
    if (!metaDesc) { metaDesc = document.createElement('meta'); metaDesc.setAttribute('name', 'description'); document.head.appendChild(metaDesc); }
    metaDesc.setAttribute('content', 'Learn about CHATR Communication OS — the unified business communication platform powering messaging, WhatsApp candidate screening, and AI workflows.');
    
    let canonical = document.querySelector('link[rel="canonical"]');
    if (!canonical) { canonical = document.createElement('link'); canonical.setAttribute('rel', 'canonical'); document.head.appendChild(canonical); }
    canonical.setAttribute('href', 'https://chatrchat.in/about');

    const schema = document.createElement('script');
    schema.id = 'about-page-schema';
    schema.type = 'application/ld+json';
    schema.textContent = JSON.stringify({
      '@context': 'https://schema.org',
      '@type': 'AboutPage',
      name: pageTitle,
      url: 'https://chatrchat.in/about',
      mainEntity: {
        '@type': 'Organization',
        name: 'CHATR Communication OS',
        url: 'https://chatrchat.in',
        logo: 'https://chatrchat.in/assets/chatrplus-logo512.png',
        founder: {
          '@type': 'Person',
          name: AUTHORS['arshid-wani'].name,
          jobTitle: AUTHORS['arshid-wani'].role,
        },
        subOrganization: {
          '@type': 'Organization',
          name: 'TalentXcel',
          url: 'https://talentxcel.in',
        },
      },
    });
    if (!document.getElementById('about-page-schema')) document.head.appendChild(schema);
    return () => { const s = document.getElementById('about-page-schema'); if (s) s.remove(); };
  }, []);

  return (
    <div className="min-h-screen bg-slate-950 text-white font-sans">
      <header className="border-b border-slate-800 bg-slate-950/80 sticky top-0 z-40 backdrop-blur">
        <div className="max-w-5xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2 font-bold text-lg">
            <span className="text-indigo-400">CHATR</span>
            <span className="text-slate-400 font-normal text-sm">/ About</span>
          </Link>
          <Link to="/auth" id="about-header-cta" className="text-xs bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2 rounded-lg transition-colors font-semibold">
            Try CHATR Free
          </Link>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-16 space-y-16">
        {/* Executive Summary Block (AI / GEO Answer Layer) */}
        <section className="space-y-6 text-center max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-semibold">
            <Globe className="w-3.5 h-3.5" />
            <span>ORGANIZATION & PLATFORM ARCHITECTURE</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-extrabold text-white tracking-tight leading-tight">
            Connecting Business Messaging & Candidate Screening in One OS
          </h1>
          <p className="text-slate-300 text-lg leading-relaxed">
            CHATR Communication OS is the unified business communication platform engineered for Indian SMEs, recruitment agencies, and scaling teams. We consolidate fragmented messaging channels — WhatsApp Business, email, and internal team chat — into a single, intelligent operating system.
          </p>
        </section>

        {/* Platform Architecture & Brand Structure */}
        <section className="bg-slate-900/60 border border-slate-800 rounded-2xl p-8 space-y-8">
          <div className="space-y-2">
            <h2 className="text-2xl font-bold text-white">Platform Ecosystem & Organization Hierarchy</h2>
            <p className="text-slate-400 text-sm">Clear separation of brand intent, technology layers, and module integrations.</p>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-slate-950 border border-indigo-500/30 rounded-xl p-6 space-y-4">
              <div className="flex items-center gap-3">
                <MessageSquare className="w-6 h-6 text-indigo-400" />
                <div>
                  <h3 className="font-bold text-white text-lg">CHATR Communication OS</h3>
                  <span className="text-xs text-indigo-400 font-mono">chatrchat.in • chatr.chat</span>
                </div>
              </div>
              <p className="text-slate-300 text-sm leading-relaxed">
                The core messaging kernel and shared inbox engine. Handles multi-channel triage, team assignment, automated WhatsApp workflows, and AI communication agents.
              </p>
            </div>

            <div className="bg-slate-950 border border-emerald-500/30 rounded-xl p-6 space-y-4">
              <div className="flex items-center gap-3">
                <Users className="w-6 h-6 text-emerald-400" />
                <div>
                  <h3 className="font-bold text-white text-lg">TalentXcel Integration</h3>
                  <span className="text-xs text-emerald-400 font-mono">talentxcel.in</span>
                </div>
              </div>
              <p className="text-slate-300 text-sm leading-relaxed">
                The specialized recruitment module operating within CHATR OS. Connects AI resume parsing, candidate qualification scoring, and ATS pipeline tracking directly into WhatsApp Business API.
              </p>
            </div>
          </div>
        </section>

        {/* Leadership & Verifiable Entities */}
        <section className="space-y-6">
          <div className="space-y-2">
            <h2 className="text-2xl font-bold text-white">Leadership & Authors</h2>
            <p className="text-slate-400 text-sm">Every capability, article, and research benchmark is backed by verifiable creators and engineers.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {Object.values(AUTHORS).map((author) => (
              <div key={author.slug} className="bg-slate-900 border border-slate-800 rounded-xl p-6 space-y-4 flex flex-col justify-between">
                <div className="space-y-3">
                  <div className="w-12 h-12 rounded-full bg-indigo-600/30 border border-indigo-500/40 flex items-center justify-center text-indigo-300 font-bold text-lg">
                    {author.name.charAt(0)}
                  </div>
                  <div>
                    <h3 className="font-bold text-white text-base">{author.name}</h3>
                    <p className="text-xs text-indigo-400 font-semibold">{author.role}</p>
                    <p className="text-[11px] text-slate-500">{author.organization}</p>
                  </div>
                  <p className="text-xs text-slate-400 leading-relaxed line-clamp-3">{author.bio}</p>
                </div>
                <Link to={/authors/} className="text-xs text-indigo-400 hover:text-indigo-300 font-semibold flex items-center gap-1 pt-2 border-t border-slate-800">
                  View Profile & Articles <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            ))}
          </div>
        </section>

        {/* Core Principles */}
        <section className="grid md:grid-cols-3 gap-6">
          <div className="bg-slate-900/40 border border-slate-800 rounded-xl p-6 space-y-3">
            <ShieldCheck className="w-6 h-6 text-indigo-400" />
            <h3 className="font-bold text-white text-base">Verifiable Claims</h3>
            <p className="text-xs text-slate-400 leading-relaxed">We strictly enforce zero-fabrication metrics. Every statistic, benchmark, and workflow description is backed by operational evidence.</p>
          </div>
          <div className="bg-slate-900/40 border border-slate-800 rounded-xl p-6 space-y-3">
            <Cpu className="w-6 h-6 text-indigo-400" />
            <h3 className="font-bold text-white text-base">Privacy & Governance</h3>
            <p className="text-xs text-slate-400 leading-relaxed">Built with strict data boundary controls. Candidate resume data and business messaging telemetry are protected by role-based encryption.</p>
          </div>
          <div className="bg-slate-900/40 border border-slate-800 rounded-xl p-6 space-y-3">
            <Award className="w-6 h-6 text-indigo-400" />
            <h3 className="font-bold text-white text-base">Editorial Transparency</h3>
            <p className="text-xs text-slate-400 leading-relaxed">Our research and articles follow explicit editorial policies regarding first-party data methodologies and AI-assisted drafting disclosures.</p>
          </div>
        </section>

        {/* Bottom CTA */}
        <section className="bg-gradient-to-r from-indigo-900/40 via-indigo-800/20 to-indigo-900/40 border border-indigo-500/30 rounded-2xl p-8 text-center space-y-4">
          <h2 className="text-2xl font-bold text-white">Experience CHATR Communication OS</h2>
          <p className="text-slate-400 text-sm max-w-xl mx-auto">
            Consolidate your business messaging and candidate screening into a single intelligent system today.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
            <Link to="/auth" className="bg-indigo-600 hover:bg-indigo-500 text-white font-semibold px-6 py-2.5 rounded-xl text-sm transition-colors">
              Get Started Free
            </Link>
            <Link to="/editorial-policy" className="bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold px-6 py-2.5 rounded-xl text-sm transition-colors">
              Read Editorial Policy
            </Link>
          </div>
        </section>
      </main>
    </div>
  );
};

export default AboutPage;
