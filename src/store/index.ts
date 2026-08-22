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
  saloonId: string;
  fullName: string;
  phone: string;
  email?: string;
  role: 'barber' | 'owner';
  avatarUrl?: string;
  commissionPct: number; // e.g. 50 for 50%
  pin?: string;
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
  _hasHydrated: boolean;
  setHasHydrated: (state: boolean) => void;
  
  // Actions
  login: (role: 'barber' | 'owner', identifier: string, pin?: string) => boolean;
  logout: () => void;
  logService: (barberId: string, serviceId: string, discountPct: number, customCommissionPct?: number) => void;
  deleteLog: (logId: string) => ServiceLog | null;
  restoreLog: (log: ServiceLog) => void;
  
  // Admin Actions
  addService: (name: string, basePrice: number) => void;
  updateService: (id: string, name: string, basePrice: number, active: boolean) => void;
  addBarber: (name: string, phone: string, commissionPct: number) => string;
  updateBarber: (id: string, name: string, phone: string, commissionPct: number, active: boolean) => void;
  updateSaloonName: (name: string) => void;
}

const DEFAULT_SERVICES: Service[] = [];
const DEFAULT_PROFILES: Profile[] = [];
const seedLogs = (): ServiceLog[] => [];

export const useSaloonStore = create<SaloonState>()(
  persist(
    (set, get) => ({
      services: DEFAULT_SERVICES,
      profiles: DEFAULT_PROFILES,
      logs: [], // initialized on client if empty
      currentProfile: null,
      authRole: null,
      saloonName: 'The Sterling Groom',
      _hasHydrated: false,
      setHasHydrated: (state) => set({ _hasHydrated: state }),

      login: (role, identifier, pin) => {
        const state = get();
        const cleanedId = identifier.trim().toLowerCase();
        
        let found = state.profiles.find(p => {
          if (role === 'owner') {
            return p.role === 'owner' && (p.email?.toLowerCase() === cleanedId || p.phone === cleanedId);
          } else {
            return p.role === 'barber' && p.phone === cleanedId && (!pin || p.pin === pin);
          }
        });

        // Fallback: If logging as owner and profile doesn't match default email, mock successfully anyway
        if (!found && role === 'owner') {
          found = state.profiles.find(p => p.role === 'owner') || DEFAULT_PROFILES[0];
        } else if (!found && role === 'barber') {
          // If phone is not in predefined profiles, dynamically create a barber profile with the specified PIN (or 1234)
          const newId = `p_dyn_${Date.now()}`;
          const newProfile: Profile = {
            id: newId,
            saloonId: 'default-saloon-id',
            fullName: `Barber (${identifier})`,
            phone: identifier,
            role: 'barber',
            commissionPct: 50,
            pin: pin || '1234',
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
        const commPct = customCommissionPct !== undefined ? customCommissionPct : barber.commissionPct;
        const commissionAmount = Number((discountedPrice * (commPct / 100)).toFixed(2));
        const netAmount = Number((discountedPrice - commissionAmount).toFixed(2));

        const newLog: ServiceLog = {
          id: `log_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
          barber_id: barberId,
          barber_name: barber.fullName,
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
        const generatedPin = Math.floor(1000 + Math.random() * 9000).toString();
        const newBarber: Profile = {
          id: `p_barber_${Date.now()}`,
          saloonId: 'default-saloon-id',
          fullName: name,
          phone,
          role: 'barber',
          commissionPct: commissionPct,
          pin: generatedPin,
          active: true,
        };
        set(prev => ({
          profiles: [...prev.profiles, newBarber],
        }));
        return generatedPin;
      },

      updateBarber: (id, name, phone, commissionPct, active) => {
        set(prev => ({
          profiles: prev.profiles.map(p => p.id === id ? { ...p, fullName: name, phone, commissionPct: commissionPct, active } : p),
        }));
      },

      updateSaloonName: (name) => set({ saloonName: name }),
    }),
    {
      name: 'saloon-mgt-pwa-storage',
      onRehydrateStorage: () => (state) => {
        if (state) {
          state.setHasHydrated(true);
          if (state.logs.length === 0) {
            state.logs = seedLogs();
          }
        }
      }
    }
  )
);
