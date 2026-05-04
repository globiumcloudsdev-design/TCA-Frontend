import StaffDetailPage from "@/components/pages/StaffDetailPage";

export async function generateMetadata({ params }) {
  const resolvedParams = await params;
  const { type } = resolvedParams;
  return {
    title: `Staff Details | ${type.charAt(0).toUpperCase() + type.slice(1)} Dashboard`,
    description: "View comprehensive staff profile, attendance records, and payroll history.",
  };
}

export default async function Page({ params }) {
  const resolvedParams = await params;
  const { type, id } = resolvedParams;
  return <StaffDetailPage type={type} id={id} />;
}
