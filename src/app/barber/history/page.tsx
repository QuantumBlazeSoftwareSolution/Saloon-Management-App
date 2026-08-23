'use client';

import { useState, useEffect } from 'react';
import { useSaloonStore } from '@/store';
import { motion, AnimatePresence } from 'framer-motion';
import { Trash2, RotateCcw, AlertCircle, ShoppingBag, Calendar, Check, X, UserMinus, Plus, Percent, Loader2, Sparkles, Edit3 } from 'lucide-react';
import { getBarberLogs, deleteServiceLog, createServiceLog } from '@/lib/actions/service-logs';
import { getBarberAppointments, updateAppointment } from '@/lib/actions/appointments';
import { getAllServices } from '@/lib/actions/services';
import BookingModal from '@/components/BookingModal';
import ConfirmationModal from '@/components/ConfirmationModal';

export default function BarberAppointmentsPage() {
  const currentProfile = useSaloonStore((state) => state.currentProfile);
  const [activeTab, setActiveTab] = useState<'upcoming' | 'history'>('upcoming');

  const [logs, setLogs] = useState<any[]>([]);
  const [appointments, setAppointments] = useState<any[]>([]);
  const [services, setServices] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const [recentlyDeleted, setRecentlyDeleted] = useState<any | null>(null);
  const [showUndo, setShowUndo] = useState(false);
  const [undoTimeoutId, setUndoTimeoutId] = useState<NodeJS.Timeout | null>(null);

  const [isBookingOpen, setIsBookingOpen] = useState(false);
  const [editingAppointment, setEditingAppointment] = useState<any | null>(null);
  const [completingAppointment, setCompletingAppointment] = useState<any | null>(null);
  const [completionDiscount, setCompletionDiscount] = useState(0);
  const [completingSubmitting, setCompletingSubmitting] = useState(false);

  const [pendingAction, setPendingAction] = useState<{ id: string; status: 'cancelled' | 'no_show'; title: string; message: string } | null>(null);

  const barberId = currentProfile?.id || '';

  const fetchData = async () => {
    if (!barberId) return;
    try {
      const logsRes = await getBarberLogs(barberId);
      if (logsRes.success && logsRes.data) {
        setLogs(logsRes.data);
      }
      const appRes = await getBarberAppointments(barberId);
      if (appRes.success && appRes.data) {
        setAppointments(appRes.data);
      }
      const servRes = await getAllServices(true, currentProfile?.saloonId);
      if (servRes.success && servRes.data) {
        setServices(servRes.data);
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (barberId) {
      fetchData();
      
      const interval = setInterval(fetchData, 10000);
      return () => clearInterval(interval);
    }
  }, [barberId]);

  const barberLogs = [...logs]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  const upcomingAppointments = appointments.filter(
    (a) => a.status === 'upcoming'
  );

  const groupLogsByDay = (logsList: any[]) => {
    const groups: { [key: string]: any[] } = {};
    logsList.forEach((log) => {
      const date = new Date(log.createdAt);
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

      if (!groups[key]) groups[key] = [];
      groups[key].push(log);
    });
    return groups;
  };

  const groupedLogs = groupLogsByDay(barberLogs);

  const handleDeleteLog = async (logId: string) => {
    if (undoTimeoutId) clearTimeout(undoTimeoutId);
    const logToDelete = logs.find(l => l.id === logId);
    if (!logToDelete) return;

    const res = await deleteServiceLog(logId);
    if (res.success) {
      setRecentlyDeleted(logToDelete);
      setShowUndo(true);
      await fetchData();

      const timeout = setTimeout(() => {
        setShowUndo(false);
        setRecentlyDeleted(null);
      }, 5000);
      setUndoTimeoutId(timeout);
    }
  };

  const handleUndoDeleteLog = async () => {
    if (recentlyDeleted) {
      const res = await createServiceLog({
        saloonId: currentProfile?.saloonId!,
        barberId: recentlyDeleted.barberId,
        serviceId: recentlyDeleted.serviceId,
        priceAtTime: Number(recentlyDeleted.priceAtTime),
        discountPct: Number(recentlyDeleted.discountPct),
        commissionPct: Number(recentlyDeleted.commissionPct),
        commissionAmount: Number(recentlyDeleted.commissionAmount),
        netAmount: Number(recentlyDeleted.netAmount),
      });

      if (res.success) {
        setShowUndo(false);
        setRecentlyDeleted(null);
        await fetchData();
        if (undoTimeoutId) clearTimeout(undoTimeoutId);
      }
    }
  };

  const triggerStatusUpdate = (app: any, status: 'cancelled' | 'no_show') => {
    const title = status === 'cancelled' ? 'Cancel Booking' : 'Mark as No-Show';
    const message = status === 'cancelled'
      ? `Are you sure you want to cancel the booking for ${app.customerName}?`
      : `Are you sure you want to mark ${app.customerName} as a no-show?`;

    setPendingAction({ id: app.id, status, title, message });
  };

  const handleConfirmStatusUpdate = async () => {
    if (!pendingAction) return;
    const res = await updateAppointment(pendingAction.id, { status: pendingAction.status });
    if (res.success) {
      setPendingAction(null);
      await fetchData();
    }
  };

  const handleConfirmCompletion = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!completingAppointment || !currentProfile) return;

    setCompletingSubmitting(true);
    try {
      const appServices = services.filter((s) => completingAppointment.serviceIds?.includes(s.id));
      
      for (const service of appServices) {
        const priceAtTime = Number(service.basePrice);
        const discountAmount = priceAtTime * (completionDiscount / 100);
        const netAmount = priceAtTime - discountAmount;
        const commissionPct = Number(currentProfile.commissionPct);
        const commissionAmount = netAmount * (commissionPct / 100);

        await createServiceLog({
          saloonId: currentProfile.saloonId!,
          barberId: currentProfile.id,
          serviceId: service.id,
          priceAtTime,
          discountPct: completionDiscount,
          commissionPct,
          commissionAmount,
          netAmount,
        });
      }

      await updateAppointment(completingAppointment.id, { 
        status: 'completed',
        barberId: currentProfile.id
      });
      setCompletingAppointment(null);
      setCompletionDiscount(0);
      await fetchData();
    } finally {
      setCompletingSubmitting(false);
    }
  };

  const getServiceNamesDisplay = (ids: any) => {
    if (!ids || !Array.isArray(ids) || ids.length === 0) return 'No Services';
    const names = ids.map((id) => {
      const found = services.find((s) => s.id === id);
      return found ? found.name : 'Unknown Service';
    });
    return names.join(', ');
  };

  const getAppointmentPriceTotal = (ids: any) => {
    if (!ids || !Array.isArray(ids) || ids.length === 0) return 0;
    return services
      .filter((s) => ids.includes(s.id))
      .reduce((sum, s) => sum + (s.basePrice || 0), 0);
  };

  const handleEditClick = (app: any) => {
    setEditingAppointment(app);
    setIsBookingOpen(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <span className="text-[10px] uppercase tracking-widest text-zinc-500 font-semibold font-display">Schedule Roster</span>
          <h2 className="text-xl font-bold text-white mt-0.5">Appointments</h2>
        </div>
        <button
          onClick={() => {
            setEditingAppointment(null);
            setIsBookingOpen(true);
          }}
          className="flex items-center gap-1.5 py-2 px-3 rounded-lg bg-amber-500 hover:bg-amber-400 text-black text-xs font-bold transition-all active:scale-95 cursor-pointer"
        >
          <Plus className="h-3.5 w-3.5" />
          <span>New Booking</span>
        </button>
      </div>

      <div className="flex rounded-xl bg-zinc-900/60 p-1 border border-zinc-800/80">
        <button
          onClick={() => setActiveTab('upcoming')}
          className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all cursor-pointer ${
            activeTab === 'upcoming'
              ? 'bg-amber-500 text-black shadow-md'
              : 'text-zinc-400 hover:text-white'
          }`}
        >
          Upcoming ({upcomingAppointments.length})
        </button>
        <button
          onClick={() => setActiveTab('history')}
          className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all cursor-pointer ${
            activeTab === 'history'
              ? 'bg-amber-500 text-black shadow-md'
              : 'text-zinc-400 hover:text-white'
          }`}
        >
          History
        </button>
      </div>

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
                  {recentlyDeleted.serviceName}
                </span>
              </div>
            </div>
            <button
              onClick={handleUndoDeleteLog}
              className="flex items-center gap-1.5 py-1.5 px-3 rounded-lg bg-amber-500 text-black text-xs font-bold hover:bg-amber-400 active:scale-95 transition-all"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              <span>Undo</span>
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {completingAppointment && (
          <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 p-4 backdrop-blur-sm sm:items-center">
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 50 }}
              className="w-full max-w-md overflow-hidden rounded-2xl bg-zinc-900 border border-zinc-800 p-5 pb-8 shadow-2xl mb-safe"
            >
              <div className="flex items-center justify-between border-b border-zinc-800 pb-3 mb-4">
                <h3 className="font-bold text-sm text-white">Complete Appointment</h3>
                <button
                  onClick={() => setCompletingAppointment(null)}
                  className="p-1 rounded-lg text-zinc-500 hover:text-zinc-300"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              <form onSubmit={handleConfirmCompletion} className="space-y-4">
                <div className="p-3.5 rounded-xl bg-zinc-950/50 border border-zinc-850 space-y-2 text-xs">
                  <div className="flex justify-between">
                    <span className="text-zinc-500">Customer:</span>
                    <span className="font-bold text-white">{completingAppointment.customerName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-zinc-500">Services:</span>
                    <span className="font-bold text-white text-right max-w-[200px] truncate">{getServiceNamesDisplay(completingAppointment.serviceIds)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-zinc-500">Total Base Price:</span>
                    <span className="font-mono text-zinc-300">Rs. {getAppointmentPriceTotal(completingAppointment.serviceIds).toFixed(2)}</span>
                  </div>
                </div>

                <div>
                  <label className="block text-zinc-500 text-[9px] uppercase font-bold mb-1.5 flex justify-between">
                    <span>Discount ({completionDiscount}%)</span>
                  </label>
                  <div className="flex gap-2 mb-2">
                    {[0, 10, 20].map((pct) => (
                      <button
                        key={pct}
                        type="button"
                        onClick={() => setCompletionDiscount(pct)}
                        className={`flex-1 py-1.5 rounded-lg text-xs font-bold border transition-all ${
                          completionDiscount === pct
                            ? 'bg-amber-500 border-amber-400 text-black'
                            : 'border-zinc-800 bg-zinc-950 text-zinc-400'
                        }`}
                      >
                        {pct === 0 ? 'No Discount' : `${pct}% Off`}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setCompletingAppointment(null)}
                    className="flex-1 py-2.5 px-4 rounded-xl border border-zinc-800 bg-zinc-950 text-zinc-400 text-xs font-bold"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={completingSubmitting}
                    className="flex-1 py-2.5 px-4 rounded-xl text-xs font-bold text-black bg-amber-500 hover:bg-amber-400 flex items-center justify-center gap-1.5"
                  >
                    {completingSubmitting ? (
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    ) : (
                      <Check className="h-3.5 w-3.5" />
                    )}
                    <span>Confirm & Post Log</span>
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-20">
          <Loader2 className="h-8 w-8 text-amber-500 animate-spin" />
          <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider mt-3">Loading schedule...</span>
        </div>
      ) : activeTab === 'upcoming' ? (
        upcomingAppointments.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center border border-dashed border-zinc-800 rounded-2xl bg-zinc-900/10">
            <Calendar className="h-10 w-10 text-zinc-750 stroke-[1.5] mb-3" />
            <h3 className="font-bold text-zinc-500">No appointments today</h3>
            <button
              onClick={() => {
                setEditingAppointment(null);
                setIsBookingOpen(true);
              }}
              className="mt-4 py-2 px-4 rounded-xl bg-amber-500 hover:bg-amber-400 text-black text-xs font-bold transition-all"
            >
              Add Appointment
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {upcomingAppointments.map((app) => {
              const scheduledTime = new Date(app.scheduledAt).toLocaleTimeString('en-US', {
                hour: '2-digit',
                minute: '2-digit',
                hour12: true,
              });
              const scheduledDate = new Date(app.scheduledAt).toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
              });

              return (
                <div
                  key={app.id}
                  className="border border-zinc-900 bg-zinc-900/30 rounded-2xl p-4 flex flex-col gap-3"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="font-bold text-sm text-white">{app.customerName}</h4>
                        <button
                          onClick={() => handleEditClick(app)}
                          className="text-zinc-500 hover:text-amber-500 transition-all p-1"
                          title="Edit Booking"
                        >
                          <Edit3 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                      <p className="text-[10px] text-zinc-400 font-mono mt-0.5">{app.customerPhone}</p>
                    </div>
                    <div className="text-right">
                      <span className="text-xs font-bold text-amber-400">
                        {getServiceNamesDisplay(app.serviceIds)}
                      </span>
                      <p className="text-[9px] text-zinc-500 font-mono mt-0.5">{scheduledDate} @ {scheduledTime}</p>
                    </div>
                  </div>

                  {app.notes && (
                    <div className="p-2 bg-zinc-950/40 rounded-lg text-[10px] text-zinc-500">
                      {app.notes}
                    </div>
                  )}

                  <div className="flex items-center gap-2 pt-1 border-t border-zinc-900/80">
                    <button
                      onClick={() => setCompletingAppointment(app)}
                      className="flex-1 py-1.5 px-3 rounded-lg bg-amber-500 hover:bg-amber-400 text-black text-xs font-bold transition-all flex items-center justify-center gap-1"
                    >
                      <Check className="h-3.5 w-3.5" />
                      <span>Complete</span>
                    </button>
                    <button
                      onClick={() => triggerStatusUpdate(app, 'no_show')}
                      className="py-1.5 px-2.5 rounded-lg bg-zinc-900/40 text-zinc-400 text-xs font-semibold hover:bg-zinc-800 hover:text-white"
                      title="No Show"
                    >
                      <UserMinus className="h-3.5 w-3.5" />
                    </button>
                    <button
                      onClick={() => triggerStatusUpdate(app, 'cancelled')}
                      className="py-1.5 px-2.5 rounded-lg bg-zinc-900/40 text-zinc-400 text-xs font-semibold hover:bg-zinc-800 hover:text-white"
                      title="Cancel"
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )
      ) : (
        barberLogs.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center border border-dashed border-zinc-800 rounded-2xl bg-zinc-900/10">
            <ShoppingBag className="h-10 w-10 text-zinc-700 stroke-[1.5] mb-3" />
            <h3 className="font-bold text-zinc-400">No Services Logged</h3>
            <p className="text-zinc-650 text-xs mt-1">Your logged completed services history is empty.</p>
          </div>
        ) : (
          <div className="space-y-6">
            {Object.entries(groupedLogs).map(([day, dayLogs]) => (
              <div key={day} className="space-y-2">
                <h3 className="text-xs font-bold text-zinc-500 uppercase tracking-widest px-1">
                  {day}
                </h3>
                <div className="space-y-2">
                  <AnimatePresence initial={false}>
                    {dayLogs.map((log) => {
                      const price = log.priceAtTime * (1 - log.discountPct / 100);
                      const formattedTime = new Date(log.createdAt).toLocaleTimeString('en-US', {
                        hour: '2-digit',
                        minute: '2-digit',
                        hour12: true,
                      });
                      const deletable = (new Date(log.createdAt).toDateString() === new Date().toDateString());

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
                              {log.serviceName}
                            </span>
                            <div className="flex items-center gap-2 text-[10px] text-zinc-500 font-semibold font-mono">
                              <span>{formattedTime}</span>
                              {log.discountPct > 0 && (
                                <span className="text-amber-500">({log.discountPct}% Off)</span>
                              )}
                            </div>
                          </div>

                          <div className="flex items-center gap-3">
                            <div className="text-right flex flex-col">
                              <span className="text-sm font-bold text-white font-mono">
                                Rs. {price.toFixed(2)}
                              </span>
                              <span className="text-[10px] font-black text-amber-500 font-mono">
                                +Rs. {Number(log.commissionAmount).toFixed(2)}
                              </span>
                            </div>

                            {deletable && (
                              <button
                                onClick={() => handleDeleteLog(log.id)}
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
        )
      )}

      <BookingModal
        isOpen={isBookingOpen}
        onClose={() => {
          setIsBookingOpen(false);
          setEditingAppointment(null);
        }}
        onSuccess={fetchData}
        defaultBarberId={barberId}
        isOwner={false}
        appointmentToEdit={editingAppointment}
      />

      <ConfirmationModal
        isOpen={pendingAction !== null}
        title={pendingAction?.title || ''}
        message={pendingAction?.message || ''}
        onConfirm={handleConfirmStatusUpdate}
        onCancel={() => setPendingAction(null)}
        isOwner={false}
      />
    </div>
  );
}
