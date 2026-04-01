// /**
//  * COMPLETE PERMISSIONS CONSTANTS
//  * The Clouds Academy
//  * 
//  * Single source of truth for ALL permissions across all user types:
//  * - instituteAdmin (Master/Platform level)
//  * - teacher (Portal level)
//  * - student (Portal level)
//  * - parent (Portal level)
//  * 
//  * Format matches DB seed and API requirements.
//  */

// // ─────────────────────────────────────────────────────────────────────────────
// // BASE PERMISSION CODES (Matches DB seed)
// // ─────────────────────────────────────────────────────────────────────────────
// export const PERM = {
//   // Dashboard
//   DASHBOARD_VIEW:           'dashboard.view',
//   DASHBOARD_ANALYTICS:      'dashboard.analytics',
//   DASHBOARD_WIDGETS_CUSTOMIZE: 'dashboard.widgets.customize',

//   // Students
//   STUDENTS_CREATE:          'students.create',
//   STUDENTS_READ:            'students.read',
//   STUDENTS_UPDATE:          'students.update',
//   STUDENTS_DELETE:          'students.delete',
//   STUDENTS_DEACTIVATE:      'students.deactivate',
//   STUDENTS_TRANSFER:        'students.transfer',
//   STUDENTS_PROMOTE:         'students.promote',
//   STUDENTS_EXPORT:          'students.export',
//   STUDENTS_IMPORT:          'students.import',
//   STUDENTS_BULK_ACTIONS:    'students.bulk_actions',
//   STUDENTS_VIEW_DETAILS:    'students.view_details',
//   STUDENTS_CONTACT:         'students.contact',
//   STUDENTS_DOCUMENTS:       'students.documents',
//   STUDENTS_BEHAVIOR:        'students.behavior',

//   // Teachers
//   TEACHERS_CREATE:          'teachers.create',
//   TEACHERS_READ:            'teachers.read',
//   TEACHERS_UPDATE:          'teachers.update',
//   TEACHERS_DELETE:          'teachers.delete',
//   TEACHERS_DEACTIVATE:      'teachers.deactivate',
//   TEACHERS_VIEW_SCHEDULE:   'teachers.view_schedule',
//   TEACHERS_EVALUATE:        'teachers.evaluate',
//   TEACHERS_DOCUMENTS:       'teachers.documents',
//   TEACHERS_LEAVE_APPROVE:   'teachers.leave_approve',

//   // Parents
//   PARENTS_CREATE:           'parents.create',
//   PARENTS_READ:             'parents.read',
//   PARENTS_UPDATE:           'parents.update',
//   PARENTS_DELETE:           'parents.delete',
//   PARENTS_DEACTIVATE:       'parents.deactivate',
//   PARENTS_COMMUNICATE:      'parents.communicate',
//   PARENTS_MEETING_SCHEDULE: 'parents.meeting_schedule',
//   PARENTS_VIEW_CHILDREN:    'parents.view_children',

//   // Staff
//   STAFF_CREATE:             'staff.create',
//   STAFF_READ:               'staff.read',
//   STAFF_UPDATE:             'staff.update',
//   STAFF_DELETE:             'staff.delete',
//   STAFF_DEACTIVATE:         'staff.deactivate',
//   STAFF_ATTENDANCE:         'staff.attendance',
//   STAFF_PAYROLL:            'staff.payroll',
//   STAFF_LEAVE:              'staff.leave',
//   STAFF_PERFORMANCE:        'staff.performance',
//   STAFF_TRAINING:           'staff.training',

//   // Classes / Courses / Programs (context-aware)
//   CLASSES_CREATE:           'classes.create',
//   CLASSES_READ:             'classes.read',
//   CLASSES_UPDATE:           'classes.update',
//   CLASSES_DELETE:           'classes.delete',
//   CLASSES_DEACTIVATE:       'classes.deactivate',
//   CLASSES_ASSIGN_TEACHER:   'classes.assign_teacher',
//   CLASSES_VIEW_ROSTER:      'classes.view_roster',
//   CLASSES_MATERIALS:        'classes.materials',

//   // Sections / Batches / Groups
//   SECTIONS_CREATE:          'sections.create',
//   SECTIONS_READ:            'sections.read',
//   SECTIONS_UPDATE:          'sections.update',
//   SECTIONS_DELETE:          'sections.delete',
//   SECTIONS_DEACTIVATE:      'sections.deactivate',
//   SECTIONS_ASSIGN_STUDENTS: 'sections.assign_students',

//   // Subjects / Courses / Modules
//   SUBJECTS_CREATE:          'subjects.create',
//   SUBJECTS_READ:            'subjects.read',
//   SUBJECTS_UPDATE:          'subjects.update',
//   SUBJECTS_DELETE:          'subjects.delete',
//   SUBJECTS_DEACTIVATE:      'subjects.deactivate',
//   SUBJECTS_ASSIGN_TEACHER:  'subjects.assign_teacher',
//   SUBJECTS_MATERIALS:       'subjects.materials',

//   // Academic Years / Sessions / Cycles
//   ACADEMIC_YEARS_CREATE:    'academic_years.create',
//   ACADEMIC_YEARS_READ:      'academic_years.read',
//   ACADEMIC_YEARS_UPDATE:    'academic_years.update',
//   ACADEMIC_YEARS_ACTIVATE:  'academic_years.activate',
//   ACADEMIC_YEARS_TERMS:     'academic_years.terms',

//   // Admissions / Enrollments / Registrations
//   ADMISSIONS_CREATE:        'admissions.create',
//   ADMISSIONS_READ:          'admissions.read',
//   ADMISSIONS_UPDATE:        'admissions.update',
//   ADMISSIONS_APPROVE:       'admissions.approve',
//   ADMISSIONS_REJECT:        'admissions.reject',
//   ADMISSIONS_INTERVIEW:     'admissions.interview',
//   ADMISSIONS_DOCUMENTS:     'admissions.documents',
//   ADMISSIONS_FEE:           'admissions.fee',

//   // Timetable / Schedule
//   TIMETABLE_CREATE:         'timetable.create',
//   TIMETABLE_READ:           'timetable.read',
//   TIMETABLE_UPDATE:         'timetable.update',
//   TIMETABLE_DELETE:         'timetable.delete',
//   TIMETABLE_CONFLICT_CHECK: 'timetable.conflict_check',
//   TIMETABLE_EXPORT:         'timetable.export',
//   TIMETABLE_TEACHER_VIEW:   'timetable.teacher_view',
//   TIMETABLE_STUDENT_VIEW:   'timetable.student_view',

//   // Attendance
//   ATTENDANCE_MARK:          'attendance.mark',
//   ATTENDANCE_VIEW:          'attendance.view',
//   ATTENDANCE_REPORT:        'attendance.report',
//   ATTENDANCE_EXPORT:        'attendance.export',
//   ATTENDANCE_ANALYTICS:     'attendance.analytics',
//   ATTENDANCE_BULK_MARK:     'attendance.bulk_mark',
//   ATTENDANCE_SELF_MARK:     'attendance.self_mark',
//   ATTENDANCE_VERIFY:        'attendance.verify',
  
//   // Staff Attendance
//   STAFF_ATTENDANCE_MARK:    'staff_attendance.mark',
//   STAFF_ATTENDANCE_VIEW:    'staff_attendance.view',
//   STAFF_ATTENDANCE_REPORT:  'staff_attendance.report',
//   STAFF_ATTENDANCE_APPROVE: 'staff_attendance.approve',

//   // Exams / Tests / Assessments
//   EXAMS_CREATE:             'exams.create',
//   EXAMS_READ:               'exams.read',
//   EXAMS_UPDATE:             'exams.update',
//   EXAMS_DELETE:             'exams.delete',
//   EXAMS_DEACTIVATE:         'exams.deactivate',
//   EXAMS_SCHEDULE:           'exams.schedule',
//   EXAMS_SEATING:            'exams.seating',
//   EXAMS_SUPERVISE:          'exams.supervise',

//   // Exam Results
//   EXAM_RESULTS_ENTER:       'exam_results.enter',
//   EXAM_RESULTS_VIEW:        'exam_results.view',
//   EXAM_RESULTS_PUBLISH:     'exam_results.publish',
//   EXAM_RESULTS_UPDATE:      'exam_results.update',
//   EXAM_RESULTS_DELETE:      'exam_results.delete',
//   EXAM_RESULTS_ANALYTICS:   'exam_results.analytics',
//   EXAM_RESULTS_EXPORT:      'exam_results.export',
//   EXAM_RESULTS_GRADE:       'exam_results.grade',
//   EXAM_RESULTS_REMARKS:     'exam_results.remarks',

//   // Fee Templates
//   FEE_TEMPLATES_CREATE:     'fee_templates.create',
//   FEE_TEMPLATES_READ:       'fee_templates.read',
//   FEE_TEMPLATES_UPDATE:     'fee_templates.update',
//   FEE_TEMPLATES_DELETE:     'fee_templates.delete',
//   FEE_TEMPLATES_DEACTIVATE: 'fee_templates.deactivate',

//   // Fees & Finance
//   FEES_CREATE:              'fees.create',
//   FEES_READ:                'fees.read',
//   FEES_COLLECT:             'fees.collect',
//   FEES_UPDATE:              'fees.update',
//   FEES_REPORT:              'fees.report',
//   FEES_DELETE:              'fees.delete',
//   FEES_DISCOUNT:            'fees.discount',
//   FEES_EXPORT:              'fees.export',
//   FEES_DUE_REMINDER:        'fees.due_reminder',
//   FEES_RECEIPT:             'fees.receipt',
//   FEES_REFUND:              'fees.refund',
//   FEES_LATE_FEE:            'fees.late_fee',
//   FEES_SCHOLARSHIP:         'fees.scholarship',

//   // Payroll
//   PAYROLL_CREATE:           'payroll.create',
//   PAYROLL_READ:             'payroll.read',
//   PAYROLL_PROCESS:          'payroll.process',
//   PAYROLL_REPORT:           'payroll.report',
//   PAYROLL_SALARY_STRUCTURE: 'payroll.salary_structure',
//   PAYROLL_TAX:              'payroll.tax',
//   PAYROLL_BONUS:            'payroll.bonus',
//   PAYROLL_DEDUCTION:        'payroll.deduction',

//   // Notices / Announcements
//   NOTICES_CREATE:           'notices.create',
//   NOTICES_READ:             'notices.read',
//   NOTICES_UPDATE:           'notices.update',
//   NOTICES_DELETE:           'notices.delete',
//   NOTICES_DEACTIVATE:       'notices.deactivate',
//   NOTICES_TARGET:           'notices.target',
//   NOTICES_PRIORITY:         'notices.priority',

