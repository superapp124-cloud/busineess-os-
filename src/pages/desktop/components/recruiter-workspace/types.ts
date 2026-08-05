/**
 * RecruiterWorkspace Types & Shared Constants
 */

export type TosTab = 'dashboard' | 'clients' | 'sourcing' | 'pipeline' | 'candidates' | 'interviews' | 'jobs' | 'offers' | 'vendors' | 'analytics' | 'copilot' | 'onboarding' | 'governance' | 'sales' | 'bench' | 'delivery';
export type CandidateStage = 'Applied' | 'Screening' | 'Assessment' | 'Interview' | 'Offer' | 'Joined' | 'Rejected';
export type PriorityLevel = 'High' | 'Medium' | 'Low';
export type RiskLevel = 'Low' | 'Medium' | 'High';
export type SalaryFit = 'Within Band' | 'Above Band' | 'Below Band';
export type InterviewType = 'HR' | 'Technical' | 'Manager' | 'Client' | 'Panel' | 'Behavioral' | 'Final';
export type OnboardingStep = 'offer_accepted' | 'documents' | 'background_check' | 'it_request' | 'laptop' | 'email_setup' | 'payroll' | 'hrms' | 'welcome_kit' | 'orientation' | 'employee_created';

export type UserRole = 'Executive' | 'Recruitment Manager' | 'Team Lead' | 'Recruiter' | 'Sourcer' | 'HR Coordinator' | 'Vendor Partner' | 'Client Hiring Manager';
export type PermissionLevel = 'No Access' | 'View' | 'Comment' | 'Create' | 'Edit' | 'Approve' | 'Delete' | 'Admin';

export interface TeamUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  team_name: string;
  client_scopes: string[];
  ai_sourcing_access: boolean;
  ai_agent_access: boolean;
  export_access: boolean;
}

export interface AuditLogEntry {
  id: string;
  timestamp: string;
  actor_name: string;
  actor_role: string;
  action: string;
  target: string;
  ip_address: string;
}

export interface ClientWorkspace {
  id: string;
  name: string;
  industry: string;
  contract_type: 'Permanent' | 'Contract' | 'RPO' | 'Executive Search';
  bill_rate?: string;
  pay_rate?: string;
  margin_pct?: number;
  placement_fee_pct?: number;
  spoc_name: string;
  spoc_email: string;
  spoc_phone?: string;
  active_jobs_count?: number;
  active_candidates_count?: number;
  created_at?: string;
}

export interface VendorPartner {
  id: string;
  company_name: string;
  spoc_name: string;
  spoc_email: string;
  spoc_phone?: string;
  submitted_candidates_count: number;
  selection_ratio_pct: number;
  duplicate_rate_pct: number;
  sla_compliance_pct: number;
  payment_status: 'Current' | 'Pending Invoice' | 'Overdue';
}

export interface CandidateWorkHistory {
  company: string;
  role: string;
  start_year: string;
  end_year: string;
  duration?: string;
  ctc: string;
  reason_for_leaving: string;
}

export interface CandidateAcademicProfile {
  professional_categories: string[];
  primary_domains: string[];
  education: string[];
  research: string[];
  leadership: string[];
  awards: string[];
}

export interface CandidateDoc {
  name: string;
  type: string;
  date: string;
  url?: string;
}

export interface CandidateSourceArtifact {
  id: string;
  original_file_name: string;
  mime_type: string;
  storage_path?: string;
  native_text?: string;
  ocr_output?: string;
  layout_graph?: unknown;
  knowledge_graph?: unknown;
  parser_versions: Record<string, string>;
  parsed_at: string;
  parse_history: Array<{
    parsed_at: string;
    parser_versions: Record<string, string>;
    knowledge_graph?: unknown;
  }>;
}

