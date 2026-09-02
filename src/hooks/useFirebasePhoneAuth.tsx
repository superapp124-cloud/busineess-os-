import { useState, useCallback, useRef, useEffect } from 'react';
import { 
  RecaptchaVerifier, 
  signInWithPhoneNumber, 
  ConfirmationResult,
} from 'firebase/auth';
import { Capacitor } from '@capacitor/core';
import { auth } from '@/firebase';
import { supabase } from '@/integrations/supabase/client';
import { normalizePhone, canonicalNationalPhone } from '@/core/phone/phoneIdentity';

// On native (Android/iOS) Firebase verifies the phone number through
// Play Integrity / APNs — NO web reCAPTCHA and NO authorized-domain check required.
// On web/desktop we keep the invisible reCAPTCHA flow.
const isNative = Capacitor.isNativePlatform();

export type PhoneAuthStep = 'phone' | 'otp' | 'syncing';

interface UseFirebasePhoneAuthReturn {
  step: PhoneAuthStep;
  loading: boolean;
  error: string | null;
  countdown: number;
  checkPhoneAndProceed: (phoneNumber: string) => Promise<boolean>;
  verifyOTP: (otp: string) => Promise<boolean>;
  resendOTP: () => Promise<boolean>;
  reset: () => void;
  phoneNumber: string;
  isExistingUser: boolean;
  recaptchaReady: boolean;
}

