'use client';

import { useEffect, useState } from 'react';
import { useSaloonStore } from '@/store';
import { AnimatePresence, motion } from 'framer-motion';
import { Download, X } from 'lucide-react';

export default function PwaUpdater() {
  const authRole = useSaloonStore((state) => state.authRole);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showInstallSheet, setShowInstallSheet] = useState(false);

  const [isStandalone, setIsStandalone] = useState(false);

  useEffect(() => {
    const isStandaloneMode = window.matchMedia('(display-mode: standalone)').matches || (navigator as any).standalone;
    setIsStandalone(!!isStandaloneMode);

    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js').catch((err) => {
        console.warn('SW registration failed:', err);
      });
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  
  useEffect(() => {
    if (!authRole || !deferredPrompt || isStandalone) {
      setShowInstallSheet(false);
      return;
    }

    
    const lastDismissed = localStorage.getItem('pwa-install-dismissed');
    if (lastDismissed) {
      const dismissedTime = parseInt(lastDismissed, 10);
      const sevenDaysMs = 7 * 24 * 60 * 60 * 1000;
      if (Date.now() - dismissedTime < sevenDaysMs) {
        return;
      }
    }

    setShowInstallSheet(true);
  }, [authRole, deferredPrompt, isStandalone]);

  
  useEffect(() => {
    const existingManifest = document.querySelector('link[rel="manifest"]');
    if (existingManifest) {
      existingManifest.remove();
    }

    if (!authRole) return;

    const newManifest = document.createElement('link');
    newManifest.rel = 'manifest';
    
    if (authRole === 'owner') {
      newManifest.href = '/manifest-owner.webmanifest';
    } else if (authRole === 'barber') {
      newManifest.href = '/manifest-barber.webmanifest';
    }
    
    document.head.appendChild(newManifest);
  }, [authRole]);

  const triggerInstall = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    console.log(`PWA install outcome: ${outcome}`);
    setDeferredPrompt(null);
    setShowInstallSheet(false);
  };

  const dismissPrompt = () => {
    localStorage.setItem('pwa-install-dismissed', Date.now().toString());
    setShowInstallSheet(false);
  };

  const isBarber = authRole === 'barber';

  return (
    <AnimatePresence>
      {showInstallSheet && deferredPrompt && !isStandalone && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 p-4 backdrop-blur-sm">
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 350 }}
            className="w-full max-w-md overflow-hidden rounded-2xl bg-zinc-900 border border-zinc-800/80 p-5 shadow-2xl pb-safe"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-start gap-3.5">
                <div className={`flex-shrink-0 p-3 rounded-xl ${isBarber ? 'bg-amber-500/10 text-amber-500' : 'bg-yellow-600/10 text-yellow-500'}`}>
                  <Download className="h-5 w-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-bold text-sm text-white leading-snug">
                    {isBarber ? 'Install Barber App' : 'Install Owner Dashboard'}
                  </h3>
                  <p className="text-zinc-400 text-xs mt-1 leading-normal">
                    {isBarber 
                      ? 'Log services instantly even when offline.' 
                      : 'Track today’s sales and metrics from anywhere.'}
                  </p>
                </div>
              </div>
              <button 
                onClick={dismissPrompt} 
                className="flex-shrink-0 p-1.5 rounded-lg text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800/50 transition-all"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="flex gap-3 mt-5">
              <button
                onClick={dismissPrompt}
                className="flex-1 py-2.5 px-4 rounded-xl border border-zinc-800 bg-zinc-950 text-zinc-400 text-xs font-bold hover:bg-zinc-800 hover:text-white transition-all active:scale-[0.98]"
              >
                Not Now
              </button>
              <button
                onClick={triggerInstall}
                className={`flex-1 py-2.5 px-4 rounded-xl text-xs font-bold text-black transition-all active:scale-[0.98] ${
                  isBarber 
                    ? 'bg-amber-500 hover:bg-amber-400' 
                    : 'bg-yellow-500 hover:bg-yellow-400'
                }`}
              >
                Install App
              </button>
            </div>
          </motion.div>
        </div>
      )}

      {authRole && deferredPrompt && !isStandalone && !showInstallSheet && (
        <motion.button
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0, opacity: 0 }}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={() => setShowInstallSheet(true)}
          className={`fixed bottom-20 right-4 z-40 flex h-12 w-12 items-center justify-center rounded-full shadow-lg border cursor-pointer ${
            isBarber 
              ? 'bg-amber-500 border-amber-400 text-black' 
              : 'bg-yellow-500 border-yellow-400 text-black'
          }`}
          title="Install App"
        >
          <span className="absolute -inset-1 rounded-full bg-inherit opacity-20 animate-ping" />
          <Download className="h-5 w-5" />
        </motion.button>
      )}
    </AnimatePresence>
  );
}
