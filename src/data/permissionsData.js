/**
 * ╔══════════════════════════════════════════════════════════════════╗
 * ║   permissionsData.js — The Clouds Academy                       ║
 * ║                                                                  ║
 * ║  All permission strings, role definitions, and per-institute     ║
 * ║  type permission groupings compiled in one place.                ║
 * ║                                                                  ║
 * ║  Exports:                                                        ║
 * ║   ALL_PERMISSIONS         — flat array of every permission       ║
 * ║   PERMISSION_GROUPS       — grouped by module (for checkboxes)   ║
 * ║   PERMISSIONS_BY_INSTITUTE— relevant perms per institute type    ║
 * ║   ROLES_BY_INSTITUTE      — role definitions per institute type  ║
 * ║   ALL_ROLES               — complete flat roles array            ║
 * ╚══════════════════════════════════════════════════════════════════╝
 */

// ─────────────────────────────────────────────────────────────────────────────
// SECTION 1 — MASTER PERMISSIONS LIST
// Every permission string that exists in the system
// ─────────────────────────────────────────────────────────────────────────────

export const ALL_PERMISSIONS = [
  // ── Dashboard ────────────────────────────────────────────────────────────
  'dashboard.view',
  'profile.manage',

  // ── Student Management ───────────────────────────────────────────────────
  'student.create',
  'student.read',
  'student.update',
  'student.delete',
  'student.export',
  'student.promote',
  'student.transfer',

  // Institute-specific student operations
  'student.class.assign',      // School     — assign student to a class
  'student.section.assign',    // School     — assign student to a section
  'student.batch.assign',      // Coaching / Academy — assign to batch
  'student.course.assign',     // Coaching / Academy — assign to course
  'student.semester.register', // College / University — register for semester
  'student.program.assign',    // College / University — assign to program

  // ── Teacher / Staff Management ───────────────────────────────────────────
  'teacher.create',
  'teacher.read',
  'teacher.update',
  'teacher.delete',
  'teacher.salary.manage',
  'teacher.leave.approve',

  // ── Parents ──────────────────────────────────────────────────────────────
  'parent.create',
  'parent.read',
  'parent.update',
  'parent.delete',

  // ── Admissions / Enrollments ──────────────────────────────────────────────
  'admission.create',
  'admission.read',
  'admission.update',
  'admission.delete',

  // ── Academic Structure ────────────────────────────────────────────────────
  // School
  'class.create',    'class.read',    'class.update',    'class.delete',
  'section.create',  'section.read',  'section.update',  'section.delete',

  // Coaching / Academy
  'course.create',   'course.read',   'course.update',   'course.delete',
  'batch.create',    'batch.read',    'batch.update',    'batch.delete',

  // College / University
  'program.create',    'program.read',    'program.update',    'program.delete',
  'semester.create',   'semester.read',   'semester.update',   'semester.delete',
  'department.create', 'department.read', 'department.update', 'department.delete',
  'faculty.create',    'faculty.read',    'faculty.update',    'faculty.delete',

  // ── Academic Years / Sessions / Batch Cycles ──────────────────────────────
  'academic_year.create', 'academic_year.read', 'academic_year.update', 'academic_year.delete',
  'academicYear.create',  'academicYear.read',  'academicYear.update',  'academicYear.delete',  // camelCase aliases

  // ── Subjects / Courses / Modules ──────────────────────────────────────────
  'subject.create', 'subject.read', 'subject.update', 'subject.delete',

  // ── Timetable / Schedules ─────────────────────────────────────────────────
  'timetable.create', 'timetable.read', 'timetable.update', 'timetable.delete',

  // ── Attendance ────────────────────────────────────────────────────────────
  'attendance.mark',
  'attendance.read',
  'attendance.update',
  'attendance.export',
  'attendance.report',
  'staffAttendance.create', 'staffAttendance.read', 'staffAttendance.update', 'staffAttendance.delete',

  // ── Fees ──────────────────────────────────────────────────────────────────
  'fee.create',
  'fee.read',
  'fee.update',
  'fee.delete',
  'fee.collect',
  'fee.refund',
  'fee.export',
  'fee.structure.create',
  'fee.structure.assign',

  // ── Fee Templates ─────────────────────────────────────────────────────────
  'fee_template.create', 'fee_template.read', 'fee_template.update', 'fee_template.delete',
  'feeTemplate.create',  'feeTemplate.read',  'feeTemplate.update',  'feeTemplate.delete',  // camelCase aliases

  // ── Exams / Mock Tests / Assessments ──────────────────────────────────────
  'exam.create',
  'exam.read',
  'exam.update',
  'exam.delete',
  'exam.schedule',
  'exam.result.enter',
  'exam.result.publish',

  // ── Payroll ───────────────────────────────────────────────────────────────
  'payroll.read',
  'payroll.create',
  'payroll.process',
  'payroll.export',

  // ── Communication ─────────────────────────────────────────────────────────
  'notice.create',  'notice.read',  'notice.update',  'notice.delete',
  'notification.send',
  'sms.send',
  'email.send',

  // ── Reports ───────────────────────────────────────────────────────────────
  'report.view',
  'report.export',
  'report.schedule',
  'report.financial',

  // ── Branches / Campuses ───────────────────────────────────────────────────
  'branch.create', 'branch.read', 'branch.update', 'branch.delete',

  // ── Roles & Users ─────────────────────────────────────────────────────────
  'role.read',   'role.create',  'role.update',  'role.delete',  'role.manage',
  'user.read',   'user.create',  'user.update',  'user.delete',  'user.manage',

  // ── Settings ──────────────────────────────────────────────────────────────
  'school.settings',
  'institute.settings',
  'backup.manage',
  'settings.view',
  'settings.update',

  // ── Research (University only) ────────────────────────────────────────────
  'research.create', 'research.read', 'research.update', 'research.delete',

  // ═══════════════════════════════════════════════════════════════════════════
  // PLATFORM LEVEL — Master Admin Only (SaaS / multi-tenant management)
  // These permissions are not available to any institute user
  // ═══════════════════════════════════════════════════════════════════════════

  // ── Institute Management ─────────────────────────────────────────────────
  'institute.create',
  'institute.read',
  'institute.update',
  'institute.delete',
  'institute.activate',
  'institute.assign_role',
  'institute.export',
  'institute.view_stats',

  // ── Subscription Management ───────────────────────────────────────────────
  'subscription.create',
  'subscription.read',
  'subscription.update',
  'subscription.cancel',
  'subscription.renew',
  'subscription.export',

  // ── Subscription Templates / Plans ───────────────────────────────────────
  'sub_template.create',
  'sub_template.read',
  'sub_template.update',
  'sub_template.delete',

  // ── Platform Roles ───────────────────────────────────────────────────────
  'platform_role.create',
  'platform_role.read',
  'platform_role.update',
  'platform_role.delete',
  'platform_role.assign',

  // ── Platform Users ───────────────────────────────────────────────────────
  'platform_user.create',
  'platform_user.read',
  'platform_user.update',
  'platform_user.delete',
  'platform_user.toggle',

  // ── Bulk Email ───────────────────────────────────────────────────────────
  'email.send_bulk',
  'email.view_history',

  // ── Platform Reports ─────────────────────────────────────────────────────
  'report.platform_overview',
  'report.revenue',
  'report.institute_wise',
  'report.subscription',

  // ── Platform Notifications ───────────────────────────────────────────────
  'notification.broadcast',
  'notification.targeted',

  // ── Platform Settings ────────────────────────────────────────────────────
  'platform.settings',
  'platform.backup',
  'platform.audit_logs',
  'platform.maintenance',

  // ── Institute Data Access (Support Level) ────────────────────────────────
  'institute_data.students',
  'institute_data.users',
  'institute_data.fees',
  'institute_data.attendance',
];


