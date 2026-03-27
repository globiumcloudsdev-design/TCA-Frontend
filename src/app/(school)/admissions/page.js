'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, CheckCircle, XCircle, FileText } from 'lucide-react';
import { toast } from 'sonner';

import { admissionService, classService } from '@/services';
import useAuthStore from '@/store/authStore';
import { useUIStore } from '@/store/uiStore';
import { PERMISSIONS, ADMISSION_STATUS, GENDER_OPTIONS } from '@/constants';
import { formatDate } from '@/lib/utils';
import {
  PageHeader, DataTable,
  AvatarWithInitials, StatusBadge, TableRowActions,
  ConfirmDialog, AppModal,
} from '@/components/common';
import SelectField from '@/components/common/SelectField';
import DatePickerField from '@/components/common/DatePickerField';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

const extractRows  = (d) => d?.data?.rows ?? d?.data ?? [];
const extractPages = (d) => d?.data?.totalPages ?? 1;

const STATUS_COLORS = {
  pending:  'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/40 dark:text-yellow-300',
  approved: 'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300',
  rejected: 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300',
};

const buildColumns = (onApprove, onReject, onDelete, canApprove, canDelete) => [
  {
    id: 'applicant',
    header: 'Applicant',
    cell: ({ row }) => {
      const a = row.original;
      return (
        <div className="flex items-center gap-3">
          <AvatarWithInitials firstName={a.first_name} lastName={a.last_name} size="sm" />
          <div>
            <p className="font-medium text-sm leading-tight">{a.first_name} {a.last_name}</p>
            <p className="text-xs text-muted-foreground font-mono">{a.admission_no}</p>
          </div>
        </div>
      );
    },
  },
  {
    id: 'class',
    header: 'Applied Class',
    cell: ({ row }) => <span className="text-sm">{row.original.applied_class?.name ?? row.original.class_applying_for ?? '—'}</span>,
  },
  {
    id: 'dob',
    header: 'Date of Birth',
    cell: ({ row }) => <span className="text-sm text-muted-foreground">{formatDate(row.original.dob)}</span>,
  },
  {
    id: 'guardian',
    header: 'Guardian',
    cell: ({ row }) => {
      const a = row.original;
      return (
        <div>
          <p className="text-sm">{a.guardian_name ?? '—'}</p>
          <p className="text-xs text-muted-foreground">{a.guardian_phone ?? ''}</p>
        </div>
      );
    },
  },
  {
    id: 'documents',
    header: 'Docs',
    cell: ({ row }) => {
      const docs = row.original.documents ?? [];
      return (
        <div className="flex items-center gap-1">
          <FileText className="w-3.5 h-3.5 text-muted-foreground" />
          <span className="text-xs text-muted-foreground">{docs.length}</span>
        </div>
      );
    },
  },
  {
    id: 'applied_date',
    header: 'Applied On',
    cell: ({ row }) => <span className="text-sm text-muted-foreground">{formatDate(row.original.applied_date ?? row.original.created_at)}</span>,
  },
  {
    id: 'status',
    header: 'Status',
    cell: ({ row }) => {
      const s = row.original.status ?? 'pending';
      return <span className={`rounded-full px-2 py-0.5 text-xs font-medium capitalize ${STATUS_COLORS[s] ?? ''}`}>{s}</span>;
    },
  },
  {
    id: 'actions',
    header: '',
    enableHiding: false,
    cell: ({ row }) => {
      const a = row.original;
      const extraActions = [];
      if (canApprove && a.status === 'pending') {
        extraActions.push({ label: 'Approve', onClick: () => onApprove(a), icon: CheckCircle });
        extraActions.push({ label: 'Reject',  onClick: () => onReject(a),  icon: XCircle });
      }
      return (
        <TableRowActions
          onDelete={canDelete ? () => onDelete(a) : undefined}
          extraActions={extraActions}
        />
      );
    },
  },
];