//   // Notifications
//   NOTIFICATIONS_SEND:       'notifications.send',
//   NOTIFICATIONS_READ:       'notifications.read',
//   NOTIFICATIONS_MANAGE:     'notifications.manage',
//   NOTIFICATIONS_TEMPLATES:  'notifications.templates',
//   NOTIFICATIONS_PUSH:       'notifications.push',
//   NOTIFICATIONS_EMAIL:      'notifications.email',
//   NOTIFICATIONS_SMS:        'notifications.sms',

//   // Homework
//   HOMEWORK_CREATE:          'homework.create',
//   HOMEWORK_READ:            'homework.read',
//   HOMEWORK_UPDATE:          'homework.update',
//   HOMEWORK_DELETE:          'homework.delete',
//   HOMEWORK_SUBMIT:          'homework.submit',
//   HOMEWORK_GRADE:           'homework.grade',
//   HOMEWORK_ATTACHMENTS:     'homework.attachments',

//   // Assignments
//   ASSIGNMENTS_CREATE:       'assignments.create',
//   ASSIGNMENTS_READ:         'assignments.read',
//   ASSIGNMENTS_UPDATE:       'assignments.update',
//   ASSIGNMENTS_DELETE:       'assignments.delete',
//   ASSIGNMENTS_SUBMIT:       'assignments.submit',
//   ASSIGNMENTS_GRADE:        'assignments.grade',
//   ASSIGNMENTS_ATTACHMENTS:  'assignments.attachments',

//   // Notes / Study Material
//   NOTES_CREATE:             'notes.create',
//   NOTES_READ:               'notes.read',
//   NOTES_UPDATE:             'notes.update',
//   NOTES_DELETE:             'notes.delete',
//   NOTES_DOWNLOAD:           'notes.download',
//   NOTES_SHARE:              'notes.share',
//   NOTES_CATEGORIZE:         'notes.categorize',

//   // Syllabus
//   SYLLABUS_CREATE:          'syllabus.create',
//   SYLLABUS_READ:            'syllabus.read',
//   SYLLABUS_UPDATE:          'syllabus.update',
//   SYLLABUS_DELETE:          'syllabus.delete',
//   SYLLABUS_TOPICS:          'syllabus.topics',
//   SYLLABUS_PROGRESS:        'syllabus.progress',

//   // Reports
//   REPORTS_STUDENT:          'reports.student',
//   REPORTS_ATTENDANCE:       'reports.attendance',
//   REPORTS_FEE:              'reports.fee',
//   REPORTS_EXAM:             'reports.exam',
//   REPORTS_ANALYTICS:        'reports.analytics',
//   REPORTS_PAYROLL:          'reports.payroll',
//   REPORTS_TEACHER:          'reports.teacher',
//   REPORTS_CLASS:            'reports.class',
//   REPORTS_CUSTOM:           'reports.custom',
//   REPORTS_EXPORT:           'reports.export',

//   // Roles & Permissions
//   ROLES_READ:               'roles.read',
//   ROLES_CREATE:             'roles.create',
//   ROLES_UPDATE:             'roles.update',
//   ROLES_DELETE:             'roles.delete',
//   ROLES_DEACTIVATE:         'roles.deactivate',
//   ROLES_ASSIGN:             'roles.assign',
//   ROLES_PERMISSIONS:        'roles.permissions',

//   // Users
//   USERS_CREATE:             'users.create',
//   USERS_READ:               'users.read',
//   USERS_UPDATE:             'users.update',
//   USERS_DELETE:             'users.delete',
//   USERS_DEACTIVATE:         'users.deactivate',
//   USERS_PROFILE:            'users.profile',
//   USERS_PASSWORD:           'users.password',

//   // Branches / Campuses
//   BRANCHES_CREATE:          'branches.create',
//   BRANCHES_READ:            'branches.read',
//   BRANCHES_UPDATE:          'branches.update',
//   BRANCHES_DELETE:          'branches.delete',
//   BRANCHES_DEACTIVATE:      'branches.deactivate',
//   BRANCHES_ASSIGN_ROLE:     'branches.assign_role',
//   BRANCHES_TRANSFER:        'branches.transfer',

//   // Settings
//   SETTINGS_VIEW:            'settings.view',
//   SETTINGS_UPDATE:          'settings.update',
//   SETTINGS_SYSTEM:          'settings.system',
//   SETTINGS_ACADEMIC:        'settings.academic',
//   SETTINGS_FINANCE:         'settings.finance',
//   SETTINGS_NOTIFICATIONS:   'settings.notifications',

//   // Library
//   LIBRARY_ACCESS:           'library.access',
//   LIBRARY_BOOKS_READ:       'library.books.read',
//   LIBRARY_BOOKS_ISSUE:      'library.books.issue',
//   LIBRARY_BOOKS_ADD:        'library.books.add',
//   LIBRARY_BOOKS_UPDATE:     'library.books.update',
//   LIBRARY_BOOKS_DELETE:     'library.books.delete',
//   LIBRARY_CATEGORIES:       'library.categories',
//   LIBRARY_REPORTS:          'library.reports',
//   LIBRARY_FINES:            'library.fines',
  
//   // Courses / Programs (for coaching/academy)
//   COURSES_CREATE:           'courses.create',
//   COURSES_READ:             'courses.read',
//   COURSES_UPDATE:           'courses.update',
//   COURSES_DELETE:           'courses.delete',
//   COURSES_MATERIALS:        'courses.materials',
//   COURSES_ASSIGNMENTS:      'courses.assignments',
//   COURSES_ASSESSMENTS:      'courses.assessments',
  
//   // Batches
//   BATCHES_CREATE:           'batches.create',
//   BATCHES_READ:             'batches.read',
//   BATCHES_UPDATE:           'batches.update',
//   BATCHES_DELETE:           'batches.delete',
//   BATCHES_STUDENTS:         'batches.students',
//   BATCHES_TIMETABLE:        'batches.timetable',
  
//   // Programs (for college/university)
//   PROGRAMS_CREATE:          'programs.create',
//   PROGRAMS_READ:            'programs.read',
//   PROGRAMS_UPDATE:          'programs.update',
//   PROGRAMS_DELETE:          'programs.delete',
//   PROGRAMS_COURSES:         'programs.courses',
//   PROGRAMS_REQUIREMENTS:    'programs.requirements',
  
//   // Semesters
//   SEMESTERS_CREATE:         'semesters.create',
//   SEMESTERS_READ:           'semesters.read',
//   SEMESTERS_UPDATE:         'semesters.update',
//   SEMESTERS_ACTIVATE:       'semesters.activate',
//   SEMESTERS_COURSES:        'semesters.courses',
//   SEMESTERS_REGISTRATION:   'semesters.registration',
  
//   // Departments
//   DEPARTMENTS_CREATE:       'departments.create',
//   DEPARTMENTS_READ:         'departments.read',
//   DEPARTMENTS_UPDATE:       'departments.update',
//   DEPARTMENTS_DELETE:       'departments.delete',
//   DEPARTMENTS_STAFF:        'departments.staff',
//   DEPARTMENTS_BUDGET:       'departments.budget',
  
//   // Research (university specific)
//   RESEARCH_READ:            'research.read',
//   RESEARCH_SUBMIT:          'research.submit',
//   RESEARCH_APPROVE:         'research.approve',
//   RESEARCH_PUBLISH:         'research.publish',
//   RESEARCH_GRANTS:          'research.grants',
//   RESEARCH_COLLABORATION:   'research.collaboration',

//   // Calendar / Events
//   CALENDAR_VIEW:            'calendar.view',
//   CALENDAR_CREATE:          'calendar.create',
//   CALENDAR_UPDATE:          'calendar.update',
//   CALENDAR_DELETE:          'calendar.delete',
//   CALENDAR_EVENTS:          'calendar.events',
//   CALENDAR_HOLIDAYS:        'calendar.holidays',

//   // Communication
//   COMMUNICATION_SEND:       'communication.send',
//   COMMUNICATION_READ:       'communication.read',
//   COMMUNICATION_GROUPS:     'communication.groups',
//   COMMUNICATION_TEMPLATES:  'communication.templates',
//   COMMUNICATION_HISTORY:    'communication.history',

//   // Transport
//   TRANSPORT_VIEW:           'transport.view',
//   TRANSPORT_MANAGE:         'transport.manage',
//   TRANSPORT_ROUTES:         'transport.routes',
//   TRANSPORT_VEHICLES:       'transport.vehicles',
//   TRANSPORT_FEES:           'transport.fees',
//   TRANSPORT_TRACKING:       'transport.tracking',

//   // Hostel
//   HOSTEL_VIEW:              'hostel.view',
//   HOSTEL_MANAGE:            'hostel.manage',
//   HOSTEL_ROOMS:             'hostel.rooms',
//   HOSTEL_ALLOCATION:        'hostel.allocation',
//   HOSTEL_FEES:              'hostel.fees',
//   HOSTEL_ATTENDANCE:        'hostel.attendance',

//   // Inventory
//   INVENTORY_VIEW:           'inventory.view',
//   INVENTORY_MANAGE:         'inventory.manage',
//   INVENTORY_ITEMS:          'inventory.items',
//   INVENTORY_PURCHASE:       'inventory.purchase',
//   INVENTORY_ISSUE:          'inventory.issue',
//   INVENTORY_REPORTS:        'inventory.reports',

//   // Student Profile
//   STUDENT_PROFILE_VIEW:     'student.profile.view',
//   STUDENT_PROFILE_EDIT:     'student.profile.edit',
//   STUDENT_DOCUMENTS_VIEW:   'student.documents.view',
//   STUDENT_DOCUMENTS_UPLOAD: 'student.documents.upload',
//   STUDENT_BEHAVIOR_LOG:     'student.behavior.log',
//   STUDENT_ACHIEVEMENTS:     'student.achievements',
//   STUDENT_REMARKS:          'student.remarks',

//   // Teacher Profile
//   TEACHER_PROFILE_VIEW:     'teacher.profile.view',
//   TEACHER_PROFILE_EDIT:     'teacher.profile.edit',
//   TEACHER_ACHIEVEMENTS:     'teacher.achievements',
//   TEACHER_REMARKS:          'teacher.remarks',
//   TEACHER_LEAVE:            'teacher.leave',
//   TEACHER_SUBSTITUTE:       'teacher.substitute',

//   // Parent Profile
//   PARENT_PROFILE_VIEW:      'parent.profile.view',
//   PARENT_PROFILE_EDIT:      'parent.profile.edit',
//   PARENT_COMMUNICATION:     'parent.communication',
//   PARENT_MEETINGS:          'parent.meetings',
//   PARENT_FEEDBACK:          'parent.feedback',
// };

