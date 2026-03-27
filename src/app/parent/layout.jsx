import PortalShell from '@/components/portal/PortalShell';

export const metadata = {
  title: 'Parent Portal — The Clouds Academy',
  description: 'Monitor your child\'s attendance, fees, and academic performance.',
};

export default function ParentLayout({ children }) {
  return <PortalShell type="PARENT">{children}</PortalShell>;
}
