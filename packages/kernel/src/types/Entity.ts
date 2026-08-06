export interface Entity<TData = unknown> {
  id: string;
  kind: string; // e.g. 'Candidate' | 'Job' | 'Invoice' | 'Document' | 'Email' | 'Company'
  type: string;
  data: TData;
  metadata: {
    ownerId: string;
    tenantId: string;
    createdAt: string;
    updatedAt: string;
    version: number;
    tags?: string[];
  };
}

export interface Resource<TData = unknown> extends Entity<TData> {
  resourceClass: 'Actor' | 'Asset' | 'Task' | 'Knowledge' | 'Event' | string;
}
