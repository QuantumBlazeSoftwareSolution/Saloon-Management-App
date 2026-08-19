'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSaloonStore } from '@/store';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Phone, ShieldAlert, ArrowRight } from 'lucide-react';
import Link from 'next/link';

export default function BarberLogin() {
  const router = useRouter();
  const login = useSaloonStore((state) => state.login);
  
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [step, setStep] = useState<'phone' | 'otp'>('phone');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handlePhoneSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!phone || phone.length < 9) {
      setError('Please enter a valid phone number');
      return;
    }
    setError('');
    setLoading(true);
    // Simulate sending OTP
    setTimeout(() => {
      setLoading(false);
      setStep('otp');
    }, 800);
  };

  const handleOtpSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (otp.length < 4) {
      setError('OTP must be 4 digits');
      return;
    }
    setError('');
    setLoading(true);
    
    // Simulated verification
    setTimeout(() => {
      const success = login('barber', phone);
      setLoading(false);
      if (success) {
        router.replace('/barber');
      } else {
        setError('Login failed. Barber profile is inactive.');
      }
    }, 1000);
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
              ? 'Enter your mobile number to receive a one-time passkey.' 
              : 'Enter the 4-digit code sent to your mobile.'}
          </p>
        </div>

        {error && (
          <div className="flex items-center gap-2 rounded-xl bg-red-500/10 border border-red-500/20 p-3 text-red-400 text-xs mb-4">
            <ShieldAlert className="h-4 w-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <AnimatePresence mode="wait">
          {step === 'phone' ? (
            <motion.form
              key="phone-step"
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
                    className="w-full rounded-xl border border-zinc-800 bg-zinc-900/50 py-3.5 pl-12 pr-4 text-white placeholder-zinc-600 focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500 transition-all font-mono"
                  />
                </div>
                <p className="text-[10px] text-zinc-600 mt-2">
                  Demo values: <span className="font-mono">0777111222</span>, <span className="font-mono">0777333444</span>, or any new number to create a mock barber.
                </p>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full flex items-center justify-center gap-2 rounded-xl bg-amber-500 py-3.5 px-4 font-semibold text-black hover:bg-amber-400 disabled:opacity-50 transition-all cursor-pointer"
              >
                {loading ? (
                  <div className="h-5 w-5 animate-spin rounded-full border-2 border-black border-t-transparent" />
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
              key="otp-step"
              initial={{ opacity: 0, x: 15 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -15 }}
              onSubmit={handleOtpSubmit}
              className="space-y-4"
            >
              <div>
                <label className="block text-zinc-400 text-xs font-semibold uppercase tracking-wider mb-2">
                  Verification Code
                </label>
                <input
                  type="text"
                  maxLength={4}
                  required
                  placeholder="• • • •"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                  className="w-full text-center text-2xl tracking-[0.6em] rounded-xl border border-zinc-800 bg-zinc-900/50 py-3.5 text-white placeholder-zinc-700 focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500 transition-all font-mono"
                />
                <p className="text-[10px] text-zinc-600 mt-2">
                  Enter any 4-digit code (e.g. <span className="font-mono">1234</span>) to sign in.
                </p>
              </div>

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setStep('phone')}
                  className="flex-1 py-3.5 rounded-xl border border-zinc-800 text-zinc-400 font-semibold hover:bg-zinc-900 hover:text-white transition-all cursor-pointer"
                >
                  Change Phone
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 flex items-center justify-center gap-2 rounded-xl bg-amber-500 py-3.5 px-4 font-semibold text-black hover:bg-amber-400 disabled:opacity-50 transition-all cursor-pointer"
                >
                  {loading ? (
                    <div className="h-5 w-5 animate-spin rounded-full border-2 border-black border-t-transparent" />
                  ) : (
                    <span>Sign In</span>
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
