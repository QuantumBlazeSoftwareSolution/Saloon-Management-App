'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSaloonStore } from '@/store';
import { Shield, Plus, Loader2, LogOut, CheckCircle, AlertCircle, Building2, User, Phone, Mail } from 'lucide-react';
import { getAllSaloons, createSaloonAndOwner } from '@/lib/actions/admin';

export default function AdminDashboard() {
  const router = useRouter();
  const currentProfile = useSaloonStore((state) => state.currentProfile);
  const logout = useSaloonStore((state) => state.logout);

  const [saloons, setSaloons] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Form State
  const [saloonName, setSaloonName] = useState('');
  const [ownerName, setOwnerName] = useState('');
  const [ownerPhone, setOwnerPhone] = useState('');
  const [ownerEmail, setOwnerEmail] = useState('');

  const fetchSaloons = async () => {
    setLoading(true);
    try {
      const res = await getAllSaloons();
      if (res.success && res.data) {
        setSaloons(res.data);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!currentProfile || currentProfile.role !== 'admin') {
      router.replace('/developer-back-door/login');
      return;
    }
    fetchSaloons();
  }, [currentProfile]);

  const handleLogout = () => {
    logout();
    router.replace('/developer-back-door/login');
  };

  const handleCreateTenant = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!saloonName.trim() || !ownerName.trim() || !ownerPhone.trim() || !ownerEmail.trim()) {
      setError('Please fill in all fields.');
      return;
    }

    setSubmitting(true);
    try {
      const res = await createSaloonAndOwner(
        saloonName.trim(),
        ownerName.trim(),
        ownerPhone.trim(),
        ownerEmail.trim()
      );

      if (res.success) {
        setSuccess(`Saloon "${saloonName}" provisioned. Setup setup email dispatched!`);
        setSaloonName('');
        setOwnerName('');
        setOwnerPhone('');
        setOwnerEmail('');
        await fetchSaloons();
      } else {
        setError(res.error || 'Failed to create tenant.');
      }
    } catch (err: any) {
      setError('Provisioning failed.');
    } finally {
      setSubmitting(false);
    }
  };

  if (!currentProfile || currentProfile.role !== 'admin') {
    return null;
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col">
      <header className="border-b border-zinc-900 bg-zinc-900/30 backdrop-blur-md sticky top-0 z-40 px-6 py-4">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-purple-500" />
            <h1 className="font-bold text-sm tracking-widest uppercase">Admin Backdoor</h1>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center gap-1.5 text-xs text-zinc-500 hover:text-white font-bold transition-all"
          >
            <LogOut className="h-4 w-4" />
            <span>Sign Out</span>
          </button>
        </div>
      </header>

      <main className="max-w-5xl mx-auto w-full flex-1 p-6 grid grid-cols-1 md:grid-cols-12 gap-6">
        <section className="md:col-span-7 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-zinc-400 uppercase tracking-wider">Active Saloons ({saloons.length})</h2>
          </div>

          {loading ? (
            <div className="flex flex-col items-center justify-center py-20 border border-dashed border-zinc-900 rounded-2xl">
              <Loader2 className="h-6 w-6 text-purple-500 animate-spin" />
              <span className="text-[10px] text-zinc-650 font-bold uppercase tracking-wider mt-3">Loading tenants...</span>
            </div>
          ) : saloons.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 border border-dashed border-zinc-900 rounded-2xl">
              <Building2 className="h-10 w-10 text-zinc-800 mb-3" />
              <h3 className="text-xs font-bold text-zinc-500">No saloon tenants found</h3>
            </div>
          ) : (
            <div className="grid gap-3">
              {saloons.map((s) => (
                <div
                  key={s.id}
                  className="p-4 border border-zinc-900 bg-zinc-900/30 rounded-2xl flex items-center justify-between"
                >
                  <div>
                    <h3 className="font-bold text-white text-sm">{s.name}</h3>
                    <p className="text-[10px] text-zinc-500 font-mono mt-0.5">ID: {s.id}</p>
                  </div>
                  <span className="text-[10px] text-zinc-500 font-mono">
                    {new Date(s.createdAt).toLocaleDateString()}
                  </span>
                </div>
              ))}
            </div>
          )}
        </section>

        <section className="md:col-span-5">
          <div className="p-5 border border-zinc-900 bg-zinc-900/30 rounded-2xl sticky top-24 space-y-4">
            <div>
              <h2 className="text-sm font-bold text-white">Provision New Saloon</h2>
              <p className="text-zinc-500 text-xs mt-0.5">Setup a saloon instance and invite its Owner.</p>
            </div>

            {error && (
              <div className="flex items-center gap-2 rounded-xl bg-red-500/10 border border-red-500/20 p-3 text-red-400 text-xs">
                <AlertCircle className="h-4 w-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {success && (
              <div className="flex items-center gap-2 rounded-xl bg-green-500/10 border border-green-500/20 p-3 text-green-400 text-xs">
                <CheckCircle className="h-4 w-4 shrink-0" />
                <span>{success}</span>
              </div>
            )}

            <form onSubmit={handleCreateTenant} className="space-y-4">
              <div>
                <label className="block text-zinc-500 text-[10px] uppercase font-bold mb-1.5 flex items-center gap-1">
                  <Building2 className="h-3.5 w-3.5" /> Saloon Name
                </label>
                <input
                  type="text"
                  required
                  value={saloonName}
                  onChange={(e) => setSaloonName(e.target.value)}
                  placeholder="e.g. Barber Studio"
                  className="w-full px-3 py-2 bg-zinc-950 border border-zinc-800 rounded-xl text-sm text-white focus:outline-none focus:border-purple-500"
                />
              </div>

              <div>
                <label className="block text-zinc-500 text-[10px] uppercase font-bold mb-1.5 flex items-center gap-1">
                  <User className="h-3.5 w-3.5" /> Owner Full Name
                </label>
                <input
                  type="text"
                  required
                  value={ownerName}
                  onChange={(e) => setOwnerName(e.target.value)}
                  placeholder="e.g. John Doe"
                  className="w-full px-3 py-2 bg-zinc-950 border border-zinc-800 rounded-xl text-sm text-white focus:outline-none focus:border-purple-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-zinc-500 text-[10px] uppercase font-bold mb-1.5 flex items-center gap-1">
                    <Phone className="h-3.5 w-3.5" /> Phone
                  </label>
                  <input
                    type="tel"
                    required
                    value={ownerPhone}
                    onChange={(e) => setOwnerPhone(e.target.value)}
                    placeholder="0777999888"
                    className="w-full px-3 py-2 bg-zinc-950 border border-zinc-800 rounded-xl text-sm text-white focus:outline-none focus:border-purple-500 font-mono"
                  />
                </div>
                <div>
                  <label className="block text-zinc-500 text-[10px] uppercase font-bold mb-1.5 flex items-center gap-1">
                    <Mail className="h-3.5 w-3.5" /> Email
                  </label>
                  <input
                    type="email"
                    required
                    value={ownerEmail}
                    onChange={(e) => setOwnerEmail(e.target.value)}
                    placeholder="owner@email.com"
                    className="w-full px-3 py-2 bg-zinc-950 border border-zinc-800 rounded-xl text-sm text-white focus:outline-none focus:border-purple-500"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full py-2.5 bg-purple-600 hover:bg-purple-500 active:scale-[0.98] transition-all rounded-xl text-sm font-bold text-white shadow-lg shadow-purple-600/10 flex items-center justify-center gap-2 cursor-pointer"
              >
                {submitting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>Provisioning...</span>
                  </>
                ) : (
                  <>
                    <Plus className="h-4 w-4" />
                    <span>Provision & Invite</span>
                  </>
                )}
              </button>
            </form>
          </div>
        </section>
      </main>
    </div>
  );
}
