import React from 'react';
import { ChevronRight, ArrowLeft } from 'lucide-react';

interface Props {
  breadcrumbs: string[];
  onBackToHome?: () => void;
}

export const ContextBar: React.FC<Props> = ({ breadcrumbs, onBackToHome }) => {
  return (
    <div className="flex items-center justify-between px-6 py-3 border-b border-slate-200 bg-white/50 backdrop-blur-sm shrink-0">
      <div className="flex items-center">
        {onBackToHome && (
          <button
            onClick={onBackToHome}
            className="mr-4 px-3 py-1.5 bg-slate-100 hover:bg-indigo-50 text-slate-700 hover:text-indigo-600 rounded-lg text-xs font-bold transition-colors flex items-center gap-1.5 cursor-pointer border border-slate-200 shadow-2xs"
            title="Return to Home Dashboard"
          >
            <ArrowLeft className="w-3.5 h-3.5 text-indigo-600" />
            <span>Back to Home</span>
          </button>
        )}
        {breadcrumbs.map((crumb, index) => (
          <React.Fragment key={index}>
            <span className={`text-[11px] font-semibold tracking-wide ${index === breadcrumbs.length - 1 ? 'text-indigo-700 font-bold' : 'text-slate-500'}`}>
              {crumb}
            </span>
            {index < breadcrumbs.length - 1 && (
              <ChevronRight className="w-3.5 h-3.5 text-slate-300 mx-2" />
            )}
          </React.Fragment>
        ))}
      </div>
    </div>
  );
};
