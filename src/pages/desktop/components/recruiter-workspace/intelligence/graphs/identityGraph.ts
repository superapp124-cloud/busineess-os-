import { SemanticEntity, StageConfidence } from '../core/types';

export interface IdentityGraph {
  person: {
    name: string;
    preferredName?: string;
    candidateId?: string;
    initials?: string;
  };
  contacts: {
    email?: string;
    phone?: string;
    altPhone?: string;
    linkedin?: string;
    github?: string;
    portfolio?: string;
    website?: string;
  };
  address: {
    city?: string;
    state?: string;
    country?: string;
    zipCode?: string;
    nationality?: string;
  };
  confidence: StageConfidence;
}

export function buildIdentityGraph(entities: SemanticEntity[]): IdentityGraph {
  const person: IdentityGraph['person'] = { name: '' };
  const contacts: IdentityGraph['contacts'] = {};
  const address: IdentityGraph['address'] = {};
  
  let totalConfidence = 0;
  let count = 0;

  const extractBest = (type: string) => {
    const matched = entities
      .filter(e => e.canonicalType === type)
      .sort((a, b) => (b.confidence?.overall || 0) - (a.confidence?.overall || 0));
    
    if (matched.length > 0) {
      totalConfidence += matched[0].confidence?.overall || 0;
      count++;
      return matched[0].value;
    }
    return undefined;
  };

  const name = extractBest('PersonName');
  if (name) person.name = name;

  const email = extractBest('Email');
  if (email) contacts.email = email;

  const phone = extractBest('MobileNumber');
  if (phone) contacts.phone = phone;

  const altPhone = extractBest('AlternatePhone');
  if (altPhone) contacts.altPhone = altPhone;

  const linkedin = extractBest('LinkedIn');
  if (linkedin) contacts.linkedin = linkedin;

  const github = extractBest('GitHub');
  if (github) contacts.github = github;

  const portfolio = extractBest('Portfolio');
  if (portfolio) contacts.portfolio = portfolio;

  const website = extractBest('Website');
  if (website) contacts.website = website;

  const city = extractBest('City');
  if (city) address.city = city;

  const state = extractBest('State');
  if (state) address.state = state;

  const country = extractBest('Country');
  if (country) address.country = country;

  const zipCode = extractBest('ZipCode');
  if (zipCode) address.zipCode = zipCode;

  const nationality = extractBest('Nationality');
  if (nationality) address.nationality = nationality;

  const avgConf = count > 0 ? totalConfidence / count : 0;

  return {
    person,
    contacts,
    address,
    confidence: {
      lexical:      avgConf * 0.8,
      layout:       avgConf,
      section:      avgConf,
      ontology:     avgConf * 0.5,
      relationship: avgConf * 0.7,
      overall:      avgConf,
    },
  };
}
