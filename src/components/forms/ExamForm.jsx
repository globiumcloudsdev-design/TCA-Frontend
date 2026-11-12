
'use client';

/**
 * ExamForm — Wizard-based step-by-step exam creation
 * Tab 1: Basic Info → Tab 2: Subjects → Tab 3: Settings/Submit
 */

import { useEffect, useState, useRef } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import { Plus, Trash2, ChevronLeft, ChevronRight, Loader2 } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';

import SelectField from '@/components/common/SelectField';
import InputField from '@/components/common/InputField';
import DatePickerField from '@/components/common/DatePickerField';
import TimePickerField from '@/components/common/TimePickerField';
import SwitchField from '@/components/common/SwitchField';
import BranchSelectField from '@/components/common/BranchSelectField';

import { examService } from '@/services/examService';
import { classService } from '@/services/classService';
import { academicYearService } from '@/services/academicYearService';
import { useAuthStore } from '@/store/authStore';
import useBranchAccess from '@/hooks/useBranchAccess';
import { EXAM_TYPES, EXAM_CATEGORIES } from '@/constants';
import { getActiveAcademicYearId } from '@/lib/utils';

// ─────────────────────────────────────────────────────────
// VALIDATION SCHEMAS
// ─────────────────────────────────────────────────────────

const subjectScheduleSchema = z.object({
  subject_id: z.string().min(1, 'Subject required'),
  subject_name: z.string().min(1, 'Subject name required'),
  subject_code: z.string().nullish().default(''),
  date: z.string().min(1, 'Date required'),
  start_time: z.string().min(1, 'Start time required'),
  end_time: z.string().min(1, 'End time required'),
  duration_minutes: z.coerce.number().min(1, 'Duration required'),
  total_marks: z.coerce.number().min(1, 'Total marks required'),
  pass_marks: z.coerce.number().min(0, 'Pass marks required'),
  venue: z.string().nullish().default(''),
  room_no: z.string().nullish().default(''),
  invigilator_ids: z.array(z.string()).nullish().default([]),
  instructions: z.string().nullish().default('')
});

// STEP 1 SCHEMA: Basic Info
const step1Schema = z.object({
  name: z.string().min(3, 'Exam name required (min 3 chars)'),
  code: z.string().nullish(),
  description: z.string().nullish(),
  branch_id: z.string().nullish(),
  type: z.string().min(1, 'Exam type required'),
  category: z.string().min(1, 'Category required'),
  entity_type: z.string().nullish().default('school'),
  academic_year_id: z.string().min(1, 'Academic year required'),
  class_id: z.string().min(1, 'Class required'),
  section_id: z.string().nullish(),
});

// STEP 2 SCHEMA: Subjects
const step2Schema = z.object({
  subject_schedules: z.array(subjectScheduleSchema).min(1, 'At least one subject required'),
});

// STEP 3 SCHEMA: Settings
const step3Schema = z.object({
  pass_percentage: z.coerce.number().min(0).max(100).optional().default(40),
});

// FULL SCHEMA
const fullSchema = step1Schema.merge(step2Schema).merge(step3Schema);

