
/**
 * Master Admin API Service
 * All calls require MASTER_ADMIN role (verified by backend).
 *
 * UPDATED with new subscription & invoice endpoints
 */

import api from '@/lib/api';
import { buildQuery } from '@/lib/utils';
import { withFallback } from '@/lib/withFallback';
import {
  DUMMY_MA_STATS, DUMMY_MA_SCHOOLS, DUMMY_MA_SUBSCRIPTIONS,
  DUMMY_MA_USERS, DUMMY_MA_SUBSCRIPTION_TEMPLATES, paginate,
  DUMMY_INVOICES, DUMMY_SUBSCRIPTION_HISTORY,
} from '@/data/dummyData';

export const masterAdminService = {
  // ─── Stats ────────────────────────────────────────────────
  getStats: () =>
    api.get('/dashboard/master').then((r) => r.data?.data ?? r.data),

  getReports: (params = {}) =>
    api.get(`/master-admin/reports${buildQuery(params)}`).then((r) => r.data?.data ?? r.data),

  // ─── Lookup tables (for dropdowns) ───────────────────────
  getInstituteTypes: () =>
    api.get('/master-admin/institute-types').then((r) => r.data),

  getPlatformRoles: () =>
    api.get('/master-admin/platform-roles').then((r) => r.data),

  // NEW: Get subscription plans for dropdown
  getSubscriptionPlans: (params = {}) =>
    api.get(`/master-admin/subscription-plans${buildQuery(params)}`).then((r) => r.data),

  // ─── Institutes (formerly Schools) ───────────────────────
  getSchools: (filters = {}) =>
    api.get(`/master-admin/institutes${buildQuery(filters)}`).then((r) => r.data),

  getSchoolById: (id, options = {}) => {
    const query = options.includeInvoiceSummary ? '?include_invoice_summary=true' : '';
    return api.get(`/master-admin/institutes/${id}${query}`).then((r) => r.data);
  },

  createSchool: (body) => {
    // Handle FormData for file upload
    if (body instanceof FormData) {
      return api.post('/master-admin/institutes', body, {
        headers: { 'Content-Type': 'multipart/form-data' }
      }).then((r) => r.data);
    }
    return api.post('/master-admin/institutes', body).then((r) => r.data);
  },

  updateSchool: (id, body) => {
    // Handle FormData for file upload
    if (body instanceof FormData) {
      return api.put(`/master-admin/institutes/${id}`, body, {
        headers: { 'Content-Type': 'multipart/form-data' }
      }).then((r) => r.data);
    }
    return api.put(`/master-admin/institutes/${id}`, body).then((r) => r.data);
  },

  toggleSchoolStatus: (id, is_active) =>
    api.patch(`/master-admin/institutes/${id}/status`, { is_active }).then((r) => r.data),

  updateInstituteSubscriptionStatus: (id, subscription_status) =>
    api.patch(`/master-admin/institutes/${id}/subscription-status`, { subscription_status }).then((r) => r.data),

  // NEW: Get real institute students
  getInstituteStudents: (id, filters = {}) =>
    api.get(`/master-admin/institutes/${id}/students${buildQuery(filters)}`).then((r) => r.data),
  
  // NEW: Get real institute teachers
  getInstituteTeachers: (id, filters = {}) =>
    api.get(`/master-admin/institutes/${id}/teachers${buildQuery(filters)}`).then((r) => r.data),
  
  // NEW: Get real institute parents
  getInstituteParents: (id, filters = {}) =>
    api.get(`/master-admin/institutes/${id}/parents${buildQuery(filters)}`).then((r) => r.data),
  
  // NEW: Get real institute staff
  getInstituteStaff: (id, filters = {}) =>
    api.get(`/master-admin/institutes/${id}/staff${buildQuery(filters)}`).then((r) => r.data),
  
  // NEW: Get institute storage usage
  getInstituteStorage: (id) =>
    api.get(`/master-admin/institutes/${id}/storage`).then((r) => r.data),
  
  // NEW: Get institute dashboard stats
  getInstituteDashboardStats: (id) =>
    api.get(`/master-admin/institutes/${id}/dashboard-stats`).then((r) => r.data),

  // NEW: Update institute plan
  updateInstitutePlan: (id, planId, effectiveDate = null) =>
    api.patch(`/master-admin/institutes/${id}/plan`, { 
      planId, 
      effectiveDate: effectiveDate || new Date().toISOString() 
    }).then((r) => r.data),

  deleteSchool: (id) =>
    api.delete(`/master-admin/institutes/${id}`).then((r) => r.data),

  // ─── Invoice Management (NEW) ────────────────────────────
  getInstituteInvoices: (instituteId, filters = {}) =>
    api.get(`/master-admin/institutes/${instituteId}/invoices${buildQuery(filters)}`).then((r) => r.data),

  // All invoices across ALL institutes (for master-admin global view)
  getAllInvoices: (filters = {}) =>
    api.get(`/master-admin/invoices${buildQuery(filters)}`).then((r) => r.data),

  markInvoicePaid: (invoiceId, paymentData) =>
    api.post(`/master-admin/invoices/${invoiceId}/mark-paid`, paymentData).then((r) => r.data),

  deleteInvoice: (id) =>
    api.delete(`/master-admin/invoices/${id}`).then((r) => r.data),

  bulkDeleteInvoices: (ids) =>
    api.post('/master-admin/invoices/bulk-delete', { ids }).then((r) => r.data),

  getSubscriptionHistory: (instituteId) =>
    withFallback(
      () => api.get(`/master-admin/institutes/${instituteId}/subscription/history`).then((r) => r.data),
      () => DUMMY_SUBSCRIPTION_HISTORY,
    ),

  // ─── Subscriptions ────────────────────────────────────────
  // filters: { school_id?, status? }
  getSubscriptions: (filters = {}) =>
    withFallback(
      () => api.get(`/master-admin/subscriptions${buildQuery(filters)}`).then((r) => r.data),
      () => paginate(DUMMY_MA_SUBSCRIPTIONS, filters.page, filters.limit),
    ),

  getSubscriptionById: (id) =>
    api.get(`/master-admin/subscriptions/${id}`).then((r) => r.data),

  // body: { school_id, plan, start_date, end_date, amount? }
  createSubscription: (body) =>
    api.post('/master-admin/subscriptions', body).then((r) => r.data),

  updateSubscription: (id, body) =>
    api.put(`/master-admin/subscriptions/${id}`, body).then((r) => r.data),

  cancelSubscription: (id) =>
    api.patch(`/master-admin/subscriptions/${id}/cancel`).then((r) => r.data),

  // ─── Users ────────────────────────────────────────────────
  getUsers: (filters = {}) =>
    api.get(`/master-admin/users${buildQuery(filters)}`).then((r) => r.data),

  getUserById: (id) =>
    api.get(`/master-admin/users/${id}`).then((r) => r.data),

  // NEW: Create platform user (Support Staff, etc.)
  createPlatformUser: (userData) => 
    api.post('/master-admin/users', userData).then((r) => r.data),

  // NEW: Update platform user
  updateUser: (id, userData) =>
    api.put(`/master-admin/users/${id}`, userData).then((r) => r.data),

  // NEW: Toggle user status
  toggleUserStatus: (id, is_active) =>
    api.patch(`/master-admin/users/${id}/status`, { is_active }).then((r) => r.data),

  // ─── Subscription Plans (CRUD) ───────────────────────────
  getSubscriptionTemplates: (filters = {}) =>
    api.get(`/subscription-plans${buildQuery(filters)}`).then((r) => r.data),

  getSubscriptionTemplateById: (id) =>
    api.get(`/subscription-plans/${id}`).then((r) => r.data),

  createSubscriptionTemplate: (body) =>
    api.post('/subscription-plans', body).then((r) => r.data),

  updateSubscriptionTemplate: (id, body) =>
    api.put(`/subscription-plans/${id}`, body).then((r) => r.data),

  deleteSubscriptionTemplate: (id) =>
    api.delete(`/subscription-plans/${id}`).then((r) => r.data),

  toggleSubscriptionPublish: (id) =>
    api.patch(`/subscription-plans/${id}/toggle-publish`).then((r) => r.data),

  toggleSubscriptionPopular: (id) =>
    api.patch(`/subscription-plans/${id}/toggle-popular`).then((r) => r.data),

  toggleSubscriptionActive: (id) =>
    api.patch(`/subscription-plans/${id}/toggle-active`).then((r) => r.data),

  // ─── Dashboard & Analytics (NEW) ─────────────────────────
  getDashboardStats: (period = 'month') =>
    api.get(`/master-admin/dashboard/stats?period=${period}`).then((r) => r.data),

  getRevenueAnalytics: (year = new Date().getFullYear()) =>
    api.get(`/master-admin/analytics/revenue?year=${year}`).then((r) => r.data),

  getSubscriptionAnalytics: () =>
    api.get('/master-admin/analytics/subscriptions').then((r) => r.data),

  // ─── Export/Import (NEW) ─────────────────────────────────
  exportInstitutes: (format = 'csv', filters = {}) => {
    const query = buildQuery({ ...filters, format });
    return api.get(`/master-admin/institutes/export${query}`, {
      responseType: 'blob'
    }).then(response => {
      // Create download link
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `institutes.${format}`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    });
  },

  exportInvoices: (instituteId, format = 'csv', filters = {}) => {
    const query = buildQuery({ ...filters, format });
    return api.get(`/master-admin/institutes/${instituteId}/invoices/export${query}`, {
      responseType: 'blob'
    }).then(handleDownload);
  },

  // ─── Bulk Operations (NEW) ───────────────────────────────
  bulkUpdateSubscriptionStatus: (instituteIds, status) =>
    api.post('/master-admin/institutes/bulk/update-subscription', {
      instituteIds,
      subscription_status: status
    }).then((r) => r.data),

  bulkExtendTrial: (instituteIds, extraDays) =>
    api.post('/master-admin/institutes/bulk/extend-trial', {
      instituteIds,
      extraDays
    }).then((r) => r.data),

  // ─── Notifications (NEW) ─────────────────────────────────
  sendSubscriptionReminders: (instituteIds = []) =>
    api.post('/master-admin/notifications/subscription-reminders', {
      instituteIds
    }).then((r) => r.data),

  sendInvoiceReminders: (invoiceIds = []) =>
    api.post('/master-admin/notifications/invoice-reminders', {
      invoiceIds
    }).then((r) => r.data),
};

// Helper function for file downloads
const handleDownload = (response) => {
  const contentDisposition = response.headers['content-disposition'];
  let filename = 'download.csv';
  
  if (contentDisposition) {
    const match = contentDisposition.match(/filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/);
    if (match && match[1]) {
      filename = match[1].replace(/['"]/g, '');
    }
  }
  
  const url = window.URL.createObjectURL(new Blob([response.data]));
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.URL.revokeObjectURL(url);
};
