import { evidenceRegistry } from './EvidenceRegistry';
import { Evidence } from './EvaluationTypes';

/**
 * EvidenceCollector
 * Automated evidence collection agent that monitors system telemetry, unit test outputs,
 * performance benchmarks, and pilot feedback.
 */
export class EvidenceCollector {
  private static instance: EvidenceCollector;

  private constructor() {}

  public static getInstance(): EvidenceCollector {
    if (!EvidenceCollector.instance) {
      EvidenceCollector.instance = new EvidenceCollector();
    }
    return EvidenceCollector.instance;
  }

  public recordUnitTestEvidence(
    sectionId: string,
    testName: string,
    sourceFile: string,
    passCount: number
  ): Evidence {
    const evidence: Evidence = {
      id: `ev_ut_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      type: 'UnitTest',
      description: `Automated unit test '${testName}' passed cleanly`,
      source: sourceFile,
      date: new Date().toISOString().split('T')[0],
      confidence: 'High',
      metricValue: `${passCount} passing tests`,
    };

    evidenceRegistry.addEvidence(sectionId, evidence);
    return evidence;
  }

  public recordBenchmarkEvidence(
    sectionId: string,
    operationName: string,
    measuredLatencyMs: number,
    targetMs: number
  ): Evidence {
    const evidence: Evidence = {
      id: `ev_bm_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      type: 'PerformanceBenchmark',
      description: `Benchmark '${operationName}' measured ${measuredLatencyMs}ms (Target < ${targetMs}ms)`,
      source: 'PhaseBValidation.test.ts',
      date: new Date().toISOString().split('T')[0],
      confidence: 'High',
      metricValue: `${measuredLatencyMs} ms`,
    };

    evidenceRegistry.addEvidence(sectionId, evidence);
    return evidence;
  }
}

export const evidenceCollector = EvidenceCollector.getInstance();
