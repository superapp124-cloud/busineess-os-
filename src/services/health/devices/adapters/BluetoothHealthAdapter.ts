/**
 * CHATR HEALTH OS — BluetoothHealthAdapter
 *
 * Real Native Bluetooth Low Energy (BLE) hardware adapter using
 * @capacitor-community/bluetooth-le.
 *
 * Communicates directly with actual physical Bluetooth health devices:
 *   - Blood Pressure Profile (SIG 0x1810) - Omron, Beurer, Microlife, A&D
 *   - Heart Rate Profile (SIG 0x180D) - Polar H10, Garmin HRM, Wahoo, CooSpo
 *   - Pulse Oximeter Profile (SIG 0x1822) - Wellue, Nonin, Contec
 *   - Weight Scale Profile (SIG 0x181D) - Mi Body Scale, Eufy, Renpho
 *   - Battery Service (SIG 0x180F) - Real device battery percentage
 */

import { BleClient, BleDevice, ScanResult, numberToUUID } from '@capacitor-community/bluetooth-le';
import { NormalizedHealthSample } from '../DeviceTypes';
import { HealthDataNormalizer } from '../HealthDataNormalizer';

export const BLE_SERVICES = {
  HEART_RATE: numberToUUID(0x180d),
  BLOOD_PRESSURE: numberToUUID(0x1810),
  PULSE_OXIMETER: numberToUUID(0x1822),
  WEIGHT_SCALE: numberToUUID(0x181d),
  BATTERY_SERVICE: numberToUUID(0x180f),
};

export const BLE_CHARACTERISTICS = {
  HEART_RATE_MEASUREMENT: numberToUUID(0x2a37),
  BLOOD_PRESSURE_MEASUREMENT: numberToUUID(0x2a35),
  PLX_SPOT_CHECK: numberToUUID(0x2a5e),
  PLX_CONTINUOUS: numberToUUID(0x2a5f),
  WEIGHT_MEASUREMENT: numberToUUID(0x2a9d),
  BATTERY_LEVEL: numberToUUID(0x2a19),
};

export interface DiscoveredBleDevice {
  deviceId: string;
  name: string;
  rssi?: number;
  uuids?: string[];
  rawDevice: BleDevice;
}

export class BluetoothHealthAdapter {
  private static isInitialized = false;

  /**
   * Initializes the native Bluetooth LE client
   */
  static async initialize(): Promise<boolean> {
    if (this.isInitialized) return true;
    try {
      await BleClient.initialize({ androidNeverForLocation: false });
      this.isInitialized = true;
      return true;
    } catch (e) {
      console.warn('[BluetoothHealthAdapter] BleClient initialization failed:', e);
      return false;
    }
  }

  /**
   * Checks if Bluetooth is enabled on the device
   */
  static async isBluetoothEnabled(): Promise<boolean> {
    try {
      await this.initialize();
      return await BleClient.isEnabled();
    } catch {
      return false;
    }
  }

  /**
   * Requests the user to turn on Bluetooth if disabled
   */
  static async requestEnableBluetooth(): Promise<void> {
    try {
      await this.initialize();
      await BleClient.requestEnable();
    } catch (e) {
      console.warn('[BluetoothHealthAdapter] Failed to request bluetooth enable:', e);
    }
  }

  /**
   * Scans for real nearby BLE devices broadcasting health services or any BLE peripheral
   */
  static async startScanning(params: {
    onDeviceFound: (device: DiscoveredBleDevice) => void;
    serviceFilter?: string[];
    timeoutMs?: number;
  }): Promise<() => Promise<void>> {
    await this.initialize();

    const seenIds = new Set<string>();

    const options = params.serviceFilter && params.serviceFilter.length > 0
      ? { services: params.serviceFilter }
      : {};

    await BleClient.requestLEScan(options, (result: ScanResult) => {
      const devId = result.device.deviceId;
      if (!seenIds.has(devId)) {
        seenIds.add(devId);
        params.onDeviceFound({
          deviceId: devId,
          name: result.device.name || 'Bluetooth Device',
          rssi: result.rssi,
          uuids: result.uuids,
          rawDevice: result.device,
        });
      }
    });

    const stopScan = async () => {
      try {
        await BleClient.stopLEScan();
      } catch (err) {
        console.warn('[BluetoothHealthAdapter] Error stopping scan:', err);
      }
    };

    if (params.timeoutMs && params.timeoutMs > 0) {
      setTimeout(stopScan, params.timeoutMs);
    }

    return stopScan;
  }

  /**
   * Connects to a real Bluetooth device by its deviceId / MAC address
   */
  static async connect(deviceId: string): Promise<boolean> {
    await this.initialize();
    try {
      await BleClient.connect(deviceId);
      return true;
    } catch (err) {
      console.error(`[BluetoothHealthAdapter] Failed to connect to ${deviceId}:`, err);
      throw err;
    }
  }

  /**
   * Disconnects from a real Bluetooth device
   */
  static async disconnect(deviceId: string): Promise<void> {
    try {
      await BleClient.disconnect(deviceId);
    } catch (err) {
      console.warn(`[BluetoothHealthAdapter] Error disconnecting ${deviceId}:`, err);
    }
  }