// // ─────────────────────────────────────────────────────────────────────────────
// // TEACHER PERMISSION GROUPS (Portal Level) - UPDATED & COMPLETE
// // Jo teacher ko chahiye portal mein
// // ─────────────────────────────────────────────────────────────────────────────
// export const TEACHER_PERMISSION_GROUPS = [
//   {
//     label: 'Dashboard',
//     icon: '📊',
//     perms: [
//       PERM.DASHBOARD_VIEW,
//       PERM.DASHBOARD_ANALYTICS,
//       PERM.DASHBOARD_WIDGETS_CUSTOMIZE,
//       PERM.CALENDAR_VIEW,
//     ],
//   },
//   {
//     label: 'My Classes',
//     icon: '🏫',
//     perms: [
//       PERM.CLASSES_READ,
//       PERM.CLASSES_VIEW_ROSTER,
//       PERM.CLASSES_MATERIALS,
//       PERM.SECTIONS_READ,
//       PERM.SUBJECTS_READ,
//       PERM.SUBJECTS_MATERIALS,
//       PERM.BATCHES_READ,
//       PERM.BATCHES_TIMETABLE,
//     ],
//   },
//   {
//     label: 'My Students',
//     icon: '🎓',
//     perms: [
//       PERM.STUDENTS_READ,
//       PERM.STUDENTS_VIEW_DETAILS,
//       PERM.STUDENTS_CONTACT,
//       PERM.STUDENTS_DOCUMENTS,
//       PERM.STUDENTS_BEHAVIOR,
//       PERM.STUDENT_PROFILE_VIEW,
//       PERM.STUDENT_ACHIEVEMENTS,
//       PERM.STUDENT_REMARKS,
//       PERM.STUDENT_BEHAVIOR_LOG,
//     ],
//   },
//   {
//     label: 'Timetable',
//     icon: '🗓',
//     perms: [
//       PERM.TIMETABLE_READ,
//       PERM.TIMETABLE_UPDATE,
//       PERM.TIMETABLE_TEACHER_VIEW,
//       PERM.TIMETABLE_EXPORT,
//       PERM.CALENDAR_EVENTS,
//     ],
//   },
//   {
//     label: 'Attendance',
//     icon: '✅',
//     perms: [
//       PERM.ATTENDANCE_MARK,
//       PERM.ATTENDANCE_VIEW,
//       PERM.ATTENDANCE_REPORT,
//       PERM.ATTENDANCE_EXPORT,
//       PERM.ATTENDANCE_ANALYTICS,
//       PERM.ATTENDANCE_BULK_MARK,
//       PERM.ATTENDANCE_SELF_MARK,
//     ],
//   },
//   {
//     label: 'Homework & Assignments',
//     icon: '📝',
//     perms: [
//       PERM.HOMEWORK_CREATE,
//       PERM.HOMEWORK_READ,
//       PERM.HOMEWORK_UPDATE,
//       PERM.HOMEWORK_DELETE,
//       PERM.HOMEWORK_GRADE,
//       PERM.HOMEWORK_ATTACHMENTS,
//       PERM.ASSIGNMENTS_CREATE,
//       PERM.ASSIGNMENTS_READ,
//       PERM.ASSIGNMENTS_UPDATE,
//       PERM.ASSIGNMENTS_DELETE,
//       PERM.ASSIGNMENTS_GRADE,
//       PERM.ASSIGNMENTS_ATTACHMENTS,
//     ],
//   },
//   {
//     label: 'Notes & Material',
//     icon: '📚',
//     perms: [
//       PERM.NOTES_CREATE,
//       PERM.NOTES_READ,
//       PERM.NOTES_UPDATE,
//       PERM.NOTES_DELETE,
//       PERM.NOTES_DOWNLOAD,
//       PERM.NOTES_SHARE,
//       PERM.NOTES_CATEGORIZE,
//       PERM.SYLLABUS_READ,
//       PERM.SYLLABUS_TOPICS,
//       PERM.SYLLABUS_PROGRESS,
//     ],
//   },
//   {
//     label: 'Exams',
//     icon: '🧪',
//     perms: [
//       PERM.EXAMS_READ,
//       PERM.EXAMS_UPDATE,
//       PERM.EXAMS_SCHEDULE,
//       PERM.EXAMS_SUPERVISE,
//       PERM.EXAMS_SEATING,
//     ],
//   },
//   {
//     label: 'Exam Results',
//     icon: '📈',
//     perms: [
//       PERM.EXAM_RESULTS_ENTER,
//       PERM.EXAM_RESULTS_VIEW,
//       PERM.EXAM_RESULTS_UPDATE,
//       PERM.EXAM_RESULTS_GRADE,
//       PERM.EXAM_RESULTS_REMARKS,
//       PERM.EXAM_RESULTS_ANALYTICS,
//     ],
//   },
//   {
//     label: 'Notices & Announcements',
//     icon: '📣',
//     perms: [
//       PERM.NOTICES_READ,
//       PERM.NOTICES_CREATE,
//       PERM.NOTICES_TARGET,
//       PERM.NOTICES_PRIORITY,
//       PERM.NOTIFICATIONS_READ,
//       PERM.NOTIFICATIONS_SEND,
//       PERM.COMMUNICATION_SEND,
//       PERM.COMMUNICATION_GROUPS,
//     ],
//   },
//   {
//     label: 'Reports',
//     icon: '📊',
//     perms: [
//       PERM.REPORTS_STUDENT,
//       PERM.REPORTS_ATTENDANCE,
//       PERM.REPORTS_EXAM,
//       PERM.REPORTS_CLASS,
//       PERM.REPORTS_EXPORT,
//     ],
//   },
//   {
//     label: 'Leave & Attendance',
//     icon: '🚶',
//     perms: [
//       PERM.TEACHER_LEAVE,
//       PERM.TEACHER_SUBSTITUTE,
//       PERM.STAFF_ATTENDANCE_VIEW,
//       PERM.CALENDAR_HOLIDAYS,
//     ],
//   },
//   {
//     label: 'Profile & Achievements',
//     icon: '👤',
//     perms: [
//       PERM.TEACHER_PROFILE_VIEW,
//       PERM.TEACHER_PROFILE_EDIT,
//       PERM.TEACHER_ACHIEVEMENTS,
//       PERM.TEACHER_REMARKS,
//       PERM.TEACHER_DOCUMENTS,
//     ],
//   },
//   {
//     label: 'Communication',
//     icon: '💬',
//     perms: [
//       PERM.PARENTS_COMMUNICATE,
//       PERM.COMMUNICATION_HISTORY,
//       PERM.PARENTS_MEETING_SCHEDULE,
//       PERM.PARENT_MEETINGS,
//       PERM.PARENT_FEEDBACK,
//     ],
//   },
//   {
//     label: 'Library',
//     icon: '📖',
//     perms: [
//       PERM.LIBRARY_ACCESS,
//       PERM.LIBRARY_BOOKS_READ,
//       PERM.LIBRARY_BOOKS_ISSUE,
//       PERM.LIBRARY_REPORTS,
//     ],
//   },
//   {
//     label: 'Transport (if applicable)',
//     icon: '🚌',
//     perms: [
//       PERM.TRANSPORT_VIEW,
//       PERM.TRANSPORT_ROUTES,
//     ],
//   },
// ];

// // ─────────────────────────────────────────────────────────────────────────────
// // STUDENT PERMISSION GROUPS (Portal Level) - UPDATED & COMPLETE
// // Jo student ko chahiye portal mein
// // ─────────────────────────────────────────────────────────────────────────────
// export const STUDENT_PERMISSION_GROUPS = [
//   {
//     label: 'Dashboard',
//     icon: '📊',
//     perms: [
//       PERM.DASHBOARD_VIEW,
//       PERM.CALENDAR_VIEW,
//     ],
//   },
//   {
//     label: 'My Attendance',
//     icon: '✅',
//     perms: [
//       PERM.ATTENDANCE_VIEW,
//       PERM.ATTENDANCE_SELF_MARK,
//       PERM.ATTENDANCE_REPORT,
//     ],
//   },
//   {
//     label: 'My Results',
//     icon: '📈',
//     perms: [
//       PERM.EXAM_RESULTS_VIEW,
//       PERM.EXAM_RESULTS_ANALYTICS,
//       PERM.REPORTS_STUDENT,
//     ],
//   },
//   {
//     label: 'My Fees',
//     icon: '💰',
//     perms: [
//       PERM.FEES_READ,
//       PERM.FEES_RECEIPT,
//       PERM.FEES_DUE_REMINDER,
//       PERM.REPORTS_FEE,
//     ],
//   },
//   {
//     label: 'My Timetable',
//     icon: '🗓',
//     perms: [
//       PERM.TIMETABLE_READ,
//       PERM.TIMETABLE_STUDENT_VIEW,
//       PERM.CALENDAR_EVENTS,
//     ],
//   },
//   {
//     label: 'My Classes',
//     icon: '🏫',
//     perms: [
//       PERM.CLASSES_READ,
//       PERM.SUBJECTS_READ,
//       PERM.BATCHES_READ,
//       PERM.CLASSES_VIEW_ROSTER,
//     ],
//   },
//   {
//     label: 'Homework',
//     icon: '📝',
//     perms: [
//       PERM.HOMEWORK_READ,
//       PERM.HOMEWORK_SUBMIT,
//       PERM.HOMEWORK_ATTACHMENTS,
//     ],
//   },
//   {
//     label: 'Assignments',
//     icon: '📋',
//     perms: [
//       PERM.ASSIGNMENTS_READ,
//       PERM.ASSIGNMENTS_SUBMIT,
//       PERM.ASSIGNMENTS_ATTACHMENTS,
//     ],
//   },
//   {
//     label: 'Study Material',
//     icon: '📚',
//     perms: [
//       PERM.NOTES_READ,
//       PERM.NOTES_DOWNLOAD,
//       PERM.SYLLABUS_READ,
//       PERM.SYLLABUS_TOPICS,
//       PERM.SYLLABUS_PROGRESS,
//       PERM.COURSES_MATERIALS,
//     ],
//   },
//   {
//     label: 'Exams',
//     icon: '🧪',
//     perms: [
//       PERM.EXAMS_READ,
//       PERM.EXAMS_SCHEDULE,
//       PERM.EXAMS_SEATING,
//     ],
//   },
//   {
//     label: 'Notices',
//     icon: '📣',
//     perms: [
//       PERM.NOTICES_READ,
//       PERM.NOTIFICATIONS_READ,
//     ],
//   },
//   {
//     label: 'My Profile',
//     icon: '👤',
//     perms: [
//       PERM.STUDENT_PROFILE_VIEW,
//       PERM.STUDENT_PROFILE_EDIT,
//       PERM.STUDENT_DOCUMENTS_VIEW,
//       PERM.STUDENT_ACHIEVEMENTS,
//       PERM.USERS_PROFILE,
//       PERM.USERS_PASSWORD,
//     ],
//   },
//   {
//     label: 'Library',
//     icon: '📖',
//     perms: [
//       PERM.LIBRARY_ACCESS,
//       PERM.LIBRARY_BOOKS_READ,
//       PERM.LIBRARY_BOOKS_ISSUE,
//       PERM.LIBRARY_FINES,
//     ],
//   },
//   {
//     label: 'Transport',
//     icon: '🚌',
//     perms: [
//       PERM.TRANSPORT_VIEW,
//       PERM.TRANSPORT_TRACKING,
//     ],
//   },
//   {
//     label: 'Hostel (if applicable)',
//     icon: '🏠',
//     perms: [
//       PERM.HOSTEL_VIEW,
//       PERM.HOSTEL_ATTENDANCE,
//       PERM.HOSTEL_FEES,
//     ],
//   },
//   {
//     label: 'Events & Calendar',
//     icon: '📅',
//     perms: [
//       PERM.CALENDAR_EVENTS,
//       PERM.CALENDAR_HOLIDAYS,
//     ],
//   },
//   {
//     label: 'Feedback & Remarks',
//     icon: '💬',
//     perms: [
//       PERM.STUDENT_REMARKS,
//       PERM.PARENT_FEEDBACK,
//     ],
//   },
// ];

