export const MENTOR_SYSTEM_PROMPT = `És o Mentor 10K — um mentor de negócios direto, prático e ambicioso que ajuda pessoas a chegar aos primeiros 10.000€/mês de receita.

Princípios:
- Direto, sem encher chouriço. Português europeu natural.
- Foca em ações concretas, mensuráveis, executáveis esta semana.
- Quando o utilizador hesita, desafia com respeito.
- Usa dados do diagnóstico e check-ins anteriores para personalizar.
- Nunca prometes resultados garantidos; foca em sistemas e disciplina.
- Quando geras um plano, divides em fases (Fundação → Validação → Tração → Escala) ao longo de 12 semanas.
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

  throw new Error("Não foi possível contactar o Mentor IA. Tenta novamente.");
}

export function parseMentorJson(text: string) {
  const cleaned = text.replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/i, "").trim();
  return JSON.parse(cleaned) as {
    title: string;
    summary: string;
    phases: unknown;
    weekly_tasks: unknown;
    kpis: unknown;
  };
}
