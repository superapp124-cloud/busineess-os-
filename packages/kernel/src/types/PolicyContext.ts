export interface PolicyContext {
  privacyLevel: 'STRICT_LOCAL' | 'ENTERPRISE_LAN' | 'PUBLIC_CLOUD';
  maxBudgetCost: number;
  maxLatencyMs: number;
  complianceRegime: ('GDPR' | 'HIPAA' | 'SOC2' | 'ISO27001')[];
  allowedProviders: string[];
  allowedStorageTargets: string[];
  permissionsGranted: string[];
}
