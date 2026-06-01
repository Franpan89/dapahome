-- Dapa Home — newsletter (suscriptores por email)

create table if not exists public.newsletter_subscribers (
  id uuid primary key default gen_random_uuid(),
  email text not null unique,
  source text,
  created_at timestamptz not null default now()
);

create index if not exists newsletter_email_idx on public.newsletter_subscribers(email);
create index if not exists newsletter_created_idx on public.newsletter_subscribers(created_at desc);

alter table public.newsletter_subscribers enable row level security;

-- Cualquiera puede insertarse (opt-in público desde el footer).
drop policy if exists "newsletter public opt-in" on public.newsletter_subscribers;
create policy "newsletter public opt-in" on public.newsletter_subscribers
  for insert with check (true);

-- Sólo admins leen / borran.
drop policy if exists "newsletter admin read" on public.newsletter_subscribers;
create policy "newsletter admin read" on public.newsletter_subscribers
  for select using (public.is_admin());

drop policy if exists "newsletter admin write" on public.newsletter_subscribers;
create policy "newsletter admin write" on public.newsletter_subscribers
  for delete using (public.is_admin());
