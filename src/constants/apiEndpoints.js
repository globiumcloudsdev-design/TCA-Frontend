/**
 * ─────────────────────────────────────────────────────────────────
 *  API ENDPOINTS — The Clouds Academy
 *  All backend routes in one place.
 *  Base URL is read from NEXT_PUBLIC_API_URL (.env.local)
 *
 *  Helper:  endpoint(path, params)
 *    e.g.  endpoint(API.STUDENTS.BY_ID, { id: '123' })
 *          → '/students/123'
 * ─────────────────────────────────────────────────────────────────
 */

/** Replaces :param tokens in a path string */
export const endpoint = (path, params = {}) =>
  Object.entries(params).reduce(
    (acc, [key, val]) => acc.replace(`:${key}`, val),
    path,
  );

// ─────────────────────────────────────────────────────────────────
//  AUTH
// ─────────────────────────────────────────────────────────────────
export const AUTH = {
  LOGIN:           '/auth/login',           // POST  { school_code, email, password }
  LOGOUT:          '/auth/logout',          // POST
  REFRESH:         '/auth/refresh',         // POST  (uses httpOnly refresh cookie)
  ME:              '/auth/me',              // GET   → { user }
  FORGOT_PASSWORD: '/auth/forgot-password', // POST  { email, school_code }
  RESET_PASSWORD:  '/auth/reset-password',  // POST  { token, new_password }
};

// ─────────────────────────────────────────────────────────────────
//  DASHBOARD
// ─────────────────────────────────────────────────────────────────
export const DASHBOARD = {
  STATS: '/dashboard', // GET → { total_students, total_teachers, pending_fees_amount, today_attendance_pct }
};

// ─────────────────────────────────────────────────────────────────
//  STUDENTS
// ─────────────────────────────────────────────────────────────────
export const STUDENTS = {
  LIST:       '/students',               // GET    ?page&limit&search&class_id&section_id&academic_year_id&is_active
  CREATE:     '/students',               // POST   { first_name, last_name, gr_number, dob, gender, ... }
  BY_ID:      '/students/:id',           // GET
  UPDATE:     '/students/:id',           // PUT
  DELETE:     '/students/:id',           // DELETE (soft)
  PHOTO:      '/students/:id/photo',     // POST   multipart/form-data
};

// ─────────────────────────────────────────────────────────────────
//  TEACHERS
// ─────────────────────────────────────────────────────────────────
export const TEACHERS = {
  LIST:       '/teachers',               // GET    ?page&limit&search&branch_id&is_active
  CREATE:     '/teachers',               // POST   { first_name, last_name, email, phone, employee_id, ... }
  BY_ID:      '/teachers/:id',           // GET
  UPDATE:     '/teachers/:id',           // PUT
  DELETE:     '/teachers/:id',           // DELETE (soft)
  PHOTO:      '/teachers/:id/photo',     // POST   multipart/form-data
};

// ─────────────────────────────────────────────────────────────────
//  CLASSES
// ─────────────────────────────────────────────────────────────────
export const CLASSES = {
  LIST:       '/classes',                // GET    ?academic_year_id&branch_id&is_active
  CREATE:     '/classes',               // POST   { name, grade_level, academic_year_id, branch_id?, class_teacher_id? }
  BY_ID:      '/classes/:id',           // GET
  UPDATE:     '/classes/:id',           // PUT
  DELETE:     '/classes/:id',           // DELETE (soft)
};

// ─────────────────────────────────────────────────────────────────
//  SECTIONS  (nested under classes)
// ─────────────────────────────────────────────────────────────────
export const SECTIONS = {
  LIST:       '/classes/:classId/sections',           // GET    ?academic_year_id&is_active
  CREATE:     '/classes/:classId/sections',           // POST   { name, capacity, room_number?, section_teacher_id?, academic_year_id }
  BY_ID:      '/classes/:classId/sections/:id',       // GET
  UPDATE:     '/classes/:classId/sections/:id',       // PUT
  DELETE:     '/classes/:classId/sections/:id',       // DELETE (soft)
};

// ─────────────────────────────────────────────────────────────────
//  SUBJECTS
// ─────────────────────────────────────────────────────────────────
export const SUBJECTS = {
  LIST:     '/subjects',              // GET    ?class_id&search&page&limit
  CREATE:   '/subjects',              // POST   { name, code, class_id, teacher_id?, description?, is_active? }
  BY_ID:    '/subjects/:id',          // GET
  UPDATE:   '/subjects/:id',          // PUT
  DELETE:   '/subjects/:id',          // DELETE (soft)
  SYLLABUS: '/subjects/:id/syllabus', // GET / PUT  { syllabus_type, syllabus_content? } or multipart
};

