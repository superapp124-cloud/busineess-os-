import { ISecurityRuntime, TokenEntry } from '../contracts/security/ISecurityRuntime';
import { RuntimeHealth } from '../contracts/common/Lifecycle';
import { tokenVault as legacyTokenVault } from '../auth/TokenVault';

/**
 * The Security Runtime implementation that fulfills the ISecurityRuntime contract.
 * For Phase 1, this wraps the legacy TokenVault.
 */
export class SecurityRuntime implements ISecurityRuntime {
  public async storeToken(ownerId: string, token: TokenEntry): Promise<void> {
    await legacyTokenVault.storeToken(ownerId, token);
  }

  public async getToken(ownerId: string): Promise<TokenEntry | null> {
    const raw = await legacyTokenVault.getRawToken(ownerId);
    if (!raw) return null;
    return {
      accessToken: raw.accessToken,
      refreshToken: raw.refreshToken,
      expiresAt: raw.expiresAt,
      scopes: raw.scopes,
    };
  }

  public async deleteToken(ownerId: string): Promise<void> {
    await legacyTokenVault.deleteToken(ownerId);
  }

  public async isTokenValid(ownerId: string): Promise<boolean> {
    const raw = await legacyTokenVault.getRawToken(ownerId);
    if (!raw) return false;
    if (raw.expiresAt && Date.now() >= raw.expiresAt) return false;
    return true;
  }

  public async initialize(): Promise<void> {}
  public async start(): Promise<void> {}
  public async stop(): Promise<void> {}
  public async dispose(): Promise<void> {}

  public async health(): Promise<RuntimeHealth> {
    return { status: 'healthy', lastChecked: Date.now() };
  }

  public version(): string {
    return '1.0.0';
  }
}
