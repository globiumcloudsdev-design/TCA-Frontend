
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
import { Plus, Trash2, ChevronLeft, ChevronRight } from 'lucide-react';

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

import { examService } from '@/services/examService';
import { classService } from '@/services/classService';
import { academicYearService } from '@/services/academicYearService';
import { useAuthStore } from '@/store/authStore';
import { EXAM_TYPES, EXAM_CATEGORIES } from '@/constants';

// ─────────────────────────────────────────────────────────
// VALIDATION SCHEMAS
// ─────────────────────────────────────────────────────────

const subjectScheduleSchema = z.object({
  subject_id: z.string().min(1, 'Subject required'),
  subject_name: z.string().min(1, 'Subject name required'),
  subject_code: z.string().optional().default(''),
  date: z.string().min(1, 'Date required'),
  start_time: z.string().min(1, 'Start time required'),
  end_time: z.string().min(1, 'End time required'),
  duration_minutes: z.coerce.number().min(1, 'Duration required'),
  total_marks: z.coerce.number().min(1, 'Total marks required'),
  pass_marks: z.coerce.number().min(0, 'Pass marks required'),
  venue: z.string().optional().default(''),
  room_no: z.string().optional().default(''),
  invigilator_ids: z.array(z.string()).optional().default([]),
  instructions: z.string().optional().default('')
});

// STEP 1 SCHEMA: Basic Info
const step1Schema = z.object({
  name: z.string().min(3, 'Exam name required (min 3 chars)'),
  code: z.string().optional(),
  description: z.string().optional(),
  type: z.string().min(1, 'Exam type required'),
  category: z.string().min(1, 'Category required'),
  entity_type: z.string().min(1, 'Entity type required'),
  academic_year_id: z.string().min(1, 'Academic year required'),
  class_id: z.string().min(1, 'Class required'),
  section_id: z.string().optional(),
});

// STEP 2 SCHEMA: Subjects
const step2Schema = z.object({
  subject_schedules: z.array(subjectScheduleSchema).min(1, 'At least one subject required'),
});

