'use client';
/**
 * Dashboard Page — adapts dynamically via shared DashboardPage component
 */
import DashboardPage from '@/components/pages/DashboardPage';

export default function SchoolDashboardRoute() {
  return <DashboardPage type="school" />;
}

