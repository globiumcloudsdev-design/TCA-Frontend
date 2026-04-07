'use client';
/**
 * Report Detail View Page (Dynamic Type Route)
 * Route: /[type]/reports/view?report=student
 * Loads ReportDetailPage with the specified report type
 */
import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import ReportDetailPage from '@/components/pages/ReportDetailPage';

function ReportViewContent() {
  const searchParams = useSearchParams();
  const reportType = searchParams.get('report') || 'student';

  return <ReportDetailPage reportType={reportType} />;
}

export default function ReportViewPage() {
  return (
    <div className="p-6">
      <Suspense fallback={<div className="flex items-center justify-center py-20"><span className="text-muted-foreground">Loading...</span></div>}>
        <ReportViewContent />
      </Suspense>
    </div>
  );
}
