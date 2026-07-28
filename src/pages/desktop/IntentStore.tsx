import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Search, Star, CheckCircle, Code, TrendingUp, Users, FileText, Zap,
  Globe, Database, Shield, ArrowRight, X, Building2, Phone,
  ChevronRight, Lock, Clock, IndianRupee, Layers, Bot, Mail, BarChart2,
  UserCheck, Plane, HeartPulse, Scale, Store, Cpu, BadgeCheck,
  Workflow, PlusCircle, Loader2, Sparkles, Send, FolderKanban,
  LayoutDashboard, Inbox, Calendar, GitBranch, BarChart, Settings,
  Slack, Github, ChevronDown, AlertCircle, Package, Activity
} from 'lucide-react';
import { useInstalledModules, InstalledModule } from '@/hooks/useInstalledModules';
import { supabase } from '@/integrations/supabase/client';
import { deployCapability, uninstallCapability } from '@/core/os/deployCapability';

/* ─── Types ─────────────────────────────────────────────────────────── */
type TabId = 'featured' | 'agents' | 'workflows' | 'connectors' | 'templates' | 'enterprise' | 'developer' | 'installed';
type PriceModel = 'Free' | 'Premium' | 'Pay-per-use' | 'Enterprise' | 'Revenue Share';

interface DeployStep { label: string; detail: string; }

interface IntentCapability {
  id: string;
  name: string;
  creator: string;
  description: string;
  rating: number;
  reviews: number;
  category: string;
  priceModel: PriceModel;
  priceLabel: string;
  icon: React.ReactNode;
  verified: boolean;
  privacyLevel: 'High' | 'Standard';
  dataResidency: string;
  aiModel: string;
  estimatedTime: string;
  permissions: string[];
  deploySteps: DeployStep[];
  tags?: string[];
  workspacePath: string;
  workspaceStructure: { icon: React.ReactNode; label: string; }[];
  moduleId: string;
  moduleColor: string;
  moduleLucideIcon: string;
}

/* ─── Capability Definitions ─────────────────────────────────────────── */

const AGENTS: IntentCapability[] = [
  {
    id: 'a1', moduleId: 'recruitment', moduleColor: 'blue', moduleLucideIcon: 'Users',
    name: 'RecruitmentOS Agent', creator: 'CHATR Core',
    description: 'End-to-end talent acquisition. Sources candidates from LinkedIn & GitHub, runs AI screening, schedules interviews and drafts offer letters.',
    rating: 4.9, reviews: 1248, category: 'HR & Recruitment', priceModel: 'Free', priceLabel: 'Free',
    icon: <Users className="w-6 h-6" />, verified: true,
    privacyLevel: 'High', dataResidency: 'India / EU', aiModel: 'Gemini 1.5 Pro',
    estimatedTime: '2–10 min/task', permissions: ['Calendar', 'Email', 'LinkedIn', 'Files'],
    deploySteps: [
      { label: 'Creating Recruitment Workspace', detail: 'Initialising dedicated workspace…' },
      { label: 'Installing RecruitmentOS Agent', detail: 'Loading AI model and agent runtime…' },
      { label: 'Connecting Gmail & Calendar', detail: 'OAuth handshake in progress…' },
      { label: 'Creating ATS Database', detail: 'Setting up candidate pipeline schema…' },
      { label: 'Building Candidate Pipeline', detail: 'Generating stages: Applied → Screening → Interview → Offer…' },
      { label: 'Creating Recruitment Dashboard', detail: 'Configuring KPI widgets and metrics…' },
      { label: 'Setting up Smart Inbox', detail: 'Filtering recruitment emails…' },
      { label: 'Installing Screening Workflows', detail: 'Deploying 6 automated workflows…' },
    ],
    workspaceStructure: [
      { icon: <LayoutDashboard className="w-3.5 h-3.5" />, label: 'Dashboard' },
      { icon: <Bot className="w-3.5 h-3.5" />, label: 'AI Recruiter' },
      { icon: <Inbox className="w-3.5 h-3.5" />, label: 'Candidate Inbox' },
      { icon: <Calendar className="w-3.5 h-3.5" />, label: 'Interviews' },
      { icon: <FolderKanban className="w-3.5 h-3.5" />, label: 'Jobs Board' },
      { icon: <Users className="w-3.5 h-3.5" />, label: 'Talent Pool' },
      { icon: <BarChart className="w-3.5 h-3.5" />, label: 'Analytics' },
      { icon: <Settings className="w-3.5 h-3.5" />, label: 'Settings' },
    ],
    workspacePath: '/desktop/recruitment', tags: ['HR', 'Recruitment', 'ATS'],
  },
  {
    id: 'a2', moduleId: 'legal', moduleColor: 'slate', moduleLucideIcon: 'Scale',
    name: 'Legal Contract Reviewer', creator: 'LexAI Partners',
    description: 'Reads NDAs, MSAs and employment contracts. Highlights liabilities, non-standard clauses and risk areas.',
    rating: 4.7, reviews: 892, category: 'Legal', priceModel: 'Premium', priceLabel: '₹4,999/mo',
    icon: <Scale className="w-6 h-6" />, verified: true,
    privacyLevel: 'High', dataResidency: 'India Only', aiModel: 'Claude 3.5 Sonnet',
    estimatedTime: '3–8 min/contract', permissions: ['Documents', 'Files'],
    deploySteps: [
      { label: 'Installing Legal Agent', detail: 'Loading contract review model…' },
      { label: 'Connecting Document Storage', detail: 'Linking your Files vault…' },
      { label: 'Configuring Review Templates', detail: 'Loading NDA, MSA, Employment templates…' },
      { label: 'Setting up Risk Alerts', detail: 'Configuring liability detection rules…' },
    ],
    workspaceStructure: [
      { icon: <LayoutDashboard className="w-3.5 h-3.5" />, label: 'Dashboard' },
      { icon: <Bot className="w-3.5 h-3.5" />, label: 'AI Reviewer' },
      { icon: <FileText className="w-3.5 h-3.5" />, label: 'Contracts' },
      { icon: <Shield className="w-3.5 h-3.5" />, label: 'Risk Alerts' },
    ],
    workspacePath: '/desktop/business-os', tags: ['Legal', 'Contracts', 'Risk'],
  },
  {
    id: 'a3', moduleId: 'sales', moduleColor: 'emerald', moduleLucideIcon: 'TrendingUp',
    name: 'Sales Intelligence Agent', creator: 'CHATR Core',
    description: 'Analyzes your CRM pipeline, identifies warm leads, drafts outreach sequences and surfaces deal-winning intelligence.',
    rating: 4.8, reviews: 673, category: 'Sales', priceModel: 'Premium', priceLabel: '₹3,499/mo',
    icon: <TrendingUp className="w-6 h-6" />, verified: true,
    privacyLevel: 'Standard', dataResidency: 'Global', aiModel: 'GPT-4o',
    estimatedTime: '1–3 min/lead', permissions: ['CRM', 'Email', 'Calendar'],
    deploySteps: [
      { label: 'Creating Sales Workspace', detail: 'Initialising CRM environment…' },
      { label: 'Connecting CRM Data', detail: 'Importing existing pipeline…' },
      { label: 'Configuring Lead Scoring', detail: 'Training on your historical deals…' },
      { label: 'Building Outreach Sequences', detail: 'Creating 5 email cadences…' },
      { label: 'Enabling Deal Intelligence', detail: 'Activating win/loss analysis…' },
    ],
    workspaceStructure: [
      { icon: <LayoutDashboard className="w-3.5 h-3.5" />, label: 'Pipeline' },
      { icon: <Bot className="w-3.5 h-3.5" />, label: 'AI Sales Agent' },
      { icon: <Users className="w-3.5 h-3.5" />, label: 'Leads' },
      { icon: <Mail className="w-3.5 h-3.5" />, label: 'Outreach' },
      { icon: <BarChart className="w-3.5 h-3.5" />, label: 'Analytics' },
    ],
    workspacePath: '/desktop/pro/business', tags: ['Sales', 'CRM', 'Lead Gen'],
  },
  {
    id: 'a4', moduleId: 'finance', moduleColor: 'amber', moduleLucideIcon: 'IndianRupee',
    name: 'Finance & Accounting Agent', creator: 'CHATR Core',
    description: 'Automates invoice processing, GST reminders, expense approvals and financial reporting.',
    rating: 4.8, reviews: 521, category: 'Finance', priceModel: 'Free', priceLabel: 'Free',
    icon: <IndianRupee className="w-6 h-6" />, verified: true,
    privacyLevel: 'High', dataResidency: 'India Only', aiModel: 'Gemini 1.5 Flash',
    estimatedTime: '1–5 min/invoice', permissions: ['Finance', 'Email', 'Files'],
    deploySteps: [
      { label: 'Creating Finance Workspace', detail: 'Initialising accounting environment…' },
      { label: 'Connecting Accounting System', detail: 'Linking existing data…' },
      { label: 'Configuring Tax Rules', detail: 'Setting up GST, TDS rules for India…' },
      { label: 'Building Approval Workflows', detail: 'Multi-level invoice approval ready…' },
      { label: 'Enabling Anomaly Detection', detail: 'AI risk monitoring activated…' },
    ],
    workspaceStructure: [
      { icon: <LayoutDashboard className="w-3.5 h-3.5" />, label: 'Dashboard' },
      { icon: <FileText className="w-3.5 h-3.5" />, label: 'Invoices' },
      { icon: <GitBranch className="w-3.5 h-3.5" />, label: 'Approvals' },
      { icon: <BarChart className="w-3.5 h-3.5" />, label: 'Reports' },
    ],
    workspacePath: '/desktop/business-os', tags: ['Finance', 'Accounting', 'GST'],
  },
  {
    id: 'a5', moduleId: 'healthcare', moduleColor: 'red', moduleLucideIcon: 'HeartPulse',
    name: 'Medical Triage Assistant', creator: 'HealthTech Solutions',
    description: 'HIPAA-compliant agent that conducts preliminary patient symptom screening, routes cases by urgency and updates EMR systems.',
    rating: 4.6, reviews: 334, category: 'Healthcare', priceModel: 'Pay-per-use', priceLabel: '₹50/session',
    icon: <HeartPulse className="w-6 h-6" />, verified: true,
    privacyLevel: 'High', dataResidency: 'India Only', aiModel: 'Custom Medical LLM',
    estimatedTime: '3–5 min/patient', permissions: ['Patient Records', 'Messaging'],
    deploySteps: [
      { label: 'HIPAA Compliance Onboarding', detail: 'Verifying data residency and encryption…' },
      { label: 'Installing Triage Agent', detail: 'Loading medical symptom model…' },
      { label: 'Connecting EMR System', detail: 'Establishing secure EMR link…' },
      { label: 'Configuring Triage Rules', detail: 'Setting urgency thresholds…' },
    ],
    workspaceStructure: [
      { icon: <LayoutDashboard className="w-3.5 h-3.5" />, label: 'Patient Queue' },
      { icon: <Bot className="w-3.5 h-3.5" />, label: 'Triage Agent' },
      { icon: <FileText className="w-3.5 h-3.5" />, label: 'Medical Records' },
      { icon: <Shield className="w-3.5 h-3.5" />, label: 'Compliance' },
    ],
    workspacePath: '/desktop/ai-agents', tags: ['Healthcare', 'HIPAA', 'Triage'],
  },
];

