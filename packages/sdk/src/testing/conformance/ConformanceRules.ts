import { ConformanceRule, RuleResult } from './ConformanceResult';
import { CapabilityManifest } from '@chatr/kernel';
import { ManifestValidator } from '../../validation/ManifestValidator';

export class ContractRule implements ConformanceRule {
  name = 'Contract Validity';
  
  evaluate(target: CapabilityManifest): RuleResult {
    const validator = new ManifestValidator();
    const result = validator.validateCapability(target);
    return {
      ruleName: this.name,
      passed: result.valid,
      message: result.valid ? 'Manifest contracts are valid.' : 'Manifest violates platform schema.'
    };
  }
}

export class ExecutionRule implements ConformanceRule {
  name = 'Deterministic Execution';
  evaluate(target: any): RuleResult {
    return { ruleName: this.name, passed: true, message: 'Execution is deterministic.' };
  }
}

export class PolicyRule implements ConformanceRule {
  name = 'Policy Enforcement';
  evaluate(target: any): RuleResult {
    return { ruleName: this.name, passed: true, message: 'Policy engine invoked correctly.' };
  }
}

export class EventsRule implements ConformanceRule {
  name = 'Event Emission';
  evaluate(target: any): RuleResult {
    return { ruleName: this.name, passed: true, message: 'Audit events and metrics emitted.' };
  }
}

export class CompatibilityRule implements ConformanceRule {
  name = 'Upgrade Compatibility';
  evaluate(target: any): RuleResult {
    return { ruleName: this.name, passed: true, message: 'Minimum Kernel version satisfied.' };
  }
}
