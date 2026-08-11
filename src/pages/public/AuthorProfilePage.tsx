import React, { useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, Tag, BookOpen, Building2, GraduationCap, Award, HeartHandshake, Lightbulb, Users, Globe } from 'lucide-react';
import { AUTHORS } from '@/data/authorsData';

export const AuthorProfilePage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const author = slug ? AUTHORS[slug] : undefined;

  useEffect(() => {
    if (!author) return;
    const pageTitle = author.slug === 'sanobar-jahan'
      ? `${author.name} — Founder, TalentXcel & CHATR | HR & Education Strategist`
      : `${author.name} — ${author.role} | CHATR Communication OS`;
    document.title = pageTitle;
    
    let metaDesc = document.querySelector('meta[name="description"]');
    if (!metaDesc) { metaDesc = document.createElement('meta'); metaDesc.setAttribute('name', 'description'); document.head.appendChild(metaDesc); }
    metaDesc.setAttribute('content', author.bio);
    
    let canonical = document.querySelector('link[rel="canonical"]');
    if (!canonical) { canonical = document.createElement('link'); canonical.setAttribute('rel', 'canonical'); document.head.appendChild(canonical); }
    canonical.setAttribute('href', `https://www.chatrchat.in/authors/${author.slug}`);

    const schema = document.createElement('script');
    schema.id = 'author-profile-schema';
    schema.type = 'application/ld+json';
    schema.textContent = JSON.stringify({
      '@context': 'https://schema.org',
      '@type': author.slug === 'sanobar-jahan' ? 'Person' : 'Organization',
      name: author.name,
      jobTitle: author.role,
      worksFor: [
        { '@type': 'Organization', name: 'TalentXcel', url: 'https://talentxcel.in' },
        { '@type': 'Organization', name: 'CHATR Communication OS', url: 'https://www.chatrchat.in' }
      ],
      alumniOf: author.slug === 'sanobar-jahan' ? [
        { '@type': 'EducationalOrganization', name: 'Jamia Hamdard' }
      ] : undefined,
      hasCredential: author.credentials || [],
      description: author.bio,
      url: `https://www.chatrchat.in/authors/${author.slug}`,
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

  const isFounder = author.slug === 'sanobar-jahan';

  return (
    <div className="min-h-screen bg-slate-950 text-white font-sans">
      <header className="border-b border-slate-800 bg-slate-950/80 sticky top-0 z-40 backdrop-blur">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link to="/authors" className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors text-sm">
            <ArrowLeft className="w-4 h-4" /> All Authors & Teams
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
                {author.name.charAt(0)}
              </div>
            </div>
            <div className="space-y-1.5">
              {isFounder ? (
                <>
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
                </>
              ) : (
                <>
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-semibold">
                    <Users className="w-3.5 h-3.5" />
                    <span>Core Product & Engineering Group</span>
                  </span>
                  <h1 className="text-3xl font-extrabold text-white">{author.name}</h1>
                  <p className="text-sm text-indigo-400 font-semibold">{author.role}</p>
                  <p className="text-xs text-slate-400 flex items-center gap-1">
                    <Building2 className="w-3.5 h-3.5 text-indigo-400" />
                    <span className="text-slate-300 font-semibold">Led by Founder Sanobar Jahan & Engineering Leadership</span>
                  </p>
                </>
              )}
            </div>
          </div>

          <p className="text-slate-300 text-sm leading-relaxed border-t border-slate-800 pt-6">
            {author.bio}
          </p>

          {/* Organizations Worked With (Individual Founder Only) */}
          {isFounder && author.organizationsWorkedWith && (
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

          {/* Academic Background (Individual Founder Only) */}
          {isFounder && author.credentials && (
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

          {/* Expertise Areas */}
          <div className="space-y-2 border-t border-slate-800 pt-6">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Core Expertise & Focus Areas</span>
            <div className="flex flex-wrap gap-2 pt-1">
              {author.expertise.map((exp, i) => (
                <span key={i} className="text-xs bg-indigo-950/60 text-indigo-300 border border-indigo-500/30 px-3 py-1.5 rounded-lg font-medium">
                  {exp}
                </span>
              ))}
            </div>
          </div>
        </section>

        {/* Founder Leadership Principles (Individual Founder Only) */}
        {isFounder && author.leadershipPrinciples && (
          <section className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
            <div className="flex items-center gap-2 font-bold text-lg text-white">
              <Lightbulb className="w-5 h-5 text-indigo-400" />
              <h2>Leadership & Engineering Philosophy</h2>
            </div>
            <div className="space-y-3">
              {author.leadershipPrinciples.map((principle, i) => (
                <div key={i} className="bg-slate-950 border border-slate-800/80 p-4 rounded-xl text-xs text-slate-300 leading-relaxed font-medium">
                  {principle}
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Back Link */}
        <div className="text-center pt-4">
          <Link to="/authors" className="inline-flex items-center gap-2 text-xs text-indigo-400 hover:underline font-semibold">
            ← Explore All CHATR Authors & Research Contributors
          </Link>
        </div>
      </main>
    </div>
  );
};

export default AuthorProfilePage;