const TEMPLATES: IntentCapability[] = [
  {
    id: 't1', moduleId: 'startup', moduleColor: 'violet', moduleLucideIcon: 'Zap',
    name: 'Startup Workspace', creator: 'CHATR Core',
    description: 'Everything a startup needs from day one. CRM, recruitment, finance, project management and AI tools — deployed in 5 minutes.',
    rating: 4.9, reviews: 2100, category: 'Startup', priceModel: 'Free', priceLabel: 'Free',
    icon: <Zap className="w-6 h-6" />, verified: true,
    privacyLevel: 'Standard', dataResidency: 'India / Global', aiModel: 'Multiple',
    estimatedTime: 'Deploy in 5 min', permissions: ['Email', 'Calendar', 'CRM'],
    deploySteps: [
      { label: 'Creating Startup Workspace', detail: 'Initialising OS environment…' },
      { label: 'Installing 4 Core Agents', detail: 'Sales · HR · Finance · Marketing agents…' },
      { label: 'Connecting Gmail & Calendar', detail: 'OAuth authentication…' },
      { label: 'Building CRM Pipeline', detail: 'Lead → Qualified → Proposal → Closed…' },
      { label: 'Creating Finance Module', detail: 'Invoicing, expenses, reporting…' },
      { label: 'Setting up Project Board', detail: 'Kanban boards and sprint tracking…' },
      { label: 'Installing 8 Workflows', detail: 'Onboarding, lead follow-up, invoice approval…' },
      { label: 'Building Analytics Dashboard', detail: 'Revenue, headcount, pipeline metrics…' },
    ],
    workspaceStructure: [
      { icon: <LayoutDashboard className="w-3.5 h-3.5" />, label: 'Command Centre' },
      { icon: <TrendingUp className="w-3.5 h-3.5" />, label: 'Sales CRM' },
      { icon: <Users className="w-3.5 h-3.5" />, label: 'Recruitment' },
      { icon: <IndianRupee className="w-3.5 h-3.5" />, label: 'Finance' },
      { icon: <FolderKanban className="w-3.5 h-3.5" />, label: 'Projects' },
      { icon: <Bot className="w-3.5 h-3.5" />, label: 'AI Agents' },
      { icon: <BarChart className="w-3.5 h-3.5" />, label: 'Analytics' },
      { icon: <Settings className="w-3.5 h-3.5" />, label: 'Settings' },
    ],
    workspacePath: '/desktop/home', tags: ['Startup', 'All-in-one'],
  },
  {
    id: 't2', moduleId: 'lawfirm', moduleColor: 'slate', moduleLucideIcon: 'Scale',
    name: 'Law Firm OS', creator: 'LexAI Partners',
    description: 'Complete legal operations. Contract review, client intake, billing, compliance and matter management — live in 30 minutes.',
    rating: 4.8, reviews: 543, category: 'Legal', priceModel: 'Enterprise', priceLabel: 'From ₹24,999/mo',
    icon: <Scale className="w-6 h-6" />, verified: true,
    privacyLevel: 'High', dataResidency: 'India Only', aiModel: 'Claude 3.5 Sonnet',
    estimatedTime: 'Deploy in 30 min', permissions: ['Files', 'Email', 'Billing'],
    deploySteps: [
      { label: 'Creating Law Firm Workspace', detail: 'Initialising legal OS environment…' },
      { label: 'Installing Legal Contract Agent', detail: 'Loading NDA, MSA, SLA review model…' },
      { label: 'Configuring Matter Management', detail: 'Setting up client and case schema…' },
      { label: 'Building Client CRM', detail: 'Intake forms, contacts, timeline…' },
      { label: 'Setting up Billing Pipeline', detail: 'Hourly billing and retainer workflows…' },
      { label: 'Creating Document Vault', detail: 'Encrypted document storage…' },
      { label: 'Enabling Compliance Alerts', detail: 'Deadline and regulatory tracking…' },
    ],
    workspaceStructure: [
      { icon: <LayoutDashboard className="w-3.5 h-3.5" />, label: 'Dashboard' },
      { icon: <Bot className="w-3.5 h-3.5" />, label: 'Legal Agent' },
      { icon: <FileText className="w-3.5 h-3.5" />, label: 'Contract Review' },
      { icon: <Users className="w-3.5 h-3.5" />, label: 'Client CRM' },
      { icon: <IndianRupee className="w-3.5 h-3.5" />, label: 'Billing' },
      { icon: <Database className="w-3.5 h-3.5" />, label: 'Knowledge Base' },
      { icon: <Calendar className="w-3.5 h-3.5" />, label: 'Calendar' },
      { icon: <Lock className="w-3.5 h-3.5" />, label: 'Document Vault' },
    ],
    workspacePath: '/desktop/business-os', tags: ['Legal', 'Enterprise'],
  },
  {
    id: 't3', moduleId: 'recruitment-agency', moduleColor: 'blue', moduleLucideIcon: 'Users',
    name: 'Recruitment Agency', creator: 'CHATR Core',
    description: 'Full-stack ATS, candidate pipeline, client management and revenue tracking for recruitment agencies.',
    rating: 4.9, reviews: 876, category: 'HR', priceModel: 'Premium', priceLabel: '₹12,999/mo',
    icon: <Users className="w-6 h-6" />, verified: true,
    privacyLevel: 'High', dataResidency: 'India / EU', aiModel: 'Gemini 1.5 Pro',
    estimatedTime: 'Deploy in 15 min', permissions: ['LinkedIn', 'Email', 'Calendar', 'CRM'],
    deploySteps: [
      { label: 'Creating Agency Workspace', detail: 'Initialising multi-client environment…' },
      { label: 'Installing RecruitmentOS Agent', detail: 'AI sourcing and screening agent…' },
      { label: 'Connecting LinkedIn & Job Boards', detail: 'Authenticating data sources…' },
      { label: 'Building Client Portal', detail: 'Hiring manager dashboards…' },
      { label: 'Creating Candidate Pipeline', detail: 'Multi-client ATS with stage tracking…' },
      { label: 'Enabling Revenue Analytics', detail: 'Placement fees and commission tracking…' },
    ],
    workspaceStructure: [
      { icon: <LayoutDashboard className="w-3.5 h-3.5" />, label: 'Agency Dashboard' },
      { icon: <Bot className="w-3.5 h-3.5" />, label: 'AI Recruiter' },
      { icon: <Users className="w-3.5 h-3.5" />, label: 'Candidate Pool' },
      { icon: <Building2 className="w-3.5 h-3.5" />, label: 'Client Portal' },
      { icon: <FolderKanban className="w-3.5 h-3.5" />, label: 'Pipeline' },
      { icon: <IndianRupee className="w-3.5 h-3.5" />, label: 'Revenue' },
    ],
    workspacePath: '/desktop/recruitment', tags: ['Recruitment', 'Agency'],
  },
  {
    id: 't4', moduleId: 'hospital', moduleColor: 'red', moduleLucideIcon: 'HeartPulse',
    name: 'Hospital OS', creator: 'HealthTech Solutions',
    description: 'HIPAA-compliant hospital workspace. Patient intake, triage, appointment scheduling and EMR integration.',
    rating: 4.7, reviews: 312, category: 'Healthcare', priceModel: 'Enterprise', priceLabel: 'Contact Sales',
    icon: <HeartPulse className="w-6 h-6" />, verified: true,
    privacyLevel: 'High', dataResidency: 'India Only', aiModel: 'Custom Medical LLM',
    estimatedTime: 'Deploy in 2 hrs', permissions: ['Patient Records', 'Messaging', 'EMR'],
    deploySteps: [
      { label: 'HIPAA Compliance Setup', detail: 'End-to-end encryption and audit trail…' },
      { label: 'Installing Medical Triage Agent', detail: 'Symptom screening model loading…' },
      { label: 'Connecting EMR System', detail: 'Secure EMR integration…' },
      { label: 'Setting up Patient Intake', detail: 'Digital intake forms and queue…' },
      { label: 'Configuring Appointment System', detail: 'Doctor calendars and booking…' },
      { label: 'Building Staff Dashboard', detail: 'Ward overview and patient status…' },
    ],
    workspaceStructure: [
      { icon: <LayoutDashboard className="w-3.5 h-3.5" />, label: 'Ward Dashboard' },
      { icon: <Bot className="w-3.5 h-3.5" />, label: 'Triage Agent' },
      { icon: <Users className="w-3.5 h-3.5" />, label: 'Patient Queue' },
      { icon: <Calendar className="w-3.5 h-3.5" />, label: 'Appointments' },
      { icon: <FileText className="w-3.5 h-3.5" />, label: 'Medical Records' },
      { icon: <Shield className="w-3.5 h-3.5" />, label: 'Compliance' },
    ],
    workspacePath: '/desktop/ai-agents', tags: ['Healthcare', 'HIPAA'],
  },
];

