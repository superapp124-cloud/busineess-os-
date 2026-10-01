/**
 * CHATR SI OS — Personal Agent (Phase 7 Personal AI Device Intelligence)
 * src/ai/agents/PersonalAgent.ts
 *
 * Implements the enhanced 11-step Personal Agent Loop:
 * UNDERSTAND -> CLASSIFY -> RETRIEVE MEMORY -> CHECK PRIVACY -> SELECT MODEL
 * -> SELECT TOOLS -> CHECK PERMISSION -> EXECUTE -> OBSERVE -> UPDATE MEMORY -> RESPOND
 *
 * Enforces:
 * - Deterministic fast-path when LLM is not needed (IntelligenceSelector)
 * - Compact ambient context injection (PersonalContextEngine)
 * - Local Context Graph entity tracking (PersonalContextGraph)
 * - Anti-hallucination memory policy (SmartMemory)
 * - Health OS clinical boundary inviolability
 */

import { chatrLocalRuntime } from '../runtime/ChatrLocalRuntime';
import { deviceCapabilityEngine } from '../runtime/DeviceCapabilityEngine';
import { privacyRouter } from '../privacy/PrivacyRouter';
import { modelSelectionEngine } from '../models/ModelSelectionEngine';
import { localMemoryStore } from '../memory/LocalMemoryStore';
import { localKnowledgeEngine } from '../rag/LocalKnowledgeEngine';
import { chatrToolRegistry } from '../tools/ChatrToolRegistry';
import { permissionManager } from '../security/PermissionManager';
import { preferenceStore } from '../personalization/PreferenceStore';
import { aiActivityLog } from '../observability/AIActivityLog';
import { personalContextEngine } from '../context/PersonalContextEngine';
import { personalContextGraph } from '../context/PersonalContextGraph';
import { intelligenceSelector } from '../router/IntelligenceSelector';
import { healthQueryEngine } from '@/services/health/HealthQueryEngine';
import { capabilityEngine, CapabilityEngine } from '../capabilities/CapabilityEngine';
import { communicationIntelligence, CommunicationIntelligence } from '../communication/CommunicationIntelligence';
import { chatrInteractionProtocol, ChatrInteractionProtocol, ProtocolIntent, ProtocolResult } from '../protocol/ChatrInteractionProtocol';

export interface AgentResponse {
  text: string;
  source: 'LOCAL' | 'CLOUD' | 'FALLBACK';
  modelId: string;
  privacyClass: string;
  toolExecuted?: string;
  memoryUpdated: boolean;
  latencyMs: number;
}

export class PersonalAgent {
  private static instance: PersonalAgent;
  readonly agentId = 'chatr-personal-agent-v1';

  private constructor() {}

  public static getInstance(): PersonalAgent {
    if (!PersonalAgent.instance) {
      PersonalAgent.instance = new PersonalAgent();
    }
    return PersonalAgent.instance;
  }

