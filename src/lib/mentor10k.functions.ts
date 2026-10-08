import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { callMentorAi, parseMentorJson } from "@/lib/mentor10k.server";

// ===== Generate Plan =====
export const generateMentorPlan = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => {
    const i = input as { diagnosticId: string; language?: "pt" | "en" };
    if (!i?.diagnosticId) throw new Error("diagnosticId required");
    return i;
  })
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;

    // Versão de experiência: 1 plano gratuito por utilizador.
    const { data: hasAccess } = await supabase.rpc("has_mentor10k_access", { _user_id: userId });
    if (!hasAccess) {
      const { count } = await supabase
        .from("mentor10k_plans")
        .select("id", { count: "exact", head: true })
        .eq("user_id", userId);
      if ((count ?? 0) >= 1) {
        throw new Error("Já usaste o teu plano gratuito. Adquire o CEO OS para planos ilimitados.");
      }
    }


    const { data: diag, error: diagErr } = await supabase
      .from("mentor10k_diagnostics")
      .select("*")
      .eq("id", data.diagnosticId)
      .single();
    if (diagErr || !diag) throw new Error("Diagnóstico não encontrado");

    const language = data.language === "en" ? "English" : "Português europeu";
    const prompt = `Cria um plano personalizado de 12 semanas para o utilizador chegar a 10.000€/mês.

IDIOMA OBRIGATÓRIO: ${language}. Todo o conteúdo deve estar exclusivamente neste idioma, sem misturar idiomas.

DIAGNÓSTICO:
- Objetivo: ${diag.goal}
- Situação atual: ${diag.current_situation}
- Receita mensal atual: ${diag.monthly_income_eur ?? 0}€
- Horas disponíveis/semana: ${diag.available_hours_week ?? "n/d"}
- Skills: ${diag.skills ?? "n/d"}
- Recursos: ${diag.resources ?? "n/d"}
- Obstáculos: ${diag.obstacles ?? "n/d"}
- Prazo: ${diag.deadline_months ?? 3} meses
- Perfil: ${diag.profile_type ?? "n/d"}

ALINHAMENTO (respostas do utilizador às perguntas do mentor — usa-as para tornar o plano totalmente específico; nunca peças ao utilizador para "escolher" algo que ele já definiu aqui):
${alignmentText(diag.raw_answers)}

Retorna JSON válido com estas chaves exatas em inglês:
- title, summary
- phases: 4 objetos com name, weeks, objective, deliverables
- weekly_tasks: exatamente 12 objetos com week, focus e tasks
- tasks: exatamente 5 ações, uma para cada dia útil, com { day: 1-5, label, outcome, duration_minutes }
- kpis: métricas-chave mensuráveis

Cada label deve começar por um verbo e explicar exatamente o que fazer. Inclui números concretos (quantas mensagens, páginas, chamadas, anúncios ou propostas), a ferramenta/canal quando relevante e o critério de conclusão em outcome. Respeita as horas semanais disponíveis. O plano deve usar o negócio, oferta, nicho e canais concretos do utilizador — nunca instruções genéricas como "escolhe uma skill" ou "define o teu nicho". Não uses ações vagas como “trabalhar na marca”, “fazer marketing”, “pesquisar” ou “melhorar a oferta” sem um resultado específico.`;

    const text = await callMentorAi(prompt, true);

    let parsed: {
      title: string;
      summary: string;
      phases: unknown;
      weekly_tasks: unknown;
      kpis: unknown;
    };
    try {
      parsed = parseMentorJson(text);
    } catch {
      throw new Error("O Mentor gerou um plano inválido. Tenta novamente.");
    }

    const { data: plan, error: insErr } = await supabase
      .from("mentor10k_plans")
      .insert({
        user_id: userId,
        diagnostic_id: data.diagnosticId,
        title: parsed.title,
        summary: parsed.summary,
        phases: parsed.phases as never,
        weekly_tasks: parsed.weekly_tasks as never,
        kpis: parsed.kpis as never,
        duration_weeks: 12,
        status: "active",
        model: "gemini-3.6-flash",
      })
      .select()
      .single();
    if (insErr) throw new Error(insErr.message);
    return { plan };
  });

