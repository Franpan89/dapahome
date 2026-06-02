-- ============================================================
-- 0005: Asociar imágenes a variantes
-- Una imagen puede pertenecer a una variante específica (o ninguna,
-- en cuyo caso es una imagen general del producto).
-- ============================================================

alter table public.product_images
  add column if not exists variant_id uuid references public.product_variants(id) on delete set null;

create index if not exists product_images_variant_idx on public.product_images(variant_id);
