'use client';
/**
 * ReportsPage — Report cards with navigation to detail view
 * Click on any report to view data with filters and export
 */
import { useState } from 'react';
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

// // ─── Report definitions per institute type ────────────────────────────────────
// const REPORTS_BY_TYPE = {
//   school: [
//     { key: 'student_list',     icon: Users,          label: 'Student List',        description: 'Full student roster with contact details',     color: 'text-blue-500',    bg: 'bg-blue-50',      permission: 'reports.student' },
//     { key: 'attendance',       icon: CheckSquare,    label: 'Attendance Report',   description: 'Class-wise daily & monthly attendance',         color: 'text-emerald-500', bg: 'bg-emerald-50',   permission: 'reports.attendance' },
//     { key: 'exam_result',      icon: GraduationCap,  label: 'Exam Results',        description: 'Class-wise exam performance report',            color: 'text-violet-500',  bg: 'bg-violet-50',    permission: 'reports.exam' },
//     { key: 'fee_collection',   icon: DollarSign,     label: 'Fee Collection',      description: 'Fee payments, dues & outstanding amounts',      color: 'text-amber-500',   bg: 'bg-amber-50',     permission: 'reports.fee' },
//     { key: 'payroll',          icon: Clock,          label: 'Payroll Report',      description: 'Staff salary disbursement report',              color: 'text-pink-500',    bg: 'bg-pink-50',      permission: 'reports.payroll' },
//     { key: 'teacher_list',     icon: FileText,       label: 'Staff Directory',     description: 'Full staff and teacher directory',              color: 'text-cyan-500',    bg: 'bg-cyan-50',      permission: 'reports.student' },
//     { key: 'admission',        icon: UserCheck,      label: 'Admission Report',    description: 'New admissions & session-wise enrollment',      color: 'text-orange-500',  bg: 'bg-orange-50',    permission: 'reports.student' },
//     { key: 'academic_summary', icon: BarChart3,      label: 'Academic Summary',    description: 'Overall academic performance overview',         color: 'text-indigo-500',  bg: 'bg-indigo-50',    permission: 'reports.analytics' },
//   ],
//   coaching: [
//     { key: 'candidate_list',   icon: Users,          label: 'Candidate List',      description: 'All enrolled candidates with contact info',     color: 'text-blue-500',    bg: 'bg-blue-50',      permission: 'reports.student' },
//     { key: 'attendance',       icon: CheckSquare,    label: 'Session Attendance',  description: 'Batch-wise session attendance summary',         color: 'text-emerald-500', bg: 'bg-emerald-50',   permission: 'reports.attendance' },
//     { key: 'mock_test',        icon: GraduationCap,  label: 'Mock Test Results',   description: 'Candidate-wise mock test performance',          color: 'text-violet-500',  bg: 'bg-violet-50',    permission: 'reports.exam' },
//     { key: 'fee_collection',   icon: DollarSign,     label: 'Fee Collection',      description: 'Course fee payments & outstanding dues',        color: 'text-amber-500',   bg: 'bg-amber-50',     permission: 'reports.fee' },
//     { key: 'batch_progress',   icon: TrendingUp,     label: 'Batch Progress',      description: 'Progress report per batch & course',            color: 'text-teal-500',    bg: 'bg-teal-50',      permission: 'reports.analytics' },
//     { key: 'payroll',          icon: Clock,          label: 'Instructor Payroll',  description: 'Instructor salary disbursement report',         color: 'text-pink-500',    bg: 'bg-pink-50',      permission: 'reports.payroll' },
//     { key: 'enrollment',       icon: UserCheck,      label: 'Enrollment Report',   description: 'New enrollments & batch-wise statistics',       color: 'text-orange-500',  bg: 'bg-orange-50',    permission: 'reports.student' },
//     { key: 'performance_summary', icon: BarChart3,   label: 'Performance Summary', description: 'Overall batch and program performance',         color: 'text-indigo-500',  bg: 'bg-indigo-50',    permission: 'reports.analytics' },
//   ],
//   academy: [
//     { key: 'trainee_list',     icon: Users,          label: 'Trainee List',        description: 'All enrolled trainees with program details',    color: 'text-blue-500',    bg: 'bg-blue-50',      permission: 'reports.student' },
//     { key: 'attendance',       icon: CheckSquare,    label: 'Module Attendance',   description: 'Module-wise attendance tracker',                color: 'text-emerald-500', bg: 'bg-emerald-50',   permission: 'reports.attendance' },
//     { key: 'assessment',       icon: GraduationCap,  label: 'Assessment Results',  description: 'Trainee assessment scores by module',           color: 'text-violet-500',  bg: 'bg-violet-50',    permission: 'reports.exam' },
//     { key: 'fee_collection',   icon: DollarSign,     label: 'Fee Collection',      description: 'Program fee payments & due amounts',            color: 'text-amber-500',   bg: 'bg-amber-50',     permission: 'reports.fee' },
//     { key: 'certificate',      icon: BookMarked,     label: 'Certificates Issued', description: 'Completion certificate issuance report',        color: 'text-teal-500',    bg: 'bg-teal-50',      permission: 'reports.student' },
//     { key: 'payroll',          icon: Clock,          label: 'Trainer Payroll',     description: 'Trainer salary disbursement report',            color: 'text-pink-500',    bg: 'bg-pink-50',      permission: 'reports.payroll' },
//     { key: 'enrollment',       icon: UserCheck,      label: 'Enrollment Report',   description: 'New enrollments & program statistics',          color: 'text-orange-500',  bg: 'bg-orange-50',    permission: 'reports.student' },
//     { key: 'skill_summary',    icon: BarChart3,      label: 'Skills Summary',      description: 'Overall skill completion & proficiency stats',  color: 'text-indigo-500',  bg: 'bg-indigo-50',    permission: 'reports.analytics' },
//   ],
//   college: [
//     { key: 'student_list',     icon: Users,          label: 'Student List',        description: 'Department-wise student roster',                color: 'text-blue-500',    bg: 'bg-blue-50',      permission: 'reports.student' },
//     { key: 'attendance',       icon: CheckSquare,    label: 'Attendance Report',   description: 'Subject-wise attendance (75% rule)',            color: 'text-emerald-500', bg: 'bg-emerald-50',   permission: 'reports.attendance' },
//     { key: 'exam_result',      icon: GraduationCap,  label: 'Semester Results',    description: 'Semester-wise GPA/CGPA report',                 color: 'text-violet-500',  bg: 'bg-violet-50',    permission: 'reports.exam' },
//     { key: 'fee_collection',   icon: DollarSign,     label: 'Fee Collection',      description: 'Semester fee payments & outstanding dues',       color: 'text-amber-500',   bg: 'bg-amber-50',     permission: 'reports.fee' },
//     { key: 'payroll',          icon: Clock,          label: 'Payroll Report',      description: 'Faculty salary disbursement report',            color: 'text-pink-500',    bg: 'bg-pink-50',      permission: 'reports.payroll' },
//     { key: 'teacher_list',     icon: FileText,       label: 'Faculty Directory',   description: 'Full faculty and staff directory',              color: 'text-cyan-500',    bg: 'bg-cyan-50',      permission: 'reports.student' },
//     { key: 'admission',        icon: UserCheck,      label: 'Admission Report',    description: 'New admissions & program-wise enrollment',      color: 'text-orange-500',  bg: 'bg-orange-50',    permission: 'reports.student' },
//     { key: 'academic_summary', icon: BarChart3,      label: 'Academic Summary',    description: 'Program-wise academic performance overview',    color: 'text-indigo-500',  bg: 'bg-indigo-50',    permission: 'reports.analytics' },
//   ],
//   university: [
//     { key: 'student_list',     icon: Users,          label: 'Student List',        description: 'Faculty & department-wise student roster',      color: 'text-blue-500',    bg: 'bg-blue-50',      permission: 'reports.student' },
//     { key: 'attendance',       icon: CheckSquare,    label: 'Attendance Report',   description: 'Course-wise attendance summary',                color: 'text-emerald-500', bg: 'bg-emerald-50',   permission: 'reports.attendance' },
//     { key: 'exam_result',      icon: GraduationCap,  label: 'Semester Results',    description: 'Semester-wise GPA/CGPA and credit report',      color: 'text-violet-500',  bg: 'bg-violet-50',    permission: 'reports.exam' },
//     { key: 'fee_collection',   icon: DollarSign,     label: 'Fee Collection',      description: 'Semester fee, hostel & research fee dues',      color: 'text-amber-500',   bg: 'bg-amber-50',     permission: 'reports.fee' },
//     { key: 'research',         icon: FlaskConical,   label: 'Research Report',     description: 'Active research projects & publication stats', color: 'text-teal-500',    bg: 'bg-teal-50',      permission: 'reports.student' },
//     { key: 'payroll',          icon: Clock,          label: 'Payroll Report',      description: 'Faculty & staff salary disbursement',           color: 'text-pink-500',    bg: 'bg-pink-50',      permission: 'reports.payroll' },
//     { key: 'admission',        icon: UserCheck,      label: 'Admission Report',    description: 'Graduate & postgraduate enrollment stats',      color: 'text-orange-500',  bg: 'bg-orange-50',    permission: 'reports.student' },
//     { key: 'academic_summary', icon: BarChart3,      label: 'Academic Summary',    description: 'Faculty-wise academic performance overview',    color: 'text-indigo-500',  bg: 'bg-indigo-50',    permission: 'reports.analytics' },
//   ],
// };

