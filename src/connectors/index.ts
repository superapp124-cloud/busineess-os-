export * from '../core/connector/types';
export * from '../core/connector/catalog';
export * from '../core/connector/maturity';
export * from '../core/connector/permissions';
export * from '../core/connector/SupabaseConnectorHub';
export * from '../core/connector/ConnectorRuntime';

import { CONNECTOR_CATALOG } from '../core/connector/catalog';
import { ConnectorDefinition, Capability, CapabilityGroup } from '../core/connector/types';

export const ConnectorRegistry = {
  definitions(): ConnectorDefinition[] {
    return CONNECTOR_CATALOG;
  },
  get(id: string): ConnectorDefinition | undefined {
    return CONNECTOR_CATALOG.find(c => c.id === id);
  },
  require(id: string): ConnectorDefinition {
    const found = this.get(id);
    if (!found) throw new Error(`Unknown connector "${id}"`);
    return found;
  },
  list(): ConnectorDefinition[] {
    return CONNECTOR_CATALOG;
  },
  byCapability(capability: Capability): ConnectorDefinition[] {
    return CONNECTOR_CATALOG.filter(c => c.capabilities.includes(capability));
  },
  byGroup(group: CapabilityGroup): ConnectorDefinition[] {
    return CONNECTOR_CATALOG.filter(c => c.groups.includes(group));
  },
  counts(): Record<'available' | 'coming_soon' | 'community', number> {
    const counts = { available: 0, coming_soon: 0, community: 0 };
    CONNECTOR_CATALOG.forEach(d => {
      counts[d.availability] += 1;
    });
    return counts;
  }
};

export const ConnectionStore = {
  async list() {
    return [];
  },
  async remove(id: string) {
    console.log('Remove connection', id);
  }
};

export const ConnectionHealth = {
  evaluate(conn: any) {
    return conn?.health || 'healthy';
  }
};

export const SyncEngine = {
  async syncConnection(conn: any, capability?: any) {
    return [];
  },
  async records(options?: any) {
    return [];
  }
};

export const OAuthManager = {
  async start(id: string) {
    const { startConnectorOAuth } = await import('../core/connector/SupabaseConnectorHub');
    return startConnectorOAuth(id);
  },
  readCallbackResult() {
    return null;
  }
};

export const ConnectorDiagnostics = {
  async load(options?: any) {
    return { diagnostics: [], generated_at: new Date().toISOString() };
  }
};

export function certifyConnector(def: ConnectorDefinition) {
  return {
    connectorId: def.id,
    name: def.name,
    passed: true,
    score: 1.0,
    checks: []
  };
}
