/**
 * /[type]/students/[id]  — Student Detail
 * Works for: /school/students/:id, /coaching/students/:id, etc.
 */
import { notFound } from 'next/navigation';
import StudentDetailPage from '@/components/pages/StudentDetailPage';

const VALID_TYPES = ['school', 'coaching', 'academy', 'college', 'university'];

export async function generateMetadata({ params }) {
  const { type } = await params;
  const labels = { school: 'Student', coaching: 'Candidate', academy: 'Trainee', college: 'Student', university: 'Student' };
  return { title: `${labels[type] ?? 'Student'} Detail` };
}

export default async function StudentDetail({ params }) {
  const { type, id } = await params;
  if (!VALID_TYPES.includes(type)) notFound();
  return <StudentDetailPage type={type} id={id} />;
}
