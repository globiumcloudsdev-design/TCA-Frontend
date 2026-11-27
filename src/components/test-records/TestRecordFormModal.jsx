'use client';

import { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Loader2 } from 'lucide-react';
import { testRecordService, teacherTestRecordService, getTestRecordError } from '@/services/testRecordService';
import AppModal from '@/components/common/AppModal';
import DatePickerField from '@/components/common/DatePickerField';
import { Button } from '@/components/ui/button';
import { validateTotals } from '@/lib/marksValidation';
import AssignmentSelects from './AssignmentSelects';
import { FieldLabel, NativeSelect, SELECT_CLS, InlineBanner } from './shared';

const EMPTY = { title: '', teacher_id: '', class_id: '', section_id: '', subject_id: '', subject_name: '', test_date: '', total_marks: '', passing_marks: '' };

/**
 * Create / edit a Test Record.
 * Class → Section → Subject always come from the teacher's assignments
 *   admin   : GET /test-records/options?teacher_id=…  → data.teacher_assignments (after picking a teacher)
 *   teacher : GET /portal/teacher/test-records/options → data.classes
 * Both modes share <AssignmentSelects/>. No other class/section/subject endpoints are called.
 */
export default function TestRecordFormModal({ open, onClose, mode = 'admin', record = null, onSubmit, saving, serverError }) {
  const isEdit = !!record;
  const isAdmin = mode === 'admin';
  const locked = isEdit && Number(record?.stats?.entered_count || 0) > 0; // teacher/class/section/subject fixed once marks exist

  const [form, setForm] = useState(EMPTY);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (!open) return;
    setErrors({});
    setForm(
      record
        ? {
            title: record.title || '',
            teacher_id: record.teacher_id || '',
            class_id: record.class_id || '',
            section_id: record.section_id || '',
            subject_id: record.subject_id || '',
            subject_name: record.subject_name || '',
            test_date: record.test_date || '',
            total_marks: record.total_marks ?? '',
            passing_marks: record.passing_marks ?? '',
          }
        : EMPTY
    );
  }, [open, record]);

  const set = (patch) => setForm((f) => ({ ...f, ...patch }));

  // ── Option data ──────────────────────────────────────────────────────────
  // The form is never replaced by a spinner: only the dependent dropdowns show their own inline loading state.
  const teachersQ = useQuery({
    queryKey: ['test-record-options', 'admin', ''],
    queryFn: () => testRecordService.options(),
    enabled: open && isAdmin,
    staleTime: 60_000,
  });
  const assignmentsQ = useQuery({
    queryKey: ['test-record-assignments', form.teacher_id || ''],
    queryFn: () => testRecordService.options(form.teacher_id),
    enabled: open && isAdmin && !!form.teacher_id,
    staleTime: 60_000,
  });
  const teacherOptions = useQuery({
    queryKey: ['test-record-options', 'teacher'],
    queryFn: () => teacherTestRecordService.options(),
    enabled: open && !isAdmin,
    staleTime: 60_000,
  });

  const assignmentClasses = isAdmin ? assignmentsQ.data?.data?.teacher_assignments || [] : teacherOptions.data?.data?.classes || [];
  const assignmentsLoading = isAdmin ? !!form.teacher_id && assignmentsQ.isLoading : teacherOptions.isLoading;
  const assignmentsError = isAdmin ? (form.teacher_id ? assignmentsQ.error : null) : teacherOptions.error;
  const teacherOptionsList = (teachersQ.data?.data?.teachers || []).map((t) => ({
    value: t.id,
    label: t.registration_no ? `${t.name} (${t.registration_no})` : t.name,
  }));
  const hasSections = !!assignmentClasses.find((c) => c.id === form.class_id)?.has_sections;

  // Live rules (shown as you type): total > 0, passing <= total
  const lt = validateTotals(form.total_marks, form.passing_marks);
  const liveTotals = { ...(lt.total ? { total_marks: lt.total } : {}), ...(lt.passing ? { passing_marks: lt.passing } : {}) };

  // ── Validation + submit ──────────────────────────────────────────────────
  const validate = () => {
    const e = {};
    if (isAdmin && !form.teacher_id) e.teacher_id = 'Select a teacher';
    if (!form.class_id) e.class_id = 'Select a class';
    if (hasSections && !form.section_id) e.section_id = 'Select a section';
    if (!form.subject_id && !String(form.subject_name || '').trim()) e.subject = 'Select a subject';
    if (!form.test_date) e.test_date = 'Pick a test date';
    if (form.total_marks === '') e.total_marks = 'Enter the total marks';
    if (form.passing_marks === '') e.passing_marks = 'Enter the passing marks';
    Object.assign(e, liveTotals);
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const submit = (ev) => {
    ev.preventDefault();
    if (!validate()) return;
    const body = {
      class_id: form.class_id,
      test_date: form.test_date,
      total_marks: Number(form.total_marks),
      passing_marks: Number(form.passing_marks),
    };
    if (isAdmin) body.teacher_id = form.teacher_id;
    if (hasSections) body.section_id = form.section_id;
    if (form.subject_id) body.subject_id = form.subject_id;
    if (String(form.subject_name || '').trim()) body.subject_name = String(form.subject_name).trim();
    if (String(form.title || '').trim()) body.title = String(form.title).trim();
    onSubmit(body);
  };

  const err = (k) => errors[k] && <p className="mt-1 text-xs text-red-600">{errors[k]}</p>;

  return (
    <AppModal open={open} onClose={onClose} title={isEdit ? 'Edit Test Record' : 'Add Test Record'} description="Class tests are separate from formal exams." size="lg">
      <form onSubmit={submit} className="space-y-4">
        {locked && <InlineBanner tone="lock">Marks already exist, so teacher, class, section and subject can no longer be changed.</InlineBanner>}
        {assignmentsError && <InlineBanner tone="warn">{getTestRecordError(assignmentsError, 'Could not load classes')}</InlineBanner>}
        {serverError && <InlineBanner tone="warn">{serverError}</InlineBanner>}

        {isAdmin && (
          <div>
            <FieldLabel required>Teacher</FieldLabel>
            <NativeSelect
              value={form.teacher_id}
              onChange={(v) => set({ teacher_id: v, class_id: '', section_id: '', subject_id: '', subject_name: '' })}
              options={teacherOptionsList}
              placeholder={teachersQ.isLoading ? 'Loading teachers…' : 'Select teacher'}
              disabled={locked || teachersQ.isLoading}
            />
            {teachersQ.error && <p className="mt-1 text-xs text-red-600">{getTestRecordError(teachersQ.error, 'Could not load teachers')}</p>}
            {err('teacher_id')}
          </div>
        )}

        <AssignmentSelects
          classes={assignmentClasses}
          value={form}
          onChange={set}
          disabled={locked}
          loading={assignmentsLoading}
          noTeacher={isAdmin && !form.teacher_id}
          errors={errors}
          keep={isEdit && (!isAdmin || form.teacher_id === record?.teacher_id) ? record : null}
        />

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <DatePickerField
              label="Test date"
              required
              name="test_date"
              value={form.test_date}
              onChange={(v) => set({ test_date: v || '' })}
              minDate="today"
              placeholder="Pick a date (today or later)"
            />
            {err('test_date')}
          </div>

          <div>
            <FieldLabel>Title (optional)</FieldLabel>
            <input value={form.title} onChange={(e) => set({ title: e.target.value })} placeholder="Default: <Subject> Test – <date>" className={SELECT_CLS} maxLength={150} />
          </div>

          <div>
            <FieldLabel required>Total marks</FieldLabel>
            <input type="number" inputMode="decimal" min="0" step="0.01" value={form.total_marks} onChange={(e) => set({ total_marks: e.target.value })} aria-invalid={!!(liveTotals.total_marks || errors.total_marks)} className={`${SELECT_CLS} ${liveTotals.total_marks ? '!border-red-500 !bg-red-50' : ''}`} />
            {liveTotals.total_marks ? <p className="mt-1 text-xs text-red-600">{liveTotals.total_marks}</p> : err('total_marks')}
          </div>

          <div>
            <FieldLabel required>Passing marks</FieldLabel>
            <input type="number" inputMode="decimal" min="0" max={Number(form.total_marks) > 0 ? form.total_marks : undefined} step="0.01" value={form.passing_marks} onChange={(e) => set({ passing_marks: e.target.value })} aria-invalid={!!(liveTotals.passing_marks || errors.passing_marks)} className={`${SELECT_CLS} ${liveTotals.passing_marks ? '!border-red-500 !bg-red-50' : ''}`} />
            {liveTotals.passing_marks ? <p className="mt-1 text-xs text-red-600">{liveTotals.passing_marks}</p> : err('passing_marks')}
          </div>
        </div>

        <div className="flex justify-end gap-2 border-t border-slate-100 pt-4">
          <Button type="button" variant="outline" onClick={onClose} disabled={saving}>
            Cancel
          </Button>
          <Button type="submit" disabled={saving || Object.keys(liveTotals).length > 0} className="bg-tca-primary text-white hover:bg-tca-primary/90">
            {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {isEdit ? 'Save changes' : 'Create test'}
          </Button>
        </div>
      </form>
    </AppModal>
  );
}
