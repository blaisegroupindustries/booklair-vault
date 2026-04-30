import { createContext, useContext, useEffect, useState, type ReactNode } from "react";

type Lang = "pt" | "en";

type Dict = Record<string, { pt: string; en: string }>;

const dict: Dict = {
  "nav.home": { pt: "Início", en: "Home" },
  "nav.library": { pt: "Biblioteca", en: "Library" },
  "nav.store": { pt: "Loja", en: "Store" },
  "nav.about": { pt: "Sobre", en: "About" },
  "nav.profile": { pt: "Perfil", en: "Profile" },
  "nav.signin": { pt: "Entrar", en: "Sign in" },
  "nav.signup": { pt: "Criar conta", en: "Sign up" },
  "nav.signout": { pt: "Sair", en: "Sign out" },

  "hero.eyebrow": { pt: "Conhecimento que transforma", en: "Knowledge that transforms" },
  "hero.title": { pt: "Ebooks premium para mentes ambiciosas.", en: "Premium ebooks for ambitious minds." },
  "hero.subtitle": {
    pt: "Marketing, negócios, educação e desenvolvimento pessoal — escolhidos a dedo, prontos para te elevar.",
    en: "Marketing, business, education, and personal growth — handpicked, ready to elevate you.",
  },
  "hero.cta.primary": { pt: "Explorar a loja", en: "Explore the store" },
  "hero.cta.secondary": { pt: "Ler grátis", en: "Read for free" },

  "categories.title": { pt: "Categorias", en: "Categories" },
  "categories.subtitle": { pt: "Encontra o teu próximo passo.", en: "Find your next step." },
  "cat.marketing_negocios": { pt: "Marketing & Negócios", en: "Marketing & Business" },
  "cat.educacao_estudo": { pt: "Educação & Estudo", en: "Education & Study" },
  "cat.desenvolvimento_pessoal": { pt: "Desenvolvimento Pessoal", en: "Personal Growth" },

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
  "ebook.read": { pt: "Ler agora", en: "Read now" },
  "ebook.buy": { pt: "Comprar", en: "Buy" },

  "filter.all": { pt: "Todos", en: "All" },

  "about.title": { pt: "Sobre a Booklair", en: "About Booklair" },
  "about.lead": {
    pt: "A Booklair nasceu para tornar acessível o conhecimento que faz a diferença — entre o Brasil, Portugal, Angola, Moçambique e o resto do mundo lusófono.",
    en: "Booklair exists to make the knowledge that matters accessible — across the Portuguese-speaking world and beyond.",
  },

  "footer.tagline": { pt: "A tua biblioteca de elite, em qualquer lugar.", en: "Your elite library, everywhere." },
  "footer.legal": { pt: "Legal", en: "Legal" },
  "footer.terms": { pt: "Termos & Condições", en: "Terms & Conditions" },
  "footer.privacy": { pt: "Privacidade", en: "Privacy" },
  "footer.about": { pt: "Sobre", en: "About" },
  "footer.rights": { pt: "Todos os direitos reservados.", en: "All rights reserved." },
};

interface I18nCtx {
  lang: Lang;
  setLang: (l: Lang) => void;
  t: (key: string) => string;
}

const Ctx = createContext<I18nCtx | null>(null);

export function I18nProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>("pt");

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
