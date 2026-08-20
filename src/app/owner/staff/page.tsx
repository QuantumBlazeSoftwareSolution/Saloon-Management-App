'use client';

import { useState } from 'react';
import { useSaloonStore, Profile } from '@/store';
import { Users, UserPlus, Phone, Landmark, Check, ShieldAlert, Lock, Copy } from 'lucide-react';

export default function OwnerStaffPage() {
  const profiles = useSaloonStore((state) => state.profiles);
  const addBarber = useSaloonStore((state) => state.addBarber);
  const updateBarber = useSaloonStore((state) => state.updateBarber);

  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [commissionPct, setCommissionPct] = useState(50);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  // Newly created barber highlight
  const [newBarberPin, setNewBarberPin] = useState('');
  const [newBarberName, setNewBarberName] = useState('');

  // Editing state
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const [editPhone, setEditPhone] = useState('');
  const [editCommissionPct, setEditCommissionPct] = useState(50);
  const [editActive, setEditActive] = useState(true);
  const [editPin, setEditPin] = useState('');

  const barbers = profiles.filter((p) => p.role === 'barber');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !phone) {
      setError('Please fill in name and phone number');
      return;
    }
    
    // Check if phone already registered
    if (profiles.some((p) => p.phone === phone)) {
      setError('This phone number is already registered.');
      return;
    }

    const pin = addBarber(name, phone, commissionPct);
    setNewBarberName(name);
    setNewBarberPin(pin);
    setSuccess('Barber added successfully!');
    
    setName('');
    setPhone('');
    setCommissionPct(50);
    setError('');
  };

  const handleStartEdit = (b: Profile) => {
    setEditingId(b.id);
    setEditName(b.full_name);
    setEditPhone(b.phone);
    setEditCommissionPct(b.commission_pct);
    setEditActive(b.active);
    setEditPin(b.pin || '');
  };

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingId) {
      updateBarber(editingId, editName, editPhone, editCommissionPct, editActive);
      // Update PIN optionally in Zustand state
      const state = useSaloonStore.getState();
      state.profiles = state.profiles.map(p => p.id === editingId ? { ...p, pin: editPin } : p);
      
      setEditingId(null);
      setSuccess('Barber settings saved!');
      setTimeout(() => setSuccess(''), 2000);
    }
  };

  return (
    <div className="space-y-6">
      {/* Title */}
      <div>
        <span className="text-[10px] uppercase tracking-widest text-zinc-500 font-semibold font-display">Personnel Management</span>
        <h2 className="text-xl font-bold text-white mt-0.5">Shop Barbers</h2>
      </div>

      {success && !newBarberPin && (
        <div className="flex items-center gap-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20 p-3 text-emerald-400 text-xs">
          <Check className="h-4 w-4" />
          <span>{success}</span>
        </div>
      )}

      {error && (
        <div className="flex items-center gap-2 rounded-xl bg-red-500/10 border border-red-500/20 p-3 text-red-400 text-xs">
          <ShieldAlert className="h-4 w-4" />
          <span>{error}</span>
        </div>
      )}

      {/* Grid of Add form vs active staff list */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Add Barber Form */}
        <div className="md:col-span-1 space-y-4">
          {/* Newly created Barber credential banner */}
          {newBarberPin && (
            <div className="border-2 border-yellow-500 bg-yellow-500/10 rounded-2xl p-5 space-y-3 relative overflow-hidden">
              <span className="text-[9px] uppercase tracking-widest font-black text-yellow-500 block">Important: Roster Credentials</span>
              <h4 className="font-extrabold text-sm text-white">Share credentials with {newBarberName}</h4>
              
              <div className="bg-zinc-950 p-3.5 rounded-xl border border-zinc-800 space-y-2">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-zinc-500 font-bold uppercase tracking-wider text-[10px]">Barber PIN</span>
                  <div className="flex items-center gap-1">
                    <span className="font-mono text-white font-extrabold text-base select-all">{newBarberPin}</span>
                    <button 
                      onClick={() => navigator.clipboard.writeText(newBarberPin)}
                      className="p-1 text-zinc-550 hover:text-white transition-colors"
                      title="Copy PIN"
                    >
                      <Copy className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              </div>
              <button
                onClick={() => {
                  setNewBarberPin('');
                  setNewBarberName('');
                  setSuccess('');
                }}
                className="w-full py-2 px-3 bg-yellow-500 hover:bg-yellow-400 font-bold text-black text-xs rounded-lg active:scale-95 transition-all"
              >
                Acknowledge PIN
              </button>
            </div>
          )}

          <div className="border border-zinc-900 bg-zinc-900/20 rounded-2xl p-5 space-y-4 h-fit">
            <div className="flex items-center gap-2">
              <UserPlus className="h-4 w-4 text-yellow-500" />
              <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-widest">Register Barber</h3>
            </div>

            <form onSubmit={handleSubmit} className="space-y-3.5">
              <div>
                <label className="block text-zinc-500 text-[10px] uppercase tracking-wider font-bold mb-1.5">
                  Full Name
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Liam Smith"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full rounded-lg border border-zinc-800 bg-zinc-950 py-2.5 px-3 text-xs text-white focus:border-yellow-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-zinc-500 text-[10px] uppercase tracking-wider font-bold mb-1.5">
                  Mobile Number
                </label>
                <input
                  type="tel"
                  required
                  placeholder="e.g. 0777999888"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full rounded-lg border border-zinc-800 bg-zinc-950 py-2.5 px-3 text-xs text-white focus:border-yellow-500 focus:outline-none font-mono"
                />
              </div>

              <div>
                <label className="block text-zinc-500 text-[10px] uppercase tracking-wider font-bold mb-1.5 flex justify-between">
                  <span>Commission Split</span>
                  <span className="text-yellow-500 font-mono">{commissionPct}%</span>
                </label>
                <input
                  type="range"
                  min={0}
                  max={100}
                  step={5}
                  value={commissionPct}
                  onChange={(e) => setCommissionPct(parseInt(e.target.value))}
                  className="w-full h-1 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-yellow-500"
                />
              </div>

              <button
                type="submit"
                className="w-full py-2.5 px-4 rounded-lg bg-yellow-500 text-black text-xs font-bold hover:bg-yellow-400 active:scale-95 transition-all cursor-pointer"
              >
                Add Barber
              </button>
            </form>
          </div>
        </div>

        {/* Barbers list */}
        <div className="md:col-span-2 space-y-3">
          <div className="flex items-center gap-2 px-1">
            <Users className="h-4 w-4 text-yellow-500" />
            <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-widest">On-Duty Staff ({barbers.length})</h3>
          </div>

          <div className="space-y-3">
            {barbers.map((barber) => {
              const isEditing = editingId === barber.id;
              
              if (isEditing) {
                return (
                  <form 
                    key={barber.id} 
                    onSubmit={handleSaveEdit}
                    className="border border-yellow-500/30 bg-zinc-900/50 p-4 rounded-2xl space-y-3"
                  >
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-zinc-500 text-[9px] uppercase font-bold mb-1">Name</label>
                        <input
                          type="text"
                          required
                          value={editName}
                          onChange={(e) => setEditName(e.target.value)}
                          className="w-full rounded-lg border border-zinc-800 bg-zinc-950 py-1.5 px-3.5 text-xs text-white"
                        />
                      </div>
                      <div>
                        <label className="block text-zinc-500 text-[9px] uppercase font-bold mb-1">Phone</label>
                        <input
                          type="tel"
                          required
                          value={editPhone}
                          onChange={(e) => setEditPhone(e.target.value)}
                          className="w-full rounded-lg border border-zinc-800 bg-zinc-950 py-1.5 px-3.5 text-xs text-white font-mono"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-zinc-500 text-[9px] uppercase font-bold mb-1">Access PIN</label>
                        <input
                          type="text"
                          maxLength={4}
                          value={editPin}
                          onChange={(e) => setEditPin(e.target.value.replace(/\D/g, ''))}
                          className="w-full rounded-lg border border-zinc-800 bg-zinc-950 py-1.5 px-3.5 text-xs text-white font-mono"
                        />
                      </div>
                      <div className="flex items-center gap-2 pt-3">
                        <input
                          type="checkbox"
                          id="active-check"
                          checked={editActive}
                          onChange={(e) => setEditActive(e.target.checked)}
                          className="rounded border-zinc-800 bg-zinc-950 text-yellow-500 focus:ring-0 h-4 w-4"
                        />
                        <label htmlFor="active-check" className="text-xs text-zinc-300 font-bold select-none cursor-pointer">Active</label>
                      </div>
                    </div>

                    <div className="flex-1 pt-1">
                      <label className="block text-zinc-500 text-[9px] uppercase font-bold mb-1">
                        Commission ({editCommissionPct}%)
                      </label>
                      <input
                        type="range"
                        min={0}
                        max={100}
                        step={5}
                        value={editCommissionPct}
                        onChange={(e) => setEditCommissionPct(parseInt(e.target.value))}
                        className="w-full h-1 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-yellow-500"
                      />
                    </div>

                    <div className="flex gap-2 justify-end pt-2">
                      <button
                        type="button"
                        onClick={() => setEditingId(null)}
                        className="py-1.5 px-3 rounded-lg border border-zinc-800 text-zinc-400 text-xs font-semibold hover:bg-zinc-800 hover:text-white"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="py-1.5 px-3 rounded-lg bg-yellow-500 text-black text-xs font-bold hover:bg-yellow-400"
                      >
                        Save
                      </button>
                    </div>
                  </form>
                );
              }

              return (
                <div
                  key={barber.id}
                  className="flex items-center justify-between border border-zinc-900 bg-zinc-900/30 rounded-2xl p-4 transition-all hover:bg-zinc-900/40"
                >
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-zinc-800 border border-zinc-700 flex items-center justify-center font-bold text-sm text-yellow-500 font-display">
                      {barber.full_name.charAt(0)}
                    </div>
                    <div className="flex flex-col">
                      <span className="font-bold text-sm text-white flex items-center gap-2">
                        {barber.full_name}
                        {!barber.active && (
                          <span className="text-[8px] uppercase px-1.5 py-0.5 rounded bg-zinc-800 text-zinc-500 font-black">Inactive</span>
                        )}
                      </span>
                      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-[10px] text-zinc-500 mt-0.5 font-semibold font-mono">
                        <span className="flex items-center gap-1">
                          <Phone className="h-3 w-3 text-zinc-650" /> {barber.phone}
                        </span>
                        <span className="flex items-center gap-1">
                          <Landmark className="h-3 w-3 text-zinc-650" /> {barber.commission_pct}%
                        </span>
                        <span className="flex items-center gap-1 text-yellow-550">
                          <Lock className="h-3 w-3 text-yellow-600/70" /> PIN: <span className="font-bold text-yellow-500">{barber.pin || 'None'}</span>
                        </span>
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => handleStartEdit(barber)}
                    className="py-1.5 px-3 rounded-lg border border-zinc-855 bg-zinc-950 text-zinc-400 text-xs font-bold hover:bg-zinc-900 hover:text-white transition-all active:scale-95 cursor-pointer"
                  >
                    Edit
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
