import React, { useState, useEffect, useRef } from "react";
import { 
  Camera, Loader2, Upload, Sparkles, CheckCircle, 
  Briefcase, Users, Share2, Copy, ArrowRight, Building, Check 
} from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Camera as CapacitorCamera, CameraResultType, CameraSource } from '@capacitor/camera';
import { Capacitor } from '@capacitor/core';
import { trackAcquisitionEvent } from '@/services/acquisitionTelemetry';
import { ViralTelemetry } from '@/services/viralTelemetry';

interface OnboardingDialogProps {
  isOpen: boolean;
  userId: string;
  onComplete: () => void;
  onSkip: () => void;
}

const INDUSTRIES = [
  'E-Commerce & Retail',
  'Hotels & Hospitality',
  'Real Estate & Property',
  'Consulting & Professional Services',
  'Healthcare & Clinics',
  'Technology & Software',
  'Other / General'
];

export const OnboardingDialog: React.FC<OnboardingDialogProps> = ({ isOpen, userId, onComplete, onSkip }) => {
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [fullName, setFullName] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");
  const [workspaceName, setWorkspaceName] = useState("");
  const [industry, setIndustry] = useState("E-Commerce & Retail");
  const [createdWorkspaceId, setCreatedWorkspaceId] = useState<string>("");
  const [copiedInvite, setCopiedInvite] = useState(false);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const { data: existingUser } = await supabase
          .from('profiles')
          .select('full_name, display_name, avatar_url')
          .eq('id', userId)
          .maybeSingle();

        if (existingUser?.full_name) {
          setFullName(existingUser.full_name);
          setWorkspaceName(`${existingUser.full_name}'s Workspace`);
        } else if (existingUser?.display_name) {
          setFullName(existingUser.display_name);
          setWorkspaceName(`${existingUser.display_name}'s Workspace`);
        } else {
          const { data: { user } } = await supabase.auth.getUser();
          if (user?.user_metadata?.full_name) {
            setFullName(user.user_metadata.full_name);
            setWorkspaceName(`${user.user_metadata.full_name}'s Workspace`);
          }
        }
        if (existingUser?.avatar_url) {
          setAvatarUrl(existingUser.avatar_url);
        }
      } catch (e) {
        console.debug('[OnboardingDialog] Profile prefill load error:', e);
      }
    };
    
    if (userId && isOpen) loadProfile();
  }, [userId, isOpen]);

  const uploadBlob = async (blob: Blob, ext: string = 'jpeg') => {
    try {
      setUploading(true);
      const fileName = `${userId}-${Date.now()}.${ext}`;
      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(fileName, blob, { upsert: true });

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(fileName);

      setAvatarUrl(publicUrl);
    } catch (error: any) {
      toast({ title: "Upload failed", description: error.message || "Failed to upload avatar", variant: "destructive" });
    } finally {
      setUploading(false);
    }
  };

  const handleNativePhotoUpload = async (fromCamera: boolean) => {
    if (!Capacitor.isNativePlatform()) {
      fileInputRef.current?.click();
      return;
    }

    try {
      setUploading(true);
      const image = await CapacitorCamera.getPhoto({
        quality: 90,
        allowEditing: true,
        resultType: CameraResultType.DataUrl,
        source: fromCamera ? CameraSource.Camera : CameraSource.Photos,
      });

      if (!image.dataUrl) throw new Error("Failed to capture image data");

      const base64Data = image.dataUrl.split(',')[1];
      const byteCharacters = atob(base64Data);
      const byteNumbers = new Array(byteCharacters.length);
      for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i);
      }
      const byteArray = new Uint8Array(byteNumbers);
      const blob = new Blob([byteArray], { type: `image/${image.format || 'jpeg'}` });
      await uploadBlob(blob, image.format || 'jpeg');
    } catch (error: any) {
      if (error.message !== "User cancelled photos app") {
        toast({ title: "Photo capture failed", description: error.message, variant: "destructive" });
      }
      setUploading(false);
    }
  };

  const handleFileInputChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const ext = file.name.split('.').pop() || 'jpeg';
    await uploadBlob(file, ext);
  };

  // Step 1: Save profile & proceed to Workspace Setup
  const handleProceedToWorkspace = async () => {
    const trimmedName = fullName.trim();
    if (!trimmedName) {
      toast({ title: "Name required", description: "Please enter your name to continue", variant: "destructive" });
      return;
    }

    setSaving(true);
    try {
      const username = trimmedName.toLowerCase().replace(/[^a-z0-9]+/g, "_").replace(/^_+|_+$/g, "").slice(0, 24) || `user_${userId.slice(0, 8)}`;
      const completedAt = new Date().toISOString();

      await supabase.from('profiles').update({
        full_name: trimmedName,
        display_name: trimmedName,
        username,
        avatar_url: avatarUrl || null,
        updated_at: completedAt,
      } as any).eq('id', userId);

      if (!workspaceName) {
        setWorkspaceName(`${trimmedName}'s Business`);
      }

      setStep(2);
    } catch (error: any) {
      toast({ title: "Error saving profile", description: error.message, variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  // Step 2: Create Business Workspace in Supabase (EXP-004)
  const handleCreateWorkspace = async () => {
    const trimmedWs = workspaceName.trim() || `${fullName.trim() || 'My'}'s Workspace`;
    setSaving(true);
    try {
      const completedAt = new Date().toISOString();

      // 1. Create Workspace entry in Supabase
      const { data: newWs, error: wsError } = await supabase
        .from('workspaces')
        .insert({
          owner_id: userId,
          name: trimmedWs,
          industry: industry || 'General',
        })
        .select()
        .single();

      let activeWsId = newWs?.id;

      if (wsError) {
        console.warn('[OnboardingDialog] Workspace table error, checking existing:', wsError);
        const { data: existing } = await supabase
          .from('workspaces')
          .select('id')
          .eq('owner_id', userId)
          .limit(1)
          .maybeSingle();
        if (existing?.id) activeWsId = existing.id;
      }

      // 2. Add owner to workspace_members if workspace was created
      if (activeWsId) {
        setCreatedWorkspaceId(activeWsId);
        try {
          localStorage.setItem('chatr_active_workspace_id', activeWsId);
          await supabase.from('workspace_members').insert({
            workspace_id: activeWsId,
            user_id: userId,
            role: 'owner'
          });
        } catch (e) {
          console.debug('[OnboardingDialog] workspace_members insert:', e);
        }
      }

      // 3. Mark onboarding completed on profile
      await supabase.from('profiles').update({
        onboarding_completed: true,
        profile_completed_at: completedAt,
        updated_at: completedAt
      } as any).eq('id', userId);

      // 4. Track EXP-004 success telemetry
      trackAcquisitionEvent({
        event: 'activation_completed',
        metadata: {
          workspaceName: trimmedWs,
          industry,
          workspaceId: activeWsId || 'local'
        }
      });
      ViralTelemetry.trackGrowth({
        eventType: 'workspace_created',
        category: 'activation',
        metadata: { workspaceId: activeWsId, industry }
      });

      // Move to Step 3: Team Invitation
      setStep(3);
    } catch (error: any) {
      toast({ title: "Error creating workspace", description: error.message, variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  // Step 3: Team invite URL
  const inviteUrl = typeof window !== 'undefined'
    ? `${window.location.origin}/join?ws=${createdWorkspaceId || 'main'}&ref=${userId}`
    : `https://www.chatrchat.in/join?ws=${createdWorkspaceId || 'main'}&ref=${userId}`;

  const handleCopyInvite = () => {
    navigator.clipboard.writeText(inviteUrl);
    setCopiedInvite(true);
    toast({ title: "Copied!", description: "Invitation link copied to clipboard" });
    trackAcquisitionEvent({
      event: 'share_clicked',
      metadata: { action: 'copy_workspace_invite', workspaceId: createdWorkspaceId }
    });
    setTimeout(() => setCopiedInvite(false), 2500);
  };

  const handleWhatsAppInvite = () => {
    const text = `Hey, join our team workspace "${workspaceName || 'CHATR'}" here to manage customer chats and free calls: ${inviteUrl}`;
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
    trackAcquisitionEvent({
      event: 'share_clicked',
      metadata: { action: 'whatsapp_workspace_invite', workspaceId: createdWorkspaceId }
    });
  };

  const handleFinish = () => {
    onComplete();
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onSkip()}>
      <DialogContent className="sm:max-w-[440px] w-[94vw] bg-[#0c0c17]/95 border border-white/10 text-white shadow-2xl backdrop-blur-2xl p-6 rounded-2xl overflow-hidden max-h-[92vh] flex flex-col justify-between">
        
        {/* Progress Bar / Step Indicators */}
        <div className="flex items-center justify-between mb-2 px-1">
          <div className="flex items-center gap-1.5">
            <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
              step >= 1 ? 'bg-violet-600 text-white' : 'bg-white/10 text-zinc-400'
            }`}>
              1
            </span>
            <span className="text-[11px] text-zinc-400 font-medium">Profile</span>
          </div>
          <div className={`h-0.5 flex-1 mx-2 ${step >= 2 ? 'bg-violet-600' : 'bg-white/10'}`} />
          <div className="flex items-center gap-1.5">
            <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
              step >= 2 ? 'bg-violet-600 text-white' : 'bg-white/10 text-zinc-400'
            }`}>
              2
            </span>
            <span className="text-[11px] text-zinc-400 font-medium">Workspace</span>
          </div>
          <div className={`h-0.5 flex-1 mx-2 ${step >= 3 ? 'bg-violet-600' : 'bg-white/10'}`} />
          <div className="flex items-center gap-1.5">
            <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
              step >= 3 ? 'bg-violet-600 text-white' : 'bg-white/10 text-zinc-400'
            }`}>
              3
            </span>
            <span className="text-[11px] text-zinc-400 font-medium">Team</span>
          </div>
        </div>

        {/* ── STEP 1: PROFILE SETUP ── */}
        {step === 1 && (
          <>
            <DialogHeader className="p-0 text-center space-y-1.5">
              <div className="mx-auto w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-violet-500/20 mb-1 border border-white/15">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              <DialogTitle className="text-xl font-bold text-white tracking-tight">
                Welcome to CHATR
              </DialogTitle>
              <DialogDescription className="text-xs text-zinc-400">
                Step 1 of 3: Set up your personal identity
              </DialogDescription>
            </DialogHeader>

            <input 
              type="file" 
              ref={fileInputRef} 
              accept="image/*" 
              className="hidden" 
              onChange={handleFileInputChange} 
            />

            <div className="py-4 space-y-4">
              <div className="flex flex-col items-center gap-3">
                <div 
                  onClick={() => handleNativePhotoUpload(false)}
                  className="relative group cursor-pointer"
                  title="Click to change photo"
                >
                  <div className="w-20 h-20 rounded-full border-2 border-violet-500/40 group-hover:border-violet-400 transition-all shadow-xl overflow-hidden bg-white/[0.03] flex items-center justify-center relative">
                    {avatarUrl ? (
                      <img src={avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
                    ) : (
                      <Camera className="w-7 h-7 text-zinc-400 group-hover:text-white transition-colors" />
                    )}
                    
                    {uploading && (
                      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center">
                        <Loader2 className="w-5 h-5 animate-spin text-violet-400" />
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button 
                    type="button" 
                    variant="outline" 
                    size="sm" 
                    onClick={() => handleNativePhotoUpload(true)} 
                    disabled={uploading} 
                    className="h-7 rounded-full px-3 bg-white/[0.04] border-white/10 hover:bg-white/[0.08] text-[11px] text-zinc-200"
                  >
                    <Camera className="w-3 h-3 mr-1 text-violet-400" /> Camera
                  </Button>
                  <Button 
                    type="button" 
                    variant="outline" 
                    size="sm" 
                    onClick={() => handleNativePhotoUpload(false)} 
                    disabled={uploading} 
                    className="h-7 rounded-full px-3 bg-white/[0.04] border-white/10 hover:bg-white/[0.08] text-[11px] text-zinc-200"
                  >
                    <Upload className="w-3 h-3 mr-1 text-violet-400" /> Upload
                  </Button>
                </div>
              </div>

              <div className="space-y-1.5 text-left">
                <Label htmlFor="onboarding-name" className="text-xs font-semibold text-zinc-300">
                  Your Full Name <span className="text-violet-400">*</span>
                </Label>
                <Input
                  id="onboarding-name"
                  placeholder="e.g. Rahul Sharma"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  onKeyDown={(e) => { if (e.key === 'Enter') handleProceedToWorkspace(); }}
                  className="h-10 bg-white/[0.05] border-white/10 focus:border-violet-500 focus:ring-1 focus:ring-violet-500 rounded-xl text-white placeholder-zinc-500 px-3 text-sm"
                  autoFocus
                />
              </div>
            </div>

            <Button 
              onClick={handleProceedToWorkspace} 
              disabled={saving || uploading || !fullName.trim()}
              className="w-full h-11 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white rounded-xl font-semibold shadow-lg shadow-violet-600/30 transition-all text-sm flex items-center justify-center gap-2"
            >
              {saving ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <>
                  <span>Next: Setup Business Workspace</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </Button>
          </>
        )}

        {/* ── STEP 2: EXP-004 WORKSPACE SETUP ── */}
        {step === 2 && (
          <>
            <DialogHeader className="p-0 text-center space-y-1.5">
              <div className="mx-auto w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-lg shadow-emerald-500/20 mb-1 border border-white/15">
                <Building className="w-5 h-5 text-white" />
              </div>
              <DialogTitle className="text-xl font-bold text-white tracking-tight">
                Create Your Workspace
              </DialogTitle>
              <DialogDescription className="text-xs text-zinc-400">
                Step 2 of 3: Connect customer chats, calling links & tools
              </DialogDescription>
            </DialogHeader>

            <div className="py-4 space-y-4 text-left">
              <div className="space-y-1.5">
                <Label htmlFor="ws-name" className="text-xs font-semibold text-zinc-300">
                  Business / Workspace Name <span className="text-emerald-400">*</span>
                </Label>
                <Input
                  id="ws-name"
                  placeholder="e.g. Apex Studio, Urban Store"
                  value={workspaceName}
                  onChange={(e) => setWorkspaceName(e.target.value)}
                  onKeyDown={(e) => { if (e.key === 'Enter') handleCreateWorkspace(); }}
                  className="h-10 bg-white/[0.05] border-white/10 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 rounded-xl text-white placeholder-zinc-500 px-3 text-sm"
                  autoFocus
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="ws-industry" className="text-xs font-semibold text-zinc-300">
                  Primary Business Industry
                </Label>
                <select
                  id="ws-industry"
                  value={industry}
                  onChange={(e) => setIndustry(e.target.value)}
                  className="w-full h-10 bg-zinc-900 border border-white/10 rounded-xl text-white px-3 text-xs focus:border-emerald-500 focus:outline-none"
                >
                  {INDUSTRIES.map((ind) => (
                    <option key={ind} value={ind} className="bg-zinc-900 text-white">
                      {ind}
                    </option>
                  ))}
                </select>
              </div>

              <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-[11px] text-emerald-300 space-y-1">
                <p className="font-semibold">✓ Instantly unlocks:</p>
                <p className="text-zinc-300">• Shared team inbox for customer WhatsApp chats</p>
                <p className="text-zinc-300">• Permanent WebRTC calling link with zero app downloads</p>
              </div>
            </div>

            <Button 
              onClick={handleCreateWorkspace} 
              disabled={saving || !workspaceName.trim()}
              className="w-full h-11 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white rounded-xl font-semibold shadow-lg shadow-emerald-600/30 transition-all text-sm flex items-center justify-center gap-2"
            >
              {saving ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <>
                  <span>Create Workspace & Continue</span>
                  <CheckCircle className="w-4 h-4" />
                </>
              )}
            </Button>
          </>
        )}

        {/* ── STEP 3: EXP-005 TEAM INVITATION ── */}
        {step === 3 && (
          <>
            <DialogHeader className="p-0 text-center space-y-1.5">
              <div className="mx-auto w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/20 mb-1 border border-white/15">
                <Users className="w-5 h-5 text-white" />
              </div>
              <DialogTitle className="text-xl font-bold text-white tracking-tight">
                Invite Your Team
              </DialogTitle>
              <DialogDescription className="text-xs text-zinc-400">
                Step 3 of 3: Add colleagues or collaborators to {workspaceName}
              </DialogDescription>
            </DialogHeader>

            <div className="py-4 space-y-4 text-left">
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-zinc-300">
                  Team Invitation Link
                </Label>
                <div className="flex items-center gap-2 bg-white/[0.04] border border-white/10 rounded-xl p-2">
                  <span className="text-[11px] font-mono text-indigo-300 truncate flex-1 select-all">
                    {inviteUrl}
                  </span>
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    onClick={handleCopyInvite}
                    className="h-8 px-2.5 bg-indigo-600/30 border-indigo-500/30 hover:bg-indigo-600/50 text-indigo-200 text-xs shrink-0 flex items-center gap-1"
                  >
                    {copiedInvite ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedInvite ? 'Copied' : 'Copy'}</span>
                  </Button>
                </div>
              </div>

              <button
                type="button"
                onClick={handleWhatsAppInvite}
                className="w-full py-2.5 px-3 rounded-xl bg-emerald-600/20 hover:bg-emerald-600/30 border border-emerald-500/30 text-emerald-300 font-semibold text-xs flex items-center justify-center gap-2 transition-all"
              >
                <Share2 className="w-4 h-4 text-emerald-400" />
                <span>Invite Colleagues via WhatsApp</span>
              </button>

              <div className="text-[11px] text-zinc-400 text-center leading-relaxed">
                Team members get shared access to customer tickets and calling links once they join with their phone.
              </div>
            </div>

            <div className="space-y-2">
              <Button 
                onClick={handleFinish} 
                className="w-full h-11 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white rounded-xl font-semibold shadow-lg shadow-violet-600/30 transition-all text-sm flex items-center justify-center gap-2"
              >
                <span>Launch My Workspace</span>
                <CheckCircle className="w-4 h-4" />
              </Button>

              <button
                type="button"
                onClick={handleFinish}
                className="w-full text-center text-xs text-zinc-500 hover:text-zinc-300 py-1 transition-colors"
              >
                I'll invite teammates later
              </button>
            </div>
          </>
        )}

      </DialogContent>
    </Dialog>
  );
};
