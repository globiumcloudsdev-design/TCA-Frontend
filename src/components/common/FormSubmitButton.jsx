/**
 * FormSubmitButton — Loading-aware submit button
 * ─────────────────────────────────────────────────────────────────
 * Props:
 *   loading      boolean
 *   label        string    default "Save"
 *   loadingLabel string    default "Saving…"
 *   className    string
 *   variant      ButtonProps['variant']   default "default"
 *   disabled     boolean
 *
 * Usage:
 *   <FormSubmitButton loading={mutation.isPending} label="Create Student" />
 */
import { Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export default function FormSubmitButton({
  loading = false,
  label = 'Save',
  loadingLabel = 'Saving…',
  className,
  variant = 'default',
  disabled,
}) {
  return (
    <Button
      type="submit"
      variant={variant}
      disabled={loading || disabled}
      className={cn('min-w-[100px]', className)}
    >
      {loading && <Loader2 size={14} className="mr-2 animate-spin" />}
      {loading ? loadingLabel : label}
    </Button>
  );
}
