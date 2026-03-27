import { notFound } from 'next/navigation';
import ExamsPage from '@/components/pages/ExamsPage';
const VALID_TYPES = ['school','coaching','academy','college','university'];
export async function generateStaticParams() { return VALID_TYPES.map((type) => ({ type })); }
export default async function Exams({ params }) {
  const { type } = await params;
  if (!VALID_TYPES.includes(type)) notFound();
  return <ExamsPage type={type} />;
}
export async function generateMetadata({ params }) {
  const { type } = await params;
  const l = { school:'Exams', coaching:'Mock Tests', academy:'Assessments', college:'Examinations', university:'Examinations' };
  return { title: l[type] ?? 'Exams' };
}
