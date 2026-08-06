import { ExecutionContext } from '../types/ExecutionContext';
import { ExecutionResult } from '../types/ExecutionResult';
import { ProviderAdapter } from '../types/ProviderAdapter';

export class AIExecutor {
  public static async execute(
    ctx: ExecutionContext,
    provider: ProviderAdapter,
    input: any
  ): Promise<ExecutionResult> {
    console.log(`[AIExecutor] Dispatching execution to AI Provider: ${provider.name} (${provider.id})`);
    return await provider.execute(ctx, input);
  }
}
