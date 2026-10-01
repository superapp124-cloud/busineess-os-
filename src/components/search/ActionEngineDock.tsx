import React, { useState } from 'react';
import { 
  OmnibarTask, 
  StructuredEvidenceItem 
} from '@/services/intentEngine/omnibarIntentParser';
import { 
  CheckCircle2, 
  MapPin, 
  Phone, 
  Navigation, 
  Bookmark, 
  Share2, 
  Sparkles, 
  ArrowUpRight,
  ShieldCheck,
  Calendar,
  Zap,
  Check
} from 'lucide-react';
import { toast } from 'sonner';

interface ActionEngineDockProps {
  task: OmnibarTask;
  onFilterClick?: (filter: string) => void;
}

export const ActionEngineDock: React.FC<ActionEngineDockProps> = ({ task, onFilterClick }) => {
  const [savedIds, setSavedIds] = useState<Set<string>>(new Set());
  const [bookedIds, setBookedIds] = useState<Set<string>>(new Set());

  const handleSave = (item: StructuredEvidenceItem) => {
    setSavedIds(prev => {
      const next = new Set(prev);
      if (next.has(item.id)) {
        next.delete(item.id);
        toast.info(`Removed "${item.title}" from saved items`);
      } else {
        next.add(item.id);
        toast.success(`Saved "${item.title}" to CHATR Life Tracker`);
      }
      return next;
    });
  };

  const handleBook = (item: StructuredEvidenceItem) => {
    setBookedIds(prev => new Set(prev).add(item.id));
    toast.success(`Confirmed action for "${item.title}"! Details dispatched to CHATR Assistant.`);
  };

  const handleCall = (phone?: string) => {
    if (!phone) {
      toast.error('No contact phone available');
      return;
    }
    window.location.href = `tel:${phone}`;
  };

  const handleDirections = (geoQuery?: string) => {
    if (!geoQuery) return;
    const url = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(geoQuery)}`;
    window.open(url, '_blank');
  };

  const handleShare = async (item: StructuredEvidenceItem) => {
    const text = `Check out ${item.title} on CHATR: ${item.priceOrCost} in ${item.location}`;
    if (navigator.share) {
      try {
        await navigator.share({ title: item.title, text, url: window.location.href });
      } catch (_) {}
    } else {
      navigator.clipboard.writeText(text);
      toast.success('Details copied to clipboard!');
    }
  };

  const categoryColor = {
    jobs: 'from-blue-600/20 to-indigo-600/20 border-blue-500/30 text-blue-400',
    real_estate: 'from-amber-600/20 to-orange-600/20 border-amber-500/30 text-amber-400',
    transit: 'from-emerald-600/20 to-teal-600/20 border-emerald-500/30 text-emerald-400',
    services: 'from-purple-600/20 to-violet-600/20 border-purple-500/30 text-purple-400',
    healthcare: 'from-rose-600/20 to-pink-600/20 border-rose-500/30 text-rose-400',
    general: 'from-zinc-800 to-zinc-900 border-zinc-700 text-zinc-300'
  }[task.category] || 'from-zinc-800 to-zinc-900 border-zinc-700 text-zinc-300';

  return (
    <div className="w-full space-y-4 my-4">
      {/* Header Banner */}
      <div className={`p-4 rounded-2xl bg-gradient-to-r ${categoryColor} border backdrop-blur-md flex flex-col md:flex-row md:items-center justify-between gap-3 shadow-xl`}>
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold tracking-wider uppercase bg-white/10 border border-white/10 text-white flex items-center gap-1">
              <Zap className="w-3 h-3 text-amber-400" />
              CHATR Action Engine • {task.category.replace('_', ' ')}
            </span>
            <span className="text-xs text-white/50">
              Confidence: {Math.round(task.confidence * 100)}%
            </span>
          </div>
          <h2 className="text-lg md:text-xl font-bold text-white tracking-tight">
            {task.headline}
          </h2>
          <p className="text-xs text-white/70">
            Synthesized live evidence with one-tap execution
          </p>
        </div>

        {/* Suggested Filters */}
        {task.suggestedFilters.length > 0 && (
          <div className="flex flex-wrap items-center gap-1.5 pt-1 md:pt-0">
            {task.suggestedFilters.map((filter, idx) => (
              <button
                key={idx}
                onClick={() => onFilterClick && onFilterClick(filter)}
                className="px-2.5 py-1 text-[11px] rounded-lg bg-zinc-900/60 hover:bg-zinc-800 text-white/80 hover:text-white border border-white/10 transition-colors"
              >
                + {filter}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Evidence Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {task.evidenceItems.map(item => {
          const isSaved = savedIds.has(item.id);
          const isBooked = bookedIds.has(item.id);

          return (
            <div 
              key={item.id}
              className="p-4 rounded-2xl bg-zinc-900/80 border border-white/10 hover:border-white/20 transition-all duration-200 flex flex-col justify-between gap-3 shadow-lg group relative overflow-hidden"
            >
              {/* Top Row: Title, Badge, Price */}
              <div>
                <div className="flex items-start justify-between gap-2">
                  <div className="space-y-1">
                    {item.badge && (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                        <ShieldCheck className="w-3 h-3" />
                        {item.badge}
                      </span>
                    )}
                    <h3 className="text-base font-semibold text-white group-hover:text-amber-300 transition-colors">
                      {item.title}
                    </h3>
                    <p className="text-xs text-zinc-400">
                      {item.subtitle}
                    </p>
                  </div>

                  <div className="text-right shrink-0">
                    <span className="text-base font-bold text-emerald-400 block">
                      {item.priceOrCost}
                    </span>
                    <span className="text-[10px] text-zinc-500">
                      Match: {item.matchScore}%
                    </span>
                  </div>
                </div>

                {/* Location */}
                <div className="flex items-center gap-1.5 text-xs text-zinc-400 mt-2">
                  <MapPin className="w-3.5 h-3.5 text-rose-400 shrink-0" />
                  <span className="truncate">{item.location}</span>
                </div>

                {/* Attributes Grid */}
                {item.attributes.length > 0 && (
                  <div className="grid grid-cols-2 gap-2 mt-3 pt-3 border-t border-white/5">
                    {item.attributes.map((attr, i) => (
                      <div key={i} className="flex flex-col">
                        <span className="text-[10px] uppercase text-zinc-500 tracking-wider font-medium">
                          {attr.label}
                        </span>
                        <span className="text-xs text-zinc-200 font-medium truncate">
                          {attr.value}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Action Engine Dock (Buttons) */}
              <div className="pt-3 border-t border-white/5 flex items-center justify-between gap-2">
                <div className="flex items-center gap-1.5">
                  {/* Book / Primary Action */}
                  <button
                    onClick={() => handleBook(item)}
                    disabled={isBooked}
                    className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all ${
                      isBooked 
                        ? 'bg-emerald-600/30 text-emerald-400 border border-emerald-500/40 cursor-default'
                        : 'bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-zinc-950 shadow-md shadow-amber-500/20'
                    }`}
                  >
                    {isBooked ? (
                      <>
                        <Check className="w-3.5 h-3.5" /> Booked
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-3.5 h-3.5" /> {task.primaryActionLabel}
                      </>
                    )}
                  </button>

                  {/* Call Direct */}
                  {item.phone && (
                    <button
                      onClick={() => handleCall(item.phone)}
                      className="p-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white border border-white/10 transition-colors"
                      title="Call direct"
                    >
                      <Phone className="w-3.5 h-3.5" />
                    </button>
                  )}

                  {/* Directions */}
                  {item.geoQuery && (
                    <button
                      onClick={() => handleDirections(item.geoQuery)}
                      className="p-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white border border-white/10 transition-colors"
                      title="Turn-by-turn map"
                    >
                      <Navigation className="w-3.5 h-3.5 text-blue-400" />
                    </button>
                  )}
                </div>

                <div className="flex items-center gap-1.5">
                  {/* Save */}
                  <button
                    onClick={() => handleSave(item)}
                    className={`p-2 rounded-xl border transition-colors ${
                      isSaved 
                        ? 'bg-amber-500/20 border-amber-500/40 text-amber-400' 
                        : 'bg-zinc-800 hover:bg-zinc-700 border-white/10 text-zinc-400 hover:text-white'
                    }`}
                    title={isSaved ? 'Saved' : 'Save to Life Tracker'}
                  >
                    <Bookmark className="w-3.5 h-3.5" />
                  </button>

                  {/* Share */}
                  <button
                    onClick={() => handleShare(item)}
                    className="p-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 border border-white/10 text-zinc-400 hover:text-white transition-colors"
                    title="Share"
                  >
                    <Share2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
