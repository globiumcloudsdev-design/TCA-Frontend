/**
 * Test Records API (class tests, separate from formal Exams).
 * Contract: TEST_RECORDS_API.md (backend branch feature/test-records).
 *
 * Every call resolves to the full response envelope:
 *   { success, message, data, pagination?, summary? }
 * Errors are normalised by getTestRecordError() so 400/403/404/409 messages can be shown as-is.
 */
import api from '@/lib/api';
import { buildQuery } from '@/lib/utils';
import { friendlyMessage } from '@/lib/errorMessages';

const get = (url, params) => api.get(`${url}${buildQuery(params || {})}`).then((r) => r.data);
const post = (url, body) => api.post(url, body ?? {}).then((r) => r.data);
const put = (url, body) => api.put(url, body ?? {}).then((r) => r.data);
const del = (url) => api.delete(url).then((r) => r.data);

/** Drop empty-string / null / undefined filters before building a query. */
const clean = (obj = {}) =>
  Object.fromEntries(Object.entries(obj).filter(([, v]) => v !== '' && v !== null && v !== undefined && v !== 'all'));

// Admin / institute — /test-records
export const testRecordService = {
  options: (teacherId) => get('/test-records/options', clean({ teacher_id: teacherId })),
  list: (filters) => get('/test-records', clean(filters)),
  get: (id) => get(`/test-records/${id}`),
  create: (body) => post('/test-records', body),
  update: (id, body) => put(`/test-records/${id}`, body),
  remove: (id) => del(`/test-records/${id}`),
  saveMarks: (id, marks) => put(`/test-records/${id}/marks`, { marks }),
  publish: (id) => post(`/test-records/${id}/publish`),
  unpublish: (id) => post(`/test-records/${id}/unpublish`),
  sheet: (sel) => get('/test-records/sheet', clean(sel)),
  saveSheetMarks: (cells) => put('/test-records/sheet/marks', { cells }),
  publishSheet: (sel) => post('/test-records/sheet/publish', clean(sel)),
};

// Teacher portal — /portal/teacher/test-records
export const teacherTestRecordService = {
  options: () => get('/portal/teacher/test-records/options'),
  list: (filters) => get('/portal/teacher/test-records', clean(filters)),
  get: (id) => get(`/portal/teacher/test-records/${id}`),
  create: (body) => post('/portal/teacher/test-records', body),
  update: (id, body) => put(`/portal/teacher/test-records/${id}`, body),
  remove: (id) => del(`/portal/teacher/test-records/${id}`),
  saveMarks: (id, marks) => put(`/portal/teacher/test-records/${id}/marks`, { marks }),
  sheet: (sel) => get('/portal/teacher/test-records/sheet', clean(sel)),
  saveSheetMarks: (cells) => put('/portal/teacher/test-records/sheet/marks', { cells }),
};

// Parent / student portals (published only, read-only)
export const parentTestRecordService = {
  list: (childId, filters) => get(`/portal/parent/children/${childId}/test-records`, clean(filters)),
  monthly: (childId, filters) => get(`/portal/parent/children/${childId}/test-records/monthly`, clean(filters)),
};
export const studentTestRecordService = {
  list: (filters) => get('/portal/student/test-records', clean(filters)),
  monthly: (filters) => get('/portal/student/test-records/monthly', clean(filters)),
};

/** Human-readable message for an axios error (400/403/404/409 text comes from the backend). */
export function getTestRecordError(err, fallback) {
  return friendlyMessage(err, fallback ? { fallback } : undefined);
}

export const TEST_STATUS = {
  draft: { label: 'Draft', cls: 'bg-slate-100 text-slate-700 border-slate-200' },
  marks_entered: { label: 'Marks entered', cls: 'bg-amber-100 text-amber-800 border-amber-200' },
  published: { label: 'Published', cls: 'bg-emerald-100 text-emerald-800 border-emerald-200' },
};
