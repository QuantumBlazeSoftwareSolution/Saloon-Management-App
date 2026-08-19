'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface Service {
  id: string;
  name: string;
  base_price: number;
  active: boolean;
}

export interface Profile {
  id: string;
  full_name: string;
  phone: string;
  email?: string;
  role: 'barber' | 'owner';
  avatar_url?: string;
  commission_pct: number; // e.g. 50 for 50%
  active: boolean;
}

export interface ServiceLog {
  id: string;
  barber_id: string;
  barber_name: string;
  service_id: string;
  service_name: string;
  price_at_time: number;
  discount_pct: number;
  commission_pct: number;
  commission_amount: number;
  net_amount: number;
  created_at: string; // ISO string
}

interface SaloonState {
  services: Service[];
  profiles: Profile[];
  logs: ServiceLog[];
  currentProfile: Profile | null;
  authRole: 'barber' | 'owner' | null;
  saloonName: string;
  
  // Actions
  login: (role: 'barber' | 'owner', identifier: string) => boolean;
  logout: () => void;
  logService: (barberId: string, serviceId: string, discountPct: number, customCommissionPct?: number) => void;
  deleteLog: (logId: string) => ServiceLog | null;
  restoreLog: (log: ServiceLog) => void;
  
  // Admin Actions
  addService: (name: string, basePrice: number) => void;
  updateService: (id: string, name: string, basePrice: number, active: boolean) => void;
  addBarber: (name: string, phone: string, commissionPct: number) => void;
  updateBarber: (id: string, name: string, phone: string, commissionPct: number, active: boolean) => void;
  updateSaloonName: (name: string) => void;
}

const DEFAULT_SERVICES: Service[] = [
  { id: 's1', name: 'Classic Haircut', base_price: 25, active: true },
  { id: 's2', name: 'Beard Trim & Detail', base_price: 18, active: true },
  { id: 's3', name: 'Signature Hair Color', base_price: 60, active: true },
  { id: 's4', name: 'Kids Cut', base_price: 20, active: true },
  { id: 's5', name: 'Hot Towel Shave', base_price: 22, active: true },
];

