import { SystemService } from './ServiceFabric';
import { ExecutionContext } from '../types/ExecutionContext';

export interface SecretsService extends SystemService {
  resolveApiKey(ctx: ExecutionContext, providerId: string): Promise<string | null>;
}

export class DefaultSecretsServiceAdapter implements SecretsService {
  public readonly id = 'secrets';
  public readonly version = '1.0.0';

  public async resolveApiKey(ctx: ExecutionContext, providerId: string): Promise<string | null> {
    console.log(`[SecretsService] Resolving API Key for provider '${providerId}' [Tenant: ${ctx.tenantId}, User: ${ctx.user.id}]`);
    
    // Key Resolution Order: Workspace Key -> User BYOK Key -> Platform Key
    const workspaceKey = (ctx.workspace as any)?.keys?.[providerId];
    if (workspaceKey) {
      console.log(`[SecretsService] Resolved key from Workspace Key Store`);
      return workspaceKey;
    }

    const userKey = (ctx.user as any)?.keys?.[providerId];
    if (userKey) {
      console.log(`[SecretsService] Resolved key from User BYOK Key Store`);
      return userKey;
    }

    console.log(`[SecretsService] Falling back to Secure Edge Proxy Platform Key`);
    return 'USE_SECURE_EDGE_PROXY';
  }

  public async health(): Promise<{ healthy: boolean }> {
    return { healthy: true };
  }
}
