/**
 * /[type]/students/[id]/edit  — Edit Student
 */
import { notFound } from 'next/navigation';
import StudentAddEditPage from '@/components/pages/StudentAddEditPage';

const VALID_TYPES = ['school', 'coaching', 'academy', 'college', 'university'];

export async function generateMetadata({ params }) {
  const { type } = await params;
  const labels = { school: 'Student', coaching: 'Candidate', academy: 'Trainee', college: 'Student', university: 'Student' };
  return { title: `Edit ${labels[type] ?? 'Student'}` };
}

export default async function EditStudent({ params }) {
  const { type, id } = await params;
  if (!VALID_TYPES.includes(type)) notFound();
  return <StudentAddEditPage type={type} id={id} mode="edit" />;
}
