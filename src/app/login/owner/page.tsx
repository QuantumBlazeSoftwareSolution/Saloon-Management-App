'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSaloonStore } from '@/store';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Mail, Lock, ShieldAlert, Key, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { loginOwnerAction, verifyOwnerOtpAction } from '@/lib/actions/auth';
import { loginWithGoogleAction } from '@/lib/actions/google-auth';
import { signInWithPopup, GoogleAuthProvider } from 'firebase/auth';
import { auth } from '@/lib/firebase';

export default function OwnerLogin() {
  const router = useRouter();
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [otpCode, setOtpCode] = useState('');
  const [step, setStep] = useState<'credentials' | 'otp'>('credentials');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleCredentialsSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Please fill in all fields');
      return;
    }
    setError('');
    setLoading(true);

    try {
      const res = await loginOwnerAction(email, password);
      setLoading(false);
      
      if (res.success) {
        setStep('otp');
      } else {
        setError(res.error || 'Failed to verify credentials.');
      }
    } catch (err: any) {
      setLoading(false);
      setError('An error occurred during authentication.');
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
      const res = await verifyOwnerOtpAction(email, otpCode);
      setLoading(false);

      if (res.success && res.profile) {
        useSaloonStore.setState({
          currentProfile: res.profile as any,
          authRole: 'owner'
        });
        router.replace('/owner');
      } else {
        setError(res.error || 'Invalid or expired verification code.');
      }
    } catch (err: any) {
      setLoading(false);
      setError('OTP verification process encountered an error.');
    }
  };

  const handleGoogleLogin = async () => {
    setError('');
    setLoading(true);
    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      const idToken = await result.user.getIdToken();
      
      const res = await loginWithGoogleAction(idToken);
      if (res.success && res.profile) {
        useSaloonStore.setState({
          currentProfile: res.profile as any,
          authRole: 'owner'
        });
        router.replace('/owner');
      } else {
        setError(res.error || 'No saloon owner account linked to this Google profile.');
      }
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Google Sign-In authentication failed.');
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
          <span className="text-xs font-bold text-yellow-500 uppercase tracking-widest">Administrative access</span>
          <h2 className="text-2xl font-extrabold text-white mt-1">Owner Sign In</h2>
          <p className="text-zinc-400 text-sm mt-1">
            {step === 'credentials' 
              ? 'Access the store settings, performance ledgers, and live charts.'
              : 'Enter the 6-digit OTP code sent to your email.'}
          </p>
        </div>

        {error && (
          <div className="flex items-center gap-2 rounded-xl bg-red-500/10 border border-red-500/20 p-3 text-red-400 text-xs mb-4">
            <ShieldAlert className="h-4 w-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <AnimatePresence mode="wait">
          {step === 'credentials' ? (
            <motion.div
              key="credentials-view"
              initial={{ opacity: 0, x: -15 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 15 }}
              className="space-y-4"
            >
              <form onSubmit={handleCredentialsSubmit} className="space-y-4">
                <div>
                  <label className="block text-zinc-400 text-xs font-semibold uppercase tracking-wider mb-2">
                    Email Address
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-zinc-650" />
                    <input
                      type="email"
                      required
                      placeholder="e.g. owner@saloon.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full rounded-xl border border-zinc-800 bg-zinc-900/50 py-3.5 pl-12 pr-4 text-white placeholder-zinc-650 focus:border-yellow-500 focus:outline-none focus:ring-1 focus:ring-yellow-500 transition-all text-sm"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-zinc-400 text-xs font-semibold uppercase tracking-wider mb-2">
                    Password
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-zinc-650" />
                    <input
                      type="password"
                      required
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full rounded-xl border border-zinc-800 bg-zinc-900/50 py-3.5 pl-12 pr-4 text-white placeholder-zinc-700 focus:border-yellow-500 focus:outline-none focus:ring-1 focus:ring-yellow-500 transition-all text-sm"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full flex items-center justify-center gap-2 rounded-xl bg-yellow-500 py-3.5 px-4 font-semibold text-black hover:bg-yellow-400 disabled:opacity-50 transition-all cursor-pointer text-sm"
                >
                  {loading ? (
                    <Loader2 className="h-5 w-5 animate-spin text-black" />
                  ) : (
                    <span>Send Verification Code</span>
                  )}
                </button>
              </form>

              <div className="relative flex items-center justify-center py-2">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-zinc-850" />
                </div>
                <span className="relative px-3 bg-zinc-950 text-[10px] text-zinc-550 uppercase tracking-widest font-bold">Or</span>
              </div>

              <button
                type="button"
                onClick={handleGoogleLogin}
                disabled={loading}
                className="w-full flex items-center justify-center gap-2 rounded-xl bg-white hover:bg-zinc-100 py-3.5 px-4 font-bold text-zinc-950 disabled:opacity-50 transition-all cursor-pointer text-sm shadow-md"
              >
                {loading ? (
                  <Loader2 className="h-4 w-4 animate-spin text-zinc-950" />
                ) : (
                  <>
                    <svg className="h-4 w-4 mr-1" viewBox="0 0 24 24" width="24" height="24" xmlns="http://www.w3.org/2000/svg">
                      <g transform="matrix(1, 0, 0, 1, 0, 0)">
                        <path d="M21.35,11.1H12v2.7h5.38c-0.24,1.28 -0.96,2.37 -2.04,3.1v2.58h3.3c1.93,-1.78 3.04,-4.4 3.04,-7.38c0,-0.74 -0.07,-1.46 -0.2,-2.1c0,0 0,0 0,0Z" fill="#4285f4" />
                        <path d="M12,20.7c2.35,0 4.32,-0.78 5.76,-2.1l-3.3,-2.58c-0.91,0.61 -2.09,0.98 -3.36,0.98c-2.58,0 -4.78,-1.75 -5.56,-4.1H2.1v2.66c1.47,2.92 4.5,4.92 8.02,4.92Z" fill="#34a853" />
                        <path d="M6.44,12.9c-0.2,-0.61 -0.32,-1.27 -0.32,-1.95s0.12,-1.34 0.32,-1.95V6.34H2.1C1.36,7.82 0.94,9.5 0.94,11s0.42,3.18 1.16,4.66l3.3,-2.58c-0.08,-0.22 -0.16,-0.47 -0.22,-0.72c0.14,-0.12 0.16,-0.16 0.16,-0.16Z" fill="#fbbc05" />
                        <path d="M12,5.2c1.28,0 2.43,0.44 3.34,1.3l2.5,-2.5C16.32,2.56 14.35,1.7 12,1.7c-3.52,0 -6.55,2 -8.02,4.92l3.3,2.58c0.78,-2.35 2.98,-4.1 5.56,-4.1Z" fill="#ea4335" />
                      </g>
                    </svg>
                    <span>Sign in with Google</span>
                  </>
                )}
              </button>
            </motion.div>
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
                    className="w-full rounded-xl border border-zinc-800 bg-zinc-900/50 py-3.5 pl-12 pr-4 text-white placeholder-zinc-700 focus:border-yellow-500 focus:outline-none focus:ring-1 focus:ring-yellow-500 transition-all font-mono tracking-widest text-center text-lg animate-pulse"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full flex items-center justify-center gap-2 rounded-xl bg-yellow-500 py-3.5 px-4 font-semibold text-black hover:bg-yellow-400 disabled:opacity-50 transition-all cursor-pointer text-sm"
              >
                {loading ? (
                  <Loader2 className="h-5 w-5 animate-spin text-black" />
                ) : (
                  <span>Verify OTP Code</span>
                )}
              </button>
            </motion.form>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
