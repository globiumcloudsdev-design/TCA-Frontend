// /**
//  * Timetable API Service
//  * GET    /timetable               (list — filter by class, section, teacher, day)
//  * POST   /timetable               (create slot)
//  * PUT    /timetable/:id           (update slot)
//  * DELETE /timetable/:id           (delete slot)
//  * GET    /timetable/class/:classId     (class-wise view)
//  * GET    /timetable/teacher/:teacherId (teacher-wise view)
//  */

// import api from '@/lib/api';
// import { buildQuery } from '@/lib/utils';
// import { withFallback } from '@/lib/withFallback';
// import { DUMMY_TIMETABLE, paginate } from '@/data/dummyData';

// export const timetableService = {
//   // filters: { class_id, section_id, teacher_id, day, page, limit }
//   getAll: (filters = {}) =>
//     withFallback(
//       () => api.get(`/timetable${buildQuery(filters)}`).then((r) => r.data),
//       () => {
//         let data = [...DUMMY_TIMETABLE];
//         if (filters.class_id)   data = data.filter((t) => t.class_id   === filters.class_id);
//         if (filters.section_id) data = data.filter((t) => t.section_id === filters.section_id);
//         if (filters.teacher_id) data = data.filter((t) => t.teacher_id === filters.teacher_id);
//         if (filters.day)        data = data.filter((t) => t.day        === filters.day);
//         return paginate(data, filters.page, filters.limit);
//       },
//     ),

//   getByClass: (classId, sectionId) =>
//     withFallback(
//       () => api.get(`/timetable/class/${classId}${sectionId ? `?section_id=${sectionId}` : ''}`).then((r) => r.data),
//       () => {
//         const data = DUMMY_TIMETABLE.filter(
//           (t) => t.class_id === classId && (!sectionId || t.section_id === sectionId),
//         );
//         return { data: { rows: data, total: data.length } };
//       },
//     ),

//   getByTeacher: (teacherId) =>
//     withFallback(
//       () => api.get(`/timetable/teacher/${teacherId}`).then((r) => r.data),
//       () => {
//         const data = DUMMY_TIMETABLE.filter((t) => t.teacher_id === teacherId);
//         return { data: { rows: data, total: data.length } };
//       },
//     ),

//   // body: { class_id, section_id, day, period, subject, teacher_id, room, start_time, end_time }
//   create: (body) =>
//     withFallback(
//       () => api.post('/timetable', body).then((r) => r.data),
//       () => ({ data: { ...body, id: `tt-${Date.now()}` } }),
//     ),

//   update: (id, body) =>
//     withFallback(
//       () => api.put(`/timetable/${id}`, body).then((r) => r.data),
//       () => ({ data: { id, ...body } }),
//     ),

//   delete: (id) =>
//     withFallback(
//       () => api.delete(`/timetable/${id}`).then((r) => r.data),
//       () => ({ data: { id } }),
//     ),
// };

// src/services/timetableService.js

/**
 * Timetable API Service
 * GET    /timetable               (list — filter by class, section, teacher, day)
 * POST   /timetable               (create slot)
 * PUT    /timetable/:id           (update slot)
 * DELETE /timetable/:id           (delete slot)
 * GET    /timetable/class/:classId     (class-wise view)
 * GET    /timetable/teacher/:teacherId (teacher-wise view)
 * POST   /timetable/check-conflict     (check teacher conflict)
 */

import api from '@/lib/api';
import { buildQuery } from '@/lib/utils';
import { withFallback } from '@/lib/withFallback';
import { DUMMY_TIMETABLE, paginate } from '@/data/dummyData';

