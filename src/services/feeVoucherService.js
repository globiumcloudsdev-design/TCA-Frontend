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

// ============================================================
// Constants
// ============================================================

export const FEE_TYPES = {
  MONTHLY: 'monthly',
  ANNUAL: 'annual',
  LAB: 'lab',
  ADMISSION: 'admission'
};

export const VOUCHER_STATUSES = {
  PENDING: 'pending',
  PAID: 'paid',
  PARTIAL: 'partial',
  OVERDUE: 'overdue',
  CANCELLED: 'cancelled'
};

export const PAYMENT_METHODS = {
  CASH: 'cash',
  CHEQUE: 'cheque',
  BANK_TRANSFER: 'bank_transfer',
  JAZZCASH: 'jazzcash',
  EASYPAISA: 'easypaisa',
  STRIPE: 'stripe',
  OTHER: 'other'
};

export const COLLECTION_CATEGORIES = {
  COLLECTED: 'collected',
  PARTIAL: 'partial',
  PENDING: 'pending',
  OVERDUE: 'overdue',
  DEFAULTERS: 'defaulters'
};

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
        feeType: options.feeType || 'monthly',
        dueDate: options.dueDate || undefined,
        academicYearId: options.academicYearId || undefined,
        feeTemplateId: options.feeTemplateId || undefined,
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
        feeType: options.feeType || 'monthly',
        dueDate: options.dueDate || undefined,
        academicYearId: options.academicYearId || undefined,
        feeTemplateId: options.feeTemplateId || undefined,
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
        feeType: options.feeType || 'monthly',
        dueDate: options.dueDate || undefined,
        academicYearId: options.academicYearId || undefined,
        feeTemplateId: options.feeTemplateId || undefined,
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
  },

  // ============================================================
  // PAYMENT ENDPOINTS (NEW)
  // ============================================================

  /**
   * Record payment for a voucher
   * @param {string} voucherId - Voucher UUID
   * @param {object} paymentData - {amount, paymentMethod, referenceNo, remarks, paidDate}
   * @returns {Promise<object>} Payment receipt
   */
  recordPayment: async (voucherId, paymentData = {}) => {
    try {
      if (!voucherId) throw new Error('Voucher ID is required');
      if (!paymentData.amount || paymentData.amount <= 0) throw new Error('Valid payment amount is required');
      if (!paymentData.paymentMethod) throw new Error('Payment method is required');

      const payload = {
        amount: parseFloat(paymentData.amount),
        paymentMethod: paymentData.paymentMethod,
        referenceNo: paymentData.referenceNo || null,
        remarks: paymentData.remarks || null,
        paidDate: paymentData.paidDate || new Date().toISOString().split('T')[0],
        institutionId: paymentData.institutionId || undefined
      };

      const response = await api.post(`/fee-vouchers/${voucherId}/payment`, payload, {
        timeout: 10000
      });

      return {
        success: true,
        message: response.data?.message || 'Payment recorded successfully',
        receipt: transformVoucherResponse(response.data?.data?.voucher),
        paymentRecord: response.data?.data?.payment,
        updatedStatus: response.data?.data?.status
      };
    } catch (error) {
      console.error('❌ Failed to record payment:', error);
      throw {
        message: error.response?.data?.message || error.message || 'Failed to record payment',
        status: error.response?.status,
        details: error.response?.data?.details,
        error
      };
    }
  },

  /**
   * Record multiple payments in batch
   * @param {array} payments - Array of {voucherId, amount, paymentMethod, ...}
   * @returns {Promise<object>} Batch result summary
   */
  recordBatchPayments: async (payments = []) => {
    try {
      if (!Array.isArray(payments) || payments.length === 0) {
        throw new Error('Payments array is required');
      }

      const validPayments = payments.filter(p => p.voucherId && p.amount > 0);
      if (validPayments.length === 0) {
        throw new Error('No valid payments found');
      }

      const results = {
        total: validPayments.length,
        successful: 0,
        failed: 0,
        details: []
      };

      for (const payment of validPayments) {
        try {
          const result = await feeVoucherService.recordPayment(payment.voucherId, payment);
          results.successful++;
          results.details.push({
            voucherId: payment.voucherId,
            success: true,
            receipt: result.receipt
          });
        } catch (error) {
          results.failed++;
          results.details.push({
            voucherId: payment.voucherId,
            success: false,
            error: error.message
          });
        }
      }

      return results;
    } catch (error) {
      console.error('❌ Failed to record batch payments:', error);
      throw {
        message: error.response?.data?.message || error.message || 'Failed to record batch payments',
        status: error.response?.status,
        error
      };
    }
  },

  /**
   * Get payment history for a voucher
   * @param {string} voucherId - Voucher UUID
   * @returns {Promise<object>} Payment history with summary
   */
  getPaymentHistory: async (voucherId) => {
    try {
      if (!voucherId) throw new Error('Voucher ID is required');

      const response = await api.get(`/fee-vouchers/${voucherId}/payment-history`, {
        timeout: 5000
      });

      const data = response.data?.data || {};
      return {
        voucherId,
        voucherNumber: data.voucherNumber,
        studentName: data.studentName,
        totalAmount: parseFloat(data.totalAmount || 0),
        totalPaid: parseFloat(data.totalPaid || 0),
        remaining: parseFloat(data.remaining || 0),
        fullyPaid: data.fullyPaid || false,
        payments: (data.payments || []).map(p => ({
          id: p.id,
          amount: parseFloat(p.amount),
          method: p.payment_method,
          referenceNo: p.reference_no,
          remarks: p.remarks,
          recordedDate: p.recorded_date,
          recordedBy: p.recorded_by
        })),
        lastPaymentDate: data.lastPaymentDate || null,
        paymentPercentage: data.totalAmount > 0 
          ? Math.round((data.totalPaid / data.totalAmount) * 100) 
          : 0
      };
    } catch (error) {
      console.error('❌ Failed to fetch payment history:', error);
      throw {
        message: error.response?.data?.message || error.message || 'Failed to fetch payment history',
        status: error.response?.status,
        error
      };
    }
  },

  /**
   * Get payment summary for collection analytics
   * @param {string} feeTypeId - Fee type (MONTHLY, ANNUAL, LAB, ADMISSION)
   * @param {object} filters - Optional filters {month, year, classId, branchId}
   * @returns {Promise<object>} Collection analytics
   */
  getPaymentSummary: async (feeTypeId, filters = {}) => {
    try {
      if (!feeTypeId) throw new Error('Fee type is required');

      const queryParams = buildQuery({
        feeTypeId,
        ...filters
      });

      const response = await api.get(`/fee-vouchers/payment-summary/${feeTypeId}${queryParams}`, {
        timeout: 15000
      });

      const data = response.data?.data || {};
      return {
        feeType: feeTypeId,
        period: data.period || 'all',
        summary: {
          totalVouchers: data.totalVouchers || 0,
          totalAmount: parseFloat(data.totalAmount || 0),
          totalCollected: parseFloat(data.totalCollected || 0),
          totalPartial: parseFloat(data.totalPartial || 0),
          totalPending: parseFloat(data.totalPending || 0),
          totalOverdue: parseFloat(data.totalOverdue || 0),
          collectionPercentage: data.collectionPercentage || 0,
          averagePaymentAmount: data.averagePaymentAmount || 0
        },
        byStatus: {
          collected: data.byStatus?.collected || 0,
          partial: data.byStatus?.partial || 0,
          pending: data.byStatus?.pending || 0,
          overdue: data.byStatus?.overdue || 0,
          defaulters: data.byStatus?.defaulters || 0
        },
        topDefaulters: (data.topDefaulters || []).map(d => ({
          studentId: d.student_id,
          studentName: d.student_name,
          registrationNo: d.registration_no,
          outstandingAmount: parseFloat(d.outstanding_amount),
          daysOverdue: d.days_overdue || 0,
          lastPaymentDate: d.last_payment_date
        })),
        monthlyTrend: (data.monthlyTrend || []).map(m => ({
          month: m.month,
          year: m.year,
          collected: parseFloat(m.collected || 0),
          target: parseFloat(m.target || 0),
          percentage: m.percentage || 0
        }))
      };
    } catch (error) {
      console.error('❌ Failed to fetch payment summary:', error);
      throw {
        message: error.response?.data?.message || error.message || 'Failed to fetch collection analytics',
        status: error.response?.status,
        error
      };
    }
  },

  // ============================================================
  // ANALYTICS & HELPER FUNCTIONS
  // ============================================================

  /**
   * Get overdue vouchers for a student or all students
   * @param {string} studentId - Optional student ID (if not provided, gets all overdue)
   * @param {object} pagination - {page, limit}
   * @returns {Promise<object>} Overdue vouchers
   */
  getOverdueVouchers: async (studentId = null, pagination = {}) => {
    try {
      const filters = {
        status: VOUCHER_STATUSES.OVERDUE,
        ...(studentId && { student_id: studentId })
      };

      return await feeVoucherService.getAll(filters, pagination);
    } catch (error) {
      console.error('❌ Failed to fetch overdue vouchers:', error);
      throw error;
    }
  },

  /**
   * Get pending vouchers due for payment
   * @param {string} studentId - Optional student ID
   * @param {object} pagination - {page, limit}
   * @returns {Promise<object>} Pending vouchers
   */
  getPendingVouchers: async (studentId = null, pagination = {}) => {
    try {
      const filters = {
        status: VOUCHER_STATUSES.PENDING,
        ...(studentId && { student_id: studentId })
      };

      return await feeVoucherService.getAll(filters, pagination);
    } catch (error) {
      console.error('❌ Failed to fetch pending vouchers:', error);
      throw error;
    }
  },

  /**
   * Get partial payment vouchers
   * @param {string} studentId - Optional student ID
   * @param {object} pagination - {page, limit}
   * @returns {Promise<object>} Partial payment vouchers
   */
  getPartialVouchers: async (studentId = null, pagination = {}) => {
    try {
      const filters = {
        status: VOUCHER_STATUSES.PARTIAL,
        ...(studentId && { student_id: studentId })
      };

      return await feeVoucherService.getAll(filters, pagination);
    } catch (error) {
      console.error('❌ Failed to fetch partial payment vouchers:', error);
      throw error;
    }
  },

  /**
   * Calculate collection rate from vouchers array
   * @param {array} vouchers - Vouchers array
   * @returns {number} Collection percentage (0-100)
   */
  calculateCollectionRate: (vouchers = []) => {
    if (!Array.isArray(vouchers) || vouchers.length === 0) return 0;

    const totalAmount = vouchers.reduce((sum, v) => sum + v.netAmount, 0);
    const totalPaid = vouchers
      .filter(v => v.status === VOUCHER_STATUSES.PAID)
      .reduce((sum, v) => sum + v.netAmount, 0);

    return totalAmount > 0 ? Math.round((totalPaid / totalAmount) * 100) : 0;
  },

  /**
   * Calculate outstanding amount (unpaid + overdue)
   * @param {array} vouchers - Vouchers array
   * @returns {number} Total outstanding
   */
  calculateOutstanding: (vouchers = []) => {
    if (!Array.isArray(vouchers) || vouchers.length === 0) return 0;

    return vouchers
      .filter(v => v.status !== VOUCHER_STATUSES.PAID && v.status !== VOUCHER_STATUSES.CANCELLED)
      .reduce((sum, v) => sum + v.netAmount, 0);
  },

  /**
   * Calculate paid amount from vouchers
   * @param {array} vouchers - Vouchers array
   * @returns {number} Total paid
   */
  calculatePaid: (vouchers = []) => {
    if (!Array.isArray(vouchers) || vouchers.length === 0) return 0;

    return vouchers
      .filter(v => v.status === VOUCHER_STATUSES.PAID)
      .reduce((sum, v) => sum + v.netAmount, 0);
  },

  /**
   * Group vouchers by status
   * @param {array} vouchers - Vouchers array
   * @returns {object} Grouped by status
   */
  groupByStatus: (vouchers = []) => {
    if (!Array.isArray(vouchers)) return {};

    return vouchers.reduce((groups, voucher) => {
      const status = voucher.status || VOUCHER_STATUSES.PENDING;
      if (!groups[status]) groups[status] = [];
      groups[status].push(voucher);
      return groups;
    }, {});
  },

  /**
   * Group vouchers by fee type
   * @param {array} vouchers - Vouchers array
   * @returns {object} Grouped by fee type
   */
  groupByFeeType: (vouchers = []) => {
    if (!Array.isArray(vouchers)) return {};

    return vouchers.reduce((groups, voucher) => {
      const type = voucher.feeType || FEE_TYPES.MONTHLY;
      if (!groups[type]) groups[type] = [];
      groups[type].push(voucher);
      return groups;
    }, {});
  },

  /**
   * Group vouchers by month/year
   * @param {array} vouchers - Vouchers array
   * @returns {object} Grouped by month/year
   */
  groupByMonthYear: (vouchers = []) => {
    if (!Array.isArray(vouchers)) return {};

    return vouchers.reduce((groups, voucher) => {
      const key = `${voucher.month}/${voucher.year}`;
      if (!groups[key]) groups[key] = [];
      groups[key].push(voucher);
      return groups;
    }, {});
  },

  /**
   * Format currency value
   * @param {number} value - Amount to format
   * @param {string} currency - Currency code (default PKR)
   * @returns {string} Formatted string
   */
  formatCurrency: (value = 0, currency = 'PKR') => {
    try {
      if (currency === 'PKR') {
        return `Rs. ${value.toLocaleString('en-PK', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
      }
      return value.toLocaleString('en-US', { style: 'currency', currency });
    } catch (error) {
      console.error('❌ Failed to format currency:', error);
      return `${currency} ${value.toFixed(2)}`;
    }
  },

  /**
   * Format date to readable string
   * @param {string|Date} date - Date to format
   * @returns {string} Formatted date
   */
  formatDate: (date) => {
    try {
      if (!date) return 'N/A';
      return new Date(date).toLocaleDateString('en-PK', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    } catch (error) {
      console.error('❌ Failed to format date:', error);
      return 'N/A';
    }
  },

  /**
   * Format date with time
   * @param {string|Date} date - Date to format
   * @returns {string} Formatted date and time
   */
  formatDateTime: (date) => {
    try {
      if (!date) return 'N/A';
      return new Date(date).toLocaleString('en-PK', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (error) {
      console.error('❌ Failed to format date/time:', error);
      return 'N/A';
    }
  },

  /**
   * Get status badge color for display
   * @param {string} status - Voucher status
   * @returns {object} {bgColor, textColor, label}
   */
  getStatusBadge: (status) => {
    const badges = {
      [VOUCHER_STATUSES.PAID]: {
        bgColor: 'bg-green-100',
        textColor: 'text-green-800',
        label: '✓ Paid',
        color: 'green'
      },
      [VOUCHER_STATUSES.PARTIAL]: {
        bgColor: 'bg-blue-100',
        textColor: 'text-blue-800',
        label: '◐ Partial',
        color: 'blue'
      },
      [VOUCHER_STATUSES.PENDING]: {
        bgColor: 'bg-yellow-100',
        textColor: 'text-yellow-800',
        label: '⏳ Pending',
        color: 'yellow'
      },
      [VOUCHER_STATUSES.OVERDUE]: {
        bgColor: 'bg-red-100',
        textColor: 'text-red-800',
        label: '⚠ Overdue',
        color: 'red'
      },
      [VOUCHER_STATUSES.CANCELLED]: {
        bgColor: 'bg-gray-100',
        textColor: 'text-gray-800',
        label: '✕ Cancelled',
        color: 'gray'
      }
    };

    return badges[status] || badges[VOUCHER_STATUSES.PENDING];
  },

  /**
   * Get payment method display label
   * @param {string} method - Payment method
   * @returns {string} Display label
   */
  getPaymentMethodLabel: (method) => {
    const labels = {
      [PAYMENT_METHODS.CASH]: '💵 Cash',
      [PAYMENT_METHODS.CHEQUE]: '📋 Cheque',
      [PAYMENT_METHODS.BANK_TRANSFER]: '🏦 Bank Transfer',
      [PAYMENT_METHODS.JAZZCASH]: '📱 JazzCash',
      [PAYMENT_METHODS.EASYPAISA]: '📱 Easypaisa',
      [PAYMENT_METHODS.STRIPE]: '💳 Card (Stripe)',
      [PAYMENT_METHODS.OTHER]: '❓ Other'
    };

    return labels[method] || method;
  },

  /**
   * Generate payment summary report as CSV
   * @param {object} summary - Payment summary data
   * @returns {string} CSV content
   */
  exportSummaryToCSV: (summary = {}) => {
    try {
      if (!summary.summary) throw new Error('Invalid summary data');

      const lines = [
        'Fee Collection Summary Report',
        `Fee Type,${summary.feeType}`,
        `Period,${summary.period}`,
        '',
        'Collection Metrics',
        `Total Vouchers,${summary.summary.totalVouchers}`,
        `Total Amount,"${summary.summary.totalAmount.toFixed(2)}"`,
        `Total Collected,"${summary.summary.totalCollected.toFixed(2)}"`,
        `Partial Payments,"${summary.summary.totalPartial.toFixed(2)}"`,
        `Collection %,${summary.summary.collectionPercentage}%`,
        '',
        'Status Breakdown',
        `Fully Collected,${summary.byStatus.collected}`,
        `Partial Payment,${summary.byStatus.partial}`,
        `Pending (Not Due),${summary.byStatus.pending}`,
        `Overdue,${summary.byStatus.overdue}`,
        `Defaulters,${summary.byStatus.defaulters}`
      ];

      if (summary.topDefaulters && summary.topDefaulters.length > 0) {
        lines.push('', 'Top Defaulters');
        lines.push('Student,Outstanding,Days Overdue,Last Payment');
        summary.topDefaulters.forEach(d => {
          lines.push(`"${d.studentName}","${d.outstandingAmount.toFixed(2)}",${d.daysOverdue},"${d.lastPaymentDate || 'N/A'}"`);
        });
      }

      return lines.join('\n');
    } catch (error) {
      console.error('❌ Failed to export summary:', error);
      throw error;
    }
  }

};

export default feeVoucherService;
