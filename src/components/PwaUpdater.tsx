'use client';

import { useEffect, useState } from 'react';
import { useSaloonStore } from '@/store';
import { AnimatePresence, motion } from 'framer-motion';
import { Download, X } from 'lucide-react';

export default function PwaUpdater() {
  const authRole = useSaloonStore((state) => state.authRole);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showInstallSheet, setShowInstallSheet] = useState(false);

  useEffect(() => {
    // Intercept default install prompts
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      
      // Check if user dismissed it in the last 7 days
      const lastDismissed = localStorage.getItem('pwa-install-dismissed');
      if (lastDismissed) {
        const dismissedTime = parseInt(lastDismissed, 10);
        const sevenDaysMs = 7 * 24 * 60 * 60 * 1000;
        if (Date.now() - dismissedTime < sevenDaysMs) {
          return;
        }
      }

      setDeferredPrompt(e);
      setShowInstallSheet(true);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    // Register simple mock service worker for PWA support
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js').catch((err) => {
        console.warn('SW registration failed:', err);
      });
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  // Update manifest tag in document head when authRole changes
  useEffect(() => {
    const existingManifest = document.querySelector('link[rel="manifest"]');
    if (existingManifest) {
      existingManifest.remove();
    }

    const newManifest = document.createElement('link');
    newManifest.rel = 'manifest';
    
    if (authRole === 'owner') {
      newManifest.href = '/manifest-owner.webmanifest';
    } else {
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
      {showInstallSheet && deferredPrompt && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 p-4">
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 350 }}
            className="w-full max-w-md overflow-hidden rounded-2xl bg-zinc-900 border border-zinc-800 p-6 shadow-2xl pb-safe"
          >
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className={`p-3 rounded-xl ${isBarber ? 'bg-amber-500/10 text-amber-500' : 'bg-yellow-600/10 text-yellow-500'}`}>
                  <Download className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="font-bold text-lg text-white">
                    {isBarber ? 'Install Barber App' : 'Install Owner Dashboard'}
                  </h3>
                  <p className="text-zinc-400 text-sm mt-0.5">
                    {isBarber 
                      ? 'Log services instantly even when offline.' 
                      : 'Track today’s sales and metrics from anywhere.'}
                  </p>
                </div>
              </div>
              <button 
                onClick={dismissPrompt} 
                className="p-1 rounded-lg text-zinc-500 hover:text-white transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={dismissPrompt}
                className="flex-1 py-3 px-4 rounded-xl border border-zinc-800 bg-zinc-950 text-zinc-300 font-semibold hover:bg-zinc-800 hover:text-white transition-all active:scale-[0.98]"
              >
                Not Now
              </button>
              <button
                onClick={triggerInstall}
                className={`flex-1 py-3 px-4 rounded-xl font-semibold text-black transition-all active:scale-[0.98] ${
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
    </AnimatePresence>
  );
}
