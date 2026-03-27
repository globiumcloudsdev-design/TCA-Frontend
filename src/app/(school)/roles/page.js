'use client';

import { useState, useMemo, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus } from 'lucide-react';
import { toast } from 'sonner';

import { roleService } from '@/services';
import useAuthStore from '@/store/authStore';
import { PERMISSIONS } from '@/constants';
import {
  PageHeader, DataTable,
  TableRowActions, ConfirmDialog, AppModal,
} from '@/components/common';
import { RoleForm } from '@/components/forms';
import { Button } from '@/components/ui/button';
import { Badge }  from '@/components/ui/badge';

const extractRows = (d) => d?.data?.rows ?? d?.data ?? [];

const buildColumns = (onEdit, onDelete) => [
  { accessorKey: 'name', header: 'Role Name',    cell: ({ getValue }) => <span className="font-medium capitalize">{getValue()}</span> },
  { accessorKey: 'code', header: 'Code',         cell: ({ getValue }) => <span className="font-mono text-xs bg-muted px-2 py-1 rounded">{getValue()}</span> },
  {
    id: 'permissions', header: 'Permissions',
    cell: ({ row }) => {
      const count = row.original.permissions?.length ?? 0;
      return <Badge variant="secondary">{count} permission{count !== 1 ? 's' : ''}</Badge>;
    },
  },
  {
    id: 'actions', header: '', enableHiding: false,
    cell: ({ row }) => {
      const r = row.original;
      if (r.is_system) return <span className="text-xs text-muted-foreground">System role</span>;
      return <TableRowActions onEdit={onEdit ? () => onEdit(r) : undefined} onDelete={onDelete ? () => onDelete(r) : undefined} />;
    },
  },
];

export default function RolesPage() {
  const qc = useQueryClient();

  const canCreate = useAuthStore((s) => s.canDo(PERMISSIONS.ROLE_CREATE));
  const canDelete = useAuthStore((s) => s.canDo(PERMISSIONS.ROLE_DELETE));

  const [mounted, setMounted] = useState(false);
  useEffect(() => { setMounted(true); }, []);

  const [createOpen, setCreateOpen] = useState(false);
  const [editTarget,   setEditTarget]   = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);

  const { data, isLoading } = useQuery({
    queryKey: ['roles'],
    queryFn:  roleService.getAll,
  });

  const roles = extractRows(data);

  const createMutation = useMutation({
    mutationFn: roleService.create,
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['roles'] }); toast.success('Role created'); setCreateOpen(false); },
    onError: (e) => toast.error(e?.response?.data?.message ?? 'Failed'),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, body }) => roleService.update(id, body),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['roles'] }); toast.success('Role updated'); setEditTarget(null); },
    onError: (e) => toast.error(e?.response?.data?.message ?? 'Failed'),
  });

  const deleteMutation = useMutation({
    mutationFn: ({ id }) => roleService.delete(id),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['roles'] }); toast.success('Role deleted'); setDeleteTarget(null); },
    onError: (e) => toast.error(e?.response?.data?.message ?? 'Failed'),
  });

  const columns = useMemo(
    () => buildColumns(setEditTarget, canDelete ? setDeleteTarget : null),
    [canDelete],
  );

  return (
    <div className="space-y-6">
      <PageHeader
        title="Roles & Permissions"
        description="Define roles and their access levels"
        action={mounted && canCreate && (
          <Button onClick={() => setCreateOpen(true)}><Plus size={16} className="mr-2" /> Add Role</Button>
        )}
      />

      <DataTable columns={columns} data={roles} loading={isLoading} emptyMessage="No roles found" enableColumnVisibility exportConfig={{ fileName: 'roles' }} />

      <AppModal open={createOpen} onClose={() => setCreateOpen(false)} title="Create Role" size="xl">
        <RoleForm onSubmit={(body) => createMutation.mutate(body)} onCancel={() => setCreateOpen(false)} loading={createMutation.isPending} />
      </AppModal>

      <AppModal open={!!editTarget} onClose={() => setEditTarget(null)} title="Edit Role" size="xl">
        <RoleForm defaultValues={editTarget ?? {}} onSubmit={(body) => updateMutation.mutate({ id: editTarget.id, body })} onCancel={() => setEditTarget(null)} loading={updateMutation.isPending} isEdit />
      </AppModal>

      <ConfirmDialog open={!!deleteTarget} onClose={() => setDeleteTarget(null)} onConfirm={() => deleteMutation.mutate(deleteTarget)} loading={deleteMutation.isPending} title="Delete Role" description={`Delete role "${deleteTarget?.name}"? Users with this role will lose access.`} confirmLabel="Delete" variant="destructive" />
    </div>
  );
}
