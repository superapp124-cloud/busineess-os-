import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowLeft } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export default function Privacy() {
 const navigate = useNavigate();
 const { toast } = useToast();
 const [loading, setLoading] = useState(true);
 const [settings, setSettings] = useState({
 profile_visibility: 'everyone',
 last_seen_visibility: 'everyone',
 read_receipts: true,
 typing_indicators: true,
 });

 useEffect(() => {
 loadSettings();
 
 // Subscribe to realtime updates
 const channel = supabase
 .channel('user_settings_privacy')
 .on(
 'postgres_changes',
 {
 event: '*',
 schema: 'public',
 table: 'user_settings',
 },
 (payload: any) => {
 if (payload.new) {
 setSettings({
 profile_visibility: payload.new.profile_visibility ?? 'everyone',
 last_seen_visibility: payload.new.last_seen_visibility ?? 'everyone',
 read_receipts: payload.new.read_receipts ?? true,
 typing_indicators: payload.new.typing_indicators ?? true,
 });
 }
 }
 )
 .subscribe();

 return () => {
 supabase.removeChannel(channel);
 };
 }, []);

 const loadSettings = async () => {
 try {
 const { data: { user } } = await supabase.auth.getUser();
 if (!user) return;

 const { data, error } = await supabase
 .from('user_settings')
 .select('*')
 .eq('user_id', user.id)
 .maybeSingle();

 if (error) throw error;

 if (data) {
 setSettings({
 profile_visibility: data.profile_visibility,
 last_seen_visibility: data.last_seen_visibility,
 read_receipts: data.read_receipts,
 typing_indicators: data.typing_indicators,
 });
 } else {
 // Create default settings
 await supabase.from('user_settings').insert({ user_id: user.id });
 }
 } catch (error) {
 console.error('Error loading settings:', error);
 } finally {
 setLoading(false);
 }
 };

 const updateSetting = async (key: keyof typeof settings, value: string | boolean) => {
 try {
 const { data: { user } } = await supabase.auth.getUser();
 if (!user) return;

 const { error } = await supabase
 .from('user_settings')
 .update({ [key]: value })
 .eq('user_id', user.id);

 if (error) throw error;

 setSettings(prev => ({ ...prev, [key]: value }));
 toast({ title: 'Settings updated' });
 } catch (error) {
 console.error('Error updating setting:', error);
 toast({ title: 'Failed to update settings', variant: 'destructive' });
 }
 };

 if (loading) {
 return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
 }

  return (
    <div className="min-h-screen bg-slate-50/70 text-slate-900 font-sans pb-12">
      {/* Header */}
      <div className="bg-white/90 backdrop-blur-xl border-b border-slate-200/80 sticky top-0 z-50 shadow-sm">
        <div className="max-w-4xl mx-auto px-4 py-3.5 flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate(-1)}
            className="rounded-full hover:bg-slate-100 text-slate-700"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-lg font-bold text-slate-900">Privacy & Security</h1>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 py-8 space-y-6">
        <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-3xl p-6 sm:p-8 space-y-4">
          <div>
            <h2 className="text-xl font-bold text-emerald-600">Our Privacy Commitment</h2>
            <p className="text-xs text-slate-600 mt-1">CHATR is a Privacy-First Communication OS</p>
          </div>
          <div className="space-y-2.5 text-xs text-slate-700 font-medium">
            <div className="flex items-center gap-2.5">
              <span className="text-emerald-600 font-bold">✓</span>
              <span>Contacts remain on your device</span>
            </div>
            <div className="flex items-center gap-2.5">
              <span className="text-emerald-600 font-bold">✓</span>
              <span>Emails are processed locally</span>
            </div>
            <div className="flex items-center gap-2.5">
              <span className="text-emerald-600 font-bold">✓</span>
              <span>Cloud AI is optional</span>
            </div>
            <div className="flex items-center gap-2.5">
              <span className="text-emerald-600 font-bold">✓</span>
              <span>Google Contacts are not synchronized</span>
            </div>
            <div className="flex items-center gap-2.5">
              <span className="text-emerald-600 font-bold">✓</span>
              <span>Device contacts are your primary address book</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-8 shadow-sm space-y-6">
          <div>
            <h2 className="text-lg font-bold text-slate-900">Privacy Settings</h2>
            <p className="text-xs text-slate-500 mt-0.5">Control who can see your information</p>
          </div>

          <div className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="profile-visibility" className="text-xs font-semibold text-slate-700">Profile Visibility</Label>
              <Select
                value={settings.profile_visibility}
                onValueChange={(value) => updateSetting('profile_visibility', value)}
              >
                <SelectTrigger id="profile-visibility" className="bg-slate-50 border-slate-200 rounded-xl">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="everyone">Everyone</SelectItem>
                  <SelectItem value="contacts">Contacts Only</SelectItem>
                  <SelectItem value="nobody">Nobody</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="last-seen" className="text-xs font-semibold text-slate-700">Last Seen</Label>
              <Select
                value={settings.last_seen_visibility}
                onValueChange={(value) => updateSetting('last_seen_visibility', value)}
              >
                <SelectTrigger id="last-seen" className="bg-slate-50 border-slate-200 rounded-xl">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="everyone">Everyone</SelectItem>
                  <SelectItem value="contacts">Contacts Only</SelectItem>
                  <SelectItem value="nobody">Nobody</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center justify-between pt-2">
              <div className="space-y-0.5">
                <Label htmlFor="read-receipts" className="text-xs font-semibold text-slate-700">Read Receipts</Label>
                <p className="text-xs text-slate-500">Let others know when you've read their messages</p>
              </div>
              <Switch
                id="read-receipts"
                checked={settings.read_receipts}
                onCheckedChange={(checked) => updateSetting('read_receipts', checked)}
              />
            </div>

            <div className="flex items-center justify-between pt-2">
              <div className="space-y-0.5">
                <Label htmlFor="typing" className="text-xs font-semibold text-slate-700">Typing Indicators</Label>
                <p className="text-xs text-slate-500">Show when you're typing</p>
              </div>
              <Switch
                id="typing"
                checked={settings.typing_indicators}
                onCheckedChange={(checked) => updateSetting('typing_indicators', checked)}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
