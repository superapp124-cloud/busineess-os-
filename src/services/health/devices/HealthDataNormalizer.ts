/**
 * CHATR HEALTH OS — HealthDataNormalizer
 *
 * Normalizes disparate raw payloads from Health Connect, HealthKit,
 * Bluetooth LE SIG characteristics, and Cloud APIs into canonical
 * NormalizedHealthSample instances.
 */

import { CanonicalHealthMetric, DeviceCategory, DeviceChannel, NormalizedHealthSample } from './DeviceTypes';

export class HealthDataNormalizer {

  /**
   * Normalizes blood pressure readings into canonical mmHg
   */
  static normalizeBloodPressure(params: {
    userId: string;
    systolic: number;
    diastolic: number;
    pulse?: number;
    timestamp?: string;
    channel: DeviceChannel;
    deviceId: string;
    deviceName: string;
    deviceType: DeviceCategory;
    manufacturer: string;
  }): NormalizedHealthSample[] {
    const ts = params.timestamp || new Date().toISOString();
    const results: NormalizedHealthSample[] = [
      {
        id: `bp_sys_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
        userId: params.userId,
        metric: 'blood_pressure_systolic',
        value: Math.round(params.systolic),
        secondaryValue: Math.round(params.diastolic),
        unit: 'mmHg',
        timestamp: ts,
        sourceChannel: params.channel,
        sourceDeviceId: params.deviceId,
        sourceDeviceName: params.deviceName,
        sourceDeviceType: params.deviceType,
        sourceManufacturer: params.manufacturer,
        confidence: params.deviceType === 'blood_pressure_monitor' ? 0.95 : 0.80,
        measurementMethod: 'oscillometric',
      },
      {
        id: `bp_dia_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
        userId: params.userId,
        metric: 'blood_pressure_diastolic',
        value: Math.round(params.diastolic),
        unit: 'mmHg',
        timestamp: ts,
        sourceChannel: params.channel,
        sourceDeviceId: params.deviceId,
        sourceDeviceName: params.deviceName,
        sourceDeviceType: params.deviceType,
        sourceManufacturer: params.manufacturer,
        confidence: params.deviceType === 'blood_pressure_monitor' ? 0.95 : 0.80,
        measurementMethod: 'oscillometric',
      }
    ];

    if (params.pulse && params.pulse > 30 && params.pulse < 250) {
      results.push({
        id: `bp_hr_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
        userId: params.userId,
        metric: 'heart_rate',
        value: Math.round(params.pulse),
        unit: 'bpm',
        timestamp: ts,
        sourceChannel: params.channel,
        sourceDeviceId: params.deviceId,
        sourceDeviceName: params.deviceName,
        sourceDeviceType: params.deviceType,
        sourceManufacturer: params.manufacturer,
        confidence: 0.90,
      });
    }

    return results;
  }

  /**
   * Normalizes blood glucose, handling mg/dL or mmol/L
   */
  static normalizeBloodGlucose(params: {
    userId: string;
    value: number;
    unit: 'mg/dL' | 'mmol/L';
    timestamp?: string;
    channel: DeviceChannel;
    deviceId: string;
    deviceName: string;
    deviceType: DeviceCategory;
    manufacturer: string;
    isContinuous?: boolean;
  }): NormalizedHealthSample {
    const canonicalValue = params.unit === 'mmol/L' 
      ? Math.round(params.value * 18.0182) 
      : Math.round(params.value);

    return {
      id: `glucose_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      userId: params.userId,
      metric: 'blood_glucose',
      value: canonicalValue,
      unit: 'mg/dL',
      timestamp: params.timestamp || new Date().toISOString(),
      sourceChannel: params.channel,
      sourceDeviceId: params.deviceId,
      sourceDeviceName: params.deviceName,
      sourceDeviceType: params.deviceType,
      sourceManufacturer: params.manufacturer,
      confidence: params.isContinuous ? 0.90 : 0.95,
      measurementMethod: params.isContinuous ? 'interstitial_enzymatic' : 'capillary_glucose_oxidase',
    };
  }

  /**
   * Normalizes heart rate & resting heart rate
   */
  static normalizeHeartRate(params: {
    userId: string;
    bpm: number;
    isResting?: boolean;
    timestamp?: string;
    channel: DeviceChannel;
    deviceId: string;
    deviceName: string;
    deviceType: DeviceCategory;
    manufacturer: string;
    isEcgSensor?: boolean;
  }): NormalizedHealthSample {
    return {
      id: `hr_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      userId: params.userId,
      metric: params.isResting ? 'resting_heart_rate' : 'heart_rate',
      value: Math.round(params.bpm),
      unit: 'bpm',
      timestamp: params.timestamp || new Date().toISOString(),
      sourceChannel: params.channel,
      sourceDeviceId: params.deviceId,
      sourceDeviceName: params.deviceName,
      sourceDeviceType: params.deviceType,
      sourceManufacturer: params.manufacturer,
      confidence: params.isEcgSensor ? 0.98 : (params.deviceType === 'smart_ring' ? 0.92 : 0.88),
      measurementMethod: params.isEcgSensor ? 'electrocardiography' : 'photoplethysmography',
    };
  }

  /**
   * Normalizes Oxygen Saturation (SpO2)
   */
  static normalizeOxygenSaturation(params: {
    userId: string;
    percentage: number;
    timestamp?: string;
    channel: DeviceChannel;
    deviceId: string;
    deviceName: string;
    deviceType: DeviceCategory;
    manufacturer: string;
  }): NormalizedHealthSample {
    return {
      id: `spo2_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      userId: params.userId,
      metric: 'oxygen_saturation',
      value: Math.min(100, Math.max(50, Math.round(params.percentage))),
      unit: '%',
      timestamp: params.timestamp || new Date().toISOString(),
      sourceChannel: params.channel,
      sourceDeviceId: params.deviceId,
      sourceDeviceName: params.deviceName,
      sourceDeviceType: params.deviceType,
      sourceManufacturer: params.manufacturer,
      confidence: params.deviceType === 'pulse_oximeter' ? 0.96 : 0.85,
      measurementMethod: 'pulse_oximetry',
    };
  }

  /**
   * Normalizes Body Weight (converts lbs to kg if needed)
   */
  static normalizeWeight(params: {
    userId: string;
    weight: number;
    unit: 'kg' | 'lbs';
    timestamp?: string;
    channel: DeviceChannel;
    deviceId: string;
    deviceName: string;
    deviceType: DeviceCategory;
    manufacturer: string;
  }): NormalizedHealthSample {
    const valKg = params.unit === 'lbs' ? Number((params.weight * 0.453592).toFixed(1)) : Number(params.weight.toFixed(1));

    return {
      id: `weight_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      userId: params.userId,
      metric: 'body_weight_kg',
      value: valKg,
      unit: 'kg',
      timestamp: params.timestamp || new Date().toISOString(),
      sourceChannel: params.channel,
      sourceDeviceId: params.deviceId,
      sourceDeviceName: params.deviceName,
      sourceDeviceType: params.deviceType,
      sourceManufacturer: params.manufacturer,
      confidence: 0.95,
      measurementMethod: 'strain_gauge_scale',
    };
  }

  /**
   * Maps a NormalizedHealthSample to the existing CHATR `chronic_vitals` table row schema
   */
  static toChronicVitalRow(sample: NormalizedHealthSample): {
    user_id: string;
    vital_type: string;
    value: number;
    unit: string;
    notes: string;
    recorded_at: string;
  } {
    let vitalType = 'heart_rate';
    if (sample.metric === 'blood_pressure_systolic') vitalType = 'blood_pressure_systolic';
    else if (sample.metric === 'blood_pressure_diastolic') vitalType = 'blood_pressure_diastolic';
    else if (sample.metric === 'blood_glucose') vitalType = 'blood_sugar';
    else if (sample.metric === 'oxygen_saturation') vitalType = 'oxygen_saturation';
    else if (sample.metric === 'body_weight_kg') vitalType = 'weight';
    else if (sample.metric === 'body_temperature') vitalType = 'temperature';
    else if (sample.metric === 'resting_heart_rate') vitalType = 'heart_rate';

    const sourceTag = `[${sample.sourceDeviceName} (${sample.sourceChannel})]`;

    return {
      user_id: sample.userId,
      vital_type: vitalType,
      value: sample.value,
      unit: sample.unit,
      notes: `${sourceTag} Confidence: ${Math.round(sample.confidence * 100)}%`,
      recorded_at: sample.timestamp,
    };
  }
}
