/**
 * CHATR SEMANTIC HTML RENDERER & DATA DEFINITIONS (Build-Time Only)
 * 
 * Provides full server-side semantic DOM rendering for:
 * - Layer A: Authority Hubs (/chatr, /chatr-communication, /chatr-calling, etc.)
 * - Terminology Hubs (/what-is-an-intent-operating-system, etc.)
 * - Native Tools (/tools/communication-link-generator, etc.)
 * 
 * Guarantees zero blank screens and instant answer delivery for Googlebot and LLMs.
 */

const DOMAIN = 'https://www.chatrchat.in';

const AUTHORITY_PAGES = [
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
      { q: 'How does CHATR differ from a traditional CRM?', a: 'Traditional CRMs are static databases requiring manual rep data entry. CHATR operates inside real-time communication flows, automatically capturing data, screening leads, and executing workflows in place.' },
      { q: 'Does CHATR support official WhatsApp Business API?', a: 'Yes. CHATR connects natively to Meta Cloud API, enabling multi-agent single number routing, green badge verification, and automated broadcast campaigns.' }
    ],
    relatedTools: [
      { name: 'Communication Link Generator', path: '/tools/communication-link-generator', description: 'Build direct click-to-chat links with pre-filled intent parameters.' },
      { name: 'Business VoIP Cost Calculator', path: '/tools/business-voip-cost-calculator', description: 'Calculate enterprise telephony savings using WebRTC infrastructure.' }
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
      { name: 'Communication Link Generator', path: '/tools/communication-link-generator', description: 'Generate direct intent-routed chat links.' },
      { name: 'Contact QR Generator', path: '/tools/contact-qr-generator', description: 'Create dynamic contact QR codes for instant mobile engagement.' }
    ],
    relatedPages: [
      { title: 'What is a Universal Business Inbox?', path: '/what-is-a-universal-business-inbox' },
      { title: 'CHATR Calling', path: '/chatr-calling' },
      { title: 'CHATR AI', path: '/chatr-ai' }
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
      { name: 'Business VoIP Cost Calculator', path: '/tools/business-voip-cost-calculator', description: 'Estimate telephony savings switching from legacy PBX to CHATR.' }
    ],
    relatedPages: [
      { title: 'What is SmartSession Calling?', path: '/what-is-smartsession-calling' },
      { title: 'CHATR Identity', path: '/chatr-identity' },
      { title: 'CHATR Communication', path: '/chatr-communication' }
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
      { name: 'Contact QR Generator', path: '/tools/contact-qr-generator', description: 'Create scannable identity verification QR codes.' }
    ],
    relatedPages: [
      { title: 'CHATR Calling', path: '/chatr-calling' },
      { title: 'CHATR Communication', path: '/chatr-communication' }
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
      { name: 'Intent-to-Workflow Generator', path: '/tools/intent-to-workflow-generator', description: 'Turn natural language requests into structured execution DAGs.' }
    ],
    relatedPages: [
      { title: 'CHATR Intent OS', path: '/chatr-intent-os' },
      { title: 'What is an Intent Operating System?', path: '/what-is-an-intent-operating-system' }
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
      { name: 'Intent-to-Workflow Generator', path: '/tools/intent-to-workflow-generator', description: 'Test intent parsing and visual DAG generation in your browser.' }
    ],
    relatedPages: [
      { title: 'What is an Intent Operating System?', path: '/what-is-an-intent-operating-system' },
      { title: 'CHATR Business OS', path: '/chatr-business-os' }
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
      { q: 'Can our team collaborate across both mobile and desktop?', a: 'Yes. State, threads, and documents sync in real-time across desktop and native mobile apps.' }
    ],
    relatedTools: [
      { name: 'VoIP Cost Calculator', path: '/tools/business-voip-cost-calculator', description: 'Calculate total software stack cost reductions.' }
    ],
    relatedPages: [
      { title: 'What is an AI Business OS?', path: '/what-is-an-ai-business-os' },
      { title: 'CHATR Communication', path: '/chatr-communication' }
    ]
  },
  {
    path: '/chatr-robotics-os',
    slug: 'chatr-robotics-os',
    universe: 'robotics-os',
    layer: 'authority',
    title: 'CHATR Robotics OS — Autonomous Physical AI & Hardware Execution Platform',
    h1: 'CHATR Robotics OS: Physical AI & Autonomous Execution',
    tagline: 'From human intent to physical action. The operating system bridging AI reasoning and robotic hardware.',
    description: 'CHATR Robotics OS connects high-level intent, multi-agent reasoning, and real-time communication to autonomous robotic hardware, MuJoCo physics simulation, and low-latency device teleoperation.',
    keywords: 'CHATR Robotics OS, Robotics Operating System, Robot AI, Embodied AI, Autonomous Robotics Platform, MuJoCo SimBridge',
    directAnswer: 'CHATR Robotics OS is an embodied AI and robotic execution substrate that translates natural language intents into deterministic multi-stage hardware action DAGs. It bridges digital AI agent reasoning with physical robotic actuators, sub-12ms WebSocket telemetry, MuJoCo 29-DOF kinematics simulation, and WebRTC teleoperation.',
    keyCapabilities: [
      'Intent-to-Actuator Compiler translating natural language goals into multi-stage robotic task DAGs',
      'MuJoCo 3.x Physics Engine & SimBridge protocol with 29-DOF full-body kinematics and sub-12ms joint sync',
      'Full-duplex human-to-robot voice loops with WebRTC audio streaming, Whisper transcription, and neural TTS',
      'Zero-trust hardware identity verification, cryptographic device attestation, and immutable audit ledgers',
      'Interactive 3D Digital Twin cockpit with real-time joint velocity telemetry and remote override at /robotos'
    ],
    metrics: [
      { label: 'Joint Sync Latency', value: '<12ms', context: 'WebSocket SimBridge telemetry' },
      { label: 'Kinematic DoF', value: '29-DOF', context: 'Full-body humanoid inverse solver' },
      { label: 'Safety Determinism', value: '99.8%', context: 'Action DAG boundary verification' }
    ],
    faqs: [
      { q: 'What is CHATR Robotics OS?', a: 'CHATR Robotics OS is the physical execution layer of CHATR, transforming intent and AI agent decisions into physical robot actions, hardware telemetry, and simulated digital twin operations.' },
      { q: 'How does CHATR connect to physical robots?', a: 'Through the SimBridge protocol and low-latency WebSockets, CHATR streams joint states, sensor telemetry, and safety-verified velocity commands to robots or simulation environments.' },
      { q: 'Where can I see the live simulator?', a: 'CHATR includes a live 3D digital twin cockpit and physics simulator accessible directly at /robotos.' }
    ],
    relatedTools: [
      { name: 'Intent-to-Workflow Generator', path: '/tools/intent-to-workflow-generator', description: 'Compile natural language goals into execution DAGs.' },
      { name: 'Business VoIP Cost Calculator', path: '/tools/business-voip-cost-calculator', description: 'Estimate infrastructure savings.' }
    ],
    relatedPages: [
      { title: 'CHATR Intent OS', path: '/chatr-intent-os' },
      { title: 'CHATR AI', path: '/chatr-ai' },
      { title: 'What is a Robotics Operating System?', path: '/what-is-a-robotics-operating-system' },
      { title: 'Robotics OS Cockpit', path: '/robotos' }
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
      { name: 'Business VoIP Cost Calculator', path: '/tools/business-voip-cost-calculator', description: 'Estimate telephony and infrastructure savings.' }
    ],
    relatedPages: [
      { title: 'CHATR Intent OS', path: '/chatr-intent-os' },
      { title: 'CHATR Calling', path: '/chatr-calling' }
    ]
  }
];

