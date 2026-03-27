'use client';
/**
 * ProgramsPage — College/University programs management
 */
import { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import { Plus, Pencil, Trash2, Layers } from 'lucide-react';
import useAuthStore from '@/store/authStore';
import DataTable from '@/components/common/DataTable';
import PageHeader from '@/components/common/PageHeader';
import AppModal from '@/components/common/AppModal';
import SelectField from '@/components/common/SelectField';
import StatsCard from '@/components/common/StatsCard';
import { cn } from '@/lib/utils';
import { DUMMY_PROGRAMS } from '@/data/dummyData';

const STATUS_OPTS  = [{ value:'active', label:'Active' }, { value:'inactive', label:'Inactive' }];
const DEGREE_OPTS  = [{ value:'associate', label:'Associate' }, { value:'bachelor', label:"Bachelor's" }, { value:'master', label:"Master's" }, { value:'phd', label:'PhD' }, { value:'diploma', label:'Diploma' }, { value:'certificate', label:'Certificate' }];

const schema = z.object({
  name:        z.string().min(2, 'Required'),
  code:        z.string().min(1, 'Required'),
  degree_type: z.string().min(1, 'Required'),
  duration:    z.string().optional(),
  department:  z.string().optional(),
  intake:      z.coerce.number().optional(),
  status:      z.string().min(1, 'Required'),
  description: z.string().optional(),
});



export default function ProgramsPage({ type }) {
  const qc    = useQueryClient();
  const canDo = useAuthStore((s) => s.canDo);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [page,   setPage]   = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [modal,  setModal]  = useState(false);
  const [editing,setEditing]= useState(null);
  const [deleting, setDeleting] = useState(null);

  const { register, handleSubmit, control, reset, formState: { errors } } = useForm({ resolver: zodResolver(schema), defaultValues: { status:'active', degree_type:'bachelor' } });

  const { data, isLoading } = useQuery({
    queryKey: ['programs', type, page, pageSize, search, status],
    queryFn: async () => {
      try { const { programService } = await import('@/services'); return await programService.getAll({ page, limit: pageSize, search, status }); }
      catch {
        const d = DUMMY_PROGRAMS.filter(r => (!search || r.name.toLowerCase().includes(search.toLowerCase())) && (!status || r.status === status));
        const slice = d.slice((page-1)*pageSize, page*pageSize);
        return { data: { rows: slice, total: d.length, totalPages: Math.max(1, Math.ceil(d.length / pageSize)) } };
      }
    },
    placeholderData: (p) => p,
  });

  const rows = data?.data?.rows ?? DUMMY_PROGRAMS;
  const total = data?.data?.total ?? rows.length;
  const totalPages = data?.data?.totalPages ?? 1;

  const save = useMutation({
    mutationFn: async (vals) => {
      try { const { programService } = await import('@/services'); return editing ? await programService.update(editing.id, vals) : await programService.create(vals); }
      catch { return { data: vals }; }
    },
    onSuccess: () => { toast.success(editing ? 'Updated' : 'Created'); qc.invalidateQueries({ queryKey: ['programs'] }); closeModal(); },
    onError: () => toast.error('Save failed'),
  });

  const remove = useMutation({
    mutationFn: async (id) => {
      try { const { programService } = await import('@/services'); return await programService.delete(id); }
      catch { return { success: true }; }
    },
    onSuccess: () => { toast.success('Deleted'); qc.invalidateQueries({ queryKey: ['programs'] }); setDeleting(null); },
    onError: () => toast.error('Delete failed'),
  });

  const openAdd  = () => { setEditing(null); reset({ status:'active', degree_type:'bachelor' }); setModal(true); };
  const openEdit = (row) => { setEditing(row); reset({ ...row }); setModal(true); };
  const closeModal = () => { setModal(false); setEditing(null); reset(); };

  const columns = useMemo(() => [
    { accessorKey: 'name', header: 'Program', cell: ({ row: { original: r } }) => <div><p className="font-medium">{r.name}</p><p className="text-xs text-muted-foreground font-mono">{r.code}</p></div> },
    { accessorKey: 'degree_type', header: 'Degree Type', cell: ({ getValue }) => <span className="capitalize">{getValue()}</span> },
    { accessorKey: 'department',  header: 'Department',  cell: ({ getValue }) => getValue() || '—' },
    { accessorKey: 'duration',    header: 'Duration',    cell: ({ getValue }) => getValue() || '—' },
    { accessorKey: 'enrolled',    header: 'Enrolled',    cell: ({ getValue }) => getValue() ?? 0 },
    { accessorKey: 'status', header: 'Status', cell: ({ getValue }) => <span className={cn('rounded-full px-2 py-0.5 text-xs font-medium capitalize', getValue() === 'active' ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700')}>{getValue()}</span> },
    { id: 'actions', header: 'Actions', enableHiding: false, cell: ({ row }) => (
      <div className="flex items-center justify-end gap-1">
        {canDo('program.update') && <button onClick={() => openEdit(row.original)} className="rounded p-1.5 hover:bg-accent" title="Edit"><Pencil size={13} /></button>}
        {canDo('program.delete') && <button onClick={() => setDeleting(row.original)} className="rounded p-1.5 text-destructive hover:bg-destructive/10" title="Delete"><Trash2 size={13} /></button>}
      </div>
    )},
  ], [canDo]);

  return (
    <div className="space-y-5">
      <PageHeader title="Programs" description={`${total} programs offered`} />
      <div className="grid gap-4 sm:grid-cols-3">
        <StatsCard label="Total Programs"  value={total}                                          icon={<Layers size={18} />} />
        <StatsCard label="Active"          value={rows.filter(r => r.status === 'active').length}     icon={<Layers size={18} />} />
        <StatsCard label="Total Enrolled"  value={rows.reduce((s, r) => s + (r.enrolled ?? 0), 0)}   icon={<Layers size={18} />} />
      </div>
      <DataTable columns={columns} data={rows} loading={isLoading} emptyMessage="No programs found"
        search={search} onSearch={(v) => { setSearch(v); setPage(1); }} searchPlaceholder="Search programs…"
        filters={[{ name:'status', label:'Status', value:status, onChange:(v) => { setStatus(v); setPage(1); }, options:STATUS_OPTS }]}
        action={canDo('program.create') ? <button onClick={openAdd} className="flex items-center gap-1.5 rounded-md bg-primary px-3 py-2 text-sm font-semibold text-primary-foreground hover:opacity-90"><Plus size={14} /> New Program</button> : null}
        enableColumnVisibility
        exportConfig={{ fileName: 'programs' }}
        pagination={{ page, totalPages, onPageChange: setPage, total, pageSize, onPageSizeChange: (s) => { setPageSize(s); setPage(1); } }} />

      <AppModal open={modal} onClose={closeModal} title={editing ? 'Edit Program' : 'New Program'} size="lg"
        footer={<><button type="button" onClick={closeModal} className="rounded-md border px-4 py-2 text-sm hover:bg-accent">Cancel</button><button type="submit" form="prog-form" disabled={save.isPending} className="rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:opacity-90 disabled:opacity-60">{save.isPending ? 'Saving…' : editing ? 'Update' : 'Create'}</button></>}>
        <form id="prog-form" onSubmit={handleSubmit((v) => save.mutate(v))} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5"><label className="text-sm font-medium">Program Name *</label><input {...register('name')} className="input-base" />{errors.name && <p className="text-xs text-destructive">{errors.name.message}</p>}</div>
            <div className="space-y-1.5"><label className="text-sm font-medium">Code *</label><input {...register('code')} className="input-base" />{errors.code && <p className="text-xs text-destructive">{errors.code.message}</p>}</div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <SelectField label="Degree Type *" name="degree_type" control={control} error={errors.degree_type} options={DEGREE_OPTS} required />
            <div className="space-y-1.5"><label className="text-sm font-medium">Duration</label><input {...register('duration')} className="input-base" placeholder="e.g. 4 years" /></div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5"><label className="text-sm font-medium">Department</label><input {...register('department')} className="input-base" /></div>
            <div className="space-y-1.5"><label className="text-sm font-medium">Intake Capacity</label><input type="number" {...register('intake')} className="input-base" /></div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <SelectField label="Status *" name="status" control={control} error={errors.status} options={STATUS_OPTS} required />
          </div>
          <div className="space-y-1.5"><label className="text-sm font-medium">Description</label><textarea {...register('description')} rows={2} className="w-full rounded-md border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring resize-none" /></div>
        </form>
      </AppModal>

      {/* Delete Confirm */}
      <AppModal open={!!deleting} onClose={() => setDeleting(null)} title="Delete Program" size="sm"
        footer={
          <>
            <button onClick={() => setDeleting(null)} className="rounded-md border px-4 py-2 text-sm hover:bg-accent">Cancel</button>
            <button onClick={() => remove.mutate(deleting.id)} disabled={remove.isPending} className="rounded-md bg-destructive px-4 py-2 text-sm font-semibold text-white hover:opacity-90 disabled:opacity-60">
              {remove.isPending ? 'Deleting\u2026' : 'Delete'}
            </button>
          </>
        }>
        <p className="text-sm text-muted-foreground">Delete program <strong>{deleting?.name}</strong>? This cannot be undone.</p>
      </AppModal>
    </div>
  );
}
