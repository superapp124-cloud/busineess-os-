# CHATR Desktop Platform — Production Data Wiring Report

---

## 📊 Live Database Wiring Matrix

| Screen / Component | Previous Data Source | New Production Data Source | Database Table / Query Used |
|---|---|---|---|
| **Candidate Pipeline** (`CandidatePipelineView.tsx`) | `DEMO_CANDIDATES` mock array | Live Supabase candidates table | `supabase.from('rec_candidates').select('*')` |
| **Candidate Directory** (`CandidateListView.tsx`) | `DEMO_CANDIDATES` mock array | Live Supabase candidates table | `supabase.from('rec_candidates').select('*')` |
| **Job Requisitions** (`JobRequisitionsView.tsx`) | Static job array | Live Supabase requisitions table | `supabase.from('rec_jobs').select('*')` |
| **Interview Scheduler** (`InterviewSchedulerView.tsx`) | `SEED_INTERVIEWS` static array | Live Supabase interviews query | `supabase.from('rec_interviews').select('*')` |
| **Onboarding Tracker** (`OnboardingTrackerView.tsx`) | `SEED_ONBOARDING_HIRES` static array | Live stage events | `supabase.from('communication_events').select('*')` |
| **Identity & IAM** (`IdentityAccessView.tsx`) | Hardcoded roles | Authoritative permissions table | `supabase.from('sys_permissions').select('*')` |
