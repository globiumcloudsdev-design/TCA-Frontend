// // frontend/src/hooks/useTeacherPortal.js

// /**
//  * Custom hooks for Teacher Portal
//  * Makes it easy to use teacher portal service in components
//  */

// import { useState, useEffect, useCallback } from 'react';
// import { teacherPortalService } from '@/services/teacherPortalService';
// import { toast } from 'sonner';

// const toArray = (value) => (Array.isArray(value) ? value : []);

// const extractListPayload = (response) => {
//   const payload = response?.data;

//   if (Array.isArray(payload)) {
//     return {
//       items: payload,
//       pagination: response?.pagination || { total: payload.length, page: 1, limit: payload.length || 20, totalPages: 1 }
//     };
//   }

//   if (Array.isArray(payload?.data)) {
//     return {
//       items: payload.data,
//       pagination: payload.pagination || response?.pagination || { total: payload.data.length, page: 1, limit: payload.data.length || 20, totalPages: 1 }
//     };
//   }

//   return {
//     items: [],
//     pagination: response?.pagination || { total: 0, page: 1, limit: 20, totalPages: 0 }
//   };
// };

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
//   const [classes, setClasses] = useState([]);
//   const [loading, setLoading] = useState(true);

//   useEffect(() => {
//     fetchClasses();
//   }, []);

//   const fetchClasses = async () => {
//     try {
//       const response = await teacherPortalService.getMyClasses();
//       setClasses(toArray(response?.data));
//     } catch (error) {
//       toast.error('Failed to load classes');
//     } finally {
//       setLoading(false);
//     }
//   };

//   const getClassDetails = async (classId) => {
//     try {
//       const response = await teacherPortalService.getClassDetails(classId);
//       return response.data;
//     } catch (error) {
//       toast.error('Failed to load class details');
//       throw error;
//     }
//   };

//   return { classes, loading, getClassDetails, refetch: fetchClasses };
// };

// export const useTeacherStudents = (initialFilters = {}) => {
//   const [students, setStudents] = useState([]);
//   const [pagination, setPagination] = useState({ total: 0, page: 1, limit: 20, totalPages: 0 });
//   const [loading, setLoading] = useState(false);
//   const [filters, setFilters] = useState(initialFilters);

//   const fetchStudents = useCallback(async (page = 1) => {
//     try {
//       setLoading(true);
//       const response = await teacherPortalService.getMyStudents(filters, page, pagination.limit);
//       const { items, pagination: pager } = extractListPayload(response);
//       setStudents(items);
//       setPagination(pager);
//     } catch (error) {
//       toast.error('Failed to load students');
//     } finally {
//       setLoading(false);
//     }
//   }, [filters, pagination.limit]);

//   useEffect(() => {
//     fetchStudents(1);
//   }, [fetchStudents]);

//   const search = useCallback((searchTerm) => {
//     setFilters((prev) => (
//       prev.search === searchTerm
//         ? prev
//         : { ...prev, search: searchTerm }
//     ));
//   }, []);

//   const filterByClass = useCallback((classId) => {
//     setFilters((prev) => (
//       prev.class_id === classId
//         ? prev
//         : { ...prev, class_id: classId }
//     ));
//   }, []);

//   const getStudentDetails = useCallback(async (studentId) => {
//     try {
//       const response = await teacherPortalService.getStudentDetails(studentId);
//       return response.data;
//     } catch (error) {
//       toast.error('Failed to load student details');
//       throw error;
//     }
//   }, []);

//   return {
//     students,
//     pagination,
//     loading,
//     filters,
//     search,
//     filterByClass,
//     getStudentDetails,
//     refetch: fetchStudents,
//     nextPage: () => fetchStudents(pagination.page + 1),
//     prevPage: () => fetchStudents(pagination.page - 1)
//   };
// };

// export const useTeacherAssignments = (initialFilters = {}) => {
//   const [assignments, setAssignments] = useState([]);
//   const [pagination, setPagination] = useState({ total: 0, page: 1, limit: 10, totalPages: 0 });
//   const [loading, setLoading] = useState(false);
//   const [filters, setFilters] = useState(initialFilters);

//   const fetchAssignments = async (page = 1) => {
//     try {
//       setLoading(true);
//       const response = await teacherPortalService.getMyAssignments(filters, page, pagination.limit);
//       const { items, pagination: pager } = extractListPayload(response);
//       setAssignments(items);
//       setPagination(pager);
//     } catch (error) {
//       toast.error('Failed to load assignments');
//     } finally {
//       setLoading(false);
//     }
//   };

//   useEffect(() => {
//     fetchAssignments(1);
//   }, [filters]);

