/**
 * DatePickerField — Calendar-based date picker with react-hook-form
 * ─────────────────────────────────────────────────────────────────
 * Props:
 *   label             string
 *   name              string
 *   control           UseFormControl
 *   error             FieldError
 *   placeholder       string
 *   required          boolean
 *   disabled          boolean
 *   className         string
 *   fromYear          number    default 1990
 *   toYear            number    default current year + 10
 *   disablePastDates  boolean   default false  (disable dates before today, Asia/Karachi)
 *   minDate/maxDate   "today" | "YYYY-MM-DD" | Date   (days outside are disabled; the trigger is a button so dates cannot be typed)
 *   disableFutureDates boolean  default false  (disable dates after today)
 *
 * Usage:
 *   <DatePickerField label="Attendance Date" name="date" control={control} disableFutureDates />
 */
'use client';

import { useState } from 'react';
import { Controller } from 'react-hook-form';
import { format, parseISO, isValid } from 'date-fns';
import { CalendarIcon } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Label } from '@/components/ui/label';
import { cn, sanitizeFieldLabel } from '@/lib/utils';
import { todayPK } from '@/lib/dateUtils';

// Normalise minDate/maxDate ('today' | YYYY-MM-DD | Date) to a YYYY-MM-DD string.
// 'today' and disablePastDates/disableFutureDates use Pakistan time (Asia/Karachi), not the browser zone.
const toYmd = (v) => {
  if (!v) return null;
  if (v === 'today') return todayPK();
  if (typeof v === 'string') return /^d{4}-d{2}-d{2}/.test(v) ? v.slice(0, 10) : null;
  return isValid(v) ? format(v, 'yyyy-MM-dd') : null;
};

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
  fromYear = 1950,
  toYear = new Date().getFullYear() + 4,
  disablePastDates = false,
  disableFutureDates = false,
  minDate,
  maxDate,
  rules,
}) {
  const [isOpen, setIsOpen] = useState(false);

  const content = (fieldValue, fieldChange) => {
    let dateValue = null;
    if (fieldValue) {
      dateValue = typeof fieldValue === 'string' ? parseISO(fieldValue) : fieldValue;
      if (!isValid(dateValue)) dateValue = null;
    }

    // Compare plain calendar-day strings so time zones can never shift a day.
    const minStr = disablePastDates ? (toYmd(minDate) && toYmd(minDate) > todayPK() ? toYmd(minDate) : todayPK()) : toYmd(minDate);
    const maxStr = disableFutureDates ? (toYmd(maxDate) && toYmd(maxDate) < todayPK() ? toYmd(maxDate) : todayPK()) : toYmd(maxDate);

    const disabledMatcher = (date) => {
      const ymd = format(date, 'yyyy-MM-dd');
      if (minStr && ymd < minStr) return true;
      if (maxStr && ymd > maxStr) return true;
      return false;
    };
    const startMonth = minStr ? parseISO(minStr) : new Date(fromYear, 0, 1);
    const endMonth = maxStr ? parseISO(maxStr) : new Date(toYear, 11, 31);

    return (
      <Popover open={isOpen} onOpenChange={setIsOpen}>
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
            onSelect={(d) => {
              if (d && disabledMatcher(d)) return;
              fieldChange(d ? format(d, 'yyyy-MM-dd') : null);
              setIsOpen(false);
            }}
            startMonth={startMonth}
            endMonth={endMonth}
            defaultMonth={dateValue || (minStr ? parseISO(minStr) : undefined)}
            captionLayout="dropdown"
            initialFocus
            disabled={disabledMatcher}
          />
        </PopoverContent>
      </Popover>
    );
  };

  const { labelText, isRequired } = sanitizeFieldLabel(label, required);

  return (
    <div className={cn('space-y-1.5', className)}>
      {labelText && (
        <Label htmlFor={name}>
          {labelText}
          {isRequired && <span className="ml-0.5 text-destructive font-semibold">*</span>}
        </Label>
      )}

      {control ? (
        <Controller
          name={name}
          control={control}
          rules={rules}
          render={({ field }) => content(field.value, field.onChange)}
        />
      ) : (
        content(value, onChange)
      )}

      {error && <p className="text-xs text-destructive">{error.message}</p>}
    </div>
  );
}
