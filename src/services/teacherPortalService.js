// src/services/teacherPortal.service.js

import api from '@/lib/api';

const unwrap = (response) => response?.data;

export const teacherPortalService = {
  // Dashboard
  getDashboard: () => api.get('/portal/teacher/dashboard').then(unwrap),
  
  // Profile
  getProfile: () => api.get('/portal/teacher/profile').then(unwrap),
  updateProfile: (data) => api.put('/portal/teacher/profile', data, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }).then(unwrap),
  
  // Classes
  getMyClasses: () => api.get('/portal/teacher/classes').then(unwrap),
  getClassDetails: (classId) => api.get(`/portal/teacher/classes/${classId}`).then(unwrap),
  
  // Students
  getMyStudents: (filters = {}, page = 1, limit = 20) =>
    api.get('/portal/teacher/students', { params: { ...filters, page, limit } }).then(unwrap),
  getStudentDetails: (studentId) => api.get(`/portal/teacher/students/${studentId}`).then(unwrap),
  
  // Assignments
  getAssignments: (filters = {}, page = 1, limit = 10) =>
    api.get('/portal/teacher/assignments', { params: { ...filters, page, limit } }).then(unwrap),
  
  createAssignment: (formData) =>
    api.post('/portal/teacher/assignments', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    }).then(unwrap),
  
  updateAssignment: (assignmentId, formData) =>
    api.put(`/portal/teacher/assignments/${assignmentId}`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    }).then(unwrap),
  
  deleteAssignment: (assignmentId) =>
    api.delete(`/portal/teacher/assignments/${assignmentId}`).then(unwrap),
  
  getAssignmentSubmissions: (assignmentId) =>
    api.get(`/portal/teacher/assignments/${assignmentId}/submissions`).then(unwrap),
  
  gradeSubmission: (submissionId, data) =>
    api.post(`/portal/teacher/submissions/${submissionId}/grade`, data).then(unwrap),
  
  // Helper to prepare form data
  prepareAssignmentFormData: (data, files) => {
    const formData = new FormData();
    
    // Add all fields
    Object.keys(data).forEach(key => {
      if (data[key] !== undefined && data[key] !== null && key !== 'remove_attachments') {
        formData.append(key, data[key]);
      }
    });
    
    // Add files
    if (files?.length) {
      files.forEach(file => {
        formData.append('attachments', file);
      });
    }
    
    return formData;
  },

    
  /**
   * Mark attendance for a class
   * @param {Object} attendanceData - { class_id, date, subject, attendance: [{ student_id, status }] }
   */
  markAttendance: (attendanceData) =>
    api.post('/portal/teacher/attendance/mark', attendanceData),

  /**
   * Get attendance for a specific class and date
   * @param {string} classId - Class ID
   * @param {string} date - Date (YYYY-MM-DD)
   */
  getClassAttendance: (classId, date) =>
    withFallback(
      () => api.get(`/portal/teacher/attendance/class/${classId}`, { params: { date } }).then(r => r.data),
      () => ({ data: DUMMY_ATTENDANCE })
    ),

  /**
   * Get attendance for a specific student
   * @param {string} studentId - Student ID
   */
  getStudentAttendance: (studentId) =>
    withFallback(
      () => api.get(`/portal/teacher/attendance/student/${studentId}`).then(r => r.data),
      () => ({ data: DUMMY_STUDENT_DETAILS.attendance })
    ),

  
  // Attendance
  // getAttendance: (filters = {}) =>
  //   api.get('/portal/teacher/attendance', { params: filters }).then(unwrap),
  // markAttendance: (data) => api.post('/portal/teacher/attendance', data).then(unwrap),
  
  // Timetable
  getMyTimetable: (week = null) =>
    api.get('/portal/teacher/timetable', { params: { week } }).then(unwrap),
  
  // Notices
  getNotices: (limit = 10) => api.get('/portal/teacher/notices', { params: { limit } }).then(unwrap),

  // ─────────────────────────────────────────────────────────────────────────────
  // EXAM MANAGEMENT
  // ─────────────────────────────────────────────────────────────────────────────

  /**
   * Get available classes, sections, and subjects for the current teacher
   */
  getExamAssignments: () =>
    api.get('/portal/teacher/exam-assignments').then(unwrap),

  /**
   * Create a new exam for teacher's assigned class/section
   */
  createExam: (examData) =>
    api.post('/portal/teacher/exams', examData).then(unwrap),

  /**
   * Get all exams created by the teacher with optional filters
   */
  getTeacherExams: (filters = {}, page = 1, limit = 10) =>
    api.get('/portal/teacher/exams', { params: { ...filters, page, limit } }).then(unwrap),

  /**
   * Get detailed information about a specific exam
   */
  getExamDetails: (examId) =>
    api.get(`/portal/teacher/exams/${examId}`).then(unwrap),

  /**
   * Get exam results with student information
   */
  getExamResults: (examId, filters = {}, page = 1, limit = 20) =>
    api.get(`/portal/teacher/exams/${examId}/results`, { params: { ...filters, page, limit } }).then(unwrap),

  /**
   * Add or update exam results for multiple students
   */
  addExamResults: (examId, results) =>
    api.post(`/portal/teacher/exams/${examId}/results`, { results }).then(unwrap),

  /**
   * Get ALL students for exam entry (with existing results if any)
   * This is specifically for the "Enter Marks" page
   */
  getExamEntryStudents: (examId, filters = {}, page = 1, limit = 100) =>
    api.get(`/portal/teacher/exams/${examId}/entry-students`, { 
      params: { ...filters, page, limit } 
    }).then(unwrap),
};

export default teacherPortalService;







