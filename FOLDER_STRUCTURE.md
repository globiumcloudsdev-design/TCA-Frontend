# Frontend Complete Folder Structure — The Clouds Academy ☁️
> Auto-generated from actual project files. Last updated: March 6, 2026

```
Frontend/
├── .env.example
├── .env.local
├── .gitignore
├── components.json
├── jsconfig.json
├── next.config.mjs
├── package.json
├── postcss.config.js
├── tailwind.config.js
├── vercel.json
│
└── src/
    ├── middleware.js                          # Next.js middleware (auth guard + route protection)
    │
    ├── app/                                   # Next.js App Router (all pages & layouts)
    │   ├── globals.css
    │   ├── layout.js                          # Root HTML layout (fonts, providers)
    │   ├── not-found.js                       # Global 404 page
    │   ├── page.js                            # Landing page (/)
    │   │
    │   ├── (auth)/                            # Auth Route Group
    │   │   ├── layout.js
    │   │   ├── login/page.js
    │   │   ├── forgot-password/page.js
    │   │   └── reset-password/[token]/page.js
    │   │
    │   ├── (master-admin)/                    # SaaS Super Admin Portal
    │   │   ├── layout.js                      # Master Admin sidebar + header layout
    │   │   └── master-admin/
    │   │       ├── page.js                    # Dashboard
    │   │       ├── schools/
    │   │       │   ├── page.js                # All Institutes list
    │   │       │   └── [id]/page.js           # Institute Detail (People, Subscription, Stats)
    │   │       ├── subscriptions/page.js      # Subscription management
    │   │       ├── subscription-templates/page.js
    │   │       ├── roles/page.js
    │   │       ├── users/page.js
    │   │       ├── emails/page.js             # Bulk Email campaigns
    │   │       ├── reports/page.js            # Platform-wide analytics
    │   │       └── notifications/page.js      # Notification broadcast history
    │   │
    │   ├── (school)/                          # Standard School ERP
    │   │   ├── layout.js
    │   │   ├── dashboard/page.js
    │   │   ├── students/page.js
    │   │   ├── teachers/page.js
    │   │   ├── parents/page.js
    │   │   ├── admissions/page.js
    │   │   ├── attendance/page.js
    │   │   ├── classes/page.js
    │   │   ├── sections/page.js
    │   │   ├── subjects/page.js
    │   │   ├── academic-years/page.js
    │   │   ├── exams/page.js
    │   │   ├── fees/page.js
    │   │   ├── fee-templates/page.js
    │   │   ├── payroll/page.js
    │   │   ├── notices/page.js
    │   │   ├── timetable/page.js
    │   │   ├── reports/page.js
    │   │   ├── branches/page.js
    │   │   ├── roles/page.js
    │   │   ├── users/page.js
    │   │   ├── staff-attendance/page.js
    │   │   └── settings/page.js
    │   │
    │   ├── (institute)/                       # Multi-type Institute ERP (Dynamic)
    │   │   ├── layout.js
    │   │   └── [type]/                        # Coaching / Academy / University / College
    │   │       ├── dashboard/page.js
    │   │       ├── students/
    │   │       │   ├── page.js
    │   │       │   ├── add/page.js
    │   │       │   └── [id]/
    │   │       │       ├── page.js
    │   │       │       └── edit/page.js
    │   │       ├── teachers/page.js
    │   │       ├── parents/page.js
    │   │       ├── admissions/page.js
    │   │       ├── attendance/page.js
    │   │       ├── classes/page.js
    │   │       ├── sections/page.js
    │   │       ├── subjects/page.js
    │   │       ├── courses/page.js
    │   │       ├── programs/page.js
    │   │       ├── batches/page.js
    │   │       ├── semesters/page.js
    │   │       ├── departments/page.js
    │   │       ├── faculties/page.js
    │   │       ├── research/page.js
    │   │       ├── academic-years/page.js
    │   │       ├── exams/page.js
    │   │       ├── fees/page.js
    │   │       ├── fee-templates/page.js
    │   │       ├── payroll/page.js
    │   │       ├── notices/page.js
    │   │       ├── timetable/page.js
    │   │       ├── reports/page.js
    │   │       ├── branches/page.js
    │   │       ├── roles/page.js
    │   │       ├── users/page.js
    │   │       ├── staff-attendance/page.js
    │   │       └── settings/page.js
    │   │
    │   ├── student/                           # Student Portal
    │   │   ├── layout.jsx
    │   │   ├── page.jsx                       # Student Dashboard
    │   │   ├── attendance/page.jsx
    │   │   ├── fees/page.jsx
    │   │   ├── exams/page.jsx
    │   │   ├── assignments/page.jsx
    │   │   ├── homework/page.jsx
    │   │   ├── timetable/page.jsx
    │   │   ├── syllabus/page.jsx
    │   │   └── announcements/page.jsx
    │   │
    │   ├── parent/                            # Parent Portal
    │   │   ├── layout.jsx
    │   │   ├── page.jsx                       # Parent Dashboard
    │   │   ├── attendance/page.jsx
    │   │   ├── fees/page.jsx
    │   │   ├── results/page.jsx
    │   │   └── announcements/page.jsx
    │   │
    │   ├── teacher/                           # Teacher Portal
    │   │   ├── layout.jsx
    │   │   ├── page.jsx                       # Teacher Dashboard
    │   │   ├── classes/page.jsx
    │   │   ├── students/page.jsx
    │   │   ├── attendance/page.jsx
    │   │   ├── assignments/page.jsx
    │   │   ├── homework/page.jsx
    │   │   ├── notes/page.jsx
    │   │   └── announcements/page.jsx
    │   │
    │   └── portal-login/page.jsx              # Unified portal login (students/teachers/parents)
    │
    ├── components/
    │   ├── Providers.jsx                      # TanStack Query + Theme provider wrapper
    │   │
    │   ├── common/                            # Reusable business-level components
    │   │   ├── index.js
    │   │   ├── AppBreadcrumb.jsx
    │   │   ├── AppModal.jsx                   # Standardized dialog wrapper
    │   │   ├── AppPagination.jsx              # Pagination footer
    │   │   ├── AvatarWithInitials.jsx
    │   │   ├── BranchInitializer.jsx
    │   │   ├── BranchSwitcher.jsx
    │   │   ├── CheckboxField.jsx
    │   │   ├── ConfirmDialog.jsx              # Destruction confirmation modal
    │   │   ├── DataTable.jsx                  # Advanced sortable/filterable table
    │   │   ├── DataTableToolbar.jsx
    │   │   ├── DatePickerField.jsx
    │   │   ├── EmptyState.jsx
    │   │   ├── ErrorAlert.jsx
    │   │   ├── ExportModal.jsx
    │   │   ├── FormSubmitButton.jsx
    │   │   ├── InputField.jsx
    │   │   ├── NotificationBell.jsx
    │   │   ├── PageHeader.jsx
    │   │   ├── PageLoader.jsx
    │   │   ├── SearchInput.jsx
    │   │   ├── SectionHeader.jsx
    │   │   ├── SelectField.jsx
    │   │   ├── StatsCard.jsx                  # KPI summary cards
    │   │   ├── StatusBadge.jsx
    │   │   ├── SwitchField.jsx
    │   │   ├── TableRowActions.jsx
    │   │   ├── TextareaField.jsx
    │   │   ├── ThemeToggle.jsx
    │   │   └── UserMenu.jsx
    │   │
    │   ├── forms/                             # Complex entity forms
    │   │   ├── index.js
    │   │   ├── AcademicYearForm.jsx
    │   │   ├── BranchForm.jsx
    │   │   ├── ClassForm.jsx
    │   │   ├── ExamForm.jsx
    │   │   ├── FeeCollectForm.jsx
    │   │   ├── FeeVoucherForm.jsx
    │   │   ├── RoleForm.jsx
    │   │   ├── SectionForm.jsx
    │   │   ├── StudentForm.jsx
    │   │   ├── TeacherForm.jsx
    │   │   └── UserForm.jsx
    │   │
    │   ├── pages/                             # Full page-level components (used by [type] routes)
    │   │   ├── AcademicYearsPage.jsx
    │   │   ├── AdmissionsPage.jsx
    │   │   ├── AttendancePage.jsx
    │   │   ├── BranchesPage.jsx
    │   │   ├── ClassesPage.jsx
    │   │   ├── DashboardPage.jsx
    │   │   ├── DepartmentsPage.jsx
    │   │   ├── ExamsPage.jsx
    │   │   ├── FacultiesPage.jsx
    │   │   ├── FeeTemplatesPage.jsx
    │   │   ├── FeesPage.jsx
    │   │   ├── NoticesPage.jsx
    │   │   ├── ParentsPage.jsx
    │   │   ├── PayrollPage.jsx
    │   │   ├── ProgramsPage.jsx
    │   │   ├── ReportsPage.jsx
    │   │   ├── ResearchPage.jsx
    │   │   ├── RolesPage.jsx
    │   │   ├── SectionsPage.jsx
    │   │   ├── SemestersPage.jsx
    │   │   ├── SettingsPage.jsx
    │   │   ├── StaffAttendancePage.jsx
    │   │   ├── StudentAddEditPage.jsx
    │   │   ├── StudentDetailPage.jsx
    │   │   ├── StudentsPage.jsx
    │   │   ├── SubjectsPage.jsx
    │   │   ├── TeachersPage.jsx
    │   │   ├── TimetablePage.jsx
    │   │   └── UsersPage.jsx
    │   │
    │   ├── layout/                            # Dashboard scaffolding
    │   │   ├── InstituteLayoutWrapper.jsx
    │   │   ├── Navbar.jsx
    │   │   └── Sidebar.jsx
    │   │
    │   ├── charts/                            # Data visualization (Recharts)
    │   │   ├── index.js
    │   │   ├── AttendanceChart.jsx
    │   │   ├── DonutChart.jsx
    │   │   ├── EnrollmentChart.jsx
    │   │   └── FeesChart.jsx
    │   │
    │   ├── landing/                           # Public landing page sections
    │   │   ├── index.js
    │   │   ├── LandingPage.jsx
    │   │   ├── HeroSection.jsx
    │   │   ├── FeaturesSection.jsx
    │   │   ├── ModulesSection.jsx
    │   │   ├── StatsSection.jsx
    │   │   ├── PricingSection.jsx
    │   │   ├── TestimonialsSection.jsx
    │   │   ├── FAQSection.jsx
    │   │   ├── CTASection.jsx
    │   │   ├── Navbar.jsx
    │   │   └── Footer.jsx
    │   │
    │   ├── portal/                            # Student/Parent/Teacher portal shell
    │   │   └── PortalShell.jsx
    │   │
    │   ├── shared/                            # Generic low-level helpers
    │   │   ├── EmptyState.jsx
    │   │   ├── LoadingSpinner.jsx
    │   │   ├── Pagination.jsx
    │   │   ├── PermissionGuard.jsx
    │   │   └── StatusBadge.jsx
    │   │
    │   └── ui/                                # Shadcn/Radix UI primitives
    │       ├── alert.jsx
    │       ├── alert-dialog.jsx
    │       ├── avatar.jsx
    │       ├── badge.jsx
    │       ├── breadcrumb.jsx
    │       ├── button.jsx
    │       ├── calendar.jsx
    │       ├── card.jsx
    │       ├── checkbox.jsx
    │       ├── command.jsx
    │       ├── dialog.jsx
    │       ├── dropdown-menu.jsx
    │       ├── form.jsx
    │       ├── input.jsx
    │       ├── label.jsx
    │       ├── pagination.jsx
    │       ├── popover.jsx
    │       ├── progress.jsx
    │       ├── scroll-area.jsx
    │       ├── select.jsx
    │       ├── separator.jsx
    │       ├── sheet.jsx
    │       ├── skeleton.jsx
    │       ├── switch.jsx
    │       ├── table.jsx
    │       ├── tabs.jsx
    │       ├── textarea.jsx
    │       └── tooltip.jsx
    │
    ├── config/
    │   └── instituteConfig.js                 # Institute type config (School/Academy/University themes)
    │
    ├── constants/
    │   ├── apiEndpoints.js                    # Centralised map of all backend API routes
    │   ├── index.js                           # Global app-wide constants / enums
    │   └── portalInstituteConfig.js           # Portal label overrides per institute type
    │
    ├── data/                                  # Dummy/mock data (dev & demo mode)
    │   ├── dummyData.js                       # Main school ERP mock data (233KB)
    │   ├── masterAdminDummyData.js            # Master admin platform metrics
    │   └── portalDummyData.js                 # Student/Parent portal mock data
    │
    ├── hooks/                                 # Custom React hooks
    │   ├── useAuth.js                         # Session management + auto-redirect
    │   ├── useConfirm.js                      # Programmatic ConfirmDialog trigger
    │   ├── useInstituteConfig.js              # Detect institute type, swap UI labels
    │   ├── usePagination.js                   # Table pagination state management
    │   ├── usePermission.js                   # RBAC permission check
    │   └── useSocket.js                       # Socket.io real-time connection
    │
    ├── lib/                                   # Core infrastructure
    │   ├── api.js                             # Axios instance (auth headers, interceptors)
    │   ├── auth.js                            # Cookie/token helpers
    │   ├── queryClient.js                     # TanStack Query (React Query) configuration
    │   ├── utils.js                           # cn(), formatDate(), formatCurrency(PKR)
    │   └── withFallback.js                    # HOC for graceful error/permission boundaries
    │
    ├── services/                              # API abstraction layer
    │   ├── index.js
    │   ├── academicYearService.js
    │   ├── admissionService.js
    │   ├── attendanceService.js
    │   ├── authService.js
    │   ├── branchService.js
    │   ├── classService.js
    │   ├── dashboardService.js
    │   ├── examService.js
    │   ├── feeService.js
    │   ├── feeTemplateService.js
    │   ├── masterAdminService.js
    │   ├── noticeService.js
    │   ├── notificationService.js
    │   ├── parentService.js
    │   ├── payrollService.js
    │   ├── reportService.js
    │   ├── roleService.js
    │   ├── schoolService.js
    │   ├── sectionService.js
    │   ├── staffAttendanceService.js
    │   ├── studentService.js
    │   ├── subjectService.js
    │   ├── teacherService.js
    │   ├── timetableService.js
    │   └── userService.js
    │
    └── store/                                 # Zustand global state
        ├── authStore.js                       # User, token, permissions, school_code
        ├── portalStore.js                     # Active portal session state
        └── uiStore.js                         # Sidebar toggle, theme (light/dark)
```

