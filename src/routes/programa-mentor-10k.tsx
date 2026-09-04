import { createFileRoute, Link } from "@tanstack/react-router";
import { Sparkles, Target, ClipboardList, MessageSquare, TrendingUp, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Mentor10kBuyButton } from "@/components/Mentor10kBuyButton";


export const Route = createFileRoute("/programa-mentor-10k")({
  head: () => ({
    meta: [
      { title: "Mentor 10K — Programa Booklair" },
      { name: "description", content: "Programa exclusivo de mentoria com IA para chegar aos primeiros 10.000€/mês. Diagnóstico, plano de 12 semanas, check-ins e mentor IA personalizado." },
      { property: "og:title", content: "Mentor 10K — Programa Booklair" },
      { property: "og:description", content: "Diagnóstico, plano personalizado de 12 semanas e mentor IA para chegares aos primeiros 10.000€/mês." },
    ],
  }),
  component: Landing,
});

function Landing() {
  const features = [
    { icon: Target, title: "Diagnóstico inteligente", desc: "Respondes 9 perguntas honestas. A IA constrói o teu retrato real — sem fluff." },
    { icon: ClipboardList, title: "Plano de 12 semanas", desc: "Fundação → Validação → Tração → Escala. Tarefas semanais concretas, não conceitos vagos." },
    { icon: MessageSquare, title: "Mentor IA 24/7", desc: "Pergunta, valida ideias, recebe feedback direto baseado no teu plano e histórico." },
    { icon: TrendingUp, title: "Check-ins semanais", desc: "5 minutos por semana. Feedback do mentor calibrado ao teu progresso real." },
  ];

  const promises = [
    "Plano à medida — sem templates genéricos",
    "Acesso vitalício ao programa e atualizações",
    "Histórico completo de progresso e receita",
    "Mentor IA treinado em vendas e marketing direto",
  ];

  return (
    <div className="container mx-auto px-4 py-16 max-w-6xl">
      <section className="text-center max-w-3xl mx-auto mb-16">
        <p className="text-[11px] uppercase tracking-[0.25em] text-gold mb-4">Programa exclusivo Booklair</p>
        <h1 className="font-serif text-5xl md:text-7xl gradient-text-gold leading-[1.05] mb-6">Mentor 10K</h1>
        <p className="text-xl text-muted-foreground mb-8 leading-relaxed">
          O caminho prático e personalizado até aos teus primeiros <strong className="text-foreground">10.000€/mês</strong>. Diagnóstico, plano de 12 semanas e mentor IA — sempre disponível.
        </p>
        <div className="flex flex-wrap justify-center gap-3">
          <Mentor10kBuyButton />
          <Button variant="goldOutline" size="xl" asChild>
            <Link to="/mentor10k">Experimentar / já tenho acesso</Link>
          </Button>
        </div>
        <p className="mt-4 text-xs text-muted-foreground">
          Podes fazer o diagnóstico e criar o teu plano gratuitamente. O acesso completo desbloqueia check-ins, histórico e mentoria ilimitada.
        </p>

      </section>

      <section className="grid md:grid-cols-2 gap-5 mb-16">
        {features.map((f) => (
          <div key={f.title} className="glass-card rounded-2xl p-6">
            <div className="h-11 w-11 rounded-xl bg-gold/15 flex items-center justify-center mb-4">
              <f.icon className="h-5 w-5 text-gold" />
            </div>
            <h3 className="font-serif text-2xl mb-2">{f.title}</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">{f.desc}</p>
          </div>
        ))}
      </section>

      <section className="glass-card rounded-3xl p-8 md:p-12 mb-16">
        <div className="flex items-center gap-2 justify-center mb-3"><Sparkles className="h-4 w-4 text-gold" /><span className="text-xs uppercase tracking-widest text-gold">O que recebes</span></div>
        <h2 className="font-serif text-3xl md:text-4xl text-center mb-8">Tudo o que precisas. Nada do que não precisas.</h2>
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
        <h2 className="font-serif text-3xl md:text-5xl mb-4">Pronto para começar?</h2>
        <p className="text-muted-foreground mb-6">O primeiro check-in pode acontecer ainda esta semana.</p>
        <Mentor10kBuyButton label="Quero o Mentor 10K" />
      </section>

    </div>
  );
}
