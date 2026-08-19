'use client';

import { useState } from 'react';
import { useSaloonStore } from '@/store';
import { motion, AnimatePresence } from 'framer-motion';
import { DollarSign, Check, Percent } from 'lucide-react';

export default function AddServicePage() {
  const currentProfile = useSaloonStore((state) => state.currentProfile);
  const services = useSaloonStore((state) => state.services.filter(s => s.active));
  const logs = useSaloonStore((state) => state.logs);
  const logService = useSaloonStore((state) => state.logService);

  const [selectedServiceId, setSelectedServiceId] = useState('');
  const [discountPct, setDiscountPct] = useState(0);
  const [showDiscountInput, setShowDiscountInput] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const activeService = services.find(s => s.id === selectedServiceId);
  const barberId = currentProfile?.id || '';
  const commissionPct = currentProfile?.commission_pct || 0;

  // Calculate pricing previews
  const basePrice = activeService?.base_price || 0;
  const discountedPrice = basePrice * (1 - discountPct / 100);
  const estimatedCommission = Number((discountedPrice * (commissionPct / 100)).toFixed(2));

  // Compute Today's metrics for the bottom strip
  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);
  const todayLogs = logs.filter(
    (l) => l.barber_id === barberId && new Date(l.created_at) >= todayStart
  );
  
  const todayCount = todayLogs.length;
  const todayEarned = todayLogs.reduce((sum, l) => sum + l.commission_amount, 0);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedServiceId) return;

    logService(barberId, selectedServiceId, discountPct);
    
    // Trigger optimistic animation
    setShowSuccess(true);
    
    // Reset form after a brief duration
    setTimeout(() => {
      setShowSuccess(false);
      setSelectedServiceId('');
      setDiscountPct(0);
      setShowDiscountInput(false);
    }, 1000);
  };

  const handleQuickDiscount = (pct: number) => {
    setDiscountPct(pct);
    setShowDiscountInput(pct === -1); // show manual input if custom selected
  };

  return (
    <div className="space-y-6">
      {/* Header Greeting */}
      <div>
        <span className="text-[10px] uppercase tracking-widest text-zinc-500 font-semibold">Active Session</span>
        <h2 className="text-xl font-bold text-white flex items-center gap-2">
          Hey, {currentProfile?.full_name.split(' ')[0]} ✂️
        </h2>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Services Grid */}
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
                    ${service.base_price.toFixed(2)}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Discount Selection */}
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
                  {discountPct}% off
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
                className="pt-2"
              >
                <div className="relative">
                  <Percent className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-600" />
                  <input
                    type="number"
                    min={0}
                    max={100}
                    placeholder="Discount percentage"
                    value={discountPct === -1 ? '' : discountPct}
                    onChange={(e) => setDiscountPct(Math.min(100, Math.max(0, parseInt(e.target.value) || 0)))}
                    className="w-full rounded-lg border border-zinc-800 bg-zinc-950/80 py-2 pl-9 pr-4 text-sm text-white placeholder-zinc-700 focus:border-amber-500 focus:outline-none"
                  />
                </div>
              </motion.div>
            )}
          </motion.div>
        )}

        {/* Read-Only Commission Details */}
        {selectedServiceId && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex items-center justify-between border border-zinc-900 bg-zinc-900/10 rounded-xl p-4 text-sm"
          >
            <div className="flex flex-col gap-0.5">
              <span className="text-zinc-500 text-xs uppercase tracking-wider font-semibold">Your Share ({commissionPct}%)</span>
              <span className="font-mono text-zinc-400">
                ${discountedPrice.toFixed(2)} total ticket
              </span>
            </div>
            <div className="text-right">
              <span className="text-lg font-black text-amber-500 font-mono">
                ${estimatedCommission.toFixed(2)}
              </span>
            </div>
          </motion.div>
        )}

        {/* Submit action */}
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

      {/* Today's running totals strip */}
      <div className="border border-zinc-900 bg-zinc-900/30 rounded-xl p-4 flex items-center justify-between">
        <div className="flex flex-col">
          <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Today's Summary</span>
          <span className="text-sm font-semibold mt-0.5 text-white">{todayCount} Services Logged</span>
        </div>
        <div className="text-right flex flex-col">
          <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Today's Earnings</span>
          <span className="text-lg font-black text-amber-400 font-mono mt-0.5">${todayEarned.toFixed(2)}</span>
        </div>
      </div>
    </div>
  );
}
