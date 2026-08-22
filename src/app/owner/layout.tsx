'use client';

import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useSaloonStore } from '@/store';
import { LineChart, BarChart3, Users, Settings, Briefcase, Calendar } from 'lucide-react';
import Link from 'next/link';
import { motion } from 'framer-motion';

export default function OwnerLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const currentProfile = useSaloonStore((state) => state.currentProfile);
  const authRole = useSaloonStore((state) => state.authRole);
  const _hasHydrated = useSaloonStore((state) => state._hasHydrated);
  const logService = useSaloonStore((state) => state.logService);
  const servicesRaw = useSaloonStore((state) => state.services);
  const profilesRaw = useSaloonStore((state) => state.profiles);
  const services = servicesRaw.filter(s => s.active);
  const profiles = profilesRaw.filter(p => p.role === 'barber' && p.active);

  useEffect(() => {
    if (!_hasHydrated) return;
    if (!currentProfile || authRole !== 'owner') {
      router.replace('/login');
    }
  }, [currentProfile, authRole, _hasHydrated, router]);

  // Simulate other barbers logging services in real-time
  useEffect(() => {
    if (!_hasHydrated || !currentProfile || authRole !== 'owner') return;

    const interval = setInterval(() => {
      // 30% chance every 15 seconds to simulate a barber logging a service
      if (Math.random() < 0.35 && services.length > 0 && profiles.length > 0) {
        const randomBarber = profiles[Math.floor(Math.random() * profiles.length)];
        const randomService = services[Math.floor(Math.random() * services.length)];
        const randomDiscount = Math.random() > 0.8 ? 10 : 0;
        
        logService(randomBarber.id, randomService.id, randomDiscount);
      }
    }, 15000);

    return () => clearInterval(interval);
  }, [currentProfile, authRole, services, profiles, logService, _hasHydrated]);

  if (!_hasHydrated) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center text-[10px] text-zinc-650 font-bold uppercase tracking-widest font-mono">
        Authenticating Owner...
      </div>
    );
  }

  if (!currentProfile || authRole !== 'owner') {
    return null;
  }

  const tabs = [
    { id: '/owner', label: 'Today', icon: Calendar },
    { id: '/owner/analytics', label: 'Analytics', icon: BarChart3 },
    { id: '/owner/staff', label: 'Staff', icon: Users },
    { id: '/owner/services', label: 'Services', icon: Briefcase },
    { id: '/owner/settings', label: 'Settings', icon: Settings },
  ];

  return (
    <div className="flex flex-col min-h-screen bg-zinc-950 pb-20 pt-safe lg:pb-0 lg:pl-64">
      {/* Desktop Sidebar Rail */}
      <aside className="hidden lg:flex flex-col justify-between fixed top-0 bottom-0 left-0 w-64 bg-zinc-900 border-r border-zinc-800 p-6 z-40">
        <div className="space-y-8">
          <div>
            <span className="text-[10px] uppercase tracking-widest text-yellow-500 font-bold block">Management Suite</span>
            <h1 className="text-lg font-black text-white mt-1">Sterling Admin</h1>
          </div>

          <nav className="flex flex-col gap-1.5">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = pathname === tab.id;
              return (
                <Link
                  key={tab.id}
                  href={tab.id}
                  className={`flex items-center gap-3 py-3 px-4 rounded-xl font-bold transition-all relative ${
                    isActive 
                      ? 'bg-yellow-500/10 text-yellow-500 border border-yellow-500/20' 
                      : 'text-zinc-400 hover:text-white hover:bg-zinc-800/50'
                  }`}
                >
                  <Icon className="h-5 w-5" />
                  <span>{tab.label}</span>
                  {isActive && (
                    <motion.div 
                      layoutId="desktop-active-indicator"
                      className="absolute right-2 h-2 w-2 rounded-full bg-yellow-500" 
                    />
                  )}
                </Link>
              );
            })}
          </nav>
        </div>

        <div className="text-zinc-600 text-xs font-semibold">
          Signed in as {currentProfile.fullName}
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 w-full max-w-4xl mx-auto px-4 py-6 lg:py-8 lg:px-8">
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

      {/* Mobile Bottom Navigation Bar */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-zinc-900/90 border-t border-zinc-800 backdrop-blur-md pb-safe">
        <div className="flex items-center justify-around h-16 px-1">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = pathname === tab.id;
            return (
              <Link
                key={tab.id}
                href={tab.id}
                className="relative flex flex-col items-center justify-center flex-1 h-full select-none cursor-pointer"
              >
                <div className={`p-1 transition-colors ${isActive ? 'text-yellow-500' : 'text-zinc-500'}`}>
                  <Icon className="h-5 w-5" />
                </div>
                <span className={`text-[9px] font-bold transition-colors mt-0.5 ${isActive ? 'text-yellow-500' : 'text-zinc-500'}`}>
                  {tab.label}
                </span>

                {isActive && (
                  <motion.div
                    layoutId="owner-tab-indicator"
                    className="absolute top-0 h-[2px] bg-yellow-500 w-10"
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
