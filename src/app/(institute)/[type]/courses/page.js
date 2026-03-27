import { notFound } from 'next/navigation';
import ClassesPage from '@/components/pages/ClassesPage';
const VALID_TYPES = ['school','coaching','academy','college','university','tuition_center'];

export async function generateStaticParams() { return VALID_TYPES.map((type) => ({ type })); }
export default async function Courses({ params }) {
  const { type } = await params;
  if (!VALID_TYPES.includes(type)) notFound();
  return <ClassesPage type={type} />;
}
export async function generateMetadata() { return { title: 'Courses' }; }
