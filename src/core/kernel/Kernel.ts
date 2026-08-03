import { IKernel, KernelConfig } from '../contracts/kernel/IKernel';
import { IEventBus } from '../contracts/events/IEventBus';
import { IObservability } from '../contracts/common/Observability';
import { KernelError } from '../contracts/common/Errors';
import { EventBus } from './EventBus';

export class ChatrKernel implements IKernel {
  public readonly events: IEventBus;
  private services: Map<string, any> = new Map();
  private config?: KernelConfig;
  private observability?: IObservability;
  private isBooted = false;

  constructor(observability?: IObservability) {
    this.observability = observability;
    // Instantiate the Event Bus, providing observability if available
    this.events = new EventBus(this.observability);
    
    // Register the EventBus itself into the DI container
    this.register('IEventBus', this.events);
    // Register the Kernel itself
    this.register('IKernel', this);
  }

  public register<T>(token: string, instance: T): void {
    if (this.services.has(token)) {
      if (this.observability) {
        this.observability.logger.warn(`[Kernel] Overwriting registration for token: ${token}`);
      }
    }
    this.services.set(token, instance);
    
    if (this.observability) {
      this.observability.logger.debug(`[Kernel] Registered service: ${token}`);
    }
  }

  public resolve<T>(token: string): T {
    const service = this.services.get(token);
    if (!service) {
      throw new KernelError(`Service not found for token: ${token}`);
    }
    return service as T;
  }

  public async boot(config: KernelConfig): Promise<void> {
    if (this.isBooted) {
      throw new KernelError('Kernel is already booted.');
    }

    this.config = config;
    this.isBooted = true;

    if (this.observability) {
      this.observability.logger.info('[Kernel] Bootstrapping initialized', { environment: config.environment });
    }

    this.events.publish('kernel.booting', { config: this.config }, 'kernel');
    
    // Additional low-level kernel setup can happen here
    // Note: Starting the higher-level runtimes is the job of the BootstrapRuntime.
  }

  public getObservability(): IObservability {
    if (!this.observability) {
      throw new KernelError('Observability is not configured on this Kernel instance.');
    }
    return this.observability;
  }
}

// Global singleton instance for the browser/electron process
// In a true DI system this might not be exported directly, but for migration purposes
// it serves as the root.
export const kernel = new ChatrKernel();
