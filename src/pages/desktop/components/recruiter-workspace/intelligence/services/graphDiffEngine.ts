/**
 * Resume Intelligence OS v3.0 — Graph Diff Engine
 *
 * Compares two Knowledge Graphs (Resume V1 → V2) and returns a structured
 * changelog across 7 categories recruiters care about most:
 *
 *   Identity | Career | Skills | Education | Location | Compensation | Availability
 *
 * Output example:
 *   { category: 'Career', changeType: 'promoted', label: 'Promotion detected', ... }
 *   { category: 'Skills',  changeType: 'added',    label: 'New skill: Kubernetes' }
 *   { category: 'Career',  changeType: 'changed',  label: 'Employer changed' }
 */

import type { CandidateKnowledgeGraph } from '../graphs/knowledgeGraph';
import type { CareerNode } from '../graphs/careerGraph';

// ─── Change Categories ────────────────────────────────────────────────────────

export type ChangeCategory =
  | 'Identity'
  | 'Career'
  | 'Skills'
  | 'Education'
  | 'Location'
  | 'Compensation'
  | 'Availability';

export type ChangeType = 'added' | 'removed' | 'changed' | 'promoted' | 'relocated' | 'extended';

export interface GraphChange {
  changeId: string;
  category: ChangeCategory;
  field: string;
  changeType: ChangeType;
  previousValue: string | null;
  currentValue: string | null;
  /** Recruiter-readable label */
  label: string;
  significance: 'high' | 'medium' | 'low';
  confidence: number;
}

