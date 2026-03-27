'use client';

import { useState, useEffect, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, BookOpen, FileText, Upload, ExternalLink } from 'lucide-react';
import { toast } from 'sonner';

import { subjectService, classService, teacherService } from '@/services';
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
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';

const extractRows  = (d) => d?.data?.rows ?? d?.data ?? [];
const extractPages = (d) => d?.data?.totalPages ?? 1;

/* ── columns ─────────────────────────────────────────────────── */
const buildColumns = (onEdit, onDelete, onSyllabus, canDelete) => [
  {
    id: 'subject',
    header: 'Subject',
    cell: ({ row }) => {
      const s = row.original;
      return (
        <div>
          <p className="font-semibold text-sm">{s.name}</p>
          {s.code && <p className="text-xs text-muted-foreground font-mono">{s.code}</p>}
        </div>
      );
    },
  },
  {
    id: 'class',
    header: 'Class',
    cell: ({ row }) => (
      <span className="text-sm">{row.original.class?.name ?? row.original.class_id ?? '—'}</span>
    ),
  },
  {
    id: 'teacher',
    header: 'Teacher',
    cell: ({ row }) => {
      const t = row.original.teacher;
      if (!t) return <span className="text-sm text-muted-foreground">—</span>;
      return (
        <span className="text-sm">
          {t.first_name} {t.last_name}
        </span>
      );
    },
  },
  {
    id: 'description',
    header: 'Description',
    cell: ({ row }) => (
      <span className="text-sm text-muted-foreground line-clamp-1 max-w-[200px]">
        {row.original.description ?? '—'}
      </span>
    ),
  },
  {
    id: 'syllabus',
    header: 'Syllabus',
    cell: ({ row }) => {
      const s = row.original;
      const hasSyllabus = s.syllabus_type === 'text' ? !!s.syllabus_content : !!s.syllabus_file_url;
      return (
        <Button
          variant="ghost"
          size="sm"
          className="text-xs gap-1.5"
          onClick={(e) => { e.stopPropagation(); onSyllabus(s); }}
        >
          {s.syllabus_type === 'file' ? (
            <FileText className="w-3.5 h-3.5" />
          ) : (
            <BookOpen className="w-3.5 h-3.5" />
          )}
          {hasSyllabus ? 'View' : 'Add'}
        </Button>
      );
    },
  },
  {
    id: 'status',
    header: 'Status',
    cell: ({ row }) => (
      <StatusBadge status={row.original.is_active !== false ? 'active' : 'inactive'} />
    ),
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

/* ── Page ────────────────────────────────────────────────────── */
export default function SubjectsPage() {
  const qc = useQueryClient();

  const canCreate = useAuthStore((s) => s.canDo(PERMISSIONS.SUBJECT_CREATE));
  const canDelete = useAuthStore((s) => s.canDo(PERMISSIONS.SUBJECT_DELETE));
  const { activeBranchId } = useUIStore();

  const [mounted, setMounted] = useState(false);
  useEffect(() => { setMounted(true); }, []);

  const [page,        setPage]        = useState(1);
  const [pageSize,    setPageSize]    = useState(15);
  const [search,      setSearch]      = useState('');
  const [classFilter, setClassFilter] = useState('');

  const [createOpen,    setCreateOpen]    = useState(false);
  const [editTarget,    setEditTarget]    = useState(null);
  const [deleteTarget,  setDeleteTarget]  = useState(null);
  const [syllabusTarget,setSyllabusTarget]= useState(null); // subject whose syllabus we're editing

  /* ── Queries ── */
  const { data, isLoading } = useQuery({
    queryKey: ['subjects', { page, pageSize, search, classFilter, activeBranchId }],
    queryFn:  () =>
      subjectService.getAll({
        page,
        limit:     pageSize,
        search:    search    || undefined,
        class_id:  classFilter || undefined,
        branch_id: activeBranchId || undefined,
      }),
  });

  const { data: classesData } = useQuery({
    queryKey: ['classes-all'],
    queryFn:  () => classService.getAll({ limit: 100 }),
  });

  const { data: teachersData } = useQuery({
    queryKey: ['teachers-all'],
    queryFn:  () => teacherService.getAll({ limit: 100 }),
  });

  const subjects   = extractRows(data);
  const totalPages = extractPages(data);
  const total      = data?.data?.total ?? subjects.length;
  const classes    = extractRows(classesData);
  const teachers   = extractRows(teachersData);

  /* ── Mutations ── */
  const createMutation = useMutation({
    mutationFn: subjectService.create,
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['subjects'] }); toast.success('Subject created'); setCreateOpen(false); },
    onError:   (e) => toast.error(e?.response?.data?.message ?? 'Failed to create subject'),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, body }) => subjectService.update(id, body),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['subjects'] }); toast.success('Subject updated'); setEditTarget(null); },
    onError:   (e) => toast.error(e?.response?.data?.message ?? 'Failed to update subject'),
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => subjectService.delete(id),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['subjects'] }); toast.success('Subject deleted'); setDeleteTarget(null); },
    onError:   (e) => toast.error(e?.response?.data?.message ?? 'Failed to delete subject'),
  });

  const syllabusMutation = useMutation({
    mutationFn: ({ id, body }) => subjectService.updateSyllabus(id, body),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['subjects'] }); toast.success('Syllabus saved'); setSyllabusTarget(null); },
    onError:   (e) => toast.error(e?.response?.data?.message ?? 'Failed to save syllabus'),
  });

  /* ── Column options ── */
  const classOptions   = classes.map((c) => ({ value: String(c.id), label: c.name }));
  const teacherOptions = teachers.map((t) => ({ value: String(t.id), label: `${t.first_name} ${t.last_name}` }));

  const columns = buildColumns(
    (s) => setEditTarget(s),
    (s) => setDeleteTarget(s),
    (s) => setSyllabusTarget(s),
    canDelete,
  );

  const filters = [{
    name: 'class',
    label: 'Class',
    value: classFilter,
    onChange: (v) => { setClassFilter(v); setPage(1); },
    options: classOptions,
  }];

  if (!mounted) return null;

  return (
    <div className="space-y-4">
      <PageHeader
        title="Subjects"
        description="Manage class subjects and syllabi"
        action={
          canCreate && (
            <Button onClick={() => setCreateOpen(true)} size="sm">
              <Plus className="w-4 h-4 mr-1.5" /> Add Subject
            </Button>
          )
        }
      />

      <DataTable
        columns={columns}
        data={subjects}
        loading={isLoading}
        search={search}
        onSearch={(v) => { setSearch(v); setPage(1); }}
        filters={filters}
        enableColumnVisibility
        exportConfig={{ fileName: 'subjects' }}
        pagination={{ page, totalPages, onPageChange: setPage, total, pageSize, onPageSizeChange: (s) => { setPageSize(s); setPage(1); } }}
      />

      {/* Create modal */}
      <AppModal open={createOpen} onClose={() => setCreateOpen(false)} title="Add Subject">
        <SubjectForm
          classOptions={classOptions}
          teacherOptions={teacherOptions}
          onSubmit={(body) => createMutation.mutate(body)}
          onCancel={() => setCreateOpen(false)}
          isLoading={createMutation.isPending}
        />
      </AppModal>

      {/* Edit modal */}
      <AppModal open={!!editTarget} onClose={() => setEditTarget(null)} title="Edit Subject">
        <SubjectForm
          defaultValues={editTarget}
          classOptions={classOptions}
          teacherOptions={teacherOptions}
          onSubmit={(body) => updateMutation.mutate({ id: editTarget.id, body })}
          onCancel={() => setEditTarget(null)}
          isLoading={updateMutation.isPending}
        />
      </AppModal>

      {/* Syllabus modal */}
      <AppModal
        open={!!syllabusTarget}
        onClose={() => setSyllabusTarget(null)}
        title={`Syllabus — ${syllabusTarget?.name ?? ''}`}
      >
        <SyllabusForm
          subject={syllabusTarget}
          onSubmit={(body) => syllabusMutation.mutate({ id: syllabusTarget.id, body })}
          onCancel={() => setSyllabusTarget(null)}
          isLoading={syllabusMutation.isPending}
        />
      </AppModal>

      {/* Delete confirm */}
      <ConfirmDialog
        open={!!deleteTarget}
        title="Delete Subject"
        description={`Delete subject "${deleteTarget?.name}"? This cannot be undone.`}
        confirmLabel="Delete"
        variant="destructive"
        isLoading={deleteMutation.isPending}
        onConfirm={() => deleteMutation.mutate(deleteTarget.id)}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
}

