'use client';

import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { Scissors, ShieldCheck } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();

  return (
    <div className="flex min-h-screen flex-col justify-center bg-zinc-950 px-6 py-12 md:px-12">
      <div className="mx-auto w-full max-w-md flex flex-col items-center">
        {/* Branding header */}
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

        {/* Dynamic choice grid */}
        <div className="grid grid-cols-1 gap-4 w-full">
          {/* Barber Portal Card */}
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

          {/* Owner Portal Card */}
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

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="mt-12 text-center text-xs text-zinc-600"
        >
          &copy; {new Date().getFullYear()} Sterling Groom PWA. Designed for offline speed.
        </motion.div>
      </div>
    </div>
  );
}
