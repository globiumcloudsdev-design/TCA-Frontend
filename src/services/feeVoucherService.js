

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
import { sectionService, classService } from '@/services';
import { studentService } from './studentService';

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
 if (Array.isArray(filters.student_ids) && filters.student_ids.length > 0) {
   base.student_ids = filters.student_ids;
 }
  if (filters.class_id) {
    base.class_id = filters.class_id;
  }
  if (filters.section_id) {
    base.section_id = filters.section_id;
  }
  if (filters.fee_type) {
    base.fee_type = filters.fee_type;
  }
  if (filters.fee_template_id) {
    base.fee_template_id = filters.fee_template_id;
  }
  if (filters.academic_year_id) {
    base.academic_year_id = filters.academic_year_id;
  }
  if (filters.search) {
    base.search = filters.search;
  }
  
  return base;
};

const normalizeText = (value) => {
  const raw = String(value ?? '').trim();
  if (!raw) return '';
  const normalized = raw.toLowerCase();
  if (normalized === 'n/a' || normalized === 'na' || normalized === '-' || normalized === 'undefined' || normalized === 'null') {
    return '';
  }
  return raw;
};

const pickFirst = (...values) => {
  for (const value of values) {
    if (value !== undefined && value !== null && String(value).trim() !== '') {
      return value;
    }
  }
  return undefined;
};

const MONTH_NAMES_LIST = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

/**
 * Derives a clean human-readable month string (e.g. "July 2026 Voucher", "August 2026 Voucher")
 */
export const computeVoucherMonthLabel = (data = {}, options = {}) => {
  if (!data) return options?.withSuffix === false ? 'Monthly' : 'Monthly Voucher';

  const withSuffix = options?.withSuffix !== false;
  const suffix = withSuffix ? ' Voucher' : '';

  // 1. Explicit month (1-12) & year
  const m = Number(data.month || data.fee_month || data.feeMonth);
  const y = Number(data.year || data.fee_year || data.feeYear);
  if (m >= 1 && m <= 12 && y >= 2000) {
    return `${MONTH_NAMES_LIST[m - 1]} ${y}${suffix}`;
  }
  if (m >= 1 && m <= 12) {
    const defaultYear = y || new Date().getFullYear();
    return `${MONTH_NAMES_LIST[m - 1]} ${defaultYear}${suffix}`;
  }

  // 2. String fee_month format like "2026-07" or "July 2026"
  const rawFeeMonth = String(data.fee_month || data.feeMonth || '').trim();
  if (rawFeeMonth) {
    if (/^\d{4}-\d{2}/.test(rawFeeMonth)) {
      const parts = rawFeeMonth.split('-');
      const monthIdx = parseInt(parts[1], 10) - 1;
      if (monthIdx >= 0 && monthIdx < 12) {
        return `${MONTH_NAMES_LIST[monthIdx]} ${parts[0]}${suffix}`;
      }
    }
    if (rawFeeMonth.toLowerCase().includes('voucher')) {
      return rawFeeMonth;
    }
    return `${rawFeeMonth}${suffix}`;
  }

  // 3. From due_date, issue_date, created_at
  const dateStr = data.due_date || data.dueDate || data.issue_date || data.issued_date || data.issuedDate || data.created_at || data.createdAt;
  if (dateStr) {
    const d = new Date(dateStr);
    if (!isNaN(d.getTime())) {
      return `${MONTH_NAMES_LIST[d.getMonth()]} ${d.getFullYear()}${suffix}`;
    }
  }

  return withSuffix ? 'Monthly Voucher' : 'Monthly';
};

/**
 * Sort vouchers strictly in ascending chronological order (oldest due_date first)
 */
