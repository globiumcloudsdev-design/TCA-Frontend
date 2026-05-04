import TeacherDetailPage from "@/components/pages/TeacherDetailPage";

export async function generateMetadata({ params }) {
  const resolvedParams = await params;
  const { type } = resolvedParams;
  return {
    title: `Teacher Details | ${type?.charAt(0).toUpperCase() + type?.slice(1)}`,
    description: "View comprehensive teacher profile, timetable, attendance, and payroll records.",
  };
}

export default async function Page({ params }) {
  const resolvedParams = await params;
  const { type, id } = resolvedParams;
  return <TeacherDetailPage type={type} id={id} />;
}
