/**
 * CHATR HEALTH OS — ConnectedSourcesSummary
 * ============================================================================
 * "CONNECTED" — Compact, elegant hardware & aggregator summary.
 *
 * Replaces large device carousels above the fold.
 * Shows connected sources cleanly:
 *   ● Apple Watch   ● Oura Ring   + 2 more    View all →
 * ============================================================================
 */

import React from 'react';
import { motion } from 'framer-motion';
import { 
  Radio, 
  Watch, 
  CircleDot, 
  Heart, 
  Activity, 
  ChevronRight, 
  Plus 
} from 'lucide-react';
import { ConnectedDevice } from '@/services/health/devices/DeviceTypes';

interface ConnectedSourcesSummaryProps {
  devices: ConnectedDevice[];
  onOpenDevices: () => void;
  onAddDevice: () => void;
}

export function ConnectedSourcesSummary({
  devices = [],
  onOpenDevices,
  onAddDevice,
}: ConnectedSourcesSummaryProps) {
  const getDeviceIcon = (category: string) => {
    switch (category) {
      case 'smartwatch':
        return Watch;
      case 'smart_ring':
        return CircleDot;
      case 'blood_pressure_monitor':
        return Heart;
      default:
        return Activity;
    }
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between px-1">
        <h3 className="text-xs font-bold tracking-wider uppercase text-muted-foreground">
          CONNECTED SOURCES
        </h3>
        <button
          type="button"
          onClick={onOpenDevices}
          className="text-xs text-primary font-medium hover:underline flex items-center gap-0.5"
        >
          <span>View all</span>
          <ChevronRight className="w-3.5 h-3.5" />
        </button>
      </div>

      <motion.div
        whileTap={{ scale: 0.99 }}
        onClick={onOpenDevices}
        className="p-3.5 rounded-2xl bg-card border border-border/70 shadow-sm cursor-pointer hover:border-primary/40 transition-colors flex items-center justify-between gap-3"
      >
        {devices.length === 0 ? (
          <div className="flex items-center justify-between w-full">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-muted/70 text-muted-foreground flex items-center justify-center">
                <Radio className="w-4 h-4" />
              </div>
              <div>
                <p className="text-xs font-semibold text-foreground">No sensors linked</p>
                <p className="text-[11px] text-muted-foreground">Link a watch, ring, or BP machine</p>
              </div>
            </div>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onAddDevice();
              }}
              className="inline-flex items-center gap-1 text-xs font-semibold text-primary bg-primary/10 hover:bg-primary/15 px-2.5 py-1.5 rounded-xl transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Link</span>
            </button>
          </div>
        ) : (
          <div className="flex items-center justify-between w-full">
            <div className="flex items-center gap-2 overflow-x-auto scrollbar-none py-0.5 pr-2">
              {devices.slice(0, 3).map((dev) => {
                const Icon = getDeviceIcon(dev.category);
                return (
                  <div
                    key={dev.id}
                    className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-muted/60 border border-border/50 text-xs font-medium text-foreground whitespace-nowrap"
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    <Icon className="w-3.5 h-3.5 text-muted-foreground" />
                    <span className="truncate max-w-[110px]">{dev.name.replace(/ \(.*\)/, '')}</span>
                  </div>
                );
              })}

              {devices.length > 3 && (
                <span className="text-[11px] font-semibold text-muted-foreground bg-muted/50 px-2 py-1 rounded-xl border border-border/40 whitespace-nowrap">
                  +{devices.length - 3} more
                </span>
              )}
            </div>

            <ChevronRight className="w-4 h-4 text-muted-foreground/60 flex-shrink-0 ml-2" />
          </div>
        )}
      </motion.div>
    </div>
  );
}
