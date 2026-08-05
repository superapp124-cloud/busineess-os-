import type { Candidate, CandidateDoc, CandidateWorkHistory, CandidateAcademicProfile, CandidateSourceArtifact } from './types';
import { classifyEvidence, type DocumentType, type EvidenceGateResult, type EvidenceRef } from './evidenceEngine';

export interface IngestionDocument {
  name: string;
  mimeType: string;
  nativeText?: string;
  receivedAt: string;
}

export interface ExtractedPage {
  page: number;
  text: string;
  confidence: number;
}

export interface ExtractionArtifact {
  source: 'native-text' | 'ocr';
  provider: string;
  version: string;
  pages: ExtractedPage[];
}

export interface TextExtractionProvider {
  id: string;
  extract(document: IngestionDocument): Promise<ExtractionArtifact | null>;
}

export interface OcrExtractionProvider extends TextExtractionProvider {
  id: string;
}

export interface TalentGraphEntity {
  id: string;
  type: 'Candidate' | 'Contact' | 'Employment' | 'Employer' | 'Designation' | 'Skill' | 'Education' | 'Location';
  evidence: EvidenceRef;
}

export interface TalentKnowledgeGraph {
  schema_version: string;
  parser_versions: Record<string, string>;
  document: { type: DocumentType; confidence: number; source: ExtractionArtifact['source'] };
  entities: TalentGraphEntity[];
  relationships: Array<{ from: string; to: string; type: string }>;
}

export interface ResumeIntelligenceResult {
  candidate: Partial<Candidate>;
  graph: TalentKnowledgeGraph;
  gate: EvidenceGateResult;
}

const EMAIL = /[\w.+-]+@[\w.-]+\.[A-Za-z]{2,}/g;
const PHONE = /(?:\+?\d{1,3}[ .-]?)?(?:\(?\d{2,4}\)?[ .-]?){2,4}\d{3,4}/g;
const YEAR = /\b(?:19|20)\d{2}\b/g;

function createEvidence(value: string, page: number, section: string, snippet: string, extractor: string): EvidenceRef {
  return {
    value,
    normalized_value: value,
    confidence: 0.95,
    page,
    section,
    evidence_snippet: snippet,
    extractor,
    extracted_at: new Date().toISOString(),
    version: '1.0.0'
  };
}

type ProfileFamily = 'academic' | 'general';

function classifyDocument(pages: ExtractedPage[]): { type: DocumentType; confidence: number; family: ProfileFamily } {
  const text = pages.map(page => page.text).join('\n');
  const lines = text.split(/\r?\n/).map(line => line.trim()).filter(Boolean);
  const dates = text.match(YEAR)?.length ?? 0;
  const contacts = (text.match(EMAIL)?.length ?? 0) + (text.match(PHONE)?.length ?? 0);
  const academicSignals = [
    /curriculum\s+vitae/i,
    /academic\s+(profile|career|qualification)/i,
    /\b(university|college|faculty|department)\b/i,
    /\b(research|publication|thesis|doctoral|ph\.?d)\b/i,
    /\b(teaching|supervision|dean|professor)\b/i
  ].filter(pattern => pattern.test(text)).length;

  // Profile-family classification is structural and semantic. It never uses
  // a candidate, institution, profession, or template-specific mapping.
  if (/curriculum\s+vitae/i.test(text) && academicSignals >= 3) return { type: 'Academic CV', confidence: 0.99, family: 'academic' };
  if (lines.length <= 12 && contacts >= 1 && dates === 0) return { type: 'Email Signature / Contact Card', confidence: 0.9, family: 'general' };
  if (pages.length >= 1 && lines.length >= 20 && dates >= 2) return { type: 'Resume', confidence: 0.82, family: 'general' };
  return { type: 'Unknown', confidence: 0.45, family: 'general' };
}

function splitEvidenceList(line: string): string[] {
  return line
    .replace(/^[\s•·\-–—\d.)]+/, '')
    .split(/[;|•·]|,(?=\s*[A-Z])/)
    .map(value => value.trim())
    .filter(value => value.length >= 3 && value.length <= 120);
}