export interface GraphDiff {
  candidateId: string;
  previousGraphAt: string;
  currentGraphAt: string;
  totalChanges: number;
  highSignificance: number;
  changes: GraphChange[];
  /** Summary sentence for quick scanning */
  summary: string;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

let _changeCounter = 0;
function makeChangeId(): string { return `chg-${++_changeCounter}`; }

function changed(
  category: ChangeCategory,
  field: string,
  changeType: ChangeType,
  prev: string | null,
  curr: string | null,
  label: string,
  significance: GraphChange['significance'],
  confidence = 0.9
): GraphChange {
  return { changeId: makeChangeId(), category, field, changeType, previousValue: prev, currentValue: curr, label, significance, confidence };
}

function normalizeStr(v: string | undefined | null): string {
  return (v ?? '').trim().toLowerCase();
}

// ─── Category Diffing Functions ───────────────────────────────────────────────

function diffIdentity(prev: CandidateKnowledgeGraph, curr: CandidateKnowledgeGraph): GraphChange[] {
  const changes: GraphChange[] = [];

  const pName = prev.identity.person.name;
  const cName = curr.identity.person.name;
  if (normalizeStr(pName) !== normalizeStr(cName) && cName && cName !== 'Candidate') {
    changes.push(changed('Identity', 'name', 'changed', pName, cName, `Name updated: ${pName} → ${cName}`, 'medium'));
  }

  const pEmail = prev.identity.contacts.email;
  const cEmail = curr.identity.contacts.email;
  if (normalizeStr(pEmail) !== normalizeStr(cEmail)) {
    if (!pEmail && cEmail) changes.push(changed('Identity', 'email', 'added', null, cEmail, `Email added: ${cEmail}`, 'high'));
    else if (pEmail && cEmail) changes.push(changed('Identity', 'email', 'changed', pEmail, cEmail, `Email changed`, 'high'));
  }

  const pPhone = prev.identity.contacts.phone;
  const cPhone = curr.identity.contacts.phone;
  if (normalizeStr(pPhone) !== normalizeStr(cPhone) && cPhone) {
    changes.push(changed('Identity', 'phone', cPhone && !pPhone ? 'added' : 'changed', pPhone ?? null, cPhone, `Phone ${!pPhone ? 'added' : 'changed'}`, 'medium'));
  }

  const pLinkedIn = prev.identity.contacts.linkedin;
  const cLinkedIn = curr.identity.contacts.linkedin;
  if (!pLinkedIn && cLinkedIn) {
    changes.push(changed('Identity', 'linkedin', 'added', null, cLinkedIn, 'LinkedIn profile added', 'low'));
  }

  return changes;
}

function diffCareer(prev: CandidateKnowledgeGraph, curr: CandidateKnowledgeGraph): GraphChange[] {
  const changes: GraphChange[] = [];

  const pEmp = prev.career.employmentHistory[0];
  const cEmp = curr.career.employmentHistory[0];

  if (!pEmp && cEmp) {
    changes.push(changed('Career', 'employer', 'added', null, cEmp.employer, `New employment: ${cEmp.employer}`, 'high'));
    return changes;
  }

  if (pEmp && cEmp) {
    // Employer changed
    if (normalizeStr(pEmp.employer) !== normalizeStr(cEmp.employer)) {
      changes.push(changed('Career', 'employer', 'changed', pEmp.employer, cEmp.employer, `Employer changed: ${pEmp.employer} → ${cEmp.employer}`, 'high'));
    }

    // Promotion: same employer, different role
    if (
      normalizeStr(pEmp.employer) === normalizeStr(cEmp.employer) &&
      normalizeStr(pEmp.role) !== normalizeStr(cEmp.role)
    ) {
      changes.push(changed('Career', 'role', 'promoted', pEmp.role, cEmp.role, `Promotion at ${cEmp.employer}: ${pEmp.role} → ${cEmp.role}`, 'high'));
    } else if (normalizeStr(pEmp.role) !== normalizeStr(cEmp.role)) {
      // Role change at new employer
      changes.push(changed('Career', 'role', 'changed', pEmp.role, cEmp.role, `Role changed: ${pEmp.role} → ${cEmp.role}`, 'high'));
    }

    // Experience extended
    if ((curr.career.totalDeclaredYears ?? 0) > (prev.career.totalDeclaredYears ?? 0)) {
      const delta = (curr.career.totalDeclaredYears ?? 0) - (prev.career.totalDeclaredYears ?? 0);
      changes.push(changed('Career', 'experience_years', 'extended', String(prev.career.totalDeclaredYears), String(curr.career.totalDeclaredYears), `Experience extended by ~${delta} year(s)`, 'medium'));
    }
  }

  // New previous employer added
  const pPrevIds = prev.career.employmentHistory.slice(1).map(e => normalizeStr(e.employer));
  const cPrevIds = curr.career.employmentHistory.slice(1).map(e => normalizeStr(e.employer));
  const newPrev = cPrevIds.filter(id => !pPrevIds.includes(id));
  for (const emp of curr.career.employmentHistory.slice(1).filter(e => newPrev.includes(normalizeStr(e.employer)))) {
    changes.push(changed('Career', 'previous_employer', 'added', null, emp.employer, `Previous employer added: ${emp.employer}`, 'medium'));
  }

  // Projects added
  const pProjects = new Set(prev.career.projects.map(p => normalizeStr(p.title)));
  const cProjects = curr.career.projects.filter(p => !pProjects.has(normalizeStr(p.title)));
  for (const proj of cProjects) {
    changes.push(changed('Career', 'project', 'added', null, proj.title, `New project: ${proj.title}`, 'low'));
  }

  return changes;
}

function diffSkills(prev: CandidateKnowledgeGraph, curr: CandidateKnowledgeGraph): GraphChange[] {
  const changes: GraphChange[] = [];
  const pSkills = new Set(prev.competency.skills.map(s => normalizeStr(s.canonical)));
  const cSkills = new Set(curr.competency.skills.map(s => normalizeStr(s.canonical)));

  for (const skill of curr.competency.skills) {
    if (!pSkills.has(normalizeStr(skill.canonical))) {
      changes.push(changed('Skills', 'skill', 'added', null, skill.canonical, `New skill: ${skill.canonical}`, 'medium'));
    }
  }
  for (const skill of prev.competency.skills) {
    if (!cSkills.has(normalizeStr(skill.canonical))) {
      changes.push(changed('Skills', 'skill', 'removed', skill.canonical, null, `Skill removed: ${skill.canonical}`, 'low'));
    }
  }

  // New certifications
  const pCerts = new Set(prev.competency.certifications.map(c => normalizeStr(c.name)));
  for (const cert of curr.competency.certifications) {
    if (!pCerts.has(normalizeStr(cert.name))) {
      changes.push(changed('Skills', 'certification', 'added', null, cert.name, `New certification: ${cert.name}`, 'high'));
    }
  }

  return changes;
}

function diffLocation(prev: CandidateKnowledgeGraph, curr: CandidateKnowledgeGraph): GraphChange[] {
  const changes: GraphChange[] = [];
  const pCity = prev.identity.address.city;
  const cCity = curr.identity.address.city;
  if (normalizeStr(pCity) !== normalizeStr(cCity) && cCity) {
    changes.push(changed('Location', 'city', 'relocated', pCity ?? null, cCity, `Location changed: ${pCity ?? 'Unknown'} → ${cCity}`, 'high', 0.75));
  }
  const pCountry = prev.identity.address.country;
  const cCountry = curr.identity.address.country;
  if (normalizeStr(pCountry) !== normalizeStr(cCountry) && cCountry) {
    changes.push(changed('Location', 'country', 'relocated', pCountry ?? null, cCountry, `Country changed: ${pCountry ?? 'Unknown'} → ${cCountry}`, 'high', 0.80));
  }
  return changes;
}

// ─── Main Diff Engine ─────────────────────────────────────────────────────────

export function diffGraphs(
  previous: CandidateKnowledgeGraph,
  current: CandidateKnowledgeGraph
): GraphDiff {
  const allChanges: GraphChange[] = [
    ...diffIdentity(previous, current),
    ...diffCareer(previous, current),
    ...diffSkills(previous, current),
    ...diffLocation(previous, current),
    // Compensation + Availability: sourced from fields when added to graph model
  ];

  const highCount = allChanges.filter(c => c.significance === 'high').length;

  // Build summary sentence
  const employers = allChanges.filter(c => c.category === 'Career' && c.field === 'employer');
  const promotions = allChanges.filter(c => c.changeType === 'promoted');
  const newCerts = allChanges.filter(c => c.field === 'certification' && c.changeType === 'added');
  const newSkills = allChanges.filter(c => c.field === 'skill' && c.changeType === 'added');

  const parts: string[] = [];
  if (employers.length > 0) parts.push(`Employer changed`);
  if (promotions.length > 0) parts.push(`Promotion detected`);
  if (newCerts.length > 0) parts.push(`${newCerts.length} new certification(s)`);
  if (newSkills.length > 0) parts.push(`${newSkills.length} new skill(s)`);
  if (allChanges.some(c => c.category === 'Location')) parts.push(`Location changed`);

  const summary = parts.length > 0 ? parts.join(' · ') : 'No significant changes detected';

  return {
    candidateId: current.candidateId,
    previousGraphAt: previous.processedAt,
    currentGraphAt: current.processedAt,
    totalChanges: allChanges.length,
    highSignificance: highCount,
    changes: allChanges,
    summary,
  };
}
