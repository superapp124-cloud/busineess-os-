/**
 * Staffing & IT Services Composition Pack (Phase 5 Vertical Pack)
 * 
 * Maps Staffing & IT Services business domain capabilities directly to the frozen @intent/kernel substrate.
 * Demonstrates ZERO kernel modification while executing candidate matching, consultant deployment, and margin optimization.
 */

export interface StaffingITCapabilityConfig {
  packName: string;
  version: string;
  kernelVersion: string;
  mappedCapabilities: {
    capabilityId: string;
    domain: string;
    description: string;
    expectedForceDeltaTransform: string;
  }[];
}

export const StaffingITCompositionPack: StaffingITCapabilityConfig = {
  packName: 'Staffing & IT Services Pack',
  version: '1.0.0',
  kernelVersion: '1.0.0-rc1 (Level A Frozen)',
  mappedCapabilities: [
    {
      capabilityId: 'StaffingIT.acquireTalent',
      domain: 'People',
      description: 'Candidate sourcing, resume parsing, AI match scoring, and candidate 360 lifecycles.',
      expectedForceDeltaTransform: 'ΔCapacity: +0.35, ΔCash: -$45,000, ΔRisk: -0.10'
    },
    {
      capabilityId: 'StaffingIT.deployConsultant',
      domain: 'Operations',
      description: 'Consultant assignment, SLA tracking, timesheet approval, and bill rate optimization.',
      expectedForceDeltaTransform: 'ΔCash: +$120,000, ΔTrust: +0.25, ΔCapacity: -0.10'
    },
    {
      capabilityId: 'StaffingIT.optimizeMargin',
      domain: 'Finance',
      description: 'Gross margin tracking, invoice collection escalation, and cashflow runway forecasting.',
      expectedForceDeltaTransform: 'ΔCash: +$155,000, ΔRisk: -0.20, ΔTrust: +0.15'
    }
  ]
};
