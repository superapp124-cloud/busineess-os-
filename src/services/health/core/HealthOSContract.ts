/**
 * CHATR HEALTH OS — Core v1 Contract
 * ============================================================================
 * IMMUTABLE INTELLIGENCE CONTRACT — FREEZE LEVEL: v1.0.0
 *
 * Core architectural principle:
 *   "The intelligence engine does not care where the data came from."
 *
 * All inputs (watches, smart rings, medical BLE devices, Android Health Connect,
 * Apple HealthKit, cloud partner APIs, voice vital dictation, manual entry)
 * MUST normalize into this canonical contract.
 *
 * Clinical Rule Implementation Note:
 *   Rules and thresholds reflect engineered implementations of published consensus
 *   guidelines (AHA/ACC 2017/2024, ADA 2025, WHO). Technical verification proves
 *   rule execution fidelity; it does not replace individualized clinical review
 *   or formal multi-site medical device validation.
 * ============================================================================
 */

export const HEALTH_OS_CORE_VERSION = '1.0.0';

export const CLINICAL_SAFETY_CONTRACT_SPEC = {
  specVersion: '2026.1',
  verificationType: 'engineering_rule_implementation_verified',
  formalClinicalReviewRequired: true,
  disclaimer:
    'Chatr Health OS uses engineered clinical consensus guidelines to detect anomalies and prioritize alerts. It does not provide medical diagnosis.',
};

// ─── 1. HealthEvent ───────────────────────────────────────────────────────────

export type HealthEventType =
  | 'vital_recorded'
  | 'medication_taken'
  | 'medication_missed'
  | 'medication_due'
  | 'lab_uploaded'
  | 'lab_unreviewed'
  | 'appointment_booked'
  | 'appointment_upcoming'
  | 'appointment_overdue'
  | 'symptom_check'
  | 'care_path_action'
  | 'care_path_due'
  | 'insight_generated'
  | 'prediction_fired'
  | 'streak_milestone'
  | 'manual_entry'
  | 'mental_health_check'
  | 'prescription_uploaded'
  | 'consultation_completed';

/**
 * Priority Hierarchy:
 * P0: Critical safety red flag (Immediate user/caregiver alert, bypasses quiet hours)
 * P1: Urgent clinical action
 * P2: Action required / statistical anomaly (|z| ≥ 2.0σ)
 * P3: Health insight / trend deviation
 * P4: Routine wellness log / normal confirmation
 * P5: Informational / ambient
 */
export type EventPriority = 0 | 1 | 2 | 3 | 4 | 5;

export interface HealthEvent {
  id: string;
  userId: string;
  eventType: HealthEventType;
  sourceTable: string | null;
  sourceRecordId: string | null;
  eventValue: Record<string, unknown> | null;
  eventContext: string;
  eventAt: Date;
  confidence: number; // 0.0 to 1.0
  priority: EventPriority;
  isAnomaly: boolean;
  baselineDelta: number | null; // Standard deviations (σ) from baseline mean
  anomalyReason: string | null;
  requiresConfirmation?: boolean; // e.g. unconfirmed automated cuff reading
  confirmationGuidance?: string;
  processed: boolean;
  provenance?: DeviceProvenance;
}

// ─── 2. HealthBaseline ────────────────────────────────────────────────────────

export interface BaselineRange {
  min: number;
  max: number;
  average: number;
  stdDev: number;
  sampleCount: number;
  periodDays: number;
  lastUpdated: string; // ISO 8601
}

export interface HealthBaseline {
  blood_pressure_systolic: BaselineRange | null;
  blood_pressure_diastolic: BaselineRange | null;
  heart_rate: BaselineRange | null;
  weight: BaselineRange | null;
  glucose: BaselineRange | null;
  temperature: BaselineRange | null;
  oxygen_saturation: BaselineRange | null;
  step_count?: BaselineRange | null;
  sleep_duration?: BaselineRange | null;
  ranges?: Record<string, BaselineRange>;
  medication_adherence_rate: number | null; // 0.0 to 1.0
  established: boolean;
  establishedDomains: string[];
  computedAt: string; // ISO 8601
}

export interface BaselineStatus {
  established: boolean;
  domains: Record<string, 'established' | 'insufficient_data' | 'no_data'>;
  message: string;
}

// ─── 3. HealthState ───────────────────────────────────────────────────────────

export type HealthStateValue = 'stable' | 'improving' | 'needs_attention' | 'unknown';

