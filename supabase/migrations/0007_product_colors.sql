-- Dapa Home — colores de producto
-- Un producto puede ofrecerse en varios colores que el cliente elige de forma
-- independiente del tamaño/variante: el color NO afecta precio ni stock, solo
-- se registra para que llegue en el pedido. El tamaño sigue siendo
-- public.product_variants (precio_override + stock).

create table if not exists public.product_colors (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products(id) on delete cascade,
  name text not null,
  hex text,
  sort_order int not null default 0,
  created_at timestamptz not null default now()
);

create index if not exists product_colors_product_idx on public.product_colors(product_id);

alter table public.product_colors enable row level security;

drop policy if exists "product_colors read public" on public.product_colors;
create policy "product_colors read public" on public.product_colors
  for select using (true);

drop policy if exists "product_colors admin write" on public.product_colors;
create policy "product_colors admin write" on public.product_colors
  for all using (public.is_admin()) with check (public.is_admin());