export interface CandidatePassportV3 {
  identity: {
    candidate_name: string;
    candidate_id: string;
    email: string;
    phone: string | null;
    linkedin: string | null;
    github: string | null;
    portfolio: string | null;
    current_city: string | null;
    current_state: string | null;
    country: string | null;
    visa_status: string | null;
    preferred_location: string | null;
    remote_preference: string | null;
    relocation_willingness: boolean | null;
  };
  experience: {
    total_years: number | null;
    relevant_years: number | null;
    leadership_years: number | null;
    gap_analysis: string | null;
    average_tenure_years: number | null;
  };
  employment_history: Array<{
    company_name: string;
    designation: string;
    joining_date?: string;
    exit_date?: string;
    duration?: string;
    location?: string;
    is_current: boolean;
    achievements?: string[];
  }>;
  skills: {
    raw: string[];
    normalized: string[];
    primary: string[];
    secondary: string[];
  };
  domain_classification: string[];
  projects: Array<{
    title: string;
    client?: string;
    role?: string;
    tech_stack?: string[];
  }>;
  certifications: Array<{
    name: string;
    issuer?: string;
    year?: string;
  }>;
  education: Array<{
    degree: string;
    specialization?: string;
    university?: string;
    passing_year?: string;
  }>;
  compensation: {
    current_ctc: number | null;
    expected_ctc: number | null;
    currency: string;
  };
  availability: {
    notice_period_days: number | null;
    serving_notice: boolean;
    last_working_day: string | null;
  };
  contact_validation: {
    email_status: 'Verified' | 'Missing' | 'Invalid';
    phone_status: 'Verified' | 'Missing' | 'Invalid';
  };
  resume_quality: {
    profile_completeness_pct: number;
    contact_completeness_pct: number;
    employment_completeness_pct: number;
    skills_completeness_pct: number;
  };
  ai_intelligence: {
    executive_summary: string;
    candidate_strengths: string[];
    potential_risks: string[];
    career_stability_score: number;
    health_score: number;
  };
}

export interface Candidate {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string | null;
  status: string;
  applied_for: string | null;
  created_at?: string;
  current_company?: string;
  company_name_raw?: string;
  company_name_normalized?: string;
  company_id?: string;
  experience_years?: number;
  notice_days?: number;
  expected_ctc?: number;
  current_ctc?: number;
  location?: string;
  preferred_locations?: string[];
  work_authorization?: string;
  passport_visa_status?: string;
  work_mode_preference?: 'Remote' | 'Hybrid' | 'Onsite';
  skills?: string[];
  ai_match?: number;
  ai_matched_skills?: string[];
  ai_missing_skills?: string[];
  recruiter?: string;
  priority?: PriorityLevel;
  risk?: RiskLevel;
  salary_fit?: SalaryFit;
  availability?: string;
  serving_notice?: boolean;
  last_working_day?: string;
  earliest_joining_date?: string;
  counter_offer_risk?: 'Low' | 'Medium' | 'High';
  interviewing_elsewhere?: boolean;
  stage_entered_at?: string;
  is_demo?: boolean;

  candidate_id_code?: string;
  health_score?: number;
  joining_probability?: number;

  // Digital Presence & Academic Provenance
  linkedin_url?: string;
  github_url?: string;
  portfolio_url?: string;
  website_url?: string;
  education_history?: string[];
  certifications?: string[];
  publications?: Array<{ title: string; url?: string; authors?: string }>;
  buyout_possible?: boolean;
  fixed_ctc?: number;
  variable_ctc?: number;
  hike_pct?: number;
  source_channel?: 'Naukri' | 'LinkedIn' | 'Referral' | 'Official Email' | 'Database';
  resume_version?: string;
  ai_recommendation?: string;
  previous_employers?: string[];
  major_clients?: string[];
  industry_focus?: string[];
  project_types?: string[];
  executive_summary?: string;
  recruiter_owner?: string;
  sla_days?: number;
  sla_overdue?: boolean;
  current_designation?: string;

  is_primary_duplicate?: boolean;
  duplicate_count?: number;
  duplicate_profiles?: Candidate[];
  passport_v3?: CandidatePassportV3;

  ai_breakdown?: {
    overall: number;
    technical: number;
    domain: number;
    culture: number;
    salary: number;
    location: number;
    availability: number;
    communication: number;
  };

  health_score?: {
    overall_readiness: number;
    joining_risk: 'Low' | 'Medium' | 'High';
    counter_offer_risk: 'Low' | 'Medium' | 'High';
    doc_status: string;
  };

  work_history?: CandidateWorkHistory[];
  academic_profile?: CandidateAcademicProfile;
  source_artifact?: CandidateSourceArtifact;
  documents?: CandidateDoc[];
  vendor_id?: string;
  vendor_name?: string;
  rtr_status?: boolean;

  /** Evidence gate result. Resume intelligence must not be generated when false. */
  evidence_sufficiency?: {
    is_sufficient: boolean;
    document_type: 'Resume' | 'Academic CV' | 'Email Signature / Contact Card' | 'Unknown';
    verified_evidence: string[];
    missing_evidence: string[];
    reason: string;
    classification_confidence?: number;
  };

