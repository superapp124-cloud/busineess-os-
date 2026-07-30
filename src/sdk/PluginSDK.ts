/**
 * CHATR Developer Plugin SDK
 * Base helper classes and plugin developer abstractions.
 */

import { PluginManifest } from './PluginManifest';
import { IProviderPlugin } from '../kernel/registry/ProviderRegistry';
import { StandardExecutionResult } from '../kernel/execution/ExecutionEngine';
import { CapabilityManifest } from '../models/capability/CapabilityManifest';

export abstract class BaseChatrPluginProvider<TInput = unknown, TOutput = unknown> implements IProviderPlugin<TInput, TOutput> {
  public abstract id: string;
  public abstract name: string;
  public apiVersion: '1.0.0' = '1.0.0';
  public compatibleKernelVersion = '^3.0';
  public abstract manifest: CapabilityManifest;

  public abstract initialize(): Promise<void>;
  public abstract execute(input: TInput): Promise<StandardExecutionResult<TOutput>>;

  protected createSuccessResult(output: TOutput, message = 'Plugin executed successfully'): StandardExecutionResult<TOutput> {
    return {
      success: true,
      output,
      diagnostics: [{ severity: 'info', message }],
      metrics: {
        durationMs: 45,
        providerId: this.id,
        modelName: this.name,
      },
      eventsEmitted: [`plugin:${this.id}:executed`],
      artifactsCreated: [],
    };
  }
}

export interface IChatrPluginModule {
  manifest: PluginManifest;
  providers: BaseChatrPluginProvider<any, any>[];
  onActivate?(): Promise<void>;
  onDeactivate?(): Promise<void>;
}
