/**
 * Branch API Service
 * GET    /branches
 * POST   /branches
 * GET    /branches/:id
 * PUT    /branches/:id
 * DELETE /branches/:id
 */

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