/**
 * Resume Intelligence OS v3.0 — Entity Resolver
 *
 * Resolves raw text spans to canonical forms before ontology classification.
 * "MS Azure" → "Microsoft Azure" → Cloud Platform
 * "SpringBoot" → "Spring Boot" → Java Framework
 * "AAD" → "Azure Active Directory" → Identity Platform
 */

import type { OntologyEntry } from '../ontologies/registry';
import { ontologyRegistry } from '../ontologies/registry';

// ─── Resolved Entity ──────────────────────────────────────────────────────────

export interface ResolvedEntity {
  rawSpan: string;
  resolvedAlias: string | null;       // "MS Azure" → "Microsoft Azure"
  canonicalForm: string;              // final canonical form
  ontologyEntry: OntologyEntry | null; // full entry from registry
  resolverConfidence: number;         // 0–1
}

// ─── Alias Map (extensible) ───────────────────────────────────────────────────

const ALIAS_MAP: Record<string, string> = {
  // Cloud
  'ms azure': 'Microsoft Azure',
  'windows azure': 'Microsoft Azure',
  'azure cloud': 'Microsoft Azure',
  'aad': 'Azure Active Directory',
  'azure ad': 'Azure Active Directory',
  'entra id': 'Azure Active Directory',
  'microsoft entra': 'Azure Active Directory',
  'intune': 'Azure Intune',
  'mde': 'Microsoft Defender',
  'defender atp': 'Microsoft Defender',

  // Java
  'springboot': 'Spring Boot',
  'spring-boot': 'Spring Boot',
  'spring mvc': 'Spring Framework',
  'jpa': 'Hibernate',
  'kafka': 'Apache Kafka',

  // DevOps
  'k8s': 'Kubernetes',
  'kube': 'Kubernetes',
  'tf': 'Terraform',
  'gh actions': 'GitHub Actions',
  'iac': 'Terraform',

  // SAP
  's4 hana': 'S/4HANA',
  's4hana': 'S/4HANA',
  'sap s4': 'S/4HANA',
  'sap cloud platform': 'SAP BTP',
  'scp': 'SAP BTP',
  'fico': 'SAP FICO',
  'fi/co': 'SAP FICO',
  'abap': 'SAP ABAP',

  // .NET
  'asp.net': 'ASP.NET',
  'dotnet': '.NET',
  'dot net': '.NET',
  'c sharp': 'C#',
  'csharp': 'C#',
  'mssql': 'SQL Server',
  't-sql': 'SQL Server',

  // Security
  'pen testing': 'Penetration Testing',
  'pentest': 'Penetration Testing',
  'ethical hacking': 'Penetration Testing',
  'soc analyst': 'SOC',
  'iso27001': 'ISO 27001',
  'va/pt': 'VAPT',
  'siem': 'SIEM',

  // Healthcare
  'ehr': 'EMR',
  'epic ehr': 'Epic',
  'cerner ehr': 'Cerner',
  'icd': 'ICD-10',

  // Legal
  'm&a': 'Mergers & Acquisitions',
  'ma': 'Mergers & Acquisitions',
  'ip law': 'Intellectual Property Law',
  'ipr': 'Intellectual Property Law',

  // Manufacturing
  'lean six sigma': 'Six Sigma',
  'iso9001': 'ISO 9001',
  'scm': 'Supply Chain Management',
  'ci': 'Kaizen',

  // Finance
  'p&l': 'P&L Management',
  'pnl': 'P&L Management',
  'dcf': 'Financial Modelling',
  'gl': 'Financial Accounting',
};

// ─── Resolver ─────────────────────────────────────────────────────────────────

/**
 * Resolve a raw span to its canonical form and ontology entry.
 * Applies alias map first, then queries the ontology registry.
 */
export function resolveEntity(rawSpan: string): ResolvedEntity {
  const lower = rawSpan.toLowerCase().trim();

  // 1. Alias map lookup (exact match)
  const aliasMatch = ALIAS_MAP[lower];
  const resolvedAlias = aliasMatch ?? null;
  const lookupSpan = resolvedAlias ?? rawSpan;

  // 2. Ontology registry lookup
  const ontologyEntry = ontologyRegistry.lookup(lookupSpan);

  const canonicalForm = ontologyEntry?.canonical ?? resolvedAlias ?? rawSpan;

  // Confidence: higher if we have both alias resolution AND ontology match
  let resolverConfidence = 0.5;
  if (ontologyEntry) resolverConfidence = resolvedAlias ? 0.98 : 0.90;
  else if (resolvedAlias) resolverConfidence = 0.75;

  return {
    rawSpan,
    resolvedAlias,
    canonicalForm,
    ontologyEntry,
    resolverConfidence,
  };
}

/**
 * Batch-resolve a list of spans.
 * Returns a map of rawSpan → ResolvedEntity.
 */
export function resolveEntities(spans: string[]): Map<string, ResolvedEntity> {
  const results = new Map<string, ResolvedEntity>();
  for (const span of spans) {
    results.set(span, resolveEntity(span));
  }
  return results;
}

/**
 * Register additional runtime aliases without modifying the static map.
 * Useful for company-specific or domain-specific aliases learned over time.
 */
export function registerAlias(rawForm: string, canonicalForm: string): void {
  ALIAS_MAP[rawForm.toLowerCase().trim()] = canonicalForm;
}
