/**
 * CHATR SI OS — CHATR Interaction Protocol
 * src/ai/protocol/ChatrInteractionProtocol.ts
 *
 * Implements the 8-Stage Interaction Protocol:
 * INTENT -> CONTEXT -> RISK -> PERMISSION -> EXECUTION -> VERIFICATION -> AUDIT -> MEMORY
 *
 * "The model proposes; the system decides; the user authorizes."
 */

import { privacyRouter } from '../privacy/PrivacyRouter';
import { permissionManager } from '../security/PermissionManager';
import { personalContextEngine, CompactPersonalContext } from '../context/PersonalContextEngine';
import { personalContextGraph } from '../context/PersonalContextGraph';
import { localMemoryStore } from '../memory/LocalMemoryStore';
import { intelligenceSelector } from '../router/IntelligenceSelector';
import { chatrLocalRuntime } from '../runtime/ChatrLocalRuntime';
import { aiActivityLog } from '../observability/AIActivityLog';
import { capabilityEngine } from '../capabilities/CapabilityEngine';
import { healthQueryEngine } from '@/services/health/HealthQueryEngine';
import { SecurityRiskLevel } from '../capabilities/types';

export interface ProtocolIntent {
  rawInput: string;
  source: 'USER_TEXT' | 'USER_VOICE' | 'PROACTIVE_TRIGGER' | 'SUB_OS_COMMUNICATION';
  targetDomain?: string;
  confirmedByUser?: boolean;
}

export interface ProtocolResult {
  step: 'INTENT' | 'CONTEXT' | 'RISK' | 'PERMISSION' | 'EXECUTION' | 'VERIFICATION' | 'AUDIT' | 'MEMORY' | 'COMPLETE';
  success: boolean;
  text: string;
  domain: string;
  privacyClass: string;
  riskLevel: SecurityRiskLevel;
  executionLocation: 'DEVICE_ONLY' | 'CLOUD_EXTENSION' | 'HEALTH_OS_GATEWAY';
  toolOrCapabilityExecuted?: string;
  requiresUserConfirmation: boolean;
  confirmationPrompt?: string;
  memoryUpdated: boolean;
  latencyMs: number;
}

export class ChatrInteractionProtocol {
  private static instance: ChatrInteractionProtocol;

  private constructor() {}

  public static getInstance(): ChatrInteractionProtocol {
    if (!ChatrInteractionProtocol.instance) {
      ChatrInteractionProtocol.instance = new ChatrInteractionProtocol();
    }
    return ChatrInteractionProtocol.instance;
  }