export const timetableService = {
  /**
   * Get all timetables with filters
   * @param {Object} filters - { class_id, section_id, teacher_id, day, page, limit, academic_year_id, entity_type }
   */
  getAll: (filters = {}) =>
    withFallback(
      () => api.get(`/timetable${buildQuery(filters)}`).then((r) => r.data),
      () => {
        let data = [...DUMMY_TIMETABLE];
        if (filters.class_id) data = data.filter((t) => t.class_id === filters.class_id);
        if (filters.section_id) data = data.filter((t) => t.section_id === filters.section_id);
        if (filters.teacher_id) data = data.filter((t) => t.teacher_id === filters.teacher_id);
        if (filters.day) data = data.filter((t) => t.day === filters.day);
        if (filters.academic_year_id) data = data.filter((t) => t.academic_year_id === filters.academic_year_id);
        return paginate(data, filters.page, filters.limit);
      },
    ),

  /**
   * Get timetable by class
   * @param {string} classId - Class ID
   * @param {string} sectionId - Section ID (optional)
   */
  getByClass: (classId, sectionId) =>
    withFallback(
      () => api.get(`/timetable/class/${classId}${sectionId ? `?section_id=${sectionId}` : ''}`).then((r) => r.data),
      () => {
        const data = DUMMY_TIMETABLE.filter(
          (t) => t.class_id === classId && (!sectionId || t.section_id === sectionId),
        );
        return { data: { rows: data, total: data.length } };
      },
    ),

  /**
   * Get timetable by teacher
   * @param {string} teacherId - Teacher ID
   */
  getByTeacher: (teacherId) =>
    withFallback(
      () => api.get(`/timetable/teacher/${teacherId}`).then((r) => r.data),
      () => {
        const data = DUMMY_TIMETABLE.filter((t) => t.teacher_id === teacherId);
        return { data: { rows: data, total: data.length } };
      },
    ),

  /**
   * Create new timetable slot
   * @param {Object} body - { class_id, section_id, day, period, subject, teacher_id, room, start_time, end_time }
   */
  create: (body) =>
    withFallback(
      () => api.post('/timetable', body).then((r) => r.data),
      () => ({ data: { ...body, id: `tt-${Date.now()}` } }),
    ),

  /**
   * Update timetable slot
   * @param {string} id - Slot ID
   * @param {Object} body - Updated data
   */
  update: (id, body) =>
    withFallback(
      () => api.put(`/timetable/${id}`, body).then((r) => r.data),
      () => ({ data: { id, ...body } }),
    ),

  /**
   * Delete timetable slot
   * @param {string} id - Slot ID
   */
  delete: (id) =>
    withFallback(
      () => api.delete(`/timetable/${id}`).then((r) => r.data),
      () => ({ data: { id } }),
    ),

  /**
   * Check teacher conflict
   * @param {Object} params - { teacher_id, day, period, start_time, end_time, exclude_id }
   */
  checkConflict: async (params) => {
    try {
      const response = await api.post('/timetable/check-conflict', params);
      return response.data;
    } catch (error) {
      console.error('Error checking teacher conflict:', error);
      
      // Fallback: Check in dummy data
      const { teacher_id, day, period, start_time, end_time, exclude_id } = params;
      
      const hasConflict = DUMMY_TIMETABLE.some(slot => 
        slot.teacher_id === teacher_id &&
        slot.day === day &&
        ((period && slot.period === period) ||
         (start_time && end_time && slot.start_time && slot.end_time &&
          ((start_time >= slot.start_time && start_time < slot.end_time) ||
           (end_time > slot.start_time && end_time <= slot.end_time)))) &&
        slot.id !== exclude_id
      );
      
      return {
        success: true,
        data: { hasConflict }
      };
    }
  },

  /**
   * Get entities for dropdowns (academic years, classes, sections, teachers, subjects)
   * @param {string} academicYearId - Academic Year ID (optional)
   */
  getEntities: async (academicYearId) => {
    try {
      const response = await api.get('/timetable/entities', {
        params: { academic_year_id: academicYearId }
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching timetable entities:', error);
      
      // Return empty data for fallback
      return {
        success: true,
        data: {
          academicYears: [],
          classes: [],
          teachers: [],
          subjects: []
        }
      };
    }
  }
};