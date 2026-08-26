import React, { useState, useEffect } from 'react';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, Users, Building2, TrendingUp, Globe, Activity, 
  Shield, FileText, Lock, LogOut, ExternalLink, ChevronRight, CheckCircle2,
  AlertTriangle, ShieldCheck, FileCode, Layers, Search
} from 'lucide-react';
import { verifySuperAdminStatus, normalizePhone } from '../../services/admin/superAdminAuth';

export const SuperAdminLayout: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [adminPhone, setAdminPhone] = useState<string>('9910678611');

  useEffect(() => {
    verifySuperAdminStatus().then(res => {
      if (res.phone) setAdminPhone(normalizePhone(res.phone));
    });
  }, []);

  const navItems = [
    { label: 'Executive Dashboard', path: '/admin', icon: LayoutDashboard, exact: true },
    { label: '🤖 200 AI Agents Command', path: '/admin/agents', icon: Bot },
    { label: 'User Directory', path: '/admin/users', icon: Users },
    { label: 'Businesses & B2B2C', path: '/admin/businesses', icon: Building2 },
    { label: 'Growth & Telemetry', path: '/admin/growth', icon: TrendingUp },
    { label: 'SEO & Search Console', path: '/admin/seo', icon: Globe },
    { label: 'Pages & Indexation', path: '/admin/pages', icon: FileCode },
    { label: 'Sitemaps & Discovery', path: '/admin/sitemaps', icon: Layers },
    { label: 'System Health', path: '/admin/system', icon: Activity },
    { label: 'Audit Logs', path: '/admin/audit', icon: FileText },
    { label: 'Security & Roles', path: '/admin/security', icon: Shield },
  ];

  const isCurrentActive = (itemPath: string, exact?: boolean) => {
    if (exact) {
      return location.pathname === itemPath || location.pathname === `${itemPath}/dashboard`;
    }
    return location.pathname.startsWith(itemPath);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white flex flex-col md:flex-row font-sans selection:bg-indigo-500 selection:text-white">
      {/* Sidebar Navigation */}
      <aside className="w-full md:w-64 bg-slate-900 border-r border-slate-800 flex flex-col justify-between shrink-0">
        <div>
          {/* Top Brand & Security Badge */}
          <div className="p-5 border-b border-slate-800 space-y-3">
            <Link to="/admin" className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-indigo-600 flex items-center justify-center font-black text-sm text-white shadow-lg shadow-indigo-600/30">
                C
              </div>
              <div>
                <h1 className="font-extrabold text-sm tracking-tight text-white flex items-center gap-1.5">
                  CHATR <span className="text-indigo-400">ADMIN</span>
                </h1>
                <p className="text-[10px] text-slate-400 font-mono">Control Plane v4.2</p>
              </div>
            </Link>

            {/* Super Admin Phone Pill */}
            <div className="bg-slate-950 border border-indigo-500/30 rounded-xl p-2.5 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <div className="space-y-0.5">
                  <p className="text-[9px] uppercase font-mono font-bold text-slate-400">Super Admin</p>
                  <p className="text-xs font-mono font-bold text-indigo-300">+91 {adminPhone}</p>
                </div>
              </div>
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="p-3 space-y-1">
            {navItems.map(item => {
              const Icon = item.icon;
              const active = isCurrentActive(item.path, item.exact);
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                    active
                      ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon className={`w-4 h-4 ${active ? 'text-white' : 'text-slate-400'}`} />
                    <span>{item.label}</span>
                  </div>
                  {active && <ChevronRight className="w-3.5 h-3.5 opacity-80" />}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Bottom Exit & External Launch Links */}
        <div className="p-4 border-t border-slate-800 space-y-2">
          <a
            href="https://search.google.com/search-console?resource_id=https%3A%2F%2Fwww.chatrchat.in%2F"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-between px-3 py-2 rounded-lg bg-indigo-950/60 hover:bg-indigo-900 border border-indigo-500/30 text-indigo-300 hover:text-white text-xs font-bold transition-all shadow-sm"
          >
            <span className="flex items-center gap-1.5">
              <Globe className="w-3.5 h-3.5 text-indigo-400" />
              <span>Search Console ↗</span>
            </span>
            <ExternalLink className="w-3 h-3 opacity-80" />
          </a>

          <Link
            to="/business"
            className="flex items-center justify-between px-3 py-2 rounded-lg bg-slate-950 hover:bg-slate-800 border border-slate-800 text-slate-400 hover:text-slate-200 text-xs font-medium transition-colors"
          >
            <span>Open Application Workspace</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </Link>
          <p className="text-[10px] text-slate-600 text-center font-mono">
            Authorized: 9910678611 • 9717845477
          </p>
        </div>
      </aside>

      {/* Main Content View */}
      <main className="flex-1 overflow-y-auto min-h-screen bg-slate-950 p-6 sm:p-8">
        <Outlet />
      </main>
    </div>
  );
};

export default SuperAdminLayout;
