import { createFileRoute, Link, Outlet, useRouterState, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { ShieldCheck, BookOpen, Settings, LayoutDashboard, ShoppingBag, Users } from "lucide-react";
import { useAuth } from "@/lib/auth";

export const Route = createFileRoute("/admin")({
  head: () => ({ meta: [{ title: "Admin — Booklair" }] }),
  component: AdminLayout,
});

const links = [
  { to: "/admin", label: "Dashboard", icon: LayoutDashboard, exact: true },
  { to: "/admin/ebooks", label: "Ebooks", icon: BookOpen, exact: false },
  { to: "/admin/compras", label: "Compras", icon: ShoppingBag, exact: false },
  { to: "/admin/utilizadores", label: "Utilizadores", icon: Users, exact: false },
  { to: "/admin/settings", label: "Site & Redes", icon: Settings, exact: false },
] as const;

function AdminLayout() {
  const { user, isAdmin, loading } = useAuth();
  const navigate = useNavigate();
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  useEffect(() => {
    if (!loading && !user) navigate({ to: "/auth" });
  }, [loading, user, navigate]);

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-20 text-center text-muted-foreground">
        A carregar…
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="container mx-auto px-4 py-20 text-center max-w-md">
        <ShieldCheck className="h-12 w-12 text-gold mx-auto mb-4" />
        <h1 className="font-serif text-3xl mb-2">Acesso restrito</h1>
        <p className="text-muted-foreground mb-6">
          Esta área é exclusiva para administradores. Se és o dono da Booklair, faz login com o email
          configurado.
        </p>
      </div>
    );
  }

  // Render dashboard content directly when on /admin
  const onIndex = pathname === "/admin" || pathname === "/admin/";

  return (
    <div className="container mx-auto px-4 py-10">
      <div className="flex items-center gap-3 mb-8">
        <div className="h-10 w-10 rounded-lg bg-gold/10 flex items-center justify-center">
          <ShieldCheck className="h-5 w-5 text-gold" />
        </div>
        <div>
          <p className="text-xs uppercase tracking-widest text-gold">Admin</p>
          <h1 className="font-serif text-3xl">Booklair</h1>
        </div>
      </div>

      <div className="grid lg:grid-cols-[220px_1fr] gap-8">
        <nav className="flex lg:flex-col gap-1 overflow-x-auto lg:overflow-visible">
          {links.map((l) => {
            const active = l.exact ? pathname === l.to : pathname.startsWith(l.to);
            return (
              <Link
                key={l.to}
                to={l.to}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm whitespace-nowrap transition-colors ${
                  active
                    ? "bg-gold/10 text-gold border border-gold/30"
                    : "text-muted-foreground hover:bg-accent hover:text-foreground"
                }`}
              >
                <l.icon className="h-4 w-4" /> {l.label}
              </Link>
            );
          })}
        </nav>

        <div className="min-w-0">
          {onIndex ? <AdminDashboard /> : <Outlet />}
        </div>
      </div>
    </div>
  );
}

function AdminDashboard() {
  return <AdminDashboardImpl />;
}

import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { BookPlus, DollarSign } from "lucide-react";

function AdminDashboardImpl() {
  const [stats, setStats] = useState({ ebooks: 0, users: 0, revenue: 0, purchases: 0, drafts: 0 });

  useEffect(() => {
    Promise.all([
      supabase.from("ebooks").select("id", { count: "exact", head: true }),
      supabase.from("ebooks").select("id", { count: "exact", head: true }).eq("status", "draft"),
      supabase.from("profiles").select("id", { count: "exact", head: true }),
      supabase.from("purchases").select("amount_paid, status").eq("status", "completed"),
    ]).then(([e, d, u, p]) => {
      const revenue = (p.data ?? []).reduce((s, r) => s + Number(r.amount_paid), 0);
      setStats({
        ebooks: e.count ?? 0,
        drafts: d.count ?? 0,
        users: u.count ?? 0,
        revenue,
        purchases: p.data?.length ?? 0,
      });
    });
  }, []);

  return (
    <>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <StatCard icon={BookPlus} label="Ebooks publicados" value={String(stats.ebooks - stats.drafts)} />
        <StatCard icon={BookPlus} label="Rascunhos" value={String(stats.drafts)} />
        <StatCard icon={Users} label="Utilizadores" value={String(stats.users)} />
        <StatCard icon={DollarSign} label="Receita (USD)" value={`$${stats.revenue.toFixed(2)}`} />
      </div>

      <div className="surface-card rounded-2xl p-6">
        <h2 className="font-serif text-xl mb-2">Atalhos</h2>
        <p className="text-sm text-muted-foreground mb-5">
          Gere a tua livraria, ajusta o site e acompanha as vendas a partir do menu lateral.
        </p>
        <div className="flex flex-wrap gap-2">
          <Link
            to="/admin/ebooks/novo"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-gold text-gold-foreground text-sm font-semibold"
          >
            <BookPlus className="h-4 w-4" /> Novo ebook
          </Link>
          <Link
            to="/admin/ebooks"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-border text-sm hover:bg-accent"
          >
            Gerir ebooks
          </Link>
          <Link
            to="/admin/settings"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-border text-sm hover:bg-accent"
          >
            Configurar site
          </Link>
        </div>
      </div>
    </>
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
