/**
 * CHATR SI OS — Master ChatrAIRouter
 * src/ai/router/ChatrAIRouter.ts
 *
 * Implements the master routing pipeline:
 * USER REQUEST -> PRIVACY CLASSIFICATION -> TASK CLASSIFICATION -> DEVICE CAPABILITY
 * -> MODEL CAPABILITY -> NETWORK STATE -> LOCAL FIRST DISPATCH -> PERMISSION CHECK
 * -> TOOL EXECUTION -> AUDIT LOG -> RESPONSE
 *
 * Default: LOCAL FIRST.
 */

import { personalAgent, AgentResponse } from '../agents/PersonalAgent';
import { privacyRouter } from '../privacy/PrivacyRouter';
import { chatrLocalRuntime } from '../runtime/ChatrLocalRuntime';
import { deviceCapabilityEngine } from '../runtime/DeviceCapabilityEngine';
import { PrivacyClassification } from '../privacy/types';

export interface RouteDecisionInfo {
  route: 'LOCAL' | 'CLOUD' | 'HYBRID';
  privacyClass: PrivacyClassification;
  providerId: string;
  egressPermitted: boolean;
  reason: string;
}

export class ChatrAIRouter {
  private static instance: ChatrAIRouter;

  private constructor() {}

  public static getInstance(): ChatrAIRouter {
    if (!ChatrAIRouter.instance) {
      ChatrAIRouter.instance = new ChatrAIRouter();
    }
    return ChatrAIRouter.instance;
  }

  /**
   * Evaluates the routing decision before dispatch
   */
  public async decideRoute(userPrompt: string): Promise<RouteDecisionInfo> {
    const privacy = privacyRouter.evaluate(userPrompt);
    const telemetry = await deviceCapabilityEngine.getTelemetry();
    const primaryProvider = chatrLocalRuntime.getPrimaryProviderId();

    const isOffline = typeof navigator !== 'undefined' && navigator.onLine === false;

    // Strict local rules:
    if (privacy.dataEgressForbidden || isOffline || privacy.classification !== 'PUBLIC') {
      return {
        route: 'LOCAL',
        privacyClass: privacy.classification,
        providerId: primaryProvider,
        egressPermitted: false,
        reason: isOffline 
          ? 'Network is offline. Executing locally on-device.'
          : `Privacy tier '${privacy.classification}' blocks external data egress.`,
      };
    }

    // Public web query:
    if (privacy.classification === 'PUBLIC' && privacy.cloudAllowed) {
      return {
        route: 'CLOUD',
        privacyClass: 'PUBLIC',
        providerId: 'cloud',
        egressPermitted: true,
        reason: 'Public query allowed to leverage extended cloud intelligence.',
      };
    }

    return {
      route: 'LOCAL',
      privacyClass: privacy.classification,
      providerId: primaryProvider,
      egressPermitted: false,
      reason: 'Local-first architecture default.',
    };
  }

  /**
   * Main execution dispatch: delegates to PersonalAgent
   */
  public async dispatch(userPrompt: string): Promise<AgentResponse> {
    return await personalAgent.process(userPrompt);
  }
}

export const chatrAIRouter = ChatrAIRouter.getInstance();