// // ─────────────────────────────────────────────────────────────────────────────
// // PARENT PERMISSION GROUPS (Portal Level) - UPDATED & COMPLETE
// // Jo parent ko chahiye portal mein
// // ─────────────────────────────────────────────────────────────────────────────
// export const PARENT_PERMISSION_GROUPS = [
//   {
//     label: 'Dashboard',
//     icon: '📊',
//     perms: [
//       PERM.DASHBOARD_VIEW,
//       PERM.CALENDAR_VIEW,
//     ],
//   },
//   {
//     label: 'My Children',
//     icon: '👨‍👩‍👧',
//     perms: [
//       PERM.PARENTS_VIEW_CHILDREN,
//       PERM.STUDENT_PROFILE_VIEW,
//       PERM.STUDENTS_VIEW_DETAILS,
//     ],
//   },
//   {
//     label: 'Ward Attendance',
//     icon: '✅',
//     perms: [
//       PERM.ATTENDANCE_VIEW,
//       PERM.ATTENDANCE_REPORT,
//       PERM.REPORTS_ATTENDANCE,
//     ],
//   },
//   {
//     label: 'Ward Results',
//     icon: '📈',
//     perms: [
//       PERM.EXAM_RESULTS_VIEW,
//       PERM.EXAM_RESULTS_ANALYTICS,
//       PERM.REPORTS_EXAM,
//       PERM.REPORTS_STUDENT,
//     ],
//   },
//   {
//     label: 'Ward Fees',
//     icon: '💰',
//     perms: [
//       PERM.FEES_READ,
//       PERM.FEES_COLLECT,
//       PERM.FEES_RECEIPT,
//       PERM.FEES_DUE_REMINDER,
//       PERM.REPORTS_FEE,
//       PERM.FEES_DISCOUNT,
//     ],
//   },
//   {
//     label: 'Ward Timetable',
//     icon: '🗓',
//     perms: [
//       PERM.TIMETABLE_READ,
//       PERM.TIMETABLE_STUDENT_VIEW,
//       PERM.CALENDAR_EVENTS,
//     ],
//   },
//   {
//     label: 'Ward Classes',
//     icon: '🏫',
//     perms: [
//       PERM.CLASSES_READ,
//       PERM.SUBJECTS_READ,
//       PERM.CLASSES_VIEW_ROSTER,
//       PERM.BATCHES_READ,
//     ],
//   },
//   {
//     label: 'Homework',
//     icon: '📝',
//     perms: [
//       PERM.HOMEWORK_READ,
//       PERM.HOMEWORK_ATTACHMENTS,
//     ],
//   },
//   {
//     label: 'Assignments',
//     icon: '📋',
//     perms: [
//       PERM.ASSIGNMENTS_READ,
//       PERM.ASSIGNMENTS_ATTACHMENTS,
//     ],
//   },
//   {
//     label: 'Study Material',
//     icon: '📚',
//     perms: [
//       PERM.NOTES_READ,
//       PERM.NOTES_DOWNLOAD,
//       PERM.SYLLABUS_READ,
//       PERM.SYLLABUS_TOPICS,
//       PERM.SYLLABUS_PROGRESS,
//     ],
//   },
//   {
//     label: 'Exams',
//     icon: '🧪',
//     perms: [
//       PERM.EXAMS_READ,
//       PERM.EXAMS_SCHEDULE,
//     ],
//   },
//   {
//     label: 'Notices',
//     icon: '📣',
//     perms: [
//       PERM.NOTICES_READ,
//       PERM.NOTIFICATIONS_READ,
//     ],
//   },
//   {
//     label: 'Communication',
//     icon: '💬',
//     perms: [
//       PERM.PARENTS_COMMUNICATE,
//       PERM.COMMUNICATION_SEND,
//       PERM.COMMUNICATION_HISTORY,
//       PERM.PARENTS_MEETING_SCHEDULE,
//       PERM.PARENT_MEETINGS,
//       PERM.PARENT_FEEDBACK,
//     ],
//   },
//   {
//     label: 'My Profile',
//     icon: '👤',
//     perms: [
//       PERM.PARENT_PROFILE_VIEW,
//       PERM.PARENT_PROFILE_EDIT,
//       PERM.USERS_PROFILE,
//       PERM.USERS_PASSWORD,
//     ],
//   },
//   {
//     label: 'Library',
//     icon: '📖',
//     perms: [
//       PERM.LIBRARY_ACCESS,
//       PERM.LIBRARY_BOOKS_READ,
//       PERM.LIBRARY_BOOKS_ISSUE,
//       PERM.LIBRARY_FINES,
//     ],
//   },
//   {
//     label: 'Transport',
//     icon: '🚌',
//     perms: [
//       PERM.TRANSPORT_VIEW,
//       PERM.TRANSPORT_TRACKING,
//       PERM.TRANSPORT_FEES,
//     ],
//   },
//   {
//     label: 'Hostel (if applicable)',
//     icon: '🏠',
//     perms: [
//       PERM.HOSTEL_VIEW,
//       PERM.HOSTEL_ATTENDANCE,
//       PERM.HOSTEL_FEES,
//     ],
//   },
//   {
//     label: 'Events & Calendar',
//     icon: '📅',
//     perms: [
//       PERM.CALENDAR_EVENTS,
//       PERM.CALENDAR_HOLIDAYS,
//     ],
//   },
//   {
//     label: 'Documents',
//     icon: '📄',
//     perms: [
//       PERM.STUDENT_DOCUMENTS_VIEW,
//       PERM.PARENT_DOCUMENTS,
//     ],
//   },
// ];

