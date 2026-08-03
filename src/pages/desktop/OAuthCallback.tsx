import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Loader2, CheckCircle, AlertTriangle } from 'lucide-react';
import { kernel } from '@/core/kernel/Kernel';
import { ISecurityRuntime } from '@/core/contracts/security/ISecurityRuntime';
import { storeGoogleToken } from '@/core/connector/providers/GmailService';
import { toast } from 'sonner';

export const OAuthCallback: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [status, setStatus] = useState<'processing' | 'success' | 'error'>('processing');
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    const processCallback = async () => {
      try {
        // Google implicit flow returns params in the hash fragment after the route hash
        // URL shape: /#/oauth/callback#access_token=...&state=...
        const fullHash = window.location.hash; // e.g. #/oauth/callback#access_token=...
        const fragmentStart = fullHash.indexOf('#', 1); // second # sign
        const fragment = fragmentStart > -1 ? fullHash.slice(fragmentStart + 1) : '';
        const hashParams = new URLSearchParams(fragment);
        const searchParams = new URLSearchParams(location.search);

        const accessToken = hashParams.get('access_token') || searchParams.get('access_token');
        const state = hashParams.get('state') || searchParams.get('state');
        const error = hashParams.get('error') || searchParams.get('error');

        if (error) {
          throw new Error(`OAuth Error: ${error}`);
        }

        if (!accessToken) {
          throw new Error('No access token found in callback URL. Check that redirect URI matches exactly in Google Cloud Console.');
        }

        const savedState = sessionStorage.getItem('oauth_state');
        const providerId = sessionStorage.getItem('oauth_provider') || 'google';

        if (state && savedState && state !== savedState) {
          console.warn('[OAuthCallback] State mismatch — possible CSRF or redirect URI issue.');
        }

        // 1. Persist token for GmailService to use (survives page refresh)
        if (providerId === 'google') {
          storeGoogleToken(accessToken);
          console.log('[OAuthCallback] Google token stored for Gmail API access.');
        }

        // 2. Also store via Kernel Security Runtime (in-memory, for runtime use)
        try {
          const security = kernel.resolve<ISecurityRuntime>('ISecurityRuntime');
          await security.storeToken(providerId, {
            accessToken,
            metadata: { connectedAt: Date.now() }
          });
        } catch {
          console.warn('[OAuthCallback] Kernel not booted yet, token stored in localStorage only.');
        }

        // 3. Publish event
        kernel.events.publish('connector.authorization.completed', { connectorId: providerId }, 'oauth-callback');

        setStatus('success');
        toast.success(`Successfully connected Google account!`);

        // Clear session storage
        sessionStorage.removeItem('oauth_state');
        sessionStorage.removeItem('oauth_provider');

        // Redirect back to inbox with provider identifier
        setTimeout(() => {
          navigate(`/desktop/inbox?connected=${providerId}`, { replace: true });
        }, 1500);

      } catch (err: any) {
        setStatus('error');
        setErrorMessage(err.message);
        toast.error(err.message);
        setTimeout(() => {
          navigate('/desktop/inbox', { replace: true });
        }, 3000);
      }
    };

    // Ensure kernel is booted before processing
    // If not booted, it will throw, but for this demo we assume it's booted from main.tsx
    processCallback();
  }, [location, navigate]);

  return (
    <div className="flex h-screen w-screen items-center justify-center bg-black text-white">
      <div className="flex flex-col items-center gap-4 p-8 rounded-xl bg-neutral-900 border border-neutral-800 shadow-2xl">
        {status === 'processing' && (
          <>
            <Loader2 className="w-12 h-12 text-blue-500 animate-spin" />
            <h2 className="text-xl font-semibold">Completing Secure Connection...</h2>
            <p className="text-neutral-400">Please wait while we finalize your authorization.</p>
          </>
        )}
        
        {status === 'success' && (
          <>
            <CheckCircle className="w-12 h-12 text-green-500" />
            <h2 className="text-xl font-semibold">Connection Successful</h2>
            <p className="text-neutral-400">Redirecting you back to your workspace...</p>
          </>
        )}

        {status === 'error' && (
          <>
            <AlertTriangle className="w-12 h-12 text-red-500" />
            <h2 className="text-xl font-semibold">Connection Failed</h2>
            <p className="text-red-400">{errorMessage}</p>
            <p className="text-neutral-400">Returning to workspace...</p>
          </>
        )}
      </div>
    </div>
  );
};

export default OAuthCallback;
