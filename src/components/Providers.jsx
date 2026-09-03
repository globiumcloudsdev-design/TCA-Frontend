/**
 * App-wide providers wrapper
 * Keeps layout.js clean and avoids "use client" on layout itself.
 */
"use client";

import { QueryClientProvider } from "@tanstack/react-query";
import { ThemeProvider } from "next-themes";
import { queryClient } from "@/lib/queryClient";
import MaintenanceProvider from "./MaintenanceProvider";
import { useEffect } from "react";
import { useTheme } from "next-themes";

// Suppress React 19 next-themes false-positive <script> warning in development
if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
  const origError = console.error;
  console.error = (...args) => {
    if (typeof args[0] === 'string' && args[0].includes('Encountered a script tag while rendering React component')) {
      return;
    }
    origError.apply(console, args);
  };
}

function ForceLightMode() {
  const { setTheme } = useTheme();
  
  useEffect(() => {
    // Check if we already forced light mode in this session
    const hasForced = sessionStorage.getItem("theme_forced_light");
    if (!hasForced) {
      setTheme("light");
      sessionStorage.setItem("theme_forced_light", "true");
    }
  }, [setTheme]);

  return null;
}

export default function Providers({ children }) {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider
        attribute="class"
        defaultTheme="light"
        enableSystem={false}
        disableTransitionOnChange
      >
        <ForceLightMode />
        <MaintenanceProvider>
          {children}
        </MaintenanceProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}
