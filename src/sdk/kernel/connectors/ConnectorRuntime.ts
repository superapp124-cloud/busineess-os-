import { PlatformRegistry } from '../registry/PlatformRegistry';

/**
 * Connectors do not expose raw HTTP endpoints.
 * They expose semantic actions (capabilities) like 'SearchCalendar', 'ListFiles'.
 */

export interface IConnectorAction {
  name: string;
  description: string;
  execute: (payload: any) => Promise<any>;
}

export interface IConnector {
  id: string;
  name: string;
  provider: string;
  actions: Record<string, IConnectorAction>;
  authenticate: () => Promise<boolean>;
}

export class ConnectorRuntime {
  /**
   * Registers a semantic connector.
   */
  static registerConnector(connector: IConnector): void {
    PlatformRegistry.register('Connector', connector.id, connector);
  }

  /**
   * Executes a specific semantic action on a connector.
   * e.g., executeAction('google-workspace', 'SearchCalendar', { query: 'meeting' })
   */
  static async executeAction(connectorId: string, actionName: string, payload: any): Promise<any> {
    const connector = PlatformRegistry.get<IConnector>('Connector', connectorId);
    
    if (!connector) {
      throw new Error(`[ConnectorRuntime] Connector '${connectorId}' is not registered.`);
    }

    const action = connector.actions[actionName];
    if (!action) {
      throw new Error(`[ConnectorRuntime] Action '${actionName}' not found on connector '${connectorId}'.`);
    }

    try {
      // Ensure authenticated before executing
      await connector.authenticate();
      return await action.execute(payload);
    } catch (error) {
      console.error(`[ConnectorRuntime] Action failed: ${connectorId}.${actionName}`, error);
      throw error;
    }
  }

  /**
   * Returns metadata about all available actions on a given connector.
   * Useful for the Planner to understand what the connector can do.
   */
  static getConnectorActions(connectorId: string): { name: string; description: string }[] {
    const connector = PlatformRegistry.get<IConnector>('Connector', connectorId);
    if (!connector) return [];

    return Object.values(connector.actions).map(a => ({
      name: a.name,
      description: a.description
    }));
  }
}
