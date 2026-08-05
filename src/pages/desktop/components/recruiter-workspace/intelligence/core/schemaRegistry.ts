/**
 * Resume Intelligence OS v3.0 — Canonical Schema Registry
 *
 * THE single authority for every SemanticEntityType's rules.
 * All other modules (fieldContracts, entityExtractor, careerGraph, crossFieldValidator)
 * import EntityDefinition from here. Zero duplication of semantic rules.
 *
 * Adding a new entity type = adding one EntityDefinition object here.
 * Never scatter type-specific logic across modules.
 */

import type { SemanticEntityType, LayoutRegion } from './types';

// ─── Cardinality ──────────────────────────────────────────────────────────────

export type CardinalityRule =
  | 'exactly-one'           // Email — must have exactly one
  | 'exactly-one-current'   // Current Employer — one active employer at a time
  | 'one-or-none'           // Location — optional but singular
  | 'one-or-many'           // Phone — primary + alternates
  | 'unlimited'             // Skills, Certifications, Projects — no cap
  | 'zero-or-one';          // GitHub — optional, singular

// ─── Entity Validator ─────────────────────────────────────────────────────────

export interface EntityValidator {
  id: string;
  description: string;
  validate(value: string): { valid: boolean; reason?: string };
}

// ─── Entity Normalizer ────────────────────────────────────────────────────────

export interface EntityNormalizer {
  id: string;
  normalize(value: string): string;
}

// ─── Entity Definition ────────────────────────────────────────────────────────

export interface EntityDefinition {
  type: SemanticEntityType;
  displayName: string;
  /** Sections in which this entity type is valid */
  allowedSections: string[];
  /** Layout regions in which this entity type is valid */
  allowedLayouts: LayoutRegion[];
  /** Types that can be parents in the relationship graph */
  allowedParentTypes: SemanticEntityType[];
  /** Types that can be children in the relationship graph */
  allowedChildTypes: SemanticEntityType[];
  /** Cardinality rule for this field */
  cardinality: CardinalityRule;
  /** Minimum confidence for this type to pass field contracts */
  minConfidence: number;
  /** Sentinel value when no entity passes contract */
  uiSentinel: string;
  /** UI field keys this type can populate */
  fieldContracts: string[];
  /** Ontology modules that classify this type */
  ontologyModules: string[];
  /** Validators applied during extraction */
  validators: EntityValidator[];
  /** Normalizers applied before storage */
  normalizers: EntityNormalizer[];
  /** Confidence decay half-life in days */
  decayHalfLifeDays: number;
  /** Types that are commonly mis-classified as this type */
  commonConfusions: SemanticEntityType[];
}

// ─── Registry ─────────────────────────────────────────────────────────────────

class SchemaRegistryImpl {
  private readonly definitions = new Map<SemanticEntityType, EntityDefinition>();

  register(def: EntityDefinition): void {
    if (this.definitions.has(def.type)) {
      console.warn(`[SchemaRegistry] Re-registering "${def.type}" — overwriting existing definition.`);
    }
    this.definitions.set(def.type, def);
  }

  get(type: SemanticEntityType): EntityDefinition | null {
    return this.definitions.get(type) ?? null;
  }

  /** Get all types allowed in a given section */
  getTypesForSection(section: string): SemanticEntityType[] {
    return [...this.definitions.values()]
      .filter(d => d.allowedSections.includes(section))
      .map(d => d.type);
  }

  /** Get all types allowed in a given layout region */
  getTypesForLayout(region: LayoutRegion): SemanticEntityType[] {
    return [...this.definitions.values()]
      .filter(d => d.allowedLayouts.includes(region))
      .map(d => d.type);
  }

  /** Get the field contract sentinel for a given type */
  getSentinel(type: SemanticEntityType): string {
    return this.definitions.get(type)?.uiSentinel ?? '';
  }

  /** Check if a type is allowed in a section */
  isAllowedInSection(type: SemanticEntityType, section: string): boolean {
    return this.definitions.get(type)?.allowedSections.includes(section) ?? false;
  }

