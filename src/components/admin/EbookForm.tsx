import { useEffect, useState, type FormEvent } from "react";
import { useNavigate } from "@tanstack/react-router";
import { Upload, Trash2, X, Plus, FolderOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { slugify, CATEGORY_OPTIONS, STATUS_OPTIONS } from "@/lib/ebook-helpers";
import { EbookCover } from "@/components/EbookCover";
import { MediaLibraryDialog, type Bucket } from "@/components/admin/MediaLibrary";

interface EbookForm {
  id?: string;
  title: string;
  slug: string;
  description: string;
  author: string;
  author_bio: string;
  author_avatar_url: string;
  category: string;
  type: "free" | "premium";
  status: "draft" | "scheduled" | "published" | "archived";
  scheduled_at: string;
  price_usd: string;
  price_mzn: string;
  sale_price_usd: string;
  sale_price_mzn: string;
  sale_starts_at: string;
  sale_ends_at: string;
  free_until: string;
  cover_url: string;
  cover_type: "image" | "text";
  cover_text_title: string;
  cover_text_subtitle: string;
  cover_bg_color: string;
  cover_text_color: string;
  cover_gradient: string;
  pdf_path_pt: string;
  pdf_path_en: string;
  audio_path_pt: string;
  audio_path_en: string;
  preview_pdf_path: string;
  preview_audio_path: string;
  available_languages: string[];
  available_formats: string[];
  pages: string;
  language: string;
  isbn: string;
  publisher: string;
  publication_year: string;
  narrator: string;
  audio_duration_seconds: string;
  tags: string[];
  featured: boolean;
  published: boolean;
  author_social_instagram: string;
  author_social_twitter: string;
  author_social_linkedin: string;
  author_social_website: string;
}

const DEFAULT: EbookForm = {
  title: "", slug: "", description: "", author: "", author_bio: "", author_avatar_url: "",
  category: "marketing_negocios", type: "free", status: "draft", scheduled_at: "",
  price_usd: "", price_mzn: "", sale_price_usd: "", sale_price_mzn: "",
  sale_starts_at: "", sale_ends_at: "", free_until: "",
  cover_url: "", cover_type: "image", cover_text_title: "", cover_text_subtitle: "",
  cover_bg_color: "", cover_text_color: "#f4d27a",
  cover_gradient: "linear-gradient(135deg, #2a1a4e 0%, #1a0a2e 100%)",
  pdf_path_pt: "", pdf_path_en: "", audio_path_pt: "", audio_path_en: "",
  preview_pdf_path: "", preview_audio_path: "",
  available_languages: ["pt"], available_formats: ["pdf"],
  pages: "", language: "pt", isbn: "", publisher: "", publication_year: "",
  narrator: "", audio_duration_seconds: "",
  tags: [], featured: false, published: false,
  author_social_instagram: "", author_social_twitter: "", author_social_linkedin: "", author_social_website: "",
};

export function EbookFormPanel({ id }: { id?: string }) {
  const navigate = useNavigate();
  const [form, setForm] = useState<EbookForm>(DEFAULT);
  const [loading, setLoading] = useState(!!id);
  const [saving, setSaving] = useState(false);
  const [tagInput, setTagInput] = useState("");
  const [library, setLibrary] = useState<{ bucket: Bucket; field: keyof EbookForm; accept?: string } | null>(null);

  useEffect(() => {
    if (!id) return;
    (async () => {
      const { data, error } = await supabase.from("ebooks").select("*").eq("id", id).single();
      if (error || !data) { toast.error("Não foi possível carregar"); return; }
      const social = (data.author_social_links ?? {}) as Record<string, string>;
      setForm({
        id: data.id,
        title: data.title ?? "",
        slug: data.slug ?? "",
        description: data.description ?? "",
        author: data.author ?? "",
        author_bio: data.author_bio ?? "",
        author_avatar_url: data.author_avatar_url ?? "",
        category: data.category ?? "marketing_negocios",
        type: data.type ?? "free",
        status: data.status ?? "draft",
        scheduled_at: data.scheduled_at ? data.scheduled_at.slice(0, 16) : "",
        price_usd: data.price_usd?.toString() ?? "",
        price_mzn: data.price_mzn?.toString() ?? "",
        sale_price_usd: data.sale_price_usd?.toString() ?? "",
        sale_price_mzn: data.sale_price_mzn?.toString() ?? "",
        sale_starts_at: data.sale_starts_at ? data.sale_starts_at.slice(0, 16) : "",
        sale_ends_at: data.sale_ends_at ? data.sale_ends_at.slice(0, 16) : "",
        free_until: data.free_until ? data.free_until.slice(0, 16) : "",
        cover_url: data.cover_url ?? "",
        cover_type: (data.cover_type ?? "image") as "image" | "text",
        cover_text_title: data.cover_text_title ?? "",
        cover_text_subtitle: data.cover_text_subtitle ?? "",
        cover_bg_color: data.cover_bg_color ?? "",
        cover_text_color: data.cover_text_color ?? "#f4d27a",
        cover_gradient: data.cover_gradient ?? "linear-gradient(135deg, #2a1a4e 0%, #1a0a2e 100%)",
        pdf_path_pt: data.pdf_path_pt ?? "",
        pdf_path_en: data.pdf_path_en ?? "",
        audio_path_pt: data.audio_path_pt ?? "",
        audio_path_en: data.audio_path_en ?? "",
        preview_pdf_path: data.preview_pdf_path ?? "",
        preview_audio_path: data.preview_audio_path ?? "",
        available_languages: data.available_languages ?? ["pt"],
        available_formats: data.available_formats ?? ["pdf"],
        pages: data.pages?.toString() ?? "",
        language: data.language ?? "pt",
        isbn: data.isbn ?? "",
        publisher: data.publisher ?? "",
        publication_year: data.publication_year?.toString() ?? "",
        narrator: data.narrator ?? "",
        audio_duration_seconds: data.audio_duration_seconds?.toString() ?? "",
        tags: data.tags ?? [],
        featured: data.featured ?? false,
        published: data.published ?? false,
        author_social_instagram: social.instagram ?? "",
        author_social_twitter: social.twitter ?? "",
        author_social_linkedin: social.linkedin ?? "",
        author_social_website: social.website ?? "",
      });
      setLoading(false);
    })();
  }, [id]);

  const update = <K extends keyof EbookForm>(k: K, v: EbookForm[K]) => setForm((f) => ({ ...f, [k]: v }));

  // Auto-slug from title
  useEffect(() => {
    if (!id && form.title && !form.slug) update("slug", slugify(form.title));
  }, [form.title]); // eslint-disable-line

  const uploadCover = async (file: File) => {
    const ext = file.name.split(".").pop();
    const path = `${Date.now()}-${slugify(form.title || "cover")}.${ext}`;
    const { error } = await supabase.storage.from("covers").upload(path, file, { upsert: true });
    if (error) { toast.error("Erro upload capa: " + error.message); return; }
    const { data: pub } = supabase.storage.from("covers").getPublicUrl(path);
    update("cover_url", pub.publicUrl);
    update("cover_type", "image");
    toast.success("Capa carregada");
  };

  const uploadFile = async (
    file: File,
    bucket: "ebooks" | "audio",
    field: keyof EbookForm,
  ) => {
    const ext = file.name.split(".").pop();
    const path = `${Date.now()}-${slugify(form.title || "file")}-${field}.${ext}`;
    const { error } = await supabase.storage.from(bucket).upload(path, file, { upsert: true });
    if (error) { toast.error(`Erro upload: ${error.message}`); return; }
    update(field, path as never);
    toast.success("Ficheiro carregado");
  };

  const toggleArr = (key: "available_languages" | "available_formats", val: string) => {
    const cur = form[key];
    update(key, cur.includes(val) ? cur.filter((x) => x !== val) : [...cur, val]);
  };

  const addTag = () => {
    const v = tagInput.trim();
    if (!v || form.tags.includes(v)) return;
    update("tags", [...form.tags, v]);
    setTagInput("");
  };

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!form.title || !form.slug || !form.category) {
      toast.error("Título, slug e categoria são obrigatórios");
      return;
    }
    setSaving(true);

    const social: Record<string, string> = {};
    if (form.author_social_instagram) social.instagram = form.author_social_instagram;
    if (form.author_social_twitter) social.twitter = form.author_social_twitter;
    if (form.author_social_linkedin) social.linkedin = form.author_social_linkedin;
    if (form.author_social_website) social.website = form.author_social_website;

    const payload = {
      title: form.title,
      slug: form.slug,
      description: form.description || null,
      author: form.author || null,
      author_bio: form.author_bio || null,
      author_avatar_url: form.author_avatar_url || null,
      author_social_links: social,
      category: form.category as "marketing_negocios" | "educacao_estudo" | "desenvolvimento_pessoal",
      type: form.type,
      status: form.status,
      scheduled_at: form.scheduled_at || null,
      price_usd: form.price_usd ? Number(form.price_usd) : 0,
      price_mzn: form.price_mzn ? Number(form.price_mzn) : 0,
      sale_price_usd: form.sale_price_usd ? Number(form.sale_price_usd) : null,
      sale_price_mzn: form.sale_price_mzn ? Number(form.sale_price_mzn) : null,
      sale_starts_at: form.sale_starts_at || null,
      sale_ends_at: form.sale_ends_at || null,
      free_until: form.free_until || null,
      cover_url: form.cover_url || null,
      cover_type: form.cover_type,
      cover_text_title: form.cover_text_title || null,
      cover_text_subtitle: form.cover_text_subtitle || null,
      cover_bg_color: form.cover_bg_color || null,
      cover_text_color: form.cover_text_color || null,
      cover_gradient: form.cover_gradient || null,
      pdf_path: form.pdf_path_pt || form.pdf_path_en || null, // legacy fallback
      pdf_path_pt: form.pdf_path_pt || null,
      pdf_path_en: form.pdf_path_en || null,
      audio_path_pt: form.audio_path_pt || null,
      audio_path_en: form.audio_path_en || null,
      preview_pdf_path: form.preview_pdf_path || null,
      preview_audio_path: form.preview_audio_path || null,
      available_languages: form.available_languages,
      available_formats: form.available_formats,
      pages: form.pages ? Number(form.pages) : null,
      language: form.language,
      isbn: form.isbn || null,
      publisher: form.publisher || null,
      publication_year: form.publication_year ? Number(form.publication_year) : null,
      narrator: form.narrator || null,
      audio_duration_seconds: form.audio_duration_seconds ? Number(form.audio_duration_seconds) : null,
      tags: form.tags,
      featured: form.featured,
      published: form.status === "published",
      published_at: form.status === "published" ? new Date().toISOString() : null,
    };

    const res = id
      ? await supabase.from("ebooks").update(payload).eq("id", id)
      : await supabase.from("ebooks").insert(payload);

    setSaving(false);
    if (res.error) { toast.error(res.error.message); return; }
    toast.success(id ? "Atualizado" : "Criado");
    navigate({ to: "/admin/ebooks" });
  };

  if (loading) return <div className="text-center py-10 text-muted-foreground">A carregar…</div>;

  return (
    <form onSubmit={onSubmit} className="space-y-6">
      <div className="flex items-center justify-between gap-3">
        <h2 className="font-serif text-2xl">{id ? "Editar ebook" : "Novo ebook"}</h2>
        <div className="flex items-center gap-2">
          <Button type="button" variant="outline" onClick={() => navigate({ to: "/admin/ebooks" })}>Cancelar</Button>
          <Button type="submit" variant="gold" disabled={saving}>{saving ? "A guardar…" : "Guardar"}</Button>
        </div>
      </div>

      <Tabs defaultValue="info" className="w-full">
        <TabsList className="flex flex-wrap gap-1 h-auto bg-transparent p-0">
          {[
            ["info", "Info"],
            ["cover", "Capa"],
            ["files", "Ficheiros"],
            ["pricing", "Preços & Promo"],
            ["meta", "Metadados"],
            ["author", "Autor"],
          ].map(([v, l]) => (
            <TabsTrigger key={v} value={v} className="data-[state=active]:bg-gold data-[state=active]:text-gold-foreground">{l}</TabsTrigger>
          ))}
        </TabsList>

        {/* INFO */}
        <TabsContent value="info" className="space-y-4 mt-6">
          <div className="grid md:grid-cols-2 gap-4">
            <Field label="Título *">
              <Input value={form.title} onChange={(e) => update("title", e.target.value)} required />
            </Field>
            <Field label="Slug *" hint="URL: /ebook/<slug>">
              <Input value={form.slug} onChange={(e) => update("slug", slugify(e.target.value))} required />
            </Field>
          </div>
          <Field label="Descrição">
            <Textarea rows={5} value={form.description} onChange={(e) => update("description", e.target.value)} />
          </Field>
          <div className="grid md:grid-cols-3 gap-4">
            <Field label="Categoria *">
              <select className="w-full h-9 rounded-md border border-input bg-transparent px-3 text-sm" value={form.category} onChange={(e) => update("category", e.target.value)}>
                {CATEGORY_OPTIONS.map((c) => <option key={c.value} value={c.value}>{c.label_pt}</option>)}
              </select>
            </Field>
            <Field label="Tipo">
              <select className="w-full h-9 rounded-md border border-input bg-transparent px-3 text-sm" value={form.type} onChange={(e) => update("type", e.target.value as "free" | "premium")}>
                <option value="free">Grátis</option>
                <option value="premium">Premium (pago)</option>
              </select>
            </Field>
            <Field label="Estado">
              <select className="w-full h-9 rounded-md border border-input bg-transparent px-3 text-sm" value={form.status} onChange={(e) => update("status", e.target.value as EbookForm["status"])}>
                {STATUS_OPTIONS.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
              </select>
            </Field>
          </div>
          {form.status === "scheduled" && (
            <Field label="Agendar para">
              <Input type="datetime-local" value={form.scheduled_at} onChange={(e) => update("scheduled_at", e.target.value)} />
            </Field>
          )}
          <div className="flex items-center gap-6">
            <label className="flex items-center gap-2 text-sm">
              <Switch checked={form.featured} onCheckedChange={(v) => update("featured", v)} /> Destacar na home
            </label>
          </div>
        </TabsContent>

        {/* COVER */}
        <TabsContent value="cover" className="space-y-4 mt-6">
          <div className="flex gap-2 mb-2">
            <button type="button" onClick={() => update("cover_type", "image")} className={`px-3 py-1.5 text-xs rounded-md border ${form.cover_type === "image" ? "bg-gold/15 text-gold border-gold/40" : "border-border"}`}>Capa por imagem</button>
            <button type="button" onClick={() => update("cover_type", "text")} className={`px-3 py-1.5 text-xs rounded-md border ${form.cover_type === "text" ? "bg-gold/15 text-gold border-gold/40" : "border-border"}`}>Capa por texto</button>
          </div>

          <div className="grid md:grid-cols-[300px_1fr] gap-6">
            <div className="aspect-[3/4] surface-card rounded-2xl overflow-hidden">
              <EbookCover ebook={{ title: form.title || "Título", author: form.author, cover_type: form.cover_type, cover_url: form.cover_url, cover_text_title: form.cover_text_title, cover_text_subtitle: form.cover_text_subtitle, cover_bg_color: form.cover_bg_color, cover_text_color: form.cover_text_color, cover_gradient: form.cover_gradient }} />
            </div>
            <div className="space-y-4">
              {form.cover_type === "image" ? (
                <>
                  <div className="flex flex-wrap gap-2">
                    <FileUpload accept="image/*" label="Carregar imagem" onFile={uploadCover} />
                    <button type="button" onClick={() => setLibrary({ bucket: "covers", field: "cover_url", accept: "image/*" })} className="flex items-center gap-2 px-4 py-2 rounded-lg border border-border hover:border-gold/40 text-sm">
                      <FolderOpen className="h-4 w-4" /> Escolher da biblioteca
                    </button>
                  </div>
                  {form.cover_url && (
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <span className="truncate flex-1">{form.cover_url}</span>
                      <button type="button" onClick={() => update("cover_url", "")} className="text-rose-400"><X className="h-4 w-4" /></button>
                    </div>
                  )}
                  <Field label="Ou cola URL de imagem">
                    <Input value={form.cover_url} onChange={(e) => update("cover_url", e.target.value)} placeholder="https://…" />
                  </Field>
                </>
              ) : (
                <>
                  <Field label="Título da capa"><Input value={form.cover_text_title} onChange={(e) => update("cover_text_title", e.target.value)} placeholder={form.title} /></Field>
                  <Field label="Subtítulo / etiqueta"><Input value={form.cover_text_subtitle} onChange={(e) => update("cover_text_subtitle", e.target.value)} placeholder="ex: Edição Especial" /></Field>
                  <div className="grid grid-cols-2 gap-3">
                    <Field label="Cor do texto"><Input type="color" value={form.cover_text_color} onChange={(e) => update("cover_text_color", e.target.value)} /></Field>
                    <Field label="Cor de fundo (sólida)"><Input type="color" value={form.cover_bg_color || "#1a1a2e"} onChange={(e) => { update("cover_bg_color", e.target.value); update("cover_gradient", ""); }} /></Field>
                  </div>
                  <Field label="Ou gradiente CSS" hint="Sobrepõe a cor de fundo">
                    <Input value={form.cover_gradient} onChange={(e) => update("cover_gradient", e.target.value)} placeholder="linear-gradient(135deg, #..., #...)" />
                  </Field>
                </>
              )}
            </div>
          </div>
        </TabsContent>

        {/* FILES */}
        <TabsContent value="files" className="space-y-4 mt-6">
          <p className="text-xs text-muted-foreground">Carrega ou escolhe da biblioteca de ficheiros já carregados.</p>

          <div className="grid md:grid-cols-2 gap-4">
            <FilePathField label="PDF — Português" path={form.pdf_path_pt} bucket="ebooks" accept="application/pdf" onUpload={(f) => uploadFile(f, "ebooks", "pdf_path_pt")} onClear={() => update("pdf_path_pt", "")} onPickLibrary={() => setLibrary({ bucket: "ebooks", field: "pdf_path_pt", accept: "application/pdf" })} />
            <FilePathField label="PDF — Inglês" path={form.pdf_path_en} bucket="ebooks" accept="application/pdf" onUpload={(f) => uploadFile(f, "ebooks", "pdf_path_en")} onClear={() => update("pdf_path_en", "")} onPickLibrary={() => setLibrary({ bucket: "ebooks", field: "pdf_path_en", accept: "application/pdf" })} />
            <FilePathField label="Áudio — Português" path={form.audio_path_pt} bucket="audio" accept="audio/*" onUpload={(f) => uploadFile(f, "audio", "audio_path_pt")} onClear={() => update("audio_path_pt", "")} onPickLibrary={() => setLibrary({ bucket: "audio", field: "audio_path_pt", accept: "audio/*" })} />
            <FilePathField label="Áudio — Inglês" path={form.audio_path_en} bucket="audio" accept="audio/*" onUpload={(f) => uploadFile(f, "audio", "audio_path_en")} onClear={() => update("audio_path_en", "")} onPickLibrary={() => setLibrary({ bucket: "audio", field: "audio_path_en", accept: "audio/*" })} />
            <FilePathField label="Preview PDF (amostra grátis)" path={form.preview_pdf_path} bucket="ebooks" accept="application/pdf" onUpload={(f) => uploadFile(f, "ebooks", "preview_pdf_path")} onClear={() => update("preview_pdf_path", "")} onPickLibrary={() => setLibrary({ bucket: "ebooks", field: "preview_pdf_path", accept: "application/pdf" })} />
            <FilePathField label="Preview áudio (30s)" path={form.preview_audio_path} bucket="audio" accept="audio/*" onUpload={(f) => uploadFile(f, "audio", "preview_audio_path")} onClear={() => update("preview_audio_path", "")} onPickLibrary={() => setLibrary({ bucket: "audio", field: "preview_audio_path", accept: "audio/*" })} />
          </div>

          <div className="grid md:grid-cols-2 gap-6 pt-4 border-t border-border/50">
            <div>
              <Label className="text-xs uppercase tracking-wider text-muted-foreground">Idiomas disponíveis</Label>
              <div className="flex gap-2 mt-2">
                {[["pt", "Português"], ["en", "Inglês"]].map(([v, l]) => (
                  <button type="button" key={v} onClick={() => toggleArr("available_languages", v)} className={`px-3 py-1.5 text-xs rounded-md border ${form.available_languages.includes(v) ? "bg-gold/15 text-gold border-gold/40" : "border-border"}`}>{l}</button>
                ))}
              </div>
            </div>
            <div>
              <Label className="text-xs uppercase tracking-wider text-muted-foreground">Formatos disponíveis</Label>
              <div className="flex gap-2 mt-2">
                {[["pdf", "PDF"], ["audio", "Audiobook"]].map(([v, l]) => (
                  <button type="button" key={v} onClick={() => toggleArr("available_formats", v)} className={`px-3 py-1.5 text-xs rounded-md border ${form.available_formats.includes(v) ? "bg-gold/15 text-gold border-gold/40" : "border-border"}`}>{l}</button>
                ))}
              </div>
            </div>
          </div>
        </TabsContent>

        {/* PRICING */}
        <TabsContent value="pricing" className="space-y-6 mt-6">
          <div>
            <h3 className="text-sm font-semibold mb-3">Preço normal (apenas para tipo Premium)</h3>
            <div className="grid grid-cols-2 gap-4">
              <Field label="USD"><Input type="number" step="0.01" value={form.price_usd} onChange={(e) => update("price_usd", e.target.value)} /></Field>
              <Field label="MZN"><Input type="number" step="1" value={form.price_mzn} onChange={(e) => update("price_mzn", e.target.value)} /></Field>
            </div>
          </div>
          <div className="border-t border-border/50 pt-6">
            <h3 className="text-sm font-semibold mb-3">Promoção</h3>
            <div className="grid grid-cols-2 gap-4 mb-3">
              <Field label="Preço promo USD"><Input type="number" step="0.01" value={form.sale_price_usd} onChange={(e) => update("sale_price_usd", e.target.value)} /></Field>
              <Field label="Preço promo MZN"><Input type="number" step="1" value={form.sale_price_mzn} onChange={(e) => update("sale_price_mzn", e.target.value)} /></Field>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <Field label="Início"><Input type="datetime-local" value={form.sale_starts_at} onChange={(e) => update("sale_starts_at", e.target.value)} /></Field>
              <Field label="Fim"><Input type="datetime-local" value={form.sale_ends_at} onChange={(e) => update("sale_ends_at", e.target.value)} /></Field>
            </div>
          </div>
          <div className="border-t border-border/50 pt-6">
            <h3 className="text-sm font-semibold mb-1">Grátis por tempo limitado</h3>
            <p className="text-xs text-muted-foreground mb-3">Torna o ebook grátis até esta data. Depois volta ao preço normal automaticamente.</p>
            <Field label="Grátis até"><Input type="datetime-local" value={form.free_until} onChange={(e) => update("free_until", e.target.value)} /></Field>
          </div>
        </TabsContent>

        {/* META */}
        <TabsContent value="meta" className="space-y-4 mt-6">
          <div className="grid md:grid-cols-3 gap-4">
            <Field label="Páginas"><Input type="number" value={form.pages} onChange={(e) => update("pages", e.target.value)} /></Field>
            <Field label="ISBN"><Input value={form.isbn} onChange={(e) => update("isbn", e.target.value)} /></Field>
            <Field label="Ano"><Input type="number" value={form.publication_year} onChange={(e) => update("publication_year", e.target.value)} /></Field>
            <Field label="Editora"><Input value={form.publisher} onChange={(e) => update("publisher", e.target.value)} /></Field>
            <Field label="Narrador (audiobook)"><Input value={form.narrator} onChange={(e) => update("narrator", e.target.value)} /></Field>
            <Field label="Duração áudio (segundos)"><Input type="number" value={form.audio_duration_seconds} onChange={(e) => update("audio_duration_seconds", e.target.value)} /></Field>
          </div>
          <Field label="Tags">
            <div className="flex gap-2">
              <Input value={tagInput} onChange={(e) => setTagInput(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addTag(); } }} placeholder="Adicionar tag e Enter" />
              <Button type="button" variant="outline" onClick={addTag}><Plus className="h-4 w-4" /></Button>
            </div>
            {form.tags.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mt-2">
                {form.tags.map((t) => (
                  <span key={t} className="inline-flex items-center gap-1 px-2 py-0.5 text-xs rounded-full bg-gold/10 text-gold border border-gold/30">
                    {t} <button type="button" onClick={() => update("tags", form.tags.filter((x) => x !== t))}><X className="h-3 w-3" /></button>
                  </span>
                ))}
              </div>
            )}
          </Field>
        </TabsContent>

        {/* AUTHOR */}
        <TabsContent value="author" className="space-y-4 mt-6">
          <Field label="Nome do autor"><Input value={form.author} onChange={(e) => update("author", e.target.value)} /></Field>
          <Field label="Bio"><Textarea rows={4} value={form.author_bio} onChange={(e) => update("author_bio", e.target.value)} /></Field>
          <Field label="URL do avatar"><Input value={form.author_avatar_url} onChange={(e) => update("author_avatar_url", e.target.value)} placeholder="https://…" /></Field>
          <div className="grid md:grid-cols-2 gap-4 pt-4 border-t border-border/50">
            <Field label="Instagram (@user ou URL)"><Input value={form.author_social_instagram} onChange={(e) => update("author_social_instagram", e.target.value)} /></Field>
            <Field label="Twitter/X"><Input value={form.author_social_twitter} onChange={(e) => update("author_social_twitter", e.target.value)} /></Field>
            <Field label="LinkedIn"><Input value={form.author_social_linkedin} onChange={(e) => update("author_social_linkedin", e.target.value)} /></Field>
            <Field label="Website"><Input value={form.author_social_website} onChange={(e) => update("author_social_website", e.target.value)} /></Field>
          </div>
        </TabsContent>
      </Tabs>

      {library && (
        <MediaLibraryDialog
          open
          onClose={() => setLibrary(null)}
          bucket={library.bucket}
          accept={library.accept}
          onPick={({ name, publicUrl }) => {
            const value = library.bucket === "covers" ? (publicUrl ?? name) : name;
            update(library.field, value as never);
            if (library.field === "cover_url") update("cover_type", "image");
            toast.success("Ficheiro selecionado");
          }}
        />
      )}
    </form>
  );
}

