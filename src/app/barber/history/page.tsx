'use client';

import { useState } from 'react';
import { useSaloonStore, ServiceLog } from '@/store';
import { motion, AnimatePresence } from 'framer-motion';
import { Trash2, RotateCcw, AlertCircle, ShoppingBag } from 'lucide-react';

export default function BarberHistoryPage() {
  const currentProfile = useSaloonStore((state) => state.currentProfile);
  const logs = useSaloonStore((state) => state.logs);
  const deleteLog = useSaloonStore((state) => state.deleteLog);
  const restoreLog = useSaloonStore((state) => state.restoreLog);

  const [recentlyDeleted, setRecentlyDeleted] = useState<ServiceLog | null>(null);
  const [showUndo, setShowUndo] = useState(false);
  const [undoTimeoutId, setUndoTimeoutId] = useState<NodeJS.Timeout | null>(null);

  const barberId = currentProfile?.id || '';

  // Filter logs for this barber and sort latest first
  const barberLogs = logs
    .filter((l) => l.barber_id === barberId)
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

  // Group logs by day
  const groupLogsByDay = (logsList: ServiceLog[]) => {
    const groups: { [key: string]: ServiceLog[] } = {};
    
    logsList.forEach((log) => {
      const date = new Date(log.created_at);
      const today = new Date();
      const yesterday = new Date();
      yesterday.setDate(today.getDate() - 1);

      let key = '';
      if (date.toDateString() === today.toDateString()) {
        key = 'Today';
      } else if (date.toDateString() === yesterday.toDateString()) {
        key = 'Yesterday';
      } else {
        key = date.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' });
      }

      if (!groups[key]) {
        groups[key] = [];
      }
      groups[key].push(log);
    });

    return groups;
  };

  const grouped = groupLogsByDay(barberLogs);

  const handleDelete = (logId: string) => {
    // Clear any pending undo timeouts
    if (undoTimeoutId) {
      clearTimeout(undoTimeoutId);
    }

    const deleted = deleteLog(logId);
    if (deleted) {
      setRecentlyDeleted(deleted);
      setShowUndo(true);

      const timeout = setTimeout(() => {
        setShowUndo(false);
        setRecentlyDeleted(null);
      }, 5000); // 5 seconds grace period
      
      setUndoTimeoutId(timeout);
    }
  };

  const handleUndo = () => {
    if (recentlyDeleted) {
      restoreLog(recentlyDeleted);
      setShowUndo(false);
      setRecentlyDeleted(null);
      if (undoTimeoutId) {
        clearTimeout(undoTimeoutId);
      }
    }
  };

  // Check if log is editable (only same day logs can be deleted)
  const isDeletable = (dateStr: string) => {
    const date = new Date(dateStr);
    const today = new Date();
    return date.toDateString() === today.toDateString();
  };

  return (
    <div className="space-y-6">
      {/* Title */}
      <div>
        <span className="text-[10px] uppercase tracking-widest text-zinc-500 font-semibold font-display">Activity Ledger</span>
        <h2 className="text-xl font-bold text-white mt-0.5">Service History</h2>
      </div>

      {/* Undo Toast */}
      <AnimatePresence>
        {showUndo && recentlyDeleted && (
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            className="fixed top-4 left-4 right-4 z-50 max-w-sm mx-auto flex items-center justify-between gap-3 bg-zinc-900 border border-amber-500/20 p-4 rounded-xl shadow-xl"
          >
            <div className="flex items-center gap-2.5">
              <AlertCircle className="h-5 w-5 text-amber-500 shrink-0" />
              <div className="flex flex-col">
                <span className="text-xs font-semibold text-white">Service Cancelled</span>
                <span className="text-[10px] text-zinc-500 font-mono truncate max-w-[160px]">
                  {recentlyDeleted.service_name}
                </span>
              </div>
            </div>
            <button
              onClick={handleUndo}
              className="flex items-center gap-1.5 py-1.5 px-3 rounded-lg bg-amber-500 text-black text-xs font-bold hover:bg-amber-400 active:scale-95 transition-all"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              <span>Undo</span>
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main List */}
      {barberLogs.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center border border-dashed border-zinc-800 rounded-2xl bg-zinc-900/10">
          <ShoppingBag className="h-10 w-10 text-zinc-700 stroke-[1.5] mb-3" />
          <h3 className="font-bold text-zinc-400">No Services Logged</h3>
          <p className="text-zinc-600 text-xs mt-1 max-w-[200px]">
            Your logged client services will appear here in reverse chronological order.
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {Object.entries(grouped).map(([day, dayLogs]) => (
            <div key={day} className="space-y-2">
              <h3 className="text-xs font-bold text-zinc-500 uppercase tracking-widest px-1">
                {day}
              </h3>
              
              <div className="space-y-2">
                <AnimatePresence initial={false}>
                  {dayLogs.map((log) => {
                    const price = log.price_at_time * (1 - log.discount_pct / 100);
                    const formattedTime = new Date(log.created_at).toLocaleTimeString('en-US', {
                      hour: '2-digit',
                      minute: '2-digit',
                      hour12: true,
                    });
                    const deletable = isDeletable(log.created_at);

                    return (
                      <motion.div
                        key={log.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, x: -100 }}
                        className="flex items-center justify-between border border-zinc-900 bg-zinc-900/30 rounded-xl p-4 transition-all hover:bg-zinc-900/50"
                      >
                        <div className="flex flex-col gap-1 min-w-0">
                          <span className="font-bold text-sm text-white truncate pr-2">
                            {log.service_name}
                          </span>
                          <div className="flex items-center gap-2 text-[10px] text-zinc-500 font-semibold font-mono">
                            <span>{formattedTime}</span>
                            {log.discount_pct > 0 && (
                              <span className="text-amber-500">({log.discount_pct}% Off)</span>
                            )}
                          </div>
                        </div>

                        <div className="flex items-center gap-3">
                          <div className="text-right flex flex-col">
                            <span className="text-sm font-bold text-white font-mono">
                              ${price.toFixed(2)}
                            </span>
                            <span className="text-[10px] font-black text-amber-500 font-mono">
                              +${log.commission_amount.toFixed(2)}
                            </span>
                          </div>

                          {deletable && (
                            <button
                              onClick={() => handleDelete(log.id)}
                              className="p-2 rounded-lg bg-zinc-950 border border-zinc-900 text-zinc-500 hover:text-red-400 hover:border-red-500/20 active:scale-95 transition-all"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          )}
                        </div>
                      </motion.div>
                    );
                  })}
                </AnimatePresence>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
