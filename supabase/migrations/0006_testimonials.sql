-- Dapa Home — testimonios de clientes
-- Ejecutar en Supabase SQL Editor.

create table if not exists public.testimonials (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  role text,
  body text not null,
  photo_path text,
  rating smallint not null default 5 check (rating between 1 and 5),
  featured boolean not null default false,
  sort_order int not null default 0,
  status text not null default 'active' check (status in ('active', 'draft')),
  created_at timestamptz not null default now()
);

create index if not exists testimonials_sort_idx on public.testimonials(sort_order);
create index if not exists testimonials_status_idx on public.testimonials(status);

alter table public.testimonials enable row level security;

drop policy if exists "testimonials read public" on public.testimonials;
create policy "testimonials read public" on public.testimonials
  for select using (status = 'active');

drop policy if exists "testimonials admin write" on public.testimonials;
create policy "testimonials admin write" on public.testimonials
  for all using (public.is_admin()) with check (public.is_admin());

-- Las fotos se guardan en el bucket 'products' existente bajo el prefijo
-- 'testimonials/<id>/<uuid>.<ext>'. Las políticas del bucket ya cubren
-- lectura pública y escritura sólo admin.
