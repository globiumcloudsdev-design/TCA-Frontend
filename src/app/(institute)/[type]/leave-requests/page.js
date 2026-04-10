import { notFound } from 'next/navigation';
import LeaveRequestPage from '@/components/pages/LeaveRequestPage';

const VALID_TYPES = ['school', 'coaching', 'academy', 'college', 'university', 'tuition_center'];

export async function generateStaticParams() {
  return VALID_TYPES.map((type) => ({ type }));
}

export default async function LeaveRequests({ params }) {
  const { type } = await params;
  if (!VALID_TYPES.includes(type)) notFound();
  return <LeaveRequestPage type={type} />;
}

export async function generateMetadata({ params }) {
  const { type } = await params;
  return { title: 'Leave Requests' };
}
