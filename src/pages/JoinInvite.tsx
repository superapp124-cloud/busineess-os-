import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Gift, Users, Sparkles, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';

const JoinInvite = () => {
 const [searchParams] = useSearchParams();
 const navigate = useNavigate();
 const [inviterName, setInviterName] = useState<string | null>(null);
 const [loading, setLoading] = useState(true);

 const inviteCode = searchParams.get('invite');
 const referrerId = searchParams.get('ref');

 useEffect(() => {
 // Track invite click and store referral info
 const trackClick = async () => {
 if (inviteCode) {
 // Store invite code and referrer ID for after signup
 localStorage.setItem('pending_invite_code', inviteCode);
 if (referrerId) {
 localStorage.setItem('pending_referrer_id', referrerId);
 }

 // Update invite status to clicked
 await supabase
 .from('contact_invites')
 .update({ 
 status: 'clicked',
 clicked_at: new Date().toISOString()
 })
 .eq('invite_code', inviteCode);

 // Try to get inviter info - first from ref param, then from invite record
 let inviterId = referrerId;
 
 if (!inviterId) {
 const { data } = await supabase
 .from('contact_invites')
 .select('inviter_id')
 .eq('invite_code', inviteCode)
 .single();
 inviterId = data?.inviter_id;
 }

 if (inviterId) {
 localStorage.setItem('pending_referrer_id', inviterId);
 
 const { data: profile } = await supabase
 .from('profiles')
 .select('username')
 .eq('id', inviterId)
 .single();
 
 setInviterName(profile?.username || 'A friend');
 }
 }
 setLoading(false);
 };

 trackClick();
 }, [inviteCode, referrerId]);

 const handleJoin = () => {
 navigate('/auth', { state: { inviteCode } });
 };

 if (loading) {
 return (
 <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/20 via-purple-500/20 to-pink-500/20">
 <div className="animate-pulse">
 <Sparkles className="h-12 w-12 text-primary" />
 </div>
 </div>
 );
 }

  const isAndroid = typeof navigator !== 'undefined' && /android/i.test(navigator.userAgent);

  const handleDownloadApk = () => {
    const link = document.createElement('a');
    link.href = '/download/Chatr-Plus.apk';
    link.setAttribute('download', 'Chatr-Plus.apk');
    document.body.appendChild(link);
    link.click();
    setTimeout(() => {
      if (document.body.contains(link)) document.body.removeChild(link);
    }, 1000);
    navigate('/download/android');
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-primary/20 via-purple-500/20 to-pink-500/20">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        <Card className="overflow-hidden border-primary/20 backdrop-blur-xl bg-background/80 shadow-2xl">
          <div className="bg-gradient-to-r from-primary via-purple-500 to-pink-500 p-6 text-white text-center">
            <motion.div
              initial={{ y: -20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.2 }}
            >
              <Gift className="h-16 w-16 mx-auto mb-4 drop-shadow-md" />
              <h1 className="text-2xl font-black tracking-tight mb-2">You're Invited! 🎉</h1>
              {inviterName && (
                <p className="text-white/90 font-medium">
                  {inviterName} invited you to join <span className="font-bold underline decoration-white/50">CHATR+</span>
                </p>
              )}
            </motion.div>
          </div>

          <CardContent className="p-6 space-y-6">
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="text-center"
            >
              <p className="text-sm text-muted-foreground mb-4">
                Universal private messaging, unblocked WebRTC HD calling, and AI agents.
              </p>
              
              <div className="bg-yellow-500/15 border border-yellow-500/30 rounded-xl p-3.5 mb-5">
                <div className="flex items-center justify-center gap-2 text-yellow-600 dark:text-yellow-400 font-bold text-sm">
                  <Sparkles className="h-5 w-5" />
                  Get 25 Welcome Coins & Free HD Calls!
                  <Sparkles className="h-5 w-5" />
                </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-3">
                {isAndroid && (
                  <Button 
                    onClick={handleDownloadApk}
                    size="lg"
                    className="w-full gap-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold shadow-lg shadow-emerald-500/25 py-6 cursor-pointer"
                  >
                    <span>Download Android App (78 MB APK)</span>
                    <ArrowRight className="h-5 w-5" />
                  </Button>
                )}

                <Button 
                  onClick={handleJoin}
                  size="lg"
                  variant={isAndroid ? "outline" : "default"}
                  className={`w-full gap-2 font-bold py-6 cursor-pointer ${
                    !isAndroid ? 'bg-gradient-to-r from-primary to-purple-500 text-white shadow-lg shadow-primary/20' : ''
                  }`}
                >
                  <span>{isAndroid ? 'Continue in Web Browser' : 'Join on Web Now'}</span>
                  <ArrowRight className="h-5 w-5" />
                </Button>
              </div>

              {/* Trust & Compliance Badge */}
              <div className="pt-4 border-t border-border/50 flex items-center justify-center gap-4 text-[11px] text-muted-foreground">
                <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-medium">
                  ✓ Google Play Protect Audited
                </span>
                <span>•</span>
                <span className="flex items-center gap-1 font-medium">
                  🔒 End-to-End Encrypted
                </span>
              </div>

              <p className="text-xs text-muted-foreground mt-4">
                Already have an account?{' '}
                <span 
                  className="text-primary font-semibold cursor-pointer hover:underline"
                  onClick={() => navigate('/auth')}
                >
                  Log in
                </span>
              </p>
            </motion.div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
 );
};

export default JoinInvite;
