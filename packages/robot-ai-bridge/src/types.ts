/**
 * CHATR Robot AI Bridge Types (Gate 7)
 * Defines contracts for multi-lingual intent parsing, local Ollama integration,
 * spatial grounding, deterministic task validation, and operational AI explanation.
 */

import { Vector3 } from '../../robot-physics/src/math/vector3';
import { HouseholdCategory } from '../../robot-perception/src/types';

export type IndianLanguage =
  | 'en' // English
  | 'hi' // Hindi (हिन्दी)
  | 'ur' // Urdu (اردو)
  | 'pa' // Punjabi (ਪੰਜਾਬੀ)
  | 'bn' // Bengali (বাংলা)
  | 'ta' // Tamil (தமிழ்)
  | 'te'; // Telugu (తెలుగు)

export type HighLevelIntent =
  | 'FETCH_OBJECT'
  | 'INSPECT_OBJECT'
  | 'CLEAN_SURFACE'
  | 'PATROL_ROOM'
  | 'GREET_USER'
  | 'STATUS_QUERY'
  | 'EMERGENCY_STOP'
  | 'UNKNOWN';

export interface StructuredRobotTask {
  taskId: string;
  intent: HighLevelIntent;
  targetCategory: HouseholdCategory | 'unknown';
  sourceLocation: string;
  destinationLocation: string;
  parameters: Record<string, any>;
  rawUserPrompt: string;
  detectedLanguage: IndianLanguage;
  isAmbiguousReference: boolean;
  resolvedObjectId?: string;
}

export type TaskValidationStatus =
  | 'VALID_AND_EXECUTABLE'
  | 'BLOCKED_CAPABILITY_MISMATCH'
  | 'BLOCKED_OBJECT_NOT_FOUND'
  | 'BLOCKED_LOW_PERCEPTION_CONFIDENCE'
  | 'BLOCKED_UNREACHABLE_WORKSPACE'
  | 'BLOCKED_SAFETY_VIOLATION'
  | 'BLOCKED_BATTERY_LOW';

export interface ValidatedRobotTaskPlan {
  task: StructuredRobotTask;
  validationStatus: TaskValidationStatus;
  isApprovedForExecution: boolean;
  subTasks: Array<{
    stepIndex: number;
    subTaskType: 'NAVIGATE' | 'PERCEIVE' | 'ALIGN' | 'GRASP' | 'VERIFY_GRASP' | 'LIFT' | 'HANDOVER';
    targetLocationOrId: string;
    description: string;
  }>;
  explanation: string;
  rejectionReason?: string;
}

export interface OllamaGenerateResponse {
  intent: HighLevelIntent;
  targetCategory: HouseholdCategory | 'unknown';
  sourceLocation: string;
  destinationLocation: string;
  isAmbiguous: boolean;
  confidence: number;
  explanation: string;
}

export interface LanguageDetectionResult {
  language: IndianLanguage;
  confidence: number;
  isTransliteratedRoman: boolean;
  normalizedText: string;
}
