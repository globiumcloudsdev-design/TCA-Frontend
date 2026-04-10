'use client';
/**
 * StaffAttendancePage — Staff daily attendance for all types
 */
import { useState, useMemo, useEffect } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { CheckSquare, X, Minus } from 'lucide-react';
import useInstituteConfig from '@/hooks/useInstituteConfig';
import useAuthStore from '@/store/authStore';
import DataTable from '@/components/common/DataTable';
import PageHeader from '@/components/common/PageHeader';
import StatsCard from '@/components/common/StatsCard';
import AppModal from '@/components/common/AppModal';
import ConfirmDialog from '@/components/common/ConfirmDialog';
import TableRowActions from '@/components/common/TableRowActions';
import SelectField from '@/components/common/SelectField';
import DatePickerField from '@/components/common/DatePickerField';
import TimePickerField from '@/components/common/TimePickerField';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

const STATUS_COLORS = { present: 'bg-emerald-100 text-emerald-700', absent: 'bg-red-100 text-red-700', late: 'bg-amber-100 text-amber-700', leave: 'bg-blue-100 text-blue-700' };
const STATUS_OPTS = [{ value: 'present', label: 'Present' }, { value: 'absent', label: 'Absent' }, { value: 'late', label: 'Late' }];

const MANUAL_STATUS_OPTS = [
  { value: 'present', label: 'Present' },
  { value: 'absent', label: 'Absent' },
  { value: 'late', label: 'Late' },
  { value: 'leave', label: 'Leave' },
];

const STAFF_TYPE_OPTS = [
  { value: 'Accountant', label: 'Accountant' },
  { value: 'Teacher', label: 'Teacher' },
  { value: 'Clerk', label: 'Clerk' },
  { value: 'Librarian', label: 'Librarian' },
  { value: 'Peon', label: 'Peon' },
  { value: 'GateKeeper', label: 'GateKeeper' },
  { value: 'Branch Head', label: 'Branch Head' },
  { value: 'Other', label: 'Other' },
];

const toISODateTime = (date, time) => {
  if (!date || !time) return null;
  const dt = new Date(`${date}T${time}:00`);
  if (Number.isNaN(dt.getTime())) return null;
  return dt.toISOString();
};

const formatTimeDisplay = (value) => {
  if (!value) return '—';

  if (/^\d{2}:\d{2}/.test(String(value))) {
    return String(value).slice(0, 5);
  }

  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return String(value);

  return d.toLocaleTimeString('en-PK', { hour: '2-digit', minute: '2-digit', hour12: false });
};

const toInputTime = (value) => {
  if (!value) return '';
  if (/^\d{2}:\d{2}/.test(String(value))) return String(value).slice(0, 5);
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return '';
  return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
};

