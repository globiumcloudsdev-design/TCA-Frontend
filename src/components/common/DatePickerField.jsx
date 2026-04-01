/**
 * DatePickerField — Calendar-based date picker with react-hook-form
 * ─────────────────────────────────────────────────────────────────
 * Props:
 *   label       string
 *   name        string
 *   control     UseFormControl
 *   error       FieldError
 *   placeholder string
 *   required    boolean
 *   disabled    boolean
 *   className   string
 *   fromYear    number    default 1990
 *   toYear      number    default current year + 10
 *   disablePastDates  boolean  default false  (disable dates before today)
 *
 * Usage:
 *   <DatePickerField label="Exam Date" name="exam_date" control={control} error={errors.exam_date} disablePastDates required />
 */
'use client';

import { Controller } from 'react-hook-form';
import { format, parseISO, isValid, isBefore, startOfDay } from 'date-fns';
import { CalendarIcon } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';

export default function DatePickerField({
  label,
  name,
  control,
  value,
  onChange,
  error,
  placeholder = 'Pick a date',
  required,
  disabled,
  className,
  fromYear = 1990,
  toYear = new Date().getFullYear() + 10,
  disablePastDates = false,
}) {
  const content = (fieldValue, fieldChange) => {
    let dateValue = null;
    if (fieldValue) {
      dateValue = typeof fieldValue === 'string' ? parseISO(fieldValue) : fieldValue;
      if (!isValid(dateValue)) dateValue = null;
    }

    // Disable past dates if requested
    const disabledMatcher = disablePastDates 
      ? (date) => isBefore(date, startOfDay(new Date()))
      : undefined;

    return (
      <Popover>
        <PopoverTrigger asChild>
          <Button
            id={name}
            variant="outline"
            disabled={disabled}
            className={cn(
              'w-full justify-start text-left font-normal',
              !dateValue && 'text-muted-foreground',
            )}
          >
            <CalendarIcon size={16} className="mr-2" />
            {dateValue ? format(dateValue, 'dd MMM yyyy') : placeholder}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            mode="single"
            selected={dateValue}
            onSelect={(d) => fieldChange(d ? format(d, 'yyyy-MM-dd') : null)}
            fromYear={fromYear}
            toYear={toYear}
            captionLayout="dropdown"
            initialFocus
            disabled={disabledMatcher}
          />
        </PopoverContent>
      </Popover>
    );
  };

  return (
    <div className={cn('space-y-1.5', className)}>
      {label && (
        <Label htmlFor={name}>
          {label}{required && <span className="ml-0.5 text-destructive">*</span>}
        </Label>
      )}

      {control ? (
        <Controller
          name={name}
          control={control}
          render={({ field }) => content(field.value, field.onChange)}
        />
      ) : (
        content(value, onChange)
      )}

      {error && <p className="text-xs text-destructive">{error.message}</p>}
    </div>
  );
}
