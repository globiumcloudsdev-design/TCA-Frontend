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
import { resolveBranchName } from '@/lib/branchUtils';
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
import { formatCurrency } from '@/lib/utils';
import { studentService, teacherService, classService } from '@/services';
import { Wallet, Clock, CheckCircle } from 'lucide-react';

// ─── Icon map ───────────────────────────────────────────────────────────────
const ICON_MAP = {
  Users: { icon: <Users size={20} />, variant: 'indigo' },
  GraduationCap: { icon: <GraduationCap size={20} />, variant: 'violet' },
  BookOpen: { icon: <BookOpen size={20} />, variant: 'emerald' },
  DollarSign: { icon: <DollarSign size={20} />, variant: 'amber' },
  Wallet: { icon: <Wallet size={20} />, variant: 'emerald' },
  Calendar: { icon: <Calendar size={20} />, variant: 'rose' },
  CalendarCheck: { icon: <Calendar size={20} />, variant: 'rose' },
  Building2: { icon: <Building2 size={20} />, variant: 'cyan' },
  ClipboardCheck: { icon: <ClipboardCheck size={20} />, variant: 'cyan' },
  CheckCircle: { icon: <CheckCircle size={20} />, variant: 'emerald' },
  TrendingUp: { icon: <TrendingUp size={20} />, variant: 'cyan' },
  Clock: { icon: <Clock size={20} />, variant: 'amber' },
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
  const canDo = useAuthStore((s) => s.canDo);
  const activeBranchId = useUiStore((s) => s.activeBranchId);
  const rawActiveBranchName = useUiStore((s) => s.activeBranchName);
  const activeBranchName = useMemo(() => {
    if (!activeBranchId && !rawActiveBranchName) return null;
    return resolveBranchName(rawActiveBranchName || activeBranchId, null);
  }, [activeBranchId, rawActiveBranchName]);

  const userId = user?.id || 'guest';
  const instituteId = user?.institute?.id || user?.school?.id || user?.institute_id || 'default';

  const { data, isLoading, isFetching } = useQuery({
    queryKey: ['adaptive-dashboard', type, activeBranchId, userId, instituteId],
    queryFn: () =>
      dashboardService.getAdaptiveDashboard({
        type,
        roleCode: user?.role_code,
        branchId: activeBranchId,
      }),
    enabled: !!user?.id,
    staleTime: 60000,
    retry: 1,
  });

  // Fallback count queries — only run if primary dashboard is loaded and cached for 5 mins
  const { data: studentsFallbackData } = useQuery({
    queryKey: ['dashboard-fallback-students', type, activeBranchId, userId, instituteId],
    queryFn: () => studentService.getAll({ limit: 1, branch_id: activeBranchId || undefined }, type),
    enabled: !!user?.id && !isLoading,
    staleTime: 5 * 60 * 1000,
  });

  const { data: teachersFallbackData } = useQuery({
    queryKey: ['dashboard-fallback-teachers', type, activeBranchId, userId, instituteId],
    queryFn: () => teacherService.getAll({ limit: 1, branch_id: activeBranchId || undefined }),
    enabled: !!user?.id && !isLoading,
    staleTime: 5 * 60 * 1000,
  });

  const { data: classesFallbackData } = useQuery({
    queryKey: ['dashboard-fallback-classes', type, activeBranchId, userId, instituteId],
    queryFn: () => classService.getAll({ limit: 1, branch_id: activeBranchId || undefined, institute_type: type }),
    enabled: !!user?.id && !isLoading,
    staleTime: 5 * 60 * 1000,
  });

  const extractTotal = (res) => {
    if (!res) return null;
    if (typeof res?.pagination?.total === 'number') return res.pagination.total;
    if (typeof res?.data?.pagination?.total === 'number') return res.data.pagination.total;
    if (typeof res?.meta?.pagination?.total === 'number') return res.meta.pagination.total;
    if (typeof res?.meta?.total === 'number') return res.meta.total;
    if (typeof res?.total === 'number') return res.total;
    if (typeof res?.data?.total === 'number') return res.data.total;
    if (typeof res?.count === 'number') return res.count;
    if (typeof res?.data?.count === 'number') return res.data.count;
    const d = res?.data?.rows ?? res?.data?.students ?? res?.data?.teachers ?? res?.data?.classes ?? res?.data ?? res?.rows ?? res;
    if (Array.isArray(d)) return d.length;
    return null;
  };

  const fallbackStudentsCount = useMemo(() => {
    return extractTotal(studentsFallbackData);
  }, [studentsFallbackData]);

  const fallbackTeachersCount = useMemo(() => {
    return extractTotal(teachersFallbackData);
  }, [teachersFallbackData]);

  const fallbackClassesCount = useMemo(() => {
    return extractTotal(classesFallbackData);
  }, [classesFallbackData]);

  const dashboard = data?.data || data || {};
  const charts = dashboard.charts || {};
  const recentActivity = Array.isArray(dashboard.recentActivity) ? dashboard.recentActivity : [];

  const summary = useMemo(() => {
    return (
      dashboard.summary ||
      dashboard.stats_summary ||
      dashboard.overview ||
      dashboard.counts ||
      (typeof dashboard.stats === 'object' && !Array.isArray(dashboard.stats) ? dashboard.stats : {}) ||
      dashboard ||
      {}
    );
  }, [dashboard]);

  const parsedStudentsRaw = Number(
    summary.total_students ??
    summary.totalStudents ??
    summary.students_count ??
    summary.studentsCount ??
    summary.student_count ??
    summary.students ??
    dashboard.total_students ??
    dashboard.totalStudents ??
    dashboard.students_count ??
    0
  );

  const totalStudents = parsedStudentsRaw > 0
    ? parsedStudentsRaw
    : (fallbackStudentsCount != null && fallbackStudentsCount > 0 ? fallbackStudentsCount : parsedStudentsRaw);

  const activeStudents =
    summary.active_students ??
    summary.activeStudents ??
    summary.active_students_count ??
    summary.activeStudentsCount ??
    dashboard.active_students ??
    totalStudents;

  const parsedTeachersRaw = Number(
    summary.total_teachers ??
    summary.totalTeachers ??
    summary.teachers_count ??
    summary.teachersCount ??
    summary.teacher_count ??
    summary.teachers ??
    summary.total_faculty ??
    summary.faculty_count ??
    dashboard.total_teachers ??
    dashboard.totalTeachers ??
    0
  );

  const totalTeachers = parsedTeachersRaw > 0
    ? parsedTeachersRaw
    : (fallbackTeachersCount != null && fallbackTeachersCount > 0 ? fallbackTeachersCount : parsedTeachersRaw);

  const activeTeachers =
    summary.active_teachers ??
    summary.activeTeachers ??
    dashboard.active_teachers ??
    totalTeachers;

  const parsedClassesRaw = Number(
    summary.total_classes ??
    summary.totalClasses ??
    summary.classes_count ??
    summary.classesCount ??
    summary.total_courses ??
    summary.total_programs ??
    summary.total_batches ??
    summary.total_departments ??
    summary.total_sections ??
    dashboard.total_classes ??
    dashboard.totalClasses ??
    0
  );

  const totalClasses = parsedClassesRaw > 0
    ? parsedClassesRaw
    : (fallbackClassesCount != null && fallbackClassesCount > 0 ? fallbackClassesCount : parsedClassesRaw);

  const feesCollected =
    summary.fees_collected ??
    summary.feesCollected ??
    summary.total_collected ??
    summary.paid_fees ??
    dashboard.fees_collected ??
    dashboard.feesCollected ??
    0;

  const feesPending =
    summary.fees_pending ??
    summary.feesPending ??
    summary.pending_fees ??
    summary.total_pending ??
    dashboard.fees_pending ??
    dashboard.feesPending ??
    0;

  const avgAttendance =
    summary.avg_attendance_pct ??
    summary.avgAttendancePct ??
    summary.attendance_rate ??
    summary.avg_attendance ??
    dashboard.avg_attendance_pct ??
    dashboard.avgAttendancePct ??
    null;

  const upcomingExams =
    summary.upcoming_exams ??
    summary.upcomingExams ??
    summary.exams_count ??
    dashboard.upcoming_exams ??
    dashboard.upcomingExams ??
    0;

  // Permission Checks
  const canViewFees = canDo('fees.read') || canDo('feevoucher.view') || canDo('fees.view');
  const canViewExpenses = canDo('expenses.read') || canDo('expenses.view');
  const canViewStudents = canDo('students.read') || canDo('students.view');
  const canViewAttendance = canDo('attendance.view');

  const canCollectFee = canDo('fees.create') || canDo('feevoucher.create');
  const canAddExpense = canDo('expenses.create');
  const canAddStudent = canDo('students.create');
  const canMarkAttendance = canDo('attendance.mark') || canDo('attendance.manage');

  // Build rawStats dynamically and robustly
  const rawStats = useMemo(() => {
    if (Array.isArray(dashboard.stats) && dashboard.stats.length > 0) {
      const hasStudentCard = dashboard.stats.some((s) => {
        const lbl = String(s.label || '').toLowerCase();
        return (
          lbl.includes((terms.student || 'student').toLowerCase()) ||
          lbl.includes('student') ||
          lbl.includes('candidate') ||
          lbl.includes('trainee') ||
          lbl.includes('enrollment')
        );
      });

      // Map existing stats, replacing '0' with non-zero fallback counts if available
      const mappedStats = dashboard.stats.map((stat) => {
        const lbl = String(stat.label || '').toLowerCase();
        const isStudent = lbl.includes((terms.student || 'student').toLowerCase()) || lbl.includes('student') || lbl.includes('enrollment');
        const isTeacher = lbl.includes((terms.teacher || 'teacher').toLowerCase()) || lbl.includes('teacher') || lbl.includes('faculty');
        const isClass = lbl.includes((terms.primaryUnit || 'class').toLowerCase()) || lbl.includes('class') || lbl.includes('unit');

        if (isStudent && (stat.value === '0' || stat.value === 0 || !stat.value) && totalStudents > 0) {
          return { ...stat, value: Number(totalStudents).toLocaleString() };
        }
        if (isTeacher && (stat.value === '0' || stat.value === 0 || !stat.value) && totalTeachers > 0) {
          return { ...stat, value: Number(totalTeachers).toLocaleString() };
        }
        if (isClass && (stat.value === '0' || stat.value === 0 || !stat.value) && totalClasses > 0) {
          return { ...stat, value: Number(totalClasses).toLocaleString() };
        }
        return stat;
      });

      if (!hasStudentCard) {
        return [
          {
            label: `Total ${terms.students || 'Students'}`,
            value: totalStudents != null ? Number(totalStudents).toLocaleString() : '0',
            icon: 'Users',
            variant: 'indigo',
            description: activeStudents != null ? `${activeStudents} active` : undefined,
            trend: summary.students_trend ?? summary.studentsTrend ?? undefined,
          },
          ...mappedStats,
        ];
      }
      return mappedStats;
    }

    const cards = [];

    // 1. Total Students
    cards.push({
      label: `Total ${terms.students || 'Students'}`,
      value: totalStudents != null ? Number(totalStudents).toLocaleString() : '0',
      icon: 'Users',
      variant: 'indigo',
      description: activeStudents != null ? `${activeStudents} active` : undefined,
      trend: summary.students_trend ?? summary.studentsTrend ?? undefined,
    });

    // 2. Total Teachers
    cards.push({
      label: `Total ${terms.teachers || 'Teachers'}`,
      value: totalTeachers != null ? Number(totalTeachers).toLocaleString() : '0',
      icon: 'GraduationCap',
      variant: 'violet',
      description: activeTeachers != null ? `${activeTeachers} active` : undefined,
      trend: summary.teachers_trend ?? summary.teachersTrend ?? undefined,
    });

    // 3. Classes / Academic Units
    cards.push({
      label: `Total ${terms.primaryUnitPlural || 'Classes'}`,
      value: totalClasses != null ? Number(totalClasses).toLocaleString() : '0',
      icon: 'BookOpen',
      variant: 'emerald',
      description: 'Across all levels',
    });

    // 4. Fees Collected
    if (canViewFees || feesCollected > 0) {
      cards.push({
        label: 'Fees Collected',
        value: formatCurrency(feesCollected),
        icon: 'DollarSign',
        variant: 'emerald',
        description: 'Total collection',
        trend: summary.fees_trend ?? summary.feesTrend ?? undefined,
      });
    }

    // 5. Fees Pending
    if (canViewFees && feesPending > 0) {
      cards.push({
        label: 'Fees Pending',
        value: formatCurrency(feesPending),
        icon: 'DollarSign',
        variant: 'amber',
        description: 'Outstanding balance',
      });
    }

    // 6. Avg Attendance
    if (avgAttendance != null) {
      cards.push({
        label: 'Avg. Attendance',
        value: `${avgAttendance}%`,
        icon: 'ClipboardCheck',
        variant: 'cyan',
        description: 'Monthly average',
      });
    }

    // 7. Upcoming Exams
    if (upcomingExams > 0) {
      cards.push({
        label: 'Upcoming Exams',
        value: upcomingExams,
        icon: 'Calendar',
        variant: 'rose',
        description: 'Scheduled',
      });
    }

    return cards;
  }, [
    dashboard.stats,
    terms,
    totalStudents,
    activeStudents,
    totalTeachers,
    activeTeachers,
    totalClasses,
    feesCollected,
    feesPending,
    avgAttendance,
    upcomingExams,
    summary,
    canViewFees,
  ]);

  // Filter Stats based on permissions
  const stats = useMemo(() => {
    return rawStats.filter((stat) => {
      const label = String(stat.label || '').toLowerCase();
      if (label.includes('fee') || label.includes('collected')) return canViewFees;
      if (label.includes('expense')) return canViewExpenses;
      if (label.includes('student') || label.includes('enrollment') || label.includes((terms.student || '').toLowerCase())) return canViewStudents;
      if (label.includes('attendance')) return canViewAttendance;
      if (label.includes('leave')) return canDo('leaves.view');
      return true; // Show others
    });
  }, [rawStats, canViewFees, canViewExpenses, canViewStudents, canViewAttendance, canDo, terms.student]);

  const quickActions = useMemo(() => {
    const actions = [];
    if (canAddStudent) actions.push({ href: `/${type}/students`, label: `Add ${terms.student}`, icon: <Plus size={14} /> });
    if (canMarkAttendance) actions.push({ href: `/${type}/attendance`, label: 'Mark Attendance', icon: <ClipboardCheck size={14} /> });
    if (canCollectFee) actions.push({ href: `/${type}/fees`, label: 'Collect Fee', icon: <DollarSign size={14} /> });
    if (canAddExpense) actions.push({ href: `/${type}/expense`, label: 'Add Expense', icon: <ArrowUpRight size={14} /> });

    if (type === 'school' && canDo('timetable.view')) {
      actions.push({ href: `/${type}/timetable`, label: 'Timetable', icon: <Calendar size={14} /> });
    }

    return actions;
  }, [type, terms.student, canAddStudent, canMarkAttendance, canCollectFee, canAddExpense, canDo]);

  if (isLoading || !user) {
    return <DashboardSkeleton terms={terms} />;
  }

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
                Welcome back, <span className="text-indigo-600">@{user?.first_name + ' ' + (user?.last_name || '') || 'Administrator'}</span>
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
        {stats.slice(0, 8).map((stat) => {
          const iconNode = stat.icon && typeof stat.icon === 'object' && stat.icon.$$typeof
            ? stat.icon
            : ICON_MAP[stat.icon]?.icon || <Users size={20} />;
          const variant = stat.variant || ICON_MAP[stat.icon]?.variant || 'default';

          return (
            <StatsCard
              key={stat.label}
              label={stat.label}
              value={stat.value}
              icon={iconNode}
              variant={variant}
              trend={stat.trend ?? undefined}
              description={stat.description}
              loading={isLoading && fallbackStudentsCount == null}
            />
          );
        })}
      </div>

      {/* FINANCIAL & ACTION BAR */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Charts: Financial Performance */}
        <div className="lg:col-span-8 space-y-6">
          {(canViewFees || canViewExpenses) && (
            <ChartCard
              title="Financial Performance"
              subtitle="Monthly Income vs Expenses"
              loading={isLoading}
            >
              <FinancialChart data={charts.incomeExpense || []} />
            </ChartCard>
          )}

          {canViewFees && (
            <ChartCard title="Fee Collection Status" loading={isLoading}>
              <FeesChart data={charts.fees || []} />
            </ChartCard>
          )}

          {canViewAttendance && (
            <ChartCard title="Attendance Trends (last 6 months)" loading={isLoading}>
              <AttendanceChart data={charts.attendance || []} />
            </ChartCard>
          )}
        </div>

        {/* Right Sidebar: Actions & Activity */}
        <div className="lg:col-span-4 space-y-6">
          {quickActions.length > 0 && (
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
          )}

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
        {canViewStudents && (
          <div className="xl:col-span-2">
            <ChartCard title={`${terms.students} Enrollment Snapshot`} loading={isLoading}>
              <EnrollmentChart data={charts.enrollment || []} />
            </ChartCard>
          </div>
        )}
        <div className="grid grid-cols-1 gap-6">
          {canViewStudents && (
            <ChartCard title="Gender Distribution" loading={isLoading}>
              <DonutChart data={charts.gender || []} />
            </ChartCard>
          )}
          {canViewFees && (
            <ChartCard title="Fee Payment Health" loading={isLoading}>
              <DonutChart data={charts.feeStatus || []} />
            </ChartCard>
          )}
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

export function DashboardSkeleton({ terms = {} }) {
  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Top Header Skeleton */}
      <div className="flex flex-col md:flex-row items-start justify-between gap-6">
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <Skeleton className="h-10 w-10 rounded-2xl bg-indigo-100 dark:bg-indigo-950/40" />
            <div className="space-y-1.5">
              <Skeleton className="h-8 w-56 rounded-xl" />
              <Skeleton className="h-4 w-72 rounded-lg" />
            </div>
          </div>
          <Skeleton className="h-6 w-36 rounded-full mt-2" />
        </div>
        <div className="flex items-center gap-3">
          <Skeleton className="h-9 w-40 rounded-xl" />
          <Skeleton className="h-9 w-24 rounded-xl" />
        </div>
      </div>

      {/* Stats Cards Grid Skeleton */}
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="p-5 rounded-2xl border border-slate-200/80 bg-white dark:bg-slate-900 shadow-sm space-y-3"
          >
            <div className="flex items-center justify-between">
              <Skeleton className="h-4 w-28 rounded-md" />
              <Skeleton className="h-9 w-9 rounded-xl" />
            </div>
            <Skeleton className="h-8 w-24 rounded-lg" />
            <Skeleton className="h-3.5 w-36 rounded-md" />
          </div>
        ))}
      </div>

      {/* Main Charts & Sidebar Skeleton Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-8 space-y-6">
          <div className="p-6 rounded-2xl border border-slate-200/80 bg-white dark:bg-slate-900 shadow-sm space-y-4">
            <div className="space-y-1.5">
              <Skeleton className="h-5 w-48 rounded-md" />
              <Skeleton className="h-3.5 w-56 rounded-md" />
            </div>
            <Skeleton className="h-[280px] w-full rounded-2xl" />
          </div>
          <div className="p-6 rounded-2xl border border-slate-200/80 bg-white dark:bg-slate-900 shadow-sm space-y-4">
            <Skeleton className="h-5 w-40 rounded-md" />
            <Skeleton className="h-[240px] w-full rounded-2xl" />
          </div>
        </div>

        <div className="lg:col-span-4 space-y-6">
          <div className="p-5 rounded-2xl border border-slate-200/80 bg-white dark:bg-slate-900 shadow-sm space-y-4">
            <Skeleton className="h-5 w-36 rounded-md" />
            <div className="space-y-3">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="flex items-center gap-3">
                  <Skeleton className="h-9 w-9 rounded-xl shrink-0" />
                  <div className="flex-1 space-y-1.5">
                    <Skeleton className="h-3.5 w-full rounded-md" />
                    <Skeleton className="h-2.5 w-2/3 rounded-md" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