const TERMINOLOGY_PAGES = [
  {
    path: '/what-is-a-robotics-operating-system',
    slug: 'what-is-a-robotics-operating-system',
    universe: 'robotics-os',
    layer: 'terminology',
    title: 'What is a Robotics Operating System? Complete Guide | CHATR Robotics OS',
    h1: 'What is a Robotics Operating System?',
    tagline: 'The software architecture orchestrating hardware sensing, physical intelligence, and autonomous action.',
    description: 'An architectural breakdown of modern Robotics Operating Systems: how embodied AI, physics simulation engines, real-time message buses, and hardware abstraction layers unite.',
    keywords: 'What is a Robotics Operating System, Robotics OS Definition, Embodied AI Architecture, Robot Software Platform, CHATR Robotics OS',
    directAnswer: 'A Robotics Operating System is a distributed software platform that manages communication, sensor telemetry, state estimation, motion planning, and actuator control across robotic hardware and digital twins, enabling autonomous machines to perceive environments and safely execute complex tasks.',
    keyCapabilities: [
      'Hardware Abstraction Layer (HAL) decoupling high-level intent from low-level joint actuators',
      'Real-time publish-subscribe telemetry bus for sub-12ms joint and sensor synchronization',
      'Sim-to-Real physics bridging enabling zero-risk digital twin testing in MuJoCo before hardware deployment',
      'Safety governor enforcing kinematic torque limits and fail-safe emergency stop protocols'
    ],
    metrics: [
      { label: 'Control Frequency', value: '1000 Hz', context: 'Low-level motor torque control loop' },
      { label: 'Sim-to-Real Gap', value: '<3.2%', context: 'MuJoCo physics calibration accuracy' },
      { label: 'E-Stop Response', value: '<5ms', context: 'Hardware-level fail-safe interrupt' }
    ],
    faqs: [
      { q: 'How does CHATR Robotics OS differ from ROS/ROS 2?', a: 'While ROS 2 focuses on low-level node communication, CHATR Robotics OS integrates the entire stack from natural language human intent and autonomous multi-agent reasoning down to MuJoCo physics and hardware execution.' },
      { q: 'Can CHATR Robotics OS run in a browser?', a: 'Yes. CHATR features an interactive browser-based 3D digital twin cockpit and WebAssembly/WebSocket physics bridge available at /robotos.' }
    ],
    relatedTools: [
      { name: 'Intent-to-Workflow Generator', path: '/tools/intent-to-workflow-generator', description: 'Test intent parsing and action DAG generation.' }
    ],
    relatedPages: [
      { title: 'CHATR Robotics OS', path: '/chatr-robotics-os' },
      { title: 'CHATR Intent OS', path: '/chatr-intent-os' },
      { title: 'Robotics OS Cockpit', path: '/robotos' }
    ]
  },

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
      { name: 'Intent-to-Workflow Generator', path: '/tools/intent-to-workflow-generator', description: 'Generate a visual execution DAG from any intent prompt.' }
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
    relatedTools: [
      { name: 'Business VoIP Cost Calculator', path: '/tools/business-voip-cost-calculator', description: 'Calculate savings switching to unified business OS.' }
    ],
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
      { name: 'Business VoIP Cost Calculator', path: '/tools/business-voip-cost-calculator', description: 'Calculate enterprise telephony savings.' }
    ],
    relatedPages: [
      { title: 'CHATR Calling', path: '/chatr-calling' },
      { title: 'What is a Universal Business Inbox?', path: '/what-is-a-universal-business-inbox' }
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
      { name: 'Communication Link Generator', path: '/tools/communication-link-generator', description: 'Generate click-to-chat links routed into your Universal Inbox.' }
    ],
    relatedPages: [
      { title: 'CHATR Communication', path: '/chatr-communication' }
    ]
  }
];