export default function AdmissionsPage() {
  const qc = useQueryClient();

  const canCreate  = useAuthStore((s) => s.canDo(PERMISSIONS.ADMISSION_CREATE));
  const canApprove = useAuthStore((s) => s.canDo(PERMISSIONS.ADMISSION_APPROVE));
  const canDelete  = useAuthStore((s) => s.canDo(PERMISSIONS.ADMISSION_DELETE));
  const { activeBranchId } = useUIStore();

  const [mounted, setMounted] = useState(false);
  useEffect(() => { setMounted(true); }, []);

  const [page,         setPage]         = useState(1);
  const [pageSize,      setPageSize]      = useState(10);
  const [search,       setSearch]       = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [classFilter,  setClassFilter]  = useState('');

  const [createOpen,    setCreateOpen]    = useState(false);
  const [deleteTarget,  setDeleteTarget]  = useState(null);
  const [rejectTarget,  setRejectTarget]  = useState(null);

  const { data, isLoading } = useQuery({
    queryKey: ['admissions', { page, pageSize, search, statusFilter, classFilter, activeBranchId }],
    queryFn:  () => admissionService.getAll({
      page,
      limit: pageSize,
      search: search || undefined,
      status: statusFilter || undefined,
      class_id: classFilter || undefined,
      branch_id: activeBranchId || undefined,
    }),
  });

  const { data: classesData } = useQuery({
    queryKey: ['classes-all'],
    queryFn:  () => classService.getAll({ limit: 100 }),
  });

  const admissions = extractRows(data);
  const totalPages = extractPages(data);
  const total      = data?.data?.total ?? admissions.length;
  const classes    = extractRows(classesData);

  const approveMutation = useMutation({
    mutationFn: (id) => admissionService.approve(id),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['admissions'] }); toast.success('Admission approved'); },
    onError:   (e) => toast.error(e?.response?.data?.message ?? 'Failed to approve'),
  });

  const rejectMutation = useMutation({
    mutationFn: (id) => admissionService.reject(id),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['admissions'] }); toast.success('Admission rejected'); setRejectTarget(null); },
    onError:   (e) => toast.error(e?.response?.data?.message ?? 'Failed to reject'),
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => admissionService.delete(id),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['admissions'] }); toast.success('Admission deleted'); setDeleteTarget(null); },
    onError:   (e) => toast.error(e?.response?.data?.message ?? 'Failed to delete'),
  });

  const statusOptions = (ADMISSION_STATUS ?? []).map(({ value, label }) => ({ value, label }));
  const classOptions  = classes.map((c) => ({ value: c.id, label: c.name }));

  const columns = buildColumns(
    (a) => approveMutation.mutate(a.id),
    (a) => setRejectTarget(a),
    (a) => setDeleteTarget(a),
    canApprove,
    canDelete,
  );

  if (!mounted) return null;

  return (
    <div className="space-y-4">
      <PageHeader
        title="Admissions"
        description="Manage student admission applications"
        action={
          canCreate && (
            <Button onClick={() => setCreateOpen(true)} size="sm">
              <Plus className="w-4 h-4 mr-1.5" /> New Application
            </Button>
          )
        }
      />

      <DataTable
        columns={columns}
        data={admissions}
        loading={isLoading}
        search={search}
        onSearch={(v) => { setSearch(v); setPage(1); }}
        searchPlaceholder="Search applicants…"
        filters={[
          { name: 'status', label: 'Status',   value: statusFilter, onChange: (v) => { setStatusFilter(v); setPage(1); }, options: statusOptions },
          { name: 'class',  label: 'Class',    value: classFilter,  onChange: (v) => { setClassFilter(v);  setPage(1); }, options: classOptions  },
        ]}
        enableColumnVisibility
        exportConfig={{ fileName: 'admissions' }}
        pagination={{ page, totalPages, onPageChange: setPage, total, pageSize, onPageSizeChange: (s) => { setPageSize(s); setPage(1); } }}
      />

      {/* Create / Edit modal placeholder */}
      <AppModal open={createOpen} onClose={() => setCreateOpen(false)} title="New Admission Application">
        <AdmissionForm
          onSubmit={(body) => {
            admissionService.create(body).then(() => {
              qc.invalidateQueries({ queryKey: ['admissions'] });
              toast.success('Application submitted');
              setCreateOpen(false);
            }).catch((e) => toast.error(e?.response?.data?.message ?? 'Failed'));
          }}
          classOptions={classOptions}
          onCancel={() => setCreateOpen(false)}
        />
      </AppModal>

      {/* Reject confirm */}
      <ConfirmDialog
        open={!!rejectTarget}
        title="Reject Application"
        description={`Reject admission application for ${rejectTarget?.first_name} ${rejectTarget?.last_name}?`}
        confirmLabel="Reject"
        variant="destructive"
        isLoading={rejectMutation.isPending}
        onConfirm={() => rejectMutation.mutate(rejectTarget.id)}
        onCancel={() => setRejectTarget(null)}
      />

      {/* Delete confirm */}
      <ConfirmDialog
        open={!!deleteTarget}
        title="Delete Application"
        description={`Permanently delete this application? This cannot be undone.`}
        confirmLabel="Delete"
        variant="destructive"
        isLoading={deleteMutation.isPending}
        onConfirm={() => deleteMutation.mutate(deleteTarget.id)}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
}

