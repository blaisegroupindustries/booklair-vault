import { Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Instagram, Facebook, Youtube, Linkedin, Twitter, MessageCircle } from "lucide-react";
import { Logo } from "./Logo";
import { useI18n } from "@/lib/i18n";
import { supabase } from "@/integrations/supabase/client";

interface SocialSettings {
  social_instagram: string | null;
  social_facebook: string | null;
  social_tiktok: string | null;
  social_youtube: string | null;
  social_x: string | null;
  social_linkedin: string | null;
  social_whatsapp: string | null;
  footer_text: string | null;
  contact_email: string | null;
}

export function Footer() {
  const { t } = useI18n();
  const [s, setS] = useState<SocialSettings | null>(null);

  useEffect(() => {
    supabase.from("site_settings").select("social_instagram, social_facebook, social_tiktok, social_youtube, social_x, social_linkedin, social_whatsapp, footer_text, contact_email").eq("id", true).maybeSingle().then(({ data }) => setS(data as SocialSettings | null));
  }, []);

  const socials = [
    { url: s?.social_instagram, icon: Instagram, label: "Instagram" },
    { url: s?.social_facebook, icon: Facebook, label: "Facebook" },
    { url: s?.social_youtube, icon: Youtube, label: "YouTube" },
    { url: s?.social_linkedin, icon: Linkedin, label: "LinkedIn" },
    { url: s?.social_x, icon: Twitter, label: "X" },
    { url: s?.social_whatsapp ? `https://wa.me/${s.social_whatsapp.replace(/\D/g, "")}` : null, icon: MessageCircle, label: "WhatsApp" },
  ].filter((x) => x.url);

  return (
    <footer className="border-t border-border/50 mt-24">
      <div className="container mx-auto px-4 py-12">
        <div className="grid gap-10 md:grid-cols-4">
          <div className="md:col-span-2">
            <Logo />
            <p className="mt-4 text-sm text-muted-foreground max-w-sm">
              {s?.footer_text || t("footer.tagline")}
            </p>
            {s?.contact_email && (
              <a href={`mailto:${s.contact_email}`} className="mt-3 inline-block text-sm text-gold hover:underline">
                {s.contact_email}
              </a>
            )}
            {socials.length > 0 && (
              <div className="mt-5 flex items-center gap-2">
                {socials.map((soc) => (
                  <a key={soc.label} href={soc.url!} target="_blank" rel="noreferrer" aria-label={soc.label}
                    className="h-9 w-9 rounded-full border border-border flex items-center justify-center text-muted-foreground hover:text-gold hover:border-gold/40 transition-colors">
                    <soc.icon className="h-4 w-4" />
                  </a>
                ))}
              </div>
            )}
          </div>
          <div>
            <h4 className="text-xs uppercase tracking-widest text-gold mb-4">Booklair</h4>
            <ul className="space-y-2 text-sm">
              <li><Link to="/biblioteca" className="text-muted-foreground hover:text-foreground">{t("nav.library")}</Link></li>
              <li><Link to="/loja" className="text-muted-foreground hover:text-foreground">{t("nav.store")}</Link></li>
              <li><Link to="/sobre" className="text-muted-foreground hover:text-foreground">{t("footer.about")}</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="text-xs uppercase tracking-widest text-gold mb-4">{t("footer.legal")}</h4>
            <ul className="space-y-2 text-sm">
              <li><Link to="/termos" className="text-muted-foreground hover:text-foreground">{t("footer.terms")}</Link></li>
              <li><Link to="/privacidade" className="text-muted-foreground hover:text-foreground">{t("footer.privacy")}</Link></li>
            </ul>
          </div>
        </div>
        <div className="mt-12 pt-6 border-t border-border/50 text-xs text-muted-foreground flex flex-col sm:flex-row justify-between gap-2">
          <span>© {new Date().getFullYear()} Booklair. {t("footer.rights")}</span>
          <span>{t("footer.location")}</span>
        </div>
      </div>
    </footer>
  );
}
