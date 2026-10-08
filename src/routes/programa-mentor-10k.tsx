import { createFileRoute, Link } from "@tanstack/react-router";
import { BookOpen, Sparkles, Target, ClipboardList, MessageSquare, TrendingUp, CheckCircle2, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Mentor10kBuyButton } from "@/components/Mentor10kBuyButton";
import { useI18n } from "@/lib/i18n";


export const Route = createFileRoute("/programa-mentor-10k")({
  head: () => ({
    meta: [
      { title: "CEO OS — Programa Booklair" },
      { name: "description", content: "Programa exclusivo de mentoria com IA para chegar aos primeiros 10.000€/mês. Diagnóstico, plano de 12 semanas, check-ins e mentor IA personalizado." },
      { property: "og:title", content: "CEO OS — Programa Booklair" },
      { property: "og:description", content: "Diagnóstico, plano personalizado de 12 semanas e mentor IA para chegares aos primeiros 10.000€/mês." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Landing,
});

function Landing() {
  const { t, lang } = useI18n();
  const features = lang === "pt" ? [
    { icon: Target, title: "Diagnóstico inteligente", desc: "Respondes 9 perguntas honestas. A IA constrói o teu retrato real — sem fluff." },
    { icon: ClipboardList, title: "Plano diário de 12 semanas", desc: "Cinco ações concretas por semana, com duração e resultado esperado — não conceitos vagos." },
    { icon: MessageSquare, title: "Mentor IA 24/7", desc: "Pergunta, valida ideias, recebe feedback direto baseado no teu plano e histórico." },
    { icon: TrendingUp, title: "Check-ins semanais", desc: "5 minutos por semana. Feedback do mentor calibrado ao teu progresso real." },
  ] : [
    { icon: Target, title: "Intelligent assessment", desc: "Answer 9 honest questions. AI builds a clear picture of your reality — no fluff." },
    { icon: ClipboardList, title: "12-week daily plan", desc: "Five concrete actions per week, with duration and expected outcome — no vague concepts." },
    { icon: MessageSquare, title: "24/7 AI mentor", desc: "Ask questions, validate ideas and receive direct feedback based on your plan and history." },
    { icon: TrendingUp, title: "Weekly check-ins", desc: "Five minutes each week. Mentor feedback calibrated to your real progress." },
  ];

  const promises = lang === "pt" ? [
    "Plano à medida — sem templates genéricos",
    "Acesso vitalício ao programa e atualizações",
    "Histórico completo de progresso e receita",
    "Mentor IA treinado em vendas e marketing direto",
    "Zero to CEO incluído gratuitamente",
  ] : [
    "Tailored plan — no generic templates",
    "Lifetime access to the program and updates",
    "Complete progress and revenue history",
    "AI mentor trained in sales and direct marketing",
    "Zero to CEO included free",
  ];

  return (
    <div className="overflow-hidden">
      <section className="mentor-hero aurora relative min-h-[70vh] flex items-center border-b border-border/50">
        <div className="container mx-auto px-4 py-16 md:py-24 max-w-6xl relative text-center">
        <div className="mentor-orbit mx-auto mb-6"><Zap className="h-6 w-6 text-gold" /></div>
        <p className="call-number text-gold mb-4 reveal">{t("program.eyebrow")}</p>
        <h1 className="font-serif text-6xl md:text-8xl shimmer-text leading-[0.92] mb-6 reveal reveal-1">CEO OS</h1>
        <p className="text-xl md:text-2xl text-muted-foreground mb-8 leading-relaxed max-w-3xl mx-auto reveal reveal-2">
          {t("program.lead")}
        </p>
        <div className="flex flex-wrap justify-center gap-3 reveal reveal-3">
          <Mentor10kBuyButton />
          <Button variant="goldOutline" size="xl" asChild>
            <Link to="/mentor10k">{t("program.try")}</Link>
          </Button>
        </div>
        <p className="mt-4 text-xs text-muted-foreground">
          {t("program.free")}
        </p>
        <div className="mt-10 flex flex-wrap justify-center gap-3">
          {t("program.chips").split("|").map((item) => (
            <span key={item} className="glass-pill px-4 py-2 text-xs text-foreground">{item}</span>
          ))}
        </div>
        </div>
      </section>

      <div className="container mx-auto px-4 py-20 max-w-6xl">
      <section className="grid md:grid-cols-2 gap-5 mb-20">
        {features.map((f) => (
          <div key={f.title} className="glass-card glass-sheen hover-lift rounded-2xl p-7 reveal">
            <div className="h-11 w-11 rounded-xl bg-gold/15 flex items-center justify-center mb-4">
              <f.icon className="h-5 w-5 text-gold" />
            </div>
            <h3 className="font-serif text-2xl mb-2">{f.title}</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">{f.desc}</p>
          </div>
        ))}
      </section>

      <section className="mentor-spotlight glass-card glass-sheen rounded-3xl p-8 md:p-12 mb-20 grid md:grid-cols-[1fr_auto] gap-8 items-center">
        <div>
          <p className="call-number text-gold mb-3">{t("program.bonus")}</p>
          <h2 className="font-serif text-3xl md:text-5xl">{t("program.bonus.title")}</h2>
          <p className="text-muted-foreground mt-4 max-w-2xl">{t("program.bonus.body")}</p>
        </div>
        <div className="h-36 w-28 rounded-lg border border-gold/40 bg-[linear-gradient(145deg,color-mix(in_oklab,var(--gold)_35%,transparent),color-mix(in_oklab,var(--background)_90%,transparent))] flex items-center justify-center text-center p-3 shadow-gold float-slow">
          <span className="font-serif text-lg text-gold">Zero to CEO</span>
        </div>
      </section>

      <section className="glass-card rounded-3xl p-8 md:p-12 mb-16">
        <div className="flex items-center gap-2 justify-center mb-3"><Sparkles className="h-4 w-4 text-gold" /><span className="text-xs uppercase tracking-widest text-gold">{t("program.receive")}</span></div>
        <h2 className="font-serif text-3xl md:text-4xl text-center mb-8">{t("program.everything")}</h2>
        <div className="grid md:grid-cols-2 gap-3 max-w-2xl mx-auto">
          {promises.map((p) => (
            <div key={p} className="flex gap-3 items-start p-3 rounded-xl bg-[color-mix(in_oklab,var(--foreground)_4%,transparent)]">
              <CheckCircle2 className="h-5 w-5 text-gold mt-0.5 shrink-0" />
              <span className="text-sm">{p}</span>
            </div>
          ))}
        </div>
      </section>

      <section className="text-center">
        <h2 className="font-serif text-3xl md:text-5xl mb-4">{t("program.ready")}</h2>
        <p className="text-muted-foreground mb-6">{t("program.ready.body")}</p>
        <Mentor10kBuyButton label={t("program.buy")} />
        <p className="mt-4 text-xs text-muted-foreground inline-flex items-center gap-2"><BookOpen className="h-3.5 w-3.5" /> {t("program.lifetime")}</p>
      </section>
      </div>
    </div>
  );
}
