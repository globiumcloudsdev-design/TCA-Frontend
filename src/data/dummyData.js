// /**
//  * ╔══════════════════════════════════════════════════════════════╗
//  * ║   The Clouds Academy — Complete Dummy / Seed Data           ║
//  * ║                                                              ║
//  * ║  Used as fallback when backend API is unreachable.          ║
//  * ║  Import DUMMY_USERS to show demo login credentials.          ║
//  * ╚══════════════════════════════════════════════════════════════╝
//  *
//  * Demo Credentials
//  * ──────────────────────────────────────────────────────────────────────────────────────
//  *  Role / Type          │ Inst. Code │ Email                    │ Password
//  * ─────────────────────┼────────────┼──────────────────────────┼───────────────
//  *  Master Admin         │ MASTER     │ master@cloudsacademy.com │ master@123
//  *  Academy Admin (TCA)  │ TCA-LHR    │ admin@tca.edu.pk         │ admin@123
//  *  Fee Manager          │ TCA-LHR    │ fees@tca.edu.pk          │ fees@123
//  *  Class Teacher        │ TCA-LHR    │ teacher@tca.edu.pk       │ teacher@123
//  *  Receptionist         │ TCA-LHR    │ reception@tca.edu.pk     │ reception@123
//  *  Branch Admin         │ TCA-LHR    │ branch@tca.edu.pk        │ branch@123
//  *  Coaching Admin (SCC) │ SCC-LHR    │ admin@scc.edu.pk         │ coaching@123
//  *  Academy Admin (HIA)  │ HIA-ISL    │ admin@hia.edu.pk         │ academy@123
//  *  College Admin (PCC)  │ PCC-LHR    │ admin@pcc.edu.pk         │ college@123
//  * ──────────────────────────────────────────────────────────────────────────────────────
//  */

// // ──────────────────────────────────────────────────────────────────────────────
// // 0 ▸ INSTITUTE TYPES
// // ──────────────────────────────────────────────────────────────────────────────
// export const INSTITUTE_TYPES = [
//   {
//     value: 'school',
//     label: 'School',
//     icon: '🏫',
//     description: 'K-12 / O-Level / A-Level institutions',
//     extra_fields: [
//       { name: 'affiliation_board', label: 'Affiliation Board', placeholder: 'e.g. Punjab Board, Cambridge', required: false },
//       { name: 'grade_range',       label: 'Grade Range',        placeholder: 'e.g. Class 1 – 12',          required: false },
//     ],
//   },
//   {
//     value: 'coaching',
//     label: 'Coaching Center',
//     icon: '📚',
//     description: 'Subject-specific or entrance-test coaching',
//     extra_fields: [
//       { name: 'subject_focus', label: 'Subject / Focus Area', placeholder: 'e.g. Mathematics, Physics, MDCAT', required: false },
//       { name: 'target_exams', label: 'Target Exams',          placeholder: 'e.g. MDCAT, ECAT, CSS',            required: false },
//     ],
//   },
//   {
//     value: 'academy',
//     label: 'Academy',
//     icon: '🎓',
//     description: 'Skill-based or specialized training academies',
//     extra_fields: [
//       { name: 'specialization', label: 'Specialization', placeholder: 'e.g. IT, Sports, Arts, Language', required: false },
//     ],
//   },
//   {
//     value: 'college',
//     label: 'College',
//     icon: '🏛️',
//     description: 'Intermediate / Bachelors level colleges',
//     extra_fields: [
//       { name: 'affiliation_board',  label: 'Affiliation / University', placeholder: 'e.g. University of Punjab, HEC', required: false },
//       { name: 'degree_programs',    label: 'Degree Programs',           placeholder: 'e.g. FSc, FA, B.Com, BS',        required: false },
//     ],
//   },
//   {
//     value: 'university',
//     label: 'University',
//     icon: '🏗️',
//     description: 'Degree-awarding higher education institutes',
//     extra_fields: [
//       { name: 'hec_charter',  label: 'HEC Charter No.',  placeholder: 'e.g. HEC-2005-066', required: false },
//       { name: 'faculties',    label: 'Faculties / Departments', placeholder: 'e.g. Engineering, Medicine, Law', required: false },
//     ],
//   },
// ];

// // ──────────────────────────────────────────────────────────────────────────────
// // 0.1 ▸ INSTITUTE  (the currently logged-in school/institute)
// // ──────────────────────────────────────────────────────────────────────────────
// export const DUMMY_SCHOOL = {
//   id: 'school-001',
//   name: 'The Clouds Academy',
//   code: 'TCA-LHR',
//   institute_type: 'academy',
//   address: '12-B, Gulberg III, Lahore, Punjab',
//   phone: '+92-42-35761234',
//   email: 'info@tca.edu.pk',
//   website: 'https://tca.edu.pk',
//   logo_url: null,
//   has_branches: true,
//   is_active: true,
//   created_at: '2023-04-01T08:00:00.000Z',
//   // institute-type-specific
//   specialization: 'General Education',
// };

// // ──────────────────────────────────────────────────────────────────────────────
// // 0.1 ▸ BRANCHES
// // ──────────────────────────────────────────────────────────────────────────────
// export const DUMMY_BRANCHES = [
//   {
//     id: 'branch-001',
//     name: 'Main Campus',
//     address: '12-B, Gulberg III, Lahore',
//     phone: '+92-42-35761234',
//     email: 'main@tca.edu.pk',
//     school_id: 'school-001',
//     is_active: true,
//     created_at: '2023-04-01T08:00:00.000Z',
//   },
//   {
//     id: 'branch-002',
//     name: 'DHA Branch',
//     address: 'Plot 45, DHA Phase 5, Lahore',
//     phone: '+92-42-35769999',
//     email: 'dha@tca.edu.pk',
//     school_id: 'school-001',
//     is_active: true,
//     created_at: '2024-01-15T08:00:00.000Z',
//   },
// ];

// // ──────────────────────────────────────────────────────────────────────────────
// // 1 ▸ ROLES  (role_code mirrors backend)
// // ──────────────────────────────────────────────────────────────────────────────
// export const ALL_PERMISSIONS = [
//   'student.create', 'student.read', 'student.update', 'student.delete', 'student.export',
//   'admission.create', 'admission.read', 'admission.update', 'admission.delete', 'admission.approve',
//   'parent.create', 'parent.read', 'parent.update', 'parent.delete',
//   'teacher.create', 'teacher.read', 'teacher.update', 'teacher.delete',
//   'class.create',   'class.read',   'class.update',   'class.delete',
//   'section.create', 'section.read', 'section.update', 'section.delete',
//   'subject.create', 'subject.read', 'subject.update', 'subject.delete',
//   'timetable.create', 'timetable.read', 'timetable.update', 'timetable.delete',
//   'attendance.create', 'attendance.read', 'attendance.update', 'attendance.export',
//   'fee.create', 'fee.read', 'fee.update', 'fee.delete', 'fee.collect', 'fee.refund', 'fee.export',
//   'fee_template.create', 'fee_template.read', 'fee_template.update', 'fee_template.delete', 'fee_template.assign',
//   'exam.create', 'exam.read', 'exam.update', 'exam.delete', 'exam.publish',
//   'payroll.read', 'payroll.create', 'payroll.update', 'payroll.delete', 'payroll.generate', 'payroll.export',
//   'leave.read', 'leave.create', 'leave.approve',
//   'notice.create', 'notice.read', 'notice.update', 'notice.delete',
//   'notification.send',
//   'role.create', 'role.read', 'role.update', 'role.delete', 'role.assign',
//   'user.create', 'user.read', 'user.update', 'user.delete',
//   'academic_year.create', 'academic_year.read', 'academic_year.update', 'academic_year.delete',
//   'school.update', 'school.settings', 'school.assign_role',
//   'branch.create', 'branch.read', 'branch.update', 'branch.delete',
//   'report.financial', 'report.attendance', 'report.student', 'report.exam', 'report.salary', 'report.export',
// ];

// export const DUMMY_ROLES = [
//   {
//     id: 'role-001',
//     name: 'School Admin',
//     code: 'SCHOOL_ADMIN',
//     is_system: true,
//     permissions: ALL_PERMISSIONS,   // full access to everything in the school portal
//   },
//   {
//     id: 'role-002',
//     name: 'Fee Manager',
//     code: 'FEE_MANAGER',
//     is_system: false,
//     permissions: [
//       'student.read',
//       'parent.read',
//       'fee.create', 'fee.read', 'fee.update', 'fee.delete', 'fee.collect', 'fee.refund', 'fee.export',
//       'fee_template.read',
//       'report.financial', 'report.export',
//     ],
//   },
//   {
//     id: 'role-003',
//     name: 'Class Teacher',
//     code: 'CLASS_TEACHER',
//     is_system: false,
//     permissions: [
//       'student.read', 'student.export',
//       'class.read', 'section.read',
//       'timetable.read',
//       'attendance.create', 'attendance.read', 'attendance.update', 'attendance.export',
//       'exam.read', 'exam.create', 'exam.update',
//       'notice.read',
//       'report.attendance', 'report.student', 'report.exam', 'report.export',
//     ],
//   },
//   {
//     id: 'role-004',
//     name: 'Receptionist',
//     code: 'RECEPTIONIST',
//     is_system: false,
//     permissions: [
//       'student.read', 'student.create',
//       'admission.create', 'admission.read',
//       'parent.create', 'parent.read',
//       'fee.read', 'fee.collect',
//       'attendance.read',
//       'notice.read',
//     ],
//   },
//   {
//     id: 'role-005',
//     name: 'Branch Admin',
//     code: 'BRANCH_ADMIN',
//     is_system: false,
//     permissions: [
//       'student.read', 'student.create', 'student.update', 'student.export',
//       'admission.read', 'admission.create', 'admission.update', 'admission.approve',
//       'parent.read', 'parent.create',
//       'teacher.read',
//       'class.read', 'class.create', 'class.update',
//       'section.read', 'section.create', 'section.update',
//       'timetable.read',
//       'attendance.read', 'attendance.create',
//       'fee.read', 'fee_template.read',
//       'notice.read', 'notice.create',
//       'user.read', 'user.create',
//       'branch.create', 'branch.read', 'branch.update', 'branch.delete',
//       'report.student', 'report.attendance', 'report.export',
//     ],
//   },
//   {
//     id: 'role-006',
//     name: 'HR Manager',
//     code: 'HR_MANAGER',
//     is_system: false,
//     permissions: [
//       'teacher.read',
//       'payroll.read', 'payroll.create', 'payroll.update', 'payroll.generate', 'payroll.export',
//       'leave.read', 'leave.create', 'leave.approve',
//       'attendance.read', 'attendance.export',
//       'report.salary', 'report.attendance', 'report.export',
//     ],
//   },
//   {
//     id: 'role-007',
//     name: 'Admission Officer',
//     code: 'ADMISSION_OFFICER',
//     is_system: false,
//     permissions: [
//       'admission.create', 'admission.read', 'admission.update', 'admission.approve',
//       'student.create', 'student.read',
//       'parent.create', 'parent.read',
//       'class.read', 'section.read',
//       'fee_template.read',
//     ],
//   },
// ];

// // ──────────────────────────────────────────────────────────────────────────────
// // 2 ▸ USERS  (5 portal users — includes dummy login credentials)
// // ──────────────────────────────────────────────────────────────────────────────
// export const DUMMY_USERS = [
//   /* ─ 1 ─ MASTER ADMIN — platform-level, manages all schools ─── */
//   {
//     id: 'user-master-001',
//     first_name: 'Zahid',
//     last_name: 'Ali Khan',
//     email: 'master@cloudsacademy.com',
//     password: 'master@123',
//     phone: '+92-300-1234567',
//     role_code: 'MASTER_ADMIN',
//     is_active: true,
//     school_code: 'MASTER',
//     school: null,
//     role: { id: 'master-role', name: 'Master Admin', code: 'MASTER_ADMIN' },
//     permissions: [],                 // MASTER_ADMIN bypasses all permission checks
//     avatar: null,
//     created_at: '2023-01-01T00:00:00.000Z',
//   },

//   /* ─ 2 ─ SCHOOL ADMIN — full access to all school features ──── */
//   {
//     id: 'user-002',
//     first_name: 'Muhammad',
//     last_name: 'Usman',
//     email: 'admin@tca.edu.pk',
//     password: 'admin@123',
//     phone: '+92-321-9876543',
//     role_code: 'SCHOOL_ADMIN',
//     is_active: true,
//     school_code: 'TCA-LHR',
//     school: DUMMY_SCHOOL,
//     role: DUMMY_ROLES[0],
//     permissions: ALL_PERMISSIONS,   // every permission — students, fees, teachers, classes, exams, roles, users
//     avatar: null,
//     created_at: '2023-04-01T08:00:00.000Z',
//   },

//   /* ─ 3 ─ FEE MANAGER — fees + student read only ─────────────── */
//   {
//     id: 'user-003',
//     first_name: 'Ayesha',
//     last_name: 'Siddiqui',
//     email: 'fees@tca.edu.pk',
//     password: 'fees@123',
//     phone: '+92-333-5556677',
//     role_code: 'FEE_MANAGER',
//     is_active: true,
//     school_code: 'TCA-LHR',
//     school: DUMMY_SCHOOL,
//     role: DUMMY_ROLES[1],
//     permissions: DUMMY_ROLES[1].permissions,
//     avatar: null,
//     created_at: '2023-06-15T08:00:00.000Z',
//   },

//   /* ─ 4 ─ CLASS TEACHER — attendance + exams + read ───────────── */
//   {
//     id: 'user-004',
//     first_name: 'Hassan',
//     last_name: 'Mahmood',
//     email: 'teacher@tca.edu.pk',
//     password: 'teacher@123',
//     phone: '+92-315-4443322',
//     role_code: 'CLASS_TEACHER',
//     is_active: true,
//     school_code: 'TCA-LHR',
//     school: DUMMY_SCHOOL,
//     role: DUMMY_ROLES[2],
//     permissions: DUMMY_ROLES[2].permissions,
//     avatar: null,
//     created_at: '2023-08-01T08:00:00.000Z',
//   },

//   /* ─ 5 ─ RECEPTIONIST — minimal: admit students + collect fees ─ */
//   {
//     id: 'user-005',
//     first_name: 'Sarah',
//     last_name: 'Noor',
//     email: 'reception@tca.edu.pk',
//     password: 'reception@123',
//     phone: '+92-311-7778899',
//     role_code: 'RECEPTIONIST',
//     is_active: true,
//     school_code: 'TCA-LHR',
//     school: DUMMY_SCHOOL,
//     role: DUMMY_ROLES[3],
//     permissions: DUMMY_ROLES[3].permissions,
//     avatar: null,
//     created_at: '2024-01-10T08:00:00.000Z',
//   },

//   /* ─ 6 ─ BRANCH ADMIN — manages branches of a multi-campus school ─ */
//   {
//     id: 'user-006',
//     first_name: 'Tariq',
//     last_name: 'Jamil',
//     email: 'branch@tca.edu.pk',
//     password: 'branch@123',
//     phone: '+92-333-4445566',
//     role_code: 'BRANCH_ADMIN',
//     is_active: true,
//     school_code: 'TCA-LHR',
//     school: DUMMY_SCHOOL,
//     branch_id: 'branch-001',
//     branch: null, // will be set after DUMMY_BRANCHES is referenced
//     role: DUMMY_ROLES[4],
//     permissions: DUMMY_ROLES[4].permissions,
//     avatar: null,
//     created_at: '2024-03-05T08:00:00.000Z',
//   },
// ];

// // ── 3 demo accounts for other institute types
// export const DUMMY_COACHING_INSTITUTE = {
//   id: 'inst-006', name: 'Star Coaching Center', code: 'SCC-LHR',
//   institute_type: 'coaching', subject_focus: 'Mathematics, Physics, Chemistry',
//   target_exams: 'MDCAT, ECAT', has_branches: false, is_active: true,
// };
// export const DUMMY_ACADEMY_INSTITUTE = {
//   id: 'inst-007', name: 'Horizon IT Academy', code: 'HIA-ISL',
//   institute_type: 'academy', specialization: 'Information Technology & Programming',
//   has_branches: true, is_active: true,
// };
// export const DUMMY_COLLEGE_INSTITUTE = {
//   id: 'inst-008', name: 'Punjab College of Commerce', code: 'PCC-LHR',
//   institute_type: 'college', affiliation_board: 'University of Punjab',
//   degree_programs: 'FSc, FA, ICS, I.Com, B.Com', has_branches: true, is_active: true,
// };

// DUMMY_USERS.push(
//   {
//     id: 'user-009',
//     first_name: 'Khalid',
//     last_name: 'Mehmood',
//     email: 'admin@scc.edu.pk',
//     password: 'coaching@123',
//     phone: '+92-321-1230009',
//     role_code: 'SCHOOL_ADMIN',
//     is_active: true,
//     school_code: 'SCC-LHR',
//     school: DUMMY_COACHING_INSTITUTE,
//     role: DUMMY_ROLES[0],
//     permissions: ALL_PERMISSIONS,
//     avatar: null,
//     created_at: '2025-01-10T08:00:00.000Z',
//   },
//   {
//     id: 'user-010',
//     first_name: 'Zara',
//     last_name: 'Hashmi',
//     email: 'admin@hia.edu.pk',
//     password: 'academy@123',
//     phone: '+92-333-1230010',
//     role_code: 'SCHOOL_ADMIN',
//     is_active: true,
//     school_code: 'HIA-ISL',
//     school: DUMMY_ACADEMY_INSTITUTE,
//     role: DUMMY_ROLES[0],
//     permissions: ALL_PERMISSIONS,
//     avatar: null,
//     created_at: '2025-03-20T08:00:00.000Z',
//   },
//   {
//     id: 'user-011',
//     first_name: 'Naveed',
//     last_name: 'Chaudhry',
//     email: 'admin@pcc.edu.pk',
//     password: 'college@123',
//     phone: '+92-302-1230011',
//     role_code: 'SCHOOL_ADMIN',
//     is_active: true,
//     school_code: 'PCC-LHR',
//     school: DUMMY_COLLEGE_INSTITUTE,
//     role: DUMMY_ROLES[0],
//     permissions: ALL_PERMISSIONS,
//     avatar: null,
//     created_at: '2025-05-01T08:00:00.000Z',
//   },
// );

// // Back-fill branch reference on user-006
// DUMMY_USERS.find((u) => u.id === 'user-006').branch = DUMMY_BRANCHES[0];

// // ──────────────────────────────────────────────────────────────────────────────
// // 3 ▸ ACADEMIC YEARS
// // ──────────────────────────────────────────────────────────────────────────────
// export const DUMMY_ACADEMIC_YEARS = [
//   { id: 'year-001', name: '2025–2026', start_date: '2025-04-01', end_date: '2026-03-31', is_current: true,  is_active: true,  school_id: 'school-001' },
//   { id: 'year-002', name: '2024–2025', start_date: '2024-04-01', end_date: '2025-03-31', is_current: false, is_active: false, school_id: 'school-001' },
//   { id: 'year-003', name: '2023–2024', start_date: '2023-04-01', end_date: '2024-03-31', is_current: false, is_active: false, school_id: 'school-001' },
// ];

// // ──────────────────────────────────────────────────────────────────────────────
// // 4 ▸ TEACHERS
// // ──────────────────────────────────────────────────────────────────────────────
// export const DUMMY_TEACHERS = [
//   { id: 'teacher-001', first_name: 'Hassan',   last_name: 'Mahmood',  email: 'teacher@tca.edu.pk',   phone: '+92-315-4443322', employee_id: 'EMP-001', qualification: 'M.Sc Mathematics',  designation: 'Senior Teacher',  branch_id: 'branch-001', is_active: true,  school_id: 'school-001', joined_date: '2023-04-01', salary_grade: 'G3', basic_salary: 55000, allowances: 8000, subjects: ['Mathematics', 'Statistics'],   cnic: '35202-1234567-1', address: 'House 3, Gulberg, Lahore' },
//   { id: 'teacher-002', first_name: 'Sana',     last_name: 'Tariq',    email: 'sana@tca.edu.pk',      phone: '+92-322-8887766', employee_id: 'EMP-002', qualification: 'B.Ed English',       designation: 'Teacher',         branch_id: 'branch-001', is_active: true,  school_id: 'school-001', joined_date: '2023-06-01', salary_grade: 'G2', basic_salary: 40000, allowances: 5000, subjects: ['English', 'Literature'],      cnic: '35202-2345678-2', address: 'Flat 4, Garden Town, Lahore' },
//   { id: 'teacher-003', first_name: 'Adnan',    last_name: 'Iqbal',    email: 'adnan@tca.edu.pk',     phone: '+92-345-6665544', employee_id: 'EMP-003', qualification: 'M.A Urdu',           designation: 'Teacher',         branch_id: 'branch-001', is_active: true,  school_id: 'school-001', joined_date: '2023-06-15', salary_grade: 'G2', basic_salary: 38000, allowances: 5000, subjects: ['Urdu', 'Islamiat'],           cnic: '35202-3456789-3', address: 'House 11, Model Town, Lahore' },
//   { id: 'teacher-004', first_name: 'Rabia',    last_name: 'Nawaz',    email: 'rabia@tca.edu.pk',     phone: '+92-311-2223344', employee_id: 'EMP-004', qualification: 'B.Sc Computer Sci',  designation: 'Teacher',         branch_id: 'branch-002', is_active: true,  school_id: 'school-001', joined_date: '2024-01-15', salary_grade: 'G2', basic_salary: 42000, allowances: 5000, subjects: ['Computer Science', 'General Science'], cnic: '35202-4567890-4', address: 'Plot 8, DHA Phase 4, Lahore' },
//   { id: 'teacher-005', first_name: 'Bilal',    last_name: 'Chaudhry', email: 'bilal@tca.edu.pk',     phone: '+92-302-9990011', employee_id: 'EMP-005', qualification: 'M.Sc Physics',       designation: 'Senior Teacher',  branch_id: 'branch-002', is_active: false, school_id: 'school-001', joined_date: '2023-08-01', salary_grade: 'G3', basic_salary: 52000, allowances: 7000, subjects: ['Physics'],                    cnic: '35202-5678901-5', address: 'House 20, Iqbal Town, Lahore' },
//   { id: 'teacher-006', first_name: 'Nadia',    last_name: 'Rehman',   email: 'nadia@tca.edu.pk',     phone: '+92-333-1112233', employee_id: 'EMP-006', qualification: 'M.Ed Biology',       designation: 'Teacher',         branch_id: 'branch-001', is_active: true,  school_id: 'school-001', joined_date: '2023-04-01', salary_grade: 'G2', basic_salary: 40000, allowances: 5000, subjects: ['Biology', 'General Science'],  cnic: '35202-6789012-6', address: 'House 7, Cavalry Ground, Lahore' },
//   { id: 'teacher-007', first_name: 'Kamran',   last_name: 'Shah',     email: 'kamran@tca.edu.pk',    phone: '+92-321-4445566', employee_id: 'EMP-007', qualification: 'B.Sc Chemistry',     designation: 'Teacher',         branch_id: 'branch-001', is_active: true,  school_id: 'school-001', joined_date: '2023-09-01', salary_grade: 'G2', basic_salary: 38000, allowances: 5000, subjects: ['Chemistry'],                   cnic: '35202-7890123-7', address: 'House 14, Johar Town, Lahore' },
//   { id: 'teacher-008', first_name: 'Zobia',    last_name: 'Aslam',    email: 'zobia@tca.edu.pk',     phone: '+92-300-7778899', employee_id: 'EMP-008', qualification: 'M.A History',        designation: 'Teacher',         branch_id: 'branch-002', is_active: true,  school_id: 'school-001', joined_date: '2024-01-20', salary_grade: 'G2', basic_salary: 39000, allowances: 5000, subjects: ['History', 'Social Studies'],   cnic: '35202-8901234-8', address: 'House 3, Bahria Town, Lahore' },
//   { id: 'teacher-009', first_name: 'Imran',    last_name: 'Baig',     email: 'imran@tca.edu.pk',     phone: '+92-313-6667788', employee_id: 'EMP-009', qualification: 'M.Sc Statistics',    designation: 'Senior Teacher',  branch_id: 'branch-002', is_active: true,  school_id: 'school-001', joined_date: '2023-04-01', salary_grade: 'G3', basic_salary: 53000, allowances: 8000, subjects: ['Mathematics', 'Statistics'],   cnic: '35202-9012345-9', address: 'House 6, Lake City, Lahore' },
//   { id: 'teacher-010', first_name: 'Amna',     last_name: 'Farooq',   email: 'amna.t@tca.edu.pk',    phone: '+92-345-3334455', employee_id: 'EMP-010', qualification: 'B.Ed Islamiat',      designation: 'Teacher',         branch_id: 'branch-001', is_active: false, school_id: 'school-001', joined_date: '2023-11-01', salary_grade: 'G1', basic_salary: 32000, allowances: 4000, subjects: ['Islamiat', 'Pakistan Studies'], cnic: '35202-0123456-0', address: 'House 21, Valencia, Lahore' },
//   { id: 'teacher-011', first_name: 'Tariq',    last_name: 'Aziz',     email: 'taziz@tca.edu.pk',     phone: '+92-302-2223344', employee_id: 'EMP-011', qualification: 'M.Phil Economics',   designation: 'HOD',             branch_id: 'branch-001', is_active: true,  school_id: 'school-001', joined_date: '2023-04-01', salary_grade: 'G4', basic_salary: 65000, allowances: 12000, subjects: ['Economics', 'Commerce'],      cnic: '35202-1122334-1', address: 'House 9, Cantt, Lahore' },
//   { id: 'teacher-012', first_name: 'Farah',    last_name: 'Qureshi',  email: 'farah@tca.edu.pk',     phone: '+92-311-5556677', employee_id: 'EMP-012', qualification: 'B.Ed Arts',          designation: 'Teacher',         branch_id: 'branch-002', is_active: true,  school_id: 'school-001', joined_date: '2024-03-01', salary_grade: 'G2', basic_salary: 37000, allowances: 5000, subjects: ['Art & Drawing', 'Craft'],     cnic: '35202-2233445-2', address: 'House 16, Gulshan Ravi, Lahore' },
// ];

// // ──────────────────────────────────────────────────────────────────────────────
// // 5 ▸ CLASSES
// // ──────────────────────────────────────────────────────────────────────────────
// export const DUMMY_CLASSES = [
//   { id: 'class-001', name: 'Class 1',  grade_level: 1, classTeacher: DUMMY_TEACHERS[0], sections: [{ id: 's-001', name: 'A' }, { id: 's-002', name: 'B' }], student_count: 58, branch_id: 'branch-001', is_active: true, school_id: 'school-001' },
//   { id: 'class-002', name: 'Class 2',  grade_level: 2, classTeacher: DUMMY_TEACHERS[1], sections: [{ id: 's-003', name: 'A' }, { id: 's-004', name: 'B' }], student_count: 52, branch_id: 'branch-001', is_active: true, school_id: 'school-001' },
//   { id: 'class-003', name: 'Class 3',  grade_level: 3, classTeacher: DUMMY_TEACHERS[2], sections: [{ id: 's-005', name: 'A' }],                               student_count: 45, branch_id: 'branch-001', is_active: true, school_id: 'school-001' },
//   { id: 'class-004', name: 'Class 4',  grade_level: 4, classTeacher: DUMMY_TEACHERS[3], sections: [{ id: 's-006', name: 'A' }, { id: 's-007', name: 'B' }], student_count: 60, branch_id: 'branch-002', is_active: true, school_id: 'school-001' },
//   { id: 'class-005', name: 'Class 5',  grade_level: 5, classTeacher: DUMMY_TEACHERS[4], sections: [{ id: 's-008', name: 'A' }],                               student_count: 40, branch_id: 'branch-002', is_active: true, school_id: 'school-001' },
//   { id: 'class-006', name: 'Class 6',  grade_level: 6, classTeacher: DUMMY_TEACHERS[0], sections: [{ id: 's-009', name: 'A' }, { id: 's-010', name: 'B' }], student_count: 55, branch_id: 'branch-002', is_active: true, school_id: 'school-001' },
// ];

