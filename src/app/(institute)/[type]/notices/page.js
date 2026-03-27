import { notFound } from 'next/navigation';
import NoticesPage from '@/components/pages/NoticesPage';
const VALID_TYPES = ['school','coaching','academy','college','university'];
export async function generateStaticParams() { return VALID_TYPES.map((type) => ({ type })); }
export default async function Notices({ params }) {
  const { type } = await params;
  if (!VALID_TYPES.includes(type)) notFound();
  return <NoticesPage type={type} />;
}
export async function generateMetadata() { return { title: 'Notices' }; }
