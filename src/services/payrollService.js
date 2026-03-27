/**
 * Payroll API Service (HR & Payroll)
 * GET    /payroll/payslips                   (list payslips)
 * POST   /payroll/payslips/generate          (auto-generate for month)
 * GET    /payroll/payslips/:id               (single)
 * PATCH  /payroll/payslips/:id/pay           (mark as paid)
 * GET    /payroll/salary-grades              (salary grade configs)
 * POST   /payroll/salary-grades              (create grade)
 * PUT    /payroll/salary-grades/:id          (update grade)
 * GET    /payroll/leave-requests             (list leave requests)
 * POST   /payroll/leave-requests             (apply leave)
 * PATCH  /payroll/leave-requests/:id/approve (approve)
 * PATCH  /payroll/leave-requests/:id/reject  (reject)
 */

import api from '@/lib/api';
import { buildQuery } from '@/lib/utils';
import { withFallback } from '@/lib/withFallback';
import { DUMMY_PAYSLIPS, DUMMY_SALARY_GRADES, DUMMY_LEAVE_REQUESTS, paginate } from '@/data/dummyData';

export const payrollService = {
  // ── Payslips ──────────────────────────────────────────────────────────────
  getPayslips: (filters = {}) =>
    withFallback(
      () => api.get(`/payroll/payslips${buildQuery(filters)}`).then((r) => r.data),
      () => {
        let data = [...DUMMY_PAYSLIPS];
        if (filters.month)      data = data.filter((p) => p.month === Number(filters.month));
        if (filters.year)       data = data.filter((p) => p.year  === Number(filters.year));
        if (filters.teacher_id) data = data.filter((p) => p.teacher_id === filters.teacher_id);
        if (filters.status)     data = data.filter((p) => p.status     === filters.status);
        return paginate(data, filters.page, filters.limit);
      },
    ),

  getPayslipById: (id) =>
    withFallback(
      () => api.get(`/payroll/payslips/${id}`).then((r) => r.data),
      () => ({ data: DUMMY_PAYSLIPS.find((p) => p.id === id) ?? null }),
    ),

  // body: { month, year } — auto-generates for all active teachers
  generatePayroll: (body) =>
    withFallback(
      () => api.post('/payroll/payslips/generate', body).then((r) => r.data),
      () => ({
        data: {
          generated: 12,
          month: body.month,
          year: body.year,
          total_amount: 797640,
          status: 'generated',
        },
      }),
    ),

  // body: { paid_on, payment_method }
  markPaid: (id, body) =>
    withFallback(
      () => api.patch(`/payroll/payslips/${id}/pay`, body).then((r) => r.data),
      () => ({ data: { id, status: 'paid', paid_on: body.paid_on ?? new Date().toISOString().split('T')[0] } }),
    ),

  // ── Salary Grades ────────────────────────────────────────────────────────
  getSalaryGrades: () =>
    withFallback(
      () => api.get('/payroll/salary-grades').then((r) => r.data),
      () => ({ data: { rows: DUMMY_SALARY_GRADES, total: DUMMY_SALARY_GRADES.length } }),
    ),

  createSalaryGrade: (body) =>
    withFallback(
      () => api.post('/payroll/salary-grades', body).then((r) => r.data),
      () => ({ data: { ...body, id: `sg-${Date.now()}` } }),
    ),

  updateSalaryGrade: (id, body) =>
    withFallback(
      () => api.put(`/payroll/salary-grades/${id}`, body).then((r) => r.data),
      () => ({ data: { id, ...body } }),
    ),

  // ── Leave Requests ───────────────────────────────────────────────────────
  getLeaveRequests: (filters = {}) =>
    withFallback(
      () => api.get(`/payroll/leave-requests${buildQuery(filters)}`).then((r) => r.data),
      () => {
        let data = [...DUMMY_LEAVE_REQUESTS];
        if (filters.status)     data = data.filter((l) => l.status     === filters.status);
        if (filters.teacher_id) data = data.filter((l) => l.teacher_id === filters.teacher_id);
        if (filters.leave_type) data = data.filter((l) => l.leave_type === filters.leave_type);
        return paginate(data, filters.page, filters.limit);
      },
    ),

  // body: { teacher_id, leave_type, from_date, to_date, reason }
  applyLeave: (body) =>
    withFallback(
      () => api.post('/payroll/leave-requests', body).then((r) => r.data),
      () => ({
        data: {
          ...body,
          id: `lv-${Date.now()}`,
          status: 'pending',
          approved_by: null,
          created_at: new Date().toISOString(),
        },
      }),
    ),

  approveLeave: (id) =>
    withFallback(
      () => api.patch(`/payroll/leave-requests/${id}/approve`).then((r) => r.data),
      () => ({ data: { id, status: 'approved' } }),
    ),

  rejectLeave: (id, body = {}) =>
    withFallback(
      () => api.patch(`/payroll/leave-requests/${id}/reject`, body).then((r) => r.data),
      () => ({ data: { id, status: 'rejected' } }),
    ),
};
