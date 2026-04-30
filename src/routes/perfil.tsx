import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { BookOpen, Download, ShoppingBag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/auth";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/perfil")({
  head: () => ({ meta: [{ title: "Perfil — Booklair" }] }),
  component: ProfilePage,
});

interface PurchaseRow {
  id: string;
  amount_paid: number;
  currency: string;
  status: string;
  created_at: string;
  ebooks: { title: string; slug: string; cover_url: string | null } | null;
}

function ProfilePage() {
  const { user, loading, signOut } = useAuth();
  const navigate = useNavigate();
  const [purchases, setPurchases] = useState<PurchaseRow[]>([]);
  const [profile, setProfile] = useState<{ full_name: string | null; avatar_url: string | null } | null>(null);

  useEffect(() => {
    if (!loading && !user) navigate({ to: "/auth" });
  }, [loading, user, navigate]);

  useEffect(() => {
    if (!user) return;
    supabase
      .from("profiles")
      .select("full_name, avatar_url")
      .eq("id", user.id)
      .maybeSingle()
      .then(({ data }) => setProfile(data));

    supabase
      .from("purchases")
      .select("id, amount_paid, currency, status, created_at, ebooks(title, slug, cover_url)")
      .order("created_at", { ascending: false })
      .then(({ data }) => setPurchases((data ?? []) as unknown as PurchaseRow[]));
  }, [user]);

  if (loading || !user) {
    return <div className="container mx-auto px-4 py-20 text-center text-muted-foreground">A carregar…</div>;
  }

  return (
    <div className="container mx-auto px-4 py-16">
      <div className="surface-card rounded-3xl p-8 md:p-10 mb-10">
        <div className="flex flex-wrap items-center gap-6">
          <div className="h-20 w-20 rounded-full bg-[image:var(--gradient-gold)] flex items-center justify-center text-gold-foreground font-serif text-3xl">
            {(profile?.full_name ?? user.email ?? "?")[0].toUpperCase()}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs uppercase tracking-widest text-gold mb-1">Conta</p>
            <h1 className="font-serif text-3xl text-foreground truncate">
              {profile?.full_name ?? user.email}
            </h1>
            <p className="text-sm text-muted-foreground truncate">{user.email}</p>
          </div>
          <Button variant="outline" onClick={signOut}>Sair</Button>
        </div>
      </div>

      <h2 className="font-serif text-2xl text-foreground mb-5 flex items-center gap-2">
        <ShoppingBag className="h-5 w-5 text-gold" /> As tuas compras
      </h2>

      {purchases.length === 0 ? (
        <div className="surface-card rounded-2xl p-12 text-center">
          <BookOpen className="h-10 w-10 text-muted-foreground/40 mx-auto mb-4" />
          <p className="text-muted-foreground mb-5">Ainda não compraste nenhum ebook.</p>
          <Button variant="hero" asChild>
            <Link to="/loja">Explorar a loja</Link>
          </Button>
        </div>
      ) : (
        <div className="grid gap-3">
          {purchases.map((p) => (
            <div key={p.id} className="surface-card rounded-xl p-4 flex items-center gap-4">
              <div className="h-16 w-12 rounded bg-muted overflow-hidden flex-shrink-0">
                {p.ebooks?.cover_url && <img src={p.ebooks.cover_url} alt="" className="h-full w-full object-cover" />}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium truncate">{p.ebooks?.title ?? "Ebook"}</p>
                <p className="text-xs text-muted-foreground">
                  {new Date(p.created_at).toLocaleDateString()} · {p.currency} {Number(p.amount_paid).toFixed(2)} · {p.status}
                </p>
              </div>
              {p.ebooks && (
                <Button variant="goldOutline" size="sm" asChild>
                  <Link to="/ebook/$slug" params={{ slug: p.ebooks.slug }}>
                    <Download className="h-4 w-4" /> Aceder
                  </Link>
                </Button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