  // v2.0 MULTI-ENGINE TRACEABILITY & KNOWLEDGE GRAPH PIPELINE
  traceability_matrix?: Record<string, FieldTraceability>;
  knowledge_graph?: CandidateKnowledgeGraph;

  // v2.0.1 MEASURABLE COVERAGE & TRUTH METRICS
  truth_score?: number;
  schema_coverage_pct?: number;
  evidence_coverage_pct?: number;
  hallucination_rate_pct?: number;
  engine_provenance?: {
    engine_version: string;
    extraction_model: string;
    ontology_version: string;
    normalization_version: string;
    ocr_strategy: string;
    llm_prompt: string;
  };
}

export interface FieldTraceability {
  field_name: string;
  original_text: string;
  normalized_value: string;
  canonical_id?: string;
  confidence_score: number;
  source_span?: string;
  source_page?: number;
  source_section?: string;
  extraction_engine: string;
  contradiction_status?: 'Verified (No Conflict)' | 'Conflict Detected (Manual Review Recommended)';
  normalization_history?: string[];
}

export interface CandidateKnowledgeGraph {
  nodes: Array<{ id: string; label: string; type: 'Candidate' | 'Employer' | 'Designation' | 'Skill' | 'Domain' | 'Project' | 'Location' }>;
  edges: Array<{ from: string; to: string; relation: string }>;
}

export interface Requisition {
  id: string;
  title: string;
  location: string;
  type: string;
  status: string;
  department?: string;
  client_name?: string;
  client_id?: string;
  created_at?: string;
  jd?: string;
  skills?: string[];
  budget?: string;
}

export interface AutomationEvent {
  id: string;
  event_type: string;
  candidate_id: string | null;
  payload: Record<string, unknown>;
  created_at: string;
}

export interface MobileAction {
  id: string;
  action_type: string;
  candidate_id: string | null;
  payload: Record<string, unknown>;
  status: string;
  created_at: string;
}

export interface CopilotMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  loading?: boolean;
}

export interface ActivityItem {
  id: string;
  type: 'stage_change' | 'interview' | 'offer' | 'joined' | 'rejected' | 'comment';
  candidateName: string;
  initials: string;
  avatarColor: string;
  message: string;
  time: Date;
  stage?: CandidateStage;
}

export interface OnboardingRecord {
  candidateId: string;
  candidateName: string;
  role: string;
  startDate: string;
  completionPct: number;
  steps: Record<OnboardingStep, boolean>;
}

// ─── Stage Configuration ──────────────────────────────────────────────────────

export const PIPELINE_STAGES: CandidateStage[] = ['Applied', 'Screening', 'Assessment', 'Interview', 'Offer', 'Joined', 'Rejected'];

export const STAGE_SLA_DAYS: Record<CandidateStage, number | null> = {
  Applied: 2, Screening: 5, Assessment: 7, Interview: 10, Offer: 3, Joined: null, Rejected: null,
};

