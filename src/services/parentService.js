/**
 * Parent / Guardian API Service
 * GET    /parents        (list)
 * POST   /parents        (create)
 * GET    /parents/:id    (single)
 * PUT    /parents/:id    (update)
 * DELETE /parents/:id    (delete)
 */

import api from '@/lib/api';
import { buildQuery } from '@/lib/utils';

export const parentService = {
  getAll: (filters = {}) => api.get(`/parents${buildQuery(filters)}`).then((r) => r.data),

  getById: (id) => api.get(`/parents/${id}`).then((r) => r.data),

  findStudents: (payload) => api.post('/parents/find-students', payload).then((r) => r.data),

  create: (body) => api.post('/parents', body).then((r) => r.data),

  update: (id, body) => api.put(`/parents/${id}`, body).then((r) => r.data),

  delete: (id) => api.delete(`/parents/${id}`).then((r) => r.data),

  /**
   * Get parent options for dropdown (no pagination)
   */
  getOptions: async (params = {}) => {
    try {
      const queryString = buildQuery({ limit: 200, is_active: true, ...params });
      const response = await api.get(`/parents${queryString}`);
      const list = response.data?.data || [];
      return {
        data: list.map(p => ({
          value: p.id,
          label: `${p.first_name} ${p.last_name}`.trim() || p.email || `Parent ${p.id}`,
          email: p.email,
        }))
      };
    } catch (error) {
      console.error('Error fetching parent options:', error);
      return { data: [] };
    }
  },
};
