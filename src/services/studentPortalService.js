// frontend/src/services/studentPortal.service.js

/**
 * The Clouds Academy - Student Portal Frontend Service
 * 
 * Student ke saare API calls ek hi jagah
 */

import api from '@/lib/api';

const unwrap = (response) => response?.data;

export const studentPortalService = {
  getDashboard: () => api.get('/portal/student/dashboard').then(unwrap),

  getProfile: () => api.get('/portal/student/profile').then(unwrap),

  updateProfile: (data) =>
    api.put('/portal/student/profile', data, {
      headers: { 'Content-Type': 'multipart/form-data' }
    }).then(unwrap),

  getMyClasses: () => api.get('/portal/student/classes').then(unwrap),

  getMyTimetable: (week = null) =>
    api.get('/portal/student/timetable', { params: { week } }).then(unwrap),

  getTodayClasses: () => api.get('/portal/student/today-classes').then(unwrap),

  getAttendance: (filters = {}) =>
    api.get('/portal/student/attendance', { params: filters }).then(unwrap),

  getAssignments: (filters = {}, page = 1, limit = 10) =>
    api.get('/portal/student/assignments', { params: { ...filters, page, limit } }).then(unwrap),

  getUpcomingAssignments: (limit = 5) =>
    api.get('/portal/student/assignments/upcoming', { params: { limit } }).then(unwrap),

  submitAssignment: (assignmentId, formData) =>
    api.post(`/portal/student/assignments/${assignmentId}/submit`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    }).then(unwrap),

  getResults: (filters = {}) =>
    api.get('/portal/student/results', { params: filters }).then(unwrap),

  getRecentResults: (limit = 3) =>
    api.get('/portal/student/results/recent', { params: { limit } }).then(unwrap),

  getFees: (filters = {}) =>
    api.get('/portal/student/fees', { params: filters }).then(unwrap),

  getFeeSummary: () => api.get('/portal/student/fees/summary').then(unwrap),

  getNotices: (filters = {}, page = 1, limit = 10) =>
    api.get('/portal/student/notices', { params: { ...filters, page, limit } }).then(unwrap),

  getRecentNotices: (limit = 5) =>
    api.get('/portal/student/notices/recent', { params: { limit } }).then(unwrap),

  getLibraryData: () => api.get('/portal/student/library').then(unwrap)
};

export default studentPortalService;
