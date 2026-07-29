export interface SigningTool {
  /**
   * Generates a SHA-256 digest of the archive.
   */
  generateDigest(archivePath: string): Promise<string>;
  
  /**
   * Generates a cryptographic signature over the canonical digest, never the arbitrary file.
   */
  signDigest(digest: string, keyId: string): Promise<string>;
}
