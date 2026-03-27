'use client';

import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Download, CheckCircle } from 'lucide-react';
import { toast } from 'sonner';

import { payrollService } from '@/services';
import useAuthStore from '@/store/authStore';
import { PERMISSIONS, PAYROLL_STATUS, LEAVE_TYPES, LEAVE_STATUS, MONTHS } from '@/constants';
import { formatCurrency, formatDate } from '@/lib/utils';
import {
  PageHeader, DataTable, StatusBadge, TableRowActions,
  ConfirmDialog, AppModal, StatsCard,
} from '@/components/common';
import { Button } from '@/components/ui/button';
import { Badge }  from '@/components/ui/badge';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

const extractRows  = (d) => d?.data?.rows ?? d?.data ?? [];
const extractPages = (d) => d?.data?.totalPages ?? 1;

const TABS = ['Payslips', 'Salary Grades', 'Leave Requests'];

const PAYROLL_COLOURS = {
  generated: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/40 dark:text-yellow-300',
  paid:      'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300',
  cancelled: 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300',
};
const LEAVE_COLOURS = {
  pending:  'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/40 dark:text-yellow-300',
  approved: 'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300',
  rejected: 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300',
};

const MONTH_LABELS = Object.fromEntries(
  (MONTHS ?? []).map(({ value, label }) => [String(value), label])
);

/* ─── Payslip columns ─────────────────────────────────────────── */
const payslipColumns = (onMarkPaid, canMark) => [
  {
    id: 'employee',
    header: 'Employee',
    cell: ({ row }) => {
      const p = row.original;
      return (
        <div>
          <p className="font-medium text-sm">{p.teacher_name ?? p.employee_name ?? '—'}</p>
          <p className="text-xs text-muted-foreground">{p.designation ?? ''}</p>
        </div>
      );
    },
  },
  {
    id: 'period',
    header: 'Period',
    cell: ({ row }) => {
      const p = row.original;
      return <span className="text-sm">{MONTH_LABELS[String(p.month)] ?? p.month} {p.year}</span>;
    },
  },
  {
    id: 'gross',
    header: 'Gross',
    cell: ({ row }) => <span className="text-sm font-medium">{formatCurrency(row.original.gross_salary ?? 0)}</span>,
  },
  {
    id: 'deductions',
    header: 'Deductions',
    cell: ({ row }) => <span className="text-sm text-red-500">-{formatCurrency(row.original.total_deductions ?? 0)}</span>,
  },
  {
    id: 'net',
    header: 'Net Pay',
    cell: ({ row }) => <span className="text-sm font-bold">{formatCurrency(row.original.net_salary ?? 0)}</span>,
  },
  {
    id: 'status',
    header: 'Status',
    cell: ({ row }) => {
      const s = row.original.status ?? 'generated';
      return <span className={`rounded-full px-2 py-0.5 text-xs font-medium capitalize ${PAYROLL_COLOURS[s] ?? ''}`}>{s}</span>;
    },
  },
  {
    id: 'actions',
    header: '',
    enableHiding: false,
    cell: ({ row }) => {
      const p = row.original;
      const extraActions = [];
      if (canMark && p.status === 'generated') {
        extraActions.push({ label: 'Mark as Paid', onClick: () => onMarkPaid(p.id), icon: CheckCircle });
      }
      return <TableRowActions extraActions={extraActions} />;
    },
  },
];

