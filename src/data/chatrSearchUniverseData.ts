/**
 * CHATR SEARCH UNIVERSE & SEMANTIC ONTOLOGY ENGINE
 * 
 * Defines the complete semantic backbone of the CHATR web property:
 * - Layer A: Authority Pages (The 8 Core Universes + Infrastructure)
 * - Layer B: Category Searches (High-volume commercial keywords)
 * - Layer C: Problem Ingestion (Customer pain points & operational bottlenecks)
 * - Layer D: Workflow Searches (Executable business pipelines)
 * - Layer E: Vertical Industry Hubs (Industry-specific solutions)
 * - Terminology Hubs: Proprietary Category Ownership (Intent OS, AI Business OS, etc.)
 * - Tools Directory: 18 CHATR-native interactive web applications
 * - Research Reports: 8 First-party empirical benchmark reports
 */

export interface SemanticPageDefinition {
  path: string;
  slug: string;
  universe: 'communication' | 'calling' | 'identity' | 'ai' | 'intent-os' | 'business-os' | 'robotics-os' | 'ecosystem' | 'infrastructure' | 'cross-cutting';
  layer: 'authority' | 'category' | 'problem' | 'workflow' | 'industry' | 'terminology' | 'tool' | 'research';
  title: string;
  h1: string;
  tagline: string;
  description: string;
  keywords: string;
  directAnswer: string;
  keyCapabilities: string[];
  metrics: { label: string; value: string; context: string }[];
  comparisonTable?: {
    headers: string[];
    rows: string[][];
  };
  faqs: { q: string; a: string }[];
  relatedTools: { name: string; path: string; iconName: string; description: string }[];
  relatedPages: { title: string; path: string }[];
}

