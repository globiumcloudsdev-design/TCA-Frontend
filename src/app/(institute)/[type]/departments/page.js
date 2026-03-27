import { notFound } from 'next/navigation';
import DepartmentsPage from '@/components/pages/DepartmentsPage';
const VALID_TYPES = ['school','coaching','academy','college','university','tuition_center'];

export async function generateStaticParams() { return VALID_TYPES.map((type) => ({ type })); }
export default async function Departments({ params }) {
  const { type } = await params;
  if (!VALID_TYPES.includes(type)) notFound();
  return <DepartmentsPage type={type} />;
}
export async function generateMetadata({ params }) {
  const { type } = await params;
  const l = { school:'Departments', coaching:'Departments', academy:'Departments', college:'Departments', university:'Departments', tuition_center: 'Departments', };
  return { title: l[type] ?? 'Departments' };
}
