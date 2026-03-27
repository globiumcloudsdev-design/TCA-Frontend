/**
 * Exam API Service
 * GET    /exams
 * POST   /exams
 * GET    /exams/:id
 * PUT    /exams/:id
 * PATCH  /exams/:id/publish
 * DELETE /exams/:id
 * POST   /exams/:id/results           (enter/bulk update results)
 * GET    /exams/:id/results           (get results for an exam)
 */

import api from '@/lib/api';
import { buildQuery } from '@/lib/utils';
import { withFallback } from '@/lib/withFallback';
import { DUMMY_EXAMS, paginate } from '@/data/dummyData';

export const examService = {
  getAll: (filters = {}) =>
    withFallback(
      () => api.get(`/exams${buildQuery(filters)}`).then((r) => r.data),
      () => paginate(DUMMY_EXAMS, filters.page, filters.limit),
    ),

  getById: (id) => api.get(`/exams/${id}`).then((r) => r.data),

  // body: { name, type, class_id, academic_year_id, start_date, end_date,
  //         total_marks, pass_percentage, branch_id? }
  create: (body) => api.post('/exams', body).then((r) => r.data),

  update: (id, body) => api.put(`/exams/${id}`, body).then((r) => r.data),

  publish: (id) => api.patch(`/exams/${id}/publish`).then((r) => r.data),

  delete: (id) => api.delete(`/exams/${id}`).then((r) => r.data),

  // Results
  getResults: (examId, filters = {}) =>
    api.get(`/exams/${examId}/results${buildQuery(filters)}`).then((r) => r.data),

  // results: [{ student_id, subject_id, marks_obtained, is_absent?, remarks? }]
  enterResults: (examId, results) =>
    api.post(`/exams/${examId}/results`, { results }).then((r) => r.data),
};
