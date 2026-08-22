'use client';

import { useState, useEffect } from 'react';
import { X, Calendar, User, Phone, Briefcase, FileText, Loader2 } from 'lucide-react';
import { getAllServices } from '@/lib/actions/services';
import { getAllStaff } from '@/lib/actions/profiles';
import { createAppointment } from '@/lib/actions/appointments';

interface BookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  defaultBarberId?: string;
  isOwner: boolean;
}

export default function BookingModal({
  isOpen,
  onClose,
  onSuccess,
  defaultBarberId = '',
  isOwner,
}: BookingModalProps) {
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [selectedServiceId, setSelectedServiceId] = useState('');
  const [selectedBarberId, setSelectedBarberId] = useState(defaultBarberId);
  const [scheduledAtStr, setScheduledAtStr] = useState('');
  const [notes, setNotes] = useState('');

  const [services, setServices] = useState<any[]>([]);
  const [barbers, setBarbers] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!isOpen) return;

    const fetchData = async () => {
      setLoading(true);
      setError('');
      try {
        const servRes = await getAllServices(true);
        if (servRes.success && servRes.data) {
          setServices(servRes.data);
        }
        if (isOwner) {
          const barbRes = await getAllStaff();
          if (barbRes.success && barbRes.data) {
            setBarbers(barbRes.data.filter((p: any) => p.role === 'barber' && p.active));
          }
        }
      } catch (err: any) {
        setError(err.message || 'Failed to load options.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [isOpen, isOwner]);

  useEffect(() => {
    if (defaultBarberId) {
      setSelectedBarberId(defaultBarberId);
    }
  }, [defaultBarberId]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const barberIdToUse = isOwner ? selectedBarberId : defaultBarberId;
    if (!customerName || !customerPhone || !selectedServiceId || !barberIdToUse || !scheduledAtStr) {
      setError('Please fill in all required fields.');
      return;
    }

    setSubmitting(true);
    try {
      const res = await createAppointment({
        barberId: barberIdToUse,
        customerName,
        customerPhone,
        serviceId: selectedServiceId,
        scheduledAt: new Date(scheduledAtStr),
        notes: notes || null,
        status: 'upcoming',
      });

      if (res.success) {
        onSuccess();
        onClose();
        setCustomerName('');
        setCustomerPhone('');
        setSelectedServiceId('');
        setScheduledAtStr('');
        setNotes('');
      } else {
        setError(res.error || 'Failed to book appointment.');
      }
    } catch (err: any) {
      setError(err.message || 'Error occurred during submission.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 p-4 backdrop-blur-sm sm:items-center">
      <div className="w-full max-w-md overflow-hidden rounded-2xl bg-zinc-900 border border-zinc-800 p-5 shadow-2xl pb-safe">
        <div className="flex items-center justify-between border-b border-zinc-800 pb-3.5 mb-4">
          <div className="flex items-center gap-2">
            <Calendar className={`h-4.5 w-4.5 ${isOwner ? 'text-yellow-500' : 'text-amber-500'}`} />
            <h3 className="font-bold text-sm text-white">Book Appointment</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800/50 transition-all"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {error && (
          <div className="mb-4 text-xs font-semibold text-red-400 bg-red-500/10 border border-red-500/20 p-2.5 rounded-xl">
            {error}
          </div>
        )}

        {loading ? (
          <div className="flex flex-col items-center justify-center py-12">
            <Loader2 className={`h-7 w-7 animate-spin ${isOwner ? 'text-yellow-500' : 'text-amber-500'}`} />
            <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider mt-3">Loading catalog...</span>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-zinc-500 text-[9px] uppercase font-bold mb-1.5 flex items-center gap-1">
                  <User className="h-3 w-3" /> Customer Name
                </label>
                <input
                  type="text"
                  required
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  placeholder="e.g. John Doe"
                  className="w-full rounded-lg border border-zinc-800 bg-zinc-950 py-2 px-3 text-xs text-white focus:border-yellow-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-zinc-500 text-[9px] uppercase font-bold mb-1.5 flex items-center gap-1">
                  <Phone className="h-3 w-3" /> Mobile Number
                </label>
                <input
                  type="tel"
                  required
                  value={customerPhone}
                  onChange={(e) => setCustomerPhone(e.target.value)}
                  placeholder="e.g. 0777999888"
                  className="w-full rounded-lg border border-zinc-800 bg-zinc-950 py-2 px-3 text-xs text-white focus:border-yellow-500 focus:outline-none font-mono"
                />
              </div>
            </div>

            {isOwner && (
              <div>
                <label className="block text-zinc-500 text-[9px] uppercase font-bold mb-1.5 flex items-center gap-1">
                  Assign Barber
                </label>
                <select
                  required
                  value={selectedBarberId}
                  onChange={(e) => setSelectedBarberId(e.target.value)}
                  className="w-full rounded-lg border border-zinc-800 bg-zinc-950 py-2 px-3 text-xs text-white focus:border-yellow-500 focus:outline-none"
                >
                  <option value="">-- Select Barber --</option>
                  {barbers.map((b) => (
                    <option key={b.id} value={b.id}>
                      {b.fullName} ({b.phone})
                    </option>
                  ))}
                </select>
              </div>
            )}

            <div>
              <label className="block text-zinc-500 text-[9px] uppercase font-bold mb-1.5 flex items-center gap-1">
                <Briefcase className="h-3 w-3" /> Select Service
              </label>
              <div className="flex flex-wrap gap-2 max-h-32 overflow-y-auto p-1.5 bg-zinc-950 rounded-xl border border-zinc-850">
                {services.map((s) => {
                  const isSelected = selectedServiceId === s.id;
                  return (
                    <button
                      key={s.id}
                      type="button"
                      onClick={() => setSelectedServiceId(s.id)}
                      className={`py-1.5 px-3 rounded-lg text-xs font-semibold transition-all border ${
                        isSelected
                          ? isOwner
                            ? 'bg-yellow-500 border-yellow-400 text-black font-bold'
                            : 'bg-amber-500 border-amber-400 text-black font-bold'
                          : 'border-zinc-800 bg-zinc-900 text-zinc-400 hover:text-white'
                      }`}
                    >
                      {s.name} - Rs. {s.basePrice}
                    </button>
                  );
                })}
              </div>
            </div>

            <div>
              <label className="block text-zinc-500 text-[9px] uppercase font-bold mb-1.5 flex items-center gap-1">
                Scheduled Date & Time
              </label>
              <input
                type="datetime-local"
                required
                value={scheduledAtStr}
                onChange={(e) => setScheduledAtStr(e.target.value)}
                className="w-full rounded-lg border border-zinc-800 bg-zinc-950 py-2 px-3 text-xs text-white focus:border-yellow-500 focus:outline-none font-mono"
              />
            </div>

            <div>
              <label className="block text-zinc-500 text-[9px] uppercase font-bold mb-1.5 flex items-center gap-1">
                <FileText className="h-3 w-3" /> Booking Notes (Optional)
              </label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Any client preference or instructions..."
                rows={2}
                className="w-full rounded-lg border border-zinc-800 bg-zinc-950 py-2 px-3 text-xs text-white focus:border-yellow-500 focus:outline-none resize-none"
              />
            </div>

            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 py-2.5 px-4 rounded-xl border border-zinc-800 bg-zinc-950 text-zinc-400 text-xs font-bold hover:bg-zinc-800 hover:text-white transition-all active:scale-[0.98]"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting}
                className={`flex-1 py-2.5 px-4 rounded-xl text-xs font-bold text-black transition-all active:scale-[0.98] flex items-center justify-center gap-2 ${
                  submitting
                    ? 'bg-zinc-700 cursor-not-allowed text-zinc-500'
                    : isOwner
                    ? 'bg-yellow-500 hover:bg-yellow-400'
                    : 'bg-amber-500 hover:bg-amber-400'
                }`}
              >
                {submitting && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                <span>Book Appointment</span>
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
