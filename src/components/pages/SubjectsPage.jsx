'use client';
/**
 * SubjectsPage — Adaptive:
 * school → Subjects | academy → Modules | university → Courses
 */
import { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import { Plus, Pencil, Trash2, BookMarked } from 'lucide-react';
import useInstituteConfig from '@/hooks/useInstituteConfig';
import useAuthStore from '@/store/authStore';
import DataTable from '@/components/common/DataTable';
import PageHeader from '@/components/common/PageHeader';
import AppModal from '@/components/common/AppModal';
import SelectField from '@/components/common/SelectField';
import StatsCard from '@/components/common/StatsCard';
import { cn } from '@/lib/utils';
import { DUMMY_FLAT_SUBJECTS } from '@/data/dummyData';

const TYPE_OPTS   = [{ value:'core',     label:'Core'     }, { value:'elective', label:'Elective' }, { value:'lab', label:'Lab/Practical' }];
const STATUS_OPTS = [{ value:'active',   label:'Active'   }, { value:'inactive', label:'Inactive' }];

const schema = z.object({
  name:       z.string().min(2, 'Required'),
  code:       z.string().min(1, 'Required'),
  class_name: z.string().optional(),
  type:       z.string().min(1, 'Required'),
  credits:    z.coerce.number().optional(),
  status:     z.string().min(1, 'Required'),
});



export default function SubjectsPage({ type }) {
  const qc    = useQueryClient();
  const canDo = useAuthStore((s) => s.canDo);
  const { terms } = useInstituteConfig();
  const label  = type === 'academy' ? 'Module' : type === 'university' ? 'Course' : 'Subject';
  const labelP = type === 'academy' ? 'Modules' : type === 'university' ? 'Courses' : 'Subjects';

  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [page,   setPage]   = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [modal,   setModal]   = useState(false);
  const [editing, setEditing] = useState(null);
  const [deleting,setDeleting]= useState(null);

  const { register, handleSubmit, control, reset, formState: { errors } } = useForm({ resolver: zodResolver(schema), defaultValues: { status:'active', type:'core' } });

  const { data, isLoading } = useQuery({
    queryKey: ['subjects', type, page, pageSize, search, status],
    queryFn: async () => {
      try { const { subjectService } = await import('@/services'); return await subjectService.getAll({ page, limit: pageSize, search, status }); }
      catch {
        const d = DUMMY_FLAT_SUBJECTS.filter(r => (!search || r.name.toLowerCase().includes(search.toLowerCase())) && (!status || r.status === status));
        const slice = d.slice((page-1)*pageSize, page*pageSize);
        return { data: { rows: slice, total: d.length, totalPages: Math.max(1, Math.ceil(d.length / pageSize)) } };
      }
    },
    placeholderData: (p) => p,
  });

  const rows = data?.data?.rows ?? DUMMY_FLAT_SUBJECTS;
  const total = data?.data?.total ?? rows.length;
  const totalPages = data?.data?.totalPages ?? 1;

  const save = useMutation({
    mutationFn: async (vals) => {
      try { const { subjectService } = await import('@/services'); return editing ? await subjectService.update(editing.id, vals) : await subjectService.create(vals); }
      catch { return { data: vals }; }
    },
    onSuccess: () => { toast.success(editing ? 'Updated' : 'Created'); qc.invalidateQueries({ queryKey: ['subjects'] }); closeModal(); },
    onError: () => toast.error('Save failed'),
  });

  const remove = useMutation({
    mutationFn: async (id) => {
      try { const { subjectService } = await import('@/services'); return await subjectService.delete(id); }
      catch { return { success: true }; }
    },
    onSuccess: () => { toast.success('Deleted'); qc.invalidateQueries({ queryKey: ['subjects'] }); setDeleting(null); },
    onError: () => toast.error('Delete failed'),
  });

  const openAdd  = () => { setEditing(null); reset({ status:'active', type:'core' }); setModal(true); };
  const openEdit = (row) => { setEditing(row); reset({ ...row }); setModal(true); };
  const closeModal = () => { setModal(false); setEditing(null); reset(); };

  const columns = useMemo(() => [
    { accessorKey: 'name', header: `${label} Name`, cell: ({ getValue }) => <span className="font-medium">{getValue()}</span> },
    { accessorKey: 'code',       header: 'Code' },
    { accessorKey: 'class_name', header: terms.primary_unit, cell: ({ getValue }) => getValue() || '—' },
    { accessorKey: 'type',       header: 'Type', cell: ({ getValue }) => <span className="capitalize">{getValue()}</span> },
    { accessorKey: 'credits',    header: 'Credits', cell: ({ getValue }) => getValue() ?? '—' },
    { accessorKey: 'status', header: 'Status', cell: ({ getValue }) => <span className={cn('rounded-full px-2 py-0.5 text-xs font-medium capitalize', getValue() === 'active' ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700')}>{getValue()}</span> },
    { id: 'actions', header: 'Actions', enableHiding: false, cell: ({ row }) => (
      <div className="flex items-center justify-end gap-1">
        {canDo('subject.update') && <button onClick={() => openEdit(row.original)} className="rounded p-1.5 hover:bg-accent" title="Edit"><Pencil size={13} /></button>}
        {canDo('subject.delete') && <button onClick={() => setDeleting(row.original)} className="rounded p-1.5 text-destructive hover:bg-destructive/10" title="Delete"><Trash2 size={13} /></button>}
      </div>
    )},
  ], [canDo, label, terms.primary_unit]);

  return (
    <div className="space-y-5">
      <PageHeader title={labelP} description={`${total} ${labelP.toLowerCase()} total`} />
      <div className="grid gap-4 sm:grid-cols-3">
        <StatsCard label={`Total ${labelP}`} value={total}                                         icon={<BookMarked size={18} />} />
        <StatsCard label="Core"              value={rows.filter(r => r.type === 'core').length}    icon={<BookMarked size={18} />} />
        <StatsCard label="Elective"          value={rows.filter(r => r.type === 'elective').length}icon={<BookMarked size={18} />} />
      </div>
      <DataTable columns={columns} data={rows} loading={isLoading} emptyMessage={`No ${labelP.toLowerCase()} found`}
        search={search} onSearch={(v) => { setSearch(v); setPage(1); }} searchPlaceholder={`Search ${labelP.toLowerCase()}…`}
        filters={[{ name:'status', label:'Status', value:status, onChange:(v) => { setStatus(v); setPage(1); }, options:STATUS_OPTS }]}
        action={canDo('subject.create') ? <button onClick={openAdd} className="flex items-center gap-1.5 rounded-md bg-primary px-3 py-2 text-sm font-semibold text-primary-foreground hover:opacity-90"><Plus size={14} /> New {label}</button> : null}
        enableColumnVisibility
        exportConfig={{ fileName: 'subjects' }}
        pagination={{ page, totalPages, onPageChange: setPage, total, pageSize, onPageSizeChange: (s) => { setPageSize(s); setPage(1); } }} />

      <AppModal open={modal} onClose={closeModal} title={editing ? `Edit ${label}` : `New ${label}`} size="md"
        footer={<><button type="button" onClick={closeModal} className="rounded-md border px-4 py-2 text-sm hover:bg-accent">Cancel</button><button type="submit" form="subject-form" disabled={save.isPending} className="rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:opacity-90 disabled:opacity-60">{save.isPending ? 'Saving…' : editing ? 'Update' : 'Create'}</button></>}>
        <form id="subject-form" onSubmit={handleSubmit((v) => save.mutate(v))} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5"><label className="text-sm font-medium">{label} Name *</label><input {...register('name')} className="input-base" />{errors.name && <p className="text-xs text-destructive">{errors.name.message}</p>}</div>
            <div className="space-y-1.5"><label className="text-sm font-medium">Code *</label><input {...register('code')} className="input-base" />{errors.code && <p className="text-xs text-destructive">{errors.code.message}</p>}</div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5"><label className="text-sm font-medium">{terms.primary_unit}</label><input {...register('class_name')} className="input-base" /></div>
            <div className="space-y-1.5"><label className="text-sm font-medium">Credits</label><input type="number" {...register('credits')} className="input-base" /></div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <SelectField label="Type"   name="type"   control={control} error={errors.type}   options={TYPE_OPTS}   required />
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
        <p className="text-sm text-muted-foreground">Delete <strong>{deleting?.name}</strong>? This cannot be undone.</p>
      </AppModal>
    </div>
  );
}