/* ─── Leave Request columns ───────────────────────────────────── */
const leaveColumns = (onApprove, onReject, canApprove) => [
  {
    id: 'employee',
    header: 'Employee',
    cell: ({ row }) => {
      const l = row.original;
      return (
        <div>
          <p className="font-medium text-sm">{l.teacher_name ?? l.employee_name ?? '—'}</p>
          <p className="text-xs text-muted-foreground">{l.designation ?? ''}</p>
        </div>
      );
    },
  },
  {
    id: 'type',
    header: 'Type',
    cell: ({ row }) => <Badge variant="outline" className="capitalize text-xs">{row.original.leave_type ?? '—'}</Badge>,
  },
  {
    id: 'dates',
    header: 'Dates',
    cell: ({ row }) => {
      const l = row.original;
      return (
        <span className="text-sm text-muted-foreground">
          {formatDate(l.start_date)} → {formatDate(l.end_date)}
          {l.days && <span className="ml-1 text-xs">({l.days}d)</span>}
        </span>
      );
    },
  },
  {
    id: 'reason',
    header: 'Reason',
    cell: ({ row }) => <span className="text-sm text-muted-foreground line-clamp-1">{row.original.reason ?? '—'}</span>,
  },
  {
    id: 'status',
    header: 'Status',
    cell: ({ row }) => {
      const s = row.original.status ?? 'pending';
      return <span className={`rounded-full px-2 py-0.5 text-xs font-medium capitalize ${LEAVE_COLOURS[s] ?? ''}`}>{s}</span>;
    },
  },
  {
    id: 'actions',
    header: '',
    enableHiding: false,
    cell: ({ row }) => {
      const l = row.original;
      const extraActions = [];
      if (canApprove && l.status === 'pending') {
        extraActions.push({ label: 'Approve', onClick: () => onApprove(l.id) });
        extraActions.push({ label: 'Reject',  onClick: () => onReject(l.id)  });
      }
      return <TableRowActions extraActions={extraActions} />;
    },
  },
];

/* ─── Salary grade columns ───────────────────────────────────── */
const gradeColumns = () => [
  { accessorKey: 'grade',    header: 'Grade', cell: ({ getValue }) => <span className="font-mono font-semibold text-sm">{getValue()}</span> },
  { accessorKey: 'title',    header: 'Title' },
  { id: 'range', header: 'Salary Range', cell: ({ row }) => <span className="text-sm">{formatCurrency(row.original.min_salary ?? 0)} – {formatCurrency(row.original.max_salary ?? 0)}</span> },
  { id: 'allowances', header: 'Allowances', cell: ({ row }) => <span className="text-sm text-muted-foreground">{row.original.allowance_percent ?? 0}%</span> },
];

