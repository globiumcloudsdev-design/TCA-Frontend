import StudentPromotePage from '@/components/pages/StudentPromotePage';
import { notFound } from 'next/navigation';

const VALID_TYPES = ['school', 'coaching', 'academy', 'college', 'university', 'tuition_center'];

export default async function StudentsPromote({ params }) {
  if (!params) return null;
  const resolvedParams = params instanceof Promise ? await params : params;
  const { type } = resolvedParams;
  if (!VALID_TYPES.includes(type)) notFound();
  return <StudentPromotePage type={type} />;
}

export async function generateMetadata({ params }) {
  if (!params) return { title: 'Promote Students' };
  const resolvedParams = params instanceof Promise ? await params : params;
  const { type } = resolvedParams;
  const labels = {
    school: 'Students',
    coaching: 'Candidates',
    academy: 'Trainees',
    college: 'Students',
    university: 'Students',
    tuition_center: 'Students',
  };
  return { title: `Promote ${labels[type] ?? 'Students'}` };
}