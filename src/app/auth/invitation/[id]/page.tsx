'use client';

import { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import { getInvitationDetailsAction, linkGoogleAccountAction } from '@/lib/actions/google-auth';
import { useSaloonStore } from '@/store';
import { signInWithPopup, GoogleAuthProvider } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { Building2, Mail, Phone, Loader2, CheckCircle, AlertCircle, Sparkles } from 'lucide-react';

export default function InvitationPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const { id: invitationId } = use(params);

  const [invitation, setInvitation] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    const loadInvitation = async () => {
      setLoading(true);
      try {
        const res = await getInvitationDetailsAction(invitationId);
        if (res.success && res.data) {
          setInvitation(res.data);
        } else {
          setError(res.error || 'Failed to load invitation.');
        }
      } catch (err) {
        setError('Error loading invitation details.');
      } finally {
        setLoading(false);
      }
    };
    loadInvitation();
  }, [invitationId]);

  const handleGoogleSetup = async () => {
    setError('');
    setSubmitting(true);

    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      const idToken = await result.user.getIdToken();

      const res = await linkGoogleAccountAction(idToken, invitationId);
      if (res.success && res.profile) {
        useSaloonStore.setState({
          currentProfile: res.profile as any,
          authRole: 'owner',
        });
        setSuccess(true);
        setTimeout(() => {
          router.replace('/owner');
        }, 1500);
      } else {
        setError(res.error || 'Failed to link Google account.');
      }
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Google Auth process failed.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col justify-center bg-zinc-950 px-6 py-12">
      <div className="mx-auto w-full max-w-sm">
        <div className="mb-6">
          <div className="h-10 w-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-500 mb-4">
            <Sparkles className="h-5 w-5" />
          </div>
          <span className="text-xs font-bold text-amber-500 uppercase tracking-widest">Workspace Invitation</span>
          <h2 className="text-2xl font-extrabold text-white mt-1">Accept Invitation</h2>
          <p className="text-zinc-400 text-sm mt-1">
            Complete your registration and claim your saloon portal with 1-click Google setup.
          </p>
        </div>

        {error && (
          <div className="flex items-center gap-2 rounded-xl bg-red-500/10 border border-red-500/20 p-3 text-red-400 text-xs mb-4">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {success ? (
          <div className="flex items-center gap-2.5 rounded-xl bg-green-500/10 border border-green-500/20 p-3.5 text-green-400 text-xs">
            <CheckCircle className="h-5 w-5 shrink-0" />
            <div>
              <p className="font-bold text-white">Google account linked!</p>
              <p className="text-zinc-400 mt-0.5">Your saloon is set up. Redirecting to owner dashboard...</p>
            </div>
          </div>
        ) : loading ? (
          <div className="flex flex-col items-center justify-center py-10">
            <Loader2 className="h-6 w-6 text-amber-500 animate-spin" />
            <span className="text-xs text-zinc-500 font-mono mt-3">Verifying invitation link...</span>
          </div>
        ) : invitation ? (
          <div className="space-y-6">
            <div className="p-4 bg-zinc-900 border border-zinc-800 rounded-2xl space-y-3">
              <div className="flex items-center gap-2">
                <Building2 className="h-4 w-4 text-amber-500 shrink-0" />
                <div>
                  <p className="text-[10px] text-zinc-500 font-bold uppercase">Saloon Name</p>
                  <p className="text-sm font-semibold text-white">{invitation.saloonName}</p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-amber-500 shrink-0" />
                <div>
                  <p className="text-[10px] text-zinc-500 font-bold uppercase">Owner Email</p>
                  <p className="text-sm font-semibold text-white">{invitation.ownerEmail}</p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Phone className="h-4 w-4 text-amber-500 shrink-0" />
                <div>
                  <p className="text-[10px] text-zinc-500 font-bold uppercase">Contact Phone</p>
                  <p className="text-sm font-semibold text-white font-mono">{invitation.ownerPhone}</p>
                </div>
              </div>
            </div>

            <button
              onClick={handleGoogleSetup}
              disabled={submitting}
              className="w-full py-2.5 bg-white hover:bg-zinc-100 disabled:bg-zinc-800 active:scale-[0.98] transition-all rounded-xl text-sm font-bold text-zinc-950 flex items-center justify-center gap-2 shadow-lg shadow-white/5 cursor-pointer"
            >
              {submitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin text-zinc-950" />
                  <span>Linking account...</span>
                </>
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
                  <span>Link with Google</span>
                </>
              )}
            </button>
          </div>
        ) : null}
      </div>
    </div>
  );
}