const DEFAULT_PROFILES: Profile[] = [
  { id: 'p_owner', full_name: 'Marcus Sterling', phone: '0771234567', email: 'marcus@saloon.com', role: 'owner', commission_pct: 0, active: true },
  { id: 'p_barber1', full_name: 'Alex Carter', phone: '0777111222', role: 'barber', avatar_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80', commission_pct: 60, active: true },
  { id: 'p_barber2', full_name: 'Jordan Finch', phone: '0777333444', role: 'barber', avatar_url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80', commission_pct: 50, active: true },
  { id: 'p_barber3', full_name: 'Sam Brooks', phone: '0777555666', role: 'barber', avatar_url: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&auto=format&fit=crop&q=80', commission_pct: 55, active: true },
];

// Helper to seed logs over the past week for dashboard analytics
const seedLogs = (): ServiceLog[] => {
  const seeded: ServiceLog[] = [];
  const servicePool = DEFAULT_SERVICES;
  const barberPool = DEFAULT_PROFILES.filter(p => p.role === 'barber');
  const now = new Date();

  // Create logs for past 7 days
  for (let d = 7; d >= 0; d--) {
    const logDate = new Date();
    logDate.setDate(now.getDate() - d);
    // Don't log past current hour for today
    const servicesCount = d === 0 ? 5 : Math.floor(Math.random() * 12) + 8; // 8-20 services per day

    for (let s = 0; s < servicesCount; s++) {
      const barber = barberPool[Math.floor(Math.random() * barberPool.length)];
      const service = servicePool[Math.floor(Math.random() * servicePool.length)];
      
      const hour = d === 0 ? Math.floor(Math.random() * (now.getHours() - 8 + 1)) + 8 : Math.floor(Math.random() * 10) + 9; // 9 AM to 7 PM
      const minute = Math.floor(Math.random() * 60);
      const specificDate = new Date(logDate);
      specificDate.setHours(hour, minute, 0, 0);

      const price = service.base_price;
      const discountPct = Math.random() > 0.85 ? (Math.random() > 0.5 ? 10 : 20) : 0;
      const discountedPrice = price * (1 - discountPct / 100);
      const commissionPct = barber.commission_pct;
      const commissionAmount = Number((discountedPrice * (commissionPct / 100)).toFixed(2));
      const netAmount = Number((discountedPrice - commissionAmount).toFixed(2));

      seeded.push({
        id: `log_${d}_${s}_${Math.random().toString(36).substr(2, 5)}`,
        barber_id: barber.id,
        barber_name: barber.full_name,
        service_id: service.id,
        service_name: service.name,
        price_at_time: price,
        discount_pct: discountPct,
        commission_pct: commissionPct,
        commission_amount: commissionAmount,
        net_amount: netAmount,
        created_at: specificDate.toISOString(),
      });
    }
  }

  // Sort logs by time ascending
  return seeded.sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
};

export const useSaloonStore = create<SaloonState>()(
  persist(
    (set, get) => ({
      services: DEFAULT_SERVICES,
      profiles: DEFAULT_PROFILES,
      logs: [], // initialized on client if empty
      currentProfile: null,
      authRole: null,
      saloonName: 'The Sterling Groom',

      login: (role, identifier) => {
        const state = get();
        const cleanedId = identifier.trim().toLowerCase();
        
        let found = state.profiles.find(p => {
          if (role === 'owner') {
            return p.role === 'owner' && (p.email?.toLowerCase() === cleanedId || p.phone === cleanedId);
          } else {
            return p.role === 'barber' && p.phone === cleanedId;
          }
        });

        // Fallback: If logging as owner and profile doesn't match default email, mock successfully anyway
        if (!found && role === 'owner') {
          found = state.profiles.find(p => p.role === 'owner') || DEFAULT_PROFILES[0];
        } else if (!found && role === 'barber') {
          // If phone is not in predefined profiles, dynamically create a barber profile to keep UX smooth
          const newId = `p_dyn_${Date.now()}`;
          const newProfile: Profile = {
            id: newId,
            full_name: identifier.includes('@') ? identifier.split('@')[0] : `Barber (${identifier})`,
            phone: identifier,
            role: 'barber',
            commission_pct: 50,
            active: true,
          };
          set(prev => ({
            profiles: [...prev.profiles, newProfile]
          }));
          found = newProfile;
        }

        if (found && found.active) {
          set({ currentProfile: found, authRole: role });
          // Lazy seed logs on first auth if empty
          if (get().logs.length === 0) {
            set({ logs: seedLogs() });
          }
          return true;
        }
        return false;
      },

      logout: () => set({ currentProfile: null, authRole: null }),

      logService: (barberId, serviceId, discountPct, customCommissionPct) => {
        const state = get();
        const barber = state.profiles.find(p => p.id === barberId);
        const service = state.services.find(s => s.id === serviceId);

        if (!barber || !service) return;

        const price = service.base_price;
        const discountedPrice = price * (1 - discountPct / 100);
        const commPct = customCommissionPct !== undefined ? customCommissionPct : barber.commission_pct;
        const commissionAmount = Number((discountedPrice * (commPct / 100)).toFixed(2));
        const netAmount = Number((discountedPrice - commissionAmount).toFixed(2));

        const newLog: ServiceLog = {
          id: `log_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
          barber_id: barberId,
          barber_name: barber.full_name,
          service_id: serviceId,
          service_name: service.name,
          price_at_time: price,
          discount_pct: discountPct,
          commission_pct: commPct,
          commission_amount: commissionAmount,
          net_amount: netAmount,
          created_at: new Date().toISOString(),
        };

        set(prev => ({
          logs: [...prev.logs, newLog],
        }));
      },

      deleteLog: (logId) => {
        const state = get();
        const logToDelete = state.logs.find(l => l.id === logId);
        if (!logToDelete) return null;

        set(prev => ({
          logs: prev.logs.filter(l => l.id !== logId),
        }));

        return logToDelete;
      },

      restoreLog: (log) => {
        set(prev => ({
          logs: [...prev.logs, log].sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime()),
        }));
      },

      addService: (name, basePrice) => {
        const newService: Service = {
          id: `s_${Date.now()}`,
          name,
          base_price: basePrice,
          active: true,
        };
        set(prev => ({
          services: [...prev.services, newService],
        }));
      },

      updateService: (id, name, basePrice, active) => {
        set(prev => ({
          services: prev.services.map(s => s.id === id ? { ...s, name, base_price: basePrice, active } : s),
        }));
      },

      addBarber: (name, phone, commissionPct) => {
        const newBarber: Profile = {
          id: `p_barber_${Date.now()}`,
          full_name: name,
          phone,
          role: 'barber',
          commission_pct: commissionPct,
          active: true,
        };
        set(prev => ({
          profiles: [...prev.profiles, newBarber],
        }));
      },

      updateBarber: (id, name, phone, commissionPct, active) => {
        set(prev => ({
          profiles: prev.profiles.map(p => p.id === id ? { ...p, full_name: name, phone, commission_pct: commissionPct, active } : p),
        }));
      },

      updateSaloonName: (name) => set({ saloonName: name }),
    }),
    {
      name: 'saloon-mgt-pwa-storage',
      onRehydrateStorage: () => (state) => {
        if (state && state.logs.length === 0) {
          state.logs = seedLogs();
        }
      }
    }
  )
);
