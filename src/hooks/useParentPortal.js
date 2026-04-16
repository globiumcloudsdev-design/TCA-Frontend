import { parentPortalService } from '@/services/parentPortalService';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

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

// export const useChildAttendance = (childId) =>
//   useQuery({
//     queryKey: ['parent-portal', 'children', childId, 'attendance'],
//     queryFn: () => parentPortalService.getChildAttendance(childId),
//     enabled: !!childId
//   });

// frontend/src/hooks/useParentPortal.js
// Add these hooks:

export const useChildAttendance = (childId, filters = {}) =>
  useQuery({
    queryKey: ['parent-portal', 'children', childId, 'attendance', filters],
    queryFn: () => parentPortalService.getChildAttendance(childId, filters),
    enabled: !!childId
  });

export const useAttendanceMonths = (childId) =>
  useQuery({
    queryKey: ['parent-portal', 'children', childId, 'attendance-months'],
    queryFn: () => parentPortalService.getAttendanceMonths(childId),
    enabled: !!childId
  });

// export const useChildResults = (childId) =>
//   useQuery({
//     queryKey: ['parent-portal', 'children', childId, 'results'],
//     queryFn: () => parentPortalService.getChildResults(childId),
//     enabled: !!childId
//   });

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

// export const usePayFee = () => {
//   const queryClient = useQueryClient();

//   return useMutation({
//     mutationFn: ({ voucherId, paymentData }) =>
//       parentPortalService.payFee(voucherId, paymentData),
//     onSuccess: () => {
//       queryClient.invalidateQueries({ queryKey: ['parent-portal'] });
//     }
//   });
// };

// ─────────────────────────────────────────────────────────────────────────
// LEAVE REQUESTS
// ─────────────────────────────────────────────────────────────────────────

export const useParentLeaveRequests = (filters = {}, page = 1, limit = 10) =>
  useQuery({
    queryKey: ['parent-portal', 'leave-requests', filters, page, limit],
    queryFn: () => parentPortalService.getLeaveRequests(filters, page, limit)
  });

export const useParentLeaveStatistics = (childId) =>
  useQuery({
    queryKey: ['parent-portal', 'leave-statistics', childId],
    queryFn: () => parentPortalService.getLeaveStatistics(childId),
    enabled: !!childId
  });

export const useParentLeaveBalance = (childId) =>
  useQuery({
    queryKey: ['parent-portal', 'leave-balance', childId],
    queryFn: () => parentPortalService.getLeaveBalance(childId),
    enabled: !!childId
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


// ─────────────────────────────────────────────────────────────────────────
// FEE MANAGEMENT HOOKS
// ─────────────────────────────────────────────────────────────────────────

export const useChildFees = (childId, filters = {}) =>
  useQuery({
    queryKey: ['parent-portal', 'children', childId, 'fees', filters],
    queryFn: () => parentPortalService.getChildFees(childId, filters),
    enabled: !!childId
  });

export const useFeeSummary = () =>
  useQuery({
    queryKey: ['parent-portal', 'fees', 'summary'],
    queryFn: () => parentPortalService.getFeeSummary()
  });

export const useVoucherDetails = (voucherId) =>
  useQuery({
    queryKey: ['parent-portal', 'fees', 'voucher', voucherId],
    queryFn: () => parentPortalService.getVoucherDetails(voucherId),
    enabled: !!voucherId
  });

export const usePayFee = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ voucherId, paymentData }) =>
      parentPortalService.payFee(voucherId, paymentData),
    onSuccess: (data, variables) => {
      // Invalidate relevant queries
      queryClient.invalidateQueries({ queryKey: ['parent-portal', 'children'] });
      queryClient.invalidateQueries({ queryKey: ['parent-portal', 'fees'] });
      queryClient.invalidateQueries({ 
        queryKey: ['parent-portal', 'children', variables.childId, 'fees'] 
      });
      queryClient.invalidateQueries({ queryKey: ['parent-portal', 'fees', 'summary'] });
    }
  });
};

export const usePaymentHistory = (filters = {}) =>
  useQuery({
    queryKey: ['parent-portal', 'payments', 'history', filters],
    queryFn: () => parentPortalService.getPaymentHistory(filters)
  });

export const useFeeStatistics = (childId) =>
  useQuery({
    queryKey: ['parent-portal', 'children', childId, 'fees', 'statistics'],
    queryFn: () => parentPortalService.getFeeStatistics(childId),
    enabled: !!childId
  });

export const useDownloadFeeReceipt = () => {
  return useMutation({
    mutationFn: ({ voucherId, format }) =>
      parentPortalService.downloadFeeReceipt(voucherId, format)
  });
};

// frontend/src/hooks/useParentPortal.js
// Add these hooks:

export const useChildResults = (childId, filters = {}) =>
  useQuery({
    queryKey: ['parent-portal', 'children', childId, 'results', filters],
    queryFn: () => parentPortalService.getChildResults(childId, filters),
    enabled: !!childId
  });

export const useResultStatistics = (childId) =>
  useQuery({
    queryKey: ['parent-portal', 'children', childId, 'results', 'statistics'],
    queryFn: () => parentPortalService.getResultStatistics(childId),
    enabled: !!childId
  });

export const useExamResultDetails = (resultId) =>
  useQuery({
    queryKey: ['parent-portal', 'results', resultId],
    queryFn: () => parentPortalService.getExamResultDetails(resultId),
    enabled: !!resultId
  });