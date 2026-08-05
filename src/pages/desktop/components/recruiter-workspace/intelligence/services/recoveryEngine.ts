/**
 * Resume Intelligence OS v3.0 — Recovery Engine
 *
 * Second-pass resolver invoked only when primary extraction yields "Unverified".
 * Preserves fail-closed policy while maximising recall.
 *
 * Flow:
 *   Primary extraction → "Employer Unverified"
 *       ↓
 *   Employment Section Resolver (targeted second pass)
 *       ↓
 *   Still missing → "Employer Unverified" (fail-closed)
 *
 * Recovery attempts are logged to DecisionRegistry.
 * Recovery NEVER bypasses field contracts — it feeds additional entity candidates.
 */

import type { SemanticEntity, ClassificationContext, LayoutRegion } from '../core/types';
import { decisionRegistry } from '../core/decisionRegistry';

// ─── Recovery Attempt ─────────────────────────────────────────────────────────

export interface RecoveryAttempt {
  fieldKey: string;
  strategy: RecoveryStrategy;
  extractedValue: string | null;
  confidence: number;
  reason: string;
  succeeded: boolean;
}

export type RecoveryStrategy =
  | 'employment-section-scan'    // Re-scan employment region with relaxed patterns
  | 'header-fallback'            // Try header section for employer name
  | 'email-domain-hint'          // "name@ibm.com" → IBM
  | 'file-name-hint'             // "john_ibm_resume.pdf" → IBM
  | 'previous-employer-promote'  // Use most recent previous employer as current
  | 'designation-context';       // Designation found → infer employer region

// ─── Patterns ─────────────────────────────────────────────────────────────────

const EMPLOYMENT_SECTION_HEADERS = /^(employment|experience|work\s+history|career|professional\s+background|positions?\s+held)/i;
const COMPANY_STRONG_RE = /\b(pvt\.?\s*ltd\.?|ltd\.?|inc\.?|corp\.?|corporation|technologies|solutions|infotech|software|systems|services|consulting|labs|group|holdings|llp|llc|gmbh|plc|hospital|institute|university|bank)\b/i;
const RESPONSIBILITY_RE = /^(responsible\s+for|handling|managed|developed|configured|implemented|strive|working|providing|ensuring|creating|leading|building)/i;

// ─── Strategy Implementations ─────────────────────────────────────────────────

