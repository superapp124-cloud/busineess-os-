/**
 * CHATR HEALTH OS — DeviceRegistry
 * ============================================================================
 * Exhaustive catalog of supported biometrics devices, medical monitors,
 * smart rings, smartwatches, and OS aggregators.
 *
 * Organized strictly around the 6 core categories:
 *   1. Wearables (Apple Watch, Garmin, Fitbit, Samsung, WHOOP, Polar, Suunto)
 *   2. Rings (Oura, Samsung Galaxy Ring, Ultrahuman, RingConn)
 *   3. Medical (BP monitors, glucose meters, CGMs, pulse oximeters, thermometers)
 *   4. Body (Smart scales, body composition devices)
 *   5. Sleep (Sleep trackers, sleep rings, dedicated sleep devices)
 *   6. Fitness (Heart-rate straps, exercise equipment, cycling computers)
 *
 * CONNECTION HONESTY PRINCIPLE:
 *   Never claim native direct connection unless the direct Bluetooth GATT
 *   or direct Cloud API driver is tested and working. For devices that sync
 *   via companion apps (e.g. Samsung Health -> Health Connect), honestly state
 *   the aggregator pathway.
 * ============================================================================
 */

import { DeviceMetadata, PrimaryDeviceCategory } from './DeviceTypes';

