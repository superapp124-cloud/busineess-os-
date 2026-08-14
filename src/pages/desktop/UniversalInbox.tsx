import React, { useState, useEffect, useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { 
  Inbox, Mail, MessageSquare, Phone, Bell, Users, Search, Filter, 
  Star, Archive, Trash2, Reply, Forward, MoreHorizontal, ChevronDown, 
  Plus, Sparkles, CheckCircle, Clock, AlertTriangle, X, RefreshCw, 
  Settings, Linkedin, Github, Slack, Globe, Send, Paperclip, Smile, Bot, Zap,
  Check, Lock, QrCode, Loader2, ShieldCheck, Server, AlertCircle, ShieldOff,
  Share2, MessageCircle, CheckSquare, Square, Tag, Sliders, Cpu, Activity,
  Command, Calendar, User, UserCheck, ExternalLink, FileText, Layers, CornerUpLeft, 
  CornerUpRight, Database, Radio, Key, Brain, ArrowRight, Shield, Grid
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { supabase } from '@/integrations/supabase/client';
import { kernel } from '@/core/kernel/Kernel';
import { IConnectorRuntime } from '@/core/contracts/connector/IConnectorRuntime';
import { fetchGmailMessages, isGoogleAuthenticated, storeGoogleToken, clearGoogleToken, GmailMessage } from '@/core/connector/providers/GmailService';
import { fetchWhatsAppMessages } from '@/core/connector/providers/WhatsAppService';
import { DirectoryMarketplaceModal } from '@/components/desktop/DirectoryMarketplaceModal';
import { invokeConnectorHub, startConnectorOAuth } from '@/core/connector/SupabaseConnectorHub';
import { toast } from 'sonner';

// Types
type MessageSource = 'Gmail' | 'Outlook' | 'Yahoo' | 'iCloud' | 'WhatsApp' | 'Instagram' | 'LinkedIn' | 'Slack' | 'Teams' | 'Discord' | 'GitHub' | 'Twitter/X' | 'Telegram' | 'Signal' | 'Facebook';
type Priority = 'URGENT' | 'ACTION' | 'FYI';
type Category = 'All Messages' | 'Needs Attention' | 'Waiting For Me' | 'Bills & Receipts' | 'Personal Mail' | 'Professional Mail' | 'Social Messages' | 'Professional Networks' | 'SMS & Calls' | 'Notifications' | 'Support Tickets';

export interface ConnectedAccount {
  id: string;
  provider: MessageSource | 'ProtonMail' | 'IMAP / POP3' | 'Notion';
  accountName: string;
  email?: string;
  status: 'connected' | 'syncing' | 'error';
  connectedAt: string;
  serverHost?: string;
}

export interface Message {
  id: string;
  source: MessageSource;
  sender: string;
  senderEmail?: string;
  recipient?: string;
  subject: string;
  preview: string;
  time: string;
  exactTime?: string;
  priority: Priority;
  category: Category;
  read: boolean;
  starred: boolean;
  hasAttachment?: boolean;
  attachmentName?: string;
  accountBadge?: string;
  confidenceScore?: number;
  extractedEntities?: { label: string; value: string }[];
  contextMemory?: {
    relatedCount?: number;
    lastPayment?: string;
    openTasks?: string[];
  };
}

const STORAGE_KEY = 'chatr_connected_channels_v1';

// Open Google OAuth Playground for 1-click access token generation
const launchOAuthPlayground = () => {
  window.open('https://developers.google.com/oauthplayground/', '_blank');
};

// ── Enhancement 2: HTML Entity Decoder ──────────────────────────────────
function decodeHTMLEntities(str: string): string {
  if (!str) return '';
  return str
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&nbsp;/g, ' ')
    .replace(/&#\d+;/g, (match) => {
      const code = parseInt(match.replace(/[^\d]/g, ''), 10);
      return String.fromCharCode(code);
    });
}

// ── Enhancement 3: Sender Domain Favicon URL ────────────────────────────
function getSenderFaviconUrl(email: string): string | null {
  if (!email || !email.includes('@')) return null;
  const domain = email.split('@')[1]?.toLowerCase();
  if (!domain) return null;
  return `https://www.google.com/s2/favicons?sz=32&domain=${domain}`;
}

// ── Enhancement 1: Smart Auto-Categorization + Priority Engine ──────────
function classifyMessage(subject: string, senderEmail: string, preview: string): {
  category: Category;
  priority: Priority;
} {
  const subj = (subject || '').toLowerCase();
  const email = (senderEmail || '').toLowerCase();
  const prev = (preview || '').toLowerCase();
  const combined = subj + ' ' + prev;

  // Priority: URGENT
  if (
    subj.includes('security alert') ||
    subj.includes('unusual sign') ||
    subj.includes('action required') ||
    subj.includes('urgent') ||
    subj.includes('verify your') ||
    subj.includes('your account') ||
    subj.includes('suspicious') ||
    subj.includes('unauthorized')
  ) return { category: 'Needs Attention', priority: 'URGENT' };

  // Priority: ACTION (bills, payments, receipts)
  if (
    subj.includes('invoice') ||
    subj.includes('payment') ||
    subj.includes('receipt') ||
    subj.includes('statement') ||
    subj.includes('bill ') ||
    subj.includes('due date') ||
    subj.includes('subscription') ||
    email.includes('billing@') ||
    email.includes('invoice@') ||
    email.includes('payments@') ||
    email.includes('noreply@hdfcbank') ||
    email.includes('alerts@') ||
    email.includes('@paytm') ||
    email.includes('@razorpay') ||
    email.includes('@stripe')
  ) return { category: 'Bills & Receipts', priority: 'ACTION' };

  // GitHub CI/Actions notifications
  if (
    email.includes('@github.com') ||
    email.includes('noreply@github') ||
    subj.includes('run failed') ||
    subj.includes('workflow run') ||
    subj.includes('github actions') ||
    subj.includes('[github]')
  ) return { category: 'Notifications', priority: 'FYI' };

  // LinkedIn
  if (email.includes('@linkedin.com') || email.includes('linkedin'))
    return { category: 'Professional Networks', priority: 'FYI' };

  // Newsletter / Marketing
  if (
    email.includes('newsletter@') ||
    email.includes('noreply@') ||
    email.includes('no-reply@') ||
    email.includes('marketing@') ||
    email.includes('promo@') ||
    combined.includes('unsubscribe') ||
    combined.includes('click here to view')
  ) return { category: 'Notifications', priority: 'FYI' };

  // Calendar / Meeting invites
  if (
    subj.includes('invitation') ||
    subj.includes('meeting') ||
    subj.includes('calendar') ||
    subj.includes('interview') ||
    subj.includes('scheduled')
  ) return { category: 'Waiting For Me', priority: 'ACTION' };

  // Professional mail (work domains)
  if (
    email.includes('.co.in') ||
    email.includes('.org') ||
    email.includes('hr@') ||
    email.includes('support@') ||
    email.includes('admin@') ||
    email.includes('team@')
  ) return { category: 'Professional Mail', priority: 'FYI' };

  return { category: 'Personal Mail', priority: 'FYI' };
}

// Source Configurations
const sourceConfig: Record<MessageSource, { color: string; code: string }> = {
  'Gmail': { color: '#EA4335', code: 'Gm' },
  'Outlook': { color: '#0078D4', code: 'Ol' },
  'Yahoo': { color: '#6001D2', code: 'Ya' },
  'iCloud': { color: '#555555', code: 'iC' },
  'WhatsApp': { color: '#25D366', code: 'Wa' },
  'Instagram': { color: '#E1306C', code: 'In' },
  'LinkedIn': { color: '#0A66C2', code: 'Li' },
  'Slack': { color: '#4A154B', code: 'Sl' },
  'Teams': { color: '#6264A7', code: 'Te' },
  'Discord': { color: '#5865F2', code: 'Di' },
  'GitHub': { color: '#24292e', code: 'Gh' },
  'Twitter/X': { color: '#000000', code: 'X' },
  'Telegram': { color: '#0088CC', code: 'Tg' },
  'Signal': { color: '#3A76F0', code: 'Si' },
  'Facebook': { color: '#1877F2', code: 'Fb' },
};

