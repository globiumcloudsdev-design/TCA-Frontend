'use client';

import { useState, useMemo, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { Plus } from 'lucide-react';
import { toast } from 'sonner';

import { studentService, classService, academicYearService } from '@/services';
import useAuthStore from '@/store/authStore';
import { useUIStore } from '@/store/uiStore';
import { PERMISSIONS } from '@/constants';
import {
  PageHeader,
  DataTable,
  AvatarWithInitials,
  StatusBadge,
  TableRowActions,
  ConfirmDialog,
  AppModal,
} from '@/components/common';
import { StudentForm } from '@/components/forms';
import { Button } from '@/components/ui/button';
import { Badge }  from '@/components/ui/badge';

const extractRows  = (d) => d?.data?.rows ?? d?.data ?? [];
const extractPages = (d) => d?.data?.totalPages ?? 1;
const toOptions    = (arr, labelFn) => (arr ?? []).map((x) => ({ value: x.id, label: labelFn(x) }));

const buildColumns = (onEdit, onDelete, router) => [
  {
    id: 'student',
    header: 'Student',
    cell: ({ row }) => {
      const s = row.original;
      return (
        <div className="flex items-center gap-3">
          <AvatarWithInitials src={s.photo_url} firstName={s.first_name} lastName={s.last_name} size="sm" />
          <div>
            <p className="font-medium text-sm leading-tight">{s.first_name} {s.last_name}</p>
            <p className="text-xs text-muted-foreground font-mono">{s.gr_number}</p>
          </div>
        </div>
      );
    },
  },
  {
    id: 'class',
    header: 'Class / Section',
    cell: ({ row }) => <span className="text-sm">{row.original.class?.name ?? '—'}{row.original.section ? ` / ${row.original.section.name}` : ''}</span>,
  },
  {
    accessorKey: 'gender',
    header: 'Gender',
    cell: ({ getValue }) => <Badge variant="outline" className="capitalize text-xs">{getValue() ?? '—'}</Badge>,
  },
  {
    id: 'guardian_phone',
    header: 'Guardian Phone',
    cell: ({ row }) => <span className="text-sm text-muted-foreground">{row.original.guardian_phone ?? '—'}</span>,
  },
  {
    accessorKey: 'is_active',
    header: 'Status',
    cell: ({ getValue }) => <StatusBadge status={getValue() !== false ? 'active' : 'inactive'} />,
  },
  {
    id: 'actions',
    header: '',
    enableHiding: false,
    cell: ({ row }) => {
      const s = row.original;
      return (
        <TableRowActions
          onView={() => router.push(`/students/${s.id}`)}
          onEdit={() => onEdit(s)}
          onDelete={onDelete ? () => onDelete(s) : undefined}
        />
      );
    },
  },
];

export default function StudentsPage() {
  const router = useRouter();
  const qc     = useQueryClient();

  const canCreate = useAuthStore((s) => s.canDo(PERMISSIONS.STUDENT_CREATE));
  const canDelete = useAuthStore((s) => s.canDo(PERMISSIONS.STUDENT_DELETE));
  const { activeBranchId } = useUIStore();

  const [mounted, setMounted] = useState(false);
  useEffect(() => { setMounted(true); }, []);

  const [page, setPage]               = useState(1);
  const [pageSize, setPageSize]         = useState(10);
  const [search, setSearch]             = useState('');
  const [classFilter, setClassFilter]   = useState('');

  const [createOpen, setCreateOpen]   = useState(false);
  const [editTarget, setEditTarget]   = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);

  const { data, isLoading } = useQuery({
    queryKey: ['students', { page, pageSize, search, class_id: classFilter, branch_id: activeBranchId }],
    queryFn:  () => studentService.getAll({ page, limit: pageSize, search: search || undefined, class_id: classFilter || undefined, branch_id: activeBranchId || undefined }),
  });

  const { data: classesData } = useQuery({
    queryKey: ['classes-all'],
    queryFn:  () => classService.getAll({ limit: 100 }),
  });

  const { data: yearsData } = useQuery({
    queryKey: ['academic-years-all'],
    queryFn:  () => academicYearService.getAll(),
  });

  const students   = extractRows(data);
  const totalPages = extractPages(data);
  const total      = data?.data?.total ?? students.length;

  const classOptions        = toOptions(extractRows(classesData), (c) => c.name);
  const academicYearOptions = toOptions(yearsData?.data ?? [], (y) => y.name);

  const createMutation = useMutation({
    mutationFn: studentService.create,
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['students'] }); toast.success('Student added'); setCreateOpen(false); },
    onError: (e) => toast.error(e?.response?.data?.message ?? 'Failed'),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, body }) => studentService.update(id, body),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['students'] }); toast.success('Student updated'); setEditTarget(null); },
    onError: (e) => toast.error(e?.response?.data?.message ?? 'Failed'),
  });

  const deleteMutation = useMutation({
    mutationFn: ({ id }) => studentService.delete(id),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['students'] }); toast.success('Student removed'); setDeleteTarget(null); },
    onError: (e) => toast.error(e?.response?.data?.message ?? 'Failed'),
  });

  const columns = useMemo(
    () => buildColumns(setEditTarget, canDelete ? setDeleteTarget : null, router),
    [canDelete, router],
  );

  return (
    <div className="space-y-6">
      <PageHeader
        title="Students"
        description="Manage all enrolled students"
        action={mounted && canCreate && (
          <Button onClick={() => setCreateOpen(true)}><Plus size={16} className="mr-2" /> Add Student</Button>
        )}
      />

      <DataTable
        columns={columns}
        data={students}
        loading={isLoading}
        emptyMessage="No students found"
        search={search}
        onSearch={(v) => { setSearch(v); setPage(1); }}
        searchPlaceholder="Search by name or GR number…"
        filters={[
          { name: 'class', label: 'Class', value: classFilter, onChange: (v) => { setClassFilter(v); setPage(1); }, options: classOptions },
        ]}
        enableColumnVisibility
        pagination={{ page, totalPages, onPageChange: setPage, total, pageSize, onPageSizeChange: (s) => { setPageSize(s); setPage(1); } }}
        exportConfig={{ fileName: 'students', dateField: 'created_at' }}
      />

      <AppModal open={createOpen} onClose={() => setCreateOpen(false)} title="Add New Student" size="lg">
        <StudentForm onSubmit={(body) => createMutation.mutate(body)} onCancel={() => setCreateOpen(false)} loading={createMutation.isPending} classOptions={classOptions} academicYearOptions={academicYearOptions} />
      </AppModal>

      <AppModal open={!!editTarget} onClose={() => setEditTarget(null)} title="Edit Student" size="lg">
        <StudentForm defaultValues={editTarget ?? {}} onSubmit={(body) => updateMutation.mutate({ id: editTarget.id, body })} onCancel={() => setEditTarget(null)} loading={updateMutation.isPending} classOptions={classOptions} academicYearOptions={academicYearOptions} isEdit />
      </AppModal>

      <ConfirmDialog open={!!deleteTarget} onClose={() => setDeleteTarget(null)} onConfirm={() => deleteMutation.mutate(deleteTarget)} loading={deleteMutation.isPending} title="Remove Student" description={`Remove "${deleteTarget?.first_name} ${deleteTarget?.last_name}"?`} confirmLabel="Remove" variant="destructive" />
    </div>
  );
}
