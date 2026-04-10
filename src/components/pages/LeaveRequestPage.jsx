// src/components/pages/LeaveRequestPage.jsx
'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Calendar, CheckCircle, Clock, Search,
  Loader2, RefreshCw, Plus
} from 'lucide-react';
import { toast } from 'sonner';

import { leaveRequestService } from '@/services/leaveRequestService';
import { staffService } from '@/services/staffService';
import { teacherService } from '@/services/teacherService';
import { studentService } from '@/services/studentService';
import DataTable from '@/components/common/DataTable';
import AppModal from '@/components/common/AppModal';
import ConfirmDialog from '@/components/common/ConfirmDialog';
import TextareaField from '@/components/common/TextareaField';
import SelectField from '@/components/common/SelectField';
import DatePickerField from '@/components/common/DatePickerField';
import { useForm } from 'react-hook-form';
import PageHeader from '@/components/common/PageHeader';
import StatsCard from '@/components/common/StatsCard';
import TableRowActions from '@/components/common/TableRowActions';
import { cn } from '@/lib/utils';

const STATUS_OPTIONS = [
  { value: 'PENDING', label: 'Pending' },
  { value: 'APPROVED', label: 'Approved' },
  { value: 'REJECTED', label: 'Rejected' }
];

const USER_TYPE_OPTIONS = [
  { value: 'STAFF', label: 'Staff' },
  { value: 'TEACHER', label: 'Teacher' },
  { value: 'STUDENT', label: 'Student' }
];

