import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState, type FormEvent } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const Route = createFileRoute("/admin/settings")({
  component: SettingsPage,
});

interface Settings {
  site_name: string;
  tagline: string;
  logo_url: string;
  contact_email: string;
  footer_text: string;
  banner_enabled: boolean;
  banner_text: string;
  banner_link: string;
  social_instagram: string;
  social_facebook: string;
  social_tiktok: string;
  social_youtube: string;
  social_x: string;
  social_linkedin: string;
  social_whatsapp: string;
  mentor10k_checkout_url: string;
  mentor10k_price_usd: string;
}

const EMPTY: Settings = {
  site_name: "Booklair", tagline: "", logo_url: "", contact_email: "", footer_text: "",
  banner_enabled: false, banner_text: "", banner_link: "",
  social_instagram: "", social_facebook: "", social_tiktok: "", social_youtube: "",
  social_x: "", social_linkedin: "", social_whatsapp: "",
  mentor10k_checkout_url: "", mentor10k_price_usd: "",
};


function SettingsPage() {
  const [s, setS] = useState<Settings>(EMPTY);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    supabase.from("site_settings").select("*").eq("id", true).maybeSingle().then(({ data }) => {
      if (data) setS({ ...EMPTY, ...(data as unknown as Partial<Settings>) });
      setLoading(false);
    });
  }, []);

  const upd = <K extends keyof Settings>(k: K, v: Settings[K]) => setS((p) => ({ ...p, [k]: v }));

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setSaving(true);
    const payload = {
      ...s,
      mentor10k_price_usd: s.mentor10k_price_usd ? Number(s.mentor10k_price_usd) : null,
      mentor10k_checkout_url: s.mentor10k_checkout_url || null,
    };
    const { error } = await supabase.from("site_settings").update(payload as never).eq("id", true);

    setSaving(false);
    if (error) toast.error(error.message);
    else toast.success("Configurações guardadas");
  };

  if (loading) return <div className="text-center py-10 text-muted-foreground">A carregar…</div>;

  return (
    <form onSubmit={onSubmit} className="space-y-6 max-w-3xl">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-serif text-2xl">Site & Redes Sociais</h2>
          <p className="text-sm text-muted-foreground">Configura a identidade pública da Booklair.</p>
        </div>
        <Button type="submit" variant="gold" disabled={saving}>{saving ? "A guardar…" : "Guardar"}</Button>
      </div>

      <section className="surface-card rounded-2xl p-6 space-y-4">
        <h3 className="font-serif text-lg">Identidade</h3>
        <div className="grid md:grid-cols-2 gap-4">
          <Field label="Nome do site"><Input value={s.site_name} onChange={(e) => upd("site_name", e.target.value)} /></Field>
          <Field label="Email de contacto"><Input type="email" value={s.contact_email} onChange={(e) => upd("contact_email", e.target.value)} /></Field>
        </div>
        <Field label="Tagline"><Input value={s.tagline} onChange={(e) => upd("tagline", e.target.value)} /></Field>
        <Field label="URL do logo"><Input value={s.logo_url} onChange={(e) => upd("logo_url", e.target.value)} placeholder="https://…" /></Field>
        <Field label="Texto do rodapé"><Textarea rows={2} value={s.footer_text} onChange={(e) => upd("footer_text", e.target.value)} /></Field>
      </section>

      <section className="surface-card rounded-2xl p-6 space-y-4">
        <h3 className="font-serif text-lg">Mentor 10K</h3>
        <p className="text-xs text-muted-foreground">Link de pagamento usado por todos os botões “Adquirir o Mentor 10K”.</p>
        <Field label="Link de checkout (Lemon Squeezy)">
          <Input value={s.mentor10k_checkout_url} onChange={(e) => upd("mentor10k_checkout_url", e.target.value)} placeholder="https://booklair.lemonsqueezy.com/checkout/buy/…" />
        </Field>
        <Field label="Preço (USD)">
          <Input type="number" step="0.01" value={s.mentor10k_price_usd} onChange={(e) => upd("mentor10k_price_usd", e.target.value)} placeholder="97" />
        </Field>
      </section>



      <section className="surface-card rounded-2xl p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-serif text-lg">Banner promocional global</h3>
          <Switch checked={s.banner_enabled} onCheckedChange={(v) => upd("banner_enabled", v)} />
        </div>
        <p className="text-xs text-muted-foreground">Aparece no topo do site quando ativo.</p>
        <Field label="Texto do banner"><Input value={s.banner_text} onChange={(e) => upd("banner_text", e.target.value)} placeholder="Ex: 30% off em todos os ebooks até domingo" /></Field>
        <Field label="Link (opcional)"><Input value={s.banner_link} onChange={(e) => upd("banner_link", e.target.value)} placeholder="/loja" /></Field>
      </section>

      <section className="surface-card rounded-2xl p-6 space-y-4">
        <h3 className="font-serif text-lg">Redes sociais</h3>
        <p className="text-xs text-muted-foreground">URLs completos. Deixa em branco para esconder.</p>
        <div className="grid md:grid-cols-2 gap-4">
          <Field label="Instagram"><Input value={s.social_instagram} onChange={(e) => upd("social_instagram", e.target.value)} placeholder="https://instagram.com/booklair" /></Field>
          <Field label="Facebook"><Input value={s.social_facebook} onChange={(e) => upd("social_facebook", e.target.value)} /></Field>
          <Field label="TikTok"><Input value={s.social_tiktok} onChange={(e) => upd("social_tiktok", e.target.value)} /></Field>
          <Field label="YouTube"><Input value={s.social_youtube} onChange={(e) => upd("social_youtube", e.target.value)} /></Field>
          <Field label="X (Twitter)"><Input value={s.social_x} onChange={(e) => upd("social_x", e.target.value)} /></Field>
          <Field label="LinkedIn"><Input value={s.social_linkedin} onChange={(e) => upd("social_linkedin", e.target.value)} /></Field>
          <Field label="WhatsApp" hint="Número internacional, ex: +258840000000"><Input value={s.social_whatsapp} onChange={(e) => upd("social_whatsapp", e.target.value)} /></Field>
        </div>
      </section>
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