//   const createAssignment = async (formData) => {
//     try {
//       const response = await teacherPortalService.createAssignment(formData);
//       toast.success('Assignment created successfully');
//       fetchAssignments(1);
//       return response.data;
//     } catch (error) {
//       toast.error(error.message || 'Failed to create assignment');
//       throw error;
//     }
//   };

//   const getAssignmentDetails = async (assignmentId) => {
//     try {
//       const response = await teacherPortalService.getAssignmentDetails(assignmentId);
//       return response.data;
//     } catch (error) {
//       toast.error('Failed to load assignment details');
//       throw error;
//     }
//   };

//   const updateAssignment = async (assignmentId, formData) => {
//     try {
//       const response = await teacherPortalService.updateAssignment(assignmentId, formData);
//       toast.success('Assignment updated successfully');
//       fetchAssignments(pagination.page);
//       return response.data;
//     } catch (error) {
//       toast.error(error.message || 'Failed to update assignment');
//       throw error;
//     }
//   };

//   const deleteAssignment = async (assignmentId) => {
//     try {
//       await teacherPortalService.deleteAssignment(assignmentId);
//       toast.success('Assignment deleted successfully');
//       fetchAssignments(pagination.page);
//     } catch (error) {
//       toast.error(error.message || 'Failed to delete assignment');
//       throw error;
//     }
//   };

//   const gradeSubmission = async (submissionId, marks, feedback) => {
//     try {
//       const response = await teacherPortalService.gradeSubmission(submissionId, { marks, feedback });
//       toast.success('Submission graded successfully');
//       return response.data;
//     } catch (error) {
//       toast.error(error.message || 'Failed to grade submission');
//       throw error;
//     }
//   };

//   return {
//     assignments,
//     pagination,
//     loading,
//     filters,
//     setFilters,
//     createAssignment,
//     getAssignmentDetails,
//     updateAssignment,
//     deleteAssignment,
//     gradeSubmission,
//     refetch: fetchAssignments,
//     nextPage: () => fetchAssignments(pagination.page + 1),
//     prevPage: () => fetchAssignments(pagination.page - 1)
//   };
// };

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

// export const useTeacherNotices = (limit = 10) => {
//   const [notices, setNotices] = useState([]);
//   const [loading, setLoading] = useState(true);

//   useEffect(() => {
//     fetchNotices();
//   }, []);

//   const fetchNotices = async () => {
//     try {
//       const response = await teacherPortalService.getNotices(limit);
//       setNotices(response.data);
//     } catch (error) {
//       toast.error('Failed to load notices');
//     } finally {
//       setLoading(false);
//     }
//   };

//   return { notices, loading, refetch: fetchNotices };
// };










// src/hooks/useTeacherPortal.js

import { useCallback, useEffect, useMemo, useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import teacherPortalService from '@/services/teacherPortalService';
import { toast } from 'sonner';

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
      setData(response.data);
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
      setProfile(response.data);
    } catch (error) {
      toast.error('Failed to load profile');
    } finally {
      setLoading(false);
    }
  };

  const updateProfile = async (formData) => {
    try {
      const response = await teacherPortalService.updateProfile(formData);
      setProfile(response.data);
      toast.success('Profile updated successfully');
      return response.data;
    } catch (error) {
      toast.error(error.message || 'Failed to update profile');
      throw error;
    }
  };

  return { profile, loading, updateProfile, refetch: fetchProfile };
};


export const useTeacherClasses = () => {
  const { data, isLoading, error } = useQuery({
    queryKey: ['teacher-portal', 'classes'],
    queryFn: teacherPortalService.getMyClasses
  });
  
  // Handle different data structures
  let classes = [];
  let batches = [];
  let programs = [];
  
  if (data) {
    // If data is an array, use it directly
    if (Array.isArray(data)) {
      classes = data;
      
      // Extract batches and programs based on type
      batches = data.filter(item => item.type === 'batch' || item.batch_id);
      programs = data.filter(item => item.type === 'program' || item.program_id);
    } 
    // If data has a data property (common API response structure)
    else if (data.data && Array.isArray(data.data)) {
      classes = data.data;
      batches = data.data.filter(item => item.type === 'batch' || item.batch_id);
      programs = data.data.filter(item => item.type === 'program' || item.program_id);
    }
    // If data is an object with classes property
    else if (data.classes && Array.isArray(data.classes)) {
      classes = data.classes;
      batches = data.batches || [];
      programs = data.programs || [];
    }
  }
  
  return { 
    classes, 
    batches, 
    programs, 
    loading: isLoading, 
    error 
  };
};

