import { ICapabilityManifest } from '../types';

export class CapabilityRegistry {
  private static manifests = new Map<string, ICapabilityManifest>();
  private static listeners: ((manifests: ICapabilityManifest[]) => void)[] = [];

  static register(manifest: ICapabilityManifest): void {
    if (this.manifests.has(manifest.id)) {
      console.warn(`Capability ${manifest.id} is already registered. Overwriting.`);
    }
    this.manifests.set(manifest.id, manifest);
    this.notifyListeners();
  }

  static unregister(id: string): void {
    this.manifests.delete(id);
    this.notifyListeners();
  }

  static getManifest(id: string): ICapabilityManifest | undefined {
    return this.manifests.get(id);
  }

  static getAllManifests(): ICapabilityManifest[] {
    return Array.from(this.manifests.values());
  }

  static subscribe(listener: (manifests: ICapabilityManifest[]) => void): () => void {
    this.listeners.push(listener);
    // Immediately fire with current state
    listener(this.getAllManifests());
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  private static notifyListeners() {
    const all = this.getAllManifests();
    this.listeners.forEach(l => l(all));
  }
}
