import React, { useState, useEffect, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';
import { User, Camera, Mail, Phone, Globe, Briefcase, Save, Loader2, CheckCircle, ArrowLeft, Trash2, Upload } from 'lucide-react';
import { toast } from 'sonner';
import { useAppearanceStore } from '@/hooks/useAppearanceStore';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { formatPhoneDisplay } from '@/core/phone/phoneIdentity';

export const DesktopProfile: React.FC = () => {
  const { themeMode } = useAppearanceStore();
  const isDark = themeMode === 'dark';
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [saved, setSaved] = useState(false);
  const [userId, setUserId] = useState<string>('');
  const [profile, setProfile] = useState({
    full_name: '',
    username: '',
    bio: '',
    phone: '',
    website: '',
    occupation: '',
    avatar_url: '',
  });

  useEffect(() => {
    const fetchProfile = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        navigate('/auth');
        return;
      }
      setUserId(user.id);

      const [{ data: profileData }, { data: userData }] = await Promise.all([
        supabase.from('profiles').select('*').eq('id', user.id).maybeSingle(),
        supabase.from('profiles').select('*').eq('id', user.id).maybeSingle()
      ]);

      const fullName = profileData?.full_name || userData?.full_name || user.user_metadata?.full_name || '';
      const rawUsername = profileData?.username || userData?.username || '';
      const cleanUsername = (rawUsername && !rawUsername.startsWith('user_')) 
        ? rawUsername 
        : fullName ? fullName.toLowerCase().replace(/\s+/g, '_').slice(0, 20) : '';

      const pData = profileData as unknown as Record<string, string | undefined>;
      const rawPhone = pData?.phone || userData?.phone_number || user.phone || '';

      setProfile({
        full_name: fullName,
        username: cleanUsername,
        bio: pData?.bio || '',
        phone: rawPhone,
        website: pData?.website || '',
        occupation: pData?.occupation || '',
        avatar_url: profileData?.avatar_url || userData?.avatar_url || '',
      });
      setLoading(false);
    };
    fetchProfile();
  }, [navigate]);

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !userId) return;

    try {
      setUploading(true);
      const ext = file.name.split('.').pop() || 'jpg';
      const fileName = `${userId}-${Date.now()}.${ext}`;

      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(fileName, file, { upsert: true });

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(fileName);

      setProfile(prev => ({ ...prev, avatar_url: publicUrl }));

      await Promise.all([
        supabase.from('profiles').update({ avatar_url: publicUrl }).eq('id', userId),
        supabase.from('profiles').update({ avatar_url: publicUrl }).eq('id', userId)
      ]);

      toast.success('Profile picture updated!');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to upload image';
      toast.error(msg);
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleRemoveAvatar = async () => {
    if (!userId) return;
    try {
      setProfile(prev => ({ ...prev, avatar_url: '' }));
      await Promise.all([
        supabase.from('profiles').update({ avatar_url: null }).eq('id', userId),
        supabase.from('profiles').update({ avatar_url: null }).eq('id', userId)
      ]);
      toast.success('Profile picture removed');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to remove picture';
      toast.error(msg);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      if (!userId) throw new Error('Not authenticated');
      
      const cleanUsername = profile.username.trim() || profile.full_name.toLowerCase().replace(/\s+/g, '_').slice(0, 20) || `user_${userId.slice(0, 8)}`;

      await Promise.all([
        supabase.from('profiles').update({
          full_name: profile.full_name,
          username: cleanUsername,
          avatar_url: profile.avatar_url,
          bio: profile.bio,
          phone: profile.phone,
          website: profile.website,
          occupation: profile.occupation,
        } as unknown as Record<string, unknown>).eq('id', userId),

        supabase.from('profiles').update({
          full_name: profile.full_name,
          display_name: profile.full_name,
          username: cleanUsername,
          avatar_url: profile.avatar_url,
        }).eq('id', userId)
      ]);
      
      setSaved(true);
      toast.success('Profile saved successfully');
      setTimeout(() => setSaved(false), 3000);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to save profile';
      toast.error(msg);
    } finally {
      setSaving(false);
    }
  };

  const bg = 'transition-colors duration-500';
  const cardBg = 'transition-colors duration-500';
  const inputBg = 'transition-colors duration-500 bg-background border-border text-foreground';
  const labelColor = 'text-muted-foreground';
  const headingColor = 'text-foreground';

  if (loading) {
    return (
      <div className={cn('flex-1 flex items-center justify-center h-full', bg)}>
        <Loader2 className="w-8 h-8 animate-spin text-indigo-400" />
      </div>
    );
  }

  const displayHandle = profile.username 
    ? `@${profile.username}` 
    : profile.full_name 
      ? `@${profile.full_name.toLowerCase().replace(/\s+/g, '_')}` 
      : '';

  return (
    <div className={cn('flex-1 flex flex-col h-full overflow-hidden', bg)}>
      <input 
        type="file" 
        ref={fileInputRef} 
        accept="image/*" 
        className="hidden" 
        onChange={handleAvatarUpload} 
      />

      <div className={cn('h-14 border-b flex items-center px-4 shrink-0', cardBg)}>
        <Button variant="ghost" size="icon" onClick={() => navigate('/desktop/settings')} className="mr-2">
          <ArrowLeft className="w-5 h-5 text-slate-500" />
        </Button>
        <h1 className={cn('text-secondary font-semibold', headingColor)}>Edit Profile</h1>
      </div>

      <div className="flex-1 overflow-y-auto p-8">
        <div className="max-w-2xl mx-auto space-y-8">
          
          {/* Avatar Section */}
          <div className="flex items-center gap-6">
            <div 
              onClick={() => fileInputRef.current?.click()}
              className="relative group cursor-pointer"
              title="Click to upload new picture"
            >
              <div className="w-24 h-24 rounded-2xl overflow-hidden bg-indigo-500/10 flex items-center justify-center border-2 border-indigo-500/20">
                {profile.avatar_url ? (
                  <img src={profile.avatar_url} alt="Profile" className="w-full h-full object-cover" />
                ) : (
                  <User className="w-10 h-10 text-indigo-500" />
                )}
              </div>
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity rounded-2xl flex items-center justify-center">
                {uploading ? (
                  <Loader2 className="w-6 h-6 text-white animate-spin" />
                ) : (
                  <Camera className="w-6 h-6 text-white" />
                )}
              </div>
            </div>
            <div>
              <h2 className={cn('text-workspace font-bold', headingColor)}>{profile.full_name || 'Your Name'}</h2>
              {displayHandle && <p className={labelColor}>{displayHandle}</p>}
              <div className="mt-2 flex gap-2">
                <button 
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploading}
                  className="text-button px-3.5 py-1.5 rounded-full bg-indigo-500 text-white hover:bg-indigo-600 transition-colors flex items-center gap-1.5 text-xs font-semibold"
                >
                  {uploading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Upload className="w-3.5 h-3.5" />}
                  Upload new picture
                </button>
                {profile.avatar_url && (
                  <button 
                    type="button"
                    onClick={handleRemoveAvatar}
                    className={cn('text-label px-3 py-1.5 rounded-full border transition-colors flex items-center gap-1 text-xs', isDark ? 'border-white/10 text-red-400 hover:bg-red-500/10' : 'border-slate-200 text-red-600 hover:bg-red-50')}
                  >
                    <Trash2 className="w-3 h-3" />
                    Remove
                  </button>
                )}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Basic Info */}
            <div className={cn('p-6 rounded-2xl border', cardBg)}>
              <h3 className={cn('text-secondary font-semibold mb-4', headingColor)}>Basic Information</h3>
              <div className="space-y-4">
                <div className="space-y-1.5">
                  <label className={cn('text-label', labelColor)}>Full Name</label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                      type="text"
                      value={profile.full_name}
                      onChange={e => setProfile({...profile, full_name: e.target.value})}
                      className={cn('w-full pl-9 pr-3 py-2 rounded-lg border text-secondary outline-none transition-colors', inputBg)}
                      placeholder="e.g. Sanobar Jahan"
                    />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <label className={cn('text-label', labelColor)}>Username</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                      type="text"
                      value={profile.username}
                      onChange={e => setProfile({...profile, username: e.target.value})}
                      className={cn('w-full pl-9 pr-3 py-2 rounded-lg border text-secondary outline-none transition-colors', inputBg)}
                      placeholder="e.g. sanobar_jahan"
                    />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <label className={cn('text-label', labelColor)}>Bio</label>
                  <textarea
                    value={profile.bio}
                    onChange={e => setProfile({...profile, bio: e.target.value})}
                    rows={3}
                    className={cn('w-full p-3 rounded-lg border text-secondary outline-none transition-colors resize-none', inputBg)}
                    placeholder="Tell us a bit about yourself..."
                  />
                </div>
              </div>
            </div>

            {/* Additional Details */}
            <div className={cn('p-6 rounded-2xl border', cardBg)}>
              <h3 className={cn('text-secondary font-semibold mb-4', headingColor)}>Additional Details</h3>
              <div className="space-y-4">
                <div className="space-y-1.5">
                  <label className={cn('text-label', labelColor)}>Phone Number</label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                      type="tel"
                      value={formatPhoneDisplay(profile.phone) || profile.phone}
                      onChange={e => setProfile({...profile, phone: e.target.value})}
                      className={cn('w-full pl-9 pr-3 py-2 rounded-lg border text-secondary outline-none transition-colors', inputBg)}
                      placeholder="+91 99106 78611"
                    />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <label className={cn('text-label', labelColor)}>Website</label>
                  <div className="relative">
                    <Globe className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                      type="url"
                      value={profile.website}
                      onChange={e => setProfile({...profile, website: e.target.value})}
                      className={cn('w-full pl-9 pr-3 py-2 rounded-lg border text-secondary outline-none transition-colors', inputBg)}
                      placeholder="https://chatr.chat"
                    />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <label className={cn('text-label', labelColor)}>Occupation</label>
                  <div className="relative">
                    <Briefcase className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                      type="text"
                      value={profile.occupation}
                      onChange={e => setProfile({...profile, occupation: e.target.value})}
                      className={cn('w-full pl-9 pr-3 py-2 rounded-lg border text-secondary outline-none transition-colors', inputBg)}
                      placeholder="Executive / Manager"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-end pt-4 pb-12">
            <button
              onClick={handleSave}
              disabled={saving}
              className="px-6 py-2.5 rounded-lg bg-indigo-500 text-white font-medium text-button hover:bg-indigo-600 transition-colors flex items-center gap-2 shadow-lg shadow-indigo-500/20 disabled:opacity-50"
            >
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : saved ? <CheckCircle className="w-4 h-4" /> : <Save className="w-4 h-4" />}
              {saving ? 'Saving...' : saved ? 'Saved!' : 'Save Changes'}
            </button>
          </div>

        </div>
      </div>
    </div>
  );
};
