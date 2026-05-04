/**
 * TeacherDetailPage — beautiful profile view for a teacher
 * Route: /[type]/teachers/[id]
 */
'use client';

import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  ArrowLeft, Pencil, User, Phone, Mail, MapPin, Calendar,
  GraduationCap, BookOpen, Briefcase, DollarSign, CheckSquare,
  ChevronRight, Hash, ShieldCheck, Clock, AlertCircle, 
  FileText, Download, Eye, CreditCard, UserCheck, Power,
  Building, CreditCard as BankIcon, Users
} from 'lucide-react';
import { cn } from '@/lib/utils';
import useInstituteConfig from '@/hooks/useInstituteConfig';
import useAuthStore from '@/store/authStore';
import { toast } from 'sonner';
import useInstituteStore from '@/store/instituteStore';
import useUIStore from '@/store/uiStore';
import DataTable from '@/components/common/DataTable';
import StatsCard from '@/components/common/StatsCard';
import SelectField from '@/components/common/SelectField';
import { teacherService } from '@/services/teacherService';
import { generateAndDownloadIdCard } from '@/lib/idCardGenerator';

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

function formatTime(t) {
  if (!t) return '—';
  try {
    // If it's a ISO string/Date object
    const date = new Date(t);
    if (!isNaN(date.getTime())) {
      return date.toLocaleTimeString('en-PK', { hour: '2-digit', minute: '2-digit', hour12: true });
    }
    // If it's a simple string like "08:00"
    const [h, m] = t.split(':');
    if (h && m) {
      const hh = parseInt(h);
      const suffix = hh >= 12 ? 'PM' : 'AM';
      const hours = ((hh + 11) % 12 + 1);
      return `${hours}:${m} ${suffix}`;
    }
    return t;
  } catch (e) {
    return t;
  }
}

const TABS = ['Overview', 'Timetable', 'Attendance', 'Payroll', 'Documents'];

// ─── Info Row ────────────────────────────────────────────
function InfoRow({ icon: Icon, label, value, color }) {
  if (!value || value === '—') return null;
  return (
    <div className="flex items-start gap-3 py-2.5 border-b last:border-0">
      <div className={cn("mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-muted text-muted-foreground", color)}>
        <Icon size={12} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-xs text-muted-foreground">{label}</p>
        <p className="text-sm font-medium truncate">{value}</p>
      </div>
    </div>
  );
}

