/**
 * Root page — shows landing page for guests, redirects to dashboard for authenticated users.
 */
import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';
import LandingPage from '@/components/landing/LandingPage';

export default async function RootPage() {
  const cookieStore = await cookies();
  const token = cookieStore.get('access_token');
  // if (token) {
  //   redirect('/dashboard');
  // }
  return <LandingPage />;
}
