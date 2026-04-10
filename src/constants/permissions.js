// backend/src/constants/permissions.constants.js

/**
 * COMPLETE PERMISSIONS CONSTANTS
 * The Clouds Academy
 * 
 * Single source of truth for ALL permissions across all user types
 * Includes future-ready permissions for all modules
 */

// ─────────────────────────────────────────────────────────────────────────────
// BASE PERMISSION CODES (Matches DB seed)
// ─────────────────────────────────────────────────────────────────────────────
export const PERM = {
  // Dashboard
  DASHBOARD_VIEW: 'dashboard.view',
  DASHBOARD_ANALYTICS: 'dashboard.analytics',
  DASHBOARD_WIDGETS_CUSTOMIZE: 'dashboard.widgets.customize',

  // Students
  STUDENTS_CREATE: 'students.create',
  STUDENTS_READ: 'students.read',
  STUDENTS_UPDATE: 'students.update',
  STUDENTS_DELETE: 'students.delete',
  STUDENTS_DEACTIVATE: 'students.deactivate',
  STUDENTS_TRANSFER: 'students.transfer',
  STUDENTS_PROMOTE: 'students.promote',
  STUDENTS_EXPORT: 'students.export',
  STUDENTS_IMPORT: 'students.import',
  STUDENTS_BULK_ACTIONS: 'students.bulk_actions',
  STUDENTS_VIEW_DETAILS: 'students.view_details',
  STUDENTS_CONTACT: 'students.contact',
  STUDENTS_DOCUMENTS: 'students.documents',
  STUDENTS_BEHAVIOR: 'students.behavior',

  // Teachers
  TEACHERS_CREATE: 'teachers.create',
  TEACHERS_READ: 'teachers.read',
  TEACHERS_UPDATE: 'teachers.update',
  TEACHERS_DELETE: 'teachers.delete',
  TEACHERS_DEACTIVATE: 'teachers.deactivate',
  TEACHERS_VIEW_SCHEDULE: 'teachers.view_schedule',
  TEACHERS_EVALUATE: 'teachers.evaluate',
  TEACHERS_DOCUMENTS: 'teachers.documents',
  TEACHERS_LEAVE_APPROVE: 'teachers.leave_approve',

  // Parents
  PARENTS_CREATE: 'parents.create',
  PARENTS_READ: 'parents.read',
  PARENTS_UPDATE: 'parents.update',
  PARENTS_DELETE: 'parents.delete',
  PARENTS_DEACTIVATE: 'parents.deactivate',
  PARENTS_COMMUNICATE: 'parents.communicate',
  PARENTS_MEETING_SCHEDULE: 'parents.meeting_schedule',
  PARENTS_VIEW_CHILDREN: 'parents.view_children',

  // Staff
  STAFF_CREATE: 'staff.create',
  STAFF_READ: 'staff.read',
  STAFF_UPDATE: 'staff.update',
  STAFF_DELETE: 'staff.delete',
  STAFF_DEACTIVATE: 'staff.deactivate',
  STAFF_ATTENDANCE: 'staff.attendance',
  STAFF_PAYROLL: 'staff.payroll',
  STAFF_LEAVE: 'staff.leave',
  STAFF_PERFORMANCE: 'staff.performance',
  STAFF_TRAINING: 'staff.training',

  // Classes / Courses / Programs
  CLASSES_CREATE: 'classes.create',
  CLASSES_READ: 'classes.read',
  CLASSES_UPDATE: 'classes.update',
  CLASSES_DELETE: 'classes.delete',
  CLASSES_DEACTIVATE: 'classes.deactivate',
  CLASSES_ASSIGN_TEACHER: 'classes.assign_teacher',
  CLASSES_VIEW_ROSTER: 'classes.view_roster',
  CLASSES_MATERIALS: 'classes.materials',

  // Sections / Batches / Groups
  SECTIONS_CREATE: 'sections.create',
  SECTIONS_READ: 'sections.read',
  SECTIONS_UPDATE: 'sections.update',
  SECTIONS_DELETE: 'sections.delete',
  SECTIONS_DEACTIVATE: 'sections.deactivate',
  SECTIONS_ASSIGN_STUDENTS: 'sections.assign_students',

  // Subjects
  SUBJECTS_CREATE: 'subjects.create',
  SUBJECTS_READ: 'subjects.read',
  SUBJECTS_UPDATE: 'subjects.update',
  SUBJECTS_DELETE: 'subjects.delete',
  SUBJECTS_DEACTIVATE: 'subjects.deactivate',
  SUBJECTS_ASSIGN_TEACHER: 'subjects.assign_teacher',
  SUBJECTS_MATERIALS: 'subjects.materials',

  // Academic Years
  ACADEMIC_YEARS_CREATE: 'academic_years.create',
  ACADEMIC_YEARS_READ: 'academic_years.read',
  ACADEMIC_YEARS_UPDATE: 'academic_years.update',
  ACADEMIC_YEARS_ACTIVATE: 'academic_years.activate',
  ACADEMIC_YEARS_TERMS: 'academic_years.terms',

  // Admissions
  ADMISSIONS_CREATE: 'admissions.create',
  ADMISSIONS_READ: 'admissions.read',
  ADMISSIONS_UPDATE: 'admissions.update',
  ADMISSIONS_APPROVE: 'admissions.approve',
  ADMISSIONS_REJECT: 'admissions.reject',
  ADMISSIONS_INTERVIEW: 'admissions.interview',
  ADMISSIONS_DOCUMENTS: 'admissions.documents',
  ADMISSIONS_FEE: 'admissions.fee',

  // Timetable
  TIMETABLE_CREATE: 'timetable.create',
  TIMETABLE_READ: 'timetable.read',
  TIMETABLE_UPDATE: 'timetable.update',
  TIMETABLE_DELETE: 'timetable.delete',
  TIMETABLE_CONFLICT_CHECK: 'timetable.conflict_check',
  TIMETABLE_EXPORT: 'timetable.export',
  TIMETABLE_TEACHER_VIEW: 'timetable.teacher_view',
  TIMETABLE_STUDENT_VIEW: 'timetable.student_view',

  // Attendance
  ATTENDANCE_MARK: 'attendance.mark',
  ATTENDANCE_VIEW: 'attendance.view',
  ATTENDANCE_REPORT: 'attendance.report',
  ATTENDANCE_EXPORT: 'attendance.export',
  ATTENDANCE_ANALYTICS: 'attendance.analytics',
  ATTENDANCE_BULK_MARK: 'attendance.bulk_mark',
  ATTENDANCE_SELF_MARK: 'attendance.self_mark',
  ATTENDANCE_VERIFY: 'attendance.verify',

  // Staff Attendance
  STAFF_ATTENDANCE_MARK: 'staff_attendance.mark',
  STAFF_ATTENDANCE_VIEW: 'staff_attendance.view',
  STAFF_ATTENDANCE_REPORT: 'staff_attendance.report',
  STAFF_ATTENDANCE_APPROVE: 'staff_attendance.approve',

  // ==================== EXPENSES & FINANCE PERMISSIONS ====================
  // Expenses
  EXPENSES_CREATE: 'expenses.create',
  EXPENSES_READ: 'expenses.read',
  EXPENSES_UPDATE: 'expenses.update',
  EXPENSES_DELETE: 'expenses.delete',
  EXPENSES_APPROVE: 'expenses.approve',
  EXPENSES_REJECT: 'expenses.reject',
  EXPENSES_PAY: 'expenses.pay',
  EXPENSES_REPORT: 'expenses.report',
  EXPENSES_EXPORT: 'expenses.export',
  EXPENSES_ANALYTICS: 'expenses.analytics',
  EXPENSES_BUDGET: 'expenses.budget',
  EXPENSES_BUDGET_ALERTS: 'expenses.budget.alerts',
  EXPENSES_RECEIPT_UPLOAD: 'expenses.receipt.upload',
  EXPENSES_RECEIPT_DELETE: 'expenses.receipt.delete',
  EXPENSES_BULK_ACTIONS: 'expenses.bulk_actions',
  EXPENSES_CATEGORIZE: 'expenses.categorize',
  EXPENSES_TAG: 'expenses.tag',
  EXPENSES_ATTACHMENTS: 'expenses.attachments',
  EXPENSES_NOTES: 'expenses.notes',
  EXPENSES_AUDIT_LOG: 'expenses.audit_log',
  EXPENSES_RECURRING: 'expenses.recurring',
  EXPENSES_PETTY_CASH: 'expenses.petty_cash',
  EXPENSES_TRAVEL: 'expenses.travel',
  EXPENSES_ENTERTAINMENT: 'expenses.entertainment',
  EXPENSES_MEALS: 'expenses.meals',
  EXPENSES_MILEAGE: 'expenses.mileage',
  EXPENSES_ADVANCE: 'expenses.advance',
  EXPENSES_SETTLEMENT: 'expenses.settlement',

  // Expense Categories
  EXPENSE_CATEGORIES_CREATE: 'expense_categories.create',
  EXPENSE_CATEGORIES_READ: 'expense_categories.read',
  EXPENSE_CATEGORIES_UPDATE: 'expense_categories.update',
  EXPENSE_CATEGORIES_DELETE: 'expense_categories.delete',
  EXPENSE_CATEGORIES_DEACTIVATE: 'expense_categories.deactivate',
  EXPENSE_CATEGORIES_BUDGET: 'expense_categories.budget',

  // Vendors / Suppliers
  VENDORS_CREATE: 'vendors.create',
  VENDORS_READ: 'vendors.read',
  VENDORS_UPDATE: 'vendors.update',
  VENDORS_DELETE: 'vendors.delete',
  VENDORS_DEACTIVATE: 'vendors.deactivate',
  VENDORS_APPROVE: 'vendors.approve',
  VENDORS_ASSIGN_STUDENTS: 'vendors.assign_students',
  VENDORS_PAYMENT_HISTORY: 'vendors.payment_history',
  VENDORS_RATINGS: 'vendors.ratings',
  VENDORS_DOCUMENTS: 'vendors.documents',
  VENDORS_CONTRACTS: 'vendors.contracts',
  VENDORS_BANK_DETAILS: 'vendors.bank_details',
  VENDORS_REPORTS: 'vendors.reports',
  VENDORS_EXPORT: 'vendors.export',
  VENDORS_CATEGORIES: 'vendors.categories',

  // ==================== POLICIES & COMPLIANCE PERMISSIONS ====================

  //Policies
  POLICIES_CREATE: 'policies.create',
  POLICIES_READ: 'policies.read',
  POLICIES_UPDATE: 'policies.update',
  POLICIES_DELETE: 'policies.delete',
  POLICIES_ACTIVATE: 'policies.activate',
  POLICIES_DEACTIVATE: 'policies.deactivate',
  POLICIES_VIEW: 'policies.view',
  POLICIES_MANAGE: 'policies.manage',
  POLICIES_BULK_ACTIONS: 'policies.bulk_actions',
  POLICIES_ATTACHMENTS: 'policies.attachments',
  POLICIES_NOTES: 'policies.notes',
  POLICIES_AUDIT_LOG: 'policies.audit_log',
  POLICIES_EXPORT: 'policies.export',
  POLICIES_RECURRING: 'policies.recurring',

  // Fee Policies
  FEE_POLICIES_CREATE: 'fee_policies.create',
  FEE_POLICIES_READ: 'fee_policies.read',
  FEE_POLICIES_UPDATE: 'fee_policies.update',
  FEE_POLICIES_DELETE: 'fee_policies.delete',
  FEE_POLICIES_ACTIVATE: 'fee_policies.activate',
  FEE_POLICIES_APPLY: 'fee_policies.apply',
  FEE_POLICIES_DISCOUNT: 'fee_policies.discount',
  FEE_POLICIES_LATE_FEE: 'fee_policies.late_fee',
  FEE_POLICIES_SCHOLARSHIP: 'fee_policies.scholarship',
  FEE_POLICIES_REFUND: 'fee_policies.refund',

  // Attendance Policies
  ATTENDANCE_POLICIES_CREATE: 'attendance_policies.create',
  ATTENDANCE_POLICIES_READ: 'attendance_policies.read',
  ATTENDANCE_POLICIES_UPDATE: 'attendance_policies.update',
  ATTENDANCE_POLICIES_DELETE: 'attendance_policies.delete',
  ATTENDANCE_POLICIES_ACTIVATE: 'attendance_policies.activate',
  ATTENDANCE_POLICIES_THRESHOLD: 'attendance_policies.threshold',
  ATTENDANCE_POLICIES_ALERTS: 'attendance_policies.alerts',

  // Exam Policies
  EXAM_POLICIES_CREATE: 'exam_policies.create',
  EXAM_POLICIES_READ: 'exam_policies.read',
  EXAM_POLICIES_UPDATE: 'exam_policies.update',
  EXAM_POLICIES_DELETE: 'exam_policies.delete',
  EXAM_POLICIES_GRADING: 'exam_policies.grading',
  EXAM_POLICIES_PASSING: 'exam_policies.passing',
  EXAM_POLICIES_RETAKES: 'exam_policies.retakes',
  EXAM_POLICIES_SUPPLEMENTARY: 'exam_policies.supplementary',
  EXAM_POLICIES_MARKS: 'exam_policies.marks',

  // Leave Policies
  LEAVE_POLICIES_CREATE: 'leave_policies.create',
  LEAVE_POLICIES_READ: 'leave_policies.read',
  LEAVE_POLICIES_UPDATE: 'leave_policies.update',
  LEAVE_POLICIES_DELETE: 'leave_policies.delete',
  LEAVE_POLICIES_ACTIVATE: 'leave_policies.activate',
  LEAVE_POLICIES_ANNUAL: 'leave_policies.annual',
  LEAVE_POLICIES_SICK: 'leave_policies.sick',
  LEAVE_POLICIES_CASUAL: 'leave_policies.casual',
  LEAVE_POLICIES_EMERGENCY: 'leave_policies.emergency',
  LEAVE_POLICIES_CARRY_FORWARD: 'leave_policies.carry_forward',

  // HR Policies
  HR_POLICIES_CREATE: 'hr_policies.create',
  HR_POLICIES_READ: 'hr_policies.read',
  HR_POLICIES_UPDATE: 'hr_policies.update',
  HR_POLICIES_DELETE: 'hr_policies.delete',
  HR_POLICIES_CODE_OF_CONDUCT: 'hr_policies.code_of_conduct',
  HR_POLICIES_DISCIPLINE: 'hr_policies.discipline',
  HR_POLICIES_GRIEVANCE: 'hr_policies.grievance',
  HR_POLICIES_PROMOTION: 'hr_policies.promotion',
  HR_POLICIES_TRANSFER: 'hr_policies.transfer',
  HR_POLICIES_TERMINATION: 'hr_policies.termination',

  // Academic Policies
  ACADEMIC_POLICIES_CREATE: 'academic_policies.create',
  ACADEMIC_POLICIES_READ: 'academic_policies.read',
  ACADEMIC_POLICIES_UPDATE: 'academic_policies.update',
  ACADEMIC_POLICIES_DELETE: 'academic_policies.delete',
  ACADEMIC_POLICIES_PROMOTION: 'academic_policies.promotion',
  ACADEMIC_POLICIES_RETENTION: 'academic_policies.retention',
  ACADEMIC_POLICIES_PROBATION: 'academic_policies.probation',

  // Transport Policies
  TRANSPORT_POLICIES_CREATE: 'transport_policies.create',
  TRANSPORT_POLICIES_READ: 'transport_policies.read',
  TRANSPORT_POLICIES_UPDATE: 'transport_policies.update',
  TRANSPORT_POLICIES_DELETE: 'transport_policies.delete',
  TRANSPORT_POLICIES_FEES: 'transport_policies.fees',
  TRANSPORT_POLICIES_ROUTES: 'transport_policies.routes',
  TRANSPORT_POLICIES_SAFETY: 'transport_policies.safety',

  // Hostel Policies
  HOSTEL_POLICIES_CREATE: 'hostel_policies.create',
  HOSTEL_POLICIES_READ: 'hostel_policies.read',
  HOSTEL_POLICIES_UPDATE: 'hostel_policies.update',
  HOSTEL_POLICIES_DELETE: 'hostel_policies.delete',
  HOSTEL_POLICIES_ALLOCATION: 'hostel_policies.allocation',
  HOSTEL_POLICIES_FEES: 'hostel_policies.fees',
  HOSTEL_POLICIES_CONDUCT: 'hostel_policies.conduct',
  HOSTEL_POLICIES_VISITING: 'hostel_policies.visiting',

  // Library Policies
  LIBRARY_POLICIES_CREATE: 'library_policies.create',
  LIBRARY_POLICIES_READ: 'library_policies.read',
  LIBRARY_POLICIES_UPDATE: 'library_policies.update',
  LIBRARY_POLICIES_DELETE: 'library_policies.delete',
  LIBRARY_POLICIES_BORROWING: 'library_policies.borrowing',
  LIBRARY_POLICIES_FINES: 'library_policies.fines',
  LIBRARY_POLICIES_LOST_BOOKS: 'library_policies.lost_books',

  // IT Policies
  IT_POLICIES_CREATE: 'it_policies.create',
  IT_POLICIES_READ: 'it_policies.read',
  IT_POLICIES_UPDATE: 'it_policies.update',
  IT_POLICIES_DELETE: 'it_policies.delete',
  IT_POLICIES_SECURITY: 'it_policies.security',
  IT_POLICIES_ACCEPTABLE_USE: 'it_policies.acceptable_use',
  IT_POLICIES_DATA_PRIVACY: 'it_policies.data_privacy',

  // ==================== EXAMS & RESULTS PERMISSIONS ====================
  // Exams
  EXAMS_CREATE: 'exams.create',
  EXAMS_READ: 'exams.read',
  EXAMS_UPDATE: 'exams.update',
  EXAMS_DELETE: 'exams.delete',
  EXAMS_DEACTIVATE: 'exams.deactivate',
  EXAMS_SCHEDULE: 'exams.schedule',
  EXAMS_SEATING: 'exams.seating',
  EXAMS_SUPERVISE: 'exams.supervise',
  EXAMS_MANAGE_ATTENDANCE: 'exams.manage_attendance',
  EXAMS_VIEW_OWN: 'exams.view_own',

  // Exam Results
  EXAM_RESULTS_ENTER: 'exam_results.enter',
  EXAM_RESULTS_VIEW: 'exam_results.view',
  EXAM_RESULTS_PUBLISH: 'exam_results.publish',
  EXAM_RESULTS_UPDATE: 'exam_results.update',
  EXAM_RESULTS_DELETE: 'exam_results.delete',
  EXAM_RESULTS_ANALYTICS: 'exam_results.analytics',
  EXAM_RESULTS_EXPORT: 'exam_results.export',
  EXAM_RESULTS_GRADE: 'exam_results.grade',
  EXAM_RESULTS_REMARKS: 'exam_results.remarks',
  EXAM_RESULTS_VIEW_OWN: 'exam_results.view_own',

  // ==================== FEE TEMPLATES ====================
  FEE_TEMPLATES_CREATE: 'fee_templates.create',
  FEE_TEMPLATES_READ: 'fee_templates.read',
  FEE_TEMPLATES_UPDATE: 'fee_templates.update',
  FEE_TEMPLATES_DELETE: 'fee_templates.delete',
  FEE_TEMPLATES_DEACTIVATE: 'fee_templates.deactivate',

  // Fees & Finance
  FEES_CREATE: 'fees.create',
  FEES_READ: 'fees.read',
  FEES_COLLECT: 'fees.collect',
  FEES_UPDATE: 'fees.update',
  FEES_REPORT: 'fees.report',
  FEES_DELETE: 'fees.delete',
  FEES_DISCOUNT: 'fees.discount',
  FEES_EXPORT: 'fees.export',
  FEES_DUE_REMINDER: 'fees.due_reminder',
  FEES_RECEIPT: 'fees.receipt',
  FEES_REFUND: 'fees.refund',
  FEES_LATE_FEE: 'fees.late_fee',
  FEES_SCHOLARSHIP: 'fees.scholarship',

  // Payroll
  PAYROLL_CREATE: 'payroll.create',
  PAYROLL_READ: 'payroll.read',
  PAYROLL_PROCESS: 'payroll.process',
  PAYROLL_REPORT: 'payroll.report',
  PAYROLL_SALARY_STRUCTURE: 'payroll.salary_structure',
  PAYROLL_TAX: 'payroll.tax',
  PAYROLL_BONUS: 'payroll.bonus',
  PAYROLL_DEDUCTION: 'payroll.deduction',

  // ==================== BUDGET & FORECASTING ====================
  BUDGET_VIEW: 'budget.view',
  BUDGET_CREATE: 'budget.create',
  BUDGET_UPDATE: 'budget.update',
  BUDGET_DELETE: 'budget.delete',
  BUDGET_APPROVE: 'budget.approve',
  BUDGET_REALLOCATE: 'budget.reallocate',
  BUDGET_FORECAST: 'budget.forecast',
  BUDGET_REPORT: 'budget.report',
  BUDGET_ANALYTICS: 'budget.analytics',
  BUDGET_ALERTS: 'budget.alerts',

  // ==================== ACCOUNTING ====================
  ACCOUNTING_LEDGER: 'accounting.ledger',
  ACCOUNTING_JOURNAL: 'accounting.journal',
  ACCOUNTING_TRIAL_BALANCE: 'accounting.trial_balance',
  ACCOUNTING_PROFIT_LOSS: 'accounting.profit_loss',
  ACCOUNTING_BALANCE_SHEET: 'accounting.balance_sheet',
  ACCOUNTING_CASH_FLOW: 'accounting.cash_flow',
  ACCOUNTING_CLOSING: 'accounting.closing',
  ACCOUNTING_AUDIT: 'accounting.audit',
  ACCOUNTING_TAX: 'accounting.tax',

  // Notices
  NOTICES_CREATE: 'notices.create',
  NOTICES_READ: 'notices.read',
  NOTICES_UPDATE: 'notices.update',
  NOTICES_DELETE: 'notices.delete',
  NOTICES_DEACTIVATE: 'notices.deactivate',
  NOTICES_TARGET: 'notices.target',
  NOTICES_PRIORITY: 'notices.priority',

  // Notifications
  NOTIFICATIONS_SEND: 'notifications.send',
  NOTIFICATIONS_READ: 'notifications.read',
  NOTIFICATIONS_MANAGE: 'notifications.manage',
  NOTIFICATIONS_TEMPLATES: 'notifications.templates',
  NOTIFICATIONS_PUSH: 'notifications.push',
  NOTIFICATIONS_EMAIL: 'notifications.email',
  NOTIFICATIONS_SMS: 'notifications.sms',

  // Homework
  HOMEWORK_CREATE: 'homework.create',
  HOMEWORK_READ: 'homework.read',
  HOMEWORK_UPDATE: 'homework.update',
  HOMEWORK_DELETE: 'homework.delete',
  HOMEWORK_SUBMIT: 'homework.submit',
  HOMEWORK_GRADE: 'homework.grade',
  HOMEWORK_ATTACHMENTS: 'homework.attachments',

  // Assignments
  ASSIGNMENTS_CREATE: 'assignments.create',
  ASSIGNMENTS_READ: 'assignments.read',
  ASSIGNMENTS_UPDATE: 'assignments.update',
  ASSIGNMENTS_DELETE: 'assignments.delete',
  ASSIGNMENTS_SUBMIT: 'assignments.submit',
  ASSIGNMENTS_GRADE: 'assignments.grade',
  ASSIGNMENTS_ATTACHMENTS: 'assignments.attachments',

  // Notes / Study Material
  NOTES_CREATE: 'notes.create',
  NOTES_READ: 'notes.read',
  NOTES_UPDATE: 'notes.update',
  NOTES_DELETE: 'notes.delete',
  NOTES_DOWNLOAD: 'notes.download',
  NOTES_SHARE: 'notes.share',
  NOTES_CATEGORIZE: 'notes.categorize',

  // Syllabus
  SYLLABUS_CREATE: 'syllabus.create',
  SYLLABUS_READ: 'syllabus.read',
  SYLLABUS_UPDATE: 'syllabus.update',
  SYLLABUS_DELETE: 'syllabus.delete',
  SYLLABUS_TOPICS: 'syllabus.topics',
  SYLLABUS_PROGRESS: 'syllabus.progress',

  // Reports
  REPORTS_STUDENT: 'reports.student',
  REPORTS_ATTENDANCE: 'reports.attendance',
  REPORTS_FEE: 'reports.fee',
  REPORTS_EXAM: 'reports.exam',
  REPORTS_ANALYTICS: 'reports.analytics',
  REPORTS_PAYROLL: 'reports.payroll',
  REPORTS_TEACHER: 'reports.teacher',
  REPORTS_CLASS: 'reports.class',
  REPORTS_CUSTOM: 'reports.custom',
  REPORTS_EXPORT: 'reports.export',
  REPORTS_EXPENSES: 'reports.expenses',
  REPORTS_VENDORS: 'reports.vendors',
  REPORTS_BUDGET: 'reports.budget',

  // Roles & Permissions
  ROLES_READ: 'roles.read',
  ROLES_CREATE: 'roles.create',
  ROLES_UPDATE: 'roles.update',
  ROLES_DELETE: 'roles.delete',
  ROLES_DEACTIVATE: 'roles.deactivate',
  ROLES_ASSIGN: 'roles.assign',
  ROLES_PERMISSIONS: 'roles.permissions',

  // Users
  USERS_CREATE: 'users.create',
  USERS_READ: 'users.read',
  USERS_UPDATE: 'users.update',
  USERS_DELETE: 'users.delete',
  USERS_DEACTIVATE: 'users.deactivate',
  USERS_PROFILE: 'users.profile',
  USERS_PASSWORD: 'users.password',

  // Branches
  BRANCHES_CREATE: 'branches.create',
  BRANCHES_READ: 'branches.read',
  BRANCHES_UPDATE: 'branches.update',
  BRANCHES_DELETE: 'branches.delete',
  BRANCHES_DEACTIVATE: 'branches.deactivate',
  BRANCHES_ASSIGN_ROLE: 'branches.assign_role',
  BRANCHES_TRANSFER: 'branches.transfer',

  // Settings
  SETTINGS_VIEW: 'settings.view',
  SETTINGS_UPDATE: 'settings.update',
  SETTINGS_SYSTEM: 'settings.system',
  SETTINGS_ACADEMIC: 'settings.academic',
  SETTINGS_FINANCE: 'settings.finance',
  SETTINGS_NOTIFICATIONS: 'settings.notifications',

  // Library
  LIBRARY_ACCESS: 'library.access',
  LIBRARY_BOOKS_READ: 'library.books.read',
  LIBRARY_BOOKS_ISSUE: 'library.books.issue',
  LIBRARY_BOOKS_ADD: 'library.books.add',
  LIBRARY_BOOKS_UPDATE: 'library.books.update',
  LIBRARY_BOOKS_DELETE: 'library.books.delete',
  LIBRARY_CATEGORIES: 'library.categories',
  LIBRARY_REPORTS: 'library.reports',
  LIBRARY_FINES: 'library.fines',

  // Courses
  COURSES_CREATE: 'courses.create',
  COURSES_READ: 'courses.read',
  COURSES_UPDATE: 'courses.update',
  COURSES_DELETE: 'courses.delete',
  COURSES_MATERIALS: 'courses.materials',
  COURSES_ASSIGNMENTS: 'courses.assignments',
  COURSES_ASSESSMENTS: 'courses.assessments',

  // Batches
  BATCHES_CREATE: 'batches.create',
  BATCHES_READ: 'batches.read',
  BATCHES_UPDATE: 'batches.update',
  BATCHES_DELETE: 'batches.delete',
  BATCHES_STUDENTS: 'batches.students',
  BATCHES_TIMETABLE: 'batches.timetable',

  // Programs
  PROGRAMS_CREATE: 'programs.create',
  PROGRAMS_READ: 'programs.read',
  PROGRAMS_UPDATE: 'programs.update',
  PROGRAMS_DELETE: 'programs.delete',
  PROGRAMS_COURSES: 'programs.courses',
  PROGRAMS_REQUIREMENTS: 'programs.requirements',

  // Semesters
  SEMESTERS_CREATE: 'semesters.create',
  SEMESTERS_READ: 'semesters.read',
  SEMESTERS_UPDATE: 'semesters.update',
  SEMESTERS_ACTIVATE: 'semesters.activate',
  SEMESTERS_COURSES: 'semesters.courses',
  SEMESTERS_REGISTRATION: 'semesters.registration',

  // Departments
  DEPARTMENTS_CREATE: 'departments.create',
  DEPARTMENTS_READ: 'departments.read',
  DEPARTMENTS_UPDATE: 'departments.update',
  DEPARTMENTS_DELETE: 'departments.delete',
  DEPARTMENTS_STAFF: 'departments.staff',
  DEPARTMENTS_BUDGET: 'departments.budget',

  // Research
  RESEARCH_READ: 'research.read',
  RESEARCH_SUBMIT: 'research.submit',
  RESEARCH_APPROVE: 'research.approve',
  RESEARCH_PUBLISH: 'research.publish',
  RESEARCH_GRANTS: 'research.grants',
  RESEARCH_COLLABORATION: 'research.collaboration',

  // Calendar
  CALENDAR_VIEW: 'calendar.view',
  CALENDAR_CREATE: 'calendar.create',
  CALENDAR_UPDATE: 'calendar.update',
  CALENDAR_DELETE: 'calendar.delete',
  CALENDAR_EVENTS: 'calendar.events',
  CALENDAR_HOLIDAYS: 'calendar.holidays',

  // Communication
  COMMUNICATION_SEND: 'communication.send',
  COMMUNICATION_READ: 'communication.read',
  COMMUNICATION_GROUPS: 'communication.groups',
  COMMUNICATION_TEMPLATES: 'communication.templates',
  COMMUNICATION_HISTORY: 'communication.history',

  // Transport
  TRANSPORT_VIEW: 'transport.view',
  TRANSPORT_MANAGE: 'transport.manage',
  TRANSPORT_ROUTES: 'transport.routes',
  TRANSPORT_VEHICLES: 'transport.vehicles',
  TRANSPORT_FEES: 'transport.fees',
  TRANSPORT_TRACKING: 'transport.tracking',

  // Hostel
  HOSTEL_VIEW: 'hostel.view',
  HOSTEL_MANAGE: 'hostel.manage',
  HOSTEL_ROOMS: 'hostel.rooms',
  HOSTEL_ALLOCATION: 'hostel.allocation',
  HOSTEL_FEES: 'hostel.fees',
  HOSTEL_ATTENDANCE: 'hostel.attendance',

  // Inventory
  INVENTORY_VIEW: 'inventory.view',
  INVENTORY_MANAGE: 'inventory.manage',
  INVENTORY_ITEMS: 'inventory.items',
  INVENTORY_PURCHASE: 'inventory.purchase',
  INVENTORY_ISSUE: 'inventory.issue',
  INVENTORY_REPORTS: 'inventory.reports',

  // Student Profile
  STUDENT_PROFILE_VIEW: 'student.profile.view',
  STUDENT_PROFILE_EDIT: 'student.profile.edit',
  STUDENT_DOCUMENTS_VIEW: 'student.documents.view',
  STUDENT_DOCUMENTS_UPLOAD: 'student.documents.upload',
  STUDENT_BEHAVIOR_LOG: 'student.behavior.log',
  STUDENT_ACHIEVEMENTS: 'student.achievements',
  STUDENT_REMARKS: 'student.remarks',

  // Teacher Profile
  TEACHER_PROFILE_VIEW: 'teacher.profile.view',
  TEACHER_PROFILE_EDIT: 'teacher.profile.edit',
  TEACHER_ACHIEVEMENTS: 'teacher.achievements',
  TEACHER_REMARKS: 'teacher.remarks',
  TEACHER_LEAVE: 'teacher.leave',
  TEACHER_SUBSTITUTE: 'teacher.substitute',

  // Parent Profile
  PARENT_PROFILE_VIEW: 'parent.profile.view',
  PARENT_PROFILE_EDIT: 'parent.profile.edit',
  PARENT_COMMUNICATION: 'parent.communication',
  PARENT_MEETINGS: 'parent.meetings',
  PARENT_FEEDBACK: 'parent.feedback',
  PARENT_DOCUMENTS: 'parent.documents',

  // ==================== AUDIT & COMPLIANCE ====================
  AUDIT_LOG_VIEW: 'audit.log.view',
  AUDIT_LOG_EXPORT: 'audit.log.export',
  AUDIT_LOG_DELETE: 'audit.log.delete',
  COMPLIANCE_REPORTS: 'compliance.reports',
  COMPLIANCE_DATA_RETENTION: 'compliance.data_retention',
  COMPLIANCE_GDPR: 'compliance.gdpr',
  COMPLIANCE_PIPEDA: 'compliance.pipeda',

  // ==================== WORKFLOW & APPROVALS ====================
  WORKFLOW_VIEW: 'workflow.view',
  WORKFLOW_CREATE: 'workflow.create',
  WORKFLOW_UPDATE: 'workflow.update',
  WORKFLOW_DELETE: 'workflow.delete',
  WORKFLOW_APPROVE: 'workflow.approve',
  WORKFLOW_REJECT: 'workflow.reject',
  WORKFLOW_ASSIGN: 'workflow.assign',

  // ==================== TASKS & PROJECTS ====================
  TASKS_CREATE: 'tasks.create',
  TASKS_READ: 'tasks.read',
  TASKS_UPDATE: 'tasks.update',
  TASKS_DELETE: 'tasks.delete',
  TASKS_ASSIGN: 'tasks.assign',
  TASKS_STATUS: 'tasks.status',
  PROJECTS_CREATE: 'projects.create',
  PROJECTS_READ: 'projects.read',
  PROJECTS_UPDATE: 'projects.update',
  PROJECTS_DELETE: 'projects.delete',
  PROJECTS_MANAGE: 'projects.manage',

  // ==================== SURVEYS & FEEDBACK ====================
  SURVEYS_CREATE: 'surveys.create',
  SURVEYS_READ: 'surveys.read',
  SURVEYS_UPDATE: 'surveys.update',
  SURVEYS_DELETE: 'surveys.delete',
  SURVEYS_RESPOND: 'surveys.respond',
  SURVEYS_ANALYTICS: 'surveys.analytics',
  FEEDBACK_SUBMIT: 'feedback.submit',
  FEEDBACK_VIEW: 'feedback.view',
  FEEDBACK_MANAGE: 'feedback.manage',

  // ==================== CERTIFICATES & DEGREES ====================
  CERTIFICATES_GENERATE: 'certificates.generate',
  CERTIFICATES_VIEW: 'certificates.view',
  CERTIFICATES_VERIFY: 'certificates.verify',
  CERTIFICATES_DOWNLOAD: 'certificates.download',
  DEGREES_ISSUE: 'degrees.issue',
  DEGREES_VERIFY: 'degrees.verify',
  DEGREES_TRANSCRIPTS: 'degrees.transcripts',

  // ==================== ALUMNI ====================
  ALUMNI_VIEW: 'alumni.view',
  ALUMNI_MANAGE: 'alumni.manage',
  ALUMNI_COMMUNICATE: 'alumni.communicate',
  ALUMNI_EVENTS: 'alumni.events',
  ALUMNI_DONATIONS: 'alumni.donations',
  ALUMNI_EMPLOYMENT: 'alumni.employment',

  // ==================== Self Attendance ====================
  ATTENDANCE_SELF_MARK: 'self_attendance.mark',
  ATTENDANCE_SELF_VIEW: 'self_attendance.view',
  ATTENDANCE_SELF_EXPORT: 'self_attendance.export',
  ATTENDANCE_SELF_ANALYTICS: 'self_attendance.analytics',


  // ==================== Self Payroll ====================
  PAYROLL_SELF_VIEW: 'self_payroll.view',
  PAYROLL_SELF_EXPORT: 'self_payroll.export',
  PAYROLL_SELF_ANALYTICS: 'self_payroll.analytics',
  PAYROLL_SELF_CREATE: 'self_payroll.create',
  // PAYROLL_SELF_UPDATE:      'self_payroll.update',
  // PAYROLL_SELF_DELETE:      'self_payroll.delete',
  // PAYROLL_SELF_APPROVE:     'self_payroll.approve',
  // PAYROLL_SELF_REJECT:      'self_payroll.reject',
  PAYROLL_SELF_PAY_SLIP: 'self_payroll.pay_slip',
  PAYROLL_SELF_PAY: 'self_payroll.pay',
};