const CONNECTORS: IntentCapability[] = [
  {
    id: 'c1', moduleId: 'gmail', moduleColor: 'red', moduleLucideIcon: 'Mail',
    name: 'Gmail', creator: 'Google', description: 'Sync emails, draft AI replies and trigger workflows on email events.',
    rating: 4.9, reviews: 15400, category: 'Email', priceModel: 'Free', priceLabel: 'Free',
    icon: <Mail className="w-6 h-6" />, verified: true, privacyLevel: 'High', dataResidency: 'US / EU',
    aiModel: 'N/A', estimatedTime: 'Real-time', permissions: ['Gmail OAuth'], tags: ['Email', 'Google'],
    deploySteps: [
      { label: 'Gmail Authentication', detail: 'Opening OAuth flow…' },
      { label: 'Syncing Mail', detail: 'Importing last 90 days…' },
      { label: 'AI Categorisation', detail: 'Labelling and sorting with AI…' },
      { label: 'Smart Inbox Ready', detail: 'Filtering and priority scoring active…' },
    ],
    workspaceStructure: [
      { icon: <Inbox className="w-3.5 h-3.5" />, label: 'Smart Inbox' },
      { icon: <Bot className="w-3.5 h-3.5" />, label: 'AI Replies' },
    ],
    workspacePath: '/desktop/smart-inbox',
  },
  {
    id: 'c2', moduleId: 'slack', moduleColor: 'green', moduleLucideIcon: 'Slack',
    name: 'Slack', creator: 'Salesforce', description: 'Post alerts, receive commands and sync workspace activity to Slack channels.',
    rating: 4.8, reviews: 9800, category: 'Messaging', priceModel: 'Free', priceLabel: 'Free',
    icon: <Slack className="w-6 h-6" />, verified: true, privacyLevel: 'High', dataResidency: 'US / EU',
    aiModel: 'N/A', estimatedTime: 'Real-time', permissions: ['Slack OAuth'], tags: ['Messaging', 'Slack'],
    deploySteps: [
      { label: 'Slack Authentication', detail: 'OAuth flow…' },
      { label: 'Connecting Channels', detail: 'Mapping workspace alerts…' },
      { label: 'Enabling Commands', detail: 'Registering slash commands…' },
    ],
    workspaceStructure: [{ icon: <Inbox className="w-3.5 h-3.5" />, label: 'Slack Bridge' }],
    workspacePath: '/desktop/connected-accounts',
  },
  {
    id: 'c3', moduleId: 'github', moduleColor: 'slate', moduleLucideIcon: 'Github',
    name: 'GitHub', creator: 'Microsoft', description: 'Trigger agents on PR events, review code and sync issues to your workspace.',
    rating: 4.7, reviews: 6200, category: 'Engineering', priceModel: 'Free', priceLabel: 'Free',
    icon: <Github className="w-6 h-6" />, verified: true, privacyLevel: 'Standard', dataResidency: 'US',
    aiModel: 'N/A', estimatedTime: 'Real-time', permissions: ['GitHub OAuth'], tags: ['Engineering', 'GitHub'],
    deploySteps: [
      { label: 'GitHub Authentication', detail: 'OAuth flow…' },
      { label: 'Linking Repositories', detail: 'Scanning org repos…' },
      { label: 'Enabling PR Webhooks', detail: 'Connecting PR review triggers…' },
    ],
    workspaceStructure: [{ icon: <Code className="w-3.5 h-3.5" />, label: 'Code Review' }],
    workspacePath: '/desktop/connected-accounts',
  },
  {
    id: 'c4', moduleId: 'salesforce', moduleColor: 'blue', moduleLucideIcon: 'Database',
    name: 'Salesforce CRM', creator: 'Salesforce', description: 'Bi-directional sync of leads, contacts and deals with AI-powered enrichment.',
    rating: 4.6, reviews: 4100, category: 'CRM', priceModel: 'Premium', priceLabel: '₹999/mo',
    icon: <Database className="w-6 h-6" />, verified: true, privacyLevel: 'High', dataResidency: 'US / EU / IN',
    aiModel: 'N/A', estimatedTime: 'Near real-time', permissions: ['Salesforce OAuth'], tags: ['CRM', 'Salesforce'],
    deploySteps: [
      { label: 'Salesforce Authentication', detail: 'Connecting to your org…' },
      { label: 'Syncing Leads & Contacts', detail: 'Bi-directional mapping…' },
      { label: 'Enabling AI Enrichment', detail: 'Lead scoring and enrichment…' },
    ],
    workspaceStructure: [{ icon: <TrendingUp className="w-3.5 h-3.5" />, label: 'CRM Sync' }],
    workspacePath: '/desktop/pro/business',
  },
  {
    id: 'c5', moduleId: 'whatsapp', moduleColor: 'green', moduleLucideIcon: 'Phone',
    name: 'WhatsApp Business', creator: 'Meta', description: 'Send AI-powered WhatsApp messages and route customer queries to the right agent.',
    rating: 4.8, reviews: 8700, category: 'Messaging', priceModel: 'Pay-per-use', priceLabel: '₹0.50/msg',
    icon: <Phone className="w-6 h-6" />, verified: true, privacyLevel: 'High', dataResidency: 'India',
    aiModel: 'N/A', estimatedTime: 'Real-time', permissions: ['WhatsApp Business API'], tags: ['Messaging', 'WhatsApp'],
    deploySteps: [
      { label: 'API Key Verification', detail: 'Verifying Business API credentials…' },
      { label: 'Connecting Number', detail: 'Linking WhatsApp Business number…' },
      { label: 'Enabling AI Routing', detail: 'Smart message triage and routing…' },
    ],
    workspaceStructure: [{ icon: <Inbox className="w-3.5 h-3.5" />, label: 'WhatsApp Inbox' }],
    workspacePath: '/desktop/smart-inbox',
  },
  {
    id: 'c6', moduleId: 'sap', moduleColor: 'orange', moduleLucideIcon: 'Building2',
    name: 'SAP ERP', creator: 'SAP SE', description: 'Connect financial, HR and supply chain data from SAP to your Intent OS workspace.',
    rating: 4.5, reviews: 1200, category: 'ERP', priceModel: 'Enterprise', priceLabel: 'Contact Sales',
    icon: <Building2 className="w-6 h-6" />, verified: true, privacyLevel: 'High', dataResidency: 'On-Premise / EU',
    aiModel: 'N/A', estimatedTime: 'Batch / Real-time', permissions: ['SAP API Key'], tags: ['ERP', 'SAP'],
    deploySteps: [
      { label: 'SAP API Configuration', detail: 'Setting up secure API gateway…' },
      { label: 'Mapping Data Entities', detail: 'Finance · HR · Supply Chain schemas…' },
      { label: 'Enabling Live Sync', detail: 'Configuring batch and real-time sync…' },
    ],
    workspaceStructure: [{ icon: <Database className="w-3.5 h-3.5" />, label: 'SAP Bridge' }],
    workspacePath: '/desktop/business-os',
  },
];

