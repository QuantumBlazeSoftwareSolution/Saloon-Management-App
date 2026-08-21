'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSaloonStore } from '@/store';
import { motion } from 'framer-motion';
import { ArrowLeft, Phone, Lock, ShieldAlert, ArrowRight } from 'lucide-react';
import Link from 'next/link';

export default function BarberLogin() {
  const router = useRouter();
  const login = useSaloonStore((state) => state.login);
  
  const [phone, setPhone] = useState('');
  const [pin, setPin] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!phone || phone.length < 9) {
      setError('Please enter a valid phone number');
      return;
    }
    if (pin.length !== 4) {
      setError('PIN must be exactly 4 digits');
      return;
    }

    setError('');
    setLoading(true);
    
    try {
      const { loginBarberAction } = await import('@/lib/actions/auth');
      const res = await loginBarberAction(phone, pin);
      setLoading(false);
      
      if (res.success && res.profile) {
        useSaloonStore.setState({
          currentProfile: res.profile as any,
          authRole: 'barber'
        });
        router.replace('/barber');
      } else {
        setError(res.error || 'Login failed. Invalid phone number or PIN.');
      }
    } catch (err: any) {
      setLoading(false);
      setError(err.message || 'An error occurred during sign-in.');
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
            Enter your mobile number and the 4-digit PIN assigned to you by the owner.
          </p>
        </div>

        {error && (
          <div className="flex items-center gap-2 rounded-xl bg-red-500/10 border border-red-500/20 p-3 text-red-400 text-xs mb-4">
            <ShieldAlert className="h-4 w-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
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

          <div>
            <label className="block text-zinc-400 text-xs font-semibold uppercase tracking-wider mb-2">
              Secret PIN Code
            </label>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-zinc-600" />
              <input
                type="password"
                maxLength={4}
                required
                placeholder="• • • •"
                value={pin}
                onChange={(e) => setPin(e.target.value.replace(/\D/g, ''))}
                className="w-full rounded-xl border border-zinc-800 bg-zinc-900/50 py-3.5 pl-12 pr-4 text-white placeholder-zinc-700 focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500 transition-all font-mono tracking-widest"
              />
            </div>
            <p className="text-[10px] text-zinc-600 mt-2">
              Demo defaults: phone <span className="font-mono">0777111222</span> & PIN <span className="font-mono">1234</span>
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
                <span>Verify & Sign In</span>
                <ArrowRight className="h-4 w-4" />
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
