'use client';

import { useState } from 'react';
import { useSaloonStore } from '@/store';
import { useRouter } from 'next/navigation';
import { Settings, LogOut, Check, Store, Shield, Mail } from 'lucide-react';

export default function OwnerSettingsPage() {
  const saloonName = useSaloonStore((state) => state.saloonName);
  const currentProfile = useSaloonStore((state) => state.currentProfile);
  const updateSaloonName = useSaloonStore((state) => state.updateSaloonName);
  const logout = useSaloonStore((state) => state.logout);
  const router = useRouter();

  const [shopName, setShopName] = useState(saloonName);
  const [success, setSuccess] = useState('');

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (shopName.trim()) {
      updateSaloonName(shopName.trim());
      setSuccess('Saloon preferences updated!');
      setTimeout(() => setSuccess(''), 2000);
    }
  };

  const handleLogout = () => {
    logout();
    router.replace('/login');
  };

  return (
    <div className="space-y-6">
      {/* Title */}
      <div>
        <span className="text-[10px] uppercase tracking-widest text-zinc-500 font-semibold font-display">System Administration</span>
        <h2 className="text-xl font-bold text-white mt-0.5">Control Settings</h2>
      </div>

      {success && (
        <div className="flex items-center gap-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20 p-3 text-emerald-400 text-xs">
          <Check className="h-4 w-4" />
          <span>{success}</span>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Salon name configuration */}
        <div className="md:col-span-2 border border-zinc-900 bg-zinc-900/20 rounded-2xl p-5 space-y-4">
          <div className="flex items-center gap-2">
            <Store className="h-4 w-4 text-yellow-500" />
            <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-widest">Saloon Profile</h3>
          </div>

          <form onSubmit={handleSave} className="space-y-4">
            <div>
              <label className="block text-zinc-500 text-[10px] uppercase tracking-wider font-bold mb-1.5">
                Saloon / Shop Name
              </label>
              <input
                type="text"
                required
                value={shopName}
                onChange={(e) => setShopName(e.target.value)}
                className="w-full rounded-lg border border-zinc-800 bg-zinc-950 py-2.5 px-3 text-xs text-white focus:border-yellow-500 focus:outline-none"
              />
            </div>

            <button
              type="submit"
              className="py-2 px-4 rounded-lg bg-yellow-500 text-black text-xs font-bold hover:bg-yellow-400 active:scale-95 transition-all cursor-pointer"
            >
              Update Profile Name
            </button>
          </form>
        </div>

        {/* Profile Card & Log Out */}
        <div className="md:col-span-1 space-y-4">
          <div className="border border-zinc-900 bg-zinc-900/30 rounded-2xl p-5 space-y-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-yellow-500/10 border border-yellow-500/40 text-yellow-500 flex items-center justify-center font-bold text-sm font-display">
                M
              </div>
              <div className="flex flex-col">
                <span className="font-bold text-sm text-white">{currentProfile?.full_name}</span>
                <span className="text-[9px] uppercase tracking-wider text-yellow-500 font-black mt-0.5">Saloon Proprietor</span>
              </div>
            </div>

            <div className="space-y-2 border-t border-zinc-900 pt-4 text-xs">
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
              className="w-full flex items-center justify-center gap-2 rounded-xl bg-zinc-900 border border-zinc-800 py-2.5 text-xs font-bold text-red-400 hover:bg-zinc-800 hover:text-red-300 transition-all active:scale-[0.98] cursor-pointer"
            >
              <LogOut className="h-4 w-4" />
              <span>Sign Out Settings</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
