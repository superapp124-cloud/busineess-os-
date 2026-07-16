import React from 'react';
import { DashboardHeader } from './DashboardHeader';
import { IntentActions } from './IntentActions';
import { AIBriefHero } from './AIBriefHero';
import { AIInsights } from './AIInsights';
import { ActivityFeed } from './ActivityFeed';
import { ProjectsWidget } from './ProjectsWidget';
import { TasksWidget } from './TasksWidget';
import { CalendarWidget } from './CalendarWidget';
import { UniversalCommandBar } from './UniversalCommandBar';
import { useExperience } from '@/providers/ExperienceProvider';

export const DashboardCenterPanel: React.FC<{
  onCreateNew?: () => void;
  onNewChat?: () => void;
}> = ({ onCreateNew, onNewChat }) => {
  const { experience } = useExperience();

  return (
    <div className="flex-1 flex flex-col relative z-10 bg-[#0b0b14] overflow-hidden">
      <div className="flex-1 p-4 lg:p-8 flex flex-col min-h-0 gap-6 overflow-y-auto custom-scrollbar">
        <div className="flex flex-col gap-1">
          <DashboardHeader onCreateNew={onCreateNew} />
          <UniversalCommandBar />
        </div>
        
        {experience.dashboard.showAIBrief && <AIBriefHero />}
        
        <div className="pt-2">
          <h3 className="text-sm font-bold text-white/40 uppercase tracking-[0.2em] mb-4 pl-1">Primary Actions</h3>
          <IntentActions />
        </div>
        
        <div className="w-full flex-1 grid grid-cols-2 gap-4 mt-6">
          <div className="flex flex-col gap-4">
             {experience.dashboard.widgets.includes('activity') && <ActivityFeed />}
             {experience.dashboard.widgets.includes('projects') && <ProjectsWidget />}
          </div>
          <div className="flex flex-col gap-4">
             {experience.dashboard.widgets.includes('tasks') && <TasksWidget />}
             {experience.dashboard.widgets.includes('calendar') && <CalendarWidget />}
          </div>
        </div>
      </div>
    </div>
  );
};
