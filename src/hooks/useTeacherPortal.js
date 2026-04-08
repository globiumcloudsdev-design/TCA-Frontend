// src/hooks/useTeacherPortal.js
// // /**
// //  * Custom hooks for Teacher Portal
// //  * Makes it easy to use teacher portal service in components
// //  */

// // import { useState, useEffect, useCallback } from 'react';
// // import { teacherPortalService } from '@/services/teacherPortalService';
// // import { toast } from 'sonner';

// // const toArray = (value) => (Array.isArray(value) ? value : []);

// // const extractListPayload = (response) => {
// //   const payload = response?.data;

// //   if (Array.isArray(payload)) {
// //     return {
// //       items: payload,
// //       pagination: response?.pagination || { total: payload.length, page: 1, limit: payload.length || 20, totalPages: 1 }
// //     };
// //   }

// //   if (Array.isArray(payload?.data)) {
// //     return {
// //       items: payload.data,
// //       pagination: payload.pagination || response?.pagination || { total: payload.data.length, page: 1, limit: payload.data.length || 20, totalPages: 1 }
// //     };
// //   }

// //   return {
// //     items: [],
// //     pagination: response?.pagination || { total: 0, page: 1, limit: 20, totalPages: 0 }
// //   };
// // };

// // export const useTeacherDashboard = () => {
// //   const [data, setData] = useState(null);
// //   const [loading, setLoading] = useState(true);
// //   const [error, setError] = useState(null);

// //   useEffect(() => {
// //     fetchDashboard();
// //   }, []);

// //   const fetchDashboard = async () => {
// //     try {
// //       setLoading(true);
// //       const response = await teacherPortalService.getDashboard();
// //       setData(response.data);
// //     } catch (err) {
// //       setError(err.message);
// //       toast.error('Failed to load dashboard');
// //     } finally {
// //       setLoading(false);
// //     }
// //   };

// //   return { data, loading, error, refetch: fetchDashboard };
// // };

// // export const useTeacherProfile = () => {
// //   const [profile, setProfile] = useState(null);
// //   const [loading, setLoading] = useState(true);

// //   useEffect(() => {
// //     fetchProfile();
// //   }, []);

// //   const fetchProfile = async () => {
// //     try {
// //       const response = await teacherPortalService.getProfile();
// //       setProfile(response.data);
// //     } catch (error) {
// //       toast.error('Failed to load profile');
// //     } finally {
// //       setLoading(false);
// //     }
// //   };

// //   const updateProfile = async (formData) => {
// //     try {
// //       const response = await teacherPortalService.updateProfile(formData);
// //       setProfile(response.data);
// //       toast.success('Profile updated successfully');
// //       return response.data;
// //     } catch (error) {
// //       toast.error(error.message || 'Failed to update profile');
// //       throw error;
// //     }
// //   };

// //   return { profile, loading, updateProfile, refetch: fetchProfile };
// // };

// // export const useTeacherClasses = () => {
// //   const [classes, setClasses] = useState([]);
// //   const [loading, setLoading] = useState(true);

// //   useEffect(() => {
// //     fetchClasses();
// //   }, []);

// //   const fetchClasses = async () => {
// //     try {
// //       const response = await teacherPortalService.getMyClasses();
// //       setClasses(toArray(response?.data));
// //     } catch (error) {
// //       toast.error('Failed to load classes');
// //     } finally {
// //       setLoading(false);
// //     }
// //   };

// //   const getClassDetails = async (classId) => {
// //     try {
// //       const response = await teacherPortalService.getClassDetails(classId);
// //       return response.data;
// //     } catch (error) {
// //       toast.error('Failed to load class details');
// //       throw error;
// //     }
// //   };

// //   return { classes, loading, getClassDetails, refetch: fetchClasses };
// // };

// // export const useTeacherStudents = (initialFilters = {}) => {
// //   const [students, setStudents] = useState([]);
// //   const [pagination, setPagination] = useState({ total: 0, page: 1, limit: 20, totalPages: 0 });
// //   const [loading, setLoading] = useState(false);
// //   const [filters, setFilters] = useState(initialFilters);

// //   const fetchStudents = useCallback(async (page = 1) => {
// //     try {
// //       setLoading(true);
// //       const response = await teacherPortalService.getMyStudents(filters, page, pagination.limit);
// //       const { items, pagination: pager } = extractListPayload(response);
// //       setStudents(items);
// //       setPagination(pager);
// //     } catch (error) {
// //       toast.error('Failed to load students');
// //     } finally {
// //       setLoading(false);
// //     }
// //   }, [filters, pagination.limit]);

// //   useEffect(() => {
// //     fetchStudents(1);
// //   }, [fetchStudents]);

// //   const search = useCallback((searchTerm) => {
// //     setFilters((prev) => (
// //       prev.search === searchTerm
// //         ? prev
// //         : { ...prev, search: searchTerm }
// //     ));
// //   }, []);

// //   const filterByClass = useCallback((classId) => {
// //     setFilters((prev) => (
// //       prev.class_id === classId
// //         ? prev
// //         : { ...prev, class_id: classId }
// //     ));
// //   }, []);

// //   const getStudentDetails = useCallback(async (studentId) => {
// //     try {
// //       const response = await teacherPortalService.getStudentDetails(studentId);
// //       return response.data;
// //     } catch (error) {
// //       toast.error('Failed to load student details');
// //       throw error;
// //     }
// //   }, []);

// //   return {
// //     students,
// //     pagination,
// //     loading,
// //     filters,
// //     search,
// //     filterByClass,
// //     getStudentDetails,
// //     refetch: fetchStudents,
// //     nextPage: () => fetchStudents(pagination.page + 1),
// //     prevPage: () => fetchStudents(pagination.page - 1)
// //   };
// // };

// // export const useTeacherAssignments = (initialFilters = {}) => {
// //   const [assignments, setAssignments] = useState([]);
// //   const [pagination, setPagination] = useState({ total: 0, page: 1, limit: 10, totalPages: 0 });
// //   const [loading, setLoading] = useState(false);
// //   const [filters, setFilters] = useState(initialFilters);

