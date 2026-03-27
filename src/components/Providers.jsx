/**
 * App-wide providers wrapper
 * Keeps layout.js clean and avoids "use client" on layout itself.
 */
'use client';

import { QueryClientProvider } from '@tanstack/react-query';
import { ThemeProvider } from 'next-themes';
import { Toaster } from 'react-hot-toast';
import { queryClient } from '@/lib/queryClient';

export default function Providers({ children }) {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider
        attribute="class"
        defaultTheme="system"
        enableSystem
        disableTransitionOnChange
      >
        {children}
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: { borderRadius: '8px', fontSize: '14px' },
          }}
        />
      </ThemeProvider>
    </QueryClientProvider>
  );
}
