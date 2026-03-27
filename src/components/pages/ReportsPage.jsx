'use client';
/**
 * ReportsPage — Report cards / downloads for all institute types
 * Each type has its own tailored report list
 */
import { useState } from 'react';
import { BarChart3, Download, FileText, Users, DollarSign, CheckSquare, GraduationCap, Clock, FlaskConical, BookMarked, TrendingUp, UserCheck, Layers } from 'lucide-react';
import useInstituteConfig from '@/hooks/useInstituteConfig';
import useAuthStore from '@/store/authStore';
import { toast } from 'sonner';

// ─── Report definitions per institute type ────────────────────────────────────
const REPORTS_BY_TYPE = {
  school: [
    { key: 'student_list',     icon: Users,          label: 'Student List',        description: 'Full student roster with contact details',     color: 'text-blue-500',    bg: 'bg-blue-50' },
    { key: 'attendance',       icon: CheckSquare,    label: 'Attendance Report',   description: 'Class-wise daily & monthly attendance',         color: 'text-emerald-500', bg: 'bg-emerald-50' },
    { key: 'exam_result',      icon: GraduationCap,  label: 'Exam Results',        description: 'Class-wise exam performance report',            color: 'text-violet-500',  bg: 'bg-violet-50' },
    { key: 'fee_collection',   icon: DollarSign,     label: 'Fee Collection',      description: 'Fee payments, dues & outstanding amounts',      color: 'text-amber-500',   bg: 'bg-amber-50' },
    { key: 'payroll',          icon: Clock,          label: 'Payroll Report',      description: 'Staff salary disbursement report',              color: 'text-pink-500',    bg: 'bg-pink-50' },
    { key: 'teacher_list',     icon: FileText,       label: 'Staff Directory',     description: 'Full staff and teacher directory',              color: 'text-cyan-500',    bg: 'bg-cyan-50' },
    { key: 'admission',        icon: UserCheck,      label: 'Admission Report',    description: 'New admissions & session-wise enrollment',      color: 'text-orange-500',  bg: 'bg-orange-50' },
    { key: 'academic_summary', icon: BarChart3,      label: 'Academic Summary',    description: 'Overall academic performance overview',         color: 'text-indigo-500',  bg: 'bg-indigo-50' },
  ],
  coaching: [
    { key: 'candidate_list',   icon: Users,          label: 'Candidate List',      description: 'All enrolled candidates with contact info',     color: 'text-blue-500',    bg: 'bg-blue-50' },
    { key: 'attendance',       icon: CheckSquare,    label: 'Session Attendance',  description: 'Batch-wise session attendance summary',         color: 'text-emerald-500', bg: 'bg-emerald-50' },
    { key: 'mock_test',        icon: GraduationCap,  label: 'Mock Test Results',   description: 'Candidate-wise mock test performance',          color: 'text-violet-500',  bg: 'bg-violet-50' },
    { key: 'fee_collection',   icon: DollarSign,     label: 'Fee Collection',      description: 'Course fee payments & outstanding dues',        color: 'text-amber-500',   bg: 'bg-amber-50' },
    { key: 'batch_progress',   icon: TrendingUp,     label: 'Batch Progress',      description: 'Progress report per batch & course',            color: 'text-teal-500',    bg: 'bg-teal-50' },
    { key: 'payroll',          icon: Clock,          label: 'Instructor Payroll',  description: 'Instructor salary disbursement report',         color: 'text-pink-500',    bg: 'bg-pink-50' },
    { key: 'enrollment',       icon: UserCheck,      label: 'Enrollment Report',   description: 'New enrollments & batch-wise statistics',       color: 'text-orange-500',  bg: 'bg-orange-50' },
    { key: 'performance_summary', icon: BarChart3,   label: 'Performance Summary', description: 'Overall batch and program performance',         color: 'text-indigo-500',  bg: 'bg-indigo-50' },
  ],
  academy: [
    { key: 'trainee_list',     icon: Users,          label: 'Trainee List',        description: 'All enrolled trainees with program details',    color: 'text-blue-500',    bg: 'bg-blue-50' },
    { key: 'attendance',       icon: CheckSquare,    label: 'Module Attendance',   description: 'Module-wise attendance tracker',                color: 'text-emerald-500', bg: 'bg-emerald-50' },
    { key: 'assessment',       icon: GraduationCap,  label: 'Assessment Results',  description: 'Trainee assessment scores by module',           color: 'text-violet-500',  bg: 'bg-violet-50' },
    { key: 'fee_collection',   icon: DollarSign,     label: 'Fee Collection',      description: 'Program fee payments & due amounts',            color: 'text-amber-500',   bg: 'bg-amber-50' },
    { key: 'certificate',      icon: BookMarked,     label: 'Certificates Issued', description: 'Completion certificate issuance report',        color: 'text-teal-500',    bg: 'bg-teal-50' },
    { key: 'payroll',          icon: Clock,          label: 'Trainer Payroll',     description: 'Trainer salary disbursement report',            color: 'text-pink-500',    bg: 'bg-pink-50' },
    { key: 'enrollment',       icon: UserCheck,      label: 'Enrollment Report',   description: 'New enrollments & program statistics',          color: 'text-orange-500',  bg: 'bg-orange-50' },
    { key: 'skill_summary',    icon: BarChart3,      label: 'Skills Summary',      description: 'Overall skill completion & proficiency stats',  color: 'text-indigo-500',  bg: 'bg-indigo-50' },
  ],
  college: [
    { key: 'student_list',     icon: Users,          label: 'Student List',        description: 'Department-wise student roster',                color: 'text-blue-500',    bg: 'bg-blue-50' },
    { key: 'attendance',       icon: CheckSquare,    label: 'Attendance Report',   description: 'Subject-wise attendance (75% rule)',            color: 'text-emerald-500', bg: 'bg-emerald-50' },
    { key: 'exam_result',      icon: GraduationCap,  label: 'Semester Results',    description: 'Semester-wise GPA/CGPA report',                 color: 'text-violet-500',  bg: 'bg-violet-50' },
    { key: 'fee_collection',   icon: DollarSign,     label: 'Fee Collection',      description: 'Semester fee payments & outstanding dues',       color: 'text-amber-500',   bg: 'bg-amber-50' },
    { key: 'payroll',          icon: Clock,          label: 'Payroll Report',      description: 'Faculty salary disbursement report',            color: 'text-pink-500',    bg: 'bg-pink-50' },
    { key: 'teacher_list',     icon: FileText,       label: 'Faculty Directory',   description: 'Full faculty and staff directory',              color: 'text-cyan-500',    bg: 'bg-cyan-50' },
    { key: 'admission',        icon: UserCheck,      label: 'Admission Report',    description: 'New admissions & program-wise enrollment',      color: 'text-orange-500',  bg: 'bg-orange-50' },
    { key: 'academic_summary', icon: BarChart3,      label: 'Academic Summary',    description: 'Program-wise academic performance overview',    color: 'text-indigo-500',  bg: 'bg-indigo-50' },
  ],
  university: [
    { key: 'student_list',     icon: Users,          label: 'Student List',        description: 'Faculty & department-wise student roster',      color: 'text-blue-500',    bg: 'bg-blue-50' },
    { key: 'attendance',       icon: CheckSquare,    label: 'Attendance Report',   description: 'Course-wise attendance summary',                color: 'text-emerald-500', bg: 'bg-emerald-50' },
    { key: 'exam_result',      icon: GraduationCap,  label: 'Semester Results',    description: 'Semester-wise GPA/CGPA and credit report',      color: 'text-violet-500',  bg: 'bg-violet-50' },
    { key: 'fee_collection',   icon: DollarSign,     label: 'Fee Collection',      description: 'Semester fee, hostel & research fee dues',      color: 'text-amber-500',   bg: 'bg-amber-50' },
    { key: 'research',         icon: FlaskConical,   label: 'Research Report',     description: 'Active research projects & publication stats', color: 'text-teal-500',    bg: 'bg-teal-50' },
    { key: 'payroll',          icon: Clock,          label: 'Payroll Report',      description: 'Faculty & staff salary disbursement',           color: 'text-pink-500',    bg: 'bg-pink-50' },
    { key: 'admission',        icon: UserCheck,      label: 'Admission Report',    description: 'Graduate & postgraduate enrollment stats',      color: 'text-orange-500',  bg: 'bg-orange-50' },
    { key: 'academic_summary', icon: BarChart3,      label: 'Academic Summary',    description: 'Faculty-wise academic performance overview',    color: 'text-indigo-500',  bg: 'bg-indigo-50' },
  ],
};

