import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { ShieldCheck, BookPlus, Users, DollarSign } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/auth";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/admin")({
  head: () => ({ meta: [{ title: "Admin — Booklair" }] }),
  component: AdminPage,
});

function AdminPage() {
  const { user, isAdmin, loading } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState({ ebooks: 0, users: 0, revenue: 0, purchases: 0 });

  useEffect(() => {
    if (!loading && !user) navigate({ to: "/auth" });
  }, [loading, user, navigate]);

  useEffect(() => {
    if (!isAdmin) return;
    Promise.all([
      supabase.from("ebooks").select("id", { count: "exact", head: true }),
      supabase.from("profiles").select("id", { count: "exact", head: true }),
      supabase.from("purchases").select("amount_paid, status").eq("status", "completed"),
    ]).then(([e, u, p]) => {
      const revenue = (p.data ?? []).reduce((s, r) => s + Number(r.amount_paid), 0);
      setStats({
        ebooks: e.count ?? 0,
        users: u.count ?? 0,
        revenue,
        purchases: p.data?.length ?? 0,
      });
    });
  }, [isAdmin]);

  if (loading) {
    return <div className="container mx-auto px-4 py-20 text-center text-muted-foreground">A carregar…</div>;
  }

  if (!isAdmin) {
    return (
      <div className="container mx-auto px-4 py-20 text-center max-w-md">
        <ShieldCheck className="h-12 w-12 text-gold mx-auto mb-4" />
        <h1 className="font-serif text-3xl mb-2">Acesso restrito</h1>
        <p className="text-muted-foreground mb-6">Esta área é exclusiva para administradores.</p>
        <p className="text-xs text-muted-foreground">
          Para te tornares admin, abre o painel da Lovable Cloud → SQL e corre:
          <code className="block mt-3 p-3 bg-muted rounded text-left text-foreground text-[11px] overflow-auto">
            INSERT INTO public.user_roles (user_id, role)<br />
            VALUES ('{user?.id ?? "<o-teu-id>"}', 'admin');
          </code>
        </p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-16">
      <div className="flex items-center gap-3 mb-10">
        <div className="h-10 w-10 rounded-lg bg-gold/10 flex items-center justify-center">
          <ShieldCheck className="h-5 w-5 text-gold" />
        </div>
        <div>
          <p className="text-xs uppercase tracking-widest text-gold">Admin</p>
          <h1 className="font-serif text-3xl">Painel de gestão</h1>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
        <StatCard icon={BookPlus} label="Ebooks" value={String(stats.ebooks)} />
        <StatCard icon={Users} label="Utilizadores" value={String(stats.users)} />
        <StatCard icon={DollarSign} label="Compras" value={String(stats.purchases)} />
        <StatCard icon={DollarSign} label="Receita (USD)" value={`$${stats.revenue.toFixed(2)}`} />
      </div>

      <div className="surface-card rounded-2xl p-8">
        <h2 className="font-serif text-xl mb-3">Upload de ebooks</h2>
        <p className="text-sm text-muted-foreground mb-5">
          O upload completo (capa + PDF + metadados) será adicionado na próxima fase, juntamente
          com a integração de pagamentos. Por agora, podes inserir ebooks diretamente via SQL no
          painel da Lovable Cloud.
        </p>
        <Button variant="goldOutline" disabled>Em breve</Button>
      </div>
    </div>
  );
}

function StatCard({ icon: Icon, label, value }: { icon: React.ComponentType<{ className?: string }>; label: string; value: string }) {
  return (
    <div className="surface-card rounded-2xl p-5">
      <Icon className="h-5 w-5 text-gold mb-3" />
      <p className="text-2xl font-serif text-foreground">{value}</p>
      <p className="text-xs uppercase tracking-wider text-muted-foreground mt-1">{label}</p>
    </div>
  );
}
