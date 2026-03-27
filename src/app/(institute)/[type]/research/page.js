import { notFound } from 'next/navigation';
import ResearchPage from '@/components/pages/ResearchPage';
const VALID_TYPES = ['school','coaching','academy','college','university'];
export async function generateStaticParams() { return VALID_TYPES.map((type) => ({ type })); }
export default async function Research({ params }) {
  const { type } = await params;
  if (!VALID_TYPES.includes(type)) notFound();
  return <ResearchPage type={type} />;
}
export async function generateMetadata() { return { title: 'Research Modules' }; }