// // ──────────────────────────────────────────────────────────────────────────────
// // 6 ▸ STUDENTS
// // ──────────────────────────────────────────────────────────────────────────────
// export const DUMMY_STUDENTS = [
//   { id: 'stu-001', first_name: 'Ali',       last_name: 'Raza',       roll_number: 'TCA-001', email: 'ali@student.tca',    phone: '+92-300-1110001', gender: 'male',   date_of_birth: '2014-03-15', class_id: 'class-001', class: DUMMY_CLASSES[0], section_id: 's-001', academic_year_id: 'year-001', branch_id: 'branch-001', is_active: true, admission_date: '2023-04-05', student_id: 'STU-2023-001', guardian_name: 'Raza Ahmed',    guardian_phone: '+92-300-2220001', guardian_relation: 'father', blood_group: 'B+',  address: 'House 5, Street 3, Gulberg, Lahore' },
//   { id: 'stu-002', first_name: 'Fatima',    last_name: 'Malik',      roll_number: 'TCA-002', email: 'fatima@student.tca', phone: '+92-300-1110002', gender: 'female', date_of_birth: '2014-07-22', class_id: 'class-001', class: DUMMY_CLASSES[0], section_id: 's-002', academic_year_id: 'year-001', branch_id: 'branch-001', is_active: true, admission_date: '2023-04-05', student_id: 'STU-2023-002', guardian_name: 'Tariq Malik',   guardian_phone: '+92-300-2220002', guardian_relation: 'father', blood_group: 'A+',  address: 'Flat 12, Garden Town, Lahore' },
//   { id: 'stu-003', first_name: 'Zaid',      last_name: 'Khan',       roll_number: 'TCA-003', email: 'zaid@student.tca',   phone: '+92-300-1110003', gender: 'male',   date_of_birth: '2013-11-05', class_id: 'class-002', class: DUMMY_CLASSES[1], section_id: 's-003', academic_year_id: 'year-001', branch_id: 'branch-001', is_active: true, admission_date: '2023-04-10', student_id: 'STU-2023-003', guardian_name: 'Shahid Khan',   guardian_phone: '+92-300-2220003', guardian_relation: 'father', blood_group: 'O+',  address: 'House 8, Model Town, Lahore' },
//   { id: 'stu-004', first_name: 'Mariam',    last_name: 'Hussain',    roll_number: 'TCA-004', email: null,                 phone: '+92-300-1110004', gender: 'female', date_of_birth: '2013-02-18', class_id: 'class-002', class: DUMMY_CLASSES[1], section_id: 's-004', academic_year_id: 'year-001', branch_id: 'branch-001', is_active: true, admission_date: '2023-05-01', student_id: 'STU-2023-004', guardian_name: 'Nadia Hussain',  guardian_phone: '+92-300-2220004', guardian_relation: 'mother', blood_group: 'AB+', address: 'House 22, Iqbal Town, Lahore' },
//   { id: 'stu-005', first_name: 'Omar',      last_name: 'Farooq',     roll_number: 'TCA-005', email: null,                 phone: '+92-300-1110005', gender: 'male',   date_of_birth: '2012-09-30', class_id: 'class-003', class: DUMMY_CLASSES[2], section_id: 's-005', academic_year_id: 'year-001', branch_id: 'branch-001', is_active: true, admission_date: '2023-04-05', student_id: 'STU-2023-005', guardian_name: 'Farooq Ahmad',  guardian_phone: '+92-300-2220005', guardian_relation: 'father', blood_group: 'A-',  address: 'House 1, Cavalry Ground, Lahore' },
//   { id: 'stu-006', first_name: 'Hina',      last_name: 'Butt',       roll_number: 'TCA-006', email: null,                 phone: '+92-300-1110006', gender: 'female', date_of_birth: '2012-06-12', class_id: 'class-003', class: DUMMY_CLASSES[2], section_id: 's-005', academic_year_id: 'year-001', branch_id: 'branch-001', is_active: true, admission_date: '2023-04-05', student_id: 'STU-2023-006', guardian_name: 'Asad Butt',     guardian_phone: '+92-300-2220006', guardian_relation: 'father', blood_group: 'O-',  address: 'House 9, Johar Town, Lahore' },
//   { id: 'stu-007', first_name: 'Usman',     last_name: 'Sheikh',     roll_number: 'TCA-007', email: null,                 phone: '+92-300-1110007', gender: 'male',   date_of_birth: '2011-04-08', class_id: 'class-004', class: DUMMY_CLASSES[3], section_id: 's-006', academic_year_id: 'year-001', branch_id: 'branch-002', is_active: true, admission_date: '2024-01-20', student_id: 'STU-2024-007', guardian_name: 'Imran Sheikh',  guardian_phone: '+92-300-2220007', guardian_relation: 'father', blood_group: 'B-',  address: 'Plot 4, DHA Phase 5, Lahore' },
//   { id: 'stu-008', first_name: 'Noor',      last_name: 'Ahmed',      roll_number: 'TCA-008', email: null,                 phone: '+92-300-1110008', gender: 'female', date_of_birth: '2011-12-25', class_id: 'class-004', class: DUMMY_CLASSES[3], section_id: 's-007', academic_year_id: 'year-001', branch_id: 'branch-002', is_active: true, admission_date: '2024-01-20', student_id: 'STU-2024-008', guardian_name: 'Saima Ahmed',   guardian_phone: '+92-300-2220008', guardian_relation: 'mother', blood_group: 'AB-', address: 'Plot 17, DHA Phase 6, Lahore' },
//   { id: 'stu-009', first_name: 'Ibrahim',   last_name: 'Qureshi',    roll_number: 'TCA-009', email: null,                 phone: '+92-300-1110009', gender: 'male',   date_of_birth: '2010-08-14', class_id: 'class-005', class: DUMMY_CLASSES[4], section_id: 's-008', academic_year_id: 'year-001', branch_id: 'branch-002', is_active: true, admission_date: '2024-01-20', student_id: 'STU-2024-009', guardian_name: 'Zulfiqar Qureshi', guardian_phone: '+92-300-2220009', guardian_relation: 'father', blood_group: 'O+', address: 'House 33, Canal Bank, Lahore' },
//   { id: 'stu-010', first_name: 'Zainab',    last_name: 'Baig',       roll_number: 'TCA-010', email: null,                 phone: '+92-300-1110010', gender: 'female', date_of_birth: '2010-05-01', class_id: 'class-005', class: DUMMY_CLASSES[4], section_id: 's-008', academic_year_id: 'year-001', branch_id: 'branch-002', is_active: false, admission_date: '2024-01-20', student_id: 'STU-2024-010', guardian_name: 'Farid Baig',    guardian_phone: '+92-300-2220010', guardian_relation: 'father', blood_group: 'A+',  address: 'House 7, Valencia Town, Lahore' },
//   { id: 'stu-011', first_name: 'Hamza',     last_name: 'Awan',       roll_number: 'TCA-011', email: null,                 phone: '+92-300-1110011', gender: 'male',   date_of_birth: '2009-01-20', class_id: 'class-006', class: DUMMY_CLASSES[5], section_id: 's-009', academic_year_id: 'year-001', branch_id: 'branch-002', is_active: true, admission_date: '2024-01-20', student_id: 'STU-2024-011', guardian_name: 'Waqas Awan',    guardian_phone: '+92-300-2220011', guardian_relation: 'father', blood_group: 'B+',  address: 'House 11, Bahria Town, Lahore' },
//   { id: 'stu-012', first_name: 'Amna',      last_name: 'Ijaz',       roll_number: 'TCA-012', email: null,                 phone: '+92-300-1110012', gender: 'female', date_of_birth: '2009-10-07', class_id: 'class-006', class: DUMMY_CLASSES[5], section_id: 's-010', academic_year_id: 'year-001', branch_id: 'branch-002', is_active: true, admission_date: '2024-01-20', student_id: 'STU-2024-012', guardian_name: 'Ijaz Ahmed',    guardian_phone: '+92-300-2220012', guardian_relation: 'father', blood_group: 'O-',  address: 'House 5, Lake City, Lahore' },
// ];

// // ──────────────────────────────────────────────────────────────────────────────
// // 7 ▸ EXAMS
// // ──────────────────────────────────────────────────────────────────────────────
// export const DUMMY_EXAMS = [
//   { id: 'exam-001', name: 'Mid Term Exam',   type: 'mid_term',  class_id: 'class-001', class: DUMMY_CLASSES[0], academic_year_id: 'year-001', start_date: '2025-10-15', end_date: '2025-10-22', total_marks: 100, passing_marks: 40, is_published: true  },
//   { id: 'exam-002', name: 'Final Exam',      type: 'final',     class_id: 'class-001', class: DUMMY_CLASSES[0], academic_year_id: 'year-001', start_date: '2026-02-10', end_date: '2026-02-20', total_marks: 150, passing_marks: 60, is_published: false },
//   { id: 'exam-003', name: 'Unit Test 1',     type: 'unit_test', class_id: 'class-002', class: DUMMY_CLASSES[1], academic_year_id: 'year-001', start_date: '2025-09-05', end_date: '2025-09-05', total_marks: 50,  passing_marks: 20, is_published: true  },
//   { id: 'exam-004', name: 'Monthly Test',    type: 'monthly',   class_id: 'class-003', class: DUMMY_CLASSES[2], academic_year_id: 'year-001', start_date: '2025-11-01', end_date: '2025-11-02', total_marks: 50,  passing_marks: 20, is_published: true  },
//   { id: 'exam-005', name: 'Mid Term Exam',   type: 'mid_term',  class_id: 'class-004', class: DUMMY_CLASSES[3], academic_year_id: 'year-001', start_date: '2025-10-16', end_date: '2025-10-23', total_marks: 100, passing_marks: 40, is_published: true  },
//   { id: 'exam-006', name: 'Final Exam',      type: 'final',     class_id: 'class-005', class: DUMMY_CLASSES[4], academic_year_id: 'year-001', start_date: '2026-03-01', end_date: '2026-03-12', total_marks: 200, passing_marks: 80, is_published: false },
// ];

// // ──────────────────────────────────────────────────────────────────────────────
// // 8 ▸ FEES
// // ──────────────────────────────────────────────────────────────────────────────
// export const DUMMY_FEES = [
//   { id: 'fee-001', student_id: 'stu-001', student: DUMMY_STUDENTS[0],  month: 1, year: 2026, amount: 3500, discount: 0,   due_date: '2026-01-10', status: 'paid',    paid_on: '2026-01-08' },
//   { id: 'fee-002', student_id: 'stu-001', student: DUMMY_STUDENTS[0],  month: 2, year: 2026, amount: 3500, discount: 0,   due_date: '2026-02-10', status: 'paid',    paid_on: '2026-02-09' },
//   { id: 'fee-003', student_id: 'stu-002', student: DUMMY_STUDENTS[1],  month: 1, year: 2026, amount: 3500, discount: 350, due_date: '2026-01-10', status: 'paid',    paid_on: '2026-01-07' },
//   { id: 'fee-004', student_id: 'stu-002', student: DUMMY_STUDENTS[1],  month: 2, year: 2026, amount: 3500, discount: 350, due_date: '2026-02-10', status: 'pending', paid_on: null          },
//   { id: 'fee-005', student_id: 'stu-003', student: DUMMY_STUDENTS[2],  month: 1, year: 2026, amount: 3500, discount: 0,   due_date: '2026-01-10', status: 'paid',    paid_on: '2026-01-12' },
//   { id: 'fee-006', student_id: 'stu-003', student: DUMMY_STUDENTS[2],  month: 2, year: 2026, amount: 3500, discount: 0,   due_date: '2026-02-10', status: 'overdue', paid_on: null          },
//   { id: 'fee-007', student_id: 'stu-004', student: DUMMY_STUDENTS[3],  month: 1, year: 2026, amount: 4000, discount: 0,   due_date: '2026-01-10', status: 'partial', paid_on: null          },
//   { id: 'fee-008', student_id: 'stu-005', student: DUMMY_STUDENTS[4],  month: 1, year: 2026, amount: 4000, discount: 400, due_date: '2026-01-10', status: 'pending', paid_on: null          },
//   { id: 'fee-009', student_id: 'stu-006', student: DUMMY_STUDENTS[5],  month: 2, year: 2026, amount: 4000, discount: 0,   due_date: '2026-02-10', status: 'paid',    paid_on: '2026-02-05' },
//   { id: 'fee-010', student_id: 'stu-007', student: DUMMY_STUDENTS[6],  month: 1, year: 2026, amount: 4500, discount: 0,   due_date: '2026-01-10', status: 'overdue', paid_on: null          },
//   { id: 'fee-011', student_id: 'stu-008', student: DUMMY_STUDENTS[7],  month: 2, year: 2026, amount: 4500, discount: 450, due_date: '2026-02-10', status: 'pending', paid_on: null          },
//   { id: 'fee-012', student_id: 'stu-009', student: DUMMY_STUDENTS[8],  month: 1, year: 2026, amount: 4500, discount: 0,   due_date: '2026-01-10', status: 'paid',    paid_on: '2026-01-09' },
// ];

// // ──────────────────────────────────────────────────────────────────────────────
// // 8.1 ▸ SECTIONS  (flat list — used by Sections management page)
// // ──────────────────────────────────────────────────────────────────────────────
// export const DUMMY_SECTIONS = [
//   { id: 's-001', name: 'A', class_id: 'class-001', class: DUMMY_CLASSES[0], class_teacher_id: 'teacher-001', class_teacher: DUMMY_TEACHERS[0], room_number: '101', student_count: 29, branch_id: 'branch-001', school_id: 'school-001', is_active: true },
//   { id: 's-002', name: 'B', class_id: 'class-001', class: DUMMY_CLASSES[0], class_teacher_id: 'teacher-002', class_teacher: DUMMY_TEACHERS[1], room_number: '102', student_count: 29, branch_id: 'branch-001', school_id: 'school-001', is_active: true },
//   { id: 's-003', name: 'A', class_id: 'class-002', class: DUMMY_CLASSES[1], class_teacher_id: 'teacher-002', class_teacher: DUMMY_TEACHERS[1], room_number: '103', student_count: 26, branch_id: 'branch-001', school_id: 'school-001', is_active: true },
//   { id: 's-004', name: 'B', class_id: 'class-002', class: DUMMY_CLASSES[1], class_teacher_id: 'teacher-003', class_teacher: DUMMY_TEACHERS[2], room_number: '104', student_count: 26, branch_id: 'branch-001', school_id: 'school-001', is_active: true },
//   { id: 's-005', name: 'A', class_id: 'class-003', class: DUMMY_CLASSES[2], class_teacher_id: 'teacher-003', class_teacher: DUMMY_TEACHERS[2], room_number: '105', student_count: 45, branch_id: 'branch-001', school_id: 'school-001', is_active: true },
//   { id: 's-006', name: 'A', class_id: 'class-004', class: DUMMY_CLASSES[3], class_teacher_id: 'teacher-004', class_teacher: DUMMY_TEACHERS[3], room_number: '201', student_count: 30, branch_id: 'branch-002', school_id: 'school-001', is_active: true },
//   { id: 's-007', name: 'B', class_id: 'class-004', class: DUMMY_CLASSES[3], class_teacher_id: 'teacher-008', class_teacher: DUMMY_TEACHERS[7], room_number: '202', student_count: 30, branch_id: 'branch-002', school_id: 'school-001', is_active: true },
//   { id: 's-008', name: 'A', class_id: 'class-005', class: DUMMY_CLASSES[4], class_teacher_id: 'teacher-009', class_teacher: DUMMY_TEACHERS[8], room_number: '203', student_count: 40, branch_id: 'branch-002', school_id: 'school-001', is_active: true },
//   { id: 's-009', name: 'A', class_id: 'class-006', class: DUMMY_CLASSES[5], class_teacher_id: 'teacher-011', class_teacher: DUMMY_TEACHERS[10], room_number: '204', student_count: 28, branch_id: 'branch-002', school_id: 'school-001', is_active: true },
//   { id: 's-010', name: 'B', class_id: 'class-006', class: DUMMY_CLASSES[5], class_teacher_id: 'teacher-012', class_teacher: DUMMY_TEACHERS[11], room_number: '205', student_count: 27, branch_id: 'branch-002', school_id: 'school-001', is_active: true },
// ];

// // ──────────────────────────────────────────────────────────────────────────────
// // 8.1b ▸ SUBJECTS
// // ──────────────────────────────────────────────────────────────────────────────
// export const DUMMY_SUBJECTS = [
//   // Class 1
//   { id: 'sub-001', name: 'Mathematics',    code: 'MATH-1',  class_id: 'class-001', class: DUMMY_CLASSES[0], teacher_id: 'teacher-001', teacher: DUMMY_TEACHERS[0],  description: 'Number systems, basic arithmetic and geometry.', syllabus_type: 'text', syllabus_content: 'Chapter 1: Numbers\nChapter 2: Addition & Subtraction\nChapter 3: Multiplication & Division\nChapter 4: Fractions\nChapter 5: Basic Geometry', syllabus_file_url: null, is_active: true, school_id: 'school-001' },
//   { id: 'sub-002', name: 'English',         code: 'ENG-1',   class_id: 'class-001', class: DUMMY_CLASSES[0], teacher_id: 'teacher-002', teacher: DUMMY_TEACHERS[1],  description: 'Reading, writing and grammar fundamentals.', syllabus_type: 'text', syllabus_content: 'Chapter 1: Alphabets & Phonics\nChapter 2: Vocabulary\nChapter 3: Sentence Formation\nChapter 4: Reading Comprehension\nChapter 5: Creative Writing', syllabus_file_url: null, is_active: true, school_id: 'school-001' },
//   { id: 'sub-003', name: 'Urdu',            code: 'URDU-1',  class_id: 'class-001', class: DUMMY_CLASSES[0], teacher_id: 'teacher-003', teacher: DUMMY_TEACHERS[2],  description: 'Urdu language and literature for beginners.', syllabus_type: 'text', syllabus_content: 'باب 1: حروف تہجی\nباب 2: الفاظ\nباب 3: جملے\nباب 4: نظم و نثر', syllabus_file_url: null, is_active: true, school_id: 'school-001' },
//   { id: 'sub-004', name: 'General Science', code: 'SCI-1',   class_id: 'class-001', class: DUMMY_CLASSES[0], teacher_id: 'teacher-006', teacher: DUMMY_TEACHERS[5],  description: 'Introduction to science and the natural world.', syllabus_type: 'text', syllabus_content: 'Chapter 1: Plants\nChapter 2: Animals\nChapter 3: Human Body\nChapter 4: Weather & Climate\nChapter 5: Simple Machines', syllabus_file_url: null, is_active: true, school_id: 'school-001' },
//   { id: 'sub-005', name: 'Islamiat',        code: 'ISL-1',   class_id: 'class-001', class: DUMMY_CLASSES[0], teacher_id: 'teacher-010', teacher: DUMMY_TEACHERS[9],  description: 'Islamic studies — Quran and basic teachings.', syllabus_type: 'text', syllabus_content: 'Chapter 1: Surah Al-Fatiha\nChapter 2: Arkan-e-Islam\nChapter 3: Arkan-e-Iman\nChapter 4: Stories of Prophets', syllabus_file_url: null, is_active: true, school_id: 'school-001' },
//   // Class 2
//   { id: 'sub-006', name: 'Mathematics',    code: 'MATH-2',  class_id: 'class-002', class: DUMMY_CLASSES[1], teacher_id: 'teacher-001', teacher: DUMMY_TEACHERS[0],  description: 'Advanced arithmetic, fractions and decimals.', syllabus_type: 'text', syllabus_content: 'Chapter 1: Fractions\nChapter 2: Decimals\nChapter 3: LCM & HCF\nChapter 4: Basic Algebra\nChapter 5: Word Problems', syllabus_file_url: null, is_active: true, school_id: 'school-001' },
//   { id: 'sub-007', name: 'English',         code: 'ENG-2',   class_id: 'class-002', class: DUMMY_CLASSES[1], teacher_id: 'teacher-002', teacher: DUMMY_TEACHERS[1],  description: 'Grammar, composition and comprehension.', syllabus_type: 'text', syllabus_content: 'Chapter 1: Parts of Speech\nChapter 2: Tenses\nChapter 3: Active & Passive Voice\nChapter 4: Essay Writing', syllabus_file_url: null, is_active: true, school_id: 'school-001' },
//   { id: 'sub-008', name: 'Urdu',            code: 'URDU-2',  class_id: 'class-002', class: DUMMY_CLASSES[1], teacher_id: 'teacher-003', teacher: DUMMY_TEACHERS[2],  description: 'Urdu grammar and prose for class 2.', syllabus_type: 'text', syllabus_content: 'باب 1: اسم\nباب 2: فعل\nباب 3: صفت\nباب 4: انشاء پردازی', syllabus_file_url: null, is_active: true, school_id: 'school-001' },
//   { id: 'sub-009', name: 'General Science', code: 'SCI-2',   class_id: 'class-002', class: DUMMY_CLASSES[1], teacher_id: 'teacher-006', teacher: DUMMY_TEACHERS[5],  description: 'Earth, space and living things.', syllabus_type: 'text', syllabus_content: 'Chapter 1: The Solar System\nChapter 2: Ecosystems\nChapter 3: Matter & Energy\nChapter 4: Forces & Motion', syllabus_file_url: null, is_active: true, school_id: 'school-001' },
//   // Class 6
//   { id: 'sub-010', name: 'Mathematics',    code: 'MATH-6',  class_id: 'class-006', class: DUMMY_CLASSES[5], teacher_id: 'teacher-009', teacher: DUMMY_TEACHERS[8],  description: 'Algebra, geometry and data handling.', syllabus_type: 'text', syllabus_content: 'Chapter 1: Integers\nChapter 2: Algebra\nChapter 3: Geometry\nChapter 4: Data Handling\nChapter 5: Mensuration', syllabus_file_url: null, is_active: true, school_id: 'school-001' },
//   { id: 'sub-011', name: 'Physics',         code: 'PHY-6',   class_id: 'class-006', class: DUMMY_CLASSES[5], teacher_id: 'teacher-005', teacher: DUMMY_TEACHERS[4],  description: 'Mechanics, waves and thermodynamics.', syllabus_type: 'text', syllabus_content: 'Chapter 1: Measurements\nChapter 2: Kinematics\nChapter 3: Dynamics\nChapter 4: Waves\nChapter 5: Thermodynamics', syllabus_file_url: null, is_active: true, school_id: 'school-001' },
//   { id: 'sub-012', name: 'Chemistry',       code: 'CHEM-6',  class_id: 'class-006', class: DUMMY_CLASSES[5], teacher_id: 'teacher-007', teacher: DUMMY_TEACHERS[6],  description: 'Atomic structure, bonding and chemical reactions.', syllabus_type: 'text', syllabus_content: 'Chapter 1: Atomic Structure\nChapter 2: Chemical Bonding\nChapter 3: Stoichiometry\nChapter 4: Thermochemistry', syllabus_file_url: null, is_active: true, school_id: 'school-001' },
//   { id: 'sub-013', name: 'Biology',         code: 'BIO-6',   class_id: 'class-006', class: DUMMY_CLASSES[5], teacher_id: 'teacher-006', teacher: DUMMY_TEACHERS[5],  description: 'Cell biology, genetics and ecology.', syllabus_type: 'text', syllabus_content: 'Chapter 1: Introduction to Biology\nChapter 2: Cell Structure\nChapter 3: Genetics\nChapter 4: Ecology', syllabus_file_url: null, is_active: true, school_id: 'school-001' },
//   { id: 'sub-014', name: 'English',         code: 'ENG-6',   class_id: 'class-006', class: DUMMY_CLASSES[5], teacher_id: 'teacher-002', teacher: DUMMY_TEACHERS[1],  description: 'Advanced grammar, literature and essay writing.', syllabus_type: 'text', syllabus_content: 'Chapter 1: Advanced Grammar\nChapter 2: Comprehension\nChapter 3: Literature Appreciation\nChapter 4: Essay & Report Writing', syllabus_file_url: null, is_active: true, school_id: 'school-001' },
//   { id: 'sub-015', name: 'Computer Science',code: 'CS-6',    class_id: 'class-006', class: DUMMY_CLASSES[5], teacher_id: 'teacher-004', teacher: DUMMY_TEACHERS[3],  description: 'Programming fundamentals and digital literacy.', syllabus_type: 'text', syllabus_content: 'Chapter 1: Introduction to Computing\nChapter 2: Programming Basics\nChapter 3: Database Fundamentals\nChapter 4: Networking', syllabus_file_url: null, is_active: true, school_id: 'school-001' },
// ];

// // ──────────────────────────────────────────────────────────────────────────────
// // 8.2 ▸ PARENTS / GUARDIANS
// // ──────────────────────────────────────────────────────────────────────────────
// export const DUMMY_PARENTS = [
//   { id: 'par-001', first_name: 'Raza',      last_name: 'Ahmed',    phone: '+92-300-2220001', email: 'raza.ahmed@gmail.com',    cnic: '35202-1111111-1', relation: 'father',   occupation: 'Engineer',       children: ['stu-001'], school_id: 'school-001', is_active: true, created_at: '2023-04-05T08:00:00.000Z' },
//   { id: 'par-002', first_name: 'Tariq',     last_name: 'Malik',    phone: '+92-300-2220002', email: 'tariq.malik@gmail.com',   cnic: '35202-2222222-2', relation: 'father',   occupation: 'Businessman',    children: ['stu-002'], school_id: 'school-001', is_active: true, created_at: '2023-04-05T08:00:00.000Z' },
//   { id: 'par-003', first_name: 'Shahid',    last_name: 'Khan',     phone: '+92-300-2220003', email: 'shahid.khan@gmail.com',   cnic: '35202-3333333-3', relation: 'father',   occupation: 'Doctor',         children: ['stu-003'], school_id: 'school-001', is_active: true, created_at: '2023-04-10T08:00:00.000Z' },
//   { id: 'par-004', first_name: 'Nadia',     last_name: 'Hussain',  phone: '+92-300-2220004', email: null,                      cnic: '35202-4444444-4', relation: 'mother',   occupation: 'Teacher',        children: ['stu-004'], school_id: 'school-001', is_active: true, created_at: '2023-05-01T08:00:00.000Z' },
//   { id: 'par-005', first_name: 'Farooq',    last_name: 'Ahmad',    phone: '+92-300-2220005', email: 'farooq.a@outlook.com',    cnic: '35202-5555555-5', relation: 'father',   occupation: 'Accountant',     children: ['stu-005'], school_id: 'school-001', is_active: true, created_at: '2023-04-05T08:00:00.000Z' },
//   { id: 'par-006', first_name: 'Asad',      last_name: 'Butt',     phone: '+92-300-2220006', email: null,                      cnic: '35202-6666666-6', relation: 'father',   occupation: 'Shopkeeper',     children: ['stu-006'], school_id: 'school-001', is_active: true, created_at: '2023-04-05T08:00:00.000Z' },
//   { id: 'par-007', first_name: 'Imran',     last_name: 'Sheikh',   phone: '+92-300-2220007', email: 'imran.sh@gmail.com',      cnic: '35202-7777777-7', relation: 'father',   occupation: 'Contractor',     children: ['stu-007'], school_id: 'school-001', is_active: true, created_at: '2024-01-20T08:00:00.000Z' },
//   { id: 'par-008', first_name: 'Saima',     last_name: 'Ahmed',    phone: '+92-300-2220008', email: 'saima.a@yahoo.com',       cnic: '35202-8888888-8', relation: 'mother',   occupation: 'Housewife',      children: ['stu-008'], school_id: 'school-001', is_active: true, created_at: '2024-01-20T08:00:00.000Z' },
//   { id: 'par-009', first_name: 'Zulfiqar',  last_name: 'Qureshi',  phone: '+92-300-2220009', email: null,                      cnic: '35202-9999999-9', relation: 'father',   occupation: 'Govt Employee',  children: ['stu-009'], school_id: 'school-001', is_active: true, created_at: '2024-01-20T08:00:00.000Z' },
//   { id: 'par-010', first_name: 'Farid',     last_name: 'Baig',     phone: '+92-300-2220010', email: 'farid.baig@gmail.com',    cnic: '35202-1010101-0', relation: 'father',   occupation: 'Trader',         children: ['stu-010'], school_id: 'school-001', is_active: false,created_at: '2024-01-20T08:00:00.000Z' },
//   { id: 'par-011', first_name: 'Waqas',     last_name: 'Awan',     phone: '+92-300-2220011', email: 'waqas.awan@gmail.com',    cnic: '35202-1122112-1', relation: 'father',   occupation: 'IT Professional',children: ['stu-011'], school_id: 'school-001', is_active: true, created_at: '2024-01-20T08:00:00.000Z' },
//   { id: 'par-012', first_name: 'Ijaz',      last_name: 'Ahmed',    phone: '+92-300-2220012', email: null,                      cnic: '35202-1221221-2', relation: 'father',   occupation: 'Banker',         children: ['stu-012'], school_id: 'school-001', is_active: true, created_at: '2024-01-20T08:00:00.000Z' },
// ];

// // ──────────────────────────────────────────────────────────────────────────────
// // 8.3 ▸ ADMISSIONS
// // ──────────────────────────────────────────────────────────────────────────────
// export const DUMMY_ADMISSIONS = [
//   {
//     id: 'adm-001', admission_no: 'ADM-2025-001', first_name: 'Bilal',    last_name: 'Asif',
//     gender: 'male',   date_of_birth: '2014-05-12', class_id: 'class-001', applied_class: DUMMY_CLASSES[0],
//     guardian_name: 'Asif Rahman',   guardian_phone: '+92-300-5550001', guardian_relation: 'father',
//     status: 'approved', applied_date: '2025-03-10', approved_date: '2025-03-15',
//     documents: ['birth_certificate', 'school_leaving'], school_id: 'school-001', academic_year_id: 'year-001',
//     student_id: 'STU-2025-013', notes: 'Transfer from Allied School',
//   },
//   {
//     id: 'adm-002', admission_no: 'ADM-2025-002', first_name: 'Sadia',    last_name: 'Nawaz',
//     gender: 'female', date_of_birth: '2013-09-25', class_id: 'class-002', applied_class: DUMMY_CLASSES[1],
//     guardian_name: 'Nawaz Sharif',   guardian_phone: '+92-300-5550002', guardian_relation: 'father',
//     status: 'pending', applied_date: '2025-03-12', approved_date: null,
//     documents: ['birth_certificate'], school_id: 'school-001', academic_year_id: 'year-001',
//     student_id: null, notes: '',
//   },
//   {
//     id: 'adm-003', admission_no: 'ADM-2025-003', first_name: 'Hamid',    last_name: 'Butt',
//     gender: 'male',   date_of_birth: '2012-11-30', class_id: 'class-003', applied_class: DUMMY_CLASSES[2],
//     guardian_name: 'Ghulam Butt',    guardian_phone: '+92-300-5550003', guardian_relation: 'father',
//     status: 'pending', applied_date: '2025-03-14', approved_date: null,
//     documents: ['birth_certificate', 'school_leaving', 'id_card'], school_id: 'school-001', academic_year_id: 'year-001',
//     student_id: null, notes: 'Sibling already enrolled (stu-006)',
//   },
//   {
//     id: 'adm-004', admission_no: 'ADM-2025-004', first_name: 'Rabia',    last_name: 'Iqbal',
//     gender: 'female', date_of_birth: '2011-07-08', class_id: 'class-004', applied_class: DUMMY_CLASSES[3],
//     guardian_name: 'Iqbal Hussain',  guardian_phone: '+92-300-5550004', guardian_relation: 'father',
//     status: 'rejected', applied_date: '2025-02-20', approved_date: null,
//     documents: ['birth_certificate'], school_id: 'school-001', academic_year_id: 'year-001',
//     student_id: null, notes: 'Rejected — incomplete documents',
//   },
//   {
//     id: 'adm-005', admission_no: 'ADM-2025-005', first_name: 'Farhan',   last_name: 'Zaman',
//     gender: 'male',   date_of_birth: '2014-02-18', class_id: 'class-001', applied_class: DUMMY_CLASSES[0],
//     guardian_name: 'Zaman Ali',      guardian_phone: '+92-300-5550005', guardian_relation: 'father',
//     status: 'approved', applied_date: '2025-03-18', approved_date: '2025-03-20',
//     documents: ['birth_certificate', 'school_leaving', 'id_card'], school_id: 'school-001', academic_year_id: 'year-001',
//     student_id: 'STU-2025-014', notes: '',
//   },
// ];