export default function LeaveRequestPage({ type = 'school' }) {
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [filters, setFilters] = useState({});
  const [rejectModal, setRejectModal] = useState(false);
  const [manualModal, setManualModal] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [confirmApprove, setConfirmApprove] = useState(false);

  // Reject form
  const {
    register: rejectRegister,
    handleSubmit: rejectHandleSubmit,
    reset: rejectReset,
    formState: { errors: rejectErrors }
  } = useForm({
    defaultValues: { reject_reason: '' }
  });

  // Manual leave form
  const {
    register: manualRegister,
    control: manualControl,
    handleSubmit: manualHandleSubmit,
    reset: manualReset,
    formState: { errors: manualErrors },
    watch: manualWatch
  } = useForm({
    defaultValues: {
      user_type: 'STAFF',
      user_id: '',
      leave_type_id: '',
      from_date: '',
      to_date: '',
      reason: '',
      approve_immediately: false
    }
  });

  const selectedUserType = manualWatch('user_type');
  const fromDate = manualWatch('from_date');
  const toDate = manualWatch('to_date');

  // Calculate number_of_days
  const calculateNumberOfDays = (from, to) => {
    if (!from || !to) return 0;
    try {
      const fromD = new Date(from);
      const toD = new Date(to);
      const days = Math.ceil((toD - fromD) / (1000 * 60 * 60 * 24)) + 1;
      return Math.max(1, days);
    } catch {
      return 0;
    }
  };

  const numberOfDays = calculateNumberOfDays(fromDate, toDate);

  // ─────────────────────────────────────────────────────────────────────────────
  // QUERIES
  // ─────────────────────────────────────────────────────────────────────────────

  // Fetch leave requests
  const { data: leaveData, isLoading, refetch } = useQuery({
    queryKey: ['leave-requests', page, limit, filters],
    queryFn: () => leaveRequestService.getAll({
      ...filters,
      page,
      limit
    })
  });

  // Fetch leave types - extract unique from leave requests
  const leaveTypesData = (() => {
    if (!leaveData?.data) return [];
    const seen = new Set();
    return (leaveData.data || [])
      .filter(req => req.leaveType && req.leaveType.id && !seen.has(req.leaveType.id) && seen.add(req.leaveType.id))
      .map(req => ({
        value: req.leaveType.id,
        label: req.leaveType.leave_type_name || req.leaveType.name || 'Leave Type'
      }));
  })();

  // Fetch staff - only when user type = STAFF
  const { data: staffData = [] } = useQuery({
    queryKey: ['staff-list'],
    queryFn: async () => {
      try {
        const response = await staffService.getAll({ limit: 100 });
        return (response?.data || []).map(s => ({
          value: s.id,
          label: `${s.first_name} ${s.last_name}`
        }));
      } catch (error) {
        console.error('Error fetching staff:', error);
        return [];
      }
    },
    enabled: selectedUserType === 'STAFF'
  });

  // Fetch teachers - only when user type = TEACHER
  const { data: teacherData = [] } = useQuery({
    queryKey: ['teacher-list'],
    queryFn: async () => {
      try {
        const response = await teacherService.getAll({ limit: 100 });
        return (response?.data || []).map(t => ({
          value: t.id,
          label: `${t.first_name} ${t.last_name}`
        }));
      } catch (error) {
        console.error('Error fetching teachers:', error);
        return [];
      }
    },
    enabled: selectedUserType === 'TEACHER'
  });

  // Fetch students - only when user type = STUDENT
  const { data: studentData = [] } = useQuery({
    queryKey: ['student-list'],
    queryFn: async () => {
      try {
        const response = await studentService.getAll({ limit: 100 }, type);
        return (response?.data || []).map(s => ({
          value: s.id,
          label: `${s.first_name} ${s.last_name}`
        }));
      } catch (error) {
        console.error('Error fetching students:', error);
        return [];
      }
    },
    enabled: selectedUserType === 'STUDENT'
  });

  // Get user options based on selected type
  const getUserOptions = () => {
    switch (selectedUserType) {
      case 'STAFF':
        return staffData || [];
      case 'TEACHER':
        return teacherData || [];
      case 'STUDENT':
        return studentData || [];
      default:
        return [];
    }
  };

  // ─────────────────────────────────────────────────────────────────────────────
  // MUTATIONS
  // ─────────────────────────────────────────────────────────────────────────────

  const approveMutation = useMutation({
    mutationFn: (requestId) => leaveRequestService.approve(requestId),
    onSuccess: () => {
      toast.success('Leave request approved');
      setConfirmApprove(false);
      setSelectedRequest(null);
      queryClient.invalidateQueries({ queryKey: ['leave-requests'] });
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to approve');
    }
  });

  const rejectMutation = useMutation({
    mutationFn: ({ requestId, reason }) => leaveRequestService.reject(requestId, reason),
    onSuccess: () => {
      toast.success('Leave request rejected');
      setRejectModal(false);
      setSelectedRequest(null);
      rejectReset();
      queryClient.invalidateQueries({ queryKey: ['leave-requests'] });
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to reject');
    }
  });

  const manualCreateMutation = useMutation({
    mutationFn: (data) => leaveRequestService.adminMarkLeave(data),
    onSuccess: () => {
      toast.success('Leave marked successfully');
      manualReset();
      setManualModal(false);
      queryClient.invalidateQueries({ queryKey: ['leave-requests'] });
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to mark leave');
    }
  });

  // ─────────────────────────────────────────────────────────────────────────────
  // HANDLERS
  // ─────────────────────────────────────────────────────────────────────────────

  const handleReject = rejectHandleSubmit((data) => {
    if (!selectedRequest) return;
    rejectMutation.mutate({
      requestId: selectedRequest.id,
      reason: data.reject_reason
    });
  });

  const handleManualLeaveSubmit = manualHandleSubmit((data) => {
    if (!data.user_id) {
      toast.error('Please select a user');
      return;
    }
    if (!data.leave_type_id) {
      toast.error('Please select a leave type');
      return;
    }
    if (!fromDate || !toDate) {
      toast.error('Please select date range');
      return;
    }
    if (numberOfDays < 1) {
      toast.error('Invalid date range');
      return;
    }

    manualCreateMutation.mutate({
      user_id: data.user_id,
      leave_type_id: data.leave_type_id,
      from_date: fromDate,
      to_date: toDate,
      number_of_days: numberOfDays,
      reason: data.reason || '',
      approve_immediately: data.approve_immediately || false
    });
  });

  const handleFilterChange = (filterKey, value) => {
    if (value) {
      setFilters(prev => ({ ...prev, [filterKey]: value }));
    } else {
      const newFilters = { ...filters };
      delete newFilters[filterKey];
      setFilters(newFilters);
    }
    setPage(1);
  };

  // ─────────────────────────────────────────────────────────────────────────────
  // TABLE COLUMNS
  // ─────────────────────────────────────────────────────────────────────────────

  const columns = [
    {
      header: 'Employee / Student',
      accessorKey: 'user.first_name',
      cell: (info) => {
        const user = info.row.original.user;
        return (
          <div className="min-w-max">
            <p className="font-medium text-sm">{user?.first_name} {user?.last_name}</p>
            <p className="text-xs text-gray-500">{user?.email}</p>
          </div>
        );
      }
    },
    {
      header: 'Type',
      accessorKey: 'user_type',
      cell: (info) => {
        const type = info.getValue();
        const colors = {
          STAFF: 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-200',
          TEACHER: 'bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-200',
          STUDENT: 'bg-green-100 text-green-800 dark:bg-green-950 dark:text-green-200'
        };
        return (
          <span className={cn('px-2 py-1 rounded-full text-xs font-medium', colors[type])}>
            {type}
          </span>
        );
      }
    },
    {
      header: 'Leave Type',
      accessorKey: 'leaveType.name',
      cell: (info) => {
        const leaveType = info.row.original.leaveType;
        return <span className="text-sm">{leaveType?.name || leaveType?.leave_type_name || '—'}</span>;
      }
    },
    {
      header: 'Period',
      cell: (info) => {
        const req = info.row.original;
        const from = new Date(req.from_date).toLocaleDateString();
        const to = new Date(req.to_date).toLocaleDateString();
        const days = Math.ceil((new Date(req.to_date) - new Date(req.from_date)) / (1000 * 60 * 60 * 24)) + 1;
        return (
          <div>
            <p className="text-sm font-medium">{from} to {to}</p>
            <p className="text-xs text-gray-500">{days} days</p>
          </div>
        );
      }
    },
    {
      header: 'Reason',
      accessorKey: 'reason',
      cell: (info) => {
        const reason = info.getValue();
        return <p className="text-sm text-gray-600 dark:text-gray-400 truncate max-w-xs">{reason || '—'}</p>;
      }
    },
    {
      header: 'Status',
      accessorKey: 'status',
      cell: (info) => {
        const status = info.getValue();
        const colors = {
          PENDING: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-950 dark:text-yellow-200',
          APPROVED: 'bg-green-100 text-green-800 dark:bg-green-950 dark:text-green-200',
          REJECTED: 'bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-200'
        };
        return (
          <span className={cn('px-2 py-1 rounded-full text-xs font-semibold', colors[status])}>
            {status}
          </span>
        );
      }
    },
    {
      header: 'Actions',
      cell: (info) => {
        const req = info.row.original;
        const isPending = req.status === 'PENDING';

        return (
          <TableRowActions
            extra={isPending ? [
              {
                label: 'Approve',
                onClick: () => {
                  setSelectedRequest(req);
                  setConfirmApprove(true);
                }
              },
              {
                label: 'Reject',
                onClick: () => {
                  setSelectedRequest(req);
                  setRejectModal(true);
                }
              }
            ] : []}
            disabled={!isPending}
          />
        );
      }
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <div className="container mx-auto px-4 py-8">
        {/* Page Header with Action Button */}
        <PageHeader
          title="Leave Request Management"
          description="View, approve, and manage leave requests"
          action={
            <button
              onClick={() => setManualModal(true)}
              className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-md text-sm hover:opacity-90 transition"
            >
              <Plus size={16} />
              Mark Leave Manually
            </button>
          }
        />

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <StatsCard
            icon={<Clock size={20} />}
            label="Pending"
            value={leaveData?.pagination?.pending || 0}
          />
          <StatsCard
            icon={<CheckCircle size={20} />}
            label="Approved"
            value={leaveData?.pagination?.approved || 0}
          />
          <StatsCard
            label="Rejected"
            value={leaveData?.pagination?.rejected || 0}
          />
          <StatsCard
            label="Total"
            value={leaveData?.pagination?.total || 0}
          />
        </div>

        {/* Filters */}
        <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800 p-4 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="relative">
              <Search size={16} className="absolute left-3 top-3 text-gray-400" />
              <input
                type="text"
                placeholder="Search by name..."
                className="w-full pl-9 pr-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md bg-white dark:bg-gray-800 text-sm"
                onChange={(e) => handleFilterChange('search', e.target.value)}
              />
            </div>

            <select
              value={filters.status || ''}
              onChange={(e) => handleFilterChange('status', e.target.value)}
              className="px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md bg-white dark:bg-gray-800 text-sm"
            >
              <option value="">All Status</option>
              {STATUS_OPTIONS.map(opt => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>

            <select
              value={filters.user_type || ''}
              onChange={(e) => handleFilterChange('user_type', e.target.value)}
              className="px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md bg-white dark:bg-gray-800 text-sm"
            >
              <option value="">All Types</option>
              {USER_TYPE_OPTIONS.map(opt => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>

            <button
              onClick={() => refetch()}
              className="px-4 py-2 bg-primary text-white rounded-md text-sm hover:opacity-90 transition flex items-center gap-2 justify-center"
            >
              <RefreshCw size={16} />
              Refresh
            </button>
          </div>
        </div>

        {/* Data Table */}
        {isLoading ? (
          <div className="flex items-center justify-center h-96">
            <Loader2 className="animate-spin text-primary" size={32} />
          </div>
        ) : (
          <DataTable
            data={leaveData?.data || []}
            columns={columns}
            pagination={leaveData?.pagination}
            onPageChange={setPage}
            onLimitChange={setLimit}
          />
        )}
      </div>

      {/* Manual Leave Modal */}
      <AppModal
        open={manualModal}
        onClose={() => {
          setManualModal(false);
          manualReset();
        }}
        title="Mark Leave Manually"
        description="Mark leave for staff, teachers, or students"
        size="lg"
      >
        <form onSubmit={handleManualLeaveSubmit} className="space-y-4 max-h-96 overflow-y-auto">
          {/* User Type Selector */}
          <div>
            <label className="block text-sm font-medium mb-2">User Type *</label>
            <select
              {...manualRegister('user_type')}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md bg-white dark:bg-gray-800 text-sm"
            >
              {USER_TYPE_OPTIONS.map(opt => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </div>

          {/* User Selection */}
          <SelectField
            label={`Select ${selectedUserType}`}
            name="user_id"
            control={manualControl}
            options={getUserOptions()}
            placeholder={`Choose ${selectedUserType}...`}
            error={manualErrors.user_id}
            required
            rules={{ required: 'User is required' }}
          />

          {/* Leave Type */}
          <SelectField
            label="Leave Type"
            name="leave_type_id"
            control={manualControl}
            options={leaveTypesData}
            placeholder="Choose leave type..."
            error={manualErrors.leave_type_id}
            required
            rules={{ required: 'Leave type is required' }}
          />

          {/* From Date */}
          <DatePickerField
            label="From Date"
            name="from_date"
            control={manualControl}
            error={manualErrors.from_date}
            required
            rules={{ required: 'From date is required' }}
          />

          {/* To Date */}
          <DatePickerField
            label="To Date"
            name="to_date"
            control={manualControl}
            error={manualErrors.to_date}
            required
            rules={{ required: 'To date is required' }}
          />

          {/* Days Display */}
          {numberOfDays > 0 && (
            <div className="bg-blue-50 dark:bg-blue-950 p-3 rounded-md border border-blue-200 dark:border-blue-800">
              <p className="text-sm font-medium text-blue-900 dark:text-blue-100">
                Total Days: {numberOfDays}
              </p>
            </div>
          )}

          {/* Reason */}
          <TextareaField
            label="Reason (optional)"
            name="reason"
            register={manualRegister}
            placeholder="Enter reason for leave..."
            rows={3}
          />

          {/* Approve Immediately */}
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="approve_immediately"
              {...manualRegister('approve_immediately')}
              className="w-4 h-4 rounded border-gray-300"
            />
            <label htmlFor="approve_immediately" className="text-sm font-medium">
              Approve immediately (mark attendance automatically)
            </label>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 justify-end pt-4 border-t border-gray-200 dark:border-gray-800">
            <button
              type="button"
              onClick={() => {
                setManualModal(false);
                manualReset();
              }}
              className="px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-md text-sm hover:bg-gray-50 dark:hover:bg-gray-800 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={manualCreateMutation.isPending || numberOfDays < 1}
              className="px-4 py-2 bg-primary text-white rounded-md text-sm hover:opacity-90 transition disabled:opacity-50 flex items-center gap-2"
            >
              {manualCreateMutation.isPending ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  Marking...
                </>
              ) : (
                'Mark Leave'
              )}
            </button>
          </div>
        </form>
      </AppModal>

      {/* Reject Modal */}
      <AppModal
        open={rejectModal}
        onClose={() => setRejectModal(false)}
        title="Reject Leave Request"
        description="Provide a reason for rejection"
        size="md"
      >
        <form onSubmit={handleReject} className="space-y-4">
          {selectedRequest && (
            <div className="bg-blue-50 dark:bg-blue-950 p-4 rounded-lg border border-blue-200 dark:border-blue-800">
              <p className="text-sm font-medium text-blue-900 dark:text-blue-100">
                {selectedRequest.user?.first_name} {selectedRequest.user?.last_name}
              </p>
              <p className="text-sm text-blue-700 dark:text-blue-300">
                {new Date(selectedRequest.from_date).toLocaleDateString()} to{' '}
                {new Date(selectedRequest.to_date).toLocaleDateString()}
              </p>
            </div>
          )}

          <TextareaField
            label="Reason for Rejection"
            name="reject_reason"
            register={rejectRegister}
            error={rejectErrors.reject_reason}
            placeholder="Explain why this request is being rejected..."
            rows={4}
            required
          />

          <div className="flex gap-3 justify-end pt-4 border-t border-gray-200 dark:border-gray-800">
            <button
              type="button"
              onClick={() => setRejectModal(false)}
              className="px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-md text-sm hover:bg-gray-50 dark:hover:bg-gray-800 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={rejectMutation.isPending}
              className="px-4 py-2 bg-red-600 text-white rounded-md text-sm hover:bg-red-700 transition disabled:opacity-50 flex items-center gap-2"
            >
              {rejectMutation.isPending ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  Rejecting...
                </>
              ) : (
                'Reject Request'
              )}
            </button>
          </div>
        </form>
      </AppModal>

      {/* Approve Confirmation Dialog */}
      <ConfirmDialog
        open={confirmApprove}
        onOpenChange={setConfirmApprove}
        title="Approve Leave Request"
        description={`Confirm approval for ${selectedRequest?.user?.first_name}? Attendance will be marked automatically.`}
        onConfirm={() => approveMutation.mutate(selectedRequest?.id)}
        confirmText="Approve"
        isDangerous={false}
      />
    </div>
  );
}
