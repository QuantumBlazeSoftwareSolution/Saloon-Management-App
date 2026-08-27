'use client';

import { useEffect, useState } from 'react';
import { useSaloonStore } from '@/store';
import { useRouter } from 'next/navigation';
import { LogOut, Shield, Mail, Download, Smartphone, Info } from 'lucide-react';

export default function OwnerSettingsPage() {
  const currentProfile = useSaloonStore((state) => state.currentProfile);
  const logout = useSaloonStore((state) => state.logout);
  const deferredPrompt = useSaloonStore((state) => state.deferredPrompt);
  const setDeferredPrompt = useSaloonStore((state) => state.setDeferredPrompt);
  const router = useRouter();

  const [isStandalone, setIsStandalone] = useState(false);
  const [isIOS, setIsIOS] = useState(false);

  useEffect(() => {
    const isStandaloneMode = window.matchMedia('(display-mode: standalone)').matches || (navigator as any).standalone;
    setIsStandalone(!!isStandaloneMode);

    const userAgent = window.navigator.userAgent.toLowerCase();
    setIsIOS(/iphone|ipad|ipod/.test(userAgent));
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    console.log(`PWA manually installed outcome: ${outcome}`);
    setDeferredPrompt(null);
  };

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

          {/* PWA Install Area */}
          <div className="space-y-3 border-t border-zinc-900 pt-5">
            <span className="text-[10px] uppercase tracking-wider text-zinc-550 font-bold block">Application Access</span>
            
            {isStandalone ? (
              <div className="flex items-start gap-2.5 p-3 rounded-xl bg-emerald-500/5 border border-emerald-500/10 text-emerald-400 text-xs">
                <Smartphone className="h-4 w-4 shrink-0 mt-0.5 text-emerald-500" />
                <div>
                  <p className="font-bold text-white">Native Mode Active</p>
                  <p className="text-zinc-500 text-[10px] mt-0.5">This app is installed and running inside a standalone mobile window.</p>
                </div>
              </div>
            ) : deferredPrompt ? (
              <button
                onClick={handleInstallClick}
                className="w-full flex items-center justify-center gap-2 rounded-xl bg-yellow-500 hover:bg-yellow-400 py-3.5 text-xs font-black text-black transition-all active:scale-[0.98] cursor-pointer"
              >
                <Download className="h-4 w-4" />
                <span>Install Mobile App (PWA)</span>
              </button>
            ) : isIOS ? (
              <div className="flex items-start gap-2.5 p-3 rounded-xl bg-zinc-950 border border-zinc-900 text-zinc-400 text-xs">
                <Info className="h-4 w-4 shrink-0 mt-0.5 text-yellow-500" />
                <div>
                  <p className="font-bold text-white">How to Install on iOS</p>
                  <p className="text-zinc-500 text-[10px] mt-1">Tap the <span className="font-bold text-yellow-500">Share icon</span> in Safari, scroll down, and select <span className="font-bold text-yellow-500">Add to Home Screen</span>.</p>
                </div>
              </div>
            ) : (
              <div className="flex items-start gap-2.5 p-3 rounded-xl bg-zinc-950 border border-zinc-900 text-zinc-400 text-xs">
                <Info className="h-4 w-4 shrink-0 mt-0.5 text-zinc-550" />
                <div>
                  <p className="font-bold text-zinc-300">App Already Installed</p>
                  <p className="text-zinc-500 text-[10px] mt-0.5">This software is set up on this device. If you don&apos;t see the shortcut, use the browser menu to install.</p>
                </div>
              </div>
            )}
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
