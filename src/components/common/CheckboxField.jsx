/**
 * CheckboxField — react-hook-form compatible Checkbox with label
 * ─────────────────────────────────────────────────────────────────
 * Props:
 *   label     string
 *   name      string
 *   control   UseFormControl
 *   error     FieldError
 *   disabled  boolean
 *   className string
 *
 * Usage:
 *   <CheckboxField label="Is Active" name="is_active" control={control} />
 */
'use client';

import { Controller } from 'react-hook-form';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';

export default function CheckboxField({ label, name, control, error, disabled, className }) {
  return (
    <div className={cn('space-y-1', className)}>
      <Controller
        name={name}
        control={control}
        render={({ field }) => (
          <div className="flex items-center gap-2">
            <Checkbox
              id={name}
              checked={!!field.value}
              onCheckedChange={field.onChange}
              disabled={disabled}
            />
            {label && (
              <Label htmlFor={name} className="cursor-pointer font-normal">
                {label}
              </Label>
            )}
          </div>
        )}
      />
      {error && <p className="text-xs text-destructive">{error.message}</p>}
    </div>
  );
}
