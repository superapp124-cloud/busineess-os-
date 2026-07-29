import { CapabilityRegistry } from './CapabilityRegistry';
import { GrowthOSManifest } from '../../capabilities/growth/manifest';
import { LegalOSManifest } from '../../capabilities/legal/manifest';

export function initializeKernelV2() {
  // Register flagship v2 capabilities
  CapabilityRegistry.register(GrowthOSManifest);
  CapabilityRegistry.register(LegalOSManifest);

  console.log('[Kernel v2] Bootstrapped with Capabilities:', CapabilityRegistry.getAllManifests().map(m => m.id));
}