// ─────────────────────────────────────────────────────────────────────────────
// LAYER A: SUPREME AUTHORITY HUBS (THE 9 PILLARS)
// ─────────────────────────────────────────────────────────────────────────────
export const AUTHORITY_PAGES: SemanticPageDefinition[] = [
  {
    path: '/chatr',
    slug: 'chatr',
    universe: 'cross-cutting',
    layer: 'authority',
    title: 'CHATR — The Intent Operating System & Universal Communication Platform',
    h1: 'CHATR: The Intent Operating System',
    tagline: 'Stop managing disconnected apps. Start executing high-level business goals.',
    description: 'CHATR is the universal Intent Operating System unifying multi-channel business messaging, enterprise WebRTC calling, caller identity, and autonomous AI execution into one runtime.',
    keywords: 'CHATR, Intent Operating System, Business Communication OS, Universal Business Inbox, AI Business OS',
    directAnswer: 'CHATR is an Intent Operating System (Intent OS) that replaces fragmented SaaS applications with an intent-driven execution pipeline. It unifies business messaging, VoIP calling, caller identity verification, and multi-agent AI execution so organizations execute complex workflows without manual app navigation.',
    keyCapabilities: [
      'Universal Business Inbox unifying WhatsApp Business API, email, web chat, and team threads',
      'SmartSession calling infrastructure with low-latency WebRTC voice and video',
      'Cryptographic caller identity and verified business trust discovery',
      'Intent-to-Workflow compiler transforming natural language into deterministic action DAGs',
      'Executive Chief of Staff dashboard with automated financial and operational ledgers'
    ],
    metrics: [
      { label: 'Sub-50ms', value: '<50ms', context: 'Real-time Timeline graph traversal' },
      { label: 'SLA Response', value: '42s', context: 'Average inbound lead response time' },
      { label: 'Execution', value: '99.4%', context: 'Deterministic action success rate' }
    ],
    faqs: [
      { q: 'What is CHATR?', a: 'CHATR is an Intent Operating System and Universal Communication Platform designed for modern teams, recruitment agencies, and enterprises to coordinate communication, calling, identity, and AI automation.' },
      { q: 'How does CHATR differ from a traditional CRM?', a: 'Traditional CRMs are static databases requiring manual rep data entry. CHATR operates inside real-time communication flows, automatically capturing data, screening leads, and executing workflows in place.' }
    ],
    relatedTools: [
      { name: 'Communication Link Generator', path: '/tools/communication-link-generator', iconName: 'Link', description: 'Build direct click-to-chat links with pre-filled intent parameters.' },
      { name: 'Business VoIP Cost Calculator', path: '/tools/business-voip-cost-calculator', iconName: 'PhoneCall', description: 'Calculate enterprise telephony savings using WebRTC infrastructure.' }
    ],
    relatedPages: [
      { title: 'CHATR Communication', path: '/chatr-communication' },
      { title: 'CHATR Calling', path: '/chatr-calling' },
      { title: 'CHATR Intent OS', path: '/chatr-intent-os' },
      { title: 'What is an Intent Operating System?', path: '/what-is-an-intent-operating-system' }
    ]
  },
  {
    path: '/chatr-communication',
    slug: 'chatr-communication',
    universe: 'communication',
    layer: 'authority',
    title: 'CHATR Communication — Universal Inbox, Messaging & Team Collaboration',
    h1: 'CHATR Communication: Unified Business Messaging',
    tagline: 'Consolidate every customer and team thread into a single, collision-free operating queue.',
    description: 'Transform multi-channel communication into synchronized operational momentum. Unify real-time business messaging, email, web chat, team threads, and external messaging connectors with automated AI triage.',
    keywords: 'CHATR Communication, Universal Business Inbox, Multi-Agent WhatsApp, Shared Team Inbox, Business Messaging Platform',
    directAnswer: 'CHATR Communication is a universal communication substrate and real-time business messaging platform. It unifies enterprise communication streams—including email, WebRTC voice/video, website live chat, and external messaging connectors (such as WhatsApp Business API)—into a single collaborative thread queue equipped with collision detection, round-robin assignment, and automated AI lead triage.',
    keyCapabilities: [
      'Multi-Agent Single Number WhatsApp Business API routing',
      'Visual agent collision detection and live typing lockouts',
      'Internal thread commentary and private supervisory mentions',
      'Sub-5-minute lead auto-responder and automated SLA escalations',
      '3-Bullet instant AI thread summaries during agent reassignment'
    ],
    metrics: [
      { label: 'Response SLA', value: '<60s', context: 'Automated initial qualification' },
      { label: 'Agent Collisions', value: '0', context: 'Real-time typing locks' },
      { label: 'Thread Resolution', value: '3.4x', context: 'Faster ticket closure velocity' }
    ],
    faqs: [
      { q: 'Can multiple agents use one phone number simultaneously?', a: 'Yes. CHATR routes inquiries from a single official number to hundreds of team members with role-based permissions.' },
      { q: 'Does CHATR integrate email alongside chat?', a: 'Yes. Inbound customer emails and WhatsApp conversations appear in the same chronological timeline.' }
    ],
    relatedTools: [
      { name: 'Communication Link Generator', path: '/tools/communication-link-generator', iconName: 'MessageSquare', description: 'Generate direct intent-routed chat links.' },
      { name: 'Contact QR Generator', path: '/tools/contact-qr-generator', iconName: 'QrCode', description: 'Create dynamic contact QR codes for instant mobile engagement.' }
    ],
    relatedPages: [
      { title: 'Universal Inbox', path: '/universal-inbox' },
      { title: 'Business Messaging', path: '/business-messaging' },
      { title: 'CHATR Calling', path: '/chatr-calling' }
    ]
  },
  {
    path: '/chatr-calling',
    slug: 'chatr-calling',
    universe: 'calling',
    layer: 'authority',
    title: 'CHATR Calling — Enterprise VoIP, WebRTC Voice & SmartSession Calling',
    h1: 'CHATR Calling: The Future of Business Voice',
    tagline: 'Sub-second WebRTC calling with context-preserving SmartSession intelligence.',
    description: 'Deploy crystal-clear WebRTC business voice and video calling. Pre-warm customer sessions, record compliant transcripts, and route calls with zero legacy PBX hardware.',
    keywords: 'CHATR Calling, Business VoIP, WebRTC Voice Calling, SmartSession Calling, Business Phone System',
    directAnswer: 'CHATR Calling is a modern telecom and WebRTC voice platform that replaces legacy PBX systems with browser and mobile-native calling. Featuring SmartSession technology, it preserves conversation context across voice, video, and text while delivering automated transcription and routing.',
    keyCapabilities: [
      'Carrier-grade WebRTC 1:1 and group voice/video calling',
      'SmartSession context pre-warming: caller history is loaded before pickup',
      'Native mobile framework integration (Android Telecom & iOS CallKit)',
      'Real-time meeting audio transcription and action-item extraction',
      'Automated IVR call trees and skill-based ring groups'
    ],
    metrics: [
      { label: 'Latency', value: '<120ms', context: 'Global audio packet latency' },
      { label: 'Jitter Resilience', value: '99.8%', context: 'Clean audio on 2G/3G connections' },
      { label: 'Hardware Cost', value: '₹0', context: 'Zero physical PBX boxes required' }
    ],
    faqs: [
      { q: 'Do we need desk phones to use CHATR Calling?', a: 'No. CHATR Calling operates seamlessly through web browsers, macOS/Windows desktop apps, and iOS/Android mobile devices.' },
      { q: 'How does SmartSession calling work?', a: 'When a customer or team member calls, their active orders, chat history, and open tickets are surfaced immediately to the receiving agent.' }
    ],
    relatedTools: [
      { name: 'VoIP Cost Calculator', path: '/tools/business-voip-cost-calculator', iconName: 'Calculator', description: 'Estimate telephony savings switching from legacy PBX to CHATR.' },
      { name: 'Call Quality Diagnostic', path: '/tools/call-quality-checker', iconName: 'Activity', description: 'Test browser microphone latency, jitter, and network packet loss.' }
    ],
    relatedPages: [
      { title: 'Business VoIP Solutions', path: '/business-voip' },
      { title: 'What is SmartSession Calling?', path: '/what-is-smartsession-calling' },
      { title: 'CHATR Identity', path: '/chatr-identity' }
    ]
  },
  {
    path: '/chatr-identity',
    slug: 'chatr-identity',
    universe: 'identity',
    layer: 'authority',
    title: 'CHATR Identity — Verified Caller Identity, Trust Discovery & Digital Business Profile',
    h1: 'CHATR Identity: Trust-First Communication',
    tagline: 'Eliminate caller spoofing and build verified trust across every business interaction.',
    description: 'Empower your enterprise with verified cryptographic caller identity, digital business contact cards, anti-fraud trust shields, and verified directory discovery.',
    keywords: 'CHATR Identity, Verified Caller ID, Business Identity Profile, Anti-Spam Trust Shield, Enterprise Caller Verification',
    directAnswer: 'CHATR Identity is a cryptographic verification network that binds phone numbers, corporate domains, and individual agents to verified digital certificates. It prevents caller ID spoofing and provides customers with visual proof of legitimate enterprise communication.',
    keyCapabilities: [
      'Cryptographic business identity verification badge on outgoing calls and chats',
      'Dynamic Digital Business Contact Cards with live availability state',
      'Anti-spoofing cryptographic call attestation (STIR/SHAKEN compatible)',
      'Enterprise role-based identity discovery directory',
      'Zero-knowledge compliance vault protecting customer PII'
    ],
    metrics: [
      { label: 'Call Pickup Rate', value: '+48%', context: 'On verified branded calls' },
      { label: 'Spoofing Risk', value: '0.0%', context: 'Cryptographically signed sessions' },
      { label: 'Identity Verification', value: '<24h', context: 'Enterprise verification turnaround' }
    ],
    faqs: [
      { q: 'How does CHATR prevent spam and spoofing?', a: 'CHATR cryptographically validates the sending server and originating certificate before ringing the recipient.' },
      { q: 'What does a customer see when a verified business calls?', a: 'The customer sees the verified enterprise logo, brand name, department tag, and green trust seal on their mobile screen.' }
    ],
    relatedTools: [
      { name: 'Business Contact Card Generator', path: '/tools/business-contact-card', iconName: 'CreditCard', description: 'Build interactive verified digital contact cards.' },
      { name: 'Contact QR Generator', path: '/tools/contact-qr-generator', iconName: 'QrCode', description: 'Create scannable identity verification QR codes.' }
    ],
    relatedPages: [
      { title: 'Caller Identity Solutions', path: '/caller-identity' },
      { title: 'Business Identity Platform', path: '/business-identity' },
      { title: 'CHATR Calling', path: '/chatr-calling' }
    ]
  },
  {
    path: '/chatr-ai',
    slug: 'chatr-ai',
    universe: 'ai',
    layer: 'authority',
    title: 'CHATR AI — AI Canvas, Multi-Agent Swarms & Autonomous Assistants',
    h1: 'CHATR AI: The Intelligence Engine for Operations',
    tagline: 'Autonomous AI agents embedded directly into business communication and workflows.',
    description: 'Supercharge your workforce with CHATR AI: multi-agent coordination swarms, AI Canvas for brainstorming and execution, long-term epistemic memory, and local on-device inference.',
    keywords: 'CHATR AI, AI Business Agents, Multi-Agent Swarm, AI Canvas, Autonomous Workflow Execution',
    directAnswer: 'CHATR AI is the cognitive operating layer of CHATR. Rather than functioning as a superficial conversational chatbot, CHATR AI orchestrates goal-conditioned agent swarms that parse customer requests, retrieve organizational memory, draft replies, and execute operational workflows under policy guardrails.',
    keyCapabilities: [
      'Multi-Agent Swarm orchestration across sales, support, and recruitment',
      'Infinite AI Canvas for visual planning and workflow execution',
      'Epistemic memory engine retaining enterprise facts and customer relationship context',
      'Hybrid model execution: ultra-fast cloud Gemini Flash + private local on-device LLMs',
      'Automated candidate resume parsing and WhatsApp pre-screening questionnaires'
    ],
    metrics: [
      { label: 'Parsing Precision', value: '98.4%', context: 'AI CV parsing benchmark' },
      { label: 'Inference Latency', value: '<400ms', context: 'Fast-tier cloud token generation' },
      { label: 'Human Override', value: '<8.5%', context: 'Guarded autonomous action acceptance' }
    ],
    faqs: [
      { q: 'Is our customer data used to train public AI models?', a: 'No. CHATR AI operates under strict tenant isolation protocols, and offers private on-device LLM execution for confidential data.' },
      { q: 'Can CHATR AI take actions, or just write text?', a: 'CHATR AI compiles intents into executable workflow DAGs that trigger database updates, payment links, and booking confirmations.' }
    ],
    relatedTools: [
      { name: 'Intent-to-Workflow Generator', path: '/tools/intent-to-workflow-generator', iconName: 'Cpu', description: 'Turn natural language requests into structured execution DAGs.' },
      { name: 'AI Agent Prompt Builder', path: '/tools/ai-agent-prompt-builder', iconName: 'Sparkles', description: 'Create guarded system prompts with role constraints.' }
    ],
    relatedPages: [
      { title: 'AI Business Agents', path: '/business-ai-agents' },
      { title: 'AI Communication Platform', path: '/ai-communication' },
      { title: 'CHATR Intent OS', path: '/chatr-intent-os' }
    ]
  },
  {
    path: '/chatr-intent-os',
    slug: 'chatr-intent-os',
    universe: 'intent-os',
    layer: 'authority',
    title: 'CHATR Intent OS — The Intent-to-Execution Operating System',
    h1: 'CHATR Intent OS: Intent-Driven Execution',
    tagline: 'When users express a goal, the operating system executes the work.',
    description: 'Explore the 16-layer Intent Operating System kernel. Translates unstructured natural language intent into deterministic capability DAGs, provider sessions, and verified transactions.',
    keywords: 'CHATR Intent OS, Intent Operating System, Intent to Action, Autonomous Kernel, Goal Planner',
    directAnswer: 'CHATR Intent OS is an execution substrate that translates user intent directly into verified, multi-step business transactions without requiring the user to manually launch, configure, and toggle between separate software applications.',
    keyCapabilities: [
      'Intent Engine parsing natural language goals with entity and constraint extraction',
      'Goal Planner constructing optimal Directed Acyclic Graphs (DAGs)',
      'Parallel Provider Discovery querying internal capabilities and external APIs',
      'Idempotent Transaction Ledger guaranteeing exactly-once execution',
      'Verification Engine providing live tracking and state rollback'
    ],
    metrics: [
      { label: 'Execution Rate', value: '99.4%', context: 'Action success rate' },
      { label: 'Pipeline Stages', value: '12-step', context: 'Deterministic execution cycle' },
      { label: 'Context Switching', value: '-85%', context: 'Reduction in multi-app toggling' }
    ],
    faqs: [
      { q: 'What is an Intent Operating System?', a: 'An Intent Operating System treats human goals as primary inputs and automatically discovers, configures, and executes the required software steps across multiple provider APIs.' },
      { q: 'What happens if a provider fails during execution?', a: 'CHATR Intent OS dynamically detects provider constraints and automatically routes execution through pre-warmed fallback providers.' }
    ],
    relatedTools: [
      { name: 'Intent-to-Workflow Generator', path: '/tools/intent-to-workflow-generator', iconName: 'Workflow', description: 'Test intent parsing and visual DAG generation in your browser.' }
    ],
    relatedPages: [
      { title: 'What is an Intent Operating System?', path: '/what-is-an-intent-operating-system' },
      { title: 'CHATR Business OS', path: '/chatr-business-os' },
      { title: 'CHATR Infrastructure', path: '/chatr-infrastructure' }
    ]
  },
  {
    path: '/chatr-business-os',
    slug: 'chatr-business-os',
    universe: 'business-os',
    layer: 'authority',
    title: 'CHATR Business OS — Executive Operations, Finance & Team OS',
    h1: 'CHATR Business OS: The Operational Command Center',
    tagline: 'One Company. One Graph. One Timeline. One Operating System.',
    description: 'Consolidate executive operations, sales pipelines, hiring pipelines, and finance ledgers into a unified desktop and mobile operating system.',
    keywords: 'CHATR Business OS, Business Operating System, Executive Chief of Staff, SME Business Dashboard, Automated Operations',
    directAnswer: 'CHATR Business OS is an all-in-one business command center that unifies customer relationships, recruitment pipelines, financial ledgers, and team communications into a single synchronized operating graph with built-in executive intelligence.',
    keyCapabilities: [
      'Executive Chief of Staff dashboard tracking operational velocity and team goals',
      'Embedded TalentXcel recruitment pipeline with automated candidate scoring',
      'Finance Workspace tracking revenue, cash flow, and automated deal reconciliation',
      'Manager SLA performance metrics and response latency heatmaps',
      'Cross-platform desktop command center (macOS, Windows, Web, Mobile)'
    ],
    metrics: [
      { label: 'Daily Time Saved', value: '2.5 hrs', context: 'Per employee eliminating app silos' },
      { label: 'Pipeline Speed', value: '2.8x', context: 'Faster lead-to-deal progression' },
      { label: 'Tool Costs', value: '-65%', context: 'Replacing 6 fragmented SaaS subscriptions' }
    ],
    faqs: [
      { q: 'Does CHATR Business OS replace tools like Slack, HubSpot, and Jira?', a: 'Yes. CHATR Business OS consolidates communication, CRM contacts, hiring pipelines, and operational tasks into one unified workspace.' },
      { q: 'Can our team collaborate across both mobile and desktop?', a: 'Yes. State, threads, and documents sync in real-time across Electron desktop and native mobile apps.' }
    ],
    relatedTools: [
      { name: 'VoIP Cost Calculator', path: '/tools/business-voip-cost-calculator', iconName: 'Calculator', description: 'Calculate total software stack cost reductions.' }
    ],
    relatedPages: [
      { title: 'What is an AI Business OS?', path: '/what-is-an-ai-business-os' },
      { title: 'CHATR Communication', path: '/chatr-communication' },
      { title: 'CHATR Ecosystem', path: '/chatr-ecosystem' }
    ]
  },
  {
    path: '/chatr-ecosystem',
    slug: 'chatr-ecosystem',
    universe: 'ecosystem',
    layer: 'authority',
    title: 'CHATR Ecosystem — Connector Hub, Intent Store & Mini-App Runtime',
    h1: 'CHATR Ecosystem: Connectors & Marketplace',
    tagline: 'Expand capabilities infinitely with third-party connectors and autonomous agents.',
    description: 'Discover pre-built connectors, workflow templates, verified business agents, and lightweight mini-apps designed to extend the CHATR runtime.',
    keywords: 'CHATR Ecosystem, Intent Store, Connector Hub, Mini-App Runtime, Workflow Templates',
    directAnswer: 'CHATR Ecosystem is the extensibility platform of CHATR, featuring a Connector Hub for external APIs (Shopify, Meta, Zoho, Google Workspace), an Intent Store for pre-built AI agent templates, and a lightweight mini-app sandbox.',
    keyCapabilities: [
      'Pre-built connectors for popular enterprise SaaS and database APIs',
      'Intent Store featuring validated agent templates for sales, HR, and ops',
      'Lightweight sandboxed mini-app runtime executing within chat threads',
      'Universal ABI contracts ensuring long-term backwards compatibility',
      'Community developer SDK for building custom intent extensions'
    ],
    metrics: [
      { label: 'Connectors', value: '45+', context: 'Pre-configured API integrations' },
      { label: 'App Sandbox', value: 'Zero-install', context: 'Instant mini-app execution' },
      { label: 'ABI Freeze', value: 'v0.9_rc', context: 'Guaranteed interface stability' }
    ],
    faqs: [
      { q: 'Can developers build custom connectors for internal company APIs?', a: 'Yes. The CHATR SDK allows organizations to register custom connector manifests and intent actions.' },
      { q: 'Are mini-apps safe to run?', a: 'Yes. Mini-apps run inside a strict sandboxed environment with verified permissions and zero-knowledge data isolation.' }
    ],
    relatedTools: [],
    relatedPages: [
      { title: 'CHATR Intent OS', path: '/chatr-intent-os' },
      { title: 'CHATR Infrastructure', path: '/chatr-infrastructure' }
    ]
  },
  {
    path: '/chatr-infrastructure',
    slug: 'chatr-infrastructure',
    universe: 'infrastructure',
    layer: 'authority',
    title: 'CHATR Infrastructure — Real-Time Timeline Graph & Edge Architecture',
    h1: 'CHATR Infrastructure: The Real-Time Substrate',
    tagline: 'Engineered for sub-50ms latency, zero-knowledge privacy, and offline-first durability.',
    description: 'Learn about CHATR architectural bedrock: sub-50ms Timeline graph traversal, local on-device LLM inference, offline SQLite sync, and cryptographic trust chains.',
    keywords: 'CHATR Infrastructure, Real-Time Architecture, WebRTC Telecom Core, Zero Knowledge Vault, Offline-First Sync',
    directAnswer: 'CHATR Infrastructure is a distributed real-time computing architecture combining sub-50ms graph synchronization, resilient WebRTC VoIP streaming, offline-first local SQLite caching, and zero-knowledge client encryption.',
    keyCapabilities: [
      'Level 0 Substrate Graph unifying Node, Constraint, and Capability models',
      'Timeline Engine guaranteeing sub-50ms traversal latency across events',
      'Offline-First Local SQLite/Dexie synchronization with deterministic conflict resolution',
      'Zero-knowledge encryption for private credentials and caller identity tokens',
      'Global multi-region edge deployment ensuring high availability and compliance'
    ],
    metrics: [
      { label: 'Traversal Latency', value: '<50ms', context: 'P99 timeline event processing' },
      { label: 'Action Success', value: '99.4%', context: 'Distributed execution reliability' },
      { label: 'Offline Sync', value: '100%', context: 'Zero data loss during network outage' }
    ],
    faqs: [
      { q: 'Does CHATR work during complete internet outages?', a: 'Yes. CHATR desktop and mobile runtimes store and queue actions locally, syncing idempotently when connectivity restores.' },
      { q: 'How does CHATR handle enterprise data privacy?', a: 'All data is partitioned by tenant isolation policies with optional on-premise local model inference.' }
    ],
    relatedTools: [
      { name: 'Call Quality Diagnostic', path: '/tools/call-quality-checker', iconName: 'Activity', description: 'Test network latency and WebRTC connection stability.' }
    ],
    relatedPages: [
      { title: 'CHATR Intent OS', path: '/chatr-intent-os' },
      { title: 'CHATR Calling', path: '/chatr-calling' }
    ]
  }
];

