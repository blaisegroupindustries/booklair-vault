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
      { title: "Booklair — Your Personal Library of Knowledge" },
      {
        name: "description",
        content:
          "Premium ebooks for entrepreneurs and ambitious minds. Marketing, business, education and personal development.",
      },
      { name: "author", content: "Booklair" },
      { name: "theme-color", content: "#FBFAF7", media: "(prefers-color-scheme: light)" },
      { name: "theme-color", content: "#181A20", media: "(prefers-color-scheme: dark)" },
      { property: "og:title", content: "Booklair" },
      { property: "og:description", content: "Knowledge that transforms. Curated ebooks for builders worldwide." },
      { property: "og:type", content: "website" },
      { property: "og:site_name", content: "Booklair" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: "Booklair" },
      { name: "twitter:description", content: "Booklair — premium ebooks for ambitious minds worldwide." },
      { property: "og:image", content: "https://storage.googleapis.com/gpt-engineer-file-uploads/51I7wRl70CVdLLTDSgpxAGTbi2B2/social-images/social-1777541435498-booklair_og_image.webp" },
      { name: "twitter:image", content: "https://storage.googleapis.com/gpt-engineer-file-uploads/51I7wRl70CVdLLTDSgpxAGTbi2B2/social-images/social-1777541435498-booklair_og_image.webp" },
    ],
    links: [
      { rel: "stylesheet", href: appCss },
      { rel: "icon", type: "image/svg+xml", href: "/favicon.svg" },

      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wght@12..96,400;12..96,500;12..96,600;12..96,700;12..96,800&family=IBM+Plex+Sans:wght@400;500;600;700&family=IBM+Plex+Mono:wght@400;500;600&display=swap",
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
