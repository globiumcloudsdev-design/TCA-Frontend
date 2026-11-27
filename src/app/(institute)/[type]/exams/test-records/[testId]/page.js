'use client';

import { useParams } from 'next/navigation';
import TestRecordView from '@/components/test-records/TestRecordView';

export default function AdminTestRecordViewPage() {
  const { type, testId } = useParams();
  return <TestRecordView mode="admin" testId={testId} backHref={`/${type}/exams`} />;
}
