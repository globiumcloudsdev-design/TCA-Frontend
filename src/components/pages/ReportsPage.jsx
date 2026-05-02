'use client';
/**
 * ReportsPage — Report cards with navigation to detail view
 * Click on any report to view data with filters and export
 */
import { useState, useEffect } from 'react';
import { BarChart3, Download, FileText, Users, DollarSign, CheckSquare, GraduationCap, Clock, FlaskConical, BookMarked, TrendingUp, UserCheck, Layers, AlertCircle, ChevronRight } from 'lucide-react';
import { useRouter } from 'next/navigation';
import useInstituteConfig from '@/hooks/useInstituteConfig';
import useAuthStore from '@/store/authStore';
import { toast } from 'sonner';

// ─── Report definitions per institute type ────────────────────────────────────
const REPORTS_BY_TYPE = {
  school: [
    { key: 'student',     icon: Users,          label: 'Student List',        description: 'Full student roster with contact details',     color: 'text-blue-500',    bg: 'bg-blue-50',      permission: 'reports.student' },
    { key: 'attendance',  icon: CheckSquare,    label: 'Attendance Report',   description: 'Class-wise daily & monthly attendance',         color: 'text-emerald-500', bg: 'bg-emerald-50',   permission: 'reports.attendance' },
    { key: 'exam',        icon: GraduationCap,  label: 'Exam Results',        description: 'Class-wise exam performance report',            color: 'text-violet-500',  bg: 'bg-violet-50',    permission: 'reports.exam' },
    { key: 'fee',         icon: DollarSign,     label: 'Fee Collection',      description: 'Fee payments, dues & outstanding amounts',      color: 'text-amber-500',   bg: 'bg-amber-50',     permission: 'reports.fee' },
    { key: 'payroll',     icon: Clock,          label: 'Payroll Report',      description: 'Staff salary disbursement report',              color: 'text-pink-500',    bg: 'bg-pink-50',      permission: 'reports.payroll' },
  ],
  coaching: [
    { key: 'student',     icon: Users,          label: 'Candidate List',      description: 'All enrolled candidates with contact info',     color: 'text-blue-500',    bg: 'bg-blue-50',      permission: 'reports.student' },
    { key: 'attendance',  icon: CheckSquare,    label: 'Session Attendance',  description: 'Batch-wise session attendance summary',         color: 'text-emerald-500', bg: 'bg-emerald-50',   permission: 'reports.attendance' },
    { key: 'exam',        icon: GraduationCap,  label: 'Mock Test Results',   description: 'Candidate-wise mock test performance',          color: 'text-violet-500',  bg: 'bg-violet-50',    permission: 'reports.exam' },
    { key: 'fee',         icon: DollarSign,     label: 'Fee Collection',      description: 'Course fee payments & outstanding dues',        color: 'text-amber-500',   bg: 'bg-amber-50',     permission: 'reports.fee' },
  ],
  academy: [
    { key: 'student',     icon: Users,          label: 'Trainee List',        description: 'All enrolled trainees with program details',    color: 'text-blue-500',    bg: 'bg-blue-50',      permission: 'reports.student' },
    { key: 'attendance',  icon: CheckSquare,    label: 'Module Attendance',   description: 'Module-wise attendance tracker',                color: 'text-emerald-500', bg: 'bg-emerald-50',   permission: 'reports.attendance' },
    { key: 'exam',        icon: GraduationCap,  label: 'Assessment Results',  description: 'Trainee assessment scores by module',           color: 'text-violet-500',  bg: 'bg-violet-50',    permission: 'reports.exam' },
    { key: 'fee',         icon: DollarSign,     label: 'Fee Collection',      description: 'Program fee payments & due amounts',            color: 'text-amber-500',   bg: 'bg-amber-50',     permission: 'reports.fee' },
  ],
  college: [
    { key: 'student',     icon: Users,          label: 'Student List',        description: 'Department-wise student roster',                color: 'text-blue-500',    bg: 'bg-blue-50',      permission: 'reports.student' },
    { key: 'attendance',  icon: CheckSquare,    label: 'Attendance Report',   description: 'Subject-wise attendance (75% rule)',            color: 'text-emerald-500', bg: 'bg-emerald-50',   permission: 'reports.attendance' },
    { key: 'exam',        icon: GraduationCap,  label: 'Semester Results',    description: 'Semester-wise GPA/CGPA report',                 color: 'text-violet-500',  bg: 'bg-violet-50',    permission: 'reports.exam' },
    { key: 'fee',         icon: DollarSign,     label: 'Fee Collection',      description: 'Semester fee payments & outstanding dues',       color: 'text-amber-500',   bg: 'bg-amber-50',     permission: 'reports.fee' },
  ],
  university: [
    { key: 'student',     icon: Users,          label: 'Student List',        description: 'Faculty & department-wise student roster',      color: 'text-blue-500',    bg: 'bg-blue-50',      permission: 'reports.student' },
    { key: 'attendance',  icon: CheckSquare,    label: 'Attendance Report',   description: 'Course-wise attendance summary',                color: 'text-emerald-500', bg: 'bg-emerald-50',   permission: 'reports.attendance' },
    { key: 'exam',        icon: GraduationCap,  label: 'Semester Results',    description: 'Semester-wise GPA/CGPA and credit report',      color: 'text-violet-500',  bg: 'bg-violet-50',    permission: 'reports.exam' },
    { key: 'fee',         icon: DollarSign,     label: 'Fee Collection',      description: 'Semester fee, hostel & research fee dues',      color: 'text-amber-500',   bg: 'bg-amber-50',     permission: 'reports.fee' },
  ],
};

