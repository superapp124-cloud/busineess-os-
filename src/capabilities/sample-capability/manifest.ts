import { ICapabilityManifest } from '../../sdk/kernel/types';

export const SampleManifest: ICapabilityManifest = {
  id: 'com.thirdparty.sample',
  name: 'SampleOS',
  displayName: 'Sample Capability for Developers',
  category: 'Productivity',
  description: 'A reference implementation demonstrating how to build a third-party capability on the CHATR Intent OS.',
  version: '1.0.0',
  schemaVersion: 'v2',
  minimumKernelVersion: '2.0.0',
  
  dependencies: {
    connectors: ['com.chatr.connectors.google'],
    permissions: [
      { resource: 'EventMesh', action: 'publish', scope: 'global' },
      { resource: 'ActivityCentre', action: 'create_approval', scope: 'global' }
    ],
    kernelServices: ['ExecutionEngine', 'KnowledgeGraph', 'PolicyEngine'],
    // Platform Dependency Manager uses this to determine install order
    capabilities: ['com.chatr.legalos'] 
  },
  
  routes: [
    {
      path: '/sample',
      component: 'SampleDashboard'
    }
  ]
};
