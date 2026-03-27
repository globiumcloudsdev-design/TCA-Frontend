import { notFound } from 'next/navigation';
import SectionsPage from '@/components/pages/SectionsPage';
const VALID_TYPES = ['school','coaching','academy','college','university','tuition_center'];
export async function generateStaticParams() { return VALID_TYPES.map((type) => ({ type })); }
export default async function Batches({ params }) {
  const { type } = await params;
  if (!VALID_TYPES.includes(type)) notFound();
  return <SectionsPage type={type} />;
}
export async function generateMetadata({ params }) {
  const { type } = await params;
  const l = { school:'Batches', coaching:'Batches', academy:'Batches', college:'Batches', university:'Batches', tuition_center: 'Batches',};
  return { title: l[type] ?? 'Batches' };
}
