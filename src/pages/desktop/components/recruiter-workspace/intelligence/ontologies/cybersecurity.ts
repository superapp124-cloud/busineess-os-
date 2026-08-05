/**
 * Resume Intelligence OS v3.0 — Cybersecurity Ontology
 */
import type { OntologyModule } from './registry';

export const cybersecurityOntology: OntologyModule = {
  id: 'cybersecurity', displayName: 'Cybersecurity', version: '1.0.0',
  entries: [
    { canonical: 'Penetration Testing', aliases: ['Pen Testing', 'Pentest', 'Ethical Hacking', 'Pentesting'], parentCategory: 'Offensive Security', grandparentCategory: 'Cybersecurity', skillType: 'TechnicalSkill', taxonomy: ['Cybersecurity', 'Offensive Security', 'Penetration Testing'] },
    { canonical: 'SIEM', aliases: ['Security Information and Event Management', 'Splunk SIEM', 'QRadar'], parentCategory: 'SOC', grandparentCategory: 'Cybersecurity', skillType: 'ToolSkill', taxonomy: ['Cybersecurity', 'SOC', 'SIEM'] },
    { canonical: 'SOC', aliases: ['Security Operations Center', 'SOC Analyst', 'L1 SOC', 'L2 SOC'], parentCategory: 'Operations', grandparentCategory: 'Cybersecurity', skillType: 'DomainSkill', taxonomy: ['Cybersecurity', 'Operations', 'SOC'] },
    { canonical: 'VAPT', aliases: ['Vulnerability Assessment and Penetration Testing', 'VA/PT'], parentCategory: 'Offensive Security', grandparentCategory: 'Cybersecurity', skillType: 'TechnicalSkill', taxonomy: ['Cybersecurity', 'Offensive Security', 'VAPT'] },
    { canonical: 'Incident Response', aliases: ['IR', 'Cyber Incident Response', 'DFIR'], parentCategory: 'Defensive Security', grandparentCategory: 'Cybersecurity', skillType: 'DomainSkill', taxonomy: ['Cybersecurity', 'Defensive Security', 'Incident Response'] },
    { canonical: 'Threat Intelligence', aliases: ['CTI', 'Cyber Threat Intelligence', 'Threat Hunting'], parentCategory: 'SOC', grandparentCategory: 'Cybersecurity', skillType: 'DomainSkill', taxonomy: ['Cybersecurity', 'SOC', 'Threat Intelligence'] },
    { canonical: 'ISO 27001', aliases: ['ISO27001', 'ISMS', 'Information Security Management'], parentCategory: 'Compliance', grandparentCategory: 'Cybersecurity', skillType: 'DomainSkill', taxonomy: ['Cybersecurity', 'Compliance', 'ISO 27001'] },
    { canonical: 'Firewall Management', aliases: ['Firewall', 'Next-Gen Firewall', 'NGFW', 'Palo Alto Firewall'], parentCategory: 'Network Security', grandparentCategory: 'Cybersecurity', skillType: 'TechnicalSkill', taxonomy: ['Cybersecurity', 'Network Security', 'Firewall'] },
    { canonical: 'Splunk', aliases: ['Splunk Enterprise', 'Splunk Cloud', 'Splunk SIEM'], parentCategory: 'SIEM Tool', grandparentCategory: 'Cybersecurity', skillType: 'ToolSkill', taxonomy: ['Cybersecurity', 'SOC', 'SIEM', 'Splunk'] },
    { canonical: 'CrowdStrike', aliases: ['CrowdStrike Falcon', 'EDR CrowdStrike'], parentCategory: 'EDR', grandparentCategory: 'Cybersecurity', skillType: 'ToolSkill', taxonomy: ['Cybersecurity', 'Endpoint Security', 'EDR', 'CrowdStrike'] },
    { canonical: 'Zero Trust', aliases: ['Zero Trust Architecture', 'ZTA', 'Zero Trust Security'], parentCategory: 'Architecture', grandparentCategory: 'Cybersecurity', skillType: 'DomainSkill', taxonomy: ['Cybersecurity', 'Architecture', 'Zero Trust'] },
    { canonical: 'GDPR', aliases: ['General Data Protection Regulation', 'Data Protection', 'GDPR Compliance'], parentCategory: 'Compliance', grandparentCategory: 'Cybersecurity', skillType: 'DomainSkill', taxonomy: ['Cybersecurity', 'Compliance', 'GDPR'] },
  ],
};
