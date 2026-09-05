// // src/components/common/TextareaField.jsx
// /**
//  * TextareaField — react-hook-form compatible Textarea with label + error
//  * ─────────────────────────────────────────────────────────────────
//  * Props:
//  *   label       string
//  *   name        string
//  *   register    UseFormRegister
//  *   error       FieldError
//  *   rows        number     default 3
//  *   placeholder string
//  *   required    boolean
//  *   disabled    boolean
//  *   className   string
//  *
//  * Usage:
//  *   <TextareaField label="Notes" name="notes" register={register} error={errors.notes} />
//  */
// import { Controller } from 'react-hook-form';
// import { Textarea } from '@/components/ui/textarea';
// import { Label } from '@/components/ui/label';
// import { cn } from '@/lib/utils';

// export default function TextareaField({
//   label,
//   name,
//   control,
//   register,
//   error,
//   rows = 3,
//   placeholder,
//   required,
//   disabled,
//   className,
//   textareaClassName,
//   ...props
// }) {
//   return (
//     <div className={cn('space-y-1.5', className)}>
//       {label && (
//         <Label htmlFor={name}>
//           {label}
//           {required && <span className="ml-0.5 text-destructive">*</span>}
//         </Label>
//       )}

//       {control ? (
//         <Controller
//           name={name}
//           control={control}
//           render={({ field }) => (
//             <Textarea
//               {...field}
//               id={name}
//               rows={rows}
//               placeholder={placeholder}
//               disabled={disabled}
//               aria-invalid={!!error}
//               className={textareaClassName}
//               value={field.value ?? ''}
//               {...props}
//             />
//           )}
//         />
//       ) : (
//         <Textarea
//           id={name}
//           name={name}
//           rows={rows}
//           placeholder={placeholder}
//           disabled={disabled}
//           aria-invalid={!!error}
//           className={textareaClassName}
//           {...(register ? register(name) : props)}
//         />
//       )}

//       {error && <p className="text-xs text-destructive">{error.message}</p>}
//     </div>
//   );
// }









// src/components/common/TextareaField.jsx
/**
 * TextareaField — react-hook-form compatible Textarea with label + error
 * Supports Tiptap rich text editor when isTiptap=true
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
 *   isTiptap    boolean   default false - enables rich text editor
 *   content     string    initial content for Tiptap
 *   onChange    function  callback for content changes
 */
import { Controller } from 'react-hook-form';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { cn, sanitizeFieldLabel } from '@/lib/utils';
import dynamic from 'next/dynamic';

// Dynamically import Tiptap to avoid SSR issues
const TiptapEditor = dynamic(
  () => import('@/components/common/TiptapEditor'),
  { 
    ssr: false,
    loading: () => (
      <div className="min-h-[200px] border border-slate-200 rounded-lg bg-slate-50 animate-pulse" />
    )
  }
);

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
  textareaClassName,
  isTiptap = false,
  content = '',
  onContentChange,
  ...props
}) {
  const { labelText, isRequired } = sanitizeFieldLabel(label, required);

  return (
    <div className={cn('space-y-1.5', className)}>
      {labelText && (
        <Label htmlFor={name}>
          {labelText}
          {isRequired && <span className="ml-0.5 text-destructive font-semibold">*</span>}
        </Label>
      )}

      {isTiptap ? (
        // Tiptap Rich Text Editor
        control ? (
          <Controller
            name={name}
            control={control}
            render={({ field }) => (
              <TiptapEditor
                content={field.value ?? content}
                onChange={(html) => {
                  field.onChange(html);
                  if (onContentChange) onContentChange(html);
                }}
                placeholder={placeholder}
                disabled={disabled}
                error={!!error}
              />
            )}
          />
        ) : (
          <TiptapEditor
            content={content}
            onChange={(html) => {
              if (register) register(name).onChange({ target: { name, value: html } });
              if (onContentChange) onContentChange(html);
            }}
            placeholder={placeholder}
            disabled={disabled}
            error={!!error}
          />
        )
      ) : (
        // Regular Textarea
        control ? (
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
                className={textareaClassName}
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
            className={textareaClassName}
            {...(register ? register(name) : props)}
          />
        )
      )}

      {error && <p className="text-xs text-destructive">{error.message}</p>}
    </div>
  );
}