const NATIVE_TOOLS = [
  {
    path: '/tools/communication-link-generator',
    slug: 'communication-link-generator',
    title: 'Free CHATR Communication Link Generator — Zero Setup Click-to-Chat',
    h1: 'CHATR Communication Link Generator',
    tagline: 'Generate customized direct chat links with pre-filled intent parameters.',
    description: 'Free instant communication link generator. Create click-to-chat links with custom pre-filled inquiry messages for customer messaging, doctor appointments, or sales leads.',
    keywords: 'chatr communication link generator, click to chat link builder, direct messaging link, free chat link generator',
    directAnswer: 'The CHATR Communication Link Generator creates instant, standardized click-to-chat URLs that initiate conversations with a specific phone number or team queue with pre-filled context, eliminating manual number saving for customers.',
    features: [
      'Pre-fill custom intent messages based on service or product interest',
      'Instant copy and share functionality with zero registration',
      'Generates direct browser and mobile deep links'
    ],
    faqs: [
      { q: 'Is this link generator completely free?', a: 'Yes. The CHATR Communication Link Generator is 100% free with no account or registration required.' },
      { q: 'Do international numbers work?', a: 'Yes. Enter the country calling code without spaces or symbols (e.g. 91 for India, 971 for UAE, 1 for US) followed by the phone number.' }
    ]
  },
  {
    path: '/tools/contact-qr-generator',
    slug: 'contact-qr-generator',
    title: 'Free CHATR Business Contact QR Code Generator — High-Res Vector QR',
    h1: 'CHATR Business Contact QR Generator',
    tagline: 'Generate crisp, branded contact QR codes for print, packaging, and digital business cards.',
    description: 'Free contact QR code generator by CHATR. Create scannable QR codes for phone numbers, WhatsApp chats, email, and vCard business profiles.',
    keywords: 'contact qr generator, business qr code builder, vcard qr code generator, free vector qr code',
    directAnswer: 'The CHATR Contact QR Generator produces high-resolution vector and raster QR codes that open direct customer conversations or import digital business cards (vCard) into mobile contacts with a single scan.',
    features: [
      'Multiple contact modes: Direct Chat, Phone Call, Email, and vCard Profile',
      'Real-time vector preview with custom brand color support',
      'High-resolution 1000px PNG download for sharp physical printing'
    ],
    faqs: [
      { q: 'Do these QR codes ever expire?', a: 'No. These are static QR codes encoding direct URL and contact protocols, so they never expire.' }
    ]
  },
  {
    path: '/tools/business-voip-cost-calculator',
    slug: 'business-voip-cost-calculator',
    title: 'Business VoIP Cost Calculator — Telephony Savings Estimator | CHATR Calling',
    h1: 'Business VoIP & Telephony Cost Calculator',
    tagline: 'Compare legacy PBX phone systems against modern WebRTC calling infrastructure.',
    description: 'Calculate your annual telephony savings switching from legacy PBX desk phones to CHATR WebRTC business calling. Supports INR, USD, AED, and SAR.',
    keywords: 'business voip cost calculator, pbx vs webrtc savings, telephony cost comparison, cloud phone calculator',
    directAnswer: 'The CHATR Business VoIP Cost Calculator evaluates monthly telephony expenses across hardware amortization, maintenance, licensing, and calling rates, estimating cost savings when transitioning to browser and mobile-native WebRTC calling.',
    features: [
      'Interactive multi-currency support: INR (₹), USD ($), AED (د.إ), and SAR (﷼)',
      'Detailed breakdown: Hardware, Maintenance, Licensing, and Call Rate savings',
      'Visual comparative bars showing legacy cost vs CHATR modern calling'
    ],
    faqs: [
      { q: 'How much do companies typically save switching to WebRTC?', a: 'Organizations typically reduce telecommunication expenses by 60% to 75% by eliminating physical PBX hardware, desk phones, and per-line maintenance fees.' }
    ]
  },
  {
    path: '/tools/intent-to-workflow-generator',
    slug: 'intent-to-workflow-generator',
    title: 'Intent-to-Workflow Generator — Interactive DAG Visualizer | CHATR Intent OS',
    h1: 'Intent-to-Workflow Generator',
    tagline: 'Experience how CHATR Intent OS compiles natural language goals into deterministic execution DAGs.',
    description: 'Interactive Intent OS simulator. Type any business goal and watch how the Intent Engine extracts entities, resolves capabilities, and builds executable multi-stage DAGs.',
    keywords: 'intent to workflow generator, intent os simulator, execution dag visualizer, ai workflow compiler',
    directAnswer: 'The CHATR Intent-to-Workflow Generator is an interactive visualizer demonstrating how the CHATR Intent Engine parses unstructured language into deterministic Directed Acyclic Graphs (DAGs) with pre-conditions, API bindings, and verification checkpoints.',
    features: [
      'Live natural language goal compilation into multi-stage DAG nodes',
      'Visual execution pipeline: Intent -> Plan -> Provider Discovery -> Execution -> Verification',
      'JSON execution payload export for developer inspection'
    ],
    faqs: [
      { q: 'What is an Intent DAG?', a: 'A Directed Acyclic Graph (DAG) represents a sequence of dependent tasks where each step executes only after its prerequisites have succeeded, ensuring zero execution collisions.' }
    ]
  }
];


