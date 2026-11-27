'use client';

import { useParams } from 'next/navigation';
import TestRecordView from '@/components/test-records/TestRecordView';

export default function TeacherTestRecordViewPage() {
  const { testId } = useParams();
  return <TestRecordView mode="teacher" testId={testId} backHref="/teacher/exams" />;
}
