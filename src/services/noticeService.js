/**
 * Notice Board API Service
 * GET    /notices            (list)
 * POST   /notices            (create)
 * GET    /notices/:id        (single)
 * PUT    /notices/:id        (update)
 * DELETE /notices/:id        (delete)
 * PATCH  /notices/:id/publish (publish / unpublish)
 */

import api from '@/lib/api';
import { buildQuery } from '@/lib/utils';
import { withFallback } from '@/lib/withFallback';
import { DUMMY_NOTICES, paginate } from '@/data/dummyData';

export const noticeService = {
  // filters: { audience, priority, is_published, page, limit }
  getAll: (filters = {}) =>
    withFallback(
      () => api.get(`/notices${buildQuery(filters)}`).then((r) => r.data),
      () => {
        let data = [...DUMMY_NOTICES];
        if (filters.audience !== undefined && filters.audience !== '')
          data = data.filter((n) => n.audience === filters.audience || n.audience === 'all');
        if (filters.priority)
          data = data.filter((n) => n.priority === filters.priority);
        if (filters.is_published !== undefined)
          data = data.filter((n) => n.is_published === (filters.is_published === 'true' || filters.is_published === true));
        return paginate(data, filters.page, filters.limit);
      },
    ),

  getById: (id) =>
    withFallback(
      () => api.get(`/notices/${id}`).then((r) => r.data),
      () => ({ data: DUMMY_NOTICES.find((n) => n.id === id) ?? null }),
    ),

  // body: { title, content, audience, priority, publish_date?, expiry_date? }
  create: (body) =>
    withFallback(
      () => api.post('/notices', body).then((r) => r.data),
      () => ({
        data: {
          ...body,
          id: `ntc-${Date.now()}`,
          is_published: false,
          created_at: new Date().toISOString(),
        },
      }),
    ),

  update: (id, body) =>
    withFallback(
      () => api.put(`/notices/${id}`, body).then((r) => r.data),
      () => ({ data: { id, ...body } }),
    ),

  delete: (id) =>
    withFallback(
      () => api.delete(`/notices/${id}`).then((r) => r.data),
      () => ({ data: { id } }),
    ),

  // body: { is_published: boolean }
  togglePublish: (id, body) =>
    withFallback(
      () => api.patch(`/notices/${id}/publish`, body).then((r) => r.data),
      () => ({ data: { id, is_published: body.is_published } }),
    ),
};
