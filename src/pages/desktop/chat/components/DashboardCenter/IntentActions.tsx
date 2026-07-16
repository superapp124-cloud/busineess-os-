import React from 'react';
import { UserPlus, Calendar, IndianRupee, Plane, FileText, Zap, BarChart3, Search } from 'lucide-react';
import { toast } from 'sonner';
import { useExperience, IntentAction } from '@/providers/ExperienceProvider';
import { useCHATROS } from '@/core/os/GlobalIntentProvider';

const ICON_MAP: Record<string, React.FC<any>> = {
  UserPlus,
  Calendar,
  IndianRupee,
  Plane,
  FileText,
  Zap,
  BarChart3,
  Search,
};

export const IntentActions: React.FC = () => {
  const { experience } = useExperience();
  const chatrOS = useCHATROS();

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
      {experience.primaryIntents.map((intent: IntentAction) => {
        const Icon = ICON_MAP[intent.iconName] || Search;
        return (
        <button 
          key={intent.id}
          onClick={() => {
            toast.info(`Executing: ${intent.label}`);
            chatrOS.submitIntent(intent.label);
          }}
          className="flex items-center gap-3 p-4 rounded-2xl bg-[#11111a] border border-white/5 hover:bg-white/5 hover:border-white/10 transition-all text-left group"
        >
          <div className={`p-2 rounded-lg bg-white/5 group-hover:scale-110 transition-transform ${intent.color}`}>
            <Icon className="w-5 h-5" />
          </div>
          <span className="text-sm font-bold text-white/90 group-hover:text-white transition-colors">{intent.label}</span>
        </button>
        );
      })}
    </div>
  );
};