---

## Key Config & Wrapper File Source Code

> These 4 files form the entire `(institute)` multi-type ERP system.

---

### `src/app/(institute)/layout.js`

```js
/**
 * (institute) route group — shared layout for all institute types
 * Handles: /school/*, /coaching/*, /academy/*, /college/*, /university/*
 *
 * This layout:
 *  1. Verifies access_token (redirect to /login if missing)
 *  2. Passes institute config to child pages via context
 */
import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';
import InstituteLayoutWrapper from '@/components/layout/InstituteLayoutWrapper';

export default async function InstituteGroupLayout({ children }) {
  // Server-side auth check (edge-safe)
  const cookieStore = await cookies();
  const token = cookieStore.get('access_token')?.value;
  if (!token) redirect('/login');

  return <InstituteLayoutWrapper>{children}</InstituteLayoutWrapper>;
}
```

---

### `src/config/instituteConfig.js`

```js
/**
 * ╔══════════════════════════════════════════════════════════════════╗
 * ║   Institute Config — The Clouds Academy                         ║
 * ║                                                                  ║
 * ║  Har institute type ka apna:                                     ║
 * ║   • terminology   (Class → Course, Section → Batch, etc.)       ║
 * ║   • nav items     (kaunse sidebar links dikhane hain)           ║
 * ║   • dashboard URL (/school/dashboard etc.)                       ║
 * ║   • academic structure                                           ║
 * ╚══════════════════════════════════════════════════════════════════╝
 *
 * Usage:
 *   import { getInstituteConfig } from '@/config/instituteConfig';
 *   const cfg = getInstituteConfig('coaching');
 *   cfg.terms.students    → 'Students'   (school)
 *   cfg.terms.students    → 'Candidates' (coaching)
 *   cfg.dashboardPath     → '/coaching/dashboard'
 */

import { INSTITUTE_TYPES } from '@/data/dummyData';

// ─────────────────────────────────────────────────────────────────────────────
// TERMINOLOGY MAPS — common UI labels per institute type
// ─────────────────────────────────────────────────────────────────────────────

const TERMS = {
  school: {
    primary_unit:       'Class',
    primary_unit_pl:    'Classes',
    grouping_unit:      'Section',
    grouping_unit_pl:   'Sections',
    students:           'Students',
    student:            'Student',
    teachers:           'Teachers',
    teacher:            'Teacher',
    enrollment:         'Admission',
    fee_basis:          'Monthly',
    attendance_basis:   'Subject-wise',
    academic_period:    'Academic Year',
    exam_term:          'Exam',
    grade_term:         'Grade',
    curriculum_term:    'Syllabus',
    schedule_term:      'Timetable',
    roll_number:        'Roll Number',
    employee_id:        'Employee ID',
  },

  coaching: {
    primary_unit:       'Course',
    primary_unit_pl:    'Courses',
    grouping_unit:      'Batch',
    grouping_unit_pl:   'Batches',
    students:           'Candidates',
    student:            'Candidate',
    teachers:           'Instructors',
    teacher:            'Instructor',
    enrollment:         'Enrollment',
    fee_basis:          'Course-wise',
    attendance_basis:   'Session-wise',
    academic_period:    'Session',
    exam_term:          'Mock Test',
    grade_term:         'Score',
    curriculum_term:    'Course Content',
    schedule_term:      'Session Schedule',
    roll_number:        'Candidate ID',
    employee_id:        'Staff ID',
  },

  academy: {
    primary_unit:       'Program',
    primary_unit_pl:    'Programs',
    grouping_unit:      'Batch',
    grouping_unit_pl:   'Batches',
    students:           'Trainees',
    student:            'Trainee',
    teachers:           'Trainers',
    teacher:            'Trainer',
    enrollment:         'Registration',
    fee_basis:          'Module-wise',
    attendance_basis:   'Module-wise',
    academic_period:    'Batch Cycle',
    exam_term:          'Assessment',
    grade_term:         'Certificate Level',
    curriculum_term:    'Modules',
    schedule_term:      'Class Schedule',
    roll_number:        'Trainee ID',
    employee_id:        'Trainer ID',
  },

  college: {
    primary_unit:       'Department',
    primary_unit_pl:    'Departments',
    grouping_unit:      'Semester',
    grouping_unit_pl:   'Semesters',
    students:           'Students',
    student:            'Student',
    teachers:           'Lecturers',
    teacher:            'Lecturer',
    enrollment:         'Admission',
    fee_basis:          'Semester-wise',
    attendance_basis:   'Subject-wise',
    academic_period:    'Semester',
    exam_term:          'Examination',
    grade_term:         'CGPA',
    curriculum_term:    'Course Outline',
    schedule_term:      'Lecture Schedule',
    roll_number:        'Enrollment No.',
    employee_id:        'Employee No.',
  },

  university: {
    primary_unit:       'Faculty',
    primary_unit_pl:    'Faculties',
    grouping_unit:      'Department',
    grouping_unit_pl:   'Departments',
    students:           'Students',
    student:            'Student',
    teachers:           'Professors',
    teacher:            'Professor',
    enrollment:         'Admission',
    fee_basis:          'Semester-wise',
    attendance_basis:   'Course-wise',
    academic_period:    'Semester',
    exam_term:          'Examination',
    grade_term:         'CGPA',
    curriculum_term:    'Course Content',
    schedule_term:      'Course Schedule',
    roll_number:        'Reg. No.',
    employee_id:        'Faculty ID',
  },
};

// ─────────────────────────────────────────────────────────────────────────────
// SIDEBAR NAVIGATION — per institute type
// Every item: { label, href, icon, permission, group }
// ─────────────────────────────────────────────────────────────────────────────

const NAV = {
  school: [
    { group: 'Main',       label: 'Dashboard',        href: '/school/dashboard',        icon: 'LayoutDashboard',   permission: null },
    { group: 'Academic',   label: 'Classes',           href: '/school/classes',           icon: 'BookOpen',          permission: 'class.read' },
    { group: 'Academic',   label: 'Sections',          href: '/school/sections',          icon: 'Layers',            permission: 'section.read' },
    { group: 'Academic',   label: 'Subjects',          href: '/school/subjects',          icon: 'FileText',          permission: 'subject.read' },
    { group: 'Academic',   label: 'Timetable',         href: '/school/timetable',         icon: 'Calendar',          permission: 'timetable.read' },
    { group: 'Academic',   label: 'Academic Years',    href: '/school/academic-years',    icon: 'CalendarDays',      permission: 'academic_year.read' },
    { group: 'People',     label: 'Students',          href: '/school/students',          icon: 'Users',             permission: 'student.read' },
    { group: 'People',     label: 'Teachers',          href: '/school/teachers',          icon: 'GraduationCap',     permission: 'teacher.read' },
    { group: 'People',     label: 'Parents',           href: '/school/parents',           icon: 'Heart',             permission: 'parent.read' },
    { group: 'People',     label: 'Admissions',        href: '/school/admissions',        icon: 'ClipboardList',     permission: 'admission.read' },
    { group: 'Operations', label: 'Attendance',        href: '/school/attendance',        icon: 'CheckSquare',       permission: 'attendance.read' },
    { group: 'Operations', label: 'Staff Attendance',  href: '/school/staff-attendance',  icon: 'UserCheck',         permission: 'attendance.read' },
    { group: 'Operations', label: 'Exams',             href: '/school/exams',             icon: 'ClipboardCheck',    permission: 'exam.read' },
    { group: 'Finance',    label: 'Fees',              href: '/school/fees',              icon: 'CreditCard',        permission: 'fee.read' },
    { group: 'Finance',    label: 'Fee Templates',     href: '/school/fee-templates',     icon: 'Receipt',           permission: 'fee_template.read' },
    { group: 'Finance',    label: 'Payroll',           href: '/school/payroll',           icon: 'DollarSign',        permission: 'payroll.read' },
    { group: 'Finance',    label: 'Reports',           href: '/school/reports',           icon: 'BarChart2',         permission: 'report.financial' },
    { group: 'Comms',      label: 'Notices',           href: '/school/notices',           icon: 'Bell',              permission: 'notice.read' },
    { group: 'Admin',      label: 'Branches',          href: '/school/branches',          icon: 'Building2',         permission: 'branch.read',  requiresBranches: true },
    { group: 'Admin',      label: 'Roles',             href: '/school/roles',             icon: 'Shield',            permission: 'role.read' },
    { group: 'Admin',      label: 'Users',             href: '/school/users',             icon: 'UserCog',           permission: 'user.read' },
    { group: 'Admin',      label: 'Settings',          href: '/school/settings',          icon: 'Settings',          permission: 'school.settings' },
  ],

  coaching: [
    { group: 'Main',       label: 'Dashboard',         href: '/coaching/dashboard',       icon: 'LayoutDashboard',   permission: null },
    { group: 'Academic',   label: 'Courses',           href: '/coaching/courses',         icon: 'BookOpen',          permission: 'class.read' },
    { group: 'Academic',   label: 'Batches',           href: '/coaching/batches',         icon: 'Layers',            permission: 'section.read' },
    { group: 'Academic',   label: 'Subjects',          href: '/coaching/subjects',        icon: 'FileText',          permission: 'subject.read' },
    { group: 'Academic',   label: 'Session Schedule',  href: '/coaching/timetable',       icon: 'Calendar',          permission: 'timetable.read' },
    { group: 'Academic',   label: 'Sessions',          href: '/coaching/academic-years',  icon: 'CalendarDays',      permission: 'academic_year.read' },
    { group: 'People',     label: 'Candidates',        href: '/coaching/students',        icon: 'Users',             permission: 'student.read' },
    { group: 'People',     label: 'Instructors',       href: '/coaching/teachers',        icon: 'GraduationCap',     permission: 'teacher.read' },
    { group: 'People',     label: 'Enrollments',       href: '/coaching/admissions',      icon: 'ClipboardList',     permission: 'admission.read' },
    { group: 'Operations', label: 'Attendance',        href: '/coaching/attendance',      icon: 'CheckSquare',       permission: 'attendance.read' },
    { group: 'Operations', label: 'Staff Attendance',  href: '/coaching/staff-attendance',icon: 'UserCheck',         permission: 'attendance.read' },
    { group: 'Operations', label: 'Mock Tests',        href: '/coaching/exams',           icon: 'ClipboardCheck',    permission: 'exam.read' },
    { group: 'Finance',    label: 'Fees',              href: '/coaching/fees',            icon: 'CreditCard',        permission: 'fee.read' },
    { group: 'Finance',    label: 'Fee Templates',     href: '/coaching/fee-templates',   icon: 'Receipt',           permission: 'fee_template.read' },
    { group: 'Finance',    label: 'Payroll',           href: '/coaching/payroll',         icon: 'DollarSign',        permission: 'payroll.read' },
    { group: 'Finance',    label: 'Reports',           href: '/coaching/reports',         icon: 'BarChart2',         permission: 'report.financial' },
    { group: 'Comms',      label: 'Notices',           href: '/coaching/notices',         icon: 'Bell',              permission: 'notice.read' },
    { group: 'Admin',      label: 'Branches',          href: '/coaching/branches',        icon: 'Building2',         permission: 'branch.read',  requiresBranches: true },
    { group: 'Admin',      label: 'Roles',             href: '/coaching/roles',           icon: 'Shield',            permission: 'role.read' },
    { group: 'Admin',      label: 'Users',             href: '/coaching/users',           icon: 'UserCog',           permission: 'user.read' },
    { group: 'Admin',      label: 'Settings',          href: '/coaching/settings',        icon: 'Settings',          permission: 'school.settings' },
  ],

  academy: [
    { group: 'Main',       label: 'Dashboard',         href: '/academy/dashboard',        icon: 'LayoutDashboard',   permission: null },
    { group: 'Academic',   label: 'Programs',          href: '/academy/classes',          icon: 'BookOpen',          permission: 'class.read' },
    { group: 'Academic',   label: 'Batches',           href: '/academy/batches',          icon: 'Layers',            permission: 'section.read' },
    { group: 'Academic',   label: 'Modules',           href: '/academy/subjects',         icon: 'FileText',          permission: 'subject.read' },
    { group: 'Academic',   label: 'Class Schedule',    href: '/academy/timetable',        icon: 'Calendar',          permission: 'timetable.read' },
    { group: 'Academic',   label: 'Batch Cycles',      href: '/academy/academic-years',   icon: 'CalendarDays',      permission: 'academic_year.read' },
    { group: 'People',     label: 'Trainees',          href: '/academy/students',         icon: 'Users',             permission: 'student.read' },
    { group: 'People',     label: 'Trainers',          href: '/academy/teachers',         icon: 'GraduationCap',     permission: 'teacher.read' },
    { group: 'People',     label: 'Registrations',     href: '/academy/admissions',       icon: 'ClipboardList',     permission: 'admission.read' },
    { group: 'Operations', label: 'Attendance',        href: '/academy/attendance',       icon: 'CheckSquare',       permission: 'attendance.read' },
    { group: 'Operations', label: 'Staff Attendance',  href: '/academy/staff-attendance', icon: 'UserCheck',         permission: 'attendance.read' },
    { group: 'Operations', label: 'Assessments',       href: '/academy/exams',            icon: 'ClipboardCheck',    permission: 'exam.read' },
    { group: 'Finance',    label: 'Fees',              href: '/academy/fees',             icon: 'CreditCard',        permission: 'fee.read' },
    { group: 'Finance',    label: 'Fee Templates',     href: '/academy/fee-templates',    icon: 'Receipt',           permission: 'fee_template.read' },
    { group: 'Finance',    label: 'Payroll',           href: '/academy/payroll',          icon: 'DollarSign',        permission: 'payroll.read' },
    { group: 'Finance',    label: 'Reports',           href: '/academy/reports',          icon: 'BarChart2',         permission: 'report.financial' },
    { group: 'Comms',      label: 'Notices',           href: '/academy/notices',          icon: 'Bell',              permission: 'notice.read' },
    { group: 'Admin',      label: 'Branches',          href: '/academy/branches',         icon: 'Building2',         permission: 'branch.read',  requiresBranches: true },
    { group: 'Admin',      label: 'Roles',             href: '/academy/roles',            icon: 'Shield',            permission: 'role.read' },
    { group: 'Admin',      label: 'Users',             href: '/academy/users',            icon: 'UserCog',           permission: 'user.read' },
    { group: 'Admin',      label: 'Settings',          href: '/academy/settings',         icon: 'Settings',          permission: 'school.settings' },
  ],

  college: [
    { group: 'Main',       label: 'Dashboard',         href: '/college/dashboard',        icon: 'LayoutDashboard',   permission: null },
    { group: 'Academic',   label: 'Departments',       href: '/college/classes',          icon: 'Building',          permission: 'class.read' },
    { group: 'Academic',   label: 'Programs',          href: '/college/programs',         icon: 'BookOpen',          permission: 'section.read' },
    { group: 'Academic',   label: 'Semesters',         href: '/college/semesters',        icon: 'Layers',            permission: 'section.read' },
    { group: 'Academic',   label: 'Subjects',          href: '/college/subjects',         icon: 'FileText',          permission: 'subject.read' },
    { group: 'Academic',   label: 'Lecture Schedule',  href: '/college/timetable',        icon: 'Calendar',          permission: 'timetable.read' },
    { group: 'Academic',   label: 'Academic Years',    href: '/college/academic-years',   icon: 'CalendarDays',      permission: 'academic_year.read' },
    { group: 'People',     label: 'Students',          href: '/college/students',         icon: 'Users',             permission: 'student.read' },
    { group: 'People',     label: 'Lecturers',         href: '/college/teachers',         icon: 'GraduationCap',     permission: 'teacher.read' },
    { group: 'People',     label: 'Admissions',        href: '/college/admissions',       icon: 'ClipboardList',     permission: 'admission.read' },
    { group: 'Operations', label: 'Attendance',        href: '/college/attendance',       icon: 'CheckSquare',       permission: 'attendance.read' },
    { group: 'Operations', label: 'Staff Attendance',  href: '/college/staff-attendance', icon: 'UserCheck',         permission: 'attendance.read' },
    { group: 'Operations', label: 'Examinations',      href: '/college/exams',            icon: 'ClipboardCheck',    permission: 'exam.read' },
    { group: 'Finance',    label: 'Fees',              href: '/college/fees',             icon: 'CreditCard',        permission: 'fee.read' },
    { group: 'Finance',    label: 'Fee Templates',     href: '/college/fee-templates',    icon: 'Receipt',           permission: 'fee_template.read' },
    { group: 'Finance',    label: 'Payroll',           href: '/college/payroll',          icon: 'DollarSign',        permission: 'payroll.read' },
    { group: 'Finance',    label: 'Reports',           href: '/college/reports',          icon: 'BarChart2',         permission: 'report.financial' },
    { group: 'Comms',      label: 'Notices',           href: '/college/notices',          icon: 'Bell',              permission: 'notice.read' },
    { group: 'Admin',      label: 'Branches',          href: '/college/branches',         icon: 'Building2',         permission: 'branch.read',  requiresBranches: true },
    { group: 'Admin',      label: 'Roles',             href: '/college/roles',            icon: 'Shield',            permission: 'role.read' },
    { group: 'Admin',      label: 'Users',             href: '/college/users',            icon: 'UserCog',           permission: 'user.read' },
    { group: 'Admin',      label: 'Settings',          href: '/college/settings',         icon: 'Settings',          permission: 'school.settings' },
  ],

  university: [
    { group: 'Main',       label: 'Dashboard',         href: '/university/dashboard',        icon: 'LayoutDashboard',   permission: null },
    { group: 'Academic',   label: 'Faculties',         href: '/university/faculties',        icon: 'Building',          permission: 'class.read' },
    { group: 'Academic',   label: 'Departments',       href: '/university/departments',      icon: 'BookOpen',          permission: 'class.read' },
    { group: 'Academic',   label: 'Programs',          href: '/university/programs',         icon: 'Layers',            permission: 'section.read' },
    { group: 'Academic',   label: 'Semesters',         href: '/university/semesters',        icon: 'CalendarDays',      permission: 'section.read' },
    { group: 'Academic',   label: 'Courses',           href: '/university/subjects',         icon: 'FileText',          permission: 'subject.read' },
    { group: 'Academic',   label: 'Course Schedule',   href: '/university/timetable',        icon: 'Calendar',          permission: 'timetable.read' },
    { group: 'People',     label: 'Students',          href: '/university/students',         icon: 'Users',             permission: 'student.read' },
    { group: 'People',     label: 'Faculty / Staff',   href: '/university/teachers',         icon: 'GraduationCap',     permission: 'teacher.read' },
    { group: 'People',     label: 'Admissions',        href: '/university/admissions',       icon: 'ClipboardList',     permission: 'admission.read' },
    { group: 'Operations', label: 'Attendance',        href: '/university/attendance',       icon: 'CheckSquare',       permission: 'attendance.read' },
    { group: 'Operations', label: 'Staff Attendance',  href: '/university/staff-attendance', icon: 'UserCheck',         permission: 'attendance.read' },
    { group: 'Operations', label: 'Examinations',      href: '/university/exams',            icon: 'ClipboardCheck',    permission: 'exam.read' },
    { group: 'Research',   label: 'Research Modules',  href: '/university/research',         icon: 'FlaskConical',      permission: 'subject.read' },
    { group: 'Finance',    label: 'Fees',              href: '/university/fees',             icon: 'CreditCard',        permission: 'fee.read' },
    { group: 'Finance',    label: 'Fee Templates',     href: '/university/fee-templates',    icon: 'Receipt',           permission: 'fee_template.read' },
    { group: 'Finance',    label: 'Payroll',           href: '/university/payroll',          icon: 'DollarSign',        permission: 'payroll.read' },
    { group: 'Finance',    label: 'Reports',           href: '/university/reports',          icon: 'BarChart2',         permission: 'report.financial' },
    { group: 'Comms',      label: 'Notices',           href: '/university/notices',          icon: 'Bell',              permission: 'notice.read' },
    { group: 'Admin',      label: 'Campuses',          href: '/university/branches',         icon: 'Building2',         permission: 'branch.read',  requiresBranches: true },
    { group: 'Admin',      label: 'Roles',             href: '/university/roles',            icon: 'Shield',            permission: 'role.read' },
    { group: 'Admin',      label: 'Users',             href: '/university/users',            icon: 'UserCog',           permission: 'user.read' },
    { group: 'Admin',      label: 'Settings',          href: '/university/settings',         icon: 'Settings',          permission: 'school.settings' },
  ],
};

// ─────────────────────────────────────────────────────────────────────────────
// DASHBOARD PATHS — login ke baad kidhar redirect karein
// ─────────────────────────────────────────────────────────────────────────────
export const DASHBOARD_PATHS = {
  school:     '/school/dashboard',
  coaching:   '/coaching/dashboard',
  academy:    '/academy/dashboard',
  college:    '/college/dashboard',
  university: '/university/dashboard',
  default:    '/dashboard',
  master:     '/master-admin',
};

export const ROUTE_PREFIXES = ['school', 'coaching', 'academy', 'college', 'university'];

// ─────────────────────────────────────────────────────────────────────────────
// FEE STRUCTURE per type
// ─────────────────────────────────────────────────────────────────────────────
export const FEE_STRUCTURE = {
  school: {
    period_label: 'Month',
    periods: ['January','February','March','April','May','June','July','August','September','October','November','December'],
    typical_components: ['Tuition Fee', 'Transport Fee', 'Library Fee', 'Lab Fee', 'Exam Fee'],
  },
  coaching: {
    period_label: 'Course',
    periods: null,
    typical_components: ['Course Fee', 'Study Material', 'Mock Test Fee', 'Registration Fee'],
  },
  academy: {
    period_label: 'Module',
    periods: null,
    typical_components: ['Module Fee', 'Lab Access', 'Certificate Fee', 'Registration Fee'],
  },
  college: {
    period_label: 'Semester',
    periods: ['1st Semester','2nd Semester','3rd Semester','4th Semester','5th Semester','6th Semester','7th Semester','8th Semester'],
    typical_components: ['Tuition Fee', 'Admission Fee', 'Library Fee', 'Exam Fee', 'Lab Fee', 'Sports Fee'],
  },
  university: {
    period_label: 'Semester',
    periods: ['1st Semester','2nd Semester','3rd Semester','4th Semester','5th Semester','6th Semester','7th Semester','8th Semester'],
    typical_components: ['Tuition Fee', 'Research Fee', 'Library Fee', 'Exam Fee', 'Lab Fee', 'Hostel Fee'],
  },
};

// ─────────────────────────────────────────────────────────────────────────────
// ATTENDANCE MODES per type
// ─────────────────────────────────────────────────────────────────────────────
export const ATTENDANCE_CONFIG = {
  school:     { mode: 'subject_wise',  label: 'Subject-wise Attendance',       group_by: 'class_section' },
  coaching:   { mode: 'session_wise',  label: 'Session-wise Attendance',       group_by: 'batch'         },
  academy:    { mode: 'module_wise',   label: 'Module-wise Attendance',        group_by: 'batch'         },
  college:    { mode: 'subject_wise',  label: 'Subject Attendance (75% rule)', group_by: 'program_semester' },
  university: { mode: 'course_wise',   label: 'Course-wise Attendance',        group_by: 'program_semester' },
};

// ─────────────────────────────────────────────────────────────────────────────
// STUDENT LIST COLUMNS per type
// ─────────────────────────────────────────────────────────────────────────────
export const STUDENT_LIST_COLUMNS = {
  school: [
    { key: 'name',          label: 'Name' },
    { key: 'roll_number',   label: 'Roll No.' },
    { key: 'class_name',    label: 'Class' },
    { key: 'section_name',  label: 'Section' },
    { key: 'guardian_name', label: 'Guardian' },
    { key: 'fee_status',    label: 'Fee Status' },
    { key: 'is_active',     label: 'Status' },
  ],
  coaching: [
    { key: 'name',          label: 'Candidate Name' },
    { key: 'roll_number',   label: 'Candidate ID' },
    { key: 'course_name',   label: 'Course' },
    { key: 'batch_name',    label: 'Batch' },
    { key: 'target_exam',   label: 'Target Exam' },
    { key: 'fee_status',    label: 'Fee Status' },
    { key: 'is_active',     label: 'Status' },
  ],
  academy: [
    { key: 'name',          label: 'Trainee Name' },
    { key: 'roll_number',   label: 'Trainee ID' },
    { key: 'program_name',  label: 'Program' },
    { key: 'batch_name',    label: 'Batch' },
    { key: 'module',        label: 'Current Module' },
    { key: 'fee_status',    label: 'Fee Status' },
    { key: 'is_active',     label: 'Status' },
  ],
  college: [
    { key: 'name',          label: 'Student Name' },
    { key: 'roll_number',   label: 'Enrollment No.' },
    { key: 'department',    label: 'Department' },
    { key: 'program_name',  label: 'Program' },
    { key: 'semester',      label: 'Semester' },
    { key: 'fee_status',    label: 'Fee Status' },
    { key: 'is_active',     label: 'Status' },
  ],
  university: [
    { key: 'name',          label: 'Student Name' },
    { key: 'roll_number',   label: 'Reg. No.' },
    { key: 'faculty',       label: 'Faculty' },
    { key: 'department',    label: 'Department' },
    { key: 'program_name',  label: 'Program' },
    { key: 'semester',      label: 'Semester' },
    { key: 'cgpa',          label: 'CGPA' },
    { key: 'fee_status',    label: 'Fee Status' },
    { key: 'is_active',     label: 'Status' },
  ],
};

// ─────────────────────────────────────────────────────────────────────────────
// MAIN EXPORT — getInstituteConfig(type)
// ─────────────────────────────────────────────────────────────────────────────
export function getInstituteConfig(instituteType = 'school') {
  const type = INSTITUTE_TYPES.find((t) => t.value === instituteType) ?? INSTITUTE_TYPES[0];
  return {
    type:               instituteType,
    typeDefinition:     type,
    terms:              TERMS[instituteType]              ?? TERMS.school,
    nav:                NAV[instituteType]                ?? NAV.school,
    dashboardPath:      DASHBOARD_PATHS[instituteType]   ?? DASHBOARD_PATHS.default,
    feeStructure:       FEE_STRUCTURE[instituteType]     ?? FEE_STRUCTURE.school,
    attendanceConfig:   ATTENDANCE_CONFIG[instituteType] ?? ATTENDANCE_CONFIG.school,
    studentColumns:     STUDENT_LIST_COLUMNS[instituteType] ?? STUDENT_LIST_COLUMNS.school,
  };
}

/** Quick helper: given a full pathname, extract the institute type prefix */
export function getTypeFromPath(pathname = '') {
  for (const prefix of ROUTE_PREFIXES) {
    if (pathname.startsWith(`/${prefix}`)) return prefix;
  }
  return null;
}

export default {
  TERMS,
  NAV,
  DASHBOARD_PATHS,
  ROUTE_PREFIXES,
  FEE_STRUCTURE,
  ATTENDANCE_CONFIG,
  STUDENT_LIST_COLUMNS,
  getInstituteConfig,
  getTypeFromPath,
};
```

