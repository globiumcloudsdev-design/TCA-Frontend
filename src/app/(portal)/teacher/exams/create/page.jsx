'use client';

import { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useTeacherExams, useTeacherClasses } from '@/hooks/useTeacherPortal';
import { EXAM_TYPES, EXAM_CATEGORIES } from '@/constants';
import { Button } from '@/components/ui/button';
import { BookOpen, ArrowLeft, AlertCircle, CheckCircle2, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import InputField from '@/components/common/InputField';
import SelectField from '@/components/common/SelectField';
import { getPortalTerms } from '@/constants/portalInstituteConfig';
import useAuthStore from '@/store/authStore';
import AppModal from '@/components/common/AppModal';

const EMPTY_FORM = {
  name: '',
  class_id: '',
  section_id: '',
  type: 'unit_test',
  category: 'theory',
  exam_date: '',
  subject_schedules: []
};

const asText = (value) => String(value ?? '').trim();

export default function CreateExamPage() {
  const router = useRouter();
  const user = useAuthStore((state) => state.user);
  const t = getPortalTerms(user?.institute_type || 'school');
  
  const { classes, loading: classesLoading, error: classesError } = useTeacherClasses();
  const { createExam, isCreating } = useTeacherExams();

  const [form, setForm] = useState(EMPTY_FORM);
  const [selectedSubjects, setSelectedSubjects] = useState(new Set());
  const [errors, setErrors] = useState({});
  const [showConfirm, setShowConfirm] = useState(false);
  const [subjectsLoading, setSubjectsLoading] = useState(false);

// Normalize classes using subject_details for Exam creation
  const normalizedClasses = useMemo(() =>
    classes.map(cls => {
      // Exams require full subject objects (id, code, name), which backend provides in subject_details.
      // Fallback to subjects array only if subject_details is missing.
      const sourceSubjects = Array.isArray(cls.subject_details) && cls.subject_details.length > 0 
        ? cls.subject_details 
        : (Array.isArray(cls.subjects) ? cls.subjects : []);

      return {
        ...cls,
        class_id: asText(cls.class_id || cls.id),
        class_name: cls.class_name || cls.name,
        sections: Array.isArray(cls.sections) ? cls.sections : [],
        subjects: sourceSubjects.map((s, idx) => {
          if (typeof s === 'string') {
            return { id: s, name: s, code: '' };
          }
          return {
            id: s.id || s.name || `subject-${idx}`,
            name: s.name || s.id || s,
            code: s.code || ''
          };
        })
      };
    }), [classes]
  );
  
  const selectedClass = normalizedClasses.find(c => c.class_id === form.class_id);
  const sectionOptions = selectedClass?.sections || [];
  const subjectOptions = selectedClass?.subjects || [];

  const handleClassChange = (classId) => {
    setSubjectsLoading(true);

    // Quick state update + loading state
    setForm(prev => ({
      ...prev,
      class_id: classId,
      section_id: '',
      subject_schedules: []
    }));
    setSelectedSubjects(new Set());
    setErrors({});

    // Simulate brief loading for visual feedback
    setTimeout(() => setSubjectsLoading(false), 200);
  };

  const handleSubjectToggle = (subjectId) => {
    const newSelected = new Set(selectedSubjects);
    if (newSelected.has(subjectId)) {
      newSelected.delete(subjectId);
    } else {
      newSelected.add(subjectId);
    }
    setSelectedSubjects(newSelected);
    
    // Sync subject schedules
    setForm(prev => {
      const existingSchedule = prev.subject_schedules || [];
      if (newSelected.has(subjectId)) {
        // Add new subject schedule if selected
        if (!existingSchedule.find(s => s.subject_id === subjectId)) {
          const sub = subjectOptions.find(s => s.id === subjectId);
          return {
            ...prev,
            subject_schedules: [
              ...existingSchedule,
              {
                subject_id: subjectId,
                subject_name: sub?.name || '',
                subject_code: sub?.code || '',
                date: form.exam_date || '',
                start_time: '09:00',
                end_time: '12:00',
                duration_minutes: 180,
                total_marks: 100,
                pass_marks: 40,
                venue: '',
                room_no: '',
                instructions: ''
              }
            ]
          };
        }
      } else {
        // Remove if deselected
        return {
          ...prev,
          subject_schedules: existingSchedule.filter(s => s.subject_id !== subjectId)
        };
      }
      return prev;
    });
  };

  const handleScheduleChange = (subjectId, field, value) => {
    setForm(prev => ({
      ...prev,
      subject_schedules: prev.subject_schedules.map(schedule => {
        if (schedule.subject_id === subjectId) {
          const updated = { ...schedule, [field]: value };
          // Auto-calculate pass marks (40% default)
          if (field === 'total_marks') {
            updated.pass_marks = Math.round((Number(value) * 40) / 100);
          }
          return updated;
        }
        return schedule;
      })
    }));
  };

  const validateForm = () => {
    const newErrors = {};
    if (!form.name) newErrors.name = 'Please provide an exam name';
    if (!form.class_id) newErrors.class_id = 'Please select a class';
    if (selectedSubjects.size === 0) newErrors.subjects = 'Please select at least one subject';
    if (!form.exam_date) newErrors.exam_date = 'Please select exam date';
    if (!form.type) newErrors.type = 'Please select exam type';
    if (!form.category) newErrors.category = 'Please select exam category';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    // Build subject schedules from state because they are editable now
    const subjectSchedules = form.subject_schedules.map(s => ({
      ...s,
      date: s.date || form.exam_date,
      start_time: s.start_time || '09:00',
      end_time: s.end_time || '12:00',
      duration_minutes: Number(s.duration_minutes) || 180,
      total_marks: Number(s.total_marks) || 100,
      pass_marks: Number(s.pass_marks) || 40,
    }));

    const examData = {
      name: form.name || `${form.type.replace('_', ' ').toUpperCase()} - ${selectedClass?.class_name}`,
      type: form.type,
      category: form.category,
      class_id: form.class_id,
      section_id: form.section_id || null,
      exam_date: form.exam_date,
      academic_year_id: user?.academic_year_id || '',
      entity_type: user?.institute?.institute_type || 'school',
      school_id: user?.institute?.id || user?.school_id,
      subject_schedules: subjectSchedules,
      status: 'draft'
    };

    try {
      await createExam(examData);
      toast.success('Exam created successfully!');
      setTimeout(() => router.push('/teacher/exams'), 1500);
    } catch (error) {
      toast.error(error?.message || 'Failed to create exam');
      console.error('Error:', error);
    }
  };

  if (classesLoading) {
    return (
      <div className="max-w-2xl mx-auto p-6">
        <div className="text-center py-12">
          <p className="text-gray-600">Loading form...</p>
        </div>
      </div>
    );
  }

  if (classesError || normalizedClasses.length === 0) {
    return (
      <div className="max-w-2xl mx-auto p-6">
        <div className="p-6 bg-amber-50 border border-amber-200 rounded-2xl text-center">
          <AlertCircle className="w-8 h-8 text-amber-600 mx-auto mb-2" />
          <p className="text-amber-800 font-semibold">No assigned classes found</p>
          <p className="text-amber-700 text-sm mt-1">You need to be assigned to classes before creating exams</p>
          <Button onClick={() => router.back()} variant="outline" className="mt-4">
            <ArrowLeft className="w-4 h-4 mr-2" /> Go Back
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-extrabold flex items-center gap-2 text-slate-900">
            <BookOpen className="w-7 h-7 text-blue-600" /> Create Exam
          </h1>
          <p className="text-sm text-slate-500 mt-1">Set up a new exam for your assigned {t.classLabel.toLowerCase()}</p>
        </div>
        <Button onClick={() => router.back()} variant="outline" size="sm" className="gap-2">
          <ArrowLeft className="w-4 h-4" /> Back
        </Button>
      </div>

      {/* Form Card */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-6">
        <form onSubmit={(e) => { e.preventDefault(); setShowConfirm(true); }} className="space-y-6">

          {/* Exam Name */}
          <div>
            <InputField
              label="Exam Name*"
              placeholder="e.g. Mid-Term Assessment 2026"
              required
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              error={errors.name}
            />
          </div>

          {/* Row 1: Class & Exam Type */}
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <SelectField
                label={t.classLabel}
                required
                value={form.class_id}
                onChange={(v) => handleClassChange(v)}
                options={normalizedClasses.map(c => ({ value: c.class_id, label: c.class_name }))}
                error={errors.class_id}
              />
            </div>
            <div>
              <SelectField
                label="Exam Type*"
                required
                value={form.type}
                onChange={(v) => setForm(p => ({ ...p, type: v }))}
                options={EXAM_TYPES}
                error={errors.type}
              />
            </div>
          </div>

          {/* Row 2: Category & Section */}
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <SelectField
                label="Exam Category*"
                required
                value={form.category}
                onChange={(v) => setForm(p => ({ ...p, category: v }))}
                options={EXAM_CATEGORIES}
                error={errors.category}
              />
            </div>
            {sectionOptions.length > 0 && (
              <div>
                <SelectField
                  label="Section (Optional)"
                  value={form.section_id}
                  onChange={(v) => setForm(p => ({ ...p, section_id: v }))}
                  options={[{ value: 'all', label: 'All Sections' }, ...sectionOptions.map(s => ({ value: s.id, label: s.name || `Section ${s.id}` }))]}
                />
              </div>
            )}
          </div>

          {/* Exam Date */}
          <div>
            <InputField
              label="Exam Date*"
              type="date"
              required
              value={form.exam_date}
              onChange={(e) => setForm(p => ({ ...p, exam_date: e.target.value }))}
              error={errors.exam_date}
            />
          </div>

          {/* Subjects Selection */}
          <div className="space-y-3">
            {/* Header with Info */}
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <label className="text-sm font-semibold text-slate-800">
                  Subjects <span className="text-red-500">*</span>
                </label>
                
                {/* Info Badge showing selected class and section */}
                {form.class_id && (
                  <div className="mt-2 text-xs text-slate-600 bg-blue-50 border border-blue-200 rounded-lg px-3 py-2">
                    📚 <span className="font-medium">Showing subjects for:</span> {selectedClass?.class_name}
                    {form.section_id && (
                      <> • Section <span className="font-semibold">{sectionOptions.find(s => s.id === form.section_id)?.name}</span></>
                    )}
                  </div>
                )}
              </div>
              
              {/* Selection Counter */}
              {form.class_id && (
                <span className="text-xs font-semibold text-blue-600 bg-blue-100 px-3 py-1 rounded-full whitespace-nowrap ml-2">
                  {selectedSubjects.size}/{subjectOptions.length} selected
                </span>
              )}
            </div>
            
            {/* Subjects List */}
            {!form.class_id ? (
              <div className="p-6 bg-slate-50 border border-dashed border-slate-300 rounded-xl text-center">
                <BookOpen className="w-10 h-10 text-slate-400 mx-auto mb-2" />
                <p className="text-sm font-medium text-slate-700">Select a {t.classLabel.toLowerCase()} first</p>
                <p className="text-xs text-slate-500 mt-1">Subjects will appear here once you select a class</p>
              </div>
            ) : subjectsLoading ? (
              <div className="p-6 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-center gap-3">
                <Loader2 className="w-5 h-5 text-blue-600 animate-spin" />
                <p className="text-sm text-slate-600 font-medium">Loading subjects...</p>
              </div>
            ) : subjectOptions.length === 0 ? (
              <div className="p-6 bg-amber-50 border border-amber-200 rounded-xl text-center">
                <AlertCircle className="w-8 h-8 text-amber-600 mx-auto mb-2" />
                <p className="text-sm font-medium text-amber-800">No subjects assigned</p>
                <p className="text-xs text-amber-700 mt-1">You don't have any subjects assigned for this {t.classLabel.toLowerCase()}</p>
              </div>
            ) : (
              <div className="grid sm:grid-cols-2 gap-3 max-h-96 overflow-y-auto p-3 border border-slate-200 rounded-xl bg-slate-50">
                {subjectOptions.map((subject) => (
                  <label
                    key={subject.id}
                    className={`flex items-start gap-3 p-3 bg-white border rounded-lg cursor-pointer transition-all ${
                      selectedSubjects.has(subject.id)
                        ? 'border-blue-400 bg-blue-50 shadow-sm'
                        : 'border-slate-200 hover:border-blue-300 hover:bg-blue-50'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={selectedSubjects.has(subject.id)}
                      onChange={() => handleSubjectToggle(subject.id)}
                      className="w-4 h-4 mt-0.5 rounded border-slate-300 cursor-pointer accent-blue-600"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-slate-800">{subject.name}</p>
                      {subject.code && <p className="text-xs text-slate-500 mt-0.5">Code: <span className="font-mono">{subject.code}</span></p>}
                    </div>
                    {selectedSubjects.has(subject.id) && (
                      <CheckCircle2 className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
                    )}
                  </label>
                ))}
              </div>
            )}
            
            {/* Subject Schedule Details Form */}
            {selectedSubjects.size > 0 && form.subject_schedules.length > 0 && (
              <div className="mt-6 space-y-4 border-t pt-4">
                <h3 className="text-sm font-bold text-slate-800">Configure Subject Details</h3>
                {form.subject_schedules.map((schedule, idx) => (
                  <div key={schedule.subject_id} className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-4">
                    <div className="flex items-center justify-between pb-2 border-b border-slate-200">
                      <p className="font-semibold text-slate-800 text-sm">{schedule.subject_name}</p>
                      {schedule.subject_code && <span className="text-xs font-mono text-slate-500 bg-white px-2 py-1 rounded border">{schedule.subject_code}</span>}
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                      <InputField
                        label="Date *"
                        type="date"
                        value={schedule.date}
                        onChange={(e) => handleScheduleChange(schedule.subject_id, 'date', e.target.value)}
                        required
                      />
                      <InputField
                        label="Start Time *"
                        type="time"
                        value={schedule.start_time}
                        onChange={(e) => handleScheduleChange(schedule.subject_id, 'start_time', e.target.value)}
                        required
                      />
                      <InputField
                        label="End Time *"
                        type="time"
                        value={schedule.end_time}
                        onChange={(e) => handleScheduleChange(schedule.subject_id, 'end_time', e.target.value)}
                        required
                      />
                      <InputField
                        label="Duration (mins)"
                        type="number"
                        min="1"
                        value={schedule.duration_minutes}
                        onChange={(e) => handleScheduleChange(schedule.subject_id, 'duration_minutes', e.target.value)}
                      />
                      <InputField
                        label="Total Marks *"
                        type="number"
                        min="1"
                        value={schedule.total_marks}
                        onChange={(e) => handleScheduleChange(schedule.subject_id, 'total_marks', e.target.value)}
                        required
                      />
                      <InputField
                        label="Passing Marks *"
                        type="number"
                        min="1"
                        value={schedule.pass_marks}
                        onChange={(e) => handleScheduleChange(schedule.subject_id, 'pass_marks', e.target.value)}
                        required
                      />
                      <InputField
                        label="Venue / Room"
                        placeholder="e.g. Hall A"
                        value={schedule.venue}
                        onChange={(e) => handleScheduleChange(schedule.subject_id, 'venue', e.target.value)}
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
            
            {errors.subjects && <p className="text-xs text-red-500 font-medium">⚠️ {errors.subjects}</p>}
          </div>

          {/* Form Actions */}
          <div className="flex gap-3 pt-4 border-t border-slate-200">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.back()}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="flex-1 bg-blue-600 hover:bg-blue-700"
              disabled={isCreating}
            >
              {isCreating ? (
                <>
                  <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                  Creating...
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4 mr-2" />
                  Create Exam
                </>
              )}
            </Button>
          </div>
        </form>
      </div>

      {/* Confirmation Modal */}
      <AppModal open={showConfirm} onClose={() => setShowConfirm(false)} title="Create Exam?" size="sm">
        <div className="space-y-4 pt-2">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 space-y-2">
            <p className="text-sm"><span className="font-semibold text-slate-800">Exam Name:</span> {form.name}</p>
            <p className="text-sm"><span className="font-semibold text-slate-800">Class:</span> {selectedClass?.class_name}</p>
            {form.section_id && <p className="text-sm"><span className="font-semibold text-slate-800">Section:</span> {sectionOptions.find(s => s.id === form.section_id)?.name}</p>}
            <p className="text-sm"><span className="font-semibold text-slate-800">Type:</span> {EXAM_TYPES.find(t => t.value === form.type)?.label}</p>
            <p className="text-sm"><span className="font-semibold text-slate-800">Category:</span> {EXAM_CATEGORIES.find(c => c.value === form.category)?.label}</p>
            <p className="text-sm"><span className="font-semibold text-slate-800">Subjects:</span> {selectedSubjects.size}</p>
            <p className="text-sm"><span className="font-semibold text-slate-800">Date:</span> {form.exam_date}</p>
          </div>
          <div className="flex gap-3">
            <Button variant="outline" onClick={() => setShowConfirm(false)} className="flex-1">Cancel</Button>
            <Button onClick={handleSubmit} className="flex-1 bg-blue-600 hover:bg-blue-700">Confirm & Create</Button>
          </div>
        </div>
      </AppModal>
    </div>
  );
}
