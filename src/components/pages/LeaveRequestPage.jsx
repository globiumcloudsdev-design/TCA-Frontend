// src/components/pages/LeaveRequestPage.jsx
'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Calendar, CheckCircle, Clock, Search, Loader2, RefreshCw, Plus } from 'lucide-react';
import { toast } from 'sonner';
import { useForm } from 'react-hook-form';

import { leaveRequestService } from '@/services/leaveRequestService';
import { staffService } from '@/services/staffService';
import { teacherService } from '@/services/teacherService';
import { studentService } from '@/services/studentService';

// Reusable Components
import DataTable from '@/components/common/DataTable';
import AppModal from '@/components/common/AppModal';
import ConfirmDialog from '@/components/common/ConfirmDialog';
import PageHeader from '@/components/common/PageHeader';
import StatsCard from '@/components/common/StatsCard';
import TableRowActions from '@/components/common/TableRowActions';
import InputField from '@/components/common/InputField';
import SelectField from '@/components/common/SelectField';
import TextareaField from '@/components/common/TextareaField';
import DatePickerField from '@/components/common/DatePickerField';
import CheckboxField from '@/components/common/CheckboxField';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

// ─────────────────────────────────────────────────────────────────────────────
// CONSTANTS
// ─────────────────────────────────────────────────────────────────────────────

