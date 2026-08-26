import React, { useState, useEffect } from 'react';
import { Navigate, useLocation, Link } from 'react-router-dom';
import { ShieldAlert, Lock, ArrowLeft, ShieldCheck, AlertOctagon } from 'lucide-react';
import { verifySuperAdminStatus, logAdminAction, SUPER_ADMIN_PHONES } from '../services/admin/superAdminAuth';

interface SuperAdminRouteProps {
  children: React.ReactNode;
}

export const SuperAdminRoute: React.FC<SuperAdminRouteProps> = ({ children }) => {
  const [loading, setLoading] = useState(true);
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [userPhone, setUserPhone] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const location = useLocation();

  useEffect(() => {
    let mounted = true;

    async function checkAuth() {
      const status = await verifySuperAdminStatus();
      if (!mounted) return;

      setUserPhone(status.phone);
      setUserId(status.userId);
      setIsAuthorized(status.isSuperAdmin);
      setLoading(false);

      if (status.userId && !status.isSuperAdmin) {
        logAdminAction({
          adminPhone: status.phone || 'UNKNOWN',
          adminUserId: status.userId,
          action: 'UNAUTHORIZED_ADMIN_ACCESS_ATTEMPT',
          category: 'CRITICAL',
          target: location.pathname,
          result: 'DENIED',
          reason: `Phone (${status.phone}) not in Super Admin allowlist (${SUPER_ADMIN_PHONES.join(', ')})`
        });
      }
    }

    checkAuth();
    return () => { mounted = false; };
  }, [location.pathname]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center text-white space-y-4">
        <div className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
        <div className="text-xs font-mono text-slate-400 tracking-wider uppercase">Verifying Super Admin Authorization...</div>
      </div>
    );
  }

  // Not logged in -> Redirect to auth
  if (!userId) {
    return <Navigate to="/auth" state={{ from: location }} replace />;
  }

  // Logged in but not in Super Admin phone allowlist -> Strict 403 Security Screen
  if (!isAuthorized) {
    return (
      <div className="min-h-screen bg-slate-950 text-white flex flex-col items-center justify-center p-6 text-center font-sans">
        <div className="max-w-md w-full bg-slate-900 border border-rose-500/40 rounded-2xl p-8 space-y-6 shadow-2xl">
          <div className="w-16 h-16 rounded-2xl bg-rose-500/10 border border-rose-500/30 flex items-center justify-center mx-auto text-rose-400">
            <Lock className="w-8 h-8" />
          </div>

          <div className="space-y-2">
            <span className="px-2.5 py-0.5 rounded-full bg-rose-500/10 text-rose-400 border border-rose-500/20 text-[10px] font-mono font-bold uppercase tracking-wider">
              Access Restricted
            </span>
            <h1 className="text-xl sm:text-2xl font-black text-white">Super Admin Control Plane</h1>
            <p className="text-xs text-slate-400 leading-relaxed">
              This environment is strictly gated and restricted to verified organizational Super Administrators.
            </p>
          </div>

          <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 text-left space-y-2 font-mono text-[11px]">
            <div className="flex justify-between text-slate-400">
              <span>Your Session Account:</span>
              <span className="text-rose-400 font-bold">{userPhone || 'No Phone Detected'}</span>
            </div>
            <div className="flex justify-between text-slate-400">
              <span>Required Permission:</span>
              <span className="text-indigo-400 font-bold">SUPER_ADMIN</span>
            </div>
            <div className="flex justify-between text-slate-400">
              <span>Audit Status:</span>
              <span className="text-amber-400 font-bold">Event Logged</span>
            </div>
          </div>

          <div className="pt-2">
            <Link
              to="/business"
              className="inline-flex items-center justify-center gap-2 w-full py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs transition-colors border border-slate-700"
            >
              <ArrowLeft className="w-4 h-4" /> Return to Application Workspace
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};

export default SuperAdminRoute;