// // ─────────────────────────────────────────────────────────────────────────────
// // INSTITUTE ADMIN PERMISSION GROUPS (Master/Platform Level)
// // Sirf instituteAdmin ke liye
// // ─────────────────────────────────────────────────────────────────────────────
// export const ADMIN_PERMISSION_GROUPS = [
//   {
//     label: 'Dashboard',
//     icon: '📊',
//     perms: [PERM.DASHBOARD_VIEW, PERM.DASHBOARD_ANALYTICS, PERM.DASHBOARD_WIDGETS_CUSTOMIZE],
//   },
//   {
//     label: 'Students',
//     icon: '🎓',
//     perms: [
//       PERM.STUDENTS_CREATE, PERM.STUDENTS_READ, PERM.STUDENTS_UPDATE,
//       PERM.STUDENTS_DELETE, PERM.STUDENTS_DEACTIVATE, PERM.STUDENTS_TRANSFER,
//       PERM.STUDENTS_PROMOTE, PERM.STUDENTS_EXPORT, PERM.STUDENTS_IMPORT,
//       PERM.STUDENTS_BULK_ACTIONS, PERM.STUDENTS_VIEW_DETAILS, PERM.STUDENTS_CONTACT,
//       PERM.STUDENTS_DOCUMENTS, PERM.STUDENTS_BEHAVIOR,
//       PERM.STUDENT_PROFILE_VIEW, PERM.STUDENT_PROFILE_EDIT,
//       PERM.STUDENT_DOCUMENTS_UPLOAD, PERM.STUDENT_ACHIEVEMENTS,
//       PERM.STUDENT_REMARKS, PERM.STUDENT_BEHAVIOR_LOG,
//     ],
//   },
//   {
//     label: 'Teachers',
//     icon: '👩‍🏫',
//     perms: [
//       PERM.TEACHERS_CREATE, PERM.TEACHERS_READ, PERM.TEACHERS_UPDATE,
//       PERM.TEACHERS_DELETE, PERM.TEACHERS_DEACTIVATE, PERM.TEACHERS_VIEW_SCHEDULE,
//       PERM.TEACHERS_EVALUATE, PERM.TEACHERS_DOCUMENTS, PERM.TEACHERS_LEAVE_APPROVE,
//       PERM.TEACHER_PROFILE_VIEW, PERM.TEACHER_PROFILE_EDIT,
//       PERM.TEACHER_ACHIEVEMENTS, PERM.TEACHER_REMARKS,
//       PERM.TEACHER_LEAVE, PERM.TEACHER_SUBSTITUTE,
//     ],
//   },
//   {
//     label: 'Parents',
//     icon: '👨‍👩‍👧',
//     perms: [
//       PERM.PARENTS_CREATE, PERM.PARENTS_READ, PERM.PARENTS_UPDATE,
//       PERM.PARENTS_DELETE, PERM.PARENTS_DEACTIVATE, PERM.PARENTS_COMMUNICATE,
//       PERM.PARENTS_MEETING_SCHEDULE, PERM.PARENTS_VIEW_CHILDREN,
//       PERM.PARENT_PROFILE_VIEW, PERM.PARENT_PROFILE_EDIT,
//       PERM.PARENT_COMMUNICATION, PERM.PARENT_MEETINGS,
//       PERM.PARENT_FEEDBACK,
//     ],
//   },
//   {
//     label: 'Staff',
//     icon: '💼',
//     perms: [
//       PERM.STAFF_CREATE, PERM.STAFF_READ, PERM.STAFF_UPDATE,
//       PERM.STAFF_DELETE, PERM.STAFF_DEACTIVATE, PERM.STAFF_ATTENDANCE,
//       PERM.STAFF_PAYROLL, PERM.STAFF_LEAVE, PERM.STAFF_PERFORMANCE,
//       PERM.STAFF_TRAINING,
//     ],
//   },
//   {
//     label: 'Classes',
//     icon: '🏫',
//     perms: [
//       PERM.CLASSES_CREATE, PERM.CLASSES_READ, PERM.CLASSES_UPDATE,
//       PERM.CLASSES_DELETE, PERM.CLASSES_DEACTIVATE, PERM.CLASSES_ASSIGN_TEACHER,
//       PERM.CLASSES_VIEW_ROSTER, PERM.CLASSES_MATERIALS,
//     ],
//   },
//   {
//     label: 'Sections',
//     icon: '📋',
//     perms: [
//       PERM.SECTIONS_CREATE, PERM.SECTIONS_READ, PERM.SECTIONS_UPDATE,
//       PERM.SECTIONS_DELETE, PERM.SECTIONS_DEACTIVATE, PERM.SECTIONS_ASSIGN_STUDENTS,
//     ],
//   },
//   {
//     label: 'Subjects',
//     icon: '📗',
//     perms: [
//       PERM.SUBJECTS_CREATE, PERM.SUBJECTS_READ, PERM.SUBJECTS_UPDATE,
//       PERM.SUBJECTS_DELETE, PERM.SUBJECTS_DEACTIVATE, PERM.SUBJECTS_ASSIGN_TEACHER,
//       PERM.SUBJECTS_MATERIALS,
//     ],
//   },
//   {
//     label: 'Courses (Coaching)',
//     icon: '📚',
//     perms: [
//       PERM.COURSES_CREATE, PERM.COURSES_READ, PERM.COURSES_UPDATE,
//       PERM.COURSES_DELETE, PERM.COURSES_MATERIALS, PERM.COURSES_ASSIGNMENTS,
//       PERM.COURSES_ASSESSMENTS,
//     ],
//   },
//   {
//     label: 'Batches',
//     icon: '👥',
//     perms: [
//       PERM.BATCHES_CREATE, PERM.BATCHES_READ, PERM.BATCHES_UPDATE,
//       PERM.BATCHES_DELETE, PERM.BATCHES_STUDENTS, PERM.BATCHES_TIMETABLE,
//     ],
//   },
//   {
//     label: 'Programs',
//     icon: '🎯',
//     perms: [
//       PERM.PROGRAMS_CREATE, PERM.PROGRAMS_READ, PERM.PROGRAMS_UPDATE,
//       PERM.PROGRAMS_DELETE, PERM.PROGRAMS_COURSES, PERM.PROGRAMS_REQUIREMENTS,
//     ],
//   },
//   {
//     label: 'Semesters',
//     icon: '📅',
//     perms: [
//       PERM.SEMESTERS_CREATE, PERM.SEMESTERS_READ, PERM.SEMESTERS_UPDATE,
//       PERM.SEMESTERS_ACTIVATE, PERM.SEMESTERS_COURSES, PERM.SEMESTERS_REGISTRATION,
//     ],
//   },
//   {
//     label: 'Departments',
//     icon: '🏛️',
//     perms: [
//       PERM.DEPARTMENTS_CREATE, PERM.DEPARTMENTS_READ, PERM.DEPARTMENTS_UPDATE,
//       PERM.DEPARTMENTS_DELETE, PERM.DEPARTMENTS_STAFF, PERM.DEPARTMENTS_BUDGET,
//     ],
//   },
//   {
//     label: 'Academic Years',
//     icon: '📆',
//     perms: [
//       PERM.ACADEMIC_YEARS_CREATE, PERM.ACADEMIC_YEARS_READ,
//       PERM.ACADEMIC_YEARS_UPDATE, PERM.ACADEMIC_YEARS_ACTIVATE,
//       PERM.ACADEMIC_YEARS_TERMS,
//     ],
//   },
//   {
//     label: 'Admissions',
//     icon: '📝',
//     perms: [
//       PERM.ADMISSIONS_CREATE, PERM.ADMISSIONS_READ,
//       PERM.ADMISSIONS_UPDATE, PERM.ADMISSIONS_APPROVE,
//       PERM.ADMISSIONS_REJECT, PERM.ADMISSIONS_INTERVIEW,
//       PERM.ADMISSIONS_DOCUMENTS, PERM.ADMISSIONS_FEE,
//     ],
//   },
//   {
//     label: 'Timetable',
//     icon: '🗓',
//     perms: [
//       PERM.TIMETABLE_CREATE, PERM.TIMETABLE_READ, PERM.TIMETABLE_UPDATE,
//       PERM.TIMETABLE_DELETE, PERM.TIMETABLE_CONFLICT_CHECK, PERM.TIMETABLE_EXPORT,
//     ],
//   },
//   {
//     label: 'Attendance',
//     icon: '✅',
//     perms: [
//       PERM.ATTENDANCE_MARK, PERM.ATTENDANCE_VIEW,
//       PERM.ATTENDANCE_REPORT, PERM.ATTENDANCE_EXPORT,
//       PERM.ATTENDANCE_ANALYTICS, PERM.ATTENDANCE_BULK_MARK,
//       PERM.ATTENDANCE_VERIFY,
//     ],
//   },
//   {
//     label: 'Staff Attendance',
//     icon: '👤',
//     perms: [
//       PERM.STAFF_ATTENDANCE_MARK, PERM.STAFF_ATTENDANCE_VIEW,
//       PERM.STAFF_ATTENDANCE_REPORT, PERM.STAFF_ATTENDANCE_APPROVE,
//     ],
//   },
//   {
//     label: 'Exams',
//     icon: '🧪',
//     perms: [
//       PERM.EXAMS_CREATE, PERM.EXAMS_READ, PERM.EXAMS_UPDATE,
//       PERM.EXAMS_DELETE, PERM.EXAMS_DEACTIVATE, PERM.EXAMS_SCHEDULE,
//       PERM.EXAMS_SEATING, PERM.EXAMS_SUPERVISE,
//     ],
//   },
//   {
//     label: 'Exam Results',
//     icon: '📈',
//     perms: [
//       PERM.EXAM_RESULTS_ENTER, PERM.EXAM_RESULTS_VIEW,
//       PERM.EXAM_RESULTS_PUBLISH, PERM.EXAM_RESULTS_UPDATE,
//       PERM.EXAM_RESULTS_DELETE, PERM.EXAM_RESULTS_ANALYTICS,
//       PERM.EXAM_RESULTS_EXPORT, PERM.EXAM_RESULTS_GRADE,
//       PERM.EXAM_RESULTS_REMARKS,
//     ],
//   },
//   {
//     label: 'Homework',
//     icon: '📝',
//     perms: [
//       PERM.HOMEWORK_CREATE, PERM.HOMEWORK_READ, PERM.HOMEWORK_UPDATE,
//       PERM.HOMEWORK_DELETE, PERM.HOMEWORK_GRADE, PERM.HOMEWORK_ATTACHMENTS,
//     ],
//   },
//   {
//     label: 'Assignments',
//     icon: '📋',
//     perms: [
//       PERM.ASSIGNMENTS_CREATE, PERM.ASSIGNMENTS_READ, PERM.ASSIGNMENTS_UPDATE,
//       PERM.ASSIGNMENTS_DELETE, PERM.ASSIGNMENTS_GRADE, PERM.ASSIGNMENTS_ATTACHMENTS,
//     ],
//   },
//   {
//     label: 'Notes & Material',
//     icon: '📚',
//     perms: [
//       PERM.NOTES_CREATE, PERM.NOTES_READ, PERM.NOTES_UPDATE,
//       PERM.NOTES_DELETE, PERM.NOTES_DOWNLOAD, PERM.NOTES_SHARE,
//       PERM.NOTES_CATEGORIZE,
//     ],
//   },
//   {
//     label: 'Syllabus',
//     icon: '📜',
//     perms: [
//       PERM.SYLLABUS_CREATE, PERM.SYLLABUS_READ, PERM.SYLLABUS_UPDATE,
//       PERM.SYLLABUS_DELETE, PERM.SYLLABUS_TOPICS, PERM.SYLLABUS_PROGRESS,
//     ],
//   },
//   {
//     label: 'Fee Templates',
//     icon: '🧾',
//     perms: [
//       PERM.FEE_TEMPLATES_CREATE, PERM.FEE_TEMPLATES_READ,
//       PERM.FEE_TEMPLATES_UPDATE, PERM.FEE_TEMPLATES_DELETE,
//       PERM.FEE_TEMPLATES_DEACTIVATE,
//     ],
//   },
//   {
//     label: 'Fees & Finance',
//     icon: '💰',
//     perms: [
//       PERM.FEES_CREATE, PERM.FEES_READ, PERM.FEES_COLLECT,
//       PERM.FEES_UPDATE, PERM.FEES_REPORT, PERM.FEES_DELETE,
//       PERM.FEES_DISCOUNT, PERM.FEES_EXPORT, PERM.FEES_DUE_REMINDER,
//       PERM.FEES_RECEIPT, PERM.FEES_REFUND, PERM.FEES_LATE_FEE,
//       PERM.FEES_SCHOLARSHIP,
//     ],
//   },
//   {
//     label: 'Payroll',
//     icon: '💵',
//     perms: [
//       PERM.PAYROLL_CREATE, PERM.PAYROLL_READ,
//       PERM.PAYROLL_PROCESS, PERM.PAYROLL_REPORT,
//       PERM.PAYROLL_SALARY_STRUCTURE, PERM.PAYROLL_TAX,
//       PERM.PAYROLL_BONUS, PERM.PAYROLL_DEDUCTION,
//     ],
//   },
//   {
//     label: 'Notices',
//     icon: '📣',
//     perms: [
//       PERM.NOTICES_CREATE, PERM.NOTICES_READ, PERM.NOTICES_UPDATE,
//       PERM.NOTICES_DELETE, PERM.NOTICES_DEACTIVATE, PERM.NOTICES_TARGET,
//       PERM.NOTICES_PRIORITY,
//     ],
//   },
//   {
//     label: 'Notifications',
//     icon: '🔔',
//     perms: [
//       PERM.NOTIFICATIONS_SEND, PERM.NOTIFICATIONS_READ,
//       PERM.NOTIFICATIONS_MANAGE, PERM.NOTIFICATIONS_TEMPLATES,
//       PERM.NOTIFICATIONS_PUSH, PERM.NOTIFICATIONS_EMAIL,
//       PERM.NOTIFICATIONS_SMS,
//     ],
//   },
//   {
//     label: 'Communication',
//     icon: '💬',
//     perms: [
//       PERM.COMMUNICATION_SEND, PERM.COMMUNICATION_READ,
//       PERM.COMMUNICATION_GROUPS, PERM.COMMUNICATION_TEMPLATES,
//       PERM.COMMUNICATION_HISTORY,
//     ],
//   },
//   {
//     label: 'Reports',
//     icon: '📊',
//     perms: [
//       PERM.REPORTS_STUDENT, PERM.REPORTS_ATTENDANCE, PERM.REPORTS_FEE,
//       PERM.REPORTS_EXAM, PERM.REPORTS_ANALYTICS, PERM.REPORTS_PAYROLL,
//       PERM.REPORTS_TEACHER, PERM.REPORTS_CLASS, PERM.REPORTS_CUSTOM,
//       PERM.REPORTS_EXPORT,
//     ],
//   },
//   {
//     label: 'Roles',
//     icon: '🛡',
//     perms: [
//       PERM.ROLES_CREATE, PERM.ROLES_READ, PERM.ROLES_UPDATE,
//       PERM.ROLES_DELETE, PERM.ROLES_DEACTIVATE, PERM.ROLES_ASSIGN,
//       PERM.ROLES_PERMISSIONS,
//     ],
//   },
//   {
//     label: 'Users',
//     icon: '👥',
//     perms: [
//       PERM.USERS_CREATE, PERM.USERS_READ, PERM.USERS_UPDATE,
//       PERM.USERS_DELETE, PERM.USERS_DEACTIVATE, PERM.USERS_PROFILE,
//       PERM.USERS_PASSWORD,
//     ],
//   },
//   {
//     label: 'Branches',
//     icon: '🏢',
//     perms: [
//       PERM.BRANCHES_CREATE, PERM.BRANCHES_READ, PERM.BRANCHES_UPDATE,
//       PERM.BRANCHES_DELETE, PERM.BRANCHES_DEACTIVATE, PERM.BRANCHES_ASSIGN_ROLE,
//       PERM.BRANCHES_TRANSFER,
//     ],
//   },
//   {
//     label: 'Settings',
//     icon: '⚙',
//     perms: [
//       PERM.SETTINGS_VIEW, PERM.SETTINGS_UPDATE,
//       PERM.SETTINGS_SYSTEM, PERM.SETTINGS_ACADEMIC,
//       PERM.SETTINGS_FINANCE, PERM.SETTINGS_NOTIFICATIONS,
//     ],
//   },
//   {
//     label: 'Library',
//     icon: '📖',
//     perms: [
//       PERM.LIBRARY_ACCESS, PERM.LIBRARY_BOOKS_READ, PERM.LIBRARY_BOOKS_ISSUE,
//       PERM.LIBRARY_BOOKS_ADD, PERM.LIBRARY_BOOKS_UPDATE, PERM.LIBRARY_BOOKS_DELETE,
//       PERM.LIBRARY_CATEGORIES, PERM.LIBRARY_REPORTS, PERM.LIBRARY_FINES,
//     ],
//   },
//   {
//     label: 'Transport',
//     icon: '🚌',
//     perms: [
//       PERM.TRANSPORT_VIEW, PERM.TRANSPORT_MANAGE,
//       PERM.TRANSPORT_ROUTES, PERM.TRANSPORT_VEHICLES,
//       PERM.TRANSPORT_FEES, PERM.TRANSPORT_TRACKING,
//     ],
//   },
//   {
//     label: 'Hostel',
//     icon: '🏠',
//     perms: [
//       PERM.HOSTEL_VIEW, PERM.HOSTEL_MANAGE,
//       PERM.HOSTEL_ROOMS, PERM.HOSTEL_ALLOCATION,
//       PERM.HOSTEL_FEES, PERM.HOSTEL_ATTENDANCE,
//     ],
//   },
//   {
//     label: 'Inventory',
//     icon: '📦',
//     perms: [
//       PERM.INVENTORY_VIEW, PERM.INVENTORY_MANAGE,
//       PERM.INVENTORY_ITEMS, PERM.INVENTORY_PURCHASE,
//       PERM.INVENTORY_ISSUE, PERM.INVENTORY_REPORTS,
//     ],
//   },
//   {
//     label: 'Calendar',
//     icon: '📅',
//     perms: [
//       PERM.CALENDAR_VIEW, PERM.CALENDAR_CREATE,
//       PERM.CALENDAR_UPDATE, PERM.CALENDAR_DELETE,
//       PERM.CALENDAR_EVENTS, PERM.CALENDAR_HOLIDAYS,
//     ],
//   },
//   {
//     label: 'Research (Univ)',
//     icon: '🔬',
//     perms: [
//       PERM.RESEARCH_READ, PERM.RESEARCH_SUBMIT, PERM.RESEARCH_APPROVE,
//       PERM.RESEARCH_PUBLISH, PERM.RESEARCH_GRANTS, PERM.RESEARCH_COLLABORATION,
//     ],
//   },
// ];

