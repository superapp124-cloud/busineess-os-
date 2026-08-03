import { evaluationEngine } from './EvaluationEngine';
import { pilotMetrics } from './PilotMetrics';
import { evidenceRegistry } from './EvidenceRegistry';
import {
  EvaluationSection,
  TargetVsPrototypeMatrixRow,
  MaturityProgress,
  PersonaEvidenceSummary,
  JourneyEvidenceRecord,
} from './EvaluationTypes';

export class CustomerEvidenceFramework {
  private static instance: CustomerEvidenceFramework;

  private constructor() {}

  public static getInstance(): CustomerEvidenceFramework {
    if (!CustomerEvidenceFramework.instance) {
      CustomerEvidenceFramework.instance = new CustomerEvidenceFramework();
    }
    return CustomerEvidenceFramework.instance;
  }

  public getEvaluationSections(): EvaluationSection[] {
    return evaluationEngine.getEvaluationSections();
  }

  public getTargetVsPrototypeMatrix(): TargetVsPrototypeMatrixRow[] {
    return evaluationEngine.getTargetVsPrototypeMatrix();
  }

  public getMaturityProgress(): MaturityProgress {
    return evaluationEngine.calculateMaturityProgress();
  }

  public getPersonaSummaries(): PersonaEvidenceSummary[] {
    return evaluationEngine.getPersonaSummaries();
  }

  public getJourneys(): JourneyEvidenceRecord[] {
    return evidenceRegistry.getJourneys();
  }

  public getPilotMetrics() {
    return pilotMetrics.getAllMetrics();
  }
}

export const customerEvidenceFramework = CustomerEvidenceFramework.getInstance();
