/**
 * Resume Intelligence OS v3.0 — Manufacturing Ontology
 */
import type { OntologyModule } from './registry';

export const manufacturingOntology: OntologyModule = {
  id: 'manufacturing', displayName: 'Manufacturing & Operations', version: '1.0.0',
  entries: [
    { canonical: 'Lean Manufacturing', aliases: ['Lean', 'Lean Production', 'Lean Principles', 'Toyota Production System'], parentCategory: 'Operations Excellence', grandparentCategory: 'Manufacturing', skillType: 'DomainSkill', taxonomy: ['Manufacturing', 'Excellence', 'Lean'] },
    { canonical: 'Six Sigma', aliases: ['Lean Six Sigma', 'DMAIC', 'Black Belt', 'Green Belt', 'Six Sigma Black Belt'], parentCategory: 'Quality', grandparentCategory: 'Manufacturing', skillType: 'DomainSkill', taxonomy: ['Manufacturing', 'Quality', 'Six Sigma'] },
    { canonical: 'ISO 9001', aliases: ['ISO9001', 'Quality Management System', 'QMS', 'ISO 9001:2015'], parentCategory: 'Quality Standards', grandparentCategory: 'Manufacturing', skillType: 'DomainSkill', taxonomy: ['Manufacturing', 'Quality', 'Standards', 'ISO 9001'] },
    { canonical: 'AutoCAD', aliases: ['Auto CAD', 'CAD', 'Computer Aided Design'], parentCategory: 'Engineering Software', grandparentCategory: 'Manufacturing', skillType: 'ToolSkill', taxonomy: ['Manufacturing', 'Engineering', 'CAD', 'AutoCAD'] },
    { canonical: 'Supply Chain Management', aliases: ['SCM', 'Supply Chain', 'Logistics', 'Supply Chain Optimization'], parentCategory: 'Operations', grandparentCategory: 'Manufacturing', skillType: 'DomainSkill', taxonomy: ['Manufacturing', 'Operations', 'Supply Chain'] },
    { canonical: 'Kaizen', aliases: ['Continuous Improvement', 'Kaizen Events', 'CI'], parentCategory: 'Operations Excellence', grandparentCategory: 'Manufacturing', skillType: 'DomainSkill', taxonomy: ['Manufacturing', 'Excellence', 'Kaizen'] },
    { canonical: 'ERP Manufacturing', aliases: ['SAP PP', 'Production Planning', 'MRP', 'Material Requirements Planning'], parentCategory: 'Manufacturing IT', grandparentCategory: 'Manufacturing', skillType: 'PlatformSkill', taxonomy: ['Manufacturing', 'IT', 'ERP', 'Production Planning'] },
    { canonical: 'Quality Control', aliases: ['QC', 'Quality Inspection', 'Quality Assurance Manufacturing', 'QA QC'], parentCategory: 'Quality', grandparentCategory: 'Manufacturing', skillType: 'DomainSkill', taxonomy: ['Manufacturing', 'Quality', 'QC'] },
    { canonical: 'CNC Programming', aliases: ['CNC', 'Computer Numerical Control', 'CNC Machining'], parentCategory: 'Engineering', grandparentCategory: 'Manufacturing', skillType: 'TechnicalSkill', taxonomy: ['Manufacturing', 'Engineering', 'CNC'] },
  ],
};
