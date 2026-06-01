import { createContext, useContext, useEffect, useState, type ReactNode } from "react";

type Lang = "en" | "pt";

type Dict = Record<string, { pt: string; en: string }>;

const dict: Dict = {
  "nav.home": { pt: "Início", en: "Home" },
  "nav.library": { pt: "Biblioteca", en: "Library" },
  "nav.store": { pt: "Loja", en: "Store" },
  "nav.about": { pt: "Sobre", en: "About" },
  "nav.profile": { pt: "Perfil", en: "Profile" },
  "nav.signin": { pt: "Entrar", en: "Sign In" },
  "nav.signup": { pt: "Criar conta", en: "Sign Up" },
  "nav.signout": { pt: "Sair", en: "Sign Out" },

  "hero.eyebrow": { pt: "Conhecimento que transforma", en: "Knowledge that transforms" },
  "hero.title": { pt: "Ebooks premium para mentes ambiciosas.", en: "Premium ebooks for ambitious minds." },
  "hero.subtitle": {
    pt: "Marketing, negócios, educação e desenvolvimento pessoal — curados para quem prefere resultados em vez de teoria.",
    en: "Marketing, business, education and personal development — curated for those who prefer results over theory.",
  },
  "hero.cta.primary": { pt: "Explorar a Loja", en: "Explore Store" },
  "hero.cta.secondary": { pt: "Ler Grátis", en: "Read Free" },

  "categories.title": { pt: "Categorias", en: "Categories" },
  "categories.subtitle": { pt: "Encontra o teu próximo passo.", en: "Find your next step." },
  "cat.marketing_negocios": { pt: "Marketing & Negócios", en: "Marketing & Business" },
  "cat.educacao_estudo": { pt: "Educação & Estudo", en: "Education & Study" },
  "cat.desenvolvimento_pessoal": { pt: "Desenvolvimento Pessoal", en: "Personal Development" },

  "featured.title": { pt: "Destaques", en: "Featured" },
  "featured.subtitle": { pt: "O que está a marcar agora.", en: "What's making waves." },

  "library.title": { pt: "Biblioteca Gratuita", en: "Free Library" },
  "library.subtitle": { pt: "Lê online, sem custos. Sem limites.", en: "Read online, no cost. No limits." },
  "library.empty": { pt: "Ainda não há ebooks gratuitos publicados.", en: "No free ebooks published yet." },

  "store.title": { pt: "Loja Premium", en: "Premium Store" },
  "store.subtitle": { pt: "Ebooks exclusivos. Pagas uma vez, ficam teus.", en: "Exclusive ebooks. Pay once, yours forever." },
  "store.empty": { pt: "Em breve novos lançamentos.", en: "New releases coming soon." },

  "ebook.free": { pt: "Grátis", en: "Free" },
  "ebook.premium": { pt: "Premium", en: "Premium" },
  "ebook.read": { pt: "Ler agora", en: "Read Now" },
  "ebook.buy": { pt: "Comprar", en: "Buy Now" },

  "filter.all": { pt: "Todos", en: "All" },

  "about.title": { pt: "Sobre a Booklair", en: "About Booklair" },
  "about.lead": {
    pt: "A Booklair é uma plataforma de conhecimento curada para empreendedores e mentes ambiciosas em todo o mundo.",
    en: "Booklair is a curated knowledge platform for entrepreneurs and ambitious minds worldwide.",
  },

  "footer.tagline": { pt: "A tua biblioteca pessoal de conhecimento.", en: "Your personal library of knowledge." },
  "footer.legal": { pt: "Legal", en: "Legal" },
  "footer.terms": { pt: "Termos & Condições", en: "Terms & Conditions" },
  "footer.privacy": { pt: "Privacidade", en: "Privacy" },
  "footer.about": { pt: "Sobre", en: "About" },
  "footer.rights": { pt: "Todos os direitos reservados.", en: "All rights reserved." },
  "footer.location": { pt: "Global · Est. 2025", en: "Global · Est. 2025" },

  "cta.title": { pt: "Constrói a tua biblioteca de elite.", en: "Build your elite library." },
  "cta.subtitle": {
    pt: "Cria a tua conta gratuita e começa hoje. Sem subscrições. Sem letras pequenas.",
    en: "Create your free account and start today. No subscriptions. No fine print.",
  },
  "cta.button": { pt: "Começar grátis", en: "Get started free" },
};

interface I18nCtx {
  lang: Lang;
  setLang: (l: Lang) => void;
  t: (key: string) => string;
}

const Ctx = createContext<I18nCtx | null>(null);

export function I18nProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>("en");

  useEffect(() => {
    if (typeof window === "undefined") return;
    const saved = localStorage.getItem("booklair-lang") as Lang | null;
    if (saved === "pt" || saved === "en") setLangState(saved);
  }, []);

  const setLang = (l: Lang) => {
    setLangState(l);
    if (typeof window !== "undefined") localStorage.setItem("booklair-lang", l);
  };

  const t = (key: string) => dict[key]?.[lang] ?? key;

  return <Ctx.Provider value={{ lang, setLang, t }}>{children}</Ctx.Provider>;
}

export function useI18n() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useI18n must be used inside I18nProvider");
  return ctx;
}
