import { IntentResolver } from './IntentResolver';
import { CapabilityRegistry } from './CapabilityRegistry';
import { PolicyEngine } from './PolicyEngine';
import { PermissionEngine } from './PermissionEngine';
import { SandboxManager } from './SandboxManager';
import { EventBus } from './EventBus';
import { ExecutionContext } from './ExecutionContext';
import { Observability } from '@/runtime/Observability';
import { Logger } from '@/runtime/Logger';
import { ExecutionIntegrityGate } from './gates/ExecutionIntegrityGate';
import { ExecutionEngine } from './execution/ExecutionEngine';

export class ExecutionKernel {
  /**
   * The Strict Runtime Pipeline with Execution Integrity Gate.
   * Every capability passes through this kernel exactly once.
   */
  static async execute(input: string | any, context: ExecutionContext): Promise<any> {
    const trace = Observability.startTrace('kernel.execute', context);
    const executionId = `exec_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`;
    
    try {
      // 1. Resolve Intent
      const intent = await IntentResolver.resolve(input, context);
      Logger.debug(`Intent resolved: ${intent.action}`, context);

      const requestedProvider = input.preferredProvider || 'default';
      
      // 2. Evaluate Policy (Under what conditions is this allowed?)
      const policyDecision = await PolicyEngine.evaluateCapabilityPolicy(
        context.tenant.organizationId,
        intent.capabilityType,
        requestedProvider
      );

      if (!policyDecision.allowed) {
        Logger.audit('Policy Denied', context, { intent, reason: policyDecision.reason });
        EventBus.publish('Kernel.PolicyDenied', { intent, reason: policyDecision.reason }, context);
        throw new Error(`Policy Denied: ${policyDecision.reason}`);
      }

      // 3. Permission Engine (Who is allowed to do this?)
      const isAuthorized = await PermissionEngine.authorize(intent, context);
      if (!isAuthorized) {
        throw new Error(`Permission Denied: User is not authorized to execute ${intent.action}`);
      }

      // 4. Enforce 8 Pre-Execution Integrity Gates (Hard Kernel Invariant)
      const gateResult = ExecutionIntegrityGate.enforcePreExecution({
        executionId,
        tenantId: context.tenant.organizationId,
        intentType: intent.action || intent.capabilityType,
        capabilityName: intent.capabilityType,
        entityId: input.entityId || 'generic_entity',
        operationId: input.operationId || `op_${intent.capabilityType}_${Date.now()}`,
        isConsequentialAction: ['CRM_Action', 'Calendar_Action', 'Email_Action'].includes(intent.capabilityType),
        isHumanApproved: input.isApproved === true,
        evidencePackage: input.evidencePackage,
        privacySensitivity: input.privacySensitivity
      });

      const modelDecision = gateResult.modelDecision;

      // 5. Capability Resolver
      const providerId = policyDecision.providerToUse || requestedProvider;
      const capability = CapabilityRegistry.getProvider(intent.capabilityType, providerId) 
        || CapabilityRegistry.getProviders(intent.capabilityType)[0];

      if (!capability && !providerId.startsWith('plugin_')) {
        throw new Error(`No provider registered for capability: ${intent.capabilityType}`);
      }

      // 6. Post-Dispatch Execution Lifecycle (ExecutionEngine & Persistent Idempotency check)
      EventBus.publish('Kernel.ExecutionStarted', { intent, providerId, executionId, modelDecision, gateResult }, context);
      
      let result;
      if (providerId.startsWith('plugin_')) {
        // Run safely in isolated environment
        result = await SandboxManager.executeInSandbox(providerId, intent, context);
      } else {
        // Run natively through ExecutionEngine with persistent idempotency protection
        const engineResult = await ExecutionEngine.executeTask({
          taskId: executionId,
          query: { capabilityType: intent.capabilityType, providerId },
          input: intent.payload,
          tenantId: context.tenant.organizationId,
          entityId: input.entityId || 'generic_entity',
          operationId: input.operationId || `op_${intent.capabilityType}_${Date.now()}`
        });

        result = engineResult.output || engineResult;
      }
      
      // 7. Event Store & Operating Memory Projections Update
      EventBus.publish('Kernel.ExecutionCompleted', { intent, providerId, executionId, result }, context);
      Logger.info(`Execution completed for ${intent.action} (${executionId})`, context);
      
      return {
        executionId,
        gateResult,
        result,
        modelDecision
      };

    } catch (error: any) {
      Logger.error(`Execution failed`, error, context);
      EventBus.publish('Kernel.ExecutionFailed', { input, error: error.message }, context);
      throw error;
    } finally {
      trace.end();
    }
  }
}
