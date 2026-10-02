import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Shield, Sparkles, Smartphone, CreditCard, Settings, 
  ChevronRight, LogOut, Lock, Bell, User, Edit3, Heart
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { SEOHead } from '@/components/SEOHead';
import { PrivacyExplanationModal } from '@/components/ai/PrivacyExplanationModal';
import { ProfileEditDialog } from '@/components/ProfileEditDialog';

export default function ModernProfileSettingsView() {
  const navigate = useNavigate();
  const [profile, setProfile] = useState<any>(null);
  const [privacyModalOpen, setPrivacyModalOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

  const fetchProfile = () => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) return;
      supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .maybeSingle()
        .then(({ data }) => setProfile(data));
    });
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  const displayName = profile?.full_name || profile?.username || 'Arshid Hussain Wani';

  const menuItems = [
    {
      id: 'health-profile',
      label: 'Health & Wellness Profile',
      icon: Heart,
      color: 'text-rose-400',
      action: () => navigate('/health/food/profile'),
    },
    {
      id: 'privacy',
      label: 'Your Data & Privacy',
      icon: Shield,
      color: 'text-emerald-400',
      action: () => setPrivacyModalOpen(true),
    },
    {
      id: 'ai-activity',
      label: 'SI Activity',
      icon: Sparkles,
      color: 'text-violet-400',
      action: () => navigate('/ai-assistant'),
    },
    {
      id: 'connected-apps',
      label: 'Connected Apps',
      icon: Smartphone,
      color: 'text-sky-400',
      action: () => navigate('/health/devices'),
    },
    {
      id: 'payments',
      label: 'Payments',
      icon: CreditCard,
      color: 'text-amber-400',
      action: () => navigate('/chatr-wallet'),
    },
    {
      id: 'settings',
      label: 'Settings',
      icon: Settings,
      color: 'text-slate-400',
      action: () => navigate('/settings'),
    },
  ];

  return (
    <div
      className="flex flex-col min-h-screen pb-32 text-white font-sans select-none"
      style={{
        background: 'radial-gradient(circle at 50% 0%, #16172B 0%, #0B0E14 50%, #07090E 100%)'
      }}
    >
      <SEOHead title="More | CHATR OS" description="Profile and settings management" />

      <div className="mx-auto max-w-[540px] w-full px-4 pt-4 space-y-5">
        
        {/* ── Header (Image 2 Screen 10) ───────────────────── */}
        <header className="pt-1">
          <h1 className="text-[26px] font-black text-white tracking-tight">
            More
          </h1>
        </header>

        {/* ── User Profile Card ────────────────────────────── */}
        <div 
          onClick={() => setIsEditDialogOpen(true)}
          className="rounded-[24px] bg-white/[0.04] border border-white/[0.08] p-4 backdrop-blur-xl shadow-lg shadow-black/20 flex items-center justify-between gap-4 cursor-pointer hover:border-white/15 active:scale-[0.99] transition-all"
        >
          <div className="flex items-center gap-3.5 min-w-0">
            <Avatar className="h-14 w-14 rounded-full ring-2 ring-white/15">
              <AvatarImage src={profile?.avatar_url} className="object-cover" />
              <AvatarFallback className="bg-gradient-to-br from-violet-600 to-indigo-700 text-white font-bold text-lg">
                {displayName[0]?.toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div className="min-w-0">
              <h2 className="text-[17px] font-bold text-white tracking-tight truncate">
                {displayName}
              </h2>
              <p className="text-[13px] text-slate-400 mt-0.5">
                View & Edit profile
              </p>
            </div>
          </div>
          <ChevronRight className="w-5 h-5 text-slate-400 shrink-0" />
        </div>

        {/* ── Settings Menu Card ───────────────────────────── */}
        <div className="rounded-[24px] bg-white/[0.04] border border-white/[0.08] divide-y divide-white/[0.05] backdrop-blur-xl shadow-lg shadow-black/20 overflow-hidden">
          {menuItems.map((item) => (
            <button
              key={item.id}
              onClick={item.action}
              className="w-full flex items-center justify-between p-4 hover:bg-white/[0.02] active:bg-white/[0.05] transition-colors text-left"
            >
              <div className="flex items-center gap-3.5 min-w-0">
                <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/[0.06] border border-white/10 shrink-0">
                  <item.icon className={`w-4.5 h-4.5 ${item.color}`} />
                </span>
                <span className="text-[14.5px] font-semibold text-white tracking-tight">
                  {item.label}
                </span>
              </div>
              <ChevronRight className="w-4 h-4 text-slate-400 shrink-0" />
            </button>
          ))}
        </div>

        {/* ── Sign Out Button ──────────────────────────────── */}
        <div className="pt-2">
          <button
            onClick={async () => {
              const { performLogout } = await import('@/utils/logout');
              await performLogout();
              navigate('/auth');
            }}
            className="w-full py-3.5 px-4 rounded-2xl bg-white/[0.03] border border-white/[0.06] hover:bg-rose-500/10 hover:border-rose-500/20 text-rose-400 font-semibold text-[13.5px] flex items-center justify-center gap-2 transition-all"
          >
            <LogOut className="w-4 h-4" />
            <span>Sign out</span>
          </button>
        </div>

      </div>

      <PrivacyExplanationModal
        isOpen={privacyModalOpen}
        onClose={() => setPrivacyModalOpen(false)}
        title="Your Data & Privacy"
        actionSummary="CHATR operates with zero cloud egress for your personal communications and biometric baselines."
      />

      <ProfileEditDialog
        profile={profile}
        open={isEditDialogOpen}
        onOpenChange={setIsEditDialogOpen}
        onProfileUpdated={fetchProfile}
      />
    </div>
  );
}
