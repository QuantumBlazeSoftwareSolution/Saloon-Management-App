'use client';

import { useState, useEffect } from 'react';
import { useSaloonStore } from '@/store';
import { motion, AnimatePresence } from 'framer-motion';
import { DollarSign, Check, Percent } from 'lucide-react';
import { getServicesBySaloonIdAction } from '@/lib/actions/services';
import { insertServiceLogAction, getBarberLogsAction } from '@/lib/actions/service-logs';

export default function AddServicePage() {
  const currentProfile = useSaloonStore((state) => state.currentProfile);
  const [services, setServices] = useState<any[]>([]);
  const [logs, setLogs] = useState<any[]>([]);
  const [selectedServiceId, setSelectedServiceId] = useState('');
  const [discountPct, setDiscountPct] = useState(0);
  const [showDiscountInput, setShowDiscountInput] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [mounted, setMounted] = useState(false);

  const fetchDbData = async () => {
    if (!currentProfile) return;
    const servicesRes = await getServicesBySaloonIdAction(currentProfile.saloonId, true);
    if (servicesRes.success && servicesRes.data) {
      setServices(servicesRes.data);
    }
    const logsRes = await getBarberLogsAction(currentProfile.id);
    if (logsRes.success && logsRes.data) {
      setLogs(logsRes.data);
    }
  };

  useEffect(() => {
    setMounted(true);
    if (currentProfile) {
      fetchDbData();
    }
  }, [currentProfile]);

  const activeService = services.find(s => s.id === selectedServiceId);
  const barberId = currentProfile?.id || '';
  const commissionPct = currentProfile?.commissionPct || 0;

  
  const basePrice = activeService?.basePrice || 0;
  const discountedPrice = basePrice * (1 - discountPct / 100);
  const estimatedCommission = Number((discountedPrice * (commissionPct / 100)).toFixed(2));

  
  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);
  const todayLogs = logs.filter(
    (l) => new Date(l.createdAt) >= todayStart
  );
  
  const todayCount = todayLogs.length;
  const todayEarned = todayLogs.reduce((sum, l) => sum + Number(l.commissionAmount), 0);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedServiceId || !currentProfile) return;

    const priceAtTime = basePrice;
    const discountAmount = priceAtTime * (discountPct / 100);
    const netAmount = priceAtTime - discountAmount;
    const commissionAmount = netAmount * (commissionPct / 100);

    const res = await insertServiceLogAction({
      saloonId: currentProfile.saloonId,
      barberId,
      serviceId: selectedServiceId,
      priceAtTime,
      discountPct,
      commissionPct,
      commissionAmount,
      netAmount,
    });

    if (res.success) {
      
      setShowSuccess(true);
      
      
      await fetchDbData();
      
      
      setTimeout(() => {
        setShowSuccess(false);
        setSelectedServiceId('');
        setDiscountPct(0);
        setShowDiscountInput(false);
      }, 1000);
    }
  };

  const handleQuickDiscount = (pct: number) => {
    setDiscountPct(pct);
    setShowDiscountInput(pct === -1); 
  };

  const handlePctChange = (val: number) => {
    setDiscountPct(Math.min(100, Math.max(0, val)));
  };

  const handleLkrChange = (val: number) => {
    if (basePrice > 0) {
      const pct = Math.min(100, Math.max(0, (val / basePrice) * 100));
      setDiscountPct(pct);
    }
  };

  if (!mounted) {
    return (
      <div className="space-y-6 animate-pulse mt-4">
        <div className="h-6 bg-zinc-900 rounded-lg w-1/3" />
        <div className="h-8 bg-zinc-900 rounded-lg w-1/2" />
        <div className="grid grid-cols-2 gap-3 mt-8">
          <div className="h-24 bg-zinc-900 rounded-xl" />
          <div className="h-24 bg-zinc-900 rounded-xl" />
        </div>
      </div>
    );
  }

  const derivedLkrDiscount = Number(((discountPct * basePrice) / 100).toFixed(2));

  return (
    <div className="space-y-6">
      {}
      <div>
        <span className="text-[10px] uppercase tracking-widest text-zinc-500 font-semibold">Active Session</span>
        <h2 className="text-xl font-bold text-white flex items-center gap-2">
          Hey, {currentProfile?.fullName.split(' ')[0]} ✂️
        </h2>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {}
        <div className="space-y-2">
          <label className="block text-zinc-400 text-xs font-semibold uppercase tracking-wider">
            Select Service
          </label>
          <div className="grid grid-cols-2 gap-3">
            {services.map((service) => {
              const isSelected = selectedServiceId === service.id;
              return (
                <div
                  key={service.id}
                  onClick={() => setSelectedServiceId(service.id)}
                  className={`cursor-pointer rounded-xl border p-4 transition-all active:scale-[0.98] select-none flex flex-col justify-between h-24 ${
                    isSelected
                      ? 'border-amber-500 bg-amber-500/10 text-white shadow-lg shadow-amber-500/5'
                      : 'border-zinc-800 bg-zinc-900/40 text-zinc-300 hover:border-zinc-700 hover:bg-zinc-900/80'
                  }`}
                >
                  <span className="font-bold text-sm leading-snug">{service.name}</span>
                  <span className={`text-base font-extrabold font-mono ${isSelected ? 'text-amber-400' : 'text-zinc-400'}`}>
                    Rs. {service.basePrice.toFixed(2)}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {}
        {selectedServiceId && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-3 border border-zinc-900 bg-zinc-900/20 rounded-xl p-4"
          >
            <div className="flex justify-between items-center">
              <label className="block text-zinc-400 text-xs font-semibold uppercase tracking-wider">
                Apply Discount
              </label>
              {discountPct > 0 && (
                <span className="text-xs bg-amber-500/20 text-amber-400 px-2 py-0.5 rounded-full font-bold">
                  {discountPct.toFixed(1)}% off
                </span>
              )}
            </div>

            <div className="flex gap-2">
              {[0, 10, 20].map((pct) => (
                <button
                  type="button"
                  key={pct}
                  onClick={() => handleQuickDiscount(pct)}
                  className={`flex-1 py-2 text-xs font-bold rounded-lg border transition-all ${
                    discountPct === pct && !showDiscountInput
                      ? 'border-amber-500 bg-amber-500/10 text-white'
                      : 'border-zinc-800 bg-zinc-900 text-zinc-400 hover:text-white'
                  }`}
                >
                  {pct === 0 ? 'No Disc' : `${pct}%`}
                </button>
              ))}
              <button
                type="button"
                onClick={() => handleQuickDiscount(-1)}
                className={`flex-1 py-2 text-xs font-bold rounded-lg border transition-all ${
                  showDiscountInput
                    ? 'border-amber-500 bg-amber-500/10 text-white'
                    : 'border-zinc-800 bg-zinc-900 text-zinc-400 hover:text-white'
                }`}
              >
                Custom
              </button>
            </div>

            {showDiscountInput && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="pt-2 grid grid-cols-2 gap-3"
              >
                <div className="relative">
                  <Percent className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-600" />
                  <input
                    type="number"
                    min={0}
                    max={100}
                    step="any"
                    placeholder="Discount %"
                    value={discountPct || ''}
                    onChange={(e) => handlePctChange(parseFloat(e.target.value) || 0)}
                    className="w-full rounded-lg border border-zinc-800 bg-zinc-950/80 py-2.5 pl-9 pr-3 text-xs text-white placeholder-zinc-700 focus:border-amber-500 focus:outline-none"
                  />
                </div>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold text-zinc-650">Rs.</span>
                  <input
                    type="number"
                    min={0}
                    max={basePrice}
                    step="any"
                    placeholder="LKR Amount"
                    value={derivedLkrDiscount || ''}
                    onChange={(e) => handleLkrChange(parseFloat(e.target.value) || 0)}
                    className="w-full rounded-lg border border-zinc-800 bg-zinc-950/80 py-2.5 pl-10 pr-3 text-xs text-white placeholder-zinc-700 focus:border-amber-500 focus:outline-none font-mono"
                  />
                </div>
              </motion.div>
            )}
          </motion.div>
        )}

        {}
        {selectedServiceId && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex items-center justify-between border border-zinc-900 bg-zinc-900/10 rounded-xl p-4 text-sm"
          >
            <div className="flex flex-col gap-0.5">
              <span className="text-zinc-500 text-xs uppercase tracking-wider font-semibold">Your Share ({commissionPct}%)</span>
              <span className="font-mono text-zinc-400">
                Rs. {discountedPrice.toFixed(2)} total ticket
              </span>
            </div>
            <div className="text-right">
              <span className="text-lg font-black text-amber-500 font-mono">
                Rs. {estimatedCommission.toFixed(2)}
              </span>
            </div>
          </motion.div>
        )}

        {}
        <button
          type="submit"
          disabled={!selectedServiceId || showSuccess}
          className="relative w-full rounded-xl bg-amber-500 py-4 px-4 font-bold text-black hover:bg-amber-400 disabled:bg-zinc-800 disabled:text-zinc-600 transition-all active:scale-[0.98] select-none h-14 overflow-hidden flex items-center justify-center cursor-pointer"
        >
          <AnimatePresence mode="wait">
            {showSuccess ? (
              <motion.div
                key="checkmark"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                exit={{ scale: 0 }}
                className="flex items-center gap-2"
              >
                <Check className="h-5 w-5 stroke-[3]" />
                <span>Logged Successfully!</span>
              </motion.div>
            ) : (
              <motion.div
                key="label"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex items-center gap-2"
              >
                <DollarSign className="h-5 w-5" />
                <span>Log Customer Service</span>
              </motion.div>
            )}
          </AnimatePresence>
        </button>
      </form>

      {}
      <div className="border border-zinc-900 bg-zinc-900/30 rounded-xl p-4 flex items-center justify-between">
        <div className="flex flex-col">
          <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Today's Summary</span>
          <span className="text-sm font-semibold mt-0.5 text-white">{todayCount} Services Logged</span>
        </div>
        <div className="text-right flex flex-col">
          <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Today's Earnings</span>
          <span className="text-lg font-black text-amber-400 font-mono mt-0.5">Rs. {todayEarned.toFixed(2)}</span>
        </div>
      </div>
    </div>
  );
}
