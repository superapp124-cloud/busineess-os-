/**
 * Resume Intelligence OS v3.0 — Rules Engine
 *
 * Pluggable validation rules. Adding a new validation = registering one object.
 * No pipeline changes needed.
 *
 * Rules are split by domain plugin:
 *   CoreRules        — universal (always active)
 *   EmploymentRules  — employment timeline validation
 *   SAPRules         — SAP-specific skill/role validation
 *   HealthcareRules  — healthcare-specific compliance
 *   GovernmentRules  — government/PSU candidate specifics
 *   AcademicRules    — academic CV validation
 *
 * Enterprise customers can enable only the plugins they need.
 */

import type { CandidateKnowledgeGraph } from '../graphs/knowledgeGraph';

// ─── Rule Interface ───────────────────────────────────────────────────────────

export interface RuleResult {
  ruleId: string;
  ruleName: string;
  passed: boolean;
  severity: 'error' | 'warning' | 'info';
  category: string;
  message: string;
  fieldKey?: string;
  affectedNodeId?: string;
}

export interface ValidationRule {
  ruleId: string;
  ruleName: string;
  description: string;
  severity: 'error' | 'warning' | 'info';
  category: 'field' | 'relationship' | 'timeline' | 'quality' | 'compliance' | 'domain';
  pluginId: string;
  evaluate(graph: CandidateKnowledgeGraph): RuleResult;
}

// ─── Rules Engine ─────────────────────────────────────────────────────────────

class RulesEngineImpl {
  private readonly rules = new Map<string, ValidationRule>();
  private readonly enabledPlugins = new Set<string>();

  /** Register a validation rule. Adding a rule = one .register() call. */
  register(rule: ValidationRule): void {
    this.rules.set(rule.ruleId, rule);
    this.enabledPlugins.add(rule.pluginId);
  }

  /** Enable a specific plugin (all its rules become active). */
  enablePlugin(pluginId: string): void { this.enabledPlugins.add(pluginId); }

  /** Disable a specific plugin. */
  disablePlugin(pluginId: string): void { this.enabledPlugins.delete(pluginId); }

  /** Evaluate all active rules against a knowledge graph. */
  evaluate(graph: CandidateKnowledgeGraph): RuleResult[] {
    const results: RuleResult[] = [];
    for (const rule of this.rules.values()) {
      if (!this.enabledPlugins.has(rule.pluginId)) continue;
      try {
        results.push(rule.evaluate(graph));
      } catch (err) {
        results.push({
          ruleId: rule.ruleId,
          ruleName: rule.ruleName,
          passed: false,
          severity: 'error',
          category: rule.category,
          message: `Rule evaluation crashed: ${err instanceof Error ? err.message : String(err)}`,
        });
      }
    }
    return results;
  }

  getFailedRules(results: RuleResult[]): RuleResult[] {
    return results.filter(r => !r.passed && r.severity === 'error');
  }

  getWarnings(results: RuleResult[]): RuleResult[] {
    return results.filter(r => !r.passed && r.severity === 'warning');
  }

  listRules(pluginId?: string): ValidationRule[] {
    const all = [...this.rules.values()];
    return pluginId ? all.filter(r => r.pluginId === pluginId) : all;
  }
}

export const rulesEngine = new RulesEngineImpl();

// ─── Plugin: Core Rules (always active) ───────────────────────────────────────

const CORE_PLUGIN = 'core';

rulesEngine.register({
  ruleId: 'CORE-001',
  ruleName: 'Employer Must Not Be Prose',
  description: 'The employer field must not contain a prose/action-verb sentence',
  severity: 'error',
  category: 'field',
  pluginId: CORE_PLUGIN,
  evaluate: (graph) => {
    const emp = graph.career.employmentHistory[0];
    const PROSE_RE = /^(responsible|handling|managed|developed|configured|strive|working|providing|ensuring)/i;
    const passed = !emp?.employer || !PROSE_RE.test(emp.employer);
    return { ruleId: 'CORE-001', ruleName: 'Employer Must Not Be Prose', passed, severity: 'error', category: 'field', message: passed ? 'OK' : `Employer "${emp?.employer}" starts with prose — rejected`, fieldKey: 'current_company' };
  },
});

