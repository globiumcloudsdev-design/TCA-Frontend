'use client';

import { useState, useMemo, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, PowerOff, Power } from 'lucide-react';
import { toast } from 'sonner';

import { userService, roleService } from '@/services';
import useAuthStore from '@/store/authStore';
import { PERMISSIONS } from '@/constants';
import { formatDate } from '@/lib/utils';
import {
  PageHeader, DataTable,
  AvatarWithInitials, StatusBadge, TableRowActions,
  ConfirmDialog, AppModal,
} from '@/components/common';
import { UserForm } from '@/components/forms';
import { Button } from '@/components/ui/button';
import { Badge }  from '@/components/ui/badge';

const extractRows  = (d) => d?.data?.rows ?? d?.data ?? [];
const extractPages = (d) => d?.data?.totalPages ?? 1;
const toOptions    = (arr, labelFn) => (arr ?? []).map((x) => ({ value: x.id, label: labelFn(x) }));

const buildColumns = (onEdit, onDelete, onToggle) => [
  {
    id: 'user', header: 'User',
    cell: ({ row }) => {
      const u = row.original;
      return (
        <div className="flex items-center gap-3">
          <AvatarWithInitials src={u.avatar} firstName={u.first_name} lastName={u.last_name} size="sm" />
          <div>
            <p className="font-medium text-sm leading-tight">{u.first_name} {u.last_name}</p>
            <p className="text-xs text-muted-foreground">{u.email}</p>
          </div>
        </div>
      );
    },
  },
  {
    id: 'role', header: 'Role',
    cell: ({ row }) => row.original.role ? <Badge variant="secondary" className="capitalize">{row.original.role?.name ?? row.original.role}</Badge> : null,
  },
  { accessorKey: 'phone',      header: 'Phone',   cell: ({ getValue }) => <span className="text-sm text-muted-foreground">{getValue() ?? '\u2014'}</span> },
  { accessorKey: 'is_active',  header: 'Status',  cell: ({ getValue }) => <StatusBadge status={getValue() !== false ? 'active' : 'inactive'} /> },
  { accessorKey: 'created_at', header: 'Joined',  cell: ({ getValue }) => <span className="text-sm text-muted-foreground">{formatDate(getValue())}</span> },
  {
    id: 'actions', header: '', enableHiding: false,
    cell: ({ row }) => {
      const u = row.original;
      const extraActions = onToggle ? [{
        label: u.is_active ? 'Deactivate' : 'Activate',
        icon:  u.is_active ? PowerOff : Power,
        onClick: () => onToggle(u),
      }] : [];
      return <TableRowActions onEdit={onEdit ? () => onEdit(u) : undefined} onDelete={onDelete ? () => onDelete(u) : undefined} extraActions={extraActions} />;
    },
  },
];

export default function UsersPage() {
  const qc = useQueryClient();

  const canCreate = useAuthStore((s) => s.canDo(PERMISSIONS.USER_CREATE));
  const canDelete = useAuthStore((s) => s.canDo(PERMISSIONS.USER_DELETE));

  const [mounted, setMounted] = useState(false);
  useEffect(() => { setMounted(true); }, []);

  const [page,        setPage]        = useState(1);
  const [pageSize,    setPageSize]    = useState(10);
  const [search,      setSearch]      = useState('');
  const [createOpen,  setCreateOpen]  = useState(false);
  const [editTarget,    setEditTarget]    = useState(null);
  const [deleteTarget,  setDeleteTarget]  = useState(null);
  const [toggleTarget,  setToggleTarget]  = useState(null);

  const { data, isLoading } = useQuery({
    queryKey: ['users', { page, pageSize, search }],
    queryFn:  () => userService.getAll({ page, limit: pageSize, search: search || undefined }),
  });

  const { data: rolesData } = useQuery({ queryKey: ['roles-all'], queryFn: roleService.getAll });

  const users        = extractRows(data);
  const totalPages   = extractPages(data);
  const total        = data?.data?.total ?? users.length;
  const roleOptions  = toOptions(extractRows(rolesData), (r) => r.name);

  const createMutation = useMutation({
    mutationFn: userService.create,
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['users'] }); toast.success('User created'); setCreateOpen(false); },
    onError: (e) => toast.error(e?.response?.data?.message ?? 'Failed'),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, body }) => userService.update(id, body),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['users'] }); toast.success('User updated'); setEditTarget(null); },
    onError: (e) => toast.error(e?.response?.data?.message ?? 'Failed'),
  });

  const toggleMutation = useMutation({
    mutationFn: ({ id, is_active }) => userService.toggleStatus(id, !is_active),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['users'] }); toast.success('Status updated'); setToggleTarget(null); },
    onError: (e) => toast.error(e?.response?.data?.message ?? 'Failed'),
  });

  const deleteMutation = useMutation({
    mutationFn: ({ id }) => userService.delete(id),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['users'] }); toast.success('User deleted'); setDeleteTarget(null); },
    onError: (e) => toast.error(e?.response?.data?.message ?? 'Failed'),
  });

  const columns = useMemo(
    () => buildColumns(setEditTarget, canDelete ? setDeleteTarget : null, setToggleTarget),
    [canDelete],
  );

  return (
    <div className="space-y-6">
      <PageHeader
        title="Users"
        description="Manage school staff accounts"
        action={mounted && canCreate && (
          <Button onClick={() => setCreateOpen(true)}><Plus size={16} className="mr-2" /> Add User</Button>
        )}
      />

      <DataTable
        columns={columns}
        data={users}
        loading={isLoading}
        emptyMessage="No users found"
        search={search}
        onSearch={(v) => { setSearch(v); setPage(1); }}
        searchPlaceholder="Search by name or email…"
        enableColumnVisibility
        pagination={{ page, totalPages, onPageChange: setPage, total, pageSize, onPageSizeChange: (s) => { setPageSize(s); setPage(1); } }}
        exportConfig={{ fileName: 'users' }}
      />

      <AppModal open={createOpen} onClose={() => setCreateOpen(false)} title="Add User" size="lg">
        <UserForm onSubmit={(body) => createMutation.mutate(body)} onCancel={() => setCreateOpen(false)} loading={createMutation.isPending} roleOptions={roleOptions} />
      </AppModal>

      <AppModal open={!!editTarget} onClose={() => setEditTarget(null)} title="Edit User" size="lg">
        <UserForm defaultValues={editTarget ?? {}} onSubmit={(body) => updateMutation.mutate({ id: editTarget.id, body })} onCancel={() => setEditTarget(null)} loading={updateMutation.isPending} roleOptions={roleOptions} isEdit />
      </AppModal>

      <ConfirmDialog open={!!toggleTarget} onClose={() => setToggleTarget(null)} onConfirm={() => toggleMutation.mutate(toggleTarget)} loading={toggleMutation.isPending}
        title={toggleTarget?.is_active ? 'Deactivate User' : 'Activate User'}
        description={`${toggleTarget?.is_active ? 'Deactivate' : 'Activate'} "${toggleTarget?.first_name} ${toggleTarget?.last_name}"?`}
        confirmLabel={toggleTarget?.is_active ? 'Deactivate' : 'Activate'}
        variant={toggleTarget?.is_active ? 'destructive' : 'default'}
      />

      <ConfirmDialog open={!!deleteTarget} onClose={() => setDeleteTarget(null)} onConfirm={() => deleteMutation.mutate(deleteTarget)} loading={deleteMutation.isPending} title="Delete User" description={`Permanently delete "${deleteTarget?.first_name} ${deleteTarget?.last_name}"?`} confirmLabel="Delete" variant="destructive" />
    </div>
  );
}
