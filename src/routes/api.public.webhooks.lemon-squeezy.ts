import { createFileRoute } from "@tanstack/react-router";
import { createHmac, timingSafeEqual } from "crypto";
import { supabaseAdmin } from "@/integrations/supabase/client.server";

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
        const ebookId = (customData.ebook_id ?? customData.ebookId ?? "").toString();

        // Only act on successful order/subscription events
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

        // Resolve user (may not exist yet)
        let userId: string | null = null;
        try {
          const { data: prof } = await supabaseAdmin
            .from("profiles")
            .select("id")
            .limit(1);
          // best-effort: lookup user by email via admin auth API
          const { data: list } = await supabaseAdmin.auth.admin.listUsers();
          const found = list?.users?.find(
            (u) => u.email?.toLowerCase() === email
          );
          userId = found?.id ?? null;
          void prof;
        } catch {}

        // Determine which ebook(s) to grant
        const ebookIds: string[] = [];
        if (ebookId) ebookIds.push(ebookId);
        else {
          // Fallback: grant the only published premium ebook (Zero to CEO seed)
          const { data: ebs } = await supabaseAdmin
            .from("ebooks")
            .select("id")
            .eq("type", "premium")
            .eq("published", true);
          (ebs ?? []).forEach((e) => ebookIds.push(e.id));
        }

        for (const eid of ebookIds) {
          await supabaseAdmin.from("vault_access_grants").insert({
            user_id: userId,
            email,
            ebook_id: eid,
            source: "lemon_squeezy",
            external_order_id: orderId,
            notes: eventName,
          });

          if (userId) {
            await supabaseAdmin.from("purchases").insert({
              user_id: userId,
              ebook_id: eid,
              amount_paid: Number(orderAttrs.total ?? 0) / 100 || 0,
              currency: orderAttrs.currency ?? "USD",
              status: "completed",
              stripe_session_id: orderId,
            });
          }
        }

        await supabaseAdmin.from("activity_log").insert({
          action: "lemon_squeezy.webhook",
          actor_email: email,
          entity_type: "purchase",
          details: { event: eventName, order_id: orderId, ebook_ids: ebookIds },
        });

        return new Response("ok", { status: 200 });
      },
    },
  },
});
