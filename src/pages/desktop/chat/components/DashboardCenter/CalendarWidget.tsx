import React from 'react';
import { useLiveCalendar } from '@/providers/useLiveCalendar';
import { format } from 'date-fns';
import { Calendar as CalendarIcon } from 'lucide-react';

export const CalendarWidget: React.FC = () => {
  const { events, isLoading, isEmpty } = useLiveCalendar();

  return (
    <div className="w-full mt-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-sm font-bold text-white/90">Upcoming Schedule</h2>
        <button className="text-[10px] text-violet-400 hover:text-violet-300">View calendar</button>
      </div>
      
      <div className="grid grid-cols-4 gap-4">
        {isLoading && events.length === 0 ? (
          [1,2,3,4].map(i => (
            <div key={i} className="bg-white/[0.02] border border-white/[0.04] border-l-2 border-white/10 rounded-xl p-4 animate-pulse">
              <div className="h-2 bg-white/10 rounded w-1/4 mb-3" />
              <div className="h-3 bg-white/20 rounded w-3/4 mb-2" />
              <div className="h-2 bg-white/10 rounded w-1/2 mb-4" />
              <div className="flex gap-1"><div className="w-6 h-6 rounded-full bg-white/10" /></div>
            </div>
          ))
        ) : isEmpty ? (
          <div className="col-span-4 bg-white/[0.02] border border-white/[0.04] rounded-xl p-8 flex flex-col items-center justify-center text-center px-12">
            <CalendarIcon className="w-8 h-8 text-white/20 mb-3" />
            <p className="text-sm font-bold text-white/90">Upcoming Schedule</p>
            <p className="text-xs text-white/50 mt-1">Once you connect your calendar, your upcoming meetings and events will automatically appear right here.</p>
          </div>
        ) : (
          events.slice(0, 4).map((slot) => {
            const timeString = format(new Date(slot.startAt), 'h:mm a');
            return (
              <div key={slot.id} className={`bg-white/[0.02] border border-white/[0.04] border-l-2 rounded-xl p-4 hover:bg-white/[0.04] transition-colors cursor-pointer`} style={{ borderLeftColor: slot.color }}>
                <p className="text-[10px] text-white/50 mb-1 font-mono">{timeString}</p>
                <p className="text-sm font-bold text-white/90 mb-0.5 truncate">{slot.title}</p>
                {slot.description && (
                  <p className="text-xs text-white/50 mb-4 truncate">{slot.description}</p>
                )}
                
                <div className="flex items-center gap-1 mt-auto pt-2">
                  <div className="flex -space-x-2">
                    {slot.attendees?.slice(0, 3).map((p: any, i: number) => (
                      <div key={i} className="w-6 h-6 rounded-full bg-zinc-800 border border-[#0a0a0f] flex items-center justify-center text-[8px] text-white/30 uppercase">
                        {p.userId?.slice(0, 2)}
                      </div>
                    ))}
                  </div>
                  {slot.attendees?.length > 3 && (
                    <span className="text-[10px] text-white/40 ml-1">+{slot.attendees.length - 3}</span>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
