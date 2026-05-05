/**
 * TextareaField — react-hook-form compatible Textarea with label + error
 * ─────────────────────────────────────────────────────────────────
 * Props:
 *   label       string
 *   name        string
 *   register    UseFormRegister
 *   error       FieldError
 *   rows        number     default 3
 *   placeholder string
 *   required    boolean
 *   disabled    boolean
 *   className   string
 *
 * Usage:
 *   <TextareaField label="Notes" name="notes" register={register} error={errors.notes} />
 */
import { Controller } from 'react-hook-form';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';

export default function TextareaField({
  label,
  name,
  control,
  register,
  error,
  rows = 3,
  placeholder,
  required,
  disabled,
  className,
  ...props
}) {
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
          render={({ field }) => (
            <Textarea
              {...field}
              id={name}
              rows={rows}
              placeholder={placeholder}
              disabled={disabled}
              aria-invalid={!!error}
              value={field.value ?? ''}
              {...props}
            />
          )}
        />
      ) : (
        <Textarea
          id={name}
          name={name}
          rows={rows}
          placeholder={placeholder}
          disabled={disabled}
          aria-invalid={!!error}
          {...(register ? register(name) : props)}
        />
      )}

      {error && <p className="text-xs text-destructive">{error.message}</p>}
    </div>
  );
}
