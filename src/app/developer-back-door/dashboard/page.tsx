"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSaloonStore } from "@/store";
import {
  Shield,
  Plus,
  Loader2,
  LogOut,
  CheckCircle,
  AlertCircle,
  Building2,
  User,
  Phone,
  Mail,
  X,
  Check,
  Clock,
  Trash2,
} from "lucide-react";
import {
  getAllSaloons,
  createSaloonAndOwner,
  getSaloonRequestsAction,
  approveSaloonRequestAction,
  rejectSaloonRequestAction,
} from "@/lib/actions/admin";

export default function AdminDashboard() {
  const router = useRouter();
  const currentProfile = useSaloonStore((state) => state.currentProfile);
  const logout = useSaloonStore((state) => state.logout);

  // Lists & Tabs States
  const [saloons, setSaloons] = useState<any[]>([]);
  const [requests, setRequests] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<"saloons" | "requests">("saloons");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [actioningId, setActioningId] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Selected Saloon State (Option B path)
  const [selectedSaloon, setSelectedSaloon] = useState<any | null>(null);

  // Form State
  const [saloonName, setSaloonName] = useState("");
  const [ownerName, setOwnerName] = useState("");
  const [ownerPhone, setOwnerPhone] = useState("");
  const [ownerEmail, setOwnerEmail] = useState("");

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const resSaloons = await getAllSaloons();
      if (resSaloons.success && resSaloons.data) {
        setSaloons(resSaloons.data);
        if (selectedSaloon) {
          const updated = resSaloons.data.find(
            (s) => s.id === selectedSaloon.id,
          );
          if (updated) setSelectedSaloon(updated);
        }
      }

      const resRequests = await getSaloonRequestsAction();
      if (resRequests.success && resRequests.data) {
        setRequests(resRequests.data);
      }
    } finally {
      setLoading(false);
    }
  };

  const _hasHydrated = useSaloonStore((state) => state._hasHydrated);

  useEffect(() => {
    if (!_hasHydrated) return;
    if (!currentProfile || currentProfile.role !== "admin") {
      router.replace("/developer-back-door/login");
      return;
    }
    fetchDashboardData();
  }, [currentProfile, _hasHydrated]);

  const handleLogout = () => {
    logout();
    router.replace("/developer-back-door/login");
  };

  const handleCreateTenant = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    const targetSaloonName = selectedSaloon ? selectedSaloon.name : saloonName;
    if (
      !targetSaloonName.trim() ||
      !ownerName.trim() ||
      !ownerPhone.trim() ||
      !ownerEmail.trim()
    ) {
      setError("Please fill in all fields.");
      return;
    }

    setSubmitting(true);
    try {
      const res = await createSaloonAndOwner({
        saloonName: targetSaloonName.trim(),
        ownerName: ownerName.trim(),
        ownerPhone: ownerPhone.trim(),
        ownerEmail: ownerEmail.trim(),
        saloonId: selectedSaloon?.id,
        origin: window.location.origin,
      });

      if (res.success) {
        if (selectedSaloon) {
          setSuccess(
            `Invitation setup email sent to new owner "${ownerName}" for saloon "${selectedSaloon.name}"!`,
          );
        } else {
          setSuccess(
            `Saloon "${saloonName}" provisioned successfully. Setup email dispatched!`,
          );
        }
        setSaloonName("");
        setOwnerName("");
        setOwnerPhone("");
        setOwnerEmail("");
        await fetchDashboardData();
      } else {
        setError(res.error || "Failed to create tenant.");
      }
    } catch (err: any) {
      setError("Provisioning failed.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleApproveRequest = async (requestId: string) => {
    setError("");
    setSuccess("");
    setActioningId(requestId);
    try {
      const res = await approveSaloonRequestAction({
        requestId,
        origin: window.location.origin,
      });
      if (res.success) {
        setSuccess(
          "Setup request approved. Setup invitation email has been sent!",
        );
        await fetchDashboardData();
      } else {
        setError(res.error || "Failed to approve request.");
      }
    } catch (err: any) {
      setError("Approval failed.");
    } finally {
      setActioningId(null);
    }
  };

  const handleRejectRequest = async (requestId: string) => {
    setError("");
    setSuccess("");
    setActioningId(requestId);
    try {
      const res = await rejectSaloonRequestAction({
        requestId,
        origin: window.location.origin,
      });
      if (res.success) {
        setSuccess("Setup request rejected.");
        await fetchDashboardData();
      } else {
        setError(res.error || "Failed to reject request.");
      }
    } catch (err: any) {
      setError("Rejection failed.");
    } finally {
      setActioningId(null);
    }
  };

  const selectSaloon = (s: any) => {
    setError("");
    setSuccess("");
    setSelectedSaloon(s);
    setSaloonName(s.name);
  };

  if (!_hasHydrated) {
    return (
      <div className="min-h-screen bg-zinc-950 flex flex-col items-center justify-center">
        <Loader2 className="h-6 w-6 text-purple-500 animate-spin" />
        <span className="text-[10px] text-zinc-555 font-bold uppercase tracking-wider mt-3">
          Loading session...
        </span>
      </div>
    );
  }

  if (!currentProfile || currentProfile.role !== "admin") {
    return null;
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col">
      <header className="border-b border-zinc-900 bg-zinc-900/30 backdrop-blur-md sticky top-0 z-40 px-6 py-4">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-purple-500" />
            <h1 className="font-bold text-sm tracking-widest uppercase">
              Admin Backdoor
            </h1>
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
        {/* Left Side: Tabs Panel */}
        <section className="md:col-span-7 space-y-4">
          <div className="flex border-b border-zinc-900 gap-4 mb-4">
            <button
              onClick={() => setActiveTab("saloons")}
              className={`pb-2.5 px-1 font-bold text-xs uppercase tracking-widest transition-all cursor-pointer relative ${
                activeTab === "saloons"
                  ? "text-purple-500 font-extrabold"
                  : "text-zinc-500 hover:text-zinc-300"
              }`}
            >
              Active Saloons ({saloons.length})
              {activeTab === "saloons" && (
                <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-purple-500" />
              )}
            </button>
            <button
              onClick={() => setActiveTab("requests")}
              className={`pb-2.5 px-1 font-bold text-xs uppercase tracking-widest transition-all cursor-pointer relative ${
                activeTab === "requests"
                  ? "text-purple-500 font-extrabold"
                  : "text-zinc-500 hover:text-zinc-300"
              }`}
            >
              Setup Requests ({requests.length})
              {activeTab === "requests" && (
                <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-purple-500" />
              )}
            </button>
          </div>

          {loading ? (
            <div className="flex flex-col items-center justify-center py-20 border border-dashed border-zinc-900 rounded-2xl">
              <Loader2 className="h-6 w-6 text-purple-500 animate-spin" />
              <span className="text-[10px] text-zinc-650 font-bold uppercase tracking-wider mt-3">
                Loading dashboard data...
              </span>
            </div>
          ) : activeTab === "saloons" ? (
            /* Saloons List */
            saloons.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 border border-dashed border-zinc-900 rounded-2xl">
                <Building2 className="h-10 w-10 text-zinc-800 mb-3" />
                <h3 className="text-xs font-bold text-zinc-500">
                  No saloon tenants found
                </h3>
              </div>
            ) : (
              <div className="grid gap-3">
                {saloons.map((s) => {
                  const isSelected = selectedSaloon?.id === s.id;
                  return (
                    <div
                      key={s.id}
                      onClick={() => selectSaloon(s)}
                      className={`p-4 border rounded-2xl flex flex-col gap-1 cursor-pointer transition-all duration-300 ${
                        isSelected
                          ? "border-purple-500 bg-purple-500/5 shadow-lg shadow-purple-500/5"
                          : "border-zinc-900 bg-zinc-900/30 hover:border-zinc-800"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <h3 className="font-bold text-white text-sm">
                          {s.name}
                        </h3>
                        <span className="text-[10px] text-zinc-550 font-mono">
                          {new Date(s.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                      <p className="text-[10px] text-zinc-650 font-mono">
                        ID: {s.id}
                      </p>

                      {s.owners && s.owners.length > 0 ? (
                        <div className="flex flex-wrap gap-1 mt-1.5 pt-1.5 border-t border-zinc-900/40">
                          <span className="text-[9px] text-purple-400 font-bold uppercase tracking-wider">
                            Owners:{" "}
                          </span>
                          <span className="text-[10px] text-zinc-400 font-semibold">
                            {s.owners.map((o: any) => o.fullName).join(", ")}
                          </span>
                        </div>
                      ) : (
                        <p className="text-[9px] text-zinc-600 font-semibold uppercase tracking-wider mt-1.5 pt-1.5 border-t border-zinc-900/40">
                          No registered owners
                        </p>
                      )}
                    </div>
                  );
                })}
              </div>
            )
          ) : /* Setup Requests List */
          requests.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 border border-dashed border-zinc-900 rounded-2xl">
              <Clock className="h-10 w-10 text-zinc-850 mb-3" />
              <h3 className="text-xs font-bold text-zinc-555">
                No pending workspace requests
              </h3>
            </div>
          ) : (
            <div className="grid gap-3">
              {requests.map((r) => {
                const isPending = r.status === "pending";
                return (
                  <div
                    key={r.id}
                    className="p-4 border border-zinc-900 bg-zinc-900/30 rounded-2xl flex flex-col gap-2 transition-all duration-300"
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="font-bold text-white text-sm">
                          {r.saloonName}
                        </h3>
                        <span className="text-[10px] text-zinc-555 font-mono">
                          Requested: {new Date(r.createdAt).toLocaleString()}
                        </span>
                      </div>

                      {/* Status Badge */}
                      <span
                        className={`text-[9px] font-bold uppercase px-2 py-0.5 rounded-full border ${
                          r.status === "approved"
                            ? "bg-green-500/10 border-green-500/20 text-green-400"
                            : r.status === "rejected"
                              ? "bg-red-500/10 border-red-500/20 text-red-400"
                              : "bg-amber-500/10 border-amber-500/20 text-amber-400"
                        }`}
                      >
                        {r.status}
                      </span>
                    </div>

                    <div className="space-y-0.5 text-xs text-zinc-400 mt-1">
                      <div className="flex items-center gap-1.5">
                        <Mail className="h-3.5 w-3.5 text-zinc-600" />
                        <span>{r.ownerEmail}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Phone className="h-3.5 w-3.5 text-zinc-600" />
                        <span className="font-mono">{r.ownerPhone}</span>
                      </div>
                    </div>

                    {isPending && (
                      <div className="flex items-center gap-2 mt-3 pt-3 border-t border-zinc-900">
                        <button
                          disabled={actioningId !== null}
                          onClick={() => handleApproveRequest(r.id)}
                          className="flex-1 py-1.5 bg-purple-600 hover:bg-purple-500 disabled:opacity-40 rounded-xl text-xs font-bold text-white flex items-center justify-center gap-1.5 cursor-pointer"
                        >
                          {actioningId === r.id ? (
                            <Loader2 className="h-3.5 w-3.5 animate-spin" />
                          ) : (
                            <Check className="h-3.5 w-3.5" />
                          )}
                          <span>Approve Setup</span>
                        </button>
                        <button
                          disabled={actioningId !== null}
                          onClick={() => handleRejectRequest(r.id)}
                          className="py-1.5 px-3 bg-zinc-800 hover:bg-red-950/20 hover:text-red-400 hover:border-red-500/20 border border-transparent rounded-xl text-xs font-bold text-zinc-400 flex items-center justify-center gap-1.5 cursor-pointer transition-all"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                          <span>Reject</span>
                        </button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </section>

        {/* Right Side: Direct Provisioning Action Form */}
        <section className="md:col-span-5">
          <div className="p-5 border border-zinc-900 bg-zinc-900/30 rounded-2xl sticky top-24 space-y-4">
            <div className="flex items-start justify-between">
              <div>
                <h2 className="text-sm font-bold text-white">
                  {selectedSaloon
                    ? `Add Owner to: ${selectedSaloon.name}`
                    : "Provision New Saloon"}
                </h2>
                <p className="text-zinc-500 text-xs mt-0.5">
                  {selectedSaloon
                    ? "Register another administrative owner profile for this saloon."
                    : "Setup a saloon instance and invite its Owner."}
                </p>
              </div>
              {selectedSaloon && (
                <button
                  onClick={() => {
                    setSelectedSaloon(null);
                    setSaloonName("");
                    setError("");
                    setSuccess("");
                  }}
                  className="p-1 rounded-md text-zinc-500 hover:text-white hover:bg-zinc-800 transition-all"
                  title="Clear selection"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
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
              {!selectedSaloon && (
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
              )}

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
                    <span>Processing Setup...</span>
                  </>
                ) : (
                  <>
                    <Plus className="h-4 w-4" />
                    <span>
                      {selectedSaloon
                        ? "Add Owner & Invite"
                        : "Provision & Invite"}
                    </span>
                  </>
                )}
              </button>
            </form>

            {/* List Owners if selected */}
            {selectedSaloon &&
              selectedSaloon.owners &&
              selectedSaloon.owners.length > 0 && (
                <div className="pt-4 border-t border-zinc-900 mt-5 space-y-2.5">
                  <h4 className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">
                    Linked Owners ({selectedSaloon.owners.length})
                  </h4>
                  <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                    {selectedSaloon.owners.map((o: any) => (
                      <div
                        key={o.id}
                        className="p-3 bg-zinc-950/40 border border-zinc-900 rounded-xl space-y-0.5"
                      >
                        <p className="text-xs font-bold text-white">
                          {o.fullName}
                        </p>
                        <div className="flex flex-col gap-0.5 text-[10px] text-zinc-555 font-mono">
                          <span>Email: {o.email}</span>
                          <span>Phone: {o.phone}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
          </div>
        </section>
      </main>
    </div>
  );
}
