import { notFound } from 'next/navigation';
import ProfitLossPage from '@/components/pages/ProfitLossPage';
import { INSTITUTE_TYPES } from '@/data/dummyData';

const VALID_TYPES = INSTITUTE_TYPES.map(t => t.value);

export async function generateStaticParams() {
  return VALID_TYPES.map((type) => ({ type }));
}

export default async function ProfitLossRoute({ params }) {
  const { type } = await params;
  if (!VALID_TYPES.includes(type)) notFound();

  return <ProfitLossPage type={type} />;
}

export async function generateMetadata({ params }) {
  const { type } = await params;
  const titles = {
    school: 'Profit & Loss',
    coaching: 'Profit & Loss',
    academy: 'Profit & Loss',
    college: 'Profit & Loss',
    university: 'Profit & Loss',
    tuition_center: 'Profit & Loss',
  };
  
  return { title: titles[type] ?? 'Profit & Loss' };
}
