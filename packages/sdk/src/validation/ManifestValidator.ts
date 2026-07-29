import { CapabilityManifest, ConnectorManifest } from '@chatr/kernel';
import { ValidationResult } from './ValidationResult';

export class ManifestValidator {
  public validateCapability(manifest: CapabilityManifest): ValidationResult {
    const result: ValidationResult = { valid: true, errors: [], warnings: [] };
    
    if (!manifest.name) {
      result.valid = false;
      result.errors.push({ code: 'MISSING_NAME', message: 'Capability must have a name' });
    }

    if (!manifest.actions || manifest.actions.length === 0) {
      result.warnings.push({ code: 'NO_ACTIONS', message: 'Capability has no actions defined' });
    }

    const actionIds = new Set();
    manifest.actions?.forEach(action => {
      if (actionIds.has(action.id)) {
        result.valid = false;
        result.errors.push({ code: 'DUPLICATE_ACTION', message: `Duplicate action ID: ${action.id}` });
      }
      actionIds.add(action.id);
    });

    return result;
  }

  public validateConnector(manifest: ConnectorManifest): ValidationResult {
    const result: ValidationResult = { valid: true, errors: [], warnings: [] };
    if (!manifest.name) {
      result.valid = false;
      result.errors.push({ code: 'MISSING_NAME', message: 'Connector must have a name' });
    }
    return result;
  }
}
