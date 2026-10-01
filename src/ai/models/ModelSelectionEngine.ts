/**
 * CHATR SI OS — Model Selection Engine
 * src/ai/models/ModelSelectionEngine.ts
 *
 * Dynamically selects the optimal model based on device telemetry,
 * task complexity, and privacy sensitivity.
 */

import { ModelDefinition, TaskComplexity } from './types';
import { modelRegistry } from './ModelRegistry';
import { DeviceTelemetry } from '../runtime/DeviceCapabilityEngine';
import { PrivacyClassification } from '../privacy/types';

export interface ModelSelectionCriteria {
  telemetry: DeviceTelemetry;
  taskComplexity: TaskComplexity;
  privacy: PrivacyClassification;
  forceLocal?: boolean;
}

export interface ModelSelectionResult {
  selectedModel: ModelDefinition;
  reason: string;
  isLocal: boolean;
  requiresCloud: boolean;
}

export class ModelSelectionEngine {
  private static instance: ModelSelectionEngine;

  private constructor() {}

  public static getInstance(): ModelSelectionEngine {
    if (!ModelSelectionEngine.instance) {
      ModelSelectionEngine.instance = new ModelSelectionEngine();
    }
    return ModelSelectionEngine.instance;
  }

  public selectModel(criteria: ModelSelectionCriteria): ModelSelectionResult {
    const { telemetry, taskComplexity, privacy, forceLocal } = criteria;
    const defaultLocal = modelRegistry.getDefaultLocalModel();
    const cloudModel = modelRegistry.getModel('CHATR-CLOUD-GATEWAY')!;

    // 1. Critical Health Events: Handled by Deterministic Health OS + Minimal Model
    if (taskComplexity === 'CRITICAL_SAFETY') {
      return {
        selectedModel: defaultLocal,
        reason: 'Critical safety event: Deterministic Health OS pipeline with local explanation only.',
        isLocal: true,
        requiresCloud: false,
      };
    }

    // 2. Sensitive / Private data: STRICTLY Local Model
    if (privacy === 'HIGHLY_SENSITIVE' || privacy === 'SENSITIVE' || privacy === 'PRIVATE' || forceLocal) {
      return {
        selectedModel: defaultLocal,
        reason: `Privacy level '${privacy}' enforces strictly on-device processing. Zero data egress.`,
        isLocal: true,
        requiresCloud: false,
      };
    }

    // 3. Simple Tasks & Normal Conversations: Local Model
    if (taskComplexity === 'SIMPLE_COMMAND' || taskComplexity === 'CONVERSATION' || taskComplexity === 'HEALTH_EXPLANATION') {
      return {
        selectedModel: defaultLocal,
        reason: 'Local-first execution for private command and conversational flow.',
        isLocal: true,
        requiresCloud: false,
      };
    }

    // 4. Complex Reasoning / Web Search: If PUBLIC and network available -> Cloud Gateway
    if (taskComplexity === 'COMPLEX_REASONING' && privacy === 'PUBLIC' && !telemetry.isBatteryLow) {
      return {
        selectedModel: cloudModel,
        reason: 'Public complex reasoning task dispatched to extended Cloud Gateway.',
        isLocal: false,
        requiresCloud: true,
      };
    }

    // Default Local
    return {
      selectedModel: defaultLocal,
      reason: 'Standard local-first policy.',
      isLocal: true,
      requiresCloud: false,
    };
  }
}

export const modelSelectionEngine = ModelSelectionEngine.getInstance();
