import { createFileRoute, Link, Outlet, useRouterState, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import {
  ShieldCheck, BookOpen, Settings, LayoutDashboard, ShoppingBag, Users,
  Tag, Bell, Activity, LayoutTemplate, Mail, FolderTree, MessageSquare, Database,
  Menu, X,
} from "lucide-react";
import { useAuth } from "@/lib/auth";
import { supabase } from "@/integrations/supabase/client";
import { AdminNotificationsBell } from "@/components/admin/NotificationsBell";

export const Route = createFileRoute("/admin")({
  head: () => ({ meta: [{ title: "Admin — Booklair" }] }),
  component: AdminLayout,
});

const groups = [
  {
    label: "Visão geral",
    links: [
      { to: "/admin", label: "Dashboard", icon: LayoutDashboard, exact: true },
      { to: "/admin/atividade", label: "Atividade", icon: Activity, exact: false },
    ],
  },
  {
    label: "Catálogo",
    links: [
      { to: "/admin/ebooks", label: "Ebooks", icon: BookOpen, exact: false },
      { to: "/admin/colecoes", label: "Coleções & Bundles", icon: FolderTree, exact: false },
      { to: "/admin/reviews", label: "Reviews", icon: MessageSquare, exact: false },
    ],
  },
  {
    label: "Vendas",
    links: [
      { to: "/admin/compras", label: "Compras", icon: ShoppingBag, exact: false },
      { to: "/admin/cupoes", label: "Cupões", icon: Tag, exact: false },
    ],
  },
  {
    label: "Marketing",
    links: [
      { to: "/admin/popups", label: "Popups & Banners", icon: Bell, exact: false },
      { to: "/admin/campanhas", label: "Email Campaigns", icon: Mail, exact: false },
      { to: "/admin/home", label: "Editor da Home", icon: LayoutTemplate, exact: false },
    ],
  },
  {
    label: "Comunidade",
    links: [
      { to: "/admin/utilizadores", label: "Utilizadores", icon: Users, exact: false },
    ],
  },
  {
    label: "Sistema",
    links: [
      { to: "/admin/settings", label: "Site & Redes", icon: Settings, exact: false },
      { to: "/admin/dados", label: "Export / Import", icon: Database, exact: false },
    ],
  },
] as const;

function AdminLayout() {
  const { user, isAdmin, loading, adminLoading } = useAuth();
  const navigate = useNavigate();
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    if (!loading && !user) navigate({ to: "/auth" });
  }, [loading, user, navigate]);

  useEffect(() => { setMobileOpen(false); }, [pathname]);

  if (loading || (user && adminLoading)) {
    return <div className="container mx-auto px-4 py-20 text-center text-muted-foreground">A carregar…</div>;
  }
  if (!isAdmin) {
    return (
      <div className="container mx-auto px-4 py-20 text-center max-w-md">
        <ShieldCheck className="h-12 w-12 text-gold mx-auto mb-4" />
        <h1 className="font-serif text-3xl mb-2">Acesso restrito</h1>
        <p className="text-muted-foreground mb-6">
          Esta área é exclusiva para administradores. Se és o dono da Booklair, faz login com o email configurado.
        </p>
      </div>
    );
  }

  const onIndex = pathname === "/admin" || pathname === "/admin/";

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center justify-between gap-3 mb-6">
        <div className="flex items-center gap-3">
          <button onClick={() => setMobileOpen(true)} className="lg:hidden p-2 -ml-2">
            <Menu className="h-5 w-5" />
          </button>
          <div className="h-10 w-10 rounded-lg bg-gold/10 flex items-center justify-center">
            <ShieldCheck className="h-5 w-5 text-gold" />
          </div>
          <div>
            <p className="text-xs uppercase tracking-widest text-gold">Admin</p>
            <h1 className="font-serif text-2xl">Booklair</h1>
          </div>
        </div>
        <AdminNotificationsBell />
      </div>

      <div className="grid lg:grid-cols-[240px_1fr] gap-6">
        {/* Mobile drawer */}
        {mobileOpen && (
          <div className="fixed inset-0 z-50 lg:hidden" onClick={() => setMobileOpen(false)}>
            <div className="absolute inset-0 bg-black/60" />
            <nav className="absolute top-0 left-0 bottom-0 w-72 bg-background border-r border-border p-4 overflow-y-auto" onClick={(e) => e.stopPropagation()}>
              <div className="flex justify-end mb-2">
                <button onClick={() => setMobileOpen(false)}><X className="h-5 w-5" /></button>
              </div>
              <SidebarLinks pathname={pathname} />
            </nav>
          </div>
        )}

        <nav className="hidden lg:block">
          <SidebarLinks pathname={pathname} />
        </nav>

        <div className="min-w-0">{onIndex ? <AdminDashboard /> : <Outlet />}</div>
      </div>
    </div>
  );
}

function SidebarLinks({ pathname }: { pathname: string }) {
  return (
    <div className="space-y-5">
      {groups.map((g) => (
        <div key={g.label}>
          <p className="text-[10px] uppercase tracking-widest text-muted-foreground/60 mb-1.5 px-3">{g.label}</p>
          <div className="flex flex-col gap-0.5">
            {g.links.map((l) => {
              const active = l.exact ? pathname === l.to : pathname.startsWith(l.to);
              return (
                <Link
                  key={l.to}
                  to={l.to}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-sm transition-colors ${
                    active
                      ? "bg-gold/10 text-gold border border-gold/30"
                      : "text-muted-foreground hover:bg-accent hover:text-foreground"
                  }`}
                >
                  <l.icon className="h-4 w-4" /> {l.label}
                </Link>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}

import { AdminDashboard } from "@/components/admin/Dashboard";
