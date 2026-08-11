import React, { useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, Tag, BookOpen, Building2, GraduationCap, Award, HeartHandshake, Lightbulb, Users, Globe } from 'lucide-react';
import { AUTHORS } from '@/data/authorsData';

export const AuthorProfilePage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const author = slug ? AUTHORS[slug] : undefined;

  useEffect(() => {
    if (!author) return;
    const pageTitle = `${author.name} — Founder, TalentXcel & CHATR | HR & Education Strategist`;
    document.title = pageTitle;
    
    let metaDesc = document.querySelector('meta[name="description"]');
    if (!metaDesc) { metaDesc = document.createElement('meta'); metaDesc.setAttribute('name', 'description'); document.head.appendChild(metaDesc); }
    metaDesc.setAttribute('content', `${author.name} is the Founder of TalentXcel and CHATR with 20+ years of HR, talent, training, and education experience across Fortis, Reliance, Savantis, and Evolve Services.`);
    
    let canonical = document.querySelector('link[rel="canonical"]');
    if (!canonical) { canonical = document.createElement('link'); canonical.setAttribute('rel', 'canonical'); document.head.appendChild(canonical); }
    canonical.setAttribute('href', `https://chatrchat.in/authors/${author.slug}`);

    const schema = document.createElement('script');
    schema.id = 'author-profile-schema';
    schema.type = 'application/ld+json';
    schema.textContent = JSON.stringify({
      '@context': 'https://schema.org',
      '@type': 'Person',
      name: author.name,
      jobTitle: author.role,
      worksFor: [
        { '@type': 'Organization', name: 'TalentXcel', url: 'https://talentxcel.in' },
        { '@type': 'Organization', name: 'CHATR Communication OS', url: 'https://chatrchat.in' }
      ],
      alumniOf: [
        { '@type': 'EducationalOrganization', name: 'Jamia Hamdard' }
      ],
      hasCredential: author.credentials || [],
      description: author.bio,
      url: `https://chatrchat.in/authors/${author.slug}`,
    });
    if (!document.getElementById('author-profile-schema')) document.head.appendChild(schema);
    return () => { const s = document.getElementById('author-profile-schema'); if (s) s.remove(); };
  }, [author]);

  if (!author) {
    return (
      <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center">
        <div className="text-center space-y-4">
          <p className="text-slate-400">Author profile not found.</p>
          <Link to="/authors" className="text-indigo-400 hover:underline font-semibold">Back to Authors</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-white font-sans">
      <header className="border-b border-slate-800 bg-slate-950/80 sticky top-0 z-40 backdrop-blur">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link to="/authors" className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors text-sm">
            <ArrowLeft className="w-4 h-4" /> All Authors
          </Link>
          <Link to="/editorial-policy" className="text-xs text-slate-400 hover:text-white transition-colors font-semibold">
            Editorial Policy
          </Link>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 py-12 space-y-12">
        {/* Executive Profile Header */}
        <section className="bg-slate-900 border border-slate-800 rounded-2xl p-8 space-y-6">
          <div className="flex flex-col md:flex-row md:items-center gap-6">
            <div className="w-20 h-20 rounded-full bg-gradient-to-tr from-indigo-600 via-violet-600 to-indigo-400 p-0.5 shrink-0 shadow-lg shadow-indigo-500/20">
              <div className="w-full h-full bg-slate-950 rounded-full flex items-center justify-center text-indigo-300 font-bold text-3xl">
                S
              </div>
            </div>
            <div className="space-y-1.5">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-semibold">
                <Award className="w-3.5 h-3.5" />
                <span>20+ Years HR, Talent & Education Leader</span>
              </span>
              <h1 className="text-3xl font-extrabold text-white">{author.name}</h1>
              <p className="text-sm text-indigo-400 font-semibold">{author.role}</p>
              <p className="text-xs text-slate-400 flex items-center gap-1">
                <Building2 className="w-3.5 h-3.5 text-indigo-400" />
                <span className="text-slate-300 font-semibold">Founder of TalentXcel & CHATR</span>
              </p>
            </div>
          </div>

          <p className="text-slate-300 text-sm leading-relaxed border-t border-slate-800 pt-6">
            {author.bio}
          </p>

          {/* Organizations Worked With */}
          {author.organizationsWorkedWith && (
            <div className="space-y-2 border-t border-slate-800 pt-6">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Professional Experience & Organizations</span>
              <div className="flex flex-wrap gap-2 pt-1">
                {author.organizationsWorkedWith.map((org, i) => (
                  <span key={i} className="inline-flex items-center gap-1.5 text-xs bg-slate-950 text-slate-300 border border-slate-800 px-3.5 py-1.5 rounded-lg font-semibold">
                    <Building2 className="w-3.5 h-3.5 text-indigo-400" />
                    {org}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Academic Background */}
          {author.credentials && (
            <div className="space-y-2 border-t border-slate-800 pt-6">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Academic Qualifications & Degrees</span>
              <div className="grid md:grid-cols-2 gap-2.5 pt-1">
                {author.credentials.map((cred, i) => (
                  <div key={i} className="flex items-center gap-2 text-xs bg-slate-950 text-indigo-200 border border-indigo-500/20 px-3 py-2 rounded-lg">
                    <GraduationCap className="w-4 h-4 text-indigo-400 shrink-0" />
                    <span>{cred}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </section>

        {/* Founder Vision: TalentXcel & CHATR */}
        <section className="space-y-6">
          <h2 className="text-2xl font-extrabold text-white">Founder Vision & Platforms</h2>

          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-slate-900 border border-emerald-500/30 rounded-xl p-6 space-y-4">
              <div className="flex items-center gap-3">
                <Users className="w-6 h-6 text-emerald-400" />
                <div>
                  <h3 className="font-bold text-white text-lg">TalentXcel</h3>
                  <span className="text-xs text-emerald-400 font-mono">talentxcel.in</span>
                </div>
              </div>
              <p className="text-slate-300 text-xs leading-relaxed">
                Transforming traditional recruitment through AI-enabled talent discovery, resume parsing, candidate qualification, and career services. Focused on making candidates discoverable, employable, and prepared.
              </p>
            </div>

            <div className="bg-slate-900 border border-indigo-500/30 rounded-xl p-6 space-y-4">
              <div className="flex items-center gap-3">
                <Globe className="w-6 h-6 text-indigo-400" />
                <div>
                  <h3 className="font-bold text-white text-lg">CHATR</h3>
                  <span className="text-xs text-indigo-400 font-mono">chatrchat.in • chatr.chat</span>
                </div>
              </div>
              <p className="text-slate-300 text-xs leading-relaxed">
                Building a unified communication ecosystem connecting messaging, AI assistance, business workflows, and digital services into a single accessible platform.
              </p>
            </div>
          </div>
        </section>

        {/* Leadership Philosophy */}
        {author.leadershipPrinciples && (
          <section className="bg-slate-900 border border-slate-800 rounded-2xl p-6 md:p-8 space-y-4">
            <div className="flex items-center gap-2 text-white font-bold text-lg">
              <Lightbulb className="w-5 h-5 text-indigo-400" />
              <h2>Leadership Philosophy</h2>
            </div>
            <div className="space-y-3 border-t border-slate-800 pt-4">
              {author.leadershipPrinciples.map((principle, i) => (
                <div key={i} className="flex items-start gap-3 bg-slate-950 border border-slate-800 p-4 rounded-xl text-xs text-slate-300 leading-relaxed">
                  <HeartHandshake className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />
                  <span>{principle}</span>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Authored & Reviewed Publications */}
        <section className="space-y-4">
          <div className="flex items-center gap-2 text-white font-bold text-lg">
            <BookOpen className="w-5 h-5 text-indigo-400" />
            <h2>Authored & Reviewed Publications</h2>
          </div>
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 space-y-4">
            <p className="text-slate-400 text-xs">
              Research articles, recruitment benchmarks, and product guides published under Sanobar Jahan's editorial leadership:
            </p>
            <div className="space-y-3">
              <Link to="/blog" className="block bg-slate-950 hover:bg-slate-800/80 border border-slate-800 rounded-lg p-4 transition-colors">
                <p className="font-semibold text-white text-sm hover:text-indigo-400">CHATR Knowledge Hub Articles</p>
                <p className="text-slate-400 text-xs mt-1">Browse published research on WhatsApp lead loss, candidate screening, and universal inboxes.</p>
              </Link>
              <Link to="/editorial-policy" className="block bg-slate-950 hover:bg-slate-800/80 border border-slate-800 rounded-lg p-4 transition-colors">
                <p className="font-semibold text-white text-sm hover:text-indigo-400">Editorial Policy & Research Standards</p>
                <p className="text-slate-400 text-xs mt-1">Read our verification methodologies, source attribution rules, and AI disclosures.</p>
              </Link>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
};

export default AuthorProfilePage;