function Field({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <Label className="text-xs uppercase tracking-wider text-muted-foreground">{label}</Label>
      {children}
      {hint && <p className="text-[11px] text-muted-foreground">{hint}</p>}
    </div>
  );
}

function FileUpload({ label, accept, onFile }: { label: string; accept: string; onFile: (f: File) => void }) {
  return (
    <label className="flex items-center justify-center gap-2 px-4 py-3 rounded-lg border border-dashed border-border hover:border-gold/40 cursor-pointer transition-colors text-sm text-muted-foreground">
      <Upload className="h-4 w-4" /> {label}
      <input type="file" accept={accept} className="hidden" onChange={(e) => { const f = e.target.files?.[0]; if (f) onFile(f); e.target.value = ""; }} />
    </label>
  );
}

function FilePathField({
  label, path, onUpload, accept, onClear, onPickLibrary,
}: {
  label: string; path: string; bucket: Bucket;
  onUpload: (f: File) => void; accept: string; onClear: () => void;
  onPickLibrary: () => void;
}) {
  return (
    <div className="surface-card rounded-lg p-3">
      <p className="text-xs uppercase tracking-wider text-muted-foreground mb-2">{label}</p>
      {path ? (
        <div className="flex items-center gap-2 text-xs">
          <span className="truncate flex-1 text-foreground">{path}</span>
          <button type="button" onClick={onPickLibrary} className="text-muted-foreground p-1 hover:text-gold" title="Trocar da biblioteca"><FolderOpen className="h-3.5 w-3.5" /></button>
          <button type="button" onClick={onClear} className="text-rose-400 p-1"><Trash2 className="h-3.5 w-3.5" /></button>
        </div>
      ) : (
        <div className="flex flex-col gap-1.5">
          <label className="flex items-center justify-center gap-2 px-3 py-2 rounded-md border border-dashed border-border hover:border-gold/40 cursor-pointer text-xs text-muted-foreground">
            <Upload className="h-3.5 w-3.5" /> Carregar novo
            <input type="file" accept={accept} className="hidden" onChange={(e) => { const f = e.target.files?.[0]; if (f) onUpload(f); e.target.value = ""; }} />
          </label>
          <button type="button" onClick={onPickLibrary} className="flex items-center justify-center gap-2 px-3 py-2 rounded-md border border-border hover:border-gold/40 text-xs text-muted-foreground">
            <FolderOpen className="h-3.5 w-3.5" /> Da biblioteca
          </button>
        </div>
      )}
    </div>
  );
}
