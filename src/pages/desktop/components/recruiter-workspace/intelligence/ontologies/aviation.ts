/**
 * Resume Intelligence OS v3.0 — Aviation Ontology
 */
import type { OntologyModule } from './registry';

export const aviationOntology: OntologyModule = {
  id: 'aviation', displayName: 'Aviation & Aerospace', version: '1.0.0',
  entries: [
    { canonical: 'ICAO', aliases: ['International Civil Aviation Organization', 'ICAO Standards', 'ICAO Annex'], parentCategory: 'Regulatory', grandparentCategory: 'Aviation', skillType: 'DomainSkill', taxonomy: ['Aviation', 'Regulatory', 'ICAO'] },
    { canonical: 'DGCA', aliases: ['Directorate General of Civil Aviation', 'DGCA India'], parentCategory: 'Regulatory', grandparentCategory: 'Aviation', skillType: 'DomainSkill', taxonomy: ['Aviation', 'Regulatory', 'DGCA'] },
    { canonical: 'FAA', aliases: ['Federal Aviation Administration', 'FAA Regulations'], parentCategory: 'Regulatory', grandparentCategory: 'Aviation', skillType: 'DomainSkill', taxonomy: ['Aviation', 'Regulatory', 'FAA'] },
    { canonical: 'B737', aliases: ['Boeing 737', '737', 'Boeing 737 NG', '737 MAX'], parentCategory: 'Aircraft Type', grandparentCategory: 'Aviation', skillType: 'TechnicalSkill', taxonomy: ['Aviation', 'Flight Operations', 'Aircraft Type', 'B737'] },
    { canonical: 'A320', aliases: ['Airbus A320', 'A320 Family', 'A319', 'A321'], parentCategory: 'Aircraft Type', grandparentCategory: 'Aviation', skillType: 'TechnicalSkill', taxonomy: ['Aviation', 'Flight Operations', 'Aircraft Type', 'A320'] },
    { canonical: 'Flight Safety', aliases: ['Aviation Safety', 'SMS', 'Safety Management System', 'Flight Safety Audit'], parentCategory: 'Safety', grandparentCategory: 'Aviation', skillType: 'DomainSkill', taxonomy: ['Aviation', 'Safety', 'Flight Safety'] },
    { canonical: 'LOSA', aliases: ['Line Operations Safety Audit', 'LOSA Observation'], parentCategory: 'Safety', grandparentCategory: 'Aviation', skillType: 'DomainSkill', taxonomy: ['Aviation', 'Safety', 'LOSA'] },
    { canonical: 'Flight Operations', aliases: ['Flight Ops', 'Airline Operations', 'FOps'], parentCategory: 'Operations', grandparentCategory: 'Aviation', skillType: 'DomainSkill', taxonomy: ['Aviation', 'Operations', 'Flight Operations'] },
    { canonical: 'Aircraft Maintenance', aliases: ['AME', 'Aircraft Maintenance Engineer', 'MRO', 'CAMO'], parentCategory: 'Maintenance', grandparentCategory: 'Aviation', skillType: 'TechnicalSkill', taxonomy: ['Aviation', 'Maintenance', 'Aircraft Maintenance'] },
    { canonical: 'Air Traffic Control', aliases: ['ATC', 'Air Traffic Management', 'ATM'], parentCategory: 'ATC', grandparentCategory: 'Aviation', skillType: 'DomainSkill', taxonomy: ['Aviation', 'ATC', 'Air Traffic Control'] },
  ],
};
