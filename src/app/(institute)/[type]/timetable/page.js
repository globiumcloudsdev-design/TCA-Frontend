import { notFound } from 'next/navigation';
import TimetablePage from '@/components/pages/TimetablePage';
const VALID_TYPES = ['school','coaching','academy','college','university', 'tuition_center'];
export async function generateStaticParams() { return VALID_TYPES.map((type) => ({ type })); }
export default async function Timetable({ params }) {
  const { type } = await params;
  if (!VALID_TYPES.includes(type)) notFound();
  return <TimetablePage type={type} />;
}
export async function generateMetadata({ params }) {
  const { type } = await params;
  const l = { coaching:'Session Schedule', academy:'Class Schedule', college:'Lecture Schedule', university:'Course Schedule', tuition_center: 'Class Schedule', school:'Class Schedule' };
  return { title: l[type] ?? 'Timetable', description: `View and manage the ${type} timetable, including classes, sessions, and schedules.` };
}
