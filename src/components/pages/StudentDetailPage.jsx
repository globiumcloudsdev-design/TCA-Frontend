/**
 * StudentDetailPage — beautiful profile view for a student/candidate/trainee
 * Route: /[type]/students/[id]
 */
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  ArrowLeft, Pencil, User, Phone, Mail, MapPin, Calendar,
  GraduationCap, BookOpen, TrendingUp, DollarSign, CheckSquare,
  ChevronRight, Hash, Users, ShieldCheck, Clock, AlertCircle, Receipt,
  UserCheck,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import useInstituteConfig from '@/hooks/useInstituteConfig';
import { DUMMY_FLAT_STUDENTS } from '@/data/dummyData';
import useAuthStore from '@/store/authStore';
import { toast } from 'sonner';
import FeeVoucherForm from '@/components/forms/FeeVoucherForm';
import { generateAndDownloadIdCard } from '@/lib/idCardGenerator';
import useInstituteStore from '@/store/instituteStore';
import { FileText, Download, Eye, CreditCard, Trash2 } from 'lucide-react';
import useUIStore from '@/store/uiStore';
import ResultCard from '@/components/cards/ResultCard';
import { DataTable, StatsCard, AppModal, ConfirmDialog, InputField, SelectField, TextareaField, FormSubmitButton } from '@/components/common';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';

// ─── Helpers ─────────────────────────────────────────────
function initials(s) {
  if (!s) return '?';
  const parts = [s.first_name, s.last_name].filter(Boolean);
  return parts.map((p) => p[0]?.toUpperCase()).join('');
}

function formatDate(d) {
  if (!d) return '—';
  const date = new Date(d);
  if (isNaN(date.getTime())) return '—';
  return date.toLocaleDateString('en-PK', { year: 'numeric', month: 'long', day: 'numeric' });
}

function age(dob) {
  if (!dob) return null;
  const diff = Date.now() - new Date(dob).getTime();
  return Math.floor(diff / (1000 * 60 * 60 * 24 * 365.25));
}

import {
  Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer, Tooltip as RechartsTooltip,
  LineChart, Line, XAxis, YAxis, CartesianGrid, Legend
} from 'recharts';
import { generateAndDownloadSLC } from '@/lib/pdf/slcPdf';
import { generateAcademicProfile } from '@/lib/pdf/academicProfilePdf';
import { generateAndDownloadFeeVoucherPdf } from '@/lib/pdf/feeVoucherPdf';
import { studentService } from '@/services/studentService';
import { feeVoucherService, decomposeVouchersForPayment, computeVoucherMonthLabel } from '@/services/feeVoucherService';
import { feePaymentService } from '@/services/feePaymentService';

const TABS = ['Overview', 'Attendance', 'Fees', 'Exams', 'Documents', 'Behavioral'];

