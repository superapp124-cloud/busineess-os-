import { IRuntime } from '../common/Lifecycle';

export interface ConnectorCapabilities {
  canReadEmails?: boolean;
  canSendEmails?: boolean;
  canManageCalendar?: boolean;
  canAccessFiles?: boolean;
}

/**
 * Interface representing a specific external connector implementation (e.g. Google, Microsoft, Slack).
 */
export interface IConnector {
  id: string;
  name: string;
  capabilities: ConnectorCapabilities;

  /**
   * Initiates the authorization flow for this connector.
   */
  authorize(): Promise<void>;

  /**
   * Revokes authorization for this connector.
   */
  revoke(): Promise<void>;

  /**
   * Refreshes the underlying credentials if possible.
   */
  refresh(): Promise<void>;
}

/**
 * The Connector Runtime manages third-party service authorizations and delegates
 * capabilities. It completely isolates these from the core user identity.
 */
export interface IConnectorRuntime extends IRuntime {
  /**
   * Authorizes a specific connector by ID.
   * @param connectorId The ID of the connector (e.g., 'google')
   */
  authorize(connectorId: string): Promise<void>;

  /**
   * Revokes an existing connector authorization.
   * @param connectorId The ID of the connector
   */
  revoke(connectorId: string): Promise<void>;

  /**
   * Retrieves an active connector by its ID, if authorized.
   * @param connectorId The ID of the connector
   */
  getConnector(connectorId: string): IConnector | null;

  /**
   * Retrieves all currently authorized connectors.
   */
  getAuthorizedConnectors(): IConnector[];
  
  /**
   * Registers a new Connector capability with the runtime.
   */
  registerConnector(connector: IConnector): void;
}
