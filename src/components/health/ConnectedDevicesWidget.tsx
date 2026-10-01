import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Watch, 
  CircleDot, 
  Heart, 
  Droplet, 
  Plus, 
  ChevronRight, 
  Radio, 
  Activity, 
  Scale, 
  Battery 
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { deviceSyncManager } from '@/services/health/devices/DeviceSyncManager';
import { ConnectedDevice } from '@/services/health/devices/DeviceTypes';

interface ConnectedDevicesWidgetProps {
  onAddDevice?: () => void;
  onManage?: () => void;
}

export function ConnectedDevicesWidget({ onAddDevice, onManage }: ConnectedDevicesWidgetProps = {}) {
  const navigate = useNavigate();
  const [devices, setDevices] = useState<ConnectedDevice[]>([]);

  useEffect(() => {
    setDevices(deviceSyncManager.getConnectedDevices());
    const unsub = deviceSyncManager.subscribe(() => {
      setDevices(deviceSyncManager.getConnectedDevices());
    });
    return unsub;
  }, []);

  const handleOpenAdd = () => {
    if (onAddDevice) {
      onAddDevice();
    } else {
      navigate('/health/devices');
    }
  };

  const handleOpenManage = () => {
    if (onManage) {
      onManage();
    } else {
      navigate('/health/devices');
    }
  };

  return (
    <div className="space-y-2.5">
      <div className="flex items-center justify-between px-1">
        <div className="flex items-center gap-2">
          <Radio className="w-4 h-4 text-primary" />
          <h3 className="text-sm font-semibold text-foreground">DEVICES & SENSORS</h3>
        </div>
        <button
          onClick={handleOpenManage}
          className="text-xs text-primary font-medium flex items-center gap-0.5 hover:underline"
        >
          <span>Manage</span>
          <ChevronRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {devices.length === 0 ? (
        <motion.div
          whileTap={{ scale: 0.99 }}
          onClick={handleOpenAdd}
          className="p-4 rounded-2xl bg-gradient-to-r from-primary/5 via-primary/10 to-teal-500/10 border border-primary/20 cursor-pointer flex items-center justify-between gap-3 shadow-sm hover:border-primary/40 transition-all"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary/15 text-primary flex items-center justify-center flex-shrink-0">
              <Plus className="w-5 h-5 stroke-[2.5]" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-foreground">Connect Health Devices</h4>
              <p className="text-xs text-muted-foreground">Watches, rings, BP machines, CGMs & scales</p>
            </div>
          </div>
          <ChevronRight className="w-5 h-5 text-primary opacity-80" />
        </motion.div>
      ) : (
        <div className="flex gap-2.5 overflow-x-auto pb-1 scrollbar-none">
          {devices.map(dev => (
            <motion.div
              key={dev.id}
              whileTap={{ scale: 0.98 }}
              onClick={() => navigate('/health/devices')}
              className="p-3 rounded-2xl bg-card border border-border min-w-[200px] max-w-[240px] flex-shrink-0 shadow-sm flex flex-col justify-between gap-2 cursor-pointer hover:border-primary/40 transition-all"
            >
              <div className="flex items-center justify-between">
                <div className="w-8 h-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
                  {dev.category === 'smartwatch' && <Watch className="w-4 h-4" />}
                  {dev.category === 'smart_ring' && <CircleDot className="w-4 h-4" />}
                  {dev.category === 'blood_pressure_monitor' && <Heart className="w-4 h-4" />}
                  {dev.category === 'continuous_glucose_monitor' && <Droplet className="w-4 h-4" />}
                  {dev.category === 'smart_scale' && <Scale className="w-4 h-4" />}
                  {dev.category === 'fitness_band' && <Activity className="w-4 h-4" />}
                  {dev.category === 'pulse_oximeter' && <Activity className="w-4 h-4" />}
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  {dev.batteryLevel !== undefined && (
                    <span className="text-[10px] text-muted-foreground font-medium">
                      {dev.batteryLevel}%
                    </span>
                  )}
                </div>
              </div>

              <div>
                <h5 className="font-bold text-xs text-foreground truncate">{dev.name}</h5>
                <p className="text-[10px] text-muted-foreground truncate">{dev.manufacturer}</p>
              </div>

              <div className="text-[10px] text-primary font-medium flex items-center gap-1">
                <span>Active Stream</span>
                <ChevronRight className="w-3 h-3 ml-auto" />
              </div>
            </motion.div>
          ))}

          {/* Quick Add Card */}
          <motion.div
            whileTap={{ scale: 0.98 }}
            onClick={handleOpenAdd}
            className="p-3 rounded-2xl border border-dashed border-border/80 hover:border-primary/40 min-w-[130px] flex-shrink-0 flex flex-col items-center justify-center text-center gap-1.5 cursor-pointer bg-muted/20"
          >
            <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center">
              <Plus className="w-4 h-4" />
            </div>
            <span className="text-xs font-semibold text-foreground">Add Sensor</span>
          </motion.div>
        </div>
      )}
    </div>
  );
}
