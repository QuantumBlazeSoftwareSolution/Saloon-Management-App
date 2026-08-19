'use client';

import { useSaloonStore } from '@/store';
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip } from 'recharts';
import { DollarSign, Award, CalendarDays, BarChart3 } from 'lucide-react';

export default function BarberEarningsPage() {
  const currentProfile = useSaloonStore((state) => state.currentProfile);
  const logs = useSaloonStore((state) => state.logs);

  const barberId = currentProfile?.id || '';

  // Get barber's logs sorted by date
  const barberLogs = logs.filter((l) => l.barber_id === barberId);

  // Math totals
  const totalCommission = barberLogs.reduce((sum, l) => sum + l.commission_amount, 0);
  const totalServicesCount = barberLogs.length;

  // Weekly filter (past 7 days)
  const now = new Date();
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(now.getDate() - 7);
  const weeklyLogs = barberLogs.filter(l => new Date(l.created_at) >= sevenDaysAgo);
  const weeklyCommission = weeklyLogs.reduce((sum, l) => sum + l.commission_amount, 0);

  // Monthly filter (past 30 days)
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(now.getDate() - 30);
  const monthlyLogs = barberLogs.filter(l => new Date(l.created_at) >= thirtyDaysAgo);
  const monthlyCommission = monthlyLogs.reduce((sum, l) => sum + l.commission_amount, 0);

  // Build chart dataset for past 7 days
  const chartData = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(now.getDate() - (6 - i));
    const dayStr = d.toLocaleDateString('en-US', { weekday: 'short' });
    const dayLogs = barberLogs.filter(
      (l) => new Date(l.created_at).toDateString() === d.toDateString()
    );
    const earnings = dayLogs.reduce((sum, l) => sum + l.commission_amount, 0);

    return {
      day: dayStr,
      earnings: parseFloat(earnings.toFixed(2)),
    };
  });

  return (
    <div className="space-y-6">
      {/* Title */}
      <div>
        <span className="text-[10px] uppercase tracking-widest text-zinc-500 font-semibold font-display">Personal Analytics</span>
        <h2 className="text-xl font-bold text-white mt-0.5">Earnings Dashboard</h2>
      </div>

      {/* Grid Cards */}
      <div className="grid grid-cols-2 gap-3">
        <div className="border border-zinc-900 bg-zinc-900/30 rounded-xl p-4 flex flex-col justify-between h-28">
          <div className="flex justify-between items-start">
            <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest leading-none">Weekly Share</span>
            <CalendarDays className="h-4 w-4 text-amber-500" />
          </div>
          <div className="mt-4">
            <span className="text-2xl font-black text-white font-mono">Rs. {weeklyCommission.toFixed(2)}</span>
            <p className="text-[10px] text-zinc-500 font-bold mt-1 uppercase">Past 7 Days</p>
          </div>
        </div>

        <div className="border border-zinc-900 bg-zinc-900/30 rounded-xl p-4 flex flex-col justify-between h-28">
          <div className="flex justify-between items-start">
            <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest leading-none">Monthly Share</span>
            <Award className="h-4 w-4 text-amber-500" />
          </div>
          <div className="mt-4">
            <span className="text-2xl font-black text-white font-mono">Rs. {monthlyCommission.toFixed(2)}</span>
            <p className="text-[10px] text-zinc-500 font-bold mt-1 uppercase">Past 30 Days</p>
          </div>
        </div>
      </div>

      {/* Chart container */}
      <div className="border border-zinc-900 bg-zinc-900/30 rounded-2xl p-4 space-y-4">
        <div className="flex items-center gap-2">
          <BarChart3 className="h-4 w-4 text-amber-500" />
          <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-widest">Weekly Performance Trend</h3>
        </div>
        
        <div className="h-56 w-full pr-4 text-xs font-mono">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 10, right: 0, left: -25, bottom: 0 }}>
              <XAxis 
                dataKey="day" 
                stroke="#52525b" 
                tickLine={false} 
                axisLine={false}
                fontSize={10}
                fontWeight={750}
              />
              <YAxis 
                stroke="#52525b" 
                tickLine={false} 
                axisLine={false} 
                tickFormatter={(v) => `Rs.${v}`}
                fontSize={10}
                fontWeight={750}
              />
              <Tooltip
                cursor={{ fill: 'rgba(245, 158, 11, 0.05)' }}
                contentStyle={{
                  backgroundColor: '#18181b',
                  borderColor: '#27272a',
                  borderRadius: '12px',
                  color: '#fff',
                  fontFamily: 'monospace',
                }}
                formatter={(value: any) => [`Rs. ${value}`, 'Earned']}
              />
              <Bar 
                dataKey="earnings" 
                fill="#f59e0b" 
                radius={[4, 4, 0, 0]} 
                maxBarSize={30}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Stats summary banner */}
      <div className="border border-zinc-900 bg-zinc-900/20 rounded-xl p-4 flex items-center justify-between">
        <div className="flex flex-col gap-0.5">
          <span className="text-zinc-500 text-[10px] uppercase tracking-wider font-semibold">Total Career Services</span>
          <span className="text-sm font-bold text-white">{totalServicesCount} tickets logged</span>
        </div>
        <div className="text-right flex flex-col gap-0.5">
          <span className="text-zinc-500 text-[10px] uppercase tracking-wider font-semibold">Total Share Earned</span>
          <span className="text-base font-black text-amber-400 font-mono">Rs. {totalCommission.toFixed(2)}</span>
        </div>
      </div>
    </div>
  );
}
