export type HealthStatus = 'HEALTHY' | 'DEGRADED' | 'CRITICAL';

export interface HealthMonitor {
  check(environment: string): Promise<HealthStatus>;
}

export interface Incident { id: string; environment: string; severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'; description: string; raisedAt: string; resolved: boolean; }
export interface IncidentManager {
  raise(environment: string, severity: Incident['severity'], description: string): Promise<Incident>;
  resolve(incidentId: string): Promise<void>;
  list(environment: string): Promise<Incident[]>;
}

export interface AlertManager {
  emit(alert: { environment: string; message: string; severity: string }): Promise<void>;
}

export interface Recommendation { action: string; reason: string; confidence: number; }
export interface RecommendationEngine {
  /** Initially deterministic — AI plugs in later without redesign */
  recommend(environment: string, healthStatus: HealthStatus): Promise<Recommendation[]>;
}
