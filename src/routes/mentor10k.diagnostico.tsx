import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { getAlignmentQuestions } from "@/lib/mentor10k.functions";
import { MessageCircleQuestion, Check, Clock3, Coins, Loader2, Rocket, Target, UserRound } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { toast } from "sonner";
import { useI18n } from "@/lib/i18n";

export const Route = createFileRoute("/mentor10k/diagnostico")({
  head: () => ({
    meta: [
      { title: "Diagnóstico — CEO OS" },
      { name: "description", content: "Cria o teu diagnóstico de negócio e recebe um plano personalizado de 12 semanas." },
      { property: "og:title", content: "Diagnóstico — CEO OS" },
      { property: "og:description", content: "Cria o teu diagnóstico de negócio e recebe um plano personalizado de 12 semanas." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Diagnostico,
});

function Diagnostico() {
  const { t, lang } = useI18n();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [saving, setSaving] = useState(false);
  const pt = lang === "pt";
  const askQuestions = useServerFn(getAlignmentQuestions);
  const [diagId, setDiagId] = useState<string | null>(null);
  const [asking, setAsking] = useState(false);
  const [questions, setQuestions] = useState<string[] | null>(null);
  const [answers, setAnswers] = useState<string[]>([]);
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
      toast.error(t("diagnostic.required"));
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
    if (error || !data) { toast.error(error?.message ?? (lang === "pt" ? "Erro ao guardar" : "Could not save")); return; }
    setDiagId(data.id);
    setAsking(true);
    try {
      const r = await askQuestions({ data: { diagnosticId: data.id, language: lang } });
      setQuestions(r.questions);
      setAnswers(r.questions.map(() => ""));
    } catch (err) {
      toast.error((err as Error).message);
      navigate({ to: "/mentor10k/plano", search: { generate: data.id } as never });
    } finally { setAsking(false); }
  };

  const finishAlignment = async () => {
    if (!diagId || !questions) return;
    if (answers.some((a) => !a.trim())) { toast.error(pt ? "Responde a todas as perguntas." : "Answer every question."); return; }
    setSaving(true);
    const alignment = questions.map((q, i) => ({ q, a: answers[i] }));
    const { error } = await supabase.from("mentor10k_diagnostics").update({ raw_answers: { ...form, alignment } as never }).eq("id", diagId);
    setSaving(false);
    if (error) { toast.error(error.message); return; }
    toast.success(t("diagnostic.saved"));
    navigate({ to: "/mentor10k/plano", search: { generate: diagId } as never });
  };

  if (asking || questions) {
    return (
      <div className="mentor-spotlight glass-card glass-sheen rounded-2xl p-6 md:p-8 space-y-6 max-w-3xl mx-auto">
        <div className="flex items-start gap-4">
          <div className="h-12 w-12 rounded-xl bg-gold/15 flex items-center justify-center glow-gold"><MessageCircleQuestion className="h-6 w-6 text-gold" /></div>
          <div>
            <p className="call-number text-gold mb-1">{pt ? "Passo 2 de 2" : "Step 2 of 2"}</p>
            <h2 className="font-serif text-3xl">{pt ? "Alinhamento com o mentor" : "Mentor alignment"}</h2>
            <p className="text-sm text-muted-foreground mt-1">{pt ? "Responde com detalhe. Quanto mais concreto fores, mais pessoal será o teu plano." : "Answer in detail. The more concrete you are, the more personal your plan."}</p>
          </div>
        </div>
        {asking ? (
          <div className="py-10 text-center text-muted-foreground"><Loader2 className="h-6 w-6 animate-spin text-gold mx-auto mb-2" />{pt ? "O mentor está a analisar o teu diagnóstico…" : "The mentor is reviewing your diagnosis…"}</div>
        ) : questions!.map((q, i) => (
          <div key={i} className="reveal">
            <Label className="mb-1.5 block">{i + 1}. {q}</Label>
            <Textarea rows={3} value={answers[i]} onChange={(e) => setAnswers(answers.map((a, j) => (j === i ? e.target.value : a)))} />
          </div>
        ))}
        {!asking && (
          <Button variant="gold" size="lg" className="w-full" disabled={saving} onClick={finishAlignment}>
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : null} {pt ? "Criar o meu plano personalizado" : "Create my personal plan"}
          </Button>
        )}
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="mentor-spotlight glass-card glass-sheen rounded-2xl p-6 md:p-8 space-y-8 max-w-4xl mx-auto">
      <div className="flex items-start gap-4 reveal">
        <div className="h-12 w-12 rounded-xl bg-gold/15 flex items-center justify-center glow-gold"><Target className="h-6 w-6 text-gold" /></div>
        <div>
          <p className="call-number text-gold mb-1">{t("diagnostic.time")}</p>
          <h2 className="font-serif text-3xl">{t("diagnostic.title")}</h2>
          <p className="text-sm text-muted-foreground mt-1">{t("diagnostic.intro")}</p>
        </div>
      </div>

      <Field label={t("diagnostic.goal")}>
        <Textarea rows={2} required value={form.goal} onChange={(e) => setForm({ ...form, goal: e.target.value })} placeholder={t("diagnostic.goal.placeholder")} />
      </Field>

      <Field label={t("diagnostic.now")}>
        <Textarea rows={3} required value={form.current_situation} onChange={(e) => setForm({ ...form, current_situation: e.target.value })} placeholder={t("diagnostic.now.placeholder")} />
      </Field>

      <ChoiceField
        icon={Coins}
        label={t("diagnostic.revenue")}
        value={form.monthly_income_eur}
        options={["0", "500", "1500", "3500", "7500"].map((value, index) => [value, t("diagnostic.revenue.options").split("|")[index]] as [string, string])}
        onChange={(monthly_income_eur) => setForm({ ...form, monthly_income_eur })}
      />

      <ChoiceField
        icon={Clock3}
        label={t("diagnostic.time.week")}
        value={form.available_hours_week}
        options={["5", "10", "20", "30", "40"].map((value, index) => [value, t("diagnostic.time.options").split("|")[index]] as [string, string])}
        onChange={(available_hours_week) => setForm({ ...form, available_hours_week })}
      />

      <Field label={t("diagnostic.skills")}>
        <Textarea rows={2} value={form.skills} onChange={(e) => setForm({ ...form, skills: e.target.value })} placeholder={t("diagnostic.skills.placeholder")} />
      </Field>

      <Field label={t("diagnostic.resources")}>
        <Textarea rows={2} value={form.resources} onChange={(e) => setForm({ ...form, resources: e.target.value })} placeholder={t("diagnostic.resources.placeholder")} />
      </Field>

      <Field label={t("diagnostic.blocks")}>
        <Textarea rows={2} value={form.obstacles} onChange={(e) => setForm({ ...form, obstacles: e.target.value })} placeholder={t("diagnostic.specific")} />
      </Field>

      <ChoiceField
        icon={UserRound}
        label={t("diagnostic.model")}
        value={form.profile_type}
        options={["solo", "creator", "agency", "ecom", "saas", "other"].map((value, index) => [value, t("diagnostic.model.options").split("|")[index]] as [string, string])}
        onChange={(profile_type) => setForm({ ...form, profile_type })}
      />

      <ChoiceField
        icon={Rocket}
        label={t("diagnostic.deadline")}
        value={form.deadline_months}
        options={["3", "6", "12"].map((value, index) => [value, t("diagnostic.deadline.options").split("|")[index]] as [string, string])}
        onChange={(deadline_months) => setForm({ ...form, deadline_months })}
      />

      <Button type="submit" variant="gold" size="lg" disabled={saving} className="w-full">
        {saving ? <><Loader2 className="h-4 w-4 animate-spin" /> {t("diagnostic.saving")}</> : t("diagnostic.submit")}
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
