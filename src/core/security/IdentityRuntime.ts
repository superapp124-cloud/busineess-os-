export interface AuthToken {
  sub: string;
  role: string;
  domain: string;
  exp: number;
  iss: string;
  signature: string;
}

export class IdentityRuntime {
  private static instance: IdentityRuntime;
  private readonly issuer = 'cer-oidc-mock';
  private readonly secret = 'mock_secret_key'; // In prod, this would be an RS256 private key

  public static getInstance(): IdentityRuntime {
    if (!IdentityRuntime.instance) {
      IdentityRuntime.instance = new IdentityRuntime();
    }
    return IdentityRuntime.instance;
  }

  public mintToken(subject: string, role: string, domain: string): AuthToken {
    // Basic mock JWT structure
    const payload = {
      sub: subject,
      role: role,
      domain: domain,
      exp: Date.now() + 3600000, // 1 hour expiration
      iss: this.issuer
    };

    // A real JWT would cryptographically sign this. We'll use a fast mock signature.
    const signature = this.mockSign(JSON.stringify(payload));
    
    return {
      ...payload,
      signature
    };
  }

  public verifyToken(token: AuthToken): boolean {
    if (token.exp < Date.now()) return false;
    if (token.iss !== this.issuer) return false;

    const payload = {
      sub: token.sub,
      role: token.role,
      domain: token.domain,
      exp: token.exp,
      iss: token.iss
    };

    const expectedSignature = this.mockSign(JSON.stringify(payload));
    return token.signature === expectedSignature;
  }

  private mockSign(data: string): string {
    // Extremely basic mock signature for demo purposes.
    // In production, use Node crypto.createSign('RSA-SHA256')
    return Buffer.from(`${data}.${this.secret}`).toString('base64');
  }
}
