import { CapabilityManifest, Publisher, Version } from '@chatr/kernel';

export const Fixtures = {
  createMockManifest(name: string): CapabilityManifest {
    const version: Version = { major: 1, minor: 0, patch: 0 };
    const publisher: Publisher = { id: 'test-pub', name: 'Test Publisher', verified: false };
    return {
      id: `cap-${name}`,
      name,
      version,
      minimumKernelVersion: version,
      publisher,
      status: 'EXPERIMENTAL',
      permissions: [],
      actions: [],
      dependencies: []
    };
  }
};
