import { notFound } from 'next/navigation';
import SubjectsPage from '@/components/pages/SubjectsPage';
const VALID_TYPES = ['school','coaching','academy','college','university'];
export async function generateStaticParams() { return VALID_TYPES.map((type) => ({ type })); }
export default async function Subjects({ params }) {
  const { type } = await params;
  if (!VALID_TYPES.includes(type)) notFound();
  return <SubjectsPage type={type} />;
}
export async function generateMetadata({ params }) {
  const { type } = await params;
  const l = { academy:'Modules', university:'Courses' };
  return { title: l[type] ?? 'Subjects' };
}
