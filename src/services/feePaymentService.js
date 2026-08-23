/**
 * Fee Payment Service — Itemized Multi-Month Voucher FIFO Payment System
 * 
 * Handles:
 * - Real-time FIFO allocation calculations across multi-month vouchers
 * - Fetching unpaid/partial/overdue vouchers for students in chronological order (due_date ASC)
 * - Month labeling (e.g., "July 2026 Voucher", "August 2026 Voucher")
 * - Atomic FIFO & selective payments
 * - Post-transaction synchronization of Student.total_pending_dues
 */

import api from '@/lib/api';
import { feeVoucherService, computeVoucherMonthLabel, sortVouchersChronologically } from './feeVoucherService';
import { studentService } from './studentService';

/**
 * Extracts the single-month standalone pending fee (base_amount - paid_amount)
 * to prevent double-counting prior arrears rolled into net_amount across multi-month vouchers.
 */
export const getStandalonePending = (voucher) => {
  if (!voucher) return 0;
  const base = Number(
    voucher.base_amount ?? 
    voucher.baseAmount ?? 
    voucher.amount ?? 
    voucher.netAmount ?? 
    voucher.net_amount ?? 
    voucher.amount_due ?? 
    0
  );
  const paid = Number(voucher.paid_amount ?? voucher.paidAmount ?? 0);
  return Math.max(0, base - paid);
};

