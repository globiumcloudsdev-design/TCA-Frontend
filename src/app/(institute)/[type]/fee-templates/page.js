import { notFound } from 'next/navigation';
import FeeTemplatesPage from '@/components/pages/FeeTemplatesPage';
const VALID_TYPES = ['school','coaching','academy','college','university'];
export async function generateStaticParams() { return VALID_TYPES.map((type) => ({ type })); }
export default async function FeeTemplates({ params }) {
  const { type } = await params;
  if (!VALID_TYPES.includes(type)) notFound();
  return <FeeTemplatesPage type={type} />;
}
export async function generateMetadata() { return { title: 'Fee Templates' }; }
