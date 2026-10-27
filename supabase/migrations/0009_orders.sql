-- Dapa Home — pedidos pagados con PayPhone
-- Ejecutar en Supabase SQL Editor.

create table if not exists public.orders (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  status text not null default 'pending' check (status in ('pending', 'paid', 'failed', 'cancelled')),
  payment_method text not null default 'payphone' check (payment_method in ('payphone', 'whatsapp')),
  client_transaction_id text not null unique,
  payphone_transaction_id bigint,
  authorization_code text,
  customer jsonb not null,
  items jsonb not null,
  delivery_method text not null default 'pickup',
  subtotal numeric(12,2) not null default 0,
  tax numeric(12,2) not null default 0,
  shipping_fee numeric(12,2) not null default 0,
  total numeric(12,2) not null default 0,
  currency text not null default 'USD',
  payphone_response jsonb,
  error_message text
);

create index if not exists orders_status_idx on public.orders(status);
create index if not exists orders_created_idx on public.orders(created_at desc);

alter table public.orders enable row level security;

-- Sin pedido público: se crean y confirman sólo desde rutas de servidor con
-- la service-role key. El admin puede consultarlos autenticado.
drop policy if exists "orders admin read" on public.orders;
create policy "orders admin read" on public.orders
  for select using (public.is_admin());
