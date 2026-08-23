'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { ShieldAlert, Key, CheckCircle, Loader2 } from 'lucide-react';
import { resetPasswordAction } from '@/lib/actions/auth';

function ResetPasswordForm() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const [email, setEmail] = useState('');
  const [token, setToken] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const paramEmail = searchParams.get('email') || '';
    const paramToken = searchParams.get('token') || '';
    setEmail(paramEmail);
    setToken(paramToken);
  }, [searchParams]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!email || !token) {
      setError('Invalid reset link parameters.');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setLoading(true);
    try {
      const res = await resetPasswordAction(token, email, password);
      setLoading(false);
      if (res.success) {
        setSuccess(true);
      } else {
        setError(res.error || 'Failed to set password.');
      }
    } catch (err: any) {
      setLoading(false);
      setError('Error occurred during reset.');
    }
  };

  return (
    <div className="flex min-h-screen flex-col justify-center bg-zinc-950 px-6 py-12">
      <div className="mx-auto w-full max-w-sm">
        <div className="mb-6">
          <div className="h-10 w-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-500 mb-4">
            <Key className="h-5 w-5" />
          </div>
          <span className="text-xs font-bold text-amber-500 uppercase tracking-widest">Security setup</span>
          <h2 className="text-2xl font-extrabold text-white mt-1">Set Up Password</h2>
          <p className="text-zinc-400 text-sm mt-1">
            Choose a secure password for your owner credentials to finalize system provisioning.
          </p>
        </div>

        {error && (
          <div className="flex items-center gap-2 rounded-xl bg-red-500/10 border border-red-500/20 p-3 text-red-400 text-xs mb-4">
            <ShieldAlert className="h-4 w-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {success ? (
          <div className="space-y-4">
            <div className="flex items-center gap-2.5 rounded-xl bg-green-500/10 border border-green-500/20 p-3.5 text-green-400 text-xs">
              <CheckCircle className="h-5 w-5 shrink-0" />
              <div>
                <p className="font-bold text-white">Password configured successfully!</p>
                <p className="text-zinc-400 mt-0.5">Your setup is complete. You can now log into your saloon platform.</p>
              </div>
            </div>
            <button
              onClick={() => router.replace('/login')}
              className="w-full py-2.5 bg-zinc-900 border border-zinc-800 hover:bg-zinc-800 active:scale-[0.98] transition-all rounded-xl text-sm font-bold text-white flex items-center justify-center"
            >
              Go to Login
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-zinc-400 mb-1.5">Email Address</label>
              <input
                type="email"
                disabled
                value={email}
                className="w-full px-4 py-2 bg-zinc-900/50 border border-zinc-800 rounded-xl text-sm text-zinc-500 cursor-not-allowed"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-zinc-400 mb-1.5">New Password</label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Minimum 6 characters"
                className="w-full px-4 py-2 bg-zinc-900 border border-zinc-800 rounded-xl text-sm text-white focus:outline-none focus:border-amber-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-zinc-400 mb-1.5">Confirm Password</label>
              <input
                type="password"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Repeat password"
                className="w-full px-4 py-2 bg-zinc-900 border border-zinc-800 rounded-xl text-sm text-white focus:outline-none focus:border-amber-500"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 bg-amber-500 hover:bg-amber-400 active:scale-[0.98] transition-all rounded-xl text-sm font-bold text-black flex items-center justify-center gap-2"
            >
              {loading && <Loader2 className="h-4 w-4 animate-spin" />}
              <span>Save & Finalize Setup</span>
            </button>
          </form>
        )}
      </div>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center text-zinc-500 text-xs font-mono uppercase tracking-widest gap-2">
        <Loader2 className="h-4 w-4 animate-spin text-amber-500" />
        <span>Loading setup secure session...</span>
      </div>
    }>
      <ResetPasswordForm />
    </Suspense>
  );
}
