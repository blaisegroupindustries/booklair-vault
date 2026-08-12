import { streamText } from "ai";
import { createMentorAiProvider } from "@/lib/ai-gateway.server";

export const MENTOR_SYSTEM_PROMPT = `És o Mentor 10K — um mentor de negócios direto, prático e ambicioso que ajuda pessoas a chegar aos primeiros 10.000€/mês de receita.

Princípios:
- Direto, sem encher chouriço. Português europeu natural.
- Foca em ações concretas, mensuráveis, executáveis esta semana.
- Quando o utilizador hesita, desafia com respeito.
- Usa dados do diagnóstico e check-ins anteriores para personalizar.
- Nunca prometes resultados garantidos; foca em sistemas e disciplina.
- Quando geras um plano, divides em fases (Fundação → Validação → Tração → Escala) ao longo de 12 semanas.
- Quando dás feedback de check-in: 1) reconhece o progresso real, 2) aponta o bloqueio principal, 3) prescreve a próxima ação. Máximo 4 frases.`;

export async function callMentorAi(userPrompt: string, jsonOnly = false) {
  const lovableApiKey = process.env["LOVABLE_API_KEY"];
  if (!lovableApiKey) {
    throw new Error("O Mentor IA não está configurado. Tenta novamente dentro de instantes.");
  }

  try {
    const result = streamText({
      model: createMentorAiProvider(lovableApiKey),
      system: MENTOR_SYSTEM_PROMPT,
      prompt: jsonOnly
        ? `${userPrompt}\n\nResponde exclusivamente com um objeto JSON válido, sem markdown nem blocos de código.`
        : userPrompt,
      providerOptions: {
        openai: {
          forceReasoning: true,
          reasoningEffort: "medium",
          reasoningSummary: "auto",
          store: false,
          include: ["reasoning.encrypted_content"],
        },
      },
    });
    const text = (await result.text).trim();
    if (!text) throw new Error("empty_response");
    return text;
  } catch (error) {
    console.error("[Mentor10K AI]", error);
    const message = error instanceof Error ? error.message : "";
    if (message.includes("402")) {
      throw new Error("Os créditos do Mentor IA esgotaram. Contacta o suporte.");
    }
    if (message.includes("429")) {
      throw new Error("O Mentor está com muita procura. Tenta novamente dentro de alguns segundos.");
    }
    throw new Error("Não foi possível contactar o Mentor IA. Tenta novamente.");
  }
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