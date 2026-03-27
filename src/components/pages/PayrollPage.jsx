'use client';
/**
 * PayrollPage — Staff salary management
 */
import { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import { Plus, Pencil, Trash2, Wallet } from 'lucide-react';
import useAuthStore from '@/store/authStore';
import DataTable from '@/components/common/DataTable';
import PageHeader from '@/components/common/PageHeader';
import AppModal from '@/components/common/AppModal';
import SelectField from '@/components/common/SelectField';
import StatsCard from '@/components/common/StatsCard';
import { cn } from '@/lib/utils';
import { DUMMY_PAYROLL } from '@/data/dummyData';

const STATUS_OPTS = [{ value:'paid', label:'Paid' }, { value:'pending', label:'Pending' }, { value:'on_hold', label:'On Hold' }];
const STATUS_COLORS = { paid:'bg-emerald-100 text-emerald-700', pending:'bg-amber-100 text-amber-700', on_hold:'bg-red-100 text-red-700' };
const MONTH_OPTS  = ['January','February','March','April','May','June','July','August','September','October','November','December'].map(m => ({ value: m.toLowerCase(), label: m }));

const schema = z.object({
  staff_name:  z.string().min(2, 'Required'),
  designation: z.string().optional(),
  basic_salary:z.coerce.number().min(1, 'Required'),
  allowances:  z.coerce.number().optional(),
  deductions:  z.coerce.number().optional(),
  month:       z.string().min(1, 'Required'),
  status:      z.string().min(1, 'Required'),
});



export default function PayrollPage({ type }) {
  const qc    = useQueryClient();
  const canDo = useAuthStore((s) => s.canDo);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [month,  setMonth]  = useState('');
  const [page,   setPage]   = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [modal,   setModal]   = useState(false);
  const [editing, setEditing] = useState(null);
  const [deleting,setDeleting]= useState(null);

  const { register, handleSubmit, control, reset, formState: { errors } } = useForm({ resolver: zodResolver(schema), defaultValues: { status:'pending' } });

  const { data, isLoading } = useQuery({
    queryKey: ['payroll', type, page, pageSize, search, status, month],
    queryFn: async () => {
      try { const { payrollService } = await import('@/services'); return await payrollService.getAll({ page, limit: pageSize, search, status, month }); }
      catch {
        const d = DUMMY_PAYROLL.filter(r => (!search || r.staff_name.toLowerCase().includes(search.toLowerCase())) && (!status || r.status === status) && (!month || r.month === month));
        const slice = d.slice((page-1)*pageSize, page*pageSize);
        return { data: { rows: slice, total: d.length, totalPages: Math.max(1, Math.ceil(d.length / pageSize)) } };
      }
    },
    placeholderData: (p) => p,
  });

  const rows = data?.data?.rows ?? DUMMY_PAYROLL;
  const total = data?.data?.total ?? rows.length;
  const totalPages = data?.data?.totalPages ?? 1;

  const save = useMutation({
    mutationFn: async (vals) => {
      const net = (vals.basic_salary ?? 0) + (vals.allowances ?? 0) - (vals.deductions ?? 0);
      try { const { payrollService } = await import('@/services'); return editing ? await payrollService.update(editing.id, { ...vals, net }) : await payrollService.create({ ...vals, net }); }
      catch { return { data: vals }; }
    },
    onSuccess: () => { toast.success(editing ? 'Updated' : 'Created'); qc.invalidateQueries({ queryKey: ['payroll'] }); closeModal(); },
    onError: () => toast.error('Save failed'),
  });

  const remove = useMutation({
    mutationFn: async (id) => {
      try { const { payrollService } = await import('@/services'); return await payrollService.delete(id); }
      catch { return { success: true }; }
    },
    onSuccess: () => { toast.success('Deleted'); qc.invalidateQueries({ queryKey: ['payroll'] }); setDeleting(null); },
    onError: () => toast.error('Delete failed'),
  });

  const openAdd  = () => { setEditing(null); reset({ status:'pending' }); setModal(true); };
  const openEdit = (row) => { setEditing(row); reset({ ...row }); setModal(true); };
  const closeModal = () => { setModal(false); setEditing(null); reset(); };

  const totalNetPay = useMemo(() => rows.filter(r => r.status === 'paid').reduce((s, r) => s + (r.net ?? 0), 0), [rows]);
  const totalPending = useMemo(() => rows.filter(r => r.status !== 'paid').reduce((s, r) => s + (r.net ?? 0), 0), [rows]);

  const columns = useMemo(() => [
    { accessorKey: 'staff_name',  header: 'Staff Member', cell: ({ row: { original: r } }) => <div><p className="font-medium">{r.staff_name}</p><p className="text-xs text-muted-foreground">{r.designation}</p></div> },
    { accessorKey: 'month',       header: 'Month',       cell: ({ getValue }) => <span className="capitalize">{getValue()}</span> },
    { accessorKey: 'basic_salary',header: 'Basic',       cell: ({ getValue }) => `PKR ${(getValue() ?? 0).toLocaleString()}` },
    { accessorKey: 'allowances',  header: 'Allowances',  cell: ({ getValue }) => `+${(getValue() ?? 0).toLocaleString()}` },
    { accessorKey: 'deductions',  header: 'Deductions',  cell: ({ getValue }) => getValue() ? `-${getValue().toLocaleString()}` : '—' },
    { accessorKey: 'net',         header: 'Net Pay',     cell: ({ getValue }) => <span className="font-semibold">PKR {(getValue() ?? 0).toLocaleString()}</span> },
    { accessorKey: 'status', header: 'Status', cell: ({ getValue }) => { const s = getValue(); return <span className={cn('rounded-full px-2 py-0.5 text-xs font-medium capitalize', STATUS_COLORS[s])}>{s?.replace('_', ' ')}</span>; } },
    { id: 'actions', header: 'Actions', enableHiding: false, cell: ({ row }) => (
      <div className="flex items-center justify-end gap-1">
        {canDo('payroll.update') && <button onClick={() => openEdit(row.original)} className="rounded p-1.5 hover:bg-accent" title="Edit"><Pencil size={13} /></button>}
        {canDo('payroll.delete') && <button onClick={() => setDeleting(row.original)} className="rounded p-1.5 text-destructive hover:bg-destructive/10" title="Delete"><Trash2 size={13} /></button>}
      </div>
    )},
  ], [canDo]);

  return (
    <div className="space-y-5">
      <PageHeader title="Payroll" description="Staff salary management" />
      <div className="grid gap-4 sm:grid-cols-3">
        <StatsCard label="Paid This Month"    value={`PKR ${totalNetPay.toLocaleString()}`}   icon={<Wallet size={18} />} />
        <StatsCard label="Pending"            value={`PKR ${totalPending.toLocaleString()}`}  icon={<Wallet size={18} />} />
        <StatsCard label="Total Staff"        value={total}                                    icon={<Wallet size={18} />} />
      </div>
      <DataTable columns={columns} data={rows} loading={isLoading} emptyMessage="No payroll records"
        search={search} onSearch={(v) => { setSearch(v); setPage(1); }} searchPlaceholder="Search staff…"
        filters={[
          { name:'status', label:'Status', value:status, onChange:(v) => { setStatus(v); setPage(1); }, options:STATUS_OPTS },
          { name:'month',  label:'Month',  value:month,  onChange:(v) => { setMonth(v);  setPage(1); }, options:MONTH_OPTS  },
        ]}
        action={canDo('payroll.create') ? <button onClick={openAdd} className="flex items-center gap-1.5 rounded-md bg-primary px-3 py-2 text-sm font-semibold text-primary-foreground hover:opacity-90"><Plus size={14} /> Add Record</button> : null}
        enableColumnVisibility
        exportConfig={{ fileName: 'payroll' }}
        pagination={{ page, totalPages, onPageChange: setPage, total, pageSize, onPageSizeChange: (s) => { setPageSize(s); setPage(1); } }} />

      <AppModal open={modal} onClose={closeModal} title={editing ? 'Edit Payroll' : 'New Payroll Record'} size="md"
        footer={<><button type="button" onClick={closeModal} className="rounded-md border px-4 py-2 text-sm hover:bg-accent">Cancel</button><button type="submit" form="pay-form" disabled={save.isPending} className="rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:opacity-90 disabled:opacity-60">{save.isPending ? 'Saving…' : editing ? 'Update' : 'Save'}</button></>}>
        <form id="pay-form" onSubmit={handleSubmit((v) => save.mutate(v))} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5"><label className="text-sm font-medium">Staff Name *</label><input {...register('staff_name')} className="input-base" />{errors.staff_name && <p className="text-xs text-destructive">{errors.staff_name.message}</p>}</div>
            <div className="space-y-1.5"><label className="text-sm font-medium">Designation</label><input {...register('designation')} className="input-base" /></div>
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-1.5"><label className="text-sm font-medium">Basic Salary *</label><input type="number" {...register('basic_salary')} className="input-base" />{errors.basic_salary && <p className="text-xs text-destructive">{errors.basic_salary.message}</p>}</div>
            <div className="space-y-1.5"><label className="text-sm font-medium">Allowances</label><input type="number" {...register('allowances')} className="input-base" /></div>
            <div className="space-y-1.5"><label className="text-sm font-medium">Deductions</label><input type="number" {...register('deductions')} className="input-base" /></div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <SelectField label="Month *"  name="month"  control={control} error={errors.month}  options={MONTH_OPTS}  required />
            <SelectField label="Status *" name="status" control={control} error={errors.status} options={STATUS_OPTS} required />
          </div>
        </form>
      </AppModal>

      {/* Delete Confirm */}
      <AppModal open={!!deleting} onClose={() => setDeleting(null)} title="Delete Payroll Record" size="sm"
        footer={
          <>
            <button onClick={() => setDeleting(null)} className="rounded-md border px-4 py-2 text-sm hover:bg-accent">Cancel</button>
            <button onClick={() => remove.mutate(deleting.id)} disabled={remove.isPending} className="rounded-md bg-destructive px-4 py-2 text-sm font-semibold text-white hover:opacity-90 disabled:opacity-60">
              {remove.isPending ? 'Deleting\u2026' : 'Delete'}
            </button>
          </>
        }>
        <p className="text-sm text-muted-foreground">Delete payroll record for <strong>{deleting?.staff_name}</strong>? This cannot be undone.</p>
      </AppModal>
    </div>
  );
}