// ─────────────────────────────────────────────────────────────────
//  ACADEMIC YEARS
// ─────────────────────────────────────────────────────────────────
export const ACADEMIC_YEARS = {
  LIST:        '/academic-years',              // GET    ?is_active&is_current
  CREATE:      '/academic-years',              // POST   { name, start_date, end_date, is_current?, description? }
  BY_ID:       '/academic-years/:id',          // GET
  UPDATE:      '/academic-years/:id',          // PUT
  DELETE:      '/academic-years/:id',          // DELETE (soft)
  SET_CURRENT: '/academic-years/:id/set-current', // PATCH  (sets as current, demotes others)
};

// ─────────────────────────────────────────────────────────────────
//  ATTENDANCE
// ─────────────────────────────────────────────────────────────────
export const ATTENDANCE = {
  LIST:            '/attendance',                         // GET    ?class_id&date&section_id
  BULK_MARK:       '/attendance/bulk',                    // POST   { class_id, date, academic_year_id, records: [{ student_id, status, remarks? }] }
  STUDENT_HISTORY: '/attendance/student/:studentId',      // GET    ?from_date&to_date&academic_year_id
  CLASS_SUMMARY:   '/attendance/summary/:classId',        // GET    ?from_date&to_date&academic_year_id
};

// ─────────────────────────────────────────────────────────────────
//  EXAMS
// ─────────────────────────────────────────────────────────────────
export const EXAMS = {
  LIST:       '/exams',                     // GET    ?class_id&type&academic_year_id&is_published
  CREATE:     '/exams',                     // POST   { name, type, class_id, academic_year_id, start_date, end_date, total_marks, pass_percentage }
  BY_ID:      '/exams/:id',                 // GET
  UPDATE:     '/exams/:id',                 // PUT
  DELETE:     '/exams/:id',                 // DELETE (soft)
  PUBLISH:    '/exams/:id/publish',         // PATCH  (toggle published)
  RESULTS:    '/exams/:id/results',         // GET    + POST { results: [{ student_id, subject_id, marks_obtained, is_absent?, remarks? }] }
};

// ─────────────────────────────────────────────────────────────────
//  FEES
// ─────────────────────────────────────────────────────────────────
export const FEES = {
  VOUCHERS:         '/fees/vouchers',                  // GET    ?student_id&status&month&year&academic_year_id&page&limit
  CREATE_VOUCHER:   '/fees/vouchers',                  // POST   { student_id, amount, month, year, due_date, academic_year_id, discount?, notes? }
  VOUCHER_BY_ID:    '/fees/vouchers/:id',              // GET
  UPDATE_VOUCHER:   '/fees/vouchers/:id',              // PUT
  COLLECT:          '/fees/vouchers/:id/collect',      // PATCH  { amount_paid, payment_method, transaction_id?, notes? }
  PAYMENTS:         '/fees/payments',                  // GET    ?student_id&month&year&payment_method
};

// ─────────────────────────────────────────────────────────────────
//  ROLES  (Dynamic Role System)
// ─────────────────────────────────────────────────────────────────
export const ROLES = {
  LIST:            '/roles',                        // GET
  CREATE:          '/roles',                        // POST   { name, code, description? }
  BY_ID:           '/roles/:id',                    // GET
  UPDATE:          '/roles/:id',                    // PUT
  DELETE:          '/roles/:id',                    // DELETE
  ALL_PERMISSIONS: '/roles/permissions',            // GET    → grouped list of all permission codes
  SET_PERMISSIONS: '/roles/:id/permissions',        // POST   { permission_ids: [...] }
  ASSIGN_TO_USERS: '/roles/:id/assign',             // POST   { user_ids: [...] }
};

// ─────────────────────────────────────────────────────────────────
//  SCHOOL (current school — header: X-School-Code)
// ─────────────────────────────────────────────────────────────────
export const SCHOOL = {
  PROFILE:       '/schools/profile',         // GET
  UPDATE:        '/schools/settings',        // PATCH  { name, has_branches, ... }
  ASSIGN_ROLE:   '/schools/assign-role',     // PATCH  { role_id }
  REMOVE_ROLE:   '/schools/assign-role',     // DELETE
};

