'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSaloonStore } from '@/store';
import { Shield, Mail, Lock, ShieldAlert } from 'lucide-react';
import { loginAdminAction } from '@/lib/actions/auth';

export default function AdminLogin() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Please fill in all fields');
      return;
    }
    setError('');
    setLoading(true);

    try {
      const res = await loginAdminAction(email, password);
      setLoading(false);
      
      if (res.success && res.profile) {
        useSaloonStore.setState({
          currentProfile: res.profile as any,
          authRole: 'admin'
        });
        router.replace('/developer-back-door/dashboard');
      } else {
        setError(res.error || 'Failed to verify admin credentials.');
      }
    } catch (err: any) {
      setLoading(false);
      setError('An error occurred during authentication.');
    }
  };

  return (
    <div className="flex min-h-screen flex-col justify-center bg-zinc-950 px-6 py-12">
      <div className="mx-auto w-full max-w-sm">
        <div className="mb-6">
          <div className="h-10 w-10 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-500 mb-4">
            <Shield className="h-5 w-5" />
          </div>
          <span className="text-xs font-bold text-purple-500 uppercase tracking-widest">Platform Backdoor</span>
          <h2 className="text-2xl font-extrabold text-white mt-1">Super Admin</h2>
          <p className="text-zinc-400 text-sm mt-1">
            Access developer configurations, manage tenants, and provisioning control logs.
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
            <label className="block text-xs font-bold text-zinc-400 mb-1.5">Email Address</label>
            <div className="relative">
              <Mail className="absolute left-3 top-2.5 h-4 w-4 text-zinc-500" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="developer@platform.com"
                className="w-full pl-10 pr-4 py-2 bg-zinc-900 border border-zinc-800 rounded-xl text-sm text-white focus:outline-none focus:border-purple-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-zinc-400 mb-1.5">Master Password</label>
            <div className="relative">
              <Lock className="absolute left-3 top-2.5 h-4 w-4 text-zinc-500" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-10 pr-4 py-2 bg-zinc-900 border border-zinc-800 rounded-xl text-sm text-white focus:outline-none focus:border-purple-500"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 bg-purple-600 hover:bg-purple-500 active:scale-[0.98] transition-all rounded-xl text-sm font-bold text-white shadow-lg shadow-purple-600/10 flex items-center justify-center gap-2"
          >
            {loading ? 'Authenticating...' : 'Sign In to Backdoor'}
          </button>
        </form>
      </div>
    </div>
  );
}
