import { IService } from '../Shared/Types';
import { Logger } from './Logger';

class ServiceRegistryService {
  private services: Map<string, IService> = new Map();
  private initialized: Set<string> = new Set();

  register(service: IService): void {
    if (!service) {
      Logger.warn('[ServiceRegistry] Attempted to register null/undefined service. Skipping.');
      return;
    }
    const name = service.name || (service.constructor && service.constructor.name);
    if (!name) {
      Logger.warn('[ServiceRegistry] Service has no valid name property. Skipping.');
      return;
    }
    if (this.services.has(name)) {
      Logger.warn(`Service ${name} is already registered. Overwriting.`);
    }
    this.services.set(name, service);
    Logger.debug(`[ServiceRegistry] Registered ${name}`);
  }

  async initializeAll(): Promise<void> {
    const uninitialized = new Set(this.services.keys());

    const initService = async (name: string): Promise<void> => {
      if (this.initialized.has(name)) return;
      
      const service = this.services.get(name);
      if (!service) {
        Logger.warn(`[ServiceRegistry] Service ${name} not registered. Skipping dependency.`);
        return;
      }

      // Initialize dependencies first
      if (Array.isArray(service.dependencies)) {
        for (const dep of service.dependencies) {
          if (dep && !this.initialized.has(dep) && this.services.has(dep)) {
            Logger.debug(`[ServiceRegistry] Initializing dependency ${dep} for ${name}`);
            await initService(dep);
          }
        }
      }

      Logger.info(`[ServiceRegistry] Initializing ${name}...`);
      try {
        await service.initialize();
      } catch (err) {
        Logger.error(`[ServiceRegistry] Failed to initialize service ${name}:`, err);
      }
      this.initialized.add(name);
      uninitialized.delete(name);
    };

    while (uninitialized.size > 0) {
      const next = uninitialized.values().next().value;
      if (next) {
        await initService(next);
      } else {
        break;
      }
    }
    
    Logger.info(`[ServiceRegistry] Platform services initialization process completed.`);
  }

  get<T = any>(name: string): T {
    const service = this.services.get(name);
    if (!service) {
      throw new Error(`Service ${name} not found. Ensure it is registered.`);
    }
    return service as unknown as T;
  }

  getOptional<T = any>(name: string): T | undefined {
    const service = this.services.get(name);
    if (!service) {
      return undefined;
    }
    return service as unknown as T;
  }
}

export const ServiceRegistry = new ServiceRegistryService();