// // ──────────────────────────────────────────────────────────────────────────────
// // 8.4 ▸ FEE TEMPLATES
// // ──────────────────────────────────────────────────────────────────────────────
// export const DUMMY_FEE_TEMPLATES = [
//   {
//     id: 'ft-001',
//     name: 'Class 1 & 2 — Regular',
//     description: 'Standard fee structure for lower primary',
//     applicable_classes: ['class-001', 'class-002'],
//     components: [
//       { type: 'tuition',     label: 'Tuition Fee',    amount: 3500, is_monthly: true  },
//       { type: 'transport',   label: 'Transport Fee',  amount: 1500, is_monthly: true  },
//       { type: 'library',     label: 'Library Fee',    amount: 200,  is_monthly: false },
//       { type: 'examination', label: 'Exam Fee',       amount: 500,  is_monthly: false },
//     ],
//     total_monthly: 5000,
//     late_fine_per_day: 50,
//     due_day: 10,
//     school_id: 'school-001',
//     is_active: true,
//     created_at: '2023-04-01T08:00:00.000Z',
//   },
//   {
//     id: 'ft-002',
//     name: 'Class 3–5 — Regular',
//     description: 'Standard fee structure for middle primary',
//     applicable_classes: ['class-003', 'class-004', 'class-005'],
//     components: [
//       { type: 'tuition',     label: 'Tuition Fee',    amount: 4000, is_monthly: true  },
//       { type: 'transport',   label: 'Transport Fee',  amount: 1500, is_monthly: true  },
//       { type: 'lab',         label: 'Lab Fee',        amount: 300,  is_monthly: false },
//       { type: 'examination', label: 'Exam Fee',       amount: 700,  is_monthly: false },
//     ],
//     total_monthly: 5500,
//     late_fine_per_day: 50,
//     due_day: 10,
//     school_id: 'school-001',
//     is_active: true,
//     created_at: '2023-04-01T08:00:00.000Z',
//   },
//   {
//     id: 'ft-003',
//     name: 'Class 6 — Senior',
//     description: 'Fee structure for upper primary / senior section',
//     applicable_classes: ['class-006'],
//     components: [
//       { type: 'tuition',     label: 'Tuition Fee',    amount: 4500, is_monthly: true  },
//       { type: 'transport',   label: 'Transport Fee',  amount: 1500, is_monthly: true  },
//       { type: 'lab',         label: 'Lab Fee',        amount: 400,  is_monthly: false },
//       { type: 'sports',      label: 'Sports Fee',     amount: 300,  is_monthly: false },
//       { type: 'examination', label: 'Exam Fee',       amount: 800,  is_monthly: false },
//     ],
//     total_monthly: 6000,
//     late_fine_per_day: 100,
//     due_day: 10,
//     school_id: 'school-001',
//     is_active: true,
//     created_at: '2023-04-01T08:00:00.000Z',
//   },
//   {
//     id: 'ft-004',
//     name: 'Sibling Discount — 10%',
//     description: 'Discount template for families with 2+ children',
//     applicable_classes: [],
//     components: [
//       { type: 'tuition', label: 'Tuition Discount (10%)', amount: -350, is_monthly: true },
//     ],
//     total_monthly: -350,
//     late_fine_per_day: 0,
//     due_day: 10,
//     school_id: 'school-001',
//     is_active: true,
//     created_at: '2023-04-01T08:00:00.000Z',
//   },
// ];

// // ──────────────────────────────────────────────────────────────────────────────
// // 8.5 ▸ TIMETABLE
// // ──────────────────────────────────────────────────────────────────────────────
// export const DUMMY_TIMETABLE = [
//   // Class 1 — Section A
//   { id: 'tt-001', class_id: 'class-001', section_id: 's-001', day: 'monday',    period: 1, subject: 'Mathematics',   teacher_id: 'teacher-001', teacher: DUMMY_TEACHERS[0], room: '101', start_time: '08:00', end_time: '08:40', school_id: 'school-001' },
//   { id: 'tt-002', class_id: 'class-001', section_id: 's-001', day: 'monday',    period: 2, subject: 'English',        teacher_id: 'teacher-002', teacher: DUMMY_TEACHERS[1], room: '101', start_time: '08:40', end_time: '09:20', school_id: 'school-001' },
//   { id: 'tt-003', class_id: 'class-001', section_id: 's-001', day: 'monday',    period: 3, subject: 'Urdu',           teacher_id: 'teacher-003', teacher: DUMMY_TEACHERS[2], room: '101', start_time: '09:20', end_time: '10:00', school_id: 'school-001' },
//   { id: 'tt-004', class_id: 'class-001', section_id: 's-001', day: 'monday',    period: 4, subject: 'General Science',teacher_id: 'teacher-006', teacher: DUMMY_TEACHERS[5], room: '101', start_time: '10:30', end_time: '11:10', school_id: 'school-001' },
//   { id: 'tt-005', class_id: 'class-001', section_id: 's-001', day: 'monday',    period: 5, subject: 'Islamiat',       teacher_id: 'teacher-010', teacher: DUMMY_TEACHERS[9], room: '101', start_time: '11:10', end_time: '11:50', school_id: 'school-001' },
//   { id: 'tt-006', class_id: 'class-001', section_id: 's-001', day: 'tuesday',   period: 1, subject: 'Mathematics',   teacher_id: 'teacher-001', teacher: DUMMY_TEACHERS[0], room: '101', start_time: '08:00', end_time: '08:40', school_id: 'school-001' },
//   { id: 'tt-007', class_id: 'class-001', section_id: 's-001', day: 'tuesday',   period: 2, subject: 'Computer Science',teacher_id: 'teacher-004', teacher: DUMMY_TEACHERS[3], room: '101', start_time: '08:40', end_time: '09:20', school_id: 'school-001' },
//   { id: 'tt-008', class_id: 'class-001', section_id: 's-001', day: 'tuesday',   period: 3, subject: 'English',        teacher_id: 'teacher-002', teacher: DUMMY_TEACHERS[1], room: '101', start_time: '09:20', end_time: '10:00', school_id: 'school-001' },
//   // Class 2 — Section A
//   { id: 'tt-009', class_id: 'class-002', section_id: 's-003', day: 'monday',    period: 1, subject: 'Mathematics',   teacher_id: 'teacher-001', teacher: DUMMY_TEACHERS[0], room: '103', start_time: '08:00', end_time: '08:40', school_id: 'school-001' },
//   { id: 'tt-010', class_id: 'class-002', section_id: 's-003', day: 'monday',    period: 2, subject: 'Urdu',           teacher_id: 'teacher-003', teacher: DUMMY_TEACHERS[2], room: '103', start_time: '08:40', end_time: '09:20', school_id: 'school-001' },
//   { id: 'tt-011', class_id: 'class-002', section_id: 's-003', day: 'monday',    period: 3, subject: 'English',        teacher_id: 'teacher-002', teacher: DUMMY_TEACHERS[1], room: '103', start_time: '09:20', end_time: '10:00', school_id: 'school-001' },
//   { id: 'tt-012', class_id: 'class-002', section_id: 's-003', day: 'wednesday', period: 1, subject: 'General Science',teacher_id: 'teacher-006', teacher: DUMMY_TEACHERS[5], room: '103', start_time: '08:00', end_time: '08:40', school_id: 'school-001' },
//   // Class 6 — Section A
//   { id: 'tt-013', class_id: 'class-006', section_id: 's-009', day: 'monday',    period: 1, subject: 'Mathematics',   teacher_id: 'teacher-009', teacher: DUMMY_TEACHERS[8], room: '204', start_time: '08:00', end_time: '08:40', school_id: 'school-001' },
//   { id: 'tt-014', class_id: 'class-006', section_id: 's-009', day: 'monday',    period: 2, subject: 'Physics',        teacher_id: 'teacher-005', teacher: DUMMY_TEACHERS[4], room: '204', start_time: '08:40', end_time: '09:20', school_id: 'school-001' },
//   { id: 'tt-015', class_id: 'class-006', section_id: 's-009', day: 'monday',    period: 3, subject: 'Chemistry',      teacher_id: 'teacher-007', teacher: DUMMY_TEACHERS[6], room: '204', start_time: '09:20', end_time: '10:00', school_id: 'school-001' },
//   { id: 'tt-016', class_id: 'class-006', section_id: 's-009', day: 'monday',    period: 4, subject: 'English',        teacher_id: 'teacher-002', teacher: DUMMY_TEACHERS[1], room: '204', start_time: '10:30', end_time: '11:10', school_id: 'school-001' },
//   { id: 'tt-017', class_id: 'class-006', section_id: 's-009', day: 'monday',    period: 5, subject: 'Economics',      teacher_id: 'teacher-011', teacher: DUMMY_TEACHERS[10], room: '204', start_time: '11:10', end_time: '11:50', school_id: 'school-001' },
//   { id: 'tt-018', class_id: 'class-006', section_id: 's-009', day: 'tuesday',   period: 1, subject: 'Biology',        teacher_id: 'teacher-006', teacher: DUMMY_TEACHERS[5], room: '204', start_time: '08:00', end_time: '08:40', school_id: 'school-001' },
// ];

// // ──────────────────────────────────────────────────────────────────────────────
// // 8.6 ▸ STAFF ATTENDANCE
// // ──────────────────────────────────────────────────────────────────────────────
// export const DUMMY_STAFF_ATTENDANCE = [
//   { id: 'sa-001', teacher_id: 'teacher-001', teacher: DUMMY_TEACHERS[0], date: '2026-03-01', status: 'present', check_in: '07:52', check_out: '15:05', school_id: 'school-001' },
//   { id: 'sa-002', teacher_id: 'teacher-002', teacher: DUMMY_TEACHERS[1], date: '2026-03-01', status: 'present', check_in: '07:58', check_out: '15:00', school_id: 'school-001' },
//   { id: 'sa-003', teacher_id: 'teacher-003', teacher: DUMMY_TEACHERS[2], date: '2026-03-01', status: 'absent',  check_in: null,    check_out: null,    school_id: 'school-001' },
//   { id: 'sa-004', teacher_id: 'teacher-004', teacher: DUMMY_TEACHERS[3], date: '2026-03-01', status: 'present', check_in: '08:05', check_out: '15:10', school_id: 'school-001' },
//   { id: 'sa-005', teacher_id: 'teacher-005', teacher: DUMMY_TEACHERS[4], date: '2026-03-01', status: 'leave',   check_in: null,    check_out: null,    school_id: 'school-001' },
//   { id: 'sa-006', teacher_id: 'teacher-006', teacher: DUMMY_TEACHERS[5], date: '2026-03-01', status: 'present', check_in: '07:55', check_out: '15:00', school_id: 'school-001' },
//   { id: 'sa-007', teacher_id: 'teacher-007', teacher: DUMMY_TEACHERS[6], date: '2026-03-01', status: 'late',    check_in: '08:35', check_out: '15:00', school_id: 'school-001' },
//   { id: 'sa-008', teacher_id: 'teacher-008', teacher: DUMMY_TEACHERS[7], date: '2026-03-01', status: 'present', check_in: '07:50', check_out: '15:05', school_id: 'school-001' },
//   { id: 'sa-009', teacher_id: 'teacher-009', teacher: DUMMY_TEACHERS[8], date: '2026-03-01', status: 'present', check_in: '07:48', check_out: '15:00', school_id: 'school-001' },
//   { id: 'sa-010', teacher_id: 'teacher-010', teacher: DUMMY_TEACHERS[9], date: '2026-03-01', status: 'absent',  check_in: null,    check_out: null,    school_id: 'school-001' },
//   { id: 'sa-011', teacher_id: 'teacher-011', teacher: DUMMY_TEACHERS[10], date: '2026-03-01', status: 'present', check_in: '07:45', check_out: '15:15', school_id: 'school-001' },
//   { id: 'sa-012', teacher_id: 'teacher-012', teacher: DUMMY_TEACHERS[11], date: '2026-03-01', status: 'present', check_in: '08:00', check_out: '15:00', school_id: 'school-001' },
// ];

// // ──────────────────────────────────────────────────────────────────────────────
// // 9 ▸ HR & PAYROLL
// // ──────────────────────────────────────────────────────────────────────────────
// export const DUMMY_SALARY_GRADES = [
//   { id: 'sg-001', grade: 'G1', title: 'Junior Staff',    basic_min: 25000, basic_max: 35000, house_rent_pct: 20, medical_pct: 10, transport: 2000, school_id: 'school-001' },
//   { id: 'sg-002', grade: 'G2', title: 'Mid-Level Staff', basic_min: 36000, basic_max: 50000, house_rent_pct: 20, medical_pct: 10, transport: 2500, school_id: 'school-001' },
//   { id: 'sg-003', grade: 'G3', title: 'Senior Staff',    basic_min: 51000, basic_max: 65000, house_rent_pct: 25, medical_pct: 10, transport: 3000, school_id: 'school-001' },
//   { id: 'sg-004', grade: 'G4', title: 'Management',      basic_min: 66000, basic_max: 90000, house_rent_pct: 25, medical_pct: 15, transport: 4000, school_id: 'school-001' },
//   { id: 'sg-005', grade: 'G5', title: 'Administration',  basic_min: 91000, basic_max: null,  house_rent_pct: 30, medical_pct: 15, transport: 5000, school_id: 'school-001' },
// ];

// export const DUMMY_PAYSLIPS = [
//   { id: 'pay-001', teacher_id: 'teacher-001', teacher: DUMMY_TEACHERS[0],  month: 2, year: 2026, basic_salary: 55000, house_rent: 11000, medical: 5500, transport: 3000, other_allowances: 2500, gross_salary: 77000, deductions: 3850, net_salary: 73150, status: 'paid',      paid_on: '2026-02-28', school_id: 'school-001' },
//   { id: 'pay-002', teacher_id: 'teacher-002', teacher: DUMMY_TEACHERS[1],  month: 2, year: 2026, basic_salary: 40000, house_rent: 8000,  medical: 4000, transport: 2500, other_allowances: 1500, gross_salary: 56000, deductions: 2800, net_salary: 53200, status: 'paid',      paid_on: '2026-02-28', school_id: 'school-001' },
//   { id: 'pay-003', teacher_id: 'teacher-003', teacher: DUMMY_TEACHERS[2],  month: 2, year: 2026, basic_salary: 38000, house_rent: 7600,  medical: 3800, transport: 2500, other_allowances: 1500, gross_salary: 53400, deductions: 2670, net_salary: 50730, status: 'paid',      paid_on: '2026-02-28', school_id: 'school-001' },
//   { id: 'pay-004', teacher_id: 'teacher-004', teacher: DUMMY_TEACHERS[3],  month: 2, year: 2026, basic_salary: 42000, house_rent: 8400,  medical: 4200, transport: 2500, other_allowances: 1500, gross_salary: 58600, deductions: 2930, net_salary: 55670, status: 'paid',      paid_on: '2026-02-28', school_id: 'school-001' },
//   { id: 'pay-005', teacher_id: 'teacher-005', teacher: DUMMY_TEACHERS[4],  month: 2, year: 2026, basic_salary: 52000, house_rent: 13000, medical: 5200, transport: 3000, other_allowances: 2000, gross_salary: 75200, deductions: 3760, net_salary: 71440, status: 'paid',      paid_on: '2026-02-28', school_id: 'school-001' },
//   { id: 'pay-006', teacher_id: 'teacher-006', teacher: DUMMY_TEACHERS[5],  month: 2, year: 2026, basic_salary: 40000, house_rent: 8000,  medical: 4000, transport: 2500, other_allowances: 1500, gross_salary: 56000, deductions: 2800, net_salary: 53200, status: 'paid',      paid_on: '2026-02-28', school_id: 'school-001' },
//   { id: 'pay-007', teacher_id: 'teacher-007', teacher: DUMMY_TEACHERS[6],  month: 2, year: 2026, basic_salary: 38000, house_rent: 7600,  medical: 3800, transport: 2500, other_allowances: 1500, gross_salary: 53400, deductions: 2670, net_salary: 50730, status: 'paid',      paid_on: '2026-02-28', school_id: 'school-001' },
//   { id: 'pay-008', teacher_id: 'teacher-008', teacher: DUMMY_TEACHERS[7],  month: 2, year: 2026, basic_salary: 39000, house_rent: 7800,  medical: 3900, transport: 2500, other_allowances: 1500, gross_salary: 54700, deductions: 2735, net_salary: 51965, status: 'paid',      paid_on: '2026-02-28', school_id: 'school-001' },
//   { id: 'pay-009', teacher_id: 'teacher-009', teacher: DUMMY_TEACHERS[8],  month: 2, year: 2026, basic_salary: 53000, house_rent: 13250, medical: 5300, transport: 3000, other_allowances: 2750, gross_salary: 77300, deductions: 3865, net_salary: 73435, status: 'paid',      paid_on: '2026-02-28', school_id: 'school-001' },
//   { id: 'pay-010', teacher_id: 'teacher-010', teacher: DUMMY_TEACHERS[9],  month: 2, year: 2026, basic_salary: 32000, house_rent: 6400,  medical: 3200, transport: 2000, other_allowances: 1000, gross_salary: 44600, deductions: 2230, net_salary: 42370, status: 'paid',      paid_on: '2026-02-28', school_id: 'school-001' },
//   { id: 'pay-011', teacher_id: 'teacher-011', teacher: DUMMY_TEACHERS[10], month: 2, year: 2026, basic_salary: 65000, house_rent: 16250, medical: 9750, transport: 4000, other_allowances: 3000, gross_salary: 98000, deductions: 4900, net_salary: 93100, status: 'paid',      paid_on: '2026-02-28', school_id: 'school-001' },
//   { id: 'pay-012', teacher_id: 'teacher-012', teacher: DUMMY_TEACHERS[11], month: 2, year: 2026, basic_salary: 37000, house_rent: 7400,  medical: 3700, transport: 2500, other_allowances: 1500, gross_salary: 52100, deductions: 2605, net_salary: 49495, status: 'paid',      paid_on: '2026-02-28', school_id: 'school-001' },
//   // March (current — generated, not paid yet)
//   { id: 'pay-013', teacher_id: 'teacher-001', teacher: DUMMY_TEACHERS[0],  month: 3, year: 2026, basic_salary: 55000, house_rent: 11000, medical: 5500, transport: 3000, other_allowances: 2500, gross_salary: 77000, deductions: 3850, net_salary: 73150, status: 'generated', paid_on: null,          school_id: 'school-001' },
//   { id: 'pay-014', teacher_id: 'teacher-002', teacher: DUMMY_TEACHERS[1],  month: 3, year: 2026, basic_salary: 40000, house_rent: 8000,  medical: 4000, transport: 2500, other_allowances: 1500, gross_salary: 56000, deductions: 2800, net_salary: 53200, status: 'generated', paid_on: null,          school_id: 'school-001' },
//   { id: 'pay-015', teacher_id: 'teacher-003', teacher: DUMMY_TEACHERS[2],  month: 3, year: 2026, basic_salary: 38000, house_rent: 7600,  medical: 3800, transport: 2500, other_allowances: 1500, gross_salary: 53400, deductions: 2670, net_salary: 50730, status: 'generated', paid_on: null,          school_id: 'school-001' },
// ];

// // ──────────────────────────────────────────────────────────────────────────────
// // 9.1 ▸ LEAVE REQUESTS
// // ──────────────────────────────────────────────────────────────────────────────
// export const DUMMY_LEAVE_REQUESTS = [
//   { id: 'lv-001', teacher_id: 'teacher-003', teacher: DUMMY_TEACHERS[2],  leave_type: 'sick',     from_date: '2026-03-01', to_date: '2026-03-03', days: 3, reason: 'Fever and flu',           status: 'approved', approved_by: 'user-002', school_id: 'school-001', created_at: '2026-02-28T10:00:00.000Z' },
//   { id: 'lv-002', teacher_id: 'teacher-005', teacher: DUMMY_TEACHERS[4],  leave_type: 'casual',   from_date: '2026-03-01', to_date: '2026-03-01', days: 1, reason: 'Personal work',            status: 'approved', approved_by: 'user-002', school_id: 'school-001', created_at: '2026-02-28T12:00:00.000Z' },
//   { id: 'lv-003', teacher_id: 'teacher-010', teacher: DUMMY_TEACHERS[9],  leave_type: 'sick',     from_date: '2026-03-01', to_date: '2026-03-05', days: 5, reason: 'Medical procedure',        status: 'pending',  approved_by: null,       school_id: 'school-001', created_at: '2026-02-29T09:00:00.000Z' },
//   { id: 'lv-004', teacher_id: 'teacher-007', teacher: DUMMY_TEACHERS[6],  leave_type: 'annual',   from_date: '2026-03-10', to_date: '2026-03-14', days: 5, reason: 'Family trip',             status: 'pending',  approved_by: null,       school_id: 'school-001', created_at: '2026-03-01T08:00:00.000Z' },
//   { id: 'lv-005', teacher_id: 'teacher-002', teacher: DUMMY_TEACHERS[1],  leave_type: 'maternity', from_date: '2026-04-01', to_date: '2026-06-30', days: 90, reason: 'Maternity leave',        status: 'approved', approved_by: 'user-002', school_id: 'school-001', created_at: '2026-02-15T09:00:00.000Z' },
//   { id: 'lv-006', teacher_id: 'teacher-009', teacher: DUMMY_TEACHERS[8],  leave_type: 'casual',   from_date: '2026-02-20', to_date: '2026-02-20', days: 1, reason: 'Urgent family matter',    status: 'rejected', approved_by: 'user-002', school_id: 'school-001', created_at: '2026-02-19T14:00:00.000Z' },
// ];

// // ──────────────────────────────────────────────────────────────────────────────
// // 9.2 ▸ COMMUNICATION — NOTICES
// // ──────────────────────────────────────────────────────────────────────────────
// export const DUMMY_NOTICES = [
//   {
//     id: 'ntc-001',
//     title: 'Parent-Teacher Meeting — March 2026',
//     content: 'Dear Parents, Please be informed that a Parent-Teacher Meeting (PTM) will be held on Saturday, March 14, 2026 from 10:00 AM to 1:00 PM. Kindly attend to discuss your child\'s academic progress. Your presence is highly encouraged.',
//     audience: 'parents',
//     priority: 'high',
//     is_published: true,
//     publish_date: '2026-03-03',
//     expiry_date:  '2026-03-14',
//     created_by:   'user-002',
//     school_id:    'school-001',
//     created_at:   '2026-03-03T09:00:00.000Z',
//   },
//   {
//     id: 'ntc-002',
//     title: 'Mid-Term Exam Schedule Released',
//     content: 'The mid-term examination schedule for all classes has been published. Students are advised to collect their admit cards from the office. Examinations will commence from March 25, 2026.',
//     audience: 'students',
//     priority: 'high',
//     is_published: true,
//     publish_date: '2026-03-02',
//     expiry_date:  '2026-03-25',
//     created_by:   'user-002',
//     school_id:    'school-001',
//     created_at:   '2026-03-02T10:00:00.000Z',
//   },
//   {
//     id: 'ntc-003',
//     title: 'Fee Submission Deadline: March 10',
//     content: 'All parents are reminded that the fee submission deadline for March 2026 is March 10, 2026. A late fine of Rs. 50 per day will be charged after the due date. Please submit fees on time to avoid penalty.',
//     audience: 'parents',
//     priority: 'medium',
//     is_published: true,
//     publish_date: '2026-03-01',
//     expiry_date:  '2026-03-15',
//     created_by:   'user-003',
//     school_id:    'school-001',
//     created_at:   '2026-03-01T11:00:00.000Z',
//   },
//   {
//     id: 'ntc-004',
//     title: 'Summer Vacation Announcement',
//     content: 'Summer vacations will begin on May 30, 2026. The school will reopen on August 1, 2026. New academic year admissions will be open from July 1, 2026.',
//     audience: 'all',
//     priority: 'medium',
//     is_published: true,
//     publish_date: '2026-03-01',
//     expiry_date:  '2026-06-01',
//     created_by:   'user-002',
//     school_id:    'school-001',
//     created_at:   '2026-03-01T12:00:00.000Z',
//   },
//   {
//     id: 'ntc-005',
//     title: 'Staff Meeting — March 5, 2026',
//     content: 'All teaching and administrative staff are required to attend a mandatory staff meeting on March 5, 2026 at 3:30 PM in the conference room. Agenda: Curriculum review, exam preparation strategy, and HR guidelines update.',
//     audience: 'teachers',
//     priority: 'urgent',
//     is_published: true,
//     publish_date: '2026-03-03',
//     expiry_date:  '2026-03-05',
//     created_by:   'user-002',
//     school_id:    'school-001',
//     created_at:   '2026-03-03T08:00:00.000Z',
//   },
//   {
//     id: 'ntc-006',
//     title: 'School Annual Sports Day — April 10',
//     content: 'The Annual Sports Day will be held on April 10, 2026. Students are encouraged to participate in various events. Parents are cordially invited. Registration forms are available at the front desk.',
//     audience: 'all',
//     priority: 'low',
//     is_published: false,
//     publish_date: '2026-03-15',
//     expiry_date:  '2026-04-10',
//     created_by:   'user-002',
//     school_id:    'school-001',
//     created_at:   '2026-03-03T14:00:00.000Z',
//   },
// ];

// // ──────────────────────────────────────────────────────────────────────────────
// // 9.3 ▸ IN-APP NOTIFICATIONS
// // ──────────────────────────────────────────────────────────────────────────────
// export const DUMMY_NOTIFICATIONS = [
//   { id: 'nf-001', user_id: 'user-002', type: 'fee',        title: 'Fee Overdue — Zaid Khan',       message: 'Student Zaid Khan\'s February fee is overdue by 21 days.',                  is_read: false, created_at: '2026-03-03T09:15:00.000Z', link: '/fees' },
//   { id: 'nf-002', user_id: 'user-002', type: 'admission',  title: 'New Admission Request',          message: 'Sadia Nawaz has applied for admission in Class 2.',                         is_read: false, created_at: '2026-03-12T11:30:00.000Z', link: '/admissions' },
//   { id: 'nf-003', user_id: 'user-002', type: 'leave',      title: 'Leave Request — Amna Farooq',    message: 'Teacher Amna Farooq has requested 5 days sick leave. Please review.',        is_read: false, created_at: '2026-02-29T09:05:00.000Z', link: '/payroll' },
//   { id: 'nf-004', user_id: 'user-002', type: 'payroll',    title: 'March Payroll Generated',        message: 'Salary slips for March 2026 have been generated for 12 employees.',         is_read: true,  created_at: '2026-03-01T08:00:00.000Z', link: '/payroll' },
//   { id: 'nf-005', user_id: 'user-002', type: 'attendance', title: 'Low Attendance Alert',           message: '3 teachers were absent today. Review staff attendance report.',             is_read: true,  created_at: '2026-03-01T15:30:00.000Z', link: '/staff-attendance' },
//   { id: 'nf-006', user_id: 'user-003', type: 'fee',        title: '5 Students — Overdue Fees',      message: '5 students have unpaid fees overdue by more than 15 days. Send reminders?',   is_read: false, created_at: '2026-03-03T10:00:00.000Z', link: '/fees' },
//   { id: 'nf-007', user_id: 'user-004', type: 'exam',       title: 'Exam Results Pending',           message: 'Unit Test 1 results for Class 2 have not been entered yet.',                is_read: false, created_at: '2026-03-02T12:00:00.000Z', link: '/exams' },
//   { id: 'nf-008', user_id: 'user-002', type: 'system',     title: 'Notice Published',               message: 'PTM notice has been successfully published to all parents.',                is_read: true,  created_at: '2026-03-03T09:01:00.000Z', link: '/notices' },
// ];

// // ──────────────────────────────────────────────────────────────────────────────
// // 10 ▸ REPORTS SUMMARY DATA
// // ──────────────────────────────────────────────────────────────────────────────
// export const DUMMY_REPORTS = {
//   student: {
//     total: 12, active: 11, inactive: 1,
//     by_class: DUMMY_CLASSES.map((c) => ({ class: c.name, count: c.student_count, boys: Math.floor(c.student_count * 0.52), girls: Math.ceil(c.student_count * 0.48) })),
//     by_gender: { male: 7, female: 5 },
//     new_admissions_this_month: 2,
//   },
//   attendance: {
//     avg_present_pct: 89.4,
//     avg_absent_pct:  7.8,
//     avg_late_pct:    2.8,
//     by_month: [
//       { month: 'Oct', present: 85, absent: 10, late: 5 },
//       { month: 'Nov', present: 87, absent: 9,  late: 4 },
//       { month: 'Dec', present: 78, absent: 16, late: 6 },
//       { month: 'Jan', present: 90, absent: 7,  late: 3 },
//       { month: 'Feb', present: 93, absent: 5,  late: 2 },
//     ],
//     staff: { present: 9, absent: 2, late: 1, leave: 1 },
//   },
//   fee: {
//     total_collected:  310000,
//     total_pending:    45000,
//     total_overdue:    19000,
//     collection_rate:  73.2,
//     by_month: [
//       { month: 'Oct', collected: 290000, pending: 15000 },
//       { month: 'Nov', collected: 275000, pending: 22000 },
//       { month: 'Dec', collected: 230000, pending: 45000 },
//       { month: 'Jan', collected: 285000, pending: 12000 },
//       { month: 'Feb', collected: 310000, pending: 8000  },
//     ],
//   },
//   salary: {
//     total_payroll_feb_2026: 797640,
//     paid_count: 12,
//     pending_count: 0,
//     by_grade: [
//       { grade: 'G1', count: 1, total: 42370  },
//       { grade: 'G2', count: 7, total: 414995 },
//       { grade: 'G3', count: 3, total: 218025 },
//       { grade: 'G4', count: 1, total: 93100  },
//     ],
//   },
// };


