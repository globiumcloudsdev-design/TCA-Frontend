/**
 * PageLoader
 * ─────────────────────────────────────────────────────────────────
 * Full-page centered spinner — used while fetching initial data.
 *
 * Props:
 *   message  string  optional loading message
 */
export default function PageLoader({ message = 'Loading…' }) {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-3 text-center">
      <span className="h-10 w-10 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      <p className="text-sm text-muted-foreground">{message}</p>
    </div>
  );
}
