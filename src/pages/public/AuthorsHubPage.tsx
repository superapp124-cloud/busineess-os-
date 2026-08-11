import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { UserCheck, ArrowRight, ShieldCheck, Tag } from 'lucide-react';
import { AUTHORS } from '@/data/authorsData';

export const AuthorsHubPage: React.FC = () => {
  useEffect(() => {
    const pageTitle = 'Authors & Editorial Contributors — CHATR Communication OS';
    document.title = pageTitle;
    
    let metaDesc = document.querySelector('meta[name="description"]');
    if (!metaDesc) { metaDesc = document.createElement('meta'); metaDesc.setAttribute('name', 'description'); document.head.appendChild(metaDesc); }
    metaDesc.setAttribute('content', 'Meet the verifiable authors and engineering contributors behind CHATR Communication OS and TalentXcel research.');
    
    let canonical = document.querySelector('link[rel="canonical"]');
    if (!canonical) { canonical = document.createElement('link'); canonical.setAttribute('rel', 'canonical'); document.head.appendChild(canonical); }
    canonical.setAttribute('href', 'https://chatrchat.in/authors');

    const schema = document.createElement('script');
    schema.id = 'authors-hub-schema';
    schema.type = 'application/ld+json';
    schema.textContent = JSON.stringify({
      '@context': 'https://schema.org',
      '@type': 'ItemPage',
      name: pageTitle,
      url: 'https://chatrchat.in/authors',
    });
    if (!document.getElementById('authors-hub-schema')) document.head.appendChild(schema);
    return () => { const s = document.getElementById('authors-hub-schema'); if (s) s.remove(); };
  }, []);

  return (
    <div className="min-h-screen bg-slate-950 text-white font-sans">
      <header className="border-b border-slate-800 bg-slate-950/80 sticky top-0 z-40 backdrop-blur">
        <div className="max-w-5xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2 font-bold text-lg">
            <span className="text-indigo-400">CHATR</span>
            <span className="text-slate-400 font-normal text-sm">/ Authors</span>
          </Link>
          <Link to="/editorial-policy" id="authors-header-policy" className="text-xs text-slate-400 hover:text-white transition-colors">
            Editorial Policy
          </Link>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-16 space-y-12">
        <section className="space-y-4 text-center max-w-2xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-semibold">
            <UserCheck className="w-3.5 h-3.5" />
            <span>VERIFIABLE E-E-A-T ENTITIES</span>
          </div>
          <h1 className="text-3xl md:text-4xl font-extrabold text-white">Authors & Technical Contributors</h1>
          <p className="text-slate-400 text-sm leading-relaxed">
            Every technical article, recruitment benchmark, and product launch note is authored and reviewed by identified specialists in business messaging, candidate screening, and AI operations.
          </p>
        </section>

        <section className="space-y-6">
          {Object.values(AUTHORS).map((author) => (
            <div key={author.slug} className="bg-slate-900 border border-slate-800 rounded-2xl p-6 md:p-8 space-y-4 hover:border-indigo-500/40 transition-colors">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-full bg-indigo-600/30 border border-indigo-500/40 flex items-center justify-center text-indigo-300 font-bold text-xl shrink-0">
                    {author.name.charAt(0)}
                  </div>
                  <div>
                    <h2 className="font-bold text-white text-lg">{author.name}</h2>
                    <p className="text-xs text-indigo-400 font-semibold">{author.role} • {author.organization}</p>
                  </div>
                </div>
                <Link to={/authors/} className="inline-flex items-center gap-2 text-xs bg-slate-800 hover:bg-slate-700 text-white font-semibold px-4 py-2 rounded-lg transition-colors shrink-0">
                  View Profile & Articles <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>

              <p className="text-slate-300 text-sm leading-relaxed">{author.bio}</p>

              <div className="flex flex-wrap gap-2 pt-2 border-t border-slate-800">
                {author.expertise.map((exp, i) => (
                  <span key={i} className="inline-flex items-center gap-1 text-[11px] bg-slate-950 text-slate-400 border border-slate-800 px-2.5 py-1 rounded-md">
                    <Tag className="w-3 h-3 text-indigo-400" />
                    {exp}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </section>
      </main>
    </div>
  );
};

export default AuthorsHubPage;
