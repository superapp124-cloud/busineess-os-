# ADR 0005: Identity Runtime Encapsulation

## Status
Accepted

## Context
User Authentication ("Who is the user?") has historically been tightly coupled to specific backend providers (like Supabase Auth). If CHATR needs to pivot to an Enterprise SSO solution (like Keycloak) or a modern auth layer (like Better Auth), it requires extensive rewrites across the entire UI.

## Decision
We will encapsulate all user authentication logic behind an abstract **Identity Runtime**.

1. **The Contract**: The UI will only ever interact with the `IIdentityRuntime` interface (e.g., `login()`, `logout()`, `verify()`).
2. **Provider Agnostic**: The Identity Runtime will internally delegate to an `IdentityProvider` interface. 
3. **Wrap Before Replace**: Initially, the `IdentityProvider` will wrap the *current* authentication logic. In the future, this can be seamlessly swapped to a `BetterAuthProvider` or `KeycloakProvider` without touching the UI.
4. **Token Isolation**: User session tokens will be managed entirely by the Identity and Security runtimes, separate from external Connector OAuth tokens.

## Consequences
- **Positive**: Future-proofs the application against changes in authentication providers.
- **Positive**: Clearly separates User Identity from external service capabilities (Connectors).
- **Negative**: Requires mapping provider-specific user models to a standardized CHATR generic User profile.
