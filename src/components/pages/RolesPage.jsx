'use client';
/**
 * RolesPage — Role & permissions management
 */
import { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import { Plus, Pencil, Trash2, ShieldCheck } from 'lucide-react';
import useAuthStore from '@/store/authStore';
import DataTable from '@/components/common/DataTable';
import PageHeader from '@/components/common/PageHeader';
import AppModal from '@/components/common/AppModal';
import SelectField from '@/components/common/SelectField';
import StatsCard from '@/components/common/StatsCard';
import { cn } from '@/lib/utils';
import { DUMMY_ROLES } from '@/data/dummyData';

const STATUS_OPTS = [{ value:'active', label:'Active' }, { value:'inactive', label:'Inactive' }];

const schema = z.object({
  name:        z.string().min(2, 'Required'),
  display_name:z.string().optional(),
  description: z.string().optional(),
  status:      z.string().min(1, 'Required'),
});


export default function RolesPage({ type }) {
  const qc    = useQueryClient();
  const canDo = useAuthStore((s) => s.canDo);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [page,   setPage]   = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [modal,  setModal]  = useState(false);
  const [editing,setEditing]= useState(null);
  const [deleting,setDeleting] = useState(null);

  const { register, handleSubmit, control, reset, formState: { errors } } = useForm({ resolver: zodResolver(schema), defaultValues: { status:'active' } });

  const { data, isLoading } = useQuery({
    queryKey: ['roles', type, page, pageSize, search, status],
    queryFn: async () => {
      try { const { roleService } = await import('@/services'); return await roleService.getAll({ page, limit: pageSize, search, status }); }
      catch {
        const d = DUMMY_ROLES.filter(r => (!search || r.display_name?.toLowerCase().includes(search.toLowerCase())) && (!status || r.status === status));
        const slice = d.slice((page-1)*pageSize, page*pageSize);
        return { data: { rows: slice, total: d.length, totalPages: Math.max(1, Math.ceil(d.length / pageSize)) } };
      }
    },
    placeholderData: (p) => p,
  });

  const rows = data?.data?.rows ?? DUMMY_ROLES;
  const total = data?.data?.total ?? rows.length;
  const totalPages = data?.data?.totalPages ?? 1;

  const save = useMutation({
    mutationFn: async (vals) => {
      try { const { roleService } = await import('@/services'); return editing ? await roleService.update(editing.id, vals) : await roleService.create(vals); }
      catch { return { data: vals }; }
    },
    onSuccess: () => { toast.success(editing ? 'Updated' : 'Created'); qc.invalidateQueries({ queryKey: ['roles'] }); closeModal(); },
    onError: () => toast.error('Save failed'),
  });

  const remove = useMutation({
    mutationFn: async (id) => {
      try { const { roleService } = await import('@/services'); return await roleService.delete(id); }
      catch { return { success: true }; }
    },
    onSuccess: () => { toast.success('Deleted'); qc.invalidateQueries({ queryKey: ['roles'] }); setDeleting(null); },
    onError: () => toast.error('Delete failed'),
  });

  const openAdd  = () => { setEditing(null); reset({ status:'active' }); setModal(true); };
  const openEdit = (row) => { setEditing(row); reset({ ...row }); setModal(true); };
  const closeModal = () => { setModal(false); setEditing(null); reset(); };

  const columns = useMemo(() => [
    { accessorKey: 'display_name', header: 'Role Name', cell: ({ row: { original: r } }) => <div><p className="font-medium">{r.display_name}</p><p className="text-xs text-muted-foreground font-mono">{r.name}</p></div> },
    { accessorKey: 'description',      header: 'Description',  cell: ({ getValue }) => getValue() || '—' },
    { accessorKey: 'permissions_count',header: 'Permissions',  cell: ({ getValue }) => <span className="rounded-md bg-primary/10 px-2 py-0.5 text-xs font-medium">{getValue() ?? 0}</span> },
    { accessorKey: 'users_count',      header: 'Users Assigned',cell: ({ getValue }) => getValue() ?? 0 },
    { accessorKey: 'status', header: 'Status', cell: ({ getValue }) => <span className={cn('rounded-full px-2 py-0.5 text-xs font-medium capitalize', getValue() === 'active' ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700')}>{getValue()}</span> },
    { id: 'actions', header: 'Actions', enableHiding: false, cell: ({ row }) => (
      <div className="flex items-center justify-end gap-1">
        {canDo('roles.update') && <button onClick={() => openEdit(row.original)} className="rounded p-1.5 hover:bg-accent" title="Edit"><Pencil size={13} /></button>}
        {canDo('roles.delete') && <button onClick={() => setDeleting(row.original)} className="rounded p-1.5 text-destructive hover:bg-destructive/10" title="Delete"><Trash2 size={13} /></button>}
      </div>
    )},
  ], [canDo]);

  return (
    <div className="space-y-5">
      <PageHeader title="Roles & Permissions" description={`${total} roles configured`} />
      <div className="grid gap-4 sm:grid-cols-3">
        <StatsCard label="Total Roles"  value={total}                                         icon={<ShieldCheck size={18} />} />
        <StatsCard label="Active"       value={rows.filter(r => r.status === 'active').length}    icon={<ShieldCheck size={18} />} />
        <StatsCard label="Total Users"  value={rows.reduce((s, r) => s + (r.users_count ?? 0), 0)} icon={<ShieldCheck size={18} />} />
      </div>
      <DataTable columns={columns} data={rows} loading={isLoading} emptyMessage="No roles found"
        search={search} onSearch={(v) => { setSearch(v); setPage(1); }} searchPlaceholder="Search roles…"
        filters={[{ name:'status', label:'Status', value:status, onChange:(v) => { setStatus(v); setPage(1); }, options:STATUS_OPTS }]}
        action={canDo('roles.create') ? <button onClick={openAdd} className="flex items-center gap-1.5 rounded-md bg-primary px-3 py-2 text-sm font-semibold text-primary-foreground hover:opacity-90"><Plus size={14} /> New Role</button> : null}
        enableColumnVisibility
        exportConfig={{ fileName: 'roles' }}
        pagination={{ page, totalPages, onPageChange: setPage, total, pageSize, onPageSizeChange: (s) => { setPageSize(s); setPage(1); } }} />

      <AppModal open={modal} onClose={closeModal} title={editing ? 'Edit Role' : 'New Role'} size="md"
        footer={<><button type="button" onClick={closeModal} className="rounded-md border px-4 py-2 text-sm hover:bg-accent">Cancel</button><button type="submit" form="role-form" disabled={save.isPending} className="rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:opacity-90 disabled:opacity-60">{save.isPending ? 'Saving…' : editing ? 'Update' : 'Create'}</button></>}>
        <form id="role-form" onSubmit={handleSubmit((v) => save.mutate(v))} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5"><label className="text-sm font-medium">Display Name *</label><input {...register('display_name')} className="input-base" placeholder="e.g. Class Teacher" />{errors.display_name && <p className="text-xs text-destructive">{errors.display_name.message}</p>}</div>
            <div className="space-y-1.5"><label className="text-sm font-medium">System Name *</label><input {...register('name')} className="input-base" placeholder="e.g. class_teacher" />{errors.name && <p className="text-xs text-destructive">{errors.name.message}</p>}</div>
          </div>
          <div className="space-y-1.5"><label className="text-sm font-medium">Description</label><textarea {...register('description')} rows={2} className="w-full rounded-md border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring resize-none" /></div>
          <SelectField label="Status" name="status" control={control} error={errors.status} options={STATUS_OPTS} required />
        </form>
      </AppModal>

      {/* Delete Confirm */}
      <AppModal open={!!deleting} onClose={() => setDeleting(null)} title="Delete Role" size="sm"
        footer={
          <>
            <button onClick={() => setDeleting(null)} className="rounded-md border px-4 py-2 text-sm hover:bg-accent">Cancel</button>
            <button onClick={() => remove.mutate(deleting.id)} disabled={remove.isPending} className="rounded-md bg-destructive px-4 py-2 text-sm font-semibold text-white hover:opacity-90 disabled:opacity-60">
              {remove.isPending ? 'Deleting\u2026' : 'Delete'}
            </button>
          </>
        }>
        <p className="text-sm text-muted-foreground">Delete role <strong>{deleting?.display_name}</strong>? This cannot be undone.</p>
      </AppModal>
    </div>
  );
}
