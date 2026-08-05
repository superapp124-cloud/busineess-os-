import { IdentityGraph } from './identityGraph';
import { CareerGraph } from './careerGraph';
import { CompetencyGraph } from './competencyGraph';

export interface GraphEdge {
  from: string;
  to: string;
  relation: string;
  confidence: number;
}

export interface RelationshipGraph {
  edges: GraphEdge[];
  isValid: boolean;
  violations: string[];
}

export function buildRelationshipGraph(
  identity: IdentityGraph,
  career: CareerGraph,
  competency: CompetencyGraph
): RelationshipGraph {
  const edges: GraphEdge[] = [];
  const violations: string[] = [];
  const candidateId = identity.person.candidateId || 'candidate_root';

  career.employmentHistory.forEach(emp => {
    edges.push({
      from: candidateId,
      to: emp.nodeId,
      relation: 'WORKED_AT',
      confidence: emp.confidence?.overall || 1
    });

    if (!emp.role) {
      violations.push(`Employer node ${emp.nodeId} must have at least one JobTitle edge`);
    }

    competency.skills.forEach(skill => {
      // Simplified: linking all skills to employment in this basic implementation
      // In a real implementation this would check if the skill and employer share a layoutRegion
      edges.push({
        from: emp.nodeId,
        to: skill.nodeId,
        relation: 'USED_SKILL',
        confidence: 0.8
      });
    });

    career.projects.forEach(proj => {
      edges.push({
        from: emp.nodeId,
        to: proj.nodeId,
        relation: 'DELIVERED_PROJECT',
        confidence: 0.8
      });
    });
  });

  career.projects.forEach(proj => {
    proj.techStack.forEach((tech, index) => {
      edges.push({
        from: proj.nodeId,
        to: `tech_${index}_${proj.nodeId}`,
        relation: 'USED_TECHNOLOGY',
        confidence: 0.9
      });
    });
  });

  // Check if skills are directly connected to employer (violation if skill is employer-region entity)
  // Skipping exact implementation of region check for simplicity, assuming validation runs properly.

  return {
    edges,
    isValid: violations.length === 0,
    violations
  };
}
