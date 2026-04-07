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

/**
 * terms: human-readable labels the UI shows based on institute_type
 *  primary_unit   — Class | Course | Program | Program | Faculty
 *  grouping_unit  — Section | Batch  | Batch  | Semester | Department
 *  student_label  — Student / Candidate / Trainee / Student / Student
 *  teacher_label  — Teacher / Instructor / Trainer / Lecturer / Professor
 *  fee_basis      — Monthly | Per Course | Per Module | Per Semester | Per Semester
 *  attendance_basis — Subject-wise | Session-wise | Module-wise | Subject-wise | Subject-wise
 */
const TERMS = {
  school: {
    primary_unit: 'Class',
    primary_unit_pl: 'Classes',
    grouping_unit: 'Section',
    grouping_unit_pl: 'Sections',
    students: 'Students',
    student: 'Student',
    teachers: 'Teachers',
    teacher: 'Teacher',
    enrollment: 'Admission',
    fee_basis: 'Monthly',
    attendance_basis: 'Subject-wise',
    academic_period: 'Academic Year',
    exam_term: 'Exam',
    grade_term: 'Grade',
    curriculum_term: 'Syllabus',
    schedule_term: 'Timetable',
    roll_number: 'Roll Number',
    employee_id: 'Employee ID',
  },

  coaching: {
    primary_unit: 'Course',
    primary_unit_pl: 'Courses',
    grouping_unit: 'Batch',
    grouping_unit_pl: 'Batches',
    students: 'Candidates',
    student: 'Candidate',
    teachers: 'Instructors',
    teacher: 'Instructor',
    enrollment: 'Enrollment',
    fee_basis: 'Course-wise',
    attendance_basis: 'Session-wise',
    academic_period: 'Session',
    exam_term: 'Mock Test',
    grade_term: 'Score',
    curriculum_term: 'Course Content',
    schedule_term: 'Session Schedule',
    roll_number: 'Candidate ID',
    employee_id: 'Staff ID',
  },

  academy: {
    primary_unit: 'Program',
    primary_unit_pl: 'Programs',
    grouping_unit: 'Batch',
    grouping_unit_pl: 'Batches',
    students: 'Trainees',
    student: 'Trainee',
    teachers: 'Trainers',
    teacher: 'Trainer',
    enrollment: 'Registration',
    fee_basis: 'Module-wise',
    attendance_basis: 'Module-wise',
    academic_period: 'Batch Cycle',
    exam_term: 'Assessment',
    grade_term: 'Certificate Level',
    curriculum_term: 'Modules',
    schedule_term: 'Class Schedule',
    roll_number: 'Trainee ID',
    employee_id: 'Trainer ID',
  },

  college: {
    primary_unit: 'Department',
    primary_unit_pl: 'Departments',
    grouping_unit: 'Semester',
    grouping_unit_pl: 'Semesters',
    students: 'Students',
    student: 'Student',
    teachers: 'Lecturers',
    teacher: 'Lecturer',
    enrollment: 'Admission',
    fee_basis: 'Semester-wise',
    attendance_basis: 'Subject-wise',
    academic_period: 'Semester',
    exam_term: 'Examination',
    grade_term: 'CGPA',
    curriculum_term: 'Course Outline',
    schedule_term: 'Lecture Schedule',
    roll_number: 'Enrollment No.',
    employee_id: 'Employee No.',
  },

  university: {
    primary_unit: 'Faculty',
    primary_unit_pl: 'Faculties',
    grouping_unit: 'Department',
    grouping_unit_pl: 'Departments',
    students: 'Students',
    student: 'Student',
    teachers: 'Professors',
    teacher: 'Professor',
    enrollment: 'Admission',
    fee_basis: 'Semester-wise',
    attendance_basis: 'Course-wise',
    academic_period: 'Semester',
    exam_term: 'Examination',
    grade_term: 'CGPA',
    curriculum_term: 'Course Content',
    schedule_term: 'Course Schedule',
    roll_number: 'Reg. No.',
    employee_id: 'Faculty ID',
  },
};

