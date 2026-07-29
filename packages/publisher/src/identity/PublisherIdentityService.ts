export interface Certificate {
  id: string;
  publicKey: string;
  issuedAt: string;
  expiresAt: string;
}

export interface PublisherIdentity {
  id: string;
  organizationName: string;
  verified: boolean;
  certificates: Certificate[];
  activeKeyId: string;
}

export interface PublisherIdentityService {
  verifyOrganization(orgDetails: unknown): Promise<boolean>;
  issueCertificate(publisherId: string): Promise<Certificate>;
  rotateKey(publisherId: string): Promise<Certificate>;
  revokeCertificate(certificateId: string): Promise<void>;
  revokePublisher(publisherId: string): Promise<void>;
  getIdentity(publisherId: string): Promise<PublisherIdentity | null>;
}
