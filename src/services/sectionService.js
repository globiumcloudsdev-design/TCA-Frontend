/**
 * Section API Service
 * GET    /sections          (list)
 * POST   /sections          (create)
 * GET    /sections/:id      (single)
 * PUT    /sections/:id      (update)
 * DELETE /sections/:id      (delete)
 */

import api from '@/lib/api';
import { buildQuery } from '@/lib/utils';
import { withFallback } from '@/lib/withFallback';
import { DUMMY_SECTIONS, paginate } from '@/data/dummyData';

export const sectionService = {
  // filters: { class_id, branch_id, page, limit }
  getAll: (filters = {}) =>
    withFallback(
      () => api.get(`/sections${buildQuery(filters)}`).then((r) => r.data),
      () => {
        let data = [...DUMMY_SECTIONS];
        if (filters.class_id)  data = data.filter((s) => s.class_id  === filters.class_id);
        if (filters.branch_id) data = data.filter((s) => s.branch_id === filters.branch_id);
        return paginate(data, filters.page, filters.limit);
      },
    ),

  getById: (id) =>
    withFallback(
      () => api.get(`/sections/${id}`).then((r) => r.data),
      () => ({ data: DUMMY_SECTIONS.find((s) => s.id === id) ?? null }),
    ),

  // body: { name, class_id, class_teacher_id, room_number, branch_id }
  create: (body) =>
    withFallback(
      () => api.post('/sections', body).then((r) => r.data),
      () => ({
        data: {
          ...body,
          id: `s-${Date.now()}`,
          student_count: 0,
          is_active: true,
        },
      }),
    ),

  update: (id, body) =>
    withFallback(
      () => api.put(`/sections/${id}`, body).then((r) => r.data),
      () => ({ data: { id, ...body } }),
    ),

  delete: (id) =>
    withFallback(
      () => api.delete(`/sections/${id}`).then((r) => r.data),
      () => ({ data: { id } }),
    ),
};
