import { notFound } from 'next/navigation';
import TeachersPage from '@/components/pages/TeachersPage';

const VALID_TYPES = ['school','coaching','academy','college','university', 'tuition_center'];

export async function generateStaticParams() { return VALID_TYPES.map((type) => ({ type })); }
export default async function Teachers({ params }) {
  const { type } = await params;
  if (!VALID_TYPES.includes(type)) notFound();
  return <TeachersPage type={type} />;
}
export async function generateMetadata({ params }) {
  const { type } = await params;
  const l = { school:'Teachers', coaching:'Instructors', academy:'Trainers', college:'Lecturers', university:'Faculty', tuition_center: 'Teachers', };
  return { title: l[type] ?? 'Staff' };
}
