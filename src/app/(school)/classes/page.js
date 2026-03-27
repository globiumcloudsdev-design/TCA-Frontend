'use client';

import { useState, useMemo, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { Plus } from 'lucide-react';
import { toast } from 'sonner';

import { classService, academicYearService, teacherService } from '@/services';
import useAuthStore from '@/store/authStore';
import { useUIStore } from '@/store/uiStore';
import { PERMISSIONS } from '@/constants';
import {
  PageHeader, DataTable,
  StatusBadge, TableRowActions, ConfirmDialog, AppModal,
} from '@/components/common';
import { ClassForm } from '@/components/forms';
import { Button } from '@/components/ui/button';
import { Badge }  from '@/components/ui/badge';

const extractRows  = (d) => d?.data?.rows ?? d?.data ?? [];
const extractPages = (d) => d?.data?.totalPages ?? 1;
const toOptions    = (arr, labelFn) => (arr ?? []).map((x) => ({ value: x.id, label: labelFn(x) }));

const buildColumns = (onEdit, onDelete, router) => [
  { accessorKey: 'name',        header: 'Class Name',  cell: ({ getValue }) => <span className="font-medium">{getValue()}</span> },
  { accessorKey: 'grade_level', header: 'Grade',       cell: ({ getValue }) => <Badge variant="secondary">{getValue() ?? '\u2014'}</Badge> },
  { id: 'teacher', header: 'Class Teacher', cell: ({ row }) => <span className="text-sm">{row.original.classTeacher ? `${row.original.classTeacher.first_name} ${row.original.classTeacher.last_name}` : '\u2014'}</span> },
  { id: 'sections', header: 'Sections', cell: ({ row }) => <span className="text-sm">{row.original.sections?.length ?? 0}</span> },
  { id: 'students', header: 'Students', cell: ({ row }) => <span className="text-sm">{row.original.student_count ?? 0}</span> },
  { accessorKey: 'is_active', header: 'Status', cell: ({ getValue }) => <StatusBadge status={getValue() !== false ? 'active' : 'inactive'} /> },
  {
    id: 'actions', header: '', enableHiding: false,
    cell: ({ row }) => {
      const c = row.original;
      return <TableRowActions onView={() => router.push(`/classes/${c.id}`)} onEdit={() => onEdit(c)} onDelete={onDelete ? () => onDelete(c) : undefined} />;
    },
  },
];

export default function ClassesPage() {
  const router = useRouter();
  const qc     = useQueryClient();

  const canCreate = useAuthStore((s) => s.canDo(PERMISSIONS.CLASS_CREATE));
  const canDelete = useAuthStore((s) => s.canDo(PERMISSIONS.CLASS_DELETE));
  const { activeBranchId } = useUIStore();

  const [mounted, setMounted] = useState(false);
  useEffect(() => { setMounted(true); }, []);

  const [createOpen, setCreateOpen]     = useState(false);
  const [editTarget, setEditTarget]     = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [page,     setPage]     = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const { data, isLoading } = useQuery({
    queryKey: ['classes', { page, pageSize, branch_id: activeBranchId }],
    queryFn:  () => classService.getAll({ page, limit: pageSize, branch_id: activeBranchId || undefined }),
  });

  const { data: yearsData }   = useQuery({ queryKey: ['academic-years-all'], queryFn: () => academicYearService.getAll() });
  const { data: teachersData } = useQuery({ queryKey: ['teachers-all'],       queryFn: () => teacherService.getAll({ limit: 100 }) });

  const classes             = extractRows(data);
  const totalPages          = extractPages(data);
  const total               = data?.data?.total ?? classes.length;
  const academicYearOptions = toOptions(yearsData?.data ?? [], (y) => y.name);
  const teacherOptions      = toOptions(extractRows(teachersData), (t) => `${t.first_name} ${t.last_name}`);

  const createMutation = useMutation({
    mutationFn: classService.create,
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['classes'] }); toast.success('Class created'); setCreateOpen(false); },
    onError: (e) => toast.error(e?.response?.data?.message ?? 'Failed'),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, body }) => classService.update(id, body),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['classes'] }); toast.success('Class updated'); setEditTarget(null); },
    onError: (e) => toast.error(e?.response?.data?.message ?? 'Failed'),
  });

  const deleteMutation = useMutation({
    mutationFn: ({ id }) => classService.delete(id),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['classes'] }); toast.success('Class deleted'); setDeleteTarget(null); },
    onError: (e) => toast.error(e?.response?.data?.message ?? 'Failed'),
  });

  const columns = useMemo(
    () => buildColumns(setEditTarget, canDelete ? setDeleteTarget : null, router),
    [canDelete, router],
  );

  return (
    <div className="space-y-6">
      <PageHeader
        title="Classes"
        description="Manage classes and their sections"
        action={mounted && canCreate && (
          <Button onClick={() => setCreateOpen(true)}><Plus size={16} className="mr-2" /> Add Class</Button>
        )}
      />

      <DataTable
        columns={columns}
        data={classes}
        loading={isLoading}
        emptyMessage="No classes yet"
        enableColumnVisibility
        pagination={{ page, totalPages, onPageChange: setPage, total, pageSize, onPageSizeChange: (s) => { setPageSize(s); setPage(1); } }}
        exportConfig={{ fileName: 'classes' }}
      />

      <AppModal open={createOpen} onClose={() => setCreateOpen(false)} title="Add New Class" size="md">
        <ClassForm onSubmit={(body) => createMutation.mutate(body)} onCancel={() => setCreateOpen(false)} loading={createMutation.isPending} academicYearOptions={academicYearOptions} teacherOptions={teacherOptions} />
      </AppModal>

      <AppModal open={!!editTarget} onClose={() => setEditTarget(null)} title="Edit Class" size="md">
        <ClassForm defaultValues={editTarget ?? {}} onSubmit={(body) => updateMutation.mutate({ id: editTarget.id, body })} onCancel={() => setEditTarget(null)} loading={updateMutation.isPending} academicYearOptions={academicYearOptions} teacherOptions={teacherOptions} isEdit />
      </AppModal>

      <ConfirmDialog open={!!deleteTarget} onClose={() => setDeleteTarget(null)} onConfirm={() => deleteMutation.mutate(deleteTarget)} loading={deleteMutation.isPending} title="Delete Class" description={`Delete class "${deleteTarget?.name}"?`} confirmLabel="Delete" variant="destructive" />
    </div>
  );
}
