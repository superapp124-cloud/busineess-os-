import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, ArrowRight, CheckCircle2, Loader2, Mail, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export type WizardType = 'email' | 'professional' | 'cloud' | 'business' | 'social';

type WizardStep = 'input' | 'detecting' | 'detected' | 'authorizing' | 'success' | 'manual';

interface DetectedProvider {
  name: string;
  domain: string;
  logo: string;
  color: string;
  authType: 'oauth' | 'imap';
}

// Domain → Provider detection map
const DOMAIN_MAP: Record<string, DetectedProvider> = {
  'gmail.com': { name: 'Google Workspace', domain: 'gmail.com', logo: '🔴', color: '#EA4335', authType: 'oauth' },
  'googlemail.com': { name: 'Google Workspace', domain: 'googlemail.com', logo: '🔴', color: '#EA4335', authType: 'oauth' },
  'outlook.com': { name: 'Microsoft 365', domain: 'outlook.com', logo: '🔵', color: '#0078D4', authType: 'oauth' },
  'hotmail.com': { name: 'Microsoft 365', domain: 'hotmail.com', logo: '🔵', color: '#0078D4', authType: 'oauth' },
  'live.com': { name: 'Microsoft 365', domain: 'live.com', logo: '🔵', color: '#0078D4', authType: 'oauth' },
  'yahoo.com': { name: 'Yahoo Mail', domain: 'yahoo.com', logo: '🟣', color: '#6001D2', authType: 'oauth' },
  'ymail.com': { name: 'Yahoo Mail', domain: 'ymail.com', logo: '🟣', color: '#6001D2', authType: 'oauth' },
  'icloud.com': { name: 'iCloud Mail', domain: 'icloud.com', logo: '☁️', color: '#555555', authType: 'imap' },
  'me.com': { name: 'iCloud Mail', domain: 'me.com', logo: '☁️', color: '#555555', authType: 'imap' },
  'proton.me': { name: 'Proton Mail', domain: 'proton.me', logo: '🛡️', color: '#6D4AFF', authType: 'imap' },
  'protonmail.com': { name: 'Proton Mail', domain: 'protonmail.com', logo: '🛡️', color: '#6D4AFF', authType: 'imap' },
};

// Professional wizard config
const PROFESSIONAL_SERVICES = [
  { id: 'linkedin', name: 'LinkedIn', logo: '💼', description: 'Career and professional network' },
  { id: 'github', name: 'GitHub', logo: '🐙', description: 'Code repositories and projects' },
  { id: 'salesforce', name: 'Salesforce', logo: '☁️', description: 'CRM and sales pipeline' },
];

const CLOUD_SERVICES = [
  { id: 'gdrive', name: 'Google Drive', logo: '🗂️', description: 'Docs, Sheets, and files' },
  { id: 'onedrive', name: 'OneDrive', logo: '📁', description: 'Microsoft cloud storage' },
  { id: 'dropbox', name: 'Dropbox', logo: '📦', description: 'Team file storage' },
];

const BUSINESS_SERVICES = [
  { id: 'salesforce', name: 'Salesforce', logo: '☁️', description: 'CRM and opportunities' },
  { id: 'hubspot', name: 'HubSpot', logo: '🧡', description: 'Marketing and CRM' },
  { id: 'sap', name: 'SAP', logo: '🏢', description: 'Enterprise resource planning' },
];

const SOCIAL_SERVICES = [
  { id: 'slack', name: 'Slack', logo: '💬', description: 'Team messaging' },
  { id: 'teams', name: 'Microsoft Teams', logo: '🟦', description: 'Video and messaging' },
  { id: 'whatsapp', name: 'WhatsApp', logo: '📱', description: 'Personal messaging' },
];

interface ConnectionWizardProps {
  type: WizardType;
  categoryLabel: string;
  onSuccess: () => void;
  onBack: () => void;
}

