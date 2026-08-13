# PROMPT DE RECONSTRUÇÃO TOTAL — BOOKLAIR VAULT + MENTOR 10K

> Cola este documento inteiro como prompt. És um engenheiro full-stack. Constrói a aplicação abaixo do zero, ficheiro a ficheiro, respeitando literalmente cada nome de rota, coluna, campo, cor, texto e comportamento descrito. Não simplifiques. Não inventes alternativas.

---

## 1. CONTEXTO E OBJETIVO

Constrói o **Booklair** — uma livraria digital premium — com três produtos dentro da mesma aplicação:

1. **Loja/biblioteca de ebooks**: catálogo unificado de ebooks gratuitos e premium, cada um podendo existir em **português e inglês**, em **PDF e audiobook**, com capas por imagem ou capas geradas por texto/gradiente, promoções com datas, lançamentos agendados com contagem decrescente, e um **leitor embebido no site** (nunca download do ficheiro original).
2. **Painel de administração completo** (`/admin`): controlo total sobre catálogo, ficheiros, coleções, cupões, reviews, popups, campanhas de email, afiliados, editor da homepage, utilizadores, compras, exportação de dados e definições globais.
3. **Mentor 10K**: programa de mentoria com IA, de acesso restrito, com diagnóstico, plano de 12 semanas gerado por IA, check-ins semanais com feedback, chat com o mentor e histórico de progresso.

Idioma da interface: **inglês por defeito**, com alternância PT/EN persistida. Muita da copy administrativa e de páginas internas está em **português europeu** — mantém exatamente como descrito.

---

## 2. STACK TÉCNICA OBRIGATÓRIA

- **TanStack Start v1** (`@tanstack/react-start` ^1.167) + **TanStack Router** (`@tanstack/react-router` ^1.168) com routing baseado em ficheiros em `src/routes/`; `src/routeTree.gen.ts` é gerado — nunca editar.
- **React 19**, **Vite 7**, deploy em runtime de edge (Cloudflare Workers) via `@cloudflare/vite-plugin`.
- **Tailwind CSS v4** com `@theme inline` em `src/styles.css` (sem `tailwind.config.js`), + `tw-animate-css`.
- **shadcn/ui** sobre Radix UI, ícones **lucide-react**, toasts **sonner**, gráficos **recharts**, carrossel **embla**, `class-variance-authority` + `clsx` + `tailwind-merge`.
- **Supabase** (`@supabase/supabase-js` ^2.105) para auth, base de dados Postgres com RLS, e storage.
- **Auth Google** via `@lovable.dev/cloud-auth-js` (`lovable.auth.signInWithOAuth`).
- **Validação**: `zod` (+ `react-hook-form` onde aplicável).
- **IA**: API Gemini (`generativelanguage.googleapis.com/v1beta`) chamada apenas do servidor com `GEMINI_API_KEY`.
- Lógica de servidor com `createServerFn` de `@tanstack/react-start`; webhooks públicos como server routes em `src/routes/api/public/*`.

Regras estruturais:
- Layout raiz único em `src/routes/__root.tsx`.
- Nomes de ficheiros com pontos = segmentos de URL (`admin.ebooks.$id.tsx` → `/admin/ebooks/$id`).
- Nunca importar módulos `*.server.ts` a partir de componentes; componentes importam `*.functions.ts`.
- `process.env` só dentro de handlers de server functions; no browser usa `import.meta.env.VITE_*`.

---

## 3. MAPA DE ROTAS

| Ficheiro | URL | Descrição |
|---|---|---|
| `__root.tsx` | — | Shell: `<html lang="pt">`, providers I18n + Auth, Header, Outlet, Footer, Toaster, 404 |
| `index.tsx` | `/` | Home: hero, destaques, próximos lançamentos com countdown, categorias, CTA |
| `loja.tsx` | `/loja` | Catálogo unificado com filtros de categoria e acesso |
| `biblioteca.tsx` | `/biblioteca` | Todos os ebooks publicados, filtro por categoria |
| `ebook.$slug.tsx` | `/ebook/$slug` | Detalhe + leitor protegido PDF/áudio + compra Lemon Squeezy |
| `auth.tsx` | `/auth` | Entrar/criar conta (email + Google), suporta `?mode=` e `?redirect=` |
| `perfil.tsx` | `/perfil` | "O meu Cofre": coleção do utilizador |
| `sobre.tsx`, `termos.tsx`, `privacidade.tsx` | `/sobre`, `/termos`, `/privacidade` | Páginas estáticas |
| `programa-mentor-10k.tsx` | `/programa-mentor-10k` | Landing pública do Mentor 10K |
| `mentor10k.tsx` + 6 filhos | `/mentor10k/*` | Área privada Mentor 10K |
| `admin.tsx` + 18 filhos | `/admin/*` | Painel de administração |
| `api.public.webhooks.lemon-squeezy.ts` | `/api/public/webhooks/lemon-squeezy` | Webhook de pagamentos |

---

## 4. MODELO DE DADOS (Postgres / Supabase)

Cria todos os tipos enumerados, tabelas, GRANTs, RLS e funções abaixo. **Regra absoluta:** cada `CREATE TABLE` em `public` é seguido de `GRANT` (authenticated + service_role; `anon` apenas quando existir política pública de leitura), depois `ENABLE ROW LEVEL SECURITY`, depois as políticas.

### 4.1 Enums

```sql
create type app_role as enum ('admin','user');
create type campaign_status as enum ('draft','scheduled','sending','sent','failed');
create type collection_type as enum ('series','bundle','curated');
create type coupon_scope as enum ('all','ebook','category');
create type coupon_type as enum ('percent','fixed');
create type cover_type as enum ('image','text');
create type ebook_category as enum ('marketing_negocios','educacao_estudo','desenvolvimento_pessoal');
create type ebook_status as enum ('draft','scheduled','published','archived');
create type ebook_type as enum ('free','premium');
create type home_section_kind as enum ('hero','featured','category','collection','newsletter','testimonials','custom_html','stats');
create type popup_target as enum ('all','guests','authenticated');
create type popup_trigger as enum ('immediate','delay','scroll','exit_intent');
```

### 4.2 Tabela central `ebooks`

Colunas (todas obrigatórias no schema; usa os defaults indicados):

`id uuid pk default gen_random_uuid()`, `title text not null`, `slug text not null unique`, `description text`, `author text`, `category ebook_category not null`, `type ebook_type not null`, `price_usd numeric`, `price_mzn numeric`, `cover_url text`, `pdf_path text`, `preview_pdf_path text`, `pages int`, `language text`, `featured bool not null default false`, `published bool not null default false`, `created_at timestamptz not null default now()`, `updated_at timestamptz not null default now()`, `status ebook_status not null default 'draft'`, `scheduled_at timestamptz`, `published_at timestamptz`, `pdf_path_pt text`, `pdf_path_en text`, `audio_path_pt text`, `audio_path_en text`, `preview_audio_path text`, `available_languages text[] not null default '{pt}'`, `available_formats text[] not null default '{pdf}'`, `cover_type cover_type not null default 'image'`, `cover_text_title text`, `cover_text_subtitle text`, `cover_bg_color text`, `cover_text_color text`, `cover_gradient text`, `sale_price_usd numeric`, `sale_price_mzn numeric`, `sale_starts_at timestamptz`, `sale_ends_at timestamptz`, `free_until timestamptz`, `original_type ebook_type`, `tags text[] not null default '{}'`, `isbn text`, `publisher text`, `publication_year int`, `narrator text`, `audio_duration_seconds int`, `author_bio text`, `author_avatar_url text`, `author_social_links jsonb not null default '{}'`, `sort_order int not null default 0`, `allow_download bool not null default false`, `download_expires_at timestamptz`, `download_button_text text`, `countdown_enabled bool not null default false`, `countdown_text text`, `checkout_url text`, `lemon_squeezy_variant_id text`.

RLS: leitura pública (`anon`, `authenticated`) apenas de linhas com `published = true` ou `status = 'scheduled'`; escrita total apenas para `has_role(auth.uid(),'admin')`.

### 4.3 Restantes tabelas

Cria com as colunas indicadas (todas com `id uuid pk default gen_random_uuid()` e `created_at timestamptz not null default now()` salvo indicação):

