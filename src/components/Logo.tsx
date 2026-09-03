import { Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { BooklairMark } from "@/components/BooklairMark";

let cachedName: string | null = null;

export function Logo({ className = "" }: { className?: string }) {
  const [siteName, setSiteName] = useState(cachedName ?? "Booklair");

  useEffect(() => {
    if (cachedName) return;
    supabase
      .from("site_settings")
      .select("site_name")
      .eq("id", true)
      .maybeSingle()
      .then(({ data }) => {
        if (data?.site_name) {
          cachedName = data.site_name;
          setSiteName(data.site_name);
        }
      });
  }, []);

  return (
    <Link to="/" className={`flex items-center gap-2 group ${className}`}>
      <BooklairMark className="h-9 w-9 transition-transform group-hover:-translate-y-0.5" />
      <span className="font-serif text-[1.35rem] tracking-[-0.04em]">
        {siteName === "Booklair" ? (
          <>Book<span className="text-gold">lair</span></>
        ) : siteName}
      </span>
    </Link>
  );
}
