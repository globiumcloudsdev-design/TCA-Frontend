/**
 * EmptyState — No data illustration + message
 * ─────────────────────────────────────────────────────────────────
 * Props:
 *   icon        ReactNode | string (emoji)   default 📭
 *   title       string
 *   description string
 *   action      ReactNode                   optional CTA button
 *
 * Usage:
 *   <EmptyState
 *     title="No Students Found"
 *     description="Add a student to get started."
 *     action={<Button onClick={openModal}>+ Add Student</Button>}
 *   />
 */
export default function EmptyState({
  icon = '📭',
  title = 'Nothing here yet',
  description,
  action,
}) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center gap-3">
      <div className="text-5xl">{icon}</div>
      <h3 className="text-base font-semibold text-foreground">{title}</h3>
      {description && (
        <p className="text-sm text-muted-foreground max-w-xs">{description}</p>
      )}
      {action && <div className="mt-2">{action}</div>}
    </div>
  );
}
