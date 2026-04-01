import { notFound } from 'next/navigation';
import ExamResultsReportPage from '@/components/pages/ExamResultsReportPage';

const VALID_TYPES = ['school', 'coaching', 'academy', 'college', 'university'];

export default async function ResultsReportPage({ params }) {
  const { type, examId } = await params;
  
  if (!VALID_TYPES.includes(type)) notFound();
  if (!examId) notFound();

  return <ExamResultsReportPage examId={examId} type={type} />;
}

export async function generateMetadata({ params }) {
  const { type } = await params;
  const label = {
    school: 'Results Report',
    coaching: 'Test Report',
    academy: 'Assessment Report',
    college: 'Examination Report',
    university: 'Examination Report'
  };
  
  return { title: label[type] ?? 'Results Report' };
}
