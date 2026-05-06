import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { BookOpen, ShoppingBag, Lock, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/auth";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/perfil")({
  head: () => ({ meta: [{ title: "O meu Cofre — Booklair" }] }),
  component: ProfilePage,
});

interface VaultEbook {
  id: string;
  slug: string;
  title: string;
  cover_url: string | null;
  type: "free" | "premium";
}

function ProfilePage() {
  const { user, loading, signOut } = useAuth();
  const navigate = useNavigate();
  const [ebooks, setEbooks] = useState<VaultEbook[]>([]);
  const [profile, setProfile] = useState<{ full_name: string | null; avatar_url: string | null } | null>(null);

  useEffect(() => {
    if (!loading && !user) navigate({ to: "/auth" });
  }, [loading, user, navigate]);

  useEffect(() => {
    if (!user) return;

    // Claim grants previously created by email (e.g. via webhook)
    void supabase.rpc("claim_vault_access_for_email" as never);

    void supabase
      .from("profiles")
      .select("full_name, avatar_url")
      .eq("id", user.id)
      .maybeSingle()
      .then(({ data }) => setProfile(data));

    (async () => {
      const [{ data: purchases }, { data: grants }] = await Promise.all([
        supabase
          .from("purchases")
          .select("ebook_id")
          .eq("user_id", user.id)
          .eq("status", "completed"),
        supabase
          .from("vault_access_grants")
          .select("ebook_id")
          .eq("user_id", user.id),
      ]);
      const ids = Array.from(
        new Set([
          ...(purchases?.map((p) => p.ebook_id) ?? []),
          ...(grants?.map((g) => g.ebook_id) ?? []),
        ])
      );
      if (!ids.length) return setEbooks([]);
      const { data: list } = await supabase
        .from("ebooks")
        .select("id, slug, title, cover_url, type")
        .in("id", ids);
      setEbooks((list ?? []) as VaultEbook[]);
    })();
  }, [user]);

  if (loading || !user) {
    return <div className="container mx-auto px-4 py-20 text-center text-muted-foreground">A carregar…</div>;
  }

  return (
    <div className="container mx-auto px-4 py-16 max-w-5xl">
      <div className="surface-card rounded-3xl p-8 md:p-10 mb-10">
        <div className="flex flex-wrap items-center gap-6">
          <div className="h-20 w-20 rounded-full bg-[image:var(--gradient-gold)] flex items-center justify-center text-gold-foreground font-serif text-3xl">
            {(profile?.full_name ?? user.email ?? "?")[0].toUpperCase()}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs uppercase tracking-widest text-gold mb-1">Cofre</p>
            <h1 className="font-serif text-3xl text-foreground truncate">
              Bem-vindo, {profile?.full_name ?? user.email?.split("@")[0]}
            </h1>
            <p className="text-sm text-muted-foreground truncate">{user.email}</p>
          </div>
          <Button variant="outline" onClick={signOut}>Sair</Button>
        </div>
      </div>

      <h2 className="font-serif text-2xl text-foreground mb-5 flex items-center gap-2">
        <ShoppingBag className="h-5 w-5 text-gold" /> A tua coleção
      </h2>

      {ebooks.length === 0 ? (
        <div className="surface-card rounded-2xl p-12 text-center">
          <BookOpen className="h-10 w-10 text-muted-foreground/40 mx-auto mb-4" />
          <p className="text-muted-foreground mb-5">Ainda não tens ebooks no cofre.</p>
          <Button variant="hero" asChild>
            <Link to="/loja">Explorar a loja</Link>
          </Button>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {ebooks.map((e) => (
            <Link
              key={e.id}
              to="/ebook/$slug"
              params={{ slug: e.slug }}
              search={{ read: "1" } as never}
              className="surface-card rounded-2xl p-4 flex gap-4 hover:border-gold/40 transition group"
            >
              <div className="h-24 w-16 rounded bg-muted overflow-hidden flex-shrink-0">
                {e.cover_url && <img src={e.cover_url} alt="" className="h-full w-full object-cover" />}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-serif text-lg leading-tight truncate">{e.title}</p>
                <p className="text-xs text-muted-foreground mt-1">
                  {e.type === "premium" ? "Premium" : "Gratuito"}
                </p>
                <p className="text-xs text-gold mt-3 group-hover:underline">Abrir leitor →</p>
              </div>
            </Link>
          ))}
        </div>
      )}

      {/* Coming soon teaser */}
      <div className="mt-12 surface-card rounded-3xl p-8 border-dashed border-gold/30 text-center">
        <Sparkles className="h-6 w-6 text-gold mx-auto mb-3" />
        <h3 className="font-serif text-xl mb-1">10K em 90 dias</h3>
        <p className="text-sm text-muted-foreground mb-3">O próximo capítulo da tua biblioteca está a chegar.</p>
        <span className="inline-flex items-center gap-1 text-xs uppercase tracking-widest text-gold/80">
          <Lock className="h-3 w-3" /> Brevemente
        </span>
      </div>
    </div>
  );
}
