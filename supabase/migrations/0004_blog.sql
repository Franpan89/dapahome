-- Dapa Home — Blog / Casos de proyecto

do $$ begin
  create type blog_status as enum ('active', 'draft', 'archived');
exception when duplicate_object then null; end $$;

create table if not exists public.blog_posts (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  title text not null,
  excerpt text,
  cover_image_path text,
  body text not null default '',
  project_location text,
  product_ids uuid[] not null default '{}',
  status blog_status not null default 'draft',
  published_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists blog_posts_status_idx on public.blog_posts(status);
create index if not exists blog_posts_published_idx on public.blog_posts(published_at desc);
create index if not exists blog_posts_slug_idx on public.blog_posts(slug);

-- updated_at automático
drop trigger if exists blog_posts_touch on public.blog_posts;
create trigger blog_posts_touch before update on public.blog_posts
  for each row execute function public.touch_updated_at();

alter table public.blog_posts enable row level security;

-- Lectura pública sólo de posts publicados
drop policy if exists "blog read public" on public.blog_posts;
create policy "blog read public" on public.blog_posts
  for select using (status = 'active' or public.is_admin());

-- Escritura: sólo admin
drop policy if exists "blog admin write" on public.blog_posts;
create policy "blog admin write" on public.blog_posts
  for all using (public.is_admin()) with check (public.is_admin());

-- Storage: reusamos bucket 'products' con prefijo 'blog/<uuid>.<ext>'.
-- Las políticas existentes ya cubren lectura pública y escritura admin.
