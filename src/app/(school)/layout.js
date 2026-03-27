/**
 * (school) group layout
 * Applies: all /dashboard, /students, /teachers, /classes etc.
 */
import Sidebar            from '@/components/layout/Sidebar';
import Navbar             from '@/components/layout/Navbar';
import BranchInitializer  from '@/components/common/BranchInitializer';

export default function SchoolLayout({ children }) {
  return (
    <div className="flex h-screen overflow-hidden">
      <BranchInitializer />
      <Sidebar />
      <div className="flex flex-1 flex-col md:ml-64 overflow-hidden">
        <Navbar />
        <main className="flex-1 overflow-auto p-4 pt-[calc(4rem+1rem)] sm:p-6 sm:pt-[calc(4rem+1.5rem)]">
          {children}
        </main>
      </div>
    </div>
  );
}