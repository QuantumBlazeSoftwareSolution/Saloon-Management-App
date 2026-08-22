'use client';

import { useState, useEffect } from 'react';
import { useSaloonStore } from '@/store';
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip, PieChart, Pie, Cell, AreaChart, Area } from 'recharts';
import { CalendarDays, Landmark, TrendingUp, Users, PieChart as PieIcon, BarChart3, Award } from 'lucide-react';
import { getServiceLogsBySaloonIdAction } from '@/lib/actions/service-logs';
import { getProfilesBySaloonIdAction } from '@/lib/actions/profiles';
import { getServicesBySaloonIdAction } from '@/lib/actions/services';

const COLORS = ['#d4af37', '#e5a93b', '#a8a29e', '#71717a', '#3f3f46'];

export default function OwnerAnalyticsPage() {
  const currentProfile = useSaloonStore((state) => state.currentProfile);
  const [logs, setLogs] = useState<any[]>([]);
  const [profiles, setProfiles] = useState<any[]>([]);
  const [services, setServices] = useState<any[]>([]);

  const [dateFilter, setDateFilter] = useState<'week' | 'month' | 'year'>('week');

  const fetchDbData = async () => {
    if (!currentProfile) return;
    const logsRes = await getServiceLogsBySaloonIdAction(currentProfile.saloonId);
    if (logsRes.success && logsRes.data) {
      setLogs(logsRes.data);
    }
    const profilesRes = await getProfilesBySaloonIdAction(currentProfile.saloonId);
    if (profilesRes.success && profilesRes.data) {
      setProfiles(profilesRes.data);
    }
    const servicesRes = await getServicesBySaloonIdAction(currentProfile.saloonId, false);
    if (servicesRes.success && servicesRes.data) {
      setServices(servicesRes.data);
    }
  };

  useEffect(() => {
    if (currentProfile) {
      fetchDbData();
    }
  }, [currentProfile, dateFilter]);

  // Filter logs based on selection
  const getFilteredLogs = () => {
    const now = new Date();
    const filterDate = new Date();
    
    if (dateFilter === 'week') {
      filterDate.setDate(now.getDate() - 7);
    } else if (dateFilter === 'month') {
      filterDate.setDate(now.getDate() - 30);
    } else if (dateFilter === 'year') {
      filterDate.setFullYear(now.getFullYear() - 1);
    }

    return logs.filter((l) => new Date(l.createdAt) >= filterDate);
  };

  const filteredLogs = getFilteredLogs();

  // Metrics math
  const totalRevenue = filteredLogs.reduce((sum, l) => {
    const discountedPrice = Number(l.priceAtTime) * (1 - Number(l.discountPct) / 100);
    return sum + discountedPrice;
  }, 0);

  const totalCommission = filteredLogs.reduce((sum, l) => sum + Number(l.commissionAmount), 0);
  const netEarnings = totalRevenue - totalCommission;

  // 1. Group by Day for Bar & Area Chart
  const getBarChartData = () => {
    const groups: { [key: string]: number } = {};
    const now = new Date();

    if (dateFilter === 'week') {
      for (let i = 6; i >= 0; i--) {
        const d = new Date();
        d.setDate(now.getDate() - i);
        const dayKey = d.toLocaleDateString('en-US', { weekday: 'short' });
        groups[dayKey] = 0;
      }
      filteredLogs.forEach((l) => {
        const dayKey = new Date(l.createdAt).toLocaleDateString('en-US', { weekday: 'short' });
        if (dayKey in groups) {
          const rev = Number(l.priceAtTime) * (1 - Number(l.discountPct) / 100);
          groups[dayKey] += rev;
        }
      });
    } else if (dateFilter === 'month') {
      for (let i = 29; i >= 0; i -= 3) {
        const d = new Date();
        d.setDate(now.getDate() - i);
        const dayKey = `${d.getMonth() + 1}/${d.getDate()}`;
        groups[dayKey] = 0;
      }
      filteredLogs.forEach((l) => {
        const d = new Date(l.createdAt);
        // Find nearest group step (step of 3 days)
        const dayKey = `${d.getMonth() + 1}/${d.getDate()}`;
        // fallback match closest key
        const keys = Object.keys(groups);
        let matchedKey = keys[0];
        let minDiff = Infinity;
        keys.forEach(k => {
          const [m, day] = k.split('/').map(Number);
          const groupDate = new Date(d.getFullYear(), m - 1, day);
          const diff = Math.abs(d.getTime() - groupDate.getTime());
          if (diff < minDiff) {
            minDiff = diff;
            matchedKey = k;
          }
        });
        const rev = Number(l.priceAtTime) * (1 - Number(l.discountPct) / 100);
        groups[matchedKey] += rev;
      });
    } else {
      // Monthly steps for past year
      for (let i = 11; i >= 0; i--) {
        const d = new Date();
        d.setMonth(now.getMonth() - i);
        const dayKey = d.toLocaleDateString('en-US', { month: 'short' });
        groups[dayKey] = 0;
      }
      filteredLogs.forEach((l) => {
        const dayKey = new Date(l.createdAt).toLocaleDateString('en-US', { month: 'short' });
        if (dayKey in groups) {
          const rev = Number(l.priceAtTime) * (1 - Number(l.discountPct) / 100);
          groups[dayKey] += rev;
        }
      });
    }

    return Object.entries(groups).map(([label, revenue]) => ({
      name: label,
      revenue: parseFloat(revenue.toFixed(0)),
    }));
  };

  const chartData = getBarChartData();

  // Cumulative Area Chart Data
  let cumulativeSum = 0;
  const areaChartData = chartData.map((d) => {
    cumulativeSum += d.revenue;
    return {
      name: d.name,
      cumulative: parseFloat(cumulativeSum.toFixed(0)),
    };
  });

  // 2. Pie chart data: Split by service
  const serviceDistributionMap: { [key: string]: number } = {};
  filteredLogs.forEach((l) => {
    const rev = Number(l.priceAtTime) * (1 - Number(l.discountPct) / 100);
    const sName = l.serviceName || 'Unknown Service';
    serviceDistributionMap[sName] = (serviceDistributionMap[sName] || 0) + rev;
  });

  const pieData = Object.entries(serviceDistributionMap)
    .map(([name, value]) => ({
      name,
      value: parseFloat(value.toFixed(0)),
    }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 5); // top 5 only

  // 3. Leaderboard for Barbers
  const barberLeaderboardMap: { [key: string]: { name: string; total: number; servicesCount: number } } = {};
  filteredLogs.forEach((l) => {
    const rev = Number(l.priceAtTime) * (1 - Number(l.discountPct) / 100);
    const bId = l.barberId;
    const bName = l.barberName || 'Unknown Barber';
    if (!barberLeaderboardMap[bId]) {
      barberLeaderboardMap[bId] = {
        name: bName,
        total: 0,
        servicesCount: 0
      };
    }
    barberLeaderboardMap[bId].total += rev;
    barberLeaderboardMap[bId].servicesCount += 1;
  });

  const leaderboard = Object.entries(barberLeaderboardMap)
    .map(([id, stats]) => ({
      id,
      ...stats,
    }))
    .sort((a, b) => b.total - a.total);

  return (
    <div className="space-y-6">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <span className="text-[10px] uppercase tracking-widest text-zinc-500 font-semibold font-display">Performance Analytics</span>
          <h2 className="text-xl font-bold text-white mt-0.5">Shop Reports</h2>
        </div>
        
        {/* Date Filter Tabs */}
        <div className="flex bg-zinc-900 border border-zinc-800 p-1 rounded-xl w-fit self-start">
          {[
            { id: 'week', label: '7 Days' },
            { id: 'month', label: '30 Days' },
            { id: 'year', label: '12 Months' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setDateFilter(tab.id as any)}
              className={`py-1.5 px-3 rounded-lg text-xs font-bold transition-all ${
                dateFilter === tab.id
                  ? 'bg-yellow-500 text-black'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Stats Cards Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <div className="border border-zinc-900 bg-zinc-900/30 rounded-xl p-4 flex flex-col justify-between h-24">
          <div className="flex justify-between items-start">
            <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest leading-none">Gross Revenue</span>
            <TrendingUp className="h-4 w-4 text-yellow-500" />
          </div>
          <div>
            <span className="text-2xl font-black text-white font-mono">Rs. {totalRevenue.toFixed(0)}</span>
          </div>
        </div>

        <div className="border border-zinc-900 bg-zinc-900/30 rounded-xl p-4 flex flex-col justify-between h-24">
          <div className="flex justify-between items-start">
            <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest leading-none">Staff Payouts</span>
            <Users className="h-4 w-4 text-yellow-500" />
          </div>
          <div>
            <span className="text-2xl font-black text-zinc-400 font-mono">Rs. {totalCommission.toFixed(0)}</span>
          </div>
        </div>

        <div className="border border-zinc-900 bg-zinc-900/30 rounded-xl p-4 flex flex-col justify-between h-24">
          <div className="flex justify-between items-start">
            <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest leading-none">Shop Net Profit</span>
            <Landmark className="h-4 w-4 text-emerald-500" />
          </div>
          <div>
            <span className="text-2xl font-black text-emerald-400 font-mono">Rs. {netEarnings.toFixed(0)}</span>
          </div>
        </div>
      </div>

      {/* Main Charts Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Revenue Bar Chart */}
        <div className="border border-zinc-900 bg-zinc-900/20 rounded-2xl p-4 space-y-4">
          <div className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4 text-yellow-500" />
            <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-widest">Revenue Streams</h3>
          </div>
          <div className="h-56 w-full pr-4 text-[10px] font-mono">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 10, right: 0, left: -25, bottom: 0 }}>
                <XAxis dataKey="name" stroke="#52525b" tickLine={false} axisLine={false} />
                <YAxis stroke="#52525b" tickLine={false} axisLine={false} tickFormatter={(v) => `Rs.${v}`} />
                <Tooltip
                  cursor={{ fill: 'rgba(212, 175, 55, 0.03)' }}
                  contentStyle={{ backgroundColor: '#18181b', borderColor: '#27272a', borderRadius: '12px', color: '#fff' }}
                  formatter={(value: any) => [`Rs. ${value}`, 'Revenue']}
                />
                <Bar dataKey="revenue" fill="#d4af37" radius={[4, 4, 0, 0]} maxBarSize={24} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Cumulative Area Chart */}
        <div className="border border-zinc-900 bg-zinc-900/20 rounded-2xl p-4 space-y-4">
          <div className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-emerald-500" />
            <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-widest">Cumulative Growth Trend</h3>
          </div>
          <div className="h-56 w-full pr-4 text-[10px] font-mono">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={areaChartData} margin={{ top: 10, right: 0, left: -20, bottom: 0 }}>
                <XAxis dataKey="name" stroke="#52525b" tickLine={false} axisLine={false} />
                <YAxis stroke="#52525b" tickLine={false} axisLine={false} tickFormatter={(v) => `Rs.${v}`} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#18181b', borderColor: '#27272a', borderRadius: '12px', color: '#fff' }}
                  formatter={(value: any) => [`Rs. ${value}`, 'Total Revenue']}
                />
                <Area type="monotone" dataKey="cumulative" stroke="#10b981" fill="rgba(16, 185, 129, 0.05)" strokeWidth={2.5} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Service Donut Chart */}
        <div className="border border-zinc-900 bg-zinc-900/20 rounded-2xl p-4 flex flex-col justify-between">
          <div className="flex items-center gap-2">
            <PieIcon className="h-4 w-4 text-yellow-500" />
            <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-widest">Revenue by Service</h3>
          </div>
          
          <div className="flex flex-col sm:flex-row items-center gap-4 mt-4">
            <div className="h-44 w-44">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={70}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{ backgroundColor: '#18181b', borderColor: '#27272a', borderRadius: '12px', color: '#fff' }}
                    formatter={(value: any) => [`Rs. ${value}`, 'Share']}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>

            <div className="flex-1 w-full space-y-2">
              {pieData.map((item, index) => (
                <div key={item.name} className="flex justify-between items-center text-xs">
                  <div className="flex items-center gap-2">
                    <div className="h-2 w-2 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }} />
                    <span className="text-zinc-400 font-medium truncate max-w-[130px]">{item.name}</span>
                  </div>
                  <span className="font-bold text-white font-mono">Rs. {item.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Staff Leaderboards */}
        <div className="border border-zinc-900 bg-zinc-900/20 rounded-2xl p-4 flex flex-col justify-between">
          <div className="flex items-center gap-2">
            <Award className="h-4 w-4 text-yellow-500" />
            <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-widest">Barber Leaderboard</h3>
          </div>

          <div className="space-y-3 mt-4">
            {leaderboard.length === 0 ? (
              <div className="text-center py-10 text-xs text-zinc-500 font-bold uppercase tracking-wider">No Activity Logged</div>
            ) : (
              leaderboard.slice(0, 4).map((barber, index) => (
                <div key={barber.id} className="flex items-center justify-between border border-zinc-900 bg-zinc-900/30 p-3 rounded-xl">
                  <div className="flex items-center gap-3">
                    <span className="font-mono text-zinc-600 font-black text-sm">#{index + 1}</span>
                    <div className="flex flex-col">
                      <span className="font-bold text-sm text-white">{barber.name}</span>
                      <span className="text-[9px] text-zinc-500 font-semibold">{barber.servicesCount} tickets completed</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="font-black text-sm text-yellow-500 font-mono">Rs. {barber.total.toFixed(0)}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