// STEP 3 SCHEMA: Settings
const step3Schema = z.object({
  pass_percentage: z.coerce.number().min(0).max(100).default(40),

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
  const instituteId = user?.institute?.id || user?.school_id;
  const instituteType = user?.institute?.institute_type;

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [classes, setClasses] = useState([]);
  const [sections, setSections] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [academicYears, setAcademicYears] = useState([]);
  const [step, setStep] = useState(1);
  const [stepErrors, setStepErrors] = useState({});
  
  // Add ref to track if subjects have been auto-populated
  const hasAutoPopulated = useRef(false);
  const previousClassId = useRef(null);

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
    defaultValues: initialData || {
      type: 'mid_term',
      category: 'theory',
      entity_type: instituteType || 'school',
      pass_percentage: 40,
      subject_schedules: [],
      section_id: ''
    }
  });

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

  // Fetch academic years and classes on mount
  useEffect(() => {
    if (!instituteId) return;

    const fetchData = async () => {
      try {
        const [yearsRes, classesRes] = await Promise.all([
          academicYearService.getAll({ institute_id: instituteId, is_active: true }),
          classService.getAll({ institute_id: instituteId, is_active: true })
        ]);

        setAcademicYears(yearsRes?.data || []);
        setClasses(classesRes?.data || []);
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    fetchData();
  }, [instituteId]);

  // Set entity_type from user's institute
  useEffect(() => {
    if (instituteType && !initialData) {
      setValue('entity_type', instituteType);
    }
  }, [instituteType, setValue, initialData]);

  // Reset auto-populate flag when class changes
  useEffect(() => {
    if (previousClassId.current !== watchedClassId) {
      hasAutoPopulated.current = false;
      previousClassId.current = watchedClassId;
    }
  }, [watchedClassId]);

  // Fetch subjects when class changes
  useEffect(() => {
    if (!watchedClassId) {
      setSections([]);
      setSubjects([]);
      return;
    }

    const fetchClassData = async () => {
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
            pass_marks: Math.round((100 * passPercentage) / 100),
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
      }
    };

    fetchClassData();
  }, [watchedClassId, initialData, replaceSchedules, passPercentage]);

  // Auto-update pass marks when pass percentage changes
  useEffect(() => {
    if (watchedSchedules && watchedSchedules.length > 0) {
      watchedSchedules.forEach((schedule, idx) => {
        const passMarks = Math.round((schedule.total_marks * passPercentage) / 100);
        setValue(`subject_schedules.${idx}.pass_marks`, passMarks);
      });
    }
  }, [passPercentage, setValue, watchedSchedules]);

  const calculateDuration = (startTime, endTime) => {
    if (!startTime || !endTime) return 0;
    const [startH, startM] = startTime.split(':').map(Number);
    const [endH, endM] = endTime.split(':').map(Number);
    return (endH - startH) * 60 + (endM - startM);
  };

  // Validate current step
  const validateStep = async (stepNum) => {
    let fieldsToValidate = [];
    if (stepNum === 1) {
      fieldsToValidate = ['name', 'type', 'category', 'academic_year_id', 'class_id'];
    } else if (stepNum === 2) {
      fieldsToValidate = ['subject_schedules'];
    } else if (stepNum === 3) {
      fieldsToValidate = ['pass_percentage'];
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

  const onSubmit = async (data) => {
    setIsSubmitting(true);
    try {
      // Clean payload: convert empty strings to null for optional UUID fields
      const payload = {
        ...data,
        section_id: data.section_id?.trim() ? data.section_id : null,
        school_id: instituteId,
        status: 'draft'
      };

      let response;
      if (isEdit && initialData?.id) {
        response = await examService.update(initialData.id, payload);
        toast.success('Exam updated successfully');
      } else {
        response = await examService.create(payload);
        toast.success('Exam created successfully');
      }

      if (response?.data) {
        onSuccess?.(response.data);
        reset();
      }
    } catch (error) {
      console.error('Error saving exam:', error);
      toast.error(error?.message || 'Failed to save exam');
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

  const totalMarks = watchedSchedules?.reduce((sum, s) => sum + (parseInt(s.total_marks) || 0), 0) || 0;

  const progressValue = (step / 3) * 100;

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 w-full">
      {/* PROGRESS BAR */}
      <div className="space-y-2">
        <div className="flex justify-between items-center">
          <h2 className="text-lg font-semibold">Create Exam</h2>
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
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <InputField
                label="Exam Name *"
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
                label="Exam Type *"
                name="type"
                control={control}
                error={errors.type}
                options={EXAM_TYPES}
                required
              />

              <SelectField
                label="Exam Category *"
                name="category"
                control={control}
                error={errors.category}
                options={EXAM_CATEGORIES}
                required
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <SelectField
                label="Academic Year *"
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

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <SelectField
                label="Class/Standard *"
                name="class_id"
                control={control}
                error={errors.class_id}
                options={classOptions}
                required
              />

              <SelectField
                label="Section (Optional)"
                name="section_id"
                control={control}
                options={sectionOptions}
              />
            </div>

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
            {scheduleFields.length === 0 ? (
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
                          label="Date *"
                          name={`subject_schedules.${idx}.date`}
                          control={control}
                          error={errors.subject_schedules?.[idx]?.date}
                          required
                          disablePastDates
                        />

                        <div className="space-y-1">
                          <Label className="text-xs font-medium">Start Time *</Label>
                          <TimePickerField
                            value={watch(`subject_schedules.${idx}.start_time`)}
                            onChange={(val) => setValue(`subject_schedules.${idx}.start_time`, val)}
                          />
                        </div>

                        <div className="space-y-1">
                          <Label className="text-xs font-medium">End Time *</Label>
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
                          <div className="px-3 py-2 bg-muted rounded-md border border-input text-sm">
                            {watch(`subject_schedules.${idx}.duration_minutes`)} min
                          </div>
                        </div>
                      </div>

                      {/* Marks */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <InputField
                          label="Total Marks *"
                          type="number"
                          {...register(`subject_schedules.${idx}.total_marks`)}
                          error={errors.subject_schedules?.[idx]?.total_marks?.message}
                          required
                          min="1"
                        />

                        <div className="space-y-1">
                          <Label className="text-xs font-medium">Pass Marks (Auto)</Label>
                          <div className="px-3 py-2 bg-muted rounded-md border border-input text-sm font-medium">
                            {watch(`subject_schedules.${idx}.pass_marks`)}
                          </div>
                        </div>
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

      {/* STEP 3: SETTINGS */}
      {step === 3 && (
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Pass Percentage</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <InputField
                  label="Pass Percentage (%)"
                  type="number"
                  {...register('pass_percentage')}
                  error={errors.pass_percentage?.message}
                  min="0"
                  max="100"
                  required
                />

                <div className="space-y-2">
                  <Label className="text-muted-foreground">Total Marks</Label>
                  <div className="text-3xl font-bold text-primary pt-1">
                    {totalMarks}
                  </div>
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
                      <p className="text-xs text-muted-foreground">Pass: {schedule.pass_marks}</p>
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
              {isSubmitting ? 'Creating...' : isEdit ? 'Update Exam' : 'Create Exam'}
            </Button>
          )}
        </div>
      </div>
    </form>
  );
}