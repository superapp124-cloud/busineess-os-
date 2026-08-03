/**
 * @deprecated Use EnterpriseKnowledgeRuntime instead.
 * Enterprise Knowledge Fabric
 * Legacy mock singleton. 
 */
export class EnterpriseKnowledgeFabric {
  private static instance: EnterpriseKnowledgeFabric;
  private packs: Map<string, any> = new Map();

  private constructor() {
    console.warn('[DEPRECATED] EnterpriseKnowledgeFabric is deprecated. Use EnterpriseKnowledgeRuntime.');
  }

  public static getInstance(): EnterpriseKnowledgeFabric {
    if (!EnterpriseKnowledgeFabric.instance) {
      EnterpriseKnowledgeFabric.instance = new EnterpriseKnowledgeFabric();
    }
    return EnterpriseKnowledgeFabric.instance;
  }

  public registerPack(packId: string, packDefinition: any) {
    console.log(`[KnowledgeFabric] Registering Knowledge Pack: ${packId}`);
    this.packs.set(packId, packDefinition);
  }

  public getPoliciesForDomain(domain: string): any[] {
    const pack = this.packs.get(domain);
    return pack?.policies || [];
  }

  public getEntitiesForDomain(domain: string): any[] {
    const pack = this.packs.get(domain);
    return pack?.entities || [];
  }
}