// export const DUMMY_MA_SCHOOLS = [
//   {
//     id: 'school-001', name: 'The Clouds Academy',           code: 'TCA-LHR',  institute_type: 'academy',  address: 'Gulberg III, Lahore',        has_branches: true,  is_active: true,  created_at: '2023-04-01T00:00:00.000Z',
//     subscription: { plan: 'premium',  status: 'active', expires_at: '2026-12-31' },
//     specialization: 'General Education',
//   },
//   {
//     id: 'school-002', name: 'Beaconhouse School System',     code: 'BSS-KHI',  institute_type: 'school',   address: 'DHA Phase 5, Karachi',       has_branches: true,  is_active: true,  created_at: '2023-07-15T00:00:00.000Z',
//     subscription: { plan: 'basic',    status: 'active', expires_at: '2026-07-14' },
//     affiliation_board: 'Federal Board', grade_range: 'Class 1 – 12',
//   },
//   {
//     id: 'school-003', name: 'Roots International Islamabad', code: 'RIS-ISL',  institute_type: 'school',   address: 'F-7/1, Islamabad',           has_branches: true,  is_active: true,  created_at: '2024-01-20T00:00:00.000Z',
//     subscription: { plan: 'standard', status: 'active', expires_at: '2026-01-19' },
//     affiliation_board: 'Cambridge CAIE', grade_range: 'O-Level / A-Level',
//   },
//   {
//     id: 'school-004', name: 'City Grammar School',           code: 'CGS-MUL',  institute_type: 'school',   address: 'Model Town, Multan',         has_branches: false, is_active: false, created_at: '2024-03-10T00:00:00.000Z',
//     subscription: { plan: 'basic',    status: 'expired', expires_at: '2025-03-09' },
//     affiliation_board: 'Punjab Board', grade_range: 'Class 1 – 10',
//   },
//   {
//     id: 'school-005', name: 'Allied School Faisalabad',      code: 'ASF-FSD',  institute_type: 'school',   address: 'Peoples Colony, Faisalabad', has_branches: false, is_active: true,  created_at: '2024-06-01T00:00:00.000Z',
//     subscription: { plan: 'standard', status: 'active', expires_at: '2026-05-31' },
//     affiliation_board: 'Punjab Board', grade_range: 'Class 1 – 12',
//   },
//   {
//     id: 'inst-006',   name: 'Star Coaching Center',          code: 'SCC-LHR',  institute_type: 'coaching', address: 'Garden Town, Lahore',        has_branches: false, is_active: true,  created_at: '2025-01-10T00:00:00.000Z',
//     subscription: { plan: 'basic',    status: 'active', expires_at: '2026-01-09' },
//     subject_focus: 'Mathematics, Physics, Chemistry', target_exams: 'MDCAT, ECAT',
//   },
//   {
//     id: 'inst-007',   name: 'Horizon IT Academy',            code: 'HIA-ISL',  institute_type: 'academy',  address: 'Blue Area, Islamabad',       has_branches: true,  is_active: true,  created_at: '2025-03-20T00:00:00.000Z',
//     subscription: { plan: 'standard', status: 'active', expires_at: '2026-03-19' },
//     specialization: 'Information Technology & Programming',
//   },
//   {
//     id: 'inst-008',   name: 'Punjab College of Commerce',    code: 'PCC-LHR',  institute_type: 'college',  address: 'Johar Town, Lahore',         has_branches: true,  is_active: true,  created_at: '2025-05-01T00:00:00.000Z',
//     subscription: { plan: 'premium',  status: 'active', expires_at: '2027-04-30' },
//     affiliation_board: 'University of Punjab', degree_programs: 'FSc, FA, ICS, I.Com, B.Com',
//   },
// ];

// export const DUMMY_MA_SUBSCRIPTIONS = [
//   { id: 'sub-001', school_id: 'school-001', school: DUMMY_MA_SCHOOLS[0], plan: 'premium',  status: 'active',    start_date: '2024-01-01', expires_at: '2026-12-31', amount: 120000 },
//   { id: 'sub-002', school_id: 'school-002', school: DUMMY_MA_SCHOOLS[1], plan: 'basic',    status: 'active',    start_date: '2025-07-15', expires_at: '2026-07-14', amount: 24000  },
//   { id: 'sub-003', school_id: 'school-003', school: DUMMY_MA_SCHOOLS[2], plan: 'standard', status: 'active',    start_date: '2025-01-20', expires_at: '2026-01-19', amount: 60000  },
//   { id: 'sub-004', school_id: 'school-004', school: DUMMY_MA_SCHOOLS[3], plan: 'basic',    status: 'expired',   start_date: '2024-03-10', expires_at: '2025-03-09', amount: 24000  },
//   { id: 'sub-005', school_id: 'school-005', school: DUMMY_MA_SCHOOLS[4], plan: 'standard', status: 'active',    start_date: '2024-06-01', expires_at: '2026-05-31', amount: 60000  },
//   { id: 'sub-006', school_id: 'school-001', school: DUMMY_MA_SCHOOLS[0], plan: 'standard', status: 'cancelled', start_date: '2023-04-01', expires_at: '2024-03-31', amount: 60000  },
//   { id: 'sub-007', school_id: 'inst-006',   school: DUMMY_MA_SCHOOLS[5], plan: 'basic',    status: 'active',    start_date: '2025-01-10', expires_at: '2026-01-09', amount: 24000  },
//   { id: 'sub-008', school_id: 'inst-007',   school: DUMMY_MA_SCHOOLS[6], plan: 'standard', status: 'active',    start_date: '2025-03-20', expires_at: '2026-03-19', amount: 60000  },
//   { id: 'sub-009', school_id: 'inst-008',   school: DUMMY_MA_SCHOOLS[7], plan: 'premium',  status: 'active',    start_date: '2025-05-01', expires_at: '2027-04-30', amount: 120000 },
// ];

// export const DUMMY_MA_USERS = [
//   { id: 'user-master-001', first_name: 'Zahid',     last_name: 'Ali Khan',  email: 'master@cloudsacademy.com',  role: { name: 'Master Admin'       }, school: null,               is_active: true,  created_at: '2023-01-01T00:00:00.000Z' },
//   { id: 'user-002',        first_name: 'Muhammad',  last_name: 'Usman',     email: 'admin@tca.edu.pk',          role: { name: 'Institute Admin'    }, school: DUMMY_MA_SCHOOLS[0], is_active: true,  created_at: '2023-04-01T00:00:00.000Z' },
//   { id: 'user-003',        first_name: 'Ayesha',    last_name: 'Siddiqui',  email: 'fees@tca.edu.pk',           role: { name: 'Fee Manager'        }, school: DUMMY_MA_SCHOOLS[0], is_active: true,  created_at: '2023-06-15T00:00:00.000Z' },
//   { id: 'user-004',        first_name: 'Hassan',    last_name: 'Mahmood',   email: 'teacher@tca.edu.pk',        role: { name: 'Class Teacher'      }, school: DUMMY_MA_SCHOOLS[0], is_active: true,  created_at: '2023-08-01T00:00:00.000Z' },
//   { id: 'user-005',        first_name: 'Sarah',     last_name: 'Noor',      email: 'reception@tca.edu.pk',      role: { name: 'Receptionist'       }, school: DUMMY_MA_SCHOOLS[0], is_active: true,  created_at: '2024-01-10T00:00:00.000Z' },
//   { id: 'user-006',        first_name: 'Tariq',     last_name: 'Jamil',     email: 'branch@tca.edu.pk',         role: { name: 'Branch Admin'       }, school: DUMMY_MA_SCHOOLS[0], is_active: true,  created_at: '2024-03-05T00:00:00.000Z' },
//   { id: 'user-007',        first_name: 'Imran',     last_name: 'Akhtar',    email: 'principal@bss.edu.pk',      role: { name: 'Institute Admin'    }, school: DUMMY_MA_SCHOOLS[1], is_active: true,  created_at: '2023-07-15T00:00:00.000Z' },
//   { id: 'user-008',        first_name: 'Samina',    last_name: 'Murtaza',   email: 'admin@ris.edu.pk',          role: { name: 'Institute Admin'    }, school: DUMMY_MA_SCHOOLS[2], is_active: false, created_at: '2024-01-20T00:00:00.000Z' },
//   { id: 'user-009',        first_name: 'Khalid',    last_name: 'Mehmood',   email: 'admin@scc.edu.pk',          role: { name: 'Institute Admin'    }, school: DUMMY_MA_SCHOOLS[5], is_active: true,  created_at: '2025-01-10T00:00:00.000Z' },
//   { id: 'user-010',        first_name: 'Zara',      last_name: 'Hashmi',    email: 'admin@hia.edu.pk',          role: { name: 'Institute Admin'    }, school: DUMMY_MA_SCHOOLS[6], is_active: true,  created_at: '2025-03-20T00:00:00.000Z' },
//   { id: 'user-011',        first_name: 'Naveed',    last_name: 'Chaudhry',  email: 'admin@pcc.edu.pk',          role: { name: 'Institute Admin'    }, school: DUMMY_MA_SCHOOLS[7], is_active: true,  created_at: '2025-05-01T00:00:00.000Z' },
// ];

// export const DUMMY_MA_STATS = {
//   total_schools:        DUMMY_MA_SCHOOLS.length,
//   active_schools:       DUMMY_MA_SCHOOLS.filter((s) => s.is_active).length,
//   active_subscriptions: DUMMY_MA_SUBSCRIPTIONS.filter((s) => s.status === 'active').length,
//   total_users:          DUMMY_MA_USERS.length,
//   total_students:       DUMMY_STUDENTS.length,
//   revenue_this_month:   288000,
// };

// // ───────────────────────────────────────────────────────────────────────────────
// // 10 ▸ SUBSCRIPTION TEMPLATES  — Plan definitions managed by Master Admin
// // ───────────────────────────────────────────────────────────────────────────────
// export const DUMMY_MA_SUBSCRIPTION_TEMPLATES = [
//   {
//     id: 'tpl-001',
//     name: 'Basic',
//     price_monthly: 2000,
//     duration_months: 12,
//     max_students: 200,
//     max_teachers: 20,
//     features: ['Students (up to 200)', 'Teachers (up to 20)', 'Attendance Tracking', 'Fee Management'],
//     is_active: true,
//     created_at: '2023-01-01T00:00:00.000Z',
//   },
//   {
//     id: 'tpl-002',
//     name: 'Standard',
//     price_monthly: 5000,
//     duration_months: 12,
//     max_students: 500,
//     max_teachers: 60,
//     features: ['Students (up to 500)', 'Teachers (up to 60)', 'Attendance Tracking', 'Fee Management', 'Exam Management', 'Reports'],
//     is_active: true,
//     created_at: '2023-01-01T00:00:00.000Z',
//   },
//   {
//     id: 'tpl-003',
//     name: 'Premium',
//     price_monthly: 10000,
//     duration_months: 12,
//     max_students: 2000,
//     max_teachers: 200,
//     features: ['Students (up to 2000)', 'Teachers (up to 200)', 'All Modules', 'Multi-Branch Support', 'Advanced Reports', 'Priority Support'],
//     is_active: true,
//     created_at: '2023-01-01T00:00:00.000Z',
//   },
//   {
//     id: 'tpl-004',
//     name: 'Enterprise',
//     price_monthly: 20000,
//     duration_months: 12,
//     max_students: null,
//     max_teachers: null,
//     features: ['Unlimited Students', 'Unlimited Teachers', 'All Modules', 'Unlimited Branches', 'Custom Integrations', 'Dedicated Support', 'SLA Guarantee'],
//     is_active: true,
//     created_at: '2023-01-01T00:00:00.000Z',
//   },
// ];

// // ──────────────────────────────────────────────────────────────────────────────
// // 10 ▸ DASHBOARD STATS  (school portal)
// // ──────────────────────────────────────────────────────────────────────────────
// export const DUMMY_DASHBOARD_STATS = {
//   total_students:        DUMMY_STUDENTS.length,
//   active_students:       DUMMY_STUDENTS.filter((s) => s.is_active).length,
//   total_teachers:        DUMMY_TEACHERS.length,
//   active_teachers:       DUMMY_TEACHERS.filter((t) => t.is_active).length,
//   total_classes:         DUMMY_CLASSES.length,
//   total_sections:        DUMMY_SECTIONS.length,
//   total_parents:         DUMMY_PARENTS.length,
//   pending_admissions:    DUMMY_ADMISSIONS.filter((a) => a.status === 'pending').length,
//   fees_collected:        DUMMY_FEES.filter((f) => f.status === 'paid').reduce((sum, f) => sum + (f.amount - (f.discount ?? 0)), 0),
//   fees_pending:          DUMMY_FEES.filter((f) => ['pending', 'overdue', 'partial'].includes(f.status)).reduce((sum, f) => sum + f.amount, 0),
//   upcoming_exams:        DUMMY_EXAMS.filter((e) => !e.is_published).length,
//   payroll_this_month:    DUMMY_PAYSLIPS.filter((p) => p.month === 2 && p.year === 2026).reduce((sum, p) => sum + p.net_salary, 0),
//   pending_leave_requests:DUMMY_LEAVE_REQUESTS.filter((l) => l.status === 'pending').length,
//   unread_notifications:  DUMMY_NOTIFICATIONS.filter((n) => !n.is_read).length,
// };

// // ──────────────────────────────────────────────────────────────────────────────
// // 10.1 ▸ CHART DATA  (used by dashboard charts)
// // ──────────────────────────────────────────────────────────────────────────────
// export const DUMMY_CHART_DATA = {
//   // Monthly attendance % — last 8 months
//   attendance: [
//     { month: 'Jul', present: 92, absent: 5, late: 3 },
//     { month: 'Aug', present: 88, absent: 8, late: 4 },
//     { month: 'Sep', present: 91, absent: 6, late: 3 },
//     { month: 'Oct', present: 85, absent: 10, late: 5 },
//     { month: 'Nov', present: 87, absent: 9, late: 4 },
//     { month: 'Dec', present: 78, absent: 16, late: 6 },
//     { month: 'Jan', present: 90, absent: 7, late: 3 },
//     { month: 'Feb', present: 93, absent: 5, late: 2 },
//   ],

//   // Monthly fees — amount in PKR (thousands)
//   fees: [
//     { month: 'Jul', collected: 245000, pending: 32000 },
//     { month: 'Aug', collected: 278000, pending: 18000 },
//     { month: 'Sep', collected: 260000, pending: 25000 },
//     { month: 'Oct', collected: 290000, pending: 15000 },
//     { month: 'Nov', collected: 275000, pending: 22000 },
//     { month: 'Dec', collected: 230000, pending: 45000 },
//     { month: 'Jan', collected: 285000, pending: 12000 },
//     { month: 'Feb', collected: 310000, pending: 8000 },
//   ],

//   // Students per class
//   enrollment: [
//     { class: 'Class 1', students: 58, boys: 30, girls: 28 },
//     { class: 'Class 2', students: 52, boys: 26, girls: 26 },
//     { class: 'Class 3', students: 45, boys: 22, girls: 23 },
//     { class: 'Class 4', students: 60, boys: 31, girls: 29 },
//     { class: 'Class 5', students: 40, boys: 20, girls: 20 },
//     { class: 'Class 6', students: 55, boys: 28, girls: 27 },
//   ],

//   // Gender distribution
//   gender: [
//     { name: 'Boys',  value: 157, fill: 'hsl(var(--chart-1))' },
//     { name: 'Girls', value: 153, fill: 'hsl(var(--chart-2))' },
//   ],

//   // Fee status breakdown
//   feeStatus: [
//     { name: 'Paid',    value: 68, fill: 'hsl(var(--chart-1))' },
//     { name: 'Pending', value: 20, fill: 'hsl(var(--chart-3))' },
//     { name: 'Overdue', value: 8,  fill: 'hsl(var(--chart-4))' },
//     { name: 'Partial', value: 4,  fill: 'hsl(var(--chart-2))' },
//   ],

//   // Recent activities
//   recentActivity: [
//     { id: 1, type: 'fee',        message: 'Ali Raza paid Feb 2026 fee — Rs. 3,500',             time: '10 min ago',  icon: 'CreditCard'    },
//     { id: 2, type: 'admission',  message: 'New admission request: Sadia Nawaz (Class 2)',        time: '2 hours ago', icon: 'ClipboardList' },
//     { id: 3, type: 'leave',      message: 'Leave approved for Hassan Mahmood (3 days)',          time: '3 hours ago', icon: 'CalendarCheck' },
//     { id: 4, type: 'notice',     message: 'PTM notice published for all parents',                time: '4 hours ago', icon: 'Bell'          },
//     { id: 5, type: 'payroll',    message: 'March 2026 payroll generated for 12 staff',           time: 'Yesterday',   icon: 'DollarSign'    },
//     { id: 6, type: 'student',    message: 'New student Bilal Asif enrolled in Class 1',          time: 'Yesterday',   icon: 'UserPlus'      },
//     { id: 7, type: 'attendance', message: 'Attendance marked — 89% present today',               time: 'Yesterday',   icon: 'CheckCircle'   },
//     { id: 8, type: 'exam',       message: 'Mid-term exam schedule released for March 25',        time: '2 days ago',  icon: 'BookOpen'      },
//   ],
// };

// // ──────────────────────────────────────────────────────────────────────────────
// // 11 ▸ HELPER — paginate array (for service fallback)
// // ──────────────────────────────────────────────────────────────────────────────
// export function paginate(arr, page = 1, limit = 20) {
//   const total      = arr.length;
//   const totalPages = Math.max(1, Math.ceil(total / limit));
//   const rows       = arr.slice((page - 1) * limit, page * limit);
//   return { data: { rows, total, page, totalPages } };
// }

// // ──────────────────────────────────────────────────────────────────────────────
// // 12 ▸ DUMMY LOGIN — called by login page when API is not reachable
// // ──────────────────────────────────────────────────────────────────────────────
// /**
//  * dummyLogin({ school_code, email, password })
//  * Returns { user, access_token: 'dummy-token' }  or throws Error.
//  */
// export function dummyLogin({ school_code, email, password }) {
//   const user = DUMMY_USERS.find(
//     (u) =>
//       u.school_code.toLowerCase() === school_code.trim().toLowerCase() &&
//       u.email.toLowerCase()       === email.trim().toLowerCase() &&
//       u.password                  === password,
//   );
//   if (!user) throw new Error('Invalid credentials');
//   // Return a shape identical to what the real API returns
//   return {
//     user: {
//       id:          user.id,
//       first_name:  user.first_name,
//       last_name:   user.last_name,
//       email:       user.email,
//       phone:       user.phone,
//       role_code:   user.role_code,
//       school_id:   user.school?.id ?? null,
//       school:      user.school,
//       role:        user.role,
//       permissions: user.permissions,
//     },
//     access_token: `dummy-token-${user.id}`,
//   };
// }





/**
 * ╔══════════════════════════════════════════════════════════════╗
 * ║   The Clouds Academy — Complete Dummy / Seed Data           ║
 * ║   (Multi-Institute Version: School, College, Coaching)      ║
 * ╚══════════════════════════════════════════════════════════════╝
 */

// ──────────────────────────────────────────────────────────────────────────────
// 0 ▸ INSTITUTE TYPES & STRUCTURES
// ──────────────────────────────────────────────────────────────────────────────
export const INSTITUTE_TYPES = [
  // 🏫 SCHOOL - K-12 System
  {
    value: 'school',
    label: 'School',
    icon: '🏫',
    description: 'K-12 / O-Level / A-Level institutions',
    academic_structure: {
      primary_division: 'class',        // Class 1-12
      secondary_division: 'section',    // Sections A, B, C
      grouping: 'class_section',
      has_semesters: false,
      has_batches: false,
      has_departments: false
    },
    extra_fields: [
      { name: 'affiliation_board', label: 'Affiliation Board', placeholder: 'e.g. Punjab Board, Cambridge', required: true },
      { name: 'grade_range', label: 'Grade Range', placeholder: 'e.g. Class 1 – 12', required: true },
      { name: 'education_system', label: 'Education System', type: 'select', options: ['Matric', 'O/A Level', 'Both'], required: true }
    ]
  },

  // 📚 COACHING CENTER - Test Prep / Tutoring
  {
    value: 'coaching',
    label: 'Coaching Center',
    icon: '📚',
    description: 'Subject-specific or entrance-test coaching',
    academic_structure: {
      primary_division: 'course',       // JEE, NEET, MDCAT, etc.
      secondary_division: 'batch',      // Batch A, Weekend Batch
      grouping: 'course_batch',
      has_semesters: false,
      has_sections: false,
      has_departments: false
    },
    extra_fields: [
      { name: 'subject_focus', label: 'Subject / Focus Area', placeholder: 'e.g. Mathematics, Physics, MDCAT', required: true },
      { name: 'target_exams', label: 'Target Exams', placeholder: 'e.g. MDCAT, ECAT, CSS', required: false },
      { name: 'teaching_mode', label: 'Teaching Mode', type: 'select', options: ['Online', 'Offline', 'Hybrid'], required: true }
    ]
  },

  // 🎓 ACADEMY - Skill Development
  {
    value: 'academy',
    label: 'Academy',
    icon: '🎓',
    description: 'Skill-based or specialized training academies',
    academic_structure: {
      primary_division: 'program',      // Web Development, Graphic Design
      secondary_division: 'batch',      // Batch 2026, Evening Batch
      grouping: 'program_batch',
      has_semesters: true,
      has_modules: true,
      has_departments: false
    },
    extra_fields: [
      { name: 'specialization', label: 'Specialization', placeholder: 'e.g. IT, Sports, Arts, Language', required: true },
      { name: 'certification', label: 'Certification Offered', type: 'boolean', required: false }
    ]
  },

  // 🏛️ COLLEGE - Intermediate / Undergraduate
  {
    value: 'college',
    label: 'College',
    icon: '🏛️',
    description: 'Intermediate / Bachelors level colleges',
    academic_structure: {
      primary_division: 'program',      // FSc, FA, B.Com, BS
      secondary_division: 'semester',   // Semester 1-8
      grouping: 'program_semester',
      has_sections: false,
      has_batches: true,
      has_departments: true
    },
    extra_fields: [
      { name: 'affiliation_board', label: 'Affiliation / University', placeholder: 'e.g. University of Punjab, HEC', required: true },
      { name: 'degree_programs', label: 'Degree Programs', placeholder: 'e.g. FSc, FA, B.Com, BS', required: true },
      { name: 'program_duration', label: 'Program Duration', placeholder: 'e.g. 2 years, 4 years', required: true }
    ]
  },

  // 🏗️ UNIVERSITY - Higher Education
  {
    value: 'university',
    label: 'University',
    icon: '🏗️',
    description: 'Degree-awarding higher education institutes',
    academic_structure: {
      primary_division: 'faculty',      // Faculty of Science, Engineering
      secondary_division: 'department', // Department of Computer Science
      tertiary_division: 'program',     // BS CS, MS CS
      final_division: 'semester',       // Semester 1-8
      grouping: 'faculty_department_program_semester',
      has_sections: false
    },
    extra_fields: [
      { name: 'hec_charter', label: 'HEC Charter No.', placeholder: 'e.g. HEC-2005-066', required: true },
      { name: 'faculties', label: 'Faculties / Departments', placeholder: 'e.g. Engineering, Medicine, Law', required: true },
      { name: 'research_programs', label: 'Research Programs', type: 'boolean', required: false }
    ]
  }
];

// ──────────────────────────────────────────────────────────────────────────────
// 1 ▸ INSTITUTES (5 Different Types with Complete Data)
// ──────────────────────────────────────────────────────────────────────────────
export const DUMMY_INSTITUTES = [
  // 🏫 School
  {
    id: 'inst-001',
    name: 'The Clouds Academy School',
    code: 'TCA-SCH',
    institute_type: 'school',
    type_details: INSTITUTE_TYPES[0],
    address: '12-B, Gulberg III, Lahore, Punjab',
    phone: '+92-42-35761234',
    email: 'school@tca.edu.pk',
    website: 'https://tca.edu.pk/school',
    logo_url: null,
    has_branches: true,
    is_active: true,
    created_at: '2023-04-01T08:00:00.000Z',
    // School-specific
    affiliation_board: 'Punjab Board',
    grade_range: 'Class 1 – 12',
    education_system: 'Both',
    principal_name: 'Prof. Ahmed Raza',
    established_year: 2010
  },

  // 📚 Coaching Center
  {
    id: 'inst-002',
    name: 'Star Coaching Center',
    code: 'SCC-LHR',
    institute_type: 'coaching',
    type_details: INSTITUTE_TYPES[1],
    address: '45-D, Garden Town, Lahore',
    phone: '+92-42-35889988',
    email: 'info@starcoaching.pk',
    website: 'https://starcoaching.pk',
    logo_url: null,
    has_branches: true,
    is_active: true,
    created_at: '2024-01-15T08:00:00.000Z',
    // Coaching-specific
    subject_focus: 'Mathematics, Physics, Chemistry, Biology',
    target_exams: 'MDCAT, ECAT, NTS, CSS',
    teaching_mode: 'Hybrid',
    director_name: 'Dr. Khalid Mehmood'
  },

  // 🎓 Academy
  {
    id: 'inst-003',
    name: 'Horizon IT Academy',
    code: 'HIA-ISL',
    institute_type: 'academy',
    type_details: INSTITUTE_TYPES[2],
    address: '3rd Floor, Blue Area, Islamabad',
    phone: '+92-51-2345678',
    email: 'info@horizonit.edu.pk',
    website: 'https://horizonit.edu.pk',
    logo_url: null,
    has_branches: false,
    is_active: true,
    created_at: '2024-03-20T08:00:00.000Z',
    // Academy-specific
    specialization: 'Information Technology & Programming',
    certification: true,
    courses_offered: ['Web Development', 'Mobile App Development', 'Data Science', 'AI/ML'],
    director_name: 'Ms. Zara Hashmi'
  },

  // 🏛️ College
  {
    id: 'inst-004',
    name: 'Punjab College of Commerce',
    code: 'PCC-LHR',
    institute_type: 'college',
    type_details: INSTITUTE_TYPES[3],
    address: 'Main Boulevard, Johar Town, Lahore',
    phone: '+92-42-35291234',
    email: 'info@pcc.edu.pk',
    website: 'https://pcc.edu.pk',
    logo_url: null,
    has_branches: true,
    is_active: true,
    created_at: '2022-08-01T08:00:00.000Z',
    // College-specific
    affiliation_board: 'University of Punjab',
    degree_programs: 'FSc, FA, ICS, I.Com, B.Com, BBA',
    program_duration: '2 years (Intermediate), 4 years (Bachelors)',
    principal_name: 'Prof. Naveed Chaudhry'
  },

  // 🏗️ University
  {
    id: 'inst-005',
    name: 'Capital University of Science & Technology',
    code: 'CUST-ISL',
    institute_type: 'university',
    type_details: INSTITUTE_TYPES[4],
    address: 'Sector I-10/3, Islamabad',
    phone: '+92-51-4435789',
    email: 'info@cust.edu.pk',
    website: 'https://cust.edu.pk',
    logo_url: null,
    has_branches: false,
    is_active: true,
    created_at: '2021-01-10T08:00:00.000Z',
    // University-specific
    hec_charter: 'HEC-2021-045',
    faculties: ['Engineering', 'Computing', 'Management Sciences', 'Arts & Social Sciences'],
    research_programs: true,
    vice_chancellor: 'Prof. Dr. Saeed Ahmed',
    total_departments: 18
  }
];

// ──────────────────────────────────────────────────────────────────────────────
// 2 ▸ ACADEMIC STRUCTURES (Institute-specific)
// ──────────────────────────────────────────────────────────────────────────────

// 🏫 SCHOOL: Classes & Sections
export const DUMMY_SCHOOL_CLASSES = [
  { id: 'scl-class-001', institute_id: 'inst-001', name: 'Class 1', grade_level: 1, class_teacher_id: 'teacher-sch-001', student_capacity: 40, is_active: true },
  { id: 'scl-class-002', institute_id: 'inst-001', name: 'Class 2', grade_level: 2, class_teacher_id: 'teacher-sch-002', student_capacity: 40, is_active: true },
  { id: 'scl-class-003', institute_id: 'inst-001', name: 'Class 3', grade_level: 3, class_teacher_id: 'teacher-sch-003', student_capacity: 45, is_active: true },
  { id: 'scl-class-004', institute_id: 'inst-001', name: 'Class 4', grade_level: 4, class_teacher_id: 'teacher-sch-004', student_capacity: 45, is_active: true },
  { id: 'scl-class-005', institute_id: 'inst-001', name: 'Class 5', grade_level: 5, class_teacher_id: 'teacher-sch-005', student_capacity: 45, is_active: true },
  { id: 'scl-class-006', institute_id: 'inst-001', name: 'Class 6', grade_level: 6, class_teacher_id: 'teacher-sch-006', student_capacity: 50, is_active: true },
  { id: 'scl-class-007', institute_id: 'inst-001', name: 'Class 7', grade_level: 7, class_teacher_id: 'teacher-sch-007', student_capacity: 50, is_active: true },
  { id: 'scl-class-008', institute_id: 'inst-001', name: 'Class 8', grade_level: 8, class_teacher_id: 'teacher-sch-008', student_capacity: 50, is_active: true },
  { id: 'scl-class-009', institute_id: 'inst-001', name: 'Class 9', grade_level: 9, class_teacher_id: 'teacher-sch-009', student_capacity: 55, is_active: true },
  { id: 'scl-class-010', institute_id: 'inst-001', name: 'Class 10', grade_level: 10, class_teacher_id: 'teacher-sch-010', student_capacity: 55, is_active: true },
  { id: 'scl-class-011', institute_id: 'inst-001', name: 'Class 11', grade_level: 11, class_teacher_id: 'teacher-sch-011', student_capacity: 60, is_active: true },
  { id: 'scl-class-012', institute_id: 'inst-001', name: 'Class 12', grade_level: 12, class_teacher_id: 'teacher-sch-012', student_capacity: 60, is_active: true }
];

export const DUMMY_SCHOOL_SECTIONS = [
  // Class 1 Sections
  { id: 'sec-sch-001', institute_id: 'inst-001', class_id: 'scl-class-001', name: 'A', room_number: '101', student_count: 38 },
  { id: 'sec-sch-002', institute_id: 'inst-001', class_id: 'scl-class-001', name: 'B', room_number: '102', student_count: 37 },
  { id: 'sec-sch-003', institute_id: 'inst-001', class_id: 'scl-class-001', name: 'C', room_number: '103', student_count: 36 },
  // Class 2 Sections
  { id: 'sec-sch-004', institute_id: 'inst-001', class_id: 'scl-class-002', name: 'A', room_number: '104', student_count: 39 },
  { id: 'sec-sch-005', institute_id: 'inst-001', class_id: 'scl-class-002', name: 'B', room_number: '105', student_count: 38 },
  // Class 3 Sections
  { id: 'sec-sch-006', institute_id: 'inst-001', class_id: 'scl-class-003', name: 'A', room_number: '106', student_count: 42 },
  { id: 'sec-sch-007', institute_id: 'inst-001', class_id: 'scl-class-003', name: 'B', room_number: '107', student_count: 41 },
  // ... and so on
];