// ========== OVERVIEW TAB (with Start & End Dates) ==========
function OverviewTab({ student, terms, currentInstitute }) {
  const sDetails = student.details?.studentDetails || {};
  const sessions = sDetails.academicSessions || [];
  const guardians = sDetails.guardians || [];

  const guardianColumns = [
    { accessorKey: 'name', header: 'Name', cell: ({ row }) => <span className="font-medium">{row.original.name || '—'}</span> },
    { accessorKey: 'relation', header: 'Relation', cell: ({ row }) => <span className="capitalize">{row.original.relation || row.original.type || '—'}</span> },
    { accessorKey: 'phone', header: 'Phone', cell: ({ row }) => <span className="font-mono">{row.original.phone || '—'}</span> },
    { accessorKey: 'email', header: 'Email', cell: ({ row }) => row.original.email || '—' },
    { accessorKey: 'cnic', header: 'CNIC', cell: ({ row }) => <span className="font-mono">{row.original.cnic || '—'}</span> }
  ];

  const sessionColumns = [
    { accessorKey: 'academic_year_name', header: 'Academic Year', cell: ({ row }) => <span className="font-bold text-primary">{row.original.academic_year_name || '—'}</span> },
    { id: 'class_section', header: 'Class & Section', cell: ({ row }) => `${row.original.class_name || '—'} ${row.original.section_name ? ` · ${row.original.section_name}` : ''}` },
    { accessorKey: 'roll_no', header: 'Roll No', cell: ({ row }) => <span className="font-mono text-xs">{row.original.roll_no || '—'}</span> },
    { accessorKey: 'start_date', header: 'Start Date', cell: ({ row }) => <span className="text-muted-foreground">{row.original.start_date ? formatDate(row.original.start_date) : '—'}</span> },
    { accessorKey: 'end_date', header: 'End Date', cell: ({ row }) => <span className="text-muted-foreground">{row.original.end_date ? formatDate(row.original.end_date) : (row.original.status === 'active' ? 'Ongoing' : '—')}</span> },
    { accessorKey: 'status', header: 'Status', cell: ({ row }) => (
        <span className={cn(
          'rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider',
          row.original.status === 'active' ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-100 text-gray-600'
        )}>
          {row.original.status === 'active' ? 'Active' : 'Completed'}
        </span>
      )
    },
    {
      id: 'actions',
      cell: ({ row }) => (
        <Button
          variant="outline"
          size="sm"
          onClick={() => {
            toast.loading("Generating Academic Profile...", { id: "academic-profile" });
            try {
              generateAcademicProfile({ student, session: row.original, institute: currentInstitute });
              toast.success("Profile Generated", { id: "academic-profile" });
            } catch (err) {
              toast.error("Failed to generate profile", { id: "academic-profile" });
            }
          }}
          className="text-xs"
        >
          Download Report
        </Button>
      )
    }
  ];

  const idLabel = {
    school: 'Roll Number',
    coaching: 'Candidate ID',
    academy: 'Trainee ID',
    college: 'Enrollment No.',
    university: 'Registration No.',
  };

  const rollNo = student.registration_no || sDetails.roll_no || student.roll_number || student.candidate_id;
  const className = sDetails.class_name || student.class?.name || '—';
  const section = sDetails.section_name || student.section?.name || '—';

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      {/* Personal Info */}
      <div className="rounded-xl border bg-card shadow-sm overflow-hidden flex flex-col">
        <div className="flex items-center gap-2 border-b bg-muted/30 px-4 py-3">
          <User size={16} className="text-primary" />
          <h3 className="text-sm font-bold uppercase tracking-wide">Personal Details</h3>
        </div>
        {[
          student.registration_no, student.first_name, student.last_name, sDetails.gender, student.gender,
          sDetails.date_of_birth, student.date_of_birth, sDetails.blood_group, student.email, student.phone,
          sDetails.nationality, sDetails.present_address, student.address, sDetails.permanent_address
        ].some(v => v && v !== '—') ? (
          <>
            <div className="p-4 grid grid-cols-1 sm:grid-cols-2 gap-x-6">
              <InfoRow icon={Hash} label="Registration No" value={student.registration_no} />
              <InfoRow icon={User} label="Full Name" value={`${student.first_name || ''} ${student.last_name || ''}`.trim()} />
              <InfoRow icon={Users} label="Gender" value={sDetails.gender || student.gender} />
              <InfoRow icon={Calendar} label="Date of Birth" value={formatDate(sDetails.date_of_birth || student.date_of_birth)} />
              <InfoRow icon={ShieldCheck} label="Blood Group" value={sDetails.blood_group} />
              <InfoRow icon={Mail} label="Email" value={student.email} />
              <InfoRow icon={Phone} label="Phone" value={student.phone} />
              <InfoRow icon={MapPin} label="Nationality" value={sDetails.nationality} />
            </div>
            <div className="px-4 pb-4">
              <InfoRow icon={MapPin} label="Present Address" value={sDetails.present_address || student.address} />
              <InfoRow icon={MapPin} label="Permanent Address" value={sDetails.permanent_address} />
            </div>
          </>
        ) : (
          <NoDataPlaceholder />
        )}
      </div>

      {/* Academic Info */}
      <div className="rounded-xl border bg-card shadow-sm overflow-hidden flex flex-col">
        <div className="flex items-center gap-2 border-b bg-muted/30 px-4 py-3">
          <GraduationCap size={16} className="text-primary" />
          <h3 className="text-sm font-bold uppercase tracking-wide">Academic Info</h3>
        </div>
        {[
          rollNo, className, section, sDetails.admission_date, sDetails.previous_school
        ].some(v => v && v !== '—') ? (
          <div className="p-4 grid grid-cols-1 sm:grid-cols-2 gap-x-6">
            <InfoRow icon={BookOpen} label={idLabel[terms?.type] ?? 'Roll Number'} value={rollNo} />
            <InfoRow icon={BookOpen} label={terms?.class ?? 'Class'} value={className} />
            <InfoRow icon={BookOpen} label={terms?.section ?? 'Section'} value={section} />
            <InfoRow icon={Calendar} label="Admission Date" value={formatDate(sDetails.admission_date)} />
            <InfoRow icon={ShieldCheck} label="Current Status" value={student.is_active ? 'Active' : 'Inactive'} />
            <InfoRow icon={TrendingUp} label="Previous School" value={sDetails.previous_school} />
          </div>
        ) : (
          <NoDataPlaceholder />
        )}
      </div>

      {/* Guardians Table */}
      <div className="rounded-xl border bg-card shadow-sm overflow-hidden lg:col-span-2">
        <div className="flex items-center gap-2 border-b bg-muted/30 px-4 py-3">
          <Users size={16} className="text-primary" />
          <h3 className="text-sm font-bold uppercase tracking-wide">Family & Guardian Details</h3>
        </div>
        <DataTable columns={guardianColumns} data={guardians} emptyMessage="No guardian information found." />
      </div>

      {/* Academic Sessions History - with Academic Year Name & End Date */}
      <div className="rounded-xl border bg-card shadow-sm overflow-hidden lg:col-span-2">
        <div className="flex items-center gap-2 border-b bg-muted/30 px-4 py-3">
          <Clock size={16} className="text-primary" />
          <h3 className="text-sm font-bold uppercase tracking-wide">Academic Session History</h3>
        </div>
        <DataTable columns={sessionColumns} data={sessions} emptyMessage="No academic session records found." />
      </div>
    </div>
  );
}

// ─── No Data Component ──────────────────────────────────
function NoDataPlaceholder({ message = 'Data Not Found' }) {
  return (
    <div className="p-8 text-center flex flex-col items-center justify-center gap-2">
      <AlertCircle size={20} className="text-muted-foreground/30" />
      <p className="text-xs text-muted-foreground italic font-medium">{message}</p>
    </div>
  );
}

// ─── InfoRow component (used inside Overview) ───────────
function InfoRow({ icon: Icon, label, value }) {
  if (!value || value === '—') return null;
  return (
    <div className="flex items-start gap-3 py-2.5 border-b last:border-0">
      <div className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-muted text-muted-foreground">
        <Icon size={12} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-xs text-muted-foreground">{label}</p>
        <p className="text-sm font-medium truncate">{value}</p>
      </div>
    </div>
  );
}

