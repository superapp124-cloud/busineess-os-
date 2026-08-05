/**
 * Resume Intelligence OS v3.0 — SAP Ontology
 */
import type { OntologyModule } from './registry';

export const sapOntology: OntologyModule = {
  id: 'sap', displayName: 'SAP ERP', version: '1.0.0',
  entries: [
    { canonical: 'SAP FICO', aliases: ['FICO', 'FI/CO', 'Financial Accounting CO', 'SAP Finance'], parentCategory: 'ERP', grandparentCategory: 'Enterprise Software', skillType: 'TechnicalSkill', taxonomy: ['Enterprise Software', 'ERP', 'SAP', 'Finance Module', 'SAP FICO'] },
    { canonical: 'SAP MM', aliases: ['Materials Management', 'MM Module', 'SAP Procurement'], parentCategory: 'ERP', grandparentCategory: 'Enterprise Software', skillType: 'TechnicalSkill', taxonomy: ['Enterprise Software', 'ERP', 'SAP', 'Logistics', 'SAP MM'] },
    { canonical: 'SAP SD', aliases: ['Sales and Distribution', 'SD Module', 'SAP Sales'], parentCategory: 'ERP', grandparentCategory: 'Enterprise Software', skillType: 'TechnicalSkill', taxonomy: ['Enterprise Software', 'ERP', 'SAP', 'Sales', 'SAP SD'] },
    { canonical: 'SAP ABAP', aliases: ['ABAP', 'Advanced Business Application Programming', 'ABAP Developer'], parentCategory: 'ERP', grandparentCategory: 'Enterprise Software', skillType: 'TechnicalSkill', taxonomy: ['Enterprise Software', 'ERP', 'SAP', 'Development', 'SAP ABAP'] },
    { canonical: 'SAP Basis', aliases: ['Basis', 'SAP NetWeaver', 'SAP Administration'], parentCategory: 'ERP', grandparentCategory: 'Enterprise Software', skillType: 'TechnicalSkill', taxonomy: ['Enterprise Software', 'ERP', 'SAP', 'Infrastructure', 'SAP Basis'] },
    { canonical: 'SAP Security', aliases: ['SAP GRC', 'SAP Authorization', 'Role Administration'], parentCategory: 'ERP', grandparentCategory: 'Enterprise Software', skillType: 'TechnicalSkill', taxonomy: ['Enterprise Software', 'ERP', 'SAP', 'Security', 'SAP Security'] },
    { canonical: 'SAP PM', aliases: ['Plant Maintenance', 'PM Module'], parentCategory: 'ERP', grandparentCategory: 'Enterprise Software', skillType: 'TechnicalSkill', taxonomy: ['Enterprise Software', 'ERP', 'SAP', 'Maintenance', 'SAP PM'] },
    { canonical: 'SAP WM', aliases: ['Warehouse Management', 'WM Module'], parentCategory: 'ERP', grandparentCategory: 'Enterprise Software', skillType: 'TechnicalSkill', taxonomy: ['Enterprise Software', 'ERP', 'SAP', 'Logistics', 'SAP WM'] },
    { canonical: 'SAP EWM', aliases: ['Extended Warehouse Management', 'EWM'], parentCategory: 'ERP', grandparentCategory: 'Enterprise Software', skillType: 'TechnicalSkill', taxonomy: ['Enterprise Software', 'ERP', 'SAP', 'Logistics', 'SAP EWM'] },
    { canonical: 'S/4HANA', aliases: ['SAP S4HANA', 'S4 HANA', 'S4/HANA', 'SAP S/4'], parentCategory: 'ERP', grandparentCategory: 'Enterprise Software', skillType: 'TechnicalSkill', taxonomy: ['Enterprise Software', 'ERP', 'SAP', 'S/4HANA'] },
    { canonical: 'SAP BTP', aliases: ['Business Technology Platform', 'SAP Cloud Platform', 'SCP'], parentCategory: 'Cloud', grandparentCategory: 'SAP', skillType: 'PlatformSkill', taxonomy: ['Enterprise Software', 'SAP', 'Cloud', 'SAP BTP'] },
    { canonical: 'SAP FSCM', aliases: ['Financial Supply Chain Management', 'FSCM'], parentCategory: 'ERP', grandparentCategory: 'Enterprise Software', skillType: 'TechnicalSkill', taxonomy: ['Enterprise Software', 'ERP', 'SAP', 'Finance Module', 'SAP FSCM'] },
    { canonical: 'SAP HCM', aliases: ['Human Capital Management', 'SAP HR', 'HCM Module'], parentCategory: 'ERP', grandparentCategory: 'Enterprise Software', skillType: 'TechnicalSkill', taxonomy: ['Enterprise Software', 'ERP', 'SAP', 'HR', 'SAP HCM'] },
    { canonical: 'SAP CRM', aliases: ['Customer Relationship Management SAP', 'SAP C/4HANA'], parentCategory: 'ERP', grandparentCategory: 'Enterprise Software', skillType: 'TechnicalSkill', taxonomy: ['Enterprise Software', 'ERP', 'SAP', 'CRM', 'SAP CRM'] },
    { canonical: 'SAP BI/BW', aliases: ['SAP BW', 'Business Warehouse', 'SAP BI', 'SAP Analytics'], parentCategory: 'Analytics', grandparentCategory: 'Enterprise Software', skillType: 'TechnicalSkill', taxonomy: ['Enterprise Software', 'SAP', 'Analytics', 'SAP BI/BW'] },
    { canonical: 'SAP Fiori', aliases: ['Fiori', 'SAP UI5', 'SAPUI5', 'SAP UX'], parentCategory: 'Frontend', grandparentCategory: 'SAP', skillType: 'TechnicalSkill', taxonomy: ['Enterprise Software', 'SAP', 'Frontend', 'SAP Fiori'] },
  ],
};
