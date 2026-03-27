/**
 * /[type]/students/add  — Add New Student
 */
import { notFound } from 'next/navigation';
import StudentAddEditPage from '@/components/pages/StudentAddEditPage';

const VALID_TYPES = ['school', 'coaching', 'academy', 'college', 'university'];

export async function generateMetadata({ params }) {
  const { type } = await params;
  const labels = { school: 'Student', coaching: 'Candidate', academy: 'Trainee', college: 'Student', university: 'Student' };
  return { title: `Add ${labels[type] ?? 'Student'}` };
}

export default async function AddStudent({ params }) {
  const { type } = await params;
  if (!VALID_TYPES.includes(type)) notFound();
  return <StudentAddEditPage type={type} mode="add" />;
}
