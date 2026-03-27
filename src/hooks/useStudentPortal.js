import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import studentPortalService from '@/services/studentPortalService';

export const useStudentDashboard = () =>
  useQuery({
    queryKey: ['student-portal', 'dashboard'],
    queryFn: studentPortalService.getDashboard
  });

export const useStudentProfile = () =>
  useQuery({
    queryKey: ['student-portal', 'profile'],
    queryFn: studentPortalService.getProfile
  });

export const useStudentTimetable = (week = null) =>
  useQuery({
    queryKey: ['student-portal', 'timetable', week || 'current'],
    queryFn: () => studentPortalService.getMyTimetable(week)
  });

export const useStudentAttendance = (filters = {}) =>
  useQuery({
    queryKey: ['student-portal', 'attendance', filters],
    queryFn: () => studentPortalService.getAttendance(filters)
  });

export const useStudentAssignments = (filters = {}, page = 1, limit = 10) =>
  useQuery({
    queryKey: ['student-portal', 'assignments', filters, page, limit],
    queryFn: () => studentPortalService.getAssignments(filters, page, limit)
  });

export const useStudentResults = (filters = {}) =>
  useQuery({
    queryKey: ['student-portal', 'results', filters],
    queryFn: () => studentPortalService.getResults(filters)
  });

export const useStudentFees = (filters = {}) =>
  useQuery({
    queryKey: ['student-portal', 'fees', filters],
    queryFn: () => studentPortalService.getFees(filters)
  });

export const useStudentNotices = (filters = {}, page = 1, limit = 20) =>
  useQuery({
    queryKey: ['student-portal', 'notices', filters, page, limit],
    queryFn: () => studentPortalService.getNotices(filters, page, limit)
  });

export const useStudentClasses = () =>
  useQuery({
    queryKey: ['student-portal', 'classes'],
    queryFn: studentPortalService.getMyClasses
  });

export const useSubmitStudentAssignment = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ assignmentId, formData }) =>
      studentPortalService.submitAssignment(assignmentId, formData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['student-portal', 'assignments'] });
      queryClient.invalidateQueries({ queryKey: ['student-portal', 'dashboard'] });
    }
  });
};