// ─────────────────────────────────────────────────────────────────
//  USERS  (school-scoped users)
// ─────────────────────────────────────────────────────────────────
export const USERS = {
  LIST:         '/users',                    // GET    ?page&limit&role_id&branch_id&is_active&search
  CREATE:       '/users',                    // POST   { first_name, last_name, email, password, role_id, branch_id?, phone? }
  BY_ID:        '/users/:id',               // GET
  UPDATE:       '/users/:id',               // PUT
  ASSIGN_ROLE:  '/users/:id/assign-role',   // PATCH  { role_id }
  TOGGLE_STATUS:'/users/:id/status',        // PATCH  { is_active }
  DELETE:       '/users/:id',               // DELETE (soft)
};

// ─────────────────────────────────────────────────────────────────
//  NOTIFICATIONS
// ─────────────────────────────────────────────────────────────────
export const NOTIFICATIONS = {
  LIST:       '/notifications',              // GET    ?is_read&page&limit
  MARK_READ:  '/notifications/:id/read',    // PATCH
  MARK_ALL:   '/notifications/read-all',    // PATCH
  DELETE:     '/notifications/:id',         // DELETE
};

// ─────────────────────────────────────────────────────────────────
//  MASTER ADMIN  (requires MASTER_ADMIN role)
// ─────────────────────────────────────────────────────────────────
export const MASTER_ADMIN = {
  // Stats
  STATS:                   '/master-admin/stats',                    // GET

  // Schools
  SCHOOLS_LIST:            '/master-admin/schools',                  // GET    ?page&limit&search&is_active
  SCHOOLS_CREATE:          '/master-admin/schools',                  // POST   { name, code, admin_email, admin_password, has_branches, subscription_plan }
  SCHOOLS_BY_ID:           '/master-admin/schools/:id',              // GET
  SCHOOLS_UPDATE:          '/master-admin/schools/:id',              // PUT
  SCHOOLS_TOGGLE_STATUS:   '/master-admin/schools/:id/status',       // PATCH  { is_active }
  SCHOOLS_DELETE:          '/master-admin/schools/:id',              // DELETE

  // Subscriptions
  SUBSCRIPTIONS_LIST:      '/master-admin/subscriptions',            // GET    ?school_id&status
  SUBSCRIPTIONS_CREATE:    '/master-admin/subscriptions',            // POST   { school_id, plan, start_date, end_date, amount }
  SUBSCRIPTIONS_BY_ID:     '/master-admin/subscriptions/:id',        // GET
  SUBSCRIPTIONS_UPDATE:    '/master-admin/subscriptions/:id',        // PUT
  SUBSCRIPTIONS_CANCEL:    '/master-admin/subscriptions/:id/cancel', // PATCH

  // Platform Users
  USERS_LIST:              '/master-admin/users',                    // GET    ?page&limit&search
  USERS_BY_ID:             '/master-admin/users/:id',                // GET

  // Subscription Templates
  SUB_TEMPLATES_LIST:      '/master-admin/subscription-templates',       // GET    ?page&limit
  SUB_TEMPLATES_CREATE:    '/master-admin/subscription-templates',       // POST   { name, price_monthly, duration_months, max_students?, max_teachers?, features[] }
  SUB_TEMPLATES_BY_ID:     '/master-admin/subscription-templates/:id',  // GET
  SUB_TEMPLATES_UPDATE:    '/master-admin/subscription-templates/:id',  // PUT
  SUB_TEMPLATES_DELETE:    '/master-admin/subscription-templates/:id',  // DELETE
};

// ─────────────────────────────────────────────────────────────────
//  SOCKET EVENTS (reference for useSocket.js)
// ─────────────────────────────────────────────────────────────────
export const SOCKET_EVENTS = {
  // Client → Server
  JOIN_SCHOOL:      'join:school',
  JOIN_BRANCH:      'join:branch',

  // Server → Client
  NOTIFICATION:     'notification',
  FEE_PAID:         'fee:paid',
  ATTENDANCE_DONE:  'attendance:done',
};

// ─────────────────────────────────────────────────────────────────
//  DEFAULT EXPORT  (grouped)
// ─────────────────────────────────────────────────────────────────
const API_ENDPOINTS = {
  AUTH,
  DASHBOARD,
  STUDENTS,
  TEACHERS,
  CLASSES,
  SECTIONS,
  ACADEMIC_YEARS,
  ATTENDANCE,
  EXAMS,
  FEES,
  ROLES,
  SCHOOL,
  USERS,
  NOTIFICATIONS,
  MASTER_ADMIN,
  SOCKET_EVENTS,
};

export default API_ENDPOINTS;
