'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSaloonStore } from '@/store';
import { motion } from 'framer-motion';
import { ArrowLeft, Mail, Lock, ShieldAlert } from 'lucide-react';
import Link from 'next/link';

export default function OwnerLogin() {
  const router = useRouter();
  const login = useSaloonStore((state) => state.login);
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Please fill in all fields');
      return;
    }
    setError('');
    setLoading(true);
    
    // Simulated sign-in
    setTimeout(() => {
      const success = login('owner', email);
      setLoading(false);
      if (success) {
        router.replace('/owner');
      } else {
        setError('Login failed. Invalid owner credentials.');
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
          <span className="text-xs font-bold text-yellow-500 uppercase tracking-widest">Administrative access</span>
          <h2 className="text-2xl font-extrabold text-white mt-1">Owner Sign In</h2>
          <p className="text-zinc-400 text-sm mt-1">
            Access the store settings, performance ledgers, and live charts.
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
                className="w-full rounded-xl border border-zinc-800 bg-zinc-900/50 py-3.5 pl-12 pr-4 text-white placeholder-zinc-600 focus:border-yellow-500 focus:outline-none focus:ring-1 focus:ring-yellow-500 transition-all"
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
                className="w-full rounded-xl border border-zinc-800 bg-zinc-900/50 py-3.5 pl-12 pr-4 text-white placeholder-zinc-600 focus:border-yellow-500 focus:outline-none focus:ring-1 focus:ring-yellow-500 transition-all"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 rounded-xl bg-yellow-500 py-3.5 px-4 font-semibold text-black hover:bg-yellow-400 disabled:opacity-50 transition-all cursor-pointer"
          >
            {loading ? (
              <div className="h-5 w-5 animate-spin rounded-full border-2 border-black border-t-transparent" />
            ) : (
              <span>Sign In Admin</span>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
