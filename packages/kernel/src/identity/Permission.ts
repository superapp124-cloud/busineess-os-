export interface Permission {
  resource: string;
  action: string;
  conditions?: Record<string, unknown>;
}