// ─────────────────────────────────────────────────────────────────────────────
// SECTION 2 — PERMISSION GROUPS (for Role-form checkboxes in UI)
// ─────────────────────────────────────────────────────────────────────────────

export const PERMISSION_GROUPS = {
  'Dashboard': [
    'dashboard.view',
    'profile.manage',
  ],

  'Students': [
    'student.create', 'student.read', 'student.update', 'student.delete',
    'student.export', 'student.promote', 'student.transfer',
    'student.class.assign', 'student.section.assign',
    'student.batch.assign', 'student.course.assign',
    'student.semester.register', 'student.program.assign',
  ],

  'Teachers / Staff': [
    'teacher.create', 'teacher.read', 'teacher.update', 'teacher.delete',
    'teacher.salary.manage', 'teacher.leave.approve',
  ],

  'Parents': [
    'parent.create', 'parent.read', 'parent.update', 'parent.delete',
  ],

  'Admissions / Enrollments': [
    'admission.create', 'admission.read', 'admission.update', 'admission.delete',
  ],

  'Academic Structure (School)': [
    'class.create', 'class.read', 'class.update', 'class.delete',
    'section.create', 'section.read', 'section.update', 'section.delete',
  ],

  'Academic Structure (Coaching / Academy)': [
    'course.create', 'course.read', 'course.update', 'course.delete',
    'batch.create',  'batch.read',  'batch.update',  'batch.delete',
  ],

  'Academic Structure (College / University)': [
    'program.create',    'program.read',    'program.update',    'program.delete',
    'semester.create',   'semester.read',   'semester.update',   'semester.delete',
    'department.create', 'department.read', 'department.update', 'department.delete',
    'faculty.create',    'faculty.read',    'faculty.update',    'faculty.delete',
  ],

  'Academic Years / Sessions': [
    'academic_year.create', 'academic_year.read', 'academic_year.update', 'academic_year.delete',
  ],

  'Subjects / Modules': [
    'subject.create', 'subject.read', 'subject.update', 'subject.delete',
  ],

  'Timetable / Schedules': [
    'timetable.create', 'timetable.read', 'timetable.update', 'timetable.delete',
  ],

  'Attendance': [
    'attendance.mark', 'attendance.read', 'attendance.update',
    'attendance.export', 'attendance.report',
    'staffAttendance.create', 'staffAttendance.read',
    'staffAttendance.update', 'staffAttendance.delete',
  ],

  'Fees': [
    'fee.create', 'fee.read', 'fee.update', 'fee.delete',
    'fee.collect', 'fee.refund', 'fee.export',
    'fee.structure.create', 'fee.structure.assign',
  ],

  'Fee Templates': [
    'fee_template.create', 'fee_template.read', 'fee_template.update', 'fee_template.delete',
  ],

  'Exams / Assessments': [
    'exam.create', 'exam.read', 'exam.update', 'exam.delete',
    'exam.schedule', 'exam.result.enter', 'exam.result.publish',
  ],

  'Payroll': [
    'payroll.read', 'payroll.create', 'payroll.process', 'payroll.export',
  ],

  'Communication': [
    'notice.create', 'notice.read', 'notice.update', 'notice.delete',
    'notification.send', 'sms.send', 'email.send',
  ],

  'Reports': [
    'report.view', 'report.export', 'report.schedule', 'report.financial',
  ],

  'Branches / Campuses': [
    'branch.create', 'branch.read', 'branch.update', 'branch.delete',
  ],

  'Roles & Users': [
    'role.read',  'role.create',  'role.update',  'role.delete',  'role.manage',
    'user.read',  'user.create',  'user.update',  'user.delete',  'user.manage',
  ],

  'Settings': [
    'school.settings', 'institute.settings',
    'settings.view', 'settings.update', 'backup.manage',
  ],

  'Research (University)': [
    'research.create', 'research.read', 'research.update', 'research.delete',
  ],
};


