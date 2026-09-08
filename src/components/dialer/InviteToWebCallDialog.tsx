import React, { useState } from 'react';
import { 
  X, PhoneCall, Copy, Check, MessageSquare, 
  Smartphone, Share2, Sparkles, ExternalLink 
} from 'lucide-react';
import { toast } from 'sonner';

interface InviteToWebCallDialogProps {
  isOpen: boolean;
  onClose: () => void;
  target: string;
}

export const InviteToWebCallDialog: React.FC<InviteToWebCallDialogProps> = ({
  isOpen,
  onClose,
  target
}) => {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const cleanTarget = target.replace(/[^0-9+]/g, '');
  const roomSlug = cleanTarget.replace(/\+/g, '') || Math.random().toString(36).substring(2, 9);
  const callUrl = `https://www.chatrchat.in/call/call-${roomSlug}`;

  const handleCopy = () => {
    navigator.clipboard.writeText(callUrl);
    setCopied(true);
    toast.success('Call link copied to clipboard!');
    setTimeout(() => setCopied(false), 2000);
  };

  const handleWhatsApp = () => {
    const text = encodeURIComponent(`Hey, join my private HD voice/video call on CHATR+ (no app install needed): ${callUrl}`);
    const cleanPhone = cleanTarget.replace(/\+/g, '');
    const url = cleanPhone ? `https://wa.me/${cleanPhone}?text=${text}` : `https://wa.me/?text=${text}`;
    window.open(url, '_blank');
  };

  const handleSMS = () => {
    const body = encodeURIComponent(`Join my secure CHATR+ call (runs in your browser): ${callUrl}`);
    window.open(`sms:${cleanTarget}?body=${body}`, '_blank');
  };

  const handleOpenRoom = () => {
    window.open(callUrl, '_blank');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-7 space-y-6 shadow-2xl text-white">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
            <Sparkles className="w-6 h-6" />
          </div>
          <h3 className="text-xl font-bold text-white">Invite to Web Call</h3>
          <p className="text-xs text-slate-400 leading-relaxed">
            <span className="font-semibold text-emerald-400">{target}</span> is not registered on CHATR+ yet. You can invite them to an instant WebRTC call — they can join directly in their mobile browser with <strong>zero app install</strong>!
          </p>
        </div>

        {/* Generated Call URL Box */}
        <div className="flex items-center gap-2 p-3 bg-slate-950 border border-slate-800 rounded-2xl">
          <input
            type="text"
            readOnly
            value={callUrl}
            className="bg-transparent text-xs text-emerald-400 font-mono flex-1 outline-none select-all truncate"
          />
          <button
            onClick={handleCopy}
            className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center gap-1.5 transition-all"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? 'Copied' : 'Copy'}</span>
          </button>
        </div>

        {/* 1-Tap Sharing Actions */}
        <div className="space-y-2.5">
          <button
            onClick={handleWhatsApp}
            className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm shadow-lg shadow-emerald-600/25 transition-all"
          >
            <MessageSquare className="w-4 h-4" />
            <span>Send Call Invite via WhatsApp</span>
          </button>

          <div className="grid grid-cols-2 gap-2.5">
            <button
              onClick={handleSMS}
              className="flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs border border-slate-700 transition-all"
            >
              <Smartphone className="w-4 h-4 text-cyan-400" />
              <span>Send SMS</span>
            </button>

            <button
              onClick={handleOpenRoom}
              className="flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs border border-slate-700 transition-all"
            >
              <PhoneCall className="w-4 h-4 text-emerald-400" />
              <span>Join Room</span>
            </button>
          </div>
        </div>

        <div className="pt-3 border-t border-slate-800 text-center">
          <p className="text-[11px] text-slate-500">
            When the call ends, your contact will be prompted to install CHATR+ for lockscreen call alerts.
          </p>
        </div>
      </div>
    </div>
  );
};

export default InviteToWebCallDialog;
