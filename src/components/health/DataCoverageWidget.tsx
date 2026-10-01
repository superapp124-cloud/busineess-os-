/**
 * CHATR HEALTH OS — DataCoverageWidget
 *
 * Visualizes biometric and clinical data coverage across all domains.
 * Emphasizes "Building Baseline" without penalizing the user for missing sensors.
 */

import React from 'react';
import { OverallDataCoverage } from '@/services/health/DataCoverageEngine';
import { Heart, Moon, Footprints, Activity, Droplet, Scale, FlaskConical, Plus } from 'lucide-react';

interface DataCoverageWidgetProps {
  coverage: OverallDataCoverage;
  onConnectDevice?: () => void;
}

export function DataCoverageWidget({ coverage, onConnectDevice }: DataCoverageWidgetProps) {
  const getIcon = (key: string) => {
    switch (key) {
      case 'heart':
        return <Heart className="w-4 h-4 text-rose-500" />;
      case 'sleep':
        return <Moon className="w-4 h-4 text-indigo-500" />;
      case 'activity':
        return <Footprints className="w-4 h-4 text-emerald-500" />;
      case 'blood_pressure':
        return <Activity className="w-4 h-4 text-blue-500" />;
      case 'glucose':
        return <Droplet className="w-4 h-4 text-purple-500" />;
      case 'weight':
        return <Scale className="w-4 h-4 text-amber-500" />;
      case 'labs':
        return <FlaskConical className="w-4 h-4 text-teal-500" />;
      default:
        return <Activity className="w-4 h-4 text-slate-500" />;
    }
  };

  return (
    <div className="p-4 bg-white/70 dark:bg-slate-900/70 backdrop-blur-md rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm">
      <div className="flex items-center justify-between mb-3">
        <div>
          <h4 className="text-sm font-bold text-slate-900 dark:text-white">Data Coverage</h4>
          <p className="text-xs text-slate-500 dark:text-slate-400">{coverage.headline}</p>
        </div>
        {onConnectDevice && (
          <button
            onClick={onConnectDevice}
            className="flex items-center gap-1 text-xs font-semibold text-emerald-600 dark:text-emerald-400 hover:underline"
          >
            <Plus className="w-3.5 h-3.5" />
            Connect
          </button>
        )}
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        {coverage.domains.map((dom) => (
          <div
            key={dom.domainKey}
            className="p-2.5 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-100 dark:border-slate-800/80 flex flex-col justify-between"
          >
            <div className="flex items-center justify-between mb-1.5">
              <div className="flex items-center gap-1.5">
                {getIcon(dom.domainKey)}
                <span className="text-xs font-medium text-slate-800 dark:text-slate-200">{dom.label}</span>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-md ${dom.badgeColor}`}>
                {dom.level.toUpperCase()}
              </span>
              <span className="text-[10px] text-slate-400 truncate max-w-[70px]">
                {dom.hasConnectedDevice ? 'Live' : dom.statusText}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
