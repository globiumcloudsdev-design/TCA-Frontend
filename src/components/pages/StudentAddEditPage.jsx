'use client';
/**
 * StudentAddEditPage — Add or Edit a student/candidate/trainee
 * Route (add):  /[type]/students/add
 * Route (edit): /[type]/students/[id]/edit
 */
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  ArrowLeft, Save, User, Phone, Mail, MapPin, Calendar,
  BookOpen, Users, GraduationCap, ChevronRight,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import useInstituteConfig from '@/hooks/useInstituteConfig';
import useAuthStore from '@/store/authStore';
import { DUMMY_FLAT_STUDENTS } from '@/data/dummyData';

// ─── tiny helpers ────────────────────────────────────────────────────────────
const GENDERS = ['male', 'female', 'other'];

function FormField({ label, required, children, hint }) {
  return (
    <div className="space-y-1.5">
      <label className="block text-sm font-medium">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      {children}
      {hint && <p className="text-xs text-muted-foreground">{hint}</p>}
    </div>
  );
}

function Input({ className = '', ...props }) {
  return (
    <input
      className={cn(
        'h-9 w-full rounded-lg border bg-background px-3 text-sm placeholder:text-muted-foreground',
        'focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-colors',
        className,
      )}
      {...props}
    />
  );
}

function Select({ className = '', children, ...props }) {
  return (
    <select
      className={cn(
        'h-9 w-full rounded-lg border bg-background px-3 text-sm',
        'focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-colors',
        className,
      )}
      {...props}
    >
      {children}
    </select>
  );
}

function SectionCard({ icon: Icon, title, children }) {
  return (
    <div className="rounded-xl border bg-card shadow-sm">
      <div className="flex items-center gap-2 border-b px-4 py-3">
        <Icon size={14} className="text-primary" />
        <h3 className="text-sm font-semibold">{title}</h3>
      </div>
      <div className="grid gap-4 p-4 sm:grid-cols-2">
        {children}
      </div>
    </div>
  );
}

