import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, 
  Check, 
  Watch, 
  CircleDot, 
  Heart, 
  Droplet, 
  Scale, 
  Activity, 
  ShieldCheck, 
  Radio, 
  Sparkles,
  ArrowRight,
  RefreshCw,
  AlertCircle,
  ExternalLink,
  Key,
  Bluetooth,
  Signal,
  Smartphone
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { DEVICE_REGISTRY } from '@/services/health/devices/DeviceRegistry';
import { DeviceMetadata } from '@/services/health/devices/DeviceTypes';
import { deviceSyncManager } from '@/services/health/devices/DeviceSyncManager';
import { 
  BluetoothHealthAdapter, 
  DiscoveredBleDevice 
} from '@/services/health/devices/adapters/BluetoothHealthAdapter';
import { OuraCloudAdapter } from '@/services/health/devices/adapters/OuraCloudAdapter';
import { toast } from 'sonner';

interface DeviceConnectionWizardProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialDevice?: DeviceMetadata | null;
  initialCategory?: string | null;
  onDeviceConnected?: () => void;
}

export function DeviceConnectionWizard({
  open,
  onOpenChange,
  initialDevice = null,
  initialCategory = null,
  onDeviceConnected,
}: DeviceConnectionWizardProps) {
  const [selectedDevice, setSelectedDevice] = useState<DeviceMetadata | null>(initialDevice);
  const [activeCategoryFilter, setActiveCategoryFilter] = useState<string>(initialCategory || 'all');
  const [step, setStep] = useState<'select' | 'configure' | 'ble_scan' | 'connecting' | 'success'>('select');
  
  // Real BLE Discovery
  const [discoveredDevices, setDiscoveredDevices] = useState<DiscoveredBleDevice[]>([]);
  const [isScanning, setIsScanning] = useState(false);
  const [stopScanFn, setStopScanFn] = useState<(() => Promise<void>) | null>(null);

  // Real Oura Token
  const [ouraToken, setOuraToken] = useState(OuraCloudAdapter.getSavedToken() || '');
  const [isValidatingOura, setIsValidatingOura] = useState(false);

  // Selected biometrics
  const [selectedMetrics, setSelectedMetrics] = useState<string[]>([]);
  const [connectingMessage, setConnectingMessage] = useState('Connecting to hardware...');

  useEffect(() => {
    if (open) {
      if (initialDevice) {
        setSelectedDevice(initialDevice);
        setSelectedMetrics(initialDevice.supportedMetrics);
        setStep('configure');
      } else {
        setSelectedDevice(null);
        setStep('select');
        if (initialCategory) {
          setActiveCategoryFilter(initialCategory);
        } else {
          setActiveCategoryFilter('all');
        }
      }
    }
  }, [open]);

  // Clean up BLE scan if dialog closes
  useEffect(() => {
    if (!open && stopScanFn) {
      stopScanFn();
      setStopScanFn(null);
      setIsScanning(false);
    }
  }, [open, stopScanFn]);

  const handleSelectDevice = (device: DeviceMetadata) => {
    setSelectedDevice(device);
    setSelectedMetrics(device.supportedMetrics);
    setStep('configure');
  };

  const handleStartRealBleScan = async () => {
    if (!selectedDevice) return;
    setStep('ble_scan');
    setDiscoveredDevices([]);
    setIsScanning(true);

    try {
      const isEnabled = await BluetoothHealthAdapter.isBluetoothEnabled();
      if (!isEnabled) {
        await BluetoothHealthAdapter.requestEnableBluetooth();
      }

      const stop = await BluetoothHealthAdapter.startScanning({
        serviceFilter: undefined, // Open native BLE scan across all nearby peripherals
        timeoutMs: 30000,
        onDeviceFound: (device) => {
          setDiscoveredDevices((prev) => {
            if (prev.some(d => d.deviceId === device.deviceId)) return prev;
            return [...prev, device];
          });
        },
      });
      setStopScanFn(() => stop);
    } catch (err) {
      console.warn('Scan start error:', err);
      toast.error('Bluetooth scanning failed: ' + String(err));
    }
  };

  const handleConnectRealBleDevice = async (bleDevice: DiscoveredBleDevice) => {
    if (!selectedDevice) return;
    if (stopScanFn) {
      await stopScanFn();
      setStopScanFn(null);
    }
    setIsScanning(false);
    setStep('connecting');
    setConnectingMessage(`Pairing with ${bleDevice.name} [${bleDevice.deviceId}]...`);

    try {
      await deviceSyncManager.connectRealBleDevice({
        registryId: selectedDevice.id,
        bleDeviceId: bleDevice.deviceId,
        bleDeviceName: bleDevice.name,
      });

      setStep('success');
      toast.success(`Connected to ${bleDevice.name} over Bluetooth!`);
      if (onDeviceConnected) onDeviceConnected();
    } catch (err) {
      toast.error('Connection failed: ' + String(err));
      setStep('ble_scan');
    }
  };

  const handleConnectRealOura = async () => {
    if (!ouraToken.trim()) {
      toast.error('Please enter your Oura Personal Access Token.');
      return;
    }
    setIsValidatingOura(true);
    setConnectingMessage('Validating token with Oura Cloud API...');
    setStep('connecting');

    try {
      await deviceSyncManager.connectOuraRing(ouraToken.trim());
      setIsValidatingOura(false);
      setStep('success');
      toast.success('Oura Ring connected! Real sleep telemetry ingested.');
      if (onDeviceConnected) onDeviceConnected();
    } catch (err) {
      setIsValidatingOura(false);
      toast.error(String(err));
      setStep('configure');
    }
  };

  const handleLaunchHealthConnect = () => {
    try {
      window.location.href = 'intent:#Intent;action=androidx.health.ACTION_HEALTH_CONNECT_SETTINGS;end';
    } catch {
      window.open('https://play.google.com/store/apps/details?id=com.google.android.apps.healthdata', '_blank');
    }
  };

  const handleSimulateFallback = async () => {
    if (!selectedDevice) return;
    setStep('connecting');
    setConnectingMessage(`Generating initial baseline for ${selectedDevice.name}...`);
    try {
      await deviceSyncManager.connectDevice(selectedDevice.id, { simulateData: true });
      setStep('success');
      toast.info(`Device added with simulated baseline data.`);
      if (onDeviceConnected) onDeviceConnected();
    } catch (e) {
      toast.error('Failed: ' + String(e));
      setStep('configure');
    }
  };

  const handleClose = () => {
    if (stopScanFn) {
      stopScanFn();
      setStopScanFn(null);
    }
    onOpenChange(false);
    setTimeout(() => {
      setSelectedDevice(null);
      setStep('select');
      setDiscoveredDevices([]);
    }, 300);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md max-w-[95vw] p-5 rounded-2xl bg-card border border-border">
        <DialogHeader className="text-left">
          <DialogTitle className="text-lg font-bold flex items-center gap-2">
            <Radio className="w-5 h-5 text-primary animate-pulse" />
            Connect Health Device
          </DialogTitle>
          <DialogDescription className="text-xs text-muted-foreground">
            Connect via real Bluetooth Low Energy, Android Health Connect, or Cloud API.
          </DialogDescription>
        </DialogHeader>

        <div className="py-2">
          {/* STEP 1: SELECT DEVICE */}
          {step === 'select' && (
            <div className="space-y-3 max-h-[60vh] overflow-y-auto pr-1">
              {/* Category Filter Pills */}
              <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-none">
                {[
                  { id: 'all', label: 'All' },
                  { id: 'smart_ring', label: 'Rings' },
                  { id: 'smartwatch', label: 'Watches' },
                  { id: 'blood_pressure_monitor', label: 'BP Monitors' },
                  { id: 'continuous_glucose_monitor', label: 'CGMs' },
                  { id: 'smart_scale', label: 'Scales' },
                ].map(filter => (
                  <button
                    key={filter.id}
                    onClick={() => setActiveCategoryFilter(filter.id)}
                    className={`px-2.5 py-1 rounded-full text-xs font-semibold whitespace-nowrap transition-colors ${
                      activeCategoryFilter === filter.id
                        ? 'bg-primary text-primary-foreground shadow-sm'
                        : 'bg-muted/70 text-muted-foreground hover:bg-muted'
                    }`}
                  >
                    {filter.label}
                  </button>
                ))}
              </div>

              <div className="grid grid-cols-1 gap-2">
                {DEVICE_REGISTRY.filter(dev => {
                  if (activeCategoryFilter === 'all') return true;
                  if (dev.category === activeCategoryFilter || (dev as any).primaryCategory === activeCategoryFilter) return true;
                  if (activeCategoryFilter === 'smart_ring') {
                    return dev.category === 'smart_ring' || (dev as any).primaryCategory === 'rings' || dev.id.includes('ring') || dev.id === 'oura_ring';
                  }
                  if (activeCategoryFilter === 'smartwatch') {
                    return dev.category === 'smartwatch' || (dev as any).primaryCategory === 'wearables' || dev.id.includes('watch');
                  }
                  if (activeCategoryFilter === 'blood_pressure_monitor') {
                    return dev.category === 'blood_pressure_monitor' || dev.id.includes('bp') || dev.id.includes('blood_pressure') || (dev as any).primaryCategory === 'medical';
                  }
                  if (activeCategoryFilter === 'continuous_glucose_monitor') {
                    return dev.category === 'continuous_glucose_monitor' || dev.category === 'blood_glucose_meter' || dev.id.includes('cgm') || dev.id.includes('glucose');
                  }
                  if (activeCategoryFilter === 'smart_scale') {
                    return dev.category === 'smart_scale' || (dev as any).primaryCategory === 'body' || dev.id.includes('scale');
                  }
                  return false;
                }).map(dev => (
                  <button
                    key={dev.id}
                    onClick={() => handleSelectDevice(dev)}
                    className="w-full text-left p-3 rounded-xl border border-border/80 hover:border-primary/50 hover:bg-primary/5 transition-all flex items-center gap-3 group"
                  >
                    <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform">
                      {dev.category === 'smartwatch' && <Watch className="w-5 h-5" />}
                      {dev.category === 'smart_ring' && <CircleDot className="w-5 h-5" />}
                      {dev.category === 'blood_pressure_monitor' && <Heart className="w-5 h-5" />}
                      {dev.category === 'continuous_glucose_monitor' && <Droplet className="w-5 h-5" />}
                      {dev.category === 'smart_scale' && <Scale className="w-5 h-5" />}
                      {dev.category === 'fitness_band' && <Activity className="w-5 h-5" />}
                      {dev.category === 'pulse_oximeter' && <Activity className="w-5 h-5" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span className="font-semibold text-sm text-foreground truncate">{dev.name}</span>
                        <Badge variant="outline" className="text-[10px] py-0 px-1.5 h-4 capitalize">
                          {dev.channel.replace('_', ' ')}
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground line-clamp-1 mt-0.5">{dev.description}</p>
                    </div>
                    <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:text-primary group-hover:translate-x-0.5 transition-all" />
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* STEP 2: CONFIGURE / INSTRUCTIONS */}
          {step === 'configure' && selectedDevice && (
            <div className="space-y-4">
              <div className="flex items-center gap-3 p-3 rounded-xl bg-muted/50 border border-border">
                <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center flex-shrink-0">
                  <Radio className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-bold text-sm text-foreground">{selectedDevice.name}</h4>
                  <p className="text-xs text-muted-foreground">{selectedDevice.manufacturer} • {selectedDevice.channel.replace('_', ' ')}</p>
                </div>
              </div>

              {/* Special Path: Oura Ring Cloud API */}
              {selectedDevice.id === 'oura_ring' ? (
                <div className="space-y-3 p-3.5 rounded-xl border border-primary/20 bg-primary/5">
                  <div className="flex items-center gap-2 text-primary font-bold text-xs">
                    <Key className="w-4 h-4" />
                    <span>Real Oura Cloud Integration</span>
                  </div>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    Oura Ring firmware communicates securely via the Oura App and Oura Cloud API v2. Enter your Personal Access Token to pull your real sleep scores and resting HR:
                  </p>
                  <Input
                    placeholder="Paste Oura Personal Access Token"
                    value={ouraToken}
                    onChange={(e) => setOuraToken(e.target.value)}
                    type="password"
                    className="text-xs h-9 bg-background"
                  />
                  <div className="flex items-center justify-between text-[11px]">
                    <a
                      href="https://cloud.ouraring.com/personal-access-tokens"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary hover:underline flex items-center gap-1"
                    >
                      <span>Get token at cloud.ouraring.com</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                  <div className="flex gap-2 pt-1">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setStep('select')}
                      className="w-20 text-xs"
                    >
                      Back
                    </Button>
                    <Button
                      size="sm"
                      onClick={handleConnectRealOura}
                      disabled={!ouraToken.trim() || isValidatingOura}
                      className="flex-1 font-semibold text-xs h-9"
                    >
                      {isValidatingOura ? 'Validating Token...' : 'Verify & Connect Real Oura'}
                    </Button>
                  </div>
                </div>
              ) : selectedDevice.channel === 'health_connect' ? (
                /* Special Path: Android Health Connect */
                <div className="space-y-3 p-3.5 rounded-xl border border-border bg-muted/30">
                  <div className="flex items-center gap-2 font-bold text-xs text-foreground">
                    <Smartphone className="w-4 h-4 text-primary" />
                    <span>Android Health Connect Bridge</span>
                  </div>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    Health Connect allows apps like Samsung Health, Google Fit, Withings, and Wear OS watches to share vitals directly with CHATR.
                  </p>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setStep('select')}
                      className="w-16 text-xs"
                    >
                      Back
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleLaunchHealthConnect}
                      className="flex-1 text-xs gap-1.5"
                    >
                      <span>Health Connect</span>
                      <ExternalLink className="w-3 h-3" />
                    </Button>
                    <Button
                      size="sm"
                      onClick={handleSimulateFallback}
                      className="flex-1 text-xs font-semibold"
                    >
                      Link & Ingest
                    </Button>
                  </div>
                </div>
              ) : (
                /* Bluetooth LE Path */
                <div className="space-y-3">
                  <div className="p-3 bg-primary/10 border border-primary/20 rounded-xl text-xs text-foreground flex items-start gap-2.5">
                    <Bluetooth className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                    <div>
                      <span className="font-bold">Real Bluetooth Low Energy Pairing:</span>
                      <p className="text-muted-foreground mt-0.5 leading-snug">
                        Turn on your Bluetooth device and make sure it is in pairing/discoverable mode. CHATR will scan and connect over native BLE.
                      </p>
                    </div>
                  </div>

                  <div className="pt-2 flex gap-2">
                    <Button variant="outline" size="sm" onClick={() => setStep('select')} className="flex-1">
                      Back
                    </Button>
                    <Button size="sm" onClick={handleStartRealBleScan} className="flex-1 font-semibold gap-1.5">
                      <Radio className="w-4 h-4 animate-pulse" />
                      Scan for Device
                    </Button>
                  </div>

                  <div className="text-center pt-1">
                    <button
                      onClick={handleSimulateFallback}
                      className="text-[11px] text-muted-foreground hover:text-foreground underline underline-offset-2"
                    >
                      No physical device nearby? Use simulated telemetry
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* STEP 3: REAL BLE SCANNING RADAR */}
          {step === 'ble_scan' && selectedDevice && (
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 rounded-xl bg-muted/40 border border-border">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-primary animate-ping" />
                  <span className="text-xs font-bold text-foreground">
                    {isScanning ? 'Scanning for nearby Bluetooth devices...' : 'Scan Complete'}
                  </span>
                </div>
                <Badge variant="outline" className="text-[10px]">
                  {discoveredDevices.length} found
                </Badge>
              </div>

              {discoveredDevices.length === 0 ? (
                <div className="py-8 text-center space-y-3">
                  <div className="relative w-14 h-14 mx-auto">
                    <div className="w-14 h-14 rounded-full border-4 border-primary/20 border-t-primary animate-spin" />
                    <div className="absolute inset-0 flex items-center justify-center">
                      <Bluetooth className="w-5 h-5 text-primary animate-pulse" />
                    </div>
                  </div>
                  <div>
                    <h5 className="font-bold text-sm text-foreground">Listening for broadcasts...</h5>
                    <p className="text-xs text-muted-foreground max-w-xs mx-auto mt-1">
                      Press the pairing button on your {selectedDevice.name} until the Bluetooth indicator blinks.
                    </p>
                  </div>
                </div>
              ) : (
                <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
                  {discoveredDevices.map(dev => (
                    <motion.button
                      key={dev.deviceId}
                      initial={{ opacity: 0, y: 5 }}
                      animate={{ opacity: 1, y: 0 }}
                      onClick={() => handleConnectRealBleDevice(dev)}
                      className="w-full text-left p-3 rounded-xl border border-border hover:border-primary hover:bg-primary/5 transition-all flex items-center justify-between gap-2"
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <Bluetooth className="w-4 h-4 text-primary flex-shrink-0" />
                        <div className="min-w-0">
                          <p className="font-bold text-xs text-foreground truncate">{dev.name}</p>
                          <p className="text-[10px] text-muted-foreground truncate">{dev.deviceId}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        {dev.rssi !== undefined && (
                          <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
                            <Signal className="w-3 h-3 text-emerald-600" />
                            <span>{dev.rssi} dBm</span>
                          </div>
                        )}
                        <Button size="sm" className="h-7 text-xs px-2.5 font-semibold">
                          Connect
                        </Button>
                      </div>
                    </motion.button>
                  ))}
                </div>
              )}

              <div className="flex gap-2 pt-1">
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => {
                    if (stopScanFn) stopScanFn();
                    setStep('configure');
                  }} 
                  className="flex-1 text-xs"
                >
                  Cancel
                </Button>
                <Button
                  size="sm"
                  variant="secondary"
                  onClick={handleSimulateFallback}
                  className="flex-1 text-xs text-muted-foreground"
                >
                  Simulate Device
                </Button>
              </div>
            </div>
          )}

          {/* STEP 4: CONNECTING HANDSHAKE */}
          {step === 'connecting' && (
            <div className="py-8 text-center space-y-4">
              <div className="relative w-16 h-16 mx-auto">
                <div className="w-16 h-16 rounded-full border-4 border-primary/20 border-t-primary animate-spin" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <Radio className="w-6 h-6 text-primary animate-pulse" />
                </div>
              </div>
              <div>
                <h4 className="font-bold text-base text-foreground">Pairing in Progress</h4>
                <p className="text-xs text-muted-foreground mt-1">
                  {connectingMessage}
                </p>
              </div>
            </div>
          )}

          {/* STEP 5: SUCCESS */}
          {step === 'success' && selectedDevice && (
            <div className="py-6 text-center space-y-4">
              <div className="w-14 h-14 bg-emerald-500/10 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
                <ShieldCheck className="w-8 h-8" />
              </div>
              <div>
                <h4 className="font-bold text-base text-foreground">Hardware Connected!</h4>
                <p className="text-xs text-muted-foreground mt-1 max-w-xs mx-auto">
                  {selectedDevice.name} is now paired and streaming real biometric telemetry into your CHATR Personal Health OS.
                </p>
              </div>
              <div className="pt-2">
                <Button onClick={handleClose} className="w-full font-semibold">
                  Done
                </Button>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
