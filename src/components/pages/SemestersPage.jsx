'use client';
/**
 * SemestersPage — Semester management for college/university
 */
import { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import { Plus, Pencil, Trash2, CalendarCheck } from 'lucide-react';
import useAuthStore from '@/store/authStore';
import DataTable from '@/components/common/DataTable';
import PageHeader from '@/components/common/PageHeader';
import AppModal from '@/components/common/AppModal';
import SelectField from '@/components/common/SelectField';
import DatePickerField from '@/components/common/DatePickerField';
import StatsCard from '@/components/common/StatsCard';
import { cn } from '@/lib/utils';
import { DUMMY_SEMESTERS } from '@/data/dummyData';

const STATUS_OPTS = [{ value:'upcoming', label:'Upcoming' }, { value:'active', label:'Active' }, { value:'completed', label:'Completed' }];
const STATUS_COLORS = { upcoming:'bg-blue-100 text-blue-700', active:'bg-emerald-100 text-emerald-700', completed:'bg-gray-100 text-gray-600' };

const schema = z.object({
  name:       z.string().min(2, 'Required'),
  program:    z.string().optional(),
  year:       z.string().optional(),
  start_date: z.string().optional(),
  end_date:   z.string().optional(),
  status:     z.string().min(1, 'Required'),
});



export default function SemestersPage({ type }) {
  const qc    = useQueryClient();
  const canDo = useAuthStore((s) => s.canDo);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [page,   setPage]   = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [modal,  setModal]  = useState(false);
  const [editing,setEditing]= useState(null);
  const [deleting, setDeleting] = useState(null);

  const { register, handleSubmit, control, reset, formState: { errors } } = useForm({ resolver: zodResolver(schema), defaultValues: { status:'upcoming' } });

  const { data, isLoading } = useQuery({
    queryKey: ['semesters', type, page, pageSize, search, status],
    queryFn: async () => {
      try { const { semesterService } = await import('@/services'); return await semesterService.getAll({ page, limit: pageSize, search, status }); }
      catch {
        const d = DUMMY_SEMESTERS.filter(r => (!search || r.name.toLowerCase().includes(search.toLowerCase())) && (!status || r.status === status));
        const slice = d.slice((page-1)*pageSize, page*pageSize);
        return { data: { rows: slice, total: d.length, totalPages: Math.max(1, Math.ceil(d.length / pageSize)) } };
      }
    },
    placeholderData: (p) => p,
  });

  const rows = data?.data?.rows ?? DUMMY_SEMESTERS;
  const total = data?.data?.total ?? rows.length;
  const totalPages = data?.data?.totalPages ?? 1;

  const save = useMutation({
    mutationFn: async (vals) => {
      try { const { semesterService } = await import('@/services'); return editing ? await semesterService.update(editing.id, vals) : await semesterService.create(vals); }
      catch { return { data: vals }; }
    },
    onSuccess: () => { toast.success(editing ? 'Updated' : 'Created'); qc.invalidateQueries({ queryKey: ['semesters'] }); closeModal(); },
    onError: () => toast.error('Save failed'),
  });

  const remove = useMutation({
    mutationFn: async (id) => {
      try { const { semesterService } = await import('@/services'); return await semesterService.delete(id); }
      catch { return { success: true }; }
    },
    onSuccess: () => { toast.success('Deleted'); qc.invalidateQueries({ queryKey: ['semesters'] }); setDeleting(null); },
    onError: () => toast.error('Delete failed'),
  });

  const openAdd  = () => { setEditing(null); reset({ status:'upcoming' }); setModal(true); };
  const openEdit = (row) => { setEditing(row); reset({ ...row }); setModal(true); };
  const closeModal = () => { setModal(false); setEditing(null); reset(); };

  const columns = useMemo(() => [
    { accessorKey: 'name',    header: 'Semester', cell: ({ getValue }) => <span className="font-semibold">{getValue()}</span> },
    { accessorKey: 'program', header: 'Program',  cell: ({ getValue }) => getValue() || '—' },
    { accessorKey: 'year',    header: 'Year',     cell: ({ getValue }) => getValue() || '—' },
    { accessorKey: 'start_date', header: 'Start',  cell: ({ getValue }) => getValue() ? new Date(getValue()).toLocaleDateString('en-PK') : '—' },
    { accessorKey: 'end_date',   header: 'End',    cell: ({ getValue }) => getValue() ? new Date(getValue()).toLocaleDateString('en-PK') : '—' },
    { accessorKey: 'courses',    header: 'Courses', cell: ({ getValue }) => getValue() ?? 0 },
    { accessorKey: 'status', header: 'Status', cell: ({ getValue }) => { const s = getValue(); return <span className={cn('rounded-full px-2 py-0.5 text-xs font-medium capitalize', STATUS_COLORS[s])}>{s}</span>; } },
    { id: 'actions', header: 'Actions', enableHiding: false, cell: ({ row }) => (
      <div className="flex items-center justify-end gap-1">
        {canDo('semester.update') && <button onClick={() => openEdit(row.original)} className="rounded p-1.5 hover:bg-accent" title="Edit"><Pencil size={13} /></button>}
        {canDo('semester.delete') && <button onClick={() => setDeleting(row.original)} className="rounded p-1.5 text-destructive hover:bg-destructive/10" title="Delete"><Trash2 size={13} /></button>}
      </div>
    )},
  ], [canDo]);

  return (
    <div className="space-y-5">
      <PageHeader title="Semesters" description={`${total} semesters`} />
      <div className="grid gap-4 sm:grid-cols-3">
        <StatsCard label="Total"     value={total}                                              icon={<CalendarCheck size={18} />} />
        <StatsCard label="Active"    value={rows.filter(r => r.status === 'active').length}     icon={<CalendarCheck size={18} />} />
        <StatsCard label="Upcoming"  value={rows.filter(r => r.status === 'upcoming').length}   icon={<CalendarCheck size={18} />} />
      </div>
      <DataTable columns={columns} data={rows} loading={isLoading} emptyMessage="No semesters found"
        search={search} onSearch={(v) => { setSearch(v); setPage(1); }} searchPlaceholder="Search semesters…"
        filters={[{ name:'status', label:'Status', value:status, onChange:(v) => { setStatus(v); setPage(1); }, options:STATUS_OPTS }]}
        action={canDo('semester.create') ? <button onClick={openAdd} className="flex items-center gap-1.5 rounded-md bg-primary px-3 py-2 text-sm font-semibold text-primary-foreground hover:opacity-90"><Plus size={14} /> New Semester</button> : null}
        enableColumnVisibility
        exportConfig={{ fileName: 'semesters' }}
        pagination={{ page, totalPages, onPageChange: setPage, total, pageSize, onPageSizeChange: (s) => { setPageSize(s); setPage(1); } }} />

      <AppModal open={modal} onClose={closeModal} title={editing ? 'Edit Semester' : 'New Semester'} size="md"
        footer={<><button type="button" onClick={closeModal} className="rounded-md border px-4 py-2 text-sm hover:bg-accent">Cancel</button><button type="submit" form="sem-form" disabled={save.isPending} className="rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:opacity-90 disabled:opacity-60">{save.isPending ? 'Saving…' : editing ? 'Update' : 'Create'}</button></>}>
        <form id="sem-form" onSubmit={handleSubmit((v) => save.mutate(v))} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5"><label className="text-sm font-medium">Semester Name *</label><input {...register('name')} className="input-base" placeholder="e.g. Fall 2026" />{errors.name && <p className="text-xs text-destructive">{errors.name.message}</p>}</div>
            <div className="space-y-1.5"><label className="text-sm font-medium">Program</label><input {...register('program')} className="input-base" /></div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <DatePickerField label="Start Date" name="start_date" control={control} />
            <DatePickerField label="End Date"   name="end_date"   control={control} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5"><label className="text-sm font-medium">Year</label><input {...register('year')} className="input-base" placeholder="2026" /></div>
            <SelectField label="Status *" name="status" control={control} error={errors.status} options={STATUS_OPTS} required />
          </div>
        </form>
      </AppModal>

      {/* Delete Confirm */}
      <AppModal open={!!deleting} onClose={() => setDeleting(null)} title="Delete Semester" size="sm"
        footer={
          <>
            <button onClick={() => setDeleting(null)} className="rounded-md border px-4 py-2 text-sm hover:bg-accent">Cancel</button>
            <button onClick={() => remove.mutate(deleting.id)} disabled={remove.isPending} className="rounded-md bg-destructive px-4 py-2 text-sm font-semibold text-white hover:opacity-90 disabled:opacity-60">
              {remove.isPending ? 'Deleting\u2026' : 'Delete'}
            </button>
          </>
        }>
        <p className="text-sm text-muted-foreground">Delete semester <strong>{deleting?.name}</strong>? This cannot be undone.</p>
      </AppModal>
    </div>
  );
}
