import AdminConsole from "../AdminConsole";
import { notFound } from "next/navigation";

export default async function AdminSectionPage({
  params,
}: {
  params: Promise<{ section: string }>;
}) {
  const { section } = await params;

  if (section.toLowerCase() === "media") {
    notFound();
  }

  return <AdminConsole section={section} />;
}
