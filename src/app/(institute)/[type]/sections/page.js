import { notFound } from 'next/navigation';
import SectionsPage from '@/components/pages/SectionsPage';
const VALID_TYPES = ['school','coaching','academy','college','university'];
export async function generateStaticParams() { return VALID_TYPES.map((type) => ({ type })); }
export default async function Sections({ params }) {
  const { type } = await params;
  if (!VALID_TYPES.includes(type)) notFound();
  return <SectionsPage type={type} />;
}
export async function generateMetadata() { return { title: 'Sections' }; }
