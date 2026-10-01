/**
 * CHATR HEALTH OS — HealthHub
 * ============================================================================
 * Calm Personal Health Command Center
 *
 * Information Hierarchy:
 *   1. HEADER (Minimal: Back, Brand, Notifications, Settings)
 *   2. GREETING (GOOD AFTERNOON, ARSHID)
 *   3. HEALTH STATE (Primary Calm Health State Card)
 *   4. TODAY (2–3 Most Relevant Biometric Observations: BP, Sleep, Activity)
 *   5. TODAY'S FOCUS (Max 3 Actionable Items from AttentionEngine)
 *   6. CONNECTED SOURCES (Compact summary: ● Watch ● Ring + 2 more  View all →)
 *   7. OPTIONAL RECENT INSIGHT
 *   8. PROGRESSIVE DISCLOSURE (All Health Services preserved)
 *   9. BOTTOM NAVIGATION
 * ============================================================================
 */

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ArrowLeft,
  Bell,
  Settings,
  Mic,
  Sparkles,
  ChevronDown,
  ChevronUp,
  Stethoscope,
  Pill,
  FlaskConical,
  Calendar,
  Wallet,
  FileText,
  Activity,
  Shield,
  Bot,
  Flame,
  AlertTriangle,
  Droplet
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { SEOHead } from '@/components/SEOHead';
import { HealthBottomNav } from '@/components/health/HealthBottomNav';
import { HealthHeroCard } from '@/components/health/HealthHeroCard';
import { TodayObservations } from '@/components/health/TodayObservations';
import { TodayFocusCard } from '@/components/health/TodayFocusCard';
import { ConnectedSourcesSummary } from '@/components/health/ConnectedSourcesSummary';
import { VoiceVitalsModal } from '@/components/health/VoiceVitalsModal';
import { DeviceConnectionWizard } from '@/components/health/devices/DeviceConnectionWizard';
import { DeviceMetadata } from '@/services/health/devices/DeviceTypes';
import { deviceSyncManager } from '@/services/health/devices/DeviceSyncManager';
import { useHealthOS } from '@/hooks/useHealthOS';
import logo from '@/assets/chatr-logo.png';

import WorldClassHealthHub from '@/components/health/WorldClassHealthHub';

export default function HealthHub() {
  return <WorldClassHealthHub />;
}