  /** Get all cardinality rules */
  getCardinality(type: SemanticEntityType): CardinalityRule {
    return this.definitions.get(type)?.cardinality ?? 'unlimited';
  }

  all(): EntityDefinition[] {
    return [...this.definitions.values()];
  }
}

export const schemaRegistry = new SchemaRegistryImpl();

// ─── Built-in Validators ──────────────────────────────────────────────────────

const noProseValidator: EntityValidator = {
  id: 'no-prose',
  description: 'Value must not start with an action verb / prose sentence',
  validate: (value) => {
    const PROSE_RE = /^(responsible|handling|managed|developed|configured|implemented|strive|working|providing|ensuring|creating|leading|building)/i;
    return PROSE_RE.test(value)
      ? { valid: false, reason: 'Value starts with action verb — likely a responsibility sentence, not an entity' }
      : { valid: true };
  },
};

const noAddressValidator: EntityValidator = {
  id: 'no-address',
  description: 'Value must not be a city/location name alone',
  validate: (value) => {
    const CITY_ONLY_RE = /^(bangalore|bengaluru|mumbai|delhi|noida|gurgaon|hyderabad|pune|chennai|kolkata|london|singapore|dubai)$/i;
    return CITY_ONLY_RE.test(value.trim())
      ? { valid: false, reason: 'Value is a city name — cannot be an Employer' }
      : { valid: true };
  },
};

const noLongSentenceValidator: EntityValidator = {
  id: 'no-long-sentence',
  description: 'Value must not be a long sentence (>8 words)',
  validate: (value) => {
    return value.split(/\s+/).length > 8
      ? { valid: false, reason: 'Value is too long to be an entity — likely a sentence' }
      : { valid: true };
  },
};

const emailFormatValidator: EntityValidator = {
  id: 'email-format',
  description: 'Must be a valid email format',
  validate: (value) => {
    const EMAIL_RE = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return EMAIL_RE.test(value)
      ? { valid: true }
      : { valid: false, reason: 'Does not match email format' };
  },
};

// ─── Built-in Normalizers ─────────────────────────────────────────────────────

const trimNormalizer: EntityNormalizer = {
  id: 'trim',
  normalize: (v) => v.trim().replace(/\s+/g, ' '),
};

const titleCaseNormalizer: EntityNormalizer = {
  id: 'title-case',
  normalize: (v) => v.replace(/\b\w/g, c => c.toUpperCase()),
};

const lowerCaseNormalizer: EntityNormalizer = {
  id: 'lower-case',
  normalize: (v) => v.toLowerCase().trim(),
};

// ─── Built-in Entity Definitions ──────────────────────────────────────────────

schemaRegistry.register({
  type: 'Employer',
  displayName: 'Employer / Company',
  allowedSections: ['Employment', 'Header'],
  allowedLayouts: ['employment', 'header'],
  allowedParentTypes: [],
  allowedChildTypes: ['JobTitle', 'EmploymentPeriod', 'Achievement', 'Responsibility'],
  cardinality: 'exactly-one-current',
  minConfidence: 0.45,
  uiSentinel: 'Employer Unverified',
  fieldContracts: ['current_company'],
  ontologyModules: [],
  validators: [noProseValidator, noAddressValidator, noLongSentenceValidator],
  normalizers: [trimNormalizer],
  decayHalfLifeDays: 365,
  commonConfusions: ['Responsibility', 'City', 'ProjectClient', 'JobTitle'],
});

schemaRegistry.register({
  type: 'Client',
  displayName: 'Client Organization',
  allowedSections: ['Employment', 'Projects'],
  allowedLayouts: ['employment', 'projects'],
  allowedParentTypes: ['Employer'],
  allowedChildTypes: ['ProjectTitle'],
  cardinality: 'unlimited',
  minConfidence: 0.5,
  uiSentinel: '',
  fieldContracts: [],
  ontologyModules: [],
  validators: [noProseValidator, noAddressValidator],
  normalizers: [trimNormalizer],
  decayHalfLifeDays: 365,
  commonConfusions: ['Employer', 'ProjectClient'],
});

