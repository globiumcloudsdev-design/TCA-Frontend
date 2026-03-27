//src/app/(master-admin)/master-admin/subscriptions/page.js
'use client';

import { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Receipt, RefreshCw, CheckCircle2, AlertTriangle,
  TrendingUp, X, Loader2, Building2, FileText, CreditCard,
} from 'lucide-react';
import { toast } from 'sonner';

import { masterAdminService } from '@/services';
import { PageHeader, AppModal, StatsCard, DataTable, SelectField } from '@/components/common';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { useForm } from 'react-hook-form';

// ─── Constants ────────────────────────────────────────────────────────────────

const STATUS_OPTIONS = [
  { value: 'PENDING',   label: 'Pending' },
  { value: 'PAID',      label: 'Paid' },
  { value: 'OVERDUE',   label: 'Overdue' },
  { value: 'DRAFT',     label: 'Draft' },
  { value: 'CANCELLED', label: 'Cancelled' },
];

const STATUS_STYLE = {
  DRAFT:     { badge: 'bg-slate-100 text-slate-600 border border-slate-200', label: 'Draft' },
  PENDING:   { badge: 'bg-amber-100 text-amber-700 border border-amber-200', label: 'Pending' },
  PAID:      { badge: 'bg-emerald-100 text-emerald-700 border border-emerald-200', label: 'Paid' },
  OVERDUE:   { badge: 'bg-red-100 text-red-700 border border-red-200',       label: 'Overdue' },
  CANCELLED: { badge: 'bg-slate-100 text-slate-500 border border-slate-200', label: 'Cancelled' },
};

const PAYMENT_METHODS = [
  { value: 'MANUAL',        label: 'Manual Entry' },
  { value: 'CASH',          label: 'Cash' },
  { value: 'BANK_TRANSFER', label: 'Bank Transfer' },
  { value: 'CHEQUE',        label: 'Cheque' },
  { value: 'ONLINE',        label: 'Online Payment' },
];

const fmtDate = (d) =>
  d ? new Date(d).toLocaleDateString('en-PK', { day: '2-digit', month: 'short', year: 'numeric' }) : '—';
