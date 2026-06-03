import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { supabaseAdmin } from "@/integrations/supabase/client.server";

const Input = z.object({
  ebookId: z.string().uuid(),
  format: z.enum(["pdf", "audio"]).default("pdf"),
  lang: z.enum(["pt", "en"]).default("pt"),
});

function pickPath(
  ebook: {
    pdf_path: string | null;
    pdf_path_pt: string | null;
    pdf_path_en: string | null;
    audio_path_pt: string | null;
    audio_path_en: string | null;
  },
  format: "pdf" | "audio",
  lang: "pt" | "en"
): { bucket: "ebooks" | "audio"; path: string | null } {
  if (format === "audio") {
    return {
      bucket: "audio",
      path: (lang === "en" ? ebook.audio_path_en : ebook.audio_path_pt) ?? null,
    };
  }
  return {
    bucket: "ebooks",
    path:
      (lang === "en" ? ebook.pdf_path_en : ebook.pdf_path_pt) ??
      ebook.pdf_path ??
      null,
  };
}

async function signFor(
  ebookId: string,
  format: "pdf" | "audio",
  lang: "pt" | "en"
) {
  const { data: ebook, error } = await supabaseAdmin
    .from("ebooks")
    .select(
      "id,type,published,pdf_path,pdf_path_pt,pdf_path_en,audio_path_pt,audio_path_en"
    )
    .eq("id", ebookId)
    .maybeSingle();

  if (error || !ebook) return { ok: false as const, error: "Ebook não encontrado." };

  const { bucket, path } = pickPath(ebook, format, lang);
  if (!path) {
    return { ok: false as const, error: "Este formato/idioma ainda não está disponível." };
  }

  const { data: signed, error: sErr } = await supabaseAdmin.storage
    .from(bucket)
    .createSignedUrl(path, 3600);

  if (sErr || !signed) {
    return { ok: false as const, error: "Falha ao assinar o ficheiro." };
  }

  return { ok: true as const, url: signed.signedUrl, ebook };
}

/** Authenticated: works for free, purchased, granted, or admin */
export const getEbookSignedUrl = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => Input.parse(input))
  .handler(async ({ data, context }) => {
    const { userId } = context;

    try {
      await context.supabase.rpc("claim_vault_access_for_email");
    } catch {}

    const { data: allowed } = await supabaseAdmin.rpc("has_ebook_access", {
      _user_id: userId,
      _ebook_id: data.ebookId,
    });

    if (!allowed) {
      return { ok: false as const, error: "Sem acesso a este ebook." };
    }

    const res = await signFor(data.ebookId, data.format, data.lang);
    if (res.ok) {
      try {
        await supabaseAdmin
          .from("downloads")
          .insert({ user_id: userId, ebook_id: data.ebookId });
      } catch {}
    }
    return res.ok ? { ok: true as const, url: res.url } : res;
  });

/** Public: only for ebooks marked free + published */
export const getFreeEbookSignedUrl = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => Input.parse(input))
  .handler(async ({ data }) => {
    const res = await signFor(data.ebookId, data.format, data.lang);
    if (!res.ok) return res;
    if (res.ebook.type !== "free" || !res.ebook.published) {
      return { ok: false as const, error: "Este ebook requer compra." };
    }
    return { ok: true as const, url: res.url };
  });
