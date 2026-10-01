/**
 * CHATR SI OS — Privacy Router
 * src/ai/privacy/PrivacyRouter.ts
 *
 * Classifies every user request into 5 privacy tiers and governs data egress.
 * Default: LOCAL FIRST, PRIVATE FIRST.
 */

import { PrivacyClassification, PrivacyDecision, UserPrivacyPolicy } from './types';

const STORAGE_KEY_PRIVACY_POLICY = 'chatr.ai.privacy_policy';

export class PrivacyRouter {
  private static instance: PrivacyRouter;
  private userPolicy: UserPrivacyPolicy = {
    localAIFirst: true,
    cloudAIAllowed: true,
    privateModeStrict: false,
    dataEgressAuditLog: true,
  };

  private constructor() {
    this.restorePolicy();
  }

  public static getInstance(): PrivacyRouter {
    if (!PrivacyRouter.instance) {
      PrivacyRouter.instance = new PrivacyRouter();
    }
    return PrivacyRouter.instance;
  }

  private restorePolicy(): void {
    if (typeof window === 'undefined') return;
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY_PRIVACY_POLICY);
      if (raw) {
        this.userPolicy = { ...this.userPolicy, ...JSON.parse(raw) };
      }
    } catch {
      // fallback to defaults
    }
  }

  public getPolicy(): UserPrivacyPolicy {
    return { ...this.userPolicy };
  }

  public updatePolicy(newPolicy: Partial<UserPrivacyPolicy>): void {
    this.userPolicy = { ...this.userPolicy, ...newPolicy };
    if (typeof window !== 'undefined') {
      try {
        window.localStorage.setItem(STORAGE_KEY_PRIVACY_POLICY, JSON.stringify(this.userPolicy));
      } catch {
        // ignore
      }
    }
  }

  /**
   * Classify request and determine cloud egress permissions
   */
  public evaluate(prompt: string, contextCategory?: string): PrivacyDecision {
    const classification = this.classify(prompt, contextCategory);

    // If Strict Private Mode is enabled by user, never allow cloud under any circumstance
    if (this.userPolicy.privateModeStrict) {
      return {
        classification,
        cloudAllowed: false,
        reason: 'Strict Private Mode active. All egress blocked.',
        dataEgressForbidden: true,
      };
    }

    switch (classification) {
      case 'HIGHLY_SENSITIVE':
        return {
          classification,
          cloudAllowed: false,
          reason: 'Financial credentials or security secrets detected. Strictly local.',
          dataEgressForbidden: true,
        };

      case 'SENSITIVE':
        return {
          classification,
          cloudAllowed: false,
          reason: 'Health vitals or sensitive diagnostic data detected. Local only.',
          dataEgressForbidden: true,
        };

      case 'PRIVATE':
        return {
          classification,
          cloudAllowed: false,
          reason: 'Personal message, private contact, or document content. Local only by default.',
          dataEgressForbidden: true,
        };

      case 'PERSONAL':
        return {
          classification,
          cloudAllowed: this.userPolicy.cloudAIAllowed && !this.userPolicy.localAIFirst,
          reason: 'Everyday task or routine. Local preferred.',
          dataEgressForbidden: false,
        };

      case 'PUBLIC':
      default:
        return {
          classification: 'PUBLIC',
          cloudAllowed: this.userPolicy.cloudAIAllowed,
          reason: 'General factual knowledge or web query. Cloud allowed.',
          dataEgressForbidden: false,
        };
    }
  }

  /**
   * Semantic classification heuristic
   */
  public classify(prompt: string, contextCategory?: string): PrivacyClassification {
    const q = prompt.toLowerCase();

    // 1. HIGHLY_SENSITIVE: Passwords, OTP, Banking, UPI, Cards
    if (/password|pin|otp|cvv|secret|token|credit card|debit card|upi pin|bank account|seed phrase/i.test(q)) {
      return 'HIGHLY_SENSITIVE';
    }

    // 2. SENSITIVE: Health, Vitals, Symptoms, Medications, Location
    if (
      contextCategory === 'HEALTH' ||
      /blood pressure|bp|glucose|sugar|heart rate|pulse|prescription|symptom|doctor|diagnosis|medical record|ecg|spo2|health|vitals/i.test(q)
    ) {
      return 'SENSITIVE';
    }

    // 3. PRIVATE: Personal messages, contacts, personal documents, diary
    if (
      contextCategory === 'CONVERSATIONS' ||
      contextCategory === 'DOCUMENTS' ||
      /my email|my message|unread messages|who texted me|call log|private note|diary|passport number|aadhaar/i.test(q)
    ) {
      return 'PRIVATE';
    }

    // 4. PERSONAL: Habits, preferences, reminders, calendar, routines
    if (
      contextCategory === 'PREFERENCES' ||
      contextCategory === 'ROUTINES' ||
      contextCategory === 'TASKS' ||
      /remind me|my schedule|alarm|wake me|my favorite|i prefer|routine|my meeting/i.test(q)
    ) {
      return 'PERSONAL';
    }

    // 5. PUBLIC: Weather, general facts, search queries, definitions
    if (/weather|news|who is|what is|search|capital of|how to cook|explain quantum|latest/i.test(q)) {
      return 'PUBLIC';
    }

    return 'PERSONAL';
  }
}

export const privacyRouter = PrivacyRouter.getInstance();
