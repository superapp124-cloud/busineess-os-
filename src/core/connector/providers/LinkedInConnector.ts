import { IConnector, ConnectorCapabilities } from '../../contracts/connector/IConnectorRuntime';

export class LinkedInConnector implements IConnector {
  public id = 'linkedin_oidc';
  public name = 'LinkedIn';
  public capabilities: ConnectorCapabilities = {
    canReadEmails: false,
    canSendEmails: false,
    canManageCalendar: false,
    canAccessFiles: false,
  };

  public async authorize(): Promise<void> {
    const clientId = import.meta.env.VITE_LINKEDIN_CLIENT_ID;
    
    if (!clientId || clientId === 'YOUR_LINKEDIN_CLIENT_ID_HERE') {
      throw new Error("Missing LinkedIn Client ID in .env configuration. Cannot perform real OAuth.");
    }

    // LinkedIn uses the clean origin as well
    const redirectUri = `${window.location.origin}`;
    
    // Scopes for Sign In with LinkedIn using OpenID Connect
    const scope = encodeURIComponent('openid profile email');
    const state = crypto.randomUUID();
    
    // Store state in sessionStorage to verify on callback (CSRF protection)
    sessionStorage.setItem('oauth_state', state);
    sessionStorage.setItem('oauth_provider', this.id);

    const authUrl = `https://www.linkedin.com/oauth/v2/authorization?response_type=code&client_id=${clientId}&redirect_uri=${redirectUri}&state=${state}&scope=${scope}`;

    console.log(`[LinkedInConnector] Redirecting to real LinkedIn OAuth: ${authUrl}`);
    // Redirect browser
    window.location.href = authUrl;
  }

  public async revoke(): Promise<void> {
    console.log('[LinkedInConnector] Revoke called');
  }

  public async refresh(): Promise<void> {
    console.log('[LinkedInConnector] Refresh called');
  }
}
