'use client';

import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { CheckCircle, FileText, DownloadCloud } from 'lucide-react';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { createRoot } from 'react-dom/client';
import { toast } from 'sonner';

import { payrollService } from '@/services';
import useAuthStore from '@/store/authStore';
import { PERMISSIONS, MONTHS } from '@/constants';
import { formatCurrency, formatDate } from '@/lib/utils';
import {
  PageHeader, DataTable, TableRowActions, AppModal,
} from '@/components/common';
import { Button } from '@/components/ui/button';
import { Badge }  from '@/components/ui/badge';
import PayslipTemplate from '@/components/payroll/PayslipTemplate';

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
const payslipColumns = (onMarkPaid, onViewPayslip, onDownloadPayslip, canMark) => [
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
      extraActions.push({ label: 'View Payslip', onClick: () => onViewPayslip(p), icon: FileText });
      extraActions.push({ label: 'Download Payslip', onClick: () => onDownloadPayslip(p), icon: DownloadCloud });
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

  const canDownload = useAuthStore((s) =>
    s.canDoAny([
      PERMISSIONS.PAYROLL_GENERATE,
      'payroll.process',
      PERMISSIONS.PAYROLL_CREATE,
      PERMISSIONS.PAYROLL_READ,
    ])
  );
  const canMark     = useAuthStore((s) =>
    s.canDoAny([
      PERMISSIONS.PAYROLL_UPDATE,
      'payroll.process',
    ])
  );
  const canApprove  = useAuthStore((s) => s.canDo(PERMISSIONS.LEAVE_APPROVE));
  const canCreate   = useAuthStore((s) => s.canDo(PERMISSIONS.PAYROLL_READ));

  const [mounted, setMounted] = useState(false);
  useEffect(() => { setMounted(true); }, []);

  const [activeTab, setActiveTab] = useState(0);
  const [page,       setPage]     = useState(1);
  const [pageSize,   setPageSize] = useState(10);
  const [selectedPayslip, setSelectedPayslip] = useState(null);

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

  const downloadPayslipAsPdf = async (record) => {
    if (!record) {
      toast.error('No payslip selected');
      return;
    }

    const host = document.createElement('div');
    host.style.position = 'fixed';
    host.style.left = '-99999px';
    host.style.top = '0';
    host.style.width = '980px';
    host.style.zIndex = '-1';
    document.body.appendChild(host);

    const root = createRoot(host);
    root.render(<PayslipTemplate record={record} className="rounded-none shadow-none" />);

    try {
      await new Promise((resolve) => setTimeout(resolve, 120));
      const payslipElement = host.querySelector('.payslip-print') ?? host.firstElementChild;
      if (!payslipElement) throw new Error('Payslip template not found');

      const canvas = await html2canvas(payslipElement, {
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: '#ffffff',
      });

      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const imgWidth = 210;
      const pageHeight = 295;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      let heightLeft = imgHeight;
      let position = 0;

      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;
      while (heightLeft >= 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
      }

      const employeeName = (record.teacher_name || record.employee_name || 'staff').replace(/\s+/g, '_');
      const monthLabel = MONTH_LABELS[String(record.month)] || record.month || 'period';
      pdf.save(`payslip-${employeeName}-${monthLabel}-${record.year || new Date().getFullYear()}.pdf`);
      toast.success('Payslip downloaded');
    } catch {
      toast.error('Failed to download payslip');
    } finally {
      root.unmount();
      host.remove();
    }
  };

  const psColumns    = payslipColumns(
    (id) => markPaidMutation.mutate(id),
    (row) => setSelectedPayslip(row),
    (row) => downloadPayslipAsPdf(row),
    canMark,
  );
  const lvColumns    = leaveColumns((id) => approveLeaveMutation.mutate(id), (id) => rejectLeaveMutation.mutate(id), canApprove);
  const grColumns    = gradeColumns();

  if (!mounted) return null;

  return (
    <div className="space-y-4">
      <PageHeader
        title="Payroll"
        description="Salary management, payslips, and leave requests"
        action={
          canDownload && activeTab === 0 && (
            <Button
              onClick={() => {
                const target = selectedPayslip ?? payslips?.[0] ?? null;
                if (!target) {
                  toast.error('No payslip available to download');
                  return;
                }
                downloadPayslipAsPdf(target);
              }}
              size="sm"
            >
              <DownloadCloud className="w-4 h-4 mr-1.5" /> Download Payslip
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

      <AppModal
        open={!!selectedPayslip}
        onClose={() => setSelectedPayslip(null)}
        title="Payslip Preview"
        size="xl"
        footer={
          <div className="flex items-center gap-2 payslip-no-print">
            <Button variant="outline" size="sm" onClick={() => setSelectedPayslip(null)}>
              Close
            </Button>
            <Button size="sm" onClick={() => downloadPayslipAsPdf(selectedPayslip)}>
              <DownloadCloud className="h-4 w-4 mr-1" /> Download PDF
            </Button>
          </div>
        }
      >
        <PayslipTemplate record={selectedPayslip} />
      </AppModal>
    </div>
  );
}