function LegacyHealthHub() {
  const navigate = useNavigate();

  // ── Health OS Orchestration Engine ───────────────────────────────────────
  const {
    loading,
    userName,
    healthState,
    healthStateLabel,
    healthScore,
    domainStates,
    todayFocus,
    activeInsights,
    recentVitals,
    lastComputedAt,
    refresh,
  } = useHealthOS();

  // ── Modals & Wizards ─────────────────────────────────────────────────────
  const [showVoiceModal, setShowVoiceModal] = useState(false);
  const [wizardOpen, setWizardOpen] = useState(false);
  const [wizardDevice, setWizardDevice] = useState<DeviceMetadata | null>(null);
  const [wizardCategory, setWizardCategory] = useState<string | null>(null);
  const [showAllServices, setShowAllServices] = useState(false);
  const [connectedDevices, setConnectedDevices] = useState(deviceSyncManager.getConnectedDevices());

  useEffect(() => {
    setConnectedDevices(deviceSyncManager.getConnectedDevices());
    const unsub = deviceSyncManager.subscribe(() => {
      setConnectedDevices(deviceSyncManager.getConnectedDevices());
    });
    return unsub;
  }, []);

  const handleOpenConnect = (category?: string) => {
    if (category) {
      const catMap: Record<string, string> = {
        ring: 'smart_ring',
        watch: 'smartwatch',
        bp: 'blood_pressure_monitor',
        glucose: 'continuous_glucose_monitor',
        scale: 'smart_scale',
        sleep: 'smart_ring',
      };
      setWizardCategory(catMap[category] || category);
    } else {
      setWizardCategory('all');
    }
    setWizardDevice(null);
    setWizardOpen(true);
  };

  const handleCloseWizard = (open: boolean) => {
    setWizardOpen(open);
    if (!open) {
      setWizardDevice(null);
      setWizardCategory(null);
    }
  };

  // Greeting based on time of day
  const getGreeting = () => {
    const hour = new Date().getHours();
    const name = userName ? `, ${userName.toUpperCase()}` : '';
    if (hour < 12) return `GOOD MORNING${name}`;
    if (hour < 17) return `GOOD AFTERNOON${name}`;
    return `GOOD EVENING${name}`;
  };

  // Full Clinical & Marketplace Services (Progressive Disclosure)
  const healthServices = [
    { icon: Stethoscope, label: 'Doctors', path: '/local-healthcare', desc: 'Find specialists' },
    { icon: Sparkles, label: 'Teleconsult', path: '/teleconsultation', desc: 'Instant video doctor' },
    { icon: Pill, label: 'Medicines', path: '/care/medicines', desc: 'Reminders & refills' },
    { icon: FlaskConical, label: 'Lab Reports', path: '/lab-reports', desc: 'Test results' },
    { icon: Calendar, label: 'Bookings', path: '/booking', desc: 'Appointments' },
    { icon: Wallet, label: 'Health Wallet', path: '/health-wallet', desc: 'Insurance & bills' },
    { icon: FileText, label: 'Health Passport', path: '/health-passport', desc: 'Medical identity' },
    { icon: Bot, label: 'SI Assistant', path: '/ai-assistant', desc: 'Clinical Q&A' },
    { icon: Activity, label: 'Wellness Hub', path: '/wellness', desc: 'Fitness & recovery' },
  ];

  // ── Initial Blocking Loader (Only before first data fetch) ───────────────
  if (loading && !lastComputedAt) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="w-10 h-10 border-3 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-sm text-muted-foreground font-medium">Connecting Health OS…</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <SEOHead
        title="Health Hub — Personal Health OS | Chatr"
        description="Calm, intelligent personal health command center. Live biometrics, baseline deviations, and daily focus."
        breadcrumbList={[
          { name: 'Home', url: '/' },
          { name: 'Health Hub', url: '/health' }
        ]}
      />

      <div className="min-h-screen bg-background pb-32">
        {/* ── 1. MINIMAL HEADER ───────────────────────────────────────────── */}
        <header className="sticky top-0 z-40 bg-background/90 backdrop-blur-xl border-b border-border/40">
          <div className="px-4 py-3 max-w-lg mx-auto flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => navigate('/')}
                className="h-8 w-8 rounded-full"
                aria-label="Back to home"
              >
                <ArrowLeft className="h-4 w-4" />
              </Button>
              <img 
                src={logo} 
                alt="Chatr" 
                className="h-5 cursor-pointer" 
                onClick={() => navigate('/')} 
              />
            </div>

            <div className="flex items-center gap-1.5">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setShowVoiceModal(true)}
                className="h-8 w-8 rounded-full text-primary hover:bg-primary/10"
                title="Voice vitals logger"
              >
                <Mic className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => navigate('/notifications/health')}
                className="h-8 w-8 rounded-full text-muted-foreground"
                aria-label="Health notifications"
              >
                <Bell className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => navigate('/settings')}
                className="h-8 w-8 rounded-full text-muted-foreground"
                aria-label="Settings"
              >
                <Settings className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </header>

        {/* ── MAIN CONTENT (Calm, spacious, progressive disclosure) ───────── */}
        <main className="px-4 py-4 max-w-lg mx-auto space-y-4">

          {/* ── 2. PERSONAL GREETING ──────────────────────────────────────── */}
          <div className="pt-1 px-1">
            <p className="text-[11px] font-bold tracking-widest uppercase text-muted-foreground">
              {getGreeting()}
            </p>
          </div>

          {/* ── 3. HEALTH STATE (Primary Command Card) ────────────────────── */}
          <HealthHeroCard
            healthState={healthState}
            healthStateLabel={healthStateLabel}
            healthScore={healthScore}
            domainStates={domainStates}
            userName={userName}
            connectedDevicesCount={connectedDevices.length}
            onOpenDevices={() => navigate('/health/devices')}
            onOpenDetails={() => navigate('/chronic-vitals')}
          />

          {/* ── 4. TODAY (2–3 Key Observations: BP, Sleep, Activity) ──────── */}
          <TodayObservations
            recentVitals={recentVitals}
            domainStates={domainStates}
            onNavigate={(route) => navigate(route)}
          />

          {/* ── 5. TODAY'S FOCUS (Max 3 Attention Items) ───────────────────── */}
          <TodayFocusCard items={todayFocus} />

          {/* ── 6. CONNECTED SOURCES (Compact Summary) ────────────────────── */}
          <ConnectedSourcesSummary
            devices={connectedDevices}
            onOpenDevices={() => navigate('/health/devices')}
            onAddDevice={() => handleOpenConnect()}
          />

          {/* ── 7. OPTIONAL RECENT INSIGHT ─────────────────────────────────── */}
          {activeInsights.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-3.5 rounded-2xl bg-card border border-border/70 shadow-sm space-y-1.5"
            >
              <div className="flex items-center gap-1.5 text-xs font-semibold text-primary">
                <Sparkles className="w-3.5 h-3.5" />
                <span>OBSERVATION</span>
              </div>
              <p className="text-xs text-foreground font-medium leading-relaxed">
                {activeInsights[0].candidate.title}
              </p>
              <p className="text-[11px] text-muted-foreground leading-relaxed">
                {activeInsights[0].candidate.body}
              </p>
            </motion.div>
          )}

          {/* ── 8. PROGRESSIVE DISCLOSURE: ALL HEALTH SERVICES ─────────────── */}
          <div className="pt-2 border-t border-border/40">
            <button
              type="button"
              onClick={() => setShowAllServices(!showAllServices)}
              className="w-full flex items-center justify-between py-2 text-xs font-semibold text-muted-foreground hover:text-foreground transition-colors px-1"
            >
              <span>HEALTH SERVICES & CARE</span>
              {showAllServices ? (
                <ChevronUp className="w-4 h-4 text-muted-foreground" />
              ) : (
                <ChevronDown className="w-4 h-4 text-muted-foreground" />
              )}
            </button>

            <AnimatePresence>
              {showAllServices && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="grid grid-cols-3 gap-2.5 pt-2 pb-1 overflow-hidden"
                >
                  {healthServices.map((srv) => (
                    <motion.button
                      key={srv.path}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => navigate(srv.path)}
                      className="p-3 rounded-2xl bg-card border border-border/70 hover:border-primary/40 transition-colors flex flex-col items-center text-center gap-1.5 shadow-xs"
                    >
                      <div className="w-8 h-8 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
                        <srv.icon className="w-4 h-4" />
                      </div>
                      <span className="text-xs font-semibold text-foreground line-clamp-1">{srv.label}</span>
                      <span className="text-[10px] text-muted-foreground line-clamp-1">{srv.desc}</span>
                    </motion.button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Extra bottom scroll spacing for fixed nav */}
          <div className="h-6" />
        </main>

        {/* ── 9. BOTTOM NAVIGATION (Preserved) ────────────────────────────── */}
        <HealthBottomNav />

        {/* ── Hands-Free Voice Vitals Logger Modal ──────────────────────────── */}
        <VoiceVitalsModal
          isOpen={showVoiceModal}
          onClose={() => setShowVoiceModal(false)}
          onVitalLogged={refresh}
        />

        {/* ── Universal Device Connection Wizard ───────────────────────────── */}
        <DeviceConnectionWizard 
          open={wizardOpen}
          onOpenChange={handleCloseWizard}
          initialDevice={wizardDevice}
          initialCategory={wizardCategory}
          onDeviceConnected={() => {
            setConnectedDevices(deviceSyncManager.getConnectedDevices());
            refresh();
          }}
        />
      </div>
    </>
  );
}
