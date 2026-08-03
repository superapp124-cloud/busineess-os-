import { openTelemetryExporter } from '../telemetry/OpenTelemetryExporter';

export interface EnterpriseProcess {
  id: string;
  name: string;
  category: 'H2R' | 'Q2C' | 'O2C' | 'P2P' | 'R2R' | 'S2C' | 'IncidentToResolution' | 'Custom';
  tenantId: string;
  status: 'DRAFT' | 'ACTIVE' | 'SUSPENDED' | 'COMPLETED' | 'FAILED';
  startedAt: number;
  completedAt?: number;
  missionIds: string[];
  slaBudgetHours: number;
  consumedHours: number;
}

/**
 * Business Process Engine (Layer Above Missions)
 * Orchestrates multi-month, multi-department enterprise processes (e.g. Hire-to-Retire, Quote-to-Cash)
 * containing multiple governed Missions across departments.
 */
export class ProcessEngine {
  private static instance: ProcessEngine;
  private processes = new Map<string, EnterpriseProcess>();

  private constructor() {}

  public static getInstance(): ProcessEngine {
    if (!ProcessEngine.instance) {
      ProcessEngine.instance = new ProcessEngine();
    }
    return ProcessEngine.instance;
  }

  public createProcess(params: {
    name: string;
    category: EnterpriseProcess['category'];
    tenantId: string;
    slaBudgetHours?: number;
  }): EnterpriseProcess {
    const processId = `proc_${Date.now()}_${crypto.randomUUID().slice(0, 8)}`;
    const span = openTelemetryExporter.startSpan('Process.Create', undefined, {
      processId,
      name: params.name,
      category: params.category,
      tenantId: params.tenantId,
    });

    const process: EnterpriseProcess = {
      id: processId,
      name: params.name,
      category: params.category,
      tenantId: params.tenantId,
      status: 'ACTIVE',
      startedAt: Date.now(),
      missionIds: [],
      slaBudgetHours: params.slaBudgetHours || 720, // Default 30-day SLA budget
      consumedHours: 0,
    };

    this.processes.set(processId, process);

    openTelemetryExporter.log('INFO', `Enterprise Process Created: ${params.name} (${processId})`, {
      traceId: span.traceId,
      spanId: span.spanId,
      tenantId: params.tenantId,
      attributes: { process },
    });

    openTelemetryExporter.endSpan(span.spanId, 'OK');
    return process;
  }

  public bindMissionToProcess(processId: string, missionId: string): void {
    const proc = this.processes.get(processId);
    if (proc) {
      if (!proc.missionIds.includes(missionId)) {
        proc.missionIds.push(missionId);
      }
    }
  }

  public getProcess(processId: string): EnterpriseProcess | undefined {
    return this.processes.get(processId);
  }

  public getProcessesForTenant(tenantId: string): EnterpriseProcess[] {
    return Array.from(this.processes.values()).filter(p => p.tenantId === tenantId);
  }
}

export const processEngine = ProcessEngine.getInstance();
