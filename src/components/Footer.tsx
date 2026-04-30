import { Link } from "@tanstack/react-router";
import { Logo } from "./Logo";
import { useI18n } from "@/lib/i18n";

export function Footer() {
  const { t } = useI18n();
  return (
    <footer className="border-t border-border/50 mt-24">
      <div className="container mx-auto px-4 py-12">
        <div className="grid gap-10 md:grid-cols-4">
          <div className="md:col-span-2">
            <Logo />
            <p className="mt-4 text-sm text-muted-foreground max-w-sm">
              {t("footer.tagline")}
            </p>
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
          <span>Lisboa · Maputo · São Paulo · Luanda</span>
        </div>
      </div>
    </footer>
  );
}