// ─────────────────────────────────────────────────────────────────────────────
// INSTITUTE ADMIN PERMISSION GROUPS (Master/Platform Level)
// ─────────────────────────────────────────────────────────────────────────────
export const ADMIN_PERMISSION_GROUPS = [
  {
    label: 'Dashboard',
    icon: '📊',
    perms: [
      PERM.DASHBOARD_VIEW,
      PERM.DASHBOARD_ANALYTICS,
      PERM.DASHBOARD_WIDGETS_CUSTOMIZE,
    ],
  },
  {
    label: 'Students',
    icon: '🎓',
    perms: [
      PERM.STUDENTS_CREATE, PERM.STUDENTS_READ, PERM.STUDENTS_UPDATE,
      PERM.STUDENTS_DELETE, PERM.STUDENTS_DEACTIVATE, PERM.STUDENTS_TRANSFER,
      PERM.STUDENTS_PROMOTE, PERM.STUDENTS_EXPORT, PERM.STUDENTS_IMPORT,
      PERM.STUDENTS_BULK_ACTIONS, PERM.STUDENTS_VIEW_DETAILS, PERM.STUDENTS_CONTACT,
      PERM.STUDENTS_DOCUMENTS, PERM.STUDENTS_BEHAVIOR,
      PERM.STUDENT_PROFILE_VIEW, PERM.STUDENT_PROFILE_EDIT,
      PERM.STUDENT_DOCUMENTS_UPLOAD, PERM.STUDENT_ACHIEVEMENTS,
      PERM.STUDENT_REMARKS, PERM.STUDENT_BEHAVIOR_LOG,
    ],
  },
  {
    label: 'Teachers',
    icon: '👩‍🏫',
    perms: [
      PERM.TEACHERS_CREATE, PERM.TEACHERS_READ, PERM.TEACHERS_UPDATE,
      PERM.TEACHERS_DELETE, PERM.TEACHERS_DEACTIVATE, PERM.TEACHERS_VIEW_SCHEDULE,
      PERM.TEACHERS_EVALUATE, PERM.TEACHERS_DOCUMENTS, PERM.TEACHERS_LEAVE_APPROVE,
      PERM.TEACHER_PROFILE_VIEW, PERM.TEACHER_PROFILE_EDIT,
      PERM.TEACHER_ACHIEVEMENTS, PERM.TEACHER_REMARKS,
      PERM.TEACHER_LEAVE, PERM.TEACHER_SUBSTITUTE,
    ],
  },
  {
    label: 'Parents',
    icon: '👨‍👩‍👧',
    perms: [
      PERM.PARENTS_CREATE, PERM.PARENTS_READ, PERM.PARENTS_UPDATE,
      PERM.PARENTS_DELETE, PERM.PARENTS_DEACTIVATE, PERM.PARENTS_COMMUNICATE,
      PERM.PARENTS_MEETING_SCHEDULE, PERM.PARENTS_VIEW_CHILDREN,
      PERM.PARENT_PROFILE_VIEW, PERM.PARENT_PROFILE_EDIT,
      PERM.PARENT_COMMUNICATION, PERM.PARENT_MEETINGS,
      PERM.PARENT_FEEDBACK, PERM.PARENT_DOCUMENTS,
    ],
  },
  {
    label: 'Staff',
    icon: '💼',
    perms: [
      PERM.STAFF_CREATE, PERM.STAFF_READ, PERM.STAFF_UPDATE,
      PERM.STAFF_DELETE, PERM.STAFF_DEACTIVATE, PERM.STAFF_ATTENDANCE,
      PERM.STAFF_PAYROLL, PERM.STAFF_LEAVE, PERM.STAFF_PERFORMANCE,
      PERM.STAFF_TRAINING,
    ],
  },
  {
    label: 'Expenses',
    icon: '💰',
    perms: [
      PERM.EXPENSES_CREATE, PERM.EXPENSES_READ, PERM.EXPENSES_UPDATE,
      PERM.EXPENSES_DELETE, PERM.EXPENSES_APPROVE, PERM.EXPENSES_REJECT,
      PERM.EXPENSES_PAY, PERM.EXPENSES_REPORT, PERM.EXPENSES_EXPORT,
      PERM.EXPENSES_ANALYTICS, PERM.EXPENSES_BUDGET, PERM.EXPENSES_BUDGET_ALERTS,
      PERM.EXPENSES_RECEIPT_UPLOAD, PERM.EXPENSES_BULK_ACTIONS,
      PERM.EXPENSES_CATEGORIZE, PERM.EXPENSES_TAG, PERM.EXPENSES_ATTACHMENTS,
      PERM.EXPENSES_AUDIT_LOG, PERM.EXPENSES_RECURRING, PERM.EXPENSES_PETTY_CASH,
      PERM.EXPENSES_TRAVEL, PERM.EXPENSES_ENTERTAINMENT, PERM.EXPENSES_MEALS,
      PERM.EXPENSES_MILEAGE, PERM.EXPENSES_ADVANCE, PERM.EXPENSES_SETTLEMENT,
      PERM.EXPENSE_CATEGORIES_CREATE, PERM.EXPENSE_CATEGORIES_READ,
      PERM.EXPENSE_CATEGORIES_UPDATE, PERM.EXPENSE_CATEGORIES_DELETE,
      PERM.EXPENSE_CATEGORIES_BUDGET,
    ],
  },
  {
    label: 'Vendors',
    icon: '🏪',
    perms: [
      PERM.VENDORS_CREATE, PERM.VENDORS_READ, PERM.VENDORS_UPDATE,
      PERM.VENDORS_DELETE, PERM.VENDORS_DEACTIVATE, PERM.VENDORS_APPROVE,
      PERM.VENDORS_ASSIGN_STUDENTS, PERM.VENDORS_PAYMENT_HISTORY,
      PERM.VENDORS_RATINGS, PERM.VENDORS_DOCUMENTS, PERM.VENDORS_CONTRACTS,
      PERM.VENDORS_BANK_DETAILS, PERM.VENDORS_REPORTS, PERM.VENDORS_EXPORT,
      PERM.VENDORS_CATEGORIES,
    ],
  },
  {
    label: 'Policies',
    icon: '📜',
    perms: [
      PERM.POLICIES_CREATE, PERM.POLICIES_READ, PERM.POLICIES_UPDATE,
      PERM.POLICIES_DELETE, PERM.POLICIES_ACTIVATE, PERM.POLICIES_DEACTIVATE, PERM.POLICIES_VIEW,
      PERM.POLICIES_MANAGE, PERM.POLICIES_BULK_ACTIONS, PERM.POLICIES_ATTACHMENTS,
      PERM.POLICIES_NOTES, PERM.POLICIES_AUDIT_LOG, PERM.POLICIES_EXPORT,
      PERM.POLICIES_RECURRING,
      PERM.FEE_POLICIES_CREATE, PERM.FEE_POLICIES_READ, PERM.FEE_POLICIES_UPDATE,
      PERM.FEE_POLICIES_DELETE, PERM.FEE_POLICIES_ACTIVATE, PERM.FEE_POLICIES_APPLY,
      PERM.FEE_POLICIES_DISCOUNT, PERM.FEE_POLICIES_LATE_FEE, PERM.FEE_POLICIES_SCHOLARSHIP,
      PERM.FEE_POLICIES_REFUND,
      PERM.ATTENDANCE_POLICIES_CREATE, PERM.ATTENDANCE_POLICIES_READ,
      PERM.ATTENDANCE_POLICIES_UPDATE, PERM.ATTENDANCE_POLICIES_DELETE,
      PERM.ATTENDANCE_POLICIES_ACTIVATE, PERM.ATTENDANCE_POLICIES_THRESHOLD,
      PERM.ATTENDANCE_POLICIES_ALERTS,
      PERM.EXAM_POLICIES_CREATE, PERM.EXAM_POLICIES_READ, PERM.EXAM_POLICIES_UPDATE,
      PERM.EXAM_POLICIES_DELETE, PERM.EXAM_POLICIES_GRADING, PERM.EXAM_POLICIES_PASSING,
      PERM.EXAM_POLICIES_RETAKES, PERM.EXAM_POLICIES_SUPPLEMENTARY, PERM.EXAM_POLICIES_MARKS,
      PERM.LEAVE_POLICIES_CREATE, PERM.LEAVE_POLICIES_READ, PERM.LEAVE_POLICIES_UPDATE,
      PERM.LEAVE_POLICIES_DELETE, PERM.LEAVE_POLICIES_ACTIVATE, PERM.LEAVE_POLICIES_ANNUAL,
      PERM.LEAVE_POLICIES_SICK, PERM.LEAVE_POLICIES_CASUAL, PERM.LEAVE_POLICIES_EMERGENCY,
      PERM.LEAVE_POLICIES_CARRY_FORWARD,
      PERM.HR_POLICIES_CREATE, PERM.HR_POLICIES_READ, PERM.HR_POLICIES_UPDATE,
      PERM.HR_POLICIES_DELETE, PERM.HR_POLICIES_CODE_OF_CONDUCT, PERM.HR_POLICIES_DISCIPLINE,
      PERM.HR_POLICIES_GRIEVANCE, PERM.HR_POLICIES_PROMOTION, PERM.HR_POLICIES_TRANSFER,
      PERM.HR_POLICIES_TERMINATION,
      PERM.ACADEMIC_POLICIES_CREATE, PERM.ACADEMIC_POLICIES_READ, PERM.ACADEMIC_POLICIES_UPDATE,
      PERM.ACADEMIC_POLICIES_DELETE, PERM.ACADEMIC_POLICIES_PROMOTION, PERM.ACADEMIC_POLICIES_RETENTION,
      PERM.ACADEMIC_POLICIES_PROBATION,
      PERM.TRANSPORT_POLICIES_CREATE, PERM.TRANSPORT_POLICIES_READ, PERM.TRANSPORT_POLICIES_UPDATE,
      PERM.TRANSPORT_POLICIES_DELETE, PERM.TRANSPORT_POLICIES_FEES, PERM.TRANSPORT_POLICIES_ROUTES,
      PERM.TRANSPORT_POLICIES_SAFETY,
      PERM.HOSTEL_POLICIES_CREATE, PERM.HOSTEL_POLICIES_READ, PERM.HOSTEL_POLICIES_UPDATE,
      PERM.HOSTEL_POLICIES_DELETE, PERM.HOSTEL_POLICIES_ALLOCATION, PERM.HOSTEL_POLICIES_FEES,
      PERM.HOSTEL_POLICIES_CONDUCT, PERM.HOSTEL_POLICIES_VISITING,
      PERM.LIBRARY_POLICIES_CREATE, PERM.LIBRARY_POLICIES_READ, PERM.LIBRARY_POLICIES_UPDATE,
      PERM.LIBRARY_POLICIES_DELETE, PERM.LIBRARY_POLICIES_BORROWING, PERM.LIBRARY_POLICIES_FINES,
      PERM.LIBRARY_POLICIES_LOST_BOOKS,
      PERM.IT_POLICIES_CREATE, PERM.IT_POLICIES_READ, PERM.IT_POLICIES_UPDATE,
      PERM.IT_POLICIES_DELETE, PERM.IT_POLICIES_SECURITY, PERM.IT_POLICIES_ACCEPTABLE_USE,
      PERM.IT_POLICIES_DATA_PRIVACY,
    ],
  },
  {
    label: 'Budget & Accounting',
    icon: '💰',
    perms: [
      PERM.BUDGET_VIEW, PERM.BUDGET_CREATE, PERM.BUDGET_UPDATE,
      PERM.BUDGET_DELETE, PERM.BUDGET_APPROVE, PERM.BUDGET_REALLOCATE,
      PERM.BUDGET_FORECAST, PERM.BUDGET_REPORT, PERM.BUDGET_ANALYTICS,
      PERM.BUDGET_ALERTS,
      PERM.ACCOUNTING_LEDGER, PERM.ACCOUNTING_JOURNAL, PERM.ACCOUNTING_TRIAL_BALANCE,
      PERM.ACCOUNTING_PROFIT_LOSS, PERM.ACCOUNTING_BALANCE_SHEET, PERM.ACCOUNTING_CASH_FLOW,
      PERM.ACCOUNTING_CLOSING, PERM.ACCOUNTING_AUDIT, PERM.ACCOUNTING_TAX,
    ],
  },
  {
    label: 'Classes & Sections',
    icon: '🏫',
    perms: [
      PERM.CLASSES_CREATE, PERM.CLASSES_READ, PERM.CLASSES_UPDATE,
      PERM.CLASSES_DELETE, PERM.CLASSES_DEACTIVATE, PERM.CLASSES_ASSIGN_TEACHER,
      PERM.CLASSES_VIEW_ROSTER, PERM.CLASSES_MATERIALS,
      PERM.SECTIONS_CREATE, PERM.SECTIONS_READ, PERM.SECTIONS_UPDATE,
      PERM.SECTIONS_DELETE, PERM.SECTIONS_DEACTIVATE, PERM.SECTIONS_ASSIGN_STUDENTS,
    ],
  },
  {
    label: 'Subjects',
    icon: '📗',
    perms: [
      PERM.SUBJECTS_CREATE, PERM.SUBJECTS_READ, PERM.SUBJECTS_UPDATE,
      PERM.SUBJECTS_DELETE, PERM.SUBJECTS_DEACTIVATE, PERM.SUBJECTS_ASSIGN_TEACHER,
      PERM.SUBJECTS_MATERIALS,
    ],
  },
  {
    label: 'Courses & Batches',
    icon: '📚',
    perms: [
      PERM.COURSES_CREATE, PERM.COURSES_READ, PERM.COURSES_UPDATE,
      PERM.COURSES_DELETE, PERM.COURSES_MATERIALS, PERM.COURSES_ASSIGNMENTS,
      PERM.COURSES_ASSESSMENTS,
      PERM.BATCHES_CREATE, PERM.BATCHES_READ, PERM.BATCHES_UPDATE,
      PERM.BATCHES_DELETE, PERM.BATCHES_STUDENTS, PERM.BATCHES_TIMETABLE,
    ],
  },
  {
    label: 'Academic Years',
    icon: '📆',
    perms: [
      PERM.ACADEMIC_YEARS_CREATE, PERM.ACADEMIC_YEARS_READ,
      PERM.ACADEMIC_YEARS_UPDATE, PERM.ACADEMIC_YEARS_ACTIVATE,
      PERM.ACADEMIC_YEARS_TERMS,
    ],
  },
  {
    label: 'Admissions',
    icon: '📝',
    perms: [
      PERM.ADMISSIONS_CREATE, PERM.ADMISSIONS_READ,
      PERM.ADMISSIONS_UPDATE, PERM.ADMISSIONS_APPROVE,
      PERM.ADMISSIONS_REJECT, PERM.ADMISSIONS_INTERVIEW,
      PERM.ADMISSIONS_DOCUMENTS, PERM.ADMISSIONS_FEE,
    ],
  },
  {
    label: 'Timetable',
    icon: '🗓',
    perms: [
      PERM.TIMETABLE_CREATE, PERM.TIMETABLE_READ, PERM.TIMETABLE_UPDATE,
      PERM.TIMETABLE_DELETE, PERM.TIMETABLE_CONFLICT_CHECK, PERM.TIMETABLE_EXPORT,
    ],
  },
  {
    label: 'Attendance',
    icon: '✅',
    perms: [
      PERM.ATTENDANCE_MARK, PERM.ATTENDANCE_VIEW,
      PERM.ATTENDANCE_REPORT, PERM.ATTENDANCE_EXPORT,
      PERM.ATTENDANCE_ANALYTICS, PERM.ATTENDANCE_BULK_MARK,
      PERM.ATTENDANCE_VERIFY,
      PERM.STAFF_ATTENDANCE_MARK, PERM.STAFF_ATTENDANCE_VIEW,
      PERM.STAFF_ATTENDANCE_REPORT, PERM.STAFF_ATTENDANCE_APPROVE,
    ],
  },
  {
    label: 'Exams',
    icon: '🧪',
    perms: [
      PERM.EXAMS_CREATE, PERM.EXAMS_READ, PERM.EXAMS_UPDATE,
      PERM.EXAMS_DELETE, PERM.EXAMS_DEACTIVATE, PERM.EXAMS_SCHEDULE,
      PERM.EXAMS_SEATING, PERM.EXAMS_SUPERVISE,
      PERM.EXAMS_MANAGE_ATTENDANCE,
    ],
  },
  {
    label: 'Exam Results',
    icon: '📈',
    perms: [
      PERM.EXAM_RESULTS_ENTER, PERM.EXAM_RESULTS_VIEW,
      PERM.EXAM_RESULTS_PUBLISH, PERM.EXAM_RESULTS_UPDATE,
      PERM.EXAM_RESULTS_DELETE, PERM.EXAM_RESULTS_ANALYTICS,
      PERM.EXAM_RESULTS_EXPORT, PERM.EXAM_RESULTS_GRADE,
      PERM.EXAM_RESULTS_REMARKS,
    ],
  },
  {
    label: 'Homework & Assignments',
    icon: '📝',
    perms: [
      PERM.HOMEWORK_CREATE, PERM.HOMEWORK_READ, PERM.HOMEWORK_UPDATE,
      PERM.HOMEWORK_DELETE, PERM.HOMEWORK_GRADE, PERM.HOMEWORK_ATTACHMENTS,
      PERM.ASSIGNMENTS_CREATE, PERM.ASSIGNMENTS_READ, PERM.ASSIGNMENTS_UPDATE,
      PERM.ASSIGNMENTS_DELETE, PERM.ASSIGNMENTS_GRADE, PERM.ASSIGNMENTS_ATTACHMENTS,
    ],
  },
  {
    label: 'Notes & Material',
    icon: '📚',
    perms: [
      PERM.NOTES_CREATE, PERM.NOTES_READ, PERM.NOTES_UPDATE,
      PERM.NOTES_DELETE, PERM.NOTES_DOWNLOAD, PERM.NOTES_SHARE,
      PERM.NOTES_CATEGORIZE,
      PERM.SYLLABUS_CREATE, PERM.SYLLABUS_READ, PERM.SYLLABUS_UPDATE,
      PERM.SYLLABUS_DELETE, PERM.SYLLABUS_TOPICS, PERM.SYLLABUS_PROGRESS,
    ],
  },
  {
    label: 'Fees & Finance',
    icon: '💰',
    perms: [
      PERM.FEE_TEMPLATES_CREATE, PERM.FEE_TEMPLATES_READ,
      PERM.FEE_TEMPLATES_UPDATE, PERM.FEE_TEMPLATES_DELETE,
      PERM.FEE_TEMPLATES_DEACTIVATE,
      PERM.FEES_CREATE, PERM.FEES_READ, PERM.FEES_COLLECT,
      PERM.FEES_UPDATE, PERM.FEES_REPORT, PERM.FEES_DELETE,
      PERM.FEES_DISCOUNT, PERM.FEES_EXPORT, PERM.FEES_DUE_REMINDER,
      PERM.FEES_RECEIPT, PERM.FEES_REFUND, PERM.FEES_LATE_FEE,
      PERM.FEES_SCHOLARSHIP,
    ],
  },
  {
    label: 'Payroll',
    icon: '💵',
    perms: [
      PERM.PAYROLL_CREATE, PERM.PAYROLL_READ,
      PERM.PAYROLL_PROCESS, PERM.PAYROLL_REPORT,
      PERM.PAYROLL_SALARY_STRUCTURE, PERM.PAYROLL_TAX,
      PERM.PAYROLL_BONUS, PERM.PAYROLL_DEDUCTION,
    ],
  },
  {
    label: 'Notices & Communication',
    icon: '📣',
    perms: [
      PERM.NOTICES_CREATE, PERM.NOTICES_READ, PERM.NOTICES_UPDATE,
      PERM.NOTICES_DELETE, PERM.NOTICES_DEACTIVATE, PERM.NOTICES_TARGET,
      PERM.NOTICES_PRIORITY,
      PERM.NOTIFICATIONS_SEND, PERM.NOTIFICATIONS_READ,
      PERM.NOTIFICATIONS_MANAGE, PERM.NOTIFICATIONS_TEMPLATES,
      PERM.NOTIFICATIONS_PUSH, PERM.NOTIFICATIONS_EMAIL,
      PERM.NOTIFICATIONS_SMS,
      PERM.COMMUNICATION_SEND, PERM.COMMUNICATION_READ,
      PERM.COMMUNICATION_GROUPS, PERM.COMMUNICATION_TEMPLATES,
      PERM.COMMUNICATION_HISTORY,
    ],
  },
  {
    label: 'Reports',
    icon: '📊',
    perms: [
      PERM.REPORTS_STUDENT, PERM.REPORTS_ATTENDANCE, PERM.REPORTS_FEE,
      PERM.REPORTS_EXAM, PERM.REPORTS_ANALYTICS, PERM.REPORTS_PAYROLL,
      PERM.REPORTS_TEACHER, PERM.REPORTS_CLASS, PERM.REPORTS_CUSTOM,
      PERM.REPORTS_EXPORT, PERM.REPORTS_EXPENSES, PERM.REPORTS_VENDORS,
      PERM.REPORTS_BUDGET,
    ],
  },
  {
    label: 'Roles & Users',
    icon: '🛡',
    perms: [
      PERM.ROLES_CREATE, PERM.ROLES_READ, PERM.ROLES_UPDATE,
      PERM.ROLES_DELETE, PERM.ROLES_DEACTIVATE, PERM.ROLES_ASSIGN,
      PERM.ROLES_PERMISSIONS,
      PERM.USERS_CREATE, PERM.USERS_READ, PERM.USERS_UPDATE,
      PERM.USERS_DELETE, PERM.USERS_DEACTIVATE,
    ],
  },
  {
    label: 'Branches',
    icon: '🏢',
    perms: [
      PERM.BRANCHES_CREATE, PERM.BRANCHES_READ, PERM.BRANCHES_UPDATE,
      PERM.BRANCHES_DELETE, PERM.BRANCHES_DEACTIVATE, PERM.BRANCHES_ASSIGN_ROLE,
      PERM.BRANCHES_TRANSFER,
    ],
  },
  {
    label: 'Settings',
    icon: '⚙',
    perms: [
      PERM.SETTINGS_VIEW, PERM.SETTINGS_UPDATE,
      PERM.SETTINGS_SYSTEM, PERM.SETTINGS_ACADEMIC,
      PERM.SETTINGS_FINANCE, PERM.SETTINGS_NOTIFICATIONS,
    ],
  },
  {
    label: 'Audit & Compliance',
    icon: '🔍',
    perms: [
      PERM.AUDIT_LOG_VIEW, PERM.AUDIT_LOG_EXPORT, PERM.AUDIT_LOG_DELETE,
      PERM.COMPLIANCE_REPORTS, PERM.COMPLIANCE_DATA_RETENTION,
      PERM.COMPLIANCE_GDPR, PERM.COMPLIANCE_PIPEDA,
    ],
  },
  {
    label: 'Workflow',
    icon: '⚡',
    perms: [
      PERM.WORKFLOW_VIEW, PERM.WORKFLOW_CREATE, PERM.WORKFLOW_UPDATE,
      PERM.WORKFLOW_DELETE, PERM.WORKFLOW_APPROVE, PERM.WORKFLOW_REJECT,
      PERM.WORKFLOW_ASSIGN,
    ],
  },
  {
    label: 'Tasks & Projects',
    icon: '✅',
    perms: [
      PERM.TASKS_CREATE, PERM.TASKS_READ, PERM.TASKS_UPDATE,
      PERM.TASKS_DELETE, PERM.TASKS_ASSIGN, PERM.TASKS_STATUS,
      PERM.PROJECTS_CREATE, PERM.PROJECTS_READ, PERM.PROJECTS_UPDATE,
      PERM.PROJECTS_DELETE, PERM.PROJECTS_MANAGE,
    ],
  },
  {
    label: 'Library',
    icon: '📖',
    perms: [
      PERM.LIBRARY_ACCESS, PERM.LIBRARY_BOOKS_READ, PERM.LIBRARY_BOOKS_ISSUE,
      PERM.LIBRARY_BOOKS_ADD, PERM.LIBRARY_BOOKS_UPDATE, PERM.LIBRARY_BOOKS_DELETE,
      PERM.LIBRARY_CATEGORIES, PERM.LIBRARY_REPORTS, PERM.LIBRARY_FINES,
    ],
  },
  {
    label: 'Transport',
    icon: '🚌',
    perms: [
      PERM.TRANSPORT_VIEW, PERM.TRANSPORT_MANAGE,
      PERM.TRANSPORT_ROUTES, PERM.TRANSPORT_VEHICLES,
      PERM.TRANSPORT_FEES, PERM.TRANSPORT_TRACKING,
    ],
  },
  {
    label: 'Hostel',
    icon: '🏠',
    perms: [
      PERM.HOSTEL_VIEW, PERM.HOSTEL_MANAGE,
      PERM.HOSTEL_ROOMS, PERM.HOSTEL_ALLOCATION,
      PERM.HOSTEL_FEES, PERM.HOSTEL_ATTENDANCE,
    ],
  },
  {
    label: 'Inventory',
    icon: '📦',
    perms: [
      PERM.INVENTORY_VIEW, PERM.INVENTORY_MANAGE,
      PERM.INVENTORY_ITEMS, PERM.INVENTORY_PURCHASE,
      PERM.INVENTORY_ISSUE, PERM.INVENTORY_REPORTS,
    ],
  },
  {
    label: 'Calendar',
    icon: '📅',
    perms: [
      PERM.CALENDAR_VIEW, PERM.CALENDAR_CREATE,
      PERM.CALENDAR_UPDATE, PERM.CALENDAR_DELETE,
      PERM.CALENDAR_EVENTS, PERM.CALENDAR_HOLIDAYS,
    ],
  },
  {
    label: 'Surveys & Feedback',
    icon: '📋',
    perms: [
      PERM.SURVEYS_CREATE, PERM.SURVEYS_READ, PERM.SURVEYS_UPDATE,
      PERM.SURVEYS_DELETE, PERM.SURVEYS_RESPOND, PERM.SURVEYS_ANALYTICS,
      PERM.FEEDBACK_SUBMIT, PERM.FEEDBACK_VIEW, PERM.FEEDBACK_MANAGE,
    ],
  },
  {
    label: 'Certificates & Degrees',
    icon: '🎓',
    perms: [
      PERM.CERTIFICATES_GENERATE, PERM.CERTIFICATES_VIEW,
      PERM.CERTIFICATES_VERIFY, PERM.CERTIFICATES_DOWNLOAD,
      PERM.DEGREES_ISSUE, PERM.DEGREES_VERIFY, PERM.DEGREES_TRANSCRIPTS,
    ],
  },
  {
    label: 'Alumni',
    icon: '👥',
    perms: [
      PERM.ALUMNI_VIEW, PERM.ALUMNI_MANAGE, PERM.ALUMNI_COMMUNICATE,
      PERM.ALUMNI_EVENTS, PERM.ALUMNI_DONATIONS, PERM.ALUMNI_EMPLOYMENT,
    ],
  },
];

