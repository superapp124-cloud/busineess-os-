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

### 3.2 TURN Media Relay Sizing & Directional Bandwidth Accounting

While WebRTC establishes direct peer-to-peer UDP connections for ~85% of calls (using STUN and ICE NAT traversal), approximately **15%** of connections encounter Symmetric NATs, carrier-grade NATs (CGNAT), or enterprise firewalls requiring TURN relaying:

- **Relayed Calls**: $3,500\text{ simultaneous calls} \times 15\% = 525\text{ relayed 1-to-1 calls}$.
- **Calling Endpoints**: Each 1-to-1 call has 2 active endpoints (Alice and Bob) $\implies 525 \times 2 = 1,050\text{ active relayed endpoints}$.
- **Per-Endpoint Media Stream**:
  - Voice (OPUS with DTX): 40 kbps
  - Video (H.264 / VP8 720p 30fps): ~1,200 kbps
  - Total per stream: ~1.24 Mbps
- **Directional Media Flow Geometry**:
  - In a TURN-relayed session, each endpoint uploads their media stream to the TURN server, and the TURN server forwards that stream downstream to the peer.
  - **Aggregate Ingress (Upload to TURN)**:
    $$\text{Ingress Traffic} = 1,050\text{ streams} \times 1.24\text{ Mbps} = 1,302\text{ Mbps} \approx \mathbf{1.30\text{ Gbps}}$$
  - **Aggregate Egress (Download from TURN)**:
    $$\text{Egress Traffic} = 1,050\text{ streams} \times 1.24\text{ Mbps} = 1,302\text{ Mbps} \approx \mathbf{1.30\text{ Gbps}}$$
  - **Protocol Overhead**:
    - TURN framing, STUN indications, RTP/SRTP headers, and UDP/IP encapsulation add $\approx 6\%$ protocol overhead:
    $$\text{Overhead} = (1.30\text{ Gbps} + 1.30\text{ Gbps}) \times 6\% \approx \mathbf{156\text{ Mbps (0.16 Gbps)}}$$
  - **Total Aggregate Bi-Directional Throughput**:
    $$\text{TURN Aggregate Traffic} = \text{Ingress (1.30 Gbps)} + \text{Egress (1.30 Gbps)} + \text{Overhead (0.16 Gbps)} \approx \mathbf{2.76\text{ Gbps}}$$
- **Coturn Regional Node Allocation**:
  - 3 geographically distributed Coturn Points of Presence (PoPs):
    1. **me-central-1 (UAE/GCC)**: Dedicated lowest-latency relay for Middle East and Gulf corridors.
    2. **ap-south-1 (Mumbai, India)**: High-density South Asian corridor.
    3. **eu-central-1 (Frankfurt, Europe)**: International roaming and transatlantic peering.
  - **Node Sizing Dimension**: Each regional node must be provisioned with a minimum of **1.0 Gbps symmetric dedicated bandwidth** (Total cluster capacity = 3.0 Gbps symmetric / 6.0 Gbps total throughput) to absorb peak regional skew during diurnal traffic surges.
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

## 6. Server-Authoritative Anti-Abuse & Rate Limiting Engine

To protect the platform against bot-nets, invitation spam, telephony flooding, and signaling room saturation, rate limiting is enforced **server-side** rather than merely on client devices:

### 6.1 Server-Authoritative Policy (Client Cannot Override)
- **Policy Enforcement**: The client cannot supply `p_limit` or `p_window_seconds`. The server defines limits and windows strictly per action type in `enforce_server_abuse_limit()`:
  - `invite_dispatch`: 10 invites per rolling 3600 seconds (1 hour).
  - `invite_dest_cooldown`: 1 invite per 300 seconds (5 minutes) per destination hash.
  - `room_create`: 20 rooms per rolling hour.
  - `guest_join`: 30 joins per rolling hour.
  - `telemetry_batch`: 120 batches per 60 seconds.

### 6.2 Trusted Identity Hierarchy
Client requests are mapped to server-authoritative rate keys using a strict identity hierarchy:
1. **Authenticated User**: Mapped to `uid:<user_id>` from verified JWT (`auth.uid()`).
2. **Anonymous Guest**: Mapped to trusted edge-derived identity from `CF-Connecting-IP` / `x-real-ip` (`ip:<hash>`).
3. **Destination Target**: Mapped to deterministic HMAC/hash of destination (`dst:<hash>`). **Zero raw phone numbers** are stored in the rate-limiting tables.

### 6.3 Room Session & Mesh Caps
- **Room Entropy**: All call rooms utilize 128-bit cryptographic UUIDs (`crypto.randomUUID()`), eliminating phone numbers and guessable room IDs.
- **Mesh Boundary**: Maximum 4 participants (`MAX_MESH_PARTICIPANTS = 4`).
- **Room Session Cap**: Automatic session termination after 60 minutes (`MAX_CALL_DURATION_SEC = 3600`).

---

## 7. Staged Capacity Validation & Load Testing Roadmap

Proving the 5,000,000-user architecture requires progressing through staged empirical load validation:

### Phase A: 1,000 Concurrent Users (CCU)
- **A1 — Synthetic Application Benchmark**:
  - Simulates 1,000 concurrent virtual users executing realistic state transitions.
  - 100 simultaneous WebRTC signaling handshakes.
  - Telemetry event queue batching and rate-limit flood testing.
- **A2 — Real Network Concurrency Verification**:
  - Establishes 1,000 real concurrent WebSocket / Supabase Realtime sessions.
  - 100 concurrent peer-to-peer signaling negotiations.
  - Measures: p50/p95/p99 signaling latency, connection success %, drop rate, and edge response times.
- **A3 — WebRTC Media Relay Capacity Model**:
  - Simulates 100 simultaneous relayed audio/video calls through Coturn.
  - Measures: Packet loss, jitter, RTT, and sustained throughput at ~78 Mbps.

### Phase B: 10,000 Concurrent Users (CCU)
- 10,000 concurrent sessions, 500–1,000 simultaneous calls.
- Validates horizontal scaling of Realtime broadcast channels and Edge Function concurrency.

### Phase C: 50,000 Concurrent Users (CCU) — The 5M Milestone
- 50,000 CCU, 3,500 simultaneous calls (7,000 streaming participants).
- Validates sustained 2.76 Gbps aggregate bi-directional TURN relay throughput across the 3 regional Coturn PoPs.
- Empirically proves the 5M registered user sizing hypothesis.
