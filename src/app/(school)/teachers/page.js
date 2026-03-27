'use client';

import { useState, useMemo, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { Plus } from 'lucide-react';
import { toast } from 'sonner';

import { teacherService } from '@/services';
import useAuthStore from '@/store/authStore';
import { useUIStore } from '@/store/uiStore';
import { PERMISSIONS } from '@/constants';
import {
  PageHeader, DataTable,
  AvatarWithInitials, StatusBadge, TableRowActions,
  ConfirmDialog, AppModal,
} from '@/components/common';
import { TeacherForm } from '@/components/forms';
import { Button } from '@/components/ui/button';

const extractRows  = (d) => d?.data?.rows ?? d?.data ?? [];
const extractPages = (d) => d?.data?.totalPages ?? 1;

const buildColumns = (onEdit, onDelete, router) => [
  {
    id: 'teacher',
    header: 'Teacher',
    cell: ({ row }) => {
      const t = row.original;
      return (
        <div className="flex items-center gap-3">
          <AvatarWithInitials src={t.photo_url} firstName={t.first_name} lastName={t.last_name} size="sm" />
          <div>
            <p className="font-medium text-sm leading-tight">{t.first_name} {t.last_name}</p>
            <p className="text-xs text-muted-foreground">{t.email}</p>
          </div>
        </div>
      );
    },
  },
  { accessorKey: 'employee_id',   header: 'Employee ID',   cell: ({ getValue }) => <span className="font-mono text-sm">{getValue() ?? '\u2014'}</span> },
  { accessorKey: 'phone',         header: 'Phone',         cell: ({ getValue }) => <span className="text-sm text-muted-foreground">{getValue() ?? '\u2014'}</span> },
  { accessorKey: 'qualification', header: 'Qualification', cell: ({ getValue }) => <span className="text-sm">{getValue() ?? '\u2014'}</span> },
  { accessorKey: 'is_active', header: 'Status', cell: ({ getValue }) => <StatusBadge status={getValue() !== false ? 'active' : 'inactive'} /> },
  {
    id: 'actions', header: '', enableHiding: false,
    cell: ({ row }) => {
      const t = row.original;
      return <TableRowActions onView={() => router.push(`/teachers/${t.id}`)} onEdit={() => onEdit(t)} onDelete={onDelete ? () => onDelete(t) : undefined} />;
    },
  },
];

export default function TeachersPage() {
  const router = useRouter();
  const qc     = useQueryClient();

  const canCreate = useAuthStore((s) => s.canDo(PERMISSIONS.TEACHER_CREATE));
  const canDelete = useAuthStore((s) => s.canDo(PERMISSIONS.TEACHER_DELETE));
  const { activeBranchId } = useUIStore();

  const [mounted, setMounted] = useState(false);
  useEffect(() => { setMounted(true); }, []);

  const [page, setPage]               = useState(1);
  const [pageSize, setPageSize]         = useState(10);
  const [search, setSearch]             = useState('');
  const [createOpen, setCreateOpen]     = useState(false);
  const [editTarget, setEditTarget]     = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);

  const { data, isLoading } = useQuery({
    queryKey: ['teachers', { page, pageSize, search, branch_id: activeBranchId }],
    queryFn:  () => teacherService.getAll({ page, limit: pageSize, search: search || undefined, branch_id: activeBranchId || undefined }),
  });

  const teachers   = extractRows(data);
  const totalPages = extractPages(data);
  const total      = data?.data?.total ?? teachers.length;

  const createMutation = useMutation({
    mutationFn: teacherService.create,
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['teachers'] }); toast.success('Teacher added'); setCreateOpen(false); },
    onError: (e) => toast.error(e?.response?.data?.message ?? 'Failed'),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, body }) => teacherService.update(id, body),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['teachers'] }); toast.success('Teacher updated'); setEditTarget(null); },
    onError: (e) => toast.error(e?.response?.data?.message ?? 'Failed'),
  });

  const deleteMutation = useMutation({
    mutationFn: ({ id }) => teacherService.delete(id),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['teachers'] }); toast.success('Teacher removed'); setDeleteTarget(null); },
    onError: (e) => toast.error(e?.response?.data?.message ?? 'Failed'),
  });

  const columns = useMemo(
    () => buildColumns(setEditTarget, canDelete ? setDeleteTarget : null, router),
    [canDelete, router],
  );

  return (
    <div className="space-y-6">
      <PageHeader
        title="Teachers"
        description="Manage all teaching staff"
        action={mounted && canCreate && (
          <Button onClick={() => setCreateOpen(true)}><Plus size={16} className="mr-2" /> Add Teacher</Button>
        )}
      />

      <DataTable
        columns={columns}
        data={teachers}
        loading={isLoading}
        emptyMessage="No teachers found"
        search={search}
        onSearch={(v) => { setSearch(v); setPage(1); }}
        searchPlaceholder="Search by name or employee ID…"
        enableColumnVisibility
        pagination={{ page, totalPages, onPageChange: setPage, total, pageSize, onPageSizeChange: (s) => { setPageSize(s); setPage(1); } }}
        exportConfig={{ fileName: 'teachers', dateField: 'created_at' }}
      />

      <AppModal open={createOpen} onClose={() => setCreateOpen(false)} title="Add New Teacher" size="lg">
        <TeacherForm
          onSubmit={(body) => createMutation.mutate(body)}
          onCancel={() => setCreateOpen(false)}
          loading={createMutation.isPending}
        />
      </AppModal>

      <AppModal open={!!editTarget} onClose={() => setEditTarget(null)} title="Edit Teacher" size="lg">
        <TeacherForm
          defaultValues={editTarget ?? {}}
          onSubmit={(body) => updateMutation.mutate({ id: editTarget.id, body })}
          onCancel={() => setEditTarget(null)}
          loading={updateMutation.isPending}
          isEdit
        />
      </AppModal>

      <ConfirmDialog
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={() => deleteMutation.mutate(deleteTarget)}
        loading={deleteMutation.isPending}
        title="Remove Teacher"
        description={`Remove "${deleteTarget?.first_name} ${deleteTarget?.last_name}"?`}
        confirmLabel="Remove"
        variant="destructive"
      />
    </div>
  );
}
