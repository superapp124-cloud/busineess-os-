import { openTelemetryExporter } from '../telemetry/OpenTelemetryExporter';

export interface GovernanceAssessment {
  allowed: boolean;
  requiresLegalApproval: boolean;
  requiresExecutiveEscalation: boolean;
  riskScore: number;
  complianceReason: string;
  suggestedAction: 'PROCEED' | 'ESCALATE_LEGAL' | 'ESCALATE_EXECUTIVE' | 'REJECT';
}

/**
 * Subsystem 26: Runtime Governance Engine
 * Answers the critical enterprise question: "Should this happen?"
 * Evaluates Risk, Compliance, Human Escalation Gates, Exception Handling, and Audit Routing.
 */
export class RuntimeGovernanceEngine {
  private static instance: RuntimeGovernanceEngine;

  private constructor() {}

  public static getInstance(): RuntimeGovernanceEngine {
    if (!RuntimeGovernanceEngine.instance) {
      RuntimeGovernanceEngine.instance = new RuntimeGovernanceEngine();
    }
    return RuntimeGovernanceEngine.instance;
  }

  public async evaluateGovernance(intent: {
    action: string;
    targetEntity: string;
    actor: string;
    tenantId: string;
    impactUSD?: number;
  }): Promise<GovernanceAssessment> {
    const span = openTelemetryExporter.startSpan('Governance.Evaluate', undefined, {
      action: intent.action,
      actor: intent.actor,
      tenantId: intent.tenantId,
    });

    let riskScore = 0.1;
    let requiresLegalApproval = false;
    let requiresExecutiveEscalation = false;
    let suggestedAction: GovernanceAssessment['suggestedAction'] = 'PROCEED';
    let complianceReason = 'Governance policy passed: Low risk routine action.';

    // Rule 1: High-impact actions (e.g. employee termination or contract cancellation) require Legal approval
    if (intent.action.toLowerCase().includes('terminate') || intent.action.toLowerCase().includes('cancel_contract')) {
      riskScore = 0.85;
      requiresLegalApproval = true;
      suggestedAction = 'ESCALATE_LEGAL';
      complianceReason = 'Governance Guard: Employee termination or contract cancellation requires mandatory Legal approval.';
    }

    // Rule 2: High financial impact (> $50,000) requires Executive escalation
    if (intent.impactUSD && intent.impactUSD > 50000) {
      riskScore = 0.92;
      requiresExecutiveEscalation = true;
      suggestedAction = 'ESCALATE_EXECUTIVE';
      complianceReason = `Governance Guard: Financial impact ($${intent.impactUSD.toLocaleString()}) exceeds executive threshold ($50,000).`;
    }

    const assessment: GovernanceAssessment = {
      allowed: suggestedAction === 'PROCEED',
      requiresLegalApproval,
      requiresExecutiveEscalation,
      riskScore,
      complianceReason,
      suggestedAction,
    };

    openTelemetryExporter.log(assessment.allowed ? 'INFO' : 'WARN', `Runtime Governance Assessment: ${intent.action} -> ${suggestedAction}`, {
      traceId: span.traceId,
      spanId: span.spanId,
      tenantId: intent.tenantId,
      userId: intent.actor,
      attributes: { assessment },
    });

    openTelemetryExporter.endSpan(span.spanId, 'OK');
    return assessment;
  }
}

export const runtimeGovernanceEngine = RuntimeGovernanceEngine.getInstance();
