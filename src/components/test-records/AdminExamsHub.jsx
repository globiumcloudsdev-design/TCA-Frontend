'use client';

import ExamsPage from '@/components/pages/ExamsPage';
import ExamsTabs from './ExamsTabs';
import TestRecordsPanel from './TestRecordsPanel';

/** Admin "Exams" menu page: Test Records (default) + the existing Exams page, unchanged. */
export default function AdminExamsHub({ type }) {
  return <ExamsTabs testRecords={<TestRecordsPanel mode="admin" />} exams={<ExamsPage type={type} />} />;
}
