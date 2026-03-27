'use client';
/**
 * StudentDetailPage — beautiful profile view for a student/candidate/trainee
 * Route: /[type]/students/[id]
 */
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import {
  ArrowLeft, Pencil, User, Phone, Mail, MapPin, Calendar,
  GraduationCap, BookOpen, TrendingUp, DollarSign, CheckSquare,
  ChevronRight, Hash, Users, ShieldCheck, Clock, AlertCircle,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import useInstituteConfig from '@/hooks/useInstituteConfig';
import { DUMMY_FLAT_STUDENTS } from '@/data/dummyData';
import useAuthStore from '@/store/authStore';

// ─── helpers ────────────────────────────────────────────────────────────────
function initials(s) {
  if (!s) return '?';
  const parts = [s.first_name, s.last_name].filter(Boolean);
  return parts.map((p) => p[0]?.toUpperCase()).join('');
}

function formatDate(d) {
  if (!d) return '—';
  return new Date(d).toLocaleDateString('en-PK', { year: 'numeric', month: 'long', day: 'numeric' });
}

function age(dob) {
  if (!dob) return null;
  const diff = Date.now() - new Date(dob).getTime();
  return Math.floor(diff / (1000 * 60 * 60 * 24 * 365.25));
}

const FEE_COLORS = {
  paid:    'bg-emerald-100 text-emerald-700 border-emerald-200',
  pending: 'bg-amber-100   text-amber-700   border-amber-200',
  overdue: 'bg-red-100     text-red-700     border-red-200',
  partial: 'bg-blue-100    text-blue-700    border-blue-200',
};

const TABS = ['Overview', 'Attendance', 'Fees', 'Exams'];

// ─── Stat Card ───────────────────────────────────────────────────────────────
function StatCard({ icon: Icon, label, value, sub, color = 'text-primary', bg = 'bg-primary/10' }) {
  return (
    <div className="flex items-center gap-3 rounded-xl border bg-card p-4 shadow-sm">
      <div className={cn('flex h-10 w-10 shrink-0 items-center justify-center rounded-lg', bg)}>
        <Icon size={18} className={color} />
      </div>
      <div>
        <p className="text-xs text-muted-foreground">{label}</p>
        <p className="text-lg font-bold leading-tight">{value}</p>
        {sub && <p className="text-xs text-muted-foreground">{sub}</p>}
      </div>
    </div>
  );
}

// ─── Info Row ────────────────────────────────────────────────────────────────
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

// ─── Overview Tab ────────────────────────────────────────────────────────────
function OverviewTab({ student, terms }) {
  const idLabel = {
    school:     'Roll Number',
    coaching:   'Candidate ID',
    academy:    'Trainee ID',
    college:    'Enrollment No.',
    university: 'Registration No.',
  };
  const rollNo = student.roll_number || student.candidate_id || student.trainee_id || student.reg_number;
  const className = student.class?.name || student.class_name
    || student.course?.name || student.program?.name || '—';
  const section = student.section?.name || student.section
    || student.batch?.name || student.semester?.name || '—';

  return (
    <div className="grid gap-4 lg:grid-cols-2">
      {/* Personal Info */}
      <div className="rounded-xl border bg-card shadow-sm">
        <div className="flex items-center gap-2 border-b px-4 py-3">
          <User size={14} className="text-primary" />
          <h3 className="text-sm font-semibold">Personal Information</h3>
        </div>
        <div className="px-4 py-1">
          <InfoRow icon={Hash}      label="ID"            value={rollNo} />
          <InfoRow icon={User}      label="Full Name"     value={`${student.first_name || ''} ${student.last_name || ''}`.trim()} />
          <InfoRow icon={Users}     label="Gender"        value={student.gender ? student.gender.charAt(0).toUpperCase() + student.gender.slice(1) : null} />
          <InfoRow icon={Calendar}  label="Date of Birth" value={formatDate(student.date_of_birth || student.dob)} />
          <InfoRow icon={Clock}     label="Age"           value={age(student.date_of_birth || student.dob) ? `${age(student.date_of_birth || student.dob)} years` : null} />
          <InfoRow icon={Mail}      label="Email"         value={student.email} />
          <InfoRow icon={Phone}     label="Phone"         value={student.phone} />
          <InfoRow icon={MapPin}    label="Address"       value={student.address} />
          <InfoRow icon={Calendar}  label="Admission Date" value={formatDate(student.admission_date || student.enrollment_date)} />
        </div>
      </div>

      {/* Academic Info */}
      <div className="rounded-xl border bg-card shadow-sm">
        <div className="flex items-center gap-2 border-b px-4 py-3">
          <GraduationCap size={14} className="text-primary" />
          <h3 className="text-sm font-semibold">Academic Information</h3>
        </div>
        <div className="px-4 py-1">
          <InfoRow icon={BookOpen}  label={idLabel[terms?.type] ?? 'Roll Number'} value={rollNo} />
          <InfoRow icon={BookOpen}  label={terms?.class ?? 'Class'} value={className} />
          <InfoRow icon={BookOpen}  label={terms?.section ?? 'Section'} value={section} />
          {student.department?.name && <InfoRow icon={BookOpen} label="Department" value={student.department.name} />}
          {student.faculty?.name    && <InfoRow icon={BookOpen} label="Faculty" value={student.faculty.name} />}
          {student.target_exam      && <InfoRow icon={TrendingUp} label="Target Exam" value={student.target_exam} />}
          {student.current_module   && <InfoRow icon={BookOpen} label="Current Module" value={student.current_module} />}
          {student.cgpa             && <InfoRow icon={TrendingUp} label="CGPA" value={String(student.cgpa)} />}
          <InfoRow icon={ShieldCheck} label="Status" value={student.is_active ? 'Active' : 'Inactive'} />
        </div>
      </div>

      {/* Guardian Info */}
      <div className="rounded-xl border bg-card shadow-sm">
        <div className="flex items-center gap-2 border-b px-4 py-3">
          <Users size={14} className="text-primary" />
          <h3 className="text-sm font-semibold">{terms?.parent ?? 'Guardian'} Information</h3>
        </div>
        <div className="px-4 py-1">
          <InfoRow icon={User}  label="Guardian Name"  value={student.guardian_name  || student.parent?.name} />
          <InfoRow icon={Phone} label="Guardian Phone" value={student.guardian_phone || student.parent?.phone} />
          <InfoRow icon={Mail}  label="Guardian Email" value={student.guardian_email || student.parent?.email} />
          <InfoRow icon={Users} label="Relation"       value={student.guardian_relation || student.parent?.relation} />
        </div>
      </div>

      {/* Fee Summary */}
      <div className="rounded-xl border bg-card shadow-sm">
        <div className="flex items-center gap-2 border-b px-4 py-3">
          <DollarSign size={14} className="text-primary" />
          <h3 className="text-sm font-semibold">Fee Summary</h3>
        </div>
        <div className="flex flex-col gap-3 p-4">
          {student.fee_status ? (
            <>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Current Status</span>
                <span className={cn('rounded-full border px-3 py-0.5 text-xs font-semibold capitalize', FEE_COLORS[student.fee_status] ?? 'bg-gray-100 text-gray-700')}>
                  {student.fee_status}
                </span>
              </div>
              {student.total_fee    && <div className="flex justify-between text-sm"><span className="text-muted-foreground">Total Fee</span><span className="font-semibold">Rs. {Number(student.total_fee).toLocaleString()}</span></div>}
              {student.paid_amount  && <div className="flex justify-between text-sm"><span className="text-muted-foreground">Paid</span><span className="font-semibold text-emerald-600">Rs. {Number(student.paid_amount).toLocaleString()}</span></div>}
              {student.due_amount   && <div className="flex justify-between text-sm"><span className="text-muted-foreground">Due</span><span className="font-semibold text-red-500">Rs. {Number(student.due_amount).toLocaleString()}</span></div>}
            </>
          ) : (
            <p className="text-sm text-muted-foreground">No fee record available</p>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Attendance Tab ──────────────────────────────────────────────────────────
function AttendanceTab({ student }) {
  const rows = student.attendance ?? [
    { month: 'January 2025', present: 20, absent: 2, total: 22 },
    { month: 'February 2025', present: 18, absent: 1, total: 19 },
    { month: 'March 2025', present: 22, absent: 3, total: 25 },
    { month: 'April 2025', present: 17, absent: 2, total: 19 },
  ];

  const totalPresent = rows.reduce((s, r) => s + r.present, 0);
  const totalDays    = rows.reduce((s, r) => s + r.total,   0);
  const pct = totalDays ? Math.round((totalPresent / totalDays) * 100) : 0;

  return (
    <div className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard icon={CheckSquare} label="Attendance %" value={`${pct}%`} sub="Overall" color={pct >= 75 ? 'text-emerald-600' : 'text-red-500'} bg={pct >= 75 ? 'bg-emerald-50' : 'bg-red-50'} />
        <StatCard icon={TrendingUp}  label="Days Present" value={totalPresent} sub="Total present" color="text-blue-600" bg="bg-blue-50" />
        <StatCard icon={AlertCircle} label="Days Absent"  value={totalDays - totalPresent} sub="Total absent" color="text-amber-600" bg="bg-amber-50" />
      </div>

      <div className="rounded-xl border bg-card shadow-sm overflow-hidden">
        <div className="flex items-center gap-2 border-b px-4 py-3">
          <Calendar size={14} className="text-primary" />
          <h3 className="text-sm font-semibold">Monthly Attendance</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-muted/50">
              <tr>
                <th className="px-4 py-2.5 text-left font-medium">Month</th>
                <th className="px-4 py-2.5 text-center font-medium">Present</th>
                <th className="px-4 py-2.5 text-center font-medium">Absent</th>
                <th className="px-4 py-2.5 text-center font-medium">Total</th>
                <th className="px-4 py-2.5 text-center font-medium">%</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row, i) => {
                const rowPct = row.total ? Math.round((row.present / row.total) * 100) : 0;
                return (
                  <tr key={i} className="border-t hover:bg-muted/30 transition-colors">
                    <td className="px-4 py-2.5 font-medium">{row.month}</td>
                    <td className="px-4 py-2.5 text-center text-emerald-600 font-medium">{row.present}</td>
                    <td className="px-4 py-2.5 text-center text-red-500 font-medium">{row.absent}</td>
                    <td className="px-4 py-2.5 text-center">{row.total}</td>
                    <td className="px-4 py-2.5 text-center">
                      <span className={cn('rounded-full px-2 py-0.5 text-xs font-semibold', rowPct >= 75 ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700')}>
                        {rowPct}%
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// ─── Fees Tab ────────────────────────────────────────────────────────────────
function FeesTab({ student }) {
  const feeRows = student.fee_history ?? [
    { month: 'April 2025',    amount: 3500, status: 'paid',    paid_date: '2025-04-05' },
    { month: 'March 2025',    amount: 3500, status: 'paid',    paid_date: '2025-03-07' },
    { month: 'February 2025', amount: 3500, status: 'paid',    paid_date: '2025-02-10' },
    { month: 'January 2025',  amount: 3500, status: 'pending', paid_date: null },
  ];

  return (
    <div className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard icon={DollarSign}  label="Total Paid"     value={`Rs. ${feeRows.filter(r => r.status === 'paid').reduce((s, r) => s + r.amount, 0).toLocaleString()}`}    color="text-emerald-600" bg="bg-emerald-50" />
        <StatCard icon={AlertCircle} label="Pending Amount" value={`Rs. ${feeRows.filter(r => r.status !== 'paid').reduce((s, r) => s + r.amount, 0).toLocaleString()}`}    color="text-red-500" bg="bg-red-50" />
        <StatCard icon={TrendingUp}  label="Months Paid"    value={`${feeRows.filter(r => r.status === 'paid').length} / ${feeRows.length}`} color="text-blue-600" bg="bg-blue-50" />
      </div>

      <div className="rounded-xl border bg-card shadow-sm overflow-hidden">
        <div className="flex items-center gap-2 border-b px-4 py-3">
          <DollarSign size={14} className="text-primary" />
          <h3 className="text-sm font-semibold">Fee History</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-muted/50">
              <tr>
                <th className="px-4 py-2.5 text-left font-medium">Month / Period</th>
                <th className="px-4 py-2.5 text-right font-medium">Amount</th>
                <th className="px-4 py-2.5 text-center font-medium">Paid Date</th>
                <th className="px-4 py-2.5 text-center font-medium">Status</th>
              </tr>
            </thead>
            <tbody>
              {feeRows.map((row, i) => (
                <tr key={i} className="border-t hover:bg-muted/30 transition-colors">
                  <td className="px-4 py-2.5 font-medium">{row.month}</td>
                  <td className="px-4 py-2.5 text-right font-mono">Rs. {row.amount.toLocaleString()}</td>
                  <td className="px-4 py-2.5 text-center text-muted-foreground">{row.paid_date ? formatDate(row.paid_date) : '—'}</td>
                  <td className="px-4 py-2.5 text-center">
                    <span className={cn('rounded-full border px-2 py-0.5 text-xs font-semibold capitalize', FEE_COLORS[row.status] ?? 'bg-gray-100 text-gray-700 border-gray-200')}>
                      {row.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// ─── Exams Tab ───────────────────────────────────────────────────────────────
function ExamsTab({ student }) {
  const results = student.exam_results ?? [
    { subject: 'Mathematics',  marks: 85, total: 100, grade: 'A',  exam: 'Mid Term 2025' },
    { subject: 'English',      marks: 78, total: 100, grade: 'B+', exam: 'Mid Term 2025' },
    { subject: 'Science',      marks: 92, total: 100, grade: 'A+', exam: 'Mid Term 2025' },
    { subject: 'Urdu',         marks: 71, total: 100, grade: 'B',  exam: 'Mid Term 2025' },
    { subject: 'Social Study', marks: 80, total: 100, grade: 'A',  exam: 'Mid Term 2025' },
  ];

  const avg = results.length
    ? Math.round(results.reduce((s, r) => s + (r.marks / r.total) * 100, 0) / results.length)
    : 0;

  const GRADE_COLORS = { 'A+': 'bg-emerald-100 text-emerald-800', A: 'bg-green-100 text-green-800', 'B+': 'bg-blue-100 text-blue-800', B: 'bg-sky-100 text-sky-800', C: 'bg-amber-100 text-amber-800', F: 'bg-red-100 text-red-700' };

  return (
    <div className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard icon={GraduationCap} label="Average Score" value={`${avg}%`}             color="text-violet-600" bg="bg-violet-50" />
        <StatCard icon={TrendingUp}    label="Top Subject"   value={results.length ? results.reduce((a, b) => a.marks > b.marks ? a : b).subject : '—'} color="text-emerald-600" bg="bg-emerald-50" />
        <StatCard icon={BookOpen}      label="Subjects"      value={results.length}          color="text-blue-600" bg="bg-blue-50" />
      </div>

      <div className="rounded-xl border bg-card shadow-sm overflow-hidden">
        <div className="flex items-center gap-2 border-b px-4 py-3">
          <GraduationCap size={14} className="text-primary" />
          <h3 className="text-sm font-semibold">Exam Results</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-muted/50">
              <tr>
                <th className="px-4 py-2.5 text-left font-medium">Subject</th>
                <th className="px-4 py-2.5 text-left font-medium">Exam</th>
                <th className="px-4 py-2.5 text-center font-medium">Marks</th>
                <th className="px-4 py-2.5 text-center font-medium">%</th>
                <th className="px-4 py-2.5 text-center font-medium">Grade</th>
              </tr>
            </thead>
            <tbody>
              {results.map((row, i) => {
                const pct = Math.round((row.marks / row.total) * 100);
                return (
                  <tr key={i} className="border-t hover:bg-muted/30 transition-colors">
                    <td className="px-4 py-2.5 font-medium">{row.subject}</td>
                    <td className="px-4 py-2.5 text-muted-foreground">{row.exam}</td>
                    <td className="px-4 py-2.5 text-center font-mono">{row.marks}/{row.total}</td>
                    <td className="px-4 py-2.5 text-center">
                      <div className="flex items-center gap-2 justify-center">
                        <div className="h-1.5 w-16 rounded-full bg-muted overflow-hidden">
                          <div className="h-full rounded-full bg-primary transition-all" style={{ width: `${pct}%` }} />
                        </div>
                        <span className="text-xs font-medium w-8">{pct}%</span>
                      </div>
                    </td>
                    <td className="px-4 py-2.5 text-center">
                      <span className={cn('rounded-full px-2.5 py-0.5 text-xs font-bold', GRADE_COLORS[row.grade] ?? 'bg-gray-100 text-gray-700')}>
                        {row.grade}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// ─── Main Component ──────────────────────────────────────────────────────────
export default function StudentDetailPage({ type, id }) {
  const router = useRouter();
  const canDo  = useAuthStore((s) => s.canDo);
  const { terms } = useInstituteConfig();
  const [activeTab, setActiveTab] = useState('Overview');

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
  const rollNo = student.roll_number || student.candidate_id || student.trainee_id || student.reg_number;

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
      {/* ── Breadcrumb ── */}
      <nav className="flex items-center gap-1 text-xs text-muted-foreground">
        <button onClick={() => router.push(`/${type}/students`)} className="hover:text-foreground transition-colors capitalize">
          {terms?.students ?? `${studentLabel}s`}
        </button>
        <ChevronRight size={12} />
        <span className="text-foreground font-medium">{student.first_name} {student.last_name}</span>
      </nav>

      {/* ── Profile Header ── */}
      <div className="flex flex-col gap-4 rounded-2xl border bg-card p-5 shadow-sm sm:flex-row sm:items-start">
        {/* Avatar */}
        <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-2xl font-bold text-primary ring-4 ring-primary/20">
          {initials(student)}
        </div>

        {/* Info */}
        <div className="flex-1 space-y-1.5">
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="text-xl font-bold">{student.first_name} {student.last_name}</h1>
            <span className={cn('rounded-full border px-2.5 py-0.5 text-xs font-semibold', student.is_active ? 'border-emerald-200 bg-emerald-50 text-emerald-700' : 'border-gray-200 bg-gray-50 text-gray-600')}>
              {student.is_active ? 'Active' : 'Inactive'}
            </span>
            {student.fee_status && (
              <span className={cn('rounded-full border px-2.5 py-0.5 text-xs font-semibold capitalize', FEE_COLORS[student.fee_status] ?? 'bg-gray-100 text-gray-700 border-gray-200')}>
                Fee: {student.fee_status}
              </span>
            )}
          </div>

          {rollNo && (
            <p className="font-mono text-sm text-muted-foreground">#{rollNo}</p>
          )}

          {/* Quick meta pills */}
          <div className="flex flex-wrap gap-3 pt-1">
            {(student.class_name || student.class?.name) && (
              <span className="flex items-center gap-1 text-xs text-muted-foreground">
                <BookOpen size={11} /> {student.class?.name || student.class_name}
                {(student.section || student.section?.name) && ` · ${student.section?.name || student.section}`}
              </span>
            )}
            {(student.course?.name) && (
              <span className="flex items-center gap-1 text-xs text-muted-foreground">
                <BookOpen size={11} /> {student.course.name}
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

        {/* Action Buttons */}
        <div className="flex shrink-0 gap-2">
          <button
            onClick={() => router.push(`/${type}/students`)}
            className="flex items-center gap-1.5 rounded-lg border px-3 py-2 text-sm hover:bg-accent transition-colors"
          >
            <ArrowLeft size={14} /> Back
          </button>
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

      {/* ── Tabs ── */}
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

      {/* ── Tab Content ── */}
      {activeTab === 'Overview'    && <OverviewTab    student={student} terms={{ ...terms, type }} />}
      {activeTab === 'Attendance'  && <AttendanceTab  student={student} />}
      {activeTab === 'Fees'        && <FeesTab        student={student} />}
      {activeTab === 'Exams'       && <ExamsTab       student={student} />}
    </div>
  );
}
