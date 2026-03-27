import { notFound } from 'next/navigation';
import ParentsPage from '@/components/pages/ParentsPage';
const VALID_TYPES = ['school','coaching','academy','college','university'];
export async function generateStaticParams() { return VALID_TYPES.map((type) => ({ type })); }
export default async function Parents({ params }) {
  const { type } = await params;
  if (!VALID_TYPES.includes(type)) notFound();
  return <ParentsPage type={type} />;
}
export async function generateMetadata() { return { title: 'Parents / Guardians' }; }
