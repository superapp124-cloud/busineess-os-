import React, { useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, ArrowRight, Tag, BookOpen, Building2 } from 'lucide-react';
import { AUTHORS } from '@/data/authorsData';

export const AuthorProfilePage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const author = slug ? AUTHORS[slug] : undefined;

  useEffect(() => {
    if (!author) return;
    const pageTitle = `${author.name} — ${author.role} | CHATR Communication OS`;
    document.title = pageTitle;
    
    let metaDesc = document.querySelector('meta[name="description"]');
    if (!metaDesc) { metaDesc = document.createElement('meta'); metaDesc.setAttribute('name', 'description'); document.head.appendChild(metaDesc); }
    metaDesc.setAttribute('content', `${author.name} is ${author.role} at ${author.organization}. Bio: ${author.bio}`);
    
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
      worksFor: {
        '@type': 'Organization',
        name: author.organization,
        url: author.organizationUrl,
      },
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
          <Link to="/authors" className="text-indigo-400 hover:underline">Back to Authors</Link>
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
          <Link to="/editorial-policy" className="text-xs text-slate-400 hover:text-white transition-colors">
            Editorial Policy
          </Link>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 py-16 space-y-12">
        <section className="bg-slate-900 border border-slate-800 rounded-2xl p-8 space-y-6">
          <div className="flex items-center gap-5">
            <div className="w-16 h-16 rounded-full bg-indigo-600/30 border border-indigo-500/40 flex items-center justify-center text-indigo-300 font-bold text-2xl shrink-0">
              {author.name.charAt(0)}
            </div>
            <div className="space-y-1">
              <h1 className="text-2xl font-extrabold text-white">{author.name}</h1>
              <p className="text-sm text-indigo-400 font-semibold">{author.role}</p>
              <p className="text-xs text-slate-400 flex items-center gap-1">
                <Building2 className="w-3.5 h-3.5" />
                <a href={author.organizationUrl} target="_blank" rel="noopener noreferrer" className="hover:underline">{author.organization}</a>
              </p>
            </div>
          </div>

          <p className="text-slate-300 text-sm leading-relaxed border-t border-slate-800 pt-6">
            {author.bio}
          </p>

          <div className="space-y-2 border-t border-slate-800 pt-6">
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400">Areas of Technical Expertise</h2>
            <div className="flex flex-wrap gap-2">
              {author.expertise.map((exp, i) => (
                <span key={i} className="inline-flex items-center gap-1 text-xs bg-slate-950 text-indigo-300 border border-indigo-500/30 px-3 py-1 rounded-lg">
                  <Tag className="w-3 h-3 text-indigo-400" />
                  {exp}
                </span>
              ))}
            </div>
          </div>
        </section>

        {/* Authored Articles & Research */}
        <section className="space-y-4">
          <div className="flex items-center gap-2 text-white font-bold text-lg">
            <BookOpen className="w-5 h-5 text-indigo-400" />
            <h2>Authored & Reviewed Publications</h2>
          </div>
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 space-y-4">
            <p className="text-slate-400 text-xs">
              Articles and research benchmarks published under {author.name}'s editorial oversight:
            </p>
            <div className="space-y-3">
              <Link to="/blog" className="block bg-slate-950 hover:bg-slate-800/80 border border-slate-800 rounded-lg p-4 transition-colors">
                <p className="font-semibold text-white text-sm hover:text-indigo-400">CHATR Knowledge Hub Articles</p>
                <p className="text-slate-400 text-xs mt-1">Browse all 5 published research articles on WhatsApp lead loss, candidate screening, and universal inboxes.</p>
              </Link>
              <Link to="/news" className="block bg-slate-950 hover:bg-slate-800/80 border border-slate-800 rounded-lg p-4 transition-colors">
                <p className="font-semibold text-white text-sm hover:text-indigo-400">Official Platform Announcements</p>
                <p className="text-slate-400 text-xs mt-1">Product launch notes for CHATR Communication OS and TalentXcel WhatsApp screening release.</p>
              </Link>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
};

export default AuthorProfilePage;
