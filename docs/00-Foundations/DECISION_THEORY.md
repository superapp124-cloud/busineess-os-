# 00-Foundations — Decision Theory (docs/00-Foundations/DECISION_THEORY.md)

> **Status**: Permanent Decision Theory Specification  
> **Scope**: Decoupling Prediction, Policy, and Decision Evaluation.

---

## 1. The 7-Engine Decision Pipeline

```
State Engine ──> Prediction Engine ──> Simulation Engine ──> Optimization Engine ──> Policy Engine ──> Decision Engine ──> Execution Engine
```

1. **State Engine**: Manages real-time state and operating graph edges.
2. **Prediction Engine**: Computes raw probabilistic outcome distributions (unconstrained by policy).
3. **Simulation Engine**: Generates scenario trajectories ($S_0 \dots S_T$).
4. **Optimization Engine**: Solves objective functions subject to resource constraints.
5. **Policy Engine**: Enforces mandatory risk, governance, and compliance guardrails.
6. **Decision Engine**: Combines prediction, policy, and confidence into actionable verdicts (`APPROVED`, `REJECTED`, `ESCALATE_TO_HUMAN`).
7. **Execution Engine**: Dispatches action to assigned Substrate (Human, AI, Robot).

---

## 2. Advanced Evaluation Artifacts

```typescript
export interface ScenarioOutcome {
  scenarioType: 'bestCase' | 'expectedCase' | 'worstCase';
  projectedForceDeltas: Map<string, number>;
  probability: number;
}

export interface SensitivityVector {
  variableName: string;
  sensitivityCoefficient: number; // E.g., ΔHiringProbability -5% -> ΔRevenue -12%
}

export interface DecisionEvaluationResult {
  evaluationId: string;
  entityId: string;
  
  // Scenarios & Confidence
  scenarios: {
    bestCase: ScenarioOutcome;
    expectedCase: ScenarioOutcome;
    worstCase: ScenarioOutcome;
  };
  epistemicConfidence: EpistemicConfidence;
  
  // Explainability & Sensitivity
  explicitAssumptions: string[];
  sensitivityAnalysis: SensitivityVector[];
  
  // Verdict
  decisionVerdict: 'APPROVED' | 'REJECTED' | 'ESCALATE_TO_HUMAN';
  rejectionReason?: string;
}
```