// ========== ATTENDANCE TAB ==========
function AttendanceTab({ student }) {
  const attendances = student.studentAttendances || [];
  const totalDays = attendances.length;
  const presentDays = attendances.filter(a => a.status === 'present').length;
  const absentDays = attendances.filter(a => a.status === 'absent').length;
  const lateDays = attendances.filter(a => a.status === 'late' || a.status === 'half_day').length;
  const leaveDays = attendances.filter(a => a.status === 'leave').length;
  const pct = totalDays ? Math.round(((presentDays + lateDays + leaveDays) / totalDays) * 100) : 0;

  const attendanceColumns = [
    { accessorKey: 'date', header: 'Date', cell: ({ row }) => formatDate(row.original.date) },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: ({ row }) => (
        <span className={cn(
          'rounded-full px-2.5 py-1 text-[11px] font-bold uppercase',
          row.original.status === 'present' ? 'bg-emerald-100 text-emerald-700' :
          row.original.status === 'absent' ? 'bg-red-100 text-red-700' :
          row.original.status === 'late' ? 'bg-amber-100 text-amber-700' :
          row.original.status === 'leave' ? 'bg-blue-100 text-blue-700' :
          'bg-gray-100 text-gray-700'
        )}>
          {row.original.status}
        </span>
      )
    },
    { accessorKey: 'remarks', header: 'Remarks', cell: ({ row }) => row.original.remarks || (row.original.leave_request_id ? 'System Approved Leave' : '—') }
  ];

  return (
    <div className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-5">
        <StatsCard label="Attendance %" value={`${pct}%`} description="Historical" />
        <StatsCard label="Total Records" value={totalDays} description="Entries" />
        <StatsCard label="Present" value={presentDays} description="Days" />
        <StatsCard label="Absent" value={absentDays} description="Days" />
        <StatsCard label="Leaves" value={leaveDays} description="Approved" />
      </div>
      <DataTable columns={attendanceColumns} data={attendances} emptyMessage="No attendance records found." enableColumnVisibility />
    </div>
  );
}

