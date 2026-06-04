import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

const MENTOR_SYSTEM_PROMPT = `És o Mentor 10K — um mentor de negócios direto, prático e ambicioso que ajuda pessoas a chegar aos primeiros 10.000€/mês de receita.

Princípios:
- Direto, sem encher chouriço. Português europeu natural.
- Foca em ações concretas, mensuráveis, executáveis esta semana.
- Quando o utilizador hesita, desafia com respeito.
- Usa dados do diagnóstico e check-ins anteriores para personalizar.
- Nunca prometes resultados garantidos; foca em sistemas e disciplina.
- Quando geras um plano, divides em fases (Fundação → Validação → Tração → Escala) ao longo de 12 semanas.
- Quando dás feedback de check-in: 1) reconhece o progresso real, 2) aponta o bloqueio principal, 3) prescreve a próxima ação. Máximo 4 frases.`;

async function callGemini(payload: {
  systemPrompt: string;
  userPrompt: string;
  jsonSchema?: object;
}): Promise<string> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) throw new Error("Missing GEMINI_API_KEY");

  const body: Record<string, unknown> = {
    contents: [{ role: "user", parts: [{ text: payload.userPrompt }] }],
    systemInstruction: { parts: [{ text: payload.systemPrompt }] },
  };
  if (payload.jsonSchema) {
    body.generationConfig = {
      responseMimeType: "application/json",
      responseSchema: payload.jsonSchema,
    };
  }

  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`;
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const txt = await res.text();
    throw new Error(`Gemini API ${res.status}: ${txt.slice(0, 300)}`);
  }
  const json = await res.json() as { candidates?: Array<{ content?: { parts?: Array<{ text?: string }> } }> };
  const text = json.candidates?.[0]?.content?.parts?.map((p) => p.text).join("") ?? "";
  if (!text) throw new Error("Gemini returned empty response");
  return text;
}

// ===== Generate Plan =====
export const generateMentorPlan = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => {
    const i = input as { diagnosticId: string };
    if (!i?.diagnosticId) throw new Error("diagnosticId required");
    return i;
  })
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;

    const { data: hasAccess } = await supabase.rpc("has_mentor10k_access", { _user_id: userId });
    if (!hasAccess) throw new Error("Sem acesso ao Mentor 10K");

    const { data: diag, error: diagErr } = await supabase
      .from("mentor10k_diagnostics")
      .select("*")
      .eq("id", data.diagnosticId)
      .single();
    if (diagErr || !diag) throw new Error("Diagnóstico não encontrado");

    const prompt = `Cria um plano personalizado de 12 semanas para o utilizador chegar a 10.000€/mês.

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

Retorna JSON com: title, summary, phases (array de 4: nome, semanas, objetivo, entregas), weekly_tasks (array de 12 semanas: week, focus, tasks[3-5]), kpis (array de métricas-chave a acompanhar).`;

    const schema = {
      type: "object",
      properties: {
        title: { type: "string" },
        summary: { type: "string" },
        phases: {
          type: "array",
          items: {
            type: "object",
            properties: {
              name: { type: "string" },
              weeks: { type: "string" },
              objective: { type: "string" },
              deliverables: { type: "array", items: { type: "string" } },
            },
            required: ["name", "weeks", "objective", "deliverables"],
          },
        },
        weekly_tasks: {
          type: "array",
          items: {
            type: "object",
            properties: {
              week: { type: "integer" },
              focus: { type: "string" },
              tasks: { type: "array", items: { type: "string" } },
            },
            required: ["week", "focus", "tasks"],
          },
        },
        kpis: { type: "array", items: { type: "string" } },
      },
      required: ["title", "summary", "phases", "weekly_tasks", "kpis"],
    };

    const text = await callGemini({
      systemPrompt: MENTOR_SYSTEM_PROMPT,
      userPrompt: prompt,
      jsonSchema: schema,
    });

    let parsed: {
      title: string;
      summary: string;
      phases: unknown;
      weekly_tasks: unknown;
      kpis: unknown;
    };
    try {
      parsed = JSON.parse(text);
    } catch {
      throw new Error("Plano inválido recebido do Gemini");
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
        model: "gemini-2.5-flash",
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

    const userPrompt = `Check-in semana ${data.week_number} (plano "${plan?.title ?? "—"}"):
- Progresso (0-10): ${data.progress_score}
- Receita esta semana: ${data.income_eur ?? 0}€
- O que fiz: ${data.what_done}
- O que me bloqueou: ${data.what_blocked}
- Próximo foco proposto: ${data.next_focus ?? "—"}
- Energia: ${data.mood ?? "—"}

Dá feedback direto em 4 frases máximo: 1) reconhece o que está bem, 2) aponta o bloqueio real, 3) prescreve a próxima ação, 4) desafia para a próxima semana.`;

    const feedback = await callGemini({
      systemPrompt: MENTOR_SYSTEM_PROMPT,
      userPrompt,
    });

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
    const i = input as { message: string };
    if (!i?.message?.trim()) throw new Error("Mensagem vazia");
    return i;
  })
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    const { data: hasAccess } = await supabase.rpc("has_mentor10k_access", { _user_id: userId });
    if (!hasAccess) throw new Error("Sem acesso ao Mentor 10K");

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

    const prompt = `${latestPlan ? `Plano ativo: ${latestPlan.title}\n${latestPlan.summary}\n\n` : ""}${history ? `Histórico recente:\n${history}\n\n` : ""}Utilizador: ${data.message}\n\nResponde como Mentor 10K.`;

    const reply = await callGemini({
      systemPrompt: MENTOR_SYSTEM_PROMPT,
      userPrompt: prompt,
    });

    await supabase.from("mentor10k_messages").insert([
      { user_id: userId, role: "user", content: data.message },
      { user_id: userId, role: "assistant", content: reply },
    ]);

    return { reply };
  });
