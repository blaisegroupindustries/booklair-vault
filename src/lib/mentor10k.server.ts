export const MENTOR_SYSTEM_PROMPT = `És o Mentor 10K — um mentor de negócios direto, prático e ambicioso que ajuda pessoas a chegar aos primeiros 10.000€/mês de receita.

Princípios:
- Responde exclusivamente no idioma pedido em cada solicitação, sem misturar português e inglês. Quando for português, usa português europeu natural.
- Foca em ações concretas, mensuráveis, executáveis esta semana.
- Quando o utilizador hesita, desafia com respeito.
- Usa dados do diagnóstico e check-ins anteriores para personalizar.
- Nunca prometes resultados garantidos; foca em sistemas e disciplina.
- Quando geras um plano, divides em quatro fases ao longo de 12 semanas e defines uma ação concreta para cada dia útil.
- Cada ação diária começa com um verbo, diz exatamente o que produzir ou contactar, inclui uma quantidade mensurável e termina num resultado verificável. Nunca uses conselhos vagos.
- Quando dás feedback de check-in: 1) reconhece o progresso real, 2) aponta o bloqueio principal, 3) prescreve a próxima ação. Máximo 4 frases.`;

// Modelos verificados na API Gemini (fallback em cascata se um falhar).
const GEMINI_MODELS = ["gemini-3.6-flash", "gemini-2.5-flash", "gemini-flash-latest"];

interface GeminiResponse {
  candidates?: Array<{ content?: { parts?: Array<{ text?: string }> } }>;
  error?: { message?: string; code?: number };
}

export async function callMentorAi(userPrompt: string, jsonOnly = false) {
  const apiKey = process.env["GEMINI_API_KEY"];
  if (!apiKey) {
    console.error("[Mentor10K] GEMINI_API_KEY em falta neste ambiente");
    throw new Error(
      "O Mentor IA ainda não está ativo nesta versão do site. Se acabaste de publicar, tenta novamente dentro de alguns minutos.",
    );
  }


  const body = {
    systemInstruction: { parts: [{ text: MENTOR_SYSTEM_PROMPT }] },
    contents: [{ role: "user", parts: [{ text: userPrompt }] }],
    generationConfig: jsonOnly
      ? { responseMimeType: "application/json", temperature: 0.7 }
      : { temperature: 0.8 },
  };

  let lastError = "";

  for (const model of GEMINI_MODELS) {
    try {
      const res = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json", "x-goog-api-key": apiKey },
          body: JSON.stringify(body),
        },
      );

      if (!res.ok) {
        const errText = await res.text();
        lastError = `${res.status} ${errText.slice(0, 300)}`;
        console.error("[Mentor10K Gemini]", model, lastError);
        if (res.status === 429) {
          throw new Error("O Mentor está com muita procura. Tenta novamente dentro de alguns segundos.");
        }
        if (res.status === 401 || res.status === 403 || (res.status === 400 && errText.includes("API key"))) {
          throw new Error("A chave do Mentor IA foi recusada. Verifica a chave nas definições do projeto.");
        }
        // 404 (modelo indisponível) ou 5xx → tenta o próximo modelo
        continue;
      }


      const json = (await res.json()) as GeminiResponse;
      const text = (json.candidates?.[0]?.content?.parts ?? [])
        .map((p) => p.text ?? "")
        .join("")
        .trim();

      if (!text) {
        lastError = "resposta vazia";
        continue;
      }
      return text;
    } catch (error) {
      if (error instanceof Error && error.message.startsWith("O Mentor") ) throw error;
      if (error instanceof Error && error.message.startsWith("A chave")) throw error;
      lastError = error instanceof Error ? error.message : String(error);
      console.error("[Mentor10K Gemini]", model, lastError);
    }
  }

  console.error("[Mentor10K Gemini] falha final:", lastError);
  throw new Error(`Não foi possível contactar o Mentor IA (${lastError.slice(0, 120)}). Tenta novamente.`);

}

export function parseMentorJson(text: string) {
  const cleaned = text.replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/i, "").trim();
  const raw = JSON.parse(cleaned) as Record<string, unknown>;
  const rawPhases = Array.isArray(raw.phases) ? raw.phases : [];
  const rawWeeks = Array.isArray(raw.weekly_tasks) ? raw.weekly_tasks : [];

  return {
    title: String(raw.title ?? raw.titulo ?? "O teu plano Mentor 10K"),
    summary: String(raw.summary ?? raw.resumo ?? "Plano personalizado para os próximos 90 dias."),
    phases: rawPhases.map((value) => {
      const phase = value as Record<string, unknown>;
      return {
        name: String(phase.name ?? phase.nome ?? "Fase"),
        weeks: String(phase.weeks ?? phase.semanas ?? ""),
        objective: String(phase.objective ?? phase.objetivo ?? ""),
        deliverables: Array.isArray(phase.deliverables)
          ? phase.deliverables.map(String)
          : Array.isArray(phase.entregas)
            ? phase.entregas.map(String)
            : [],
      };
    }),
    weekly_tasks: rawWeeks.map((value, index) => {
      const week = value as Record<string, unknown>;
      return {
        week: Number(week.week ?? week.semana ?? index + 1),
        focus: String(week.focus ?? week.foco ?? `Semana ${index + 1}`),
        tasks: (Array.isArray(week.tasks) ? week.tasks : Array.isArray(week.tarefas) ? week.tarefas : []).map((value, taskIndex) => {
          if (typeof value === "string") return { day: taskIndex + 1, label: value, outcome: "", duration_minutes: 0 };
          const task = value as Record<string, unknown>;
          return {
            day: Number(task.day ?? task.dia ?? taskIndex + 1),
            label: String(task.label ?? task.action ?? task.acao ?? task.texto ?? task.descricao ?? ""),
            outcome: String(task.outcome ?? task.resultado ?? task.deliverable ?? task.entrega ?? ""),
            duration_minutes: Number(task.duration_minutes ?? task.duracao_minutos ?? task.duration ?? 0),
          };
        }).filter((task) => task.label),
      };
    }),
    kpis: Array.isArray(raw.kpis) ? raw.kpis.map(String) : [],
  };
}