export const useTeacherStudents = (initialFilters = {}, page = 1, limit = 20) => {
  const [filters, setFilters] = useState(initialFilters);

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['teacher-portal', 'students', filters, page, limit],
    queryFn: () => teacherPortalService.getMyStudents(filters, page, limit)
  });

  const students = useMemo(() => {
    if (Array.isArray(data)) return data;
    if (Array.isArray(data?.data)) return data.data;
    if (Array.isArray(data?.students)) return data.students;
    return [];
  }, [data]);

  const pagination = useMemo(() => {
    if (data?.pagination) return data.pagination;
    return { total: students.length, page, limit, totalPages: 1 };
  }, [data, students.length, page, limit]);

  const search = (searchTerm = '') => {
    setFilters((prev) => ({ ...prev, search: searchTerm || undefined }));
  };

  const filterByClass = (classId = null) => {
    setFilters((prev) => ({ ...prev, class_id: classId || undefined }));
  };

  return {
    students,
    pagination,
    loading: isLoading,
    error,
    filters,
    search,
    filterByClass,
    refetch
  };
};

export const useTeacherAssignments = (filters = {}, page = 1, limit = 10) => {
  const queryClient = useQueryClient();
  
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['teacher-portal', 'assignments', filters, page, limit],
    queryFn: () => teacherPortalService.getAssignments(filters, page, limit)
  });
  
  // Handle different data structures
  let assignments = [];
  let pagination = {};
  
  if (data) {
    if (Array.isArray(data)) {
      assignments = data;
    } else if (data.data && Array.isArray(data.data)) {
      assignments = data.data;
      pagination = data.pagination || {};
    } else if (data.assignments && Array.isArray(data.assignments)) {
      assignments = data.assignments;
    }
  }
  
  const createAssignment = useMutation({
    mutationFn: (formData) => teacherPortalService.createAssignment(formData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['teacher-portal', 'assignments'] });
      toast.success('Assignment created successfully');
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to create assignment');
    }
  });
  
  const updateAssignment = useMutation({
    mutationFn: ({ id, formData }) => teacherPortalService.updateAssignment(id, formData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['teacher-portal', 'assignments'] });
      toast.success('Assignment updated successfully');
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to update assignment');
    }
  });
  
  const deleteAssignment = useMutation({
    mutationFn: (id) => teacherPortalService.deleteAssignment(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['teacher-portal', 'assignments'] });
      toast.success('Assignment deleted successfully');
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to delete assignment');
    }
  });
  
  return {
    assignments,
    pagination,
    loading: isLoading,
    error,
    refetch,
    createAssignment: createAssignment.mutateAsync,
    updateAssignment: (id, formData) => updateAssignment.mutateAsync({ id, formData }),
    deleteAssignment: deleteAssignment.mutateAsync,
    isCreating: createAssignment.isPending,
    isUpdating: updateAssignment.isPending,
    isDeleting: deleteAssignment.isPending
  };
};

export const useAssignmentSubmissions = (assignmentId) =>
  useQuery({
    queryKey: ['teacher-portal', 'assignments', assignmentId, 'submissions'],
    queryFn: () => teacherPortalService.getAssignmentSubmissions(assignmentId),
    enabled: !!assignmentId
  });

export const useGradeSubmission = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ submissionId, data }) => teacherPortalService.gradeSubmission(submissionId, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['teacher-portal', 'assignments'] });
      queryClient.invalidateQueries({ queryKey: ['teacher-portal', 'assignments', variables.assignmentId, 'submissions'] });
      toast.success('Submission graded successfully');
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to grade submission');
    }
  });
};

// export const useTeacherAttendance = (filters = {}) =>
//   useQuery({
//     queryKey: ['teacher-portal', 'attendance', filters],
//     queryFn: () => teacherPortalService.getAttendance(filters)
//   });


export const useTeacherAttendance = () => {
  const [loading, setLoading] = useState(false);

  const markAttendance = useCallback(async (attendanceData) => {
    try {
      setLoading(true);
      const response = await teacherPortalService.markAttendance(attendanceData);
      toast.success('Attendance marked successfully');
      return response.data;
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
      return response.data;
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
      return response.data;
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


export const useMarkAttendance = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data) => teacherPortalService.markAttendance(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['teacher-portal', 'attendance'] });
      toast.success('Attendance marked successfully');
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to mark attendance');
    }
  });
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

export const useTeacherNotices = (limit = 10) =>
  useQuery({
    queryKey: ['teacher-portal', 'notices', limit],
    queryFn: () => teacherPortalService.getNotices(limit)
  });