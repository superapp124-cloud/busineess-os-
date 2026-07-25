import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
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
 "border-2 rounded-xl transition-all duration-200",
 value[index] 
 ? "border-primary bg-primary/5" 
 : "border-muted-foreground/30 bg-background",
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
 phoneNumber: verifiedPhone,
 } = useFirebasePhoneAuth();

 const [phoneNumber, setPhoneNumber] = useState('');
 const [countryCode, setCountryCode] = useState('+91');
 const [otp, setOtp] = useState('');

 const handlePhoneSubmit = async (e: React.FormEvent) => {
 e.preventDefault();
 
 if (phoneNumber.length < 10) {
 return;
 }

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

      <div className="w-full space-y-6">
        <div className="space-y-1">
          <h2 className="text-xl font-bold text-slate-900">
            {step === 'phone' ? 'Welcome' : 'Verify Phone'}
          </h2>
          <p className="text-xs text-slate-500">
            {step === 'phone' 
              ? 'Enter your phone number to continue' 
              : `Enter the 6-digit OTP sent to ${countryCode} ${phoneNumber}`}
          </p>
        </div>

        <div className="space-y-5">
          {/* Error Display */}
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs font-medium text-red-600">
              {error}
            </div>
          )}

          {/* Phone Number Input */}
          {step === 'phone' && (
            <form onSubmit={handlePhoneSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="phone" className="text-xs font-semibold text-slate-700">
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
                    className="flex-1 h-11 text-sm bg-white border border-slate-200 text-slate-900 focus:border-[#8B5CF6] focus:ring-1 focus:ring-[#8B5CF6] rounded-xl transition-all placeholder:text-slate-400"
                    required
                    autoFocus
                    maxLength={15}
                  />
                </div>
                <p className="text-[11px] text-slate-400 mt-2 leading-relaxed">
                  New users will receive a verification OTP. Existing users login instantly.
                </p>
              </div>

              <Button 
                type="submit" 
                className="w-full h-12 bg-[#8B5CF6] hover:bg-[#7C3AED] text-white font-medium text-sm rounded-2xl shadow-sm transition-all"
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
                className="text-xs text-slate-500 hover:bg-slate-100 rounded-lg h-8 px-2"
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
                    <p className="text-xs text-slate-500">
                      Resend OTP in <span className="font-semibold text-[#8B5CF6]">{countdown}s</span>
                    </p>
                  ) : (
                    <Button
                      variant="ghost"
                      onClick={handleResend}
                      disabled={loading}
                      className="text-xs text-[#8B5CF6] hover:text-[#7C3AED]"
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
                className="w-full h-12 bg-[#8B5CF6] hover:bg-[#7C3AED] text-white font-medium text-sm rounded-2xl shadow-sm transition-all"
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
