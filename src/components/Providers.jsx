/**
 * App-wide providers wrapper
 * Keeps layout.js clean and avoids "use client" on layout itself.
 */
"use client";

import { QueryClientProvider } from "@tanstack/react-query";
import { ThemeProvider } from "next-themes";
import { Toaster } from "react-hot-toast";
import { queryClient } from "@/lib/queryClient";
import { useEffect } from "react";
import { useTheme } from "next-themes";

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
        {children}
      </ThemeProvider>
    </QueryClientProvider>
  );
}