const ROBOTICS_CLUSTER_PAGES = [
  {
    path: '/robotics-os',
    slug: 'robotics-os',
    universe: 'robotics-os',
    layer: 'authority',
    title: 'Robotics OS — The AI Operating System for Physical Automation | CHATR',
    h1: 'Robotics OS: The Platform for Physical Automation',
    tagline: 'Bridging generative AI intelligence with real-world robotic execution.',
    description: 'Robotics OS by CHATR provides the complete runtime for autonomous machines: intent translation, physics simulation in MuJoCo, kinematic control, and real-time telemetry.',
    keywords: 'Robotics OS, Robot Operating System, Autonomous Robotics, Physical Automation, CHATR RobotOS',
    directAnswer: 'Robotics OS is an enterprise operating system that translates digital business intent into autonomous physical actions. It integrates multi-agent task planning, MuJoCo physics simulation, sub-12ms joint telemetry, and spatial safety bounds into a single deployable architecture.',
    keyCapabilities: [
      'Universal Hardware Abstraction Layer supporting diverse robotic kinematics',
      'SimBridge telemetry streaming joint states and sensor feeds at sub-12ms latency',
      'Embedded MuJoCo physics engine for digital twin verification prior to real-world actuation',
      'Full-duplex voice control and multimodal perception for human-robot interaction'
    ],
    metrics: [
      { label: 'Latency', value: '<12ms', context: 'SimBridge WebSocket telemetry' },
      { label: 'Degrees of Freedom', value: '29-DOF', context: 'Humanoid kinematic model' },
      { label: 'Safety Gate', value: '100%', context: 'Deterministic workspace boundaries' }
    ],
    faqs: [
      { q: 'What is Robotics OS?', a: 'Robotics OS is the software layer that sits between business intent and physical hardware, orchestrating perception, planning, and control.' },
      { q: 'How can I test Robotics OS?', a: 'Visit /robotos to test the interactive 3D digital twin cockpit directly in your browser.' }
    ],
    relatedTools: [
      { name: 'Intent-to-Workflow Generator', path: '/tools/intent-to-workflow-generator', description: 'Test intent parsing and DAG generation.' }
    ],
    relatedPages: [
      { title: 'CHATR Robotics OS', path: '/chatr-robotics-os' },
      { title: 'Robotics AI', path: '/robotics-ai' },
      { title: 'Robotics Control', path: '/robotics-control' },
      { title: 'Robotics Cockpit', path: '/robotos' }
    ]
  },
  {
    path: '/robotics',
    slug: 'robotics',
    universe: 'robotics-os',
    layer: 'category',
    title: 'Robotics & Embodied AI Solutions | CHATR Robotics',
    h1: 'CHATR Robotics: Enterprise Embodied AI',
    tagline: 'Transforming industrial and service operations with intelligent, autonomous robotic systems.',
    description: 'Explore CHATR Robotics solutions: humanoid kinematics, autonomous material handling, digital twin simulation, and intent-driven robotic orchestration.',
    keywords: 'Robotics, Embodied AI, Humanoid Robotics, Autonomous Machines, Industrial Robotics, CHATR Robotics',
    directAnswer: 'CHATR Robotics is an embodied artificial intelligence ecosystem that enables enterprises to deploy autonomous physical systems. From warehouse material movement to humanoid service tasks, CHATR connects conversational intent to verified physical actions.',
    keyCapabilities: [
      'Comprehensive humanoid and mobile manipulator kinematic libraries',
      'Sim-to-real deployment pipeline powered by high-fidelity MuJoCo simulation',
      'Multi-modal sensor fusion combining stereo vision, LiDAR, IMU, and force-torque feedback',
      'Enterprise orchestration dashboard coordinating robotic fleets alongside human teams'
    ],
    metrics: [
      { label: 'Task Success', value: '98.7%', context: 'Multi-stage manipulation tasks' },
      { label: 'Cycle Time', value: '-40%', context: 'Automated intent dispatch vs manual teleop' },
      { label: 'Deployment', value: 'Days', context: 'Zero-hardware digital twin staging' }
    ],
    faqs: [
      { q: 'What types of robots does CHATR support?', a: 'CHATR supports bipedal humanoids, wheeled mobile bases, articulated arms, and custom multi-DOF manipulators via standardized SimBridge interfaces.' }
    ],
    relatedTools: [],
    relatedPages: [
      { title: 'Robotics OS', path: '/robotics-os' },
      { title: 'Robotics Automation', path: '/robotics-automation' },
      { title: 'Robotics Cockpit', path: '/robotos' }
    ]
  },
  {
    path: '/robotics-ai',
    slug: 'robotics-ai',
    universe: 'robotics-os',
    layer: 'category',
    title: 'Robotics AI — Physical AI & Embodied Foundation Models | CHATR',
    h1: 'Robotics AI: Intelligence for the Physical World',
    tagline: 'Moving beyond conversational chatbots to spatial reasoning, vision-language-action, and physical intelligence.',
    description: 'Discover how CHATR Robotics AI unites Vision-Language-Action (VLA) models, spatial affordance reasoning, and closed-loop motor control for autonomous machines.',
    keywords: 'Robotics AI, Physical AI, Embodied AI, Vision Language Action, VLA Models, Spatial Intelligence',
    directAnswer: 'Robotics AI refers to artificial intelligence systems designed to perceive 3D physical environments, reason about spatial constraints and object affordances, and generate continuous motor control commands to execute real-world tasks autonomously.',
    keyCapabilities: [
      'Vision-Language-Action (VLA) models mapping visual inputs and natural language to trajectory commands',
      'Spatial affordance estimation identifying graspable surfaces, obstacles, and reachable volumes',
      'Reinforcement learning from physics simulation with rapid sim-to-real transfer',
      'Real-time anomaly detection and collision avoidance running on sovereign edge compute'
    ],
    metrics: [
      { label: 'Inference Latency', value: '<35ms', context: 'Edge VLA trajectory generation' },
      { label: 'Grasp Accuracy', value: '99.1%', context: 'Unknown object manipulation' }
    ],
    faqs: [
      { q: 'How does Robotics AI differ from standard LLMs?', a: 'Standard LLMs process and generate text strings. Robotics AI processes sensory 3D point clouds and generates physical joint torques and kinematic trajectories.' }
    ],
    relatedTools: [
      { name: 'Intent-to-Workflow Generator', path: '/tools/intent-to-workflow-generator', description: 'Simulate natural language intent parsing.' }
    ],
    relatedPages: [
      { title: 'Robotics Agents', path: '/robotics-agents' },
      { title: 'Robotics Control', path: '/robotics-control' },
      { title: 'CHATR AI', path: '/chatr-ai' }
    ]
  },
  {
    path: '/robotics-automation',
    slug: 'robotics-automation',
    universe: 'robotics-os',
    layer: 'category',
    title: 'Robotics Automation — Autonomous Enterprise & Warehouse Operations | CHATR',
    h1: 'Robotics Automation: The Autonomous Enterprise',
    tagline: 'Eliminate manual bottlenecks with end-to-end intent-driven physical workflows.',
    description: 'Scale operational throughput with CHATR Robotics Automation. Unify warehouse pick-and-pack, material transport, and facility inspection into a synchronized software pipeline.',
    keywords: 'Robotics Automation, Warehouse Automation, Autonomous Mobile Robots, Industrial Automation, Robotic Process Automation',
    directAnswer: 'Robotics Automation is the systematic orchestration of autonomous physical machines to execute repetitive or complex industrial operations—such as warehouse logistics, precision assembly, and facility inspection—under deterministic software supervision.',
    keyCapabilities: [
      'Automated dispatch of physical task DAGs based on ERP and inventory triggers',
      'Dynamic path planning and fleet traffic management preventing congestion',
      'Predictive maintenance monitoring joint wear, thermal loads, and battery telemetry',
      'Human-in-the-loop exception handling allowing seamless remote teleoperation override'
    ],
    metrics: [
      { label: 'Throughput Lift', value: '+320%', context: 'Continuous 24/7 autonomous operation' },
      { label: 'Error Rate', value: '<0.05%', context: 'Precision automated handling' }
    ],
    faqs: [
      { q: 'How does CHATR Robotics Automation integrate with existing ERPs?', a: 'CHATR connects via standard webhooks and API connectors in the CHATR Ecosystem, translating ERP orders into physical task DAGs.' }
    ],
    relatedTools: [],
    relatedPages: [
      { title: 'Robotics Orchestration', path: '/robotics-orchestration' },
      { title: 'CHATR Business OS', path: '/chatr-business-os' }
    ]
  },
  {
    path: '/robotics-agents',
    slug: 'robotics-agents',
    universe: 'robotics-os',
    layer: 'category',
    title: 'Robotics Agents — Autonomous Embodied Task Execution Swarms | CHATR',
    h1: 'Robotics Agents: Embodied Autonomous Agents',
    tagline: 'Goal-driven AI agents possessing physical bodies, sensory perception, and manipulation capabilities.',
    description: 'Deploy embodied robotics agents that formulate multi-step plans, coordinate with peer agents, and safely navigate complex physical environments to accomplish high-level objectives.',
    keywords: 'Robotics Agents, Embodied Agents, Multi-Robot Swarms, Autonomous Task Planning, Embodied AI Agents',
    directAnswer: 'Robotics Agents are autonomous AI entities deployed on physical machines that break down high-level business goals into sequential manipulation and navigation primitives, adapting their plans dynamically when physical environment conditions change.',
    keyCapabilities: [
      'Hierarchical task networks decomposing abstract goals into verified physical steps',
      'Multi-agent peer communication coordinating swarms across shared spatial zones',
      'Epistemic memory of physical workspace layout, tool locations, and obstacle histories',
      'Fail-safe recovery actions dynamically rerouting paths when unexpected obstacles appear'
    ],
    metrics: [
      { label: 'Replanning Time', value: '<80ms', context: 'Dynamic obstacle rerouting' },
      { label: 'Task Autonomy', value: '96.4%', context: 'Zero human intervention required' }
    ],
    faqs: [
      { q: 'Can robotics agents collaborate with human workers safely?', a: 'Yes. CHATR Robotics Agents enforce spatial safety envelopes and ISO/TS 15066 collaborative robotics limits, slowing or halting when humans enter active zones.' }
    ],
    relatedTools: [],
    relatedPages: [
      { title: 'Robotics AI', path: '/robotics-ai' },
      { title: 'CHATR Intent OS', path: '/chatr-intent-os' }
    ]
  },
  {
    path: '/robotics-control',
    slug: 'robotics-control',
    universe: 'robotics-os',
    layer: 'category',
    title: 'Robotics Control — MuJoCo Physics, Kinematics & Low-Latency Teleoperation | CHATR',
    h1: 'Robotics Control: Precision Kinematics & Physics',
    tagline: 'Sub-millisecond trajectory generation, 29-DOF whole-body kinematics, and MuJoCo simulation.',
    description: 'Deep dive into CHATR Robotics Control architecture: 29-DOF humanoid kinematics, inverse dynamics solvers, MuJoCo 3.x integration, and sub-12ms teleoperation pipelines.',
    keywords: 'Robotics Control, MuJoCo Physics, Inverse Kinematics, 29-DOF Humanoid, Low Latency Teleoperation, SimBridge',
    directAnswer: 'Robotics Control is the low-level computing and mathematical foundation of CHATR Robotics OS that converts abstract motion plans into exact motor joint positions, velocities, and torques while rigorously maintaining dynamic balance and contact physics.',
    keyCapabilities: [
      'Whole-body 29-DOF kinematic inverse solver with center-of-mass balance preservation',
      'MuJoCo 3.x physics simulation with exact contact normal force and friction modeling',
      'Sub-12ms WebSocket SimBridge streaming joint states and actuator commands',
      'Bilateral teleoperation with force feedback and predictive latency compensation'
    ],
    metrics: [
      { label: 'Control Loop', value: '1 kHz', context: 'Deterministic real-time execution' },
      { label: 'Joint Accuracy', value: '<0.02 rad', context: 'Closed-loop tracking precision' }
    ],
    faqs: [
      { q: 'What physics engine powers CHATR Robotics Control?', a: 'CHATR utilizes MuJoCo 3.x for ultra-fast, numerically stable multi-body dynamics and contact modeling.' }
    ],
    relatedTools: [],
    relatedPages: [
      { title: 'Robotics OS Cockpit', path: '/robotos' },
      { title: 'Robotics Orchestration', path: '/robotics-orchestration' }
    ]
  },
  {
    path: '/robotics-orchestration',
    slug: 'robotics-orchestration',
    universe: 'robotics-os',
    layer: 'category',
    title: 'Robotics Orchestration — Fleet Coordination & Transactional Task Graphs | CHATR',
    h1: 'Robotics Orchestration: Fleet Coordination at Scale',
    tagline: 'Coordinate hundreds of heterogeneous robots and human teams with unified transactional integrity.',
    description: 'Manage fleet missions, dynamic charging schedules, workspace exclusion zones, and transactional execution graphs with CHATR Robotics Orchestration.',
    keywords: 'Robotics Orchestration, Fleet Management, Multi-Robot Coordination, Task Graphs, Warehouse Fleet OS',
    directAnswer: 'Robotics Orchestration is the centralized fleet management and operational coordination layer that allocates tasks among heterogeneous robots, schedules charging, resolves spatial conflicts, and guarantees end-to-end transactional integrity.',
    keyCapabilities: [
      'Transactional task graphs with automatic rollback and failover if a machine encounters an anomaly',
      'Spatial reservation system preventing corridor deadlocks and intersection collisions',
      'Battery state of charge (SoC) management with proactive autonomous docking',
      'Unified enterprise telemetry dashboard displaying 3D fleet positions and health states'
    ],
    metrics: [
      { label: 'Fleet Scale', value: '500+ units', context: 'Simultaneous coordinated machines' },
      { label: 'Fleet Utilization', value: '94.2%', context: 'Active duty cycle efficiency' }
    ],
    faqs: [
      { q: 'Can CHATR orchestrate robots from different manufacturers?', a: 'Yes. By adopting the standard SimBridge and ROS 2 bridge protocols, CHATR unifies mixed-vendor fleets under one operating graph.' }
    ],
    relatedTools: [],
    relatedPages: [
      { title: 'Robotics Automation', path: '/robotics-automation' },
      { title: 'CHATR Infrastructure', path: '/chatr-infrastructure' }
    ]
  },
  {
    path: '/robotics-communication',
    slug: 'robotics-communication',
    universe: 'robotics-os',
    layer: 'category',
    title: 'Robotics Communication — Full-Duplex Human-to-Robot Voice & WebRTC Telemetry | CHATR',
    h1: 'Robotics Communication: Human-Robot Dialog & Telemetry',
    tagline: 'Natural conversational speech, sub-second video feeds, and real-time SimBridge data channels.',
    description: 'Enable fluid human-to-robot collaboration with CHATR Robotics Communication: full-duplex WebRTC voice, on-device Whisper transcription, neural TTS, and sub-12ms telemetry.',
    keywords: 'Robotics Communication, Human Robot Interaction, WebRTC Telemetry, Robot Voice Control, Full Duplex Audio',
    directAnswer: 'Robotics Communication is the real-time networking and interaction layer that enables bi-directional voice dialog between humans and robots, low-latency WebRTC video streaming for teleoperation, and high-frequency telemetry over SimBridge WebSockets.',
    keyCapabilities: [
      'Full-duplex WebRTC audio streaming with echo cancellation and beamforming integration',
      'On-device Whisper transcription parsing commands in English, Hindi, and regional dialects',
      'Neural text-to-speech engine providing conversational confirmation and status updates',
      'Multiplexed data channels carrying sensor streams and joint positions over a single connection'
    ],
    metrics: [
      { label: 'Audio Latency', value: '<150ms', context: 'Glass-to-ear voice round-trip' },
      { label: 'Speech Accuracy', value: '97.6%', context: 'Noisy industrial speech recognition' }
    ],
    faqs: [
      { q: 'Can I speak to the robot naturally or do I need specific keywords?', a: 'You can speak naturally. CHATR RobotCommandEngine parses conversational intent, extracting spatial targets and action verbs automatically.' }
    ],
    relatedTools: [],
    relatedPages: [
      { title: 'CHATR Calling', path: '/chatr-calling' },
      { title: 'Robotics OS Cockpit', path: '/robotos' }
    ]
  },
  {
    path: '/robotics-identity',
    slug: 'robotics-identity',
    universe: 'robotics-os',
    layer: 'category',
    title: 'Robotics Identity — Zero-Trust Hardware Attestation & Audit Ledgers | CHATR',
    h1: 'Robotics Identity: Cryptographic Hardware Trust',
    tagline: 'Authenticate every machine, sign every command, and audit every physical action.',
    description: 'Secure your autonomous operations with CHATR Robotics Identity: TPM-backed hardware certificates, cryptographic command signing, role-based teleop access, and immutable audit trails.',
    keywords: 'Robotics Identity, Hardware Security Module, Robot Authentication, Cryptographic Attestation, Zero Trust Robotics',
    directAnswer: 'Robotics Identity provides zero-trust cryptographic security for physical machines. Every robot is issued an immutable hardware identity, every command is cryptographically authenticated, and all actions are recorded in an audit ledger to prevent unauthorized tampering.',
    keyCapabilities: [
      'Hardware Security Module (HSM) and TPM integration for non-exportable private keys',
      'Cryptographic signature verification on all remote execution and teleoperation commands',
      'Fine-grained role-based access control (RBAC) restricting hazardous actuation permissions',
      'Immutable cryptographic action ledger capturing complete sensor and joint state history'
    ],
    metrics: [
      { label: 'Unauthorized Access', value: '0.0%', context: 'Cryptographically signed execution' },
      { label: 'Attestation Speed', value: '<10ms', context: 'Hardware handshake verification' }
    ],
    faqs: [
      { q: 'Why is identity critical for robotics?', a: 'Because an autonomous robot executes physical actions in human spaces. Cryptographic identity guarantees that only authorized operators and verified algorithms can issue commands.' }
    ],
    relatedTools: [],
    relatedPages: [
      { title: 'CHATR Identity', path: '/chatr-identity' },
      { title: 'Robotics OS', path: '/robotics-os' }
    ]
  },
  {
    path: '/robotics-intent-os',
    slug: 'robotics-intent-os',
    universe: 'robotics-os',
    layer: 'category',
    title: 'Robotics Intent OS — High-Level Natural Language to Actuator Execution | CHATR',
    h1: 'Robotics Intent OS: The Intent-to-Actuator Compiler',
    tagline: 'Say what you want done. The operating system handles the spatial planning and physical execution.',
    description: 'Bridge the semantic gap between human language and robotic actuators. CHATR Robotics Intent OS translates goals into spatial DAGs, safety checks, and deterministic motor commands.',
    keywords: 'Robotics Intent OS, Intent to Actuator, Natural Language to Robot, Action DAG Compiler, Embodied Intent',
    directAnswer: 'Robotics Intent OS is the semantic translation engine within CHATR that compiles high-level human goals (e.g., "Transport palette B to staging dock 4") into verified, multi-stage Directed Acyclic Graphs of physical robotic motions, with continuous safety verification.',
    keyCapabilities: [
      'Intent parsing engine extracting spatial coordinates, objects, and task objectives from speech or text',
      'Dynamic Directed Acyclic Graph (DAG) generation sequencing navigation, grasp, and placement steps',
      'Pre-execution safety validation verifying clearance, payload weight, and reachability',
      'Automatic exception handling and replanning when real-world objects have shifted'
    ],
    metrics: [
      { label: 'Goal Translation', value: '<120ms', context: 'Natural language to kinematic DAG' },
      { label: 'Execution Accuracy', value: '99.4%', context: 'Verified physical completion' }
    ],
    faqs: [
      { q: 'How does Intent OS compile physical commands?', a: 'It passes human requests through the Intent Engine, queries spatial world models, builds a capability DAG, verifies joint kinematic limits in MuJoCo, and dispatches to hardware.' }
    ],
    relatedTools: [
      { name: 'Intent-to-Workflow Generator', path: '/tools/intent-to-workflow-generator', description: 'Visual DAG generation demonstration.' }
    ],
    relatedPages: [
      { title: 'CHATR Intent OS', path: '/chatr-intent-os' },
      { title: 'CHATR Robotics OS', path: '/chatr-robotics-os' },
      { title: 'Robotics OS Cockpit', path: '/robotos' }
    ]
  }
];