// //   const fetchAssignments = async (page = 1) => {
// //     try {
// //       setLoading(true);
// //       const response = await teacherPortalService.getMyAssignments(filters, page, pagination.limit);
// //       const { items, pagination: pager } = extractListPayload(response);
// //       setAssignments(items);
// //       setPagination(pager);
// //     } catch (error) {
// //       toast.error('Failed to load assignments');
// //     } finally {
// //       setLoading(false);
// //     }
// //   };

// //   useEffect(() => {
// //     fetchAssignments(1);
// //   }, [filters]);

// //   const createAssignment = async (formData) => {
// //     try {
// //       const response = await teacherPortalService.createAssignment(formData);
// //       toast.success('Assignment created successfully');
// //       fetchAssignments(1);
// //       return response.data;
// //     } catch (error) {
// //       toast.error(error.message || 'Failed to create assignment');
// //       throw error;
// //     }
// //   };

// //   const getAssignmentDetails = async (assignmentId) => {
// //     try {
// //       const response = await teacherPortalService.getAssignmentDetails(assignmentId);
// //       return response.data;
// //     } catch (error) {
// //       toast.error('Failed to load assignment details');
// //       throw error;
// //     }
// //   };

// //   const updateAssignment = async (assignmentId, formData) => {
// //     try {
// //       const response = await teacherPortalService.updateAssignment(assignmentId, formData);
// //       toast.success('Assignment updated successfully');
// //       fetchAssignments(pagination.page);
// //       return response.data;
// //     } catch (error) {
// //       toast.error(error.message || 'Failed to update assignment');
// //       throw error;
// //     }
// //   };

// //   const deleteAssignment = async (assignmentId) => {
// //     try {
// //       await teacherPortalService.deleteAssignment(assignmentId);
// //       toast.success('Assignment deleted successfully');
// //       fetchAssignments(pagination.page);
// //     } catch (error) {
// //       toast.error(error.message || 'Failed to delete assignment');
// //       throw error;
// //     }
// //   };

// //   const gradeSubmission = async (submissionId, marks, feedback) => {
// //     try {
// //       const response = await teacherPortalService.gradeSubmission(submissionId, { marks, feedback });
// //       toast.success('Submission graded successfully');
// //       return response.data;
// //     } catch (error) {
// //       toast.error(error.message || 'Failed to grade submission');
// //       throw error;
// //     }
// //   };

// //   return {
// //     assignments,
// //     pagination,
// //     loading,
// //     filters,
// //     setFilters,
// //     createAssignment,
// //     getAssignmentDetails,
// //     updateAssignment,
// //     deleteAssignment,
// //     gradeSubmission,
// //     refetch: fetchAssignments,
// //     nextPage: () => fetchAssignments(pagination.page + 1),
// //     prevPage: () => fetchAssignments(pagination.page - 1)
// //   };
// // };

// // export const useTeacherAttendance = () => {
// //   const [loading, setLoading] = useState(false);

// //   const markAttendance = useCallback(async (attendanceData) => {
// //     try {
// //       setLoading(true);
// //       const response = await teacherPortalService.markAttendance(attendanceData);
// //       toast.success('Attendance marked successfully');
// //       return response.data;
// //     } catch (error) {
// //       toast.error(error.message || 'Failed to mark attendance');
// //       throw error;
// //     } finally {
// //       setLoading(false);
// //     }
// //   }, []);

// //   const getClassAttendance = useCallback(async (classId, date) => {
// //     try {
// //       setLoading(true);
// //       const response = await teacherPortalService.getClassAttendance(classId, date);
// //       return response.data;
// //     } catch (error) {
// //       toast.error('Failed to load attendance');
// //       throw error;
// //     } finally {
// //       setLoading(false);
// //     }
// //   }, []);

// //   const getStudentAttendance = useCallback(async (studentId) => {
// //     try {
// //       const response = await teacherPortalService.getStudentAttendance(studentId);
// //       return response.data;
// //     } catch (error) {
// //       toast.error('Failed to load student attendance');
// //       throw error;
// //     }
// //   }, []);

// //   return {
// //     loading,
// //     markAttendance,
// //     getClassAttendance,
// //     getStudentAttendance
// //   };
// // };

// // export const useTeacherTimetable = () => {
// //   const [timetable, setTimetable] = useState(null);
// //   const [loading, setLoading] = useState(true);
// //   const [week, setWeek] = useState(null);

// //   useEffect(() => {
// //     fetchTimetable();
// //   }, [week]);

// //   const fetchTimetable = async () => {
// //     try {
// //       setLoading(true);
// //       const response = await teacherPortalService.getMyTimetable(week);
// //       setTimetable(response.data);
// //     } catch (error) {
// //       toast.error('Failed to load timetable');
// //     } finally {
// //       setLoading(false);
// //     }
// //   };

// //   const changeWeek = (newWeek) => {
// //     setWeek(newWeek);
// //   };

// //   const nextWeek = () => {
// //     // Calculate next week from current week
// //     if (timetable?.week?.start) {
// //       const next = new Date(timetable.week.start);
// //       next.setDate(next.getDate() + 7);
// //       setWeek(next.toISOString().split('T')[0]);
// //     }
// //   };

// //   const prevWeek = () => {
// //     if (timetable?.week?.start) {
// //       const prev = new Date(timetable.week.start);
// //       prev.setDate(prev.getDate() - 7);
// //       setWeek(prev.toISOString().split('T')[0]);
// //     }
// //   };

// //   return {
// //     timetable,
// //     loading,
// //     week,
// //     changeWeek,
// //     nextWeek,
// //     prevWeek,
// //     refetch: fetchTimetable
// //   };
// // };

// // export const useTeacherNotices = (limit = 10) => {
// //   const [notices, setNotices] = useState([]);
// //   const [loading, setLoading] = useState(true);

// //   useEffect(() => {
// //     fetchNotices();
// //   }, []);

