/**
 * Staff Attendance API Service
 * Backend routes:
 * GET    /staff-attendance
 * GET    /staff-attendance/report
 * POST   /staff-attendance
 * POST   /staff-attendance/bulk
 * GET    /staff-attendance/:id
 * PUT    /staff-attendance/:id
 * DELETE /staff-attendance/:id
 */

import api from '@/lib/api';
import { buildQuery } from '@/lib/utils';
import { withFallback } from '@/lib/withFallback';
import { DUMMY_STAFF_ATTENDANCE, paginate } from '@/data/dummyData';

const STATUS_UPPER = {
  present: 'PRESENT',
  absent: 'ABSENT',
  late: 'LATE',
  leave: 'LEAVE',
  holiday: 'HOLIDAY',
  weekend: 'WEEKEND',
};

const STATUS_LOWER = {
  PRESENT: 'present',
  ABSENT: 'absent',
  LATE: 'late',
  LEAVE: 'leave',
  HOLIDAY: 'holiday',
  WEEKEND: 'weekend',
};

const toUpperStatus = (value) => {
  if (!value) return undefined;
  const normalized = String(value).trim().toLowerCase();
  return STATUS_UPPER[normalized] || String(value).trim().toUpperCase();
};

const toLowerStatus = (value) => {
  if (!value) return value;
  return STATUS_LOWER[String(value).trim().toUpperCase()] || String(value).trim().toLowerCase();
};

const normalizeDate = (value) => {
  if (!value) return undefined;
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return undefined;
  return d.toISOString().slice(0, 10);
};

const normalizeRecord = (row = {}) => {
  const staff = row.staff || {};
  const firstName = staff.first_name || row.first_name || '';
  const lastName = staff.last_name || row.last_name || '';
  const fullName = `${firstName} ${lastName}`.trim();

  return {
    ...row,
    id: row.id,
    staff_id: row.staff_id || row.teacher_id || staff.id,
    teacher_id: row.teacher_id || row.staff_id || staff.id,
    name: row.name || fullName || row.employee_name || 'Unknown',
    teacher_name: row.teacher_name || fullName || row.employee_name || 'Unknown',
    employee_name: row.employee_name || fullName || row.name || 'Unknown',
    employee_id: row.employee_id || row.staff?.employee_id || row.staff_id,
    role: row.role || staff.user_type || staff.staff_type || row.designation || '-',
    staff_type: row.staff_type || staff.staff_type || row.role || undefined,
    branch_name: row.branch_name || row.branch?.name || undefined,
    date: normalizeDate(row.date) || row.date,
    status: toLowerStatus(row.status),
    check_in: row.check_in || null,
    check_out: row.check_out || null,
  };
};

const normalizeListResponse = (responseData = {}) => {
  const rows = Array.isArray(responseData.data)
    ? responseData.data.map(normalizeRecord)
    : [];

  const pagination = responseData.pagination || {};
  return {
    ...responseData,
    data: {
      rows,
      total: pagination.total ?? rows.length,
      page: pagination.page ?? 1,
      limit: pagination.limit ?? rows.length,
      totalPages: pagination.totalPages ?? 1,
    },
  };
};

const normalizeFilters = (filters = {}) => {
  const query = {
    page: filters.page,
    limit: filters.limit,
    sortBy: filters.sortBy,
    sortOrder: filters.sortOrder,
    staff_id: filters.staff_id || filters.teacher_id,
    branch_id: filters.branch_id,
    staff_type: filters.staff_type,
  };

  const status = toUpperStatus(filters.status);
  if (status) query.status = status;

  if (filters.date) {
    query.date_from = filters.date;
    query.date_to = filters.date;
  }

  if (filters.date_from) query.date_from = filters.date_from;
  if (filters.date_to) query.date_to = filters.date_to;

  return query;
};

const normalizeCreatePayload = (body = {}) => ({
  staff_id: body.staff_id || body.teacher_id,
  date: body.date,
  status: toUpperStatus(body.status) || 'PRESENT',
  check_in: body.check_in || null,
  check_out: body.check_out || null,
  remarks: body.remarks || '',
  branch_id: body.branch_id || undefined,
  leave_type_id: body.leave_type_id || null,
  leave_request_id: body.leave_request_id || null,
  late_minutes: body.late_minutes ?? 0,
  early_exit_minutes: body.early_exit_minutes ?? 0,
  overtime_minutes: body.overtime_minutes ?? 0,
});

