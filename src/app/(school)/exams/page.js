'use client';

import { useState, useMemo, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { Plus } from 'lucide-react';
import { toast } from 'sonner';

import { examService, classService, academicYearService } from '@/services';
import useAuthStore from '@/store/authStore';
import { PERMISSIONS, EXAM_TYPES } from '@/constants';
import { formatDate } from '@/lib/utils';
import {
  PageHeader, DataTable,
  StatusBadge, TableRowActions, ConfirmDialog, AppModal,
} from '@/components/common';
import { ExamForm } from '@/components/forms';
import { Button } from '@/components/ui/button';
import { Badge }  from '@/components/ui/badge';

const extractRows  = (d) => d?.data?.rows ?? d?.data ?? [];
const extractPages = (d) => d?.data?.totalPages ?? 1;
const toOptions    = (arr, labelFn) => (arr ?? []).map((x) => ({ value: x.id, label: labelFn(x) }));

const EXAM_TYPE_OPTIONS = EXAM_TYPES?.map((t) => ({ value: t.value, label: t.label })) ?? [
  { value: 'midterm',    label: 'Midterm'    },
  { value: 'final',      label: 'Final'      },
  { value: 'unit_test',  label: 'Unit Test'  },
  { value: 'class_test', label: 'Class Test' },
];

const buildColumns = (onEdit, onDelete, router) => [
  { accessorKey: 'name', header: 'Exam Name', cell: ({ getValue }) => <span className="font-medium">{getValue()}</span> },
  { accessorKey: 'type', header: 'Type', cell: ({ getValue }) => <Badge variant="outline" className="capitalize">{getValue()}</Badge> },
  { id: 'class', header: 'Class', cell: ({ row }) => <span className="text-sm">{row.original.class?.name ?? '\u2014'}</span> },
  {
    id: 'dates', header: 'Dates',
    cell: ({ row }) => (
      <span className="text-sm text-muted-foreground">
        {formatDate(row.original.start_date)} \u2013 {formatDate(row.original.end_date)}
      </span>
    ),
  },
  { accessorKey: 'total_marks', header: 'Total Marks', cell: ({ getValue }) => <span className="text-sm">{getValue()}</span> },
  {
    accessorKey: 'is_published', header: 'Status',
    cell: ({ getValue }) => <StatusBadge status={getValue() ? 'published' : 'draft'} />,
  },
  {
    id: 'actions', header: '', enableHiding: false,
    cell: ({ row }) => {
      const ex = row.original;
      return <TableRowActions onView={() => router.push(`/exams/${ex.id}`)} onEdit={() => onEdit(ex)} onDelete={onDelete ? () => onDelete(ex) : undefined} />;
    },
  },
];

export default function ExamsPage() {
  const router = useRouter();
  const qc     = useQueryClient();

  const canCreate = useAuthStore((s) => s.canDo(PERMISSIONS.EXAM_CREATE));
  const canDelete = useAuthStore((s) => s.canDo(PERMISSIONS.EXAM_DELETE));

  const [mounted, setMounted] = useState(false);
  useEffect(() => { setMounted(true); }, []);

  const [typeFilter, setTypeFilter] = useState('');
  const [page, setPage]             = useState(1);
  const [pageSize, setPageSize]     = useState(10);
  const [createOpen, setCreateOpen] = useState(false);
  const [editTarget, setEditTarget] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);

  const { data, isLoading } = useQuery({
    queryKey: ['exams', { page, pageSize, typeFilter }],
    queryFn:  () => examService.getAll({ page, limit: pageSize, type: typeFilter || undefined }),
  });

  const { data: classesData } = useQuery({ queryKey: ['classes-all'],        queryFn: () => classService.getAll({ limit: 100 }) });
  const { data: yearsData }   = useQuery({ queryKey: ['academic-years-all'], queryFn: () => academicYearService.getAll() });

  const exams               = extractRows(data);
  const totalPages          = extractPages(data);
  const total               = data?.data?.total ?? exams.length;
  const classOptions        = toOptions(extractRows(classesData), (c) => c.name);
  const academicYearOptions = toOptions(yearsData?.data ?? [], (y) => y.name);

  const createMutation = useMutation({
    mutationFn: examService.create,
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['exams'] }); toast.success('Exam created'); setCreateOpen(false); },
    onError: (e) => toast.error(e?.response?.data?.message ?? 'Failed'),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, body }) => examService.update(id, body),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['exams'] }); toast.success('Exam updated'); setEditTarget(null); },
    onError: (e) => toast.error(e?.response?.data?.message ?? 'Failed'),
  });

  const deleteMutation = useMutation({
    mutationFn: ({ id }) => examService.delete(id),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['exams'] }); toast.success('Exam deleted'); setDeleteTarget(null); },
    onError: (e) => toast.error(e?.response?.data?.message ?? 'Failed'),
  });

  const columns = useMemo(
    () => buildColumns(setEditTarget, canDelete ? setDeleteTarget : null, router),
    [canDelete, router],
  );

  return (
    <div className="space-y-6">
      <PageHeader
        title="Exams"
        description="Create and manage examinations"
        action={mounted && canCreate && (
          <Button onClick={() => setCreateOpen(true)}><Plus size={16} className="mr-2" /> Create Exam</Button>
        )}
      />

      <DataTable
        columns={columns}
        data={exams}
        loading={isLoading}
        emptyMessage="No exams found"
        filters={[{
          name: 'type', label: 'Type', value: typeFilter,
          onChange: (v) => { setTypeFilter(v); setPage(1); },
          options: EXAM_TYPE_OPTIONS,
        }]}
        enableColumnVisibility
        pagination={{ page, totalPages, onPageChange: setPage, total, pageSize, onPageSizeChange: (s) => { setPageSize(s); setPage(1); } }}
        exportConfig={{ fileName: 'exams', dateField: 'start_date' }}
      />

      <AppModal open={createOpen} onClose={() => setCreateOpen(false)} title="Create Exam" size="lg">
        <ExamForm onSubmit={(body) => createMutation.mutate(body)} onCancel={() => setCreateOpen(false)} loading={createMutation.isPending} classOptions={classOptions} academicYearOptions={academicYearOptions} />
      </AppModal>

      <AppModal open={!!editTarget} onClose={() => setEditTarget(null)} title="Edit Exam" size="lg">
        <ExamForm defaultValues={editTarget ?? {}} onSubmit={(body) => updateMutation.mutate({ id: editTarget.id, body })} onCancel={() => setEditTarget(null)} loading={updateMutation.isPending} classOptions={classOptions} academicYearOptions={academicYearOptions} isEdit />
      </AppModal>

      <ConfirmDialog open={!!deleteTarget} onClose={() => setDeleteTarget(null)} onConfirm={() => deleteMutation.mutate(deleteTarget)} loading={deleteMutation.isPending} title="Delete Exam" description={`Delete exam "${deleteTarget?.name}"?`} confirmLabel="Delete" variant="destructive" />
    </div>
  );
}
