'use client';

import { useState, useEffect } from 'react';
import { useSaloonStore } from '@/store';
import { Briefcase, Plus, Tag, DollarSign, Check, ShieldAlert } from 'lucide-react';
import { getServicesBySaloonIdAction, createServiceAction, updateServiceAction } from '@/lib/actions/services';

export default function OwnerServicesPage() {
  const currentProfile = useSaloonStore((state) => state.currentProfile);
  const [services, setServices] = useState<any[]>([]);

  const [name, setName] = useState('');
  const [priceStr, setPriceStr] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const [editPriceStr, setEditPriceStr] = useState('');
  const [editActive, setEditActive] = useState(true);

  const fetchServices = async () => {
    if (!currentProfile) return;
    const res = await getServicesBySaloonIdAction(currentProfile.saloonId, false);
    if (res.success && res.data) {
      setServices(res.data);
    }
  };

  useEffect(() => {
    if (currentProfile) {
      fetchServices();
    }
  }, [currentProfile]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const price = parseFloat(priceStr);
    
    if (!name || isNaN(price) || price < 0 || !currentProfile) {
      setError('Please enter a valid service name and numeric price.');
      return;
    }

    const res = await createServiceAction({
      saloonId: currentProfile.saloonId,
      name,
      basePrice: price,
      active: true,
    });

    if (res.success) {
      setSuccess('Service catalog updated!');
      setName('');
      setPriceStr('');
      setError('');
      await fetchServices();
      setTimeout(() => setSuccess(''), 2000);
    } else {
      setError(res.error || 'Failed to create service');
    }
  };

  const handleStartEdit = (s: any) => {
    setEditingId(s.id);
    setEditName(s.name);
    setEditPriceStr(s.basePrice.toString());
    setEditActive(s.active);
  };

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    const price = parseFloat(editPriceStr);
    if (editingId && !isNaN(price) && price >= 0) {
      const res = await updateServiceAction(editingId, {
        name: editName,
        basePrice: price,
        active: editActive,
      });

      if (res.success) {
        setEditingId(null);
        setSuccess('Service saved!');
        await fetchServices();
        setTimeout(() => setSuccess(''), 2000);
      } else {
        setError(res.error || 'Failed to update service');
      }
    }
  };

  return (
    <div className="space-y-6">
      {}
      <div>
        <span className="text-[10px] uppercase tracking-widest text-zinc-500 font-semibold font-display">Store Configuration</span>
        <h2 className="text-xl font-bold text-white mt-0.5">Services Menu</h2>
      </div>

      {success && (
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

      {}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {}
        <div className="md:col-span-1 border border-zinc-900 bg-zinc-900/20 rounded-2xl p-5 space-y-4 h-fit">
          <div className="flex items-center gap-2">
            <Plus className="h-4 w-4 text-yellow-500" />
            <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-widest">Create Service</h3>
          </div>

          <form onSubmit={handleSubmit} className="space-y-3.5">
            <div>
              <label className="block text-zinc-500 text-[10px] uppercase tracking-wider font-bold mb-1.5">
                Service Name
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Beard wash & shave"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full rounded-lg border border-zinc-800 bg-zinc-950 py-2.5 px-3 text-xs text-white focus:border-yellow-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-zinc-500 text-[10px] uppercase tracking-wider font-bold mb-1.5">
                Base Price
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold text-zinc-650">Rs.</span>
                <input
                  type="number"
                  step="0.01"
                  required
                  placeholder="2500.00"
                  value={priceStr}
                  onChange={(e) => setPriceStr(e.target.value)}
                  className="w-full rounded-lg border border-zinc-800 bg-zinc-950 py-2.5 pl-10 pr-3 text-xs text-white focus:border-yellow-500 focus:outline-none font-mono"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-2.5 px-4 rounded-lg bg-yellow-500 text-black text-xs font-bold hover:bg-yellow-400 active:scale-95 transition-all cursor-pointer"
            >
              Add Service
            </button>
          </form>
        </div>

        {}
        <div className="md:col-span-2 space-y-3">
          <div className="flex items-center gap-2 px-1">
            <Briefcase className="h-4 w-4 text-yellow-500" />
            <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-widest">Active Services ({services.length})</h3>
          </div>

          <div className="space-y-2">
            {services.map((service) => {
              const isEditing = editingId === service.id;

              if (isEditing) {
                return (
                  <form
                    key={service.id}
                    onSubmit={handleSaveEdit}
                    className="border border-yellow-500/30 bg-zinc-900/50 p-4 rounded-2xl space-y-3"
                  >
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-zinc-500 text-[9px] uppercase font-bold mb-1">Service Title</label>
                        <input
                          type="text"
                          required
                          value={editName}
                          onChange={(e) => setEditName(e.target.value)}
                          className="w-full rounded-lg border border-zinc-800 bg-zinc-950 py-1.5 px-3 text-xs text-white"
                        />
                      </div>
                      <div>
                        <label className="block text-zinc-500 text-[9px] uppercase font-bold mb-1">Price (Rs.)</label>
                        <input
                          type="number"
                          step="0.01"
                          required
                          value={editPriceStr}
                          onChange={(e) => setEditPriceStr(e.target.value)}
                          className="w-full rounded-lg border border-zinc-800 bg-zinc-950 py-1.5 px-3 text-xs text-white font-mono"
                        />
                      </div>
                    </div>

                    <div className="flex justify-between items-center gap-3 py-1">
                      <div className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          id="serv-active-check"
                          checked={editActive}
                          onChange={(e) => setEditActive(e.target.checked)}
                          className="rounded border-zinc-800 bg-zinc-950 text-yellow-500 focus:ring-0 h-4 w-4"
                        />
                        <label htmlFor="serv-active-check" className="text-xs text-zinc-355 font-bold select-none cursor-pointer">Menu Active</label>
                      </div>
                      
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={() => setEditingId(null)}
                          className="py-1.5 px-3 rounded-lg border border-zinc-800 text-zinc-450 text-xs font-semibold hover:bg-zinc-800 hover:text-white"
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
                    </div>
                  </form>
                );
              }

              return (
                <div
                  key={service.id}
                  className="flex items-center justify-between border border-zinc-900 bg-zinc-900/30 rounded-2xl p-4 transition-all hover:bg-zinc-900/40"
                >
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-lg bg-zinc-800 border border-zinc-700 flex items-center justify-center">
                      <Tag className="h-4.5 w-4.5 text-yellow-500" />
                    </div>
                    <div className="flex flex-col">
                      <span className="font-bold text-sm text-white flex items-center gap-2">
                        {service.name}
                        {!service.active && (
                          <span className="text-[8px] uppercase px-1.5 py-0.5 rounded bg-zinc-800 text-zinc-500 font-black">Disabled</span>
                        )}
                      </span>
                      <span className="text-[10px] text-zinc-500 mt-0.5 font-bold font-mono">
                        Base Rate: Rs. {service.basePrice.toFixed(2)}
                      </span>
                    </div>
                  </div>

                  <button
                    onClick={() => handleStartEdit(service)}
                    className="py-1.5 px-3 rounded-lg border border-zinc-850 bg-zinc-950 text-zinc-400 text-xs font-bold hover:bg-zinc-900 hover:text-white transition-all active:scale-95 cursor-pointer"
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
