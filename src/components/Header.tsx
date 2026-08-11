import { Link } from "@tanstack/react-router";
import { useState } from "react";
import { Menu, X, User as UserIcon, LogOut, Globe, ShieldCheck } from "lucide-react";
import { Logo } from "./Logo";
import { Button } from "./ui/button";
import { useI18n } from "@/lib/i18n";
import { useAuth } from "@/lib/auth";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";

export function Header() {
  const { t, lang, setLang } = useI18n();
  const { user, isAdmin, signOut } = useAuth();
  const [open, setOpen] = useState(false);

  const links = [
    { to: "/", label: t("nav.home") },
    { to: "/biblioteca", label: t("nav.library") },
    { to: "/loja", label: t("nav.store") },
    { to: "/programa-mentor-10k", label: "Mentor 10K" },
    { to: "/sobre", label: t("nav.about") },
  ] as const;

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/50 bg-background/80 backdrop-blur-xl">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <Logo />

        <nav className="hidden md:flex items-center gap-1">
          {links.map((l) => (
            <Link
              key={l.to}
              to={l.to}
              activeProps={{ className: "text-gold" }}
              activeOptions={{ exact: l.to === "/" }}
              className="px-4 py-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              {l.label}
            </Link>
          ))}
        </nav>

        <div className="hidden md:flex items-center gap-2">
          <button
            onClick={() => setLang(lang === "pt" ? "en" : "pt")}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-muted-foreground hover:text-gold transition-colors uppercase tracking-wider"
            aria-label="Toggle language"
          >
            <Globe className="h-4 w-4" />
            {lang}
          </button>

          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="goldOutline" size="sm">
                  <UserIcon className="h-4 w-4" />
                  {user.email?.split("@")[0]}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuItem asChild>
                  <Link to="/perfil"><UserIcon className="h-4 w-4 mr-2" />{t("nav.profile")}</Link>
                </DropdownMenuItem>
                {isAdmin && (
                  <DropdownMenuItem asChild>
                    <Link to="/admin"><ShieldCheck className="h-4 w-4 mr-2" />Admin</Link>
                  </DropdownMenuItem>
                )}
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={signOut}>
                  <LogOut className="h-4 w-4 mr-2" />{t("nav.signout")}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <>
              <Button variant="ghost" size="sm" asChild>
                <Link to="/auth">{t("nav.signin")}</Link>
              </Button>
              <Button variant="gold" size="sm" asChild>
                <Link to="/auth" search={{ mode: "signup" }}>{t("nav.signup")}</Link>
              </Button>
            </>
          )}
        </div>

        <button
          className="md:hidden p-2 text-foreground"
          onClick={() => setOpen(!open)}
          aria-label="Menu"
        >
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {open && (
        <div className="md:hidden border-t border-border/50 bg-background">
          <div className="container mx-auto px-4 py-4 flex flex-col gap-1">
            {links.map((l) => (
              <Link
                key={l.to}
                to={l.to}
                onClick={() => setOpen(false)}
                className="px-3 py-3 text-sm text-foreground hover:bg-accent rounded-md"
              >
                {l.label}
              </Link>
            ))}
            <div className="border-t border-border/50 my-2" />
            {user ? (
              <>
                <Link to="/perfil" onClick={() => setOpen(false)} className="px-3 py-3 text-sm hover:bg-accent rounded-md">
                  {t("nav.profile")}
                </Link>
                {isAdmin && (
                  <Link to="/admin" onClick={() => setOpen(false)} className="px-3 py-3 text-sm hover:bg-accent rounded-md">
                    Admin
                  </Link>
                )}
                <button onClick={() => { signOut(); setOpen(false); }} className="text-left px-3 py-3 text-sm hover:bg-accent rounded-md">
                  {t("nav.signout")}
                </button>
              </>
            ) : (
              <>
                <Link to="/auth" onClick={() => setOpen(false)} className="px-3 py-3 text-sm hover:bg-accent rounded-md">
                  {t("nav.signin")}
                </Link>
                <Link to="/auth" search={{ mode: "signup" }} onClick={() => setOpen(false)} className="px-3 py-3 text-sm text-gold hover:bg-accent rounded-md">
                  {t("nav.signup")}
                </Link>
              </>
            )}
            <button
              onClick={() => setLang(lang === "pt" ? "en" : "pt")}
              className="flex items-center gap-2 px-3 py-3 text-sm hover:bg-accent rounded-md"
            >
              <Globe className="h-4 w-4" /> {lang === "pt" ? "English" : "Português"}
            </button>
          </div>
        </div>
      )}
    </header>
  );
}
