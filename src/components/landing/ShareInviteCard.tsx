import React, { useState } from 'react';
import { Copy, Share2, Check } from 'lucide-react';

interface ShareInviteCardProps {
  userId?: string;
  compact?: boolean;
}

export const ShareInviteCard: React.FC<ShareInviteCardProps> = ({ userId, compact }) => {
  const [copied, setCopied] = useState(false);
  const code = userId ? userId.slice(0, 8).toUpperCase() : 'CHATR24';
  const url = `https://www.chatrchat.in/?ref=${code}`;
  const text = `I'm using CHATR — a smarter way to chat, call & get things done with SI agents. Join free: ${url}`;

  const handleCopy = () => {
    navigator.clipboard.writeText(url).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({ title: 'Join CHATR', text, url });
    } else {
      handleCopy();
    }
  };

  const waUrl = `https://wa.me/?text=${encodeURIComponent(text)}`;
  const tweetUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}`;
  const tgUrl = `https://t.me/share/url?url=${encodeURIComponent(url)}&text=${encodeURIComponent('Join me on CHATR — the smarter way to get things done')}`;

  return (
    <div className={`rounded-2xl bg-white border border-[#DDE3DF] shadow-sm p-4 space-y-3 ${compact ? 'max-w-xs' : 'max-w-md'}`}>
      <div className="flex items-center gap-2">
        <Share2 className="w-4 h-4 text-[#164E3F]" />
        <span className="text-sm font-semibold text-[#111817]">Invite friends to CHATR</span>
      </div>

      <div className="flex gap-2">
        <div className="flex-1 bg-[#F8F8F5] border border-[#DDE3DF] rounded-xl px-3 py-2 text-xs text-[#53605C] truncate font-mono">
          {url}
        </div>
        <button
          onClick={handleCopy}
          className="px-3 py-2 rounded-xl bg-[#164E3F] text-white text-xs font-semibold flex items-center gap-1.5 hover:bg-[#2E6B59] transition-colors"
        >
          {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
          {copied ? 'Copied!' : 'Copy'}
        </button>
      </div>

      <div className="flex gap-2">
        <a
          href={waUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl bg-[#25D366] text-white text-xs font-semibold hover:opacity-90 transition-opacity"
        >
          <span>📱</span> WhatsApp
        </a>
        <a
          href={tweetUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl bg-black text-white text-xs font-semibold hover:opacity-80 transition-opacity"
        >
          <span>𝕏</span> Tweet
        </a>
        <a
          href={tgUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl bg-[#2AABEE] text-white text-xs font-semibold hover:opacity-90 transition-opacity"
        >
          <span>✈</span> Telegram
        </a>
      </div>

      <p className="text-[10px] text-[#53605C] text-center">
        Share CHATR and help others discover a smarter way to get things done.
      </p>
    </div>
  );
};
