// src/services/vendorService.js
import api from '@/lib/api';
import { buildQuery } from '@/lib/utils';

const BASE_URL = '/vendors';

export const vendorService = {
  /**
   * Get all vendors with pagination and filters
   * @param {Object} params - { page, limit, search, type, status, branch_id }
   * @param {string} type - 'school' or 'institute'
   */
  getAll: async (params = {}, type = 'school') => {
    const queryParams = {
      page: params.page || 1,
      limit: params.limit || 10,
      sortBy: params.sortBy || 'name',
      sortOrder: params.sortOrder || 'ASC',
      ...params,
    };
    const response = await api.get(`${BASE_URL}${buildQuery(queryParams)}`);
    return response.data;
  },

  /**
   * Get single vendor by ID
   * @param {string} id - Vendor UUID
   */
  getById: async (id) => {
    const response = await api.get(`${BASE_URL}/${id}`);
    return response.data;
  },

  /**
   * Create new vendor
   * @param {Object} data - { name, type, phone, email, address, assigned_student_ids, cnic, bank_account, status, notes }
   */
  create: async (data) => {
    const response = await api.post(BASE_URL, data);
    return response.data;
  },

  /**
   * Update vendor
   * @param {string} id - Vendor UUID
   * @param {Object} data - Partial vendor data
   */
  update: async (id, data) => {
    const response = await api.put(`${BASE_URL}/${id}`, data);
    return response.data;
  },

  /**
   * Delete vendor
   * @param {string} id - Vendor UUID
   */
  delete: async (id) => {
    const response = await api.delete(`${BASE_URL}/${id}`);
    return response.data;
  },

  /**
   * Get vendor options for dropdown (creatable select)
   * @param {Object} params - { branch_id, type, search }
   */
  getOptions: async (params = {}) => {
    const response = await api.get(`${BASE_URL}/options${buildQuery(params)}`);
    return response.data;
  },

  /**
   * Get vendor types (including custom types)
   */
  getTypes: async () => {
    const response = await api.get(`${BASE_URL}/types`);
    return response.data;
  },

  /**
   * Assign students to vendor (e.g., for transport)
   * @param {string} id - Vendor UUID
   * @param {Array} studentIds - Array of student UUIDs
   */
  assignStudents: async (id, studentIds) => {
    const response = await api.patch(`${BASE_URL}/${id}/assign-students`, { student_ids: studentIds });
    return response.data;
  },

  /**
   * Get vendors by type
   * @param {string} vendorType - books, transport, uniform, etc.
   * @param {Object} extraParams - Additional filters
   */
  getByType: async (vendorType, extraParams = {}) => {
    return vendorService.getAll({ type: vendorType, ...extraParams });
  },

  /**
   * Get active vendors only
   * @param {Object} params - Additional filters
   */
  getActiveVendors: async (params = {}) => {
    return vendorService.getAll({ status: 'active', ...params });
  },
};