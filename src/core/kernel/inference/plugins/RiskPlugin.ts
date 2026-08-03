import { InferencePlugin } from '../InferencePlugin';
import { InferenceContext, InferenceHypothesis, RiskHypothesis } from '../../../types';

export class RiskPlugin implements InferencePlugin {
  public id = 'plugin_risk_analysis';
  public name = 'Risk Analysis Plugin';
  public description = 'Evaluates raw facts to determine operational or compliance risk.';

  public async execute(context: InferenceContext): Promise<InferenceHypothesis[]> {
    const hypotheses: InferenceHypothesis[] = [];
    const eventPayload = context.triggeringEvent.payload as any;

    if (eventPayload.type === 'Invoice') {
      const amount = eventPayload.amount || 0;
      
      // High spend without pre-approval generates risk factors
      if (amount > 50000) {
        hypotheses.push({
          id: `risk_hyp_${Date.now()}`,
          type: 'RiskHypothesis',
          pluginId: this.id,
          rawConfidence: 90,
          confidence: 0,
          evidence: [`Invoice Amount: $${amount}`],
          reasoningPath: 'Amount > $50,000 threshold for un-POed invoices.',
          alternativeMatches: [],
          policiesApplied: [],
          graphTraversal: [],
          riskScore: 85,
          riskFactors: ['High Spend Anomaly']
        });
      }
    }

    return hypotheses;
  }
}
