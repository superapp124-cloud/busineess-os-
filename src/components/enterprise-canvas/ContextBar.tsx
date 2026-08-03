import React from 'react';
import { ChevronRight } from 'lucide-react';

interface Props {
  breadcrumbs: string[];
}

export const ContextBar: React.FC<Props> = ({ breadcrumbs }) => {
  return (
    <div className="flex items-center px-6 py-3 border-b border-slate-200 bg-white/50 backdrop-blur-sm shrink-0">
      {breadcrumbs.map((crumb, index) => (
        <React.Fragment key={index}>
          <span className={`text-[11px] font-semibold tracking-wide ${index === breadcrumbs.length - 1 ? 'text-indigo-700' : 'text-slate-500'}`}>
            {crumb}
          </span>
          {index < breadcrumbs.length - 1 && (
            <ChevronRight className="w-3.5 h-3.5 text-slate-300 mx-2" />
          )}
        </React.Fragment>
      ))}
    </div>
  );
};
