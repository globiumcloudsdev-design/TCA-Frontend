import { notFound } from 'next/navigation';
import StaffAttendancePage from '@/components/pages/StaffAttendancePage';
const VALID_TYPES = ['school','coaching','academy','college','university'];
export async function generateStaticParams() { return VALID_TYPES.map((type) => ({ type })); }
export default async function StaffAttendance({ params }) {
  const { type } = await params;
  if (!VALID_TYPES.includes(type)) notFound();
  return <StaffAttendancePage type={type} />;
}
export async function generateMetadata() { return { title: 'Staff Attendance' }; }
