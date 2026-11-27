'use client';

import { useMemo } from 'react';
import { Loader2 } from 'lucide-react';
import { FieldLabel, NativeSelect, InlineBanner } from './shared';

/**
 * Cascading Class → Section → Subject selects driven ONLY by a teacher's assignments
 * (shape of GET /test-records/options?teacher_id=… → data.teacher_assignments and of
 * GET /portal/teacher/test-records/options → data.classes):
 *   [{ id, name, has_sections, sections: [{ id, name, subjects: [{id|null, name}] }], subjects: [{id|null, name}] }]
 * Used by both the admin and the teacher form so they behave identically.
 *
 * value: { class_id, section_id, subject_id, subject_name }   onChange(patch)
 * `keep` optionally injects the currently saved class/section/subject so editing never shows blanks.
 */
export default function AssignmentSelects({ classes = [], value, onChange, disabled, loading, noTeacher, errors = {}, keep }) {
  const merged = useMemo(() => {
    // When editing, make sure the saved class is selectable even if the assignment list changed.
    if (!keep?.class_id || classes.some((c) => c.id === keep.class_id)) return classes;
    return [
      ...classes,
      {
        id: keep.class_id,
        name: keep.class_name || 'Current class',
        has_sections: !!keep.section_id,
        sections: keep.section_id
          ? [{ id: keep.section_id, name: keep.section_name || 'Current section', subjects: keep.subject_name ? [{ id: keep.subject_id || null, name: keep.subject_name }] : [] }]
          : [],
        subjects: !keep.section_id && keep.subject_name ? [{ id: keep.subject_id || null, name: keep.subject_name }] : [],
      },
    ];
  }, [classes, keep]);

  const cls = merged.find((c) => c.id === value.class_id);
  const hasSections = !!cls?.has_sections;
  const section = cls?.sections?.find((s) => s.id === value.section_id);
  const subjects = hasSections ? section?.subjects || [] : cls?.subjects || [];

  const err = (k) => errors[k] && <p className="mt-1 text-xs text-red-600">{errors[k]}</p>;

  if (noTeacher) {
    return <InlineBanner tone="info">Select a teacher first to see their classes, sections and subjects.</InlineBanner>;
  }
  if (loading) {
    return (
      <div className="flex items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-3 py-3 text-sm text-slate-500">
        <Loader2 className="h-4 w-4 animate-spin text-tca-primary" /> Loading this teacher’s classes…
      </div>
    );
  }
  if (merged.length === 0) {
    return (
      <InlineBanner tone="warn">
        This teacher has no classes assigned yet. Assign classes in the timetable first.
      </InlineBanner>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
      <div>
        <FieldLabel required>Class</FieldLabel>
        <NativeSelect
          value={value.class_id}
          onChange={(v) => onChange({ class_id: v, section_id: '', subject_id: '', subject_name: '' })}
          options={merged.map((c) => ({ value: c.id, label: c.name }))}
          placeholder="Select class"
          disabled={disabled}
        />
        {err('class_id')}
      </div>

      <div>
        <FieldLabel required={hasSections}>Section</FieldLabel>
        <NativeSelect
          value={value.section_id}
          onChange={(v) => onChange({ section_id: v, subject_id: '', subject_name: '' })}
          options={(cls?.sections || []).map((s) => ({ value: s.id, label: s.name }))}
          placeholder={!value.class_id ? 'Select class first' : hasSections ? 'Select section' : 'No sections'}
          disabled={disabled || !value.class_id || !hasSections}
        />
        {err('section_id')}
      </div>

      <div className="sm:col-span-2">
        <FieldLabel required>Subject</FieldLabel>
        <NativeSelect
          value={value.subject_name}
          onChange={(name) => {
            const match = subjects.find((s) => s.name === name);
            onChange({ subject_name: name, subject_id: match?.id || '' });
          }}
          options={subjects.map((s) => ({ value: s.name, label: s.name }))}
          placeholder={!value.class_id ? 'Select class first' : hasSections && !value.section_id ? 'Select section first' : 'Select subject'}
          disabled={disabled || !value.class_id || (hasSections && !value.section_id)}
        />
        {err('subject')}
      </div>
    </div>
  );
}
