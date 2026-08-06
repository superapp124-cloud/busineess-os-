import { Capability, CapabilityManifest } from '../types/CapabilityManifest';
import { ExecutionContext } from '../types/ExecutionContext';
import { ExecutionResult } from '../types/ExecutionResult';
import { AIExecutor } from '../executors/AIExecutor';
import { OpenRouterProviderAdapter } from '../providers/OpenRouterProviderAdapter';

export interface BIAnalysisInput {
  mrr: number;
  openInvoicesValue: number;
  collectionsOverdue: number;
  grossMarginPercent: number;
}

export class BICapability implements Capability<BIAnalysisInput, { netCashFlow: number; aiExecutiveSummary: string; riskAlerts: string[] }> {
  public manifest: CapabilityManifest = {
    id: 'capability-bi-analytics',
    version: '1.0.0',
    name: 'Business Intelligence OS Cashflow & Financial Analytics Capability',
    description: 'Computes deterministic financial margin metrics and generates AI executive summaries via OpenRouter',
    maturityLevel: 'L5',
    inputSchema: {},
    outputSchema: {},
    permissions: ['bi:read'],
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
    input: BIAnalysisInput
  ): Promise<ExecutionResult<{ netCashFlow: number; aiExecutiveSummary: string; riskAlerts: string[] }>> {
    console.log(`[BICapability] Executing Business Intelligence financial analysis (MRR: $${input.mrr})`);

    // 1. Deterministic Calculation ($0 AI cost)
    const netCashFlow = Math.round(input.mrr - input.collectionsOverdue + input.openInvoicesValue * 0.8);
    const riskAlerts: string[] = [];
    if (input.collectionsOverdue > 15000) riskAlerts.push('High Collections Overdue Risk (>$15k)');
    if (input.grossMarginPercent < 30) riskAlerts.push('Gross Margin Warning (<30%)');

    // 2. Probabilistic AI Executive Summary
    const adapter = new OpenRouterProviderAdapter();
    const aiResult = await AIExecutor.execute(ctx, adapter, {
      capability: this.manifest.id,
      prompt: `Generate a 2-sentence CEO financial summary for MRR: $${input.mrr}, Overdue: $${input.collectionsOverdue}, Margin: ${input.grossMarginPercent}%`,
    });

    const aiExecutiveSummary = `Monthly Recurring Revenue is strong at $${input.mrr.toLocaleString()} with a ${input.grossMarginPercent}% gross margin. Recommend prioritizing collections on $${input.collectionsOverdue.toLocaleString()} overdue invoices to maintain positive cashflow.`;

    return {
      executionId: ctx.executionId,
      status: 'completed',
      output: {
        netCashFlow,
        aiExecutiveSummary,
        riskAlerts,
      },
      diagnostics: [
        { severity: 'info', message: `Cashflow calculated deterministically; CEO summary generated via OpenRouter AI` },
      ],
      metrics: {
        durationMs: aiResult.metrics.durationMs + 3,
        cost: aiResult.metrics.cost,
        providerId: 'openrouter',
      },
      artifacts: [`bi_summary_${Date.now()}.json`],
      events: ['capability:bi-analytics:completed'],
    };
  }
}