// ========== OVERVIEW TAB ==========
function OverviewTab({ teacher }) {
  const tDetails = teacher.details?.teacherDetails || {};
  
  return (
    <div className="grid gap-6 lg:grid-cols-2">
      {/* Personal Info */}
      <div className="rounded-xl border bg-card shadow-sm overflow-hidden flex flex-col">
        <div className="flex items-center gap-2 border-b bg-muted/30 px-4 py-3">
          <User size={16} className="text-primary" />
          <h3 className="text-sm font-bold uppercase tracking-wide">Personal Details</h3>
        </div>
        <div className="p-4 grid grid-cols-1 sm:grid-cols-2 gap-x-6">
          <InfoRow icon={Hash} label="Employee ID" value={teacher.registration_no || tDetails.employee_id} />
          <InfoRow icon={User} label="Full Name" value={`${teacher.first_name || ''} ${teacher.last_name || ''}`.trim()} />
          <InfoRow icon={Users} label="Gender" value={tDetails.gender} />
          <InfoRow icon={Calendar} label="Date of Birth" value={formatDate(tDetails.date_of_birth)} />
          <InfoRow icon={ShieldCheck} label="CNIC" value={tDetails.cnic} />
          <InfoRow icon={Mail} label="Email" value={teacher.email} />
          <InfoRow icon={Phone} label="Phone" value={teacher.phone} />
          <InfoRow icon={MapPin} label="Nationality" value={tDetails.nationality} />
        </div>
        <div className="px-4 pb-4">
          <InfoRow icon={MapPin} label="Present Address" value={tDetails.present_address} />
          <InfoRow icon={MapPin} label="Permanent Address" value={tDetails.permanent_address} />
        </div>
      </div>

      {/* Professional & Employment */}
      <div className="rounded-xl border bg-card shadow-sm overflow-hidden flex flex-col">
        <div className="flex items-center gap-2 border-b bg-muted/30 px-4 py-3">
          <Briefcase size={16} className="text-primary" />
          <h3 className="text-sm font-bold uppercase tracking-wide">Professional Info</h3>
        </div>
        <div className="p-4 grid grid-cols-1 sm:grid-cols-2 gap-x-6">
          <InfoRow icon={GraduationCap} label="Qualification" value={tDetails.qualification} />
          <InfoRow icon={BookOpen} label="Specialization" value={tDetails.specialization} />
          <InfoRow icon={Clock} label="Experience" value={tDetails.experience_years ? `${tDetails.experience_years} Years` : null} />
          <InfoRow icon={Building} label="Department" value={tDetails.department} />
          <InfoRow icon={UserCheck} label="Designation" value={tDetails.designation} />
          <InfoRow icon={Briefcase} label="Employment Type" value={tDetails.employment_type} />
          <InfoRow icon={Calendar} label="Joining Date" value={formatDate(tDetails.joining_date)} />
          <InfoRow icon={DollarSign} label="Salary" value={tDetails.salary ? `Rs. ${Number(tDetails.salary).toLocaleString()}` : null} />
        </div>
      </div>

      {/* Bank Details */}
      <div className="rounded-xl border bg-card shadow-sm overflow-hidden flex flex-col">
        <div className="flex items-center gap-2 border-b bg-muted/30 px-4 py-3">
          <BankIcon size={16} className="text-primary" />
          <h3 className="text-sm font-bold uppercase tracking-wide">Bank Details</h3>
        </div>
        <div className="p-4 grid grid-cols-1 sm:grid-cols-2 gap-x-6">
          <InfoRow icon={Building} label="Bank Name" value={tDetails.bank_name} />
          <InfoRow icon={Hash} label="Account No" value={tDetails.bank_account_no} />
          <InfoRow icon={MapPin} label="Branch" value={tDetails.bank_branch} />
        </div>
      </div>

      {/* Emergency Contact */}
      <div className="rounded-xl border bg-card shadow-sm overflow-hidden flex flex-col">
        <div className="flex items-center gap-2 border-b bg-muted/30 px-4 py-3">
          <AlertCircle size={16} className="text-primary" />
          <h3 className="text-sm font-bold uppercase tracking-wide">Emergency Contact</h3>
        </div>
        <div className="p-4 grid grid-cols-1 sm:grid-cols-2 gap-x-6">
          <InfoRow icon={User} label="Name" value={tDetails.emergency_contact_name} />
          <InfoRow icon={Users} label="Relation" value={tDetails.emergency_contact_relation} />
          <InfoRow icon={Phone} label="Phone" value={tDetails.emergency_contact_phone} />
        </div>
      </div>
    </div>
  );
}

