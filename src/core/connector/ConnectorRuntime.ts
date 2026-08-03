import { IConnectorRuntime, IConnector } from '../contracts/connector/IConnectorRuntime';
import { RuntimeHealth } from '../contracts/common/Lifecycle';
import { IEventBus } from '../contracts/events/IEventBus';
import { ConnectorError } from '../contracts/common/Errors';
import { oauthManager as legacyOAuthManager } from '../auth/OAuthManager';

export class ConnectorRuntime implements IConnectorRuntime {
  private connectors: Map<string, IConnector> = new Map();
  private eventBus: IEventBus;

  constructor(eventBus: IEventBus) {
    this.eventBus = eventBus;
  }

  public registerConnector(connector: IConnector): void {
    this.connectors.set(connector.id, connector);
  }

  public async authorize(connectorId: string): Promise<void> {
    this.eventBus.publish('connector.authorization.started', { connectorId }, 'connector');
    
    // For Phase 1, we wrap the legacy OAuthManager directly by passing it a mock IProvider
    // just to keep the old UI pathways functional if they call authorize().
    try {
      // If we have a registered connector, use its native authorize method
      const connector = this.connectors.get(connectorId);
      if (connector) {
        await connector.authorize();
      } else {
        // Legacy fallback
        console.warn(`[ConnectorRuntime] Falling back to legacy OAuthManager for ${connectorId}`);
        // We simulate calling the old initiateFlow. Note: this requires mapping to legacy SDK.
        // As a wrapper, we just throw an error if the new Connector isn't found for now,
        // or we could integrate the legacy flow.
        throw new ConnectorError(`Connector ${connectorId} not fully migrated. Use Legacy UI flow or register connector.`);
      }
      this.eventBus.publish('connector.authorization.completed', { connectorId }, 'connector');
    } catch (err: any) {
      this.eventBus.publish('connector.authorization.failed', { connectorId, error: err.message }, 'connector');
      throw new ConnectorError(`Authorization failed for ${connectorId}: ${err.message}`);
    }
  }

  public async revoke(connectorId: string): Promise<void> {
    const connector = this.connectors.get(connectorId);
    if (connector) {
      await connector.revoke();
    }
  }

  public getConnector(connectorId: string): IConnector | null {
    return this.connectors.get(connectorId) || null;
  }

  public getAuthorizedConnectors(): IConnector[] {
    // In a full implementation, this queries the TokenVault for active sessions
    return Array.from(this.connectors.values());
  }

  public async initialize(): Promise<void> {}
  public async start(): Promise<void> {}
  public async stop(): Promise<void> {}
  public async dispose(): Promise<void> {}

  public async health(): Promise<RuntimeHealth> {
    return { status: 'healthy', lastChecked: Date.now() };
  }

  public version(): string {
    return '1.0.0';
  }
}
