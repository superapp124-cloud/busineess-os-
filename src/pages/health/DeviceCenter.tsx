/**
 * CHATR HEALTH OS — DeviceCenter
 * ============================================================================
 * Universal Device Management & Sensor Control Center
 *
 * Structured around 6 Core Categories:
 *   1. Wearables (Apple Watch, Garmin, Fitbit, Samsung, WHOOP, Polar, Suunto)
 *   2. Rings (Oura, Samsung Galaxy Ring, Ultrahuman, RingConn)
 *   3. Medical (BP monitors, glucose meters, CGMs, pulse oximeters, thermometers)
 *   4. Body (Smart scales, body composition devices)
 *   5. Sleep (Dedicated sleep trackers, sleep rings, sleep mats)
 *   6. Fitness (Heart-rate straps, exercise equipment, cycling computers)
 *
 * Implements:
 *   - Connection Honesty badges (Direct BLE vs Companion Sync vs Cloud OAuth)
 *   - Per-device Privacy Controls (selective metric toggles)
 *   - Data Provenance & Last-Seen tracking
 *   - Complete Device Data Revocation (purges all historical vitals/events)
 *   - Resilient Sync status & error diagnostics
 * ============================================================================
 */

import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ArrowLeft, 
  Plus, 
  Watch, 
  CircleDot, 
  Heart, 
  Droplet, 
  Scale, 
  Activity, 
  Battery, 
  RefreshCw, 
  Trash2, 
  CheckCircle2, 
  AlertCircle,
  Radio,
  Moon,
  Flame,
  Settings2,
  Shield,
  ShieldCheck,
  Check,
  X
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { toast } from 'sonner';
import { SEOHead } from '@/components/SEOHead';
import { 
  DEVICE_REGISTRY, 
  getDevicesByPrimaryCategory, 
  getDeviceById 
} from '@/services/health/devices/DeviceRegistry';
import { 
  ConnectedDevice, 
  DeviceCoverageSummary, 
  DeviceMetadata, 
  PrimaryDeviceCategory,
  CanonicalHealthMetric 
} from '@/services/health/devices/DeviceTypes';
import { deviceSyncManager } from '@/services/health/devices/DeviceSyncManager';
import { DeviceConnectionWizard } from '@/components/health/devices/DeviceConnectionWizard';

