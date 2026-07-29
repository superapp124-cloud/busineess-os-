export interface SignatureVerifier {
  /**
   * Verifies that the provided cryptographic signature matches the canonical digest.
   * Does NOT generate signatures.
   */
  verifySignature(digest: string, signature: string, publisherKeyId: string): Promise<boolean>;
}