// ─────────────────────────────────────────────────────────────────────────────
// TEACHER PERMISSION GROUPS (Portal Level)
// ─────────────────────────────────────────────────────────────────────────────
export const TEACHER_PERMISSION_GROUPS = [
  {
    label: 'Dashboard',
    icon: '📊',
    perms: [
      PERM.DASHBOARD_VIEW,
      PERM.DASHBOARD_ANALYTICS,
      PERM.CALENDAR_VIEW,
    ],
  },
  {
    label: 'My Classes',
    icon: '🏫',
    perms: [
      PERM.CLASSES_READ,
      PERM.CLASSES_VIEW_ROSTER,
      PERM.CLASSES_MATERIALS,
      PERM.SECTIONS_READ,
      PERM.SUBJECTS_READ,
      PERM.SUBJECTS_MATERIALS,
      PERM.BATCHES_READ,
      PERM.BATCHES_TIMETABLE,
    ],
  },
  {
    label: 'My Students',
    icon: '🎓',
    perms: [
      PERM.STUDENTS_READ,
      PERM.STUDENTS_VIEW_DETAILS,
      PERM.STUDENTS_CONTACT,
      PERM.STUDENT_PROFILE_VIEW,
      PERM.STUDENT_ACHIEVEMENTS,
      PERM.STUDENT_REMARKS,
    ],
  },
  {
    label: 'Timetable',
    icon: '🗓',
    perms: [
      PERM.TIMETABLE_READ,
      PERM.TIMETABLE_UPDATE,
      PERM.TIMETABLE_TEACHER_VIEW,
      PERM.TIMETABLE_EXPORT,
      PERM.CALENDAR_EVENTS,
    ],
  },
  {
    label: 'Attendance',
    icon: '✅',
    perms: [
      PERM.ATTENDANCE_MARK,
      PERM.ATTENDANCE_VIEW,
      PERM.ATTENDANCE_REPORT,
      PERM.ATTENDANCE_EXPORT,
      PERM.ATTENDANCE_ANALYTICS,
      PERM.ATTENDANCE_BULK_MARK,
    ],
  },
  {
    label: 'Exams',
    icon: '🧪',
    perms: [
      PERM.EXAMS_READ,
      PERM.EXAMS_UPDATE,
      PERM.EXAMS_SCHEDULE,
      PERM.EXAMS_SUPERVISE,
      PERM.EXAMS_SEATING,
      PERM.EXAMS_MANAGE_ATTENDANCE,
    ],
  },
  {
    label: 'Exam Results',
    icon: '📈',
    perms: [
      PERM.EXAM_RESULTS_ENTER,
      PERM.EXAM_RESULTS_VIEW,
      PERM.EXAM_RESULTS_UPDATE,
      PERM.EXAM_RESULTS_GRADE,
      PERM.EXAM_RESULTS_REMARKS,
      PERM.EXAM_RESULTS_ANALYTICS,
    ],
  },
  {
    label: 'Homework & Assignments',
    icon: '📝',
    perms: [
      PERM.HOMEWORK_CREATE,
      PERM.HOMEWORK_READ,
      PERM.HOMEWORK_UPDATE,
      PERM.HOMEWORK_DELETE,
      PERM.HOMEWORK_GRADE,
      PERM.HOMEWORK_ATTACHMENTS,
      PERM.ASSIGNMENTS_CREATE,
      PERM.ASSIGNMENTS_READ,
      PERM.ASSIGNMENTS_UPDATE,
      PERM.ASSIGNMENTS_DELETE,
      PERM.ASSIGNMENTS_GRADE,
      PERM.ASSIGNMENTS_ATTACHMENTS,
    ],
  },
  {
    label: 'Notes & Material',
    icon: '📚',
    perms: [
      PERM.NOTES_CREATE,
      PERM.NOTES_READ,
      PERM.NOTES_UPDATE,
      PERM.NOTES_DELETE,
      PERM.NOTES_DOWNLOAD,
      PERM.NOTES_SHARE,
      PERM.SYLLABUS_READ,
      PERM.SYLLABUS_TOPICS,
      PERM.SYLLABUS_PROGRESS,
    ],
  },
  {
    label: 'Notices',
    icon: '📣',
    perms: [
      PERM.NOTICES_READ,
      PERM.NOTICES_CREATE,
      PERM.NOTICES_TARGET,
      PERM.COMMUNICATION_SEND,
    ],
  },
  {
    label: 'Reports',
    icon: '📊',
    perms: [
      PERM.REPORTS_STUDENT,
      PERM.REPORTS_ATTENDANCE,
      PERM.REPORTS_EXAM,
      PERM.REPORTS_CLASS,
      PERM.REPORTS_EXPORT,
    ],
  },
  {
    label: 'Self Attendance',
    icon: '📊',
    perms: [
      PERM.ATTENDANCE_SELF_MARK,
      PERM.ATTENDANCE_SELF_VIEW,
      PERM.ATTENDANCE_SELF_EXPORT,
      PERM.ATTENDANCE_SELF_ANALYTICS,
      PERM.ATTENDANCE_VERIFY,
    ],
  },
  {
    label: 'Self Payroll',
    icon: '📊',
    perms: [
      PERM.PAYROLL_SELF_VIEW,
      PERM.PAYROLL_SELF_EXPORT,
      PERM.PAYROLL_SELF_ANALYTICS,
      PERM.PAYROLL_SELF_CREATE,
      PERM.PAYROLL_SELF_PAY_SLIP,
      PERM.PAYROLL_SELF_PAY,
    ],
  },
  {
    label: 'My Profile',
    icon: '👤',
    perms: [
      PERM.TEACHER_PROFILE_VIEW,
      PERM.TEACHER_PROFILE_EDIT,
      PERM.TEACHER_ACHIEVEMENTS,
      PERM.TEACHER_LEAVE,
      PERM.USERS_PROFILE,
      PERM.USERS_PASSWORD,
    ],
  },
  {
    label: 'Library',
    icon: '📖',
    perms: [
      PERM.LIBRARY_ACCESS,
      PERM.LIBRARY_BOOKS_READ,
      PERM.LIBRARY_BOOKS_ISSUE,
    ],
  },
];

