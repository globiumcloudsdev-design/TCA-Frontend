/**
 * Staff API Service
 * 
 * Handles all staff-related API calls
 * Automatically includes auth token via api.interceptors
 */

import api from '@/lib/api';
import { buildQuery } from '@/lib/utils';

export const staffService = {
  // Get available roles for staff (from institute's assigned role)
  getAvailableRoles: () => 
    api.get('/staff/available-roles').then(r => r.data),

  // Get all staff members
  getAll: (params = {}) => {
    const qs = new URLSearchParams();
    Object.entries(params).forEach(([k, v]) => {
      if (v !== undefined && v !== null && v !== '') qs.append(k, v);
    });
    const query = qs.toString() ? `?${qs}` : '';
    return api.get(`/staff${query}`).then(r => r.data);
  },

  // Get single staff member by ID
  getById: (id) => 
    api.get(`/staff/${id}`).then(r => r.data),

  // Create new staff member
  create: (data) => {
    // Handle FormData for file upload
    if (data instanceof FormData) {
      return api.post('/staff', data, {
        headers: { 'Content-Type': 'multipart/form-data' }
      }).then(r => r.data);
    }
    return api.post('/staff', data).then(r => r.data);
  },

  // Update staff member
  update: (id, data) => {
    if (data instanceof FormData) {
      return api.put(`/staff/${id}`, data, {
        headers: { 'Content-Type': 'multipart/form-data' }
      }).then(r => r.data);
    }
    return api.put(`/staff/${id}`, data).then(r => r.data);
  },

  // Delete staff member
  delete: (id) => 
    api.delete(`/staff/${id}`).then(r => r.data),

  // Toggle staff status
  toggleStatus: (id, is_active) => 
    api.patch(`/staff/${id}/status`, { is_active }).then(r => r.data),

  // Update staff permissions
  updatePermissions: (id, permissions) => 
    api.patch(`/staff/${id}/permissions`, { permissions }).then(r => r.data),

  /**
   * Get staff options for dropdown (no pagination)
   */
  getOptions: async (params = {}) => {
    try {
      const queryString = buildQuery({ limit: 200, is_active: true, ...params });
      const response = await api.get(`/staff${queryString}`);
      const list = response.data?.data || [];
      return {
        data: list.map(s => ({
          value: s.id,
          label: `${s.first_name} ${s.last_name}`.trim() || s.email || `Staff ${s.id}`,
          email: s.email,
        }))
      };
    } catch (error) {
      console.error('Error fetching staff options:', error);
      return { data: [] };
    }
  },
};