// ─────────────────────────────────────────────────────────────────────────────
// PROPRIETARY TERMINOLOGY DEFINITION PAGES
// ─────────────────────────────────────────────────────────────────────────────
export const TERMINOLOGY_PAGES: SemanticPageDefinition[] = [
  {
    path: '/what-is-an-intent-operating-system',
    slug: 'what-is-an-intent-operating-system',
    universe: 'intent-os',
    layer: 'terminology',
    title: 'What is an Intent Operating System? Complete Guide | CHATR Intent OS',
    h1: 'What is an Intent Operating System?',
    tagline: 'The paradigm shift from app-centric clicking to goal-driven execution.',
    description: 'An in-depth architectural explanation of Intent Operating Systems: how they work, why they replace traditional SaaS applications, and how CHATR implements the runtime.',
    keywords: 'What is an Intent Operating System, Intent OS Definition, Intent to Action Systems, Intent-Driven Architecture, CHATR Intent OS',
    directAnswer: 'An Intent Operating System (Intent OS) is a computing runtime that accepts high-level human goals expressed in natural language or structured intent, automatically plans the required operational steps, coordinates provider capabilities, and executes deterministic actions across multiple APIs without requiring manual app-by-app human interaction.',
    keyCapabilities: [
      'Deconstructs complex goals into Directed Acyclic Graphs (DAGs) of discrete capabilities',
      'Pre-warms authentication and provider sessions before execution',
      'Provides idempotent transaction execution with rollback guarantees',
      'Eliminates the cognitive tax of jumping between 10 separate SaaS interfaces'
    ],
    metrics: [
      { label: 'Workflow Speed', value: '4.5x', context: 'Faster execution vs manual app clicking' },
      { label: 'Error Rate', value: '<0.6%', context: 'Reduced human omission errors' },
      { label: 'Integration Time', value: 'Minutes', context: 'Standardized connector interface' }
    ],
    faqs: [
      { q: 'How is an Intent OS different from an AI Chatbot?', a: 'A chatbot produces conversational text. An Intent Operating System compiles intents into verified, state-changing transactions across real-world business systems.' },
      { q: 'Does an Intent OS require replacing existing software?', a: 'No. An Intent OS integrates on top of existing APIs, databases, and communication channels, acting as a universal execution runtime.' }
    ],
    relatedTools: [
      { name: 'Intent-to-Workflow Generator', path: '/tools/intent-to-workflow-generator', iconName: 'Workflow', description: 'Generate a visual execution DAG from any intent prompt.' }
    ],
    relatedPages: [
      { title: 'CHATR Intent OS', path: '/chatr-intent-os' },
      { title: 'What is an AI Business OS?', path: '/what-is-an-ai-business-os' }
    ]
  },
  {
    path: '/what-is-an-ai-business-os',
    slug: 'what-is-an-ai-business-os',
    universe: 'business-os',
    layer: 'terminology',
    title: 'What is an AI Business OS? Architectural Overview | CHATR',
    h1: 'What is an AI Business OS?',
    tagline: 'Replacing fragmented SaaS software with a unified business intelligence substrate.',
    description: 'Learn why traditional CRM, ERP, and ATS silos are being replaced by unified AI Business Operating Systems that operate on a shared real-time knowledge graph.',
    keywords: 'What is an AI Business OS, Business Operating System Definition, Unified Enterprise Substrate, AI Business Platform',
    directAnswer: 'An AI Business OS is an integrated enterprise computing platform that replaces siloed CRM, ERP, ATS, and team messaging applications with a single unified operating graph, continuous timeline, and decision intelligence engine that automates cross-functional workflows.',
    keyCapabilities: [
      'Single Level-0 substrate graph replacing disparate database tables',
      'Real-time semantic enterprise memory retaining context across customer journeys',
      'Embedded decision engine providing guarded action recommendations',
      'Universal Chief of Staff dashboard synchronizing sales, recruitment, and finance'
    ],
    metrics: [
      { label: 'Data Latency', value: '0 sec', context: 'Unified graph eliminates ETL sync delays' },
      { label: 'Cost Reduction', value: '60%', context: 'Consolidation of overlapping SaaS tools' }
    ],
    faqs: [
      { q: 'Why do companies need an AI Business OS?', a: 'Because maintaining 8 disconnected applications leads to 40% lost leads, data silos, and hours of wasted employee time switching between tabs.' }
    ],
    relatedTools: [],
    relatedPages: [
      { title: 'CHATR Business OS', path: '/chatr-business-os' },
      { title: 'What is an Intent Operating System?', path: '/what-is-an-intent-operating-system' }
    ]
  },
  {
    path: '/what-is-smartsession-calling',
    slug: 'what-is-smartsession-calling',
    universe: 'calling',
    layer: 'terminology',
    title: 'What is SmartSession Calling? WebRTC Voice Innovation | CHATR',
    h1: 'What is SmartSession Calling?',
    tagline: 'Context-preserved communication that prepares workflows before the phone even rings.',
    description: 'SmartSession Calling bridges audio/video communication with transactional context. Discover how pre-warmed auth, order history, and live notes transform business voice.',
    keywords: 'SmartSession Calling, Context-Preserved VoIP, Intelligent Business Calling, WebRTC Smart Sessions',
    directAnswer: 'SmartSession Calling is an intelligent telephony protocol developed by CHATR that pre-warms caller identity, purchase history, and active tickets before a voice call connects, allowing agents to respond with immediate context and execute transactions mid-call.',
    keyCapabilities: [
      'Instant screen pop of caller context, recent chats, and open issues',
      'Mid-call execution: send payment requests or book appointments during speech',
      'Compliant automated transcription and sentiment detection',
      'Seamless warm transfer preserving all context for the receiving agent'
    ],
    metrics: [
      { label: 'Call Handling Time', value: '-35%', context: 'Eliminates repetitive identity verification' },
      { label: 'First Call Resolution', value: '+42%', context: 'Full context delivered at call pickup' }
    ],
    faqs: [
      { q: 'Can SmartSession calling work on mobile devices?', a: 'Yes. SmartSession integrates with Android Telecom and iOS CallKit to deliver verified business metadata on incoming calls.' }
    ],
    relatedTools: [
      { name: 'Call Quality Checker', path: '/tools/call-quality-checker', iconName: 'Activity', description: 'Test browser audio latency and network readiness.' }
    ],
    relatedPages: [
      { title: 'CHATR Calling', path: '/chatr-calling' },
      { title: 'Business VoIP', path: '/business-voip' }
    ]
  },
  {
    path: '/what-is-a-universal-business-inbox',
    slug: 'what-is-a-universal-business-inbox',
    universe: 'communication',
    layer: 'terminology',
    title: 'What is a Universal Business Inbox? Complete Guide | CHATR',
    h1: 'What is a Universal Business Inbox?',
    tagline: 'A single operational queue uniting all customer channels, transcripts, and team tasks.',
    description: 'Learn how a Universal Business Inbox unifies WhatsApp, email, voice call transcripts, and internal team comments to eliminate missed leads and double-replies.',
    keywords: 'What is a Universal Business Inbox, Universal Inbox Definition, Omnichannel Team Inbox, Shared WhatsApp Inbox',
    directAnswer: 'A Universal Business Inbox is a centralized software workspace that aggregates inbound communication from customer messaging apps (WhatsApp), business email, and web chat into a single collaborative thread queue equipped with collision detection and automated assignment.',
    keyCapabilities: [
      'Multi-channel unification: WhatsApp Business API, email, and live chat in one stream',
      'Agent collision prevention: live typing indicators stop duplicate replies',
      'Internal thread discussions: team notes invisible to the customer',
      'SLA timers: visual countdowns ensuring no inquiry goes past 5 minutes'
    ],
    metrics: [
      { label: 'Lead Response Time', value: '<5 mins', context: 'Enforces 5-minute lead response rule' },
      { label: 'Duplicate Replies', value: 'Zero', context: 'Prevented by real-time agent collision locks' }
    ],
    faqs: [
      { q: 'How does a Universal Inbox prevent customer frustration?', a: 'It guarantees that when a customer messages on WhatsApp and later emails, reps see the entire history in one thread without asking the customer to repeat themselves.' }
    ],
    relatedTools: [
      { name: 'Communication Link Generator', path: '/tools/communication-link-generator', iconName: 'Link', description: 'Generate click-to-chat links routed into your Universal Inbox.' }
    ],
    relatedPages: [
      { title: 'CHATR Communication', path: '/chatr-communication' },
      { title: 'Universal Inbox', path: '/universal-inbox' }
    ]
  }
];

