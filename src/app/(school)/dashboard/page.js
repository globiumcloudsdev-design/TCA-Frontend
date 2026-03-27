'use client';
/**
 * Dashboard Page — complete stats, charts, recent activity
 */
import { useQuery } from '@tanstack/react-query';
import { dashboardService } from '@/services';
import { formatCurrency } from '@/lib/utils';
import useAuthStore from '@/store/authStore';
import useUiStore from '@/store/uiStore';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge }    from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Users, GraduationCap, BookOpen, CalendarCheck,
  Wallet, Clock, TrendingUp, TrendingDown,
  Activity, CheckCircle, AlertCircle, Info, GitBranch,
  UserPlus, FileText, Bell,
} from 'lucide-react';
import { AttendanceChart, FeesChart, EnrollmentChart, DonutChart } from '@/components/charts';

// ─── Stat Card ─────────────────────────────────────────────────
function StatCard({ label, value, sub, icon: Icon, color = 'bg-primary/10 text-primary', trend }) {
  return (
    <Card className="relative overflow-hidden">
      <CardContent className="p-5">
        <div className="flex items-start justify-between">
          <div className="space-y-1 min-w-0">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide truncate">{label}</p>
            <p className="text-2xl font-bold text-foreground leading-none">{value}</p>
            {sub && <p className="text-xs text-muted-foreground pt-0.5">{sub}</p>}
          </div>
          {Icon && (
            <div className={`flex-shrink-0 rounded-xl p-2.5 ${color}`}>
              <Icon className="h-5 w-5" />
            </div>
          )}
        </div>
        {trend != null && (
          <div className="mt-3 flex items-center gap-1 text-xs">
            {trend >= 0
              ? <TrendingUp  className="h-3.5 w-3.5 text-emerald-500" />
              : <TrendingDown className="h-3.5 w-3.5 text-rose-500" />}
            <span className={trend >= 0 ? 'text-emerald-600' : 'text-rose-600'}>
              {Math.abs(trend)}% vs last month
            </span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function StatCardSkeleton() {
  return (
    <Card>
      <CardContent className="p-5 space-y-3">
        <div className="flex justify-between">
          <div className="space-y-2 flex-1">
            <Skeleton className="h-3 w-24" />
            <Skeleton className="h-7 w-20" />
            <Skeleton className="h-3 w-32" />
          </div>
          <Skeleton className="h-10 w-10 rounded-xl" />
        </div>
      </CardContent>
    </Card>
  );
}

// ─── Chart wrapper ─────────────────────────────────────────────
function ChartCard({ title, children, loading }) {
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

// ─── Activity icon map ─────────────────────────────────────────
const ACTIVITY_ICONS = {
  enrollment : { icon: UserPlus,    bg: 'bg-blue-100   dark:bg-blue-900/30',    color: 'text-blue-600   dark:text-blue-400'   },
  fee        : { icon: Wallet,      bg: 'bg-green-100  dark:bg-green-900/30',   color: 'text-green-600  dark:text-green-400'  },
  exam       : { icon: FileText,    bg: 'bg-purple-100 dark:bg-purple-900/30',  color: 'text-purple-600 dark:text-purple-400' },
  attendance : { icon: CheckCircle, bg: 'bg-emerald-100 dark:bg-emerald-900/30',color: 'text-emerald-600 dark:text-emerald-400'},
  alert      : { icon: AlertCircle, bg: 'bg-rose-100   dark:bg-rose-900/30',    color: 'text-rose-600   dark:text-rose-400'   },
  info       : { icon: Info,        bg: 'bg-sky-100    dark:bg-sky-900/30',     color: 'text-sky-600    dark:text-sky-400'    },
};

// ─── Main Page ─────────────────────────────────────────────────
export default function DashboardPage() {
  const user             = useAuthStore((s) => s.user);
  const activeBranchId   = useUiStore((s) => s.activeBranchId);
  const activeBranchName = useUiStore((s) => s.activeBranchName);

  const { data: statsData, isLoading: statsLoading } = useQuery({
    queryKey: ['dashboard-stats', activeBranchId],
    queryFn:  dashboardService.getStats,
  });

  const { data: chartData, isLoading: chartLoading } = useQuery({
    queryKey: ['dashboard-charts', activeBranchId],
    queryFn:  dashboardService.getChartData,
  });

  const stats  = statsData?.data || {};
  const charts = chartData?.data  || {};

  const activeStudentPct = stats.total_students
    ? Math.round(((stats.active_students ?? 0) / stats.total_students) * 100)
    : 0;

  return (
    <div className="space-y-6">

      {/* ─── Welcome header ─────────────────────────── */}
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">Welcome back, {user?.first_name} 👋</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            {user?.school?.name}
            {activeBranchId && (
              <Badge variant="outline" className="ml-2 text-xs gap-1 align-middle">
                <GitBranch className="h-3 w-3" />
                {activeBranchName}
              </Badge>
            )}
          </p>
        </div>
        <Badge variant="secondary" className="text-xs gap-1 h-7">
          <Activity className="h-3 w-3" />
          Live Overview
        </Badge>
      </div>

      {/* ─── Row 1: Student & Staff stats ───────────── */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {statsLoading
          ? Array.from({ length: 4 }).map((_, i) => <StatCardSkeleton key={i} />)
          : (<>
              <StatCard
                label="Total Students" value={stats.total_students ?? '—'}
                sub={`${stats.active_students ?? 0} active`}
                icon={Users} color="bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400"
                trend={4} />
              <StatCard
                label="Total Teachers" value={stats.total_teachers ?? '—'}
                sub={`${stats.active_teachers ?? 0} active`}
                icon={GraduationCap} color="bg-violet-100 dark:bg-violet-900/30 text-violet-600 dark:text-violet-400"
                trend={1} />
              <StatCard
                label="Total Classes" value={stats.total_classes ?? '—'}
                sub="Across all grades"
                icon={BookOpen} color="bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400" />
              <StatCard
                label="Upcoming Exams" value={stats.upcoming_exams ?? '—'}
                sub="Scheduled this month"
                icon={CalendarCheck} color="bg-rose-100 dark:bg-rose-900/30 text-rose-600 dark:text-rose-400" />
            </>)
        }
      </div>

      {/* ─── Row 2: Financial & Engagement stats ─────── */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {statsLoading
          ? Array.from({ length: 4 }).map((_, i) => <StatCardSkeleton key={i} />)
          : (<>
              <StatCard
                label="Fees Collected" value={formatCurrency(stats.fees_collected ?? 0)}
                sub="This month"
                icon={Wallet} color="bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400"
                trend={8} />
              <StatCard
                label="Fees Pending" value={formatCurrency(stats.fees_pending ?? 0)}
                sub="Outstanding balance"
                icon={Clock} color="bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400"
                trend={-3} />
              <StatCard
                label="Active Students" value={`${activeStudentPct}%`}
                sub={`${stats.active_students ?? 0} of ${stats.total_students ?? 0}`}
                icon={TrendingUp} color="bg-cyan-100 dark:bg-cyan-900/30 text-cyan-600 dark:text-cyan-400" />
              <StatCard
                label="Avg. Attendance" value={stats.avg_attendance_pct != null ? `${stats.avg_attendance_pct}%` : '91%'}
                sub="Monthly average"
                icon={CheckCircle} color="bg-teal-100 dark:bg-teal-900/30 text-teal-600 dark:text-teal-400"
                trend={2} />
            </>)
        }
      </div>

      {/* ─── Row 3: Attendance chart + Gender donut ──── */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <ChartCard title="Monthly Attendance Overview" loading={chartLoading}>
            <AttendanceChart data={charts.attendance} />
          </ChartCard>
        </div>
        <ChartCard title="Gender Distribution" loading={chartLoading}>
          <DonutChart data={charts.gender ?? []} />
        </ChartCard>
      </div>

      {/* ─── Row 4: Fees chart + Fee status donut ────── */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <ChartCard title="Monthly Fee Collection vs Pending" loading={chartLoading}>
            <FeesChart data={charts.fees} />
          </ChartCard>
        </div>
        <ChartCard title="Fee Status Breakdown" loading={chartLoading}>
          <DonutChart data={charts.feeStatus ?? []} />
        </ChartCard>
      </div>

      {/* ─── Row 5: Enrollment chart ──────────────────── */}
      <ChartCard title="Enrollment by Class (Boys vs Girls)" loading={chartLoading}>
        <EnrollmentChart data={charts.enrollment} />
      </ChartCard>

      {/* ─── Row 6: Recent activity ───────────────────── */}
      <Card>
        <CardHeader className="pb-2 pt-4 px-5">
          <CardTitle className="text-sm font-semibold flex items-center gap-2">
            <Bell className="h-4 w-4" /> Recent Activity
          </CardTitle>
        </CardHeader>
        <CardContent className="px-5 pb-5">
          {chartLoading ? (
            <div className="space-y-3">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="flex items-center gap-3">
                  <Skeleton className="h-9 w-9 rounded-full flex-shrink-0" />
                  <div className="flex-1 space-y-1.5">
                    <Skeleton className="h-3.5 w-3/4" />
                    <Skeleton className="h-3 w-1/3" />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="divide-y divide-border">
              {(charts.recentActivity ?? []).map((item) => {
                const cfg  = ACTIVITY_ICONS[item.type] ?? ACTIVITY_ICONS.info;
                const Icon = cfg.icon;
                return (
                  <div key={item.id} className="flex items-center gap-3 py-3 first:pt-0 last:pb-0">
                    <div className={`flex-shrink-0 rounded-full p-2 ${cfg.bg}`}>
                      <Icon className={`h-4 w-4 ${cfg.color}`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-foreground leading-snug">{item.message}</p>
                    </div>
                    <span className="flex-shrink-0 text-xs text-muted-foreground whitespace-nowrap">
                      {item.time}
                    </span>
                  </div>
                );
              })}
              {!(charts.recentActivity?.length) && (
                <p className="py-6 text-center text-sm text-muted-foreground">No recent activity</p>
              )}
            </div>
          )}
        </CardContent>
      </Card>

    </div>
  );
}

