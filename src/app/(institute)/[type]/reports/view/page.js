'use client';
/**
 * Report Detail View Page (Dynamic Type Route)
 * Route: /[type]/reports/view?report=student
 * Loads ReportDetailPage with the specified report type
 */
import { useSearchParams } from 'next/navigation';
import ReportDetailPage from '@/components/pages/ReportDetailPage';

export default function ReportViewPage() {
  const searchParams = useSearchParams();
  const reportType = searchParams.get('report') || 'student';

  return (
    <div className="p-6">
      <ReportDetailPage reportType={reportType} />
    </div>
  );
}
