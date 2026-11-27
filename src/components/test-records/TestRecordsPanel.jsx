'use client';

import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useParams } from 'next/navigation';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { Plus, Send, Undo2 } from 'lucide-react';
import { classService, sectionService } from '@/services';
import { testRecordService, teacherTestRecordService, getTestRecordError, TEST_STATUS } from '@/services/testRecordService';
import useBranchAccess from '@/hooks/useBranchAccess';
import DataTable from '@/components/common/DataTable';
import TableRowActions from '@/components/common/TableRowActions';
import ConfirmDialog from '@/components/common/ConfirmDialog';
import { Button } from '@/components/ui/button';
import TestRecordFormModal from './TestRecordFormModal';
import { StatusPill, ErrorBlock, extractList, fmtDate, fmtNum, MONTH_OPTIONS, yearOptions, monthRange } from './shared';

const EMPTY_FILTERS = { class_id: '', section_id: '', subject: '', teacher_id: '', status: '', month: '', year: '' };
const STATUS_OPTIONS = Object.entries(TEST_STATUS).map(([value, s]) => ({ value, label: s.label }));

/**
 * Test Records tab: a data table (same DataTable / toolbar / pagination / row-actions pattern as the Students page),
 * one row per test. Row actions: View, Edit, Delete (+ Publish/Unpublish for admins).
 */
