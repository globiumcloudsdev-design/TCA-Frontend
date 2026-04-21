/**
 * PayrollPage — Staff salary management
 */
'use client';

import { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { Plus, Pencil, Trash2, Wallet, FileText, Printer, CheckCircle, XCircle } from 'lucide-react';
import useAuthStore from '@/store/authStore';
import DataTable from '@/components/common/DataTable';
import PageHeader from '@/components/common/PageHeader';
import AppModal from '@/components/common/AppModal';
import SelectField from '@/components/common/SelectField';
import StatsCard from '@/components/common/StatsCard';
import PayslipTemplate from '@/components/payroll/PayslipTemplate';
import PayrollGeneratorModal from '@/components/payroll/PayrollGeneratorModal';
import ConfirmDialog from '@/components/common/ConfirmDialog';
import { payrollService } from '@/services/payrollService';
import { cn } from '@/lib/utils';

const STATUS_OPTIONS = [
  { value: 'pending', label: 'Pending' },
  { value: 'paid', label: 'Paid' },
  { value: 'on_hold', label: 'On Hold' },
];
const STATUS_COLORS = {
  paid: 'bg-emerald-100 text-emerald-700',
  pending: 'bg-amber-100 text-amber-700',
  on_hold: 'bg-red-100 text-red-700',
};
const MONTH_OPTIONS = [
  { value: 1, label: 'January' }, { value: 2, label: 'February' },
  { value: 3, label: 'March' }, { value: 4, label: 'April' },
  { value: 5, label: 'May' }, { value: 6, label: 'June' },
  { value: 7, label: 'July' }, { value: 8, label: 'August' },
  { value: 9, label: 'September' }, { value: 10, label: 'October' },
  { value: 11, label: 'November' }, { value: 12, label: 'December' },
];

export default function PayrollPage() {
  const queryClient = useQueryClient();
  const canDo = useAuthStore((s) => s.canDo);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [monthFilter, setMonthFilter] = useState('');
  const [yearFilter, setYearFilter] = useState('');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [showGenerator, setShowGenerator] = useState(false);
  const [selectedPayslip, setSelectedPayslip] = useState(null);
  
  // Dialog states
  const [statusDialog, setStatusDialog] = useState(null); // { payslip, newStatus }
  const [deleteDialog, setDeleteDialog] = useState(null); // { payslip }

  // Fetch distinct years from existing payroll for filter
  const { data: yearsData } = useQuery({
    queryKey: ['payroll-years'],
    queryFn: () => payrollService.getYears(),
    staleTime: 5 * 60 * 1000,
  });
  const yearOptions = (yearsData?.data || []).map(y => ({ value: y, label: y }));

  const { data, isLoading, refetch } = useQuery({
    queryKey: ['payroll', page, pageSize, search, statusFilter, monthFilter, yearFilter],
    queryFn: () => payrollService.getAll({
      page, limit: pageSize,
      search: search || undefined,
      status: statusFilter || undefined,
      month: monthFilter || undefined,
      year: yearFilter || undefined,
    }),
  });

  const rows = data?.data || [];
  const total = data?.pagination?.total || 0;
  const totalPages = data?.pagination?.totalPages || 1;

  const totals = useMemo(() => {
    let paidSum = 0, pendingSum = 0;
    rows.forEach(p => {
      const net = parseFloat(p.net_salary) || 0;
      if (p.status === 'paid') paidSum += net;
      else pendingSum += net;
    });
    return { paidSum, pendingSum };
  }, [rows]);

  const updateStatusMutation = useMutation({
    mutationFn: ({ id, status, payment_method }) => payrollService.update(id, { status, payment_method }),
    onSuccess: () => {
      toast.success('Status updated');
      queryClient.invalidateQueries(['payroll']);
      setStatusDialog(null);
    },
    onError: (err) => toast.error(err.response?.data?.message || 'Update failed'),
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => payrollService.delete(id),
    onSuccess: () => {
      toast.success('Payslip deleted');
      queryClient.invalidateQueries(['payroll']);
      setDeleteDialog(null);
    },
    onError: (err) => toast.error(err.response?.data?.message || 'Delete failed'),
  });

  const columns = useMemo(() => [
    { accessorKey: 'staff', header: 'Staff Member', cell: ({ row }) => {
      const staff = row.original.staff;
      return <div><p className="font-medium">{staff?.first_name} {staff?.last_name}</p><p className="text-xs text-muted-foreground">{staff?.user_type}</p></div>;
    } },
    { accessorKey: 'month', header: 'Month', cell: ({ getValue }) => MONTH_OPTIONS.find(m => m.value === getValue())?.label || getValue() },
    { accessorKey: 'year', header: 'Year' },
    { accessorKey: 'basic_salary', header: 'Basic', cell: ({ getValue }) => `PKR ${Number(getValue()).toLocaleString()}` },
    { accessorKey: 'net_salary', header: 'Net Pay', cell: ({ getValue }) => <span className="font-semibold">PKR {Number(getValue()).toLocaleString()}</span> },
    { accessorKey: 'status', header: 'Status', cell: ({ getValue }) => {
      const s = getValue();
      return <span className={cn('rounded-full px-2 py-0.5 text-xs font-medium capitalize', STATUS_COLORS[s])}>{s?.replace('_', ' ')}</span>;
    } },
    { id: 'actions', header: 'Actions', cell: ({ row }) => (
      <div className="flex items-center gap-1">
        <button onClick={() => setSelectedPayslip(row.original)} className="rounded p-1.5 hover:bg-accent" title="View Payslip"><FileText size={14} /></button>
        {canDo('payroll.create') && row.original.status !== 'paid' && (
          <button onClick={() => setStatusDialog({ payslip: row.original, newStatus: 'paid' })} className="rounded p-1.5 text-emerald-600 hover:bg-emerald-50" title="Mark Paid"><CheckCircle size={14} /></button>
        )}
        {canDo('payroll.create') && (
          <button onClick={() => setStatusDialog({ payslip: row.original, newStatus: 'on_hold' })} className="rounded p-1.5 text-amber-600 hover:bg-amber-50" title="On Hold"><XCircle size={14} /></button>
        )}
        {canDo('payroll.create') && (
          <button onClick={() => setDeleteDialog({ payslip: row.original })} className="rounded p-1.5 text-destructive hover:bg-destructive/10"><Trash2 size={14} /></button>
        )}
      </div>
    ) },
  ], [canDo]);

  return (
    <div className="space-y-5">
      <PageHeader
        title="Payroll Management"
        description={`${total} payslip records`}
        action={
          <div className="flex items-center gap-2">
            {canDo('payroll.process') && (
              <button onClick={() => setShowGenerator(true)} className="flex items-center gap-1.5 rounded-md bg-primary px-3 py-2 text-sm font-semibold text-primary-foreground hover:opacity-90">
                <Plus size={14} /> Generate Payroll
              </button>
            )}
          </div>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2">
        <StatsCard label="Total Paid" value={`PKR ${totals.paidSum.toLocaleString()}`} icon={<Wallet size={18} />} />
        <StatsCard label="Total Pending" value={`PKR ${totals.pendingSum.toLocaleString()}`} icon={<Wallet size={18} />} />
      </div>

      <DataTable
        columns={columns}
        data={rows}
        loading={isLoading}
        emptyMessage="No payslips found"
        search={search}
        onSearch={setSearch}
        searchPlaceholder="Search by staff name..."
        filters={[
          { name: 'status', label: 'Status', value: statusFilter, onChange: setStatusFilter, options: STATUS_OPTIONS },
          { name: 'month', label: 'Month', value: monthFilter, onChange: setMonthFilter, options: MONTH_OPTIONS },
          { name: 'year', label: 'Year', value: yearFilter, onChange: setYearFilter, options: yearOptions },
        ]}
        pagination={{ page, totalPages, onPageChange: setPage, total, pageSize, onPageSizeChange: setPageSize }}
      />

      <PayrollGeneratorModal open={showGenerator} onClose={() => setShowGenerator(false)} />

      {/* Payslip Preview Modal */}
      <AppModal
        open={!!selectedPayslip}
        onClose={() => setSelectedPayslip(null)}
        title="Payslip Preview"
        size="xl"
        footer={
          <div className="flex items-center gap-2">
            <button onClick={() => setSelectedPayslip(null)} className="rounded-md border px-4 py-2 text-sm hover:bg-accent">Close</button>
            <button onClick={() => window.print()} className="inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:opacity-90">
              <Printer size={14} /> Print
            </button>
          </div>
        }
      >
        <PayslipTemplate record={selectedPayslip} />
      </AppModal>

      {/* Status Update Confirm Dialog */}
      <ConfirmDialog
        open={!!statusDialog}
        onClose={() => setStatusDialog(null)}
        onConfirm={() => {
          if (statusDialog) {
            updateStatusMutation.mutate({
              id: statusDialog.payslip.id,
              status: statusDialog.newStatus,
              payment_method: statusDialog.newStatus === 'paid' ? 'cash' : undefined,
            });
          }
        }}
        loading={updateStatusMutation.isPending}
        title={`Mark as ${statusDialog?.newStatus === 'paid' ? 'Paid' : 'On Hold'}`}
        description={`Are you sure you want to mark payslip for ${statusDialog?.payslip?.staff?.first_name} ${statusDialog?.payslip?.staff?.last_name} as ${statusDialog?.newStatus}?`}
        confirmLabel="Confirm"
        variant="default"
      />

      {/* Delete Confirm Dialog */}
      <ConfirmDialog
        open={!!deleteDialog}
        onClose={() => setDeleteDialog(null)}
        onConfirm={() => deleteMutation.mutate(deleteDialog.payslip.id)}
        loading={deleteMutation.isPending}
        title="Delete Payslip"
        description={`This will permanently delete the payslip for ${deleteDialog?.payslip?.staff?.first_name} ${deleteDialog?.payslip?.staff?.last_name} (${MONTH_OPTIONS.find(m => m.value === deleteDialog?.payslip?.month)?.label} ${deleteDialog?.payslip?.year}). This action cannot be undone.`}
        confirmLabel="Delete"
        variant="destructive"
      />
    </div>
  );
}