export default function DeviceCenter() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const initialCategoryParam = searchParams.get('category') as PrimaryDeviceCategory | null;

  const [activeTab, setActiveTab] = useState<PrimaryDeviceCategory | 'all'>(
    initialCategoryParam && ['wearables', 'rings', 'medical', 'body', 'sleep', 'fitness'].includes(initialCategoryParam)
      ? initialCategoryParam
      : 'all'
  );

  const [connectedDevices, setConnectedDevices] = useState<ConnectedDevice[]>([]);
  const [coverage, setCoverage] = useState<DeviceCoverageSummary>(deviceSyncManager.getCoverageSummary());
  const [wizardOpen, setWizardOpen] = useState(false);
  const [selectedDeviceForWizard, setSelectedDeviceForWizard] = useState<DeviceMetadata | null>(null);
  const [isSyncing, setIsSyncing] = useState(false);

  // Per-Device Privacy / Settings Dialog State
  const [settingsDevice, setSettingsDevice] = useState<ConnectedDevice | null>(null);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [revokeConfirmOpen, setRevokeConfirmOpen] = useState(false);

  useEffect(() => {
    loadDevices();
    const unsubscribe = deviceSyncManager.subscribe(() => {
      loadDevices();
    });
    return unsubscribe;
  }, []);

  const loadDevices = () => {
    setConnectedDevices(deviceSyncManager.getConnectedDevices());
    setCoverage(deviceSyncManager.getCoverageSummary());
  };

  const handleSyncAll = async () => {
    if (connectedDevices.length === 0) {
      toast.info('No devices connected yet. Pair a device below to start syncing.');
      return;
    }
    setIsSyncing(true);
    try {
      const res = await deviceSyncManager.syncAllDevices();
      toast.success(`Synced ${res.syncedCount} devices (${res.samplesIngested} biometrics updated)`);
    } catch (e) {
      toast.error('Sync failed: ' + String(e));
    } finally {
      setIsSyncing(false);
    }
  };

  const handleDisconnect = (deviceId: string, deviceName: string) => {
    deviceSyncManager.disconnectDevice(deviceId);
    toast.info(`${deviceName} disconnected.`);
    loadDevices();
  };

  const handleOpenConnect = (device?: DeviceMetadata) => {
    setSelectedDeviceForWizard(device || null);
    setWizardOpen(true);
  };

  const handleOpenSettings = (dev: ConnectedDevice) => {
    setSettingsDevice(dev);
    setSettingsOpen(true);
  };

  const handleToggleAutoSync = (enabled: boolean) => {
    if (!settingsDevice) return;
    deviceSyncManager.toggleDeviceAutoSync(settingsDevice.id, enabled);
    setSettingsDevice({ ...settingsDevice, autoSyncEnabled: enabled });
    loadDevices();
  };

  const handleToggleMetric = (metric: CanonicalHealthMetric) => {
    if (!settingsDevice) return;
    const current = settingsDevice.enabledMetrics || settingsDevice.capabilities;
    const exists = current.includes(metric);
    const updated = exists ? current.filter(m => m !== metric) : [...current, metric];
    
    deviceSyncManager.setDeviceMetricPermissions(settingsDevice.id, updated);
    setSettingsDevice({ ...settingsDevice, enabledMetrics: updated });
    loadDevices();
  };

  const handleRevokeData = async () => {
    if (!settingsDevice) return;
    const devName = settingsDevice.name;
    const devId = settingsDevice.id;

    try {
      const result = await deviceSyncManager.revokeDeviceData(devId);
      toast.success(`Purged ${result.purgedVitals} vitals and ${result.purgedEvents} events collected by ${devName}.`);
      setRevokeConfirmOpen(false);
      setSettingsOpen(false);
      loadDevices();
    } catch (err) {
      toast.error('Failed to revoke device data: ' + String(err));
    }
  };

  const filteredCatalog = getDevicesByPrimaryCategory(activeTab);

  const coverageItems = [
    { id: 'heart', label: 'Heart & HRV', active: coverage.heartRate, icon: Heart, color: 'text-rose-500', bg: 'bg-rose-50 dark:bg-rose-950/30' },
    { id: 'sleep', label: 'Sleep Stages', active: coverage.sleep, icon: Moon, color: 'text-indigo-500', bg: 'bg-indigo-50 dark:bg-indigo-950/30' },
    { id: 'bp', label: 'Blood Pressure', active: coverage.bloodPressure, icon: Activity, color: 'text-red-500', bg: 'bg-red-50 dark:bg-red-950/30' },
    { id: 'glucose', label: 'Glucose (CGM)', active: coverage.glucose, icon: Droplet, color: 'text-amber-500', bg: 'bg-amber-50 dark:bg-amber-950/30' },
    { id: 'oxygen', label: 'SpO2 Oxygen', active: coverage.oxygen, icon: Activity, color: 'text-teal-500', bg: 'bg-teal-50 dark:bg-teal-950/30' },
    { id: 'activity', label: 'Daily Steps', active: coverage.activity, icon: Flame, color: 'text-orange-500', bg: 'bg-orange-50 dark:bg-orange-950/30' },
  ];

  const primaryCategoryTabs: Array<{ id: PrimaryDeviceCategory | 'all'; label: string }> = [
    { id: 'all', label: 'All' },
    { id: 'wearables', label: 'Wearables' },
    { id: 'rings', label: 'Rings' },
    { id: 'medical', label: 'Medical' },
    { id: 'body', label: 'Body' },
    { id: 'sleep', label: 'Sleep' },
    { id: 'fitness', label: 'Fitness' },
  ];

  return (
    <>
      <SEOHead
        title="Universal Health Devices & Sensors | CHATR Health OS"
        description="Connect your smartwatch, smart ring, blood pressure monitor, and glucose sensors into one unified personal health operating system."
      />

      <div className="min-h-screen bg-background pb-20">
        {/* Sticky Header */}
        <div className="sticky top-0 z-40 bg-background/95 backdrop-blur-xl border-b border-border">
          <div className="px-4 py-3 max-w-lg mx-auto flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => navigate('/health')}
                className="h-9 w-9 rounded-xl"
              >
                <ArrowLeft className="h-5 w-5" />
              </Button>
              <div>
                <h1 className="text-base font-bold text-foreground leading-tight">Devices & Sensors</h1>
                <p className="text-[11px] text-muted-foreground">Universal Health Data Layer</p>
              </div>
            </div>

            <Button
              size="sm"
              variant="outline"
              onClick={handleSyncAll}
              disabled={isSyncing}
              className="h-8 gap-1.5 text-xs font-semibold rounded-xl"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin text-primary' : ''}`} />
              <span>{isSyncing ? 'Syncing...' : 'Sync All'}</span>
            </Button>
          </div>
        </div>

        {/* Content Container */}
        <div className="px-4 py-4 max-w-lg mx-auto space-y-6">

          {/* ── BIOMETRIC COVERAGE MATRIX ─────────────────────────────────── */}
          <div className="space-y-2.5">
            <div className="flex items-center justify-between px-1">
              <div>
                <h2 className="text-sm font-bold text-foreground">BIOMETRIC DATA COVERAGE</h2>
                <p className="text-[11px] text-muted-foreground">Active sensor streams feeding your baseline</p>
              </div>
              <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-primary/10 text-primary">
                {Object.values(coverage).filter(Boolean).length - 1} / 6 active
              </span>
            </div>

            <div className="grid grid-cols-3 gap-2">
              {coverageItems.map(item => (
                <div
                  key={item.id}
                  className={`p-2.5 rounded-xl border transition-all ${
                    item.active 
                      ? `${item.bg} border-primary/30 shadow-sm` 
                      : 'bg-muted/40 border-border/60 opacity-60'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <item.icon className={`w-4 h-4 ${item.color}`} />
                    {item.active ? (
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    ) : (
                      <span className="w-2 h-2 rounded-full bg-muted-foreground/30" />
                    )}
                  </div>
                  <p className="text-xs font-semibold text-foreground truncate">{item.label}</p>
                  <p className="text-[10px] text-muted-foreground">
                    {item.active ? 'Streaming' : 'Unlinked'}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* ── CONNECTED DEVICES SECTION ─────────────────────────────────── */}
          <div className="space-y-3">
            <div className="flex items-center justify-between px-1">
              <h2 className="text-sm font-bold text-foreground">CONNECTED SOURCES ({connectedDevices.length})</h2>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleOpenConnect()}
                className="text-primary text-xs h-7 gap-1 font-semibold"
              >
                <Plus className="w-3.5 h-3.5" />
                Add Source
              </Button>
            </div>

            {connectedDevices.length === 0 ? (
              <div className="p-6 rounded-2xl border border-dashed border-border text-center space-y-3 bg-muted/20">
                <div className="w-12 h-12 rounded-full bg-primary/10 text-primary flex items-center justify-center mx-auto">
                  <Radio className="w-6 h-6 animate-pulse" />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-foreground">No Devices Connected</h3>
                  <p className="text-xs text-muted-foreground max-w-xs mx-auto mt-0.5">
                    Connect watches, smart rings, blood pressure cuffs, or glucose monitors to build your continuous personal health baseline.
                  </p>
                </div>
                <Button 
                  size="sm" 
                  onClick={() => handleOpenConnect()} 
                  className="font-semibold rounded-xl text-xs gap-1.5"
                >
                  <Plus className="w-3.5 h-3.5" />
                  Connect First Device
                </Button>
              </div>
            ) : (
              <div className="space-y-2.5">
                {connectedDevices.map(dev => (
                  <motion.div
                    key={dev.id}
                    layout
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-3.5 rounded-2xl bg-card border border-border shadow-sm flex flex-col gap-2.5"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
                          {dev.category.includes('ring') && <CircleDot className="w-5 h-5" />}
                          {dev.category.includes('blood_pressure') && <Heart className="w-5 h-5" />}
                          {dev.category.includes('glucose') && <Droplet className="w-5 h-5" />}
                          {dev.category.includes('scale') && <Scale className="w-5 h-5" />}
                          {dev.category.includes('sleep') && <Moon className="w-5 h-5" />}
                          {(!dev.category.includes('ring') && !dev.category.includes('blood_pressure') && !dev.category.includes('glucose') && !dev.category.includes('scale') && !dev.category.includes('sleep')) && <Watch className="w-5 h-5" />}
                        </div>
                        <div>
                          <div className="flex items-center gap-1.5">
                            <h4 className="font-bold text-sm text-foreground leading-tight">{dev.name}</h4>
                            <span className="w-2 h-2 rounded-full bg-emerald-500" />
                          </div>
                          <p className="text-[11px] text-muted-foreground mt-0.5">
                            {dev.manufacturer} • {dev.channel.replace('_', ' ')}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5">
                        {dev.batteryLevel !== undefined && (
                          <div className="flex items-center gap-1 text-[11px] font-medium text-muted-foreground bg-muted/60 px-2 py-0.5 rounded-full">
                            <Battery className="w-3.5 h-3.5 text-emerald-600" />
                            <span>{dev.batteryLevel}%</span>
                          </div>
                        )}
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleOpenSettings(dev)}
                          className="h-8 w-8 text-muted-foreground hover:text-foreground rounded-lg"
                          title="Privacy & metric settings"
                        >
                          <Settings2 className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDisconnect(dev.id, dev.name)}
                          className="h-8 w-8 text-muted-foreground hover:text-destructive rounded-lg"
                          title="Disconnect device"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-1 border-t border-border/50 text-[11px]">
                      <span className="text-muted-foreground">
                        Last sync: {dev.lastSyncAt ? new Date(dev.lastSyncAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Just now'}
                      </span>
                      <div className="flex gap-1">
                        {dev.capabilities.slice(0, 3).map(cap => (
                          <Badge key={cap} variant="secondary" className="text-[9px] py-0 px-1.5 h-4">
                            {cap.replace(/_/g, ' ')}
                          </Badge>
                        ))}
                        {dev.capabilities.length > 3 && (
                          <Badge variant="outline" className="text-[9px] py-0 px-1.5 h-4">
                            +{dev.capabilities.length - 3}
                          </Badge>
                        )}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </div>

          {/* ── DEVICE ECOSYSTEM CATALOGUE ─────────────────────────────────── */}
          <div className="space-y-3 pt-2">
            <div>
              <h2 className="text-sm font-bold text-foreground">SUPPORTED HARDWARE & SENSORS</h2>
              <p className="text-[11px] text-muted-foreground">Direct Bluetooth LE GATT, Android Health Connect, and Cloud APIs</p>
            </div>

            {/* Category Filter Tabs */}
            <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-none">
              {primaryCategoryTabs.map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                    activeTab === tab.id
                      ? 'bg-primary text-primary-foreground shadow-sm'
                      : 'bg-muted/60 text-muted-foreground hover:bg-muted'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Device Cards with Connection Honesty */}
            <div className="grid grid-cols-1 gap-2.5">
              {filteredCatalog.map(device => {
                const isConnected = connectedDevices.some(d => d.registryId === device.id);
                const honesty = device.connectionHonesty;

                return (
                  <div
                    key={device.id}
                    className="p-3.5 rounded-2xl bg-card border border-border/80 hover:border-primary/40 transition-all flex flex-col gap-2.5"
                  >
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center flex-shrink-0">
                          {device.primaryCategory === 'rings' && <CircleDot className="w-5 h-5" />}
                          {device.primaryCategory === 'medical' && <Heart className="w-5 h-5" />}
                          {device.primaryCategory === 'body' && <Scale className="w-5 h-5" />}
                          {device.primaryCategory === 'sleep' && <Moon className="w-5 h-5" />}
                          {device.primaryCategory === 'fitness' && <Flame className="w-5 h-5" />}
                          {device.primaryCategory === 'wearables' && <Watch className="w-5 h-5" />}
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <h4 className="font-bold text-sm text-foreground truncate">{device.name}</h4>
                            {honesty?.tier === 'direct_live' && (
                              <Badge className="bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border-emerald-300/40 text-[9px] py-0 px-1.5 h-4">
                                Direct BLE Live
                              </Badge>
                            )}
                            {honesty?.tier === 'companion_app_sync' && (
                              <Badge variant="outline" className="text-[9px] py-0 px-1.5 h-4 text-sky-600 border-sky-300">
                                Companion Sync
                              </Badge>
                            )}
                            {honesty?.tier === 'cloud_oauth' && (
                              <Badge variant="outline" className="text-[9px] py-0 px-1.5 h-4 text-purple-600 border-purple-300">
                                Cloud API
                              </Badge>
                            )}
                          </div>
                          <p className="text-[11px] text-muted-foreground mt-0.5 line-clamp-1">
                            {honesty?.summary || device.description}
                          </p>
                        </div>
                      </div>

                      <div className="flex-shrink-0">
                        {isConnected ? (
                          <div className="flex items-center gap-1 text-emerald-600 font-semibold text-xs px-2.5 py-1 rounded-lg bg-emerald-500/10">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>Linked</span>
                          </div>
                        ) : (
                          <Button
                            size="sm"
                            onClick={() => handleOpenConnect(device)}
                            className="h-8 rounded-xl font-semibold text-xs px-3"
                          >
                            Connect
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

        </div>

        {/* Wizard Modal */}
        <DeviceConnectionWizard
          open={wizardOpen}
          onOpenChange={setWizardOpen}
          initialDevice={selectedDeviceForWizard}
          onDeviceConnected={loadDevices}
        />

        {/* Device Settings & Privacy Drawer / Dialog */}
        {settingsDevice && (
          <Dialog open={settingsOpen} onOpenChange={setSettingsOpen}>
            <DialogContent className="max-w-md rounded-2xl">
              <DialogHeader>
                <DialogTitle className="text-base font-bold flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-primary" />
                  {settingsDevice.name} Settings
                </DialogTitle>
                <DialogDescription className="text-xs">
                  Manage metric ingestion, privacy controls, and data permissions.
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-4 py-2">
                {/* Auto Sync Toggle */}
                <div className="flex items-center justify-between p-3 rounded-xl bg-muted/30 border border-border">
                  <div>
                    <p className="text-xs font-semibold text-foreground">Automatic Background Sync</p>
                    <p className="text-[11px] text-muted-foreground">Keep biometrics synchronized in the background</p>
                  </div>
                  <Switch
                    checked={settingsDevice.autoSyncEnabled}
                    onCheckedChange={handleToggleAutoSync}
                  />
                </div>

                {/* Granular Metric Permissions */}
                <div className="space-y-2">
                  <p className="text-xs font-bold text-foreground">Permitted Biometrics</p>
                  <p className="text-[11px] text-muted-foreground">Choose which metrics CHATR is allowed to ingest from this device:</p>
                  
                  <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
                    {settingsDevice.capabilities.map(metric => {
                      const enabledList = settingsDevice.enabledMetrics || settingsDevice.capabilities;
                      const isEnabled = enabledList.includes(metric);

                      return (
                        <div 
                          key={metric}
                          onClick={() => handleToggleMetric(metric)}
                          className="flex items-center justify-between p-2 rounded-lg bg-card border border-border/70 cursor-pointer hover:border-primary/50 text-xs"
                        >
                          <span className="font-medium text-foreground capitalize">
                            {metric.replace(/_/g, ' ')}
                          </span>
                          <div className={`w-4 h-4 rounded border flex items-center justify-center ${isEnabled ? 'bg-primary border-primary text-primary-foreground' : 'border-muted-foreground/40'}`}>
                            {isEnabled && <Check className="w-3 h-3" />}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Revoke & Purge Section */}
                <div className="p-3 rounded-xl border border-destructive/30 bg-destructive/5 space-y-2">
                  <div className="flex items-center gap-2 text-destructive">
                    <Shield className="w-4 h-4" />
                    <span className="text-xs font-bold">Data Privacy & Right to Deletion</span>
                  </div>
                  <p className="text-[11px] text-muted-foreground">
                    Permanently purge all vitals, baseline observations, and events collected from this device.
                  </p>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => setRevokeConfirmOpen(true)}
                    className="w-full text-xs font-semibold rounded-xl h-8 gap-1.5"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    Revoke & Delete Device History
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        )}

        {/* Confirmation Modal for Data Revocation */}
        <Dialog open={revokeConfirmOpen} onOpenChange={setRevokeConfirmOpen}>
          <DialogContent className="max-w-sm rounded-2xl">
            <DialogHeader>
              <DialogTitle className="text-sm font-bold text-destructive flex items-center gap-1.5">
                <AlertCircle className="w-4 h-4" />
                Confirm Data Purge
              </DialogTitle>
              <DialogDescription className="text-xs">
                This will irreversibly delete all health readings associated with <strong>{settingsDevice?.name}</strong> from your local device storage and personal health timeline.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter className="flex gap-2">
              <Button variant="outline" size="sm" onClick={() => setRevokeConfirmOpen(false)}>
                Cancel
              </Button>
              <Button variant="destructive" size="sm" onClick={handleRevokeData}>
                Confirm Purge
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </>
  );
}
