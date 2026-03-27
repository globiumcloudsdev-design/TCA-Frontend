/**
 * Attendance API Service
 * GET   /attendance?class_id=&date=
 * POST  /attendance/bulk              (mark for a whole class)
 * GET   /attendance/student/:id       (student's attendance history)
 * GET   /attendance/summary/:classId  (class attendance summary)
 */

import api from '@/lib/api';
import { buildQuery } from '@/lib/utils';

export const attendanceService = {
  // Get attendance for a class on a date
  getByClassDate: (classId, date, filters = {}) =>
    api.get(`/attendance${buildQuery({ class_id: classId, date, ...filters })}`).then((r) => r.data),

  // Bulk mark attendance for a class
  // records: [{ student_id, status, section_id?, remarks? }, ...]
  bulkMark: (data) => api.post('/attendance/bulk', data).then((r) => r.data),

  // Student attendance history
  // filters: { from_date, to_date, academic_year_id }
  getStudentHistory: (studentId, filters = {}) =>
    api.get(`/attendance/student/${studentId}${buildQuery(filters)}`).then((r) => r.data),

  // Class attendance summary (present%, absent count, etc.)
  getSummary: (classId, filters = {}) =>
    api.get(`/attendance/summary/${classId}${buildQuery(filters)}`).then((r) => r.data),
};
