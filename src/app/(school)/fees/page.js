'use client';

import { useState, useMemo, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus } from 'lucide-react';
import { toast } from 'sonner';

import { feeService, studentService } from '@/services';
import useAuthStore from '@/store/authStore';
import { PERMISSIONS, FEE_STATUS, MONTHS } from '@/constants';
import { formatCurrency, formatDate } from '@/lib/utils';
import {
  PageHeader, DataTable,
  AvatarWithInitials, StatusBadge, TableRowActions,
  ConfirmDialog, AppModal,
} from '@/components/common';
import { FeeVoucherForm, FeeCollectForm } from '@/components/forms';
import { Button } from '@/components/ui/button';

const extractRows  = (d) => d?.data?.rows ?? d?.data ?? [];
const extractPages = (d) => d?.data?.totalPages ?? 1;
const toOptions    = (arr, labelFn) => (arr ?? []).map((x) => ({ value: x.id, label: labelFn(x) }));

// FEE_STATUS and MONTHS are already [{value, label, ...}] arrays
const FEE_STATUS_OPTIONS = (FEE_STATUS ?? []).map(({ value, label }) => ({ value, label }));

const MONTH_OPTIONS = (MONTHS ?? []).map(({ value, label }) => ({ value: String(value), label }));

const buildColumns = (onEdit, onDelete, onCollect) => [
  {
    id: 'student', header: 'Student',
    cell: ({ row }) => {
      const s = row.original.student;
      if (!s) return <span className="text-muted-foreground text-sm">\u2014</span>;
      return (
        <div className="flex items-center gap-3">
          <AvatarWithInitials firstName={s.first_name} lastName={s.last_name} size="sm" />
          <div>
            <p className="font-medium text-sm leading-tight">{s.first_name} {s.last_name}</p>
            <p className="text-xs text-muted-foreground">{s.roll_number}</p>
          </div>
        </div>
      );
    },
  },
  {
    id: 'period', header: 'Period',
    cell: ({ row }) => {
      const f = row.original;
      return <span className="text-sm text-muted-foreground">{f.month ? MONTH_OPTIONS[Number(f.month) - 1]?.label : ''} {f.year}</span>;
    },
  },
  { accessorKey: 'amount',   header: 'Amount',   cell: ({ getValue }) => <span className="text-sm font-medium">{formatCurrency(getValue())}</span> },
  { accessorKey: 'discount', header: 'Discount', cell: ({ getValue }) => <span className="text-sm text-muted-foreground">{formatCurrency(getValue() ?? 0)}</span> },
  {
    id: 'net', header: 'Net',
    cell: ({ row }) => {
      const net = (row.original.amount ?? 0) - (row.original.discount ?? 0);
      return <span className="text-sm font-semibold">{formatCurrency(net)}</span>;
    },
  },
  {
    accessorKey: 'due_date', header: 'Due Date',
    cell: ({ getValue }) => <span className="text-sm text-muted-foreground">{formatDate(getValue())}</span>,
  },
  { accessorKey: 'status', header: 'Status', cell: ({ getValue }) => <StatusBadge status={getValue()} /> },
  {
    id: 'actions', header: '', enableHiding: false,
    cell: ({ row }) => {
      const f = row.original;
      const extraActions = onCollect && f.status !== 'paid' ? [
        { label: 'Collect Payment', onClick: () => onCollect(f) },
      ] : [];
      return <TableRowActions onEdit={onEdit ? () => onEdit(f) : undefined} onDelete={onDelete ? () => onDelete(f) : undefined} extraActions={extraActions} />;
    },
  },
];