export const DEVICE_REGISTRY: DeviceMetadata[] = [
  // ──────────────────────────────────────────────────────────────────────────
  // 1. WEARABLES
  // ──────────────────────────────────────────────────────────────────────────
  {
    id: 'apple_watch',
    name: 'Apple Watch (Series 4–10 / Ultra)',
    primaryCategory: 'wearables',
    category: 'smartwatch',
    manufacturer: 'Apple',
    channel: 'healthkit',
    connectionMode: 'platform_aggregator',
    connectionHonesty: {
      tier: 'companion_app_sync',
      summary: 'Syncs biometrics via Apple HealthKit with user permission.',
      verifiedDirect: false,
    },
    supportedMetrics: [
      'heart_rate',
      'resting_heart_rate',
      'hrv',
      'oxygen_saturation',
      'steps',
      'active_calories',
      'sleep_duration_seconds',
      'deep_sleep_seconds',
      'rem_sleep_seconds',
      'respiratory_rate',
    ],
    icon: 'Apple',
    description: 'ECG, optical heart rate, blood oxygen, wrist temperature, and sleep stages via Apple HealthKit.',
    availability: 'available_now',
    pairingGuide: 'Authorize CHATR in iOS Settings → Health → Data Access & Devices.',
  },
  {
    id: 'samsung_galaxy_watch',
    name: 'Samsung Galaxy Watch (4 / 5 / 6 / 7 / Ultra)',
    primaryCategory: 'wearables',
    category: 'smartwatch',
    manufacturer: 'Samsung',
    channel: 'health_connect',
    connectionMode: 'platform_aggregator',
    connectionHonesty: {
      tier: 'companion_app_sync',
      summary: 'Syncs via Samsung Health export to Android Health Connect.',
      verifiedDirect: false,
    },
    supportedMetrics: [
      'heart_rate',
      'resting_heart_rate',
      'hrv',
      'blood_pressure_systolic',
      'blood_pressure_diastolic',
      'oxygen_saturation',
      'steps',
      'active_calories',
      'sleep_duration_seconds',
      'deep_sleep_seconds',
      'rem_sleep_seconds',
      'body_temperature',
      'body_weight_kg',
    ],
    icon: 'Watch',
    description: 'BioActive sensor suite tracking heart rate, blood pressure, sleep apnea detection, and BIA body comp.',
    availability: 'available_now',
    pairingGuide: 'In Samsung Health App, go to Settings → Health Connect → Allow all permissions.',
  },
  {
    id: 'garmin_smartwatch',
    name: 'Garmin Watches (Forerunner / Fenix / Venu / Epix)',
    primaryCategory: 'wearables',
    category: 'smartwatch',
    manufacturer: 'Garmin',
    channel: 'health_connect',
    connectionMode: 'platform_aggregator',
    connectionHonesty: {
      tier: 'companion_app_sync',
      summary: 'Syncs via Garmin Connect export to Android Health Connect.',
      verifiedDirect: false,
    },
    supportedMetrics: [
      'heart_rate',
      'resting_heart_rate',
      'hrv',
      'oxygen_saturation',
      'steps',
      'active_calories',
      'sleep_duration_seconds',
      'deep_sleep_seconds',
      'rem_sleep_seconds',
      'respiratory_rate',
    ],
    icon: 'Watch',
    description: 'Elevate optical heart rate, Body Battery energy monitor, HRV status, and Pulse Ox acclimation.',
    availability: 'available_now',
    pairingGuide: 'In Garmin Connect app, go to Settings → Connected Apps → Health Connect and turn On.',
  },
  {
    id: 'google_pixel_watch',
    name: 'Google Pixel Watch (1 / 2 / 3)',
    primaryCategory: 'wearables',
    category: 'smartwatch',
    manufacturer: 'Google',
    channel: 'health_connect',
    connectionMode: 'platform_aggregator',
    connectionHonesty: {
      tier: 'companion_app_sync',
      summary: 'Syncs via Fitbit companion app through Android Health Connect.',
      verifiedDirect: false,
    },
    supportedMetrics: [
      'heart_rate',
      'resting_heart_rate',
      'hrv',
      'oxygen_saturation',
      'steps',
      'active_calories',
      'sleep_duration_seconds',
      'deep_sleep_seconds',
      'rem_sleep_seconds',
      'body_temperature',
      'respiratory_rate',
    ],
    icon: 'Watch',
    description: 'Fitbit multi-path optical sensor providing continuous heart rate, cEDA stress, and daily readiness.',
    availability: 'available_now',
    pairingGuide: 'Turn on Health Connect integration in the Fitbit app.',
  },
  {
    id: 'whoop_strap',
    name: 'WHOOP 4.0',
    primaryCategory: 'wearables',
    category: 'fitness_band',
    manufacturer: 'WHOOP',
    channel: 'health_connect',
    connectionMode: 'platform_aggregator',
    connectionHonesty: {
      tier: 'companion_app_sync',
      summary: 'Syncs via WHOOP companion app export to Android Health Connect.',
      verifiedDirect: false,
    },
    supportedMetrics: [
      'heart_rate',
      'resting_heart_rate',
      'hrv',
      'oxygen_saturation',
      'sleep_duration_seconds',
      'deep_sleep_seconds',
      'rem_sleep_seconds',
      'body_temperature',
      'respiratory_rate',
    ],
    icon: 'Activity',
    description: '24/7 biometric tracking focused on recovery, strain, sleep performance, and baseline deviations.',
    availability: 'available_now',
    pairingGuide: 'In WHOOP App, go to More → Integrations → Health Connect and enable All Data.',
  },
  {
    id: 'polar_wearable',
    name: 'Polar Vantage / Grit X / Pacer',
    primaryCategory: 'wearables',
    category: 'smartwatch',
    manufacturer: 'Polar Electro',
    channel: 'health_connect',
    connectionMode: 'platform_aggregator',
    connectionHonesty: {
      tier: 'companion_app_sync',
      summary: 'Syncs via Polar Flow export to Android Health Connect.',
      verifiedDirect: false,
    },
    supportedMetrics: [
      'heart_rate',
      'resting_heart_rate',
      'hrv',
      'steps',
      'active_calories',
      'sleep_duration_seconds',
      'deep_sleep_seconds',
      'rem_sleep_seconds',
    ],
    icon: 'Watch',
    description: 'Precision Prime sensor fusion, Nightly Recharge recovery, and autonomic nervous system (ANS) charge.',
    availability: 'available_now',
    pairingGuide: 'Enable Health Connect sync in Polar Flow App Settings.',
  },
  {
    id: 'suunto_watch',
    name: 'Suunto (Race / Vertical / 9 Peak)',
    primaryCategory: 'wearables',
    category: 'smartwatch',
    manufacturer: 'Suunto',
    channel: 'health_connect',
    connectionMode: 'platform_aggregator',
    connectionHonesty: {
      tier: 'companion_app_sync',
      summary: 'Syncs via Suunto app export to Android Health Connect.',
      verifiedDirect: false,
    },
    supportedMetrics: [
      'heart_rate',
      'resting_heart_rate',
      'hrv',
      'steps',
      'active_calories',
      'sleep_duration_seconds',
      'oxygen_saturation',
    ],
    icon: 'Watch',
    description: 'Outdoor biometric tracking, HRV recovery measurements, altitude acclimation, and training load.',
    availability: 'available_now',
    pairingGuide: 'In Suunto App, go to Settings → Connected Services → Health Connect.',
  },

  // ──────────────────────────────────────────────────────────────────────────
  // 2. RINGS
  // ──────────────────────────────────────────────────────────────────────────
  {
    id: 'oura_ring',
    name: 'Oura Ring (Gen 3 / Gen 4)',
    primaryCategory: 'rings',
    category: 'smart_ring',
    manufacturer: 'Oura Health',
    channel: 'cloud_partner',
    connectionMode: 'cloud_partner',
    connectionHonesty: {
      tier: 'cloud_oauth',
      summary: 'Direct live REST API OAuth 2.0 connection to Oura Cloud servers.',
      verifiedDirect: true,
    },
    supportedMetrics: [
      'heart_rate',
      'resting_heart_rate',
      'hrv',
      'oxygen_saturation',
      'sleep_duration_seconds',
      'deep_sleep_seconds',
      'rem_sleep_seconds',
      'body_temperature',
      'respiratory_rate',
    ],
    icon: 'CircleDot',
    description: 'Medical-grade sleep stages, nighttime resting HR, HRV baseline, and skin temperature variations.',
    availability: 'available_now',
    pairingGuide: 'Provide your personal Oura Cloud Access Token to link your sleep and recovery data directly.',
  },
  {
    id: 'samsung_galaxy_ring',
    name: 'Samsung Galaxy Ring',
    primaryCategory: 'rings',
    category: 'smart_ring',
    manufacturer: 'Samsung',
    channel: 'health_connect',
    connectionMode: 'platform_aggregator',
    connectionHonesty: {
      tier: 'companion_app_sync',
      summary: 'Syncs via Samsung Health export to Android Health Connect.',
      verifiedDirect: false,
    },
    supportedMetrics: [
      'heart_rate',
      'resting_heart_rate',
      'hrv',
      'oxygen_saturation',
      'sleep_duration_seconds',
      'deep_sleep_seconds',
      'rem_sleep_seconds',
      'body_temperature',
      'steps',
    ],
    icon: 'CircleDot',
    description: 'Continuous Energy Score, sleep apnea detection, skin temperature tracking, and heart rate alerts.',
    availability: 'available_now',
    pairingGuide: 'Ensure Samsung Health is connected to Android Health Connect.',
  },
  {
    id: 'ultrahuman_ring_air',
    name: 'Ultrahuman Ring AIR',
    primaryCategory: 'rings',
    category: 'smart_ring',
    manufacturer: 'Ultrahuman',
    channel: 'health_connect',
    connectionMode: 'platform_aggregator',
    connectionHonesty: {
      tier: 'companion_app_sync',
      summary: 'Syncs via Ultrahuman app export to Android Health Connect.',
      verifiedDirect: false,
    },
    supportedMetrics: [
      'heart_rate',
      'resting_heart_rate',
      'hrv',
      'sleep_duration_seconds',
      'deep_sleep_seconds',
      'rem_sleep_seconds',
      'body_temperature',
      'steps',
    ],
    icon: 'CircleDot',
    description: 'Circadian rhythm tracking, movement index, recovery score, and skin temperature trends.',
    availability: 'available_now',
    pairingGuide: 'Link Ultrahuman App with Health Connect to automatically mirror vitals to CHATR Health OS.',
  },
  {
    id: 'ringconn_smart_ring',
    name: 'RingConn Gen 1 / Gen 2',
    primaryCategory: 'rings',
    category: 'smart_ring',
    manufacturer: 'RingConn',
    channel: 'health_connect',
    connectionMode: 'platform_aggregator',
    connectionHonesty: {
      tier: 'companion_app_sync',
      summary: 'Syncs via RingConn companion app export to Health Connect.',
      verifiedDirect: false,
    },
    supportedMetrics: [
      'heart_rate',
      'resting_heart_rate',
      'hrv',
      'oxygen_saturation',
      'sleep_duration_seconds',
      'deep_sleep_seconds',
      'rem_sleep_seconds',
    ],
    icon: 'CircleDot',
    description: 'Continuous SpO2, stress monitoring, and comprehensive sleep stage breakdown.',
    availability: 'available_now',
  },

  // ──────────────────────────────────────────────────────────────────────────
  // 3. MEDICAL (BP, Glucose/CGM, Pulse Oximeter, Thermometer)
  // ──────────────────────────────────────────────────────────────────────────
  {
    id: 'omron_evolv_ble',
    name: 'Omron Evolv / Complete (BLE)',
    primaryCategory: 'medical',
    category: 'blood_pressure_monitor',
    manufacturer: 'Omron Healthcare',
    channel: 'bluetooth_le',
    connectionMode: 'native_ble',
    connectionHonesty: {
      tier: 'direct_live',
      summary: 'Direct native Bluetooth Smart connection using SIG 0x1810 Blood Pressure Service.',
      verifiedDirect: true,
    },
    supportedMetrics: [
      'blood_pressure_systolic',
      'blood_pressure_diastolic',
      'heart_rate',
    ],
    icon: 'Heart',
    description: 'Wireless upper arm oscillometric blood pressure monitor with direct Bluetooth Smart (SIG 0x1810) syncing.',
    availability: 'ready_to_pair',
    pairingGuide: 'Press and hold the Connection button on your Omron cuff until the Bluetooth symbol flashes.',
    bleServiceUuids: ['00001810-0000-1000-8000-00805f9b34fb'],
  },
  {
    id: 'generic_ble_bp',
    name: 'Standard Bluetooth BP Monitor (SIG 0x1810)',
    primaryCategory: 'medical',
    category: 'blood_pressure_monitor',
    manufacturer: 'Bluetooth SIG Standard (Beurer, Microlife, Rossmax)',
    channel: 'bluetooth_le',
    connectionMode: 'native_ble',
    connectionHonesty: {
      tier: 'direct_live',
      summary: 'Direct native BLE connection conforming to the official Bluetooth SIG 0x1810 standard.',
      verifiedDirect: true,
    },
    supportedMetrics: [
      'blood_pressure_systolic',
      'blood_pressure_diastolic',
      'heart_rate',
    ],
    icon: 'Heart',
    description: 'Any certified Bluetooth Low Energy blood pressure cuff conforming to the official Bluetooth SIG standard.',
    availability: 'ready_to_pair',
    bleServiceUuids: ['00001810-0000-1000-8000-00805f9b34fb'],
  },
  {
    id: 'dexcom_cgm',
    name: 'Dexcom G6 / G7 CGM',
    primaryCategory: 'medical',
    category: 'continuous_glucose_monitor',
    manufacturer: 'Dexcom',
    channel: 'health_connect',
    connectionMode: 'platform_aggregator',
    connectionHonesty: {
      tier: 'companion_app_sync',
      summary: 'Syncs via Dexcom G7 companion app export to Health Connect.',
      verifiedDirect: false,
    },
    supportedMetrics: [
      'blood_glucose',
    ],
    icon: 'Droplet',
    description: 'Real-time interstitial glucose monitoring with 5-minute sampling and predictive excursion alerts.',
    availability: 'available_now',
    pairingGuide: 'Enable "Health Connect Sharing" in Dexcom G7 App Settings → Connections.',
  },
  {
    id: 'abbott_freestyle_libre',
    name: 'Abbott FreeStyle Libre 2 / 3',
    primaryCategory: 'medical',
    category: 'continuous_glucose_monitor',
    manufacturer: 'Abbott',
    channel: 'health_connect',
    connectionMode: 'platform_aggregator',
    connectionHonesty: {
      tier: 'companion_app_sync',
      summary: 'Syncs via FreeStyle LibreLink export to Health Connect.',
      verifiedDirect: false,
    },
    supportedMetrics: [
      'blood_glucose',
    ],
    icon: 'Droplet',
    description: 'Continuous minute-by-minute glucose readings with trend arrows and ambulatory glucose profile.',
    availability: 'available_now',
    pairingGuide: 'Enable Health Connect export within LibreLink settings.',
  },
  {
    id: 'accuchek_guide_ble',
    name: 'Accu-Chek Guide (Bluetooth Glucose)',
    primaryCategory: 'medical',
    category: 'continuous_glucose_monitor',
    manufacturer: 'Roche Diabetes Care',
    channel: 'bluetooth_le',
    connectionMode: 'native_ble',
    connectionHonesty: {
      tier: 'direct_live',
      summary: 'Direct native Bluetooth connection conforming to SIG 0x1808 Glucose Service.',
      verifiedDirect: true,
    },
    supportedMetrics: [
      'blood_glucose',
    ],
    icon: 'Droplet',
    description: 'Clinical blood glucose meter with direct Bluetooth Low Energy transmission.',
    availability: 'ready_to_pair',
    bleServiceUuids: ['00001808-0000-1000-8000-00805f9b34fb'],
  },
  {
    id: 'generic_ble_oximeter',
    name: 'Bluetooth Pulse Oximeter (SIG 0x1822)',
    primaryCategory: 'medical',
    category: 'pulse_oximeter',
    manufacturer: 'Wellue / Nonin / Contec',
    channel: 'bluetooth_le',
    connectionMode: 'native_ble',
    connectionHonesty: {
      tier: 'direct_live',
      summary: 'Direct native BLE telemetry conforming to Bluetooth SIG 0x1822 Pulse Oximeter profile.',
      verifiedDirect: true,
    },
    supportedMetrics: [
      'oxygen_saturation',
      'heart_rate',
    ],
    icon: 'Activity',
    description: 'Certified fingertip or continuous pulse oximeter reporting SpO2 and pulse over Bluetooth LE.',
    availability: 'ready_to_pair',
    bleServiceUuids: ['00001822-0000-1000-8000-00805f9b34fb'],
  },
  {
    id: 'smart_ble_thermometer',
    name: 'Smart Clinical Thermometer (SIG 0x1809)',
    primaryCategory: 'medical',
    category: 'smart_thermometer',
    manufacturer: 'Bluetooth SIG Standard (Braun / Withings / Kinsa)',
    channel: 'bluetooth_le',
    connectionMode: 'native_ble',
    connectionHonesty: {
      tier: 'direct_live',
      summary: 'Direct native BLE telemetry using SIG 0x1809 Health Thermometer profile.',
      verifiedDirect: true,
    },
    supportedMetrics: [
      'body_temperature',
    ],
    icon: 'Activity',
    description: 'Instant infrared temporal or tympanic clinical thermometer broadcasting body temperature.',
    availability: 'ready_to_pair',
    bleServiceUuids: ['00001809-0000-1000-8000-00805f9b34fb'],
  },

  // ──────────────────────────────────────────────────────────────────────────
  // 4. BODY (Smart Scales & Body Composition)
  // ──────────────────────────────────────────────────────────────────────────
  {
    id: 'generic_ble_scale',
    name: 'Bluetooth Smart Scale (SIG 0x181D)',
    primaryCategory: 'body',
    category: 'smart_scale',
    manufacturer: 'Bluetooth SIG Standard (Mi, Eufy, Renpho)',
    channel: 'bluetooth_le',
    connectionMode: 'native_ble',
    connectionHonesty: {
      tier: 'direct_live',
      summary: 'Direct native BLE connection conforming to Bluetooth SIG 0x181D Weight Scale profile.',
      verifiedDirect: true,
    },
    supportedMetrics: [
      'body_weight_kg',
    ],
    icon: 'Scale',
    description: 'Any standard Bluetooth weight scale broadcasting the official SIG Weight Scale profile.',
    availability: 'ready_to_pair',
    bleServiceUuids: ['0000181d-0000-1000-8000-00805f9b34fb'],
  },
  {
    id: 'withings_body_scale',
    name: 'Withings Body Smart / Comp Scale',
    primaryCategory: 'body',
    category: 'smart_scale',
    manufacturer: 'Withings',
    channel: 'health_connect',
    connectionMode: 'platform_aggregator',
    connectionHonesty: {
      tier: 'companion_app_sync',
      summary: 'Syncs via Withings companion app export to Health Connect.',
      verifiedDirect: false,
    },
    supportedMetrics: [
      'body_weight_kg',
    ],
    icon: 'Scale',
    description: 'Precision body weight, body composition analysis, visceral fat, and standing vascular age.',
    availability: 'available_now',
    pairingGuide: 'Syncs automatically via Health Connect through the Withings companion app.',
  },

  // ──────────────────────────────────────────────────────────────────────────
  // 5. SLEEP (Dedicated Sleep Devices & Trackers)
  // ──────────────────────────────────────────────────────────────────────────
  {
    id: 'withings_sleep_mat',
    name: 'Withings Sleep Analyzer (Under-Mattress Mat)',
    primaryCategory: 'sleep',
    category: 'sleep_tracker',
    manufacturer: 'Withings',
    channel: 'health_connect',
    connectionMode: 'platform_aggregator',
    connectionHonesty: {
      tier: 'companion_app_sync',
      summary: 'Under-mattress pneumatic sensor syncing sleep cycles & apnea via Health Connect.',
      verifiedDirect: false,
    },
    supportedMetrics: [
      'sleep_duration_seconds',
      'deep_sleep_seconds',
      'rem_sleep_seconds',
      'heart_rate',
      'respiratory_rate',
    ],
    icon: 'Moon',
    description: 'Non-wearable sleep tracking detecting sleep stages, continuous heart rate, snoring, and sleep apnea episodes.',
    availability: 'available_now',
    pairingGuide: 'Enable Health Connect export in Withings app.',
  },

  // ──────────────────────────────────────────────────────────────────────────
  // 6. FITNESS (Heart-Rate Straps, Cycling Computers, Equipment)
  // ──────────────────────────────────────────────────────────────────────────
  {
    id: 'polar_h10_ble',
    name: 'Polar H10 / Verity Sense (BLE Heart Rate)',
    primaryCategory: 'fitness',
    category: 'fitness_band',
    manufacturer: 'Polar Electro',
    channel: 'bluetooth_le',
    connectionMode: 'native_ble',
    connectionHonesty: {
      tier: 'direct_live',
      summary: 'Direct native Bluetooth connection conforming to SIG 0x180D Heart Rate Service.',
      verifiedDirect: true,
    },
    supportedMetrics: [
      'heart_rate',
      'hrv',
    ],
    icon: 'Activity',
    description: 'Gold-standard ECG chest strap monitoring millisecond-accurate R-R interval HRV and heart rate.',
    availability: 'ready_to_pair',
    bleServiceUuids: ['0000180d-0000-1000-8000-00805f9b34fb'],
    pairingGuide: 'Moisten strap electrode pads, put on strap, and tap Pair to scan for Bluetooth Heart Rate devices.',
  },
  {
    id: 'garmin_hrm_ble',
    name: 'Garmin HRM-Pro / Dual (BLE Heart Rate)',
    primaryCategory: 'fitness',
    category: 'fitness_band',
    manufacturer: 'Garmin',
    channel: 'bluetooth_le',
    connectionMode: 'native_ble',
    connectionHonesty: {
      tier: 'direct_live',
      summary: 'Direct native Bluetooth connection conforming to SIG 0x180D Heart Rate Service.',
      verifiedDirect: true,
    },
    supportedMetrics: [
      'heart_rate',
      'hrv',
    ],
    icon: 'Activity',
    description: 'Dual-transmission chest strap providing accurate heart rate and running dynamics over Bluetooth LE.',
    availability: 'ready_to_pair',
    bleServiceUuids: ['0000180d-0000-1000-8000-00805f9b34fb'],
  },
  {
    id: 'wahoo_cycling_ble',
    name: 'Wahoo ELEMNT / KICKR (Cycling BLE)',
    primaryCategory: 'fitness',
    category: 'fitness_band',
    manufacturer: 'Wahoo Fitness',
    channel: 'health_connect',
    connectionMode: 'platform_aggregator',
    connectionHonesty: {
      tier: 'companion_app_sync',
      summary: 'Syncs cycling power, cadence, and heart rate workouts via Health Connect.',
      verifiedDirect: false,
    },
    supportedMetrics: [
      'heart_rate',
      'active_calories',
    ],
    icon: 'Activity',
    description: 'GPS cycling computer and smart trainer recording endurance workouts and cardiovascular load.',
    availability: 'available_now',
  },
];

export function getDeviceById(id: string): DeviceMetadata | undefined {
  return DEVICE_REGISTRY.find(d => d.id === id);
}

export function getDevicesByPrimaryCategory(category: PrimaryDeviceCategory | 'all'): DeviceMetadata[] {
  if (category === 'all') return DEVICE_REGISTRY;
  return DEVICE_REGISTRY.filter(d => d.primaryCategory === category);
}

export function getDevicesByCategory(category: string): DeviceMetadata[] {
  if (category === 'all') return DEVICE_REGISTRY;
  return DEVICE_REGISTRY.filter(d => d.category === category || d.primaryCategory === category);
}
