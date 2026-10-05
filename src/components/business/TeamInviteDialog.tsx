import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { UserPlus, Mail, Copy, Check, Share2, Sparkles } from 'lucide-react';
import { createInviteLink } from '@/utils/inviteLinkGenerator';

interface TeamInviteDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  businessId: string;
  onSuccess: () => void;
}

export function TeamInviteDialog({
  open,
  onOpenChange,
  businessId,
  onSuccess,
}: TeamInviteDialogProps) {
  const { toast } = useToast();
  const [inviting, setInviting] = useState(false);
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<'admin' | 'member'>('member');
  const [copiedLink, setCopiedLink] = useState(false);
  const [inviteUrl, setInviteUrl] = useState<string | null>(null);

  // Generate or retrieve current user's invite link
  const getOrCreateLink = async (): Promise<string | null> => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return null;
      const link = await createInviteLink(user.id);
      setInviteUrl(link);
      return link;
    } catch {
      return null;
    }
  };

  const handleCopyLink = async () => {
    const link = inviteUrl || await getOrCreateLink();
    if (link) {
      navigator.clipboard.writeText(link);
      setCopiedLink(true);
      toast({
        title: 'Invite Link Copied',
        description: 'Teammates can click this link to join your team with 1 tap.',
      });
      setTimeout(() => setCopiedLink(false), 2000);
    }
  };

  const handleShareWhatsApp = async () => {
    const link = inviteUrl || await getOrCreateLink();
    if (link) {
      const text = encodeURIComponent(`👋 Join our team workspace on CHATR! Tap here to join: ${link}`);
      window.open(`https://wa.me/?text=${text}`, '_blank');
    }
  };

  const handleInvite = async () => {
    if (!email || !email.includes('@')) {
      toast({
        title: 'Invalid Email',
        description: 'Please enter a valid email address',
        variant: 'destructive',
      });
      return;
    }

    setInviting(true);
    try {
      // Check if user exists with this email
      const { data: existingProfile } = await supabase
        .from('profiles')
        .select('id')
        .eq('email', email)
        .single();

      if (!existingProfile) {
        // Teammate doesn't have an account yet — generate invite link for them
        const link = inviteUrl || await getOrCreateLink();
        if (link) {
          navigator.clipboard.writeText(link);
        }
        toast({
          title: 'Invite Link Ready',
          description: `Teammate is not on CHATR yet. We've copied their 1-click invite link to your clipboard! Send it on WhatsApp or email.`,
        });
        return;
      }

      // Check if already a team member
      const { data: existingMember } = await supabase
        .from('business_team_members')
        .select('id')
        .eq('business_id', businessId)
        .eq('user_id', existingProfile.id)
        .single();

      if (existingMember) {
        toast({
          title: 'Already a Member',
          description: 'This user is already part of your team',
          variant: 'destructive',
        });
        return;
      }

      // Get current user ID for invited_by
      const { data: { user } } = await supabase.auth.getUser();

      // Add team member
      const { error } = await supabase
        .from('business_team_members')
        .insert({
          business_id: businessId,
          user_id: existingProfile.id,
          role: role,
          invited_by: user?.id,
        });

      if (error) throw error;

      toast({
        title: 'Success',
        description: `Team member added successfully`,
      });

      setEmail('');
      setRole('member');
      onOpenChange(false);
      onSuccess();
    } catch (error) {
      console.error('Error inviting team member:', error);
      toast({
        title: 'Error',
        description: 'Failed to invite team member',
        variant: 'destructive',
      });
    } finally {
      setInviting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <UserPlus className="h-5 w-5 text-[#164E3F]" />
            Invite Team Member
          </DialogTitle>
          <DialogDescription>
            Add colleagues to your shared workspace and customer inbox
          </DialogDescription>
        </DialogHeader>

        {/* 1-Click Fast Invite Strip */}
        <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2.5">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-800">
            <span className="flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              1-Tap Team Invite Link
            </span>
            <span className="text-[10px] text-emerald-600 font-bold bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
              Instant
            </span>
          </div>
          <p className="text-[11px] text-slate-500 leading-normal">
            Send this link to anyone on your team. They can join immediately with Google or phone:
          </p>
          <div className="flex gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleCopyLink}
              className="flex-1 text-xs gap-1.5 border-slate-300 hover:bg-white"
            >
              {copiedLink ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
              {copiedLink ? 'Copied Link!' : 'Copy Link'}
            </Button>
            <Button
              type="button"
              size="sm"
              onClick={handleShareWhatsApp}
              className="flex-1 text-xs gap-1.5 bg-emerald-600 hover:bg-emerald-500 text-white"
            >
              <Share2 className="w-3.5 h-3.5" />
              Invite on WhatsApp
            </Button>
          </div>
        </div>

        <div className="space-y-4 py-2">
          <div className="flex items-center gap-3">
            <div className="flex-1 h-px bg-slate-200" />
            <span className="text-[11px] text-slate-400 font-medium">or invite by email</span>
            <div className="flex-1 h-px bg-slate-200" />
          </div>

          <div className="space-y-2">
            <Label htmlFor="email" className="flex items-center gap-2 text-xs">
              <Mail className="h-3.5 w-3.5" />
              Teammate's Email Address
            </Label>
            <Input
              id="email"
              type="email"
              placeholder="colleague@yourcompany.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="text-sm"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="role" className="text-xs">Role</Label>
            <Select value={role} onValueChange={(value: any) => setRole(value)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="member">Member — Answer chats & take calls</SelectItem>
                <SelectItem value="admin">Admin — Full workspace control</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="flex gap-2 pt-2">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="flex-1"
          >
            Cancel
          </Button>
          <Button
            onClick={handleInvite}
            disabled={inviting || !email}
            className="flex-1 bg-[#164E3F] hover:bg-[#2E6B59] text-white"
          >
            {inviting ? 'Inviting...' : 'Send Invite'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