---

### `src/hooks/useInstituteConfig.js`

```js
/**
 * useInstituteConfig — Custom React Hook
 *
 * Zustand authStore se logged-in user ka institute_type padhke
 * uske liye complete config return karta hai:
 *   terms, nav, dashboardPath, feeStructure, attendanceConfig, studentColumns
 *
 * Usage:
 *   const { terms, nav, dashboardPath } = useInstituteConfig();
 *   <h1>{terms.students}</h1>   → "Students" | "Candidates" | "Trainees" etc.
 */

'use client';

import { useMemo } from 'react';
import { usePathname } from 'next/navigation';
import useAuthStore from '@/store/authStore';
import { getInstituteConfig, getTypeFromPath } from '@/config/instituteConfig';

export default function useInstituteConfig() {
  const user = useAuthStore((s) => s.user);
  const pathname = usePathname();

  const config = useMemo(() => {
    // 1st priority: user object mein institute_type stored hai
    const fromUser = user?.institute_type || user?.school?.institute_type || user?.institute?.institute_type;

    // 2nd priority: current URL path se detect karein (/coaching/dashboard → 'coaching')
    const fromPath = getTypeFromPath(pathname);

    const resolvedType = fromUser || fromPath || 'school';
    return getInstituteConfig(resolvedType);
  }, [user, pathname]);

  return config;
}

/**
 * useTerm(key) — sirf ek term chahiye ho to shorthand
 *
 * Usage:
 *   const studentLabel = useTerm('students');  → 'Candidates'
 */
export function useTerm(key) {
  const { terms } = useInstituteConfig();
  return terms[key] ?? key;
}

/**
 * useInstituteNav() — filtered nav items (permission-aware)
 *
 * Usage:
 *   const navItems = useInstituteNav();
 */
export function useInstituteNav() {
  const { nav } = useInstituteConfig();
  const canDo             = useAuthStore((s) => s.canDo);
  const schoolHasBranches = useAuthStore((s) => s.schoolHasBranches);

  return useMemo(
    () =>
      nav.filter((item) => {
        if (item.permission && !canDo(item.permission)) return false;
        if (item.requiresBranches && !schoolHasBranches()) return false;
        return true;
      }),
    [nav, canDo, schoolHasBranches],
  );
}
```

