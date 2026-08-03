import { IRuntime, RuntimeHealth } from '../contracts/common/Lifecycle';
import { IKernel } from '../contracts/kernel/IKernel';
import { RuntimeError } from '../contracts/common/Errors';

export interface BootstrapConfig {
  runtimes: IRuntime[];
}

/**
 * The Bootstrap Runtime is responsible for orchestrating the startup of the application.
 * It keeps the Kernel pure by handling all registration, session restoration,
 * and dependency validation.
 */
export class BootstrapRuntime implements IRuntime {
  private kernel: IKernel;
  private config: BootstrapConfig;
  private isStarted = false;

  constructor(kernel: IKernel, config: BootstrapConfig) {
    this.kernel = kernel;
    this.config = config;
    
    // Register itself with the Kernel
    this.kernel.register('IBootstrapRuntime', this);
  }

  public async initialize(): Promise<void> {
    this.kernel.events.publish('bootstrap.initialization.started', {}, 'bootstrap');
    
    // Initialize all registered runtimes in sequence
    for (const runtime of this.config.runtimes) {
      try {
        await runtime.initialize();
      } catch (err: any) {
        throw new RuntimeError(`Failed to initialize runtime: ${err.message}`, 'BOOTSTRAP_INIT_ERROR');
      }
    }
    
    this.kernel.events.publish('bootstrap.initialization.completed', {}, 'bootstrap');
  }

  public async start(): Promise<void> {
    if (this.isStarted) return;
    this.isStarted = true;

    this.kernel.events.publish('bootstrap.start.started', {}, 'bootstrap');

    // Start all registered runtimes
    for (const runtime of this.config.runtimes) {
      try {
        await runtime.start();
      } catch (err: any) {
        throw new RuntimeError(`Failed to start runtime: ${err.message}`, 'BOOTSTRAP_START_ERROR');
      }
    }

    // Publish the final kernel.ready event signifying the application is fully operational
    this.kernel.events.publish('kernel.ready', { timestamp: Date.now() }, 'bootstrap');
  }

  public async stop(): Promise<void> {
    if (!this.isStarted) return;
    this.isStarted = false;

    // Stop all runtimes (usually in reverse order)
    const reversedRuntimes = [...this.config.runtimes].reverse();
    for (const runtime of reversedRuntimes) {
      try {
        await runtime.stop();
      } catch (err) {
        console.error(`[Bootstrap] Error stopping runtime:`, err);
      }
    }
  }

  public async dispose(): Promise<void> {
    const reversedRuntimes = [...this.config.runtimes].reverse();
    for (const runtime of reversedRuntimes) {
      try {
        await runtime.dispose();
      } catch (err) {
        console.error(`[Bootstrap] Error disposing runtime:`, err);
      }
    }
  }

  public async health(): Promise<RuntimeHealth> {
    return {
      status: 'healthy',
      lastChecked: Date.now()
    };
  }

  public version(): string {
    return '1.0.0';
  }
}
