// ============================================================
// CHATR Financial Intelligence & Accounting Core
// Phase 1: Financial Domain Types
// ============================================================

export type AccountingStandard = 'IFRS' | 'US_GAAP' | 'BOTH';
export type NormalBalance = 'DEBIT' | 'CREDIT';
export type PeriodStatus = 'OPEN' | 'SOFT_CLOSED' | 'CLOSED' | 'REOPENED';
export type JournalEntryStatus = 'DRAFT' | 'PENDING_APPROVAL' | 'POSTED' | 'REVERSED' | 'VOID';
export type FinEventStatus = 'PENDING' | 'PROCESSING' | 'POSTED' | 'FAILED' | 'SKIPPED';
export type RateType = 'SPOT' | 'AVERAGE' | 'CLOSING' | 'HISTORICAL' | 'BUDGET';

export type AccountType =
  | 'ASSET' | 'LIABILITY' | 'EQUITY' | 'REVENUE' | 'EXPENSE'
  | 'CONTRA_ASSET' | 'CONTRA_LIABILITY' | 'CONTRA_REVENUE' | 'CONTRA_EXPENSE';

export type EntryType =
  | 'STANDARD' | 'REVERSAL' | 'CORRECTING' | 'ADJUSTMENT'
  | 'ACCRUAL' | 'PREPAID' | 'DEPRECIATION' | 'AMORTIZATION'
  | 'INTERCOMPANY' | 'CLOSING' | 'OPENING' | 'RESTATEMENT'
  | 'REVENUE_RECOGNITION' | 'BANK_RECONCILIATION' | 'FX_REVALUATION';

// ── Financial Organization ──────────────────────────────────

