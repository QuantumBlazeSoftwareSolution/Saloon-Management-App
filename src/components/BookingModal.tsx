'use client';

import { useState, useEffect } from 'react';
import { X, Calendar, User, Phone, Briefcase, FileText, Loader2, ArrowRight, ArrowLeft, Clock, Check } from 'lucide-react';
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
  const [step, setStep] = useState(1);

  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [selectedServiceIds, setSelectedServiceIds] = useState<string[]>([]);
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

    setStep(1);
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

  const toggleService = (id: string) => {
    setSelectedServiceIds((prev) =>
      prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id]
    );
  };

  const canGoToStep2 = () => {
    if (!customerName.trim() || !customerPhone.trim() || !scheduledAtStr) return false;
    if (isOwner && !selectedBarberId) return false;
    return true;
  };

  const handleNextStep = () => {
    setError('');
    if (!canGoToStep2()) {
      setError('Please fill in all required fields.');
      return;
    }
    setStep(2);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const barberIdToUse = isOwner ? selectedBarberId : defaultBarberId;
    if (selectedServiceIds.length === 0) {
      setError('Please select at least one service.');
      return;
    }

    setSubmitting(true);
    try {
      const res = await createAppointment({
        barberId: barberIdToUse,
        customerName,
        customerPhone,
        serviceIds: selectedServiceIds,
        scheduledAt: new Date(scheduledAtStr),
        notes: notes || null,
        status: 'upcoming',
      });

      if (res.success) {
        onSuccess();
        onClose();
        setCustomerName('');
        setCustomerPhone('');
        setSelectedServiceIds([]);
        setSelectedBarberId(defaultBarberId);
        setScheduledAtStr('');
        setNotes('');
        setStep(1);
      } else {
        setError(res.error || 'Failed to book appointment.');
      }
    } catch (err: any) {
      setError(err.message || 'Error occurred during submission.');
    } finally {
      setSubmitting(false);
    }
  };

  const scheduledDateDisplay = scheduledAtStr
    ? new Date(scheduledAtStr).toLocaleString('en-US', {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        hour12: true,
      })
    : '';

  const selectedTotal = services
    .filter((s) => selectedServiceIds.includes(s.id))
    .reduce((sum: number, s: any) => sum + (s.basePrice || 0), 0);

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 p-4 backdrop-blur-sm sm:items-center">
      <div className="w-full max-w-md overflow-hidden rounded-2xl bg-zinc-900 border border-zinc-800 p-5 pb-8 shadow-2xl mb-safe">
        <div className="flex items-center justify-between border-b border-zinc-800 pb-3.5 mb-4">
          <div className="flex items-center gap-2">
            <Calendar className={`h-4.5 w-4.5 ${isOwner ? 'text-yellow-500' : 'text-amber-500'}`} />
            <h3 className="font-bold text-sm text-white">
              {step === 1 ? 'Book Appointment' : 'Pick Services'}
            </h3>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5">
              <div className={`h-1.5 w-6 rounded-full transition-all ${step >= 1 ? (isOwner ? 'bg-yellow-500' : 'bg-amber-500') : 'bg-zinc-700'}`} />
              <div className={`h-1.5 w-6 rounded-full transition-all ${step >= 2 ? (isOwner ? 'bg-yellow-500' : 'bg-amber-500') : 'bg-zinc-700'}`} />
            </div>
            <button
              onClick={onClose}
              className="p-1 rounded-lg text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800/50 transition-all"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
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
        ) : step === 1 ? (
          <div className="space-y-4">
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
                <div className="flex flex-wrap gap-2">
                  {barbers.map((b) => {
                    const isSelected = selectedBarberId === b.id;
                    return (
                      <button
                        key={b.id}
                        type="button"
                        onClick={() => setSelectedBarberId(b.id)}
                        className={`py-2 px-3.5 rounded-xl text-xs font-bold transition-all border ${
                          isSelected
                            ? 'bg-yellow-500 border-yellow-400 text-black'
                            : 'border-zinc-800 bg-zinc-950 text-zinc-400 hover:text-white hover:border-zinc-700'
                        }`}
                      >
                        {b.fullName}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            <div>
              <label className="block text-zinc-500 text-[9px] uppercase font-bold mb-1.5 flex items-center gap-1">
                <Clock className="h-3 w-3" /> Date & Time
              </label>
              <input
                type="datetime-local"
                required
                value={scheduledAtStr}
                onChange={(e) => setScheduledAtStr(e.target.value)}
                className="w-full rounded-lg border border-zinc-800 bg-zinc-950 py-2 px-3 text-xs text-white focus:border-yellow-500 focus:outline-none font-mono"
              />
            </div>

            <div className="flex gap-3 pt-3">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 py-2.5 px-4 rounded-xl border border-zinc-800 bg-zinc-950 text-zinc-400 text-xs font-bold hover:bg-zinc-800 hover:text-white transition-all active:scale-[0.98]"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleNextStep}
                className={`flex-1 py-2.5 px-4 rounded-xl text-xs font-bold text-black transition-all active:scale-[0.98] flex items-center justify-center gap-2 ${
                  isOwner ? 'bg-yellow-500 hover:bg-yellow-400' : 'bg-amber-500 hover:bg-amber-400'
                }`}
              >
                <span>Next</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="p-2.5 rounded-xl bg-zinc-950/50 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className={`h-7 w-7 rounded-full bg-zinc-800 flex items-center justify-center ${isOwner ? 'text-yellow-500' : 'text-amber-500'} text-[10px] font-black`}>
                  {customerName.charAt(0).toUpperCase()}
                </div>
                <div className="flex flex-col">
                  <span className="text-xs font-bold text-white">{customerName}</span>
                  <span className="text-[10px] text-zinc-500 font-mono">{customerPhone} · {scheduledDateDisplay}</span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setStep(1)}
                className="text-[10px] text-zinc-500 hover:text-white font-bold transition-all flex items-center gap-1"
              >
                <ArrowLeft className="h-3 w-3" />
                Edit
              </button>
            </div>

            <div>
              <label className="block text-zinc-500 text-[9px] uppercase font-bold mb-2 flex items-center gap-1">
                <Briefcase className="h-3 w-3" /> Pick Services
                {selectedServiceIds.length > 0 && (
                  <span className={`ml-1 ${isOwner ? 'text-yellow-500' : 'text-amber-500'}`}>
                    ({selectedServiceIds.length} selected)
                  </span>
                )}
              </label>
              <div className="flex flex-col gap-2 max-h-48 overflow-y-auto pr-1">
                {services.map((s) => {
                  const isSelected = selectedServiceIds.includes(s.id);
                  return (
                    <button
                      key={s.id}
                      type="button"
                      onClick={() => toggleService(s.id)}
                      className={`w-full flex items-center justify-between py-2.5 px-3.5 rounded-xl text-xs font-bold transition-all border ${
                        isSelected
                          ? isOwner
                            ? 'bg-yellow-500/10 border-yellow-500/40 text-yellow-500'
                            : 'bg-amber-500/10 border-amber-500/40 text-amber-500'
                          : 'border-zinc-800 bg-zinc-950 text-zinc-400 hover:text-white hover:border-zinc-700'
                      }`}
                    >
                      <span>{s.name}</span>
                      <div className="flex items-center gap-2">
                        <span className={`${isSelected ? (isOwner ? 'text-yellow-500/60' : 'text-amber-500/60') : 'text-zinc-600'}`}>
                          Rs. {s.basePrice}
                        </span>
                        {isSelected && (
                          <div className={`h-4.5 w-4.5 rounded-md flex items-center justify-center ${isOwner ? 'bg-yellow-500' : 'bg-amber-500'}`}>
                            <Check className="h-3 w-3 text-black" strokeWidth={3} />
                          </div>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            <div>
              <label className="block text-zinc-500 text-[9px] uppercase font-bold mb-1.5 flex items-center gap-1">
                <FileText className="h-3 w-3" /> Notes (Optional)
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
                onClick={() => setStep(1)}
                className="py-2.5 px-4 rounded-xl border border-zinc-800 bg-zinc-950 text-zinc-400 text-xs font-bold hover:bg-zinc-800 hover:text-white transition-all active:scale-[0.98] flex items-center gap-1.5"
              >
                <ArrowLeft className="h-3.5 w-3.5" />
                <span>Back</span>
              </button>
              <button
                type="submit"
                disabled={submitting || selectedServiceIds.length === 0}
                className={`flex-1 py-2.5 px-4 rounded-xl text-xs font-bold text-black transition-all active:scale-[0.98] flex items-center justify-center gap-2 ${
                  submitting || selectedServiceIds.length === 0
                    ? 'bg-zinc-700 cursor-not-allowed text-zinc-500'
                    : isOwner
                    ? 'bg-yellow-500 hover:bg-yellow-400'
                    : 'bg-amber-500 hover:bg-amber-400'
                }`}
              >
                {submitting && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                {selectedTotal > 0 ? (
                  <span>Book · Rs. {selectedTotal.toLocaleString()}</span>
                ) : (
                  <span>Book Appointment</span>
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
