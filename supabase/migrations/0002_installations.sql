-- Dapa Home — galería "Nuestras lámparas en el mercado"
-- Ejecutar en Supabase SQL Editor.

create table if not exists public.installations (
  id uuid primary key default gen_random_uuid(),
  storage_path text not null,
  caption text,
  alt text,
  sort_order int not null default 0,
  created_at timestamptz not null default now()
);

create index if not exists installations_sort_idx on public.installations(sort_order);

alter table public.installations enable row level security;

drop policy if exists "installations read public" on public.installations;
create policy "installations read public" on public.installations
  for select using (true);

drop policy if exists "installations admin write" on public.installations;
create policy "installations admin write" on public.installations
  for all using (public.is_admin()) with check (public.is_admin());

-- Reusamos el bucket 'products' (ya público) para guardar los archivos en
-- el sub-prefijo 'installations/<uuid>.<ext>'. Las políticas existentes
-- del bucket ya permiten lectura pública y escritura sólo admin.