const fmtAmt = (a, c = 'PKR') =>
  a != null ? `${c} ${Number(a).toLocaleString()}` : '—';

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function MasterAdminInvoicesPage() {
  const qc = useQueryClient();

  const [statusFilter, setStatusFilter] = useState('');
  const [dateFrom,     setDateFrom]     = useState('');
  const [dateTo,       setDateTo]       = useState('');
  const [page,         setPage]         = useState(1);
  const [payModal,     setPayModal]     = useState(null);
  const [payForm,      setPayForm]      = useState({
    payment_reference: '',
    notes: '',
  });

  // react-hook-form for SelectField
  const { control, watch, reset } = useForm({
    defaultValues: { payment_method: 'MANUAL' },
  });

  // ── Fetch all invoices ────────────────────────────────────────────────────
  const {
    data, isLoading, isFetching, refetch, isError, error,
  } = useQuery({
    queryKey: ['all-invoices', statusFilter, dateFrom, dateTo, page],
    queryFn: () =>
      masterAdminService.getAllInvoices({
        status:    statusFilter || undefined,
        date_from: dateFrom     || undefined,
        date_to:   dateTo       || undefined,
        page,
        limit: 15,
      }),
    staleTime: 0,
    // refetchOnWindowFocus: true,
  });

  const invoices   = data?.data?.rows       ?? data?.rows       ?? [];
  const total      = data?.data?.total      ?? data?.total      ?? 0;
  const totalPages = data?.data?.totalPages ?? data?.totalPages ?? 1;
  const summary    = data?.data?.summary    ?? data?.summary    ?? {};

  // ── Mark as Paid ─────────────────────────────────────────────────────────
  const markPaidMutation = useMutation({
    mutationFn: ({ id, formData }) => masterAdminService.markInvoicePaid(id, formData),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['all-invoices'] });
      toast.success('Invoice marked as paid ✅');
      setPayModal(null);
      setPayForm({ payment_reference: '', notes: '' });
      reset({ payment_method: 'MANUAL' });
    },
    onError: (e) => toast.error(e?.response?.data?.message ?? e.message ?? 'Failed'),
  });

  const openPayModal = (inv) => {
    setPayModal(inv);
    setPayForm({ payment_reference: '', notes: '' });
    // ensure SelectField defaults to MANUAL on open
    reset({ payment_method: 'MANUAL' });
  };

  const handleStatusChange = (s) => { setStatusFilter(s); setPage(1); };
  const handleDateFrom     = (v) => { setDateFrom(v);     setPage(1); };
  const handleDateTo       = (v) => { setDateTo(v);       setPage(1); };

  const handleConfirmPaid = () => {
    if (!payModal) return;
    const payload = {
      payment_method: watch('payment_method'),
      payment_reference: payForm.payment_reference,
      notes: payForm.notes,
    };
    markPaidMutation.mutate({ id: payModal.id, formData: payload });
  };

  // ── Column Definitions ────────────────────────────────────────────────────
  const columns = useMemo(() => [
    {
      id: 'institute',
      header: 'Institute',
      cell: ({ row: { original: inv } }) => (
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="shrink-0 rounded-lg bg-slate-100 p-1.5">
            <Building2 size={14} className="text-slate-500" />
          </div>
          <div className="min-w-0">
            <p className="font-semibold text-slate-800 truncate text-sm">
              {inv.institute?.institute_name ?? '—'}
            </p>
            <p className="text-[11px] text-muted-foreground font-mono truncate">
              {inv.invoice_number ?? inv.id}
            </p>
          </div>
        </div>
      ),
    },
    {
      id: 'plan',
      header: 'Plan',
      accessorFn: (row) => row.plan?.name ?? '',
      cell: ({ row: { original: inv } }) => (
        <div className="flex items-center gap-1.5 text-xs">
          <FileText size={12} className="text-muted-foreground shrink-0" />
          <span className="truncate">{inv.plan?.name ?? '—'}</span>
          {inv.plan?.cycle && (
            <span className="shrink-0 rounded-full bg-blue-50 px-1.5 py-px text-[10px] text-blue-600 border border-blue-100">
              {inv.plan.cycle}
            </span>
          )}
        </div>
      ),
    },
    {
      accessorKey: 'total_amount',
      header: 'Amount',
      cell: ({ row: { original: inv } }) => (
        <span className="font-semibold text-slate-800 font-mono text-sm">
          {fmtAmt(inv.total_amount, inv.currency)}
        </span>
      ),
    },
    {
      id: 'period',
      header: 'Period',
      cell: ({ row: { original: inv } }) => (
        <div className="text-xs text-muted-foreground">
          <p>{fmtDate(inv.period_start)}</p>
          <p>{fmtDate(inv.period_end)}</p>
        </div>
      ),
    },
    {
      accessorKey: 'due_date',
      header: 'Due Date',
      cell: ({ row: { original: inv } }) => {
        const isOverdue = inv.status === 'OVERDUE';
        const isPaid    = inv.status === 'PAID';
        return (
          <div className={cn('text-xs font-medium', isOverdue ? 'text-red-600' : 'text-muted-foreground')}>
            {fmtDate(inv.due_date)}
            {isOverdue && <p className="text-[10px] font-semibold text-red-500">OVERDUE</p>}
            {isPaid && inv.paid_at && (
              <p className="text-[10px] text-emerald-600">Paid {fmtDate(inv.paid_at)}</p>
            )}
          </div>
        );
      },
    },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: ({ row: { original: inv } }) => {
        const s = STATUS_STYLE[inv.status] ?? STATUS_STYLE.PENDING;
        return (
          <span className={cn('rounded-full px-2.5 py-1 text-[11px] font-semibold whitespace-nowrap', s.badge)}>
            {s.label}
          </span>
        );
      },
    },
    {
      id: 'actions',
      header: '',
      enableHiding: false,
      cell: ({ row: { original: inv } }) =>
        inv.status !== 'PAID' && inv.status !== 'CANCELLED' ? (
          <Button
            size="sm"
            variant="outline"
            className="h-7 text-xs gap-1 text-emerald-700 border-emerald-200 hover:bg-emerald-50"
            onClick={() => openPayModal(inv)}
          >
            <CreditCard size={11} />
            Mark Paid
          </Button>
        ) : null,
    },
  ], []); // eslint-disable-line react-hooks/exhaustive-deps

  // ─────────────────────────────────────────────────────────────────────────
  return (
    <div className="space-y-5">

      {/* ── Header ── */}
      <PageHeader
        title="🧾 Invoices"
        description="View and manage all institute invoices — paid and unpaid"
        action={
          <Button variant="outline" size="sm" onClick={() => refetch()} disabled={isFetching} className="gap-1.5">
            <RefreshCw size={13} className={cn(isFetching && 'animate-spin')} />
            Refresh
          </Button>
        }
      />

      {/* ── Error banner ── */}
      {isError && (
        <div className="flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-4 py-2.5 text-sm text-red-700">
          <X size={15} />
          <span>{error?.response?.data?.message ?? error?.message ?? 'Cannot connect to backend'}</span>
          <Button variant="ghost" size="sm" className="ml-auto h-7 text-red-600" onClick={() => refetch()}>
            Retry
          </Button>
        </div>
      )}

      {/* ── Summary Stats ── */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <StatsCard
          label="Total Invoices"
          value={isLoading ? '…' : total}
          icon={<Receipt size={16} />}
        />
        <StatsCard
          label="Paid"
          value={isLoading ? '…' : (summary.PAID ?? 0)}
          icon={<CheckCircle2 size={16} />}
          valueClassName="text-emerald-600"
        />
        <StatsCard
          label="Pending / Overdue"
          value={isLoading ? '…' : ((summary.PENDING ?? 0) + (summary.OVERDUE ?? 0))}
          icon={<AlertTriangle size={16} />}
          valueClassName="text-amber-600"
        />
        <StatsCard
          label="Total Collected"
          value={isLoading ? '…' : `PKR ${((summary.total_paid_amount ?? 0) / 1000).toFixed(0)}K`}
          icon={<TrendingUp size={16} />}
          valueClassName="text-violet-600"
        />
      </div>

      {/* ── DataTable ── */}
      <DataTable
        columns={columns}
        data={invoices}
        loading={isLoading || isFetching}
        enableColumnVisibility
        exportConfig={{ fileName: 'invoices', dateField: 'created_at' }}
        filters={[
          {
            name: 'status',
            label: 'Status',
            value: statusFilter,
            onChange: handleStatusChange,
            options: STATUS_OPTIONS,
          },
        ]}
        action={
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1.5">
              <span className="text-xs text-muted-foreground whitespace-nowrap">From</span>
              <Input
                type="date"
                value={dateFrom}
                onChange={(e) => handleDateFrom(e.target.value)}
                className="h-9 w-36 text-sm"
              />
            </div>
            <div className="flex items-center gap-1.5">
              <span className="text-xs text-muted-foreground whitespace-nowrap">To</span>
              <Input
                type="date"
                value={dateTo}
                onChange={(e) => handleDateTo(e.target.value)}
                className="h-9 w-36 text-sm"
              />
            </div>
            {(dateFrom || dateTo) && (
              <Button
                variant="ghost"
                size="sm"
                className="h-9 w-9 p-0 text-muted-foreground"
                onClick={() => { handleDateFrom(''); handleDateTo(''); }}
              >
                <X size={13} />
              </Button>
            )}
          </div>
        }
        pagination={{ page, totalPages, total, onPageChange: setPage }}
      />

      {/* ── Mark as Paid Modal ── */}
      {payModal && (
        <AppModal
          open={!!payModal}
          onClose={() => {
            setPayModal(null);
            reset({ payment_method: 'MANUAL' });
          }}
          title="✅ Mark Invoice as Paid"
          description={`${payModal.invoice_number ?? 'Invoice'} — ${payModal.institute?.institute_name ?? ''}`}
          size="sm"
          footer={
            <>
              <Button
                variant="outline"
                onClick={() => {
                  setPayModal(null);
                  reset({ payment_method: 'MANUAL' });
                }}
                disabled={markPaidMutation.isPending}
              >
                Cancel
              </Button>
              <Button
                onClick={handleConfirmPaid}
                disabled={markPaidMutation.isPending}
                className="gap-1.5 min-w-[130px]"
              >
                {markPaidMutation.isPending
                  ? <Loader2 size={14} className="animate-spin" />
                  : <CheckCircle2 size={14} />}
                {markPaidMutation.isPending ? 'Saving…' : 'Confirm Paid'}
              </Button>
            </>
          }
        >
          <div className="space-y-3">
            {/* Invoice summary */}
            <div className="rounded-lg bg-muted/50 p-3 space-y-1 text-xs">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Amount</span>
                <strong>{fmtAmt(payModal.total_amount, payModal.currency)}</strong>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Period</span>
                <span>{fmtDate(payModal.period_start)} – {fmtDate(payModal.period_end)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Due Date</span>
                <span className={payModal.status === 'OVERDUE' ? 'text-red-600 font-semibold' : ''}>
                  {fmtDate(payModal.due_date)}
                </span>
              </div>
            </div>

            {/* Payment method (SelectField controlled by react-hook-form) */}
            <div>
              <SelectField
                label="Payment Method"
                name="payment_method"
                control={control}
                options={PAYMENT_METHODS}
                required
              />
            </div>

            {/* Reference */}
            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-1.5">
                Reference / Transaction ID{' '}
                <span className="font-normal">(optional)</span>
              </label>
              <Input
                value={payForm.payment_reference}
                onChange={(e) => setPayForm((p) => ({ ...p, payment_reference: e.target.value }))}
                placeholder="e.g. TXN-20240101-001"
                className="h-9"
              />
            </div>

            {/* Notes */}
            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-1.5">
                Notes <span className="font-normal">(optional)</span>
              </label>
              <textarea
                value={payForm.notes}
                onChange={(e) => setPayForm((p) => ({ ...p, notes: e.target.value }))}
                rows={2}
                placeholder="Any additional notes…"
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring resize-none"
              />
            </div>
          </div>
        </AppModal>
      )}
    </div>
  );
}
