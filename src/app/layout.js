/**
 * Root layout — wraps every page with:
 *  - ThemeProvider  (next-themes)
 *  - QueryClientProvider (TanStack Query v5)
 *  - Sonner Toaster
 */

import { Inter } from "next/font/google";
import "./globals.css";

import Providers from "@/components/Providers";
import { Toaster } from "sonner";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

export const metadata = {
  title: {
    default: "The Clouds Academy",
    template: "%s | The Clouds Academy",
  },
  description: "Institute Management System",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning className={inter.variable}>
      <body
        suppressHydrationWarning
        className="min-h-screen bg-background antialiased"
      >
        <Providers>{children}</Providers>

        {/* Sonner Toast */}
        <Toaster richColors position="top-right" />
      </body>
    </html>
  );
}
