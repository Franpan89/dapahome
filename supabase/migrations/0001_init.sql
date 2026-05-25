-- Dapa Home — esquema inicial
-- Ejecutar en Supabase SQL Editor o vía `supabase db push`.

create extension if not exists "pgcrypto";

-- ============================================================
-- Categorías
-- ============================================================
create table if not exists public.categories (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name text not null,
  description text,
  hero_image_path text,
  parent_id uuid references public.categories(id) on delete set null,
  sort_order int not null default 0,
  created_at timestamptz not null default now()
);

-- ============================================================
-- Productos
-- ============================================================
do $$ begin
  create type product_status as enum ('active', 'draft', 'archived');
exception when duplicate_object then null; end $$;

create table if not exists public.products (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name text not null,
  description text,
  category_id uuid references public.categories(id) on delete set null,
  base_price numeric(12,2) not null default 0,
  currency text not null default 'USD',
  status product_status not null default 'draft',
  featured boolean not null default false,
  search_text text generated always as (lower(coalesce(name,'') || ' ' || coalesce(description,''))) stored,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists products_status_idx on public.products(status);
create index if not exists products_category_idx on public.products(category_id);
create index if not exists products_search_idx on public.products using gin (to_tsvector('spanish', coalesce(name,'') || ' ' || coalesce(description,'')));

-- ============================================================
-- Imágenes
-- ============================================================
create table if not exists public.product_images (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products(id) on delete cascade,
  storage_path text not null,
  alt text,
  sort_order int not null default 0,
  is_primary boolean not null default false,
  created_at timestamptz not null default now()
);
create index if not exists product_images_product_idx on public.product_images(product_id);

-- ============================================================
-- Variantes
-- ============================================================
create table if not exists public.product_variants (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products(id) on delete cascade,
  name text not null,
  options jsonb not null default '{}'::jsonb,
  sku text,
  price_override numeric(12,2),
  stock int,
  sort_order int not null default 0,
  created_at timestamptz not null default now()
);
create index if not exists product_variants_product_idx on public.product_variants(product_id);

-- ============================================================
-- Configuración del sitio (clave/valor)
-- ============================================================
create table if not exists public.site_settings (
  key text primary key,
  value jsonb not null,
  updated_at timestamptz not null default now()
);

insert into public.site_settings(key, value) values
  ('whatsapp', jsonb_build_object('number', '593998001894', 'greeting', '¡Hola Dapa Home! 👋')),
  ('checkout_template', jsonb_build_object(
    'intro', 'Hola Dapa Home 👋, quisiera hacer este pedido:',
    'outro', 'Quedo atento(a) para coordinar el pago y la entrega. ¡Gracias!'
  )),
  ('hero', jsonb_build_object(
    'eyebrow', 'Catálogo 2026',
    'title', 'Diseño para el hogar que se siente personal.',
    'subtitle', 'Iluminación, decoración y domótica curada en Ecuador.'
  ))
on conflict (key) do nothing;

-- ============================================================
-- updated_at automático
-- ============================================================
create or replace function public.touch_updated_at()
returns trigger as $$
begin new.updated_at = now(); return new; end;
$$ language plpgsql;

drop trigger if exists products_touch on public.products;
create trigger products_touch before update on public.products
  for each row execute function public.touch_updated_at();

-- ============================================================
-- Helpers de admin
-- ============================================================
create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select coalesce((auth.jwt() -> 'user_metadata' ->> 'role') = 'admin', false);
$$;

-- ============================================================
-- RLS
-- ============================================================
alter table public.products enable row level security;
alter table public.product_images enable row level security;
alter table public.product_variants enable row level security;
alter table public.categories enable row level security;
alter table public.site_settings enable row level security;

-- Lectura pública: solo activos
drop policy if exists "products read public" on public.products;
create policy "products read public" on public.products for select
  using (status = 'active' or public.is_admin());

drop policy if exists "categories read public" on public.categories;
create policy "categories read public" on public.categories for select using (true);

drop policy if exists "images read public" on public.product_images;
create policy "images read public" on public.product_images for select using (true);

drop policy if exists "variants read public" on public.product_variants;
create policy "variants read public" on public.product_variants for select using (true);

drop policy if exists "settings read public" on public.site_settings;
create policy "settings read public" on public.site_settings for select using (true);

-- Escritura: solo admins
drop policy if exists "products admin write" on public.products;
create policy "products admin write" on public.products
  for all using (public.is_admin()) with check (public.is_admin());

drop policy if exists "categories admin write" on public.categories;
create policy "categories admin write" on public.categories
  for all using (public.is_admin()) with check (public.is_admin());

drop policy if exists "images admin write" on public.product_images;
create policy "images admin write" on public.product_images
  for all using (public.is_admin()) with check (public.is_admin());

drop policy if exists "variants admin write" on public.product_variants;
create policy "variants admin write" on public.product_variants
  for all using (public.is_admin()) with check (public.is_admin());

drop policy if exists "settings admin write" on public.site_settings;
create policy "settings admin write" on public.site_settings
  for all using (public.is_admin()) with check (public.is_admin());

-- ============================================================
-- Storage bucket: products (público lectura)
-- Ejecutar manualmente si Supabase Storage no permite vía SQL:
--   1) Crear bucket 'products' como público en el dashboard
--   2) Política de upload: solo admins
-- ============================================================
insert into storage.buckets (id, name, public)
values ('products', 'products', true)
on conflict (id) do nothing;

drop policy if exists "products bucket read" on storage.objects;
create policy "products bucket read" on storage.objects for select
  using (bucket_id = 'products');

drop policy if exists "products bucket write admin" on storage.objects;
create policy "products bucket write admin" on storage.objects for all
  using (bucket_id = 'products' and public.is_admin())
  with check (bucket_id = 'products' and public.is_admin());
