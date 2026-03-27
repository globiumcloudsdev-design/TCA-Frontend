/**
 * Staff Attendance API Service
 * GET    /staff-attendance                   (list — filter by date, teacher_id, status)
 * POST   /staff-attendance/mark              (bulk mark for a date)
 * GET    /staff-attendance/summary           (monthly summary)
 * PATCH  /staff-attendance/:id              (update single record)
 */

import api from '@/lib/api';
import { buildQuery } from '@/lib/utils';
import { withFallback } from '@/lib/withFallback';
import { DUMMY_STAFF_ATTENDANCE, paginate } from '@/data/dummyData';

export const staffAttendanceService = {
  // filters: { date, teacher_id, status, month, year, page, limit }
  getAll: (filters = {}) =>
    withFallback(
      () => api.get(`/staff-attendance${buildQuery(filters)}`).then((r) => r.data),
      () => {
        let data = [...DUMMY_STAFF_ATTENDANCE];
        if (filters.date)       data = data.filter((a) => a.date       === filters.date);
        if (filters.teacher_id) data = data.filter((a) => a.teacher_id === filters.teacher_id);
        if (filters.status)     data = data.filter((a) => a.status     === filters.status);
        return paginate(data, filters.page, filters.limit);
      },
    ),

  getSummary: (filters = {}) =>
    withFallback(
      () => api.get(`/staff-attendance/summary${buildQuery(filters)}`).then((r) => r.data),
      () => {
        const data = DUMMY_STAFF_ATTENDANCE;
        const summary = {
          total: data.length,
          present: data.filter((a) => a.status === 'present').length,
          absent:  data.filter((a) => a.status === 'absent').length,
          late:    data.filter((a) => a.status === 'late').length,
          leave:   data.filter((a) => a.status === 'leave').length,
        };
        return { data: summary };
      },
    ),

  // body: { date, records: [{ teacher_id, status, check_in?, check_out? }] }
  markBulk: (body) =>
    withFallback(
      () => api.post('/staff-attendance/mark', body).then((r) => r.data),
      () => ({ data: { date: body.date, marked: body.records?.length ?? 0 } }),
    ),

  update: (id, body) =>
    withFallback(
      () => api.patch(`/staff-attendance/${id}`, body).then((r) => r.data),
      () => ({ data: { id, ...body } }),
    ),
};
