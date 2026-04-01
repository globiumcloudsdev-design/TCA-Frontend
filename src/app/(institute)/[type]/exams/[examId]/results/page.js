import { notFound } from 'next/navigation';
import ExamResultsPage from '@/components/pages/ExamResultsPage';

const VALID_TYPES = ['school', 'coaching', 'academy', 'college', 'university'];

export default async function ResultsEntryPage({ params }) {
  const { type, examId } = await params;
  
  if (!VALID_TYPES.includes(type)) notFound();
  if (!examId) notFound();

  return <ExamResultsPage examId={examId} type={type} />;
}

export async function generateMetadata({ params }) {
  const { type } = await params;
  const label = {
    school: 'Exam Results',
    coaching: 'Test Results',
    academy: 'Assessment Results',
    college: 'Examination Results',
    university: 'Examination Results'
  };
  
  return { title: label[type] ?? 'Results' };
}
