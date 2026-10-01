import { createFileRoute } from "@tanstack/react-router";
import { createHmac, timingSafeEqual } from "crypto";

export const Route = createFileRoute("/api/public/webhooks/lemon-squeezy")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const secret = process.env.LEMON_SQUEEZY_WEBHOOK_SECRET;
        const signature = request.headers.get("x-signature");
        const body = await request.text();

        if (!secret) {
          return new Response("Webhook secret not configured", { status: 500 });
        }
        if (!signature) {
          return new Response("Missing signature", { status: 401 });
        }

        const expected = createHmac("sha256", secret).update(body).digest("hex");
        const a = Buffer.from(signature);
        const b = Buffer.from(expected);
        if (a.length !== b.length || !timingSafeEqual(a, b)) {
          return new Response("Invalid signature", { status: 401 });
        }

        let payload: any;
        try {
          payload = JSON.parse(body);
        } catch {
          return new Response("Bad JSON", { status: 400 });
        }

        const eventName = payload?.meta?.event_name as string | undefined;
        const customData = payload?.meta?.custom_data ?? {};
        const orderAttrs = payload?.data?.attributes ?? {};
        const email = (orderAttrs.user_email ?? customData.email ?? "")
          .toString()
          .toLowerCase();
        const orderId = (payload?.data?.id ?? orderAttrs.identifier ?? "").toString();
        const ebookIdFromCustomData = (customData.ebook_id ?? customData.ebookId ?? "").toString();

        // Só nos interessam eventos de compra/subscrição bem-sucedida.
        const okEvents = new Set([
          "order_created",
          "order_paid",
          "subscription_created",
          "subscription_payment_success",
        ]);
        if (!eventName || !okEvents.has(eventName)) {
          return new Response("ignored", { status: 200 });
        }

        if (!email) return new Response("missing email", { status: 200 });

        const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

        // Estado do pedido (order_created também dispara para pedidos ainda
        // não pagos em certos fluxos — filtramos aqui por segurança).
        const status: string = (orderAttrs.status ?? "paid").toString();
        if (eventName.startsWith("order_") && status !== "paid") {
          return new Response("order not paid yet", { status: 200 });
        }

        // Resolve o utilizador (pode ainda não ter conta criada no site).
        let userId: string | null = null;
        try {
          const { data: list } = await supabaseAdmin.auth.admin.listUsers();
          const found = list?.users?.find(
            (u) => u.email?.toLowerCase() === email
          );
          userId = found?.id ?? null;
        } catch (err) {
          console.error("Erro ao procurar utilizador:", err);
        }

        // Produto Mentor 10K → liberta acesso ao programa, não a um ebook.
        const productNameRaw: string = (
          orderAttrs.first_order_item?.product_name ??
          orderAttrs.first_order_item?.variant_name ??
          ""
        ).toString();

        if (/mentor\s*10k/i.test(productNameRaw) || customData.product === "mentor10k") {
          const { error: mErr } = await (supabaseAdmin.from("mentor10k_access") as any).insert({
            user_id: userId,
            email,
            source: "lemon_squeezy",
            external_order_id: orderId,
            notes: productNameRaw,
          });
          if (mErr) console.error("Erro ao libertar Mentor 10K:", mErr);

          const { data: zeroToCeo } = await supabaseAdmin
            .from("ebooks")
            .select("id")
            .eq("id", "9c3bc4d5-0d75-41c7-aecf-7d770090618f")
            .maybeSingle();

          if (zeroToCeo) {
            const { data: existingGrant } = await supabaseAdmin
              .from("vault_access_grants")
              .select("id")
              .eq("ebook_id", zeroToCeo.id)
              .or(userId ? `user_id.eq.${userId},email.eq.${email}` : `email.eq.${email}`)
              .limit(1)
              .maybeSingle();

            if (!existingGrant) {
              const { error: bonusErr } = await supabaseAdmin.from("vault_access_grants").insert({
                user_id: userId,
                email,
                ebook_id: zeroToCeo.id,
                source: "mentor10k_bonus",
                external_order_id: orderId,
                notes: "Bónus incluído na compra do Mentor 10K",
              });
              if (bonusErr) console.error("Erro ao libertar bónus Zero to CEO:", bonusErr);
            }
          }
          return new Response("ok", { status: 200 });
        }

        // Determina qual(is) ebook(s) libertar.
        // Se o checkout não enviou custom_data.ebook_id (o mais provável, já
        // que o Lemon Squeezy não expõe isso na UI atual do produto),
        // fazemos fallback: usamos o nome do produto do pedido para
        // encontrar o ebook correspondente pela coluna `slug`/`title`.

        let ebookId: string | null = null;
        let ebookSlug: string | null = null;

        if (ebookIdFromCustomData) {
          ebookId = ebookIdFromCustomData;
        } else {
          const productName: string = (
            orderAttrs.first_order_item?.product_name ?? ""
          ).toString();

          const { data: matched } = await supabaseAdmin
            .from("ebooks")
            .select("id, slug")
            .ilike("title", `%${productName}%`)
            .limit(1)
            .maybeSingle();

          if (matched) {
            ebookId = matched.id;
            ebookSlug = matched.slug;
          } else {
            // Último recurso: liberta o único ebook premium publicado.
            const { data: fallback } = await supabaseAdmin
              .from("ebooks")
              .select("id, slug")
              .eq("published", true)
              .limit(1)
              .maybeSingle();
            if (fallback) {
              ebookId = fallback.id;
              ebookSlug = fallback.slug;
            }
          }
        }

        const amountUsd = Number(orderAttrs.total_usd ?? orderAttrs.total ?? 0) / 100;

        const { error } = await (supabaseAdmin.from("purchases") as any).upsert(
          {
            user_id: userId,
            email,
            ebook_id: ebookId,
            ebook_slug: ebookSlug,
            provider: "lemon_squeezy",
            provider_order_id: orderId,
            status: "completed",
            amount_usd: amountUsd || 0,
            raw: payload,
          },
          { onConflict: "provider,provider_order_id" }
        );


        if (error) {
          console.error("Erro ao gravar compra no Supabase:", error);
          return new Response("db error", { status: 200 }); // 200 para o LS não repetir infinitamente; erro fica registado no log do Vercel
        }

        return new Response("ok", { status: 200 });
      },
    },
  },
});
