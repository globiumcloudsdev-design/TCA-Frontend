import { notFound } from 'next/navigation';
import BranchesPage from '@/components/pages/BranchesPage';
const VALID_TYPES = ['school','coaching','academy','college','university','tuition_center'];
export async function generateStaticParams() { return VALID_TYPES.map((type) => ({ type })); }
export default async function Branches({ params }) {
  const { type } = await params;
  if (!VALID_TYPES.includes(type)) notFound();
  return <BranchesPage type={type} />;
}
export async function generateMetadata({ params }) {
  const { type } = await params;
  const l = { school:'Branches', coaching:'Branches', academy:'Branches', college:'Branches', university:'Campuses', tuition_center: 'Branches',};
  return { title: l[type] ?? 'Branches' };
}
