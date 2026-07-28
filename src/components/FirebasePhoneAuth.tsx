import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2, ArrowLeft, ArrowRight, RefreshCw, CheckCircle } from 'lucide-react';
import { CountryCodeSelector } from './CountryCodeSelector';
import { useFirebasePhoneAuth } from '@/hooks/useFirebasePhoneAuth';
import { cn } from '@/lib/utils';

interface OTPInputProps {
  length?: number;
  value: string;
  onChange: (value: string) => void;
  onComplete?: (value: string) => void;
  disabled?: boolean;
}

const OTPInput: React.FC<OTPInputProps> = ({ 
  length = 6, 
  value, 
  onChange, 
  onComplete,
  disabled 
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
        <Input
          key={index}
          ref={(el) => (inputRefs.current[index] = el)}
          type="text"
          inputMode="numeric"
          maxLength={1}
          value={value[index] || ''}
          onChange={(e) => handleChange(index, e.target.value)}
          onKeyDown={(e) => handleKeyDown(index, e)}
          disabled={disabled}
          className={cn(
            "w-12 h-14 text-center text-workspace font-bold",
            "border-2 rounded-xl transition-all duration-200 text-white bg-[#12132A]",
            value[index] 
              ? "border-cyan-400 bg-cyan-500/10" 
              : "border-purple-500/30 bg-[#12132A]",
            disabled && "opacity-50 cursor-not-allowed"
          )}
          autoFocus={index === 0}
        />
      ))}
    </div>
  );
};

export const FirebasePhoneAuth: React.FC = () => {
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
      {/* Hidden reCAPTCHA container */}
      <style>{`
        .grecaptcha-badge { visibility: hidden !important; }
      `}</style>
      <div id="recaptcha-container" />

      <div className="w-full space-y-5 text-center">
        <div className="space-y-1">
          <h2 className="text-2xl font-bold text-white tracking-tight">
            {step === 'phone' ? 'Welcome' : 'Verify Phone'}
          </h2>
          <p className="text-xs text-slate-400 font-medium">
            {step === 'phone' 
              ? 'Enter your phone number to continue' 
              : `Enter the 6-digit OTP sent to ${countryCode} ${phoneNumber}`}
          </p>
        </div>

        <div className="space-y-5 text-left">
          {/* Error Display */}
          {error && (
            <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-xl text-xs font-medium text-red-400">
              {error}
            </div>
          )}

          {/* Phone Number Input */}
          {step === 'phone' && (
            <form onSubmit={handlePhoneSubmit} className="space-y-4">
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

              <Button 
                type="submit" 
                className="w-full h-12 bg-gradient-to-r from-[#7C3AED] via-[#3B82F6] to-[#06B6D4] hover:from-[#6D28D9] hover:to-[#0891B2] text-white font-semibold text-sm rounded-2xl shadow-lg shadow-purple-500/20 hover:shadow-cyan-500/30 transition-all duration-300 active:scale-[0.99]"
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
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </>
                )}
              </Button>
            </form>
          )}

          {/* OTP Verification (New Users Only) */}
          {step === 'otp' && (
            <div className="space-y-4">
              <Button
                variant="ghost"
                onClick={handleBack}
                className="text-xs text-slate-400 hover:text-white hover:bg-white/5 rounded-lg h-8 px-2"
                disabled={loading}
              >
                <ArrowLeft className="mr-1.5 h-3.5 w-3.5" />
                Change Number
              </Button>

              <div className="space-y-4">
                <OTPInput
                  length={6}
                  value={otp}
                  onChange={setOtp}
                  onComplete={handleOTPComplete}
                  disabled={loading}
                />

                {/* Resend Timer */}
                <div className="text-center">
                  {countdown > 0 ? (
                    <p className="text-xs text-slate-400">
                      Resend OTP in <span className="font-semibold text-cyan-400">{countdown}s</span>
                    </p>
                  ) : (
                    <Button
                      variant="ghost"
                      onClick={handleResend}
                      disabled={loading}
                      className="text-xs text-cyan-400 hover:text-cyan-300"
                    >
                      <RefreshCw className="mr-1.5 h-3.5 w-3.5" />
                      Resend OTP
                    </Button>
                  )}
                </div>
              </div>

              <Button
                onClick={() => handleOTPComplete(otp)}
                disabled={loading || otp.length < 6}
                className="w-full h-12 bg-gradient-to-r from-[#7C3AED] via-[#3B82F6] to-[#06B6D4] hover:from-[#6D28D9] hover:to-[#0891B2] text-white font-semibold text-sm rounded-2xl shadow-lg shadow-purple-500/20 hover:shadow-cyan-500/30 transition-all duration-300"
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Verifying...
                  </>
                ) : (
                  <>
                    Verify OTP
                    <CheckCircle className="ml-2 h-4 w-4" />
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
