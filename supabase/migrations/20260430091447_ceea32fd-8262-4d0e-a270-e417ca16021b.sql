
-- ============ ENUMS ============
create type public.app_role as enum ('admin', 'user');
create type public.ebook_type as enum ('free', 'premium');
create type public.ebook_category as enum ('marketing_negocios', 'educacao_estudo', 'desenvolvimento_pessoal');

-- ============ PROFILES ============
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  avatar_url text,
  preferred_language text default 'pt',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
alter table public.profiles enable row level security;

create policy "Profiles are viewable by everyone"
  on public.profiles for select using (true);
create policy "Users can insert their own profile"
  on public.profiles for insert with check (auth.uid() = id);
create policy "Users can update their own profile"
  on public.profiles for update using (auth.uid() = id);

-- ============ USER ROLES ============
create table public.user_roles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  role app_role not null,
  created_at timestamptz not null default now(),
  unique (user_id, role)
);
alter table public.user_roles enable row level security;

create or replace function public.has_role(_user_id uuid, _role app_role)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.user_roles
    where user_id = _user_id and role = _role
  )
$$;

create policy "Users can view their own roles"
  on public.user_roles for select using (auth.uid() = user_id);
create policy "Admins can view all roles"
  on public.user_roles for select using (public.has_role(auth.uid(), 'admin'));
create policy "Admins can manage roles"
  on public.user_roles for all using (public.has_role(auth.uid(), 'admin'));

-- ============ AUTO PROFILE + DEFAULT ROLE ON SIGNUP ============
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, full_name, avatar_url)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'name', split_part(new.email, '@', 1)),
    new.raw_user_meta_data->>'avatar_url'
  );
  insert into public.user_roles (user_id, role) values (new.id, 'user');
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ============ EBOOKS ============
create table public.ebooks (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  slug text not null unique,
  description text,
  author text,
  category ebook_category not null,
  type ebook_type not null default 'free',
  price_usd numeric(10,2) default 0,
  price_mzn numeric(10,2) default 0,
  cover_url text,
  pdf_path text,
  preview_pdf_path text,
  pages int,
  language text default 'pt',
  featured boolean not null default false,
  published boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
alter table public.ebooks enable row level security;

create index idx_ebooks_slug on public.ebooks(slug);
create index idx_ebooks_type on public.ebooks(type);
create index idx_ebooks_category on public.ebooks(category);

create policy "Published ebooks are viewable by everyone"
  on public.ebooks for select using (published = true);
create policy "Admins can view all ebooks"
  on public.ebooks for select using (public.has_role(auth.uid(), 'admin'));
create policy "Admins can manage ebooks"
  on public.ebooks for all using (public.has_role(auth.uid(), 'admin'));

-- ============ PURCHASES ============
create table public.purchases (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  ebook_id uuid not null references public.ebooks(id) on delete restrict,
  stripe_session_id text unique,
  amount_paid numeric(10,2) not null,
  currency text not null default 'USD',
  status text not null default 'pending',
  created_at timestamptz not null default now(),
  unique (user_id, ebook_id)
);
alter table public.purchases enable row level security;

create policy "Users can view their own purchases"
  on public.purchases for select using (auth.uid() = user_id);
create policy "Admins can view all purchases"
  on public.purchases for select using (public.has_role(auth.uid(), 'admin'));

-- ============ DOWNLOADS ============
create table public.downloads (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  ebook_id uuid not null references public.ebooks(id) on delete cascade,
  downloaded_at timestamptz not null default now()
);
alter table public.downloads enable row level security;

create policy "Users can view their own downloads"
  on public.downloads for select using (auth.uid() = user_id);
create policy "Users can insert their own downloads"
  on public.downloads for insert with check (auth.uid() = user_id);
create policy "Admins can view all downloads"
  on public.downloads for select using (public.has_role(auth.uid(), 'admin'));

-- ============ updated_at triggers ============
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin new.updated_at = now(); return new; end; $$;

create trigger trg_profiles_updated before update on public.profiles
  for each row execute function public.set_updated_at();
create trigger trg_ebooks_updated before update on public.ebooks
  for each row execute function public.set_updated_at();

-- ============ STORAGE BUCKETS ============
insert into storage.buckets (id, name, public) values ('covers', 'covers', true)
  on conflict (id) do nothing;
insert into storage.buckets (id, name, public) values ('ebooks', 'ebooks', false)
  on conflict (id) do nothing;

-- Public read for covers, admin write
create policy "Covers are publicly readable"
  on storage.objects for select using (bucket_id = 'covers');
create policy "Admins can upload covers"
  on storage.objects for insert with check (bucket_id = 'covers' and public.has_role(auth.uid(), 'admin'));
create policy "Admins can update covers"
  on storage.objects for update using (bucket_id = 'covers' and public.has_role(auth.uid(), 'admin'));
create policy "Admins can delete covers"
  on storage.objects for delete using (bucket_id = 'covers' and public.has_role(auth.uid(), 'admin'));

-- Ebooks bucket is fully private; access only via signed URLs from server
create policy "Admins can manage ebook files"
  on storage.objects for all using (bucket_id = 'ebooks' and public.has_role(auth.uid(), 'admin'));