// ─────────────────────────────────────────────────────────────────────────────
// SECTION 3 — PERMISSIONS BY INSTITUTE TYPE
// Which permissions are relevant / commonly shown per institute type
// ─────────────────────────────────────────────────────────────────────────────

export const PERMISSIONS_BY_INSTITUTE = {

  // ── SCHOOL ─────────────────────────────────────────────────────────────────
  school: [
    'dashboard.view', 'profile.manage',

    // Students
    'student.create', 'student.read', 'student.update', 'student.delete',
    'student.export', 'student.promote', 'student.transfer',
    'student.class.assign', 'student.section.assign',

    // Teachers & Parents
    'teacher.create', 'teacher.read', 'teacher.update', 'teacher.delete',
    'teacher.salary.manage', 'teacher.leave.approve',
    'parent.create', 'parent.read', 'parent.update', 'parent.delete',
    'admission.create', 'admission.read', 'admission.update', 'admission.delete',

    // Academic Structure
    'class.create', 'class.read', 'class.update', 'class.delete',
    'section.create', 'section.read', 'section.update', 'section.delete',
    'subject.create', 'subject.read', 'subject.update', 'subject.delete',
    'timetable.create', 'timetable.read', 'timetable.update', 'timetable.delete',
    'academic_year.create', 'academic_year.read', 'academic_year.update', 'academic_year.delete',

    // Attendance
    'attendance.mark', 'attendance.read', 'attendance.update',
    'attendance.export', 'attendance.report',
    'staffAttendance.create', 'staffAttendance.read',
    'staffAttendance.update', 'staffAttendance.delete',

    // Fees & Finance
    'fee.create', 'fee.read', 'fee.update', 'fee.delete',
    'fee.collect', 'fee.refund', 'fee.export',
    'fee.structure.create', 'fee.structure.assign',
    'fee_template.create', 'fee_template.read', 'fee_template.update', 'fee_template.delete',
    'payroll.read', 'payroll.create', 'payroll.process', 'payroll.export',

    // Exams
    'exam.create', 'exam.read', 'exam.update', 'exam.delete',
    'exam.schedule', 'exam.result.enter', 'exam.result.publish',

    // Communication & Reports
    'notice.create', 'notice.read', 'notice.update', 'notice.delete',
    'notification.send', 'sms.send', 'email.send',
    'report.view', 'report.export', 'report.schedule', 'report.financial',

    // Admin
    'branch.create', 'branch.read', 'branch.update', 'branch.delete',
    'role.read', 'role.create', 'role.update', 'role.delete', 'role.manage',
    'user.read', 'user.create', 'user.update', 'user.delete', 'user.manage',
    'school.settings', 'settings.view', 'settings.update', 'backup.manage',
  ],

  // ── COACHING CENTER ────────────────────────────────────────────────────────
  coaching: [
    'dashboard.view', 'profile.manage',

    // Students (called Candidates)
    'student.create', 'student.read', 'student.update', 'student.delete',
    'student.export', 'student.batch.assign', 'student.course.assign',

    // Instructors (Teachers)
    'teacher.create', 'teacher.read', 'teacher.update', 'teacher.delete',
    'teacher.salary.manage', 'teacher.leave.approve',
    'admission.create', 'admission.read', 'admission.update', 'admission.delete',

    // Academic Structure (Courses & Batches instead of Classes & Sections)
    'course.create', 'course.read', 'course.update', 'course.delete',
    'batch.create',  'batch.read',  'batch.update',  'batch.delete',
    'subject.create', 'subject.read', 'subject.update', 'subject.delete',
    'timetable.create', 'timetable.read', 'timetable.update', 'timetable.delete',
    'academic_year.create', 'academic_year.read', 'academic_year.update', 'academic_year.delete',

    // Attendance
    'attendance.mark', 'attendance.read', 'attendance.update',
    'attendance.export', 'attendance.report',
    'staffAttendance.create', 'staffAttendance.read',
    'staffAttendance.update', 'staffAttendance.delete',

    // Fees (Course-wise / Per-batch)
    'fee.create', 'fee.read', 'fee.update', 'fee.delete',
    'fee.collect', 'fee.refund', 'fee.export',
    'fee.structure.create', 'fee.structure.assign',
    'fee_template.create', 'fee_template.read', 'fee_template.update', 'fee_template.delete',
    'payroll.read', 'payroll.create', 'payroll.process', 'payroll.export',

    // Mock Tests (Exams)
    'exam.create', 'exam.read', 'exam.update', 'exam.delete',
    'exam.schedule', 'exam.result.enter', 'exam.result.publish',

    // Communication & Reports
    'notice.create', 'notice.read', 'notice.update', 'notice.delete',
    'notification.send', 'sms.send', 'email.send',
    'report.view', 'report.export', 'report.financial',

    // Admin
    'branch.create', 'branch.read', 'branch.update', 'branch.delete',
    'role.read', 'role.create', 'role.update', 'role.delete', 'role.manage',
    'user.read', 'user.create', 'user.update', 'user.delete', 'user.manage',
    'institute.settings', 'settings.view', 'settings.update', 'backup.manage',
  ],

  // ── ACADEMY ────────────────────────────────────────────────────────────────
  academy: [
    'dashboard.view', 'profile.manage',

    // Students (called Trainees)
    'student.create', 'student.read', 'student.update', 'student.delete',
    'student.export', 'student.batch.assign', 'student.course.assign',

    // Trainers (Teachers)
    'teacher.create', 'teacher.read', 'teacher.update', 'teacher.delete',
    'teacher.salary.manage', 'teacher.leave.approve',
    'admission.create', 'admission.read', 'admission.update', 'admission.delete',

    // Academic Structure (Programs, Batches, Modules)
    'course.create', 'course.read', 'course.update', 'course.delete',
    'batch.create',  'batch.read',  'batch.update',  'batch.delete',
    'subject.create', 'subject.read', 'subject.update', 'subject.delete',
    'timetable.create', 'timetable.read', 'timetable.update', 'timetable.delete',
    'academic_year.create', 'academic_year.read', 'academic_year.update', 'academic_year.delete',

    // Attendance
    'attendance.mark', 'attendance.read', 'attendance.update',
    'attendance.export', 'attendance.report',
    'staffAttendance.create', 'staffAttendance.read',
    'staffAttendance.update', 'staffAttendance.delete',

    // Fees (Module-wise)
    'fee.create', 'fee.read', 'fee.update', 'fee.delete',
    'fee.collect', 'fee.refund', 'fee.export',
    'fee.structure.create', 'fee.structure.assign',
    'fee_template.create', 'fee_template.read', 'fee_template.update', 'fee_template.delete',
    'payroll.read', 'payroll.create', 'payroll.process', 'payroll.export',

    // Assessments (Exams)
    'exam.create', 'exam.read', 'exam.update', 'exam.delete',
    'exam.schedule', 'exam.result.enter', 'exam.result.publish',

    // Communication & Reports
    'notice.create', 'notice.read', 'notice.update', 'notice.delete',
    'notification.send', 'sms.send', 'email.send',
    'report.view', 'report.export', 'report.financial',

    // Admin
    'branch.create', 'branch.read', 'branch.update', 'branch.delete',
    'role.read', 'role.create', 'role.update', 'role.delete', 'role.manage',
    'user.read', 'user.create', 'user.update', 'user.delete', 'user.manage',
    'institute.settings', 'settings.view', 'settings.update', 'backup.manage',
  ],

  // ── COLLEGE ────────────────────────────────────────────────────────────────
  college: [
    'dashboard.view', 'profile.manage',

    // Students
    'student.create', 'student.read', 'student.update', 'student.delete',
    'student.export', 'student.promote', 'student.transfer',
    'student.semester.register', 'student.program.assign',

    // Lecturers (Teachers)
    'teacher.create', 'teacher.read', 'teacher.update', 'teacher.delete',
    'teacher.salary.manage', 'teacher.leave.approve',
    'parent.read',
    'admission.create', 'admission.read', 'admission.update', 'admission.delete',

    // Academic Structure (Departments, Programs, Semesters)
    'department.create', 'department.read', 'department.update', 'department.delete',
    'program.create',    'program.read',    'program.update',    'program.delete',
    'semester.create',   'semester.read',   'semester.update',   'semester.delete',
    'subject.create', 'subject.read', 'subject.update', 'subject.delete',
    'timetable.create', 'timetable.read', 'timetable.update', 'timetable.delete',
    'academic_year.create', 'academic_year.read', 'academic_year.update', 'academic_year.delete',

    // Attendance (Subject-wise, 75% rule)
    'attendance.mark', 'attendance.read', 'attendance.update',
    'attendance.export', 'attendance.report',
    'staffAttendance.create', 'staffAttendance.read',
    'staffAttendance.update', 'staffAttendance.delete',

    // Fees (Semester-wise)
    'fee.create', 'fee.read', 'fee.update', 'fee.delete',
    'fee.collect', 'fee.refund', 'fee.export',
    'fee.structure.create', 'fee.structure.assign',
    'fee_template.create', 'fee_template.read', 'fee_template.update', 'fee_template.delete',
    'payroll.read', 'payroll.create', 'payroll.process', 'payroll.export',

    // Examinations
    'exam.create', 'exam.read', 'exam.update', 'exam.delete',
    'exam.schedule', 'exam.result.enter', 'exam.result.publish',

    // Communication & Reports
    'notice.create', 'notice.read', 'notice.update', 'notice.delete',
    'notification.send', 'sms.send', 'email.send',
    'report.view', 'report.export', 'report.schedule', 'report.financial',

    // Admin
    'branch.create', 'branch.read', 'branch.update', 'branch.delete',
    'role.read', 'role.create', 'role.update', 'role.delete', 'role.manage',
    'user.read', 'user.create', 'user.update', 'user.delete', 'user.manage',
    'institute.settings', 'settings.view', 'settings.update', 'backup.manage',
  ],

  // ── UNIVERSITY ─────────────────────────────────────────────────────────────
  university: [
    'dashboard.view', 'profile.manage',

    // Students
    'student.create', 'student.read', 'student.update', 'student.delete',
    'student.export', 'student.promote', 'student.transfer',
    'student.semester.register', 'student.program.assign',

    // Professors (Teachers)
    'teacher.create', 'teacher.read', 'teacher.update', 'teacher.delete',
    'teacher.salary.manage', 'teacher.leave.approve',
    'parent.read',
    'admission.create', 'admission.read', 'admission.update', 'admission.delete',

    // Academic Structure (Faculties, Departments, Programs, Semesters, Courses)
    'faculty.create',    'faculty.read',    'faculty.update',    'faculty.delete',
    'department.create', 'department.read', 'department.update', 'department.delete',
    'program.create',    'program.read',    'program.update',    'program.delete',
    'semester.create',   'semester.read',   'semester.update',   'semester.delete',
    'subject.create', 'subject.read', 'subject.update', 'subject.delete',
    'timetable.create', 'timetable.read', 'timetable.update', 'timetable.delete',
    'academic_year.create', 'academic_year.read', 'academic_year.update', 'academic_year.delete',

    // Research (University only)
    'research.create', 'research.read', 'research.update', 'research.delete',

    // Attendance (Course-wise)
    'attendance.mark', 'attendance.read', 'attendance.update',
    'attendance.export', 'attendance.report',
    'staffAttendance.create', 'staffAttendance.read',
    'staffAttendance.update', 'staffAttendance.delete',

    // Fees (Semester-wise, includes Hostel/Research)
    'fee.create', 'fee.read', 'fee.update', 'fee.delete',
    'fee.collect', 'fee.refund', 'fee.export',
    'fee.structure.create', 'fee.structure.assign',
    'fee_template.create', 'fee_template.read', 'fee_template.update', 'fee_template.delete',
    'payroll.read', 'payroll.create', 'payroll.process', 'payroll.export',

    // Examinations
    'exam.create', 'exam.read', 'exam.update', 'exam.delete',
    'exam.schedule', 'exam.result.enter', 'exam.result.publish',

    // Communication & Reports
    'notice.create', 'notice.read', 'notice.update', 'notice.delete',
    'notification.send', 'sms.send', 'email.send',
    'report.view', 'report.export', 'report.schedule', 'report.financial',

    // Admin
    'branch.create', 'branch.read', 'branch.update', 'branch.delete',
    'role.read', 'role.create', 'role.update', 'role.delete', 'role.manage',
    'user.read', 'user.create', 'user.update', 'user.delete', 'user.manage',
    'institute.settings', 'settings.view', 'settings.update', 'backup.manage',
  ],
};


