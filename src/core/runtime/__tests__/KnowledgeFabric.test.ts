import { describe, it, expect, beforeEach } from 'vitest';
import { KnowledgeFabric, KnowledgePack } from '../KnowledgeFabric';

describe('Subsystem 4: Knowledge Fabric & Hybrid Vector Retrieval', () => {
  let fabric: KnowledgeFabric;

  beforeEach(() => {
    fabric = KnowledgeFabric.getInstance();
  });

  it('Test-KF-1: Cosine Vector Similarity & Hybrid Search', () => {
    const query = 'Metformin contrast dye kidney risk';
    const results = fabric.searchHybrid(query, 3);

    expect(results.length).toBeGreaterThan(0);
    expect(results[0].id).toBe('sop_diabetes_contrast');
    expect(results[0].score).toBeGreaterThan(0.5);
  });

  it('Test-KF-2: Embedding Provenance Tracking', () => {
    const results = fabric.searchHybrid('Metformin', 1);
    expect(results[0].provenance).toBeDefined();
    expect(results[0].provenance?.sourceUri).toContain('ada_t2dm_guidelines_2026.pdf');
    expect(results[0].provenance?.modelId).toBe('text-embedding-3-small');
  });

  it('Test-KF-3: Multi-Domain Knowledge Pack Registration', () => {
    const customPack: KnowledgePack = {
      id: 'pack_finance_custom',
      domain: 'Finance',
      policies: [
        {
          id: 'pol_tax_2026',
          name: 'ITD AIS Reconciliation SOP',
          description: 'Reconcile Form 26AS vs AIS data prior to filing.',
          department: 'Taxation',
          version: 'v2.0',
        },
      ],
      knowledge: [
        {
          id: 'kn_tax_discrepancy',
          category: 'SOP',
          content: 'Flag TDS mismatches greater than ₹2,000 for CA review before filing ITR.',
        },
      ],
    };

    fabric.registerKnowledgePack(customPack);

    const policies = fabric.queryPolicies('AIS Reconciliation');
    expect(policies.length).toBe(1);
    expect(policies[0].id).toBe('pol_tax_2026');

    const knowledge = fabric.searchHybrid('TDS mismatch CA review', 1);
    expect(knowledge[0].id).toBe('kn_tax_discrepancy');
  });

  it('Test-KF-4: Semantic Vector Query Cache', () => {
    const query = 'L5 platform engineer hiring';
    const firstRun = fabric.searchHybrid(query, 2);
    const cachedRun = fabric.searchHybrid(query, 2);

    expect(firstRun).toEqual(cachedRun);
  });
});