// ─────────────────────────────────────────────────────────────────────────────
// STUDENT PERMISSION GROUPS (Portal Level)
// ─────────────────────────────────────────────────────────────────────────────
export const STUDENT_PERMISSION_GROUPS = [
  {
    label: 'Dashboard',
    icon: '📊',
    perms: [
      PERM.DASHBOARD_VIEW,
      PERM.CALENDAR_VIEW,
    ],
  },
  {
    label: 'My Attendance',
    icon: '✅',
    perms: [
      PERM.ATTENDANCE_VIEW,
      PERM.ATTENDANCE_SELF_MARK,
      PERM.ATTENDANCE_REPORT,
    ],
  },
  {
    label: 'My Results',
    icon: '📈',
    perms: [
      PERM.EXAM_RESULTS_VIEW_OWN,
      PERM.EXAM_RESULTS_ANALYTICS,
      PERM.REPORTS_STUDENT,
    ],
  },
  {
    label: 'My Fees',
    icon: '💰',
    perms: [
      PERM.FEES_READ,
      PERM.FEES_RECEIPT,
      PERM.FEES_DUE_REMINDER,
    ],
  },
  {
    label: 'My Timetable',
    icon: '🗓',
    perms: [
      PERM.TIMETABLE_READ,
      PERM.TIMETABLE_STUDENT_VIEW,
      PERM.CALENDAR_EVENTS,
    ],
  },
  {
    label: 'My Classes',
    icon: '🏫',
    perms: [
      PERM.CLASSES_READ,
      PERM.SUBJECTS_READ,
      PERM.CLASSES_VIEW_ROSTER,
    ],
  },
  {
    label: 'My Exams',
    icon: '🧪',
    perms: [
      PERM.EXAMS_VIEW_OWN,
      PERM.EXAMS_SCHEDULE,
      PERM.EXAMS_SEATING,
    ],
  },
  {
    label: 'Homework',
    icon: '📝',
    perms: [
      PERM.HOMEWORK_READ,
      PERM.HOMEWORK_SUBMIT,
      PERM.HOMEWORK_ATTACHMENTS,
    ],
  },
  {
    label: 'Assignments',
    icon: '📋',
    perms: [
      PERM.ASSIGNMENTS_READ,
      PERM.ASSIGNMENTS_SUBMIT,
      PERM.ASSIGNMENTS_ATTACHMENTS,
    ],
  },
  {
    label: 'Study Material',
    icon: '📚',
    perms: [
      PERM.NOTES_READ,
      PERM.NOTES_DOWNLOAD,
      PERM.SYLLABUS_READ,
      PERM.SYLLABUS_TOPICS,
      PERM.SYLLABUS_PROGRESS,
    ],
  },
  {
    label: 'Notices',
    icon: '📣',
    perms: [
      PERM.NOTICES_READ,
      PERM.NOTIFICATIONS_READ,
    ],
  },
  {
    label: 'My Profile',
    icon: '👤',
    perms: [
      PERM.STUDENT_PROFILE_VIEW,
      PERM.STUDENT_PROFILE_EDIT,
      PERM.STUDENT_ACHIEVEMENTS,
      PERM.USERS_PROFILE,
      PERM.USERS_PASSWORD,
    ],
  },
  {
    label: 'Library',
    icon: '📖',
    perms: [
      PERM.LIBRARY_ACCESS,
      PERM.LIBRARY_BOOKS_READ,
      PERM.LIBRARY_BOOKS_ISSUE,
    ],
  },
  {
    label: 'Transport',
    icon: '🚌',
    perms: [
      PERM.TRANSPORT_VIEW,
      PERM.TRANSPORT_TRACKING,
    ],
  },
  {
    label: 'Events',
    icon: '📅',
    perms: [
      PERM.CALENDAR_EVENTS,
      PERM.CALENDAR_HOLIDAYS,
    ],
  },
];

