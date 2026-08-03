/**
 * CHATR Enterprise Zero-Knowledge Local Storage & Vector DB Encryption
 * Standard: AES-GCM-256 with PBKDF2 key derivation (Zero-Knowledge: Local keys only)
 */

export class ZeroKnowledgeEncryption {
  private static async getCryptoKey(passphrase: string, salt: Uint8Array): Promise<CryptoKey> {
    const enc = new TextEncoder();
    const keyMaterial = await crypto.subtle.importKey(
      'raw',
      enc.encode(passphrase),
      { name: 'PBKDF2' },
      false,
      ['deriveKey']
    );
    return crypto.subtle.deriveKey(
      {
        name: 'PBKDF2',
        salt,
        iterations: 100000,
        hash: 'SHA-256'
      },
      keyMaterial,
      { name: 'AES-GCM', length: 256 },
      false,
      ['encrypt', 'decrypt']
    );
  }

  public static async encryptData(plainText: string, passphrase: string): Promise<{ cipherText: string; iv: string; salt: string }> {
    const enc = new TextEncoder();
    const salt = crypto.getRandomValues(new Uint8Array(16));
    const iv = crypto.getRandomValues(new Uint8Array(12));
    const key = await this.getCryptoKey(passphrase, salt);

    const encryptedBuffer = await crypto.subtle.encrypt(
      { name: 'AES-GCM', iv },
      key,
      enc.encode(plainText)
    );

    return {
      cipherText: btoa(String.fromCharCode(...new Uint8Array(encryptedBuffer))),
      iv: btoa(String.fromCharCode(...iv)),
      salt: btoa(String.fromCharCode(...salt))
    };
  }

  public static async decryptData(encrypted: { cipherText: string; iv: string; salt: string }, passphrase: string): Promise<string> {
    const dec = new TextDecoder();
    const salt = Uint8Array.from(atob(encrypted.salt), c => c.charCodeAt(0));
    const iv = Uint8Array.from(atob(encrypted.iv), c => c.charCodeAt(0));
    const cipherBuffer = Uint8Array.from(atob(encrypted.cipherText), c => c.charCodeAt(0));

    const key = await this.getCryptoKey(passphrase, salt);
    const decryptedBuffer = await crypto.subtle.decrypt(
      { name: 'AES-GCM', iv },
      key,
      cipherBuffer
    );

    return dec.decode(decryptedBuffer);
  }
}
