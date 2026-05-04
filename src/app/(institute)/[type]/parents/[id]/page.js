import ParentDetailPage from "@/components/pages/ParentDetailPage";

export default async function Page({ params }) {
  const { id } = await params;
  return <ParentDetailPage id={id} />;
}

export async function generateMetadata({ params }) {
  const { id } = await params;
  return {
    title: `Parent Details - ${id}`,
    description: 'View parent profile and linked students',
  };
}
