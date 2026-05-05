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
import AppModal from '@/components/common/AppModal';
import FeeVoucherForm from '@/components/forms/FeeVoucherForm';
import { generateAndDownloadIdCard } from '@/lib/idCardGenerator';
import useInstituteStore from '@/store/instituteStore';
import { FileText, Download, Eye, CreditCard } from 'lucide-react';
import useUIStore from '@/store/uiStore';
import DataTable from '@/components/common/DataTable';
import StatsCard from '@/components/common/StatsCard';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';

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

const TABS = ['Overview', 'Attendance', 'Fees', 'Exams', 'Documents'];

// ========== OVERVIEW TAB (with Start & End Dates) ==========
function OverviewTab({ student, terms }) {
  const sDetails = student.details?.studentDetails || {};
  const sessions = sDetails.academicSessions || [];
  const guardians = sDetails.guardians || [];

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
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-muted/50 text-xs font-bold text-muted-foreground uppercase">
              <tr>
                <th className="px-6 py-3 text-left">Guardian Name</th>
                <th className="px-6 py-3 text-left">Relation</th>
                <th className="px-6 py-3 text-left">Phone</th>
                <th className="px-6 py-3 text-left">Email</th>
                <th className="px-6 py-3 text-left">CNIC</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {guardians.length > 0 ? (
                guardians.map((g, idx) => (
                  <tr key={idx} className="hover:bg-muted/30">
                    <td className="px-6 py-4 font-medium">{g.name || '—'}</td>
                    <td className="px-6 py-4 capitalize">{g.relation || g.type || '—'}</td>
                    <td className="px-6 py-4 font-mono">{g.phone || '—'}</td>
                    <td className="px-6 py-4">{g.email || '—'}</td>
                    <td className="px-6 py-4 font-mono">{g.cnic || '—'}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-muted-foreground italic">No guardian information found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Academic Sessions History - with Academic Year Name & End Date */}
      <div className="rounded-xl border bg-card shadow-sm overflow-hidden lg:col-span-2">
        <div className="flex items-center gap-2 border-b bg-muted/30 px-4 py-3">
          <Clock size={16} className="text-primary" />
          <h3 className="text-sm font-bold uppercase tracking-wide">Academic Session History</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-muted/50 text-xs font-bold text-muted-foreground uppercase">
              <tr>
                <th className="px-6 py-3 text-left">Academic Year</th>
                <th className="px-6 py-3 text-left">Class & Section</th>
                <th className="px-6 py-3 text-left">Roll No</th>
                <th className="px-6 py-3 text-left">Start Date</th>
                <th className="px-6 py-3 text-left">End Date</th>
                <th className="px-6 py-3 text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {sessions.length > 0 ? (
                sessions.map((s, idx) => (
                  <tr key={idx} className="hover:bg-muted/30 transition-colors">
                    <td className="px-6 py-4 font-bold text-primary">
                      {s.academic_year_name || '—'}
                    </td>
                    <td className="px-6 py-4">
                      {s.class_name || '—'} {s.section_name ? ` · ${s.section_name}` : ''}
                    </td>
                    <td className="px-6 py-4 font-mono text-xs">{s.roll_no || '—'}</td>
                    <td className="px-6 py-4 text-muted-foreground">
                      {s.start_date ? formatDate(s.start_date) : '—'}
                    </td>
                    <td className="px-6 py-4 text-muted-foreground">
                      {s.end_date ? formatDate(s.end_date) : (s.status === 'active' ? 'Ongoing' : '—')}
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className={cn(
                        'rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider',
                        s.status === 'active' ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-100 text-gray-600'
                      )}>
                        {s.status === 'active' ? 'Active' : 'Completed'}
                      </span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-muted-foreground italic">
                    No academic session records found.
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
function FeesTab({ student }) {
  const vouchers = student.feeVouchers || [];
  const totalPaid = vouchers.filter(v => v.status === 'paid').reduce((acc, v) => acc + Number(v.net_amount || v.amount || 0), 0);
  const totalPending = vouchers.filter(v => v.status !== 'paid').reduce((acc, v) => acc + Number(v.net_amount || v.amount || 0), 0);

  const feeColumns = [
    { accessorKey: 'voucher_number', header: 'Voucher #', cell: ({ row }) => row.original.voucher_number || row.original.voucher_no || '—' },
    { accessorKey: 'month', header: 'Period', cell: ({ row }) => row.original.month ? `${row.original.month}/${row.original.year}` : '—' },
    { accessorKey: 'net_amount', header: 'Net Amount', cell: ({ row }) => `Rs. ${Number(row.original.net_amount || row.original.amount).toLocaleString()}` },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: ({ row }) => (
        <span className={cn(
          'rounded-full px-3 py-1 text-[10px] font-bold uppercase border',
          row.original.status === 'paid' ? 'bg-emerald-100 text-emerald-700 border-emerald-200' : 'bg-red-100 text-red-700 border-red-200'
        )}>
          {row.original.status}
        </span>
      )
    },
    { accessorKey: 'due_date', header: 'Due Date', cell: ({ row }) => row.original.due_date ? formatDate(row.original.due_date) : '—' }
  ];

  return (
    <div className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-3">
        <StatsCard label="Total Paid" value={`Rs. ${totalPaid.toLocaleString()}`} />
        <StatsCard label="Total Pending" value={`Rs. ${totalPending.toLocaleString()}`} />
        <StatsCard label="Vouchers" value={`${vouchers.filter(v => v.status === 'paid').length} / ${vouchers.length}`} />
      </div>
      <DataTable columns={feeColumns} data={vouchers} emptyMessage="No fee vouchers found." />
    </div>
  );
}

// ========== EXAMS TAB ==========
function ExamsTab({ student }) {
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
    { accessorKey: 'updated_at', header: 'Release Date', cell: ({ row }) => formatDate(row.original.updated_at || row.original.created_at) }
  ];

  return <DataTable columns={examColumns} data={results} emptyMessage="No exam records found." />;
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

  const createVoucher = useMutation({
    mutationFn: async (body) => {
      const { feeService } = await import('@/services');
      return feeService.create(body);
    },
    onSuccess: () => {
      toast.success('Fee voucher generated successfully');
      setVoucherOpen(false);
      qc.invalidateQueries({ queryKey: ['fees'] });
    },
    onError: (error) => {
      toast.error(error?.response?.data?.message || error?.message || 'Failed to generate fee voucher');
    },
  });

  const studentLabel = terms?.student ?? (type === 'coaching' ? 'Candidate' : type === 'academy' ? 'Trainee' : 'Student');
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

          {/* {canDo('fees.create') && (
            <button
              onClick={() => setVoucherOpen(true)}
              className="flex items-center gap-1.5 rounded-lg border px-3 py-2 text-sm hover:bg-accent transition-colors"
            >
              <Receipt size={14} /> Voucher
            </button>
          )} */}

          {canDo('student.update') && (
            <button
              onClick={() => router.push(`/${type}/students/${id}/edit`)}
              className="flex items-center gap-1.5 rounded-lg bg-primary px-3 py-2 text-sm font-semibold text-primary-foreground hover:opacity-90 transition-opacity"
            >
              <Pencil size={14} /> Edit
            </button>
          )}
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
        {activeTab === 'Overview'    && <OverviewTab    student={student} terms={{ ...terms, type }} />}
        {activeTab === 'Attendance'  && <AttendanceTab  student={student} />}
        {activeTab === 'Fees'        && <FeesTab        student={student} />}
        {activeTab === 'Exams'       && <ExamsTab       student={student} />}
        {activeTab === 'Documents'   && <DocumentsTab   student={student} />}
      </div>
    </div>
  );
}