export const STAGE_META: Record<CandidateStage, {
  gradient: string; border: string; columnBg: string; badgeBg: string; badgeText: string;
  icon: string; subLabel: string; dotColor: string; textColor: string; accent: string;
}> = {
  Applied:    { gradient: 'from-slate-700 via-slate-600 to-slate-500',    border: 'border-slate-300 dark:border-slate-600',    columnBg: 'bg-slate-50/80 dark:bg-slate-900/40',      badgeBg: 'bg-slate-100 dark:bg-slate-800',     badgeText: 'text-slate-600 dark:text-slate-300',   icon: '📥', subLabel: 'New applicants',     dotColor: 'bg-slate-500',    textColor: 'text-slate-700 dark:text-slate-200',   accent: '#64748b' },
  Screening:  { gradient: 'from-blue-700 via-blue-600 to-blue-500',       border: 'border-blue-200 dark:border-blue-800',      columnBg: 'bg-blue-50/60 dark:bg-blue-950/20',        badgeBg: 'bg-blue-100 dark:bg-blue-900/40',    badgeText: 'text-blue-700 dark:text-blue-300',     icon: '🔍', subLabel: 'HR review',          dotColor: 'bg-blue-500',     textColor: 'text-blue-700 dark:text-blue-300',     accent: '#3b82f6' },
  Assessment: { gradient: 'from-indigo-700 via-indigo-600 to-indigo-500', border: 'border-indigo-200 dark:border-indigo-800',  columnBg: 'bg-indigo-50/60 dark:bg-indigo-950/20',    badgeBg: 'bg-indigo-100 dark:bg-indigo-900/40', badgeText: 'text-indigo-700 dark:text-indigo-300', icon: '📝', subLabel: 'Skills eval',        dotColor: 'bg-indigo-500',   textColor: 'text-indigo-700 dark:text-indigo-300', accent: '#6366f1' },
  Interview:  { gradient: 'from-purple-700 via-purple-600 to-violet-500', border: 'border-purple-200 dark:border-purple-800',  columnBg: 'bg-purple-50/60 dark:bg-purple-950/20',    badgeBg: 'bg-purple-100 dark:bg-purple-900/40', badgeText: 'text-purple-700 dark:text-purple-300', icon: '🎙️', subLabel: 'Active interviews',  dotColor: 'bg-purple-500',   textColor: 'text-purple-700 dark:text-purple-300', accent: '#8b5cf6' },
  Offer:      { gradient: 'from-amber-600 via-amber-500 to-orange-400',   border: 'border-amber-200 dark:border-amber-800',    columnBg: 'bg-amber-50/60 dark:bg-amber-950/20',      badgeBg: 'bg-amber-100 dark:bg-amber-900/40',  badgeText: 'text-amber-700 dark:text-amber-300',   icon: '📄', subLabel: 'Offer extended',     dotColor: 'bg-amber-500',    textColor: 'text-amber-700 dark:text-amber-300',   accent: '#f59e0b' },
  Joined:     { gradient: 'from-emerald-700 via-emerald-600 to-green-500',border: 'border-emerald-200 dark:border-emerald-800',columnBg: 'bg-emerald-50/60 dark:bg-emerald-950/20', badgeBg: 'bg-emerald-100 dark:bg-emerald-900/40',badgeText: 'text-emerald-700 dark:text-emerald-300',icon: '🎉', subLabel: 'Successfully hired', dotColor: 'bg-emerald-500',  textColor: 'text-emerald-700 dark:text-emerald-300',accent: '#10b981' },
  Rejected:   { gradient: 'from-rose-700 via-rose-600 to-red-500',        border: 'border-rose-200 dark:border-rose-800',      columnBg: 'bg-rose-50/40 dark:bg-rose-950/10',        badgeBg: 'bg-rose-100 dark:bg-rose-900/40',    badgeText: 'text-rose-700 dark:text-rose-300',     icon: '❌', subLabel: 'Not selected',      dotColor: 'bg-rose-500',     textColor: 'text-rose-700 dark:text-rose-300',     accent: '#ef4444' },
};

export const STAGE_COLORS: Record<CandidateStage, string> = {
  Applied: 'bg-slate-500', Screening: 'bg-blue-500', Assessment: 'bg-indigo-500',
  Interview: 'bg-purple-500', Offer: 'bg-amber-500', Joined: 'bg-emerald-500', Rejected: 'bg-rose-500',
};

export const AVATAR_PALETTES = [
  { bg: 'bg-violet-100 dark:bg-violet-900/50', text: 'text-violet-700 dark:text-violet-300', hex: '#7c3aed' },
  { bg: 'bg-blue-100 dark:bg-blue-900/50',     text: 'text-blue-700 dark:text-blue-300',     hex: '#2563eb' },
  { bg: 'bg-emerald-100 dark:bg-emerald-900/50',text: 'text-emerald-700 dark:text-emerald-300',hex: '#059669' },
  { bg: 'bg-rose-100 dark:bg-rose-900/50',     text: 'text-rose-700 dark:text-rose-300',     hex: '#e11d48' },
  { bg: 'bg-amber-100 dark:bg-amber-900/50',   text: 'text-amber-700 dark:text-amber-300',   hex: '#d97706' },
  { bg: 'bg-indigo-100 dark:bg-indigo-900/50', text: 'text-indigo-700 dark:text-indigo-300', hex: '#4f46e5' },
  { bg: 'bg-pink-100 dark:bg-pink-900/50',     text: 'text-pink-700 dark:text-pink-300',     hex: '#db2777' },
  { bg: 'bg-cyan-100 dark:bg-cyan-900/50',     text: 'text-cyan-700 dark:text-cyan-300',     hex: '#0891b2' },
];

export const DEMO_CANDIDATES: Candidate[] = [];
