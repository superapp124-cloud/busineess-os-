import React from 'react';
import { ExternalLink, CheckCircle2, Sparkles, Grid } from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';

interface Source {
 title?: string;
 url?: string;
 domain?: string;
 favicon?: string;
}

interface ImageSource {
 url: string;
 fullUrl?: string;
 source: string;
 title?: string;
 thumbnail?: string;
}

interface AISummaryContentProps {
 content: string;
 sources?: Source[];
 images?: ImageSource[];
 className?: string;
}

// 10x Better Parse Engine: Handles Bullet Lists, Metadata Grids, and Prose
const parseAIContent = (text: string): React.ReactNode[] => {
 if (!text) return [];
 
 const elements: React.ReactNode[] = [];
 
 // Split by section headers (## Header)
 const sectionRegex = /^##\s*(.+)$/gm;
 const parts = text.split(sectionRegex);
 
 let keyIdx = 0;
 
 for (let i = 0; i < parts.length; i++) {
   const part = parts[i].trim();
   if (!part) continue;
   
   // Check if this is a header (odd index after split)
   const isAfterHeader = i > 0 && i % 2 === 1;
   
   if (isAfterHeader) {
     elements.push(
       <motion.h3 
         key={`h-${keyIdx}`} 
         initial={{ opacity: 0, y: 10 }}
         animate={{ opacity: 1, y: 0 }}
         transition={{ delay: keyIdx * 0.05 }}
         className="font-bold text-foreground text-lg mt-6 mb-3 flex items-center gap-2 border-b border-white/5 pb-2 text-white"
       >
         {part}
       </motion.h3>
     );
     keyIdx++;
     continue;
   }
   
   // Split content by paragraphs
   const paragraphs = part.split(/\n\n+/);
   
   paragraphs.forEach((para) => {
     const trimmed = para.trim();
     if (!trimmed) return;
     
     // 1. Detect bulleted lists (starts with - or *)
     if (trimmed.split('\n').every(line => /^\s*[-*]\s+/.test(line))) {
        const lines = trimmed.split('\n');
        elements.push(
          <motion.div 
            key={`list-${keyIdx}`}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: keyIdx * 0.05 }}
            className="flex flex-col gap-3 my-4 pl-1"
          >
            {lines.map((line, idx) => {
              const lineText = line.replace(/^\s*[-*]\s+/, '');
              return (
                <div key={idx} className="flex items-start gap-2.5 text-[15px] text-slate-300">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 mt-0.5 shrink-0" />
                  <span className="leading-relaxed">{renderInlineFormatting(lineText)}</span>
                </div>
              );
            })}
          </motion.div>
        );
        keyIdx++;
        return;
     }

     // 2. Detect Key-Value Grid (lines like **Key:** Value)
     if (trimmed.split('\n').every(line => /^\s*\*\*[^*]+\*\*\s*:?\s+/.test(line))) {
        const lines = trimmed.split('\n');
        elements.push(
          <motion.div 
            key={`grid-${keyIdx}`}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: keyIdx * 0.05 }}
            className="grid grid-cols-1 md:grid-cols-2 gap-4 my-5 bg-slate-800/30 p-5 rounded-2xl border border-white/10 shadow-lg"
          >
            {lines.map((line, idx) => {
              const match = line.match(/^\s*\*\*([^*]+)\*\*\s*:?\s+(.*)$/);
              if (match) {
                 return (
                   <div key={idx} className="flex flex-col">
                     <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">{match[1]}</span>
                     <span className="text-[15px] font-bold text-slate-200">{renderInlineFormatting(match[2])}</span>
                   </div>
                 );
              }
              return <div key={idx} className="text-slate-300">{line}</div>;
            })}
          </motion.div>
        );
        keyIdx++;
        return;
     }

     // 3. Regular paragraph
     elements.push(
       <motion.p 
         key={`p-${keyIdx}`} 
         initial={{ opacity: 0, y: 10 }}
         animate={{ opacity: 1, y: 0 }}
         transition={{ delay: keyIdx * 0.05 }}
         className="text-[15px] text-slate-300 leading-relaxed mb-4"
       >
         {renderInlineFormatting(trimmed)}
       </motion.p>
     );
     keyIdx++;
   });
 }
 
 return elements;
};