// //   const fetchNotices = async () => {
// //     try {
// //       const response = await teacherPortalService.getNotices(limit);
// //       setNotices(response.data);
// //     } catch (error) {
// //       toast.error('Failed to load notices');
// //     } finally {
// //       setLoading(false);
// //     }
// //   };

// //   return { notices, loading, refetch: fetchNotices };
// // };










// // src/hooks/useTeacherPortal.js

// import { useCallback, useEffect, useMemo, useState } from 'react';
// import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
// import teacherPortalService from '@/services/teacherPortalService';
// import { toast } from 'sonner';

// export const useTeacherDashboard = () => {
//   const [data, setData] = useState(null);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(null);

//   useEffect(() => {
//     fetchDashboard();
//   }, []);

//   const fetchDashboard = async () => {
//     try {
//       setLoading(true);
//       const response = await teacherPortalService.getDashboard();
//       setData(response.data);
//     } catch (err) {
//       setError(err.message);
//       toast.error('Failed to load dashboard');
//     } finally {
//       setLoading(false);
//     }
//   };

//   return { data, loading, error, refetch: fetchDashboard };
// };

// export const useTeacherProfile = () => {
//   const [profile, setProfile] = useState(null);
//   const [loading, setLoading] = useState(true);

//   useEffect(() => {
//     fetchProfile();
//   }, []);

//   const fetchProfile = async () => {
//     try {
//       const response = await teacherPortalService.getProfile();
//       setProfile(response.data);
//     } catch (error) {
//       toast.error('Failed to load profile');
//     } finally {
//       setLoading(false);
//     }
//   };

//   const updateProfile = async (formData) => {
//     try {
//       const response = await teacherPortalService.updateProfile(formData);
//       setProfile(response.data);
//       toast.success('Profile updated successfully');
//       return response.data;
//     } catch (error) {
//       toast.error(error.message || 'Failed to update profile');
//       throw error;
//     }
//   };

//   return { profile, loading, updateProfile, refetch: fetchProfile };
// };


// export const useTeacherClasses = () => {
//   const { data, isLoading, error } = useQuery({
//     queryKey: ['teacher-portal', 'classes'],
//     queryFn: teacherPortalService.getMyClasses
//   });
  
//   // Handle different data structures
//   let classes = [];
//   let batches = [];
//   let programs = [];
  
//   if (data) {
//     // If data is an array, use it directly
//     if (Array.isArray(data)) {
//       classes = data;
      
//       // Extract batches and programs based on type
//       batches = data.filter(item => item.type === 'batch' || item.batch_id);
//       programs = data.filter(item => item.type === 'program' || item.program_id);
//     } 
//     // If data has a data property (common API response structure)
//     else if (data.data && Array.isArray(data.data)) {
//       classes = data.data;
//       batches = data.data.filter(item => item.type === 'batch' || item.batch_id);
//       programs = data.data.filter(item => item.type === 'program' || item.program_id);
//     }
//     // If data is an object with classes property
//     else if (data.classes && Array.isArray(data.classes)) {
//       classes = data.classes;
//       batches = data.batches || [];
//       programs = data.programs || [];
//     }
//   }
  
//   return { 
//     classes, 
//     batches, 
//     programs, 
//     loading: isLoading, 
//     error 
//   };
// };

// export const useTeacherStudents = (initialFilters = {}, page = 1, limit = 20) => {
//   const [filters, setFilters] = useState(initialFilters);

//   const { data, isLoading, error, refetch } = useQuery({
//     queryKey: ['teacher-portal', 'students', filters, page, limit],
//     queryFn: () => teacherPortalService.getMyStudents(filters, page, limit)
//   });

//   const students = useMemo(() => {
//     if (Array.isArray(data)) return data;
//     if (Array.isArray(data?.data)) return data.data;
//     if (Array.isArray(data?.students)) return data.students;
//     return [];
//   }, [data]);

//   const pagination = useMemo(() => {
//     if (data?.pagination) return data.pagination;
//     return { total: students.length, page, limit, totalPages: 1 };
//   }, [data, students.length, page, limit]);

//   const search = (searchTerm = '') => {
//     setFilters((prev) => ({ ...prev, search: searchTerm || undefined }));
//   };

//   const filterByClass = (classId = null) => {
//     setFilters((prev) => ({ ...prev, class_id: classId || undefined }));
//   };

//   return {
//     students,
//     pagination,
//     loading: isLoading,
//     error,
//     filters,
//     search,
//     filterByClass,
//     refetch
//   };
// };

// export const useTeacherAssignments = (filters = {}, page = 1, limit = 10) => {
//   const queryClient = useQueryClient();
  
//   const { data, isLoading, error, refetch } = useQuery({
//     queryKey: ['teacher-portal', 'assignments', filters, page, limit],
//     queryFn: () => teacherPortalService.getAssignments(filters, page, limit)
//   });
  
//   // Handle different data structures
//   let assignments = [];
//   let pagination = {};
  
//   if (data) {
//     if (Array.isArray(data)) {
//       assignments = data;
//     } else if (data.data && Array.isArray(data.data)) {
//       assignments = data.data;
//       pagination = data.pagination || {};
//     } else if (data.assignments && Array.isArray(data.assignments)) {
//       assignments = data.assignments;
//     }
//   }
  
//   const createAssignment = useMutation({
//     mutationFn: (formData) => teacherPortalService.createAssignment(formData),
//     onSuccess: () => {
//       queryClient.invalidateQueries({ queryKey: ['teacher-portal', 'assignments'] });
//       toast.success('Assignment created successfully');
//     },
//     onError: (error) => {
//       toast.error(error.response?.data?.message || 'Failed to create assignment');
//     }
//   });
  
//   const updateAssignment = useMutation({
//     mutationFn: ({ id, formData }) => teacherPortalService.updateAssignment(id, formData),
//     onSuccess: () => {
//       queryClient.invalidateQueries({ queryKey: ['teacher-portal', 'assignments'] });
//       toast.success('Assignment updated successfully');
//     },
//     onError: (error) => {
//       toast.error(error.response?.data?.message || 'Failed to update assignment');
//     }
//   });
  
