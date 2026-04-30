import { Outlet, Link, createRootRoute, HeadContent, Scripts } from "@tanstack/react-router";
import { Toaster } from "@/components/ui/sonner";
import { I18nProvider } from "@/lib/i18n";
import { AuthProvider } from "@/lib/auth";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";

import appCss from "../styles.css?url";

function NotFoundComponent() {
  return (
    <div className="flex min-h-[70vh] items-center justify-center px-4">
      <div className="max-w-md text-center">
        <p className="text-xs uppercase tracking-widest text-gold mb-3">404</p>
        <h1 className="font-serif text-5xl text-foreground">Página não encontrada</h1>
        <p className="mt-3 text-sm text-muted-foreground">
          A página que procuras não existe ou foi movida.
        </p>
        <Link
          to="/"
          className="mt-8 inline-flex items-center justify-center rounded-md bg-gold px-5 py-2.5 text-sm font-semibold text-gold-foreground transition hover:brightness-110"
        >
          Voltar à Booklair
        </Link>
      </div>
    </div>
  );
}

export const Route = createRootRoute({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "Booklair — Ebooks premium para mentes ambiciosas" },
      {
        name: "description",
        content:
          "Booklair é a plataforma lusófona de ebooks premium em marketing, negócios, educação e desenvolvimento pessoal. Lê grátis ou compra para sempre.",
      },
      { name: "author", content: "Booklair" },
      { name: "theme-color", content: "#1a1a2e" },
      { property: "og:title", content: "Booklair — Ebooks premium para mentes ambiciosas" },
      { property: "og:description", content: "Booklair é uma plataforma de ebooks curada para empreendedores, criadores de conteúdo, e mentes curiosas do mundo lusófono e além." },
      { property: "og:type", content: "website" },
      { property: "og:site_name", content: "Booklair" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: "Booklair — Ebooks premium para mentes ambiciosas" },
      { name: "description", content: "Booklair é uma plataforma de ebooks curada para empreendedores, criadores de conteúdo, e mentes curiosas do mundo lusófono e além." },
      { name: "twitter:description", content: "Booklair é uma plataforma de ebooks curada para empreendedores, criadores de conteúdo, e mentes curiosas do mundo lusófono e além." },
      { property: "og:image", content: "https://storage.googleapis.com/gpt-engineer-file-uploads/51I7wRl70CVdLLTDSgpxAGTbi2B2/social-images/social-1777541435498-booklair_og_image.webp" },
      { name: "twitter:image", content: "https://storage.googleapis.com/gpt-engineer-file-uploads/51I7wRl70CVdLLTDSgpxAGTbi2B2/social-images/social-1777541435498-booklair_og_image.webp" },
    ],
    links: [
      { rel: "stylesheet", href: appCss },
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,400;9..144,500;9..144,600;9..144,700&family=Inter:wght@400;500;600;700&display=swap",
      },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
});

function RootShell({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt">
      <head>
        <HeadContent />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function RootComponent() {
  return (
    <I18nProvider>
      <AuthProvider>
        <div className="flex min-h-screen flex-col">
          <Header />
          <main className="flex-1">
            <Outlet />
          </main>
          <Footer />
        </div>
        <Toaster />
      </AuthProvider>
    </I18nProvider>
  );
}
