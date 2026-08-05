/**
 * Resume Intelligence OS v3.0 — Resume Family Registry
 *
 * Configuration-driven document family detection.
 * Adding a new family = adding a new ResumeFamilyProfile object.
 * No pipeline code changes required.
 */

import type { ResumeFamilyId, ExtractedPage } from '../core/types';

// ─── Family Classifier Signal ─────────────────────────────────────────────────

export interface FamilySignal {
  pattern: RegExp;
  weight: number;       // 0–1
  description: string;
}

// ─── Extraction Profile ───────────────────────────────────────────────────────

export interface ExtractionProfile {
  /** Expected column count in this family */
  expectedColumns: 1 | 2 | 3;
  /** Whether employment timeline is typically dated */
  hasDatedTimeline: boolean;
  /** Whether this family typically has an explicit skills section */
  hasSkillsSection: boolean;
  /** Section header synonyms specific to this family */
  sectionSynonyms: Record<string, string[]>;
  /** Ontology modules to load for this family (others may be loaded on demand) */
  ontologyPriorities: string[];
}

// ─── Resume Family Profile ────────────────────────────────────────────────────

export interface ResumeFamilyProfile {
  id: ResumeFamilyId;
  displayName: string;
  /** Signals to detect this family; weighted vote wins */
  signals: FamilySignal[];
  extractionProfile: ExtractionProfile;
}

// ─── Registry ─────────────────────────────────────────────────────────────────

class ResumeFamilyRegistryImpl {
  private readonly profiles = new Map<ResumeFamilyId, ResumeFamilyProfile>();

  register(profile: ResumeFamilyProfile): void {
    this.profiles.set(profile.id, profile);
  }

  /**
   * Detect the most likely resume family from extracted pages.
   * Uses a weighted signal voting system.
   */
  detect(pages: ExtractedPage[]): { family: ResumeFamilyId; confidence: number } {
    const text = pages.map(p => p.text).join('\n');
    const scores = new Map<ResumeFamilyId, number>();

    for (const [id, profile] of this.profiles) {
      let score = 0;
      let totalWeight = 0;
      for (const signal of profile.signals) {
        totalWeight += signal.weight;
        if (signal.pattern.test(text)) score += signal.weight;
      }
      scores.set(id, totalWeight > 0 ? score / totalWeight : 0);
    }

    // Pick the highest scoring family
    let bestFamily: ResumeFamilyId = 'corporate';
    let bestScore = 0;
    for (const [id, score] of scores) {
      if (score > bestScore) { bestScore = score; bestFamily = id; }
    }

    // Fallback if no family passes the threshold
    if (bestScore < 0.15) return { family: 'corporate', confidence: 0.5 };
    return { family: bestFamily, confidence: Math.min(0.99, bestScore) };
  }

  getProfile(family: ResumeFamilyId): ResumeFamilyProfile {
    return this.profiles.get(family) ?? this.profiles.get('corporate')!;
  }

  getAll(): ResumeFamilyProfile[] {
    return Array.from(this.profiles.values());
  }
}

export const resumeFamilyRegistry = new ResumeFamilyRegistryImpl();

// ─── Default Family Profiles ──────────────────────────────────────────────────

const DEFAULT_SYNONYMS = {
  employment: ['experience', 'work experience', 'employment history', 'career history', 'professional experience'],
  education: ['education', 'academic background', 'qualification', 'degrees'],
  skills: ['skills', 'technical skills', 'core competencies', 'key skills', 'expertise'],
  summary: ['summary', 'profile', 'about me', 'professional summary', 'executive summary', 'objective'],
};

resumeFamilyRegistry.register({
  id: 'corporate',
  displayName: 'Corporate Resume',
  signals: [
    { pattern: /\b(work\s+experience|employment|professional\s+experience)\b/i, weight: 0.4 },
    { pattern: /\b(skills|competencies|expertise)\b/i, weight: 0.2 },
    { pattern: /\b(objective|summary|profile)\b/i, weight: 0.15 },
    { pattern: /\b(projects|certifications)\b/i, weight: 0.15 },
    { pattern: /\b(?:19|20)\d{2}\b/, weight: 0.1 },
  ],
  extractionProfile: {
    expectedColumns: 1, hasDatedTimeline: true, hasSkillsSection: true,
    sectionSynonyms: DEFAULT_SYNONYMS,
    ontologyPriorities: ['java', 'dotnet', 'cloud', 'sap', 'cybersecurity'],
  },
});

resumeFamilyRegistry.register({
  id: 'academic',
  displayName: 'Academic CV',
  signals: [
    { pattern: /curriculum\s+vitae/i, weight: 0.4 },
    { pattern: /\b(research|publication|thesis|doctoral|ph\.?d)\b/i, weight: 0.3 },
    { pattern: /\b(university|faculty|department|professor|dean)\b/i, weight: 0.2 },
    { pattern: /\b(academic\s+profile|academic\s+career)\b/i, weight: 0.1 },
  ],
  extractionProfile: {
    expectedColumns: 1, hasDatedTimeline: true, hasSkillsSection: false,
    sectionSynonyms: {
      employment: ['academic positions', 'professional appointments', 'career', 'experience'],
      education: ['education', 'degrees', 'qualifications', 'academic background'],
      skills: ['research interests', 'areas of expertise', 'specializations', 'disciplines'],
      summary: ['research profile', 'research statement', 'academic profile'],
    },
    ontologyPriorities: ['healthcare', 'manufacturing', 'finance'],
  },
});