rulesEngine.register({
  ruleId: 'CORE-002',
  ruleName: 'Employer Must Not Equal Role',
  description: 'The employer and role fields must not have the same value',
  severity: 'error',
  category: 'field',
  pluginId: CORE_PLUGIN,
  evaluate: (graph) => {
    const emp = graph.career.employmentHistory[0];
    const same = emp && emp.employer && emp.role && emp.employer.toLowerCase() === emp.role.toLowerCase();
    return { ruleId: 'CORE-002', ruleName: 'Employer Must Not Equal Role', passed: !same, severity: 'error', category: 'field', message: same ? `Employer and role are identical: "${emp?.employer}"` : 'OK', fieldKey: 'current_company' };
  },
});

rulesEngine.register({
  ruleId: 'CORE-003',
  ruleName: 'Candidate Must Have Identity',
  description: 'At minimum a name or email must be present',
  severity: 'warning',
  category: 'quality',
  pluginId: CORE_PLUGIN,
  evaluate: (graph) => {
    const hasId = !!(graph.identity.person.name && graph.identity.person.name !== 'Candidate') || !!graph.identity.contacts.email;
    return { ruleId: 'CORE-003', ruleName: 'Candidate Must Have Identity', passed: hasId, severity: 'warning', category: 'quality', message: hasId ? 'OK' : 'No name or email found — candidate identity unverified' };
  },
});

rulesEngine.register({
  ruleId: 'CORE-004',
  ruleName: 'Skills Must Not Contain Employer Name',
  description: 'A skill entity must not have the same value as the current employer',
  severity: 'warning',
  category: 'relationship',
  pluginId: CORE_PLUGIN,
  evaluate: (graph) => {
    const emp = graph.career.employmentHistory[0]?.employer?.toLowerCase() ?? '';
    const conflict = graph.competency.skills.find(s => s.canonical.toLowerCase() === emp);
    return { ruleId: 'CORE-004', ruleName: 'Skills Must Not Contain Employer Name', passed: !conflict, severity: 'warning', category: 'relationship', message: conflict ? `Skill "${conflict.canonical}" duplicates employer name` : 'OK' };
  },
});

// ─── Plugin: Employment Rules ──────────────────────────────────────────────────

const EMP_PLUGIN = 'employment';

rulesEngine.register({
  ruleId: 'EMP-001',
  ruleName: 'Current Employer Should Have Role',
  description: 'If a current employer is identified, a role should be present',
  severity: 'warning',
  category: 'relationship',
  pluginId: EMP_PLUGIN,
  evaluate: (graph) => {
    const current = graph.career.employmentHistory.find(e => e.isCurrent);
    const passed = !current || !!current.role;
    return { ruleId: 'EMP-001', ruleName: 'Current Employer Should Have Role', passed, severity: 'warning', category: 'relationship', message: passed ? 'OK' : `Current employer "${current?.employer}" has no role extracted`, fieldKey: 'current_designation' };
  },
});

rulesEngine.register({
  ruleId: 'EMP-002',
  ruleName: 'No Cardinality Violation: Multiple Current Employers',
  description: 'Only one employer can be marked isCurrent=true',
  severity: 'error',
  category: 'relationship',
  pluginId: EMP_PLUGIN,
  evaluate: (graph) => {
    const currentCount = graph.career.employmentHistory.filter(e => e.isCurrent).length;
    return { ruleId: 'EMP-002', ruleName: 'No Cardinality Violation: Multiple Current Employers', passed: currentCount <= 1, severity: 'error', category: 'relationship', message: currentCount > 1 ? `${currentCount} employers marked as current — cardinality violation` : 'OK' };
  },
});

// ─── Plugin: SAP Domain Rules ─────────────────────────────────────────────────

const SAP_PLUGIN = 'sap';

