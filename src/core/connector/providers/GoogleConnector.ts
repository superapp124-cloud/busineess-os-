import { IConnector, ConnectorCapabilities } from '../../contracts/connector/IConnectorRuntime';

export class GoogleConnector implements IConnector {
  public id = 'google';
  public name = 'Google Workspace';
  public capabilities: ConnectorCapabilities = {
    canReadEmails: true,
    canSendEmails: true,
    canManageCalendar: true,
    canAccessFiles: true,
  };

  public async authorize(): Promise<void> {
    const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
    
    if (!clientId || clientId === 'YOUR_GOOGLE_CLIENT_ID_HERE') {
      throw new Error("Missing Google Client ID in .env configuration. Cannot perform real OAuth.");
    }

    // Google Cloud Console does not allow URL fragments (#) in Redirect URIs.
    // We must send the clean origin path, and intercept it on load.
    const redirectUri = `${window.location.origin}`;
    const scope = encodeURIComponent('email profile https://www.googleapis.com/auth/gmail.readonly');
    const state = crypto.randomUUID();
    
    // Store state in sessionStorage to verify on callback (CSRF protection)
    sessionStorage.setItem('oauth_state', state);
    sessionStorage.setItem('oauth_provider', this.id);

    const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${clientId}&redirect_uri=${redirectUri}&response_type=token&scope=${scope}&state=${state}&include_granted_scopes=true`;

    console.log(`[GoogleConnector] Redirecting to real Google OAuth: ${authUrl}`);
    // Redirect browser
    window.location.href = authUrl;
  }

  public async revoke(): Promise<void> {
    console.log('[GoogleConnector] Revoke called');
  }

  public async refresh(): Promise<void> {
    console.log('[GoogleConnector] Refresh called');
  }
}