// // ─────────────────────────────────────────────────────────────────────────────
// // TUITION CENTER / COACHING SPECIFIC GROUPS
// // Ye alag se add kiye hain agar specifically coaching ke liye chahiye
// // ─────────────────────────────────────────────────────────────────────────────
// export const COACHING_PERMISSION_GROUPS = [
//   {
//     label: 'Courses',
//     icon: '📚',
//     perms: [
//       PERM.COURSES_CREATE, PERM.COURSES_READ, PERM.COURSES_UPDATE,
//       PERM.COURSES_DELETE, PERM.COURSES_MATERIALS, PERM.COURSES_ASSIGNMENTS,
//       PERM.COURSES_ASSESSMENTS,
//     ],
//   },
//   {
//     label: 'Batches',
//     icon: '👥',
//     perms: [
//       PERM.BATCHES_CREATE, PERM.BATCHES_READ, PERM.BATCHES_UPDATE,
//       PERM.BATCHES_DELETE, PERM.BATCHES_STUDENTS, PERM.BATCHES_TIMETABLE,
//     ],
//   },
//   {
//     label: 'Enrollments',
//     icon: '📝',
//     perms: [
//       PERM.ADMISSIONS_CREATE, PERM.ADMISSIONS_READ, PERM.ADMISSIONS_UPDATE,
//       PERM.ADMISSIONS_APPROVE, PERM.ADMISSIONS_FEE,
//     ],
//   },
//   {
//     label: 'Session Schedule',
//     icon: '🗓',
//     perms: [
//       PERM.TIMETABLE_CREATE, PERM.TIMETABLE_READ, PERM.TIMETABLE_UPDATE,
//       PERM.TIMETABLE_TEACHER_VIEW,
//     ],
//   },
// ];

// // ─────────────────────────────────────────────────────────────────────────────
// // FLAT ARRAYS (For "Full Access" feature)
// // Har user type ke liye saari permissions ka flat array
// // ─────────────────────────────────────────────────────────────────────────────
// export const ALL_ADMIN_PERMISSIONS = ADMIN_PERMISSION_GROUPS.flatMap(g => g.perms);
// export const ALL_TEACHER_PERMISSIONS = TEACHER_PERMISSION_GROUPS.flatMap(g => g.perms);
// export const ALL_STUDENT_PERMISSIONS = STUDENT_PERMISSION_GROUPS.flatMap(g => g.perms);
// export const ALL_PARENT_PERMISSIONS = PARENT_PERMISSION_GROUPS.flatMap(g => g.perms);
// export const ALL_COACHING_PERMISSIONS = COACHING_PERMISSION_GROUPS.flatMap(g => g.perms);

// // ─────────────────────────────────────────────────────────────────────────────
// // BACKWARD COMPATIBILITY ALIASES
// // ─────────────────────────────────────────────────────────────────────────────
// export const PERMISSION_GROUPS = ADMIN_PERMISSION_GROUPS;
// export const ALL_PERMISSIONS = ALL_ADMIN_PERMISSIONS;
// export const PERMISSIONS = PERM;

// // ─────────────────────────────────────────────────────────────────────────────
// // HELPER FUNCTIONS
// // ─────────────────────────────────────────────────────────────────────────────

// /** 'students.create' => 'Create' */
// export const permLabel = (code) => {
//   if (!code) return '';
//   const action = code.split('.').pop() ?? code;
//   return action.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
// };

// /** 'students.create' => 'Students: Create' */
// export const permFullLabel = (code) => {
//   if (!code) return '';
//   const [mod, ...rest] = code.split('.');
//   const m = mod.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
//   const a = rest.join('.').replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
//   return m + ': ' + a;
// };

// /** Parse permissions JSONB into user-type objects */
// export const parsePermissions = (permissions) => {
//   if (!permissions) return { instituteAdmin: [], teacher: [], student: [], parent: [] };
//   if (Array.isArray(permissions)) {
//     return { instituteAdmin: permissions, teacher: [], student: [], parent: [] };
//   }
//   return {
//     instituteAdmin: permissions.instituteAdmin ?? [],
//     teacher: permissions.teacher ?? [],
//     student: permissions.student ?? [],
//     parent: permissions.parent ?? [],
//   };
// };

// /** Check if permissions include 'ALL' (full access) */
// export const isFullAccess = (perms) => Array.isArray(perms) && perms.includes('ALL');

// /** Get permission group by user type */
// export const getPermissionGroupsByType = (type) => {
//   switch(type) {
//     case 'instituteAdmin': return ADMIN_PERMISSION_GROUPS;
//     case 'teacher': return TEACHER_PERMISSION_GROUPS;
//     case 'student': return STUDENT_PERMISSION_GROUPS;
//     case 'parent': return PARENT_PERMISSION_GROUPS;
//     case 'coaching': return COACHING_PERMISSION_GROUPS;
//     default: return ADMIN_PERMISSION_GROUPS;
//   }
// };

// /** Get all permissions by user type */
// export const getAllPermissionsByType = (type) => {
//   switch(type) {
//     case 'instituteAdmin': return ALL_ADMIN_PERMISSIONS;
//     case 'teacher': return ALL_TEACHER_PERMISSIONS;
//     case 'student': return ALL_STUDENT_PERMISSIONS;
//     case 'parent': return ALL_PARENT_PERMISSIONS;
//     case 'coaching': return ALL_COACHING_PERMISSIONS;
//     default: return ALL_ADMIN_PERMISSIONS;
//   }
// };

// // Export all as default object as well
// export default {
//   PERM,
//   ADMIN_PERMISSION_GROUPS,
//   TEACHER_PERMISSION_GROUPS,
//   STUDENT_PERMISSION_GROUPS,
//   PARENT_PERMISSION_GROUPS,
//   COACHING_PERMISSION_GROUPS,
//   ALL_ADMIN_PERMISSIONS,
//   ALL_TEACHER_PERMISSIONS,
//   ALL_STUDENT_PERMISSIONS,
//   ALL_PARENT_PERMISSIONS,
//   ALL_COACHING_PERMISSIONS,
//   PERMISSION_GROUPS,
//   ALL_PERMISSIONS,
//   PERMISSIONS,
//   permLabel,
//   permFullLabel,
//   parsePermissions,
//   isFullAccess,
//   getPermissionGroupsByType,
//   getAllPermissionsByType,
// };










