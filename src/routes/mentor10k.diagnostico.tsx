import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Check, Clock3, Coins, Loader2, Rocket, Target, UserRound } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { toast } from "sonner";

export const Route = createFileRoute("/mentor10k/diagnostico")({
  head: () => ({
    meta: [
      { title: "Diagnóstico — Mentor 10K" },
      { name: "description", content: "Cria o teu diagnóstico de negócio e recebe um plano personalizado de 12 semanas." },
      { property: "og:title", content: "Diagnóstico — Mentor 10K" },
      { property: "og:description", content: "Cria o teu diagnóstico de negócio e recebe um plano personalizado de 12 semanas." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Diagnostico,
});

function Diagnostico() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    goal: "",
    current_situation: "",
    monthly_income_eur: "",
    available_hours_week: "",
    skills: "",
    resources: "",
    obstacles: "",
    deadline_months: "3",
    profile_type: "solo",
  });

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    if (!form.goal.trim() || !form.current_situation.trim()) {
      toast.error("Preenche pelo menos o objetivo e a situação atual.");
      return;
    }
    setSaving(true);
    const { data, error } = await supabase
      .from("mentor10k_diagnostics")
      .insert({
        user_id: user.id,
        goal: form.goal,
        current_situation: form.current_situation,
        monthly_income_eur: form.monthly_income_eur ? Number(form.monthly_income_eur) : null,
        available_hours_week: form.available_hours_week ? Number(form.available_hours_week) : null,
        skills: form.skills || null,
        resources: form.resources || null,
        obstacles: form.obstacles || null,
        deadline_months: Number(form.deadline_months) || 3,
        profile_type: form.profile_type,
        raw_answers: form as never,
      })
      .select()
      .single();
    setSaving(false);
    if (error || !data) { toast.error(error?.message ?? "Erro ao guardar"); return; }
    toast.success("Diagnóstico guardado. A gerar o teu plano…");
    navigate({ to: "/mentor10k/plano", search: { generate: data.id } as never });
  };

  return (
    <form onSubmit={submit} className="mentor-spotlight glass-card glass-sheen rounded-2xl p-6 md:p-8 space-y-8 max-w-4xl mx-auto">
      <div className="flex items-start gap-4 reveal">
        <div className="h-12 w-12 rounded-xl bg-gold/15 flex items-center justify-center glow-gold"><Target className="h-6 w-6 text-gold" /></div>
        <div>
          <p className="call-number text-gold mb-1">5 minutos · plano gratuito</p>
          <h2 className="font-serif text-3xl">Vamos desenhar a tua rota até aos 10K</h2>
          <p className="text-sm text-muted-foreground mt-1">Escolhe o que mais se aproxima da tua realidade. Podes explicar os detalhes nos campos abertos.</p>
        </div>
      </div>

      <Field label="O teu objetivo (em uma frase) *">
        <Textarea rows={2} required value={form.goal} onChange={(e) => setForm({ ...form, goal: e.target.value })} placeholder="Ex: Chegar a 10.000€/mês com consultoria de marketing em 6 meses." />
      </Field>

      <Field label="Onde estás agora? *">
        <Textarea rows={3} required value={form.current_situation} onChange={(e) => setForm({ ...form, current_situation: e.target.value })} placeholder="O que fazes, há quanto tempo, o que já tentaste…" />
      </Field>

      <ChoiceField
        icon={Coins}
        label="Qual é a tua receita mensal atual?"
        value={form.monthly_income_eur}
        options={[["0", "Ainda não faturo"], ["500", "Até 500€"], ["1500", "500€–2.000€"], ["3500", "2.000€–5.000€"], ["7500", "Mais de 5.000€"]]}
        onChange={(monthly_income_eur) => setForm({ ...form, monthly_income_eur })}
      />

      <ChoiceField
        icon={Clock3}
        label="Quanto tempo podes investir por semana?"
        value={form.available_hours_week}
        options={[["5", "Até 5 horas"], ["10", "5–10 horas"], ["20", "10–20 horas"], ["30", "20–30 horas"], ["40", "Tempo inteiro"]]}
        onChange={(available_hours_week) => setForm({ ...form, available_hours_week })}
      />

      <Field label="As tuas skills principais">
        <Textarea rows={2} value={form.skills} onChange={(e) => setForm({ ...form, skills: e.target.value })} placeholder="Ex: copywriting, vídeo, vendas B2B…" />
      </Field>

      <Field label="Recursos de que dispões">
        <Textarea rows={2} value={form.resources} onChange={(e) => setForm({ ...form, resources: e.target.value })} placeholder="Audiência, capital, ferramentas, rede de contactos…" />
      </Field>

      <Field label="O que te tem bloqueado?">
        <Textarea rows={2} value={form.obstacles} onChange={(e) => setForm({ ...form, obstacles: e.target.value })} placeholder="Sê específico." />
      </Field>

      <ChoiceField
        icon={UserRound}
        label="Qual é o teu modelo atual?"
        value={form.profile_type}
        options={[["solo", "Solo / freelancer"], ["creator", "Creator"], ["agency", "Agência"], ["ecom", "E-commerce"], ["saas", "Produto digital / SaaS"], ["other", "Outro"]]}
        onChange={(profile_type) => setForm({ ...form, profile_type })}
      />

      <ChoiceField
        icon={Rocket}
        label="Em quanto tempo queres chegar à meta?"
        value={form.deadline_months}
        options={[["3", "90 dias"], ["6", "6 meses"], ["12", "12 meses"]]}
        onChange={(deadline_months) => setForm({ ...form, deadline_months })}
      />

      <Button type="submit" variant="gold" size="lg" disabled={saving} className="w-full">
        {saving ? <><Loader2 className="h-4 w-4 animate-spin" /> A guardar…</> : "Gerar plano personalizado"}
      </Button>
    </form>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <Label className="mb-1.5 block">{label}</Label>
      {children}
    </div>
  );
}

function ChoiceField({
  icon: Icon,
  label,
  value,
  options,
  onChange,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
  options: Array<[string, string]>;
  onChange: (value: string) => void;
}) {
  return (
    <fieldset className="reveal rounded-2xl border border-border/50 p-4 md:p-5 bg-[color-mix(in_oklab,var(--foreground)_3%,transparent)]">
      <legend className="px-2 text-sm font-medium inline-flex items-center gap-2">
        <Icon className="h-4 w-4 text-gold" /> {label}
      </legend>
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-2 mt-2">
        {options.map(([optionValue, optionLabel]) => {
          const selected = value === optionValue;
          return (
            <Button
              key={optionValue}
              type="button"
              variant="outline"
              aria-pressed={selected}
              onClick={() => onChange(optionValue)}
              className={`choice-tile h-auto min-h-12 justify-between whitespace-normal text-left px-4 py-3 ${selected ? "choice-tile-active" : ""}`}
            >
              <span>{optionLabel}</span>
              <Check className={`h-4 w-4 transition-all ${selected ? "scale-100 opacity-100 text-gold" : "scale-75 opacity-0"}`} />
            </Button>
          );
        })}
      </div>
    </fieldset>
  );
}
