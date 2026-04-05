import PortalShell from '@/components/portal/PortalShell';

export const metadata = {
  title: 'Student Portal — The Clouds Academy',
  description: 'View your attendance, fees, exam results and timetable.',
};

export default function StudentLayout({ children }) {
  return <PortalShell type="STUDENT">{children}</PortalShell>;
}
