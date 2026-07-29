import { ICapabilityManifest } from '../../types';

type RegistryType = 'Capability' | 'AIModel' | 'Connector' | 'Policy' | 'BusinessObject' | 'WorkflowTemplate';

export class PlatformRegistry {
  // We use maps for constant time lookup
  private static registries: Record<RegistryType, Map<string, any>> = {
    Capability: new Map<string, ICapabilityManifest>(),
    AIModel: new Map<string, any>(),
    Connector: new Map<string, any>(),
    Policy: new Map<string, any>(),
    BusinessObject: new Map<string, any>(),
    WorkflowTemplate: new Map<string, any>(),
  };

  /**
   * Registers a platform entity.
   */
  static register<T>(type: RegistryType, id: string, entity: T): void {
    if (this.registries[type].has(id)) {
      console.warn(`[PlatformRegistry] ${type} '${id}' is already registered. Overwriting.`);
    }
    this.registries[type].set(id, entity);
    console.log(`[PlatformRegistry] Registered ${type}: ${id}`);
  }

  /**
   * Retrieves a platform entity.
   */
  static get<T>(type: RegistryType, id: string): T | undefined {
    return this.registries[type].get(id) as T | undefined;
  }

  /**
   * Retrieves all entities of a specific type.
   */
  static getAll<T>(type: RegistryType): T[] {
    return Array.from(this.registries[type].values());
  }

  /**
   * Clears the registry (useful for testing or full reloads).
   */
  static clear(type?: RegistryType): void {
    if (type) {
      this.registries[type].clear();
    } else {
      Object.values(this.registries).forEach(registry => registry.clear());
    }
  }
}
