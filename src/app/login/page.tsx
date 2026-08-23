'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { Scissors, ShieldCheck, X, Building2, Mail, Phone, Loader2, CheckCircle, HelpCircle } from 'lucide-react';
import { requestSaloonSetup } from '@/lib/actions/admin';

export default function LoginPage() {
  const router = useRouter();

  // Modal State
  const [isRequestOpen, setIsRequestOpen] = useState(false);
  const [saloonName, setSaloonName] = useState('');
  const [ownerEmail, setOwnerEmail] = useState('');
  const [ownerPhone, setOwnerPhone] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleRequestSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess(false);

    if (!saloonName.trim() || !ownerEmail.trim() || !ownerPhone.trim()) {
      setError('Please fill in all fields.');
      return;
    }

    setSubmitting(true);
    try {
      const res = await requestSaloonSetup(
        saloonName.trim(),
        ownerEmail.trim(),
        ownerPhone.trim()
      );

      if (res.success) {
        setSuccess(true);
        setSaloonName('');
        setOwnerEmail('');
        setOwnerPhone('');
      } else {
        setError(res.error || 'Failed to submit request.');
      }
    } catch (err: any) {
      setError('Failed to send registration request.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col justify-center bg-zinc-950 px-6 py-12 md:px-12">
      <div className="mx-auto w-full max-w-md flex flex-col items-center">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-10"
        >
          <span className="text-xs uppercase tracking-[0.2em] text-amber-500 font-bold">Saloon Management OS</span>
          <h1 className="text-3xl font-extrabold mt-1 text-white tracking-tight">The Sterling Groom</h1>
          <p className="text-zinc-500 text-sm mt-2">Select your role to access the workspace</p>
        </motion.div>

        <div className="grid grid-cols-1 gap-4 w-full">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4, delay: 0.1 }}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => router.push('/login/barber')}
            className="group relative cursor-pointer overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-900/60 p-6 transition-all hover:border-amber-500/50 hover:bg-zinc-900"
          >
            <div className="flex items-center justify-between">
              <div className="flex flex-col gap-1">
                <span className="text-amber-500 font-bold text-xs uppercase tracking-wider">Barber Portal</span>
                <span className="text-xl font-bold text-white mt-1 group-hover:text-amber-400 transition-colors">I am a Barber</span>
                <p className="text-zinc-500 text-xs mt-1">Log client services, review daily commission, and view earnings.</p>
              </div>
              <div className="p-4 rounded-xl bg-amber-500/10 text-amber-500 group-hover:bg-amber-500 group-hover:text-black transition-all duration-300">
                <Scissors className="h-6 w-6" />
              </div>
            </div>
            <div className="absolute inset-x-0 bottom-0 h-[2px] bg-gradient-to-r from-transparent via-amber-500/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4, delay: 0.2 }}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => router.push('/login/owner')}
            className="group relative cursor-pointer overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-900/60 p-6 transition-all hover:border-yellow-600/50 hover:bg-zinc-900"
          >
            <div className="flex items-center justify-between">
              <div className="flex flex-col gap-1">
                <span className="text-yellow-600 font-bold text-xs uppercase tracking-wider">Owner Portal</span>
                <span className="text-xl font-bold text-white mt-1 group-hover:text-yellow-500 transition-colors">I am the Owner</span>
                <p className="text-zinc-500 text-xs mt-1">Monitor real-time sales, manage staff rates, and view deep analytics.</p>
              </div>
              <div className="p-4 rounded-xl bg-yellow-500/10 text-yellow-500 group-hover:bg-yellow-500 group-hover:text-black transition-all duration-300">
                <ShieldCheck className="h-6 w-6" />
              </div>
            </div>
            <div className="absolute inset-x-0 bottom-0 h-[2px] bg-gradient-to-r from-transparent via-yellow-500/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
          </motion.div>
        </div>

        <div className="mt-8 text-center">
          <button
            onClick={() => setIsRequestOpen(true)}
            className="text-xs text-zinc-400 hover:text-amber-500 font-bold transition-all underline cursor-pointer"
          >
            Want to register your saloon? Request Access
          </button>
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="mt-12 text-center text-xs text-zinc-650"
        >
          &copy; {new Date().getFullYear()} Sterling Groom PWA. Designed for offline speed.
        </motion.div>
      </div>

      {}
      <AnimatePresence>
        {isRequestOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsRequestOpen(false)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />
            
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-md overflow-hidden rounded-2xl bg-zinc-900 border border-zinc-800 p-6 shadow-2xl"
            >
              <button
                onClick={() => {
                  setIsRequestOpen(false);
                  setSuccess(false);
                  setError('');
                }}
                className="absolute right-4 top-4 text-zinc-400 hover:text-white"
              >
                <X className="h-4 w-4" />
              </button>

              <div className="mb-4">
                <span className="text-[10px] font-bold text-amber-500 uppercase tracking-widest">Saloon Request Form</span>
                <h3 className="text-lg font-bold text-white mt-0.5">Register Your Saloon</h3>
                <p className="text-zinc-400 text-xs mt-1">
                  Fill in the details below to request a workspace setup.
                </p>
              </div>

              {error && (
                <div className="p-3 bg-red-500/10 border border-red-500/20 text-red-400 text-xs rounded-xl mb-4">
                  {error}
                </div>
              )}

              {success ? (
                <div className="space-y-4 py-4 text-center">
                  <div className="flex justify-center">
                    <div className="h-12 w-12 rounded-full bg-green-500/10 border border-green-500/20 flex items-center justify-center text-green-500">
                      <CheckCircle className="h-6 w-6" />
                    </div>
                  </div>
                  <div>
                    <h4 className="font-bold text-white text-sm">Request Submitted Successfully!</h4>
                    <p className="text-zinc-500 text-xs mt-1">
                      Our administrator will review your setup request and contact you shortly.
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      setIsRequestOpen(false);
                      setSuccess(false);
                    }}
                    className="w-full py-2.5 bg-zinc-800 hover:bg-zinc-700 rounded-xl text-xs font-bold text-white mt-4"
                  >
                    Close Window
                  </button>
                </div>
              ) : (
                <form onSubmit={handleRequestSubmit} className="space-y-4">
                  <div>
                    <label className="block text-zinc-400 text-xs font-bold mb-1.5 flex items-center gap-1.5">
                      <Building2 className="h-3.5 w-3.5 text-amber-500" /> Saloon Name
                    </label>
                    <input
                      type="text"
                      required
                      value={saloonName}
                      onChange={(e) => setSaloonName(e.target.value)}
                      placeholder="e.g. Sterling Studio"
                      className="w-full px-3.5 py-2 bg-zinc-950 border border-zinc-800 rounded-xl text-sm text-white focus:outline-none focus:border-amber-500"
                    />
                  </div>

                  <div>
                    <label className="block text-zinc-400 text-xs font-bold mb-1.5 flex items-center gap-1.5">
                      <Mail className="h-3.5 w-3.5 text-amber-500" /> Owner Email
                    </label>
                    <input
                      type="email"
                      required
                      value={ownerEmail}
                      onChange={(e) => setOwnerEmail(e.target.value)}
                      placeholder="e.g. owner@sterling.com"
                      className="w-full px-3.5 py-2 bg-zinc-950 border border-zinc-800 rounded-xl text-sm text-white focus:outline-none focus:border-amber-500"
                    />
                  </div>

                  <div>
                    <label className="block text-zinc-400 text-xs font-bold mb-1.5 flex items-center gap-1.5">
                      <Phone className="h-3.5 w-3.5 text-amber-500" /> Phone Number
                    </label>
                    <input
                      type="tel"
                      required
                      value={ownerPhone}
                      onChange={(e) => setOwnerPhone(e.target.value)}
                      placeholder="e.g. 0777123456"
                      className="w-full px-3.5 py-2 bg-zinc-950 border border-zinc-800 rounded-xl text-sm text-white focus:outline-none focus:border-amber-500 font-mono"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={submitting}
                    className="w-full py-2.5 bg-amber-500 hover:bg-amber-400 active:scale-[0.98] transition-all rounded-xl text-sm font-bold text-black flex items-center justify-center gap-2 cursor-pointer mt-6"
                  >
                    {submitting ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        <span>Submitting Request...</span>
                      </>
                    ) : (
                      <span>Submit Setup Request</span>
                    )}
                  </button>
                </form>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
