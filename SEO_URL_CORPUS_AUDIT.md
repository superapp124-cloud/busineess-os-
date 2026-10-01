# CHATR SEO URL Corpus Inventory & Classification Audit

**Generated:** October 1, 2026  
**Total Evaluated Corpus:** 3547 URLs  

---

## 1. Classification Summary

| Classification Bucket | URL Count | Strategic Policy |
| :--- | :--- | :--- |
| **KEEP** | **318** | Core brand, verified commercial products, high-demand Tier-1 hubs (Mumbai, Delhi, Bengaluru, Dubai, London, etc.), and verified research. Submitted in clean, high-signal sitemaps. |
| **IMPROVE** | **23** | Priority commercial money pages (`/pricing`, `/call`, `/download/android`) upgraded with above-the-fold interactive simulators and transparent pricing. |
| **BUILD** | **4** | Net-new high-intent problem and alternative pillars (`/whatsapp-team-inbox`, `/wati-alternative`, `/interakt-alternative`, `/whatsapp-auto-reply`). |
| **REMOVE FROM SITEMAP** | **3202** | Low-intent programmatic city permutations with near-zero buying volume. Excluded from XML sitemap submission to relieve crawl queue pressure in Google Search Console. |
| **NOINDEX / UTILITY** | **~25** | Private application utility pages (`/desktop/*`, `/admin/*`, `/auth`, `/smart-inbox`) disallowed via robots.txt and noindexed. |
| **ALLOW 404/410** | **96** | Historical dead endpoints from deprecated beta features. Allowed to return clean 404/410 without homepage redirect spam. |

---

## 2. Bucket Definitions & Governance

### Bucket A & B: KEEP & IMPROVE (341 URLs)
* **Core Commercial Products:**
  * `/` (Homepage)
  * `/pricing` (Commercial Plans & SME Starter Tier)
  * `/call` (Browser WebRTC Voice/Video Calling)
  * `/download/android` & `/download` (Direct Verified APK Distribution)
  * `/chatr/whatsapp-business-api` (Official Meta Cloud API Team Inbox)
* **Top Commercial Metros:**
  * Mumbai, Delhi-NCR, Bengaluru, Hyderabad, Pune, Chennai, Kolkata, Ahmedabad, Dubai, London, Singapore, Riyadh.

### Bucket C: BUILD (4 High-Intent Commercial Pillars)
* `/whatsapp-team-inbox` — Core problem pillar addressing multi-agent WhatsApp management.
* `/wati-alternative` — Factual comparison against WATI highlighting transparent pricing and SI capabilities.
* `/interakt-alternative` — Alternative comparison for Indian D2C & SME teams.
* `/whatsapp-auto-reply` — High-intent search solution for instant 24/7 lead acknowledgment.

### Bucket D: REMOVE FROM SITEMAP (3202 Long-Tail URLs)
* **Rationale:** The GSC screenshot demonstrates that Google placed 2,911 URLs into the *Discovered – currently not indexed* queue. Pruning remote municipality permutations from active sitemap submission allows Google's crawler to dedicate 100% of its attention to the high-value commercial corpus.
* **Important:** These pages remain accessible to existing direct visitors and links via standard routing, but are not actively mass-submitted to search engines.
