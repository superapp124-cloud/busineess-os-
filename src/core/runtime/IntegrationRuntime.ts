export type ConnectorStatus = 'Healthy' | 'Degraded' | 'Offline';

export interface ConnectorManifest {
  id: string;
  name: string;
  category: 'ERP' | 'ATS' | 'EHR' | 'CRM' | 'Communication' | 'Cloud';
  version: string;
  status: ConnectorStatus;
  permissions: string[];
  oauthConfig?: {
    tokenUrl: string;
    clientId: string;
    expiresAt: number;
    accessToken?: string;
  };
  failureThreshold?: number;
}

export class IntegrationRuntime {
  private static instance: IntegrationRuntime;
  private connectors = new Map<string, ConnectorManifest>();
  private failureCounters = new Map<string, number>();

  private constructor() {
    this.registerCoreConnectors();
  }

  public static getInstance(): IntegrationRuntime {
    if (!IntegrationRuntime.instance) {
      IntegrationRuntime.instance = new IntegrationRuntime();
    }
    return IntegrationRuntime.instance;
  }

  public registerConnector(connector: ConnectorManifest): void {
    console.log(`[IntegrationRuntime] Registering Connector: ${connector.name} (${connector.id})`);
    this.connectors.set(connector.id, {
      ...connector,
      failureThreshold: connector.failureThreshold || 3,
    });
    this.failureCounters.set(connector.id, 0);
  }

  public getConnector(id: string): ConnectorManifest | undefined {
    return this.connectors.get(id);
  }

  public getAllConnectors(): ConnectorManifest[] {
    return Array.from(this.connectors.values());
  }

  // ─── OAUTH2 TOKEN REFRESH LIFECYCLE ───────────────────────────────────────
  public async ensureValidToken(connectorId: string): Promise<string> {
    const conn = this.connectors.get(connectorId);
    if (!conn) throw new Error(`Connector ${connectorId} not found`);

    if (!conn.oauthConfig) return 'no_oauth_required';

    const now = Date.now();
    if (!conn.oauthConfig.accessToken || conn.oauthConfig.expiresAt <= now) {
      console.log(`[IntegrationRuntime] Token expired for ${conn.name}. Triggering auto-refresh...`);
      // Simulate token refresh API call
      await new Promise(res => setTimeout(res, 20));
      conn.oauthConfig.accessToken = `token_refreshed_${Date.now()}`;
      conn.oauthConfig.expiresAt = now + 3600 * 1000; // +1 hour
      console.log(`[IntegrationRuntime] Token successfully refreshed for ${conn.name}.`);
    }

    return conn.oauthConfig.accessToken;
  }

  // ─── CIRCUIT BREAKER ENGINE ───────────────────────────────────────────────
  public async executeConnectorCall<T>(connectorId: string, apiCall: () => Promise<T>): Promise<T> {
    const conn = this.connectors.get(connectorId);
    if (!conn) throw new Error(`Connector ${connectorId} not found`);

    if (conn.status === 'Offline') {
      throw new Error(`Circuit Breaker OPEN: Connector ${conn.name} is Offline`);
    }

    await this.ensureValidToken(connectorId);

    try {
      const result = await apiCall();
      // Reset failures on success
      this.failureCounters.set(connectorId, 0);
      if (conn.status === 'Degraded') conn.status = 'Healthy';
      return result;
    } catch (err: any) {
      const failures = (this.failureCounters.get(connectorId) || 0) + 1;
      this.failureCounters.set(connectorId, failures);

      if (failures >= (conn.failureThreshold || 3)) {
        conn.status = 'Offline';
        console.error(`[IntegrationRuntime] Circuit Breaker TRIPPED: Connector ${conn.name} is now Offline (${failures} consecutive failures).`);
      } else {
        conn.status = 'Degraded';
        console.warn(`[IntegrationRuntime] Connector ${conn.name} Degraded (${failures}/${conn.failureThreshold} failures).`);
      }

      throw err;
    }
  }

  // ─── CAPABILITY PERMISSION VALIDATOR ──────────────────────────────────────
  public validatePermissions(requiredPermissions: string[], grantedPermissions: string[]): boolean {
    if (!requiredPermissions || requiredPermissions.length === 0) return true;
    const grantedSet = new Set(grantedPermissions);
    return requiredPermissions.every(perm => grantedSet.has(perm));
  }

  private registerCoreConnectors() {
    this.registerConnector({
      id: 'conn_sap_erp',
      name: 'SAP ERP Connector',
      category: 'ERP',
      version: 'v2.1',
      status: 'Healthy',
      permissions: ['read_po', 'write_invoice', 'erp_sync'],
      oauthConfig: {
        tokenUrl: 'https://sap.enterprise.com/oauth/token',
        clientId: 'chatr_sap_client',
        expiresAt: Date.now() + 3600000,
        accessToken: 'initial_sap_token_2026',
      },
    });

    this.registerConnector({
      id: 'conn_greenhouse_ats',
      name: 'Greenhouse ATS Connector',
      category: 'ATS',
      version: 'v3.0',
      status: 'Healthy',
      permissions: ['read_candidate', 'write_stage', 'ats_scoring'],
      oauthConfig: {
        tokenUrl: 'https://greenhouse.io/oauth/token',
        clientId: 'chatr_ats_client',
        expiresAt: Date.now() + 3600000,
        accessToken: 'initial_ats_token_2026',
      },
    });

    this.registerConnector({
      id: 'conn_apollo_fhir',
      name: 'Apollo Clinical FHIR Connector',
      category: 'EHR',
      version: 'v4.0',
      status: 'Healthy',
      permissions: ['read_prescription', 'write_lab_order', 'fhir_sync'],
      oauthConfig: {
        tokenUrl: 'https://apollo.health/fhir/oauth/token',
        clientId: 'chatr_fhir_client',
        expiresAt: Date.now() + 3600000,
        accessToken: 'initial_fhir_token_2026',
      },
    });
  }
}
