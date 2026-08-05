/**
 * Resume Intelligence OS v3.0 — Marketing Ontology
 */
import type { OntologyModule } from './registry';

export const marketingOntology: OntologyModule = {
  id: 'marketing', displayName: 'Marketing & Growth', version: '1.0.0',
  entries: [
    { canonical: 'Digital Marketing', aliases: ['Online Marketing', 'Performance Marketing', 'Digital Advertising'], parentCategory: 'Marketing', grandparentCategory: 'Business', skillType: 'DomainSkill', taxonomy: ['Business', 'Marketing', 'Digital Marketing'] },
    { canonical: 'SEO', aliases: ['Search Engine Optimization', 'Organic Search', 'On-page SEO', 'Technical SEO'], parentCategory: 'Digital Marketing', grandparentCategory: 'Marketing', skillType: 'TechnicalSkill', taxonomy: ['Marketing', 'Digital', 'SEO'] },
    { canonical: 'Google Ads', aliases: ['Google AdWords', 'PPC', 'Pay Per Click', 'Search Ads'], parentCategory: 'Paid Media', grandparentCategory: 'Digital Marketing', skillType: 'ToolSkill', taxonomy: ['Marketing', 'Digital', 'Paid Media', 'Google Ads'] },
    { canonical: 'Social Media Marketing', aliases: ['SMM', 'Social Media Management', 'Social Media Strategy'], parentCategory: 'Digital Marketing', grandparentCategory: 'Marketing', skillType: 'DomainSkill', taxonomy: ['Marketing', 'Digital', 'Social Media'] },
    { canonical: 'HubSpot', aliases: ['HubSpot CRM', 'HubSpot Marketing Hub', 'Inbound Marketing'], parentCategory: 'Marketing Automation', grandparentCategory: 'Marketing Technology', skillType: 'ToolSkill', taxonomy: ['Marketing', 'Technology', 'HubSpot'] },
    { canonical: 'Content Marketing', aliases: ['Content Strategy', 'Content Creation', 'Copywriting'], parentCategory: 'Marketing', grandparentCategory: 'Business', skillType: 'DomainSkill', taxonomy: ['Marketing', 'Content', 'Content Marketing'] },
    { canonical: 'Brand Management', aliases: ['Brand Strategy', 'Brand Identity', 'Branding'], parentCategory: 'Marketing', grandparentCategory: 'Business', skillType: 'DomainSkill', taxonomy: ['Marketing', 'Brand', 'Brand Management'] },
    { canonical: 'Google Analytics', aliases: ['GA4', 'Google Analytics 4', 'Web Analytics'], parentCategory: 'Analytics', grandparentCategory: 'Marketing', skillType: 'ToolSkill', taxonomy: ['Marketing', 'Analytics', 'Google Analytics'] },
    { canonical: 'CRM Marketing', aliases: ['CRM', 'Customer Relationship Management Marketing', 'Salesforce Marketing'], parentCategory: 'Marketing Technology', grandparentCategory: 'Marketing', skillType: 'DomainSkill', taxonomy: ['Marketing', 'CRM', 'Customer Marketing'] },
  ],
};