export const sortVouchersChronologically = (vouchers = []) => {
  return [...vouchers].sort((a, b) => {
    // 1. Due date (primary)
    const aDue = a.due_date || a.dueDate;
    const bDue = b.due_date || b.dueDate;
    if (aDue && bDue) {
      const diff = new Date(aDue).getTime() - new Date(bDue).getTime();
      if (diff !== 0) return diff;
    } else if (aDue && !bDue) {
      return -1;
    } else if (!aDue && bDue) {
      return 1;
    }

    // 2. Year and Month
    const aYear = Number(a.year || a.fee_year || a.feeYear) || (aDue ? new Date(aDue).getFullYear() : 0);
    const bYear = Number(b.year || b.fee_year || b.feeYear) || (bDue ? new Date(bDue).getFullYear() : 0);
    if (aYear !== bYear && aYear > 0 && bYear > 0) return aYear - bYear;

    const aMonth = Number(a.month || a.fee_month || a.feeMonth) || (aDue ? new Date(aDue).getMonth() + 1 : 0);
    const bMonth = Number(b.month || b.fee_month || b.feeMonth) || (bDue ? new Date(bDue).getMonth() + 1 : 0);
    if (aMonth !== bMonth && aMonth > 0 && bMonth > 0) return aMonth - bMonth;

    // 3. Issue date or createdAt
    const aCreated = new Date(a.issue_date || a.issuedDate || a.created_at || a.createdAt || 0).getTime();
    const bCreated = new Date(b.issue_date || b.issuedDate || b.created_at || b.createdAt || 0).getTime();
    return aCreated - bCreated;
  });
};

const studentMetaCache = new Map();

/**
 * Transform API response for consistent structure
 */
