'use client';
/**
 * SectionsPage — Adaptive:
 * school → Sections | coaching/academy → Batches
 */
import { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import { Plus, Pencil, Trash2, Users } from 'lucide-react';
import useInstituteConfig from '@/hooks/useInstituteConfig';
import useAuthStore from '@/store/authStore';
import DataTable from '@/components/common/DataTable';
import PageHeader from '@/components/common/PageHeader';
import AppModal from '@/components/common/AppModal';
import SelectField from '@/components/common/SelectField';
import StatsCard from '@/components/common/StatsCard';
import { cn } from '@/lib/utils';
import { DUMMY_SECTIONS } from '@/data/dummyData';

const STATUS_OPTS = [{ value:'active', label:'Active' }, { value:'inactive', label:'Inactive' }];

const schema = z.object({
  name:      z.string().min(1, 'Required'),
  class_id:  z.string().min(1, 'Required'),
  capacity:  z.coerce.number().min(1, 'Required'),
  teacher_id:z.string().optional(),
  status:    z.string().min(1, 'Required'),
});



export default function SectionsPage({ type }) {
  const qc    = useQueryClient();
  const canDo = useAuthStore((s) => s.canDo);
  const { terms } = useInstituteConfig();
  const label  = type === 'coaching' || type === 'academy' ? 'Batch'   : 'Section';
  const labelP = type === 'coaching' || type === 'academy' ? 'Batches' : 'Sections';
  const parentLabel = terms.primary_unit ?? 'Class';

  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [page,   setPage]   = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [modal,   setModal]   = useState(false);
  const [editing, setEditing] = useState(null);
  const [deleting,setDeleting]= useState(null);

  const { register, handleSubmit, control, reset, formState: { errors } } = useForm({ resolver: zodResolver(schema), defaultValues: { status:'active', capacity:40 } });

  const { data, isLoading } = useQuery({
    queryKey: ['sections', type, page, pageSize, search, status],
    queryFn: async () => {
      try { const { sectionService } = await import('@/services'); return await sectionService.getAll({ page, limit: pageSize, search, status }); }
      catch {
        const d = DUMMY_SECTIONS.filter(r => (!search || r.name.toLowerCase().includes(search.toLowerCase())) && (!status || r.status === status));
        const slice = d.slice((page-1)*pageSize, page*pageSize);
        return { data: { rows: slice, total: d.length, totalPages: Math.max(1, Math.ceil(d.length / pageSize)) } };
      }
    },
    placeholderData: (p) => p,
  });

  const rows = data?.data?.rows ?? DUMMY_SECTIONS;
  const total = data?.data?.total ?? rows.length;
  const totalPages = data?.data?.totalPages ?? 1;

  const save = useMutation({
    mutationFn: async (vals) => {
      try { const { sectionService } = await import('@/services'); return editing ? await sectionService.update(editing.id, vals) : await sectionService.create(vals); }
      catch { return { data: vals }; }
    },
    onSuccess: () => { toast.success(editing ? 'Updated' : 'Created'); qc.invalidateQueries({ queryKey: ['sections'] }); closeModal(); },
    onError: () => toast.error('Save failed'),
  });

  const remove = useMutation({
    mutationFn: async (id) => {
      try { const { sectionService } = await import('@/services'); return await sectionService.delete(id); }
      catch { return { success: true }; }
    },
    onSuccess: () => { toast.success('Deleted'); qc.invalidateQueries({ queryKey: ['sections'] }); setDeleting(null); },
    onError: () => toast.error('Delete failed'),
  });

  const openAdd  = () => { setEditing(null); reset({ status:'active', capacity:40 }); setModal(true); };
  const openEdit = (row) => { setEditing(row); reset({ ...row, class_id: row.class_id ?? '' }); setModal(true); };
  const closeModal = () => { setModal(false); setEditing(null); reset(); };

  const columns = useMemo(() => [
    { accessorKey: 'name',         header: `${label} Name`,  cell: ({ getValue }) => <span className="font-semibold">{getValue()}</span> },
    { accessorKey: 'class_name',   header: parentLabel },
    { accessorKey: 'teacher_name', header: 'Class Teacher', cell: ({ getValue }) => getValue() || '—' },
    { accessorKey: 'enrolled',     header: 'Enrolled',      cell: ({ getValue }) => getValue() ?? 0 },
    { accessorKey: 'capacity',     header: 'Capacity' },
    { accessorKey: 'status', header: 'Status', cell: ({ getValue }) => <span className={cn('rounded-full px-2 py-0.5 text-xs font-medium capitalize', getValue() === 'active' ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700')}>{getValue()}</span> },
    { id: 'actions', header: 'Actions', enableHiding: false, cell: ({ row }) => (
      <div className="flex items-center justify-end gap-1">
        {canDo('section.update') && <button onClick={() => openEdit(row.original)} className="rounded p-1.5 hover:bg-accent" title="Edit"><Pencil size={13} /></button>}
        {canDo('section.delete') && <button onClick={() => setDeleting(row.original)} className="rounded p-1.5 text-destructive hover:bg-destructive/10" title="Delete"><Trash2 size={13} /></button>}
      </div>
    )},
  ], [canDo, label, parentLabel]);

  return (
    <div className="space-y-5">
      <PageHeader title={labelP} description={`${total} ${labelP.toLowerCase()} total`} />
      <div className="grid gap-4 sm:grid-cols-3">
        <StatsCard label={`Total ${labelP}`} value={total}                                       icon={<Users size={18} />} />
        <StatsCard label="Active"            value={rows.filter(r => r.status === 'active').length}   icon={<Users size={18} />} />
        <StatsCard label="Inactive"          value={rows.filter(r => r.status === 'inactive').length} icon={<Users size={18} />} />
      </div>
      <DataTable columns={columns} data={rows} loading={isLoading} emptyMessage={`No ${labelP.toLowerCase()} found`}
        search={search} onSearch={(v) => { setSearch(v); setPage(1); }} searchPlaceholder={`Search ${labelP.toLowerCase()}…`}
        filters={[{ name:'status', label:'Status', value:status, onChange:(v) => { setStatus(v); setPage(1); }, options:STATUS_OPTS }]}
        action={canDo('section.create') ? <button onClick={openAdd} className="flex items-center gap-1.5 rounded-md bg-primary px-3 py-2 text-sm font-semibold text-primary-foreground hover:opacity-90"><Plus size={14} /> New {label}</button> : null}
        enableColumnVisibility
        exportConfig={{ fileName: 'sections' }}
        pagination={{ page, totalPages, onPageChange: setPage, total, pageSize, onPageSizeChange: (s) => { setPageSize(s); setPage(1); } }} />

      <AppModal open={modal} onClose={closeModal} title={editing ? `Edit ${label}` : `New ${label}`} size="md"
        footer={<><button type="button" onClick={closeModal} className="rounded-md border px-4 py-2 text-sm hover:bg-accent">Cancel</button><button type="submit" form="section-form" disabled={save.isPending} className="rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:opacity-90 disabled:opacity-60">{save.isPending ? 'Saving…' : editing ? 'Update' : 'Create'}</button></>}>
        <form id="section-form" onSubmit={handleSubmit((v) => save.mutate(v))} className="space-y-4">
          <div className="space-y-1.5"><label className="text-sm font-medium">{label} Name *</label><input {...register('name')} className="input-base" placeholder={`e.g. ${label} A`} />{errors.name && <p className="text-xs text-destructive">{errors.name.message}</p>}</div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5"><label className="text-sm font-medium">{parentLabel} *</label><input {...register('class_id')} className="input-base" placeholder={parentLabel} />{errors.class_id && <p className="text-xs text-destructive">{errors.class_id.message}</p>}</div>
            <div className="space-y-1.5"><label className="text-sm font-medium">Capacity *</label><input type="number" {...register('capacity')} className="input-base" />{errors.capacity && <p className="text-xs text-destructive">{errors.capacity.message}</p>}</div>
          </div>
          <SelectField label="Status" name="status" control={control} error={errors.status} options={STATUS_OPTS} required />
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
        <p className="text-sm text-muted-foreground">Delete <strong>{deleting?.name}</strong>? This cannot be undone.</p>
      </AppModal>
    </div>
  );
}
