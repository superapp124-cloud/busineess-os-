import { CapabilityRegistry } from './CapabilityRegistry';

export interface ISearchResult {
  id: string;
  capabilityId: string;
  objectType: string;
  title: string;
  subtitle?: string;
  url: string;
  icon?: string;
  relevanceScore: number;
}

export class UniversalSearch {
  static async query(searchTerm: string): Promise<ISearchResult[]> {
    if (!searchTerm || searchTerm.length < 2) return [];
    
    const results: ISearchResult[] = [];
    const term = searchTerm.toLowerCase();
    const manifests = CapabilityRegistry.getAllManifests();

    // Note: In a real system, this would fan out and query each capability's SearchProvider
    // For now, we simulate matching the configuration object names
    for (const manifest of manifests) {
      if (manifest.search && manifest.search.objects) {
        for (const objConfig of manifest.search.objects) {
          if (objConfig.object.toLowerCase().includes(term)) {
            results.push({
              id: `${manifest.id}_${objConfig.object}`,
              capabilityId: manifest.id,
              objectType: objConfig.object,
              title: `Search in ${manifest.displayName || manifest.name} ${objConfig.object}`,
              url: `/desktop/${manifest.id}?view=${objConfig.object}`,
              icon: objConfig.icon || manifest.icon,
              relevanceScore: 1.0
            });
          }
        }
      }
    }

    return results.sort((a, b) => b.relevanceScore - a.relevanceScore);
  }
}
