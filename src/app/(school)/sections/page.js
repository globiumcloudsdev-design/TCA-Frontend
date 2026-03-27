'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus } from 'lucide-react';
import { toast } from 'sonner';

import { sectionService, classService } from '@/services';
import useAuthStore from '@/store/authStore';
import { useUIStore } from '@/store/uiStore';
import { PERMISSIONS } from '@/constants';
import {
  PageHeader, DataTable,
  StatusBadge, TableRowActions,
  ConfirmDialog, AppModal,
} from '@/components/common';
import SelectField from '@/components/common/SelectField';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

const extractRows  = (d) => d?.data?.rows ?? d?.data ?? [];
const extractPages = (d) => d?.data?.totalPages ?? 1;

const buildColumns = (onEdit, onDelete, canDelete) => [
  {
    id: 'name',
    header: 'Section',
    cell: ({ row }) => {
      const s = row.original;
      return (
        <div>
          <p className="font-semibold text-sm">{s.name}</p>
          {s.room_number && <p className="text-xs text-muted-foreground">Room {s.room_number}</p>}
        </div>
      );
    },
  },
  {
    id: 'class',
    header: 'Class',
    cell: ({ row }) => <span className="text-sm">{row.original.class?.name ?? '—'}</span>,
  },
  {
    id: 'teacher',
    header: 'Class Teacher',
    cell: ({ row }) => {
      const t = row.original.teacher;
      if (!t) return <span className="text-sm text-muted-foreground">—</span>;
      return <span className="text-sm">{t.first_name} {t.last_name}</span>;
    },
  },
  {
    id: 'students',
    header: 'Students',
    cell: ({ row }) => (
      <span className="text-sm font-medium">
        {row.original.student_count ?? 0}
        {row.original.capacity ? <span className="text-muted-foreground text-xs"> / {row.original.capacity}</span> : ''}
      </span>
    ),
  },
  {
    id: 'status',
    header: 'Status',
    cell: ({ row }) => <StatusBadge status={row.original.is_active !== false ? 'active' : 'inactive'} />,
  },
  {
    id: 'actions',
    header: '',
    enableHiding: false,
    cell: ({ row }) => (
      <TableRowActions
        onEdit={() => onEdit(row.original)}
        onDelete={canDelete ? () => onDelete(row.original) : undefined}
      />
    ),
  },
];

