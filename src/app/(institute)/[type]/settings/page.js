import { notFound } from 'next/navigation';
import SettingsPage from '@/components/pages/SettingsPage';
const VALID_TYPES = ['school','coaching','academy','college','university'];
export async function generateStaticParams() { return VALID_TYPES.map((type) => ({ type })); }
export default async function Settings({ params }) {
  const { type } = await params;
  if (!VALID_TYPES.includes(type)) notFound();
  return <SettingsPage type={type} />;
}
export async function generateMetadata() { return { title: 'Settings' }; }
