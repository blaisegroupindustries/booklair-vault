import { createFileRoute } from "@tanstack/react-router";
import { EbookFormPanel } from "@/components/admin/EbookForm";

export const Route = createFileRoute("/admin/ebooks/novo")({
  component: () => <EbookFormPanel />,
});
