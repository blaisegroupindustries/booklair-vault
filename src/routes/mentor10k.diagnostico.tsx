import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Loader2, Target } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { toast } from "sonner";

export const Route = createFileRoute("/mentor10k/diagnostico")({
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
    <form onSubmit={submit} className="glass-card rounded-2xl p-6 md:p-8 space-y-6 max-w-3xl">
      <div className="flex items-start gap-3">
        <div className="h-10 w-10 rounded-xl bg-gold/15 flex items-center justify-center"><Target className="h-5 w-5 text-gold" /></div>
        <div>
          <h2 className="font-serif text-2xl">Diagnóstico inicial</h2>
          <p className="text-sm text-muted-foreground">Sê honesto. O plano é tão bom quanto a informação que dás.</p>
        </div>
      </div>

      <Field label="O teu objetivo (em uma frase) *">
        <Textarea rows={2} required value={form.goal} onChange={(e) => setForm({ ...form, goal: e.target.value })} placeholder="Ex: Chegar a 10.000€/mês com consultoria de marketing em 6 meses." />
      </Field>

      <Field label="Onde estás agora? *">
        <Textarea rows={3} required value={form.current_situation} onChange={(e) => setForm({ ...form, current_situation: e.target.value })} placeholder="O que fazes, há quanto tempo, o que já tentaste…" />
      </Field>

      <div className="grid md:grid-cols-2 gap-4">
        <Field label="Receita mensal atual (€)">
          <Input type="number" inputMode="decimal" value={form.monthly_income_eur} onChange={(e) => setForm({ ...form, monthly_income_eur: e.target.value })} placeholder="0" />
        </Field>
        <Field label="Horas disponíveis por semana">
          <Input type="number" value={form.available_hours_week} onChange={(e) => setForm({ ...form, available_hours_week: e.target.value })} placeholder="20" />
        </Field>
      </div>

      <Field label="As tuas skills principais">
        <Textarea rows={2} value={form.skills} onChange={(e) => setForm({ ...form, skills: e.target.value })} placeholder="Ex: copywriting, vídeo, vendas B2B…" />
      </Field>

      <Field label="Recursos de que dispões">
        <Textarea rows={2} value={form.resources} onChange={(e) => setForm({ ...form, resources: e.target.value })} placeholder="Audiência, capital, ferramentas, rede de contactos…" />
      </Field>

      <Field label="O que te tem bloqueado?">
        <Textarea rows={2} value={form.obstacles} onChange={(e) => setForm({ ...form, obstacles: e.target.value })} placeholder="Sê específico." />
      </Field>

      <div className="grid md:grid-cols-2 gap-4">
        <Field label="Prazo (meses)">
          <select className="w-full h-10 rounded-md border border-input bg-transparent px-3 text-sm" value={form.deadline_months} onChange={(e) => setForm({ ...form, deadline_months: e.target.value })}>
            <option value="3">3 meses</option>
            <option value="6">6 meses</option>
            <option value="12">12 meses</option>
          </select>
        </Field>
        <Field label="Perfil">
          <select className="w-full h-10 rounded-md border border-input bg-transparent px-3 text-sm" value={form.profile_type} onChange={(e) => setForm({ ...form, profile_type: e.target.value })}>
            <option value="solo">Solo / freelancer</option>
            <option value="creator">Creator / audiência</option>
            <option value="agency">Agência</option>
            <option value="ecom">E-commerce</option>
            <option value="saas">SaaS / produto digital</option>
            <option value="other">Outro</option>
          </select>
        </Field>
      </div>

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
