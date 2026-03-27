/**
 * Subject API Service
 * GET    /subjects               (list — filter by class_id, page, limit, search)
 * POST   /subjects               (create)
 * GET    /subjects/:id           (single)
 * PUT    /subjects/:id           (update)
 * DELETE /subjects/:id           (delete)
 * GET    /subjects/:id/syllabus  (get syllabus)
 * PUT    /subjects/:id/syllabus  (update syllabus — text or file)
 */

import api from '@/lib/api';
import { buildQuery } from '@/lib/utils';
import { withFallback } from '@/lib/withFallback';
import { DUMMY_SUBJECTS, paginate } from '@/data/dummyData';

export const subjectService = {
  // filters: { class_id, search, page, limit }
  getAll: (filters = {}) =>
    withFallback(
      () => api.get(`/subjects${buildQuery(filters)}`).then((r) => r.data),
      () => {
        let data = [...DUMMY_SUBJECTS];
        if (filters.class_id) data = data.filter((s) => String(s.class_id) === String(filters.class_id));
        if (filters.search) {
          const q = filters.search.toLowerCase();
          data = data.filter(
            (s) =>
              s.name.toLowerCase().includes(q) ||
              s.code?.toLowerCase().includes(q) ||
              s.description?.toLowerCase().includes(q),
          );
        }
        return paginate(data, filters.page, filters.limit);
      },
    ),

  getById: (id) =>
    withFallback(
      () => api.get(`/subjects/${id}`).then((r) => r.data),
      () => ({ data: DUMMY_SUBJECTS.find((s) => s.id === id) ?? null }),
    ),

  // body: { name, code, class_id, teacher_id?, description?, is_active? }
  create: (body) =>
    withFallback(
      () => api.post('/subjects', body).then((r) => r.data),
      () => ({
        data: {
          ...body,
          id: `sub-${Date.now()}`,
          syllabus_type: null,
          syllabus_content: null,
          syllabus_file_url: null,
          is_active: body.is_active ?? true,
          school_id: 'school-001',
        },
      }),
    ),

  update: (id, body) =>
    withFallback(
      () => api.put(`/subjects/${id}`, body).then((r) => r.data),
      () => ({ data: { id, ...body } }),
    ),

  delete: (id) =>
    withFallback(
      () => api.delete(`/subjects/${id}`).then((r) => r.data),
      () => ({ data: { id } }),
    ),

  // Syllabus
  getSyllabus: (id) =>
    withFallback(
      () => api.get(`/subjects/${id}/syllabus`).then((r) => r.data),
      () => {
        const subject = DUMMY_SUBJECTS.find((s) => s.id === id);
        return {
          data: {
            syllabus_type:     subject?.syllabus_type    ?? null,
            syllabus_content:  subject?.syllabus_content ?? null,
            syllabus_file_url: subject?.syllabus_file_url ?? null,
          },
        };
      },
    ),

  // body: { syllabus_type: 'text'|'file', syllabus_content?, syllabus_file? (File object) }
  updateSyllabus: (id, body) => {
    if (body.syllabus_type === 'file' && body.syllabus_file instanceof File) {
      const form = new FormData();
      form.append('syllabus_type', 'file');
      form.append('syllabus_file', body.syllabus_file);
      return withFallback(
        () => api.put(`/subjects/${id}/syllabus`, form, { headers: { 'Content-Type': 'multipart/form-data' } }).then((r) => r.data),
        () => ({ data: { id, syllabus_type: 'file', syllabus_file_url: URL.createObjectURL(body.syllabus_file) } }),
      );
    }
    return withFallback(
      () => api.put(`/subjects/${id}/syllabus`, { syllabus_type: 'text', syllabus_content: body.syllabus_content }).then((r) => r.data),
      () => ({ data: { id, syllabus_type: 'text', syllabus_content: body.syllabus_content } }),
    );
  },
};