/* ─── Admission Form (react-hook-form) ──────────────────────────── */
function AdmissionForm({ onSubmit, classOptions, onCancel }) {
  const { control, register, handleSubmit, formState: { errors } } = useForm({
    defaultValues: {
      first_name: '', last_name: '', dob: '',
      gender: '', guardian_name: '', guardian_phone: '',
      class_applying_for: '',
    },
  });

  const GENDER_OPTS = GENDER_OPTIONS ?? [
    { value: 'male', label: 'Male' },
    { value: 'female', label: 'Female' },
  ];

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 py-1">
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <Label>First Name <span className="text-destructive">*</span></Label>
          <Input {...register('first_name', { required: 'Required' })} placeholder="First name" />
          {errors.first_name && <p className="text-xs text-destructive">{errors.first_name.message}</p>}
        </div>
        <div className="space-y-1.5">
          <Label>Last Name <span className="text-destructive">*</span></Label>
          <Input {...register('last_name', { required: 'Required' })} placeholder="Last name" />
          {errors.last_name && <p className="text-xs text-destructive">{errors.last_name.message}</p>}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <DatePickerField
          label="Date of Birth"
          name="dob"
          control={control}
          error={errors.dob}
          required
          fromYear={2000}
          toYear={new Date().getFullYear()}
        />
        <SelectField
          label="Gender"
          name="gender"
          control={control}
          error={errors.gender}
          options={GENDER_OPTS}
          placeholder="Select gender…"
          required
        />
      </div>

      <SelectField
        label="Applying For Class"
        name="class_applying_for"
        control={control}
        error={errors.class_applying_for}
        options={classOptions}
        placeholder="Select class…"
        required
      />

      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <Label>Guardian Name <span className="text-destructive">*</span></Label>
          <Input {...register('guardian_name', { required: 'Required' })} placeholder="Guardian full name" />
          {errors.guardian_name && <p className="text-xs text-destructive">{errors.guardian_name.message}</p>}
        </div>
        <div className="space-y-1.5">
          <Label>Guardian Phone <span className="text-destructive">*</span></Label>
          <Input {...register('guardian_phone', { required: 'Required' })} placeholder="03XX-XXXXXXX" />
          {errors.guardian_phone && <p className="text-xs text-destructive">{errors.guardian_phone.message}</p>}
        </div>
      </div>

      <div className="flex justify-end gap-2 pt-2">
        <Button type="button" variant="outline" size="sm" onClick={onCancel}>Cancel</Button>
        <Button type="submit" size="sm">Submit Application</Button>
      </div>
    </form>
  );
}
