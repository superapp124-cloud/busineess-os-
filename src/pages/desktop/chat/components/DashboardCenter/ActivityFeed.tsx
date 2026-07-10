import React from 'react';
import { useLiveActivity } from '@/providers/useLiveActivity';
import { FileText, CheckCircle2, Video, AtSign, Settings } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

const icons: Record<string, any> = {
  file: <FileText className="w-3.5 h-3.5 text-blue-400" />,
  system: <Settings className="w-3.5 h-3.5 text-slate-400" />,
  success: <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />,
  meeting: <Video className="w-3.5 h-3.5 text-orange-400" />,
  mention: <AtSign className="w-3.5 h-3.5 text-yellow-400" />,
};

export const ActivityFeed: React.FC = () => {
  const { activities, isLoading, isEmpty } = useLiveActivity(10);

  return (
    <div className="bg-white/[0.02] border border-white/[0.04] rounded-2xl p-4 flex-1 flex flex-col h-full min-h-[150px]">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-sm font-bold text-white/90">Live Activity</h2>
        <button className="text-[10px] text-violet-400 hover:text-violet-300">View all</button>
      </div>
      
      <div className="flex-1 overflow-y-auto space-y-4 pr-2 custom-scrollbar relative">
        {isLoading && activities.length === 0 ? (
          <div className="space-y-4 animate-pulse">
            {[1, 2, 3].map(i => (
              <div key={i} className="flex gap-3 items-start">
                <div className="w-8 h-8 rounded-full bg-white/5 shrink-0" />
                <div className="flex-1 space-y-2">
                  <div className="h-3 bg-white/10 rounded w-3/4" />
                  <div className="h-2 bg-white/5 rounded w-1/2" />
                </div>
              </div>
            ))}
          </div>
        ) : isEmpty ? (
          <div className="flex-1 flex flex-col items-center justify-center text-center px-6 min-h-[120px]">
            <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center mb-3">
              <CheckCircle2 className="w-5 h-5 text-emerald-400/50" />
            </div>
            <p className="text-sm font-semibold text-white/90">Activity Feed</p>
            <p className="text-xs text-white/50 mt-2">Watch this space for real-time updates when your team sends messages, completes tasks, or schedules meetings.</p>
          </div>
        ) : (
          activities.map(act => {
            const iconType = act.metadata?.originalType || act.entityType || 'system';
            return (
              <div key={act.id} className="flex gap-3 items-start group">
                <div className="w-8 h-8 rounded-full bg-white/5 border border-white/5 flex items-center justify-center mt-0.5 shrink-0 group-hover:bg-white/10 transition-colors">
                  {icons[iconType] || icons.system}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-white/90 truncate">{act.description}</p>
                  {act.metadata?.preview && (
                    <p className="text-xs text-white/50 truncate">{act.metadata.preview}</p>
                  )}
                </div>
                <span className="text-[10px] text-white/30 shrink-0">
                  {formatDistanceToNow(new Date(act.createdAt), { addSuffix: true })}
                </span>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
