/**
 * User Management API Service
 * GET    /users
 * POST   /users
 * GET    /users/:id
 * PUT    /users/:id
 * PATCH  /users/:id/assign-role
 * PATCH  /users/:id/status          (activate / deactivate)
 * DELETE /users/:id
 */

import api from '@/lib/api';
import { buildQuery } from '@/lib/utils';
import { withFallback } from '@/lib/withFallback';
import { DUMMY_MA_USERS, paginate } from '@/data/dummyData';

export const userService = {
  getAll: (filters = {}) =>
    withFallback(
      () => api.get(`/users${buildQuery(filters)}`).then((r) => r.data),
      () => paginate(DUMMY_MA_USERS, filters.page, filters.limit),
    ),

  getById: (id) => api.get(`/users/${id}`).then((r) => r.data),

  // body: { first_name, last_name, email, password, role_id, branch_id?, phone? }
  create: (body) => api.post('/users', body).then((r) => r.data),

  update: (id, body) => api.put(`/users/${id}`, body).then((r) => r.data),

  assignRole: (id, roleId) =>
    api.patch(`/users/${id}/assign-role`, { role_id: roleId }).then((r) => r.data),

  toggleStatus: (id, isActive) =>
    api.patch(`/users/${id}/status`, { is_active: isActive }).then((r) => r.data),

  delete: (id) => api.delete(`/users/${id}`).then((r) => r.data),
};
