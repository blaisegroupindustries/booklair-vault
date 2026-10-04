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
        throw new Error("Já usaste o teu plano gratuito. Adquire o Mentor 10K para planos ilimitados.");
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

Retorna JSON válido com estas chaves exatas em inglês:
- title, summary
- phases: 4 objetos com name, weeks, objective, deliverables
- weekly_tasks: exatamente 12 objetos com week, focus e tasks
- tasks: exatamente 5 ações, uma para cada dia útil, com { day: 1-5, label, outcome, duration_minutes }
- kpis: métricas-chave mensuráveis

Cada label deve começar por um verbo e explicar exatamente o que fazer. Inclui números concretos (quantas mensagens, páginas, chamadas, anúncios ou propostas), a ferramenta/canal quando relevante e o critério de conclusão em outcome. Respeita as horas semanais disponíveis. Não uses ações vagas como “trabalhar na marca”, “fazer marketing”, “pesquisar” ou “melhorar a oferta” sem um resultado específico.`;

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
    if (!hasAccess) throw new Error("Sem acesso ao Mentor 10K");

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
        throw new Error("Chegaste ao limite de 5 mensagens gratuitas. Adquire o Mentor 10K para continuar.");
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

    const prompt = `Responde exclusivamente em ${data.language === "en" ? "English" : "Português europeu"}; não mistures idiomas.\n\n${latestPlan ? `Plano ativo: ${latestPlan.title}\n${latestPlan.summary}\n\n` : ""}${history ? `Histórico recente:\n${history}\n\n` : ""}Utilizador: ${data.message}\n\nResponde como Mentor 10K.`;

    const reply = await callMentorAi(prompt);

    await supabase.from("mentor10k_messages").insert([
      { user_id: userId, role: "user", content: data.message },
      { user_id: userId, role: "assistant", content: reply },
    ]);

    return { reply };
  });
