'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSaloonStore } from '@/store';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Phone, ShieldAlert, ArrowRight, Loader2, Key } from 'lucide-react';
import Link from 'next/link';
import { RecaptchaVerifier, signInWithPhoneNumber } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { loginBarberWithPhoneAction } from '@/lib/actions/google-auth';

export default function BarberLogin() {
  const router = useRouter();
  
  const [phone, setPhone] = useState('');
  const [otpCode, setOtpCode] = useState('');
  const [step, setStep] = useState<'phone' | 'otp'>('phone');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [confirmationResult, setConfirmationResult] = useState<any>(null);

  // Setup reCAPTCHA verifier on component mount or step change
  useEffect(() => {
    if (step === 'phone') {
      try {
        if (!(window as any).recaptchaVerifier) {
          (window as any).recaptchaVerifier = new RecaptchaVerifier(auth, 'recaptcha-container', {
            size: 'invisible',
            callback: () => {
              console.log('reCAPTCHA solved');
            },
          });
        }
      } catch (err: any) {
        console.error('reCAPTCHA init error:', err);
      }
    }
  }, [step]);

  const formatPhoneNumber = (rawPhone: string) => {
    const cleanDigits = rawPhone.replace(/\D/g, '');
    // If it starts with 0, replace with +94
    if (cleanDigits.startsWith('0') && cleanDigits.length === 10) {
      return `+94${cleanDigits.slice(1)}`;
    }
    // If it starts with 94, prepend +
    if (cleanDigits.startsWith('94') && cleanDigits.length === 11) {
      return `+${cleanDigits}`;
    }
    // If it is already E.164-like (starts with country code without +)
    if (cleanDigits.length === 9) {
      return `+94${cleanDigits}`;
    }
    return `+${cleanDigits}`;
  };

  const handlePhoneSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!phone || phone.length < 9) {
      setError('Please enter a valid phone number');
      return;
    }

    setError('');
    setLoading(true);

    try {
      const formattedPhone = formatPhoneNumber(phone);
      const appVerifier = (window as any).recaptchaVerifier;
      
      const confirmation = await signInWithPhoneNumber(auth, formattedPhone, appVerifier);
      setConfirmationResult(confirmation);
      setStep('otp');
    } catch (err: any) {
      console.error('[handlePhoneSubmit] Error:', err);
      setError(err.message || 'Failed to send SMS OTP. Please check the number format.');
      // Reset reCAPTCHA on failure
      if ((window as any).recaptchaVerifier) {
        try {
          (window as any).recaptchaVerifier.clear();
          (window as any).recaptchaVerifier = null;
        } catch (e) {}
      }
    } finally {
      setLoading(false);
    }
  };

  const handleOtpVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    if (otpCode.length !== 6) {
      setError('Verification code must be exactly 6 digits');
      return;
    }

    setError('');
    setLoading(true);

    try {
      const result = await confirmationResult.confirm(otpCode);
      const idToken = await result.user.getIdToken();
      
      const res = await loginBarberWithPhoneAction(idToken);
      if (res.success && res.profile) {
        useSaloonStore.setState({
          currentProfile: res.profile as any,
          authRole: 'barber'
        });
        router.replace('/barber');
      } else {
        setError(res.error || 'No active staff barber account associated with this phone number.');
      }
    } catch (err: any) {
      console.error('[handleOtpVerify] Error:', err);
      setError(err.message || 'Invalid or expired OTP code.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col justify-center bg-zinc-950 px-6 py-12">
      <div className="mx-auto w-full max-w-sm">
        <Link 
          href="/login" 
          className="inline-flex items-center gap-2 text-zinc-500 hover:text-zinc-300 text-sm mb-8 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Back to roles</span>
        </Link>

        <div className="mb-6">
          <span className="text-xs font-bold text-amber-500 uppercase tracking-widest">Secure Access</span>
          <h2 className="text-2xl font-extrabold text-white mt-1">Barber Sign In</h2>
          <p className="text-zinc-400 text-sm mt-1">
            {step === 'phone' 
              ? 'Enter your registered mobile number to receive a secure SMS verification code.'
              : 'Enter the 6-digit OTP code sent to your phone.'}
          </p>
        </div>

        {error && (
          <div className="flex items-center gap-2 rounded-xl bg-red-500/10 border border-red-500/20 p-3 text-red-400 text-xs mb-4">
            <ShieldAlert className="h-4 w-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Hidden Container for Firebase Recaptcha */}
        <div id="recaptcha-container"></div>

        <AnimatePresence mode="wait">
          {step === 'phone' ? (
            <motion.form
              key="phone-form"
              initial={{ opacity: 0, x: -15 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 15 }}
              onSubmit={handlePhoneSubmit}
              className="space-y-4"
            >
              <div>
                <label className="block text-zinc-400 text-xs font-semibold uppercase tracking-wider mb-2">
                  Phone Number
                </label>
                <div className="relative">
                  <Phone className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-zinc-600" />
                  <input
                    type="tel"
                    required
                    placeholder="e.g. 0777111222"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value.replace(/\D/g, ''))}
                    className="w-full rounded-xl border border-zinc-800 bg-zinc-900/50 py-3.5 pl-12 pr-4 text-white placeholder-zinc-650 focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500 transition-all font-mono"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full flex items-center justify-center gap-2 rounded-xl bg-amber-500 py-3.5 px-4 font-semibold text-black hover:bg-amber-400 disabled:opacity-50 transition-all cursor-pointer text-sm"
              >
                {loading ? (
                  <Loader2 className="h-5 w-5 animate-spin text-black" />
                ) : (
                  <>
                    <span>Send Verification Code</span>
                    <ArrowRight className="h-4 w-4" />
                  </>
                )}
              </button>
            </motion.form>
          ) : (
            <motion.form
              key="otp-form"
              initial={{ opacity: 0, x: 15 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -15 }}
              onSubmit={handleOtpVerify}
              className="space-y-4"
            >
              <div>
                <label className="block text-zinc-400 text-xs font-semibold uppercase tracking-wider mb-2">
                  Security OTP Code
                </label>
                <div className="relative">
                  <Key className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-zinc-650" />
                  <input
                    type="text"
                    maxLength={6}
                    required
                    placeholder="e.g. 123456"
                    value={otpCode}
                    onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ''))}
                    className="w-full rounded-xl border border-zinc-800 bg-zinc-900/50 py-3.5 pl-12 pr-4 text-white placeholder-zinc-700 focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500 transition-all font-mono tracking-widest text-center text-lg animate-pulse"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full flex items-center justify-center gap-2 rounded-xl bg-amber-500 py-3.5 px-4 font-semibold text-black hover:bg-amber-400 disabled:opacity-50 transition-all cursor-pointer text-sm"
              >
                {loading ? (
                  <Loader2 className="h-5 w-5 animate-spin text-black" />
                ) : (
                  <span>Verify OTP Code</span>
                )}
              </button>

              <button
                type="button"
                onClick={() => {
                  setStep('phone');
                  setOtpCode('');
                }}
                className="w-full text-center text-xs text-zinc-500 hover:text-zinc-300 underline cursor-pointer"
              >
                Change Phone Number
              </button>
            </motion.form>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
