/**
 * AcademicYearForm — Create / Edit academic year
 * ─────────────────────────────────────────────────────────────────
 * Props:
 *   defaultValues  object
 *   onSubmit       (data) => void
 *   onCancel       () => void
 *   loading        boolean
 *   isEdit         boolean
 */
'use client';

import { useForm } from 'react-hook-form';
import { useState, useEffect } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  InputField,
  TextareaField,
  DatePickerField,
  FormSubmitButton,
  SwitchField,
} from '@/components/common';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { CalendarDays, AlertCircle } from 'lucide-react';
import { academicYearService } from '@/services/academicYearService';

// Validation schema
const academicYearSchema = z.object({
  name: z.string()
    .min(4, 'Year name must be at least 4 characters')
    .max(20, 'Year name must not exceed 20 characters')
    .regex(/^\d{4}-\d{4}$/, 'Format should be YYYY-YYYY (e.g., 2024-2025)'),
  
  start_date: z.string()
    .min(1, 'Start date is required')
    .refine(date => !isNaN(Date.parse(date)), 'Invalid date format'),
  
  end_date: z.string()
    .min(1, 'End date is required')
    .refine(date => !isNaN(Date.parse(date)), 'Invalid date format'),
  
  is_current: z.boolean().optional().default(false),
  
  description: z.string()
    .max(200, 'Description must not exceed 200 characters')
    .optional(),
  
  institute_id: z.string().optional(),
});

export default function AcademicYearForm({
  defaultValues = {},
  onSubmit,
  onCancel,
  loading = false,
  instituteId,
  isEdit = false,
}) {
  const [dateError, setDateError] = useState('');
  const [currentYearExists, setCurrentYearExists] = useState(false);

  const {
    register,
    control,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(academicYearSchema),
    defaultValues: {
      is_current: false,
      description: '',
      ...defaultValues,
      institute_id: instituteId,
    },
  });

  const startDate = watch('start_date');
  const endDate = watch('end_date');
  const isCurrent = watch('is_current');

  // Check if current year already exists
  useEffect(() => {
    const checkCurrentYear = async () => {
      if (instituteId && isCurrent) {
        try {
          const current = await academicYearService.getCurrent(instituteId);
          if (current?.data && (!isEdit || current.data.id !== defaultValues.id)) {
            setCurrentYearExists(true);
          } else {
            setCurrentYearExists(false);
          }
        } catch (error) {
          console.error('Error checking current year:', error);
        }
      }
    };
    checkCurrentYear();
  }, [isCurrent, instituteId, isEdit, defaultValues.id]);

  // Validate date range on change
  useEffect(() => {
    if (startDate && endDate) {
      try {
        academicYearService.validateDateRange(startDate, endDate);
        setDateError('');
      } catch (error) {
        setDateError(error.message);
      }
    }
  }, [startDate, endDate]);

  // Auto-generate name from dates
  useEffect(() => {
    if (startDate && !isEdit) {
      const year = new Date(startDate).getFullYear();
      const nextYear = year + 1;
      setValue('name', `${year}-${nextYear}`, { shouldValidate: true });
    }
  }, [startDate, setValue, isEdit]);

  const onSubmitForm = (data) => {
    if (dateError) {
      return;
    }
    onSubmit(data);
  };

  return (
    <form onSubmit={handleSubmit(onSubmitForm)} className="space-y-5">
      {/* Year Name */}
      <InputField
        label="Academic Year"
        name="name"
        register={register}
        error={errors.name}
        required
        placeholder="e.g., 2024-2025"
        disabled={!isEdit && !!startDate} // Auto-generated if start date is set
      />

      {/* Date Range */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <DatePickerField
          label="Start Date"
          name="start_date"
          control={control}
          error={errors.start_date}
          required
          maxDate={endDate ? new Date(endDate) : undefined}
        />
        <DatePickerField
          label="End Date"
          name="end_date"
          control={control}
          error={errors.end_date}
          required
          minDate={startDate ? new Date(startDate) : undefined}
        />
      </div>

      {/* Date Validation Error */}
      {dateError && (
        <Alert variant="destructive" className="py-2">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{dateError}</AlertDescription>
        </Alert>
      )}

      {/* Description */}
      <TextareaField
        label="Description"
        name="description"
        register={register}
        error={errors.description}
        placeholder="Optional notes about this academic year"
        rows={2}
      />
      <SwitchField
        label="Set as Current Year"
        name="is_current"
        control={control}
        hint="Only one academic year can be current at a time"
      />

      {currentYearExists && (
        <Alert className="py-2 border-amber-200 bg-amber-50 text-amber-800">
          <AlertCircle className="h-4 w-4 text-amber-600" />
          <AlertDescription className="text-sm">
            Note: Another year is already set as current. Saving this will unset the previous current year.
          </AlertDescription>
        </Alert>
      )}

      <div className="flex justify-end gap-3 pt-2">
        <Button type="button" variant="outline" onClick={onCancel}>Cancel</Button>
        <FormSubmitButton
          loading={loading}
          label={isEdit ? 'Save Changes' : 'Create Year'}
          loadingLabel={isEdit ? 'Saving…' : 'Creating…'}
        />
      </div>
    </form>
  );
}
