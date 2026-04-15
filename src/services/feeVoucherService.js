/**
 * Fee Voucher Service — Frontend
 * 
 * Handles all fee voucher operations:
 * - Generate single student voucher
 * - Generate class-wise vouchers
 * - Generate institute-wide vouchers
 * - Fetch vouchers with filters
 * - Delete/Archive vouchers
 * 
 * Usage:
 *   feeVoucherService.generateSingle(studentId, month, year)
 *   feeVoucherService.generateClass(classId, month, year)
 *   feeVoucherService.generateInstitute(month, year)
 *   feeVoucherService.getAll(filters, pagination)
 */

import api from '@/lib/api';
import { buildQuery } from '@/lib/utils';

/**
 * Normalize pagination
 */
const normalizePagination = (page = 1, limit = 20) => ({
  page: Math.max(1, parseInt(page)),
  limit: Math.max(1, Math.min(100, parseInt(limit))) // Cap at 100
});

/**
 * Build filters for voucher queries
 */
const buildVoucherFilters = (filters = {}) => {
  const base = {};
  
  if (filters.month !== undefined && filters.month !== null) {
    base.month = parseInt(filters.month);
  }
  if (filters.year !== undefined && filters.year !== null) {
    base.year = parseInt(filters.year);
  }
  if (filters.status) {
    base.status = filters.status;
  }
  if (filters.student_id) {
    base.student_id = filters.student_id;
  }
  if (filters.class_id) {
    base.class_id = filters.class_id;
  }
  if (filters.academic_year_id) {
    base.academic_year_id = filters.academic_year_id;
  }
  
  return base;
};

/**
 * Transform API response for consistent structure
 */
const transformVoucherResponse = (data) => {
  if (!data) return null;
  
  return {
    id: data.id,
    voucherNumber: data.voucher_number || data.voucher_no,
    studentId: data.student_id,
    studentName: data.Student?.first_name && data.Student?.last_name 
      ? `${data.Student.first_name} ${data.Student.last_name}`
      : data.student_name || 'N/A',
    registrationNo: data.Student?.registration_no || data.registration_no,
    month: data.month,
    year: data.year,
    amount: parseFloat(data.amount),
    discount: parseFloat(data.discount || 0),
    netAmount: parseFloat(data.net_amount),
    currency: data.currency || 'PKR',
    status: data.status,
    notes: data.notes,
    feeBreakdown: data.fee_breakdown || {},
    issuedDate: data.issued_date,
    dueDate: data.due_date,
    createdAt: data.created_at,
    updatedAt: data.updated_at,
    archived: data.archived || false
  };
};

/**
 * Transform list response
 */
const transformVouchersList = (response) => {
  return {
    vouchers: (response.data?.vouchers || response.data || []).map(transformVoucherResponse),
    pagination: response.data?.pagination || response.pagination || {
      total: response.data?.vouchers?.length || response.data?.length || 0,
      page: 1,
      limit: response.data?.vouchers?.length || response.data?.length || 20,
      totalPages: 1
    }
  };
};

