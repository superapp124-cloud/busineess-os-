import { BootstrapRuntime } from './BootstrapRuntime';
import { ObservationEngine } from './ObservationEngine';
import { EnterpriseEventBus as LegacyEventBus } from '../runtime/EnterpriseEventBus';

/**
 * Compatibility Adapter
 * The bridge that safely routes legacy UI events into the new strict CER Kernel.
 * Ensures the system remains "feature-compatible" during the Phase 1 & 2 migration.
 */
export class CompatibilityAdapter {
  private static instance: CompatibilityAdapter;

  private constructor() {}

  public static getInstance(): CompatibilityAdapter {
    if (!CompatibilityAdapter.instance) {
      CompatibilityAdapter.instance = new CompatibilityAdapter();
    }
    return CompatibilityAdapter.instance;
  }

  public async boot(): Promise<void> {
    console.log('[CompatibilityAdapter] Initializing Phase 1 Compatibility Layer...');
    
    // 1. Boot the new CER Kernel
    const kernel = BootstrapRuntime.getInstance();
    await kernel.boot();

    // 2. Bridge the legacy UI EventBus into the new Kernel Observation Engine
    const legacyBus = LegacyEventBus.getInstance();
    const observationEngine = ObservationEngine.getInstance();

    // Intercept legacy ArtifactUploaded events and pump them into the new Kernel
    legacyBus.subscribe('ArtifactUploaded', (event: any) => {
      console.log('[CompatibilityAdapter] Intercepted legacy ArtifactUploaded event, routing to CER Kernel Observation Engine.');
      observationEngine.observeRawInput('Legacy_React_UI', event.payload);
    });

    console.log('[CompatibilityAdapter] Legacy UI is now securely bridged to the CER Kernel.');
  }
}