resumeFamilyRegistry.register({
  id: 'healthcare',
  displayName: 'Healthcare / Medical CV',
  signals: [
    { pattern: /\b(m\.?b\.?b\.?s|mbbs|m\.?d\.?|doctor|physician|nurse|pharmacist|radiologist|cardiologist)\b/i, weight: 0.4 },
    { pattern: /\b(hospital|clinic|healthcare|medical|patient|ward|icu|ot|emergency)\b/i, weight: 0.3 },
    { pattern: /\b(registration\s+no|medical\s+council|mci|state\s+medical)\b/i, weight: 0.2 },
    { pattern: /\b(residency|fellowship|internship\s+hospital|posting)\b/i, weight: 0.1 },
  ],
  extractionProfile: {
    expectedColumns: 1, hasDatedTimeline: true, hasSkillsSection: false,
    sectionSynonyms: {
      employment: ['clinical experience', 'hospital appointments', 'postings', 'work experience'],
      education: ['education', 'medical degrees', 'training', 'qualifications'],
      skills: ['clinical skills', 'medical expertise', 'procedures', 'specializations'],
      summary: ['profile', 'summary', 'professional statement'],
    },
    ontologyPriorities: ['healthcare'],
  },
});

resumeFamilyRegistry.register({
  id: 'executive',
  displayName: 'Executive Bio',
  signals: [
    { pattern: /\b(chief\s+(executive|technology|operating|financial)\s+officer|ceo|cto|cfo|coo|president|vice\s+president|md\s+&\s+ceo)\b/i, weight: 0.5 },
    { pattern: /\b(board\s+member|advisory\s+board|executive\s+leadership|p&l\s+responsibility)\b/i, weight: 0.3 },
    { pattern: /\b(billion|crore|revenue|growth|strategy|transformation)\b/i, weight: 0.2 },
  ],
  extractionProfile: {
    expectedColumns: 1, hasDatedTimeline: true, hasSkillsSection: false,
    sectionSynonyms: DEFAULT_SYNONYMS,
    ontologyPriorities: ['finance', 'cloud', 'sap'],
  },
});

resumeFamilyRegistry.register({
  id: 'email-signature',
  displayName: 'Email Signature / Contact Card',
  signals: [
    { pattern: /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g, weight: 0.3 },
    { pattern: /\b(regards|sincerely|thanks|best\s+wishes)\b/i, weight: 0.4 },
    { pattern: /\b(mobile|cell|ph|fax|tel)[\s:]+\+?[\d\s\-()]{7,}/i, weight: 0.2 },
    { pattern: /\b(linkedin\.com|linkedin\s+profile)\b/i, weight: 0.1 },
  ],
  extractionProfile: {
    expectedColumns: 1, hasDatedTimeline: false, hasSkillsSection: false,
    sectionSynonyms: {},
    ontologyPriorities: [],
  },
});

resumeFamilyRegistry.register({
  id: 'linkedin',
  displayName: 'LinkedIn Export',
  signals: [
    { pattern: /linkedin\.com\/in\//i, weight: 0.5 },
    { pattern: /\b(connections|followers|about|featured|activity)\b/i, weight: 0.3 },
    { pattern: /\b(open\s+to\s+work|looking\s+for\s+opportunities)\b/i, weight: 0.2 },
  ],
  extractionProfile: {
    expectedColumns: 1, hasDatedTimeline: true, hasSkillsSection: true,
    sectionSynonyms: DEFAULT_SYNONYMS,
    ontologyPriorities: ['java', 'dotnet', 'cloud', 'sap'],
  },
});

resumeFamilyRegistry.register({
  id: 'government',
  displayName: 'Government Resume',
  signals: [
    { pattern: /\b(ias|ips|ifs|upsc|state\s+public\s+service|civil\s+service|government\s+of\s+india)\b/i, weight: 0.5 },
    { pattern: /\b(ministry|department|secretariat|district\s+(collector|magistrate)|block\s+development)\b/i, weight: 0.3 },
    { pattern: /\b(gazetted|non-gazetted|grade|pay\s+band|cadre)\b/i, weight: 0.2 },
  ],
  extractionProfile: {
    expectedColumns: 1, hasDatedTimeline: true, hasSkillsSection: false,
    sectionSynonyms: {
      employment: ['service record', 'postings', 'appointments', 'career'],
      education: ['education', 'qualifications', 'degrees'],
      skills: ['areas of work', 'domains', 'subjects'],
      summary: ['profile', 'career objective'],
    },
    ontologyPriorities: ['finance', 'hr'],
  },
});

resumeFamilyRegistry.register({
  id: 'aviation',
  displayName: 'Aviation Resume',
  signals: [
    { pattern: /\b(pilot|atpl|cpl|ppl|type\s+rating|flight\s+hours|aeronautical)\b/i, weight: 0.5 },
    { pattern: /\b(boeing|airbus|b737|a320|b777|a380|aircraft\s+type)\b/i, weight: 0.3 },
    { pattern: /\b(dgca|icao|faa|atc|air\s+traffic)\b/i, weight: 0.2 },
  ],
  extractionProfile: {
    expectedColumns: 1, hasDatedTimeline: true, hasSkillsSection: false,
    sectionSynonyms: {
      employment: ['flight experience', 'employment history', 'career'],
      education: ['training', 'qualifications', 'ratings'],
      skills: ['ratings', 'endorsements', 'aircraft types'],
      summary: ['profile', 'summary'],
    },
    ontologyPriorities: ['aviation'],
  },
});