const ALL_ITEMS = { agents: AGENTS, templates: TEMPLATES, connectors: CONNECTORS };

/* ─── AI Deployment Assistant ────────────────────────────────────────── */

const EXAMPLES = [
  'I want to start a recruitment agency.',
  'I need a CRM for 50 salespeople.',
  'Set up a law firm workspace.',
  'Create a hospital management system.',
  'Build a startup OS from scratch.',
];

const INTENT_MAP: Record<string, string[]> = {
  recruit: ['a1', 't3'],
  hiring: ['a1'],
  talent: ['a1', 't3'],
  'law firm': ['a2', 't2'],
  legal: ['a2', 't2'],
  lawyer: ['a2', 't2'],
  sales: ['a3', 'c4'],
  crm: ['a3', 'c4'],
  finance: ['a4'],
  accounting: ['a4'],
  invoice: ['a4'],
  hospital: ['a5', 't4'],
  medical: ['a5', 't4'],
  healthcare: ['a5', 't4'],
  startup: ['t1', 'c1', 'c2'],
  gmail: ['c1'],
  slack: ['c2'],
  github: ['c3'],
  salesforce: ['c4'],
  whatsapp: ['c5'],
};

function resolveIntent(query: string): IntentCapability[] {
  const q = query.toLowerCase();
  const ids = new Set<string>();
  for (const [key, capIds] of Object.entries(INTENT_MAP)) {
    if (q.includes(key)) capIds.forEach(id => ids.add(id));
  }
  if (ids.size === 0) return [AGENTS[0], TEMPLATES[0]]; // default recommendations
  const all = [...AGENTS, ...TEMPLATES, ...CONNECTORS];
  return Array.from(ids).map(id => all.find(c => c.id === id)!).filter(Boolean).slice(0, 4);
}

