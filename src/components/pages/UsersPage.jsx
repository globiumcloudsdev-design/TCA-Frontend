'use client';
/**
 * UsersPage — User accounts with role assignment
 */
import { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import { Plus, Pencil, Trash2, UserCog } from 'lucide-react';
import useAuthStore from '@/store/authStore';
import DataTable from '@/components/common/DataTable';
import PageHeader from '@/components/common/PageHeader';
import AppModal from '@/components/common/AppModal';
import SelectField from '@/components/common/SelectField';
import StatsCard from '@/components/common/StatsCard';
import { cn } from '@/lib/utils';
import { DUMMY_USERS } from '@/data/dummyData';

const STATUS_OPTS = [{ value:'active', label:'Active' }, { value:'inactive', label:'Inactive' }, { value:'suspended', label:'Suspended' }];
const ROLE_OPTS   = [{ value:'admin', label:'Admin' }, { value:'teacher', label:'Teacher' }, { value:'accountant', label:'Accountant' }, { value:'receptionist', label:'Receptionist' }, { value:'parent', label:'Parent' }];
const STATUS_COLORS = { active:'bg-emerald-100 text-emerald-700', inactive:'bg-gray-100 text-gray-600', suspended:'bg-red-100 text-red-700' };

const schema = z.object({
  first_name: z.string().min(2, 'Required'),
  last_name:  z.string().min(2, 'Required'),
  email:      z.string().email('Invalid email'),
  phone:      z.string().optional(),
  role:       z.string().min(1, 'Required'),
  status:     z.string().min(1, 'Required'),
  password:   z.string().optional(),
});

export default function UsersPage({ type }) {
  const qc    = useQueryClient();
  const canDo = useAuthStore((s) => s.canDo);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [role,   setRole]   = useState('');
  const [page,   setPage]   = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [modal,  setModal]  = useState(false);
  const [editing,setEditing]= useState(null);
  const [deleting, setDeleting] = useState(null);

  const { register, handleSubmit, control, reset, formState: { errors } } = useForm({ resolver: zodResolver(schema), defaultValues: { status:'active' } });

  const { data, isLoading } = useQuery({
    queryKey: ['users', type, page, pageSize, search, status, role],
    queryFn: async () => {
      try { const { userService } = await import('@/services'); return await userService.getAll({ page, limit: pageSize, search, status, role }); }
      catch {
        const d = DUMMY_USERS.filter(r =>
          (!search || `${r.first_name} ${r.last_name} ${r.email}`.toLowerCase().includes(search.toLowerCase())) &&
          (!status || r.status === status) && (!role || r.role === role)
        );
        const slice = d.slice((page-1)*pageSize, page*pageSize);
        return { data: { rows: slice, total: d.length, totalPages: Math.max(1, Math.ceil(d.length / pageSize)) } };
      }
    },
    placeholderData: (p) => p,
  });

  const rows = data?.data?.rows ?? DUMMY_USERS;
  const total = data?.data?.total ?? rows.length;
  const totalPages = data?.data?.totalPages ?? 1;

  const save = useMutation({
    mutationFn: async (vals) => {
      try { const { userService } = await import('@/services'); return editing ? await userService.update(editing.id, vals) : await userService.create(vals); }
      catch { return { data: vals }; }
    },
    onSuccess: () => { toast.success(editing ? 'Updated' : 'Created'); qc.invalidateQueries({ queryKey: ['users'] }); closeModal(); },
    onError: () => toast.error('Save failed'),
  });

  const remove = useMutation({
    mutationFn: async (id) => {
      try { const { userService } = await import('@/services'); return await userService.delete(id); }
      catch { return { success: true }; }
    },
    onSuccess: () => { toast.success('Deleted'); qc.invalidateQueries({ queryKey: ['users'] }); setDeleting(null); },
    onError: () => toast.error('Delete failed'),
  });

  const openAdd  = () => { setEditing(null); reset({ status:'active' }); setModal(true); };
  const openEdit = (row) => { setEditing(row); reset({ ...row, password:'' }); setModal(true); };
  const closeModal = () => { setModal(false); setEditing(null); reset(); };

  const columns = useMemo(() => [
    {
      accessorKey: 'name', header: 'User', cell: ({ row: { original: r } }) => (
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold">{r.first_name?.[0]}{r.last_name?.[0]}</div>
          <div><p className="font-medium">{r.first_name} {r.last_name}</p><p className="text-xs text-muted-foreground">{r.email}</p></div>
        </div>
      ),
    },
    { accessorKey: 'phone', header: 'Phone', cell: ({ getValue }) => getValue() || '—' },
    { accessorKey: 'role',  header: 'Role',  cell: ({ getValue }) => <span className="capitalize rounded-md bg-primary/10 px-2 py-0.5 text-xs">{getValue()}</span> },
    { accessorKey: 'last_login', header: 'Last Login', cell: ({ getValue }) => getValue() ? new Date(getValue()).toLocaleDateString('en-PK') : 'Never' },
    { accessorKey: 'status', header: 'Status', cell: ({ getValue }) => { const s = getValue(); return <span className={cn('rounded-full px-2 py-0.5 text-xs font-medium capitalize', STATUS_COLORS[s])}>{s}</span>; } },
    { id: 'actions', header: 'Actions', enableHiding: false, cell: ({ row }) => (
      <div className="flex items-center justify-end gap-1">
        {canDo('users.update') && <button onClick={() => openEdit(row.original)} className="rounded p-1.5 hover:bg-accent" title="Edit"><Pencil size={13} /></button>}
        {canDo('users.delete') && <button onClick={() => setDeleting(row.original)} className="rounded p-1.5 text-destructive hover:bg-destructive/10" title="Delete"><Trash2 size={13} /></button>}
      </div>
    )},
  ], [canDo]);

  return (
    <div className="space-y-5">
      <PageHeader title="User Management" description={`${total} users`} />
      <div className="grid gap-4 sm:grid-cols-3">
        <StatsCard label="Total Users"  value={total}                                         icon={<UserCog size={18} />} />
        <StatsCard label="Active"       value={rows.filter(r => r.status === 'active').length}    icon={<UserCog size={18} />} />
        <StatsCard label="Inactive"     value={rows.filter(r => r.status !== 'active').length}    icon={<UserCog size={18} />} />
      </div>
      <DataTable columns={columns} data={rows} loading={isLoading} emptyMessage="No users found"
        search={search} onSearch={(v) => { setSearch(v); setPage(1); }} searchPlaceholder="Search users…"
        filters={[
          { name:'status', label:'Status', value:status, onChange:(v) => { setStatus(v); setPage(1); }, options:STATUS_OPTS },
          { name:'role',   label:'Role',   value:role,   onChange:(v) => { setRole(v);   setPage(1); }, options:ROLE_OPTS   },
        ]}
        action={canDo('users.create') ? <button onClick={openAdd} className="flex items-center gap-1.5 rounded-md bg-primary px-3 py-2 text-sm font-semibold text-primary-foreground hover:opacity-90"><Plus size={14} /> New User</button> : null}
        enableColumnVisibility
        exportConfig={{ fileName: 'users' }}
        pagination={{ page, totalPages, onPageChange: setPage, total, pageSize, onPageSizeChange: (s) => { setPageSize(s); setPage(1); } }} />

      <AppModal open={modal} onClose={closeModal} title={editing ? 'Edit User' : 'New User'} size="md"
        footer={<><button type="button" onClick={closeModal} className="rounded-md border px-4 py-2 text-sm hover:bg-accent">Cancel</button><button type="submit" form="user-form" disabled={save.isPending} className="rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:opacity-90 disabled:opacity-60">{save.isPending ? 'Saving…' : editing ? 'Update' : 'Create'}</button></>}>
        <form id="user-form" onSubmit={handleSubmit((v) => save.mutate(v))} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5"><label className="text-sm font-medium">First Name *</label><input {...register('first_name')} className="input-base" />{errors.first_name && <p className="text-xs text-destructive">{errors.first_name.message}</p>}</div>
            <div className="space-y-1.5"><label className="text-sm font-medium">Last Name *</label><input {...register('last_name')} className="input-base" />{errors.last_name && <p className="text-xs text-destructive">{errors.last_name.message}</p>}</div>
          </div>
          <div className="space-y-1.5"><label className="text-sm font-medium">Email *</label><input type="email" {...register('email')} className="input-base" />{errors.email && <p className="text-xs text-destructive">{errors.email.message}</p>}</div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5"><label className="text-sm font-medium">Phone</label><input {...register('phone')} className="input-base" /></div>
            <div className="space-y-1.5"><label className="text-sm font-medium">{editing ? 'New Password (optional)' : 'Password *'}</label><input type="password" {...register('password')} className="input-base" /></div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <SelectField label="Role *"   name="role"   control={control} error={errors.role}   options={ROLE_OPTS}   required />
            <SelectField label="Status *" name="status" control={control} error={errors.status} options={STATUS_OPTS} required />
          </div>
        </form>
      </AppModal>

      {/* Delete Confirm */}
      <AppModal open={!!deleting} onClose={() => setDeleting(null)} title="Delete User" size="sm"
        footer={
          <>
            <button onClick={() => setDeleting(null)} className="rounded-md border px-4 py-2 text-sm hover:bg-accent">Cancel</button>
            <button onClick={() => remove.mutate(deleting.id)} disabled={remove.isPending} className="rounded-md bg-destructive px-4 py-2 text-sm font-semibold text-white hover:opacity-90 disabled:opacity-60">
              {remove.isPending ? 'Deleting' : 'Delete'}
            </button>
          </>
        }>
        <p className="text-sm text-muted-foreground">Delete user <strong>{deleting?.first_name} {deleting?.last_name}</strong>? This cannot be undone.</p>
      </AppModal>
    </div>
  );
}