rulesEngine.register({
  ruleId: 'SAP-001',
  ruleName: 'SAP Consultant Must Have Module',
  description: 'A SAP consultant role should have at least one SAP module skill (FICO, MM, SD, etc.)',
  severity: 'warning',
  category: 'domain',
  pluginId: SAP_PLUGIN,
  evaluate: (graph) => {
    const role = graph.career.employmentHistory[0]?.role?.toLowerCase() ?? '';
    const isSapRole = /sap/i.test(role);
    if (!isSapRole) return { ruleId: 'SAP-001', ruleName: 'SAP Consultant Must Have Module', passed: true, severity: 'warning', category: 'domain', message: 'Not a SAP role — skipped' };
    const SAP_MODULES = ['FICO', 'MM', 'SD', 'HR', 'PM', 'PP', 'QM', 'WM', 'ABAP', 'Basis', 'S/4HANA', 'SAP BTP'];
    const hasModule = graph.competency.skills.some(s => SAP_MODULES.some(m => s.canonical.includes(m)));
    return { ruleId: 'SAP-001', ruleName: 'SAP Consultant Must Have Module', passed: hasModule, severity: 'warning', category: 'domain', message: hasModule ? 'OK' : 'SAP role found but no SAP module extracted in skills' };
  },
});

// ─── Plugin: Healthcare Rules ─────────────────────────────────────────────────

const HEALTH_PLUGIN = 'healthcare';

rulesEngine.register({
  ruleId: 'HEALTH-001',
  ruleName: 'Healthcare Role Compliance Keywords',
  description: 'Healthcare professionals should mention key compliance frameworks',
  severity: 'info',
  category: 'compliance',
  pluginId: HEALTH_PLUGIN,
  evaluate: (graph) => {
    const allSkills = graph.competency.skills.map(s => s.canonical.toLowerCase()).join(' ');
    const COMPLIANCE_TERMS = ['hipaa', 'hl7', 'fhir', 'icd', 'clia', 'joint commission'];
    const hasCompliance = COMPLIANCE_TERMS.some(t => allSkills.includes(t));
    return { ruleId: 'HEALTH-001', ruleName: 'Healthcare Role Compliance Keywords', passed: hasCompliance, severity: 'info', category: 'compliance', message: hasCompliance ? 'OK' : 'Healthcare candidate: no compliance framework (HIPAA/HL7/FHIR) found in skills' };
  },
});

// ─── Plugin: Academic Rules ────────────────────────────────────────────────────

const ACADEMIC_PLUGIN = 'academic';

rulesEngine.register({
  ruleId: 'ACAD-001',
  ruleName: 'Academic CV Should Have Publications',
  description: 'Academic CVs typically include publications or research outputs',
  severity: 'info',
  category: 'domain',
  pluginId: ACADEMIC_PLUGIN,
  evaluate: (graph) => {
    // Look for publication-like entities in allEntities
    const hasPub = graph.allEntities.some(e =>
      ['Publication', 'ResearchPaper', 'Patent'].includes(e.canonicalType)
    );
    return { ruleId: 'ACAD-001', ruleName: 'Academic CV Should Have Publications', passed: hasPub, severity: 'info', category: 'domain', message: hasPub ? 'OK' : 'Academic CV: no publications or research outputs found' };
  },
});

// ─── Plugin: Government Rules ──────────────────────────────────────────────────

const GOV_PLUGIN = 'government';

rulesEngine.register({
  ruleId: 'GOV-001',
  ruleName: 'Government Candidate Grade/Band',
  description: 'Government candidates often specify grade, pay band, or service group',
  severity: 'info',
  category: 'domain',
  pluginId: GOV_PLUGIN,
  evaluate: (graph) => {
    const hasGrade = graph.allEntities.some(e => ['Grade', 'Band', 'PayLevel'].includes(e.canonicalType));
    return { ruleId: 'GOV-001', ruleName: 'Government Candidate Grade/Band', passed: hasGrade, severity: 'info', category: 'domain', message: hasGrade ? 'OK' : 'Government candidate: no grade/band/pay-level entity found' };
  },
});

export type { ValidationRule };
