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
import { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';
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
  const [showPassword, setShowPassword] = useState(false);
  const isPassword = type === 'password';
  const inputType = isPassword ? (showPassword ? 'text' : 'password') : type;

  return (
    <div className={cn('space-y-1.5', className)}>
      {label && (
        <Label htmlFor={name}>
          {label}
          {required && <span className="ml-0.5 text-destructive">*</span>}
        </Label>
      )}

      <div className="relative">
        <Input
          id={name}
          name={name}
          type={inputType}
          placeholder={placeholder}
          disabled={disabled}
          aria-invalid={!!error}
          className={cn(isPassword && "pr-10")}
          {...(register ? register(name) : props)}
        />
        {isPassword && (
          <button
            type="button"
            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 focus:outline-none"
            onClick={() => setShowPassword(!showPassword)}
            tabIndex={-1}
          >
            {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
          </button>
        )}
      </div>

      {hint && !error && (
        <p className="text-xs text-muted-foreground">{hint}</p>
      )}
      {error && (
        <p className="text-xs text-destructive">{error.message}</p>
      )}
    </div>
  );
}
