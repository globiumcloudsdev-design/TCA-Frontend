/**
 * ConfirmDialog — Delete / destructive action confirmation
 * ─────────────────────────────────────────────────────────────────
 * Props:
 *   open         boolean
 *   onClose      () => void
 *   onConfirm    () => void
 *   loading      boolean
 *   title        string   default "Are you sure?"
 *   description  string   default "This action cannot be undone."
 *   confirmLabel string   default "Delete"
 *   variant      'destructive' | 'default'
 *
 * Usage:
 *   const [open, setOpen] = useState(false);
 *   <ConfirmDialog
 *     open={open}
 *     onClose={() => setOpen(false)}
 *     onConfirm={handleDelete}
 *     loading={deleteMutation.isPending}
 *     description="This will permanently delete the student record."
 *   />
 */
'use client';

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function ConfirmDialog({
  open,
  onClose,
  onConfirm,
  loading = false,
  title       = 'Are you sure?',
  description = 'This action cannot be undone.',
  confirmLabel = 'Delete',
  variant     = 'destructive',
}) {
  return (
    <AlertDialog open={open} onOpenChange={(v) => !v && onClose()}>
      <AlertDialogContent className="w-[calc(100%-2rem)] max-w-md rounded-xl sm:w-full">
        <AlertDialogHeader>
          <AlertDialogTitle>{title}</AlertDialogTitle>
          <AlertDialogDescription>{description}</AlertDialogDescription>
        </AlertDialogHeader>

        <AlertDialogFooter className="flex-col gap-2 sm:flex-row sm:gap-0">
          <AlertDialogCancel disabled={loading} className="w-full sm:w-auto">Cancel</AlertDialogCancel>
          <AlertDialogAction
            disabled={loading}
            onClick={(e) => { e.preventDefault(); onConfirm(); }}
            className={cn(
              'w-full sm:w-auto',
              variant === 'destructive' &&
                'bg-destructive text-destructive-foreground hover:bg-destructive/90',
            )}
          >
            {loading && <Loader2 size={14} className="mr-2 animate-spin" />}
            {confirmLabel}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