- **profiles** — `id uuid pk references auth.users`, `full_name`, `avatar_url`, `preferred_language`, `updated_at`. RLS: cada utilizador lê/edita o seu; admins leem todos.
- **user_roles** — `user_id uuid not null references auth.users`, `role app_role not null`, `unique(user_id, role)`. **Nunca guardes roles no profile.**
- **purchases** — `user_id`, `ebook_id`, `stripe_session_id`, `amount_paid numeric not null`, `currency text not null`, `status text not null`. Só leitura para o próprio e admins; escrita apenas via service role.
- **downloads** — `user_id`, `ebook_id`, `downloaded_at timestamptz not null default now()`.
- **vault_access_grants** — `user_id`, `email`, `ebook_id not null`, `source text not null`, `external_order_id`, `notes`, `granted_by`.
- **mentor10k_access** — `user_id`, `email`, `source text not null`, `external_order_id`, `granted_by`, `notes`.
- **mentor10k_diagnostics** — `user_id not null`, `goal not null`, `current_situation not null`, `monthly_income_eur numeric`, `available_hours_week int`, `skills`, `resources`, `obstacles`, `deadline_months int`, `profile_type`, `raw_answers jsonb`, `updated_at`.
- **mentor10k_plans** — `user_id not null`, `diagnostic_id`, `title not null`, `summary`, `phases jsonb not null`, `weekly_tasks jsonb not null`, `kpis jsonb`, `duration_weeks int`, `status text not null`, `model text`, `updated_at`.
- **mentor10k_checkins** — `user_id not null`, `plan_id`, `week_number int not null`, `progress_score int`, `income_eur numeric`, `what_done`, `what_blocked`, `next_focus`, `mentor_feedback`, `mood`.
- **mentor10k_messages** — `user_id not null`, `role text not null`, `content text not null`.
- **mentor10k_milestones** — `user_id not null`, `plan_id`, `title not null`, `description`, `achieved_at timestamptz not null default now()`.
- **coupons** — `code not null unique`, `description`, `discount_type coupon_type not null`, `discount_value numeric not null`, `scope coupon_scope not null`, `scope_ebook_id`, `scope_category`, `max_uses int`, `used_count int not null default 0`, `min_order_usd numeric`, `starts_at`, `expires_at`, `active bool not null default true`, `created_by`, `updated_at`.
- **coupon_redemptions** — `coupon_id not null`, `user_id not null`, `ebook_id`, `amount_discounted numeric`.
- **ebook_collections** — `slug not null unique`, `title not null`, `description`, `type collection_type not null`, `cover_url`, `bundle_price_usd`, `bundle_price_mzn`, `featured bool not null default false`, `published bool not null default false`, `sort_order int not null default 0`, `updated_at`.
- **collection_items** — `collection_id not null`, `ebook_id not null`, `sort_order int not null default 0`.
- **ebook_chapters** — `ebook_id not null`, `sort_order int not null`, `title not null`, `description`, `page_start int`, `audio_timestamp_seconds int`, `is_free_preview bool not null default false`.
- **ebook_bonuses** — `ebook_id not null`, `title not null`, `description`, `file_path not null`, `file_type`, `sort_order int not null default 0`.
- **ebook_reviews** — `ebook_id not null`, `user_id not null`, `rating int not null`, `title`, `body`, `approved bool not null default false`, `hidden bool not null default false`, `updated_at`.
- **popups** — `name not null`, `enabled bool not null default false`, `title`, `body`, `cta_text`, `cta_link`, `image_url`, `trigger popup_trigger not null default 'delay'`, `trigger_value int not null default 5`, `target popup_target not null default 'all'`, `show_on_paths text[] not null default '{}'`, `starts_at`, `ends_at`, `views_count int not null default 0`, `clicks_count int not null default 0`, `updated_at`.
- **home_sections** — `kind home_section_kind not null`, `title`, `subtitle`, `config jsonb not null default '{}'`, `sort_order int not null default 0`, `enabled bool not null default true`, `updated_at`.
- **email_campaigns** — `name not null`, `subject not null`, `body_html`, `segment text not null`, `status campaign_status not null default 'draft'`, `scheduled_at`, `sent_at`, `recipients_count int not null default 0`, `opens_count int not null default 0`, `clicks_count int not null default 0`, `updated_at`.
- **affiliates** — `name not null`, `email`, `code not null unique`, `commission_percent numeric not null default 20`, `active bool not null default true`, `notes`, `total_clicks int not null default 0`, `total_conversions int not null default 0`, `total_revenue_usd numeric not null default 0`, `updated_at`.
- **affiliate_clicks** — `affiliate_id not null`, `ebook_id`, `ip_address`, `user_agent`, `referrer`, `landing_path`.
- **affiliate_conversions** — `affiliate_id not null`, `ebook_id`, `user_id`, `email`, `amount_usd numeric not null`, `commission_usd numeric not null`, `external_order_id`, `status text not null`.
- **activity_log** — `actor_id`, `actor_email`, `action text not null`, `entity_type`, `entity_id`, `details jsonb not null default '{}'`, `ip_address`. UPDATE/DELETE negados a todos.
- **notifications** — `kind text not null`, `title text not null`, `body`, `link`, `read bool not null default false`.
- **user_bans** — `user_id not null`, `reason`, `banned_until`, `banned_by`.
- **site_settings** — `id bool pk default true` (linha única), `site_name text not null`, `tagline`, `logo_url`, `contact_email`, `footer_text`, `banner_enabled bool not null default false`, `banner_text`, `banner_link`, `social_instagram`, `social_facebook`, `social_tiktok`, `social_youtube`, `social_x`, `social_linkedin`, `social_whatsapp`, `updated_at`. INSERT/DELETE negados; UPDATE só admin; SELECT público.

### 4.4 Funções SQL (todas `security definer set search_path = public`)

```sql
create or replace function has_role(_user_id uuid, _role app_role) returns boolean
language sql stable security definer set search_path = public as $$
  select exists (select 1 from user_roles where user_id = _user_id and role = _role);
$$;

-- Acesso a um ebook: gratuito+publicado, admin, compra concluída, ou grant no cofre
create or replace function has_ebook_access(_user_id uuid, _ebook_id uuid) returns boolean
language sql stable security definer set search_path = public as $$
  select exists (select 1 from ebooks e where e.id = _ebook_id and e.type = 'free' and e.published)
      or has_role(_user_id, 'admin')
      or exists (select 1 from purchases p where p.user_id = _user_id and p.ebook_id = _ebook_id and p.status = 'completed')
      or exists (select 1 from vault_access_grants g where g.ebook_id = _ebook_id and g.user_id = _user_id);
$$;

-- Acesso ao Mentor 10K: por user_id OU pelo email da conta autenticada
create or replace function has_mentor10k_access(_user_id uuid) returns boolean
language sql stable security definer set search_path = public as $$
  select exists (
    select 1 from mentor10k_access a
    where a.user_id = _user_id
       or lower(a.email) = (select lower(u.email) from auth.users u where u.id = _user_id)
  ) or has_role(_user_id, 'admin');
$$;

-- Converte grants criados por email (webhook) em grants ligados ao utilizador autenticado
create or replace function claim_vault_access_for_email() returns void
language plpgsql security definer set search_path = public as $$
declare v_email text;
begin
  select lower(email) into v_email from auth.users where id = auth.uid();
  if v_email is null then return; end if;
  update vault_access_grants set user_id = auth.uid()
    where user_id is null and lower(email) = v_email;
  update mentor10k_access set user_id = auth.uid()
    where user_id is null and lower(email) = v_email;
end; $$;

-- Trigger em auth.users: cria profile e promove o email do dono a admin
create or replace function handle_new_user() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  insert into profiles (id, full_name) values (new.id, new.raw_user_meta_data->>'full_name')
    on conflict (id) do nothing;
  if lower(new.email) = 'blairblaise70@gmail.com' then
    insert into user_roles (user_id, role) values (new.id, 'admin') on conflict do nothing;
  end if;
  return new;
end; $$;

create or replace function set_updated_at() returns trigger
language plpgsql security definer set search_path = public as $$
begin new.updated_at = now(); return new; end; $$;
```

Liga `handle_new_user` a `after insert on auth.users` e `set_updated_at` a `before update` em todas as tabelas com `updated_at`.

### 4.5 Storage

Três buckets:
- `covers` — **público** (capas servidas por URL pública).
- `ebooks` — **privado** (PDFs).
- `audio` — **privado** (audiobooks).

Políticas: upload/eliminação apenas para admins; leitura dos buckets privados **apenas** por URL assinada gerada no servidor após verificação de acesso.

---

## 5. INTEGRAÇÕES E SEGURANÇA DE CONTEÚDO

### 5.1 Server functions de acesso — `src/lib/ebook-access.functions.ts`

- `getEbookSignedUrl` — `createServerFn({method:"POST"}).middleware([requireSupabaseAuth])`, input Zod `{ ebookId: uuid, format: "pdf"|"audio" = "pdf", lang: "pt"|"en" = "pt" }`. Handler: (1) `context.supabase.rpc("claim_vault_access_for_email")` (best-effort); (2) `supabaseAdmin.rpc("has_ebook_access", {_user_id, _ebook_id})`; se falso devolve `{ ok:false, error:"Sem acesso a este ebook." }`; (3) assina o ficheiro; (4) insere linha em `downloads`.
- `getFreeEbookSignedUrl` — pública, sem middleware; só assina se `ebook.type === 'free' && ebook.published`, senão `"Este ebook requer compra."`.
- `signFor` (interno): escolhe bucket (`ebooks` para pdf, `audio` para áudio) e path por idioma (com fallback ao `pdf_path` legacy) e cria URL assinada com validade de **3600 s**.

### 5.2 Webhook Lemon Squeezy — `src/routes/api.public.webhooks.lemon-squeezy.ts`

Server route `POST`. Lê o corpo como texto, verifica a assinatura HMAC-SHA256 do header `x-signature` com `LEMON_SQUEEZY_WEBHOOK_SECRET` usando comparação em tempo constante; devolve 401 se inválida. Em `order_created`: extrai `user_email`, `variant_id` e `order_id`; procura o ebook por `lemon_squeezy_variant_id`; insere em `vault_access_grants` `{ email (lowercase), ebook_id, source: 'lemon_squeezy', external_order_id }`; opcionalmente insere em `mentor10k_access` quando o variant corresponde ao Mentor 10K; regista em `activity_log` e cria `notifications`. Responde `200 ok`. Usa sempre o cliente admin importado dinamicamente dentro do handler.

### 5.3 Regras de segurança inegociáveis

1. Nunca expor o PDF/áudio original: só URLs assinadas de curta duração dentro de `<iframe>`/`<audio controlsList="nodownload">`.
2. Nunca decidir permissões no cliente — a decisão é sempre de `has_ebook_access` no servidor.
3. Roles em tabela separada `user_roles` + `has_role()`; nunca no profile.
4. `supabaseAdmin` só em código de servidor, importado dinamicamente dentro do handler após validar o chamador.
5. `/api/public/*` ignora auth do site — verificar assinatura/segredo dentro do handler.

---

## 6. DESIGN SYSTEM

### 6.1 Stack de estilo

Tailwind v4 com `@import "tailwindcss" source(none)`, `@source "../src"`, `@import "tw-animate-css"`, `@custom-variant dark (&:is(.dark *))`. Tema **sempre escuro** (`html { color-scheme: dark }`), com os mesmos tokens em `:root` e `.dark`.

### 6.2 Tokens (oklch)

```css
:root, .dark {
  --radius: 0.75rem;
  --background: oklch(0.16 0.018 270);
  --foreground: oklch(0.97 0.005 90);
  --surface: oklch(0.20 0.018 270);
  --surface-elevated: oklch(0.235 0.020 270);
  --card: oklch(0.215 0.018 270);
  --card-foreground: oklch(0.97 0.005 90);
  --popover: oklch(0.215 0.018 270);
  --popover-foreground: oklch(0.97 0.005 90);
  --gold: oklch(0.78 0.14 80);
  --gold-glow: oklch(0.86 0.13 90);
  --gold-foreground: oklch(0.18 0.02 270);
  --primary: oklch(0.78 0.14 80);
  --primary-foreground: oklch(0.18 0.02 270);
  --secondary: oklch(0.27 0.018 270);
  --secondary-foreground: oklch(0.95 0.005 90);
  --muted: oklch(0.25 0.015 270);
  --muted-foreground: oklch(0.68 0.015 90);
  --accent: oklch(0.30 0.025 80);
  --accent-foreground: oklch(0.97 0.005 90);
  --destructive: oklch(0.62 0.22 25);
  --destructive-foreground: oklch(0.98 0.005 90);
  --border: oklch(0.30 0.015 270 / 0.7);
  --input: oklch(0.27 0.015 270);
  --ring: oklch(0.78 0.14 80);
  --sidebar: oklch(0.18 0.018 270);
  --sidebar-foreground: oklch(0.95 0.005 90);
  --sidebar-primary: oklch(0.78 0.14 80);
  --sidebar-primary-foreground: oklch(0.18 0.02 270);
  --sidebar-accent: oklch(0.25 0.018 270);
  --sidebar-accent-foreground: oklch(0.95 0.005 90);
  --sidebar-border: oklch(0.30 0.015 270 / 0.7);
  --sidebar-ring: oklch(0.78 0.14 80);
}
```

