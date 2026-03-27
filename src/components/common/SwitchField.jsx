/**
 * SwitchField — react-hook-form compatible Switch toggle with label
 * ─────────────────────────────────────────────────────────────────
 * Props:
 *   label     string
 *   name      string
 *   control   UseFormControl
 *   hint      string   optional helper text
 *   disabled  boolean
 *   className string
 *
 * Usage:
 *   <SwitchField label="Has Branches" name="has_branches" control={control} />
 */
'use client';

import { Controller } from 'react-hook-form';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';

export default function SwitchField({
  label,
  name,
  control,
  value,
  onChange,
  hint,
  disabled,
  className
}) {
  return (
    <div className={cn('flex items-center justify-between rounded-lg border p-3', className)}>
      <div>
        {label && <Label htmlFor={name} className="font-medium">{label}</Label>}
        {hint && <p className="text-xs text-muted-foreground">{hint}</p>}
      </div>

      {control ? (
        <Controller
          name={name}
          control={control}
          render={({ field }) => (
            <Switch
              id={name}
              checked={!!field.value}
              onCheckedChange={field.onChange}
              disabled={disabled}
            />
          )}
        />
      ) : (
        <Switch
          id={name}
          checked={!!value}
          onCheckedChange={onChange}
          disabled={disabled}
        />
      )}
    </div>
  );
}
