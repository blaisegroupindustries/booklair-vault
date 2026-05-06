import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { supabaseAdmin } from "@/integrations/supabase/client.server";

const Input = z.object({
  ebookId: z.string().uuid(),
  format: z.enum(["pdf", "audio"]).default("pdf"),
  lang: z.enum(["pt", "en"]).default("pt"),
});

export const getEbookSignedUrl = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => Input.parse(input))
  .handler(async ({ data, context }) => {
    const { userId } = context;

    // Try to claim any pending grants by email (no-op if none)
    try {
      await context.supabase.rpc("claim_vault_access_for_email");
    } catch {}

    // Load ebook
    const { data: ebook, error } = await supabaseAdmin
      .from("ebooks")
      .select(
        "id,type,pdf_path,pdf_path_pt,pdf_path_en,audio_path_pt,audio_path_en,preview_pdf_path,preview_audio_path"
      )
      .eq("id", data.ebookId)
      .maybeSingle();

    if (error || !ebook) {
      return { ok: false as const, error: "Ebook não encontrado." };
    }

    // Permission check via DB function
    const { data: allowed } = await supabaseAdmin.rpc("has_ebook_access", {
      _user_id: userId,
      _ebook_id: data.ebookId,
    });

    if (!allowed) {
      return { ok: false as const, error: "Sem acesso a este ebook." };
    }

    let path: string | null = null;
    let bucket: "ebooks" | "audio" = "ebooks";
    if (data.format === "audio") {
      bucket = "audio";
      path = (data.lang === "en" ? ebook.audio_path_en : ebook.audio_path_pt) ?? null;
    } else {
      path =
        (data.lang === "en" ? ebook.pdf_path_en : ebook.pdf_path_pt) ??
        ebook.pdf_path ??
        null;
    }

    if (!path) {
      return { ok: false as const, error: "Este formato/idioma ainda não está disponível." };
    }

    const { data: signed, error: sErr } = await supabaseAdmin.storage
      .from(bucket)
      .createSignedUrl(path, 3600);

    if (sErr || !signed) {
      return { ok: false as const, error: "Falha ao assinar o ficheiro." };
    }

    // Log access
    try {
      await supabaseAdmin.from("downloads").insert({ user_id: userId, ebook_id: ebook.id });
    } catch {}

    return { ok: true as const, url: signed.signedUrl };
  });
