'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Users } from 'lucide-react';
import { toast } from 'sonner';

import { parentService } from '@/services';
import useAuthStore from '@/store/authStore';
import { PERMISSIONS, RELATIONSHIP_OPTIONS } from '@/constants';
import { formatDate } from '@/lib/utils';
import {
  PageHeader, DataTable,
  AvatarWithInitials, StatusBadge, TableRowActions,
  ConfirmDialog, AppModal,
} from '@/components/common';
import SelectField from '@/components/common/SelectField';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';

const extractRows  = (d) => d?.data?.rows ?? d?.data ?? [];
const extractPages = (d) => d?.data?.totalPages ?? 1;

const buildColumns = (onEdit, onDelete, canDelete) => [
  {
    id: 'parent',
    header: 'Parent / Guardian',
    cell: ({ row }) => {
      const p = row.original;
      return (
        <div className="flex items-center gap-3">
          <AvatarWithInitials firstName={p.first_name} lastName={p.last_name} size="sm" />
          <div>
            <p className="font-medium text-sm leading-tight">{p.first_name} {p.last_name}</p>
            <p className="text-xs text-muted-foreground">{p.phone}</p>
          </div>
        </div>
      );
    },
  },
  {
    id: 'relation',
    header: 'Relation',
    cell: ({ row }) => {
      const rel = row.original.relation ?? '';
      return <Badge variant="outline" className="capitalize text-xs">{rel || '—'}</Badge>;
    },
  },
  {
    id: 'cnic',
    header: 'CNIC',
    cell: ({ row }) => <span className="text-sm font-mono text-muted-foreground">{row.original.cnic ?? '—'}</span>,
  },
  {
    id: 'children',
    header: 'Children',
    cell: ({ row }) => {
      const children = row.original.children ?? [];
      return (
        <div className="flex items-center gap-1">
          <Users className="w-3.5 h-3.5 text-muted-foreground" />
          <span className="text-xs text-muted-foreground">{children.length} student{children.length !== 1 ? 's' : ''}</span>
        </div>
      );
    },
  },
  {
    id: 'occupation',
    header: 'Occupation',
    cell: ({ row }) => <span className="text-sm text-muted-foreground">{row.original.occupation ?? '—'}</span>,
  },
  {
    id: 'email',
    header: 'Email',
    cell: ({ row }) => <span className="text-sm text-muted-foreground">{row.original.email ?? '—'}</span>,
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
    cell: ({ row }) => {
      const p = row.original;
      return (
        <TableRowActions
          onEdit={() => onEdit(p)}
          onDelete={canDelete ? () => onDelete(p) : undefined}
        />
      );
    },
  },
];

export default function ParentsPage() {
  const qc = useQueryClient();

  const canCreate = useAuthStore((s) => s.canDo(PERMISSIONS.PARENT_CREATE));
  const canDelete = useAuthStore((s) => s.canDo(PERMISSIONS.PARENT_DELETE));

  const [mounted, setMounted] = useState(false);
  useEffect(() => { setMounted(true); }, []);

  const [page,     setPage]     = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [search,   setSearch]   = useState('');

  const [createOpen,    setCreateOpen]    = useState(false);
  const [editTarget,    setEditTarget]    = useState(null);
  const [deleteTarget,  setDeleteTarget]  = useState(null);

  const { data, isLoading } = useQuery({
    queryKey: ['parents', { page, pageSize, search }],
    queryFn:  () => parentService.getAll({ page, limit: pageSize, search: search || undefined }),
  });

  const parents    = extractRows(data);
  const totalPages = extractPages(data);
  const total      = data?.data?.total ?? parents.length;

  const createMutation = useMutation({
    mutationFn: parentService.create,
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['parents'] }); toast.success('Parent added'); setCreateOpen(false); },
    onError:   (e) => toast.error(e?.response?.data?.message ?? 'Failed'),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, body }) => parentService.update(id, body),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['parents'] }); toast.success('Parent updated'); setEditTarget(null); },
    onError:   (e) => toast.error(e?.response?.data?.message ?? 'Failed'),
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => parentService.delete(id),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['parents'] }); toast.success('Parent removed'); setDeleteTarget(null); },
    onError:   (e) => toast.error(e?.response?.data?.message ?? 'Failed'),
  });

  const columns = buildColumns(
    (p) => setEditTarget(p),
    (p) => setDeleteTarget(p),
    canDelete,
  );

  if (!mounted) return null;

  return (
    <div className="space-y-4">
      <PageHeader
        title="Parents & Guardians"
        description="Manage parent and guardian records"
        action={
          canCreate && (
            <Button onClick={() => setCreateOpen(true)} size="sm">
              <Plus className="w-4 h-4 mr-1.5" /> Add Parent
            </Button>
          )
        }
      />

      <DataTable
        columns={columns}
        data={parents}
        loading={isLoading}
        search={search}
        onSearch={(v) => { setSearch(v); setPage(1); }}
        searchPlaceholder="Search by name or phone…"
        enableColumnVisibility
        exportConfig={{ fileName: 'parents-guardians' }}
        pagination={{ page, totalPages, onPageChange: setPage, total, pageSize, onPageSizeChange: (s) => { setPageSize(s); setPage(1); } }}
      />

      {/* Create modal */}
      <AppModal open={createOpen} onClose={() => setCreateOpen(false)} title="Add Parent / Guardian">
        <ParentForm
          onSubmit={(body) => createMutation.mutate(body)}
          onCancel={() => setCreateOpen(false)}
          isLoading={createMutation.isPending}
        />
      </AppModal>

      {/* Edit modal */}
      <AppModal open={!!editTarget} onClose={() => setEditTarget(null)} title="Edit Parent / Guardian">
        <ParentForm
          defaultValues={editTarget}
          onSubmit={(body) => updateMutation.mutate({ id: editTarget.id, body })}
          onCancel={() => setEditTarget(null)}
          isLoading={updateMutation.isPending}
        />
      </AppModal>

      {/* Delete confirm */}
      <ConfirmDialog
        open={!!deleteTarget}
        title="Remove Parent"
        description={`Remove ${deleteTarget?.first_name} ${deleteTarget?.last_name} from the system?`}
        confirmLabel="Remove"
        variant="destructive"
        isLoading={deleteMutation.isPending}
        onConfirm={() => deleteMutation.mutate(deleteTarget.id)}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
}

