/**
 * Pagination — row/page navigator
 * Usage:
 *   <Pagination page={page} totalPages={10} onPageChange={setPage} />
 */
export default function Pagination({ page, totalPages, onPageChange }) {
  if (totalPages <= 1) return null;

  return (
    <div className="flex items-center gap-2 text-sm">
      <button
        disabled={page === 1}
        onClick={() => onPageChange(page - 1)}
        className="rounded border px-3 py-1.5 text-sm hover:bg-muted disabled:opacity-40"
      >
        ← Prev
      </button>

      <span className="min-w-[5rem] text-center text-muted-foreground">
        Page {page} of {totalPages}
      </span>

      <button
        disabled={page === totalPages}
        onClick={() => onPageChange(page + 1)}
        className="rounded border px-3 py-1.5 text-sm hover:bg-muted disabled:opacity-40"
      >
        Next →
      </button>
    </div>
  );
}