`@theme inline` mapeia todos estes para `--color-*`, define a escala de raios (`sm/md/lg/xl/2xl/3xl` derivada de `--radius`), as fontes e:

```css
--font-sans: "Inter", system-ui, -apple-system, sans-serif;
--font-serif: "Fraunces", Georgia, "Times New Roman", serif;
--shadow-gold: 0 10px 40px -10px color-mix(in oklab, var(--gold) 35%, transparent);
--shadow-elevated: 0 20px 60px -20px oklch(0 0 0 / 0.6);
--gradient-hero: radial-gradient(ellipse 80% 60% at 50% 0%, color-mix(in oklab, var(--gold) 18%, transparent), transparent 60%);
--gradient-gold: linear-gradient(135deg, var(--gold) 0%, var(--gold-glow) 100%);
--gradient-card: linear-gradient(180deg, var(--surface-elevated) 0%, var(--surface) 100%);
```

Fontes carregadas por `<link>` no `__root.tsx` (nunca `@import` remoto no CSS):
`https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,400;9..144,500;9..144,600;9..144,700&family=Inter:wght@400;500;600;700&display=swap`.
`h1,h2,h3,h4,.font-serif { font-family: var(--font-serif); letter-spacing: -0.02em; }`

Base: `body` com `font-feature-settings: "ss01","cv11"`, antialiasing, e dois brilhos radiais dourados fixos (`background-attachment: fixed`).

### 6.3 Utilitários custom

`.text-gold`, `.bg-gold`, `.gradient-text-gold` (background-clip:text), `.glow-gold`, `.surface-card` (`background: var(--gradient-card); border: 1px solid var(--color-border)`), `.glass-card` (liquid glass: gradiente branco 6%→2%→gold 3%, `backdrop-filter: blur(28px) saturate(180%)`, borda branca 10%, sombras internas + `0 20px 60px -20px`), `.glass-pill` (versão leve, blur 20px).

### 6.4 Variantes de botão (cva)

Base: `inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:ring-1 focus-visible:ring-ring disabled:opacity-50 [&_svg]:size-4`.

- `default`, `destructive`, `outline`, `secondary`, `ghost`, `link` (padrão shadcn).
- `gold`: `bg-gold text-gold-foreground font-semibold shadow-lg hover:brightness-110 hover:shadow-[0_10px_40px_-10px_color-mix(in_oklab,var(--gold)_50%,transparent)]`.
- `hero`: `bg-[image:var(--gradient-gold)] text-gold-foreground font-semibold shadow-[0_10px_40px_-10px_...] hover:brightness-110`.
- `goldOutline`: `border border-gold/40 text-gold bg-gold/5 hover:bg-gold/10`.
- Tamanhos: `default h-10 px-5`, `sm h-8 px-3 text-xs`, `lg h-12 px-8 text-base`, `xl h-14 px-10 text-base`, `icon h-10 w-10`. `asChild` via Radix Slot.

### 6.5 Padrões de espaçamento

Contentor `container mx-auto px-4`; secções `py-16`–`py-24`; hero `pt-16 md:pt-24 pb-20 md:pb-28`; grelhas de ebooks `grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5`; cartões `rounded-2xl`/`rounded-3xl` com `surface-card`; badges `px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider rounded-full`; eyebrows `text-xs uppercase tracking-widest text-gold`.

---

## 7. CONFIGURAÇÃO GLOBAL, PROVIDERS E COMPONENTES PARTILHADOS

### 7.1 Router e Start

`src/router.tsx`: `createRouter({ routeTree, context: {}, scrollRestoration: true, defaultPreloadStaleTime: 0, defaultErrorComponent })`. O error component mostra ícone de alerta, "Something went wrong", stack só em `import.meta.env.DEV`, botões "Try again" (`router.invalidate()` + `reset()`) e "Go home".

`src/start.ts`:
```ts
export const startInstance = createStart(() => ({ functionMiddleware: [attachSupabaseAuth] }));
```

### 7.2 `__root.tsx`

`head()` fixo: title "Booklair — Your Personal Library of Knowledge", description, author "Booklair", `theme-color #0A0A0A`, Open Graph (`og:type=website`, `og:site_name=Booklair`, `og:image` absoluto) e `twitter:card=summary_large_image`. `links`: CSS da app, preconnects e fonts.
`shellComponent`: `<html lang="pt">` → `<head><HeadContent/></head>` → `<body>{children}<Scripts/></body>`.
`component`: `I18nProvider` → `AuthProvider` → `flex min-h-screen flex-col` com `<Header/>`, `<main className="flex-1"><Outlet/></main>`, `<Footer/>`, `<Toaster/>`.
`notFoundComponent`: eyebrow "404" dourado, h1 "Página não encontrada", botão dourado "Voltar à Booklair".

### 7.3 i18n (`src/lib/i18n.tsx`)

Dicionário `Record<string,{pt,en}>` com chaves `nav.*`, `hero.*`, `store.*`, `featured.*`, `categories.*`, `cat.*`, `ebook.*`, `filter.*`, `footer.*`. Idioma inicial **`en`**; ao montar lê `localStorage["booklair-lang"]`; `setLang` persiste. `t(key)` faz fallback à própria chave. `useI18n()` lança erro fora do provider.

### 7.4 Auth (`src/lib/auth.tsx`)

Expõe `{ user, session, loading, adminLoading, isAdmin, signOut }`. Regista `onAuthStateChange` **antes** de `getSession()`. Dentro do listener, chama `checkAdmin(userId)` via `setTimeout(0)` para evitar deadlock. `checkAdmin` consulta `user_roles` (`user_id` + `role='admin'`, `maybeSingle`).

### 7.5 `ebook-helpers.ts`

`getEffectiveType(e)` → `"free_temp"` se `free_until` futuro, senão `e.type`. `isOnSale(e)` → falso sem `sale_price_usd`, ou fora da janela `sale_starts_at`/`sale_ends_at`. `getDisplayPriceUSD/MZN` → null se não premium; preço de saldo quando em promoção. `getDiscountPct` → `round((1 - sale/normal)*100)`. `CATEGORY_OPTIONS` (3 categorias com labels PT/EN), `STATUS_OPTIONS` (draft/scheduled/published/archived), `slugify()` (NFD, lowercase, remove não alfanuméricos, espaços→`-`).

### 7.6 Header

Sticky `top-0 z-50`, `bg-background/80 backdrop-blur-xl`, borda inferior. Logo à esquerda; nav desktop: Home, Biblioteca, Loja, **Mentor 10K** (`/programa-mentor-10k`), Sobre — ativo em `text-gold`. Botão de idioma (`Globe` + código em maiúsculas) alterna pt/en. Autenticado: dropdown (`goldOutline`, ícone `User`, parte local do email) com Perfil, Admin (se `isAdmin`), separador, Sair. Não autenticado: "Entrar" (ghost) + "Criar conta" (gold, `?mode=signup`). Mobile: hamburger `Menu`/`X` com painel expansível.

### 7.7 Footer

Lê `site_settings` (`.eq("id", true).maybeSingle()`) e mostra apenas as redes preenchidas (Instagram, Facebook, YouTube, LinkedIn, X, WhatsApp via `https://wa.me/<dígitos>`). Grelha `md:grid-cols-4`: Logo + tagline (`footer_text` ou `t("footer.tagline")`) + email; coluna "Booklair" (Biblioteca, Loja, Sobre); coluna "Legal" (Termos, Privacidade). Rodapé `© {ano} Booklair` + "Global · Est. 2025".

### 7.8 Logo

Cache em módulo para evitar refetch. Lê `site_settings.logo_url, site_name`. Converte URLs `github.com/.../blob/...` em `raw.githubusercontent.com` e remove query strings. Com logo: `<img className="h-9 w-auto max-w-[160px] object-contain">`. Sem logo: quadrado `h-9 w-9 rounded-lg bg-[image:var(--gradient-gold)]` + "Book**lair**" em `font-serif text-xl`.

### 7.9 EbookCard

Props `{ ebook: EbookCardData }`. Calcula tipo efetivo, promoção, preços, `hasAudio`, `hasMulti`, `isScheduled`. `Link` para `/ebook/$slug`, `surface-card rounded-2xl overflow-hidden`, hover `-translate-y-1` + `shadow-[var(--shadow-elevated)]`, capa `aspect-[3/4]` via `EbookCover`. Prioridade dos badges: "Em breve" (azul, com `Countdown` compacto sobre a capa) > "Grátis agora" (esmeralda) > `-X%` (rosa) > "Grátis"/"Premium". Ícones no canto: cadeado (pago), auscultadores (áudio), globo (multi-idioma). Rodapé: categoria, título `line-clamp-2`, autor, preço USD (com preço original riscado se em saldo) + MZN aproximado, seta `→` no hover.

### 7.10 EbookCover

Três modos: imagem (`object-cover`), texto (fundo `cover_bg_color` ou `cover_gradient`, título `cover_text_title`, subtítulo uppercase, autor no rodapé; fallback `linear-gradient(135deg,#2a2a3e,#1a1a2e)` e cor `#f4d27a`), e fallback com ícone `BookOpen` sobre `bg-gradient-to-br from-secondary to-muted`.

### 7.11 Countdown

Props `to`, `compact`, `label`, `className`. `setInterval` de 1 s; devolve `null` se a data já passou. Compacto: `Xd HH:MM:SS` monoespaçado. Completo: 4 blocos `surface-card` (Dias/Horas/Min/Seg) com números `font-serif text-2xl text-gold tabular-nums`.

---

## 8. PÁGINAS PÚBLICAS

### 8.1 `/` — Home

Head: title "Booklair — Your Personal Library of Knowledge"; description "Premium ebooks for entrepreneurs and ambitious minds. Marketing, business, education and personal development."; og:title "Booklair"; og:description "Knowledge that transforms. Curated ebooks for builders worldwide."

