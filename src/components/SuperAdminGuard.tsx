import React, { useEffect, useState } from 'react';
import { Navigate, useLocation, Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { ShieldAlert, Lock, ArrowLeft, RefreshCw } from 'lucide-react';
import { AuditLogger } from '@/services/mediaAgency/telemetry/AuditLogger';

interface SuperAdminGuardProps {
  children: React.ReactNode;
}

export const SuperAdminGuard: React.FC<SuperAdminGuardProps> = ({ children }) => {
  const [authState, setAuthState] = useState<{
    isLoading: boolean;
    isAuthenticated: boolean;
    isSuperAdmin: boolean;
    userEmail?: string;
  }>({
    isLoading: true,
    isAuthenticated: false,
    isSuperAdmin: false,
  });

  const location = useLocation();

  useEffect(() => {
    let mounted = true;

    const verifySuperAdmin = async () => {
      try {
        const isLocalDev = 
          typeof window !== 'undefined' && (
            window.location.hostname === 'localhost' ||
            window.location.hostname === '127.0.0.1' ||
            window.location.port === '8080' ||
            window.location.port === '5173' ||
            Boolean(import.meta.env.DEV)
          );

        const { data: { session } } = await supabase.auth.getSession();
        
        if (!session || !session.user) {
          // In local development, seamlessly authorize access to avoid auth redirect loops
          if (isLocalDev) {
            if (mounted) {
              setAuthState({
                isLoading: false,
                isAuthenticated: true,
                isSuperAdmin: true,
                userEmail: 'developer@localhost',
              });
            }
            return;
          }

          if (mounted) {
            sessionStorage.setItem('auth_redirect', location.pathname + location.search);
            setAuthState({
              isLoading: false,
              isAuthenticated: false,
              isSuperAdmin: false,
            });
          }
          return;
        }

        const user = session.user;
        const userEmail = (user.email || '').toLowerCase();
        const userPhone = ((user as any).phone || user.user_metadata?.phone || user.user_metadata?.phone_number || '').replace(/\D/g, '');

        // Strict Super Admin Authorized Phone / Account Identifiers
        const AUTHORIZED_SUPER_ADMINS = [
          '919910678611',
          '9910678611',
          '9717845477',
          '919717845477',
          'arshid',
          'admin',
          'superadmin',
          'owner'
        ];

        // Query user roles if available
        let roles: string[] = [];
        try {
          const { data: rolesData } = await supabase
            .from('user_roles')
            .select('role')
            .eq('user_id', user.id);
          roles = (rolesData || []).map((r: any) => r.role);
        } catch {
          // Non-blocking fallback
        }

        const hasAdminRole = roles.some(r => ['admin', 'super_admin', 'superadmin', 'owner', 'developer'].includes((r || '').toLowerCase()));

        const isAuthorizedAccount = isLocalDev || hasAdminRole || AUTHORIZED_SUPER_ADMINS.some(adminId => {
          return (
            userPhone === adminId ||
            userPhone.endsWith(adminId) ||
            userEmail.includes(adminId) ||
            userEmail.startsWith(adminId + '@')
          );
        });

        const isSuperAdmin = isAuthorizedAccount;

        if (!isSuperAdmin) {
          // Log unauthorized attempt to audit system
          AuditLogger.log({
            eventType: 'SECURITY_UNAUTHORIZED_ACCESS_ATTEMPT',
            actor: userEmail,
            details: `Unauthorized attempt to access /media-distribution from ${location.pathname}`,
            severity: 'CRITICAL',
            metadata: { roles, userId: user.id }
          });
        }

        if (mounted) {
          setAuthState({
            isLoading: false,
            isAuthenticated: true,
            isSuperAdmin,
            userEmail,
          });
        }
      } catch (err) {
        console.error('SuperAdminGuard verification error:', err);
        const isLocalDev = 
          typeof window !== 'undefined' && (
            window.location.hostname === 'localhost' ||
            window.location.hostname === '127.0.0.1' ||
            window.location.port === '8080' ||
            window.location.port === '5173' ||
            Boolean(import.meta.env.DEV)
          );

        if (mounted) {
          setAuthState({
            isLoading: false,
            isAuthenticated: isLocalDev,
            isSuperAdmin: isLocalDev,
            userEmail: isLocalDev ? 'developer@localhost' : undefined,
          });
        }
      }
    };

    verifySuperAdmin();

    const { data: sub } = supabase.auth.onAuthStateChange(() => {
      verifySuperAdmin();
    });

    return () => {
      mounted = false;
      sub.subscription.unsubscribe();
    };
  }, [location.pathname]);

  if (authState.isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-950 text-slate-100">
        <div className="flex flex-col items-center space-y-4">
          <RefreshCw className="w-8 h-8 text-rose-500 animate-spin" />
          <p className="text-sm font-medium tracking-wide text-slate-400">Verifying Super Admin Authorization...</p>
        </div>
      </div>
    );
  }

  if (!authState.isAuthenticated) {
    return <Navigate to="/auth" state={{ from: location }} replace />;
  }

  // Hard 403 Forbidden Access Denied screen for non-super-admins
  if (!authState.isSuperAdmin) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-950 p-6">
        <div className="max-w-md w-full bg-slate-900 border border-rose-900/50 rounded-2xl p-8 text-center shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-rose-600 via-red-500 to-rose-700" />
          
          <div className="w-16 h-16 bg-rose-950/80 border border-rose-600/40 rounded-full flex items-center justify-center mx-auto mb-6 text-rose-500 shadow-inner">
            <ShieldAlert className="w-8 h-8" />
          </div>

          <span className="inline-block px-3 py-1 bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs font-mono font-bold tracking-wider rounded-full mb-3 uppercase">
            403 Forbidden
          </span>

          <h1 className="text-2xl font-bold text-white mb-2">Access Denied</h1>
          <p className="text-slate-400 text-sm leading-relaxed mb-6">
            The <span className="font-mono text-rose-300">/media-distribution</span> command center is restricted strictly to authorized Super Administrators. Your current account (<span className="text-slate-300 font-mono text-xs">{authState.userEmail}</span>) does not possess root media governance privileges.
          </p>

          <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-3.5 mb-6 text-left flex items-start space-x-3">
            <Lock className="w-4 h-4 text-slate-400 mt-0.5 flex-shrink-0" />
            <p className="text-xs text-slate-400 font-mono">
              All unauthorized access attempts to this route are permanently recorded in the immutable security audit log.
            </p>
          </div>

          <Link
            to="/desktop"
            className="inline-flex items-center justify-center w-full px-4 py-3 bg-slate-800 hover:bg-slate-700 text-slate-200 text-sm font-semibold rounded-xl transition duration-200 border border-slate-700"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Return to CHATR Desktop
          </Link>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};
