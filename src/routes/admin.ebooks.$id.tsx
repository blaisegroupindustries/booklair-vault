import { createFileRoute } from "@tanstack/react-router";
import { EbookFormPanel } from "@/components/admin/EbookForm";

export const Route = createFileRoute("/admin/ebooks/$id")({
  component: EditEbookPage,
});

function EditEbookPage() {
  const { id } = Route.useParams();
  return <EbookFormPanel id={id} />;
}