Queries (colunas `cols` = id, slug, title, description, author, category, type, price_usd, price_mzn, cover_url, cover_type, cover_text_title, cover_text_subtitle, cover_bg_color, cover_text_color, cover_gradient, sale_price_usd, sale_price_mzn, sale_starts_at, sale_ends_at, free_until, available_languages, available_formats, status, scheduled_at):
1. `.eq("published",true).eq("featured",true).limit(8)`
2. `.eq("status","scheduled").gt("scheduled_at", now).order("scheduled_at").limit(4)`

Secções, por esta ordem:
1. **Hero** com `bg-[image:var(--gradient-hero)]`: eyebrow `Sparkles` + `t("hero.eyebrow")`; `h1 font-serif text-5xl md:text-6xl lg:text-7xl` em que as **últimas duas palavras** de `t("hero.title")` levam `gradient-text-gold`; subtítulo; CTA `hero` → `/loja` e CTA `goldOutline` → `/biblioteca`; estatísticas "3 Categories", "EN · PT Bilingual", "∞ Access"; imagem `hero-book.jpg` em `rounded-3xl` com halo `bg-gold/10 blur-3xl`.
2. **Featured** (só se houver): eyebrow `t("featured.title")`, título `t("featured.subtitle")`, link "View all →", grelha de cards.
3. **Coming soon** (só se houver): eyebrow azul "Coming soon" com `Clock`, título "On the way to Booklair", subtítulo "Mark your calendar — these ebooks land soon.", `Countdown` central com label `Next: "{title}"`, grelha.
4. **Categories**: 3 cartões (Marketing & Negócios/`TrendingUp`, Educação & Estudo/`GraduationCap`, Desenvolvimento Pessoal/`Sparkles`), texto "Curated content to accelerate your growth.", link "Explore →".
5. **CTA final**: "Build your **elite** library." (elite em dourado), "Create your free account and start today. No subscriptions. No fine print.", botão "Get started free →" para `/auth?mode=signup`.

### 8.2 `/loja`

Head: "Catálogo — Booklair" + description sobre ebooks gratuitos e premium. Query `.or("published.eq.true,status.eq.scheduled").order("created_at",{ascending:false})` + `.eq("category", filter)`. O filtro de acesso (`all|free|premium`) aplica-se **em memória** (`isFreeNow = type==='free' || free_until futuro`). Copy: eyebrow "Catálogo completo", h1 "Toda a Booklair num só sítio", subtítulo "Ebooks gratuitos e premium juntos. Filtra por categoria ou acesso para encontrar o teu próximo livro.". Pills de categoria (ativo `bg-gold text-gold-foreground`) e de acesso (ativo `bg-gold/15 text-gold border-gold/40`). Loading: 8 skeletons `aspect-[3/4] animate-pulse`. Vazio: "Nenhum ebook encontrado."

### 8.3 `/biblioteca`

Head "Biblioteca — Booklair". Query só `.eq("published", true)` ordenada por `created_at desc`, filtro apenas por categoria. Copy: eyebrow "Biblioteca", h1 "Todos os ebooks", subtítulo "Catálogo único com gratuitos e premium claramente identificados." Vazio: "Sem ebooks ainda."

### 8.4 `/ebook/$slug` — detalhe + leitor protegido

Carrega com `select("*").eq("slug", slug).or("published.eq.true,status.eq.scheduled").maybeSingle()`. Inicializa `lang` com o primeiro de `available_languages` (fallback `pt`) e `format` com o primeiro de `available_formats` (fallback `pdf`). Se autenticado e premium, verifica `purchases` (`status='completed'`).

**`startReading()`**: se não autenticado e o ebook não é grátis → `/auth?mode=signin&redirect=/ebook/{slug}?read=1`. Caso contrário chama `getEbookSignedUrl` (autenticado) ou `getFreeEbookSignedUrl` (anónimo); erro → `toast.error(res.error)`; sucesso → guarda `signedUrl` e entra em modo leitor. Um `useEffect` deteta `?read=1`, remove o parâmetro e arranca a leitura automaticamente (usado no pós-login e no atalho do Perfil).

**Modo leitor**: overlay `fixed inset-0 z-50`; barra superior com "← Voltar", título e `<select>` de idioma/formato (só se houver mais que uma opção; ao mudar reinicia a leitura após 50 ms). Corpo: áudio → capa + `<audio controls autoPlay controlsList="nodownload">` + aviso "Reprodução protegida. Download desativado."; PDF → `<iframe src="{signedUrl}#toolbar=0&navpanes=0">` a ocupar o ecrã.

**Detalhe**: link "← Voltar" para `/loja`; grelha `lg:grid-cols-[400px_1fr]`; capa com overlay `bg-background/40 backdrop-blur-[2px]` + cadeado + "Premium" quando bloqueada; categoria, h1, "por {author}", badges (páginas, Grátis/Premium), descrição `whitespace-pre-line`. Bloco de ação `surface-card rounded-2xl p-6`: seletores de idioma (PT/EN) e formato (`FileText`/`Headphones`) em pills (ativo `bg-gold/15 text-gold border-gold/40`); grátis → "Grátis" em `gradient-text-gold` + botão "Ler no site" (texto "A abrir…" durante `signing`); já comprado → "✓ Já tens este ebook" + "Ler no site"; premium não comprado → `$X.XX USD` + `≈ MZN X` + botão "Comprar" + nota "Leitura no site após compra. Sem downloads — proteção total do conteúdo."

**`handleBuy()`**: abre `checkout_url` em nova aba (`noopener,noreferrer`) acrescentando `checkout[email]=<email>`; sem URL configurado mostra `toast.info("Checkout ainda não configurado. Abre o painel admin → Ebooks → Preços para colar o link Lemon Squeezy.")`.

### 8.5 `/auth`

Head "Entrar — Booklair". Search params Zod: `mode?: "signin"|"signup"`, `redirect?: string`. Se já autenticado, navega imediatamente para `redirect ?? "/perfil"`. Validação Zod: email (trim, formato, ≤255, "Email inválido"), password (6–72, "Mínimo 6 caracteres"), fullName (1–100, só no signup).
Signup: `supabase.auth.signUp({ email, password, options: { emailRedirectTo: window.location.origin, data: { full_name } } })` → toast "Conta criada! Verifica o teu email."
Signin: `signInWithPassword` → "Bem-vindo de volta!"
Google: `lovable.auth.signInWithOAuth("google", { redirect_uri: window.location.origin + (search.redirect ?? "/perfil") })`; se `result.redirected`, não navegar manualmente.
Layout: cartão `surface-card rounded-3xl p-8 md:p-10` centrado; eyebrow "Booklair"; título "Bem-vindo de volta"/"Cria a tua conta"; botão outline com SVG do Google "Continuar com Google"; separador "ou"; campos Nome (signup), Email (`Mail`), Password (`Lock`); botão `hero` "Entrar"/"Criar conta" + `ArrowRight`; alternador no rodapé.

### 8.6 `/perfil` — "O meu Cofre"

Head "O meu Cofre — Booklair". Redireciona para `/auth` se não autenticado. Fluxo: `rpc("claim_vault_access_for_email")` → `profiles` → em paralelo `purchases` (completed) e `vault_access_grants` → `ebooks.in("id", ids)` (dedup por `Set`). Cabeçalho `surface-card rounded-3xl` com avatar circular `bg-[image:var(--gradient-gold)]`, eyebrow "Cofre", "Bem-vindo, {nome}", email, botão "Sair". Secção "A tua coleção" (`ShoppingBag`): vazio → "Ainda não tens ebooks no cofre." + botão "Explorar a loja"; com itens → grelha `sm:grid-cols-2 lg:grid-cols-3` de cards que ligam a `/ebook/$slug?read=1` com "Abrir leitor →". Teaser final tracejado: "10K em 90 dias", "O próximo capítulo da tua biblioteca está a chegar.", badge "Brevemente".

### 8.7 `/sobre`, `/termos`, `/privacidade`

- **Sobre**: eyebrow e h1 com `t("about.title")`, lead `t("about.lead")`, três parágrafos fixos em PT (`prose prose-invert`) sobre curadoria, missão (categorias destacadas a dourado, "Sem subscrições. Sem letras pequenas.") e alcance ("Lisboa, Maputo, São Paulo, Luanda").
- **Termos**: secções "1. Conta", "2. Compras", "3. Uso permitido", "4. Reembolsos" + "Última atualização: {data}".
- **Privacidade**: "Dados que recolhemos", "Cookies", "Os teus direitos" + data.

---

## 9. PAINEL DE ADMINISTRAÇÃO

### 9.0 Arquitetura e convenções

Todas as páginas fazem chamadas diretas ao cliente `supabase`, sem camada de API. Convenções transversais a replicar:
- Cartões `surface-card`, títulos `font-serif`, destaque `gold` (`text-gold`, `bg-gold/10`, `border-gold/30`, `bg-gold/15`).
- Badges `text-[10px] px-2 py-0.5 rounded-full` com cores semânticas: `emerald` (ativo/publicado), `amber` (pendente), `rose` (erro/eliminar), `blue` (agendado), `muted` (rascunho).
- Toasts `sonner`; tabelas `<table className="w-full text-sm">` com `<thead className="bg-muted/30 text-xs uppercase tracking-wider text-muted-foreground">`.
- CRUD por `Dialog` shadcn com estado `editing`/`adding` (objeto ou `null`); `confirm()` nativo antes de qualquer `delete()`.
- Validação no cliente com `toast.error`; botões só `disabled` durante `saving`.
- Realtime apenas em dois sítios: sino de notificações e página de atividade.
- Sem paginação: `.limit(500)` ou sem limite, filtragem/pesquisa no cliente.
- Uploads sempre com nome único `${Date.now()}-${slug}...`.

### 9.1 Layout `/admin` — `src/routes/admin.tsx`

Guarda: `useAuth()` → sem user redireciona para `/auth`; enquanto `loading || adminLoading` mostra "A carregar…"; sem `isAdmin` mostra ecrã "Acesso restrito" com `ShieldCheck h-12 w-12 text-gold` (sem saída).

Estrutura: header com hamburger (`lg:hidden`), quadrado `h-10 w-10 rounded-lg bg-gold/10` com `ShieldCheck`, "Admin" (uppercase dourado) + "Booklair" (`font-serif text-2xl`), e `<AdminNotificationsBell/>` à direita. Corpo `grid lg:grid-cols-[240px_1fr] gap-6`: drawer mobile (`fixed inset-0 z-50`, overlay preto/60, painel 288 px) que fecha ao mudar de `pathname`, nav desktop, e `{onIndex ? <AdminDashboard/> : <Outlet/>}` com `onIndex = pathname === "/admin"`.

