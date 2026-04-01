// src/services/studentAttendanceService.js

import api from '@/lib/api';
import { buildQuery } from '@/lib/utils';

export const studentAttendanceService = {
  /**
   * Get attendance with filters
   * @param {Object} params - Query parameters
   * @param {string} params.class_id
   * @param {string} params.section_id
   * @param {string} params.student_id
   * @param {string} params.date - YYYY-MM-DD
   * @param {string} params.from_date - YYYY-MM-DD
   * @param {string} params.to_date - YYYY-MM-DD
   * @param {string} params.status - present | absent | late | holiday
   * @param {number} params.page
   * @param {number} params.limit
   */
  getAttendance: async (params = {}) => {
    try {
      const queryString = buildQuery(params);
      const response = await api.get(`/attendance${queryString}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching student attendance:', error);
      throw error;
    }
  },

  /**
   * Mark individual attendance
   * @param {Object} data - { student_id, date, status, remarks, type }
   */
  markAttendance: async (data) => {
    try {
      const response = await api.post('/attendance/mark', data);
      return response.data;
    } catch (error) {
      console.error('Error marking attendance:', error);
      throw error;
    }
  },

  /**
   * Bulk mark attendance for a class/section
   * @param {Object} data - { class_id, section_id, date, records: [{ student_id, status, remarks }] }
   */
  bulkMarkAttendance: async (data) => {
    try {
      const response = await api.post('/attendance/bulk', data);
      return response.data;
    } catch (error) {
      console.error('Error bulk marking attendance:', error);
      throw error;
    }
  },

  /**
   * Process QR Scan for attendance
   * @param {Object} data - { student_id, date, type }
   */
  scanQR: async (data) => {
    try {
      const response = await api.post('/attendance/scan', data);
      return response.data;
    } catch (error) {
      console.error('Error processing QR scan:', error);
      throw error;
    }
  },

  /**
   * Get attendance report
   * @param {Object} params - { class_id, section_id, student_id, month, year }
   */
  getReport: async (params = {}) => {
    try {
      const queryString = buildQuery(params);
      const response = await api.get(`/attendance/report${queryString}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching attendance report:', error);
      throw error;
    }
  },

  /**
   * Update attendance record
   * @param {string} id - Attendance record ID
   * @param {Object} data - Updated fields
   */
  updateAttendance: async (id, data) => {
    try {
      const response = await api.put(`/attendance/${id}`, data);
      return response.data;
    } catch (error) {
      console.error('Error updating attendance:', error);
      throw error;
    }
  }
};
