import { Capability } from '../../kernel/src/types/CapabilityManifest';
import { ProviderAdapter } from '../../kernel/src/types/ProviderAdapter';
import { ExecutionContext } from '../../kernel/src/types/ExecutionContext';

export class ConformanceTestSuite {
  public static verifyCapability(capability: Capability): { passed: boolean; errors: string[] } {
    const errors: string[] = [];
    if (!capability.manifest) errors.push('Capability missing manifest');
    if (!capability.manifest?.id) errors.push('Capability manifest missing id');
    if (!capability.manifest?.inputSchema) errors.push('Capability manifest missing inputSchema');
    if (!capability.manifest?.outputSchema) errors.push('Capability manifest missing outputSchema');
    if (typeof capability.execute !== 'function') errors.push('Capability missing execute() function');

    return { passed: errors.length === 0, errors };
  }

  public static verifyProviderAdapter(provider: ProviderAdapter): { passed: boolean; errors: string[] } {
    const errors: string[] = [];
    if (!provider.id) errors.push('ProviderAdapter missing id');
    if (!provider.name) errors.push('ProviderAdapter missing name');
    if (typeof provider.execute !== 'function') errors.push('ProviderAdapter missing execute() function');
    if (typeof provider.health !== 'function') errors.push('ProviderAdapter missing health() function');
    if (typeof provider.cost !== 'function') errors.push('ProviderAdapter missing cost() function');

    return { passed: errors.length === 0, errors };
  }

  public static verifyExecutionContextImmutability(ctx: ExecutionContext): boolean {
    try {
      (ctx as any).user = { id: 'mutated' };
      return false;
    } catch {
      return true; // Frozen / immutable object
    }
  }
}
