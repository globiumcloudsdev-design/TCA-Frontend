/**
 * EmptyState — shown when a list has no items
 */
export default function EmptyState({ icon = '📭', title = 'Nothing here yet', description }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center gap-3">
      <span className="text-5xl">{icon}</span>
      <h3 className="text-base font-semibold">{title}</h3>
      {description && <p className="text-sm text-muted-foreground max-w-xs">{description}</p>}
    </div>
  );
}
