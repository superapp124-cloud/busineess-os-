import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ProfileEditDialog } from '@/components/ProfileEditDialog';
import { VerifiedBadge } from '@/components/profile/VerifiedBadge';
import { MutualFriendsDisplay } from '@/components/profile/MutualFriendsDisplay';
import { PhotoAlbumsGrid } from '@/components/profile/PhotoAlbumsGrid';
import { 
  User, 
  Heart, 
  Coins, 
  Settings, 
  Smartphone, 
  LogOut,
  ChevronRight,
  Shield,
  Bell,
  Fingerprint,
  Bot,
  Globe,
  Folder,
  Palette,
  Image as ImageIcon
} from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useNativeHaptics } from '@/hooks/useNativeHaptics';

export default function Profile() {
  const haptics = useNativeHaptics();
  const navigate = useNavigate();
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  
  // Dynamic stats
  const [badges, setBadges] = useState<any[]>([]);
  const [identityCount, setIdentityCount] = useState<number>(0);
  const [aiCloneCount, setAiCloneCount] = useState<number>(0);
  const [pointsBalance, setPointsBalance] = useState<number>(565);
  const [isDiscoverable, setIsDiscoverable] = useState<boolean>(false);
  const [healthRecordCount, setHealthRecordCount] = useState<number>(0);
  const [deviceCount, setDeviceCount] = useState<number>(3);

  useEffect(() => {
    loadUserData();
  }, []);

  // Ensure onboarding is completed
  useEffect(() => {
    const markOnboardingComplete = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        await supabase
          .from('profiles')
          .update({ onboarding_completed: true })
          .eq('id', session.user.id);
      }
    };
    markOnboardingComplete();
  }, []);

  const loadBadges = async (userId: string) => {
    try {
      const { data } = await supabase
        .from('user_badges')
        .select('id, badge_type, is_active')
        .eq('user_id', userId)
        .eq('is_active', true);
      setBadges(data || []);
    } catch {
      setBadges([]);
    }
  };

  const loadUserData = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        navigate('/auth');
        return;
      }

      setUser(session.user);

      const { data: profileData } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', session.user.id)
        .maybeSingle();
      setProfile(profileData);

      await loadBadges(session.user.id);

      try {
        const { count: idCount } = await supabase.from('identities').select('*', { count: 'exact', head: true }).eq('user_id', session.user.id);
        if (idCount !== null && idCount > 0) setIdentityCount(idCount);

        const { count: aiCount } = await supabase.from('identities').select('*', { count: 'exact', head: true }).eq('user_id', session.user.id).eq('ai_clone_enabled', true);
        if (aiCount !== null) setAiCloneCount(aiCount);
      } catch (e) { console.error('Identity fetch error', e); }

      try {
        const { data: pts } = await supabase.from('user_points').select('balance').eq('user_id', session.user.id).maybeSingle();
        if (pts?.balance !== undefined && pts?.balance !== null) setPointsBalance(pts.balance);
      } catch (e) { console.error('Points fetch error', e); }

      try {
        const { data: disc } = await supabase.from('discover_profiles').select('is_searchable').eq('user_id', session.user.id).maybeSingle();
        if (disc) setIsDiscoverable(disc.is_searchable);
      } catch (e) { console.error('Discover fetch error', e); }

      try {
        const { count: healthCount } = await supabase.from('health_records').select('*', { count: 'exact', head: true }).eq('user_id', session.user.id);
        if (healthCount !== null) setHealthRecordCount(healthCount);
      } catch (e) { console.error('Health fetch error', e); }

      try {
        const { count: dCount } = await supabase.from('user_devices').select('*', { count: 'exact', head: true }).eq('user_id', session.user.id);
        if (dCount !== null && dCount > 0) setDeviceCount(dCount);
      } catch (e) { console.error('Device fetch error', e); }

    } catch (error) {
      console.error('Error loading profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    const { performLogout } = await import('@/utils/logout');
    await performLogout();
    navigate('/auth');
  };

  if (loading) {
    return (
      <div className="flex h-full min-h-screen items-center justify-center bg-[#F8FAFC]">
        <div className="text-slate-400 text-sm font-medium">Loading profile...</div>
      </div>
    );
  }

  const displayName = profile?.username || profile?.full_name || 'User AI Testing';
  let displayStatus = profile?.status || profile?.bio || 'hello world';
  try {
    if (typeof displayStatus === 'string' && displayStatus.trim().startsWith('{')) {
      const parsed = JSON.parse(displayStatus);
      displayStatus = parsed.captionText || parsed.text || parsed.status || displayStatus;
    }
  } catch {
    // Keep raw string if parsing fails
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] pb-44 pt-safe">
      {/* Profile Header */}
      <div className="px-5 pt-8 pb-5 flex flex-col items-center text-center">
        {/* Squircle Glowing Purple Avatar */}
        <div className="relative mb-3.5">
          <Avatar className="h-20 w-20 rounded-[26px] border-2 border-white shadow-[0_8px_24px_rgba(124,58,237,0.22)] bg-gradient-to-tr from-violet-600 via-purple-600 to-indigo-500 overflow-hidden">
            <AvatarImage src={profile?.avatar_url} className="h-full w-full object-cover" />
            <AvatarFallback className="bg-transparent text-white text-2xl font-bold flex items-center justify-center">
              <Smartphone className="h-9 w-9 text-white/90" />
            </AvatarFallback>
          </Avatar>
        </div>

        {/* Display Name */}
        <div className="flex items-center justify-center gap-1.5 mb-0.5">
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">
            {displayName}
          </h1>
          {badges.map((badge) => (
            <VerifiedBadge 
              key={badge.id}
              type={badge.badge_type as 'verified' | 'creator' | 'business' | 'celebrity'}
              size="md"
            />
          ))}
        </div>

        {/* Bio / Status */}
        <p className="text-[13px] text-slate-500 font-medium mb-3">
          {displayStatus}
        </p>

        {/* Edit Profile Pill Button */}
        <button
          onClick={() => {
            haptics.light();
            setIsEditDialogOpen(true);
          }}
          className="px-5 py-1.5 rounded-full bg-white border border-slate-200/90 text-[13px] font-semibold text-slate-700 shadow-sm active:scale-95 transition-all"
        >
          Edit Profile
        </button>
      </div>

      {/* Tabs */}
      <div className="px-4">
        <Tabs defaultValue="settings" className="w-full">
          <TabsList className="w-full grid grid-cols-3 bg-slate-200/70 p-1 rounded-2xl h-11 mb-4">
            <TabsTrigger 
              value="settings" 
              className="rounded-xl text-xs font-semibold data-[state=active]:bg-white data-[state=active]:text-slate-900 data-[state=active]:shadow-sm text-slate-500"
            >
              Settings
            </TabsTrigger>
            <TabsTrigger 
              value="albums" 
              className="rounded-xl text-xs font-semibold data-[state=active]:bg-white data-[state=active]:text-slate-900 data-[state=active]:shadow-sm text-slate-500"
            >
              Albums
            </TabsTrigger>
            <TabsTrigger 
              value="social" 
              className="rounded-xl text-xs font-semibold data-[state=active]:bg-white data-[state=active]:text-slate-900 data-[state=active]:shadow-sm text-slate-500"
            >
              Social
            </TabsTrigger>
          </TabsList>

          {/* Settings Tab Content */}
          <TabsContent value="settings" className="space-y-4 m-0">
            {/* Card 1: Identity & Social */}
            <div className="bg-white rounded-2xl border border-slate-100 shadow-[0_2px_12px_rgba(15,23,42,0.03)] divide-y divide-slate-100 overflow-hidden">
              <button
                onClick={() => { haptics.light(); navigate('/identity'); }}
                className="w-full flex items-center gap-3.5 p-3.5 text-left active:bg-slate-50 transition-colors"
              >
                <div className="h-10 w-10 rounded-xl bg-indigo-50 flex items-center justify-center flex-shrink-0">
                  <Fingerprint className="h-5 w-5 text-indigo-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-[14px] font-semibold text-slate-900 leading-snug">CHATR++ Identity</h3>
                  <p className="text-[12px] text-slate-500 truncate">
                    {profile?.primary_handle 
                      ? `@${profile.primary_handle} • ${identityCount || 1} identities` 
                      : 'Claim your handle'}
                  </p>
                </div>
                <ChevronRight className="h-4 w-4 text-slate-400 flex-shrink-0" />
              </button>

              <button
                onClick={() => { haptics.light(); navigate('/ai-clone-settings'); }}
                className="w-full flex items-center gap-3.5 p-3.5 text-left active:bg-slate-50 transition-colors"
              >
                <div className="h-10 w-10 rounded-xl bg-purple-50 flex items-center justify-center flex-shrink-0">
                  <Bot className="h-5 w-5 text-purple-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-[14px] font-semibold text-slate-900 leading-snug">AI Clone Settings</h3>
                  <p className="text-[12px] text-slate-500 truncate">
                    {aiCloneCount > 0 ? `${aiCloneCount} AI clone active` : 'Configure your AI identity'}
                  </p>
                </div>
                <ChevronRight className="h-4 w-4 text-slate-400 flex-shrink-0" />
              </button>

              <button
                onClick={() => { haptics.light(); navigate('/discover'); }}
                className="w-full flex items-center gap-3.5 p-3.5 text-left active:bg-slate-50 transition-colors"
              >
                <div className="h-10 w-10 rounded-xl bg-blue-50 flex items-center justify-center flex-shrink-0">
                  <Globe className="h-5 w-5 text-blue-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-[14px] font-semibold text-slate-900 leading-snug">Discover People</h3>
                  <p className="text-[12px] text-slate-500 truncate">
                    {isDiscoverable ? 'Publicly discoverable' : 'Hidden from search'}
                  </p>
                </div>
                <ChevronRight className="h-4 w-4 text-slate-400 flex-shrink-0" />
              </button>
            </div>

            {/* Card 2: Health & Rewards & Devices */}
            <div className="bg-white rounded-2xl border border-slate-100 shadow-[0_2px_12px_rgba(15,23,42,0.03)] divide-y divide-slate-100 overflow-hidden">
              <button
                onClick={() => { haptics.light(); navigate('/health/food/profile'); }}
                className="w-full flex items-center gap-3.5 p-3.5 text-left active:bg-slate-50 transition-colors"
              >
                <div className="h-10 w-10 rounded-xl bg-rose-50 flex items-center justify-center flex-shrink-0">
                  <Heart className="h-5 w-5 text-rose-500" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-[14px] font-semibold text-slate-900 leading-snug">Health & Wellness Profile</h3>
                  <p className="text-[12px] text-slate-500 truncate">
                    Biometrics, diet & meal plan
                  </p>
                </div>
                <ChevronRight className="h-4 w-4 text-slate-400 flex-shrink-0" />
              </button>

              <button
                onClick={() => { haptics.light(); navigate('/health-passport'); }}
                className="w-full flex items-center gap-3.5 p-3.5 text-left active:bg-slate-50 transition-colors"
              >
                <div className="h-10 w-10 rounded-xl bg-violet-50 flex items-center justify-center flex-shrink-0">
                  <Shield className="h-5 w-5 text-violet-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-[14px] font-semibold text-slate-900 leading-snug">Health Passport</h3>
                  <p className="text-[12px] text-slate-500 truncate">
                    {healthRecordCount > 0 ? `${healthRecordCount} medical record linked` : 'Manage health records'}
                  </p>
                </div>
                <ChevronRight className="h-4 w-4 text-slate-400 flex-shrink-0" />
              </button>

              <button
                onClick={() => { haptics.light(); navigate('/chatr-points'); }}
                className="w-full flex items-center gap-3.5 p-3.5 text-left active:bg-slate-50 transition-colors"
              >
                <div className="h-10 w-10 rounded-xl bg-amber-50 flex items-center justify-center flex-shrink-0">
                  <Coins className="h-5 w-5 text-amber-500" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-[14px] font-semibold text-slate-900 leading-snug">Chatr Points</h3>
                  <p className="text-[12px] text-slate-500 truncate">
                    {pointsBalance ? `${pointsBalance.toLocaleString()} points balance` : '565 points balance'}
                  </p>
                </div>
                <ChevronRight className="h-4 w-4 text-slate-400 flex-shrink-0" />
              </button>

              <button
                onClick={() => { haptics.light(); navigate('/device-management'); }}
                className="w-full flex items-center gap-3.5 p-3.5 text-left active:bg-slate-50 transition-colors"
              >
                <div className="h-10 w-10 rounded-xl bg-sky-50 flex items-center justify-center flex-shrink-0">
                  <Smartphone className="h-5 w-5 text-sky-500" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-[14px] font-semibold text-slate-900 leading-snug">Device Management</h3>
                  <p className="text-[12px] text-slate-500 truncate">
                    {deviceCount > 0 ? `${deviceCount} linked devices` : 'Manage linked devices'}
                  </p>
                </div>
                <ChevronRight className="h-4 w-4 text-slate-400 flex-shrink-0" />
              </button>
            </div>

            {/* Card 3: SETTINGS Section */}
            <div className="space-y-1.5">
              <p className="px-1 text-[11px] font-bold uppercase tracking-wider text-slate-400">
                SETTINGS
              </p>
              <div className="bg-white rounded-2xl border border-slate-100 shadow-[0_2px_12px_rgba(15,23,42,0.03)] divide-y divide-slate-100 overflow-hidden">
                <button
                  onClick={() => { haptics.light(); navigate('/settings/chat-folders'); }}
                  className="w-full flex items-center gap-3.5 p-3.5 text-left active:bg-slate-50 transition-colors"
                >
                  <div className="h-9 w-9 rounded-xl bg-indigo-50 flex items-center justify-center flex-shrink-0">
                    <Folder className="h-4 w-4 text-[#5c22ff]" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-[14px] font-semibold text-slate-900 leading-snug">Chat Folders</h3>
                    <p className="text-[12px] text-slate-500 truncate">Organize your chats</p>
                  </div>
                  <ChevronRight className="h-4 w-4 text-slate-400 flex-shrink-0" />
                </button>

                <button
                  onClick={() => { haptics.light(); navigate('/settings/appearance'); }}
                  className="w-full flex items-center gap-3.5 p-3.5 text-left active:bg-slate-50 transition-colors"
                >
                  <div className="h-9 w-9 rounded-xl bg-purple-50 flex items-center justify-center flex-shrink-0">
                    <Palette className="h-4 w-4 text-purple-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-[14px] font-semibold text-slate-900 leading-snug">Profile Themes</h3>
                    <p className="text-[12px] text-slate-500 truncate">Customize colors</p>
                  </div>
                  <ChevronRight className="h-4 w-4 text-slate-400 flex-shrink-0" />
                </button>

                <button
                  onClick={() => { haptics.light(); navigate('/settings/wallpaper'); }}
                  className="w-full flex items-center gap-3.5 p-3.5 text-left active:bg-slate-50 transition-colors"
                >
                  <div className="h-9 w-9 rounded-xl bg-pink-50 flex items-center justify-center flex-shrink-0">
                    <ImageIcon className="h-4 w-4 text-pink-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-[14px] font-semibold text-slate-900 leading-snug">AI Wallpapers</h3>
                    <p className="text-[12px] text-slate-500 truncate">Generative backgrounds</p>
                  </div>
                  <ChevronRight className="h-4 w-4 text-slate-400 flex-shrink-0" />
                </button>

                <button
                  onClick={() => { haptics.light(); navigate('/settings/app-icon'); }}
                  className="w-full flex items-center gap-3.5 p-3.5 text-left active:bg-slate-50 transition-colors"
                >
                  <div className="h-9 w-9 rounded-xl bg-violet-50 flex items-center justify-center flex-shrink-0">
                    <Smartphone className="h-4 w-4 text-violet-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-[14px] font-semibold text-slate-900 leading-snug">App Icon</h3>
                    <p className="text-[12px] text-slate-500 truncate">Change home screen icon</p>
                  </div>
                  <ChevronRight className="h-4 w-4 text-slate-400 flex-shrink-0" />
                </button>

                <button
                  onClick={() => { haptics.light(); navigate('/notification-settings'); }}
                  className="w-full flex items-center gap-3.5 p-3.5 text-left active:bg-slate-50 transition-colors"
                >
                  <div className="h-9 w-9 rounded-xl bg-orange-50 flex items-center justify-center flex-shrink-0">
                    <Bell className="h-4 w-4 text-orange-500" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-[14px] font-semibold text-slate-900 leading-snug">Notifications</h3>
                  </div>
                  <ChevronRight className="h-4 w-4 text-slate-400 flex-shrink-0" />
                </button>

                <button
                  onClick={() => { haptics.light(); navigate('/privacy'); }}
                  className="w-full flex items-center gap-3.5 p-3.5 text-left active:bg-slate-50 transition-colors"
                >
                  <div className="h-9 w-9 rounded-xl bg-emerald-50 flex items-center justify-center flex-shrink-0">
                    <Shield className="h-4 w-4 text-emerald-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-[14px] font-semibold text-slate-900 leading-snug">Privacy & Security</h3>
                  </div>
                  <ChevronRight className="h-4 w-4 text-slate-400 flex-shrink-0" />
                </button>

                <button
                  onClick={() => { haptics.light(); navigate('/account'); }}
                  className="w-full flex items-center gap-3.5 p-3.5 text-left active:bg-slate-50 transition-colors"
                >
                  <div className="h-9 w-9 rounded-xl bg-slate-100 flex items-center justify-center flex-shrink-0">
                    <Settings className="h-4 w-4 text-slate-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-[14px] font-semibold text-slate-900 leading-snug">Account Settings</h3>
                  </div>
                  <ChevronRight className="h-4 w-4 text-slate-400 flex-shrink-0" />
                </button>
              </div>
            </div>

            {/* Sign Out link */}
            <div className="pt-2 pb-6 flex justify-center">
              <button
                onClick={handleSignOut}
                className="text-xs font-semibold text-slate-500 hover:text-red-500 transition-colors inline-flex items-center gap-1.5 active:scale-95"
              >
                <LogOut className="h-3.5 w-3.5" />
                Sign out
              </button>
            </div>
          </TabsContent>

          {/* Albums Tab */}
          <TabsContent value="albums" className="m-0 pt-1">
            <PhotoAlbumsGrid userId={user?.id} editable={true} />
          </TabsContent>

          {/* Social Tab */}
          <TabsContent value="social" className="m-0 pt-1">
            <div className="bg-white rounded-2xl border border-slate-100 p-4 shadow-sm">
              <h3 className="text-sm font-semibold text-slate-800 mb-3 flex items-center gap-2">
                <User className="w-4 h-4 text-slate-500" />
                Mutual Friends
              </h3>
              {user?.id && <MutualFriendsDisplay userId={user.id} maxDisplay={5} />}
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* Edit Profile Dialog */}
      <ProfileEditDialog
        profile={profile}
        open={isEditDialogOpen}
        onOpenChange={setIsEditDialogOpen}
        onProfileUpdated={loadUserData}
      />
    </div>
  );
}