schemaRegistry.register({
  type: 'JobTitle',
  displayName: 'Job Title / Role',
  allowedSections: ['Employment', 'Header', 'Summary'],
  allowedLayouts: ['employment', 'header', 'summary'],
  allowedParentTypes: ['Employer'],
  allowedChildTypes: ['Responsibility', 'Achievement'],
  cardinality: 'exactly-one-current',
  minConfidence: 0.45,
  uiSentinel: 'Role Unverified',
  fieldContracts: ['current_designation'],
  ontologyModules: [],
  validators: [noProseValidator, noLongSentenceValidator],
  normalizers: [trimNormalizer, titleCaseNormalizer],
  decayHalfLifeDays: 365,
  commonConfusions: ['Responsibility', 'Employer', 'ExecutiveSummary'],
});

schemaRegistry.register({
  type: 'PersonName',
  displayName: 'Candidate Name',
  allowedSections: ['Header', 'Contact'],
  allowedLayouts: ['header', 'contact'],
  allowedParentTypes: [],
  allowedChildTypes: ['Email', 'MobileNumber', 'LinkedIn'],
  cardinality: 'exactly-one',
  minConfidence: 0.5,
  uiSentinel: 'Candidate',
  fieldContracts: ['first_name', 'last_name'],
  ontologyModules: [],
  validators: [noProseValidator],
  normalizers: [trimNormalizer, titleCaseNormalizer],
  decayHalfLifeDays: 99999,
  commonConfusions: ['Employer', 'University'],
});

schemaRegistry.register({
  type: 'Email',
  displayName: 'Email Address',
  allowedSections: ['Header', 'Contact', 'Footer'],
  allowedLayouts: ['header', 'contact', 'footer'],
  allowedParentTypes: ['PersonName'],
  allowedChildTypes: [],
  cardinality: 'exactly-one',
  minConfidence: 0.8,
  uiSentinel: '',
  fieldContracts: ['email'],
  ontologyModules: [],
  validators: [emailFormatValidator],
  normalizers: [lowerCaseNormalizer],
  decayHalfLifeDays: 730,
  commonConfusions: [],
});

schemaRegistry.register({
  type: 'MobileNumber',
  displayName: 'Mobile Number',
  allowedSections: ['Header', 'Contact', 'Footer'],
  allowedLayouts: ['header', 'contact', 'footer'],
  allowedParentTypes: ['PersonName'],
  allowedChildTypes: [],
  cardinality: 'one-or-many',
  minConfidence: 0.7,
  uiSentinel: '',
  fieldContracts: ['phone'],
  ontologyModules: [],
  validators: [],
  normalizers: [trimNormalizer],
  decayHalfLifeDays: 730,
  commonConfusions: [],
});

schemaRegistry.register({
  type: 'TechnicalSkill',
  displayName: 'Technical Skill',
  allowedSections: ['Skills', 'Employment', 'Projects', 'Summary'],
  allowedLayouts: ['skills', 'employment', 'projects', 'summary'],
  allowedParentTypes: ['Employer', 'ProjectTitle'],
  allowedChildTypes: [],
  cardinality: 'unlimited',
  minConfidence: 0.35,
  uiSentinel: '',
  fieldContracts: ['skills'],
  ontologyModules: ['java', 'dotnet', 'cloud', 'sap', 'cybersecurity', 'healthcare', 'manufacturing'],
  validators: [noProseValidator],
  normalizers: [trimNormalizer],
  decayHalfLifeDays: 1825,
  commonConfusions: ['Employer', 'ProjectTitle', 'DomainSkill'],
});

schemaRegistry.register({
  type: 'DomainSkill',
  displayName: 'Domain / Functional Skill',
  allowedSections: ['Skills', 'Summary', 'Employment'],
  allowedLayouts: ['skills', 'summary', 'employment'],
  allowedParentTypes: [],
  allowedChildTypes: [],
  cardinality: 'unlimited',
  minConfidence: 0.35,
  uiSentinel: '',
  fieldContracts: ['skills'],
  ontologyModules: ['finance', 'hr', 'marketing', 'legal', 'aviation'],
  validators: [noProseValidator],
  normalizers: [trimNormalizer],
  decayHalfLifeDays: 1825,
  commonConfusions: ['TechnicalSkill', 'Responsibility'],
});

