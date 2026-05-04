/**
 * DashboardPage — Adaptive for all institute types
 *
 * Uses institute-aware dashboard service with realtime polling.
 */
'use client';
import Link from 'next/link';
import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { dashboardService } from '@/services';
import StatsCard from '@/components/common/StatsCard';
import useAuthStore from '@/store/authStore';
import { useUiStore } from '@/store/uiStore';
import { AttendanceChart, FeesChart, EnrollmentChart, DonutChart, FinancialChart } from '@/components/charts';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Users, GraduationCap, BookOpen, DollarSign,
  Calendar, TrendingUp, BrainCircuit, Building2,
  BarChart3, ClipboardCheck,
  Activity, Bell, GitBranch,
  ArrowUpRight, Plus,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import useInstituteConfig from '@/hooks/useInstituteConfig';

// ─── Icon map ───────────────────────────────────────────────────────────────
const ICON_MAP = {
  Users: { icon: <Users size={20} />, variant: 'indigo' },
  GraduationCap: { icon: <GraduationCap size={20} />, variant: 'violet' },
  BookOpen: { icon: <BookOpen size={20} />, variant: 'emerald' },
  DollarSign: { icon: <DollarSign size={20} />, variant: 'amber' },
  Calendar: { icon: <Calendar size={20} />, variant: 'rose' },
  Building2: { icon: <Building2 size={20} />, variant: 'cyan' },
  ClipboardCheck: { icon: <ClipboardCheck size={20} />, variant: 'emerald' },
};

const ACTIVITY_ICONS = {
  enrollment: { icon: Users, color: 'text-blue-600', bg: 'bg-blue-100' },
  fee: { icon: DollarSign, color: 'text-emerald-600', bg: 'bg-emerald-100' },
  attendance: { icon: ClipboardCheck, color: 'text-indigo-600', bg: 'bg-indigo-100' },
  exam: { icon: Calendar, color: 'text-orange-600', bg: 'bg-orange-100' },
  info: { icon: Bell, color: 'text-slate-600', bg: 'bg-slate-100' },
};