---

### `src/app/student/layout.jsx` · `src/app/parent/layout.jsx` · `src/app/teacher/layout.jsx`

```jsx
// student/layout.jsx
import PortalShell from '@/components/portal/PortalShell';

export const metadata = {
  title: 'Student Portal — The Clouds Academy',
  description: 'View your attendance, fees, exam results and timetable.',
};

export default function StudentLayout({ children }) {
  return <PortalShell type="STUDENT">{children}</PortalShell>;
}

// parent/layout.jsx
import PortalShell from '@/components/portal/PortalShell';

export const metadata = {
  title: 'Parent Portal — The Clouds Academy',
  description: "Monitor your child's attendance, fees, and academic performance.",
};

export default function ParentLayout({ children }) {
  return <PortalShell type="PARENT">{children}</PortalShell>;
}

// teacher/layout.jsx
import PortalShell from '@/components/portal/PortalShell';

export const metadata = { title: 'Teacher Portal – The Clouds Academy' };

export default function TeacherLayout({ children }) {
  return <PortalShell type="TEACHER">{children}</PortalShell>;
}
```

---

### `src/app/portal-login/page.jsx`

```jsx
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import Cookies from 'js-cookie';
import Link from 'next/link';
import {
  GraduationCap, Users, BookOpen, Eye, EyeOff,
  ArrowLeft, CheckCircle, Mail, Lock, Briefcase,
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import usePortalStore from '@/store/portalStore';
import { dummyPortalLogin, PORTAL_DEMO_ACCOUNTS } from '@/data/portalDummyData';

const schema = z.object({
  email:    z.string().email('Enter a valid email'),
  password: z.string().min(4, 'Minimum 4 characters'),
});

const PORTAL_TYPES = [
  {
    type: 'PARENT',
    icon: Users,
    label: 'Parent Portal',
    tagline: "Track your child's progress",
    color: 'indigo',
    gradient: 'from-indigo-600 to-violet-600',
    bg: 'bg-indigo-50',
    ic: 'text-indigo-600',
    border: 'border-indigo-200',
    activeBg: 'bg-gradient-to-r from-indigo-600 to-violet-600',
    demoHint: `parent@tca.edu.pk / parent@123`,
    redirectTo: '/parent',
    features: ['Child attendance', 'Fee status', 'Exam results', 'Announcements'],
  },
  {
    type: 'STUDENT',
    icon: BookOpen,
    label: 'Student Portal',
    tagline: 'View your own academic data',
    color: 'emerald',
    gradient: 'from-emerald-600 to-teal-600',
    bg: 'bg-emerald-50',
    ic: 'text-emerald-600',
    border: 'border-emerald-200',
    activeBg: 'bg-gradient-to-r from-emerald-600 to-teal-600',
    demoHint: `ali@student.tca / student@123`,
    redirectTo: '/student',
    features: ['My attendance', 'My fee record', 'My exam results', 'Class timetable'],
  },
  {
    type: 'TEACHER',
    icon: Briefcase,
    label: 'Teacher Portal',
    tagline: 'Manage your classes & students',
    color: 'blue',
    gradient: 'from-blue-600 to-sky-600',
    bg: 'bg-blue-50',
    ic: 'text-blue-600',
    border: 'border-blue-200',
    activeBg: 'bg-gradient-to-r from-blue-600 to-sky-600',
    demoHint: `hassan@teacher.tca / teacher@123`,
    redirectTo: '/teacher',
    features: ['My classes & subjects', 'Upload notes', 'Assign homework', 'Mark attendance'],
  },
];

const INSTITUTE_TABS = [
  { value: 'school',     label: 'School'     },
  { value: 'coaching',   label: 'Coaching'   },
  { value: 'academy',    label: 'Academy'    },
  { value: 'college',    label: 'College'    },
  { value: 'university', label: 'University' },
];

const ROLE_STYLES = {
  PARENT:  { icon: Users,     bg: 'bg-indigo-100',  ic: 'text-indigo-600'  },
  STUDENT: { icon: BookOpen,  bg: 'bg-emerald-100', ic: 'text-emerald-600' },
  TEACHER: { icon: Briefcase, bg: 'bg-blue-100',    ic: 'text-blue-600'    },
};

export default function PortalLoginPage() {
  const router = useRouter();
  const setPortalUser = usePortalStore((s) => s.setPortalUser);
  const [activeType, setActiveType] = useState('PARENT');
  const [loading, setLoading] = useState(false);
  const [showPass, setShowPass] = useState(false);
  const [demoInstitute, setDemoInstitute] = useState('academy');

  const activePt = PORTAL_TYPES.find((p) => p.type === activeType);

  const { register, handleSubmit, setValue, formState: { errors } } = useForm({
    resolver: zodResolver(schema),
  });

  const onSubmit = async (data) => {
    try {
      setLoading(true);
      const result = dummyPortalLogin({ ...data, type: activeType });
      setPortalUser(result.user, result.portal_type, result.institute_type);
      Cookies.set('portal_token', result.token, { expires: 1 });
      Cookies.set('portal_type', result.portal_type, { expires: 1 });
      toast.success(`Welcome, ${result.user.name || result.user.first_name}!`);
      router.replace(activePt.redirectTo);
    } catch (err) {
      toast.error(err?.message || 'Login failed. Check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="min-h-screen flex flex-col"
      style={{
        background: activeType === 'PARENT'
          ? 'linear-gradient(135deg, #1e1b4b 0%, #312e81 50%, #1e40af 100%)'
          : activeType === 'TEACHER'
          ? 'linear-gradient(135deg, #0c1a2e 0%, #1e3a5f 50%, #1d4ed8 100%)'
          : 'linear-gradient(135deg, #064e3b 0%, #065f46 50%, #0f766e 100%)',
        transition: 'background 0.5s ease',
      }}
    >
      {/* Background grid */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.04)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.04)_1px,transparent_1px)] bg-[size:50px_50px]" />

      <div className="relative z-10 p-4">
        <Link href="/" className="inline-flex items-center gap-2 text-sm text-white/70 hover:text-white transition-colors">
          <ArrowLeft className="w-4 h-4" />
          Back to Home
        </Link>
      </div>

      <div className="relative flex-1 flex items-center justify-center px-4 py-8">
        <div className="w-full max-w-4xl grid lg:grid-cols-5 gap-8 items-center">

          {/* LEFT — Info panel */}
          <div className="lg:col-span-2 text-white hidden lg:block">
            <div className="flex items-center gap-3 mb-8">
              <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
                <GraduationCap className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="font-bold text-sm leading-tight">The Clouds Academy</p>
                <p className="text-white/60 text-xs">Student Information System</p>
              </div>
            </div>
            <h1 className="text-3xl font-extrabold mb-3 leading-tight">{activePt.label}</h1>
            <p className="text-white/70 text-sm mb-7">{activePt.tagline}</p>
            <ul className="space-y-3">
              {activePt.features.map((f) => (
                <li key={f} className="flex items-center gap-3 text-sm">
                  <CheckCircle className="w-4 h-4 text-white/60 flex-shrink-0" />
                  <span className="text-white/80">{f}</span>
                </li>
              ))}
            </ul>
            <div className="mt-8 p-4 bg-white/10 rounded-xl border border-white/20">
              <p className="text-xs font-semibold text-white/60 uppercase tracking-wider mb-2">Demo Credentials</p>
              <p className="text-sm font-mono text-white/90">{activePt.demoHint}</p>
            </div>
          </div>

          {/* RIGHT — Login card */}
          <div className="lg:col-span-3 bg-white rounded-2xl shadow-2xl overflow-hidden">
            {/* Portal type switcher tabs */}
            <div className="grid grid-cols-3">
              {PORTAL_TYPES.map((pt) => {
                const Icon = pt.icon;
                const isActive = pt.type === activeType;
                return (
                  <button
                    key={pt.type}
                    onClick={() => setActiveType(pt.type)}
                    className={`flex items-center justify-center gap-2.5 py-4 text-sm font-semibold transition-all duration-200 ${
                      isActive ? `${pt.activeBg} text-white` : 'bg-slate-50 text-slate-500 hover:bg-slate-100'
                    }`}
                  >
                    <Icon className={`w-4 h-4 ${isActive ? 'text-white' : ''}`} />
                    {pt.label}
                  </button>
                );
              })}
            </div>

            {/* Form */}
            <div className="p-8">
              <div className="mb-6">
                <h2 className="text-xl font-bold text-slate-900">Sign in to {activePt.label}</h2>
                <p className="text-sm text-slate-500 mt-1">
                  {activeType === 'PARENT'
                    ? 'Enter your registered parent account credentials'
                    : activeType === 'TEACHER'
                    ? 'Enter your teacher account credentials'
                    : 'Enter your student login credentials'}
                </p>
              </div>

              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <div>
                  <Label htmlFor="email" className="text-sm font-semibold text-slate-700">Email Address</Label>
                  <div className="relative mt-1.5">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <Input
                      id="email"
                      type="email"
                      placeholder={activeType === 'PARENT' ? 'parent@tca.edu.pk' : activeType === 'TEACHER' ? 'hassan@teacher.tca' : 'ali@student.tca'}
                      className="pl-10"
                      {...register('email')}
                    />
                  </div>
                  {errors.email && <p className="text-xs text-red-500 mt-1">{errors.email.message}</p>}
                </div>

                <div>
                  <Label htmlFor="password" className="text-sm font-semibold text-slate-700">Password</Label>
                  <div className="relative mt-1.5">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <Input
                      id="password"
                      type={showPass ? 'text' : 'password'}
                      placeholder="Enter your password"
                      className="pl-10 pr-10"
                      {...register('password')}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPass(!showPass)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                    >
                      {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  {errors.password && <p className="text-xs text-red-500 mt-1">{errors.password.message}</p>}
                </div>

                <Button
                  type="submit"
                  disabled={loading}
                  className={`w-full font-semibold py-5 ${
                    activeType === 'PARENT'
                      ? 'bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700'
                      : activeType === 'TEACHER'
                      ? 'bg-gradient-to-r from-blue-600 to-sky-600 hover:from-blue-700 hover:to-sky-700'
                      : 'bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700'
                  } text-white`}
                >
                  {loading ? 'Signing in...' : `Sign in to ${activePt.label}`}
                </Button>
              </form>

              {/* Quick Demo Login section */}
              <div className="mt-5 pt-5 border-t border-slate-100">
                <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-2.5">Quick Demo Login</p>

                {/* Institute type tabs */}
                <div className="flex flex-wrap gap-1.5 mb-3">
                  {INSTITUTE_TABS.map((tab) => (
                    <button
                      key={tab.value}
                      type="button"
                      onClick={() => setDemoInstitute(tab.value)}
                      className={`px-2.5 py-1 rounded-full text-[11px] font-semibold transition-all ${
                        demoInstitute === tab.value ? 'bg-slate-800 text-white' : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
                      }`}
                    >
                      {tab.label}
                    </button>
                  ))}
                </div>

                {/* Demo account cards — 3 per institute type (PARENT / STUDENT / TEACHER) */}
                <div className="grid grid-cols-3 gap-2">
                  {PORTAL_DEMO_ACCOUNTS.filter((a) => a.institute_type === demoInstitute).map((acc) => {
                    const rs = ROLE_STYLES[acc.role];
                    const Icon = rs.icon;
                    return (
                      <button
                        key={acc.email}
                        type="button"
                        onClick={() => {
                          setActiveType(acc.role);
                          setValue('email', acc.email);
                          setValue('password', acc.password);
                          toast.success(`${acc.role.charAt(0) + acc.role.slice(1).toLowerCase()} account filled!`);
                        }}
                        className="flex flex-col items-center gap-1.5 p-3 rounded-xl border border-slate-200 hover:border-slate-400 bg-slate-50 hover:bg-white hover:shadow-sm transition-all text-center"
                      >
                        <div className={`w-8 h-8 rounded-lg ${rs.bg} flex items-center justify-center`}>
                          <Icon className={`w-4 h-4 ${rs.ic}`} />
                        </div>
                        <p className="text-[11px] font-bold text-slate-800 leading-tight">{acc.name.split(' ')[0]}</p>
                        <p className="text-[10px] text-slate-400 capitalize leading-none">{acc.role.toLowerCase()}</p>
                        <p className="text-[9px] text-slate-300 leading-none font-mono">{acc.password}</p>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="mt-6 pt-5 border-t border-slate-100 text-center">
                <p className="text-sm text-slate-500">
                  Are you a school staff member?{' '}
                  <Link href="/login" className="text-indigo-600 font-semibold hover:underline">Staff Login</Link>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
```

