# CHATR Desktop Platform — Production Empty State Strategy Report

---

## 📋 Actionable Production Empty States

| Screen | Empty State Condition | User Guidance Message | Encouraged User Action |
|---|---|---|---|
| **Candidates Directory** | 0 records in `rec_candidates` | "No candidates in pipeline yet." | "Import CV" / "Create First Candidate" |
| **Job Requisitions** | 0 records in `rec_jobs` | "No active job requisitions." | "Create New Requisition" / "Import Jobs" |
| **Scheduled Interviews** | 0 records in `rec_interviews` | "No interviews scheduled yet. Interviews scheduled for pipeline candidates will auto-sync here." | "Schedule First Interview" |
| **Onboarding Tracker** | 0 records in onboarding | "No active onboarding workflows. Moving candidates to Offer or Joined stage will auto-initiate workflows." | "Go to Pipeline" |
| **Notifications** | 0 event bus items | "You are all caught up! Zero unread notifications." | System passive state |
