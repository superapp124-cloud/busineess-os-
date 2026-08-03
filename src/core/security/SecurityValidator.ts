import { EnterpriseEvent } from '../../types';
import { IdentityRuntime, AuthToken } from './IdentityRuntime';

export class SecurityValidator {
  
  public static authorizeEvent(event: EnterpriseEvent): void {
    // 1. Check for token presence in metadata
    const token = event.metadata?.authToken as AuthToken | undefined;
    if (!token) {
      throw new Error(`[SecurityValidator] AccessDenied: Event ${event.id} is missing an AuthToken.`);
    }

    // 2. Cryptographic Token Verification
    const idRuntime = IdentityRuntime.getInstance();
    if (!idRuntime.verifyToken(token)) {
      throw new Error(`[SecurityValidator] AccessDenied: Invalid or expired AuthToken for event ${event.id}.`);
    }

    // 3. RBAC Policy Enforcement (Zero-Trust)
    const actorId = event.actorId;
    
    // Ensure actor matches token subject
    if (token.sub !== actorId && token.role !== 'system:admin') {
      throw new Error(`[SecurityValidator] AccessDenied: Token subject (${token.sub}) does not match actorId (${actorId}).`);
    }

    // Ensure cross-domain boundary (A Sales token cannot publish Legal events)
    // Assuming Event 'source' carries domain context (e.g. 'LegalScanner')
    const domainPrefix = event.source.split(/([A-Z])/)[0] || event.source; // rough heuristic for mock
    if (token.role !== 'system:admin' && !event.source.toLowerCase().includes(token.domain.toLowerCase())) {
       // Only strictly enforce if domain is explicitly mismatched and token isn't admin
       // For our mock scenario, 'system' bypasses. If user is 'Sales', they shouldn't trigger 'LegalScanner'
       if (token.domain !== 'system' && !event.source.toLowerCase().startsWith(token.domain.toLowerCase())) {
          throw new Error(`[SecurityValidator] AccessDenied: Actor in domain '${token.domain}' is not authorized to emit event from source '${event.source}'.`);
       }
    }
  }
}
