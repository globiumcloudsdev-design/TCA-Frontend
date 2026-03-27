/**
 * Fee API Service
 * GET    /fees/vouchers
 * POST   /fees/vouchers
 * GET    /fees/vouchers/:id
 * PATCH  /fees/vouchers/:id/collect   (collect payment)
 * GET    /fees/payments               (payment records)
 */

import api from '@/lib/api';
import { buildQuery } from '@/lib/utils';
import { withFallback } from '@/lib/withFallback';
import { DUMMY_FEES, paginate } from '@/data/dummyData';

export const feeService = {
  // ─── Original named methods ───────────────────────────────
  // List vouchers
  // filters: { student_id, status, month, year, academic_year_id, page, limit }
  getVouchers: (filters = {}) =>
    withFallback(
      () => api.get(`/fees/vouchers${buildQuery(filters)}`).then((r) => r.data),
      () => paginate(DUMMY_FEES, filters.page, filters.limit),
    ),

  // ─── Alias methods used by fees/page.js ──────────────────
  getAll:  (filters = {}) =>
    withFallback(
      () => api.get(`/fees/vouchers${buildQuery(filters)}`).then((r) => r.data),
      () => paginate(DUMMY_FEES, filters.page, filters.limit),
    ),
  create:  (body)        => api.post('/fees/vouchers', body).then((r) => r.data),
  update:  (id, body)    => api.put(`/fees/vouchers/${id}`, body).then((r) => r.data),
  delete:  (id)          => api.delete(`/fees/vouchers/${id}`).then((r) => r.data),
  collect: (id, body)    => api.patch(`/fees/vouchers/${id}/collect`, body).then((r) => r.data),

  getVoucherById: (id) =>
    api.get(`/fees/vouchers/${id}`).then((r) => r.data),

  // Create fee voucher
  // body: { student_id, amount, month, year, due_date, academic_year_id,
  //         discount?, fee_breakdown?, notes? }
  createVoucher: (body) =>
    api.post('/fees/vouchers', body).then((r) => r.data),

  updateVoucher: (id, body) =>
    api.put(`/fees/vouchers/${id}`, body).then((r) => r.data),

  // Collect payment on a voucher
  // body: { amount_paid, payment_method, transaction_id?, notes? }
  collectPayment: (voucherId, body) =>
    api.patch(`/fees/vouchers/${voucherId}/collect`, body).then((r) => r.data),

  // All payment records
  getPayments: (filters = {}) =>
    api.get(`/fees/payments${buildQuery(filters)}`).then((r) => r.data),
};