// ─────────────────────────────────────────────────────────────────────────────
// SIDEBAR NAVIGATION — per institute type
// Every item: { label, href, icon, permission, group }
// ─────────────────────────────────────────────────────────────────────────────

// ─────────────────────────────────────────────────────────────────────────────
// UPDATED NAV — with standardized permission keys
// ─────────────────────────────────────────────────────────────────────────────

export const NAV = {
  school: [
    { group: 'Main', label: 'Dashboard', href: '/school/dashboard', icon: 'LayoutDashboard', permission: 'dashboard.view' },
    { group: 'Academic', label: 'Academic Years', href: '/school/academic-years', icon: 'CalendarDays', permission: 'academic_years.read' },
    { group: 'Academic', label: 'Classes', href: '/school/classes', icon: 'BookOpen', permission: 'classes.read' },
    // { group: 'Academic',   label: 'Sections',         href: '/school/sections',         icon: 'Layers',            permission: 'sections.read' },
    // { group: 'Academic',   label: 'Subjects',         href: '/school/subjects',         icon: 'FileText',          permission: 'subjects.read' },
    { group: 'Academic', label: 'Timetable', href: '/school/timetable', icon: 'Calendar', permission: 'timetable.read' },
    { group: 'People', label: 'Students', href: '/school/students', icon: 'Users', permission: 'students.read' },
    { group: 'People', label: 'Teachers', href: '/school/teachers', icon: 'GraduationCap', permission: 'teachers.read' },
    { group: 'People', label: 'Staff', href: '/school/staff', icon: 'Heart', permission: 'staff.read' },
    { group: 'People', label: 'Parents', href: '/school/parents', icon: 'Heart', permission: 'parents.read' },
    // { group: 'People', label: 'Admissions', href: '/school/admissions', icon: 'ClipboardList', permission: 'admissions.read' },
    { group: 'Operations', label: 'Attendance', href: '/school/attendance', icon: 'CheckSquare', permission: 'attendance.view' },
    { group: 'Operations', label: 'Staff Attendance', href: '/school/staff-attendance', icon: 'UserCheck', permission: 'staff_attendance.view' },
    { group: 'Operations', label: 'Exams', href: '/school/exams', icon: 'ClipboardCheck', permission: 'exams.read' },
    { group: 'Finance', label: 'Expense', href: '/school/expense', icon: 'Wallet', permission: 'expenses.read' },
    { group: 'Finance', label: 'Vendors', href: '/school/vendors', icon: 'Store', permission: 'fees.read' },
    { group: 'Finance', label: 'Fees', href: '/school/fees', icon: 'CreditCard', permission: 'fees.read' },
    { group: 'Finance', label: 'Fee Templates', href: '/school/fee-templates', icon: 'Receipt', permission: 'fee_templates.create' },
    { group: 'Finance', label: 'Payroll', href: '/school/payroll', icon: 'DollarSign', permission: 'payroll.read' },
    { group: 'Finance', label: 'Reports', href: '/school/reports', icon: 'BarChart2', permission: 'reports.student' },
    { group: 'Comms', label: 'Notices', href: '/school/notices', icon: 'Bell', permission: 'notices.read' },
    { group: 'Admin', label: 'Branches', href: '/school/branches', icon: 'Building2', permission: 'branches.read', requiresBranches: true },
    // { group: 'Admin', label: 'Roles', href: '/school/roles', icon: 'Shield', permission: 'roles.read' },
    // { group: 'Admin', label: 'Users', href: '/school/users', icon: 'UserCog', permission: 'users.read' },
    { group: 'Admin', label: 'Settings', href: '/school/settings', icon: 'Settings' },
  ],

  coaching: [
    { group: 'Main', label: 'Dashboard', href: '/coaching/dashboard', icon: 'LayoutDashboard', permission: 'dashboard.read' },
    { group: 'Academic', label: 'Courses', href: '/coaching/courses', icon: 'BookOpen', permission: 'courses.read' },
    { group: 'Academic', label: 'Batches', href: '/coaching/batches', icon: 'Layers', permission: 'batches.read' },
    { group: 'Academic', label: 'Subjects', href: '/coaching/subjects', icon: 'FileText', permission: 'subjects.read' },
    { group: 'Academic', label: 'Session Schedule', href: '/coaching/timetable', icon: 'Calendar', permission: 'timetable.read' },
    { group: 'Academic', label: 'Sessions', href: '/coaching/academic-years', icon: 'CalendarDays', permission: 'sessions.read' },
    { group: 'People', label: 'Candidates', href: '/coaching/students', icon: 'Users', permission: 'students.read' },
    { group: 'People', label: 'Instructors', href: '/coaching/teachers', icon: 'GraduationCap', permission: 'teachers.read' },
    { group: 'People', label: 'Enrollments', href: '/coaching/admissions', icon: 'ClipboardList', permission: 'enrollments.read' },
    { group: 'Operations', label: 'Attendance', href: '/coaching/attendance', icon: 'CheckSquare', permission: 'attendance.read' },
    { group: 'Operations', label: 'Staff Attendance', href: '/coaching/staff-attendance', icon: 'UserCheck', permission: 'staff_attendance.read' },
    { group: 'Operations', label: 'Mock Tests', href: '/coaching/exams', icon: 'ClipboardCheck', permission: 'exams.read' },
    { group: 'Finance', label: 'Expense', href: '/coaching/expense', icon: 'Wallet', permission: 'expense.read' },
    { group: 'Finance', label: 'Vendors', href: '/coaching/vendors', icon: 'Store', permission: 'cendors.read' },
    { group: 'Finance', label: 'Fees', href: '/coaching/fees', icon: 'CreditCard', permission: 'fees.read' },
    { group: 'Finance', label: 'Fee Templates', href: '/coaching/fee-templates', icon: 'Receipt', permission: 'fee_templates.read' },
    { group: 'Finance', label: 'Payroll', href: '/coaching/payroll', icon: 'DollarSign', permission: 'payroll.read' },
    { group: 'Finance', label: 'Reports', href: '/coaching/reports', icon: 'BarChart2', permission: 'reports.read' },
    { group: 'Comms', label: 'Notices', href: '/coaching/notices', icon: 'Bell', permission: 'notices.read' },
    { group: 'Admin', label: 'Branches', href: '/coaching/branches', icon: 'Building2', permission: 'branches.read', requiresBranches: true },
    // { group: 'Admin', label: 'Roles', href: '/coaching/roles', icon: 'Shield', permission: 'roles.read' },
    // { group: 'Admin', label: 'Users', href: '/coaching/users', icon: 'UserCog', permission: 'users.read' },
    { group: 'Admin', label: 'Settings', href: '/coaching/settings', icon: 'Settings', permission: 'settings.read' },
  ],

  academy: [
    { group: 'Main', label: 'Dashboard', href: '/academy/dashboard', icon: 'LayoutDashboard', permission: 'dashboard.read' },
    { group: 'Academic', label: 'Programs', href: '/academy/classes', icon: 'BookOpen', permission: 'programs.read' },
    { group: 'Academic', label: 'Batches', href: '/academy/batches', icon: 'Layers', permission: 'batches.read' },
    { group: 'Academic', label: 'Modules', href: '/academy/subjects', icon: 'FileText', permission: 'modules.read' },
    { group: 'Academic', label: 'Class Schedule', href: '/academy/timetable', icon: 'Calendar', permission: 'timetable.read' },
    { group: 'Academic', label: 'Batch Cycles', href: '/academy/academic-years', icon: 'CalendarDays', permission: 'batch_cycles.read' },
    { group: 'People', label: 'Trainees', href: '/academy/students', icon: 'Users', permission: 'students.read' },
    { group: 'People', label: 'Trainers', href: '/academy/teachers', icon: 'GraduationCap', permission: 'teachers.read' },
    { group: 'People', label: 'Registrations', href: '/academy/admissions', icon: 'ClipboardList', permission: 'registrations.read' },
    { group: 'Operations', label: 'Attendance', href: '/academy/attendance', icon: 'CheckSquare', permission: 'attendance.read' },
    { group: 'Operations', label: 'Staff Attendance', href: '/academy/staff-attendance', icon: 'UserCheck', permission: 'staff_attendance.read' },
    { group: 'Operations', label: 'Assessments', href: '/academy/exams', icon: 'ClipboardCheck', permission: 'assessments.read' },
    { group: 'Finance', label: 'Expense', href: '/academy/expense', icon: 'Wallet', permission: 'expense.read' },
    { group: 'Finance', label: 'Vendors', href: '/academy/vendors', icon: 'Store', permission: 'vendors.read' },
    { group: 'Finance', label: 'Fees', href: '/academy/fees', icon: 'CreditCard', permission: 'fees.read' },
    { group: 'Finance', label: 'Fee Templates', href: '/academy/fee-templates', icon: 'Receipt', permission: 'fee_templates.read' },
    { group: 'Finance', label: 'Payroll', href: '/academy/payroll', icon: 'DollarSign', permission: 'payroll.read' },
    { group: 'Finance', label: 'Reports', href: '/academy/reports', icon: 'BarChart2', permission: 'reports.read' },
    { group: 'Comms', label: 'Notices', href: '/academy/notices', icon: 'Bell', permission: 'notices.read' },
    { group: 'Admin', label: 'Branches', href: '/academy/branches', icon: 'Building2', permission: 'branches.read', requiresBranches: true },
    // { group: 'Admin', label: 'Roles', href: '/academy/roles', icon: 'Shield', permission: 'roles.read' },
    // { group: 'Admin', label: 'Users', href: '/academy/users', icon: 'UserCog', permission: 'users.read' },
    { group: 'Admin', label: 'Settings', href: '/academy/settings', icon: 'Settings', permission: 'settings.read' },
  ],

  college: [
    { group: 'Main', label: 'Dashboard', href: '/college/dashboard', icon: 'LayoutDashboard', permission: 'dashboard.read' },
    { group: 'Academic', label: 'Departments', href: '/college/classes', icon: 'Building', permission: 'departments.read' },
    { group: 'Academic', label: 'Programs', href: '/college/programs', icon: 'BookOpen', permission: 'programs.read' },
    { group: 'Academic', label: 'Semesters', href: '/college/semesters', icon: 'Layers', permission: 'semesters.read' },
    { group: 'Academic', label: 'Subjects', href: '/college/subjects', icon: 'FileText', permission: 'subjects.read' },
    { group: 'Academic', label: 'Lecture Schedule', href: '/college/timetable', icon: 'Calendar', permission: 'timetable.read' },
    { group: 'Academic', label: 'Academic Years', href: '/college/academic-years', icon: 'CalendarDays', permission: 'academic_years.read' },
    { group: 'People', label: 'Students', href: '/college/students', icon: 'Users', permission: 'students.read' },
    { group: 'People', label: 'Lecturers', href: '/college/teachers', icon: 'GraduationCap', permission: 'teachers.read' },
    { group: 'People', label: 'Admissions', href: '/college/admissions', icon: 'ClipboardList', permission: 'admissions.read' },
    { group: 'Operations', label: 'Attendance', href: '/college/attendance', icon: 'CheckSquare', permission: 'attendance.view' },
    { group: 'Operations', label: 'Staff Attendance', href: '/college/staff-attendance', icon: 'UserCheck', permission: 'staff_attendance.read' },
    { group: 'Operations', label: 'Examinations', href: '/college/exams', icon: 'ClipboardCheck', permission: 'exams.read' },
    { group: 'Finance', label: 'Expense', href: '/college/expense', icon: 'Wallet', permission: 'expense.read' },
    { group: 'Finance', label: 'Vendors', href: '/college/vendors', icon: 'Store', permission: 'vendors.read' },
    { group: 'Finance', label: 'Fees', href: '/college/fees', icon: 'CreditCard', permission: 'fees.read' },
    { group: 'Finance', label: 'Fee Templates', href: '/college/fee-templates', icon: 'Receipt', permission: 'fee_templates.read' },
    { group: 'Finance', label: 'Payroll', href: '/college/payroll', icon: 'DollarSign', permission: 'payroll.read' },
    { group: 'Finance', label: 'Reports', href: '/college/reports', icon: 'BarChart2', permission: 'reports.read' },
    { group: 'Comms', label: 'Notices', href: '/college/notices', icon: 'Bell', permission: 'notices.read' },
    { group: 'Admin', label: 'Branches', href: '/college/branches', icon: 'Building2', permission: 'branches.read', requiresBranches: true },
    // { group: 'Admin', label: 'Roles', href: '/college/roles', icon: 'Shield', permission: 'roles.read' },
    // { group: 'Admin', label: 'Users', href: '/college/users', icon: 'UserCog', permission: 'users.read' },
    { group: 'Admin', label: 'Settings', href: '/college/settings', icon: 'Settings', permission: 'settings.read' },
  ],

  university: [
    { group: 'Main', label: 'Dashboard', href: '/university/dashboard', icon: 'LayoutDashboard', permission: 'dashboard.read' },
    { group: 'Academic', label: 'Faculties', href: '/university/faculties', icon: 'Building', permission: 'faculties.read' },
    { group: 'Academic', label: 'Departments', href: '/university/departments', icon: 'BookOpen', permission: 'departments.read' },
    { group: 'Academic', label: 'Programs', href: '/university/programs', icon: 'Layers', permission: 'programs.read' },
    { group: 'Academic', label: 'Semesters', href: '/university/semesters', icon: 'CalendarDays', permission: 'semesters.read' },
    { group: 'Academic', label: 'Courses', href: '/university/subjects', icon: 'FileText', permission: 'courses.read' },
    { group: 'Academic', label: 'Course Schedule', href: '/university/timetable', icon: 'Calendar', permission: 'timetable.read' },
    { group: 'People', label: 'Students', href: '/university/students', icon: 'Users', permission: 'students.read' },
    { group: 'People', label: 'Faculty / Staff', href: '/university/teachers', icon: 'GraduationCap', permission: 'faculty.read' },
    { group: 'People', label: 'Admissions', href: '/university/admissions', icon: 'ClipboardList', permission: 'admissions.read' },
    { group: 'Operations', label: 'Attendance', href: '/university/attendance', icon: 'CheckSquare', permission: 'attendance.view' },
    { group: 'Operations', label: 'Staff Attendance', href: '/university/staff-attendance', icon: 'UserCheck', permission: 'staff_attendance.read' },
    { group: 'Operations', label: 'Examinations', href: '/university/exams', icon: 'ClipboardCheck', permission: 'exams.read' },
    { group: 'Research', label: 'Research Modules', href: '/university/research', icon: 'FlaskConical', permission: 'research.read' },
    { group: 'Finance', label: 'Expense', href: '/university/expense', icon: 'Wallet', permission: 'expense.read' },
    { group: 'Finance', label: 'Vendors', href: '/university/vendors', icon: 'Store', permission: 'vendors.read' },
    { group: 'Finance', label: 'Fees', href: '/university/fees', icon: 'CreditCard', permission: 'fees.read' },
    { group: 'Finance', label: 'Fee Templates', href: '/university/fee-templates', icon: 'Receipt', permission: 'fee_templates.read' },
    { group: 'Finance', label: 'Payroll', href: '/university/payroll', icon: 'DollarSign', permission: 'payroll.read' },
    { group: 'Finance', label: 'Reports', href: '/university/reports', icon: 'BarChart2', permission: 'reports.read' },
    { group: 'Comms', label: 'Notices', href: '/university/notices', icon: 'Bell', permission: 'notices.read' },
    { group: 'Admin', label: 'Campuses', href: '/university/branches', icon: 'Building2', permission: 'campuses.read', requiresBranches: true },
    // { group: 'Admin', label: 'Roles', href: '/university/roles', icon: 'Shield', permission: 'roles.read' },
    // { group: 'Admin', label: 'Users', href: '/university/users', icon: 'UserCog', permission: 'users.read' },
    { group: 'Admin', label: 'Settings', href: '/university/settings', icon: 'Settings', permission: 'settings.read' },
  ],
};

