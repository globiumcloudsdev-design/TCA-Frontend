// src/services/instituteService.js
import api from '@/lib/api';
import { buildQuery } from '@/lib/utils';

const BASE_URL = '/institutes';

export const instituteService = {
  /**
   * Get institute details
   * @param {string} id - Institute UUID
   */
  getById: async (id) => {
    const response = await api.get(`${BASE_URL}/${id}`);
    return response.data;
  },

  /**
   * Update institute details
   * @param {string} id - Institute UUID
   * @param {Object} data - Update data
   */
  update: async (id, data) => {
    const response = await api.put(`${BASE_URL}/${id}`, data);
    return response.data;
  },

  /**
   * Upload institute logo
   * @param {string} id - Institute UUID
   * @param {File} file - Logo file
   */
  uploadLogo: async (id, file) => {
    const formData = new FormData();
    formData.append('logo', file);
    const response = await api.post(`${BASE_URL}/${id}/logo`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    return response.data;
  },

  /**
   * Remove institute logo
   * @param {string} id - Institute UUID
   */
  removeLogo: async (id) => {
    const response = await api.delete(`${BASE_URL}/${id}/logo`);
    return response.data;
  },

  /**
   * Get institute settings
   * @param {string} id - Institute UUID
   */
  getSettings: async (id) => {
    const response = await api.get(`${BASE_URL}/${id}/settings`);
    return response.data;
  },

  /**
   * Update institute settings
   * @param {string} id - Institute UUID
   * @param {Object} settings - Settings object
   */
  updateSettings: async (id, settings) => {
    const response = await api.put(`${BASE_URL}/${id}/settings`, settings);
    return response.data;
  }
};