// // fallback
// const DEFAULT_REPORTS = REPORTS_BY_TYPE.school;

// export default function ReportsPage({ type }) {
//   const canDo = useAuthStore((s) => s.canDo);
//   const { terms } = useInstituteConfig();
//   const [loading, setLoading] = useState(null);
//   const [, setReportData] = useState(null);

//   const reportCards = REPORTS_BY_TYPE[type] ?? DEFAULT_REPORTS;
  
//   // Filter reports based on user permissions
//   const accessibleReports = reportCards.filter(
//     (report) => canDo(report.permission)
//   );

//   /**
//    * Download a report
//    */
//   const download = async (key, permission) => {
//     // Check permission before download
//     if (!canDo(permission)) {
//       toast.error('You do not have permission to download this report');
//       return;
//     }

//     setLoading(key);
//     try {
//       const { reportService } = await import('@/services');
//       await reportService.download(key, 'excel');
//       toast.success('Report downloaded successfully!');
//     } catch (error) {
//       console.error('Download error:', error);
//       toast.error('Failed to download report. Please try again.');
//     } finally {
//       setLoading(null);
//     }
//   };

//   // Permission check - show "No Access" if user doesn't have any report permissions
//   const hasAnyReportPermission = accessibleReports.length > 0;

//   if (!hasAnyReportPermission) {
//     return (
//       <div className="flex flex-col items-center justify-center gap-4 py-20 text-center">
//         <AlertCircle className="h-12 w-12 text-muted-foreground" />
//         <div>
//           <h2 className="text-lg font-semibold">Access Denied</h2>
//           <p className="text-sm text-muted-foreground mt-1">
//             You don't have permission to access any reports. Contact your administrator if you need access.
//           </p>
//         </div>
//       </div>
//     );
//   }

