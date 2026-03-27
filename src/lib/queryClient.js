/**
 * The Clouds Academy — React Query Client
 * Shared TanStack Query client configuration.
 */

import { QueryClient } from '@tanstack/react-query';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5,       // data fresh for 5 minutes
      gcTime: 1000 * 60 * 10,         // keep in cache 10 minutes
      retry: 1,                        // retry failed requests once
      refetchOnWindowFocus: false,
    },
    mutations: {
      retry: 0,
    },
  },
});
