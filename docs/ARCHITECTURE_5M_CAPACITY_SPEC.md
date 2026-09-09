# CHATR+ 5,000,000 Users Capacity & Distribution Specification

**Document Version:** 1.0.0  
**Status:** Certified Engineering Architecture Target (Pending Live Load Validation)  
**Security Classification:** Public Engineering Architecture  

---

## 1. Executive Summary & Sizing Hypotheses

This specification details the infrastructure sizing, capacity requirements, and architectural boundaries required to scale CHATR+ to **5,000,000 registered users**.

> [!NOTE]
> **Engineering Sizing Hypothesis vs Measured Load Validation**  
> All metrics below represent the theoretical architectural sizing hypothesis designed to sustain 5,000,000 users. These figures establish dimensioning criteria for network pipelines, compute clusters, and storage tiers. They do not constitute empirical load test results until Phase 2 and Phase 3 stress tests are formally executed.

### Sizing Parameters

| Metric | Target Dimension | Calculation / Sizing Rationale |
| :--- | :--- | :--- |
| **Total Registered Users** | 5,000,000 | Core addressable user base |
| **Daily Active Users (DAU)** | 1,000,000 (20% of total) | Industry benchmark for private social/calling platforms |
| **Peak Concurrent Users (CCU)** | 50,000 (5% of DAU / 1% total) | Peak diurnal concurrent active web/app sessions |
| **Active Concurrent Calls** | 3,500 simultaneous calls | ~7% of CCU actively participating in real-time calls |
| **Simultaneous Media Streams** | 7,000 calling participants | 2 participants per 1-to-1 call, up to 4 in mesh rooms |
| **Total APK Distribution Volume** | ~391 Terabytes | $5,000,000 \times 78.2\text{ MB}$ raw APK downloads |

---

## 2. WebRTC Topology: Mesh vs SFU Boundary

### 2.1 Full-Mesh Connection Geometry

CHATR+ operates on a client-side WebRTC full-mesh topology for ad-hoc guest and group calls. In a full mesh of $N$ participants:

$$\text{Peer Connections} = \frac{N(N - 1)}{2}$$

$$\text{Directed Media Streams} = N(N - 1)$$

| Participants ($N$) | Peer Connections | Directed Media Streams | Uplink per Client (Audio + 720p Video) | Client Feasibility |
| :---: | :---: | :---: | :---: | :---: |
| **2** | 1 | 2 | ~1.3 Mbps | **Optimal** (Standard 1:1) |
| **3** | 3 | 6 | ~2.6 Mbps | **Good** (Standard LTE/Wi-Fi) |
| **4** | 6 | 12 | ~3.9 Mbps | **Maximum Mesh Boundary** |
| **5** | 10 | 20 | ~5.2 Mbps | *Severe mobile CPU & uplink degradation* |
| **6+** | 15+ | 30+ | >6.5 Mbps | *Unusable on mobile full-mesh* |

### 2.2 The 4-Peer Mesh Limit (`MAX_MESH_PARTICIPANTS = 4`)

To prevent mobile CPU throttling and mobile network uplink collapse, CHATR+ strictly caps client-side full-mesh guest calls at **4 participants**:

- Code enforcement: `src/pages/public/GuestCallPage.tsx` checks `peers.size >= 3` (total room size = 4). Additional connection attempts are cleanly rejected with a capacity advisory.
- Room session cap: Guest sessions are capped at **60 minutes** (`MAX_CALL_DURATION_SEC = 3600`) to prevent orphaned signaling rooms from consuming turn relays.
- **SFU Architectural Boundary**: Any group room requiring $> 4$ concurrent video participants must be routed to a Selective Forwarding Unit (SFU) cluster (LiveKit or mediasoup), where each client transmits 1 uplink stream and receives $N-1$ downlink streams.

---

## 3. Signaling & TURN Relay Infrastructure

### 3.1 Signaling Plane Sizing (50k CCU)

- **Protocol**: WebSocket over TLS (Supabase Realtime Channels / Elixir Phoenix Channels).
- **Idle Keepalive**: Heartbeat every 30 seconds $\approx 1,667$ heartbeats/sec across 50,000 CCU.
- **Payload Size**: ~120 bytes per heartbeat $\approx 200\text{ KB/sec}$ background signaling throughput.
- **Burst Signaling**: During peak call initiation (50 new calls/sec $\times 12$ SDP/ICE candidates) $\approx 600\text{ msg/sec}$, well within cluster limits.

### 3.2 TURN Media Relay Sizing

While WebRTC establishes direct peer-to-peer UDP connections for ~85% of calls (using STUN and ICE NAT traversal), approximately **15%** of connections encounter Symmetric NATs, carrier-grade NATs (CGNAT), or enterprise firewalls requiring TURN relaying:

- **Relayed Calls**: $3,500 \times 15\% = 525\text{ calls}$ (1,050 relayed streams).
- **Per-Stream Bandwidth**:
  - Voice (OPUS): 40 kbps (average with DTX)
  - Video (H.264 / VP8 720p 30fps): ~1,200 kbps
  - Total per stream: ~1.24 Mbps
- **Relay Throughput Requirement**:
  $$\text{Total TURN Bandwidth} = 1,050 \times 1.24\text{ Mbps} \approx 1.30\text{ Gbps sustained bi-directional throughput}$$