export const staffAttendanceService = {
  // filters: { date, date_from, date_to, staff_id, teacher_id, status, staff_type, page, limit }
  getAll: (filters = {}) =>
    withFallback(
      () => api.get(`/staff-attendance${buildQuery(normalizeFilters(filters))}`).then((r) => normalizeListResponse(r.data)),
      () => {
        let data = [...DUMMY_STAFF_ATTENDANCE];
        if (filters.date) data = data.filter((a) => a.date === filters.date);
        if (filters.staff_id || filters.teacher_id) {
          const target = filters.staff_id || filters.teacher_id;
          data = data.filter((a) => a.staff_id === target || a.teacher_id === target);
        }
        if (filters.status) data = data.filter((a) => a.status === String(filters.status).toLowerCase());
        const paged = paginate(data.map(normalizeRecord), filters.page, filters.limit);
        return {
          ...paged,
          data: {
            rows: paged.data?.rows || paged.data || [],
            total: paged.data?.total || data.length,
            totalPages: paged.data?.totalPages || 1,
            page: paged.data?.page || Number(filters.page || 1),
            limit: paged.data?.limit || Number(filters.limit || 10),
          },
        };
      },
    ),

  getReport: (filters = {}) =>
    withFallback(
      () => api.get(`/staff-attendance/report${buildQuery(normalizeFilters(filters))}`).then((r) => r.data),
      () => {
        const data = DUMMY_STAFF_ATTENDANCE.map(normalizeRecord);
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

  // Backward compatibility for old pages
  getSummary: (filters = {}) => staffAttendanceService.getReport(filters),

  // Manual mark single attendance (admin can mark for any staff/teacher)
  markAttendance: (body) =>
    api.post('/staff-attendance', normalizeCreatePayload(body)).then((r) => ({
      ...r.data,
      data: normalizeRecord(r.data?.data),
    })),

  // body: { date, records: [{ staff_id|teacher_id, status, check_in?, check_out?, remarks? }] }
  markBulk: (body) =>
    withFallback(
      async () => {
        const date = body?.date;
        const records = Array.isArray(body?.records) ? body.records : [];
        const promises = records.map((record) =>
          staffAttendanceService.markAttendance({
            ...record,
            date: record.date || date,
          })
        );
        const results = await Promise.allSettled(promises);
        const success = results.filter((r) => r.status === 'fulfilled').length;
        const failed = results.length - success;
        return { data: { total: results.length, success, failed } };
      },
      () => ({ data: { date: body.date, marked: body.records?.length ?? 0 } }),
    ),

  // DataTable import sends mapped rows, not raw CSV file
  importFromRows: async (rows = [], fallbackDate) => {
    const records = rows
      .map((row) => ({
        staff_id: row.staff_id || row.teacher_id,
        date: row.date || fallbackDate,
        status: row.status || 'present',
        check_in: row.check_in || null,
        check_out: row.check_out || null,
        remarks: row.remarks || '',
        branch_id: row.branch_id,
      }))
      .filter((row) => row.staff_id && row.date);

    if (!records.length) {
      return { data: { total: 0, success: 0, failed: 0 } };
    }

    return staffAttendanceService.markBulk({ records, date: fallbackDate });
  },

  bulkUploadCsv: (file) => {
    const formData = new FormData();
    formData.append('file', file);
    return api.post('/staff-attendance/bulk', formData).then((r) => r.data);
  },

  getById: (id) => api.get(`/staff-attendance/${id}`).then((r) => ({ ...r.data, data: normalizeRecord(r.data?.data) })),

  update: (id, body) =>
    withFallback(
      () => api.put(`/staff-attendance/${id}`, {
        ...body,
        status: body.status ? toUpperStatus(body.status) : body.status,
      }).then((r) => ({ ...r.data, data: normalizeRecord(r.data?.data) })),
      () => ({ data: normalizeRecord({ id, ...body }) }),
    ),

  remove: (id) => api.delete(`/staff-attendance/${id}`).then((r) => r.data),
};
