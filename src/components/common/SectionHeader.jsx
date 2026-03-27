/**
 * SectionHeader
 * ─────────────────────────────────────────────────────────────────
 * Smaller sub-section header within a page card.
 *
 * Props:
 *   title   string
 *   action  ReactNode  optional right-side slot
 */
export default function SectionHeader({ title, action }) {
  return (
    <div className="mb-4 flex items-center justify-between">
      <h2 className="text-base font-semibold text-foreground">{title}</h2>
      {action && <div>{action}</div>}
    </div>
  );
}
