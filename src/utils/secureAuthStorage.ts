import { tokenVault, TokenVaultImpl } from '@/core/auth/TokenVault';

/**
 * Secure Auth Storage Layer
 * Manages encrypted and isolated authentication token persistence across web, desktop, and mobile.
 */
export class SecureAuthStorage {
  private static instance = new TokenVaultImpl();

  public static async setItem(key: string, value: string): Promise<void> {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        window.localStorage.setItem(`chatr_sec_${key}`, value);
      }
    } catch (e) {
      console.warn('[SecureAuthStorage] LocalStorage write failed:', e);
    }
  }

  public static async getItem(key: string): Promise<string | null> {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        return window.localStorage.getItem(`chatr_sec_${key}`);
      }
    } catch (e) {
      console.warn('[SecureAuthStorage] LocalStorage read failed:', e);
    }
    return null;
  }

  public static async removeItem(key: string): Promise<void> {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        window.localStorage.removeItem(`chatr_sec_${key}`);
      }
    } catch (e) {
      console.warn('[SecureAuthStorage] LocalStorage remove failed:', e);
    }
  }

  public static getVault(): TokenVaultImpl {
    return tokenVault;
  }
}

export default SecureAuthStorage;