export const feeVoucherService = {
  /**
   * Generate voucher for single student
   * @param {string} studentId - Student UUID
   * @param {number} month - Month (1-12)
   * @param {number} year - Year (e.g., 2026)
   * @param {object} options - Optional parameters {dueDate, academicYearId}
   * @returns {Promise<object>} Generated voucher
   */
  generateSingle: async (studentId, month, year, options = {}) => {
    try {
      if (!studentId) throw new Error('Student ID is required');
      if (!month || month < 1 || month > 12) throw new Error('Valid month (1-12) is required');
      if (!year || year < 2000) throw new Error('Valid year is required');

      const response = await api.post('/fee-vouchers/generate-single', {
        studentId,
        month: parseInt(month),
        year: parseInt(year),
        dueDate: options.dueDate || undefined,
        academicYearId: options.academicYearId || undefined,
      }, {
        timeout: 10000 // 10 second timeout
      });

      return transformVoucherResponse(response.data?.data);
    } catch (error) {
      console.error('❌ Failed to generate single voucher:', error);
      throw {
        message: error.response?.data?.message || error.message || 'Failed to generate voucher',
        status: error.response?.status,
        error
      };
    }
  },

  /**
   * Generate vouchers for entire class
   * @param {string} classId - Class UUID
   * @param {number} month - Month (1-12)
   * @param {number} year - Year
   * @param {object} options - Optional parameters {dueDate, academicYearId}
   * @returns {Promise<object>} Summary with generated vouchers count
   */
  generateClass: async (classId, month, year, options = {}) => {
    try {
      if (!classId) throw new Error('Class ID is required');
      if (!month || month < 1 || month > 12) throw new Error('Valid month (1-12) is required');
      if (!year || year < 2000) throw new Error('Valid year is required');

      const response = await api.post('/fee-vouchers/generate-class', {
        classId,
        month: parseInt(month),
        year: parseInt(year),
        dueDate: options.dueDate || undefined,
        academicYearId: options.academicYearId || undefined,
      }, {
        timeout: 30000 // 30 second timeout for bulk operation
      });

      const result = response.data?.data || {};
      return {
        total: result.total || 0,
        generated: result.generated || 0,
        failed: result.failed || 0,
        vouchers: (result.vouchers || []).map(transformVoucherResponse),
        message: `Successfully generated ${result.generated} out of ${result.total} vouchers`
      };
    } catch (error) {
      console.error('❌ Failed to generate class vouchers:', error);
      throw {
        message: error.response?.data?.message || error.message || 'Failed to generate class vouchers',
        status: error.response?.status,
        error
      };
    }
  },

  /**
   * Generate vouchers for entire institute
   * @param {number} month - Month (1-12)
   * @param {number} year - Year
   * @param {object} options - Optional parameters {dueDate, academicYearId}
   * @returns {Promise<object>} Summary with generated vouchers
   */
  generateInstitute: async (month, year, options = {}) => {
    try {
      if (!month || month < 1 || month > 12) throw new Error('Valid month (1-12) is required');
      if (!year || year < 2000) throw new Error('Valid year is required');

      const response = await api.post('/fee-vouchers/generate-institute', {
        month: parseInt(month),
        year: parseInt(year),
        dueDate: options.dueDate || undefined,
        academicYearId: options.academicYearId || undefined,
      }, {
        timeout: 60000 // 60 second timeout for full institute
      });

      const result = response.data?.data || {};
      return {
        total: result.total || 0,
        generated: result.generated || 0,
        failed: result.failed || 0,
        failedDetails: result.failedDetails || [],
        vouchers: (result.vouchers || []).map(transformVoucherResponse),
        message: `Successfully generated ${result.generated} out of ${result.total} vouchers`,
        successRate: result.total > 0 ? Math.round((result.generated / result.total) * 100) : 0
      };
    } catch (error) {
      console.error('❌ Failed to generate institute vouchers:', error);
      throw {
        message: error.response?.data?.message || error.message || 'Failed to generate institute vouchers',
        status: error.response?.status,
        error
      };
    }
  },

  /**
   * Get all fee vouchers with filters and pagination
   * @param {object} filters - Filter criteria {month, year, status, student_id, class_id}
   * @param {object} pagination - {page, limit}
   * @returns {Promise<object>} Vouchers list with pagination
   */
  getAll: async (filters = {}, pagination = {}) => {
    try {
      const { page, limit } = normalizePagination(pagination.page, pagination.limit);
      const voucherFilters = buildVoucherFilters(filters);
      
      const queryParams = {
        ...voucherFilters,
        page,
        limit
      };

      const queryString = buildQuery(queryParams);
      const response = await api.get(`/fee-vouchers${queryString}`, {
        timeout: 10000
      });

      return transformVouchersList(response.data);
    } catch (error) {
      console.error('❌ Failed to fetch vouchers:', error);
      throw {
        message: error.response?.data?.message || error.message || 'Failed to fetch vouchers',
        status: error.response?.status,
        error
      };
    }
  },

  /**
   * Get single voucher by ID
   * @param {string} voucherId - Voucher UUID
   * @returns {Promise<object>} Voucher details
   */
  getById: async (voucherId) => {
    try {
      if (!voucherId) throw new Error('Voucher ID is required');

      const response = await api.get(`/fee-vouchers/${voucherId}`, {
        timeout: 5000
      });

      return transformVoucherResponse(response.data?.data);
    } catch (error) {
      console.error('❌ Failed to fetch voucher:', error);
      throw {
        message: error.response?.data?.message || error.message || 'Failed to fetch voucher',
        status: error.response?.status,
        error
      };
    }
  },

  /**
   * Archive/Delete voucher
   * @param {string} voucherId - Voucher UUID
   * @returns {Promise<object>} Archived voucher
   */
  delete: async (voucherId) => {
    try {
      if (!voucherId) throw new Error('Voucher ID is required');

      const response = await api.delete(`/fee-vouchers/${voucherId}`, {
        timeout: 5000
      });

      return transformVoucherResponse(response.data?.data);
    } catch (error) {
      console.error('❌ Failed to delete voucher:', error);
      if (error.response?.status === 400) {
        throw {
          message: 'Cannot delete paid voucher. Archive only applies to pending vouchers.',
          status: 400,
          error
        };
      }
      throw {
        message: error.response?.data?.message || error.message || 'Failed to delete voucher',
        status: error.response?.status,
        error
      };
    }
  },

  /**
   * Update voucher status (mark as paid, pending, etc)
   * @param {string} voucherId - Voucher ID
   * @param {string} status - New status (paid, pending, cancelled, etc)
   * @returns {Promise<object>} Updated voucher
   */
  updateStatus: async (voucherId, status) => {
    try {
      if (!voucherId) throw new Error('Voucher ID is required');
      if (!status) throw new Error('Status is required');

      const response = await api.patch(`/fee-vouchers/${voucherId}/status`, {
        status
      }, {
        timeout: 5000
      });

      return transformVoucherResponse(response.data?.data || response.data);
    } catch (error) {
      console.error('❌ Failed to update voucher status:', error);
      throw {
        message: error.response?.data?.message || error.message || 'Failed to update voucher status',
        status: error.response?.status,
        error
      };
    }
  },

  /**
   * Get vouchers by month/year for statistics
   * @param {number} month - Month (1-12)
   * @param {number} year - Year
   * @returns {Promise<object>} Statistics and vouchers
   */
  getByMonthYear: async (month, year) => {
    try {
      if (!month || month < 1 || month > 12) throw new Error('Valid month (1-12) is required');
      if (!year || year < 2000) throw new Error('Valid year is required');

      const response = await api.get(`/fee-vouchers${buildQuery({
        month: parseInt(month),
        year: parseInt(year),
        limit: 1000
      })}`, {
        timeout: 10000
      });

      const vouchers = (response.data?.data?.vouchers || response.data?.data || [])
        .map(transformVoucherResponse);

      // Calculate statistics
      const stats = {
        total: vouchers.length,
        totalAmount: vouchers.reduce((sum, v) => sum + v.amount, 0),
        totalDiscount: vouchers.reduce((sum, v) => sum + v.discount, 0),
        totalNet: vouchers.reduce((sum, v) => sum + v.netAmount, 0),
        byStatus: {
          pending: vouchers.filter(v => v.status === 'pending').length,
          paid: vouchers.filter(v => v.status === 'paid').length,
          overdue: vouchers.filter(v => v.status === 'overdue').length,
          partial: vouchers.filter(v => v.status === 'partial').length,
          cancelled: vouchers.filter(v => v.status === 'cancelled').length
        }
      };

      return { vouchers, stats };
    } catch (error) {
      console.error('❌ Failed to fetch month/year vouchers:', error);
      throw {
        message: error.response?.data?.message || error.message || 'Failed to fetch vouchers',
        status: error.response?.status,
        error
      };
    }
  },

  /**
   * Get vouchers by student
   * @param {string} studentId - Student UUID
   * @param {object} pagination - {page, limit}
   * @returns {Promise<object>} Student's vouchers
   */
  getByStudent: async (studentId, pagination = {}) => {
    try {
      if (!studentId) throw new Error('Student ID is required');

      return await feeVoucherService.getAll({ student_id: studentId }, pagination);
    } catch (error) {
      console.error('❌ Failed to fetch student vouchers:', error);
      throw error;
    }
  },

  /**
   * Get vouchers by class for batch operations view
   * @param {string} classId - Class UUID
   * @param {object} pagination - {page, limit}
   * @returns {Promise<object>} Class vouchers
   */
  getByClass: async (classId, pagination = {}) => {
    try {
      if (!classId) throw new Error('Class ID is required');

      return await feeVoucherService.getAll({ class_id: classId }, pagination);
    } catch (error) {
      console.error('❌ Failed to fetch class vouchers:', error);
      throw error;
    }
  },

  /**
   * Check if voucher already exists for month/year/student
   * @param {string} studentId - Student UUID
   * @param {number} month - Month
   * @param {number} year - Year
   * @returns {Promise<boolean>} True if exists
   */
  exists: async (studentId, month, year) => {
    try {
      const result = await feeVoucherService.getAll({
        student_id: studentId,
        month,
        year
      }, { page: 1, limit: 1 });

      return (result.vouchers || []).length > 0;
    } catch (error) {
      console.error('❌ Failed to check voucher existence:', error);
      return false;
    }
  },

  /**
   * Export vouchers to CSV
   * @param {array} vouchers - Vouchers array
   * @returns {string} CSV content
   */
  exportToCSV: (vouchers = []) => {
    try {
      if (!Array.isArray(vouchers) || vouchers.length === 0) {
        throw new Error('No vouchers to export');
      }

      const headers = [
        'Voucher Number',
        'Student Name',
        'Registration No',
        'Month/Year',
        'Amount',
        'Discount',
        'Net Amount',
        'Currency',
        'Status',
        'Issued Date'
      ];

      const rows = vouchers.map(v => [
        v.voucherNumber,
        v.studentName,
        v.registrationNo,
        `${v.month}/${v.year}`,
        v.amount.toFixed(2),
        v.discount.toFixed(2),
        v.netAmount.toFixed(2),
        v.currency,
        v.status,
        new Date(v.issuedDate).toLocaleDateString()
      ]);

      const csvContent = [
        headers.join(','),
        ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
      ].join('\n');

      return csvContent;
    } catch (error) {
      console.error('❌ Failed to export CSV:', error);
      throw error;
    }
  }
};

export default feeVoucherService;
