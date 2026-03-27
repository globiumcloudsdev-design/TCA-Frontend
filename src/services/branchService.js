// /**
//  * Branch API Service
//  * GET    /branches
//  * POST   /branches
//  * GET    /branches/:id
//  * PUT    /branches/:id
//  * DELETE /branches/:id
//  */

// import api from '@/lib/api';
// import { buildQuery } from '@/lib/utils';
// import { withFallback } from '@/lib/withFallback';
// import { DUMMY_BRANCHES, paginate } from '@/data/dummyData';

// export const branchService = {
//   getAll: (filters = {}) =>
//     withFallback(
//       () => api.get(`/branches${buildQuery(filters)}`).then((r) => r.data),
//       () => {
//         let list = [...DUMMY_BRANCHES];
//         if (filters.school_id) list = list.filter((b) => b.school_id === filters.school_id);
//         if (filters.search) {
//           const q = filters.search.toLowerCase();
//           list = list.filter(
//             (b) =>
//               b.name.toLowerCase().includes(q) ||
//               (b.address && b.address.toLowerCase().includes(q)),
//           );
//         }
//         return paginate(list, filters.page, filters.limit);
//       },
//     ),

//   getById: (id) =>
//     withFallback(
//       () => api.get(`/branches/${id}`).then((r) => r.data),
//       () => DUMMY_BRANCHES.find((b) => b.id === id) ?? null,
//     ),

//   // body: { name, address?, phone?, email?, school_id, is_active? }
//   create: (body) => api.post('/branches', body).then((r) => r.data),

//   update: (id, body) => api.put(`/branches/${id}`, body).then((r) => r.data),

//   delete: (id) => api.delete(`/branches/${id}`).then((r) => r.data),
// };




// src/services/branchService.js

import api from '@/lib/api';
import { buildQuery } from '@/lib/utils';

/**
 * Branch Service - Real API calls
 */
export const branchService = {
  /**
   * Get all branches with filters
   */
  getAll: async (filters = {}) => {
    const query = buildQuery(filters);
    const response = await api.get(`/branches${query}`);
    return response.data;
  },

  /**
   * Get branch options for dropdowns
   */
  getOptions: async (params = {}) => {
    const query = buildQuery(params);
    const response = await api.get(`/branches/options${query}`);
    return response.data;
  },

  /**
   * Get branch statistics
   */
  getStats: async () => {
    const response = await api.get('/branches/stats');
    return response.data;
  },

  /**
   * Get single branch by ID
   */
  getById: async (id) => {
    const response = await api.get(`/branches/${id}`);
    return response.data;
  },

  /**
   * Create new branch
   */
  create: async (data) => {
    const response = await api.post('/branches', data);
    return response.data;
  },

  /**
   * Update existing branch
   */
  update: async (id, data) => {
    const response = await api.put(`/branches/${id}`, data);
    return response.data;
  },

  /**
   * Toggle branch status
   */
  toggleStatus: async (id, is_active) => {
    const response = await api.patch(`/branches/${id}/toggle-status`, { is_active });
    return response.data;
  },

  /**
   * Update branch settings only
   */
  updateSettings: async (id, settings) => {
    const response = await api.post(`/branches/${id}/settings`, settings);
    return response.data;
  },

  /**
   * Delete branch
   */
  delete: async (id) => {
    const response = await api.delete(`/branches/${id}`);
    return response.data;
  }
};