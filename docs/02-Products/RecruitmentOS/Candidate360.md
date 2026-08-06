# Recruitment OS — Candidate 360 PRD (docs/02-Products/RecruitmentOS/Candidate360.md)

> **Status**: Active PRD Specification  
> **Target Module**: Candidate 360 & Resume Intelligence  
> **Route URL**: `/desktop/recruitment` or `/candidates/:id`

---

## 1. Purpose & Business Objective

Provide a unified, 360-degree candidate profile consolidating resume parsing, AI skill matrix extraction, interview history, activity timeline, and client placement status into a single operational interface for recruiters.

---

## 2. Primary Users & Workflows

- **Recruitment Consultant / Lead Recruiter**: Candidate sourcing, resume parsing, candidate submission to client, interview scheduling.
- **Account Manager**: Matching candidate skill profiles against open job requirements.
- **Client Hiring Manager**: Reviewing candidate AI executive summaries and interview feedback.

---

## 3. Core Functional Capabilities

- **Resume Intelligence**: Parses PDF/Docx resumes using `CandidateSummaryCapability` $\rightarrow$ OpenRouter AI to extract work history, education, skills, and contact information.
- **AI Match Score**: Calculates deterministic match score (0-100%) comparing candidate experience against job requirements.
- **Communication History**: Consolidated timeline of all emails, WhatsApp chats, call logs, and notes.

---

## 4. UI Specification & Profile Sections

- **Header**: Candidate Name, Title, Location, Current Salary, Expected Salary, Notice Period, Status (`Available`, `In Pipeline`, `Placed`, `Blacklisted`).
- **Resume Viewer Tab**: Embedded PDF preview with highlighted key skills.
- **Skill Matrix Tab**: Categorized technical and soft skills with proficiency levels.
- **Activity Timeline Tab**: Immutable event log of stage movements, client interviews, and email exchanges.

---

## 5. Security & Data Protection

- **Candidate Consent & Privacy**: Supports candidate PII redaction and `STRICT_LOCAL` privacy enforcement.
- **Permissions**: Restricted to authorized recruiters within the active workspace (`recruitment:read`, `recruitment:write`).