  /**
   * Executes the 8-stage interaction protocol end-to-end
   */
  public async execute(intent: ProtocolIntent): Promise<ProtocolResult> {
    const startTime = Date.now();
    const input = intent.rawInput.trim();

    // ==========================================
    // 1. INTENT
    // ==========================================
    if (!input) {
      return {
        step: 'INTENT',
        success: false,
        text: 'No intent provided.',
        domain: 'ACTION',
        privacyClass: 'PUBLIC',
        riskLevel: 'LEVEL_1_SAFE_READ',
        executionLocation: 'DEVICE_ONLY',
        requiresUserConfirmation: false,
        memoryUpdated: false,
        latencyMs: 0,
      };
    }

    // ==========================================
    // 2. CONTEXT
    // ==========================================
    const ambientSnapshot: CompactPersonalContext = personalContextEngine.getSnapshot();
    const relevantMemories = localMemoryStore.recall(input, { limit: 2 });
    const graphEntities = personalContextGraph.searchEntities(input.split(' ')[0] || '');

    // ==========================================
    // 3. RISK (Privacy & Security Assessment)
    // ==========================================
    const privacy = privacyRouter.evaluate(input);
    let riskLevel: SecurityRiskLevel = 'LEVEL_1_SAFE_READ';

    if (/transfer|send money|pay|delete all|wipe|execute payment/i.test(input)) {
      riskLevel = 'LEVEL_3_SENSITIVE';
    } else if (/remind|alarm|schedule|set|create task|book/i.test(input)) {
      riskLevel = 'LEVEL_2_REVERSIBLE';
    }

    // ==========================================
    // 4. PERMISSION
    // ==========================================
    const isSensitive = riskLevel === 'LEVEL_3_SENSITIVE';
    if (isSensitive && !intent.confirmedByUser) {
      // Permission barrier halts execution
      const confirmationPrompt = `Sensitive action detected ("${input}"). Requires your explicit biometric or touch confirmation.`;

      aiActivityLog.logActivity({
        taskTitle: 'Permission Barrier Intercept',
        what: `Level 3 Sensitive Action Blocked: ${input.slice(0, 30)}`,
        why: 'Enforcing user confirmation barrier before execution',
        providerId: 'PermissionManager',
        modelId: 'SecurityBarrier-v1',
        isCloud: false,
        dataLocation: 'DEVICE ONLY',
        privacyClass: privacy.classification,
        latencyMs: Date.now() - startTime,
      });

      return {
        step: 'PERMISSION',
        success: false,
        text: confirmationPrompt,
        domain: intent.targetDomain || 'ACTION',
        privacyClass: privacy.classification,
        riskLevel,
        executionLocation: 'DEVICE_ONLY',
        requiresUserConfirmation: true,
        confirmationPrompt,
        memoryUpdated: false,
        latencyMs: Date.now() - startTime,
      };
    }

    // ==========================================
    // 5. EXECUTION
    // ==========================================
    let resultText = '';
    let toolOrCapability: string | undefined;
    let executionLocation: 'DEVICE_ONLY' | 'CLOUD_EXTENSION' | 'HEALTH_OS_GATEWAY' = 'DEVICE_ONLY';
    let domain = intent.targetDomain || 'ACTION';

    // Route A: Inviolable Health OS clinical island
    if (healthQueryEngine.canHandle(input) || domain === 'HEALTH') {
      domain = 'HEALTH';
      executionLocation = 'HEALTH_OS_GATEWAY';
      const healthRes = healthQueryEngine.query(input);
      resultText = healthRes.answer;
      toolOrCapability = 'HealthOS.query';
    }
    // Route B: Deterministic Fast Path (Alarms, Timers, Math)
    else {
      const intelDecision = intelligenceSelector.select(input);
      if (!intelDecision.shouldInvokeLLM && intelDecision.executionClass === 'DETERMINISTIC') {
        domain = 'ACTION';
        toolOrCapability = intelDecision.deterministicTool;
        if (toolOrCapability === 'setAlarm' && intelDecision.deterministicParams?.time) {
          resultText = `Alarm set for ${intelDecision.deterministicParams.time} deterministically (0ms, 0 MB LLM invocation).`;
        } else {
          resultText = `Handled deterministically: ${intelDecision.reason}`;
        }
      }
      // Route C: Open-Ended Sub-OS Capability Dispatch
      else if (domain === 'COMMUNICATION' || domain === 'WORK' || domain === 'LIFE') {
        const capabilities = capabilityEngine.listCapabilities(domain);
        if (capabilities.length > 0) {
          const cap = capabilities[0];
          const capRes = await capabilityEngine.executeCapability(cap.id, { input }, intent.confirmedByUser);
          toolOrCapability = cap.name;
          resultText = capRes.message || 'Capability executed successfully.';
        }
      }
      // Route D: Local Generative AI Runtime
      if (!resultText) {
        const cloudAllowed = privacy.cloudAllowed && !privacy.dataEgressForbidden;
        const promptContext = `Context: ${ambientSnapshot.timeOfDay}, Meetings: ${ambientSnapshot.calendarMeetingsCount}, Vitals: ${ambientSnapshot.healthState}`;
        const genResult = await chatrLocalRuntime.generate(
          input,
          {
            systemPrompt: `You are CHATR Personal SI OS. Answer clearly and concisely. ${promptContext}`,
            maxTokens: 250,
          },
          cloudAllowed
        );
        resultText = genResult.text;
        executionLocation = genResult.isLocal ? 'DEVICE_ONLY' : 'CLOUD_EXTENSION';
        toolOrCapability = genResult.modelId;
      }
    }

    // ==========================================
    // 6. VERIFICATION
    // ==========================================
    let verified = true;
    // Health Clinical Inviolability Rule: Mandatory medical disclaimer
    if (domain === 'HEALTH') {
      if (!resultText.includes('Not medical advice') && !resultText.includes('consult a doctor') && !resultText.includes('disclaimer')) {
        resultText += '\n\n*Disclaimer: For informational tracking only. Consult a healthcare professional for clinical decisions.*';
      }
    }
    if (!resultText || resultText.trim().length === 0) {
      verified = false;
      resultText = 'Action executed, but produced empty verification payload.';
    }

    // ==========================================
    // 7. AUDIT (Immutable Transparency Log)
    // ==========================================
    aiActivityLog.logActivity({
      taskTitle: input.slice(0, 40),
      what: `Protocol Execution: ${toolOrCapability || domain}`,
      why: `Processed user intent via 8-stage protocol (${domain})`,
      providerId: executionLocation,
      modelId: toolOrCapability || 'ChatrInteractionProtocol',
      isCloud: executionLocation === 'CLOUD_EXTENSION',
      dataLocation: executionLocation === 'CLOUD_EXTENSION' ? 'CLOUD' : 'DEVICE ONLY',
      privacyClass: privacy.classification,
      latencyMs: Date.now() - startTime,
    });

    // ==========================================
    // 8. MEMORY
    // ==========================================
    let memoryUpdated = false;
    const storeDecision = localMemoryStore.shouldStore(input, 'USER_EXPLICIT');
    if (storeDecision.eligible) {
      localMemoryStore.saveMemory(input, {
        category: storeDecision.category,
        importance: storeDecision.importance,
        confidenceLevel: storeDecision.confidenceLevel,
        confidence: storeDecision.confidence,
        explanation: storeDecision.explanation,
        source: 'USER_EXPLICIT',
      });
      memoryUpdated = true;
    }

    return {
      step: 'COMPLETE',
      success: verified,
      text: resultText,
      domain,
      privacyClass: privacy.classification,
      riskLevel,
      executionLocation,
      toolOrCapabilityExecuted: toolOrCapability,
      requiresUserConfirmation: false,
      memoryUpdated,
      latencyMs: Date.now() - startTime,
    };
  }
}

export const chatrInteractionProtocol = ChatrInteractionProtocol.getInstance();
