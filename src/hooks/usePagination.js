/**
 * usePagination — simple client-side pagination state helper
 */
'use client';

import { useState, useCallback } from 'react';

export function usePagination(initialPage = 1, initialLimit = 20) {
  const [page,  setPage]  = useState(initialPage);
  const [limit, setLimit] = useState(initialLimit);

  const nextPage = useCallback(() => setPage((p) => p + 1), []);
  const prevPage = useCallback(() => setPage((p) => Math.max(1, p - 1)), []);
  const reset    = useCallback(() => setPage(1), []);

  return { page, limit, setPage, setLimit, nextPage, prevPage, reset };
}
