import { useEffect, useState } from "react";
import { Bell } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Link } from "@tanstack/react-router";

interface N { id: string; title: string; body: string | null; link: string | null; read: boolean; created_at: string; }

export function AdminNotificationsBell() {
  const [items, setItems] = useState<N[]>([]);
  const [open, setOpen] = useState(false);

  const load = async () => {
    const { data } = await supabase.from("notifications").select("*").order("created_at", { ascending: false }).limit(15);
    setItems((data ?? []) as N[]);
  };

  useEffect(() => {
    load();
    const ch = supabase
      .channel("admin-notifications")
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "notifications" }, () => load())
      .subscribe();
    return () => { supabase.removeChannel(ch); };
  }, []);

  const unread = items.filter((i) => !i.read).length;

  const markAll = async () => {
    await supabase.from("notifications").update({ read: true }).eq("read", false);
    load();
  };

  return (
    <div className="relative">
      <button onClick={() => setOpen((o) => !o)} className="relative p-2 rounded-lg hover:bg-accent">
        <Bell className="h-5 w-5" />
        {unread > 0 && (
          <span className="absolute top-0 right-0 h-4 min-w-4 px-1 rounded-full bg-rose-500 text-[10px] font-bold flex items-center justify-center text-white">
            {unread > 9 ? "9+" : unread}
          </span>
        )}
      </button>
      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className="absolute right-0 top-full mt-2 w-80 max-h-96 overflow-y-auto surface-card rounded-xl border border-border shadow-2xl z-50">
            <div className="flex items-center justify-between p-3 border-b border-border/50">
              <p className="font-semibold text-sm">Notificações</p>
              {unread > 0 && <button onClick={markAll} className="text-xs text-gold hover:underline">Marcar todas lidas</button>}
            </div>
            {items.length === 0 ? (
              <p className="p-6 text-center text-xs text-muted-foreground">Sem notificações</p>
            ) : (
              <ul className="divide-y divide-border/50">
                {items.map((n) => (
                  <li key={n.id} className={`p-3 ${!n.read ? "bg-gold/5" : ""}`}>
                    {n.link ? (
                      <Link to={n.link} className="block">
                        <p className="text-sm font-medium">{n.title}</p>
                        {n.body && <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">{n.body}</p>}
                      </Link>
                    ) : (
                      <>
                        <p className="text-sm font-medium">{n.title}</p>
                        {n.body && <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">{n.body}</p>}
                      </>
                    )}
                    <p className="text-[10px] text-muted-foreground/70 mt-1">{new Date(n.created_at).toLocaleString("pt-PT")}</p>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </>
      )}
    </div>
  );
}
