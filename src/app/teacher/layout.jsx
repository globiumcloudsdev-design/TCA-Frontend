import PortalShell from '@/components/portal/PortalShell';

export const metadata = { title: 'Teacher Portal – The Clouds Academy' };

export default function TeacherLayout({ children }) {
  return <PortalShell type="TEACHER">{children}</PortalShell>;
}