//   const deleteAssignment = useMutation({
//     mutationFn: (id) => teacherPortalService.deleteAssignment(id),
//     onSuccess: () => {
//       queryClient.invalidateQueries({ queryKey: ['teacher-portal', 'assignments'] });
//       toast.success('Assignment deleted successfully');
//     },
//     onError: (error) => {
//       toast.error(error.response?.data?.message || 'Failed to delete assignment');
//     }
//   });
  
//   return {
//     assignments,
//     pagination,
//     loading: isLoading,
//     error,
//     refetch,
//     createAssignment: createAssignment.mutateAsync,
//     updateAssignment: (id, formData) => updateAssignment.mutateAsync({ id, formData }),
//     deleteAssignment: deleteAssignment.mutateAsync,
//     isCreating: createAssignment.isPending,
//     isUpdating: updateAssignment.isPending,
//     isDeleting: deleteAssignment.isPending
//   };
// };

// export const useAssignmentSubmissions = (assignmentId) =>
//   useQuery({
//     queryKey: ['teacher-portal', 'assignments', assignmentId, 'submissions'],
//     queryFn: () => teacherPortalService.getAssignmentSubmissions(assignmentId),
//     enabled: !!assignmentId
//   });

// export const useGradeSubmission = () => {
//   const queryClient = useQueryClient();
  
//   return useMutation({
//     mutationFn: ({ submissionId, data }) => teacherPortalService.gradeSubmission(submissionId, data),
//     onSuccess: (_, variables) => {
//       queryClient.invalidateQueries({ queryKey: ['teacher-portal', 'assignments'] });
//       queryClient.invalidateQueries({ queryKey: ['teacher-portal', 'assignments', variables.assignmentId, 'submissions'] });
//       toast.success('Submission graded successfully');
//     },
//     onError: (error) => {
//       toast.error(error.response?.data?.message || 'Failed to grade submission');
//     }
//   });
// };

// // export const useTeacherAttendance = (filters = {}) =>
// //   useQuery({
// //     queryKey: ['teacher-portal', 'attendance', filters],
// //     queryFn: () => teacherPortalService.getAttendance(filters)
// //   });


// export const useTeacherAttendance = () => {
//   const [loading, setLoading] = useState(false);

//   const markAttendance = useCallback(async (attendanceData) => {
//     try {
//       setLoading(true);
//       const response = await teacherPortalService.markAttendance(attendanceData);
//       toast.success('Attendance marked successfully');
//       return response.data;
//     } catch (error) {
//       toast.error(error.message || 'Failed to mark attendance');
//       throw error;
//     } finally {
//       setLoading(false);
//     }
//   }, []);

//   const getClassAttendance = useCallback(async (classId, date) => {
//     try {
//       setLoading(true);
//       const response = await teacherPortalService.getClassAttendance(classId, date);
//       return response.data;
//     } catch (error) {
//       toast.error('Failed to load attendance');
//       throw error;
//     } finally {
//       setLoading(false);
//     }
//   }, []);

//   const getStudentAttendance = useCallback(async (studentId) => {
//     try {
//       const response = await teacherPortalService.getStudentAttendance(studentId);
//       return response.data;
//     } catch (error) {
//       toast.error('Failed to load student attendance');
//       throw error;
//     }
//   }, []);

//   return {
//     loading,
//     markAttendance,
//     getClassAttendance,
//     getStudentAttendance
//   };
// };


// export const useMarkAttendance = () => {
//   const queryClient = useQueryClient();
  
//   return useMutation({
//     mutationFn: (data) => teacherPortalService.markAttendance(data),
//     onSuccess: () => {
//       queryClient.invalidateQueries({ queryKey: ['teacher-portal', 'attendance'] });
//       toast.success('Attendance marked successfully');
//     },
//     onError: (error) => {
//       toast.error(error.response?.data?.message || 'Failed to mark attendance');
//     }
//   });
// };

// export const useTeacherTimetable = () => {
//   const [timetable, setTimetable] = useState(null);
//   const [loading, setLoading] = useState(true);
//   const [week, setWeek] = useState(null);

//   useEffect(() => {
//     fetchTimetable();
//   }, [week]);

//   const fetchTimetable = async () => {
//     try {
//       setLoading(true);
//       const response = await teacherPortalService.getMyTimetable(week);
//       setTimetable(response.data);
//     } catch (error) {
//       toast.error('Failed to load timetable');
//     } finally {
//       setLoading(false);
//     }
//   };

//   const changeWeek = (newWeek) => {
//     setWeek(newWeek);
//   };

//   const nextWeek = () => {
//     // Calculate next week from current week
//     if (timetable?.week?.start) {
//       const next = new Date(timetable.week.start);
//       next.setDate(next.getDate() + 7);
//       setWeek(next.toISOString().split('T')[0]);
//     }
//   };

//   const prevWeek = () => {
//     if (timetable?.week?.start) {
//       const prev = new Date(timetable.week.start);
//       prev.setDate(prev.getDate() - 7);
//       setWeek(prev.toISOString().split('T')[0]);
//     }
//   };

//   return {
//     timetable,
//     loading,
//     week,
//     changeWeek,
//     nextWeek,
//     prevWeek,
//     refetch: fetchTimetable
//   };
// };

// export const useTeacherNotices = (limit = 10) =>
//   useQuery({
//     queryKey: ['teacher-portal', 'notices', limit],
//     queryFn: () => teacherPortalService.getNotices(limit)
//   });







// src/hooks/useTeacherPortal.js

