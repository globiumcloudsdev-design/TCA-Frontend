/**
 * Role API Service
 *
 * Two contexts:
 *  ▸ Master Admin  → /master-admin/roles  (platform template roles, no school context)
 *  ▸ School Admin  → /roles               (school-level custom roles)
 */

import api from '@/lib/api';

// ─── Master Admin — Platform Template Roles ───────────────────────────────────
export const roleService = {
  // List all platform template roles
  getAll: (params = {}) => {
    const qs = new URLSearchParams();
    Object.entries(params).forEach(([k, v]) => { if (v !== undefined && v !== '') qs.append(k, v); });
    const query = qs.toString() ? `?${qs}` : '';
    return api.get(`/master-admin/roles${query}`).then((r) => r.data);
  },

  getById: (id) => api.get(`/master-admin/roles/${id}`).then((r) => r.data),

  /**
   * body: { name, code, description?, is_active?, permissions: string[] }
   * permissions is a flat array — backend wraps as { instituteAdmin: [...] }
   */
  create: (body) => api.post('/master-admin/roles', body).then((r) => r.data),

  update: (id, body) => api.put(`/master-admin/roles/${id}`, body).then((r) => r.data),

  delete: (id) => api.delete(`/master-admin/roles/${id}`).then((r) => r.data),

  /** Returns grouped permission catalogue from backend */
  getPermissionGroups: () => api.get('/master-admin/roles/permissions').then((r) => r.data),

  // ─── School-level role methods (used inside school portal) ─────────────────
  getSchoolRoles: (schoolId, params = {}) => {
    const qs = new URLSearchParams({ ...params });
    return api.get(`/roles?${qs}`).then((r) => r.data);
  },

  createSchoolRole: (body) => api.post('/roles', body).then((r) => r.data),

  updateSchoolRole: (id, body) => api.put(`/roles/${id}`, body).then((r) => r.data),

  deleteSchoolRole: (id) => api.delete(`/roles/${id}`).then((r) => r.data),

  assignToUser: (userId, roleId) =>
    api.post('/roles/assign', { userId, roleId }).then((r) => r.data),
};
