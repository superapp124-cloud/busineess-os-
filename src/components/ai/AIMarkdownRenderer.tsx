import React from 'react';
import { cn } from '@/lib/utils';

interface AIMarkdownRendererProps {
  content: string;
  className?: string;
}

/**
 * Universal CHATR AI Markdown & Formatting Renderer
 * Converts executive briefings, lists, headers, bold text, and inline formatting
 * into polished, scannable enterprise UI components.
 */
export const AIMarkdownRenderer: React.FC<AIMarkdownRendererProps> = React.memo(({ content, className }) => {
  if (!content) return null;

  // Pre-process text: if multiple ### or ## headers are squashed onto one line without newlines, add newlines before them
  let formatted = content
    .replace(/([^\n])(###\s)/g, '$1\n\n$2')
    .replace(/([^\n])(##\s)/g, '$1\n\n$2')
    .replace(/([^\n])(#\s)/g, '$1\n\n$2');

  const lines = formatted.split('\n');
  const elements: React.ReactNode[] = [];

  const renderInline = (text: string) => {
    // Process **bold** and *italics*
    const parts = text.split(/(\*\*.*?\*\*|\*.*?\*)/g);
    return parts.map((part, idx) => {
      if (part.startsWith('**') && part.endsWith('**') && part.length > 4) {
        return <strong key={idx} className="font-bold text-white">{part.slice(2, -2)}</strong>;
      }
      if (part.startsWith('*') && part.endsWith('*') && part.length > 2 && !part.startsWith('**')) {
        return <em key={idx} className="italic text-white/90">{part.slice(1, -1)}</em>;
      }
      return part;
    });
  };

  lines.forEach((line, index) => {
    const trimmed = line.trim();
    if (!trimmed) {
      elements.push(<div key={`space-${index}`} className="h-1.5" />);
      return;
    }

    // Main Header: # or ##
    if (trimmed.startsWith('# ') || trimmed.startsWith('## ')) {
      const text = trimmed.replace(/^#+\s*/, '');
      elements.push(
        <h3 key={`h2-${index}`} className="text-white font-bold text-[13px] mt-3 mb-1 first:mt-0 tracking-wide border-b border-white/10 pb-1">
          {renderInline(text)}
        </h3>
      );
      return;
    }

    // Subheader: ### or ####
    if (trimmed.startsWith('### ') || trimmed.startsWith('#### ')) {
      const text = trimmed.replace(/^#+\s*/, '');
      elements.push(
        <h4 key={`h3-${index}`} className="text-[#6D5DF6] font-bold text-[12px] mt-3 mb-1 uppercase tracking-wider">
          {renderInline(text)}
        </h4>
      );
      return;
    }

    // Bullet points: •, -, or *
    if (trimmed.startsWith('• ') || trimmed.startsWith('- ') || (trimmed.startsWith('* ') && !trimmed.endsWith('*'))) {
      const text = trimmed.replace(/^[•-*]\s*/, '');
      elements.push(
        <div key={`bullet-${index}`} className="flex items-start gap-2 ml-1 my-1">
          <span className="text-[#6D5DF6] font-bold mt-0.5 shrink-0 text-sm">•</span>
          <p className="text-white/85 text-[12px] leading-relaxed flex-1">{renderInline(text)}</p>
        </div>
      );
      return;
    }

    // Numbered lists: 1. 2. etc
    if (/^\d+\.\s/.test(trimmed)) {
      const match = trimmed.match(/^(\d+\.)\s*(.*)/);
      if (match) {
        elements.push(
          <div key={`num-${index}`} className="flex items-start gap-2 ml-1 my-1">
            <span className="text-[#6D5DF6] font-mono font-bold text-[11px] mt-0.5 shrink-0">{match[1]}</span>
            <p className="text-white/85 text-[12px] leading-relaxed flex-1">{renderInline(match[2])}</p>
          </div>
        );
        return;
      }
    }

    // Normal paragraph
    elements.push(
      <p key={`p-${index}`} className="text-white/85 text-[12px] leading-relaxed my-1">
        {renderInline(trimmed)}
      </p>
    );
  });

  return (
    <div className={cn("space-y-1 font-sans", className)}>
      {elements}
    </div>
  );
});
