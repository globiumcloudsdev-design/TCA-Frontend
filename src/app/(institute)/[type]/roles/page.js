import { notFound } from 'next/navigation';
import RolesPage from '@/components/pages/RolesPage';
const VALID_TYPES = ['school','coaching','academy','college','university'];
export async function generateStaticParams() { return VALID_TYPES.map((type) => ({ type })); }
export default async function Roles({ params }) {
  const { type } = await params;
  if (!VALID_TYPES.includes(type)) notFound();
  return <RolesPage type={type} />;
}
export async function generateMetadata() { return { title: 'Roles & Permissions' }; }
