// import { notFound } from 'next/navigation';
// <<<<<<< HEAD
// import ClassesPageClient from '@/components/pages/ClassesPageClient';
// const VALID_TYPES = ['school', 'coaching', 'academy', 'college', 'university'];

// export async function generateStaticParams() {
//   return VALID_TYPES.map((type) => ({ type }));
// }

// export default async function Classes({ params }) {
//   const { type } = await params;
//   if (!VALID_TYPES.includes(type)) notFound();
//   return <ClassesPageClient type={type} />;
// }

// export async function generateMetadata({ params }) {
//   const { type } = await params;
//   const l = { school: 'Classes', academy: 'Programs', college: 'Departments', university: 'Departments' };
// =======
import ClassesPage from '@/components/pages/ClassesPage';
import ClassesPageClient from '@/components/pages/ClassesPageClient';

const VALID_TYPES = ['school','coaching','academy','college','university','tuition_center'];
export async function generateStaticParams() { return VALID_TYPES.map((type) => ({ type })); }
export default async function Classes({ params }) {
  const { type } = await params;
  if (!VALID_TYPES.includes(type)) notFound();
  return <ClassesPageClient type={type} />;
}
export async function generateMetadata({ params }) {
  const { type } = await params;
  const l = { school:'Classes', coaching:'Classes', academy:'Programs', college:'Departments', university:'Departments', tuition_center: 'Classes', };
  return { title: l[type] ?? 'Classes' };
}
