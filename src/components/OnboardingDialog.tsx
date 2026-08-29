import React, { useState, useEffect, useRef } from "react";
import { Camera, Loader2, Upload, Sparkles, CheckCircle } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Camera as CapacitorCamera, CameraResultType, CameraSource } from '@capacitor/camera';
import { Capacitor } from '@capacitor/core';

interface OnboardingDialogProps {
  isOpen: boolean;
  userId: string;
  onComplete: () => void;
  onSkip: () => void;
}

export const OnboardingDialog: React.FC<OnboardingDialogProps> = ({ isOpen, userId, onComplete, onSkip }) => {
  const [fullName, setFullName] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const { data: existingUser } = await supabase
          .from('users')
          .select('full_name, display_name, avatar_url')
          .eq('id', userId)
          .maybeSingle();

        if (existingUser?.full_name) {
          setFullName(existingUser.full_name);
        } else if (existingUser?.display_name) {
          setFullName(existingUser.display_name);
        } else {
          const { data: { user } } = await supabase.auth.getUser();
          if (user?.user_metadata?.full_name) {
            setFullName(user.user_metadata.full_name);
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

  const handleSave = async () => {
    const trimmedName = fullName.trim();
    if (!trimmedName) {
      toast({ title: "Name required", description: "Please enter your name to continue", variant: "destructive" });
      return;
    }

    setSaving(true);
    try {
      const username = trimmedName.toLowerCase().replace(/[^a-z0-9]+/g, "_").replace(/^_+|_+$/g, "").slice(0, 24) || `user_${userId.slice(0, 8)}`;
      const completedAt = new Date().toISOString();

      await Promise.all([
        supabase.from('users').update({
          full_name: trimmedName,
          display_name: trimmedName,
          username,
          avatar_url: avatarUrl || null,
          onboarding_completed: true,
          profile_completed_at: completedAt,
          updated_at: completedAt,
        } as any).eq('id', userId),
        
        supabase.from('profiles').update({
          full_name: trimmedName,
          username,
          avatar_url: avatarUrl || null,
          onboarding_completed: true,
          profile_completed_at: completedAt,
        } as any).eq('id', userId)
      ]);

      onComplete();
    } catch (error: any) {
      toast({ title: "Error saving profile", description: error.message, variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onSkip()}>
      <DialogContent className="sm:max-w-[420px] w-[92vw] bg-[#0c0c17]/95 border border-white/10 text-white shadow-2xl backdrop-blur-2xl p-6 rounded-2xl overflow-hidden max-h-[90vh] flex flex-col justify-between">
        <DialogHeader className="p-0 text-center space-y-1.5">
          <div className="mx-auto w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-violet-500/20 mb-2 border border-white/15">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <DialogTitle className="text-xl font-bold text-white tracking-tight">
            Welcome to CHATR
          </DialogTitle>
          <DialogDescription className="text-xs text-zinc-400">
            Set up your profile to enter your business workspace
          </DialogDescription>
        </DialogHeader>

        <input 
          type="file" 
          ref={fileInputRef} 
          accept="image/*" 
          className="hidden" 
          onChange={handleFileInputChange} 
        />

        <div className="py-5 space-y-5">
          {/* Avatar Upload Container */}
          <div className="flex flex-col items-center gap-3">
            <div 
              onClick={() => handleNativePhotoUpload(false)}
              className="relative group cursor-pointer"
              title="Click to change photo"
            >
              <div className="w-24 h-24 rounded-full border-2 border-violet-500/40 group-hover:border-violet-400 transition-all shadow-xl overflow-hidden bg-white/[0.03] flex items-center justify-center relative">
                {avatarUrl ? (
                  <img src={avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
                ) : (
                  <Camera className="w-8 h-8 text-zinc-400 group-hover:text-white transition-colors" />
                )}
                
                {uploading && (
                  <div className="absolute inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center">
                    <Loader2 className="w-6 h-6 animate-spin text-violet-400" />
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
                className="h-8 rounded-full px-3.5 bg-white/[0.04] border-white/10 hover:bg-white/[0.08] text-xs text-zinc-200"
              >
                <Camera className="w-3.5 h-3.5 mr-1.5 text-violet-400" /> Camera
              </Button>
              <Button 
                type="button" 
                variant="outline" 
                size="sm" 
                onClick={() => handleNativePhotoUpload(false)} 
                disabled={uploading} 
                className="h-8 rounded-full px-3.5 bg-white/[0.04] border-white/10 hover:bg-white/[0.08] text-xs text-zinc-200"
              >
                <Upload className="w-3.5 h-3.5 mr-1.5 text-violet-400" /> Upload Photo
              </Button>
            </div>
          </div>

          {/* Name Field */}
          <div className="space-y-1.5 text-left">
            <Label htmlFor="onboarding-name" className="text-xs font-semibold text-zinc-300">
              Your Name <span className="text-violet-400">*</span>
            </Label>
            <Input
              id="onboarding-name"
              placeholder="e.g. Sanobar Jahan"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') handleSave(); }}
              className="h-11 bg-white/[0.05] border-white/10 focus:border-violet-500 focus:ring-1 focus:ring-violet-500 rounded-xl text-white placeholder-zinc-500 px-3.5 text-sm"
              autoFocus
            />
          </div>
        </div>

        {/* Action Button */}
        <Button 
          onClick={handleSave} 
          disabled={saving || uploading || !fullName.trim()}
          className="w-full h-11 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white rounded-xl font-semibold shadow-lg shadow-violet-600/30 transition-all text-sm flex items-center justify-center gap-2"
        >
          {saving ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <>
              <span>Continue to Workspace</span>
              <CheckCircle className="w-4 h-4" />
            </>
          )}
        </Button>
      </DialogContent>
    </Dialog>
  );
};
