'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSaloonStore } from '@/store';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Mail, Lock, ShieldAlert, Key } from 'lucide-react';
import Link from 'next/link';
import { sendOwnerOtpAction, verifyOwnerOtpAction } from '@/lib/actions/profiles';

export default function OwnerLogin() {
  const router = useRouter();
  const login = useSaloonStore((state) => state.login);
  
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
      // Send OTP to owner email using nodemailer action
      const res = await sendOwnerOtpAction(email);
      setLoading(false);
      
      if (res.success) {
        setStep('otp');
      } else {
        setError(res.error || 'Failed to dispatch email verification OTP.');
      }
    } catch (err: any) {
      setLoading(false);
      setError(err.message || 'An error occurred. Check email service config.');
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

      if (res.success) {
        // Hydrate Zustand local session
        const storeLoginSuccess = login('owner', email);
        if (storeLoginSuccess) {
          router.replace('/owner');
        } else {
          setError('Failed to configure local session storage.');
        }
      } else {
        setError(res.error || 'Invalid or expired verification code.');
      }
    } catch (err: any) {
      setLoading(false);
      setError(err.message || 'OTP verification process encountered an error.');
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
            <motion.form
              key="credentials-form"
              initial={{ opacity: 0, x: -15 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 15 }}
              onSubmit={handleCredentialsSubmit}
              className="space-y-4"
            >
              <div>
                <label className="block text-zinc-400 text-xs font-semibold uppercase tracking-wider mb-2">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-zinc-600" />
                  <input
                    type="email"
                    required
                    placeholder="e.g. marcus@saloon.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full rounded-xl border border-zinc-800 bg-zinc-900/50 py-3.5 pl-12 pr-4 text-white placeholder-zinc-650 focus:border-yellow-500 focus:outline-none focus:ring-1 focus:ring-yellow-500 transition-all text-sm"
                  />
                </div>
                <p className="text-[10px] text-zinc-600 mt-2">
                  Demo value: <span className="font-mono">marcus@saloon.com</span> (or any email).
                </p>
              </div>

              <div>
                <label className="block text-zinc-400 text-xs font-semibold uppercase tracking-wider mb-2">
                  Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-zinc-600" />
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
                  <div className="h-5 w-5 animate-spin rounded-full border-2 border-black border-t-transparent" />
                ) : (
                  <span>Send verification Code</span>
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
                  <Key className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-zinc-600" />
                  <input
                    type="text"
                    maxLength={6}
                    required
                    placeholder="e.g. 123456"
                    value={otpCode}
                    onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ''))}
                    className="w-full rounded-xl border border-zinc-800 bg-zinc-900/50 py-3.5 pl-12 pr-4 text-white placeholder-zinc-700 focus:border-yellow-500 focus:outline-none focus:ring-1 focus:ring-yellow-500 transition-all font-mono tracking-widest text-center text-lg"
                  />
                </div>
                <p className="text-[10px] text-zinc-650 mt-2 text-center">
                  Verification OTP code sent to <span className="font-mono text-zinc-400">{email}</span>
                </p>
              </div>

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setStep('credentials')}
                  className="flex-1 py-3 px-4 rounded-xl border border-zinc-800 text-zinc-400 font-semibold hover:bg-zinc-900 hover:text-white transition-all cursor-pointer text-sm"
                >
                  Change Email
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 flex items-center justify-center gap-2 rounded-xl bg-yellow-500 py-3 px-4 font-semibold text-black hover:bg-yellow-400 disabled:opacity-50 transition-all cursor-pointer text-sm"
                >
                  {loading ? (
                    <div className="h-5 w-5 animate-spin rounded-full border-2 border-black border-t-transparent" />
                  ) : (
                    <span>Verify Code</span>
                  )}
                </button>
              </div>
            </motion.form>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
