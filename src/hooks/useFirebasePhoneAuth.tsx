import { useState, useCallback, useRef, useEffect } from 'react';
import { 
 RecaptchaVerifier, 
 signInWithPhoneNumber, 
 ConfirmationResult,
} from 'firebase/auth';
import { auth } from '@/firebase';
import { supabase } from '@/integrations/supabase/client';


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
 const [recaptchaReady, setRecaptchaReady] = useState(false);
 
 const confirmationResultRef = useRef<ConfirmationResult | null>(null);
 const recaptchaVerifierRef = useRef<RecaptchaVerifier | null>(null);

 // PRE-INITIALIZE reCAPTCHA on mount for instant OTP
 useEffect(() => {
 const initRecaptcha = async () => {
 try {
 const container = document.getElementById('recaptcha-container');
 if (container && !recaptchaVerifierRef.current) {
 container.innerHTML = '';
 recaptchaVerifierRef.current = new RecaptchaVerifier(auth, 'recaptcha-container', {
 size: 'invisible',
 });
 await recaptchaVerifierRef.current.render();
 setRecaptchaReady(true);
 }
 } catch (err) {
 console.warn('[reCAPTCHA] Pre-init failed, will retry on send');
 }
 };
 
 // Small delay to ensure DOM is ready
 const timer = setTimeout(initRecaptcha, 500);
 return () => clearTimeout(timer);
 }, []);

 useEffect(() => {
 if (countdown > 0) {
 const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
 return () => clearTimeout(timer);
 }
 }, [countdown]);

 /**
 * INSTANT CHECK: 1-second timeout for existing user check
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

 const sendOTP = async (phone: string): Promise<boolean> => {
 try {
 // Use pre-initialized reCAPTCHA or create new one
 if (!recaptchaVerifierRef.current) {
 const container = document.getElementById('recaptcha-container');
 if (container) container.innerHTML = '';
 
 recaptchaVerifierRef.current = new RecaptchaVerifier(auth, 'recaptcha-container', {
 size: failedAttempts >= 2 ? 'normal' : 'invisible',
 });
 }

 const confirmationResult = await signInWithPhoneNumber(auth, phone, recaptchaVerifierRef.current);
 confirmationResultRef.current = confirmationResult;
 
 setStep('otp');
 setCountdown(30); // Reduced from 60s
 setLoading(false);
 
 console.log('📱 [Auth] OTP sent successfully');

 return true;
 } catch (err: any) {
 console.error('[Firebase] OTP error:', err);
 setFailedAttempts(prev => prev + 1);
 
 let msg = 'Failed to send OTP';
 let waitTime = 0;
 
  if (err.code === 'auth/invalid-phone-number') {
    msg = 'Invalid phone number';
  } else if (err.code === 'auth/unauthorized-domain') {
    msg = 'Domain not authorized. Please add this domain to Firebase Console.';
  } else if (err.code === 'auth/too-many-requests') {
    msg = 'Too many attempts. Please wait or use Google login.';
    waitTime = 180;
  } else if (err.message?.includes('Hostname') || err.message?.includes('unauthorized')) {
    msg = 'Domain not authorized. Please add chatrchat.in to Firebase Console.';
  } else if (err.message?.includes('reCAPTCHA Timeout') || err.message?.includes('reCAPTCHA')) {
    msg = 'Security check timed out. Please try again.';
  } else {
    // Show exact firebase error to help debug
    msg = err.message || 'Failed to send OTP';
  }
  
  setError(msg);
 if (waitTime > 0) setCountdown(waitTime);
 setStep('phone');
 setLoading(false);
 recaptchaVerifierRef.current = null;
 return false;
 }
 };

 const verifyOTP = useCallback(async (otp: string): Promise<boolean> => {
 if (!confirmationResultRef.current) {
 setError('Session expired. Please try again.');
 return false;
 }

 setLoading(true);
 setError(null);

 try {
 // Step 1: Verify OTP with Firebase (~1-2s)
 const result = await confirmationResultRef.current.confirm(otp);
 const firebaseUser = result.user;
 
 const normalizedPhone = phoneNumber.replace(/\s/g, '');

 // Step 2: Use edge function to handle Supabase auth (handles password mismatch)
  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://sbayuqgomlflmxgicplz.supabase.co';
  const supabaseKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY || import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNiYXl1cWdvbWxmbG14Z2ljcGx6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTk0MTc2MDAsImV4cCI6MjA3NDk5MzYwMH0.gVSObpMtsv5W2nuLBHKT8G1_hXIprWXdn5l7Bnnj7jw';

  const response = await fetch(
    `${supabaseUrl}/functions/v1/firebase-phone-auth`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${supabaseKey}`,
      },
      body: JSON.stringify({
        phone_number: normalizedPhone,
        firebase_uid: firebaseUser.uid,
      }),
    }
  );

  const responseText = await response.text();
  let data: any = {};
  try {
    data = responseText ? JSON.parse(responseText) : {};
  } catch (e) {
    console.error('[OTP Verify] Edge function non-JSON response:', responseText);
    throw new Error(`Authentication server error (${response.status}). Please try again.`);
  }

  let session = data?.session;

  if (!session) {
    // Fallback: Direct Supabase authentication after Firebase OTP succeeds
    const email = `${normalizedPhone.replace(/\+/g, '')}@chatr.local`;
    const { data: signInData } = await supabase.auth.signInWithPassword({
      email,
      password: normalizedPhone,
    });
    if (signInData?.session) {
      session = signInData.session;
    } else {
      const { data: signUpData } = await supabase.auth.signUp({
        email,
        password: normalizedPhone,
        options: { data: { phone_number: normalizedPhone } }
      });
      session = signUpData?.session;
    }
  }

  if (session) {
    await supabase.auth.setSession({
      access_token: session.access_token,
      refresh_token: session.refresh_token,
    });
  }

 setLoading(false);
 return true;
 } catch (err: any) {
 console.error('[OTP Verify] Error:', err);
 const msg = err.code === 'auth/invalid-verification-code' 
 ? 'Invalid code. Please check and try again.' 
 : err.message || 'Verification failed';
 setError(msg);
 setLoading(false);
 return false;
 }
 }, [phoneNumber]);

 const resendOTP = useCallback(async (): Promise<boolean> => {
 if (countdown > 0) return false;
 recaptchaVerifierRef.current = null;
 setRecaptchaReady(false);
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
