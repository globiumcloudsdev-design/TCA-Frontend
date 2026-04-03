/**
 * Student Service — Adaptive for All Institute Types
 *
 * Har institute type ke liye sahi filters aur fallback data.
 *
 * Usage:
 *   studentService.getAll(filters, 'coaching')   → Candidates list
 *   studentService.getAll(filters, 'school')     → Students list
 *   studentService.getByPrimaryUnit(courseId, 'coaching')
 *   studentService.getByGroupingUnit(batchId, 'coaching')
 */

import api from '@/lib/api';
import { buildQuery } from '@/lib/utils';
import { withFallback } from '@/lib/withFallback';
import { DUMMY_STUDENTS, paginate } from '@/data/dummyData';

// ─────────────────────────────────────────────────────────────────────────────
// Normalize filters per institute type
// School:     class_id, section_id
// Coaching:   course_id, batch_id
// Academy:    program_id, batch_id
// College:    department_id, program_id, semester_id
// University: faculty_id, department_id, program_id, semester_id
// ─────────────────────────────────────────────────────────────────────────────
function normalizeFilters(filters = {}, type = 'school') {
  const base = {
    page: filters.page ?? 1,
    limit: filters.limit ?? 20,
    search: filters.search,
    is_active: filters.is_active,
    branch_id: filters.branch_id,
  };
  switch (type) {
    case 'coaching':
      return { ...base, course_id: filters.course_id || filters.class_id, batch_id: filters.batch_id || filters.section_id };
    case 'academy':
      return { ...base, program_id: filters.program_id || filters.class_id, batch_id: filters.batch_id || filters.section_id };
    case 'college':
      return { ...base, department_id: filters.department_id || filters.class_id, program_id: filters.program_id, semester_id: filters.semester_id || filters.section_id };
    case 'university':
      return { ...base, faculty_id: filters.faculty_id, department_id: filters.department_id || filters.class_id, program_id: filters.program_id, semester_id: filters.semester_id };
    default: // school
      return { ...base, class_id: filters.class_id, section_id: filters.section_id, academic_year_id: filters.academic_year_id };
  }
}

export const studentService = {
  /**
   * List students — type-aware
   * @param {object} filters
   * @param {string} instituteType — 'school'|'coaching'|'academy'|'college'|'university'
   */
  getAll: (filters = {}, instituteType = 'school') => {
    const normalized = normalizeFilters(filters, instituteType);
    return api.get(`/students${buildQuery(normalized)}`).then((r) => r.data);
  },

  getById: (id) => api.get(`/students/${id}`).then((r) => r.data),

  create: (body) => api.post('/students', body).then((r) => r.data),

  update: (id, body) => api.put(`/students/${id}`, body).then((r) => r.data),

  delete: (id) => api.delete(`/students/${id}`).then((r) => r.data),

  uploadPhoto: (id, formData) =>
    api.post(`/students/${id}/photo`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }).then((r) => r.data),

  // ── Type-aware shortcuts ─────────────────────────────────────────────────

  /** Filter by Class / Course / Program / Department */
  getByPrimaryUnit: (id, type = 'school') => {
    const key = type === 'school' ? 'class_id' : type === 'coaching' ? 'course_id' : 'program_id';
    return studentService.getAll({ [key]: id }, type);
  },

  /** Filter by Section / Batch / Semester */
  getByGroupingUnit: (id, type = 'school') => {
    const key = type === 'school' ? 'section_id' : (type === 'coaching' || type === 'academy') ? 'batch_id' : 'semester_id';
    return studentService.getAll({ [key]: id }, type);
  },
  /**
   * Bulk import students - Simple version
   * @param {Array} students - List of student objects to import
   * @param {string} instituteType - Type of institute
   */
  bulkCreate: async (studentsData, instituteType) => {
    try {
      const response = await api.post('/students/bulk-import', {
        students: studentsData,
        institute_type: instituteType
      });
      return response;
    } catch (error) {
      console.error('Bulk create API error:', error);
      throw error;
    }
  }
};