export default function DashboardPage({ type }) {
  const { terms, typeDefinition } = useInstituteConfig();
  const user = useAuthStore((s) => s.user);
  const activeBranchId = useUiStore((s) => s.activeBranchId);
  const activeBranchName = useUiStore((s) => s.activeBranchName);

  const { data, isLoading, isFetching } = useQuery({
    queryKey: ['adaptive-dashboard', type, activeBranchId],
    queryFn: () =>
      dashboardService.getAdaptiveDashboard({
        type,
        roleCode: user?.role_code,
        branchId: activeBranchId,
      }),
    refetchInterval: 30000,
    staleTime: 10000,
    retry: 1,
  });

  const dashboard = data?.data || {};
  const stats = Array.isArray(dashboard.stats) ? dashboard.stats : [];
  const charts = dashboard.charts || {};
  const recentActivity = Array.isArray(dashboard.recentActivity) ? dashboard.recentActivity : [];

  const quickActions = useMemo(() => {
    const base = [
      { href: `/${type}/students`, label: `Add ${terms.student}`, icon: <Plus size={14} /> },
      { href: `/${type}/attendance`, label: 'Mark Attendance', icon: <ClipboardCheck size={14} /> },
      { href: `/${type}/fees`, label: 'Collect Fee', icon: <DollarSign size={14} /> },
      { href: `/${type}/expenses`, label: 'Add Expense', icon: <ArrowUpRight size={14} /> },
    ];

    if (type === 'school') base.push({ href: `/${type}/timetable`, label: 'Timetable', icon: <Calendar size={14} /> });

    return base;
  }, [type, terms.student]);

  return (
    <div className="space-y-8 animate-in fade-in duration-700">

      {/* HEADER SECTION */}
      <div className="flex flex-col md:flex-row items-start justify-between gap-6">
        <div className="space-y-1">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 flex items-center justify-center rounded-2xl bg-indigo-600 text-white shadow-lg shadow-indigo-200">
              <Activity size={20} />
            </div>
            <div>
              <h1 className="text-3xl font-bold tracking-tight text-slate-900">Institute Overview</h1>
              <p className="text-slate-500 font-medium">
                Welcome back, <span className="text-indigo-600">@{user?.first_name + ' ' + user?.last_name || 'Administrator'}</span>
              </p>
            </div>
          </div>
          {activeBranchName && (
            <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-slate-100 border border-slate-200 rounded-full text-[11px] font-bold text-slate-600 uppercase tracking-wider mt-3">
              <GitBranch size={12} className="text-indigo-500" />
              Branch: {activeBranchName}
            </div>
          )}
        </div>

        <div className="flex items-center gap-3">
          <Badge variant="outline" className="bg-white border-indigo-100 text-indigo-700 h-9 px-4 gap-2 font-semibold shadow-sm">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-500"></span>
            </span>
            {isFetching ? 'Syncing...' : 'Realtime Data Active'}
          </Badge>
          <Link href={`/${type}/reports`}>
            <Button variant="outline" size="sm" className="h-9 gap-2 border-slate-200 hover:bg-slate-50 transition-all font-bold text-slate-700 rounded-xl px-4">
              <TrendingUp size={14} className="text-emerald-500" /> Reports
            </Button>
          </Link>
        </div>
      </div>

      {/* STATS GRID */}
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {stats.slice(0, 8).map((stat) => (
          <StatsCard
            key={stat.label}
            label={stat.label}
            value={stat.value}
            icon={ICON_MAP[stat.icon]?.icon}
            variant={ICON_MAP[stat.icon]?.variant || 'default'}
            trend={stat.trend ?? undefined}
            description={stat.description}
            loading={isLoading}
          />
        ))}
      </div>

      {/* FINANCIAL & ACTION BAR */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Charts: Financial Performance */}
        <div className="lg:col-span-8 space-y-6">
          <ChartCard
            title="Financial Performance"
            subtitle="Monthly Income vs Expenses"
            loading={isLoading}
          >
            <FinancialChart data={charts.incomeExpense || []} />
          </ChartCard>

          <ChartCard title="Fee Collection Status" loading={isLoading}>
            <FeesChart data={charts.fees || []} />
          </ChartCard>

          <ChartCard title="Attendance Trends (last 6 months)" loading={isLoading}>
            <AttendanceChart data={charts.attendance || []} />
          </ChartCard>
        </div>

        {/* Right Sidebar: Actions & Activity */}
        <div className="lg:col-span-4 space-y-6">
          <Card className="border-slate-200 shadow-sm overflow-hidden rounded-2xl">
            <CardHeader className="bg-slate-50/50 border-b border-slate-100 p-5">
              <CardTitle className="text-sm font-bold flex items-center gap-2 text-slate-800">
                <BrainCircuit className="h-4 w-4 text-indigo-500" />
                Quick Intelligence
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 space-y-2">
              {quickActions.map((action) => (
                <Link
                  key={action.href}
                  href={action.href}
                  className="flex items-center justify-between p-3 rounded-xl hover:bg-slate-50 border border-transparent hover:border-slate-200 transition-all group"
                >
                  <div className="flex items-center gap-3">
                    <div className="h-8 w-8 flex items-center justify-center rounded-lg bg-white shadow-sm border border-slate-100 text-slate-600 group-hover:text-indigo-600 transition-colors">
                      {action.icon}
                    </div>
                    <span className="text-sm font-bold text-slate-700">{action.label}</span>
                  </div>
                  <ArrowUpRight size={14} className="text-slate-300 group-hover:text-indigo-400 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all" />
                </Link>
              ))}
            </CardContent>
          </Card>

          <Card className="border-slate-200 shadow-sm rounded-2xl">
            <CardHeader className="pb-2 pt-5 px-6">
              <CardTitle className="flex items-center gap-2 text-sm font-bold text-slate-800">
                <Bell className="h-4 w-4 text-rose-500" />
                Recent Operation Activity
              </CardTitle>
            </CardHeader>
            <CardContent className="px-6 pb-6">
              {isLoading ? (
                <div className="space-y-4">
                  {Array.from({ length: 4 }).map((_, i) => (
                    <div key={i} className="flex items-center gap-3">
                      <Skeleton className="h-10 w-10 rounded-full" />
                      <div className="flex-1 space-y-2">
                        <Skeleton className="h-3 w-3/4" />
                        <Skeleton className="h-2 w-1/4" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="space-y-5">
                  {recentActivity.map((item, idx) => {
                    const cfg = ACTIVITY_ICONS[item.type] || ACTIVITY_ICONS.info;
                    const Icon = cfg.icon;
                    return (
                      <div key={item.id} className="relative flex items-start gap-4 group">
                        {idx !== recentActivity.length - 1 && (
                          <div className="absolute left-5 top-10 bottom-0 w-[1px] bg-slate-100 group-hover:bg-indigo-100 transition-colors" />
                        )}
                        <div className={`flex-shrink-0 rounded-xl p-2.5 shadow-sm border border-white ${cfg.bg} z-10`}>
                          <Icon className={`h-4 w-4 ${cfg.color}`} />
                        </div>
                        <div className="min-w-0 flex-1 pt-0.5">
                          <p className="text-[13px] font-bold text-slate-800 leading-snug group-hover:text-indigo-700 transition-colors">{item.message}</p>
                          <p className="text-[11px] font-medium text-slate-400 mt-0.5">{item.time}</p>
                        </div>
                      </div>
                    );
                  })}
                  {!recentActivity.length && (
                    <p className="py-10 text-center text-sm text-slate-400 font-medium italic">No recent operation activity found.</p>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* LOWER GRIDS: Enrollment & Demographic Breakdown */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="xl:col-span-2">
          <ChartCard title={`${terms.students} Enrollment Snapshot`} loading={isLoading}>
            <EnrollmentChart data={charts.enrollment || []} />
          </ChartCard>
        </div>
        <div className="grid grid-cols-1 gap-6">
          <ChartCard title="Gender Distribution" loading={isLoading}>
            <DonutChart data={charts.gender || []} />
          </ChartCard>
          <ChartCard title="Fee Payment Health" loading={isLoading}>
            <DonutChart data={charts.feeStatus || []} />
          </ChartCard>
        </div>
      </div>

      {dashboard.lastUpdated && (
        <div className="flex items-center justify-end gap-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest pb-6">
          <div className="h-1 w-1 rounded-full bg-emerald-500 animate-pulse" />
          Last Data Sync: {new Date(dashboard.lastUpdated).toLocaleTimeString()}
        </div>
      )}
    </div>
  );
}

function ChartCard({ title, subtitle, loading, children }) {
  return (
    <Card className="border-slate-200 shadow-sm rounded-2xl overflow-hidden hover:shadow-md transition-all">
      <CardHeader className="pb-2 pt-5 px-6">
        <CardTitle className="text-sm font-bold text-slate-800">{title}</CardTitle>
        {subtitle && <p className="text-[11px] text-slate-400 font-medium uppercase tracking-wider">{subtitle}</p>}
      </CardHeader>
      <CardContent className="px-5 pb-5">
        {loading ? <Skeleton className="h-[280px] w-full rounded-2xl" /> : children}
      </CardContent>
    </Card>
  );
}
