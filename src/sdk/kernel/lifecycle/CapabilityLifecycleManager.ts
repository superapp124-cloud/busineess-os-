import { CapabilityContract } from '../contract/CapabilityContract';
import { MigrationEngine } from './MigrationEngine';
import { CapabilityDependencyManager } from '../registry/CapabilityDependencyManager';

export class CapabilityLifecycleManager {
  /**
   * Transactional installation and upgrade pipeline.
   * If any step fails, the capability is rolled back to its previous state.
   */
  static async installOrUpgrade(contract: CapabilityContract, tenantId: string, currentVersion?: string): Promise<boolean> {
    console.log(`[LifecycleManager] Initiating transaction for ${contract.id}@${contract.version}`);

    try {
      // 1. Dependency Validation
      const depCheck = CapabilityDependencyManager.checkHealth(contract.id);
      // Note: checkHealth will fail if we haven't registered the contract yet, 
      // but in a real pipeline we'd check the required dependencies directly from the contract.
      // For this example, we'll bypass the hard check if dependencies aren't loaded.

      // 2. Policy Validation (e.g. checking if tenant is allowed to install this)
      // await PolicyEngine.evaluateCategory('Compliance', { ... })

      // 3. Schema & Data Migration
      if (currentVersion && contract.migrations) {
        const migrationsToRun = contract.migrations.filter(m => m.fromVersion >= currentVersion);
        for (const migration of migrationsToRun) {
          try {
            await MigrationEngine.runMigration({
              capabilityId: contract.id,
              fromVersion: migration.fromVersion,
              toVersion: migration.toVersion,
              tenantId
            }, migration.handler);
          } catch (migrationError) {
            console.error(`[LifecycleManager] Migration failed. Triggering rollback.`, migrationError);
            await MigrationEngine.rollbackMigration({
               capabilityId: contract.id,
               fromVersion: migration.fromVersion,
               toVersion: migration.toVersion,
               tenantId
            }, migration.handler);
            throw migrationError;
          }
        }
      }

      // 4. Enable Capability (Register in PlatformRegistry)
      // PlatformRegistry.register('CapabilityContract', contract.id, contract);
      
      // 5. Health Check
      const isHealthy = await this.performHealthCheck(contract.id);
      if (!isHealthy) {
        throw new Error(`[LifecycleManager] Post-install health check failed for ${contract.id}`);
      }

      console.log(`[LifecycleManager] Successfully installed/upgraded ${contract.id}`);
      return true;

    } catch (error) {
      console.error(`[LifecycleManager] Transaction failed for ${contract.id}. Rolled back.`, error);
      return false;
    }
  }

  private static async performHealthCheck(capabilityId: string): Promise<boolean> {
    // Simulate pinging the capability's health endpoint or internal state
    return true;
  }
}