// ========== FEES TAB ==========
function FeesTab({ student, currentInstitute, onGenerateVoucher }) {
  const { data: voucherData, isLoading: loadingVouchers } = useQuery({
    queryKey: ['student-vouchers', student?.id],
    queryFn: async () => {
      if (!student?.id) return [];
      const vouchersMap = new Map();

      const addVouchers = (list) => {
        if (!Array.isArray(list)) return;
        for (const item of list) {
          if (!item) continue;
          const id = item.id || item.voucher_id || item.voucherId;
          const key = id ? String(id) : `${item.year || ''}-${item.month || ''}-${item.voucher_number || item.voucherNumber || ''}`;
          if (!vouchersMap.has(key)) {
            vouchersMap.set(key, item);
          }
        }
      };

      // 1. Initial student.feeVouchers
      if (Array.isArray(student.feeVouchers)) {
        addVouchers(student.feeVouchers);
      }

      // 2. Fetch from feeVoucherService
      try {
        const res = await feeVoucherService.getAll(
          { student_id: student.id, studentId: student.id, include_all: true, limit: 1000 },
          { page: 1, limit: 1000 }
        );
        if (Array.isArray(res?.vouchers)) addVouchers(res.vouchers);
      } catch (err) {}

      // 3. Fetch from studentService
      try {
        const unpaid = await studentService.getUnpaidVouchers(student.id);
        if (Array.isArray(unpaid)) addVouchers(unpaid);
      } catch (err) {}

      const rawList = Array.from(vouchersMap.values());
      const decomposed = decomposeVouchersForPayment(rawList);
      return feePaymentService.sortChronologically(decomposed);
    },
    enabled: !!student?.id,
  });

  const { data: paymentReceipts = [], isLoading: loadingPayments } = useQuery({
    queryKey: ['student-payment-receipts', student?.id],
    queryFn: async () => {
      if (!student?.id) return [];
      try {
        const { feeService } = await import('@/services');
        const res = await feeService.getPayments({ student_id: student.id });
        const list = res?.data?.rows || res?.data?.payments || res?.data || res?.rows || (Array.isArray(res) ? res : []);
        return Array.isArray(list) ? list : [];
      } catch (e) {
        return [];
      }
    },
    enabled: !!student?.id,
  });

  const vouchers = Array.isArray(voucherData) && voucherData.length > 0
    ? voucherData
    : (student.feeVouchers || []);

  const totalPaid = vouchers.reduce(
    (acc, v) => acc + Number(v.paid_amount || v.paidAmount || (v.status === 'paid' ? (v.net_amount || v.amount || 0) : 0)),
    0
  );
  const totalPending = feePaymentService.calculateTotalPendingDues(vouchers);

  const feeColumns = [
    {
      accessorKey: 'voucher_number',
      header: 'Voucher #',
      cell: ({ row }) => (
        <span className="font-mono font-semibold text-slate-800 dark:text-slate-200">
          {row.original.voucher_number || row.original.voucherNumber || row.original.voucher_no || '—'}
        </span>
      ),
    },
    {
      accessorKey: 'month',
      header: 'Period',
      cell: ({ row }) => {
        const r = row.original;
        const monthName = r.monthLabel || computeVoucherMonthLabel(r, { withSuffix: true }) || (r.month ? `${r.month}/${r.year || ''}` : '—');
        return <span className="font-semibold text-slate-900 dark:text-slate-100">{monthName}</span>;
      },
    },
    {
      accessorKey: 'base_amount',
      header: 'Base Fee',
      cell: ({ row }) => {
        const r = row.original;
        const base = feePaymentService.getStandaloneBaseAmount(r);
        return <span className="font-medium text-slate-700 dark:text-slate-300">PKR {base.toLocaleString('en-PK')}</span>;
      },
    },
    {
      accessorKey: 'arrears',
      header: 'Prior Arrears',
      cell: ({ row }) => {
        const r = row.original;
        const base = feePaymentService.getStandaloneBaseAmount(r);
        const net = Number(r.net_amount ?? r.netAmount ?? r.amount ?? 0);
        const rawArrears = Number(r.arrears ?? r.previous_arrears ?? r.previousArrears ?? 0);
        const arrears = rawArrears > 0 ? rawArrears : (base > 0 && net > base ? Math.max(0, net - base) : 0);
        return (
          <span className={cn("font-medium", arrears > 0 ? "text-amber-600 dark:text-amber-400 font-bold" : "text-slate-400")}>
            {arrears > 0 ? `+PKR ${arrears.toLocaleString('en-PK')}` : '—'}
          </span>
        );
      },
    },
    {
      accessorKey: 'net_amount',
      header: 'Net Total',
      cell: ({ row }) => {
        const r = row.original;
        const net = Number(r.net_amount || r.netAmount || r.amount || 0);
        const paid = Number(r.paid_amount || r.paidAmount || 0);
        const remaining = Number(r.pending_amount ?? Math.max(0, net - paid));
        return (
          <div className="space-y-0.5">
            <span className="font-bold text-slate-900 dark:text-slate-100">PKR {net.toLocaleString('en-PK')}</span>
            {remaining > 0 ? (
              <p className="text-[11px] text-orange-600 font-semibold">Bal: PKR {remaining.toLocaleString('en-PK')}</p>
            ) : (
              <p className="text-[11px] text-emerald-600 font-semibold">Fully Settled</p>
            )}
          </div>
        );
      },
    },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: ({ row }) => {
        const st = String(row.original.status || 'pending').toLowerCase();
        return (
          <span className={cn(
            'rounded-full px-3 py-1 text-[10px] font-bold uppercase border',
            st === 'paid' ? 'bg-emerald-100 text-emerald-700 border-emerald-200' :
            st === 'partial' ? 'bg-amber-100 text-amber-700 border-amber-200' :
            'bg-rose-100 text-rose-700 border-rose-200'
          )}>
            {st}
          </span>
        );
      },
    },
    {
      accessorKey: 'due_date',
      header: 'Due Date',
      cell: ({ row }) => row.original.due_date ? formatDate(row.original.due_date) : '—',
    },
    {
      id: 'actions',
      header: '',
      cell: ({ row }) => (
        <Button
          variant="outline"
          size="sm"
          className="h-8 gap-1.5 text-xs"
          onClick={() => {
            generateAndDownloadFeeVoucherPdf({
              voucher: row.original,
              student,
              instituteName: currentInstitute?.name || 'Academy',
              logoUrl: currentInstitute?.logo_url,
              institute: currentInstitute,
            });
          }}
        >
          <Download size={13} /> PDF
        </Button>
      ),
    },
  ];

  const paymentColumns = [
    {
      accessorKey: 'receipt_number',
      header: 'Receipt #',
      cell: ({ row }) => (
        <span className="font-mono font-semibold text-slate-800">
          {row.original.receipt_number || row.original.receiptNo || `#REC-${String(row.original.id || '').slice(-6)}`}
        </span>
      ),
    },
    {
      accessorKey: 'payment_date',
      header: 'Payment Date',
      cell: ({ row }) => formatDate(row.original.payment_date || row.original.createdAt),
    },
    {
      accessorKey: 'payment_method',
      header: 'Method',
      cell: ({ row }) => (
        <span className="capitalize font-medium text-slate-700">
          {row.original.payment_method || row.original.method || 'Cash'}
        </span>
      ),
    },
    {
      accessorKey: 'amount_paid',
      header: 'Amount Paid',
      cell: ({ row }) => (
        <span className="font-bold text-emerald-600">
          PKR {Number(row.original.amount_paid || row.original.amount || 0).toLocaleString('en-PK')}
        </span>
      ),
    },
    {
      accessorKey: 'reference_no',
      header: 'Reference #',
      cell: ({ row }) => row.original.reference_no || row.original.transaction_id || '—',
    },
  ];

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold uppercase tracking-wider text-slate-700">Fee Vouchers History (All Months)</h3>
          {onGenerateVoucher && (
            <Button
              size="sm"
              className="h-8 gap-1.5 bg-indigo-600 hover:bg-indigo-700 text-white font-medium text-xs shadow-sm"
              onClick={onGenerateVoucher}
            >
              <Receipt size={14} /> Generate Voucher
            </Button>
          )}
        </div>
        <div className="grid gap-4 sm:grid-cols-3">
          <StatsCard label="Total Paid" value={`PKR ${totalPaid.toLocaleString('en-PK')}`} icon={<DollarSign size={18} />} />
          <StatsCard label="Total Outstanding Dues" value={`PKR ${totalPending.toLocaleString('en-PK')}`} icon={<AlertCircle size={18} />} />
          <StatsCard label="Vouchers Count" value={`${vouchers.filter(v => v.status === 'paid').length} Paid / ${vouchers.length} Total`} icon={<Receipt size={18} />} />
        </div>
        <DataTable
          columns={feeColumns}
          data={vouchers}
          loading={loadingVouchers}
          emptyMessage="No fee vouchers found for this student."
        />
      </div>

      {/* Payment Receipts Table */}
      {paymentReceipts.length > 0 && (
        <div className="space-y-3 pt-2">
          <h3 className="text-sm font-bold uppercase tracking-wider text-slate-700">Payment Receipts History</h3>
          <DataTable
            columns={paymentColumns}
            data={paymentReceipts}
            loading={loadingPayments}
            emptyMessage="No payment receipts recorded yet."
          />
        </div>
      )}
    </div>
  );
}