// Render inline formatting (bold, italics, links)
const renderInlineFormatting = (text: string): React.ReactNode => {
 if (!text) return null;
 
 const parts: React.ReactNode[] = [];
 let remaining = text;
 let idx = 0;
 
 // Process bold text: **text**
 const boldRegex = /\*\*([^*]+)\*\*/g;
 let lastIndex = 0;
 let match;
 
 const processedText = text.replace(boldRegex, (_, content) => `<b>${content}</b>`);
 
 // Now split by bold markers and render
 const segments = processedText.split(/(<b>.*?<\/b>)/g);
 
 return segments.map((segment, i) => {
 if (segment.startsWith('<b>') && segment.endsWith('</b>')) {
 const content = segment.slice(3, -4);
 return <strong key={i} className="font-semibold">{content}</strong>;
 }
 // Clean remaining markdown
 const cleaned = segment
 .replace(/\*([^*]+)\*/g, '$1')
 .replace(/_([^_]+)_/g, '$1')
 .replace(/`([^`]+)`/g, '$1')
 .replace(/\[(\d+)\]/g, '');
 return cleaned;
 });
};

export const AISummaryContent: React.FC<AISummaryContentProps> = ({
 content,
 sources = [],
 images = [],
 className
}) => {
 const parsedContent = parseAIContent(content);
 
 return (
 <div className={cn("space-y-1", className)}>
  {/* Images gallery - 10x Better Hero / Masonry Layout */}
  {images && images.length > 0 && (
  <motion.div 
    initial={{ opacity: 0, scale: 0.98 }}
    animate={{ opacity: 1, scale: 1 }}
    transition={{ duration: 0.4 }}
    className="mb-6 grid grid-cols-4 gap-2 h-48 md:h-64 rounded-2xl overflow-hidden"
  >
    {images.map((img, idx) => {
      // First image is hero (spans 2 cols, full height)
      if (idx === 0) {
        return (
          <a key={idx} href={img.fullUrl || img.url} target="_blank" rel="noopener noreferrer" className="col-span-2 row-span-2 relative group cursor-pointer">
            <img src={img.url} alt={img.title || 'Hero'} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" loading="lazy" onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-4">
              <span className="text-white text-xs font-semibold truncate">{img.source || img.title}</span>
            </div>
          </a>
        );
      }
      // Max 4 additional images in the remaining 2 columns, 2 rows
      if (idx > 4) return null;
      return (
        <a key={idx} href={img.fullUrl || img.url} target="_blank" rel="noopener noreferrer" className="relative group cursor-pointer overflow-hidden">
          <img src={img.thumbnail || img.url} alt={img.title || ''} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" loading="lazy" onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />
          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
            <ExternalLink className="w-4 h-4 text-white" />
          </div>
        </a>
      );
    })}
  </motion.div>
  )}
 
 {/* Main content - Perplexity-style flowing prose */}
 <div className="text-[15px] text-foreground">
 {parsedContent}
 </div>
 
 {/* Inline source citations - compact like Perplexity */}
 {sources.length > 0 && (
 <div className="pt-3 mt-4 border-t border-border/20">
 <div className="flex flex-wrap items-center gap-2">
 {sources.slice(0, 5).map((source, idx) => {
 if (!source.url) return null;
 
 let domain = source.domain || 'source';
 try {
 if (!source.domain && source.url) {
 domain = new URL(source.url).hostname.replace('www.', '');
 }
 } catch {}
 
 // Get short domain name for display
 const shortDomain = domain.split('.')[0];
 
 return (
 <a
 key={idx}
 href={source.url}
 target="_blank"
 rel="noopener noreferrer"
 className="inline-flex items-center gap-1 px-2 py-0.5 text-label bg-muted/50 hover:bg-muted rounded-full text-muted-foreground hover:text-foreground transition-colors"
 >
 <span>{shortDomain}</span>
 {sources.length > 1 && idx < sources.length - 1 && (
 <span className="text-muted-foreground/50">+{sources.length - idx - 1}</span>
 )}
 </a>
 );
 }).filter(Boolean).slice(0, 3)}
 </div>
 </div>
 )}
 </div>
 );
};

export default AISummaryContent;