export interface VitalSubstate {
  metric: string;
  label: string;
  state: HealthStateValue;
  observation: string;
  latestReading?: string;
  isAnomaly: boolean;
  priority: number;
}

export interface DomainState {
  state: HealthStateValue;
  label: string;
  confidence: number; // 0.0 to 1.0
  observation: string;
  supportingData: string[];
  timePeriod: string;
  hasData: boolean;
  substates?: Record<string, VitalSubstate>;
}

export interface HealthState {
  state: HealthStateValue;
  label: string;
  score: number | null; // Auxiliary legacy score (50–100); Health State is primary
  confidence: number;
  domainStates: Record<string, DomainState>;
  vitalSubstates?: Record<string, VitalSubstate>;
  activeSafetyFlags: string[];
  computedAt: Date;
  eventsAnalyzed: number;
}

// ─── 4. HealthMemory ──────────────────────────────────────────────────────────

export interface HealthMemoryEntry {
  id: string;
  type: 'vital' | 'medication' | 'lab' | 'appointment' | 'consultation' | 'symptom' | 'mental' | 'milestone';
  title: string;
  summary: string;
  occurredAt: Date;
  sourceTable: string;
  sourceId: string;
  metadata: Record<string, unknown>;
}

export interface HealthTimeline {
  entries: HealthMemoryEntry[];
  totalCount: number;
  periodStart: Date;
  periodEnd: Date;
}

/**
 * Cross-Domain Multidimensional Reasoning
 * Strictly separates factual observation from baseline deviation,
 * potential correlation, and clinical alerts.
 * NEVER turns correlation into diagnosis.
 */
export interface CrossDomainObservation {
  id: string;
  observed: string; // e.g., "Activity 11,200 steps; Sleep 5.4 hours"
  comparedWithBaseline: string; // e.g., "Activity +35% above usual; Sleep -1.8h below 7-day average"
  possibleRelationship?: string; // e.g., "High late-evening exertion paired with reduced sleep duration"
  clinicallySignificant: boolean;
  actionRecommendation?: string;
}

export interface HealthMemory {
  timeline: HealthTimeline;
  observations: CrossDomainObservation[];
  changeSummary: {
    periodDays: number;
    highlights: string[];
    anomaliesCount: number;
  };
}

// ─── 5. AttentionCandidate & Today's Focus ────────────────────────────────────

export type CandidateCategory =
  | 'medication'
  | 'vital'
  | 'lab'
  | 'appointment'
  | 'insight'
  | 'wellness'
  | 'care_path'
  | 'safety'
  | 'mental';

export interface AttentionCandidate {
  id: string;
  category: CandidateCategory;
  priority: EventPriority;
  title: string;
  body: string;
  reason: string;
  evidence: Record<string, unknown>;
  recommendedAction: string;
  whyExplanation: string;
  optimalTime: Date | null;
  expiresAt: Date | null;
  dedupeKey: string;
  cooldownHours: number;
  sourceEventId: string | null;
}

export interface FocusItem {
  id: string;
  priority: EventPriority;
  icon: string;
  title: string;
  description: string;
  actionLabel: string;
  actionRoute: string;
  category: CandidateCategory;
  candidateId: string;
}

// ─── 6. NotificationDecision ──────────────────────────────────────────────────

export type NotificationAction = 'send' | 'delay' | 'bundle' | 'suppress';

export interface NotificationDecision {
  candidate: AttentionCandidate;
  decision: NotificationAction;
  decisionReason: string;
  scheduledFor?: Date;
  channel?: 'push' | 'in_app' | 'sms' | 'emergency_call';
}

export interface NotificationDeliveryPolicy {
  userQuietHours: { startHour: number; endHour: number };
  maxDailyNotifications: number;
  safetyOverrideBypassesQuietHours: boolean;
  currentFatigueScore: number;
}

// ─── 7. HealthQuery ───────────────────────────────────────────────────────────

export interface HealthQuery {
  rawQuery: string;
  normalizedQuery: string;
  intent: 'trend' | 'baseline_compare' | 'safety_check' | 'summary' | 'medication_status' | 'unknown';
  targetMetric?: CanonicalHealthMetric;
  timeRangeDays: number;
}

