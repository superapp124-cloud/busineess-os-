import React from 'react';
import { DashboardHeader } from './DashboardHeader';
import { QuickActions } from './QuickActions';
import { AIInsights } from './AIInsights';
import { ActivityFeed } from './ActivityFeed';
import { ProjectsWidget } from './ProjectsWidget';
import { TasksWidget } from './TasksWidget';
import { CalendarWidget } from './CalendarWidget';
import { UniversalCommandBar } from './UniversalCommandBar';

export const DashboardCenterPanel: React.FC<{
  onCreateNew?: () => void;
  onNewChat?: () => void;
}> = ({ onCreateNew, onNewChat }) => {
  return (
    <div className="flex-1 flex flex-col relative z-10 bg-[#0b0b14] overflow-hidden">
      <div className="flex-1 p-4 lg:p-6 flex flex-col min-h-0 gap-4 overflow-y-auto custom-scrollbar">
        <DashboardHeader onCreateNew={onCreateNew} />
        <QuickActions onNewChat={onNewChat} onCreateChannel={onCreateNew} />
        
        <div className="w-full flex-1 grid grid-cols-2 gap-4 min-h-[400px]">
          <div className="flex flex-col gap-4">
             <AIInsights />
             <ProjectsWidget />
          </div>
          <div className="flex flex-col gap-4">
             <ActivityFeed />
             <TasksWidget />
          </div>
        </div>
        
        <div className="shrink-0">
          <CalendarWidget />
        </div>
        
        <div className="shrink-0 mt-4">
          <UniversalCommandBar />
        </div>
      </div>
    </div>
  );
};
