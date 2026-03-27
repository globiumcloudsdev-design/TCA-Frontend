import { notFound } from 'next/navigation';
import UsersPage from '@/components/pages/UsersPage';
const VALID_TYPES = ['school','coaching','academy','college','university'];
export async function generateStaticParams() { return VALID_TYPES.map((type) => ({ type })); }
export default async function Users({ params }) {
  const { type } = await params;
  if (!VALID_TYPES.includes(type)) notFound();
  return <UsersPage type={type} />;
}
export async function generateMetadata() { return { title: 'User Management' }; }