export default function StaffAttendancePage({ type }) {
  const qc = useQueryClient();
  const canDo = useAuthStore((s) => s.canDo);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [staffTypeFilter, setStaffTypeFilter] = useState('');
  const [dateFilter, setDateFilter] = useState('');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [isMarkModalOpen, setIsMarkModalOpen] = useState(false);
  const [editingAttendanceId, setEditingAttendanceId] = useState(null);
  const [deletingRecord, setDeletingRecord] = useState(null);
  const [manualForm, setManualForm] = useState({
    staff_id: '',
    date: '',
    status: 'present',
    check_in: '',
    check_out: '',
    remarks: '',
  });
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    const today = new Date().toISOString().slice(0, 10);
    setDateFilter(today);
    setManualForm(prev => ({ ...prev, date: today }));
  }, []);

  const { data, isLoading } = useQuery({
    queryKey: ['staff-attendance', type, page, pageSize, search, statusFilter, staffTypeFilter, dateFilter],
    queryFn: async () => {
      try {
        const { staffAttendanceService } = await import('@/services');
        return await staffAttendanceService.getAll({
          page,
          limit: pageSize,
          search,
          status: statusFilter,
          staff_type: staffTypeFilter,
          date: dateFilter,
        });
      } catch (err) {
        console.error('Error loading staff attendance:', err);
        return { data: { rows: [], total: 0, totalPages: 1 } };
      }
    },
    placeholderData: (p) => p,
  });

  const { data: membersListData } = useQuery({
    queryKey: ['staff-teacher-for-attendance-modal'],
    queryFn: async () => {
      const [{ staffService }, { teacherService }] = await Promise.all([
        import('@/services/staffService'),
        import('@/services'),
      ]);

      const [staffRes, teacherRes] = await Promise.all([
        staffService.getAll({ page: 1, limit: 500, is_active: true }),
        teacherService.getAll({ page: 1, limit: 500, status: 'active' }),
      ]);

      return {
        staff: Array.isArray(staffRes?.data) ? staffRes.data : [],
        teachers: Array.isArray(teacherRes?.data) ? teacherRes.data : [],
      };
    },
  });

  const memberOptions = useMemo(() => {
    const staffList = Array.isArray(membersListData?.staff) ? membersListData.staff : [];
    const teacherList = Array.isArray(membersListData?.teachers) ? membersListData.teachers : [];

    const staffOptions = staffList.map((item) => {
      const name = `${item.first_name || ''} ${item.last_name || ''}`.trim() || item.email || 'Unknown';
      const employeeId = item?.details?.employee_id || item.employee_id || '';
      const staffType = item.staff_type || 'Staff';
      return {
        value: item.id,
        label: `${name}${employeeId ? ` (${employeeId})` : ''} - ${staffType}`,
      };
    });

    const teacherOptions = teacherList.map((item) => {
      const name = `${item.first_name || ''} ${item.last_name || ''}`.trim() || item.email || 'Unknown';
      const employeeId = item?.details?.employee_id || item.employee_id || '';
      return {
        value: item.id,
        label: `${name}${employeeId ? ` (${employeeId})` : ''} - Teacher`,
      };
    });

    return [...teacherOptions, ...staffOptions];
  }, [membersListData]);

  const markManualMutation = useMutation({
    mutationFn: async (payload) => {
      const { staffAttendanceService } = await import('@/services');
      return staffAttendanceService.markAttendance(payload);
    },
    onSuccess: () => {
      toast.success('Attendance marked successfully');
      setIsMarkModalOpen(false);
      setManualForm({
        staff_id: '',
        date: dateFilter,
        status: 'present',
        check_in: '',
        check_out: '',
        remarks: '',
      });
      qc.invalidateQueries({ queryKey: ['staff-attendance'] });
    },
    onError: (error) => {
      toast.error(error?.response?.data?.message || error?.message || 'Failed to mark attendance');
    },
  });

  const updateAttendanceMutation = useMutation({
    mutationFn: async ({ id, payload }) => {
      const { staffAttendanceService } = await import('@/services');
      return staffAttendanceService.update(id, payload);
    },
    onSuccess: () => {
      toast.success('Attendance updated successfully');
      setIsMarkModalOpen(false);
      setEditingAttendanceId(null);
      setManualForm({
        staff_id: '',
        date: dateFilter,
        status: 'present',
        check_in: '',
        check_out: '',
        remarks: '',
      });
      qc.invalidateQueries({ queryKey: ['staff-attendance'] });
    },
    onError: (error) => {
      toast.error(error?.response?.data?.message || error?.message || 'Failed to update attendance');
    },
  });

  const deleteAttendanceMutation = useMutation({
    mutationFn: async (id) => {
      const { staffAttendanceService } = await import('@/services');
      return staffAttendanceService.remove(id);
    },
    onSuccess: () => {
      toast.success('Attendance deleted successfully');
      setDeletingRecord(null);
      qc.invalidateQueries({ queryKey: ['staff-attendance'] });
    },
    onError: (error) => {
      toast.error(error?.response?.data?.message || error?.message || 'Failed to delete attendance');
    },
  });

  const rows = data?.data?.rows ?? [];
  const total = data?.data?.total ?? 0;
  const totalPages = data?.data?.totalPages ?? 1;

  const openMarkModal = () => {
    setEditingAttendanceId(null);
    setManualForm((prev) => ({ ...prev, date: dateFilter || prev.date }));
    setIsMarkModalOpen(true);
  };

  const openEditModal = (row) => {
    setEditingAttendanceId(row.id);
    setManualForm({
      staff_id: row.staff_id || row.teacher_id || '',
      date: row.date || dateFilter,
      status: row.status || 'present',
      check_in: toInputTime(row.check_in),
      check_out: toInputTime(row.check_out),
      remarks: row.remarks || '',
    });
    setIsMarkModalOpen(true);
  };

  const handleManualSubmit = (e) => {
    e.preventDefault();
    if (!manualForm.staff_id) {
      toast.error('Please select a staff member');
      return;
    }
    if (!manualForm.date) {
      toast.error('Please select date');
      return;
    }
    const payload = {
      status: manualForm.status,
      check_in: toISODateTime(manualForm.date, manualForm.check_in),
      check_out: toISODateTime(manualForm.date, manualForm.check_out),
      remarks: manualForm.remarks,
    };

    if (editingAttendanceId) {
      updateAttendanceMutation.mutate({ id: editingAttendanceId, payload });
      return;
    }

    markManualMutation.mutate({
      staff_id: manualForm.staff_id,
      date: manualForm.date,
      ...payload,
    });
  };

  const handleBulkImport = async (importedRows) => {
    if (!Array.isArray(importedRows) || !importedRows.length) {
      toast.error('No data to import');
      return;
    }

    try {
      const { staffAttendanceService } = await import('@/services');
      const result = await staffAttendanceService.importFromRows(importedRows, dateFilter);
      const success = result?.data?.success ?? result?.data?.marked ?? 0;
      const failed = result?.data?.failed ?? 0;
      toast.success(`Bulk import complete: ${success} success, ${failed} failed`);
      qc.invalidateQueries({ queryKey: ['staff-attendance'] });
    } catch (error) {
      toast.error(error?.response?.data?.message || error?.message || 'Bulk import failed');
      throw error;
    }
  };

  const stats = useMemo(() => ({
    present: rows.filter(r => r.status === 'present').length,
    absent: rows.filter(r => r.status === 'absent').length,
    late: rows.filter(r => r.status === 'late').length,
    rate: rows.length ? Math.round((rows.filter(r => r.status === 'present').length / rows.length) * 100) : 0,
  }), [rows]);

  const columns = useMemo(() => [
    { accessorKey: 'name', header: 'Staff Member', cell: ({ getValue }) => <span className="font-medium">{getValue()}</span> },
    { accessorKey: 'role', header: 'Role' },
    { accessorKey: 'check_in', header: 'Check In', cell: ({ getValue }) => formatTimeDisplay(getValue()) },
    { accessorKey: 'check_out', header: 'Check Out', cell: ({ getValue }) => formatTimeDisplay(getValue()) },
    { accessorKey: 'date', header: 'Date', cell: ({ getValue }) => new Date(getValue()).toLocaleDateString('en-PK') },
    {
      accessorKey: 'status', header: 'Status',
      cell: ({ getValue }) => {
        const s = getValue();
        return <span className={cn('rounded-full px-2 py-0.5 text-xs font-medium capitalize', STATUS_COLORS[s])}>{s}</span>;
      },
    },
    {
      id: 'actions',
      header: 'Actions',
      cell: ({ row }) => (
        <TableRowActions
          onEdit={(isMounted && canDo('staff_attendance.mark')) ? () => openEditModal(row.original) : undefined}
          onDelete={(isMounted && canDo('staff_attendance.mark')) ? () => setDeletingRecord(row.original) : undefined}
        />
      ),
    },
  ], [canDo, isMounted]);

  return (
    <div className="space-y-5">
      <PageHeader title="Staff Attendance" description="Daily staff attendance tracking" />

      <div className="flex flex-wrap items-center gap-3 rounded-lg border bg-card px-4 py-3">
        <label className="text-sm font-medium">Date:</label>
        <DatePickerField
          value={dateFilter}
          onChange={(v) => setDateFilter(v || '')}
          disableFutureDates
          className="w-48"
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-4">
        <StatsCard label="Attendance Rate" value={`${stats.rate}%`} icon={<CheckSquare size={18} />} />
        <StatsCard label="Present" value={stats.present} icon={<CheckSquare size={18} />} />
        <StatsCard label="Absent" value={stats.absent} icon={<X size={18} />} />
        <StatsCard label="Late" value={stats.late} icon={<Minus size={18} />} />
      </div>

      <DataTable
        columns={columns}
        data={rows}
        loading={isLoading}
        emptyMessage="No records found"
        search={search} onSearch={(v) => { setSearch(v); setPage(1); }} searchPlaceholder="Search staff…"
        filters={[
          { name: 'status', label: 'Status', value: statusFilter, onChange: (v) => { setStatusFilter(v); setPage(1); }, options: STATUS_OPTS },
          { name: 'staff_type', label: 'Staff Type', value: staffTypeFilter, onChange: (v) => { setStaffTypeFilter(v); setPage(1); }, options: STAFF_TYPE_OPTS },
        ]}
        action={
          (isMounted && (canDo('staff_attendance.create') || canDo('staff_attendance.mark'))) ? (
            <button
              type="button"
              onClick={openMarkModal}
              className="flex items-center gap-1.5 rounded-md bg-primary px-3 py-2 text-sm font-semibold text-primary-foreground hover:opacity-90"
            >
              <CheckSquare size={14} /> Mark Attendance
            </button>
          ) : null
        }
        enableColumnVisibility
        importConfig={{
          columns: [
            { key: 'staff_id', label: 'Staff ID', required: true, validation: 'text' },
            { key: 'date', label: 'Date', required: false, validation: 'date' },
            { key: 'status', label: 'Status', required: false, validation: 'select', options: ['present', 'absent', 'late', 'leave'] },
            { key: 'check_in', label: 'Check In', required: false, validation: 'text' },
            { key: 'check_out', label: 'Check Out', required: false, validation: 'text' },
            { key: 'remarks', label: 'Remarks', required: false, validation: 'text' },
            { key: 'branch_id', label: 'Branch ID', required: false, validation: 'text' },
          ],
          onImport: handleBulkImport,
          fileName: 'staff-attendance-import',
        }}
        exportConfig={{ fileName: 'staff-attendance' }}
        pagination={{ page, totalPages, onPageChange: setPage, total, pageSize, onPageSizeChange: (s) => { setPageSize(s); setPage(1); } }}
      />

      <AppModal
        open={isMarkModalOpen}
        onClose={() => {
          setIsMarkModalOpen(false);
          setEditingAttendanceId(null);
        }}
        title={editingAttendanceId ? 'Update Staff Attendance' : 'Mark Staff Attendance'}
        description={editingAttendanceId ? 'Update status and timing for this attendance record' : 'Admin can manually mark attendance for any staff or teacher'}
        size="md"
        footer={(
          <>
            <button
              type="button"
              onClick={() => setIsMarkModalOpen(false)}
              className="rounded-md border px-4 py-2 text-sm font-medium"
            >
              Cancel
            </button>
            <button
              type="submit"
              form="manual-staff-attendance-form"
              disabled={markManualMutation.isPending || updateAttendanceMutation.isPending}
              className="rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground disabled:opacity-60"
            >
              {(markManualMutation.isPending || updateAttendanceMutation.isPending)
                ? 'Saving...'
                : (editingAttendanceId ? 'Update Attendance' : 'Save Attendance')}
            </button>
          </>
        )}
      >
        <form id="manual-staff-attendance-form" onSubmit={handleManualSubmit} className="space-y-4">
          <SelectField
            label="Staff / Teacher"
            name="staff_id"
            value={manualForm.staff_id}
            onChange={(value) => setManualForm((p) => ({ ...p, staff_id: value }))}
            options={memberOptions}
            placeholder="Select staff or teacher"
            disabled={!!editingAttendanceId}
            required
          />

          <div className="grid gap-4 sm:grid-cols-2">
            <DatePickerField
              label="Date"
              name="date"
              value={manualForm.date}
              onChange={(value) => setManualForm((p) => ({ ...p, date: value }))}
              disabled={!!editingAttendanceId}
              disableFutureDates
              required
            />

            <SelectField
              label="Status"
              name="status"
              value={manualForm.status}
              onChange={(value) => setManualForm((p) => ({ ...p, status: value }))}
              options={MANUAL_STATUS_OPTS}
              required
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <label className="text-sm font-medium">Check In</label>
              <TimePickerField
                value={manualForm.check_in}
                onChange={(value) => setManualForm((p) => ({ ...p, check_in: value }))}
                mode="simple"
                interval={5}
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-medium">Check Out</label>
              <TimePickerField
                value={manualForm.check_out}
                onChange={(value) => setManualForm((p) => ({ ...p, check_out: value }))}
                mode="simple"
                interval={5}
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-medium">Remarks</label>
            <textarea
              value={manualForm.remarks}
              onChange={(e) => setManualForm((p) => ({ ...p, remarks: e.target.value }))}
              className="min-h-[90px] w-full rounded-md border bg-background px-3 py-2 text-sm"
              placeholder="Optional remarks"
            />
          </div>
        </form>
      </AppModal>

      <ConfirmDialog
        open={!!deletingRecord}
        onClose={() => setDeletingRecord(null)}
        onConfirm={() => {
          if (!deletingRecord?.id) return;
          deleteAttendanceMutation.mutate(deletingRecord.id);
        }}
        loading={deleteAttendanceMutation.isPending}
        title="Delete Attendance"
        description={`Are you sure you want to delete attendance record for ${deletingRecord?.name || 'this user'}? This action cannot be undone.`}
        confirmLabel="Delete"
        variant="destructive"
      />
    </div>
  );
}
