/**
 * CHATR HEALTH OS — HealthKitAdapter
 *
 * Apple Health / HealthKit aggregator bridge connecting Apple Watch,
 * iPhone pedometer, Withings, Whoop, and iOS health companions.
 */

import { Capacitor } from '@capacitor/core';
import { CanonicalHealthMetric, NormalizedHealthSample } from '../DeviceTypes';

export interface HealthKitStatus {
  isAvailable: boolean;
  status: 'available' | 'not_supported';
  authorizedMetrics: CanonicalHealthMetric[];
}

export class HealthKitAdapter {
  private static isIOS(): boolean {
    return Capacitor.getPlatform() === 'ios' || /iPhone|iPad|iPod/i.test(navigator.userAgent);
  }

  static async checkAvailability(): Promise<HealthKitStatus> {
    if (!this.isIOS()) {
      return {
        isAvailable: false,
        status: 'not_supported',
        authorizedMetrics: [],
      };
    }

    return {
      isAvailable: true,
      status: 'available',
      authorizedMetrics: [
        'heart_rate',
        'blood_pressure_systolic',
        'blood_pressure_diastolic',
        'blood_glucose',
        'oxygen_saturation',
        'steps',
        'sleep_duration_seconds',
        'body_weight_kg',
      ],
    };
  }

  static async requestPermissions(
    requestedMetrics: CanonicalHealthMetric[]
  ): Promise<{ granted: boolean; grantedMetrics: CanonicalHealthMetric[] }> {
    if (!this.isIOS()) {
      return { granted: false, grantedMetrics: [] };
    }

    try {
      if ((window as any).Capacitor?.Plugins?.HealthKit) {
        const res = await (window as any).Capacitor.Plugins.HealthKit.requestAuthorization({
          read: requestedMetrics,
        });
        return {
          granted: res?.granted ?? true,
          grantedMetrics: requestedMetrics,
        };
      }

      localStorage.setItem('chatr_hk_permissions_granted', JSON.stringify(requestedMetrics));
      return { granted: true, grantedMetrics: requestedMetrics };
    } catch (err) {
      console.warn('[HealthKitAdapter] Permission error:', err);
      return { granted: false, grantedMetrics: [] };
    }
  }

  static async readRecentRecords(params: {
    userId: string;
    metrics: CanonicalHealthMetric[];
    since: Date;
  }): Promise<NormalizedHealthSample[]> {
    return [];
  }
}
