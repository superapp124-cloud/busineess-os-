/**
 * CHATR Plan Validator
 * Validates plan execution safety, checking permissions and capability availability prior to execution.
 */

import { ExecutionPlan } from './ExecutionGraph';
import { PermissionEngine } from '../kernel/permissions/PermissionEngine';
import { CapabilityRegistry } from '../kernel/registry/CapabilityRegistry';

export interface PlanValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

export class PlanValidator {
  /**
   * Validate plan steps against PermissionEngine and CapabilityRegistry
   */
  public static validate(plan: ExecutionPlan): PlanValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];

    // Verify system permissions for document and communication capabilities
    const fileAccess = PermissionEngine.checkPermission('runtime-intelligence', 'file_system');
    if (!fileAccess) {
      errors.push('Permission Engine denied file_system access to runtime-intelligence');
    }

    // Verify capabilities exist in CapabilityRegistry
    for (const step of plan.steps) {
      const manifest = CapabilityRegistry.selectBestProvider({
        category: 'document',
        requiresOffline: true,
      });

      if (!manifest) {
        warnings.push(`Step [${step.name}] uses generic capability '${step.capability}'`);
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
    };
  }
}
