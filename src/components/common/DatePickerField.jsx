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
 *
 * Usage:
 *   <DatePickerField label="Date of Birth" name="dob" control={control} error={errors.dob} required />
 */
'use client';

import { Controller } from 'react-hook-form';
import { format, parseISO, isValid } from 'date-fns';
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
  error,
  placeholder = 'Pick a date',
  required,
  disabled,
  className,
  fromYear = 1990,
  toYear = new Date().getFullYear() + 10,
}) {
  return (
    <div className={cn('space-y-1.5', className)}>
      {label && (
        <Label htmlFor={name}>
          {label}{required && <span className="ml-0.5 text-destructive">*</span>}
        </Label>
      )}

      <Controller
        name={name}
        control={control}
        render={({ field }) => {
          let dateValue = null;
          if (field.value) {
            dateValue = typeof field.value === 'string' ? parseISO(field.value) : field.value;
            if (!isValid(dateValue)) dateValue = null;
          }

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
                  onSelect={(d) => field.onChange(d ? format(d, 'yyyy-MM-dd') : null)}
                  fromYear={fromYear}
                  toYear={toYear}
                  captionLayout="dropdown"
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          );
        }}
      />

      {error && <p className="text-xs text-destructive">{error.message}</p>}
    </div>
  );
}
