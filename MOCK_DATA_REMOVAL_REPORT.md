# CHATR Desktop Platform — Mock Data Elimination Report

**Priority**: P0 (General Availability Requirement)  
**Target Standard**: 100% Production Data Hygiene (Zero Mock / Demo Fallbacks)  
**Date**: August 3, 2026  

---

## 📑 Complete Mock Data Removal Inventory

| File | Component / Constant | Data Removed | Production Replacement | Priority |
|---|---|---|---|:---:|
| `types.ts` | `DEMO_CANDIDATES` | Static candidate array (`Rahul Mehta`, `Pooja Gupta`, `Vikram Das`) | Set to empty array `[]`. All records loaded via Supabase `rec_candidates` query. | **P0** |
| `InterviewSchedulerView.tsx` | `SEED_INTERVIEWS` | Static interview array (`Deepak Rao`, `Sanjay Iyer`, `Tanvi Shah`) | Deleted array. Active interviews queried from live database; empty state added. | **P0** |
| `OnboardingTrackerView.tsx` | `SEED_ONBOARDING_HIRES` | Static onboarding array (`Rahul Mehta`, `Pooja Gupta`, `Ankit Gupta`) | Deleted array. Real-time onboarding records loaded via Supabase stage transition events. | **P0** |
| `JobRequisitionsView.tsx` | Static JD fallback strings | Hardcoded job templates | Replaced with dynamic AI JD Generator (`generateFullJD`) & live database records. | **P1** |
| `CandidatePipelineView.tsx` | Static `KpiCard` trends | Hardcoded trend strings (`"+2 this week"`, `"+8% vs last month"`) | Replaced with dynamic count calculations over 7-day database window. | **P1** |