// ─── type-specific academic fields ──────────────────────────────────────────
function AcademicFields({ type, form, onChange, terms }) {
  const baseSelect = (name, label, options, required) => (
    <FormField key={name} label={label} required={required}>
      <Select name={name} value={form[name] ?? ''} onChange={onChange}>
        <option value="">Select {label}</option>
        {options.map((o) => (
          <option key={o.value} value={o.value}>{o.label}</option>
        ))}
      </Select>
    </FormField>
  );

  if (type === 'school') return (
    <>
      {baseSelect('class_id', terms?.class ?? 'Class', [
        { value: 'cls-1', label: 'Class 1' }, { value: 'cls-2', label: 'Class 2' },
        { value: 'cls-3', label: 'Class 3' }, { value: 'cls-4', label: 'Class 4' },
        { value: 'cls-5', label: 'Class 5' }, { value: 'cls-6', label: 'Class 6' },
        { value: 'cls-7', label: 'Class 7' }, { value: 'cls-8', label: 'Class 8' },
      ], true)}
      {baseSelect('section_id', terms?.section ?? 'Section', [
        { value: 'sec-a', label: 'Section A' }, { value: 'sec-b', label: 'Section B' }, { value: 'sec-c', label: 'Section C' },
      ], false)}
      <FormField label="Roll Number">
        <Input name="roll_number" value={form.roll_number ?? ''} onChange={onChange} placeholder="e.g. TCA-001" />
      </FormField>
    </>
  );

  if (type === 'coaching') return (
    <>
      {baseSelect('course_id', 'Course', [
        { value: 'crs-1', label: 'MDCAT Prep' }, { value: 'crs-2', label: 'ECAT Prep' },
        { value: 'crs-3', label: 'CSS/PMS' }, { value: 'crs-4', label: 'IELTS/TOEFL' },
      ], true)}
      {baseSelect('batch_id', 'Batch', [
        { value: 'bat-1', label: 'Morning Batch' }, { value: 'bat-2', label: 'Evening Batch' }, { value: 'bat-3', label: 'Weekend Batch' },
      ], false)}
      <FormField label="Target Exam">
        <Input name="target_exam" value={form.target_exam ?? ''} onChange={onChange} placeholder="e.g. MDCAT 2025" />
      </FormField>
      <FormField label="Candidate ID">
        <Input name="roll_number" value={form.roll_number ?? ''} onChange={onChange} placeholder="Auto-generated" />
      </FormField>
    </>
  );

  if (type === 'academy') return (
    <>
      {baseSelect('program_id', 'Program', [
        { value: 'prog-1', label: 'Web Development' }, { value: 'prog-2', label: 'Graphic Design' },
        { value: 'prog-3', label: 'Digital Marketing' }, { value: 'prog-4', label: 'Data Science' },
      ], true)}
      {baseSelect('batch_id', 'Batch', [
        { value: 'bat-1', label: 'Batch 01 - Jan 2025' }, { value: 'bat-2', label: 'Batch 02 - Mar 2025' },
      ], false)}
      <FormField label="Current Module">
        <Input name="current_module" value={form.current_module ?? ''} onChange={onChange} placeholder="e.g. Module 1" />
      </FormField>
      <FormField label="Trainee ID">
        <Input name="roll_number" value={form.roll_number ?? ''} onChange={onChange} placeholder="Auto-generated" />
      </FormField>
    </>
  );

  if (type === 'college') return (
    <>
      {baseSelect('department_id', 'Department', [
        { value: 'dep-1', label: 'Computer Science' }, { value: 'dep-2', label: 'Business Administration' },
        { value: 'dep-3', label: 'Electrical Engineering' }, { value: 'dep-4', label: 'Mass Communication' },
      ], true)}
      {baseSelect('program_id', 'Program', [
        { value: 'prg-1', label: 'BS Computer Science' }, { value: 'prg-2', label: 'BBA' },
        { value: 'prg-3', label: 'BS EE' },
      ], true)}
      {baseSelect('semester_id', 'Semester', [
        { value: 'sem-1', label: '1st Semester' }, { value: 'sem-2', label: '2nd Semester' },
        { value: 'sem-3', label: '3rd Semester' }, { value: 'sem-4', label: '4th Semester' },
      ], false)}
      <FormField label="Enrollment No.">
        <Input name="roll_number" value={form.roll_number ?? ''} onChange={onChange} placeholder="Auto-generated" />
      </FormField>
    </>
  );

  if (type === 'university') return (
    <>
      {baseSelect('faculty_id', 'Faculty', [
        { value: 'fac-1', label: 'Faculty of Engineering' }, { value: 'fac-2', label: 'Faculty of Science' },
        { value: 'fac-3', label: 'Faculty of Social Sciences' },
      ], false)}
      {baseSelect('department_id', 'Department', [
        { value: 'dep-1', label: 'CS & IT' }, { value: 'dep-2', label: 'Electrical Engineering' },
        { value: 'dep-3', label: 'Business Analytics' },
      ], true)}
      {baseSelect('program_id', 'Program', [
        { value: 'prg-1', label: 'BS Computer Science' }, { value: 'prg-2', label: 'MS Software Engineering' },
        { value: 'prg-3', label: 'PhD Computer Science' },
      ], true)}
      {baseSelect('semester_id', 'Semester', [
        { value: 'sem-1', label: '1st Semester' }, { value: 'sem-2', label: '2nd Semester' },
        { value: 'sem-3', label: '3rd Semester' }, { value: 'sem-4', label: '4th Semester' },
      ], false)}
      <FormField label="Reg. Number">
        <Input name="roll_number" value={form.roll_number ?? ''} onChange={onChange} placeholder="Auto-generated" />
      </FormField>
      <FormField label="CGPA">
        <Input name="cgpa" type="number" step="0.01" min="0" max="4" value={form.cgpa ?? ''} onChange={onChange} placeholder="0.00" />
      </FormField>
    </>
  );

  return null;
}

// ─── Main Component ──────────────────────────────────────────────────────────
const EMPTY = {
  first_name: '', last_name: '', email: '', phone: '',
  gender: '', date_of_birth: '', address: '',
  guardian_name: '', guardian_phone: '', guardian_email: '',
  guardian_relation: '', roll_number: '', is_active: true,
};

