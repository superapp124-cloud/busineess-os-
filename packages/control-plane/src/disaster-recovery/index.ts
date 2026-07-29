// Placeholder — will be expanded in a dedicated disaster recovery milestone

export interface Snapshot { id: string; tenantId: string; environment: string; createdAt: string; }
export interface BackupManager {
  createSnapshot(tenantId: string, environment: string): Promise<Snapshot>;
  listSnapshots(tenantId: string): Promise<Snapshot[]>;
}

export interface SnapshotService {
  get(snapshotId: string): Promise<Snapshot | null>;
}

export interface RestoreService {
  restore(snapshotId: string, targetEnvironment: string): Promise<void>;
}
