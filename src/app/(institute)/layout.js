
//src/app/(institute)/layout.js
/**
 * (institute) route group — shared layout for all institute types
 * Handles: /school/*, /coaching/*, /academy/*, /college/*, /university/*
 *
 * This layout:
 *  1. Verifies access_token (redirect to /login if missing)
*  2. Checks user type from cookies
/**
 * (institute) route group — shared layout for all institute types
 * Handles: /school/*, /coaching/*, /academy/*, /college/*, /university/*
 *
 * This layout:
 *  1. Verifies access_token (redirect to /login if missing)
 *  2. Checks user type from cookies
 *  3. Redirects to correct portal if mismatch
 */
import { redirect } from 'next/navigation';
import { cookies, headers } from 'next/headers';
import InstituteLayoutWrapper from '@/components/layout/InstituteLayoutWrapper';

// Map user types to portal paths
const USER_TYPE_TO_PORTAL = {
  STUDENT: '/student',
  PARENT: '/parent',
  TEACHER: '/teacher',
  STAFF: null, // Staff stays in institute area
};

export default async function InstituteGroupLayout({ children }) {
  const cookieStore = await cookies();
  
  // Check authentication
  const token = cookieStore.get('access_token')?.value;
  if (!token) redirect('/login');

  // Get user type from cookie
  const userType = cookieStore.get('user_type')?.value;
  const instituteType = cookieStore.get('institute_type')?.value || 'school';

  // Get current path
  const headersList = await headers();
  const pathname = headersList.get('x-pathname') || '';
  const pathSegments = pathname.split('/');
  const currentInstituteType = pathSegments[1];

  console.log('🔍 Institute Layout Check:', {
    userType,
    instituteType,
    currentInstituteType,
    pathname
  });

  // CASE 1: User is STUDENT, PARENT, or TEACHER - they belong in portal
  if (userType && userType !== 'STAFF') {
    const portalPath = USER_TYPE_TO_PORTAL[userType];
    if (portalPath && !pathname.startsWith(portalPath)) {
      console.log(`🔄 Redirecting ${userType} to portal: ${portalPath}`);
      redirect(portalPath);
    }
  }

  // CASE 2: User is STAFF but trying to access wrong institute type
  if (userType === 'STAFF' && currentInstituteType !== instituteType) {
    const correctPath = `/${instituteType}/dashboard`;
    console.log(`🔄 Redirecting staff to correct institute: ${correctPath}`);
    redirect(correctPath);
  }

  // CASE 3: Valid staff access
  return <InstituteLayoutWrapper>{children}</InstituteLayoutWrapper>;
}

// Add this to your headers middleware or layout
export async function generateMetadata() {
  return {
    title: {
      template: '%s | The Clouds Academy',
      default: 'Dashboard | The Clouds Academy',
    },
  };
}



