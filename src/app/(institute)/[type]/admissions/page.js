import { notFound } from 'next/navigation';
import AdmissionsPage from '@/components/pages/AdmissionsPage';

const VALID_TYPES = ['school','coaching','academy','college','university','tuition_center'];

export async function generateStaticParams() { return VALID_TYPES.map((type) => ({ type })); }
export default async function Admissions({ params }) {
  const { type } = await params;
  if (!VALID_TYPES.includes(type)) notFound();
  return <AdmissionsPage type={type} />;
}
export async function generateMetadata({ params }) {
  const { type } = await params;
  const l = { school:'Admissions', coaching:'Enrollments', academy:'Registrations', college:'Admissions', university:'Admissions', tuition_center: 'Enrollments',};
  return { title: l[type] ?? 'Admissions' };
}
