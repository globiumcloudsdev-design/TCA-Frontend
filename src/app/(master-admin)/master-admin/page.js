'use client';

import { useQuery } from '@tanstack/react-query';
import {
  Building2, Users, TrendingUp,
  CheckCircle2,
  Plus, ArrowUpRight, ArrowDownRight,
} from 'lucide-react';
import {
  ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, PieChart, Pie, Cell, Legend,
} from 'recharts';
import { masterAdminService } from '@/services';
import {
  REVENUE_TREND, PIE_DATA, TOP_INSTITUTES, ACTIVITIES, QUICK_ACTIONS,
} from '@/data/masterAdminDummyData';
import { PageHeader, StatsCard } from '@/components/common';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import useAuthStore from '@/store/authStore';

const fmtPKR = (n) => `₨ ${(n / 100000).toFixed(2)}L`;

// ── Custom tooltip for line chart ────────────────────────────────────────
function CustomTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-xl border bg-white px-3 py-2 shadow-lg text-xs">
      <p className="font-semibold text-slate-700 mb-1">{label}</p>
      <p className="text-emerald-600">Revenue: {fmtPKR(payload[0].value)}</p>
    </div>
  );
}

export default function MasterAdminDashboard() {
  const user  = useAuthStore((s) => s.user);
  const canDo = useAuthStore((s) => s.canDo);

  const { data: stats, isLoading } = useQuery({
    queryKey: ['master-stats'],
    queryFn:  () => masterAdminService.getStats(),
  });

  const STAT_CARDS = [
    {
      label: 'Total Institutes', value: stats?.total_schools ?? 245,
      sub: '↑ 8 new this month', icon: Building2, color: 'text-blue-600', bg: 'bg-blue-50',
    },
    {
      label: 'Active', value: stats?.active_schools ?? 198,
      sub: '82% of total', icon: CheckCircle2, color: 'text-emerald-600', bg: 'bg-emerald-50',
    },
    {
      label: 'Revenue (Mar)', value: '₨ 31L',
      sub: '+12.5% vs last month', icon: TrendingUp, color: 'text-violet-600', bg: 'bg-violet-50',
    },
    {
      label: 'Platform Users', value: stats?.total_users ?? 1240,
      sub: 'Across all institutes', icon: Users, color: 'text-amber-600', bg: 'bg-amber-50',
    },
  ];

  const visibleQuickActions = QUICK_ACTIONS.filter((qa) => {
    const permMap = {
      '/master-admin/schools':      'institute.create',
      '/master-admin/subscriptions': 'subscription.create',
      '/master-admin/emails':        'email.send_bulk',
      '/master-admin/reports':       'report.platform_overview',
    };
    const perm = permMap[qa.href];
    return !perm || canDo(perm);
  });

  const today = new Date().toLocaleDateString('en-PK', {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <PageHeader
        title="📊 Platform Dashboard"
        description={`Welcome back, ${user?.first_name ?? 'Admin'}! — ${today}`}
        action={
          canDo('institute.create') && (
            <a href="/master-admin/schools">
              <Button size="sm" className="gap-1.5"><Plus size={14} /> New Institute</Button>
            </a>
          )
        }
      />

      {/* ── Stats Cards ── */}
      {canDo('report.platform_overview') && (
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          {STAT_CARDS.map((c) => (
            <div key={c.label} className="rounded-2xl border bg-white p-4 shadow-sm">
              <div className={cn('mb-3 inline-flex rounded-xl p-2.5', c.bg)}>
                <c.icon size={18} className={c.color} />
              </div>
              <p className="text-2xl font-extrabold text-slate-900 leading-none">{isLoading ? '—' : c.value}</p>
              <p className="mt-1 text-xs font-medium text-slate-500">{c.label}</p>
              <p className="mt-0.5 text-[11px] text-muted-foreground">{c.sub}</p>
            </div>
          ))}
        </div>
      )}

      {/* ── Charts Row ── */}
      <div className="grid gap-4 lg:grid-cols-3">
        {/* Line chart */}
        {canDo('report.revenue') && (
          <div className="lg:col-span-2 rounded-2xl border bg-white p-5 shadow-sm">
            <p className="font-bold text-slate-800 mb-4">📈 Revenue Trend (Last 6 Months)</p>
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={REVENUE_TREND} margin={{ top: 4, right: 8, left: -10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                <YAxis tickFormatter={(v) => `${(v/100000).toFixed(0)}L`} tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                <Tooltip content={<CustomTooltip />} />
                <Line type="monotone" dataKey="revenue" stroke="#10b981" strokeWidth={2.5} dot={{ r: 4, fill: '#10b981' }} activeDot={{ r: 6 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Pie chart */}
        {canDo('report.institute_wise') && (
          <div className="rounded-2xl border bg-white p-5 shadow-sm">
            <p className="font-bold text-slate-800 mb-3">🥧 Institute Types</p>
            <ResponsiveContainer width="100%" height={160}>
              <PieChart>
                <Pie data={PIE_DATA} cx="50%" cy="50%" innerRadius={45} outerRadius={70} paddingAngle={3} dataKey="value">
                  {PIE_DATA.map((entry) => (
                    <Cell key={entry.name} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip formatter={(v) => `${v}%`} />
              </PieChart>
            </ResponsiveContainer>
            <div className="mt-2 space-y-1">
              {PIE_DATA.map((d) => (
                <div key={d.name} className="flex items-center justify-between text-xs">
                  <span className="flex items-center gap-1.5">
                    <span className="inline-block h-2 w-2 rounded-full" style={{ background: d.color }} />
                    <span className="text-slate-600">{d.name}</span>
                  </span>
                  <span className="font-semibold text-slate-700">{d.value}%</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* ── Bottom Row ── */}
      <div className="grid gap-4 lg:grid-cols-3">
        {/* Top institutes */}
        {canDo('report.institute_wise') && (
          <div className="rounded-2xl border bg-white p-5 shadow-sm">
            <p className="font-bold text-slate-800 mb-4">📊 Top Performing Institutes</p>
            <div className="space-y-3">
              {TOP_INSTITUTES.map((inst, idx) => (
                <div key={inst.name} className="flex items-center gap-3">
                  <span className="text-xs font-bold text-muted-foreground w-4">{idx + 1}.</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-slate-800 truncate">{inst.name}</p>
                    <p className="text-xs text-muted-foreground">{inst.revenue}</p>
                  </div>
                  <span className={cn(
                    'flex items-center gap-0.5 text-[11px] font-semibold',
                    inst.change >= 0 ? 'text-emerald-600' : 'text-red-500',
                  )}>
                    {inst.change >= 0 ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}
                    {Math.abs(inst.change)}%
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Activity feed */}
        {canDo('platform.audit_logs') && (
          <div className="rounded-2xl border bg-white p-5 shadow-sm">
            <p className="font-bold text-slate-800 mb-4">🔔 Recent Activities</p>
            <div className="space-y-3">
              {ACTIVITIES.map((a, i) => (
                <div key={i} className="flex gap-2.5">
                  <span className={cn(
                    'mt-0.5 flex-shrink-0 h-2 w-2 rounded-full',
                    a.type === 'success' ? 'bg-emerald-500' :
                    a.type === 'warning' ? 'bg-amber-500' : 'bg-blue-400',
                  )} />
                  <div>
                    <p className="text-xs text-slate-700 leading-snug">{a.text}</p>
                    <p className="text-[10px] text-muted-foreground">{a.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Quick Actions */}
        {visibleQuickActions.length > 0 && (
          <div className="rounded-2xl border bg-white p-5 shadow-sm">
            <p className="font-bold text-slate-800 mb-4">⚡ Quick Actions</p>
            <div className="grid grid-cols-2 gap-2">
              {visibleQuickActions.map((qa) => (
                <a
                  key={qa.label}
                  href={qa.href}
                  className={cn(
                    'flex flex-col items-center justify-center gap-1.5 rounded-xl border p-3 text-center text-[11px] font-semibold transition-colors cursor-pointer',
                    qa.color,
                  )}
                >
                  {qa.label}
                </a>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
