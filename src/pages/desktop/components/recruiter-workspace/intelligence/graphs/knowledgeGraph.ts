import { SemanticEntity, DocumentFingerprint, ParserVersions, QualityGateResult } from '../core/types';
import { IdentityGraph, buildIdentityGraph } from './identityGraph';
import { CareerGraph, buildCareerGraph } from './careerGraph';
import { CompetencyGraph, buildCompetencyGraph, CertNode } from './competencyGraph';
import { RelationshipGraph, buildRelationshipGraph } from './relationshipGraph';
import { ontologyRegistry } from '../ontologies/registry';

export interface CandidateKnowledgeGraph {
  candidateId: string;
  identity: IdentityGraph;
  career: CareerGraph;
  competency: CompetencyGraph;
  relationships: RelationshipGraph;
  allEntities: SemanticEntity[];
  documentFingerprint: DocumentFingerprint;
  parserVersions: ParserVersions;
  qualityGate?: QualityGateResult;
  processedAt: string;
}

export function buildKnowledgeGraph(params: {
  candidateId: string;
  entities: SemanticEntity[];
  rawLines: string[];
  fingerprint: DocumentFingerprint;
  parserVersions: ParserVersions;
}): CandidateKnowledgeGraph {
  const identity = buildIdentityGraph(params.entities);
  const career = buildCareerGraph(params.entities, params.rawLines);
  const competency = buildCompetencyGraph(params.entities, ontologyRegistry);
  const relationships = buildRelationshipGraph(identity, career, competency);

  const enhancedEntities = params.entities.map(entity => {
    return {
      ...entity,
      lineage: {
        ...(entity.lineage || {}),
        graphNodeId: `node_${entity.id}`
      }
    };
  });

  return {
    candidateId: params.candidateId,
    identity,
    career,
    competency,
    relationships,
    allEntities: enhancedEntities,
    documentFingerprint: params.fingerprint,
    parserVersions: params.parserVersions,
    processedAt: new Date().toISOString()
  };
}

export class GraphQueryAPI {
  constructor(private graph: CandidateKnowledgeGraph) {}

  currentEmployer(): string {
    const firstEmp = this.graph.career.employmentHistory[0];
    if (firstEmp && (firstEmp.isCurrent || firstEmp)) {
      return firstEmp.employer;
    }
    return 'Employer Unverified';
  }

  currentRole(): string {
    const firstEmp = this.graph.career.employmentHistory[0];
    if (firstEmp && (firstEmp.isCurrent || firstEmp)) {
      return firstEmp.role || 'Role Unverified';
    }
    return 'Role Unverified';
  }

  email(): string {
    return this.graph.identity.contacts.email ?? '';
  }

  phone(): string | null {
    return this.graph.identity.contacts.phone ?? null;
  }

  fullName(): string {
    return this.graph.identity.person.name ?? 'Candidate';
  }

  city(): string {
    return this.graph.identity.address.city ?? '';
  }

  skills(category?: string): string[] {
    let skills = this.graph.competency.skills;
    if (category) {
      skills = skills.filter(s => s.taxonomy && s.taxonomy.includes(category));
    }
    return skills.map(s => s.canonical);
  }

  certifications(issuer?: string): CertNode[] {
    let certs = this.graph.competency.certifications;
    if (issuer) {
      certs = certs.filter(c => c.issuer === issuer);
    }
    return certs;
  }

  totalExperienceYears(): number | null {
    return this.graph.career.totalDeclaredYears;
  }

  hasSkill(skill: string): boolean {
    const lowerSkill = skill.toLowerCase();
    return this.graph.competency.skills.some(s => s.canonical.toLowerCase() === lowerSkill);
  }

  explainField(fieldKey: string): { value: string; confidence: number; section: string; page: number; evidenceId: string } | null {
    // This is a stub for provenance lookup. In a real system, it would map fieldKey back to its source entity.
    return null;
  }
}
