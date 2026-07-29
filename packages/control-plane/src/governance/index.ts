export interface PolicyVersion {
  id: string;
  version: string;
  author: string;
  timestamp: string;
  changeHistory: string[];
  content: string;
}

export interface PolicyAdministrator {
  /** Manages enterprise-wide policies and routes to Kernel Policy Engine */
  publishPolicy(policy: Omit<PolicyVersion, 'id'>): Promise<PolicyVersion>;
  getActivePolicy(tenantId: string): Promise<PolicyVersion | null>;
  getPolicyHistory(tenantId: string): Promise<PolicyVersion[]>;
}

export interface AuditLogEntry { id: string; timestamp: string; action: string; actor: string; result: string; policyVersion: string; }
export interface ComplianceAuditor {
  record(entry: Omit<AuditLogEntry, 'id'>): Promise<void>;
  query(tenantId: string, since: string): Promise<AuditLogEntry[]>;
}

export interface AuditReplay {
  /** Reconstruct timeline for forensic investigation */
  replayTimeline(tenantId: string, from: string, to: string): Promise<AuditLogEntry[]>;
}

export interface ApprovalOrchestrator {
  requestApproval(requestId: string, context: unknown): Promise<'PENDING' | 'APPROVED' | 'REJECTED'>;
  resolveApproval(requestId: string, approved: boolean, reviewer: string): Promise<void>;
}
