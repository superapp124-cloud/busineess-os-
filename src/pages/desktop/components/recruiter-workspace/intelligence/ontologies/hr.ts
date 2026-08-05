/**
 * Resume Intelligence OS v3.0 — HR Ontology
 */
import type { OntologyModule } from './registry';

export const hrOntology: OntologyModule = {
  id: 'hr', displayName: 'Human Resources', version: '1.0.0',
  entries: [
    { canonical: 'Talent Acquisition', aliases: ['Recruitment', 'Hiring', 'TA', 'Talent Sourcing', 'End to End Recruitment'], parentCategory: 'HR', grandparentCategory: 'Human Resources', skillType: 'DomainSkill', taxonomy: ['HR', 'Talent', 'Talent Acquisition'] },
    { canonical: 'HR Business Partner', aliases: ['HRBP', 'HR Partner', 'Strategic HR'], parentCategory: 'HR', grandparentCategory: 'Human Resources', skillType: 'DomainSkill', taxonomy: ['HR', 'Business Partnering', 'HRBP'] },
    { canonical: 'Payroll Management', aliases: ['Payroll Processing', 'Payroll', 'Salary Processing'], parentCategory: 'HR Operations', grandparentCategory: 'Human Resources', skillType: 'DomainSkill', taxonomy: ['HR', 'Operations', 'Payroll'] },
    { canonical: 'HRMS', aliases: ['Human Resource Management System', 'HRM Software', 'Darwin Box', 'SAP HR', 'Keka'], parentCategory: 'HR Technology', grandparentCategory: 'HR', skillType: 'PlatformSkill', taxonomy: ['HR', 'Technology', 'HRMS'] },
    { canonical: 'Performance Management', aliases: ['PMS', 'Appraisal', 'Performance Appraisal', 'Annual Review', 'KRA'], parentCategory: 'HR', grandparentCategory: 'Human Resources', skillType: 'DomainSkill', taxonomy: ['HR', 'Performance', 'Performance Management'] },
    { canonical: 'Employee Engagement', aliases: ['Employee Experience', 'Culture Building', 'EE Programs'], parentCategory: 'HR', grandparentCategory: 'Human Resources', skillType: 'DomainSkill', taxonomy: ['HR', 'Culture', 'Employee Engagement'] },
    { canonical: 'Learning & Development', aliases: ['L&D', 'Training and Development', 'Training', 'L and D'], parentCategory: 'HR', grandparentCategory: 'Human Resources', skillType: 'DomainSkill', taxonomy: ['HR', 'Development', 'L&D'] },
    { canonical: 'Compensation & Benefits', aliases: ['C&B', 'Total Rewards', 'Benefits Administration', 'Comp & Ben'], parentCategory: 'HR', grandparentCategory: 'Human Resources', skillType: 'DomainSkill', taxonomy: ['HR', 'Compensation', 'C&B'] },
    { canonical: 'Statutory Compliance', aliases: ['HR Compliance', 'Labour Law Compliance', 'PF ESI'], parentCategory: 'HR Operations', grandparentCategory: 'Human Resources', skillType: 'DomainSkill', taxonomy: ['HR', 'Compliance', 'Statutory'] },
  ],
};
