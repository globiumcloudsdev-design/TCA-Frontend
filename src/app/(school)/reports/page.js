'use client';

import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Download, FileText, Users, DollarSign, CalendarCheck, BookOpen, TrendingUp } from 'lucide-react';
import { toast } from 'sonner';

import { reportService } from '@/services';
import useAuthStore from '@/store/authStore';
import { PERMISSIONS, MONTHS } from '@/constants';
import { formatCurrency } from '@/lib/utils';
import { PageHeader, StatsCard } from '@/components/common';
import { Button } from '@/components/ui/button';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';

const REPORT_TABS = [
  { id: 'student',    label: 'Students',    icon: Users,         permission: 'REPORT_STUDENT'    },
  { id: 'fee',        label: 'Fees',        icon: DollarSign,    permission: 'REPORT_FEE'        },
  { id: 'attendance', label: 'Attendance',  icon: CalendarCheck, permission: 'REPORT_ATTENDANCE' },
  { id: 'salary',     label: 'Salary',      icon: TrendingUp,    permission: 'REPORT_SALARY'     },
  { id: 'exam',       label: 'Exams',       icon: BookOpen,      permission: 'REPORT_STUDENT'    },
];

const SERVICE_MAP = {
  student:    reportService.getStudentReport,
  fee:        reportService.getFeeReport,
  attendance: reportService.getAttendanceReport,
  salary:     reportService.getSalaryReport,
  exam:       reportService.getExamReport,
};

