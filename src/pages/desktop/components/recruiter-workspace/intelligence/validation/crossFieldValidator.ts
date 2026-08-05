/**
 * Resume Intelligence OS v3.0 — Cross-Field Validator
 *
 * Validates relationships BETWEEN fields after individual field contracts pass.
 * Ensures that employer, role, skills, and education are internally consistent.
 *
 * Examples of cross-field rules:
 * - Employer must not equal Role
 * - If employer is a staffing agency, role must not be blank
 * - Email domain should not contradict stated employer (heuristic, low weight)
 * - Skills in skill region must not duplicate employer/company names
 */

import type { SemanticEntity } from '../core/types';
import type { CandidateKnowledgeGraph } from '../graphs/knowledgeGraph';

// ─── Validation Result ────────────────────────────────────────────────────────

export interface CrossFieldViolation {
  rule: string;
  fieldA: string;
  fieldB: string;
  valueA: string;
  valueB: string;
  severity: 'error' | 'warning';
  description: string;
}

export interface CrossFieldValidationResult {
  isValid: boolean;
  violations: CrossFieldViolation[];
  warnings: CrossFieldViolation[];
}

// ─── Rule Definitions ─────────────────────────────────────────────────────────

function ruleEmployerNotEqualRole(graph: CandidateKnowledgeGraph): CrossFieldViolation | null {
  const emp = graph.career.employmentHistory[0];
  if (!emp) return null;
  if (emp.employer && emp.role && emp.employer.toLowerCase().trim() === emp.role.toLowerCase().trim()) {
    return {
      rule: 'EMPLOYER_NOT_EQUAL_ROLE',
      fieldA: 'current_company', fieldB: 'current_designation',
      valueA: emp.employer, valueB: emp.role,
      severity: 'error',
      description: `Employer "${emp.employer}" and role "${emp.role}" are identical — likely extraction error`,
    };
  }
  return null;
}

function ruleSkillsNotContainEmployer(
  entities: SemanticEntity[],
  graph: CandidateKnowledgeGraph
): CrossFieldViolation | null {
  const emp = graph.career.employmentHistory[0];
  if (!emp?.employer) return null;

  const empLower = emp.employer.toLowerCase();
  const skillAsEmployer = entities.find(e =>
    ['TechnicalSkill', 'DomainSkill', 'PlatformSkill'].includes(e.canonicalType) &&
    e.value.toLowerCase() === empLower
  );

  if (skillAsEmployer) {
    return {
      rule: 'SKILL_NOT_EMPLOYER_NAME',
      fieldA: 'skills', fieldB: 'current_company',
      valueA: skillAsEmployer.value, valueB: emp.employer,
      severity: 'warning',
      description: `Entity "${skillAsEmployer.value}" was classified as a skill but matches the employer name — possible mis-classification`,
    };
  }
  return null;
}

function ruleEmailNotBlankWhenNameExists(graph: CandidateKnowledgeGraph): CrossFieldViolation | null {
  const name = graph.identity.person.name;
  const email = graph.identity.contacts.email;
  if (name && name !== 'Candidate' && !email) {
    return {
      rule: 'EMAIL_EXPECTED_WITH_NAME',
      fieldA: 'first_name', fieldB: 'email',
      valueA: name, valueB: '',
      severity: 'warning',
      description: `Candidate name "${name}" found but no email address extracted`,
    };
  }
  return null;
}

function ruleCurrentEmployerHasRole(graph: CandidateKnowledgeGraph): CrossFieldViolation | null {
  const emp = graph.career.employmentHistory.find(e => e.isCurrent);
  if (emp && emp.employer !== 'Employer Unverified' && !emp.role) {
    return {
      rule: 'CURRENT_EMPLOYER_MISSING_ROLE',
      fieldA: 'current_company', fieldB: 'current_designation',
      valueA: emp.employer, valueB: '',
      severity: 'warning',
      description: `Current employer "${emp.employer}" found but no role/designation extracted for this period`,
    };
  }
  return null;
}

function ruleNoProseInEmployer(graph: CandidateKnowledgeGraph): CrossFieldViolation | null {
  const emp = graph.career.employmentHistory[0];
  if (!emp?.employer) return null;
  const PROSE_RE = /^(responsible|handled|managed|working|developing|strive|seeking|looking)/i;
  if (PROSE_RE.test(emp.employer)) {
    return {
      rule: 'EMPLOYER_CONTAINS_PROSE',
      fieldA: 'current_company', fieldB: '',
      valueA: emp.employer, valueB: '',
      severity: 'error',
      description: `Employer field "${emp.employer}" contains prose/action-verb text — must be rejected`,
    };
  }
  return null;
}

// ─── Main Validator ───────────────────────────────────────────────────────────

export function validateCrossFields(graph: CandidateKnowledgeGraph): CrossFieldValidationResult {
  const allViolations: CrossFieldViolation[] = [];

  const rules = [
    ruleEmployerNotEqualRole(graph),
    ruleSkillsNotContainEmployer(graph.allEntities, graph),
    ruleEmailNotBlankWhenNameExists(graph),
    ruleCurrentEmployerHasRole(graph),
    ruleNoProseInEmployer(graph),
  ];

  for (const v of rules) {
    if (v) allViolations.push(v);
  }

  const errors   = allViolations.filter(v => v.severity === 'error');
  const warnings = allViolations.filter(v => v.severity === 'warning');

  return {
    isValid: errors.length === 0,
    violations: errors,
    warnings,
  };
}
