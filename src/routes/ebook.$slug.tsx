import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { BookOpen, Lock, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useI18n } from "@/lib/i18n";
import { useAuth } from "@/lib/auth";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

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
  pdf_path: string | null;
  pages: number | null;
}

function EbookPage() {
  const { slug } = Route.useParams();
  const { t } = useI18n();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [ebook, setEbook] = useState<Ebook | null>(null);
  const [purchased, setPurchased] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      const { data } = await supabase
        .from("ebooks")
        .select("id, slug, title, description, author, category, type, price_usd, price_mzn, cover_url, pdf_path, pages")
        .eq("slug", slug)
        .eq("published", true)
        .maybeSingle();

      setEbook(data as Ebook | null);

      if (data && user && data.type === "premium") {
        const { data: p } = await supabase
          .from("purchases")
          .select("id")
          .eq("ebook_id", data.id)
          .eq("user_id", user.id)
          .eq("status", "completed")
          .maybeSingle();
        setPurchased(!!p);
      }
      setLoading(false);
    };
    load();
  }, [slug, user]);

  const handleRead = async () => {
    if (!ebook?.pdf_path) {
      toast.error("Ficheiro indisponível.");
      return;
    }
    if (!user) {
      navigate({ to: "/auth" });
      return;
    }
    if (ebook.type === "premium" && !purchased) {
      toast.info("Precisas de comprar este ebook para o ler.");
      return;
    }
    const { data, error } = await supabase.storage
      .from("ebooks")
      .createSignedUrl(ebook.pdf_path, 3600);
    if (error || !data) {
      toast.error("Não foi possível abrir o ebook.");
      return;
    }
    await supabase.from("downloads").insert({ user_id: user.id, ebook_id: ebook.id });
    window.open(data.signedUrl, "_blank");
  };

  const handleBuy = () => {
    toast.info("Pagamentos em breve. A integração Stripe será ativada na próxima fase.");
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

  return (
    <div className="container mx-auto px-4 py-12">
      <Link to="/loja" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-gold mb-8">
        <ArrowLeft className="h-4 w-4" /> Voltar
      </Link>

      <div className="grid lg:grid-cols-[400px_1fr] gap-12">
        <div>
          <div className="relative aspect-[3/4] surface-card rounded-2xl overflow-hidden">
            {ebook.cover_url ? (
              <img src={ebook.cover_url} alt={ebook.title} className="h-full w-full object-cover" />
            ) : (
              <div className="h-full w-full flex items-center justify-center">
                <BookOpen className="h-24 w-24 text-muted-foreground/30" />
              </div>
            )}
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

          <div className="mt-6 flex items-center gap-4 text-sm">
            {ebook.pages && (
              <span className="text-muted-foreground">{ebook.pages} páginas</span>
            )}
            <span className={`px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider rounded-full ${isFree ? "bg-secondary text-foreground" : "bg-gold text-gold-foreground"}`}>
              {isFree ? t("ebook.free") : t("ebook.premium")}
            </span>
          </div>

          {ebook.description && (
            <p className="mt-8 text-foreground/90 leading-relaxed whitespace-pre-line">
              {ebook.description}
            </p>
          )}

          <div className="mt-10 surface-card rounded-2xl p-6">
            {isFree ? (
              <>
                <p className="text-2xl font-serif gradient-text-gold mb-4">{t("ebook.free")}</p>
                <Button variant="hero" size="lg" onClick={handleRead}>
                  <BookOpen className="h-4 w-4" /> {t("ebook.read")}
                </Button>
              </>
            ) : purchased ? (
              <>
                <p className="text-sm text-gold mb-4">✓ Já tens este ebook</p>
                <Button variant="hero" size="lg" onClick={handleRead}>
                  <BookOpen className="h-4 w-4" /> {t("ebook.read")}
                </Button>
              </>
            ) : (
              <>
                <div className="flex items-baseline gap-3 mb-1">
                  <span className="text-3xl font-serif gradient-text-gold">${Number(ebook.price_usd ?? 0).toFixed(2)}</span>
                  <span className="text-sm text-muted-foreground">USD</span>
                </div>
                {ebook.price_mzn ? (
                  <p className="text-sm text-muted-foreground mb-4">≈ MZN {Number(ebook.price_mzn).toFixed(0)}</p>
                ) : null}
                <Button variant="hero" size="lg" onClick={handleBuy}>
                  {t("ebook.buy")}
                </Button>
                <p className="mt-3 text-xs text-muted-foreground">
                  Acesso permanente após pagamento. Sem subscrições.
                </p>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