export default function ExamForm({
  initialData = null,
  onSuccess,
  onCancel,
  isEdit = false
}) {
  const { user } = useAuthStore();
  const { activeBranchId } = useBranchAccess();
  const instituteId = user?.institute?.id || user?.school_id;
  const rawInstituteType = user?.institute?.institute_type || user?.institute?.instituteType;
  const instituteType = typeof rawInstituteType === 'object' 
    ? (rawInstituteType?.name?.toLowerCase() || 'school') 
    : (rawInstituteType?.toLowerCase() || 'school');

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoadingSubjects, setIsLoadingSubjects] = useState(false);
  const [classes, setClasses] = useState([]);
  const [sections, setSections] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [academicYears, setAcademicYears] = useState([]);
  const [step, setStep] = useState(1);
  const [stepErrors, setStepErrors] = useState({});
  
  // Add ref to track if subjects have been auto-populated
  const hasAutoPopulated = useRef(!!initialData);
  const previousClassId = useRef(initialData?.class_id || null);

  const {
    control,
    register,
    handleSubmit,
    watch,
    setValue,
    trigger,
    formState: { errors },
    reset,
  } = useForm({
    resolver: zodResolver(fullSchema),
    mode: 'onBlur',
    defaultValues: initialData ? {
      ...initialData,
      code: initialData.code || '',
      description: initialData.description || '',
      has_section: !!initialData.section_id,
      section_id: initialData.section_id || '',
      pass_percentage: initialData.pass_percentage ? Number(initialData.pass_percentage) : 40,
      subject_schedules: (initialData.subject_schedules || []).map(s => ({
        ...s,
        date: s.date ? (typeof s.date === 'string' ? s.date.split('T')[0] : s.date) : '',
        total_marks: Number(s.total_marks) || 100,
        pass_marks: Number(s.pass_marks) || 40,
        duration_minutes: Number(s.duration_minutes) || 180,
        venue: s.venue || '',
        room_no: s.room_no || '',
        instructions: s.instructions || ''
      }))
    } : {
      type: 'mid_term',
      category: 'theory',
      entity_type: instituteType || 'school',
      pass_percentage: 40,
      subject_schedules: [],
      section_id: '',
      has_section: false
    }
  });

  // Sync form when initialData changes (e.g. when opening modal for edit)
  useEffect(() => {
    if (initialData) {
      previousClassId.current = initialData.class_id;
      hasAutoPopulated.current = true;
      const formattedSchedules = (initialData.subject_schedules || []).map(s => ({
        ...s,
        date: s.date ? (typeof s.date === 'string' ? s.date.split('T')[0] : s.date) : '',
        total_marks: Number(s.total_marks) || 100,
        pass_marks: Number(s.pass_marks) || 40,
        duration_minutes: Number(s.duration_minutes) || 180,
        venue: s.venue || '',
        room_no: s.room_no || '',
        instructions: s.instructions || ''
      }));

      reset({
        ...initialData,
        code: initialData.code || '',
        description: initialData.description || '',
        branch_id: initialData.branch_id || activeBranchId || '',
        has_section: !!initialData.section_id,
        section_id: initialData.section_id || '',
        pass_percentage: initialData.pass_percentage ? Number(initialData.pass_percentage) : 40,
        subject_schedules: formattedSchedules,
      });
    }
  }, [initialData, reset, activeBranchId]);

  const {
    fields: scheduleFields,
    append: appendSchedule,
    remove: removeSchedule,
    replace: replaceSchedules
  } = useFieldArray({
    control,
    name: 'subject_schedules'
  });

  const watchedClassId = watch('class_id');
  const watchedSchedules = watch('subject_schedules');
  const passPercentage = watch('pass_percentage');
  const hasSection = watch('has_section');

  useEffect(() => {
    if (!hasSection) {
      setValue('section_id', '');
    }
  }, [hasSection, setValue]);

  // Fetch academic years and classes on mount
  useEffect(() => {
    if (!instituteId) return;

    const fetchData = async () => {
      try {
        const [yearsRes, classesRes] = await Promise.all([
          academicYearService.getAll({ institute_id: instituteId, branch_id: activeBranchId, is_active: true }),
          classService.getAll({ institute_id: instituteId, branch_id: activeBranchId, is_active: true, limit: 500, fetchAll: true })
        ]);

        const rawYears = yearsRes?.data?.rows || yearsRes?.rows || (Array.isArray(yearsRes?.data) ? yearsRes.data : []) || (Array.isArray(yearsRes) ? yearsRes : []);
        const rawClasses = classesRes?.data?.rows || classesRes?.rows || (Array.isArray(classesRes?.data) ? classesRes.data : []) || (Array.isArray(classesRes) ? classesRes : []);

        setAcademicYears(Array.isArray(rawYears) ? rawYears : []);
        setClasses(Array.isArray(rawClasses) ? rawClasses : []);
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    fetchData();
  }, [instituteId]);

  // If editing and initialData has class_id not yet in classes list, fetch it directly
  useEffect(() => {
    if (initialData?.class_id && classes.length > 0) {
      const exists = classes.some(c => c.id === initialData.class_id);
      if (!exists) {
        classService.getById(initialData.class_id).then(res => {
          const cls = res?.data || res;
          if (cls && (cls.id || cls.name)) {
            setClasses(prev => [...prev, cls]);
            if (cls.sections && cls.sections.length > 0) {
              setSections(cls.sections);
            }
          }
        }).catch(err => console.warn('Could not load initial class:', err));
      }
    }
  }, [initialData?.class_id, classes]);

  // Auto-select active academic year if not yet selected
  const watchedAcademicYearId = watch('academic_year_id');
  useEffect(() => {
    if (academicYears.length > 0 && !watchedAcademicYearId) {
      const activeYearId = getActiveAcademicYearId(academicYears);
      if (activeYearId) {
        setValue('academic_year_id', activeYearId, { shouldValidate: true });
      }
    }
  }, [academicYears, watchedAcademicYearId, setValue]);

  // Set entity_type from user's institute
  useEffect(() => {
    if (instituteType && !initialData) {
      setValue('entity_type', instituteType);
    }
  }, [instituteType, setValue, initialData]);

  // Fetch subjects when class changes
  useEffect(() => {
    if (!watchedClassId) {
      setSections([]);
      setSubjects([]);
      setValue('section_id', '');
      return;
    }

    // Only reset section if the user genuinely changed the class
    if (previousClassId.current && previousClassId.current !== watchedClassId) {
      hasAutoPopulated.current = false;
      setValue('section_id', '');
      setValue('has_section', false);
    }
    previousClassId.current = watchedClassId;

    const fetchClassData = async () => {
      setIsLoadingSubjects(true);
      try {
        const response = await classService.getById(watchedClassId);
        const classData = response?.data;

        setSections(classData?.sections || []);

        const extractedSubjects = (classData?.courses || []).map(course => ({
          id: course.id,
          name: course.name,
          code: course.code || course.course_code || ''
        }));

        setSubjects(extractedSubjects);

        // Auto-populate subjects only for new exams and only once
        if (!initialData && extractedSubjects.length > 0 && !hasAutoPopulated.current) {
          hasAutoPopulated.current = true;
          
          const newSchedules = extractedSubjects.map(subject => ({
            subject_id: subject.id,
            subject_name: subject.name,
            subject_code: subject.code,
            date: '',
            start_time: '09:00',
            end_time: '12:00',
            duration_minutes: 180,
            total_marks: 100,
            pass_marks: 40,
            venue: '',
            room_no: '',
            instructions: '',
            invigilator_ids: []
          }));
          
          replaceSchedules(newSchedules);
        }
      } catch (error) {
        console.error('Error fetching class data:', error);
        toast.error('Failed to fetch class subjects');
      } finally {
        setIsLoadingSubjects(false);
      }
    };

    fetchClassData();
  }, [watchedClassId, initialData, replaceSchedules, setValue]);

  const calculateDuration = (startTime, endTime) => {
    if (!startTime || !endTime) return 0;
    const [startH, startM] = startTime.split(':').map(Number);
    const [endH, endM] = endTime.split(':').map(Number);
    return (endH - startH) * 60 + (endM - startM);
  };

  const formatDuration = (totalMinutes) => {
    const mins = Number(totalMinutes) || 0;
    if (mins <= 0) return '0 min';
    const hours = Math.floor(mins / 60);
    const remainingMins = mins % 60;
    if (hours === 0) {
      return `${remainingMins} minute${remainingMins !== 1 ? 's' : ''}`;
    }
    if (remainingMins === 0) {
      return `${hours} hour${hours !== 1 ? 's' : ''}`;
    }
    return `${hours} hour${hours !== 1 ? 's' : ''} ${remainingMins} minute${remainingMins !== 1 ? 's' : ''}`;
  };

  // Validate current step
  const validateStep = async (stepNum) => {
    let fieldsToValidate = [];
    if (stepNum === 1) {
      fieldsToValidate = ['name', 'type', 'category', 'academic_year_id', 'class_id'];
    } else if (stepNum === 2) {
      fieldsToValidate = ['subject_schedules'];
    } else if (stepNum === 3) {
      return true;
    }

    const isValid = await trigger(fieldsToValidate);
    return isValid;
  };

  const handleNext = async () => {
    const isValid = await validateStep(step);
    if (isValid) {
      setStep(step + 1);
      setStepErrors({});
    } else {
      toast.error(`Please fill all required fields in this step`);
    }
  };

  const handlePrevious = () => {
    setStep(step - 1);
  };

  const totalMarks = watchedSchedules?.reduce((sum, s) => sum + (parseInt(s.total_marks) || 0), 0) || 0;
  const totalPassMarks = watchedSchedules?.reduce((sum, s) => sum + (parseInt(s.pass_marks) || 0), 0) || 0;
  const computedPassPercentage = totalMarks > 0 ? Math.round((totalPassMarks / totalMarks) * 100) : 40;

  const onInvalid = (validationErrors) => {
    console.error('Validation errors on submit:', validationErrors);
    const firstKey = Object.keys(validationErrors)[0];
    const firstMsg = validationErrors[firstKey]?.message;
    toast.error(typeof firstMsg === 'string' ? firstMsg : 'Please check the form for errors');
  };

  const onSubmit = async (data) => {
    setIsSubmitting(true);
    try {
      const totalMarksSum = (data.subject_schedules || []).reduce((sum, s) => sum + (parseInt(s.total_marks) || 0), 0);
      const totalPassMarksSum = (data.subject_schedules || []).reduce((sum, s) => sum + (parseInt(s.pass_marks) || 0), 0);
      const computedPct = totalMarksSum > 0 ? Math.round((totalPassMarksSum / totalMarksSum) * 100) : 40;

      // Clean payload: convert empty strings to null for optional UUID fields
      const payload = {
        ...data,
        pass_percentage: computedPct || data.pass_percentage || 40,
        section_id: hasSection && data.section_id?.trim() ? data.section_id : null,
        school_id: instituteId,
        status: isEdit ? initialData.status : 'draft'
      };

      let response;
      if (isEdit && initialData?.id) {
        response = await examService.update(initialData.id, payload);
        toast.success('Exam updated successfully');
      } else {
        response = await examService.create(payload);
        toast.success('Exam created successfully');
      }

      if (response) {
        onSuccess?.(response.data || response);
        reset();
      }
    } catch (error) {
      console.error('Error saving exam:', error);
      const serverMessage = error?.response?.data?.message || error?.message;
      toast.error(serverMessage || 'Failed to save exam');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Options
  const academicYearOptions = academicYears.map(year => ({
    value: year.id,
    label: year.name
  }));

  const classOptions = classes.map(cls => ({
    value: cls.id,
    label: cls.name
  }));

  const sectionOptions = [
    { value: '', label: 'All Sections' },
    ...sections.map(section => ({ value: section.id, label: section.name }))
  ];

  const progressValue = (step / 3) * 100;

  return (
    <form onSubmit={handleSubmit(onSubmit, onInvalid)} className="space-y-6 w-full">
      {/* PROGRESS BAR */}
      <div className="space-y-2">
        <div className="flex justify-between items-center">
          <h2 className="text-lg font-semibold">{isEdit ? 'Edit Exam' : 'Create Exam'}</h2>
          <span className="text-sm text-muted-foreground">Step {step} of 3</span>
        </div>
        <Progress value={progressValue} className="h-2" />
      </div>

      {/* STEP 1: BASIC INFO */}
      {step === 1 && (
        <Card>
          <CardHeader>
            <CardTitle>Basic Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <BranchSelectField
              control={control}
              error={errors.branch_id}
              setValue={setValue}
              watch={watch}
              required
            />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <InputField
                label="Exam Name"
                placeholder="e.g., Mid Term Exam 2026"
                {...register('name')}
                error={errors.name?.message}
                required
              />

              <InputField
                label="Exam Code"
                placeholder="e.g., MID2026"
                {...register('code')}
                error={errors.code?.message}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <SelectField
                label="Exam Type"
                name="type"
                control={control}
                error={errors.type}
                options={EXAM_TYPES}
                required
              />

              <SelectField
                label="Exam Category"
                name="category"
                control={control}
                error={errors.category}
                options={EXAM_CATEGORIES}
                required
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <SelectField
                label="Academic Year"
                name="academic_year_id"
                control={control}
                error={errors.academic_year_id}
                options={academicYearOptions}
                required
              />

              {/* <div className="space-y-2">
                <Label className="text-sm font-medium">Entity Type</Label>
                <div className="px-3 py-2 bg-muted rounded-md border border-input">
                  <p className="text-sm capitalize font-medium">
                    {instituteType || 'School'}
                  </p>
                </div>
                <input type="hidden" {...register('entity_type')} value={instituteType} />
              </div> */}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-center">
              <SelectField
                label="Class/Standard"
                name="class_id"
                control={control}
                error={errors.class_id}
                options={classOptions}
                required
              />

              <div className="flex flex-col gap-2 pt-2">
                <SwitchField
                  label="Target Specific Section?"
                  description="Enable to apply this exam to a single section only. If turned off, this exam will be created for all sections."
                  name="has_section"
                  control={control}
                />
              </div>
            </div>

            {hasSection ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-start-2">
                  <SelectField
                    label="Section"
                    name="section_id"
                    control={control}
                    options={sections.map(section => ({ value: section.id, label: section.name }))}
                    placeholder="Select Section"
                  />
                </div>
              </div>
            ) : (
              watchedClassId && (
                <div className="rounded-md border border-blue-200 bg-blue-50/70 p-3 text-xs text-blue-800 dark:border-blue-900 dark:bg-blue-950/40 dark:text-blue-300 flex items-center gap-2">
                  <span className="font-semibold">All Sections Selected:</span>
                  This exam will be created for all sections ({sections.length > 0 ? sections.map(s => s.name).join(', ') : 'all existing sections'}) of the selected class.
                </div>
              )
            )}

            <div className="space-y-2">
              <Label>Exam Description</Label>
              <Textarea
                placeholder="Additional details about the exam..."
                rows={3}
                {...register('description')}
              />
            </div>
          </CardContent>
        </Card>
      )}

      {/* STEP 2: SUBJECTS */}
      {step === 2 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex justify-between items-center">
              <span>Subject Schedules & Marks</span>
              <Badge variant="secondary">{scheduleFields.length} subjects</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {isLoadingSubjects ? (
              <div className="flex flex-col items-center justify-center py-12 space-y-3">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <p className="text-sm font-medium text-muted-foreground">Loading subjects and schedules...</p>
              </div>
            ) : scheduleFields.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <p>No subjects available. Please go back and select a class.</p>
              </div>
            ) : (
              <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2">
                {scheduleFields.map((field, idx) => (
                  <Card key={field.id} className="border">
                    <CardHeader className="pb-3">
                      <div className="flex justify-between items-start gap-4">
                        <div className="flex-1">
                          <CardTitle className="text-sm">
                            {watch(`subject_schedules.${idx}.subject_name`)}
                          </CardTitle>
                          {watch(`subject_schedules.${idx}.subject_code`) && (
                            <p className="text-xs text-muted-foreground mt-1">
                              Code: {watch(`subject_schedules.${idx}.subject_code`)}
                            </p>
                          )}
                        </div>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="text-destructive flex-shrink-0"
                          onClick={() => removeSchedule(idx)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </CardHeader>

                    <CardContent className="space-y-4">
                      {/* Date & Time */}
                      <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                        <DatePickerField
                          label="Date"
                          name={`subject_schedules.${idx}.date`}
                          control={control}
                          error={errors.subject_schedules?.[idx]?.date}
                          required
                        />

                        <div className="space-y-1">
                          <Label className="text-xs font-medium">
                            Start Time <span className="ml-0.5 text-destructive font-semibold">*</span>
                          </Label>
                          <TimePickerField
                            value={watch(`subject_schedules.${idx}.start_time`)}
                            onChange={(val) => setValue(`subject_schedules.${idx}.start_time`, val)}
                          />
                        </div>

                        <div className="space-y-1">
                          <Label className="text-xs font-medium">
                            End Time <span className="ml-0.5 text-destructive font-semibold">*</span>
                          </Label>
                          <TimePickerField
                            value={watch(`subject_schedules.${idx}.end_time`)}
                            onChange={(val) => {
                              setValue(`subject_schedules.${idx}.end_time`, val);
                              const start = watch(`subject_schedules.${idx}.start_time`);
                              const duration = calculateDuration(start, val);
                              setValue(`subject_schedules.${idx}.duration_minutes`, duration);
                            }}
                          />
                        </div>

                        <div className="space-y-1">
                          <Label className="text-xs font-medium">Duration</Label>
                          <div className="px-3 py-2 bg-muted rounded-md border border-input text-sm font-medium">
                            {formatDuration(watch(`subject_schedules.${idx}.duration_minutes`))}
                          </div>
                        </div>
                      </div>

                      {/* Marks */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <InputField
                          label="Total Marks"
                          type="number"
                          {...register(`subject_schedules.${idx}.total_marks`)}
                          error={errors.subject_schedules?.[idx]?.total_marks?.message}
                          required
                          min="1"
                        />

                        <InputField
                          label="Pass Marks"
                          type="number"
                          {...register(`subject_schedules.${idx}.pass_marks`)}
                          error={errors.subject_schedules?.[idx]?.pass_marks?.message}
                          required
                          min="0"
                        />
                      </div>

                      {/* Venue & Room */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <InputField
                          label="Venue"
                          placeholder="e.g., Main Hall"
                          {...register(`subject_schedules.${idx}.venue`)}
                        />

                        <InputField
                          label="Room No"
                          placeholder="e.g., A-101"
                          {...register(`subject_schedules.${idx}.room_no`)}
                        />
                      </div>

                      {/* Instructions */}
                      <div className="space-y-1.5">
                        <Label className="text-xs font-medium">Instructions</Label>
                        <Textarea
                          placeholder="Special instructions for this subject..."
                          rows={2}
                          {...register(`subject_schedules.${idx}.instructions`)}
                        />
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* STEP 3: SETTINGS / REVIEW */}
      {step === 3 && (
        <div className="space-y-4">
          <Card className="border bg-muted/20">
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Exam Configuration Overview</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div>
                  <span className="text-xs text-muted-foreground block">Exam Name</span>
                  <span className="font-semibold">{watch('name') || '—'}</span>
                  {watch('code') && <span className="text-xs text-muted-foreground block">({watch('code')})</span>}
                </div>
                <div>
                  <span className="text-xs text-muted-foreground block">Class</span>
                  <span className="font-semibold text-primary">
                    {classes.find(c => c.id === watchedClassId)?.name || '—'}
                  </span>
                </div>
                <div>
                  <span className="text-xs text-muted-foreground block">Target Section</span>
                  <span>
                    {hasSection && watch('section_id') ? (
                      <Badge variant="outline" className="font-medium">
                        {sections.find(s => s.id === watch('section_id'))?.name ? `Section ${sections.find(s => s.id === watch('section_id'))?.name}` : 'Specific Section'}
                      </Badge>
                    ) : (
                      <Badge variant="secondary" className="font-medium text-blue-700 dark:text-blue-300">
                        All Sections
                      </Badge>
                    )}
                  </span>
                </div>
                <div>
                  <span className="text-xs text-muted-foreground block">Type & Category</span>
                  <span className="capitalize font-medium">
                    {watch('type')?.replace('_', ' ')} • {watch('category')}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Exam Passing Criteria</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-1">
                  <Label className="text-muted-foreground text-xs">Total Marks</Label>
                  <div className="text-2xl font-bold text-primary pt-1">
                    {totalMarks}
                  </div>
                </div>

                <div className="space-y-1">
                  <Label className="text-muted-foreground text-xs">Total Pass Marks</Label>
                  <div className="text-2xl font-bold text-foreground pt-1">
                    {totalPassMarks}
                  </div>
                </div>

                <div className="space-y-1">
                  <Label className="text-muted-foreground text-xs">Overall Pass Percentage (Auto)</Label>
                  <div className="text-2xl font-bold text-emerald-600 pt-1">
                    {computedPassPercentage}%
                  </div>
                  <p className="text-[11px] text-muted-foreground">Auto-calculated from subject pass marks</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Subject Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 max-h-[300px] overflow-y-auto">
                {watchedSchedules?.map((schedule, idx) => (
                  <div key={idx} className="flex justify-between items-center py-2 border-b last:border-0">
                    <div>
                      <p className="font-medium text-sm">{schedule.subject_name}</p>
                      {schedule.date && (
                        <p className="text-xs text-muted-foreground">{schedule.date}</p>
                      )}
                    </div>
                    <div className="text-right">
                      <p className="font-semibold">{schedule.total_marks} marks</p>
                      <p className="text-xs text-muted-foreground">Pass: {schedule.pass_marks} ({schedule.total_marks > 0 ? Math.round(((schedule.pass_marks || 0) / schedule.total_marks) * 100) : 0}%)</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* NAVIGATION BUTTONS */}
      <div className="flex justify-between gap-3 pt-6 border-t">
        <div className="flex gap-2">
          {step > 1 && (
            <Button type="button" variant="outline" onClick={handlePrevious}>
              <ChevronLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
          )}
          {onCancel && (
            <Button type="button" variant="outline" onClick={onCancel}>
              Cancel
            </Button>
          )}
        </div>

        <div className="flex gap-2">
          {step < 3 && (
            <Button type="button" onClick={handleNext} className="min-w-32">
              Next
              <ChevronRight className="h-4 w-4 ml-2" />
            </Button>
          )}
          {step === 3 && (
            <Button type="submit" disabled={isSubmitting} className="min-w-32">
              {isSubmitting ? (isEdit ? 'Updating...' : 'Creating...') : isEdit ? 'Update Exam' : 'Create Exam'}
            </Button>
          )}
        </div>
      </div>
    </form>
  );
}