import { useCallback, useEffect, useMemo, useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import teacherPortalService from '@/services/teacherPortalService';
import { toast } from 'sonner';

// Helper function to extract data from response
const extractData = (response) => {
  if (!response) return [];
  if (Array.isArray(response)) return response;
  if (Array.isArray(response?.data)) return response.data;
  if (Array.isArray(response?.students)) return response.students;
  if (Array.isArray(response?.items)) return response.items;
  return [];
};

const extractPagination = (response, defaultLimit = 10) => {
  if (response?.pagination) return response.pagination;
  if (response?.data?.pagination) return response.data.pagination;
  return { total: 0, page: 1, limit: defaultLimit, totalPages: 0 };
};

export const useTeacherDashboard = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchDashboard();
  }, []);

  const fetchDashboard = async () => {
    try {
      setLoading(true);
      const response = await teacherPortalService.getDashboard();
      // Handle both wrapped and unwrapped responses
      const dashboardData = response?.data || response;
      setData(dashboardData);
    } catch (err) {
      setError(err.message);
      toast.error('Failed to load dashboard');
    } finally {
      setLoading(false);
    }
  };

  return { data, loading, error, refetch: fetchDashboard };
};

export const useTeacherProfile = () => {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const response = await teacherPortalService.getProfile();
      setProfile(response);
    } catch (error) {
      toast.error('Failed to load profile');
    } finally {
      setLoading(false);
    }
  };

  const updateProfile = async (formData) => {
    try {
      const response = await teacherPortalService.updateProfile(formData);
      setProfile(response);
      toast.success('Profile updated successfully');
      return response;
    } catch (error) {
      toast.error(error.message || 'Failed to update profile');
      throw error;
    }
  };

  return { profile, loading, updateProfile, refetch: fetchProfile };
};

// Teacher Classes Hook - WITH SECTIONS
export const useTeacherClasses = () => {
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchClasses = useCallback(async () => {
    try {
      setLoading(true);
      const response = await teacherPortalService.getMyClasses();
      
      // Handle different response structures
      let classData = [];
      if (Array.isArray(response)) {
        classData = response;
      } else if (response?.data && Array.isArray(response.data)) {
        classData = response.data;
      } else if (response?.classes && Array.isArray(response.classes)) {
        classData = response.classes;
      }
      
      // Normalize class data with sections
      const normalizedClasses = classData.map(cls => ({
        id: cls.id || cls.class_id,
        class_id: cls.id || cls.class_id,
        name: cls.name || cls.class_name,
        class_name: cls.name || cls.class_name,
        sections: cls.sections || [],
        subjects: cls.subjects || [],
        subject_details: cls.subject_details || [],
        schedule: cls.schedule || [],
        is_active: cls.is_active !== false,
        student_count: cls.student_count || 0
      }));
      
      setClasses(normalizedClasses);
    } catch (err) {
      setError(err.message);
      toast.error('Failed to load classes');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchClasses();
  }, [fetchClasses]);

  const getClassDetails = async (classId) => {
    try {
      const response = await teacherPortalService.getClassDetails(classId);
      return response;
    } catch (error) {
      toast.error('Failed to load class details');
      throw error;
    }
  };

  return { 
    classes, 
    loading, 
    error,
    getClassDetails, 
    refetch: fetchClasses 
  };
};

// Teacher Students Hook - WITH PAGINATION & CLASS/SECTION FILTERS
export const useTeacherStudents = () => {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0
  });
  const [filters, setFilters] = useState({
    class_id: '',
    section_id: '',
    search: ''
  });
  const [attendanceSummary, setAttendanceSummary] = useState(null);

  const fetchStudents = useCallback(async (customFilters = {}, page = 1, limit = 10) => {
    // Use the provided filter set directly
    const mergedFilters = { ...customFilters };
    
    // Validate - class_id is required
    if (!mergedFilters.class_id) {
      setStudents([]);
      setPagination(prev => ({ ...prev, total: 0, totalPages: 0 }));
      return;
    }

    setLoading(true);
    setError(null);
    
    try {
      const response = await teacherPortalService.getMyStudents(
        mergedFilters,
        page,
        limit
      );
      
      // Extract students data
      let studentData = [];
      let paginationData = { page, limit, total: 0, totalPages: 0 };
      
      if (Array.isArray(response)) {
        studentData = response;
      } else if (response?.data && Array.isArray(response.data)) {
        studentData = response.data;
        paginationData = response.pagination || paginationData;
      } else if (response?.students && Array.isArray(response.students)) {
        studentData = response.students;
        paginationData = response.pagination || paginationData;
      } else if (response?.items && Array.isArray(response.items)) {
        studentData = response.items;
        paginationData = response.pagination || paginationData;
      }
      
      setStudents(studentData);
      setPagination({
        page: paginationData.page || page,
        limit: paginationData.limit || limit,
        total: paginationData.total || studentData.length,
        totalPages: paginationData.totalPages || Math.ceil((paginationData.total || studentData.length) / limit)
      });
      
      // Calculate attendance summary
      const present = studentData.filter(s => 
        s.attendance_today === 'present' || 
        (s.attendance_percentage >= 75 && !s.attendance_today)
      ).length;
      
      const totalAttendance = studentData.reduce((sum, s) => sum + (s.attendance_percentage || 0), 0);
      const avgAttendance = studentData.length ? Math.round(totalAttendance / studentData.length) : 0;
      
      setAttendanceSummary({
        present,
        absent: studentData.length - present,
        total: studentData.length,
        average_percentage: avgAttendance,
        present_percentage: studentData.length ? Math.round((present / studentData.length) * 100) : 0
      });
      
    } catch (err) {
      setError(err.message);
      toast.error(err.message || 'Failed to load students');
      setStudents([]);
    } finally {
      setLoading(false);
    }
  }, []);

  // Update filters and refetch
  const updateFilters = useCallback((newFilters) => {
    setFilters((prev) => {
      const nextFilters = { ...prev, ...newFilters };
      // Reset to page 1 when filters change
      fetchStudents(nextFilters, 1, pagination.limit);
      return nextFilters;
    });
  }, [fetchStudents, pagination.limit]);

  // Change page
  const changePage = useCallback((newPage) => {
    if (newPage >= 1 && newPage <= pagination.totalPages) {
      fetchStudents(filters, newPage, pagination.limit);
    }
  }, [filters, pagination.limit, pagination.totalPages, fetchStudents]);

  // Change page size
  const changePageSize = useCallback((newLimit) => {
    fetchStudents(filters, 1, newLimit);
  }, [filters, fetchStudents]);

  // Search students
  const searchStudents = useCallback((searchTerm) => {
    updateFilters({ search: searchTerm || '' });
  }, [updateFilters]);

  // Filter by class
  const filterByClass = useCallback((classId) => {
    updateFilters({ class_id: classId || '', section_id: '' }); // Reset section when class changes
  }, [updateFilters]);

  // Filter by section
  const filterBySection = useCallback((sectionId) => {
    updateFilters({ section_id: sectionId || '' });
  }, [updateFilters]);

  const getStudentDetails = useCallback(async (studentId) => {
    try {
      const response = await teacherPortalService.getStudentDetails(studentId);
      return response;
    } catch (error) {
      toast.error('Failed to load student details');
      throw error;
    }
  }, []);

  // Initial fetch when class_id is set
  useEffect(() => {
    if (filters.class_id) {
      fetchStudents(filters, 1, pagination.limit);
    }
  }, []); // Empty dependency - only on mount

  return {
    students,
    loading,
    error,
    pagination,
    filters,
    attendanceSummary,
    fetchStudents,
    updateFilters,
    searchStudents,
    filterByClass,
    filterBySection,
    changePage,
    changePageSize,
    getStudentDetails,
    refetch: () => fetchStudents(filters, pagination.page, pagination.limit)
  };
};

