-- Supabase schema and policies for yd1ng blog
-- Run in Supabase SQL editor. Script is idempotent where possible.

-- Enable UUID generation (usually enabled by default)
create extension if not exists "pgcrypto";

-- =========================
-- Categories
-- =========================
create table if not exists public.categories (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  created_at timestamptz not null default now()
);

alter table public.categories enable row level security;

do $$
begin
  if not exists (
    select 1 from pg_policies where schemaname='public' and tablename='categories' and policyname='Allow read categories to everyone'
  ) then
    create policy "Allow read categories to everyone"
      on public.categories for select
      using (true);
  end if;

  if not exists (
    select 1 from pg_policies where schemaname='public' and tablename='categories' and policyname='Allow write categories to authenticated'
  ) then
    create policy "Allow write categories to authenticated"
      on public.categories for all
      to authenticated
      using (true)
      with check (true);
  end if;
end$$;

-- =========================
-- Posts
-- =========================
create table if not exists public.posts (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  content text default '',
  excerpt text,
  category_id uuid references public.categories(id) on delete set null,
  tags text[] not null default '{}',
  featured boolean not null default false,
  published boolean not null default true,
  password text,
  meta_description text default '',
  published_at date,
  slug text unique,
  views bigint not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_posts_created_at on public.posts(created_at desc);
create index if not exists idx_posts_published on public.posts(published);
create index if not exists idx_posts_category on public.posts(category_id);
create index if not exists idx_posts_tags_gin on public.posts using gin (tags);

alter table public.posts enable row level security;

do $$
begin
  -- anyone can read only published posts
  if not exists (
    select 1 from pg_policies where schemaname='public' and tablename='posts' and policyname='Allow read published posts to everyone'
  ) then
    create policy "Allow read published posts to everyone"
      on public.posts for select
      using (published = true);
  end if;

  -- authenticated can read all (admin app 조회)
  if not exists (
    select 1 from pg_policies where schemaname='public' and tablename='posts' and policyname='Allow read posts to authenticated'
  ) then
    create policy "Allow read posts to authenticated"
      on public.posts for select
      to authenticated
      using (true);
  end if;

  -- only authenticated can write
  if not exists (
    select 1 from pg_policies where schemaname='public' and tablename='posts' and policyname='Allow write posts to authenticated'
  ) then
    create policy "Allow write posts to authenticated"
      on public.posts for all
      to authenticated
      using (true)
      with check (true);
  end if;

  -- allow writes from anon (frontend runs without Supabase auth session)
  if not exists (
    select 1 from pg_policies where schemaname='public' and tablename='posts' and policyname='Allow write posts to anon'
  ) then
    create policy "Allow write posts to anon"
      on public.posts for all
      to anon
      using (true)
      with check (true);
  end if;
end$$;

-- trigger to keep updated_at fresh
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end$$;

drop trigger if exists trg_posts_set_updated_at on public.posts;
create trigger trg_posts_set_updated_at
before update on public.posts
for each row execute function public.set_updated_at();

-- RPC: increment_post_views
create or replace function public.increment_post_views(p_post_id uuid)
returns void
language sql
security definer
as $$
  update public.posts
  set views = coalesce(views, 0) + 1
  where id = p_post_id and published = true;
$$;

revoke all on function public.increment_post_views(uuid) from public;
grant execute on function public.increment_post_views(uuid) to anon, authenticated;

-- =========================
-- Projects
-- =========================
create table if not exists public.projects (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text,
  url text,
  tags text[] not null default '{}',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.projects enable row level security;

do $$
begin
  if not exists (
    select 1 from pg_policies where schemaname='public' and tablename='projects' and policyname='Allow read projects to everyone'
  ) then
    create policy "Allow read projects to everyone"
      on public.projects for select
      using (true);
  end if;

  if not exists (
    select 1 from pg_policies where schemaname='public' and tablename='projects' and policyname='Allow write projects to authenticated'
  ) then
    create policy "Allow write projects to authenticated"
      on public.projects for all
      to authenticated
      using (true)
      with check (true);
  end if;
end$$;

drop trigger if exists trg_projects_set_updated_at on public.projects;
create trigger trg_projects_set_updated_at
before update on public.projects
for each row execute function public.set_updated_at();

-- =========================
-- Research
-- =========================
create table if not exists public.research (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  content text,
  link text,
  date date not null,
  created_at timestamptz not null default now()
);

alter table public.research enable row level security;

do $$
begin
  if not exists (
    select 1 from pg_policies where schemaname='public' and tablename='research' and policyname='Allow read research to everyone'
  ) then
    create policy "Allow read research to everyone"
      on public.research for select
      using (true);
  end if;

  if not exists (
    select 1 from pg_policies where schemaname='public' and tablename='research' and policyname='Allow write research to authenticated'
  ) then
    create policy "Allow write research to authenticated"
      on public.research for all
      to authenticated
      using (true)
      with check (true);
  end if;
end$$;

-- =========================
-- About
-- =========================
create table if not exists public.about (
  section text primary key,
  content jsonb not null default '{}'::jsonb
);

alter table public.about enable row level security;

do $$
begin
  if not exists (
    select 1 from pg_policies where schemaname='public' and tablename='about' and policyname='Allow read about to everyone'
  ) then
    create policy "Allow read about to everyone"
      on public.about for select
      using (true);
  end if;

  if not exists (
    select 1 from pg_policies where schemaname='public' and tablename='about' and policyname='Allow write about to authenticated'
  ) then
    create policy "Allow write about to authenticated"
      on public.about for all
      to authenticated
      using (true)
      with check (true);
  end if;
end$$;

-- =========================
-- Comments
-- =========================
create table if not exists public.comments (
  id uuid primary key default gen_random_uuid(),
  post_id uuid not null references public.posts(id) on delete cascade,
  author_name text,
  author_email text,
  content text not null,
  approved boolean not null default false,
  created_at timestamptz not null default now()
);

create index if not exists idx_comments_post on public.comments(post_id);
create index if not exists idx_comments_created_at on public.comments(created_at desc);

alter table public.comments enable row level security;

do $$
begin
  -- Anyone can read approved comments
  if not exists (
    select 1 from pg_policies where schemaname='public' and tablename='comments' and policyname='Allow read approved comments to everyone'
  ) then
    create policy "Allow read approved comments to everyone"
      on public.comments for select
      using (approved = true);
  end if;

  -- Authenticated can read all
  if not exists (
    select 1 from pg_policies where schemaname='public' and tablename='comments' and policyname='Allow read comments to authenticated'
  ) then
    create policy "Allow read comments to authenticated"
      on public.comments for select
      to authenticated
      using (true);
  end if;

  -- Anyone can create (rate limiting은 애플리케이션에서 수행)
  if not exists (
    select 1 from pg_policies where schemaname='public' and tablename='comments' and policyname='Allow insert comments to everyone'
  ) then
    create policy "Allow insert comments to everyone"
      on public.comments for insert
      with check (true);
  end if;

  -- Only authenticated can approve/update
  if not exists (
    select 1 from pg_policies where schemaname='public' and tablename='comments' and policyname='Allow update comments to authenticated'
  ) then
    create policy "Allow update comments to authenticated"
      on public.comments for update
      to authenticated
      using (true)
      with check (true);
  end if;

  -- Only authenticated can delete
  if not exists (
    select 1 from pg_policies where schemaname='public' and tablename='comments' and policyname='Allow delete comments to authenticated'
  ) then
    create policy "Allow delete comments to authenticated"
      on public.comments for delete
      to authenticated
      using (true);
  end if;
end$$;

-- =========================
-- Helpful idempotent column checks
-- =========================
do $$
begin
  if not exists (select 1 from information_schema.columns where table_schema='public' and table_name='posts' and column_name='published_at') then
    alter table public.posts add column published_at date;
  end if;
end$$;

do $$
begin
  if not exists (select 1 from information_schema.columns where table_schema='public' and table_name='posts' and column_name='password') then
    alter table public.posts add column password text;
  end if;
end$$;