---

### `src/store/portalStore.js`

```js
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

const usePortalStore = create(
  persist(
    (set, get) => ({
      portalUser:    null,
      portalType:    null,          // 'PARENT' | 'STUDENT' | 'TEACHER'
      instituteType: null,          // 'school' | 'coaching' | 'academy' | 'college' | 'university'

      setPortalUser: (user, type, instType) =>
        set({
          portalUser:    user,
          portalType:    type,
          // Prefer explicit arg, fallback to data on user object, default 'school'
          instituteType: instType || user?.institute_type || 'school',
        }),

      clearPortal: () => set({ portalUser: null, portalType: null, instituteType: null }),

      /** Convenience getter — always returns a non-null string */
      getInstituteType: () =>
        get().instituteType || get().portalUser?.institute_type || 'school',
    }),
    {
      name: 'portal-session',
    },
  ),
);

export default usePortalStore;
```

---

### `src/constants/portalInstituteConfig.js`

```js
/**
 * portalInstituteConfig.js
 *
 * Per-institute-type terminology map for the three portals
 * (Student, Parent, Teacher).
 *
 * Usage:
 *   import { getPortalTerms } from '@/constants/portalInstituteConfig';
 *   const t = getPortalTerms(portalUser?.institute_type);
 *   // then: t.classLabel, t.subjectLabel, t.nav.classes, …
 */

const CONFIG = {
  school: {
    classLabel: 'Class',           classesLabel: 'Classes',
    batchLabel: 'Section',         subjectLabel: 'Subject',       subjectsLabel: 'Subjects',
    rollLabel: 'Roll No.',         examLabel: 'Exam',             examsLabel: 'Exams',
    timetableLabel: 'Timetable',   syllabusLabel: 'Syllabus',
    teacherLabel: 'Teacher',       instructorLabel: 'Teacher',
    studentLabel: 'Student',       studentsLabel: 'Students',
    feeLabel: 'Fee',               feesLabel: 'Fees',
    assignmentLabel: 'Assignment', assignmentsLabel: 'Assignments',
    homeworkLabel: 'Homework Diary', notesLabel: 'Notes',
    marksLabel: 'Marks',           gradeLabel: 'Grade',
    resultLabel: 'Result',         resultsLabel: 'Exam Results',
    attendanceLabel: 'Attendance', announcementsLabel: 'Announcements',
    overviewLabel: 'Overview',
    nav: {
      overview: 'Overview',        classes: 'My Classes',      students: 'My Students',
      notes: 'Notes',              assignments: 'Assignments', homework: 'Homework & Diary',
      attendance: 'Mark Attendance', myAttend: 'My Attendance', timetable: 'Timetable',
      syllabus: 'Syllabus',        exams: 'My Exams',          fees: 'My Fees',
      results: 'Exam Results',     announcements: 'Announcements',
    },
  },

  coaching: {
    classLabel: 'Batch',           classesLabel: 'Batches',
    batchLabel: 'Group',           subjectLabel: 'Course',        subjectsLabel: 'Courses',
    rollLabel: 'Reg. No.',         examLabel: 'Test',             examsLabel: 'Tests',
    timetableLabel: 'Schedule',    syllabusLabel: 'Course Outline',
    teacherLabel: 'Instructor',    instructorLabel: 'Instructor',
    studentLabel: 'Student',       studentsLabel: 'Students',
    feeLabel: 'Fee',               feesLabel: 'Fees',
    assignmentLabel: 'Practice Set', assignmentsLabel: 'Practice Sets',
    homeworkLabel: 'Daily Tasks',  notesLabel: 'Study Material',
    marksLabel: 'Marks',           gradeLabel: 'Grade',
    resultLabel: 'Result',         resultsLabel: 'Test Results',
    attendanceLabel: 'Attendance', announcementsLabel: 'Announcements',
    overviewLabel: 'Overview',
    nav: {
      overview: 'Overview',        classes: 'My Batches',      students: 'My Students',
      notes: 'Study Material',     assignments: 'Practice Sets', homework: 'Daily Tasks',
      attendance: 'Mark Attendance', myAttend: 'My Attendance', timetable: 'Schedule',
      syllabus: 'Course Outline',  exams: 'My Tests',          fees: 'My Fees',
      results: 'Test Results',     announcements: 'Announcements',
    },
  },

  academy: {
    classLabel: 'Batch',           classesLabel: 'Batches',
    batchLabel: 'Group',           subjectLabel: 'Course',        subjectsLabel: 'Courses',
    rollLabel: 'Student ID',       examLabel: 'Assessment',       examsLabel: 'Assessments',
    timetableLabel: 'Schedule',    syllabusLabel: 'Course Outline',
    teacherLabel: 'Instructor',    instructorLabel: 'Instructor',
    studentLabel: 'Trainee',       studentsLabel: 'Trainees',
    feeLabel: 'Fee',               feesLabel: 'Fees',
    assignmentLabel: 'Assignment', assignmentsLabel: 'Assignments',
    homeworkLabel: 'Practice Tasks', notesLabel: 'Course Material',
    marksLabel: 'Score',           gradeLabel: 'Grade',
    resultLabel: 'Result',         resultsLabel: 'Assessment Results',
    attendanceLabel: 'Attendance', announcementsLabel: 'Announcements',
    overviewLabel: 'Overview',
    nav: {
      overview: 'Overview',        classes: 'My Batches',      students: 'My Trainees',
      notes: 'Course Material',    assignments: 'Assignments', homework: 'Practice Tasks',
      attendance: 'Mark Attendance', myAttend: 'My Attendance', timetable: 'Schedule',
      syllabus: 'Course Outline',  exams: 'My Assessments',   fees: 'My Fees',
      results: 'Assessment Results', announcements: 'Announcements',
    },
  },

  college: {
    classLabel: 'Class',           classesLabel: 'Classes',
    batchLabel: 'Section',         subjectLabel: 'Subject',        subjectsLabel: 'Subjects',
    rollLabel: 'Roll No.',         examLabel: 'Exam',              examsLabel: 'Exams',
    timetableLabel: 'Timetable',   syllabusLabel: 'Syllabus',
    teacherLabel: 'Lecturer',      instructorLabel: 'Lecturer',
    studentLabel: 'Student',       studentsLabel: 'Students',
    feeLabel: 'Fee',               feesLabel: 'Fees',
    assignmentLabel: 'Assignment', assignmentsLabel: 'Assignments',
    homeworkLabel: 'Tasks & Diary', notesLabel: 'Lecture Notes',
    marksLabel: 'Marks',           gradeLabel: 'Grade',
    resultLabel: 'Result',         resultsLabel: 'Exam Results',
    attendanceLabel: 'Attendance', announcementsLabel: 'Announcements',
    overviewLabel: 'Overview',
    nav: {
      overview: 'Overview',        classes: 'My Classes',      students: 'My Students',
      notes: 'Lecture Notes',      assignments: 'Assignments', homework: 'Tasks & Diary',
      attendance: 'Mark Attendance', myAttend: 'My Attendance', timetable: 'Timetable',
      syllabus: 'Syllabus',        exams: 'My Exams',          fees: 'My Fees',
      results: 'Exam Results',     announcements: 'Announcements',
    },
  },

  university: {
    classLabel: 'Program',         classesLabel: 'Courses',
    batchLabel: 'Section',         subjectLabel: 'Course',         subjectsLabel: 'Courses',
    rollLabel: 'Student ID',       examLabel: 'Exam',              examsLabel: 'Exams',
    timetableLabel: 'Schedule',    syllabusLabel: 'Course Outline',
    teacherLabel: 'Professor',     instructorLabel: 'Professor',
    studentLabel: 'Student',       studentsLabel: 'Students',
    feeLabel: 'Tuition Fee',       feesLabel: 'Tuition Fees',
    assignmentLabel: 'Assignment', assignmentsLabel: 'Assignments',
    homeworkLabel: 'Tasks',        notesLabel: 'Lecture Notes',
    marksLabel: 'Marks',           gradeLabel: 'GPA',
    resultLabel: 'Result',         resultsLabel: 'Academic Results',
    attendanceLabel: 'Attendance', announcementsLabel: 'Announcements',
    overviewLabel: 'Dashboard',
    nav: {
      overview: 'Dashboard',       classes: 'My Courses',      students: 'My Students',
      notes: 'Lecture Notes',      assignments: 'Assignments', homework: 'Tasks',
      attendance: 'Mark Attendance', myAttend: 'My Attendance', timetable: 'Schedule',
      syllabus: 'Course Outline',  exams: 'My Exams',          fees: 'My Fees',
      results: 'Academic Results', announcements: 'Notices',
    },
  },
};

/**
 * Returns the terminology config for a given institute type.
 * Falls back to 'school' if no match found.
 */
export function getPortalTerms(instituteType) {
  return CONFIG[instituteType] || CONFIG.school;
}

export default CONFIG;
```