// 📚 COACHING: Courses & Batches
export const DUMMY_COACHING_COURSES = [
  { 
    id: 'crs-coach-001', institute_id: 'inst-002', 
    name: 'MDCAT Preparatory Course', 
    code: 'MDCAT-2026',
    duration_months: 6,
    total_fee: 45000,
    syllabus: 'Physics, Chemistry, Biology, English',
    target_exam: 'MDCAT',
    is_active: true 
  },
  { 
    id: 'crs-coach-002', institute_id: 'inst-002', 
    name: 'ECAT Engineering Entry Test', 
    code: 'ECAT-2026',
    duration_months: 4,
    total_fee: 35000,
    syllabus: 'Mathematics, Physics, Chemistry',
    target_exam: 'ECAT',
    is_active: true 
  },
  { 
    id: 'crs-coach-003', institute_id: 'inst-002', 
    name: 'CSS Competitive Exam Preparation', 
    code: 'CSS-2027',
    duration_months: 12,
    total_fee: 120000,
    syllabus: 'General Knowledge, Pakistan Affairs, Islamic Studies, English',
    target_exam: 'CSS',
    is_active: true 
  },
  { 
    id: 'crs-coach-004', institute_id: 'inst-002', 
    name: 'NTS General Test Prep', 
    code: 'NTS-2026',
    duration_months: 3,
    total_fee: 18000,
    syllabus: 'Verbal, Quantitative, Analytical',
    target_exam: 'NTS',
    is_active: true 
  }
];

export const DUMMY_COACHING_BATCHES = [
  { 
    id: 'batch-coach-001', institute_id: 'inst-002', course_id: 'crs-coach-001',
    name: 'MDCAT Morning Batch', 
    code: 'MDCAT-M-01',
    start_date: '2026-01-15', 
    end_date: '2026-07-15',
    schedule: 'Mon-Wed-Fri, 8:00 AM - 11:00 AM',
    teacher_id: 'teacher-coach-001',
    room: 'Hall A',
    student_capacity: 50,
    current_students: 45,
    fee: 45000
  },
  { 
    id: 'batch-coach-002', institute_id: 'inst-002', course_id: 'crs-coach-001',
    name: 'MDCAT Evening Batch', 
    code: 'MDCAT-E-01',
    start_date: '2026-01-15', 
    end_date: '2026-07-15',
    schedule: 'Tue-Thu-Sat, 5:00 PM - 8:00 PM',
    teacher_id: 'teacher-coach-002',
    room: 'Hall B',
    student_capacity: 50,
    current_students: 42,
    fee: 45000
  },
  { 
    id: 'batch-coach-003', institute_id: 'inst-002', course_id: 'crs-coach-002',
    name: 'ECAT Weekend Batch', 
    code: 'ECAT-W-01',
    start_date: '2026-02-01', 
    end_date: '2026-06-01',
    schedule: 'Sat-Sun, 9:00 AM - 3:00 PM',
    teacher_id: 'teacher-coach-003',
    room: 'Hall C',
    student_capacity: 40,
    current_students: 35,
    fee: 35000
  }
];

// 🎓 ACADEMY: Programs & Batches
export const DUMMY_ACADEMY_PROGRAMS = [
  {
    id: 'prog-aca-001', institute_id: 'inst-003',
    name: 'Full Stack Web Development',
    code: 'FSWD-2026',
    duration_months: 6,
    total_fee: 85000,
    modules: ['HTML/CSS', 'JavaScript', 'React', 'Node.js', 'MongoDB', 'Express'],
    certification: true,
    is_active: true
  },
  {
    id: 'prog-aca-002', institute_id: 'inst-003',
    name: 'Mobile App Development (Flutter)',
    code: 'FLUT-2026',
    duration_months: 4,
    total_fee: 65000,
    modules: ['Dart Basics', 'Flutter Widgets', 'Firebase', 'State Management', 'Publishing'],
    certification: true,
    is_active: true
  },
  {
    id: 'prog-aca-003', institute_id: 'inst-003',
    name: 'Data Science & AI',
    code: 'DSAI-2026',
    duration_months: 8,
    total_fee: 120000,
    modules: ['Python', 'Statistics', 'Machine Learning', 'Deep Learning', 'NLP', 'Computer Vision'],
    certification: true,
    is_active: true
  }
];

export const DUMMY_ACADEMY_BATCHES = [
  {
    id: 'batch-aca-001', institute_id: 'inst-003', program_id: 'prog-aca-001',
    name: 'FSWD Batch 2026-01',
    semester: 1,
    start_date: '2026-01-10',
    end_date: '2026-07-10',
    schedule: 'Mon-Thu, 2:00 PM - 5:00 PM',
    teacher_id: 'teacher-aca-001',
    room: 'Lab 1',
    student_capacity: 25,
    current_students: 22
  },
  {
    id: 'batch-aca-002', institute_id: 'inst-003', program_id: 'prog-aca-001',
    name: 'FSWD Batch 2026-02',
    semester: 1,
    start_date: '2026-03-01',
    end_date: '2026-09-01',
    schedule: 'Tue-Fri, 6:00 PM - 9:00 PM',
    teacher_id: 'teacher-aca-002',
    room: 'Lab 2',
    student_capacity: 25,
    current_students: 18
  }
];

// 🏛️ COLLEGE: Departments, Programs & Semesters
export const DUMMY_COLLEGE_DEPARTMENTS = [
  { id: 'dept-coll-001', institute_id: 'inst-004', name: 'Computer Science', hod_id: 'teacher-coll-001', is_active: true },
  { id: 'dept-coll-002', institute_id: 'inst-004', name: 'Commerce', hod_id: 'teacher-coll-002', is_active: true },
  { id: 'dept-coll-003', institute_id: 'inst-004', name: 'Science', hod_id: 'teacher-coll-003', is_active: true },
  { id: 'dept-coll-004', institute_id: 'inst-004', name: 'Arts', hod_id: 'teacher-coll-004', is_active: true }
];

export const DUMMY_COLLEGE_PROGRAMS = [
  {
    id: 'prog-coll-001', institute_id: 'inst-004', department_id: 'dept-coll-001',
    name: 'BS Computer Science',
    code: 'BSCS',
    duration_years: 4,
    total_semesters: 8,
    degree_type: 'Bachelors',
    is_active: true
  },
  {
    id: 'prog-coll-002', institute_id: 'inst-004', department_id: 'dept-coll-001',
    name: 'BS Information Technology',
    code: 'BSIT',
    duration_years: 4,
    total_semesters: 8,
    degree_type: 'Bachelors',
    is_active: true
  },
  {
    id: 'prog-coll-003', institute_id: 'inst-004', department_id: 'dept-coll-002',
    name: 'B.Com (Hons)',
    code: 'BCOM',
    duration_years: 4,
    total_semesters: 8,
    degree_type: 'Bachelors',
    is_active: true
  },
  {
    id: 'prog-coll-004', institute_id: 'inst-004', department_id: 'dept-coll-003',
    name: 'FSc Pre-Medical',
    code: 'FSC-MED',
    duration_years: 2,
    total_semesters: 4,
    degree_type: 'Intermediate',
    is_active: true
  }
];

export const DUMMY_COLLEGE_SEMESTERS = [
  { id: 'sem-coll-001', institute_id: 'inst-004', program_id: 'prog-coll-001', semester_no: 1, name: 'Semester 1', credit_hours: 18, is_current: true },
  { id: 'sem-coll-002', institute_id: 'inst-004', program_id: 'prog-coll-001', semester_no: 2, name: 'Semester 2', credit_hours: 18, is_current: false },
  { id: 'sem-coll-003', institute_id: 'inst-004', program_id: 'prog-coll-001', semester_no: 3, name: 'Semester 3', credit_hours: 18, is_current: false },
  // ... and so on
];

// 🏗️ UNIVERSITY: Faculties, Departments, Programs
export const DUMMY_UNIVERSITY_FACULTIES = [
  { id: 'fac-uni-001', institute_id: 'inst-005', name: 'Faculty of Computing', dean_id: 'teacher-uni-001' },
  { id: 'fac-uni-002', institute_id: 'inst-005', name: 'Faculty of Engineering', dean_id: 'teacher-uni-002' },
  { id: 'fac-uni-003', institute_id: 'inst-005', name: 'Faculty of Management Sciences', dean_id: 'teacher-uni-003' }
];

export const DUMMY_UNIVERSITY_DEPARTMENTS = [
  { id: 'dept-uni-001', institute_id: 'inst-005', faculty_id: 'fac-uni-001', name: 'Computer Science', hod_id: 'teacher-uni-004' },
  { id: 'dept-uni-002', institute_id: 'inst-005', faculty_id: 'fac-uni-001', name: 'Software Engineering', hod_id: 'teacher-uni-005' },
  { id: 'dept-uni-003', institute_id: 'inst-005', faculty_id: 'fac-uni-001', name: 'Data Science', hod_id: 'teacher-uni-006' },
  { id: 'dept-uni-004', institute_id: 'inst-005', faculty_id: 'fac-uni-002', name: 'Electrical Engineering', hod_id: 'teacher-uni-007' },
  { id: 'dept-uni-005', institute_id: 'inst-005', faculty_id: 'fac-uni-003', name: 'Business Administration', hod_id: 'teacher-uni-008' }
];

// ──────────────────────────────────────────────────────────────────────────────
// 3 ▸ SUBJECTS (Institute-type specific)
// ──────────────────────────────────────────────────────────────────────────────
export const DUMMY_SUBJECTS = [
  // SCHOOL Subjects
  { id: 'sub-sch-001', institute_id: 'inst-001', type: 'school', class_id: 'scl-class-001', name: 'Mathematics', code: 'MATH-01', teacher_id: 'teacher-sch-001', credit_hours: 4, is_core: true },
  { id: 'sub-sch-002', institute_id: 'inst-001', type: 'school', class_id: 'scl-class-001', name: 'English', code: 'ENG-01', teacher_id: 'teacher-sch-002', credit_hours: 4, is_core: true },
  { id: 'sub-sch-003', institute_id: 'inst-001', type: 'school', class_id: 'scl-class-001', name: 'Urdu', code: 'URD-01', teacher_id: 'teacher-sch-003', credit_hours: 3, is_core: true },
  { id: 'sub-sch-004', institute_id: 'inst-001', type: 'school', class_id: 'scl-class-006', name: 'Physics', code: 'PHY-06', teacher_id: 'teacher-sch-006', credit_hours: 4, is_core: true },
  { id: 'sub-sch-005', institute_id: 'inst-001', type: 'school', class_id: 'scl-class-006', name: 'Chemistry', code: 'CHEM-06', teacher_id: 'teacher-sch-007', credit_hours: 4, is_core: true },
  { id: 'sub-sch-006', institute_id: 'inst-001', type: 'school', class_id: 'scl-class-006', name: 'Biology', code: 'BIO-06', teacher_id: 'teacher-sch-008', credit_hours: 4, is_core: true },

  // COACHING Subjects (Course-based)
  { id: 'sub-coach-001', institute_id: 'inst-002', type: 'coaching', course_id: 'crs-coach-001', name: 'Physics (MDCAT)', code: 'PHY-MDCAT', teacher_id: 'teacher-coach-001', total_lectures: 40, is_active: true },
  { id: 'sub-coach-002', institute_id: 'inst-002', type: 'coaching', course_id: 'crs-coach-001', name: 'Chemistry (MDCAT)', code: 'CHEM-MDCAT', teacher_id: 'teacher-coach-002', total_lectures: 40, is_active: true },
  { id: 'sub-coach-003', institute_id: 'inst-002', type: 'coaching', course_id: 'crs-coach-001', name: 'Biology (MDCAT)', code: 'BIO-MDCAT', teacher_id: 'teacher-coach-003', total_lectures: 40, is_active: true },

  // COLLEGE Subjects (Program + Semester based)
  { id: 'sub-coll-001', institute_id: 'inst-004', type: 'college', program_id: 'prog-coll-001', semester_id: 'sem-coll-001', name: 'Programming Fundamentals', code: 'CS-101', teacher_id: 'teacher-coll-001', credit_hours: 3, is_core: true },
  { id: 'sub-coll-002', institute_id: 'inst-004', type: 'college', program_id: 'prog-coll-001', semester_id: 'sem-coll-001', name: 'Calculus', code: 'MATH-101', teacher_id: 'teacher-coll-002', credit_hours: 3, is_core: true },
  { id: 'sub-coll-003', institute_id: 'inst-004', type: 'college', program_id: 'prog-coll-001', semester_id: 'sem-coll-002', name: 'Object Oriented Programming', code: 'CS-201', teacher_id: 'teacher-coll-001', credit_hours: 3, is_core: true },

  // UNIVERSITY Subjects (Department + Program + Semester)
  { id: 'sub-uni-001', institute_id: 'inst-005', type: 'university', department_id: 'dept-uni-001', program_id: 'prog-uni-001', semester: 1, name: 'Introduction to Computing', code: 'CS-100', teacher_id: 'teacher-uni-001', credit_hours: 3 },
  { id: 'sub-uni-002', institute_id: 'inst-005', type: 'university', department_id: 'dept-uni-001', program_id: 'prog-uni-001', semester: 1, name: 'Discrete Structures', code: 'CS-101', teacher_id: 'teacher-uni-002', credit_hours: 3 }
];

// ──────────────────────────────────────────────────────────────────────────────
// 4 ▸ TEACHERS (Institute-wise)
// ──────────────────────────────────────────────────────────────────────────────
export const DUMMY_TEACHERS = [
  // School Teachers
  { id: 'teacher-sch-001', institute_id: 'inst-001', first_name: 'Hassan', last_name: 'Mahmood', email: 'hassan.m@tcaschool.edu', employee_id: 'SCH-001', qualification: 'M.Sc Mathematics', designation: 'Senior Teacher', subjects: ['Mathematics'], joining_date: '2023-04-01' },
  { id: 'teacher-sch-002', institute_id: 'inst-001', first_name: 'Sana', last_name: 'Tariq', email: 'sana.t@tcaschool.edu', employee_id: 'SCH-002', qualification: 'M.A English', designation: 'Teacher', subjects: ['English'], joining_date: '2023-06-01' },
  { id: 'teacher-sch-003', institute_id: 'inst-001', first_name: 'Adnan', last_name: 'Iqbal', email: 'adnan.i@tcaschool.edu', employee_id: 'SCH-003', qualification: 'M.A Urdu', designation: 'Teacher', subjects: ['Urdu'], joining_date: '2023-06-15' },

  // Coaching Teachers
  { id: 'teacher-coach-001', institute_id: 'inst-002', first_name: 'Dr. Khalid', last_name: 'Mehmood', email: 'dr.khalid@starcoaching.pk', employee_id: 'COACH-001', qualification: 'Ph.D Physics', designation: 'Senior Faculty', subjects: ['Physics'], joining_date: '2024-01-15' },
  { id: 'teacher-coach-002', institute_id: 'inst-002', first_name: 'Prof. Naila', last_name: 'Rashid', email: 'naila.r@starcoaching.pk', employee_id: 'COACH-002', qualification: 'M.Phil Chemistry', designation: 'Faculty', subjects: ['Chemistry'], joining_date: '2024-01-15' },
  { id: 'teacher-coach-003', institute_id: 'inst-002', first_name: 'Dr. Sana', last_name: 'Malik', email: 'sana.m@starcoaching.pk', employee_id: 'COACH-003', qualification: 'Ph.D Biology', designation: 'Senior Faculty', subjects: ['Biology'], joining_date: '2024-02-01' },

  // Academy Teachers
  { id: 'teacher-aca-001', institute_id: 'inst-003', first_name: 'Ali', last_name: 'Raza', email: 'ali.raza@horizonit.edu', employee_id: 'ACA-001', qualification: 'MS Computer Science', designation: 'Senior Instructor', expertise: ['Web Development', 'React'], joining_date: '2024-03-20' },
  { id: 'teacher-aca-002', institute_id: 'inst-003', first_name: 'Fatima', last_name: 'Ahmed', email: 'fatima.a@horizonit.edu', employee_id: 'ACA-002', qualification: 'MS Data Science', designation: 'Instructor', expertise: ['Python', 'Machine Learning'], joining_date: '2024-04-01' },

  // College Teachers
  { id: 'teacher-coll-001', institute_id: 'inst-004', first_name: 'Prof. Imran', last_name: 'Khan', email: 'imran.k@pcc.edu.pk', employee_id: 'COL-001', qualification: 'PhD Computer Science', designation: 'Professor', department: 'Computer Science', joining_date: '2022-08-01' },
  { id: 'teacher-coll-002', institute_id: 'inst-004', first_name: 'Dr. Samina', last_name: 'Tariq', email: 'samina.t@pcc.edu.pk', employee_id: 'COL-002', qualification: 'PhD Commerce', designation: 'Professor', department: 'Commerce', joining_date: '2022-08-15' },

  // University Teachers
  { id: 'teacher-uni-001', institute_id: 'inst-005', first_name: 'Prof. Dr. Ahmed', last_name: 'Saeed', email: 'ahmed.saeed@cust.edu.pk', employee_id: 'UNI-001', qualification: 'PhD Computer Science', designation: 'Professor', department: 'Computer Science', joining_date: '2021-01-10' },
  { id: 'teacher-uni-002', institute_id: 'inst-005', first_name: 'Dr. Nadia', last_name: 'Anwar', email: 'nadia.anwar@cust.edu.pk', employee_id: 'UNI-002', qualification: 'PhD Electrical Engineering', designation: 'Associate Professor', department: 'Electrical Engineering', joining_date: '2021-02-01' }
];

// ──────────────────────────────────────────────────────────────────────────────
// 5 ▸ STUDENTS (Institute-wise)
// ──────────────────────────────────────────────────────────────────────────────
export const DUMMY_STUDENTS = [
  // School Students
  { 
    id: 'stu-sch-001', institute_id: 'inst-001', type: 'school',
    first_name: 'Ali', last_name: 'Raza', 
    roll_number: 'SCH-2026-001', 
    class_id: 'scl-class-001', section_id: 'sec-sch-001',
    email: 'ali.r@student.tca', phone: '+92-300-1110001',
    guardian_name: 'Raza Ahmed', guardian_phone: '+92-300-2220001',
    admission_date: '2023-04-05', is_active: true
  },
  { 
    id: 'stu-sch-002', institute_id: 'inst-001', type: 'school',
    first_name: 'Fatima', last_name: 'Malik', 
    roll_number: 'SCH-2026-002', 
    class_id: 'scl-class-001', section_id: 'sec-sch-002',
    email: 'fatima.m@student.tca', phone: '+92-300-1110002',
    guardian_name: 'Tariq Malik', guardian_phone: '+92-300-2220002',
    admission_date: '2023-04-05', is_active: true
  },

  // Coaching Students
  { 
    id: 'stu-coach-001', institute_id: 'inst-002', type: 'coaching',
    first_name: 'Bilal', last_name: 'Ahmed', 
    enrollment_no: 'COACH-2026-001', 
    course_id: 'crs-coach-001', batch_id: 'batch-coach-001',
    email: 'bilal.a@student.star', phone: '+92-300-1110010',
    guardian_name: 'Ahmed Khan', guardian_phone: '+92-300-2220010',
    enrollment_date: '2026-01-10', is_active: true
  },
  { 
    id: 'stu-coach-002', institute_id: 'inst-002', type: 'coaching',
    first_name: 'Sadia', last_name: 'Nawaz', 
    enrollment_no: 'COACH-2026-002', 
    course_id: 'crs-coach-001', batch_id: 'batch-coach-002',
    email: 'sadia.n@student.star', phone: '+92-300-1110011',
    guardian_name: 'Nawaz Sharif', guardian_phone: '+92-300-2220011',
    enrollment_date: '2026-01-15', is_active: true
  },

  // Academy Students
  { 
    id: 'stu-aca-001', institute_id: 'inst-003', type: 'academy',
    first_name: 'Hamza', last_name: 'Ali', 
    registration_no: 'ACA-2026-001', 
    program_id: 'prog-aca-001', batch_id: 'batch-aca-001',
    email: 'hamza.a@student.horizon', phone: '+92-300-1110020',
    guardian_name: 'Ali Raza', guardian_phone: '+92-300-2220020',
    enrollment_date: '2026-01-05', is_active: true
  },

  // College Students
  { 
    id: 'stu-coll-001', institute_id: 'inst-004', type: 'college',
    first_name: 'Zain', last_name: 'Ahmad', 
    reg_no: 'COL-2026-001', 
    program_id: 'prog-coll-001', semester_id: 'sem-coll-001',
    email: 'zain.a@student.pcc', phone: '+92-300-1110030',
    guardian_name: 'Ahmad Raza', guardian_phone: '+92-300-2220030',
    admission_date: '2025-09-01', is_active: true
  },

  // University Students
  { 
    id: 'stu-uni-001', institute_id: 'inst-005', type: 'university',
    first_name: 'Mariam', last_name: 'Iqbal', 
    roll_no: 'UNI-2026-001', 
    faculty_id: 'fac-uni-001', department_id: 'dept-uni-001', 
    program: 'BS Computer Science', semester: 3,
    email: 'mariam.i@student.cust', phone: '+92-300-1110040',
    guardian_name: 'Iqbal Hussain', guardian_phone: '+92-300-2220040',
    admission_date: '2024-09-01', is_active: true
  }
];

// ──────────────────────────────────────────────────────────────────────────────
// 6 ▸ ATTENDANCE TYPES (Institute-specific)
// ──────────────────────────────────────────────────────────────────────────────
export const ATTENDANCE_TYPES = {
  school: {
    student: 'subject_wise',      // Subject-wise daily attendance
    teacher: 'check_in_out + period_wise'
  },
  coaching: {
    student: 'batch_wise',        // Batch-wise daily attendance
    teacher: 'session_wise'       // Per session attendance
  },
  academy: {
    student: 'batch_wise',        // Batch-wise with module tracking
    teacher: 'session_wise'
  },
  college: {
    student: 'lecture_wise',      // Per lecture attendance
    teacher: 'check_in_out + lecture_wise'
  },
  university: {
    student: 'semester_wise',     // Cumulative with percentage
    teacher: 'check_in_out + lecture_wise'
  }
};

// ──────────────────────────────────────────────────────────────────────────────
// 7 ▸ ROLES & PERMISSIONS (Updated with institute-specific permissions)
// ──────────────────────────────────────────────────────────────────────────────
export const ALL_PERMISSIONS = [
  // Common
  'dashboard.view', 'profile.manage',

  // Student Management
  'student.create', 'student.read', 'student.update', 'student.delete',
  'student.export', 'student.promote', 'student.transfer',

  // Institute-specific Student Ops
  'student.class.assign', 'student.section.assign',         // School
  'student.batch.assign', 'student.course.assign',           // Coaching/Academy
  'student.semester.register', 'student.program.assign',     // College/University

  // Teacher / Staff Management
  'teacher.create', 'teacher.read', 'teacher.update', 'teacher.delete',
  'teacher.salary.manage', 'teacher.leave.approve',

  // Parents
  'parent.create', 'parent.read', 'parent.update', 'parent.delete',

  // Admissions / Enrollments
  'admission.create', 'admission.read', 'admission.update', 'admission.delete',

  // Academic Structure
  'class.create', 'class.read', 'class.update', 'class.delete',
  'section.create', 'section.read', 'section.update', 'section.delete',
  'course.create', 'course.read', 'course.update', 'course.delete',
  'batch.create', 'batch.read', 'batch.update', 'batch.delete',
  'program.create', 'program.read', 'program.update', 'program.delete',
  'semester.create', 'semester.read', 'semester.update', 'semester.delete',
  'department.create', 'department.read', 'department.update', 'department.delete',
  'faculty.create', 'faculty.read', 'faculty.update', 'faculty.delete',

  // Academic Years / Sessions / Batch Cycles
  'academic_year.create', 'academic_year.read', 'academic_year.update', 'academic_year.delete',

  // Subjects / Courses / Modules
  'subject.create', 'subject.read', 'subject.update', 'subject.delete',

  // Timetable / Schedules
  'timetable.create', 'timetable.read', 'timetable.update', 'timetable.delete',

  // Attendance
  'attendance.mark', 'attendance.read', 'attendance.update',
  'attendance.export', 'attendance.report',

  // Fees
  'fee.create', 'fee.read', 'fee.update', 'fee.delete',
  'fee.collect', 'fee.refund', 'fee.export',
  'fee.structure.create', 'fee.structure.assign',

  // Fee Templates
  'fee_template.create', 'fee_template.read', 'fee_template.update', 'fee_template.delete',

  // Exams / Mock Tests / Assessments
  'exam.create', 'exam.read', 'exam.update', 'exam.delete',
  'exam.schedule', 'exam.result.enter', 'exam.result.publish',

  // Payroll
  'payroll.read', 'payroll.create', 'payroll.process', 'payroll.export',

  // Communication
  'notice.create', 'notice.read', 'notice.update', 'notice.delete',
  'notification.send', 'sms.send', 'email.send',

  // Reports
  'report.view', 'report.export', 'report.schedule', 'report.financial',

  // Branches / Campuses
  'branch.create', 'branch.read', 'branch.update', 'branch.delete',

  // Roles & Users
  'role.read', 'role.create', 'role.update', 'role.delete', 'role.manage',
  'user.read', 'user.create', 'user.update', 'user.delete', 'user.manage',

  // Settings
  'school.settings', 'institute.settings', 'backup.manage',
  'settings.view', 'settings.update',

  // CamelCase aliases (used in some page components)
  'academicYear.create', 'academicYear.read', 'academicYear.update', 'academicYear.delete',
  'feeTemplate.create', 'feeTemplate.read', 'feeTemplate.update', 'feeTemplate.delete',
  'staffAttendance.create', 'staffAttendance.read', 'staffAttendance.update', 'staffAttendance.delete',

  // Research (University)
  'research.create', 'research.read', 'research.update', 'research.delete',
];

export const DUMMY_ROLES = [
  // Super Admin (Platform level)
  {
    id: 'role-master-001',
    name: 'Master Admin',
    code: 'MASTER_ADMIN',
    level: 'platform',
    is_system: true,
    permissions: ALL_PERMISSIONS
  },
  
  // Institute Admin (for all institute types)
  {
    id: 'role-inst-001',
    name: 'Institute Admin',
    code: 'INSTITUTE_ADMIN',
    level: 'institute',
    is_system: true,
    permissions: ALL_PERMISSIONS
  },
  
  // School-specific roles
  {
    id: 'role-sch-001',
    name: 'Class Teacher',
    code: 'CLASS_TEACHER',
    level: 'school',
    permissions: [
      'student.read', 'student.export',
      'class.read', 'section.read',
      'attendance.mark', 'attendance.read',
      'exam.create', 'exam.result.enter',
      'notice.read'
    ]
  },
  {
    id: 'role-sch-002',
    name: 'Subject Teacher',
    code: 'SUBJECT_TEACHER',
    level: 'school',
    permissions: [
      'student.read',
      'subject.read',
      'attendance.mark', 'attendance.read',
      'exam.result.enter'
    ]
  },
  
  // Coaching-specific roles
  {
    id: 'role-coach-001',
    name: 'Senior Faculty',
    code: 'SENIOR_FACULTY',
    level: 'coaching',
    permissions: [
      'student.read', 'student.batch.assign',
      'course.read', 'batch.read',
      'attendance.mark', 'attendance.read',
      'exam.create', 'exam.result.enter'
    ]
  },
  
  // College-specific roles
  {
    id: 'role-coll-001',
    name: 'Professor',
    code: 'PROFESSOR',
    level: 'college',
    permissions: [
      'student.read',
      'program.read', 'semester.read',
      'subject.create', 'subject.read',
      'attendance.mark', 'attendance.read',
      'exam.create', 'exam.result.enter'
    ]
  },
  {
    id: 'role-coll-002',
    name: 'HOD',
    code: 'HOD',
    level: 'college',
    permissions: [
      'student.read', 'student.update',
      'program.create', 'program.update',
      'semester.create', 'semester.update',
      'teacher.leave.approve',
      'attendance.report'
    ]
  },
  
  // Common roles
  {
    id: 'role-common-001',
    name: 'Fee Manager',
    code: 'FEE_MANAGER',
    level: 'institute',
    permissions: [
      'student.read',
      'fee.create', 'fee.read', 'fee.update', 'fee.collect', 'fee.refund',
      'fee.structure.create',
      'report.view'
    ]
  },
  {
    id: 'role-common-002',
    name: 'Receptionist',
    code: 'RECEPTIONIST',
    level: 'institute',
    permissions: [
      'student.create', 'student.read',
      'fee.read', 'fee.collect',
      'attendance.read'
    ]
  }
];

