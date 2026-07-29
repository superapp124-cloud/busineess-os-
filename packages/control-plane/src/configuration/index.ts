export interface ConfigurationService {
  get(tenantId: string, key: string, environment: string): Promise<string | null>;
  set(tenantId: string, key: string, value: string, environment: string): Promise<void>;
}

export interface FeatureFlagService {
  isEnabled(tenantId: string, flag: string): Promise<boolean>;
  setFlag(tenantId: string, flag: string, enabled: boolean): Promise<void>;
}

export interface RuntimeOverrides {
  /** Allows authorised admins to override defaults without redeployment */
  setOverride(tenantId: string, key: string, value: string): Promise<void>;
  getOverride(tenantId: string, key: string): Promise<string | null>;
  clearOverride(tenantId: string, key: string): Promise<void>;
}