const DEFAULT_REPORTS = REPORTS_BY_TYPE.school;

export default function ReportsPage({ type }) {
  const router = useRouter();
  const canDo = useAuthStore((s) => s.canDo);
  const reportCards = REPORTS_BY_TYPE[type] ?? DEFAULT_REPORTS;
  const [hasHydrated, setHasHydrated] = useState(false);
  useEffect(() => {
    setHydrated();
    setHasHydrated(true);
  }, []);

  const setHydrated = () => {
    // Utility to mark hydration done
  }

  // Filter reports based on user permissions
  const accessibleReports = reportCards.filter(
    (report) => canDo(report.permission)
  );

  /**
   * Navigate to report detail page with filters
   */
  const openReport = (reportKey, permission) => {
    if (!canDo(permission)) {
      toast.error('You do not have permission to access this report');
      return;
    }
    router.push(`/${type}/reports/view?report=${reportKey}`);
  };

  // Permission check
  const hasAnyReportPermission = accessibleReports.length > 0;

  if (!hasHydrated) return null;


  if (!hasAnyReportPermission) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 py-20 text-center">
        <AlertCircle className="h-12 w-12 text-muted-foreground" />
        <div>
          <h2 className="text-lg font-semibold">Access Denied</h2>
          <p className="text-sm text-muted-foreground mt-1">
            You don't have permission to access any reports. Contact your administrator.
          </p>
        </div>
      </div>
    );
  }

  const headings = {
    school:     { title: 'School Reports',      sub: 'View and download reports with advanced filters' },
    coaching:   { title: 'Coaching Reports',    sub: 'View and download reports with advanced filters' },
    academy:    { title: 'Academy Reports',     sub: 'View and download reports with advanced filters' },
    college:    { title: 'College Reports',     sub: 'View and download reports with advanced filters' },
    university: { title: 'University Reports',  sub: 'View and download reports with advanced filters' },
  };
  const { title, sub } = headings[type] ?? headings.school;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-xl font-bold">{title}</h1>
        <p className="text-sm text-muted-foreground">{sub}</p>
        {accessibleReports.length < reportCards.length && (
          <p className="text-xs text-amber-600 mt-2">
            ℹ️ {reportCards.length - accessibleReports.length} report(s) are restricted based on your permissions
          </p>
        )}
      </div>

      {/* Report Cards Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {reportCards.map(({ key, icon: Icon, label, description, color, bg, permission }) => {
          const hasPermission = canDo(permission);
          
          return (
            <button
              key={key}
              onClick={() => openReport(key, permission)}
              disabled={!hasPermission}
              className={`flex flex-col gap-3 rounded-lg border bg-card p-5 text-left shadow-sm transition-all ${
                hasPermission 
                  ? 'hover:shadow-md hover:border-primary/50 cursor-pointer' 
                  : 'opacity-50 bg-muted cursor-not-allowed'
              }`}
            >
              {/* Icon */}
              <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${bg}`}>
                <Icon className={`${color}`} size={20} />
              </div>

              {/* Content */}
              <div className="flex-1">
                <h3 className="font-semibold">{label}</h3>
                <p className="mt-0.5 text-xs text-muted-foreground">{description}</p>
              </div>

              {/* Footer */}
              {hasPermission ? (
                <div className="flex items-center justify-between pt-2 border-t">
                  <span className="text-xs font-medium text-primary">View Report</span>
                  <ChevronRight size={16} className="text-primary" />
                </div>
              ) : (
                <div className="text-xs text-muted-foreground">Permission required</div>
              )}
            </button>
          );
        })}
      </div>

      {/* Info Box */}
      <div className="rounded-lg border bg-card p-4 text-sm text-muted-foreground">
        <p className="font-semibold mb-2">💡 How to use reports:</p>
        <ul className="space-y-1 text-xs ml-2">
          <li>• Click on any report card to view detailed data</li>
          <li>• Use filters (Date, Class, Status) to refine your search</li>
          <li>• View data in the interactive table with sorting & pagination</li>
          <li>• Click "Export as Excel" to download the filtered data</li>
        </ul>
      </div>
    </div>
  );
}
