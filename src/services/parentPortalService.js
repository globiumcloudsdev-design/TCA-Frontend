// frontend/src/services/parentPortal.service.js

/**
 * The Clouds Academy - Parent Portal Frontend Service
 */

import api from '@/lib/api';

export const parentPortalService = {
  // ─────────────────────────────────────────────────────────────────────────
  // DASHBOARD
  // ─────────────────────────────────────────────────────────────────────────
  getDashboard: () =>
    api.get('/portal/parent/dashboard').then(r => r.data),

  // ─────────────────────────────────────────────────────────────────────────
  // PROFILE
  // ─────────────────────────────────────────────────────────────────────────
  getProfile: () =>
    api.get('/portal/parent/profile').then(r => r.data),

  updateProfile: (data) =>
    api.put('/portal/parent/profile', data, {
      headers: { 'Content-Type': 'multipart/form-data' }
    }),

  updateChildProfile: (childId, data) =>
    api.put(`/portal/parent/children/${childId}`, data, {
      headers: { 'Content-Type': 'multipart/form-data' }
    }).then(r => r.data),

  // ─────────────────────────────────────────────────────────────────────────
  // CHILDREN
  // ─────────────────────────────────────────────────────────────────────────
  getChildren: () =>
    api.get('/portal/parent/children').then(r => r.data),

  getChildDetails: (childId) =>
    api.get(`/portal/parent/children/${childId}`).then(r => r.data),

  // ─────────────────────────────────────────────────────────────────────────
  // CHILD ATTENDANCE
  // ─────────────────────────────────────────────────────────────────────────
  getChildAttendance: (childId, filters = {}) =>
    api.get(`/portal/parent/children/${childId}/attendance`, {
      params: filters
    }).then(r => r.data),

  getAttendanceMonths: (childId) =>
    api.get(`/portal/parent/children/${childId}/attendance/months`).then(r => r.data),

  // ─────────────────────────────────────────────────────────────────────────
  // CHILD RESULTS
  // ─────────────────────────────────────────────────────────────────────────
  getChildResults: (childId, filters = {}) =>
    api.get(`/portal/parent/children/${childId}/results`, {
      params: filters
    }).then(r => r.data),

  getResultStatistics: (childId) =>
    api.get(`/portal/parent/children/${childId}/results/statistics`).then(r => r.data),

  getExamResultDetails: (resultId) =>
    api.get(`/portal/parent/results/${resultId}`).then(r => r.data),

  // ─────────────────────────────────────────────────────────────────────────
  // CHILD FEES
  // ─────────────────────────────────────────────────────────────────────────
  // ─────────────────────────────────────────────────────────────────────────
  // CHILD FEE MANAGEMENT (Updated)
  // ─────────────────────────────────────────────────────────────────────────
  getChildFees: (childId, filters = {}) =>
    api.get(`/portal/parent/children/${childId}/fees`, {
      params: filters
    }).then(r => r.data),

  getFeeSummary: () =>
    api.get('/portal/parent/fees/summary').then(r => r.data),

  getVoucherDetails: (voucherId) =>
    api.get(`/portal/parent/fees/voucher/${voucherId}`).then(r => r.data),

  payFee: (voucherId, paymentData) =>
    api.post(`/portal/parent/fees/pay/${voucherId}`, paymentData).then(r => r.data),

  getPaymentHistory: (filters = {}) =>
    api.get('/portal/parent/payments/history', { params: filters }).then(r => r.data),

  // ─────────────────────────────────────────────────────────────────────────
  // ADDITIONAL FEE UTILITIES
  // ─────────────────────────────────────────────────────────────────────────
  getFeeStatistics: (childId) =>
    api.get(`/portal/parent/children/${childId}/fees/statistics`).then(r => r.data),

  downloadFeeReceipt: (voucherId, format = 'pdf') =>
    api.get(`/portal/parent/fees/receipt/${voucherId}`, {
      params: { format },
      responseType: 'blob'
    }).then(r => r.data),

  // ─────────────────────────────────────────────────────────────────────────
  // CHILD ASSIGNMENTS
  // ─────────────────────────────────────────────────────────────────────────
  getChildAssignments: (childId, filters = {}, page = 1, limit = 10) =>
    api.get(`/portal/parent/children/${childId}/assignments`, {
      params: { ...filters, page, limit }
    }).then(r => r.data),

  // ─────────────────────────────────────────────────────────────────────────
  // CHILD TIMETABLE
  // ─────────────────────────────────────────────────────────────────────────
  getChildTimetable: (childId) =>
    api.get(`/portal/parent/children/${childId}/timetable`).then(r => r.data),

  // ─────────────────────────────────────────────────────────────────────────
  // TEACHERS
  // ─────────────────────────────────────────────────────────────────────────
  getChildrenTeachers: () =>
    api.get('/portal/parent/teachers').then(r => r.data),

  // ─────────────────────────────────────────────────────────────────────────
  // NOTICES
  // ─────────────────────────────────────────────────────────────────────────
  // getNotices: (limit = 10) =>
  //   api.get('/portal/parent/notices', { params: { limit } }).then(r => r.data),

  getNotices: (limit = 10, page = 1) =>
    api.get('/portal/parent/notices', { params: { limit, page } }).then(r => r.data),


getNoticesForChild: (childId, filters = {}) =>
  api.get(`/portal/parent/children/${childId}/notices`, { params: filters }).then(r => r.data),
  // ─────────────────────────────────────────────────────────────────────────
  // LEAVE REQUESTS
  // ─────────────────────────────────────────────────────────────────────────
  getLeaveRequests: (filters = {}, page = 1, limit = 10) =>
    api.get('/portal/parent/leave-requests', {
      params: { ...filters, page, limit }
    }).then(r => r.data),

  createLeaveRequest: (data) =>
    api.post('/portal/parent/leave-requests', data).then(r => r.data),

  getLeaveRequestById: (id) =>
    api.get(`/portal/parent/leave-requests/${id}`).then(r => r.data),

  cancelLeaveRequest: (id, data = {}) =>
    api.patch(`/portal/parent/leave-requests/${id}/cancel`, data).then(r => r.data),

  getLeaveStatistics: (childId) =>
    api.get('/portal/parent/leave-requests/statistics', { params: { child_id: childId } }).then(r => r.data),

  getLeaveBalance: (childId) =>
    api.get('/portal/parent/leave-balance', { params: { child_id: childId } }).then(r => r.data)
};