// ========== EXAMS TAB (With Analytics) ==========
function ExamsTab({ student }) {
  const [selectedResult, setSelectedResult] = useState(null);
  const results = student.examResults || [];

  const examColumns = [
    { accessorKey: 'total_marks_obtained', header: 'Obtained Marks', cell: ({ row }) => `${row.original.total_marks_obtained} / ${row.original.total_marks}` },
    { accessorKey: 'percentage', header: 'Percentage', cell: ({ row }) => `${row.original.percentage}%` },
    { accessorKey: 'grade', header: 'Grade' },
    { accessorKey: 'gpa', header: 'GPA' },
    { accessorKey: 'rank', header: 'Rank', cell: ({ row }) => `#${row.original.rank} (${row.original.position})` },
    {
      accessorKey: 'status',
      header: 'Result',
      cell: ({ row }) => (
        <span className={cn(
          'rounded-full px-2.5 py-1 text-[10px] font-bold uppercase',
          row.original.status === 'pass' ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'
        )}>
          {row.original.status}
        </span>
      )
    },
    { accessorKey: 'updated_at', header: 'Release Date', cell: ({ row }) => formatDate(row.original.updated_at || row.original.created_at) },
    {
      id: 'actions',
      cell: ({ row }) => (
        <Button
          variant="outline"
          size="sm"
          onClick={() => setSelectedResult(row.original)}
          className="flex items-center gap-1.5 text-xs"
        >
          <Download size={14} /> Download Result
        </Button>
      )
    }
  ];

  // Prepare data for Analytics
  // Reverse to show chronological order if sorted desc
  const chartData = [...results].reverse().map(r => ({
    name: r.exam_name || r.exam?.name || 'Term Exam',
    percentage: parseFloat(r.percentage || 0),
    gpa: parseFloat(r.gpa || 0)
  }));

  return (
    <div className="space-y-6">
      {chartData.length > 0 && (
        <div className="grid gap-4 lg:grid-cols-2">
          {/* Radar Chart for term overview */}
          <div className="rounded-xl border bg-card p-4 shadow-sm flex flex-col items-center">
            <h4 className="text-sm font-bold uppercase tracking-wider text-muted-foreground mb-4">Performance Radar</h4>
            <div className="h-[250px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart cx="50%" cy="50%" outerRadius="80%" data={chartData}>
                  <PolarGrid />
                  <PolarAngleAxis dataKey="name" tick={{ fontSize: 10 }} />
                  <PolarRadiusAxis angle={30} domain={[0, 100]} />
                  <Radar name="Percentage" dataKey="percentage" stroke="#0ea5e9" fill="#0ea5e9" fillOpacity={0.6} />
                  <RechartsTooltip />
                </RadarChart>
              </ResponsiveContainer>
            </div>
          </div>
          
          {/* Line Chart for progress trend */}
          <div className="rounded-xl border bg-card p-4 shadow-sm flex flex-col items-center">
            <h4 className="text-sm font-bold uppercase tracking-wider text-muted-foreground mb-4">Academic Trend</h4>
            <div className="h-[250px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" tick={{ fontSize: 10 }} />
                  <YAxis domain={[0, 100]} tick={{ fontSize: 10 }} />
                  <RechartsTooltip />
                  <Legend />
                  <Line type="monotone" dataKey="percentage" stroke="#10b981" strokeWidth={2} activeDot={{ r: 8 }} name="Percentage" />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}

      <DataTable columns={examColumns} data={results} emptyMessage="No exam records found." />

      <AppModal 
        open={!!selectedResult} 
        onClose={() => setSelectedResult(null)} 
        title="Exam Result Card"
        className="max-w-4xl"
        size="lg"
      >
        {selectedResult && (
          <div className="pt-4 max-h-[80vh] overflow-y-auto">
            <ResultCard 
              student={student} 
              exam={selectedResult.exam || { name: selectedResult.exam_name }} 
              result={selectedResult} 
            />
          </div>
        )}
      </AppModal>
    </div>
  );
}

// ========== BEHAVIORAL TAB ==========
function BehavioralTab({ student, type, id }) {
  const qc = useQueryClient();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({ type: 'merit', title: '', description: '', points: 0 });

  const behaviorLog = student.details?.studentDetails?.behaviorLog || [];
  
  const columns = [
    { 
      accessorKey: 'date', 
      header: 'Date', 
      cell: ({ row }) => formatDate(row.original.date) 
    },
    { 
      accessorKey: 'type', 
      header: 'Type', 
      cell: ({ row }) => (
        <span className={cn(
          'rounded-full px-2.5 py-1 text-[10px] font-bold uppercase',
          row.original.type === 'merit' ? 'bg-emerald-100 text-emerald-700' :
          row.original.type === 'demerit' ? 'bg-amber-100 text-amber-700' :
          'bg-red-100 text-red-700'
        )}>
          {row.original.type}
        </span>
      )
    },
    { accessorKey: 'title', header: 'Title', cell: ({ row }) => <span className="font-semibold">{row.original.title}</span> },
    { accessorKey: 'description', header: 'Description' },
    { 
      accessorKey: 'points', 
      header: 'Points', 
      cell: ({ row }) => (
        <span className={cn('font-bold', row.original.type === 'merit' ? 'text-emerald-600' : 'text-red-600')}>
          {row.original.type === 'merit' ? '+' : '-'}{Math.abs(row.original.points || 0)}
        </span>
      ) 
    }
  ];

  const totalMerits = behaviorLog.filter(b => b.type === 'merit').reduce((a, b) => a + (b.points || 0), 0);
  const totalDemerits = behaviorLog.filter(b => b.type !== 'merit').reduce((a, b) => a + Math.abs(b.points || 0), 0);

  const addMutation = useMutation({
    mutationFn: (data) => studentService.addBehaviorRecord(student.id, data),
    onSuccess: () => {
      toast.success('Record added successfully');
      qc.invalidateQueries({ queryKey: ['student', type, id] });
      setIsModalOpen(false);
      setFormData({ type: 'merit', title: '', description: '', points: 0 });
    },
    onError: (err) => toast.error(err.message || 'Failed to add record')
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.title) return toast.error("Title is required");
    addMutation.mutate(formData);
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-bold">Behavioral Records</h3>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="rounded-lg bg-primary px-3 py-2 text-sm font-semibold text-primary-foreground hover:opacity-90"
        >
          + Add Record
        </button>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <StatsCard label="Net Score" value={totalMerits - totalDemerits} description="Merits - Demerits" />
        <StatsCard label="Total Merits" value={totalMerits} description="Positive Points" />
        <StatsCard label="Total Demerits" value={totalDemerits} description="Negative Points" />
      </div>
      
      <DataTable columns={columns} data={behaviorLog} emptyMessage="No behavioral records found." />

      <AppModal open={isModalOpen} onClose={() => setIsModalOpen(false)} title="Add Behavioral Record">
        <form onSubmit={handleSubmit} className="space-y-4 pt-4">
          <SelectField
            label="Type"
            value={formData.type}
            onChange={(e) => setFormData({ ...formData, type: e.target.value })}
            options={[
              { value: 'merit', label: 'Merit (+)' },
              { value: 'demerit', label: 'Demerit (-)' },
              { value: 'incident', label: 'Incident / Report (-)' }
            ]}
          />
          <InputField
            label="Title"
            placeholder="e.g. Participated in Debate"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            required
          />
          <TextareaField
            label="Description"
            placeholder="Details about the incident/merit..."
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            rows={3}
          />
          <InputField
            label="Points"
            type="number"
            min="0"
            value={formData.points}
            onChange={(e) => setFormData({ ...formData, points: parseInt(e.target.value) || 0 })}
          />
          <div className="flex justify-end gap-2 pt-2">
            <button type="button" onClick={() => setIsModalOpen(false)} className="rounded-md border px-4 py-2 text-sm hover:bg-muted">Cancel</button>
            <FormSubmitButton loading={addMutation.isPending} label="Save Record" loadingLabel="Saving..." />
          </div>
        </form>
      </AppModal>
    </div>
  );
}

// ========== DOCUMENTS TAB ==========
function DocumentsTab({ student }) {
  const documents = student.documents || [];

  const docColumns = [
    { 
      accessorKey: 'title', 
      header: 'Document Name', 
      cell: ({ row }) => row.original.title || row.original.type || 'Unnamed Document' 
    },
    { 
      accessorKey: 'type', 
      header: 'Type', 
      cell: ({ row }) => <span className="capitalize">{row.original.type}</span> 
    },
    { 
      accessorKey: 'uploaded_at', 
      header: 'Uploaded', 
      cell: ({ row }) => formatDate(row.original.uploaded_at) 
    },
    {
      id: 'actions',
      header: 'Actions',
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          {row.original.file_url && (
            <>
              <a
                href={row.original.file_url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex h-8 w-8 items-center justify-center rounded-md border hover:bg-accent text-primary transition-colors"
                title="View"
              >
                <Eye size={14} />
              </a>
              <a
                href={row.original.file_url}
                download
                className="flex h-8 w-8 items-center justify-center rounded-md border hover:bg-accent text-muted-foreground transition-colors"
                title="Download"
              >
                <Download size={14} />
              </a>
            </>
          )}
        </div>
      )
    }
  ];

  return (
    <div className="space-y-4">
      <div className="rounded-xl border bg-card shadow-sm overflow-hidden">
        <div className="flex items-center gap-2 border-b bg-muted/30 px-4 py-3">
          <FileText size={16} className="text-primary" />
          <h3 className="text-sm font-bold uppercase tracking-wide">Student Documents</h3>
        </div>
        <DataTable columns={docColumns} data={documents} emptyMessage="No documents uploaded for this student." />
      </div>
    </div>
  );
}

// ========== MAIN COMPONENT ==========
export default function StudentDetailPage({ type, id }) {
  const router = useRouter();
  const qc = useQueryClient();
  const canDo = useAuthStore((s) => s.canDo);
  const { terms } = useInstituteConfig();
  const { setBreadcrumbLabel } = useUIStore();
  const { currentInstitute } = useInstituteStore();
  const [activeTab, setActiveTab] = useState('Overview');
  const [voucherOpen, setVoucherOpen] = useState(false);
  const [slcConfirmOpen, setSlcConfirmOpen] = useState(false);
  const [restoreConfirmOpen, setRestoreConfirmOpen] = useState(false);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);

  const { data, isLoading } = useQuery({
    queryKey: ['student', type, id],
    queryFn: async () => {
      try {
        const { studentService } = await import('@/services');
        return await studentService.getById(id, type);
      } catch {
        return {
          data: DUMMY_FLAT_STUDENTS.find((s) => s.id === id) ?? DUMMY_FLAT_STUDENTS[0],
        };
      }
    },
  });

  const student = data?.data ?? DUMMY_FLAT_STUDENTS[0];

  const studentLabel = terms?.student ?? (type === 'coaching' ? 'Candidate' : type === 'academy' ? 'Trainee' : 'Student');

  const deleteStudentMutation = useMutation({
    mutationFn: () => studentService.delete(student.id, 'delete'),
    onSuccess: () => {
      toast.success(`${studentLabel} permanently deleted successfully`);
      qc.invalidateQueries({ queryKey: ['students'] });
      qc.invalidateQueries({ queryKey: ['student-stats'] });
      router.push(`/${type}/students`);
    },
    onError: (err) => {
      const errorMsg = err?.response?.data?.message || err?.message || `Failed to delete ${studentLabel.toLowerCase()}`;
      toast.error(errorMsg);
    }
  });

  // Set breadcrumb label
  useEffect(() => {
    if (student?.first_name) {
      const name = `${student.first_name} ${student.last_name || ''}`.trim();
      const regNo = student.registration_no ? ` (${student.registration_no})` : '';
      setBreadcrumbLabel(`${name}${regNo}`);
    }
    return () => setBreadcrumbLabel(null);
  }, [student, setBreadcrumbLabel]);

  const handleGenerateIdCard = async () => {
    try {
      toast.loading("Generating ID Card...", { id: "id-card" });
      const policy = useAuthStore.getState().getLatestPolicy('id_card');
      const policyConfig = policy?.config || {};
      
      // Flatten student to match generator expectations
      const flatStudent = {
        ...student,
        ...(student.details?.studentDetails || {}),
        id: student.id
      };

      await generateAndDownloadIdCard({
        person: flatStudent,
        institute: currentInstitute,
        policyConfig,
      });
      toast.success("ID Card Ready", { id: "id-card" });
    } catch (error) {
      toast.error(error.message, { id: "id-card" });
    }
  };

  const alumniMutation = useMutation({
    mutationFn: () => studentService.markAsAlumni(student.id),
    onSuccess: () => {
      toast.success("Student marked as Alumni");
      qc.invalidateQueries({ queryKey: ['student', type, id] });
    },
    onError: (err) => toast.error(err.message || "Failed to mark as alumni")
  });

  const restoreAlumniMutation = useMutation({
    mutationFn: () => studentService.restoreAlumni(student.id),
    onSuccess: () => {
      toast.success("Student restored from Alumni");
      qc.invalidateQueries({ queryKey: ['student', type, id] });
    },
    onError: (err) => toast.error(err.message || "Failed to restore student")
  });

  const handleGenerateSLC = async () => {
    setSlcConfirmOpen(false);
    try {
      toast.loading("Generating SLC...", { id: "slc" });
      
      await generateAndDownloadSLC({
        student: student,
        institute: currentInstitute,
      });
      toast.success("SLC Generated", { id: "slc" });

      if (student.is_active) {
        alumniMutation.mutate();
      }
    } catch (error) {
      toast.error(error.message, { id: "slc" });
    }
  };

  const handleRestoreAlumni = () => {
    setRestoreConfirmOpen(false);
    restoreAlumniMutation.mutate();
  };

  const createVoucher = useMutation({
    mutationFn: async (body) => {
      const month = parseInt(body.month, 10);
      const year = parseInt(body.year, 10);
      return feeVoucherService.generateSingle(student.id, month, year, {
        academicYearId: body.academic_year_id || student.academic_year_id,
        dueDate: body.due_date,
        feeType: body.fee_type || 'Monthly',
        baseAmount: body.base_amount || body.amount,
        monthly_fee: student.monthly_fee,
        discount: body.discount,
        arrears: body.arrears,
        preserve_previous_vouchers: true,
        include_arrears: true,
        carry_forward_arrears: true,
      });
    },
    onSuccess: () => {
      toast.success('Fee voucher generated successfully');
      setVoucherOpen(false);
      qc.invalidateQueries({ queryKey: ['fees'] });
      qc.invalidateQueries({ queryKey: ['student-vouchers', student.id] });
      qc.invalidateQueries({ queryKey: ['student-unpaid-vouchers', student.id] });
      qc.invalidateQueries({ queryKey: ['student', type, id] });
    },
    onError: (error) => {
      toast.error(error?.response?.data?.message || error?.message || 'Failed to generate fee voucher');
    },
  });

  const rollNo = student.registration_no || student.roll_number || student.candidate_id || student.trainee_id || student.reg_number;

  const voucherDefaultValues = {
    student_id: student?.id,
    month: String(new Date().getMonth() + 1),
    year: new Date().getFullYear(),
    due_date: new Date().toISOString().slice(0, 10),
    discount: 0,
  };

  const voucherStudentOptions = [{
    value: student?.id,
    label: `${student?.first_name || ''} ${student?.last_name || ''}`.trim(),
  }];

  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="flex flex-col items-center gap-3 text-muted-foreground">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-muted border-t-primary" />
          <span className="text-sm">Loading {studentLabel.toLowerCase()} details…</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-1 text-xs text-muted-foreground">
        <button onClick={() => router.push(`/${type}/students`)} className="hover:text-foreground transition-colors capitalize">
          {terms?.students ?? `${studentLabel}s`}
        </button>
        <ChevronRight size={12} />
        <span className="text-foreground font-medium">{student.first_name} {student.last_name}</span>
      </nav>

      {/* Profile Header */}
      <div className="flex flex-col gap-4 rounded-2xl border bg-card p-5 shadow-sm sm:flex-row sm:items-start">
        <Avatar className="h-20 w-20 shrink-0 rounded-2xl ring-4 ring-primary/20">
          <AvatarImage src={student.avatar_url} alt={`${student.first_name} ${student.last_name}`} className="object-cover" />
          <AvatarFallback className="bg-primary/10 text-2xl font-bold text-primary rounded-2xl">
            {initials(student)}
          </AvatarFallback>
        </Avatar>
        <div className="flex-1 space-y-1.5">
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="text-xl font-bold">{student.first_name} {student.last_name}</h1>
            <span className={cn('rounded-full border px-2.5 py-0.5 text-xs font-semibold', student.is_active ? 'border-emerald-200 bg-emerald-50 text-emerald-700' : 'border-gray-200 bg-gray-50 text-gray-600')}>
              {student.is_active ? 'Active' : 'Inactive'}
            </span>
          </div>
          {rollNo && <p className="font-mono text-sm text-muted-foreground">#{rollNo}</p>}
          <div className="flex flex-wrap gap-3 pt-1">
            {(student.class_name || student.class?.name) && (
              <span className="flex items-center gap-1 text-xs text-muted-foreground">
                <BookOpen size={11} /> {student.class?.name || student.class_name}
                {(student.section || student.section?.name) && ` · ${student.section?.name || student.section}`}
              </span>
            )}
            {student.gender && (
              <span className="flex items-center gap-1 text-xs text-muted-foreground capitalize">
                <User size={11} /> {student.gender}
              </span>
            )}
            {(student.date_of_birth || student.dob) && (
              <span className="flex items-center gap-1 text-xs text-muted-foreground">
                <Calendar size={11} /> {age(student.date_of_birth || student.dob)} yrs
              </span>
            )}
          </div>
        </div>
        <div className="flex shrink-0 gap-2 flex-wrap">
          <button onClick={() => router.push(`/${type}/students`)} className="flex items-center gap-1.5 rounded-lg border px-3 py-2 text-sm hover:bg-accent transition-colors">
            <ArrowLeft size={14} /> Back
          </button>
          
          <button
            onClick={handleGenerateIdCard}
            className="flex items-center gap-1.5 rounded-lg border px-3 py-2 text-sm hover:bg-accent transition-colors"
          >
            <CreditCard size={14} /> ID Card
          </button>

          {canDo('students.update') && student.details?.studentDetails?.is_alumni && (
            <button
              onClick={() => setRestoreConfirmOpen(true)}
              disabled={restoreAlumniMutation.isPending}
              className="flex items-center gap-1.5 rounded-lg border border-blue-200 bg-blue-50 px-3 py-2 text-sm font-semibold text-blue-700 hover:bg-blue-100 transition-colors"
            >
              <UserCheck size={14} /> Restore Alumni
            </button>
          )}

          {canDo('students.update') && !student.details?.studentDetails?.is_alumni && (
            <button
              onClick={() => setSlcConfirmOpen(true)}
              disabled={alumniMutation.isPending}
              className="flex items-center gap-1.5 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm font-semibold text-amber-700 hover:bg-amber-100 transition-colors"
            >
              <FileText size={14} /> SLC & Alumni
            </button>
          )}

          {canDo('students.delete') && (
            <button
              onClick={() => setDeleteConfirmOpen(true)}
              disabled={deleteStudentMutation.isPending}
              className="flex items-center gap-1.5 rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-sm font-semibold text-rose-600 hover:bg-rose-100 transition-colors"
            >
              <Trash2 size={14} /> Delete
            </button>
          )}

          {/* {canDo('students.update') && (
            <button
              onClick={() => router.push(`/${type}/students/${id}/edit`)}
              className="flex items-center gap-1.5 rounded-lg bg-primary px-3 py-2 text-sm font-semibold text-primary-foreground hover:opacity-90 transition-opacity"
            >
              <Pencil size={14} /> Edit
            </button>
          )} */}
        </div>
      </div>

      {/* Tabs with Active Identity */}
      <div className="flex gap-1 rounded-xl border bg-muted/40 p-1">
        {TABS.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={cn(
              'flex-1 rounded-lg py-2 text-sm font-medium transition-all',
              activeTab === tab
                ? 'bg-background text-foreground shadow-sm'
                : 'text-muted-foreground hover:text-foreground',
            )}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="min-h-[300px]">
        {activeTab === 'Overview'    && <OverviewTab    student={student} terms={{ ...terms, type }} currentInstitute={currentInstitute} />}
        {activeTab === 'Attendance'  && <AttendanceTab  student={student} />}
        {activeTab === 'Fees'        && <FeesTab        student={student} currentInstitute={currentInstitute} onGenerateVoucher={() => setVoucherOpen(true)} />}
        {activeTab === 'Exams'       && <ExamsTab       student={student} />}
        {activeTab === 'Documents'   && <DocumentsTab   student={student} />}
        {activeTab === 'Behavioral'  && <BehavioralTab  student={student} type={type} id={id} />}
      </div>

      {/* Generate Fee Voucher Modal */}
      <AppModal
        open={voucherOpen}
        onClose={() => setVoucherOpen(false)}
        title={`Generate Fee Voucher — ${student.first_name} ${student.last_name || ''}`}
        className="max-w-lg"
      >
        <div className="pt-2">
          <FeeVoucherForm
            defaultValues={voucherDefaultValues}
            studentOptions={voucherStudentOptions}
            onSubmit={(formData) => createVoucher.mutate(formData)}
            onCancel={() => setVoucherOpen(false)}
            loading={createVoucher.isPending}
          />
        </div>
      </AppModal>

      <ConfirmDialog
        open={slcConfirmOpen}
        onClose={() => setSlcConfirmOpen(false)}
        onConfirm={handleGenerateSLC}
        loading={alumniMutation.isPending}
        title="Generate SLC & Mark Alumni"
        description="This will permanently disable the student's active login and move them to Alumni status. Are you sure you want to proceed?"
        confirmLabel="Yes, Generate & Disable"
        variant="destructive"
      />

      <ConfirmDialog
        open={restoreConfirmOpen}
        onClose={() => setRestoreConfirmOpen(false)}
        onConfirm={handleRestoreAlumni}
        loading={restoreAlumniMutation.isPending}
        title="Restore from Alumni"
        description="This will reactivate the student's account and restore their active status. Are you sure?"
        confirmLabel="Yes, Restore Student"
        variant="default"
      />

      <ConfirmDialog
        open={deleteConfirmOpen}
        onClose={() => setDeleteConfirmOpen(false)}
        onConfirm={() => {
          setDeleteConfirmOpen(false);
          deleteStudentMutation.mutate();
        }}
        loading={deleteStudentMutation.isPending}
        title={`Permanently Delete ${studentLabel}`}
        description={`Are you sure you want to permanently delete "${student.first_name} ${student.last_name || ''}". This action cannot be undone. All related records will be removed.`}
        confirmLabel="Permanently Delete"
        variant="destructive"
      />
    </div>
  );
}