export interface LicensePlan { id: string; name: string; features: string[]; maxCapabilities: number; }
export interface LicensePlanService {
  getPlans(): Promise<LicensePlan[]>;
  assignPlan(tenantId: string, planId: string): Promise<void>;
  getTenantPlan(tenantId: string): Promise<LicensePlan | null>;
}

export interface Entitlement { capabilityName: string; limit: number; features: string[]; }
export interface EntitlementService {
  isEntitled(tenantId: string, capabilityName: string): Promise<boolean>;
  getEntitlements(tenantId: string): Promise<Entitlement[]>;
}

export interface UsageTracker {
  increment(tenantId: string, capabilityName: string): Promise<void>;
  getUsage(tenantId: string, capabilityName: string): Promise<number>;
}

export interface BillingHook {
  /** Interface for external billing system integration */
  reportUsage(tenantId: string, capabilityName: string, count: number): Promise<void>;
}
