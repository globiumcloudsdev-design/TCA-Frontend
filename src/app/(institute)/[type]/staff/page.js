import { notFound } from 'next/navigation';
import StaffManagementPage from '@/components/pages/StaffPage';

const VALID_TYPES = ['school', 'coaching', 'academy', 'college', 'university', 'tution_center'];

export async function generateStaticParams() { 
  return VALID_TYPES.map((type) => ({ type })); 
}

export default async function StaffPage({ params }) {
  const { type } = await params;
  
  // Validate institute type
  if (!VALID_TYPES.includes(type)) {
    notFound();
  }
  
  // Pass type to the client component
  return <StaffManagementPage instituteType={type} />;
}

export async function generateMetadata({ params }) {
  const { type } = await params;
  const typeLabel = type.split('_').map(word => 
    word.charAt(0).toUpperCase() + word.slice(1)
  ).join(' ');
  
  return { 
    title: `${typeLabel} Staff Management`,
    description: `Manage staff members for your ${typeLabel}`
  };
}