export default function ReportsPage() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => { setMounted(true); }, []);

  const [activeTab, setActiveTab] = useState('student');
  const [exporting, setExporting] = useState(false);
  const [filters,   setFilters]   = useState({
    month: new Date().getMonth() + 1,
    year:  new Date().getFullYear(),
  });

  const { data, isLoading } = useQuery({
    queryKey: ['report', activeTab, filters],
    queryFn:  () => SERVICE_MAP[activeTab]?.(filters),
  });

  const report = data?.data ?? {};

  const handleExport = async (format) => {
    setExporting(true);
    try {
      await reportService.exportReport({ type: activeTab, format, ...filters });
      toast.success(`Exporting ${format.toUpperCase()}…`);
    } catch {
      toast.error('Export failed');
    } finally {
      setExporting(false);
    }
  };

  if (!mounted) return null;

  return (
    <div className="space-y-4">
      <PageHeader
        title="Reports & Export"
        description="School-wide analytics and downloadable reports"
        action={
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={() => handleExport('pdf')} disabled={exporting}>
              <Download className="w-4 h-4 mr-1.5" /> PDF
            </Button>
            <Button variant="outline" size="sm" onClick={() => handleExport('excel')} disabled={exporting}>
              <Download className="w-4 h-4 mr-1.5" /> Excel
            </Button>
          </div>
        }
      />

      {/* Report type tabs */}
      <div className="flex gap-1 border-b flex-wrap">
        {REPORT_TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-1.5 px-4 py-2.5 text-sm font-medium transition-colors border-b-2 -mb-px ${
              activeTab === tab.id
                ? 'border-primary text-primary'
                : 'border-transparent text-muted-foreground hover:text-foreground'
            }`}
          >
            <tab.icon className="w-3.5 h-3.5" />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 items-center">
        <Select
          value={String(filters.month)}
          onValueChange={(v) => setFilters((p) => ({ ...p, month: Number(v) }))}
        >
          <SelectTrigger className="w-[160px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {(MONTHS ?? []).map(({ value, label }) => (
              <SelectItem key={value} value={String(value)}>{label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Input
          type="number"
          className="w-24"
          value={filters.year}
          onChange={(e) => setFilters((p) => ({ ...p, year: Number(e.target.value) }))}
          min="2020" max="2099"
        />
      </div>

      {isLoading && <p className="text-sm text-muted-foreground py-8 text-center">Loading report…</p>}

      {!isLoading && (
        <>
          {/* ── Student Report ── */}
          {activeTab === 'student' && (
            <StudentReportView data={report} />
          )}

          {/* ── Fee Report ── */}
          {activeTab === 'fee' && (
            <FeeReportView data={report} />
          )}

          {/* ── Attendance Report ── */}
          {activeTab === 'attendance' && (
            <AttendanceReportView data={report} />
          )}

          {/* ── Salary Report ── */}
          {activeTab === 'salary' && (
            <SalaryReportView data={report} />
          )}

          {/* ── Exam Report ── */}
          {activeTab === 'exam' && (
            <ExamReportView data={report} />
          )}
        </>
      )}
    </div>
  );
}

/* ─── Student Report View ─────────────────────────────────────── */
function StudentReportView({ data }) {
  const stats = [
    { label: 'Total Students', value: data.total_students ?? 0,   icon: <Users size={18} /> },
    { label: 'Active',         value: data.active_students ?? 0,  icon: <Users size={18} /> },
    { label: 'New This Month', value: data.new_admissions ?? 0,   icon: <FileText size={18} /> },
    { label: 'Avg Attendance', value: `${data.avg_attendance ?? 0}%`, icon: <CalendarCheck size={18} /> },
  ];
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((s) => (
          <StatsCard key={s.label} label={s.label} value={String(s.value)} icon={s.icon} />
        ))}
      </div>
      {data.by_class && data.by_class.length > 0 && (
        <div className="rounded-lg border overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-muted/50 border-b">
              <tr>
                <th className="px-4 py-3 text-left font-medium">Class</th>
                <th className="px-4 py-3 text-center font-medium">Total</th>
                <th className="px-4 py-3 text-center font-medium">Male</th>
                <th className="px-4 py-3 text-center font-medium">Female</th>
              </tr>
            </thead>
            <tbody>
              {data.by_class.map((row) => (
                <tr key={row.class_id ?? row.class} className="border-b last:border-0 hover:bg-muted/20">
                  <td className="px-4 py-3 font-medium">{row.class ?? '—'}</td>
                  <td className="px-4 py-3 text-center">{row.total ?? 0}</td>
                  <td className="px-4 py-3 text-center text-blue-600">{row.male ?? 0}</td>
                  <td className="px-4 py-3 text-center text-pink-600">{row.female ?? 0}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

/* ─── Fee Report View ─────────────────────────────────────────── */
function FeeReportView({ data }) {
  const stats = [
    { title: 'Total Billed',    value: formatCurrency(data.total_billed    ?? 0) },
    { title: 'Total Collected', value: formatCurrency(data.total_collected ?? 0) },
    { title: 'Pending',         value: formatCurrency(data.total_pending   ?? 0) },
    { title: 'Overdue',         value: formatCurrency(data.total_overdue   ?? 0) },
  ];
  const pct = data.total_billed > 0 ? Math.round((data.total_collected / data.total_billed) * 100) : 0;
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((s) => (
          <div key={s.title} className="rounded-xl border bg-card p-4 shadow-sm">
            <p className="text-xs text-muted-foreground">{s.title}</p>
            <p className="text-xl font-bold mt-1">{s.value}</p>
          </div>
        ))}
      </div>
      <div className="rounded-xl border bg-card p-4 shadow-sm space-y-2">
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">Collection Rate</span>
          <span className="font-semibold">{pct}%</span>
        </div>
        <div className="h-2 rounded-full bg-muted overflow-hidden">
          <div
            className={`h-full rounded-full transition-all ${pct >= 80 ? 'bg-green-500' : pct >= 50 ? 'bg-yellow-500' : 'bg-red-500'}`}
            style={{ width: `${pct}%` }}
          />
        </div>
      </div>
    </div>
  );
}

/* ─── Attendance Report View ──────────────────────────────────── */
function AttendanceReportView({ data }) {
  const stats = [
    { title: 'Total Days',    value: data.total_days    ?? 0 },
    { title: 'Avg Present %', value: `${data.avg_present_pct ?? 0}%` },
    { title: 'Total Absent',  value: data.total_absent  ?? 0 },
    { title: 'Total Late',    value: data.total_late    ?? 0 },
  ];
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((s) => (
          <div key={s.title} className="rounded-xl border bg-card p-4 shadow-sm">
            <p className="text-xs text-muted-foreground">{s.title}</p>
            <p className="text-xl font-bold mt-1">{s.value}</p>
          </div>
        ))}
      </div>
      {data.by_class && data.by_class.length > 0 && (
        <div className="rounded-lg border overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-muted/50 border-b">
              <tr>
                <th className="px-4 py-3 text-left font-medium">Class</th>
                <th className="px-4 py-3 text-center font-medium text-green-600">Present</th>
                <th className="px-4 py-3 text-center font-medium text-red-600">Absent</th>
                <th className="px-4 py-3 text-center font-medium text-yellow-600">Late</th>
                <th className="px-4 py-3 text-center font-medium">%</th>
              </tr>
            </thead>
            <tbody>
              {data.by_class.map((row) => (
                <tr key={row.class_id ?? row.class} className="border-b last:border-0 hover:bg-muted/20">
                  <td className="px-4 py-3 font-medium">{row.class ?? '—'}</td>
                  <td className="px-4 py-3 text-center text-green-600">{row.present ?? 0}</td>
                  <td className="px-4 py-3 text-center text-red-600">{row.absent ?? 0}</td>
                  <td className="px-4 py-3 text-center text-yellow-600">{row.late ?? 0}</td>
                  <td className="px-4 py-3 text-center font-semibold">{row.pct ?? 0}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

/* ─── Salary Report View ──────────────────────────────────────── */
function SalaryReportView({ data }) {
  const stats = [
    { title: 'Total Payroll',  value: formatCurrency(data.total_payroll  ?? 0) },
    { title: 'Paid',           value: formatCurrency(data.total_paid     ?? 0) },
    { title: 'Pending',        value: formatCurrency(data.total_pending  ?? 0) },
    { title: 'Total Staff',    value: data.total_staff ?? 0 },
  ];
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((s) => (
          <div key={s.title} className="rounded-xl border bg-card p-4 shadow-sm">
            <p className="text-xs text-muted-foreground">{s.title}</p>
            <p className="text-xl font-bold mt-1">{s.value}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ─── Exam Report View ────────────────────────────────────────── */
function ExamReportView({ data }) {
  const stats = [
    { title: 'Total Exams', value: data.total_exams    ?? 0 },
    { title: 'Avg Score',   value: `${data.avg_score   ?? 0}%` },
    { title: 'Pass Rate',   value: `${data.pass_rate   ?? 0}%` },
    { title: 'Fail Rate',   value: `${data.fail_rate   ?? 0}%` },
  ];
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((s) => (
          <div key={s.title} className="rounded-xl border bg-card p-4 shadow-sm">
            <p className="text-xs text-muted-foreground">{s.title}</p>
            <p className="text-xl font-bold mt-1">{s.value}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