/* Parent Form (react-hook-form) */
function ParentForm({ defaultValues, onSubmit, onCancel, isLoading }) {
  const { control, register, handleSubmit, formState: { errors } } = useForm({
    defaultValues: {
      first_name:  defaultValues?.first_name  ?? '',
      last_name:   defaultValues?.last_name   ?? '',
      phone:       defaultValues?.phone       ?? '',
      email:       defaultValues?.email       ?? '',
      cnic:        defaultValues?.cnic        ?? '',
      relation:    defaultValues?.relation    ?? '',
      occupation:  defaultValues?.occupation  ?? '',
      address:     defaultValues?.address     ?? '',
    },
  });

  const relationOptions = (RELATIONSHIP_OPTIONS ?? []).map((r) => ({ value: r.value, label: r.label }));

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 py-1">
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <Label>First Name <span className="text-destructive">*</span></Label>
          <Input {...register('first_name', { required: 'Required' })} />
          {errors.first_name && <p className="text-xs text-destructive">{errors.first_name.message}</p>}
        </div>
        <div className="space-y-1.5">
          <Label>Last Name <span className="text-destructive">*</span></Label>
          <Input {...register('last_name', { required: 'Required' })} />
          {errors.last_name && <p className="text-xs text-destructive">{errors.last_name.message}</p>}
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <Label>Phone <span className="text-destructive">*</span></Label>
          <Input {...register('phone', { required: 'Required' })} placeholder="03XX-XXXXXXX" />
          {errors.phone && <p className="text-xs text-destructive">{errors.phone.message}</p>}
        </div>
        <div className="space-y-1.5">
          <Label>Email</Label>
          <Input type="email" {...register('email')} />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <Label>CNIC</Label>
          <Input {...register('cnic')} placeholder="XXXXX-XXXXXXX-X" />
        </div>
        <SelectField
          label="Relation"
          name="relation"
          control={control}
          error={errors.relation}
          options={relationOptions}
          placeholder="Select relation…"
          required
        />
      </div>
      <div className="space-y-1.5">
        <Label>Occupation</Label>
        <Input {...register('occupation')} />
      </div>
      <div className="space-y-1.5">
        <Label>Address</Label>
        <textarea
          rows={2}
          className="w-full rounded-md border bg-background px-3 py-2 text-sm focus:ring-2 focus:ring-ring outline-none resize-none"
          {...register('address')}
        />
      </div>
      <div className="flex justify-end gap-2 pt-2">
        <Button type="button" variant="outline" size="sm" onClick={onCancel} disabled={isLoading}>Cancel</Button>
        <Button type="submit" size="sm" disabled={isLoading}>{isLoading ? 'Saving…' : 'Save'}</Button>
      </div>
    </form>
  );
}
