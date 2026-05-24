'use client';

import { useMemo } from 'react';
import { motion } from 'framer-motion';
import {
  ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip,
  CartesianGrid, PieChart, Pie, Cell,
} from 'recharts';
import { TrendingUp, Users, Trophy, MessageSquare, Target } from 'lucide-react';
import type { Business, Lead, LeadStatus } from '@/lib/supabase/types';

const STATUS_COLORS: Record<LeadStatus, string> = {
  new: '#0EA5FF',
  contacted: '#7C3AED',
  quoted: '#F59E0B',
  won: '#22C55E',
  lost: '#FF6835',
};

function formatDay(dateStr: string) {
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

interface Props {
  business: Business;
  leads: Lead[];
}

export function AnalyticsClient({ leads }: Props) {
  const stats = useMemo(() => {
    const total = leads.length;
    const won = leads.filter(l => l.status === 'won').length;
    const thisMonth = leads.filter(l => {
      const d = new Date(l.created_at);
      const now = new Date();
      return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
    });
    const contacted = leads.filter(l => ['contacted', 'quoted', 'won', 'lost'].includes(l.status)).length;
    const convRate = total > 0 ? ((won / total) * 100).toFixed(1) : '0';
    const responseRate = total > 0 ? Math.round((contacted / total) * 100) : 0;
    const avgPerDay = thisMonth.length > 0
      ? (thisMonth.length / new Date().getDate()).toFixed(1)
      : '0';

    return { total, won, monthTotal: thisMonth.length, convRate, responseRate, avgPerDay };
  }, [leads]);

  // Last 30 days area chart data
  const areaData = useMemo(() => {
    return Array.from({ length: 30 }, (_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - (29 - i));
      const key = d.toISOString().slice(0, 10);
      return {
        date: key,
        label: formatDay(key),
        leads: leads.filter(l => l.created_at.startsWith(key)).length,
        won: leads.filter(l => l.created_at.startsWith(key) && l.status === 'won').length,
      };
    });
  }, [leads]);

  // Status distribution pie data
  const pieData = useMemo(() => {
    const counts: Record<LeadStatus, number> = { new: 0, contacted: 0, quoted: 0, won: 0, lost: 0 };
    for (const l of leads) counts[l.status]++;
    return Object.entries(counts)
      .filter(([, v]) => v > 0)
      .map(([status, value]) => ({ name: status, value, color: STATUS_COLORS[status as LeadStatus] }));
  }, [leads]);

  // Funnel data
  const funnelData = useMemo(() => {
    const total = leads.length || 1;
    return [
      { label: 'Captured', count: leads.length, pct: 100 },
      { label: 'Contacted', count: leads.filter(l => ['contacted', 'quoted', 'won', 'lost'].includes(l.status)).length, pct: 0 },
      { label: 'Quoted', count: leads.filter(l => ['quoted', 'won'].includes(l.status)).length, pct: 0 },
      { label: 'Won', count: leads.filter(l => l.status === 'won').length, pct: 0 },
    ].map(row => ({ ...row, pct: Math.round((row.count / total) * 100) }));
  }, [leads]);

  const StatCard = ({ label, value, sub, icon, delay }: { label: string; value: string | number; sub?: string; icon: React.ReactNode; delay: number }) => (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      className="rounded-[14px] p-5"
      style={{ background: 'var(--bg-2)', border: '1px solid var(--border)' }}
    >
      <div className="flex items-start justify-between mb-3">
        <span className="text-xs font-medium text-[var(--muted)] uppercase tracking-[0.06em]">{label}</span>
        <span className="text-[var(--accent)]">{icon}</span>
      </div>
      <div className="font-display font-extrabold text-3xl tracking-tight text-[var(--text)]">{value}</div>
      {sub && <p className="text-xs text-[var(--muted)] mt-1">{sub}</p>}
    </motion.div>
  );

  const CustomTooltip = ({ active, payload, label }: { active?: boolean; payload?: { value: number; name: string }[]; label?: string }) => {
    if (!active || !payload?.length) return null;
    return (
      <div className="rounded-[10px] px-3 py-2.5 text-xs" style={{ background: 'var(--bg-3)', border: '1px solid var(--border-2)', color: 'var(--text)' }}>
        <p className="font-medium mb-1">{label}</p>
        {payload.map(p => (
          <p key={p.name} style={{ color: p.name === 'leads' ? '#0EA5FF' : '#22C55E' }}>
            {p.name === 'leads' ? 'Leads' : 'Won'}: {p.value}
          </p>
        ))}
      </div>
    );
  };

  return (
    <div className="p-6 flex flex-col gap-6">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="font-display font-extrabold text-2xl tracking-tight text-[var(--text)]">Analytics</h1>
        <p className="text-sm text-[var(--muted)] mt-0.5">Performance metrics and lead conversion data</p>
      </motion.div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
        <StatCard label="Total leads" value={stats.total} sub="All time" icon={<Users size={15} />} delay={0.05} />
        <StatCard label="This month" value={stats.monthTotal} sub={`${stats.avgPerDay}/day avg`} icon={<TrendingUp size={15} />} delay={0.1} />
        <StatCard label="Response rate" value={`${stats.responseRate}%`} sub="Contacted or better" icon={<MessageSquare size={15} />} delay={0.15} />
        <StatCard label="Win rate" value={`${stats.convRate}%`} sub={`${stats.won} jobs won`} icon={<Trophy size={15} />} delay={0.2} />
      </div>

      <div className="flex gap-5 flex-col xl:flex-row">
        {/* Area chart — 60% */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
          className="flex-[1.5] rounded-[14px] p-5"
          style={{ background: 'var(--bg-2)', border: '1px solid var(--border)' }}
        >
          <div className="mb-5">
            <h2 className="font-display font-bold text-base text-[var(--text)]">Lead volume · last 30 days</h2>
          </div>
          {leads.length === 0 ? (
            <div className="h-[220px] flex items-center justify-center">
              <p className="text-sm text-[var(--muted)]">No leads yet — start capturing with your widget</p>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={220}>
              <AreaChart data={areaData} margin={{ top: 4, right: 4, left: -24, bottom: 0 }}>
                <defs>
                  <linearGradient id="grad-leads" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#0EA5FF" stopOpacity={0.18} />
                    <stop offset="95%" stopColor="#0EA5FF" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="grad-won" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#22C55E" stopOpacity={0.18} />
                    <stop offset="95%" stopColor="#22C55E" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                <XAxis
                  dataKey="label"
                  tick={{ fill: 'rgba(238,240,255,0.35)', fontSize: 10 }}
                  axisLine={false}
                  tickLine={false}
                  interval={6}
                />
                <YAxis tick={{ fill: 'rgba(238,240,255,0.35)', fontSize: 10 }} axisLine={false} tickLine={false} allowDecimals={false} />
                <Tooltip content={<CustomTooltip />} />
                <Area type="monotone" dataKey="leads" stroke="#0EA5FF" strokeWidth={2} fill="url(#grad-leads)" dot={false} />
                <Area type="monotone" dataKey="won" stroke="#22C55E" strokeWidth={2} fill="url(#grad-won)" dot={false} />
              </AreaChart>
            </ResponsiveContainer>
          )}
          <div className="flex gap-4 mt-3">
            {[{ color: '#0EA5FF', label: 'Total leads' }, { color: '#22C55E', label: 'Won' }].map(l => (
              <div key={l.label} className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full" style={{ background: l.color }} />
                <span className="text-xs text-[var(--muted)]">{l.label}</span>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Right column — pie + funnel */}
        <div className="xl:w-[280px] shrink-0 flex flex-col gap-5">
          {/* Pie chart */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="rounded-[14px] p-5"
            style={{ background: 'var(--bg-2)', border: '1px solid var(--border)' }}
          >
            <h2 className="font-display font-bold text-base text-[var(--text)] mb-4">Status breakdown</h2>
            {pieData.length === 0 ? (
              <p className="text-sm text-[var(--muted)] text-center py-6">No data</p>
            ) : (
              <>
                <ResponsiveContainer width="100%" height={140}>
                  <PieChart>
                    <Pie data={pieData} cx="50%" cy="50%" innerRadius={38} outerRadius={60} paddingAngle={3} dataKey="value">
                      {pieData.map(entry => (
                        <Cell key={entry.name} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip
                      formatter={(value, name) => [value, String(name).charAt(0).toUpperCase() + String(name).slice(1)]}
                      contentStyle={{ background: 'var(--bg-3)', border: '1px solid var(--border-2)', borderRadius: 8, fontSize: 12 }}
                      labelStyle={{ display: 'none' }}
                      itemStyle={{ color: 'var(--text)' }}
                    />
                  </PieChart>
                </ResponsiveContainer>
                <div className="flex flex-col gap-1.5 mt-2">
                  {pieData.map(d => (
                    <div key={d.name} className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full" style={{ background: d.color }} />
                        <span className="text-[var(--muted)] capitalize">{d.name}</span>
                      </div>
                      <span className="text-[var(--text)] font-medium">{d.value}</span>
                    </div>
                  ))}
                </div>
              </>
            )}
          </motion.div>

          {/* Conversion funnel */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35 }}
            className="rounded-[14px] p-5"
            style={{ background: 'var(--bg-2)', border: '1px solid var(--border)' }}
          >
            <div className="flex items-center gap-2 mb-4">
              <Target size={14} className="text-[var(--accent)]" />
              <h2 className="font-display font-bold text-base text-[var(--text)]">Conversion funnel</h2>
            </div>
            <div className="flex flex-col gap-3">
              {funnelData.map((row, i) => (
                <div key={row.label}>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-xs text-[var(--muted)]">{row.label}</span>
                    <span className="text-xs font-medium text-[var(--text)]">{row.count} <span className="text-[var(--subtle)]">({row.pct}%)</span></span>
                  </div>
                  <div className="h-1.5 rounded-full overflow-hidden" style={{ background: 'var(--bg-3)' }}>
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${row.pct}%` }}
                      transition={{ delay: 0.4 + i * 0.08, duration: 0.6, ease: 'easeOut' }}
                      className="h-full rounded-full"
                      style={{ background: i === funnelData.length - 1 ? '#22C55E' : '#0EA5FF', opacity: 1 - i * 0.15 }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
