import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { MediaLibrary, type Bucket } from "@/components/admin/MediaLibrary";

export const Route = createFileRoute("/admin/midia")({
  component: MediaPage,
});

const TABS: { value: Bucket; label: string; accept: string }[] = [
  { value: "covers", label: "Capas (imagens)", accept: "image/*" },
  { value: "ebooks", label: "PDFs / Ebooks", accept: "application/pdf" },
  { value: "audio", label: "Áudio / Audiobooks", accept: "audio/*" },
];

function MediaPage() {
  const [tab, setTab] = useState<Bucket>("covers");
  const current = TABS.find((t) => t.value === tab)!;

  return (
    <div className="space-y-5">
      <div>
        <h2 className="font-serif text-2xl">Biblioteca de ficheiros</h2>
        <p className="text-sm text-muted-foreground">
          Carrega vários ficheiros de uma vez. Reutiliza-os em qualquer ebook sem voltar a fazer upload.
        </p>
      </div>

      <div className="flex flex-wrap gap-2">
        {TABS.map((t) => (
          <button
            key={t.value}
            onClick={() => setTab(t.value)}
            className={`px-3 py-1.5 text-xs rounded-md border transition-colors ${
              tab === t.value ? "bg-gold/15 text-gold border-gold/40" : "border-border text-muted-foreground hover:text-foreground"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      <MediaLibrary bucket={current.value} accept={current.accept} />
    </div>
  );
}
