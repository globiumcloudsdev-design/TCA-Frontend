'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Trash2, Pencil } from 'lucide-react';
import { toast } from 'sonner';

import { timetableService, classService, sectionService, subjectService, teacherService } from '@/services';
import useAuthStore from '@/store/authStore';
import { PERMISSIONS, WEEK_DAYS, DEFAULT_PERIODS } from '@/constants';
import {
  PageHeader, AppModal, ConfirmDialog,
} from '@/components/common';
import SelectField from '@/components/common/SelectField';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

const extractRows = (d) => d?.data?.rows ?? d?.data ?? [];

/* ─── colour palette for subjects ───────────────────────────── */
const COLOURS = [
  'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300',
  'bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300',
  'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300',
  'bg-orange-100 text-orange-700 dark:bg-orange-900/40 dark:text-orange-300',
  'bg-pink-100 text-pink-700 dark:bg-pink-900/40 dark:text-pink-300',
  'bg-cyan-100 text-cyan-700 dark:bg-cyan-900/40 dark:text-cyan-300',
  'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/40 dark:text-yellow-300',
  'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300',
];
const subjectColour = (() => {
  const map = {};
  let i = 0;
  return (subject) => {
    if (!subject) return '';
    if (!map[subject]) { map[subject] = COLOURS[i % COLOURS.length]; i++; }
    return map[subject];
  };
})();

const DAYS = WEEK_DAYS ?? [
  { value: 'monday', label: 'Mon' },
  { value: 'tuesday', label: 'Tue' },
  { value: 'wednesday', label: 'Wed' },
  { value: 'thursday', label: 'Thu' },
  { value: 'friday', label: 'Fri' },
  { value: 'saturday', label: 'Sat' },
];

const PERIODS = DEFAULT_PERIODS ?? Array.from({ length: 8 }, (_, i) => ({
  period: i + 1,
  label: `Period ${i + 1}`,
  start_time: '',
  end_time: '',
}));

