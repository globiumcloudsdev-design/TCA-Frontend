// frontend/src/services/examService.js

import api from "@/lib/api";
import { buildQuery } from "@/lib/utils";

export const examService = {
  // Exam CRUD
  getAll: async (params = {}) => {
    const response = await api.get("/exams", { params });
    // Backend wraps response: { success, message, data, pagination, ... }
    // return response.data.data || response.data;
    return response.data;
  },

  getById: async (id) => {
    const response = await api.get(`/exams/${id}`);
    // Backend wraps: { success, message, data: { exam with subject_schedules }, timestamp }
    // Extract the exam object from nested data property
    return response.data.data || response.data;
  },

  create: async (data) => {
    const response = await api.post("/exams", data);
    return response.data.data || response.data;
  },

  update: async (id, data) => {
    const response = await api.put(`/exams/${id}`, data);
    return response.data.data || response.data;
  },

  delete: async (id) => {
    const response = await api.delete(`/exams/${id}`);
    return response.data.data || response.data;
  },

  publish: async (id) => {
    const response = await api.post(`/exams/${id}/publish`);
    return response.data.data || response.data;
  },

  updateStatus: async (id, status) => {
    const response = await api.patch(`/exams/${id}/status`, { status });
    return response.data.data || response.data;
  },

  // Results Management
  getResults: async (examId, params = {}) => {
    const response = await api.get(`/exams/${examId}/results`, { params });
    // This endpoint returns: { success, message, data: [...students], pagination, summary }
    // Keep the wrapper structure as client expects it
    return response.data;
  },

  addResults: async (examId, results) => {
    const response = await api.post(`/exams/${examId}/results`, { results });
    return response.data;
  },

  updateResult: async (resultId, data) => {
    const response = await api.put(`/exams/results/${resultId}`, data);
    return response.data;
  },

  deleteResult: async (resultId) => {
    const response = await api.delete(`/exams/results/${resultId}`);
    return response.data;
  },

  publishResults: async (examId, publishDate) => {
    const response = await api.post(`/exams/${examId}/publish-results`, {
      publish_date: publishDate,
    });
    return response.data;
  },

  downloadResults: async (examId) => {
    const response = await api.get(`/exams/${examId}/download-results`, {
      responseType: "blob",
    });

    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `exam_${examId}_results.csv`);
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
  },

  // Analytics
  getAnalytics: async (examId) => {
    const response = await api.get(`/exams/${examId}/analytics`);
    return response.data;
  },

  generateGradeSheet: async (examId, body = {}) => {
    // Expects student_id, and optionally class_id, section_id in body
    const response = await api.post(`/exams/${examId}/grade-sheet`, body);
    return response.data;
  },

  // Student Views
  getMyExams: async () => {
    const response = await api.get("/exams/my-exams");
    return response.data;
  },

  getMyResults: async () => {
    const response = await api.get("/exams/my-results");
    return response.data;
  },

  // Options/Dropdown
  getOptions: async (params = {}) => {
    const response = await api.get("/exams/options", { params });
    return response.data;
  },
};

export default examService;