// ─────────────────────────────────────────────────────────────────────────────
// DASHBOARD PATHS — login ke baad kidhar redirect karein
// ─────────────────────────────────────────────────────────────────────────────
export const DASHBOARD_PATHS = {
  school: '/school/dashboard',
  coaching: '/coaching/dashboard',
  academy: '/academy/dashboard',
  college: '/college/dashboard',
  university: '/university/dashboard',
  // fallback (MASTER_ADMIN ya unknown type)
  default: '/dashboard',
  master: '/master-admin',
};

// ─────────────────────────────────────────────────────────────────────────────
// ROUTE PREFIX MAP — e.g. pathname.startsWith('/coaching/')
// ─────────────────────────────────────────────────────────────────────────────
export const ROUTE_PREFIXES = ['school', 'coaching', 'academy', 'college', 'university'];

// ─────────────────────────────────────────────────────────────────────────────
// FEE STRUCTURE per type
// ─────────────────────────────────────────────────────────────────────────────
export const FEE_STRUCTURE = {
  school: {
    period_label: 'Month',
    periods: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'],
    typical_components: ['Tuition Fee', 'Transport Fee', 'Library Fee', 'Lab Fee', 'Exam Fee'],
  },
  coaching: {
    period_label: 'Course',
    periods: null, // dynamic — each course defines its own
    typical_components: ['Course Fee', 'Study Material', 'Mock Test Fee', 'Registration Fee'],
  },
  academy: {
    period_label: 'Module',
    periods: null,
    typical_components: ['Module Fee', 'Lab Access', 'Certificate Fee', 'Registration Fee'],
  },
  college: {
    period_label: 'Semester',
    periods: ['1st Semester', '2nd Semester', '3rd Semester', '4th Semester', '5th Semester', '6th Semester', '7th Semester', '8th Semester'],
    typical_components: ['Tuition Fee', 'Admission Fee', 'Library Fee', 'Exam Fee', 'Lab Fee', 'Sports Fee'],
  },
  university: {
    period_label: 'Semester',
    periods: ['1st Semester', '2nd Semester', '3rd Semester', '4th Semester', '5th Semester', '6th Semester', '7th Semester', '8th Semester'],
    typical_components: ['Tuition Fee', 'Research Fee', 'Library Fee', 'Exam Fee', 'Lab Fee', 'Hostel Fee'],
  },
};