// ─────────────────────────────────────────────────────────────────────────────
// PARENT PERMISSION GROUPS (Portal Level)
// ─────────────────────────────────────────────────────────────────────────────
export const PARENT_PERMISSION_GROUPS = [
  {
    label: 'Dashboard',
    icon: '📊',
    perms: [
      PERM.DASHBOARD_VIEW,
      PERM.CALENDAR_VIEW,
    ],
  },
  {
    label: 'My Children',
    icon: '👨‍👩‍👧',
    perms: [
      PERM.PARENTS_VIEW_CHILDREN,
      PERM.STUDENT_PROFILE_VIEW,
      PERM.STUDENTS_VIEW_DETAILS,
    ],
  },
  {
    label: 'Ward Attendance',
    icon: '✅',
    perms: [
      PERM.ATTENDANCE_VIEW,
      PERM.ATTENDANCE_REPORT,
      PERM.REPORTS_ATTENDANCE,
    ],
  },
  {
    label: 'Ward Results',
    icon: '📈',
    perms: [
      PERM.EXAM_RESULTS_VIEW_OWN,
      PERM.EXAM_RESULTS_ANALYTICS,
      PERM.REPORTS_EXAM,
      PERM.REPORTS_STUDENT,
    ],
  },
  {
    label: 'Ward Fees',
    icon: '💰',
    perms: [
      PERM.FEES_READ,
      PERM.FEES_COLLECT,
      PERM.FEES_RECEIPT,
      PERM.FEES_DUE_REMINDER,
      PERM.REPORTS_FEE,
    ],
  },
  {
    label: 'Ward Timetable',
    icon: '🗓',
    perms: [
      PERM.TIMETABLE_READ,
      PERM.TIMETABLE_STUDENT_VIEW,
      PERM.CALENDAR_EVENTS,
    ],
  },
  {
    label: 'Ward Exams',
    icon: '🧪',
    perms: [
      PERM.EXAMS_VIEW_OWN,
      PERM.EXAMS_SCHEDULE,
    ],
  },
  {
    label: 'Homework',
    icon: '📝',
    perms: [
      PERM.HOMEWORK_READ,
      PERM.HOMEWORK_ATTACHMENTS,
    ],
  },
  {
    label: 'Assignments',
    icon: '📋',
    perms: [
      PERM.ASSIGNMENTS_READ,
      PERM.ASSIGNMENTS_ATTACHMENTS,
    ],
  },
  {
    label: 'Study Material',
    icon: '📚',
    perms: [
      PERM.NOTES_READ,
      PERM.NOTES_DOWNLOAD,
      PERM.SYLLABUS_READ,
      PERM.SYLLABUS_TOPICS,
    ],
  },
  {
    label: 'Notices',
    icon: '📣',
    perms: [
      PERM.NOTICES_READ,
      PERM.NOTIFICATIONS_READ,
    ],
  },
  {
    label: 'Communication',
    icon: '💬',
    perms: [
      PERM.PARENTS_COMMUNICATE,
      PERM.COMMUNICATION_SEND,
      PERM.PARENTS_MEETING_SCHEDULE,
      PERM.PARENT_MEETINGS,
      PERM.PARENT_FEEDBACK,
    ],
  },
  {
    label: 'My Profile',
    icon: '👤',
    perms: [
      PERM.PARENT_PROFILE_VIEW,
      PERM.PARENT_PROFILE_EDIT,
      PERM.USERS_PROFILE,
      PERM.USERS_PASSWORD,
    ],
  },
  {
    label: 'Library',
    icon: '📖',
    perms: [
      PERM.LIBRARY_ACCESS,
      PERM.LIBRARY_BOOKS_READ,
    ],
  },
  {
    label: 'Transport',
    icon: '🚌',
    perms: [
      PERM.TRANSPORT_VIEW,
      PERM.TRANSPORT_TRACKING,
    ],
  },
  {
    label: 'Events',
    icon: '📅',
    perms: [
      PERM.CALENDAR_EVENTS,
      PERM.CALENDAR_HOLIDAYS,
    ],
  },
];

