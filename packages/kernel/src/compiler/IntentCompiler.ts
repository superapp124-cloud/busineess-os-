import { IntentIR } from '../types/IntentIR';

export class IntentCompiler {
  public static compile(input: string, options?: { userId?: string; tenantId?: string }): IntentIR {
    const id = `intent_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const traceId = `trace_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const normalizedInput = input.trim();

    let intentType = 'GENERAL_QUERY';
    let goal = normalizedInput;
    let expectedOutcome = 'Answer user query';

    if (/find|search|hire|recruit|filter.*candidate|developer|engineer|java/i.test(normalizedInput)) {
      intentType = 'RECRUITMENT_CANDIDATE_SEARCH';
      goal = 'Locate, rank, and summarize qualified candidate profiles matching constraints';
      expectedOutcome = 'Ranked list of qualified candidates with matching scores and resume summaries';
    }

    return {
      id,
      version: '1.0',
      type: intentType,
      goal,
      constraints: {
        privacyLevel: 'ENTERPRISE_LAN',
        maxLatencyMs: 2000,
        maxBudgetCost: 0.05,
      },
      expectedOutcome,
      priority: 1,
      confidence: 0.95,
      payload: {
        rawInput: normalizedInput,
        skills: normalizedInput.match(/java|python|react|node|typescript|sql|aws/gi) || ['Java'],
      },
      metadata: {
        source: 'user_prompt',
        userId: options?.userId || 'usr_default',
        tenantId: options?.tenantId || 'tenant_default',
        timestamp: new Date().toISOString(),
        traceId,
      },
    };
  }
}