//   // Heading labels per type
//   const headings = {
//     school:     { title: 'School Reports',      sub: 'Download class, fee, attendance & exam reports' },
//     coaching:   { title: 'Coaching Reports',    sub: 'Download batch, candidate & mock test reports' },
//     academy:    { title: 'Academy Reports',     sub: 'Download trainee, program & skills reports' },
//     college:    { title: 'College Reports',     sub: 'Download department, semester & faculty reports' },
//     university: { title: 'University Reports',  sub: 'Download faculty, research & academic reports' },
//   };
//   const { title, sub } = headings[type] ?? headings.school;

//   return (
//     <div className="space-y-6">
//       {/* Header */}
//       <div>
//         <h1 className="text-xl font-bold">{title}</h1>
//         <p className="text-sm text-muted-foreground">{sub}</p>
//         {accessibleReports.length < reportCards.length && (
//           <p className="text-xs text-amber-600 mt-2">
//             ℹ️ {reportCards.length - accessibleReports.length} report(s) are restricted based on your permissions
//           </p>
//         )}
//       </div>

//       {/* Report Cards Grid */}
//       <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
//         {reportCards.map(({ key, icon: Icon, label, description, color, bg, permission }) => {
//           const hasPermission = canDo(permission);
          
//           return (
//             <div
//               key={key}
//               className={`flex flex-col gap-3 rounded-xl border bg-card p-4 shadow-sm transition-all ${
//                 hasPermission 
//                   ? 'hover:shadow-md cursor-default' 
//                   : 'opacity-50 bg-muted cursor-not-allowed'
//               }`}
//             >
//               <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${bg}`}>
//                 <Icon className={`${color}`} size={20} />
//               </div>
//               <div className="flex-1">
//                 <h3 className="font-semibold">{label}</h3>
//                 <p className="mt-0.5 text-xs text-muted-foreground">{description}</p>
//               </div>
//               <button
//                 onClick={() => download(key, permission)}
//                 disabled={loading === key || !hasPermission}
//                 className="flex items-center justify-center gap-1.5 rounded-md border px-3 py-1.5 text-xs font-medium hover:bg-accent disabled:opacity-50 transition-colors"
//                 title={!hasPermission ? 'Permission denied' : ''}
//               >
//                 {loading === key ? (
//                   <span className="flex items-center gap-1">
//                     <Loader2 size={12} className="animate-spin" />
//                     Generating…
//                   </span>
//                 ) : (
//                   <>
//                     <Download size={12} /> Download
//                   </>
//                 )}
//               </button>
//               {!hasPermission && (
//                 <p className="text-xs text-muted-foreground text-center mt-1">Permission required</p>
//               )}
//             </div>
//           );
//         })}
//       </div>

