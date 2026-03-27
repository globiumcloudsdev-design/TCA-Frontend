import { notFound } from 'next/navigation';
import FeesPage from '@/components/pages/FeesPage';
const VALID_TYPES = ['school','coaching','academy','college','university'];
export async function generateStaticParams() { return VALID_TYPES.map((type) => ({ type })); }
export default async function Fees({ params }) {
  const { type } = await params;
  if (!VALID_TYPES.includes(type)) notFound();
  return <FeesPage type={type} />;
}
export async function generateMetadata() { return { title: 'Fee Management' }; }
