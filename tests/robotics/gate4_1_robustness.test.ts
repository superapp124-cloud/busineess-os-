import { describe, it, expect } from 'vitest';
import {
  RealisticActuator,
  MonteCarloRobustnessRunner,
} from '../../packages/robot-locomotion/src';

describe('GATE 4.1-R: Failure Accounting, Percentiles & Reproducibility Audit', () => {
  // ------------------------------------------------------------
  // 1. Strict 100% Outcome Taxonomy Accounting (100-Trial Batch)
  // ------------------------------------------------------------
  it('1. Outcome Accounting — Enforces 100% strict trial accounting with zero missing or unexplained runs', () => {
    const report = MonteCarloRobustnessRunner.runBatchAudit(100, 2026, 'REALISTIC');

    expect(report.totalTrials).toBe(100);

    const sumOutcomes =
      report.outcomes.SUCCESS +
      report.outcomes.RECOVERED_FAILURE +
      report.outcomes.NON_RECOVERABLE_FAILURE +
      report.outcomes.CATASTROPHIC_FALL +
      report.outcomes.INVALID_RUN +
      report.outcomes.TIMEOUT +
      report.outcomes.NUMERICAL_FAILURE;

    expect(sumOutcomes).toBe(100);

    const sumPercentages = Object.values(report.outcomePercentages).reduce((acc, p) => acc + p, 0);
    expect(sumPercentages).toBeCloseTo(100.0, 1);

    expect(report.outcomes.SUCCESS).toBeGreaterThanOrEqual(90);
    expect(report.outcomes.CATASTROPHIC_FALL).toBe(0);
    expect(report.outcomes.NUMERICAL_FAILURE).toBe(0);
  });

  // ------------------------------------------------------------
  // 2. Statistical Percentile Distributions (P50, P90, P95, P99, Min, Max)
  // ------------------------------------------------------------
  it('2. Statistical Percentiles — Generates P50, P90, P95, P99, Min, Max across all 6 locomotion variables', () => {
    const report = MonteCarloRobustnessRunner.runBatchAudit(100, 2026, 'REALISTIC');
    const p = report.percentiles;

    // Stability Margin (Meters)
    expect(p.stabilityMarginMeters.min).toBeGreaterThan(0.010);
    expect(p.stabilityMarginMeters.p50).toBeGreaterThan(0.030);
    expect(p.stabilityMarginMeters.max).toBeLessThan(0.060);

    // Foot Slip (Meters)
    expect(p.footSlipMeters.p50).toBeLessThan(0.001);
    expect(p.footSlipMeters.p99).toBeLessThan(0.002);

    // Friction Utilization Ratio
    expect(p.frictionUtilizationRatio.p50).toBeGreaterThan(0.02);
    expect(p.frictionUtilizationRatio.max).toBeLessThan(0.85);

    // Joint Tracking Error (Radians)
    expect(p.jointTrackingErrorRad.p50).toBeLessThan(0.070); // < 4.0 deg
    expect(p.jointTrackingErrorRad.max).toBeLessThan(0.090); // < 5.2 deg

    // Torque Utilization (%)
    expect(p.torqueUtilizationPercentage.p50).toBeLessThan(55.0);
    expect(p.torqueUtilizationPercentage.max).toBeLessThan(65.0);
  });

  // ------------------------------------------------------------
  // 3. Deterministic Per-Trial Provenance Seeds
  // ------------------------------------------------------------
  it('3. Per-Trial Provenance — Guarantees every single trial possesses a reproducible seed and hash', () => {
    const reportA = MonteCarloRobustnessRunner.runBatchAudit(10, 4242, 'REALISTIC');
    const reportB = MonteCarloRobustnessRunner.runBatchAudit(10, 4242, 'REALISTIC');

    expect(reportA.individualTrialResults.length).toBe(10);

    for (let i = 0; i < 10; i++) {
      const trialA = reportA.individualTrialResults[i];
      const trialB = reportB.individualTrialResults[i];

      expect(trialA.provenance.seed).toBe(trialB.provenance.seed);
      expect(trialA.provenance.initialStateHash).toBe(trialB.provenance.initialStateHash);
      expect(trialA.stabilityMarginMeters).toBe(trialB.stabilityMarginMeters);
      expect(trialA.frictionUtilizationRatio).toBe(trialB.frictionUtilizationRatio);
    }
  });

  // ------------------------------------------------------------
  // 4. Physical Coulomb Limit vs Engineering Operating Margin
  // ------------------------------------------------------------
  it('4. Friction Rationale — Distinguishes physical limit (1.000) from engineering safety limit (0.850)', () => {
    const report = MonteCarloRobustnessRunner.runBatchAudit(50, 2026, 'REALISTIC');
    const audit = report.frictionAudit;

    expect(audit.physicalCoulombLimit).toBe(1.000);
    expect(audit.engineeringOperatingLimit).toBe(0.850);
    expect(audit.operatingLimitRationale.length).toBeGreaterThan(20);
    expect(audit.worstCaseObservedRatio).toBeLessThan(audit.engineeringOperatingLimit);
    expect(audit.marginBelowOperatingLimit).toBeGreaterThan(0.05);
  });

  // ------------------------------------------------------------
  // 5. Disturbance Failure Envelope (5N to 60N Force Sweep)
  // ------------------------------------------------------------
  it('5. Disturbance Envelope — Identifies exact recovery boundaries from 5N up to 60N impulses', () => {
    const envelope = MonteCarloRobustnessRunner.evaluateDisturbanceEnvelope();
    expect(envelope.length).toBe(84);

    const smallForces = envelope.filter((r) => r.impulseForceN <= 10.0);
    for (const r of smallForces) {
      expect(r.outcome).toBe('RECOVERED_ANKLE');
    }

    const hipForces = envelope.filter((r) => r.impulseForceN === 20.0);
    for (const r of hipForces) {
      expect(r.outcome).toBe('RECOVERED_HIP');
    }

    const steppingForces = envelope.filter((r) => r.impulseForceN === 30.0 || r.impulseForceN === 40.0);
    for (const r of steppingForces) {
      expect(r.outcome).toBe('RECOVERED_STEPPING');
    }

    const extremeForces = envelope.filter((r) => r.impulseForceN >= 50.0);
    for (const r of extremeForces) {
      expect(r.outcome).toBe('UNRECOVERABLE_COLLAPSE');
    }
  });

  // ------------------------------------------------------------
  // 6. Task Completion Accuracy Metrics
  // ------------------------------------------------------------
  it('6. Task Completion — Verifies forward velocity, heading drift, and foot placement precision', () => {
    const report = MonteCarloRobustnessRunner.runBatchAudit(50, 2026, 'REALISTIC');
    const task = report.taskCompletionMetrics;

    expect(task.averageForwardVelocityMps).toBeCloseTo(0.417, 2);
    expect(task.averageHeadingDriftDeg).toBeLessThan(1.0);
    expect(task.maxHeadingDriftDeg).toBeLessThan(3.0);
    expect(task.footPlacementAccuracyMeters).toBeLessThan(0.015);
  });

  // ------------------------------------------------------------
  // 7. Degraded Actuator / Communication Mode Strict Accounting
  // ------------------------------------------------------------
  it('7. Degraded Accounting — Enforces 100% strict accounting under -20% torque loss and 25ms lag', () => {
    const degradedReport = MonteCarloRobustnessRunner.runBatchAudit(50, 2026, 'DEGRADED');

    expect(degradedReport.totalTrials).toBe(50);

    const sumOutcomes =
      degradedReport.outcomes.SUCCESS +
      degradedReport.outcomes.RECOVERED_FAILURE +
      degradedReport.outcomes.NON_RECOVERABLE_FAILURE +
      degradedReport.outcomes.CATASTROPHIC_FALL +
      degradedReport.outcomes.INVALID_RUN +
      degradedReport.outcomes.TIMEOUT +
      degradedReport.outcomes.NUMERICAL_FAILURE;

    expect(sumOutcomes).toBe(50);
    expect(degradedReport.outcomes.CATASTROPHIC_FALL).toBe(0);
    expect(degradedReport.outcomePercentages.SUCCESS + degradedReport.outcomePercentages.RECOVERED_FAILURE).toBe(100.0);
  });
});