// ──────────────────────────────────────────────────────────────────────────────
// 8 ▸ USERS (Demo accounts for all institute types)
// ──────────────────────────────────────────────────────────────────────────────
export const DUMMY_USERS = [
  // Master Admin — credentials match backend DB (.env SUPER_ADMIN_*)
  {
    id: 'user-master-001',
    first_name: 'Master',
    last_name: 'Admin',
    email: 'admin@thecloudsacademy.com',
    password: 'Admin@TCA2026!',
    role_code: 'MASTER_ADMIN',
    role: DUMMY_ROLES[0],
    institute_id: null,
    institute_code: null,
    is_active: true,
    permissions: ALL_PERMISSIONS
  },

  // School Users
  {
    id: 'user-sch-001',
    first_name: 'Muhammad',
    last_name: 'Usman',
    email: 'admin@tcaschool.edu.pk',
    password: 'school@123',
    role_code: 'INSTITUTE_ADMIN',
    role: DUMMY_ROLES[1],
    institute_id: 'inst-001',
    institute_code: 'TCA-SCH',
    is_active: true,
    permissions: ALL_PERMISSIONS
  },
  {
    id: 'user-sch-002',
    first_name: 'Ayesha',
    last_name: 'Siddiqui',
    email: 'fees@tcaschool.edu.pk',
    password: 'fees@123',
    role_code: 'FEE_MANAGER',
    role: DUMMY_ROLES.find(r => r.code === 'FEE_MANAGER'),
    institute_id: 'inst-001',
    institute_code: 'TCA-SCH',
    is_active: true
  },
  {
    id: 'user-sch-003',
    first_name: 'Hassan',
    last_name: 'Mahmood',
    email: 'teacher.sch@tcaschool.edu.pk',
    password: 'teacher@123',
    role_code: 'CLASS_TEACHER',
    role: DUMMY_ROLES.find(r => r.code === 'CLASS_TEACHER'),
    institute_id: 'inst-001',
    institute_code: 'TCA-SCH',
    is_active: true
  },

  // Coaching Users
  {
    id: 'user-coach-001',
    first_name: 'Khalid',
    last_name: 'Mehmood',
    email: 'admin@starcoaching.pk',
    password: 'coaching@123',
    role_code: 'INSTITUTE_ADMIN',
    role: DUMMY_ROLES[1],
    institute_id: 'inst-002',
    institute_code: 'SCC-LHR',
    is_active: true
  },
  {
    id: 'user-coach-002',
    first_name: 'Naila',
    last_name: 'Rashid',
    email: 'faculty@starcoaching.pk',
    password: 'faculty@123',
    role_code: 'SENIOR_FACULTY',
    role: DUMMY_ROLES.find(r => r.code === 'SENIOR_FACULTY'),
    institute_id: 'inst-002',
    institute_code: 'SCC-LHR',
    is_active: true
  },

  // Academy Users
  {
    id: 'user-aca-001',
    first_name: 'Zara',
    last_name: 'Hashmi',
    email: 'admin@horizonit.edu.pk',
    password: 'academy@123',
    role_code: 'INSTITUTE_ADMIN',
    role: DUMMY_ROLES[1],
    institute_id: 'inst-003',
    institute_code: 'HIA-ISL',
    is_active: true
  },

  // College Users
  {
    id: 'user-coll-001',
    first_name: 'Naveed',
    last_name: 'Chaudhry',
    email: 'admin@pcc.edu.pk',
    password: 'college@123',
    role_code: 'INSTITUTE_ADMIN',
    role: DUMMY_ROLES[1],
    institute_id: 'inst-004',
    institute_code: 'PCC-LHR',
    is_active: true
  },
  {
    id: 'user-coll-002',
    first_name: 'Imran',
    last_name: 'Khan',
    email: 'hod.cs@pcc.edu.pk',
    password: 'hod@123',
    role_code: 'HOD',
    role: DUMMY_ROLES.find(r => r.code === 'HOD'),
    institute_id: 'inst-004',
    institute_code: 'PCC-LHR',
    is_active: true
  },

  // University Users
  {
    id: 'user-uni-001',
    first_name: 'Ahmed',
    last_name: 'Saeed',
    email: 'admin@cust.edu.pk',
    password: 'university@123',
    role_code: 'INSTITUTE_ADMIN',
    role: DUMMY_ROLES[1],
    institute_id: 'inst-005',
    institute_code: 'CUST-ISL',
    is_active: true
  }
];

// ──────────────────────────────────────────────────────────────────────────────
// 9 ▸ ADDITIONAL DATA — all 10-12 records per entity
// ──────────────────────────────────────────────────────────────────────────────

// ── ACADEMIC YEARS ────────────────────────────────────────────────────────────
export const DUMMY_ACADEMIC_YEARS = [
  { id:'ay-001', name:'2025-26', start_date:'2025-04-01', end_date:'2026-03-31', is_current:true,  description:'Current academic year' },
  { id:'ay-002', name:'2024-25', start_date:'2024-04-01', end_date:'2025-03-31', is_current:false, description:'Previous year' },
  { id:'ay-003', name:'2023-24', start_date:'2023-04-01', end_date:'2024-03-31', is_current:false, description:'Archived' },
  { id:'ay-004', name:'2022-23', start_date:'2022-04-01', end_date:'2023-03-31', is_current:false, description:'Archived' },
  { id:'ay-005', name:'2021-22', start_date:'2021-04-01', end_date:'2022-03-31', is_current:false, description:'Archived' },
  { id:'ay-006', name:'2020-21', start_date:'2020-04-01', end_date:'2021-03-31', is_current:false, description:'Archived' },
  { id:'ay-007', name:'2019-20', start_date:'2019-04-01', end_date:'2020-03-31', is_current:false, description:'Archived' },
  { id:'ay-008', name:'2018-19', start_date:'2018-04-01', end_date:'2019-03-31', is_current:false, description:'Archived' },
  { id:'ay-009', name:'2017-18', start_date:'2017-04-01', end_date:'2018-03-31', is_current:false, description:'Archived' },
  { id:'ay-010', name:'2026-27', start_date:'2026-04-01', end_date:'2027-03-31', is_current:false, description:'Upcoming' },
];

// ── BRANCHES / CAMPUSES ───────────────────────────────────────────────────────
export const DUMMY_BRANCHES = [
  { id:'br-001', name:'Main Campus',      code:'MAIN',  head:'Muhammad Usman',   phone:'+92-42-35761234', city:'Lahore',     address:'12-B, Gulberg III',         students_count:310, is_active:true  },
  { id:'br-002', name:'DHA Branch',       code:'DHA',   head:'Tariq Jamil',      phone:'+92-42-35769999', city:'Lahore',     address:'Plot 45, DHA Phase 5',      students_count:185, is_active:true  },
  { id:'br-003', name:'Johar Town',       code:'JHR',   head:'Sana Tariq',       phone:'+92-42-35881234', city:'Lahore',     address:'Block L, Johar Town',       students_count:142, is_active:true  },
  { id:'br-004', name:'Model Town',       code:'MDL',   head:'Adnan Iqbal',      phone:'+92-42-35990011', city:'Lahore',     address:'Main Blvd, Model Town',     students_count:98,  is_active:true  },
  { id:'br-005', name:'Bahria Campus',    code:'BTN',   head:'Nadia Rehman',     phone:'+92-51-4123456', city:'Islamabad',  address:'Bahria Town, Phase 4',      students_count:210, is_active:true  },
  { id:'br-006', name:'F-6 Campus',       code:'F6',    head:'Imran Baig',       phone:'+92-51-2879876', city:'Islamabad',  address:'Super Market, F-6',         students_count:175, is_active:false },
  { id:'br-007', name:'Garden Town',      code:'GTN',   head:'Kamran Shah',      phone:'+92-42-35112233', city:'Lahore',    address:'Block A, Garden Town',      students_count:130, is_active:true  },
  { id:'br-008', name:'Cantt Campus',     code:'CNT',   head:'Zobia Aslam',      phone:'+92-42-36121212', city:'Lahore',    address:'Sarwar Road, Cantt',        students_count:90,  is_active:true  },
  { id:'br-009', name:'Karachi Centre',   code:'KHI',   head:'Farah Qureshi',    phone:'+92-21-35678900', city:'Karachi',   address:'Block 3, PECHS',            students_count:265, is_active:true  },
  { id:'br-010', name:'Rawalpindi Branch',code:'RWP',   head:'Waqas Awan',       phone:'+92-51-5556677', city:'Rawalpindi', address:'Saddar, Rawalpindi',        students_count:155, is_active:true  },
  { id:'br-011', name:'Multan Campus',    code:'MLT',   head:'Ijaz Ahmed',       phone:'+92-61-4411234', city:'Multan',     address:'Model Town, Multan',        students_count:88,  is_active:true  },
];

// ── CLASSES ───────────────────────────────────────────────────────────────────
export const DUMMY_CLASSES = [
  { id:'cls-001', name:'Class 1',  grade_level:1,  class_teacher:'Hassan Mahmood',  sections_count:2, student_count:58, is_active:true  },
  { id:'cls-002', name:'Class 2',  grade_level:2,  class_teacher:'Sana Tariq',       sections_count:2, student_count:52, is_active:true  },
  { id:'cls-003', name:'Class 3',  grade_level:3,  class_teacher:'Adnan Iqbal',     sections_count:1, student_count:45, is_active:true  },
  { id:'cls-004', name:'Class 4',  grade_level:4,  class_teacher:'Rabia Nawaz',     sections_count:2, student_count:60, is_active:true  },
  { id:'cls-005', name:'Class 5',  grade_level:5,  class_teacher:'Bilal Chaudhry',  sections_count:1, student_count:40, is_active:true  },
  { id:'cls-006', name:'Class 6',  grade_level:6,  class_teacher:'Nadia Rehman',    sections_count:2, student_count:55, is_active:true  },
  { id:'cls-007', name:'Class 7',  grade_level:7,  class_teacher:'Kamran Shah',     sections_count:2, student_count:48, is_active:true  },
  { id:'cls-008', name:'Class 8',  grade_level:8,  class_teacher:'Zobia Aslam',     sections_count:2, student_count:50, is_active:true  },
  { id:'cls-009', name:'Class 9',  grade_level:9,  class_teacher:'Imran Baig',      sections_count:2, student_count:55, is_active:true  },
  { id:'cls-010', name:'Class 10', grade_level:10, class_teacher:'Amna Farooq',     sections_count:2, student_count:60, is_active:true  },
  { id:'cls-011', name:'Class 11', grade_level:11, class_teacher:'Tariq Aziz',      sections_count:1, student_count:35, is_active:true  },
  { id:'cls-012', name:'Class 12', grade_level:12, class_teacher:'Farah Qureshi',   sections_count:1, student_count:30, is_active:false },
];

// ── SECTIONS ──────────────────────────────────────────────────────────────────
export const DUMMY_SECTIONS = [
  { id:'sec-001', name:'A', class_id:'cls-001', class_name:'Class 1', class_teacher:'Hassan Mahmood',  room_number:'101', student_count:29, is_active:true  },
  { id:'sec-002', name:'B', class_id:'cls-001', class_name:'Class 1', class_teacher:'Sana Tariq',      room_number:'102', student_count:29, is_active:true  },
  { id:'sec-003', name:'A', class_id:'cls-002', class_name:'Class 2', class_teacher:'Adnan Iqbal',     room_number:'103', student_count:26, is_active:true  },
  { id:'sec-004', name:'B', class_id:'cls-002', class_name:'Class 2', class_teacher:'Rabia Nawaz',     room_number:'104', student_count:26, is_active:true  },
  { id:'sec-005', name:'A', class_id:'cls-003', class_name:'Class 3', class_teacher:'Bilal Chaudhry', room_number:'105', student_count:45, is_active:true  },
  { id:'sec-006', name:'A', class_id:'cls-004', class_name:'Class 4', class_teacher:'Nadia Rehman',   room_number:'201', student_count:30, is_active:true  },
  { id:'sec-007', name:'B', class_id:'cls-004', class_name:'Class 4', class_teacher:'Kamran Shah',    room_number:'202', student_count:30, is_active:true  },
  { id:'sec-008', name:'A', class_id:'cls-005', class_name:'Class 5', class_teacher:'Zobia Aslam',    room_number:'203', student_count:40, is_active:true  },
  { id:'sec-009', name:'A', class_id:'cls-006', class_name:'Class 6', class_teacher:'Imran Baig',     room_number:'204', student_count:28, is_active:true  },
  { id:'sec-010', name:'B', class_id:'cls-006', class_name:'Class 6', class_teacher:'Amna Farooq',    room_number:'205', student_count:27, is_active:true  },
  { id:'sec-011', name:'A', class_id:'cls-007', class_name:'Class 7', class_teacher:'Tariq Aziz',     room_number:'206', student_count:25, is_active:true  },
  { id:'sec-012', name:'A', class_id:'cls-008', class_name:'Class 8', class_teacher:'Farah Qureshi',  room_number:'207', student_count:28, is_active:false },
];

// ── STUDENTS (flat for school portal — 12 records) ────────────────────────────
export const DUMMY_FLAT_STUDENTS = [
  { id:'stu-001', first_name:'Ali',     last_name:'Raza',     roll_number:'TCA-001', class_name:'Class 1', section:'A', gender:'male',   date_of_birth:'2014-03-15', guardian_name:'Raza Ahmed',    guardian_phone:'+92-300-2220001', is_active:true,  admission_date:'2023-04-05' },
  { id:'stu-002', first_name:'Fatima',  last_name:'Malik',    roll_number:'TCA-002', class_name:'Class 1', section:'B', gender:'female', date_of_birth:'2014-07-22', guardian_name:'Tariq Malik',   guardian_phone:'+92-300-2220002', is_active:true,  admission_date:'2023-04-05' },
  { id:'stu-003', first_name:'Zaid',    last_name:'Khan',     roll_number:'TCA-003', class_name:'Class 2', section:'A', gender:'male',   date_of_birth:'2013-11-05', guardian_name:'Shahid Khan',   guardian_phone:'+92-300-2220003', is_active:true,  admission_date:'2023-04-10' },
  { id:'stu-004', first_name:'Mariam',  last_name:'Hussain',  roll_number:'TCA-004', class_name:'Class 2', section:'B', gender:'female', date_of_birth:'2013-02-18', guardian_name:'Nadia Hussain', guardian_phone:'+92-300-2220004', is_active:true,  admission_date:'2023-05-01' },
  { id:'stu-005', first_name:'Omar',    last_name:'Farooq',   roll_number:'TCA-005', class_name:'Class 3', section:'A', gender:'male',   date_of_birth:'2012-09-30', guardian_name:'Farooq Ahmad',  guardian_phone:'+92-300-2220005', is_active:true,  admission_date:'2023-04-05' },
  { id:'stu-006', first_name:'Hina',    last_name:'Butt',     roll_number:'TCA-006', class_name:'Class 3', section:'A', gender:'female', date_of_birth:'2012-06-12', guardian_name:'Asad Butt',     guardian_phone:'+92-300-2220006', is_active:true,  admission_date:'2023-04-05' },
  { id:'stu-007', first_name:'Usman',   last_name:'Sheikh',   roll_number:'TCA-007', class_name:'Class 4', section:'A', gender:'male',   date_of_birth:'2011-04-08', guardian_name:'Imran Sheikh',  guardian_phone:'+92-300-2220007', is_active:true,  admission_date:'2024-01-20' },
  { id:'stu-008', first_name:'Noor',    last_name:'Ahmed',    roll_number:'TCA-008', class_name:'Class 4', section:'B', gender:'female', date_of_birth:'2011-12-25', guardian_name:'Saima Ahmed',   guardian_phone:'+92-300-2220008', is_active:true,  admission_date:'2024-01-20' },
  { id:'stu-009', first_name:'Ibrahim', last_name:'Qureshi',  roll_number:'TCA-009', class_name:'Class 5', section:'A', gender:'male',   date_of_birth:'2010-08-14', guardian_name:'Zulfiqar Q',    guardian_phone:'+92-300-2220009', is_active:true,  admission_date:'2024-01-20' },
  { id:'stu-010', first_name:'Zainab',  last_name:'Baig',     roll_number:'TCA-010', class_name:'Class 5', section:'A', gender:'female', date_of_birth:'2010-05-01', guardian_name:'Farid Baig',    guardian_phone:'+92-300-2220010', is_active:false, admission_date:'2024-01-20' },
  { id:'stu-011', first_name:'Hamza',   last_name:'Awan',     roll_number:'TCA-011', class_name:'Class 6', section:'A', gender:'male',   date_of_birth:'2009-01-20', guardian_name:'Waqas Awan',    guardian_phone:'+92-300-2220011', is_active:true,  admission_date:'2024-01-20' },
  { id:'stu-012', first_name:'Amna',    last_name:'Ijaz',     roll_number:'TCA-012', class_name:'Class 6', section:'B', gender:'female', date_of_birth:'2009-10-07', guardian_name:'Ijaz Ahmed',    guardian_phone:'+92-300-2220012', is_active:true,  admission_date:'2024-01-20' },
];

// ── FLAT TEACHERS (school portal — 12 records) ────────────────────────────────
export const DUMMY_FLAT_TEACHERS = [
  { id:'teach-001', first_name:'Hassan',  last_name:'Mahmood',  email:'hassan.m@tca.edu',    phone:'+92-315-4443322', employee_id:'EMP-001', qualification:'M.Sc Mathematics',  designation:'Senior Teacher', gender:'male',   joining_date:'2023-04-01', is_active:true  },
  { id:'teach-002', first_name:'Sana',    last_name:'Tariq',    email:'sana.t@tca.edu',      phone:'+92-322-8887766', employee_id:'EMP-002', qualification:'B.Ed English',       designation:'Teacher',        gender:'female', joining_date:'2023-06-01', is_active:true  },
  { id:'teach-003', first_name:'Adnan',   last_name:'Iqbal',    email:'adnan.i@tca.edu',     phone:'+92-345-6665544', employee_id:'EMP-003', qualification:'M.A Urdu',           designation:'Teacher',        gender:'male',   joining_date:'2023-06-15', is_active:true  },
  { id:'teach-004', first_name:'Rabia',   last_name:'Nawaz',    email:'rabia.n@tca.edu',     phone:'+92-311-2223344', employee_id:'EMP-004', qualification:'B.Sc Computer Sci',  designation:'Teacher',        gender:'female', joining_date:'2024-01-15', is_active:true  },
  { id:'teach-005', first_name:'Bilal',   last_name:'Chaudhry', email:'bilal.c@tca.edu',     phone:'+92-302-9990011', employee_id:'EMP-005', qualification:'M.Sc Physics',       designation:'Senior Teacher', gender:'male',   joining_date:'2023-08-01', is_active:false },
  { id:'teach-006', first_name:'Nadia',   last_name:'Rehman',   email:'nadia.r@tca.edu',     phone:'+92-333-1112233', employee_id:'EMP-006', qualification:'M.Ed Biology',       designation:'Teacher',        gender:'female', joining_date:'2023-04-01', is_active:true  },
  { id:'teach-007', first_name:'Kamran',  last_name:'Shah',     email:'kamran.s@tca.edu',    phone:'+92-321-4445566', employee_id:'EMP-007', qualification:'B.Sc Chemistry',     designation:'Teacher',        gender:'male',   joining_date:'2023-09-01', is_active:true  },
  { id:'teach-008', first_name:'Zobia',   last_name:'Aslam',    email:'zobia.a@tca.edu',     phone:'+92-300-7778899', employee_id:'EMP-008', qualification:'M.A History',        designation:'Teacher',        gender:'female', joining_date:'2024-01-20', is_active:true  },
  { id:'teach-009', first_name:'Imran',   last_name:'Baig',     email:'imran.b@tca.edu',     phone:'+92-313-6667788', employee_id:'EMP-009', qualification:'M.Sc Statistics',    designation:'Senior Teacher', gender:'male',   joining_date:'2023-04-01', is_active:true  },
  { id:'teach-010', first_name:'Amna',    last_name:'Farooq',   email:'amna.f@tca.edu',      phone:'+92-345-3334455', employee_id:'EMP-010', qualification:'B.Ed Islamiat',      designation:'Teacher',        gender:'female', joining_date:'2023-11-01', is_active:false },
  { id:'teach-011', first_name:'Tariq',   last_name:'Aziz',     email:'tariq.a@tca.edu',     phone:'+92-302-2223344', employee_id:'EMP-011', qualification:'M.Phil Economics',   designation:'HOD',            gender:'male',   joining_date:'2023-04-01', is_active:true  },
  { id:'teach-012', first_name:'Farah',   last_name:'Qureshi',  email:'farah.q@tca.edu',     phone:'+92-311-5556677', employee_id:'EMP-012', qualification:'B.Ed Arts',          designation:'Teacher',        gender:'female', joining_date:'2024-03-01', is_active:true  },
];

// ── ADMISSIONS ────────────────────────────────────────────────────────────────
export const DUMMY_ADMISSIONS = [
  { id:'adm-001', admission_no:'ADM-2025-001', first_name:'Bilal',   last_name:'Asif',    gender:'male',   date_of_birth:'2014-05-12', applying_for:'Class 1', guardian_name:'Asif Rahman',   guardian_phone:'+92-300-5550001', status:'approved', applied_date:'2025-03-10' },
  { id:'adm-002', admission_no:'ADM-2025-002', first_name:'Sadia',   last_name:'Nawaz',   gender:'female', date_of_birth:'2013-09-25', applying_for:'Class 2', guardian_name:'Nawaz Ahmad',   guardian_phone:'+92-300-5550002', status:'pending',  applied_date:'2025-03-12' },
  { id:'adm-003', admission_no:'ADM-2025-003', first_name:'Hamid',   last_name:'Butt',    gender:'male',   date_of_birth:'2012-11-30', applying_for:'Class 3', guardian_name:'Ghulam Butt',   guardian_phone:'+92-300-5550003', status:'pending',  applied_date:'2025-03-14' },
  { id:'adm-004', admission_no:'ADM-2025-004', first_name:'Rabia',   last_name:'Iqbal',   gender:'female', date_of_birth:'2011-07-08', applying_for:'Class 4', guardian_name:'Iqbal Hussain', guardian_phone:'+92-300-5550004', status:'rejected', applied_date:'2025-02-20' },
  { id:'adm-005', admission_no:'ADM-2025-005', first_name:'Farhan',  last_name:'Zaman',   gender:'male',   date_of_birth:'2014-02-18', applying_for:'Class 1', guardian_name:'Zaman Ali',     guardian_phone:'+92-300-5550005', status:'approved', applied_date:'2025-03-18' },
  { id:'adm-006', admission_no:'ADM-2025-006', first_name:'Aisha',   last_name:'Noor',    gender:'female', date_of_birth:'2013-05-05', applying_for:'Class 2', guardian_name:'Noor Din',      guardian_phone:'+92-300-5550006', status:'pending',  applied_date:'2025-03-20' },
  { id:'adm-007', admission_no:'ADM-2025-007', first_name:'Shahid',  last_name:'Mirza',   gender:'male',   date_of_birth:'2012-08-11', applying_for:'Class 3', guardian_name:'Mirza Waseem',  guardian_phone:'+92-300-5550007', status:'enrolled', applied_date:'2025-02-10' },
  { id:'adm-008', admission_no:'ADM-2025-008', first_name:'Sara',    last_name:'Khan',    gender:'female', date_of_birth:'2011-03-22', applying_for:'Class 5', guardian_name:'Zaheer Khan',   guardian_phone:'+92-300-5550008', status:'approved', applied_date:'2025-03-01' },
  { id:'adm-009', admission_no:'ADM-2025-009', first_name:'Tariq',   last_name:'Bashir',  gender:'male',   date_of_birth:'2010-10-15', applying_for:'Class 6', guardian_name:'Bashir Ahmad',  guardian_phone:'+92-300-5550009', status:'pending',  applied_date:'2025-03-22' },
  { id:'adm-010', admission_no:'ADM-2025-010', first_name:'Maria',   last_name:'Anwar',   gender:'female', date_of_birth:'2010-01-08', applying_for:'Class 6', guardian_name:'Anwar Saeed',   guardian_phone:'+92-300-5550010', status:'enrolled', applied_date:'2025-01-20' },
  { id:'adm-011', admission_no:'ADM-2025-011', first_name:'Usama',   last_name:'Nasir',   gender:'male',   date_of_birth:'2014-07-30', applying_for:'Class 1', guardian_name:'Nasir Mahmood', guardian_phone:'+92-300-5550011', status:'pending',  applied_date:'2025-03-25' },
  { id:'adm-012', admission_no:'ADM-2025-012', first_name:'Hira',    last_name:'Kamal',   gender:'female', date_of_birth:'2013-04-17', applying_for:'Class 2', guardian_name:'Kamal Hussain', guardian_phone:'+92-300-5550012', status:'approved', applied_date:'2025-03-15' },
];

// ── PARENTS ───────────────────────────────────────────────────────────────────
export const DUMMY_PARENTS = [
  { id:'par-001', first_name:'Raza',     last_name:'Ahmed',   phone:'+92-300-2220001', email:'raza.ahmed@gmail.com',  cnic:'35202-1111111-1', relation:'father', occupation:'Engineer',       children_count:1, is_active:true  },
  { id:'par-002', first_name:'Tariq',    last_name:'Malik',   phone:'+92-300-2220002', email:'tariq.malik@gmail.com', cnic:'35202-2222222-2', relation:'father', occupation:'Businessman',    children_count:1, is_active:true  },
  { id:'par-003', first_name:'Shahid',   last_name:'Khan',    phone:'+92-300-2220003', email:'shahid.khan@gmail.com', cnic:'35202-3333333-3', relation:'father', occupation:'Doctor',         children_count:2, is_active:true  },
  { id:'par-004', first_name:'Nadia',    last_name:'Hussain', phone:'+92-300-2220004', email:null,                    cnic:'35202-4444444-4', relation:'mother', occupation:'Teacher',        children_count:1, is_active:true  },
  { id:'par-005', first_name:'Farooq',   last_name:'Ahmad',   phone:'+92-300-2220005', email:'farooq.a@outlook.com', cnic:'35202-5555555-5', relation:'father', occupation:'Accountant',     children_count:1, is_active:true  },
  { id:'par-006', first_name:'Asad',     last_name:'Butt',    phone:'+92-300-2220006', email:null,                    cnic:'35202-6666666-6', relation:'father', occupation:'Shopkeeper',     children_count:2, is_active:true  },
  { id:'par-007', first_name:'Imran',    last_name:'Sheikh',  phone:'+92-300-2220007', email:'imran.sh@gmail.com',   cnic:'35202-7777777-7', relation:'father', occupation:'Contractor',     children_count:1, is_active:true  },
  { id:'par-008', first_name:'Saima',    last_name:'Ahmed',   phone:'+92-300-2220008', email:'saima.a@yahoo.com',    cnic:'35202-8888888-8', relation:'mother', occupation:'Housewife',      children_count:1, is_active:true  },
  { id:'par-009', first_name:'Zulfiqar', last_name:'Qureshi', phone:'+92-300-2220009', email:null,                    cnic:'35202-9999999-9', relation:'father', occupation:'Govt Employee',  children_count:2, is_active:true  },
  { id:'par-010', first_name:'Farid',    last_name:'Baig',    phone:'+92-300-2220010', email:'farid.baig@gmail.com', cnic:'35202-1010101-0', relation:'father', occupation:'Trader',         children_count:1, is_active:false },
  { id:'par-011', first_name:'Waqas',    last_name:'Awan',    phone:'+92-300-2220011', email:'waqas.awan@gmail.com', cnic:'35202-1122112-1', relation:'father', occupation:'IT Professional', children_count:1, is_active:true  },
  { id:'par-012', first_name:'Ijaz',     last_name:'Ahmed',   phone:'+92-300-2220012', email:null,                    cnic:'35202-1221221-2', relation:'father', occupation:'Banker',         children_count:2, is_active:true  },
];

// ── EXAMS ─────────────────────────────────────────────────────────────────────
export const DUMMY_EXAMS = [
  { id:'exam-001', name:'Mid Term Exam',    type:'mid_term',  class_name:'Class 1',  academic_year:'2025-26', start_date:'2025-10-15', end_date:'2025-10-22', total_marks:100, pass_marks:40, status:'published' },
  { id:'exam-002', name:'Final Exam',       type:'final',     class_name:'Class 1',  academic_year:'2025-26', start_date:'2026-02-10', end_date:'2026-02-20', total_marks:150, pass_marks:60, status:'draft'     },
  { id:'exam-003', name:'Unit Test 1',      type:'unit_test', class_name:'Class 2',  academic_year:'2025-26', start_date:'2025-09-05', end_date:'2025-09-05', total_marks:50,  pass_marks:20, status:'published' },
  { id:'exam-004', name:'Monthly Test',     type:'monthly',   class_name:'Class 3',  academic_year:'2025-26', start_date:'2025-11-01', end_date:'2025-11-02', total_marks:50,  pass_marks:20, status:'published' },
  { id:'exam-005', name:'Mid Term Exam',    type:'mid_term',  class_name:'Class 4',  academic_year:'2025-26', start_date:'2025-10-16', end_date:'2025-10-23', total_marks:100, pass_marks:40, status:'published' },
  { id:'exam-006', name:'Final Exam',       type:'final',     class_name:'Class 5',  academic_year:'2025-26', start_date:'2026-03-01', end_date:'2026-03-12', total_marks:200, pass_marks:80, status:'draft'     },
  { id:'exam-007', name:'Class Test',       type:'class_test',class_name:'Class 6',  academic_year:'2025-26', start_date:'2025-12-10', end_date:'2025-12-10', total_marks:25,  pass_marks:10, status:'published' },
  { id:'exam-008', name:'Half Yearly',      type:'half_yearly',class_name:'Class 7', academic_year:'2025-26', start_date:'2025-11-20', end_date:'2025-11-30', total_marks:150, pass_marks:60, status:'published' },
  { id:'exam-009', name:'Annual Exam',      type:'annual',    class_name:'Class 8',  academic_year:'2025-26', start_date:'2026-03-15', end_date:'2026-03-28', total_marks:300, pass_marks:120,status:'draft'     },
  { id:'exam-010', name:'Pre-Board',        type:'pre_board', class_name:'Class 10', academic_year:'2025-26', start_date:'2025-12-01', end_date:'2025-12-12', total_marks:500, pass_marks:200,status:'published' },
  { id:'exam-011', name:'Mock Test 1',      type:'mock',      class_name:'Class 11', academic_year:'2025-26', start_date:'2025-10-20', end_date:'2025-10-20', total_marks:100, pass_marks:40, status:'published' },
  { id:'exam-012', name:'Board Prep Test',  type:'mock',      class_name:'Class 12', academic_year:'2025-26', start_date:'2026-01-10', end_date:'2026-01-12', total_marks:100, pass_marks:40, status:'draft'     },
];