---

### `src/components/portal/PortalShell.jsx`

```jsx
/**
 * PortalShell — shared layout wrapper for Student / Parent / Teacher portals.
 *
 * Props:
 *   type  'STUDENT' | 'PARENT' | 'TEACHER'
 *
 * Features:
 *  - Colored sidebar header per portal type (indigo / emerald / blue)
 *  - Nav items built dynamically from portalInstituteConfig terminology
 *  - Mobile overlay drawer + desktop fixed sidebar
 *  - Logout clears Zustand portalStore + cookies → redirects /portal-login
 */
'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import Cookies from 'js-cookie';
import { toast } from 'sonner';
import {
  GraduationCap, LayoutDashboard, Calendar, DollarSign,
  BookOpen, Bell, Clock, LogOut, Menu, X, ChevronDown, Users,
  Briefcase, FileText, ClipboardList, NotebookPen, UserCheck, BookMarked,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import usePortalStore from '@/store/portalStore';
import { getPortalTerms } from '@/constants/portalInstituteConfig';

// ─── Nav builders (terminology-aware) ────────────────────────────────────────
function buildParentNav(t) {
  return [
    { label: t.nav.overview,      href: '/parent',               icon: LayoutDashboard },
    { label: t.attendanceLabel,   href: '/parent/attendance',    icon: Calendar },
    { label: t.feesLabel,         href: '/parent/fees',          icon: DollarSign },
    { label: t.resultsLabel,      href: '/parent/results',       icon: BookOpen },
    { label: t.nav.announcements, href: '/parent/announcements', icon: Bell },
  ];
}

function buildStudentNav(t) {
  return [
    { label: t.nav.overview,      href: '/student',               icon: LayoutDashboard },
    { label: t.nav.myAttend,      href: '/student/attendance',    icon: Calendar },
    { label: t.nav.exams,         href: '/student/exams',         icon: BookOpen },
    { label: t.nav.timetable,     href: '/student/timetable',     icon: Clock },
    { label: t.nav.syllabus,      href: '/student/syllabus',      icon: BookMarked },
    { label: t.nav.assignments,   href: '/student/assignments',   icon: ClipboardList },
    { label: t.nav.homework,      href: '/student/homework',      icon: NotebookPen },
    { label: t.nav.announcements, href: '/student/announcements', icon: Bell },
  ];
}

function buildTeacherNav(t) {
  return [
    { label: t.nav.overview,      href: '/teacher',               icon: LayoutDashboard },
    { label: t.nav.classes,       href: '/teacher/classes',       icon: Briefcase },
    { label: t.nav.students,      href: '/teacher/students',      icon: Users },
    { label: t.notesLabel,        href: '/teacher/notes',         icon: FileText },
    { label: t.nav.assignments,   href: '/teacher/assignments',   icon: ClipboardList },
    { label: t.nav.homework,      href: '/teacher/homework',      icon: NotebookPen },
    { label: t.nav.attendance,    href: '/teacher/attendance',    icon: UserCheck },
    { label: t.nav.announcements, href: '/teacher/announcements', icon: Bell },
  ];
}
// ─────────────────────────────────────────────────────────────────────────────

export default function PortalShell({ children, type }) {
  const pathname = usePathname();
  const router   = useRouter();
  const { portalUser, clearPortal, getInstituteType } = usePortalStore();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const instituteType = getInstituteType ? getInstituteType() : (portalUser?.institute_type || 'school');
  const t = getPortalTerms(instituteType);

  const isParent  = type === 'PARENT';
  const isTeacher = type === 'TEACHER';

  const navItems = isParent ? buildParentNav(t) : isTeacher ? buildTeacherNav(t) : buildStudentNav(t);

  const themeClasses = isParent
    ? { activeBg: 'bg-indigo-50 text-indigo-700 border-l-2 border-indigo-600',   sidebarHeader: 'bg-gradient-to-b from-indigo-700 to-indigo-800', badge: 'bg-indigo-100 text-indigo-700' }
    : isTeacher
    ? { activeBg: 'bg-blue-50 text-blue-700 border-l-2 border-blue-600',         sidebarHeader: 'bg-gradient-to-b from-blue-700 to-sky-800',      badge: 'bg-blue-100 text-blue-700' }
    : { activeBg: 'bg-emerald-50 text-emerald-700 border-l-2 border-emerald-600', sidebarHeader: 'bg-gradient-to-b from-emerald-700 to-emerald-800', badge: 'bg-emerald-100 text-emerald-700' };

  const displayName = isTeacher
    ? (portalUser ? `${portalUser.first_name} ${portalUser.last_name}` : t.teacherLabel)
    : isParent
    ? (portalUser?.name || 'Parent')
    : (portalUser ? `${portalUser.first_name} ${portalUser.last_name}` : t.studentLabel);

  const displaySub = isTeacher
    ? (portalUser?.designation || t.teacherLabel)
    : isParent
    ? (portalUser?.relation ? `${portalUser.relation} · ${portalUser?.children?.length || 0} child(ren)` : 'Parent Account')
    : (portalUser?.class_name || t.studentLabel);

  const portalLabel = isTeacher ? `${t.teacherLabel} Portal` : isParent ? 'Parent Portal' : `${t.studentLabel} Portal`;

  const handleLogout = () => {
    clearPortal();
    Cookies.remove('portal_token');
    Cookies.remove('portal_type');
    toast.success('Logged out successfully');
    router.replace('/portal-login');
  };

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      {/* Colored sidebar header */}
      <div className={`${themeClasses.sidebarHeader} px-5 py-5`}>
        <div className="flex items-center gap-2.5 mb-4">
          <div className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center">
            <GraduationCap className="w-4 h-4 text-white" />
          </div>
          <div>
            <p className="text-xs font-bold text-white leading-tight">The Clouds Academy</p>
            <p className="text-[10px] text-white/60">{portalLabel}</p>
          </div>
        </div>
        <div className="bg-white/10 rounded-xl px-3 py-3">
          <div className="flex items-center gap-2.5">
            <div className={`w-8 h-8 rounded-full ${isTeacher ? 'bg-blue-400' : isParent ? 'bg-indigo-400' : 'bg-emerald-400'} flex items-center justify-center text-white text-xs font-bold flex-shrink-0`}>
              {displayName[0]}
            </div>
            <div className="min-w-0">
              <p className="text-xs font-semibold text-white truncate">{displayName}</p>
              <p className="text-[10px] text-white/60 truncate">{displaySub}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Nav links */}
      <nav className="flex-1 px-3 py-4 overflow-y-auto space-y-0.5">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setSidebarOpen(false)}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150 ${
                isActive ? themeClasses.activeBg : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
              }`}
            >
              <Icon className={`w-4 h-4 flex-shrink-0 ${isActive ? '' : 'opacity-70'}`} />
              {item.label}
            </Link>
          );
        })}
      </nav>

      {/* Logout footer */}
      <div className="px-3 py-4 border-t border-slate-100">
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 w-full px-3 py-2.5 text-sm font-medium text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
        >
          <LogOut className="w-4 h-4" />
          Sign Out
        </button>
      </div>
    </div>
  );

  return (
    <div className="flex h-screen overflow-hidden bg-slate-50">
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex md:flex-col w-60 bg-white border-r border-slate-200 flex-shrink-0">
        <SidebarContent />
      </aside>

      {/* Mobile Sidebar overlay */}
      {sidebarOpen && (
        <div className="md:hidden fixed inset-0 z-50 flex">
          <div className="fixed inset-0 bg-black/50" onClick={() => setSidebarOpen(false)} />
          <aside className="relative z-10 w-60 bg-white flex flex-col h-full shadow-xl">
            <SidebarContent />
          </aside>
        </div>
      )}

      {/* Main content */}
      <div className="flex flex-col flex-1 overflow-hidden">
        <header className="bg-white border-b border-slate-200 px-4 h-14 flex items-center justify-between flex-shrink-0">
          <div className="flex items-center gap-3">
            <button
              className="md:hidden p-2 rounded-lg text-slate-500 hover:bg-slate-100"
              onClick={() => setSidebarOpen(true)}
            >
              <Menu className="w-5 h-5" />
            </button>
            <div>
              <h1 className="text-sm font-bold text-slate-900">
                {navItems.find((n) => n.href === pathname)?.label || t.overviewLabel}
              </h1>
              <p className="text-xs text-slate-400 hidden sm:block">
                {portalLabel} · The Clouds Academy
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <span className={`hidden sm:inline-flex text-xs font-semibold px-2.5 py-1 rounded-full ${themeClasses.badge}`}>
              {isTeacher ? `👨‍🏫 ${t.teacherLabel}` : isParent ? '👨‍👩‍👧 Parent' : `🎓 ${t.studentLabel}`}
            </span>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleLogout}
              className="text-slate-500 hover:text-red-600 hover:bg-red-50 gap-1.5 text-xs"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Logout</span>
            </Button>
          </div>
        </header>

        <main className="flex-1 overflow-auto p-4 sm:p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
  const pathname  = usePathname();
  const router    = useRouter();

  useEffect(() => { setMounted(true); }, []);

  // Close mobile drawer on route change
  useEffect(() => { setMobileOpen(false); }, [pathname]);

  const user          = useAuthStore((s) => s.user);
  const logout        = useAuthStore((s) => s.logout);
  const dashboardPath = useAuthStore((s) => s.dashboardPath());
  const { typeDefinition } = useInstituteConfig();
  const allNavItems   = useInstituteNav();
  const navItems      = mounted ? allNavItems : [];

  const grouped = navItems.reduce((acc, item) => {
    acc[item.group] = acc[item.group] ?? [];
    acc[item.group].push(item);
    return acc;
  }, {});

  const handleLogout = async () => {
    try { await authService.logout(); } catch (_) { /* ignore */ }
    finally { logout(); router.replace('/login'); toast.success('Logged out'); }
  };

  // ─── Sidebar inner content (shared between desktop + mobile drawer) ──────
  function SidebarContent({ isCollapsed }) {
    return (
      <>
        {/* Logo / Institute name */}
        <div className="flex h-14 shrink-0 items-center gap-2 border-b px-3">
          {typeDefinition && <span className="text-xl">{typeDefinition.icon}</span>}
          {!isCollapsed && (
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold leading-tight">
                {user?.school?.name || user?.institute?.name || 'The Clouds Academy'}
              </p>
              <p className="text-[10px] text-muted-foreground">
                {typeDefinition?.label ?? 'Institute'}
              </p>
            </div>
          )}
          {/* Desktop collapse toggle */}
          <Button
            onClick={() => setCollapsed((v) => !v)}
            className="hidden lg:block ml-auto text-muted-foreground hover:text-foreground shrink-0"
            aria-label="Toggle sidebar"
          >
            <Icons.PanelLeft size={16} />
          </Button>
          {/* Mobile close button */}
          <Button
            onClick={() => setMobileOpen(false)}
            className="lg:hidden ml-auto text-muted-foreground hover:text-foreground shrink-0"
            aria-label="Close menu"
          >
            <Icons.X size={16} />
          </Button>
        </div>

        {/* Nav items */}
        <nav className="flex-1 overflow-y-auto py-2">
          {Object.entries(grouped).map(([group, items]) => (
            <div key={group} className="mb-1">
              {!isCollapsed && (
                <p className="px-4 py-1.5 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                  {group}
                </p>
              )}
              {items.map((item) => {
                const Icon = Icons[item.icon] ?? Icons.Circle;
                const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      'flex items-center gap-3 px-3 py-2 text-sm transition-colors hover:bg-accent hover:text-accent-foreground',
                      isCollapsed ? 'justify-center' : '',
                      isActive ? 'bg-accent text-accent-foreground font-medium' : 'text-muted-foreground',
                    )}
                    title={isCollapsed ? item.label : undefined}
                  >
                    <Icon size={16} className="shrink-0" />
                    {!isCollapsed && <span className="truncate">{item.label}</span>}
                  </Link>
                );
              })}
            </div>
          ))}
        </nav>

        {/* User + logout */}
        <div className="shrink-0 border-t p-3">
          {!isCollapsed ? (
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">
                {user?.first_name?.[0]}{user?.last_name?.[0]}
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-xs font-semibold">{user?.first_name} {user?.last_name}</p>
                <p className="truncate text-[10px] text-muted-foreground">{user?.role?.name}</p>
              </div>
              <button onClick={handleLogout} className="text-muted-foreground hover:text-foreground" title="Logout">
                <Icons.LogOut size={14} />
              </button>
            </div>
          ) : (
            <button
              onClick={handleLogout}
              className="flex w-full justify-center text-muted-foreground hover:text-foreground"
              title="Logout"
            >
              <Icons.LogOut size={16} />
            </button>
          )}
        </div>
      </>
    );
  }

  return (
    <div className="flex h-screen overflow-hidden bg-background">

      {/* ══════ MOBILE OVERLAY BACKDROP ══════ */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={() => setMobileOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* ══════ MOBILE SIDEBAR DRAWER ══════ */}
      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-50 flex w-64 flex-col border-r bg-card transition-transform duration-200 lg:hidden',
          mobileOpen ? 'translate-x-0' : '-translate-x-full',
        )}
      >
        <SidebarContent isCollapsed={false} />
      </aside>

      {/* ══════ DESKTOP SIDEBAR ══════ */}
      <aside
        className={cn(
          'hidden lg:flex flex-col border-r bg-card transition-all duration-200 shrink-0',
          collapsed ? 'w-16' : 'w-60',
        )}
      >
        <SidebarContent isCollapsed={collapsed} />
      </aside>

      {/* ══════════════ MAIN CONTENT ══════════════ */}
      <main className="flex flex-1 flex-col overflow-hidden min-w-0">
        {/* Top Header */}
        <header className="flex h-14 shrink-0 items-center gap-3 border-b bg-card px-4">
          {/* Hamburger — mobile only */}
          <button
            onClick={() => setMobileOpen(true)}
            className="lg:hidden text-muted-foreground hover:text-foreground"
            aria-label="Open menu"
          >
            <Icons.Menu size={20} />
          </button>

          {/* Institute name — mobile breadcrumb */}
          <div className="flex flex-1 items-center gap-3 min-w-0">
            <Link
              href={dashboardPath}
              className="flex items-center gap-1.5 text-muted-foreground hover:text-foreground lg:hidden"
            >
              {typeDefinition && <span className="text-base">{typeDefinition.icon}</span>}
              <span className="truncate text-sm font-semibold">
                {user?.school?.name || user?.institute?.name || 'The Clouds Academy'}
              </span>
            </Link>
          </div>

          <div className="flex shrink-0 items-center gap-2">
            <span className="text-xs text-muted-foreground hidden sm:block">
              {user?.school?.code || user?.institute?.code}
            </span>
          </div>
        </header>

        {/* Page content */}
        <div className="flex-1 overflow-auto p-4 md:p-6">
          {children}
        </div>
      </main>
    </div>
  );
}
```
```

