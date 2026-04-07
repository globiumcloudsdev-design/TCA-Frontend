// src/services/policyService.js
import api from '@/lib/api';
import { buildQuery } from '@/lib/utils';

const BASE_URL = '/policies';

export const policyService = {
  /**
   * Create a new policy
   * @param {Object} data - Policy data
   */
  create: async (data) => {
    const response = await api.post(BASE_URL, data);
    return response.data;
  },

  /**
   * Get all policies with filters
   * @param {Object} params - { page, limit, policy_type, is_active, search, branch_id }
   */
  getAll: async (params = {}) => {
    const response = await api.get(`${BASE_URL}${buildQuery(params)}`);
    return response.data;
  },

  /**
   * Get single policy by ID
   * @param {string} id - Policy UUID
   */
  getOne: async (id) => {
    const response = await api.get(`${BASE_URL}/${id}`);
    return response.data;
  },

  /**
   * Update policy
   * @param {string} id - Policy UUID
   * @param {Object} data - Update data
   */
  update: async (id, data) => {
    const response = await api.put(`${BASE_URL}/${id}`, data);
    return response.data;
  },

  /**
   * Delete policy
   * @param {string} id - Policy UUID
   */
  delete: async (id) => {
    const response = await api.delete(`${BASE_URL}/${id}`);
    return response.data;
  },

  /**
   * Toggle policy status (activate/deactivate)
   * @param {string} id - Policy UUID
   * @param {boolean} isActive - Active status
   */
  toggleStatus: async (id, isActive) => {
    const response = await api.patch(`${BASE_URL}/${id}/toggle-status`, { is_active: isActive });
    return response.data;
  },

  /**
   * Get active policy by type
   * @param {string} type - Policy type
   * @param {Object} params - { branch_id }
   */
  getActiveByType: async (type, params = {}) => {
    const response = await api.get(`${BASE_URL}/active/${type}${buildQuery(params)}`);
    return response.data;
  },

  /**
   * Get policy options for dropdown
   * @param {Object} params - { policy_type }
   */
  getOptions: async (params = {}) => {
    const response = await api.get(`${BASE_URL}/options${buildQuery(params)}`);
    return response.data;
  },

  /**
   * Get policies by type
   * @param {string} type - Policy type
   * @param {Object} params - Additional filters
   */
  getByType: async (type, params = {}) => {
    const response = await api.get(`${BASE_URL}/type/${type}${buildQuery(params)}`);
    return response.data;
  }
};