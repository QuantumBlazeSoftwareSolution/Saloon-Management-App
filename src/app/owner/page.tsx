'use client';

import { useEffect, useState } from 'react';
import { useSaloonStore } from '@/store';
import { motion, AnimatePresence } from 'framer-motion';
import { DollarSign, BarChart, User, Clock, Scissors, Zap, Calendar, Check, X, UserMinus, Plus, RefreshCw, Loader2, Edit3 } from 'lucide-react';
import { getAllServiceLogs } from '@/lib/actions/service-logs';
import { getAllAppointments, updateAppointment } from '@/lib/actions/appointments';
import { getAllStaff } from '@/lib/actions/profiles';
import { getAllServices } from '@/lib/actions/services';
import BookingModal from '@/components/BookingModal';
import ConfirmationModal from '@/components/ConfirmationModal';

export default function OwnerTodayPage() {
  const currentProfile = useSaloonStore((state) => state.currentProfile);
  const [saloonName] = useState('Fade Master');
  const [activeTab, setActiveTab] = useState<'activity' | 'appointments'>('activity');

  const [logs, setLogs] = useState<any[]>([]);
  const [appointments, setAppointments] = useState<any[]>([]);
  const [barbers, setBarbers] = useState<any[]>([]);
  const [services, setServices] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const [prevLogsCount, setPrevLogsCount] = useState(0);
  const [newLogIds, setNewLogIds] = useState<string[]>([]);

  const [isBookingOpen, setIsBookingOpen] = useState(false);
  const [editingAppointment, setEditingAppointment] = useState<any | null>(null);
  const [reassigningApp, setReassigningApp] = useState<any | null>(null);

  const [pendingAction, setPendingAction] = useState<{ id: string; status: 'cancelled' | 'no_show'; title: string; message: string } | null>(null);

  const fetchDbData = async () => {
    if (!currentProfile || !currentProfile.saloonId) {
      console.warn('[fetchDbData] currentProfile or saloonId is missing:', currentProfile);
      setIsLoading(false);
      return;
    }
    try {
      const logsRes = await getAllServiceLogs(currentProfile.saloonId);
      if (logsRes.success && logsRes.data) {
        setLogs(logsRes.data);
      }

      const appRes = await getAllAppointments(currentProfile.saloonId);
      if (appRes.success && appRes.data) {
        setAppointments(appRes.data);
      }

      const barbRes = await getAllStaff(currentProfile.saloonId);
      if (barbRes.success && barbRes.data) {
        setBarbers(barbRes.data.filter((p: any) => p.role === 'barber' && p.active));
      }

      const servRes = await getAllServices(true, currentProfile.saloonId);
      if (servRes.success && servRes.data) {
        setServices(servRes.data);
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (currentProfile) {
      fetchDbData();
      
      const interval = setInterval(fetchDbData, 10000);
      return () => clearInterval(interval);
    }
  }, [currentProfile]);

  const todayLogs = logs.filter((l) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return new Date(l.createdAt) >= today;
  });

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

  const upcomingAppointments = appointments.filter(
    (a) => a.status === 'upcoming'
  );

  const triggerStatusUpdate = (app: any, status: 'cancelled' | 'no_show') => {
    const title = status === 'cancelled' ? 'Cancel Appointment' : 'Mark as No-Show';
    const message = status === 'cancelled' 
      ? `Are you sure you want to cancel the appointment for ${app.customerName}?`
      : `Are you sure you want to mark ${app.customerName} as a no-show for this appointment?`;

    setPendingAction({ id: app.id, status, title, message });
  };

  const handleConfirmStatusUpdate = async () => {
    if (!pendingAction) return;
    const res = await updateAppointment(pendingAction.id, { status: pendingAction.status });
    if (res.success) {
      setPendingAction(null);
      await fetchDbData();
    }
  };

  const handleReassign = async (appointmentId: string, newBarberId: string) => {
    if (!newBarberId) return;
    const res = await updateAppointment(appointmentId, { barberId: newBarberId });
    if (res.success) {
      setReassigningApp(null);
      await fetchDbData();
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

  const handleEditClick = (app: any) => {
    setEditingAppointment(app);
    setIsBookingOpen(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <span className="text-[10px] uppercase tracking-widest text-zinc-500 font-semibold font-display">Daily Overview</span>
          <h2 className="text-xl font-bold text-white mt-0.5">{saloonName}</h2>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              setEditingAppointment(null);
              setIsBookingOpen(true);
            }}
            className="flex items-center gap-1.5 py-2 px-3 rounded-lg bg-yellow-500 hover:bg-yellow-400 text-black text-xs font-bold transition-all active:scale-95 cursor-pointer"
          >
            <Plus className="h-3.5 w-3.5" />
            <span>Book Appointment</span>
          </button>
        </div>
      </div>

      <div className="flex rounded-xl bg-zinc-900/60 p-1 border border-zinc-800/80">
        <button
          onClick={() => setActiveTab('activity')}
          className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all cursor-pointer ${
            activeTab === 'activity'
              ? 'bg-yellow-500 text-black shadow-md'
              : 'text-zinc-400 hover:text-white'
          }`}
        >
          Today's Activity
        </button>
        <button
          onClick={() => setActiveTab('appointments')}
          className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all cursor-pointer ${
            activeTab === 'appointments'
              ? 'bg-yellow-500 text-black shadow-md'
              : 'text-zinc-400 hover:text-white'
          }`}
        >
          Schedule ({upcomingAppointments.length})
        </button>
      </div>

      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-20">
          <Loader2 className="h-8 w-8 text-yellow-500 animate-spin" />
          <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider mt-3">Loading data...</span>
        </div>
      ) : activeTab === 'activity' ? (
        <div className="space-y-6">
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
            <div className="absolute -top-24 -left-24 h-48 w-48 rounded-full bg-yellow-500/5 blur-3xl" />
            <div className="absolute -bottom-24 -right-24 h-48 w-48 rounded-full bg-amber-500/5 blur-3xl" />
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div className="border border-zinc-900 bg-zinc-900/20 rounded-xl p-3 flex flex-col justify-between h-20">
              <span className="text-[9px] font-bold text-zinc-500 uppercase tracking-widest leading-none">Services</span>
              <div className="mt-2 flex items-baseline gap-1">
                <span className="text-xl font-bold text-white">{totalServices}</span>
                <span className="text-[10px] text-zinc-650 font-semibold font-mono">logs</span>
              </div>
            </div>

            <div className="border border-zinc-900 bg-zinc-900/20 rounded-xl p-3 flex flex-col justify-between h-20">
              <span className="text-[9px] font-bold text-zinc-500 uppercase tracking-widest leading-none">Avg Ticket</span>
              <div className="mt-2 flex items-baseline gap-1">
                <span className="text-xl font-bold text-white font-mono">Rs. {avgTicket.toFixed(0)}</span>
                <span className="text-[10px] text-zinc-650 font-semibold font-mono">ea</span>
              </div>
            </div>

            <div className="border border-zinc-900 bg-zinc-900/20 rounded-xl p-3 flex flex-col justify-between h-20">
              <span className="text-[9px] font-bold text-zinc-500 uppercase tracking-widest leading-none">Top Barber</span>
              <div className="mt-2">
                <span className="text-sm font-bold text-yellow-500 truncate block">{topBarberName}</span>
              </div>
            </div>
          </div>

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
      ) : (
        <div className="space-y-3">
          {upcomingAppointments.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-center border border-dashed border-zinc-800 rounded-2xl bg-zinc-900/10">
              <Calendar className="h-10 w-10 text-zinc-750 stroke-[1.5] mb-3" />
              <h3 className="font-bold text-zinc-500">No appointments today</h3>
              <button
                onClick={() => {
                  setEditingAppointment(null);
                  setIsBookingOpen(true);
                }}
                className="mt-4 py-2 px-4 rounded-xl bg-yellow-500 hover:bg-yellow-400 text-black text-xs font-bold transition-all"
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
                const isReassigning = reassigningApp === app.id;

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
                            className="text-zinc-500 hover:text-yellow-500 transition-all p-1"
                            title="Edit Appointment"
                          >
                            <Edit3 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                        <p className="text-[10px] text-zinc-400 font-mono mt-0.5">{app.customerPhone}</p>
                      </div>
                      <div className="text-right">
                        <span className="text-xs font-bold text-yellow-500">
                          {getServiceNamesDisplay(app.serviceIds)}
                        </span>
                        <p className="text-[9px] text-zinc-500 font-mono mt-0.5">{scheduledDate} @ {scheduledTime}</p>
                      </div>
                    </div>

                    <div className="flex items-center justify-between p-2 bg-zinc-950/40 rounded-lg text-[10px]">
                      <span className="text-zinc-500">Barber:</span>
                      {isReassigning ? (
                        <select
                          onChange={(e) => handleReassign(app.id, e.target.value)}
                          defaultValue={app.barberId || ''}
                          className="bg-zinc-900 text-white rounded border border-zinc-800 py-0.5 px-2 text-[10px] focus:outline-none"
                        >
                          <option value="">-- Unassigned --</option>
                          {barbers.map((b) => (
                            <option key={b.id} value={b.id}>
                              {b.fullName}
                            </option>
                          ))}
                        </select>
                      ) : (
                        <div className="flex items-center gap-2">
                          <span className={`font-bold ${app.barberName ? 'text-zinc-350' : 'text-zinc-500 italic'}`}>
                            {app.barberName || 'Unassigned'}
                          </span>
                          <button
                            onClick={() => setReassigningApp(app.id)}
                            className="text-[9px] text-yellow-500 hover:text-yellow-400 font-bold"
                          >
                            (Reassign)
                          </button>
                        </div>
                      )}
                    </div>

                    {app.notes && (
                      <div className="p-2 bg-zinc-950/40 rounded-lg text-[10px] text-zinc-500">
                        {app.notes}
                      </div>
                    )}

                    <div className="flex items-center gap-2 pt-1 border-t border-zinc-900/80">
                      <button
                        onClick={() => triggerStatusUpdate(app, 'no_show')}
                        className="flex-1 py-1.5 px-3 rounded-lg bg-zinc-900/40 text-zinc-400 text-xs font-semibold hover:bg-zinc-800 hover:text-white transition-all flex items-center justify-center gap-1.5"
                        title="Mark No Show"
                      >
                        <UserMinus className="h-3.5 w-3.5" />
                        <span>No-Show</span>
                      </button>
                      <button
                        onClick={() => triggerStatusUpdate(app, 'cancelled')}
                        className="flex-1 py-1.5 px-3 rounded-lg bg-zinc-900/40 text-zinc-400 text-xs font-semibold hover:bg-zinc-800 hover:text-white transition-all flex items-center justify-center gap-1.5"
                        title="Mark Cancelled"
                      >
                        <X className="h-3.5 w-3.5" />
                        <span>Cancel</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      <BookingModal
        isOpen={isBookingOpen}
        onClose={() => {
          setIsBookingOpen(false);
          setEditingAppointment(null);
        }}
        onSuccess={fetchDbData}
        isOwner={true}
        appointmentToEdit={editingAppointment}
      />

      <ConfirmationModal
        isOpen={pendingAction !== null}
        title={pendingAction?.title || ''}
        message={pendingAction?.message || ''}
        onConfirm={handleConfirmStatusUpdate}
        onCancel={() => setPendingAction(null)}
        isOwner={true}
      />
    </div>
  );
}
