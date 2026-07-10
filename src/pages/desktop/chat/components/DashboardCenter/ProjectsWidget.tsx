import React from 'react';
import { useLiveTasks } from '@/providers/useLiveTasks';
import { Layout } from 'lucide-react';

export const ProjectsWidget: React.FC = () => {
  const { tasks, isLoading, isEmpty } = useLiveTasks();

  // Temporary aggregation: group tasks by listId to simulate "Projects"
  const lists = React.useMemo(() => {
    const grouped: Record<string, any> = {};
    tasks.forEach(t => {
      const lid = t.listId || 'uncategorized';
      if (!grouped[lid]) grouped[lid] = { id: lid, name: lid === 'uncategorized' ? 'Inbox' : `List ${lid.slice(0,4)}`, total: 0, done: 0 };
      grouped[lid].total++;
      if (t.status === 'done') grouped[lid].done++;
    });
    return Object.values(grouped).map(g => ({
      ...g,
      progress: g.total > 0 ? Math.round((g.done / g.total) * 100) : 0,
      color: 'bg-emerald-500' // Randomly assign or derive from list
    }));
  }, [tasks]);

  return (
    <div className="bg-white/[0.02] border border-white/[0.04] rounded-2xl p-4 flex-1 flex flex-col h-full min-h-[150px]">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-sm font-bold text-white/90">Projects Overview</h2>
        <button className="text-[10px] text-violet-400 hover:text-violet-300">View all</button>
      </div>
      <div className="flex-1 overflow-y-auto space-y-4 pr-2 custom-scrollbar relative">
        {isLoading && lists.length === 0 ? (
          <div className="space-y-4 animate-pulse">
            {[1,2,3].map(i => (
              <div key={i} className="flex gap-4 items-center">
                <div className="w-8 h-8 rounded-lg bg-white/10 shrink-0" />
                <div className="flex-1 space-y-2">
                  <div className="h-3 bg-white/10 rounded w-1/3" />
                  <div className="h-1.5 bg-white/5 rounded w-full" />
                </div>
              </div>
            ))}
          </div>
        ) : isEmpty ? (
          <div className="flex-1 flex flex-col items-center justify-center text-center px-6 min-h-[120px]">
            <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center mb-3">
              <Layout className="w-5 h-5 text-blue-400/50" />
            </div>
            <p className="text-sm font-semibold text-white/90">Projects Overview</p>
            <p className="text-xs text-white/50 mt-2">Group your tasks into lists to automatically track project progress and milestones here.</p>
          </div>
        ) : (
          lists.map(proj => (
            <div key={proj.id} className="flex items-center gap-4 group">
              <div className="w-8 h-8 rounded-lg bg-white/5 border border-white/5 flex items-center justify-center shrink-0">
                <Layout className="w-4 h-4 text-white/60" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-white/90 truncate">{proj.name}</p>
                <div className="h-1.5 w-full bg-white/10 rounded-full mt-2 overflow-hidden flex">
                  <div className={`h-full ${proj.color} rounded-full transition-all duration-1000`} style={{ width: `${proj.progress}%` }} />
                </div>
              </div>
              <div className="text-right shrink-0">
                <p className="text-xs font-mono text-white/80">{proj.progress}%</p>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
