/**
 * Dashboard API Service
 * Realtime institute dashboard using backend endpoint:
 * GET /dashboard/institute
 */

import api from '@/lib/api';

const unwrap = (payload) => payload?.data ?? payload ?? {};

const getInstituteDashboard = async (params = {}) => {
  const response = await api.get('/dashboard/institute', { params });
  return unwrap(response?.data);
};

const normalizeStatsObject = (summary = {}) => ({
  total_students: summary.total_students ?? 0,
  active_students: summary.total_students ?? 0,
  total_teachers: summary.total_teachers ?? 0,
  active_teachers: summary.total_teachers ?? 0,
  total_classes: summary.total_classes ?? 0,
  total_sections: summary.total_sections ?? 0,
  fees_collected: summary.fees_collected ?? 0,
  fees_pending: summary.fees_pending ?? 0,
  upcoming_exams: summary.upcoming_exams ?? 0,
  avg_attendance_pct: summary.avg_attendance_pct ?? 0,
});

export const dashboardService = {
  getAdaptiveDashboard: ({ type = 'school', branchId, range = '30d' } = {}) =>
    getInstituteDashboard({
      type,
      range,
      ...(branchId ? { branch_id: branchId } : {}),
    }).then((data) => ({ data })),

  // Backward-compatible methods used by older pages/components.
  getStats: ({ type = 'school', branchId } = {}) =>
    getInstituteDashboard({
      type,
      ...(branchId ? { branch_id: branchId } : {}),
    }).then((data) => ({ data: normalizeStatsObject(data.summary || {}) })),

  getChartData: ({ type = 'school', branchId } = {}) =>
    getInstituteDashboard({
      type,
      ...(branchId ? { branch_id: branchId } : {}),
    }).then((data) => ({ data: data.charts || {} })),
};