export default function FeesPage() {
  const qc = useQueryClient();

  const canCreate = useAuthStore((s) => s.canDo(PERMISSIONS.FEE_CREATE));
  const canDelete = useAuthStore((s) => s.canDo(PERMISSIONS.FEE_DELETE));

  const [mounted,      setMounted]      = useState(false);
  const [page,         setPage]         = useState(1);
  const [pageSize,     setPageSize]     = useState(10);
  const [statusFilter, setStatusFilter] = useState('');
  const [monthFilter,  setMonthFilter]  = useState('');

  useEffect(() => { setMounted(true); }, []);
  const [createOpen,   setCreateOpen]   = useState(false);
  const [collectTarget, setCollectTarget] = useState(null);
  const [editTarget,    setEditTarget]    = useState(null);
  const [deleteTarget,  setDeleteTarget]  = useState(null);

  const { data, isLoading } = useQuery({
    queryKey: ['fees', { page, pageSize, statusFilter, monthFilter }],
    queryFn:  () => feeService.getAll({ page, limit: pageSize, status: statusFilter || undefined, month: monthFilter || undefined }),
  });

  const { data: studentsData } = useQuery({ queryKey: ['students-all'], queryFn: () => studentService.getAll({ limit: 500 }) });

  const fees           = extractRows(data);
  const totalPages     = extractPages(data);
  const total          = data?.data?.total ?? fees.length;
  const studentOptions = toOptions(extractRows(studentsData), (s) => `${s.first_name} ${s.last_name}`);

  const createMutation = useMutation({
    mutationFn: feeService.create,
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['fees'] }); toast.success('Fee voucher created'); setCreateOpen(false); },
    onError: (e) => toast.error(e?.response?.data?.message ?? 'Failed'),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, body }) => feeService.update(id, body),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['fees'] }); toast.success('Fee updated'); setEditTarget(null); },
    onError: (e) => toast.error(e?.response?.data?.message ?? 'Failed'),
  });

  const collectMutation = useMutation({
    mutationFn: ({ id, body }) => feeService.collect(id, body),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['fees'] }); toast.success('Payment recorded'); setCollectTarget(null); },
    onError: (e) => toast.error(e?.response?.data?.message ?? 'Failed'),
  });

  const deleteMutation = useMutation({
    mutationFn: ({ id }) => feeService.delete(id),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['fees'] }); toast.success('Fee deleted'); setDeleteTarget(null); },
    onError: (e) => toast.error(e?.response?.data?.message ?? 'Failed'),
  });

  const columns = useMemo(
    () => buildColumns(
      setEditTarget,
      canDelete ? setDeleteTarget : null,
      setCollectTarget,
    ),
    [canDelete],
  );

  return (
    <div className="space-y-6">
      <PageHeader
        title="Fee Management"
        description="Create and track student fee vouchers"
        action={mounted && canCreate && (
          <Button onClick={() => setCreateOpen(true)}><Plus size={16} className="mr-2" /> New Voucher</Button>
        )}
      />

      <DataTable
        columns={columns}
        data={fees}
        loading={isLoading}
        emptyMessage="No fee records found"
        filters={[
          { name: 'status', label: 'Status', value: statusFilter, onChange: (v) => { setStatusFilter(v); setPage(1); }, options: FEE_STATUS_OPTIONS },
          { name: 'month',  label: 'Month',  value: monthFilter,  onChange: (v) => { setMonthFilter(v);  setPage(1); }, options: MONTH_OPTIONS  },
        ]}
        enableColumnVisibility
        pagination={{ page, totalPages, onPageChange: setPage, total, pageSize, onPageSizeChange: (s) => { setPageSize(s); setPage(1); } }}
        exportConfig={{ fileName: 'fees', dateField: 'due_date' }}
      />

      <AppModal open={createOpen} onClose={() => setCreateOpen(false)} title="New Fee Voucher" size="lg">
        <FeeVoucherForm onSubmit={(body) => createMutation.mutate(body)} onCancel={() => setCreateOpen(false)} loading={createMutation.isPending} studentOptions={studentOptions} />
      </AppModal>

      <AppModal open={!!editTarget} onClose={() => setEditTarget(null)} title="Edit Fee" size="lg">
        <FeeVoucherForm defaultValues={editTarget ?? {}} onSubmit={(body) => updateMutation.mutate({ id: editTarget.id, body })} onCancel={() => setEditTarget(null)} loading={updateMutation.isPending} studentOptions={studentOptions} isEdit />
      </AppModal>

      <AppModal open={!!collectTarget} onClose={() => setCollectTarget(null)} title="Collect Payment" size="md">
        <FeeCollectForm fee={collectTarget} onSubmit={(body) => collectMutation.mutate({ id: collectTarget.id, body })} onCancel={() => setCollectTarget(null)} loading={collectMutation.isPending} />
      </AppModal>

      <ConfirmDialog open={!!deleteTarget} onClose={() => setDeleteTarget(null)} onConfirm={() => deleteMutation.mutate(deleteTarget)} loading={deleteMutation.isPending} title="Delete Fee" description="Delete this fee voucher? This action is irreversible." confirmLabel="Delete" variant="destructive" />
    </div>
  );
}