//       {/* Quick Stats / Analytics Section */}
//       <div className="rounded-xl border bg-card p-6">
//         <div className="flex items-center gap-2 mb-4">
//           <BarChart3 size={18} className="text-primary" />
//           <h2 className="font-semibold">Analytics Dashboard</h2>
//         </div>
//         <p className="text-sm text-muted-foreground">
//           Advanced analytics charts, detailed breakdowns and custom report builder coming soon. You can download reports above in Excel format for detailed analysis.
//         </p>
//       </div>

//       {/* Permissions Legend */}
//       <div className="rounded-xl border bg-card p-4 text-xs text-muted-foreground">
//         <p className="font-semibold mb-2">📋 Available Permissions:</p>
//         <ul className="space-y-1 text-xs">
//           <li>• <span className="font-mono">reports.student</span> - Student & Staff reports</li>
//           <li>• <span className="font-mono">reports.attendance</span> - Attendance records</li>
//           <li>• <span className="font-mono">reports.fee</span> - Fee collection & outstanding</li>
//           <li>• <span className="font-mono">reports.exam</span> - Exam results & performance</li>
//           <li>• <span className="font-mono">reports.payroll</span> - Salary & payroll reports</li>
//           <li>• <span className="font-mono">reports.analytics</span> - Summary & analytics</li>
//         </ul>
//       </div>
//     </div>
//   );
// }
