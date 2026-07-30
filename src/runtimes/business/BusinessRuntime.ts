/**
 * CHATR Business OS Runtime
 * Specialized OS Runtime registered with RuntimeManager. Manages CRM, HR, Finance, and Project workflows.
 */

import { IOSRuntime } from '../../kernel/RuntimeManager';
import { CapabilityRegistry } from '../../kernel/registry/CapabilityRegistry';
import { ProviderRegistry } from '../../kernel/registry/ProviderRegistry';
import { CRMProviderPlugin } from '../../providers/business/CRMProviderPlugin';
import { HRProviderPlugin } from '../../providers/business/HRProviderPlugin';
import { FinanceProviderPlugin } from '../../providers/business/FinanceProviderPlugin';

export class BusinessRuntimeService implements IOSRuntime {
  public id = 'runtime-business';
  public name = 'CHATR Business OS Runtime';
  public isReady = false;

  public async initialize(): Promise<void> {
    console.log(`[BusinessRuntime] Initializing ${this.name}...`);

    const crmPlugin = new CRMProviderPlugin();
    const hrPlugin = new HRProviderPlugin();
    const financePlugin = new FinanceProviderPlugin();

    CapabilityRegistry.registerManifest(crmPlugin.manifest);
    CapabilityRegistry.registerManifest(hrPlugin.manifest);
    CapabilityRegistry.registerManifest(financePlugin.manifest);

    await ProviderRegistry.registerProvider(crmPlugin);
    await ProviderRegistry.registerProvider(hrPlugin);
    await ProviderRegistry.registerProvider(financePlugin);

    this.isReady = true;
    console.log(`[BusinessRuntime] ${this.name} initialized successfully with CRM, HR, and Finance providers.`);
  }

  public getStatus(): Record<string, unknown> {
    return {
      isReady: this.isReady,
      registeredProviders: ['provider-crm-business-ai', 'provider-hr-people-ai', 'provider-finance-ledger-ai'],
    };
  }

  public async shutdown(): Promise<void> {
    this.isReady = false;
    console.log(`[BusinessRuntime] ${this.name} shut down.`);
  }
}

export const BusinessRuntime = new BusinessRuntimeService();