export default function TimetablePage() {
  const qc = useQueryClient();

  const canCreate = useAuthStore((s) => s.canDo(PERMISSIONS.TIMETABLE_CREATE));
  const canDelete = useAuthStore((s) => s.canDo(PERMISSIONS.TIMETABLE_DELETE));

  const [mounted, setMounted] = useState(false);
  useEffect(() => { setMounted(true); }, []);

  const [classId,   setClassId]   = useState('');
  const [sectionId, setSectionId] = useState('');
  const [addOpen,   setAddOpen]   = useState(false);
  const [addSlot,   setAddSlot]   = useState({ day: '', period: '' }); // pre-fill when clicking empty cell
  const [editOpen,  setEditOpen]  = useState(false);
  const [editTarget,setEditTarget]= useState(null); // slot being edited
  const [deleteTarget, setDeleteTarget] = useState(null);

  const { data: classesData } = useQuery({
    queryKey: ['classes-all'],
    queryFn:  () => classService.getAll({ limit: 100 }),
  });

  const { data: sectionsData } = useQuery({
    queryKey: ['sections', classId],
    queryFn:  () => sectionService.getAll({ class_id: classId, limit: 100 }),
    enabled:  !!classId,
  });

  const { data: subjectsData } = useQuery({
    queryKey: ['subjects-by-class', classId],
    queryFn:  () => subjectService.getAll({ class_id: classId, limit: 200 }),
    enabled:  !!classId,
  });

  const { data: teachersData } = useQuery({
    queryKey: ['teachers-all'],
    queryFn:  () => teacherService.getAll({ limit: 200 }),
  });

  const { data: ttData, isLoading } = useQuery({
    queryKey: ['timetable', classId, sectionId],
    queryFn:  () => timetableService.getByClass(classId, sectionId || undefined),
    enabled:  !!classId,
  });

  const classes       = extractRows(classesData);
  const sections      = extractRows(sectionsData);
  const classSubjects = extractRows(subjectsData);
  const teachers      = extractRows(teachersData);
  const slots         = extractRows(ttData);

  /* build grid: grid[day][period] = slot | undefined */
  const grid = {};
  DAYS.forEach((d) => { grid[d.value] = {}; });
  slots.forEach((s) => {
    if (grid[s.day]) grid[s.day][s.period] = s;
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, body }) => timetableService.update(id, body),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['timetable'] }); toast.success('Slot updated'); setEditOpen(false); setEditTarget(null); },
    onError:   (e) => toast.error(e?.response?.data?.message ?? 'Failed'),
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => timetableService.delete(id),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['timetable'] }); toast.success('Slot removed'); setDeleteTarget(null); },
    onError:   (e) => toast.error(e?.response?.data?.message ?? 'Failed'),
  });

  if (!mounted) return null;

  return (
    <div className="space-y-4">
      <PageHeader
        title="Timetable"
        description="Class and teacher scheduling"
        action={
          canCreate && classId && (
            <Button onClick={() => { setAddSlot({ day: DAYS[0]?.value, period: 1 }); setAddOpen(true); }} size="sm">
              <Plus className="w-4 h-4 mr-1.5" /> Add Slot
            </Button>
          )
        }
      />

      {/* Filters */}
      <div className="flex flex-wrap gap-3 pb-1">
        <select
          className="rounded-md border bg-background px-3 py-2 text-sm focus:ring-2 focus:ring-ring outline-none min-w-[160px]"
          value={classId}
          onChange={(e) => { setClassId(e.target.value); setSectionId(''); }}
        >
          <option value="">— Select Class —</option>
          {classes.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>

        {classId && (
          <select
            className="rounded-md border bg-background px-3 py-2 text-sm focus:ring-2 focus:ring-ring outline-none min-w-[140px]"
            value={sectionId}
            onChange={(e) => setSectionId(e.target.value)}
          >
            <option value="">All Sections</option>
            {sections.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
          </select>
        )}
      </div>

      {!classId && (
        <p className="text-sm text-muted-foreground py-8 text-center">Select a class to view its timetable.</p>
      )}

      {classId && isLoading && (
        <p className="text-sm text-muted-foreground py-8 text-center">Loading timetable…</p>
      )}

      {classId && !isLoading && (
        <div className="overflow-x-auto rounded-lg border">
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr className="bg-muted/50">
                <th className="px-4 py-3 text-left font-medium text-muted-foreground w-28 border-b border-r">Period</th>
                {DAYS.map((d) => (
                  <th key={d.value} className="px-4 py-3 text-center font-medium border-b border-r last:border-r-0">
                    {d.label ?? d.value}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {PERIODS.map((p) => (
                <tr key={p.period} className="border-b last:border-0 hover:bg-muted/20">
                  <td className="px-4 py-3 font-medium text-muted-foreground border-r">
                    <div>{p.label ?? `P${p.period}`}</div>
                    {p.start_time && (
                      <div className="text-[10px] text-muted-foreground">{p.start_time}–{p.end_time}</div>
                    )}
                  </td>
                  {DAYS.map((d) => {
                    const slot = grid[d.value]?.[p.period];
                    return (
                      <td key={d.value} className="px-2 py-2 text-center align-middle border-r last:border-r-0">
                        {slot ? (
                          <div className={`rounded-md px-2 py-1.5 text-xs font-medium group relative ${subjectColour(slot.subject)}`}>
                            <div className="truncate max-w-[100px] mx-auto">{slot.subject}</div>
                            {(slot.teacher_name ?? (slot.teacher ? `${slot.teacher.first_name} ${slot.teacher.last_name}` : null)) && (
                              <div className="text-[10px] opacity-70 truncate">
                                {slot.teacher_name ?? `${slot.teacher.first_name} ${slot.teacher.last_name}`}
                              </div>
                            )}
                            <div className="absolute top-0.5 right-0.5 flex gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                              <button
                                onClick={() => { setEditTarget(slot); setEditOpen(true); }}
                                className="text-muted-foreground hover:text-primary"
                              >
                                <Pencil className="w-3 h-3" />
                              </button>
                              {canDelete && (
                                <button
                                  onClick={() => setDeleteTarget(slot)}
                                  className="text-muted-foreground hover:text-destructive"
                                >
                                  <Trash2 className="w-3 h-3" />
                                </button>
                              )}
                            </div>
                          </div>
                        ) : (
                          canCreate && (
                            <button
                              onClick={() => { setAddSlot({ day: d.value, period: p.period }); setAddOpen(true); }}
                              className="w-full h-10 rounded-md border-dashed border text-muted-foreground hover:border-primary hover:text-primary text-xs flex items-center justify-center transition-colors"
                            >
                              +
                            </button>
                          )
                        )}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Add slot modal */}
      <AppModal open={addOpen} onClose={() => setAddOpen(false)} title="Add Timetable Slot">
        <TimetableSlotForm
          defaultSlot={addSlot}
          classId={classId}
          sectionId={sectionId}
          subjects={classSubjects}
          sections={sections}
          teachers={teachers}
          onSubmit={(body) =>
            timetableService.create(body).then(() => {
              qc.invalidateQueries({ queryKey: ['timetable'] });
              toast.success('Slot added');
              setAddOpen(false);
            }).catch((e) => toast.error(e?.response?.data?.message ?? 'Failed'))
          }
          onCancel={() => setAddOpen(false)}
        />
      </AppModal>

      {/* Edit slot modal */}
      <AppModal open={editOpen} onClose={() => { setEditOpen(false); setEditTarget(null); }} title="Edit Timetable Slot">
        <TimetableSlotForm
          defaultSlot={editTarget ?? {}}
          classId={classId}
          sectionId={editTarget?.section_id ?? sectionId}
          subjects={classSubjects}
          sections={sections}
          teachers={teachers}
          isEdit
          onSubmit={(body) => updateMutation.mutate({ id: editTarget.id, body })}
          onCancel={() => { setEditOpen(false); setEditTarget(null); }}
          isLoading={updateMutation.isPending}
        />
      </AppModal>

      {/* Delete confirm */}
      <ConfirmDialog
        open={!!deleteTarget}
        title="Remove Slot"
        description={`Remove ${deleteTarget?.subject ?? 'this slot'}?`}
        confirmLabel="Remove"
        variant="destructive"
        isLoading={deleteMutation.isPending}
        onConfirm={() => deleteMutation.mutate(deleteTarget.id)}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
}

/* ─── Timetable slot form ─────────────────────────────────────── */
function TimetableSlotForm({
  defaultSlot,
  classId,
  sectionId,
  subjects  = [],
  sections  = [],
  teachers  = [],
  isEdit    = false,
  onSubmit,
  onCancel,
  isLoading = false,
}) {
  const { control, register, handleSubmit, formState: { errors } } = useForm({
    defaultValues: {
      day:        defaultSlot?.day     ?? '',
      period:     defaultSlot?.period  ? String(defaultSlot.period) : '',
      subject:    defaultSlot?.subject ?? '',
      section_id: defaultSlot?.section_id ? String(defaultSlot.section_id) : (sectionId ? String(sectionId) : ''),
      teacher_id: defaultSlot?.teacher_id ? String(defaultSlot.teacher_id) : '',
      room:       defaultSlot?.room    ?? '',
    },
  });

  const dayOptions     = DAYS.map((d) => ({ value: d.value, label: d.label ?? d.value }));
  const periodOptions  = PERIODS.map((p) => ({ value: String(p.period), label: p.label ?? `Period ${p.period}` }));
  const subjectOptions = subjects.map((s) => ({ value: s.name, label: s.name }));
  const sectionOptions = sections.map((s) => ({ value: String(s.id), label: s.name }));
  const teacherOptions = teachers.map((t) => ({
    value: String(t.id),
    label: `${t.first_name} ${t.last_name}`,
  }));

  const onFormSubmit = (data) => {
    const teacher = teachers.find((t) => String(t.id) === String(data.teacher_id));
    onSubmit({
      ...data,
      period:       Number(data.period),
      class_id:     classId,
      teacher_name: teacher ? `${teacher.first_name} ${teacher.last_name}` : undefined,
    });
  };

  return (
    <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-4 py-1">
      <div className="grid grid-cols-2 gap-3">
        <SelectField
          label="Day"
          name="day"
          control={control}
          error={errors.day}
          options={dayOptions}
          placeholder="Select day…"
          required
        />
        <SelectField
          label="Period"
          name="period"
          control={control}
          error={errors.period}
          options={periodOptions}
          placeholder="Select period…"
          required
        />
      </div>

      {sectionOptions.length > 0 ? (
        <SelectField
          label="Section"
          name="section_id"
          control={control}
          error={errors.section_id}
          options={sectionOptions}
          placeholder="Select section…"
        />
      ) : null}

      {subjectOptions.length > 0 ? (
        <SelectField
          label="Subject"
          name="subject"
          control={control}
          error={errors.subject}
          options={subjectOptions}
          placeholder="Select subject…"
          required
        />
      ) : (
        <div className="space-y-1.5">
          <Label>Subject <span className="text-destructive">*</span></Label>
          <Input {...register('subject', { required: 'Required' })} placeholder="e.g. Mathematics" />
          {errors.subject && <p className="text-xs text-destructive">{errors.subject.message}</p>}
        </div>
      )}

      <div className="grid grid-cols-2 gap-3">
        <SelectField
          label="Teacher"
          name="teacher_id"
          control={control}
          error={errors.teacher_id}
          options={teacherOptions}
          placeholder="Select teacher…"
        />
        <div className="space-y-1.5">
          <Label>Room</Label>
          <Input {...register('room')} placeholder="Room no." />
        </div>
      </div>

      <div className="flex justify-end gap-2 pt-2">
        <Button type="button" variant="outline" size="sm" onClick={onCancel} disabled={isLoading}>
          Cancel
        </Button>
        <Button type="submit" size="sm" disabled={isLoading}>
          {isLoading ? 'Saving…' : isEdit ? 'Save Changes' : 'Add Slot'}
        </Button>
      </div>
    </form>
  );
}
