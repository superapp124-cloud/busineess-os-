import { IRuntime } from '../common/Lifecycle';

export interface TokenEntry {
  accessToken: string;
  refreshToken?: string;
  expiresAt?: number;
  scopes?: string[];
  metadata?: Record<string, any>;
}

/**
 * The Security Runtime is responsible for managing secrets, tokens,
 * API keys, and credentials securely.
 */
export interface ISecurityRuntime extends IRuntime {
  /**
   * Stores a token in the secure vault.
   * @param ownerId The ID of the owner (e.g. user ID or connector ID)
   * @param token The token data to store
   */
  storeToken(ownerId: string, token: TokenEntry): Promise<void>;

  /**
   * Retrieves a token from the secure vault.
   * @param ownerId The ID of the owner
   * @returns The token data, or null if not found
   */
  getToken(ownerId: string): Promise<TokenEntry | null>;

  /**
   * Deletes a token from the secure vault.
   * @param ownerId The ID of the owner
   */
  deleteToken(ownerId: string): Promise<void>;

  /**
   * Validates if a token is still active/unexpired.
   */
  isTokenValid(ownerId: string): Promise<boolean>;
}
