/**
 * Admission API Service
 * GET    /admissions                  (list)
 * POST   /admissions                  (create)
 * GET    /admissions/:id              (single)
 * PATCH  /admissions/:id              (update)
 * DELETE /admissions/:id              (delete)
 * PATCH  /admissions/:id/approve      (approve)
 * PATCH  /admissions/:id/reject       (reject)
 */

import api from '@/lib/api';
import { buildQuery } from '@/lib/utils';
import { withFallback } from '@/lib/withFallback';
import { DUMMY_ADMISSIONS, paginate } from '@/data/dummyData';

export const admissionService = {
  // List — filters: { status, class_id, academic_year_id, page, limit }
  getAll: (filters = {}) =>
    withFallback(
      () => api.get(`/admissions${buildQuery(filters)}`).then((r) => r.data),
      () => {
        let data = [...DUMMY_ADMISSIONS];
        if (filters.status) data = data.filter((a) => a.status === filters.status);
        if (filters.class_id) data = data.filter((a) => a.class_id === filters.class_id);
        return paginate(data, filters.page, filters.limit);
      },
    ),

  getById: (id) =>
    withFallback(
      () => api.get(`/admissions/${id}`).then((r) => r.data),
      () => ({ data: DUMMY_ADMISSIONS.find((a) => a.id === id) ?? null }),
    ),

  create: (body) =>
    withFallback(
      () => api.post('/admissions', body).then((r) => r.data),
      () => ({
        data: {
          ...body,
          id: `adm-${Date.now()}`,
          admission_no: `ADM-${new Date().getFullYear()}-${String(DUMMY_ADMISSIONS.length + 1).padStart(3, '0')}`,
          status: 'pending',
          student_id: null,
          created_at: new Date().toISOString(),
        },
      }),
    ),

  update: (id, body) =>
    withFallback(
      () => api.patch(`/admissions/${id}`, body).then((r) => r.data),
      () => ({ data: { id, ...body } }),
    ),

  delete: (id) =>
    withFallback(
      () => api.delete(`/admissions/${id}`).then((r) => r.data),
      () => ({ data: { id } }),
    ),

  approve: (id, body = {}) =>
    withFallback(
      () => api.patch(`/admissions/${id}/approve`, body).then((r) => r.data),
      () => ({ data: { id, status: 'approved', approved_date: new Date().toISOString().split('T')[0] } }),
    ),

  reject: (id, body = {}) =>
    withFallback(
      () => api.patch(`/admissions/${id}/reject`, body).then((r) => r.data),
      () => ({ data: { id, status: 'rejected' } }),
    ),
};