- **TURN Cluster Topology**:
  - 3 geographically distributed Coturn nodes:
    1. **me-central-1 (UAE/GCC)**: Lowest latency for Middle East corridors.
    2. **ap-south-1 (Mumbai, India)**: High-density South Asian corridor.
    3. **eu-central-1 (Frankfurt, Europe)**: International roaming and transatlantic peering.
  - Geo-DNS routing (`turn.chatrchat.in`) directs clients to the lowest latency node via STUN round-trip measurement.

---

## 4. 391 TB APK Distribution Architecture

### 4.1 Economics & Edge Protection

Delivering 5,000,000 downloads of a 78.2 MB APK constitutes:

$$5,000,000 \times 78.2\text{ MB} = 391,000,000\text{ MB} \approx 391\text{ Terabytes}$$

Serving 391 TB through standard application edge hosting (e.g. Vercel) would incur severe egress overage costs and potential bandwidth throttling.

### 4.2 Multi-Tier Distribution Topology

- **Edge Layer**: Cloudflare CDN Edge Caching Tier (`download.chatrchat.in`) with Byte-range resume support and regional cache shielding.
- **Storage Layer**: Cloudflare R2 Object Storage Tier with \$0.00 / GB egress fees, serving cryptographically signed APKs with SHA-256 integrity verification.

### 4.3 In-App OTA Update Sizing

To avoid forcing full 78.2 MB downloads for minor updates:
1. **AppUpdateNotifier (`src/components/AppUpdateNotifier.tsx`)**: Queries `/download/version.json` with 12-hour local caching and downgrade protection.
2. **Capacitor Live Bundle OTA**: Future web bundle differential updates require only ~3 MB to ~5 MB per update, reducing ongoing bandwidth consumption by **93%** relative to full binary reinstallations.

---

## 5. Viral Telemetry Pipeline & $K$-Factor Formulation

### 5.1 Privacy Invariant: Capability Token $\neq$ Analytics Identifier

Under zero-trust privacy principles:
- The **capability token** (`c-${crypto.randomUUID()}`) grants access to join a private room. If logged in telemetry databases or third-party analytics, access tokens accumulate in secondary systems, creating vulnerability vectors.
- The **analytics identifier** (`invite_id`) is derived deterministically via a one-way cryptographic hash (`deriveInviteId(capabilityToken)` using SHA-256). The raw capability token is NEVER logged or transmitted to telemetry queues.

### 5.2 The $K$-Factor Viral Formulation

Organic user acquisition velocity is calculated using the standard viral coefficient formula:

$$K = i \times c \times a$$

Where:
- $i$ = **Invites Dispatched per Active User**:
  $$\frac{\text{Total Invites Dispatched via SMS / WhatsApp / Web Link}}{\text{Monthly Active Users}}$$
- $c$ = **Invite Acceptance Rate**:
  $$\frac{\text{Unique Link Visits / Room Joins}}{\text{Total Invites Dispatched}}$$
- $a$ = **Activation Rate**:
  $$\frac{\text{APK Downloads Initiated} + \text{Web Registrations Completed}}{\text{Unique Link Visits}}$$

### 5.3 Viral Breakout Condition

- When $K > 1.0$, the platform experiences exponential organic self-sustaining growth without paid customer acquisition costs (CAC).
- When $K = 1.0$, the platform maintains a stable organic replacement rate.
- When $K < 1.0$, viral loops require reinforcement from discoverability pipelines (SEO search universe, OEM hubs).

---

## 6. Anti-Abuse Rate Limiting Controls

To protect users against SMS spam, telephony flooding, and signaling room saturation, the following client and edge controls are enforced:

1. **Device-Level Invite Budget**: Maximum **10 invites per rolling 60-minute window** (`RATE_LIMIT_MAX_INVITES_PER_HOUR = 10`).
2. **Per-Destination Cooldown**: Minimum **300 seconds (5 minutes)** between consecutive invites to the same destination hash (`COOLDOWN_PER_DESTINATION_MS = 300,000`).
3. **Room Entropy**: All call rooms utilize 128-bit cryptographic UUIDs (`crypto.randomUUID()`), eliminating phone numbers and guessable room IDs.
4. **Room Session Cap**: Unattended or long-running mesh sessions are automatically terminated after 60 minutes (`MAX_CALL_DURATION_SEC = 3600`).

---

## 7. Verification & Stress-Testing Roadmap

| Phase | Objective | Status | Tooling |
| :--- | :--- | :---: | :--- |
| **Phase 1: Invariant Enforcement** | 14 automated build-time invariants validating routing, privacy, rate limits, entropy, and claims. | **Certified** | Node test runner (`test-seo-invariants.cjs`) |
| **Phase 2: Signaling Stress Test** | Simulate 50,000 concurrent WebSocket connections; measure message latency at 1,000 msg/sec. | *Scheduled* | K6 / Locust distributed load agents |
| **Phase 3: Media Relay Saturation** | Push 1,000 synthetic WebRTC media streams through Coturn; measure packet loss and jitter at 1.3 Gbps. | *Scheduled* | Headless Chrome WebRTC testbed |