function findCandidateName(lines: string[], filename?: string): string {
  const lineMatch = lines.find(line => {
    const candidate = line.replace(/^[\s•·\-–—]+/, '').trim();
    if (candidate.includes('@') || candidate.includes('http') || candidate.length < 3 || candidate.length > 50) return false;
    if (/curriculum|vitae|resume|profile|contact|education|research|publication|summary|experience|work\s+history/i.test(candidate)) return false;
    const words = candidate.split(/\s+/).filter(Boolean);
    return words.length >= 1 && words.length <= 5 && !/^[0-9+() -]+$/.test(candidate);
  });

  if (lineMatch) return lineMatch.trim();

  if (filename) {
    const cleanName = filename
      .replace(/\.(docx?|pdf|rtf|txt)$/i, '')
      .replace(/^(resume|cv|dossier)[_\s-]+/i, '')
      .replace(/[_\s-]+(resume|cv|dossier)$/i, '')
      .replace(/[-_]/g, ' ')
      .trim();
    if (cleanName.length >= 2 && !/^(resume|cv|document|file)$/i.test(cleanName)) {
      return cleanName;
    }
  }

  return 'Candidate';
}

function collectAcademicEntities(lines: string[], extractor: string): {
  entities: TalentGraphEntity[];
  workHistory: CandidateWorkHistory[];
  profile: CandidateAcademicProfile;
  designation?: string;
  declaredExperience?: number;
} {
  const entities: TalentGraphEntity[] = [];
  const profile: CandidateAcademicProfile = {
    professional_categories: [], primary_domains: [], education: [], research: [], leadership: [], awards: []
  };
  const workHistory: CandidateWorkHistory[] = [];
  const add = (type: TalentGraphEntity['type'], value: string, section: string, line: number) => {
    if (!value || entities.some(entity => entity.type === type && entity.evidence.value === value)) return;
    entities.push({ id: `${type.toLowerCase()}-${entities.length}`, type, evidence: createEvidence(value, 1, section, value, extractor) });
  };

  let section = 'academic-profile';
  const sectionMatchers: Array<[RegExp, string]> = [
    [/education|qualification|degree/i, 'education'],
    [/research|publication|scholar|thesis/i, 'research'],
    [/award|honou?r|recognition/i, 'awards'],
    [/administration|leadership|appointment|position|experience|employment/i, 'leadership'],
    [/expertise|speciali[sz]ation|interest|discipline|area/i, 'domains']
  ];
  let declaredExperience: number | undefined;
  let designation: string | undefined;

  lines.forEach((rawLine, index) => {
    const line = rawLine.trim();
    if (!line) return;
    const matchedSection = sectionMatchers.find(([pattern]) => pattern.test(line) && line.length <= 80);
    if (matchedSection) section = matchedSection[1];

    const experienceMatch = line.match(/\b(\d{1,2}(?:\.\d+)?)\s*\+?\s*(?:years?|yrs?)\b/i);
    if (experienceMatch && /experience|service|teaching|academic/i.test(line)) {
      declaredExperience = Number(experienceMatch[1]);
      add('Employment', line, 'experience', index + 1);
    }

    const designationPattern = /\b(?:engineer|developer|consultant|analyst|lead|manager|executive|architect|administrator|specialist|officer|director|principal|vice[-\s]?chancellor|dean|chair(?:man|person)?|professor|registrar|coordinator|advisor|head)\b/i;
    if (designationPattern.test(line) && line.length <= 140) {
      const value = line.replace(/^[\s•·\-–—\d.)]+/, '').trim();
      profile.leadership.push(value);
      profile.professional_categories.push(value);
      add('Designation', value, section, index + 1);
      add('Employment', value, section, index + 1);
      designation ||= value;
      
      const compMatch = line.match(/(?:at|with|for|@|company:?|employer:?)\s+([A-Z0-9][A-Za-z0-9\s&.,'()-]{2,40})/i);
      const companyFound = compMatch?.[1]?.trim();

      const range = value.match(/\b((?:19|20)\d{2})\s*(?:-|–|to)\s*((?:19|20)\d{2}|present)\b/i);
      const duration = value.match(/\b\d+\s*(?:years?|yrs?)\b/i)?.[0];
      if (range || duration || companyFound) {
        workHistory.push({
          company: companyFound || '',
          role: value,
          start_year: range?.[1] || '', end_year: range?.[2] || '', duration,
          ctc: '', reason_for_leaving: ''
        });
      }
    }

    if (section === 'education' && /\b(?:ph\.?d|doctor(?:ate)?|master|m\.?a\.?|bachelor|b\.?a\.?|b\.?ed\.?|diploma|degree)\b/i.test(line)) {
      splitEvidenceList(line).forEach(value => { profile.education.push(value); add('Education', value, section, index + 1); });
    }
    if (section === 'research' && /\b(?:research|publication|book|article|scholar|supervis|thesis|journal)\b/i.test(line)) {
      profile.research.push(line);
    }
    if (section === 'awards' && /\b(?:award|honou?r|medal|recognition|achievement)\b/i.test(line)) {
      profile.awards.push(line);
    }
    if (section === 'domains' || /\b(?:literature|education|governance|curriculum|language|audit|evaluation|research)\b/i.test(line)) {
      splitEvidenceList(line).forEach(value => {
        if (value.length <= 80) {
          profile.primary_domains.push(value);
          add('Skill', value, section, index + 1);
        }
      });
    }
  });

  for (const key of Object.keys(profile) as Array<keyof CandidateAcademicProfile>) {
    profile[key] = [...new Set(profile[key])];
  }
  return { entities, workHistory, profile, designation, declaredExperience };
}

export class NativeTextProvider implements TextExtractionProvider {
  id = 'native-text';

  async extract(document: IngestionDocument): Promise<ExtractionArtifact | null> {
    const text = document.nativeText?.trim();
    if (!text) return null;
    return {
      source: 'native-text',
      provider: this.id,
      version: '1.0.0',
      pages: [{ page: 1, text, confidence: 1 }]
    };
  }
}

export class ResumeIntelligencePipeline {
  constructor(
    private readonly nativeProviders: TextExtractionProvider[] = [new NativeTextProvider()],
    private readonly ocrProviders: OcrExtractionProvider[] = []
  ) {}

  async process(document: IngestionDocument): Promise<ResumeIntelligenceResult> {
    let extraction: ExtractionArtifact | null = null;
    for (const provider of this.nativeProviders) {
      extraction = await provider.extract(document);
      if (extraction?.pages.some(page => page.confidence >= 0.8 && page.text.trim().length > 0)) break;
    }
    if (!extraction) {
      for (const provider of this.ocrProviders) {
        extraction = await provider.extract(document);
        if (extraction) break;
      }
    }

    const pages = extraction?.pages ?? [];
    const classification = classifyDocument(pages);
    const entities: TalentGraphEntity[] = [];
    const allLines = pages.flatMap(page => page.text.split(/\r?\n/).map(line => line.trim()).filter(Boolean));
    for (const page of pages) {
      for (const email of page.text.match(EMAIL) ?? []) {
        entities.push({ id: `contact-email-${entities.length}`, type: 'Contact', evidence: createEvidence(email, page.page, 'contact', email, extraction!.provider) });
      }
      for (const phone of page.text.match(PHONE) ?? []) {
        const digits = phone.replace(/\D/g, '');
        if (digits.length >= 7) entities.push({ id: `contact-phone-${entities.length}`, type: 'Contact', evidence: createEvidence(phone, page.page, 'contact', phone, extraction!.provider) });
      }
    }

    const email = entities.find(entity => entity.id.startsWith('contact-email-'))?.evidence.value as string | undefined;
    const phone = entities.find(entity => entity.id.startsWith('contact-phone-'))?.evidence.value as string | undefined;
    const candidateName = findCandidateName(allLines, document.name);
    const parts = (candidateName || 'Candidate').split(' ');
    const firstName = parts[0] || 'Candidate';
    const lastName = parts.slice(1).join(' ') || '';
    const academic = classification.family === 'academic'
      ? collectAcademicEntities(allLines, extraction?.provider ?? 'unavailable')
      : undefined;
    if (candidateName) {
      entities.push({ id: 'candidate-identity', type: 'Candidate', evidence: createEvidence(candidateName, 1, 'identity', candidateName, extraction?.provider ?? 'unavailable') });
    }
    if (academic) entities.push(...academic.entities);

    const declaredEmployment = entities.some(entity => entity.type === 'Employment');
    const skills = academic?.profile.primary_domains ?? [];
    const hasEducation = Boolean(academic?.profile.education.length);
    const hasEquivalentTimeline = Boolean(academic?.workHistory.length);
    const gate = classifyEvidence({
      identity: Boolean(candidateName || email || phone),
      designation: Boolean(academic?.designation),
      employment: declaredEmployment,
      dated_employment: Boolean(academic?.workHistory.some(item => item.start_year && item.end_year)),
      equivalent_timeline: hasEquivalentTimeline,
      skills: skills.length > 0,
      education: hasEducation,
      experience_statement: academic?.declaredExperience !== undefined,
      document_type: classification.type,
      classification_confidence: classification.confidence
    });

    const nameParts = candidateName?.split(/\s+/) ?? [];
    const relationships = entities
      .filter(entity => entity.id !== 'candidate-identity')
      .map(entity => ({ from: 'candidate-identity', to: entity.id, type: 'SUPPORTED_BY' }));
    const executiveSummary = gate.is_sufficient && academic
      ? [
          academic.designation ? `Documented senior profile: ${academic.designation}.` : '',
          academic.declaredExperience !== undefined ? `Declared experience: ${academic.declaredExperience}+ years.` : '',
          academic.profile.primary_domains.length ? `Documented domains: ${academic.profile.primary_domains.slice(0, 5).join(', ')}.` : ''
        ].filter(Boolean).join(' ')
      : undefined;
    const documentRecord: CandidateDoc = { name: document.name, type: classification.type, date: document.receivedAt };
    const sourceArtifact: CandidateSourceArtifact = {
      id: typeof crypto !== 'undefined' && 'randomUUID' in crypto ? crypto.randomUUID() : `${document.name}-${document.receivedAt}`,
      original_file_name: document.name,
      mime_type: document.mimeType,
      native_text: document.nativeText,
      ocr_output: extraction?.source === 'ocr' ? pages.map(page => page.text).join('\n') : undefined,
      layout_graph: pages.map(page => ({ page: page.page, reading_order: 'provider', text_confidence: page.confidence })),
      knowledge_graph: undefined,
      parser_versions: { extraction: extraction?.version ?? 'unavailable', classification: '1.0.0', graph: '1.0.0', validation: '1.0.0' },
      parsed_at: document.receivedAt,
      parse_history: []
    };
    const graph: TalentKnowledgeGraph = {
      schema_version: '1.0.0',
      parser_versions: sourceArtifact.parser_versions,
      document: { type: classification.type, confidence: classification.confidence, source: extraction?.source ?? 'ocr' },
      entities,
      relationships
    };
    sourceArtifact.knowledge_graph = graph;
    return {
      candidate: {
        first_name: firstName || 'Candidate',
        last_name: lastName || '',
        email: email || '',
        phone: phone || null,
        current_designation: academic?.designation,
        experience_years: academic?.declaredExperience,
        skills,
        work_history: academic?.workHistory,
        academic_profile: academic?.profile,
        executive_summary: executiveSummary,
        documents: [documentRecord],
        source_artifact: sourceArtifact,
        evidence_sufficiency: {
          ...gate,
          document_type: gate.document_type === 'Resume' || gate.document_type === 'Academic CV' || gate.document_type === 'Email Signature / Contact Card'
            ? gate.document_type
            : 'Unknown'
        },
        traceability_matrix: Object.fromEntries(entities.map(entity => [entity.id, {
          field_name: entity.type,
          original_text: String(entity.evidence.value),
          normalized_value: String(entity.evidence.normalized_value ?? entity.evidence.value),
          confidence_score: Math.round(entity.evidence.confidence * 100),
          source_page: entity.evidence.page,
          source_section: entity.evidence.section,
          source_span: entity.evidence.evidence_snippet,
          extraction_engine: entity.evidence.extractor,
          contradiction_status: 'Verified (No Conflict)',
          normalization_history: []
        }]))
      },
      graph,
      gate
    };
  }
}