// ─────────────────────────────────────────────────────────────────────────────
// SECTION 4 — ROLES BY INSTITUTE TYPE
// All role definitions with their permission sets
// ─────────────────────────────────────────────────────────────────────────────

export const ROLES_BY_INSTITUTE = {

  // ── PLATFORM LEVEL (applies to all types) ──────────────────────────────────
  platform: [
    {
      id: 'role-master-001',
      name: 'Master Admin',
      code: 'MASTER_ADMIN',
      level: 'platform',
      is_system: true,
      description: 'SaaS platform super admin — manages all institutes, subscriptions, billing.',
      permissions: ALL_PERMISSIONS,
    },
  ],

  // ── COMMON (works for all institute types) ─────────────────────────────────
  common: [
    {
      id: 'role-inst-001',
      name: 'Institute Admin',
      code: 'INSTITUTE_ADMIN',
      level: 'institute',
      is_system: true,
      description: 'Full access to every feature within their own institute.',
      permissions: ALL_PERMISSIONS,
    },
    {
      id: 'role-common-001',
      name: 'Fee Manager',
      code: 'FEE_MANAGER',
      level: 'institute',
      is_system: false,
      description: 'Collect fees, manage fee structures, view financial reports.',
      permissions: [
        'dashboard.view',
        'student.read',
        'fee.create', 'fee.read', 'fee.update', 'fee.collect', 'fee.refund', 'fee.export',
        'fee.structure.create', 'fee.structure.assign',
        'fee_template.read',
        'report.view', 'report.financial', 'report.export',
      ],
    },
    {
      id: 'role-common-002',
      name: 'Receptionist',
      code: 'RECEPTIONIST',
      level: 'institute',
      is_system: false,
      description: 'Front-desk access — register students, collect fees, check attendance.',
      permissions: [
        'dashboard.view',
        'student.create', 'student.read',
        'fee.read', 'fee.collect',
        'attendance.read',
        'notice.read',
      ],
    },
    {
      id: 'role-common-003',
      name: 'HR Manager',
      code: 'HR_MANAGER',
      level: 'institute',
      is_system: false,
      description: 'Manage payroll, staff leaves, and attendance reports.',
      permissions: [
        'dashboard.view',
        'teacher.read',
        'payroll.read', 'payroll.create', 'payroll.process', 'payroll.export',
        'teacher.leave.approve',
        'staffAttendance.read', 'staffAttendance.update',
        'report.view', 'report.export',
      ],
    },
    {
      id: 'role-common-004',
      name: 'Admission Officer',
      code: 'ADMISSION_OFFICER',
      level: 'institute',
      is_system: false,
      description: 'Handle new admissions/enrollments and onboard students.',
      permissions: [
        'dashboard.view',
        'student.create', 'student.read',
        'admission.create', 'admission.read', 'admission.update',
        'parent.create', 'parent.read',
        'fee_template.read',
        'notice.read',
      ],
    },
    {
      id: 'role-common-005',
      name: 'Branch Admin',
      code: 'BRANCH_ADMIN',
      level: 'institute',
      is_system: false,
      description: 'Manage a single branch/campus — limited to branch-level data.',
      permissions: [
        'dashboard.view',
        'student.create', 'student.read', 'student.update', 'student.export',
        'admission.create', 'admission.read', 'admission.update',
        'parent.create', 'parent.read',
        'teacher.read',
        'attendance.mark', 'attendance.read',
        'fee.read', 'fee.collect',
        'notice.create', 'notice.read',
        'user.read', 'user.create',
        'branch.read', 'branch.update',
        'report.view', 'report.export',
      ],
    },
  ],

  // ── SCHOOL ─────────────────────────────────────────────────────────────────
  school: [
    {
      id: 'role-sch-001',
      name: 'Class Teacher',
      code: 'CLASS_TEACHER',
      level: 'school',
      is_system: false,
      description: 'Manage their assigned class — attendance, exams, notices.',
      permissions: [
        'dashboard.view',
        'student.read', 'student.export',
        'class.read', 'section.read',
        'subject.read',
        'timetable.read',
        'attendance.mark', 'attendance.read', 'attendance.export',
        'exam.create', 'exam.read', 'exam.result.enter',
        'notice.read',
        'report.view',
      ],
    },
    {
      id: 'role-sch-002',
      name: 'Subject Teacher',
      code: 'SUBJECT_TEACHER',
      level: 'school',
      is_system: false,
      description: 'Teach subjects, mark attendance for their own periods.',
      permissions: [
        'dashboard.view',
        'student.read',
        'subject.read',
        'timetable.read',
        'attendance.mark', 'attendance.read',
        'exam.result.enter',
      ],
    },
    {
      id: 'role-sch-003',
      name: 'Exam Controller',
      code: 'EXAM_CONTROLLER',
      level: 'school',
      is_system: false,
      description: 'Full control over exam creation, scheduling, and result publishing.',
      permissions: [
        'dashboard.view',
        'student.read', 'student.export',
        'class.read', 'section.read',
        'exam.create', 'exam.read', 'exam.update', 'exam.delete',
        'exam.schedule', 'exam.result.enter', 'exam.result.publish',
        'report.view', 'report.export',
      ],
    },
  ],

  // ── COACHING CENTER ────────────────────────────────────────────────────────
  coaching: [
    {
      id: 'role-coach-001',
      name: 'Senior Faculty',
      code: 'SENIOR_FACULTY',
      level: 'coaching',
      is_system: false,
      description: 'Lead instructor — manages batches, attends, conducts mock tests.',
      permissions: [
        'dashboard.view',
        'student.read', 'student.batch.assign',
        'course.read', 'batch.read',
        'subject.read',
        'attendance.mark', 'attendance.read',
        'exam.create', 'exam.read', 'exam.result.enter',
        'notice.read',
        'report.view',
      ],
    },
    {
      id: 'role-coach-002',
      name: 'Junior Faculty',
      code: 'JUNIOR_FACULTY',
      level: 'coaching',
      is_system: false,
      description: 'Teaches assigned batches, marks attendance only.',
      permissions: [
        'dashboard.view',
        'student.read',
        'course.read', 'batch.read',
        'attendance.mark', 'attendance.read',
        'exam.result.enter',
      ],
    },
    {
      id: 'role-coach-003',
      name: 'Batch Coordinator',
      code: 'BATCH_COORDINATOR',
      level: 'coaching',
      is_system: false,
      description: 'Coordinate batch schedules, enroll/transfer students across batches.',
      permissions: [
        'dashboard.view',
        'student.read', 'student.update', 'student.batch.assign',
        'course.read', 'course.update',
        'batch.create', 'batch.read', 'batch.update',
        'timetable.create', 'timetable.read', 'timetable.update',
        'attendance.read',
        'notice.create', 'notice.read',
        'report.view',
      ],
    },
  ],

  // ── ACADEMY ────────────────────────────────────────────────────────────────
  academy: [
    {
      id: 'role-aca-001',
      name: 'Lead Trainer',
      code: 'LEAD_TRAINER',
      level: 'academy',
      is_system: false,
      description: 'Leads a training program — manages trainees, modules, assessments.',
      permissions: [
        'dashboard.view',
        'student.read', 'student.batch.assign',
        'course.read', 'batch.read',
        'subject.read',
        'attendance.mark', 'attendance.read',
        'exam.create', 'exam.read', 'exam.result.enter',
        'notice.read',
        'report.view',
      ],
    },
    {
      id: 'role-aca-002',
      name: 'Associate Trainer',
      code: 'ASSOCIATE_TRAINER',
      level: 'academy',
      is_system: false,
      description: 'Assists in training sessions, marks attendance and submits assessments.',
      permissions: [
        'dashboard.view',
        'student.read',
        'batch.read', 'course.read',
        'attendance.mark', 'attendance.read',
        'exam.result.enter',
      ],
    },
  ],

  // ── COLLEGE ────────────────────────────────────────────────────────────────
  college: [
    {
      id: 'role-coll-001',
      name: 'Professor',
      code: 'PROFESSOR',
      level: 'college',
      is_system: false,
      description: 'Teaches subjects, marks attendance, enters exam results.',
      permissions: [
        'dashboard.view',
        'student.read',
        'program.read', 'semester.read',
        'subject.create', 'subject.read', 'subject.update',
        'timetable.read',
        'attendance.mark', 'attendance.read', 'attendance.export',
        'exam.create', 'exam.read', 'exam.result.enter', 'exam.result.publish',
        'notice.read',
        'report.view',
      ],
    },
    {
      id: 'role-coll-002',
      name: 'HOD (Head of Department)',
      code: 'HOD',
      level: 'college',
      is_system: false,
      description: 'Oversees a department — manages programs, semesters, approves leaves.',
      permissions: [
        'dashboard.view',
        'student.read', 'student.update', 'student.semester.register',
        'program.create', 'program.read', 'program.update',
        'semester.create', 'semester.read', 'semester.update',
        'department.read', 'department.update',
        'subject.create', 'subject.read', 'subject.update',
        'teacher.read', 'teacher.leave.approve',
        'attendance.read', 'attendance.report',
        'exam.read', 'exam.result.enter',
        'report.view', 'report.export',
      ],
    },
    {
      id: 'role-coll-003',
      name: 'Dean',
      code: 'DEAN',
      level: 'college',
      is_system: false,
      description: 'Academic head — oversees all departments and programs.',
      permissions: [
        'dashboard.view',
        'student.read', 'student.update', 'student.export',
        'program.create', 'program.read', 'program.update',
        'semester.read', 'department.read',
        'teacher.read', 'teacher.update', 'teacher.leave.approve',
        'attendance.read', 'attendance.report',
        'exam.read', 'exam.result.publish',
        'fee.read',
        'report.view', 'report.export', 'report.financial',
        'notice.create', 'notice.read',
      ],
    },
  ],

  // ── UNIVERSITY ─────────────────────────────────────────────────────────────
  university: [
    {
      id: 'role-uni-001',
      name: 'Professor',
      code: 'PROFESSOR',
      level: 'university',
      is_system: false,
      description: 'Teaches courses, supervises research, enters results.',
      permissions: [
        'dashboard.view',
        'student.read',
        'program.read', 'semester.read', 'department.read', 'faculty.read',
        'subject.create', 'subject.read', 'subject.update',
        'timetable.read',
        'attendance.mark', 'attendance.read', 'attendance.export',
        'exam.create', 'exam.read', 'exam.result.enter', 'exam.result.publish',
        'research.create', 'research.read', 'research.update',
        'notice.read',
        'report.view',
      ],
    },
    {
      id: 'role-uni-002',
      name: 'HOD (Head of Department)',
      code: 'HOD',
      level: 'university',
      is_system: false,
      description: 'Manages department — programs, semesters, faculty assignments.',
      permissions: [
        'dashboard.view',
        'student.read', 'student.update',
        'program.create', 'program.read', 'program.update',
        'semester.create', 'semester.read', 'semester.update',
        'department.read', 'department.update',
        'subject.create', 'subject.read', 'subject.update',
        'teacher.read', 'teacher.leave.approve',
        'attendance.read', 'attendance.report',
        'research.read', 'research.update',
        'research.create', 'research.delete',
        'exam.read',
        'report.view', 'report.export',
      ],
    },
    {
      id: 'role-uni-003',
      name: 'Dean of Faculty',
      code: 'DEAN_OF_FACULTY',
      level: 'university',
      is_system: false,
      description: 'Oversees an entire faculty (e.g. Faculty of Engineering).',
      permissions: [
        'dashboard.view',
        'student.read', 'student.update', 'student.export',
        'program.create', 'program.read', 'program.update',
        'semester.read',
        'department.create', 'department.read', 'department.update',
        'faculty.read', 'faculty.update',
        'teacher.read', 'teacher.update', 'teacher.leave.approve',
        'research.create', 'research.read', 'research.update',
        'attendance.read', 'attendance.report',
        'exam.read', 'exam.result.publish',
        'fee.read', 'report.view', 'report.export', 'report.financial',
        'notice.create', 'notice.read',
      ],
    },
    {
      id: 'role-uni-004',
      name: 'Research Supervisor',
      code: 'RESEARCH_SUPERVISOR',
      level: 'university',
      is_system: false,
      description: 'Manages and approves student research projects.',
      permissions: [
        'dashboard.view',
        'student.read',
        'research.create', 'research.read', 'research.update', 'research.delete',
        'report.view',
      ],
    },
  ],
};