Sidebar em 6 grupos (título `text-[10px] uppercase tracking-widest text-muted-foreground/60`), links `flex items-center gap-2 px-3 py-1.5 rounded-md text-sm`, ativo `bg-gold/10 text-gold border border-gold/30`:

1. **Visão geral** — Dashboard `/admin` (`LayoutDashboard`, exato) · Atividade `/admin/atividade` (`Activity`)
2. **Catálogo** — Ebooks `/admin/ebooks` (`BookOpen`) · Biblioteca de ficheiros `/admin/midia` (`FolderTree`) · Coleções & Bundles `/admin/colecoes` (`FolderTree`) · Reviews `/admin/reviews` (`MessageSquare`)
3. **Vendas** — Compras `/admin/compras` (`ShoppingBag`) · Cupões `/admin/cupoes` (`Tag`) · Afiliados `/admin/afiliados` (`Users`) · Mentor 10K `/admin/mentor10k` (`ShieldCheck`)
4. **Marketing** — Popups & Banners `/admin/popups` (`Bell`) · Email Campaigns `/admin/campanhas` (`Mail`) · Editor da Home `/admin/home` (`LayoutTemplate`)
5. **Comunidade** — Utilizadores `/admin/utilizadores` (`Users`)
6. **Sistema** — Site & Redes `/admin/settings` (`Settings`) · Export / Import `/admin/dados` (`Database`)

### 9.2 Dashboard — `src/components/admin/Dashboard.tsx`

Um `useEffect` no mount com `Promise.all` de 8 queries:
```js
ebooks count exact head
ebooks count exact head .eq("status","draft")
profiles select id, created_at
purchases select amount_paid, created_at, status
ebook_reviews select rating, hidden, approved
downloads select ebook_id, downloaded_at .gte("downloaded_at", há30dias)
activity_log select ... order created_at desc limit 8
ebooks select id, title, category
```
Derivados: `revenue` = soma de `amount_paid` com `status='completed'`; `avgRating` = média de reviews `approved && !hidden`; série de 30 dias construída iterando `i` de 29 a 0 com chave `date.slice(5)`; `top` = 5 ebooks mais descarregados; `catSplit` = contagem por categoria.

Layout: grid `grid-cols-2 lg:grid-cols-4` com 8 KPIs (`surface-card rounded-2xl p-4`, valor `text-xl font-serif`, label `text-[10px]` uppercase): 1) Receita 30d (`DollarSign`, destacado com borda dourada) 2) Vendas (`ShoppingBag`) 3) Utilizadores (`Users`) 4) Ebooks "{publicados} pub." + sub "{drafts} rascunho" (`BookPlus`) 5) Rating médio (`Star`) + sub "{n} reviews" 6) Conv. média = `(purchases/users)*100`% (`TrendingUp`) 7) Sessões hoje "—" sub "liga analytics" (`Eye`) 8) A moderar = drafts (`FileWarning`).
Gráficos recharts: `LineChart` "Performance" 30 dias com 3 séries — revenue `#d4a849`, sales `#22c55e`, signups `#3b82f6` (`lg:col-span-2`); `PieChart` "Categorias" com cores `["#d4a849","#8b6914","#6b4f0e","#3d2c08"]`; bar chart vertical "Top ebooks". Lista "Atividade recente" (8 itens, bullet dourado, link "Ver tudo →"). "Atalhos rápidos": Novo ebook (dourado), Criar cupão, Configurar popup, Editar home, Exportar dados.

### 9.3 `AdminNotificationsBell`

`load()` = `notifications.select("*").order("created_at",{ascending:false}).limit(15)`. Subscreve o canal `admin-notifications` a `postgres_changes` INSERT em `notifications` e recarrega. Ícone `Bell` com badge `bg-rose-500` mostrando não lidos ("9+" se >9). Dropdown `absolute right-0 top-full mt-2 w-80 max-h-96 surface-card` com "Marcar todas lidas" (`update({read:true}).eq("read",false)`), lista `divide-y` (fundo `bg-gold/5` se não lida, envolvida em `<Link>` se tiver `link`, timestamp `toLocaleString("pt-PT")`) e overlay `fixed inset-0 z-40` para fechar.

### 9.4 `/admin/ebooks` — listagem

Query: `select("id, slug, title, category, type, status, published, featured, price_usd, created_at").order("created_at",{ascending:false})`.
- `togglePublished(r)`: `update({ published: !r.published, status: next?"published":"draft", published_at: next?now():null })` → toast "Publicado"/"Despublicado".
- `toggleFeatured(r)`: `update({ featured: !r.featured })`.
- `remove(r)`: `confirm()` + `delete()` → toast "Eliminado".
Filtros client-side por status (`all|draft|scheduled|published|archived`) e por texto no título. Cabeçalho com botão dourado "Novo ebook" (`Plus`) → `/admin/ebooks/novo`. Tabela: Título (+slug), Categoria, Tipo (badge), Estado (badge), Preço (direita), Ações — 4 ícones: `Star` (dourado preenchido se featured), `Eye`/`EyeOff` (verde se publicado), `Pencil`, `Trash2` (rosa). Vazio: "Criar o primeiro".

### 9.5 `EbookFormPanel` — `src/components/admin/EbookForm.tsx` (peça central)

Um único componente `EbookFormPanel({ id }: { id?: string })` usado em `/admin/ebooks/novo` (sem id) e `/admin/ebooks/$id` (com id).

**Estado `EbookForm`** (todos os campos):
```ts
id?; title; slug; description; author; author_bio; author_avatar_url;
category; type: "free"|"premium"; status: "draft"|"scheduled"|"published"|"archived"; scheduled_at;
price_usd; price_mzn; sale_price_usd; sale_price_mzn; sale_starts_at; sale_ends_at; free_until;
cover_url; cover_type: "image"|"text"; cover_text_title; cover_text_subtitle;
cover_bg_color; cover_text_color; cover_gradient;
pdf_path_pt; pdf_path_en; audio_path_pt; audio_path_en; preview_pdf_path; preview_audio_path;
available_languages: string[]; available_formats: string[];
pages; language; isbn; publisher; publication_year; narrator; audio_duration_seconds;
tags: string[]; featured: boolean; published: boolean;
author_social_instagram; author_social_twitter; author_social_linkedin; author_social_website;
checkout_url; lemon_squeezy_variant_id;
```
Defaults: `category:"marketing_negocios"`, `type:"free"`, `status:"draft"`, `cover_type:"image"`, `cover_text_color:"#f4d27a"`, `cover_gradient:"linear-gradient(135deg, #2a1a4e 0%, #1a0a2e 100%)"`, `available_languages:["pt"]`, `available_formats:["pdf"]`, `language:"pt"`.

**Autosave (obrigatório)**: chave `` `ebook-draft:${id ?? "novo"}` ``; o `useState` inicial faz merge de `DEFAULT` com o JSON guardado; um `useEffect` grava a cada alteração (exceto durante `loading`); ao gravar com sucesso remove a chave. Motivo: sobreviver a idas ao seletor de ficheiros e round-trips OAuth.

**Carregamento em edição**: `select("*").eq("id", id).single()`; erro → "Não foi possível carregar". Desconstrói `author_social_links` nas 4 chaves e corta todas as datas com `.slice(0,16)` para `datetime-local`.

**Auto-slug**: enquanto `!id`, se há título e o slug está vazio, aplica `slugify(title)` a cada alteração do título.

**Uploads**: `uploadCover(file)` → bucket `covers`, path `${Date.now()}-${slugify(title||"cover")}.${ext}`, `upsert:true`, toast de loading→sucesso com o mesmo id, guarda `getPublicUrl` em `cover_url` e força `cover_type="image"`. `uploadFile(file,bucket,field)` → buckets `ebooks`/`audio`, path `${Date.now()}-${slug}-${field}.${ext}`, guarda o **path** (buckets privados).

**Flash de campo**: estado `recentField`; `flashField(k)` aplica durante 2500 ms `ring-2 ring-gold/60 shadow-[0_0_0_4px_rgba(244,210,122,0.15)]` ao slot recém-preenchido.

**Biblioteca integrada**: estado `library:{bucket, field, accept}|null` abre o `MediaLibraryDialog`; ao escolher, guarda a URL pública (bucket `covers`) ou o nome do ficheiro, força `cover_type="image"` quando o campo é `cover_url`, faz flash e mostra `toast.success("Anexado ao formulário: {nome} ✓")`.

**Submissão**: exige `title`, `slug`, `category` ("Título, slug e categoria são obrigatórios"). Constrói `author_social_links` só com chaves não vazias; converte numéricos vazios (preços → `0`, restantes → `null`) e datas vazias → `null`; `pdf_path = pdf_path_pt || pdf_path_en || null` (compatibilidade); `published = status==='published'`; `published_at = published ? now() : null`. `insert` ou `update().eq("id",id)`; sucesso → limpa localStorage, toast "Criado"/"Atualizado", volta a `/admin/ebooks`.

**Tabs** (`TabsList flex flex-wrap gap-1 h-auto bg-transparent`, ativo `bg-gold data-[state=active]:text-gold-foreground`):

**Info** — Título*, Slug* (com `slugify` no onChange, hint "URL: /ebook/<slug>"), Descrição (`Textarea rows=5`); grid 3: Categoria* (`CATEGORY_OPTIONS`), Tipo (Grátis/Premium), Estado (`STATUS_OPTIONS`); condicional "Agendar para" (`datetime-local`) quando `status==="scheduled"`; Switch "Destacar na home".

**Capa** — dois pills para `cover_type`; grid `md:grid-cols-[300px_1fr]` com preview ao vivo `aspect-[3/4]` via `<EbookCover>`. Modo imagem: dropzone "Carregar imagem" (`image/*`), botão "Escolher da biblioteca" (`FolderOpen`), linha com URL truncada + `X` para limpar, campo "Ou cola URL de imagem". Modo texto: Título da capa, Subtítulo/etiqueta ("ex: Edição Especial"), Cor do texto (`type=color`), Cor de fundo (`type=color`, limpa `cover_gradient` ao mudar), "Ou gradiente CSS" (hint "Sobrepõe a cor de fundo").

