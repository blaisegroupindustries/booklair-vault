import { createFileRoute } from "@tanstack/react-router";
import { useI18n } from "@/lib/i18n";

export const Route = createFileRoute("/sobre")({
  head: () => ({
    meta: [
      { title: "Sobre — Booklair" },
      { name: "description", content: "A Booklair existe para tornar acessível o conhecimento que faz a diferença." },
    ],
  }),
  component: AboutPage,
});

function AboutPage() {
  const { t } = useI18n();
  return (
    <div className="container mx-auto px-4 py-20 max-w-3xl">
      <p className="text-xs uppercase tracking-widest text-gold mb-3">{t("about.title")}</p>
      <h1 className="font-serif text-5xl md:text-6xl text-foreground">{t("about.title")}</h1>
      <p className="mt-6 text-lg text-muted-foreground leading-relaxed">{t("about.lead")}</p>

      <div className="prose dark:prose-invert mt-10 space-y-6 text-foreground/90">
        <p>
          Acreditamos que o conhecimento certo, na altura certa, muda trajetórias. É por isso que
          curamos cada ebook publicado na Booklair — não vendemos catálogos infinitos, vendemos
          escolhas pensadas.
        </p>
        <p>
          A nossa missão é simples: levar conteúdo de excelência em <span className="text-gold">marketing & negócios</span>,
          {" "}<span className="text-gold">educação & estudo</span>, e <span className="text-gold">desenvolvimento pessoal</span>{" "}
          a quem fala português — em qualquer parte do mundo. Sem subscrições. Sem letras pequenas.
          Compras um ebook uma vez, fica teu para sempre.
        </p>
        <p>
          Construímos a Booklair para Lisboa, Maputo, São Paulo, Luanda — e para qualquer pessoa,
          em qualquer lugar, que decida investir em si mesma.
        </p>
      </div>
    </div>
  );
}
