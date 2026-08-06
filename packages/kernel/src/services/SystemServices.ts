import { ServiceFabric, StorageService, SystemService } from './ServiceFabric';

export class SystemServices {
  public static register(service: SystemService): void {
    ServiceFabric.register(service);
  }

  public static resolve<T extends SystemService>(serviceId: string): T {
    return ServiceFabric.resolve<T>(serviceId);
  }

  public static has(serviceId: string): boolean {
    return ServiceFabric.has(serviceId);
  }

  public static get storage(): StorageService {
    return ServiceFabric.resolve<StorageService>('storage');
  }
}