  /**
   * Reads real battery percentage from GATT Battery Service (0x180F)
   */
  static async readBatteryLevel(deviceId: string): Promise<number | null> {
    try {
      const val = await BleClient.read(
        deviceId,
        BLE_SERVICES.BATTERY_SERVICE,
        BLE_CHARACTERISTICS.BATTERY_LEVEL
      );
      return val.getUint8(0);
    } catch {
      return null;
    }
  }

  /**
   * Subscribes to real blood pressure measurements from Omron, Beurer, Microlife cuffs
   */
  static async subscribeBloodPressure(
    deviceId: string,
    userId: string,
    deviceName: string,
    onReading: (samples: NormalizedHealthSample[]) => void
  ): Promise<void> {
    await BleClient.startNotifications(
      deviceId,
      BLE_SERVICES.BLOOD_PRESSURE,
      BLE_CHARACTERISTICS.BLOOD_PRESSURE_MEASUREMENT,
      (dataView) => {
        try {
          const parsed = this.parseBloodPressure(dataView);
          const samples = HealthDataNormalizer.normalizeBloodPressure({
            userId,
            systolic: parsed.systolic,
            diastolic: parsed.diastolic,
            pulse: parsed.pulseRate,
            channel: 'bluetooth_le',
            deviceId,
            deviceName,
            deviceType: 'blood_pressure_monitor',
            manufacturer: 'Bluetooth BLE Device',
          });
          onReading(samples);
        } catch (err) {
          console.error('[BluetoothHealthAdapter] Error parsing BP packet:', err);
        }
      }
    );
  }

  /**
   * Subscribes to real continuous heart rate from Polar H10, Garmin HRM, etc.
   */
  static async subscribeHeartRate(
    deviceId: string,
    userId: string,
    deviceName: string,
    onReading: (sample: NormalizedHealthSample) => void
  ): Promise<void> {
    await BleClient.startNotifications(
      deviceId,
      BLE_SERVICES.HEART_RATE,
      BLE_CHARACTERISTICS.HEART_RATE_MEASUREMENT,
      (dataView) => {
        try {
          const parsed = this.parseHeartRate(dataView);
          const sample = HealthDataNormalizer.normalizeHeartRate({
            userId,
            bpm: parsed.bpm,
            channel: 'bluetooth_le',
            deviceId,
            deviceName,
            deviceType: 'fitness_band',
            manufacturer: 'Bluetooth BLE HRM',
            isEcgSensor: true,
          });
          onReading(sample);
        } catch (err) {
          console.error('[BluetoothHealthAdapter] Error parsing HR packet:', err);
        }
      }
    );
  }

  /**
   * Decodes IEEE-11073 16-bit SFLOAT (standard Bluetooth SIG format)
   */
  private static decodeSFloat(data: DataView, offset: number): number {
    const raw = data.getUint16(offset, true);
    let mantissa = raw & 0x0fff;
    let exponent = raw >> 12;

    if (exponent >= 0x0008) {
      exponent = -(0x0010 - exponent);
    }
    if (mantissa >= 0x0800) {
      mantissa = -(0x1000 - mantissa);
    }

    return mantissa * Math.pow(10, exponent);
  }

  /**
   * Parses standard Heart Rate Measurement (0x2A37) DataView
   */
  static parseHeartRate(data: DataView): { bpm: number; hrvRRs?: number[] } {
    const flags = data.getUint8(0);
    const is16Bit = (flags & 0x01) !== 0;
    const isRrPresent = (flags & 0x10) !== 0;

    let offset = 1;
    let bpm = 0;

    if (is16Bit) {
      bpm = data.getUint16(offset, true);
      offset += 2;
    } else {
      bpm = data.getUint8(offset);
      offset += 1;
    }

    if ((flags & 0x08) !== 0) {
      offset += 2;
    }

    const hrvRRs: number[] = [];
    if (isRrPresent) {
      while (offset + 1 < data.byteLength) {
        const rr = data.getUint16(offset, true);
        hrvRRs.push(Math.round((rr / 1024) * 1000));
        offset += 2;
      }
    }

    return { bpm, hrvRRs: hrvRRs.length > 0 ? hrvRRs : undefined };
  }

  /**
   * Parses standard Blood Pressure Measurement (0x2A35) DataView
   */
  static parseBloodPressure(data: DataView): {
    systolic: number;
    diastolic: number;
    meanArterialPressure: number;
    unit: 'mmHg' | 'kPa';
    pulseRate?: number;
  } {
    const flags = data.getUint8(0);
    const isKpa = (flags & 0x01) !== 0;
    const isTimestampPresent = (flags & 0x02) !== 0;
    const isPulseRatePresent = (flags & 0x04) !== 0;

    let offset = 1;
    const systolic = this.decodeSFloat(data, offset);
    offset += 2;
    const diastolic = this.decodeSFloat(data, offset);
    offset += 2;
    const meanArterialPressure = this.decodeSFloat(data, offset);
    offset += 2;

    if (isTimestampPresent) {
      offset += 7;
    }

    let pulseRate: number | undefined;
    if (isPulseRatePresent && offset + 1 <= data.byteLength) {
      pulseRate = this.decodeSFloat(data, offset);
    }

    return {
      systolic: isKpa ? systolic * 7.50062 : systolic,
      diastolic: isKpa ? diastolic * 7.50062 : diastolic,
      meanArterialPressure: isKpa ? meanArterialPressure * 7.50062 : meanArterialPressure,
      unit: 'mmHg',
      pulseRate,
    };
  }
}