// ─────────────────────────────────────────────────────────────────────────────
// SECTION 5 — ALL_ROLES (flat array — all roles from all institute types)
// ─────────────────────────────────────────────────────────────────────────────

export const ALL_ROLES = [
  ...ROLES_BY_INSTITUTE.platform,
  ...ROLES_BY_INSTITUTE.common,
  ...ROLES_BY_INSTITUTE.school,
  ...ROLES_BY_INSTITUTE.coaching,
  ...ROLES_BY_INSTITUTE.academy,
  ...ROLES_BY_INSTITUTE.college,
  ...ROLES_BY_INSTITUTE.university,
];


// ─────────────────────────────────────────────────────────────────────────────
// SECTION 6 — HELPER FUNCTIONS
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Get all permissions relevant to a specific institute type.
 * @param {'school'|'coaching'|'academy'|'college'|'university'} instituteType
 */
export function getPermissionsForType(instituteType) {
  return PERMISSIONS_BY_INSTITUTE[instituteType] ?? PERMISSIONS_BY_INSTITUTE.school;
}

/**
 * Get all roles that apply to a specific institute type.
 * Includes platform + common roles always.
 * @param {'school'|'coaching'|'academy'|'college'|'university'} instituteType
 */
export function getRolesForType(instituteType) {
  return [
    ...ROLES_BY_INSTITUTE.platform,
    ...ROLES_BY_INSTITUTE.common,
    ...(ROLES_BY_INSTITUTE[instituteType] ?? []),
  ];
}

/**
 * Check if a permission string exists in the master list.
 */
export function isValidPermission(perm) {
  return ALL_PERMISSIONS.includes(perm);
}

export default {
  ALL_PERMISSIONS,
  PERMISSION_GROUPS,
  PERMISSIONS_BY_INSTITUTE,
  ROLES_BY_INSTITUTE,
  ALL_ROLES,
  getPermissionsForType,
  getRolesForType,
  isValidPermission,
};