// ─────────────────────────────────────────────────────────────────────────────
// FLAT ARRAYS (For "Full Access" feature)
// ─────────────────────────────────────────────────────────────────────────────
export const ALL_ADMIN_PERMISSIONS = ADMIN_PERMISSION_GROUPS.flatMap(g => g.perms);
export const ALL_TEACHER_PERMISSIONS = TEACHER_PERMISSION_GROUPS.flatMap(g => g.perms);
export const ALL_STUDENT_PERMISSIONS = STUDENT_PERMISSION_GROUPS.flatMap(g => g.perms);
export const ALL_PARENT_PERMISSIONS = PARENT_PERMISSION_GROUPS.flatMap(g => g.perms);

// ─────────────────────────────────────────────────────────────────────────────
// BACKWARD COMPATIBILITY
// ─────────────────────────────────────────────────────────────────────────────
export const PERMISSION_GROUPS = ADMIN_PERMISSION_GROUPS;
export const ALL_PERMISSIONS = ALL_ADMIN_PERMISSIONS;
export const PERMISSIONS = PERM;

// ─────────────────────────────────────────────────────────────────────────────
// HELPER FUNCTIONS
// ─────────────────────────────────────────────────────────────────────────────
export const permLabel = (code) => {
  if (!code) return '';
  const action = code.split('.').pop() ?? code;
  return action.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
};

