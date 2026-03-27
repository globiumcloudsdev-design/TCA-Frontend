/**
 * /[type]/students
 * Handles: /school/students, /coaching/students (Candidates), /academy/students (Trainees), etc.
 */
import { notFound } from 'next/navigation';
import StudentsPage from '@/components/pages/StudentsPage';

const VALID_TYPES = ['school', 'coaching', 'academy', 'college', 'university','tuition_center'];

export default async function Students({ params }) {
  const { type } = await params;
  if (!VALID_TYPES.includes(type)) notFound();
  return <StudentsPage type={type} />;
}

export async function generateMetadata({ params }) {
  const { type } = await params;
  const labels = {
    school:     'Students',
    coaching:   'Candidates',
    academy:    'Trainees',
    college:    'Students',
    university: 'Students',
    tuition_center: 'Students',
  };
  return { title: labels[type] ?? 'Students' };
}
