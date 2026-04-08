import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import parentPortalService from '@/services/parentPortalService';

export const useParentDashboard = () =>
  useQuery({
    queryKey: ['parent-portal', 'dashboard'],
    queryFn: parentPortalService.getDashboard
  });

export const useParentProfile = () =>
  useQuery({
    queryKey: ['parent-portal', 'profile'],
    queryFn: parentPortalService.getProfile
  });

export const useParentChildren = () =>
  useQuery({
    queryKey: ['parent-portal', 'children'],
    queryFn: parentPortalService.getChildren
  });

export const useChildDetails = (childId) =>
  useQuery({
    queryKey: ['parent-portal', 'children', childId],
    queryFn: () => parentPortalService.getChildDetails(childId),
    enabled: !!childId
  });

export const useChildAttendance = (childId) =>
  useQuery({
    queryKey: ['parent-portal', 'children', childId, 'attendance'],
    queryFn: () => parentPortalService.getChildAttendance(childId),
    enabled: !!childId
  });

export const useChildResults = (childId) =>
  useQuery({
    queryKey: ['parent-portal', 'children', childId, 'results'],
    queryFn: () => parentPortalService.getChildResults(childId),
    enabled: !!childId
  });

export const useChildFees = (childId) =>
  useQuery({
    queryKey: ['parent-portal', 'children', childId, 'fees'],
    queryFn: () => parentPortalService.getChildFees(childId),
    enabled: !!childId
  });

export const useChildAssignments = (childId, filters = {}, page = 1, limit = 10) =>
  useQuery({
    queryKey: ['parent-portal', 'children', childId, 'assignments', filters, page, limit],
    queryFn: () => parentPortalService.getChildAssignments(childId, filters, page, limit),
    enabled: !!childId
  });

export const useChildTimetable = (childId) =>
  useQuery({
    queryKey: ['parent-portal', 'children', childId, 'timetable'],
    queryFn: () => parentPortalService.getChildTimetable(childId),
    enabled: !!childId
  });

export const useChildrenTeachers = () =>
  useQuery({
    queryKey: ['parent-portal', 'teachers'],
    queryFn: parentPortalService.getChildrenTeachers
  });

export const useParentNotices = (limit = 10) =>
  useQuery({
    queryKey: ['parent-portal', 'notices', limit],
    queryFn: () => parentPortalService.getNotices(limit)
  });

export const usePayFee = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ voucherId, paymentData }) =>
      parentPortalService.payFee(voucherId, paymentData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['parent-portal'] });
    }
  });
};

// ─────────────────────────────────────────────────────────────────────────
// LEAVE REQUESTS
// ─────────────────────────────────────────────────────────────────────────

export const useParentLeaveRequests = (filters = {}, page = 1, limit = 10) =>
  useQuery({
    queryKey: ['parent-portal', 'leave-requests', filters, page, limit],
    queryFn: () => parentPortalService.getLeaveRequests(filters, page, limit)
  });

export const useParentLeaveStatistics = () =>
  useQuery({
    queryKey: ['parent-portal', 'leave-statistics'],
    queryFn: parentPortalService.getLeaveStatistics
  });

export const useParentLeaveBalance = () =>
  useQuery({
    queryKey: ['parent-portal', 'leave-balance'],
    queryFn: parentPortalService.getLeaveBalance
  });

export const useCreateParentLeaveRequest = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data) => parentPortalService.createLeaveRequest(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['parent-portal', 'leave-requests'] });
      queryClient.invalidateQueries({ queryKey: ['parent-portal', 'leave-statistics'] });
      queryClient.invalidateQueries({ queryKey: ['parent-portal', 'leave-balance'] });
    }
  });
};

export const useCancelParentLeaveRequest = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }) => parentPortalService.cancelLeaveRequest(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['parent-portal', 'leave-requests'] });
      queryClient.invalidateQueries({ queryKey: ['parent-portal', 'leave-statistics'] });
    }
  });
};
