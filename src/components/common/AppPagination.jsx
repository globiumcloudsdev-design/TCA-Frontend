/**
 * AppPagination
 * ─────────────────────────────────────────────────────────────────
 * Props:
 *   page         number
 *   totalPages   number
 *   onPageChange (page: number) => void
 *
 * Usage:
 *   <AppPagination page={page} totalPages={10} onPageChange={setPage} />
 */
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
  PaginationEllipsis,
} from '@/components/ui/pagination';

export default function AppPagination({ page, totalPages, onPageChange }) {
  if (totalPages <= 1) return null;

  // Build visible page numbers with ellipsis
  const getPages = () => {
    if (totalPages <= 7) return Array.from({ length: totalPages }, (_, i) => i + 1);
    if (page <= 4) return [1, 2, 3, 4, 5, '…', totalPages];
    if (page >= totalPages - 3) return [1, '…', totalPages - 4, totalPages - 3, totalPages - 2, totalPages - 1, totalPages];
    return [1, '…', page - 1, page, page + 1, '…', totalPages];
  };

  return (
    <Pagination>
      <PaginationContent>
        <PaginationItem key="prev">
          <PaginationPrevious
            onClick={() => page > 1 && onPageChange(page - 1)}
            className={page === 1 ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
          />
        </PaginationItem>

        {getPages().map((p, i) =>
          p === '…' ? (
            <PaginationItem key={`ellipsis-${i}`}>
              <PaginationEllipsis />
            </PaginationItem>
          ) : (
            <PaginationItem key={p}>
              <PaginationLink
                isActive={p === page}
                onClick={() => onPageChange(p)}
                className="cursor-pointer"
              >
                {p}
              </PaginationLink>
            </PaginationItem>
          ),
        )}

        <PaginationItem key="next">
          <PaginationNext
            onClick={() => page < totalPages && onPageChange(page + 1)}
            className={page === totalPages ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
          />
        </PaginationItem>
      </PaginationContent>
    </Pagination>
  );
}
