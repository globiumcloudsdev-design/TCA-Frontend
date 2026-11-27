import { notFound } from 'next/navigation';
import SendNotificationPage from '@/components/notifications/SendNotificationPage';

const VALID_TYPES = ['school', 'coaching', 'academy', 'college', 'university'];
export async function generateStaticParams() {
  return VALID_TYPES.map((type) => ({ type }));
}
export default async function Notifications({ params }) {
  const { type } = await params;
  if (!VALID_TYPES.includes(type)) notFound();
  return <SendNotificationPage />;
}
export async function generateMetadata() {
  return { title: 'Send Notification' };
}