// ── FLAT SUBJECTS ─────────────────────────────────────────────────────────────
export const DUMMY_FLAT_SUBJECTS = [
  { id:'sub-001', name:'Mathematics',     code:'MATH-1',  class_name:'Class 1',  teacher:'Hassan Mahmood',  type:'core',     credit_hours:4, is_active:true  },
  { id:'sub-002', name:'English',         code:'ENG-1',   class_name:'Class 1',  teacher:'Sana Tariq',      type:'core',     credit_hours:4, is_active:true  },
  { id:'sub-003', name:'Urdu',            code:'URDU-1',  class_name:'Class 1',  teacher:'Adnan Iqbal',     type:'core',     credit_hours:3, is_active:true  },
  { id:'sub-004', name:'General Science', code:'SCI-1',   class_name:'Class 1',  teacher:'Nadia Rehman',    type:'core',     credit_hours:3, is_active:true  },
  { id:'sub-005', name:'Islamiat',        code:'ISL-1',   class_name:'Class 1',  teacher:'Amna Farooq',     type:'core',     credit_hours:2, is_active:true  },
  { id:'sub-006', name:'Mathematics',     code:'MATH-6',  class_name:'Class 6',  teacher:'Imran Baig',      type:'core',     credit_hours:4, is_active:true  },
  { id:'sub-007', name:'Physics',         code:'PHY-6',   class_name:'Class 6',  teacher:'Bilal Chaudhry',  type:'core',     credit_hours:4, is_active:false },
  { id:'sub-008', name:'Chemistry',       code:'CHEM-6',  class_name:'Class 6',  teacher:'Kamran Shah',     type:'core',     credit_hours:4, is_active:true  },
  { id:'sub-009', name:'Biology',         code:'BIO-6',   class_name:'Class 6',  teacher:'Nadia Rehman',    type:'core',     credit_hours:4, is_active:true  },
  { id:'sub-010', name:'Computer Science',code:'CS-6',    class_name:'Class 6',  teacher:'Rabia Nawaz',     type:'elective', credit_hours:3, is_active:true  },
  { id:'sub-011', name:'Art & Drawing',   code:'ART-3',   class_name:'Class 3',  teacher:'Farah Qureshi',   type:'elective', credit_hours:2, is_active:true  },
  { id:'sub-012', name:'Social Studies',  code:'SOC-5',   class_name:'Class 5',  teacher:'Zobia Aslam',     type:'core',     credit_hours:3, is_active:true  },
];

// ── FEES ──────────────────────────────────────────────────────────────────────
export const DUMMY_FEES = [
  { id:'fee-001', student_name:'Ali Raza',       roll_number:'TCA-001', class_name:'Class 1', month:1, year:2026, amount:3500, discount:0,   status:'paid',    paid_on:'2026-01-08' },
  { id:'fee-002', student_name:'Fatima Malik',   roll_number:'TCA-002', class_name:'Class 1', month:2, year:2026, amount:3500, discount:0,   status:'paid',    paid_on:'2026-02-09' },
  { id:'fee-003', student_name:'Zaid Khan',      roll_number:'TCA-003', class_name:'Class 2', month:1, year:2026, amount:3500, discount:350, status:'paid',    paid_on:'2026-01-07' },
  { id:'fee-004', student_name:'Mariam Hussain', roll_number:'TCA-004', class_name:'Class 2', month:2, year:2026, amount:3500, discount:350, status:'pending', paid_on:null         },
  { id:'fee-005', student_name:'Omar Farooq',    roll_number:'TCA-005', class_name:'Class 3', month:1, year:2026, amount:4000, discount:0,   status:'paid',    paid_on:'2026-01-12' },
  { id:'fee-006', student_name:'Hina Butt',      roll_number:'TCA-006', class_name:'Class 3', month:2, year:2026, amount:4000, discount:0,   status:'overdue', paid_on:null         },
  { id:'fee-007', student_name:'Usman Sheikh',   roll_number:'TCA-007', class_name:'Class 4', month:1, year:2026, amount:4000, discount:0,   status:'partial', paid_on:null         },
  { id:'fee-008', student_name:'Noor Ahmed',     roll_number:'TCA-008', class_name:'Class 4', month:1, year:2026, amount:4000, discount:400, status:'pending', paid_on:null         },
  { id:'fee-009', student_name:'Ibrahim Qureshi',roll_number:'TCA-009', class_name:'Class 5', month:2, year:2026, amount:4500, discount:0,   status:'paid',    paid_on:'2026-02-05' },
  { id:'fee-010', student_name:'Zainab Baig',    roll_number:'TCA-010', class_name:'Class 5', month:1, year:2026, amount:4500, discount:0,   status:'overdue', paid_on:null         },
  { id:'fee-011', student_name:'Hamza Awan',     roll_number:'TCA-011', class_name:'Class 6', month:2, year:2026, amount:4500, discount:450, status:'pending', paid_on:null         },
  { id:'fee-012', student_name:'Amna Ijaz',      roll_number:'TCA-012', class_name:'Class 6', month:1, year:2026, amount:4500, discount:0,   status:'paid',    paid_on:'2026-01-09' },
];

// ── FEE TEMPLATES ─────────────────────────────────────────────────────────────
export const DUMMY_FEE_TEMPLATES = [
  { id:'ft-001', name:'Class 1-2 Regular',    class_name:'Class 1, 2',    frequency:'monthly',   tuition:3500, components:'Tuition:3500,Transport:1500,Library:200', total:5200, due_day:10, is_active:true  },
  { id:'ft-002', name:'Class 3-5 Regular',    class_name:'Class 3, 4, 5', frequency:'monthly',   tuition:4000, components:'Tuition:4000,Transport:1500,Lab:300',      total:5800, due_day:10, is_active:true  },
  { id:'ft-003', name:'Class 6-8 Senior',     class_name:'Class 6, 7, 8', frequency:'monthly',   tuition:4500, components:'Tuition:4500,Transport:1500,Lab:400',      total:6400, due_day:10, is_active:true  },
  { id:'ft-004', name:'Class 9-10 Matric',    class_name:'Class 9, 10',   frequency:'monthly',   tuition:5500, components:'Tuition:5500,Transport:1500,Lab:500',      total:7500, due_day:10, is_active:true  },
  { id:'ft-005', name:'Class 11-12 Inter',    class_name:'Class 11, 12',  frequency:'monthly',   tuition:6000, components:'Tuition:6000,Transport:1500,Exam:500',     total:8000, due_day:10, is_active:true  },
  { id:'ft-006', name:'Annual Sports Fee',    class_name:'All Classes',   frequency:'once',      tuition:0,    components:'Sports:1000',                              total:1000, due_day:15, is_active:true  },
  { id:'ft-007', name:'Admission Fee',        class_name:'New Admission', frequency:'once',      tuition:0,    components:'Admission:2000,Registration:500',         total:2500, due_day:3,  is_active:true  },
  { id:'ft-008', name:'Sibling Discount 10%', class_name:'Multiple',      frequency:'monthly',   tuition:-350, components:'Tuition Discount:-350',                   total:-350, due_day:10, is_active:true  },
  { id:'ft-009', name:'Late Fine Per Day',    class_name:'All Classes',   frequency:'once',      tuition:0,    components:'Late Fine:50',                             total:50,   due_day:0,  is_active:true  },
  { id:'ft-010', name:'Quarterly Fee Plan',   class_name:'Class 3-5',     frequency:'quarterly', tuition:12000,components:'Tuition:12000,Transport:4500',             total:16500,due_day:5,  is_active:false },
];

// ── PAYROLL ───────────────────────────────────────────────────────────────────
export const DUMMY_PAYROLL = [
  { id:'pay-001', employee_name:'Hassan Mahmood',  employee_id:'EMP-001', month:3, year:2026, basic_salary:55000, allowances:13000, deductions:3850, net_salary:64150, status:'generated', paid_on:null         },
  { id:'pay-002', employee_name:'Sana Tariq',       employee_id:'EMP-002', month:3, year:2026, basic_salary:40000, allowances:8000,  deductions:2800, net_salary:45200, status:'generated', paid_on:null         },
  { id:'pay-003', employee_name:'Adnan Iqbal',     employee_id:'EMP-003', month:3, year:2026, basic_salary:38000, allowances:7600,  deductions:2670, net_salary:42930, status:'generated', paid_on:null         },
  { id:'pay-004', employee_name:'Rabia Nawaz',     employee_id:'EMP-004', month:3, year:2026, basic_salary:42000, allowances:8400,  deductions:2930, net_salary:47470, status:'generated', paid_on:null         },
  { id:'pay-005', employee_name:'Bilal Chaudhry',  employee_id:'EMP-005', month:3, year:2026, basic_salary:52000, allowances:13000, deductions:3760, net_salary:61240, status:'generated', paid_on:null         },
  { id:'pay-006', employee_name:'Nadia Rehman',    employee_id:'EMP-006', month:3, year:2026, basic_salary:40000, allowances:8000,  deductions:2800, net_salary:45200, status:'generated', paid_on:null         },
  { id:'pay-007', employee_name:'Kamran Shah',     employee_id:'EMP-007', month:2, year:2026, basic_salary:38000, allowances:7600,  deductions:2670, net_salary:42930, status:'paid',      paid_on:'2026-02-28' },
  { id:'pay-008', employee_name:'Zobia Aslam',     employee_id:'EMP-008', month:2, year:2026, basic_salary:39000, allowances:7800,  deductions:2730, net_salary:44070, status:'paid',      paid_on:'2026-02-28' },
  { id:'pay-009', employee_name:'Imran Baig',      employee_id:'EMP-009', month:2, year:2026, basic_salary:53000, allowances:13250, deductions:3865, net_salary:62385, status:'paid',      paid_on:'2026-02-28' },
  { id:'pay-010', employee_name:'Amna Farooq',     employee_id:'EMP-010', month:2, year:2026, basic_salary:32000, allowances:6400,  deductions:2240, net_salary:36160, status:'paid',      paid_on:'2026-02-28' },
  { id:'pay-011', employee_name:'Tariq Aziz',      employee_id:'EMP-011', month:2, year:2026, basic_salary:65000, allowances:16250, deductions:4550, net_salary:76700, status:'paid',      paid_on:'2026-02-28' },
  { id:'pay-012', employee_name:'Farah Qureshi',   employee_id:'EMP-012', month:1, year:2026, basic_salary:37000, allowances:7400,  deductions:2590, net_salary:41810, status:'paid',      paid_on:'2026-01-31' },
];

// ── NOTICES ───────────────────────────────────────────────────────────────────
export const DUMMY_NOTICES = [
  { id:'ntc-001', title:'Parent-Teacher Meeting — March 2026',    audience:'parents',  priority:'high',   is_published:true,  publish_date:'2026-03-03', created_at:'2026-03-03T09:00:00.000Z' },
  { id:'ntc-002', title:'Mid-Term Exam Schedule Released',         audience:'students', priority:'high',   is_published:true,  publish_date:'2026-03-02', created_at:'2026-03-02T10:00:00.000Z' },
  { id:'ntc-003', title:'Fee Submission Deadline: March 10',       audience:'parents',  priority:'medium', is_published:true,  publish_date:'2026-03-01', created_at:'2026-03-01T11:00:00.000Z' },
  { id:'ntc-004', title:'Summer Vacation Announcement',            audience:'all',      priority:'medium', is_published:true,  publish_date:'2026-03-01', created_at:'2026-03-01T12:00:00.000Z' },
  { id:'ntc-005', title:'Staff Meeting — March 5, 2026',           audience:'teachers', priority:'urgent', is_published:true,  publish_date:'2026-03-03', created_at:'2026-03-03T08:00:00.000Z' },
  { id:'ntc-006', title:'Annual Sports Day — April 10',            audience:'all',      priority:'low',    is_published:false, publish_date:'2026-03-15', created_at:'2026-03-03T14:00:00.000Z' },
  { id:'ntc-007', title:'New Curriculum Guidelines 2026-27',       audience:'teachers', priority:'high',   is_published:true,  publish_date:'2026-02-20', created_at:'2026-02-20T09:00:00.000Z' },
  { id:'ntc-008', title:'Admission Schedule Open for 2026-27',     audience:'all',      priority:'high',   is_published:true,  publish_date:'2026-02-15', created_at:'2026-02-15T10:00:00.000Z' },
  { id:'ntc-009', title:'Library Book Return Deadline',            audience:'students', priority:'low',    is_published:true,  publish_date:'2026-03-04', created_at:'2026-03-04T11:00:00.000Z' },
  { id:'ntc-010', title:'Uniform Policy Reminder',                 audience:'all',      priority:'medium', is_published:true,  publish_date:'2026-01-10', created_at:'2026-01-10T08:00:00.000Z' },
  { id:'ntc-011', title:'Holiday Notice — Eid al-Fitr 2026',      audience:'all',      priority:'medium', is_published:false, publish_date:'2026-03-28', created_at:'2026-03-05T09:00:00.000Z' },
  { id:'ntc-012', title:'Science Exhibition — March 25',          audience:'all',      priority:'low',    is_published:true,  publish_date:'2026-03-05', created_at:'2026-03-05T14:00:00.000Z' },
];

// ── ATTENDANCE ────────────────────────────────────────────────────────────────
export const DUMMY_ATTENDANCE = [
  { id:'att-001', student_name:'Ali Raza',        roll_number:'TCA-001', class_name:'Class 1', section:'A', date:'2026-03-05', status:'present' },
  { id:'att-002', student_name:'Fatima Malik',    roll_number:'TCA-002', class_name:'Class 1', section:'B', date:'2026-03-05', status:'present' },
  { id:'att-003', student_name:'Zaid Khan',       roll_number:'TCA-003', class_name:'Class 2', section:'A', date:'2026-03-05', status:'absent'  },
  { id:'att-004', student_name:'Mariam Hussain',  roll_number:'TCA-004', class_name:'Class 2', section:'B', date:'2026-03-05', status:'present' },
  { id:'att-005', student_name:'Omar Farooq',     roll_number:'TCA-005', class_name:'Class 3', section:'A', date:'2026-03-05', status:'late'    },
  { id:'att-006', student_name:'Hina Butt',       roll_number:'TCA-006', class_name:'Class 3', section:'A', date:'2026-03-05', status:'present' },
  { id:'att-007', student_name:'Usman Sheikh',    roll_number:'TCA-007', class_name:'Class 4', section:'A', date:'2026-03-05', status:'present' },
  { id:'att-008', student_name:'Noor Ahmed',      roll_number:'TCA-008', class_name:'Class 4', section:'B', date:'2026-03-05', status:'absent'  },
  { id:'att-009', student_name:'Ibrahim Qureshi', roll_number:'TCA-009', class_name:'Class 5', section:'A', date:'2026-03-05', status:'present' },
  { id:'att-010', student_name:'Zainab Baig',     roll_number:'TCA-010', class_name:'Class 5', section:'A', date:'2026-03-05', status:'leave'   },
  { id:'att-011', student_name:'Hamza Awan',      roll_number:'TCA-011', class_name:'Class 6', section:'A', date:'2026-03-05', status:'present' },
  { id:'att-012', student_name:'Amna Ijaz',       roll_number:'TCA-012', class_name:'Class 6', section:'B', date:'2026-03-05', status:'present' },
];

// ── STAFF ATTENDANCE ──────────────────────────────────────────────────────────
export const DUMMY_STAFF_ATTENDANCE = [
  { id:'sa-001', employee_name:'Hassan Mahmood',  employee_id:'EMP-001', date:'2026-03-05', status:'present', check_in:'07:52', check_out:'15:05' },
  { id:'sa-002', employee_name:'Sana Tariq',       employee_id:'EMP-002', date:'2026-03-05', status:'present', check_in:'07:58', check_out:'15:00' },
  { id:'sa-003', employee_name:'Adnan Iqbal',     employee_id:'EMP-003', date:'2026-03-05', status:'absent',  check_in:null,    check_out:null    },
  { id:'sa-004', employee_name:'Rabia Nawaz',     employee_id:'EMP-004', date:'2026-03-05', status:'present', check_in:'08:05', check_out:'15:10' },
  { id:'sa-005', employee_name:'Bilal Chaudhry',  employee_id:'EMP-005', date:'2026-03-05', status:'leave',   check_in:null,    check_out:null    },
  { id:'sa-006', employee_name:'Nadia Rehman',    employee_id:'EMP-006', date:'2026-03-05', status:'present', check_in:'07:55', check_out:'15:00' },
  { id:'sa-007', employee_name:'Kamran Shah',     employee_id:'EMP-007', date:'2026-03-05', status:'late',    check_in:'08:35', check_out:'15:00' },
  { id:'sa-008', employee_name:'Zobia Aslam',     employee_id:'EMP-008', date:'2026-03-05', status:'present', check_in:'07:50', check_out:'15:05' },
  { id:'sa-009', employee_name:'Imran Baig',      employee_id:'EMP-009', date:'2026-03-05', status:'present', check_in:'07:48', check_out:'15:00' },
  { id:'sa-010', employee_name:'Amna Farooq',     employee_id:'EMP-010', date:'2026-03-05', status:'absent',  check_in:null,    check_out:null    },
  { id:'sa-011', employee_name:'Tariq Aziz',      employee_id:'EMP-011', date:'2026-03-05', status:'present', check_in:'07:45', check_out:'15:15' },
  { id:'sa-012', employee_name:'Farah Qureshi',   employee_id:'EMP-012', date:'2026-03-05', status:'present', check_in:'08:00', check_out:'15:00' },
];

// ── TIMETABLE ─────────────────────────────────────────────────────────────────
export const DUMMY_TIMETABLE = [
  { id:'tt-001', class_name:'Class 1', section:'A', day:'monday',    period:1, subject:'Mathematics',    teacher:'Hassan Mahmood',  room:'101', start_time:'08:00', end_time:'08:40' },
  { id:'tt-002', class_name:'Class 1', section:'A', day:'monday',    period:2, subject:'English',         teacher:'Sana Tariq',      room:'101', start_time:'08:40', end_time:'09:20' },
  { id:'tt-003', class_name:'Class 1', section:'A', day:'monday',    period:3, subject:'Urdu',            teacher:'Adnan Iqbal',     room:'101', start_time:'09:20', end_time:'10:00' },
  { id:'tt-004', class_name:'Class 1', section:'A', day:'monday',    period:4, subject:'Gen. Science',   teacher:'Nadia Rehman',    room:'101', start_time:'10:30', end_time:'11:10' },
  { id:'tt-005', class_name:'Class 1', section:'A', day:'monday',    period:5, subject:'Islamiat',        teacher:'Amna Farooq',     room:'101', start_time:'11:10', end_time:'11:50' },
  { id:'tt-006', class_name:'Class 2', section:'A', day:'tuesday',   period:1, subject:'Mathematics',    teacher:'Hassan Mahmood',  room:'103', start_time:'08:00', end_time:'08:40' },
  { id:'tt-007', class_name:'Class 2', section:'A', day:'tuesday',   period:2, subject:'Urdu',            teacher:'Adnan Iqbal',     room:'103', start_time:'08:40', end_time:'09:20' },
  { id:'tt-008', class_name:'Class 6', section:'A', day:'monday',    period:1, subject:'Mathematics',    teacher:'Imran Baig',      room:'204', start_time:'08:00', end_time:'08:40' },
  { id:'tt-009', class_name:'Class 6', section:'A', day:'monday',    period:2, subject:'Physics',         teacher:'Bilal Chaudhry',  room:'204', start_time:'08:40', end_time:'09:20' },
  { id:'tt-010', class_name:'Class 6', section:'A', day:'monday',    period:3, subject:'Chemistry',       teacher:'Kamran Shah',     room:'204', start_time:'09:20', end_time:'10:00' },
  { id:'tt-011', class_name:'Class 6', section:'A', day:'wednesday', period:1, subject:'Biology',         teacher:'Nadia Rehman',    room:'204', start_time:'08:00', end_time:'08:40' },
  { id:'tt-012', class_name:'Class 6', section:'B', day:'thursday',  period:1, subject:'Computer Sci.',  teacher:'Rabia Nawaz',     room:'205', start_time:'08:00', end_time:'08:40' },
];

// ── PROGRAMS (for college/university ProgramsPage) ────────────────────────────
export const DUMMY_PROGRAMS = [
  { id:'prog-001', name:'BS Computer Science',     code:'BSCS',    degree_level:'bachelor', duration_years:4, department:'Computer Science',    intake:60,  enrolled:52, is_active:true  },
  { id:'prog-002', name:'BS Software Engineering', code:'BSSE',    degree_level:'bachelor', duration_years:4, department:'Software Engineering', intake:60,  enrolled:55, is_active:true  },
  { id:'prog-003', name:'BS Data Science',         code:'BSDS',    degree_level:'bachelor', duration_years:4, department:'Data Science',         intake:40,  enrolled:35, is_active:true  },
  { id:'prog-004', name:'MS Computer Science',     code:'MSCS',    degree_level:'master',   duration_years:2, department:'Computer Science',    intake:30,  enrolled:22, is_active:true  },
  { id:'prog-005', name:'PhD Computer Science',    code:'PHDCS',   degree_level:'phd',      duration_years:3, department:'Computer Science',    intake:10,  enrolled:8,  is_active:true  },
  { id:'prog-006', name:'FSc Pre-Medical',         code:'FSC-MED', degree_level:'associate',duration_years:2, department:'Science',              intake:80,  enrolled:75, is_active:true  },
  { id:'prog-007', name:'FSc Pre-Engineering',     code:'FSC-ENG', degree_level:'associate',duration_years:2, department:'Science',              intake:80,  enrolled:70, is_active:true  },
  { id:'prog-008', name:'B.Com (Hons)',             code:'BCOM',    degree_level:'bachelor', duration_years:4, department:'Commerce',             intake:50,  enrolled:45, is_active:true  },
  { id:'prog-009', name:'BBA (Hons)',               code:'BBA',     degree_level:'bachelor', duration_years:4, department:'Management Sciences',  intake:50,  enrolled:42, is_active:false },
  { id:'prog-010', name:'MBA',                      code:'MBA',     degree_level:'master',   duration_years:2, department:'Management Sciences',  intake:40,  enrolled:38, is_active:true  },
  { id:'prog-011', name:'Associate Degree IT',      code:'ADIT',    degree_level:'associate',duration_years:2, department:'IT',                   intake:40,  enrolled:36, is_active:true  },
  { id:'prog-012', name:'Diploma Web Dev',          code:'DWEB',    degree_level:'diploma',  duration_years:1, department:'IT',                   intake:30,  enrolled:25, is_active:true  },
];

// ── SEMESTERS ─────────────────────────────────────────────────────────────────
export const DUMMY_SEMESTERS = [
  { id:'sem-001', name:'Semester 1',  semester_no:1, program:'BS Computer Science', academic_year:'2025-26', start_date:'2025-09-01', end_date:'2026-01-31', courses_count:6, credit_hours:18, status:'active'    },
  { id:'sem-002', name:'Semester 2',  semester_no:2, program:'BS Computer Science', academic_year:'2025-26', start_date:'2026-02-01', end_date:'2026-06-30', courses_count:6, credit_hours:18, status:'upcoming'  },
  { id:'sem-003', name:'Semester 3',  semester_no:3, program:'BS Computer Science', academic_year:'2025-26', start_date:'2025-09-01', end_date:'2026-01-31', courses_count:5, credit_hours:16, status:'active'    },
  { id:'sem-004', name:'Semester 4',  semester_no:4, program:'BS Computer Science', academic_year:'2024-25', start_date:'2025-02-01', end_date:'2025-06-30', courses_count:6, credit_hours:18, status:'completed' },
  { id:'sem-005', name:'Semester 1',  semester_no:1, program:'BS Software Eng.',    academic_year:'2025-26', start_date:'2025-09-01', end_date:'2026-01-31', courses_count:6, credit_hours:18, status:'active'    },
  { id:'sem-006', name:'Semester 2',  semester_no:2, program:'BS Software Eng.',    academic_year:'2025-26', start_date:'2026-02-01', end_date:'2026-06-30', courses_count:6, credit_hours:18, status:'upcoming'  },
  { id:'sem-007', name:'Semester 1',  semester_no:1, program:'MS Computer Science', academic_year:'2025-26', start_date:'2025-09-01', end_date:'2026-01-31', courses_count:4, credit_hours:12, status:'active'    },
  { id:'sem-008', name:'Semester 2',  semester_no:2, program:'MS Computer Science', academic_year:'2025-26', start_date:'2026-02-01', end_date:'2026-06-30', courses_count:4, credit_hours:12, status:'upcoming'  },
  { id:'sem-009', name:'Semester 1',  semester_no:1, program:'FSc Pre-Medical',     academic_year:'2025-26', start_date:'2025-09-01', end_date:'2026-01-31', courses_count:5, credit_hours:16, status:'active'    },
  { id:'sem-010', name:'Semester 2',  semester_no:2, program:'FSc Pre-Medical',     academic_year:'2025-26', start_date:'2026-02-01', end_date:'2026-06-30', courses_count:5, credit_hours:16, status:'upcoming'  },
];

// ── FACULTIES (for university FacultiesPage) ──────────────────────────────────
export const DUMMY_FACULTIES = [
  { id:'fac-001', name:'Faculty of Computing',             code:'FOC',  dean:'Prof. Dr. Ahmed Saeed',   departments_count:4,  programs_count:6,  staff_count:45, students_count:520, is_active:true  },
  { id:'fac-002', name:'Faculty of Engineering',           code:'FOE',  dean:'Dr. Nadia Anwar',         departments_count:5,  programs_count:8,  staff_count:60, students_count:640, is_active:true  },
  { id:'fac-003', name:'Faculty of Management Sciences',   code:'FMS',  dean:'Prof. Imran Khan',        departments_count:3,  programs_count:5,  staff_count:35, students_count:410, is_active:true  },
  { id:'fac-004', name:'Faculty of Arts & Social Sciences',code:'FASS', dean:'Dr. Samina Tariq',        departments_count:6,  programs_count:9,  staff_count:40, students_count:380, is_active:true  },
  { id:'fac-005', name:'Faculty of Natural Sciences',      code:'FNS',  dean:'Prof. Dr. Khalid M.',     departments_count:4,  programs_count:6,  staff_count:38, students_count:295, is_active:true  },
  { id:'fac-006', name:'Faculty of Law',                   code:'FOL',  dean:'Dr. Hassan Baig',         departments_count:2,  programs_count:3,  staff_count:22, students_count:180, is_active:true  },
  { id:'fac-007', name:'Faculty of Medicine',              code:'FOM',  dean:'Prof. Dr. Bilal Rashid',  departments_count:8,  programs_count:4,  staff_count:95, students_count:320, is_active:true  },
  { id:'fac-008', name:'Faculty of Education',             code:'FOED', dean:'Dr. Zobia Malik',         departments_count:3,  programs_count:4,  staff_count:28, students_count:245, is_active:false },
  { id:'fac-009', name:'Faculty of Agriculture',           code:'FOA',  dean:'Prof. Tariq Hussain',     departments_count:3,  programs_count:3,  staff_count:25, students_count:150, is_active:true  },
  { id:'fac-010', name:'Faculty of Pharmacy',              code:'FOP',  dean:'Dr. Amna Qureshi',        departments_count:2,  programs_count:2,  staff_count:18, students_count:120, is_active:true  },
];

// ── DEPARTMENTS ───────────────────────────────────────────────────────────────
export const DUMMY_DEPARTMENTS = [
  { id:'dept-001', name:'Computer Science',        code:'CS',    faculty:'Faculty of Computing',       head:'Prof. Dr. Ahmed Saeed', staff_count:18, courses_count:24, is_active:true  },
  { id:'dept-002', name:'Software Engineering',    code:'SE',    faculty:'Faculty of Computing',       head:'Dr. Nadia Anwar',       staff_count:15, courses_count:20, is_active:true  },
  { id:'dept-003', name:'Data Science',            code:'DS',    faculty:'Faculty of Computing',       head:'Dr. Zain Ali',          staff_count:10, courses_count:16, is_active:true  },
  { id:'dept-004', name:'Electrical Engineering',  code:'EE',    faculty:'Faculty of Engineering',     head:'Prof. Khalid Rehman',   staff_count:20, courses_count:28, is_active:true  },
  { id:'dept-005', name:'Mechanical Engineering',  code:'ME',    faculty:'Faculty of Engineering',     head:'Dr. Usman Tariq',       staff_count:18, courses_count:26, is_active:true  },
  { id:'dept-006', name:'Business Administration', code:'BA',    faculty:'Faculty of Management Sci.', head:'Prof. Imran Khan',      staff_count:15, courses_count:18, is_active:true  },
  { id:'dept-007', name:'Accounting & Finance',    code:'AF',    faculty:'Faculty of Management Sci.', head:'Dr. Samina Baig',       staff_count:12, courses_count:15, is_active:true  },
  { id:'dept-008', name:'Mathematics',             code:'MATH',  faculty:'Faculty of Natural Sciences', head:'Dr. Rabia Hussain',    staff_count:10, courses_count:12, is_active:true  },
  { id:'dept-009', name:'Physics',                 code:'PHY',   faculty:'Faculty of Natural Sciences', head:'Prof. Bilal Chaudhry', staff_count:9,  courses_count:10, is_active:true  },
  { id:'dept-010', name:'English Language',        code:'ENG',   faculty:'Faculty of Arts',            head:'Dr. Farah Qureshi',     staff_count:11, courses_count:14, is_active:false },
  { id:'dept-011', name:'Urdu Language & Lit.',    code:'URDU',  faculty:'Faculty of Arts',            head:'Prof. Adnan Iqbal',     staff_count:8,  courses_count:10, is_active:true  },
  { id:'dept-012', name:'Islamic Studies',         code:'ISL',   faculty:'Faculty of Arts',            head:'Dr. Amna Siddiqui',     staff_count:7,  courses_count:8,  is_active:true  },
];

