import React, { useState, useEffect, useCallback } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, Tag, BookOpen, Building2, GraduationCap, Award, 
  Lightbulb, Users, Globe, ExternalLink, ShieldCheck 
} from 'lucide-react';
import { AUTHORS } from '@/data/authorsData';
import { LandingHeader } from '@/components/landing/LandingHeader';
import { Footer } from '@/components/Footer';
import { AuthModal } from '@/components/landing/AuthModal';
import { SEOHead } from '@/components/SEOHead';
import { supabase } from '@/integrations/supabase/client';

export const AuthorProfilePage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const author = slug ? AUTHORS[slug] : undefined;
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    window.scrollTo(0, 0);

    let isMounted = true;
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (isMounted && session?.user) setIsAuthenticated(true);
    }).catch(() => {});

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if ((event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') && session?.user) {
        setIsAuthenticated(true);
        setAuthModalOpen(false);
      } else if (event === 'SIGNED_OUT') {
        setIsAuthenticated(false);
      }
    });

    if (author) {
      const pageTitle = author.slug === 'sanobar-jahan'
        ? `${author.name} — Founder, TalentXcel & CHATR | HR & Education Strategist`
        : `${author.name} — ${author.role} | CHATR Communication OS`;
      document.title = pageTitle;

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
        sameAs: [
          author.linkedinUrl,
          author.facebookUrl,
          (author as any).redditUrl
        ].filter(Boolean),
        description: author.bio,
        url: `https://www.chatrchat.in/authors/${author.slug}`,
      });
      if (!document.getElementById('author-profile-schema')) document.head.appendChild(schema);
    }

    return () => {
      isMounted = false;
      subscription.unsubscribe();
      const s = document.getElementById('author-profile-schema');
      if (s) s.remove();
    };
  }, [author]);

  const handleNavigateWorkspace = useCallback(() => {
    navigate('/desktop/home');
  }, [navigate]);

  const handleAuthSuccess = useCallback(() => {
    setAuthModalOpen(false);
    navigate('/desktop/home', { replace: true });
  }, [navigate]);

  if (!author) {
    return (
      <div className="min-h-screen bg-[#F8F8F5] text-[#111817] flex flex-col justify-between">
        <LandingHeader
          onOpenAuth={() => setAuthModalOpen(true)}
          isAuthenticated={isAuthenticated}
          onNavigateWorkspace={handleNavigateWorkspace}
        />
        <div className="max-w-md mx-auto px-4 py-20 text-center space-y-4">
          <p className="text-[#53605C]">Author profile not found.</p>
          <Link to="/authors" className="text-[#164E3F] hover:underline font-semibold text-sm">
            ← Back to Authors Directory
          </Link>
        </div>
        <Footer />
      </div>
    );
  }

  const isFounder = author.slug === 'sanobar-jahan';

  return (
    <div className="min-h-screen bg-[#F8F8F5] text-[#111817] font-sans antialiased selection:bg-[#E8F0EB] selection:text-[#164E3F] flex flex-col justify-between">
      <SEOHead
        title={isFounder ? `${author.name} — Founder, TalentXcel & CHATR` : `${author.name} — ${author.role}`}
        description={author.bio}
        canonicalUrl={`https://www.chatrchat.in/authors/${author.slug}`}
      />

      <LandingHeader
        onOpenAuth={() => setAuthModalOpen(true)}
        isAuthenticated={isAuthenticated}
        onNavigateWorkspace={handleNavigateWorkspace}
      />

      <main className="flex-1 max-w-4xl mx-auto w-full px-4 sm:px-6 py-10 md:py-14 space-y-10">
        {/* Navigation Breadcrumb / Back Link */}
        <div className="flex items-center justify-between text-xs text-[#53605C]">
          <Link to="/authors" className="inline-flex items-center gap-1.5 text-[#53605C] hover:text-[#164E3F] transition-colors font-medium">
            <ArrowLeft className="w-4 h-4" />
            <span>All Authors & Teams</span>
          </Link>
          <Link to="/editorial-policy" className="hover:text-[#164E3F] transition-colors font-semibold">
            Editorial Policy
          </Link>
        </div>

        {/* Executive Profile Card */}
        <section className="bg-white border border-[#DDE3DF] rounded-2xl p-6 sm:p-10 space-y-6 shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center gap-6">
            <div className="w-24 h-24 rounded-2xl bg-[#E8F0EB] border border-[#164E3F]/20 flex items-center justify-center text-[#164E3F] font-bold text-3xl shrink-0 overflow-hidden shadow-sm">
              {author.avatarUrl ? (
                <img src={author.avatarUrl} alt={author.name} className="w-full h-full object-cover object-top" />
              ) : (
                <span>{author.name.charAt(0)}</span>
              )}
            </div>

            <div className="space-y-2">
              {isFounder ? (
                <>
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#E8F0EB] border border-[#164E3F]/20 text-[#164E3F] text-xs font-semibold">
                    <Award className="w-3.5 h-3.5" />
                    <span>20+ Years HR, Talent & Education Leader</span>
                  </span>
                  <h1 className="text-2xl sm:text-3xl font-extrabold text-[#111817] tracking-tight">{author.name}</h1>
                  <p className="text-sm font-semibold text-[#164E3F]">{author.role}</p>
                  <p className="text-xs text-[#53605C] flex items-center gap-1.5">
                    <Building2 className="w-3.5 h-3.5 text-[#164E3F]" />
                    <span>Founder of TalentXcel & CHATR</span>
                  </p>
                  <div className="flex flex-wrap items-center gap-2 pt-1">
                    {author.linkedinUrl && (
                      <a
                        href={author.linkedinUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-xs bg-[#FAFBF9] hover:bg-white text-[#164E3F] border border-[#DDE3DF] px-3 py-1 rounded-full font-semibold transition-colors"
                      >
                        <Globe className="w-3 h-3" /> LinkedIn
                      </a>
                    )}
                    {author.facebookUrl && (
                      <a
                        href={author.facebookUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-xs bg-[#FAFBF9] hover:bg-white text-[#164E3F] border border-[#DDE3DF] px-3 py-1 rounded-full font-semibold transition-colors"
                      >
                        <Globe className="w-3 h-3" /> Facebook
                      </a>
                    )}
                  </div>
                </>
              ) : (
                <>
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#E8F0EB] border border-[#164E3F]/20 text-[#164E3F] text-xs font-semibold">
                    <Users className="w-3.5 h-3.5" />
                    <span>Core Product & Engineering Group</span>
                  </span>
                  <h1 className="text-2xl sm:text-3xl font-extrabold text-[#111817] tracking-tight">{author.name}</h1>
                  <p className="text-sm font-semibold text-[#164E3F]">{author.role}</p>
                  <p className="text-xs text-[#53605C] flex items-center gap-1.5">
                    <Building2 className="w-3.5 h-3.5 text-[#164E3F]" />
                    <span>Led by Founder Sanobar Jahan & Engineering Leadership</span>
                  </p>
                </>
              )}
            </div>
          </div>

          <p className="text-[#53605C] text-sm md:text-base leading-relaxed border-t border-[#DDE3DF] pt-6">
            {author.bio}
          </p>

          {/* Organizations Worked With */}
          {isFounder && author.organizationsWorkedWith && (
            <div className="space-y-3 border-t border-[#DDE3DF] pt-6">
              <span className="text-xs font-bold uppercase tracking-wider text-[#111817]">
                Professional Experience & Organizations
              </span>
              <div className="flex flex-wrap gap-2 pt-1">
                {author.organizationsWorkedWith.map((org, i) => (
                  <span key={i} className="inline-flex items-center gap-1.5 text-xs bg-[#FAFBF9] text-[#111817] border border-[#DDE3DF] px-3.5 py-1.5 rounded-full font-medium">
                    <Building2 className="w-3.5 h-3.5 text-[#164E3F]" />
                    {org}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Academic Background */}
          {isFounder && author.credentials && (
            <div className="space-y-3 border-t border-[#DDE3DF] pt-6">
              <span className="text-xs font-bold uppercase tracking-wider text-[#111817]">
                Academic Qualifications & Degrees
              </span>
              <div className="grid sm:grid-cols-2 gap-3 pt-1">
                {author.credentials.map((cred, i) => (
                  <div key={i} className="flex items-center gap-2.5 text-xs bg-[#FAFBF9] text-[#111817] border border-[#DDE3DF] px-3.5 py-2.5 rounded-xl font-medium">
                    <GraduationCap className="w-4 h-4 text-[#164E3F] shrink-0" />
                    <span>{cred}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Core Expertise */}
          <div className="space-y-3 border-t border-[#DDE3DF] pt-6">
            <span className="text-xs font-bold uppercase tracking-wider text-[#111817]">
              Core Expertise & Focus Areas
            </span>
            <div className="flex flex-wrap gap-2 pt-1">
              {author.expertise.map((exp, i) => (
                <span key={i} className="text-xs bg-[#E8F0EB] text-[#164E3F] border border-[#164E3F]/20 px-3 py-1 rounded-full font-semibold">
                  {exp}
                </span>
              ))}
            </div>
          </div>
        </section>

        {/* Founder Leadership Principles */}
        {isFounder && author.leadershipPrinciples && (
          <section className="bg-white border border-[#DDE3DF] rounded-2xl p-6 sm:p-8 space-y-4 shadow-sm">
            <div className="flex items-center gap-2 font-bold text-lg text-[#111817]">
              <Lightbulb className="w-5 h-5 text-[#164E3F]" />
              <h2>Leadership & Engineering Philosophy</h2>
            </div>
            <div className="space-y-3">
              {author.leadershipPrinciples.map((principle, i) => (
                <div key={i} className="bg-[#FAFBF9] border border-[#DDE3DF] p-4 rounded-xl text-xs sm:text-sm text-[#53605C] leading-relaxed">
                  {principle}
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Footer Back Link & Platform Discovery */}
        <div className="text-center pt-2 space-y-3">
          <Link to="/authors" className="inline-flex items-center gap-2 text-xs text-[#164E3F] font-semibold hover:underline">
            ← Explore All CHATR Authors & Research Contributors
          </Link>
          {isFounder && (
            <p className="text-xs text-[#83918C]">
              Explore the platform Sanobar built:{' '}
              <Link to="/pricing" className="text-[#164E3F] font-semibold hover:underline">Commercial Plans</Link>
              {' '}·{' '}
              <Link to="/whatsapp-team-inbox" className="text-[#164E3F] font-semibold hover:underline">WhatsApp Team Inbox</Link>
            </p>
          )}
        </div>
      </main>

      <Footer />

      <AuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        onSuccess={handleAuthSuccess}
      />
    </div>
  );
};

export default AuthorProfilePage;
