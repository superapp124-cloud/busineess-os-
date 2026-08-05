/**
 * Resume Intelligence OS v3.0 — Legal Ontology
 */
import type { OntologyModule } from './registry';

export const legalOntology: OntologyModule = {
  id: 'legal', displayName: 'Legal & Compliance', version: '1.0.0',
  entries: [
    { canonical: 'Mergers & Acquisitions', aliases: ['M&A', 'MA', 'M and A', 'Mergers and Acquisitions', 'M&A Due Diligence'], parentCategory: 'Corporate Law', grandparentCategory: 'Legal', skillType: 'DomainSkill', taxonomy: ['Legal', 'Corporate Law', 'M&A'] },
    { canonical: 'Intellectual Property Law', aliases: ['IP Law', 'IP', 'IPR', 'Intellectual Property Rights', 'Patent Law', 'Trademark'], parentCategory: 'Legal Practice', grandparentCategory: 'Legal', skillType: 'DomainSkill', taxonomy: ['Legal', 'Practice Areas', 'IP Law'] },
    { canonical: 'SEBI Compliance', aliases: ['SEBI', 'Securities and Exchange Board of India', 'SEBI Regulations'], parentCategory: 'Regulatory', grandparentCategory: 'Legal', skillType: 'DomainSkill', taxonomy: ['Legal', 'Regulatory', 'SEBI'] },
    { canonical: 'FEMA', aliases: ['Foreign Exchange Management Act', 'FEMA Compliance'], parentCategory: 'Regulatory', grandparentCategory: 'Legal', skillType: 'DomainSkill', taxonomy: ['Legal', 'Regulatory', 'FEMA'] },
    { canonical: 'Contract Negotiation', aliases: ['Contract Drafting', 'Commercial Contracts', 'Contract Review'], parentCategory: 'Transactional', grandparentCategory: 'Legal', skillType: 'DomainSkill', taxonomy: ['Legal', 'Transactional', 'Contract'] },
    { canonical: 'Commercial Litigation', aliases: ['Litigation', 'Civil Litigation', 'Court Proceedings', 'Legal Disputes'], parentCategory: 'Litigation', grandparentCategory: 'Legal', skillType: 'DomainSkill', taxonomy: ['Legal', 'Litigation', 'Commercial Litigation'] },
    { canonical: 'Arbitration', aliases: ['Commercial Arbitration', 'International Arbitration', 'ADR'], parentCategory: 'Dispute Resolution', grandparentCategory: 'Legal', skillType: 'DomainSkill', taxonomy: ['Legal', 'Dispute Resolution', 'Arbitration'] },
    { canonical: 'Corporate Governance', aliases: ['Board Governance', 'Company Secretarial', 'CS'], parentCategory: 'Corporate Law', grandparentCategory: 'Legal', skillType: 'DomainSkill', taxonomy: ['Legal', 'Corporate', 'Governance'] },
    { canonical: 'Data Privacy', aliases: ['PDPB', 'Data Protection Law', 'Privacy Law', 'GDPR Legal'], parentCategory: 'Regulatory', grandparentCategory: 'Legal', skillType: 'DomainSkill', taxonomy: ['Legal', 'Regulatory', 'Data Privacy'] },
    { canonical: 'Employment Law', aliases: ['Labour Law', 'Labor Law', 'Industrial Relations', 'HR Legal'], parentCategory: 'Legal Practice', grandparentCategory: 'Legal', skillType: 'DomainSkill', taxonomy: ['Legal', 'Practice Areas', 'Employment Law'] },
  ],
};
