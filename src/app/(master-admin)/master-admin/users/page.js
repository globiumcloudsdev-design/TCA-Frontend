'use client';

import { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { Plus, Users, UserCheck, UserX, ShieldCheck } from 'lucide-react';
import { toast } from 'sonner';

import { masterAdminService } from '@/services';
import {
  PageHeader, DataTable, StatusBadge, TableRowActions,
  ConfirmDialog, AppModal, InputField, SelectField,
  SwitchField, FormSubmitButton, AvatarWithInitials,
} from '@/components/common';
import { Button } from '@/components/ui/button';
import { Badge }  from '@/components/ui/badge';
import { cn } from '@/lib/utils';

// ─── Constants ────────────────────────────────────────────────────────────────
const ROLE_OPTIONS = [
  { value: 'super_admin',   label: '👑 Super Admin'   },
  { value: 'school_admin',  label: '🏢 School Admin'  },
  { value: 'teacher',       label: '👩‍🏫 Teacher'      },
  { value: 'accountant',    label: '💼 Accountant'    },
  { value: 'receptionist',  label: '📋 Receptionist'  },
  { value: 'librarian',     label: '📚 Librarian'     },
];

const STATUS_OPTIONS = [
  { value: 'true',  label: '🟢 Active'   },
  { value: 'false', label: '🔴 Inactive' },
];

const ROLE_BADGE = {
  super_admin:  'bg-purple-100 text-purple-700',
  school_admin: 'bg-blue-100 text-blue-700',
  teacher:      'bg-emerald-100 text-emerald-700',
  accountant:   'bg-amber-100 text-amber-700',
  receptionist: 'bg-cyan-100 text-cyan-700',
  librarian:    'bg-indigo-100 text-indigo-700',
};

const fmtDate = (v) => v ? new Date(v).toLocaleDateString('en-PK', { day: '2-digit', month: 'short', year: 'numeric' }) : '—';

// ─── Columns ─────────────────────────────────────────────────────────────────
function buildColumns(onEdit, onToggle, onDelete) {
  return [
    {
      id: 'user',
      header: 'User',
      cell: ({ row }) => {
        const u = row.original;
        return (
          <div className="flex items-center gap-3">
            <AvatarWithInitials
              src={u.photo_url}
              firstName={u.first_name}
              lastName={u.last_name}
              size="sm"
            />
            <div>
              <p className="font-semibold text-sm text-slate-800 leading-tight">
                {u.first_name} {u.last_name}
              </p>
              <p className="text-xs text-muted-foreground">{u.email}</p>
            </div>
          </div>
        );
      },
    },
    {
      id: 'school',
      header: 'Institute',
      cell: ({ row }) => {
        const name = row.original.school?.name;
        return name
          ? <span className="text-sm text-slate-700">{name}</span>
          : <span className="text-xs text-muted-foreground italic">Platform</span>;
      },
    },
    {
      id: 'role',
      header: 'Role',
      cell: ({ row }) => {
        const roleCode = row.original.role?.code ?? row.original.role_code;
        const roleName = row.original.role?.name ?? roleCode;
        if (!roleName) return <span className="text-xs text-muted-foreground">—</span>;
        return (
          <span className={cn(
            'inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-semibold',
            ROLE_BADGE[roleCode] ?? 'bg-slate-100 text-slate-700',
          )}>
            <ShieldCheck size={10} /> {roleName}
          </span>
        );
      },
    },
    {
      accessorKey: 'phone',
      header: 'Phone',
      cell: ({ getValue }) => <span className="text-sm text-slate-600">{getValue() ?? '—'}</span>,
    },
    {
      id: 'joined',
      header: 'Joined',
      cell: ({ row }) => (
        <span className="text-xs text-muted-foreground">{fmtDate(row.original.createdAt)}</span>
      ),
    },
    {
      accessorKey: 'is_active',
      header: 'Status',
      cell: ({ getValue }) => <StatusBadge status={getValue() ? 'active' : 'inactive'} />,
    },
    {
      id: 'actions',
      header: '',
      cell: ({ row }) => {
        const u = row.original;
        return (
          <TableRowActions
            onEdit={() => onEdit(u)}
            onDelete={() => onDelete(u)}
            extra={[
              {
                label: u.is_active ? '🔒 Deactivate' : '✅ Activate',
                onClick: () => onToggle(u),
              },
            ]}
          />
        );
      },
    },
  ];
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function MasterUsersPage() {
  const qc = useQueryClient();

  const [page,         setPage]         = useState(1);
  const [search,       setSearch]       = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  const [createOpen,   setCreateOpen]   = useState(false);
  const [editTarget,   setEditTarget]   = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [toggleTarget, setToggleTarget] = useState(null);

  const { data, isLoading } = useQuery({
    queryKey: ['master-users', page, search, statusFilter],
    queryFn: () => masterAdminService.getUsers({
      page, limit: 15,
      search: search || undefined,
      is_active: statusFilter || undefined,
    }),
  });

  const users      = data?.data?.rows ?? data?.data ?? [];
  const totalCount = data?.data?.total ?? users.length;
  const totalPages = data?.data?.totalPages ?? 1;

  const active   = users.filter((u) => u.is_active).length;
  const inactive = users.length - active;

  const createMutation = useMutation({
    mutationFn: (body) => masterAdminService.createUser?.(body) ?? Promise.reject(new Error('createUser not available')),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['master-users'] });
      toast.success('User created');
      setCreateOpen(false);
    },
    onError: (e) => toast.error(e?.response?.data?.message ?? e.message ?? 'Failed'),
  });

  const toggleMutation = useMutation({
    mutationFn: ({ id, is_active }) => masterAdminService.toggleUserStatus?.(id, is_active) ?? Promise.reject(new Error('toggleUserStatus not available')),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['master-users'] });
      toast.success('Status updated');
      setToggleTarget(null);
    },
    onError: (e) => toast.error(e?.response?.data?.message ?? e.message ?? 'Failed'),
  });

  const deleteMutation = useMutation({
    mutationFn: ({ id }) => masterAdminService.deleteUser?.(id) ?? Promise.reject(new Error('deleteUser not available')),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['master-users'] });
      toast.success('User deleted');
      setDeleteTarget(null);
    },
    onError: (e) => toast.error(e?.response?.data?.message ?? e.message ?? 'Failed'),
  });

  const handleFormSubmit = (body) => {
    if (editTarget) {
      masterAdminService.updateUser?.(editTarget.id, body)
        ?.then(() => {
          qc.invalidateQueries({ queryKey: ['master-users'] });
          toast.success('User updated');
          setEditTarget(null);
        })
        .catch((e) => toast.error(e?.response?.data?.message ?? 'Update failed'));
    } else {
      createMutation.mutate(body);
    }
  };

  const columns = useMemo(
    () => buildColumns(setEditTarget, setToggleTarget, setDeleteTarget),
    [],
  );

  return (
    <div className="space-y-5">
      <PageHeader
        title="👥 Platform Users"
        description="All registered users across every institute on the platform"
        action={
          <Button onClick={() => setCreateOpen(true)} className="gap-1.5">
            <Plus size={15} /> New User
          </Button>
        }
      />

      {/* ── Stats Strip ────────────────────────────────────── */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {[
          { label: 'Total',    value: totalCount, icon: Users,      bg: 'bg-blue-50',    color: 'text-blue-600'    },
          { label: 'Active',   value: active,     icon: UserCheck,  bg: 'bg-emerald-50', color: 'text-emerald-600' },
          { label: 'Inactive', value: inactive,   icon: UserX,      bg: 'bg-red-50',     color: 'text-red-500'     },
          { label: 'Roles',    value: ROLE_OPTIONS.length, icon: ShieldCheck, bg: 'bg-violet-50', color: 'text-violet-600' },
        ].map((s) => (
          <div key={s.label} className="flex items-center gap-3 rounded-xl border bg-white p-3 shadow-sm">
            <div className={cn('rounded-lg p-2', s.bg)}>
              <s.icon size={16} className={s.color} />
            </div>
            <div>
              <p className="text-xl font-extrabold leading-none text-slate-800">
                {isLoading ? '—' : s.value}
              </p>
              <p className="text-xs text-muted-foreground">{s.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* ── DataTable ──────────────────────────────────────── */}
      <DataTable
        columns={columns}
        data={users}
        loading={isLoading}
        emptyMessage="No users found"
        search={search}
        onSearch={(v) => { setSearch(v); setPage(1); }}
        searchPlaceholder="Search by name or email…"
        filters={[
          {
            name: 'status', label: 'Status', value: statusFilter,
            onChange: (v) => { setStatusFilter(v); setPage(1); },
            options: STATUS_OPTIONS,
          },
        ]}
        pagination={{ page, totalPages, total: totalCount, onPageChange: setPage }}
      />

      {/* ── Form Modal ─────────────────────────────────────── */}
      <UserFormModal
        open={createOpen || !!editTarget}
        onClose={() => { setCreateOpen(false); setEditTarget(null); }}
        defaultValues={editTarget ?? {}}
        onSubmit={handleFormSubmit}
        loading={createMutation.isPending}
        isEdit={!!editTarget}
      />

      {/* ── Delete Confirm ─────────────────────────────────── */}
      <ConfirmDialog
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={() => deleteMutation.mutate(deleteTarget)}
        loading={deleteMutation.isPending}
        title="Delete User"
        description={`Permanently delete "${deleteTarget?.first_name} ${deleteTarget?.last_name}"? This cannot be undone.`}
        confirmLabel="Delete"
        variant="destructive"
      />

      {/* ── Toggle Confirm ─────────────────────────────────── */}
      <ConfirmDialog
        open={!!toggleTarget}
        onClose={() => setToggleTarget(null)}
        onConfirm={() => toggleMutation.mutate({ id: toggleTarget.id, is_active: !toggleTarget.is_active })}
        loading={toggleMutation.isPending}
        title={toggleTarget?.is_active ? 'Deactivate User' : 'Activate User'}
        description={`${toggleTarget?.is_active ? 'Deactivate' : 'Activate'} "${toggleTarget?.first_name} ${toggleTarget?.last_name}"?`}
        confirmLabel={toggleTarget?.is_active ? 'Deactivate' : 'Activate'}
        variant={toggleTarget?.is_active ? 'destructive' : 'default'}
      />
    </div>
  );
}

// ─── User Form Modal ──────────────────────────────────────────────────────────
function SectionLabel({ children }) {
  return (
    <p className="mt-4 mb-2 text-xs font-bold uppercase tracking-widest text-muted-foreground border-b pb-1.5">
      {children}
    </p>
  );
}

function UserFormModal({ open, onClose, defaultValues, onSubmit, loading, isEdit }) {
  const { register, control, handleSubmit, reset, formState: { errors } } = useForm({
    defaultValues: {
      is_active: true,
      ...defaultValues,
    },
  });

  // Fetch schools for dropdown
  const { data: schoolRows } = useQuery({
    queryKey: ['master-schools-all'],
    queryFn: () => masterAdminService.getSchools({ limit: 100 }).then((r) => r?.data?.rows ?? r?.data ?? []),
    enabled: open,
  });
  const schoolOptions = (schoolRows ?? []).map((s) => ({ value: s.id, label: s.name }));

  const handleClose = () => { reset(); onClose(); };

  return (
    <AppModal
      open={open}
      onClose={handleClose}
      title={isEdit ? '✏️ Edit User' : '➕ Add New User'}
      description={isEdit ? 'Update user information' : 'Create a new user on the platform'}
      size="lg"
      footer={
        <div className="flex justify-end gap-2 w-full">
          <Button variant="outline" onClick={handleClose} disabled={loading}>Cancel</Button>
          <FormSubmitButton
            loading={loading}
            label={isEdit ? 'Save Changes' : 'Create User'}
            loadingLabel="Saving…"
            onClick={handleSubmit(onSubmit)}
          />
        </div>
      }
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-1">

        <SectionLabel>Personal Info</SectionLabel>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <InputField label="First Name" name="first_name" register={register} error={errors.first_name}
            rules={{ required: 'First name is required' }} placeholder="Ahmed" required />
          <InputField label="Last Name" name="last_name" register={register} placeholder="Raza" />
        </div>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <InputField label="Email" name="email" register={register} error={errors.email}
            rules={{ required: 'Email is required' }} placeholder="user@institute.edu.pk" type="email" required />
          <InputField label="Phone" name="phone" register={register} placeholder="+92-300-1234567" />
        </div>

        <SectionLabel>Account</SectionLabel>
        <InputField label={isEdit ? 'New Password (leave blank to keep)' : 'Password *'}
          name="password" register={register}
          rules={isEdit ? {} : { required: 'Password is required' }}
          error={errors.password}
          placeholder="Minimum 8 characters" type="password" required={!isEdit} />

        <SectionLabel>Role &amp; Access</SectionLabel>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <SelectField label="Role" name="role_code" control={control} options={ROLE_OPTIONS} placeholder="Select role" />
          <SelectField label="Institute" name="school_id" control={control} options={schoolOptions} placeholder="Select institute" />
        </div>
        <SwitchField label="Active" name="is_active" control={control}
          hint="User can log in and access the platform" />

      </form>
    </AppModal>
  );
}