// backend/src/constants/permissions.constants.js

/**
 * COMPLETE PERMISSIONS CONSTANTS
 * The Clouds Academy
 * 
 * Single source of truth for ALL permissions across all user types
 */

// ─────────────────────────────────────────────────────────────────────────────
// BASE PERMISSION CODES (Matches DB seed)
// ─────────────────────────────────────────────────────────────────────────────
export const PERM = {
  // Dashboard
  DASHBOARD_VIEW:           'dashboard.view',
  DASHBOARD_ANALYTICS:      'dashboard.analytics',
  DASHBOARD_WIDGETS_CUSTOMIZE: 'dashboard.widgets.customize',

  // Students
  STUDENTS_CREATE:          'students.create',
  STUDENTS_READ:            'students.read',
  STUDENTS_UPDATE:          'students.update',
  STUDENTS_DELETE:          'students.delete',
  STUDENTS_DEACTIVATE:      'students.deactivate',
  STUDENTS_TRANSFER:        'students.transfer',
  STUDENTS_PROMOTE:         'students.promote',
  STUDENTS_EXPORT:          'students.export',
  STUDENTS_IMPORT:          'students.import',
  STUDENTS_BULK_ACTIONS:    'students.bulk_actions',
  STUDENTS_VIEW_DETAILS:    'students.view_details',
  STUDENTS_CONTACT:         'students.contact',
  STUDENTS_DOCUMENTS:       'students.documents',
  STUDENTS_BEHAVIOR:        'students.behavior',

  // Teachers
  TEACHERS_CREATE:          'teachers.create',
  TEACHERS_READ:            'teachers.read',
  TEACHERS_UPDATE:          'teachers.update',
  TEACHERS_DELETE:          'teachers.delete',
  TEACHERS_DEACTIVATE:      'teachers.deactivate',
  TEACHERS_VIEW_SCHEDULE:   'teachers.view_schedule',
  TEACHERS_EVALUATE:        'teachers.evaluate',
  TEACHERS_DOCUMENTS:       'teachers.documents',
  TEACHERS_LEAVE_APPROVE:   'teachers.leave_approve',

  // Parents
  PARENTS_CREATE:           'parents.create',
  PARENTS_READ:             'parents.read',
  PARENTS_UPDATE:           'parents.update',
  PARENTS_DELETE:           'parents.delete',
  PARENTS_DEACTIVATE:       'parents.deactivate',
  PARENTS_COMMUNICATE:      'parents.communicate',
  PARENTS_MEETING_SCHEDULE: 'parents.meeting_schedule',
  PARENTS_VIEW_CHILDREN:    'parents.view_children',

  // Staff
  STAFF_CREATE:             'staff.create',
  STAFF_READ:               'staff.read',
  STAFF_UPDATE:             'staff.update',
  STAFF_DELETE:             'staff.delete',
  STAFF_DEACTIVATE:         'staff.deactivate',
  STAFF_ATTENDANCE:         'staff.attendance',
  STAFF_PAYROLL:            'staff.payroll',
  STAFF_LEAVE:              'staff.leave',
  STAFF_PERFORMANCE:        'staff.performance',
  STAFF_TRAINING:           'staff.training',

  // Classes / Courses / Programs
  CLASSES_CREATE:           'classes.create',
  CLASSES_READ:             'classes.read',
  CLASSES_UPDATE:           'classes.update',
  CLASSES_DELETE:           'classes.delete',
  CLASSES_DEACTIVATE:       'classes.deactivate',
  CLASSES_ASSIGN_TEACHER:   'classes.assign_teacher',
  CLASSES_VIEW_ROSTER:      'classes.view_roster',
  CLASSES_MATERIALS:        'classes.materials',

  // Sections / Batches / Groups
  SECTIONS_CREATE:          'sections.create',
  SECTIONS_READ:            'sections.read',
  SECTIONS_UPDATE:          'sections.update',
  SECTIONS_DELETE:          'sections.delete',
  SECTIONS_DEACTIVATE:      'sections.deactivate',
  SECTIONS_ASSIGN_STUDENTS: 'sections.assign_students',

  // Subjects
  SUBJECTS_CREATE:          'subjects.create',
  SUBJECTS_READ:            'subjects.read',
  SUBJECTS_UPDATE:          'subjects.update',
  SUBJECTS_DELETE:          'subjects.delete',
  SUBJECTS_DEACTIVATE:      'subjects.deactivate',
  SUBJECTS_ASSIGN_TEACHER:  'subjects.assign_teacher',
  SUBJECTS_MATERIALS:       'subjects.materials',

  // Academic Years
  ACADEMIC_YEARS_CREATE:    'academic_years.create',
  ACADEMIC_YEARS_READ:      'academic_years.read',
  ACADEMIC_YEARS_UPDATE:    'academic_years.update',
  ACADEMIC_YEARS_ACTIVATE:  'academic_years.activate',
  ACADEMIC_YEARS_TERMS:     'academic_years.terms',

  // Admissions
  ADMISSIONS_CREATE:        'admissions.create',
  ADMISSIONS_READ:          'admissions.read',
  ADMISSIONS_UPDATE:        'admissions.update',
  ADMISSIONS_APPROVE:       'admissions.approve',
  ADMISSIONS_REJECT:        'admissions.reject',
  ADMISSIONS_INTERVIEW:     'admissions.interview',
  ADMISSIONS_DOCUMENTS:     'admissions.documents',
  ADMISSIONS_FEE:           'admissions.fee',

  // Timetable
  TIMETABLE_CREATE:         'timetable.create',
  TIMETABLE_READ:           'timetable.read',
  TIMETABLE_UPDATE:         'timetable.update',
  TIMETABLE_DELETE:         'timetable.delete',
  TIMETABLE_CONFLICT_CHECK: 'timetable.conflict_check',
  TIMETABLE_EXPORT:         'timetable.export',
  TIMETABLE_TEACHER_VIEW:   'timetable.teacher_view',
  TIMETABLE_STUDENT_VIEW:   'timetable.student_view',

  // Attendance
  ATTENDANCE_MARK:          'attendance.mark',
  ATTENDANCE_VIEW:          'attendance.view',
  ATTENDANCE_REPORT:        'attendance.report',
  ATTENDANCE_EXPORT:        'attendance.export',
  ATTENDANCE_ANALYTICS:     'attendance.analytics',
  ATTENDANCE_BULK_MARK:     'attendance.bulk_mark',
  ATTENDANCE_SELF_MARK:     'attendance.self_mark',
  ATTENDANCE_VERIFY:        'attendance.verify',
  
  // Staff Attendance
  STAFF_ATTENDANCE_MARK:    'staff_attendance.mark',
  STAFF_ATTENDANCE_VIEW:    'staff_attendance.view',
  STAFF_ATTENDANCE_REPORT:  'staff_attendance.report',
  STAFF_ATTENDANCE_APPROVE: 'staff_attendance.approve',

  // ==================== EXAMS & RESULTS PERMISSIONS ====================
  // Exams
  EXAMS_CREATE:             'exams.create',
  EXAMS_READ:               'exams.read',
  EXAMS_UPDATE:             'exams.update',
  EXAMS_DELETE:             'exams.delete',
  EXAMS_DEACTIVATE:         'exams.deactivate',
  EXAMS_SCHEDULE:           'exams.schedule',
  EXAMS_SEATING:            'exams.seating',
  EXAMS_SUPERVISE:          'exams.supervise',
  EXAMS_MANAGE_ATTENDANCE:  'exams.manage_attendance',  // Optional exam attendance
  EXAMS_VIEW_OWN:           'exams.view_own',           // Student/Parent apne exams dekhe

  // Exam Results
  EXAM_RESULTS_ENTER:       'exam_results.enter',
  EXAM_RESULTS_VIEW:        'exam_results.view',
  EXAM_RESULTS_PUBLISH:     'exam_results.publish',
  EXAM_RESULTS_UPDATE:      'exam_results.update',
  EXAM_RESULTS_DELETE:      'exam_results.delete',
  EXAM_RESULTS_ANALYTICS:   'exam_results.analytics',
  EXAM_RESULTS_EXPORT:      'exam_results.export',
  EXAM_RESULTS_GRADE:       'exam_results.grade',
  EXAM_RESULTS_REMARKS:     'exam_results.remarks',
  EXAM_RESULTS_VIEW_OWN:    'exam_results.view_own',    // Student/Parent apne results dekhe

  // ==================== END EXAMS PERMISSIONS ====================

  // Fee Templates
  FEE_TEMPLATES_CREATE:     'fee_templates.create',
  FEE_TEMPLATES_READ:       'fee_templates.read',
  FEE_TEMPLATES_UPDATE:     'fee_templates.update',
  FEE_TEMPLATES_DELETE:     'fee_templates.delete',
  FEE_TEMPLATES_DEACTIVATE: 'fee_templates.deactivate',

  // Fees & Finance
  FEES_CREATE:              'fees.create',
  FEES_READ:                'fees.read',
  FEES_COLLECT:             'fees.collect',
  FEES_UPDATE:              'fees.update',
  FEES_REPORT:              'fees.report',
  FEES_DELETE:              'fees.delete',
  FEES_DISCOUNT:            'fees.discount',
  FEES_EXPORT:              'fees.export',
  FEES_DUE_REMINDER:        'fees.due_reminder',
  FEES_RECEIPT:             'fees.receipt',
  FEES_REFUND:              'fees.refund',
  FEES_LATE_FEE:            'fees.late_fee',
  FEES_SCHOLARSHIP:         'fees.scholarship',

  // Payroll
  PAYROLL_CREATE:           'payroll.create',
  PAYROLL_READ:             'payroll.read',
  PAYROLL_PROCESS:          'payroll.process',
  PAYROLL_REPORT:           'payroll.report',
  PAYROLL_SALARY_STRUCTURE: 'payroll.salary_structure',
  PAYROLL_TAX:              'payroll.tax',
  PAYROLL_BONUS:            'payroll.bonus',
  PAYROLL_DEDUCTION:        'payroll.deduction',

  // Notices
  NOTICES_CREATE:           'notices.create',
  NOTICES_READ:             'notices.read',
  NOTICES_UPDATE:           'notices.update',
  NOTICES_DELETE:           'notices.delete',
  NOTICES_DEACTIVATE:       'notices.deactivate',
  NOTICES_TARGET:           'notices.target',
  NOTICES_PRIORITY:         'notices.priority',

  // Notifications
  NOTIFICATIONS_SEND:       'notifications.send',
  NOTIFICATIONS_READ:       'notifications.read',
  NOTIFICATIONS_MANAGE:     'notifications.manage',
  NOTIFICATIONS_TEMPLATES:  'notifications.templates',
  NOTIFICATIONS_PUSH:       'notifications.push',
  NOTIFICATIONS_EMAIL:      'notifications.email',
  NOTIFICATIONS_SMS:        'notifications.sms',

  // Homework
  HOMEWORK_CREATE:          'homework.create',
  HOMEWORK_READ:            'homework.read',
  HOMEWORK_UPDATE:          'homework.update',
  HOMEWORK_DELETE:          'homework.delete',
  HOMEWORK_SUBMIT:          'homework.submit',
  HOMEWORK_GRADE:           'homework.grade',
  HOMEWORK_ATTACHMENTS:     'homework.attachments',

  // Assignments
  ASSIGNMENTS_CREATE:       'assignments.create',
  ASSIGNMENTS_READ:         'assignments.read',
  ASSIGNMENTS_UPDATE:       'assignments.update',
  ASSIGNMENTS_DELETE:       'assignments.delete',
  ASSIGNMENTS_SUBMIT:       'assignments.submit',
  ASSIGNMENTS_GRADE:        'assignments.grade',
  ASSIGNMENTS_ATTACHMENTS:  'assignments.attachments',

  // Notes / Study Material
  NOTES_CREATE:             'notes.create',
  NOTES_READ:               'notes.read',
  NOTES_UPDATE:             'notes.update',
  NOTES_DELETE:             'notes.delete',
  NOTES_DOWNLOAD:           'notes.download',
  NOTES_SHARE:              'notes.share',
  NOTES_CATEGORIZE:         'notes.categorize',

  // Syllabus
  SYLLABUS_CREATE:          'syllabus.create',
  SYLLABUS_READ:            'syllabus.read',
  SYLLABUS_UPDATE:          'syllabus.update',
  SYLLABUS_DELETE:          'syllabus.delete',
  SYLLABUS_TOPICS:          'syllabus.topics',
  SYLLABUS_PROGRESS:        'syllabus.progress',

  // Reports
  REPORTS_STUDENT:          'reports.student',
  REPORTS_ATTENDANCE:       'reports.attendance',
  REPORTS_FEE:              'reports.fee',
  REPORTS_EXAM:             'reports.exam',
  REPORTS_ANALYTICS:        'reports.analytics',
  REPORTS_PAYROLL:          'reports.payroll',
  REPORTS_TEACHER:          'reports.teacher',
  REPORTS_CLASS:            'reports.class',
  REPORTS_CUSTOM:           'reports.custom',
  REPORTS_EXPORT:           'reports.export',

  // Roles & Permissions
  ROLES_READ:               'roles.read',
  ROLES_CREATE:             'roles.create',
  ROLES_UPDATE:             'roles.update',
  ROLES_DELETE:             'roles.delete',
  ROLES_DEACTIVATE:         'roles.deactivate',
  ROLES_ASSIGN:             'roles.assign',
  ROLES_PERMISSIONS:        'roles.permissions',

  // Users
  USERS_CREATE:             'users.create',
  USERS_READ:               'users.read',
  USERS_UPDATE:             'users.update',
  USERS_DELETE:             'users.delete',
  USERS_DEACTIVATE:         'users.deactivate',
  USERS_PROFILE:            'users.profile',
  USERS_PASSWORD:           'users.password',

  // Branches
  BRANCHES_CREATE:          'branches.create',
  BRANCHES_READ:            'branches.read',
  BRANCHES_UPDATE:          'branches.update',
  BRANCHES_DELETE:          'branches.delete',
  BRANCHES_DEACTIVATE:      'branches.deactivate',
  BRANCHES_ASSIGN_ROLE:     'branches.assign_role',
  BRANCHES_TRANSFER:        'branches.transfer',

  // Settings
  SETTINGS_VIEW:            'settings.view',
  SETTINGS_UPDATE:          'settings.update',
  SETTINGS_SYSTEM:          'settings.system',
  SETTINGS_ACADEMIC:        'settings.academic',
  SETTINGS_FINANCE:         'settings.finance',
  SETTINGS_NOTIFICATIONS:   'settings.notifications',

  // Library
  LIBRARY_ACCESS:           'library.access',
  LIBRARY_BOOKS_READ:       'library.books.read',
  LIBRARY_BOOKS_ISSUE:      'library.books.issue',
  LIBRARY_BOOKS_ADD:        'library.books.add',
  LIBRARY_BOOKS_UPDATE:     'library.books.update',
  LIBRARY_BOOKS_DELETE:     'library.books.delete',
  LIBRARY_CATEGORIES:       'library.categories',
  LIBRARY_REPORTS:          'library.reports',
  LIBRARY_FINES:            'library.fines',
  
  // Courses
  COURSES_CREATE:           'courses.create',
  COURSES_READ:             'courses.read',
  COURSES_UPDATE:           'courses.update',
  COURSES_DELETE:           'courses.delete',
  COURSES_MATERIALS:        'courses.materials',
  COURSES_ASSIGNMENTS:      'courses.assignments',
  COURSES_ASSESSMENTS:      'courses.assessments',
  
  // Batches
  BATCHES_CREATE:           'batches.create',
  BATCHES_READ:             'batches.read',
  BATCHES_UPDATE:           'batches.update',
  BATCHES_DELETE:           'batches.delete',
  BATCHES_STUDENTS:         'batches.students',
  BATCHES_TIMETABLE:        'batches.timetable',
  
  // Programs
  PROGRAMS_CREATE:          'programs.create',
  PROGRAMS_READ:            'programs.read',
  PROGRAMS_UPDATE:          'programs.update',
  PROGRAMS_DELETE:          'programs.delete',
  PROGRAMS_COURSES:         'programs.courses',
  PROGRAMS_REQUIREMENTS:    'programs.requirements',
  
  // Semesters
  SEMESTERS_CREATE:         'semesters.create',
  SEMESTERS_READ:           'semesters.read',
  SEMESTERS_UPDATE:         'semesters.update',
  SEMESTERS_ACTIVATE:       'semesters.activate',
  SEMESTERS_COURSES:        'semesters.courses',
  SEMESTERS_REGISTRATION:   'semesters.registration',
  
  // Departments
  DEPARTMENTS_CREATE:       'departments.create',
  DEPARTMENTS_READ:         'departments.read',
  DEPARTMENTS_UPDATE:       'departments.update',
  DEPARTMENTS_DELETE:       'departments.delete',
  DEPARTMENTS_STAFF:        'departments.staff',
  DEPARTMENTS_BUDGET:       'departments.budget',
  
  // Research
  RESEARCH_READ:            'research.read',
  RESEARCH_SUBMIT:          'research.submit',
  RESEARCH_APPROVE:         'research.approve',
  RESEARCH_PUBLISH:         'research.publish',
  RESEARCH_GRANTS:          'research.grants',
  RESEARCH_COLLABORATION:   'research.collaboration',

  // Calendar
  CALENDAR_VIEW:            'calendar.view',
  CALENDAR_CREATE:          'calendar.create',
  CALENDAR_UPDATE:          'calendar.update',
  CALENDAR_DELETE:          'calendar.delete',
  CALENDAR_EVENTS:          'calendar.events',
  CALENDAR_HOLIDAYS:        'calendar.holidays',

  // Communication
  COMMUNICATION_SEND:       'communication.send',
  COMMUNICATION_READ:       'communication.read',
  COMMUNICATION_GROUPS:     'communication.groups',
  COMMUNICATION_TEMPLATES:  'communication.templates',
  COMMUNICATION_HISTORY:    'communication.history',

  // Transport
  TRANSPORT_VIEW:           'transport.view',
  TRANSPORT_MANAGE:         'transport.manage',
  TRANSPORT_ROUTES:         'transport.routes',
  TRANSPORT_VEHICLES:       'transport.vehicles',
  TRANSPORT_FEES:           'transport.fees',
  TRANSPORT_TRACKING:       'transport.tracking',

  // Hostel
  HOSTEL_VIEW:              'hostel.view',
  HOSTEL_MANAGE:            'hostel.manage',
  HOSTEL_ROOMS:             'hostel.rooms',
  HOSTEL_ALLOCATION:        'hostel.allocation',
  HOSTEL_FEES:              'hostel.fees',
  HOSTEL_ATTENDANCE:        'hostel.attendance',

  // Inventory
  INVENTORY_VIEW:           'inventory.view',
  INVENTORY_MANAGE:         'inventory.manage',
  INVENTORY_ITEMS:          'inventory.items',
  INVENTORY_PURCHASE:       'inventory.purchase',
  INVENTORY_ISSUE:          'inventory.issue',
  INVENTORY_REPORTS:        'inventory.reports',

  // Student Profile
  STUDENT_PROFILE_VIEW:     'student.profile.view',
  STUDENT_PROFILE_EDIT:     'student.profile.edit',
  STUDENT_DOCUMENTS_VIEW:   'student.documents.view',
  STUDENT_DOCUMENTS_UPLOAD: 'student.documents.upload',
  STUDENT_BEHAVIOR_LOG:     'student.behavior.log',
  STUDENT_ACHIEVEMENTS:     'student.achievements',
  STUDENT_REMARKS:          'student.remarks',

  // Teacher Profile
  TEACHER_PROFILE_VIEW:     'teacher.profile.view',
  TEACHER_PROFILE_EDIT:     'teacher.profile.edit',
  TEACHER_ACHIEVEMENTS:     'teacher.achievements',
  TEACHER_REMARKS:          'teacher.remarks',
  TEACHER_LEAVE:            'teacher.leave',
  TEACHER_SUBSTITUTE:       'teacher.substitute',

  // Parent Profile
  PARENT_PROFILE_VIEW:      'parent.profile.view',
  PARENT_PROFILE_EDIT:      'parent.profile.edit',
  PARENT_COMMUNICATION:     'parent.communication',
  PARENT_MEETINGS:          'parent.meetings',
  PARENT_FEEDBACK:          'parent.feedback',
  PARENT_DOCUMENTS:         'parent.documents',
};

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
      PERM.EXAMS_MANAGE_ATTENDANCE,  // Optional exam attendance
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
      PERM.EXAMS_MANAGE_ATTENDANCE,  // Optional exam attendance
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
      PERM.REPORTS_EXPORT,
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
  switch(type) {
    case 'instituteAdmin': return ADMIN_PERMISSION_GROUPS;
    case 'teacher': return TEACHER_PERMISSION_GROUPS;
    case 'student': return STUDENT_PERMISSION_GROUPS;
    case 'parent': return PARENT_PERMISSION_GROUPS;
    default: return ADMIN_PERMISSION_GROUPS;
  }
};

export const getAllPermissionsByType = (type) => {
  switch(type) {
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