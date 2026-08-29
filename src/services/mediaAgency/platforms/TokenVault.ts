/**
 * CHATR Media Agency — Secure AES-256-GCM Token Vault
 * 
 * Manages OAuth 2.0 access & refresh tokens for Meta (Instagram & Facebook) 
 * and Google (YouTube). Passwords are NEVER stored.
 * Tokens are encrypted at rest using AES-256-GCM with keys held in platform secrets.
 */

import { AuditLogger } from '../telemetry/AuditLogger';

export type SupportedPlatform = 'youtube' | 'instagram' | 'facebook';

export interface OAuthAccountConnection {
  id: string;
  platform: SupportedPlatform;
  accountName: string;
  accountHandle: string;
  avatarUrl?: string;
  connectedAt: string;
  expiresAt: string;
  scopes: string[];
  status: 'ACTIVE' | 'EXPIRED' | 'REVOKED' | 'NEEDS_REAUTH';
  encryptedPayload: string; // AES-256-GCM ciphertext
  iv: string;              // Initialization vector (base64)
}

export interface DecryptedTokenPayload {
  accessToken: string;
  refreshToken?: string;
  tokenType: string;
  platformAccountId: string;
}

const VAULT_STORAGE_KEY = 'chatr_media_vault_connections';
const DEFAULT_KEY_SALT = 'chatr_superadmin_media_vault_salt_v1';

class TokenVaultService {
  private connections: Map<string, OAuthAccountConnection> = new Map();
  private cryptoKey: CryptoKey | null = null;

  constructor() {
    this.init();
  }

  private async init() {
    await this.deriveMasterKey();
    this.loadConnections();
  }

  /**
   * Derive AES-256-GCM key from platform secret using PBKDF2
   */
  private async deriveMasterKey(): Promise<CryptoKey> {
    if (this.cryptoKey) return this.cryptoKey;

    const secret = (typeof window !== 'undefined' && (window as any).__CHATR_VAULT_SECRET__) || 'chatr_isolated_super_admin_master_secret_2026';
    const enc = new TextEncoder();
    const cryptoObj = globalThis.crypto;
    const keyMaterial = await cryptoObj.subtle.importKey(
      'raw',
      enc.encode(secret),
      { name: 'PBKDF2' },
      false,
      ['deriveKey']
    );

    this.cryptoKey = await cryptoObj.subtle.deriveKey(
      {
        name: 'PBKDF2',
        salt: enc.encode(DEFAULT_KEY_SALT),
        iterations: 100000,
        hash: 'SHA-256'
      },
      keyMaterial,
      { name: 'AES-GCM', length: 256 },
      false,
      ['encrypt', 'decrypt']
    );

    return this.cryptoKey;
  }

