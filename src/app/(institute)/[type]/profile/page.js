import Profile from '@/components/profile/Profile';
import { notFound } from 'next/navigation';

const VALID_TYPES = ['school', 'coaching', 'academy', 'college', 'university'];

export async function generateStaticParams() {
  return VALID_TYPES.map((type) => ({ type }));
}

export default async function ProfilePage({ params }) {
  const { type } = await params;
  if (!VALID_TYPES.includes(type)) notFound();
  return <Profile type={type} />;
}

export async function generateMetadata() {
  return { title: 'My Profile' };
}
