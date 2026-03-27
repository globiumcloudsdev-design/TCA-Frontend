import { notFound } from 'next/navigation';
import ProgramsPage from '@/components/pages/ProgramsPage';
const VALID_TYPES = ['school','coaching','academy','college','university'];
export async function generateStaticParams() { return VALID_TYPES.map((type) => ({ type })); }
export default async function Programs({ params }) {
  const { type } = await params;
  if (!VALID_TYPES.includes(type)) notFound();
  return <ProgramsPage type={type} />;
}
export async function generateMetadata() { return { title: 'Programs' }; }