  /**
   * Main 11-Step Agent Execution Loop
   */
  public async process(userInput: string): Promise<AgentResponse> {
    const startTime = Date.now();
    const prefs = preferenceStore.getPreferences();

    // 1. UNDERSTAND
    const normalizedInput = userInput.trim();

    // 2. CLASSIFY (Privacy & Intent)
    const privacyDecision = privacyRouter.evaluate(normalizedInput);

    // Deterministic Fast-Path: AI should know when NOT to use AI!
    const intelDecision = intelligenceSelector.select(normalizedInput);
    if (!intelDecision.shouldInvokeLLM && intelDecision.executionClass === 'DETERMINISTIC') {
      const toolName = intelDecision.deterministicTool;
      let text = `Handled deterministically without LLM battery drain: ${intelDecision.reason}`;
      if (toolName === 'setAlarm' && intelDecision.deterministicParams?.time) {
        text = `Alarm set for ${intelDecision.deterministicParams.time}.`;
      } else if (toolName === 'getSystemTime') {
        text = `Current time is ${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}.`;
      }

      aiActivityLog.logActivity({
        taskTitle: normalizedInput.slice(0, 40),
        what: `Deterministic ${toolName || 'Action'}`,
        why: intelDecision.reason,
        providerId: 'heuristic',
        modelId: 'DeterministicEngine',
        isCloud: false,
        dataLocation: 'DEVICE ONLY',
        privacyClass: privacyDecision.classification,
        latencyMs: Date.now() - startTime,
      });

      return {
        text,
        source: 'LOCAL',
        modelId: 'DeterministicEngine',
        privacyClass: privacyDecision.classification,
        toolExecuted: toolName,
        memoryUpdated: false,
        latencyMs: Date.now() - startTime,
      };
    }

    // 3. RETRIEVE MEMORY (Local Context & RAG)
    const relevantMemories = localMemoryStore.recall(normalizedInput, { limit: 3 });
    const ragResults = await localKnowledgeEngine.retrieve(normalizedInput, 2);

    // 4. CHECK PRIVACY
    const cloudAllowed = privacyDecision.cloudAllowed && !privacyDecision.dataEgressForbidden;

    // 5. SELECT MODEL & DEVICE TELEMETRY
    const telemetry = await deviceCapabilityEngine.getTelemetry();
    const taskComplexity = this.determineComplexity(normalizedInput, privacyDecision.classification);
    const modelSelection = modelSelectionEngine.selectModel({
      telemetry,
      taskComplexity,
      privacy: privacyDecision.classification,
      forceLocal: !cloudAllowed,
    });

    // 6. SELECT TOOLS
    const availableTools = chatrToolRegistry.formatForLLM();

    // Fast-path: Explicit Health Query -> Delegate directly to Health OS
    if (healthQueryEngine.canHandle(normalizedInput)) {
      const healthResult = healthQueryEngine.query(normalizedInput, prefs.name);
      aiActivityLog.logActivity({
        taskTitle: 'Health OS Query',
        what: 'Authoritative Health Baseline Query',
        why: 'User inquired about personal health status',
        providerId: 'heuristic',
        modelId: 'HealthOS-v1.0',
        isCloud: false,
        dataLocation: 'DEVICE ONLY',
        privacyClass: 'SENSITIVE',
        latencyMs: Date.now() - startTime,
      });

      // Record health event to PersonalContextGraph
      personalContextGraph.addEntity({
        id: `health_${Date.now()}`,
        type: 'HealthEvent',
        name: normalizedInput.slice(0, 30),
        attributes: { summary: healthResult.answer },
        createdAt: Date.now(),
      });

      return {
        text: healthResult.answer,
        source: 'LOCAL',
        modelId: 'HealthOS-v1.0',
        privacyClass: 'SENSITIVE',
        toolExecuted: 'queryHealthVitals',
        memoryUpdated: false,
        latencyMs: Date.now() - startTime,
      };
    }

    // Fast-path: Answering from recalled local memory
    if (/when do i prefer|what are my preferences|what did i say about/i.test(normalizedInput)) {
      const match = relevantMemories[0];
      if (match) {
        const text = `According to your private on-device memory, you noted: "${match.content}".`;
        aiActivityLog.logActivity({
          taskTitle: 'Local Memory Recall',
          what: 'Recalled private preference',
          why: `User requested preference (${match.explanation})`,
          providerId: 'heuristic',
          modelId: 'LocalMemoryStore',
          isCloud: false,
          dataLocation: 'DEVICE ONLY',
          privacyClass: match.privacyClass,
          latencyMs: Date.now() - startTime,
        });

        return {
          text,
          source: 'LOCAL',
          modelId: 'LocalMemoryStore',
          privacyClass: match.privacyClass,
          memoryUpdated: false,
          latencyMs: Date.now() - startTime,
        };
      }
    }

    // 7. CHECK PERMISSION & REASONING (Prepare context)
    const contextFragments: string[] = [
      `User Name: ${prefs.name}`,
      `Tone: ${prefs.tone}`,
      personalContextEngine.formatContextForPrompt(),
    ];
    if (relevantMemories.length > 0) {
      contextFragments.push(`Recalled Memories:\n${relevantMemories.map(m => `- ${m.content} (${m.explanation})`).join('\n')}`);
    }
    if (ragResults.length > 0) {
      contextFragments.push(`Knowledge Chunks:\n${ragResults.map(r => `- ${r.chunk.text}`).join('\n')}`);
    }

    const systemPrompt = [
      'You are CHATR Personal AI. Your intelligence lives directly on the user phone.',
      'Always prioritize privacy, conciseness, and helpfulness.',
      ...contextFragments,
    ].join('\n\n');

    // 8. EXECUTE INFERENCE
    const genResult = await chatrLocalRuntime.generate(
      normalizedInput,
      {
        systemPrompt,
        maxTokens: 300,
        temperature: 0.6,
        tools: availableTools,
      },
      cloudAllowed
    );

    let finalResponseText = genResult.text;
    let toolExecuted: string | undefined;

    // 9. OBSERVE & TOOL CALL HANDLING
    if (genResult.toolCalls && genResult.toolCalls.length > 0) {
      const call = genResult.toolCalls[0];
      const toolDef = chatrToolRegistry.getTool(call.name);

      if (toolDef) {
        const permission = permissionManager.checkPermission({
          actionId: `act_${Date.now()}`,
          toolName: call.name,
          securityLevel: toolDef.riskLevel,
          humanSummary: `Execute ${call.name}`,
          parameters: call.arguments,
          requiresBiometric: toolDef.riskLevel === 'LEVEL_3_SENSITIVE',
          timestamp: Date.now(),
        });

        if (permission.allowed) {
          const toolRes = await toolDef.execute(call.arguments);
          toolExecuted = toolDef.name;
          finalResponseText = toolRes.message || finalResponseText;
        } else {
          finalResponseText = `I have prepared to ${call.name}, but this requires your direct confirmation: ${permission.reason}`;
        }
      }
    }

    // 10. UPDATE MEMORY IF PERMITTED (Selective Policy with Confidence)
    let memoryUpdated = false;
    const shouldSave = localMemoryStore.shouldStore(normalizedInput, 'USER_EXPLICIT');
    if (shouldSave.eligible) {
      localMemoryStore.saveMemory(normalizedInput, {
        category: shouldSave.category,
        importance: shouldSave.importance,
        confidenceLevel: shouldSave.confidenceLevel,
        confidence: shouldSave.confidence,
        explanation: shouldSave.explanation,
        source: 'USER_EXPLICIT',
      });
      memoryUpdated = true;
      finalResponseText = `Got it, I've safely saved that to your private on-device memory: "${normalizedInput}".`;
    }

    // 11. RESPOND & AUDIT LOG
    aiActivityLog.logActivity({
      taskTitle: normalizedInput.slice(0, 40),
      what: 'Conversational Generation',
      why: 'User message response',
      providerId: genResult.providerId,
      modelId: genResult.modelId,
      isCloud: !genResult.isLocal,
      dataLocation: genResult.isLocal ? 'DEVICE ONLY' : 'CLOUD EXTENSION',
      privacyClass: privacyDecision.classification,
      latencyMs: Date.now() - startTime,
      tokensGenerated: genResult.tokensGenerated,
    });

    return {
      text: finalResponseText,
      source: genResult.isLocal ? 'LOCAL' : 'CLOUD',
      modelId: genResult.modelId,
      privacyClass: privacyDecision.classification,
      toolExecuted,
      memoryUpdated,
      latencyMs: Date.now() - startTime,
    };
  }

  private determineComplexity(input: string, privacy: string): 'SIMPLE_COMMAND' | 'CONVERSATION' | 'COMPLEX_REASONING' | 'HEALTH_EXPLANATION' | 'CRITICAL_SAFETY' {
    if (privacy === 'SENSITIVE') return 'HEALTH_EXPLANATION';
    if (/remind|alarm|timer|time|date/i.test(input)) return 'SIMPLE_COMMAND';
    if (/search the latest|explain how to build|deep analysis/i.test(input)) return 'COMPLEX_REASONING';
    return 'CONVERSATION';
  }

  /**
   * Phase 8: Executes user intent through the 8-Stage CHATR Interaction Protocol
   */
  public async executeProtocol(intent: ProtocolIntent | string): Promise<ProtocolResult> {
    const payload: ProtocolIntent = typeof intent === 'string'
      ? { rawInput: intent, source: 'USER_TEXT' }
      : intent;
    return chatrInteractionProtocol.execute(payload);
  }

  public getCapabilityEngine(): CapabilityEngine {
    return capabilityEngine;
  }

  public getCommunicationIntelligence(): CommunicationIntelligence {
    return communicationIntelligence;
  }
}

export const personalAgent = PersonalAgent.getInstance();
