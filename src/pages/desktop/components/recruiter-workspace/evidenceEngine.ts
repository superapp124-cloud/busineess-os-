/**
 * Evidence-driven candidate intelligence boundary.
 *
 * Extraction adapters may provide facts from any document/OCR provider. This
 * module contains no candidate, employer, industry, or template knowledge.
 * Recruiter UI consumes only the validated result returned here.
 */
export type DocumentType =
  | 'Resume' | 'CV' | 'Academic CV' | 'Email Signature / Contact Card'
  | 'Business Card' | 'LinkedIn Export' | 'Cover Letter' | 'Portfolio'
  | 'Recommendation Letter' | 'Experience Letter' | 'Offer Letter'
  | 'Certificate' | 'Transcript' | 'Government ID' | 'Unknown';

export interface EvidenceRef {
  value: unknown;
  normalized_value?: unknown;
  confidence: number;
  page?: number;
  section?: string;
  evidence_snippet?: string;
  extractor?: string;
  extracted_at?: string;
  version?: string;
}

export interface EvidenceGraphInput {
  identity: boolean;
  designation: boolean;
  employment: boolean;
  dated_employment: boolean;
  equivalent_timeline?: boolean;
  skills: boolean;
  education: boolean;
  experience_statement: boolean;
  document_type?: DocumentType;
  classification_confidence?: number;
}

export interface EvidenceGateResult {
  document_type: DocumentType;
  classification_confidence: number;
  is_sufficient: boolean;
  verified_evidence: string[];
  missing_evidence: string[];
  reason: string;
}

export function classifyEvidence(input: EvidenceGraphInput): EvidenceGateResult {
  const contactOnly = input.identity && input.designation && !input.employment && !input.dated_employment;
  const type = input.document_type || (contactOnly ? 'Email Signature / Contact Card' : 'Unknown');
  const confidence = input.classification_confidence ?? (contactOnly ? 0.98 : 0.5);
  const missing = [
    !input.employment ? 'Employment history' : '',
    !input.dated_employment ? 'Dated employment record' : '',
    !input.skills ? 'Skills section' : '',
    !input.education && !input.experience_statement ? 'Education or experience summary' : ''
  ].filter(Boolean);
  const sufficient = confidence >= 0.8 && input.identity && input.designation && input.employment && (input.dated_employment || input.equivalent_timeline) && (input.skills || input.education || input.experience_statement);
  return {
    document_type: type,
    classification_confidence: confidence,
    is_sufficient: sufficient,
    verified_evidence: [input.identity ? 'Identity' : '', input.designation ? 'Designation' : '', input.employment ? 'Employment' : '', input.skills ? 'Skills' : '', input.education ? 'Education' : '', input.experience_statement ? 'Experience statement' : ''].filter(Boolean),
    missing_evidence: missing,
    reason: sufficient ? '' : 'Insufficient resume evidence to generate recruiter intelligence.'
  };
}

export function validateGraphField(field: EvidenceRef): boolean {
  return field.value !== undefined && field.value !== null && field.confidence >= 0 && field.confidence <= 1 && Boolean(field.evidence_snippet || field.page || field.section);
}