export interface FinOrganization {
  id: string;
  sys_organization_id: string;
  legal_name: string;
  timezone: string;
  fiscal_year_start_month: number;
  fiscal_year_start_day: number;
  base_currency: string;
  reporting_currency: string;
  multi_currency_enabled: boolean;
  accounting_standard: AccountingStandard;
  approval_threshold_amount: number;
  approval_threshold_currency: string;
  mandatory_hitl_operations: string[];
  settings: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

// ── Legal Entity ────────────────────────────────────────────

export interface FinLegalEntity {
  id: string;
  fin_organization_id: string;
  legal_name: string;
  entity_code: string;
  jurisdiction: string;
  registration_number?: string;
  functional_currency: string;
  accounting_standard: AccountingStandard;
  is_consolidating: boolean;
  parent_entity_id?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

// ── Chart of Accounts ───────────────────────────────────────

export interface FinAccount {
  id: string;
  fin_organization_id: string;
  legal_entity_id?: string;
  code: string;
  name: string;
  description?: string;
  account_type: AccountType;
  account_subtype?: string;
  normal_balance: NormalBalance;
  parent_account_id?: string;
  depth: number;
  accounting_standard?: AccountingStandard;
  is_active: boolean;
  allow_direct_posting: boolean;
  is_system_account: boolean;
  require_dimensions: string[];
  tags: string[];
  fs_mapping?: string;
  created_at: string;
  updated_at: string;
  // UI-only: populated on client
  children?: FinAccount[];
}

// ── Accounting Period ───────────────────────────────────────

export interface FinPeriod {
  id: string;
  fin_organization_id: string;
  legal_entity_id?: string;
  period_name: string;
  period_type: 'MONTH' | 'QUARTER' | 'YEAR' | 'CUSTOM';
  start_date: string;
  end_date: string;
  status: PeriodStatus;
  closed_at?: string;
  closed_by?: string;
  soft_closed_at?: string;
  reopened_at?: string;
  reopened_by?: string;
  reopen_approval_id?: string;
  reopen_reason?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
}

// ── Financial Source Event ──────────────────────────────────

export interface FinEvent {
  id: string;
  idempotency_key: string;
  event_type: string;
  event_version: string;
  source_system: string;
  source_object_type?: string;
  source_object_id?: string;
  fin_organization_id: string;
  legal_entity_id?: string;
  correlation_id?: string;
  causation_id?: string;
  payload: Record<string, unknown>;
  schema_version: string;
  processing_status: FinEventStatus;
  processed_at?: string;
  error_detail?: string;
  retry_count: number;
  created_at: string;
}

// ── FX Rate ────────────────────────────────────────────────

export interface FinFxRate {
  id: string;
  fin_organization_id: string;
  from_currency: string;
  to_currency: string;
  rate: number;
  rate_type: RateType;
  effective_date: string;
  source: string;
  notes?: string;
  created_by?: string;
  created_at: string;
}

// ── Monetary Amount (multi-currency primitive) ──────────────

export interface MonetaryAmount {
  amount: number;
  currency: string;
  functional_amount?: number;
  functional_currency?: string;
  reporting_amount?: number;
  reporting_currency?: string;
  fx_rate?: number;
  fx_rate_source?: string;
  fx_date?: string;
}

// ── Journal Entry ───────────────────────────────────────────

export interface FinJournalEntry {
  id: string;
  fin_organization_id: string;
  legal_entity_id: string;
  period_id: string;
  entry_number: string;
  posting_date: string;
  transaction_currency: string;
  functional_currency: string;
  reporting_currency: string;
  fx_rate: number;
  fx_rate_functional: number;
  fx_rate_reporting: number;
  fx_rate_source: string;
  fx_date?: string;
  // Source lineage (THE core differentiator)
  source_event_id?: string;
  source_type: string;
  source_id?: string;
  source_url?: string;
  entry_type: EntryType;
  accounting_standard: AccountingStandard;
  policy_version_id?: string;
  status: JournalEntryStatus;
  reversal_of_id?: string;
  reversed_by_id?: string;
  reversal_date?: string;
  approval_id?: string;
  approved_by?: string;
  approved_at?: string;
  memo?: string;
  reference?: string;
  tags: string[];
  ai_proposed: boolean;
  ai_confidence?: number;
  ai_rationale?: string;
  created_by: string;
  posted_by?: string;
  posted_at?: string;
  voided_by?: string;
  voided_at?: string;
  void_reason?: string;
  created_at: string;
  updated_at: string;
  // UI-only: populated on client
  lines?: FinJournalLine[];
  period?: FinPeriod;
  source_event?: FinEvent;
  legal_entity?: FinLegalEntity;
}

// ── Journal Line ────────────────────────────────────────────

export interface FinJournalLine {
  id: string;
  journal_entry_id: string;
  line_number: number;
  account_id: string;
  debit_amount: number;
  credit_amount: number;
  currency: string;
  functional_debit: number;
  functional_credit: number;
  reporting_debit: number;
  reporting_credit: number;
  legal_entity_id?: string;
  department_id?: string;
  project_id?: string;
  cost_center?: string;
  customer_id?: string;
  vendor_id?: string;
  contract_id?: string;
  memo?: string;
  // UI-only
  account?: FinAccount;
}

// ── Ledger Balance (Materialized View) ─────────────────────

export interface FinLedgerBalance {
  fin_organization_id: string;
  legal_entity_id: string;
  period_id: string;
  period_start: string;
  period_end: string;
  period_name: string;
  account_id: string;
  account_code: string;
  account_name: string;
  account_type: AccountType;
  normal_balance: NormalBalance;
  currency: string;
  total_debit: number;
  total_credit: number;
  net_debit_balance: number;
  functional_total_debit: number;
  functional_total_credit: number;
  functional_net_balance: number;
  reporting_total_debit: number;
  reporting_total_credit: number;
  reporting_net_balance: number;
  entry_count: number;
  last_posted_at?: string;
}

// ── Accounting Policy ───────────────────────────────────────

export interface FinAccountingPolicy {
  id: string;
  fin_organization_id: string;
  legal_entity_id?: string;
  policy_type: string;
  name: string;
  description?: string;
  version: number;
  accounting_standard: AccountingStandard;
  effective_from: string;
  effective_to?: string;
  status: 'DRAFT' | 'ACTIVE' | 'SUPERSEDED' | 'ARCHIVED';
  rule_definition: Record<string, unknown>;
  author_id: string;
  approved_by?: string;
  approved_at?: string;
  approval_id?: string;
  supersedes_id?: string;
  created_at: string;
  updated_at: string;
}

// ── Validation Result ───────────────────────────────────────

export interface EntryValidationResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
  summary: {
    line_count: number;
    total_functional_debit: number;
    total_functional_credit: number;
    balance_diff: number;
  };
}

// ── Posting Result ──────────────────────────────────────────

export interface PostingResult {
  success: boolean;
  journal_entry_id?: string;
  entry_number?: string;
  posted_at?: string;
  error?: string;
  requires_approval?: boolean;
}

// ── Idempotency Check Result ────────────────────────────────

export interface IdempotencyCheckResult {
  exists: boolean;
  event_id: string | null;
  processing_status: FinEventStatus | null;
  processed_at: string | null;
  error_detail: string | null;
}

// ── Helper: format currency ─────────────────────────────────

export function formatCurrency(amount: number, currency: string, locale = 'en-IN'): string {
  return new Intl.NumberFormat(locale, { style: 'currency', currency, minimumFractionDigits: 2 }).format(amount);
}

// ── Helper: account type to color ──────────────────────────

export function accountTypeColor(type: AccountType): string {
  const map: Record<AccountType, string> = {
    ASSET: 'blue', LIABILITY: 'red', EQUITY: 'purple',
    REVENUE: 'green', EXPENSE: 'orange',
    CONTRA_ASSET: 'cyan', CONTRA_LIABILITY: 'pink',
    CONTRA_REVENUE: 'yellow', CONTRA_EXPENSE: 'amber',
  };
  return map[type] ?? 'gray';
}

// ── Mandatory HITL operation types ─────────────────────────

export const MANDATORY_HITL_OPERATIONS = [
  'payment_initiation',
  'bank_account_change',
  'accounting_policy_change',
  'closed_period_posting',
  'revenue_recognition_override',
  'tax_adjustment',
  'cash_affecting_manual_journal',
  'revenue_affecting_manual_journal',
  'intercompany_adjustment',
  'write_off',
  'high_risk_ai_action',
  'coa_structure_change',
] as const;

export type MandatoryHitlOperation = typeof MANDATORY_HITL_OPERATIONS[number];