// ─────────────────────────────────────────────────────────────────────────────
// CHATR-NATIVE INTERACTIVE WEB TOOLS
// ─────────────────────────────────────────────────────────────────────────────
export const CHATR_NATIVE_TOOLS: SemanticPageDefinition[] = [
  {
    path: '/tools/communication-link-generator',
    slug: 'communication-link-generator',
    universe: 'communication',
    layer: 'tool',
    title: 'Free CHATR Communication Link Generator — Zero Setup Click-to-Chat',
    h1: 'CHATR Communication Link Generator',
    tagline: 'Generate customized direct chat links with pre-filled intent parameters.',
    description: 'Free instant communication link generator. Create click-to-chat links with custom pre-filled inquiry messages for customer messaging, doctor appointments, or sales leads.',
    keywords: 'chatr communication link generator, click to chat link builder, direct messaging link, free chat link generator',
    directAnswer: 'The CHATR Communication Link Generator creates instant, standardized click-to-chat URLs that initiate conversations with a specific phone number or team queue with pre-filled context, eliminating manual number saving for customers.',
    keyCapabilities: [
      'Pre-fills custom intent messages based on service or product interest',
      'Instant copy and share functionality with zero registration',
      'Generates companion scannable QR codes in real-time',
      'Integrates directly into CHATR Universal Inbox routing rules'
    ],
    metrics: [
      { label: 'Generation Speed', value: 'Instant', context: 'Runs 100% in your browser' },
      { label: 'Conversion Lift', value: '+32%', context: 'Higher response rate vs plain phone numbers' }
    ],
    faqs: [
      { q: 'Is this link generator completely free?', a: 'Yes. You can generate unlimited direct communication links with zero signup required.' }
    ],
    relatedTools: [
      { name: 'Contact QR Generator', path: '/tools/contact-qr-generator', iconName: 'QrCode', description: 'Generate matching branded QR codes.' }
    ],
    relatedPages: [
      { title: 'CHATR Communication', path: '/chatr-communication' },
      { title: 'Universal Inbox', path: '/universal-inbox' }
    ]
  },
  {
    path: '/tools/contact-qr-generator',
    slug: 'contact-qr-generator',
    universe: 'communication',
    layer: 'tool',
    title: 'Free CHATR Contact QR Generator — Branded High-Resolution QR Codes',
    h1: 'CHATR Contact QR Generator',
    tagline: 'Create instant scannable QR codes for direct business communication.',
    description: 'Free business contact QR code generator. Download high-resolution PNG and SVG QR codes for storefronts, product packaging, brochures, and digital business cards.',
    keywords: 'chatr contact qr generator, business contact qr code, click to chat qr code, free qr generator',
    directAnswer: 'The CHATR Contact QR Generator produces high-resolution, branded QR codes that connect mobile scanners directly to your verified business messaging thread or call queue without requiring them to type a phone number.',
    keyCapabilities: [
      'Instant SVG and PNG vector image downloads',
      'Customizable color palettes matching your enterprise brand',
      'Pre-fills custom inquiries for rapid customer scanning',
      'Print-ready resolution for physical retail and print marketing'
    ],
    metrics: [
      { label: 'Format Support', value: 'PNG + SVG', context: 'Vector and raster options' },
      { label: 'Scan Time', value: '<1 sec', context: 'Instant mobile camera recognition' }
    ],
    faqs: [
      { q: 'Do the generated QR codes expire?', a: 'No. The QR codes encode static, direct links that work permanently.' }
    ],
    relatedTools: [
      { name: 'Communication Link Generator', path: '/tools/communication-link-generator', iconName: 'Link', description: 'Build direct links to pair with your QR code.' }
    ],
    relatedPages: [
      { title: 'CHATR Identity', path: '/chatr-identity' },
      { title: 'CHATR Communication', path: '/chatr-communication' }
    ]
  },
  {
    path: '/tools/business-voip-cost-calculator',
    slug: 'business-voip-cost-calculator',
    universe: 'calling',
    layer: 'tool',
    title: 'Business VoIP & Telecom Cost Calculator — Estimate Savings | CHATR',
    h1: 'Business VoIP Cost Calculator',
    tagline: 'Calculate how much your enterprise saves switching from legacy PBX to CHATR.',
    description: 'Calculate total telephony and call center infrastructure savings. Compare legacy SIP trunk and desk phone costs against modern browser and mobile WebRTC calling.',
    keywords: 'business voip cost calculator, enterprise telecom savings calculator, pbx cost comparison, webrtc voip calculator',
    directAnswer: 'The Business VoIP Cost Calculator models monthly telephony expenditures across user seats, desk phone hardware, SIP trunks, and maintenance, revealing the exact financial savings achieved by switching to CHATR Calling.',
    keyCapabilities: [
      'Configurable agent seat sliders and concurrent call estimators',
      'Hardware elimination model: removes physical IP phones and PBX boxes',
      'Transparent rate comparison across India, UAE, Saudi Arabia, UK, and US',
      'Instant downloadable executive cost reduction summary'
    ],
    metrics: [
      { label: 'Average Savings', value: '62%', context: 'Telephony infrastructure reduction' },
      { label: 'Hardware CapEx', value: '₹0', context: 'Eliminates hardware refresh cycles' }
    ],
    faqs: [
      { q: 'How does CHATR reduce calling costs so drastically?', a: 'By utilizing WebRTC and direct cloud sessions, CHATR eliminates expensive dedicated PBX hardware, proprietary licenses, and phone line leasing.' }
    ],
    relatedTools: [
      { name: 'Call Quality Diagnostic', path: '/tools/call-quality-checker', iconName: 'Activity', description: 'Test your network connection for WebRTC VoIP calls.' }
    ],
    relatedPages: [
      { title: 'CHATR Calling', path: '/chatr-calling' },
      { title: 'Business VoIP', path: '/business-voip' }
    ]
  },
  {
    path: '/tools/intent-to-workflow-generator',
    slug: 'intent-to-workflow-generator',
    universe: 'intent-os',
    layer: 'tool',
    title: 'Free Intent-to-Workflow Generator — Interactive DAG Builder | CHATR',
    h1: 'Intent-to-Workflow Generator',
    tagline: 'Type a high-level operational goal. Watch CHATR compile an execution DAG.',
    description: 'Test the power of Intent Operating Systems. Enter any business intent (e.g. "Screen candidates and book interview") and inspect the generated multi-stage workflow graph.',
    keywords: 'intent to workflow generator, workflow dag builder, ai workflow compiler, intent to action demo',
    directAnswer: 'The Intent-to-Workflow Generator demonstrates how CHATR Intent OS parses natural language business requests, extracts constraints, discovers necessary capabilities, and compiles a deterministic execution graph.',
    keyCapabilities: [
      'Interactive prompt input with pre-built enterprise intent templates',
      'Visual Directed Acyclic Graph (DAG) rendered with live stages',
      'Displays parallel capability discovery and fallback routing',
      'Shows idempotent transaction state and rollback boundaries'
    ],
    metrics: [
      { label: 'Compilation Time', value: '<250ms', context: 'Prompt to DAG generation speed' },
      { label: 'Validation Engine', value: 'Zod-backed', context: 'Guaranteed schema correctness' }
    ],
    faqs: [
      { q: 'Can I use this generated workflow inside CHATR?', a: 'Yes. Generated workflows can be directly imported into CHATR Workflow Studio and executed by autonomous agents.' }
    ],
    relatedTools: [
      { name: 'Business VoIP Cost Calculator', path: '/tools/business-voip-cost-calculator', iconName: 'Calculator', description: 'Estimate infrastructure savings.' }
    ],
    relatedPages: [
      { title: 'What is an Intent Operating System?', path: '/what-is-an-intent-operating-system' },
      { title: 'CHATR Intent OS', path: '/chatr-intent-os' }
    ]
  }
];

// Helper lookup combining all searchable semantic pages
export const ALL_SEMANTIC_PAGES: SemanticPageDefinition[] = [
  ...AUTHORITY_PAGES,
  ...TERMINOLOGY_PAGES,
  ...CHATR_NATIVE_TOOLS
];

export function getSemanticPageByPath(path: string): SemanticPageDefinition | undefined {
  return ALL_SEMANTIC_PAGES.find(p => p.path === path || p.slug === path.replace(/^\//, ''));
}
