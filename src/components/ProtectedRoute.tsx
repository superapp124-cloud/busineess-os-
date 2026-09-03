import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';

interface ProtectedRouteProps {
 children: React.ReactNode;
}

const getFastAuthStatus = (): boolean | null => {
  if (typeof window === 'undefined') return null;
  // If explicitly signed out in this browser session, respect it
  if (sessionStorage.getItem('chatr_explicit_signout') === '1') return false;

  const token = localStorage.getItem('sb-sbayuqgomlflmxgicplz-auth-token') || 
                localStorage.getItem('sb-auth-token');
  if (token) {
    try {
      const parsed = JSON.parse(token);
      if (parsed?.access_token) return true;
    } catch {
      if (typeof token === 'string' && token.length > 20) return true;
    }
  }
  return null;
};

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  // Synchronously initialize from persistent storage for 0ms perceived latency
  const [isAuthenticated, setIsAuthenticated] = React.useState<boolean | null>(() => getFastAuthStatus());
  const location = useLocation();

  React.useEffect(() => {
    let isMounted = true;

    const checkAuth = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (isMounted) {
          if (session) {
            setIsAuthenticated(true);
          } else if (sessionStorage.getItem('chatr_explicit_signout') === '1') {
            setIsAuthenticated(false);
          } else {
            // Keep user authenticated if tokens are still present in local storage
            const fastAuth = getFastAuthStatus();
            setIsAuthenticated(fastAuth ?? false);
          }
        }
      } catch {
        if (isMounted) {
          const fastAuth = getFastAuthStatus();
          setIsAuthenticated(fastAuth ?? false);
        }
      }
    };

    checkAuth();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED' || (event === 'INITIAL_SESSION' && session)) {
        setIsAuthenticated(true);
      } else if (event === 'SIGNED_OUT') {
        // Only kick user to auth if they explicitly clicked sign out
        if (sessionStorage.getItem('chatr_explicit_signout') === '1') {
          setIsAuthenticated(false);
        }
      }
    });

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, []);

  // Show loading state while checking auth ONLY if no token was found and we're verifying
  if (isAuthenticated === null) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <div className="text-center space-y-2">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-secondary text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  // Redirect to auth if not authenticated
  if (!isAuthenticated) {
    return <Navigate to="/auth" state={{ from: location }} replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
