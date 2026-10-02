import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2, ArrowLeft, ArrowRight, RefreshCw, CheckCircle, Lock, ShieldCheck, Zap } from 'lucide-react';
import { CountryCodeSelector } from './CountryCodeSelector';
import { useFirebasePhoneAuth } from '@/hooks/useFirebasePhoneAuth';
import { cn } from '@/lib/utils';

interface FirebasePhoneAuthProps {
  variant?: 'dark' | 'light';
  hideHeader?: boolean;
}

interface OTPInputProps {
  length?: number;
  value: string;
  onChange: (value: string) => void;
  onComplete?: (value: string) => void;
  disabled?: boolean;
  isLight?: boolean;
}

const OTPInput: React.FC<OTPInputProps> = ({ 
  length = 6, 
  value, 
  onChange, 
  onComplete,
  disabled,
  isLight = false,
}) => {
  const inputRefs = React.useRef<(HTMLInputElement | null)[]>([]);

  // WebOTP API - Auto-read SMS on supported browsers (Chrome Android)
  React.useEffect(() => {
    if ('OTPCredential' in window) {
      const ac = new AbortController();
      navigator.credentials.get({
        // @ts-ignore - WebOTP API
        otp: { transport: ['sms'] },
        signal: ac.signal
      }).then((otp: any) => {
        if (otp?.code) {
          onChange(otp.code);
          onComplete?.(otp.code);
        }
      }).catch(() => {});
      
      return () => ac.abort();
    }
  }, [onChange, onComplete]);

  const handleChange = (index: number, inputValue: string) => {
    if (disabled) return;
    
    const digit = inputValue.replace(/\D/g, '').slice(-1);
    const newValue = value.split('');
    newValue[index] = digit;
    const result = newValue.join('').slice(0, length);
    onChange(result);

    if (digit && index < length - 1) {
      inputRefs.current[index + 1]?.focus();
    }

    if (result.length === length && onComplete) {
      onComplete(result);
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (disabled) return;
    
    if (e.key === 'Backspace' && !value[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    if (disabled) return;
    
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, length);
    onChange(pastedData);
    
    if (pastedData.length === length && onComplete) {
      onComplete(pastedData);
    }
  };

  return (
    <div className="flex gap-2 justify-center" onPaste={handlePaste}>
      {Array.from({ length }).map((_, index) => (
        <input
          key={index}
          ref={(el) => (inputRefs.current[index] = el)}
          type="text"
          inputMode="numeric"
          maxLength={1}
          value={value[index] || ''}
          onChange={(e) => handleChange(index, e.target.value)}
          onKeyDown={(e) => handleKeyDown(index, e)}
          disabled={disabled}
          autoFocus={index === 0}
          className={cn(
            'w-12 h-14 text-center text-xl font-bold rounded-xl border-2 transition-all duration-200 outline-none',
            isLight
              ? cn(
                  'bg-white text-gray-900',
                  value[index] ? 'border-indigo-500 shadow-sm shadow-indigo-100 ring-2 ring-indigo-50' : 'border-gray-200',
                  disabled && 'opacity-50 cursor-not-allowed'
                )
              : cn(
                  'bg-[#12132A] text-white',
                  value[index] ? 'border-cyan-400 bg-cyan-500/10' : 'border-purple-500/30',
                  disabled && 'opacity-50 cursor-not-allowed'
                )
          )}
        />
      ))}
    </div>
  );
};

export const FirebasePhoneAuth: React.FC<FirebasePhoneAuthProps> = ({
  variant = 'dark',
  hideHeader = false,
}) => {
  const {
    step,
    loading,
    error,
    countdown,
    checkPhoneAndProceed,
    verifyOTP,
    resendOTP,
    reset,
  } = useFirebasePhoneAuth();

  const [phoneNumber, setPhoneNumber] = useState('');
  const [countryCode, setCountryCode] = useState('+91');
  const [otp, setOtp] = useState('');

  const isLight = variant === 'light';

  const handlePhoneSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (phoneNumber.length < 10) return;
    const fullPhone = `${countryCode}${phoneNumber}`;
    await checkPhoneAndProceed(fullPhone);
  };

  const handleOTPComplete = async (code: string) => {
    await verifyOTP(code);
  };

  const handleResend = async () => {
    setOtp('');
    await resendOTP();
  };

  const handleBack = () => {
    setOtp('');
    reset();
  };

  return (
    <>
      <div id="recaptcha-container" />

      <div className="w-full space-y-5 text-center">
        {/* Header — hidden when hideHeader=true (in Image Two, header is in parent Auth.tsx) */}
        {!hideHeader && (
          <div className="space-y-1">
            <h2 className={cn('text-2xl font-bold tracking-tight', isLight ? 'text-gray-900' : 'text-white')}>
              {step === 'phone' ? 'Welcome' : 'Verify Phone'}
            </h2>
            <p className={cn('text-xs font-medium', isLight ? 'text-gray-500' : 'text-slate-400')}>
              {step === 'phone'
                ? 'Enter your phone number to continue'
                : `Enter the 6-digit OTP sent to ${countryCode} ${phoneNumber}`}
            </p>
          </div>
        )}

        <div className="space-y-4 text-left">
          {/* Error Display */}
          {error && (
            <div className={cn(
              'p-3 border rounded-xl text-xs font-medium',
              isLight
                ? 'bg-red-50 border-red-200 text-red-600'
                : 'bg-red-500/10 border-red-500/30 text-red-400'
            )}>
              {error}
            </div>
          )}

          {/* ── PHONE NUMBER STEP ── */}
          {step === 'phone' && (
            <form onSubmit={handlePhoneSubmit} className="space-y-5">
              {isLight ? (
                /* ── LIGHT VARIANT (MATCHING IMAGE TWO EXACTLY) ── */
                <div className="space-y-2">
                  <label htmlFor="phone" className="text-xs font-medium text-gray-700 block">
                    Phone Number
                  </label>
                  <div className="flex items-center h-[54px] bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm focus-within:border-indigo-400 focus-within:ring-2 focus-within:ring-indigo-100 transition-all">
                    <CountryCodeSelector
                      value={countryCode}
                      onChange={setCountryCode}
                      variant="light"
                      showCode={true}
                    />
                    <div className="w-px h-6 bg-gray-200 shrink-0 self-center" />
                    <input
                      id="phone"
                      type="tel"
                      placeholder="Your phone number"
                      value={phoneNumber}
                      onChange={(e) => setPhoneNumber(e.target.value.replace(/\D/g, ''))}
                      required
                      autoFocus
                      maxLength={15}
                      className="flex-1 h-full px-3.5 text-[15px] font-medium text-gray-900 bg-transparent outline-none placeholder:text-gray-400"
                    />
                  </div>
                  <div className="text-[12px] space-y-0.5 leading-relaxed pt-1">
                    <p className="text-gray-500 font-normal">New users will receive a verification OTP.</p>
                    <p className="font-semibold text-[#7C3AED]">Existing users login instantly.</p>
                  </div>
                </div>
              ) : (
                /* ── DARK VARIANT ── */
                <div className="space-y-2">
                  <Label htmlFor="phone" className="text-xs font-semibold text-white tracking-wide">
                    Phone Number
                  </Label>
                  <div className="flex gap-2.5">
                    <CountryCodeSelector
                      value={countryCode}
                      onChange={setCountryCode}
                    />
                    <Input
                      id="phone"
                      type="tel"
                      placeholder="Your phone number"
                      value={phoneNumber}
                      onChange={(e) => setPhoneNumber(e.target.value.replace(/\D/g, ''))}
                      className="flex-1 h-12 text-sm bg-[#12132A] border border-purple-500/30 text-white focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 rounded-xl transition-all placeholder:text-slate-500"
                      required
                      autoFocus
                      maxLength={15}
                    />
                  </div>
                  <div className="text-[12px] text-slate-400 mt-2 space-y-0.5 leading-relaxed">
                    <p>New users will receive a verification OTP.</p>
                    <p className="font-semibold text-white">Existing users login instantly.</p>
                  </div>
                </div>
              )}

              {/* Continue button */}
              <Button
                type="submit"
                className={cn(
                  'w-full font-semibold text-[15px] text-white shadow-lg transition-all duration-300 active:scale-[0.99] flex items-center justify-center gap-2',
                  isLight
                    ? 'h-[52px] rounded-full bg-gradient-to-r from-[#6366F1] via-[#8B5CF6] to-[#06B6D4] hover:opacity-95 shadow-indigo-500/25'
                    : 'h-12 rounded-2xl bg-gradient-to-r from-[#7C3AED] via-[#3B82F6] to-[#06B6D4] hover:from-[#6D28D9] hover:to-[#0891B2] shadow-purple-500/20 hover:shadow-cyan-500/30'
                )}
                disabled={loading || phoneNumber.length < 10}
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Checking...
                  </>
                ) : (
                  <>
                    Continue
                    <ArrowRight className="h-4 w-4 ml-1" />
                  </>
                )}
              </Button>

              <button
                type="button"
                onClick={async () => {
                  setPhoneNumber('9717100000');
                  await verifyOTP('123456', '+919717100000');
                }}
                className="w-full mt-2 py-2.5 px-3 rounded-xl bg-slate-800/80 border border-cyan-500/30 text-cyan-300 hover:bg-slate-700 text-xs font-semibold flex items-center justify-center gap-1.5 transition-all shadow-sm"
              >
                <Zap className="w-3.5 h-3.5 text-cyan-400" />
                Quick Demo Sign In
              </button>

              {/* Trust badges — light variant matching Image Two */}
              {isLight && (
                <div className="grid grid-cols-3 pt-6 mt-2 relative">
                  <div className="flex flex-col items-center gap-2 pr-1 border-r border-gray-100">
                    <div className="w-11 h-11 rounded-full bg-[#EDE9FE] flex items-center justify-center">
                      <Lock className="w-5 h-5 text-[#7C3AED]" strokeWidth={2} />
                    </div>
                    <span className="text-[11px] text-gray-700 font-medium text-center leading-tight whitespace-pre-line">
                      {'End-to-End\nEncrypted'}
                    </span>
                  </div>
                  <div className="flex flex-col items-center gap-2 px-1 border-r border-gray-100">
                    <div className="w-11 h-11 rounded-full bg-[#DBEAFE] flex items-center justify-center">
                      <ShieldCheck className="w-5 h-5 text-[#2563EB]" strokeWidth={2} />
                    </div>
                    <span className="text-[11px] text-gray-700 font-medium text-center leading-tight whitespace-pre-line">
                      {'Private\nby Design'}
                    </span>
                  </div>
                  <div className="flex flex-col items-center gap-2 pl-1">
                    <div className="w-11 h-11 rounded-full bg-[#D1FAE5] flex items-center justify-center">
                      <Zap className="w-5 h-5 text-[#059669]" strokeWidth={2} />
                    </div>
                    <span className="text-[11px] text-gray-700 font-medium text-center leading-tight whitespace-pre-line">
                      {'Instant\nSync'}
                    </span>
                  </div>
                </div>
              )}
            </form>
          )}

          {/* ── OTP VERIFICATION STEP ── */}
          {step === 'otp' && (
            <div className="space-y-4">
              <p className={cn('text-sm text-center font-medium', isLight ? 'text-gray-600' : 'text-slate-400')}>
                Enter the 6-digit OTP sent to {countryCode} {phoneNumber}
              </p>

              <Button
                variant="ghost"
                onClick={handleBack}
                className={cn(
                  'text-xs rounded-lg h-8 px-2 mx-auto flex items-center gap-1',
                  isLight
                    ? 'text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50'
                    : 'text-slate-400 hover:text-white hover:bg-white/5'
                )}
                disabled={loading}
              >
                <ArrowLeft className="h-3.5 w-3.5" />
                Change Number
              </Button>

              <div className="space-y-4 pt-2">
                <OTPInput
                  length={6}
                  value={otp}
                  onChange={setOtp}
                  onComplete={handleOTPComplete}
                  disabled={loading}
                  isLight={isLight}
                />

                {/* Resend Timer */}
                <div className="text-center">
                  {countdown > 0 ? (
                    <p className={cn('text-xs', isLight ? 'text-gray-500' : 'text-slate-400')}>
                      Resend OTP in <span className={cn('font-semibold', isLight ? 'text-indigo-600' : 'text-cyan-400')}>{countdown}s</span>
                    </p>
                  ) : (
                    <Button
                      variant="ghost"
                      onClick={handleResend}
                      disabled={loading}
                      className={cn('text-xs', isLight ? 'text-indigo-600 hover:text-indigo-700' : 'text-cyan-400 hover:text-cyan-300')}
                    >
                      <RefreshCw className="mr-1.5 h-3.5 w-3.5" />
                      Resend OTP
                    </Button>
                  )}
                </div>

                <button
                  type="button"
                  onClick={() => {
                    setOtp('123456');
                    handleOTPComplete('123456');
                  }}
                  className="w-full py-2.5 px-3 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 hover:bg-cyan-500/20 text-xs font-semibold flex items-center justify-center gap-1.5 transition-all shadow-sm"
                >
                  <Zap className="w-3.5 h-3.5 text-cyan-400" />
                  Auto-fill Test Code (123456)
                </button>
              </div>

              <Button
                onClick={() => handleOTPComplete(otp)}
                disabled={loading || otp.length < 6}
                className={cn(
                  'w-full font-semibold text-[15px] text-white shadow-lg transition-all duration-300 active:scale-[0.99] flex items-center justify-center gap-2',
                  isLight
                    ? 'h-[52px] rounded-full bg-gradient-to-r from-[#6366F1] via-[#8B5CF6] to-[#06B6D4] hover:opacity-95 shadow-indigo-500/25'
                    : 'h-12 rounded-2xl bg-gradient-to-r from-[#7C3AED] via-[#3B82F6] to-[#06B6D4] hover:from-[#6D28D9] hover:to-[#0891B2] shadow-purple-500/20 hover:shadow-cyan-500/30'
                )}
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Verifying...
                  </>
                ) : (
                  <>
                    Verify OTP
                    <CheckCircle className="ml-1 h-4 w-4" />
                  </>
                )}
              </Button>
            </div>
          )}
        </div>
      </div>
    </>
  );
};