function tryEmploymentSectionScan(lines: string[], candidateId: string): RecoveryAttempt {
  let inEmployment = false;
  for (const line of lines) {
    if (!line || line.length < 2) continue;
    if (EMPLOYMENT_SECTION_HEADERS.test(line)) { inEmployment = true; continue; }
    if (!inEmployment) continue;
    if (RESPONSIBILITY_RE.test(line)) continue;
    if (COMPANY_STRONG_RE.test(line) && line.split(' ').length <= 8) {
      const value = line.trim().replace(/[^\w\s&.,'-]/g, ' ').replace(/\s+/g, ' ').trim();
      decisionRegistry.record({
        candidateId,
        entityId: `recovery-emp-${Date.now()}`,
        rawSpan: line,
        canonicalForm: value,
        proposedType: 'Employer',
        finalType: 'Employer',
        outcome: 'accepted',
        ruleId: 'recovery-employment-scan',
        ruleName: 'Employment Section Recovery Scan',
        stage: 'recovery',
        confidence: 0.65,
        reason: `Recovery: found company suffix in employment section: "${value}"`,
        targetFieldKey: 'current_company',
      });
      return { fieldKey: 'current_company', strategy: 'employment-section-scan', extractedValue: value, confidence: 0.65, reason: `Found in employment section: "${value}"`, succeeded: true };
    }
  }
  return { fieldKey: 'current_company', strategy: 'employment-section-scan', extractedValue: null, confidence: 0, reason: 'No company found in employment section', succeeded: false };
}

function tryEmailDomainHint(email: string | undefined, candidateId: string): RecoveryAttempt {
  if (!email) return { fieldKey: 'current_company', strategy: 'email-domain-hint', extractedValue: null, confidence: 0, reason: 'No email available', succeeded: false };
  const domain = email.split('@')[1]?.split('.')[0];
  const FREE_DOMAINS = ['gmail', 'yahoo', 'hotmail', 'outlook', 'rediffmail', 'icloud', 'protonmail', 'ymail'];
  if (!domain || FREE_DOMAINS.includes(domain.toLowerCase())) {
    return { fieldKey: 'current_company', strategy: 'email-domain-hint', extractedValue: null, confidence: 0, reason: 'Free email domain — no employer hint', succeeded: false };
  }
  const value = domain.charAt(0).toUpperCase() + domain.slice(1);
  decisionRegistry.record({ candidateId, entityId: `recovery-email-${Date.now()}`, rawSpan: email, canonicalForm: value, proposedType: 'Employer', finalType: 'Employer', outcome: 'accepted', ruleId: 'recovery-email-domain', ruleName: 'Email Domain Employer Hint', stage: 'recovery', confidence: 0.40, reason: `Email domain suggests employer: ${value}`, targetFieldKey: 'current_company' });
  return { fieldKey: 'current_company', strategy: 'email-domain-hint', extractedValue: value, confidence: 0.40, reason: `Email domain hint: "${email}" → "${value}"`, succeeded: true };
}

function tryFileNameHint(fileName: string | undefined, candidateId: string): RecoveryAttempt {
  if (!fileName) return { fieldKey: 'current_company', strategy: 'file-name-hint', extractedValue: null, confidence: 0, reason: 'No filename available', succeeded: false };
  // Strip extension, split on underscores/hyphens, look for capitalized tokens > 3 chars
  const tokens = fileName.replace(/\.[^.]+$/, '').split(/[_\-\s]+/).filter(t => t.length > 3 && /^[A-Z]/.test(t) && !/resume|cv|curriculum|vitae/i.test(t));
  if (tokens.length === 0) return { fieldKey: 'current_company', strategy: 'file-name-hint', extractedValue: null, confidence: 0, reason: 'No employer token in filename', succeeded: false };
  const value = tokens[0];
  return { fieldKey: 'current_company', strategy: 'file-name-hint', extractedValue: value, confidence: 0.30, reason: `Filename hint: "${fileName}" → "${value}"`, succeeded: true };
}

function tryPreviousEmployerPromote(previousEmployers: string[], candidateId: string): RecoveryAttempt {
  const first = previousEmployers.find(e => e && !e.toLowerCase().includes('unverified'));
  if (!first) return { fieldKey: 'current_company', strategy: 'previous-employer-promote', extractedValue: null, confidence: 0, reason: 'No valid previous employers', succeeded: false };
  return { fieldKey: 'current_company', strategy: 'previous-employer-promote', extractedValue: first, confidence: 0.50, reason: `Promoted previous employer: "${first}"`, succeeded: true };
}

// ─── Recovery Engine ──────────────────────────────────────────────────────────

export interface RecoveryContext {
  candidateId: string;
  rawLines: string[];
  email?: string;
  fileName?: string;
  previousEmployers?: string[];
  currentRole?: string;
}

export interface RecoveryResult {
  fieldKey: string;
  resolvedValue: string | null;
  strategy: RecoveryStrategy | null;
  confidence: number;
  attempts: RecoveryAttempt[];
}

/**
 * Attempt employer recovery through a prioritised cascade of strategies.
 * Returns the first successful result with confidence ≥ 0.30.
 * If all fail, returns null — field stays "Employer Unverified".
 */
export function recoverEmployer(ctx: RecoveryContext): RecoveryResult {
  const attempts: RecoveryAttempt[] = [];

  // Strategy 1: Employment section scan (highest precision)
  const scan = tryEmploymentSectionScan(ctx.rawLines, ctx.candidateId);
  attempts.push(scan);
  if (scan.succeeded && scan.confidence >= 0.55) {
    return { fieldKey: 'current_company', resolvedValue: scan.extractedValue, strategy: scan.strategy, confidence: scan.confidence, attempts };
  }

  // Strategy 2: Email domain (moderate signal)
  const emailHint = tryEmailDomainHint(ctx.email, ctx.candidateId);
  attempts.push(emailHint);
  if (emailHint.succeeded && emailHint.confidence >= 0.35) {
    return { fieldKey: 'current_company', resolvedValue: emailHint.extractedValue, strategy: emailHint.strategy, confidence: emailHint.confidence, attempts };
  }

  // Strategy 3: File name (weak signal)
  const fileHint = tryFileNameHint(ctx.fileName, ctx.candidateId);
  attempts.push(fileHint);

  // Strategy 4: Promote most recent previous employer
  const prevPromo = tryPreviousEmployerPromote(ctx.previousEmployers ?? [], ctx.candidateId);
  attempts.push(prevPromo);
  if (prevPromo.succeeded) {
    return { fieldKey: 'current_company', resolvedValue: prevPromo.extractedValue, strategy: prevPromo.strategy, confidence: prevPromo.confidence, attempts };
  }

  // All failed
  return { fieldKey: 'current_company', resolvedValue: null, strategy: null, confidence: 0, attempts };
}

/**
 * Attempt role recovery — relaxed designation pattern on all lines.
 */
export function recoverRole(ctx: RecoveryContext): RecoveryResult {
  const BROAD_DESIG_RE = /\b(Senior|Lead|Principal|Chief|Head|Junior|Jr\.?)?[- ]?(Full[- ]?Stack|Software|MERN|\.NET|Java|SAP|Cloud|DevOps|Network|Security|Data|QA|Test|System|IT|Frontend|Backend|Mobile|Embedded|Mechanical|Civil|Chemical|Structural|Electrical|Biomedical|Financial|HR|Legal|Medical|Pilot|Captain|Research|Marketing)[- ]?(Engineer|Developer|Consultant|Architect|Analyst|Executive|Manager|Lead|Director|Specialist|Officer|Physician|Attorney|Counsel|Researcher|Scientist|Pilot)s?\b/i;

  for (const line of ctx.rawLines) {
    if (!line || line.length < 4 || line.length > 100) continue;
    const m = line.match(BROAD_DESIG_RE);
    if (m && m[0].length >= 5) {
      return { fieldKey: 'current_designation', resolvedValue: m[0].trim(), strategy: 'employment-section-scan', confidence: 0.60, attempts: [{ fieldKey: 'current_designation', strategy: 'employment-section-scan', extractedValue: m[0].trim(), confidence: 0.60, reason: `Broad designation pattern match: "${m[0]}"`, succeeded: true }] };
    }
  }
  return { fieldKey: 'current_designation', resolvedValue: null, strategy: null, confidence: 0, attempts: [] };
}
