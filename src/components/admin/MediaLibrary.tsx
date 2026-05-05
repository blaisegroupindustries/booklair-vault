import { useEffect, useState, useRef } from "react";
import { Upload, Trash2, Search, Copy, Check, Image as ImageIcon, FileAudio, FileText, X } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export type Bucket = "covers" | "ebooks" | "audio";

interface FileItem {
  name: string;
  id?: string | null;
  updated_at?: string | null;
  metadata?: Record<string, unknown> | null;
}

interface Props {
  bucket: Bucket;
  onPick?: (value: { name: string; publicUrl: string | null }) => void;
  pickLabel?: string;
  accept?: string; // file input accept
  embedded?: boolean; // render inside another panel
}

const ICONS: Record<Bucket, typeof ImageIcon> = {
  covers: ImageIcon,
  ebooks: FileText,
  audio: FileAudio,
};

export function MediaLibrary({ bucket, onPick, pickLabel = "Usar este ficheiro", accept, embedded }: Props) {
  const [items, setItems] = useState<FileItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState("");
  const [uploading, setUploading] = useState(false);
  const [copied, setCopied] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const Icon = ICONS[bucket];
  const isPublic = bucket === "covers";

  const load = async () => {
    setLoading(true);
    const { data, error } = await supabase.storage.from(bucket).list("", {
      limit: 500,
      sortBy: { column: "created_at", order: "desc" },
    });
    if (error) toast.error(error.message);
    setItems((data ?? []).filter((f) => f.name && !f.name.endsWith("/")));
    setLoading(false);
  };

  useEffect(() => { load(); }, [bucket]);

  const handleUpload = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    setUploading(true);
    let ok = 0, fail = 0;
    for (const file of Array.from(files)) {
      const ext = file.name.split(".").pop();
      const base = file.name.replace(/\.[^.]+$/, "").toLowerCase().replace(/[^a-z0-9]+/g, "-").slice(0, 60);
      const path = `${Date.now()}-${base}.${ext}`;
      const { error } = await supabase.storage.from(bucket).upload(path, file, { upsert: false });
      if (error) fail++; else ok++;
    }
    setUploading(false);
    if (ok) toast.success(`${ok} ficheiro(s) carregados`);
    if (fail) toast.error(`${fail} falharam`);
    await load();
  };

  const remove = async (name: string) => {
    if (!confirm(`Eliminar "${name}"?`)) return;
    const { error } = await supabase.storage.from(bucket).remove([name]);
    if (error) toast.error(error.message);
    else { toast.success("Eliminado"); load(); }
  };

  const getUrl = (name: string) =>
    isPublic ? supabase.storage.from(bucket).getPublicUrl(name).data.publicUrl : null;

  const copyUrl = async (name: string) => {
    const url = getUrl(name) ?? name;
    await navigator.clipboard.writeText(url);
    setCopied(name);
    setTimeout(() => setCopied(null), 1500);
  };

  const filtered = items.filter((f) => !q || f.name.toLowerCase().includes(q.toLowerCase()));

  return (
    <div className={embedded ? "" : "space-y-4"}>
      <div className="flex flex-wrap gap-2 items-center">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Pesquisar ficheiros…" className="pl-9 h-9" />
        </div>
        <input
          ref={inputRef}
          type="file"
          multiple
          accept={accept}
          className="hidden"
          onChange={(e) => { handleUpload(e.target.files); if (inputRef.current) inputRef.current.value = ""; }}
        />
        <Button type="button" variant="gold" size="sm" disabled={uploading} onClick={() => inputRef.current?.click()}>
          <Upload className="h-4 w-4" /> {uploading ? "A carregar…" : "Carregar (vários)"}
        </Button>
      </div>

      {loading ? (
        <div className="text-center py-8 text-sm text-muted-foreground">A carregar…</div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-10 text-sm text-muted-foreground border border-dashed border-border rounded-xl">
          Sem ficheiros. Carrega um ou mais para começar.
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 max-h-[460px] overflow-y-auto pr-1">
          {filtered.map((f) => {
            const url = getUrl(f.name);
            return (
              <div key={f.name} className="surface-card rounded-lg overflow-hidden flex flex-col text-xs">
                <div className="aspect-square bg-muted flex items-center justify-center relative">
                  {bucket === "covers" && url ? (
                    <img src={url} alt={f.name} loading="lazy" className="h-full w-full object-cover" />
                  ) : (
                    <Icon className="h-10 w-10 text-muted-foreground/40" />
                  )}
                </div>
                <div className="p-2 flex flex-col gap-1.5">
                  <div className="truncate font-medium text-foreground" title={f.name}>{f.name}</div>
                  <div className="flex items-center gap-1">
                    {onPick && (
                      <button
                        type="button"
                        onClick={() => onPick({ name: f.name, publicUrl: url })}
                        className="flex-1 px-2 py-1 rounded bg-gold/15 text-gold text-[10px] uppercase tracking-wider hover:bg-gold/25"
                      >
                        {pickLabel}
                      </button>
                    )}
                    <button type="button" onClick={() => copyUrl(f.name)} className="p-1.5 rounded hover:bg-accent" title="Copiar nome/URL">
                      {copied === f.name ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
                    </button>
                    <button type="button" onClick={() => remove(f.name)} className="p-1.5 rounded hover:bg-accent text-rose-400" title="Eliminar">
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export function MediaLibraryDialog({
  open, onClose, bucket, accept, onPick,
}: {
  open: boolean;
  onClose: () => void;
  bucket: Bucket;
  accept?: string;
  onPick: (value: { name: string; publicUrl: string | null }) => void;
}) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4" onClick={onClose}>
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />
      <div
        className="relative surface-card rounded-2xl w-full max-w-4xl max-h-[85vh] overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between p-4 border-b border-border">
          <div>
            <h3 className="font-serif text-lg">Biblioteca · {bucket}</h3>
            <p className="text-[11px] text-muted-foreground mt-0.5">Carrega vários ficheiros e clica em "Usar este ficheiro" para anexar ao formulário.</p>
          </div>
          <button onClick={onClose} className="p-1 rounded hover:bg-accent"><X className="h-5 w-5" /></button>
        </div>
        <div className="p-4 overflow-y-auto">
          <MediaLibrary
            bucket={bucket}
            accept={accept}
            embedded
            onPick={(v) => { onPick(v); onClose(); }}
          />
        </div>
      </div>
    </div>
  );
}