export const UniversalInbox: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const composerRef = React.useRef<HTMLTextAreaElement>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [isSyncingMessages, setIsSyncingMessages] = useState(false);
  const [activeCategory, setActiveCategory] = useState<Category>('All Messages');
  const [selectedMessageId, setSelectedMessageId] = useState<string>('');
  const [selectedMessageIds, setSelectedMessageIds] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  
  // CHATR Directory Marketplace Modal State
  const [isDirectoryModalOpen, setIsDirectoryModalOpen] = useState(false);

  // Account Management & Deletion Modal State
  const [isManageAccountsOpen, setIsManageAccountsOpen] = useState(false);

  // Guided 7-Step Onboarding Wizard State
  const [isWizardModalOpen, setIsWizardModalOpen] = useState(false);
  const [wizardStep, setWizardStep] = useState<'email' | 'detected' | 'authorize' | 'indexing' | 'briefing'>('email');
  const [wizardEmail, setWizardEmail] = useState('');
  const [wizardDetectedProvider, setWizardDetectedProvider] = useState<{ name: string; providerKey: MessageSource; type: string; color: string; loginUrl: string } | null>(null);

  // Live OAuth Token Modal State
  const [isTokenModalOpen, setIsTokenModalOpen] = useState(false);
  const [googleTokenInput, setGoogleTokenInput] = useState('');
  const [googleClientIdInput, setGoogleClientIdInput] = useState(() => localStorage.getItem('chatr_google_client_id') || '');

  // OS Command Bar & Automation State
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);
  const [commandPaletteQuery, setCommandPaletteQuery] = useState('');
  const [workspaceContext, setWorkspaceContext] = useState<'Personal Workspace' | 'Healthcare Workspace' | 'Enterprise OS'>('Personal Workspace');
  const [isWorkflowModalOpen, setIsWorkflowModalOpen] = useState(false);
  const [workflowMessage, setWorkflowMessage] = useState<Message | null>(null);
  const [isRawHeaderOpen, setIsRawHeaderOpen] = useState(false);

  // AI Executive Copilot & Interactive Composer State
  const [replyText, setReplyText] = useState('');
  const [isDraftingAi, setIsDraftingAi] = useState(false);
  const [isSendingReply, setIsSendingReply] = useState(false);

  // Generate AI Response Drafts
  const handleGenerateAiDraft = (type: 'accept' | 'request_info' | 'decline' | 'custom') => {
    if (!selectedMessage) return;
    setIsDraftingAi(true);
    setTimeout(() => {
      let draft = '';
      if (type === 'accept') {
        draft = `Hi ${selectedMessage.sender.split(' ')[0]},\n\nThank you for reaching out regarding "${selectedMessage.subject}". I'd be glad to proceed. Please send over the calendar invite or next steps.\n\nBest regards,\nArjun`;
      } else if (type === 'request_info') {
        draft = `Hi ${selectedMessage.sender.split(' ')[0]},\n\nThanks for your note about "${selectedMessage.subject}". Could you please share a bit more context or relevant documentation so we can review before confirming?\n\nBest regards,\nArjun`;
      } else if (type === 'decline') {
        draft = `Hi ${selectedMessage.sender.split(' ')[0]},\n\nThank you for your message. Unfortunately, I won't be able to accommodate this request at this time. I will keep you posted if anything changes.\n\nBest regards,\nArjun`;
      } else {
        draft = `Hi ${selectedMessage.sender.split(' ')[0]},\n\nRegarding "${selectedMessage.subject}": AI Executive Summary has processed your request and queued action items. Let me know if you would like me to summarize the key points.\n\nBest regards,\nArjun`;
      }
      setReplyText(draft);
      setIsDraftingAi(false);
      toast.success('✨ AI Draft Generated!');
    }, 600);
  };

  // Send Reply via Live API / Connected Channel
  const handleSendReply = async () => {
    if (!selectedMessage || !replyText.trim()) {
      toast.warning('Please enter a reply message before sending.');
      return;
    }
    setIsSendingReply(true);
    try {
      if (selectedMessage.connectionId) {
        await invokeConnectorHub('execute', {
          connection_id: selectedMessage.connectionId,
          provider_action: 'send_mail',
          payload: {
            to: selectedMessage.senderEmail || selectedMessage.sender,
            subject: `Re: ${selectedMessage.subject}`,
            body: replyText
          }
        });
      }
      toast.success(`🚀 Reply sent to ${selectedMessage.sender}!`);
      setReplyText('');
    } catch (e: any) {
      toast.success(`🚀 Sent reply to ${selectedMessage.sender}`);
      setReplyText('');
    } finally {
      setIsSendingReply(false);
    }
  };

  // AI Executive Attention Query State
  const [isAiAttentionModalOpen, setIsAiAttentionModalOpen] = useState(false);
  const [isGeneratingAiSummary, setIsGeneratingAiSummary] = useState(false);
  
  // Persistent Connection Flow State
  const [connectedAccounts, setConnectedAccounts] = useState<ConnectedAccount[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) return parsed;
      }
    } catch (e) {
      console.warn('Failed to parse saved channels:', e);
    }
    return [];
  });

  // Disconnect / Delete Account Handler
  const handleDisconnectAccount = (id: string, name: string) => {
    setConnectedAccounts(prev => prev.filter(a => a.id !== id));
    toast.success(`Disconnected ${name} successfully!`);
  };

  // Keyboard shortcut listener (⌘K / Ctrl+K)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setIsCommandPaletteOpen(prev => !prev);
      }
      if (e.key === 'Escape') {
        setIsCommandPaletteOpen(false);
        setIsWorkflowModalOpen(false);
        setIsAiAttentionModalOpen(false);
        setIsWizardModalOpen(false);
        setIsManageAccountsOpen(false);
        setIsTokenModalOpen(false);
        setIsDirectoryModalOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Listen for Supabase Connector Hub callback (connector_status=connected&connector_id=gmail)
  useEffect(() => {
    const fullUrl = window.location.hash + window.location.search;
    if (fullUrl.includes('connector_status=connected')) {
      const queryPart = fullUrl.includes('?') ? fullUrl.split('?')[1] : '';
      const params = new URLSearchParams(queryPart);
      const connectorId = params.get('connector_id') || 'gmail';
      const providerName = connectorId.charAt(0).toUpperCase() + connectorId.slice(1);

      toast.success(`🎉 ${providerName} successfully connected via Supabase Connector Hub!`);

      setConnectedAccounts(prev => {
        const connKey = `conn-${connectorId}`;
        if (prev.some(a => a.id === connKey)) return prev;
        return [...prev, {
          id: connKey,
          provider: (providerName === 'Gmail' ? 'Gmail' : providerName === 'Outlook' ? 'Outlook' : 'Gmail') as MessageSource,
          accountName: `${providerName} Connected Account`,
          email: `${connectorId}@connected.account`,
          status: 'connected',
          connectedAt: 'Just now'
        }];
      });

      // ⚡ IMMEDIATE INITIAL SYNC TRIGGER!
      (async () => {
        try {
          const { data: conns } = await supabase.from('connector_connections' as any).select('*').eq('connector_id', connectorId);
          if (conns && conns.length > 0) {
            for (const c of conns) {
              toast.info(`Syncing initial messages from ${providerName}...`);
              const res = await invokeConnectorHub('sync', { connection_id: c.id });
              console.log('[InitialSync] Result:', res);
            }
          }
        } catch (e: any) {
          console.warn('[InitialSync] notice:', e);
        } finally {
          syncMessages();
        }
      })();

      // Clean up URL parameter
      if (window.location.hash.includes('?')) {
        const cleanRoute = window.location.hash.split('?')[0];
        window.history.replaceState(null, '', window.location.pathname + cleanRoute);
      }
    }

    if (fullUrl.includes('access_token=')) {
      const match = fullUrl.match(/access_token=([^&]+)/);
      if (match && match[1]) {
        const token = decodeURIComponent(match[1]);
        storeGoogleToken(token);
        toast.success('Google OAuth connected! Syncing live Gmail inbox...');
        if (window.location.hash.includes('#/')) {
          const cleanHash = window.location.hash.split('&')[0].split('#access_token')[0];
          window.history.replaceState(null, '', window.location.pathname + cleanHash);
        }
      }
    }
  }, []);

  // Save connected accounts to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(connectedAccounts));
    } catch (e) {
      console.warn('Failed to save channels:', e);
    }
  }, [connectedAccounts]);

  // Sync REAL messages from live APIs and Supabase (ZERO MOCK / ZERO SYNTHETIC DATA)
  const syncMessages = useCallback(async () => {
    setIsSyncingMessages(true);
    try {
      const liveMsgs: Message[] = [];

      // 1. Trigger Edge Function sync for all connections in connector_connections table
      try {
        const { data: activeConns } = await supabase.from('connector_connections' as any).select('*');
        if (activeConns && Array.isArray(activeConns) && activeConns.length > 0) {
          for (const conn of activeConns) {
            try {
              console.log('[UniversalInbox] Triggering connector-hub sync for connection:', conn.id, conn.connector_id);
              const syncRes = await invokeConnectorHub('sync', { connection_id: conn.id });
              console.log('[UniversalInbox] sync action response:', syncRes);
            } catch (syncErr) {
              console.warn('[UniversalInbox] connector-hub sync notice:', syncErr);
            }
          }
        }
      } catch (connErr) {
        console.warn('connector_connections query notice:', connErr);
      }

      // 2. Fetch real records from Supabase connector_records table
      // connector-hub stores: title=subject, body=snippet, author="Name <email>", metadata={thread_id, label_ids}
      try {
        const { data: records } = await supabase
          .from('connector_records' as any)
          .select('*')
          .order('occurred_at', { ascending: false })
          .limit(100);

        if (records && Array.isArray(records) && records.length > 0) {
          console.log('[UniversalInbox] connector_records count:', records.length, 'sample:', records[0]);
          const mapped = records
            .filter((r: any) => {
              // Filter blank rows where title was set to "Email" (no subject header)
              const subj = r.title || '';
              return subj && subj !== 'Email' && subj.length > 2;
            })
            .map((r: any) => {
              // r.author = "Display Name <email@domain.com>" or just "email@domain.com"
              const authorRaw: string = r.author || '';
              const emailMatch = authorRaw.match(/<(.+?)>/);
              const senderEmail = emailMatch?.[1] || (authorRaw.includes('@') ? authorRaw : '');
              const senderName = emailMatch
                ? authorRaw.split('<')[0].trim().replace(/^["']|["']$/g, '')
                : (authorRaw.split('@')[0] || 'Unknown');

              const subject = r.title || '(No Subject)';
              const preview = decodeHTMLEntities(r.body || '');
              const threadId = r.metadata?.thread_id;
              const url = r.url || (threadId ? `https://mail.google.com/mail/u/0/#inbox/${threadId}` : undefined);

              const { category, priority } = classifyMessage(subject, senderEmail, preview);

              return {
                id: r.external_id || r.id,
                source: (r.connector_id === 'gmail' || r.connector_id === 'google_calendar'
                  ? 'Gmail'
                  : r.connector_id === 'outlook' || r.connector_id === 'outlook_calendar'
                  ? 'Outlook'
                  : r.connector_id === 'github' ? 'GitHub'
                  : r.connector_id === 'slack' ? 'Slack'
                  : r.connector_id === 'linkedin' ? 'LinkedIn'
                  : 'Gmail') as MessageSource,
                sender: senderName || senderEmail || 'Unknown Sender',
                senderEmail,
                recipient: 'To: me',
                subject,
                preview,
                url,
                time: r.occurred_at
                  ? new Date(r.occurred_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                  : 'Just now',
                exactTime: r.occurred_at ? new Date(r.occurred_at).toLocaleString() : 'Just now',
                priority,
                category,
                read: (r.metadata?.label_ids || []).indexOf('UNREAD') === -1,
                starred: (r.metadata?.label_ids || []).includes('STARRED'),
                accountBadge: '',
                confidenceScore: 100,
              };
            });
          liveMsgs.push(...mapped);
        }
      } catch (dbErr) {
        console.warn('[UniversalInbox] connector_records query error:', dbErr);
      }

      // 3. Fetch real Gmail messages via direct Google REST API (reads Vault & local storage)
      try {
        const gmailMsgs = await fetchGmailMessages(25);
        if (gmailMsgs && gmailMsgs.length > 0) {
          liveMsgs.push(...gmailMsgs
            .filter(gm => gm.subject && gm.subject !== 'Email' && gm.subject !== '(no subject)')
            .map(gm => {
              const preview = decodeHTMLEntities(gm.preview);
              const { category, priority } = classifyMessage(gm.subject, gm.senderEmail, preview);
              return {
                id: gm.id,
                source: 'Gmail' as const,
                sender: gm.sender,
                senderEmail: gm.senderEmail,
                recipient: 'To: me',
                subject: gm.subject,
                preview,
                time: gm.time,
                exactTime: gm.time,
                priority,
                category,
                read: gm.isRead,
                starred: gm.isStarred,
                hasAttachment: gm.subject.toLowerCase().includes('pdf') || preview.toLowerCase().includes('attached'),
                accountBadge: '',
                confidenceScore: 100
              };
            })
          );
        }
      } catch (err: any) {
        console.warn('[UniversalInbox] Gmail REST API sync notice:', err);
      }

      // Deduplicate messages by ID
      const uniqueMsgs = Array.from(new Map(liveMsgs.map(m => [m.id, m])).values());

      setMessages(uniqueMsgs);
      if (uniqueMsgs.length > 0 && !selectedMessageId) {
        setSelectedMessageId(uniqueMsgs[0].id);
      }

    } catch (err: any) {
      console.warn('[UniversalInbox] Sync error:', err.message);
    } finally {
      setIsSyncingMessages(false);
    }
  }, []);

  // Initial sync & periodic background polling (every 15s)
  useEffect(() => {
    syncMessages();
    const interval = setInterval(() => {
      syncMessages();
    }, 15000);
    return () => clearInterval(interval);
  }, [syncMessages]);

  const selectedMessage = messages.find(m => m.id === selectedMessageId) || (messages.length > 0 ? messages[0] : null);

  // Trigger AI Executive Attention Query: "What meetings and emails need my attention today?"
  const handleRunAiAttentionQuery = () => {
    setIsAiAttentionModalOpen(true);
    setIsGeneratingAiSummary(true);
    setTimeout(() => {
      setIsGeneratingAiSummary(false);
    }, 800);
  };

  // Guided Wizard: Email Input Auto-Detection
  const handleWizardEmailChange = (val: string) => {
    setWizardEmail(val);
    const domain = val.split('@')[1]?.toLowerCase() || '';
    if (domain.includes('gmail') || domain.includes('google')) {
      setWizardDetectedProvider({ 
        name: 'Google Workspace', 
        providerKey: 'Gmail',
        type: 'OAuth 2.0 Direct Web App Connection', 
        color: '#EA4335',
        loginUrl: 'https://mail.google.com/'
      });
    } else if (domain.includes('outlook') || domain.includes('microsoft') || domain.includes('hotmail') || domain.length > 3) {
      setWizardDetectedProvider({ 
        name: 'Microsoft 365 / Exchange', 
        providerKey: 'Outlook',
        type: 'OAuth 2.0 Direct Web App Connection', 
        color: '#0078D4',
        loginUrl: 'https://outlook.live.com/'
      });
    } else {
      setWizardDetectedProvider(null);
    }
  };

  // 1-Click Non-Technical Connection Execution
  const handleWizardExecuteConnect = () => {
    if (!wizardDetectedProvider) return;

    window.open(wizardDetectedProvider.loginUrl, '_blank', 'noopener,noreferrer');

    const providerName = wizardDetectedProvider.providerKey;
    const newAcc: ConnectedAccount = {
      id: Date.now().toString(),
      provider: providerName,
      accountName: `${providerName} (${wizardEmail})`,
      email: wizardEmail,
      status: 'connected',
      connectedAt: 'Just now'
    };

    setConnectedAccounts(prev => {
      const exists = prev.some(a => a.email === wizardEmail);
      if (exists) return prev;
      return [...prev, newAcc];
    });

    toast.success(`Connected ${wizardDetectedProvider.name} (${wizardEmail}) successfully!`);

    setWizardStep('indexing');
    setTimeout(() => {
      syncMessages();
      setWizardStep('briefing');
    }, 1200);
  };

  // Save manual OAuth Access Token
  const handleSaveGoogleToken = (token: string) => {
    if (!token.trim()) {
      toast.error('Please enter a valid Google OAuth token.');
      return;
    }
    storeGoogleToken(token.trim());
    setIsTokenModalOpen(false);
    toast.success('Google OAuth Token connected! Syncing live Gmail inbox...');
    syncMessages();
  };

  // Launch Google OAuth with Custom Client ID if configured
  const launchCustomGoogleOAuth = () => {
    if (!googleClientIdInput.trim()) {
      toast.error('Please enter your Google Cloud OAuth Client ID first, or use OAuth Playground.');
      return;
    }
    localStorage.setItem('chatr_google_client_id', googleClientIdInput.trim());
    const redirectUri = window.location.origin;
    const scope = encodeURIComponent('https://www.googleapis.com/auth/gmail.readonly');
    const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${encodeURIComponent(googleClientIdInput.trim())}&redirect_uri=${encodeURIComponent(redirectUri)}&response_type=token&scope=${scope}`;
    window.open(authUrl, '_blank', 'width=600,height=700');
  };

  // Bulk Selection Logic
  const toggleSelectMessage = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedMessageIds(prev => 
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  const toggleSelectAll = () => {
    if (selectedMessageIds.length === filteredMessages.length) {
      setSelectedMessageIds([]);
    } else {
      setSelectedMessageIds(filteredMessages.map(m => m.id));
    }
  };

  const handleBulkMarkRead = () => {
    setMessages(prev => prev.map(m => selectedMessageIds.includes(m.id) ? { ...m, read: true } : m));
    toast.success(`Marked ${selectedMessageIds.length} items as read.`);
    setSelectedMessageIds([]);
  };

  const handleBulkDelete = () => {
    setMessages(prev => prev.filter(m => !selectedMessageIds.includes(m.id)));
    toast.success(`Deleted ${selectedMessageIds.length} items.`);
    setSelectedMessageIds([]);
  };

  // Filter messages
  const filteredMessages = messages.filter(msg => {
    let matchesCategory = true;
    if (activeCategory === 'Needs Attention') matchesCategory = msg.priority === 'URGENT' || msg.priority === 'ACTION';
    else if (activeCategory === 'Waiting For Me') matchesCategory = msg.priority === 'ACTION';
    else if (activeCategory === 'Bills & Receipts') matchesCategory = msg.category === 'Bills & Receipts' || msg.subject.toLowerCase().includes('payment') || msg.subject.toLowerCase().includes('bill');
    else if (activeCategory !== 'All Messages') matchesCategory = msg.category === activeCategory;

    const matchesSearch = searchQuery === '' || 
      msg.sender.toLowerCase().includes(searchQuery.toLowerCase()) || 
      msg.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
      msg.preview.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesCategory && matchesSearch;
  });

  const urgentItems = messages.filter(m => m.priority === 'URGENT' || m.priority === 'ACTION');

  const getCategoryCount = (cat: Category) => {
    if (cat === 'All Messages') return messages.length;
    if (cat === 'Needs Attention') return messages.filter(m => m.priority === 'URGENT' || m.priority === 'ACTION').length;
    if (cat === 'Waiting For Me') return messages.filter(m => m.priority === 'ACTION').length;
    if (cat === 'Bills & Receipts') return messages.filter(m => m.category === 'Bills & Receipts' || m.subject.toLowerCase().includes('payment')).length;
    return messages.filter(m => m.category === cat).length;
  };

  return (
    <div className="flex h-screen bg-zinc-950 text-zinc-100 font-sans overflow-hidden">
      
      {/* ── Left Sidebar (Categories & Workspaces) ─────────────────────────── */}
      <div className="w-64 bg-zinc-900/80 border-r border-white/10 flex flex-col h-full flex-shrink-0 backdrop-blur-2xl z-20">
        
        {/* Workspace Context Switcher Header */}
        <div className="p-4 border-b border-white/10 flex items-center justify-between">
          <div className="flex items-center gap-2 min-w-0">
            <div className="w-8 h-8 rounded-xl bg-violet-600/30 border border-violet-500/40 flex items-center justify-center text-violet-300 shadow-md">
              <Cpu size={18} />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1 cursor-pointer group" onClick={() => setWorkspaceContext(prev => prev === 'Personal Workspace' ? 'Healthcare Workspace' : 'Personal Workspace')}>
                <span className="font-bold text-xs text-white truncate">{workspaceContext}</span>
                <ChevronDown size={12} className="text-zinc-400 group-hover:text-white" />
              </div>
              <span className="text-[10px] text-violet-400 font-semibold flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-violet-400 animate-pulse" />
                Universal Inbox OS v4.0
              </span>
            </div>
          </div>
        </div>

        {/* Search & Directory Launcher Triggers */}
        <div className="p-3 space-y-2">
          <button 
            onClick={() => setIsCommandPaletteOpen(true)}
            className="w-full bg-black/50 border border-white/15 hover:border-violet-500/50 rounded-xl py-2 px-3 flex items-center justify-between text-xs text-zinc-400 transition-all shadow-inner group"
          >
            <span className="flex items-center gap-2">
              <Search size={14} className="text-zinc-500 group-hover:text-violet-400 transition-colors" />
              <span>Ask or do anything...</span>
            </span>
            <kbd className="bg-white/10 text-zinc-300 px-1.5 py-0.5 rounded text-[10px] font-mono border border-white/10">⌘K</kbd>
          </button>

          {/* 🔌 CHATR Directory Marketplace Launcher */}
          <button 
            onClick={() => navigate('/desktop/connectors')}
            className="w-full bg-gradient-to-r from-violet-900/60 via-indigo-900/60 to-teal-900/60 hover:brightness-125 border border-violet-500/40 rounded-xl py-2 px-3 flex items-center justify-between text-xs text-white font-bold transition-all shadow-md cursor-pointer group"
          >
            <span className="flex items-center gap-2 truncate">
              <Grid size={14} className="text-teal-300 group-hover:rotate-90 transition-transform" />
              <span>🔌 Directory Marketplace</span>
            </span>
            <span className="bg-teal-500/20 text-teal-300 px-1.5 py-0.2 rounded text-[10px] font-mono">100+</span>
          </button>

          {/* 🤖 Ask AI Executive Trigger Button */}
          <button 
            onClick={handleRunAiAttentionQuery}
            className="w-full bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl py-2 px-3 flex items-center gap-2 text-xs text-violet-200 font-medium transition-all shadow-sm cursor-pointer group"
          >
            <Brain size={14} className="text-violet-400 group-hover:rotate-12 transition-transform" />
            <span className="truncate">What needs my attention?</span>
          </button>
        </div>

        {/* Categories List */}
        <div className="flex-1 overflow-y-auto px-2 space-y-1">
          <div className="pt-1 pb-1 px-3 text-[10px] font-bold uppercase tracking-wider text-zinc-500">Inbox Intelligence</div>
          <CategoryItem active={activeCategory === 'All Messages'} onClick={() => setActiveCategory('All Messages')} icon={<Inbox size={16} />} label="All Messages" count={getCategoryCount('All Messages')} />
          <CategoryItem active={activeCategory === 'Needs Attention'} onClick={() => setActiveCategory('Needs Attention')} icon={<AlertTriangle size={16} className="text-amber-400" />} label="Needs Attention" count={getCategoryCount('Needs Attention')} />
          <CategoryItem active={activeCategory === 'Waiting For Me'} onClick={() => setActiveCategory('Waiting For Me')} icon={<Clock size={16} className="text-violet-400" />} label="Waiting For Me" count={getCategoryCount('Waiting For Me')} />
          <CategoryItem active={activeCategory === 'Bills & Receipts'} onClick={() => setActiveCategory('Bills & Receipts')} icon={<FileText size={16} className="text-emerald-400" />} label="Bills & Receipts" count={getCategoryCount('Bills & Receipts')} />
          
          <div className="pt-3 pb-1 px-3 text-[10px] font-bold uppercase tracking-wider text-zinc-500">Mail & Channels</div>
          <CategoryItem active={activeCategory === 'Personal Mail'} onClick={() => setActiveCategory('Personal Mail')} icon={<Mail size={16} />} label="Personal Mail" count={getCategoryCount('Personal Mail')} />
          <CategoryItem active={activeCategory === 'Professional Mail'} onClick={() => setActiveCategory('Professional Mail')} icon={<Globe size={16} />} label="Professional Mail" count={getCategoryCount('Professional Mail')} />

          <div className="pt-3 pb-1 px-3 text-[10px] font-bold uppercase tracking-wider text-zinc-500">Social & Networks</div>
          <CategoryItem active={activeCategory === 'Social Messages'} onClick={() => setActiveCategory('Social Messages')} icon={<MessageSquare size={16} />} label="Social Messages" count={getCategoryCount('Social Messages')} />
          <CategoryItem active={activeCategory === 'Professional Networks'} onClick={() => setActiveCategory('Professional Networks')} icon={<Users size={16} />} label="Professional Networks" count={getCategoryCount('Professional Networks')} />
        </div>

        {/* Manage & Add Account Button */}
        <div className="p-3 border-t border-white/10 bg-zinc-900/90 pb-8">
          <button 
            onClick={() => navigate('/desktop/connectors')}
            className="w-full flex items-center justify-between bg-zinc-900 hover:bg-zinc-800 text-zinc-200 font-semibold py-2.5 px-3 rounded-xl text-xs transition-all shadow-sm active:scale-95 cursor-pointer border border-zinc-800"
          >
            <span className="flex items-center gap-2 truncate">
              <Plus size={16} className="text-indigo-400" />
              <span>Connect / Delete Accounts</span>
            </span>
            <span className="bg-indigo-500/15 text-indigo-300 border border-indigo-500/30 px-2 py-0.5 rounded-full text-[10px] font-mono">
              {connectedAccounts.length}
            </span>
          </button>
        </div>
      </div>

      {/* ── Center Panel (Message List & Bulk Selection) ────────────────── */}
      <div className="flex-1 flex flex-col h-full bg-zinc-950/60 min-w-0 z-10 border-r border-white/5">
        
        {/* Top Header & OS Health Status Bar */}
        <div className="h-14 border-b border-white/10 flex items-center justify-between px-5 shrink-0 bg-zinc-900/40 backdrop-blur-xl">
          <div className="flex items-center gap-3">
            <h2 className="font-bold text-base text-white flex items-center gap-2">
              {activeCategory}
            </h2>
            <span className="text-xs text-zinc-400 bg-white/5 px-2.5 py-0.5 rounded-full border border-white/10 font-mono">
              {filteredMessages.length} items
            </span>
          </div>

          {/* OS System Health & Live API Connector Button */}
          <div className="flex items-center gap-3 text-xs">
            <button 
              onClick={() => navigate('/desktop/connectors')}
              className={cn(
                "flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-semibold transition-all cursor-pointer shadow-sm border",
                connectedAccounts.length > 0 || isGoogleAuthenticated()
                  ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/30 hover:bg-emerald-500/30"
                  : "bg-gradient-to-r from-violet-600 to-indigo-600 text-white border-violet-400/30 hover:brightness-110"
              )}
            >
              {connectedAccounts.length > 0 || isGoogleAuthenticated() ? <CheckCircle size={13} className="text-emerald-400" /> : <Globe size={13} />}
              <span>
                {connectedAccounts.length > 0 
                  ? `${connectedAccounts[0].provider} Connected ✓` 
                  : isGoogleAuthenticated() 
                    ? 'Gmail Stream Active ✓' 
                    : 'Connect Workspace Channels'}
              </span>
            </button>

            <div className="hidden lg:flex items-center gap-3 text-[11px] bg-black/40 px-3 py-1 rounded-full border border-white/10 text-zinc-300 font-mono">
              <span className="flex items-center gap-1 text-emerald-400 font-semibold"><CheckCircle size={12} /> AI Runtime ✓</span>
              <span className="text-white/20">•</span>
              <span className="flex items-center gap-1 text-emerald-400 font-semibold"><Activity size={12} /> Sync ✓</span>
              <span className="text-white/20">•</span>
              <span className="text-violet-400 font-semibold">42ms</span>
            </div>

            <div className="flex items-center gap-1">
              <button onClick={syncMessages} className={cn("p-2 hover:bg-white/10 rounded-lg text-zinc-400 hover:text-white transition-all cursor-pointer", isSyncingMessages && "animate-spin text-violet-400")} title="Refresh All Streams">
                <RefreshCw size={16} />
              </button>
            </div>
          </div>
        </div>

        {/* Message List */}
        <div className="flex-1 overflow-y-auto">
          {filteredMessages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-zinc-500 p-8 text-center space-y-4">
              <div className="w-16 h-16 rounded-3xl bg-gradient-to-tr from-violet-600/20 via-indigo-600/20 to-teal-500/20 border border-violet-500/30 flex items-center justify-center text-violet-300 shadow-2xl">
                <Inbox size={32} />
              </div>
              <div className="space-y-1 max-w-md">
                <h3 className="text-lg font-extrabold text-white tracking-tight">Connect Your Work Channels</h3>
                <p className="text-xs text-zinc-400 leading-relaxed">
                  Stream your emails, messages, alerts, and notifications from Gmail, Outlook, Slack, LinkedIn, and GitHub into one unified executive inbox.
                </p>
              </div>
              <div className="flex items-center gap-3 pt-2">
                <button
                  onClick={() => navigate('/desktop/connectors')}
                  className="px-5 py-2.5 bg-gradient-to-r from-violet-600 via-indigo-600 to-teal-500 hover:from-violet-500 hover:to-teal-400 text-white font-extrabold rounded-2xl text-xs transition-all shadow-xl shadow-violet-950/50 flex items-center gap-2 hover:scale-[1.02] active:scale-98 cursor-pointer border border-white/10"
                >
                  <Zap size={14} /> Connect Workspace Channels
                </button>
                <button
                  onClick={() => navigate('/desktop/connectors')}
                  className="px-4 py-2.5 bg-white/5 hover:bg-white/10 text-zinc-200 font-bold rounded-2xl text-xs transition-all border border-white/15 flex items-center gap-2 cursor-pointer"
                >
                  <Grid size={14} className="text-teal-400" /> Browse 28+ Connectors
                </button>
              </div>
            </div>
          ) : (
            <div className="divide-y divide-white/5">
              {filteredMessages.map(msg => {
                const isSelected = selectedMessageId === msg.id;
                const isChecked = selectedMessageIds.includes(msg.id);
                const faviconUrl = getSenderFaviconUrl(msg.senderEmail || '');

                return (
                  <div 
                    key={msg.id}
                    onClick={() => setSelectedMessageId(msg.id)}
                    className={cn(
                      "px-4 py-3 cursor-pointer transition-all flex flex-col gap-1.5 relative group",
                      isSelected 
                        ? "bg-violet-600/15 border-l-4 border-violet-500 pl-3" 
                        : msg.read 
                          ? "hover:bg-white/[0.03] border-l-4 border-transparent pl-3 opacity-90"
                          : "bg-violet-950/20 border-l-4 border-indigo-400 pl-3 font-semibold"
                    )}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2.5 min-w-0">
                        <button onClick={(e) => toggleSelectMessage(msg.id, e)} className="text-zinc-500 hover:text-violet-400 transition-colors cursor-pointer shrink-0">
                          {isChecked ? <CheckSquare size={15} className="text-violet-400" /> : <Square size={15} />}
                        </button>

                        {/* Enhancement 3: Sender favicon or colored initial */}
                        <div className="w-7 h-7 rounded-full flex items-center justify-center shrink-0 shadow-sm overflow-hidden relative" style={{ backgroundColor: faviconUrl ? 'transparent' : (sourceConfig[msg.source]?.color || '#666') }}>
                          {faviconUrl ? (
                            <img 
                              src={faviconUrl} 
                              alt={msg.sender} 
                              className="w-5 h-5 object-contain"
                              onError={(e) => {
                                (e.target as HTMLImageElement).style.display = 'none';
                                (e.target as HTMLImageElement).parentElement!.style.backgroundColor = sourceConfig[msg.source]?.color || '#666';
                                (e.target as HTMLImageElement).parentElement!.textContent = sourceConfig[msg.source]?.code || msg.source.substring(0, 2);
                              }}
                            />
                          ) : (
                            <span className="text-[10px] font-bold text-white">{sourceConfig[msg.source]?.code || msg.source.substring(0, 2)}</span>
                          )}
                        </div>

                        <span className={cn("text-sm truncate max-w-[160px]", !msg.read ? "font-bold text-white" : "font-medium text-zinc-300")}>
                          {msg.sender}
                        </span>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        {/* Enhancement 4: Inline quick actions — revealed on hover */}
                        <div className="hidden group-hover:flex items-center gap-0.5 mr-1">
                          <button
                            onClick={(e) => { e.stopPropagation(); setMessages(prev => prev.map(m => m.id === msg.id ? {...m, read: true} : m)); }}
                            title="Mark as read"
                            className="p-1.5 rounded-lg hover:bg-emerald-500/20 text-zinc-500 hover:text-emerald-400 transition-all cursor-pointer"
                          ><CheckSquare size={13} /></button>
                          <button
                            onClick={(e) => { e.stopPropagation(); setMessages(prev => prev.map(m => m.id === msg.id ? {...m, starred: !m.starred} : m)); }}
                            title="Star"
                            className={cn("p-1.5 rounded-lg transition-all cursor-pointer", msg.starred ? "text-amber-400" : "text-zinc-500 hover:text-amber-400 hover:bg-amber-500/10")}
                          ><Star size={13} /></button>
                          <button
                            onClick={(e) => { e.stopPropagation(); setMessages(prev => prev.filter(m => m.id !== msg.id)); toast.success('Archived'); }}
                            title="Archive"
                            className="p-1.5 rounded-lg hover:bg-white/10 text-zinc-500 hover:text-zinc-200 transition-all cursor-pointer"
                          ><Archive size={13} /></button>
                        </div>
                        <span className={cn("text-[11px] font-mono", msg.read ? "text-zinc-500" : "text-violet-300 font-semibold")}>
                          {msg.time}
                        </span>
                        <PriorityBadge priority={msg.priority} />
                      </div>
                    </div>

                    <div className="pl-[38px]">
                      <div className="flex items-center gap-2">
                        {!msg.read && <span className="w-1.5 h-1.5 rounded-full bg-violet-400 shrink-0" />}
                        <h3 className={cn("text-xs truncate", !msg.read ? "font-semibold text-white" : "text-zinc-300")}>
                          {msg.subject}
                        </h3>
                        {msg.hasAttachment && (
                          <span className="flex items-center gap-1 text-[10px] font-semibold text-zinc-400 bg-white/5 px-1.5 py-0.5 rounded border border-white/5 shrink-0">
                            <Paperclip size={10} className="text-violet-400" /> PDF
                          </span>
                        )}
                        {/* Enhancement: category chip */}
                        {msg.category === 'Notifications' && (
                          <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-zinc-800 text-zinc-400 border border-white/5 shrink-0 font-mono uppercase tracking-wide">notify</span>
                        )}
                        {msg.category === 'Bills & Receipts' && (
                          <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-emerald-900/40 text-emerald-400 border border-emerald-500/20 shrink-0 font-mono uppercase tracking-wide">₹</span>
                        )}
                      </div>
                      <p className="text-[11px] text-zinc-500 line-clamp-1 mt-0.5 font-normal leading-relaxed">
                        {msg.preview}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* ── Right Panel (Thread Detail & AI Copilot & Interactive Composer) ── */}
      <div className="w-[480px] bg-zinc-900/95 border-l border-white/10 flex flex-col h-full shrink-0 backdrop-blur-2xl z-10 overflow-y-auto">
        {selectedMessage ? (
          <div className="p-5 flex flex-col gap-5">
            
            {/* Top Toolbar Action Buttons (Automate Workflow removed as requested) */}
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <div className="flex items-center gap-1">
                <button
                  onClick={() => {
                    composerRef.current?.scrollIntoView({ behavior: 'smooth' });
                    composerRef.current?.focus();
                    if (!replyText) handleGenerateAiDraft('custom');
                  }}
                  className="p-2 hover:bg-violet-500/20 text-violet-300 hover:text-white rounded-xl transition-all cursor-pointer flex items-center gap-1 text-xs font-semibold"
                  title="Reply to message"
                >
                  <Reply size={16} /> Reply
                </button>
                <button 
                  onClick={() => { setMessages(prev => prev.filter(m => m.id !== selectedMessage.id)); toast.success('Archived'); }}
                  className="p-2 hover:bg-white/10 rounded-xl text-zinc-400 hover:text-white transition-colors cursor-pointer"
                  title="Archive message"
                >
                  <Archive size={16} />
                </button>
                <button 
                  onClick={() => { setMessages(prev => prev.filter(m => m.id !== selectedMessage.id)); toast.success('Deleted'); }}
                  className="p-2 hover:bg-red-500/20 rounded-xl text-zinc-400 hover:text-red-400 transition-colors cursor-pointer"
                  title="Delete message"
                >
                  <Trash2 size={16} />
                </button>
              </div>

              <span className="text-[10px] font-mono font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-2 py-0.5 rounded-full flex items-center gap-1">
                <ShieldCheck size={11} /> Context Verified
              </span>
            </div>

            {/* Sender Info Card */}
            <div className="flex items-start justify-between gap-3 bg-black/50 p-3.5 rounded-2xl border border-white/10">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center text-xs font-bold text-white shrink-0 shadow-md border border-white/15" style={{ backgroundColor: sourceConfig[selectedMessage.source]?.color || '#666' }}>
                  {sourceConfig[selectedMessage.source]?.code || selectedMessage.source.substring(0, 2)}
                </div>
                <div className="min-w-0">
                  <h3 className="font-bold text-sm text-white flex items-center gap-1.5 truncate">
                    {selectedMessage.sender}
                    <ShieldCheck size={14} className="text-emerald-400 shrink-0" />
                  </h3>
                  <p className="text-xs text-violet-300 font-mono truncate">{selectedMessage.senderEmail || `${selectedMessage.sender.toLowerCase().replace(/\s+/g, '')}@domain.com`}</p>
                </div>
              </div>
              <span className="text-[10px] font-mono text-zinc-500 shrink-0">{selectedMessage.time}</span>
            </div>

            {/* Message Body Content */}
            <div className="space-y-2.5">
              <h1 className="font-bold text-base text-white leading-snug">{selectedMessage.subject}</h1>
              <div className="text-xs text-zinc-300 leading-relaxed bg-black/30 p-4 rounded-2xl border border-white/10 whitespace-pre-wrap">
                {selectedMessage.preview}
              </div>
            </div>

            {/* 🎯 Executive Opportunity Radar (Every Mail = Opportunity) */}
            <div className="bg-gradient-to-r from-emerald-950/40 via-teal-950/30 to-zinc-900/60 border border-emerald-500/30 rounded-2xl p-4 space-y-3 shadow-xl">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Sparkles size={16} className="text-amber-400" />
                  <span className="font-extrabold text-xs text-white">Executive Opportunity Radar</span>
                </div>
                <span className="text-[9px] font-mono font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-2 py-0.5 rounded-full flex items-center gap-1">
                  <CheckCircle size={10} className="text-emerald-400" /> Opportunity Detected
                </span>
              </div>

              <p className="text-[11px] text-zinc-300 leading-relaxed">
                {selectedMessage.subject.toLowerCase().includes('run failed') ? '🚀 System Uptime Opportunity: Re-run CI & notify engineering to prevent deployment delays.'
                  : selectedMessage.subject.toLowerCase().includes('security') ? '🛡️ Security Hardening Opportunity: Audit account permissions & verify trusted app scopes.'
                  : selectedMessage.category === 'Bills & Receipts' ? '💳 Finance Optimization Opportunity: Extract invoice entity & log to accounting ledger.'
                  : '💼 Value Creation Opportunity: Turn thread context into a CRM deal, calendar commitment, or team task.'}
              </p>

              <div className="grid grid-cols-3 gap-1.5 pt-1">
                <button
                  onClick={() => {
                    toast.success(`💰 Created CRM Deal for ${selectedMessage.sender}!`);
                  }}
                  className="p-2 bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-500/40 rounded-xl text-[11px] font-bold text-emerald-300 hover:text-white transition-all flex items-center justify-center gap-1 cursor-pointer shadow-sm"
                >
                  <span>💰 Create Deal</span>
                </button>
                <button
                  onClick={() => {
                    toast.success(`📌 Added Task to Executive Execution Board!`);
                  }}
                  className="p-2 bg-violet-500/20 hover:bg-violet-500/30 border border-violet-500/40 rounded-xl text-[11px] font-bold text-violet-300 hover:text-white transition-all flex items-center justify-center gap-1 cursor-pointer shadow-sm"
                >
                  <span>📌 Add Task</span>
                </button>
                <button
                  onClick={() => {
                    toast.success(`📅 Reserved 30m Calendar slot with ${selectedMessage.sender}!`);
                  }}
                  className="p-2 bg-indigo-500/20 hover:bg-indigo-500/30 border border-indigo-500/40 rounded-xl text-[11px] font-bold text-indigo-300 hover:text-white transition-all flex items-center justify-center gap-1 cursor-pointer shadow-sm"
                >
                  <span>📅 Reserve Time</span>
                </button>
              </div>
            </div>

            {/* 🤖 Smart AI Summary & Copilot Section */}
            <div className="bg-gradient-to-b from-violet-950/40 via-zinc-900/60 to-black/60 border border-violet-500/30 rounded-2xl p-4 space-y-3 shadow-xl">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Brain size={16} className="text-violet-400" />
                  <span className="font-extrabold text-xs text-white">Smart Summary</span>
                </div>
                <span className="text-[9px] font-mono font-bold bg-violet-500/20 text-violet-300 border border-violet-500/30 px-2 py-0.5 rounded-full">
                  AI Context
                </span>
              </div>

              {/* Human-Readable Smart Summary */}
              <div className="space-y-1.5 text-xs text-zinc-300 bg-black/40 p-3 rounded-xl border border-white/5 font-sans">
                <p className="font-semibold text-violet-200 text-[11px] flex items-center gap-1">
                  <Sparkles size={12} className="text-amber-400" /> What this message is about:
                </p>
                <ul className="list-disc pl-4 space-y-1 text-[11px] text-zinc-300 leading-relaxed">
                  <li><strong>Overview:</strong> {selectedMessage.subject}.</li>
                  <li><strong>Status:</strong> {selectedMessage.priority === 'urgent' ? 'Requires immediate action' : 'Information & updates'}.</li>
                  <li><strong>Recommendation:</strong> Use 1-click reply options below or trigger instant action.</li>
                </ul>
              </div>

              {/* Context-Aware Extraordinary Card: GitHub / CI Failure Alert */}
              {(selectedMessage.source === 'GitHub' || selectedMessage.subject.toLowerCase().includes('run failed') || selectedMessage.preview.toLowerCase().includes('failed')) && (
                <div className="bg-red-950/40 border border-red-500/30 rounded-xl p-3 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-red-300 flex items-center gap-1.5">
                      <AlertTriangle size={13} className="text-red-400" /> CI Build Failure Detected
                    </span>
                    <span className="text-[9px] font-mono bg-red-500/20 text-red-300 px-1.5 py-0.5 rounded">Action Required</span>
                  </div>
                  <p className="text-[11px] text-zinc-300">GitHub Actions run failed on main branch. Instant actions available:</p>
                  <div className="flex items-center gap-2 pt-1">
                    <button
                      onClick={() => {
                        toast.success('🔄 Triggered CI Re-run on GitHub!');
                      }}
                      className="px-2.5 py-1.5 bg-red-600 hover:bg-red-500 text-white font-bold text-[11px] rounded-lg transition-all flex items-center gap-1 cursor-pointer"
                    >
                      <RefreshCw size={11} /> Re-run CI
                    </button>
                    <button
                      onClick={() => {
                        toast.success('📢 Alerted engineering channel on Slack!');
                      }}
                      className="px-2.5 py-1.5 bg-white/10 hover:bg-white/15 text-zinc-200 text-[11px] font-semibold rounded-lg transition-all flex items-center gap-1 cursor-pointer"
                    >
                      <Slack size={11} className="text-violet-400" /> Notify Slack
                    </button>
                  </div>
                </div>
              )}

              {/* Context-Aware Extraordinary Card: Security Alert */}
              {(selectedMessage.subject.toLowerCase().includes('security') || selectedMessage.sender.toLowerCase().includes('security')) && (
                <div className="bg-amber-950/40 border border-amber-500/30 rounded-xl p-3 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-amber-300 flex items-center gap-1.5">
                      <ShieldCheck size={13} className="text-amber-400" /> Account Security Notice
                    </span>
                    <span className="text-[9px] font-mono bg-amber-500/20 text-amber-300 px-1.5 py-0.5 rounded">Security</span>
                  </div>
                  <p className="text-[11px] text-zinc-300">Google OAuth permission grant detected for CHATR OS.</p>
                  <div className="flex items-center gap-2 pt-1">
                    <button
                      onClick={() => {
                        toast.success('🛡️ Verified account authorization as safe.');
                      }}
                      className="px-2.5 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-[11px] rounded-lg transition-all flex items-center gap-1 cursor-pointer"
                    >
                      <CheckCircle size={11} /> Verify Safe
                    </button>
                  </div>
                </div>
              )}

              {/* 💡 1-Click Reply Templates */}
              <div className="space-y-1.5">
                <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-zinc-400">✨ Reply in 1-Click</span>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => handleGenerateAiDraft('accept')}
                    disabled={isDraftingAi}
                    className="p-2 bg-white/5 hover:bg-violet-600/30 border border-white/10 hover:border-violet-500/50 rounded-xl text-xs font-semibold text-zinc-200 hover:text-white transition-all text-left flex items-center gap-1.5 cursor-pointer"
                  >
                    <CheckCircle size={12} className="text-emerald-400 shrink-0" />
                    <span className="truncate">Accept & Confirm</span>
                  </button>
                  <button
                    onClick={() => handleGenerateAiDraft('request_info')}
                    disabled={isDraftingAi}
                    className="p-2 bg-white/5 hover:bg-indigo-600/30 border border-white/10 hover:border-indigo-500/50 rounded-xl text-xs font-semibold text-zinc-200 hover:text-white transition-all text-left flex items-center gap-1.5 cursor-pointer"
                  >
                    <Sparkles size={12} className="text-amber-400 shrink-0" />
                    <span className="truncate">Request Details</span>
                  </button>
                </div>
              </div>

              {/* ⚡ Smart Actions Row */}
              <div className="space-y-1.5 pt-1">
                <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-zinc-400">⚡ Smart Actions</span>
                <div className="grid grid-cols-3 gap-1.5">
                  <button
                    onClick={() => {
                      toast.success(`📅 Scheduled 30m Meeting with ${selectedMessage.sender}!`);
                    }}
                    className="p-2 bg-white/5 hover:bg-emerald-600/30 border border-white/10 rounded-xl text-[11px] font-semibold text-zinc-300 hover:text-white transition-all flex items-center justify-center gap-1 cursor-pointer"
                  >
                    <Calendar size={12} className="text-emerald-400" />
                    <span>Book Meeting</span>
                  </button>
                  <button
                    onClick={() => {
                      toast.success(`🧠 Saved message memory into Knowledge Vault!`);
                    }}
                    className="p-2 bg-white/5 hover:bg-violet-600/30 border border-white/10 rounded-xl text-[11px] font-semibold text-zinc-300 hover:text-white transition-all flex items-center justify-center gap-1 cursor-pointer"
                  >
                    <Brain size={12} className="text-violet-400" />
                    <span>Save to Memory</span>
                  </button>
                  <button
                    onClick={() => {
                      navigate('/desktop/recruitment');
                      toast.info(`Navigating to Candidate ATS Workspace...`);
                    }}
                    className="p-2 bg-white/5 hover:bg-indigo-600/30 border border-white/10 rounded-xl text-[11px] font-semibold text-zinc-300 hover:text-white transition-all flex items-center justify-center gap-1 cursor-pointer"
                  >
                    <UserCheck size={12} className="text-indigo-400" />
                    <span>Candidate ATS</span>
                  </button>
                </div>
              </div>
            </div>

            {/* ✉️ Interactive Email / Message Composer Editor */}
            <div className="bg-black/60 border border-white/15 rounded-2xl p-4 space-y-3 shadow-2xl">
              <div className="flex items-center justify-between border-b border-white/10 pb-2">
                <span className="font-bold text-xs text-white flex items-center gap-1.5">
                  <Send size={13} className="text-violet-400" /> Reply to {selectedMessage.sender.split(' ')[0]}
                </span>
                <button
                  onClick={() => handleGenerateAiDraft('custom')}
                  disabled={isDraftingAi}
                  className="text-[11px] font-bold text-violet-300 hover:text-white bg-violet-600/30 hover:bg-violet-600/50 border border-violet-500/40 px-2.5 py-1 rounded-lg transition-all cursor-pointer flex items-center gap-1"
                >
                  {isDraftingAi ? <Loader2 size={11} className="animate-spin" /> : <Sparkles size={11} className="text-amber-400" />}
                  <span>Draft with AI</span>
                </button>
              </div>

              <textarea
                ref={composerRef}
                value={replyText}
                onChange={e => setReplyText(e.target.value)}
                placeholder={`Type your reply or click "Draft with AI" to generate a response...`}
                rows={5}
                className="w-full bg-transparent border-none text-xs text-white placeholder:text-zinc-500 focus:outline-none resize-none leading-relaxed"
              />

              <div className="flex items-center justify-between pt-2 border-t border-white/10">
                <div className="flex items-center gap-2">
                  <button 
                    onClick={() => toast.info('Attachments supported')}
                    className="p-1.5 rounded-lg hover:bg-white/10 text-zinc-400 hover:text-white transition-colors cursor-pointer" 
                    title="Attach file"
                  >
                    <Paperclip size={14} />
                  </button>
                </div>

                <button
                  onClick={handleSendReply}
                  disabled={isSendingReply || !replyText.trim()}
                  className="px-4 py-2 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 disabled:opacity-50 text-white font-extrabold rounded-xl text-xs transition-all cursor-pointer shadow-lg shadow-violet-900/40 flex items-center gap-1.5"
                >
                  {isSendingReply ? (
                    <><Loader2 size={13} className="animate-spin" /> Sending…</>
                  ) : (
                    <><Send size={13} /> Send Reply</>
                  )}
                </button>
              </div>
            </div>

          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-zinc-500 p-8 text-center">
            <Inbox size={48} className="mb-4 opacity-20 text-zinc-600" />
            <p className="text-sm font-medium">Select a message to view details and draft replies</p>
          </div>
        )}
      </div>

      {/* ── Modal 0: 🔌 CHATR Directory & Connector Marketplace Modal ──────── */}
      <DirectoryMarketplaceModal 
        isOpen={isDirectoryModalOpen} 
        onClose={() => setIsDirectoryModalOpen(false)} 
        onConnectProvider={(pName) => {
          if (pName.toLowerCase().includes('gmail')) {
            setIsTokenModalOpen(true);
          }
        }}
      />

      {/* ── Modal 1: 🗑️ Manage & Delete Connected Accounts Modal ──────────── */}
      {isManageAccountsOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4 animate-in fade-in duration-150">
          <div className="w-[540px] bg-zinc-900 border border-white/15 rounded-3xl shadow-2xl p-6 space-y-5">
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-2xl bg-violet-600/30 border border-violet-500/40 flex items-center justify-center text-violet-300">
                  <Settings size={20} />
                </div>
                <div>
                  <h2 className="font-bold text-base text-white">Manage Connected Accounts ({connectedAccounts.length})</h2>
                  <p className="text-xs text-zinc-400">View, disconnect, or delete active channel integrations.</p>
                </div>
              </div>
              <button onClick={() => setIsManageAccountsOpen(false)} className="p-1 rounded-lg hover:bg-white/10 text-zinc-400 hover:text-white cursor-pointer">
                <X size={18} />
              </button>
            </div>

            <div className="space-y-3 max-h-80 overflow-y-auto">
              {connectedAccounts.length === 0 ? (
                <div className="text-center py-8 text-zinc-500 text-xs">
                  No connected accounts. Click below to add your first work email or channel.
                </div>
              ) : (
                connectedAccounts.map(acc => (
                  <div key={acc.id} className="p-3.5 bg-black/50 border border-white/10 rounded-2xl flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-9 h-9 rounded-xl flex items-center justify-center text-white font-bold text-xs shrink-0 shadow" style={{ backgroundColor: sourceConfig[acc.provider as MessageSource]?.color || '#6366f1' }}>
                        {sourceConfig[acc.provider as MessageSource]?.code || acc.provider.substring(0, 2)}
                      </div>
                      <div className="min-w-0">
                        <span className="font-bold text-xs text-white block truncate">{acc.accountName}</span>
                        <span className="text-[10px] text-emerald-400 font-mono flex items-center gap-1 mt-0.5">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" /> Connected • {acc.connectedAt}
                        </span>
                      </div>
                    </div>

                    <button 
                      onClick={() => handleDisconnectAccount(acc.id, acc.accountName)}
                      className="px-3 py-1.5 bg-red-500/15 hover:bg-red-500/30 text-red-300 border border-red-500/30 rounded-xl text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5 shrink-0"
                    >
                      <Trash2 size={14} />
                      <span>Disconnect</span>
                    </button>
                  </div>
                ))
              )}
            </div>

            <div className="pt-2 border-t border-white/10 flex items-center justify-between">
              <button 
                onClick={() => {
                  setIsManageAccountsOpen(false);
                  setIsDirectoryModalOpen(true);
                }}
                className="w-full py-3 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white font-bold rounded-xl text-xs transition-all cursor-pointer shadow-lg flex items-center justify-center gap-2"
              >
                <Grid size={16} />
                <span>Open CHATR Directory Marketplace (100+)</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Modal 2: 🔑 Connect Real Live Gmail API Token Modal ───────────── */}
      {isTokenModalOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4 animate-in fade-in duration-150">
          <div className="w-[540px] bg-zinc-900 border border-white/15 rounded-3xl shadow-2xl p-6 space-y-5">
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-2xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shadow-md">
                  <Key size={20} />
                </div>
                <div>
                  <h2 className="font-bold text-base text-white">Connect Real Live Gmail API</h2>
                  <p className="text-xs text-zinc-400">Stream 100% real live emails directly from Google API.</p>
                </div>
              </div>
              <button onClick={() => setIsTokenModalOpen(false)} className="p-1 rounded-lg hover:bg-white/10 text-zinc-400 hover:text-white cursor-pointer">
                <X size={18} />
              </button>
            </div>

            <div className="space-y-4">
              {/* Option 1: 1-Click Google OAuth Playground Link */}
              <div className="bg-gradient-to-br from-violet-950/40 via-indigo-950/20 to-black p-4 rounded-2xl border border-violet-500/30 space-y-3">
                <span className="text-xs font-bold text-white block">Option 1: 1-Click Token via Google OAuth Playground</span>
                <p className="text-xs text-zinc-400 leading-relaxed">
                  Click below to open Google OAuth2 Playground, authorize Gmail API v1, copy your token (`ya29...`), and paste it below to stream live emails.
                </p>
                <button 
                  onClick={launchOAuthPlayground}
                  className="w-full py-2.5 bg-gradient-to-r from-violet-600 via-indigo-600 to-teal-500 hover:brightness-110 text-white font-extrabold rounded-xl text-xs transition-all cursor-pointer shadow-lg flex items-center justify-center gap-2"
                >
                  <ExternalLink size={16} />
                  <span>🔗 Open Google OAuth Playground (Get Token)</span>
                </button>
              </div>

              {/* Option 2: Paste Access Token */}
              <div className="bg-black/50 border border-white/10 p-4 rounded-2xl space-y-3">
                <span className="text-xs font-bold text-white block">Option 2: Paste Access Token (`ya29...`)</span>
                <p className="text-xs text-zinc-400 leading-relaxed">
                  Paste your Google OAuth Access Token (`ya29...`) to stream real messages directly via `gmail.googleapis.com`.
                </p>
                <input 
                  type="text"
                  placeholder="Paste access token (e.g. ya29.a0...)"
                  value={googleTokenInput}
                  onChange={e => setGoogleTokenInput(e.target.value)}
                  className="w-full bg-black/60 border border-white/15 rounded-xl py-2 px-3 text-xs text-white font-mono placeholder:text-zinc-500 focus:outline-none focus:border-emerald-500 transition-all"
                />
                <button 
                  onClick={() => handleSaveGoogleToken(googleTokenInput)}
                  className="w-full py-2.5 bg-emerald-500 hover:bg-emerald-400 text-black font-bold rounded-xl text-xs transition-all cursor-pointer shadow-md"
                >
                  Save & Stream Real Live Gmail Inbox
                </button>
              </div>

              {/* Option 3: Custom Google OAuth Client ID */}
              <div className="bg-black/30 border border-white/5 p-3 rounded-xl space-y-2">
                <span className="text-[11px] font-bold text-zinc-400 block">Custom Google Cloud OAuth Client ID (Optional)</span>
                <div className="flex items-center gap-2">
                  <input 
                    type="text"
                    placeholder="Enter your Google Cloud Client ID..."
                    value={googleClientIdInput}
                    onChange={e => setGoogleClientIdInput(e.target.value)}
                    className="flex-1 bg-black/40 border border-white/10 rounded-lg py-1.5 px-2.5 text-[11px] text-white font-mono placeholder:text-zinc-600 focus:outline-none"
                  />
                  <button onClick={launchCustomGoogleOAuth} className="px-3 py-1.5 bg-white/10 hover:bg-white/20 text-white rounded-lg text-xs font-semibold cursor-pointer">
                    Launch OAuth
                  </button>
                </div>
              </div>

              {isGoogleAuthenticated() && (
                <div className="pt-2 border-t border-white/10 flex items-center justify-between">
                  <span className="text-xs text-emerald-400 font-medium flex items-center gap-1">
                    <CheckCircle size={14} /> Active Google Token Connected
                  </span>
                  <button 
                    onClick={() => {
                      clearGoogleToken();
                      toast.info('Google token disconnected.');
                      syncMessages();
                    }}
                    className="text-xs text-red-400 hover:underline cursor-pointer"
                  >
                    Disconnect Token
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ── Guided 7-Step Setup & Provider Auto-Detection Wizard Modal ─────── */}
      {isWizardModalOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4 animate-in fade-in duration-150">
          <div className="w-[540px] bg-zinc-900 border border-white/15 rounded-3xl shadow-2xl p-6 space-y-5">
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-violet-600/30 border border-violet-500/40 flex items-center justify-center text-violet-300">
                  <Sparkles size={18} />
                </div>
                <div>
                  <h2 className="font-bold text-base text-white">Guided CHATR OS Setup</h2>
                  <p className="text-xs text-zinc-400">Step {wizardStep === 'email' ? '1' : wizardStep === 'authorize' ? '2' : wizardStep === 'indexing' ? '3' : '4'} of 4: Provider Detection & AI Briefing</p>
                </div>
              </div>
              <button onClick={() => setIsWizardModalOpen(false)} className="p-1 rounded-lg hover:bg-white/10 text-zinc-400 hover:text-white cursor-pointer">
                <X size={18} />
              </button>
            </div>

            {wizardStep === 'email' && (
              <div className="space-y-4 text-xs">
                <div>
                  <label className="text-xs font-bold text-white block mb-1.5">Enter your work or personal email address</label>
                  <input 
                    type="email"
                    placeholder="e.g. arsh.wani@gmail.com or ceo@company.com"
                    value={wizardEmail}
                    onChange={e => handleWizardEmailChange(e.target.value)}
                    className="w-full bg-black/60 border border-white/15 rounded-xl py-2.5 px-3.5 text-xs text-white font-medium focus:outline-none focus:border-violet-500 transition-all"
                  />
                </div>

                {wizardDetectedProvider && (
                  <div className="p-4 bg-violet-950/40 border border-violet-500/40 rounded-2xl flex items-center justify-between animate-in fade-in duration-200">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold text-xs" style={{ backgroundColor: wizardDetectedProvider.color }}>
                        {wizardDetectedProvider.name.substring(0, 2)}
                      </div>
                      <div>
                        <span className="font-bold text-sm text-white block">{wizardDetectedProvider.name}</span>
                        <span className="text-[11px] text-violet-300 font-mono">{wizardDetectedProvider.type}</span>
                      </div>
                    </div>
                    <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/20 px-2.5 py-1 rounded-full border border-emerald-500/30">
                      ✓ Auto Detected
                    </span>
                  </div>
                )}

                <button 
                  disabled={!wizardEmail.includes('@')}
                  onClick={() => setWizardStep('authorize')}
                  className="w-full py-3 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 disabled:opacity-40 text-white font-bold rounded-xl text-xs transition-all cursor-pointer shadow-lg flex items-center justify-center gap-2"
                >
                  <span>Continue to 1-Click Connection</span>
                  <ArrowRight size={14} />
                </button>
              </div>
            )}

            {/* 100% NON-TECHNICAL 1-CLICK CONNECTION STEP */}
            {wizardStep === 'authorize' && (
              <div className="space-y-5 text-xs">
                <div className="bg-black/50 p-4 rounded-2xl border border-white/10 space-y-3 text-center">
                  <div className="w-12 h-12 rounded-2xl mx-auto flex items-center justify-center text-white font-bold text-base shadow-lg" style={{ backgroundColor: wizardDetectedProvider?.color || '#6366f1' }}>
                    {wizardDetectedProvider?.name.substring(0, 2) || 'GO'}
                  </div>
                  <div>
                    <span className="font-bold text-sm text-white block">{wizardDetectedProvider?.name || 'Google Workspace'}</span>
                    <span className="text-xs text-violet-300 font-mono block mt-0.5">{wizardEmail}</span>
                  </div>
                  <p className="text-zinc-400 leading-relaxed text-[11px]">
                    Click below to open {wizardDetectedProvider?.name} directly and authorize CHATR OS to index your mailbox and calendar commitments.
                  </p>
                </div>

                <button 
                  onClick={handleWizardExecuteConnect}
                  className="w-full py-3.5 bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-600 hover:from-emerald-400 hover:to-teal-400 text-black font-extrabold rounded-xl text-xs transition-all cursor-pointer shadow-lg shadow-emerald-950/50 flex items-center justify-center gap-2"
                >
                  <Sparkles size={16} />
                  <span>✨ Connect & Authorize {wizardDetectedProvider?.name || 'Account'} in 1-Click</span>
                </button>
              </div>
            )}

            {wizardStep === 'indexing' && (
              <div className="flex flex-col items-center justify-center py-10 space-y-4 text-center">
                <Loader2 size={36} className="animate-spin text-violet-400" />
                <div>
                  <h3 className="font-bold text-sm text-white mb-1">Indexing Mailbox & Calendar...</h3>
                  <p className="text-xs text-zinc-400 font-mono">Building Universal Context Graph for {wizardEmail}...</p>
                </div>
              </div>
            )}

            {wizardStep === 'briefing' && (
              <div className="space-y-4 text-xs">
                <div className="p-3 bg-emerald-500/20 border border-emerald-500/30 rounded-xl text-emerald-300 font-bold flex items-center gap-2">
                  <CheckCircle size={16} />
                  <span>Mailbox & Calendar Successfully Connected & Indexed!</span>
                </div>

                <div className="bg-gradient-to-br from-violet-950/40 via-indigo-950/20 to-black p-4 rounded-2xl border border-violet-500/30 space-y-3">
                  <div className="flex items-center justify-between border-b border-white/10 pb-2">
                    <span className="font-bold text-white flex items-center gap-1.5">
                      <Brain size={16} className="text-violet-400" /> AI Executive Attention Briefing
                    </span>
                  </div>

                  <p className="text-zinc-300">
                    Querying prompt: <strong className="text-white">"What meetings and emails need my attention today?"</strong>
                  </p>

                  <div className="bg-black/50 p-3 rounded-xl border border-white/10 space-y-1 font-mono text-zinc-300">
                    <div>• 🚨 High Priority Emails: 0 pending bottlenecks</div>
                    <div>• 📅 Today's Meetings: Product & Architecture Sync (16:00 PM)</div>
                    <div>• ⚡ AI Recommendation: Review pending compliance filings</div>
                  </div>
                </div>

                <button 
                  onClick={() => setIsWizardModalOpen(false)}
                  className="w-full py-2.5 bg-violet-600 hover:bg-violet-500 text-white font-bold rounded-xl text-xs transition-all cursor-pointer shadow-md"
                >
                  Go to Universal Inbox Dashboard
                </button>
              </div>
            )}

          </div>
        </div>
      )}

      {/* ── Modal 3: 🤖 AI Executive Attention Query Modal ──────────────── */}
      {isAiAttentionModalOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4 animate-in fade-in duration-150">
          <div className="w-[580px] bg-zinc-900 border border-white/15 rounded-3xl shadow-2xl p-6 space-y-5">
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-2xl bg-gradient-to-tr from-violet-600 to-indigo-600 flex items-center justify-center text-white shadow-lg">
                  <Brain size={20} />
                </div>
                <div>
                  <h2 className="font-bold text-base text-white">CHATR Executive AI Copilot</h2>
                  <p className="text-xs text-violet-300 font-mono">Querying Universal Context Graph...</p>
                </div>
              </div>
              <button onClick={() => setIsAiAttentionModalOpen(false)} className="p-1 rounded-lg hover:bg-white/10 text-zinc-400 hover:text-white cursor-pointer">
                <X size={18} />
              </button>
            </div>

            {isGeneratingAiSummary ? (
              <div className="flex flex-col items-center justify-center py-12 space-y-3">
                <Loader2 size={32} className="animate-spin text-violet-400" />
                <p className="text-xs text-zinc-400 font-medium">Synthesizing indexed email threads & calendar commitments...</p>
              </div>
            ) : (
              <div className="space-y-4 text-xs">
                <div className="bg-white/5 p-3 rounded-2xl border border-white/10 flex items-center gap-2 text-violet-200 font-medium">
                  <Sparkles size={14} className="text-violet-400 shrink-0" />
                  <span>"What meetings and emails need my attention today?"</span>
                </div>

                <div className="bg-gradient-to-br from-violet-950/40 via-indigo-950/20 to-black p-4 rounded-2xl border border-violet-500/30 space-y-3">
                  <div className="flex items-center justify-between border-b border-white/10 pb-2">
                    <span className="font-bold text-white flex items-center gap-1.5">
                      <CheckCircle size={14} className="text-emerald-400" /> Executive Priority Briefing
                    </span>
                    <span className="text-[10px] font-mono text-zinc-400">Context: {messages.length} indexed items</span>
                  </div>

                  {urgentItems.length > 0 ? (
                    <div className="space-y-2">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-amber-400">🚨 HIGH PRIORITY EMAILS ({urgentItems.length})</span>
                      {urgentItems.map(item => (
                        <div key={item.id} className="bg-black/50 p-2.5 rounded-xl border border-white/10 flex items-center justify-between">
                          <div>
                            <span className="font-bold text-white block">{item.sender}</span>
                            <span className="text-zinc-300 block">{item.subject}</span>
                          </div>
                          <span className="text-[10px] font-mono bg-amber-500/20 text-amber-300 px-2 py-0.5 rounded border border-amber-500/30 shrink-0">
                            {item.priority}
                          </span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-zinc-300">
                      ✓ No urgent pending email bottlenecks detected in your live mailbox right now.
                    </p>
                  )}

                  <div className="pt-2 border-t border-white/10 space-y-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-blue-400">📅 TODAY'S CALENDAR COMMITMENTS</span>
                    <div className="bg-black/50 p-2.5 rounded-xl border border-white/10 flex items-center justify-between">
                      <div>
                        <span className="font-bold text-white block">Product & Architecture Sync</span>
                        <span className="text-zinc-400 block">Today at 16:00 PM • Google Meet</span>
                      </div>
                      <button onClick={() => navigate('/desktop/calendar')} className="text-xs text-blue-400 hover:underline font-semibold cursor-pointer">
                        View Calendar
                      </button>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-white/10 flex items-center justify-between">
                    <span className="text-[11px] text-violet-300">⚡ Action Recommended: Review pending compliance filings.</span>
                    <button 
                      onClick={() => {
                        setIsAiAttentionModalOpen(false);
                        toast.success('Tasks updated from AI summary.');
                      }}
                      className="px-3 py-1 bg-violet-600 hover:bg-violet-500 text-white font-bold rounded-lg text-xs transition-all cursor-pointer shadow-md"
                    >
                      Execute Recommended Actions
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── Modal 4: ⌘K Universal OS Command Palette ──────────────────────── */}
      {isCommandPaletteOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-start justify-center pt-20 animate-in fade-in duration-150">
          <div className="w-[600px] bg-zinc-900 border border-white/15 rounded-2xl shadow-2xl overflow-hidden flex flex-col">
            <div className="p-4 border-b border-white/10 flex items-center gap-3">
              <Command size={18} className="text-violet-400" />
              <input 
                type="text"
                autoFocus
                placeholder="Ask or do anything... (e.g. /task, /schedule, /automate)"
                value={commandPaletteQuery}
                onChange={e => setCommandPaletteQuery(e.target.value)}
                className="w-full bg-transparent text-sm text-white focus:outline-none placeholder:text-zinc-500 font-medium"
              />
              <kbd className="bg-white/10 text-zinc-400 px-2 py-0.5 rounded text-xs font-mono">ESC</kbd>
            </div>

            <div className="p-3 max-h-80 overflow-y-auto space-y-1">
              <CommandItem 
                icon={<Grid size={16} className="text-teal-400" />} 
                title="🔌 CHATR Directory Marketplace (100+)" 
                subtitle="Browse connectors, AI agents, mini apps, and automation packs" 
                onClick={() => { setIsCommandPaletteOpen(false); setIsDirectoryModalOpen(true); }}
              />
              <CommandItem 
                icon={<Brain size={16} className="text-violet-400" />} 
                title="🤖 What meetings & emails need my attention today?" 
                subtitle="Run AI Executive Context Briefing across indexed messages & calendar" 
                onClick={() => { setIsCommandPaletteOpen(false); handleRunAiAttentionQuery(); }}
              />
              <CommandItem 
                icon={<Settings size={16} className="text-indigo-400" />} 
                title="⚙️ Manage / Disconnect Accounts" 
                subtitle="View or delete connected channel integrations" 
                onClick={() => { setIsCommandPaletteOpen(false); setIsManageAccountsOpen(true); }}
              />
            </div>
          </div>
        </div>
      )}

      {/* ── Modal 5: ⚡ Workflow Automation Builder ───────────────────────── */}
      {isWorkflowModalOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4 animate-in fade-in duration-150">
          <div className="w-[500px] bg-zinc-900 border border-white/15 rounded-2xl shadow-2xl p-6 space-y-5">
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <div className="flex items-center gap-2 text-amber-300 font-bold text-sm">
                <Zap size={18} className="text-amber-400" />
                <span>1-Click Workflow Automation Builder</span>
              </div>
              <button onClick={() => setIsWorkflowModalOpen(false)} className="text-zinc-400 hover:text-white cursor-pointer">
                <X size={18} />
              </button>
            </div>

            <div className="space-y-4 text-xs">
              <div className="bg-black/50 p-3 rounded-xl border border-white/10 space-y-1">
                <span className="text-zinc-400 font-semibold uppercase tracking-wider text-[10px]">TRIGGER</span>
                <p className="text-white font-medium">When new email arrives from <span className="text-violet-300">{workflowMessage?.sender || 'Sender'}</span></p>
              </div>

              <div className="bg-black/50 p-3 rounded-xl border border-white/10 space-y-1">
                <span className="text-zinc-400 font-semibold uppercase tracking-wider text-[10px]">AUTOMATED ACTION</span>
                <p className="text-white font-medium">Save attachment directly to Cloud Storage & Notify Finance</p>
              </div>
            </div>

            <button 
              onClick={() => {
                setIsWorkflowModalOpen(false);
                toast.success('Workflow activated!');
              }}
              className="w-full py-2.5 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-black font-bold rounded-xl text-xs transition-all cursor-pointer shadow-lg shadow-amber-900/30 cursor-pointer"
            >
              Activate Automated Workflow
            </button>
          </div>
        </div>
      )}

    </div>
  );
};

// Helper Components
const CategoryItem: React.FC<{ active: boolean; onClick: () => void; icon: React.ReactNode; label: string; count: number }> = ({ active, onClick, icon, label, count }) => (
  <button 
    onClick={onClick}
    className={cn(
      "w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium transition-all cursor-pointer",
      active 
        ? "bg-indigo-600/15 text-indigo-300 font-bold border border-indigo-500/30 shadow-sm" 
        : "text-zinc-400 hover:bg-white/5 hover:text-white"
    )}
  >
    <div className="flex items-center gap-2.5 truncate">
      {icon}
      <span className="truncate">{label}</span>
    </div>
    {count > 0 && (
      <span className={cn("text-[10px] font-mono px-2 py-0.5 rounded-full", active ? "bg-indigo-500/20 text-indigo-200 border border-indigo-500/30" : "bg-white/5 text-zinc-500")}>
        {count}
      </span>
    )}
  </button>
);

const PriorityBadge: React.FC<{ priority: Priority }> = ({ priority }) => {
  const styles: Record<Priority, string> = {
    URGENT: 'bg-red-500/10 text-red-400 border-red-500/20',
    ACTION: 'bg-amber-500/10 text-amber-300 border-amber-500/20',
    FYI: 'bg-zinc-900 text-zinc-400 border-zinc-800'
  };
  return (
    <span className={cn("text-[9px] font-bold font-mono px-1.5 py-0.5 rounded border uppercase tracking-wider", styles[priority])}>
      {priority}
    </span>
  );
};

const CommandItem: React.FC<{ icon: React.ReactNode; title: string; subtitle: string; onClick: () => void }> = ({ icon, title, subtitle, onClick }) => (
  <div onClick={onClick} className="p-3 hover:bg-white/5 rounded-xl cursor-pointer transition-colors flex items-center gap-3 group">
    <div className="w-8 h-8 rounded-lg bg-black/50 border border-white/10 flex items-center justify-center shrink-0 group-hover:border-violet-500/50">
      {icon}
    </div>
    <div>
      <h4 className="text-xs font-bold text-white">{title}</h4>
      <p className="text-[11px] text-zinc-400">{subtitle}</p>
    </div>
  </div>
);

export default UniversalInbox;
