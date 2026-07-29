import { PlatformRegistry } from '../registry/PlatformRegistry';

export type GraphRelationshipType = 
  | 'OWNS'
  | 'USES'
  | 'CREATED'
  | 'GENERATED'
  | 'DEPENDS_ON'
  | 'LINKED_TO'
  | 'REQUIRES';

export interface IGraphRelationship {
  type: GraphRelationshipType;
  targetType: string; // The BusinessObject type this relationship targets
  // An optional resolver function if the foreign key isn't standard
  resolve?: (sourceId: string) => Promise<string[]>; 
}

export interface IBusinessObjectDefinition {
  type: string;
  repositoryId: string; // The ID of the Repository in the Capability (e.g. 'CampaignRepository')
  primaryKey: string;
  searchableFields: string[];
  relationships: IGraphRelationship[];
  semanticMetadata?: Record<string, any>;
}

/**
 * The Knowledge Graph is an abstraction layer over standard capability repositories.
 * It does NOT store graph data natively (yet). It dynamically resolves relationships
 * across capabilities without forcing them into a strict graph database.
 */
export class KnowledgeGraph {
  
  /**
   * Registers a Business Object into the PlatformRegistry.
   */
  static registerObject(definition: IBusinessObjectDefinition): void {
    PlatformRegistry.register('BusinessObject', definition.type, definition);
  }

  /**
   * Dynamically resolves the relationships for a specific entity.
   * e.g., "Find all Contracts (targetType) that this Campaign (sourceType) LINKED_TO"
   */
  static async resolveRelationships(
    sourceType: string, 
    sourceId: string, 
    relationshipType: GraphRelationshipType
  ): Promise<any[]> {
    const sourceDef = PlatformRegistry.get<IBusinessObjectDefinition>('BusinessObject', sourceType);
    
    if (!sourceDef) {
      throw new Error(`[KnowledgeGraph] Source object type '${sourceType}' is not registered.`);
    }

    const rel = sourceDef.relationships.find(r => r.type === relationshipType);
    
    if (!rel) {
      return []; // No such relationship defined
    }

    let targetIds: string[] = [];

    // If a custom resolver is defined (e.g., querying a join table in the repo)
    if (rel.resolve) {
      targetIds = await rel.resolve(sourceId);
    } else {
      // Default resolution (assuming a standard foreign key convention in the target repo)
      // Note: In a real implementation, you would ask the target's Repository to query this.
      // e.g. targetRepo.findByField(`${sourceType}_id`, sourceId);
      console.log(`[KnowledgeGraph] Resolving ${relationshipType} from ${sourceType}(${sourceId}) to ${rel.targetType}`);
      targetIds = [`mock_${rel.targetType}_1`, `mock_${rel.targetType}_2`]; // Mocked
    }

    // Now fetch the actual target objects from their repository
    const targetDef = PlatformRegistry.get<IBusinessObjectDefinition>('BusinessObject', rel.targetType);
    if (!targetDef) return [];

    // Mock fetching target objects
    return targetIds.map(id => ({ id, _type: rel.targetType, _mocked: true }));
  }

  /**
   * Retrieves all registered Business Objects (useful for Universal Search mapping).
   */
  static getGraphSchema(): IBusinessObjectDefinition[] {
    return PlatformRegistry.getAll<IBusinessObjectDefinition>('BusinessObject');
  }
}