**Ficheiros** — aviso "Carrega ou escolhe da biblioteca... Os ficheiros anexados aparecem destacados a dourado."; resumo `X/6` com badges "✓ {label}"; 6 slots `FilePathField` (upload + "Da biblioteca" + trocar/eliminar): PDF Português (`ebooks`, `application/pdf`), PDF Inglês, Áudio Português (`audio`, `audio/*`), Áudio Inglês, Preview PDF (amostra grátis), Preview áudio (30s). Em baixo, dois grupos de pills: **Idiomas disponíveis** (Português/Inglês → `available_languages`) e **Formatos disponíveis** (PDF/Audiobook → `available_formats`).

**Preços & Promo** — secções separadas por `border-t`: 1) Preço normal (`price_usd` step 0.01, `price_mzn` step 1) com nota "apenas para tipo Premium"; 2) Promoção (`sale_price_usd`, `sale_price_mzn`, `sale_starts_at`, `sale_ends_at`); 3) Grátis por tempo limitado ("Torna o ebook grátis até esta data. Depois volta ao preço normal automaticamente." + `free_until`); 4) Lemon Squeezy — checkout: **URL do checkout** (`checkout_url`, com exemplo) e **Variant ID (opcional)** (`lemon_squeezy_variant_id`, hint "Útil para o webhook").

**Metadados** — grid 3: Páginas, ISBN, Ano, Editora, Narrador (audiobook), Duração áudio (segundos). Tags: input + botão `+` (Enter também adiciona), pills douradas removíveis, sem duplicados nem vazios.

**Autor** — Nome, Bio (`rows=4`), URL do avatar; depois grid 2 com Instagram, Twitter/X, LinkedIn, Website (agregados em `author_social_links`).

Auxiliares internos: `Field({label,hint,children})` com `<Label className="text-xs uppercase tracking-wider text-muted-foreground">`; `FileUpload` (dropzone tracejada com `Upload` e input escondido); `FilePathField` (aceita prop `recent` para o anel dourado).

### 9.6 `/admin/midia` e `MediaLibrary`

A página tem três pills de bucket: **Capas (imagens)** (`covers`, `image/*`), **PDFs / Ebooks** (`ebooks`, `application/pdf`), **Áudio / Audiobooks** (`audio`, `audio/*`), renderizando `<MediaLibrary bucket accept />`.

`MediaLibrary` (props `bucket`, `onPick?`, `pickLabel="Usar este ficheiro"`, `accept?`, `embedded?`): `storage.from(bucket).list("", {limit:500, sortBy:{column:"created_at", order:"desc"}})`, ignorando pastas. `isPublic = bucket === "covers"`. **Upload múltiplo**: itera todos os ficheiros escolhidos (`multiple`), nome único por ficheiro, upload sequencial com `upsert:false`, toasts agregados ("N ficheiro(s) carregados" / "N falharam"). Eliminar com `confirm()` + `remove([name])`. Copiar URL pública (ou nome) com ícone `Check` verde durante 1.5 s. Pesquisa client-side. Grid `grid-cols-2 sm:grid-cols-3 md:grid-cols-4`, `max-h-[460px] overflow-y-auto`, thumbnail real para capas e ícones `ImageIcon`/`FileText`/`FileAudio` para os restantes. Vazio: "Sem ficheiros. Carrega um ou mais para começar."

`MediaLibraryDialog`: modal manual `fixed inset-0 z-[60]` com overlay `bg-black/70 backdrop-blur-sm`, cabeçalho "Biblioteca · {bucket}" + `X`, corpo com `<MediaLibrary embedded onPick={...}/>` que fecha ao escolher.

### 9.7 `/admin/utilizadores`

Duas queries paralelas (`profiles` ordenado por `created_at desc`; `user_roles`), merge com `is_admin`. `toggleAdmin`: se admin → `delete().eq("user_id",id).eq("role","admin")` ("Removido admin"); senão → `insert({user_id, role:"admin"})` ("Promovido a admin"). Tabela: Utilizador (nome + id truncado a 12 em mono), Registado (`toLocaleDateString("pt-PT")`), Role (badge dourado "admin" / cinza "user"), Ações (botão outline `Shield`/`ShieldOff`).

### 9.8 `/admin/compras`

Read-only. `purchases.select("*").order("created_at",{ascending:false})`. Colunas: Data, Utilizador (id truncado 8), Ebook (id truncado 8), Valor (`{currency} {amount}`), Estado (badge verde se `completed`). Vazio: "Sem compras ainda. Quando os pagamentos estiverem ativos, aparecem aqui."

### 9.9 `/admin/cupoes`

