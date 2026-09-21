import { DemandEntity, DemandCluster, UDXIntentClass, UDXAudience, UDXBusinessSegment, Provenance } from './types';

/**
 * DemandGraph Engine
 * Normalizes, classifies, and clusters demand entities
 */
export class DemandGraph {
  
  /**
   * Normalizes a search query
   */
  normalize(query: string): string {
    return query.toLowerCase().replace(/[^\w\s]/gi, '').trim();
  }

  /**
   * Classifies the intent of a query
   */
  classifyIntent(query: string): { intent: UDXIntentClass, confidence: number } {
    const normalized = this.normalize(query);
    if (normalized.includes('how to') || normalized.includes('what is')) return { intent: 'INFORMATIONAL', confidence: 0.9 };
    if (normalized.includes('vs') || normalized.includes('best')) return { intent: 'COMPARISON', confidence: 0.85 };
    if (normalized.includes('jobs') || normalized.includes('hiring')) return { intent: 'JOB_SEARCH', confidence: 0.95 };
    if (normalized.includes('resume') || normalized.includes('cv')) return { intent: 'RESUME_ATS', confidence: 0.9 };
    return { intent: 'DISCOVERY', confidence: 0.5 };
  }

  /**
   * Classifies the target audience
   */
  classifyAudience(query: string, intent: UDXIntentClass): { audience: UDXAudience, confidence: number } {
    const normalized = this.normalize(query);
    if (normalized.includes('fresher') || normalized.includes('intern')) return { audience: 'fresher', confidence: 0.9 };
    if (normalized.includes('hire') || normalized.includes('recruiting')) return { audience: 'employer', confidence: 0.85 };
    if (normalized.includes('change career')) return { audience: 'career_changer', confidence: 0.9 };
    if (normalized.includes('student')) return { audience: 'student', confidence: 0.95 };
    if (normalized.includes('salary') || normalized.includes('professional')) return { audience: 'professional', confidence: 0.8 };
    return { audience: 'unknown', confidence: 0.3 };
  }

  /**
   * Classifies the business segment
   */
  classifyBusinessSegment(query: string, intent: UDXIntentClass, audience: UDXAudience): { segment: UDXBusinessSegment, confidence: number } {
    const normalized = this.normalize(query);
    if (normalized.includes('resume') || normalized.includes('ats')) return { segment: 'ats', confidence: 0.9 };
    if (normalized.includes('interview')) return { segment: 'interview_prep', confidence: 0.95 };
    if (normalized.includes('salary')) return { segment: 'salary_intel', confidence: 0.9 };
    if (normalized.includes('hire')) return { segment: 'hiring', confidence: 0.85 };
    if (normalized.includes('learn') || normalized.includes('course')) return { segment: 'skill_learning', confidence: 0.8 };
    return { segment: 'unknown', confidence: 0.4 };
  }

  /**
   * Resolves the product destination URL
   */
  resolveProductDestination(segment: UDXBusinessSegment, intent: UDXIntentClass, country: string): string | null {
    if (segment === 'ats') return 'https://talentxcel.in/resume-checker';
    if (segment === 'hiring') return 'https://talentxcel.in/employers';
    if (segment === 'interview_prep') return 'https://talentxcel.in/interview';
    if (segment === 'job_search' || intent === 'JOB_SEARCH') return 'https://talentxcel.in/jobs';
    if (segment === 'salary_intel') return 'https://talentxcel.in/salary';
    return 'https://talentxcel.in';
  }

  /**
   * Builds semantic clusters of demand entities
   */
  buildCluster(entities: DemandEntity[]): DemandCluster[] {
    // Simplified naive clustering by intent and audience
    const clustersMap: Record<string, DemandEntity[]> = {};
    
    entities.forEach(entity => {
      const key = `${entity.intent}_${entity.audience}`;
      if (!clustersMap[key]) clustersMap[key] = [];
      clustersMap[key].push(entity);
    });

    return Object.keys(clustersMap).map((key, i) => {
      const clusterEntities = clustersMap[key];
      const totalVolume = clusterEntities.reduce((sum, e) => sum + e.searchAppearances, 0);
      return {
        id: `cluster_${Date.now()}_${i}`,
        tenantId: clusterEntities[0].tenantId,
        name: `Cluster for ${key}`,
        entities: clusterEntities,
        totalVolume,
        averageDifficulty: 50, // mock
        provenance: {
          source: 'demand_graph_engine',
          timestamp: new Date().toISOString(),
          confidence: 0.8
        }
      };
    });
  }

  /**
   * Returns full provenance for an entity
   */
  getEvidenceChain(entity: DemandEntity): Provenance {
    return entity.provenance;
  }
}