export const feePaymentService = {
  /**
   * Month label helper
   */
  formatMonthLabel: (voucher) => computeVoucherMonthLabel(voucher, { withSuffix: true }),

  /**
   * Sort vouchers chronologically
   */
  sortChronologically: (vouchers) => sortVouchersChronologically(vouchers),

  /**
   * Get single month standalone pending amount
   */
  getStandalonePendingAmount: (voucher) => getStandalonePending(voucher),

  /**
   * Pure FIFO Allocation Calculator
   * Given an array of vouchers and a payment amount, computes the exact
   * FIFO distribution starting from the oldest month (due_date ASC).
   * Allocates against standalone monthly fee (base_amount - paid_amount) to eliminate double-counting.
   * 
   * @param {Array} vouchers - Array of voucher objects
   * @param {number|string} totalReceivedAmount - Payment amount entered by user
   * @returns {Array} List of allocations with settlement details
   */
  calculateFifoAllocation: (vouchers = [], totalReceivedAmount = 0) => {
    const sorted = sortVouchersChronologically(vouchers);
    let remainingPayment = Math.max(parseFloat(totalReceivedAmount) || 0, 0);

    return sorted.map((voucher) => {
      const baseAmount = Number(
        voucher.base_amount ?? voucher.baseAmount ?? voucher.amount ?? voucher.net_amount ?? 0
      );
      const originalNetAmount = Number(
        voucher.net_amount || voucher.netAmount || voucher.amount_due || baseAmount
      );
      const alreadyPaid = Number(voucher.paid_amount || voucher.paidAmount || 0);
      const pendingAmount = getStandalonePending(voucher);

      let allocated = 0;
      let newRemainingBalance = pendingAmount;
      let settlementStatus = 'Unsettled'; // 'Fully Settled' | 'Partially Settled' | 'Unsettled'
      let newStatus = voucher.status || 'pending';

      if (remainingPayment >= pendingAmount && pendingAmount > 0) {
        allocated = pendingAmount;
        newRemainingBalance = 0;
        remainingPayment -= pendingAmount;
        settlementStatus = 'Fully Settled';
        newStatus = 'paid';
      } else if (remainingPayment > 0 && pendingAmount > 0) {
        allocated = remainingPayment;
        newRemainingBalance = pendingAmount - remainingPayment;
        remainingPayment = 0;
        settlementStatus = 'Partially Settled';
        newStatus = 'partial';
      } else {
        allocated = 0;
        newRemainingBalance = pendingAmount;
        settlementStatus = 'Unsettled';
        newStatus = voucher.status || 'pending';
      }

      const monthLabel = computeVoucherMonthLabel(voucher, { withSuffix: true });
      const newPaidAmount = alreadyPaid + allocated;

      return {
        voucher,
        voucherId: voucher.id,
        voucherNumber: voucher.voucherNumber || voucher.voucher_number || voucher.voucher_no || String(voucher.id).slice(-6),
        monthLabel,
        dueDate: voucher.due_date || voucher.dueDate || null,
        baseAmount,
        originalAmount: originalNetAmount,
        alreadyPaid,
        pendingAmount,
        allocatedAmount: allocated,
        newRemainingBalance: Math.max(0, newRemainingBalance),
        newPaidAmount,
        settlementStatus,
        badgeLabel: settlementStatus === 'Partially Settled' 
          ? `Partially Settled - ${Math.max(0, newRemainingBalance).toLocaleString('en-PK')} Remaining`
          : settlementStatus,
        newStatus,
        isFullySettled: settlementStatus === 'Fully Settled',
        isPartiallySettled: settlementStatus === 'Partially Settled',
        isUnpaid: settlementStatus === 'Unsettled' || settlementStatus === 'Unpaid',
      };
    });
  },

  /**
   * Fetch all active unpaid / partial / overdue vouchers for a student
   * (archived = false, ordered chronologically by due_date ASC)
   * 
   * @param {string} studentId - Student UUID
   * @returns {Promise<Array>}
   */
  getUnpaidVouchers: async (studentId) => {
    if (!studentId) return [];
    return await feeVoucherService.getUnpaidByStudent(studentId);
  },

  /**
   * Process FIFO payment for student with post-transaction student dues sync
   * 
   * @param {object} payload - { studentId, totalAmount, paymentMethod, referenceNo, remarks, paidDate, allocations? }
   * @returns {Promise<object>}
   */
  processFifoPayment: async (payload) => {
    const result = await feeVoucherService.processFifoPayment(payload);
    if (payload?.studentId) {
      try {
        await studentService.syncStudentPendingDues(payload.studentId);
      } catch (err) {
        console.warn('Post-transaction sync student pending dues error:', err);
      }
    }
    return result;
  },

  /**
   * Process selective / manual voucher allocations with post-transaction student dues sync
   * 
   * @param {object} payload - { studentId, totalAmount, paymentMethod, referenceNo, remarks, paidDate, allocations }
   * @returns {Promise<object>}
   */
  processSelectivePayment: async (payload) => {
    const result = await feeVoucherService.processSelectivePayment(payload);
    if (payload?.studentId) {
      try {
        await studentService.syncStudentPendingDues(payload.studentId);
      } catch (err) {
        console.warn('Post-transaction sync student pending dues error:', err);
      }
    }
    return result;
  },

  /**
   * Record single voucher payment
   * 
   * @param {string} voucherId - Voucher UUID
   * @param {object} paymentData - { amount, paymentMethod, referenceNo, remarks, paidDate }
   * @returns {Promise<object>}
   */
  recordPayment: async (voucherId, paymentData) => {
    return await feeVoucherService.recordPayment(voucherId, paymentData);
  },

  /**
   * Sync and update Student.total_pending_dues post-transaction
   * 
   * @param {string} studentId - Student UUID
   * @returns {Promise<object>}
   */
  syncStudentPendingDues: async (studentId) => {
    return await studentService.syncStudentPendingDues(studentId);
  },

  /**
   * Calculate total pending dues from voucher list using standalone single-month dues
   * to eliminate cumulative arrears double-counting (e.g. July 1,000 + August 1,000 = 2,000 PKR).
   * 
   * @param {Array} vouchers
   * @returns {number}
   */
  calculateTotalPendingDues: (vouchers = []) => {
    return (vouchers || []).reduce(
      (sum, v) => sum + getStandalonePending(v),
      0
    );
  },
};

export default feePaymentService;

