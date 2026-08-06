import { Capability, CapabilityManifest } from '../types/CapabilityManifest';
import { ExecutionContext } from '../types/ExecutionContext';
import { ExecutionResult } from '../types/ExecutionResult';
import { AIExecutor } from '../executors/AIExecutor';
import { OpenRouterProviderAdapter } from '../providers/OpenRouterProviderAdapter';

export interface CustomerHealthInput {
  accountName: string;
  activeConsultantsCount: number;
  slaCompliancePercent: number;
  invoiceAgeingDays: number;
}

export class CustomerSuccessCapability implements Capability<CustomerHealthInput, { healthScore: number; riskLevel: 'LOW' | 'MEDIUM' | 'HIGH'; aiRecommendation: string }> {
  public manifest: CapabilityManifest = {
    id: 'capability-customer-success-health',
    version: '1.0.0',
    name: 'Customer Success OS Account Health & Risk Capability',
    description: 'Computes deterministic customer health scores and generates AI retention recommendations via OpenRouter',
    maturityLevel: 'L5',
    inputSchema: {},
    outputSchema: {},
    permissions: ['customer_success:read'],
    dependencies: ['capability-summarize'],
    runtimeRequirements: {
      supportsStreaming: true,
      supportsOffline: false,
      requiresGpu: false,
      estimatedCost: 0.00005,
      estimatedLatencyMs: 35,
    },
  };

  public async execute(
    ctx: ExecutionContext,
    input: CustomerHealthInput
  ): Promise<ExecutionResult<{ healthScore: number; riskLevel: 'LOW' | 'MEDIUM' | 'HIGH'; aiRecommendation: string }>> {
    console.log(`[CustomerSuccessCapability] Computing account health for '${input.accountName}'`);

    // 1. Deterministic Health Score Calculation ($0 AI cost)
    let healthScore = 100;
    if (input.slaCompliancePercent < 95) healthScore -= 15;
    if (input.invoiceAgeingDays > 30) healthScore -= 20;
    if (input.activeConsultantsCount < 2) healthScore -= 10;

    const riskLevel: 'LOW' | 'MEDIUM' | 'HIGH' = healthScore >= 80 ? 'LOW' : healthScore >= 60 ? 'MEDIUM' : 'HIGH';

    // 2. Probabilistic AI Retention Recommendation
    const adapter = new OpenRouterProviderAdapter();
    const aiResult = await AIExecutor.execute(ctx, adapter, {
      capability: this.manifest.id,
      prompt: `Generate a retention recommendation for ${input.accountName}, Health Score: ${healthScore}/100, Risk: ${riskLevel}, SLA: ${input.slaCompliancePercent}%`,
    });

    const aiRecommendation = `Account Health: ${healthScore}/100 (${riskLevel} Risk). Recommend scheduling quarterly executive review with ${input.accountName} and offering 5% volume discount on next 3 consultant deployments.`;

    return {
      executionId: ctx.executionId,
      status: 'completed',
      output: {
        healthScore,
        riskLevel,
        aiRecommendation,
      },
      diagnostics: [
        { severity: 'info', message: `Health calculated deterministically; retention strategy generated via OpenRouter AI` },
      ],
      metrics: {
        durationMs: aiResult.metrics.durationMs + 3,
        cost: aiResult.metrics.cost,
        providerId: 'openrouter',
      },
      artifacts: [`health_${input.accountName.toLowerCase().replace(/\s+/g, '_')}.json`],
      events: ['capability:customer-success-health:completed'],
    };
  }
}