export default function TestRecordsPanel({ mode = 'admin' }) {
  const isAdmin = mode === 'admin';
  const svc = isAdmin ? testRecordService : teacherTestRecordService;
  const router = useRouter();
  const params = useParams();
  const qc = useQueryClient();
  const { activeBranchId } = useBranchAccess();

  const viewHref = (id) => (isAdmin ? `/${params?.type || 'school'}/exams/test-records/${id}` : `/teacher/exams/test-records/${id}`);

  const [filters, setFilters] = useState(EMPTY_FILTERS);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [formError, setFormError] = useState('');
  const [deleting, setDeleting] = useState(null);

  const setFilter = (key) => (value) => {
    setFilters((f) => ({ ...f, [key]: value, ...(key === 'class_id' ? { section_id: '' } : {}) }));
    setPage(1);
  };

  // ── Filter option data ──
  const adminOptions = useQuery({ queryKey: ['test-record-options', 'admin', ''], queryFn: () => testRecordService.options(), enabled: isAdmin, staleTime: 60_000 });
  const teacherOptions = useQuery({ queryKey: ['test-record-options', 'teacher'], queryFn: () => teacherTestRecordService.options(), enabled: !isAdmin, staleTime: 60_000 });
  const classesQ = useQuery({
    queryKey: ['test-record-classes', activeBranchId],
    queryFn: () => classService.getAll({ branch_id: activeBranchId, limit: 500, fetchAll: true }),
    enabled: isAdmin,
    staleTime: 60_000,
  });
  const sectionsQ = useQuery({
    queryKey: ['test-record-sections', filters.class_id],
    queryFn: () => sectionService.getAll({ class_id: filters.class_id, limit: 200 }),
    enabled: isAdmin && !!filters.class_id,
    staleTime: 60_000,
  });

  const teacherClasses = !isAdmin ? teacherOptions.data?.data?.classes || [] : [];
  const classOptions = isAdmin ? extractList(classesQ.data).map((c) => ({ value: c.id, label: c.name })) : teacherClasses.map((c) => ({ value: c.id, label: c.name }));
  const sectionOptions = !filters.class_id
    ? []
    : isAdmin
      ? extractList(sectionsQ.data).map((s) => ({ value: s.id, label: s.name }))
      : (teacherClasses.find((c) => c.id === filters.class_id)?.sections || []).map((s) => ({ value: s.id, label: s.name }));
  const teacherFilterOptions = (adminOptions.data?.data?.teachers || []).map((t) => ({ value: t.id, label: t.name }));

  // ── List ──
  const range = filters.month && filters.year ? monthRange(filters.month, filters.year) : {};
  const { month: _m, year: _y, ...apiFilters } = filters;
  const { data, isLoading, isFetching, error, refetch } = useQuery({
    queryKey: ['test-records', mode, activeBranchId, filters, page, pageSize],
    queryFn: () => svc.list({ ...apiFilters, ...range, page, limit: pageSize }),
    placeholderData: (prev) => prev,
  });
  const allRows = Array.isArray(data?.data) ? data.data : [];
  const pagination = data?.pagination;

  const subjectOptions = useMemo(() => {
    const names = new Set(allRows.map((r) => r.subject_name).filter(Boolean));
    if (filters.subject) names.add(filters.subject);
    if (!isAdmin) {
      teacherClasses.forEach((c) => {
        (c.subjects || []).forEach((s) => names.add(s.name));
        (c.sections || []).forEach((sec) => (sec.subjects || []).forEach((s) => names.add(s.name)));
      });
    }
    return [...names].sort().map((n) => ({ value: n, label: n }));
  }, [allRows, filters.subject, isAdmin, teacherClasses]);

  // Client-side quick search over the loaded page (title / subject / class / teacher)
  const rows = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return allRows;
    return allRows.filter((r) => [r.title, r.subject_name, r.class_name, r.section_name, r.teacher_name].some((v) => String(v || '').toLowerCase().includes(q)));
  }, [allRows, search]);

  // ── Mutations ──
  const invalidate = () => qc.invalidateQueries({ queryKey: ['test-records'] });

  const saveMut = useMutation({
    mutationFn: (body) => (editing ? svc.update(editing.id, body) : svc.create(body)),
    onSuccess: (res) => {
      toast.success(editing ? 'Test record updated' : 'Test record created');
      const created = !editing ? res?.data : null;
      setFormOpen(false);
      setEditing(null);
      invalidate();
      if (created?.id) router.push(viewHref(created.id)); // jump to the new test to enter marks
    },
    onError: (e) => {
      const msg = getTestRecordError(e, 'Failed to save');
      setFormError(msg);
      toast.error(msg);
    },
  });
  const deleteMut = useMutation({
    mutationFn: (t) => svc.remove(t.id),
    onSuccess: () => {
      toast.success('Test record deleted');
      setDeleting(null);
      invalidate();
    },
    onError: (e) => {
      toast.error(getTestRecordError(e, 'Failed to delete'));
      setDeleting(null);
    },
  });
  const publishMut = useMutation({
    mutationFn: ({ t, publish }) => (publish ? testRecordService.publish(t.id) : testRecordService.unpublish(t.id)),
    onSuccess: (_r, { publish }) => {
      toast.success(publish ? 'Test published' : 'Test unpublished');
      invalidate();
    },
    onError: (e) => toast.error(getTestRecordError(e, 'Action failed')),
  });

  const openCreate = () => {
    setEditing(null);
    setFormError('');
    setFormOpen(true);
  };

  // ── Columns ──
  const columns = useMemo(
    () => [
      {
        id: 'title',
        header: 'Test',
        cell: ({ row }) => (
          <div>
            <p className="font-semibold text-slate-900">{row.original.title}</p>
            <p className="text-xs text-slate-500">{row.original.subject_name}</p>
          </div>
        ),
      },
      {
        id: 'class',
        header: 'Class – Section',
        cell: ({ row }) => (
          <span className="text-sm">
            {row.original.class_name}
            {row.original.section_name ? ` – ${row.original.section_name}` : ''}
          </span>
        ),
      },
      ...(isAdmin ? [{ id: 'teacher', header: 'Teacher', cell: ({ row }) => <span className="text-sm">{row.original.teacher_name || '—'}</span> }] : []),
      { id: 'date', header: 'Date', cell: ({ row }) => <span className="whitespace-nowrap text-sm">{fmtDate(row.original.test_date)}</span> },
      { id: 'total', header: 'Total', cell: ({ row }) => <span className="text-sm">{fmtNum(row.original.total_marks, 2)}</span> },
      { id: 'passing', header: 'Passing', cell: ({ row }) => <span className="text-sm">{fmtNum(row.original.passing_marks, 2)}</span> },
      {
        id: 'entered',
        header: 'Marks entered',
        cell: ({ row }) => {
          const s = row.original.stats || {};
          return (
            <span className="whitespace-nowrap text-sm">
              {s.entered_count ?? 0}/{s.total_students ?? 0}
              {s.absent_count > 0 && <span className="ml-1 text-xs text-amber-600">({s.absent_count} abs)</span>}
            </span>
          );
        },
      },
      { id: 'avg', header: 'Avg %', cell: ({ row }) => <span className="text-sm">{row.original.stats?.average_percentage == null ? '—' : `${fmtNum(row.original.stats.average_percentage)}%`}</span> },
      { id: 'status', header: 'Status', cell: ({ row }) => <StatusPill status={row.original.status} /> },
      {
        id: 'actions',
        header: '',
        enableHiding: false,
        cell: ({ row }) => {
          const t = row.original;
          const canMutate = isAdmin || t.status !== 'published';
          const noMarks = (t.stats?.entered_count ?? 0) === 0;
          return (
            <div className="flex justify-end">
              <TableRowActions
                onView={() => router.push(viewHref(t.id))}
                onEdit={
                  canMutate
                    ? () => {
                        setEditing(t);
                        setFormError('');
                        setFormOpen(true);
                      }
                    : undefined
                }
                onDelete={canMutate ? () => setDeleting(t) : undefined}
                extra={
                  isAdmin
                    ? t.status === 'published'
                      ? [{ label: 'Unpublish', icon: Undo2, onClick: () => publishMut.mutate({ t, publish: false }) }]
                      : noMarks
                        ? []
                        : [{ label: 'Publish', icon: Send, onClick: () => publishMut.mutate({ t, publish: true }) }]
                    : []
                }
              />
            </div>
          );
        },
      },
    ],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [isAdmin, params?.type]
  );

  const tableFilters = [
    { name: 'class', label: 'Class', value: filters.class_id, onChange: setFilter('class_id'), options: classOptions },
    ...(filters.class_id && sectionOptions.length ? [{ name: 'section', label: 'Section', value: filters.section_id, onChange: setFilter('section_id'), options: sectionOptions }] : []),
    { name: 'subject', label: 'Subject', value: filters.subject, onChange: setFilter('subject'), options: subjectOptions },
    ...(isAdmin ? [{ name: 'teacher', label: 'Teacher', value: filters.teacher_id, onChange: setFilter('teacher_id'), options: teacherFilterOptions }] : []),
    { name: 'month', label: 'Month', value: filters.month, onChange: (v) => { setFilters((f) => ({ ...f, month: v, year: v && !f.year ? String(new Date().getFullYear()) : f.year })); setPage(1); }, options: MONTH_OPTIONS },
    { name: 'year', label: 'Year', value: filters.year, onChange: setFilter('year'), options: yearOptions() },
    { name: 'status', label: 'Status', value: filters.status, onChange: setFilter('status'), options: STATUS_OPTIONS },
  ];

  if (error && !data) return <ErrorBlock title="Couldn’t load test records" message={getTestRecordError(error, 'Could not load test records')} onRetry={refetch} />;

  return (
    <div className="space-y-4">
      <DataTable
        columns={columns}
        data={rows}
        loading={isLoading || isFetching}
        emptyMessage={isLoading ? 'Loading test records…' : 'No test records found. Click “Add Test Record” to schedule a class test.'}
        search={search}
        onSearch={setSearch}
        searchPlaceholder="Search tests, subjects, classes…"
        filters={tableFilters}
        action={
          <Button onClick={openCreate} className="bg-tca-primary text-white hover:bg-tca-primary/90">
            <Plus className="mr-2 h-4 w-4" /> Add Test Record
          </Button>
        }
        enableColumnVisibility
        pagination={{
          page,
          totalPages: pagination?.totalPages || 1,
          onPageChange: setPage,
          total: pagination?.total ?? rows.length,
          pageSize,
          onPageSizeChange: (s) => {
            setPageSize(s);
            setPage(1);
          },
        }}
      />

      <TestRecordFormModal
        open={formOpen}
        onClose={() => !saveMut.isPending && setFormOpen(false)}
        mode={mode}
        record={editing}
        branchId={activeBranchId}
        saving={saveMut.isPending}
        serverError={formError}
        onSubmit={(body) => {
          setFormError('');
          saveMut.mutate(body);
        }}
      />

      <ConfirmDialog
        open={!!deleting}
        onClose={() => setDeleting(null)}
        onConfirm={() => deleteMut.mutate(deleting)}
        loading={deleteMut.isPending}
        title="Delete test record"
        description={`Delete “${deleting?.title}”? Its saved marks will be removed too.`}
        confirmLabel="Delete"
      />
    </div>
  );
}