// fallback
const DEFAULT_REPORTS = REPORTS_BY_TYPE.school;

export default function ReportsPage({ type }) {
  const canDo = useAuthStore((s) => s.canDo);
  const { terms } = useInstituteConfig();
  const [loading, setLoading] = useState(null);

  const reportCards = REPORTS_BY_TYPE[type] ?? DEFAULT_REPORTS;

  const download = async (key) => {
    setLoading(key);
    try {
      const { reportService } = await import('@/services');
      await reportService.download(key);
      toast.success('Report downloaded!');
    } catch {
      toast.info('Report generation coming soon!');
    } finally {
      setLoading(null);
    }
  };

  if (!canDo('report.view')) return <div className="py-20 text-center text-muted-foreground">You don't have permission to view reports.</div>;

  // Heading labels per type
  const headings = {
    school:     { title: 'School Reports',      sub: 'Download class, fee, attendance & exam reports' },
    coaching:   { title: 'Coaching Reports',    sub: 'Download batch, candidate & mock test reports' },
    academy:    { title: 'Academy Reports',     sub: 'Download trainee, program & skills reports' },
    college:    { title: 'College Reports',     sub: 'Download department, semester & faculty reports' },
    university: { title: 'University Reports',  sub: 'Download faculty, research & academic reports' },
  };
  const { title, sub } = headings[type] ?? headings.school;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold">{title}</h1>
        <p className="text-sm text-muted-foreground">{sub}</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {reportCards.map(({ key, icon: Icon, label, description, color, bg }) => (
          <div key={key} className="flex flex-col gap-3 rounded-xl border bg-card p-4 shadow-sm hover:shadow-md transition-shadow">
            <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${bg}`}>
              <Icon className={`${color}`} size={20} />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold">{label}</h3>
              <p className="mt-0.5 text-xs text-muted-foreground">{description}</p>
            </div>
            <button
              onClick={() => download(key)}
              disabled={loading === key}
              className="flex items-center justify-center gap-1.5 rounded-md border px-3 py-1.5 text-xs font-medium hover:bg-accent disabled:opacity-50 transition-colors"
            >
              {loading === key ? (
                <span className="flex items-center gap-1"><svg className="h-3 w-3 animate-spin" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" /></svg> Generating…</span>
              ) : (
                <><Download size={12} /> Download</>
              )}
            </button>
          </div>
        ))}
      </div>

      <div className="rounded-xl border bg-card p-6">
        <div className="flex items-center gap-2 mb-4">
          <BarChart3 size={18} className="text-primary" />
          <h2 className="font-semibold">Quick Stats</h2>
        </div>
        <p className="text-sm text-muted-foreground">Advanced analytics charts and detailed reports coming soon. You can still download the report files above.</p>
      </div>
    </div>
  );
}