// ─────────────────────────────────────────────────────────────────────────────
// ATTENDANCE MODES per type
// ─────────────────────────────────────────────────────────────────────────────
export const ATTENDANCE_CONFIG = {
  school: { mode: 'subject_wise', label: 'Subject-wise Attendance', group_by: 'class_section' },
  coaching: { mode: 'session_wise', label: 'Session-wise Attendance', group_by: 'batch' },
  academy: { mode: 'module_wise', label: 'Module-wise Attendance', group_by: 'batch' },
  college: { mode: 'subject_wise', label: 'Subject Attendance (75% rule)', group_by: 'program_semester' },
  university: { mode: 'course_wise', label: 'Course-wise Attendance', group_by: 'program_semester' },
};

// ─────────────────────────────────────────────────────────────────────────────
// STUDENT LIST COLUMNS per type
// kaunse columns students list mein dikhane hain
// ─────────────────────────────────────────────────────────────────────────────
export const STUDENT_LIST_COLUMNS = {
  school: [
    { key: 'name', label: 'Name' },
    { key: 'roll_number', label: 'Roll No.' },
    { key: 'class_name', label: 'Class' },
    { key: 'section_name', label: 'Section' },
    { key: 'date_of_birth', label: 'DOB' },
    { key: 'guardian', label: 'Guardian' },
    { key: 'status', label: 'Status' },
    { key: 'fee_status', label: 'Fee Status' },
  ],
  coaching: [
    { key: 'name', label: 'Candidate Name' },
    { key: 'roll_number', label: 'Candidate ID' },
    { key: 'course_name', label: 'Course' },
    { key: 'batch_name', label: 'Batch' },
    { key: 'target_exam', label: 'Target Exam' },
    { key: 'fee_status', label: 'Fee Status' },
    { key: 'is_active', label: 'Status' },
  ],
  academy: [
    { key: 'name', label: 'Trainee Name' },
    { key: 'roll_number', label: 'Trainee ID' },
    { key: 'program_name', label: 'Program' },
    { key: 'batch_name', label: 'Batch' },
    { key: 'module', label: 'Current Module' },
    { key: 'fee_status', label: 'Fee Status' },
    { key: 'is_active', label: 'Status' },
  ],
  college: [
    { key: 'name', label: 'Student Name' },
    { key: 'roll_number', label: 'Enrollment No.' },
    { key: 'department', label: 'Department' },
    { key: 'program_name', label: 'Program' },
    { key: 'semester', label: 'Semester' },
    { key: 'fee_status', label: 'Fee Status' },
    { key: 'is_active', label: 'Status' },
  ],
  university: [
    { key: 'name', label: 'Student Name' },
    { key: 'roll_number', label: 'Reg. No.' },
    { key: 'faculty', label: 'Faculty' },
    { key: 'department', label: 'Department' },
    { key: 'program_name', label: 'Program' },
    { key: 'semester', label: 'Semester' },
    { key: 'cgpa', label: 'CGPA' },
    { key: 'fee_status', label: 'Fee Status' },
    { key: 'is_active', label: 'Status' },
  ],
};