// ── RESEARCH (for university ResearchPage) ────────────────────────────────────
export const DUMMY_RESEARCH = [
  { id:'res-001', title:'AI-Based Smart Traffic Management',             type:'project', department:'Computer Science',    researcher:'Dr. Ahmed Saeed',    budget:2500000, status:'ongoing',   start_date:'2025-01-01', end_date:'2026-12-31' },
  { id:'res-002', title:'Blockchain for Academic Credential Verification',type:'project', department:'Software Engineering',researcher:'Dr. Nadia Anwar',    budget:1800000, status:'ongoing',   start_date:'2025-03-01', end_date:'2026-08-30' },
  { id:'res-003', title:'Deep Learning for Medical Imaging',             type:'paper',   department:'Data Science',        researcher:'Dr. Zain Ali',        budget:500000,  status:'completed', start_date:'2024-07-01', end_date:'2025-02-28' },
  { id:'res-004', title:'Renewable Energy Optimization using IoT',       type:'project', department:'Electrical Engineering',researcher:'Prof. Khalid Rehman',budget:3200000, status:'ongoing',   start_date:'2024-10-01', end_date:'2027-09-30' },
  { id:'res-005', title:'Supply Chain Disruption in Post-COVID Era',     type:'paper',   department:'Business Administration',researcher:'Prof. Imran Khan', budget:300000,  status:'completed', start_date:'2024-01-01', end_date:'2024-12-31' },
  { id:'res-006', title:'Quantum Computing Applications in Cryptography',type:'thesis',  department:'Computer Science',    researcher:'Hamid Rashid (PhD)',  budget:200000,  status:'ongoing',   start_date:'2025-02-01', end_date:'2028-01-31' },
  { id:'res-007', title:'HEC Grant: Smart Education Systems',            type:'grant',   department:'Software Engineering',researcher:'Dr. Nadia Anwar',    budget:5000000, status:'ongoing',   start_date:'2025-06-01', end_date:'2027-05-31' },
  { id:'res-008', title:'Water Quality Monitoring Using Sensors',        type:'project', department:'Electrical Engineering',researcher:'Dr. Usman Tariq',   budget:1200000, status:'completed', start_date:'2024-04-01', end_date:'2025-03-31' },
  { id:'res-009', title:'Machine Learning for Stock Market Prediction',  type:'thesis',  department:'Data Science',        researcher:'Sara Khan (MS)',      budget:150000,  status:'ongoing',   start_date:'2025-09-01', end_date:'2027-08-31' },
  { id:'res-010', title:'NLP Techniques for Urdu Text Analysis',         type:'paper',   department:'Computer Science',    researcher:'Dr. Ahmed Saeed',    budget:400000,  status:'draft',     start_date:'2025-11-01', end_date:'2026-06-30' },
  { id:'res-011', title:'Fintech Innovation in Emerging Markets',        type:'grant',   department:'Accounting & Finance',researcher:'Dr. Samina Baig',    budget:2800000, status:'ongoing',   start_date:'2025-04-01', end_date:'2027-03-31' },
  { id:'res-012', title:'Sustainable Architecture in Urban Planning',    type:'project', department:'Civil Engineering',   researcher:'Eng. Tariq Hussain', budget:1500000, status:'pending',   start_date:'2026-01-01', end_date:'2027-12-31' },
];

// ──────────────────────────────────────────────────────────────────────────────
// 8b ▸ MISSING SERVICE FALLBACK DATA
// ──────────────────────────────────────────────────────────────────────────────

// ── Notifications ───────────────────────────────────────────────────────────
export const DUMMY_NOTIFICATIONS = [
  { id:'notif-001', title:'Fee Due',           message:'Monthly fee is due for March.',       type:'fee',          is_read:false, created_at:'2026-03-05T08:00:00Z' },
  { id:'notif-002', title:'Exam Scheduled',    message:'Mid-term exams start March 15.',      type:'exam',         is_read:false, created_at:'2026-03-04T10:00:00Z' },
  { id:'notif-003', title:'New Notice',        message:'Annual Sports Day announcement.',     type:'notice',       is_read:true,  created_at:'2026-03-03T09:00:00Z' },
  { id:'notif-004', title:'Payslip Ready',     message:'February payslip has been generated.',type:'payroll',      is_read:false, created_at:'2026-03-02T08:30:00Z' },
  { id:'notif-005', title:'Attendance Alert',  message:'Student Ali Hassan absent 3 days.',   type:'attendance',   is_read:true,  created_at:'2026-03-01T11:00:00Z' },
  { id:'notif-006', title:'Admission Approved',message:'Admission #ADM-2026-010 approved.',   type:'admission',    is_read:false, created_at:'2026-02-28T14:00:00Z' },
  { id:'notif-007', title:'Password Changed',  message:'Your password was changed.',          type:'security',     is_read:true,  created_at:'2026-02-27T16:00:00Z' },
  { id:'notif-008', title:'New Teacher Added', message:'Ms. Hina Butt joined as Maths teacher.',type:'staff',      is_read:false, created_at:'2026-02-26T10:00:00Z' },
  { id:'notif-009', title:'Leave Approved',    message:'Your leave request has been approved.',type:'leave',       is_read:true,  created_at:'2026-02-25T09:00:00Z' },
  { id:'notif-010', title:'Report Generated',  message:'Monthly student report is ready.',    type:'report',       is_read:false, created_at:'2026-02-24T12:00:00Z' },
];

// ── Payslips ────────────────────────────────────────────────────────────────
export const DUMMY_PAYSLIPS = [
  { id:'ps-001', teacher_id:'t1', name:'Mr. Tariq Ahmad',  designation:'Senior Teacher', month:2, year:2026, basic:55000, allowances:10000, deductions:5000, net:60000,  status:'paid',    paid_date:'2026-03-01', bank:'HBL' },
  { id:'ps-002', teacher_id:'t2', name:'Ms. Hina Butt',    designation:'Teacher',        month:2, year:2026, basic:45000, allowances:8000,  deductions:4000, net:49000,  status:'paid',    paid_date:'2026-03-01', bank:'UBL' },
  { id:'ps-003', teacher_id:'t3', name:'Mr. Kamran Beg',   designation:'Admin',          month:2, year:2026, basic:40000, allowances:6000,  deductions:3500, net:42500,  status:'pending', paid_date:null,         bank:'MCB' },
  { id:'ps-004', teacher_id:'t4', name:'Ms. Rabia Tahir',  designation:'Accountant',     month:2, year:2026, basic:38000, allowances:5000,  deductions:3000, net:40000,  status:'paid',    paid_date:'2026-03-01', bank:'Meezan' },
  { id:'ps-005', teacher_id:'t5', name:'Mr. Nasir Raza',   designation:'IT Support',     month:2, year:2026, basic:35000, allowances:5000,  deductions:2800, net:37200,  status:'pending', paid_date:null,         bank:'Bank Al-Falah' },
  { id:'ps-006', teacher_id:'t6', name:'Ms. Nadia Khan',   designation:'Teacher',         month:1, year:2026, basic:45000, allowances:8000,  deductions:4000, net:49000,  status:'paid',    paid_date:'2026-02-01', bank:'UBL' },
  { id:'ps-007', teacher_id:'t7', name:'Mr. Asif Iqbal',   designation:'Coordinator',    month:1, year:2026, basic:50000, allowances:9000,  deductions:4500, net:54500,  status:'paid',    paid_date:'2026-02-01', bank:'HBL' },
  { id:'ps-008', teacher_id:'t8', name:'Ms. Sana Malik',   designation:'Teacher',        month:1, year:2026, basic:42000, allowances:7000,  deductions:3800, net:45200,  status:'paid',    paid_date:'2026-02-01', bank:'MCB' },
];

// ── Salary Grades ────────────────────────────────────────────────────────────
export const DUMMY_SALARY_GRADES = [
  { id:'sg-1', grade:'BPS-16', designation:'Junior Teacher',    basic_min:30000, basic_max:40000, allowances:5000, created_at:'2024-01-01', status:'active' },
  { id:'sg-2', grade:'BPS-17', designation:'Teacher',           basic_min:40000, basic_max:55000, allowances:8000, created_at:'2024-01-01', status:'active' },
  { id:'sg-3', grade:'BPS-18', designation:'Senior Teacher',    basic_min:55000, basic_max:70000, allowances:10000,created_at:'2024-01-01', status:'active' },
  { id:'sg-4', grade:'BPS-19', designation:'Head of Department',basic_min:70000, basic_max:90000, allowances:15000,created_at:'2024-01-01', status:'active' },
  { id:'sg-5', grade:'BPS-20', designation:'Principal',         basic_min:90000, basic_max:120000,allowances:20000,created_at:'2024-01-01', status:'active' },
  { id:'sg-6', grade:'BPS-15', designation:'Non-Teaching Staff',basic_min:25000, basic_max:35000, allowances:4000, created_at:'2024-01-01', status:'active' },
];

// ── Leave Requests ────────────────────────────────────────────────────────────
export const DUMMY_LEAVE_REQUESTS = [
  { id:'lr-001', staff_name:'Mr. Tariq Ahmad',  leave_type:'medical', from_date:'2026-02-10', to_date:'2026-02-12', days:3, reason:'Medical checkup',       status:'approved', approved_by:'Principal' },
  { id:'lr-002', staff_name:'Ms. Hina Butt',    leave_type:'casual',  from_date:'2026-02-18', to_date:'2026-02-18', days:1, reason:'Personal emergency',     status:'approved', approved_by:'Admin'     },
  { id:'lr-003', staff_name:'Mr. Kamran Beg',   leave_type:'annual',  from_date:'2026-03-10', to_date:'2026-03-14', days:5, reason:'Planned vacation',       status:'pending',  approved_by:null        },
  { id:'lr-004', staff_name:'Ms. Rabia Tahir',  leave_type:'medical', from_date:'2026-03-01', to_date:'2026-03-03', days:3, reason:'Unwell',                  status:'rejected', approved_by:'Principal' },
  { id:'lr-005', staff_name:'Mr. Nasir Raza',   leave_type:'casual',  from_date:'2026-03-06', to_date:'2026-03-06', days:1, reason:'Family function',        status:'pending',  approved_by:null        },
  { id:'lr-006', staff_name:'Ms. Nadia Khan',   leave_type:'annual',  from_date:'2026-03-20', to_date:'2026-03-25', days:6, reason:'Annual leave',           status:'pending',  approved_by:null        },
  { id:'lr-007', staff_name:'Mr. Asif Iqbal',   leave_type:'medical', from_date:'2026-02-25', to_date:'2026-02-26', days:2, reason:'Dental surgery',          status:'approved', approved_by:'Admin'     },
  { id:'lr-008', staff_name:'Ms. Sana Malik',   leave_type:'casual',  from_date:'2026-03-08', to_date:'2026-03-08', days:1, reason:'Family gathering',       status:'pending',  approved_by:null        },
];

// ── Reports ─────────────────────────────────────────────────────────────────
export const DUMMY_REPORTS = {
  student: {
    total: 240, active: 225, inactive: 15, new_this_month: 8,
    by_class: [
      { class:'Class 9-A', total:35, present:32 }, { class:'Class 9-B', total:33, present:30 },
      { class:'Class 10-A', total:40, present:38 }, { class:'Class 10-B', total:38, present:35 },
      { class:'Class 11', total:42, present:40 }, { class:'Class 12', total:37, present:34 },
    ],
    rows: [
      { id:'s1', name:'Ali Hassan',   class:'Class 9-A',  attendance_rate:'91%', fee_status:'paid',    gpa:'3.8' },
      { id:'s2', name:'Sara Khan',    class:'Class 9-B',  attendance_rate:'78%', fee_status:'pending', gpa:'3.5' },
      { id:'s3', name:'Umar Farooq',  class:'Class 10-A', attendance_rate:'95%', fee_status:'paid',    gpa:'4.0' },
      { id:'s4', name:'Fatima Ahmed', class:'Class 10-B', attendance_rate:'88%', fee_status:'paid',    gpa:'3.7' },
      { id:'s5', name:'Bilal Malik',  class:'Class 11',   attendance_rate:'82%', fee_status:'overdue', gpa:'3.2' },
    ],
  },
  fee: {
    total_collected: 5800000, total_pending: 1200000, total_overdue: 450000,
    collection_rate: '82%', month: 'February 2026',
    by_month: [
      { month:'Sep', collected:520000, pending:80000 }, { month:'Oct', collected:540000, pending:70000 },
      { month:'Nov', collected:510000, pending:90000 }, { month:'Dec', collected:480000, pending:120000 },
      { month:'Jan', collected:530000, pending:100000 }, { month:'Feb', collected:580000, pending:75000 },
    ],
    rows: [
      { id:'f1', student:'Ali Hassan',   class:'9-A', fee_type:'Monthly', amount:4500, status:'paid',    month:'Feb 2026' },
      { id:'f2', student:'Sara Khan',    class:'9-B', fee_type:'Monthly', amount:4500, status:'pending', month:'Feb 2026' },
      { id:'f3', student:'Umar Farooq',  class:'10-A',fee_type:'Monthly', amount:5000, status:'paid',    month:'Feb 2026' },
      { id:'f4', student:'Bilal Malik',  class:'11',  fee_type:'Monthly', amount:5500, status:'overdue', month:'Jan 2026' },
      { id:'f5', student:'Hina Raza',    class:'12',  fee_type:'Monthly', amount:5500, status:'paid',    month:'Feb 2026' },
    ],
  },
  attendance: {
    average_rate: '87%', present_today: 212, absent_today: 28, total: 240,
    by_date: [
      { date:'Mar 1', present:218, absent:22 }, { date:'Mar 2', present:220, absent:20 },
      { date:'Mar 3', present:215, absent:25 }, { date:'Mar 4', present:212, absent:28 },
      { date:'Mar 5', present:210, absent:30 },
    ],
    rows: [
      { id:'a1', name:'Ali Hassan',   class:'9-A',  present:22, absent:2,  late:1, rate:'91%' },
      { id:'a2', name:'Sara Khan',    class:'9-B',  present:18, absent:5,  late:2, rate:'78%' },
      { id:'a3', name:'Umar Farooq',  class:'10-A', present:24, absent:1,  late:0, rate:'95%' },
      { id:'a4', name:'Fatima Ahmed', class:'10-B', present:21, absent:3,  late:1, rate:'88%' },
      { id:'a5', name:'Bilal Malik',  class:'11',   present:20, absent:4,  late:1, rate:'82%' },
    ],
  },
  exam: {
    total_exams: 12, avg_pass_rate: '87%', top_scorer: 'Umar Farooq', avg_marks: 72,
    rows: [
      { id:'e1', student:'Ali Hassan',   subject:'Mathematics', marks:85, total:100, grade:'A', status:'pass' },
      { id:'e2', student:'Sara Khan',    subject:'Physics',     marks:72, total:100, grade:'B', status:'pass' },
      { id:'e3', student:'Umar Farooq',  subject:'Chemistry',   marks:95, total:100, grade:'A+',status:'pass' },
      { id:'e4', student:'Bilal Malik',  subject:'Biology',     marks:55, total:100, grade:'C', status:'pass' },
      { id:'e5', student:'Hina Raza',    subject:'English',     marks:40, total:100, grade:'F', status:'fail' },
    ],
  },
  salary: {
    total_payroll: 1850000, total_paid: 1500000, total_pending: 350000, staff_count: 28,
    rows: [
      { id:'sr1', name:'Mr. Tariq Ahmad',  designation:'Senior Teacher', basic:55000, net:60000, status:'paid' },
      { id:'sr2', name:'Ms. Hina Butt',    designation:'Teacher',        basic:45000, net:49000, status:'paid' },
      { id:'sr3', name:'Mr. Kamran Beg',   designation:'Admin',          basic:40000, net:42500, status:'pending' },
      { id:'sr4', name:'Ms. Rabia Tahir',  designation:'Accountant',     basic:38000, net:40000, status:'paid' },
      { id:'sr5', name:'Mr. Nasir Raza',   designation:'IT Support',     basic:35000, net:37200, status:'pending' },
    ],
  },
};

// ── Dashboard Stats ──────────────────────────────────────────────────────────
export const DUMMY_DASHBOARD_STATS = {
  total_students:    240, new_students: 8,
  total_teachers:    28,  active_teachers: 26,
  total_revenue:     5800000, pending_fees: 1200000,
  attendance_rate:   '87%',  today_present: 212,
  upcoming_exams:    3,  active_notices: 5,
  total_classes:     12, total_sections: 24,
  total_branches:    3,
};

export const DUMMY_CHART_DATA = {
  monthly_revenue: [
    { month:'Sep', revenue:520000 }, { month:'Oct', revenue:540000 },
    { month:'Nov', revenue:510000 }, { month:'Dec', revenue:480000 },
    { month:'Jan', revenue:530000 }, { month:'Feb', revenue:580000 },
  ],
  attendance_trend: [
    { date:'Mon', rate:89 }, { date:'Tue', rate:87 }, { date:'Wed', rate:90 },
    { date:'Thu', rate:85 }, { date:'Fri', rate:83 },
  ],
  fee_collection: { paid: 5800000, pending: 1200000, overdue: 450000 },
  student_by_class: [
    { name:'Class 9',  students:68 }, { name:'Class 10', students:78 },
    { name:'Class 11', students:42 }, { name:'Class 12', students:37 },
  ],
};

// ── Master Admin Data ─────────────────────────────────────────────────────────
export const DUMMY_MA_STATS = {
  total_institutes:     18,  active_institutes: 15,
  total_students:    12500,  students_growth: '+12%',
  total_revenue:   8500000,  revenue_growth: '+8%',
  active_subscriptions: 15,  expiring_soon: 3,
  new_this_month:       2,   churn_rate: '5%',
};

export const DUMMY_MA_SCHOOLS = [
  { id:'ma-s1',  name:'Bright Future School',       code:'BFS',  type:'school',     city:'Lahore',    contact:'info@bfs.edu.pk',   students:320, status:'active',   plan:'premium',  expires:'2027-01-01' },
  { id:'ma-s2',  name:'Excellence Academy',          code:'EA',   type:'academy',    city:'Karachi',   contact:'info@ea.edu.pk',    students:180, status:'active',   plan:'standard', expires:'2026-12-01' },
  { id:'ma-s3',  name:'National Coaching Center',   code:'NCC',  type:'coaching',   city:'Islamabad', contact:'info@ncc.edu.pk',   students:250, status:'active',   plan:'basic',    expires:'2026-08-01' },
  { id:'ma-s4',  name:'City College',                code:'CC',   type:'college',    city:'Lahore',    contact:'info@cc.edu.pk',    students:1200,status:'active',   plan:'premium',  expires:'2027-03-01' },
  { id:'ma-s5',  name:'Federal University',          code:'FU',   type:'university', city:'Islamabad', contact:'info@fu.edu.pk',    students:5000,status:'active',   plan:'enterprise',expires:'2027-06-01'},
  { id:'ma-s6',  name:'Stars School System',         code:'SSS',  type:'school',     city:'Multan',    contact:'info@sss.edu.pk',   students:480, status:'active',   plan:'standard', expires:'2026-10-01' },
  { id:'ma-s7',  name:'Knowledge Hub',               code:'KH',   type:'academy',    city:'Faisalabad',contact:'info@kh.edu.pk',    students:150, status:'suspended',plan:'basic',    expires:'2026-05-01' },
  { id:'ma-s8',  name:'Model College',               code:'MC',   type:'college',    city:'Karachi',   contact:'info@mc.edu.pk',    students:900, status:'active',   plan:'premium',  expires:'2027-02-01' },
  { id:'ma-s9',  name:'Rising Star School',          code:'RSS',  type:'school',     city:'Peshawar',  contact:'info@rss.edu.pk',   students:210, status:'active',   plan:'standard', expires:'2026-11-01' },
  { id:'ma-s10', name:'Tech Institute Pakistan',     code:'TIP',  type:'coaching',   city:'Lahore',    contact:'info@tip.edu.pk',   students:380, status:'inactive', plan:'basic',    expires:'2025-12-01' },
];

export const DUMMY_MA_SUBSCRIPTIONS = [
  { id:'sub-001', institute:'Bright Future School',    plan:'premium',    amount:25000, period:'monthly', start:'2026-01-01', end:'2027-01-01', status:'active',     payment:'paid' },
  { id:'sub-002', institute:'Excellence Academy',      plan:'standard',   amount:15000, period:'monthly', start:'2026-01-01', end:'2026-12-01', status:'active',     payment:'paid' },
  { id:'sub-003', institute:'National Coaching Center',plan:'basic',      amount:8000,  period:'monthly', start:'2026-01-01', end:'2026-08-01', status:'active',     payment:'paid' },
  { id:'sub-004', institute:'City College',            plan:'premium',    amount:25000, period:'monthly', start:'2026-01-01', end:'2027-03-01', status:'active',     payment:'paid' },
  { id:'sub-005', institute:'Federal University',      plan:'enterprise', amount:75000, period:'monthly', start:'2026-01-01', end:'2027-06-01', status:'active',     payment:'paid' },
  { id:'sub-006', institute:'Stars School System',     plan:'standard',   amount:15000, period:'monthly', start:'2025-10-01', end:'2026-10-01', status:'expiring',   payment:'paid' },
  { id:'sub-007', institute:'Knowledge Hub',           plan:'basic',      amount:8000,  period:'monthly', start:'2025-05-01', end:'2026-05-01', status:'expiring',   payment:'overdue' },
  { id:'sub-008', institute:'Tech Institute Pakistan', plan:'basic',      amount:8000,  period:'monthly', start:'2025-01-01', end:'2025-12-01', status:'expired',    payment:'overdue' },
];

export const DUMMY_MA_SUBSCRIPTION_TEMPLATES = [
  { id:'tpl-1', name:'Basic',      price:8000,  period:'monthly', features:['50 students','1 branch','Basic reports','Email support'], popular:false },
  { id:'tpl-2', name:'Standard',   price:15000, period:'monthly', features:['200 students','3 branches','Advanced reports','Priority support','SMS alerts'], popular:true },
  { id:'tpl-3', name:'Premium',    price:25000, period:'monthly', features:['Unlimited students','Unlimited branches','All reports','24/7 support','Custom branding'], popular:false },
  { id:'tpl-4', name:'Enterprise', price:75000, period:'monthly', features:['Multi-institute','API access','White labeling','Dedicated support','Custom features'], popular:false },
];

export const DUMMY_MA_USERS = [
  { id:'ma-u1', first_name:'Zahid',  last_name:'Hassan',  email:'zahid@bfs.edu.pk',    phone:'0300-1111111', role:'admin',    institute:'Bright Future School',    status:'active',   last_login:'2026-03-05' },
  { id:'ma-u2', first_name:'Amna',   last_name:'Malik',   email:'amna@ea.edu.pk',      phone:'0311-2222222', role:'admin',    institute:'Excellence Academy',      status:'active',   last_login:'2026-03-04' },
  { id:'ma-u3', first_name:'Tariq',  last_name:'Shah',    email:'tariq@ncc.edu.pk',    phone:'0333-3333333', role:'admin',    institute:'National Coaching',       status:'active',   last_login:'2026-03-03' },
  { id:'ma-u4', first_name:'Hina',   last_name:'Butt',    email:'hina@bfs.edu.pk',     phone:'0321-4444444', role:'teacher',  institute:'Bright Future School',    status:'active',   last_login:'2026-03-05' },
  { id:'ma-u5', first_name:'Kamran', last_name:'Beg',     email:'kamran@cc.edu.pk',    phone:'0345-5555555', role:'admin',    institute:'City College',            status:'active',   last_login:'2026-03-02' },
  { id:'ma-u6', first_name:'Rabia',  last_name:'Tahir',   email:'rabia@fu.edu.pk',     phone:'0312-6666666', role:'teacher',  institute:'Federal University',      status:'inactive', last_login:'2026-02-28' },
  { id:'ma-u7', first_name:'Nasir',  last_name:'Raza',    email:'nasir@sss.edu.pk',    phone:'0300-7777777', role:'accountant',institute:'Stars School System',     status:'active',   last_login:'2026-03-01' },
  { id:'ma-u8', first_name:'Sara',   last_name:'Khan',    email:'sara@kh.edu.pk',      phone:'0322-8888888', role:'admin',    institute:'Knowledge Hub',           status:'suspended',last_login:'2026-01-15' },
  { id:'ma-u9', first_name:'Ali',    last_name:'Ahmed',   email:'ali@mc.edu.pk',       phone:'0315-9999999', role:'teacher',  institute:'Model College',           status:'active',   last_login:'2026-03-04' },
  { id:'ma-u10',first_name:'Nadia',  last_name:'Anwar',   email:'nadia@rss.edu.pk',    phone:'0301-0000000', role:'admin',    institute:'Rising Star School',      status:'active',   last_login:'2026-03-03' },
];

// ──────────────────────────────────────────────────────────────────────────────
// 9 ▸ DEMO LOGIN FUNCTION (Updated)
// ──────────────────────────────────────────────────────────────────────────────
export function dummyLogin({ school_code, institute_code, email, password }) {
  // Accept both field names (form sends school_code, old code used institute_code)
  const code = (school_code || institute_code || '').trim().toLowerCase();
  const emailLower = (email || '').trim().toLowerCase();

  const user = DUMMY_USERS.find((u) => {
    const emailMatch    = u.email.toLowerCase() === emailLower;
    const passwordMatch = u.password === password;
    // Master Admin has no institute code — match by email+password only
    if (u.role_code === 'MASTER_ADMIN') return emailMatch && passwordMatch;
    // All other users must also match institute code
    return u.institute_code?.toLowerCase() === code && emailMatch && passwordMatch;
  });

  if (!user) throw new Error('Invalid credentials. Check institute code, email and password.');

  const institute = DUMMY_INSTITUTES.find((i) => i.id === user.institute_id);

  return {
    user: {
      id:             user.id,
      first_name:     user.first_name,
      last_name:      user.last_name,
      email:          user.email,
      role_code:      user.role_code,
      role:           user.role,
      institute_id:   user.institute_id,
      institute:      institute,
      institute_type: institute?.institute_type,
      permissions:    user.permissions || user.role?.permissions || [],
    },
    access_token: `dummy-token-${user.id}-${Date.now()}`,
  };
}

// ──────────────────────────────────────────────────────────────────────────────
// 10 ▸ HELPER — paginate array (for service fallback)
// ──────────────────────────────────────────────────────────────────────────────
export function paginate(arr, page = 1, limit = 20) {
  const total      = arr.length;
  const totalPages = Math.max(1, Math.ceil(total / limit));
  const rows       = arr.slice((page - 1) * limit, page * limit);
  return { data: { rows, total, page, totalPages } };
}

// data/dummyData.js - Add these new dummy data arrays

export const DUMMY_INVOICES = [
  {
    id: 'inv-1',
    invoice_number: 'INV-SCH001-202403-1234',
    institute_id: 'school-1',
    institute_name: 'City Public School',
    amount: 5000,
    tax_amount: 900,
    total_amount: 5900,
    status: 'PAID',
    due_date: '2024-04-05T00:00:00Z',
    period_start: '2024-03-01T00:00:00Z',
    period_end: '2024-03-31T00:00:00Z',
    billing_cycle: 'MONTHLY',
    payment_method: 'bank_transfer',
    paid_at: '2024-03-15T10:30:00Z',
    created_at: '2024-03-01T00:00:00Z',
  },
  {
    id: 'inv-2',
    invoice_number: 'INV-SCH001-202404-5678',
    institute_id: 'school-1',
    institute_name: 'City Public School',
    amount: 5000,
    tax_amount: 900,
    total_amount: 5900,
    status: 'PENDING',
    due_date: '2024-05-08T00:00:00Z',
    period_start: '2024-04-01T00:00:00Z',
    period_end: '2024-04-30T00:00:00Z',
    billing_cycle: 'MONTHLY',
    created_at: '2024-04-01T00:00:00Z',
  },
  {
    id: 'inv-3',
    invoice_number: 'INV-SCH002-202403-9012',
    institute_id: 'school-2',
    institute_name: 'Green Valley College',
    amount: 8000,
    tax_amount: 1440,
    total_amount: 9440,
    status: 'OVERDUE',
    due_date: '2024-04-05T00:00:00Z',
    period_start: '2024-03-01T00:00:00Z',
    period_end: '2024-03-31T00:00:00Z',
    billing_cycle: 'MONTHLY',
    created_at: '2024-03-01T00:00:00Z',
  },
];

export const DUMMY_SUBSCRIPTION_HISTORY = [
  {
    id: 'sub-hist-1',
    plan_id: 'plan-1',
    plan_name: 'Basic',
    plan_price: 5000,
    status: 'active',
    start_date: '2024-01-01T00:00:00Z',
    end_date: null,
    changed_at: '2024-01-01T00:00:00Z',
    changed_by: 'admin@cloudsacademy.com',
    reason: 'Initial subscription'
  },
  {
    id: 'sub-hist-2',
    plan_id: 'plan-2',
    plan_name: 'Standard',
    plan_price: 8000,
    status: 'ended',
    start_date: '2023-06-01T00:00:00Z',
    end_date: '2023-12-31T00:00:00Z',
    changed_at: '2024-01-01T00:00:00Z',
    changed_by: 'admin@cloudsacademy.com',
    reason: 'Upgraded to Basic plan'
  }
];


// ──────────────────────────────────────────────────────────────────────────────
// 11 ▸ EXPORT ALL
// ──────────────────────────────────────────────────────────────────────────────
export default {
  INSTITUTE_TYPES,
  DUMMY_INSTITUTES,
  DUMMY_SCHOOL_CLASSES,
  DUMMY_SCHOOL_SECTIONS,
  DUMMY_COACHING_COURSES,
  DUMMY_COACHING_BATCHES,
  DUMMY_ACADEMY_PROGRAMS,
  DUMMY_ACADEMY_BATCHES,
  DUMMY_COLLEGE_DEPARTMENTS,
  DUMMY_COLLEGE_PROGRAMS,
  DUMMY_COLLEGE_SEMESTERS,
  DUMMY_UNIVERSITY_FACULTIES,
  DUMMY_UNIVERSITY_DEPARTMENTS,
  DUMMY_SUBJECTS,
  DUMMY_TEACHERS,
  DUMMY_STUDENTS,
  ATTENDANCE_TYPES,
  DUMMY_ROLES,
  DUMMY_USERS,
  ALL_PERMISSIONS,
  // ── New flat/portal data ──
  DUMMY_ACADEMIC_YEARS,
  DUMMY_BRANCHES,
  DUMMY_CLASSES,
  DUMMY_SECTIONS,
  DUMMY_FLAT_STUDENTS,
  DUMMY_FLAT_TEACHERS,
  DUMMY_ADMISSIONS,
  DUMMY_PARENTS,
  DUMMY_EXAMS,
  DUMMY_FLAT_SUBJECTS,
  DUMMY_FEES,
  DUMMY_FEE_TEMPLATES,
  DUMMY_PAYROLL,
  DUMMY_NOTICES,
  DUMMY_ATTENDANCE,
  DUMMY_STAFF_ATTENDANCE,
  DUMMY_TIMETABLE,
  DUMMY_PROGRAMS,
  DUMMY_SEMESTERS,
  DUMMY_FACULTIES,
  DUMMY_DEPARTMENTS,
  DUMMY_RESEARCH,
  DUMMY_INVOICES,
  DUMMY_SUBSCRIPTION_HISTORY,
  dummyLogin,
  paginate
};