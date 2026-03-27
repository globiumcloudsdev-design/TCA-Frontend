/**
 * ExamForm — Create / Edit exam
 * ─────────────────────────────────────────────────────────────────
 * Props:
 *   defaultValues       object
 *   onSubmit            (data) => void
 *   onCancel            () => void
 *   loading             boolean
 *   classOptions        { value, label }[]
 *   academicYearOptions { value, label }[]
 *   isEdit              boolean
 */
'use client';

import { useForm } from 'react-hook-form';
import {
  InputField,
  SelectField,
  DatePickerField,
  FormSubmitButton,
} from '@/components/common';
import { Button }    from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';

const EXAM_TYPE_OPTIONS = [
  { value: 'midterm',    label: 'Midterm'    },
  { value: 'final',      label: 'Final'      },
  { value: 'unit_test',  label: 'Unit Test'  },
  { value: 'class_test', label: 'Class Test' },
  { value: 'mock',       label: 'Mock Exam'  },
];

export default function ExamForm({
  defaultValues       = {},
  onSubmit,
  onCancel,
  loading             = false,
  classOptions        = [],
  academicYearOptions = [],
  isEdit              = false,
}) {
  const {
    register,
    control,
    handleSubmit,
    formState: { errors },
  } = useForm({ defaultValues });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <InputField
        label="Exam Name"
        name="name"
        register={register}
        error={errors.name}
        required
        placeholder="e.g. Mid-Term 2024"
      />
      <SelectField
        label="Exam Type"
        name="type"
        control={control}
        error={errors.type}
        options={EXAM_TYPE_OPTIONS}
        placeholder="Select type"
        required
      />

      <Separator />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <SelectField
          label="Class"
          name="class_id"
          control={control}
          error={errors.class_id}
          options={classOptions}
          placeholder="Select class"
          required
        />
        <SelectField
          label="Academic Year"
          name="academic_year_id"
          control={control}
          error={errors.academic_year_id}
          options={academicYearOptions}
          placeholder="Select year"
          required
        />
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <DatePickerField
          label="Start Date"
          name="start_date"
          control={control}
          error={errors.start_date}
          required
        />
        <DatePickerField
          label="End Date"
          name="end_date"
          control={control}
          error={errors.end_date}
          required
        />
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <InputField
          label="Total Marks"
          name="total_marks"
          register={register}
          error={errors.total_marks}
          type="number"
          required
          placeholder="e.g. 100"
        />
        <InputField
          label="Pass %"
          name="pass_percentage"
          register={register}
          error={errors.pass_percentage}
          type="number"
          placeholder="e.g. 40"
        />
      </div>

      <div className="flex justify-end gap-3 pt-2">
        <Button type="button" variant="outline" onClick={onCancel}>Cancel</Button>
        <FormSubmitButton
          loading={loading}
          label={isEdit ? 'Save Changes' : 'Create Exam'}
          loadingLabel={isEdit ? 'Saving…' : 'Creating…'}
        />
      </div>
    </form>
  );
}