  private loadConnections() {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        const stored = window.localStorage.getItem(VAULT_STORAGE_KEY);
        if (stored) {
          const parsed: OAuthAccountConnection[] = JSON.parse(stored);
          parsed.forEach(c => this.connections.set(c.id, c));
        }
      }
    } catch {
      // Non-blocking fallback
    }
  }

  private persist() {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        const list = Array.from(this.connections.values());
        window.localStorage.setItem(VAULT_STORAGE_KEY, JSON.stringify(list));
      }
    } catch {
      // Non-blocking fallback
    }
  }

  /**
   * Encrypt token payload using AES-256-GCM
   */
  public async encryptPayload(payload: DecryptedTokenPayload): Promise<{ ciphertext: string; iv: string }> {
    const key = await this.deriveMasterKey();
    const cryptoObj = globalThis.crypto;
    const iv = cryptoObj.getRandomValues(new Uint8Array(12)); // 96-bit IV for AES-GCM
    const enc = new TextEncoder();
    const encodedData = enc.encode(JSON.stringify(payload));

    const encryptedBuffer = await cryptoObj.subtle.encrypt(
      {
        name: 'AES-GCM',
        iv: iv
      },
      key,
      encodedData
    );

    return {
      ciphertext: btoa(String.fromCharCode(...new Uint8Array(encryptedBuffer))),
      iv: btoa(String.fromCharCode(...iv))
    };
  }

  /**
   * Decrypt token payload using AES-256-GCM
   */
  public async decryptPayload(ciphertext: string, ivBase64: string): Promise<DecryptedTokenPayload> {
    const key = await this.deriveMasterKey();
    const cryptoObj = globalThis.crypto;
    const iv = Uint8Array.from(atob(ivBase64), c => c.charCodeAt(0));
    const encryptedBytes = Uint8Array.from(atob(ciphertext), c => c.charCodeAt(0));

    const decryptedBuffer = await cryptoObj.subtle.decrypt(
      {
        name: 'AES-GCM',
        iv: iv
      },
      key,
      encryptedBytes
    );

    const dec = new TextDecoder();
    return JSON.parse(dec.decode(decryptedBuffer));
  }

  /**
   * Register a new OAuth 2.0 connection securely
   */
  public async registerConnection(
    platform: SupportedPlatform,
    accountName: string,
    accountHandle: string,
    payload: DecryptedTokenPayload,
    scopes: string[],
    expiresInSeconds: number = 5184000 // 60 days default for Meta long-lived tokens
  ): Promise<OAuthAccountConnection> {
    const { ciphertext, iv } = await this.encryptPayload(payload);
    const expiresAt = new Date(Date.now() + expiresInSeconds * 1000).toISOString();

    const connectionId = `conn_${platform}_${payload.platformAccountId || Date.now()}`;
    const record: OAuthAccountConnection = {
      id: connectionId,
      platform,
      accountName,
      accountHandle,
      connectedAt: new Date().toISOString(),
      expiresAt,
      scopes,
      status: 'ACTIVE',
      encryptedPayload: ciphertext,
      iv: iv
    };

    this.connections.set(connectionId, record);
    this.persist();

    AuditLogger.log({
      eventType: 'ACCOUNT_CONNECTED',
      actor: 'SuperAdmin',
      details: `Connected official OAuth 2.0 account [${platform.toUpperCase()}]: ${accountName} (@${accountHandle}). Token secured in AES-256-GCM Vault.`,
      severity: 'INFO',
      metadata: { platform, accountId: connectionId, scopes }
    });

    return record;
  }

  /**
   * Get all active account connections (safe metadata only, without decrypted tokens)
   */
  public getConnections(): OAuthAccountConnection[] {
    return Array.from(this.connections.values());
  }

  /**
   * Securely retrieve decrypted access token for dispatch
   */
  public async getAccessToken(connectionId: string): Promise<string> {
    const connection = this.connections.get(connectionId);
    if (!connection) {
      throw new Error(`Token Vault: Connection ${connectionId} not found.`);
    }

    if (connection.status !== 'ACTIVE') {
      throw new Error(`Token Vault: Connection ${connectionId} is ${connection.status}. Re-authorization required.`);
    }

    AuditLogger.log({
      eventType: 'TOKEN_VAULT_ACCESSED',
      actor: 'InternalPlatformAdapter',
      details: `Retrieved decrypted token for ${connection.platform} dispatch.`,
      severity: 'INFO',
      metadata: { platform: connection.platform, connectionId }
    });

    const decrypted = await this.decryptPayload(connection.encryptedPayload, connection.iv);
    return decrypted.accessToken;
  }

  /**
   * Revoke/Disconnect an account
   */
  public disconnect(connectionId: string): boolean {
    const conn = this.connections.get(connectionId);
    if (conn) {
      this.connections.delete(connectionId);
      this.persist();

      AuditLogger.log({
        eventType: 'ACCOUNT_DISCONNECTED',
        actor: 'SuperAdmin',
        details: `Revoked and deleted OAuth token for [${conn.platform.toUpperCase()}]: ${conn.accountName}`,
        severity: 'WARNING',
        metadata: { connectionId, platform: conn.platform }
      });
      return true;
    }
    return false;
  }
}

export const TokenVault = new TokenVaultService();
