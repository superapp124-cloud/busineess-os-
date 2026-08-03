export interface PilotMetricRecord {
  metricId: string;
  metricName: string;
  category: 'Onboarding' | 'TaskCompletion' | 'Retention' | 'ROI' | 'CSAT';
  targetValue: string;
  measuredPilotValue?: string;
  status: 'PilotHypothesis' | 'InPilotValidation' | 'EmpiricallyVerified';
  validationRequired: string;
}

/**
 * PilotMetrics Registry
 * Tracks observable customer pilot metrics for Phase C validation.
 * Unmeasured metrics remain strictly marked as 'PilotHypothesis'.
 */
export class PilotMetrics {
  private static instance: PilotMetrics;

  private metrics: PilotMetricRecord[] = [
    {
      metricId: 'pm_001',
      metricName: 'Self-Service Onboarding Completion Rate',
      category: 'Onboarding',
      targetValue: '> 85% users complete without assistance',
      status: 'PilotHypothesis',
      validationRequired: 'Track percentage of pilot users completing first-run wizard without support tickets',
    },
    {
      metricId: 'pm_002',
      metricName: 'Time-to-First-Task Completion',
      category: 'TaskCompletion',
      targetValue: '< 3 minutes from first login',
      status: 'PilotHypothesis',
      validationRequired: 'Measure session duration from initial authentication to first DAG completion',
    },
    {
      metricId: 'pm_003',
      metricName: 'Daily Morning Habit Retention Rate',
      category: 'Retention',
      targetValue: '> 75% users open CHATR first every morning',
      status: 'PilotHypothesis',
      validationRequired: 'Analyze login timestamp distribution relative to legacy email/chat applications',
    },
    {
      metricId: 'pm_004',
      metricName: 'Employee Hours Saved per Month',
      category: 'ROI',
      targetValue: '~2 hours saved per employee daily',
      status: 'PilotHypothesis',
      validationRequired: 'Conduct 4-week time-motion study across 5 pilot sites comparing pre/post app-switching',
    },
    {
      metricId: 'pm_005',
      metricName: 'User Satisfaction Rating (CSAT)',
      category: 'CSAT',
      targetValue: '≥ 4.5 / 5.0 Rating',
      status: 'PilotHypothesis',
      validationRequired: 'Deploy in-app micro-surveys at 7-day, 30-day, and 90-day pilot milestones',
    },
  ];

  private constructor() {}

  public static getInstance(): PilotMetrics {
    if (!PilotMetrics.instance) {
      PilotMetrics.instance = new PilotMetrics();
    }
    return PilotMetrics.instance;
  }

  public getAllMetrics(): PilotMetricRecord[] {
    return [...this.metrics];
  }
}

export const pilotMetrics = PilotMetrics.getInstance();
