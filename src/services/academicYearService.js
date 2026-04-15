/**
 * Academic Year API Service
 * GET    /academic-years
 * POST   /academic-years
 * GET    /academic-years/:id
 * PUT    /academic-years/:id
 * PATCH  /academic-years/:id/set-current
 * DELETE /academic-years/:id
 */

import api from '@/lib/api';
import { buildQuery } from '@/lib/utils';

export const academicYearService = {
  /**
   * Get all academic years for an institute
   * @param {Object} params - Query parameters
   * @param {string} params.institute_id - Institute ID
   * @param {number} params.page - Page number
   * @param {number} params.limit - Items per page
   * @param {string} params.sortBy - Sort field
   * @param {string} params.sortOrder - Sort order (ASC/DESC)
   * @param {boolean} params.is_current - Filter by current
   * @param {boolean} params.is_active - Filter by active
   * @param {string} params.search - Search term
   */
  getAll: async (params = {}) => {
    try {
      const queryString = buildQuery(params);
      const response = await api.get(`/academic-years${queryString}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching academic years:', error);
      throw error;
    }
  },

  /**
   * Get academic year by ID
   * @param {string} id - Academic year ID
   * @param {string} instituteId - Institute ID for validation
   */
  getById: async (id, instituteId) => {
    try {
      const response = await api.get(`/academic-years/${id}`, {
        params: { institute_id: instituteId }
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching academic year:', error);
      throw error;
    }
  },

  /**
   * Get current academic year
   * @param {string} instituteId - Institute ID
   */
  getCurrent: async (instituteId) => {
    try {
      const response = await api.get(`/academic-years/current`, {
        params: { institute_id: instituteId }
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching current academic year:', error);
      return { data: null };
    }
  },

  /**
   * Create new academic year
   * @param {Object} data - Academic year data
   * @param {string} data.institute_id - Institute ID
   * @param {string} data.name - Year name (e.g., "2024-2025")
   * @param {string} data.start_date - Start date (YYYY-MM-DD)
   * @param {string} data.end_date - End date (YYYY-MM-DD)
   * @param {boolean} data.is_current - Set as current
   * @param {string} data.description - Description
   */
  create: async (data) => {
    try {
      const response = await api.post('/academic-years', data);
      return response.data;
    } catch (error) {
      console.error('Error creating academic year:', error);
      throw error;
    }
  },

  /**
   * Update academic year
   * @param {string} id - Academic year ID
   * @param {Object} data - Update data
   * @param {string} data.name - Year name
   * @param {string} data.start_date - Start date
   * @param {string} data.end_date - End date
   * @param {boolean} data.is_current - Set as current
   * @param {string} data.description - Description
   */
  update: async (id, data) => {
    try {
      const response = await api.put(`/academic-years/${id}`, data);
      return response.data;
    } catch (error) {
      console.error('Error updating academic year:', error);
      throw error;
    }
  },

  /**
   * Set academic year as current
   * @param {string} id - Academic year ID
   * @param {string} instituteId - Institute ID
   */
  setCurrent: async (id, instituteId) => {
    try {
      const response = await api.patch(`/academic-years/${id}/set-current`, {
        institute_id: instituteId
      });
      return response.data;
    } catch (error) {
      console.error('Error setting current academic year:', error);
      throw error;
    }
  },

  /**
   * Delete academic year (soft delete)
   * @param {string} id - Academic year ID
   * @param {string} instituteId - Institute ID
   */
  delete: async (id, instituteId) => {
    try {
      const response = await api.delete(`/academic-years/${id}`, {
        params: { institute_id: instituteId }
      });
      return response.data;
    } catch (error) {
      console.error('Error deleting academic year:', error);
      throw error;
    }
  },

  /**
   * Toggle academic year active status
   * @param {string} id - Academic year ID
   * @param {boolean} isActive - Active status
   */
  toggleActive: async (id, isActive) => {
    try {
      const response = await api.put(`/academic-years/${id}`, {
        is_active: isActive
      });
      return response.data;
    } catch (error) {
      console.error('Error toggling academic year status:', error);
      throw error;
    }
  },

  /**
   * Get academic year options for dropdown
   * @param {string} instituteId - Institute ID
   * @param {boolean} onlyActive - Only active years
   */
  getOptions: async (instituteId, onlyActive = true) => {
    try {
      const params = { institute_id: instituteId, limit: 100, sortBy: 'start_date', sortOrder: 'DESC' };
      if (onlyActive) params.is_active = true;
      const response = await api.get('/academic-years/options', { params });
      const years = (response.data?.data || [])
        .map((y) => ({
          value: y?.value || y?.id,
          label: y?.label || y?.name,
          is_current: !!y?.is_current,
          start_date: y?.start_date,
          end_date: y?.end_date,
        }))
        .filter((y) => y.value && y.label);
      return { data: years };
    } catch (error) {
      console.error('Error fetching academic year options:', error);
      return { data: [] };
    }
  },

  /**
   * Validate date range
   * @param {string} startDate - Start date
   * @param {string} endDate - End date
   */
  validateDateRange: (startDate, endDate) => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    
    if (start >= end) {
      throw new Error('Start date must be before end date');
    }
    
    const diffTime = Math.abs(end - start);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays < 300) { // Less than 10 months
      throw new Error('Academic year should be at least 10 months long');
    }
    
    if (diffDays > 400) { // More than 13 months
      throw new Error('Academic year should not exceed 13 months');
    }
    
    return true;
  }
};
