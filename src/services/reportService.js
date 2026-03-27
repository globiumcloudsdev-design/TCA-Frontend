/**
 * Reports API Service
 * GET /reports/student     — Student report with filters
 * GET /reports/fee         — Fee collection report
 * GET /reports/attendance  — Attendance report
 * GET /reports/salary      — Salary / Payroll report
 * GET /reports/exam        — Exam results report
 * GET /reports/export      — Export any report as PDF/Excel
 */

import api from '@/lib/api';
import { buildQuery } from '@/lib/utils';
import { withFallback } from '@/lib/withFallback';
import { DUMMY_REPORTS } from '@/data/dummyData';

export const reportService = {
  getStudentReport: (filters = {}) =>
    withFallback(
      () => api.get(`/reports/student${buildQuery(filters)}`).then((r) => r.data),
      () => ({ data: DUMMY_REPORTS.student }),
    ),

  getFeeReport: (filters = {}) =>
    withFallback(
      () => api.get(`/reports/fee${buildQuery(filters)}`).then((r) => r.data),
      () => ({ data: DUMMY_REPORTS.fee }),
    ),

  getAttendanceReport: (filters = {}) =>
    withFallback(
      () => api.get(`/reports/attendance${buildQuery(filters)}`).then((r) => r.data),
      () => ({ data: DUMMY_REPORTS.attendance }),
    ),

  getSalaryReport: (filters = {}) =>
    withFallback(
      () => api.get(`/reports/salary${buildQuery(filters)}`).then((r) => r.data),
      () => ({ data: DUMMY_REPORTS.salary }),
    ),

  getExamReport: (filters = {}) =>
    withFallback(
      () => api.get(`/reports/exam${buildQuery(filters)}`).then((r) => r.data),
      () => ({ data: { message: 'Exam report not yet available in demo mode.' } }),
    ),

  // Export — returns a URL or blob
  // body: { report_type, format: 'pdf'|'excel', filters }
  exportReport: (body) =>
    withFallback(
      () => api.post('/reports/export', body, { responseType: 'blob' }).then((r) => r.data),
      () => ({ data: { message: 'Export not available in demo mode.' } }),
    ),
};
