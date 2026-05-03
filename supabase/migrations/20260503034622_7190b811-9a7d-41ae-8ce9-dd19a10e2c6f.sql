
-- COUPONS
create type public.coupon_type as enum ('percent', 'fixed');
create type public.coupon_scope as enum ('all', 'ebook', 'category');

create table public.coupons (
  id uuid primary key default gen_random_uuid(),
  code text not null unique,
  description text,
  discount_type public.coupon_type not null default 'percent',
  discount_value numeric not null,
  scope public.coupon_scope not null default 'all',
  scope_ebook_id uuid,
  scope_category text,
  max_uses integer,
  used_count integer not null default 0,
  min_order_usd numeric,
  starts_at timestamptz,
  expires_at timestamptz,
  active boolean not null default true,
  created_by uuid,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.coupons enable row level security;
create policy "Admins manage coupons" on public.coupons for all using (public.has_role(auth.uid(),'admin')) with check (public.has_role(auth.uid(),'admin'));
create policy "Active coupons readable" on public.coupons for select using (active = true);

create trigger trg_coupons_updated before update on public.coupons for each row execute function public.set_updated_at();

create table public.coupon_redemptions (
  id uuid primary key default gen_random_uuid(),
  coupon_id uuid not null references public.coupons(id) on delete cascade,
  user_id uuid not null,
  ebook_id uuid,
  amount_discounted numeric,
  created_at timestamptz not null default now()
);
alter table public.coupon_redemptions enable row level security;
create policy "Admins view redemptions" on public.coupon_redemptions for select using (public.has_role(auth.uid(),'admin'));
create policy "Users insert own redemptions" on public.coupon_redemptions for insert with check (auth.uid() = user_id);
create policy "Users view own redemptions" on public.coupon_redemptions for select using (auth.uid() = user_id);

-- ACTIVITY LOG
create table public.activity_log (
  id uuid primary key default gen_random_uuid(),
  actor_id uuid,
  actor_email text,
  action text not null,
  entity_type text,
  entity_id uuid,
  details jsonb not null default '{}'::jsonb,
  ip_address text,
  created_at timestamptz not null default now()
);
alter table public.activity_log enable row level security;
create policy "Admins view activity" on public.activity_log for select using (public.has_role(auth.uid(),'admin'));
create policy "Authenticated insert activity" on public.activity_log for insert with check (auth.uid() is not null);
create index idx_activity_log_created on public.activity_log(created_at desc);

-- EBOOK REVIEWS
create table public.ebook_reviews (
  id uuid primary key default gen_random_uuid(),
  ebook_id uuid not null,
  user_id uuid not null,
  rating integer not null check (rating between 1 and 5),
  title text,
  body text,
  approved boolean not null default true,
  hidden boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (ebook_id, user_id)
);
alter table public.ebook_reviews enable row level security;
create policy "Approved reviews public" on public.ebook_reviews for select using (approved = true and hidden = false);
create policy "Users manage own review" on public.ebook_reviews for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "Admins manage all reviews" on public.ebook_reviews for all using (public.has_role(auth.uid(),'admin')) with check (public.has_role(auth.uid(),'admin'));
create trigger trg_reviews_updated before update on public.ebook_reviews for each row execute function public.set_updated_at();

-- EBOOK CHAPTERS
create table public.ebook_chapters (
  id uuid primary key default gen_random_uuid(),
  ebook_id uuid not null,
  sort_order integer not null default 0,
  title text not null,
  description text,
  page_start integer,
  audio_timestamp_seconds integer,
  is_free_preview boolean not null default false,
  created_at timestamptz not null default now()
);
alter table public.ebook_chapters enable row level security;
create policy "Chapters public when ebook published" on public.ebook_chapters for select using (
  exists (select 1 from public.ebooks e where e.id = ebook_chapters.ebook_id and e.published = true)
);
create policy "Admins manage chapters" on public.ebook_chapters for all using (public.has_role(auth.uid(),'admin')) with check (public.has_role(auth.uid(),'admin'));

-- COLLECTIONS / BUNDLES / SERIES
create type public.collection_type as enum ('series', 'bundle', 'curated');

create table public.ebook_collections (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  title text not null,
  description text,
  type public.collection_type not null default 'curated',
  cover_url text,
  bundle_price_usd numeric,
  bundle_price_mzn numeric,
  featured boolean not null default false,
  published boolean not null default false,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
alter table public.ebook_collections enable row level security;
create policy "Published collections public" on public.ebook_collections for select using (published = true);
create policy "Admins manage collections" on public.ebook_collections for all using (public.has_role(auth.uid(),'admin')) with check (public.has_role(auth.uid(),'admin'));
create trigger trg_collections_updated before update on public.ebook_collections for each row execute function public.set_updated_at();

create table public.collection_items (
  id uuid primary key default gen_random_uuid(),
  collection_id uuid not null references public.ebook_collections(id) on delete cascade,
  ebook_id uuid not null,
  sort_order integer not null default 0,
  unique (collection_id, ebook_id)
);
alter table public.collection_items enable row level security;
create policy "Items public when collection published" on public.collection_items for select using (
  exists (select 1 from public.ebook_collections c where c.id = collection_items.collection_id and c.published = true)
);
create policy "Admins manage items" on public.collection_items for all using (public.has_role(auth.uid(),'admin')) with check (public.has_role(auth.uid(),'admin'));

-- POPUPS
create type public.popup_trigger as enum ('immediate','delay','scroll','exit_intent');
create type public.popup_target as enum ('all','guests','authenticated');

create table public.popups (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  enabled boolean not null default false,
  title text,
  body text,
  cta_text text,
  cta_link text,
  image_url text,
  trigger public.popup_trigger not null default 'delay',
  trigger_value integer not null default 5,
  target public.popup_target not null default 'all',
  show_on_paths text[] not null default array[]::text[],
  starts_at timestamptz,
  ends_at timestamptz,
  views_count integer not null default 0,
  clicks_count integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
alter table public.popups enable row level security;
create policy "Enabled popups readable" on public.popups for select using (enabled = true);
create policy "Admins manage popups" on public.popups for all using (public.has_role(auth.uid(),'admin')) with check (public.has_role(auth.uid(),'admin'));
create trigger trg_popups_updated before update on public.popups for each row execute function public.set_updated_at();

-- HOME SECTIONS (drag-and-drop home builder)
create type public.home_section_kind as enum ('hero','featured','category','collection','newsletter','testimonials','custom_html','stats');

create table public.home_sections (
  id uuid primary key default gen_random_uuid(),
  kind public.home_section_kind not null,
  title text,
  subtitle text,
  config jsonb not null default '{}'::jsonb,
  sort_order integer not null default 0,
  enabled boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
alter table public.home_sections enable row level security;
create policy "Enabled sections public" on public.home_sections for select using (enabled = true);
create policy "Admins manage sections" on public.home_sections for all using (public.has_role(auth.uid(),'admin')) with check (public.has_role(auth.uid(),'admin'));
create trigger trg_sections_updated before update on public.home_sections for each row execute function public.set_updated_at();

-- ADMIN NOTIFICATIONS
create table public.notifications (
  id uuid primary key default gen_random_uuid(),
  kind text not null,
  title text not null,
  body text,
  link text,
  read boolean not null default false,
  created_at timestamptz not null default now()
);
alter table public.notifications enable row level security;
create policy "Admins manage notifications" on public.notifications for all using (public.has_role(auth.uid(),'admin')) with check (public.has_role(auth.uid(),'admin'));
create index idx_notifications_created on public.notifications(created_at desc);

-- EMAIL CAMPAIGNS
create type public.campaign_status as enum ('draft','scheduled','sending','sent','failed');

create table public.email_campaigns (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  subject text not null,
  body_html text,
  segment text not null default 'all',
  status public.campaign_status not null default 'draft',
  scheduled_at timestamptz,
  sent_at timestamptz,
  recipients_count integer not null default 0,
  opens_count integer not null default 0,
  clicks_count integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
alter table public.email_campaigns enable row level security;
create policy "Admins manage campaigns" on public.email_campaigns for all using (public.has_role(auth.uid(),'admin')) with check (public.has_role(auth.uid(),'admin'));
create trigger trg_campaigns_updated before update on public.email_campaigns for each row execute function public.set_updated_at();

-- USER BANS
create table public.user_bans (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique,
  reason text,
  banned_until timestamptz,
  banned_by uuid,
  created_at timestamptz not null default now()
);
alter table public.user_bans enable row level security;
create policy "Admins manage bans" on public.user_bans for all using (public.has_role(auth.uid(),'admin')) with check (public.has_role(auth.uid(),'admin'));
create policy "Users see own ban" on public.user_bans for select using (auth.uid() = user_id);
