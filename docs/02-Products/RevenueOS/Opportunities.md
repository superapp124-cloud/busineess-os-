# Revenue OS — Opportunities Module PRD (docs/02-Products/RevenueOS/Opportunities.md)

> **Status**: Active PRD Specification  
> **Target Module**: Opportunities Pipeline & Proposal Generator  
> **Route URL**: `/desktop/revenue` or `/revenue/opportunities`

---

## 1. Purpose & Business Objective

Manage every sales opportunity from initial qualification through executive proposal generation, negotiation, and contract sign-off while ensuring full visibility for management and automated AI proposal drafting.

---

## 2. Target Personas & Primary Users

- **CEO & Managing Director**: Pipeline revenue forecasting & win rate visibility.
- **Sales Director / VP Sales**: Stage conversion monitoring, quota tracking, deal risk analysis.
- **Account Manager / BDE**: Daily opportunity updates, client proposal drafting, activity logs.
- **Pre-Sales Specialist**: Technical scope definition, quotation builder.

---

## 3. Customer Business Problems Solved

- Scattered opportunity tracking across disconnected spreadsheets.
- Zero pipeline velocity visibility or deal ageing alerts.
- Time-consuming manual sales proposal creation (reduced from 4 hours to 30 seconds via AI).
- Missed follow-ups due to manual reminder tracking.
- Duplicate account entries and lack of unified customer communication history.

---

## 4. UI Specification & Data Columns

### Opportunity Grid & Kanban Columns
- **Opportunity Name**: Text (e.g. "TechCorp Java Team Deal")
- **Company**: Foreign Key `companies.id`
- **Contract Value ($)**: Currency (e.g. `$48,000`)
- **Probability (%)**: Number (e.g. `70%`)
- **Stage**: Enum (`Qualified`, `Meeting`, `Proposal`, `Negotiation`, `Won`, `Lost`)
- **Owner**: Foreign Key `users.id`
- **Next Follow-up Date**: Timestamp
- **Expected Close Date**: Date
- **Ageing Days**: Deterministic number

### Filters & Search Controls
- **Filter By**: Stage, Owner, Deal Value Range, Industry, Next Follow-up Overdue.
- **Bulk Actions**: Reassign Owner, Export CSV, Send WhatsApp Reminder, Generate AI Proposals, Batch Archive.

---

## 5. AI Features & Automation Integration

- **`Generate AI Proposal`**: Invokes `RevenueCapability` $\rightarrow$ `AIExecutor` $\rightarrow$ `OpenRouterProviderAdapter` (`google/gemini-2.5-flash`) to generate structured executive proposals.
- **`Deal Win Probability Prediction`**: Analyzes historical placement data, company payment behavior, and deal velocity to score close likelihood.
- **`Follow-up Automation`**: Triggers automated email/WhatsApp reminders via `CommunicationExecutor` when deal remains idle > 7 days.

---

## 6. End-to-End Deal Workflow

```
Lead Capture ──> Qualified ──> Client Meeting ──> Proposal Generated (RevenueCapability) ──> Negotiation ──> Closed Won ──> Customer Success Handoff
```

---

## 7. Edge Cases & Error Handling

- **Duplicate Company**: System auto-prompts to merge duplicate account records before deal creation.
- **Currency Mismatch**: All foreign currencies auto-converted to primary workspace currency via real-time exchange rates.
- **Reopened Deal**: Changing stage from `Lost` to `Qualified` logs an immutable `DomainEvent` audit trail.

---

## 8. Database Schema & RLS Policies

- **Tables**: `public.opportunities`, `public.proposals`, `public.opportunity_activities`.
- **Row Level Security (RLS)**: Enforces tenant isolation (`workspace_id = auth.jwt() -> workspace_id`). Users can only access opportunities within their assigned workspace.
