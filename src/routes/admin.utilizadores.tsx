import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Shield, ShieldOff } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const Route = createFileRoute("/admin/utilizadores")({
  component: UsersPage,
});

interface UserRow {
  id: string;
  full_name: string | null;
  avatar_url: string | null;
  created_at: string;
  is_admin: boolean;
}

function UsersPage() {
  const [rows, setRows] = useState<UserRow[]>([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    const [{ data: profiles }, { data: roles }] = await Promise.all([
      supabase.from("profiles").select("id, full_name, avatar_url, created_at").order("created_at", { ascending: false }),
      supabase.from("user_roles").select("user_id, role"),
    ]);
    const adminIds = new Set((roles ?? []).filter((r) => r.role === "admin").map((r) => r.user_id));
    setRows((profiles ?? []).map((p) => ({ ...p, is_admin: adminIds.has(p.id) })));
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const toggleAdmin = async (u: UserRow) => {
    if (u.is_admin) {
      const { error } = await supabase.from("user_roles").delete().eq("user_id", u.id).eq("role", "admin");
      if (error) toast.error(error.message); else { toast.success("Removido admin"); load(); }
    } else {
      const { error } = await supabase.from("user_roles").insert({ user_id: u.id, role: "admin" });
      if (error) toast.error(error.message); else { toast.success("Promovido a admin"); load(); }
    }
  };

  return (
    <div>
      <h2 className="font-serif text-2xl mb-1">Utilizadores</h2>
      <p className="text-sm text-muted-foreground mb-6">Promove ou remove administradores.</p>

      <div className="surface-card rounded-2xl overflow-hidden">
        {loading ? (
          <div className="p-10 text-center text-muted-foreground text-sm">A carregar…</div>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-muted/30 text-xs uppercase tracking-wider text-muted-foreground">
              <tr>
                <th className="text-left p-3">Utilizador</th>
                <th className="text-left p-3">Registado</th>
                <th className="text-left p-3">Role</th>
                <th className="text-right p-3">Ações</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((u) => (
                <tr key={u.id} className="border-t border-border/50">
                  <td className="p-3">
                    <div className="font-medium">{u.full_name || "—"}</div>
                    <div className="text-xs text-muted-foreground font-mono">{u.id.slice(0, 12)}…</div>
                  </td>
                  <td className="p-3 text-muted-foreground">{new Date(u.created_at).toLocaleDateString("pt-PT")}</td>
                  <td className="p-3">
                    <span className={`px-2 py-0.5 text-[10px] rounded-full ${u.is_admin ? "bg-gold/15 text-gold" : "bg-muted text-muted-foreground"}`}>
                      {u.is_admin ? "admin" : "user"}
                    </span>
                  </td>
                  <td className="p-3 text-right">
                    <button onClick={() => toggleAdmin(u)} className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-md border border-border text-xs hover:bg-accent">
                      {u.is_admin ? <><ShieldOff className="h-3.5 w-3.5" /> Remover admin</> : <><Shield className="h-3.5 w-3.5" /> Tornar admin</>}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