export const useTeacherAssignments = (initialFilters = {}) => {
  const [assignments, setAssignments] = useState([]);
  const [pagination, setPagination] = useState({ total: 0, page: 1, limit: 10, totalPages: 0 });
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState(initialFilters);

  const fetchAssignments = useCallback(async (page = 1) => {
    try {
      setLoading(true);
      const response = await teacherPortalService.getAssignments(filters, page, pagination.limit);
      
      let assignmentData = [];
      let paginationData = { page, limit: pagination.limit, total: 0, totalPages: 0 };
      
      if (Array.isArray(response)) {
        assignmentData = response;
      } else if (response?.data && Array.isArray(response.data)) {
        assignmentData = response.data;
        paginationData = response.pagination || paginationData;
      } else if (response?.assignments && Array.isArray(response.assignments)) {
        assignmentData = response.assignments;
        paginationData = response.pagination || paginationData;
      }
      
      setAssignments(assignmentData);
      setPagination({
        page: paginationData.page || page,
        limit: paginationData.limit || pagination.limit,
        total: paginationData.total || assignmentData.length,
        totalPages: paginationData.totalPages || Math.ceil((paginationData.total || assignmentData.length) / pagination.limit)
      });
    } catch (error) {
      toast.error('Failed to load assignments');
    } finally {
      setLoading(false);
    }
  }, [filters, pagination.limit]);

  useEffect(() => {
    fetchAssignments(1);
  }, [fetchAssignments]);

  const createAssignment = async (formData) => {
    try {
      const response = await teacherPortalService.createAssignment(formData);
      toast.success('Assignment created successfully');
      fetchAssignments(1);
      return response;
    } catch (error) {
      toast.error(error.message || 'Failed to create assignment');
      throw error;
    }
  };

  const getAssignmentDetails = async (assignmentId) => {
    try {
      const response = await teacherPortalService.getAssignmentDetails(assignmentId);
      return response;
    } catch (error) {
      toast.error('Failed to load assignment details');
      throw error;
    }
  };

  const updateAssignment = async (assignmentId, formData) => {
    try {
      const response = await teacherPortalService.updateAssignment(assignmentId, formData);
      toast.success('Assignment updated successfully');
      fetchAssignments(pagination.page);
      return response;
    } catch (error) {
      toast.error(error.message || 'Failed to update assignment');
      throw error;
    }
  };

  const deleteAssignment = async (assignmentId) => {
    try {
      await teacherPortalService.deleteAssignment(assignmentId);
      toast.success('Assignment deleted successfully');
      fetchAssignments(pagination.page);
    } catch (error) {
      toast.error(error.message || 'Failed to delete assignment');
      throw error;
    }
  };

  const gradeSubmission = async (submissionId, marks, feedback) => {
    try {
      const response = await teacherPortalService.gradeSubmission(submissionId, { marks, feedback });
      toast.success('Submission graded successfully');
      return response;
    } catch (error) {
      toast.error(error.message || 'Failed to grade submission');
      throw error;
    }
  };

  return {
    assignments,
    pagination,
    loading,
    filters,
    setFilters,
    createAssignment,
    getAssignmentDetails,
    updateAssignment,
    deleteAssignment,
    gradeSubmission,
    refetch: fetchAssignments
  };
};

