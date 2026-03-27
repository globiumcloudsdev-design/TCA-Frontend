'use client';

import { useState, useMemo, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Star } from 'lucide-react';
import { toast } from 'sonner';

import { academicYearService } from '@/services';
import useAuthStore from '@/store/authStore';
import { PERMISSIONS } from '@/constants';
import { formatDate } from '@/lib/utils';
import {
  PageHeader, DataTable, StatusBadge,
  TableRowActions, ConfirmDialog, AppModal,
} from '@/components/common';
import { AcademicYearForm } from '@/components/forms';
import { Button } from '@/components/ui/button';
import { Badge }  from '@/components/ui/badge';

const extractRows = (d) => d?.data?.rows ?? d?.data ?? [];

const buildColumns = (onEdit, onDelete, onSetCurrent) => [
  { accessorKey: 'name',     header: 'Name',       cell: ({ getValue }) => <span className="font-medium">{getValue()}</span> },
  { accessorKey: 'start_date', header: 'Start Date', cell: ({ getValue }) => <span className="text-sm text-muted-foreground">{formatDate(getValue())}</span> },
  { accessorKey: 'end_date',   header: 'End Date',   cell: ({ getValue }) => <span className="text-sm text-muted-foreground">{formatDate(getValue())}</span> },
  {
    accessorKey: 'is_current', header: 'Current',
    cell: ({ getValue }) => getValue() ? <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200"><Star size={10} className="mr-1" /> Current</Badge> : null,
  },
  { accessorKey: 'is_active', header: 'Status', cell: ({ getValue }) => <StatusBadge status={getValue() !== false ? 'active' : 'inactive'} /> },
  {
    id: 'actions', header: '', enableHiding: false,
    cell: ({ row }) => {
      const y = row.original;
      const extraActions = !y.is_current && onSetCurrent ? [{ label: 'Set as Current', onClick: () => onSetCurrent(y) }] : [];
      return <TableRowActions onEdit={onEdit ? () => onEdit(y) : undefined} onDelete={onDelete ? () => onDelete(y) : undefined} extraActions={extraActions} />;
    },
  },
];

export default function AcademicYearsPage() {
  const qc = useQueryClient();

  const canCreate = useAuthStore((s) => s.canDo(PERMISSIONS.ACADEMIC_YEAR_CREATE));
  const canDelete = useAuthStore((s) => s.canDo(PERMISSIONS.ACADEMIC_YEAR_DELETE));

  const [mounted, setMounted] = useState(false);
  useEffect(() => { setMounted(true); }, []);

  const [createOpen,    setCreateOpen]    = useState(false);
  const [editTarget,    setEditTarget]    = useState(null);
  const [deleteTarget,  setDeleteTarget]  = useState(null);
  const [currentTarget, setCurrentTarget] = useState(null);

  const { data, isLoading } = useQuery({
    queryKey: ['academic-years'],
    queryFn:  academicYearService.getAll,
  });

  const years = extractRows(data);

  const createMutation = useMutation({
    mutationFn: academicYearService.create,
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['academic-years'] }); toast.success('Academic year created'); setCreateOpen(false); },
    onError: (e) => toast.error(e?.response?.data?.message ?? 'Failed'),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, body }) => academicYearService.update(id, body),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['academic-years'] }); toast.success('Academic year updated'); setEditTarget(null); },
    onError: (e) => toast.error(e?.response?.data?.message ?? 'Failed'),
  });

  const setCurrentMutation = useMutation({
    mutationFn: ({ id }) => academicYearService.setCurrent(id),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['academic-years'] }); toast.success('Set as current year'); setCurrentTarget(null); },
    onError: (e) => toast.error(e?.response?.data?.message ?? 'Failed'),
  });

  const deleteMutation = useMutation({
    mutationFn: ({ id }) => academicYearService.delete(id),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['academic-years'] }); toast.success('Academic year deleted'); setDeleteTarget(null); },
    onError: (e) => toast.error(e?.response?.data?.message ?? 'Failed'),
  });

  const columns = useMemo(
    () => buildColumns(setEditTarget, canDelete ? setDeleteTarget : null, setCurrentTarget),
    [canDelete],
  );

  return (
    <div className="space-y-6">
      <PageHeader
        title="Academic Years"
        description="Manage school academic years"
        action={mounted && canCreate && (
          <Button onClick={() => setCreateOpen(true)}><Plus size={16} className="mr-2" /> Add Year</Button>
        )}
      />

      <DataTable columns={columns} data={years} loading={isLoading} emptyMessage="No academic years found" enableColumnVisibility />

      <AppModal open={createOpen} onClose={() => setCreateOpen(false)} title="Add Academic Year" size="md">
        <AcademicYearForm onSubmit={(body) => createMutation.mutate(body)} onCancel={() => setCreateOpen(false)} loading={createMutation.isPending} />
      </AppModal>

      <AppModal open={!!editTarget} onClose={() => setEditTarget(null)} title="Edit Academic Year" size="md">
        <AcademicYearForm defaultValues={editTarget ?? {}} onSubmit={(body) => updateMutation.mutate({ id: editTarget.id, body })} onCancel={() => setEditTarget(null)} loading={updateMutation.isPending} isEdit />
      </AppModal>

      <ConfirmDialog open={!!currentTarget} onClose={() => setCurrentTarget(null)} onConfirm={() => setCurrentMutation.mutate(currentTarget)} loading={setCurrentMutation.isPending} title="Set Current Year" description={`Set "${currentTarget?.name}" as the active academic year?`} confirmLabel="Set Current" />

      <ConfirmDialog open={!!deleteTarget} onClose={() => setDeleteTarget(null)} onConfirm={() => deleteMutation.mutate(deleteTarget)} loading={deleteMutation.isPending} title="Delete Academic Year" description={`Delete "${deleteTarget?.name}"?`} confirmLabel="Delete" variant="destructive" />
    </div>
  );
}
