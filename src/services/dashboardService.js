/**
 * Dashboard API Service
 * Realtime institute dashboard using backend endpoint:
 * GET /dashboard/institute
 */

import api from '@/lib/api';

const unwrap = (payload) => payload?.data ?? payload ?? {};

const getInstituteDashboard = async (params = {}) => {
  try {
    const response = await api.get('/dashboard/institute', { params });
    return unwrap(response?.data);
  } catch (err) {
    console.warn('⚠️ /dashboard/institute failed, attempting fallback endpoints:', err);
    try {
      const response = await api.get('/dashboard', { params });
      return unwrap(response?.data);
    } catch (fallbackErr) {
      console.warn('⚠️ /dashboard fallback also failed:', fallbackErr);
      return {};
    }
  }
};

const normalizeStatsObject = (summary = {}) => ({
  total_students: summary.total_students ?? summary.totalStudents ?? summary.students_count ?? summary.studentsCount ?? summary.student_count ?? summary.students ?? 0,
  active_students: summary.active_students ?? summary.activeStudents ?? summary.total_students ?? summary.students_count ?? 0,
  total_teachers: summary.total_teachers ?? summary.totalTeachers ?? summary.teachers_count ?? summary.teachersCount ?? summary.teachers ?? summary.total_faculty ?? 0,
  active_teachers: summary.active_teachers ?? summary.activeTeachers ?? summary.total_teachers ?? summary.teachers_count ?? 0,
  total_classes: summary.total_classes ?? summary.totalClasses ?? summary.classes_count ?? summary.total_courses ?? summary.total_programs ?? summary.total_departments ?? 0,
  total_sections: summary.total_sections ?? summary.totalSections ?? summary.sections_count ?? summary.total_batches ?? 0,
  fees_collected: summary.fees_collected ?? summary.feesCollected ?? summary.total_collected ?? summary.paid_fees ?? 0,
  fees_pending: summary.fees_pending ?? summary.feesPending ?? summary.total_pending ?? summary.pending_fees ?? 0,
  upcoming_exams: summary.upcoming_exams ?? summary.upcomingExams ?? summary.exams_count ?? 0,
  avg_attendance_pct: summary.avg_attendance_pct ?? summary.avgAttendancePct ?? summary.attendance_rate ?? 0,
});

export const dashboardService = {
  getAdaptiveDashboard: async ({ type = 'school', branchId, range = '30d' } = {}) => {
    const data = await getInstituteDashboard({
      type,
      range,
      ...(branchId ? { branch_id: branchId } : {}),
    });
    return { data };
  },

  // Backward-compatible methods used by older pages/components.
  getStats: ({ type = 'school', branchId } = {}) =>
    getInstituteDashboard({
      type,
      ...(branchId ? { branch_id: branchId } : {}),
    }).then((data) => ({ data: normalizeStatsObject(data.summary || data.stats || data || {}) })),

  getChartData: ({ type = 'school', branchId } = {}) =>
    getInstituteDashboard({
      type,
      ...(branchId ? { branch_id: branchId } : {}),
    }).then((data) => ({ data: data.charts || data || {} })),

  changeUserPassword: (userId, password) =>
    api.post('/dashboard/change-password', { userId, password }).then(unwrap),
};
