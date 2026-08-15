import { Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

let cachedSettings: { logo_url: string | null; site_name: string | null } | null = null;

export function Logo({ className = "" }: { className?: string }) {
  const [settings, setSettings] = useState(cachedSettings);

  useEffect(() => {
    if (cachedSettings) return;
    supabase
      .from("site_settings")
      .select("logo_url, site_name")
      .eq("id", true)
      .maybeSingle()
      .then(({ data }) => {
        if (data) {
          cachedSettings = { logo_url: data.logo_url ?? null, site_name: data.site_name ?? "Booklair" };
          setSettings(cachedSettings);
        }
      });
  }, []);

  const rawLogo = settings?.logo_url ?? null;
  // Auto-fix common GitHub blob URLs (não servem como imagem)
  const logoUrl = rawLogo
    ? rawLogo
        .replace(/^https?:\/\/github\.com\/([^/]+)\/([^/]+)\/blob\//, "https://raw.githubusercontent.com/$1/$2/")
        .replace(/\?.*$/, "")
    : null;
  const siteName = settings?.site_name || "Booklair";

  return (
    <Link to="/" className={`flex items-center gap-2 group ${className}`}>
      {logoUrl ? (
        <img
          src={logoUrl}
          alt={siteName}
          className="h-9 w-auto max-w-[160px] object-contain transition-transform group-hover:scale-105"
        />
      ) : (
        <>
          <div className="relative h-9 w-9 rounded-[5px] bg-gold flex items-center justify-center overflow-hidden transition-transform group-hover:-translate-y-0.5">
            <span className="absolute inset-y-1 left-1.5 w-[3px] rounded-full bg-[var(--gold-foreground)] opacity-90" />
            <span className="absolute inset-y-1.5 left-3.5 w-[3px] rounded-full bg-[var(--gold-foreground)] opacity-60" />
            <span className="absolute inset-y-1 left-[1.35rem] w-[3px] rounded-full bg-[var(--ember)]" />
          </div>
          <span className="font-serif text-[1.35rem] tracking-[-0.04em]">
            {siteName === "Booklair" ? (
              <>Book<span className="text-gold">lair</span></>
            ) : siteName}
          </span>
        </>
      )}
    </Link>
  );
}
