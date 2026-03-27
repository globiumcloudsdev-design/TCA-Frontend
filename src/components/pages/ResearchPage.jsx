'use client';
/**
 * ResearchPage — University research projects & publications
 */
import { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import { Plus, Pencil, Trash2, FlaskConical, BookOpen, Award } from 'lucide-react';
import useAuthStore from '@/store/authStore';
import DataTable from '@/components/common/DataTable';
import PageHeader from '@/components/common/PageHeader';
import AppModal from '@/components/common/AppModal';
import SelectField from '@/components/common/SelectField';
import DatePickerField from '@/components/common/DatePickerField';
import StatsCard from '@/components/common/StatsCard';
import { cn } from '@/lib/utils';
import { DUMMY_RESEARCH } from '@/data/dummyData';

const STATUS_OPTS = [{ value:'ongoing', label:'Ongoing' }, { value:'completed', label:'Completed' }, { value:'proposed', label:'Proposed' }, { value:'cancelled', label:'Cancelled' }];
const TYPE_OPTS   = [{ value:'project', label:'Research Project' }, { value:'paper', label:'Research Paper' }, { value:'thesis', label:'PhD Thesis' }, { value:'grant', label:'Grant/Funded' }];
const STATUS_COLORS = { ongoing:'bg-blue-100 text-blue-700', completed:'bg-emerald-100 text-emerald-700', proposed:'bg-amber-100 text-amber-700', cancelled:'bg-red-100 text-red-700' };

const schema = z.object({
  title:       z.string().min(5, 'Required'),
  type:        z.string().min(1, 'Required'),
  researcher:  z.string().min(2, 'Required'),
  department:  z.string().optional(),
  start_date:  z.string().optional(),
  end_date:    z.string().optional(),
  budget:      z.coerce.number().optional(),
  status:      z.string().min(1, 'Required'),
  description: z.string().optional(),
});



export default function ResearchPage({ type }) {
  const qc    = useQueryClient();
  const canDo = useAuthStore((s) => s.canDo);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [page,   setPage]   = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [modal,  setModal]  = useState(false);
  const [editing,setEditing]= useState(null);
  const [deleting, setDeleting] = useState(null);

  const { register, handleSubmit, control, reset, formState: { errors } } = useForm({ resolver: zodResolver(schema), defaultValues: { status:'proposed', type:'project' } });

  const { data, isLoading } = useQuery({
    queryKey: ['research', type, page, pageSize, search, status],
    queryFn: async () => {
      try { const { researchService } = await import('@/services'); return await researchService.getAll({ page, limit: pageSize, search, status }); }
      catch {
        const d = DUMMY_RESEARCH.filter(r => (!search || r.title.toLowerCase().includes(search.toLowerCase())) && (!status || r.status === status));
        const slice = d.slice((page-1)*pageSize, page*pageSize);
        return { data: { rows: slice, total: d.length, totalPages: Math.max(1, Math.ceil(d.length / pageSize)) } };
      }
    },
    placeholderData: (p) => p,
  });

  const rows = data?.data?.rows ?? DUMMY_RESEARCH;
  const total = data?.data?.total ?? rows.length;
  const totalPages = data?.data?.totalPages ?? 1;

  const save = useMutation({
    mutationFn: async (vals) => {
      try { const { researchService } = await import('@/services'); return editing ? await researchService.update(editing.id, vals) : await researchService.create(vals); }
      catch { return { data: vals }; }
    },
    onSuccess: () => { toast.success(editing ? 'Updated' : 'Created'); qc.invalidateQueries({ queryKey: ['research'] }); closeModal(); },
    onError: () => toast.error('Save failed'),
  });

  const remove = useMutation({
    mutationFn: async (id) => {
      try { const { researchService } = await import('@/services'); return await researchService.delete(id); }
      catch { return { success: true }; }
    },
    onSuccess: () => { toast.success('Deleted'); qc.invalidateQueries({ queryKey: ['research'] }); setDeleting(null); },
    onError: () => toast.error('Delete failed'),
  });

  const openAdd  = () => { setEditing(null); reset({ status:'proposed', type:'project' }); setModal(true); };
  const openEdit = (row) => { setEditing(row); reset({ ...row }); setModal(true); };
  const closeModal = () => { setModal(false); setEditing(null); reset(); };

  const totalBudget = useMemo(() => rows.reduce((s, r) => s + (r.budget ?? 0), 0), [rows]);

  const columns = useMemo(() => [
    { accessorKey: 'title', header: 'Research Title', cell: ({ row: { original: r } }) => <div><p className="font-medium line-clamp-1">{r.title}</p><p className="text-xs text-muted-foreground capitalize">{r.type?.replace('_',' ')}</p></div> },
    { accessorKey: 'researcher',  header: 'Researcher',   cell: ({ getValue }) => getValue() || '—' },
    { accessorKey: 'department',  header: 'Department',   cell: ({ getValue }) => getValue() || '—' },
    { accessorKey: 'budget',      header: 'Budget',       cell: ({ getValue }) => getValue() ? `PKR ${getValue().toLocaleString()}` : 'N/A' },
    { accessorKey: 'start_date',  header: 'Period',       cell: ({ row: { original: r } }) => r.start_date ? `${new Date(r.start_date).getFullYear()} – ${r.end_date ? new Date(r.end_date).getFullYear() : '…'}` : '—' },
    { accessorKey: 'status', header: 'Status', cell: ({ getValue }) => { const s = getValue(); return <span className={cn('rounded-full px-2 py-0.5 text-xs font-medium capitalize', STATUS_COLORS[s])}>{s}</span>; } },
    { id: 'actions', header: 'Actions', enableHiding: false, cell: ({ row }) => (
      <div className="flex items-center justify-end gap-1">
        {canDo('research.update') && <button onClick={() => openEdit(row.original)} className="rounded p-1.5 hover:bg-accent" title="Edit"><Pencil size={13} /></button>}
        {canDo('research.delete') && <button onClick={() => setDeleting(row.original)} className="rounded p-1.5 text-destructive hover:bg-destructive/10" title="Delete"><Trash2 size={13} /></button>}
      </div>
    )},
  ], [canDo]);

  return (
    <div className="space-y-5">
      <PageHeader title="Research & Publications" description={`${total} projects / papers`} />
      <div className="grid gap-4 sm:grid-cols-3">
        <StatsCard label="Total Projects"  value={total}                                              icon={<FlaskConical size={18} />} />
        <StatsCard label="Ongoing"         value={rows.filter(r => r.status === 'ongoing').length}    icon={<BookOpen size={18} />} />
        <StatsCard label="Total Budget"    value={`PKR ${totalBudget.toLocaleString()}`}             icon={<Award size={18} />} />
      </div>
      <DataTable columns={columns} data={rows} loading={isLoading} emptyMessage="No research records found"
        search={search} onSearch={(v) => { setSearch(v); setPage(1); }} searchPlaceholder="Search research…"
        filters={[{ name:'status', label:'Status', value:status, onChange:(v) => { setStatus(v); setPage(1); }, options:STATUS_OPTS }]}
        action={canDo('research.create') ? <button onClick={openAdd} className="flex items-center gap-1.5 rounded-md bg-primary px-3 py-2 text-sm font-semibold text-primary-foreground hover:opacity-90"><Plus size={14} /> New Research</button> : null}
        enableColumnVisibility
        exportConfig={{ fileName: 'research' }}
        pagination={{ page, totalPages, onPageChange: setPage, total, pageSize, onPageSizeChange: (s) => { setPageSize(s); setPage(1); } }} />

      <AppModal open={modal} onClose={closeModal} title={editing ? 'Edit Research' : 'New Research'} size="xl"
        footer={<><button type="button" onClick={closeModal} className="rounded-md border px-4 py-2 text-sm hover:bg-accent">Cancel</button><button type="submit" form="res-form" disabled={save.isPending} className="rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:opacity-90 disabled:opacity-60">{save.isPending ? 'Saving…' : editing ? 'Update' : 'Submit'}</button></>}>
        <form id="res-form" onSubmit={handleSubmit((v) => save.mutate(v))} className="space-y-4">
          <div className="space-y-1.5"><label className="text-sm font-medium">Research Title *</label><input {...register('title')} className="input-base" />{errors.title && <p className="text-xs text-destructive">{errors.title.message}</p>}</div>
          <div className="grid grid-cols-2 gap-4">
            <SelectField label="Type *"   name="type"   control={control} error={errors.type}   options={TYPE_OPTS}   required />
            <SelectField label="Status *" name="status" control={control} error={errors.status} options={STATUS_OPTS} required />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5"><label className="text-sm font-medium">Researcher *</label><input {...register('researcher')} className="input-base" />{errors.researcher && <p className="text-xs text-destructive">{errors.researcher.message}</p>}</div>
            <div className="space-y-1.5"><label className="text-sm font-medium">Department</label><input {...register('department')} className="input-base" /></div>
          </div>
          <div className="grid grid-cols-3 gap-4">
            <DatePickerField label="Start Date" name="start_date" control={control} />
            <DatePickerField label="End Date"   name="end_date"   control={control} />
            <div className="space-y-1.5"><label className="text-sm font-medium">Budget (PKR)</label><input type="number" {...register('budget')} className="input-base" /></div>
          </div>
          <div className="space-y-1.5"><label className="text-sm font-medium">Description</label><textarea {...register('description')} rows={3} className="w-full rounded-md border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring resize-none" /></div>
        </form>
      </AppModal>

      {/* Delete Confirm */}
      <AppModal open={!!deleting} onClose={() => setDeleting(null)} title="Delete Research" size="sm"
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
