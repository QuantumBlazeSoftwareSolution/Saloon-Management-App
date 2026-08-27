'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSaloonStore } from '@/store';
import { motion } from 'framer-motion';
import { ArrowLeft, ShieldAlert, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { loginWithGoogleAction } from '@/lib/actions/google-auth';
import { signInWithPopup, GoogleAuthProvider } from 'firebase/auth';
import { auth } from '@/lib/firebase';

export default function OwnerLogin() {
  const router = useRouter();
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

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
            Sign in using your linked Google identity to access store settings, staff earnings, and perform ledgers.
          </p>
        </div>

        {error && (
          <div className="flex items-center gap-2 rounded-xl bg-red-500/10 border border-red-500/20 p-3 text-red-400 text-xs mb-4 animate-shake">
            <ShieldAlert className="h-4 w-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <div className="border border-zinc-900 bg-zinc-900/30 rounded-2xl p-6 space-y-6">
          <div className="text-center space-y-1">
            <span className="text-[10px] uppercase tracking-wider text-zinc-550 font-bold block">Google Identity Verification</span>
            <p className="text-[11px] text-zinc-500 leading-normal">
              Your Google email must match the address used in your setup invitation link.
            </p>
          </div>

          <button
            type="button"
            onClick={handleGoogleLogin}
            disabled={loading}
            className="w-full flex items-center justify-center gap-2.5 rounded-xl bg-white hover:bg-zinc-100 py-4 px-4 font-bold text-zinc-950 disabled:opacity-50 transition-all cursor-pointer text-sm shadow-md"
          >
            {loading ? (
              <Loader2 className="h-5 w-5 animate-spin text-zinc-950" />
            ) : (
              <>
                <svg className="h-4 w-4 shrink-0" viewBox="0 0 24 24" width="24" height="24" xmlns="http://www.w3.org/2000/svg">
                  <path d="M21.35,11.1H12v2.7h5.38c-0.24,1.28 -0.96,2.37 -2.04,3.1v2.58h3.3c1.93,-1.78 3.04,-4.4 3.04,-7.38c0,-0.74 -0.07,-1.46 -0.2,-2.1z" fill="#4285f4" />
                  <path d="M12,20.7c2.35,0 4.32,-0.78 5.76,-2.1l-3.3,-2.58c-0.91,0.61 -2.09,0.98 -3.36,0.98c-2.58,0 -4.78,-1.75 -5.56,-4.1H2.1v2.66c1.47,2.92 4.5,4.92 8.02,4.92z" fill="#34a853" />
                  <path d="M6.44,12.9c-0.2,-0.61 -0.32,-1.27 -0.32,-1.95s0.12,-1.34 0.32,-1.95V6.34H2.1C1.36,7.82 0.94,9.5 0.94,11s0.42,3.18 1.16,4.66l3.3,-2.58c-0.08,-0.22 -0.16,-0.47 -0.22,-0.72z" fill="#fbbc05" />
                  <path d="M12,5.2c1.28,0 2.43,0.44 3.34,1.3l2.5,-2.5C16.32,2.56 14.35,1.7 12,1.7c-3.52,0 -6.55,2 -8.02,4.92l3.3,2.58c0.78,-2.35 2.98,-4.1 5.56,-4.1z" fill="#ea4335" />
                </svg>
                <span>Sign in with Google</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