const STATUS_OPTIONS = [
  { value: 'PENDING', label: 'Pending', color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-950 dark:text-yellow-200' },
  { value: 'APPROVED', label: 'Approved', color: 'bg-green-100 text-green-800 dark:bg-green-950 dark:text-green-200' },
  { value: 'REJECTED', label: 'Rejected', color: 'bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-200' }
];

const USER_TYPE_OPTIONS = [
  { value: 'STAFF', label: 'Staff', color: 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-200' },
  { value: 'TEACHER', label: 'Teacher', color: 'bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-200' },
  { value: 'STUDENT', label: 'Student', color: 'bg-green-100 text-green-800 dark:bg-green-950 dark:text-green-200' }
];

const DEFAULT_LEAVE_TYPE = {
  leave_type_name: '',
  description: '',
  max_days_per_year: 0,
  is_paid: true,
  requires_approval: true,
  color_code: '#3B82F6'
};

// ─────────────────────────────────────────────────────────────────────────────
// HELPER FUNCTIONS
// ─────────────────────────────────────────────────────────────────────────────

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

const formatDate = (date) => {
  if (!date) return '—';
  return new Date(date).toLocaleDateString();
};

// ─────────────────────────────────────────────────────────────────────────────
// STATUS BADGE COMPONENT
// ─────────────────────────────────────────────────────────────────────────────

const StatusBadge = ({ status }) => {
  const option = STATUS_OPTIONS.find(opt => opt.value === status);
  return (
    <span className={cn('px-2 py-1 rounded-full text-xs font-semibold', option?.color)}>
      {status}
    </span>
  );
};

const UserTypeBadge = ({ type }) => {
  const option = USER_TYPE_OPTIONS.find(opt => opt.value === type);
  return (
    <span className={cn('px-2 py-1 rounded-full text-xs font-medium', option?.color)}>
      {type}
    </span>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// LEAVE REQUEST TABLE COLUMNS
// ─────────────────────────────────────────────────────────────────────────────

const getLeaveRequestColumns = (onApprove, onReject) => [
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
    cell: (info) => <UserTypeBadge type={info.getValue()} />
  },
  {
    header: 'Leave Type',
    accessorKey: 'leaveType.name',
    cell: (info) => {
      const leaveType = info.row.original.leaveType;
      return (
        <div className="flex items-center gap-2">
          {leaveType?.color_code && (
            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: leaveType.color_code }} />
          )}
          <span className="text-sm">{leaveType?.name || leaveType?.leave_type_name || '—'}</span>
        </div>
      );
    }
  },
  {
    header: 'Period',
    cell: (info) => {
      const req = info.row.original;
      const days = calculateNumberOfDays(req.from_date, req.to_date);
      return (
        <div>
          <p className="text-sm font-medium">{formatDate(req.from_date)} → {formatDate(req.to_date)}</p>
          <p className="text-xs text-gray-500">{days} day{days !== 1 ? 's' : ''}</p>
        </div>
      );
    }
  },
  {
    header: 'Reason',
    accessorKey: 'reason',
    cell: (info) => (
      <p className="text-sm text-gray-600 dark:text-gray-400 truncate max-w-xs">
        {info.getValue() || '—'}
      </p>
    )
  },
  {
    header: 'Status',
    accessorKey: 'status',
    cell: (info) => <StatusBadge status={info.getValue()} />
  },
  {
    header: 'Actions',
    cell: (info) => {
      const req = info.row.original;
      const isPending = req.status === 'PENDING';
      
      return (
        <TableRowActions
          extra={isPending ? [
            { label: 'Approve', onClick: () => onApprove(req) },
            { label: 'Reject', onClick: () => onReject(req) }
          ] : []}
          disabled={!isPending}
        />
      );
    }
  }
];

// ─────────────────────────────────────────────────────────────────────────────
// LEAVE TYPES TABLE COLUMNS
// ─────────────────────────────────────────────────────────────────────────────

const getLeaveTypeColumns = (onEdit, onDelete) => [
  {
    header: 'Leave Type Name',
    accessorKey: 'leave_type_name',
    cell: (info) => (
      <div className="flex items-center gap-2">
        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: info.row.original.color_code }} />
        <span className="font-medium text-sm">{info.getValue()}</span>
      </div>
    )
  },
  {
    header: 'Description',
    accessorKey: 'description',
    cell: (info) => (
      <p className="text-sm text-gray-600 dark:text-gray-400 max-w-xs truncate">
        {info.getValue() || '—'}
      </p>
    )
  },
  {
    header: 'Max Days/Year',
    accessorKey: 'max_days_per_year',
    cell: (info) => <span className="text-sm font-medium">{info.getValue() || 0}</span>
  },
  {
    header: 'Type',
    cell: (info) => {
      const { is_paid, requires_approval } = info.row.original;
      return (
        <div className="flex gap-2">
          {is_paid && <Badge variant="success" className="text-xs">Paid</Badge>}
          {requires_approval && <Badge variant="info" className="text-xs">Requires Approval</Badge>}
        </div>
      );
    }
  },
  {
    header: 'Status',
    accessorKey: 'is_active',
    cell: (info) => (
      <Badge variant={info.getValue() ? 'success' : 'secondary'}>
        {info.getValue() ? 'Active' : 'Inactive'}
      </Badge>
    )
  },
  {
    header: 'Actions',
    cell: (info) => {
      const leaveType = info.row.original;
      return (
        <TableRowActions
          extra={[
            { label: 'Edit', onClick: () => onEdit(leaveType) },
            { label: 'Delete', isDanger: true, onClick: () => onDelete(leaveType) }
          ]}
        />
      );
    }
  }
];

// ─────────────────────────────────────────────────────────────────────────────
// FILTER BAR COMPONENT
// ─────────────────────────────────────────────────────────────────────────────

