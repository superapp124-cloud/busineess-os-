/**
 * CHATR SI OS — Privacy Classification & Types
 * src/ai/privacy/types.ts
 */

export type PrivacyClassification = 
  | 'PUBLIC'            // General queries, weather, web facts (Cloud allowed)
  | 'PERSONAL'          // Everyday commands, habits, preferences (Local preferred)
  | 'PRIVATE'           // Contacts, personal messages, notes, calendar (Local only by default)
  | 'SENSITIVE'         // Health vitals, medical history, location traces (Local only by default)
  | 'HIGHLY_SENSITIVE'; // Credentials, passwords, OTP, bank account, UPI (Local only strictly)

export interface UserPrivacyPolicy {
  localAIFirst: boolean;
  cloudAIAllowed: boolean;
  privateModeStrict: boolean; // Forces 100% local for all tiers
  dataEgressAuditLog: boolean;
}

export interface PrivacyDecision {
  classification: PrivacyClassification;
  cloudAllowed: boolean;
  reason: string;
  dataEgressForbidden: boolean;
}
