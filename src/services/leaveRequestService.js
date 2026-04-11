/**
 * Leave Request API Service
 * GET    /leave-requests                      - Get all leave requests (with filters)
 * GET    /leave-requests/statistics/my-stats  - Get my leave statistics
 * GET    /leave-requests/my-requests          - Get my leave requests
 * GET    /leave-requests/:id                  - Get leave request by ID
 * POST   /leave-requests                      - Create new leave request
 * PUT    /leave-requests/:id                  - Update leave request (only if PENDING)
 * PATCH  /leave-requests/:id/approve-reject   - Approve or reject leave request
 * PATCH  /leave-requests/:id/cancel           - Cancel leave request (only if PENDING)
 */

import api from '@/lib/api';
import { buildQuery } from '@/lib/utils';

export const leaveRequestService = {
  /**
   * Get all leave requests (for approvers/admins with filters)
   */
  getAll: async (filters = {}) => {
    try {
      const queryString = buildQuery(filters);
      const response = await api.get(`/leave-requests${queryString}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching leave requests:', error);
      throw error;
    }
  },

  /**
   * Get my leave requests (personal)
   */
  getMyRequests: async (filters = {}) => {
    try {
      const queryString = buildQuery(filters);
      const response = await api.get(`/leave-requests/my-requests${queryString}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching my leave requests:', error);
      throw error;
    }
  },

  /**
   * Get leave request by ID
   */
  getById: async (id) => {
    try {
      const response = await api.get(`/leave-requests/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching leave request ${id}:`, error);
      throw error;
    }
  },

  /**
   * Create new leave request
   */
  create: async (leaveData) => {
    try {
      const response = await api.post('/leave-requests', leaveData);
      return response.data;
    } catch (error) {
      console.error('Error creating leave request:', error);
      throw error;
    }
  },

  /**
   * Update leave request (only if PENDING)
   */
  update: async (id, updateData) => {
    try {
      const response = await api.put(`/leave-requests/${id}`, updateData);
      return response.data;
    } catch (error) {
      console.error(`Error updating leave request ${id}:`, error);
      throw error;
    }
  },

  /**
   * Approve leave request
   */
  approve: async (id, remarks = '') => {
    try {
      const response = await api.patch(`/leave-requests/${id}/approve-reject`, {
        status: 'APPROVED',
        approval_remarks: remarks
      });
      return response.data;
    } catch (error) {
      console.error(`Error approving leave request ${id}:`, error);
      throw error;
    }
  },

  /**
   * Reject leave request with reason
   */
  reject: async (id, rejectReason) => {
    try {
      const response = await api.patch(`/leave-requests/${id}/approve-reject`, {
        status: 'REJECTED',
        approval_remarks: rejectReason
      });
      return response.data;
    } catch (error) {
      console.error(`Error rejecting leave request ${id}:`, error);
      throw error;
    }
  },

  /**
   * Cancel leave request (only if PENDING)
   */
  cancel: async (id) => {
    try {
      const response = await api.patch(`/leave-requests/${id}/cancel`, {});
      return response.data;
    } catch (error) {
      console.error(`Error cancelling leave request ${id}:`, error);
      throw error;
    }
  },

  /**
   * Get my leave statistics (approved, pending, rejected counts)
   */
  getMyStats: async () => {
    try {
      const response = await api.get('/leave-requests/statistics/my-stats');
      return response.data;
    } catch (error) {
      console.error('Error fetching leave statistics:', error);
      throw error;
    }
  },

  /**
   * Admin: Mark leave for staff/student
   */
  adminMarkLeave: async (leaveData) => {
    try {
      const response = await api.post('/leave-requests/admin/mark-leave', leaveData);
      return response.data;
    } catch (error) {
      console.error('Error marking leave:', error);
      throw error;
    }
  },

  /**
   * Get all leave types for institute
   */
  getLeaveTypes: async (filters = {}) => {
    try {
      const queryString = buildQuery(filters);
      const response = await api.get(`/leave-types${queryString}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching leave types:', error);
      throw error;
    }
  },

  /**
   * Create new leave type
   */
  createLeaveType: async (leaveTypeData) => {
    try {
      const response = await api.post('/leave-types', leaveTypeData);
      return response.data;
    } catch (error) {
      console.error('Error creating leave type:', error);
      throw error;
    }
  },

  /**
   * Update leave type
   */
  updateLeaveType: async (id, leaveTypeData) => {
    try {
      const response = await api.put(`/leave-types/${id}`, leaveTypeData);
      return response.data;
    } catch (error) {
      console.error(`Error updating leave type ${id}:`, error);
      throw error;
    }
  },

  /**
   * Delete leave type
   */
  deleteLeaveType: async (id) => {
    try {
      const response = await api.delete(`/leave-types/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Error deleting leave type ${id}:`, error);
      throw error;
    }
  }
};
