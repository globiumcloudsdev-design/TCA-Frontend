import { notFound } from 'next/navigation';
import SemestersPage from '@/components/pages/SemestersPage';
const VALID_TYPES = ['school','coaching','academy','college','university'];
export async function generateStaticParams() { return VALID_TYPES.map((type) => ({ type })); }
export default async function Semesters({ params }) {
  const { type } = await params;
  if (!VALID_TYPES.includes(type)) notFound();
  return <SemestersPage type={type} />;
}
export async function generateMetadata() { return { title: 'Semesters' }; }
