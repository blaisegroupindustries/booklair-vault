import { createFileRoute, Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useEffect, useState } from "react";
import { Activity, Loader2, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { generateCheckinFeedback } from "@/lib/mentor10k.functions";
import { toast } from "sonner";
import { useI18n } from "@/lib/i18n";

export const Route = createFileRoute("/mentor10k/checkin")({
  component: Checkin,
});

function Checkin() {
  const { t, lang } = useI18n();
  const { user } = useAuth();
  const call = useServerFn(generateCheckinFeedback);
  const [planId, setPlanId] = useState<string | null>(null);
  const [defaultWeek, setDefaultWeek] = useState(1);
  const [submitting, setSubmitting] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [form, setForm] = useState({
    week_number: "1",
    progress_score: "7",
    income_eur: "",
    what_done: "",
    what_blocked: "",
    next_focus: "",
    mood: "ok",
  });

  useEffect(() => {
    if (!user) return;
    void (async () => {
      const { data: plan } = await supabase
        .from("mentor10k_plans")
        .select("id")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();
      if (plan) {
        setPlanId(plan.id);
        const { count } = await supabase.from("mentor10k_checkins").select("*", { count: "exact", head: true }).eq("user_id", user.id).eq("plan_id", plan.id);
        const next = (count ?? 0) + 1;
        setDefaultWeek(next);
        setForm((f) => ({ ...f, week_number: String(next) }));
      }
    })();
  }, [user]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!planId) { toast.error("Cria primeiro um plano."); return; }
    if (!form.what_done.trim() || !form.what_blocked.trim()) { toast.error("Preenche os campos principais."); return; }
    setSubmitting(true);
    setFeedback(null);
    try {
      const res = await call({ data: {
        planId,
        week_number: Number(form.week_number) || defaultWeek,
        progress_score: Number(form.progress_score) || 0,
        income_eur: form.income_eur ? Number(form.income_eur) : undefined,
        what_done: form.what_done,
        what_blocked: form.what_blocked,
        next_focus: form.next_focus || undefined,
        mood: form.mood,
        language: lang,
      } });
      setFeedback(res.checkin?.mentor_feedback ?? null);
      toast.success("Check-in guardado.");
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : "Erro");
    } finally {
      setSubmitting(false);
    }
  };

  if (!planId) {
    return (
      <div className="glass-card rounded-2xl p-12 text-center">
        <Activity className="h-12 w-12 text-muted-foreground/40 mx-auto mb-4" />
        <h2 className="font-serif text-2xl mb-2">{t("checkin.noPlan")}</h2>
        <p className="text-muted-foreground mb-6">{t("checkin.noPlan.body")}</p>
        <Button variant="gold" asChild><Link to="/mentor10k/diagnostico">{t("checkin.create")}</Link></Button>
      </div>
    );
  }

  return (
    <div className="grid lg:grid-cols-[1fr_360px] gap-6">
      <form onSubmit={submit} className="glass-card rounded-2xl p-6 md:p-8 space-y-5">
        <div className="flex items-start gap-3">
          <div className="h-10 w-10 rounded-xl bg-gold/15 flex items-center justify-center"><Activity className="h-5 w-5 text-gold" /></div>
          <div>
            <h2 className="font-serif text-2xl">{t("checkin.title")}</h2>
            <p className="text-sm text-muted-foreground">{t("checkin.intro")}</p>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-4">
          <div><Label className="mb-1.5 block">{t("checkin.week")}</Label><Input type="number" min="1" value={form.week_number} onChange={(e) => setForm({ ...form, week_number: e.target.value })} /></div>
          <div><Label className="mb-1.5 block">Score (0-10)</Label><Input type="number" min="0" max="10" value={form.progress_score} onChange={(e) => setForm({ ...form, progress_score: e.target.value })} /></div>
          <div><Label className="mb-1.5 block">{t("checkin.revenue")}</Label><Input type="number" value={form.income_eur} onChange={(e) => setForm({ ...form, income_eur: e.target.value })} /></div>
        </div>

        <div><Label className="mb-1.5 block">{t("checkin.done")}</Label>
          <Textarea rows={3} required value={form.what_done} onChange={(e) => setForm({ ...form, what_done: e.target.value })} placeholder={t("checkin.done.placeholder")} />
        </div>
        <div><Label className="mb-1.5 block">{t("checkin.blocked")}</Label>
          <Textarea rows={3} required value={form.what_blocked} onChange={(e) => setForm({ ...form, what_blocked: e.target.value })} />
        </div>
        <div><Label className="mb-1.5 block">{t("checkin.focus")}</Label>
          <Textarea rows={2} value={form.next_focus} onChange={(e) => setForm({ ...form, next_focus: e.target.value })} />
        </div>
        <div><Label className="mb-1.5 block">{t("checkin.energy")}</Label>
          <select className="w-full h-10 rounded-md border border-input bg-transparent px-3 text-sm" value={form.mood} onChange={(e) => setForm({ ...form, mood: e.target.value })}>
            <option value="alta">{t("checkin.high")}</option>
            <option value="ok">OK</option>
            <option value="baixa">{t("checkin.low")}</option>
          </select>
        </div>

        <Button type="submit" variant="gold" size="lg" disabled={submitting} className="w-full">
          {submitting ? <><Loader2 className="h-4 w-4 animate-spin" /> {t("checkin.analyzing")}</> : t("checkin.submit")}
        </Button>
      </form>

      <div className="glass-card rounded-2xl p-6 h-fit">
        <div className="flex items-center gap-2 mb-3">
          <Sparkles className="h-4 w-4 text-gold" />
          <p className="text-xs uppercase tracking-widest text-gold">{t("checkin.feedback")}</p>
        </div>
        {feedback ? (
          <p className="text-sm leading-relaxed whitespace-pre-wrap">{feedback}</p>
        ) : (
          <p className="text-sm text-muted-foreground">{t("checkin.feedback.empty")}</p>
        )}
      </div>
    </div>
  );
}
