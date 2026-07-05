-- Dapa Home — permite que la galería "Nuestras lámparas en el mercado"
-- acepte videos además de fotos.

alter table public.installations
  add column if not exists media_type text not null default 'image'
    check (media_type in ('image', 'video'));