// ===== Check-in Feedback =====
export const generateCheckinFeedback = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => {
    const i = input as {
      planId: string;
      week_number: number;
      progress_score: number;
      income_eur?: number;
      what_done: string;
      what_blocked: string;
      next_focus?: string;
      mood?: string;
      language?: "pt" | "en";
    };
    if (!i?.planId || !i?.what_done) throw new Error("Campos obrigatórios em falta");
    return i;
  })
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    const { data: hasAccess } = await supabase.rpc("has_mentor10k_access", { _user_id: userId });
    if (!hasAccess) throw new Error("Sem acesso ao CEO OS");

    const { data: plan } = await supabase
      .from("mentor10k_plans")
      .select("title, weekly_tasks, kpis")
      .eq("id", data.planId)
      .single();

    const userPrompt = `Responde exclusivamente em ${data.language === "en" ? "English" : "Português europeu"}.
Check-in semana ${data.week_number} (plano "${plan?.title ?? "—"}"):
- Progresso (0-10): ${data.progress_score}
- Receita esta semana: ${data.income_eur ?? 0}€
- O que fiz: ${data.what_done}
- O que me bloqueou: ${data.what_blocked}
- Próximo foco proposto: ${data.next_focus ?? "—"}
- Energia: ${data.mood ?? "—"}

Dá feedback direto em 4 frases máximo: 1) reconhece o que está bem, 2) aponta o bloqueio real, 3) prescreve a próxima ação, 4) desafia para a próxima semana.`;

    const feedback = await callMentorAi(userPrompt);

    const { data: checkin, error } = await supabase
      .from("mentor10k_checkins")
      .insert({
        user_id: userId,
        plan_id: data.planId,
        week_number: data.week_number,
        progress_score: data.progress_score,
        income_eur: data.income_eur ?? null,
        what_done: data.what_done,
        what_blocked: data.what_blocked,
        next_focus: data.next_focus ?? null,
        mood: data.mood ?? null,
        mentor_feedback: feedback,
      })
      .select()
      .single();
    if (error) throw new Error(error.message);
    return { checkin };
  });

// ===== Chat with Mentor =====
export const askMentor = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => {
    const i = input as { message: string; language?: "pt" | "en" };
    if (!i?.message?.trim()) throw new Error("Mensagem vazia");
    return i;
  })
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    const { data: hasAccess } = await supabase.rpc("has_mentor10k_access", { _user_id: userId });
    if (!hasAccess) {
      const { count } = await supabase
        .from("mentor10k_messages")
        .select("id", { count: "exact", head: true })
        .eq("user_id", userId)
        .eq("role", "user");
      if ((count ?? 0) >= 5) {
        throw new Error("Chegaste ao limite de 5 mensagens gratuitas. Adquire o CEO OS para continuar.");
      }
    }


    const { data: recent } = await supabase
      .from("mentor10k_messages")
      .select("role, content")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(10);

    const { data: latestPlan } = await supabase
      .from("mentor10k_plans")
      .select("title, summary")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    const history = (recent ?? []).reverse()
      .map((m) => `${m.role === "user" ? "Utilizador" : "Mentor"}: ${m.content}`)
      .join("\n");

    const prompt = `Responde exclusivamente em ${data.language === "en" ? "English" : "Português europeu"}; não mistures idiomas.\n\n${latestPlan ? `Plano ativo: ${latestPlan.title}\n${latestPlan.summary}\n\n` : ""}${history ? `Histórico recente:\n${history}\n\n` : ""}Utilizador: ${data.message}\n\nResponde como CEO OS.`;

    const reply = await callMentorAi(prompt);

    await supabase.from("mentor10k_messages").insert([
      { user_id: userId, role: "user", content: data.message },
      { user_id: userId, role: "assistant", content: reply },
    ]);

    return { reply };
  });

function alignmentText(raw: unknown) {
  const a = (raw as { alignment?: Array<{ q: string; a: string }> } | null)?.alignment;
  if (!Array.isArray(a) || !a.length) return "n/d";
  return a.map((x, i) => `${i + 1}. P: ${x.q}\n   R: ${x.a}`).join("\n");
}

// ===== Alignment questions (before plan) =====
export const getAlignmentQuestions = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => {
    const i = input as { diagnosticId: string; language?: "pt" | "en" };
    if (!i?.diagnosticId) throw new Error("diagnosticId required");
    return i;
  })
  .handler(async ({ data, context }) => {
    const { data: diag } = await context.supabase
      .from("mentor10k_diagnostics").select("*").eq("id", data.diagnosticId).single();
    if (!diag) throw new Error("Diagnóstico não encontrado");
    const language = data.language === "en" ? "English" : "Português europeu";
    const prompt = `IDIOMA OBRIGATÓRIO: ${language}.
Antes de criar um plano de 12 semanas para construir uma empresa (agência, marca, e-commerce ou serviços), precisas de eliminar ambiguidades. Com base neste diagnóstico, faz exatamente 4 perguntas curtas e cirúrgicas sobre o que ainda falta saber: o veículo de negócio concreto, a oferta inicial e preço, o cliente-alvo/nicho e o canal de aquisição. Não perguntes o que já está respondido.
Objetivo: ${diag.goal}
Situação: ${diag.current_situation}
Skills: ${diag.skills ?? "n/d"}
Recursos: ${diag.resources ?? "n/d"}
Obstáculos: ${diag.obstacles ?? "n/d"}
Modelo: ${diag.profile_type ?? "n/d"}
Retorna JSON: {"questions": ["...", "...", "...", "..."]}`;
    const text = await callMentorAi(prompt, true);
    try {
      const j = JSON.parse(text.replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/i, "")) as { questions?: unknown[] };
      const questions = (j.questions ?? []).map(String).filter(Boolean).slice(0, 5);
      if (!questions.length) throw new Error();
      return { questions };
    } catch {
      throw new Error(data.language === "en" ? "The mentor could not prepare questions. Try again." : "O mentor não conseguiu preparar as perguntas. Tenta novamente.");
    }
  });