export const useTeacherAttendance = () => {
  const [loading, setLoading] = useState(false);

  const markAttendance = useCallback(async (attendanceData) => {
    try {
      setLoading(true);
      const response = await teacherPortalService.markAttendance(attendanceData);
      toast.success('Attendance marked successfully');
      return response;
    } catch (error) {
      toast.error(error.message || 'Failed to mark attendance');
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  const getClassAttendance = useCallback(async (classId, date) => {
    try {
      setLoading(true);
      const response = await teacherPortalService.getClassAttendance(classId, date);
      return response;
    } catch (error) {
      toast.error('Failed to load attendance');
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  const getStudentAttendance = useCallback(async (studentId) => {
    try {
      const response = await teacherPortalService.getStudentAttendance(studentId);
      return response;
    } catch (error) {
      toast.error('Failed to load student attendance');
      throw error;
    }
  }, []);

  return {
    loading,
    markAttendance,
    getClassAttendance,
    getStudentAttendance
  };
};

export const useTeacherTimetable = () => {
  const [timetable, setTimetable] = useState(null);
  const [loading, setLoading] = useState(true);
  const [week, setWeek] = useState(null);

  useEffect(() => {
    fetchTimetable();
  }, [week]);

  const fetchTimetable = async () => {
    try {
      setLoading(true);
      const response = await teacherPortalService.getMyTimetable(week);
      setTimetable(response.data);
    } catch (error) {
      toast.error('Failed to load timetable');
    } finally {
      setLoading(false);
    }
  };

  const changeWeek = (newWeek) => {
    setWeek(newWeek);
  };

  const nextWeek = () => {
    // Calculate next week from current week
    if (timetable?.week?.start) {
      const next = new Date(timetable.week.start);
      next.setDate(next.getDate() + 7);
      setWeek(next.toISOString().split('T')[0]);
    }
  };

  const prevWeek = () => {
    if (timetable?.week?.start) {
      const prev = new Date(timetable.week.start);
      prev.setDate(prev.getDate() - 7);
      setWeek(prev.toISOString().split('T')[0]);
    }
  };

  return {
    timetable,
    loading,
    week,
    changeWeek,
    nextWeek,
    prevWeek,
    refetch: fetchTimetable
  };
};

export const useTeacherNotices = (limit = 10) => {
  const [notices, setNotices] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchNotices();
  }, []);

  const fetchNotices = async () => {
    try {
      const response = await teacherPortalService.getNotices(limit);
      setNotices(Array.isArray(response) ? response : response?.data || []);
    } catch (error) {
      toast.error('Failed to load notices');
    } finally {
      setLoading(false);
    }
  };

  return { notices, loading, refetch: fetchNotices };
};

// ─────────────────────────────────────────────────────────────────────────────
// EXAM MANAGEMENT HOOKS
// ─────────────────────────────────────────────────────────────────────────────

export const useTeacherExamAssignments = () => {
  const { data, isLoading, error } = useQuery({
    queryKey: ['teacher-portal', 'exam-assignments'],
    queryFn: teacherPortalService.getExamAssignments
  });

  const assignments = useMemo(() => {
    if (!data) return null;
    if (data.classes) return data; // Already in correct format
    if (data.data) return data.data; // Wrapped response
    return data; // Return as-is
  }, [data]);

  return { assignments, loading: isLoading, error };
};

export const useTeacherExams = (filters = {}, page = 1, limit = 10) => {
  const queryClient = useQueryClient();
  const [currentPage, setCurrentPage] = useState(page);
  const [currentLimit, setCurrentLimit] = useState(limit);

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['teacher-portal', 'exams', filters, currentPage, currentLimit],
    queryFn: () => teacherPortalService.getTeacherExams(filters, currentPage, currentLimit)
  });

      console.log('Teacher Exams Data', data);

  // Handle different data structures
  let exams = [];
  let pagination = { total: 0, page: currentPage, limit: currentLimit, totalPages: 0 };

  if (data) {
    if (data.data && Array.isArray(data.data.data)) {
      exams = data.data.data;
      pagination = data.data.pagination || data.pagination || pagination;
    } else if (data.data && Array.isArray(data.data)) {
      exams = data.data;
      pagination = data.pagination || pagination;
    } else if (Array.isArray(data)) {
      exams = data;
    } else if (data.exams && Array.isArray(data.exams)) {
      exams = data.exams;
      pagination = data.pagination || pagination;
    }
  }

  const createExamMutation = useMutation({
    mutationFn: (examData) => teacherPortalService.createExam(examData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['teacher-portal', 'exams'] });
      toast.success('Exam created successfully');
    },
    onError: (error) => {
      toast.error(error?.message || 'Failed to create exam');
    }
  });

      console.log('Teacher Exams', exams);

  return {
    exams,
    pagination,
    loading: isLoading,
    error,
    createExam: createExamMutation.mutate,
    isCreating: createExamMutation.isPending,
    refetch,
    setPage: setCurrentPage,
    setLimit: setCurrentLimit
  };
};

export const useTeacherExamDetails = (examId) => {
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['teacher-portal', 'exam-details', examId],
    queryFn: () => teacherPortalService.getExamDetails(examId),
    enabled: !!examId
  });

  const exam = useMemo(() => {
    if (!data) return null;
    return data.data || data;
  }, [data]);

  return {
    exam,
    loading: isLoading,
    error,
    refetch
  };
};

export const useTeacherExamResults = (examId, filters = {}, page = 1, limit = 20) => {
  const queryClient = useQueryClient();
  const [currentPage, setCurrentPage] = useState(page);
  const [currentLimit, setCurrentLimit] = useState(limit);

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['teacher-portal', 'exam-results', examId, filters, currentPage, currentLimit],
    queryFn: () => teacherPortalService.getExamResults(examId, filters, currentPage, currentLimit),
    enabled: !!examId,
    retry: 2,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000)
  });

  // Handle different data structures
  let results = [];
  let exam = {};
  let pagination = { total: 0, page: currentPage, limit: currentLimit, totalPages: 0 };

    console.log('Exam Result', data);

  // if (data) {
  //   if (Array.isArray(data)) {
  //     results = data;
  //   } else if (data.data && Array.isArray(data.data)) {
  //     results = data.data;
  //     pagination = data.pagination || pagination;
  //     exam = data.exam || {};
  //   } else if (data.results && Array.isArray(data.results)) {
  //     results = data.results;
  //     pagination = data.pagination || pagination;
  //     exam = data.exam || {};
  //   }
  // }

   if (data) {
    // Case 1: { success: true, data: { data: [...], exam: {...}, pagination: {...} } }
    if (data.data && data.data.data && Array.isArray(data.data.data)) {
      results = data.data.data;
      pagination = data.data.pagination || pagination;
      exam = data.data.exam || {};
    }
    // Case 2: { data: [...], exam: {...}, pagination: {...} }
    else if (data.data && Array.isArray(data.data)) {
      results = data.data;
      pagination = data.pagination || pagination;
      exam = data.exam || {};
    }
    // Case 3: { results: [...], exam: {...}, pagination: {...} }
    else if (data.results && Array.isArray(data.results)) {
      results = data.results;
      pagination = data.pagination || pagination;
      exam = data.exam || {};
    }
    // Case 4: Direct array
    else if (Array.isArray(data)) {
      results = data;
    }
    // Case 5: Wrapped in data property
    else if (data.data && typeof data.data === 'object' && !Array.isArray(data.data)) {
      if (data.data.results && Array.isArray(data.data.results)) {
        results = data.data.results;
      }
      exam = data.data.exam || {};
      pagination = data.data.pagination || pagination;
    }
  }

  console.log('Extracted Results:', results);
  console.log('Extracted Exam:', exam);
  console.log('Extracted Pagination:', pagination);

  const addResultsMutation = useMutation({
    mutationFn: (resultsData) => teacherPortalService.addExamResults(examId, resultsData),
    onSuccess: (data, variables, context) => {
      // Invalidate the results query to ensure fresh data
      queryClient.invalidateQueries({
        queryKey: ['teacher-portal', 'exam-results', examId]
      });
    },
    onError: (error) => {
      // Error is handled by the component itself
      // Hook only provides the data/error state
    }
  });

  // Wrapper function to support both old callback style and component-level handling
  const addResults = useCallback(
    (resultsData, callbacks = {}) => {
      const { onSuccess, onError } = callbacks;

      addResultsMutation.mutate(resultsData, {
        onSuccess: (data) => {
          if (onSuccess) {
            onSuccess(data);
          }
        },
        onError: (error) => {
          if (onError) {
            onError(error);
          }
        }
      });
    },
    [addResultsMutation]
  );  

  return {
    results,
    exam,
    pagination,
    loading: isLoading,
    error,
    addResults,
    isAddingResults: addResultsMutation.isPending,
    refetch,
    setPage: setCurrentPage,
    setLimit: setCurrentLimit,
    addResultsError: addResultsMutation.error,
    isError: addResultsMutation.isError
  };
};

