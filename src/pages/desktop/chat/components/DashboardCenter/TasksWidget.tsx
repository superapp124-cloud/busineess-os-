import React from 'react';
import { useLiveTasks } from '@/providers/useLiveTasks';
import { CheckCircle2, Circle, ListTodo } from 'lucide-react';
import { format } from 'date-fns';

export const TasksWidget: React.FC = () => {
  const { tasks, isLoading, isEmpty } = useLiveTasks();

  const getPriorityColor = (priority: string) => {
    switch (priority?.toLowerCase()) {
      case 'critical': return 'text-red-400 border-red-400/20 bg-red-500/10';
      case 'high': return 'text-orange-400 border-orange-400/20 bg-orange-500/10';
      case 'medium': return 'text-yellow-400 border-yellow-400/20 bg-yellow-500/10';
      case 'low': return 'text-emerald-400 border-emerald-400/20 bg-emerald-500/10';
      default: return 'text-white/50 border-white/10 bg-white/5';
    }
  };

  return (
    <div className="bg-white/[0.02] border border-white/[0.04] rounded-2xl p-4 flex-1 flex flex-col h-full min-h-[150px]">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-sm font-bold text-white/90">Tasks</h2>
        <button className="text-[10px] text-violet-400 hover:text-violet-300">View all</button>
      </div>
      <div className="flex-1 overflow-y-auto space-y-3 pr-2 custom-scrollbar relative">
        {isLoading && tasks.length === 0 ? (
          <div className="space-y-3 animate-pulse">
            {[1,2,3,4].map(i => (
              <div key={i} className="flex justify-between items-center">
                <div className="flex items-center gap-3 w-1/2">
                  <div className="w-4 h-4 rounded-full bg-white/10 shrink-0" />
                  <div className="h-3 bg-white/10 rounded w-full" />
                </div>
                <div className="h-4 bg-white/10 rounded w-12" />
              </div>
            ))}
          </div>
        ) : isEmpty ? (
          <div className="flex-1 flex flex-col items-center justify-center text-center px-6 min-h-[120px]">
            <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center mb-3">
              <ListTodo className="w-5 h-5 text-emerald-400/50" />
            </div>
            <p className="text-sm font-semibold text-white/90">Tasks & To-Dos</p>
            <p className="text-xs text-white/50 mt-2">Create tasks for yourself or assign them to your team, and they will be tracked and organized right here.</p>
          </div>
        ) : (
          tasks.map(task => (
            <div key={task.id} className="flex items-center justify-between group p-2 hover:bg-white/5 rounded-lg transition-colors -mx-2">
              <div className="flex items-center gap-3 overflow-hidden">
                <button className="text-white/20 hover:text-emerald-400 transition-colors shrink-0">
                  {task.status === 'done' ? <CheckCircle2 className="w-4 h-4 text-emerald-400" /> : <Circle className="w-4 h-4" />}
                </button>
                <p className="text-sm text-white/90 truncate">{task.title}</p>
              </div>
              <div className="flex items-center gap-4 shrink-0">
                <span className={`text-[10px] px-2 py-0.5 rounded-md border capitalize ${getPriorityColor(task.priority)}`}>
                  {task.priority || 'Medium'}
                </span>
                <span className="text-xs text-white/40 w-20 text-right truncate">
                  {task.dueDate ? format(new Date(task.dueDate), 'MMM d') : 'No date'}
                </span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
