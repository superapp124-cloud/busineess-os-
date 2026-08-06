export interface SystemService {
  id: string;
  version: string;
  health(): Promise<{ healthy: boolean }>;
}

export interface StorageService extends SystemService {
  get<T = unknown>(key: string): Promise<T | null>;
  set<T = unknown>(key: string, value: T): Promise<void>;
  query<T = unknown>(table: string, filter?: Record<string, unknown>): Promise<T[]>;
}

export class ServiceFabric {
  private static services: Map<string, SystemService> = new Map();

  public static register(service: SystemService): void {
    this.services.set(service.id, service);
    console.log(`[ServiceFabric] Registered OS System Service: ${service.id} (v${service.version})`);
  }

  public static resolve<T extends SystemService>(serviceId: string): T {
    const service = this.services.get(serviceId);
    if (!service) {
      throw new Error(`[ServiceFabric] System Service '${serviceId}' not registered`);
    }
    return service as T;
  }

  public static has(serviceId: string): boolean {
    return this.services.has(serviceId);
  }
}
