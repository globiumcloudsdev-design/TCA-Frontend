import { notFound } from 'next/navigation';
import ReportsPage from '@/components/pages/ReportsPage';
const VALID_TYPES = ['school','coaching','academy','college','university'];
export async function generateStaticParams() { return VALID_TYPES.map((type) => ({ type })); }
export default async function Reports({ params }) {
  const { type } = await params;
  if (!VALID_TYPES.includes(type)) notFound();
  return <ReportsPage type={type} />;
}
export async function generateMetadata() { return { title: 'Reports' }; }