CRUD em `Dialog max-w-2xl` ("Novo cupão"/"Editar cupão"): **Código*** (uppercase+trim no submit), Descrição, **Tipo** (Percentagem `percent` / Valor fixo USD `fixed`), **Valor*** (number 0.01), **Aplica-se a** (`all`/`ebook`/`category`), **Limite de usos** (placeholder "ilimitado"), **Compra mínima (USD)**, **Switch Ativo**, **Início**/**Expira** (`datetime-local`). Submit converte vazios em `null` e faz insert/update ("Cupão criado"/"Atualizado"). Tabela: Código (com botão copiar → "Copiado"), Desconto (`%`/`$`), Âmbito, Usos (`used/max`), Validade, Ações (toggle "ATIVO"/"OFF" via `update({active:!active})`, `Pencil`, `Trash2`).

### 9.10 `/admin/colecoes`

Dialog `max-w-2xl max-h-[90vh] overflow-y-auto`: Título*, Slug (`slugify` no onChange; se vazio usa `slugify(title)`), Descrição (`rows=3`), Tipo (Curada/Série/Bundle), Preço bundle USD/MZN, URL da capa, Switches Publicado e Destacado. **Só em edição**: seletor de ebook ainda não incluído + botão "Adicionar" (`collection_items.insert({collection_id, ebook_id})`) e lista de itens com remoção (`collection_items.delete().eq("id",id)`). `startEdit` carrega `collection_items.select("id, ebook_id").eq("collection_id", id)`. Listagem em grid `md:grid-cols-2 lg:grid-cols-3` com badge de tipo dourado, slug e preço do bundle.

### 9.11 `/admin/reviews`

`ebook_reviews.select("*").order("created_at",{ascending:false})` + resolução dos títulos via `ebooks.in("id", ids)`. Filtros pill `all` / `pending` (`!approved`) / `hidden`. Ações: `toggleApprove` (`update({approved:!approved})`), `toggleHide` (`update({hidden:!hidden})`), `remove` (`confirm()` + delete). Cada card mostra 5 estrelas (`Star` preenchidas conforme `rating`), título, nome do ebook, corpo, badges "OK"/"PENDING" e "HIDDEN".

### 9.12 `/admin/popups`

Dialog `max-w-2xl max-h-[90vh]`: Nome interno* + Switch Ativo; Título; Mensagem (`rows=3`); CTA texto / CTA link; URL da imagem; **Trigger** (Imediato / Após X segundos / Após X% scroll / Exit intent); **Valor (s ou %)**; **Audiência** (Todos / Visitantes / Logados); **Mostrar nas rotas** (texto separado por vírgulas → array `show_on_paths`); Início/Fim. Listagem em grid `md:grid-cols-2` com badge ATIVO/OFF, corpo `line-clamp-2` e métricas "{views} vistas · {clicks} cliques".

### 9.13 `/admin/home` — editor da homepage

Tipos disponíveis: `hero, featured, category, collection, newsletter, testimonials, stats, custom_html`. Carrega `home_sections.select("*").order("sort_order")`. Adicionar: um pill por tipo → `insert({kind, sort_order: max+1, title: kind, enabled: true})`. Reordenar: `ChevronUp`/`ChevronDown` trocam `sort_order` com a secção vizinha através de dois `update` em `Promise.all` (desativados nos extremos). Título e Subtítulo são inputs **não controlados** que gravam apenas no `onBlur`. Toggle `Eye`/`EyeOff` (`enabled`) e eliminar com `confirm()`. Linhas desativadas ficam com `opacity-60`; badge mono com o `kind`.

### 9.14 `/admin/campanhas`

Dialog "Nova campanha": Nome, Assunto, **Segmento** (Todos / Compradores / Sem compras / Inscritos newsletter), **HTML do email** (`rows=8`), aviso "⚠️ Envio real requer ligação a um provider de email. Por agora guardamos como rascunho.". Validação "Nome e assunto obrigatórios"; `insert` → "Rascunho criado". Tabela: Nome+Assunto, Estado, Segmento, Métricas ("{recipients} env · {opens} ab · {clicks} cli"), eliminar.

### 9.15 `/admin/afiliados`

Helper `slugCode(s)` = lowercase, não-alfanuméricos → `-`, trim de `-`, corte a 24 chars. Dialog `max-w-lg`: Nome* (auto-preenche `code` só se ainda vazio), Email, Código (no URL)* + Comissão (%) (default 20), Notas (`rows=3`), Switch Ativo (default true). Submit valida nome e código; insert/update → "Afiliado criado"/"Atualizado". Cada card mostra nome, badge Ativo/Inativo, badge de comissão dourada, email, link `${window.location.origin}/?ref=${code}` em `<code>` truncado com copiar (→ "Link copiado") e abrir (`ExternalLink`), métricas de cliques/conversões/receita, e editar/eliminar. Vazio: "Ainda sem afiliados. Cria o primeiro para gerar um link único."

### 9.16 `/admin/atividade`

Carga inicial `activity_log.select("*").order("created_at",{ascending:false}).limit(500)`. **Realtime**: canal `"activity"` em INSERT faz prepend otimista `setRows(r => [novo, ...r].slice(0,500))`, com `removeChannel` no cleanup. Filtros: pesquisa em `` `${action} ${actor_email}` `` e `<select>` de `entity_type` únicos. Lista `divide-y`: ação a negrito + tipo, autor (ou "sistema"), `<pre>` com `details` (`line-clamp-2`, mono 10px), timestamp `toLocaleString("pt-PT")`. Vazio: "Sem registos. As ações vão aparecer aqui em tempo real."

### 9.17 `/admin/dados` — export/import

Tabelas exportáveis: `ebooks`, `profiles` (Utilizadores), `purchases` (Compras), `downloads`, `ebook_reviews` (Reviews), `coupons` (Cupões), `activity_log` (Log de atividade). `toCsv(rows)` gera cabeçalho a partir das chaves do primeiro objeto, escapa vírgulas/aspas/quebras entre aspas duplas (duplicando aspas internas) e serializa objetos com `JSON.stringify`. `exportTable(t)`: `select("*")` → Blob `text/csv;charset=utf-8` → `<a download="{tabela}-{YYYY-MM-DD}.csv">` → revoga URL → toast "Exportado: N linhas". `exportAll()`: itera todas as tabelas, agrega `{tabela: rows[]}`, download `booklair-backup-{data}.json`, toast "Backup completo". Layout: card destacado "Backup completo (JSON)" com botão dourado; grid `md:grid-cols-2` com um card por tabela e botão outline "CSV"; card âmbar tracejado "Import em massa (em breve)".

### 9.18 `/admin/settings` — Site & Redes

Linha única `site_settings` com `id = true`; carga `select("*").eq("id", true).maybeSingle()` com merge sobre `EMPTY`; submit sempre `update(s).eq("id", true)` (nunca insert) → "Configurações guardadas". Formulário `max-w-3xl` em 3 blocos `surface-card`: **Identidade** (Nome do site, Email de contacto, Tagline, URL do logo, Texto do rodapé `rows=2`); **Banner promocional global** (Switch `banner_enabled` no cabeçalho, "Aparece no topo do site quando ativo.", Texto do banner, Link); **Redes sociais** ("URLs completos. Deixa em branco para esconder." + Instagram, Facebook, TikTok, YouTube, X (Twitter), LinkedIn, WhatsApp com hint "Número internacional, ex: +258840000000"). Botão "Guardar" dourado no cabeçalho, "A guardar…" durante `saving`.

### 9.19 `/admin/mentor10k` — acessos

`mentor10k_access.select("*").order("created_at",{ascending:false})`. Cabeçalho: "Mentor 10K — Acessos" e "Quem tem acesso ao produto Mentor 10K. Adiciona por email; quando o utilizador faz login com esse email, ganha acesso automático." + botão dourado "Conceder acesso". Dialog: **Email do utilizador*** (obrigatório, "Email obrigatório"), **Origem** (Manual / Lemon Squeezy / Cortesia), **ID do pedido (opcional)**, **Notas** (`rows=3`); insert com email em lowercase e trim → "Acesso concedido". Revogar: `confirm("Revogar acesso?")` + delete. Vazio: ícone `Mail` + "Ainda não foram concedidos acessos. Adiciona o primeiro email."

---

## 10. MENTOR 10K

### 10.1 Layout e controlo de acesso — `src/routes/mentor10k.tsx`

`head`: title "Mentor 10K — Booklair". Estado `hasAccess: boolean|null`. `useEffect([user, loading, navigate])`: sem utilizador (e já carregado) → `navigate({ to:"/auth", search:{ redirect:"/mentor10k" } })`; com utilizador → `supabase.rpc("has_mentor10k_access", { _user_id: user.id })` → `setHasAccess(!!data)`.

Loading (`loading || hasAccess === null`): "A carregar…" centrado.

**Ecrã bloqueado**: `max-w-2xl` centrado, `glass-card rounded-3xl p-10`, ícone `Lock` em `h-16 w-16 rounded-2xl bg-gold/15`, `h1 font-serif text-4xl` "Mentor 10K", texto "Acesso exclusivo. Adquire o programa Mentor 10K para desbloqueares o teu plano personalizado, check-ins semanais e mentoria com IA.", botões "Saber mais" (`gold`, → `/programa-mentor-10k`) e "Ver loja" (`outline`, → `/loja`).

**Com acesso**: container `max-w-6xl`; cabeçalho com eyebrow "Programa exclusivo" (`text-[11px] uppercase tracking-[0.2em] text-gold`), `h1 font-serif text-4xl md:text-5xl gradient-text-gold` "Mentor 10K", subtítulo "O teu caminho personalizado até aos primeiros 10.000€/mês."; barra de tabs `glass-card rounded-2xl p-2 mb-8 overflow-x-auto` com `nav flex gap-1 min-w-max`:

1. Dashboard `/mentor10k` (`Sparkles`, exato) 2. Diagnóstico `/mentor10k/diagnostico` (`Target`) 3. Plano `/mentor10k/plano` (`ClipboardList`) 4. Check-in `/mentor10k/checkin` (`Activity`) 5. Mentor IA `/mentor10k/chat` (`MessageSquare`) 6. Histórico `/mentor10k/historico` (`History`)

Tabs: `flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all`; ativo `bg-gold/15 text-gold shadow-[0_4px_20px_-8px_color-mix(in_oklab,var(--gold)_50%,transparent)]`, inativo `text-muted-foreground hover:text-foreground hover:bg-white/[0.03]`. Termina com `<Outlet/>`.

### 10.2 Dashboard (`/mentor10k`)

`Promise.all` de 5 queries: contagem de `mentor10k_plans`, contagem de `mentor10k_checkins`, último check-in (`progress_score, income_eur`, `created_at desc limit 1`), existência de diagnóstico e de plano. Grid `sm:grid-cols-2 lg:grid-cols-4` com 4 `StatCard` (`glass-card rounded-2xl p-5`, ícone `h-4 w-4 text-gold/70`, valor `font-serif text-3xl`): "Planos ativos", "Check-ins feitos", "Último score" (`{n}/10` ou "—"), "Última receita" (`€{n}` ou "—").
Bloco "Próximos passos" ("Segue a sequência. Sem atalhos.") com 3 links: Diagnóstico inicial, Plano de 12 semanas, Primeiro check-in — badge numerado ou `✓` quando concluído (`bg-gold/20 text-gold`), borda `border-gold/30 bg-gold/[0.04]` quando feito, `ArrowRight` no fim.
Bloco final "Fala com o Mentor IA" / "Tira dúvidas, valida ideias, recebe feedback direto." com botão dourado "Abrir" → `/mentor10k/chat`.

### 10.3 Diagnóstico (`/mentor10k/diagnostico`)

Campos do form: `goal`, `current_situation`, `monthly_income_eur`, `available_hours_week`, `skills`, `resources`, `obstacles`, `deadline_months` (default "3"), `profile_type` (default "solo").
Validação: sem `goal` ou `current_situation` → "Preenche pelo menos o objetivo e a situação atual."
Insert em `mentor10k_diagnostics` com `user_id`, todos os campos (numéricos convertidos, vazios → `null`, `deadline_months` default 3) e `raw_answers` = objeto completo do form. Erro → mensagem ou "Erro ao guardar". Sucesso → toast "Diagnóstico guardado. A gerar o teu plano…" e navega para `/mentor10k/plano` com `search: { generate: data.id }`.
Formulário `glass-card rounded-2xl p-6 md:p-8 space-y-6 max-w-3xl`, cabeçalho com `Target`, título "Diagnóstico inicial", subtítulo "Sê honesto. O plano é tão bom quanto a informação que dás."
- "O teu objetivo (em uma frase) *" — `Textarea rows=2 required`, placeholder "Ex: Chegar a 10.000€/mês com consultoria de marketing em 6 meses."
- "Onde estás agora? *" — `Textarea rows=3 required`, placeholder "O que fazes, há quanto tempo, o que já tentaste…"
- Grid 2: "Receita mensal atual (€)" (`number`, "0") e "Horas disponíveis por semana" (`number`, "20").
- "As tuas skills principais" (`rows=2`, "Ex: copywriting, vídeo, vendas B2B…"), "Recursos de que dispões" ("Audiência, capital, ferramentas, rede de contactos…"), "O que te tem bloqueado?" ("Sê específico.").
- Grid 2: "Prazo (meses)" (3/6/12) e "Perfil" (`solo` Solo / freelancer, `creator` Creator / audiência, `agency` Agência, `ecom` E-commerce, `saas` SaaS / produto digital, `other` Outro).
- Botão `gold size=lg w-full`: "Gerar plano personalizado" / spinner + "A guardar…".

### 10.4 Plano (`/mentor10k/plano`)

`validateSearch` aceita `{ generate?: string }`. Interface `Plan`: `id, title, summary, phases[{name,weeks,objective,deliverables[]}], weekly_tasks[{week,focus,tasks[]}], kpis[], created_at`. `load()` = último plano do utilizador (`created_at desc limit 1 maybeSingle`). Se existir `generate`, chama `generateMentorPlan({ data: { diagnosticId: generate } })` → toast "Plano gerado!" e recarrega; erro → mensagem ou "Erro ao gerar plano".
Loading/generating: `glass-card p-12 text-center` com `Loader2` e texto "O Mentor está a desenhar o teu plano…" ou "A carregar…".
Vazio: "Ainda sem plano" / "Começa pelo diagnóstico — geramos um plano de 12 semanas à tua medida." + botão "Fazer diagnóstico".
Com plano: cartão principal com `Sparkles`, etiqueta "Plano 12 semanas", `h2 font-serif text-3xl` com o título e o `summary`; grid `md:grid-cols-2 lg:grid-cols-4` de fases (semanas, nome, objetivo, entregas com `CheckCircle2`); bloco "Semana a semana" com badge numerado, foco a negrito e tarefas com `• `; bloco "Métricas a acompanhar" com pills `bg-gold/10 text-gold border border-gold/30`; botões "Fazer check-in semanal" (gold) e "Refazer diagnóstico" (outline).

### 10.5 Check-in (`/mentor10k/checkin`)

Ao montar, obtém o último plano; se existir, conta os check-ins desse plano e pré-preenche `week_number = count + 1`. Validação: sem plano → "Cria primeiro um plano."; sem `what_done`/`what_blocked` → "Preenche os campos principais."
Chama `generateCheckinFeedback` com `{planId, week_number, progress_score, income_eur?, what_done, what_blocked, next_focus?, mood}` → mostra `res.checkin.mentor_feedback` e toast "Check-in guardado."
Sem plano: "Sem plano ativo" / "O check-in é semanal — precisas primeiro de um plano." + "Criar plano".
Layout `lg:grid-cols-[1fr_360px]`. Formulário: cabeçalho `Activity` "Check-in semanal" / "Cinco minutos. Direto ao ponto."; grid 3 (Semana `number min=1`, Score (0-10) `number min=0 max=10`, Receita semana (€)); "O que fizeste esta semana? *" (`rows=3 required`, "Ações concretas. Sem genéricos."); "O que te bloqueou? *" (`rows=3 required`); "Próximo foco" (`rows=2`); "Energia" (alta/ok/baixa); botão `gold w-full` "Submeter check-in" / spinner + "Mentor a analisar…". Painel lateral `glass-card p-6 h-fit`: "Feedback do Mentor IA"; sem feedback mostra "Submete o check-in para receberes feedback direto do mentor."

### 10.6 Chat (`/mentor10k/chat`)

Carrega as últimas 50 mensagens de `mentor10k_messages` (`role, content`, `created_at asc`). Auto-scroll com `endRef.scrollIntoView({behavior:"smooth"})` a cada nova mensagem. `send()` acrescenta a mensagem local, limpa o input, chama `askMentor({data:{message}})` e acrescenta a resposta; erro → toast.
Layout `glass-card rounded-2xl flex flex-col h-[70vh]`: cabeçalho com `Sparkles` "Mentor 10K" + "• Gemini"; área `flex-1 overflow-y-auto p-4 space-y-4`; vazio → "Começa por uma pergunta. Sê específico." + «Ex: "Como valido a minha oferta em 7 dias?"»; bolhas do utilizador à direita (`bg-gold/15 border border-gold/20`) e do mentor à esquerda (`bg-white/[0.04] border border-border/40`), `whitespace-pre-wrap`; enquanto envia, bolha só com `Loader2`. Rodapé `p-3 border-t flex gap-2`: `Textarea rows=2` ("Escreve a tua pergunta…") com Enter (sem Shift) a enviar, e botão `gold size=icon` com `Send`.

### 10.7 Histórico (`/mentor10k/historico`)

`mentor10k_checkins.select("*").eq("user_id").order("created_at",{ascending:false})`. Vazio: ícone `History` + "Sem check-ins registados ainda." Com dados: grid `sm:grid-cols-3` com "Total check-ins", "Score médio" (1 casa decimal ou "—") e "Receita acumulada" (`€{soma}`); lista de cards `glass-card rounded-2xl p-5` com badge `S{n}`, "Semana {n}", data, pills de score (`Score n/10`) e receita (`€n`, esmeralda, `TrendingUp`), linhas "Feito: …" e "Bloqueio: …", e bloco `bg-gold/[0.05] border border-gold/20` com etiqueta "Mentor" e o `mentor_feedback`.

### 10.8 Landing `/programa-mentor-10k`

Head: title "Mentor 10K — Programa Booklair"; description "Programa exclusivo de mentoria com IA para chegar aos primeiros 10.000€/mês. Diagnóstico, plano de 12 semanas, check-ins e mentor IA personalizado." + og equivalentes.
Hero `text-center max-w-3xl mx-auto mb-16`: eyebrow "Programa exclusivo Booklair", `h1 font-serif text-5xl md:text-7xl gradient-text-gold` "Mentor 10K", texto "O caminho prático e personalizado até aos teus primeiros **10.000€/mês**. Diagnóstico, plano de 12 semanas e mentor IA — sempre disponível.", CTAs "Adquirir agora" (`hero` → `/loja`) e "Já tenho acesso" (`goldOutline` → `/mentor10k`).
Features `grid md:grid-cols-2 gap-5`: **Diagnóstico inteligente** (`Target`) "Respondes 9 perguntas honestas. A IA constrói o teu retrato real — sem fluff."; **Plano de 12 semanas** (`ClipboardList`) "Fundação → Validação → Tração → Escala. Tarefas semanais concretas, não conceitos vagos."; **Mentor IA 24/7** (`MessageSquare`) "Pergunta, valida ideias, recebe feedback direto baseado no teu plano e histórico."; **Check-ins semanais** (`TrendingUp`) "5 minutos por semana. Feedback do mentor calibrado ao teu progresso real."
Bloco "O que recebes" (`glass-card rounded-3xl p-8 md:p-12`): título "Tudo o que precisas. Nada do que não precisas." e 4 promessas com `CheckCircle2`: plano à medida sem templates genéricos; acesso vitalício ao programa e atualizações; histórico completo de progresso e receita; mentor IA treinado em vendas e marketing direto.
CTA final: "Pronto para começar?" / "O primeiro check-in pode acontecer ainda esta semana." / botão "Quero o Mentor 10K".

### 10.9 Camada IA — `src/lib/mentor10k.server.ts`

System prompt literal:

```
És o Mentor 10K — um mentor de negócios direto, prático e ambicioso que ajuda pessoas a chegar aos primeiros 10.000€/mês de receita.

Princípios:
- Direto, sem encher chouriço. Português europeu natural.
- Foca em ações concretas, mensuráveis, executáveis esta semana.
- Quando o utilizador hesita, desafia com respeito.
- Usa dados do diagnóstico e check-ins anteriores para personalizar.
- Nunca prometes resultados garantidos; foca em sistemas e disciplina.
- Quando geras um plano, divides em fases (Fundação → Validação → Tração → Escala) ao longo de 12 semanas.
- Quando dás feedback de check-in: 1) reconhece o progresso real, 2) aponta o bloqueio principal, 3) prescreve a próxima ação. Máximo 4 frases.
```

Cascata de modelos: `["gemini-3.6-flash", "gemini-2.5-flash", "gemini-flash-latest"]`.

`callMentorAi(userPrompt, jsonOnly = false)`: lê `process.env["GEMINI_API_KEY"]` dentro do handler (sem chave → "O Mentor IA não está configurado. Tenta novamente dentro de instantes."). Body:
```js
{
  systemInstruction: { parts: [{ text: MENTOR_SYSTEM_PROMPT }] },
  contents: [{ role: "user", parts: [{ text: userPrompt }] }],
  generationConfig: jsonOnly
    ? { responseMimeType: "application/json", temperature: 0.7 }
    : { temperature: 0.8 },
}
```
`POST https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent` com headers `Content-Type: application/json` e `x-goog-api-key`. Tratamento: **429** → lança "O Mentor está com muita procura. Tenta novamente dentro de alguns segundos."; **400 com "API key"** → "A chave do Mentor IA é inválida. Contacta o suporte."; **404/5xx ou resposta vazia** → `continue` para o modelo seguinte; todos os erros são registados com `console.error("[Mentor10K Gemini]", model, lastError)`. Sucesso: concatena `candidates[0].content.parts[].text` e devolve com `trim()`. Falha total → "Não foi possível contactar o Mentor IA. Tenta novamente." **Nunca imponhas timeouts artificiais às chamadas de IA.**

`parseMentorJson(text)`: remove code fences (`^```(?:json)?\s*` e `\s*```$`), `trim()`, `JSON.parse` → `{ title, summary, phases, weekly_tasks, kpis }`.

### 10.10 Server functions — `src/lib/mentor10k.functions.ts`

Todas `createServerFn({ method:"POST" }).middleware([requireSupabaseAuth])`, e todas começam por verificar `rpc("has_mentor10k_access", {_user_id: userId})` — se falso, lançam "Sem acesso ao Mentor 10K".

- **`generateMentorPlan`** — input `{ diagnosticId: string }` ("diagnosticId required"). Lê o diagnóstico (`single()`, erro → "Diagnóstico não encontrado"), constrói um prompt com todos os campos e pede JSON com `title, summary, phases` (4 fases: nome, semanas, objetivo, entregas), `weekly_tasks` (12 semanas: week, focus, 3-5 tasks) e `kpis`; `callMentorAi(prompt, true)`; `parseMentorJson` (falha → "O Mentor gerou um plano inválido. Tenta novamente."); insere em `mentor10k_plans` com `duration_weeks: 12`, `status: "active"`, `model: "gemini-3.6-flash"`; devolve `{ plan }`.
- **`generateCheckinFeedback`** — input `{ planId, week_number, progress_score, income_eur?, what_done, what_blocked, next_focus?, mood? }` (falta `planId` ou `what_done` → "Campos obrigatórios em falta"). Lê o plano (`title, weekly_tasks, kpis`), monta prompt pedindo feedback direto em no máximo 4 frases (reconhecer, apontar bloqueio, prescrever ação, desafiar), chama `callMentorAi`, insere o check-in com `mentor_feedback` e devolve `{ checkin }`.
- **`askMentor`** — input `{ message: string }` não vazio ("Mensagem vazia"). Lê as últimas 10 mensagens (invertidas para ordem cronológica) e o plano mais recente (`title, summary`); monta histórico em linhas "Utilizador: …" / "Mentor: …", junta o plano ativo se existir, acrescenta a mensagem e "Responde como Mentor 10K."; chama `callMentorAi`; grava duas linhas em `mentor10k_messages` (`user` e `assistant`); devolve `{ reply }`.

---

## 11. ORDEM DE CONSTRUÇÃO RECOMENDADA

1. Projeto TanStack Start + Tailwind v4 + shadcn; `src/styles.css` com todos os tokens; `__root.tsx` com fontes, providers e Toaster.
2. Supabase: enums, tabelas, GRANTs, RLS, funções, triggers, buckets. Trigger de promoção automática a admin do email do dono.
3. Auth: `src/lib/auth.tsx`, `/auth` com email + Google e `redirect`, middleware em `src/start.ts`.
4. Componentes partilhados: Logo, Header, Footer, EbookCover, EbookCard, Countdown, i18n, ebook-helpers.
5. Páginas públicas: home, loja, biblioteca, detalhe de ebook (sem leitor).
6. Server functions de acesso + leitor protegido + webhook Lemon Squeezy.
7. Painel admin: layout + sidebar, listagem de ebooks, `EbookFormPanel` completo, MediaLibrary.
8. Restantes páginas admin (cupões, coleções, reviews, popups, home, campanhas, afiliados, utilizadores, compras, atividade, dados, settings, mentor10k).
9. Dashboard admin com gráficos + notificações realtime.
10. Mentor 10K: schema, RPC de acesso, layout com tabs, diagnóstico, plano, check-in, chat, histórico, landing pública, camada Gemini.

## 12. CHECKLIST DE ACEITAÇÃO

- [ ] Um utilizador anónimo consegue ler um ebook gratuito no leitor embebido, sem descarregar o ficheiro.
- [ ] Um utilizador sem compra recebe "Sem acesso a este ebook." e nunca vê uma URL assinada.
- [ ] Após compra via Lemon Squeezy, o acesso aparece no Cofre sem intervenção manual, mesmo que a conta seja criada depois (grant por email + `claim_vault_access_for_email`).
- [ ] Pós-login, o utilizador volta ao livro que estava a tentar abrir e o leitor arranca sozinho (`?read=1`).
- [ ] O `EbookForm` sobrevive a uma ida ao seletor de ficheiros sem perder dados (autosave em localStorage).
- [ ] Ebooks agendados mostram contagem decrescente no card, na home e na página de detalhe.
- [ ] A sidebar admin tem exatamente os 6 grupos e 17 links listados.
- [ ] O sino de notificações e a página de atividade atualizam em tempo real.
- [ ] O Mentor 10K bloqueia quem não tem acesso e gera plano, feedback e respostas de chat reais via Gemini.
- [ ] Nenhum papel de administrador é lido de localStorage ou de uma coluna no profile.
