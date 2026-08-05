/**
 * Resume Intelligence OS v3.0 — Field Contracts
 *
 * Defines which SemanticEntityType values are allowed for each recruiter-visible UI field.
 * This is the enforcement gate between the Knowledge Graph and the UI.
 * Every field assignment must pass this contract or the field returns its unverified sentinel.
 */

import type { SemanticEntityType, SemanticEntity } from '../core/types';

// ─── Field Contract Definition ────────────────────────────────────────────────

export interface FieldContract {
  /** UI field key e.g. "current_company" */
  fieldKey: string;
  /** Human-readable display name */
  displayName: string;
  /** Types that are allowed to populate this field */
  allowedTypes: SemanticEntityType[];
  /** Sentinel value returned when no valid entity passes the contract */
  unverifiedSentinel: string;
  /** Minimum confidence threshold to accept an entity for this field (0–1) */
  minConfidence: number;
}

// ─── Field Contract Registry ──────────────────────────────────────────────────

export const FIELD_CONTRACTS: Record<string, FieldContract> = {
  current_company: {
    fieldKey: 'current_company',
    displayName: 'Current Employer',
    allowedTypes: ['Employer', 'Client', 'Vendor', 'StaffingAgency', 'Subsidiary', 'ImplementationPartner', 'ConsultingPartner'],
    unverifiedSentinel: 'Employer Unverified',
    minConfidence: 0.45,
  },
  current_designation: {
    fieldKey: 'current_designation',
    displayName: 'Current Role / Designation',
    allowedTypes: ['JobTitle', 'Role', 'Grade', 'Band'],
    unverifiedSentinel: 'Role Unverified',
    minConfidence: 0.45,
  },
  first_name: {
    fieldKey: 'first_name',
    displayName: 'First Name',
    allowedTypes: ['PersonName', 'PreferredName'],
    unverifiedSentinel: 'Candidate',
    minConfidence: 0.5,
  },
  last_name: {
    fieldKey: 'last_name',
    displayName: 'Last Name',
    allowedTypes: ['PersonName', 'PreferredName', 'Initials'],
    unverifiedSentinel: '',
    minConfidence: 0.4,
  },
  email: {
    fieldKey: 'email',
    displayName: 'Email Address',
    allowedTypes: ['Email'],
    unverifiedSentinel: '',
    minConfidence: 0.8,
  },
  phone: {
    fieldKey: 'phone',
    displayName: 'Mobile Number',
    allowedTypes: ['MobileNumber', 'AlternatePhone'],
    unverifiedSentinel: '',
    minConfidence: 0.7,
  },
  location: {
    fieldKey: 'location',
    displayName: 'Current Location',
    allowedTypes: ['City', 'State', 'Country'],
    unverifiedSentinel: 'Location Unverified',
    minConfidence: 0.5,
  },
  skills: {
    fieldKey: 'skills',
    displayName: 'Skills',
    allowedTypes: ['TechnicalSkill', 'DomainSkill', 'SoftSkill', 'PlatformSkill', 'ToolSkill', 'LanguageSkill'],
    unverifiedSentinel: '',
    minConfidence: 0.35,
  },
  linkedin: {
    fieldKey: 'linkedin',
    displayName: 'LinkedIn Profile',
    allowedTypes: ['LinkedIn'],
    unverifiedSentinel: '',
    minConfidence: 0.85,
  },
  github: {
    fieldKey: 'github',
    displayName: 'GitHub Profile',
    allowedTypes: ['GitHub'],
    unverifiedSentinel: '',
    minConfidence: 0.85,
  },
  education: {
    fieldKey: 'education',
    displayName: 'Education',
    allowedTypes: ['Degree', 'University', 'Institute', 'Specialization', 'Board'],
    unverifiedSentinel: '',
    minConfidence: 0.5,
  },
  certifications: {
    fieldKey: 'certifications',
    displayName: 'Certifications',
    allowedTypes: ['CertificationName', 'CertificationIssuer', 'CertificationYear'],
    unverifiedSentinel: '',
    minConfidence: 0.5,
  },
  executive_summary: {
    fieldKey: 'executive_summary',
    displayName: 'Executive Summary',
    allowedTypes: ['ExecutiveSummary', 'ProfileHighlight'],
    unverifiedSentinel: '',
    minConfidence: 0.4,
  },
  work_authorization: {
    fieldKey: 'work_authorization',
    displayName: 'Work Authorization',
    allowedTypes: ['VisaStatus', 'WorkAuthorization', 'Nationality'],
    unverifiedSentinel: 'Not Specified',
    minConfidence: 0.6,
  },
};

// ─── Contract Enforcement ─────────────────────────────────────────────────────

/**
 * Given a list of semantic entities and a field key, find the best-matching
 * entity that passes the field contract. Returns null if none qualifies.
 */
export function applyFieldContract(
  entities: SemanticEntity[],
  fieldKey: string
): SemanticEntity | null {
  const contract = FIELD_CONTRACTS[fieldKey];
  if (!contract) return null;

  const qualifying = entities.filter(e =>
    contract.allowedTypes.includes(e.canonicalType) &&
    e.confidence.overall >= contract.minConfidence
  );

  if (qualifying.length === 0) return null;

  // Pick entity with highest overall confidence
  return qualifying.reduce((best, e) =>
    e.confidence.overall > best.confidence.overall ? e : best
  );
}

/**
 * Apply a field contract and return the string value (or sentinel).
 */
export function resolveField(
  entities: SemanticEntity[],
  fieldKey: string
): { value: string; entity: SemanticEntity | null; isVerified: boolean } {
  const contract = FIELD_CONTRACTS[fieldKey];
  if (!contract) return { value: '', entity: null, isVerified: false };

  const entity = applyFieldContract(entities, fieldKey);
  if (!entity) {
    return { value: contract.unverifiedSentinel, entity: null, isVerified: false };
  }
  return { value: entity.value, entity, isVerified: true };
}

/**
 * Apply all contracts to a set of entities.
 * Returns a map of fieldKey → resolved value.
 */
export function resolveAllFields(
  entities: SemanticEntity[]
): Record<string, { value: string; entity: SemanticEntity | null; isVerified: boolean }> {
  const result: Record<string, { value: string; entity: SemanticEntity | null; isVerified: boolean }> = {};
  for (const fieldKey of Object.keys(FIELD_CONTRACTS)) {
    result[fieldKey] = resolveField(entities, fieldKey);
  }
  return result;
}
