export interface ResourceQuota { cpuMillicores: number; memoryMb: number; storageMb: number; connectorLimit: number; rateLimit: number; }
export interface ResourceManager {
  getQuota(tenantId: string): Promise<ResourceQuota>;
  setQuota(tenantId: string, quota: ResourceQuota): Promise<void>;
}

export interface QuotaService {
  checkAndConsume(tenantId: string, resource: keyof ResourceQuota, amount: number): Promise<boolean>;
  release(tenantId: string, resource: keyof ResourceQuota, amount: number): Promise<void>;
}

export interface RateLimiter {
  isAllowed(tenantId: string, operation: string): Promise<boolean>;
}