const transformVoucherResponse = async (data, classServiceInstance = null, sectionServiceInstance = null) => {
  if (!data) return null;
  
  // Extract student record for deeper resolution
  const studentRaw = data.Student || data.student || {};

  const studentId = pickFirst(
    data.student_id,
    data.studentId,
    studentRaw.id,
    studentRaw.student_id,
    studentRaw.studentId,
  );

  // Comprehensive Class Name Resolution
  let className = 
    data.class_name ||
    data.className ||
    data.Class?.name ||
    data.class?.name ||
    studentRaw.class_name ||
    studentRaw.className ||
    studentRaw.Class?.name ||
    studentRaw.class?.name ||
    studentRaw.current_class?.name ||
    studentRaw.currentClass?.name ||
    studentRaw.Class?.class_name ||
    null;

  // Comprehensive Section Name Resolution
  let sectionName =
    data.section_name ||
    data.sectionName ||
    data.Section?.name ||
    data.section?.name ||
    studentRaw.section_name ||
    studentRaw.sectionName ||
    studentRaw.Section?.name ||
    studentRaw.section?.name ||
    studentRaw.current_section?.name ||
    studentRaw.currentSection?.name ||
    studentRaw.Section?.section_name ||
    null;

  let classId = pickFirst(
    data.class_id,
    data.classId,
    studentRaw.class_id,
    studentRaw.classId,
    studentRaw.Class?.id,
    studentRaw.Class?.class_id,
    studentRaw.class?.id,
    studentRaw.current_class_id,
    studentRaw.currentClassId,
  );

  let sectionId = pickFirst(
    data.section_id,
    data.sectionId,
    studentRaw.section_id,
    studentRaw.sectionId,
    studentRaw.Section?.id,
    studentRaw.Section?.section_id,
    studentRaw.section?.id,
    studentRaw.current_section_id,
    studentRaw.currentSectionId,
  );

  if ((!classId || !sectionId || !normalizeText(className) || !normalizeText(sectionName)) && studentId) {
    try {
      const cacheKey = String(studentId);
      let hydratedStudent = studentMetaCache.get(cacheKey);

      if (!hydratedStudent) {
        const studentResponse = await studentService.getById(studentId);
        hydratedStudent = studentResponse?.data?.data || studentResponse?.data || studentResponse || {};
        studentMetaCache.set(cacheKey, hydratedStudent);
      }

      classId = classId || pickFirst(
        hydratedStudent?.class_id,
        hydratedStudent?.classId,
        hydratedStudent?.Class?.id,
        hydratedStudent?.Class?.class_id,
        hydratedStudent?.class?.id,
        hydratedStudent?.current_class_id,
        hydratedStudent?.currentClassId,
      );

      sectionId = sectionId || pickFirst(
        hydratedStudent?.section_id,
        hydratedStudent?.sectionId,
        hydratedStudent?.Section?.id,
        hydratedStudent?.Section?.section_id,
        hydratedStudent?.section?.id,
        hydratedStudent?.current_section_id,
        hydratedStudent?.currentSectionId,
      );

      className = className ||
        hydratedStudent?.class_name ||
        hydratedStudent?.className ||
        hydratedStudent?.Class?.name ||
        hydratedStudent?.class?.name ||
        hydratedStudent?.current_class?.name ||
        hydratedStudent?.currentClass?.name ||
        null;

      sectionName = sectionName ||
        hydratedStudent?.section_name ||
        hydratedStudent?.sectionName ||
        hydratedStudent?.Section?.name ||
        hydratedStudent?.section?.name ||
        hydratedStudent?.current_section?.name ||
        hydratedStudent?.currentSection?.name ||
        null;
    } catch (studentHydrationError) {
      console.warn(`Failed to hydrate student ${studentId}:`, studentHydrationError?.message || studentHydrationError);
    }
  }

  // Try to resolve class name if missing
  if ((!className || className === null) && classId && classServiceInstance) {
    try {
      // Check cache first
      if (classServiceInstance._classCache && classServiceInstance._classCache.has(classId)) {
        className = classServiceInstance._classCache.get(classId);
      } else {
        const classData = await classServiceInstance.getById(classId);
        className = classData?.data?.name || classData?.name || `Class ${classId.slice(-4)}`;
        
        // Cache result
        if (!classServiceInstance._classCache) classServiceInstance._classCache = new Map();
        classServiceInstance._classCache.set(classId, className);
      }
    } catch (error) {
      console.warn(`Failed to fetch class ${classId}:`, error.message);
      className = `Class ${classId.slice(-4)}`;
    }
  }

  // Try to resolve section name if missing
  if ((!sectionName || sectionName === null) && sectionId && sectionServiceInstance) {
    try {
      // Check cache first
      if (sectionServiceInstance._sectionCache && sectionServiceInstance._sectionCache.has(sectionId)) {
        sectionName = sectionServiceInstance._sectionCache.get(sectionId);
      } else {
        const sectionData = await sectionServiceInstance.getById(sectionId);
        sectionName = sectionData?.data?.name || sectionData?.name || `Section ${sectionId.slice(-4)}`;
        
        // Cache result
        if (!sectionServiceInstance._sectionCache) sectionServiceInstance._sectionCache = new Map();
        sectionServiceInstance._sectionCache.set(sectionId, sectionName);
      }
    } catch (error) {
      console.warn(`Failed to fetch section ${sectionId}:`, error.message);
      sectionName = `Section ${sectionId.slice(-4)}`;
    }
  }

  // Final fallbacks
  className = normalizeText(className) || 'N/A';
  sectionName = normalizeText(sectionName) || 'N/A';
  const monthLabel = computeVoucherMonthLabel(data);

  return {
    id: data.id,
    voucherNumber: data.voucher_number || data.voucher_no || data.voucherNumber,
 
    studentId: studentId,
    studentName: studentRaw.first_name || studentRaw.full_name
      ? `${studentRaw.first_name || ''} ${studentRaw.last_name || ''}`.trim() || studentRaw.full_name
      : data.student_name || data.studentName || 'N/A',
    registrationNo: studentRaw.registration_no || studentRaw.registrationNo || data.registration_no || data.registrationNo,
    classId: classId,
    class_name: className,
    sectionId: sectionId,
    section_name: sectionName,
    month: data.month,
    year: data.year,
    monthLabel: monthLabel,
    month_label: monthLabel,
    academicYearId: data.academic_year_id || data.academicYearId || studentRaw.academic_year_id || studentRaw.academicYearId,
    amount: parseFloat(data.amount || 0),
    discount: parseFloat(data.discount || 0),
    netAmount: parseFloat(data.net_amount || data.netAmount || data.amount || 0),
    currency: data.currency || 'PKR',
    status: data.status || 'pending',
    feeType: data.fee_type || data.feeType,
    feeTemplateId: data.fee_template_id || data.feeTemplateId,
    notes: data.notes,
    feeBreakdown: data.fee_breakdown || data.feeBreakdown || {},
    issuedDate: data.issued_date || data.issuedDate,
    dueDate: data.due_date || data.dueDate,
    createdAt: data.created_at || data.createdAt,
    updatedAt: data.updated_at || data.updatedAt,
    archived: data.archived || false,
    student: studentRaw,
    
    // Partial payment fields
    paid_amount: parseFloat(data.paid_amount || 0),
    pending_amount: parseFloat(data.pending_amount ?? (data.net_amount || data.amount || 0)),
    FeePayments: data.FeePayments || data.payments || []
  };
};