function renderAuthorityPageHtml(page) {
  const capabilitiesHtml = page.keyCapabilities.map(c => `
    <li class="flex items-start gap-3 text-slate-300 text-sm">
      <span class="text-emerald-400 font-bold mt-0.5">✓</span>
      <span>${c}</span>
    </li>
  `).join('\n');

  const metricsHtml = page.metrics.map(m => `
    <div class="bg-slate-900 border border-slate-800 rounded-xl p-5 text-center">
      <div class="text-2xl md:text-3xl font-extrabold text-white font-mono text-indigo-400">${m.value}</div>
      <div class="text-xs font-semibold text-slate-300 mt-1">${m.label}</div>
      <div class="text-[11px] text-slate-500 mt-1 leading-snug">${m.context}</div>
    </div>
  `).join('\n');

  const faqsHtml = page.faqs.map((f, i) => `
    <details class="border border-slate-800 rounded-xl overflow-hidden bg-slate-950 p-4 text-sm" ${i === 0 ? 'open' : ''}>
      <summary class="font-semibold text-slate-200 cursor-pointer list-none flex items-center justify-between">
        <span>${f.q}</span>
        <span class="text-slate-400 text-xs">▼</span>
      </summary>
      <div class="mt-3 pt-3 border-t border-slate-800/60 text-xs text-slate-400 leading-relaxed">
        ${f.a}
      </div>
    </details>
  `).join('\n');

  const relatedToolsHtml = (page.relatedTools || []).map(t => `
    <a href="${t.path}" class="p-4 bg-slate-900 hover:bg-slate-800 border border-slate-800 rounded-xl block space-y-1">
      <div class="text-sm font-bold text-indigo-300">${t.name} →</div>
      <div class="text-xs text-slate-400">${t.description}</div>
    </a>
  `).join('\n');

  const relatedPagesHtml = (page.relatedPages || []).map(p => `
    <a href="${p.path}" class="p-3 bg-slate-900 hover:bg-slate-800 border border-slate-800 rounded-lg text-xs text-slate-300 flex items-center justify-between">
      <span>${p.title}</span>
      <span>→</span>
    </a>
  `).join('\n');

  return `
    <div class="min-h-screen bg-slate-950 text-white font-sans">
      <header class="border-b border-slate-800 bg-slate-950/80 sticky top-0 z-40 backdrop-blur">
        <div class="max-w-5xl mx-auto px-4 py-4 flex items-center justify-between">
          <a href="/" class="flex items-center gap-2 font-bold text-lg">
            <span class="text-indigo-400">CHATR</span>
            <span class="text-slate-400 font-normal text-sm">/ ${page.h1.split(':')[0]}</span>
          </a>
          <a href="/auth" class="text-xs bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2 rounded-lg transition-colors font-semibold">
            Try CHATR Free
          </a>
        </div>
      </header>

      <main class="max-w-4xl mx-auto px-4 py-12 space-y-12">
        <nav class="flex items-center gap-2 text-xs text-indigo-400 font-semibold" aria-label="Breadcrumb">
          <a href="/" class="hover:underline text-slate-400 hover:text-white">Home</a>
          <span class="text-slate-600">/</span>
          <span class="text-slate-300">${page.h1.split(':')[0]}</span>
        </nav>

        <div class="space-y-4">
          <h1 class="text-3xl md:text-5xl font-extrabold text-white leading-tight">${page.h1}</h1>
          <p class="text-base md:text-lg text-slate-300 max-w-2xl font-light">${page.tagline}</p>
        </div>

        <section id="direct-answer" class="bg-indigo-950/40 border border-indigo-500/30 rounded-2xl p-6 md:p-8 space-y-3">
          <div class="flex items-center justify-between">
            <span class="text-xs font-bold uppercase tracking-wider text-indigo-300">Executive Summary & Definition</span>
            <span class="text-[11px] font-mono text-emerald-400 bg-emerald-950/60 border border-emerald-800/60 px-2 py-0.5 rounded">
              Direct Answer
            </span>
          </div>
          <p class="text-sm md:text-base text-slate-200 leading-relaxed font-normal">
            ${page.directAnswer}
          </p>
        </section>

        <section class="space-y-4">
          <h2 class="text-xl md:text-2xl font-bold text-white">Performance Telemetry & System Benchmarks</h2>
          <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
            ${metricsHtml}
          </div>
        </section>

        <section class="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 md:p-8 space-y-4">
          <h2 class="text-xl md:text-2xl font-bold text-white">Key Architectural Capabilities</h2>
          <ul class="space-y-3">
            ${capabilitiesHtml}
          </ul>
        </section>

        ${relatedToolsHtml ? `
        <section class="space-y-4">
          <h2 class="text-xl md:text-2xl font-bold text-white">Interactive Web Tools</h2>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            ${relatedToolsHtml}
          </div>
        </section>
        ` : ''}

        <section class="space-y-4">
          <h2 class="text-xl md:text-2xl font-bold text-white">Frequently Asked Questions</h2>
          <div class="space-y-3">
            ${faqsHtml}
          </div>
        </section>

        ${relatedPagesHtml ? `
        <section class="space-y-4 pt-4 border-t border-slate-800">
          <h2 class="text-lg font-bold text-white">Explore Related Universes & Architecture</h2>
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-2">
            ${relatedPagesHtml}
          </div>
        </section>
        ` : ''}

        <div class="bg-gradient-to-r from-indigo-900/50 to-violet-900/50 border border-indigo-500/30 rounded-2xl p-8 text-center space-y-4">
          <h2 class="text-2xl font-bold text-white">Deploy CHATR Today</h2>
          <p class="text-xs md:text-sm text-slate-300 max-w-xl mx-auto">
            Experience the unified Intent Operating System. Replace fragmented subscriptions with native messaging, WebRTC calling, and autonomous AI.
          </p>
          <a href="/auth" class="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white px-6 py-3 rounded-xl font-bold text-sm transition-all">
            Get Started Free →
          </a>
        </div>
      </main>
    </div>
  `;
}

