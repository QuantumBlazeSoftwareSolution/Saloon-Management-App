'use client';

import { useSaloonStore } from '@/store';
import { useRouter } from 'next/navigation';
import { LogOut, User, Scissors, Phone, Landmark } from 'lucide-react';
import { motion } from 'framer-motion';

export default function BarberProfilePage() {
  const currentProfile = useSaloonStore((state) => state.currentProfile);
  const logout = useSaloonStore((state) => state.logout);
  const router = useRouter();

  const handleLogout = () => {
    logout();
    router.replace('/login');
  };

  const initialLetter = currentProfile?.fullName?.charAt(0) || 'B';

  return (
    <div className="space-y-6">
      {/* Title */}
      <div>
        <span className="text-[10px] uppercase tracking-widest text-zinc-500 font-semibold font-display">Barber Account</span>
        <h2 className="text-xl font-bold text-white mt-0.5">My Profile</h2>
      </div>

      {/* Account Info card */}
      <div className="border border-zinc-900 bg-zinc-900/30 rounded-2xl p-6 flex flex-col items-center text-center space-y-4">
        {currentProfile?.avatarUrl ? (
          <img 
            src={currentProfile.avatarUrl} 
            alt={currentProfile.fullName}
            className="h-20 w-20 rounded-full border-2 border-amber-500 object-cover"
          />
        ) : (
          <div className="h-20 w-20 rounded-full bg-amber-500/10 border-2 border-amber-500/40 text-amber-500 font-black text-3xl flex items-center justify-center font-display">
            {initialLetter}
          </div>
        )}
        
        <div>
          <h3 className="text-lg font-bold text-white leading-tight">{currentProfile?.fullName}</h3>
          <span className="inline-block mt-1 text-[10px] uppercase font-bold tracking-widest text-amber-500 bg-amber-500/10 px-2 py-0.5 rounded-full">
            Staff Barber
          </span>
        </div>
      </div>

      {/* Details list */}
      <div className="border border-zinc-900 bg-zinc-900/20 rounded-2xl overflow-hidden divide-y divide-zinc-900">
        <div className="flex items-center gap-3 p-4">
          <Phone className="h-4 w-4 text-zinc-500" />
          <div className="flex-1">
            <span className="block text-[10px] text-zinc-500 font-bold uppercase tracking-wider leading-none">Phone Contact</span>
            <span className="text-sm font-semibold text-zinc-300 font-mono mt-1 block">{currentProfile?.phone}</span>
          </div>
        </div>

        <div className="flex items-center gap-3 p-4">
          <Landmark className="h-4 w-4 text-zinc-500" />
          <div className="flex-1">
            <span className="block text-[10px] text-zinc-500 font-bold uppercase tracking-wider leading-none">Commission Split</span>
            <span className="text-sm font-semibold text-zinc-300 mt-1 block">{currentProfile?.commissionPct}% of client ticket</span>
          </div>
        </div>

        <div className="flex items-center gap-3 p-4">
          <Scissors className="h-4 w-4 text-zinc-500" />
          <div className="flex-1">
            <span className="block text-[10px] text-zinc-500 font-bold uppercase tracking-wider leading-none">Workplace Status</span>
            <span className="text-sm font-semibold text-emerald-400 mt-1 block">Active / On Duty</span>
          </div>
        </div>
      </div>

      {/* Logout button */}
      <button
        onClick={handleLogout}
        className="w-full flex items-center justify-center gap-2 rounded-xl bg-zinc-900 border border-zinc-800 py-3.5 font-bold text-red-400 hover:bg-zinc-800 hover:text-red-300 transition-all active:scale-[0.98] cursor-pointer"
      >
        <LogOut className="h-4 w-4" />
        <span>Sign Out</span>
      </button>
    </div>
  );
}
