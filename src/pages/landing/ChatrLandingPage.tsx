import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { SEOHead } from '@/components/SEOHead';
import { LandingHeader } from '@/components/landing/LandingHeader';
import { HeroSection } from '@/components/landing/HeroSection';
import { AudienceStrip } from '@/components/landing/AudienceStrip';
import { FeatureGrid } from '@/components/landing/FeatureGrid';
import { LandingCTA } from '@/components/landing/LandingCTA';
import { AuthModal } from '@/components/landing/AuthModal';
import { VideoModal } from '@/components/landing/VideoModal';

interface ChatrLandingPageProps {
  initialAuthOpen?: boolean;
}

export const ChatrLandingPage: React.FC<ChatrLandingPageProps> = ({ initialAuthOpen = false }) => {
  const navigate = useNavigate();
  const location = useLocation();

  // Check URL query params for ?auth=true or initialAuthOpen
  const queryParams = new URLSearchParams(location.search);
  const shouldOpenAuthFromQuery = queryParams.get('auth') === 'true' || location.pathname === '/auth';

  const [authModalOpen, setAuthModalOpen] = useState<boolean>(initialAuthOpen || shouldOpenAuthFromQuery);
  const [videoModalOpen, setVideoModalOpen] = useState<boolean>(false);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);

  // Check existing session once on mount
  useEffect(() => {
    let isMounted = true;

    const checkSession = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (isMounted && session?.user) {
          setIsAuthenticated(true);
        }
      } catch (err) {
        console.warn('[Landing] Session verification:', err);
      }
    };

    checkSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if ((event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') && session?.user) {
        setIsAuthenticated(true);
        setAuthModalOpen(false);
        // Destination redirect
        const stateFrom = (location.state as any)?.from?.pathname ||
          (typeof (location.state as any)?.from === 'string' ? (location.state as any)?.from : null);
        const storedRedirect = sessionStorage.getItem('auth_redirect');
        const target = stateFrom || storedRedirect || '/desktop/home';
        if (storedRedirect) sessionStorage.removeItem('auth_redirect');
        navigate(target, { replace: true });
      } else if (event === 'SIGNED_OUT') {
        setIsAuthenticated(false);
      }
    });

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, [navigate, location]);

  const handleNavigateWorkspace = useCallback(() => {
    navigate('/desktop/home');
  }, [navigate]);

  const handleAuthSuccess = useCallback(() => {
    setAuthModalOpen(false);
    navigate('/desktop/home', { replace: true });
  }, [navigate]);

  return (
    <div className="min-h-screen bg-[#F8F8F5] text-[#111817] font-sans antialiased selection:bg-[#E8F0EB] selection:text-[#164E3F]">
      <SEOHead
        title="CHATR — The Intent Operating System"
        description="Your Intent. Our Intelligence. Real Results. CHATR connects you to people, information and AI agents so you can get things done."
        keywords="CHATR, Intent OS, AI Agents, Universal Workspace, Career Match, Business OS"
      />

      {/* 1. Header Navigation */}
      <LandingHeader
        onOpenAuth={() => setAuthModalOpen(true)}
        isAuthenticated={isAuthenticated}
        onNavigateWorkspace={handleNavigateWorkspace}
      />

      {/* 2. Hero Section with Two-Column Editorial Layout */}
      <main>
        <HeroSection
          onOpenAuth={() => setAuthModalOpen(true)}
          onOpenVideo={() => setVideoModalOpen(true)}
        />

        {/* 3. Qualitative Audience Strip (Zero Fake Numbers) */}
        <AudienceStrip />

        {/* 4. Six Core Feature Possibilities */}
        <FeatureGrid
          onCardClick={(_featureKey) => {
            setAuthModalOpen(true);
          }}
        />

        {/* 5. Bottom Call-To-Action Banner & Footer */}
        <LandingCTA
          onOpenAuth={() => setAuthModalOpen(true)}
        />
      </main>

      {/* Auth Modal Overlay */}
      <AuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        onSuccess={handleAuthSuccess}
      />

      {/* Video Demo Modal */}
      <VideoModal
        isOpen={videoModalOpen}
        onClose={() => setVideoModalOpen(false)}
        onOpenAuth={() => {
          setVideoModalOpen(false);
          setAuthModalOpen(true);
        }}
      />
    </div>
  );
};

export default ChatrLandingPage;
