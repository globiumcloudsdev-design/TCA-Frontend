'use client';
/**
 * Client-side wrapper for ClassesPage.
 * dynamic + ssr:false must live inside a 'use client' file in Next.js 13+
 * This fixes Radix UI hydration mismatches (aria-controls / id differences between SSR and client).
 */
import dynamic from 'next/dynamic';

const ClassesPage = dynamic(() => import('@/components/pages/ClassesPage'), {
  ssr: false,
  loading: () => <div className="p-8 text-sm text-muted-foreground animate-pulse">Loading…</div>,
});

export default function ClassesPageClient({ type }) {
  return <ClassesPage type={type} />;
}
