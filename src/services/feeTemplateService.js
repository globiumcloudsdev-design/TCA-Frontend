// /**
//  * Fee Template API Service
//  * GET    /fee-templates              (list)
//  * POST   /fee-templates              (create)
//  * GET    /fee-templates/:id          (single)
//  * PUT    /fee-templates/:id          (update)
//  * DELETE /fee-templates/:id          (delete)
//  * POST   /fee-templates/:id/assign   (assign template to class / student)
//  */

// import api from '@/lib/api';
// import { buildQuery } from '@/lib/utils';
// import { withFallback } from '@/lib/withFallback';
// import { DUMMY_FEE_TEMPLATES, paginate } from '@/data/dummyData';

// export const feeTemplateService = {
//   // filters: { page, limit }
//   getAll: (filters = {}) =>
//     withFallback(
//       () => api.get(`/fee-templates${buildQuery(filters)}`).then((r) => r.data),
//       () => paginate(DUMMY_FEE_TEMPLATES, filters.page, filters.limit),
//     ),

//   getById: (id) =>
//     withFallback(
//       () => api.get(`/fee-templates/${id}`).then((r) => r.data),
//       () => ({ data: DUMMY_FEE_TEMPLATES.find((t) => t.id === id) ?? null }),
//     ),

//   // body: { name, description, applicable_classes, components[], late_fine_per_day, due_day }
//   create: (body) =>
//     withFallback(
//       () => api.post('/fee-templates', body).then((r) => r.data),
//       () => ({
//         data: {
//           ...body,
//           id: `ft-${Date.now()}`,
//           is_active: true,
//           created_at: new Date().toISOString(),
//         },
//       }),
//     ),

//   update: (id, body) =>
//     withFallback(
//       () => api.put(`/fee-templates/${id}`, body).then((r) => r.data),
//       () => ({ data: { id, ...body } }),
//     ),

//   delete: (id) =>
//     withFallback(
//       () => api.delete(`/fee-templates/${id}`).then((r) => r.data),
//       () => ({ data: { id } }),
//     ),

//   // body: { class_ids?: string[], student_ids?: string[] }
//   assign: (id, body) =>
//     withFallback(
//       () => api.post(`/fee-templates/${id}/assign`, body).then((r) => r.data),
//       () => ({ data: { id, assigned: true } }),
//     ),
// };








// src/services/feeTemplateService.js

/**
 * Fee Template API Service
 * GET    /fee-templates              (list with filters)
 * POST   /fee-templates              (create)
 * GET    /fee-templates/:id          (single)
 * PUT    /fee-templates/:id          (update)
 * DELETE /fee-templates/:id          (delete)
 * PATCH  /fee-templates/:id/toggle-status (toggle active/inactive)
 * POST   /fee-templates/:id/assign   (assign to classes/sections)
 * GET    /fee-templates/options       (dropdown options)
 */

import api from '@/lib/api';
import { buildQuery } from '@/lib/utils';

export const feeTemplateService = {
  /**
   * Get all fee templates with filters
   * @param {Object} params - { institute_id, branch_id, academic_year_id, search, status, is_default, page, limit }
   */
  getAll: async (params = {}) => {
    try {
      const queryString = buildQuery(params);
      const response = await api.get(`/fee-templates${queryString}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching fee templates:', error);
      return {
        data: [],
        pagination: {
          total: 0,
          page: 1,
          limit: 10,
          totalPages: 1
        }
      };
    }
  },

  /**
   * Get fee template by ID
   * @param {string} id - Template ID
   */
  getById: async (id) => {
    try {
      const response = await api.get(`/fee-templates/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching fee template:', error);
      throw error;
    }
  },

  /**
   * Get fee template options for dropdown
   * @param {Object} params - { institute_id, branch_id, is_active }
   */
  getOptions: async (params = {}) => {
    try {
      const queryString = buildQuery({ limit: 200, is_active: true, ...params });
      const response = await api.get(`/fee-templates${queryString}`);
      const list = response.data?.data || [];
      return {
        data: list.map(t => ({
          value: t.id,
          label: t.name,
          code: t.code,
          total_amount: t.total_amount,
          fee_basis: t.fee_basis,
          is_default: t.is_default
        }))
      };
    } catch (error) {
      console.error('Error fetching fee template options:', error);
      return { data: [] };
    }
  },

  /**
   * Create new fee template
   * @param {Object} data - Fee template data
   */
  create: async (data) => {
    try {
      const response = await api.post('/fee-templates', data);
      return response.data;
    } catch (error) {
      console.error('Error creating fee template:', error);
      throw error;
    }
  },

  /**
   * Update fee template
   * @param {string} id - Template ID
   * @param {Object} data - Update data
   */
  update: async (id, data) => {
    try {
      const response = await api.put(`/fee-templates/${id}`, data);
      return response.data;
    } catch (error) {
      console.error('Error updating fee template:', error);
      throw error;
    }
  },

  /**
   * Delete fee template
   * @param {string} id - Template ID
   */
  delete: async (id) => {
    try {
      const response = await api.delete(`/fee-templates/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error deleting fee template:', error);
      throw error;
    }
  },

  /**
   * Toggle fee template status
   * @param {string} id - Template ID
   * @param {boolean} isActive - Active status
   */
  toggleStatus: async (id, isActive) => {
    try {
      const response = await api.patch(`/fee-templates/${id}/toggle-status`, { is_active: isActive });
      return response.data;
    } catch (error) {
      console.error('Error toggling fee template status:', error);
      throw error;
    }
  },

  /**
   * Assign fee template to classes/sections/students
   * @param {string} id - Template ID
   * @param {Object} assignData - { class_ids, section_ids, student_ids, all_classes }
   */
  assign: async (id, assignData) => {
    try {
      const response = await api.post(`/fee-templates/${id}/assign`, assignData);
      return response.data;
    } catch (error) {
      console.error('Error assigning fee template:', error);
      throw error;
    }
  },

  /**
   * Calculate fee template totals from components (client-side)
   * @param {Array} components - Fee components array
   */
  calculateTotals: (components) => {
    let baseTotal = 0;
    let totalDiscount = 0;
    
    // First pass: calculate fixed amounts
    components.forEach(comp => {
      if (comp.type === 'fee' && comp.amount_type === 'fixed') {
        baseTotal += Number(comp.amount_value) || 0;
      }
    });
    
    // Second pass: calculate all components with discounts
    components.forEach(comp => {
      let grossAmount = 0;
      let discountAmount = 0;
      
      if (comp.type === 'fee') {
        if (comp.amount_type === 'fixed') {
          grossAmount = Number(comp.amount_value) || 0;
        } else if (comp.amount_type === 'percentage') {
          grossAmount = (baseTotal * (Number(comp.amount_value) || 0)) / 100;
        }
        
        // Apply component discount
        if (comp.discount_type === 'fixed') {
          discountAmount = Number(comp.discount_value) || 0;
        } else if (comp.discount_type === 'percentage') {
          discountAmount = (grossAmount * (Number(comp.discount_value) || 0)) / 100;
        }
        
        totalDiscount += discountAmount;
      }
    });
    
    const finalTotal = baseTotal - totalDiscount;
    
    return {
      base_total: baseTotal,
      total_discount: totalDiscount,
      final_total: finalTotal,
      component_count: components.length,
      discount_components: components.filter(c => c.discount_type).length
    };
  }
};