// Add this new hook after useTeacherExamResults
export const useTeacherExamEntry = (examId, filters = {}, page = 1, limit = 100) => {
  const queryClient = useQueryClient();
  const [currentPage, setCurrentPage] = useState(page);
  const [currentLimit, setCurrentLimit] = useState(limit);

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['teacher-portal', 'exam-entry', examId, filters, currentPage, currentLimit],
    queryFn: () => teacherPortalService.getExamEntryStudents(examId, filters, currentPage, currentLimit),
    enabled: !!examId,
    retry: 2
  });

  // Handle different data structures
  let students = [];
  let exam = {};
  let pagination = { total: 0, page: currentPage, limit: currentLimit, totalPages: 0 };

  if (data) {
    if (data.data && Array.isArray(data.data.data)) {
      students = data.data.data;
      pagination = data.data.pagination || pagination;
      exam = data.data.exam || {};
    } else if (data.data && Array.isArray(data.data)) {
      students = data.data;
      pagination = data.pagination || pagination;
      exam = data.exam || {};
    } else if (data.students && Array.isArray(data.students)) {
      students = data.students;
      pagination = data.pagination || pagination;
      exam = data.exam || {};
    } else if (Array.isArray(data)) {
      students = data;
    }
  }

  const addResultsMutation = useMutation({
    mutationFn: (resultsData) => teacherPortalService.addExamResults(examId, resultsData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['teacher-portal', 'exam-entry', examId] });
      queryClient.invalidateQueries({ queryKey: ['teacher-portal', 'exam-results', examId] });
      queryClient.invalidateQueries({ queryKey: ['teacher-portal', 'exam-details', examId] });
      toast.success('Marks saved successfully!');
    },
    onError: (error) => {
      toast.error(error?.message || 'Failed to save marks');
    }
  });

  const addResults = useCallback((resultsData, callbacks = {}) => {
    addResultsMutation.mutate(resultsData, {
      onSuccess: (data) => callbacks.onSuccess?.(data),
      onError: (error) => callbacks.onError?.(error)
    });
  }, [addResultsMutation]);

  return {
    students,
    exam,
    pagination,
    loading: isLoading,
    error,
    addResults,
    isAddingResults: addResultsMutation.isPending,
    refetch,
    setPage: setCurrentPage,
    setLimit: setCurrentLimit
  };
};




// ─────────────────────────────────────────────────────────────────────────
// LEAVE REQUESTS
// ─────────────────────────────────────────────────────────────────────────

export const useTeacherLeaveRequests = (filters = {}, page = 1, limit = 10) =>
  useQuery({
    queryKey: ['teacher-portal', 'leave-requests', filters, page, limit],
    queryFn: () => teacherPortalService.getLeaveRequests(filters, page, limit)
  });

export const useTeacherLeaveStatistics = () =>
  useQuery({
    queryKey: ['teacher-portal', 'leave-statistics'],
    queryFn: teacherPortalService.getLeaveStatistics
  });

export const useTeacherLeaveBalance = () =>
  useQuery({
    queryKey: ['teacher-portal', 'leave-balance'],
    queryFn: teacherPortalService.getLeaveBalance
  });

export const usePendingLeaveApprovals = (filters = {}, page = 1, limit = 10) =>
  useQuery({
    queryKey: ['teacher-portal', 'leave-approvals', filters, page, limit],
    queryFn: () => teacherPortalService.getPendingLeaveApprovals(filters, page, limit)
  });

export const useCreateLeaveRequest = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data) => teacherPortalService.createLeaveRequest(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['teacher-portal', 'leave-requests'] });
      queryClient.invalidateQueries({ queryKey: ['teacher-portal', 'leave-statistics'] });
      queryClient.invalidateQueries({ queryKey: ['teacher-portal', 'leave-balance'] });
    }
  });
};

export const useCancelLeaveRequest = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }) => teacherPortalService.cancelLeaveRequest(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['teacher-portal', 'leave-requests'] });
      queryClient.invalidateQueries({ queryKey: ['teacher-portal', 'leave-statistics'] });
    }
  });
};

export const useApproveRejectLeaveRequest = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }) => teacherPortalService.approveRejectLeaveRequest?.(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['teacher-portal', 'leave-approvals'] });
      queryClient.invalidateQueries({ queryKey: ['teacher-portal', 'leave-requests'] });
    }
  });
};
