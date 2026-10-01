/**
 * CHATR HEALTH OS — MockSimulatedDeviceAdapter
 *
 * Provides realistic medical and wearable telemetry for demonstration,
 * testing, and verification when physical hardware is not present.
 */

import { DeviceMetadata, NormalizedHealthSample } from '../DeviceTypes';
import { HealthDataNormalizer } from '../HealthDataNormalizer';

export class MockSimulatedDeviceAdapter {

  /**
   * Generates a realistic set of initial baseline readings for a newly connected device
   */
  static generateInitialTelemetry(
    device: DeviceMetadata,
    userId: string
  ): NormalizedHealthSample[] {
    const now = new Date();
    const samples: NormalizedHealthSample[] = [];

    // Blood Pressure Monitor
    if (device.category === 'blood_pressure_monitor') {
      const bpSamples = HealthDataNormalizer.normalizeBloodPressure({
        userId,
        systolic: 118 + Math.floor(Math.random() * 8),
        diastolic: 76 + Math.floor(Math.random() * 6),
        pulse: 68 + Math.floor(Math.random() * 8),
        channel: device.channel,
        deviceId: `sim_${device.id}`,
        deviceName: device.name,
        deviceType: device.category,
        manufacturer: device.manufacturer,
      });
      samples.push(...bpSamples);
    }

    // Continuous Glucose Monitor
    else if (device.category === 'continuous_glucose_monitor') {
      samples.push(HealthDataNormalizer.normalizeBloodGlucose({
        userId,
        value: 96 + Math.floor(Math.random() * 15),
        unit: 'mg/dL',
        channel: device.channel,
        deviceId: `sim_${device.id}`,
        deviceName: device.name,
        deviceType: device.category,
        manufacturer: device.manufacturer,
        isContinuous: true,
      }));
    }

    // Smart Ring
    else if (device.category === 'smart_ring') {
      samples.push(HealthDataNormalizer.normalizeHeartRate({
        userId,
        bpm: 58 + Math.floor(Math.random() * 6),
        isResting: true,
        channel: device.channel,
        deviceId: `sim_${device.id}`,
        deviceName: device.name,
        deviceType: device.category,
        manufacturer: device.manufacturer,
      }));

      samples.push(HealthDataNormalizer.normalizeOxygenSaturation({
        userId,
        percentage: 98,
        channel: device.channel,
        deviceId: `sim_${device.id}`,
        deviceName: device.name,
        deviceType: device.category,
        manufacturer: device.manufacturer,
      }));

      samples.push({
        id: `sleep_${Date.now()}`,
        userId,
        metric: 'sleep_duration_seconds',
        value: 7.5 * 3600, // 7.5 hours
        unit: 'seconds',
        timestamp: now.toISOString(),
        sourceChannel: device.channel,
        sourceDeviceId: `sim_${device.id}`,
        sourceDeviceName: device.name,
        sourceDeviceType: device.category,
        sourceManufacturer: device.manufacturer,
        confidence: 0.94,
      });
    }

    // Smartwatch / Fitness Band
    else if (device.category === 'smartwatch' || device.category === 'fitness_band') {
      samples.push(HealthDataNormalizer.normalizeHeartRate({
        userId,
        bpm: 72 + Math.floor(Math.random() * 10),
        isResting: false,
        channel: device.channel,
        deviceId: `sim_${device.id}`,
        deviceName: device.name,
        deviceType: device.category,
        manufacturer: device.manufacturer,
      }));

      samples.push(HealthDataNormalizer.normalizeOxygenSaturation({
        userId,
        percentage: 97 + Math.floor(Math.random() * 3),
        channel: device.channel,
        deviceId: `sim_${device.id}`,
        deviceName: device.name,
        deviceType: device.category,
        manufacturer: device.manufacturer,
      }));

      samples.push({
        id: `steps_${Date.now()}`,
        userId,
        metric: 'steps',
        value: 4820 + Math.floor(Math.random() * 2500),
        unit: 'count',
        timestamp: now.toISOString(),
        sourceChannel: device.channel,
        sourceDeviceId: `sim_${device.id}`,
        sourceDeviceName: device.name,
        sourceDeviceType: device.category,
        sourceManufacturer: device.manufacturer,
        confidence: 0.90,
      });
    }

    // Smart Scale
    else if (device.category === 'smart_scale') {
      samples.push(HealthDataNormalizer.normalizeWeight({
        userId,
        weight: 68.5,
        unit: 'kg',
        channel: device.channel,
        deviceId: `sim_${device.id}`,
        deviceName: device.name,
        deviceType: device.category,
        manufacturer: device.manufacturer,
      }));
    }

    // Pulse Oximeter
    else if (device.category === 'pulse_oximeter') {
      samples.push(HealthDataNormalizer.normalizeOxygenSaturation({
        userId,
        percentage: 99,
        channel: device.channel,
        deviceId: `sim_${device.id}`,
        deviceName: device.name,
        deviceType: device.category,
        manufacturer: device.manufacturer,
      }));

      samples.push(HealthDataNormalizer.normalizeHeartRate({
        userId,
        bpm: 70,
        channel: device.channel,
        deviceId: `sim_${device.id}`,
        deviceName: device.name,
        deviceType: device.category,
        manufacturer: device.manufacturer,
      }));
    }

    return samples;
  }
}
