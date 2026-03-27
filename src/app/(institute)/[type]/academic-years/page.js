import { notFound } from 'next/navigation';
import AcademicYearsPage from '@/components/pages/AcademicYearsPage';

const VALID_TYPES = ['school','coaching','academy','college','university','tuition_center'];

export async function generateStaticParams() { return VALID_TYPES.map((type) => ({ type })); }

export default async function AcademicYears({ params }) {
  const { type } = await params;
  if (!VALID_TYPES.includes(type)) notFound();
  return <AcademicYearsPage type={type} />;
}
export async function generateMetadata({ params }) {
  const { type } = await params;
  const l = { school:'Academic Years', coaching:'Sessions', academy:'Batch Cycles', college:'Academic Years', university:'Academic Years', tuition_center: 'Sessions',
 };
  return { title: l[type] ?? 'Academic Years' };
}
