'use client';

import { useSaloonStore } from '@/store';
import { useRouter } from 'next/navigation';
import { LogOut, Shield, Mail } from 'lucide-react';

export default function OwnerSettingsPage() {
  const currentProfile = useSaloonStore((state) => state.currentProfile);
  const logout = useSaloonStore((state) => state.logout);
  const router = useRouter();

  const handleLogout = () => {
    logout();
    router.replace('/login');
  };

  return (
    <div className="space-y-6">
      <div>
        <span className="text-[10px] uppercase tracking-widest text-zinc-500 font-semibold font-display">System Administration</span>
        <h2 className="text-xl font-bold text-white mt-0.5">Control Settings</h2>
      </div>

      <div className="max-w-md">
        <div className="border border-zinc-900 bg-zinc-900/30 rounded-2xl p-6 space-y-5">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-yellow-500/10 border border-yellow-500/40 text-yellow-500 flex items-center justify-center font-bold text-sm font-display">
              {currentProfile?.fullName?.charAt(0) || 'M'}
            </div>
            <div className="flex flex-col">
              <span className="font-bold text-sm text-white">{currentProfile?.fullName}</span>
              <span className="text-[9px] uppercase tracking-wider text-yellow-500 font-black mt-0.5">Saloon Proprietor</span>
            </div>
          </div>

          <div className="space-y-3 border-t border-zinc-900 pt-5 text-xs">
            <div className="flex items-center gap-2 text-zinc-500">
              <Mail className="h-3.5 w-3.5" />
              <span className="font-mono text-zinc-400">{currentProfile?.email}</span>
            </div>
            <div className="flex items-center gap-2 text-zinc-500">
              <Shield className="h-3.5 w-3.5" />
              <span className="text-zinc-400">Owner Access Granted</span>
            </div>
          </div>

          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 rounded-xl bg-zinc-900 border border-zinc-800 py-3.5 text-xs font-bold text-red-400 hover:bg-zinc-800 hover:text-red-300 transition-all active:scale-[0.98] cursor-pointer"
          >
            <LogOut className="h-4 w-4" />
            <span>Sign Out</span>
          </button>
        </div>
      </div>
    </div>
  );
}