export interface HealthQueryResult {
  answer: string;
  metric?: CanonicalHealthMetric;
  timeRange: string;
  dataPointsCount: number;
  currentAverage?: number;
  previousAverage?: number;
  secondaryAverage?: number; // e.g. diastolic average for BP
  trendDirection?: 'improving' | 'stable' | 'declining' | 'elevated' | 'insufficient_data';
  deltaPercentage?: number;
  inBaselineRange?: boolean;
  provenanceSources: string[];
  safetyAlert?: string;
  suggestedActionRoute?: string;
}

// ─── 8. DeviceSource & Universal Provider Model ───────────────────────────────

export type DeviceCategory =
  | 'wearable'
  | 'ring'
  | 'medical'
  | 'body'
  | 'sleep'
  | 'fitness'
  | 'smartwatch' // backward compatibility alias
  | 'smart_ring' // backward compatibility alias
  | 'blood_pressure_monitor' // backward compatibility alias
  | 'continuous_glucose_monitor' // backward compatibility alias
  | 'smart_scale' // backward compatibility alias
  | 'pulse_oximeter' // backward compatibility alias
  | 'smart_thermometer' // backward compatibility alias
  | 'fitness_band' // backward compatibility alias
  | 'sleep_tracker'; // backward compatibility alias

export type DeviceChannel =
  | 'bluetooth_le'
  | 'health_connect'
  | 'healthkit'
  | 'cloud_partner'
  | 'manual_entry';

export type DeviceConnectionStatus =
  | 'connected'
  | 'syncing'
  | 'idle'
  | 'disconnected'
  | 'permission_required'
  | 'error'
  | 'ready_to_pair';

export type CanonicalHealthMetric =
  | 'heart_rate'
  | 'resting_heart_rate'
  | 'hrv'
  | 'blood_pressure_systolic'
  | 'blood_pressure_diastolic'
  | 'blood_glucose'
  | 'oxygen_saturation'
  | 'steps'
  | 'active_calories'
  | 'sleep_duration_seconds'
  | 'deep_sleep_seconds'
  | 'rem_sleep_seconds'
  | 'body_temperature'
  | 'body_weight_kg'
  | 'respiratory_rate';

export interface DeviceProvenance {
  sourceChannel: DeviceChannel;
  sourceDeviceId: string;
  sourceDeviceName: string;
  sourceManufacturer: string;
  protocol?: string; // e.g. 'BLE_GATT_0x1810', 'HEALTH_CONNECT_V1', 'OURA_REST_V2'
  confidence: number; // 0.0 to 1.0 (Direct BLE Medical > Cloud Partner > Aggregator > Manual)
  syncTimestamp: string;
  measurementMethod?: string; // e.g. 'oscillometric_cuff', 'photoplethysmography', 'cgm_enzymatic'
}

export interface NormalizedHealthSample {
  id: string;
  userId: string;
  metric: CanonicalHealthMetric;
  value: number;
  secondaryValue?: number;
  unit: string;
  timestamp: string; // ISO 8601
  sourceChannel: DeviceChannel;
  sourceDeviceId: string;
  sourceDeviceName: string;
  sourceDeviceType: string;
  sourceManufacturer: string;
  confidence: number;
  measurementMethod?: string;
  rawPayload?: Record<string, unknown>;
  provenance?: DeviceProvenance;
}

export interface DeviceSource {
  id: string;
  registryId: string;
  name: string;
  category: DeviceCategory;
  channel: DeviceChannel;
  manufacturer: string;
  model?: string;
  status: DeviceConnectionStatus;
  batteryLevel?: number; // 0–100
  lastSyncAt?: string;
  lastSeenAt?: string;
  capabilities: CanonicalHealthMetric[];
  macAddress?: string;
  autoSyncEnabled: boolean;
  enabledMetrics?: CanonicalHealthMetric[]; // User per-device privacy toggle
  connectionError?: string;
}

/**
 * Universal Connector Interface
 * Every external hardware integration, OS aggregator, or cloud partner
 * implements this lifecycle interface.
 */
export interface IDeviceConnector {
  channel: DeviceChannel;
  checkAvailability(): Promise<{ isAvailable: boolean; status: string }>;
  requestPermissions(metrics: CanonicalHealthMetric[]): Promise<{ granted: boolean; grantedMetrics: CanonicalHealthMetric[] }>;
  readRecentRecords(params: { userId: string; metrics: CanonicalHealthMetric[]; since: Date }): Promise<NormalizedHealthSample[]>;
  disconnect(deviceId: string): Promise<void>;
}
