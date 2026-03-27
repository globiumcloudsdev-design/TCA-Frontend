'use client';
/**
 * NoticesPage — School notices, circulars, announcements
 */
import { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import { Plus, Pencil, Trash2, Bell } from 'lucide-react';
import useAuthStore from '@/store/authStore';
import DataTable from '@/components/common/DataTable';
import PageHeader from '@/components/common/PageHeader';
import AppModal from '@/components/common/AppModal';
import SelectField from '@/components/common/SelectField';
import DatePickerField from '@/components/common/DatePickerField';
import StatsCard from '@/components/common/StatsCard';
import { cn } from '@/lib/utils';
import { DUMMY_NOTICES } from '@/data/dummyData';

const AUDIENCE_OPTS = [{ value:'all', label:'Everyone' }, { value:'students', label:'Students' }, { value:'teachers', label:'Teachers' }, { value:'parents', label:'Parents' }, { value:'staff', label:'Staff' }];
const PRIORITY_OPTS = [{ value:'low', label:'Low' }, { value:'normal', label:'Normal' }, { value:'high', label:'High' }, { value:'urgent', label:'Urgent' }];
const PRIORITY_COLORS = { low:'bg-gray-100 text-gray-600', normal:'bg-blue-100 text-blue-600', high:'bg-amber-100 text-amber-700', urgent:'bg-red-100 text-red-700' };

const schema = z.object({
  title:      z.string().min(5, 'Required'),
  content:    z.string().min(10, 'Required'),
  audience:   z.string().min(1, 'Required'),
  priority:   z.string().min(1, 'Required'),
  notice_date:z.string().optional(),
});



export default function NoticesPage({ type }) {
  const qc    = useQueryClient();
  const canDo = useAuthStore((s) => s.canDo);
  const [search,   setSearch]   = useState('');
  const [priority, setPriority] = useState('');
  const [page,     setPage]     = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [modal,    setModal]    = useState(false);
  const [editing,  setEditing]  = useState(null);
  const [deleting, setDeleting] = useState(null);

  const { register, handleSubmit, control, reset, formState: { errors } } = useForm({ resolver: zodResolver(schema), defaultValues: { audience:'all', priority:'normal' } });

  const { data, isLoading } = useQuery({
    queryKey: ['notices', type, page, pageSize, search, priority],
    queryFn: async () => {
      try { const { noticeService } = await import('@/services'); return await noticeService.getAll({ page, limit: pageSize, search, priority }); }
      catch {
        const d = DUMMY_NOTICES.filter(r => (!search || r.title.toLowerCase().includes(search.toLowerCase())) && (!priority || r.priority === priority));
        const slice = d.slice((page-1)*pageSize, page*pageSize);
        return { data: { rows: slice, total: d.length, totalPages: Math.max(1, Math.ceil(d.length / pageSize)) } };
      }
    },
    placeholderData: (p) => p,
  });

  const rows = data?.data?.rows ?? DUMMY_NOTICES;
  const total = data?.data?.total ?? rows.length;
  const totalPages = data?.data?.totalPages ?? 1;

  const save = useMutation({
    mutationFn: async (vals) => {
      try { const { noticeService } = await import('@/services'); return editing ? await noticeService.update(editing.id, vals) : await noticeService.create(vals); }
      catch { return { data: vals }; }
    },
    onSuccess: () => { toast.success(editing ? 'Updated' : 'Published'); qc.invalidateQueries({ queryKey: ['notices'] }); closeModal(); },
    onError: () => toast.error('Save failed'),
  });

  const remove = useMutation({
    mutationFn: async (id) => {
      try { const { noticeService } = await import('@/services'); return await noticeService.delete(id); }
      catch { return { success: true }; }
    },
    onSuccess: () => { toast.success('Deleted'); qc.invalidateQueries({ queryKey: ['notices'] }); setDeleting(null); },
    onError: () => toast.error('Delete failed'),
  });

  const openAdd  = () => { setEditing(null); reset({ audience:'all', priority:'normal' }); setModal(true); };
  const openEdit = (row) => { setEditing(row); reset({ ...row }); setModal(true); };
  const closeModal = () => { setModal(false); setEditing(null); reset(); };

  const columns = useMemo(() => [
    {
      accessorKey: 'title', header: 'Notice', cell: ({ row: { original: r } }) => (
        <div><p className="font-medium">{r.title}</p><p className="text-xs text-muted-foreground line-clamp-1">{r.content}</p></div>
      ),
    },
    { accessorKey: 'audience',    header: 'Audience',  cell: ({ getValue }) => <span className="capitalize">{getValue()}</span> },
    { accessorKey: 'notice_date', header: 'Date',      cell: ({ getValue }) => getValue() ? new Date(getValue()).toLocaleDateString('en-PK') : '—' },
    { accessorKey: 'priority', header: 'Priority', cell: ({ getValue }) => { const p = getValue(); return <span className={cn('rounded-full px-2 py-0.5 text-xs font-medium capitalize', PRIORITY_COLORS[p])}>{p}</span>; } },
    { id: 'actions', header: 'Actions', enableHiding: false, cell: ({ row }) => (
      <div className="flex items-center justify-end gap-1">
        {canDo('notices.update') && <button onClick={() => openEdit(row.original)} className="rounded p-1.5 hover:bg-accent" title="Edit"><Pencil size={13} /></button>}
        {canDo('notices.delete') && <button onClick={() => setDeleting(row.original)} className="rounded p-1.5 text-destructive hover:bg-destructive/10" title="Delete"><Trash2 size={13} /></button>}
      </div>
    )},
  ], [canDo]);

  return (
    <div className="space-y-5">
      <PageHeader title="Notices & Circulars" description={`${total} notices`} />
      <div className="grid gap-4 sm:grid-cols-3">
        <StatsCard label="Total Notices" value={total}                                              icon={<Bell size={18} />} />
        <StatsCard label="Urgent"        value={rows.filter(r => r.priority === 'urgent').length}   icon={<Bell size={18} />} />
        <StatsCard label="High Priority" value={rows.filter(r => r.priority === 'high').length}     icon={<Bell size={18} />} />
      </div>
      <DataTable columns={columns} data={rows} loading={isLoading} emptyMessage="No notices found"
        search={search} onSearch={(v) => { setSearch(v); setPage(1); }} searchPlaceholder="Search notices…"
        filters={[{ name:'priority', label:'Priority', value:priority, onChange:(v) => { setPriority(v); setPage(1); }, options:PRIORITY_OPTS }]}
        action={canDo('notices.create') ? <button onClick={openAdd} className="flex items-center gap-1.5 rounded-md bg-primary px-3 py-2 text-sm font-semibold text-primary-foreground hover:opacity-90"><Plus size={14} /> New Notice</button> : null}
        enableColumnVisibility
        exportConfig={{ fileName: 'notices' }}
        pagination={{ page, totalPages, onPageChange: setPage, total, pageSize, onPageSizeChange: (s) => { setPageSize(s); setPage(1); } }} />

      <AppModal open={modal} onClose={closeModal} title={editing ? 'Edit Notice' : 'New Notice'} size="lg"
        footer={<><button type="button" onClick={closeModal} className="rounded-md border px-4 py-2 text-sm hover:bg-accent">Cancel</button><button type="submit" form="notice-form" disabled={save.isPending} className="rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:opacity-90 disabled:opacity-60">{save.isPending ? 'Publishing…' : editing ? 'Update' : 'Publish'}</button></>}>
        <form id="notice-form" onSubmit={handleSubmit((v) => save.mutate(v))} className="space-y-4">
          <div className="space-y-1.5"><label className="text-sm font-medium">Title *</label><input {...register('title')} className="input-base" />{errors.title && <p className="text-xs text-destructive">{errors.title.message}</p>}</div>
          <div className="grid grid-cols-3 gap-4">
            <SelectField label="Audience *"  name="audience" control={control} error={errors.audience} options={AUDIENCE_OPTS} required />
            <SelectField label="Priority *"  name="priority" control={control} error={errors.priority} options={PRIORITY_OPTS} required />
            <DatePickerField label="Date"    name="notice_date" control={control} />
          </div>
          <div className="space-y-1.5">
            <label className="text-sm font-medium">Content *</label>
            <textarea {...register('content')} rows={5} className="w-full rounded-md border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring resize-none" />
            {errors.content && <p className="text-xs text-destructive">{errors.content.message}</p>}
          </div>
        </form>
      </AppModal>

      {/* Delete Confirm */}
      <AppModal open={!!deleting} onClose={() => setDeleting(null)} title="Delete Notice" size="sm"
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
