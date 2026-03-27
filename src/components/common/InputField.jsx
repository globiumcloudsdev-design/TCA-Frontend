/**
 * InputField — react-hook-form compatible Input with label + error
 * ─────────────────────────────────────────────────────────────────
 * Props:
 *   label       string
 *   name        string    (RHF field name)
 *   register    UseFormRegister
 *   error       FieldError
 *   type        string    default 'text'
 *   placeholder string
 *   required    boolean
 *   disabled    boolean
 *   className   string
 *   hint        string    optional helper text
 *
 * Usage:
 *   <InputField
 *     label="First Name"
 *     name="first_name"
 *     register={register}
 *     error={errors.first_name}
 *     placeholder="e.g. John"
 *     required
 *   />
 */
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';

export default function InputField({
  label,
  name,
  register,
  error,
  type = 'text',
  placeholder,
  required,
  disabled,
  className,
  hint,
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

      <Input
        id={name}
        name={name}
        type={type}
        placeholder={placeholder}
        disabled={disabled}
        aria-invalid={!!error}
        {...(register ? register(name) : props)}
      />

      {hint && !error && (
        <p className="text-xs text-muted-foreground">{hint}</p>
      )}
      {error && (
        <p className="text-xs text-destructive">{error.message}</p>
      )}
    </div>
  );
}
