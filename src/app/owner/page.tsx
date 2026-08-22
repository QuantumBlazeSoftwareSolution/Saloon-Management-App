'use client';

import { useEffect, useState } from 'react';
import { useSaloonStore } from '@/store';
import { motion, AnimatePresence } from 'framer-motion';
import { DollarSign, BarChart, User, Clock, Scissors, Zap } from 'lucide-react';
import { getAllServiceLogs } from '@/lib/actions/service-logs';

export default function OwnerTodayPage() {
  const currentProfile = useSaloonStore((state) => state.currentProfile);
  const [saloonName] = useState('The Sterling Groom');
  const [logs, setLogs] = useState<any[]>([]);
  
  
  const [prevLogsCount, setPrevLogsCount] = useState(0);
  const [newLogIds, setNewLogIds] = useState<string[]>([]);

  const fetchDbData = async () => {
    if (!currentProfile) return;
    
    const logsRes = await getAllServiceLogs();
    if (logsRes.success && logsRes.data) {
      setLogs(logsRes.data);
    }
  };

  useEffect(() => {
    if (currentProfile) {
      fetchDbData();
    }
  }, [currentProfile]);

  
  const getTodayLogs = () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return logs.filter((l) => new Date(l.createdAt) >= today);
  };

  const todayLogs = getTodayLogs();
  
  
  const totalRevenue = todayLogs.reduce((sum, l) => {
    const discountedPrice = Number(l.priceAtTime) * (1 - Number(l.discountPct) / 100);
    return sum + discountedPrice;
  }, 0);

  const totalServices = todayLogs.length;
  const avgTicket = totalServices > 0 ? totalRevenue / totalServices : 0;

  
  const barberPerformance: { [key: string]: { name: string; total: number } } = {};
  todayLogs.forEach((l) => {
    const revenue = Number(l.priceAtTime) * (1 - Number(l.discountPct) / 100);
    if (!barberPerformance[l.barberId]) {
      barberPerformance[l.barberId] = { name: l.barberName || 'Unknown Barber', total: 0 };
    }
    barberPerformance[l.barberId].total += revenue;
  });

  let topBarberName = 'No sales';
  let maxBarberRevenue = -1;
  Object.values(barberPerformance).forEach((b) => {
    if (b.total > maxBarberRevenue) {
      maxBarberRevenue = b.total;
      topBarberName = b.name.split(' ')[0];
    }
  });

  
  const sortedLogs = [...logs].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );

  
  useEffect(() => {
    if (logs.length > prevLogsCount) {
      
      const diff = logs.slice(prevLogsCount);
      const ids = diff.map((l) => l.id);
      setNewLogIds((prev) => [...prev, ...ids]);
      setPrevLogsCount(logs.length);

      
      const timer = setTimeout(() => {
        setNewLogIds((prev) => prev.filter((id) => !ids.includes(id)));
      }, 3000);

      return () => clearTimeout(timer);
    } else if (logs.length < prevLogsCount) {
      setPrevLogsCount(logs.length);
    }
  }, [logs, prevLogsCount]);

  return (
    <div className="space-y-6">
      {}
      <div className="flex justify-between items-center">
        <div>
          <span className="text-[10px] uppercase tracking-widest text-zinc-500 font-semibold font-display">Daily Overview</span>
          <h2 className="text-xl font-bold text-white mt-0.5">{saloonName}</h2>
        </div>
        <div className="flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/20 px-3 py-1.5 rounded-full">
          <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-[10px] uppercase font-bold text-emerald-400 font-display">Real-Time Sync Active</span>
        </div>
      </div>

      {}
      <div className="border border-zinc-900 bg-zinc-900/30 rounded-2xl p-6 text-center space-y-2 relative overflow-hidden">
        <span className="text-zinc-500 text-[10px] uppercase tracking-widest font-black block">Today's Revenue</span>
        <motion.div
          key={totalRevenue}
          initial={{ scale: 0.95, opacity: 0.8 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.3 }}
          className="text-4xl lg:text-5xl font-black text-yellow-500 font-mono tracking-tight"
        >
          Rs. {totalRevenue.toFixed(2)}
        </motion.div>
        <span className="text-xs text-zinc-500 block">updates immediately upon barber log</span>
        
        {/* Subtle decorative background gradient */}
        <div className="absolute -top-24 -left-24 h-48 w-48 rounded-full bg-yellow-500/5 blur-3xl" />
        <div className="absolute -bottom-24 -right-24 h-48 w-48 rounded-full bg-amber-500/5 blur-3xl" />
      </div>

      {/* Stats Cards Row */}
      <div className="grid grid-cols-3 gap-3">
        <div className="border border-zinc-900 bg-zinc-900/20 rounded-xl p-3 flex flex-col justify-between h-20">
          <span className="text-[9px] font-bold text-zinc-500 uppercase tracking-widest leading-none">Services</span>
          <div className="mt-2 flex items-baseline gap-1">
            <span className="text-xl font-bold text-white">{totalServices}</span>
            <span className="text-[10px] text-zinc-600 font-semibold font-mono">logs</span>
          </div>
        </div>

        <div className="border border-zinc-900 bg-zinc-900/20 rounded-xl p-3 flex flex-col justify-between h-20">
          <span className="text-[9px] font-bold text-zinc-500 uppercase tracking-widest leading-none">Avg Ticket</span>
          <div className="mt-2 flex items-baseline gap-1">
            <span className="text-xl font-bold text-white font-mono">Rs. {avgTicket.toFixed(0)}</span>
            <span className="text-[10px] text-zinc-600 font-semibold font-mono">ea</span>
          </div>
        </div>

        <div className="border border-zinc-900 bg-zinc-900/20 rounded-xl p-3 flex flex-col justify-between h-20">
          <span className="text-[9px] font-bold text-zinc-500 uppercase tracking-widest leading-none">Top Barber</span>
          <div className="mt-2">
            <span className="text-sm font-bold text-yellow-500 truncate block">{topBarberName}</span>
          </div>
        </div>
      </div>

      {/* Live Service Stream */}
      <div className="space-y-3">
        <div className="flex items-center gap-1.5 px-1">
          <Zap className="h-4 w-4 text-yellow-500" />
          <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-widest">Live Activity Feed</h3>
        </div>

        <div className="space-y-2 max-h-96 overflow-y-auto pr-1">
          <AnimatePresence initial={false}>
            {sortedLogs.slice(0, 10).map((log) => {
              const price = Number(log.priceAtTime) * (1 - Number(log.discountPct) / 100);
              const formattedTime = new Date(log.createdAt).toLocaleTimeString('en-US', {
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit',
                hour12: true,
              });
              const isNew = newLogIds.includes(log.id);

              return (
                <motion.div
                  key={log.id}
                  initial={{ opacity: 0, y: -20, height: 0 }}
                  animate={{ opacity: 1, y: 0, height: 'auto' }}
                  exit={{ opacity: 0 }}
                  transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                  className={`flex items-center justify-between border rounded-xl p-4 transition-all duration-500 ${
                    isNew 
                      ? 'border-yellow-500 bg-yellow-500/10 shadow-lg shadow-yellow-500/5' 
                      : 'border-zinc-900 bg-zinc-900/30 hover:bg-zinc-900/50'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="h-9 w-9 rounded-lg bg-zinc-800 border border-zinc-700 flex items-center justify-center shrink-0">
                      <Scissors className="h-4.5 w-4.5 text-yellow-500" />
                    </div>
                    <div className="flex flex-col min-w-0">
                      <span className="font-bold text-sm text-white truncate pr-2">
                        {log.serviceName}
                      </span>
                      <span className="text-[10px] text-zinc-500 font-semibold">
                        Logged by <span className="text-zinc-300 font-bold">{log.barberName || 'Unknown Barber'}</span>
                      </span>
                    </div>
                  </div>

                  <div className="text-right flex flex-col gap-0.5">
                    <span className="text-sm font-bold text-white font-mono">
                      Rs. {price.toFixed(2)}
                    </span>
                    <span className="text-[9px] text-zinc-500 font-semibold font-mono">
                      {formattedTime}
                    </span>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
