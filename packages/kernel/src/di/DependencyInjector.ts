export type ServiceIdentifier<T = any> = string | symbol | (new (...args: any[]) => T);

export enum ServiceScope {
  SINGLETON,
  TRANSIENT,
}

export interface ServiceDescriptor<T = any> {
  scope: ServiceScope;
  factory: (container: DependencyInjector) => T;
  instance?: T;
}

/**
 * Minimal IoC container for the CHATR Runtime Kernel.
 */
export class DependencyInjector {
  private services = new Map<ServiceIdentifier, ServiceDescriptor>();

  public register<T>(
    id: ServiceIdentifier<T>,
    factory: (container: DependencyInjector) => T,
    scope: ServiceScope = ServiceScope.SINGLETON
  ): void {
    if (this.services.has(id)) {
      throw new Error(`Service already registered for identifier: ${String(id)}`);
    }
    this.services.set(id, { scope, factory });
  }

  public registerInstance<T>(id: ServiceIdentifier<T>, instance: T): void {
    if (this.services.has(id)) {
      throw new Error(`Service already registered for identifier: ${String(id)}`);
    }
    this.services.set(id, {
      scope: ServiceScope.SINGLETON,
      factory: () => instance,
      instance,
    });
  }

  public resolve<T>(id: ServiceIdentifier<T>): T {
    const descriptor = this.services.get(id);
    if (!descriptor) {
      throw new Error(`Service not registered for identifier: ${String(id)}`);
    }

    if (descriptor.scope === ServiceScope.SINGLETON) {
      if (!descriptor.instance) {
        descriptor.instance = descriptor.factory(this);
      }
      return descriptor.instance as T;
    }

    // Transient: create a new instance every time
    return descriptor.factory(this) as T;
  }
}