export const useFirebasePhoneAuth = (): UseFirebasePhoneAuthReturn => {
  
  const [step, setStep] = useState<PhoneAuthStep>('phone');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [countdown, setCountdown] = useState(0);
  const [phoneNumber, setPhoneNumber] = useState('');
  const [failedAttempts, setFailedAttempts] = useState(0);
  const [isExistingUser, setIsExistingUser] = useState(false);
  const [recaptchaReady, setRecaptchaReady] = useState(true);
  
  // Web flow ref
  const confirmationResultRef = useRef<ConfirmationResult | null>(null);
  const recaptchaVerifierRef = useRef<RecaptchaVerifier | null>(null);
  // Native flow ref
  const verificationIdRef = useRef<string | null>(null);

  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  // Clean up reCAPTCHA verifier on unmount
  useEffect(() => {
    return () => {
      if (recaptchaVerifierRef.current) {
        try { recaptchaVerifierRef.current.clear(); } catch {}
        recaptchaVerifierRef.current = null;
      }
    };
  }, []);

  /**
   * Helper: Dynamically get Native FirebaseAuthentication plugin if available
   */
  const getNativeAuthPlugin = async () => {
    if (!isNative) return null;
    try {
      const pluginName = '@capacitor-firebase/authentication';
      const mod = await import(/* @vite-ignore */ pluginName);
      return mod?.FirebaseAuthentication || null;
    } catch {
      console.warn('[Auth] @capacitor-firebase/authentication plugin not loaded');
      return null;
    }
  };

  /**
   * Native phone verification (Android/iOS) — uses device's native Firebase SDK (Play Integrity/APNs)
   */
  const sendOTPNative = async (phone: string): Promise<boolean> => {
    try {
      const NativeAuth = await getNativeAuthPlugin();
      if (!NativeAuth) {
        // Fallback to web flow if plugin is missing on native target
        return sendOTPWeb(phone);
      }

      const verificationId = await new Promise<string>(async (resolve, reject) => {
        let codeListener: { remove: () => Promise<void> } | null = null;
        try {
          codeListener = await NativeAuth.addListener(
            'phoneCodeSent',
            async (event: { verificationId: string }) => {
              await codeListener?.remove();
              resolve(event.verificationId);
            }
          );

          await NativeAuth.signInWithPhoneNumber({ phoneNumber: phone });
        } catch (e) {
          await codeListener?.remove();
          reject(e);
        }
      });

      verificationIdRef.current = verificationId;
      setStep('otp');
      setCountdown(30);
      setLoading(false);
      console.log('📱 [Auth] OTP sent successfully (native)');
      return true;
    } catch (err: any) {
      console.error('[Firebase Native] OTP error:', err);
      setFailedAttempts(prev => prev + 1);

      let msg = 'Failed to send OTP';
      const code: string = err?.code || err?.message || '';
      if (/invalid.*phone|phone.*invalid/i.test(code)) {
        msg = 'Invalid phone number';
      } else if (/too-many|quota/i.test(code)) {
        msg = 'Too many attempts. Please wait and try again.';
        setCountdown(180);
      } else if (/network/i.test(code)) {
        msg = 'Network error. Check your connection and try again.';
      }

      setError(msg);
      setStep('phone');
      setLoading(false);
      return false;
    }
  };

  /**
   * Web phone verification — uses fresh Firebase Web SDK RecaptchaVerifier
   */
  const sendOTPWeb = async (phone: string): Promise<boolean> => {
    try {
      // Clear any existing verifier to guarantee fresh DOM binding
      if (recaptchaVerifierRef.current) {
        try { recaptchaVerifierRef.current.clear(); } catch {}
        recaptchaVerifierRef.current = null;
      }
      if ((window as any).recaptchaVerifier) {
        try { (window as any).recaptchaVerifier.clear(); } catch {}
        (window as any).recaptchaVerifier = null;
      }

      const container = document.getElementById('recaptcha-container');
      if (container) {
        container.innerHTML = '';
      }

      const verifier = new RecaptchaVerifier(auth, 'recaptcha-container', {
        size: failedAttempts >= 2 ? 'normal' : 'invisible',
        callback: () => {
          console.log('📱 [Auth] reCAPTCHA solve completed');
        },
        'expired-callback': () => {
          console.warn('⚠️ [Auth] reCAPTCHA expired');
        }
      });

      await verifier.render();
      recaptchaVerifierRef.current = verifier;
      (window as any).recaptchaVerifier = verifier;

      const canonicalE164 = normalizePhone(phone);
      const confirmationResult = await signInWithPhoneNumber(auth, canonicalE164, verifier);
      confirmationResultRef.current = confirmationResult;
      
      setStep('otp');
      setCountdown(30);
      setLoading(false);
      
      console.log('📱 [Auth] OTP sent successfully (web) to', canonicalE164);
      return true;
    } catch (err: any) {
      console.error('[Firebase Web] OTP error detail:', err.code, err.message, err);
      setFailedAttempts(prev => prev + 1);

      // Clean up verifier on error so subsequent clicks retry cleanly
      if (recaptchaVerifierRef.current) {
        try { recaptchaVerifierRef.current.clear(); } catch {}
        recaptchaVerifierRef.current = null;
      }
      if ((window as any).recaptchaVerifier) {
        try { (window as any).recaptchaVerifier.clear(); } catch {}
        (window as any).recaptchaVerifier = null;
      }
      
      let msg = 'Failed to send OTP';
      let waitTime = 0;
      
      if (err.code === 'auth/invalid-phone-number') {
        msg = 'Invalid phone number format';
      } else if (err.code === 'auth/invalid-app-credential') {
        msg = 'Firebase verification credential error. Ensure domain is authorized in Firebase Console and retry.';
      } else if (
        err.code === 'auth/unauthorized-domain' || 
        err.message?.includes('Hostname') ||
        (err.message?.includes('unauthorized') && !err.message?.includes('captcha'))
      ) {
        msg = `Domain (${window.location.hostname}) is not authorized for OTP in Firebase Console.`;
      } else if (err.code === 'auth/internal-error') {
        msg = 'Firebase Auth internal error. Please click Continue to try again.';
      } else if (err.code === 'auth/too-many-requests') {
        msg = 'Too many attempts. Please wait and try again.';
        waitTime = 180;
      } else if (err.code === 'auth/captcha-check-failed' || err.message?.includes('reCAPTCHA')) {
        msg = 'Security check (reCAPTCHA) failed. Please click Continue to try again.';
      } else if (err.code === 'auth/network-request-failed') {
        msg = 'Network error. Check your connection and try again.';
      } else {
        msg = err.message || 'Failed to send OTP';
      }

      setError(msg);
      if (waitTime > 0) setCountdown(waitTime);
      setStep('phone');
      setLoading(false);
      return false;
    }
  };

  const sendOTP = async (phone: string): Promise<boolean> => {
    if (isNative) {
      return sendOTPNative(phone);
    }
    return sendOTPWeb(phone);
  };

  /**
   * INSTANT CHECK: Fast login check for existing users
   */
  const checkPhoneAndProceed = useCallback(async (phone: string): Promise<boolean> => {
    setLoading(true);
    setError(null);
    setPhoneNumber(phone);

    const e164 = normalizePhone(phone);
    const national = canonicalNationalPhone(phone);
    const cleanDigits = e164.replace(/\+/g, '') || phone.replace(/\D/g, '');

    const candidateEmails = [
      `${cleanDigits}@chatr.local`,
      `91${national}@chatr.local`,
      `${national}@chatr.local`,
      `${cleanDigits}@chatr.chat`,
      `91${national}@chatr.chat`,
      `${national}@chatr.chat`,
    ];

    const candidatePwds = [
      e164,
      `+${cleanDigits}`,
      cleanDigits,
      `chatr_${cleanDigits}`,
      `chatr_${e164}`,
      `91${national}`,
      `+91${national}`,
      national,
    ];

    for (const email of candidateEmails) {
      for (const pwd of candidatePwds) {
        try {
          const { data } = await supabase.auth.signInWithPassword({
            email,
            password: pwd,
          });
          
          if (data?.session) {
            setIsExistingUser(true);
            console.log('✅ [Auth] Existing user authenticated instantly with candidate credentials');
            setLoading(false);
            return true;
          }
        } catch {
          // Try next candidate
        }
      }
    }

    // If instant login not matched, send verification OTP immediately
    setIsExistingUser(false);
    return await sendOTP(phone);
  }, []);

  /**
   * Exchange a verified Firebase UID & ID Token for a Supabase session via Edge Function or fallback
   */
  const completeSupabaseSession = async (firebaseUid: string, firebaseIdToken?: string): Promise<boolean> => {
    const normalizedPhone = phoneNumber.replace(/\s/g, '');
    const cleanDigits = normalizedPhone.replace(/\+/g, '');
    const email = `${cleanDigits}@chatr.local`;

    let session: { access_token?: string; refresh_token?: string | null } | null = null;

    // Strategy 1: Call identity-exchange edge function via supabase client
    if (firebaseIdToken) {
      try {
        console.log('[Auth Exchange] Attempting identity-exchange with Firebase ID token...');
        const { data, error } = await supabase.functions.invoke('identity-exchange', {
          body: { id_token: firebaseIdToken }
        });

        if (!error && data?.session?.access_token) {
          session = data.session;
          console.log('✅ [Auth Exchange] identity-exchange succeeded');
        } else if (error) {
          console.warn('[Auth Exchange] identity-exchange returned error:', error);
        }
      } catch (err) {
        console.warn('[Auth Exchange] identity-exchange call failed:', err);
      }
    }

    // Strategy 2: Call firebase-phone-auth edge function via fetch
    if (!session?.access_token) {
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://cenxckpxaqborfqyexot.supabase.co';
      const supabaseKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY || 
        import.meta.env.VITE_SUPABASE_ANON_KEY || 
        'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNlbnhja3B4YXFib3JmcXlleG90Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODI5NzU1NzQsImV4cCI6MjA5ODU1MTU3NH0.rCmVgQbMVIzG0h5nmDniHZpJtK9VUfW1mGO40VY_MZE';

      if (supabaseUrl && supabaseKey) {
        try {
          console.log('[Auth Exchange] Attempting firebase-phone-auth edge function...');
          const payload: Record<string, string> = {
            phone_number: normalizedPhone,
            firebase_uid: firebaseUid,
          };
          if (firebaseIdToken) {
            payload.firebase_id_token = firebaseIdToken;
          }

          const response = await fetch(
            `${supabaseUrl}/functions/v1/firebase-phone-auth`,
            {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${supabaseKey}`,
                'apikey': supabaseKey,
              },
              body: JSON.stringify(payload),
            }
          );

          const responseText = await response.text();
          if (responseText) {
            const data = JSON.parse(responseText);
            if (data?.session?.access_token) {
              session = data.session;
              console.log('✅ [Auth Exchange] firebase-phone-auth succeeded');
            } else if (data?.error || data?.message) {
              console.error('[Auth Exchange] Edge function error response:', data.error || data.message);
            }
          }
        } catch (e) {
          console.warn('[Auth Exchange] firebase-phone-auth call failed:', e);
        }
      }
    }

    // Strategy 3: Direct fallback sign-in using candidate passwords
    if (!session?.access_token && firebaseUid) {
      console.log('[Auth Exchange] Attempting direct Supabase password sign-in candidates...');
      const candidatePwds = [
        `${cleanDigits}_${firebaseUid.slice(0, 10)}`,
        normalizedPhone,
        cleanDigits,
        `chatr_${cleanDigits}`,
        `+${cleanDigits}`,
      ];

      for (const pwd of candidatePwds) {
        try {
          const { data: signInData } = await supabase.auth.signInWithPassword({
            email,
            password: pwd,
          });

          if (signInData?.session?.access_token) {
            session = signInData.session;
            console.log('✅ [Auth Exchange] Direct password sign-in succeeded');
            break;
          }
        } catch {
          // Continue to next password candidate
        }
      }
    }

    // Strategy 4: If session access_token was obtained, set it in Supabase client
    if (session?.access_token) {
      const refreshToken =
        session.refresh_token ||
        `chatr_synthetic_refresh_${Date.now().toString(36)}_${Math.random().toString(36).substring(2)}`;

      const { error: setSessionErr } = await supabase.auth.setSession({
        access_token: session.access_token,
        refresh_token: refreshToken,
      });

      if (!setSessionErr) {
        console.log('✅ [Auth Exchange] Supabase session established successfully');
        return true;
      } else {
        console.error('[Auth Exchange] Failed to set Supabase session:', setSessionErr);
      }
    }

    throw new Error('Authentication completed but session creation failed. Please try again.');
  };

  /**
   * Verify OTP entered by user (Native vs Web)
   */
  const verifyOTP = useCallback(async (otp: string): Promise<boolean> => {
    setLoading(true);
    setError(null);

    try {
      let firebaseUid: string | undefined;
      let firebaseIdToken: string | undefined;

      if (isNative) {
        if (!verificationIdRef.current) {
          setError('Session expired. Please try again.');
          setLoading(false);
          return false;
        }

        const NativeAuth = await getNativeAuthPlugin();
        if (NativeAuth) {
          // Step 1: Confirm code with native Firebase SDK
          await NativeAuth.confirmVerificationCode({
            verificationId: verificationIdRef.current,
            verificationCode: otp,
          });
          const { user } = await NativeAuth.getCurrentUser();
          firebaseUid = user?.uid;
          const tokenResult = await NativeAuth.getIdToken({ forceRefresh: true });
          firebaseIdToken = tokenResult?.token;
        }
      }

      if (!firebaseUid && confirmationResultRef.current) {
        // Web verification step
        const result = await confirmationResultRef.current.confirm(otp);
        firebaseUid = result.user.uid;
        firebaseIdToken = await result.user.getIdToken(true);
      }

      if (!firebaseUid) {
        throw new Error('Verification failed. Please try requesting a new OTP.');
      }

      // Step 2: Exchange Firebase UID & ID token for Supabase session
      await completeSupabaseSession(firebaseUid, firebaseIdToken);

      setLoading(false);
      return true;
    } catch (err: any) {
      console.error('[OTP Verify] Error:', err);
      const codeStr: string = err?.code || err?.message || '';
      const msg = /invalid.*(verification|code)|code.*invalid/i.test(codeStr)
        ? 'Invalid code. Please check and try again.'
        : err.message || 'Verification failed';
      setError(msg);
      setLoading(false);
      return false;
    }
  }, [phoneNumber]);


  const resendOTP = useCallback(async (): Promise<boolean> => {
    if (countdown > 0) return false;
    if (!isNative) {
      recaptchaVerifierRef.current = null;
      setRecaptchaReady(false);
    }
    return sendOTP(phoneNumber);
  }, [countdown, phoneNumber]);

  const reset = useCallback(() => {
    setStep('phone');
    setLoading(false);
    setError(null);
    setCountdown(0);
    setPhoneNumber('');
    setIsExistingUser(false);
    setFailedAttempts(0);
    confirmationResultRef.current = null;
    verificationIdRef.current = null;
  }, []);

  return {
    step,
    loading,
    error,
    countdown,
    checkPhoneAndProceed,
    verifyOTP,
    resendOTP,
    reset,
    phoneNumber,
    isExistingUser,
    recaptchaReady,
  };
};
