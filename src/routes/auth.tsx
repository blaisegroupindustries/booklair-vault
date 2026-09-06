import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState, type FormEvent } from "react";
import { Mail, Lock, ArrowRight } from "lucide-react";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable";
import { useAuth } from "@/lib/auth";
import { toast } from "sonner";

const searchSchema = z.object({
  mode: z.enum(["signin", "signup"]).optional(),
  redirect: z.string().optional(),
});

export const Route = createFileRoute("/auth")({
  validateSearch: searchSchema,
  head: () => ({
    meta: [
      { title: "Entrar — Booklair" },
      { name: "description", content: "Entra ou cria a tua conta Booklair." },
    ],
  }),
  component: AuthPage,
});

const credSchema = z.object({
  email: z.string().trim().email("Email inválido").max(255),
  password: z.string().min(6, "Mínimo 6 caracteres").max(72),
  fullName: z.string().trim().min(1).max(100).optional(),
});

const REDIRECT_KEY = "booklair:auth-redirect";

/** Apenas caminhos internos: evita redireccionamentos para domínios externos. */
function safePath(path: string | undefined | null): string {
  if (!path) return "/perfil";
  if (!path.startsWith("/") || path.startsWith("//")) return "/perfil";
  return path;
}

function AuthPage() {
  const search = Route.useSearch();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [mode, setMode] = useState<"signin" | "signup">(search.mode ?? "signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const target = safePath(search.redirect);

  // Depois do regresso do Google, a sessão só existe no cliente: espera por ela.
  useEffect(() => {
    if (!user) return;
    let dest = target;
    if (typeof window !== "undefined") {
      const stored = window.sessionStorage.getItem(REDIRECT_KEY);
      if (stored) {
        window.sessionStorage.removeItem(REDIRECT_KEY);
        if (!search.redirect) dest = safePath(stored);
      }
    }
    void navigate({ to: dest, replace: true });
  }, [user, target, search.redirect, navigate]);


  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const parsed = credSchema.parse({
        email,
        password,
        fullName: mode === "signup" ? fullName : undefined,
      });

      if (mode === "signup") {
        const { error } = await supabase.auth.signUp({
          email: parsed.email,
          password: parsed.password,
          options: {
            emailRedirectTo: window.location.origin,
            data: { full_name: parsed.fullName },
          },
        });
        if (error) throw error;
        toast.success("Conta criada! Verifica o teu email.");
        navigate({ to: search.redirect ?? "/perfil" });
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email: parsed.email,
          password: parsed.password,
        });
        if (error) throw error;
        toast.success("Bem-vindo de volta!");
        navigate({ to: search.redirect ?? "/perfil" });
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Erro ao autenticar";
      toast.error(msg);
    } finally {
      setSubmitting(false);
    }
  };

  const handleGoogle = async () => {
    setSubmitting(true);
    try {
      const result = await lovable.auth.signInWithOAuth("google", {
        redirect_uri: window.location.origin + (search.redirect ?? "/perfil"),
      });

      if (result.error) throw result.error;
      if (result.redirected) return;

      navigate({ to: search.redirect ?? "/perfil" });
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Erro com Google";
      toast.error(msg);
      setSubmitting(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-16 flex items-center justify-center min-h-[calc(100vh-300px)]">
      <div className="w-full max-w-md surface-card rounded-3xl p-8 md:p-10">
        <div className="text-center mb-8">
          <p className="text-xs uppercase tracking-widest text-gold mb-3">Booklair</p>
          <h1 className="font-serif text-3xl text-foreground">
            {mode === "signin" ? "Bem-vindo de volta" : "Cria a tua conta"}
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            {mode === "signin" ? "Entra para aceder à tua biblioteca." : "Acede a ebooks gratuitos e premium."}
          </p>
        </div>

        <Button
          variant="outline"
          size="lg"
          onClick={handleGoogle}
          disabled={submitting}
          className="w-full mb-5"
        >
          <svg className="h-4 w-4" viewBox="0 0 24 24">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
          </svg>
          Continuar com Google
        </Button>

        <div className="relative my-6">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t border-border" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-card px-3 text-muted-foreground tracking-widest">ou</span>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {mode === "signup" && (
            <div className="space-y-1.5">
              <Label htmlFor="fullName">Nome</Label>
              <Input id="fullName" value={fullName} onChange={(e) => setFullName(e.target.value)} required maxLength={100} />
            </div>
          )}
          <div className="space-y-1.5">
            <Label htmlFor="email">Email</Label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required maxLength={255} className="pl-9" />
            </div>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="password">Password</Label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required minLength={6} maxLength={72} className="pl-9" />
            </div>
          </div>

          <Button type="submit" variant="hero" size="lg" disabled={submitting} className="w-full">
            {mode === "signin" ? "Entrar" : "Criar conta"} <ArrowRight className="h-4 w-4" />
          </Button>
        </form>

        <p className="mt-6 text-center text-sm text-muted-foreground">
          {mode === "signin" ? "Ainda não tens conta? " : "Já tens conta? "}
          <button
            onClick={() => setMode(mode === "signin" ? "signup" : "signin")}
            className="text-gold hover:underline font-medium"
          >
            {mode === "signin" ? "Criar conta" : "Entrar"}
          </button>
        </p>
      </div>
    </div>
  );
}
