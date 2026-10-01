import React from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Calendar, Clock, MapPin, CheckCircle2, Sparkles, ExternalLink, Edit2 } from 'lucide-react';
import { format } from 'date-fns';

interface EventMessageProps {
  data: {
    title: string;
    date: string;
    time: string;
    location?: string;
    description?: string;
  };
  isOwn?: boolean;
}

export const EventMessage: React.FC<EventMessageProps> = ({ data, isOwn = false }) => {
  return (
    <div className="my-2 max-w-[340px] rounded-2xl bg-[#121A24] border border-emerald-500/30 p-4 shadow-xl backdrop-blur-md">
      {/* SI Header */}
      <div className="flex items-center justify-between pb-3 border-b border-white/10">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          </div>
          <div>
            <h4 className="text-[14px] font-bold text-white tracking-tight">Meeting scheduled</h4>
            <div className="flex items-center gap-1 text-[11px] text-emerald-400 font-medium">
              <Sparkles className="w-3 h-3" />
              <span>Chatr SI Assistant</span>
            </div>
          </div>
        </div>
        <span className="text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-950/80 text-emerald-300 border border-emerald-800/40 font-semibold">
          Synced
        </span>
      </div>

      {/* Meeting Details */}
      <div className="py-3 space-y-2">
        <div className="text-[14px] font-semibold text-white/95 leading-snug">
          {data.title || 'Discussion & Alignment'}
        </div>
        
        <div className="space-y-1.5 text-xs text-white/70">
          <div className="flex items-center gap-2">
            <Calendar className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
            <span>{data.date ? format(new Date(data.date), 'EEEE, MMM d, yyyy') : 'Tomorrow, 4:00 - 5:00 PM'}</span>
          </div>
          <div className="flex items-center gap-2">
            <Clock className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
            <span>{data.time || '4:00 PM - 5:00 PM (IST)'}</span>
          </div>
          {data.location && (
            <div className="flex items-center gap-2">
              <MapPin className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
              <span className="truncate">{data.location}</span>
            </div>
          )}
        </div>

        {data.description && (
          <p className="text-xs text-white/60 bg-white/[0.03] p-2 rounded-lg border border-white/5 mt-2 line-clamp-2">
            {data.description}
          </p>
        )}
      </div>

      {/* Action Buttons */}
      <div className="flex items-center gap-2 pt-2 border-t border-white/10">
        <button 
          onClick={() => {
            // Open calendar link or toast
            if (typeof window !== 'undefined') {
              window.open(`https://calendar.google.com/calendar/r/eventedit?text=${encodeURIComponent(data.title)}`, '_blank');
            }
          }}
          className="flex-1 flex items-center justify-center gap-1.5 h-9 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold shadow-md shadow-emerald-950/40 transition-all active:scale-95"
        >
          <Calendar className="w-3.5 h-3.5" />
          <span>View in Calendar</span>
        </button>
        <button 
          className="flex items-center justify-center gap-1 h-9 px-3 rounded-xl bg-white/[0.06] hover:bg-white/[0.12] text-white/80 text-xs font-medium border border-white/10 transition-all active:scale-95"
        >
          <Edit2 className="w-3 h-3" />
          <span>Edit</span>
        </button>
      </div>
    </div>
  );
};
