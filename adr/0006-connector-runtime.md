# ADR 0006: Connector Runtime & Direct OAuth

## Status
Accepted

## Context
Connector Authorization ("What external services has the user allowed CHATR to access?") is fundamentally different from User Authentication. Previous iterations conflated these by relying on Supabase Auth to manage external OAuth connections (e.g., connecting a Gmail account). This limited flexibility and tied capability management to the Identity provider.

## Decision
We will decouple external service integrations by routing them through the **Connector Runtime**.

1. **The Contract**: The UI will initiate integrations using generic API methods like `ConnectorRuntime.authorize(connectorId)` rather than explicitly launching OAuth flows.
2. **Direct OAuth**: The Connector Runtime will contain an internal `OAuthManager` that negotiates directly with external providers (Google, Microsoft, Slack) using standard OAuth 2.0 PKCE flows.
3. **Token Vault Storage**: Authorized integration tokens (access tokens, refresh tokens) will be securely stored in the Token Vault (managed by the Security Runtime), completely isolated from the user's core identity session.
4. **Wrap Existing Logic**: The current `OAuthManager` will be wrapped behind the `IConnectorRuntime` interface during the migration.

## Consequences
- **Positive**: CHATR retains full ownership of its capability integrations and OAuth negotiation without depending on third-party identity brokers.
- **Positive**: Enables granular permission requests and token refresh logic per connector.
- **Negative**: Increases the complexity of the CHATR backend, as it must now securely manage OAuth state and token rotation for multiple external providers.