/* ─── Main component ───────────────────────────────────────────── */
export default function PayrollPage() {
  const qc = useQueryClient();

  const canGenerate = useAuthStore((s) => s.canDo(PERMISSIONS.PAYROLL_GENERATE));
  const canMark     = useAuthStore((s) => s.canDo(PERMISSIONS.PAYROLL_MARK_PAID));
  const canApprove  = useAuthStore((s) => s.canDo(PERMISSIONS.LEAVE_APPROVE));
  const canCreate   = useAuthStore((s) => s.canDo(PERMISSIONS.PAYROLL_READ));

  const [mounted, setMounted] = useState(false);
  useEffect(() => { setMounted(true); }, []);

  const [activeTab, setActiveTab] = useState(0);
  const [page,       setPage]     = useState(1);
  const [pageSize,   setPageSize] = useState(10);

  /* generate payroll */
  const [genOpen, setGenOpen] = useState(false);
  const [genForm, setGenForm] = useState({ month: new Date().getMonth() + 1, year: new Date().getFullYear() });

  /* ── Payslips query ── */
  const { data: payslipsData, isLoading: psLoading } = useQuery({
    queryKey: ['payslips', { page, pageSize }],
    queryFn:  () => payrollService.getPayslips({ page, limit: pageSize }),
    enabled:  activeTab === 0,
  });

  /* ── Leave requests query ── */
  const { data: leaveData, isLoading: leaveLoading } = useQuery({
    queryKey: ['leave-requests', { page, pageSize }],
    queryFn:  () => payrollService.getLeaveRequests({ page, limit: pageSize }),
    enabled:  activeTab === 2,
  });

  /* ── Salary grades query ── */
  const { data: gradesData, isLoading: gradesLoading } = useQuery({
    queryKey: ['salary-grades'],
    queryFn:  () => payrollService.getSalaryGrades(),
    enabled:  activeTab === 1,
  });

  const payslips   = extractRows(payslipsData);
  const psPages    = extractPages(payslipsData);
  const psTotal    = payslipsData?.data?.total ?? payslips.length;

  const leaves     = extractRows(leaveData);
  const leavePages = extractPages(leaveData);
  const leaveTotal = leaveData?.data?.total ?? leaves.length;

  const grades     = extractRows(gradesData);

  const markPaidMutation = useMutation({
    mutationFn: (id) => payrollService.markPaid(id),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['payslips'] }); toast.success('Marked as paid'); },
    onError:   (e) => toast.error(e?.response?.data?.message ?? 'Failed'),
  });

  const approveLeaveMutation = useMutation({
    mutationFn: (id) => payrollService.approveLeave(id),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['leave-requests'] }); toast.success('Leave approved'); },
    onError:   (e) => toast.error(e?.response?.data?.message ?? 'Failed'),
  });

  const rejectLeaveMutation = useMutation({
    mutationFn: (id) => payrollService.rejectLeave(id),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['leave-requests'] }); toast.success('Leave rejected'); },
    onError:   (e) => toast.error(e?.response?.data?.message ?? 'Failed'),
  });

  const generateMutation = useMutation({
    mutationFn: (body) => payrollService.generatePayroll(body),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['payslips'] }); toast.success('Payroll generated'); setGenOpen(false); setActiveTab(0); },
    onError:   (e) => toast.error(e?.response?.data?.message ?? 'Failed'),
  });

  const psColumns    = payslipColumns((id) => markPaidMutation.mutate(id), canMark);
  const lvColumns    = leaveColumns((id) => approveLeaveMutation.mutate(id), (id) => rejectLeaveMutation.mutate(id), canApprove);
  const grColumns    = gradeColumns();

  if (!mounted) return null;

  return (
    <div className="space-y-4">
      <PageHeader
        title="Payroll"
        description="Salary management, payslips, and leave requests"
        action={
          canGenerate && activeTab === 0 && (
            <Button onClick={() => setGenOpen(true)} size="sm">
              <Plus className="w-4 h-4 mr-1.5" /> Generate Payroll
            </Button>
          )
        }
      />

      {/* Tabs */}
      <div className="flex gap-1 border-b">
        {TABS.map((tab, i) => (
          <button
            key={tab}
            onClick={() => { setActiveTab(i); setPage(1); }}
            className={`px-4 py-2.5 text-sm font-medium transition-colors border-b-2 -mb-px ${
              activeTab === i
                ? 'border-primary text-primary'
                : 'border-transparent text-muted-foreground hover:text-foreground'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Payslips tab */}
      {activeTab === 0 && (
        <DataTable
          columns={psColumns}
          data={payslips}
          loading={psLoading}
          exportConfig={{ fileName: 'payslips' }}
          pagination={{ page, totalPages: psPages, onPageChange: setPage, total: psTotal, pageSize, onPageSizeChange: (s) => { setPageSize(s); setPage(1); } }}
        />
      )}

      {/* Salary Grades tab */}
      {activeTab === 1 && (
        <DataTable
          columns={grColumns}
          data={grades}
          loading={gradesLoading}
        />
      )}

      {/* Leave Requests tab */}
      {activeTab === 2 && (
        <DataTable
          columns={lvColumns}
          data={leaves}
          loading={leaveLoading}
          exportConfig={{ fileName: 'leave-requests' }}
          pagination={{ page, totalPages: leavePages, onPageChange: setPage, total: leaveTotal, pageSize, onPageSizeChange: (s) => { setPageSize(s); setPage(1); } }}
        />
      )}

      {/* Generate payroll modal */}
      <AppModal open={genOpen} onClose={() => setGenOpen(false)} title="Generate Payroll">
        <div className="space-y-4 py-1">
          <p className="text-sm text-muted-foreground">
            This will generate payslips for all active staff for the selected month.
          </p>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>Month</Label>
              <Select
                value={String(genForm.month)}
                onValueChange={(v) => setGenForm((p) => ({ ...p, month: Number(v) }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {(MONTHS ?? []).map(({ value, label }) => (
                    <SelectItem key={value} value={String(value)}>{label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Year</Label>
              <Input
                type="number"
                value={genForm.year}
                onChange={(e) => setGenForm((p) => ({ ...p, year: Number(e.target.value) }))}
                min="2020" max="2099"
              />
            </div>
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" size="sm" onClick={() => setGenOpen(false)} disabled={generateMutation.isPending}>Cancel</Button>
            <Button size="sm" disabled={generateMutation.isPending} onClick={() => generateMutation.mutate(genForm)}>
              {generateMutation.isPending ? 'Generating…' : 'Generate'}
            </Button>
          </div>
        </div>
      </AppModal>
    </div>
  );
}