const FilterBar = ({ filters, onFilterChange, onRefresh, isRefreshing }) => {
  const [search, setSearch] = useState(filters.search || '');
  
  const handleSearch = (value) => {
    setSearch(value);
    onFilterChange('search', value);
  };
  
  return (
    <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800 p-4 mb-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <InputField
          placeholder="Search by name..."
          value={search}
          onChange={(e) => handleSearch(e.target.value)}
          icon={<Search size={16} />}
        />
        
        <SelectField
          value={filters.status || ''}
          onChange={(value) => onFilterChange('status', value)}
          options={[{ value: '', label: 'All Status' }, ...STATUS_OPTIONS]}
          placeholder="All Status"
        />
        
        <SelectField
          value={filters.user_type || ''}
          onChange={(value) => onFilterChange('user_type', value)}
          options={[{ value: '', label: 'All Types' }, ...USER_TYPE_OPTIONS]}
          placeholder="All Types"
        />
        
        <Button onClick={onRefresh} disabled={isRefreshing} className="gap-2">
          <RefreshCw size={16} className={cn(isRefreshing && 'animate-spin')} />
          Refresh
        </Button>
      </div>
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// MAIN COMPONENT
// ─────────────────────────────────────────────────────────────────────────────

export default function LeaveRequestPage({ type = 'school' }) {
  const queryClient = useQueryClient();
  
  // State
  const [activeTab, setActiveTab] = useState('requests');
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [leaveTypePage, setLeaveTypePage] = useState(1);
  const [leaveTypeLimit, setLeaveTypeLimit] = useState(10);
  const [filters, setFilters] = useState({});
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [selectedLeaveType, setSelectedLeaveType] = useState(null);
  
  // Modal States
  const [modals, setModals] = useState({
    reject: false,
    manual: false,
    addLeaveType: false,
    editLeaveType: false,
    confirmApprove: false,
    confirmDeleteLeaveType: false
  });
  
  const toggleModal = (modal, value) => {
    setModals(prev => ({ ...prev, [modal]: value }));
  };
  
  // ─────────────────────────────────────────────────────────────────────────
  // FORMS
  // ─────────────────────────────────────────────────────────────────────────
  
  const rejectForm = useForm({ defaultValues: { reject_reason: '' } });
  const manualForm = useForm({
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
  
  const addLeaveTypeForm = useForm({ defaultValues: DEFAULT_LEAVE_TYPE });
  const editLeaveTypeForm = useForm({ defaultValues: DEFAULT_LEAVE_TYPE });
  
  const selectedUserType = manualForm.watch('user_type');
  const fromDate = manualForm.watch('from_date');
  const toDate = manualForm.watch('to_date');
  const numberOfDays = calculateNumberOfDays(fromDate, toDate);
  
  // ─────────────────────────────────────────────────────────────────────────
  // QUERIES
  // ─────────────────────────────────────────────────────────────────────────
  
  const { data: leaveData, isLoading, refetch } = useQuery({
    queryKey: ['leave-requests', page, limit, filters],
    queryFn: () => leaveRequestService.getAll({ ...filters, page, limit })
  });
  
  const { data: leaveTypesResponse, isLoading: leaveTypesLoading } = useQuery({
    queryKey: ['leave-types-table', leaveTypePage, leaveTypeLimit],
    queryFn: () => leaveRequestService.getLeaveTypes({ page: leaveTypePage, limit: leaveTypeLimit })
  });
  
  const { data: leaveTypesDropdown } = useQuery({
    queryKey: ['leave-types-dropdown'],
    queryFn: () => leaveRequestService.getLeaveTypes({ limit: 100, is_active: true })
  });
  
  const leaveTypeOptions = (leaveTypesDropdown?.data || []).map(lt => ({
    value: lt.id,
    label: lt.leave_type_name
  }));
  
  // User queries based on type
  const { data: staffOptions = [] } = useQuery({
    queryKey: ['staff-list'],
    queryFn: async () => {
      const response = await staffService.getAll({ limit: 100 });
      return (response?.data || []).map(s => ({ value: s.id, label: `${s.first_name} ${s.last_name}` }));
    },
    enabled: selectedUserType === 'STAFF'
  });
  
  const { data: teacherOptions = [] } = useQuery({
    queryKey: ['teacher-list'],
    queryFn: async () => {
      const response = await teacherService.getAll({ limit: 100 });
      return (response?.data || []).map(t => ({ value: t.id, label: `${t.first_name} ${t.last_name}` }));
    },
    enabled: selectedUserType === 'TEACHER'
  });
  
  const { data: studentOptions = [] } = useQuery({
    queryKey: ['student-list'],
    queryFn: async () => {
      const response = await studentService.getAll({ limit: 100 }, type);
      return (response?.data || []).map(s => ({ value: s.id, label: `${s.first_name} ${s.last_name}` }));
    },
    enabled: selectedUserType === 'STUDENT'
  });
  
  const getUserOptions = () => {
    switch (selectedUserType) {
      case 'STAFF': return staffOptions;
      case 'TEACHER': return teacherOptions;
      case 'STUDENT': return studentOptions;
      default: return [];
    }
  };
  
  // ─────────────────────────────────────────────────────────────────────────
  // MUTATIONS
  // ─────────────────────────────────────────────────────────────────────────
  
  const invalidateQueries = () => {
    queryClient.invalidateQueries({ queryKey: ['leave-requests'] });
    queryClient.invalidateQueries({ queryKey: ['leave-types-table'] });
    queryClient.invalidateQueries({ queryKey: ['leave-types-dropdown'] });
  };
  
  const approveMutation = useMutation({
    mutationFn: (requestId) => leaveRequestService.approve(requestId),
    onSuccess: () => { toast.success('Leave request approved'); toggleModal('confirmApprove', false); invalidateQueries(); },
    onError: (error) => toast.error(error.response?.data?.message || 'Failed to approve')
  });
  
  const rejectMutation = useMutation({
    mutationFn: ({ requestId, reason }) => leaveRequestService.reject(requestId, reason),
    onSuccess: () => { toast.success('Leave request rejected'); toggleModal('reject', false); rejectForm.reset(); invalidateQueries(); },
    onError: (error) => toast.error(error.response?.data?.message || 'Failed to reject')
  });
  
  const manualCreateMutation = useMutation({
    mutationFn: (data) => leaveRequestService.adminMarkLeave(data),
    onSuccess: () => { toast.success('Leave marked successfully'); toggleModal('manual', false); manualForm.reset(); invalidateQueries(); },
    onError: (error) => toast.error(error.response?.data?.message || 'Failed to mark leave')
  });
  
  const addLeaveTypeMutation = useMutation({
    mutationFn: (data) => leaveRequestService.createLeaveType(data),
    onSuccess: () => { toast.success('Leave type added successfully'); toggleModal('addLeaveType', false); addLeaveTypeForm.reset(); invalidateQueries(); },
    onError: (error) => toast.error(error.response?.data?.message || 'Failed to add leave type')
  });
  
  const editLeaveTypeMutation = useMutation({
    mutationFn: ({ id, data }) => leaveRequestService.updateLeaveType(id, data),
    onSuccess: () => { toast.success('Leave type updated successfully'); toggleModal('editLeaveType', false); editLeaveTypeForm.reset(); invalidateQueries(); },
    onError: (error) => toast.error(error.response?.data?.message || 'Failed to update leave type')
  });
  
  const deleteLeaveTypeMutation = useMutation({
    mutationFn: (id) => leaveRequestService.deleteLeaveType(id),
    onSuccess: () => { toast.success('Leave type deleted successfully'); toggleModal('confirmDeleteLeaveType', false); invalidateQueries(); },
    onError: (error) => toast.error(error.response?.data?.message || 'Failed to delete leave type')
  });
  
  // ─────────────────────────────────────────────────────────────────────────
  // HANDLERS
  // ─────────────────────────────────────────────────────────────────────────
  
  const handleFilterChange = (key, value) => {
    if (value) setFilters(prev => ({ ...prev, [key]: value }));
    else setFilters(prev => { const { [key]: _, ...rest } = prev; return rest; });
    setPage(1);
  };
  
  const handleApprove = (request) => {
    setSelectedRequest(request);
    toggleModal('confirmApprove', true);
  };
  
  const handleReject = (request) => {
    setSelectedRequest(request);
    toggleModal('reject', true);
  };
  
  const handleEditLeaveType = (leaveType) => {
    setSelectedLeaveType(leaveType);
    editLeaveTypeForm.reset({
      leave_type_name: leaveType.leave_type_name,
      description: leaveType.description,
      max_days_per_year: leaveType.max_days_per_year,
      is_paid: leaveType.is_paid,
      requires_approval: leaveType.requires_approval,
      color_code: leaveType.color_code
    });
    toggleModal('editLeaveType', true);
  };
  
  const handleDeleteLeaveType = (leaveType) => {
    setSelectedLeaveType(leaveType);
    toggleModal('confirmDeleteLeaveType', true);
  };
  
  const onSubmitReject = rejectForm.handleSubmit((data) => {
    if (selectedRequest) rejectMutation.mutate({ requestId: selectedRequest.id, reason: data.reject_reason });
  });
  
  const onSubmitManual = manualForm.handleSubmit((data) => {
    if (!data.user_id) return toast.error('Please select a user');
    if (!data.leave_type_id) return toast.error('Please select a leave type');
    if (!fromDate || !toDate) return toast.error('Please select date range');
    if (numberOfDays < 1) return toast.error('Invalid date range');
    
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
  
  const onSubmitAddLeaveType = addLeaveTypeForm.handleSubmit((data) => {
    if (!data.leave_type_name?.trim()) return toast.error('Please enter leave type name');
    addLeaveTypeMutation.mutate(data);
  });
  
  const onSubmitEditLeaveType = editLeaveTypeForm.handleSubmit((data) => {
    if (!selectedLeaveType) return;
    if (!data.leave_type_name?.trim()) return toast.error('Please enter leave type name');
    editLeaveTypeMutation.mutate({ id: selectedLeaveType.id, data });
  });
  
  // ─────────────────────────────────────────────────────────────────────────
  // RENDER
  // ─────────────────────────────────────────────────────────────────────────
  
  const pagination = leaveData?.pagination || {};
  const leaveTypesData = leaveTypesResponse?.data || [];
  const leaveTypesTotal = leaveTypesResponse?.total || 0;
  
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <div className="container mx-auto px-4 py-8">
        <PageHeader
          title="Leave Request Management"
          description="View, approve, and manage leave requests"
          action={
            <div className="flex gap-3">
              <Button variant="outline" onClick={() => toggleModal('addLeaveType', true)}>
                <Plus size={16} className="mr-2" />
                Add Leave Type
              </Button>
              {activeTab === 'requests' && (
                <Button onClick={() => toggleModal('manual', true)}>
                  <Plus size={16} className="mr-2" />
                  Mark Leave Manually
                </Button>
              )}
            </div>
          }
        />
        
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="bg-transparent border-b rounded-none p-0">
            <TabsTrigger value="requests" className="data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none">
              Leave Requests
            </TabsTrigger>
            <TabsTrigger value="types" className="data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none">
              Leave Types
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="requests" className="space-y-6">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <StatsCard icon={<Clock size={20} />} label="Pending" value={pagination.pending || 0} />
              <StatsCard icon={<CheckCircle size={20} />} label="Approved" value={pagination.approved || 0} />
              <StatsCard icon={<Calendar size={20} />} label="Rejected" value={pagination.rejected || 0} />
              <StatsCard icon={<RefreshCw size={20} />} label="Total" value={pagination.total || 0} />
            </div>
            
            {/* Filters */}
            <FilterBar
              filters={filters}
              onFilterChange={handleFilterChange}
              onRefresh={refetch}
              isRefreshing={isLoading}
            />
            
            {/* Table */}
            <DataTable
              data={leaveData?.data || []}
              columns={getLeaveRequestColumns(handleApprove, handleReject)}
              isLoading={isLoading}
              pagination={{
                page: pagination.page || 1,
                totalPages: Math.ceil((pagination.total || 0) / limit),
                onPageChange: setPage,
                pageSize: limit,
                onPageSizeChange: setLimit
              }}
            />
          </TabsContent>
          
          <TabsContent value="types" className="space-y-6">
            <DataTable
              data={leaveTypesData}
              columns={getLeaveTypeColumns(handleEditLeaveType, handleDeleteLeaveType)}
              isLoading={leaveTypesLoading}
              pagination={{
                page: leaveTypePage,
                totalPages: Math.ceil(leaveTypesTotal / leaveTypeLimit),
                onPageChange: setLeaveTypePage,
                pageSize: leaveTypeLimit,
                onPageSizeChange: setLeaveTypeLimit
              }}
            />
          </TabsContent>
        </Tabs>
      </div>
      
      {/* ───────────────────────────────────────────────────────────────────────── */}
      {/* MODALS */}
      {/* ───────────────────────────────────────────────────────────────────────── */}
      
      {/* Manual Leave Modal */}
      <AppModal
        open={modals.manual}
        onClose={() => { toggleModal('manual', false); manualForm.reset(); }}
        title="Mark Leave Manually"
        description="Mark leave for staff, teachers, or students"
        size="lg"
      >
        <form onSubmit={onSubmitManual} className="space-y-4 max-h-96 overflow-y-auto">
          <SelectField
            label="User Type"
            name="user_type"
            control={manualForm.control}
            options={USER_TYPE_OPTIONS}
            required
          />
          
          <SelectField
            label={`Select ${selectedUserType}`}
            name="user_id"
            control={manualForm.control}
            options={getUserOptions()}
            placeholder={`Choose ${selectedUserType}...`}
            required
            rules={{ required: 'User is required' }}
          />
          
          <SelectField
            label="Leave Type"
            name="leave_type_id"
            control={manualForm.control}
            options={leaveTypeOptions}
            placeholder="Choose leave type..."
            required
            rules={{ required: 'Leave type is required' }}
          />
          
          <div className="grid grid-cols-2 gap-4">
            <DatePickerField
              label="From Date"
              name="from_date"
              control={manualForm.control}
              required
              rules={{ required: 'From date is required' }}
            />
            <DatePickerField
              label="To Date"
              name="to_date"
              control={manualForm.control}
              required
              rules={{ required: 'To date is required' }}
            />
          </div>
          
          {numberOfDays > 0 && (
            <div className="bg-blue-50 dark:bg-blue-950 p-3 rounded-md">
              <p className="text-sm font-medium text-blue-900 dark:text-blue-100">
                Total Days: {numberOfDays}
              </p>
            </div>
          )}
          
          <TextareaField
            label="Reason (optional)"
            name="reason"
            register={manualForm.register}
            placeholder="Enter reason for leave..."
            rows={3}
          />
          
          {/* <CheckboxField
            label="Approve immediately (mark attendance automatically)"
            name="approve_immediately"
            control={manualForm.control}
          /> */}
          
          {/* <div className="flex gap-3 justify-end pt-4 border-t">
            <Button variant="outline" type="button" onClick={() => toggleModal('manual', false)}>Cancel</Button>
            <Button type="submit" disabled={manualCreateMutation.isPending || numberOfDays < 1}>
              {manualCreateMutation.isPending ? <Loader2 size={16} className="animate-spin mr-2" /> : null}
              Mark Leave
            </Button>
          </div> */}
        </form>
      </AppModal>
      
      {/* Reject Modal */}
      <AppModal
        open={modals.reject}
        onClose={() => { toggleModal('reject', false); rejectForm.reset(); }}
        title="Reject Leave Request"
        description="Provide a reason for rejection"
        size="md"
      >
        <form onSubmit={onSubmitReject} className="space-y-4">
          {selectedRequest && (
            <div className="bg-blue-50 dark:bg-blue-950 p-4 rounded-lg">
              <p className="font-medium">{selectedRequest.user?.first_name} {selectedRequest.user?.last_name}</p>
              <p className="text-sm">{formatDate(selectedRequest.from_date)} → {formatDate(selectedRequest.to_date)}</p>
            </div>
          )}
          
          <TextareaField
            label="Reason for Rejection"
            name="reject_reason"
            register={rejectForm.register}
            placeholder="Explain why this request is being rejected..."
            rows={4}
            required
          />
          
          <div className="flex gap-3 justify-end pt-4 border-t">
            <Button variant="outline" type="button" onClick={() => toggleModal('reject', false)}>Cancel</Button>
            <Button variant="destructive" type="submit" disabled={rejectMutation.isPending}>
              {rejectMutation.isPending ? <Loader2 size={16} className="animate-spin mr-2" /> : null}
              Reject Request
            </Button>
          </div>
        </form>
      </AppModal>
      
      {/* Approve Confirmation */}
      <ConfirmDialog
        open={modals.confirmApprove}
        onClose={() => toggleModal('confirmApprove', false)}
        title="Approve Leave Request"
        description={`Confirm approval for ${selectedRequest?.user?.first_name}? Attendance will be marked automatically.`}
        onConfirm={() => approveMutation.mutate(selectedRequest?.id)}
        confirmLabel="Approve"
        variant="default"
      />
      
      {/* Add Leave Type Modal */}
      <AppModal
        open={modals.addLeaveType}
        onClose={() => { toggleModal('addLeaveType', false); addLeaveTypeForm.reset(); }}
        title="Add Leave Type"
        description="Create a new leave type"
        size="md"
      >
        <form onSubmit={onSubmitAddLeaveType} className="space-y-4">
          <InputField
            label="Leave Type Name"
            name="leave_type_name"
            register={addLeaveTypeForm.register}
            required
            error={addLeaveTypeForm.formState.errors.leave_type_name}
          />
          
          <TextareaField
            label="Description (optional)"
            name="description"
            register={addLeaveTypeForm.register}
            rows={3}
          />
          
          <div className="grid grid-cols-2 gap-4">
            <InputField
              label="Max Days Per Year"
              name="max_days_per_year"
              type="number"
              register={addLeaveTypeForm.register}
            />
            <InputField
              label="Color Code"
              name="color_code"
              type="color"
              register={addLeaveTypeForm.register}
              className="h-10"
            />
          </div>
          
          <div className="flex gap-4">
            <CheckboxField label="Is Paid Leave" name="is_paid" control={addLeaveTypeForm.control} />
            <CheckboxField label="Requires Approval" name="requires_approval" control={addLeaveTypeForm.control} />
          </div>
          
          <div className="flex gap-3 justify-end pt-4 border-t">
            <Button variant="outline" type="button" onClick={() => toggleModal('addLeaveType', false)}>Cancel</Button>
            <Button type="submit" disabled={addLeaveTypeMutation.isPending}>
              {addLeaveTypeMutation.isPending ? <Loader2 size={16} className="animate-spin mr-2" /> : null}
              Add Leave Type
            </Button>
          </div>
        </form>
      </AppModal>
      
      {/* Edit Leave Type Modal */}
      <AppModal
        open={modals.editLeaveType}
        onClose={() => { toggleModal('editLeaveType', false); editLeaveTypeForm.reset(); }}
        title="Edit Leave Type"
        description="Update leave type details"
        size="md"
      >
        <form onSubmit={onSubmitEditLeaveType} className="space-y-4">
          <InputField
            label="Leave Type Name"
            name="leave_type_name"
            register={editLeaveTypeForm.register}
            required
            error={editLeaveTypeForm.formState.errors.leave_type_name}
          />
          
          <TextareaField
            label="Description (optional)"
            name="description"
            register={editLeaveTypeForm.register}
            rows={3}
          />
          
          <div className="grid grid-cols-2 gap-4">
            <InputField
              label="Max Days Per Year"
              name="max_days_per_year"
              type="number"
              register={editLeaveTypeForm.register}
            />
            <InputField
              label="Color Code"
              name="color_code"
              type="color"
              register={editLeaveTypeForm.register}
              className="h-10"
            />
          </div>
          
          <div className="flex gap-4">
            <CheckboxField label="Is Paid Leave" name="is_paid" control={editLeaveTypeForm.control} />
            <CheckboxField label="Requires Approval" name="requires_approval" control={editLeaveTypeForm.control} />
          </div>
          
          <div className="flex gap-3 justify-end pt-4 border-t">
            <Button variant="outline" type="button" onClick={() => toggleModal('editLeaveType', false)}>Cancel</Button>
            <Button type="submit" disabled={editLeaveTypeMutation.isPending}>
              {editLeaveTypeMutation.isPending ? <Loader2 size={16} className="animate-spin mr-2" /> : null}
              Update Leave Type
            </Button>
          </div>
        </form>
      </AppModal>
      
      {/* Delete Leave Type Confirmation */}
      <ConfirmDialog
        open={modals.confirmDeleteLeaveType}
        onClose={() => toggleModal('confirmDeleteLeaveType', false)}
        title="Delete Leave Type"
        description={`Are you sure you want to delete "${selectedLeaveType?.leave_type_name}"? This action cannot be undone.`}
        onConfirm={() => deleteLeaveTypeMutation.mutate(selectedLeaveType?.id)}
        confirmLabel="Delete"
        variant="destructive"
      />
    </div>
  );
}