function renderTerminologyPageHtml(page) {
  const capabilitiesHtml = page.keyCapabilities.map(c => `
    <li class="flex items-start gap-3 text-slate-300 text-sm">
      <span class="text-emerald-400 font-bold mt-0.5">✓</span>
      <span>${c}</span>
    </li>
  `).join('\n');

  const faqsHtml = page.faqs.map((f, i) => `
    <details class="border border-slate-800 rounded-xl overflow-hidden bg-slate-950 p-4 text-sm" ${i === 0 ? 'open' : ''}>
      <summary class="font-semibold text-slate-200 cursor-pointer list-none flex items-center justify-between">
        <span>${f.q}</span>
        <span class="text-slate-400 text-xs">▼</span>
      </summary>
      <div class="mt-3 pt-3 border-t border-slate-800/60 text-xs text-slate-400 leading-relaxed">
        ${f.a}
      </div>
    </details>
  `).join('\n');

  const relatedPagesHtml = (page.relatedPages || []).map(p => `
    <a href="${p.path}" class="p-3 bg-slate-900 hover:bg-slate-800 border border-slate-800 rounded-lg text-xs text-slate-300 flex items-center justify-between">
      <span>${p.title}</span>
      <span>→</span>
    </a>
  `).join('\n');

  return `
    <div class="min-h-screen bg-slate-950 text-white font-sans">
      <header class="border-b border-slate-800 bg-slate-950/80 sticky top-0 z-40 backdrop-blur">
        <div class="max-w-5xl mx-auto px-4 py-4 flex items-center justify-between">
          <a href="/" class="flex items-center gap-2 font-bold text-lg">
            <span class="text-indigo-400">CHATR</span>
            <span class="text-slate-400 font-normal text-sm">/ Knowledge Base</span>
          </a>
          <a href="/auth" class="text-xs bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2 rounded-lg transition-colors font-semibold">
            Try CHATR Free
          </a>
        </div>
      </header>

      <main class="max-w-3xl mx-auto px-4 py-12 space-y-12">
        <nav class="flex items-center gap-2 text-xs text-indigo-400 font-semibold" aria-label="Breadcrumb">
          <a href="/" class="hover:underline text-slate-400 hover:text-white">Home</a>
          <span class="text-slate-600">/</span>
          <span class="text-slate-300">Category Definition</span>
        </nav>

        <div class="space-y-4">
          <h1 class="text-3xl md:text-4xl font-extrabold text-white leading-tight">${page.h1}</h1>
          <p class="text-base text-slate-300">${page.tagline}</p>
        </div>

        <section id="direct-answer" class="bg-indigo-950/50 border border-indigo-500/40 rounded-2xl p-6 md:p-8 space-y-3">
          <div class="flex items-center justify-between">
            <span class="text-xs font-bold uppercase tracking-wider text-indigo-300">Definitive Industry Definition</span>
            <span class="text-[11px] font-mono text-emerald-400 bg-emerald-950/60 border border-emerald-800/60 px-2 py-0.5 rounded">
              Verified Concept
            </span>
          </div>
          <p class="text-sm md:text-base text-slate-200 leading-relaxed font-normal">
            ${page.directAnswer}
          </p>
        </section>

        <section class="space-y-4">
          <h2 class="text-xl font-bold text-white">Core Principles & Architecture</h2>
          <div class="bg-slate-900/70 border border-slate-800 rounded-2xl p-6">
            <ul class="space-y-3">
              ${capabilitiesHtml}
            </ul>
          </div>
        </section>

        <section class="space-y-4">
          <h2 class="text-xl font-bold text-white">Frequently Asked Questions</h2>
          <div class="space-y-3">
            ${faqsHtml}
          </div>
        </section>

        ${relatedPagesHtml ? `
        <section class="space-y-4 pt-4 border-t border-slate-800">
          <h2 class="text-lg font-bold text-white">Related Architectures & Platforms</h2>
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-2">
            ${relatedPagesHtml}
          </div>
        </section>
        ` : ''}
      </main>
    </div>
  `;
}

