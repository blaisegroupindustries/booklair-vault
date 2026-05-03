import { useEffect, useState } from "react";
import { Link } from "@tanstack/react-router";
import { BookPlus, Users, DollarSign, ShoppingBag, TrendingUp, Star, Eye, FileWarning } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { LineChart, Line, BarChart, Bar, ResponsiveContainer, XAxis, YAxis, Tooltip, CartesianGrid, PieChart, Pie, Cell } from "recharts";

interface Stats {
  ebooks: number; drafts: number; users: number; revenue: number;
  purchases: number; reviews: number; avgRating: number;
}

interface DayPoint { date: string; revenue: number; sales: number; signups: number; }
interface TopRow { id: string; title: string; downloads: number; }

export function AdminDashboard() {
  const [stats, setStats] = useState<Stats>({ ebooks: 0, drafts: 0, users: 0, revenue: 0, purchases: 0, reviews: 0, avgRating: 0 });
  const [series, setSeries] = useState<DayPoint[]>([]);
  const [top, setTop] = useState<TopRow[]>([]);
  const [recent, setRecent] = useState<{ id: string; action: string; entity_type: string | null; created_at: string; actor_email: string | null }[]>([]);
  const [catSplit, setCatSplit] = useState<{ name: string; value: number }[]>([]);

  useEffect(() => {
    (async () => {
      const since = new Date(); since.setDate(since.getDate() - 29);
      const sinceIso = since.toISOString();

      const [eAll, eDrafts, uAll, pAll, rAll, dAll, actAll, ebookCats] = await Promise.all([
        supabase.from("ebooks").select("id", { count: "exact", head: true }),
        supabase.from("ebooks").select("id", { count: "exact", head: true }).eq("status", "draft"),
        supabase.from("profiles").select("id, created_at"),
        supabase.from("purchases").select("amount_paid, created_at, status"),
        supabase.from("ebook_reviews").select("rating, hidden, approved"),
        supabase.from("downloads").select("ebook_id, downloaded_at").gte("downloaded_at", sinceIso),
        supabase.from("activity_log").select("id, action, entity_type, created_at, actor_email").order("created_at", { ascending: false }).limit(8),
        supabase.from("ebooks").select("id, title, category"),
      ]);

      const completed = (pAll.data ?? []).filter((p) => p.status === "completed");
      const revenue = completed.reduce((s, r) => s + Number(r.amount_paid), 0);
      const reviews = (rAll.data ?? []).filter((r) => r.approved && !r.hidden);
      const avg = reviews.length ? reviews.reduce((s, r) => s + r.rating, 0) / reviews.length : 0;

      setStats({
        ebooks: eAll.count ?? 0,
        drafts: eDrafts.count ?? 0,
        users: (uAll.data ?? []).length,
        revenue,
        purchases: completed.length,
        reviews: reviews.length,
        avgRating: avg,
      });

      // Build 30-day series
      const days: DayPoint[] = [];
      for (let i = 29; i >= 0; i--) {
        const d = new Date(); d.setDate(d.getDate() - i);
        const key = d.toISOString().slice(0, 10);
        days.push({ date: key.slice(5), revenue: 0, sales: 0, signups: 0 });
      }
      const map = new Map(days.map((d, i) => [d.date, i]));
      for (const p of completed) {
        const k = new Date(p.created_at).toISOString().slice(5, 10);
        const idx = map.get(k);
        if (idx !== undefined) { days[idx].revenue += Number(p.amount_paid); days[idx].sales += 1; }
      }
      for (const u of uAll.data ?? []) {
        const k = new Date(u.created_at).toISOString().slice(5, 10);
        const idx = map.get(k);
        if (idx !== undefined) days[idx].signups += 1;
      }
      setSeries(days);

      // Top ebooks by downloads
      const dlCount = new Map<string, number>();
      for (const d of dAll.data ?? []) dlCount.set(d.ebook_id, (dlCount.get(d.ebook_id) ?? 0) + 1);
      const titles = new Map((ebookCats.data ?? []).map((e) => [e.id, e.title]));
      const topRows = Array.from(dlCount.entries())
        .sort((a, b) => b[1] - a[1]).slice(0, 5)
        .map(([id, downloads]) => ({ id, title: titles.get(id) ?? "—", downloads }));
      setTop(topRows);

      // Category split
      const catMap = new Map<string, number>();
      for (const e of ebookCats.data ?? []) catMap.set(e.category, (catMap.get(e.category) ?? 0) + 1);
      setCatSplit(Array.from(catMap.entries()).map(([name, value]) => ({ name, value })));

      setRecent((actAll.data ?? []) as typeof recent);
    })();
  }, []);

  const COLORS = ["#d4a849", "#8b6914", "#6b4f0e", "#3d2c08"];

  return (
    <div className="space-y-6">
      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <Kpi icon={DollarSign} label="Receita 30d" value={`$${stats.revenue.toFixed(2)}`} accent />
        <Kpi icon={ShoppingBag} label="Vendas" value={String(stats.purchases)} />
        <Kpi icon={Users} label="Utilizadores" value={String(stats.users)} />
        <Kpi icon={BookPlus} label="Ebooks" value={`${stats.ebooks - stats.drafts} pub.`} sub={`${stats.drafts} rascunho`} />
        <Kpi icon={Star} label="Rating médio" value={stats.avgRating ? stats.avgRating.toFixed(1) : "—"} sub={`${stats.reviews} reviews`} />
        <Kpi icon={TrendingUp} label="Conv. média" value={stats.users ? `${((stats.purchases / stats.users) * 100).toFixed(1)}%` : "—"} />
        <Kpi icon={Eye} label="Sessões hoje" value="—" sub="liga analytics" />
        <Kpi icon={FileWarning} label="A moderar" value={String(stats.drafts)} />
      </div>

      {/* Charts */}
      <div className="grid lg:grid-cols-3 gap-4">
        <div className="surface-card rounded-2xl p-5 lg:col-span-2">
          <div className="flex items-center justify-between mb-3">
            <div>
              <p className="text-xs uppercase tracking-widest text-muted-foreground">Receita & Vendas — 30 dias</p>
              <h3 className="font-serif text-lg">Performance</h3>
            </div>
          </div>
          <div className="h-64">
            <ResponsiveContainer>
              <LineChart data={series} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="date" stroke="hsl(var(--muted-foreground))" fontSize={11} />
                <YAxis stroke="hsl(var(--muted-foreground))" fontSize={11} />
                <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8 }} />
                <Line type="monotone" dataKey="revenue" stroke="#d4a849" strokeWidth={2} dot={false} name="Receita ($)" />
                <Line type="monotone" dataKey="sales" stroke="#22c55e" strokeWidth={2} dot={false} name="Vendas" />
                <Line type="monotone" dataKey="signups" stroke="#3b82f6" strokeWidth={2} dot={false} name="Registos" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="surface-card rounded-2xl p-5">
          <p className="text-xs uppercase tracking-widest text-muted-foreground">Distribuição</p>
          <h3 className="font-serif text-lg mb-2">Categorias</h3>
          <div className="h-64">
            <ResponsiveContainer>
              <PieChart>
                <Pie data={catSplit} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label={(p) => p.name?.split("_")[0]}>
                  {catSplit.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Pie>
                <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8 }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-4">
        <div className="surface-card rounded-2xl p-5">
          <p className="text-xs uppercase tracking-widest text-muted-foreground mb-1">Mais descarregados (30d)</p>
          <h3 className="font-serif text-lg mb-3">Top ebooks</h3>
          {top.length === 0 ? (
            <p className="text-sm text-muted-foreground">Sem dados.</p>
          ) : (
            <div className="h-48">
              <ResponsiveContainer>
                <BarChart data={top} layout="vertical" margin={{ left: 0, right: 10 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis type="number" stroke="hsl(var(--muted-foreground))" fontSize={11} />
                  <YAxis dataKey="title" type="category" width={120} stroke="hsl(var(--muted-foreground))" fontSize={11} />
                  <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8 }} />
                  <Bar dataKey="downloads" fill="#d4a849" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>

        <div className="surface-card rounded-2xl p-5">
          <p className="text-xs uppercase tracking-widest text-muted-foreground mb-1">Últimas ações</p>
          <h3 className="font-serif text-lg mb-3">Atividade recente</h3>
          {recent.length === 0 ? (
            <p className="text-sm text-muted-foreground">Sem atividade ainda.</p>
          ) : (
            <ul className="space-y-2 text-sm">
              {recent.map((r) => (
                <li key={r.id} className="flex items-start gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-gold mt-1.5 shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="truncate"><span className="font-medium">{r.action}</span>{r.entity_type && <span className="text-muted-foreground"> · {r.entity_type}</span>}</p>
                    <p className="text-[11px] text-muted-foreground">{r.actor_email ?? "sistema"} — {new Date(r.created_at).toLocaleString("pt-PT")}</p>
                  </div>
                </li>
              ))}
            </ul>
          )}
          <Link to="/admin/atividade" className="inline-block mt-3 text-xs text-gold hover:underline">Ver tudo →</Link>
        </div>
      </div>

      {/* Quick actions */}
      <div className="surface-card rounded-2xl p-5">
        <h3 className="font-serif text-lg mb-3">Atalhos rápidos</h3>
        <div className="flex flex-wrap gap-2">
          <Link to="/admin/ebooks/novo" className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-gold text-gold-foreground text-sm font-semibold">
            <BookPlus className="h-4 w-4" /> Novo ebook
          </Link>
          <Link to="/admin/cupoes" className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-border text-sm hover:bg-accent">Criar cupão</Link>
          <Link to="/admin/popups" className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-border text-sm hover:bg-accent">Configurar popup</Link>
          <Link to="/admin/home" className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-border text-sm hover:bg-accent">Editar home</Link>
          <Link to="/admin/dados" className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-border text-sm hover:bg-accent">Exportar dados</Link>
        </div>
      </div>
    </div>
  );
}

function Kpi({ icon: Icon, label, value, sub, accent }: { icon: React.ComponentType<{ className?: string }>; label: string; value: string; sub?: string; accent?: boolean }) {
  return (
    <div className={`surface-card rounded-2xl p-4 ${accent ? "border border-gold/40" : ""}`}>
      <Icon className={`h-4 w-4 mb-2 ${accent ? "text-gold" : "text-muted-foreground"}`} />
      <p className="text-xl font-serif">{value}</p>
      <p className="text-[10px] uppercase tracking-wider text-muted-foreground mt-0.5">{label}</p>
      {sub && <p className="text-[10px] text-muted-foreground/70">{sub}</p>}
    </div>
  );
}
