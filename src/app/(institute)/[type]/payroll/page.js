import { notFound } from 'next/navigation';
import PayrollPage from '@/components/pages/PayrollPage';
const VALID_TYPES = ['school','coaching','academy','college','university'];
export async function generateStaticParams() { return VALID_TYPES.map((type) => ({ type })); }
export default async function Payroll({ params }) {
  const { type } = await params;
  if (!VALID_TYPES.includes(type)) notFound();
  return <PayrollPage type={type} />;
}
export async function generateMetadata() { return { title: 'Payroll' }; }
