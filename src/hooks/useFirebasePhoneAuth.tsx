import { useState, useCallback, useRef, useEffect } from 'react';
import { 
  RecaptchaVerifier, 
  signInWithPhoneNumber, 
  ConfirmationResult,
} from 'firebase/auth';
import { Capacitor } from '@capacitor/core';
import { auth } from '@/firebase';
import { supabase } from '@/integrations/supabase/client';

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

      const confirmationResult = await signInWithPhoneNumber(auth, phone, verifier);
      confirmationResultRef.current = confirmationResult;
      
      setStep('otp');
      setCountdown(30);
      setLoading(false);
      
      console.log('📱 [Auth] OTP sent successfully (web)');
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
        msg = 'Invalid phone number';
      } else if (
        err.code === 'auth/unauthorized-domain' || 
        err.message?.includes('Hostname') ||
        (err.message?.includes('unauthorized') && !err.message?.includes('captcha'))
      ) {
        msg = `Domain (${window.location.hostname}) is not authorized for OTP in Firebase Console.`;
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

    const normalizedPhone = phone.replace(/\s/g, '');
    const cleanDigits = normalizedPhone.replace(/\+/g, '');
    const email = `${cleanDigits}@chatr.local`;

    try {
      // Instant login check for existing users
      const { data } = await supabase.auth.signInWithPassword({
        email,
        password: normalizedPhone,
      });
      
      if (data?.session) {
        setIsExistingUser(true);
        console.log('✅ [Auth] Existing user authenticated instantly');
        setLoading(false);
        return true;
      }
    } catch {
      // Continue to OTP verification for new users
    }

    // New user - send verification OTP immediately
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

    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://sbayuqgomlflmxgicplz.supabase.co';
    const supabaseKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY || import.meta.env.VITE_SUPABASE_ANON_KEY;

    let session: { access_token?: string; refresh_token?: string } | null = null;

    if (supabaseUrl && supabaseKey) {
      try {
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
          if (data?.session?.access_token && data?.session?.refresh_token) {
            session = data.session;
          } else if (data?.error || data?.message) {
            console.error('[Auth Exchange] Edge function error response:', data.error || data.message);
          }
        }
      } catch (e) {
        console.warn('[Auth Exchange] Edge function call failed:', e);
      }
    }

    // Direct fallback if edge function is unavailable or didn't return a session
    if (!session && firebaseUid) {
      const deterministicPassword = `${cleanDigits}_${firebaseUid.slice(0, 10)}`;
      const { data: signInData } = await supabase.auth.signInWithPassword({
        email,
        password: deterministicPassword,
      });

      if (signInData?.session) {
        session = signInData.session;
      }
    }

    if (session?.access_token && session?.refresh_token) {
      await supabase.auth.setSession({
        access_token: session.access_token,
        refresh_token: session.refresh_token,
      });
      return true;
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
