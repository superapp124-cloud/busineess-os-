// src/core/runtime/boot.ts
import { kernel } from '../kernel/Kernel';
import { BootstrapRuntime } from './BootstrapRuntime';
import { SecurityRuntime } from '../security/SecurityRuntime';
import { IdentityRuntime } from '../identity/IdentityRuntime';
import { ConnectorRuntime } from '../connector/ConnectorRuntime';
import { GoogleConnector } from '../connector/providers/GoogleConnector';
import { LinkedInConnector } from '../connector/providers/LinkedInConnector';
import { IConnectorRuntime } from '../contracts/connector/IConnectorRuntime';

export const bootKernel = async () => {
  console.log('[Boot] Initializing CHATR Kernel...');
  
  // 1. Boot the Kernel
  await kernel.boot({
    environment: 'development',
    logLevel: 'debug'
  });

  // 2. Instantiate Runtimes
  const security = new SecurityRuntime();
  const identity = new IdentityRuntime(kernel.events);
  const connector = new ConnectorRuntime(kernel.events);

  // Register Connectors
  connector.registerConnector(new GoogleConnector());
  connector.registerConnector(new LinkedInConnector());

  // 3. Setup Bootstrap Runtime with dependencies
  const bootstrap = new BootstrapRuntime(kernel, {
    runtimes: [security, identity, connector]
  });

  // 4. Register interfaces with Kernel
  kernel.register('ISecurityRuntime', security);
  kernel.register('IIdentityRuntime', identity);
  kernel.register('IConnectorRuntime', connector);

  // 5. Initialize and Start
  await bootstrap.initialize();
  await bootstrap.start();
  
  console.log('[Boot] Kernel successfully started and runtimes are active.');
};