function renderToolPageHtml(tool) {
  const faqsHtml = (tool.faqs || []).map((f, i) => `
    <details class="border border-slate-800 rounded-xl overflow-hidden bg-slate-950 p-4 text-sm" ${i === 0 ? 'open' : ''}>
      <summary class="font-semibold text-slate-200 cursor-pointer list-none flex items-center justify-between">
        <span>${f.q}</span>
        <span class="text-slate-400 text-xs">▼</span>
      </summary>
      <div class="mt-3 pt-3 border-t border-slate-800/60 text-xs text-slate-400 leading-relaxed">
        ${f.a}
      </div>
    </details>
  `).join('\n');

  const featuresHtml = (tool.features || []).map(f => `
    <li class="flex items-start gap-2 text-slate-300 text-xs">
      <span class="text-emerald-400 font-bold">✓</span>
      <span>${f}</span>
    </li>
  `).join('\n');

  return `
    <div class="min-h-screen bg-slate-950 text-white font-sans">
      <header class="border-b border-slate-800 bg-slate-950/80 sticky top-0 z-40 backdrop-blur">
        <div class="max-w-5xl mx-auto px-4 py-4 flex items-center justify-between">
          <a href="/" class="flex items-center gap-2 font-bold text-lg">
            <span class="text-indigo-400">CHATR</span>
            <span class="text-slate-400 font-normal text-sm">/ Tools</span>
          </a>
          <a href="/auth" class="text-xs bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2 rounded-lg transition-colors font-semibold">
            Try CHATR Free
          </a>
        </div>
      </header>

      <main class="max-w-3xl mx-auto px-4 py-12 space-y-10">
        <nav class="flex items-center gap-2 text-xs text-indigo-400 font-semibold" aria-label="Breadcrumb">
          <a href="/" class="hover:underline text-slate-400 hover:text-white">Home</a>
          <span class="text-slate-600">/</span>
          <span class="text-slate-400">Tools</span>
          <span class="text-slate-600">/</span>
          <span class="text-white">${tool.h1}</span>
        </nav>

        <div class="space-y-3">
          <h1 class="text-3xl md:text-4xl font-extrabold text-white leading-tight">${tool.h1}</h1>
          <p class="text-sm md:text-base text-slate-300">${tool.tagline}</p>
        </div>

        <section id="direct-answer" class="bg-indigo-950/50 border border-indigo-500/30 rounded-xl p-5 space-y-2">
          <span class="text-xs font-bold uppercase tracking-wider text-indigo-300">Tool Overview</span>
          <p class="text-xs md:text-sm text-slate-200 leading-relaxed font-medium">
            ${tool.directAnswer}
          </p>
        </section>

        <div class="bg-slate-900 border border-slate-800 rounded-2xl p-6 text-center space-y-4">
          <div class="text-sm font-semibold text-slate-200">Interactive Application Ready</div>
          <p class="text-xs text-slate-400 max-w-md mx-auto">
            Use this interactive utility right in your browser. All processing is private and performed client-side.
          </p>
          <ul class="text-left space-y-2 max-w-sm mx-auto pt-2">
            ${featuresHtml}
          </ul>
        </div>

        <section class="space-y-4">
          <h2 class="text-xl font-bold text-white">Frequently Asked Questions</h2>
          <div class="space-y-3">
            ${faqsHtml}
          </div>
        </section>
      </main>
    </div>
  `;
}
const {
  INTEGRATION_PAGES,
  COMPARISON_PAGES,
  TELECOM_COUNTRY_PAGES,
  WAVE2_TOOLS,
  UNBLOCKED_CALLING_PAGES,
  ALTERNATIVE_PAGES
} = require('../src/data/chatrSearchUniverseData.ts');

module.exports = {
  AUTHORITY_PAGES,
  TERMINOLOGY_PAGES,
  ROBOTICS_CLUSTER_PAGES,
  NATIVE_TOOLS,
  INTEGRATION_PAGES,
  COMPARISON_PAGES,
  TELECOM_COUNTRY_PAGES,
  WAVE2_TOOLS,
  UNBLOCKED_CALLING_PAGES,
  ALTERNATIVE_PAGES,
  renderAuthorityPageHtml,
  renderTerminologyPageHtml,
  renderToolPageHtml
};