schemaRegistry.register({
  type: 'CertificationName',
  displayName: 'Certification',
  allowedSections: ['Certifications', 'Education', 'Summary'],
  allowedLayouts: ['certifications', 'education'],
  allowedParentTypes: [],
  allowedChildTypes: ['CertificationIssuer', 'CertificationYear'],
  cardinality: 'unlimited',
  minConfidence: 0.5,
  uiSentinel: '',
  fieldContracts: ['certifications'],
  ontologyModules: [],
  validators: [noProseValidator],
  normalizers: [trimNormalizer],
  decayHalfLifeDays: 912,
  commonConfusions: ['Degree', 'TechnicalSkill'],
});

schemaRegistry.register({
  type: 'Degree',
  displayName: 'Academic Degree',
  allowedSections: ['Education'],
  allowedLayouts: ['education'],
  allowedParentTypes: ['University', 'Institute'],
  allowedChildTypes: ['Specialization', 'PassingYear'],
  cardinality: 'unlimited',
  minConfidence: 0.5,
  uiSentinel: '',
  fieldContracts: ['education'],
  ontologyModules: [],
  validators: [],
  normalizers: [trimNormalizer],
  decayHalfLifeDays: 99999,
  commonConfusions: ['CertificationName'],
});

schemaRegistry.register({
  type: 'City',
  displayName: 'City / Location',
  allowedSections: ['Header', 'Contact', 'Employment'],
  allowedLayouts: ['header', 'contact', 'employment'],
  allowedParentTypes: [],
  allowedChildTypes: [],
  cardinality: 'one-or-none',
  minConfidence: 0.5,
  uiSentinel: 'Location Unverified',
  fieldContracts: ['location'],
  ontologyModules: [],
  validators: [noProseValidator],
  normalizers: [trimNormalizer, titleCaseNormalizer],
  decayHalfLifeDays: 365,
  commonConfusions: ['Employer', 'Nationality'],
});

schemaRegistry.register({
  type: 'LinkedIn',
  displayName: 'LinkedIn Profile',
  allowedSections: ['Header', 'Contact'],
  allowedLayouts: ['header', 'contact'],
  allowedParentTypes: ['PersonName'],
  allowedChildTypes: [],
  cardinality: 'zero-or-one',
  minConfidence: 0.85,
  uiSentinel: '',
  fieldContracts: ['linkedin'],
  ontologyModules: [],
  validators: [],
  normalizers: [lowerCaseNormalizer],
  decayHalfLifeDays: 730,
  commonConfusions: ['Website', 'GitHub'],
});

schemaRegistry.register({
  type: 'GitHub',
  displayName: 'GitHub Profile',
  allowedSections: ['Header', 'Contact'],
  allowedLayouts: ['header', 'contact'],
  allowedParentTypes: ['PersonName'],
  allowedChildTypes: [],
  cardinality: 'zero-or-one',
  minConfidence: 0.85,
  uiSentinel: '',
  fieldContracts: ['github'],
  ontologyModules: [],
  validators: [],
  normalizers: [lowerCaseNormalizer],
  decayHalfLifeDays: 730,
  commonConfusions: ['Website', 'LinkedIn'],
});

schemaRegistry.register({
  type: 'ExecutiveSummary',
  displayName: 'Executive Summary',
  allowedSections: ['Summary', 'Objective', 'Header'],
  allowedLayouts: ['summary', 'objective', 'header'],
  allowedParentTypes: [],
  allowedChildTypes: [],
  cardinality: 'one-or-none',
  minConfidence: 0.4,
  uiSentinel: '',
  fieldContracts: ['executive_summary'],
  ontologyModules: [],
  validators: [],
  normalizers: [trimNormalizer],
  decayHalfLifeDays: 365,
  commonConfusions: ['Responsibility', 'CareerObjective'],
});
