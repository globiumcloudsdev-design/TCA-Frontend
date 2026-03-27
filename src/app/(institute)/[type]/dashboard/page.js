/**
 * /[type]/dashboard
 * Handles: /school/dashboard, /coaching/dashboard, /academy/dashboard, etc.
 *
 * Validates that [type] is one of the 5 known institute types.
 * Renders shared DashboardPage — which adapts itself via useInstituteConfig().
 */
import { notFound } from 'next/navigation';
import DashboardPage from '@/components/pages/DashboardPage';

const VALID_TYPES = ['school', 'coaching', 'academy', 'college', 'university', 'tuition_center'];

export async function generateStaticParams() {
  return VALID_TYPES.map((type) => ({ type }));
}

export default async function Dashboard({ params }) {
  const { type } = await params;
  if (!VALID_TYPES.includes(type)) notFound();
  return <DashboardPage type={type} />;
}

export async function generateMetadata({ params }) {
  const { type } = await params;
  const labels = {
    school:     'School Dashboard',
    coaching:   'Coaching Dashboard',
    academy:    'Academy Dashboard',
    college:    'College Dashboard',
    university: 'University Dashboard',
    tuition_center: 'Tuition Center Dashboard',
  };
  return { title: labels[type] ?? 'Dashboard' };
}
