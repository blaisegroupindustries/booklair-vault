import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { BookOpen, Lock, ArrowLeft, Headphones, FileText, Languages } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useI18n } from "@/lib/i18n";
import { useAuth } from "@/lib/auth";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { EbookCover } from "@/components/EbookCover";

export const Route = createFileRoute("/ebook/$slug")({
  component: EbookPage,
});

interface Ebook {
  id: string;
  slug: string;
  title: string;
  description: string | null;
  author: string | null;
  category: string;
  type: "free" | "premium";
  price_usd: number | null;
  price_mzn: number | null;
  cover_url: string | null;
  cover_type: "image" | "text" | null;
  cover_text_title: string | null;
  cover_text_subtitle: string | null;
  cover_bg_color: string | null;
  cover_text_color: string | null;
  cover_gradient: string | null;
  pdf_path: string | null;
  pdf_path_pt: string | null;
  pdf_path_en: string | null;
  audio_path_pt: string | null;
  audio_path_en: string | null;
  preview_pdf_path: string | null;
  preview_audio_path: string | null;
  available_languages: string[] | null;
  available_formats: string[] | null;
  pages: number | null;
}

type Lang = "pt" | "en";
type Format = "pdf" | "audio";

function EbookPage() {
  const { slug } = Route.useParams();
  const { t } = useI18n();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [ebook, setEbook] = useState<Ebook | null>(null);
  const [purchased, setPurchased] = useState(false);
  const [loading, setLoading] = useState(true);

  const [lang, setLang] = useState<Lang>("pt");
  const [format, setFormat] = useState<Format>("pdf");
  const [reading, setReading] = useState(false);
  const [signedUrl, setSignedUrl] = useState<string | null>(null);
  const [signing, setSigning] = useState(false);

  useEffect(() => {
    const load = async () => {
      const { data } = await supabase
        .from("ebooks")
        .select("*")
        .eq("slug", slug)
        .or("published.eq.true,status.eq.scheduled")
        .maybeSingle();

      const e = data as Ebook | null;
      setEbook(e);

      if (e) {
        const langs = e.available_languages ?? ["pt"];
        const formats = e.available_formats ?? ["pdf"];
        setLang((langs[0] as Lang) ?? "pt");
        setFormat((formats[0] as Format) ?? "pdf");
      }

      if (e && user && e.type === "premium") {
        const { data: p } = await supabase
          .from("purchases")
          .select("id")
          .eq("ebook_id", e.id)
          .eq("user_id", user.id)
          .eq("status", "completed")
          .maybeSingle();
        setPurchased(!!p);
      }
      setLoading(false);
    };
    load();
  }, [slug, user]);

  const filePath = useMemo(() => {
    if (!ebook) return null;
    if (format === "audio") {
      return lang === "en" ? ebook.audio_path_en : ebook.audio_path_pt;
    }
    return (
      (lang === "en" ? ebook.pdf_path_en : ebook.pdf_path_pt) ?? ebook.pdf_path ?? null
    );
  }, [ebook, lang, format]);

  const bucket = format === "audio" ? "audio" : "ebooks";

  const startReading = async () => {
    if (!ebook) return;
    if (!user) {
      navigate({
        to: "/auth",
        search: { mode: "signin", redirect: `/ebook/${ebook.slug}?read=1` },
      });
      return;
    }
    if (ebook.type === "premium" && !purchased) {
      toast.info("Precisas de comprar este ebook para o ler.");
      return;
    }
    if (!filePath) {
      toast.error("Este formato/idioma ainda não está disponível.");
      return;
    }
    setSigning(true);
    const { data, error } = await supabase.storage
      .from(bucket)
      .createSignedUrl(filePath, 3600);
    setSigning(false);
    if (error || !data) {
      toast.error("Não foi possível abrir o ficheiro.");
      return;
    }
    setSignedUrl(data.signedUrl);
    setReading(true);
    void supabase.from("downloads").insert({ user_id: user.id, ebook_id: ebook.id });
  };

  // Auto-start if redirected back with ?read=1
  useEffect(() => {
    if (!loading && ebook && user) {
      const url = new URL(window.location.href);
      if (url.searchParams.get("read") === "1" && !reading) {
        url.searchParams.delete("read");
        window.history.replaceState({}, "", url.toString());
        void startReading();
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loading, ebook, user]);

  const handleBuy = () => {
    toast.info("Pagamentos em breve.");
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-20">
        <div className="grid lg:grid-cols-[400px_1fr] gap-10">
          <div className="aspect-[3/4] rounded-2xl bg-muted animate-pulse" />
          <div className="space-y-4">
            <div className="h-10 w-3/4 bg-muted animate-pulse rounded" />
            <div className="h-4 w-1/2 bg-muted animate-pulse rounded" />
          </div>
        </div>
      </div>
    );
  }

  if (!ebook) {
    return (
      <div className="container mx-auto px-4 py-20 text-center">
        <h1 className="font-serif text-4xl">Ebook não encontrado</h1>
        <Link to="/loja" className="mt-6 inline-block text-gold">← Voltar à loja</Link>
      </div>
    );
  }

  const isFree = ebook.type === "free";
  const langs = (ebook.available_languages?.length ? ebook.available_languages : ["pt"]) as Lang[];
  const formats = (ebook.available_formats?.length ? ebook.available_formats : ["pdf"]) as Format[];

  // ---------- READER MODE ----------
  if (reading && signedUrl) {
    return (
      <div className="fixed inset-0 z-50 bg-background flex flex-col">
        <div className="flex items-center justify-between gap-3 px-4 py-3 border-b border-border bg-card/80 backdrop-blur">
          <div className="flex items-center gap-3 min-w-0">
            <button onClick={() => { setReading(false); setSignedUrl(null); }} className="text-muted-foreground hover:text-foreground inline-flex items-center gap-1 text-sm">
              <ArrowLeft className="h-4 w-4" /> Voltar
            </button>
            <span className="text-sm font-serif truncate">{ebook.title}</span>
          </div>
          <div className="flex items-center gap-2 text-xs">
            {langs.length > 1 && (
              <select
                value={lang}
                onChange={async (e) => {
                  setLang(e.target.value as Lang);
                  setSignedUrl(null);
                  setReading(false);
                  setTimeout(() => startReading(), 50);
                }}
                className="h-8 rounded-md border border-input bg-transparent px-2"
              >
                {langs.map((l) => <option key={l} value={l}>{l.toUpperCase()}</option>)}
              </select>
            )}
            {formats.length > 1 && (
              <select
                value={format}
                onChange={async (e) => {
                  setFormat(e.target.value as Format);
                  setSignedUrl(null);
                  setReading(false);
                  setTimeout(() => startReading(), 50);
                }}
                className="h-8 rounded-md border border-input bg-transparent px-2"
              >
                {formats.map((f) => <option key={f} value={f}>{f === "pdf" ? "PDF" : "Áudio"}</option>)}
              </select>
            )}
          </div>
        </div>
        <div className="flex-1 bg-black">
          {format === "audio" ? (
            <div className="h-full flex flex-col items-center justify-center p-8 gap-6">
              <div className="w-48 aspect-[3/4] rounded-2xl overflow-hidden surface-card">
                <EbookCover ebook={ebook} />
              </div>
              <div className="text-center">
                <h2 className="font-serif text-2xl">{ebook.title}</h2>
                {ebook.author && <p className="text-sm text-muted-foreground">{ebook.author}</p>}
              </div>
              <audio controls autoPlay src={signedUrl} className="w-full max-w-xl" controlsList="nodownload" />
              <p className="text-xs text-muted-foreground">Reprodução protegida. Download desativado.</p>
            </div>
          ) : (
            <iframe
              src={`${signedUrl}#toolbar=0&navpanes=0`}
              title={ebook.title}
              className="w-full h-full"
            />
          )}
        </div>
      </div>
    );
  }

  // ---------- DETAIL PAGE ----------
  return (
    <div className="container mx-auto px-4 py-12">
      <Link to="/loja" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-gold mb-8">
        <ArrowLeft className="h-4 w-4" /> Voltar
      </Link>

      <div className="grid lg:grid-cols-[400px_1fr] gap-12">
        <div>
          <div className="relative aspect-[3/4] surface-card rounded-2xl overflow-hidden">
            <EbookCover ebook={ebook} rounded="rounded-2xl" />
            {!isFree && !purchased && (
              <div className="absolute inset-0 bg-background/40 backdrop-blur-[2px] flex items-end justify-center p-4">
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-background/80 border border-gold/30">
                  <Lock className="h-3 w-3 text-gold" />
                  <span className="text-xs text-gold uppercase tracking-wider">{t("ebook.premium")}</span>
                </div>
              </div>
            )}
          </div>
        </div>

        <div>
          <p className="text-xs uppercase tracking-widest text-gold mb-3">{t(`cat.${ebook.category}`)}</p>
          <h1 className="font-serif text-4xl md:text-5xl text-foreground">{ebook.title}</h1>
          {ebook.author && <p className="mt-2 text-muted-foreground">por {ebook.author}</p>}

          <div className="mt-6 flex flex-wrap items-center gap-3 text-sm">
            {ebook.pages && (
              <span className="text-muted-foreground">{ebook.pages} páginas</span>
            )}
            <span className={`px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider rounded-full ${isFree ? "bg-emerald-500/20 text-emerald-300" : "bg-gold text-gold-foreground"}`}>
              {isFree ? t("ebook.free") : t("ebook.premium")}
            </span>
          </div>

          {ebook.description && (
            <p className="mt-8 text-foreground/90 leading-relaxed whitespace-pre-line">
              {ebook.description}
            </p>
          )}

          <div className="mt-10 surface-card rounded-2xl p-6 space-y-5">
            {/* Lang & Format pickers */}
            {(langs.length > 1 || formats.length > 1) && (
              <div className="flex flex-wrap gap-4">
                {langs.length > 1 && (
                  <div>
                    <p className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1.5 inline-flex items-center gap-1"><Languages className="h-3 w-3" /> Idioma</p>
                    <div className="flex gap-1.5">
                      {langs.map((l) => (
                        <button key={l} type="button" onClick={() => setLang(l)} className={`px-3 py-1.5 text-xs rounded-md border ${lang === l ? "bg-gold/15 text-gold border-gold/40" : "border-border text-muted-foreground"}`}>{l.toUpperCase()}</button>
                      ))}
                    </div>
                  </div>
                )}
                {formats.length > 1 && (
                  <div>
                    <p className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1.5">Formato</p>
                    <div className="flex gap-1.5">
                      {formats.map((f) => (
                        <button key={f} type="button" onClick={() => setFormat(f)} className={`px-3 py-1.5 text-xs rounded-md border inline-flex items-center gap-1 ${format === f ? "bg-gold/15 text-gold border-gold/40" : "border-border text-muted-foreground"}`}>
                          {f === "audio" ? <Headphones className="h-3 w-3" /> : <FileText className="h-3 w-3" />}
                          {f === "pdf" ? "PDF" : "Áudio"}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {isFree ? (
              <>
                <p className="text-2xl font-serif gradient-text-gold">{t("ebook.free")}</p>
                <Button variant="hero" size="lg" onClick={startReading} disabled={signing}>
                  <BookOpen className="h-4 w-4" /> {signing ? "A abrir…" : "Ler no site"}
                </Button>
              </>
            ) : purchased ? (
              <>
                <p className="text-sm text-gold">✓ Já tens este ebook</p>
                <Button variant="hero" size="lg" onClick={startReading} disabled={signing}>
                  <BookOpen className="h-4 w-4" /> {signing ? "A abrir…" : "Ler no site"}
                </Button>
              </>
            ) : (
              <>
                <div className="flex items-baseline gap-3">
                  <span className="text-3xl font-serif gradient-text-gold">${Number(ebook.price_usd ?? 0).toFixed(2)}</span>
                  <span className="text-sm text-muted-foreground">USD</span>
                </div>
                {ebook.price_mzn ? (
                  <p className="text-sm text-muted-foreground">≈ MZN {Number(ebook.price_mzn).toFixed(0)}</p>
                ) : null}
                <Button variant="hero" size="lg" onClick={handleBuy}>
                  {t("ebook.buy")}
                </Button>
                <p className="text-xs text-muted-foreground">
                  Leitura no site após compra. Sem downloads — proteção total do conteúdo.
                </p>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
