/**
 * CHATR SI OS — User Preference Store
 * src/ai/personalization/PreferenceStore.ts
 *
 * Persists user habits, tone, language, and interaction policies on-device.
 */

export interface UserPreferences {
  name: string;
  language: 'en' | 'hi' | 'hinglish';
  tone: 'CONCISE' | 'EMPATHETIC' | 'PROFESSIONAL';
  preferredMeetingTimeAfter?: string; // e.g. "10:00"
  notificationsMode: 'MINIMAL' | 'BALANCED' | 'PROACTIVE';
  localOnlyOverride: boolean;
}

const STORAGE_KEY_PREFERENCES = 'chatr.ai.user_preferences';

export class PreferenceStore {
  private static instance: PreferenceStore;
  private preferences: UserPreferences = {
    name: 'User',
    language: 'hinglish',
    tone: 'CONCISE',
    preferredMeetingTimeAfter: '10:00',
    notificationsMode: 'BALANCED',
    localOnlyOverride: false,
  };

  private constructor() {
    this.restore();
  }

  public static getInstance(): PreferenceStore {
    if (!PreferenceStore.instance) {
      PreferenceStore.instance = new PreferenceStore();
    }
    return PreferenceStore.instance;
  }

  private restore(): void {
    if (typeof window === 'undefined') return;
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY_PREFERENCES);
      if (raw) {
        this.preferences = { ...this.preferences, ...JSON.parse(raw) };
      }
    } catch {
      // fallback
    }
  }

  public getPreferences(): UserPreferences {
    return { ...this.preferences };
  }

  public updatePreferences(updates: Partial<UserPreferences>): void {
    this.preferences = { ...this.preferences, ...updates };
    if (typeof window !== 'undefined') {
      try {
        window.localStorage.setItem(STORAGE_KEY_PREFERENCES, JSON.stringify(this.preferences));
      } catch {
        // ignore
      }
    }
  }
}

export const preferenceStore = PreferenceStore.getInstance();
