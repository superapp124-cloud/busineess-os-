export interface ModelDecision {
  decisionId: string;
  policyVersion: string;
  provider: 'ollama' | 'openai' | 'anthropic' | 'google';
  model: string;
  runtime: 'local' | 'cloud' | 'hybrid';
  reason: string;
  privacySensitivity: 'HIGH' | 'NORMAL' | 'PUBLIC';
  estimatedCostUSD: number;
  latencyClass: 'REALTIME' | 'BATCH' | 'BACKGROUND';
  fallbackAllowed: boolean;
  dataEgressAllowed: boolean;
  timestamp: string;
}

export interface ModelRoutingContext {
  intentType: string;
  privacySensitivity?: 'HIGH' | 'NORMAL' | 'PUBLIC';
  estimatedTokens?: number;
  latencyBudgetMs?: number;
  requiresOffline?: boolean;
}

/**
 * CHATR OS Model Router & Policy Decision Engine
 * 
 * Routes LLM requests between Local Ollama models and Cloud LLM providers
 * based on privacy sensitivity, latency requirements, cost, and offline policy.
 */
export class ModelRouter {
  private static POLICY_VERSION = 'v3.2.0';

  /**
   * Evaluates prompt context and determines the optimal ModelDecision.
   */
  public static route(context: ModelRoutingContext): ModelDecision {
    const sensitivity = context.privacySensitivity || 'NORMAL';
    const isOffline = context.requiresOffline || !navigator.onLine;
    const decisionId = `dec_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`;
    const timestamp = new Date().toISOString();

    // Profile 1: HIGH PRIVACY or explicit Offline Requirement -> Ollama Local Only
    if (sensitivity === 'HIGH' || isOffline) {
      return {
        decisionId,
        policyVersion: this.POLICY_VERSION,
        provider: 'ollama',
        model: 'llama3:8b-instruct',
        runtime: 'local',
        reason: isOffline 
          ? 'Network offline mode active. Executing on local Ollama runtime.'
          : 'High privacy policy enforced. External data egress prohibited.',
        privacySensitivity: sensitivity,
        estimatedCostUSD: 0.00,
        latencyClass: 'REALTIME',
        fallbackAllowed: false,
        dataEgressAllowed: false,
        timestamp
      };
    }

    // Profile 2: Complex Reasoning / Multi-step Synthesis -> Cloud LLM
    if (context.intentType.includes('strategy') || context.intentType.includes('synthesis')) {
      return {
        decisionId,
        policyVersion: this.POLICY_VERSION,
        provider: 'google',
        model: 'gemini-2.5-flash',
        runtime: 'cloud',
        reason: 'Complex multi-step reasoning requested. Routed to high-capacity cloud model.',
        privacySensitivity: sensitivity,
        estimatedCostUSD: 0.0005,
        latencyClass: 'BATCH',
        fallbackAllowed: true,
        dataEgressAllowed: true,
        timestamp
      };
    }

    // Profile 3: NORMAL / Default -> Hybrid Pipeline (Local extraction + Cloud fallback)
    return {
      decisionId,
      policyVersion: this.POLICY_VERSION,
      provider: 'ollama',
      model: 'llama3:8b-instruct',
      runtime: 'hybrid',
      reason: 'Standard execution. Local Ollama extraction preferred with cloud LLM fallback.',
      privacySensitivity: sensitivity,
      estimatedCostUSD: 0.0001,
      latencyClass: 'REALTIME',
      fallbackAllowed: true,
      dataEgressAllowed: true,
      timestamp
    };
  }
}