export default function SectionsPage() {
  const qc = useQueryClient();

  const canCreate = useAuthStore((s) => s.canDo(PERMISSIONS.SECTION_CREATE));
  const canDelete = useAuthStore((s) => s.canDo(PERMISSIONS.SECTION_DELETE));
  const { activeBranchId } = useUIStore();

  const [mounted, setMounted] = useState(false);
  useEffect(() => { setMounted(true); }, []);

  const [page,        setPage]        = useState(1);
  const [pageSize,    setPageSize]    = useState(15);
  const [search,      setSearch]      = useState('');
  const [classFilter, setClassFilter] = useState('');

  const [createOpen,   setCreateOpen]   = useState(false);
  const [editTarget,   setEditTarget]   = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);

  const { data, isLoading } = useQuery({
    queryKey: ['sections', { page, pageSize, search, classFilter, activeBranchId }],
    queryFn:  () => sectionService.getAll({
      page,
      limit: pageSize,
      search: search || undefined,
      class_id: classFilter || undefined,
      branch_id: activeBranchId || undefined,
    }),
  });

  const { data: classesData } = useQuery({
    queryKey: ['classes-all'],
    queryFn:  () => classService.getAll({ limit: 100 }),
  });

  const sections   = extractRows(data);
  const totalPages = extractPages(data);
  const total      = data?.data?.total ?? sections.length;
  const classes    = extractRows(classesData);

  const createMutation = useMutation({
    mutationFn: sectionService.create,
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['sections'] }); toast.success('Section created'); setCreateOpen(false); },
    onError:   (e) => toast.error(e?.response?.data?.message ?? 'Failed'),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, body }) => sectionService.update(id, body),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['sections'] }); toast.success('Section updated'); setEditTarget(null); },
    onError:   (e) => toast.error(e?.response?.data?.message ?? 'Failed'),
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => sectionService.delete(id),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['sections'] }); toast.success('Section deleted'); setDeleteTarget(null); },
    onError:   (e) => toast.error(e?.response?.data?.message ?? 'Failed'),
  });

  const columns = buildColumns(
    (s) => setEditTarget(s),
    (s) => setDeleteTarget(s),
    canDelete,
  );

  const filters = [{
    name: 'class',
    label: 'Class',
    value: classFilter,
    onChange: (v) => { setClassFilter(v); setPage(1); },
    options: classes.map((c) => ({ value: String(c.id), label: c.name })),
  }];

  if (!mounted) return null;

  return (
    <div className="space-y-4">
      <PageHeader
        title="Sections"
        description="Manage class sections and room assignments"
        action={
          canCreate && (
            <Button onClick={() => setCreateOpen(true)} size="sm">
              <Plus className="w-4 h-4 mr-1.5" /> Add Section
            </Button>
          )
        }
      />

      <DataTable
        columns={columns}
        data={sections}
        loading={isLoading}
        search={search}
        onSearch={(v) => { setSearch(v); setPage(1); }}
        filters={filters}
        enableColumnVisibility
        exportConfig={{ fileName: 'sections' }}
        pagination={{ page, totalPages, onPageChange: setPage, total, pageSize, onPageSizeChange: (s) => { setPageSize(s); setPage(1); } }}
      />

      {/* Create modal */}
      <AppModal open={createOpen} onClose={() => setCreateOpen(false)} title="Add Section">
        <SectionForm
          classOptions={classes.map((c) => ({ value: c.id, label: c.name }))}
          onSubmit={(body) => createMutation.mutate(body)}
          onCancel={() => setCreateOpen(false)}
          isLoading={createMutation.isPending}
        />
      </AppModal>

      {/* Edit modal */}
      <AppModal open={!!editTarget} onClose={() => setEditTarget(null)} title="Edit Section">
        <SectionForm
          defaultValues={editTarget}
          classOptions={classes.map((c) => ({ value: c.id, label: c.name }))}
          onSubmit={(body) => updateMutation.mutate({ id: editTarget.id, body })}
          onCancel={() => setEditTarget(null)}
          isLoading={updateMutation.isPending}
        />
      </AppModal>

      {/* Delete confirm */}
      <ConfirmDialog
        open={!!deleteTarget}
        title="Delete Section"
        description={`Delete section "${deleteTarget?.name}"? This cannot be undone.`}
        confirmLabel="Delete"
        variant="destructive"
        isLoading={deleteMutation.isPending}
        onConfirm={() => deleteMutation.mutate(deleteTarget.id)}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
}

/* Section Form (react-hook-form) */
function SectionForm({ defaultValues, classOptions, onSubmit, onCancel, isLoading }) {
  const { control, register, handleSubmit, formState: { errors } } = useForm({
    defaultValues: {
      name:        defaultValues?.name        ?? '',
      class_id:    defaultValues?.class_id    ? String(defaultValues.class_id) : '',
      room_number: defaultValues?.room_number ?? '',
      capacity:    defaultValues?.capacity    ?? '',
    },
  });

  const onFormSubmit = (data) => {
    onSubmit({ ...data, capacity: data.capacity ? Number(data.capacity) : undefined });
  };

  return (
    <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-4 py-1">
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <Label>Section Name <span className="text-destructive">*</span></Label>
          <Input {...register('name', { required: 'Required' })} placeholder="e.g. A, B, Blue" />
          {errors.name && <p className="text-xs text-destructive">{errors.name.message}</p>}
        </div>
        <SelectField
          label="Class"
          name="class_id"
          control={control}
          error={errors.class_id}
          options={classOptions}
          placeholder="Select class…"
          required
        />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <Label>Room Number</Label>
          <Input {...register('room_number')} placeholder="e.g. 101" />
        </div>
        <div className="space-y-1.5">
          <Label>Capacity</Label>
          <Input type="number" min="1" {...register('capacity')} placeholder="Max students" />
        </div>
      </div>
      <div className="flex justify-end gap-2 pt-2">
        <Button type="button" variant="outline" size="sm" onClick={onCancel} disabled={isLoading}>Cancel</Button>
        <Button type="submit" size="sm" disabled={isLoading}>{isLoading ? 'Saving…' : 'Save'}</Button>
      </div>
    </form>
  );
}
