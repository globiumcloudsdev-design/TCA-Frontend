'use client';
/**
 * AdmissionsPage — Adaptive for all types
 * School → Admissions | Coaching → Enrollments | Academy → Registrations
 */
import { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import { Plus, Pencil, Trash2, ClipboardList } from 'lucide-react';

import useInstituteConfig from '@/hooks/useInstituteConfig';
import useAuthStore from '@/store/authStore';
import DataTable from '@/components/common/DataTable';
import PageHeader from '@/components/common/PageHeader';
import AppModal from '@/components/common/AppModal';
import SelectField from '@/components/common/SelectField';
import DatePickerField from '@/components/common/DatePickerField';
import StatsCard from '@/components/common/StatsCard';
import { cn } from '@/lib/utils';
import { DUMMY_ADMISSIONS } from '@/data/dummyData';

const STATUS_OPTIONS = [
  { value:'pending',   label:'Pending'   },
  { value:'approved',  label:'Approved'  },
  { value:'rejected',  label:'Rejected'  },
  { value:'enrolled',  label:'Enrolled'  },
];

const schema = z.object({
  first_name:    z.string().min(2, 'Required'),
  last_name:     z.string().min(2, 'Required'),
  email:         z.string().email('Invalid email'),
  phone:         z.string().min(10, 'Required'),
  applying_for:  z.string().min(1, 'Required'),
  status:        z.string().min(1, 'Required'),
  applied_date:  z.string().optional(),
  notes:         z.string().optional(),
});



const STATUS_COLORS = { pending:'bg-amber-100 text-amber-700', approved:'bg-blue-100 text-blue-700', rejected:'bg-red-100 text-red-700', enrolled:'bg-emerald-100 text-emerald-700' };

export default function AdmissionsPage({ type }) {
  const qc     = useQueryClient();
  const canDo  = useAuthStore((s) => s.canDo);
  const { terms } = useInstituteConfig();
  const label  = type === 'coaching' ? 'Enrollment' : type === 'academy' ? 'Registration' : 'Admission';
  const labelP = type === 'coaching' ? 'Enrollments' : type === 'academy' ? 'Registrations' : 'Admissions';

  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [page,   setPage]   = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [modal,   setModal]   = useState(false);
  const [editing, setEditing] = useState(null);
  const [deleting,setDeleting]= useState(null);

  const { register, handleSubmit, control, reset, formState: { errors } } = useForm({
    resolver: zodResolver(schema), defaultValues: { status: 'pending' },
  });

  const { data, isLoading } = useQuery({
    queryKey: ['admissions', type, page, pageSize, search, status],
    queryFn: async () => {
      try {
        const { admissionService } = await import('@/services');
        return await admissionService.getAll({ page, limit: pageSize, search, status });
      } catch {
        const d = DUMMY_ADMISSIONS.filter(a =>
          (!search || `${a.first_name} ${a.last_name}`.toLowerCase().includes(search.toLowerCase())) &&
          (!status || a.status === status)
        );
        const slice = d.slice((page-1)*pageSize, page*pageSize);
        return { data: { rows: slice, total: d.length, totalPages: Math.max(1, Math.ceil(d.length / pageSize)) } };
      }
    },
    placeholderData: (p) => p,
  });

  const rows       = data?.data?.rows       ?? DUMMY_ADMISSIONS;
  const total      = data?.data?.total      ?? rows.length;
  const totalPages = data?.data?.totalPages ?? 1;

  const save = useMutation({
    mutationFn: async (vals) => {
      try {
        const { admissionService } = await import('@/services');
        return editing ? await admissionService.update(editing.id, vals) : await admissionService.create(vals);
      } catch { return { data: vals }; }
    },
    onSuccess: () => { toast.success(editing ? 'Updated' : 'Created'); qc.invalidateQueries({ queryKey: ['admissions'] }); closeModal(); },
    onError: () => toast.error('Save failed'),
  });

  const remove = useMutation({
    mutationFn: async (id) => {
      try { const { admissionService } = await import('@/services'); return await admissionService.delete(id); }
      catch { return { success: true }; }
    },
    onSuccess: () => { toast.success('Deleted'); qc.invalidateQueries({ queryKey: ['admissions'] }); setDeleting(null); },
    onError: () => toast.error('Delete failed'),
  });

  const openAdd  = () => { setEditing(null); reset({ status:'pending' }); setModal(true); };
  const openEdit = (row) => { setEditing(row); reset({ ...row }); setModal(true); };
  const closeModal = () => { setModal(false); setEditing(null); reset(); };

  const columns = useMemo(() => [
    {
      accessorKey: 'name', header: 'Applicant',
      cell: ({ row: { original: r } }) => (
        <div>
          <p className="font-medium">{r.first_name} {r.last_name}</p>
          <p className="text-xs text-muted-foreground">{r.email}</p>
        </div>
      ),
    },
    { accessorKey: 'phone',        header: 'Phone' },
    { accessorKey: 'applying_for', header: `Applying For` },
    { accessorKey: 'applied_date', header: 'Date', cell: ({ getValue }) => getValue() ? new Date(getValue()).toLocaleDateString('en-PK') : '—' },
    {
      accessorKey: 'status', header: 'Status',
      cell: ({ getValue }) => {
        const s = getValue();
        return <span className={cn('rounded-full px-2 py-0.5 text-xs font-medium capitalize', STATUS_COLORS[s] ?? 'bg-gray-100 text-gray-700')}>{s}</span>;
      },
    },
    {
      id: 'actions', header: 'Actions', enableHiding: false,
      cell: ({ row }) => (
        <div className="flex justify-end gap-1">
          {canDo('admission.update') && <button onClick={() => openEdit(row.original)} className="rounded p-1.5 hover:bg-accent" title="Edit"><Pencil size={13} /></button>}
          {canDo('admission.delete') && <button onClick={() => setDeleting(row.original)} className="rounded p-1.5 text-destructive hover:bg-destructive/10" title="Delete"><Trash2 size={13} /></button>}
        </div>
      ),
    },
  ], [canDo]);

  const counts = useMemo(() => ({
    pending:  rows.filter(r => r.status === 'pending').length,
    approved: rows.filter(r => r.status === 'approved').length,
    enrolled: rows.filter(r => r.status === 'enrolled').length,
  }), [rows]);

  return (
    <div className="space-y-5">
      <PageHeader title={labelP} description={`${total} total`} />

      <div className="grid gap-4 sm:grid-cols-3">
        <StatsCard label="Pending Review" value={counts.pending}  icon={<ClipboardList size={18} />} />
        <StatsCard label="Approved"       value={counts.approved} icon={<ClipboardList size={18} />} />
        <StatsCard label="Enrolled"       value={counts.enrolled} icon={<ClipboardList size={18} />} />
      </div>

      <DataTable
        columns={columns} data={rows} loading={isLoading}
        emptyMessage={`No ${labelP.toLowerCase()} found`}
        search={search} onSearch={(v) => { setSearch(v); setPage(1); }} searchPlaceholder={`Search ${labelP.toLowerCase()}…`}
        filters={[{ name:'status', label:'Status', value:status, onChange:(v) => { setStatus(v); setPage(1); }, options:STATUS_OPTIONS }]}
        action={canDo('admission.create') ? <button onClick={openAdd} className="flex items-center gap-1.5 rounded-md bg-primary px-3 py-2 text-sm font-semibold text-primary-foreground hover:opacity-90"><Plus size={14} /> New {label}</button> : null}
        enableColumnVisibility
        exportConfig={{ fileName: 'admissions' }}
        pagination={{ page, totalPages, onPageChange: setPage, total, pageSize, onPageSizeChange: (s) => { setPageSize(s); setPage(1); } }}
      />

      <AppModal open={modal} onClose={closeModal} title={editing ? `Edit ${label}` : `New ${label}`} size="lg"
        footer={<>
          <button type="button" onClick={closeModal} className="rounded-md border px-4 py-2 text-sm hover:bg-accent">Cancel</button>
          <button type="submit" form="admission-form" disabled={save.isPending} className="rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:opacity-90 disabled:opacity-60">
            {save.isPending ? 'Saving…' : editing ? 'Update' : 'Submit'}
          </button>
        </>}
      >
        <form id="admission-form" onSubmit={handleSubmit((v) => save.mutate(v))} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-sm font-medium">First Name *</label>
              <input {...register('first_name')} className="input-base" placeholder="Ali" />
              {errors.first_name && <p className="text-xs text-destructive">{errors.first_name.message}</p>}
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium">Last Name *</label>
              <input {...register('last_name')} className="input-base" placeholder="Khan" />
              {errors.last_name && <p className="text-xs text-destructive">{errors.last_name.message}</p>}
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-sm font-medium">Email *</label>
              <input {...register('email')} type="email" className="input-base" />
              {errors.email && <p className="text-xs text-destructive">{errors.email.message}</p>}
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium">Phone *</label>
              <input {...register('phone')} className="input-base" />
              {errors.phone && <p className="text-xs text-destructive">{errors.phone.message}</p>}
            </div>
          </div>
          <div className="space-y-1.5">
            <label className="text-sm font-medium">Applying For ({terms.primary_unit}) *</label>
            <input {...register('applying_for')} className="input-base" placeholder={`e.g. ${terms.primary_unit} 1`} />
            {errors.applying_for && <p className="text-xs text-destructive">{errors.applying_for.message}</p>}
          </div>
          <div className="grid grid-cols-2 gap-4">
            <SelectField label="Status" name="status" control={control} error={errors.status} options={STATUS_OPTIONS} required />
            <DatePickerField label="Application Date" name="applied_date" control={control} />
          </div>
          <div className="space-y-1.5">
            <label className="text-sm font-medium">Notes</label>
            <textarea {...register('notes')} rows={3} className="w-full rounded-md border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring resize-none" />
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
        <p className="text-sm text-muted-foreground">Delete <strong>{deleting?.first_name} {deleting?.last_name}</strong>? This cannot be undone.</p>
      </AppModal>
    </div>
  );
}
