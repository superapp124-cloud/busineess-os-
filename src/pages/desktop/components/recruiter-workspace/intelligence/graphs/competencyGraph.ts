import { SemanticEntity, StageConfidence, SemanticEntityType } from '../core/types';
import { ontologyRegistry } from '../ontologies/registry';

export interface SkillNode {
  nodeId: string;
  canonical: string;
  taxonomy: string[];
  skillType: SemanticEntityType;
  confidence: StageConfidence;
  evidenceId: string;
}

export interface CertNode {
  nodeId: string;
  name: string;
  issuer?: string;
  year?: string;
  evidenceId: string;
}

export interface DomainNode {
  nodeId: string;
  domain: string;
  evidenceId: string;
}

export interface CompetencyGraph {
  skills: SkillNode[];
  certifications: CertNode[];
  domains: DomainNode[];
}

export function buildCompetencyGraph(
  entities: SemanticEntity[],
  registry: typeof ontologyRegistry
): CompetencyGraph {
  const skillTypes: SemanticEntityType[] = [
    'TechnicalSkill', 
    'DomainSkill', 
    'SoftSkill', 
    'PlatformSkill', 
    'ToolSkill', 
    'LanguageSkill'
  ];
  
  const skillEntities = entities.filter(e => skillTypes.includes(e.canonicalType as SemanticEntityType));
  
  const skillsMap = new Map<string, SkillNode>();
  skillEntities.forEach(e => {
    const canonicalValue = e.value;
    if (!skillsMap.has(canonicalValue)) {
      const entry = registry.lookup(canonicalValue);
      const taxonomy: string[] = entry?.taxonomy ?? [canonicalValue];

      skillsMap.set(canonicalValue, {
        nodeId: `skill_${e.id}`,
        canonical: entry?.canonical ?? canonicalValue,
        taxonomy,
        skillType: e.canonicalType as SemanticEntityType,
        confidence: e.confidence ?? { lexical: 0.5, layout: 0.5, section: 0.5, ontology: 0.5, relationship: 0.5, overall: 0.5 },
        evidenceId: e.evidenceId ?? e.id,
      });
    }
  });

  const certEntities = entities.filter(e => e.canonicalType === 'CertificationName');
  const certifications: CertNode[] = certEntities.map(e => ({
    nodeId: `cert_${e.id}`,
    name: e.value,
    evidenceId: e.evidenceId ?? e.id,
  }));

  const domainEntities = entities.filter(e => e.canonicalType === 'DomainSkill');
  const domains: DomainNode[] = domainEntities.map(e => ({
    nodeId: `domain_${e.id}`,
    domain: e.value,
    evidenceId: e.evidenceId ?? e.id,
  }));

  return {
    skills: Array.from(skillsMap.values()),
    certifications,
    domains
  };
}
