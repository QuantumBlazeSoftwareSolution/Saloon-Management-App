'use client';

import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useSaloonStore } from '@/store';
import { Scissors, History, Landmark, User } from 'lucide-react';
import Link from 'next/link';
import { motion } from 'framer-motion';

export default function BarberLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const currentProfile = useSaloonStore((state) => state.currentProfile);
  const authRole = useSaloonStore((state) => state.authRole);
  const _hasHydrated = useSaloonStore((state) => state._hasHydrated);

  useEffect(() => {
    if (!_hasHydrated) return;
    if (!currentProfile || authRole !== 'barber') {
      router.replace('/login');
    }
  }, [currentProfile, authRole, _hasHydrated, router]);

  if (!_hasHydrated) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center text-[10px] text-zinc-650 font-bold uppercase tracking-widest font-mono">
        Authenticating...
      </div>
    );
  }

  if (!currentProfile || authRole !== 'barber') {
    return null;
  }

  const tabs = [
    { id: '/barber', label: 'Add Service', icon: Scissors },
    { id: '/barber/history', label: 'Appointments', icon: History },
    { id: '/barber/earnings', label: 'Earnings', icon: Landmark },
    { id: '/barber/profile', label: 'Profile', icon: User },
  ];

  return (
    <div className="flex flex-col min-h-screen bg-zinc-950 pb-20 pt-safe">
      <main className="flex-1 w-full max-w-md mx-auto px-4 py-6">
        <motion.div
          key={pathname}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -12 }}
          transition={{ duration: 0.25, ease: 'easeOut' }}
        >
          {children}
        </motion.div>
      </main>

      {}
      <nav className="fixed bottom-0 left-0 right-0 z-40 bg-zinc-900/90 border-t border-zinc-800 backdrop-blur-md pb-safe">
        <div className="max-w-md mx-auto flex items-center justify-around h-16 px-2">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = pathname === tab.id;
            return (
              <Link 
                key={tab.id} 
                href={tab.id}
                className="relative flex flex-col items-center justify-center flex-1 h-full select-none cursor-pointer"
              >
                <div className={`p-1 transition-colors ${isActive ? 'text-amber-500' : 'text-zinc-500'}`}>
                  <Icon className="h-5.5 w-5.5" />
                </div>
                <span className={`text-[10px] font-semibold transition-colors mt-0.5 ${isActive ? 'text-amber-400' : 'text-zinc-500'}`}>
                  {tab.label}
                </span>
                
                {}
                {isActive && (
                  <motion.div 
                    layoutId="barber-tab-indicator"
                    className="absolute top-0 h-[2px] bg-amber-500 w-12"
                    transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                  />
                )}
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
