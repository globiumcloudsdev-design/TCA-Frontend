'use client';
/**
 * ExamsPage — Adaptive: School → Exams | Coaching → Tests | Academy → Assessments
 */
import { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import { Plus, Pencil, Trash2, GraduationCap } from 'lucide-react';
import useInstituteConfig from '@/hooks/useInstituteConfig';
import useAuthStore from '@/store/authStore';
import DataTable from '@/components/common/DataTable';
import PageHeader from '@/components/common/PageHeader';
import AppModal from '@/components/common/AppModal';
import SelectField from '@/components/common/SelectField';
import DatePickerField from '@/components/common/DatePickerField';
import StatsCard from '@/components/common/StatsCard';
import { cn } from '@/lib/utils';
import { DUMMY_EXAMS } from '@/data/dummyData';

const EXAM_TYPES = [
  { value:'midterm',  label:'Midterm' }, { value:'final',    label:'Final' },
  { value:'unit',     label:'Unit Test' }, { value:'quiz',   label:'Quiz' },
  { value:'monthly',  label:'Monthly' }, { value:'practice', label:'Practice' },
];
const STATUS_OPTS = [{ value:'scheduled', label:'Scheduled' }, { value:'ongoing', label:'Ongoing' }, { value:'completed', label:'Completed' }];
const STATUS_COLORS = { scheduled:'bg-blue-100 text-blue-700', ongoing:'bg-amber-100 text-amber-700', completed:'bg-emerald-100 text-emerald-700' };

const schema = z.object({
  title:      z.string().min(3, 'Required'),
  type:       z.string().min(1, 'Required'),
  subject:    z.string().min(1, 'Required'),
  class_name: z.string().min(1, 'Required'),
  total_marks:z.coerce.number().min(1, 'Required'),
  pass_marks: z.coerce.number().min(1, 'Required'),
  status:     z.string().min(1, 'Required'),
  exam_date:  z.string().optional(),
});



export default function ExamsPage({ type }) {
  const qc    = useQueryClient();
  const canDo = useAuthStore((s) => s.canDo);
  const { terms } = useInstituteConfig();
  const label  = type === 'coaching' ? 'Test' : type === 'academy' ? 'Assessment' : 'Exam';
  const labelP = type === 'coaching' ? 'Tests' : type === 'academy' ? 'Assessments' : 'Exams';

  const [search, setSearch]   = useState('');
  const [status, setStatus]   = useState('');
  const [page,   setPage]     = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [modal,   setModal]   = useState(false);
  const [editing, setEditing] = useState(null);
  const [deleting,setDeleting]= useState(null);

  const { register, handleSubmit, control, reset, formState: { errors } } = useForm({ resolver: zodResolver(schema), defaultValues: { status:'scheduled', total_marks:100, pass_marks:40 } });

  const { data, isLoading } = useQuery({
    queryKey: ['exams', type, page, pageSize, search, status],
    queryFn: async () => {
      try {
        const { examService } = await import('@/services');
        return await examService.getAll({ page, limit: pageSize, search, status });
      } catch {
        const d = DUMMY_EXAMS.filter(r => (!search || r.title.toLowerCase().includes(search.toLowerCase())) && (!status || r.status === status));
        const slice = d.slice((page-1)*pageSize, page*pageSize);
        return { data: { rows: slice, total: d.length, totalPages: Math.max(1, Math.ceil(d.length / pageSize)) } };
      }
    },
    placeholderData: (p) => p,
  });

  const rows = data?.data?.rows ?? DUMMY_EXAMS;
  const total = data?.data?.total ?? rows.length;
  const totalPages = data?.data?.totalPages ?? 1;

  const save = useMutation({
    mutationFn: async (vals) => {
      try { const { examService } = await import('@/services'); return editing ? await examService.update(editing.id, vals) : await examService.create(vals); }
      catch { return { data: vals }; }
    },
    onSuccess: () => { toast.success(editing ? 'Updated' : 'Created'); qc.invalidateQueries({ queryKey: ['exams'] }); closeModal(); },
    onError: () => toast.error('Save failed'),
  });

  const remove = useMutation({
    mutationFn: async (id) => {
      try { const { examService } = await import('@/services'); return await examService.delete(id); }
      catch { return { success: true }; }
    },
    onSuccess: () => { toast.success('Deleted'); qc.invalidateQueries({ queryKey: ['exams'] }); setDeleting(null); },
    onError: () => toast.error('Delete failed'),
  });

  const openAdd  = () => { setEditing(null); reset({ status:'scheduled', total_marks:100, pass_marks:40 }); setModal(true); };
  const openEdit = (row) => { setEditing(row); reset({ ...row }); setModal(true); };
  const closeModal = () => { setModal(false); setEditing(null); reset(); };

  const columns = useMemo(() => [
    { accessorKey: 'title', header: `${label} Title`, cell: ({ getValue }) => <span className="font-medium">{getValue()}</span> },
    { accessorKey: 'type',       header: 'Type',       cell: ({ getValue }) => <span className="capitalize">{getValue()}</span> },
    { accessorKey: 'subject',    header: 'Subject' },
    { accessorKey: 'class_name', header: terms.primary_unit },
    { accessorKey: 'total_marks',header: 'Total Marks' },
    { accessorKey: 'exam_date',  header: 'Date', cell: ({ getValue }) => getValue() ? new Date(getValue()).toLocaleDateString('en-PK') : '—' },
    { accessorKey: 'status', header: 'Status', cell: ({ getValue }) => { const s = getValue(); return <span className={cn('rounded-full px-2 py-0.5 text-xs font-medium capitalize', STATUS_COLORS[s])}>{s}</span>; } },
    { id: 'actions', header: 'Actions', enableHiding: false, cell: ({ row }) => (
      <div className="flex items-center justify-end gap-1">
        {canDo('exams.update') && <button onClick={() => openEdit(row.original)} className="rounded p-1.5 hover:bg-accent" title="Edit"><Pencil size={13} /></button>}
        {canDo('exams.delete') && <button onClick={() => setDeleting(row.original)} className="rounded p-1.5 text-destructive hover:bg-destructive/10" title="Delete"><Trash2 size={13} /></button>}
      </div>
    )},
  ], [canDo, label, terms.primary_unit]);

  const counts = useMemo(() => ({ scheduled: rows.filter(r => r.status === 'scheduled').length, ongoing: rows.filter(r => r.status === 'ongoing').length, completed: rows.filter(r => r.status === 'completed').length }), [rows]);

  return (
    <div className="space-y-5">
      <PageHeader title={labelP} description={`${total} total`} />
      <div className="grid gap-4 sm:grid-cols-3">
        <StatsCard label="Scheduled"  value={counts.scheduled}  icon={<GraduationCap size={18} />} />
        <StatsCard label="Ongoing"    value={counts.ongoing}    icon={<GraduationCap size={18} />} />
        <StatsCard label="Completed"  value={counts.completed}  icon={<GraduationCap size={18} />} />
      </div>
      <DataTable columns={columns} data={rows} loading={isLoading} emptyMessage={`No ${labelP.toLowerCase()} found`}
        search={search} onSearch={(v) => { setSearch(v); setPage(1); }} searchPlaceholder={`Search ${labelP.toLowerCase()}…`}
        filters={[{ name:'status', label:'Status', value:status, onChange:(v) => { setStatus(v); setPage(1); }, options:STATUS_OPTS }]}
        action={canDo('exams.create') ? <button onClick={openAdd} className="flex items-center gap-1.5 rounded-md bg-primary px-3 py-2 text-sm font-semibold text-primary-foreground hover:opacity-90"><Plus size={14} /> New {label}</button> : null}
        enableColumnVisibility
        exportConfig={{ fileName: 'exams' }}
        pagination={{ page, totalPages, onPageChange: setPage, total, pageSize, onPageSizeChange: (s) => { setPageSize(s); setPage(1); } }} />

      <AppModal open={modal} onClose={closeModal} title={editing ? `Edit ${label}` : `New ${label}`} size="lg"
        footer={<><button type="button" onClick={closeModal} className="rounded-md border px-4 py-2 text-sm hover:bg-accent">Cancel</button><button type="submit" form="exam-form" disabled={save.isPending} className="rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:opacity-90 disabled:opacity-60">{save.isPending ? 'Saving…' : editing ? 'Update' : 'Create'}</button></>}>
        <form id="exam-form" onSubmit={handleSubmit((v) => save.mutate(v))} className="space-y-4">
          <div className="space-y-1.5"><label className="text-sm font-medium">{label} Title *</label><input {...register('title')} className="input-base" />{errors.title && <p className="text-xs text-destructive">{errors.title.message}</p>}</div>
          <div className="grid grid-cols-2 gap-4">
            <SelectField label="Type" name="type" control={control} error={errors.type} options={EXAM_TYPES} required />
            <div className="space-y-1.5"><label className="text-sm font-medium">Subject *</label><input {...register('subject')} className="input-base" />{errors.subject && <p className="text-xs text-destructive">{errors.subject.message}</p>}</div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5"><label className="text-sm font-medium">{terms.primary_unit} *</label><input {...register('class_name')} className="input-base" />{errors.class_name && <p className="text-xs text-destructive">{errors.class_name.message}</p>}</div>
            <DatePickerField label="Exam Date" name="exam_date" control={control} />
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-1.5"><label className="text-sm font-medium">Total Marks *</label><input type="number" {...register('total_marks')} className="input-base" />{errors.total_marks && <p className="text-xs text-destructive">{errors.total_marks.message}</p>}</div>
            <div className="space-y-1.5"><label className="text-sm font-medium">Pass Marks *</label><input type="number" {...register('pass_marks')} className="input-base" />{errors.pass_marks && <p className="text-xs text-destructive">{errors.pass_marks.message}</p>}</div>
            <SelectField label="Status" name="status" control={control} error={errors.status} options={STATUS_OPTS} required />
          </div>
        </form>
      </AppModal>

      {/* Delete Confirm */}
      <AppModal open={!!deleting} onClose={() => setDeleting(null)} title={`Delete ${label}`} size="sm"
        footer={
          <>
            <button onClick={() => setDeleting(null)} className="rounded-md border px-4 py-2 text-sm hover:bg-accent">Cancel</button>
            <button onClick={() => remove.mutate(deleting.id)} disabled={remove.isPending} className="rounded-md bg-destructive px-4 py-2 text-sm font-semibold text-white hover:opacity-90 disabled:opacity-60">
              {remove.isPending ? 'Deleting\u2026' : 'Delete'}
            </button>
          </>
        }>
        <p className="text-sm text-muted-foreground">Delete <strong>{deleting?.title}</strong>? This cannot be undone.</p>
      </AppModal>
    </div>
  );
}