/* ── Subject Form ────────────────────────────────────────────── */
function SubjectForm({ defaultValues, classOptions, teacherOptions, onSubmit, onCancel, isLoading }) {
  const { control, register, handleSubmit, formState: { errors } } = useForm({
    defaultValues: {
      name:       defaultValues?.name        ?? '',
      code:       defaultValues?.code        ?? '',
      class_id:   defaultValues?.class_id    ? String(defaultValues.class_id)   : '',
      teacher_id: defaultValues?.teacher_id  ? String(defaultValues.teacher_id) : '',
      description:defaultValues?.description ?? '',
    },
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 py-1">
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <Label>Subject Name <span className="text-destructive">*</span></Label>
          <Input {...register('name', { required: 'Required' })} placeholder="e.g. Mathematics" />
          {errors.name && <p className="text-xs text-destructive">{errors.name.message}</p>}
        </div>
        <div className="space-y-1.5">
          <Label>Subject Code</Label>
          <Input {...register('code')} placeholder="e.g. MATH-6" />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <SelectField
          label="Class"
          name="class_id"
          control={control}
          error={errors.class_id}
          options={classOptions}
          placeholder="Select class…"
          required
        />
        <SelectField
          label="Subject Teacher"
          name="teacher_id"
          control={control}
          error={errors.teacher_id}
          options={teacherOptions}
          placeholder="Select teacher…"
        />
      </div>

      <div className="space-y-1.5">
        <Label>Description</Label>
        <Textarea
          {...register('description')}
          placeholder="Brief description of this subject…"
          rows={3}
          className="resize-none"
        />
      </div>

      <div className="flex justify-end gap-2 pt-2">
        <Button type="button" variant="outline" size="sm" onClick={onCancel} disabled={isLoading}>
          Cancel
        </Button>
        <Button type="submit" size="sm" disabled={isLoading}>
          {isLoading ? 'Saving…' : 'Save'}
        </Button>
      </div>
    </form>
  );
}

/* ── Syllabus Form ───────────────────────────────────────────── */
function SyllabusForm({ subject, onSubmit, onCancel, isLoading }) {
  const defaultTab   = subject?.syllabus_type === 'file' ? 'file' : 'text';
  const [tab,setTab] = useState(defaultTab);
  const [text, setText] = useState(subject?.syllabus_content ?? '');
  const [file, setFile] = useState(null);
  const fileRef = useRef(null);

  const handleSave = () => {
    if (tab === 'text') {
      onSubmit({ syllabus_type: 'text', syllabus_content: text });
    } else {
      if (!file && !subject?.syllabus_file_url) {
        toast.error('Please select a PDF file');
        return;
      }
      onSubmit({ syllabus_type: 'file', syllabus_file: file ?? undefined });
    }
  };

  return (
    <div className="space-y-4 py-1">
      <Tabs value={tab} onValueChange={setTab}>
        <TabsList className="w-full">
          <TabsTrigger value="text" className="flex-1 gap-1.5">
            <BookOpen className="w-4 h-4" /> Text / Outline
          </TabsTrigger>
          <TabsTrigger value="file" className="flex-1 gap-1.5">
            <FileText className="w-4 h-4" /> PDF File
          </TabsTrigger>
        </TabsList>

        {/* Text tab */}
        <TabsContent value="text" className="mt-3">
          <div className="space-y-1.5">
            <Label>Syllabus Content</Label>
            <Textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Enter chapter-wise syllabus outline…&#10;e.g.&#10;Chapter 1: Introduction&#10;Chapter 2: Topic Name"
              rows={10}
              className="font-mono text-sm resize-y"
            />
            <p className="text-xs text-muted-foreground">
              You can write chapter names, topics and any notes here.
            </p>
          </div>
        </TabsContent>

        {/* File tab */}
        <TabsContent value="file" className="mt-3">
          <div className="space-y-3">
            {subject?.syllabus_file_url && !file && (
              <div className="flex items-center gap-2 p-3 rounded-md border bg-muted/30 text-sm">
                <FileText className="w-4 h-4 text-muted-foreground" />
                <span className="flex-1 truncate text-muted-foreground">Current PDF attached</span>
                <a
                  href={subject.syllabus_file_url}
                  target="_blank"
                  rel="noreferrer"
                  className="text-primary text-xs flex items-center gap-1 hover:underline"
                >
                  Open <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            )}

            <div
              className="flex flex-col items-center justify-center gap-3 p-6 rounded-lg border-2 border-dashed border-muted hover:border-primary/50 transition-colors cursor-pointer"
              onClick={() => fileRef.current?.click()}
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => {
                e.preventDefault();
                const f = e.dataTransfer.files?.[0];
                if (f?.type === 'application/pdf') setFile(f);
                else toast.error('Please drop a PDF file');
              }}
            >
              <Upload className="w-8 h-8 text-muted-foreground" />
              {file ? (
                <p className="text-sm font-medium text-center">{file.name}</p>
              ) : (
                <p className="text-sm text-muted-foreground text-center">
                  Click or drag-and-drop a <strong>PDF</strong> file here
                </p>
              )}
              <input
                ref={fileRef}
                type="file"
                accept="application/pdf"
                className="hidden"
                onChange={(e) => {
                  const f = e.target.files?.[0];
                  if (f) setFile(f);
                }}
              />
            </div>

            <p className="text-xs text-muted-foreground">
              Only PDF files are supported. Max size: 10 MB.
            </p>
          </div>
        </TabsContent>
      </Tabs>

      <div className="flex justify-end gap-2 pt-1">
        <Button type="button" variant="outline" size="sm" onClick={onCancel} disabled={isLoading}>
          Cancel
        </Button>
        <Button size="sm" onClick={handleSave} disabled={isLoading}>
          {isLoading ? 'Saving…' : 'Save Syllabus'}
        </Button>
      </div>
    </div>
  );
}
