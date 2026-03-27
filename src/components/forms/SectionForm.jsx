/**
 * SectionForm — Create / Edit section
 * ─────────────────────────────────────────────────────────────────
 * Props:
 *   defaultValues       object
 *   onSubmit            (data) => void
 *   onCancel            () => void
 *   loading             boolean
 *   classOptions        { value, label }[]
 *   teacherOptions      { value, label }[]
 *   academicYearOptions { value, label }[]
 *   isEdit              boolean
 */
'use client';

import { useForm } from 'react-hook-form';
import {
  InputField,
  SelectField,
  FormSubmitButton,
} from '@/components/common';
import { Button } from '@/components/ui/button';

export default function SectionForm({
  defaultValues       = {},
  onSubmit,
  onCancel,
  loading             = false,
  classOptions        = [],
  teacherOptions      = [],
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
        label="Section Name"
        name="name"
        register={register}
        error={errors.name}
        required
        placeholder="e.g. A, B, Blue"
      />
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
        placeholder="Select academic year"
        required
      />
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <InputField
          label="Capacity"
          name="capacity"
          register={register}
          error={errors.capacity}
          type="number"
          placeholder="e.g. 40"
        />
        <InputField
          label="Room Number"
          name="room_number"
          register={register}
          error={errors.room_number}
          placeholder="e.g. 101"
        />
      </div>
      <SelectField
        label="Section Teacher"
        name="section_teacher_id"
        control={control}
        error={errors.section_teacher_id}
        options={teacherOptions}
        placeholder="Select teacher"
      />

      <div className="flex justify-end gap-3 pt-2">
        <Button type="button" variant="outline" onClick={onCancel}>Cancel</Button>
        <FormSubmitButton
          loading={loading}
          label={isEdit ? 'Save Changes' : 'Add Section'}
          loadingLabel={isEdit ? 'Saving…' : 'Adding…'}
        />
      </div>
    </form>
  );
}