export default function StudentAddEditPage({ type, id, mode = 'add' }) {
  const router   = useRouter();
  const qc       = useQueryClient();
  const canDo    = useAuthStore((s) => s.canDo);
  const { terms } = useInstituteConfig();
  const [form,  setForm]  = useState(EMPTY);
  const [errors, setErrors] = useState({});

  const isEdit = mode === 'edit';
  const studentLabel = terms?.student ?? (type === 'coaching' ? 'Candidate' : type === 'academy' ? 'Trainee' : 'Student');

  // ── Fetch existing student if editing ──────────────────────────────────────
  const { isLoading: fetching } = useQuery({
    queryKey: ['student-edit', type, id],
    enabled: isEdit && !!id,
    queryFn: async () => {
      try {
        const { studentService } = await import('@/services');
        return await studentService.getById(id, type);
      } catch {
        return { data: DUMMY_FLAT_STUDENTS.find((s) => s.id === id) ?? null };
      }
    },
    onSuccess: (res) => {
      const s = res?.data;
      if (s) setForm({ ...EMPTY, ...s });
    },
  });

  // ── Mutation ───────────────────────────────────────────────────────────────
  const mutation = useMutation({
    mutationFn: async (payload) => {
      try {
        const { studentService } = await import('@/services');
        if (isEdit) return await studentService.update(id, payload, type);
        return await studentService.create(payload, type);
      } catch {
        // Demo mode — simulate success
        return { success: true };
      }
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['students'] });
      router.push(`/${type}/students`);
    },
  });

  // ── Handlers ───────────────────────────────────────────────────────────────
  const handleChange = (e) => {
    const { name, value, type: t, checked } = e.target;
    setForm((prev) => ({ ...prev, [name]: t === 'checkbox' ? checked : value }));
    if (errors[name]) setErrors((prev) => { const n = { ...prev }; delete n[name]; return n; });
  };

  const validate = () => {
    const errs = {};
    if (!form.first_name?.trim()) errs.first_name = 'First name is required';
    if (!form.last_name?.trim())  errs.last_name  = 'Last name is required';
    return errs;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    mutation.mutate(form);
  };

  if (isEdit && fetching) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="flex flex-col items-center gap-3 text-muted-foreground">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-muted border-t-primary" />
          <span className="text-sm">Loading {studentLabel.toLowerCase()} data…</span>
        </div>
      </div>
    );
  }

  if (isEdit && !canDo('students.update')) {
    return <div className="py-20 text-center text-muted-foreground">You don't have permission to edit {studentLabel.toLowerCase()}s.</div>;
  }
  if (!isEdit && !canDo('students.create')) {
    return <div className="py-20 text-center text-muted-foreground">You don't have permission to add {studentLabel.toLowerCase()}s.</div>;
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* ── Breadcrumb / Header ── */}
      <div>
        <nav className="flex items-center gap-1 text-xs text-muted-foreground mb-2">
          <button type="button" onClick={() => router.push(`/${type}/students`)} className="hover:text-foreground transition-colors capitalize">
            {terms?.students ?? `${studentLabel}s`}
          </button>
          <ChevronRight size={12} />
          {isEdit && id && (
            <>
              <button type="button" onClick={() => router.push(`/${type}/students/${id}`)} className="hover:text-foreground transition-colors">
                {form.first_name} {form.last_name}
              </button>
              <ChevronRight size={12} />
            </>
          )}
          <span className="text-foreground font-medium">{isEdit ? 'Edit' : 'Add New'}</span>
        </nav>
        <h1 className="text-xl font-bold">{isEdit ? `Edit ${studentLabel}` : `Add New ${studentLabel}`}</h1>
        <p className="text-sm text-muted-foreground">{isEdit ? 'Update the details below.' : `Fill in the details to enroll a new ${studentLabel.toLowerCase()}.`}</p>
      </div>

      {/* ── Personal Info ── */}
      <SectionCard icon={User} title="Personal Information">
        <FormField label="First Name" required>
          <Input name="first_name" value={form.first_name} onChange={handleChange} placeholder="Ali" />
          {errors.first_name && <p className="mt-1 text-xs text-red-500">{errors.first_name}</p>}
        </FormField>
        <FormField label="Last Name" required>
          <Input name="last_name" value={form.last_name} onChange={handleChange} placeholder="Raza" />
          {errors.last_name && <p className="mt-1 text-xs text-red-500">{errors.last_name}</p>}
        </FormField>
        <FormField label="Gender">
          <Select name="gender" value={form.gender} onChange={handleChange}>
            <option value="">Select gender</option>
            {GENDERS.map((g) => <option key={g} value={g}>{g.charAt(0).toUpperCase() + g.slice(1)}</option>)}
          </Select>
        </FormField>
        <FormField label="Date of Birth">
          <Input name="date_of_birth" type="date" value={form.date_of_birth ?? ''} onChange={handleChange} />
        </FormField>
        <FormField label="Email Address">
          <Input name="email" type="email" value={form.email ?? ''} onChange={handleChange} placeholder="student@example.com" />
        </FormField>
        <FormField label="Phone Number">
          <Input name="phone" type="tel" value={form.phone ?? ''} onChange={handleChange} placeholder="+92-300-1234567" />
        </FormField>
        <FormField label="Address" >
          <Input name="address" value={form.address ?? ''} onChange={handleChange} placeholder="House #, Street, City" />
        </FormField>
        <FormField label="Status">
          <div className="flex h-9 items-center gap-3">
            <label className="flex items-center gap-2 cursor-pointer select-none">
              <input
                type="checkbox"
                name="is_active"
                checked={!!form.is_active}
                onChange={handleChange}
                className="h-4 w-4 rounded border accent-primary"
              />
              <span className="text-sm">{form.is_active ? 'Active' : 'Inactive'}</span>
            </label>
          </div>
        </FormField>
      </SectionCard>

      {/* ── Academic Info ── */}
      <SectionCard icon={GraduationCap} title="Academic Information">
        <AcademicFields type={type} form={form} onChange={handleChange} terms={terms} />
      </SectionCard>

      {/* ── Guardian Info ── */}
      <SectionCard icon={Users} title={`${terms?.parent ?? 'Guardian'} / Parent Information`}>
        <FormField label="Guardian Name">
          <Input name="guardian_name" value={form.guardian_name ?? ''} onChange={handleChange} placeholder="Parent / Guardian full name" />
        </FormField>
        <FormField label="Guardian Phone">
          <Input name="guardian_phone" type="tel" value={form.guardian_phone ?? ''} onChange={handleChange} placeholder="+92-300-1234567" />
        </FormField>
        <FormField label="Guardian Email">
          <Input name="guardian_email" type="email" value={form.guardian_email ?? ''} onChange={handleChange} placeholder="parent@example.com" />
        </FormField>
        <FormField label="Relation">
          <Select name="guardian_relation" value={form.guardian_relation ?? ''} onChange={handleChange}>
            <option value="">Select relation</option>
            {['Father', 'Mother', 'Guardian', 'Sibling', 'Other'].map((r) => (
              <option key={r} value={r.toLowerCase()}>{r}</option>
            ))}
          </Select>
        </FormField>
      </SectionCard>

      {/* ── Submit ── */}
      <div className="flex items-center justify-end gap-3 pb-4">
        <button
          type="button"
          onClick={() => router.back()}
          className="flex items-center gap-1.5 rounded-lg border px-4 py-2 text-sm hover:bg-accent transition-colors"
        >
          <ArrowLeft size={14} /> Cancel
        </button>
        <button
          type="submit"
          disabled={mutation.isPending}
          className="flex items-center gap-1.5 rounded-lg bg-primary px-5 py-2 text-sm font-semibold text-primary-foreground hover:opacity-90 disabled:opacity-60 transition-opacity"
        >
          {mutation.isPending ? (
            <><span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white/40 border-t-white" /> Saving…</>
          ) : (
            <><Save size={14} /> {isEdit ? 'Save Changes' : `Add ${studentLabel}`}</>
          )}
        </button>
      </div>
    </form>
  );
}