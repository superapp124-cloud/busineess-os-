/**
 * CHATR HEALTH OS — OuraCloudAdapter
 *
 * Real Cloud API integration for Oura Ring Gen 3 / Gen 4.
 *
 * Oura does not expose raw Bluetooth GATT profiles on Android/iOS without
 * proprietary firmware encryption. The official and only supported path to read
 * real Oura Ring telemetry is via the Oura Cloud REST API v2.
 *
 * Documentation: https://cloud.ouraring.com/v2/docs
 */

import { NormalizedHealthSample } from '../DeviceTypes';
import { HealthDataNormalizer } from '../HealthDataNormalizer';

export interface OuraUserInfo {
  id: string;
  email: string;
  age?: number;
  weight?: number;
  height?: number;
}

export class OuraCloudAdapter {
  private static BASE_URL = 'https://api.ouraring.com/v2/usercollection';
  private static STORAGE_KEY = 'chatr_health_oura_token_v1';

  static getSavedToken(): string | null {
    return localStorage.getItem(this.STORAGE_KEY);
  }

  static saveToken(token: string) {
    localStorage.setItem(this.STORAGE_KEY, token.trim());
  }

  static clearToken() {
    localStorage.removeItem(this.STORAGE_KEY);
  }

  /**
   * Validates a Personal Access Token directly against the live Oura Cloud API
   */
  static async validateToken(token: string): Promise<{
    valid: boolean;
    user?: OuraUserInfo;
    error?: string;
  }> {
    try {
      const res = await fetch(`${this.BASE_URL}/personal_info`, {
        headers: {
          Authorization: `Bearer ${token.trim()}`,
        },
      });

      if (!res.ok) {
        if (res.status === 401) {
          return { valid: false, error: 'Unauthorized: Invalid or expired Oura Personal Access Token.' };
        }
        return { valid: false, error: `Oura API error (HTTP ${res.status}): ${res.statusText}` };
      }

      const data = await res.json();
      return { valid: true, user: data };
    } catch (e) {
      return { valid: false, error: `Connection failed: ${String(e)}` };
    }
  }

  /**
   * Pulls real daily sleep and recovery metrics from Oura Cloud API
   */
  static async fetchRecentSleep(
    token: string,
    userId: string,
    daysBack = 7
  ): Promise<NormalizedHealthSample[]> {
    const end = new Date();
    const start = new Date(Date.now() - daysBack * 24 * 60 * 60 * 1000);

    const startDateStr = start.toISOString().split('T')[0];
    const endDateStr = end.toISOString().split('T')[0];

    const url = `${this.BASE_URL}/daily_sleep?start_date=${startDateStr}&end_date=${endDateStr}`;
    const res = await fetch(url, {
      headers: {
        Authorization: `Bearer ${token.trim()}`,
      },
    });

    if (!res.ok) {
      throw new Error(`Failed to fetch Oura sleep data: HTTP ${res.status}`);
    }

    const json = await res.json();
    const dataList = json.data || [];
    const samples: NormalizedHealthSample[] = [];

    for (const record of dataList) {
      const ts = record.day ? `${record.day}T08:00:00.000Z` : new Date().toISOString();

      // Sleep duration
      if (record.contributors?.total_sleep) {
        samples.push({
          id: `oura_sleep_${record.id || record.day}`,
          userId,
          metric: 'sleep_duration_seconds',
          value: record.contributors.total_sleep,
          unit: 'seconds',
          timestamp: ts,
          sourceChannel: 'cloud_partner',
          sourceDeviceId: 'oura_ring_cloud',
          sourceDeviceName: 'Oura Ring Gen 3/4',
          sourceDeviceType: 'smart_ring',
          sourceManufacturer: 'Oura Health',
          confidence: 0.96,
          rawPayload: record,
        });
      }

      // Deep sleep
      if (record.contributors?.deep_sleep) {
        samples.push({
          id: `oura_deep_${record.id || record.day}`,
          userId,
          metric: 'deep_sleep_seconds',
          value: record.contributors.deep_sleep,
          unit: 'seconds',
          timestamp: ts,
          sourceChannel: 'cloud_partner',
          sourceDeviceId: 'oura_ring_cloud',
          sourceDeviceName: 'Oura Ring Gen 3/4',
          sourceDeviceType: 'smart_ring',
          sourceManufacturer: 'Oura Health',
          confidence: 0.95,
        });
      }

      // REM sleep
      if (record.contributors?.rem_sleep) {
        samples.push({
          id: `oura_rem_${record.id || record.day}`,
          userId,
          metric: 'rem_sleep_seconds',
          value: record.contributors.rem_sleep,
          unit: 'seconds',
          timestamp: ts,
          sourceChannel: 'cloud_partner',
          sourceDeviceId: 'oura_ring_cloud',
          sourceDeviceName: 'Oura Ring Gen 3/4',
          sourceDeviceType: 'smart_ring',
          sourceManufacturer: 'Oura Health',
          confidence: 0.95,
        });
      }
    }

    return samples;
  }
}
