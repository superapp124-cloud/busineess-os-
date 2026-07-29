import { Identifier, Version } from '../../common';
import { Permission } from '../../identity';
import { ActionId } from '../../types';

export type AuthenticationType = 'NONE' | 'BASIC' | 'BEARER' | 'OAUTH2' | 'API_KEY';

export interface RetryPolicy {
  maxRetries: number;
  backoffMultiplier: number;
}

export interface RateLimit {
  requestsPerMinute: number;
}

export interface ConnectorManifest extends Identifier {
  name: string;
  version: Version;
  authentication: AuthenticationType;
  provides: ActionId[];
  permissions: Permission[];
  rateLimit?: RateLimit;
  retryPolicy?: RetryPolicy;
  timeoutMs?: number;
  supportsStreaming?: boolean;
  supportsBatching?: boolean;
}
