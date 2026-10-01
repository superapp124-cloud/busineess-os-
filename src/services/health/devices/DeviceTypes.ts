/**
 * CHATR HEALTH OS — Universal Device Architecture
 * DeviceTypes.ts
 *
 * Device-agnostic model for biometrics, wearables, medical devices,
 * and aggregator channels.
 * Aligned with CHATR Health OS Core v1 Contract.
 */

import { DeviceProvenance, IDeviceConnector } from '../core/HealthOSContract';
export type { DeviceProvenance, IDeviceConnector };

/**
 * The 6 Core Device Categories
 */
export type PrimaryDeviceCategory =
  | 'wearables'
  | 'rings'
  | 'medical'
  | 'body'
  | 'sleep'
  | 'fitness';

/**
 * Granular & legacy device category types
 */
export type DeviceCategory =
  | PrimaryDeviceCategory
  | 'smartwatch'
  | 'smart_ring'
  | 'fitness_band'
  | 'blood_pressure_monitor'
  | 'continuous_glucose_monitor'
  | 'smart_scale'
  | 'pulse_oximeter'
  | 'smart_thermometer'
  | 'ecg_monitor'
  | 'sleep_tracker';

export type DeviceChannel =
  | 'health_connect'
  | 'healthkit'
  | 'bluetooth_le'
  | 'cloud_partner'
  | 'manual_entry';

export type DeviceConnectionMode =
  | 'native_ble'
  | 'platform_aggregator'
  | 'cloud_partner'
  | 'manual_assisted';

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

export interface ConnectionHonesty {
  tier: 'direct_live' | 'companion_app_sync' | 'cloud_oauth' | 'manual';
  summary: string;
  verifiedDirect: boolean;
}

export interface DeviceMetadata {
  id: string;
  name: string;
  primaryCategory: PrimaryDeviceCategory;
  category: DeviceCategory;
  manufacturer: string;
  model?: string;
  channel: DeviceChannel;
  connectionMode: DeviceConnectionMode;
  connectionHonesty: ConnectionHonesty;
  supportedMetrics: CanonicalHealthMetric[];
  icon: string;
  description: string;
  availability: 'available_now' | 'ready_to_pair' | 'coming_soon' | 'requires_companion_app';
  pairingGuide?: string;
  bleServiceUuids?: string[];
}

export interface ConnectedDevice {
  id: string;
  registryId: string;
  name: string;
  primaryCategory?: PrimaryDeviceCategory;
  category: DeviceCategory;
  channel: DeviceChannel;
  manufacturer: string;
  model?: string;
  status: DeviceConnectionStatus;
  batteryLevel?: number; // 0 - 100
  lastSyncAt?: string; // ISO 8601
  lastSeenAt?: string; // ISO 8601
  capabilities: CanonicalHealthMetric[];
  enabledMetrics?: CanonicalHealthMetric[]; // User privacy controls: selectively allow/deny metrics
  macAddress?: string;
  cloudProviderId?: string;
  connectionError?: string;
  autoSyncEnabled: boolean;
  dataPointsIngested?: number;
}

export interface NormalizedHealthSample {
  id: string;
  userId: string;
  metric: CanonicalHealthMetric;
  value: number;
  secondaryValue?: number; // e.g. diastolic for blood pressure
  unit: string;
  timestamp: string; // ISO 8601
  sourceChannel: DeviceChannel;
  sourceDeviceId: string;
  sourceDeviceName: string;
  sourceDeviceType: string;
  sourceManufacturer: string;
  confidence: number; // 0.0 to 1.0 (Direct BLE Medical > Cloud Partner > Aggregator > Manual)
  measurementMethod?: string;
  rawPayload?: Record<string, unknown>;
  provenance?: DeviceProvenance;
}

export interface DeviceCoverageSummary {
  heartRate: boolean;
  sleep: boolean;
  activity: boolean;
  bloodPressure: boolean;
  glucose: boolean;
  oxygen: boolean;
  respiratory: boolean;
  temperature: boolean;
  weight: boolean;
  totalSensorsConnected: number;
}