export const permFullLabel = (code) => {
  if (!code) return '';
  const [mod, ...rest] = code.split('.');
  const m = mod.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
  const a = rest.join('.').replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
  return m + ': ' + a;
};

export const parsePermissions = (permissions) => {
  if (!permissions) return { instituteAdmin: [], teacher: [], student: [], parent: [] };
  if (Array.isArray(permissions)) {
    return { instituteAdmin: permissions, teacher: [], student: [], parent: [] };
  }
  return {
    instituteAdmin: permissions.instituteAdmin ?? [],
    teacher: permissions.teacher ?? [],
    student: permissions.student ?? [],
    parent: permissions.parent ?? [],
  };
};

export const isFullAccess = (perms) => Array.isArray(perms) && perms.includes('ALL');

export const getPermissionGroupsByType = (type) => {
  switch (type) {
    case 'instituteAdmin': return ADMIN_PERMISSION_GROUPS;
    case 'teacher': return TEACHER_PERMISSION_GROUPS;
    case 'student': return STUDENT_PERMISSION_GROUPS;
    case 'parent': return PARENT_PERMISSION_GROUPS;
    default: return ADMIN_PERMISSION_GROUPS;
  }
};

export const getAllPermissionsByType = (type) => {
  switch (type) {
    case 'instituteAdmin': return ALL_ADMIN_PERMISSIONS;
    case 'teacher': return ALL_TEACHER_PERMISSIONS;
    case 'student': return ALL_STUDENT_PERMISSIONS;
    case 'parent': return ALL_PARENT_PERMISSIONS;
    default: return ALL_ADMIN_PERMISSIONS;
  }
};

export default {
  PERM,
  ADMIN_PERMISSION_GROUPS,
  TEACHER_PERMISSION_GROUPS,
  STUDENT_PERMISSION_GROUPS,
  PARENT_PERMISSION_GROUPS,
  ALL_ADMIN_PERMISSIONS,
  ALL_TEACHER_PERMISSIONS,
  ALL_STUDENT_PERMISSIONS,
  ALL_PARENT_PERMISSIONS,
  PERMISSION_GROUPS,
  ALL_PERMISSIONS,
  PERMISSIONS,
  permLabel,
  permFullLabel,
  parsePermissions,
  isFullAccess,
  getPermissionGroupsByType,
  getAllPermissionsByType,
};