export const ConnectionWizard: React.FC<ConnectionWizardProps> = ({
  type,
  categoryLabel,
  onSuccess,
  onBack,
}) => {
  const [step, setStep] = useState<WizardStep>('input');
  const [email, setEmail] = useState('');
  const [detected, setDetected] = useState<DetectedProvider | null>(null);
  const [selectedService, setSelectedService] = useState<string | null>(null);

  // ── Email / Communication Wizard ─────────────────────────────────────
  const detectProvider = () => {
    if (!email.trim() || !email.includes('@')) return;
    setStep('detecting');

    setTimeout(() => {
      const domain = email.split('@')[1]?.toLowerCase();
      const provider = domain ? DOMAIN_MAP[domain] : null;

      if (provider) {
        setDetected(provider);
        setStep('detected');
      } else {
        // Unknown domain — try auto-discovery (fallback to IMAP)
        setDetected({
          name: 'Auto Discovery',
          domain: domain || '',
          logo: '🔍',
          color: '#888',
          authType: 'imap',
        });
        setStep('detected');
      }
    }, 1200);
  };

  const handleAuthorize = () => {
    setStep('authorizing');
    // Simulate OAuth / IMAP handshake
    setTimeout(() => {
      setStep('success');
    }, 2000);
  };

  // ── Non-email Wizard (Professional / Cloud / Business / Social) ───────
  const serviceList =
    type === 'professional'
      ? PROFESSIONAL_SERVICES
      : type === 'cloud'
      ? CLOUD_SERVICES
      : type === 'business'
      ? BUSINESS_SERVICES
      : SOCIAL_SERVICES;

  const handleServiceAuthorize = () => {
    if (!selectedService) return;
    setStep('authorizing');
    setTimeout(() => setStep('success'), 2000);
  };

  // ── Render ─────────────────────────────────────────────────────────────
  const renderEmailWizard = () => (
    <AnimatePresence mode="wait">
      {step === 'input' && (
        <motion.div key="input" {...fade} className="space-y-5">
          <div>
            <p className="text-white/50 text-sm mb-1">What email do you use?</p>
            <p className="text-white/25 text-xs">We'll detect your provider automatically.</p>
          </div>
          <Input
            id="wizard-email-input"
            type="email"
            placeholder="you@example.com"
            value={email}
            onChange={e => setEmail(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && detectProvider()}
            className="h-12 bg-white/5 border-white/10 text-white placeholder:text-white/20 rounded-xl focus:border-purple-500/50"
            autoFocus
          />
          <p className="text-white/20 text-xs">
            Example: john@gmail.com · ceo@company.com · hello@domain.com
          </p>
          <Button
            onClick={detectProvider}
            disabled={!email.trim() || !email.includes('@')}
            className="w-full h-11 bg-purple-600 hover:bg-purple-500 text-white rounded-xl font-semibold"
          >
            Continue <ArrowRight className="ml-2 w-4 h-4" />
          </Button>
        </motion.div>
      )}

      {step === 'detecting' && (
        <motion.div key="detecting" {...fade} className="flex flex-col items-center gap-4 py-8">
          <Loader2 className="w-10 h-10 text-purple-400 animate-spin" />
          <p className="text-white/50 text-sm">Detecting provider for {email}…</p>
        </motion.div>
      )}

      {step === 'detected' && detected && (
        <motion.div key="detected" {...fade} className="space-y-5">
          <div className="bg-white/[0.04] border border-white/[0.08] rounded-2xl p-4 flex items-center gap-4">
            <div
              className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl"
              style={{ backgroundColor: detected.color + '22' }}
            >
              {detected.logo}
            </div>
            <div>
              <p className="text-white font-semibold">{detected.name}</p>
              <p className="text-white/40 text-xs mt-0.5">
                {detected.authType === 'oauth' ? 'OAuth 2.0 — secure authorization' : 'Auto-discovery (IMAP)'}
              </p>
            </div>
            <CheckCircle2 className="ml-auto w-5 h-5 text-purple-400 shrink-0" />
          </div>

          {detected.authType === 'imap' && (
            <div className="flex items-start gap-2 text-white/40 text-xs">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <p>We'll attempt automatic IMAP discovery. You may need to allow app access in your mail settings.</p>
            </div>
          )}

          <Button
            onClick={handleAuthorize}
            className="w-full h-11 bg-purple-600 hover:bg-purple-500 text-white rounded-xl font-semibold"
          >
            Authorize {detected.name} <ArrowRight className="ml-2 w-4 h-4" />
          </Button>
        </motion.div>
      )}

      {step === 'authorizing' && (
        <motion.div key="authorizing" {...fade} className="flex flex-col items-center gap-4 py-8">
          <Loader2 className="w-10 h-10 text-purple-400 animate-spin" />
          <div className="text-center space-y-1">
            <p className="text-white/70 text-sm font-medium">Connecting…</p>
            <p className="text-white/30 text-xs">Opening secure authorization</p>
          </div>
        </motion.div>
      )}

      {step === 'success' && (
        <motion.div key="success" {...fade} className="flex flex-col items-center gap-5 py-6">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', stiffness: 260, damping: 20 }}
            className="w-16 h-16 rounded-2xl bg-purple-500/20 border border-purple-500/40 flex items-center justify-center"
          >
            <CheckCircle2 className="w-9 h-9 text-purple-400" />
          </motion.div>
          <div className="text-center">
            <p className="text-white font-semibold text-lg">Connected!</p>
            <p className="text-white/40 text-sm mt-1">{categoryLabel} is now part of your workspace.</p>
          </div>
          <Button
            onClick={onSuccess}
            className="w-full h-11 bg-gradient-to-r from-purple-600 to-purple-800 text-white rounded-xl font-semibold"
          >
            Done
          </Button>
        </motion.div>
      )}
    </AnimatePresence>
  );

  const renderServiceWizard = () => (
    <AnimatePresence mode="wait">
      {step === 'input' && (
        <motion.div key="services" {...fade} className="space-y-4">
          <p className="text-white/40 text-sm">Choose a service to connect:</p>
          {serviceList.map(svc => (
            <button
              key={svc.id}
              onClick={() => setSelectedService(svc.id)}
              className={`w-full flex items-center gap-3 p-3.5 rounded-xl border transition-all text-left ${
                selectedService === svc.id
                  ? 'bg-purple-500/15 border-purple-500/40 text-white'
                  : 'bg-white/[0.03] border-white/[0.06] text-white/70 hover:bg-white/[0.06]'
              }`}
            >
              <span className="text-xl">{svc.logo}</span>
              <div>
                <p className="text-sm font-medium">{svc.name}</p>
                <p className="text-xs text-white/35">{svc.description}</p>
              </div>
              {selectedService === svc.id && (
                <CheckCircle2 className="ml-auto w-4 h-4 text-purple-400 shrink-0" />
              )}
            </button>
          ))}
          <Button
            onClick={handleServiceAuthorize}
            disabled={!selectedService}
            className="w-full h-11 bg-purple-600 hover:bg-purple-500 text-white rounded-xl font-semibold mt-2"
          >
            Connect <ArrowRight className="ml-2 w-4 h-4" />
          </Button>
        </motion.div>
      )}

      {step === 'authorizing' && (
        <motion.div key="authorizing" {...fade} className="flex flex-col items-center gap-4 py-8">
          <Loader2 className="w-10 h-10 text-purple-400 animate-spin" />
          <p className="text-white/50 text-sm">Connecting…</p>
        </motion.div>
      )}

      {step === 'success' && (
        <motion.div key="success" {...fade} className="flex flex-col items-center gap-5 py-6">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', stiffness: 260, damping: 20 }}
            className="w-16 h-16 rounded-2xl bg-purple-500/20 border border-purple-500/40 flex items-center justify-center"
          >
            <CheckCircle2 className="w-9 h-9 text-purple-400" />
          </motion.div>
          <div className="text-center">
            <p className="text-white font-semibold text-lg">Connected!</p>
            <p className="text-white/40 text-sm mt-1">{categoryLabel} is now part of your workspace.</p>
          </div>
          <Button
            onClick={onSuccess}
            className="w-full h-11 bg-gradient-to-r from-purple-600 to-purple-800 text-white rounded-xl font-semibold"
          >
            Done
          </Button>
        </motion.div>
      )}
    </AnimatePresence>
  );

  return (
    <div className="min-h-screen bg-[#040510] flex flex-col items-center justify-center p-6 text-white">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-purple-900/15 via-[#040510] to-[#040510] pointer-events-none" />

      <motion.div
        className="w-full max-w-sm z-10"
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <button
            onClick={onBack}
            className="w-8 h-8 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-white/50 hover:text-white hover:bg-white/10 transition-all"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <p className="text-white/40 text-xs uppercase tracking-widest">Connect</p>
            <h2 className="text-white font-semibold">{categoryLabel}</h2>
          </div>
        </div>

        {/* Wizard card */}
        <div className="bg-[#090A15]/90 border border-white/[0.06] rounded-2xl p-6 backdrop-blur-xl min-h-[240px]">
          {type === 'email' ? renderEmailWizard() : renderServiceWizard()}
        </div>
      </motion.div>
    </div>
  );
};

// Shared framer animation preset
const fade = {
  initial: { opacity: 0, y: 8 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -8 },
  transition: { duration: 0.25 },
};
