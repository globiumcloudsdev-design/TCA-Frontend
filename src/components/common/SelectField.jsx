/**
 * SelectField — react-hook-form compatible Select with label + error
 * ─────────────────────────────────────────────────────────────────
 * Props:
 *   label       string
 *   name        string
 *   control     UseFormControl  (react-hook-form Controller)
 *   error       FieldError
 *   options     { value: string, label: string }[]
 *   placeholder string
 *   required    boolean
 *   disabled    boolean
 *   className   string
 *
 * Usage:
 *   <SelectField
 *     label="Gender"
 *     name="gender"
 *     control={control}
 *     error={errors.gender}
 *     options={GENDER_OPTIONS}
 *     placeholder="Select gender"
 *     required
*   />
 */
'use client';

import { Controller } from 'react-hook-form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import StatusBadge from '@/components/common/StatusBadge';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';

export default function SelectField({
  label,
  name,
  control,
  value,
  onChange,
  error,
  options = [],
  placeholder = 'Select…',
  required,
  disabled,
  className,
  rules,
}) {
  const normalizedOptions = (options || []).filter((opt) => {
    const value = String(opt?.value ?? '').trim();
    return value !== '';
  });

  return (
    <div className={cn('space-y-1.5', className)}>
      {label && (
        <Label htmlFor={name}>
          {label}
          {required && <span className="ml-0.5 text-destructive">*</span>}
        </Label>
      )}

      {control ? (
        <Controller
          name={name}
          control={control}
          rules={rules}
          render={({ field }) => (
            <Select
              value={field.value ?? ''}
              onValueChange={field.onChange}
              disabled={disabled}
            >
              <SelectTrigger id={name} aria-invalid={!!error}>
                <SelectValue placeholder={placeholder} />
              </SelectTrigger>
              <SelectContent>
                {normalizedOptions.map((opt) => (
                  <SelectItem key={opt.value} value={String(opt.value)}>
                    <span className="flex items-center justify-between gap-2 w-full">
                      <span>{opt.label}</span>
                      {opt.badgeStatus ? (
                        <StatusBadge status={opt.badgeStatus} label={opt.badgeLabel || 'Current'} />
                      ) : null}
                    </span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        />
      ) : (
        <Select
          value={value ?? ''}
          onValueChange={onChange}
          disabled={disabled}
        >
          <SelectTrigger id={name} aria-invalid={!!error}>
            <SelectValue placeholder={placeholder} />
          </SelectTrigger>
          <SelectContent>
            {normalizedOptions.map((opt) => (
              <SelectItem key={opt.value} value={String(opt.value)}>
                <span className="flex items-center justify-between gap-2 w-full">
                  <span>{opt.label}</span>
                  {opt.badgeStatus ? (
                    <StatusBadge status={opt.badgeStatus} label={opt.badgeLabel || 'Current'} />
                  ) : null}
                </span>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      )}

      {error && <p className="text-xs text-destructive">{error.message}</p>}
    </div>
  );
}
