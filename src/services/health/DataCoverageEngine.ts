/**
 * CHATR HEALTH OS — DataCoverageEngine
 *
 * Quantifies data coverage across major biometric and clinical domains.
 * Crucial Invariant:
 *   Data Coverage describes the completeness and depth of available data.
 *   It is NOT a health score and never punishes users for missing sensors.
 *   If data is insufficient, it reports: "Building your baseline".
 */

import { localHealthStore } from './LocalHealthStore';
import { deviceSyncManager } from './devices/DeviceSyncManager';

export type CoverageLevel = 'high' | 'medium' | 'low' | 'none';

export interface DomainCoverageInfo {
  domainKey: 'heart' | 'sleep' | 'activity' | 'blood_pressure' | 'glucose' | 'weight' | 'labs';
  label: string;
  level: CoverageLevel;
  badgeColor: string;
  sampleCount7d: number;
  hasConnectedDevice: boolean;
  statusText: string;
}

export interface OverallDataCoverage {
  status: 'building_baseline' | 'active_monitoring' | 'comprehensive';
  headline: string;
  domains: DomainCoverageInfo[];
  connectedDeviceCount: number;
}

export class DataCoverageEngine {
  public static evaluate(
    vitalsHistory: Array<{ metric: string; timestamp: string }> = [],
    labsCount: number = 0
  ): OverallDataCoverage {
    const connectedDevices = deviceSyncManager.getConnectedDevices();
    const coverageSummary = deviceSyncManager.getCoverageSummary();

    const now = Date.now();
    const sevenDaysAgo = now - 7 * 24 * 60 * 60 * 1000;

    const count7d = (metricPattern: string) => {
      return vitalsHistory.filter((v) => {
        const matches = v.metric.toLowerCase().includes(metricPattern);
        const inTime = new Date(v.timestamp).getTime() >= sevenDaysAgo;
        return matches && inTime;
      }).length;
    };

    const heartSamples = count7d('heart') + count7d('hrv');
    const sleepSamples = count7d('sleep');
    const activitySamples = count7d('step') + count7d('activ');
    const bpSamples = count7d('blood_pressure') + count7d('systolic');
    const glucoseSamples = count7d('glucose') + count7d('sugar');
    const weightSamples = count7d('weight');

    const getLevel = (count: number, hasDevice: boolean): { level: CoverageLevel; badge: string; text: string } => {
      if (count >= 14 || (hasDevice && count >= 7)) {
        return { level: 'high', badge: 'bg-emerald-100 text-emerald-800', text: 'Active monitoring' };
      }
      if (count >= 3 || hasDevice) {
        return { level: 'medium', badge: 'bg-blue-100 text-blue-800', text: 'Building baseline' };
      }
      if (count > 0) {
        return { level: 'low', badge: 'bg-amber-100 text-amber-800', text: 'Sparse data' };
      }
      return { level: 'none', badge: 'bg-slate-100 text-slate-600', text: 'Not connected' };
    };

    const heartLvl = getLevel(heartSamples, coverageSummary.heartRate);
    const sleepLvl = getLevel(sleepSamples, coverageSummary.sleep);
    const activityLvl = getLevel(activitySamples, coverageSummary.activity);
    const bpLvl = getLevel(bpSamples, coverageSummary.bloodPressure);
    const glucoseLvl = getLevel(glucoseSamples, coverageSummary.glucose);
    const weightLvl = getLevel(weightSamples, coverageSummary.weight);
    const labsLvl = labsCount > 0
      ? { level: 'high' as CoverageLevel, badge: 'bg-emerald-100 text-emerald-800', text: `${labsCount} records` }
      : { level: 'none' as CoverageLevel, badge: 'bg-slate-100 text-slate-600', text: 'No lab records' };

    const domains: DomainCoverageInfo[] = [
      { domainKey: 'heart', label: 'Heart & Rhythm', level: heartLvl.level, badgeColor: heartLvl.badge, sampleCount7d: heartSamples, hasConnectedDevice: coverageSummary.heartRate, statusText: heartLvl.text },
      { domainKey: 'sleep', label: 'Sleep & Recovery', level: sleepLvl.level, badgeColor: sleepLvl.badge, sampleCount7d: sleepSamples, hasConnectedDevice: coverageSummary.sleep, statusText: sleepLvl.text },
      { domainKey: 'activity', label: 'Daily Activity', level: activityLvl.level, badgeColor: activityLvl.badge, sampleCount7d: activitySamples, hasConnectedDevice: coverageSummary.activity, statusText: activityLvl.text },
      { domainKey: 'blood_pressure', label: 'Blood Pressure', level: bpLvl.level, badgeColor: bpLvl.badge, sampleCount7d: bpSamples, hasConnectedDevice: coverageSummary.bloodPressure, statusText: bpLvl.text },
      { domainKey: 'glucose', label: 'Blood Glucose', level: glucoseLvl.level, badgeColor: glucoseLvl.badge, sampleCount7d: glucoseSamples, hasConnectedDevice: coverageSummary.glucose, statusText: glucoseLvl.text },
      { domainKey: 'weight', label: 'Body Metrics', level: weightLvl.level, badgeColor: weightLvl.badge, sampleCount7d: weightSamples, hasConnectedDevice: coverageSummary.weight, statusText: weightLvl.text },
      { domainKey: 'labs', label: 'Diagnostic Labs', level: labsLvl.level, badgeColor: labsLvl.badge, sampleCount7d: labsCount, hasConnectedDevice: false, statusText: labsLvl.text },
    ];

    const highOrMedCount = domains.filter((d) => d.level === 'high' || d.level === 'medium').length;

    let overallStatus: 'building_baseline' | 'active_monitoring' | 'comprehensive' = 'building_baseline';
    let headline = 'Building your personal baseline';

    if (highOrMedCount >= 4) {
      overallStatus = 'comprehensive';
      headline = 'Comprehensive health monitoring active';
    } else if (highOrMedCount >= 1) {
      overallStatus = 'active_monitoring';
      headline = 'Active baseline monitoring in progress';
    }

    return {
      status: overallStatus,
      headline,
      domains,
      connectedDeviceCount: connectedDevices.length,
    };
  }
}
