// src/services/expenseService.js
import api from '@/lib/api';
import { buildQuery } from '@/lib/utils';

const BASE_URL = '/expenses';

export const expenseService = {
  /**
   * Get all expenses with pagination and filters
   * @param {Object} params - { page, limit, search, status, category, vendor_id, start_date, end_date, branch_id }
   * @param {string} type - 'school' or 'institute'
   */
  getAll: async (params = {}, type = 'school') => {
    const queryParams = {
      page: params.page || 1,
      limit: params.limit || 10,
      sortBy: params.sortBy || 'date',
      sortOrder: params.sortOrder || 'DESC',
      ...params,
    };
    const response = await api.get(`${BASE_URL}${buildQuery(queryParams)}`);
    return response.data;
  },

  /**
   * Get single expense by ID
   * @param {string} id - Expense UUID
   */
  getById: async (id) => {
    const response = await api.get(`${BASE_URL}/${id}`);
    return response.data;
  },

  /**
   * Create new expense
   * @param {Object} data - { title, amount, category, vendor_id, vendor_name, date, description, status, receipt_url, payment_reference }
   */
  create: async (data) => {
    const response = await api.post(BASE_URL, data);
    return response.data;
  },

  /**
   * Update expense
   * @param {string} id - Expense UUID
   * @param {Object} data - Partial expense data
   */
  update: async (id, data) => {
    const response = await api.put(`${BASE_URL}/${id}`, data);
    return response.data;
  },

  /**
   * Delete expense
   * @param {string} id - Expense UUID
   */
  delete: async (id) => {
    const response = await api.delete(`${BASE_URL}/${id}`);
    return response.data;
  },

  /**
   * Get expense statistics (for dashboard)
   * @param {Object} params - { year, branch_id }
   */
  getStats: async (params = {}) => {
    const response = await api.get(`${BASE_URL}/stats${buildQuery(params)}`);
    return response.data;
  },

  /**
   * Get expense categories for dropdown (creatable select)
   * @param {Object} params - { onlyActive, search }
   */
  getCategories: async (params = {}) => {
    const response = await api.get(`${BASE_URL}/categories${buildQuery(params)}`);
    return response.data;
  },

  /**
   * Get expense by date range
   * @param {string} startDate - YYYY-MM-DD
   * @param {string} endDate - YYYY-MM-DD
   * @param {Object} extraParams - Additional filters
   */
  getByDateRange: async (startDate, endDate, extraParams = {}) => {
    return expenseService.getAll({
      start_date: startDate,
      end_date: endDate,
      ...extraParams,
    });
  },

  /**
   * Get monthly expense summary
   * @param {number} year - Year (e.g., 2026)
   * @param {string} branchId - Optional branch filter
   */
  getMonthlySummary: async (year, branchId = null) => {
    const stats = await expenseService.getStats({ year, branch_id: branchId });
    return stats.data?.monthly_stats || [];
  },

  /**
   * Update expense status (paid/unpaid toggle)
   * @param {string} id - Expense UUID
   * @param {string} status - 'pending', 'approved', 'paid', or 'rejected'
   */
  updateStatus: async (id, status) => {
    return expenseService.update(id, { status });
  },
};