// ─────────────────────────────────────────────────────────────────────────────
// MAIN EXPORT — getInstituteConfig(type)
// ─────────────────────────────────────────────────────────────────────────────

/**
 * getInstituteConfig('coaching')
 *
 * Returns:
 * {
 *   type,        — 'coaching'
 *   terms,       — { students: 'Candidates', teacher: 'Instructor', ... }
 *   nav,         — sidebar items array
 *   dashboardPath, — '/coaching/dashboard'
 *   feeStructure,
 *   attendanceConfig,
 *   studentColumns,
 * }
 */
export function getInstituteConfig(instituteType = 'school') {
  const type = INSTITUTE_TYPES.find((t) => t.value === instituteType) ?? INSTITUTE_TYPES[0];
  return {
    type: instituteType,
    typeDefinition: type,
    terms: TERMS[instituteType] ?? TERMS.school,
    nav: NAV[instituteType] ?? NAV.school,
    dashboardPath: DASHBOARD_PATHS[instituteType] ?? DASHBOARD_PATHS.default,
    feeStructure: FEE_STRUCTURE[instituteType] ?? FEE_STRUCTURE.school,
    attendanceConfig: ATTENDANCE_CONFIG[instituteType] ?? ATTENDANCE_CONFIG.school,
    studentColumns: STUDENT_LIST_COLUMNS[instituteType] ?? STUDENT_LIST_COLUMNS.school,
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







