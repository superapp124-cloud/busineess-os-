/**
 * Resume Intelligence OS v3.0 — Feedback Registry
 *
 * Every recruiter correction becomes a permanent benchmark case + regression test.
 * This is how the parser continuously improves without hardcoding.
 *
 * Flow:
 *   Recruiter edits "IBM Client" → "IBM India Pvt. Ltd."
 *       ↓
 *   FeedbackRegistry.record()
 *       ↓
 *   Stored as BenchmarkCandidate
 *       ↓
 *   runBenchmark() picks it up on next parser release
 *       ↓
 *   If extraction still wrong → regression test FAILS
 */

import type { SemanticEntityType } from './types';

// ─── Feedback Record ──────────────────────────────────────────────────────────

export interface FeedbackRecord {
  feedbackId: string;
  candidateId: string;
  sessionId?: string;
  recruiterId?: string;
  fieldKey: string;
  /** What the parser extracted (wrong value) */
  extractedValue: string;
  /** What the recruiter corrected it to (right value) */
  correctedValue: string;
  /** Canonical type the parser assigned */
  extractedType: SemanticEntityType;
  /** What the type should have been */
  correctedType: SemanticEntityType;
  /** Raw text snippet from which the entity was extracted */
  sourceSnippet: string;
  evidenceId: string;
  /** Parser version at time of feedback */
  parserVersion: string;
  /** Whether this feedback has been promoted to a benchmark case */
  benchmarkId: string | null;
  feedbackAt: string;
}

// ─── Benchmark Candidate (generated from feedback) ────────────────────────────

export interface BenchmarkCandidate {
  benchmarkId: string;
  sourceType: 'recruiter-feedback' | 'regression' | 'edge-case' | 'stress-test';
  family: string;
  description: string;
  /** Redacted raw text used for re-extraction */
  rawTextSnippet: string;
  /** Ground-truth expectations */
  expectations: Array<{
    fieldKey: string;
    expectedValue: string;
    expectedType: SemanticEntityType;
    minConfidence: number;
  }>;
  createdAt: string;
  lastRanAt?: string;
  lastResult?: 'pass' | 'fail' | 'not-run';
  failureReason?: string;
}

// ─── Registry ─────────────────────────────────────────────────────────────────

class FeedbackRegistryImpl {
  private readonly feedbacks = new Map<string, FeedbackRecord>();
  private readonly benchmarks = new Map<string, BenchmarkCandidate>();
  private idCounter = 0;

  private makeId(prefix: string): string {
    return `${prefix}-${++this.idCounter}-${Date.now().toString(36)}`;
  }

  /**
   * Record a recruiter correction.
   * Automatically promotes to a benchmark candidate.
   */
  record(params: Omit<FeedbackRecord, 'feedbackId' | 'feedbackAt' | 'benchmarkId'>): FeedbackRecord {
    const feedbackId = this.makeId('fb');

    // Auto-promote to benchmark
    const benchmarkId = this.makeId('bm');
    const benchmark: BenchmarkCandidate = {
      benchmarkId,
      sourceType: 'recruiter-feedback',
      family: 'feedback-derived',
      description: `Recruiter corrected "${params.extractedValue}" → "${params.correctedValue}" for ${params.fieldKey}`,
      rawTextSnippet: params.sourceSnippet,
      expectations: [{
        fieldKey: params.fieldKey,
        expectedValue: params.correctedValue,
        expectedType: params.correctedType,
        minConfidence: 0.7,
      }],
      createdAt: new Date().toISOString(),
      lastResult: 'not-run',
    };
    this.benchmarks.set(benchmarkId, benchmark);

    const record: FeedbackRecord = {
      ...params,
      feedbackId,
      benchmarkId,
      feedbackAt: new Date().toISOString(),
    };
    this.feedbacks.set(feedbackId, record);

    console.info(`[FeedbackRegistry] Recorded feedback ${feedbackId} → promoted to benchmark ${benchmarkId}`);
    return record;
  }

  /**
   * Manually add a benchmark candidate (for real redacted resumes).
   */
  addBenchmark(params: Omit<BenchmarkCandidate, 'benchmarkId' | 'createdAt' | 'lastResult'>): BenchmarkCandidate {
    const benchmarkId = this.makeId('bm');
    const benchmark: BenchmarkCandidate = {
      ...params,
      benchmarkId,
      createdAt: new Date().toISOString(),
      lastResult: 'not-run',
    };
    this.benchmarks.set(benchmarkId, benchmark);
    return benchmark;
  }

  getAllFeedbacks(): FeedbackRecord[] {
    return [...this.feedbacks.values()];
  }

  getBenchmarkCandidates(sourceType?: BenchmarkCandidate['sourceType']): BenchmarkCandidate[] {
    const all = [...this.benchmarks.values()];
    return sourceType ? all.filter(b => b.sourceType === sourceType) : all;
  }

  updateBenchmarkResult(
    benchmarkId: string,
    result: 'pass' | 'fail',
    failureReason?: string
  ): void {
    const bm = this.benchmarks.get(benchmarkId);
    if (bm) {
      bm.lastRanAt = new Date().toISOString();
      bm.lastResult = result;
      bm.failureReason = failureReason;
    }
  }

  /** Returns all failed benchmarks from the last run. */
  getFailedBenchmarks(): BenchmarkCandidate[] {
    return [...this.benchmarks.values()].filter(b => b.lastResult === 'fail');
  }

  stats(): { totalFeedbacks: number; benchmarkCandidates: number; failedBenchmarks: number } {
    return {
      totalFeedbacks: this.feedbacks.size,
      benchmarkCandidates: this.benchmarks.size,
      failedBenchmarks: this.getFailedBenchmarks().length,
    };
  }
}

export const feedbackRegistry = new FeedbackRegistryImpl();
