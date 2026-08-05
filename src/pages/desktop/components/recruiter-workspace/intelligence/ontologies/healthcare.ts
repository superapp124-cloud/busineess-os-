/**
 * Resume Intelligence OS v3.0 — Healthcare Ontology
 */
import type { OntologyModule } from './registry';

export const healthcareOntology: OntologyModule = {
  id: 'healthcare', displayName: 'Healthcare & Medical', version: '1.0.0',
  entries: [
    { canonical: 'HL7', aliases: ['Health Level 7', 'HL7 Integration', 'HL7 Messaging'], parentCategory: 'Healthcare IT', grandparentCategory: 'Healthcare', skillType: 'TechnicalSkill', taxonomy: ['Healthcare', 'Healthcare IT', 'Standards', 'HL7'] },
    { canonical: 'FHIR', aliases: ['Fast Healthcare Interoperability Resources', 'HL7 FHIR', 'FHIR API'], parentCategory: 'Healthcare IT', grandparentCategory: 'Healthcare', skillType: 'TechnicalSkill', taxonomy: ['Healthcare', 'Healthcare IT', 'Standards', 'FHIR'] },
    { canonical: 'ICD-10', aliases: ['ICD', 'ICD-10-CM', 'ICD Coding', 'Medical Coding'], parentCategory: 'Clinical Coding', grandparentCategory: 'Healthcare', skillType: 'DomainSkill', taxonomy: ['Healthcare', 'Clinical', 'Coding', 'ICD-10'] },
    { canonical: 'HIPAA', aliases: ['Health Insurance Portability', 'HIPAA Compliance', 'PHI'], parentCategory: 'Compliance', grandparentCategory: 'Healthcare', skillType: 'DomainSkill', taxonomy: ['Healthcare', 'Compliance', 'HIPAA'] },
    { canonical: 'Epic', aliases: ['Epic EHR', 'Epic Systems', 'Epic EMR'], parentCategory: 'EHR System', grandparentCategory: 'Healthcare IT', skillType: 'PlatformSkill', taxonomy: ['Healthcare', 'Healthcare IT', 'EHR', 'Epic'] },
    { canonical: 'Cerner', aliases: ['Cerner EMR', 'Cerner EHR', 'Oracle Cerner'], parentCategory: 'EHR System', grandparentCategory: 'Healthcare IT', skillType: 'PlatformSkill', taxonomy: ['Healthcare', 'Healthcare IT', 'EHR', 'Cerner'] },
    { canonical: 'NABH', aliases: ['National Accreditation Board for Hospitals', 'NABH Accreditation'], parentCategory: 'Quality', grandparentCategory: 'Healthcare', skillType: 'DomainSkill', taxonomy: ['Healthcare', 'Accreditation', 'NABH'] },
    { canonical: 'EMR', aliases: ['Electronic Medical Record', 'Electronic Health Record', 'EHR'], parentCategory: 'Healthcare IT', grandparentCategory: 'Healthcare', skillType: 'DomainSkill', taxonomy: ['Healthcare', 'Healthcare IT', 'EMR'] },
    { canonical: 'Clinical Cardiology', aliases: ['Cardiology', 'Cardiologist', 'Cardiac Care'], parentCategory: 'Clinical Specialty', grandparentCategory: 'Healthcare', skillType: 'DomainSkill', taxonomy: ['Healthcare', 'Clinical', 'Specialty', 'Cardiology'] },
    { canonical: 'ICU Management', aliases: ['Intensive Care Unit', 'Critical Care', 'ICU', 'MICU'], parentCategory: 'Clinical', grandparentCategory: 'Healthcare', skillType: 'DomainSkill', taxonomy: ['Healthcare', 'Clinical', 'ICU'] },
    { canonical: 'Pharmacovigilance', aliases: ['Drug Safety', 'PV', 'Adverse Event Reporting'], parentCategory: 'Pharma', grandparentCategory: 'Healthcare', skillType: 'DomainSkill', taxonomy: ['Healthcare', 'Pharma', 'Pharmacovigilance'] },
    { canonical: 'Clinical Trials', aliases: ['Clinical Research', 'Phase I-IV Trials', 'GCP'], parentCategory: 'Research', grandparentCategory: 'Healthcare', skillType: 'DomainSkill', taxonomy: ['Healthcare', 'Research', 'Clinical Trials'] },
  ],
};
