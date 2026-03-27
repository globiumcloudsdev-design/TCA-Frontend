'use client';
/**
 * FeesPage — Student fee records with payment status
 */
import { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import { Plus, Pencil, Trash2, DollarSign, AlertCircle } from 'lucide-react';
import useInstituteConfig from '@/hooks/useInstituteConfig';
import useAuthStore from '@/store/authStore';
import DataTable from '@/components/common/DataTable';
import PageHeader from '@/components/common/PageHeader';
import AppModal from '@/components/common/AppModal';
import SelectField from '@/components/common/SelectField';
import DatePickerField from '@/components/common/DatePickerField';
import StatsCard from '@/components/common/StatsCard';
import { cn } from '@/lib/utils';
import { DUMMY_FEES } from '@/data/dummyData';

const STATUS_OPTS = [{ value:'paid', label:'Paid' }, { value:'pending', label:'Pending' }, { value:'overdue', label:'Overdue' }, { value:'partial', label:'Partial' }];
const STATUS_COLORS = { paid:'bg-emerald-100 text-emerald-700', pending:'bg-amber-100 text-amber-700', overdue:'bg-red-100 text-red-700', partial:'bg-blue-100 text-blue-700' };
const MONTH_OPTS = ['January','February','March','April','May','June','July','August','September','October','November','December'].map(m => ({ value: m.toLowerCase(), label: m }));

const schema = z.object({
  student_name: z.string().min(2, 'Required'),
  roll_no:      z.string().optional(),
  amount:       z.coerce.number().min(1, 'Required'),
  paid_amount:  z.coerce.number().optional(),
  month:        z.string().optional(),
  due_date:     z.string().optional(),
  status:       z.string().min(1, 'Required'),
  remarks:      z.string().optional(),
});



export default function FeesPage({ type }) {
  const qc    = useQueryClient();
  const canDo = useAuthStore((s) => s.canDo);
  const { terms } = useInstituteConfig();
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [page,   setPage]   = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [modal,   setModal]   = useState(false);
  const [editing, setEditing] = useState(null);
  const [deleting,setDeleting]= useState(null);

  const { register, handleSubmit, control, reset, formState: { errors } } = useForm({ resolver: zodResolver(schema), defaultValues: { status:'pending' } });

  const { data, isLoading } = useQuery({
    queryKey: ['fees', type, page, pageSize, search, status],
    queryFn: async () => {
      try { const { feeService } = await import('@/services'); return await feeService.getAll({ page, limit: pageSize, search, status }); }
      catch {
        const d = DUMMY_FEES.filter(r => (!search || r.student_name.toLowerCase().includes(search.toLowerCase())) && (!status || r.status === status));
        const slice = d.slice((page-1)*pageSize, page*pageSize);
        return { data: { rows: slice, total: d.length, totalPages: Math.max(1, Math.ceil(d.length / pageSize)) } };
      }
    },
    placeholderData: (p) => p,
  });

  const rows = data?.data?.rows ?? DUMMY_FEES;
  const total = data?.data?.total ?? rows.length;
  const totalPages = data?.data?.totalPages ?? 1;

  const save = useMutation({
    mutationFn: async (vals) => {
      try { const { feeService } = await import('@/services'); return editing ? await feeService.update(editing.id, vals) : await feeService.create(vals); }
      catch { return { data: vals }; }
    },
    onSuccess: () => { toast.success(editing ? 'Updated' : 'Recorded'); qc.invalidateQueries({ queryKey: ['fees'] }); closeModal(); },
    onError: () => toast.error('Save failed'),
  });

  const remove = useMutation({
    mutationFn: async (id) => {
      try { const { feeService } = await import('@/services'); return await feeService.delete(id); }
      catch { return { success: true }; }
    },
    onSuccess: () => { toast.success('Deleted'); qc.invalidateQueries({ queryKey: ['fees'] }); setDeleting(null); },
    onError: () => toast.error('Delete failed'),
  });

  const openAdd  = () => { setEditing(null); reset({ status:'pending' }); setModal(true); };
  const openEdit = (row) => { setEditing(row); reset({ ...row }); setModal(true); };
  const closeModal = () => { setModal(false); setEditing(null); reset(); };

  const totalCollected = useMemo(() => rows.reduce((s, r) => s + (r.paid_amount ?? 0), 0), [rows]);
  const totalDue       = useMemo(() => rows.reduce((s, r) => s + (r.amount ?? 0), 0), [rows]);
  const totalOverdue   = useMemo(() => rows.filter(r => r.status === 'overdue').length, [rows]);

  const columns = useMemo(() => [
    { accessorKey: 'student_name', header: `${terms.student} Name`, cell: ({ row: { original: r } }) => <div><p className="font-medium">{r.student_name}</p><p className="text-xs text-muted-foreground">Roll: {r.roll_no} · {r.class_name}</p></div> },
    { accessorKey: 'month',        header: 'Month',      cell: ({ getValue }) => <span className="capitalize">{getValue()}</span> },
    { accessorKey: 'amount',       header: 'Amount',     cell: ({ getValue }) => `PKR ${(getValue() ?? 0).toLocaleString()}` },
    { accessorKey: 'paid_amount',  header: 'Paid',       cell: ({ getValue }) => `PKR ${(getValue() ?? 0).toLocaleString()}` },
    { accessorKey: 'due_date',     header: 'Due Date',   cell: ({ getValue }) => getValue() ? new Date(getValue()).toLocaleDateString('en-PK') : '—' },
    { accessorKey: 'status', header: 'Status', cell: ({ getValue }) => { const s = getValue(); return <span className={cn('rounded-full px-2 py-0.5 text-xs font-medium capitalize', STATUS_COLORS[s])}>{s}</span>; } },
    { id: 'actions', header: 'Actions', enableHiding: false, cell: ({ row }) => (
      <div className="flex items-center justify-end gap-1">
        {canDo('fees.update') && <button onClick={() => openEdit(row.original)} className="rounded p-1.5 hover:bg-accent" title="Edit"><Pencil size={13} /></button>}
        {canDo('fees.delete') && <button onClick={() => setDeleting(row.original)} className="rounded p-1.5 text-destructive hover:bg-destructive/10" title="Delete"><Trash2 size={13} /></button>}
      </div>
    )},
  ], [canDo, terms.student]);

  return (
    <div className="space-y-5">
      <PageHeader title="Fee Records" description={`${total} records`} />
      <div className="grid gap-4 sm:grid-cols-3">
        <StatsCard label="Total Collected" value={`PKR ${totalCollected.toLocaleString()}`} icon={<DollarSign size={18} />} />
        <StatsCard label="Total Due"        value={`PKR ${(totalDue - totalCollected).toLocaleString()}`} icon={<DollarSign size={18} />} />
        <StatsCard label="Overdue"          value={totalOverdue} icon={<AlertCircle size={18} />} />
      </div>
      <DataTable columns={columns} data={rows} loading={isLoading} emptyMessage="No fee records found"
        search={search} onSearch={(v) => { setSearch(v); setPage(1); }} searchPlaceholder={`Search ${terms.students.toLowerCase()}…`}
        filters={[{ name:'status', label:'Status', value:status, onChange:(v) => { setStatus(v); setPage(1); }, options:STATUS_OPTS }]}
        action={canDo('fees.create') ? <button onClick={openAdd} className="flex items-center gap-1.5 rounded-md bg-primary px-3 py-2 text-sm font-semibold text-primary-foreground hover:opacity-90"><Plus size={14} /> Add Fee</button> : null}
        enableColumnVisibility
        exportConfig={{ fileName: 'fee-records' }}
        pagination={{ page, totalPages, onPageChange: setPage, total, pageSize, onPageSizeChange: (s) => { setPageSize(s); setPage(1); } }} />

      <AppModal open={modal} onClose={closeModal} title={editing ? 'Edit Fee Record' : 'Add Fee Record'} size="md"
        footer={<><button type="button" onClick={closeModal} className="rounded-md border px-4 py-2 text-sm hover:bg-accent">Cancel</button><button type="submit" form="fee-form" disabled={save.isPending} className="rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:opacity-90 disabled:opacity-60">{save.isPending ? 'Saving…' : editing ? 'Update' : 'Save'}</button></>}>
        <form id="fee-form" onSubmit={handleSubmit((v) => save.mutate(v))} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5"><label className="text-sm font-medium">{terms.student} Name *</label><input {...register('student_name')} className="input-base" />{errors.student_name && <p className="text-xs text-destructive">{errors.student_name.message}</p>}</div>
            <div className="space-y-1.5"><label className="text-sm font-medium">Roll No.</label><input {...register('roll_no')} className="input-base" /></div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5"><label className="text-sm font-medium">Amount (PKR) *</label><input type="number" {...register('amount')} className="input-base" />{errors.amount && <p className="text-xs text-destructive">{errors.amount.message}</p>}</div>
            <div className="space-y-1.5"><label className="text-sm font-medium">Paid Amount</label><input type="number" {...register('paid_amount')} className="input-base" /></div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <SelectField label="Month"  name="month"  control={control} options={MONTH_OPTS} />
            <DatePickerField label="Due Date" name="due_date" control={control} />
          </div>
          <SelectField label="Status" name="status" control={control} error={errors.status} options={STATUS_OPTS} required />
          <div className="space-y-1.5"><label className="text-sm font-medium">Remarks</label><input {...register('remarks')} className="input-base" /></div>
        </form>
      </AppModal>

      {/* Delete Confirm */}
      <AppModal open={!!deleting} onClose={() => setDeleting(null)} title="Delete Fee Record" size="sm"
        footer={
          <>
            <button onClick={() => setDeleting(null)} className="rounded-md border px-4 py-2 text-sm hover:bg-accent">Cancel</button>
            <button onClick={() => remove.mutate(deleting.id)} disabled={remove.isPending} className="rounded-md bg-destructive px-4 py-2 text-sm font-semibold text-white hover:opacity-90 disabled:opacity-60">
              {remove.isPending ? 'Deleting\u2026' : 'Delete'}
            </button>
          </>
        }>
        <p className="text-sm text-muted-foreground">Delete fee record for <strong>{deleting?.student_name}</strong>? This cannot be undone.</p>
      </AppModal>
    </div>
  );
}
