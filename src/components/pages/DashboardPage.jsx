/**
 * DashboardPage — Adaptive for all institute types
 *
 * Uses institute-aware dashboard service with realtime polling.
 */
'use client';

import Link from 'next/link';
import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import useInstituteConfig from '@/hooks/useInstituteConfig';
import { dashboardService } from '@/services';
import StatsCard from '@/components/common/StatsCard';
import useAuthStore from '@/store/authStore';
import { useUiStore } from '@/store/uiStore';
import { AttendanceChart, FeesChart, EnrollmentChart, DonutChart } from '@/components/charts';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Users, GraduationCap, BookOpen, DollarSign,
  Calendar, TrendingUp, BrainCircuit, Building2,
  BarChart3, ClipboardCheck,
  Activity, Bell, GitBranch,
} from 'lucide-react';

// ─── Icon map ───────────────────────────────────────────────────────────────
const ICON_MAP = {
  Users:         <Users size={20} />,
  GraduationCap: <GraduationCap size={20} />,
  BookOpen:      <BookOpen size={20} />,
  DollarSign:    <DollarSign size={20} />,
  Calendar:      <Calendar size={20} />,
  TrendingUp:    <TrendingUp size={20} />,
  BrainCircuit:  <BrainCircuit size={20} />,
  Building2:     <Building2 size={20} />,
  BarChart3:     <BarChart3 size={20} />,
  ClipboardCheck:<ClipboardCheck size={20} />,
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
      { href: `/${type}/students`, label: `Add ${terms.student}` },
      { href: `/${type}/attendance`, label: 'Mark Attendance' },
      { href: `/${type}/fees`, label: 'Fee Management' },
      { href: `/${type}/notices`, label: 'Post Notice' },
    ];

    if (type === 'school') base.push({ href: `/${type}/timetable`, label: 'Timetable' });
    if (type === 'coaching' || type === 'academy' || type === 'tuition_center') {
      base.push({ href: `/${type}/batches`, label: 'Manage Batches' });
    }
    if (type === 'college' || type === 'university') {
      base.push({ href: `/${type}/admissions`, label: 'Admissions' });
    }

    return base;
  }, [type, terms.student]);

  return (
    <div className="space-y-6">

      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">{typeDefinition?.icon} Dashboard</h1>
          <p className="text-sm text-muted-foreground">
            Welcome to {typeDefinition?.label ?? 'your institute'} management dashboard
          </p>
          {activeBranchName && (
            <Badge variant="outline" className="mt-2 gap-1 text-xs">
              <GitBranch className="h-3 w-3" />
              {activeBranchName}
            </Badge>
          )}
        </div>
        <Badge variant="secondary" className="h-7 gap-1 text-xs">
          <Activity className="h-3 w-3" />
          {isFetching ? 'Refreshing live data...' : 'Live overview'}
        </Badge>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {stats.map((stat) => (
          <StatsCard
            key={stat.label}
            label={stat.label}
            value={stat.value}
            icon={ICON_MAP[stat.icon]}
            trend={stat.trend ?? undefined}
            description={stat.description}
            loading={isLoading}
          />
        ))}
      </div>

      <div className="rounded-xl border bg-card p-5">
        <h2 className="mb-3 text-sm font-semibold">Quick Actions</h2>
        <div className="flex flex-wrap gap-2">
          {quickActions.map((action) => (
            <QuickLink key={action.href} href={action.href} label={action.label} />
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <ChartCard title="Monthly Attendance Overview" loading={isLoading}>
            <AttendanceChart data={charts.attendance || []} />
          </ChartCard>
        </div>
        <ChartCard title={`${terms.students} Mix`} loading={isLoading}>
          <DonutChart data={charts.gender || []} />
        </ChartCard>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <ChartCard title="Monthly Fee Collection vs Pending" loading={isLoading}>
            <FeesChart data={charts.fees || []} />
          </ChartCard>
        </div>
        <ChartCard title="Fee Status Breakdown" loading={isLoading}>
          <DonutChart data={charts.feeStatus || []} />
        </ChartCard>
      </div>

      <ChartCard title={`${terms.students} Enrollment Snapshot`} loading={isLoading}>
        <EnrollmentChart data={charts.enrollment || []} />
      </ChartCard>

      <Card>
        <CardHeader className="pb-2 pt-4 px-5">
          <CardTitle className="flex items-center gap-2 text-sm font-semibold">
            <Bell className="h-4 w-4" />
            Recent Activity
          </CardTitle>
        </CardHeader>
        <CardContent className="px-5 pb-5">
          {isLoading ? (
            <div className="space-y-3">
              {Array.from({ length: 5 }).map((_, index) => (
                <div key={index} className="flex items-center gap-3">
                  <Skeleton className="h-9 w-9 rounded-full" />
                  <div className="flex-1 space-y-1.5">
                    <Skeleton className="h-3.5 w-3/4" />
                    <Skeleton className="h-3 w-1/3" />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="divide-y divide-border">
              {recentActivity.map((item) => {
                const cfg = ACTIVITY_ICONS[item.type] || ACTIVITY_ICONS.info;
                const Icon = cfg.icon;
                return (
                  <div key={item.id} className="flex items-center gap-3 py-3 first:pt-0 last:pb-0">
                    <div className={`flex-shrink-0 rounded-full p-2 ${cfg.bg}`}>
                      <Icon className={`h-4 w-4 ${cfg.color}`} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm text-foreground leading-snug">{item.message}</p>
                    </div>
                    <span className="flex-shrink-0 whitespace-nowrap text-xs text-muted-foreground">
                      {item.time}
                    </span>
                  </div>
                );
              })}
              {!recentActivity.length && (
                <p className="py-6 text-center text-sm text-muted-foreground">No recent activity</p>
              )}
            </div>
          )}
          {dashboard.lastUpdated && (
            <p className="mt-4 text-right text-xs text-muted-foreground">
              Last synced: {new Date(dashboard.lastUpdated).toLocaleTimeString()}
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function QuickLink({ href, label }) {
  return (
    <Link
      href={href}
      className="rounded-md border bg-background px-3 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground"
    >
      {label}
    </Link>
  );
}

function ChartCard({ title, loading, children }) {
  return (
    <Card>
      <CardHeader className="pb-2 pt-4 px-5">
        <CardTitle className="text-sm font-semibold">{title}</CardTitle>
      </CardHeader>
      <CardContent className="px-4 pb-4">
        {loading ? <Skeleton className="h-[280px] w-full rounded-lg" /> : children}
      </CardContent>
    </Card>
  );
}
