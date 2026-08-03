import { IRuntime } from '../common/Lifecycle';
import { IEventBus } from '../events/IEventBus';
import { IObservability } from '../common/Observability';

/**
 * Defines the central CHATR Kernel that acts as the Dependency Injection container
 * and runtime orchestrator.
 */
export interface IKernel {
  /**
   * The central Event Bus for all cross-domain communication.
   */
  readonly events: IEventBus;

  /**
   * Registers a service or runtime with the Kernel.
   * @param token The interface identifier (e.g., 'IIdentityRuntime')
   * @param instance The concrete implementation
   */
  register<T>(token: string, instance: T): void;

  /**
   * Resolves a service or runtime from the Kernel.
   * @param token The interface identifier
   * @returns The resolved instance
   * @throws KernelError if the service is not found
   */
  resolve<T>(token: string): T;

  /**
   * Boots the Kernel, preparing the Event Bus and basic structures.
   * Does NOT start the runtimes (that is the job of BootstrapRuntime).
   */
  boot(config: KernelConfig): Promise<void>;

  /**
   * Returns the Kernel's observability tools (logger, metrics, tracer).
   */
  getObservability(): IObservability;
}

export interface KernelConfig {
  environment: 'development' | 'production' | 'test';
  logLevel: 'debug' | 'info' | 'warn' | 'error';
  [key: string]: any;
}
