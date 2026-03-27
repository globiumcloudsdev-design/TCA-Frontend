/**
 * AppModal — Generic modal dialog wrapper
 * ─────────────────────────────────────────────────────────────────
 * Props:
 *   open         boolean
 *   onClose      () => void
 *   title        string
 *   description  string       optional subtitle
 *   size         'sm'|'md'|'lg'|'xl'   default 'md'
 *   children     ReactNode
 *   footer       ReactNode             optional custom footer
 *
 * Usage:
 *   <AppModal open={open} onClose={() => setOpen(false)} title="Add Student" size="lg">
 *     <StudentForm onSuccess={() => setOpen(false)} />
 *   </AppModal>
 */
'use client';

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { cn } from '@/lib/utils';

const SIZE_CLASSES = {
  sm: 'sm:max-w-sm',
  md: 'sm:max-w-lg',
  lg: 'sm:max-w-2xl',
  xl: 'sm:max-w-4xl',
};

export default function AppModal({
  open,
  onClose,
  title,
  description,
  size = 'md',
  children,
  footer,
}) {
  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent
        className={cn(
          // Width: full on mobile, capped on larger screens
          'w-full p-0',
          SIZE_CLASSES[size],
          // Height: never taller than 95vh; scroll inside
          'max-h-[95vh] flex flex-col',
        )}
      >
        {/* ── Sticky Header ── */}
        <DialogHeader className="shrink-0 border-b px-5 pt-5 pb-4">
          <DialogTitle className="text-base sm:text-lg">{title}</DialogTitle>
          {description && (
            <DialogDescription className="text-sm">{description}</DialogDescription>
          )}
        </DialogHeader>

        {/* ── Scrollable Body ── */}
        <div className="flex-1 overflow-y-auto px-5 py-4">
          {children}
        </div>

        {/* ── Optional Footer ── */}
        {footer && (
          <div className="shrink-0 border-t px-5 py-4 flex justify-end gap-2">
            {footer}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