/**
 * Transform list response with batch processing for class/section names
 */
const transformVouchersList = async (response, classServiceInstance = null, sectionServiceInstance = null) => {
  const vouchersRaw = response.data?.vouchers || response.data || [];
  
  // Process vouchers in batches to avoid overwhelming the API
  const batchSize = 20;
  const enrichedVouchers = [];
  
  for (let i = 0; i < vouchersRaw.length; i += batchSize) {
    const batch = vouchersRaw.slice(i, i + batchSize);
    const batchResults = await Promise.all(
      batch.map(v => transformVoucherResponse(v, classServiceInstance, sectionServiceInstance))
    );
    enrichedVouchers.push(...batchResults);
  }
  
  return {
    vouchers: enrichedVouchers,
    pagination: response.data?.pagination || response.pagination || {
      total: vouchersRaw.length,
      page: 1,
      limit: vouchersRaw.length || 20,
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
        include_arrears: false,
        includeArrears: false,
        merge_arrears: false,
        mergeArrears: false,
        separate_vouchers: true,
        separateVouchers: true,
      }, {
        timeout: 10000
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
        include_arrears: false,
        includeArrears: false,
        merge_arrears: false,
        mergeArrears: false,
        separate_vouchers: true,
        separateVouchers: true,
      }, {
        timeout: 600000
      });

      const result = response.data?.data || {};
      const vouchers = await Promise.all((result.vouchers || []).map((voucher) => transformVoucherResponse(voucher, classService, sectionService)));
      return {
        total: result.total || 0,
        generated: result.generated || 0,
        failed: result.failed || 0,
        vouchers,
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
        include_arrears: false,
        includeArrears: false,
        merge_arrears: false,
        mergeArrears: false,
        separate_vouchers: true,
        separateVouchers: true,
      }, {
        timeout: 600000
      });

      const result = response.data?.data || {};
      const vouchers = await Promise.all((result.vouchers || []).map((voucher) => transformVoucherResponse(voucher, classService, sectionService)));
      return {
        total: result.total || 0,
        generated: result.generated || 0,
        failed: result.failed || 0,
        failedDetails: result.failedDetails || [],
        vouchers,
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
  getAll: async (filters = {}, pagination = {}, requestOptions = {}, classServiceInstance = null, sectionServiceInstance = null) => {
    try {
      const { page, limit } = normalizePagination(pagination.page, pagination.limit);
      const voucherFilters = buildVoucherFilters(filters);
      const timeout = Number.isFinite(requestOptions?.timeout) ? requestOptions.timeout : 10000;
      
      const queryParams = {
        ...voucherFilters,
        page,
        limit
      };

      const queryString = buildQuery(queryParams);
      const response = await api.get(`/fee-vouchers${queryString}`, {
        timeout
      });

      // Use provided services or import defaults
      let classSvc = classServiceInstance || classService;
      let sectionSvc = sectionServiceInstance || sectionService;
      
      return transformVouchersList(response.data, classSvc, sectionSvc);
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
   * Backward-compatible alias used by FeesPage
   * @param {string} voucherId - Voucher UUID
   * @returns {Promise<object>} Voucher details
   */
  getVoucherById: async (voucherId) => {
    return feeVoucherService.getById(voucherId);
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
        'Class',
        'Section',
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
        v.class_name,
        v.section_name,
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
   * Backward-compatible collect API used by FeeCollectForm flows
   * Supports both legacy collect endpoint and new payment endpoint.
   * @param {string} voucherId - Voucher UUID
   * @param {object} body - {amount_paid, payment_method, transaction_id, notes, paid_date}
   * @returns {Promise<object>} Payment/collection response
   */
  collect: async (voucherId, body = {}) => {
    try {
      if (!voucherId) throw new Error('Voucher ID is required');

      const normalizedAmount = Number(body.amount_paid ?? body.amount);
      const normalizedMethod = body.payment_method || body.paymentMethod;

      if (!normalizedAmount || normalizedAmount <= 0) {
        throw new Error('Valid payment amount is required');
      }
      if (!normalizedMethod) {
        throw new Error('Payment method is required');
      }

      const legacyPayload = {
        amount_paid: normalizedAmount,
        payment_method: normalizedMethod,
        transaction_id: body.transaction_id || body.referenceNo || null,
        notes: body.notes || body.remarks || null,
        paid_date: body.paid_date || body.paidDate || undefined,
      };

      try {
        const response = await api.patch(`/fee-vouchers/${voucherId}/collect`, legacyPayload, {
          timeout: 10000,
        });
        return response.data?.data || response.data;
      } catch (legacyError) {
        if (legacyError?.response?.status && legacyError.response.status !== 404) {
          throw legacyError;
        }

        return await feeVoucherService.recordPayment(voucherId, {
          amount: normalizedAmount,
          paymentMethod: normalizedMethod,
          referenceNo: legacyPayload.transaction_id,
          remarks: legacyPayload.notes,
          paidDate: legacyPayload.paid_date,
        });
      }
    } catch (error) {
      console.error('❌ Failed to collect payment:', error);
      throw {
        message: error.response?.data?.message || error.message || 'Failed to collect payment',
        status: error.response?.status,
        details: error.response?.data?.details,
        error,
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
   * Process selective / manual fee voucher payment allocations
   * Distributes lump-sum or specific payments across chosen vouchers with strict balance verification.
   * @param {object} params - { studentId, totalAmount, paymentMethod, referenceNo, remarks, paidDate, allocations: [{ voucherId, amountApplied }] }
   * @returns {Promise<object>} Processing summary & updated voucher receipts
   */
  processSelectivePayment: async ({
    studentId,
    totalAmount,
    paymentMethod = 'cash',
    referenceNo = null,
    remarks = null,
    paidDate = null,
    allocations = []
  }) => {
    try {
      const parsedTotal = parseFloat(totalAmount);
      if (isNaN(parsedTotal) || parsedTotal <= 0) {
        throw new Error('Valid total payment amount is required');
      }
      if (!Array.isArray(allocations) || allocations.length === 0) {
        throw new Error('At least one voucher allocation is required');
      }

      const activeAllocations = allocations.filter(a => a.voucherId && parseFloat(a.amountApplied) > 0);
      if (activeAllocations.length === 0) {
        throw new Error('No allocations with positive amount found');
      }

      const totalAllocated = activeAllocations.reduce((sum, a) => sum + parseFloat(a.amountApplied), 0);
      if (Math.abs(totalAllocated - parsedTotal) > 0.01) {
        throw new Error(`Total allocated (PKR ${totalAllocated.toFixed(2)}) must match total received (PKR ${parsedTotal.toFixed(2)})`);
      }

      const payload = {
        studentId,
        totalAmount: parsedTotal,
        paymentMethod,
        referenceNo: referenceNo || null,
        remarks: remarks || null,
        paidDate: paidDate || new Date().toISOString().split('T')[0],
        allocations: activeAllocations.map(a => ({
          voucherId: a.voucherId,
          amountApplied: parseFloat(a.amountApplied)
        }))
      };

      // 1. Try dedicated selective payment endpoint on backend
      try {
        const response = await api.post('/fee-vouchers/process-selective-payment', payload, {
          timeout: 20000
        });
        return {
          success: true,
          message: response.data?.message || 'Selective payment processed successfully',
          data: response.data?.data || response.data
        };
      } catch (endpointError) {
        // If error is not a 404 (e.g. 403 Forbidden or 400 Validation), throw directly
        if (endpointError.response?.status && endpointError.response.status !== 404) {
          throw endpointError;
        }

        // 2. Fallback: Execute iterative voucher payments sequentially
        console.warn('Dedicated endpoint /fee-vouchers/process-selective-payment returned 404. Falling back to iterative voucher allocation...');
        
        const results = {
          success: true,
          totalAmount: parsedTotal,
          allocatedCount: activeAllocations.length,
          payments: []
        };

        for (const alloc of payload.allocations) {
          const singleResult = await feeVoucherService.recordPayment(alloc.voucherId, {
            amount: alloc.amountApplied,
            paymentMethod: payload.paymentMethod,
            referenceNo: payload.referenceNo,
            remarks: payload.remarks ? `${payload.remarks} (Selective Allocation)` : 'Selective Allocation',
            paidDate: payload.paidDate
          });
          results.payments.push({
            voucherId: alloc.voucherId,
            amountApplied: alloc.amountApplied,
            receipt: singleResult.receipt,
            paymentRecord: singleResult.paymentRecord
          });
        }

        // Post-transaction sync of student pending dues
        try {
          if (studentId) {
            await studentService.syncStudentPendingDues(studentId);
          }
        } catch (syncErr) {
          console.warn('Post-payment student dues sync note:', syncErr.message);
        }

        return results;
      }
    } catch (error) {
      console.error('❌ Failed to process selective payment:', error);
      throw {
        message: error.response?.data?.message || error.message || 'Failed to process selective payment',
        status: error.response?.status,
        details: error.response?.data?.details,
        error
      };
    }
  },

  /**
   * Get all unpaid / partial / overdue vouchers for a student
   * Sorted strictly in ascending chronological order (oldest month/due date first).
   * Explicitly computes human-readable month labels.
   * @param {string} studentId - Student UUID
   * @returns {Promise<Array>} List of sorted unpaid vouchers
   */
  getUnpaidByStudent: async (studentId) => {
    try {
      if (!studentId) throw new Error('Student ID is required');

      let vouchersList = [];

      // 1. Try dedicated endpoint GET /students/:id/unpaid-vouchers
      try {
        const response = await api.get(`/students/${studentId}/unpaid-vouchers`, {
          timeout: 10000
        });
        const raw = response.data?.data?.vouchers || response.data?.data || response.data?.vouchers || response.data || [];
        if (Array.isArray(raw) && raw.length > 0) {
          vouchersList = await Promise.all(raw.map(v => transformVoucherResponse(v, classService, sectionService)));
        }
      } catch (endpointError) {
        if (endpointError.response?.status && endpointError.response.status !== 404) {
          console.warn('Dedicated unpaid vouchers endpoint returned non-404 error:', endpointError.message);
        }
      }

      // 2. Fallback to feeVoucherService.getAll with student filter
      if (!vouchersList || vouchersList.length === 0) {
        const response = await feeVoucherService.getAll(
          { student_id: studentId },
          { page: 1, limit: 100 }
        );
        vouchersList = response?.vouchers || [];
      }

      // Filter: non-archived (archived = false), status pending/partial/overdue, with pending balance > 0
      const activeUnpaid = vouchersList.filter(
        (v) => !v.archived && ['pending', 'partial', 'overdue'].includes(String(v.status || '').toLowerCase()) && Number(v.pending_amount ?? (v.net_amount || v.amount || 0)) > 0
      );

      // Sort strictly in ascending chronological order (oldest due_date first)
      return sortVouchersChronologically(activeUnpaid);
    } catch (error) {
      console.error('❌ Failed to fetch unpaid student vouchers:', error);
      throw {
        message: error.response?.data?.message || error.message || 'Failed to fetch unpaid vouchers',
        status: error.response?.status,
        error
      };
    }
  },

  /**
   * Process FIFO multi-voucher payment
   * Allocates payment amount strictly in First-In, First-Out (FIFO) order to oldest pending vouchers.
   * @param {object} params - { studentId, totalAmount, paymentMethod, referenceNo, remarks, paidDate, allocations? }
   * @returns {Promise<object>} Payment execution results
   */
  processFifoPayment: async ({
    studentId,
    totalAmount,
    paymentMethod = 'cash',
    referenceNo = null,
    remarks = null,
    paidDate = null,
    allocations = null
  }) => {
    try {
      const parsedTotal = parseFloat(totalAmount);
      if (isNaN(parsedTotal) || parsedTotal <= 0) {
        throw new Error('Valid total payment amount is required');
      }

      let activeAllocations = allocations;
      if (!activeAllocations || activeAllocations.length === 0) {
        const unpaidVouchers = await feeVoucherService.getUnpaidByStudent(studentId);
        let remaining = parsedTotal;
        activeAllocations = [];
        for (const v of unpaidVouchers) {
          if (remaining <= 0) break;
          const pending = Number(v.pending_amount ?? (v.net_amount || v.amount || 0));
          const toApply = Math.min(remaining, pending);
          if (toApply > 0) {
            activeAllocations.push({
              voucherId: v.id,
              amountApplied: toApply
            });
            remaining -= toApply;
          }
        }
      }

      // 1. Try dedicated endpoint POST /fee-vouchers/process-fifo-payment
      try {
        const response = await api.post('/fee-vouchers/process-fifo-payment', {
          studentId,
          totalAmount: parsedTotal,
          paymentMethod,
          referenceNo,
          remarks,
          paidDate: paidDate || new Date().toISOString().split('T')[0],
          allocations: activeAllocations
        }, { timeout: 20000 });

        // Sync student pending dues post-transaction
        try {
          if (studentId) {
            await studentService.syncStudentPendingDues(studentId);
          }
        } catch (syncErr) {
          console.warn('Post-payment dues sync note:', syncErr.message);
        }

        return {
          success: true,
          message: response.data?.message || 'FIFO payment processed successfully',
          data: response.data?.data || response.data
        };
      } catch (fifoEndpointError) {
        if (fifoEndpointError.response?.status && fifoEndpointError.response.status !== 404) {
          throw fifoEndpointError;
        }

        // Fallback to processSelectivePayment
        const selectiveResult = await feeVoucherService.processSelectivePayment({
          studentId,
          totalAmount: parsedTotal,
          paymentMethod,
          referenceNo,
          remarks: remarks ? `${remarks} (FIFO Payment)` : 'FIFO Payment',
          paidDate,
          allocations: activeAllocations
        });

        // Sync student pending dues post-transaction
        try {
          if (studentId) {
            await studentService.syncStudentPendingDues(studentId);
          }
        } catch (syncErr) {
          console.warn('Post-payment dues sync note:', syncErr.message);
        }

        return selectiveResult;
      }
    } catch (error) {
      console.error('❌ Failed to process FIFO payment:', error);
      throw {
        message: error.response?.data?.message || error.message || 'Failed to process FIFO payment',
        status: error.response?.status,
        details: error.response?.data?.details,
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
  },

  /**
   * Get monthly/academic statistics for vouchers
   * @param {object} filters - {month, year, academic_year_id}
   * @returns {Promise<object>} Stats object
   */
  getStats: async (filters = {}) => {
    try {
      const queryString = buildQuery({
        month: filters.month ? parseInt(filters.month) : undefined,
        year: filters.year ? parseInt(filters.year) : undefined,
        academic_year_id: filters.academic_year_id || undefined
      });
      const response = await api.get(`/fee-vouchers/stats${queryString}`, {
        timeout: 10000
      });
      return response.data?.data || response.data || {};
    } catch (error) {
      console.error('❌ Failed to fetch voucher stats:', error);
      throw {
        message: error.response?.data?.message || error.message || 'Failed to fetch voucher stats',
        status: error.response?.status,
        error
      };
    }
  },

  /**
   * Get list of fee defaulters with >= 2 unpaid months
   * @returns {Promise<Array>} List of defaulters
   */
  getDefaulters: async () => {
    try {
      const response = await api.get('/fee-vouchers/defaulters', { timeout: 15000 });
      return response.data?.data || response.data || [];
    } catch (error) {
      console.error('❌ Failed to fetch fee defaulters:', error);
      throw {
        message: error.response?.data?.message || error.message || 'Failed to fetch fee defaulters',
        status: error.response?.status,
        error
      };
    }
  },

  /**
   * Warn fee defaulter and send real-time alerts
   * @param {string} studentId - The student user ID
   * @returns {Promise<object>} Warning result details
   */
  warnDefaulter: async (studentId) => {
    try {
      const response = await api.post(`/fee-vouchers/defaulters/${studentId}/warn`, {}, { timeout: 15000 });
      return response.data?.data || response.data || {};
    } catch (error) {
      console.error('❌ Failed to send fee warning alert:', error);
      throw {
        message: error.response?.data?.message || error.message || 'Failed to send fee warning alert',
        status: error.response?.status,
        error
      };
    }
  }

};

feeVoucherService.bulkDelete = async (voucherIds) => {
  try {
    if (!Array.isArray(voucherIds) || voucherIds.length === 0) {
      throw new Error('Voucher IDs array is required');
    }
    const response = await api.post('/fee-vouchers/bulk-delete', { voucherIds }, { timeout: 15000 });
    return response.data;
  } catch (error) {
    console.error('❌ Failed to bulk delete vouchers:', error);
    throw {
      message: error.response?.data?.message || error.message || 'Failed to bulk delete vouchers',
      status: error.response?.status,
      error
    };
  }
};

export default feeVoucherService;