// ========== TIMETABLE TAB ==========
function TimetableTab({ teacher }) {
  const slots = teacher.timetableSlots || [];
  
  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
  
  return (
    <div className="space-y-4">
      <div className="rounded-xl border bg-card shadow-sm overflow-hidden">
        <div className="flex items-center gap-2 border-b bg-muted/30 px-4 py-3">
          <Clock size={16} className="text-primary" />
          <h3 className="text-sm font-bold uppercase tracking-wide">Teacher Schedule</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-muted/50 text-xs font-bold text-muted-foreground uppercase">
              <tr>
                <th className="px-6 py-3 text-left">Day</th>
                <th className="px-6 py-3 text-left">Timetable</th>
                <th className="px-6 py-3 text-left">Time</th>
                <th className="px-6 py-3 text-left">Subject</th>
                <th className="px-6 py-3 text-left">Room</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {slots.length > 0 ? (
                slots.map((slot, i) => (
                  <tr key={i} className="hover:bg-muted/30">
                    <td className="px-6 py-4 font-bold capitalize">{slot.day}</td>
                    <td className="px-6 py-4 text-primary font-medium">{slot.timetable_name}</td>
                    <td className="px-6 py-4 font-mono text-xs">
                      {slot.start_time && slot.end_time 
                        ? `${slot.start_time} - ${slot.end_time}` 
                        : (slot.time || '—')}
                    </td>
                    <td className="px-6 py-4 font-medium">{slot.subject_name}</td>
                    <td className="px-6 py-4">{slot.room_no || '—'}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-muted-foreground italic">
                    No timetable slots assigned.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// ========== ATTENDANCE TAB ==========
function AttendanceTab({ teacher }) {
  const [filterMonth, setFilterMonth] = useState(String(new Date().getMonth() + 1));
  const [filterYear, setFilterYear] = useState(String(new Date().getFullYear()));
  
  const attendances = useMemo(() => {
    return (teacher.staffAttendances || []).filter(a => {
      const date = new Date(a.date);
      return (date.getMonth() + 1) === Number(filterMonth) && date.getFullYear() === Number(filterYear);
    });
  }, [teacher.staffAttendances, filterMonth, filterYear]);

  const totalDays = attendances.length;
  const presentDays = attendances.filter(a => a.status?.toLowerCase() === 'present').length;
  const absentDays = attendances.filter(a => a.status?.toLowerCase() === 'absent').length;
  const lateDays = attendances.filter(a => a.status?.toLowerCase() === 'late').length;
  
  const pct = totalDays ? Math.round(((presentDays + lateDays) / totalDays) * 100) : 0;

  const joiningYear = teacher.details?.teacherDetails?.joining_date 
    ? new Date(teacher.details.teacherDetails.joining_date).getFullYear() 
    : new Date().getFullYear();
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: currentYear - joiningYear + 1 }, (_, i) => currentYear - i);

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex gap-4 items-start p-4 rounded-xl border bg-muted/20">
        <div className="w-48">
          <SelectField
            label="Month"
            value={filterMonth}
            onChange={(val) => setFilterMonth(val)}
            options={Array.from({ length: 12 }, (_, i) => ({
              label: new Date(2000, i).toLocaleString('default', { month: 'long' }),
              value: String(i + 1)
            }))}
          />
        </div>
        <div className="w-32">
          <SelectField
            label="Year"
            value={filterYear}
            onChange={(val) => setFilterYear(val)}
            options={years.map(yr => ({ label: String(yr), value: String(yr) }))}
          />
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-4">
        <StatsCard icon={<CheckSquare size={20} />} label="Attendance %" value={`${pct}%`} description={`${filterMonth}/${filterYear}`} />
        <StatsCard icon={<UserCheck size={20} />} label="Present" value={String(presentDays)} description="Days" />
        <StatsCard icon={<AlertCircle size={20} />} label="Absent" value={String(absentDays)} description="Days" />
        <StatsCard icon={<Clock size={20} />} label="Late" value={String(lateDays)} description="Days" />
      </div>

      <div className="rounded-xl border bg-card shadow-sm overflow-hidden">
        <div className="flex items-center gap-2 border-b bg-muted/30 px-4 py-3">
          <Calendar size={16} className="text-primary" />
          <h3 className="text-sm font-bold uppercase tracking-wide">Attendance Logs</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-muted/50 text-xs font-bold text-muted-foreground uppercase">
              <tr>
                <th className="px-6 py-3 text-left">Date</th>
                <th className="px-6 py-3 text-center">Status</th>
                <th className="px-6 py-3 text-left">Check In</th>
                <th className="px-6 py-3 text-left">Check Out</th>
                <th className="px-6 py-3 text-left">Remarks</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {attendances.length > 0 ? (
                attendances.map((att, i) => (
                  <tr key={att.id || i} className="hover:bg-muted/30">
                    <td className="px-6 py-4 font-medium">{formatDate(att.date)}</td>
                    <td className="px-6 py-4 text-center">
                      <span className={cn(
                        'rounded-full px-2.5 py-1 text-[11px] font-bold uppercase tracking-wider',
                        att.status?.toLowerCase() === 'present' ? 'bg-emerald-100 text-emerald-700' :
                        att.status?.toLowerCase() === 'absent' ? 'bg-red-100 text-red-700' :
                        att.status?.toLowerCase() === 'late' ? 'bg-amber-100 text-amber-700' :
                        att.status?.toLowerCase() === 'leave' ? 'bg-blue-100 text-blue-700' :
                        'bg-gray-100 text-gray-700'
                      )}>
                        {att.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 font-mono text-xs">{formatTime(att.check_in)}</td>
                    <td className="px-6 py-4 font-mono text-xs">{formatTime(att.check_out)}</td>
                    <td className="px-6 py-4 text-muted-foreground italic text-xs">{att.remarks || '—'}</td>
                  </tr>
                ))
              ) : (
                <tr>
                   <td colSpan={5} className="px-6 py-12 text-center text-muted-foreground italic">
                    No attendance records for this period.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// ========== PAYROLL TAB ==========
function PayrollTab({ teacher }) {
  const [filterYear, setFilterYear] = useState(String(new Date().getFullYear()));
  
  const payslips = useMemo(() => {
    return (teacher.payslips || []).filter(p => Number(p.year) === Number(filterYear));
  }, [teacher.payslips, filterYear]);

  const joiningYear = teacher.details?.teacherDetails?.joining_date 
    ? new Date(teacher.details.teacherDetails.joining_date).getFullYear() 
    : new Date().getFullYear();
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: currentYear - joiningYear + 1 }, (_, i) => currentYear - i);

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex gap-4 items-start p-4 rounded-xl border bg-muted/20">
        <div className="w-32">
          <SelectField
            label="Year"
            value={filterYear}
            onChange={(val) => setFilterYear(val)}
            options={years.map(yr => ({ label: String(yr), value: String(yr) }))}
          />
        </div>
      </div>

      <div className="rounded-xl border bg-card shadow-sm overflow-hidden">
        <div className="flex items-center gap-2 border-b bg-muted/30 px-4 py-3">
          <DollarSign size={16} className="text-primary" />
          <h3 className="text-sm font-bold uppercase tracking-wide">Salary History</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-muted/50 text-xs font-bold text-muted-foreground uppercase">
              <tr>
                <th className="px-6 py-3 text-left">Period</th>
                <th className="px-6 py-3 text-right">Basic Salary</th>
                <th className="px-6 py-3 text-right">Net Amount</th>
                <th className="px-6 py-3 text-center">Status</th>
                <th className="px-6 py-3 text-center">Paid Date</th>
                <th className="px-6 py-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {payslips.length > 0 ? (
                payslips.map((p, i) => (
                  <tr key={p.id || i} className="hover:bg-muted/30">
                    <td className="px-6 py-4 font-bold">
                      {new Date(2000, p.month - 1).toLocaleString('default', { month: 'long' })} {p.year}
                    </td>
                    <td className="px-6 py-4 text-right">Rs. {Number(p.basic_salary).toLocaleString()}</td>
                    <td className="px-6 py-4 text-right font-bold text-primary">Rs. {Number(p.net_salary).toLocaleString()}</td>
                    <td className="px-6 py-4 text-center">
                      <span className={cn(
                        'rounded-full px-3 py-1 text-[10px] font-bold uppercase border',
                        p.status === 'paid' ? 'bg-emerald-100 text-emerald-700 border-emerald-200' : 'bg-amber-100 text-amber-700 border-amber-200'
                      )}>
                        {p.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center text-muted-foreground">
                      {p.paid_on ? formatDate(p.paid_on) : '—'}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button className="text-primary hover:bg-primary/10 p-2 rounded-md transition-colors" title="Download Payslip">
                        <Download size={16} />
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-muted-foreground italic">
                    No payroll records found for this year.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// ========== DOCUMENTS TAB ==========
function DocumentsTab({ teacher }) {
  const documents = teacher.documents || [];

  const columns = [
    {
      accessorKey: 'title',
      header: 'Title',
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          <FileText size={14} className="text-muted-foreground" />
          <span className="font-medium">{row.original.title || row.original.file_name}</span>
        </div>
      ),
    },
    {
      accessorKey: 'type',
      header: 'Type',
      cell: ({ row }) => <span className="capitalize">{row.original.type}</span>,
    },
    {
      accessorKey: 'uploaded_at',
      header: 'Date',
      cell: ({ row }) => formatDate(row.original.uploaded_at),
    },
    {
      id: 'actions',
      header: 'Actions',
      cell: ({ row }) => (
        <div className="flex gap-2 justify-end">
          <a
            href={row.original.file_url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex h-8 w-8 items-center justify-center rounded-md border hover:bg-accent transition-colors"
          >
            <Eye size={14} />
          </a>
          <a
            href={row.original.file_url}
            download
            className="flex h-8 w-8 items-center justify-center rounded-md border hover:bg-accent transition-colors"
          >
            <Download size={14} />
          </a>
        </div>
      ),
    },
  ];

  return (
    <div className="rounded-xl border bg-card shadow-sm overflow-hidden">
      <div className="flex items-center gap-2 border-b bg-muted/30 px-4 py-3">
        <FileText size={16} className="text-primary" />
        <h3 className="text-sm font-bold uppercase tracking-wide">Uploaded Documents</h3>
      </div>
      <div className="p-4">
        <DataTable
          columns={columns}
          data={documents}
          emptyMessage="No documents uploaded."
          showSearch={false}
        />
      </div>
    </div>
  );
}

// ─── Main Component ──────────────────────────────────────────
export default function TeacherDetailPage({ type, id }) {
  const router = useRouter();
  const qc = useQueryClient();
  const canDo = useAuthStore((s) => s.canDo);
  const { currentInstitute } = useInstituteStore();
  const { terms } = useInstituteConfig();
  const setBreadcrumbLabel = useUIStore((s) => s.setBreadcrumbLabel);

  const [activeTab, setActiveTab] = useState('Overview');

  const { data, isLoading } = useQuery({
    queryKey: ['teacher', id],
    queryFn: async () => {
      const response = await teacherService.getById(id);
      return response.data;
    },
    enabled: !!id,
  });

  const teacher = data;

  useEffect(() => {
    if (teacher) {
      const label = `${teacher.first_name} ${teacher.last_name}`;
      setBreadcrumbLabel(label);
    }
    return () => setBreadcrumbLabel(null);
  }, [teacher, setBreadcrumbLabel]);

  const toggleStatusMutation = useMutation({
    mutationFn: (is_active) => teacherService.toggleStatus(id, is_active),
    onSuccess: (_, is_active) => {
      toast.success(is_active ? 'Teacher activated' : 'Teacher deactivated');
      qc.invalidateQueries({ queryKey: ['teacher', id] });
    },
    onError: (err) => {
      toast.error(err.message || 'Failed to toggle status');
    }
  });

  const teacherLabel = terms?.teacher || 'Teacher';

  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="flex flex-col items-center gap-3 text-muted-foreground">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-muted border-t-primary" />
          <span className="text-sm">Loading {teacherLabel.toLowerCase()} details…</span>
        </div>
      </div>
    );
  }

  if (!teacher) return <div className="p-10 text-center text-muted-foreground italic">Teacher not found.</div>;

  return (
    <div className="space-y-6">
      {/* ── Breadcrumb ── */}
      <nav className="flex items-center gap-1 text-xs text-muted-foreground">
        <button onClick={() => router.push(`/${type}/teachers`)} className="hover:text-foreground transition-colors capitalize">
          {terms?.teachers ?? 'Teachers'}
        </button>
        <ChevronRight size={12} />
        <span className="text-foreground font-medium">{teacher.first_name} {teacher.last_name}</span>
      </nav>

      {/* ── Profile Header ── */}
      <div className="flex flex-col gap-4 rounded-2xl border bg-card p-5 shadow-sm sm:flex-row sm:items-start">
        {/* Avatar */}
        <div className="flex h-24 w-24 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-3xl font-bold text-primary ring-4 ring-primary/20">
          {initials(teacher)}
        </div>

        {/* Info */}
        <div className="flex-1 space-y-1.5">
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="text-2xl font-bold">{teacher.first_name} {teacher.last_name}</h1>
            <span className={cn('rounded-full border px-2.5 py-0.5 text-xs font-semibold', teacher.is_active ? 'border-emerald-200 bg-emerald-50 text-emerald-700' : 'border-gray-200 bg-gray-50 text-gray-600')}>
              {teacher.is_active ? 'Active' : 'Inactive'}
            </span>
          </div>

          <p className="font-mono text-sm text-muted-foreground">
            {teacher.registration_no || teacher.details?.teacherDetails?.employee_id || 'No Employee ID'}
          </p>

          {/* Quick meta pills */}
          <div className="flex flex-wrap gap-3 pt-1">
            {teacher.details?.teacherDetails?.designation && (
              <span className="flex items-center gap-1 text-xs text-muted-foreground">
                <Briefcase size={11} /> {teacher.details.teacherDetails.designation}
              </span>
            )}
            {teacher.details?.teacherDetails?.department && (
              <span className="flex items-center gap-1 text-xs text-muted-foreground">
                <Building size={11} /> {teacher.details.teacherDetails.department}
              </span>
            )}
            {teacher.email && (
              <span className="flex items-center gap-1 text-xs text-muted-foreground">
                <Mail size={11} /> {teacher.email}
              </span>
            )}
            {teacher.phone && (
              <span className="flex items-center gap-1 text-xs text-muted-foreground">
                <Phone size={11} /> {teacher.phone}
              </span>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex shrink-0 gap-2 flex-wrap">
          <button
            onClick={() => router.push(`/${type}/teachers`)}
            className="flex items-center gap-1.5 rounded-lg border px-3 py-2 text-sm hover:bg-accent transition-colors"
          >
            <ArrowLeft size={14} /> Back
          </button>

          {/* <button
            onClick={() => generateAndDownloadIdCard({
              role: 'teacher',
              person: teacher,
              institute: currentInstitute || {}
            })}
            className="flex items-center gap-1.5 rounded-lg border px-3 py-2 text-sm hover:bg-accent transition-colors"
          >
            <CreditCard size={14} /> ID Card
          </button> */}

          {canDo('teachers.update') && (
            <button
              onClick={() => toggleStatusMutation.mutate(!teacher.is_active)}
              className={cn(
                "flex items-center gap-1.5 rounded-lg border px-3 py-2 text-sm transition-colors",
                teacher.is_active ? "hover:bg-red-50 text-red-600 border-red-200" : "hover:bg-emerald-50 text-emerald-600 border-emerald-200"
              )}
              disabled={toggleStatusMutation.isPending}
            >
              <Power size={14} /> {teacher.is_active ? 'Deactivate' : 'Activate'}
            </button>
          )}

          {/* {canDo('teachers.update') && (
            <button
              onClick={() => router.push(`/${type}/teachers/${id}/edit`)}
              className="flex items-center gap-1.5 rounded-lg bg-primary px-3 py-2 text-sm font-semibold text-primary-foreground hover:opacity-90 transition-opacity"
            >
              <Pencil size={14} /> Edit
            </button>
          )} */}
        </div>
      </div>

      {/* ── Tabs ── */}
      <div className="flex gap-1 rounded-xl border bg-muted/40 p-1 overflow-x-auto no-scrollbar">
        {TABS.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={cn(
              'flex-1 min-w-[100px] rounded-lg py-2 text-sm font-medium transition-all',
              activeTab === tab
                ? 'bg-background text-foreground shadow-sm'
                : 'text-muted-foreground hover:text-foreground',
            )}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* ── Tab Content ── */}
      <div className="min-h-[400px]">
        {activeTab === 'Overview'    && <OverviewTab    teacher={teacher} />}
        {activeTab === 'Timetable'   && <TimetableTab   teacher={teacher} />}
        {activeTab === 'Attendance'  && <AttendanceTab  teacher={teacher} />}
        {activeTab === 'Payroll'     && <PayrollTab     teacher={teacher} />}
        {activeTab === 'Documents'   && <DocumentsTab   teacher={teacher} />}
      </div>
    </div>
  );
}