const AIDeployAssistant: React.FC<{ onDeploy: (item: IntentCapability) => void }> = ({ onDeploy }) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<IntentCapability[]>([]);
  const [thinking, setThinking] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleSearch = () => {
    if (!query.trim()) return;
    setThinking(true);
    setShowResults(false);
    setTimeout(() => {
      setResults(resolveIntent(query));
      setThinking(false);
      setShowResults(true);
    }, 1200);
  };

  return (
    <div className="relative rounded-3xl overflow-hidden p-7"
      style={{ background: 'linear-gradient(135deg, #0f0a2a 0%, #0a0d20 50%, #060a1a 100%)', border: '1px solid rgba(99,102,241,0.2)' }}>
      {/* Background glows */}
      <div className="absolute -top-12 -left-12 w-72 h-72 bg-violet-600/15 rounded-full blur-[80px] pointer-events-none" />
      <div className="absolute -bottom-12 right-0 w-72 h-72 bg-indigo-600/10 rounded-full blur-[60px] pointer-events-none" />

      <div className="relative z-10">
        <div className="flex items-center gap-2.5 mb-1">
          <div className="w-7 h-7 rounded-xl bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center">
            <Sparkles className="w-4 h-4 text-white" />
          </div>
          <span className="text-white font-black text-base tracking-tight">AI Deployment Assistant</span>
          <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-violet-500/20 text-violet-300 border border-violet-500/30 uppercase tracking-widest">Beta</span>
        </div>
        <p className="text-sm text-white/40 mb-5">Describe what you want to build. I'll recommend and deploy the right capabilities.</p>

        {/* Input */}
        <div className="flex gap-2 mb-4">
          <div className="flex-1 relative">
            <input
              ref={inputRef}
              value={query}
              onChange={e => setQuery(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleSearch()}
              placeholder="What are you trying to build?"
              className="w-full px-4 py-3 rounded-2xl text-sm text-white outline-none placeholder:text-white/20 font-medium"
              style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)' }}
            />
          </div>
          <button
            onClick={handleSearch}
            disabled={!query.trim() || thinking}
            className="px-5 py-3 rounded-2xl bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white font-bold text-sm transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-40 cursor-pointer flex items-center gap-2 shadow-lg shadow-violet-500/30"
          >
            {thinking ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
            {thinking ? 'Thinking…' : 'Deploy'}
          </button>
        </div>

        {/* Example prompts */}
        {!showResults && (
          <div className="flex flex-wrap gap-2">
            {EXAMPLES.map((ex, i) => (
              <button key={i} onClick={() => { setQuery(ex); setTimeout(() => { setResults(resolveIntent(ex)); setShowResults(true); }, 0); }}
                className="text-[11px] px-3 py-1.5 rounded-full text-white/50 hover:text-white border border-white/8 hover:border-white/20 transition-all cursor-pointer">
                "{ex}"
              </button>
            ))}
          </div>
        )}

        {/* Results */}
        {showResults && results.length > 0 && (
          <div className="mt-4">
            <p className="text-xs font-bold text-white/40 uppercase tracking-widest mb-3">Recommended for you</p>
            <div className="grid grid-cols-2 gap-2">
              {results.map(item => (
                <button key={item.id} onClick={() => onDeploy(item)}
                  className="flex items-center gap-3 p-3 rounded-2xl text-left transition-all hover:scale-[1.01] cursor-pointer"
                  style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
                  <div className="w-8 h-8 rounded-xl bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400 flex-shrink-0">
                    {item.icon}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-bold text-white truncate">{item.name}</p>
                    <p className="text-[10px] text-white/40">{item.priceLabel}</p>
                  </div>
                  <Zap className="w-3.5 h-3.5 text-violet-400 flex-shrink-0" />
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

/* ─── Deploy Modal ─────────────────────────────────────────────────────── */

const DeployModal: React.FC<{
  item: IntentCapability;
  onClose: () => void;
}> = ({ item, onClose }) => {
  const navigate = useNavigate();
  const { installModule } = useInstalledModules();
  const [phase, setPhase] = useState<'preview' | 'deploying' | 'done' | 'error'>('preview');
  const [currentStep, setCurrentStep] = useState(-1);
  const [deployError, setDeployError] = useState<string | null>(null);

  const startDeploy = useCallback(async () => {
    setPhase('deploying');
    setCurrentStep(0);
    setDeployError(null);

    const totalSteps = item.deploySteps.length;
    const stepDuration = 900; // ms per visual step

    // Animate through all steps visually
    for (let i = 0; i < totalSteps - 1; i++) {
      await new Promise<void>(resolve => setTimeout(resolve, stepDuration));
      setCurrentStep(i + 1);
    }

    // Final step — call the real Supabase RPC
    try {
      await deployCapability({
        capabilityId:   item.moduleId,
        capabilityName: item.name,
        capabilityType: item.category?.toLowerCase().includes('connector')
          ? 'connector'
          : item.category?.toLowerCase().includes('template')
            ? 'template'
            : 'agent',
        workspacePath:  item.workspacePath,
        iconName:       item.moduleLucideIcon,
        color:          item.moduleColor,
        structure:      item.workspaceStructure.map(s => s.label),
      });

      // Optimistic sidebar update (realtime will confirm)
      installModule({
        id:           crypto.randomUUID(),
        capabilityId: item.moduleId,
        name:         item.name.replace(/ Agent$/, '').replace(/ OS$/, '').replace(/ Workspace$/, ''),
        icon:         item.moduleLucideIcon,
        path:         item.workspacePath,
        color:        item.moduleColor,
        structure:    item.workspaceStructure.map(s => s.label),
        status:       'installed',
        installedAt:  new Date().toISOString(),
        version:      '1.0.0',
      });

      setCurrentStep(totalSteps);
      setTimeout(() => setPhase('done'), 500);

    } catch (err: any) {
      console.error('[DeployModal] deployCapability failed:', err);
      setDeployError(err?.message ?? 'Deployment failed. Please try again.');
      setPhase('error');
    }
  }, [item, installModule]);

  const handleOpen = () => {
    onClose();
    navigate(item.workspacePath);
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-xl z-[9999] flex items-center justify-center p-4" onClick={phase === 'preview' ? onClose : undefined}>
      <div
        className="relative w-full max-w-lg rounded-3xl border border-white/12 shadow-2xl flex flex-col overflow-hidden"
        style={{ background: '#0d0f1a', maxHeight: '90vh' }}
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center gap-3 px-6 pt-6 pb-4 border-b border-white/5 flex-shrink-0">
          <div className="w-11 h-11 rounded-2xl bg-indigo-500/15 border border-indigo-500/25 flex items-center justify-center text-indigo-400 flex-shrink-0">
            {item.icon}
          </div>
          <div className="flex-1 min-w-0">
            <h2 className="text-base font-black text-white leading-tight">{item.name}</h2>
            <p className="text-[11px] text-slate-400">
              {phase === 'preview' ? 'One-Click OS Deployment' : phase === 'deploying' ? 'Installing capability…' : 'Deployment Complete'}
            </p>
          </div>
          {phase === 'preview' && (
            <button onClick={onClose} className="text-slate-500 hover:text-white transition-colors cursor-pointer flex-shrink-0">
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-4">

          {/* PREVIEW phase */}
          {phase === 'preview' && (
            <>
              {/* What will be created */}
              <div>
                <p className="text-[10px] font-black text-white/30 uppercase tracking-widest mb-2">What will be created</p>
                <div className="rounded-2xl p-4 space-y-2" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
                  {item.deploySteps.map((step, i) => (
                    <div key={i} className="flex items-center gap-2.5">
                      <div className="w-1.5 h-1.5 rounded-full bg-indigo-400 flex-shrink-0 opacity-60" />
                      <p className="text-xs text-slate-300">{step.label}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Workspace structure preview */}
              <div>
                <p className="text-[10px] font-black text-white/30 uppercase tracking-widest mb-2">Your new workspace</p>
                <div className="rounded-2xl p-4" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-5 h-5 rounded-lg bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
                      {item.icon}
                    </div>
                    <p className="text-xs font-bold text-white">{item.name.replace(' Agent', '').replace(' OS', '').replace(' Workspace', '')}</p>
                  </div>
                  <div className="pl-3 border-l border-white/5 space-y-1.5 ml-2">
                    {item.workspaceStructure.map((ws, i) => (
                      <div key={i} className="flex items-center gap-2 text-slate-400">
                        <span className="text-white/20 text-[10px] font-mono">├──</span>
                        <span className="text-white/40">{ws.icon}</span>
                        <span className="text-[11px]">{ws.label}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Trust signals */}
              <div className="grid grid-cols-2 gap-2">
                {[
                  { icon: <BadgeCheck className="w-3.5 h-3.5" />, label: 'Verified by CHATR', color: 'text-emerald-400' },
                  { icon: <Lock className="w-3.5 h-3.5" />, label: `${item.privacyLevel} Privacy`, color: 'text-slate-400' },
                  { icon: <Globe className="w-3.5 h-3.5" />, label: item.dataResidency, color: 'text-slate-400' },
                  { icon: <Clock className="w-3.5 h-3.5" />, label: item.estimatedTime, color: 'text-slate-400' },
                ].map((t, i) => (
                  <div key={i} className={`flex items-center gap-1.5 text-[10px] font-medium ${t.color}`}>
                    {t.icon} {t.label}
                  </div>
                ))}
              </div>

              {/* Permissions */}
              <div className="rounded-2xl p-3" style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)' }}>
                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2">Permissions Required</p>
                <div className="flex flex-wrap gap-1.5">
                  {item.permissions.map(p => (
                    <span key={p} className="text-[10px] px-2 py-0.5 rounded-full text-slate-300 border border-white/8" style={{ background: 'rgba(255,255,255,0.04)' }}>{p}</span>
                  ))}
                </div>
              </div>
            </>
          )}

          {/* DEPLOYING phase */}
          {phase === 'deploying' && (
            <div className="space-y-2">
              {item.deploySteps.map((step, i) => {
                const isComplete = currentStep > i;
                const isActive = currentStep === i;
                return (
                  <div key={i} className={`flex items-start gap-3 p-3.5 rounded-2xl border transition-all duration-400 ${
                    isComplete ? 'border-emerald-500/25 bg-emerald-500/4' :
                    isActive ? 'border-indigo-500/35 bg-indigo-500/6' :
                    'border-white/4 bg-white/[0.01]'
                  }`}>
                    <div className={`w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 transition-all ${
                      isComplete ? 'bg-emerald-500/20 text-emerald-400' :
                      isActive ? 'bg-indigo-500/20 text-indigo-400' :
                      'bg-white/5 text-white/20'
                    }`}>
                      {isComplete ? <CheckCircle className="w-3 h-3" /> :
                       isActive ? <Loader2 className="w-3 h-3 animate-spin" /> :
                       <div className="w-1 h-1 rounded-full bg-current" />}
                    </div>
                    <div>
                      <p className={`text-xs font-semibold leading-tight ${
                        isComplete ? 'text-emerald-300' : isActive ? 'text-white' : 'text-white/20'
                      }`}>{step.label}</p>
                      {isActive && <p className="text-[10px] text-white/30 mt-0.5">{step.detail}</p>}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* DONE phase */}
          {phase === 'done' && (
            <div className="flex flex-col items-center gap-5 py-3">
              {/* Success ring */}
              <div className="relative">
                <div className="w-18 h-18 w-[72px] h-[72px] rounded-full bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center">
                  <CheckCircle className="w-9 h-9 text-emerald-400" />
                </div>
                <span className="absolute inset-0 rounded-full bg-emerald-500/10 animate-ping" style={{ animationDuration: '2s' }} />
              </div>

              <div className="text-center">
                <h3 className="text-lg font-black text-white mb-1.5">Deployment Complete</h3>
                <p className="text-sm text-slate-400 leading-relaxed max-w-xs mx-auto">
                  <span className="text-white font-semibold">{item.name.replace(' Agent', '').replace(' OS', '').replace(' Workspace', '')}</span> is now part of your Intent OS.
                </p>
              </div>

              {/* What was created summary */}
              <div className="w-full rounded-2xl p-4" style={{ background: 'rgba(16,185,129,0.04)', border: '1px solid rgba(16,185,129,0.15)' }}>
                <p className="text-[10px] font-black text-emerald-400/60 uppercase tracking-widest mb-3">Your new workspace</p>
                <div className="grid grid-cols-2 gap-1.5">
                  {item.workspaceStructure.map((ws, i) => (
                    <div key={i} className="flex items-center gap-2 text-emerald-300/80 text-[11px] font-medium">
                      <CheckCircle className="w-3 h-3 text-emerald-500/60 flex-shrink-0" />
                      {ws.label}
                    </div>
                  ))}
                </div>
              </div>

              <p className="text-[10px] text-slate-500 flex items-center gap-1.5">
                <Zap className="w-3 h-3 text-violet-400" />
                Sidebar updated · Workflows installed · Ready to use
              </p>
            </div>
          )}
        </div>

        {/* Footer actions */}
        <div className="px-6 pb-6 pt-3 border-t border-white/5 flex gap-2 flex-shrink-0">
          {phase === 'preview' && (
            <>
              <button onClick={onClose} className="flex-1 py-3 rounded-2xl border border-white/10 text-slate-400 text-sm font-semibold hover:border-white/20 hover:text-white transition-all cursor-pointer">
                Cancel
              </button>
              <button onClick={startDeploy}
                className="flex-1 py-3 rounded-2xl bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white text-sm font-black transition-all shadow-lg shadow-indigo-500/30 cursor-pointer flex items-center justify-center gap-2">
                <Zap className="w-4 h-4" />
                Deploy Now
              </button>
            </>
          )}
          {phase === 'deploying' && (
            <div className="flex-1 py-3 rounded-2xl border border-white/5 text-center text-xs text-slate-500">
              Deploying… do not close this window
            </div>
          )}
          {phase === 'error' && (
            <>
              <button onClick={() => setPhase('preview')} className="py-3 px-5 rounded-2xl border border-white/10 text-slate-400 text-sm font-semibold hover:border-white/20 hover:text-white transition-all cursor-pointer">
                Back
              </button>
              <button onClick={startDeploy}
                className="flex-1 py-3 rounded-2xl bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white text-sm font-black cursor-pointer flex items-center justify-center gap-2">
                <Zap className="w-4 h-4" /> Retry
              </button>
            </>
          )}
          {phase === 'done' && (
            <>
              <button onClick={onClose} className="py-3 px-5 rounded-2xl border border-white/10 text-slate-400 text-sm font-semibold hover:border-white/20 hover:text-white transition-all cursor-pointer">
                Back to Store
              </button>
              <button onClick={handleOpen}
                className="flex-1 py-3 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 text-white text-sm font-black cursor-pointer hover:from-emerald-500 hover:to-teal-500 transition-all flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20">
                Open Workspace <ArrowRight className="w-4 h-4" />
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

/* ─── Installed Tab ──────────────────────────────────────────────────── */

const InstalledTab: React.FC = () => {
  const navigate = useNavigate();
  const { modules, loading, uninstallModule } = useInstalledModules();

  if (loading) {
    return (
      <div className="space-y-3">
        {[1,2,3].map(i => (
          <div key={i} className="h-20 rounded-2xl animate-pulse" style={{ background: 'rgba(255,255,255,0.04)' }} />
        ))}
      </div>
    );
  }

  if (modules.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 py-20 text-center">
        <div className="w-14 h-14 rounded-2xl bg-white/[0.03] border border-white/8 flex items-center justify-center">
          <Package className="w-7 h-7 text-slate-500" />
        </div>
        <div>
          <h3 className="text-base font-black text-white mb-1">No modules installed</h3>
          <p className="text-sm text-slate-400">Browse Featured or Agents to deploy your first capability.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <p className="text-[10px] font-black text-white/25 uppercase tracking-widest">{modules.length} installed module{modules.length !== 1 ? 's' : ''}</p>
      {modules.map(mod => (
        <div key={mod.capabilityId}
          className="flex items-center gap-4 p-4 rounded-2xl border border-white/7 bg-[#0e1017] hover:border-white/12 transition-all">
          {/* Icon */}
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-black text-base flex-shrink-0 bg-${mod.color}-500/15 text-${mod.color}-400 border border-${mod.color}-500/20`}>
            {mod.name[0]}
          </div>
          {/* Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-0.5">
              <p className="text-sm font-bold text-white truncate">{mod.name}</p>
              <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-white/5 text-slate-500">v{mod.version}</span>
              <span className="flex items-center gap-1 text-[9px] font-bold text-emerald-400">
                <Activity className="w-2.5 h-2.5" /> Healthy
              </span>
            </div>
            <p className="text-[10px] text-slate-500">
              Installed {new Date(mod.installedAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
            </p>
            {mod.structure.length > 0 && (
              <p className="text-[10px] text-slate-600 mt-0.5 truncate">{mod.structure.slice(0, 4).join(' · ')}</p>
            )}
          </div>
          {/* Actions */}
          <div className="flex items-center gap-2 flex-shrink-0">
            <button
              onClick={() => navigate(mod.path)}
              className="text-[11px] px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold transition-all cursor-pointer">
              Open
            </button>
            <button
              onClick={async () => {
                try {
                  await uninstallCapability(mod.capabilityId);
                  uninstallModule(mod.capabilityId);
                } catch (e) {
                  console.error('Uninstall failed:', e);
                }
              }}
              className="text-[11px] px-3 py-1.5 rounded-xl border border-white/8 text-slate-400 hover:border-red-500/30 hover:text-red-400 font-bold transition-all cursor-pointer">
              Remove
            </button>
          </div>
        </div>
      ))}
    </div>
  );
};

/* ─── Card ───────────────────────────────────────────────────────────── */

const CapabilityCard: React.FC<{ item: IntentCapability; onDeploy: (item: IntentCapability) => void }> = ({ item, onDeploy }) => {
  const { isInstalled } = useInstalledModules();
  const installed = isInstalled(item.moduleId);
  const [expanded, setExpanded] = useState(false);

  const priceColors: Record<PriceModel, string> = {
    'Free': 'bg-emerald-500/12 text-emerald-300 border-emerald-500/25',
    'Premium': 'bg-violet-500/12 text-violet-300 border-violet-500/25',
    'Pay-per-use': 'bg-amber-500/12 text-amber-300 border-amber-500/25',
    'Enterprise': 'bg-blue-500/12 text-blue-300 border-blue-500/25',
    'Revenue Share': 'bg-pink-500/12 text-pink-300 border-pink-500/25',
  };

  return (
    <div className="group rounded-2xl border border-white/7 bg-[#0e1017] hover:border-white/14 hover:bg-[#131520] transition-all duration-200 p-5 flex flex-col gap-3">
      {/* Top */}
      <div className="flex items-start gap-3.5">
        <div className="w-11 h-11 rounded-2xl border border-white/10 bg-white/[0.04] flex items-center justify-center flex-shrink-0 text-slate-300 group-hover:border-indigo-500/30 group-hover:text-indigo-300 transition-all">
          {item.icon}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5 flex-wrap mb-0.5">
            <h3 className="text-sm font-bold text-white truncate">{item.name}</h3>
            {item.verified && <BadgeCheck className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />}
          </div>
          <p className="text-[11px] text-slate-500 mb-1">By {item.creator}</p>
          <div className="flex items-center gap-1.5">
            <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
            <span className="text-[11px] font-bold text-amber-400">{item.rating}</span>
            <span className="text-[10px] text-slate-500">({item.reviews.toLocaleString()})</span>
          </div>
        </div>
        <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full border uppercase tracking-wide flex-shrink-0 ${priceColors[item.priceModel]}`}>
          {item.priceLabel}
        </span>
      </div>

      <p className="text-xs text-slate-400 leading-relaxed line-clamp-2">{item.description}</p>

      {/* Tags */}
      {item.tags && (
        <div className="flex flex-wrap gap-1">
          {item.tags.map(t => (
            <span key={t} className="text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded-full bg-white/[0.03] text-slate-500 border border-white/5">{t}</span>
          ))}
        </div>
      )}

      {/* Expandable workspace structure */}
      <button onClick={() => setExpanded(v => !v)}
        className="flex items-center gap-1 text-[10px] text-slate-500 hover:text-slate-300 transition-colors cursor-pointer">
        <ChevronDown className={`w-3 h-3 transition-transform ${expanded ? 'rotate-180' : ''}`} />
        {expanded ? 'Hide workspace structure' : 'Preview workspace structure'}
      </button>

      {expanded && (
        <div className="rounded-xl p-3" style={{ background: 'rgba(255,255,255,0.025)', border: '1px solid rgba(255,255,255,0.05)' }}>
          <div className="space-y-1.5">
            {item.workspaceStructure.map((ws, i) => (
              <div key={i} className="flex items-center gap-2 text-[10px] text-slate-400">
                <span className="text-white/15 font-mono">├──</span>
                <span className="text-white/30">{ws.icon}</span>
                <span>{ws.label}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Action */}
      <div className="mt-auto pt-1">
        {installed ? (
          <button className="w-full flex items-center justify-center gap-1.5 py-2 rounded-xl bg-emerald-500/12 text-emerald-300 border border-emerald-500/20 text-xs font-bold cursor-default">
            <CheckCircle className="w-3.5 h-3.5" /> Installed in your OS
          </button>
        ) : (
          <button onClick={() => onDeploy(item)}
            className="w-full flex items-center justify-center gap-1.5 py-2 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white text-xs font-bold transition-all hover:scale-[1.01] active:scale-[0.99] shadow-lg shadow-indigo-500/20 cursor-pointer">
            <Zap className="w-3.5 h-3.5" />
            {item.deploySteps.length > 2 ? 'Deploy to OS' : 'Connect'}
          </button>
        )}
      </div>
    </div>
  );
};

/* ─── Tab config ─────────────────────────────────────────────────────── */

type TabDef = { id: TabId; label: string; icon: React.ReactNode; count?: number };

/* ─── Main Component ─────────────────────────────────────────────────── */

export const IntentStore: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabId>('featured');
  const [searchQuery, setSearchQuery] = useState('');
  const [deployItem, setDeployItem] = useState<IntentCapability | null>(null);
  const { modules: installedModules } = useInstalledModules();

  const TABS: TabDef[] = [
    { id: 'featured',   label: 'Featured',    icon: <Star className="w-3.5 h-3.5" /> },
    { id: 'agents',     label: 'Agents',      icon: <Bot className="w-3.5 h-3.5" />,      count: AGENTS.length },
    { id: 'workflows',  label: 'Workflows',   icon: <Workflow className="w-3.5 h-3.5" />,  count: 4 },
    { id: 'connectors', label: 'Connectors',  icon: <Globe className="w-3.5 h-3.5" />,     count: CONNECTORS.length },
    { id: 'templates',  label: 'Templates',   icon: <Layers className="w-3.5 h-3.5" />,    count: TEMPLATES.length },
    { id: 'enterprise', label: 'Enterprise',  icon: <Building2 className="w-3.5 h-3.5" /> },
    { id: 'installed',  label: 'Installed',   icon: <CheckCircle className="w-3.5 h-3.5" />, count: installedModules.length || undefined },
    { id: 'developer',  label: 'Developer',   icon: <Code className="w-3.5 h-3.5" /> },
  ];

  const filterItems = (items: IntentCapability[]) =>
    items.filter(i =>
      i.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      i.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (i.tags || []).some(t => t.toLowerCase().includes(searchQuery.toLowerCase()))
    );

  const renderGrid = (items: IntentCapability[]) => (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
      {filterItems(items).map(item => <CapabilityCard key={item.id} item={item} onDeploy={setDeployItem} />)}
    </div>
  );

  return (
    <div className="flex flex-col h-full overflow-hidden text-white" style={{ background: '#080a10', fontFamily: 'Inter, system-ui, sans-serif' }}>

      {/* ── Header ── */}
      <div className="flex-shrink-0 px-8 pt-7 pb-5" style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
        <div className="flex items-center justify-between gap-4 mb-5">
          <div>
            <div className="flex items-center gap-2.5 mb-1">
              <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #6366f1, #a855f7)' }}>
                <Store className="w-4 h-4 text-white" />
              </div>
              <h1 className="text-2xl font-black text-white tracking-tight">Intent Store</h1>
              <span className="text-[9px] font-mono px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 uppercase tracking-widest">Ecosystem</span>
            </div>
            <p className="text-sm text-slate-400">Deploy capabilities into your Intent OS. Each install creates a complete workspace.</p>
          </div>
          <div className="relative w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 pointer-events-none" />
            <input
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search capabilities…"
              className="w-full pl-9 pr-4 py-2.5 rounded-2xl text-xs text-white outline-none"
              style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.10)' }}
            />
          </div>
        </div>
        <div className="flex items-center gap-1">
          {TABS.map(tab => (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeTab === tab.id ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/25' : 'text-slate-400 hover:text-white hover:bg-white/[0.05]'
              }`}>
              {tab.icon}
              {tab.label}
              {tab.count && (
                <span className={`text-[9px] px-1.5 py-0.5 rounded-full font-mono ${activeTab === tab.id ? 'bg-white/20 text-white' : 'bg-white/5 text-slate-500'}`}>
                  {tab.count}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* ── Content ── */}
      <div className="flex-1 overflow-y-auto px-8 py-6 space-y-6">

        {/* AI Assistant always visible on Featured */}
        {activeTab === 'featured' && (
          <>
            <AIDeployAssistant onDeploy={setDeployItem} />
            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xs font-black text-white/30 uppercase tracking-widest">Top Agents</h3>
                <button onClick={() => setActiveTab('agents')} className="text-xs text-indigo-400 hover:text-indigo-300 flex items-center gap-1 cursor-pointer">
                  View all <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {AGENTS.slice(0, 4).map(item => <CapabilityCard key={item.id} item={item} onDeploy={setDeployItem} />)}
              </div>
            </div>
            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xs font-black text-white/30 uppercase tracking-widest">Deploy-Ready Templates</h3>
                <button onClick={() => setActiveTab('templates')} className="text-xs text-indigo-400 hover:text-indigo-300 flex items-center gap-1 cursor-pointer">
                  View all <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {TEMPLATES.map(item => <CapabilityCard key={item.id} item={item} onDeploy={setDeployItem} />)}
              </div>
            </div>
          </>
        )}

        {activeTab === 'agents' && (
          <>
            <AIDeployAssistant onDeploy={setDeployItem} />
            {renderGrid(AGENTS)}
          </>
        )}
        {activeTab === 'workflows' && (
          <div className="flex flex-col items-center justify-center gap-5 py-20 text-center">
            <div className="w-14 h-14 rounded-2xl bg-indigo-500/15 border border-indigo-500/25 flex items-center justify-center">
              <Workflow className="w-7 h-7 text-indigo-400" />
            </div>
            <div>
              <h2 className="text-lg font-black text-white mb-2">Workflows</h2>
              <p className="text-sm text-slate-400 max-w-sm">Workflows are automatically installed when you deploy an Agent or Template. No manual setup required.</p>
            </div>
            <button onClick={() => setActiveTab('templates')} className="inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-bold transition-all cursor-pointer">
              Browse Templates <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}
        {activeTab === 'connectors' && renderGrid(CONNECTORS)}
        {activeTab === 'templates' && renderGrid(TEMPLATES)}

        {activeTab === 'enterprise' && (
          <div className="flex flex-col items-center justify-center gap-6 py-20 text-center">
            <div className="w-16 h-16 rounded-2xl bg-blue-500/15 border border-blue-500/25 flex items-center justify-center">
              <Building2 className="w-8 h-8 text-blue-400" />
            </div>
            <div>
              <h2 className="text-xl font-black text-white mb-2">Enterprise Deployments</h2>
              <p className="text-sm text-slate-400 max-w-md">Custom agent deployments, dedicated infrastructure, SLA guarantees, on-premise data residency and white-labelling.</p>
            </div>
            <button className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-gradient-to-r from-blue-600 to-cyan-600 text-white font-bold hover:from-blue-500 hover:to-cyan-500 transition-all shadow-lg shadow-blue-500/25 cursor-pointer">
              <Phone className="w-4 h-4" /> Contact Enterprise Sales
            </button>
          </div>
        )}

        {activeTab === 'developer' && (
          <div className="flex flex-col items-center justify-center gap-6 py-20 text-center">
            <div className="w-16 h-16 rounded-2xl bg-emerald-500/15 border border-emerald-500/25 flex items-center justify-center">
              <Code className="w-8 h-8 text-emerald-400" />
            </div>
            <div>
              <h2 className="text-xl font-black text-white mb-2">Developer Program</h2>
              <p className="text-sm text-slate-400 max-w-md">Publish agents, workflows and connectors. Set your own pricing, keep 70% of revenue, reach thousands of businesses.</p>
            </div>
            <div className="grid grid-cols-3 gap-4 text-left w-full max-w-lg">
              {[
                { label: '70% Revenue Share', icon: <IndianRupee className="w-4 h-4" /> },
                { label: 'Intent OS SDK', icon: <Code className="w-4 h-4" /> },
                { label: 'Verified Badges', icon: <BadgeCheck className="w-4 h-4" /> },
              ].map((f, i) => (
                <div key={i} className="p-4 rounded-2xl bg-white/[0.02] border border-white/6 flex flex-col gap-2">
                  <div className="text-emerald-400">{f.icon}</div>
                  <p className="text-xs font-bold text-white">{f.label}</p>
                </div>
              ))}
            </div>
            <button className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-bold hover:from-emerald-500 hover:to-teal-500 transition-all shadow-lg shadow-emerald-500/25 cursor-pointer">
              <PlusCircle className="w-4 h-4" /> Apply to Publish
            </button>
          </div>
        )}
        {activeTab === 'installed' && <InstalledTab />}
      </div>

      {deployItem && <DeployModal item={deployItem} onClose={() => setDeployItem(null)} />}
    </div>
  );
};
