import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { callMentorAi, parseMentorJson } from "@/lib/mentor10k.server";

export interface SiteContent {
  brand: { name: string; tagline: string; tone: string; primary: string; accent: string };
  hero: { headline: string; subheadline: string; cta_label: string; cta_link: string };
  problem: { title: string; points: string[] };
  solution: { title: string; body: string };
  offers: Array<{ name: string; price: string; description: string; features: string[] }>;
  about: { title: string; body: string };
  faq: Array<{ q: string; a: string }>;
  contact: { title: string; body: string; email: string; whatsapp: string };
}

export const generateMentorSite = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => {
    const i = (input ?? {}) as { language?: "pt" | "en" };
    return { language: i.language === "pt" ? "pt" : "en" } as const;
  })
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    const { data: plan } = await supabase
      .from("mentor10k_plans")
      .select("id, title, summary, diagnostic_id")
      .eq("user_id", userId)
      .neq("status", "archived")
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();
    if (!plan) throw new Error(data.language === "pt" ? "Cria primeiro o teu plano." : "Create your plan first.");
    const { data: diag } = plan.diagnostic_id
      ? await supabase.from("mentor10k_diagnostics").select("*").eq("id", plan.diagnostic_id).maybeSingle()
      : { data: null };

    const lang = data.language === "pt" ? "Português europeu" : "English";
    const prompt = `Create a high-converting one-page website for this person's business.
MANDATORY LANGUAGE: ${lang}. All text exclusively in this language.

PLAN: ${plan.title} — ${plan.summary ?? ""}
GOAL: ${diag?.goal ?? ""}
SITUATION: ${diag?.current_situation ?? ""}
SKILLS: ${diag?.skills ?? ""}
PROFILE: ${diag?.profile_type ?? ""}
ALIGNMENT: ${JSON.stringify(diag?.raw_answers ?? {}).slice(0, 2500)}

Use the real business, offer and audience. No placeholders like "Your Company" or lorem ipsum. Return valid JSON only:
{"brand":{"name","tagline","tone","primary":"#hex dark-ish","accent":"#hex vivid"},
"hero":{"headline","subheadline","cta_label","cta_link":""},
"problem":{"title","points":[3 strings]},
"solution":{"title","body"},
"offers":[3 items {"name","price","description","features":[3 strings]}],
"about":{"title","body"},
"faq":[4 items {"q","a"}],
"contact":{"title","body","email":"","whatsapp":""}}`;

    const text = await callMentorAi(prompt, true);
    let content: SiteContent;
    try {
      content = parseMentorJson(text) as unknown as SiteContent;
    } catch {
      throw new Error(data.language === "pt" ? "A IA gerou um site inválido. Tenta novamente." : "The AI returned an invalid site. Try again.");
    }
    const { data: row, error } = await supabase
      .from("mentor_sites")
      .upsert({ user_id: userId, plan_id: plan.id, content: content as never }, { onConflict: "user_id" })
      .select()
      .single();
    if (error) throw new Error(error.message);
    return { site: row };
  });
